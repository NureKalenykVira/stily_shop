package core

import "time"

type Product struct {
	ID          int64     `db:"id" json:"id"`
	SKU         string    `db:"sku" json:"sku"`
	Title       string    `db:"title" json:"title"`
	Category    *string   `db:"category" json:"category,omitempty"`
	ImagesJSON  *string   `db:"images_json" json:"images_json,omitempty"`
	ColorsJSON  *string   `db:"colors_json" json:"colors_json,omitempty"`
	SizesJSON   *string   `db:"sizes_json" json:"sizes_json,omitempty"`
	FabricJSON  *string   `db:"fabric_json" json:"fabric_json,omitempty"`
	Description *string   `db:"description" json:"description,omitempty"`
	Price       float64   `db:"price" json:"price"`
	Stock       int       `db:"stock" json:"stock"`
	Status      string    `db:"status" json:"status"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type ProductUpsert struct {
	SKU         string  `json:"sku"`
	Title       string  `json:"title"`
	Category    *string `json:"category"`
	ImagesJSON  *string `json:"images_json"`
	ColorsJSON  *string `json:"colors_json"`
	SizesJSON   *string `json:"sizes_json"`
	FabricJSON  *string `json:"fabric_json"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Status      *string `json:"status"`
}
