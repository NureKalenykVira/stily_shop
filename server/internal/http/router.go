package httpapi

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"github.com/NureKalenykVira/stily-shop-server/internal/http/handlers"
	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
)

type Deps struct {
	Products       *repo.ProductsRepo
	Orders         *repo.OrdersRepo
	OrdersAdmin    *repo.OrdersAdminRepo
	CustomersAdmin *repo.CustomersAdminRepo
	Analytics      *repo.AnalyticsRepo
	AllowedOrigins []string
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   d.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           int((12 * time.Hour).Seconds()),
	}).Handler)

	r.Get("/api/health", handlers.Health)

	ph := &handlers.ProductsHandler{Repo: d.Products}
	r.Get("/api/products", ph.List)
	r.Post("/api/products", ph.Create)
	r.Delete("/api/products/{id}", ph.Delete)
	r.Put("/api/products/{id}", ph.Update)

	oh := &handlers.OrdersHandler{Repo: d.Orders}
	r.Post("/api/orders", oh.Create)
	r.Post("/api/orders/{publicID}/pay/confirm", oh.ConfirmPayment)
	r.Get("/api/orders/{publicID}", oh.GetByPublicID)

	r.Get("/api/admin/customers", (&handlers.AdminCustomersHandler{Repo: d.CustomersAdmin}).List)
	if d.OrdersAdmin != nil {
		r.Get("/api/admin/orders", (&handlers.AdminOrdersHandler{Repo: d.OrdersAdmin}).List)
	}

	if d.Analytics != nil {
		an := &handlers.AnalyticsHandler{Repo: d.Analytics}
		r.Route("/api/analytics", func(a chi.Router) {
			a.Get("/summary", an.Summary)
			a.Get("/customers-by-day", an.CustomersByDay)
			a.Get("/top-products", an.TopProducts)
			a.Get("/companions-popular", an.CompanionsPopular)
			a.Get("/pairs-frequent", an.PairsFrequent)
			a.Get("/pairs-rare", an.PairsRare)
			a.Get("/payment-methods", an.PaymentMethods)
			a.Get("/delivery-methods", an.DeliveryMethods)
			a.Get("/revenue-by-day", an.RevenueByDay)
		})
	}

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("STILY SHOP API"))
	})

	return r
}
