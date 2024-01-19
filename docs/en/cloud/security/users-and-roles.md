---
title: "Cloud access management"
slug: "/en/security/cloud-access-management"
---

# Access Control in ClickHouse Cloud
ClickHouse controls user access in two places, via the console and via the database. Console access is managed via the clickhouse.cloud user interface. Database access is managed via database user accounts and roles. Additionally, console users can be granted roles within the database that enable the console user to interact with the database via our SQL console.

## Types of Roles
The following describes the different types of roles available:
- **Console role**       Enables access to the clickhouse.cloud console
- **Database role**      Enables management of permissions within a single service
- **SQL console role**   Specially named database role that enables a console user to access a database with assigned permissions via SQL console.

## Predefined Roles
ClickHouse Cloud offers a limited number of predefined roles to enable access management. Additional custom database roles can be created at any time using [CREATE ROLE](/en/sql-reference/statements/create/role) and [GRANT](/en/sql-reference/statements/grant) commands in the database.

| Context      | Role Name             | Description                                                                                   |
|--------------|-----------------------|-----------------------------------------------------------------------------------------------|
| Console      | Admin                 | Full access to the ClickHouse organization                                                    |
| Console      | Developer             | Read only access to the ClickHouse organization                                               | 
| SQL console  | sql_console_admin     | Admin access to the database                                                                  |
| SQL console  | sql_console_read_only | Read only access to the database                                                              |
| Database     | default               | Admin access to the database; granted automatically to the `default` user at service creation |

## Initial Settings
The first user to set up your ClickHouse Cloud account is automatically assigned the Admin role in the console. This user may invite additional users to the organization and assign either the Admin or Developer role to users.

:::note
To change a user's role in the console, go to the Users menu on the left and change the user's role in the drop down.
:::

Databases have an account named `default` that is added automatically and granted the default_role upon service creation. The user that creates the service is presented with the automatically generated, random password that is assigned to the `default` account when the service is created. The password is not shown after initial setup, but may be changed by any user with Admin permissions in the console at a later time. This account or an account with Admin privileges within the console may set up additional database users and roles at any time.

:::note
To change the password assigned to the `default` account in the console, go to the Services menu on the left, access the service, go to the Settings tab and click the Reset password button.
:::

We recommend creating a new user account associated with a person and granting the user the default_role. This is so activities performed by users are identified to their user IDs and the `default` account is reserved for break-glass type activities. 

