---
'sidebar_label': '邀请新用户'
'slug': '/cloud/security/inviting-new-users'
'title': '邀请新用户'
'description': '本页面描述了管理员如何邀请新用户加入其组织并分配角色给他们'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

管理员可以邀请其他成员加入组织，并为其分配 `Developer`、`Admin` 或 `Billing Admin` 角色。

:::note
管理员和开发者与数据库用户不同。要创建数据库用户和角色，请使用 SQL 控制台。要了解更多信息，请访问我们关于 [用户和角色](/cloud/security/cloud-access-management) 的文档。
:::

要邀请用户，请选择组织并点击 `Users and roles`：

<Image img={users_and_roles} size="md" alt="ClickHouse Cloud 用户和角色页面" />

<br />

选择 `Invite members`，并输入最多 3 个新用户的电子邮件地址，同时为每个用户选择角色。

<Image img={invite_user} size="md" alt="ClickHouse Cloud 邀请用户页面" />

<br />

点击 `Send invites`。用户将收到一封电子邮件，邮件中包含他们加入组织的链接。
