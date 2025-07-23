import os

# Path to your Next.js repo (change '.' to absolute path if needed)
ROOT_DIR = "."

# Folders to ignore
IGNORE_DIRS = {"node_modules", ".next", ".git", ".vscode", "dist"}

# Files to ignore
IGNORE_FILES = {"package.json", "package-lock.json", "yarn.lock", ".DS_Store"}

def list_files(base_path):
    for root, dirs, files in os.walk(base_path):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        # Print the current directory
        print(f"\n📂 {os.path.relpath(root, base_path)}")
        # List files excluding ignored ones
        for file in files:
            if file not in IGNORE_FILES:
                print(f"  📄 {file}")

if __name__ == "__main__":
    list_files(ROOT_DIR)
