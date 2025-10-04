package util

import (
	"encoding/json"
	"strings"

	"golang.org/x/crypto/bcrypt"
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

func GenerateHash(pwdStr string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(pwdStr), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func VeryHash(hash []byte, pwdStr string) error {
	err := bcrypt.CompareHashAndPassword(hash, []byte(pwdStr))
	if err != nil {
		return nil
	}
	return nil
}

func ConvertNullToSlice[T any](b []byte, out *[]T) error {
	if len(b) == 0 || string(b) == "null" {
		*out = []T{}
		return nil
	}

	var tmp []T
	if err := json.Unmarshal(b, &tmp); err != nil {
		return err
	}
	*out = tmp
	return nil
}
