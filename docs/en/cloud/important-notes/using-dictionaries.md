---
slug: /en/cloud/important-notes/using-dictionaries
sidebar_label: Using Dictionaries
title: Using Dictionaries
---

In order to create a dictionary in cloud either:

Use the `default` user to create a dictionary based on a table defined in your service:

```sql
CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```

:::note
when using the Cloud SQL console, the user in use will be [different](sql-console-user.md) so, you will need to specify explicitly a user (`default` or any other user) and password when creating a dictionary.
:::note


```sql
CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' USER 'foo_user' PASSWORD 'foo_user_complex_password' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```
