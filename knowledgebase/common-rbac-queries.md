---
title: Common RBAC queries for ClickHouse Cloud
description: "Queries to help grant specific permissions to users."
date: 2023-09-28
---

# Common RBAC queries for ClickHouse Cloud

## How do I grant the same permissions as the current user to another user?

```sql
GRANT CURRENT GRANTS ON *.* TO another_user;
```

## How do I grant a specific permission to a user based on the grants of the current user?

In the below example, `another_user` will be able to perform `SELECT` commands on all of the databases and tables of the current user.

```sql
GRANT CURRENT GRANTS(SELECT ON *.*) TO another_user;
```

## How do I grant a specific permission to a user for a specific database based on the grants of the current user?

In the below example, `another_user` will be able to perform `INSERT` commands to all tables in `my_database`.

```sql
GRANT INSERT ON my_database.* TO another_user;
```

## How do I grant access to all databases and tables for a specific user?

```sql
GRANT default_role TO another_user;
```
