#!/usr/bin/env bash

SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
target_dir=$(dirname "$(dirname "$(realpath "$0")")")
tmp_dir="$target_dir/tmp"

mkdir -p "$tmp_dir" || exit 1
cd "$tmp_dir" || exit 1

script_filename="clickhouse" # Name of the target binary
script_path="$tmp_dir/$script_filename"

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Check for required dependencies
if ! command_exists bash; then
    echo "Error: bash not found!"
    exit 1
fi

if ! command_exists curl; then
  echo "curl is NOT installed"
  exit 1
fi

# Try to install clickhouse-local to our specific path
install_clickhouse_local() {
  echo -e "[$SCRIPT_NAME] Installing clickhouse-local to $script_path\n"
  
  # First approach: Direct download (most portable)
  echo "Downloading clickhouse binary directly..."
  curl -sL https://clickhouse.com/ | sh &> /dev/null
  
  if [[ -f "$script_path" ]]; then
    chmod +x "$script_path" || { echo "Error: Failed to set execute permission"; return 1; }
    
    # Test that the binary is working
    "$script_path" --version >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "clickhouse binary downloaded successfully to $script_path"
      return 0
    else
      echo "Downloaded binary is not functioning correctly. Trying alternative methods..."
    fi
  fi
  
  # Second approach: Try yum if available
  if command_exists yum; then
    echo "Attempting installation via yum..."
    
    # Create temporary location for package extraction
    pkg_tmp="$tmp_dir/pkg_extract"
    mkdir -p "$pkg_tmp"
    
    if yum install -y yum-utils && \
       yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo && \
       yum install --downloadonly --downloaddir="$pkg_tmp" clickhouse-common-static; then
       
      # Extract the binary from the RPM
      if command_exists rpm2cpio && command_exists cpio; then
        cd "$pkg_tmp"
        rpm_file=$(ls clickhouse-common-static*.rpm 2>/dev/null | head -1)
        if [ -n "$rpm_file" ]; then
          rpm2cpio "$rpm_file" | cpio -idm ./usr/bin/clickhouse 2>/dev/null
          
          if [ -f ./usr/bin/clickhouse ]; then
            cp ./usr/bin/clickhouse "$script_path"
            chmod +x "$script_path"
            echo "clickhouse binary extracted and copied to $script_path"
            cd "$tmp_dir"
            rm -rf "$pkg_tmp"
            return 0
          fi
        fi
      fi
    fi
    
    cd "$tmp_dir"
    rm -rf "$pkg_tmp"
  fi
  
  # Third approach: Try apt if available
  if command_exists apt-get; then
    echo "Attempting installation via apt..."
    
    # Create temporary location for package extraction
    pkg_tmp="$tmp_dir/pkg_extract"
    mkdir -p "$pkg_tmp"
    cd "$pkg_tmp"
    
    if apt-get update && \
       apt-get download clickhouse-common-static; then
       
      # Extract the binary from the DEB
      if command_exists dpkg; then
        deb_file=$(ls clickhouse-common-static*.deb 2>/dev/null | head -1)
        if [ -n "$deb_file" ]; then
          dpkg -x "$deb_file" ./
          
          if [ -f ./usr/bin/clickhouse ]; then
            cp ./usr/bin/clickhouse "$script_path"
            chmod +x "$script_path"
            echo "clickhouse binary extracted and copied to $script_path"
            cd "$tmp_dir"
            rm -rf "$pkg_tmp"
            return 0
          fi
        fi
      fi
    fi
    
    cd "$tmp_dir"
    rm -rf "$pkg_tmp"
  fi
  
  # If we get here, all methods failed
  echo "Failed to install clickhouse-local to $script_path through any method"
  return 1
}

# First check if the binary already exists
if [ -f "$script_path" ]; then
  # Verify it works
  chmod +x "$script_path"
  "$script_path" --version >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "[$SCRIPT_NAME] Using existing clickhouse binary at $script_path"
  else
    # Binary exists but doesn't work, try to reinstall
    install_clickhouse_local || { echo "Failed to install clickhouse-local"; exit 1; }
  fi
else
  # Binary doesn't exist, install it
  install_clickhouse_local || { echo "Failed to install clickhouse-local"; exit 1; }
fi

echo "[$SCRIPT_NAME] Auto-generating settings"
root=$(dirname "$(dirname "$(realpath "$tmp_dir")")")

# Autogenerate settings for all .sql files in directory
for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
  if [ -f "$SQL_FILE" ]; then
    echo "Running: $SQL_FILE"
    "$script_path" --queries-file "$SQL_FILE" > /dev/null || { echo "Failed to generate some settings:" && "$script_path" --queries-file "$SQL_FILE"; exit 1; }
  fi
done

# move across files to where they need to be
mv settings-formats.md "$root/docs/operations/settings" || { echo "Failed to move generated settings-format.md"; exit 1; }
mv settings.md "$root/docs/operations/settings" || { echo "Failed to move generated settings.md"; exit 1; }
mv server_settings.md "$root/docs/operations/server-configuration-parameters/settings.md" || { echo "Failed to move generated server_settings.md"; exit 1; }
cat generated_merge_tree_settings.md >> "$root/docs/operations/settings/merge-tree-settings.md" || { echo "Failed to append MergeTree settings.md"; exit 1; }
cat experimental-settings.md >> "$root/docs/settings/beta-and-experimental-features.md" || { echo "Failed to append experimental settings.md"; exit 1; }
cat beta-settings.md >> "$root/docs/settings/beta-and-experimental-features.md" || { echo "Failed to append beta settings.md"; exit 1; }

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully"

# perform cleanup
rm -rf "$tmp_dir"/{settings-formats.md, settings.md, FormatFactorySettings.h, Settings.cpp, generated_merge_tree_settings.md, experimental-settings.md}
rm -f "$script_path"

echo "[$SCRIPT_NAME] Autogenerating settings completed"
