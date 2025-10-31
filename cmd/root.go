// File: main.go (CLI Entry Point)
package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/fatih/color"
	"github.com/iamhabbeboy/gitresume/cmd/commands"
	"github.com/iamhabbeboy/gitresume/config"
	"github.com/iamhabbeboy/gitresume/internal/database"
	"github.com/spf13/cobra"
)

/**
* CLI Entry Point
* gitresume init
* gitresume status
* gitresume summary
* gitresume apply cover-letter --job job.json
* gitresume interview
* gitresume report
* gitresume dashboard
 */

var (
	aiName string
	apiKey string
	model  string
	db     database.IDatabase
)

var errColor = color.New(color.FgRed).SprintFunc()

var rootCmd = &cobra.Command{
	Use:   "gitresume",
	Short: "🚀 Gitresume helps you summarize git activity and prep for job interviews",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if db == nil {
			db = database.GetInstance()
		}
		return nil
	},
}

func init() {
	aiConfigCmd.Flags().StringVar(&aiName, "name", "", "Name of the AI provider (e.g. openai)")
	aiConfigCmd.Flags().StringVar(&apiKey, "api-key", "", "API key for the AI provider")
	aiConfigCmd.Flags().StringVar(&model, "model", "", "A model for the AI provider")

	rootCmd.AddCommand(initCmd)
	rootCmd.AddCommand(seedCmd)
	rootCmd.AddCommand(dashboardCmd)
	aiCmd.AddCommand(aiConfigCmd)
	rootCmd.AddCommand(aiCmd)
	rootCmd.AddCommand(completionCmd)
}

var completionCmd = &cobra.Command{
	Use:   "completion",
	Short: "Generate bash completion scripts",
	Run: func(cmd *cobra.Command, args []string) {
	},
	Hidden: true,
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Add project to your gitresume",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.SetupHook(db)
		if err != nil {
			fmt.Println(errColor("🚫 Error:" + err.Error()))
		}
	},
}

var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Seed your commit messages",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.SeedHook(db)
		if err != nil {
			fmt.Println(errColor("🚫 Failed to add project:", err))
		} else {
			fmt.Println("🎉 Successfully seeded")
		}
	},
}

var dashboardCmd = &cobra.Command{
	Use:   "serve",
	Short: "Web dashboard for your dev report",
	Run: func(cmd *cobra.Command, args []string) {
		commands.DashboardHook(db)
		// if err != nil {
		// 	fmt.Println("Failed to start dashboard server:", err)
		// } else {
		// 	fmt.Println("🚀 Starting server ....")
		// }
	},
}

var aiConfigCmd = &cobra.Command{
	Use:   "config",
	Short: "Configure AI provider credentials",
	RunE: func(cmd *cobra.Command, args []string) error {
		if aiName == "" || apiKey == "" || model == "" {
			return fmt.Errorf(errColor("--name, --api-key, and --model are required"))
		}
		cfg := config.AiOptions{
			Name:      strings.ToLower(aiName),
			ApiKey:    apiKey,
			Model:     model,
			IsDefault: true,
		}
		if err := config.UpdateAIConfig(cfg); err != nil {
			return fmt.Errorf(errColor("🚫 Unable to update config"))
		}
		fmt.Printf("🎉 AI provider '%s' configured successfully \n", aiName)
		return nil
	},
}

var aiCmd = &cobra.Command{
	Use:   "ai",
	Short: "AI integration",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.AiTestHook()
		if err != nil {
			fmt.Println(errColor("Failed to start dashboard server:", err))
		} else {
			fmt.Println("🚀 Done!")
		}
	},
}

//
// var summaryCmd = &cobra.Command{
// 	Use:   "summary",
// 	Short: "Generate summary from last commit",
// 	Run: func(cmd *cobra.Command, args []string) {
// 		summary, err := ai.SummarizeLastCommit()
// 		if err != nil {
// 			fmt.Println("Error:", err)
// 			return
// 		}
// 		fmt.Println("\n--- Summary ---\n", summary)
// 		storage.SaveSummary(summary)
// 	},
// }
//
// var reportCmd = &cobra.Command{
// 	Use:   "weekly",
// 	Short: "Generate weekly dev report",
// 	Run: func(cmd *cobra.Command, args []string) {
// 		report := storage.GenerateWeeklyReport()
// 		fmt.Println("\n--- Weekly Report ---\n", report)
// 	},
// }

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
