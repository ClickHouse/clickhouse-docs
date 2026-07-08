---
sidebar_label: 'クラウドユーザーの管理'
slug: /cloud/security/manage-cloud-users
title: 'クラウドユーザーの管理'
description: 'このページでは、管理者によるユーザーの追加、割り当ての管理、およびユーザーの削除方法について説明します'
doc_type: 'guide'
keywords: ['クラウドユーザー', 'アクセス管理', 'セキュリティ', '権限', 'チーム管理']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/2_invite_user.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/3_invite_user.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/4_invite_user.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/5_edit_user.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/6_edit_user.png'

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

本ガイドは、ClickHouse Cloud で Admin ロールを持つユーザーを対象としています。

## 組織にユーザーを追加する \{#add-users\}

### ユーザーを招待する \{#invite-users\}

管理者は、一度に複数のユーザーを招待し、招待時に1つ以上のロールを割り当てることができます。

<VerticalStepper headerLevel="h3">
  ### 組織の設定にアクセスし、`Users and roles` を選択する

  services ページで、組織名を選択します。ポップアップメニューから `Users and roles` を選択します。

  <Image img={step_1} size="lg" />

  ### 左上の `Invite members` を選択する

  左上の `Invite members` ボタンをクリックします。

  <Image img={step_2} size="lg" />

  ### 新しいメンバーのメールアドレスを入力し、ロールを割り当てる

  招待画面の上部にメールアドレスを入力します。ユーザーに割り当てるロールを1つ以上選択します。

  <Image img={step_3} size="lg" />

  ### `Send invites` をクリックする

  画面下部の `Send invites` をクリックします。ユーザーには、組織に参加するためのメールが送信されます。招待の承諾方法の詳細については、[Manage my account](/cloud/security/manage-my-account) を参照してください。

  <Image img={step_4} size="lg" />
</VerticalStepper>

### SAML アイデンティティプロバイダー経由でユーザーを追加する \{#users-and-roles-1\}

<EnterprisePlanFeatureBadge feature="SAML SSO" />

組織で [SAML SSO](/cloud/security/saml-setup) が構成されている場合、次の手順に従って組織にユーザーを追加します。

1. アイデンティティプロバイダー内の SAML アプリケーションにユーザーを追加します。ユーザーは一度ログインするまで ClickHouse には表示されません
2. ユーザーが ClickHouse Cloud にログインすると、SAML 設定で選択したデフォルトロールが自動的に割り当てられます。
3. 権限を付与するには、以下の `ユーザーのロール割り当てを管理する` の手順に従ってください

### SAML のみの認証を強制する \{#invite-members\}

少なくとも 1 名の SAML ユーザーが Admin ロールに割り当てられている状態になったら、その他の認証方法を使用するユーザーを組織から削除し、組織に対して SAML のみの認証を強制します。

## ユーザーのロール割り当てを管理する

Admin ロールが割り当てられているユーザーは、いつでも他のユーザーの権限を更新できます。

<VerticalStepper headerLevel="h3">
  ### 組織設定にアクセスし、Users and roles を選択する

  services ページで、組織名を選択します。ポップアップメニューから `Users and roles` を選択します。

  <Image img={step_1} size="lg" />

  ### 更新するユーザーを選択し、Edit を選択する

  アクセス権を変更するユーザーの行の末尾にあるメニューを選択します。ポップアップメニューから `edit` を選択します。

  <Image img={step_5} size="lg" />

  ### 権限を更新する

  `Roles` ボックスをクリックしてメニューを展開します。チェックボックスをオンまたはオフにして、ユーザーのロールを追加または削除します。ロールと対応する権限の一覧については、[Console roles and permissions](/cloud/security/console-roles) を参照してください。

  <Image img={step_6} size="lg" />

  ### 変更を保存する

  タブの下部にある `Save changes` ボタンをクリックして変更を保存します。
</VerticalStepper>

## ユーザーを削除する {#remove-user}
:::note SAML ユーザーの削除
アイデンティティプロバイダーで ClickHouse アプリケーションから割り当て解除された SAML ユーザーは、ClickHouse Cloud にログインできません。アカウントはコンソールから自動的には削除されないため、手動で削除する必要があります。
:::

次の手順に従ってユーザーを削除します。

1. 左下隅の組織名を選択します。
2. `Users and roles` をクリックします。
3. 対象ユーザー名の横にある三点リーダーアイコンをクリックし、`Remove` を選択します。
4. `Remove user` ボタンをクリックして操作を確定します。