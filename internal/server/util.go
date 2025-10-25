package server

import (
	"encoding/json"
	"net/http"
)

func JsonResponse(w http.ResponseWriter, data any) {
	res := Response{
		Message: "resume updated successfully",
		Status:  http.StatusCreated,
		Data:    data,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}
