package commands

import (
	"context"
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
		AiOptions: []config.AiOptions{
			{
				Name:      string(ai.Llama),
				Model:     "llama3.2",
				ApiKey:    "",
				IsDefault: true,
			},
			{
				Name:      string(ai.OpenAI),
				Model:     "gpt-5-mini",
				ApiKey:    "",
				IsDefault: false,
			},
			{
				Name:      string(ai.Gemini),
				Model:     "gemini-2.5-flash",
				ApiKey:    "",
				IsDefault: false,
			},
		},
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

	prjName := filepath.Base(project)

	p, err := db.GetProjectByName(prjName)
	if err != nil {
		return err
	}

	conf, _ := config.GetProject(project)
	usrEmail := strings.TrimSpace(conf.Email)

	gitutil := git.NewGitUtil(project)

	var logCount int = 0

	var mergeLogs []git.GitCommit
	if len(p.Commits) > 0 {
		// retrieve the new ones
		lastIndex := len(p.Commits) - 1
		lastHash := p.Commits[lastIndex].Hash
		newLogs, err := gitutil.GetCommits(usrEmail, lastHash)
		if err != nil {
			return err
		}
		if len(newLogs) > 0 && newLogs[0].Hash == lastHash {
			newLogs = newLogs[1:]
		}
		if len(newLogs) == 0 {
			fmt.Println("No new commits to update")
			return nil
		}
		logCount = len(newLogs)

		mergeLogs = newLogs
	} else {
		// no previous logs
		allLogs, err := gitutil.GetCommits(usrEmail, "")
		if err != nil {
			return fmt.Errorf("failed to get commits: %w", err)
		}
		if len(allLogs) == 0 {
			return errors.New("no commits available")
		}
		logCount = len(allLogs)
		mergeLogs = allLogs
	}

	tech, err := gitutil.GetStacks(usrEmail)
	if err != nil {
		return err
	}
	techJSON, _ := json.Marshal(tech)
	prj := git.Project{
		Name:         prjName,
		Path:         project,
		Commits:      mergeLogs,
		Technologies: string(techJSON),
	}

	if err = db.CreateProject(prj); err != nil {
		return err
	}
	fmt.Printf("✔ Fetched %v of your commits from %v \n", logCount, prj.Name)
	fmt.Printf("✔ Extracted contribution details, tech stack, and frameworks \n\n")
	return nil
}

func DashboardHook(db database.IDatabase) error {
	server.Serve(db)
	return nil
}

func AiTestHook(db database.IDatabase) error {
	// get the AI config from yaml
	cfg, err := config.LoadConfig()
	if err != nil {
		return err
	}
	if len(cfg.AiOptions) == 0 {
		return fmt.Errorf("LLM config is missing. RUN 'gitresume init'")
	}
	var defaultLLM config.AiOptions
	for _, v := range cfg.AiOptions {
		if v.IsDefault {
			defaultLLM = v
		}
	}

	prmps, err := db.GetLLmPromptConfig()

	if err != nil {
		return err
	}

	if len(prmps) == 0 {
		return fmt.Errorf("custom prompt is empty, kindly run 'gitresume init' ")
	}

	prjPrt := config.CustomPrompt{}
	for _, v := range prmps {
		if v.Title == config.ProjectPrompt {
			prjPrt = v
		}
	}

	// get the prompt and replace
	aiResp := ai.NewChatModel(ai.ModelConfig{
		Type:        ai.ModelType(defaultLLM.Name),
		Model:       defaultLLM.Model,
		Temperature: prjPrt.Temperature,
		MaxToken:    prjPrt.MaxTokens,
		APIKey:      defaultLLM.ApiKey,
	})

	// sample commit messages
	commits := []string{
		"chore(database): Setup bbolt database to store commit logs",
		"feat(api): Add new endpoint to get commit logs",
	}

	newPrompt := []config.Prompt{}
	for _, v := range prjPrt.Prompts {
		nCont := strings.ReplaceAll(v.Content, "%content%", util.ToUserContent(commits))
		newPrompt = append(newPrompt, config.Prompt{
			Role:    v.Role,
			Content: nCont,
		})
	}

	resp, err := aiResp.Chat(context.Background(), newPrompt)
	if err != nil {
		return err
	}

	spl := strings.Join(commits, "\n")
	fmt.Println(fmt.Sprintf("Translated\n%s ", spl))
	output := strings.Join(resp, "\n")
	fmt.Println(fmt.Sprintf("To:\n%s\n", output))
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
			Title:       config.ProjectPrompt,
			Temperature: 0.5,
			MaxTokens:   400,
			Prompts: newPrompt([]string{
				`You are a professional resume writer specializing in software engineering roles.Transform git commit messages into polished, resume-ready bullet points that highlight technical achievements and business impact.Use strong action verbs, past tense, and concise phrasing (1–2 lines max).Do not include any introduction, summary, or explanation. Only return the bullet points, each starting with a "•"`,
				"Transform these commit messages into 3-5 concise resume bullet points: %content%",
			}),
		}, {
			Title:       config.SummaryPrompt,
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
