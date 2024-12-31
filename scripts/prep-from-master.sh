#! ./bin/bash

# Due to the fact that some of the documentation content is stored on the main repo at ClickHouse/ClickHouse
# this script is used to copy across those documents to ClickHouse/clickhouse-docs from remote repository.

array_root=($npm_package_config_prep_array_root)
array_en=($npm_package_config_prep_array_en)
ch_temp=/tmp/ch_temp_$RANDOM && mkdir -p $ch_temp && git clone --depth 1 --branch master https://github.com/ClickHouse/ClickHouse $ch_temp

bash scripts/prep-from-local.sh "$ch_temp"
rm -rf $ch_temp