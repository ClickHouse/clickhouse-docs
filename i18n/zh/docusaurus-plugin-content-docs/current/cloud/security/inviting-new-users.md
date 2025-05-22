---
'sidebar_label': '邀请新用户'
'slug': '/cloud/security/inviting-new-users'
'title': '邀请新用户'
'description': '本页面描述了管理员如何邀请新用户加入他们的组织并为其分配角色。'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Administrators can invite others to organization, assigning them the `Developer`, `Admin` or `Billing Admin` role.

:::note
Admins 和 developers 与数据库用户不同。要创建数据库用户和角色，请使用 SQL 控制台。要了解更多信息，请访问我们的文档 [Users and Roles](/cloud/security/cloud-access-management)。
:::

要邀请用户，选择组织并点击 `Users and roles`：

<Image img={users_and_roles} size="md" alt="ClickHouse Cloud users and roles page" />

<br />

选择 `Invite members`，并输入多达 3 个新用户的电子邮件地址，同时为每个用户选择角色。

<Image img={invite_user} size="md" alt="ClickHouse Cloud invite user page" />

<br />

点击 `Send invites`。用户将收到一封电子邮件，从中可以加入组织。
