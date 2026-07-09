/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require('node:assert/strict')
const test = require('node:test')
const ts = require('typescript')
const EventEmitter = require('node:events')

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

// =========================================================================
// booking-events tests (Task 1.2)
// =========================================================================

test('bookingEvents is a singleton EventEmitter', () => {
  const { bookingEvents } = require('../src/lib/booking-events.ts')
  const { bookingEvents: second } = require('../src/lib/booking-events.ts')

  assert.ok(bookingEvents instanceof EventEmitter)
  assert.strictEqual(bookingEvents, second, 'must return same singleton instance')
})

test('bookingEvents exports typed event name constants', () => {
  const { BOOKING_CREATED, BOOKING_STATUS_CHANGED } = require('../src/lib/booking-events.ts')

  assert.strictEqual(BOOKING_CREATED, 'booking.created')
  assert.strictEqual(BOOKING_STATUS_CHANGED, 'booking.status_changed')
})

test('bookingEvents.emitAsync triggers listener without blocking', async () => {
  const { bookingEvents, BOOKING_CREATED } = require('../src/lib/booking-events.ts')

  const received = []
  bookingEvents.on(BOOKING_CREATED, (payload) => {
    received.push(payload)
  })

  // emitAsync should not throw
  await bookingEvents.emitAsync(BOOKING_CREATED, { bookingId: 'test-1' })

  // Give setImmediate a chance to fire
  await new Promise((resolve) => setTimeout(resolve, 50))

  assert.strictEqual(received.length, 1)
  assert.deepStrictEqual(received[0], { bookingId: 'test-1' })
})

test('bookingEvents.emitAsync works with booking.status_changed', async () => {
  const { bookingEvents, BOOKING_STATUS_CHANGED } = require('../src/lib/booking-events.ts')

  const received = []
  bookingEvents.on(BOOKING_STATUS_CHANGED, (payload) => {
    received.push(payload)
  })

  await bookingEvents.emitAsync(BOOKING_STATUS_CHANGED, {
    bookingId: 'b1',
    oldStatus: 'pending',
    newStatus: 'confirmed',
  })

  await new Promise((resolve) => setTimeout(resolve, 50))

  assert.strictEqual(received.length, 1)
  assert.strictEqual(received[0].oldStatus, 'pending')
  assert.strictEqual(received[0].newStatus, 'confirmed')
})

test('bookingEvents.emitAsync does not throw when no listeners are registered', async () => {
  const { bookingEvents, BOOKING_STATUS_CHANGED } = require('../src/lib/booking-events.ts')

  // Remove all listeners first
  bookingEvents.removeAllListeners(BOOKING_STATUS_CHANGED)

  // Should resolve without error
  await bookingEvents.emitAsync(BOOKING_STATUS_CHANGED, { bookingId: 'none' })
  assert.ok(true, 'emitAsync resolved without error with zero listeners')
})

// =========================================================================
// booking-notifications tests (Task 1.3)
// =========================================================================

test('buildRecipients returns admin for B2C booking', () => {
  const { buildRecipients } = require('../src/lib/booking-notifications.ts')

  const booking = { resellerId: null, subagentId: null }
  const recipients = buildRecipients(booking)

  assert.strictEqual(recipients.length, 1)
  assert.strictEqual(recipients[0].role, 'admin')
})

test('buildRecipients includes reseller when resellerId is present', () => {
  const { buildRecipients } = require('../src/lib/booking-notifications.ts')

  const booking = { resellerId: 'res-1', subagentId: null }
  const recipients = buildRecipients(booking)

  const roles = recipients.map((r) => r.role)
  assert.ok(roles.includes('admin'))
  assert.ok(roles.includes('reseller'))
  assert.strictEqual(recipients.filter((r) => r.role === 'reseller')[0].actorId, 'res-1')
})

test('buildRecipients includes subagent when subagentId is present', () => {
  const { buildRecipients } = require('../src/lib/booking-notifications.ts')

  const booking = { resellerId: null, subagentId: 'sub-1' }
  const recipients = buildRecipients(booking)

  const roles = recipients.map((r) => r.role)
  assert.ok(roles.includes('admin'))
  assert.ok(roles.includes('subagent'))
  assert.strictEqual(recipients.filter((r) => r.role === 'subagent')[0].actorId, 'sub-1')
})

