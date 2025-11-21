---
sidebar_label: 'SAML SSO のセットアップ'
slug: /cloud/security/saml-setup
title: 'SAML SSO のセットアップ'
description: 'ClickHouse Cloud での SAML SSO の設定方法'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO の設定

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud は、Security Assertion Markup Language (SAML) を利用したシングルサインオン (SSO) をサポートしています。これにより、アイデンティティプロバイダ (IdP) で認証することで、ClickHouse Cloud の組織に安全にサインインできるようになります。

現在、サービスプロバイダー主導の SSO、別個の接続を使用する複数の組織での利用、およびジャストインタイムプロビジョニングをサポートしています。現時点では、System for Cross-domain Identity Management (SCIM) や属性マッピングはまだサポートしていません。



## 始める前に {#before-you-begin}

IdPでの管理者権限と、ClickHouse Cloud組織での**Admin**ロールが必要です。IdP内で接続を設定した後、以下の手順で要求される情報を添えて弊社にご連絡いただき、設定を完了してください。

ログインプロセスを簡素化するため、SAML接続に加えて**組織への直接リンク**を設定することを推奨します。各IdPで処理方法は異なります。お使いのIdPでの設定方法については、以下をご参照ください。


## IdPの設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
  <summary> 組織IDの取得 </summary>
  すべての設定には組織IDが必要です。組織IDを取得するには: 1.
  [ClickHouse Cloud](https://console.clickhouse.cloud)
  組織にサインインします。
  <Image img={samlOrgId} size='md' alt='Organization ID' force />
  3. 左下隅の
  **Organization**の下にある組織名をクリックします。 4. ポップアップメニューで**Organization details**を選択します。 5.
  以下で使用する**Organization ID**をメモしておきます。
</details>

<details> 
   <summary>  SAML統合の設定  </summary>
   
   ClickHouseはサービスプロバイダー起点のSAML接続を使用します。これは、https://console.clickhouse.cloud または直接リンク経由でログインできることを意味します。現在、アイデンティティプロバイダー起点の接続はサポートしていません。基本的なSAML設定には以下が含まれます:

- SSO URLまたはACS URL: `https://auth.clickhouse.cloud/login/callback?connection={organizationid}`

- Audience URIまたはEntity ID: `urn:auth0:ch-production:{organizationid}`

- Application username: `email`

- Attribute mapping: `email = user.email`

- 組織にアクセスするための直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}`

  具体的な設定手順については、以下のご利用のアイデンティティプロバイダーを参照してください。

</details>

<details>
   <summary>  接続情報の取得  </summary>

アイデンティティプロバイダーのSSO URLとx.509証明書を取得します。この情報の取得方法については、以下のご利用のアイデンティティプロバイダーを参照してください。

</details>

<details>
   <summary>  サポートケースの送信 </summary>
   
   1. ClickHouse Cloudコンソールに戻ります。
      
   2. 左側の**Help**を選択し、次にSupportサブメニューを選択します。
   
   3. **New case**をクリックします。
   
   4. 件名に「SAML SSO Setup」と入力します。
   
   5. 説明欄に、上記の手順で収集したリンクを貼り付け、証明書をチケットに添付します。
   
   6. この接続で許可すべきドメイン(例: domain.com、domain.aiなど)もお知らせください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud内で設定を完了し、テストの準備が整い次第お知らせします。

</details>

<details>
   <summary>  設定の完了  </summary>

1.  アイデンティティプロバイダー内でユーザーアクセスを割り当てます。

2.  https://console.clickhouse.cloud または上記の「SAML統合の設定」で設定した直接リンク経由でClickHouseにログインします。ユーザーには最初に「Member」ロールが割り当てられ、組織にログインして個人設定を更新できます。

3.  ClickHouse組織からログアウトします。

4.  元の認証方法でログインし、新しいSSOアカウントにAdminロールを割り当てます。

- メール + パスワードアカウントの場合は、`https://console.clickhouse.cloud/?with=email`を使用してください。
- ソーシャルログインの場合は、適切なボタン(**Continue with Google**または**Continue with Microsoft**)をクリックしてください。

:::note
上記の`?with=email`の`email`は、プレースホルダーではなくリテラルパラメータ値です
:::

5.  元の認証方法でログアウトし、https://console.clickhouse.cloud または上記の「SAML統合の設定」で設定した直接リンク経由で再度ログインします。

6.  組織にSAMLを適用するため、SAML以外のユーザーを削除します。今後、ユーザーはアイデンティティプロバイダー経由で割り当てられます。

</details>

### Okta SAMLの設定 {#configure-okta-saml}

各ClickHouse組織に対して、Oktaで2つのアプリ統合を設定します: 1つのSAMLアプリと、直接リンクを格納する1つのブックマークです。

