---
sidebar_label: 'クラウドユーザーの管理'
slug: /cloud/security/manage-cloud-users
title: 'クラウドユーザーの管理'
description: 'このページでは、管理者によるユーザーの追加、割り当ての管理、およびユーザーの削除方法について説明します'
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

本ガイドは、ClickHouse Cloud で Organization Admin ロールを持つユーザーを対象としています。


## 組織にユーザーを追加する \{#add-users\}

### ユーザーを招待する \{#invite-users\}

管理者は、一度に最大 3 名までのユーザーを招待でき、招待時に組織およびサービスレベルのロールを割り当てることができます。

ユーザーを招待するには:
1. 左下隅の組織名を選択します
2. `Users and roles` をクリックします
3. 左上隅の `Invite members` を選択します
4. 最大 3 名までの新しいユーザーのメールアドレスを入力します
5. ユーザーに割り当てる組織およびサービスのロールを選択します
6. `Send invites` をクリックします

ユーザーには、組織への参加方法が記載されたメールが送信されます。招待の承諾についての詳細は、[Manage my account](/cloud/security/manage-my-account) を参照してください。

### SAML アイデンティティプロバイダー経由でユーザーを追加する \{#add-users-via-saml\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

組織で [SAML SSO](/cloud/security/saml-setup) が構成されている場合、次の手順に従って組織にユーザーを追加します。

1. アイデンティティプロバイダー内の SAML アプリケーションにユーザーを追加します。ユーザーは一度ログインするまで ClickHouse には表示されません
2. ユーザーが ClickHouse Cloud にログインすると、自動的に `Member` ロールが割り当てられます。このロールはログインのみ可能で、それ以外のアクセス権はありません
3. 権限を付与するには、以下の `Manage user role assignments` の手順に従ってください

### SAML のみの認証を強制する \{#enforce-saml\}

少なくとも 1 名の SAML ユーザーが Organization Admin ロールに割り当てられている状態になったら、その他の認証方法を使用するユーザーを組織から削除し、組織に対して SAML のみの認証を強制します。



## ユーザーのロール割り当てを管理する \{#manage-role-assignments\}

Organization Admin ロールが割り当てられているユーザーは、いつでも他のユーザーの権限を更新できます。

<VerticalStepper headerLevel="h3">

### 組織設定にアクセスする \{#access-organization-settings\}

Services ページから、組織名を選択します:

<Image img={step_1} size="md"/>

### `Users and roles` にアクセスする \{#access-users-and-roles\}

ポップアップメニューから `Users and roles` メニュー項目を選択します。

<Image img={step_2} size="md"/>

### 更新するユーザーを選択する \{#select-user-to-update\}

アクセス権を変更したいユーザーの行の末尾にあるメニュー項目を選択します:

<Image img={step_3} size="lg"/>

### `edit` を選択する \{#select-edit\}

<Image img={step_4} size="lg"/>

ページ右側にタブが表示されます:

<Image img={step_5} size="lg"/>

### 権限を更新する \{#update-permissions\}

ドロップダウンメニューから項目を選択して、コンソール全体でのアクセス権限と、ユーザーが ClickHouse コンソール内でアクセスできる機能を調整します。ロールとそれに関連付けられた権限の一覧については、[Console roles and permissions](/cloud/security/console-roles) を参照してください。

ドロップダウンメニューから項目を選択して、対象ユーザーのサービスロールのアクセス範囲を調整します。`Specific services` を選択すると、サービスごとにユーザーのロールを制御できます。

<Image img={step_6} size="md"/>

### 変更内容を保存する \{#save-changes\}

タブ下部にある `Save changes` ボタンを使用して、変更内容を保存します:

<Image img={step_7} size="md"/>

</VerticalStepper>



## ユーザーを削除する \{#remove-user\}
:::note SAML ユーザーの削除
アイデンティティプロバイダーで ClickHouse アプリケーションから割り当て解除された SAML ユーザーは、ClickHouse Cloud にログインできません。アカウントはコンソールから自動的には削除されないため、手動で削除する必要があります。
:::

次の手順に従ってユーザーを削除します。

1. 左下隅の組織名を選択します。
2. `Users and roles` をクリックします。
3. 対象ユーザー名の横にある三点リーダーアイコンをクリックし、`Remove` を選択します。
4. `Remove user` ボタンをクリックして操作を確定します。