```
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

Users can use a SHA256 hash generator or code function such as hashlib in Python to convert a 12+ character password with appropriate complexity to a SHA256 string to provide to the system administrator as the password. This ensures the administrator does not see or handle clear text passwords.

## Console Roles
Console users must be assigned a role and may be assigned the Admin or Developer role. Permissions associated with each role are included below. 

| Component                         | Feature                    | Admin  | Developer |
|-----------------------------------|----------------------------|--------|-----------|
| Managing service                  | View service               |   ✅   |    ✅     |
|                                   | Create service             |   ✅   |    ❌     |
|                                   | Delete service             |   ✅   |    ❌     |
|                                   | Stop service               |   ✅   |    ❌     |
|                                   | Restart service            |   ✅   |    ❌     |
|                                   | Reset service password     |   ✅   |    ❌     |
|                                   | View service metrics       |   ✅   |    ✅     |
| Cloud API                         | View API key records       |   ✅   |    ✅     |
|                                   | Create API key             |   ✅   | Read-Only |
|                                   | Delete API key             |   ✅   | Own key   |
| Managing console users            | View users                 |   ✅   |    ✅     |        
|                                   | Invite users               |   ✅   |    ❌     |
|                                   | Change user role           |   ✅   |    ❌     |
|                                   | Delete users               |   ✅   |    ❌     |
| Billing, Organziation and Support | View billing               |   ✅   |    ✅     |
|                                   | Manage billing             |   ✅   |    ❌     |
|                                   | View organization activity |   ✅   |    ❌     |
|                                   | Submit support requests    |   ✅   |    ✅     |
|                                   | View integrations          |   ✅   |    ✅     |

## SQL Console Roles
Our console includes a SQL console for interacting with databases using passwordless authentication. Users granted Admin privileges in the console have administrative access to all databases in the organization. Users granted the Developer role have no access by default, but may be assigned either 'Full access' or 'Read only' database permissions from the console. The 'Read only' role initially grants read-only access to the account. However, once read-only access is granted a new custom role may be created specifically for that SQL consolue user that will be associated with that user when it is used to connect to the database via SQL console.

:::note
To allow a user with the Developer role in the console to access SQL console, go to the Services menu on the left, access the service, click Settings, scroll down to the SQL console access section and select either 'Full access' or 'Read only'. Once access is granted, use the process shown in ***Creating SQL Console Roles*** below to assign custom roles. 
:::

### More on Passwordless Authentication
SQL console users are created for each session and authenticated using X.509 certificates that are automatically rotated. The user is removed when the session is terminated. When generating access lists for audits, please navigate to the Settings tab for the service in the console and note the SQL console access in addition to the database users that exist in the database. If custom roles are configured, the user's access is listed in the role ending with the user's username.

## Creating SQL Console Roles
Custom roles may be created and associated with SQL console users. Since SQL console creates a new user account each time the user opens a new session, the system uses role naming conventions to associate custom database roles with the user. This means each user is assigned an individual role. Individual roles can then be assigned access directly via the GRANT statement or users may establish new general roles such as database_developer or security_administrator and assign the individual user roles access via the more general roles.

To create a custom role for a SQL console user and grant it a general role, run the following commans. the email address must match the user's email address in the console. 
1. Create the database_developer role and grant SHOW, CREATE, ALTER, and DELETE permissions.

```
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

2. Create a role for the SQL console user my.user@domain.com and assign it the database_developer role.

```
CREATE ROLE OR REPLACE ‘sql_console_role_my.user@domain.com’;
GRANT database_developer TO ‘sql_console_role_my.user@domain.com’;
```

When using this role construction, the query to show user access needs to be modified to include the role-to-role grant when the user is not present.

```
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

## Database Roles
Users and custom roles may also be created within the database directly using the CREATE User, CREATE Role, and GRANT statements. Other than roles created for SQL console, these users and roles are independent of console users and roles.

Database roles are additive. This means if a user is a member of two roles, the user has the most access granted to the two roles. They do not lose access by adding roles.

Database roles can be granted to other roles, resulting in a hierarchial structure. Roles inherit all permissions of the roles for which it is a member.

Database roles are unique per service and may be applied across multiple databases within the same service.

The illustration below shows the different ways a user could be granted permissions.

![Screenshot 2024-01-18 at 5 14 41 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/94b45f98-48cc-4907-87d8-5eff1ac468e5)

## Illustrated Guides
1. Log into your ClickHouse Cloud account
2. Add users to your ClickHouse Cloud organization and assign console roles
![Screenshot 2024-01-18 at 5 22 07 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/9a5169ea-4688-4a42-a52f-708f8a7d87b0)
  
3. Create a service in ClickHouse Cloud
![Screenshot 2024-01-18 at 5 23 38 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/47082f47-1d63-4a7f-9a10-5f8feaacd35a)

4. Change the `default` database user password
![Screenshot 2024-01-18 at 5 27 05 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/fe8cf05f-c9c1-413f-8268-78c73c1a8e14)

5. Create a new administrative database user and assign the default_role
![Screenshot 2024-01-18 at 5 33 56 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/24e1aba7-5409-4c59-96fd-a8f5e24c760d)

6. Enable developer access to SQL console in the console
![Screenshot 2024-01-18 at 5 34 50 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/c01f1093-7b32-4c70-bad1-f5e44584e40c)

7. Create custom database role(s) for SQL console users
![Screenshot 2024-01-18 at 5 35 53 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/9ba3f132-143b-4f89-9948-364bd3ea4a7b)

8. Create custom database role(s)
   Refer to step 7, part 3. This can be done to create any role.

9. Create database users
   Refer to step 5, part 3. The first line can be used to create any user.


