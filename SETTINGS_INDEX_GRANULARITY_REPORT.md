# Report: Occurrences of "SETTINGS index_granularity = 8192" in ClickHouse Documentation

This report identifies all locations in the ClickHouse documentation where the setting `SETTINGS index_granularity = 8192` is explicitly mentioned.

## Summary

Total occurrences found: **76**

## Distribution by Category

### 1. English Documentation (docs/)
**Total: 10 occurrences**

#### Example Datasets - Anonymized Web Analytics (Metrica)
- **File:** `docs/getting-started/example-datasets/anon_web_analytics_metrica.md`
  - Line 37: CREATE TABLE datasets.hits_v1 command
  - Line 43: CREATE TABLE default.hits_100m_obfuscated command
  - Line 74: CREATE TABLE datasets.visits_v1 command

#### Example Datasets - LAION
- **File:** `docs/getting-started/example-datasets/laion.md`
  - Line 94: Table creation with index_granularity setting

#### Best Practices - Sparse Primary Indexes
- **File:** `docs/guides/best-practices/sparse-primary-indexes.md`
  - Line 182: Example with index_granularity_bytes = 0, compress_primary_key = 0
  - Line 883: Example with index_granularity_bytes = 0, compress_primary_key = 0

#### ETL Tools - dbt Features and Configurations
- **File:** `docs/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md`
  - Line 594: Table creation example
  - Line 648: Table creation example

#### Language Clients - Python Driver API
- **File:** `docs/integrations/language-clients/python/driver-api.md`
  - Line 396: Comment line with SETTINGS index_granularity = 8192

#### Use Cases - Observability ClickStack TTL
- **File:** `docs/use-cases/observability/clickstack/ttl.md`
  - Line 56: Table creation with ttl_only_drop_parts = 1

### 2. Russian Documentation (i18n/ru/)
**Total: 21 occurrences**

#### System Tables - Tables
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md`
  - Line 108: create_table_query for base.t1
  - Line 109: engine_full for base.t1
  - Line 139: create_table_query for default.53r93yleapyears
  - Line 140: engine_full for default.53r93yleapyears

#### Settings
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/operations/settings/settings.md`
  - Line 3912: Settings table output
  - Line 3936: Settings table output

#### Example Datasets - Metrica
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md`
  - Line 36: CREATE TABLE datasets.hits_v1 command
  - Line 42: CREATE TABLE default.hits_100m_obfuscated command
  - Line 73: CREATE TABLE datasets.visits_v1 command

#### Example Datasets - LAION
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md`
  - Line 95: Table creation with index_granularity setting

#### Encoding Functions
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md`
  - Line 557: ORDER BY example with index_granularity_bytes = '10Mi'

#### Use Cases - TTL
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md`
  - Line 56: Table creation with ttl_only_drop_parts = 1

#### Best Practices - Sparse Primary Indexes
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md`
  - Line 186: Example with index_granularity_bytes = 0, compress_primary_key = 0
  - Line 918: Example with index_granularity_bytes = 0, compress_primary_key = 0

#### ETL Tools - dbt
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md`
  - Line 621: Table creation example
  - Line 677: Table creation example

#### Table Engines - S3Queue
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md`
  - Line 511: Settings table output

#### Table Engines - Azure Queue
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md`
  - Line 171: Table creation with index_granularity setting

