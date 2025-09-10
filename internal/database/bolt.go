package database

import (
	"encoding/json"
	"fmt"

	// "log"
	"path/filepath"
	"sync"

	"os"

	"github.com/iamhabbeboy/devcommit/internal/git"
	"github.com/iamhabbeboy/devcommit/util"
	bolt "go.etcd.io/bbolt"
)

const DEV_COMMIT_DB_FILE = "devcommit.db"

var (
	instance *Db
	once     sync.Once
)

type Db struct {
	Db   *bolt.DB
	Name string
}

type KV struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func New(name string) *Db {
	store := filepath.Join(os.Getenv("HOME"), ".devcommit", DEV_COMMIT_DB_FILE)
	db, _ := bolt.Open(store, 0600, nil)
	return &Db{Db: db, Name: name}
}

func (d *Db) Close() error {
	return d.Db.Close()
}

func (d *Db) Store(key string, data git.Project) error {
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

func (d *Db) GetAllProject() ([]git.Project, error) {
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

			results = append(results, git.Project{
				ID:      string(k), // 👈 the sub-bucket key (project ID)
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

func GetInstance() *Db {
	once.Do(func() {
		instance = New(util.PROJECT_BUCKET)
	})
	return instance
}
