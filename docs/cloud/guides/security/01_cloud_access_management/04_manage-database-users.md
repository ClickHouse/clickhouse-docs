---
sidebar_label: 'Manage database users'
slug: /cloud/security/manage-database-users
title: 'Manage database users'
description: 'This page describes how administrators can add database users, manage assignments, and remove database users'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

This guide demonstrates two ways to manage database users, within SQL console and directly within the database.

### SQL console passwordless authentication {#sql-console-passwordless-authentication}
SQL console users are created for each session and authenticated using X.509 certificates that are automatically rotated. The user is removed when the session is terminated. When generating access lists for audits, please navigate to the Settings tab for the service in the console and note the SQL console access in addition to the database users that exist in the database. If custom roles are configured, the user's access is listed in the role ending with the user's username.

## SQL console users and roles {#sql-console-users-and-roles}

Basic SQL console roles can be assigned to users with Service Read Only and Service Admin permissions. For more information, refer to [Manage SQL Console Role Assignments](/cloud/guides/sql-console/manage-sql-console-role-assignments). This guide demonstrates how to create a custom role for a SQL console user.

To create a custom role for a SQL console user and grant it a general role, run the following commands. The email address must match the user's email address in the console. 

<VerticalStepper headerLevel="h4">

#### Create `database_developer` and grant permissions {#create-role-grant-permissions} 

Create the `database_developer` role and grant `SHOW`, `CREATE`, `ALTER`, and `DELETE` permissions.
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### Create SQL console user role {#create-sql-console-user-role} 

Create a role for the SQL console user my.user@domain.com and assign it the database_developer role.
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### The user is assigned the new role when they use SQL console {#use-assigned-new-role}

The user will be assigned the role associated with their email address whenever they use SQL console. 

</VerticalStepper>

## Database authentication {#database-authentication}

### Database user ID and password {#database-user-id--password}

Use the SHA256_hash method when [creating user accounts](/sql-reference/statements/create/user.md) to secure passwords. ClickHouse database passwords must contain a minimum of 12 characters and meet complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

:::tip Generate passwords securely
Since users with less than administrative privileges cannot set their own password, ask the user to hash their password using a generator
such as [this one](https://tools.keycdn.com/sha256-online-generator) before providing it to the admin to setup the account. 
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

### Database user with secure shell (SSH) authentication {#database-ssh}

To set up SSH authentication for a ClickHouse Cloud database user.

1. Use ssh-keygen to create a keypair.
2. Use the public key to create the user.
3. Assign roles and/or permissions to the user.
4. Use the private key to authenticate against the service.

For a detailed walkthrough with examples, check out [How to connect to ClickHouse Cloud using SSH keys](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys) in our Knowledgebase.

## Database permissions {#database-permissions}
Configure the following within the services and databases using the SQL [GRANT](/sql-reference/statements/grant) statement.

| Role                  | Description                                                                   |
|:----------------------|:------------------------------------------------------------------------------|
| Default               | Full administrative access to services                                        |
| Custom                | Configure using the SQL [`GRANT`](/sql-reference/statements/grant) statement |

- Database roles are additive. This means if a user is a member of two roles, the user has the most access granted to the two roles. They do not lose access by adding roles.
- Database roles can be granted to other roles, resulting in a hierarchical structure. Roles inherit all permissions of the roles for which it is a member.
- Database roles are unique per service and may be applied across multiple databases within the same service.

The illustration below shows the different ways a user could be granted permissions.

<Image img={user_grant_permissions_options} alt='An illustration showing the different ways a user could be granted permissions' size="md" background="black"/>

### Initial settings {#initial-settings} 
Databases have an account named `default` that is added automatically and granted the default_role upon service creation. The user that creates the service is presented with the automatically generated, random password that is assigned to the `default` account when the service is created. The password is not shown after initial setup, but may be changed by any user with Service Admin permissions in the console at a later time. This account or an account with Service Admin privileges within the console may set up additional database users and roles at any time.

:::note
To change the password assigned to the `default` account in the console, go to the Services menu on the left, access the service, go to the Settings tab and click the Reset password button.
:::

We recommend creating a new user account associated with a person and granting the user the default_role. This is so activities performed by users are identified to their user IDs and the `default` account is reserved for break-glass type activities. 

  ```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
  ```

Users can use a SHA256 hash generator or code function such as `hashlib` in Python to convert a 12+ character password with appropriate complexity to a SHA256 string to provide to the system administrator as the password. This ensures the administrator does not see or handle clear text passwords.

### Database access listings with SQL console users {#database-access-listings-with-sql-console-users}
The following process can be used to generate a complete access listing across the SQL console and databases in your organization.

<VerticalStepper headerLevel="h4">

#### Get a list of all database grants {#get-a-list-of-all-database-grants}

Run the following queries to get a list of all grants in the database. 

```sql
SELECT grants.user_name,
grants.role_name,
users.name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
LEFT OUTER JOIN system.users ON role_grants.user_name = users.name

UNION ALL

SELECT grants.user_name,
grants.role_name,
role_grants.role_name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.role_grants LEFT OUTER JOIN system.grants ON role_grants.granted_role_name = grants.role_name
WHERE role_grants.user_name is null;
```

#### Associate grant list to Console users with access to SQL console {#associate-grant-list-to-console-users-with-access-to-sql-console}

Associate this list with Console users that have access to SQL console.
   
a. Go to the Console.

b. Select the relevant service.

c. Select Settings on the left.

d. Scroll to the SQL console access section.

e. Click the link for the number of users with access to the database `There are # users with access to this service.` to see the user listing.

</VerticalStepper>

## Warehouse users {#warehouse-users}

Warehouse users are shared across services within the same warehouse. For more information, review [warehouse access controls](/cloud/reference/warehouses#access-controls).
