package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/iamhabbeboy/gitresume/internal/git"
)

func CreateOrUpdateVolunteerHandler(db database.IDatabase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req git.Resume
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		idStr := GetCenterID(w, r.URL.Path)
		rID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid resume ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		ids, err := db.CreateOrUpdateVolunteering(int64(rID), req.Volunteers)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		res := Response{
			Message: "created or updated successfully",
			Status:  http.StatusCreated,
			Data: struct {
				ID []int64 `json:"ids"`
			}{
				ID: ids,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(res)
	}
}

func DeleteVolunteerHandler(db database.IDatabase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := GetCenterID(w, r.URL.Path)
		pID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		if err = db.DeleteVolunteer(int64(pID)); err != nil {
			http.Error(w, "unable to volunteer: "+err.Error(), http.StatusBadRequest)
			return
		}
		res := Response{
			Message: "volunteer deleted successfully",
			Status:  http.StatusCreated,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(res)
	}
}