test('buildRecipients includes all actors when both reseller and subagent are present', () => {
  const { buildRecipients } = require('../src/lib/booking-notifications.ts')

  const booking = { resellerId: 'res-2', subagentId: 'sub-2' }
  const recipients = buildRecipients(booking)

  const roles = recipients.map((r) => r.role)
  assert.ok(roles.includes('admin'))
  assert.ok(roles.includes('reseller'))
  assert.ok(roles.includes('subagent'))
  assert.strictEqual(recipients.length, 3)
})

test('NotificationChannel interface defines send method signature', () => {
  // ConsoleChannel should implement the NotificationChannel shape
  const { ConsoleChannel } = require('../src/lib/booking-notifications.ts')
  const channel = new ConsoleChannel()

  assert.strictEqual(typeof channel.send, 'function')
  // send with a payload should not throw
  assert.doesNotThrow(() => channel.send('booking.created', { test: true }))
})

// =========================================================================
// booking-pricing pure functions tests (Task 1.1)
// =========================================================================

test('applyResellerMarkup computes correct final price with 10% markup', () => {
  const { applyResellerMarkup } = require('../src/lib/booking-pricing.ts')

  // base=200000, commission=10% → final = 200000 * 1.10 = 220000
  const result = applyResellerMarkup(200000, 10)
  assert.strictEqual(result, 220000)
})

test('applyResellerMarkup returns base when commission is 0', () => {
  const { applyResellerMarkup } = require('../src/lib/booking-pricing.ts')

  const result = applyResellerMarkup(100000, 0)
  assert.strictEqual(result, 100000)
})

test('applyResellerMarkup rounds correctly with odd numbers', () => {
  const { applyResellerMarkup } = require('../src/lib/booking-pricing.ts')

  // base=333333, commission=15% → 333333 * 115 / 100 = 383332.95 → 383333
  const result = applyResellerMarkup(333333, 15)
  assert.strictEqual(result, 383333)
})

test('calculateSubagentCommission returns 0 when percent is 0', () => {
  const { calculateSubagentCommission } = require('../src/lib/booking-pricing.ts')

  const result = calculateSubagentCommission(200000, 0)
  assert.strictEqual(result, 0)
})

test('calculateSubagentCommission computes correct amount at 5%', () => {
  const { calculateSubagentCommission } = require('../src/lib/booking-pricing.ts')

  // net=200000, 5% → Math.round(200000 * 5 / 100) = 10000
  const result = calculateSubagentCommission(200000, 5)
  assert.strictEqual(result, 10000)
})

test('calculateSubagentCommission handles odd percentages with rounding', () => {
  const { calculateSubagentCommission } = require('../src/lib/booking-pricing.ts')

  // net=333333, 3% → 333333 * 3 / 100 = 9999.99 → 10000
  const result = calculateSubagentCommission(333333, 3)
  assert.strictEqual(result, 10000)
})

test('buildPricingBreakdown returns correct structure for reseller-only booking', () => {
  const { buildPricingBreakdown } = require('../src/lib/booking-pricing.ts')

  const breakdown = buildPricingBreakdown({
    baseTotal: 200000,
    addonsTotal: 30000,
    resellerCommissionPercent: 10,
    subagentCommissionPercent: 0,
  })

  assert.strictEqual(breakdown.subtotal, 230000) // 200000 + 30000
  assert.strictEqual(breakdown.markupPercent, 10)
  assert.strictEqual(breakdown.markupAmt, 23000) // 230000 * 10%
  assert.strictEqual(breakdown.finalTotal, 253000) // 230000 + 23000
  assert.strictEqual(breakdown.resellerCommissionAmt, 23000)
  assert.strictEqual(breakdown.subagentCommissionAmt, 0)
  assert.strictEqual(breakdown.netPrice, 230000) // finalTotal - resellerCom - subagentCom
})

test('buildPricingBreakdown for dual-commission booking', () => {
  const { buildPricingBreakdown } = require('../src/lib/booking-pricing.ts')

  const breakdown = buildPricingBreakdown({
    baseTotal: 200000,
    addonsTotal: 0,
    resellerCommissionPercent: 10,
    subagentCommissionPercent: 5,
  })

  assert.strictEqual(breakdown.finalTotal, 220000) // 200000 + 10% = 220000
  assert.strictEqual(breakdown.resellerCommissionAmt, 20000)
  // subagent: Math.round(200000 * 5 / 100) = 10000
  assert.strictEqual(breakdown.subagentCommissionAmt, 10000)
  // netPrice = finalTotal - resellerCommissionAmt - subagentCommissionAmt
  // NOT: netPrice = 220000 - 20000 - 10000 = 190000
  // BUT spec says: subagent commission is on net amount (base before reseller markup)
  // Design says: Math.round(netAmount × subagentCommissionPercent / 100)
  // netAmount here = baseTotal (before reseller markup)
  assert.strictEqual(breakdown.netPrice, 190000)
})

