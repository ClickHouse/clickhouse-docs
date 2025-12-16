#!/bin/bash

# Set locale to prevent perl warnings
export LC_ALL=C
export LANG=C

# Sometimes we need to change links which are reporting as broken
# but they are from the ClickHouse/ClickHouse repo. In this case
# it's useful to sed the link so that the build can pass and then
# change it over on ClickHouse/ClickHouse once the PR has been merged
# on ClickHouse/clickhouse-docs

# Detect OS and use appropriate sed syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|(../../quick-start\.mdx)|(/get-started/quick-start)|g' docs/operations/utilities/clickhouse-local.md
    sed -i '' 's/{#data-types-matching}/{#data-type-mapping}/g' docs/interfaces/formats/Avro/Avro.md
    sed -i '' 's|(https://clickhouse.com/docs/sql-reference/statements/select#apply)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/sql-reference/statements/select#replace)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/sql-reference/statements/select#except)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/cloud/reference/cloud-compatibility.md)|(/whats-new/cloud-compatibility)|g' docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md
    sed -i '' 's|(/cloud/security/secure-s3)|(/cloud/data-sources/secure-s3)|g' docs/engines/table-engines/integrations/s3queue.md
    sed -i '' 's|(/cloud/security/cloud-access-management/overview#initial-settings)|(/cloud/security/console-roles)|g' docs/sql-reference/statements/grant.md
    sed -i '' 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3.md
    sed -i '' 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3Cluster.md
    sed -i '' 's|(#cuttofirstsignificantsubdomaincustom)|(#cutToFirstSignificantSubdomainCustom)|g' docs/sql-reference/functions/url-functions.md
    # Fix broken links in interface docs
    sed -i '' 's|(../../operations/configuration-files)|(/operations/configuration-files)|g' docs/interfaces/mysql.md
    sed -i '' 's|(../operations/configuration-files)|(/operations/configuration-files)|g' docs/interfaces/mysql.md
    sed -i '' 's|(../operations/server-configuration-parameters/settings.md#postgresql_port)|(/operations/server-configuration-parameters/settings#postgresql_port)|g' docs/interfaces/postgresql.md
    sed -i '' 's|(../../operations/server-configuration-parameters/settings.md#postgresql_port)|(/operations/server-configuration-parameters/settings#postgresql_port)|g' docs/interfaces/postgresql.md
    sed -i '' 's|(../interfaces/cli.md)|(/interfaces/cli)|g' docs/interfaces/tcp.md
    # Fix duplicate interface slugs by appending -old to docs/interfaces/ files
    sed -i '' 's|slug: /interfaces/arrowflight|slug: /interfaces/arrowflight-old|g' docs/interfaces/arrowflight.md
    sed -i '' 's|slug: /interfaces/cpp|slug: /interfaces/cpp-old|g' docs/interfaces/cpp.md
    sed -i '' 's|slug: /interfaces/grpc|slug: /interfaces/grpc-old|g' docs/interfaces/grpc.md
    sed -i '' 's|slug: /interfaces/http|slug: /interfaces/http-old|g' docs/interfaces/http.md
    sed -i '' 's|slug: /interfaces/jdbc|slug: /interfaces/jdbc-old|g' docs/interfaces/jdbc.md
    sed -i '' 's|slug: /interfaces/mysql|slug: /interfaces/mysql-old|g' docs/interfaces/mysql.md
    sed -i '' 's|slug: /interfaces/odbc|slug: /interfaces/odbc-old|g' docs/interfaces/odbc.md
    sed -i '' 's|slug: /interfaces/overview|slug: /interfaces/overview-old|g' docs/interfaces/overview.md
    sed -i '' 's|slug: /interfaces/postgresql|slug: /interfaces/postgresql-old|g' docs/interfaces/postgresql.md
    sed -i '' 's|slug: /interfaces/prometheus|slug: /interfaces/prometheus-old|g' docs/interfaces/prometheus.md
    sed -i '' 's|slug: /interfaces/ssh|slug: /interfaces/ssh-old|g' docs/interfaces/ssh.md
    sed -i '' 's|slug: /interfaces/tcp|slug: /interfaces/tcp-old|g' docs/interfaces/tcp.md
