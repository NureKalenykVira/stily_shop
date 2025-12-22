package repo

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type AnalyticsRepo struct{ db *sqlx.DB }

func NewAnalyticsRepo(db *DB) *AnalyticsRepo { return &AnalyticsRepo{db: db.SQL} }

type summaryRow struct {
	RevenueMonth        float64 `db:"revenue_month"`
	TotalCustomers      int     `db:"total_customers"`
	AvgCheck            float64 `db:"avg_check"`
	MedianCheck         float64 `db:"median_check"`
	MostFrequentProduct string  `db:"most_frequent_product"`
	MinDayDate          string  `db:"min_day_date"`
	MinDayCustomers     int     `db:"min_day_customers"`
	MaxDayDate          string  `db:"max_day_date"`
	MaxDayCustomers     int     `db:"max_day_customers"`
}

type DayAgg struct {
	Date      string `json:"date"      db:"date"`
	Customers int    `json:"customers" db:"customers"`
}

type Summary struct {
	RevenueMonth        float64 `json:"revenue_month"`
	TotalCustomers      int     `json:"total_customers"`
	AvgCheck            float64 `json:"avg_check"`
	MedianCheck         float64 `json:"median_check"`
	MostFrequentProduct string  `json:"most_frequent_product"`
	MinDay              *DayAgg `json:"min_day"`
	MaxDay              *DayAgg `json:"max_day"`
}

type NameValue struct {
	Label string `db:"label" json:"label"`
	Value int    `db:"value" json:"value"`
}

type KV struct {
	Label string  `db:"label"`
	Value float64 `db:"value"`
}

type DayRevenue struct {
	Date    string  `db:"d" json:"date"`
	Revenue float64 `db:"revenue" json:"revenue"`
}

func (r *AnalyticsRepo) Summary(ctx context.Context) (Summary, error) {
	const q = `
WITH rng AS (
  SELECT
    DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) AS dfrom,
    DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)) AS dto
),
orders_m AS (
  SELECT
    o.*,
    CONVERT(char(10), o.created_at, 23) AS d,
    COALESCE(CONVERT(nvarchar(50), o.customer_id),
             LOWER(o.guest_email),
             o.guest_phone,
             o.public_id) AS buyer_key
  FROM dbo.orders o
  CROSS JOIN rng
  WHERE o.created_at >= rng.dfrom AND o.created_at < rng.dto
),
revenue AS (
  SELECT SUM(CAST(oi.quantity AS float) * CAST(oi.unit_price AS float)) AS revenue_month
  FROM dbo.order_items oi
  JOIN orders_m o ON o.id = oi.order_id
),
cust AS (
  SELECT COUNT(DISTINCT buyer_key) AS total_customers
  FROM orders_m
),
checks AS (
  SELECT AVG(CAST(o.grand_total AS float)) AS avg_check
  FROM orders_m o
),
med AS (
  SELECT AVG(CAST(x.val AS float)) AS median_check
  FROM (
    SELECT o.grand_total AS val,
           ROW_NUMBER() OVER (ORDER BY o.grand_total) AS rn,
           COUNT(*)     OVER ()                        AS cnt
    FROM orders_m o
  ) x
  WHERE x.rn IN ((x.cnt + 1)/2, (x.cnt + 2)/2)
),
popular AS (
  SELECT TOP (1)
         COALESCE(p.title, oi.title_snapshot) AS most_frequent_product
  FROM dbo.order_items oi
  JOIN orders_m o ON o.id = oi.order_id
  LEFT JOIN dbo.products p ON p.id = oi.product_id
  GROUP BY COALESCE(p.title, oi.title_snapshot)
  ORDER BY SUM(oi.quantity) DESC
),
byday AS (
  SELECT o.d,
         COUNT(DISTINCT o.buyer_key) AS customers
  FROM orders_m o
  GROUP BY o.d
),
mind AS ( SELECT TOP (1) d, customers FROM byday ORDER BY customers ASC,  d ASC ),
maxd AS ( SELECT TOP (1) d, customers FROM byday ORDER BY customers DESC, d ASC )
SELECT
  (SELECT revenue_month         FROM revenue) AS revenue_month,
  (SELECT total_customers       FROM cust)    AS total_customers,
  (SELECT avg_check             FROM checks)  AS avg_check,
  (SELECT median_check          FROM med)     AS median_check,
  (SELECT most_frequent_product FROM popular) AS most_frequent_product,
  (SELECT d         FROM mind) AS min_day_date,
  (SELECT customers FROM mind) AS min_day_customers,
  (SELECT d         FROM maxd) AS max_day_date,
  (SELECT customers FROM maxd) AS max_day_customers;`
	var row summaryRow
	if err := r.db.GetContext(ctx, &row, q); err != nil {
		return Summary{}, err
	}
	out := Summary{
		RevenueMonth:        row.RevenueMonth,
		TotalCustomers:      row.TotalCustomers,
		AvgCheck:            row.AvgCheck,
		MedianCheck:         row.MedianCheck,
		MostFrequentProduct: row.MostFrequentProduct,
	}
	if row.MinDayDate != "" {
		out.MinDay = &DayAgg{Date: row.MinDayDate, Customers: row.MinDayCustomers}
	}
	if row.MaxDayDate != "" {
		out.MaxDay = &DayAgg{Date: row.MaxDayDate, Customers: row.MaxDayCustomers}
	}
	return out, nil
}

