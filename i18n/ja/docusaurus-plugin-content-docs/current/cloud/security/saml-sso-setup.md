---
sidebar_label: SAML SSO セットアップ
slug: /cloud/security/saml-setup
title: SAML SSO セットアップ
description: ClickHouse CloudでのSAML SSOの設定方法
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge' 

# SAML SSO セットアップ

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloudは、セキュリティアサーションマークアップ言語（SAML）を使用したシングルサインオン（SSO）をサポートしています。これにより、アイデンティティプロバイダー（IdP）で認証することで、ClickHouse Cloudの組織にセキュアにサインインできます。

現在、サービスプロバイダー主導のSSO、複数の組織を別々の接続で使用すること、およびジャストインタイムプロビジョニングをサポートしています。クロスドメインアイデンティティ管理（SCIM）や属性マッピングのシステムはまだサポートしていません。

## 始める前に {#before-you-begin}

IdPでの管理者権限と、ClickHouse Cloudの組織での**管理者**ロールが必要です。IdP内で接続を設定した後、以下の手順で要求された情報を含めてご連絡いただき、プロセスを完了してください。

ログインプロセスを簡素化するために、SAML接続に加えて**組織へのダイレクトリンク**を設定することをお勧めします。各IdPはこれを異なる方法で処理します。あなたのIdPに対してどのように行うかは以下をお読みください。

