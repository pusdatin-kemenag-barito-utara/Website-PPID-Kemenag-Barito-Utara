package main

// PPID Kemenag Barito Utara API Entrypoint.

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v3"
	flog "github.com/gofiber/fiber/v3/log"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/requestid"
	"github.com/gofiber/fiber/v3/middleware/static"

	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/database"
	authhandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/auth"
	"github.com/kemenag/ppid-kemenag/backend/internal/handler/http/health"
	informasihandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/informasi"
	notifikasihandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/notifikasi"
	permohonanhandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/permohonan"
	regulasihandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/regulasi"
	datainformasihandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/datainformasi"
	storagehandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/storage"
	systemhandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/system"
	sophandler "github.com/kemenag/ppid-kemenag/backend/internal/handler/http/sop"
	"github.com/kemenag/ppid-kemenag/backend/internal/middleware"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
	"github.com/kemenag/ppid-kemenag/backend/internal/storage"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	pool, err := database.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	if err := database.EnsureAdminUser(ctx, pool, cfg); err != nil {
		log.Fatalf("seed: %v", err)
	}
	if err := database.EnsureSeedData(ctx, pool); err != nil {
		log.Fatalf("seed data: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName:            cfg.AppName,
		EnableIPValidation: true,
		ProxyHeader:        "CF-Connecting-IP",
	})

	app.Use(recover.New())
	app.Use(requestid.New())

	// Enterprise Cloudflare & Security Headers
	app.Use(func(c fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "SAMEORIGIN")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		return c.Next()
	})

	app.Use(logger.New(logger.Config{
		Format:     "\033[36m${time}\033[0m | \033[33m${status}\033[0m | \033[32m${latency}\033[0m | ${ip} | ${method} ${path} \n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Local",
	}))

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // refined in production set-up
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization", "Cookie", "X-Request-ID"},
	}))

	// --- Dependencies ---
	userRepo := repository.NewUserRepository(pool)
	authSvc := service.NewAuthService(userRepo, cfg)
	authHandler := authhandler.NewHandler(authSvc)

	informasiRepo := repository.NewInformasiRepository(pool)
	informasiSvc := service.NewInformasiService(informasiRepo)
	informasiHandler := informasihandler.NewHandler(informasiSvc)

	regulasiRepo := repository.NewRegulasiRepository(pool)
	regulasiSvc := service.NewRegulasiService(regulasiRepo)
	regulasiHandler := regulasihandler.NewHandler(regulasiSvc)

	permohonanRepo := repository.NewPermohonanRepository(pool)
	permohonanSvc := service.NewPermohonanService(permohonanRepo)
	permohonanHandler := permohonanhandler.NewHandler(permohonanSvc, cfg)

	notifRepo := repository.NewNotifikasiRepository(pool)
	notifSvc := service.NewNotifikasiService(notifRepo, permohonanRepo, cfg)
	notifHandler := notifikasihandler.NewHandler(notifSvc)

	dataInfoRepo := repository.NewDataInformasiRepository(pool)
	dataInfoSvc := service.NewDataInformasiService(dataInfoRepo)
	dataInfoHandler := datainformasihandler.NewHandler(dataInfoSvc)

	sopRepo := repository.NewSopRepository(pool)
	sopSvc := service.NewSopService(sopRepo)
	sopHandler := sophandler.NewHandler(sopSvc)

	fileStore := storage.New(cfg)
	storageHandler := storagehandler.NewHandler(fileStore)

	systemRepo := repository.NewSystemRepository(pool)
	systemSvc := service.NewSystemService(systemRepo, cfg)
	systemHandler := systemhandler.NewHandler(systemSvc)

	// --- Routes ---
	healthHandler := health.NewHandler(pool)
	app.Get("/health", healthHandler.Check)
	app.Get("/api/health", healthHandler.Check)

	apiV1 := app.Group("/api/v1")
	apiV1.Get("/health", healthHandler.Check)
	apiV1.Get("/system/status", systemHandler.GetStatus)

	// Cloudflare CDN Edge Caching for Public GET Endpoints
	apiV1.Use(func(c fiber.Ctx) error {
		if c.Method() == fiber.MethodGet {
			path := c.Path()
			if path == "/api/v1/informasi-publik" || path == "/api/v1/regulasi" || path == "/api/v1/sop" ||
				path == "/api/v1/data-informasi/statistik" || path == "/api/v1/data-informasi/infografis" {
				c.Set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")
				c.Set("CDN-Cache-Control", "max-age=300")
				c.Set("Cloudflare-CDN-Cache-Control", "max-age=300")
			}
		}
		return c.Next()
	})

	// Public data
	apiV1.Get("/informasi-publik", informasiHandler.List)
	apiV1.Get("/regulasi", regulasiHandler.List)
	apiV1.Get("/sop", sopHandler.List)
	apiV1.Get("/data-informasi/statistik", dataInfoHandler.ListStatistik)
	apiV1.Get("/data-informasi/infografis", dataInfoHandler.ListInfografis)

	// Public request submission & tracking (Anti-Brute Force Protection)
	trackLimiter := limiter.New(limiter.Config{
		Max:        12,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Batas pelacakan tiket terlampaui. Mohon tunggu 1 menit demi keamanan data pemohon.",
			})
		},
	})
	createLimiter := limiter.New(limiter.Config{
		Max:        6,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Terlalu banyak pengajuan formulir. Mohon coba lagi beberapa saat.",
			})
		},
	})
	apiV1.Post("/permohonan", createLimiter, permohonanHandler.Create)
	apiV1.Get("/permohonan/lacak/:tiket", trackLimiter, permohonanHandler.Track)

	// Served uploads (local fallback storage)
	app.Use("/uploads", static.New("./uploads"))

	// Auth (public)
	authGroup := apiV1.Group("/auth")
	authGroup.Post("/login", limiter.New(limiter.Config{
		Max:        5,
		Expiration: time.Minute,
	}), authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Get("/me", middleware.RequireAuth(cfg.JWTSecret), authHandler.Me)

	// Protected admin API
	apiV1.Group("/admin", middleware.RequireAuth(cfg.JWTSecret), middleware.RequireRole("admin"))

	adminGroup := apiV1.Group("/admin")
	adminGroup.Get("/informasi-publik", informasiHandler.ListAll)
	adminGroup.Post("/informasi-publik", informasiHandler.Create)
	adminGroup.Put("/informasi-publik/:id", informasiHandler.Update)
	adminGroup.Delete("/informasi-publik/:id", informasiHandler.Delete)

	adminGroup.Get("/regulasi", regulasiHandler.ListAll)
	adminGroup.Post("/regulasi", regulasiHandler.Create)
	adminGroup.Put("/regulasi/:id", regulasiHandler.Update)
	adminGroup.Delete("/regulasi/:id", regulasiHandler.Delete)

	// Admin SOP Layanan
	adminGroup.Get("/sop", sopHandler.ListAll)
	adminGroup.Post("/sop", sopHandler.Create)
	adminGroup.Put("/sop/:id", sopHandler.Update)
	adminGroup.Delete("/sop/:id", sopHandler.Delete)

	// Admin Data Informasi & Statistik
	adminGroup.Get("/data-informasi/statistik", dataInfoHandler.ListStatistikAdmin)
	adminGroup.Post("/data-informasi/statistik", dataInfoHandler.CreateStatistik)
	adminGroup.Put("/data-informasi/statistik/:id", dataInfoHandler.UpdateStatistik)
	adminGroup.Delete("/data-informasi/statistik/:id", dataInfoHandler.DeleteStatistik)

	adminGroup.Get("/data-informasi/infografis", dataInfoHandler.ListInfografisAdmin)
	adminGroup.Post("/data-informasi/infografis", dataInfoHandler.CreateInfografis)
	adminGroup.Put("/data-informasi/infografis/:id", dataInfoHandler.UpdateInfografis)
	adminGroup.Delete("/data-informasi/infografis/:id", dataInfoHandler.DeleteInfografis)

	adminGroup.Get("/permohonan", permohonanHandler.ListAll)
	adminGroup.Patch("/permohonan/:id/status", permohonanHandler.UpdateStatus)
	adminGroup.Post("/permohonan/:id/notifikasi", notifHandler.Send)
	adminGroup.Get("/permohonan/:id/notifikasi", notifHandler.History)

	// Public file stream from Cloudflare R2 / local storage
	apiV1.Get("/storage/*", storageHandler.Stream)

	adminGroup.Post("/storage/upload", storageHandler.Upload)

	// Graceful shutdown
	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, os.Interrupt, syscall.SIGTERM)
		<-sig
		_ = app.ShutdownWithTimeout(10 * time.Second)
	}()

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
	flog.Info("ppid api stopped")
}

