---
sidebar_label: 'SAML SSOの設定'
slug: /cloud/security/saml-setup
title: 'SAML SSOの設定'
description: 'ClickHouse CloudでSAML SSOを設定する方法'
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSOの設定

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloudは、セキュリティアサーションマークアップ言語（SAML）を使用したシングルサインオン（SSO）をサポートしています。これにより、アイデンティティプロバイダー（IdP）で認証することで、ClickHouse Cloud組織に安全にサインインできます。

現在、サービスプロバイダーが開始するSSO、別々の接続を使用した複数の組織、および必要に応じたプロビジョニングをサポートしています。クロスドメインのアイデンティティ管理システム（SCIM）や属性マッピングのシステムはまだサポートしていません。

## 始める前に {#before-you-begin}

あなたのIdPでAdmin権限とClickHouse Cloud組織での**Admin**ロールが必要です。IdP内で接続を設定した後、以下の手順で要求された情報を持って私たちに連絡して、このプロセスを完了してください。

ログインプロセスを簡素化するために、SAML接続に加えて**組織への直接リンク**を設定することをお勧めします。各IdPはこれを異なる方法で処理します。あなたのIdPに対してこれを行う方法を読み続けてください。

## IdPの設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織IDを取得する  </summary>
   
   すべてのセットアップには、組織IDが必要です。組織IDを取得するには：

   1. [ClickHouse Cloud](https://console.clickhouse.cloud)組織にサインインします。
   
      <Image img={samlOrgId} size="md" alt="組織ID" />
      
   3. 左下のコーナーで、**組織**の下の組織名をクリックします。
   
   4. ポップアップメニューで、**組織の詳細**を選択します。
   
   5. 以下で使用するために、**組織ID**をメモしておきます。
      
</details>

<details> 
   <summary>  SAML統合を設定する  </summary>
   
   ClickHouseは、サービスプロバイダーが開始するSAML接続を使用します。これは、https://console.clickhouse.cloud または直接リンクを介してログインできることを意味します。現在、アイデンティティプロバイダーが開始する接続はサポートしていません。基本的なSAML設定には、以下が含まれます：

   - SSO URLまたはACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URIまたはEntity ID: `urn:auth0:ch-production:{organizationid}` 

   - アプリケーションのユーザー名: `email`

   - 属性マッピング: `email = user.email`

   - 組織にアクセスするための直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}` 

   特定の設定手順については、以下の特定のアイデンティティプロバイダーを参照してください。
   
</details>

<details>
   <summary>  接続情報を取得する  </summary>

   IDプロバイダーのSSO URLとx.509証明書を取得します。この情報の取得方法については、以下の特定のアイデンティティプロバイダーを参照してください。

</details>

<details>
   <summary>  サポートケースを提出する </summary>
   
   1. ClickHouse Cloudコンソールに戻ります。
      
   2. 左側の**ヘルプ**を選択し、次にサポートのサブメニューを選択します。
   
   3. **新しいケース**をクリックします。
   
   4. 件名に「SAML SSOの設定」と入力します。
   
   5. 説明に、上記の手順で集めたリンクを貼り付け、チケットに証明書を添付します。
   
   6. また、この接続を許可する必要があるドメイン（例: domain.com, domain.aiなど）を教えてください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud内でのセットアップを完了し、テストする準備ができたらお知らせします。

</details>

<details>
   <summary>  セットアップを完了する  </summary>

   1. アイデンティティプロバイダー内でユーザーアクセスを割り当てます。 

   2. https://console.clickhouse.cloud または上記の「SAML統合の設定」で設定した直接リンクを介してClickHouseにログインします。 ユーザーには最初に「メンバー」ロールが割り当てられ、組織にログインして個人設定を更新できます。

   3. ClickHouse組織からログアウトします。 

   4. 元の認証方法でログインし、新しいSSOアカウントにAdminロールを割り当てます。
   - メール + パスワードアカウントの場合、`https://console.clickhouse.cloud/?with=email` を使用してください。
   - ソーシャルログインの場合は、該当するボタン（**Googleで続行**または**Microsoftで続行**）をクリックしてください。

   5. 元の認証方法でログアウトし、https://console.clickhouse.cloud または上記の「SAML統合の設定」で設定した直接リンクを介して再度ログインします。

   6. 非SAMLユーザーを削除して、組織に対してSAMLを強制します。今後のユーザーはアイデンティティプロバイダーを介して割り当てられます。
   
</details>

### Okta SAMLの設定 {#configure-okta-saml}

それぞれのClickHouse組織のためにOktaで2つのアプリ統合を設定します：1つのSAMLアプリと直接リンクを保存するためのブックマークです。

