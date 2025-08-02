package commands

import (
	// "fmt"
	"os"

	"github.com/iamhabbeboy/devcommit/config"
	"github.com/iamhabbeboy/devcommit/internal/git"
)

type Hook struct {
}

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
		Name:  user.Name,
		Email: user.Email,
	}

	err = config.AddProject(project, u)
	if err != nil {
		return err
	}

	return nil
}
