package util

import (
	"encoding/json"
	// "fmt"
	"reflect"
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
	s := strings.TrimSpace(string(b))
	if s == "" || s == "null" {
		*out = []T{}
		return nil
	}
	var tmp []T
	if err := json.Unmarshal(b, &tmp); err != nil {
		return err
	}

	isEmpty := false
	if len(tmp) == 0 {
		// v := tmp[0]
		// fmt.Println(reflect.DeepEqual(tmp[0], *new(T)))
		if reflect.DeepEqual(tmp[0], *new(T)) {
			isEmpty = true
		}
	}

	if isEmpty {
		*out = []T{}
	} else {
		*out = tmp
	}

	return nil
}
