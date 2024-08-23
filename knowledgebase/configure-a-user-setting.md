---
date: 2023-03-01
---

# How to configure a setting for a user

There are several ways to define a setting for a user in ClickHouse, depending on the use case and how long you want the setting to be configured. Let's look at a few scenarios...

## Configure a setting for a single query

A `SELECT` query can contain a `SETTINGS` clause where you can define any number of settings. The settings are only applied for that particular query. For example:

```sql
SELECT *
FROM my_table
SETTINGS max_threads = 8;
```

The maximum number of threads will be 8 for this particular query.

## Configure a setting for a session

You can define a setting for the lifetime of a client session using a `SET` clause. This is handy for ad-hoc testing or for when you want a setting to live for the lifetime of a few queries - but not longer.

```sql
SET max_threads = 8;

SELECT *
FROM my_table;
```

## Configure a setting for a particular user

Use `ALTER USER` to define a setting just for one user. For example:

```sql
ALTER USER my_user_name SETTINGS max_threads = 8;
```

You can verify it worked by logging out of your client, logging back in, then use the `getSetting` function:

```sql
SELECT getSetting('max_threads');
```
