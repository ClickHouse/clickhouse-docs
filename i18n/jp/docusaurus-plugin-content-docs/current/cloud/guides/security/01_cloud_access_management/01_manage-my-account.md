---
sidebar_label: 'アカウントの管理'
slug: /cloud/security/manage-my-account
title: 'アカウントの管理'
description: 'このページでは、招待を承諾し、MFA 設定を管理し、パスワードをリセットする方法について説明します'
doc_type: 'guide'
keywords: ['アカウント管理', 'ユーザープロフィール', 'セキュリティ', 'クラウドコンソール', '設定']
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


## 招待を承認する \\{#accept-invitation\\}

組織への参加招待を承認するために複数の方法を利用できます。初めて招待を受け取った場合は、以下から組織に適した認証方法を選択してください。

既に他の組織に参加している場合は、既存の組織でサインインしてページ左下から招待を承認するか、メールで届いた招待から承認し、その後既存のアカウントでサインインしてください。

:::note SAML ユーザー
SAML を使用する組織では、ClickHouse の各組織ごとに固有のログイン URL が用意されています。管理者が提供した直接リンクを使用してログインしてください。
:::

### メールアドレスとパスワード \\{#email-and-password\\}

ClickHouse Cloud では、メールアドレスとパスワードで認証できます。この方法を使用する場合、ClickHouse アカウントを保護する最善の方法は、強固なパスワードを使用することです。覚えやすいパスワードを作成するためのオンラインリソースが多数あります。あるいは、ランダムパスワードジェネレーターを使用し、パスワードマネージャーに保存することで、セキュリティをさらに高めることもできます。

パスワードは 12 文字以上である必要があり、次の 4 つの複雑さの要件のうち 3 つを満たす必要があります：大文字、小文字、数字、および／または記号（特殊文字）。

### ソーシャルシングルサインオン (SSO) \\{#social-sso\\}

`Continue with Google` または `Continue with Microsoft Account` を使用して、サービスにサインアップしたり招待を承認したりできます。

会社が Google Workspace または Microsoft 365 を使用している場合は、ClickHouse Cloud 内で既存のシングルサインオン設定を活用できます。そのためには、会社のメールアドレスを使用してサインアップし、他のユーザーもその会社のメールアドレスで招待します。これにより、ユーザーは ClickHouse Cloud にサインインする前に、アイデンティティプロバイダー経由、または Google や Microsoft の認証を通じて、会社のログインフローを使用してログインする必要があります。 

### SAML シングルサインオン (SSO) \\{#saml-sso\\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

SAML SSO を使用するユーザーは、サインイン時にアイデンティティプロバイダーによって自動的に追加されます。ClickHouse Cloud の Organization Admin ロールを持つユーザーは、SAML ユーザーに割り当てられた[ロールを管理](/cloud/security/manage-cloud-users)し、認証方法として SAML のみを強制することができます。

## 多要素認証 (MFA) を管理する \\{#mfa\\}

メールアドレス＋パスワード認証またはソーシャルログインを利用しているユーザーは、多要素認証 (MFA) を設定することでアカウントのセキュリティをさらに強化できます。MFA を設定するには、次の手順に従います。

