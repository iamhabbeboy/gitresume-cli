package commands

import (
	"encoding/json"
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

func SetupHook(db database.IDatabase) error {
	if err := db.Migrate(); err != nil {
		return err
	}

	output, err := git.RunGitCommand("", "config", "--global", "--list")
	if err != nil {
		return err
	}
	cfgList := strings.Split(output, "\n")
	userCfg := map[string]string{
		"email": "",
		"name":  "",
	}
	for _, v := range cfgList {
		if strings.Contains(v, "user.name") {
			values := strings.Split(v, "=")
			userCfg["name"] = values[1]
		}
		if strings.Contains(v, "user.email") {
			values := strings.Split(v, "=")
			userCfg["email"] = values[1]
		}
	}

	if userCfg["name"] == "" || userCfg["email"] == "" {
		path, err := os.Getwd()
		if err != nil {
			return err
		}
		gitutil := git.NewGitUtil(path)
		user, err := gitutil.GetUserInfo()

		if err != nil {
			return err
		}

		userCfg["name"] = user.Name
		userCfg["email"] = user.Email
	}

	err = config.SaveConfig(&config.AppConfig{
		User: config.User{
			Name:  userCfg["name"],
			Email: userCfg["email"],
		},
		AiOptions: []config.AiOptions{{
			Name:      "llama",
			Model:     "llama3.2",
			ApiKey:    "",
			IsDefault: true,
		}},
	})

	if err != nil {
		return err
	}

	prf, err := db.GetUser(userCfg["email"])
	if err != nil {
		return err
	}

	if prf.ID == 0 {
		_, err = db.CreateUser(git.Profile{
			Name:         userCfg["name"],
			Email:        userCfg["email"],
			PasswordHash: "admin",
		})

		if err != nil {
			return err
		}
	}

	// create llm config
	llmPrmts := defaultPromptConfig()
	for _, v := range llmPrmts {
		if err := db.CreateOrUpdateLLmPrompt(v); err != nil {
			return fmt.Errorf("failed to create default llm prompt %q: %w", v.Title, err)
		}
	}

	return nil
}

func SeedHook(db database.IDatabase) error {
	if !IsConfigInitialized() {
		return errors.New("configuration not initialized. Run 'gitresume init' before seeding.")
	}
	project, _ := os.Getwd()

	conf, _ := config.GetProject(project)
	usrEmail := strings.TrimSpace(conf.Email)

	gitutil := git.NewGitUtil(project)
	logs, err := gitutil.GetCommits(usrEmail)
	if err != nil {
		return err
	}

	tech, err := gitutil.GetStacks(usrEmail)
	if err != nil {
		return err
	}
	techJSON, _ := json.Marshal(tech)
	prj := git.Project{
		Name:         filepath.Base(project),
		Path:         project,
		Commits:      logs,
		Technologies: string(techJSON),
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
	fmt.Printf("✔ Fetched %v of your commits from %v \n", len(logs), prj.Name)
	fmt.Printf("✔ Extracted contribution details, tech stack, and frameworks \n\n")
	return nil
}

func DashboardHook(db database.IDatabase) error {
	server.Serve(db)
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

func IsConfigInitialized() bool {
	homeDir, _ := os.UserHomeDir()
	folderPath := filepath.Join(homeDir, "."+util.APP_NAME+"/config.yaml")
	_, err := os.Stat(folderPath)
	if os.IsNotExist(err) {
		return false
	}
	return err == nil
}

func defaultPromptConfig() []config.CustomPrompt {
	return []config.CustomPrompt{
		{
			Title:       "project",
			Temperature: 0.5,
			MaxTokens:   400,
			Prompts: newPrompt([]string{
				"You are an HR-trained resume assistant skilled in structuring work experiences for software engineering roles.",
				"Write a concise 3–5 detailed bullet points for professional experiences in software engineering, focusing on measurable achievements: %content%",
			}),
		}, {
			Title:       "summary",
			Temperature: 0.5,
			MaxTokens:   300,
			Prompts: newPrompt([]string{
				"You are an expert technical writer specializing in crafting professional resume summaries for software engineers.",
				"Write a concise 3–5 sentence summary highlighting key programming languages, frameworks, and problem-solving experience for a Software Engineer: %content%",
			}),
		},
	}
}

func newPrompt(cont []string) []config.Prompt {
	return []config.Prompt{
		{Role: string(ai.System), Content: cont[0]},
		{Role: string(ai.User), Content: cont[1]},
	}
}
