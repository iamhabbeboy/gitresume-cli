package git

type Resume struct {
	ID              int64             `json:"id"`
	Title           string            `json:"title"`
	Skills          []string          `json:"skills"`
	UserID          int32             `json:"user_id"`
	Version         int               `json:"version"`
	Education       []Education       `json:"education"`
	Profile         Profile           `json:"profile"`
	IsPublished     bool              `json:"is_published"`
	PublishedAt     string            `json:"published_at"`
	WorkExperiences []WorkExperience  `json:"work_experiences"`
	ProjectWorkedOn []ProjectWorkedOn `json:"project_worked_on"`
	Volunteers      []Volunteer       `json:"volunteers"`
	CreatedAt       string            `json:"created_at"`
	UpdatedAt       string            `json:"updated_at"`
}

type Profile struct {
	ID                  int32    `json:"id"`
	Name                string   `json:"name"`
	Email               string   `json:"email"`
	PasswordHash        string   `json:"password_hash"`
	Location            string   `json:"location"`
	Phone               string   `json:"phone"`
	ProfessionalSummary string   `json:"professional_summary"`
	Website             string   `json:"website"`
	Links               []string `json:"links"`
}

type Link struct {
	Name string `json:"name"`
	Key  string `json:"key"`
	Link string `json:"link"`
}

type Education struct {
	ID           int64  `json:"id"`
	ResumeID     int64  `json:"resume_id"`
	School       string `json:"school"`
	Degree       string `json:"degree"`
	FieldOfStudy string `json:"field_of_study"`
	StartDate    string `json:"start_date"`
	EndDate      string `json:"end_date"`
}

type WorkExperience struct {
	ID               int64  `json:"id"`
	Company          string `json:"company"`
	Role             string `json:"role"`
	Location         string `json:"location"`
	StartDate        string `json:"start_date"`
	EndDate          string `json:"end_date"`
	IsTranslated     bool   `json:"is_translated"`
	Projects         string `json:"projects"`
	Responsibilities string `json:"responsibilities"`
}

type Responsibility struct {
	CommitID int    `json:"commit_id"`
	Message  string `json:"message"`
}

type Volunteer struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Link        string `json:"link"`
}

type ProjectWorkedOn struct {
	ID           int64  `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Technologies string `json:"technologies"`
	Link         string `json:"link"`
}
