---
sidebar_label: User Permissions
slug: /en/manage/user-permissions
title: User Permissions
---

In ClickHouse Cloud, there are currently two account types: **Admin** and **Developer**. The below tables list the features accessible to each account type.

## Managing Services

| Feature | Admin | Developer |
|---------|:-----:|:---------:|
| Create service | ✅ | ❌ |
| Delete service | ✅ | ❌ |
| Stop service | ✅ | ❌ |
| Restart service | ✅ | ❌ |
| Reset service password | ✅ | ❌ |
| View service metrics | ✅ | ❌ |
  
## SQL Console

| Feature | Admin | Developer |
|---------|:-----|:---------|
| Connect to SQL Console | Connect without password using identical permissions to the *default* user | Database username and password required |

## Cloud API

| Feature | Admin | Developer |
|---------|:-----:|:---------:|
| Create API Key | ✅ | Read-only API keys |
| Delete API Key | ✅ | ❌ |

## Managing Users

:::note
ClickHouse Cloud users, whether an **Admin** or a **Developer** user, are different from database users in the ClickHouse service.

When a new service is created, a *default* user is created. When connecting to the SQL Console, an **Admin** user inherits the *default_role* which has identical permissions to the *default* user.

To manage database users utilized by your applications, you can use the web-based SQL Console.
:::

| Feature | Admin | Developer |
|---------|:-----:|:---------:|
| Invite users | ✅ | ❌ |
| Modify user permissions | ✅ | ❌ |
| Delete users | ✅ | Own account only |

## Billing, Organization, and Support

| Feature | Admin | Developer |
|---------|:-----:|:---------:|
| Manage billing | ✅ | ❌ |
| View organization activity | ✅ | ❌ |
| Submit support requests | ✅ | ✅ |
| View integrations | ✅ | ✅ |
