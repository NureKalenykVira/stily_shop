package repo

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/NureKalenykVira/stily-shop-server/internal/core"
	"github.com/jmoiron/sqlx"
)

type OrdersRepo struct{ db *sqlx.DB }

func NewOrdersRepo(db *DB) *OrdersRepo { return &OrdersRepo{db: db.SQL} }

func rnd(n int) (string, error) {
	const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
	out := make([]byte, n)
	for i := range out {
		x, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		out[i] = alphabet[x.Int64()]
	}
	return string(out), nil
}

type productSnapshot struct {
	ID    int64   `db:"id"`
	SKU   string  `db:"sku"`
	Title string  `db:"title"`
	Price float64 `db:"price"`
	Stock int     `db:"stock"`
}

func (r *OrdersRepo) Create(ctx context.Context, in core.OrderCreate) (_ *core.OrderCreated, err error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
			return
		}
		_ = tx.Commit()
	}()

	pub, err := rnd(10)
	if err != nil {
		return nil, err
	}

	// Беремо значення з in.* напряму (це звичайні структури, не *struct)
	g := in.Guest
	d := in.Delivery
	a := in.Address

	// customer_id може бути значенням або *int64 — це ок.
	// Якщо це *int64 з nil, sqlx передасть SQL NULL.
	args := map[string]any{
		"public_id":   pub,
		"customer_id": in.CustomerID,

		"gfn": g.FirstName, "gln": g.LastName,
		"gemail": g.Email, "gphone": g.Phone,

		"dmethod": d.Method, "dlabel": d.Label, "dprice": d.Price,

		"afn": a.FullName, "astr": a.Street, "ahouse": a.House,
		"aflat": a.Flat, "acity": a.City, "azip": a.ZIP, "aphone": a.Phone,

		"pmethod": in.PaymentMethod, // "cod" | "card"
	}

	sql1, named1, _ := sqlx.Named(`
INSERT INTO dbo.orders
 (public_id, customer_id,
  guest_first_name, guest_last_name, guest_email, guest_phone,
  delivery_method, delivery_label, delivery_price,
  address_fullname, address_street, address_house, address_flat, address_city, address_zip, address_phone,
  payment_method, payment_status, shipping_status, items_total, grand_total, currency)
VALUES
 (:public_id, :customer_id,
  :gfn, :gln, :gemail, :gphone,
  :dmethod, :dlabel, :dprice,
  :afn, :astr, :ahouse, :aflat, :acity, :azip, :aphone,
  :pmethod, 'pending', 'pending', 0, 0, 'UAH');
SELECT SCOPE_IDENTITY();
`, args)
	sql1 = r.db.Rebind(sql1)

	var orderID int64
	if err = tx.QueryRowxContext(ctx, sql1, named1...).Scan(&orderID); err != nil {
		return nil, err
	}

	var itemsTotal float64

	for _, it := range in.Items {
		var p productSnapshot
		if err = tx.GetContext(ctx, &p,
			`SELECT id, sku, title, price, stock FROM dbo.products WHERE id=@p1`, it.ProductID); err != nil {
			return nil, fmt.Errorf("product %d not found: %w", it.ProductID, err)
		}
		if it.Quantity <= 0 {
			it.Quantity = 1
		}

		line := float64(it.Quantity) * p.Price
		itemsTotal += line

		sql2Text, sql2Args, _ := sqlx.Named(`
INSERT INTO dbo.order_items
 (order_id, product_id, sku_snapshot, title_snapshot,
  unit_price, quantity, line_total, color_snapshot, size_snapshot)
VALUES
 (:oid, :pid, :sku, :title, :price, :qty, :total, :color, :size);
`, map[string]any{
			"oid": orderID, "pid": p.ID, "sku": p.SKU, "title": p.Title,
			"price": p.Price, "qty": it.Quantity, "total": line,
			"color": it.Color, "size": it.Size,
		})
		sql2Text = r.db.Rebind(sql2Text)
		if _, err = tx.ExecContext(ctx, sql2Text, sql2Args...); err != nil {
			return nil, err
		}

		if _, err = tx.ExecContext(ctx,
			`UPDATE dbo.products SET stock = stock - @p1 WHERE id=@p2 AND stock >= @p1`,
			it.Quantity, p.ID); err != nil {
			return nil, err
		}
	}

	grand := itemsTotal + d.Price

	if _, err = tx.ExecContext(ctx,
		`UPDATE dbo.orders SET items_total=@p1, grand_total=@p2 WHERE id=@p3`,
		itemsTotal, grand, orderID); err != nil {
		return nil, err
	}

	return &core.OrderCreated{
		ID:            orderID,
		PublicID:      pub,
		ItemsTotal:    itemsTotal,
		DeliveryPrice: d.Price,
		GrandTotal:    grand,
		PaymentStatus: "pending",
	}, nil
}

func (r *OrdersRepo) SetPaymentStatus(ctx context.Context, publicID, status string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE dbo.orders SET payment_status=@p1 WHERE public_id=@p2`, status, publicID)
	return err
}

type OrderView struct {
	ID             int64   `db:"id" json:"id"`
	PublicID       string  `db:"public_id" json:"public_id"`
	PaymentStatus  string  `db:"payment_status" json:"payment_status"`
	ShippingStatus string  `db:"shipping_status" json:"shipping_status"`
	ItemsTotal     float64 `db:"items_total" json:"items_total"`
	GrandTotal     float64 `db:"grand_total" json:"grand_total"`
	Currency       string  `db:"currency" json:"currency"`
}

func (r *OrdersRepo) GetByPublicID(ctx context.Context, publicID string) (*OrderView, error) {
	var v OrderView
	err := r.db.GetContext(ctx, &v, `
SELECT id, public_id, payment_status, shipping_status, items_total, grand_total, currency
FROM dbo.orders WHERE public_id=@p1`, publicID)
	if err != nil {
		return nil, err
	}
	return &v, nil
}
