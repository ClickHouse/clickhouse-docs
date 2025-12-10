---
sidebar_label: 'SAML SSO の設定'
slug: /cloud/security/saml-setup
title: 'SAML SSO の設定'
description: 'ClickHouse Cloud で SAML SSO を設定する方法'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'シングルサインオン', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlSelfServe1 from '@site/static/images/cloud/security/saml-self-serve-1.png';
import samlSelfServe2 from '@site/static/images/cloud/security/saml-self-serve-2.png';
import samlSelfServe3 from '@site/static/images/cloud/security/saml-self-serve-3.png';
import samlSelfServe4 from '@site/static/images/cloud/security/saml-self-serve-4.png';
import samlSelfServe5 from '@site/static/images/cloud/security/saml-self-serve-5.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO のセットアップ {#saml-sso-setup}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud は、Security Assertion Markup Language (SAML) を利用したシングルサインオン (SSO) をサポートしています。これにより、アイデンティティプロバイダー (IdP) で認証することで、ClickHouse Cloud 組織に安全にサインインできます。

現在、サービスプロバイダー起点の SSO、個別の接続を用いた複数組織での利用、およびジャストインタイムプロビジョニングをサポートしています。現時点では、SCIM (System for Cross-domain Identity Management) や属性マッピングには対応していません。

SAML 連携を有効化することで、新規ユーザーに割り当てられるデフォルトロールを指定したり、セッションタイムアウト設定を調整したりすることもできます。

## はじめる前に {#before-you-begin}

IdP での管理者権限、自身のドメインの DNS 設定に TXT レコードを追加できる権限、および ClickHouse Cloud 組織での **Admin** ロールが必要です。ログインプロセスを簡素化するため、SAML 接続に加えて **組織への直接リンク** を設定することを推奨します。IdP ごとに扱い方が異なります。お使いの IdP での具体的な方法については、この先の説明を参照してください。

