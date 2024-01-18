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

| Context      | Role Name             | Description |
|--------------|-----------------------|-------------|
| Console      | Admin                 | Full access to the ClickHouse organization |
| Console      | Developer             | Read only access to the ClickHouse organization, can generate read only API keys, cannot access billing data | 
| SQL console  | sql_console_admin     | Admin access to the database; granted automatically to console users with the Admin role and Full access assigned at the service level |
| SQL console  | sql_console_read_only | Read only access to the database; granted automatically to console users with Read only access assigned at the service level |
| Database     | default               | Admin access to the database; granted automatically to the `default` user at service creation |

## Initial Settings
The first user to set up your ClickHouse Cloud account is automatically assigned the Admin role in the console. This user may invite additional users to the organization and assign either the Admin or Developer role to users.

:::note To change a user's role in the console, go to the Users menu on the left and change the user's role in the drop down.:::

Databases have an account named `default` that is added automatically and granted the default_role upon service creation. The user that creates the service is presented with the automatically generated, random password that is assigned to the `default` account when the service is created. The password is not shown after initial setup, but may be changed by any user with Admin permissions in the console at a later time. This account or an account with Admin privileges within the console may set up additional database roles at any time.

:::note To change the password assigned to the `default` account in the console, go to the Services menu on the left, access the service, go to the Settings tab and click the Reset password button.:::

We recommend creating a new user account associated with a person and granting the user the default_role. This is so activities performed by users are identified to their user IDs and the `default` account is reserved for break-glass type activities. 

```
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

Users can use a SHA256 hash generator or code function such as haslib in Python to convert a 12+ character password with appropriate complexity to a SHA256 string to provide to the system administrator as the password. This ensures the administrator does not see or handle clear text passwords.

# Console Roles
Console users must be assigned a role and may be assigned the Admin or Developer role. 

| Component                         | Feature                    | Admin  | Developer |
|-----------------------------------|----------------------------|--------|-----------|
| Managing service                  | View services              |   ✅   |    ✅     |
|                                   | Create service             |   ✅   |    ❌     |
|                                   | Delete service             |   ✅   |    ❌     |
|                                   | Stop service               |   ✅   |    ❌     |
|                                   | Restart service            |   ✅   |    ❌     |
|                                   | Reset service password     |   ✅   |    ❌     |
|                                   | View service metrics       |   ✅   |    ❌     |
| Cloud API                         | View API keys              |   ✅   |    ✅     |
|                                   | Create API key             |   ✅   | Read-Only |
|                                   | Delete API key             |   ✅   |    ❌     |
| Managing console users            | View users                 |   ✅   |    ✅     |        
|                                   | Invite users               |   ✅   |    ❌     |
|                                   | Delete users               |   ✅   | Own account |
| Billing, Organziation and Support | View billing               |   ✅   |    ✅     |
|                                   | Manage billing             |   ✅   |    ❌     |
|                                   | View organization activity |   ✅   |    ❌     |
|                                   | Submit support requests    |   ✅   |    ✅     |
|                                   | View integrations          |   ✅   |    ✅     |

