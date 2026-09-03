package platform

import (
	"context"
	"errors"
	"fmt"
)

// Sentinel errors used across the service layer.
var (
	ErrNotFound      = errors.New("resource not found")
	ErrUnauthorized  = errors.New("unauthorized")
	ErrForbidden     = errors.New("forbidden")
	ErrConflict      = errors.New("resource conflict")
	ErrValidation    = errors.New("validation failed")
	ErrInternal      = errors.New("internal server error")
	ErrRateLimited   = errors.New("rate limited")
	ErrInvalidTicket = errors.New("invalid tracking id")
)

// Error wraps a sentinel with a message and optional inner cause.
type Error struct {
	Code    string
	Message string
	Cause   error
}

func (e *Error) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Cause)
	}
	return e.Message
}

func (e *Error) Unwrap() error { return e.Cause }

// NewError constructs a platform.Error from a sentinel.
func NewError(sentinel error, message string) *Error {
	return &Error{Code: sentinel.Error(), Message: message}
}

// ErrorCode extracts the sentinel code from any error.
func ErrorCode(err error) error {
	var pe *Error
	if errors.As(err, &pe) && pe.Code != "" {
		return errors.New(pe.Code)
	}
	return err
}

// Is reports whether err matches the sentinel.
func Is(err, sentinel error) bool {
	var pe *Error
	if errors.As(err, &pe) {
		return pe.Code == sentinel.Error() || errors.Is(pe.Cause, sentinel)
	}
	return errors.Is(err, sentinel)
}

// NotFoundf builds a not-found platform error.
func NotFoundf(format string, args ...any) *Error {
	return &Error{Code: ErrNotFound.Error(), Message: fmt.Sprintf(format, args...)}
}

// Validationf builds a validation platform error.
func Validationf(format string, args ...any) *Error {
	return &Error{Code: ErrValidation.Error(), Message: fmt.Sprintf(format, args...)}
}

// WithContext annotates an error message for outbound HTTP mapping.
func WithContext(ctx context.Context, err error, msg string) error {
	return &Error{Code: ErrorCode(err).Error(), Message: msg, Cause: err}
}
