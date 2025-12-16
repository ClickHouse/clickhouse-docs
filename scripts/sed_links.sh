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
    sed -i '' 's|(/guides/sre/tls/configuring-tls)|(/guides/sre/configuring-tls)|g' docs/sql-reference/functions/other-functions.md
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
    sed -i 's|(/guides/sre/tls/configuring-tls)|(/guides/sre/configuring-tls)|g' docs/sql-reference/functions/other-functions.md
fi
