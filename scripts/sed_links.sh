#!/bin/bash

# Set locale to prevent perl warnings
export LC_ALL=C
export LANG=C

# Sometimes we need to change links which are reporting as broken
# but they are from the ClickHouse/ClickHouse repo. In this case
# it's useful to sed the link so that the build can pass and then
# change it over on ClickHouse/ClickHouse once the PR has been merged
# on ClickHouse/clickhouse-docs

# Remove old dictionary files that were restructured into sub-pages
# (copied from ClickHouse repo which may not yet have the restructured docs)
rm -f docs/sql-reference/statements/create/dictionary.md
rm -rf docs/sql-reference/dictionaries

# Fix dictionary cross-references from ClickHouse repo copy
# These files reference the old sql-reference/dictionaries/ path which has been
# restructured into sql-reference/statements/create/dictionary/ sub-pages
DICT_FILES=(
    "docs/operations/system-tables/dictionaries.md"
    "docs/operations/server-configuration-parameters/_server_settings_outside_source.md"
    "docs/operations/server-configuration-parameters/settings.md"
    "docs/operations/caches.md"
    "docs/sql-reference/statements/system.md"
    "docs/sql-reference/statements/rename.md"
    "docs/sql-reference/statements/detach.md"
    "docs/sql-reference/statements/show.md"
    "docs/sql-reference/statements/exchange.md"
    "docs/sql-reference/statements/select/join.md"
    "docs/sql-reference/functions/ext-dict-functions.md"
    "docs/sql-reference/functions/embedded-dict-functions.md"
    "docs/sql-reference/functions/nlp-functions.md"
    "docs/sql-reference/table-functions/dictionary.md"
    "docs/sql-reference/table-functions/mongodb.md"
    "docs/sql-reference/table-functions/redis.md"
    "docs/sql-reference/table-functions/odbc.md"
    "docs/sql-reference/table-functions/mysql.md"
    "docs/sql-reference/table-functions/postgresql.md"
    "docs/engines/table-engines/special/dictionary.md"
    "docs/engines/table-engines/integrations/mysql.md"
    "docs/engines/table-engines/integrations/odbc.md"
    "docs/engines/table-engines/integrations/postgresql.md"
)

# Detect OS and use appropriate sed syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - fix dictionary cross-references
    for f in "${DICT_FILES[@]}"; do
        if [ -f "$f" ]; then
            # Source-specific anchors -> sources sub-page
            sed -i '' 's|sql-reference/dictionaries/index\.md#mongodb|/sql-reference/statements/create/dictionary/sources/mongodb|g' "$f"
            sed -i '' 's|sql-reference/dictionaries/index\.md#redis|/sql-reference/statements/create/dictionary/sources/redis|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries#mysql|/sql-reference/statements/create/dictionary/sources/mysql|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries#postgresql|/sql-reference/statements/create/dictionary/sources/postgresql|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries#dbms|/sql-reference/statements/create/dictionary/sources|g' "$f"
            # Embedded dictionaries
            sed -i '' 's|\.\./dictionaries#embedded-dictionaries|../statements/create/dictionary/embedded#embedded-dictionaries|g' "$f"
            # Source-specific anchors with absolute paths
            sed -i '' 's|/sql-reference/dictionaries#local-file|/sql-reference/statements/create/dictionary/sources/local-file|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries#cassandra|/sql-reference/statements/create/dictionary/sources/cassandra|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries#redis|/sql-reference/statements/create/dictionary/sources/redis|g' "$f"
            # Layout-specific anchors
            sed -i '' 's|/sql-reference/dictionaries#hierarchical-dictionaries|/sql-reference/statements/create/dictionary/layouts/hierarchical|g' "$f"
            sed -i '' 's|sql-reference/dictionaries/index\.md#hierarchical-dictionaries|sql-reference/statements/create/dictionary/layouts/hierarchical|g' "$f"
            # Generic index.md references
            sed -i '' 's|sql-reference/dictionaries/index\.md|sql-reference/statements/create/dictionary/index.md|g' "$f"
            # Old create/dictionary.md flat file reference
            sed -i '' 's|sql-reference/statements/create/dictionary\.md|sql-reference/statements/create/dictionary/index.md|g' "$f"
            # Catch-all for any remaining /sql-reference/dictionaries# links
            sed -i '' 's|/sql-reference/dictionaries#|/sql-reference/statements/create/dictionary/#|g' "$f"
            sed -i '' 's|/sql-reference/dictionaries)|/sql-reference/statements/create/dictionary)|g' "$f"
        fi
    done

    sed -i '' 's|(../../quick-start\.mdx)|(/get-started/quick-start)|g' docs/operations/utilities/clickhouse-local.md
    sed -i '' 's/{#data-types-matching}/{#data-type-mapping}/g' docs/interfaces/formats/Avro/Avro.md
    sed -i '' 's|(https://clickhouse.com/docs/sql-reference/statements/select#apply)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/sql-reference/statements/select#replace)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/sql-reference/statements/select#except)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i '' 's|(/cloud/reference/cloud-compatibility.md)|(/whats-new/cloud-compatibility)|g' docs/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md
    sed -i '' 's|(/cloud/security/secure-s3)|(/cloud/data-sources/secure-s3)|g' docs/engines/table-engines/integrations/s3queue.md
    sed -i '' 's|(/cloud/security/cloud-access-management/overview#initial-settings)|(/cloud/security/console-roles)|g' docs/sql-reference/statements/grant.md
    sed -i '' 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3.md
    sed -i '' 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3Cluster.md
    sed -i '' 's|(#cuttofirstsignificantsubdomaincustom)|(#cutToFirstSignificantSubdomainCustom)|g' docs/sql-reference/functions/url-functions.md
    sed -i '' 's|(/cloud/data-sources/secure-s3#setup)|(/cloud/data-sources/secure-s3)|g' docs/sql-reference/table-functions/s3.md
