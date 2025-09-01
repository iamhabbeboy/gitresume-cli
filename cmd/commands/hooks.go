package commands

import (
	"fmt"
	"os"
	"path/filepath"

	// "path/filepath"
	"strings"

	"github.com/iamhabbeboy/devcommit/config"
	"github.com/iamhabbeboy/devcommit/internal/ai"
	"github.com/iamhabbeboy/devcommit/internal/database"
	"github.com/iamhabbeboy/devcommit/internal/git"
	"github.com/iamhabbeboy/devcommit/internal/server"
	"github.com/iamhabbeboy/devcommit/util"
)

type Hook struct {
	config   *config.AppConfig
	database database.Db
}

// var db = database.New("projects")

func SetupHook() error {
	project, err := os.Getwd() // get the current directory
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
	// cfg, err := config.LoadConfig()
	// if err != nil {
	// 	return err
	// }
	project, err := os.Getwd() // get the current directory
	db := database.GetInstance()
	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits()
	if err != nil {
		return err
	}

	defer db.Close()
	key := util.Slugify(filepath.Base(project))
	err = db.Store(key, logs)
	return nil
}

func DashboardHook() error {
	server.Serve()
	return nil
}

func AiTestHook() error {
	ai := ai.NewLlama()
	resp, err := ai.GetStream("What's the meaning of life?")
	if err != nil {
		return err
	}
	fmt.Println(resp)
	return nil
}
