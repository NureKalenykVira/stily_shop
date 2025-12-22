package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/NureKalenykVira/stily-shop-server/internal/core"
	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

type ProductsHandler struct{ Repo *repo.ProductsRepo }

type ApiProduct struct {
	ID       int64    `json:"id"`
	Name     string   `json:"name"`
	Price    float64  `json:"price"`
	Images   []string `json:"images,omitempty"`
	Colors   []string `json:"colors,omitempty"`
	Sizes    []string `json:"sizes,omitempty"`
	SKU      string   `json:"sku,omitempty"`
	Fabric   []string `json:"fabric,omitempty"`
	Type     *string  `json:"type,omitempty"`
	Color    *string  `json:"color,omitempty"`
	Status   string   `json:"status"`
	Category *string  `json:"category,omitempty"`
	Stock    int      `json:"stock"`
}

func (h *ProductsHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))
	if limit <= 0 {
		limit = 1000
	}

	raw, err := h.Repo.List(r.Context(), repo.ListProductsFilter{
		Query:    q.Get("q"),
		Status:   firstNonEmpty(q.Get("status"), "active"),
		Category: q.Get("category"),
		Limit:    limit,
		Offset:   offset,
		Sort:     q.Get("sort"),
	})
	if err != nil {
		respond.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	out := make([]ApiProduct, 0, len(raw))
	for _, p := range raw {
		ap := ApiProduct{
			ID:     p.ID,
			Name:   p.Title,
			Price:  p.Price,
			Images: parseJSONList(p.ImagesJSON),
			Colors: parseJSONList(p.ColorsJSON),
			Sizes:  parseJSONList(p.SizesJSON),
			SKU:    p.SKU,
			Fabric: parseJSONList(p.FabricJSON),
			Type:   p.Category,
			Status: p.Status,
			Stock:  p.Stock,
		}
		if n := codeToName(first(ap.Colors)); n != "" {
			ap.Color = &n
		}

		out = append(out, ap)
	}

	respond.JSON(w, http.StatusOK, out)
}

func (h *ProductsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in core.ProductUpsert
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid json")
		return
	}
	if in.SKU == "" || in.Title == "" {
		respond.Error(w, http.StatusBadRequest, "sku and title are required")
		return
	}
	id, err := h.Repo.Create(r.Context(), in)
	if err != nil {
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	respond.JSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (h *ProductsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.ParseInt(idStr, 10, 64)
	if id <= 0 {
		respond.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.Repo.Delete(r.Context(), id); err != nil {
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	respond.JSON(w, http.StatusOK, map[string]any{"deleted": id})
}

func parseJSONList(s *string) []string {
	if s == nil || *s == "" {
		return []string{}
	}
	var arr []string
	if err := json.Unmarshal([]byte(*s), &arr); err != nil {
		return []string{}
	}
	return arr
}

func firstNonEmpty(a, b string) string {
	if a != "" {
		return a
	}
	return b
}

func first(arr []string) string {
	if len(arr) > 0 {
		return arr[0]
	}
	return ""
}

func codeToName(hex string) string {
	h := strings.ToLower(strings.TrimSpace(hex))
	if !strings.HasPrefix(h, "#") && len(h) == 6 {
		h = "#" + h
	}
	switch h {
	case "#000000":
		return "Чорний"
	case "#e6e0d4":
		return "Бежевий"
	case "#a79b8e":
		return "Світло-коричневий"
	case "#dcdcdc":
		return "Світло-сірий"
	case "#1b1f2b":
		return "Темно-синій"
	case "#f5f5f0":
		return "Молочний"
	case "#1f4d3a":
		return "Зелений"
	case "#bcbcbc":
		return "Сірий меланж"
	default:
		return ""
	}
}

func (h *ProductsHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.ParseInt(idStr, 10, 64)
	if id <= 0 {
		respond.Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	var in core.ProductUpsert
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respond.Error(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(in.SKU) == "" || strings.TrimSpace(in.Title) == "" {
		respond.Error(w, http.StatusBadRequest, "sku and title are required")
		return
	}

	if err := h.Repo.Update(r.Context(), id, in); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "not found") {
			respond.Error(w, http.StatusNotFound, "product not found")
			return
		}
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	respond.JSON(w, http.StatusOK, map[string]any{"updated": id})
}
