package drivers

import (
	"database/sql"
	"fmt"
	"log"
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
	home, _ := os.UserHomeDir()
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
	prjID, _ := row.LastInsertId()
	// store commits
	placeholders := make([]string, 0, len(data.Commits))
	value := make([]any, 0, len(data.Commits)*2)

	for _, v := range data.Commits {
		placeholders = append(placeholders, "(?, ?)")
		value = append(value, prjID, v.Msg)
	}
	query := fmt.Sprintf(
		"INSERT INTO commits (project_id, message) VALUES %s",
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

func (s *sqliteDB) BulkUpdateCommit(commits []git.CustomUpdateCommit) error {
	tx, err := s.conn.Begin()
	if err != nil {
		return err
	}
	query := `
	   INSERT INTO commit_summary (project_id, commit_id, summary, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(project_id, commit_id)
        DO UPDATE SET 
            summary = excluded.summary,
            updated_at = CURRENT_TIMESTAMP;
	`
	stmt, err := tx.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, v := range commits {
		var commitID sql.NullInt64
		if v.ID == 0 {
			commitID = sql.NullInt64{Valid: false}
		} else {
			commitID = sql.NullInt64{Int64: int64(v.ID), Valid: true}
		}
		res, err := stmt.Exec(v.ProjectID, commitID, v.Msg)
		if err != nil {
			_ = tx.Rollback()
			log.Fatal(err)
		}
		rowsAffected, err := res.RowsAffected()
		if err != nil {
			_ = tx.Rollback()
			log.Fatal(err)
		}
		if rowsAffected == 0 {
			fmt.Printf("⚠️ Record with id=%d does not exist, skipping update\n", v.ID)
		} else {
			fmt.Printf("✅ Updated record id=%d\n", v.ID)
		}
	}
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return nil
}

func (s *sqliteDB) GetCommitById(id int) (git.GitCommit, error) {
	var (
		msg string
	)
	err := s.conn.QueryRow("SELECT message FROM projects WHERE id = ?", id).
		Scan(&msg)

	if err == sql.ErrNoRows {
		return git.GitCommit{}, nil
	}

	if err != nil {
		return git.GitCommit{}, err
	}

	return git.GitCommit{
		Msg: msg,
	}, nil
}

func (s *sqliteDB) GetAllCommitSummary(prjID int) ([]git.CustomUpdateCommit, error) {
	query := `
		SELECT id, summary, created_at FROM commit_summary WHERE project_id = ?
	`
	rows, err := s.conn.Query(query, prjID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []git.CustomUpdateCommit
	for rows.Next() {
		var (
			summary   string
			id        int
			createdAt string
		)
		if err := rows.Scan(&id, &summary, &createdAt); err != nil {
			return nil, err
		}
		summaries = append(summaries, git.CustomUpdateCommit{
			ProjectID: id,
			GitCommit: git.GitCommit{
				Msg:       summary,
				CreatedAt: createdAt,
			},
		})
	}

	return summaries, nil
}

func (s *sqliteDB) GetAllProject(limit, offset int) ([]git.Project, error) {
	query := `
	SELECT 
		p.id AS project_id,
		p.name AS project_name,
		c.id AS commit_id,
		c.message,
		c.created_at,
		c.updated_at
	FROM projects p
	LEFT JOIN commits c
    ON p.id = c.project_id;
	`
	rows, err := s.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projectsMap := make(map[int]*git.Project)

	for rows.Next() {
		var (
			projectID        int
			projectName      string
			commitID         sql.NullInt64
			commitMsg        sql.NullString
			commitDate       sql.NullString
			commitUpdateDate sql.NullString
		)
		err := rows.Scan(&projectID, &projectName, &commitID, &commitMsg, &commitDate, &commitUpdateDate)
		if err != nil {
			return nil, err
		}

		if _, exists := projectsMap[projectID]; !exists {
			projectsMap[projectID] = &git.Project{
				ID:      projectID,
				Name:    projectName,
				Commits: []git.GitCommit{},
			}
		}
		if commitID.Valid {
			projectsMap[projectID].Commits = append(
				projectsMap[projectID].Commits,
				git.GitCommit{
					ID:        int(commitID.Int64),
					Msg:       commitMsg.String,
					CreatedAt: commitDate.String,
					UpdatedAt: commitUpdateDate.String,
				},
			)
		}
	}

	var projects []git.Project
	for _, p := range projectsMap {
		projects = append(projects, *p)
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
