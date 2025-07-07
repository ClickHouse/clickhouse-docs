---
'sidebar_label': '新しいユーザーの招待'
'slug': '/cloud/security/inviting-new-users'
'title': '新しいユーザーの招待'
'description': 'このページでは管理者が組織に新しいユーザーを招待し、それらに役割を割り当てる方法について説明しています'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Administrators can invite others to organization, assigning them the `Developer`, `Admin` or `Billing Admin` role.

:::note
Admins and developers are different than database users. To create database users and roles, please use the SQL console. To learn more, visit our docs on [Users and Roles](/cloud/security/cloud-access-management).
:::

To invite a user, select the organization and click `Users and roles`:

<Image img={users_and_roles} size="md" alt="ClickHouse Cloud users and roles page" />

<br />

Select `Invite members`, and enter the email address of up to 3 new users at once, selecting the role for each.

<Image img={invite_user} size="md" alt="ClickHouse Cloud invite user page" />

<br />

Click `Send invites`. Users will receive an email from which they can join the organization.
