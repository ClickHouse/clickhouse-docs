#!/bin/bash

# Sometimes we need to change links which are reporting as broken
# but they are from the ClickHouse/ClickHouse repo. In this case
# it's useful to sed the link so that the build can pass and then
# change it over on ClickHouse/ClickHouse once the PR has been merged
# on ClickHouse/clickhouse-docs

sed -i '' 's|(../../quick-start\.mdx)|(/get-started/quick-start)|g' ../docs/operations/utilities/clickhouse-local.md