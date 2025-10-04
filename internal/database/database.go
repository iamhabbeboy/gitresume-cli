package database

import (
	"sync"

	"github.com/iamhabbeboy/gitresume/internal/database/drivers"
	"github.com/iamhabbeboy/gitresume/internal/git"
)

var (
	instance IDatabase
	once     sync.Once
)

type IDatabase interface {
	Migrate() error
	Delete(key string) error
	Close() error
	Store(data git.Project) error
	GetResume(ID int64) (git.Resume, error)
	GetResumes() ([]git.Resume, error)
	GetUser(email string) (git.Profile, error)
	CreateUser(data git.Profile) (int64, error)
	GetUserByID(uID int32) (git.Profile, error)
	GetCommitById(id int) (git.GitCommit, error)
	UpdateUser(uID int64, req git.Profile) error
	UpdateResume(uID int64, req git.Resume) error
	CreateResume(r git.Resume) (git.Resume, error)
	GetProjectByName(name string) (git.Project, error)
	UpsertCommit(commits []git.CustomUpdateCommit) error
	GetAllProject(limit, offset int) ([]git.Project, error)
	CreateEducation(data git.Education) (git.Education, error)
	GetAllCommitSummary(projectID int) ([]git.CustomUpdateCommit, error)
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
	once.Do(func() {
		db, err := NewDB(SqliteDB)
		if err != nil {
			panic(err)
		}
		instance = db
	})
	return instance
}
