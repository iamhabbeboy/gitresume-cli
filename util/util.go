package util

import (
	"strings"
)

const APP_NAME = "gitresume"
const PROJECT_BUCKET = "projects"

func Slugify(s string) string {
	s = strings.ReplaceAll(s, " ", "-")
	s = strings.ToLower(s)
	return s
}

func ToUserContent(sentences []string) string {
	return strings.Join(sentences, "\n")
}
