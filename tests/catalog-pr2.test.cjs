/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require('node:assert/strict')
const test = require('node:test')
const ts = require('typescript')

require.extensions['.ts'] = function loadTypeScript(module, filename) {
  const source = require('node:fs').readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText

  module._compile(output, filename)
}

const { createDestinationBackfillPlan } = require('../src/lib/catalog/backfill.ts')
const { resolveDestinationMatch } = require('../src/lib/catalog/matching.ts')
const {
  applyTemplateFallback,
  parseRelationOptionFilters,
  resolveScopedRelationFilter,
} = require('../src/lib/admin/relation-options.ts')
const {
  normalizePackageRelationsRequest,
  validateResolvedPackageRelations,
} = require('../src/lib/admin/package-relations.ts')
const {
  buildPackageDestinationRelationsPayload,
  buildPackageRelationsPayload,
  findPackageDestinationOption,
  getPackageRelationSelectorSmokeState,
  keepIdsPresentInOptions,
  normalizeSelectedRelationIds,
  normalizePackageDestinationOptions,
  selectedIdsFromPackageRelations,
  toggleSelectedId,
} = require('../src/lib/admin/package-relation-ui.ts')
const {
  buildHotelDestinationCompatibilityFields,
  findHotelDestinationOption,
  getHotelDestinationSelectorState,
  normalizeHotelDestinationOptions,
} = require('../src/lib/admin/hotel-destination-ui.ts')
const {
  buildExcursionDestinationCompatibilityFields,
  findExcursionDestinationOption,
  getExcursionDestinationSelectorState,
  normalizeExcursionDestinationOptions,
} = require('../src/lib/admin/excursion-destination-ui.ts')
const {
  buildTransportDestinationCompatibilityFields,
  findTransportDestinationOption,
  findTransportDestinationOptionByLabel,
  getTransportDestinationSelectorState,
  normalizeTransportDestinationOptions,
} = require('../src/lib/admin/transport-destination-ui.ts')
const {
  resolveSourceFields,
  resolveCatalogPresentation,
} = require('../src/lib/reseller/source-resolver.ts')
const {
  parseJsonArray,
  resolveIsTemplateFallback,
  resolvePackageDestinationIds,
  normalizePackage,
  normalizeHotel,
  normalizeExcursion,
  normalizeTransport,
  extractEntitiesFromJoinRows,
} = require('../src/lib/catalog/public-hydration.ts')
const {
  parseRoomTypeIncludes,
  syncRoomTypesToHotelRooms,
  parseRoomTypeIncludesFromForm,
  formatRoomTypeIncludesForForm,
} = require('../src/lib/admin/hotel-roomtypes.ts')

const destinations = Object.freeze([
  Object.freeze({ id: 'dest-cartagena', slug: 'cartagena', name: 'Cartagena' }),
  Object.freeze({ id: 'dest-medellin', slug: 'medellin', name: 'Medellín' }),
  Object.freeze({ id: 'dest-san-andres', slug: 'san-andres', name: 'San Andrés' }),
])

test('resolveDestinationMatch gives exact slug matches precedence over id/name fallbacks', () => {
  const match = resolveDestinationMatch(
    { slug: 'cartagena', id: 'dest-medellin', name: 'Medellín' },
    destinations,
  )

  assert.deepEqual(match, { matchedId: 'dest-cartagena', strategy: 'slug' })
})

test('resolveDestinationMatch falls back to id when slug is missing', () => {
  const match = resolveDestinationMatch({ id: 'dest-medellin', name: 'Cartagena' }, destinations)

  assert.deepEqual(match, { matchedId: 'dest-medellin', strategy: 'cuid' })
})

test('resolveDestinationMatch falls back to normalized destination name', () => {
  const match = resolveDestinationMatch({ name: 'San Andres' }, destinations)

  assert.deepEqual(match, { matchedId: 'dest-san-andres', strategy: 'name' })
})

test('resolveDestinationMatch reports ambiguous matches and does not guess', () => {
  const match = resolveDestinationMatch(
    { name: 'Cartagena' },
    [
      { id: 'dest-cartagena-1', slug: 'cartagena', name: 'Cartagena' },
      { id: 'dest-cartagena-2', slug: 'cartagena-alt', name: 'Cartagena' },
    ],
  )

  assert.equal(match.strategy, 'ambiguous')
  assert.equal(match.matchedId, undefined)
  assert.equal(match.candidates.length, 2)
})

test('resolveDestinationMatch reports unresolved rows and does not guess', () => {
  const match = resolveDestinationMatch({ slug: 'bogota', id: 'legacy-bogota', name: 'Bogotá' }, destinations)

  assert.equal(match.strategy, 'unresolved')
  assert.equal(match.matchedId, undefined)
  assert.match(match.reason, /No destination matched/)
})

test('createDestinationBackfillPlan is dry-run and idempotent in shape', () => {
  const plan = createDestinationBackfillPlan({
    batchId: 'catalog-pr2-test-batch',
    generatedAt: new Date('2026-05-22T00:00:00.000Z'),
    destinations,
    legacyRefs: [
      { entity: 'hotel', entityId: 'hotel-1', slug: 'cartagena', featured: true, sortOrder: 2 },
      { entity: 'hotel', entityId: 'hotel-1', slug: 'cartagena', featured: true, sortOrder: 2 },
    ],
  })

  assert.equal(plan.dryRun, true)
  assert.equal(plan.batchId, 'catalog-pr2-test-batch')
  assert.deepEqual(
    plan.operations.map((operation) => operation.type),
    [
      'set-hotel-primary-destination',
      'upsert-destination-hotel',
      'set-hotel-primary-destination',
      'upsert-destination-hotel',
    ],
  )
  assert.deepEqual(plan.operations[1].data, plan.operations[3].data)
})

test('createDestinationBackfillPlan adds batchId and rollback traceability to generated operations', () => {
  const plan = createDestinationBackfillPlan({
    batchId: 'catalog-pr2-traceable',
    destinations,
    legacyRefs: [{ entity: 'package', entityId: 'package-1', id: 'dest-medellin' }],
  })

  assert.ok(plan.operations.length > 0)
  assert.equal(plan.operations.every((operation) => operation.batchId === 'catalog-pr2-traceable'), true)
  assert.equal(plan.rollback.strategy, 'delete-by-persisted-batch-report')
  assert.equal(plan.rollback.steps.length, plan.operations.length)
  assert.match(plan.rollback.note, /batchId/)
})

