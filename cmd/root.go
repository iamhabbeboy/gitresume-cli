// File: main.go (CLI Entry Point)
package cmd

import (
	"fmt"
	"os"

	"github.com/iamhabbeboy/devcommit/cmd/commands"
	"github.com/spf13/cobra"
)

/**
* CLI Entry Point
* devcommit init
* devcommit status
* devcommit summary
* devcommit apply cover-letter --job job.json
* devcommit interview
* devcommit report
* devcommit dashboard
 */

var rootCmd = &cobra.Command{
	Use:   "devcommit",
	Short: "🚀 DevCommit helps you summarize git activity and prep for job interviews",
}

func init() {
	rootCmd.AddCommand(initCmd)
	// rootCmd.AddCommand(summaryCmd)
	// rootCmd.AddCommand(reportCmd)
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Add project to your devcommit",
	Run: func(cmd *cobra.Command, args []string) {
		err := commands.SetupHook()
		if err != nil {
			fmt.Println("Failed to add project:", err)
		} else {
			fmt.Println("Successfully added")
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
