---
sidebar_label: 'クラウドユーザーの管理'
slug: /cloud/security/manage-cloud-users
title: 'クラウドユーザーの管理'
description: 'このページでは、管理者がユーザーの追加、割り当ての管理、およびユーザーの削除を行う方法について説明します'
doc_type: 'guide'
keywords: ['クラウドユーザー', 'アクセス管理', 'セキュリティ', '権限', 'チーム管理']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

このガイドは、ClickHouse Cloud において Organization Admin ロールを持つユーザーを対象としています。


## 組織にユーザーを追加する {#add-users}

### ユーザーを招待する {#invite-users}

管理者は一度に最大3名のユーザーを招待でき、招待時に組織レベルおよびサービスレベルのロールを割り当てることができます。

ユーザーを招待するには:

1. 左下隅の組織名を選択します
2. `Users and roles`をクリックします
3. 左上隅の`Invite members`を選択します
4. 最大3名の新規ユーザーのメールアドレスを入力します
5. ユーザーに割り当てる組織ロールとサービスロールを選択します
6. `Send invites`をクリックします

ユーザーは組織に参加するためのメールを受信します。招待の承認に関する詳細については、[アカウントの管理](/cloud/security/manage-my-account)を参照してください。

### SAMLアイデンティティプロバイダー経由でユーザーを追加する {#add-users-via-saml}

<EnterprisePlanFeatureBadge feature='SAML SSO' />

組織が[SAML SSO](/cloud/security/saml-setup)用に設定されている場合は、以下の手順に従って組織にユーザーを追加します。

1. アイデンティティプロバイダーのSAMLアプリケーションにユーザーを追加します。ユーザーは初回ログインするまでClickHouseに表示されません
2. ユーザーがClickHouse Cloudにログインすると、自動的に`Member`ロールが割り当てられます。このロールはログインのみが可能で、他のアクセス権限はありません
3. 権限を付与するには、以下の`Manage user role assignments`の手順に従ってください

### SAML専用認証の強制 {#enforce-saml}

組織内に組織管理者ロールが割り当てられたSAMLユーザーが少なくとも1名存在する場合、他の認証方法を使用しているユーザーを組織から削除することで、組織に対してSAML専用認証を強制できます。


## ユーザーロール割り当ての管理 {#manage-role-assignments}

Organization Adminロールが割り当てられたユーザーは、他のユーザーの権限をいつでも更新できます。

<VerticalStepper headerLevel="h3">

### 組織設定へのアクセス {#access-organization-settings}

サービスページから組織名を選択します:

<Image img={step_1} size='md' />

### ユーザーとロールへのアクセス {#access-users-and-roles}

ポップアップメニューから`Users and roles`メニュー項目を選択します。

<Image img={step_2} size='md' />

### 更新するユーザーの選択 {#select-user-to-update}

アクセス権を変更するユーザーの行末にあるメニュー項目を選択します:

<Image img={step_3} size='lg' />

### `edit`の選択 {#select-edit}

<Image img={step_4} size='lg' />

ページの右側にタブが表示されます:

<Image img={step_5} size='lg' />

### 権限の更新 {#update-permissions}

ドロップダウンメニュー項目を選択して、コンソール全体のアクセス権限と、ユーザーがClickHouseコンソール内でアクセスできる機能を調整します。ロールと関連する権限の一覧については、[コンソールのロールと権限](/cloud/security/console-roles)を参照してください。

ドロップダウンメニュー項目を選択して、選択したユーザーのサービスロールのアクセス範囲を調整します。`Specific services`を選択すると、サービスごとにユーザーのロールを制御できます。

<Image img={step_6} size='md' />

### 変更の保存 {#save-changes}

タブの下部にある`Save changes`ボタンで変更を保存します:

<Image img={step_7} size='md' />

</VerticalStepper>


## ユーザーの削除 {#remove-user}

:::note SAMLユーザーの削除
IDプロバイダーでClickHouseアプリケーションから割り当て解除されたSAMLユーザーは、ClickHouse Cloudにログインできません。アカウントはコンソールから自動的には削除されないため、手動で削除する必要があります。
:::

ユーザーを削除するには、以下の手順に従ってください。

1. 左下隅の組織名を選択します
2. `ユーザーとロール`をクリックします
3. ユーザー名の横にある3点リーダーをクリックし、`削除`を選択します
4. `ユーザーを削除`ボタンをクリックして操作を確定します
