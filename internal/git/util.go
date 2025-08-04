package git

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
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
	Timestamp int64  `json:"timestamp"`
	Msg       string `json:"msg"`
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
	name, err := runGitCommand(g.Path, "config", "user.name")
	if err != nil {
		return nil, err
	}

	email, err := runGitCommand(g.Path, "config", "user.email")
	if err != nil {
		return nil, err
	}
	return &GitUser{Name: name, Email: email}, nil
}

func (g *GitUtil) GetCommits() ([]GitCommit, error) {
	// git log --pretty=format:"%h - %at - %an: %s" --author="iamhabbeboy"
	logs, err := runGitCommand(g.Path, "log", "--pretty=format:%at=%s --author=iamhabbeboy")
	if err != nil {
		return nil, err
	}
	var commits []GitCommit
	splt := strings.Split(logs, "\n")
	for _, value := range splt {
		log := strings.Split(value, "=")
		timestampStr := log[0]
		msg := log[1]

		timestampInt, err := strconv.ParseInt(timestampStr, 10, 64)
		if err != nil {
			return nil, err
		}
		commits = append(commits, GitCommit{
			Timestamp: timestampInt,
			Msg:       msg,
		})
	}
	return commits, nil
}

func runGitCommand(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		return "", errors.New(out.String())
	}
	return out.String(), nil
}
