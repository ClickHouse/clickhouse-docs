---
sidebar_label: '邀请新用户'
slug: /cloud/security/inviting-new-users
title: '邀请新用户'
---

import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

管理员可以邀请其他人加入组织，并为他们分配 `Developer`、`Admin` 或 `Billing Admin` 角色。

:::note
管理员和开发者与数据库用户是不同的。要创建数据库用户和角色，请使用 SQL 控制台。要了解更多信息，请访问我们的文档 [用户和角色](/cloud/security/cloud-access-management)。
:::

要邀请用户，请选择组织并点击 `Users and roles`：

<img src={users_and_roles} alt="ClickHouse Cloud 用户和角色页面" style={{width: '300px'}} />

<br />

选择 `Invite members`，然后一次输入最多 3 个新用户的电子邮件地址，为每个用户选择角色。

<img src={invite_user} alt="ClickHouse Cloud 邀请用户页面" style={{width: '1000px'}} />

<br />

点击 `Send invites`。用户将收到一封可以用来加入组织的电子邮件。
