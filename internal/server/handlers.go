package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"

	"net/http"

	"github.com/iamhabbeboy/gitresume/internal/ai"
	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/iamhabbeboy/gitresume/internal/git"
	"github.com/iamhabbeboy/gitresume/util"
)

//go:embed web/dist/*
var templateFS embed.FS

var ch = make(chan Response)

type PageData struct {
	Title   string
	Message string
}

type ProjectResponse struct {
	ID int `json:"id"`
	git.Project
}

type Response struct {
	Message string            `json:"message"`
	Status  int               `json:"status"`
	Data    []ProjectResponse `json:"data"`
}

type AiRequest struct {
	Commits []string `json:"commits"`
}

var assetsFS fs.FS
var dist fs.FS
var tmpl *template.Template

func InitReactHandler() {
	tmpl = template.Must(template.ParseFS(templateFS, "web/dist/*.html"))
	assetsFS, _ = fs.Sub(templateFS, "web/dist/assets")

	dist, err = fs.Sub(templateFS, "web/dist")
	if err != nil {
		panic(fmt.Errorf("failed to load dist: %w", err))
	}
}

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "index.html", nil)
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
	db := database.GetInstance()

	result, err := db.GetAllProject()
	resp := Response{
		Message: "nothing to see",
		Status:  http.StatusOK,
	}
	var data []ProjectResponse

	if len(result) > 0 {
		for _, v := range result {
			data = append(data, ProjectResponse{
				ID:      v.ID,
				Project: git.Project{Name: v.Name, Commits: v.Commits},
			})
		}
	}

	if err != nil {
		log.Println(err.Error())
		resp.Message = err.Error()
		resp.Status = http.StatusInternalServerError
		ch <- resp
		return
	}

	resp.Message = "success"
	resp.Data = data
	ch <- resp
	return
}

func AiHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req AiRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	chat := "You are a professional resume writer specializing in software engineering roles. Transform git commit messages into polished resume bullet points that highlight business value and technical achievements. Use action verbs, past tense, focus on impact, and keep concise (1-2 lines max). Output format: Each bullet point according to the input"
	msg := fmt.Sprintf(`Transform this commit message into a resume bullets point and make it concise and non-ai or non-robotic: %s`, util.ToUserContent(req.Commits))

	ai := ai.NewChatModel(ai.Llama)
	resp, err := ai.Chat([]string{chat, msg})
	if err != nil {
		http.Error(w, err.Error(), http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
