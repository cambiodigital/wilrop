import { describe, expect, it, mock, beforeAll, afterAll } from 'bun:test'
import {
  verifyPanelSessionToken,
  createPanelSessionToken,
  type CreatePanelSessionInput,
  type PanelRole,
} from './panel-auth'

describe('verifyPanelSessionToken', () => {
  const originalEnv = process.env

  beforeAll(() => {
    process.env = { ...originalEnv, WILROP_SESSION_SECRET: 'test-secret-key-1234567890' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const validSession: CreatePanelSessionInput = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    panelRole: 'admin',
  }

  it('should verify a valid token successfully', () => {
    const token = createPanelSessionToken(validSession)
    const result = verifyPanelSessionToken(token)

    expect(result).not.toBeNull()
    expect(result?.id).toBe(validSession.id)
    expect(result?.email).toBe(validSession.email)
    expect(result?.name).toBe(validSession.name)
    expect(result?.panelRole).toBe(validSession.panelRole)
    expect(result?.issuedAt).toBeNumber()
    expect(result?.expiresAt).toBeNumber()
  })

  it('should return null for undefined token', () => {
    expect(verifyPanelSessionToken(undefined)).toBeNull()
  })

  it('should return null for empty token', () => {
    expect(verifyPanelSessionToken('')).toBeNull()
  })

  it('should return null for incorrectly formatted token', () => {
    expect(verifyPanelSessionToken('invalid-token-format')).toBeNull()
    expect(verifyPanelSessionToken('part1.part2.part3')).toBeNull()
  })

  it('should return null for invalid signature', () => {
    const token = createPanelSessionToken(validSession)
    const [payload, signature] = token.split('.')

    // Modify signature slightly
    const modifiedSignature = signature.substring(0, signature.length - 1) + (signature.endsWith('a') ? 'b' : 'a')
    const tamperedToken = `${payload}.${modifiedSignature}`

    expect(verifyPanelSessionToken(tamperedToken)).toBeNull()
  })

  it('should return null for modified payload with valid-looking structure but wrong signature', () => {
    const token = createPanelSessionToken(validSession)
    const [_, signature] = token.split('.')

    // Create a new payload with different role
    const tamperedSession = { ...validSession, panelRole: 'reseller' as PanelRole }
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      v: 1,
      ...tamperedSession,
      iat: now,
      exp: now + 3600,
    }
    const tamperedEncodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')

    // Combine tampered payload with original signature
    const tamperedToken = `${tamperedEncodedPayload}.${signature}`

    expect(verifyPanelSessionToken(tamperedToken)).toBeNull()
  })

  it('should return null when token has expired', () => {
    // Create token that expires immediately (-1 seconds)
    const token = createPanelSessionToken(validSession, -1)
    expect(verifyPanelSessionToken(token)).toBeNull()
  })

  it('should return null when expectedRole does not match', () => {
    const token = createPanelSessionToken(validSession) // validSession has panelRole 'admin'

    // Should verify successfully with correct expected role
    expect(verifyPanelSessionToken(token, 'admin')).not.toBeNull()

    // Should fail with incorrect expected role
    expect(verifyPanelSessionToken(token, 'reseller')).toBeNull()
  })

  it('should return null for invalid JSON in payload', () => {
    const token = createPanelSessionToken(validSession)
    const [_, signature] = token.split('.')

    const invalidJsonPayload = Buffer.from('{ invalid-json', 'utf8').toString('base64url')
    const badToken = `${invalidJsonPayload}.${signature}`

    expect(verifyPanelSessionToken(badToken)).toBeNull()
  })

  it('should return null when required claims are missing', () => {
    const token = createPanelSessionToken(validSession)
    const [_, signature] = token.split('.')

    const missingClaimsPayload = {
      id: validSession.id,
      // Missing email, name, panelRole, iat, exp, v
    }
    const encodedPayload = Buffer.from(JSON.stringify(missingClaimsPayload), 'utf8').toString('base64url')
    const tamperedToken = `${encodedPayload}.${signature}`

    expect(verifyPanelSessionToken(tamperedToken)).toBeNull()
  })
})