<details>
   <summary>  1. アクセス管理用のグループを作成  </summary>
   
   1. **Administrator**としてOktaインスタンスにログインします。

2.  左側の**Groups**を選択します。

3.  **Add group**をクリックします。

4.  グループの名前と説明を入力します。このグループは、SAMLアプリと関連するブックマークアプリ間でユーザーの一貫性を保つために使用されます。

5.  **Save**をクリックします。

6.  作成したグループの名前をクリックします。

7.  **Assign people**をクリックして、このClickHouse組織へのアクセスを許可するユーザーを割り当てます。

</details>


<details>
  <summary>
    {" "}
    2. ユーザーがシームレスにログインできるようにするブックマークアプリを作成する{" "}
  </summary>
  1. 左側の **Applications** を選択し、**Applications** サブ見出しを選択します。2. **Browse App Catalog** をクリックします。3. **Bookmark App** を検索して選択します。4. **Add integration** をクリックします。5. アプリのラベルを選択します。6. URLとして `https://console.clickhouse.cloud/?connection={organizationid}` を入力します。7. **Assignments** タブに移動し、上記で作成したグループを追加します。
</details>

<details>
   <summary>  3. 接続を有効にするSAMLアプリを作成する  </summary>
   
   1. 左側の **Applications** を選択し、**Applications** サブ見出しを選択します。
   
   2. **Create App Integration** をクリックします。
   
   3. SAML 2.0を選択し、Nextをクリックします。
   
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
   
   7. 以下のAttribute Statementを入力します。

      | Name    | Name format   | Value      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |

9. **Next** をクリックします。

10. Feedbackスクリーンで要求された情報を入力し、**Finish** をクリックします。

11. **Assignments** タブに移動し、上記で作成したグループを追加します。

12. 新しいアプリの **Sign On** タブで、**View SAML setup instructions** ボタンをクリックします。

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Okta SAML設定手順'
      force
    />

13. これら3つの項目を収集し、上記の「サポートケースの提出」に進んでプロセスを完了します。


     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 Certificate

</details>

### Google SAMLの設定 {#configure-google-saml}

各組織ごとにGoogleで1つのSAMLアプリを設定する必要があります。マルチ組織SSOを使用する場合は、ユーザーにブックマーク用の直接リンク（`https://console.clickhouse.cloud/?connection={organizationId}`）を提供する必要があります。

<details>
   <summary>  Google Webアプリを作成する  </summary>
   
   1. Google管理コンソール（admin.google.com）にアクセスします。

<Image img={samlGoogleApp} size='md' alt='Google SAMLアプリ' force />

2.  **Apps** をクリックし、左側の **Web and mobile apps** をクリックします。

3.  上部メニューから **Add app** をクリックし、**Add custom SAML app** を選択します。

4.  アプリの名前を入力し、**Continue** をクリックします。

5.  これら2つの項目を収集し、上記の「サポートケースの提出」に進んで情報を送信してください。注意：このデータをコピーする前にセットアップを完了した場合は、アプリのホーム画面から **DOWNLOAD METADATA** をクリックしてX.509証明書を取得してください。


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


14. アプリを有効にするには、全員に対して**OFF**をクリックし、設定を全員に対して**ON**に変更します。画面左側のオプションを選択することで、アクセスをグループまたは組織単位に制限することもできます。

</details>

### Azure (Microsoft) SAMLの設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAMLは、Azure Active Directory (AD)またはMicrosoft Entraとも呼ばれます。

