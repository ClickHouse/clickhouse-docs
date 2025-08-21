---
sidebar_label: 'Overview'
slug: /cloud/security/cloud-access-management/overview
title: 'Cloud access management'
description: 'Describes how access control in ClickHouse cloud works, including information on role types'
doc_type: how-to
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

# Access control in ClickHouse Cloud {#access-control-in-clickhouse-cloud}
ClickHouse controls user access in two places, via the console and via the database. Console access is managed via the clickhouse.cloud user interface. Database access is managed via database user accounts and roles. Additionally, console users can be granted roles within the database that enable the console user to interact with the database via our SQL console.

## Console users and roles {#console-users-and-roles}
Configure Organization and Service role assignments within the Console > Users and roles page. Configure SQL Console role assignments in the settings page for each service.

Users must be assigned an organization level role and may optionally be assigned service roles for one or more services. Service roles may be optionally configured for users to access the SQL console in the service settings page.
- Users assigned the Organization Admin role are granted Service Admin by default.
- Users added to an organization via a SAML integration are automatically assigned the Member role, with least privilege and without access to any services until configured.
- Service Admin is assigned the SQL console admin role by default. SQL console permissions may be removed in the service settings page.

| Context      | Role                   | Description                                      |
|:-------------|:-----------------------|:-------------------------------------------------|
| Organization | Admin                  | Perform all administrative activities for an organization and control all settings. Assigned to the first user in the organization by default. |
| Organization | Developer             | View access to everything except Services, ability to generate read-only API keys. |
| Organization | Billing               | View usage and invoices, and manage payment methods. |
| Organization | Member                | Sign-in only with the ability to manage personal profile settings. Assigned to SAML SSO users by default. |
| Service      | Service Admin         | Manage service settings.                        |
| Service      | Service Read Only     | View services and settings.                     |
| SQL console  | SQL console admin     | Administrative access to databases within the service equivalent to the Default database role. |
| SQL console  | SQL console read only | Read only access to databases within the service |
| SQL console  | Custom                | Configure using SQL [`GRANT`](/sql-reference/statements/grant) statement; assign the role to a SQL console user by naming the role after the user |
  
To create a custom role for a SQL console user and grant it a general role, run the following commands. The email address must match the user's email address in the console. 
    
1. Create the database_developer role and grant `SHOW`, `CREATE`, `ALTER`, and `DELETE` permissions.
    
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

1. Run the following queries to get a list of all grants in the database. 

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
    
2. Associate this list to Console users with access to SQL console.
   
    a. Go to the Console.

    b. Select the relevant service.

    c. Select Settings on the left.

    d. Scroll to the SQL console access section.

    e. Click the link for the number of users with access to the database `There are # users with access to this service.` to see the user listing.
