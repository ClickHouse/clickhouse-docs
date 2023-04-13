---
slug: /en/cloud/bestpractices/avoid-nullable-columns
sidebar_label: Avoid Nullable Columns
title: Avoid Nullable Columns
---

[`Nullable` column](/docs/en/sql-reference/data-types/nullable/) (e.g. `Nullable(String))` creates a separate column of `UInt8` type. This additional column has to be processed every time a user works with a nullable column. This leads to additional storage space used and almost always negatively affects performance.

To avoid `Nullable` columns, consider setting a default value for that column.  For example, instead of:

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    # highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```
use

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    # highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

:::note
Consider your use case, a default value may be inappropriate.
:::
