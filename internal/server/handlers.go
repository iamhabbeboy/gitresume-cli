package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"

	"github.com/iamhabbeboy/devcommit/internal/database"
	"github.com/iamhabbeboy/devcommit/internal/git"
	// "github.com/iamhabbeboy/devcommit/util"
)

//go:embed templates/*.html
var tmplFS embed.FS

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
	resp := Response{
		Message: "Hello, World!",
		Status:  "success",
	}

	// // defer db.Close()
	// var project interface{}
	project, err := os.Getwd() // get the current directory
	if err != nil {
		fmt.Println(err)
	}
	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits()
	if err != nil {
		fmt.Println(err)
	}
	var db = database.Init()
	var prj any
	err = db.Save("git-commits", "git-tracker1", logs)
	// key := util.Slugify("/Users/solomon/work/Golang-Project/git-tracker")
	err = db.Get("git-commits", "git-tracker1", prj)
	fmt.Println(err)
	fmt.Println(prj)
	// // Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // optional, defaults to 200

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
