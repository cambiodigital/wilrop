import { describe, test, expect, spyOn, afterEach } from "bun:test";
import * as panelAuth from "@/lib/panel-auth";
import {
  encodeAdminSession,
  decodeAdminSession,
  getAdminSessionCookie,
  clearAdminSessionCookie,
  ADMIN_SESSION_COOKIE
} from "./admin-auth";

describe("admin-auth", () => {
  afterEach(() => {
    // Restore all spies to ensure test isolation
    spyOn(panelAuth, "createPanelSessionToken").mockRestore();
    spyOn(panelAuth, "verifyPanelSessionToken").mockRestore();
    spyOn(panelAuth, "getPanelSessionCookie").mockRestore();
    spyOn(panelAuth, "clearPanelSessionCookie").mockRestore();
  });

  describe("ADMIN_SESSION_COOKIE", () => {
    test("has the correct name", () => {
      expect(ADMIN_SESSION_COOKIE).toBe("wilrop_admin_session");
    });
  });

  describe("encodeAdminSession", () => {
    test("should call createPanelSessionToken with correct payload", () => {
      const spy = spyOn(panelAuth, "createPanelSessionToken").mockReturnValue("mocked-token");

      const payload = {
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        role: "superadmin"
      };

      const result = encodeAdminSession(payload);

      expect(spy).toHaveBeenCalledWith({
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        panelRole: "admin",
        appRole: "superadmin"
      });
      expect(result).toBe("mocked-token");
    });
  });

  describe("decodeAdminSession", () => {
    test("should return null if verifyPanelSessionToken returns null", () => {
      const spy = spyOn(panelAuth, "verifyPanelSessionToken").mockReturnValue(null);

      const result = decodeAdminSession("invalid-token");

      expect(spy).toHaveBeenCalledWith("invalid-token", "admin");
      expect(result).toBeNull();
    });

    test("should decode session correctly", () => {
      const mockSession: panelAuth.PanelSession = {
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        panelRole: "admin",
        appRole: "manager",
        issuedAt: 1000,
        expiresAt: 2000
      };
      const spy = spyOn(panelAuth, "verifyPanelSessionToken").mockReturnValue(mockSession);

      const result = decodeAdminSession("valid-token");

      expect(spy).toHaveBeenCalledWith("valid-token", "admin");
      expect(result).toEqual({
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        role: "manager"
      });
    });

    test("should default role to 'admin' if appRole is not provided", () => {
      const mockSession: panelAuth.PanelSession = {
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        panelRole: "admin",
        issuedAt: 1000,
        expiresAt: 2000
      };
      spyOn(panelAuth, "verifyPanelSessionToken").mockReturnValue(mockSession);

      const result = decodeAdminSession("valid-token");

      expect(result).toEqual({
        id: "usr_123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin"
      });
    });
  });

  describe("getAdminSessionCookie", () => {
    test("should call getPanelSessionCookie with 'admin' role", () => {
      const mockCookie = { name: "wilrop_admin_session", value: "test", path: "/", httpOnly: true, sameSite: "lax" as const, secure: true, maxAge: 3600 };
      const spy = spyOn(panelAuth, "getPanelSessionCookie").mockReturnValue(mockCookie);

      const result = getAdminSessionCookie("my-token");

      expect(spy).toHaveBeenCalledWith("admin", "my-token");
      expect(result).toBe(mockCookie);
    });
  });

  describe("clearAdminSessionCookie", () => {
    test("should call clearPanelSessionCookie with 'admin' role", () => {
      const mockCookie = { name: "wilrop_admin_session", value: "", path: "/", httpOnly: true, sameSite: "lax" as const, secure: true, maxAge: 0 };
      const spy = spyOn(panelAuth, "clearPanelSessionCookie").mockReturnValue(mockCookie);

      const result = clearAdminSessionCookie();

      expect(spy).toHaveBeenCalledWith("admin");
      expect(result).toBe(mockCookie);
    });
  });
});
