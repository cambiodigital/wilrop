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

const {
  applyResellerMarkup,
  calculateSubagentCommission,
  calculateItemTotal,
  buildPricingBreakdown,
  validatePriceIntegrity,
  validateBookingAddons,
} = require('../src/lib/booking-pricing.ts')

// ─── applyResellerMarkup ───────────────────────────────────────────

test('markup: 10% on 100000 = 110000', () => {
  assert.equal(applyResellerMarkup(100000, 10), 110000)
})

test('markup: 0% returns base price', () => {
  assert.equal(applyResellerMarkup(100000, 0), 100000)
})

test('markup: negative commission returns base price', () => {
  assert.equal(applyResellerMarkup(100000, -5), 100000)
})

test('markup: 15% on 200000 = 230000', () => {
  assert.equal(applyResellerMarkup(200000, 15), 230000)
})

test('markup: rounds correctly', () => {
  // 100000 * 1.10 = 110000 (exact)
  assert.equal(applyResellerMarkup(100000, 10), 110000)
  // 99999 * 1.10 = 109998.9 → 109999
  assert.equal(applyResellerMarkup(99999, 10), 109999)
})

// ─── calculateSubagentCommission ───────────────────────────────────

test('subagent commission: 10% on 100000 = 10000', () => {
  assert.equal(calculateSubagentCommission(100000, 10), 10000)
})

test('subagent commission: 0% = 0', () => {
  assert.equal(calculateSubagentCommission(100000, 0), 0)
})

test('subagent commission: negative = 0', () => {
  assert.equal(calculateSubagentCommission(100000, -5), 0)
})

test('subagent commission: rounds correctly', () => {
  // 99999 * 0.10 = 9999.9 → 10000
  assert.equal(calculateSubagentCommission(99999, 10), 10000)
})

// ─── calculateItemTotal ────────────────────────────────────────────

test('item total: basic calculation', () => {
  // 50000 * 2 + 5000 = 105000
  assert.equal(calculateItemTotal(50000, 2, 5000), 105000)
})

test('item total: quantity defaults to 1 if 0', () => {
  // 50000 * max(1, 0) + 0 = 50000
  assert.equal(calculateItemTotal(50000, 0, 0), 50000)
})

test('item total: quantity defaults to 1 if negative', () => {
  assert.equal(calculateItemTotal(50000, -1, 0), 50000)
})

test('item total: no addons', () => {
  assert.equal(calculateItemTotal(75000, 1, 0), 75000)
})

// ─── buildPricingBreakdown ─────────────────────────────────────────

test('breakdown: full calculation with reseller and subagent', () => {
  const result = buildPricingBreakdown({
    baseTotal: 100000,
    addonsTotal: 10000,
    resellerCommissionPercent: 10,
    subagentCommissionPercent: 5,
  })

  assert.equal(result.baseTotal, 100000)
  assert.equal(result.addonsTotal, 10000)
  assert.equal(result.subtotal, 110000)
  assert.equal(result.markupPercent, 10)
  // finalTotal = 110000 * 1.10 = 121000
  assert.equal(result.finalTotal, 121000)
  // markupAmt = 121000 - 110000 = 11000
  assert.equal(result.markupAmt, 11000)
  assert.equal(result.resellerCommissionAmt, 11000)
  // subagentCommissionAmt = 100000 * 0.05 = 5000
  assert.equal(result.subagentCommissionAmt, 5000)
  // netPrice = 121000 - 11000 - 5000 = 105000
  assert.equal(result.netPrice, 105000)
})

test('breakdown: zero commissions', () => {
  const result = buildPricingBreakdown({
    baseTotal: 50000,
    addonsTotal: 0,
    resellerCommissionPercent: 0,
    subagentCommissionPercent: 0,
  })

  assert.equal(result.subtotal, 50000)
  assert.equal(result.finalTotal, 50000)
  assert.equal(result.markupAmt, 0)
  assert.equal(result.resellerCommissionAmt, 0)
  assert.equal(result.subagentCommissionAmt, 0)
  assert.equal(result.netPrice, 50000)
})

// ─── validatePriceIntegrity ────────────────────────────────────────

test('price integrity: exact match', () => {
  assert.equal(validatePriceIntegrity(100000, 100000), true)
})

test('price integrity: within tolerance', () => {
  assert.equal(validatePriceIntegrity(100000, 100050), true)
  assert.equal(validatePriceIntegrity(100000, 99950), true)
})

test('price integrity: at tolerance boundary', () => {
  assert.equal(validatePriceIntegrity(100000, 100100), true)
  assert.equal(validatePriceIntegrity(100000, 99900), true)
})

test('price integrity: exceeds tolerance', () => {
  assert.equal(validatePriceIntegrity(100000, 100101), false)
  assert.equal(validatePriceIntegrity(100000, 99899), false)
})

test('price integrity: custom tolerance', () => {
  assert.equal(validatePriceIntegrity(100000, 100500, 500), true)
  assert.equal(validatePriceIntegrity(100000, 100501, 500), false)
})

// ─── validateBookingAddons ─────────────────────────────────────────

test('addons: all valid', () => {
  const result = validateBookingAddons([
    { type: 'travel-insurance', price: 50000 },
    { type: 'breakfast', price: 15000 },
  ])
  assert.equal(result.valid, true)
  assert.deepEqual(result.unknown, [])
})

test('addons: unknown type detected', () => {
  const result = validateBookingAddons([
    { type: 'travel-insurance', price: 50000 },
    { type: 'invalid-addon', price: 10000 },
  ])
  assert.equal(result.valid, false)
  assert.deepEqual(result.unknown, ['invalid-addon'])
})

test('addons: empty array is valid', () => {
  const result = validateBookingAddons([])
  assert.equal(result.valid, true)
  assert.deepEqual(result.unknown, [])
})

test('addons: custom valid types set', () => {
  const customTypes = new Set(['custom-type-a', 'custom-type-b'])
  const result = validateBookingAddons(
    [{ type: 'custom-type-a', price: 10000 }],
    customTypes,
  )
  assert.equal(result.valid, true)
})

test('addons: multiple unknown types', () => {
  const result = validateBookingAddons([
    { type: 'unknown-1', price: 10000 },
    { type: 'unknown-2', price: 20000 },
    { type: 'breakfast', price: 15000 },
  ])
  assert.equal(result.valid, false)
  assert.deepEqual(result.unknown, ['unknown-1', 'unknown-2'])
})
