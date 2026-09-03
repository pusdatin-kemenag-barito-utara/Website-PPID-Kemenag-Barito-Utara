package auth

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/middleware"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler is the HTTP layer for authentication endpoints.
type Handler struct {
	auth *service.AuthService
}

// NewHandler creates an auth Handler.
func NewHandler(auth *service.AuthService) *Handler {
	return &Handler{auth: auth}
}

// Login authenticates an admin and sets the session cookie.
func (h *Handler) Login(c fiber.Ctx) error {
	var in service.LoginInput
	if err := c.Bind().Body(&in); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	user, token, err := h.auth.Login(c.Context(), in, c.IP())
	if err != nil {
		return platform.Fail(c, err)
	}

	c.Cookie(&fiber.Cookie{
		Name:     middleware.CookieName(),
		Value:    token.Token,
		Path:     "/",
		MaxAge:   token.MaxAge,
		HTTPOnly: true,
		Secure:   c.Scheme() == "https",
		SameSite: fiber.CookieSameSiteLaxMode,
	})

	return platform.OK(c, fiber.Map{
		"user":  user,
		"token": token.Token,
	})
}

// Logout invalidates the session cookie.
func (h *Handler) Logout(c fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     middleware.CookieName(),
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HTTPOnly: true,
		SameSite: fiber.CookieSameSiteLaxMode,
	})
	return platform.OKMessage(c, fiber.StatusOK, "Sesi berakhir.")
}

// Me returns the current authenticated principal.
func (h *Handler) Me(c fiber.Ctx) error {
	user, err := h.auth.Me(c.Context(), middleware.UserID(c))
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, user)
}
