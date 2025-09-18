package commands

import (
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

	"github.com/google/uuid"
)

type Hook struct {
	config   *config.AppConfig
	database database.Db
}

func SetupHook() error {
	project, err := os.Getwd()
	if err != nil {
		return err
	}
	gitutil := git.NewGitUtil(project)
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

	err = config.AddProject(project, u)
	if err != nil {
		return err
	}

	return nil
}

func SeedHook() error {
	project, err := os.Getwd() // get the current directory
	db := database.GetInstance()

	conf, err := config.GetProject(project)
	e := strings.TrimSpace(conf.Email)

	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits(e)
	if err != nil {
		return err
	}

	defer db.Close()

	key := uuid.New().String()
	prj := git.Project{
		Name:    filepath.Base(project),
		Commits: logs,
	}
	err = db.Store(key, prj)
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
