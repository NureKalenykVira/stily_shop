package handlers

import (
	"net/http"
	"strconv"

	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

type AdminCustomersHandler struct{ Repo *repo.CustomersAdminRepo }

func (h *AdminCustomersHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))

	rows, err := h.Repo.List(r.Context(), repo.ListCustomersFilter{
		Q:      q.Get("q"),
		Limit:  limit,
		Offset: offset,
		Sort:   q.Get("sort"),
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	respond.JSON(w, http.StatusOK, rows)
}
