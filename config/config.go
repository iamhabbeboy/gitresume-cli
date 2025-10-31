package config

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/spf13/viper"
)

var (
	appConfig *AppConfig
	once      sync.Once
)

type User struct {
	Name  string `yaml:"name"`
	Email string `yaml:"email"`
}

type AppConfig struct {
	AuthToken string      `yaml:"auth_token"`
	User      User        `yaml:"user"`
	AiOptions []AiOptions `mapstructure:"ai_options" yaml:"ai_options" json:"ai_options"`
}

type AiOptions struct {
	Name      string `mapstructure:"name" yaml:"name" json:"name"`
	ApiKey    string `mapstructure:"api_key" yaml:"api_key" json:"api_key"`
	Model     string `mapstructure:"model" yaml:"model" json:"model"`
	IsDefault bool   `mapstructure:"is_default" yaml:"is_default" json:"is_default"`

	// CustomPrompt CustomPrompt `json:"custom_prompt,-"`
}

type AiConfigResponse struct {
	Models       []AiOptions    `json:"models"`
	CustomPrompt []CustomPrompt `json:"custom_prompt"`
}

type CustomPrompt struct {
	ID          int      `json:"id,omitempty"`
	Title       string   `json:"title,omitempty"`
	Model       string   `json:"model"`
	Temperature float32  `json:"temperature"`
	MaxTokens   int      `json:"max_tokens"`
	Prompts     []Prompt `json:"prompts,omitempty"`
}

type Prompt struct {
	Content string `json:"content"`
	Role    string `json:"role"`
}

var config AppConfig

func LoadConfig() (AppConfig, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic("Cannot find home directory")
	}

	configDir := filepath.Join(homeDir, ".gitresume")
	configFile := filepath.Join(configDir, "config.yaml")
	// currentUser, err := user.Current()

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

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
func SaveConfig(cfg *AppConfig) error {
	home, _ := os.UserHomeDir()
	configPath := filepath.Join(home, ".gitresume", "config.yaml")

	v := viper.New()
	v.SetConfigType("yaml")
	if cfg.User.Name != "" && cfg.User.Email != "" {
		v.Set("user.name", cfg.User.Name)
		v.Set("user.email", cfg.User.Email)
	}

	if len(cfg.AiOptions) > 0 {
		v.Set("ai_options", cfg.AiOptions)
	}

	return v.WriteConfigAs(configPath)
}

func GetProject(path string) (User, error) {
	cfg, err := LoadConfig()
	if err != nil {
		return User{}, err
	}
	return cfg.User, nil
}

func UpdateAIConfig(conf AiOptions) error {
	cfg, err := LoadConfig()
	if err != nil {
		return err
	}
	if conf.Model == "" || conf.Name == "" {
		return errors.New("LLM config cannot be empty")
	}
	if cfg.AiOptions == nil {
		cfg.AiOptions = []AiOptions{}
	}
	var isFound bool = false
	if len(cfg.AiOptions) > 0 {
		for i := range cfg.AiOptions {
			if strings.EqualFold(cfg.AiOptions[i].Name, conf.Name) {
				cfg.AiOptions[i].ApiKey = conf.ApiKey
				cfg.AiOptions[i].Model = conf.Model
				cfg.AiOptions[i].IsDefault = conf.IsDefault
				isFound = true
			} else {
				cfg.AiOptions[i].IsDefault = false
			}
		}
	}

	if !isFound {
		cfg.AiOptions = append(cfg.AiOptions, conf)
	}

	if err = SaveConfig(&cfg); err != nil {
		return err
	}
	return nil
}

// func AddProject(path string, user User) error {
// 	cfg, err := LoadConfig()
// 	if err != nil {
// 		return err
// 	}

// 	if !hasGitFolder(path) {
// 		return fmt.Errorf("path is not a git repository: %s", path)
// 	}

// 	cfg.User.Name = user.Name
// 	cfg.User.Email = user.Email

// 	for _, p := range cfg.Projects {
// 		if p.Path == path {
// 			return fmt.Errorf("project already exists: %s", path)
// 		}
// 	}

// 	project := Project{
// 		Path:      path,
// 		Name:      filepath.Base(path),
// 		GitName:   user.Name,
// 		GitEmail:  user.Email,
// 		CreatedAt: time.Now(),
// 	}
// 	cfg.Projects = append(cfg.Projects, project)
// 	return SaveConfig(&cfg)
// }

func hasGitFolder(dir string) bool {
	gitPath := filepath.Join(dir, ".git")
	info, err := os.Stat(gitPath)
	return err == nil && info.IsDir()
}
