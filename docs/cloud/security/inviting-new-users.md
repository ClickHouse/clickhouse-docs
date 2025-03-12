---
sidebar_label: 'Inviting new users'
slug: /cloud/security/inviting-new-users
title: 'Inviting New Users'
description: 'TODO: Add description'
---

import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Administrators can invite others to organization, assigning them the `Developer`, `Admin` or `Billing Admin` role.

:::note
Admins and developers are different than database users. To create database users and roles, please use the SQL console. To learn more, visit our docs on [Users and Roles](/cloud/security/cloud-access-management).
:::

To invite a user, select the organization and click `Users and roles`:

<img src={users_and_roles} alt="ClickHouse Cloud users and roles page" style={{width: '300px'}} />

<br />

Select `Invite members`, and enter the email address of up to 3 new users at once, selecting the role for each.

<img src={invite_user} alt="ClickHouse Cloud invite user page" style={{width: '1000px'}} />

<br />

Click `Send invites`. Users will receive an email from which they can join the organization.
