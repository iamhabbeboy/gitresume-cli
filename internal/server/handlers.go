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
	"github.com/iamhabbeboy/devcommit/internal/git"
	"github.com/iamhabbeboy/devcommit/util"
	// "github.com/iamhabbeboy/devcommit/util"
)

//go:embed templates/*.html
var tmplFS embed.FS

var ch = make(chan Response)
var db = database.New(util.PROJECT_BUCKET)

type PageData struct {
	Title   string
	Message string
}

type ProjectResponse struct {
	ProjectName string          `json:"project_name"`
	Commits     []git.GitCommit `json:"commits"`
}

type Response struct {
	Message string            `json:"message"`
	Status  string            `json:"status"`
	Data    []ProjectResponse `json:"data"`
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
	go getAllCommits()
	resp := <-ch
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // optional, defaults to 200

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getAllCommits() {
	err, result := db.GetAll()
	resp := Response{
		Message: "nothing to see",
		Status:  "success",
	}
	var data []ProjectResponse
	var commits []git.GitCommit
	if len(result) > 0 {
		for _, v := range result {
			_ = json.Unmarshal([]byte(v.Value), &commits)
			data = append(data, ProjectResponse{
				ProjectName: v.Key,
				Commits:     commits,
			})
		}
	}

	if err != nil {
		log.Println(err.Error())
		resp.Message = err.Error()
		resp.Status = "error"
		ch <- resp
		return
	}

	resp.Message = "success"
	resp.Data = data
	ch <- resp
	return
}
