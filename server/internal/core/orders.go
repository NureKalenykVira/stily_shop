package core

type OrderCreateItem struct {
	ProductID int64   `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Color     *string `json:"color,omitempty"`
	Size      *string `json:"size,omitempty"`
}

type OrderCreate struct {
	CustomerID *int64 `json:"customer_id,omitempty"`

	Guest struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	} `json:"guest"`

	Delivery struct {
		Method string  `json:"method"` 
		Label  string  `json:"label"`
		Price  float64 `json:"price"`
		PickupPointID   *string `json:"pickup_point_id,omitempty"`
		PickupPointName *string `json:"pickup_point_name,omitempty"`
	} `json:"delivery"`

	Address struct {
		FullName string `json:"full_name"`
		Street   string `json:"street"`
		House    string `json:"house"`
		Flat     string `json:"flat"`
		City     string `json:"city"`
		ZIP      string `json:"zip"`
		Phone    string `json:"phone"`
	} `json:"address"`

	PaymentMethod string            `json:"payment_method"` // "cod" | "card" | "paypal"
	Items         []OrderCreateItem `json:"items"`
}

type OrderCreated struct {
	ID            int64   `json:"id"`
	PublicID      string  `json:"public_id"`
	ItemsTotal    float64 `json:"items_total"`
	DeliveryPrice float64 `json:"delivery_price"`
	GrandTotal    float64 `json:"grand_total"`
	PaymentStatus string  `json:"payment_status"` // pending/paid/refunded
}
