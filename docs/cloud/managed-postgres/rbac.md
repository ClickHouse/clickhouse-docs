---
slug: /cloud/managed-postgres/rbac
sidebar_label: 'RBAC'
title: 'Managed Postgres RBAC'
description: 'Learn about role-based access control (RBAC) in ClickHouse Managed Postgres'
keywords: ['managed postgres RBAC', 'access control', 'roles', 'privileges', 'permissions']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import usersAndRoles from '@site/static/images/managed-postgres/rbac/usersandroles.png';
import postgresEntity from '@site/static/images/managed-postgres/rbac/postgresentity.png';
import newPostgresPerms from '@site/static/images/managed-postgres/rbac/newpostgresperms.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.rbac-beta" />

ClickHouse Cloud supports role-based access control (RBAC) for Managed Postgres services. You can create custom roles with specific permissions and assign them to organization members to control who can view or manage your Postgres services.

## Available permissions {#available-permissions}

Managed Postgres currently supports two permissions:

| Permission | Description |
|---|---|
| **View Postgres services** | Allows a user to see the Postgres service and its details. |
| **Manage Postgres services** | Allows a user to modify, scale, and configure the Postgres service. |

Creating a new Postgres service requires the existing **Organization manage** permission. The permissions above apply only to existing services.

:::note
More granular permissions will be available in a future release.
:::

## Creating a custom role {#creating-a-custom-role}

1. Click your organization name in the left sidebar and select **Users and roles**.

<Image img={usersAndRoles} alt="Users and roles menu" size="md" border/>

2. Switch to the **Roles** tab and click **Create role**.
3. Enter a name for the role, then click **+ Allow** and select **Postgres Service** from the entity list.

<Image img={postgresEntity} alt="Selecting the Postgres Service entity" size="md" border/>

4. Choose the Postgres service to scope the role to, then select the permissions to grant.

<Image img={newPostgresPerms} alt="Configuring Postgres permissions on a role" size="md" border/>

5. Click **Create role** to save.

## Assigning a role {#assigning-a-role}

Once the role is created, assign it to users from the **Users** tab on the same **Users and roles** page. A user can have multiple roles, and roles can be combined to build the exact access profile you need.