---
sidebar_label: 'Overview'
slug: /cloud/security/cloud-access-management/overview
title: 'Cloud access management'
description: 'Describes how access control in ClickHouse cloud works, including information on role types'
---

# Access control in ClickHouse Cloud {#access-control-in-clickhouse-cloud}
ClickHouse controls user access in two places, via the console and via the database. Console access is managed via the clickhouse.cloud user interface. Database access is managed via database user accounts and roles. Additionally, console users can be granted roles within the database that enable the console user to interact with the database via our SQL console.

## Console users and roles {#console-users-and-roles}
Configure Organization and Service role assignments within the Console > Users and roles page. Configure SQL Console role assignments in the settings page for each service.

Users must be assigned an organization level role and may optionally be assigned service roles for one or more services. Service roles may be optionally configured for users to access the SQL console in the service settings page.
- Users assigned the Organization Admin role are granted Service Admin by default.
- Users added to an organization via a SAML integration are automatically assigned the Member role.
- Service Admin is assigned the SQL console admin role by default. SQL console permissions may be removed in the service settings page.

:::note
The first user to set up your ClickHouse Cloud account is automatically assigned the Admin role in the console. This user may invite additional users to the organization and assign either the Admin or Developer role to users.
:::

| Context      | Role                   | Description                                      |
|:-------------|:-----------------------|:-------------------------------------------------|
| Organization | Admin                  | Perform all administrative activities for an organization and control all settings. Assigned to the first user in the organization by default. |
| Organization | Developer             | View access to everything except Services, ability to generate read-only API keys. |
| Organization | Billing               | View usage and invoices, and manage payment methods. |
| Organization | Member                | Sign-in only with the ability to manage personal profile settings. Assigned to SAML SSO users by default. |
| Service      | Service Admin         | Manage service settings.                        |
| Service      | Service ReadOnly      | View services and settings.                     |
| SQL console  | SQL console admin     | Administrative access to databases within the service equivalent to the Default database role. |
| SQL console  | SQL console read only | Read only access to databases within the service |
| SQL console  | Custom                | Configure using SQL [GRANT](/en/sql-reference/statements/grant) statement; assign the role to a SQL console user by naming the role after the user |
  
To create a custom role for a SQL console user and grant it a general role, run the following commands. The email address must match the user's email address in the console. 
    
1. Create the database_developer role and grant SHOW, CREATE, ALTER, and DELETE permissions.
    
    ```sql
    CREATE ROLE OR REPLACE database_developer;
    GRANT SHOW ON * TO database_developer;
    GRANT CREATE ON * TO database_developer;
    GRANT ALTER ON * TO database_developer;
    GRANT DELETE ON * TO database_developer;
    ```
    
2. Create a role for the SQL console user my.user@domain.com and assign it the database_developer role.
    
    ```sql
    CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
    GRANT database_developer TO `sql-console-role:my.user@domain.com`;
    ```

### SQL console passwordless authentication {#sql-console-passwordless-authentication}
SQL console users are created for each session and authenticated using X.509 certificates that are automatically rotated. The user is removed when the session is terminated. When generating access lists for audits, please navigate to the Settings tab for the service in the console and note the SQL console access in addition to the database users that exist in the database. If custom roles are configured, the user's access is listed in the role ending with the user's username.

## Database permissions {#database-permissions}
Configure the following within the services and databases using the SQL [GRANT](/en/sql-reference/statements/grant) statement.

| Role                  | Description                                                                   |
|:----------------------|:------------------------------------------------------------------------------|
| Default               | Full administrative access to services                                        |
| Custom                | Configure using the SQL [GRANT](/en/sql-reference/statements/grant) statement |


- Database roles are additive. This means if a user is a member of two roles, the user has the most access granted to the two roles. They do not lose access by adding roles.
- Database roles can be granted to other roles, resulting in a hierarchical structure. Roles inherit all permissions of the roles for which it is a member.
- Database roles are unique per service and may be applied across multiple databases within the same service.

The illustration below shows the different ways a user could be granted permissions.

![Screenshot 2024-01-18 at 5 14 41 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/94b45f98-48cc-4907-87d8-5eff1ac468e5)

### Default database user {#default-database-user}
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

