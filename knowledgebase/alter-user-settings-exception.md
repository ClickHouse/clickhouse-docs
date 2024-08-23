---
date: 2023-08-26
---

# DB::Exception: Cannot update user `default` in users.xml because this storage is readonly. (ACCESS_STORAGE_READONLY)

When you try to alter a user's settings, you may encounter the above exception. Here are a few options to troubleshoot this error:

## Edit users.xml directly

You can edit or add the desired settings for a specific user in `users.xml` directly in the file `/etc/clickhouse-server/users.d`.

Read more about `users.xml` [here](/docs/en/operations/settings/settings-profiles).

## Create another user

You can create another user with the specified settings, then connect to ClickHouse using that new user.

View [this page](/docs/en/sql-reference/statements/create/user) to learn how to create users.

## Enable SQL-driven access control

You can enable SQL-drive access control and account management for the default user. The steps to enable this are specified in this [page](/docs/en/operations/access-rights#enabling-access-control
).