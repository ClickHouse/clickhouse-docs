---
sidebar_label: 新しいユーザーの招待
slug: /cloud/security/inviting-new-users
title: 新しいユーザーの招待
---

import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

管理者は他の人を組織に招待し、`Developer`、`Admin` または `Billing Admin` の役割を割り当てることができます。

:::note
管理者および開発者はデータベースユーザーとは異なります。データベースユーザーと役割を作成するには、SQLコンソールを使用してください。詳細については、[ユーザーと役割](/cloud/security/cloud-access-management)に関するドキュメントをご覧ください。
:::

ユーザーを招待するには、組織を選択し、`Users and roles`をクリックします:

<img src={users_and_roles} alt="ClickHouse Cloudユーザーと役割のページ" style={{width: '300px'}} />

<br />

`Invite members`を選択し、一度に最大3人の新しいユーザーのメールアドレスを入力し、それぞれの役割を選択します。

<img src={invite_user} alt="ClickHouse Cloudユーザー招待ページ" style={{width: '1000px'}} />

<br />

`Send invites`をクリックします。ユーザーは、組織に参加するためのメールを受け取ります。
