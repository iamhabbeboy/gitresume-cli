package config

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"sync"
	"time"

	"github.com/spf13/viper"
)

var (
	appConfig *AppConfig
	once      sync.Once
)

type User struct {
	Name  string `mapstructure:"name"`
	Email string `mapstructure:"email"`
}

type Project struct {
	Name      string    `mapstructure:"name"`
	Path      string    `mapstructure:"path"`
	GitName   string    `mapstructure:"git_name"`
	GitEmail  string    `mapstructure:"git_email"`
	CreatedAt time.Time `mapstructure:"created_at"`
}

type AppConfig struct {
	AuthToken     string    `mapstructure:"auth_token"`
	Environment   string    `mapstructure:"environment"`
	User          User      `mapstructure:"user"`
	summaryFormat string    `mapstructure:"summary_format"`
	Features      []string  `mapstructure:"features"`
	Projects      []Project `mapstructure:"projects"`
}

var config AppConfig

func LoadConfig() (AppConfig, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic("Cannot find home directory")
	}

	configDir := filepath.Join(homeDir, ".devcommit")
	configFile := filepath.Join(configDir, "config.yaml")
	currentUser, err := user.Current()

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	// Set defaults
	viper.SetDefault("auth_token", "")
	viper.SetDefault("environment", "dev")
	viper.SetDefault("summary_format", "markdown")
	viper.SetDefault("features", []string{"auto-summary", "log-history"})
	viper.SetDefault("user.name", currentUser.Name)
	viper.SetDefault("user.email", "")

	// Create default config if it doesn't exist
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		err := os.MkdirAll(configDir, os.ModePerm)
		if err != nil {
			return AppConfig{}, nil
			// return err
		}

		err = viper.SafeWriteConfig()
		if err != nil {
			_ = viper.WriteConfigAs(configFile)
		}
	}

	// Read config
	err = viper.ReadInConfig()
	if err != nil {
		return AppConfig{}, nil
	}

	// Unmarshal into struct
	err = viper.Unmarshal(&config)
	if err != nil {
		return AppConfig{}, nil
	}

	return config, nil
}

// SaveConfig writes the AppConfig to disk
func SaveConfig(key string, cfg *AppConfig) error {
	home, _ := os.UserHomeDir()
	configPath := filepath.Join(home, ".devcommit", "config.yaml")

	v := viper.New()
	v.SetConfigType("yaml")
	v.Set("projects", cfg.Projects)

	return v.WriteConfigAs(configPath)
}

func AddProject(path string, user User) error {
	cfg, err := LoadConfig()
	if err != nil {
		return err
	}

	// if !hasGitFolder(path) {
	// 	return fmt.Errorf("path is not a git repository: %s", path)
	// }

	for _, p := range cfg.Projects {
		if p.Path == path {
			return fmt.Errorf("project already exists: %s", path)
		}
	}

	project := Project{
		Path:      path,
		Name:      filepath.Base(path),
		GitName:   user.Name,
		GitEmail:  user.Email,
		CreatedAt: time.Now(),
	}
	cfg.Projects = append(cfg.Projects, project)
	return SaveConfig("projects", &cfg)
}

func hasGitFolder(dir string) bool {
	gitPath := filepath.Join(dir, ".git")
	info, err := os.Stat(gitPath)
	return err == nil && info.IsDir()
}
