---
sidebar_label: 'SAML SSOセットアップ'
slug: '/cloud/security/saml-setup'
title: 'SAML SSOセットアップ'
description: 'ClickHouse CloudでSAML SSOのセットアップ方法'
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'



# SAML SSO セットアップ

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud は、セキュリティアサーションマークアップ言語 (SAML) を介したシングルサインオン (SSO) をサポートしています。これにより、アイデンティティプロバイダー (IdP) で認証することで、ClickHouse Cloud 組織に安全にサインインすることができます。

現在、サービスプロバイダーが開始する SSO、個別接続を使用する複数の組織、およびジャストインタイムプロビジョニングをサポートしています。クロスドメインのアイデンティティ管理システム (SCIM) や属性マッピングのサポートはまだ提供していません。

## 始める前に {#before-you-begin}

IdP で管理者権限と ClickHouse Cloud 組織での **Admin** 役割が必要です。IdP 内に接続を設定した後、以下の手順で要求される情報を持って私たちに連絡してください。プロセスが完了します。

SSO 接続を補完するために、**組織への直接リンク**を設定することをお勧めします。各 IdP での処理は異なります。ご使用の IdP に対してこれをどう行うか、下をお読みください。

## IdP の設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織 ID を取得する  </summary>
   
   すべての設定には組織 ID が必要です。組織 ID を取得するには：
   
   1. [ClickHouse Cloud](https://console.clickhouse.cloud) 組織にサインインします。
   
      <Image img={samlOrgId} size="md" alt="組織 ID" />
      
   3. 左下隅で、**Organization** の下にある組織名をクリックします。
   
   4. ポップアップメニューで **Organization details** を選択します。
   
   5. 下記で使用するために **Organization ID** をメモしておきます。
      
</details>

<details> 
   <summary>  SAML 統合を設定する  </summary>
   
   ClickHouse はサービスプロバイダーが開始する SAML 接続を利用します。これは、https://console.clickhouse.cloud を介してまたは直接リンクを介してログインできることを意味します。現在、アイデンティティプロバイダーが開始する接続はサポートしていません。基本的な SAML 設定は以下の通りです。

   - SSO URL または ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URI または Entity ID: `urn:auth0:ch-production:{organizationid}` 

   - アプリケーションユーザー名: `email`

   - 属性マッピング: `email = user.email`

   - 組織にアクセスするための直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}` 


   特定の設定手順は、以下の具体的なアイデンティティプロバイダーを参照してください。
   
</details>

<details>
   <summary>  接続情報を取得する  </summary>

   アイデンティティプロバイダーの SSO URL と x.509 証明書を取得します。これらの情報を取得する方法については、具体的なアイデンティティプロバイダーを参照してください。

</details>

<details>
   <summary>  サポートケースを提出する  </summary>
   
   1. ClickHouse Cloud コンソールに戻ります。
      
   2. 左側の **Help** を選択し、次に Support サブメニューを選択します。
   
   3. **New case** をクリックします。
   
   4. 件名に "SAML SSO Setup" と入力します。
   
   5. 説明に、上記の手順から収集したリンクを貼り付け、チケットに証明書を添付します。
   
   6. この接続を許可すべきドメイン (e.g. domain.com, domain.ai など) もお知らせください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud 内で設定を完了し、テストの準備ができたらお知らせします。

</details>

<details>
   <summary>  設定を完了する  </summary>

   1. アイデンティティプロバイダー内でユーザーアクセスを割り当てます。

   2. https://console.clickhouse.cloud または上記の「SAML 統合を設定する」で設定した直接リンクを介して ClickHouse にログインします。ユーザーは初めてアクセスした際に 'Member' 役割が最初に割り当てられます。これにより、組織にログインし、個人設定を更新できます。

   3. ClickHouse 組織からログアウトします。

   4. 元の認証方法でログインし、新しい SSO アカウントに Admin 役割を割り当てます。
   - メール + パスワードアカウントの場合は、`https://console.clickhouse.cloud/?with=email`を使用してください。
   - ソーシャルログインの場合は、適切なボタンをクリックしてください (**Continue with Google** または **Continue with Microsoft**)

   5. 元の認証方法でログアウトし、https://console.clickhouse.cloud または上記の「SAML 統合を設定する」で設定した直接リンクを介して再度ログインします。

   6. 組織の SAML を強制するために、非 SAML ユーザーを削除します。今後、ユーザーはアイデンティティプロバイダーを介して割り当てられます。
   
</details>

### Okta SAML の設定 {#configure-okta-saml}

各 ClickHouse 組織に対して、Okta で 2 つのアプリ統合を設定します：1 つは SAML アプリ、もう 1 つは直接リンクを保持するブックマークです。

