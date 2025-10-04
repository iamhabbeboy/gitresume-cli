package server

import (
	"encoding/json"
	"net/http"

	"github.com/iamhabbeboy/gitresume/internal/git"
)

func GetEducationHandler(w http.ResponseWriter, r *http.Request) {
	// JsonResponse(w, )
}

func CreateEducationHandler(w http.ResponseWriter, r *http.Request) {
	var req git.Education
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// err = db.CreateEducation(req)

	// JsonResponse(w, )

}

func DeleteEducationHandler(w http.ResponseWriter, r *http.Request) {

}

func UpdateEducationHandler(w http.ResponseWriter, r *http.Request) {

}
