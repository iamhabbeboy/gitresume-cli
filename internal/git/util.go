package git

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	// "strconv"
	"strings"
)

type GitUtil struct {
	Path string
}

type GitUser struct {
	Name  string
	Email string
}

type GitCommit struct {
	ID        int    `json:"commit_id"`
	Hash      string `json:"hash"`
	Msg       string `json:"message"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CustomUpdateCommit struct {
	ProjectID int `json:"project_id"`
	GitCommit
}

type Project struct {
	ID           int         `json:"id"`
	Name         string      `json:"name"`
	Path         string      `json:"path"`
	Technologies string      `json:"technologies"`
	Commits      []GitCommit `json:"commits"`
}

type TechStack struct {
	Stack     map[string]int  `json:"stack"`
	Framework map[string]bool `json:"framework"`
}

func detectLang(ext string) string {
	techMap := map[string]string{
		".go":   "Go",
		".ts":   "TypeScript",
		".tsx":  "React/TypeScript",
		".js":   "JavaScript",
		".jsx":  "React",
		".py":   "Python",
		".java": "Java",
		".rb":   "Ruby",
		".php":  "PHP",
		".html": "HTML",
		".css":  "CSS",
		".scss": "Sass",
		".sql":  "SQL",
		".json": "JSON",
		".yml":  "YAML",
		".yaml": "YAML",
		".md":   "Markdown",
		".rs":   "Rust",
		".erl":  "Erlang",
		".c":    "C",
		".cpp":  "C++",
	}
	return techMap[ext]
}

func NewGitUtil(path string) *GitUtil {
	return &GitUtil{
		Path: path}
}

func (g *GitUtil) IsGitRepo() bool {
	gitPath := filepath.Join(g.Path, ".git")
	info, err := os.Stat(gitPath)
	return err == nil && info.IsDir()
}

func (g *GitUtil) GetProjectName() string {
	return ""
}

func (g *GitUtil) GetUserInfo() (*GitUser, error) {
	name, err := RunGitCommand(g.Path, "config", "user.name")
	if err != nil {
		return nil, err
	}

	email, err := RunGitCommand(g.Path, "config", "user.email")
	if err != nil {
		return nil, err
	}
	return &GitUser{
		Name:  strings.TrimSpace(name),
		Email: strings.TrimSpace(email),
	}, nil
}

func (g *GitUtil) GetStacks(email string) (TechStack, error) {
	cmd, err := RunGitCommand(g.Path, "log", "--name-only", "--pretty=format:", "--author", email)
	if err != nil {
		return TechStack{}, err
	}

	files := strings.Split(strings.TrimSpace(string(cmd)), "\n")

	techCount := map[string]int{}
	techFramework := map[string]bool{}
	for _, file := range files {
		ext := strings.ToLower(filepath.Ext(file))
		if ext == "" {
			continue
		}

		if lang := detectLang(ext); lang != "" {
			techCount[lang]++
		}
		switch {
		case strings.HasSuffix(file, "package.json"):
			techFramework["Node.js"] = true
		case strings.HasSuffix(file, "next.config.js"):
			techFramework["Next.js"] = true
		case strings.HasSuffix(file, "tailwind.config.js"):
			techFramework["TailwindCSS"] = true
		case strings.HasSuffix(file, "vite.config.js"):
			techFramework["Vite"] = true
		case strings.HasSuffix(file, "angular.json"):
			techFramework["Angular"] = true
		case strings.HasSuffix(file, "requirements.txt"):
			techFramework["Python"] = true
		case strings.HasSuffix(file, "bun.lock"):
			techFramework["Bun"] = true
		case strings.HasSuffix(file, "go.mod"):
			techFramework["Go"] = true
		case strings.HasSuffix(file, "pom.xml"):
			techFramework["Java"] = true
		case strings.HasSuffix(file, "Gemfile"):
			techFramework["Ruby on Rails"] = true
		}
	}

	return TechStack{
		Framework: techFramework,
		Stack:     techCount,
	}, nil
}

func (g *GitUtil) GetCommits(email, lastHash string) ([]GitCommit, error) {
	var logs string
	cmdArgs := []string{"log", "--pretty=format:%h=%s", "--author", email}

	if lastHash != "" {
		cmdArgs = append(cmdArgs, fmt.Sprintf("%s..HEAD", lastHash))
	}
	logs, err := RunGitCommand(g.Path, cmdArgs...)
	if err != nil {
		return nil, err
	}

	var commits []GitCommit
	splt := strings.SplitSeq(logs, "\n")
	for value := range splt {
		log := strings.Split(value, "=")
		if len(log) < 2 {
			continue
		}
		hash := log[0]
		msg := log[1]

		if strings.Contains(msg, "Merge") {
			continue
		}

		stripMsg := strings.Replace(msg, "--author", "", 1)
		stripMsg = strings.TrimSpace(stripMsg)
		commits = append(commits, GitCommit{
			Msg:  stripMsg,
			Hash: hash,
		})
	}
	return commits, nil
}

func RunGitCommand(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	if dir != "" {
		cmd.Dir = dir
	}
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		return "", errors.New(out.String())
	}
	return out.String(), nil
}
