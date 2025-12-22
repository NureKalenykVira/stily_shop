package handlers

import (
	"net/http"

	"github.com/NureKalenykVira/stily-shop-server/pkg/respond"
)

func Health(w http.ResponseWriter, r *http.Request) {
	respond.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
