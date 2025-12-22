package repo

import (
	"context"
	"strings"

	"github.com/jmoiron/sqlx"
)

type OrdersAdminRepo struct{ db *sqlx.DB }

func NewOrdersAdminRepo(db *DB) *OrdersAdminRepo { return &OrdersAdminRepo{db: db.SQL} }

type ListOrdersFilter struct {
	Q      string
	Status string // new|paid|shipped|cancelled|all
	Pay    string // cod|card
	Limit  int
	Offset int
	Sort   string
}

type OrderRow struct {
	PublicID       string  `db:"public_id" json:"id"`
	CreatedAt      string  `db:"created_at" json:"created_at"`
	PaymentMethod  string  `db:"payment_method" json:"payment"`
	PaymentStatus  string  `db:"payment_status" json:"payment_status"`
	ShippingStatus string  `db:"shipping_status" json:"shipping_status"`
	ItemsTotal     float64 `db:"items_total" json:"items_total"`
	DeliveryMethod string  `db:"delivery_method" json:"delivery_method"`
	DeliveryPrice  float64 `db:"delivery_price" json:"delivery_price"`
	GrandTotal     float64 `db:"grand_total" json:"total"`

	GuestFirstName string `db:"guest_first_name" json:"guest_first_name"`
	GuestLastName  string `db:"guest_last_name"  json:"guest_last_name"`
	GuestEmail     string `db:"guest_email"      json:"guest_email"`
	GuestPhone     string `db:"guest_phone"      json:"guest_phone"`

	AddrFullname string `db:"address_fullname" json:"addr_fullname"`
	AddrPhone    string `db:"address_phone"    json:"addr_phone"`

	ItemsCount int `db:"items_count" json:"items_count"`
}

func (r *OrdersAdminRepo) List(ctx context.Context, f ListOrdersFilter) ([]OrderRow, error) {
	if f.Limit <= 0 || f.Limit > 500 {
		f.Limit = 100
	}

	sb := strings.Builder{}
	sb.WriteString(`
SELECT
  o.public_id,
  CONVERT(varchar(33), o.created_at, 127) AS created_at,
  o.payment_method,
  o.delivery_method, 
  COALESCE(o.payment_status,'pending')       AS payment_status,
  COALESCE(o.shipping_status,'pending')      AS shipping_status,
  COALESCE(o.items_total, 0)                 AS items_total,
  COALESCE(o.delivery_price, 0)              AS delivery_price,
  COALESCE(o.grand_total, 0)                 AS grand_total,

  COALESCE(o.guest_first_name,'')            AS guest_first_name,
  COALESCE(o.guest_last_name,'')             AS guest_last_name,
  COALESCE(o.guest_email,'')                 AS guest_email,
  COALESCE(o.guest_phone,'')                 AS guest_phone,

  COALESCE(o.address_fullname,'')            AS address_fullname,
  COALESCE(o.address_phone,'')               AS address_phone,

  COALESCE((SELECT SUM(oi.quantity) FROM dbo.order_items oi WHERE oi.order_id = o.id), 0) AS items_count
FROM dbo.orders o
WHERE 1=1
`)

	args := map[string]any{}

	if s := strings.ToLower(f.Status); s != "" && s != "all" {
		switch s {
		case "paid":
			sb.WriteString(" AND o.payment_status = 'paid' ")
		case "shipped":
			sb.WriteString(" AND o.shipping_status IN ('shipped','delivered') ")
		case "cancelled":
			sb.WriteString(" AND o.shipping_status = 'cancelled' ")
		case "new":
			sb.WriteString(" AND o.payment_status <> 'paid' AND o.shipping_status NOT IN ('shipped','delivered','cancelled') ")
		}
	}
	if p := strings.ToLower(f.Pay); p != "" && p != "all" {
		sb.WriteString(" AND o.payment_method = :pay ")
		args["pay"] = p
	}
	if q := strings.TrimSpace(f.Q); q != "" {
		sb.WriteString(`
AND (
  o.public_id LIKE :q OR
  o.guest_first_name LIKE :q OR
  o.guest_last_name LIKE :q OR
  o.guest_email LIKE :q OR
  o.guest_phone LIKE :q OR
  o.address_fullname LIKE :q
)`)
		args["q"] = "%" + q + "%"
	}

	switch f.Sort {
	case "created_asc":
		sb.WriteString(" ORDER BY o.created_at ASC ")
	default:
		sb.WriteString(" ORDER BY o.created_at DESC ")
	}

	sb.WriteString(" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY ")
	args["offset"], args["limit"] = f.Offset, f.Limit

	query, named, _ := sqlx.Named(sb.String(), args)
	query = r.db.Rebind(query)

	var rows []OrderRow
	if err := r.db.SelectContext(ctx, &rows, query, named...); err != nil {
		return nil, err
	}
	return rows, nil
}
