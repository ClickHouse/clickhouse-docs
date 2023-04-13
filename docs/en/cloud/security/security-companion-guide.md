---
sidebar_label: Security Best Practices
slug: /en/cloud/security/security-companion-guide
title: Security Companion Guide
---
# Security Best Practices

ClickHouse Cloud was created with security in mind. Our goal is to provide you with the tools you need to do your best work without worrying about
managing tedious infrastructure tasks. This guide is designed to make common configurations easy to set up while providing information about
what we do to support you.

We hope you find this guide useful and look forward to sharing this journey with you.

## Organization security
This section relates to securing your [ClickHouse Cloud](https://clickhouse.cloud/) account. The [database users](#database-users) section below covers how to securely manage database users.

### Establish strong passwords
ClickHouse Cloud allows you to setup a username and password or use your Google account to login. For those setting up a username and password, the
best way to protect your ClickHouse account is to have all users set strong passwords. There are many online resources to help you devise a password
you can remember. Alternatively, you can use a random password generator and store your password in a password manager for increased security.

Minimum password settings currently comply with [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) Authenticator Assurance Level 1:
- Minimum 12 characters
- Includes:
   - 1 uppercase letter
   - 1 lowercase letter
   - 1 number
   - 1 special character

:::note
If you are using Google Password Manager, you may need to manually add a special character to the automatically generated password
to comply with our password requirements. Google Password Manager can then store the new password for later use.
:::

### Multi-factor authentication
Users setting a username and password at login can also setup multi-factor authentication once logged into the control panel. Simply click your
initials in the upper right corner, select Profile, and click Set up in the Multi-factor authentication section.

### Organizational role based access
Users at the organization level can be granted administrator or developer privileges. Administrators can manage billing and create, modify, or
terminate services. Developers can interact with existing services.

### Additional organizational security features
We provide additional security features to protect your account. If a login attempt looks suspicious, we will email you to ask if the attempt was
valid and reset your password automatically if you tell us the attempt was unknown to you. We also provide an [Organization Activity](/docs/en/cloud/security/activity-log.md) log within the application to show you when user accounts, IP address lists (more on this below), or services were created, modified or terminated.

## Network security
### Limit database connections
We provide the ability to setup [IP Access Lists](/docs/en/cloud/security/ip-access-list.md), which restrict connections to your database to
specific IP addresses or ranges. This feature is part of the initial setup or can be configured later by clicking on your service, then the Security tab. You can input IP addresses manually, upload a JSON file containing IP addresses or CIDR block information, or import addresses from other ClickHouse services you previously set up. You can also add a description to each IP address or block to help with administration.

:::note
If you connect to your database from a home internet connection, your internet service provider may periodically update your IP address which may impact your database connection. If this occurs simply sign into your account, go to the Security tab for the service, and use the `Add my current IP` button to update the list.
:::

## Database users
You can setup additional user accounts within the database, use roles to make access management easier, and easily review user access periodically
to maintain good security. Follow these steps to roll out access to more people in your organization.

### Use named admin accounts
Set up a named [Admin user](/docs/en/cloud/manage/users-and-roles.md/#admin-user) and assign them the `default_role`, then securely store the password for the _default account_ in a vault for break-glass purposes.

### Organize roles
Create [roles](/docs/en/sql-reference/statements/create/role.md) that provide specific rights to your databases and tables.
```
CREATE ROLE general_read_only;
GRANT SELECT on my_database.* to general_read_only;
```
### Establish secure database passwords
Use the SHA256_hash method when [creating user accounts](/docs/en/sql-reference/statements/create/user.md) to secure passwords.

**TIP:** Since users with less than administrative privileges cannot set their own password, ask the user to hash their password using a generator
such as [this one](https://tools.keycdn.com/sha256-online-generator) before providing it to the admin to setup the account. Passwords should follow the [requirements](#establish-strong-passwords) listed above.

```
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
GRANT general_read_only TO userName;
```
### Periodically review access
Use the query below to return all users, roles and grants for a database.

```
SELECT grants.user_name,
  grants.role_name,
  users.name AS role_member,
  grants.access_type,
  grants.database,
  grants.table
FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
  LEFT OUTER JOIN system.users ON role_grants.user_name = users.name
```

## Data retention
At times you will need to set automated policies to periodically delete data. ClickHouse provides table and column level [Time to Live (TTL)](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) settings that can be used as a general setting or in combination with conditions to delete specific data elements from your tables. You will need a date/time column to determine when to delete data.

An example of a TTL is as follows:
```
CREATE TABLE database.table
(
  field1 String,
  time_stamp DateTime,
  field2 String
)
ENGINE = MergeTree()
ORDER BY time_stamp
TTL time_stamp + INTERVAL 1 HOUR;
```

## Data deletion
Certain data use cases require the ability to delete individual records on demand. ClickHouse utilizes a unique storage structure to enable fast queries. We recommend data for individual deletion be processed in batches to minimize processing actions. Use the following command to delete data:
```
ALTER TABLE database.table DELETE WHERE field1 = 'criteria';
```
We also provide [Lightweight Delete](/docs/en/sql-reference/statements/delete.md/#lightweight-delete-internals) where data is immediately removed from visibility and eventually deleted.
