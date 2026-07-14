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
  createPanelSessionToken,
  verifyPanelSessionToken,
  getPanelSessionCookieName,
  getPanelSessionCookie,
  clearPanelSessionCookie,
  PANEL_SESSION_TTL_SECONDS,
} = require('../src/lib/panel-auth.ts')

// ─── Cookie Names ──────────────────────────────────────────────────

test('cookie name: admin', () => {
  assert.equal(getPanelSessionCookieName('admin'), 'wilrop_admin_session')
})

test('cookie name: reseller', () => {
  assert.equal(getPanelSessionCookieName('reseller'), 'wilrop_reseller_session')
})

test('cookie name: subagent', () => {
  assert.equal(getPanelSessionCookieName('subagent'), 'wilrop_subagent_session')
})

// ─── Token Creation & Verification ─────────────────────────────────

test('session: create and verify admin token', () => {
  const input = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    panelRole: 'admin',
  }
  const token = createPanelSessionToken(input)
  const session = verifyPanelSessionToken(token, 'admin')

  assert.notEqual(session, null)
  assert.equal(session.id, 'admin-1')
  assert.equal(session.email, 'admin@test.com')
  assert.equal(session.name, 'Test Admin')
  assert.equal(session.panelRole, 'admin')
})

test('session: create and verify reseller token', () => {
  const input = {
    id: 'reseller-1',
    email: 'socio@test.com',
    name: 'Test Socio',
    panelRole: 'reseller',
    appRole: 'standard',
    code: 'SOC-001',
    commission: 10,
    whiteLabelEnabled: true,
  }
  const token = createPanelSessionToken(input)
  const session = verifyPanelSessionToken(token, 'reseller')

  assert.notEqual(session, null)
  assert.equal(session.id, 'reseller-1')
  assert.equal(session.code, 'SOC-001')
  assert.equal(session.commission, 10)
  assert.equal(session.whiteLabelEnabled, true)
})

test('session: wrong role rejects token', () => {
  const input = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    panelRole: 'admin',
  }
  const token = createPanelSessionToken(input)
  const session = verifyPanelSessionToken(token, 'reseller')
  assert.equal(session, null)
})

test('session: tampered token returns null', () => {
  const input = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    panelRole: 'admin',
  }
  const token = createPanelSessionToken(input)
  const tampered = token.slice(0, -5) + 'XXXXX'
  const session = verifyPanelSessionToken(tampered, 'admin')
  assert.equal(session, null)
})

test('session: empty token returns null', () => {
  assert.equal(verifyPanelSessionToken('', 'admin'), null)
  assert.equal(verifyPanelSessionToken(undefined, 'admin'), null)
})

test('session: garbage token returns null', () => {
  assert.equal(verifyPanelSessionToken('not.a.valid.token', 'admin'), null)
})

// ─── Expiration ────────────────────────────────────────────────────

test('session: expired token returns null', () => {
  const input = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    panelRole: 'admin',
  }
  // Create with 1 second TTL
  const token = createPanelSessionToken(input, 1)
  // Wait for expiration
  const start = Date.now()
  while (Date.now() - start < 1500) { /* spin */ }
  const session = verifyPanelSessionToken(token, 'admin')
  assert.equal(session, null)
})

test('session: default TTL is 8 hours', () => {
  assert.equal(PANEL_SESSION_TTL_SECONDS, 60 * 60 * 8)
})

// ─── Cookie Helpers ────────────────────────────────────────────────

test('cookie: getPanelSessionCookie returns correct shape', () => {
  const cookie = getPanelSessionCookie('admin', 'test-value')
  assert.equal(cookie.name, 'wilrop_admin_session')
  assert.equal(cookie.value, 'test-value')
  assert.equal(cookie.httpOnly, true)
  assert.equal(cookie.sameSite, 'lax')
  assert.equal(cookie.path, '/')
})

test('cookie: clearPanelSessionCookie sets maxAge to 0', () => {
  const cookie = clearPanelSessionCookie('reseller')
  assert.equal(cookie.name, 'wilrop_reseller_session')
  assert.equal(cookie.value, '')
  assert.equal(cookie.maxAge, 0)
})
