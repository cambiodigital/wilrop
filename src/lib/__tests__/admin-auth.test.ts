import { describe, it, expect, vi } from 'vitest'
import { decodeAdminSession } from '../admin-auth'
import { verifyPanelSessionToken } from '../panel-auth'

vi.mock('../panel-auth', () => ({
  verifyPanelSessionToken: vi.fn(),
  getPanelSessionCookieName: vi.fn(() => 'wilrop_admin_session'),
  createPanelSessionToken: vi.fn(),
  getPanelSessionCookie: vi.fn(),
  clearPanelSessionCookie: vi.fn(),
}))

describe('decodeAdminSession', () => {
  it('should return null when token is invalid', () => {
    vi.mocked(verifyPanelSessionToken).mockReturnValue(null)
    const result = decodeAdminSession('invalid-token')
    expect(result).toBeNull()
    expect(verifyPanelSessionToken).toHaveBeenCalledWith('invalid-token', 'admin')
  })

  it('should return null when token is undefined', () => {
    vi.mocked(verifyPanelSessionToken).mockReturnValue(null)
    const result = decodeAdminSession()
    expect(result).toBeNull()
    expect(verifyPanelSessionToken).toHaveBeenCalledWith(undefined, 'admin')
  })

  it('should return null when verifyPanelSessionToken returns null for empty string', () => {
    vi.mocked(verifyPanelSessionToken).mockReturnValue(null)
    const result = decodeAdminSession('')
    expect(result).toBeNull()
    expect(verifyPanelSessionToken).toHaveBeenCalledWith('', 'admin')
  })

  it('should return session payload when token is valid', () => {
    vi.mocked(verifyPanelSessionToken).mockReturnValue({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      panelRole: 'admin',
      appRole: 'superadmin',
      issuedAt: 123,
      expiresAt: 456
    })
    const result = decodeAdminSession('valid-token')
    expect(result).toEqual({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'superadmin',
    })
    expect(verifyPanelSessionToken).toHaveBeenCalledWith('valid-token', 'admin')
  })

  it('should default role to "admin" if appRole is not provided', () => {
    vi.mocked(verifyPanelSessionToken).mockReturnValue({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      panelRole: 'admin',
      issuedAt: 123,
      expiresAt: 456
    })
    const result = decodeAdminSession('valid-token')
    expect(result).toEqual({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    })
  })
})
