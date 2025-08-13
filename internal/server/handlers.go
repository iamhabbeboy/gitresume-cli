package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"log"

	// "log"
	"net/http"
	"os"

	"github.com/iamhabbeboy/devcommit/internal/database"
)

//go:embed templates/*.html
var tmplFS embed.FS

var ch = make(chan Response)

type PageData struct {
	Title   string
	Message string
}

type Response struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFS(tmplFS, "templates/index.html")
	if err != nil {
		fmt.Println("Error loading template:", err)
		os.Exit(1)
	}
	data := PageData{
		Title:   "Welcome Page",
		Message: "Hello from Go Template!",
	}
	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func ProjectHandler(w http.ResponseWriter, r *http.Request) {
	go getRecord()
	resp := <-ch
	fmt.Println(resp)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // optional, defaults to 200

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getRecord() {
	db := database.New("projects")
	err, result := db.GetAll()
	resp := Response{
		Message: "nothing to see",
		Status:  "success",
	}

	if err != nil {
		log.Println(err.Error())
		resp.Message = err.Error()
		resp.Status = "error"
		ch <- resp
		return
	}

	j, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
		resp.Status = "error"
		resp.Message = "failed to encode response"
		ch <- resp
		return
	}
	resp.Message = string(j)
	ch <- resp
	return
}
