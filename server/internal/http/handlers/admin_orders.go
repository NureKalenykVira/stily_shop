package handlers

import (
	"net/http"
	"strconv"

	"github.com/NureKalenykVira/stily-shop-server/internal/repo"
	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

type AdminOrdersHandler struct{ Repo *repo.OrdersAdminRepo }

func (h *AdminOrdersHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))

	rows, err := h.Repo.List(r.Context(), repo.ListOrdersFilter{
		Q:      q.Get("q"),
		Status: q.Get("status"),
		Pay:    q.Get("pay"),
		Limit:  limit,
		Offset: offset,
		Sort:   q.Get("sort"),
	})
	if err != nil {
		respond.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	type Out struct {
		ID            string  `json:"id"`
		CreatedAt     string  `json:"createdAt"`
		Payment       string  `json:"payment"`
		Status        string  `json:"status"`
		ItemsCount    int     `json:"itemsCount"`
		ItemsTotal    float64 `json:"itemsTotal"`
		Delivery      string  `json:"delivery"`
		DeliveryPrice float64 `json:"deliveryPrice"`
		Total         float64 `json:"total"`
		Customer      struct {
			Kind      string  `json:"kind"`
			FirstName *string `json:"firstName,omitempty"`
			LastName  *string `json:"lastName,omitempty"`
			Email     *string `json:"email,omitempty"`
			Phone     *string `json:"phone,omitempty"`
		} `json:"customer"`
	}
	out := make([]Out, 0, len(rows))
	for _, r := range rows {
		st := "new"
		if r.PaymentStatus == "paid" {
			st = "paid"
		}
		switch r.ShippingStatus {
		case "cancelled":
			st = "cancelled"
		case "shipped", "delivered":
			st = "shipped"
		}

		first := r.GuestFirstName
		last := r.GuestLastName
		email := r.GuestEmail
		phone := r.GuestPhone
		c := Out{
			ID:            r.PublicID,
			CreatedAt:     r.CreatedAt,
			Payment:       r.PaymentMethod,
			Delivery:      humanDelivery(r.DeliveryMethod),
			Status:        st,
			ItemsCount:    r.ItemsCount,
			ItemsTotal:    r.ItemsTotal,
			DeliveryPrice: r.DeliveryPrice,
			Total:         r.GrandTotal,
		}
		c.Customer.Kind = "guest"
		if first != "" {
			c.Customer.FirstName = &first
		}
		if last != "" {
			c.Customer.LastName = &last
		}
		if email != "" {
			c.Customer.Email = &email
		}
		if phone != "" {
			c.Customer.Phone = &phone
		}

		out = append(out, c)
	}
	respond.JSON(w, http.StatusOK, out)
}

func humanDelivery(code string) string {
	switch code {
	case "nova-poshta-courier":
		return "Курʼєр НП"
	case "nova-poshta-pickup":
		return "Відділення НП"
	default:
		if code == "" {
			return "—"
		}
		return code
	}
}