<details>
   <summary>  1. アクセス管理用のグループを作成する  </summary>
   
   1. Okta インスタンスに **Administrator** としてログインします。

   2. 左側の **Groups** を選択します。

   3. **Add group** をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAML アプリと関連するブックマークアプリの間でユーザーを一貫性を持たせるために使用されます。

   5. **Save** をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **Assign people** をクリックして、この ClickHouse 組織にアクセスを希望するユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにブックマークアプリを作成する  </summary>
   
   1. 左側の **Applications** を選択し、次に **Applications** のサブヘッダーを選択します。
   
   2. **Browse App Catalog** をクリックします。
   
   3. **Bookmark App** を検索して選択します。
   
   4. **Add integration** をクリックします。
   
   5. アプリ用のラベルを選択します。
   
   6. URL を `https://console.clickhouse.cloud/?connection={organizationid}` として入力します。
   
   7. **Assignments** タブに移動し、上記で作成したグループを追加します。

</details>

<details>
   <summary>  3. 接続を有効にするための SAML アプリを作成する  </summary>
   
   1. 左側の **Applications** を選択し、次に **Applications** のサブヘッダーを選択します。

   2. **Create App Integration** をクリックします。

   3. SAML 2.0 を選択して、次へ進みます。

   4. アプリケーションの名前を入力し、**Do not display application icon to users** の横のボックスにチェックを入れ、次へ進みます。
   
   5. SAML 設定画面に以下の値で入力します。
   
      | フィールド                          | 値 |
      |--------------------------------|-------|
      | シングルサインオン URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | デフォルト RelayState             | 空白のまま      |
      | Name ID フォーマット                | 未指定       |
      | アプリケーションユーザー名           | メール      |
      | アプリケーションユーザー名の更新     | 作成および更新 |

   7. 以下の属性ステートメントを入力します。

      | 名前    | 名前フォーマット   | 値      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. **Next** をクリックします。
   
   10. フィードバック画面で要求された情報を入力し、**Finish** をクリックします。
   
   11. **Assignments** タブに移動し、上記で作成したグループを追加します。
   
   12. 新しいアプリの **Sign On** タブで、**View SAML setup instructions** ボタンをクリックします。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML 設定手順" />
   
   13. これら 3 つのアイテムを収集し、上記のサポートケースを提出してプロセスを完了します。
     - アイデンティティプロバイダーのシングルサインオン URL
     - アイデンティティプロバイダーの発行者
     - X.509 証明書
   
</details>

### Google SAML の設定 {#configure-google-saml}

各組織に対して Google で 1 つの SAML アプリを設定し、マルチオーガニゼーション SSO を利用する場合はユーザーに直接リンク (`https://console.clickhouse.cloud/?connection={organizationId}`) をブックマークして提供する必要があります。

<details>
   <summary>  Google Web App を作成する  </summary>
   
   1. Google 管理コンソール (admin.google.com) にアクセスします。

   <Image img={samlGoogleApp} size="md" alt="Google SAML アプリ" />

   2. 左側の **Apps** をクリックし、次に **Web and mobile apps** をクリックします。
   
   3. 上部メニューから **Add app** をクリックし、次に **Add custom SAML app** を選択します。
   
   4. アプリの名前を入力し、**Continue** をクリックします。
   
   5. これら 2 つのアイテムを収集し、上記のサポートケースを提出して情報を私たちに送信してください。注意：このデータをコピーする前にセットアップを完了した場合は、アプリのホーム画面から **DOWNLOAD METADATA** をクリックして X.509 証明書を取得してください。
     - SSO URL
     - X.509 証明書
   
   7. 以下に ACS URL と Entity ID を入力します。
   
      | フィールド     | 値 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
   
   8. **Signed response** のボックスにチェックを入れます。
   
   9. Name ID フォーマットに **EMAIL** を選択し、Name ID は **Basic Information > Primary email.** のままにします。
   
   10. **Continue** をクリックします。
   
   11. 以下の属性マッピングを入力します。
       
      | フィールド             | 値         |
      |-------------------|---------------|
      | 基本情報               | プライマリメール |
      | アプリ属性               | email         |
       
   13. **Finish** をクリックします。
   
   14. アプリを有効にするには、**OFF** をすべてのユーザーに対して変更し、設定を **ON** に変更します。アクセスは、画面の左側にあるオプションを選択することで、グループまたは組織単位に制限することもできます。
       
</details>

### Azure (Microsoft) SAML の設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML は Azure Active Directory (AD) または Microsoft Entra としても知られています。

<details>
   <summary>  Azure エンタープライズ アプリケーションを作成する  </summary>
   
   各組織に対して、別のサインオン URL を持つ 1 つのアプリケーション統合を設定します。
   
   1. Microsoft Entra 管理センターにログインします。
   
   2. 左側の **Applications > Enterprise** アプリケーションに移動します。
   
   3. 上部メニューにある **New application** をクリックします。
   
   4. 上部メニューにある **Create your own application** をクリックします。
   
   5. 名前を入力し、**Integrate any other application you don't find in the gallery (Non-gallery)** を選択してから、**Create** をクリックします。
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery アプリ" />
   
   6. 左側の **Users and groups** をクリックし、ユーザーを割り当てます。
   
   7. 左側の **Single sign-on** をクリックします。
   
   8. **SAML** をクリックします。
   
   9. 以下の設定を使用して Basic SAML Configuration 画面を埋めます。
   
      | フィールド                     | 値 |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | Logout URL                | 空白 |
   
   11. Attributes & Claims の下で以下を追加 (A) または更新 (U) します。
   
       | クレーム名                           | フォーマット        | ソース属性 |
       |--------------------------------|---------------|------------------|
       | (U) ユニーク ユーザー識別子 (Name ID) | メールアドレス | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 除外       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性とクレーム" />
   
   12. これら 2 つのアイテムを収集し、上記のサポートケースを提出してプロセスを完了します：
     - ログイン URL
     - 証明書 (Base64)

