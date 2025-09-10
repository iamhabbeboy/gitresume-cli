package commands

import (
	"fmt"
	"os"
	"path/filepath"

	"strings"

	"github.com/iamhabbeboy/devcommit/config"
	"github.com/iamhabbeboy/devcommit/internal/ai"
	"github.com/iamhabbeboy/devcommit/internal/database"
	"github.com/iamhabbeboy/devcommit/internal/git"
	"github.com/iamhabbeboy/devcommit/internal/server"
	// "github.com/iamhabbeboy/devcommit/util"

	"github.com/google/uuid"
)

type Hook struct {
	config   *config.AppConfig
	database database.Db
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
	// fmt.Println(key)
	// fmt.Println(prj)
	// key := util.Slugify(filepath.Base(project))
	err = db.Store(key, prj)
	return nil
}

func DashboardHook() error {
	server.Serve()
	return nil
}

func AiTestHook() error {
	ai := ai.NewLlama()

	// commits := []string{
	// 	"chore(api): integrate api with the frontend, listing the commit messages --author",
	// 	"fix(db-integration): delete the old db file, handle error gracefully --author",
	// 	"chore(db-integration): Implement bolt db instance --author",
	// }
	//
	// 	prompt := fmt.Sprintf(`You are an expert technical recruiter helping a software engineer write their resume.I will provide you with a JSON array of git commit messages. Your task is to transform them into polished, professional resume bullet points that highlight achievements and impact.
	// Guidelines:
	// - Use strong action verbs (e.g., Developed, Implemented, Optimized).
	// - Merge related commits into one bullet if possible.
	// - Reframe 'fix bug' → 'Resolved issue' with outcome/impact.
	// - Each bullet should be 1–2 sentences.
	// - Return results in JSON, preserving the original commit.
	//
	// Example:
	// Input: ['fix bug in payment gateway API']
	// Output:
	// [
	//   {
	//     \"commit\": \"fix bug in payment gateway API\",
	//     \"resume_bullet\": \"Resolved a critical issue in the payment gateway API, ensuring reliable transactions and reducing failed payments by 20%.\"
	//   }
	// ]
	//
	// Now transform this array: %v
	// 	`, commits)

	test := `You are helping a developer write a resume from git commit messages.
For each commit, create TWO versions:
1. summary_bullet → short, simple, 1-sentence resume bullet.
2. impact_bullet → more detailed, impact-focused resume bullet (can include metrics if implied).

Guidelines:
- Keep summary_bullet concise and direct.
- Keep impact_bullet professional and slightly more comprehensive.
- Output strictly as JSON.

Example:
Input: ['fix bug in login page']
Output:
[
  {
    \"commit\": \"fix bug in login page\",
    \"summary_bullet\": \"Fixed a login issue to ensure smooth authentication.\",
    \"impact_bullet\": \"Resolved a critical login issue, ensuring smooth authentication and improving overall user experience.\"
  }
]

Now transform this array:

[\"fix bug in iOS app\",
 \"Refactored code for better maintainability\",
 \"Improved performance by reducing cache size\"]
`

	resp, err := ai.GetStream(test)
	if err != nil {
		return err
	}
	fmt.Println(resp)
	return nil
}
