---
sidebar_label: 新しいユーザーの招待
slug: /cloud/security/inviting-new-users
title: 新しいユーザーの招待
---

管理者は他のユーザーを組織に招待し、`Developer`、`Admin`、または`Billing Admin`の役割を割り当てることができます。

:::note
管理者と開発者はデータベースユーザーとは異なります。データベースユーザーと役割を作成するには、SQLコンソールを使用してください。詳細については、[ユーザーと役割](/cloud/security/cloud-access-management)に関するドキュメントをご覧ください。
:::

ユーザーを招待するには、組織を選択し、`Users and roles`をクリックします：

<img src={require('./images/users_and_roles.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

`Invite members`を選択し、最大3人の新しいユーザーのメールアドレスを一度に入力し、それぞれの役割を選択します。

<img src={require('./images/invite-user.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '1000px'}}
/>

<br />

`Send invites`をクリックします。ユーザーは、組織に参加するためのメールを受け取ります。
