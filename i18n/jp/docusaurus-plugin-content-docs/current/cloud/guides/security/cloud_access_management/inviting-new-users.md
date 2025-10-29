---
'sidebar_label': '新しいユーザーを招待する'
'slug': '/cloud/security/inviting-new-users'
'title': '新しいユーザーを招待する'
'description': 'このページでは、管理者が自分の組織に新しいユーザーを招待し、彼らに役割を割り当てる方法について説明します。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

管理者は他のユーザーを組織に招待し、`Developer`、`Admin`、または`Billing Admin`の役割を割り当てることができます。

:::note
管理者と開発者はデータベースユーザーとは異なります。データベースユーザーやロールを作成するには、SQLコンソールを使用してください。詳細については、[Users and Roles](/cloud/security/cloud-access-management)に関するドキュメントをご覧ください。
:::

ユーザーを招待するには、組織を選択し、`Users and roles`をクリックします：

<Image img={users_and_roles} size="md" alt="ClickHouse Cloud users and roles page" />

<br />

`Invite members`を選択し、一度に最大3人の新しいユーザーのメールアドレスを入力し、それぞれの役割を選択します。

<Image img={invite_user} size="md" alt="ClickHouse Cloud invite user page" />

<br />

`Send invites`をクリックします。ユーザーは組織に参加できるメールを受け取ります。
