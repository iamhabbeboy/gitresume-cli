package util

import (
	"encoding/json"
	"testing"
)

func TestSlugify(t *testing.T) {
	s := Slugify("Hello World")
	if s != "hello-world" {
		t.Errorf("bad slug: %s", s)
	}
}

func TestToUserContent(t *testing.T) {
	input := []string{"a", "b"}
	if out := ToUserContent(input); out != "a\nb" {
		t.Errorf("expected join with newlines, got: %s", out)
	}
}

func TestGenerateAndVeryHash(t *testing.T) {
	hash, err := GenerateHash("pw")
	if err != nil || hash == "" {
		t.Errorf("GenerateHash failed: %v", err)
	}
	if err := VeryHash([]byte(hash), "pw"); err != nil {
		t.Errorf("VeryHash did not validate: %v", err)
	}
}

func TestConvertNullToSlice(t *testing.T) {
	input, _ := json.Marshal([]string{"x", "y"})
	var out []string
	if err := ConvertNullToSlice(input, &out); err != nil || len(out) != 2 {
		t.Errorf("failed to convert: %v", err)
	}
}
