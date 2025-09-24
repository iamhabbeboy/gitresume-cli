package drivers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"path/filepath"

	"github.com/iamhabbeboy/gitresume/internal/git"
	"github.com/iamhabbeboy/gitresume/util"

	_ "github.com/mattn/go-sqlite3"
)

const DEV_COMMIT_SQLITE_DB_FILE = "gitresume_sqlite.db"

type sqliteDB struct {
	conn *sql.DB
}

func NewSqlite() (*sqliteDB, error) {
	home, err := os.UserHomeDir()
	dbPath := filepath.Join(home, "."+util.APP_NAME, DEV_COMMIT_SQLITE_DB_FILE)
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	_ = createMigrations(db)

	return &sqliteDB{conn: db}, nil
}

func (s *sqliteDB) Close() error {
	return s.conn.Close()
}

func (s *sqliteDB) Store(data git.Project) error {
	tx, err := s.conn.Begin()
	if err != nil {
		return err
	}
	// store projects
	row, err := tx.Exec("INSERT INTO projects (user_id, name, path) VALUES (?, ?, ?)", 1, data.Name, data.Path)
	if err != nil {
		tx.Rollback()
		return err
	}
	prjID, err := row.LastInsertId()
	// store commits
	placeholders := make([]string, 0, len(data.Commits))
	value := make([]any, 0, len(data.Commits)*2)

	for _, v := range data.Commits {
		placeholders = append(placeholders, "(?, ?)")
		value = append(value, prjID, v.Msg)
	}
	query := fmt.Sprintf(
		"INSERT INTO commits (project_id, msg) VALUES %s",
		strings.Join(placeholders, ","),
	)
	_, err = tx.Exec(query, value...)

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func (s *sqliteDB) GetProjectByName(n string) (git.Project, error) {
	var (
		id   int
		name string
		path string
	)
	err := s.conn.QueryRow("SELECT id, name, path FROM projects WHERE name = ?", n).
		Scan(&id, &name, &path)

	if err == sql.ErrNoRows {
		return git.Project{}, nil
	}

	if err != nil {
		return git.Project{}, err
	}

	return git.Project{Name: name, Path: path}, nil

}

func (s *sqliteDB) GetAllProject() ([]git.Project, error) {
	query := `
    SELECT 
       p.id AS id,
       p.name AS name,
       JSON_GROUP_ARRAY(
         JSON_OBJECT(
            'commit_id', c.id,
            'message', c.msg,
            'created_at', c.created_at
         )
       ) AS commits
    FROM projects p
    LEFT JOIN commits c
      ON p.id = c.project_id
    GROUP BY p.id, p.name;
  `
	rows, err := s.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var projects []git.Project
	for rows.Next() {
		var project git.Project
		var commitJSON string
		err := rows.Scan(&project.ID, &project.Name, &commitJSON)
		if err != nil {
			return nil, err
		}
		if commitJSON != "" {
			var commits []git.GitCommit
			if err := json.Unmarshal([]byte(commitJSON), &commits); err != nil {
				return nil, err
			}
			project.Commits = commits
		}
		projects = append(projects, project)
	}
	return projects, nil
}

func (s *sqliteDB) Delete(key string) error {
	return nil
}

func createMigrations(db *sql.DB) error {
	schema, err := os.ReadFile("./sql/schema.sql")
	if err != nil {
		return err
	}
	_, err = db.Exec(string(schema))
	if err != nil {
		return err
	}
	return nil
}
