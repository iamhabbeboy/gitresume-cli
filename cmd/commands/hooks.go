package commands

import (
	"log"
	"os"
	"strings"

	"github.com/iamhabbeboy/devcommit/config"
	"github.com/iamhabbeboy/devcommit/internal/database"
	"github.com/iamhabbeboy/devcommit/internal/git"
)

type Hook struct {
}

var (
	bucketName = "git-commits"
)

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
	gitutil := git.NewGitUtil("/Users/solomon/work/Golang-Project/git-tracker")
	logs, err := gitutil.GetCommits()
	if err != nil {
		return err
	}

	database.Init()
	defer database.Close()
	err = database.Save(bucketName, "commits", logs)
	var gc []git.GitCommit
	res := database.Load(bucketName, "commits", &gc)
	log.Print(res)
	return err
}
