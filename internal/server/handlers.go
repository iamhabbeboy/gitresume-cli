package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"strconv"

	"net/http"

	"github.com/iamhabbeboy/gitresume/internal/ai"
	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/iamhabbeboy/gitresume/internal/export"
	"github.com/iamhabbeboy/gitresume/internal/git"
	"github.com/iamhabbeboy/gitresume/util"
)

//go:embed web/dist/*
var templateFS embed.FS

var ch = make(chan Response)
var db = database.GetInstance()

type PageData struct {
	Title   string
	Message string
}

type ProjectResponse struct {
	ID int `json:"id"`
	git.Project
}

type Response struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
	Data    any    `json:"data"`
}

type AiRequest struct {
	Commits []string `json:"commits"`
}

type CommitUpdateRequest struct {
	Data []git.CustomUpdateCommit `json:"data"`
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
	idStr := GetID(w, r.URL.Path)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid project ID", http.StatusBadRequest)
		return
	}

	resp, _ := db.GetAllCommitSummary(id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // optional, defaults to 200
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func ProjectsHandler(w http.ResponseWriter, r *http.Request) {
	go getAllCommits()
	resp := <-ch
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // optional, defaults to 200
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getAllCommits() {
	result, err := db.GetAllProject(0, 0)
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

	// sys := "You are a professional resume writer specializing in software engineering roles. Transform git commit messages into polished resume bullet points that highlight business value and technical achievements. Use action verbs, past tense, focus on impact, and keep concise (1-2 lines max). Output format: Each bullet point according to the input"
	// msg := fmt.Sprintf(`Transform this commit message into a resume bullets point and make it concise and non-ai or non-robotic: %s`, util.ToUserContent(req.Commits))
	sys := "You are a professional resume writer specializing in software engineering roles. Transform git commit messages into polished resume bullet points that highlight business value and technical achievements. Use action verbs, past tense, focus on impact, and keep concise (1-2 lines max). Output format: Single bullet point starting with •"
	msg := fmt.Sprintf(`Transform this commit message into a resume bullet point: %s`, util.ToUserContent(req.Commits))

	ai := ai.NewChatModel(ai.Llama)
	resp, err := ai.Chat([]string{sys, msg})
	if err != nil {
		http.Error(w, err.Error(), http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func BulkUpdateCommitMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CommitUpdateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = db.UpsertCommit(req.Data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := Response{
		Message: "success",
		Status:  http.StatusCreated,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)

}

func CreateResumeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req git.Resume
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// j, _ := json.Marshal(req)
	// fmt.Println(string(j))
	// res, err = db.GetResume(0)
	resume, err := db.CreateResume(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := Response{
		Message: "success",
		Status:  http.StatusCreated,
		Data: struct {
			ID int64 `json:"id"`
		}{
			ID: resume.ID,
		},
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)

}

func GetResumeHandler(w http.ResponseWriter, r *http.Request) {
	idStr := GetID(w, r.URL.Path)
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid project ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.GetResume(int64(userID))
	if err != nil {
		http.Error(w, "error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// res := Response{
	// 	Message: "success",
	// 	Status:  http.StatusCreated,
	// }
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func GetAllResumesHandler(w http.ResponseWriter, r *http.Request) {
	res, err := db.GetResumes()
	if err != nil {
		http.Error(w, "error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// res := Response{
	// 	Message: "success",
	// 	Status:  http.StatusCreated,
	// }
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func UserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req git.Profile
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println(req)
	res := "Hello world"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := GetID(w, r.URL.Path)
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid project ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.GetUserByID(int32(userID))
	if err != nil {
		http.Error(w, "failed to retrieve users: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func UpdateResumeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	idStr := GetID(w, r.URL.Path)
	rID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid project ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	var req git.Resume
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	wkID, err := db.UpdateResume(int64(rID), req)
	if err != nil {
		http.Error(w, "error occured: "+err.Error(), http.StatusBadRequest)
		return
	}

	res := Response{
		Message: "resume updated successfully",
		Status:  http.StatusCreated,
		Data: struct {
			ID int64 `json:"id"`
		}{
			ID: wkID,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func DeleteResumesHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Method)
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	idStr := GetID(w, r.URL.Path)
	rID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid resume ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	if err := db.DeleteResume(int64(rID)); err != nil {
		http.Error(w, "error: "+err.Error(), http.StatusBadRequest)
		return
	}
	res := Response{
		Message: "resume deleted successfully",
		Status:  http.StatusCreated,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func DeleteWorkExperienceHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	idStr := GetID(w, r.URL.Path)
	wkID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid work experience ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	if err := db.DeleteWorkExperience(int64(wkID)); err != nil {
		http.Error(w, "invalid work experience ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	res := Response{
		Message: "work experience deleted successfully",
		Status:  http.StatusCreated,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func CreateOrUpdateWorkExperiencesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	idStr := GetID(w, r.URL.Path)
	rID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid project ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	var req git.Resume
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	wkIDs, err := db.CreateOrUpdateWorkExperiences(int64(rID), req.WorkExperiences)
	if err != nil {
		http.Error(w, "error occured: "+err.Error(), http.StatusBadRequest)
		return
	}

	res := Response{
		Message: "resume updated successfully",
		Status:  http.StatusCreated,
		Data: struct {
			ID []int64 `json:"ids"`
		}{
			ID: wkIDs,
		},
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func ExportResumeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Data string `json:"data"`
	}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query := r.URL.Query()
	etype := query.Get("format")
	var (
		format      export.ExportType
		contentType string
		ext         string
	)
	switch etype {
	case "pdf":
		format = export.PDF
		ext = "pdf"
		contentType = "application/pdf"
	case "md":
		format = export.Markdown
		ext = "md"
		contentType = "text/markdown; charset=utf-8"
	case "docx":
		format = export.Doc
		ext = "docx"
		contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	}
	exp, _ := export.NewExport(format)
	defer exp.Close()
	buf, err := exp.Export(req.Data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=resume.%v", ext))
	// w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	// w.Header().Set("Content-Disposition", "attachment; filename=\"resume.docx\"")
	// w.Header().Set("Content-Transfer-Encoding", "binary")
	// w.Header().Set("Cache-Control", "no-store")

	w.Write(buf)
}