test('createDestinationBackfillPlan does not mutate planner inputs', () => {
  const mutableDestinations = [{ id: 'dest-cartagena', slug: 'cartagena', name: 'Cartagena', isTemplate: true }]
  const mutableLegacyRefs = [{ entity: 'excursion', entityId: 'excursion-1', slug: 'cartagena', active: false }]
  const before = JSON.stringify({ destinations: mutableDestinations, legacyRefs: mutableLegacyRefs })

  createDestinationBackfillPlan({
    batchId: 'catalog-pr2-no-mutation',
    destinations: mutableDestinations,
    legacyRefs: mutableLegacyRefs,
  })

  assert.equal(JSON.stringify({ destinations: mutableDestinations, legacyRefs: mutableLegacyRefs }), before)
})

test('parseRelationOptionFilters defaults to active real selector options with explicit template override', () => {
  const filters = parseRelationOptionFilters(
    new URLSearchParams('destinationSlug=cartagena&search=playa&includeTemplates=true&active=all&role=transfer'),
  )

  assert.deepEqual(filters, {
    search: 'playa',
    active: undefined,
    includeTemplates: true,
    destinationId: undefined,
    destinationSlug: 'cartagena',
    hotelId: undefined,
    role: 'transfer',
  })
})

test('applyTemplateFallback preserves template-only fallback and hides templates when real rows exist', () => {
  assert.deepEqual(
    applyTemplateFallback(
      [
        { id: 'template', isTemplate: true },
        { id: 'real', isTemplate: false },
      ],
      false,
    ).map((item) => item.id),
    ['real'],
  )

  assert.deepEqual(applyTemplateFallback([{ id: 'template', isTemplate: true }], false).map((item) => item.id), [
    'template',
  ])
})

test('resolveScopedRelationFilter applies resolved destination filters without broadening results', () => {
  const filter = resolveScopedRelationFilter({
    scope: 'destination',
    slug: 'cartagena',
    resolvedId: 'dest-cartagena',
  })

  assert.equal(filter.status, 'resolved')
  assert.equal(filter.shouldApply, true)
  assert.equal(filter.resolvedId, 'dest-cartagena')
})

test('resolveScopedRelationFilter returns unresolved metadata instead of removing destination filters', () => {
  const filter = resolveScopedRelationFilter({
    scope: 'destination',
    slug: 'bogota',
    resolvedId: undefined,
  })

  assert.equal(filter.status, 'unresolved')
  assert.equal(filter.shouldApply, false)
  assert.equal(filter.meta.unresolvedFilter.scope, 'destination')
  assert.equal(filter.meta.unresolvedFilter.slug, 'bogota')
  assert.match(filter.meta.unresolvedFilter.reason, /could not be resolved/)
})

test('resolveScopedRelationFilter marks mismatched destination id and slug as invalid', () => {
  const filter = resolveScopedRelationFilter({
    scope: 'destination',
    id: 'dest-medellin',
    slug: 'cartagena',
    resolvedId: 'dest-cartagena',
  })

  assert.equal(filter.status, 'invalid')
  assert.equal(filter.shouldApply, false)
  assert.equal(filter.meta.unresolvedFilter.id, 'dest-medellin')
  assert.equal(filter.meta.unresolvedFilter.slug, 'cartagena')
  assert.match(filter.meta.unresolvedFilter.reason, /does not match/)
})

test('resolveScopedRelationFilter fail-closes unresolved hotel filters for room type options', () => {
  const filter = resolveScopedRelationFilter({
    scope: 'hotel',
    id: 'missing-hotel',
    resolvedId: undefined,
  })

  assert.equal(filter.status, 'unresolved')
  assert.equal(filter.shouldApply, false)
  assert.equal(filter.meta.unresolvedFilter.scope, 'hotel')
  assert.equal(filter.meta.unresolvedFilter.id, 'missing-hotel')
})

test('applyTemplateFallback can use parent hotel template state for room type options', () => {
  const roomTypes = [
    { id: 'room-template', isTemplate: true },
    { id: 'room-real', isTemplate: false },
  ]

  assert.deepEqual(applyTemplateFallback(roomTypes, false).map((roomType) => roomType.id), ['room-real'])
  assert.deepEqual(applyTemplateFallback([{ id: 'room-template', isTemplate: true }], false).map((roomType) => roomType.id), [
    'room-template',
  ])
})

test('normalizePackageRelationsRequest removes duplicate package relation links by relation key', () => {
  const normalized = normalizePackageRelationsRequest({
    destinationIds: ['dest-1', 'dest-1'],
    hotelIds: ['hotel-1'],
    hotels: [{ id: 'hotel-1', role: 'lodging' }, { id: 'hotel-1', role: 'upgrade' }],
    transportServices: ['transport-1', { id: 'transport-1', role: 'transfer' }, { id: 'transport-1', role: 'return' }],
  })

  assert.deepEqual(normalized.destinationIds, ['dest-1'])
  assert.deepEqual(normalized.hotelIds, [
    { id: 'hotel-1', role: 'lodging' },
    { id: 'hotel-1', role: 'upgrade' },
  ])
  assert.deepEqual(normalized.transportServiceIds, [
    { id: 'transport-1', role: 'transfer' },
    { id: 'transport-1', role: 'return' },
  ])
})

