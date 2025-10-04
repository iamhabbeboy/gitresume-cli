CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    professional_summary TEXT,
    links TEXT,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_commits_project_id ON commits(project_id);


CREATE TABLE IF NOT EXISTS commit_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    commit_id INTEGER,
    summary TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (commit_id) REFERENCES commits(id) ON DELETE CASCADE,

    UNIQUE(project_id, commit_id)
);

CREATE INDEX IF NOT EXISTS idx_commit_summary_project_id ON commit_summary(project_id);


CREATE TABLE resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, 
    version INTEGER NOT NULL,
    title TEXT DEFAULT 'Untitled Resume',
    skills TEXT,
    is_published BOOLEAN DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE work_experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    company TEXT,
    role VARCHAR(200),
    location VARCHAR(200),
    start_date DATETIME,
    end_date DATETIME,
    projects TEXT,
    responsibilities TEXT,
    is_translated BOOLEAN DEFAULT 0,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);
CREATE INDEX idx_work_experiences_resume_id ON work_experiences(resume_id);

CREATE TABLE work_experience_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_experience_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    FOREIGN KEY (work_experience_id) REFERENCES work_experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(work_experience_id, project_id)
);
CREATE INDEX idx_work_experience_projects_wid ON work_experience_projects(work_experience_id);
CREATE INDEX idx_work_experience_projects_pid ON work_experience_projects(project_id);


CREATE TABLE educations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    school TEXT,
    degree TEXT,
    field_of_study TEXT,
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);
CREATE INDEX idx_educations_resume_id ON educations(resume_id);


-- Users
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Projects
CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Commits
CREATE TRIGGER IF NOT EXISTS trg_commits_updated_at
AFTER UPDATE ON commits
FOR EACH ROW
BEGIN
    UPDATE commits SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Commit Summaries
CREATE TRIGGER IF NOT EXISTS trg_commit_summary_updated_at
AFTER UPDATE ON commit_summary
FOR EACH ROW
BEGIN
    UPDATE commit_summary SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Resumes
CREATE TRIGGER IF NOT EXISTS trg_resumes_updated_at
AFTER UPDATE ON resumes
FOR EACH ROW
BEGIN
    UPDATE resumes SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