<details>
   <summary>  1. アクセスを管理するためのグループを作成  </summary>
   
   1. Oktaインスタンスに**管理者**としてログインします。

   2. 左側の**グループ**を選択します。

   3. **グループの追加**をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAMLアプリと関連するブックマークアプリ間でユーザーを一貫して保つために使用されます。

   5. **保存**をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **人を割り当てる**をクリックして、このClickHouse組織にアクセスさせたいユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにブックマークアプリを作成  </summary>
   
   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。
   
   2. **アプリカタログをブラウズ**をクリックします。
   
   3. **ブックマークアプリ**を検索して選択します。
   
   4. **統合の追加**をクリックします。
   
   5. アプリのラベルを選択します。
   
   6. URLを `https://console.clickhouse.cloud/?connection={organizationid}` として入力します。
   
   7. **割り当て**タブに移動し、上記で作成したグループを追加します。
   
</details>

<details>
   <summary>  3. 接続を有効にするためにSAMLアプリを作成  </summary>
   
   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。
   
   2. **アプリ統合の作成**をクリックします。
   
   3. SAML 2.0を選択し、次へ進みます。
   
   4. アプリケーションの名前を入力し、**アプリケーションアイコンをユーザーに表示しない**の横のボックスにチェックを入れてから**次へ**をクリックします。 
   
   5. SAML設定画面に次の値を入力します。
   
      | フィールド                      | 値 |
      |--------------------------------|-------|
      | シングルサインオンURL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | デフォルトリレーステート             | 空白       |
      | Name ID形式                     | 指定されていない       |
      | アプリケーションユーザー名           | メール             |
      | アプリケーションユーザー名の更新 | 作成および更新 |

   7. 次の属性ステートメントを入力します。

      | 名前    | 名前の形式   | 値      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. **次へ**をクリックします。
   
   10. フィードバック画面で要求された情報を入力し、**完了**をクリックします。
   
   11. **割り当て**タブに移動し、上記で作成したグループを追加します。
   
   12. 新しいアプリの**サインオン**タブで、**SAML設定手順を見る**ボタンをクリックします。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML 設定手順" />
   
   13. これらの3つの項目を集め、上記の「サポートケースを提出」セクションに移動してプロセスを完了します。
     - アイデンティティプロバイダーのシングルサインオンURL
     - アイデンティティプロバイダーの発行者
     - X.509証明書
   
</details>


### Google SAMLの設定 {#configure-google-saml}

各組織に対して1つのSAMLアプリをGoogleで設定し、複数組織のSSOを使用している場合はユーザーに直接リンク（`https://console.clickhouse.cloud/?connection={organizationId}`）をブックマークするように提供する必要があります。

<details>
   <summary>  Google Webアプリを作成  </summary>
   
   1. Google Adminコンソール (admin.google.com)に移動します。

   <Image img={samlGoogleApp} size="md" alt="Google SAML アプリ" />

   2. 左側で**アプリ**をクリックし、次に**ウェブとモバイルアプリ**を選択します。
   
   3. 上部メニューから**アプリの追加**をクリックし、次に**カスタムSAMLアプリの追加**を選択します。
   
   4. アプリの名前を入力し、**続行**をクリックします。
   
   5. これらの2つの項目を集め、上記の「サポートケースを提出」セクションに移動して私たちに情報を提出します。注意: このデータをコピーする前に設定を完了した場合は、アプリのホーム画面から**METADATAをダウンロード**をクリックしてX.509証明書を取得します。
     - SSO URL
     - X.509証明書
   
   7. ACS URLとEntity IDを以下に入力します。
   
      | フィールド     | 値 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
   
   8. **署名付きレスポンス**のチェックボックスにチェックを入れます。
   
   9. Name ID形式として**EMAIL**を選択し、Name IDを**基本情報 > プライマリメール**のままにします。
   
   10. **続行**をクリックします。
   
   11. 次の属性マッピングを入力します。
       
      | フィールド             | 値         |
      |-------------------|---------------|
      | 基本情報 | プライマリメール |
      | アプリ属性    | email         |
       
   13. **完了**をクリックします。
   
   14. アプリを有効にするには、全員の設定を**オフ**にして、**全員にオン**に変えます。アクセスは、画面左側のオプションを選択することでグループや組織単位に制限することもできます。
       
</details>

### Azure (Microsoft) SAMLの設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAMLはAzure Active Directory (AD)またはMicrosoft Entraとも呼ばれる場合があります。

<details>
   <summary>  Azureエンタープライズアプリケーションを作成  </summary>
   
   各組織に対して、別々のサインオンURLのある1つのアプリケーション統合を設定します。
   
   1. Microsoft Entra管理センターにログオンします。
   
   2. 左側で**アプリケーション > エンタープライズ**アプリケーションに移動します。
   
   3. 上部メニューから**新しいアプリケーション**をクリックします。
   
   4. 上部メニューから**独自のアプリケーションを作成**をクリックします。
   
   5. 名前を入力し、**ギャラリーに見つからない任意のアプリケーションを統合する（非ギャラリー）**を選択してから**作成**をクリックします。
   
      <Image img={samlAzureApp} size="md" alt="Azure非ギャラリーアプリ" />
   
   6. 左側で**ユーザーとグループ**をクリックし、ユーザーを割り当てます。
   
   7. 左側で**シングルサインオン**をクリックします。
   
   8. **SAML**をクリックします。
   
   9. 次の設定を使用して基本的なSAML設定画面に入力します。
   
      | フィールド                     | 値 |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | Logout URL                | 空白 |
   
   11. 属性とクレームの下に次の内容を追加（A）または更新（U）します：
   
       | クレーム名                           | フォーマット        | ソース属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 一意のユーザー識別子 (Name ID) | メールアドレス | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 省略       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性とクレーム" />
   
   12. これらの2つの項目を集め、上記の「サポートケースを提出」セクションに移動してプロセスを完了します：
     - ログインURL
     - 証明書（Base64）

