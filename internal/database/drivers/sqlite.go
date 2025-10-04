package drivers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"reflect"
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

var uID int64 = 1

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

	return &sqliteDB{conn: db}, nil
}

func (s *sqliteDB) Close() error {
	return s.conn.Close()
}

func (s *sqliteDB) GetUser(email string) (git.Profile, error) {
	var (
		ID   int32
		name string
	)
	err := s.conn.QueryRow("SELECT id, name FROM users WHERE email = ?", email).
		Scan(&ID, &name)

	if err == sql.ErrNoRows {
		return git.Profile{}, nil
	}

	if err != nil {
		return git.Profile{}, err
	}

	return git.Profile{
		ID:   ID,
		Name: name,
	}, nil
}

func (s *sqliteDB) CreateUser(data git.Profile) (int64, error) {
	hash, _ := util.GenerateHash(data.PasswordHash)

	row, err := s.conn.Exec("INSERT INTO users(name, email, password_hash) VALUES(?, ?, ?)", data.Name, data.Email, hash)
	if err != nil {
		return 0, err
	}
	lastID, _ := row.LastInsertId()

	return lastID, nil
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

func (s *sqliteDB) UpsertCommit(commits []git.CustomUpdateCommit) error {
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
	var rows sql.Result

	if len(commits) > 0 {
		f := commits[0]
		prjID := f.ProjectID
		cID := f.GitCommit.ID

		if cID == 0 {
			_, err = tx.Exec(`DELETE FROM commit_summary WHERE project_id = ? AND commit_id IS NULL`, prjID)
			if err != nil {
				return err
			}
		}
	}

	for _, v := range commits {
		var commitID sql.NullInt64
		if v.GitCommit.ID == 0 {
			// commitID = sql.NullInt64{Valid: false}
			rows, err = tx.Exec(`
				INSERT INTO commit_summary (project_id, commit_id, summary, created_at, updated_at)
				VALUES (?, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			`, v.ProjectID, v.GitCommit.Msg)
			if err != nil {
				fmt.Printf("Failed with: %v", err)
			}
		} else {
			commitID = sql.NullInt64{Int64: int64(v.ID), Valid: true}
			rows, err = stmt.Exec(v.ProjectID, commitID, v.Msg)
			if err != nil {
				fmt.Printf("Failed with: %v", err)
			}
		}

		rowsAffected, err := rows.RowsAffected()
		if err != nil {
			_ = tx.Rollback()
			log.Printf("Failed to execute queries : %v", err)
		}
		if rowsAffected == 0 {
			fmt.Printf("⚠️ Record with id=%d does not exist, skipping update\n", v.ID)
		} else {
			fmt.Printf("✅ Updated record id=%d\n", v.ID)
		}
	}

	if err := tx.Commit(); err != nil {
		return err
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

func (s *sqliteDB) CreateResume(r git.Resume) (git.Resume, error) {
	query := `
	   INSERT INTO resumes (user_id, version, title, created_at, updated_at)
	    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) `
	row, err := s.conn.Exec(query, r.UserID, r.Version, r.Title)
	if err != nil {
		return git.Resume{}, err
	}
	id, err := row.LastInsertId()

	if err != nil {
		return git.Resume{}, err
	}

	res := git.Resume{
		ID: id,
	}
	return res, nil
}

func (s *sqliteDB) GetResume(ID int64) (git.Resume, error) {
	var (
		title                string
		skills               sql.NullString
		is_published         bool
		name                 string
		email                string
		phone                sql.NullString
		location             sql.NullString
		links                sql.NullString
		professional_summary sql.NullString

		//education
		education sql.NullString
	)

	query := `SELECT 
			resumes.title,
			resumes.skills,
			resumes.is_published,
			users.name AS user_name,
			users.email,
			users.phone,
			users.location,
			users.professional_summary,
			users.links,
			COALESCE(
				json_group_array(
					json_object(
						'id', educations.id,
						'school', educations.school,
						'degree', educations.degree,
						'start_date', educations.start_date,
						'end_date', educations.end_date
					)
				), '[]'
			) AS educations
		FROM resumes
		LEFT JOIN users ON resumes.user_id = users.id
		LEFT JOIN educations ON resumes.id = educations.resume_id
		WHERE resumes.id = ?
		GROUP BY resumes.id;`

	err := s.conn.QueryRow(query, ID).
		Scan(&title, &skills, &is_published, &name, &email, &phone, &location, &professional_summary, &links, &education)

	if err == sql.ErrNoRows {
		return git.Resume{}, errors.New("record with ID not found")
	}

	if err != nil {
		return git.Resume{}, err
	}

	var sk []string
	_ = util.ConvertNullToSlice([]byte(skills.String), &sk)

	var lk []git.Link
	if skills.Valid {
		_ = json.Unmarshal([]byte(links.String), &lk)
	}

	var edu []git.Education
	_ = util.ConvertNullToSlice([]byte(skills.String), &edu)

	// var wk []git.WorkExperience
	// _ = util.ConvertNullToSlice([]byte(wo.String), &edu)

	return git.Resume{
		ID:              ID,
		Title:           title,
		Skills:          sk,
		IsPublished:     is_published,
		Education:       edu,
		WorkExperiences: []git.WorkExperience{},
		Profile: git.Profile{
			Name:                name,
			Email:               email,
			Location:            location.String,
			Phone:               phone.String,
			Links:               lk,
			ProfessionalSummary: professional_summary.String,
		},
	}, nil
}

func workExperience(c *sql.DB, rID int64, w []git.WorkExperience) error {
	tx, err := c.Begin()
	if len(w) == 0 {
		return errors.New("no work experience found")
	}

	wk := w[0]
	query :=
		"INSERT INTO work_experiences (resume_id, company, role, location, start_date, end_date, responsibilities, is_translated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
	rw, err := tx.Exec(query, rID, wk.Company, wk.Role, wk.Location, wk.StartDate, wk.EndDate, wk.Responsibilities, wk.IsTranslated)

	if err != nil {
		tx.Rollback()
		return err
	}

	lstID, _ := rw.LastInsertId()

	placeholders := make([]string, 0, len(wk.ProjectIDs))
	value := make([]any, 0, len(wk.ProjectIDs)*2)
	for _, v := range wk.ProjectIDs {
		placeholders = append(placeholders, "(?, ?)")
		value = append(value, lstID, v)
	}

	q := fmt.Sprintf("INSERT INTO work_experience_projects (work_experience_id, project_id) VALUES %s",
		strings.Join(placeholders, ","))

	_, err = tx.Exec(q, value...)

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (s *sqliteDB) GetResumes() ([]git.Resume, error) {
	query := `
	SELECT id, title, version, skills, published_at, created_at FROM resumes WHERE user_id = ?
	`
	rows, err := s.conn.Query(query, uID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resumes []git.Resume
	for rows.Next() {
		var (
			title       string
			id          int64
			version     int
			skills      sql.NullString
			publishedAt sql.NullString
			createdAt   string
		)
		if err := rows.Scan(&id, &title, &version, &skills, &publishedAt, &createdAt); err != nil {
			return nil, err
		}
		var skillUn []string
		_ = util.ConvertNullToSlice([]byte(skills.String), &skillUn)
		resumes = append(resumes, git.Resume{
			ID:              id,
			Title:           title,
			Version:         version,
			Skills:          skillUn,
			PublishedAt:     publishedAt.String,
			CreatedAt:       createdAt,
			WorkExperiences: []git.WorkExperience{},
			Education:       []git.Education{},
		})
	}
	return resumes, nil
}

func (s *sqliteDB) GetUserByID(id int32) (git.Profile, error) {
	var (
		ID                  int32
		name                string
		email               string
		phone               sql.NullString
		location            sql.NullString
		professionalSummary sql.NullString
		links               sql.NullString
	)
	err := s.conn.QueryRow("SELECT id, name, email, phone, location, professional_summary, links FROM users WHERE id = ?", id).
		Scan(&ID, &name, &email, &phone, &location, &professionalSummary, &links)

	if err == sql.ErrNoRows {
		return git.Profile{}, nil
	}

	if err != nil {
		return git.Profile{}, err
	}

	var slinks []git.Link
	if links.Valid {
		_ = json.Unmarshal([]byte(links.String), &slinks)
	}

	return git.Profile{
		ID:                  ID,
		Name:                name,
		Email:               email,
		Phone:               phone.String,
		Links:               slinks,
		Location:            location.String,
		ProfessionalSummary: professionalSummary.String,
	}, nil
}

func (s *sqliteDB) UpdateResume(uID int64, req git.Resume) error {
	if !reflect.DeepEqual(req.Profile, git.Profile{}) {
		if err := s.UpdateUser(uID, req.Profile); err != nil {
			return err
		}
	}

	if !reflect.DeepEqual(req.WorkExperiences, git.WorkExperience{}) {
		if err := workExperience(s.conn, uID, req.WorkExperiences); err != nil {
			return err
		}
	}

	// if !reflect.DeepEqual(req.Education, git.Education{}) {
	// 	if edu, err := s.CreateEducation(req.Education); err != nil {
	// 		return err
	// 	}
	// }

	keys := []string{}
	values := []any{}

	if req.Title != "" {
		keys = append(keys, "title = ?")
		values = append(values, req.Title)
	}

	query := fmt.Sprintf("UPDATE resumes SET %v WHERE id = ?", strings.Join(keys, ", "))
	values = append(values, req.ID)

	stmt, err := s.conn.Prepare(query)
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(values...)
	if err != nil {
		return err
	}

	return nil
}

func (s *sqliteDB) UpdateUser(uID int64, req git.Profile) error {
	key := []string{}
	val := []any{}

	if req.Name != "" {
		key = append(key, "name = ?")
		val = append(val, req.Name)
	}

	if req.Location != "" {
		key = append(key, "location = ?")
		val = append(val, req.Location)
	}

	if req.Phone != "" {
		key = append(key, "phone = ?")
		val = append(val, req.Phone)
	}

	if req.ProfessionalSummary != "" {
		key = append(key, "professional_summary = ?")
		val = append(val, req.ProfessionalSummary)
	}

	query := fmt.Sprintf("UPDATE users SET %v WHERE id = ?", strings.Join(key, ", "))

	val = append(val, uID)

	stmt, err := s.conn.Prepare(query)
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(val...)
	if err != nil {
		return err
	}

	return nil
}

func (s *sqliteDB) CreateEducation(data git.Education) (git.Education, error) {
	query := `
	   INSERT INTO educations (resume_id, school, degree, field_of_study, start_date, end_date)
	    VALUES (?, ?, ?, ?, ?, ?) `
	row, err := s.conn.Exec(query, data.ResumeID, data.School, data.Degree, data.FieldOfStudy, data.StartDate, data.EndDate)
	if err != nil {
		return git.Education{}, err
	}
	id, err := row.LastInsertId()

	if err != nil {
		return git.Education{}, err
	}

	res := git.Education{
		ID: id,
	}
	return res, nil
}

func (s *sqliteDB) Delete(key string) error {
	return nil
}

func (s *sqliteDB) Migrate() error {
	schema, err := os.ReadFile("./sql/schema.sql")
	if err != nil {
		return err
	}
	_, err = s.conn.Exec(string(schema))
	if err != nil && !strings.Contains(err.Error(), "already exists") {
		return err
	}

	return nil
}
