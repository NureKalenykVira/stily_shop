package handlers

import (
	"net/http"

	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

type AnalyticsHandler struct{ Repo *repo.AnalyticsRepo }
type TopHandler struct{ Repo *repo.AnalyticsRepo }
type KV = repo.KV
type DayRevenue = repo.DayRevenue

func (h *AnalyticsHandler) Summary(w http.ResponseWriter, r *http.Request) {
	sum, err := h.Repo.Summary(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, sum)
}

func (h *AnalyticsHandler) CustomersByDay(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.CustomersByDay(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) TopProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.TopProductsThisMonth(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) CompanionsPopular(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.CompanionsForPopularThisMonth(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) PairsFrequent(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.PairsFrequentThisMonth(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, rows)
}
func (h *AnalyticsHandler) PairsRare(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.PairsRareThisMonth(r.Context())
	if err != nil {
		respond.Error(w, 500, err.Error())
		return
	}
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) PaymentMethods(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.PaymentMethods(r.Context())
	if err != nil { respond.Error(w, 500, err.Error()); return }
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) DeliveryMethods(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.DeliveryMethods(r.Context())
	if err != nil { respond.Error(w, 500, err.Error()); return }
	respond.JSON(w, 200, rows)
}

func (h *AnalyticsHandler) RevenueByDay(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Repo.RevenueByDay(r.Context())
	if err != nil { respond.Error(w, 500, err.Error()); return }
	respond.JSON(w, 200, rows)
}