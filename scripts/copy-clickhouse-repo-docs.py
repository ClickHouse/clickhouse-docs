#!/usr/bin/env python3
import argparse
import os
import json
import sys

def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    description="Script to copy docs from ClickHouse/ClickHouse repo. If arg --local is provided it copies docs"
                "from a local repository. Otherwise, it fetches them from the master branch.",
  )
  parser.add_argument(
    "--local",
    default=None,
    help="Provide a path to a copy of the ClickHouse (ClickHouse/ClickHouse) repository stored locally.",
  )
  return parser.parse_args()

def validate_local(path_to_local):
  if os.path.exists(path_to_local+"/docs"):
    return
  else:
    raise Exception("Please provide a valid path to your local ClickHouse repository.")

def copy_docs_locally(local_path):
  validate_local(local_path) # throw an exception if path is invalid
  with open('package.json', 'r') as package_json:
    package = json.load(package_json)
    docs_folders_en = package["config"]["prep_array_en"].split()
    docs_folders_other = package["config"]["prep_array_root"].split()
    files_for_autogen_settings = package["config"]["autogen_needed_files"]
  print(f"Copying docs from {local_path} ...")
  try:
    for folder in docs_folders_en:
      full_path = f"{local_path}/{folder}"
      os.system(f"rsync -a {full_path} docs/en")
    for folder in docs_folders_other:
      full_path = f"{local_path}/{folder}"
      os.system(f"rsync -a {full_path} docs/")
    for source_file in files_for_autogen_settings:
      os.system(f"rsync -a ClickHouse/{source_file} scripts/tmp")
    os.system(f"rsync -a ClickHouse/CHANGELOG.md scripts/tmp")
  except Exception as e:
    print(e)
    sys.exit(1)
  else:
    return

if __name__ == "__main__":
  args = parse_args()

  # previously called "prep-from-local"
  if args.local is not None:
    copy_docs_locally(args.local)
    print("Successfully executed local copy")
    sys.exit(0)

  # previously called "prep-from-master"
  if os.path.exists("ClickHouse"):
    os.system("rm -rf ClickHouse")
  os.system("git clone --depth 1 --branch master https://github.com/ClickHouse/ClickHouse")
  copy_docs_locally(os.path.abspath(os.path.join(__file__ ,"../..")))
  os.system("rm -rf ClickHouse")
  print("Successfully executed copy from master")
