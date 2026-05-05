---
sidebar_label: 'Manage custom roles'
slug: /cloud/guides/security/manage-custom-roles
title: 'Manage custom roles'
description: 'This page describes how administrators can add, modify, and remove custom roles'
doc_type: 'guide'
keywords: ['custom roles', 'security', 'permissions']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/2_custom_role.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/3_custom_role.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/4_custom_role.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/5_custom_role.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/6_custom_role.png'

This guide is intended for users with the Admin role in ClickHouse Cloud.

ClickHouse Cloud customers may select from pre-defined system roles or create custom roles to assign to users. For more information on system roles and their associated permissions, review [Console roles and permissions](/cloud/security/console-roles). This guide provides details for managing custom roles.

## Create custom roles {#create-custom-role}

Custom roles can contain a combination of organization, service, and database permissions. Permissions may be applied to all or a subset of services and databases.

<VerticalStepper headerLevel="h3">

### Access organization settings and select Users and roles {#users-and-roles-1}

From the services page, select the name of your organization. Select the `Users and roles` menu item from the popup menu.

<Image img={step_1} size="lg"/>

### Select the `Roles` tab {#roles-tab}

Select the `Roles` tab from the top middle of the screen.

<Image img={step_2} size="lg"/>

### Select `Create new role` from the upper right {#create-new-role}

Select the `Create new role` button in the upper right of the screen.

<Image img={step_3} size="lg"/>

### Name the role {#name-the-role}

Enter a descriptive role name. This will be the name you will see when assigning roles to users and API keys.

<Image img={step_4} size="md"/>

### Click `Allow` and select permission scope {#scope-permissions}

Click the `Allow` button and select from Organization, Service, and/or Database permissions. For a description of all permissions, see [Console roles and permissions](/cloud/security/console-roles).

:::tip
Ensure users who will log into the console have a minimum of Organization > Access organization permissions.
:::

<Image img={step_5} size="md"/>

### Review your new role {#review-role}

Review permissions assigned to your new role before finalizing. Click `Create role` when done.

<Image img={step_6} size="md"/>

</VerticalStepper>

## Update custom roles {#update-custom-role}

Custom roles may be updated after they're created. Users will lose any permissions removed from the role and will gain any permissions added.

:::tip
User permissions are additive. If a user has permission to perform an operation as part of multiple roles, they may not immediately lose access if permission is removed from only one role.
:::

1. Access organization settings and select `Users and roles`
2. Select the `Roles` tab
3. Select the three dots next to the role you would like to update
4. Select `Edit`
5. Modify the permissions
6. Select `Edit role`

## Delete custom roles {#delete-custom-role}

Custom roles may be deleted at any time.

:::warning
You must have at least one user in the organization with administrative permissions. If deleting the role removes administrative permissions from the last user, you can't delete it. To resolve this, assign at least one user the Admin system role before deleting the custom role.
:::

1. Access organization settings and select `Users and roles`
2. Select the `Roles` tab
3. Select the three dots next to the role you would like to delete
4. Review the users and API keys that will lose access when the role is removed. Adjust assignments as needed.
5. Select `Delete role` to complete the process
