package repo

import (
	"context"
	"fmt"
	"strings"

	"github.com/NureKalenykVira/stily-shop-server/internal/core"
	"github.com/jmoiron/sqlx"
)

type ProductsRepo struct{ db *sqlx.DB }

func NewProductsRepo(db *DB) *ProductsRepo { return &ProductsRepo{db: db.SQL} }

type ListProductsFilter struct {
	Query, Status, Category, Sort string
	Limit, Offset                 int
}

func (r *ProductsRepo) List(ctx context.Context, f ListProductsFilter) ([]core.Product, error) {
	var sb strings.Builder
	sb.WriteString(`
SELECT id, sku, title, category, images_json, colors_json, sizes_json, fabric_json,
       description, price, stock, status, created_at, updated_at
FROM dbo.products
WHERE 1=1`)
	args := map[string]any{}

	if f.Status != "" && f.Status != "all" {
		sb.WriteString(" AND status = :status")
		args["status"] = f.Status
	}
	if f.Category != "" {
		sb.WriteString(" AND category = :category")
		args["category"] = f.Category
	}
	if f.Query != "" {
		sb.WriteString(" AND (title LIKE :q OR sku LIKE :q)")
		args["q"] = "%" + f.Query + "%"
	}

	switch f.Sort {
	case "price_asc":
		sb.WriteString(" ORDER BY price ASC")
	case "price_desc":
		sb.WriteString(" ORDER BY price DESC")
	case "created_at_asc":
		sb.WriteString(" ORDER BY created_at ASC")
	default:
		sb.WriteString(" ORDER BY created_at DESC")
	}

	if f.Limit <= 0 || f.Limit > 1000 {
		f.Limit = 1000
	}
	sb.WriteString(" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY")
	args["offset"], args["limit"] = f.Offset, f.Limit

	query, named, _ := sqlx.Named(sb.String(), args)
	query = r.db.Rebind(query)

	var items []core.Product
	if err := r.db.SelectContext(ctx, &items, query, named...); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ProductsRepo) Create(ctx context.Context, in core.ProductUpsert) (int64, error) {
	q := `
INSERT INTO dbo.products
 (sku, title, category, images_json, colors_json, sizes_json, fabric_json,
  description, price, stock, status)
VALUES (:sku, :title, :category, :images, :colors, :sizes, :fabric,
        :descr, :price, :stock, COALESCE(:status,'active'));
SELECT SCOPE_IDENTITY();
`
	args := map[string]any{
		"sku":   in.SKU,
		"title": in.Title,

		"category": in.Category,
		"images":   in.ImagesJSON,
		"colors":   in.ColorsJSON,
		"sizes":    in.SizesJSON,
		"fabric":   in.FabricJSON,

		"descr":  in.Description,
		"price":  in.Price,
		"stock":  in.Stock,
		"status": in.Status,
	}
	query, named, _ := sqlx.Named(q, args)
	query = r.db.Rebind(query)

	var id int64
	if err := r.db.QueryRowxContext(ctx, query, named...).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r *ProductsRepo) Delete(ctx context.Context, id int64) error {
	q, named, _ := sqlx.Named(`DELETE FROM dbo.products WHERE id = :id`, map[string]any{"id": id})
	q = r.db.Rebind(q)
	_, err := r.db.ExecContext(ctx, q, named...)
	return err
}

func (r *ProductsRepo) Update(ctx context.Context, id int64, in core.ProductUpsert) error {
	const q = `
UPDATE dbo.products
SET
  sku         = :sku,
  title       = :title,
  category    = :category,
  images_json = :images,
  colors_json = :colors,
  sizes_json  = :sizes,
  fabric_json = :fabric,
  description = :descr,
  price       = :price,
  stock       = :stock,
  status      = COALESCE(:status, 'active'),
  updated_at  = SYSDATETIME()
WHERE id = :id;
`
	args := map[string]any{
		"id":    id,
		"sku":   in.SKU,
		"title": in.Title,

		"category": in.Category,
		"images":   in.ImagesJSON,
		"colors":   in.ColorsJSON,
		"sizes":    in.SizesJSON,
		"fabric":   in.FabricJSON,

		"descr":  in.Description,
		"price":  in.Price,
		"stock":  in.Stock,
		"status": in.Status,
	}
	query, named, _ := sqlx.Named(q, args)
	query = r.db.Rebind(query)

	res, err := r.db.ExecContext(ctx, query, named...)
	if err != nil {
		return err
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}
