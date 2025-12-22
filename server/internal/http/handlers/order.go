package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/NureKalenykVira/stily-shop-server/internal/core"
	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

type OrdersHandler struct {
	Repo     *repo.OrdersRepo
	Products *repo.ProductsRepo
}

func (h *OrdersHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in core.OrderCreate
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid json")
		return
	}
	if len(in.Items) == 0 {
		respond.Error(w, http.StatusBadRequest, "empty items")
		return
	}
	res, err := h.Repo.Create(r.Context(), in)
	if err != nil {
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	respond.JSON(w, http.StatusCreated, res)
}

func (h *OrdersHandler) ConfirmPayment(w http.ResponseWriter, r *http.Request) {
	publicID := chi.URLParam(r, "publicId")
	var body struct {
		Status string `json:"status"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.Status != "success" {
		body.Status = "paid"
	}
	if err := h.Repo.SetPaymentStatus(r.Context(), publicID, "paid"); err != nil {
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	respond.JSON(w, http.StatusOK, map[string]any{"public_id": publicID, "payment_status": "paid"})
}

func (h *OrdersHandler) GetByPublicID(w http.ResponseWriter, r *http.Request) {
	publicID := chi.URLParam(r, "publicId")
	out, err := h.Repo.GetByPublicID(r.Context(), publicID)
	if err != nil {
		respond.Error(w, http.StatusNotFound, "order not found")
		return
	}
	respond.JSON(w, http.StatusOK, out)
}
