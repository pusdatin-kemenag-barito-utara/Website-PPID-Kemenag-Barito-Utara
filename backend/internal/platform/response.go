package platform

import (
	"errors"

	"github.com/gofiber/fiber/v3"
)

// Body is the standard JSON envelope returned by every API response.
type Body struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

// OK writes a successful envelope.
func OK(c fiber.Ctx, data any) error {
	return c.Status(fiber.StatusOK).JSON(Body{Success: true, Data: data})
}

// OKMessage writes a success envelope with a message and no data.
func OKMessage(c fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(Body{Success: true, Message: message})
}

// Created writes a 201 response with data.
func Created(c fiber.Ctx, data any) error {
	return c.Status(fiber.StatusCreated).JSON(Body{Success: true, Data: data})
}

// Fail maps any error to the appropriate HTTP status and JSON body.
func Fail(c fiber.Ctx, err error) error {
	status := fiber.StatusInternalServerError
	message := "Terjadi kesalahan internal server."

	switch {
	case Is(err, ErrValidation):
		status = fiber.StatusBadRequest
		message = "Data yang dikirim tidak valid."
	case Is(err, ErrUnauthorized):
		status = fiber.StatusUnauthorized
		message = "Autentikasi diperlukan."
	case Is(err, ErrForbidden):
		status = fiber.StatusForbidden
		message = "Anda tidak memiliki akses."
	case Is(err, ErrNotFound):
		status = fiber.StatusNotFound
		message = "Data tidak ditemukan."
	case Is(err, ErrConflict):
		status = fiber.StatusConflict
		message = "Data sudah ada / konflik."
	case Is(err, ErrRateLimited):
		status = fiber.StatusTooManyRequests
		message = "Terlalu banyak percobaan, silakan coba lagi."
	case Is(err, ErrInvalidTicket):
		status = fiber.StatusNotFound
		message = "Nomor tiket tidak ditemukan."
	}

	// Surface the precise message when it is a wrapped/domain error.
	var pe *Error
	if errors.As(err, &pe) && pe.Message != "" {
		message = pe.Message
	}

	if status >= 500 {
		c.Locals("log_err", err)
	}

	return c.Status(status).JSON(Body{Success: false, Message: message, Error: message})
}
