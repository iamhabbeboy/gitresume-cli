package git

import "testing"

func TestDetectLang(t *testing.T) {
	if lang := detectLang(".go"); lang != "Go" {
		t.Errorf("expected Go, got %s", lang)
	}
	if lang := detectLang(".js"); lang != "JavaScript" {
		t.Errorf("js failed: %s", lang)
	}
}

// More tests would be done for methods like GetStacks/GetCommits using mocks or fixtures
