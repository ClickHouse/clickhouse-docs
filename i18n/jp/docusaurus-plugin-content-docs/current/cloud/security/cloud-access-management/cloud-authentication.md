---
'sidebar_label': 'クラウド認証'
'slug': '/cloud/security/cloud-authentication'
'title': 'クラウド認証'
'description': 'このガイドでは、認証の構成に関するいくつかの良い手法を説明しています。'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Cloud Authentication

ClickHouse Cloudは、複数の認証方法を提供しています。このガイドでは、認証を設定するための良いプラクティスについて説明します。認証方法を選択する際は、常にセキュリティチームに確認してください。

## Password Settings {#password-settings}

現在、当社のコンソールおよびサービス（データベース）の最小パスワード設定は、[NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) 認証者保証レベル1に準拠しています:
- 最小12文字
- 次の4つの項目のうち3つを含む:
   - 1つの大文字
   - 1つの小文字
   - 1つの数字
   - 1つの特殊文字

## Email + Password {#email--password}

ClickHouse Cloudでは、メールアドレスとパスワードで認証することができます。この方法を使用する際は、ClickHouseアカウントを保護するために強力なパスワードを使用するのが最善です。記憶できるパスワードを考案するための多くのオンラインリソースがあります。あるいは、ランダムパスワードジェネレータを使用し、パスワードマネージャーにパスワードを保存してセキュリティを強化することもできます。

## SSO Using Google or Microsoft Social Authentication {#sso-using-google-or-microsoft-social-authentication}

貴社がGoogle WorkspaceまたはMicrosoft 365を使用している場合、ClickHouse Cloud内の現在のシングルサインオン設定を活用できます。これを行うには、会社のメールアドレスを使用してサインアップし、他のユーザーを会社のメールアドレスを利用して招待するだけです。その結果、ユーザーはClickHouse Cloudに認証する前に、貴社のアイデンティティプロバイダーまたは直接GoogleやMicrosoftの認証を通じて、自社のログインフローを使用してログインする必要があります。

## Multi-Factor Authentication {#multi-factor-authentication}

メール + パスワードまたはソーシャル認証を持つユーザーは、マルチファクター認証（MFA）を使用してアカウントをさらに保護できます。MFAを設定するには:
1. console.clickhouse.cloudにログインします
2. 左上隅のClickHouseロゴの横にあるイニシャルをクリックします
3. プロフィールを選択します
4. 左側のセキュリティを選択します
5. 認証アプリのタイルで「セットアップ」をクリックします
6. Authy、1Password、Google Authenticatorなどの認証アプリを使用してQRコードをスキャンします
7. コードを入力して確認します
8. 次の画面で、回復コードをコピーして安全な場所に保管します
9. `I have safely recorded this code`の横にあるチェックボックスをチェックします
10. 続行をクリックします

## Account recovery {#account-recovery}

<details> 
   <summary>Obtain recovery code</summary>

   以前にMFAに登録していて、回復コードを作成しなかったか失くした場合は、以下の手順で新しい回復コードを取得してください:
   1. https://console.clickhouse.cloudにアクセスします
   2. 認証情報とMFAでサインインします
   3. 左上隅のプロフィールにアクセスします
   4. 左側のセキュリティをクリックします
   5. 認証アプリの横にあるゴミ箱をクリックします
   6. 認証アプリを削除をクリックします
   7. コードを入力して続行をクリックします
   8. 認証アプリセクションで「セットアップ」をクリックします
   9. QRコードをスキャンし、新しいコードを入力します
   10. 回復コードをコピーして安全な場所に保管します
   11. `I have safely recorded this code`の横にあるチェックボックスをチェックします
   12. 続行をクリックします
   
</details>
<details>
   <summary>Forgot password</summary>

   パスワードを忘れた場合は、以下の手順でセルフサービス回復を行ってください:
   1. https://console.clickhouse.cloudにアクセスします
   2. メールアドレスを入力して続行をクリックします
   3. パスワードを忘れましたか？をクリックします
   4. パスワードリセットリンクを送信をクリックします
   5. メールを確認し、メールからパスワードをリセットをクリックします
   6. 新しいパスワードを入力し、確認してパスワードを更新をクリックします
   7. サインインに戻るをクリックします
   8. 新しいパスワードで通常通りサインインします
            
</details>
<details>
   <summary>Lost MFA device or token</summary>

   MFAデバイスを失くしたり、トークンを削除した場合は、以下の手順で回復して新しいトークンを作成してください:
   1. https://console.clickhouse.cloudにアクセスします
   2. 認証情報を入力して続行をクリックします
   3. マルチファクター認証画面でキャンセルをクリックします
   4. 回復コードをクリックします
   5. コードを入力して続行を押します
   6. 新しい回復コードをコピーして安全な場所に保管します
   7. `I have safely recorded this code`の横のボックスにチェックを入れ、続行をクリックします
   8. サインイン後、左上のプロフィールに移動します
   9. 左上のセキュリティをクリックします
   10. 古い認証アプリを削除するために、認証アプリの横にあるゴミ箱アイコンをクリックします
   11. 認証アプリを削除をクリックします
   12. マルチファクター認証のプロンプトが表示されたら、キャンセルをクリックします
   13. 回復コードをクリックします
   14. 回復コードを入力し（これはステップ7で生成された新しいコードです）、続行をクリックします
   15. 新しい回復コードをコピーして安全な場所に保管します - これは削除プロセスの間に画面を離れた場合のフェイルセーフです
   16. `I have safely recorded this code`の横のボックスにチェックを入れ、続行をクリックします
   17. 上記のプロセスに従って新しいMFAファクターをセットアップします
       
</details>
<details>
   <summary>Lost MFA and recovery code</summary>

   MFAデバイスと回復コードを失った場合、またはMFAデバイスを失い回復コードを取得していない場合は、以下の手順でリセットを要求してください：

   **チケットを提出する**: 管理ユーザーが他にいる組織に所属している場合、たとえ単一ユーザー組織にアクセスを試みていても、Adminロールに割り当てられた組織のメンバーに、組織にログインしてあなたの代わりにMFAをリセットするためのサポートチケットを提出するよう頼んでください。リクエストが認証されていることを確認でき次第、MFAをリセットし、Adminに通知します。通常通りMFAなしでサインインし、必要に応じて新しいファクターを登録するためにプロフィール設定に移動してください。

   **メールを介してリセット**: 組織内で唯一のユーザーである場合、アカウントに関連付けられたメールアドレスを使用して、サポートケースをメールで提出してください（support@clickhouse.com）。リクエストが正しいメールから来ていることを確認でき次第、MFAとパスワードをリセットします。パスワードリセットリンクにアクセスするためにメールにアクセスしてください。新しいパスワードを設定した後、必要に応じて新しいファクターを登録するためにプロフィール設定に移動してください。
   
</details>

## SAML SSO {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloudは、セキュリティアサーションマークアップ言語（SAML）シングルサインオン（SSO）もサポートしています。詳細については、[SAML SSO Setup](/cloud/security/saml-setup)を参照してください。

## Database User ID + Password {#database-user-id--password}

パスワードを保護するために、[ユーザーアカウントの作成](/sql-reference/statements/create/user.md)時にSHA256_hashメソッドを使用してください。

**TIP:** 管理者権限のないユーザーは自分自身のパスワードを設定できないため、アカウントをセットアップするために管理者に提供する前に、ユーザーに[こちらのような](https://tools.keycdn.com/sha256-online-generator)ジェネレータを使用してパスワードをハッシュするよう依頼してください。パスワードは上記の[要件](#password-settings)に従う必要があります。

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```