test('validateResolvedPackageRelations rejects orphan inactive and template-incompatible package links', () => {
  const requested = normalizePackageRelationsRequest({
    destinationIds: ['dest-1', 'missing-dest'],
    hotelIds: ['hotel-template'],
    roomTypeIds: ['room-outside'],
    excursionIds: ['inactive-excursion'],
    transportServiceIds: ['transport-1'],
  })

  const validation = validateResolvedPackageRelations({
    packageIsTemplate: false,
    allowTemplateRelations: false,
    requested,
    destinations: [{ id: 'dest-1', isTemplate: false, active: true }],
    hotels: [{ id: 'hotel-template', isTemplate: true, active: true }],
    roomTypes: [{ id: 'room-outside', hotelId: 'hotel-other', isTemplate: false, active: true }],
    excursions: [{ id: 'inactive-excursion', isTemplate: false, active: false }],
    transportServices: [{ id: 'transport-1', isTemplate: false, active: true }],
  })

  assert.equal(validation.ok, false)
  assert.equal(validation.status, 400)
  assert.match(validation.errors.destinationIds, /missing-dest/)
  assert.match(validation.errors.hotelIds, /plantilla/)
  assert.match(validation.errors.roomTypeIds, /Room types no pertenecen/)
  assert.match(validation.errors.excursionIds, /inactivas/)
})

test('normalizePackageDestinationOptions keeps only valid selector options', () => {
  const options = normalizePackageDestinationOptions({
    success: true,
    data: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true, isTemplate: false },
      { id: 'broken', label: 'Sin activo' },
      null,
    ],
  })

  assert.deepEqual(options, [{ id: 'dest-cartagena', label: 'Cartagena', active: true, isTemplate: false }])
})

test('package destination UI helpers persist real ids and find display labels', () => {
  const options = [
    { id: 'dest-cartagena', label: 'Cartagena', active: true },
    { id: 'dest-medellin', label: 'Medellín', active: false },
  ]

  assert.equal(findPackageDestinationOption(options, 'dest-medellin').label, 'Medellín')
  assert.deepEqual(buildPackageDestinationRelationsPayload('dest-cartagena'), { destinationIds: ['dest-cartagena'] })
  assert.deepEqual(buildPackageDestinationRelationsPayload(' '), { destinationIds: [] })
})

test('package composition UI helpers build PR3 relation payloads', () => {
  const payload = buildPackageRelationsPayload({
    destinationId: 'dest-cartagena',
    hotelIds: ['hotel-1', 'hotel-1', ' '],
    roomTypeIds: [' room-1 '],
    excursionIds: ['excursion-1'],
    transportServiceIds: ['transport-1'],
  })

  assert.deepEqual(payload, {
    destinationIds: ['dest-cartagena'],
    hotelIds: ['hotel-1'],
    roomTypeIds: ['room-1'],
    excursionIds: ['excursion-1'],
    transportServiceIds: ['transport-1'],
  })
  assert.deepEqual(normalizeSelectedRelationIds([' hotel-1 ', '', 'hotel-1', 'hotel-2']), ['hotel-1', 'hotel-2'])
})

test('package relation selector smoke state exposes loading empty error and ready labels', () => {
  assert.deepEqual(
    getPackageRelationSelectorSmokeState({
      options: [],
      selectedIds: [],
      isLoading: true,
      createCtaHref: '/admin/hoteles',
      createCtaLabel: 'Crear hotel',
    }),
    { status: 'loading', statusLabel: 'Cargando opciones...', hasRetry: false, options: [] },
  )

  const emptyState = getPackageRelationSelectorSmokeState({
    options: [],
    selectedIds: [],
    createCtaHref: '/admin/hoteles',
    createCtaLabel: 'Crear hotel',
  })
  assert.equal(emptyState.status, 'empty')
  assert.deepEqual(emptyState.createCta, { href: '/admin/hoteles', label: 'Crear hotel' })

  const errorState = getPackageRelationSelectorSmokeState({
    options: [],
    selectedIds: [],
    error: 'Error al cargar opciones',
    createCtaHref: '/admin/hoteles',
    createCtaLabel: 'Crear hotel',
  })
  assert.equal(errorState.status, 'error')
  assert.equal(errorState.hasRetry, true)

  const readyState = getPackageRelationSelectorSmokeState({
    options: [
      { id: 'hotel-1', label: 'Hotel real', active: true },
      { id: 'hotel-template', label: 'Hotel plantilla', active: false, isTemplate: true },
    ],
    selectedIds: ['hotel-1', 'hotel-1'],
    createCtaHref: '/admin/hoteles',
    createCtaLabel: 'Crear hotel',
  })
  assert.equal(readyState.status, 'ready')
  assert.equal(readyState.options[0].selected, true)
  assert.equal(readyState.options[1].stateLabel, 'Plantilla Inactivo')
})

test('package relation selector smoke state reports disabled room type prerequisite', () => {
  const disabled = getPackageRelationSelectorSmokeState({
    options: [],
    selectedIds: [],
    disabledMessage: 'Selecciona primero un hotel para cargar sus habitaciones.',
    createCtaHref: '/admin/habitaciones',
    createCtaLabel: 'Crear habitación',
  })

  assert.equal(disabled.status, 'disabled')
  assert.match(disabled.statusLabel, /Selecciona primero un hotel/)
  assert.equal(disabled.hasRetry, false)
})

test('package composition UI helpers hydrate and reconcile selected relation ids', () => {
  const relations = {
    hotels: [{ hotel: { id: 'hotel-1' } }],
    roomTypes: [{ roomTypeId: 'room-1' }, { roomType: { id: 'room-2' } }],
  }

  assert.deepEqual(selectedIdsFromPackageRelations(relations, 'hotels', 'hotel'), ['hotel-1'])
  assert.deepEqual(selectedIdsFromPackageRelations(relations, 'roomTypes', 'roomType'), ['room-1', 'room-2'])
  assert.deepEqual(toggleSelectedId(['hotel-1'], 'hotel-2'), ['hotel-1', 'hotel-2'])
  assert.deepEqual(toggleSelectedId(['hotel-1', 'hotel-2'], 'hotel-1'), ['hotel-2'])
  assert.deepEqual(keepIdsPresentInOptions(['hotel-1', 'missing'], [{ id: 'hotel-1', label: 'Hotel', active: true }]), ['hotel-1'])
})

