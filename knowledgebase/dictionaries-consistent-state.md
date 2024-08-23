---
title: Why can't I see my data in a dictionary in ClickHouse Cloud?
description: There is an issue where data in dictionaries may not be visible immediately after creation.
date: 2024-04-12
---

# Why can't I see my data in a dictionary in ClickHouse Cloud?

Dictionaries created in ClickHouse Cloud may experience inconsistency during the initial creation phase. This means that you may not see any data in the dictionary right after creation. However, after several retries, the creation query may land on different replicas, and data will be visible.

This sometimes occurs because the dictionary was created before the part reached the server. As an example:

```
2024-01-25 13:38:25.615837 - CREATE DICTIONARY received
2024-01-25 13:38:25.626468 - CREATE DICTIONARY finished
2024-01-25 13:38:25.733008 - Part all_0_0_0 downloaded
```

As you can see, the part only arrived after the dictionary was created. This can be a bigger problem if you are using `LIFETIME(MIN 0 MAX 0)` because this means that dictionary will never be refreshed automatically. Therefore, the dictionary will remain empty until the command `RELOAD DICTIONARIES` is executed.

The solution to this issue is to use a `SELECT` query instead of specifying a source table when creating the dictionary and enabling the setting `select_sequential_consistency=1`.

Instead of specifying a source table:

```sql
SOURCE(CLICKHOUSE(
    table 'test.temp_title_table_1706189903924'
    user default password 'PASSWORD'))
```

Use a `SELECT` query with `select_sequential_consistency=1`:

```sql
SOURCE(CLICKHOUSE(QUERY
    'SELECT songTitle, mappedTitle
    FROM test.temp_title_table_1706189903924
    SETTINGS select_sequential_consistency=1' USER default PASSWORD ''))
```

## Why does this issue occur?

When you insert data and then create or reload a dictionary, the DDL may reach a replica before the data (or new data) does. This leads to the dictionaries being inconsistent between replicas. Then, depending on which replica receives the query, you may get different results.

Note that the same thing happens when you insert and immediately after read from a table. If you read from a replica that hasn't replicated the data yet, you won't see the newly inserted data. When you need sequential consistency, at the cost of performance (which is why it's generally not recommended to use) you can enable `select_sequential_consistency`.

The case of dictionaries is a bit trickier since dictionaries don't use the settings from the query, but the settings from the server. As a result, when loading data into the dictionary, even if you `SET select_sequential_consistency=1` data may load inconsistently across replicas. Specifying `select_sequential_consistency=1` in the dictionary source query allows the dictionary to adhere to this setting even if it's not globally enabled as a server setting.