</details>

### Duo SAMLの設定 {#configure-duo-saml}

<details>
   <summary> Duoのための一般的なSAMLサービスプロバイダーを作成  </summary>
   
   1. [Duoの一般的なSAMLサービスプロバイダーのためのシングルサインオンに関する指示](https://duo.com/docs/sso-generic)に従います。 
   
   2. 次のブリッジ属性マッピングを使用します：

      |  ブリッジ属性  |  ClickHouse属性  | 
      |:-------------------|:-----------------------|
      | メールアドレス      | email                  |
   
   3. DuoのCloudアプリケーションを更新するために次の値を使用します：

      |  フィールド    |  値                                     |
      |:----------|:-------------------------------------------|
      | エンティティID | `urn:auth0:ch-production:{organizationid}` |
      | アサーション消費者サービス（ACS）URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サービスプロバイダーのログインURL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. これらの2つの項目を集め、上記の「サポートケースを提出」セクションに移動してプロセスを完了します：
      - シングルサインオンURL
      - 証明書
   
</details>


## 機能 {#how-it-works}

### サービスプロバイダーが開始するSSO {#service-provider-initiated-sso}

私たちはサービスプロバイダーが開始するSSOのみを利用します。これは、ユーザーが `https://console.clickhouse.cloud` に移動し、認証のためにIdPにリダイレクトされるメールアドレスを入力することを意味します。IdPで既に認証されたユーザーは、ログインページでメールアドレスを入力することなく、直接リンクを使用して自動的に組織にログインできます。

### ユーザーロールの割り当て {#assigning-user-roles}

ユーザーは、IdPアプリケーションに割り当てられ、初めてログインした後にClickHouse Cloudコンソールに表示されます。少なくとも1人のSSOユーザーは、組織でAdminロールを割り当てられている必要があります。ソーシャルログインまたは `https://console.clickhouse.cloud/?with=email` を使用して元の認証方法でログインし、SSOロールを更新してください。

### 非SSOユーザーの削除 {#removing-non-sso-users}

SSOユーザーの設定が完了し、少なくとも1人のAdminロールが割り当てられた場合、Adminは他の方法（例：ソーシャル認証またはユーザーID + パスワード）を使用しているユーザーを削除できます。SSOが設定された後もGoogle認証は引き続き機能します。ユーザーID + パスワードのユーザーは、`https://console.clickhouse.cloud/?with=email`を使用しない限り、彼らのメールドメインに基づいて自動的にSSOにリダイレクトされます。

### ユーザーの管理 {#managing-users}

ClickHouse Cloudは現在、SSOのためのSAMLを実装しています。ユーザーを管理するためのSCIMはまだ実装していません。つまり、SSOユーザーはClickHouse Cloud組織にアクセスするためにIdP内のアプリケーションに割り当てられている必要があります。ユーザーはClickHouse Cloudに一度ログインする必要があり、そうしなければ組織の**ユーザー**領域に表示されません。IdPでユーザーが削除されると、SSOを使用してClickHouse Cloudにログインできなくなります。しかし、SSOユーザーは、管理者が手動でユーザーを削除するまで、組織内に表示され続けます。

### 複数組織SSO {#multi-org-sso}

ClickHouse Cloudは、各組織に対して別々の接続を提供することにより、複数組織のSSOをサポートしています。それぞれの組織にログインするには、直接リンク（`https://console.clickhouse.cloud/?connection={organizationid}`）を使用してください。一つの組織からログアウトしてから、別の組織にログインするようにしてください。

## 追加情報 {#additional-information}

セキュリティは、認証に関する私たちの最優先事項です。この理由から、SSOを実装する際にいくつかの決定を下しました。以下のことを知っておいてください。

- **サービスプロバイダーが開始する認証フローのみを処理します。** ユーザーは、`https://console.clickhouse.cloud`に移動してメールアドレスを入力し、アイデンティティプロバイダーにリダイレクトされる必要があります。ブックマークアプリケーションやショートカットの追加手順を提供していますので、ユーザーはURLを覚えておく必要はありません。

- **IdPを介してアプリに割り当てられたすべてのユーザーは同じメールドメインを持っている必要があります。** ベンダー、契約者、またはコンサルタントがClickHouseアカウントにアクセスできるようにするには、従業員と同じドメイン（例：user@domain.com）のメールアドレスが必要です。

- **SSOアカウントと非SSOアカウントが自動的にリンクされることはありません。** 同じメールアドレスを使用していても、ClickHouseのユーザーリストにユーザーの複数のアカウントが表示される可能性があります。