test('hotel destination selector normalizes loading empty error and ready states', () => {
  assert.deepEqual(
    getHotelDestinationSelectorState({
      options: [],
      selectedId: '',
      isLoading: true,
      createCtaHref: '/admin/destinos',
      createCtaLabel: 'Crear destino',
    }),
    { status: 'loading', statusLabel: 'Cargando destinos...', hasRetry: false, options: [] },
  )

  const emptyState = getHotelDestinationSelectorState({
    options: [],
    selectedId: '',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(emptyState.status, 'empty')
  assert.deepEqual(emptyState.createCta, { href: '/admin/destinos', label: 'Crear destino' })

  const errorState = getHotelDestinationSelectorState({
    options: [],
    selectedId: '',
    error: 'Error al cargar destinos',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(errorState.status, 'error')
  assert.equal(errorState.hasRetry, true)

  const readyState = getHotelDestinationSelectorState({
    options: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true },
      { id: 'dest-template', label: 'Plantilla', active: false, isTemplate: true },
    ],
    selectedId: 'dest-cartagena',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(readyState.status, 'ready')
  assert.equal(readyState.options[0].selected, true)
  assert.equal(readyState.options[1].stateLabel, 'Plantilla Inactivo')
})

test('hotel destination selector maps selected destination to real relation and compatibility fields', () => {
  const options = normalizeHotelDestinationOptions({
    success: true,
    data: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' },
      { id: 'broken', label: 'Sin activo' },
    ],
  })

  const selected = findHotelDestinationOption(options, 'dest-cartagena')

  assert.deepEqual(options, [{ id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' }])
  assert.deepEqual(buildHotelDestinationCompatibilityFields(selected), {
    destinationId: 'dest-cartagena',
    cityId: 'dest-cartagena',
    cityName: 'Cartagena',
  })
  assert.deepEqual(buildHotelDestinationCompatibilityFields(undefined), { destinationId: '', cityId: '', cityName: '' })
})

test('excursion destination selector normalizes loading empty error and ready states', () => {
  assert.deepEqual(
    getExcursionDestinationSelectorState({
      options: [],
      selectedId: '',
      isLoading: true,
      createCtaHref: '/admin/destinos',
      createCtaLabel: 'Crear destino',
    }),
    { status: 'loading', statusLabel: 'Cargando destinos...', hasRetry: false, options: [] },
  )

  const emptyState = getExcursionDestinationSelectorState({
    options: [],
    selectedId: '',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(emptyState.status, 'empty')
  assert.deepEqual(emptyState.createCta, { href: '/admin/destinos', label: 'Crear destino' })

  const errorState = getExcursionDestinationSelectorState({
    options: [],
    selectedId: '',
    error: 'Error al cargar destinos',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(errorState.status, 'error')
  assert.equal(errorState.hasRetry, true)

  const readyState = getExcursionDestinationSelectorState({
    options: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true },
      { id: 'dest-template', label: 'Plantilla', active: false, isTemplate: true },
    ],
    selectedId: 'dest-cartagena',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(readyState.status, 'ready')
  assert.equal(readyState.options[0].selected, true)
  assert.equal(readyState.options[1].stateLabel, 'Plantilla Inactivo')
})

test('excursion destination selector maps selected destination to compatibility fields', () => {
  const options = normalizeExcursionDestinationOptions({
    success: true,
    data: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' },
      { id: 'broken', label: 'Sin activo' },
    ],
  })

  const selected = findExcursionDestinationOption(options, 'dest-cartagena')

  assert.deepEqual(options, [{ id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' }])
  assert.deepEqual(buildExcursionDestinationCompatibilityFields(selected), {
    destinationId: 'dest-cartagena',
    destinationName: 'Cartagena',
    cityName: 'Cartagena',
  })
  assert.deepEqual(buildExcursionDestinationCompatibilityFields(undefined), {
    destinationId: '',
    destinationName: '',
    cityName: '',
  })
})

test('transport destination selector normalizes loading empty error and ready states', () => {
  assert.deepEqual(
    getTransportDestinationSelectorState({
      options: [],
      selectedId: '',
      isLoading: true,
      createCtaHref: '/admin/destinos',
      createCtaLabel: 'Crear destino',
    }),
    { status: 'loading', statusLabel: 'Cargando destinos...', hasRetry: false, options: [] },
  )

  const emptyState = getTransportDestinationSelectorState({
    options: [],
    selectedId: '',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(emptyState.status, 'empty')
  assert.deepEqual(emptyState.createCta, { href: '/admin/destinos', label: 'Crear destino' })

  const errorState = getTransportDestinationSelectorState({
    options: [],
    selectedId: '',
    error: 'Error al cargar destinos',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(errorState.status, 'error')
  assert.equal(errorState.hasRetry, true)

  const readyState = getTransportDestinationSelectorState({
    options: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true },
      { id: 'dest-template', label: 'Plantilla', active: false, isTemplate: true },
    ],
    selectedId: 'dest-cartagena',
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  })
  assert.equal(readyState.status, 'ready')
  assert.equal(readyState.options[0].selected, true)
  assert.equal(readyState.options[1].stateLabel, 'Plantilla Inactivo')
})

test('transport destination selector maps origin destination selections to compatibility fields', () => {
  const options = normalizeTransportDestinationOptions({
    success: true,
    data: [
      { id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' },
      { id: 'dest-medellin', label: 'Medellín', active: true, slug: 'medellin' },
      { id: 'broken', label: 'Sin activo' },
    ],
  })

  const origin = findTransportDestinationOptionByLabel(options, 'cartagena')
  const destination = findTransportDestinationOption(options, 'dest-medellin')

  assert.deepEqual(options, [
    { id: 'dest-cartagena', label: 'Cartagena', active: true, slug: 'cartagena' },
    { id: 'dest-medellin', label: 'Medellín', active: true, slug: 'medellin' },
  ])
  assert.deepEqual(buildTransportDestinationCompatibilityFields({ origin, destination }), {
    originDestinationId: 'dest-cartagena',
    destinationDestinationId: 'dest-medellin',
    origin: 'Cartagena',
    destination: 'Medellín',
    cityId: 'dest-medellin',
    cityName: 'Medellín',
  })
  assert.deepEqual(buildTransportDestinationCompatibilityFields({}), {
    originDestinationId: '',
    destinationDestinationId: '',
    origin: '',
    destination: '',
    cityId: '',
    cityName: '',
  })
})

// ---------------------------------------------------------------------------
// PR5 — Reseller typed source resolution
// ---------------------------------------------------------------------------

test('resolveSourceFields normalises hotel source-data fields', () => {
  const hotelData = {
    id: 'hotel-1',
    name: 'Hotel Cartagena',
    cityName: 'Cartagena',
    stars: 5,
    priceFrom: 250000,
    images: JSON.stringify(['/img/h1.jpg', '/img/h2.jpg']),
    description: 'Un gran hotel',
    active: true,
    isTemplate: false,
  }

  const resolved = resolveSourceFields('hotel', hotelData)

  assert.equal(resolved.title, 'Hotel Cartagena')
  assert.equal(resolved.image, '/img/h1.jpg')
  assert.equal(resolved.price, 250000)
  assert.equal(resolved.location, 'Cartagena')
  assert.equal(resolved.description, 'Un gran hotel')
  assert.equal(resolved.active, true)
  assert.equal(resolved.isTemplate, false)
  assert.equal(resolved.sourceType, 'hotel')
  assert.equal(resolved.sourceId, 'hotel-1')
  assert.equal(resolved.metadata.stars, 5)
})

test('resolveSourceFields normalises excursion source-data fields', () => {
  const excursionData = {
    id: 'exc-1',
    name: 'Tour Islas',
    cityName: 'San Andrés',
    basePrice: 180000,
    images: JSON.stringify(['/img/e1.jpg']),
    description: 'Recorrido por las islas',
    category: 'Acuática',
    active: true,
    isTemplate: false,
  }

  const resolved = resolveSourceFields('excursion', excursionData)

  assert.equal(resolved.title, 'Tour Islas')
  assert.equal(resolved.image, '/img/e1.jpg')
  assert.equal(resolved.price, 180000)
  assert.equal(resolved.location, 'San Andrés')
  assert.equal(resolved.metadata.category, 'Acuática')
})

test('resolveSourceFields normalises package (title field) source-data', () => {
  const pkgData = {
    id: 'pkg-1',
    title: 'Paquete Romántico',
    destinationName: 'Cartagena',
    price: 1200000,
    image: '/img/pkg.jpg',
    description: 'Escapada romántica',
    category: 'Romance',
    active: true,
    isTemplate: false,
  }

  const resolved = resolveSourceFields('package', pkgData)

  assert.equal(resolved.title, 'Paquete Romántico')
  assert.equal(resolved.image, '/img/pkg.jpg')
  assert.equal(resolved.price, 1200000)
  assert.equal(resolved.location, 'Cartagena')
  assert.equal(resolved.metadata.category, 'Romance')
})

test('resolveSourceFields normalises transport source-data including route', () => {
  const transportData = {
    id: 'tr-1',
    name: 'Traslado Aeropuerto',
    origin: 'Aeropuerto',
    destination: 'Hotel Zona Norte',
    basePrice: 80000,
    notes: 'Traslado privado',
    active: true,
    isTemplate: false,
    providerId: 'prov-1',
    provider: { name: 'Transportes Rápidos', vehicleType: 'Van', capacity: 12 },
  }

  const resolved = resolveSourceFields('transport', transportData)

  assert.equal(resolved.title, 'Traslado Aeropuerto')
  assert.equal(resolved.price, 80000)
  assert.equal(resolved.location, 'Aeropuerto → Hotel Zona Norte')
  assert.equal(resolved.description, 'Traslado privado')
  assert.ok(resolved.metadata.provider)
})

test('resolveSourceFields normalises destination source-data', () => {
  const destData = {
    id: 'dest-1',
    name: 'Medellín',
    region: 'Antioquia',
    description: 'Ciudad de la eterna primavera',
    image: '/img/med.jpg',
    priceFrom: 0,
    active: true,
    isTemplate: false,
  }

  const resolved = resolveSourceFields('destination', destData)

  assert.equal(resolved.title, 'Medellín')
  assert.equal(resolved.location, 'Antioquia')
  assert.equal(resolved.image, '/img/med.jpg')
  assert.equal(resolved.price, 0)
})

test('resolveSourceFields returns empty-safe contract for empty/missing source-data', () => {
  const empty = resolveSourceFields('hotel', {})

  assert.equal(empty.title, '')
  assert.equal(empty.price, 0)
  assert.equal(empty.active, false)
  assert.equal(empty.isTemplate, false)

  const unknown = resolveSourceFields('unknown-type', { id: 'x', name: 'X' })

  assert.equal(unknown.title, '')
  assert.equal(unknown.sourceType, 'unknown-type')
})

test('resolveSourceFields handles images as parsed array or raw string', () => {
  // Already-parsed array
  assert.equal(resolveSourceFields('excursion', {
    id: 'e2', name: 'X', images: ['/a.jpg', '/b.jpg'], active: true, isTemplate: false,
  }).image, '/a.jpg')

  // JSON string
  assert.equal(resolveSourceFields('hotel', {
    id: 'h2', name: 'H', images: '["/h.jpg"]', active: true, isTemplate: false,
  }).image, '/h.jpg')

  // Plain string
  assert.equal(resolveSourceFields('package', {
    id: 'p2', title: 'P', image: '/p.jpg', active: true, isTemplate: false,
  }).image, '/p.jpg')

  // Missing
  assert.equal(resolveSourceFields('transport', {
    id: 't2', name: 'T', active: true, isTemplate: false,
  }).image, '')
})

test('resolveCatalogPresentation merges custom overrides with resolved source', () => {
  const item = {
    id: 'cat-1',
    sourceType: 'hotel',
    sourceId: 'hotel-1',
    customPrice: 300000,
    customName: 'Mi Hotel Especial',
    customDescription: 'Descripción personalizada',
    active: true,
    featured: true,
    sourceData: {
      id: 'hotel-1',
      name: 'Hotel Cartagena',
      cityName: 'Cartagena',
      stars: 5,
      priceFrom: 250000,
      images: JSON.stringify(['/img/h1.jpg']),
      description: 'Un gran hotel',
      active: true,
      isTemplate: false,
    },
  }

  const pres = resolveCatalogPresentation(item)

  assert.equal(pres.title, 'Mi Hotel Especial')
  assert.equal(pres.price, 300000)
  assert.equal(pres.originalPrice, 250000)
  assert.equal(pres.hasCustomPrice, true)
  assert.equal(pres.hasCustomName, true)
  assert.equal(pres.location, 'Cartagena')
  assert.equal(pres.image, '/img/h1.jpg')
  assert.equal(pres.active, true)
  assert.equal(pres.featured, true)
  assert.equal(pres.itemId, 'cat-1')
  assert.equal(pres.sourceType, 'hotel')
  assert.equal(pres.sourceId, 'hotel-1')
})

test('resolveCatalogPresentation falls back to source fields when overrides are absent', () => {
  const item = {
    id: 'cat-2',
    sourceType: 'package',
    sourceId: 'pkg-1',
    customPrice: null,
    customName: '',
    customDescription: '',
    active: true,
    featured: false,
    sourceData: {
      id: 'pkg-1',
      title: 'Paquete Aventura',
      destinationName: 'San Andrés',
      price: 800000,
      image: '/img/adv.jpg',
      description: 'Aventura total',
      active: true,
      isTemplate: false,
    },
  }

  const pres = resolveCatalogPresentation(item)

  assert.equal(pres.title, 'Paquete Aventura')
  assert.equal(pres.price, 800000)
  assert.equal(pres.originalPrice, 800000)
  assert.equal(pres.hasCustomPrice, false)
  assert.equal(pres.hasCustomName, false)
  assert.equal(pres.location, 'San Andrés')
  assert.equal(pres.description, 'Aventura total')
})

test('resolveSourceFields handles room-type with nested hotel location', () => {
  const roomData = {
    id: 'room-1',
    name: 'Suite Presidencial',
    basePrice: 500000,
    maxGuests: 2,
    beds: '1 King',
    active: true,
    hotelId: 'hotel-1',
    hotel: { name: 'Hotel Cartagena', cityName: 'Cartagena' },
  }

  const resolved = resolveSourceFields('room', roomData)

  assert.equal(resolved.title, 'Suite Presidencial')
  assert.equal(resolved.price, 500000)
  assert.equal(resolved.location, 'Cartagena')
  assert.equal(resolved.metadata.hotelId, 'hotel-1')
  assert.equal(resolved.metadata.maxGuests, 2)
})

// ─── PR6: Public hydration pure helpers ─────────────────────────────

test('parseJsonArray returns parsed array from valid JSON string', () => {
  const result = parseJsonArray('["wifi","pool","spa"]')
  assert.deepEqual(result, ['wifi', 'pool', 'spa'])
})

test('parseJsonArray returns empty array for null input', () => {
  const result = parseJsonArray(null)
  assert.deepEqual(result, [])
})

test('parseJsonArray returns empty array for undefined input', () => {
  const result = parseJsonArray(undefined)
  assert.deepEqual(result, [])
})

test('parseJsonArray returns empty array for malformed JSON', () => {
  const result = parseJsonArray('not-json')
  assert.deepEqual(result, [])
})

test('parseJsonArray returns empty array for non-array JSON', () => {
  const result = parseJsonArray('{"key":"value"}')
  assert.deepEqual(result, [])
})

test('parseJsonArray returns empty array for empty string', () => {
  const result = parseJsonArray('')
  assert.deepEqual(result, [])
})

test('resolveIsTemplateFallback returns true when no real active rows exist', () => {
  assert.equal(resolveIsTemplateFallback(0), true)
})

test('resolveIsTemplateFallback returns false when real active rows exist', () => {
  assert.equal(resolveIsTemplateFallback(5), false)
  assert.equal(resolveIsTemplateFallback(1), false)
})

test('normalizePackage parses includes and departureDates JSON arrays', () => {
  const raw = {
    id: 'pkg-1',
    slug: 'aventura-cartagena',
    title: 'Aventura Cartagena',
    description: 'Un gran paquete',
    image: '/img/pkg.jpg',
    price: 1200000,
    originalPrice: 1500000,
    category: 'Aventura',
    rating: 4.5,
    includes: '["transporte","guía"]',
    departureDates: '["2026-06-01","2026-07-15"]',
    active: true,
    isTemplate: false,
  }

  const result = normalizePackage(raw)

  assert.equal(result.id, 'pkg-1')
  assert.equal(result.slug, 'aventura-cartagena')
  assert.equal(result.price, 1200000)
  assert.equal(result.originalPrice, 1500000)
  assert.deepEqual(result.includes, ['transporte', 'guía'])
  assert.deepEqual(result.departureDates, ['2026-06-01', '2026-07-15'])
  assert.equal(result.active, true)
  assert.equal(result.isTemplate, false)
})

test('normalizePackage handles missing optional fields with safe defaults', () => {
  const raw = { id: 'minimal' }
  const result = normalizePackage(raw)

  assert.equal(result.id, 'minimal')
  assert.equal(result.slug, '')
  assert.equal(result.price, 0)
  assert.equal(result.originalPrice, null)
  assert.deepEqual(result.includes, [])
  assert.deepEqual(result.departureDates, [])
  assert.equal(result.active, true)
  assert.equal(result.isTemplate, true)
})

test('normalizeHotel parses images JSON array', () => {
  const raw = {
    id: 'hotel-1',
    slug: 'hotel-cartagena',
    name: 'Hotel Cartagena',
    cityId: 'cartagena',
    cityName: 'Cartagena',
    stars: 5,
    rating: 4.8,
    reviewCount: 200,
    priceFrom: 350000,
    images: '["/img/h1.jpg","/img/h2.jpg"]',
    featured: true,
    active: true,
    isTemplate: false,
  }

  const result = normalizeHotel(raw)

  assert.equal(result.id, 'hotel-1')
  assert.equal(result.name, 'Hotel Cartagena')
  assert.equal(result.stars, 5)
  assert.equal(result.rating, 4.8)
  assert.deepEqual(result.images, ['/img/h1.jpg', '/img/h2.jpg'])
  assert.equal(result.featured, true)
})

test('normalizeHotel handles missing fields with safe defaults', () => {
  const raw = { id: 'minimal-hotel' }
  const result = normalizeHotel(raw)

  assert.equal(result.id, 'minimal-hotel')
  assert.equal(result.name, '')
  assert.equal(result.stars, 3)
  assert.equal(result.rating, 0)
  assert.deepEqual(result.images, [])
  assert.equal(result.isTemplate, true)
})

test('normalizeExcursion parses images array and preserves display fields', () => {
  const raw = {
    id: 'exc-1',
    slug: 'buceo-san-andres',
    name: 'Buceo San Andrés',
    destinationId: 'dest-san-andres',
    destinationName: 'San Andrés',
    cityName: 'San Andrés',
    description: 'Excursión de buceo',
    images: '["/img/exc1.jpg"]',
    duration: '4 horas',
    difficulty: 'Moderado',
    basePrice: 180000,
    childPrice: 90000,
    category: 'Acuática',
    rating: 4.7,
    featured: true,
    active: true,
    isTemplate: false,
  }

  const result = normalizeExcursion(raw)

  assert.equal(result.id, 'exc-1')
  assert.equal(result.name, 'Buceo San Andrés')
  assert.equal(result.destinationName, 'San Andrés')
  assert.deepEqual(result.images, ['/img/exc1.jpg'])
  assert.equal(result.basePrice, 180000)
  assert.equal(result.childPrice, 90000)
  assert.equal(result.difficulty, 'Moderado')
  assert.equal(result.featured, true)
})

test('normalizeExcursion handles missing optional fields with safe defaults', () => {
  const raw = { id: 'minimal-exc' }
  const result = normalizeExcursion(raw)

  assert.equal(result.id, 'minimal-exc')
  assert.equal(result.name, '')
  assert.equal(result.basePrice, 0)
  assert.equal(result.childPrice, 0)
  assert.deepEqual(result.images, [])
  assert.equal(result.isTemplate, true)
})

test('extractEntitiesFromJoinRows filters by active and isTemplate and sorts by sortOrder', () => {
  const rows = [
    { sortOrder: 2, package: { id: 'c', active: true, isTemplate: false } },
    { sortOrder: 1, package: { id: 'a', active: true, isTemplate: false } },
    { sortOrder: 3, package: { id: 'b', active: true, isTemplate: false } },
  ]

  const result = extractEntitiesFromJoinRows(rows, 'package', false)

  assert.equal(result.length, 3)
  assert.equal(result[0].id, 'a')
  assert.equal(result[1].id, 'c')
  assert.equal(result[2].id, 'b')
})

test('extractEntitiesFromJoinRows excludes inactive entities', () => {
  const rows = [
    { sortOrder: 1, package: { id: 'a', active: true, isTemplate: false } },
    { sortOrder: 2, package: { id: 'b', active: false, isTemplate: false } },
  ]

  const result = extractEntitiesFromJoinRows(rows, 'package', false)
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'a')
})

test('extractEntitiesFromJoinRows respects isTemplate fallback when showing templates only', () => {
  const rows = [
    { sortOrder: 1, package: { id: 'a', active: true, isTemplate: true } },
    { sortOrder: 2, package: { id: 'b', active: true, isTemplate: false } },
  ]

  // With isTemplateFallback=true → only template entities
  const templatesOnly = extractEntitiesFromJoinRows(rows, 'package', true)
  assert.equal(templatesOnly.length, 1)
  assert.equal(templatesOnly[0].id, 'a')

  // With isTemplateFallback=false → only non-template entities
  const realOnly = extractEntitiesFromJoinRows(rows, 'package', false)
  assert.equal(realOnly.length, 1)
  assert.equal(realOnly[0].id, 'b')
})

test('extractEntitiesFromJoinRows returns empty array for empty input', () => {
  const result = extractEntitiesFromJoinRows([], 'package', false)
  assert.deepEqual(result, [])
})

test('extractEntitiesFromJoinRows skips rows where entity key is missing', () => {
  const rows = [
    { sortOrder: 1, package: null },
    { sortOrder: 2, package: { id: 'a', active: true, isTemplate: false } },
  ]

  const result = extractEntitiesFromJoinRows(rows, 'package', false)
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'a')
})

test('normalizeTransport parses includes JSON array and preserves display fields', () => {
  const raw = {
    id: 'ts-1',
    name: 'Transfer Aeropuerto',
    routeType: 'Terrestre',
    origin: 'Aeropuerto',
    destination: 'Hotel Zona Norte',
    cityId: 'cartagena',
    cityName: 'Cartagena',
    durationMins: 45,
    basePrice: 85000,
    pricePerExtra: 15000,
    includes: '["Traslado puerta a puerta","Agua"]',
    notes: 'Disponible 24h',
    active: true,
    isTemplate: false,
    providerId: 'provider-1',
    provider: {
      id: 'prov-123',
      name: 'Transportes Cartagena S.A.S.',
      vehicleType: 'van',
      capacity: 8
    }
  }

  const result = normalizeTransport(raw)

  assert.equal(result.id, 'ts-1')
  assert.equal(result.name, 'Transfer Aeropuerto')
  assert.equal(result.routeType, 'Terrestre')
  assert.equal(result.basePrice, 85000)
  assert.equal(result.pricePerExtra, 15000)
  assert.equal(result.durationMins, 45)
  assert.deepEqual(result.includes, ['Traslado puerta a puerta', 'Agua'])
  assert.equal(result.active, true)
  assert.equal(result.isTemplate, false)
  assert.deepEqual(result.provider, {
    id: 'prov-123',
    name: 'Transportes Cartagena S.A.S.',
    vehicleType: 'van',
    capacity: 8
  })
})

test('normalizeTransport handles missing optional fields with safe defaults', () => {
  const raw = { id: 'minimal-ts' }
  const result = normalizeTransport(raw)

  assert.equal(result.id, 'minimal-ts')
  assert.equal(result.name, '')
  assert.equal(result.routeType, '')
  assert.equal(result.basePrice, 0)
  assert.equal(result.pricePerExtra, 0)
  assert.equal(result.durationMins, 0)
  assert.deepEqual(result.includes, [])
  assert.equal(result.isTemplate, true)
  assert.deepEqual(result.provider, {
    id: '',
    name: 'Proveedor no especificado',
    vehicleType: 'auto',
    capacity: 4
  })
})

// ── resolvePackageDestinationIds ─────────────────────────────────────

test('resolvePackageDestinationIds groups destination IDs per package from join rows', () => {
  const rows = [
    { packageId: 'pkg-1', destinationId: 'dest-a', active: true },
    { packageId: 'pkg-1', destinationId: 'dest-b', active: true },
    { packageId: 'pkg-2', destinationId: 'dest-a', active: true },
  ]

  const result = resolvePackageDestinationIds(rows)

  assert.equal(result.size, 2)
  assert.deepEqual(result.get('pkg-1'), ['dest-a', 'dest-b'])
  assert.deepEqual(result.get('pkg-2'), ['dest-a'])
})

test('resolvePackageDestinationIds excludes inactive join rows', () => {
  const rows = [
    { packageId: 'pkg-1', destinationId: 'dest-a', active: false },
    { packageId: 'pkg-1', destinationId: 'dest-b', active: true },
  ]

  const result = resolvePackageDestinationIds(rows)

  assert.equal(result.size, 1)
  assert.deepEqual(result.get('pkg-1'), ['dest-b'])
})

test('resolvePackageDestinationIds returns empty Map for empty input', () => {
  const result = resolvePackageDestinationIds([])
  assert.equal(result.size, 0)
})

test('resolvePackageDestinationIds preserves duplicates (no dedup)', () => {
  const rows = [
    { packageId: 'pkg-1', destinationId: 'dest-a', active: true },
    { packageId: 'pkg-1', destinationId: 'dest-a', active: true },
    { packageId: 'pkg-1', destinationId: 'dest-b', active: true },
  ]

  const result = resolvePackageDestinationIds(rows)
  assert.equal(result.size, 1)
  // Helper preserves duplicates; client-side dedup is the caller's responsibility
  assert.deepEqual(result.get('pkg-1'), ['dest-a', 'dest-a', 'dest-b'])
})

// ── PR5.2: RoomType sync helpers ─────────────────────────────────────

test('parseRoomTypeIncludes parses valid JSON string array', () => {
  const result = parseRoomTypeIncludes('["Wi-Fi","Desayuno","Aire acondicionado"]')
  assert.deepEqual(result, ['Wi-Fi', 'Desayuno', 'Aire acondicionado'])
})

test('parseRoomTypeIncludes returns empty array for empty JSON array', () => {
  assert.deepEqual(parseRoomTypeIncludes('[]'), [])
})

test('parseRoomTypeIncludes returns empty array for malformed JSON', () => {
  assert.deepEqual(parseRoomTypeIncludes('not-json'), [])
})

test('parseRoomTypeIncludes returns empty array for non-array JSON', () => {
  assert.deepEqual(parseRoomTypeIncludes('{"key":"value"}'), [])
})

test('syncRoomTypesToHotelRooms maps active RoomType rows to HotelRoom cache format', () => {
  const rows = [
    { id: 'rt-1', name: 'Suite', maxGuests: 2, beds: '1 King', basePrice: 500000, originalPrice: 600000, includes: '["Wi-Fi","Jacuzzi"]', roomImage: '/img/suite.jpg', active: true },
    { id: 'rt-2', name: 'Estándar', maxGuests: 2, beds: '2 Dobles', basePrice: 250000, originalPrice: 0, includes: '["Wi-Fi"]', roomImage: '', active: true },
  ]

  const result = syncRoomTypesToHotelRooms(rows)

  assert.equal(result.length, 2)
  assert.equal(result[0].id, 'rt-1')
  assert.equal(result[0].name, 'Suite')
  assert.equal(result[0].price, 500000)
  assert.equal(result[0].originalPrice, 600000)
  assert.deepEqual(result[0].includes, ['Wi-Fi', 'Jacuzzi'])
  assert.equal(result[0].available, 1)
  assert.equal(result[1].id, 'rt-2')
  assert.equal(result[1].originalPrice, undefined) // zero originalPrice → undefined
  assert.equal(result[1].roomImage, '')
})

test('syncRoomTypesToHotelRooms excludes inactive RoomType rows', () => {
  const rows = [
    { id: 'rt-1', name: 'Activa', maxGuests: 2, beds: '1 King', basePrice: 300000, originalPrice: 0, includes: '[]', roomImage: '', active: true },
    { id: 'rt-2', name: 'Inactiva', maxGuests: 3, beds: '1 Queen', basePrice: 200000, originalPrice: 0, includes: '[]', roomImage: '', active: false },
  ]

  const result = syncRoomTypesToHotelRooms(rows)

  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'rt-1')
  assert.equal(result[0].name, 'Activa')
})

test('syncRoomTypesToHotelRooms returns empty array for empty input', () => {
  assert.deepEqual(syncRoomTypesToHotelRooms([]), [])
})

test('syncRoomTypesToHotelRooms returns empty array when all rows are inactive', () => {
  const rows = [
    { id: 'rt-1', name: 'Inactiva 1', maxGuests: 2, beds: '1 King', basePrice: 300000, originalPrice: 0, includes: '[]', roomImage: '', active: false },
  ]
  assert.deepEqual(syncRoomTypesToHotelRooms(rows), [])
})

test('parseRoomTypeIncludesFromForm splits comma-separated form input', () => {
  assert.deepEqual(parseRoomTypeIncludesFromForm('Wi-Fi, Desayuno, Aire acondicionado'), ['Wi-Fi', 'Desayuno', 'Aire acondicionado'])
  assert.deepEqual(parseRoomTypeIncludesFromForm(''), [])
  assert.deepEqual(parseRoomTypeIncludesFromForm('  SoloWiFi  '), ['SoloWiFi'])
})

test('formatRoomTypeIncludesForForm joins JSON includes with comma for form display', () => {
  assert.equal(formatRoomTypeIncludesForForm('["Wi-Fi","Desayuno"]'), 'Wi-Fi, Desayuno')
  assert.equal(formatRoomTypeIncludesForForm('[]'), '')
  assert.equal(formatRoomTypeIncludesForForm('not-json'), '')
})
