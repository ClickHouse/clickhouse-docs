#! /usr/bin/bash
git clone --branch new-nav https://github.com/ClickHouse/ClickHouse.git
cp -r ClickHouse/docs/en/development     docs/en/
cp -r ClickHouse/docs/en/engines         docs/en/
cp -r ClickHouse/docs/en/getting-started docs/en/
cp -r ClickHouse/docs/en/interfaces      docs/en/
cp -r ClickHouse/docs/en/operations      docs/en/
cp -r ClickHouse/docs/en/sql-reference   docs/en/
cp -r ClickHouse/docs/ru                 docs/
cp -r ClickHouse/docs/zh                 docs/
rm -r ClickHouse
