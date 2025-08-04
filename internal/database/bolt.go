package database

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"

	bolt "go.etcd.io/bbolt"
)

var (
	db       *bolt.DB
	filePath = filepath.Join(os.Getenv("HOME"), ".devcommit", "data.db")
)

func Init() {
	err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm)
	if err != nil {
		log.Fatalf("failed to create db directory: %v", err)
	}

	dbInstance, err := bolt.Open(filePath, 0600, nil)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	db = dbInstance
}

func Close() {
	if db != nil {
		db.Close()
	}
}

func Save(bucketName string, key string, value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return db.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(bucketName))
		if err != nil {
			return err
		}
		return bucket.Put([]byte(key), data)
	})
}

func Load(bucketName string, key string, out any) error {
	return db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(bucketName))
		if bucket == nil {
			return nil // not found
		}
		data := bucket.Get([]byte(key))
		if data == nil {
			return nil // not found
		}
		return json.Unmarshal(data, out)
	})
}

func Delete(bucketName string, key string) error {
	return db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(bucketName))
		if bucket == nil {
			return nil // nothing to delete
		}
		return bucket.Delete([]byte(key))
	})
}