else
    # Linux
    sed -i 's|(../../quick-start\.mdx)|(/get-started/quick-start)|g' docs/operations/utilities/clickhouse-local.md
    sed -i 's/{#data-types-matching}/{#data-type-mapping}/g' docs/interfaces/formats/Avro/Avro.md
    sed -i 's|(https://clickhouse.com/docs/sql-reference/statements/select#apply)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/sql-reference/statements/select#replace)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/sql-reference/statements/select#except)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/cloud/reference/cloud-compatibility.md)|(/whats-new/cloud-compatibility)|g' docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md
    sed -i 's|(/cloud/security/secure-s3)|(/cloud/data-sources/secure-s3)|g' docs/engines/table-engines/integrations/s3queue.md
    sed -i 's|(/cloud/security/cloud-access-management/overview#initial-settings)|(/cloud/security/console-roles)|g' docs/sql-reference/statements/grant.md
    sed -i 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3.md
    sed -i 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3Cluster.md
    sed -i 's|(#cuttofirstsignificantsubdomaincustom)|(#cutToFirstSignificantSubdomainCustom)|g' docs/sql-reference/functions/url-functions.md
    # Fix broken links in interface docs
    sed -i 's|(../../operations/configuration-files)|(/operations/configuration-files)|g' docs/interfaces/mysql.md
    sed -i 's|(../operations/configuration-files)|(/operations/configuration-files)|g' docs/interfaces/mysql.md
    sed -i 's|(../operations/server-configuration-parameters/settings.md#postgresql_port)|(/operations/server-configuration-parameters/settings#postgresql_port)|g' docs/interfaces/postgresql.md
    sed -i 's|(../../operations/server-configuration-parameters/settings.md#postgresql_port)|(/operations/server-configuration-parameters/settings#postgresql_port)|g' docs/interfaces/postgresql.md
    sed -i 's|(../interfaces/cli.md)|(/interfaces/cli)|g' docs/interfaces/tcp.md
    # Fix duplicate interface slugs by appending -old to docs/interfaces/ files
    sed -i 's|slug: /interfaces/arrowflight|slug: /interfaces/arrowflight-old|g' docs/interfaces/arrowflight.md
    sed -i 's|slug: /interfaces/cpp|slug: /interfaces/cpp-old|g' docs/interfaces/cpp.md
    sed -i 's|slug: /interfaces/grpc|slug: /interfaces/grpc-old|g' docs/interfaces/grpc.md
    sed -i 's|slug: /interfaces/http|slug: /interfaces/http-old|g' docs/interfaces/http.md
    sed -i 's|slug: /interfaces/jdbc|slug: /interfaces/jdbc-old|g' docs/interfaces/jdbc.md
    sed -i 's|slug: /interfaces/mysql|slug: /interfaces/mysql-old|g' docs/interfaces/mysql.md
    sed -i 's|slug: /interfaces/odbc|slug: /interfaces/odbc-old|g' docs/interfaces/odbc.md
    sed -i 's|slug: /interfaces/overview|slug: /interfaces/overview-old|g' docs/interfaces/overview.md
    sed -i 's|slug: /interfaces/postgresql|slug: /interfaces/postgresql-old|g' docs/interfaces/postgresql.md
    sed -i 's|slug: /interfaces/prometheus|slug: /interfaces/prometheus-old|g' docs/interfaces/prometheus.md
    sed -i 's|slug: /interfaces/ssh|slug: /interfaces/ssh-old|g' docs/interfaces/ssh.md
    sed -i 's|slug: /interfaces/tcp|slug: /interfaces/tcp-old|g' docs/interfaces/tcp.md
fi
