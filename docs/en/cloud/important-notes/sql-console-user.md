---
slug: /en/cloud/important-notes/sql-console-user
sidebar_label: SQL Console user
title: SQL Console user
---

When using the SQL Console in Cloud, a very important aspect to consider is that all your SQL statements will not be run as the `default` user, instead these will be run as user named as `sql-console:${cloud_login_email}`.

This has important implications in terms of permissions and expected behaviour that needs to be taken into account when granting permissions.
