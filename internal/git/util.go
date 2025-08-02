package git

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
)

type GitUtil struct {
	Path string
}

type GitUser struct {
	Name  string
	Email string
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
