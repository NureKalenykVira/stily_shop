package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"github.com/NureKalenykVira/stily-shop-server/internal/config"
	httpapi "github.com/NureKalenykVira/stily-shop-server/internal/http"
	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	db, err := repo.Open(cfg.ConnString())
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
	defer db.SQL.Close()

	router := httpapi.NewRouter(httpapi.Deps{
		Products:       repo.NewProductsRepo(db),
		Orders:         repo.NewOrdersRepo(db),
		OrdersAdmin:    repo.NewOrdersAdminRepo(db),
		CustomersAdmin: repo.NewCustomersAdminRepo(db),
		Analytics:      repo.NewAnalyticsRepo(db),
		AllowedOrigins: cfg.AllowedOrigins,
	})

	addr := ":" + cfg.Port
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}
