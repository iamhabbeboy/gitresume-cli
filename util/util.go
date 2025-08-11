package util

import "strings"

func Slugify(s string) string {
	s = strings.ReplaceAll(s, " ", "-")
	// Convert to lowercase
	s = strings.ToLower(s)
	return s
}
