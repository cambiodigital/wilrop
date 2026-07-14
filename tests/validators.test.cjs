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
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
    fileName: filename,
  }).outputText
  module._compile(output, filename)
}

const { loginSchema } = require('../src/lib/validators/auth.ts')
const { createHotelSchema } = require('../src/lib/validators/hotels.ts')
const { createDestinationSchema } = require('../src/lib/validators/destinations.ts')
const { createPackageSchema } = require('../src/lib/validators/packages.ts')
const { createExcursionSchema } = require('../src/lib/validators/excursions.ts')

// ─── Login Schema ──────────────────────────────────────────────────

test('login: valid input passes', () => {
  const result = loginSchema.safeParse({ email: 'admin@test.com', password: 'secret123' })
  assert.equal(result.success, true)
})

test('login: missing email fails', () => {
  const result = loginSchema.safeParse({ password: 'secret123' })
  assert.equal(result.success, false)
})

test('login: missing password fails', () => {
  const result = loginSchema.safeParse({ email: 'admin@test.com' })
  assert.equal(result.success, false)
})

test('login: invalid email format fails', () => {
  const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' })
  assert.equal(result.success, false)
})

test('login: empty email fails', () => {
  const result = loginSchema.safeParse({ email: '', password: 'secret123' })
  assert.equal(result.success, false)
})

test('login: empty password fails', () => {
  const result = loginSchema.safeParse({ email: 'admin@test.com', password: '' })
  assert.equal(result.success, false)
})

// ─── Hotel Schema ──────────────────────────────────────────────────

test('hotel: valid minimal input passes', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Test',
    cityId: 'cartagena',
    cityName: 'Cartagena',
  })
  assert.equal(result.success, true)
})

test('hotel: missing name fails', () => {
  const result = createHotelSchema.safeParse({
    cityId: 'cartagena',
    cityName: 'Cartagena',
  })
  assert.equal(result.success, false)
})

test('hotel: missing cityId fails', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Test',
    cityName: 'Cartagena',
  })
  assert.equal(result.success, false)
})

test('hotel: missing cityName fails', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Test',
    cityId: 'cartagena',
  })
  assert.equal(result.success, false)
})

test('hotel: full valid input passes', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Caribe',
    cityId: 'cartagena',
    cityName: 'Cartagena',
    stars: 4,
    address: 'Calle 1 #2-3',
    description: 'Un hotel hermoso',
    images: ['https://example.com/img.jpg'],
    amenities: ['pool', 'wifi'],
    rating: 4.5,
    priceFrom: 200000,
    featured: true,
    active: true,
    _pendingRoomTypes: [
      { name: 'Suite', maxGuests: 4, basePrice: 300000 },
    ],
  })
  assert.equal(result.success, true)
})

test('hotel: stars out of range fails', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Test',
    cityId: 'cartagena',
    cityName: 'Cartagena',
    stars: 6,
  })
  assert.equal(result.success, false)
})

test('hotel: negative price fails', () => {
  const result = createHotelSchema.safeParse({
    name: 'Hotel Test',
    cityId: 'cartagena',
    cityName: 'Cartagena',
    priceFrom: -100,
  })
  assert.equal(result.success, false)
})

// ─── Destination Schema ────────────────────────────────────────────

test('destination: valid input passes', () => {
  const result = createDestinationSchema.safeParse({
    name: 'Cartagena',
    region: 'Caribe',
    description: 'La joya del Caribe',
    image: '/images/cartagena.png',
  })
  assert.equal(result.success, true)
})

test('destination: missing required fields fails', () => {
  const result = createDestinationSchema.safeParse({ name: 'Cartagena' })
  assert.equal(result.success, false)
})

test('destination: empty name fails', () => {
  const result = createDestinationSchema.safeParse({
    name: '',
    region: 'Caribe',
    description: 'Desc',
    image: '/img.png',
  })
  assert.equal(result.success, false)
})

// ─── Package Schema ────────────────────────────────────────────────

test('package: valid input passes', () => {
  const result = createPackageSchema.safeParse({
    destinationId: 'dest-1',
    destinationName: 'Cartagena',
    title: 'Cartagena Romántica',
    duration: '4 días / 3 noches',
    price: 1500000,
  })
  assert.equal(result.success, true)
})

test('package: missing price fails', () => {
  const result = createPackageSchema.safeParse({
    destinationId: 'dest-1',
    destinationName: 'Cartagena',
    title: 'Test',
    duration: '3 días',
  })
  assert.equal(result.success, false)
})

test('package: negative price fails', () => {
  const result = createPackageSchema.safeParse({
    destinationId: 'dest-1',
    destinationName: 'Cartagena',
    title: 'Test',
    duration: '3 días',
    price: -100,
  })
  assert.equal(result.success, false)
})

test('package: zero price passes', () => {
  const result = createPackageSchema.safeParse({
    destinationId: 'dest-1',
    destinationName: 'Cartagena',
    title: 'Test',
    duration: '3 días',
    price: 0,
  })
  assert.equal(result.success, true)
})

// ─── Excursion Schema ──────────────────────────────────────────────

test('excursion: valid minimal input passes', () => {
  const result = createExcursionSchema.safeParse({
    name: 'City Tour Cartagena',
  })
  assert.equal(result.success, true)
})

test('excursion: missing name fails', () => {
  const result = createExcursionSchema.safeParse({
    description: 'A tour',
  })
  assert.equal(result.success, false)
})

test('excursion: full valid input passes', () => {
  const result = createExcursionSchema.safeParse({
    name: 'Islas del Rosario',
    destinationId: 'dest-1',
    destinationName: 'Cartagena',
    cityName: 'Cartagena',
    description: 'Tour por las islas',
    duration: '8 horas',
    difficulty: 'Fácil',
    basePrice: 180000,
    childPrice: 120000,
    includes: ['Almuerzo', 'Transporte'],
    excludes: ['Bebidas'],
    category: 'Playa',
    rating: 4.7,
    featured: true,
  })
  assert.equal(result.success, true)
})

test('excursion: negative basePrice fails', () => {
  const result = createExcursionSchema.safeParse({
    name: 'Test',
    basePrice: -100,
  })
  assert.equal(result.success, false)
})
