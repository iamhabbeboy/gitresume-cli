package git

import (
	"encoding/json"
	"testing"
)

func TestResumeStructDefaults(t *testing.T) {
	r := Resume{}
	if r.ID != 0 || r.Title != "" || len(r.Skills) != 0 {
		t.Errorf("unexpected default values: %+v", r)
	}
	b, err := json.Marshal(r)
	if err != nil {
		t.Errorf("json marshal failed: %v", err)
	}
	_ = b // no assert, just exercise the tag definitions
}