1. [console.clickhouse.cloud](https://console.clickhouse.cloud/) にログインします
2. 左上の ClickHouse ロゴの横にある自分のイニシャルをクリックします
3. 「Profile」を選択します
4. 左側の「Security」を選択します
5. 「Authenticator app」タイル内の「Set up」をクリックします
6. Authy、1Password、Google Authenticator などの認証アプリを使用して QR コードをスキャンします
7. 表示されたコードを入力して確認します
8. 次の画面で、リカバリーコードをコピーし、安全な場所に保管します
9. `I have safely recorded this code` の横のチェックボックスをオンにします
10. 「Continue」をクリックします

### 新しいリカバリーコードを取得する \\{#obtain-recovery-code\\}

以前に MFA を有効化しており、リカバリーコードを作成していなかった、または紛失してしまった場合は、次の手順で新しいリカバリーコードを取得します。
1. https://console.clickhouse.cloud にアクセスします
2. 認証情報と MFA コードを使用してサインインします
3. 左上のプロフィールメニューを開きます
4. 左側の「Security」をクリックします
5. 「Authenticator app」の横にあるゴミ箱アイコンをクリックします
6. 「Remove authenticator app」をクリックします
7. コードを入力し、「Continue」をクリックします
8. 「Authenticator app」セクションの「Set up」をクリックします
9. QR コードをスキャンし、新しいコードを入力します
10. 新しいリカバリーコードをコピーし、安全な場所に保管します
11. `I have safely recorded this code` の横のチェックボックスをオンにします
12. 「Continue」をクリックします

## アカウントの復旧 \\{#account-recovery\\}

### パスワードを忘れた場合 \\{#forgot-password\\}

パスワードを忘れた場合は、セルフサービスで復旧するために次の手順に従ってください:

1. https://console.clickhouse.cloud にアクセスします
2. メールアドレスを入力して、Continue をクリックします
3. Forgot your password? をクリックします
4. Send password reset link をクリックします
5. メールを確認し、メール内の Reset password をクリックします
6. 新しいパスワードを入力し、確認のために再入力してから、Update password をクリックします
7. Back to sign in をクリックします
8. 新しいパスワードで通常どおりサインインします

### MFA セルフサービスによる復旧 \\{#mfa-self-serivce-recovery\\}

MFA デバイスを紛失した場合、またはトークンを削除してしまった場合は、次の手順で復旧し、新しいトークンを作成してください:

1. https://console.clickhouse.cloud にアクセスします
2. 資格情報を入力して、Continue をクリックします
3. Multi-factor authentication 画面で Cancel をクリックします
4. Recovery code をクリックします
5. コードを入力して、Continue をクリックします
6. 新しいリカバリーコードをコピーし、安全な場所に保管します
7. `I have safely recorded this code` の横のチェックボックスをクリックし、Continue をクリックします
8. サインインが完了したら、左上のプロフィールに移動します
9. 左上の security をクリックします
10. Authenticator app の横にあるゴミ箱アイコンをクリックして、古い認証アプリを削除します
11. Remove authenticator app をクリックします
12. Multi-factor authentication の入力を求められたら、Cancel をクリックします
13. Recovery code をクリックします
14. リカバリーコード（ステップ 7 で新たに生成されたコード）を入力し、Continue をクリックします
15. 新しいリカバリーコードをコピーし、安全な場所に保管します — これは削除処理の途中で画面から離れてしまった場合のフェイルセーフとして使用します
16. `I have safely recorded this code` の横のチェックボックスをクリックし、Continue をクリックします
17. 上記の手順に従って、新しい MFA 認証要素を設定します

### MFA とリカバリーコードを両方失った場合 \\{#lost-mfa-and-recovery-code\\}

MFA デバイスとリカバリーコードの両方を紛失した場合、または MFA デバイスを紛失し、そもそもリカバリーコードを取得していなかった場合は、リセットを依頼するために次の手順に従ってください:

**チケットを送信する**: 他の管理ユーザーが所属する組織にいる場合は、たとえ単一ユーザーの組織へのアクセスを試みている場合でも、Admin ロールが割り当てられている組織メンバーに依頼し、そのメンバーが組織にログインして、あなたの MFA をリセットするためのサポートチケットを送信してもらってください。リクエストの正当性が確認され次第、MFA をリセットし、Admin に通知します。以降は MFA なしで通常どおりサインインし、必要であればプロフィール設定から新しい認証要素を登録してください。

**メールによるリセット**: 組織内の唯一のユーザーである場合は、アカウントに紐づいているメールアドレスから、メール（support@clickhouse.com）でサポートケースを送信してください。リクエストが正しいメールアドレスから送信されていることが確認され次第、MFA とパスワードの両方をリセットします。メールで受信したパスワードリセットリンクにアクセスし、新しいパスワードを設定したうえで、必要に応じてプロフィール設定から新しい認証要素を登録してください。 