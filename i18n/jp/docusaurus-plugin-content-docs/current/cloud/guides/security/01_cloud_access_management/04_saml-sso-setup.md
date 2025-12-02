---
sidebar_label: 'SAML SSO の設定'
slug: /cloud/security/saml-setup
title: 'SAML SSO の設定'
description: 'ClickHouse Cloud で SAML SSO を設定する方法'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'シングルサインオン', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO のセットアップ {#saml-sso-setup}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud は、Security Assertion Markup Language (SAML) を利用したシングルサインオン (SSO) をサポートしています。これにより、アイデンティティプロバイダー (IdP) で認証することで、ClickHouse Cloud 組織に安全にサインインできます。

現在、サービスプロバイダー起点の SSO、個別の接続を用いた複数組織での利用、およびジャストインタイムプロビジョニングをサポートしています。現時点では、SCIM (System for Cross-domain Identity Management) や属性マッピングには対応していません。



## はじめる前に {#before-you-begin}

IdP での管理者権限と、ClickHouse Cloud 組織での **Admin** ロールが必要です。IdP 内で接続を設定したら、以下の手順で求められている情報を添えて当社までご連絡いただくことで、設定を完了できます。

ログインプロセスを簡素化するため、SAML 接続に加えて **組織への直接リンク** を設定することを推奨します。IdP ごとに扱い方が異なります。お使いの IdP での具体的な方法については、この先の説明を参照してください。



## IdP を構成する方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織 ID を取得する  </summary>
   
   すべてのセットアップには組織 ID が必要です。組織 ID を取得するには、次の手順を実行します。
   
   1. [ClickHouse Cloud](https://console.clickhouse.cloud) の組織にサインインします。
   
      <Image img={samlOrgId} size="md" alt="Organization ID" force/>
      
   3. 左下隅の **Organization** の下にある組織名をクリックします。
   
   4. ポップアップメニューで **Organization details** を選択します。
   
   5. 以下で使用するために **Organization ID** を控えておきます。
      
</details>

<details> 
   <summary>  SAML 連携を構成する  </summary>
   
   ClickHouse はサービスプロバイダー開始 (SP-initiated) の SAML 接続を使用します。これは、https://console.clickhouse.cloud から、または直接リンクからログインできることを意味します。現在、IdP (Identity Provider) 開始の接続はサポートしていません。基本的な SAML 設定項目は次のとおりです。

- SSO URL または ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI または Entity ID: `urn:auth0:ch-production:{organizationid}` 

- Application username: `email`

- Attribute mapping: `email = user.email`

- 組織へアクセスするための直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}` 

   具体的な構成手順については、以下の各 IdP に関する説明を参照してください。
   
</details>

<details>
   <summary>  接続情報を取得する  </summary>

   IdP の SSO URL と x.509 証明書を取得します。これらの情報の取得方法については、以下の各 IdP に関する説明を参照してください。

</details>

<details>
   <summary>  サポートケースを送信する </summary>
   
   1. ClickHouse Cloud コンソールに戻ります。
      
   2. 左側で **Help** を選択し、続いて **Support** サブメニューを選択します。
   
   3. **New case** をクリックします。
   
   4. 件名に「SAML SSO Setup」と入力します。
   
   5. 説明欄に、上記の手順で取得したリンクを貼り付け、証明書をチケットに添付します。
   
   6. この接続で許可するドメイン (例: domain.com, domain.ai など) も併せてお知らせください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud 側でセットアップを完了し、テストできる準備が整い次第ご連絡します。

</details>

<details>
   <summary>  セットアップを完了する  </summary>

   1. IdP 側でユーザーアクセス権を割り当てます。 

   2. https://console.clickhouse.cloud または、上記「SAML 連携を構成する」で設定した直接リンクから ClickHouse にログインします。ユーザーには初期状態で「Member」ロールが割り当てられ、このロールでは組織へのログインと個人設定の更新が可能です。

   3. ClickHouse の組織からログアウトします。 

   4. 元の認証方法でログインし、新しい SSO アカウントに Admin ロールを割り当てます。
- email + password アカウントの場合は、`https://console.clickhouse.cloud/?with=email` を使用してください。
- ソーシャルログインの場合は、(**Continue with Google** または **Continue with Microsoft**) の適切なボタンをクリックしてください。

:::note
上記の `?with=email` の `email` はプレースホルダーではなく、そのまま使用するパラメーター値です
:::

   5. 元の認証方法でログアウトし、再度 https://console.clickhouse.cloud または上記「SAML 連携を構成する」で設定した直接リンクからログインします。

   6. 組織で SAML を必須にするには、SAML 以外のユーザーを削除します。今後は IdP 側でユーザーを割り当てます。
   
</details>

### Okta SAML を構成する {#configure-okta-saml}

各 ClickHouse 組織に対して、Okta で 2 つの App Integration (1 つの SAML アプリと、直接リンク用の 1 つのブックマーク) を構成します。

<details>
   <summary>  1. アクセス管理用のグループを作成する  </summary>
   
   1. **Administrator** として Okta インスタンスにログインします。

   2. 左側で **Groups** を選択します。

   3. **Add group** をクリックします。

   4. グループ名と説明を入力します。このグループは、SAML アプリと関連するブックマークアプリ間でユーザーを一貫して管理するために使用します。

   5. **Save** をクリックします。

   6. 作成したグループ名をクリックします。

   7. **Assign people** をクリックし、この ClickHouse 組織へのアクセスを付与したいユーザーを割り当てます。

</details>



<details>
  <summary>
    {" "}
    2. ユーザーがシームレスにログインできるようにするブックマークアプリを作成する{" "}
  </summary>
  1. 左側の **Applications** を選択し、次に **Applications** サブ見出しを選択します。
  2. **Browse App Catalog** をクリックします。
  3. **Bookmark App** を検索して選択します。
  4. **Add integration** をクリックします。
  5. アプリのラベルを選択します。
  6. URL として `https://console.clickhouse.cloud/?connection=
  {organizationid}` を入力します。
  7. **Assignments** タブに移動し、上記で作成したグループを追加します。
</details>

<details>
   <summary>  3. 接続を有効にするSAMLアプリを作成する  </summary>
   
   1. 左側の **Applications** を選択し、次に **Applications** サブ見出しを選択します。
   
   2. **Create App Integration** をクリックします。
   
   3. SAML 2.0 を選択し、Next をクリックします。
   
   4. アプリケーションの名前を入力し、**Do not display application icon to users** の横のチェックボックスをオンにして、**Next** をクリックします。
   
   5. 以下の値を使用してSAML設定画面を入力します。
   
      | フィールド                          | 値 |
      |--------------------------------|-------|
      | Single Sign On URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Default RelayState             | 空白のままにする       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. 以下の属性ステートメントを入力します。

      | 名前    | 名前形式   | 値      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |

9. **Next** をクリックします。

10. フィードバック画面で要求された情報を入力し、**Finish** をクリックします。

11. **Assignments** タブに移動し、上記で作成したグループを追加します。

12. 新しいアプリの **Sign On** タブで、**View SAML setup instructions** ボタンをクリックします。

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Okta SAML セットアップ手順'
      force
    />

13. 以下の3つの項目を収集し、上記の「サポートケースを送信する」に進んでプロセスを完了します。


     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 Certificate

</details>

### Google SAMLの設定 {#configure-google-saml}

各組織ごとにGoogleで1つのSAMLアプリを設定し、マルチ組織SSOを使用する場合はユーザーにブックマーク用の直接リンク（`https://console.clickhouse.cloud/?connection={organizationId}`）を提供する必要があります。

<details>
   <summary>  Google Webアプリを作成する  </summary>
   
   1. Google管理コンソール（admin.google.com）にアクセスします。

<Image img={samlGoogleApp} size='md' alt='Google SAMLアプリ' force />

2.  **Apps** をクリックし、次に左側の **Web and mobile apps** をクリックします。

3.  上部メニューから **Add app** をクリックし、**Add custom SAML app** を選択します。

4.  アプリの名前を入力し、**Continue** をクリックします。

5.  以下の2つの項目を収集し、上記の「サポートケースを送信する」に進んで情報を送信してください。注意：このデータをコピーする前にセットアップを完了した場合は、アプリのホーム画面から **DOWNLOAD METADATA** をクリックしてX.509証明書を取得してください。


     - SSO URL
     - X.509 Certificate

7.  以下のACS URLとEntity IDを入力します。

    | フィールド     | 値                                                                      |
    | --------- | -------------------------------------------------------------------------- |
    | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Entity ID | `urn:auth0:ch-production:{organizationid}`                                 |

8.  **Signed response** のチェックボックスをオンにします。

9.  Name ID Formatに **EMAIL** を選択し、Name IDは **Basic Information > Primary email** のままにします。

10. **Continue** をクリックします。

11. 以下の属性マッピングを入力します：
    | フィールド             | 値         |
    | ----------------- | ------------- |
    | Basic information | Primary email |
    | App attributes    | email         |
12. **Finish** をクリックします。


14. アプリを有効にするには、全員に対して **OFF** をクリックし、設定を全員に対して **ON** に変更します。画面左側のオプションを選択することで、アクセスをグループまたは組織単位に制限することもできます。

</details>

### Azure (Microsoft) SAML の設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML は、Azure Active Directory (AD) または Microsoft Entra とも呼ばれます。

<details>
   <summary>  Azure エンタープライズアプリケーションの作成 </summary>
   
   組織ごとに個別のサインオン URL を持つアプリケーション統合を 1 つセットアップします。
   
   1. Microsoft Entra 管理センターにログオンします。
   
   2. 左側の **Applications > Enterprise** アプリケーションに移動します。
   
   3. 上部メニューの **New application** をクリックします。
   
   4. 上部メニューの **Create your own application** をクリックします。
   
   5. 名前を入力し、**Integrate any other application you don't find in the gallery (Non-gallery)** を選択してから、**Create** をクリックします。
   
      <Image img={samlAzureApp} size="md" alt="Azure 非ギャラリーアプリ" force/>
   
   6. 左側の **Users and groups** をクリックし、ユーザーを割り当てます。
   
   7. 左側の **Single sign-on** をクリックします。
   
   8. **SAML** をクリックします。
   
   9. 以下の設定を使用して、Basic SAML Configuration 画面に入力します。
   
      | フィールド                     | 値 |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | Logout URL                | 空白 |
   
   11. Attributes & Claims の下に以下を追加 (A) または更新 (U) します:
   
       | クレーム名                           | 形式        | ソース属性 |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性とクレーム" force/>
   
   12. 以下の 2 つの項目を収集し、上記の Submit a Support Case に進んでプロセスを完了します:
     - Login URL
     - Certificate (Base64)

</details>

### Duo SAML の設定 {#configure-duo-saml}

<details>
   <summary> Duo 用の汎用 SAML サービスプロバイダーの作成 </summary>
   
   1. [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) の手順に従います。
   
   2. 以下の Bridge Attribute マッピングを使用します:

      |  Bridge Attribute  |  ClickHouse Attribute  |
      |:-------------------|:-----------------------|
      | Email Address      | email                  |

3.  以下の値を使用して、Duo の Cloud Application を更新します:

    | フィールド                                | 値                                                                      |
    | :----------------------------------- | :------------------------------------------------------------------------- |
    | Entity ID                            | `urn:auth0:ch-production:{organizationid}`                                 |
    | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Service Provider Login URL           | `https://console.clickhouse.cloud/?connection={organizationid}`            |

4.  以下の 2 つの項目を収集し、上記の Submit a Support Case に進んでプロセスを完了します:
    - Single Sign-On URL
    - Certificate

</details>


## 仕組み {#how-it-works}

### SAML SSO を利用したユーザー管理 {#user-management-with-saml-sso}

ユーザー権限の管理や、アクセスを SAML 接続のみに制限する方法の詳細については、[クラウドユーザーの管理](/cloud/security/manage-cloud-users) を参照してください。

### サービスプロバイダー開始型 SSO {#service-provider-initiated-sso}

ClickHouse Cloud では、サービスプロバイダー開始型 SSO のみを利用しています。これは、ユーザーが `https://console.clickhouse.cloud` にアクセスしてメールアドレスを入力すると、認証のために IdP にリダイレクトされる方式であることを意味します。すでに IdP によって認証されているユーザーは、ログインページでメールアドレスを入力することなく、組織に自動的にログインできるダイレクトリンクを使用できます。

### 複数組織向け SSO {#multi-org-sso}

ClickHouse Cloud は、組織ごとに個別の接続を提供することで、複数組織向け SSO をサポートします。各組織にログインするには、ダイレクトリンク (`https://console.clickhouse.cloud/?connection={organizationid}`) を使用してください。別の組織にログインする前に、現在ログインしている組織から必ずログアウトしてください。



## 追加情報 {#additional-information}

認証に関しては、セキュリティを最優先としています。このため、SSO を実装するにあたり、いくつかの重要な設計上の判断を行っており、その点について事前にご理解いただく必要があります。

- **サービスプロバイダー起点の認証フローのみを処理します。** ユーザーは `https://console.clickhouse.cloud` にアクセスし、メールアドレスを入力してから、アイデンティティプロバイダーにリダイレクトされる必要があります。ユーザーが URL を覚えておく必要がないように、ブックマーク用アプリケーションやショートカットを追加するための手順もあわせて提供しています。

- **SSO アカウントと非 SSO アカウントは自動的にはリンクされません。** 同じメールアドレスを使用している場合でも、ClickHouse のユーザー一覧には、同一ユーザーに対して複数のアカウントが表示されることがあります。



## よくある問題のトラブルシューティング {#troubleshooting-common-issues}

| エラー | 原因 | 解決方法 | 
|:------|:------|:---------|
| システムの設定ミス、またはサービス停止が発生している可能性があります | アイデンティティプロバイダー主導のログイン | このエラーを解消するには、直接リンク `https://console.clickhouse.cloud/?connection={organizationid}` を使用してみてください。上記のアイデンティティプロバイダーの手順に従い、これをユーザーのデフォルトのログイン方法として設定してください | 
| アイデンティティプロバイダーにリダイレクトされた後、再度ログインページに戻されます | アイデンティティプロバイダーでメールアドレス属性のマッピングが設定されていません | 上記のアイデンティティプロバイダーの手順に従い、ユーザーのメールアドレス属性を構成してから、再度ログインしてください | 
| ユーザーがこのアプリケーションに割り当てられていません | ユーザーがアイデンティティプロバイダー内の ClickHouse アプリケーションに割り当てられていません | アイデンティティプロバイダーでこのアプリケーションにユーザーを割り当て、再度ログインしてください |
| 複数の ClickHouse 組織を SAML SSO と連携しているが、どのリンクまたはタイルを使用しても、常に同じ組織にログインされてしまいます | 最初の組織にまだログインしたままになっています | 一度ログアウトしてから、別の組織にログインしてください |
| URL に一瞬 `access denied` と表示されます | 利用しているメールドメインが、当社で設定しているドメインと一致していません | このエラーの解消について支援が必要な場合は、サポートまでお問い合わせください |