## IdP を構成する方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<VerticalStepper headerLevel="h3">
  ### 組織設定へのアクセス

  左下隅にある組織名をクリックし、`Organization details` を選択します。

  ### SAML シングルサインオンを有効化

  `Enable SAML single sign-on` の横にあるトグルをクリックします。セットアップ手順の中で何度も参照するため、この画面は開いたままにしておきます。

  <Image img={samlSelfServe1} size="lg" alt="SAML セットアップの開始" force />

  ### アイデンティティプロバイダーでアプリケーションを作成

  アイデンティティプロバイダー内でアプリケーションを作成し、`Enable SAML single sign-on` 画面に表示されている値をアイデンティティプロバイダーの設定にコピーします。この手順の詳細については、以下の各アイデンティティプロバイダーに関するセクションを参照してください。

  * [Okta SAML の設定](#configure-okta-saml)
  * [Google SAML の設定](#configure-google-saml)
  * [Azure (Microsoft) SAML の設定](#configure-azure-microsoft-saml)
  * [Duo SAML の設定](#configure-duo-saml)

  :::tip
  ClickHouse はアイデンティティプロバイダー起点のサインインをサポートしていません。ユーザーが ClickHouse Cloud に簡単にアクセスできるようにするには、次のサインイン URL 形式を使ってブックマークを設定してください: `https://console.clickhouse.cloud/?connection={orgId}`。ここで `{orgID}` は `Organization details` ページに表示されている組織 ID です。
  :::

  <Image img={samlSelfServe2} size="lg" alt="アイデンティティプロバイダーアプリケーションの作成" force />

  ### メタデータ URL を SAML 設定に追加

  SAML プロバイダーから `Metadata URL` を取得します。ClickHouse Cloud に戻り、`Next: Provide metadata URL` をクリックして、テキストボックスにその URL を貼り付けます。

  <Image img={samlSelfServe3} size="lg" alt="メタデータ URL の追加" force />

  ### ドメイン検証コードの取得

  `Next: Verify your domains` をクリックします。テキストボックスにドメインを入力し、`Check domain` をクリックします。DNS プロバイダーで TXT レコードに追加するためのランダムな検証コードが生成されます。

  <Image img={samlSelfServe4} size="lg" alt="検証対象ドメインの追加" force />

  ### ドメインの検証

  DNS プロバイダーで TXT レコードを作成します。`TXT record name` をコピーして、DNS プロバイダー側の TXT レコード Name フィールドに貼り付けます。`Value` をコピーして、DNS プロバイダー側の Content フィールドに貼り付けます。`Verify and Finish` をクリックして処理を完了します。

  :::note
  DNS レコードが更新されて検証されるまで数分かかる場合があります。セットアップページを離れてもかまいません。処理を最初からやり直すことなく、後で戻って完了できます。
  :::

  <Image img={samlSelfServe5} size="lg" alt="ドメインの検証" force />

  ### デフォルトロールとセッションタイムアウトの更新

  SAML セットアップが完了すると、ログイン時にすべてのユーザーに割り当てられるデフォルトロールを設定し、セッションタイムアウト設定を調整できます。

  利用可能なデフォルトロールは次のとおりです:

  * Admin
  * Service Admin
  * Service Read Only
  * Member

  これらのロールに割り当てられる権限の詳細については、[Console roles and permissions](/cloud/security/console-roles) を参照してください。

  ### 管理者ユーザーの設定

  :::note
  別の認証方法で構成されているユーザーは、組織内の管理者が削除するまで残ります。
  :::

  SAML で最初の管理者ユーザーを割り当てるには:

  1. [ClickHouse Cloud](https://console.clickhouse.cloud) からログアウトします。
  2. アイデンティティプロバイダーで、ClickHouse アプリケーションに管理者ユーザーを割り当てます。
  3. ユーザーに [https://console.clickhouse.cloud/?connection=&#123;orgId&#125;](https://console.clickhouse.cloud/?connection=\{orgId}) （ショートカット URL）からログインするよう依頼します。これは前の手順で作成したブックマーク経由の場合もあります。ユーザーは最初にログインするまで ClickHouse Cloud 上には表示されません。
  4. デフォルトの SAML ロールが Admin 以外である場合、新しい SAML ユーザーのロールを更新するために、ユーザーは一度ログアウトし、元の認証方法でログインし直す必要がある場合があります。
     * メールアドレス + パスワードのアカウントの場合は、`https://console.clickhouse.cloud/?with=email` を使用してください。
     * ソーシャルログインの場合は、該当するボタン（**Continue with Google** または **Continue with Microsoft**）をクリックしてください。

  :::note
  上記の `?with=email` 内の `email` はプレースホルダーではなく、文字通りのパラメータ値です。
  :::

  5. もう一度ログアウトし、最後の手順を完了するためにショートカット URL から再度ログインします。

  :::tip
  手順を簡略化するため、最初は SAML のデフォルトロールを `Admin` に設定しておいてもかまいません。アイデンティティプロバイダーで管理者が割り当てられ、その管理者が初回ログインした後に、デフォルトロールを別の値に変更できます。
  :::

  ### 他の認証方法の削除

  SAML 以外の方法を使用しているユーザーを削除し、アイデンティティプロバイダー接続から来るユーザーのみがアクセスできるようにして、統合を完了します。
</VerticalStepper>

### Okta SAMLの設定 {#configure-okta-saml}

各ClickHouse組織ごとに、Oktaで2つのApp Integration（1つのSAMLアプリと、直接リンク用のブックマークアプリ）を設定します。

<details>
   <summary>  1. アクセスを管理するグループを作成する  </summary>
   
   1. **Administrator** としてOktaインスタンスにログインします。

   2. 左側の **Groups** を選択します。

   3. **Add group** をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAMLアプリと関連するブックマークアプリ間でユーザーを一貫して管理するために使用されます。

   5. **Save** をクリックします。

   6. 作成したグループ名をクリックします。

   7. **Assign people** をクリックして、このClickHouse組織へのアクセス権を付与したいユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにするブックマークアプリを作成する  </summary>
   
   1. 左側の **Applications** を選択し、次に **Applications** サブ見出しを選択します。
   
   2. **Browse App Catalog** をクリックします。
   
   3. **Bookmark App** を検索して選択します。
   
   4. **Add integration** をクリックします。
   
   5. アプリのラベルを選択します。
   
   6. URL として `https://console.clickhouse.cloud/?connection={organizationid}` を入力します。
   
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
      | Single Sign On URL             | コンソールから Single Sign-On URL をコピー |
      | Audience URI (SP Entity ID)    | コンソールから Service Provider Entity ID をコピー |
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
   
   12. 新しいアプリの **Sign On** タブで、**Copy metadata URL** ボタンをクリックします。 
   
   13. 手順を続行するには、[SAML構成にメタデータURLを追加する](#add-metadata-url) に戻ります。
   
</details>

### Google SAMLの設定 {#configure-google-saml}

各組織ごとにGoogleで1つのSAMLアプリを設定し、マルチ組織SSOを使用する場合はユーザーにブックマーク用の直接リンク（`https://console.clickhouse.cloud/?connection={organizationId}`）を提供する必要があります。

<details>
   <summary>  Google Webアプリを作成する  </summary>
   
   1. Google管理コンソール（admin.google.com）にアクセスします。

<Image img={samlGoogleApp} size="md" alt="Google SAMLアプリ" force/>

2. **Apps** をクリックし、次に左側の **Web and mobile apps** をクリックします。
   
3. 上部メニューから **Add app** をクリックし、**Add custom SAML app** を選択します。
   
4. アプリの名前を入力し、**Continue** をクリックします。
   
5. メタデータURLをコピーし、どこかに保存します。
   
7. 以下のACS URLとEntity IDを入力します。
   
   | フィールド | 値                                                |
   |-----------|---------------------------------------------------|
   | ACS URL   | コンソールからSingle Sign-On URLをコピーします    |
   | Entity ID | コンソールからService Provider Entity IDをコピーします |
   
8. **Signed response** のチェックボックスをオンにします。
   
9. Name ID Formatに **EMAIL** を選択し、Name IDは **Basic Information > Primary email.** のままにします。
   
10. **Continue** をクリックします。
   
11. 以下の属性マッピングを入力します：
       
   | フィールド             | 値         |
   |-------------------|---------------|
   | Basic information | Primary email |
   | App attributes    | email         |
       
13. **Finish** をクリックします。
   
14. アプリを有効にするには、**OFF** for everyone をクリックし、設定を **ON** for everyone に変更します。画面左側のオプションを選択することで、アクセスをグループまたは組織単位に制限することもできます。

15. プロセスを続行するには、[SAML構成にメタデータURLを追加する](#add-metadata-url) に戻ります。
       
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
      | Identifier (Entity ID)    | コンソールから Service Provider Entity ID をコピーします |
      | Reply URL (Assertion Consumer Service URL) | コンソールから Single Sign-On URL をコピーします |
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
   
   12. メタデータ URL をコピーし、[Add the metadata URL to your SAML configuration](#add-metadata-url) に戻って作業を続行します。

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

    | フィールド                           | 値                                                |
    |:-------------------------------------|:--------------------------------------------------|
    | Entity ID                            | コンソールから Service Provider Entity ID をコピーします |
    | Assertion Consumer Service (ACS) URL | コンソールから Single Sign-On URL をコピーします |
    | Service Provider Login URL           | `https://console.clickhouse.cloud/?connection={organizationid}` |

4.  メタデータ URL をコピーし、プロセスを続行するために [メタデータ URL を SAML 設定に追加](#add-metadata-url) セクションに戻ります。
   
</details>

## 仕組み {#how-it-works}

### SAML SSO を利用したユーザー管理 {#user-management-with-saml-sso}

ユーザー権限の管理や、アクセスを SAML 接続のみに制限する方法の詳細については、[クラウドユーザーの管理](/cloud/security/manage-cloud-users) を参照してください。

### サービスプロバイダー開始型 SSO {#service-provider-initiated-sso}

ClickHouse Cloud では、サービスプロバイダー開始型 SSO のみを利用しています。これは、ユーザーが `https://console.clickhouse.cloud` にアクセスしてメールアドレスを入力すると、認証のために IdP にリダイレクトされる方式であることを意味します。すでに IdP によって認証されているユーザーは、ログインページでメールアドレスを入力することなく、組織に自動的にログインできるダイレクトリンクを使用できます。

### 複数組織向け SSO {#multi-org-sso}

ClickHouse Cloud は、組織ごとに個別の接続を提供することで、複数組織向け SSO をサポートします。各組織にログインするには、ダイレクトリンク (`https://console.clickhouse.cloud/?connection={organizationid}`) を使用してください。別の組織にログインする前に、現在ログインしている組織から必ずログアウトしてください。

## 追加情報 {#additional-information}

認証に関しては、セキュリティを最優先としています。このため、SSO を実装するにあたり、いくつかの重要な設計上の決定を行っており、その点について事前にご理解いただく必要があります。

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