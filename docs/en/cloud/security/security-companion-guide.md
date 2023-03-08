---
sidebar_label: Security Companion Guide
slug: /en/cloud/security/security-companion-guide
title: Security Companion Guide
---
# Security Companion Guide

ClickHouse Cloud was created with security in mind. Our goal is to provide you with the tools you need to do your best work without worrying about
managing tedious infrastructure tasks. This guide is designed to make common configurations easy to set up while providing you information about 
what we do to support you.

This document is organized into bite-sized sections. Each section has TL;DR (too long; didn't read) bullets at the top so you can quickly see what you
need. It is followed by a description, tips, examples and links to additional documentation.

We hope you find this guide useful and look forward to sharing this journey with you.

## Account Security
- Establish strong passwords
- Setup multi-factor authentication
- Add admin or developer users to help manage the account

ClickHouse Cloud allows you to setup a user name and password or use your Google account to login. For those setting up a user name and password, the 
best way to protect your ClickHouse account is to have all users set strong passwords. Minimum password settings currently comply with 
[NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) Authenticator Assurance Level 1, requiring at least 12 characters with multiple 
character types. There are many online resources to help you devise a password you can remember, or you can use a random password generator and 
store your password in a vault or safe for increased security. 

:::note 
If you are using Google Password Manager, you may need to manually add a special character to the automatically generated password
to comply with our password requirements. Google Password Manager can then store the new password for later use.
:::

Users setting a user name and password at login can also setup multi-factor authentication once logged into the control panel. Simply click your
initials in the upper right corner, select Profile, and click Set up in the Multi-factor authentication section.

Users at the account level can be granted administrator or developer privileges. Administrators can manabe billing, create, modify and 
terminate services. Developers can interact with existing services.

We provide additional security features to protect your account. If a login attempt looks supsicious, we will email you to ask if the attempt was
valid and reset your password automatically if you tell is it was not. We also provide an activity log within the application to show you when user 
accounts, IP address lists (more on this below), or services were created, modified or terminated.

## Network Security
- Limit database connections to known IP addresses.

We provide the ability to setup [IP Access Lists](/docs/en/cloud/security/ip-access-list.md), which restricts connections to your database to 
specific IP addresses or ranges. This feature is part of the initial setup or can be configured later by clicking on your service, then the Security tab. You can input IP addresses manually, 
upload a JSON file containing IP addresses or CIDR block information, or import addresses from other ClickHouse services you previously set up. 
You can also add a description to each IP address or block to help with administration.

:::note
If you connect to your database from a home internet connection, your internet service provider may periodically update your IP address. If this occurs,
simply sign into your account and update the IP address associated with your service.
:::

## Database Users
- Establish roles and manage access to databases and tables
- Securely setup and manage database users
- Periodically review access

You can setup additional user accounts within the database, use roles to make access management easier, and easily review user access periodically
to maintain good security. Follow these steps to roll out access to more people in your organization.
1. Set up a named user and assign them the `default_role`, then securely store the password for the 'default' account in a vault for break-glass purposes.

2. Create roles that provide specific rights to your databases and tables. 
More information on [role based access](/docs/en/sql-reference/statements/create/role.md).
``` 
CREATE ROLE general_read_only;
GRANT SELECT on my_database.* to general_read_only;
```

3. Use the SHA256_hash method when creating user accounts to secure passwords. More information on [user creation](/docs/en/sql-reference/statements/create/user.md).

**TIP:** Since users with less than administrative privileges cannot set their own password, ask the user to hash their password using a generator
such as [this one](https://tools.keycdn.com/sha256-online-generator) before providing it to the admin to setup the account. Passwords must consist of
12 characters with at least 1 of each: upper case, lower case, numeric, and special characters.

``` 
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
GRANT general_read_only TO userName;
```

4. Periodically review user access rights for continued appropriateness. The query below returns all users, roles and grants.

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

## Data Retention
- Set retention schedules for tables and columns

Attimes you will need to set automated policies to periodically delete data. ClickHouse provides table and column level TTL "time to live" settings that
can be used as a general setting or in combination with conditions to delete specific data elements from your tables. You will need a date/time column
to determine when to delete data. More information on [Time to Live (TTL) settings](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

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

## Data Deletion
- Batch delete data on demand

Certain data use cases require the ability to delete individual records on demand. ClickHouse utilizes a unique storage structure to enable fast queries.
We recommend data for individual deletion be processed in batches to minimize processing actions. Use the following command to delete data:
```
ALTER TABLE database.table DELETE WHERE field1 = 'criteria';
```
We also provide [Lightweight Delete](/docs/en/sql-reference/statements/delete.md/#lightweight-delete-internals) where data is immediately removed from visibility and eventually deleted.
