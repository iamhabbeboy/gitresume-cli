package commands

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/iamhabbeboy/devcommit/config"
	"github.com/iamhabbeboy/devcommit/internal/database"
	"github.com/iamhabbeboy/devcommit/internal/git"
	"github.com/iamhabbeboy/devcommit/internal/server"
	"github.com/iamhabbeboy/devcommit/util"
)

type Hook struct {
	config   *config.AppConfig
	database database.Db
}

var (
	bucketName = "git-commits"
)

var db = database.Init()

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
	if err != nil {
		return err
	}
	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits()
	if err != nil {
		return err
	}

	defer db.Close()
	key := util.Slugify(filepath.Base(project))
	err = db.Save(bucketName, key, logs)
	// var gc []git.GitCommit
	// res := db.Get(bucketName, "commits", &gc)
	// log.Print(res)
	return err
}

func DashboardHook() error {
	server.Serve()
	return nil
}