func (r *AnalyticsRepo) CustomersByDay(ctx context.Context) ([]DayAgg, error) {
	const q = `
WITH rng AS (
  SELECT DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) AS dfrom,
         DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)) AS dto
)
SELECT
  CONVERT(char(10), o.created_at, 23) AS [date],
  COUNT(DISTINCT COALESCE(CONVERT(nvarchar(50), o.customer_id),
                          LOWER(o.guest_email),
                          o.guest_phone,
                          o.public_id))      AS customers
FROM dbo.orders o
CROSS JOIN rng
WHERE o.created_at >= rng.dfrom AND o.created_at < rng.dto
GROUP BY CONVERT(char(10), o.created_at, 23)
ORDER BY [date];
`
	var rows []DayAgg
	if err := r.db.SelectContext(ctx, &rows, q); err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *AnalyticsRepo) TopProductsThisMonth(ctx context.Context) ([]NameValue, error) {
	const q = `
DECLARE @from date = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
DECLARE @to   date = DATEADD(DAY, 1, EOMONTH(GETDATE()));

WITH items AS (
  SELECT COALESCE(p.title, oi.title_snapshot) AS title,
         CAST(oi.quantity AS int)            AS qty
  FROM dbo.order_items oi
  JOIN dbo.orders o ON o.id = oi.order_id
  LEFT JOIN dbo.products p ON p.id = oi.product_id
  WHERE o.created_at >= @from AND o.created_at < @to
)
SELECT TOP(10)
  title AS label,
  SUM(qty) AS value
FROM items
GROUP BY title
ORDER BY value DESC, label ASC;
`
	var out []NameValue
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *AnalyticsRepo) CompanionsForPopularThisMonth(ctx context.Context) ([]NameValue, error) {
	const q = `
DECLARE @from date = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
DECLARE @to   date = DATEADD(DAY, 1, EOMONTH(GETDATE()));

WITH items AS (
  SELECT o.id AS order_id,
         COALESCE(p.title, oi.title_snapshot) AS title
  FROM dbo.order_items oi
  JOIN dbo.orders o ON o.id = oi.order_id
  LEFT JOIN dbo.products p ON p.id = oi.product_id
  WHERE o.created_at >= @from AND o.created_at < @to
),
popular AS (
  SELECT TOP(1) title
  FROM items
  GROUP BY title
  ORDER BY COUNT(*) DESC
),
co AS (
  SELECT i2.title, COUNT(DISTINCT i1.order_id) AS together_orders
  FROM items i1
  JOIN items i2 ON i1.order_id = i2.order_id AND i2.title <> i1.title
  JOIN popular p ON i1.title = p.title
  GROUP BY i2.title
)
SELECT TOP(10)
  title  AS label,
  together_orders AS value
FROM co
ORDER BY value DESC, label ASC;
`
	var out []NameValue
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *AnalyticsRepo) PairsFrequentThisMonth(ctx context.Context) ([]NameValue, error) {
	const q = `
DECLARE @from date = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
DECLARE @to   date = DATEADD(DAY, 1, EOMONTH(GETDATE()));

WITH items AS (
  SELECT o.id AS order_id,
         COALESCE(p.title, oi.title_snapshot) AS title
  FROM dbo.order_items oi
  JOIN dbo.orders o ON o.id = oi.order_id
  LEFT JOIN dbo.products p ON p.id = oi.product_id
  WHERE o.created_at >= @from AND o.created_at < @to
),
pairs AS (
  SELECT
    CASE WHEN i1.title < i2.title THEN i1.title ELSE i2.title END AS t1,
    CASE WHEN i1.title < i2.title THEN i2.title ELSE i1.title END AS t2,
    i1.order_id
  FROM items i1
  JOIN items i2 ON i1.order_id = i2.order_id AND i1.title <> i2.title
),
agg AS (
  SELECT t1, t2, COUNT(DISTINCT order_id) AS cnt
  FROM pairs
  GROUP BY t1, t2
)
SELECT TOP(10)
  CONCAT(t1, N' + ', t2) AS label,
  cnt AS value
FROM agg
ORDER BY cnt DESC, label ASC;`
	var out []NameValue
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *AnalyticsRepo) PairsRareThisMonth(ctx context.Context) ([]NameValue, error) {
	const q = `
DECLARE @from date = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
DECLARE @to   date = DATEADD(DAY, 1, EOMONTH(GETDATE()));

WITH items AS (
  SELECT o.id AS order_id,
         COALESCE(p.title, oi.title_snapshot) AS title
  FROM dbo.order_items oi
  JOIN dbo.orders o ON o.id = oi.order_id
  LEFT JOIN dbo.products p ON p.id = oi.product_id
  WHERE o.created_at >= @from AND o.created_at < @to
),
pairs AS (
  SELECT
    CASE WHEN i1.title < i2.title THEN i1.title ELSE i2.title END AS t1,
    CASE WHEN i1.title < i2.title THEN i2.title ELSE i1.title END AS t2,
    i1.order_id
  FROM items i1
  JOIN items i2 ON i1.order_id = i2.order_id AND i1.title <> i2.title
),
agg AS (
  SELECT t1, t2, COUNT(DISTINCT order_id) AS cnt
  FROM pairs
  GROUP BY t1, t2
)
SELECT TOP(10)
  CONCAT(t1, N' + ', t2) AS label,
  cnt AS value
FROM agg
WHERE cnt >= 1
ORDER BY cnt ASC, label ASC;`
	var out []NameValue
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *AnalyticsRepo) PaymentMethods(ctx context.Context) ([]KV, error) {
	const q = `
SELECT payment_method AS label, CAST(COUNT(*) AS float) AS value
FROM dbo.orders
WHERE created_at >= DATEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), 1)
GROUP BY payment_method
ORDER BY value DESC;`
	var out []KV
	return out, r.db.SelectContext(ctx, &out, q)
}

func (r *AnalyticsRepo) DeliveryMethods(ctx context.Context) ([]KV, error) {
	const q = `
SELECT delivery_method AS label, CAST(COUNT(*) AS float) AS value
FROM dbo.orders
WHERE created_at >= DATEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), 1)
GROUP BY delivery_method
ORDER BY value DESC;`
	var out []KV
	return out, r.db.SelectContext(ctx, &out, q)
}

func (r *AnalyticsRepo) RevenueByDay(ctx context.Context) ([]DayRevenue, error) {
	const q = `
SELECT CONVERT(char(10), o.created_at, 23) AS d,
       SUM(CAST(o.grand_total AS float))   AS revenue
FROM dbo.orders o
WHERE o.created_at >= DATEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), 1)
GROUP BY CONVERT(char(10), o.created_at, 23)
ORDER BY d;`
	var out []DayRevenue
	return out, r.db.SelectContext(ctx, &out, q)
}
