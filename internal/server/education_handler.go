package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/iamhabbeboy/gitresume/internal/git"
)

func CreateOrUpdateEducationHandler(db database.IDatabase) http.HandlerFunc {
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

		idStr := GetID(w, r.URL.Path)
		rID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid work experience ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		ids, err := db.CreateOrUpdateEducation(int64(rID), req.Education)
		if err != nil {
			http.Error(w, "error occured: "+err.Error(), http.StatusBadRequest)
			return
		}

		res := struct {
			ID []int64 `json:"ids"`
		}{
			ID: ids,
		}
		JsonResponse(w, res)
	}
}

func DeleteEducationHandler(db database.IDatabase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := GetID(w, r.URL.Path)
		eID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid work experience ID: "+err.Error(), http.StatusBadRequest)
			return
		}
		if err = db.DeleteEducation(int64(eID)); err != nil {
			http.Error(w, "unable to delete education: "+err.Error(), http.StatusBadRequest)
			return
		}
		res := Response{
			Message: "education deleted successfully",
			Status:  http.StatusCreated,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(res)
	}
}
