# Project variables
BINARY_NAME := gitresume
MAIN_FILE := ./main.go
INSTALL_PATH := /usr/local/bin
BUILD_DIR=bin
APP_NAME := gitresume
VERSION := 0.0.1
LDFLAGS  := -ldflags="-s -w -X 'main.version=$(VERSION)'"

TARGETS := linux darwin windows
CURRENT_OS := $(shell go env GOOS)
CURRENT_ARCH := $(shell go env GOARCH)

.PHONY: all build run clean test lint
# Win: brew install mingw-w64
# Linux: brew install FiloSottile/musl-cross/musl-cross

## Build the binary
build: build-react
	@echo "Building for targets: $(TARGETS)"
	@mkdir -p $(BUILD_DIR)
	@for target in $(TARGETS); do \
		output="$(BUILD_DIR)/$(APP_NAME)-$$target"; \
		if [ "$$target" = "windows" ]; then \
			output="$$output.exe"; \
		fi; \
		if [ "$$target" = "$(CURRENT_OS)" ]; then \
			output="$(BUILD_DIR)/$(APP_NAME)"; \
		fi; \
		echo "→ Building for $$target..."; \
		if [ "$$target" = "linux" ]; then \
			CC=x86_64-linux-musl-gcc CGO_ENABLED=1 GOOS=$$target GOARCH=$(CURRENT_ARCH) go build -tags "sqlite" -ldflags '-linkmode external -extldflags "-static"' -o "$$output" . || exit 1; \
		elif [ "$$target" = "windows" ]; then \
			echo "   (using MinGW for Windows CGO build)"; \
			CC=x86_64-w64-mingw32-gcc CGO_ENABLED=1 GOOS=windows GOARCH=amd64 go build -tags "sqlite" -o "$$output" . || exit 1; \
		else \
			CGO_ENABLED=0 GOOS=$$target GOARCH=$(CURRENT_ARCH) go build -o "$$output" . || exit 1; \
		fi; \
	done
	@echo "✅ All builds completed."
	@echo "✅ Build complete: $(BUILD_DIR)/$(TARGETS)"

# clean:
# 	@echo "Cleaning build directory..."
# 	@rm -rf $(BUILD_DIR)

## Build the binary
# 	@echo "✅ All builds completed."
# 	@echo "✅ Build complete: $(BUILD_DIR)/$(BINARY_NAME)"
# 	@echo "📦 Installing to $(INSTALL_PATH)..."
# 	cp bin/$(BINARY_NAME) /usr/local/bin
# 	@cp $(BUILD_DIR)/$(BINARY_NAME) $(INSTALL_PATH)

## Run the project (without building)
run:
	@echo "Running..."
	go run $(MAIN_FILE)

## Build the React app 
build-react:
	@echo "Building React app..."
	cd internal/server/web && bun run build
## Run the built binary
start: build
	@echo "Starting binary..."
	./usr/local/bin/$(BINARY_NAME)

## Run tests
test:
	@echo "Running tests..."
	go test ./... -v

## Format code
fmt:
	@echo "Formatting code..."
	go fmt ./...

## Run linter (requires golangci-lint installed)
lint:
	@echo "Linting code..."
	golangci-lint run

## Clean build files
clean:
	@echo "Cleaning..."
	rm -rf bin

## Build and run (shortcut)
dev: build start

