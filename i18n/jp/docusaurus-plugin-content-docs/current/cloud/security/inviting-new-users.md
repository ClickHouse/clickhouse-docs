---
sidebar_label: '新しいユーザーの招待'
slug: /cloud/security/inviting-new-users
title: '新しいユーザーの招待'
description: 'このページでは、管理者が新しいユーザーを組織に招待し、役割を割り当てる方法について説明します。'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

管理者は、他の人を組織に招待し、`Developer`、`Admin`、または`Billing Admin`の役割を割り当てることができます。

:::note
管理者と開発者は、データベースユーザーとは異なります。データベースユーザーと役割を作成するには、SQLコンソールを使用してください。詳細については、[ユーザーと役割](/cloud/security/cloud-access-management)に関するドキュメントをご覧ください。
:::

ユーザーを招待するには、組織を選択し、`Users and roles`をクリックします：

<Image img={users_and_roles} size="md" alt="ClickHouse Cloudのユーザーと役割ページ" />

<br />

`Invite members`を選択し、最大3人の新しいユーザーのメールアドレスを入力し、それぞれの役割を選択します。

<Image img={invite_user} size="md" alt="ClickHouse Cloudのユーザー招待ページ" />

<br />

`Send invites`をクリックします。ユーザーは、そこから組織に参加できるメールを受け取ります。
