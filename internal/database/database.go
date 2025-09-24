package database

import (
	"github.com/iamhabbeboy/gitresume/internal/database/drivers"
	"github.com/iamhabbeboy/gitresume/internal/git"
)

type IDatabase interface {
	GetProjectByName(name string) (git.Project, error)
	Store(data git.Project) error
	GetAllProject() ([]git.Project, error)
	Delete(key string) error
	Close() error
}

type DBName string

var (
	SqliteDB DBName = "sqlite"
	BoltDB   DBName = "bolt"
)

func NewDB(name DBName) (IDatabase, error) {
	switch name {
	case SqliteDB:
		return drivers.NewSqlite()
	case BoltDB:
		return drivers.NewBolt()
	default:
		panic("Unknown database")
	}
}

func GetInstance() IDatabase {
	db, err := NewDB(SqliteDB)
	if err != nil {
		panic(err)
	}
	return db
}