else
    # Linux - fix dictionary cross-references
    for f in "${DICT_FILES[@]}"; do
        if [ -f "$f" ]; then
            sed -i 's|sql-reference/dictionaries/index\.md#mongodb|/sql-reference/statements/create/dictionary/sources/mongodb|g' "$f"
            sed -i 's|sql-reference/dictionaries/index\.md#redis|/sql-reference/statements/create/dictionary/sources/redis|g' "$f"
            sed -i 's|/sql-reference/dictionaries#mysql|/sql-reference/statements/create/dictionary/sources/mysql|g' "$f"
            sed -i 's|/sql-reference/dictionaries#postgresql|/sql-reference/statements/create/dictionary/sources/postgresql|g' "$f"
            sed -i 's|/sql-reference/dictionaries#dbms|/sql-reference/statements/create/dictionary/sources|g' "$f"
            sed -i 's|\.\./dictionaries#embedded-dictionaries|../statements/create/dictionary/embedded#embedded-dictionaries|g' "$f"
            sed -i 's|/sql-reference/dictionaries#local-file|/sql-reference/statements/create/dictionary/sources/local-file|g' "$f"
            sed -i 's|/sql-reference/dictionaries#cassandra|/sql-reference/statements/create/dictionary/sources/cassandra|g' "$f"
            sed -i 's|/sql-reference/dictionaries#redis|/sql-reference/statements/create/dictionary/sources/redis|g' "$f"
            sed -i 's|/sql-reference/dictionaries#hierarchical-dictionaries|/sql-reference/statements/create/dictionary/layouts/hierarchical|g' "$f"
            sed -i 's|sql-reference/dictionaries/index\.md#hierarchical-dictionaries|sql-reference/statements/create/dictionary/layouts/hierarchical|g' "$f"
            sed -i 's|sql-reference/dictionaries/index\.md|sql-reference/statements/create/dictionary/index.md|g' "$f"
            sed -i 's|sql-reference/statements/create/dictionary\.md|sql-reference/statements/create/dictionary/index.md|g' "$f"
            sed -i 's|/sql-reference/dictionaries#|/sql-reference/statements/create/dictionary/#|g' "$f"
            sed -i 's|/sql-reference/dictionaries)|/sql-reference/statements/create/dictionary)|g' "$f"
        fi
    done

    sed -i 's|(../../quick-start\.mdx)|(/get-started/quick-start)|g' docs/operations/utilities/clickhouse-local.md
    sed -i 's/{#data-types-matching}/{#data-type-mapping}/g' docs/interfaces/formats/Avro/Avro.md
    sed -i 's|(https://clickhouse.com/docs/sql-reference/statements/select#apply)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/sql-reference/statements/select#replace)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/sql-reference/statements/select#except)|(/sql-reference/statements/select)|g' docs/guides/developer/dynamic-column-selection.md
    sed -i 's|(/cloud/reference/cloud-compatibility.md)|(/whats-new/cloud-compatibility)|g' docs/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md
    sed -i 's|(/cloud/security/secure-s3)|(/cloud/data-sources/secure-s3)|g' docs/engines/table-engines/integrations/s3queue.md
    sed -i 's|(/cloud/security/cloud-access-management/overview#initial-settings)|(/cloud/security/console-roles)|g' docs/sql-reference/statements/grant.md
    sed -i 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3.md
    sed -i 's|(/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|(/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)|g' docs/sql-reference/table-functions/s3Cluster.md
    sed -i 's|(#cuttofirstsignificantsubdomaincustom)|(#cutToFirstSignificantSubdomainCustom)|g' docs/sql-reference/functions/url-functions.md
    sed -i 's|(/cloud/data-sources/secure-s3#setup)|(/cloud/data-sources/secure-s3)|g' docs/sql-reference/table-functions/s3.md
fi