#### Language Clients - Python
- **File:** `i18n/ru/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md`
  - Line 398: Comment line with anchor {#settings-index_granularity-8192}

#### Blog Posts
- **File:** `i18n/ru/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx`
  - Line 40: Settings table output

- **File:** `i18n/ru/docusaurus-plugin-content-blog/current/add-column.mdx`
  - Line 209: Table creation example

### 3. Japanese Documentation (i18n/jp/)
**Total: 21 occurrences**

#### System Tables - Tables
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md`
  - Line 108: create_table_query for base.t1
  - Line 109: engine_full for base.t1
  - Line 139: create_table_query for default.53r93yleapyears
  - Line 140: engine_full for default.53r93yleapyears

#### Settings
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/operations/settings/settings.md`
  - Line 3912: Settings table output
  - Line 3936: Settings table output

#### Example Datasets - Metrica
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md`
  - Line 36: CREATE TABLE datasets.hits_v1 command
  - Line 42: CREATE TABLE default.hits_100m_obfuscated command
  - Line 73: CREATE TABLE datasets.visits_v1 command

#### Example Datasets - LAION
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md`
  - Line 95: Table creation with index_granularity setting

#### Encoding Functions
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md`
  - Line 552: ORDER BY example with index_granularity_bytes = '10Mi'

#### Use Cases - TTL
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md`
  - Line 56: Table creation with ttl_only_drop_parts = 1

#### ETL Tools - dbt
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md`
  - Line 597: Table creation example
  - Line 653: Table creation example

#### Table Engines - S3Queue
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md`
  - Line 509: Settings table output

#### Table Engines - Azure Queue
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md`
  - Line 170: Table creation with index_granularity setting

#### Language Clients - Python
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md`
  - Line 398: Comment line with anchor {#settings-index_granularity-8192}

#### Best Practices - Sparse Primary Indexes
- **File:** `i18n/jp/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md`
  - Line 186: Example with index_granularity_bytes = 0, compress_primary_key = 0
  - Line 915: Example with index_granularity_bytes = 0, compress_primary_key = 0

#### Blog Posts
- **File:** `i18n/jp/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx`
  - Line 40: Settings table output

- **File:** `i18n/jp/docusaurus-plugin-content-blog/current/add-column.mdx`
  - Line 210: Table creation example

### 4. Chinese Documentation (i18n/zh/)
**Total: 21 occurrences**

#### System Tables - Tables
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md`
  - Line 108: create_table_query for base.t1
  - Line 109: engine_full for base.t1
  - Line 139: create_table_query for default.53r93yleapyears
  - Line 140: engine_full for default.53r93yleapyears

#### Settings
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/operations/settings/settings.md`
  - Line 3911: Settings table output
  - Line 3935: Settings table output

#### Table Engines - S3Queue
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md`
  - Line 510: Settings table output

#### Table Engines - Azure Queue
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md`
  - Line 170: Table creation with index_granularity setting

#### ETL Tools - dbt
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md`
  - Line 581: Table creation example
  - Line 637: Table creation example

#### Language Clients - Python
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md`
  - Line 398: Comment line with anchor {#settings-index_granularity-8192}

#### Example Datasets - Metrica
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md`
  - Line 36: CREATE TABLE datasets.hits_v1 command
  - Line 42: CREATE TABLE default.hits_100m_obfuscated command
  - Line 73: CREATE TABLE datasets.visits_v1 command

#### Example Datasets - LAION
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md`
  - Line 95: Table creation with index_granularity setting

#### Use Cases - TTL
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md`
  - Line 56: Table creation with ttl_only_drop_parts = 1

#### Encoding Functions
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md`
  - Line 551: ORDER BY example with index_granularity_bytes = '10Mi'

#### Best Practices - Sparse Primary Indexes
- **File:** `i18n/zh/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md`
  - Line 186: Example with index_granularity_bytes = 0, compress_primary_key = 0
  - Line 915: Example with index_granularity_bytes = 0, compress_primary_key = 0

#### Blog Posts
- **File:** `i18n/zh/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx`
  - Line 40: Settings table output

- **File:** `i18n/zh/docusaurus-plugin-content-blog/current/add-column.mdx`
  - Line 210: Table creation example

### 5. Knowledge Base
**Total: 2 occurrences**

- **File:** `knowledgebase/recreate_table_across_terminals.mdx`
  - Line 39: Settings table output

- **File:** `knowledgebase/add-column.mdx`
  - Line 211: Table creation example

### 6. Static Content/Images
**Total: 1 occurrence**

- **File:** `static/images/integrations/data-ingestion/s3/ramp.md`
  - Line 2231: Table creation with cache_populated_by_fetch = 1, min_age_to_force_merge_seconds=600

## Analysis by Context

### Usage Contexts:

1. **Example Table Creation Commands** (Most common)
   - Large dataset examples (Metrica hits, visits)
   - Sample table definitions
   - Tutorial and guide examples

2. **System Table Outputs** (Documentation of actual system behavior)
   - `system.tables` output examples
   - Showing how ClickHouse displays table definitions

3. **Settings Documentation**
   - Examples in settings reference pages
   - Configuration examples

4. **Tutorial Code Snippets**
   - Best practices guides
   - Integration examples (dbt, Python clients)
   - Observability examples

5. **Comments and Anchors**
   - Comment lines in code examples
   - Documentation anchors/references

## Recommendations

Based on this report:

1. **Documentation Consistency**: The setting `index_granularity = 8192` appears consistently across all language versions (EN, RU, JP, ZH), suggesting good translation practices.

2. **Default Value**: Since 8192 is the default value for `index_granularity`, many of these explicit declarations could potentially be simplified by omitting the setting where defaults are acceptable.

3. **Educational Value**: The frequent appearance in example datasets and tutorials indicates this is an important concept for users to understand.

4. **Maintenance Consideration**: Any changes to the default value or best practices around `index_granularity` would require updates across all 76 occurrences.

## Files by Path (Complete List)

```
docs/getting-started/example-datasets/anon_web_analytics_metrica.md (3)
docs/getting-started/example-datasets/laion.md (1)
docs/guides/best-practices/sparse-primary-indexes.md (2)
docs/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md (2)
docs/integrations/language-clients/python/driver-api.md (1)
docs/use-cases/observability/clickstack/ttl.md (1)
i18n/jp/docusaurus-plugin-content-blog/current/add-column.mdx (1)
i18n/jp/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx (1)
i18n/jp/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md (1)
i18n/jp/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md (1)
i18n/jp/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md (3)
i18n/jp/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md (1)
i18n/jp/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md (2)
i18n/jp/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md (2)
i18n/jp/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md (1)
i18n/jp/docusaurus-plugin-content-docs/current/operations/settings/settings.md (2)
i18n/jp/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md (4)
i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md (1)
i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md (1)
i18n/ru/docusaurus-plugin-content-blog/current/add-column.mdx (1)
i18n/ru/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx (1)
i18n/ru/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md (1)
i18n/ru/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md (1)
i18n/ru/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md (3)
i18n/ru/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md (1)
i18n/ru/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md (2)
i18n/ru/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md (2)
i18n/ru/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md (1)
i18n/ru/docusaurus-plugin-content-docs/current/operations/settings/settings.md (2)
i18n/ru/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md (4)
i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md (1)
i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md (1)
i18n/zh/docusaurus-plugin-content-blog/current/add-column.mdx (1)
i18n/zh/docusaurus-plugin-content-blog/current/recreate_table_across_terminals.mdx (1)
i18n/zh/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/azure-queue.md (1)
i18n/zh/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/s3queue.md (1)
i18n/zh/docusaurus-plugin-content-docs/current/getting-started/example-datasets/anon_web_analytics_metrica.md (3)
i18n/zh/docusaurus-plugin-content-docs/current/getting-started/example-datasets/laion.md (1)
i18n/zh/docusaurus-plugin-content-docs/current/guides/best-practices/sparse-primary-indexes.md (2)
i18n/zh/docusaurus-plugin-content-docs/current/integrations/data-ingestion/etl-tools/dbt/features-and-configurations.md (2)
i18n/zh/docusaurus-plugin-content-docs/current/integrations/language-clients/python/driver-api.md (1)
i18n/zh/docusaurus-plugin-content-docs/current/operations/settings/settings.md (2)
i18n/zh/docusaurus-plugin-content-docs/current/operations/system-tables/tables.md (4)
i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/functions/encoding-functions.md (1)
i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ttl.md (1)
knowledgebase/add-column.mdx (1)
knowledgebase/recreate_table_across_terminals.mdx (1)
static/images/integrations/data-ingestion/s3/ramp.md (1)
```

---
**Report Generated**: 2025-12-11  
**Search Pattern**: `SETTINGS index_granularity = 8192`  
**Total Files Affected**: 48  
**Total Occurrences**: 76