<details>
   <summary>  Azureエンタープライズアプリケーションの作成 </summary>
   
   組織ごとに個別のサインオンURLを持つアプリケーション統合を1つセットアップします。
   
   1. Microsoft Entra管理センターにログオンします。
   
   2. 左側の**アプリケーション > エンタープライズ**アプリケーションに移動します。
   
   3. 上部メニューの**新しいアプリケーション**をクリックします。
   
   4. 上部メニューの**独自のアプリケーションを作成**をクリックします。
   
   5. 名前を入力し、**ギャラリーにない他のアプリケーションを統合する(ギャラリー以外)**を選択してから、**作成**をクリックします。
   
      <Image img={samlAzureApp} size="md" alt="Azureギャラリー以外のアプリ" force/>
   
   6. 左側の**ユーザーとグループ**をクリックし、ユーザーを割り当てます。
   
   7. 左側の**シングルサインオン**をクリックします。
   
   8. **SAML**をクリックします。
   
   9. 以下の設定を使用して、基本的なSAML設定画面を入力します。
   
      | フィールド                     | 値 |
      |---------------------------|-------|
      | 識別子(エンティティID)    | `urn:auth0:ch-production:{organizationid}` |
      | 応答URL(Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サインオンURL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | リレー状態               | 空白 |
      | ログアウトURL                | 空白 |
   
   11. 属性とクレームの下に以下を追加(A)または更新(U)します:
   
       | クレーム名                           | 形式        | ソース属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 一意のユーザー識別子(名前ID) | メールアドレス | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 省略       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性とクレーム" force/>
   
   12. 以下の2つの項目を収集し、上記のサポートケースの送信に進んでプロセスを完了します:
     - ログインURL
     - 証明書(Base64)

</details>

### Duo SAMLの設定 {#configure-duo-saml}

<details>
   <summary> Duo用の汎用SAMLサービスプロバイダーの作成 </summary>
   
   1. [汎用SAMLサービスプロバイダー向けDuoシングルサインオン](https://duo.com/docs/sso-generic)の手順に従ってください。
   
   2. 以下のブリッジ属性マッピングを使用します:

      |  ブリッジ属性  |  ClickHouse属性  |
      |:-------------------|:-----------------------|
      | メールアドレス      | email                  |

3.  以下の値を使用して、Duoのクラウドアプリケーションを更新します:

    | フィールド                                | 値                                                                      |
    | :----------------------------------- | :------------------------------------------------------------------------- |
    | エンティティID                            | `urn:auth0:ch-production:{organizationid}`                                 |
    | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | サービスプロバイダーログインURL           | `https://console.clickhouse.cloud/?connection={organizationid}`            |

4.  以下の2つの項目を収集し、上記のサポートケースの送信に進んでプロセスを完了します:
    - シングルサインオンURL
    - 証明書

</details>


## 仕組み {#how-it-works}

### SAML SSOによるユーザー管理 {#user-management-with-saml-sso}

ユーザー権限の管理とSAML接続のみへのアクセス制限の詳細については、[クラウドユーザーの管理](/cloud/security/manage-cloud-users)を参照してください。

### サービスプロバイダー起点のSSO {#service-provider-initiated-sso}

サービスプロバイダー起点のSSOのみを使用しています。これは、ユーザーが`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力することでIdPにリダイレクトされ認証が行われることを意味します。既にIdP経由で認証済みのユーザーは、直接リンクを使用することで、ログインページでメールアドレスを入力せずに、自動的に組織にログインできます。

### マルチ組織SSO {#multi-org-sso}

ClickHouse Cloudは、各組織に個別の接続を提供することでマルチ組織SSOをサポートしています。各組織にログインするには、直接リンク（`https://console.clickhouse.cloud/?connection={organizationid}`）を使用してください。別の組織にログインする前に、必ず現在の組織からログアウトしてください。


## 追加情報 {#additional-information}

認証においては、セキュリティを最優先事項としています。そのため、SSO実装にあたり、以下の点についてご理解いただく必要があります。

- **サービスプロバイダー起点の認証フローのみを処理します。** ユーザーは`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力することで、貴社のアイデンティティプロバイダーにリダイレクトされます。ユーザーがURLを記憶する必要がないよう、ブックマークアプリケーションやショートカットを追加する手順を提供しています。

- **SSOアカウントと非SSOアカウントは自動的にリンクされません。** 同じメールアドレスを使用している場合でも、ClickHouseのユーザーリストに同一ユーザーの複数のアカウントが表示されることがあります。


## 一般的な問題のトラブルシューティング {#troubleshooting-common-issues}

| エラー                                                                                                                                                              | 原因                                                                                 | 解決方法                                                                                                                                                                                                                       |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| システムの設定ミスまたはサービス停止の可能性があります                                                                                                | IDプロバイダー起動ログイン                                                     | このエラーを解決するには、直接リンク `https://console.clickhouse.cloud/?connection={organizationid}` を使用してください。上記のIDプロバイダーの手順に従って、これをユーザーのデフォルトログイン方法として設定してください |
| IDプロバイダーにリダイレクトされた後、ログインページに戻されます                                                                                            | IDプロバイダーにメール属性マッピングが設定されていません                       | 上記のIDプロバイダーの手順に従ってユーザーメール属性を設定し、再度ログインしてください                                                                                                                |
| ユーザーがこのアプリケーションに割り当てられていません                                                                                                                           | IDプロバイダーでユーザーがClickHouseアプリケーションに割り当てられていません | IDプロバイダーでユーザーをアプリケーションに割り当て、再度ログインしてください                                                                                                                                                   |
| SAML SSOと統合された複数のClickHouse組織があり、どのリンクやタイルを使用しても常に同じ組織にログインされます | 最初の組織にログインしたままになっています                                     | ログアウトしてから、他の組織にログインしてください                                                                                                                                                                                 |
| URLに一時的に `access denied` と表示されます                                                                                                                              | メールドメインが設定済みのドメインと一致しません                        | このエラーの解決についてはサポートにお問い合わせください                                                                                                                                                                                       |
