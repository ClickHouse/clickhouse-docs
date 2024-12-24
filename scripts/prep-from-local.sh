#! ./bin/bash

# Due to the fact that some of the documentation content is stored on the main repo at ClickHouse/ClickHouse
# this script is used to copy across those documents to ClickHouse/clickhouse-docs from a local copy of the
# repo. To use it provide the path to ClickHouse/ClickHouse locally as a command line argument.
# eg: yarn prep-from-local "home/users/Desktop/ClickHouse"

array_root=($npm_package_config_prep_array_root)
array_en=($npm_package_config_prep_array_en)
error_flag=0

# Check if any arguments were provided
if [ $# -eq 0 ]; then
  echo -e "\033[0;31mError: No path for ClickHouse provided as command-line argument. \033[0m \neg: yarn prep-from-local \"/home/user/Desktop/ClickHouse\""
  exit 1
fi

# Copy across english language docs folders from main repo
for folder in ${array_en[@]}
do
  if ! cp -r $1/$folder docs/en; then
    echo -e "\033[0;31mFailed to copy $folder from [$0]\033[0m"
    error_flag=1
  else
    echo -e "\033[0;32mCopied $folder from [$0]\033[0m"
  fi
done

# Copy across remaining language docs folders from main repo
for folder in ${array_root[@]}
do
  if ! cp -r $1/$folder docs/; then
    echo -e "\033[0;31mFailed to copy $folder from [$0]\033[0m"
    error_flag=1
  else
    echo -e "\033[0;32mCopied $folder from [$0]\033[0m"
  fi
done

if [ $error_flag -eq 1 ]; then
  exit 1
fi

echo -e "\033[0;32mPreparation from local completed successfully\033[0m"