</details>

### Duo SAML の設定 {#configure-duo-saml}

<details>
   <summary> Duo 用の一般的な SAML サービスプロバイダーを作成する  </summary>
   
   1. [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) の手順に従ってください。
   
   2. 次のブリッジ属性マッピングを使用します：

      |  ブリッジ属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | メールアドレス      | email                  |
   
   3. Duo のクラウドアプリケーションを更新するには、以下の値を使用します：

      |  フィールド    |  値                                     |
      |:----------|:-------------------------------------------|
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
      | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サービスプロバイダーのログイン URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. これら 2 つのアイテムを収集し、上記のサポートケースを提出してプロセスを完了します：
      - シングルサインオン URL
      - 証明書
   
</details>

## 仕組み {#how-it-works}

### サービスプロバイダーが開始する SSO {#service-provider-initiated-sso}

私たちはサービスプロバイダーが開始する SSO のみを利用しています。これは、ユーザーが `https://console.clickhouse.cloud` にアクセスし、認証のために IdP にリダイレクトするためにメールアドレスを入力することを意味します。IdP で既に認証されたユーザーは、ログインページでメールアドレスを入力せずに直接リンクを使用して組織に自動ログインできます。

### ユーザー役割の割り当て {#assigning-user-roles}

ユーザーは、IdP アプリケーションに割り当てて最初にログインした後、ClickHouse Cloud コンソールに表示されます。少なくとも 1 人の SSO ユーザーが組織内で Admin 役割を割り当てられている必要があります。ソーシャルログインまたは `https://console.clickhouse.cloud/?with=email` を使用して、元の認証方法でログインし、SSO 役割を更新します。

### 非 SSO ユーザーの削除 {#removing-non-sso-users}

SSO ユーザーを設定し、少なくとも 1 人に Admin 役割を割り当てると、Admin は他の方法（例：ソーシャル認証またはユーザー ID + パスワード）を使用してユーザーを削除できます。Google 認証は、SSO がセットアップされた後も機能し続けます。ユーザー ID + パスワードのユーザーは、メールドメインに基づいて自動的に SSO にリダイレクトされますが、`https://console.clickhouse.cloud/?with=email`を使用しない場合は例外です。

### ユーザーの管理 {#managing-users}

ClickHouse Cloud は現在、SSO のために SAML を実装しています。ユーザーを管理するための SCIM はまだ実装されていません。これは、SSO ユーザーが ClickHouse Cloud 組織にアクセスするために IdP 内のアプリケーションに割り当てられなければならないことを意味します。ユーザーが ClickHouse Cloud にログインするには、1 回はログインする必要があります。IdP からユーザーが削除されると、ユーザーは SSO を使って ClickHouse Cloud にログインできなくなります。しかし、SSO ユーザーは管理者が手動でユーザーを削除するまで、組織内には表示され続けます。

### マルチオーガニゼーション SSO {#multi-org-sso}

ClickHouse Cloud は、各組織に対して別の接続を提供することでマルチオーガニゼーション SSO をサポートしています。各組織にログインするには、直接リンク (`https://console.clickhouse.cloud/?connection={organizationid}`) を使用します。別の組織にログインする前には、1 つの組織からログアウトすることを確認してください。

## 追加情報 {#additional-information}

認証に関しては、セキュリティが最も重要な優先事項です。このため、SSO を実装する際にいくつかの決定を下しましたので、知っておいていただく必要があります。

- **サービスプロバイダーが開始する認証フローのみを処理します。** ユーザーは `https://console.clickhouse.cloud` に移動し、アイデンティティプロバイダーにリダイレクトされるためにメールアドレスを入力する必要があります。URL を覚えておく必要がないように、ブックマークアプリケーションまたはショートカットを追加する手順が提供されています。

- **IdP 経由でアプリに割り当てられたすべてのユーザーは、同じメールドメインを持っている必要があります。** ベンダー、契約者、またはコンサルタントが ClickHouse アカウントにアクセスする場合、従業員と同じドメイン (例：user@domain.com) のメールアドレスを持っている必要があります。

- **SSO アカウントと非 SSO アカウントを自動的にリンクすることはありません。** 同じメールアドレスを使用している場合でも、ClickHouse ユーザーリストにユーザーの複数のアカウントが表示される可能性があります。
