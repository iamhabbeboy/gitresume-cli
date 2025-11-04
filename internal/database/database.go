package database

import (
	"sync"

	"github.com/iamhabbeboy/gitresume/config"
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
	CreateProject(data git.Project) error
	GetResume(ID int64) (git.Resume, error)
	GetResumes() ([]git.Resume, error)
	DeleteResume(rID int64) error
	GetUser(email string) (git.Profile, error)
	CreateUser(data git.Profile) (int64, error)
	GetUserByID(uID int32) (git.Profile, error)
	GetCommitById(id int) (git.GitCommit, error)
	UpdateUser(uID int64, req git.Profile) error
	CreateResume(r git.Resume) (git.Resume, error)
	GetProjectByName(name string) (git.Project, error)
	UpsertCommit(commits []git.CustomUpdateCommit) error
	UpdateResume(uID int64, req git.Resume) (int64, error)
	GetAllProject(limit, offset int) ([]git.Project, error)

	DeleteEducation(eID int64) error
	CreateOrUpdateEducation(rID int64, data []git.Education) ([]int64, error)
	GetAllCommitSummary(projectID int) ([]git.CustomUpdateCommit, error)

	DeleteWorkExperience(wID int64) error
	CreateOrUpdateWorkExperiences(rID int64, w []git.WorkExperience) ([]int64, error)

	CreateOrUpdateLLmPrompt(cfg config.CustomPrompt) error
	GetLLmPromptConfig() ([]config.CustomPrompt, error)

	CreateOrUpdateVolunteering(rID int64, v []git.Volunteer) ([]int64, error)
	CreateOrUpdateProjectOn(rID int64, v []git.ProjectWorkedOn) ([]int64, error)
	DeleteProjectWorkedOn(pID int64) error
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
	// return nil
}
