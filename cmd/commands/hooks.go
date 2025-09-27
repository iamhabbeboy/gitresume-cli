package commands

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"strings"

	"github.com/iamhabbeboy/gitresume/config"
	"github.com/iamhabbeboy/gitresume/internal/ai"
	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/iamhabbeboy/gitresume/internal/git"
	"github.com/iamhabbeboy/gitresume/internal/server"
	"github.com/iamhabbeboy/gitresume/util"
)

type Hook struct {
	config   *config.AppConfig
	database database.IDatabase
}

func SetupHook() error {
	path, err := os.Getwd()
	if err != nil {
		return err
	}
	gitutil := git.NewGitUtil(path)
	user, err := gitutil.GetUserInfo()

	if err != nil {
		return err
	}

	u := struct {
		Name  string `mapstructure:"name"`
		Email string `mapstructure:"email"`
	}{
		Name:  strings.TrimSpace(user.Name),
		Email: strings.TrimSpace(user.Email),
	}

	err = config.AddProject(path, u)
	if err != nil {
		return err
	}

	return nil
}

func SeedHook() error {
	project, _ := os.Getwd()
	db := database.GetInstance()
	defer db.Close()

	conf, _ := config.GetProject(project)
	usrEmail := strings.TrimSpace(conf.Email)

	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits(usrEmail)
	if err != nil {
		return err
	}

	prj := git.Project{
		Name:    filepath.Base(project),
		Path:    project,
		Commits: logs,
	}
	p, err := db.GetProjectByName(prj.Name)
	if err != nil {
		return err
	}

	if p.Path == project {
		return errors.New("project already exists")
	}

	if err = db.Store(prj); err != nil {
		return err
	}
	return nil
}

func DashboardHook() error {
	server.Serve()
	return nil
}

func AiTestHook() error {
	ai := ai.NewChatModel(ai.Llama)
	commits := []string{
		"chore(database): Setup bbolt database to store commit logs",
		"feat(api): Add new endpoint to get commit logs",
	}

	chat := "You are a professional resume writer specializing in software engineering roles. Transform git commit messages into polished resume bullet points that highlight business value and technical achievements. Use action verbs, past tense, focus on impact, and keep concise (1-2 lines max). Output format: Each bullet point according to the input"
	msg := fmt.Sprintf(`Transform this commit message into a resume bullets point and make it concise and non-ai or non-robotic: %s`, util.ToUserContent(commits))
	resp, err := ai.Chat([]string{chat, msg})
	if err != nil {
		return err
	}

	fmt.Println(resp)
	return nil
}
