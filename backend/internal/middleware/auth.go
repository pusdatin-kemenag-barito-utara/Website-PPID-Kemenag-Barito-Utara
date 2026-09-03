package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/auth"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

const (
	cookieName = "ppid_admin_token"

	// LocalsKeyUserID carries the authenticated user id into handlers.
	LocalsKeyUserID = "auth_user_id"
	LocalsKeyRole   = "auth_user_role"
	// LocalsKeyEmail  = "auth_user_email"
)

// CookieName is exported for tests and cookie clearing.
func CookieName() string { return cookieName }

// RequireAuth validates the session cookie (or Bearer token) and injects
// the principal into c.Locals.
func RequireAuth(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		tokenString := c.Cookies(cookieName)
		if tokenString == "" {
			if h := c.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
				tokenString = strings.TrimPrefix(h, "Bearer ")
			}
		}
		if tokenString == "" {
			return platform.Fail(c, platform.ErrUnauthorized)
		}

		claims, err := auth.ParseToken(tokenString, secret)
		if err != nil {
			return platform.Fail(c, platform.ErrUnauthorized)
		}

		c.Locals(LocalsKeyUserID, claims.Subject)
		c.Locals(LocalsKeyRole, claims.Role)
		return c.Next()
	}
}

// RequireRole guards a route group for a specific role.
func RequireRole(role string) fiber.Handler {
	return func(c fiber.Ctx) error {
		got, _ := c.Locals(LocalsKeyRole).(string)
		if got != role {
			return platform.Fail(c, platform.ErrForbidden)
		}
		return c.Next()
	}
}

// UserID returns the authenticated user id from locals.
func UserID(c fiber.Ctx) string {
	id, _ := c.Locals(LocalsKeyUserID).(string)
	return id
}