## IdPの設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織IDを取得する  </summary>
   
   すべての設定には組織IDが必要です。組織IDを取得するには、以下を行います。
   
   1. [ClickHouse Cloud](https://console.clickhouse.cloud)の組織にサインインします。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/0cb69e9e-1506-4eb4-957d-f104d8c15f3a'
           class="image"
           alt="組織ID"
           style={{width: '60%', display: 'inline'}} />
      
   3. 左下隅にある**組織**の下の組織名をクリックします。
   
   4. ポップアップメニューから**組織の詳細**を選択します。
   
   5. 以下で使用するために**組織ID**をメモしてください。
      
</details>

<details> 
   <summary>  SAML統合を設定する  </summary>
   
   ClickHouseはサービスプロバイダー主導のSAML接続を使用します。これは、`https://console.clickhouse.cloud`経由またはダイレクトリンク経由でログインできることを意味します。現在、アイデンティティプロバイダー主導の接続はサポートしていません。基本的なSAML構成には以下が含まれます。

   - SSO URLまたはACS URL: `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URIまたはEntity ID: `urn:auth0:ch-production:{organizationid}` 

   - アプリケーションユーザー名: `email`

   - 属性マッピング: `email = user.email`

   - 組織にアクセスするためのダイレクトリンク: `https://console.clickhouse.cloud?connection={organizationid}` 

   特定の構成手順については、以下で各アイデンティティプロバイダーに関する情報を参照してください。
   
</details>

<details>
   <summary>  接続情報を取得する  </summary>

   アイデンティティプロバイダーのSSO URLとx.509証明書を取得します。これに関する情報を取得する手順は、以下で特定のアイデンティティプロバイダーに従ってください。

</details>


<details>
   <summary>  サポートケースを提出する </summary>
   
   1. ClickHouse Cloudコンソールに戻ります。
      
   2. 左側の**ヘルプ**を選択し、次にサポートサブメニューを選択します。
   
   3. **新しいケース**をクリックします。
   
   4. 件名に「SAML SSO セットアップ」と入力します。
   
   5. 説明には、上記の手順から収集したリンクを貼り付け、証明書をチケットに添付してください。
   
   6. この接続に許可されるべきドメイン（例: domain.com, domain.aiなど）もお知らせください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud内でセットアップを完了し、テストの準備が整ったらお知らせします。

</details>

<details>
   <summary>  セットアップを完了する  </summary>

   1. アイデンティティプロバイダー内でユーザーアクセスを割り当てます。 

   2. `https://console.clickhouse.cloud`または上記の「SAML統合の設定」で設定したダイレクトリンクを使用してClickHouseにログインします。ユーザーは最初に「Developer」ロールを割り当てられ、これは組織への読み取り専用アクセスを持ちます。

   3. ClickHouse組織からログアウトします。 

   4. 元の認証方法でログインし、新しいSSOアカウントに管理者ロールを割り当てます。
   - メール＋パスワードのアカウントの場合は`https://console.clickhouse.cloud/?with=email`を使用してください。
   - ソーシャルログインの場合は、適切なボタン（**Googleで続行**または**Microsoftで続行**）をクリックしてください。

   5. 元の認証方法でログアウトし、`https://console.clickhouse.cloud`または上記の「SAML統合の設定」で設定したダイレクトリンクから再度ログインします。

   6. 組織のSAMLを強制するために、非SAMLユーザーを削除します。今後は、アイデンティティプロバイダー経由でユーザーが割り当てられます。
   
</details>

### Okta SAMLの設定 {#configure-okta-saml}

Oktaで各ClickHouse組織に対して2つのアプリ統合を設定します：1つのSAMLアプリと、ダイレクトリンクを保持する1つのブックマーク。

<details>
   <summary>  1. アクセス管理用のグループを作成する  </summary>
   
   1. **管理者**としてOktaインスタンスにログインします。

   2. 左側で**グループ**を選択します。

   3. **グループを追加**をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAMLアプリと関連するブックマークアプリとの間でユーザーを一貫して保持するために使用されます。

   5. **保存**をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **人を割り当てる**をクリックして、このClickHouse組織にアクセスしたいユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにブックマークアプリを作成する  </summary>
   
   1. 左側で**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。
   
   2. **アプリカタログをブラウズ**をクリックします。
   
   3. **ブックマークアプリ**を検索して選択します。
   
   4. **統合を追加**をクリックします。
   
   5. アプリのラベルを選択します。
   
   6. URLを`https://console.clickhouse.cloud?connection={organizationid}`として入力します。
   
   7. **割り当て**タブに移動し、上で作成したグループを追加します。
   
</details>

<details>
   <summary>  3. 接続を有効にするためのSAMLアプリを作成する  </summary>
   
   1. 左側で**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。
   
   2. **アプリ統合を作成**をクリックします。
   
   3. SAML 2.0を選択し、次へをクリックします。
   
   4. アプリケーションの名前を入力し、**ユーザーにアプリケーションのアイコンを表示しない**の隣のボックスにチェックを入れてから、**次へ**をクリックします。 
   
   5. 以下の値を使用してSAML設定画面を設定します。
   
      | フィールド                          | 値 |
      |------------------------------------|-------|
      | シングルサインオンURL               | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI（SPエンティティID）    | `urn:auth0:ch-production:{organizationid}` |
      | デフォルトリレー状態               | 空白       |
      | 名前ID形式                         | 未指定       |
      | アプリケーションユーザー名         | メール             |
      | アプリケーションユーザー名の更新時  | 作成と更新 |

   7. 以下の属性ステートメントを入力します。

      | 名称    | 名称形式   | 値      |
      |---------|------------|----------|
      | email   | 基本         | user.email |
   
   9. **次へ**をクリックします。
   
   10. フィードバック画面にリクエストされた情報を入力し、**完了**をクリックします。
   
   11. **割り当て**タブに移動し、上で作成したグループを追加します。
   
   12. 新しいアプリの**サインオン**タブで、**SAMLのセットアップ手順を表示**ボタンをクリックします。 
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/8d316548-5fb7-4d3a-aad9-5d025c51f158'
              class="image"
              alt="Okta SAML セットアップ手順"
              style={{width: '60%', display: 'inline'}} />
   
   13. これら3項目を収集し、上記のサポートケースの提出に移動して、プロセスを完了してください。
     - アイデンティティプロバイダーのシングルサインオンURL
     - アイデンティティプロバイダーの発行者
     - X.509 証明書
   
</details>


### Google SAMLの設定 {#configure-google-saml}

各組織に対して1つのSAMLアプリをGoogleで設定し、ユーザーに直接リンク（`https://console.clickhouse.cloud?connection={organizationId}`）をブックマークするように指示する必要があります。これはマルチ組織SSOを使用する場合に必要です。

<details>
   <summary>  Google Webアプリを作成する  </summary>
   
   1. Google管理コンソール（admin.google.com）に移動します。

   <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b931bd12-2fdf-4e25-b0b5-1170bbd20760'
        class="image"
        alt="Google SAML アプリ"
        style={{width: '60%', display: 'inline'}} />

   2. 左側で**アプリ**、次に**Webとモバイルアプリ**を選択します。
   
   3. 上部メニューから**アプリを追加**をクリックし、**カスタムSAMLアプリの追加**を選択します。
   
   4. アプリの名前を入力し、**続行**をクリックします。
   
   5. これら2項目を収集し、上記のサポートケース提出に移動して情報を送信してください。注意: このデータのコピー前に設定を完了した場合、アプリのホーム画面から**メタデータをダウンロード**をクリックしてX.509証明書を取得します。
     - SSO URL
     - X.509証明書
   
   7. 以下にACS URLとEntity IDを入力します。
   
      | フィールド     | 値 |
      |---------------|-------|
      | ACS URL       | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID     | `urn:auth0:ch-production:{organizationid}` |
   
   8. **署名付き応答**のチェックボックスをチェックします。
   
   9. 名前ID形式に**EMAIL**を選択し、名前IDは**基本情報 > プライマリメール**のままにします。
   
   10. **続行**をクリックします。
   
   11. 以下の属性マッピングを入力します。
       
      | フィールド             | 値         |
      |-----------------------|-------------|
      | 基本情報             | プライマリメール |
      | アプリ属性           | email         |
       
   13. **完了**をクリックします。
   
   14. アプリを有効にするには、**全員に対してOFF**にし、設定を**全員に対してON**に変更します。アクセスは画面の左側のオプションを選択することで、グループや組織ユニットに限定することもできます。
       
</details>

### Azure (Microsoft) SAMLの設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAMLは、Azure Active Directory (AD)またはMicrosoft Entraとも呼ばれることがあります。

<details>
   <summary>  Azureエンタープライズアプリケーションを作成する  </summary>
   
   各組織に対して別々のサインオンURLを持つアプリケーション統合を1つ設定します。
   
   1. Microsoft Entra管理センターにログインします。
   
   2. 左側で**アプリケーション > エンタープライズアプリケーション**に移動します。
   
   3. 上部メニューの**新しいアプリケーション**をクリックします。
   
   4. 上部メニューの**自分のアプリケーションを作成**をクリックします。
   
   5. 名前を入力し、**ギャラリーに見つからない他のアプリケーションを統合する（非ギャラリー）**を選択してから、**作成**をクリックします。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/5577b3ed-56e0-46b9-a9f7-80aa27f9a97a'
           class="image"
           alt="Azure Non-Gallery アプリ"
           style={{width: '60%', display: 'inline'}} />
   
   6. 左側の**ユーザーとグループ**をクリックし、ユーザーを割り当てます。
   
   7. 左側で**シングルサインオン**をクリックします。
   
   8. **SAML**をクリックします。
   
   9. 以下の設定を使用して基本的なSAML構成画面に入力します。
   
      | フィールド                         | 値 |
      |-----------------------------------|-------|
      | 識別子（エンティティID）           | `urn:auth0:ch-production:{organizationid}` |
      | 返信URL（アサーションコンシューマサービスURL） | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サインオンURL                      | `https://console.clickhouse.cloud?connection={organizationid}` |
      | リレー状態                        | 空白 |
      | ログアウトURL                     | 空白 |
   
   11. 以下の属性とクレームを追加（A）または更新（U）します。
   
       | クレーム名                           | フォーマット        | ソース属性 |
       |--------------------------------------|------------------|------------------|
       | (U) ユニークユーザー識別子（名前ID） | メールアドレス | user.mail        |
       | (A) email                            | 基本             | user.mail        |
       | (U) /identity/claims/name            | 除外             | user.mail        |
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b59af49f-4cdc-47f4-99e0-fe4a7ffbceda'
              class="image"
              alt="属性とクレーム"
              style={{width: '60%', display: 'inline'}} />
   
   12. これら2項目を収集し、上記のサポートケース提出に移動してプロセスを完了してください。
     - ログインURL
     - 証明書（Base64）

</details>


## 仕組み {#how-it-works}

### サービスプロバイダー主導のSSO {#service-provider-initiated-sso}

私たちはサービスプロバイダー主導のSSOのみを利用します。これは、ユーザーが`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力してIdPにリダイレクトされることを意味します。すでにIdPを通じて認証を受けているユーザーは、ダイレクトリンクを使用してログインページでメールアドレスを入力せずに組織に自動的にログインできます。

### ユーザーロールの割り当て {#assigning-user-roles}

ユーザーは、IdPアプリケーションに割り当てられ、初めてログインすると、ClickHouse Cloudコンソールに表示されます。少なくとも1人のSSOユーザーが組織内で管理者ロールを割り当てられている必要があります。ソーシャルログインまたは`https://console.clickhouse.cloud?with=email`を使用して、元の認証方法でログインし、SSOロールを更新します。

### 非SSOユーザーの削除 {#removing-non-sso-users}

SSOユーザーが設定され、少なくとも1人に管理者ロールが割り当てられると、管理者は他の方法（例：ソーシャル認証やユーザーID＋パスワード）を使用しているユーザーを削除できます。Google認証は、SSOが設定された後も引き続き機能します。ユーザーID＋パスワードのユーザーは、メールドメインに基づいて自動的にSSOにリダイレクトされますが、`https://console.clickhouse.cloud?with=email`を使用しない限り、リダイレクトされません。

### ユーザー管理 {#managing-users}

ClickHouse Cloudは現在、SSOにSAMLを実装しています。まだSCIMを実装してユーザーを管理していません。すなわち、SSOユーザーはClickHouse Cloud組織にアクセスするためにIdP内でアプリケーションに割り当てられる必要があります。ユーザーは、組織内の**ユーザー**領域に表示されるには、ClickHouse Cloudに一度ログインする必要があります。IdP内でユーザーが削除されると、SSOを使用してClickHouse Cloudにログインできなくなります。ただし、SSOユーザーは管理者が手動でユーザーを削除するまで、組織内に表示され続けます。

### マルチ組織SSO {#multi-org-sso}

ClickHouse Cloudは、各組織に対して別々の接続を提供することによってマルチ組織SSOをサポートしています。各組織にログインするには、ダイレクトリンク（`https://console.clickhouse.cloud?connection={organizationid}`）を使用してください。他の組織にログインする前に、1つの組織からログアウトしてください。

## 追加情報 {#additional-information}

認証に関してはセキュリティが最優先事項です。このため、SSOを実装する際に、知っておくべきいくつかの決定を行いました。

- **サービスプロバイダー主導の認証フローのみを処理します。** ユーザーは`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力してあなたのアイデンティティプロバイダーにリダイレクトされます。ユーザーがURLを覚える必要がないように、ブックマークアプリまたはショートカットを追加する手順を提供しています。

- **IdPを通じてあなたのアプリに割り当てられたすべてのユーザーは、同じメールドメインでなければなりません。** あなたのClickHouseアカウントにアクセスしたいベンダー、契約者、コンサルタントは、従業員と同じドメイン（例: user@domain.com）のメールアドレスを持つ必要があります。

- **SSOアカウントと非SSOアカウントを自動的にリンクしません。** 同じメールアドレスを使用している場合でも、ClickHouseユーザーリストに複数のアカウントが表示されることがあります。
