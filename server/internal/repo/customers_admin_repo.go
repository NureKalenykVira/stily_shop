package repo

import (
	"context"
	"strings"

	"github.com/jmoiron/sqlx"
)

type AdminCustomerRow struct {
	ID              int64  `db:"id" json:"id"`
	CreatedAt       string `db:"created_at" json:"createdAt"` // ISO
	FirstName       string `db:"first_name" json:"firstName"`
	LastName        string `db:"last_name" json:"lastName"`
	Email           string `db:"email" json:"email"`
	AcceptTerms     bool   `db:"accept_terms" json:"acceptTerms"`
	AcceptMarketing bool   `db:"accept_marketing" json:"acceptMarketing"`

	AddrFullName string `db:"addr_full_name" json:"addrFullName"`
	AddrStreet   string `db:"addr_street" json:"addrStreet"`
	AddrHouse    string `db:"addr_house" json:"addrHouse"`
	AddrFlat     string `db:"addr_flat" json:"addrFlat"`
	AddrCity     string `db:"addr_city" json:"addrCity"`
	AddrZIP      string `db:"addr_zip" json:"addrZIP"`
	AddrPhone    string `db:"addr_phone" json:"addrPhone"`
	AddrDefault  bool   `db:"addr_is_default" json:"addrIsDefault"`

	OrdersCount   int     `db:"orders_count" json:"ordersCount"`
	LastOrderDate *string `db:"last_order_date" json:"lastOrderDate,omitempty"`
}

type ListCustomersFilter struct {
	Q      string
	Limit  int
	Offset int
	Sort   string // created_desc|created_asc
}

type CustomersAdminRepo struct{ db *sqlx.DB }

func NewCustomersAdminRepo(db *DB) *CustomersAdminRepo { return &CustomersAdminRepo{db: db.SQL} }

func (r *CustomersAdminRepo) List(ctx context.Context, f ListCustomersFilter) ([]AdminCustomerRow, error) {
	if f.Limit <= 0 || f.Limit > 500 {
		f.Limit = 100
	}

	sb := strings.Builder{}
	sb.WriteString(`
SELECT
  c.id,
  CONVERT(varchar(33), c.created_at, 127)      AS created_at,
  COALESCE(c.first_name,'')                    AS first_name,
  COALESCE(c.last_name,'')                     AS last_name,
  COALESCE(c.email,'')                         AS email,
  c.accept_terms,
  c.accept_marketing,

  COALESCE(da.full_name,'')                    AS addr_full_name,
  COALESCE(da.street,'')                       AS addr_street,
  COALESCE(da.house,'')                        AS addr_house,
  COALESCE(da.flat,'')                         AS addr_flat,
  COALESCE(da.city,'')                         AS addr_city,
  COALESCE(da.zip,'')                          AS addr_zip,
  COALESCE(da.phone,'')                        AS addr_phone,
  COALESCE(da.is_default,0)                    AS addr_is_default,

  COALESCE(oo.orders_count, 0)                 AS orders_count,
  oo.last_order_date
FROM dbo.customers c
OUTER APPLY (
  SELECT TOP 1 a.full_name, a.street, a.house, a.flat, a.city, a.zip, a.phone, a.is_default
  FROM dbo.addresses a
  WHERE a.customer_id = c.id AND a.is_default = 1
  ORDER BY a.id DESC
) da
LEFT JOIN (
  SELECT customer_id, COUNT(*) AS orders_count, CONVERT(varchar(33), MAX(created_at), 127) AS last_order_date
  FROM dbo.orders
  GROUP BY customer_id
) oo ON oo.customer_id = c.id
WHERE 1=1
`)

	args := map[string]any{}

	if q := strings.TrimSpace(f.Q); q != "" {
		sb.WriteString(`
AND (
  c.first_name LIKE :q OR c.last_name LIKE :q OR c.email LIKE :q
  OR da.phone LIKE :q OR da.city LIKE :q OR da.street LIKE :q OR da.zip LIKE :q
)`)
		args["q"] = "%" + q + "%"
	}

	switch f.Sort {
	case "created_asc":
		sb.WriteString(" ORDER BY c.created_at ASC ")
	default:
		sb.WriteString(" ORDER BY c.created_at DESC ")
	}

	sb.WriteString(" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY ")
	args["offset"], args["limit"] = f.Offset, f.Limit

	query, named, _ := sqlx.Named(sb.String(), args)
	query = r.db.Rebind(query)

	var rows []AdminCustomerRow
	if err := r.db.SelectContext(ctx, &rows, query, named...); err != nil {
		return nil, err
	}
	return rows, nil
}
