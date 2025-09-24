// File: main.go (CLI Entry Point)
package cmd

import (
	"fmt"
	"os"

	"github.com/iamhabbeboy/gitresume/cmd/commands"
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

var rootCmd = &cobra.Command{
	Use:   "gitresume",
	Short: "🚀 Gitresume helps you summarize git activity and prep for job interviews",
}

func init() {
	rootCmd.AddCommand(initCmd)
	rootCmd.AddCommand(seedCmd)
	rootCmd.AddCommand(dashboardCmd)
	rootCmd.AddCommand(aiTestCmd)
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
		err := commands.SetupHook()
		if err != nil {
			fmt.Println("🚫 Failed to add project:", err)
		} else {
			fmt.Println("🎉 Project successfully added")
		}
	},
}

var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Seed your commit messages",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.SeedHook()
		if err != nil {
			fmt.Println("🚫 Failed to add project:", err)
		} else {
			fmt.Println("🎉 Successfully seeded")
		}
		// report := storage.GenerateWeeklyReport()
		// fmt.Println("\n--- Weekly Report ---\n", report)
	},
}

var dashboardCmd = &cobra.Command{
	Use:   "serve",
	Short: "Web app dashboard for your dev report",
	Run: func(cmd *cobra.Command, args []string) {
		commands.DashboardHook()
		// if err != nil {
		// 	fmt.Println("Failed to start dashboard server:", err)
		// } else {
		// 	fmt.Println("🚀 Starting server ....")
		// }
	},
}

var aiTestCmd = &cobra.Command{
	Use:   "ai",
	Short: "Test AI integration",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.AiTestHook()
		if err != nil {
			fmt.Println("Failed to start dashboard server:", err)
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
