# Project variables
BINARY_NAME := gitresume
MAIN_FILE := ./main.go

.PHONY: all build run clean test lint

## Build the binary
build:
	@echo "Building..."
	go build -o bin/$(BINARY_NAME) $(MAIN_FILE)
	cp bin/$(BINARY_NAME) /usr/local/bin

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