test('buildPricingBreakdown with no commissions returns base totals', () => {
  const { buildPricingBreakdown } = require('../src/lib/booking-pricing.ts')

  const breakdown = buildPricingBreakdown({
    baseTotal: 100000,
    addonsTotal: 15000,
    resellerCommissionPercent: 0,
    subagentCommissionPercent: 0,
  })

  assert.strictEqual(breakdown.finalTotal, 115000)
  assert.strictEqual(breakdown.resellerCommissionAmt, 0)
  assert.strictEqual(breakdown.subagentCommissionAmt, 0)
  assert.strictEqual(breakdown.netPrice, 115000)
})

test('validatePriceIntegrity accepts matching totals', () => {
  const { validatePriceIntegrity } = require('../src/lib/booking-pricing.ts')

  assert.strictEqual(validatePriceIntegrity(200000, 200000), true)
  assert.strictEqual(validatePriceIntegrity(200000, 200000, 100), true)
})

test('validatePriceIntegrity accepts within tolerance', () => {
  const { validatePriceIntegrity } = require('../src/lib/booking-pricing.ts')

  assert.strictEqual(validatePriceIntegrity(200050, 200000, 100), true)
  assert.strictEqual(validatePriceIntegrity(199950, 200000, 100), true)
})

test('validatePriceIntegrity rejects beyond tolerance', () => {
  const { validatePriceIntegrity } = require('../src/lib/booking-pricing.ts')

  assert.strictEqual(validatePriceIntegrity(250000, 200000, 100), false)
  assert.strictEqual(validatePriceIntegrity(200000, 250000, 100), false)
})

test('validatePriceIntegrity with custom tolerance', () => {
  const { validatePriceIntegrity } = require('../src/lib/booking-pricing.ts')

  assert.strictEqual(validatePriceIntegrity(200201, 200000, 200), false)
  assert.strictEqual(validatePriceIntegrity(200199, 200000, 200), true)
})

test('calculateItemTotal computes unitPrice × quantity + addonsTotal', () => {
  const { calculateItemTotal } = require('../src/lib/booking-pricing.ts')

  const result = calculateItemTotal(75000, 2, 15000)
  assert.strictEqual(result, 165000) // (75000 * 2) + 15000
})

test('calculateItemTotal with single quantity and no addons', () => {
  const { calculateItemTotal } = require('../src/lib/booking-pricing.ts')

  const result = calculateItemTotal(50000, 1, 0)
  assert.strictEqual(result, 50000)
})

test('calculateItemTotal with multiple addons total', () => {
  const { calculateItemTotal } = require('../src/lib/booking-pricing.ts')

  const result = calculateItemTotal(50000, 1, 85000) // insurance + transfer
  assert.strictEqual(result, 135000)
})

// =========================================================================
// booking-pricing addon validation tests
// =========================================================================

test('validateBookingAddons accepts valid add-on types from extras catalog', () => {
  const { validateBookingAddons } = require('../src/lib/booking-pricing.ts')

  const result = validateBookingAddons([
    { type: 'breakfast', price: 45000 },
    { type: 'travel-insurance', price: 85000 },
  ])

  assert.strictEqual(result.valid, true)
  assert.strictEqual(result.unknown.length, 0)
})

test('validateBookingAddons rejects unknown add-on types', () => {
  const { validateBookingAddons } = require('../src/lib/booking-pricing.ts')

  const result = validateBookingAddons([
    { type: 'fake-service', price: 1 },
  ])

  assert.strictEqual(result.valid, false)
  assert.strictEqual(result.unknown.length, 1)
  assert.strictEqual(result.unknown[0], 'fake-service')
})

test('validateBookingAddons rejects mixed valid and invalid addons', () => {
  const { validateBookingAddons } = require('../src/lib/booking-pricing.ts')

  const result = validateBookingAddons([
    { type: 'breakfast', price: 45000 },
    { type: 'spaceship', price: 999999 },
  ])

  assert.strictEqual(result.valid, false)
  assert.strictEqual(result.unknown.length, 1)
  assert.strictEqual(result.unknown[0], 'spaceship')
})

test('validateBookingAddons accepts empty addons array', () => {
  const { validateBookingAddons } = require('../src/lib/booking-pricing.ts')

  const result = validateBookingAddons([])
  assert.strictEqual(result.valid, true)
})
