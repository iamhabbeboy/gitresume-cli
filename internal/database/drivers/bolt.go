package drivers

import (
	"encoding/json"
	"fmt"
	"strconv"

	"path/filepath"

	"os"

	"github.com/google/uuid"
	"github.com/iamhabbeboy/gitresume/internal/git"
	"github.com/iamhabbeboy/gitresume/util"
	bolt "go.etcd.io/bbolt"
)

const DEV_COMMIT_DB_FILE = "gitresume_bolt.db"

type Db struct {
	Db   *bolt.DB
	Name string
}

type KV struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func NewBolt() (*Db, error) {
	name := util.PROJECT_BUCKET
	store := filepath.Join(os.Getenv("HOME"), ".gitresume", DEV_COMMIT_DB_FILE)
	db, _ := bolt.Open(store, 0600, nil)
	return &Db{Db: db, Name: name}, nil
}

func (d *Db) Close() error {
	return d.Db.Close()
}

func (d *Db) Migrate() error {
	return nil
}

func (c *Db) CreateOrUpdateWorkExperiences(rID int64, w []git.WorkExperience) ([]int64, error) {
	return nil, nil
}

func (c *Db) DeleteWorkExperience(wID int64) error {
	return nil
}

func (s *Db) UpdateResume(uID int64, req git.Resume) (int64, error) {
	return 0, nil
}

func (s *Db) UpdateUser(uID int64, req git.Profile) error {
	return nil
}

func (c *Db) DeleteResume(rID int64) error {
	return nil
}

func (s *Db) GetResumes() ([]git.Resume, error) {
	return nil, nil
}

func (d *Db) GetUser(email string) (git.Profile, error) {
	return git.Profile{}, nil
}

func (d *Db) GetUserByID(uID int32) (git.Profile, error) {
	return git.Profile{}, nil
}

func (d *Db) GetResume(ID int64) (git.Resume, error) {
	return git.Resume{}, nil
}

func (c *Db) DeleteEducation(wID int64) error {
	return nil
}

func (s *Db) CreateOrUpdateEducation(rID int64, data []git.Education) ([]int64, error) {
	return nil, nil
}

func (d *Db) CreateUser(data git.Profile) (int64, error) {
	return 0, nil
}

func (d *Db) CreateResume(r git.Resume) (git.Resume, error) {
	return git.Resume{}, nil
}

func (d *Db) GetProjectByName(name string) (git.Project, error) {
	return git.Project{}, nil
}

func (d *Db) Delete(key string) error {
	err := d.Db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(d.Name))
		err := b.Delete([]byte(key))
		return err
	})

	if err != nil {
		return err
	}
	return nil
}

func (d *Db) GetCommitById(id int) (git.GitCommit, error) {
	return git.GitCommit{}, nil
}

func (s *Db) UpsertCommit(commits []git.CustomUpdateCommit) error {
	return nil
}

func (s *Db) GetAllCommitSummary(projectID int) ([]git.CustomUpdateCommit, error) {
	return nil, nil
}

func (d *Db) Store(data git.Project) error {
	key := uuid.New().String()
	err := d.Db.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(d.Name))
		if err != nil {
			return err
		}
		sub, _ := bucket.CreateBucketIfNotExists([]byte(key))
		sub.Put([]byte("name"), []byte(data.Name))

		for k, v := range data.Commits {
			data, _ := json.Marshal(v)
			index := []byte(fmt.Appendf(nil, "commit:%d", k+1))
			sub.Put(index, []byte(data))
		}
		return nil
	})

	if err != nil {
		return err
	}
	return nil
}

func (d *Db) GetAllProject(limit, offset int) ([]git.Project, error) {
	var results []git.Project

	err := d.Db.View(func(tx *bolt.Tx) error {
		root := tx.Bucket([]byte(d.Name))
		if root == nil {
			return nil // no projects yet
		}

		return root.ForEach(func(k, v []byte) error {
			// k = sub-bucket name (project ID), v = nil since it's a bucket
			if v != nil {
				return nil
			}

			sub := root.Bucket(k)
			if sub == nil {
				return nil
			}

			// get project name
			name := string(sub.Get([]byte("name")))

			// get commits
			var commits []git.GitCommit
			c := sub.Cursor()
			for ck, cv := c.First(); ck != nil; ck, cv = c.Next() {
				if string(ck) == "name" {
					continue
				}
				if len(ck) >= 7 && string(ck[:7]) == "commit:" {
					var commit git.GitCommit
					if err := json.Unmarshal(cv, &commit); err != nil {
						return err
					}
					commits = append(commits, commit)
				}
			}
			_id, _ := strconv.Atoi(string(k))
			results = append(results, git.Project{
				ID:      _id, // 👈 the sub-bucket key (project ID)
				Name:    name,
				Commits: commits,
			})

			return nil
		})
	})

	return results, err
}

func (d *Db) GetAll() (error, []KV) {
	var result []KV
	err := d.Db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(d.Name))
		if b == nil {
			return fmt.Errorf("no project is available")
		}
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			result = append(result, KV{Key: string(k), Value: string(v)})
		}
		return nil
	})
	if err != nil {
		return err, nil
	}
	return nil, result
}
