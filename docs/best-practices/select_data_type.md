---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: 'Selecting data Types'
title: 'Selecting data Types'
description: 'Page describing how to choose data types in ClickHouse'
keywords: ['data types']
doc_type: explanation
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

One of the core reasons for ClickHouse's query performance is its efficient data compression. Less data on disk results in faster queries and inserts by minimizing I/O overhead. ClickHouse's column-oriented architecture naturally arranges similar data adjacently, enabling compression algorithms and codecs to reduce data size dramatically. To maximize these compression benefits, it's essential to carefully choose appropriate data types.

Compression efficiency in ClickHouse depends mainly on three factors: the ordering key, data types, and codecs, all defined through the table schema. Choosing optimal data types yields immediate improvements in both storage and query performance.

Some straightforward guidelines can significantly enhance the schema:

* **Use Strict Types:** Always select the correct data type for columns. Numeric and date fields should use appropriate numeric and date types rather than general-purpose String types. This ensures correct semantics for filtering and aggregations.

* **Avoid nullable Columns:** Nullable columns introduce additional overhead by maintaining separate columns for tracking null values. Only use Nullable if explicitly required to distinguish between empty and null states. Otherwise, default or zero-equivalent values typically suffice. For further information on why this type should be avoided unless needed, see [Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns).

* **Minimize Numeric Precision:** Select numeric types with minimal bit-width that still accommodate the expected data range. For instance, prefer [UInt16 over Int32](/sql-reference/data-types/int-uint) if negative values aren't needed, and the range fits within 0–65535.

* **Optimize Date and Time Precision:** Choose the most coarse-grained date or datetime type that meets query requirements. Use Date or Date32 for date-only fields, and prefer DateTime over DateTime64 unless millisecond or finer precision is essential.

* **Leverage LowCardinality and Specialized Types:** For columns with fewer than approximately 10,000 unique values, use LowCardinality types to significantly reduce storage through dictionary encoding. Similarly, use FixedString only when the column values are strictly fixed-length strings (e.g., country or currency codes), and prefer Enum types for columns with a finite set of possible values to enable efficient storage and built-in data validation.

* **Enums for data validation:** The Enum type can be used to efficiently encode enumerated types. Enums can either be 8 or 16 bits, depending on the number of unique values they are required to store. Consider using this if you need either the associated validation at insert time (undeclared values will be rejected) or wish to perform queries which exploit a natural ordering in the Enum values e.g. imagine a feedback column containing user responses Enum(':(' = 1, ':|' = 2, ':)' = 3).

## Example {#example}

ClickHouse offers built-in tools to streamline type optimization. For example, schema inference can automatically identify initial types. Consider the Stack Overflow dataset, publicly available in Parquet format. Running a simple schema inference via the [`DESCRIBE`](/sql-reference/statements/describe-table) command provides an initial non-optimized schema. 

:::note
By default, ClickHouse maps these to equivalent Nullable types. This is preferred as the schema is based on a sample of the rows only.
:::

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name───────────────────────┬─type──────────────────────────────┐
│ Id                         │ Nullable(Int64)                   │
│ PostTypeId                 │ Nullable(Int64)                   │
│ AcceptedAnswerId           │ Nullable(Int64)                   │
│ CreationDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ Score                      │ Nullable(Int64)                   │
│ ViewCount                  │ Nullable(Int64)                   │
│ Body                       │ Nullable(String)                  │
│ OwnerUserId                │ Nullable(Int64)                   │
│ OwnerDisplayName           │ Nullable(String)                  │
│ LastEditorUserId           │ Nullable(Int64)                   │
│ LastEditorDisplayName      │ Nullable(String)                  │
│ LastEditDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ LastActivityDate           │ Nullable(DateTime64(3, 'UTC'))    │
│ Title                      │ Nullable(String)                  │
│ Tags                       │ Nullable(String)                  │
│ AnswerCount                │ Nullable(Int64)                   │
│ CommentCount               │ Nullable(Int64)                   │
│ FavoriteCount              │ Nullable(Int64)                   │
│ ContentLicense             │ Nullable(String)                  │
│ ParentId                   │ Nullable(String)                  │
│ CommunityOwnedDate         │ Nullable(DateTime64(3, 'UTC'))    │
│ ClosedDate                 │ Nullable(DateTime64(3, 'UTC'))    │
└────────────────────────────┴───────────────────────────────────┘

