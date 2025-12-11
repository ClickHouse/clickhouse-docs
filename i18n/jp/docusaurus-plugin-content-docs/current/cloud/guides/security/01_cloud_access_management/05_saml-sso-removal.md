---
sidebar_label: 'SAML SSO の削除'
slug: /cloud/security/saml-removal
title: 'SAML SSO の削除'
description: 'ClickHouse Cloud で SAML SSO を削除する方法'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP']
---

# SAML SSO の削除 {#saml-sso-removal}

お客様がアイデンティティプロバイダーの変更などの理由により、組織から SAML 連携を削除する必要が発生する場合があります。SAML ユーザーは、他のユーザー種別とは別のアイデンティティとして扱われます。別の認証方法に切り替えるには、以下の手順に従ってください。

:::warning
この操作は元に戻せません。SAML 連携を削除すると、SAML ユーザーは復元できない状態で無効化されます。組織へのアクセスを維持できるよう、以下の手順を注意深く実施してください。
:::

## 開始する前に {#before-you-begin}

組織から SAML を削除した後にユーザーを組織へ再招待するには、別の認証方法を利用できる管理者ユーザーが 1 名必要です。これらの手順を実行するには、Admin 権限を持つ ClickHouse Cloud ユーザーが必要です。

<VerticalStepper headerLevel="h3">

### 招待を有効にする {#enable-invitations}

[ClickHouse Cloud](https://console.clickhouse.cloud) にログインし、件名を `Enable invitations for SAML organization` としたサポートチケットを送信します。これは、SAML 以外の方法でユーザーを追加できるようにするためのリクエストです。

### 再招待するユーザーを確認する {#note-users-to-be-reinvited}

左下の組織名をクリックし、`Users and Roles` を選択します。各ユーザーの `Provider` カラムを確認し、`Signed in with SSO` と表示されているユーザーは、SAML を削除した後に組織へ再招待する必要があります。

SAML が削除された後は、アカウントにアクセスする前に新しい招待を承認する必要があることを、ユーザーへ周知してください。

</VerticalStepper>

## SAML 以外のユーザーを組織に追加する {#add-non-saml-users}

<VerticalStepper headerLevel="h3">

### ユーザーを招待する {#invite-users}

左下に表示されている組織名をクリックし、`Users and Roles` を選択します。[ユーザーを招待](/cloud/security/manage-cloud-users#invite-users)の手順に従って操作します。 

### ユーザーが招待を承諾する {#accept-invitation}

ユーザーは、招待を承諾する前に、すべての SAML 接続から完全にログアウトしておく必要があります。Google または Microsoft のソーシャルログインで招待を承諾する場合は、`Continue with Google` または `Continue with Microsoft` ボタンをクリックします。メールアドレスとパスワードを使用するユーザーは、https://console.clickhouse.cloud/?with=email にアクセスしてログインし、招待を承諾する必要があります。

:::note
ユーザーが SAML 設定に基づいて自動的にリダイレクトされないようにする最も確実な方法は、招待を承諾するためのリンクをコピーし、別のブラウザー、またはプライベートブラウジング／シークレット（シークレットモード）セッションに貼り付けて、そこで招待を承諾することです。
::: 

### クエリとダッシュボードを保存する {#save-queries-and-dashboards}

ユーザーが新しい ID でサインインしたら、一度ログアウトし、SAML アカウントで再度ログインして、保存済みクエリやダッシュボードを新しい ID と共有する必要があります。そのうえで、新しい ID の方でコピーを保存して処理を完了させてください。

</VerticalStepper>

## SAML の削除 {#remove-saml}

以下の項目が完了していることを、注意深く確認してください。

- 組織内に、SAML 以外のログイン方法を持ち、Admin ロールが割り当てられているユーザーが少なくとも 1 人いること
- 必要なすべてのユーザーを、別の認証方法を使って再招待していること
- すべての保存済みクエリとダッシュボードを、SAML 以外のユーザーに移行していること

これらの項目が完了している場合は、Organization settings タブに移動し、`Enable SAML single sign-on` 設定をオフに切り替えます。警告が表示されるので、`Disable` をクリックします。続いて Users and roles タブに移動し、SAML ユーザーを削除します。