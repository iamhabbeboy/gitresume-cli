package database

import (
	"encoding/json"
	"fmt"
	"log"

	bolt "go.etcd.io/bbolt"
)

type Db struct {
	Db   *bolt.DB
	Name string
}

type KV struct {
	Key   string
	Value string
}

func New(path string, name string) *Db {
	db, err := bolt.Open(path, 0600, nil)
	if err != nil {
		log.Fatal(err)
	}
	return &Db{Db: db, Name: name}
}

func (d *Db) Close() error {
	return d.Db.Close()
}

/*
* Storage approaches
* 1. Key: project name, value: json(array of commits)
* 2. Key: uuid, value: json(array of commits with the project name)
 * 3. Key: uuid, value: single commit
*/
func (d *Db) Store(key string, data any) error {
	buf, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = d.Db.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(d.Name))
		if err != nil {
			return err
		}
		return bucket.Put([]byte(key), buf)
	})
	if err != nil {
		return err
	}
	return nil
}

func (d *Db) GetAll() (error, any) {
	var result []KV
	err := d.Db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(d.Name))
		if b == nil {
			return fmt.Errorf("bucket %s does not exist", d.Name)
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