22 rows in set. Elapsed: 0.130 sec.
```

:::note
Note below we use the glob pattern *.parquet to read all files in the stackoverflow/parquet/posts folder.
:::

By applying our early simple rules to our posts table, we can identify an optimal type for each column:

| Column                  | Is Numeric | Min, Max                                                              | Unique Values | Nulls | Comment                                                                                      | Optimized Type                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | Yes        | 1, 8                                                                   | 8              | No     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | Yes        | 0, 78285170                                                            | 12282094       | Yes    | Differentiate Null with 0 value                                                               | UInt32                                   |
| `CreationDate`           | No         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `Score`                  | Yes        | -217, 34970                                                            | 3236           | No     |                                                                                              | Int32                                    |
| `ViewCount`              | Yes        | 2, 13962748                                                            | 170867         | No     |                                                                                              | UInt32                                   |
| `Body`                   | No         | -                                                                      | -              | No     |                                                                                              | String                                   |
| `OwnerUserId`            | Yes        | -1, 4056915                                                            | 6256237        | Yes    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | No         | -                                                                      | 181251         | Yes    | Consider Null to be empty string                                                             | String                                   |
| `LastEditorUserId`       | Yes        | -1, 9999993                                                            | 1104694        | Yes    | 0 is an unused value can be used for Nulls                                                   | Int32                                    |
| `LastEditorDisplayName`  | No         | -                                                                      | 70952          | Yes    | Consider Null to be an empty string. Tested LowCardinality and no benefit                    | String                                   |
| `LastEditDate`           | No         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `LastActivityDate`       | No         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `Title`                  | No         | -                                                                      | -              | No     | Consider Null to be an empty string                                                          | String                                   |
| `Tags`                   | No         | -                                                                      | -              | No     | Consider Null to be an empty string                                                          | String                                   |
| `AnswerCount`            | Yes        | 0, 518                                                                 | 216            | No     | Consider Null and 0 to same                                                                  | UInt16                                   |
| `CommentCount`           | Yes        | 0, 135                                                                 | 100            | No     | Consider Null and 0 to same                                                                  | UInt8                                    |
| `FavoriteCount`          | Yes        | 0, 225                                                                 | 6              | Yes    | Consider Null and 0 to same                                                                  | UInt8                                    |
| `ContentLicense`         | No         | -                                                                      | 3              | No     | LowCardinality outperforms FixedString                                                       | LowCardinality(String)                   |
| `ParentId`               | No         | -                                                                      | 20696028       | Yes    | Consider Null to be an empty string                                                          | String                                   |
| `CommunityOwnedDate`     | No         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | Yes    | Consider default 1970-01-01 for Nulls. Millisecond granularity is not required, use DateTime | DateTime                                 |
| `ClosedDate`             | No         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | Yes    | Consider default 1970-01-01 for Nulls. Millisecond granularity is not required, use DateTime | DateTime                                 |

:::note tip
Identifying the type for a column relies on understanding its numeric range and number of unique values. To find the range of all columns, and the number of distinct values, users can use the simple query `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`. We recommend performing this over a smaller subset of the data as this can be expensive.
:::

This results in the following optimized schema (with respect to types):

```sql
CREATE TABLE posts
(
   Id Int32,
   PostTypeId Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 
   'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   AcceptedAnswerId UInt32,
   CreationDate DateTime,
   Score Int32,
   ViewCount UInt32,
   Body String,
   OwnerUserId Int32,
   OwnerDisplayName String,
   LastEditorUserId Int32,
   LastEditorDisplayName String,
   LastEditDate DateTime,
   LastActivityDate DateTime,
   Title String,
   Tags String,
   AnswerCount UInt16,
   CommentCount UInt8,
   FavoriteCount UInt8,
   ContentLicense LowCardinality(String),
   ParentId String,
   CommunityOwnedDate DateTime,
   ClosedDate DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

## Avoid nullable columns {#avoid-nullable-columns}

<NullableColumns />
