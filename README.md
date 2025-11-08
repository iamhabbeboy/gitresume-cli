# Gitresume - Resume builder for Developers

`gitresume` is a lightweight command-line tool for building professional developer resumes directly from your Git history using AI. Designed for simplicity, speed, and cross-platform usage.

### Features
- Resume builder for building resume from scratch
- Extract tech stacks & contributions from Git commit history with AI.
- Supports exporting to multiple formats (Markdown, PDF, DOCX).
- Lightweight CLI, no heavy dependencies.
- Cross-platform: Linux, macOS, Windows.
- Easy installation via Homebrew, curl, and Chocolatey (Windows).

### Dependencies
- [Pandoc](https://pandoc.org/installing.html) - Install this package to enable DOCX export.

### Installation

**Mac OSX (Homebrew)**
```bash
$ brew tap iamhabbeboy/homebrew-tap

$ brew install iamhabbeboy/tap/gitresume
```

**Linux**
```bash
$ curl -sL https://raw.githubusercontent.com/iamhabbeboy/gitresume-cli/main/install.sh | bash
```
Or manual installation:

```bash
# Download the binary
$ curl -Lo gitresume-cli.tar.gz https://github.com/iamhabbeboy/gitresume-cli/releases/download/v0.1.0/gitresume-cli_0.1.0_linux_amd64.tar.gz

# Extract and install
tar -xzf gitresume-cli.tar.gz
sudo mv gitresume-cli /usr/local/bin/
rm gitresume-cli.tar.gz
```

**Windows (Chocolatey)**
```bash
$ choco install gitresume
```

Usage

```bash
# Initialize gitresume config
gitresume init

# Add git based project (optional)
gitresume seed

# Startup a local http server to access a simple dashboard to manage your resumes
gitresume serve
```


**Contributing**

Feel free to contribute! If you find a bug, let us know by creating an issue.

Thanks.