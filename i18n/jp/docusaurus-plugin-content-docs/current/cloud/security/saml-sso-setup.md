---
sidebar_label: SAML SSOの設定
slug: /cloud/security/saml-setup
title: SAML SSOの設定
description: ClickHouse CloudでSAML SSOを設定する方法
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge' 


# SAML SSOの設定

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloudは、SAML（Security Assertion Markup Language）を介したシングルサインオン（SSO）をサポートしています。これにより、アイデンティティプロバイダー（IdP）を使用して安全にClickHouse Cloud組織にサインインできます。

現在、サービスプロバイダー主導のSSO、異なる接続を使用した複数の組織、およびジャストインタイムプロビジョニングをサポートしています。クロスドメインアイデンティティ管理（SCIM）や属性マッピングのシステムはまだサポートしていません。

## 事前準備 {#before-you-begin}

IdPで管理者権限とClickHouse Cloud組織内の**管理者**ロールが必要です。IdP内で接続を設定した後、以下の手順で要求された情報を使用して私たちに連絡し、プロセスを完了してください。

SAML接続に加えて、**組織への直接リンクを設定する**ことをお勧めします。これにより、ログインプロセスが簡素化されます。各IdPでの取り扱いは異なりますので、以下のあなたのIdPに対する手順をお読みください。

## IdPの設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary> 組織IDを取得する </summary>
   
   すべてのセットアップには、あなたの組織IDが必要です。組織IDを取得するためには:
   
   1. あなたの[ClickHouse Cloud](https://console.clickhouse.cloud)組織にサインインします。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/0cb69e9e-1506-4eb4-957d-f104d8c15f3a'
           class="image"
           alt="組織ID"
           style={{width: '60%', display: 'inline'}} />
      
   3. 左下隅で、**組織**の下にあるあなたの組織名をクリックします。
   
   4. ポップアップメニューで、**組織の詳細**を選択します。
   
   5. 下記で使用するために**組織ID**をメモしてください。
      
</details>

<details> 
   <summary> SAML統合を設定する </summary>
   
   ClickHouseはサービスプロバイダー主導のSAML接続を使用します。つまり、`https://console.clickhouse.cloud`経由または直接リンクを通じてログインできます。現在、アイデンティティプロバイダー主導の接続はサポートしていません。基本的なSAML設定には以下が含まれます:

   - SSO URLまたはACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URIまたはEntity ID: `urn:auth0:ch-production:{organizationid}` 

   - アプリケーションユーザー名: `email`

   - 属性マッピング: `email = user.email`

   - 組織にアクセスするための直接リンク: `https://console.clickhouse.cloud?connection={organizationid}` 


   特定の設定手順については、以下のあなたの特定のアイデンティティプロバイダーを参照してください。
   
</details>

<details>
   <summary> 接続情報を取得する </summary>

   あなたのアイデンティティプロバイダーのSSO URLとx.509証明書を取得します。この情報を取得する手順については、以下の特定のアイデンティティプロバイダーを参照してください。

</details>


<details>
   <summary> サポートケースを提出する </summary>
   
   1. ClickHouse Cloudコンソールに戻ります。
      
   2. 左側の**ヘルプ**を選択し、その後サポートサブメニューを選択します。
   
   3. **新しいケース**をクリックします。
   
   4. 件名として「SAML SSOの設定」を入力します。
   
   5. 説明に、上記の手順から収集したリンクを貼り付け、チケットに証明書を添付します。
   
   6. この接続を許可すべきドメイン（例: domain.com, domain.aiなど）をお知らせください。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud内で設定を完了し、テストの準備が整ったらお知らせします。

</details>

<details>
   <summary> 設定を完了する </summary>

   1. アイデンティティプロバイダー内でユーザーアクセスを割り当てます。 

   2. `https://console.clickhouse.cloud`または上記の「SAML統合を設定する」で設定した直接リンク経由でClickHouseにログインします。ユーザーは最初に「開発者」ロールを割り当てられますが、これは組織への読み取り専用アクセスを持ちます。

   3. ClickHouse組織からログアウトします。 

   4. 元の認証方法でログインし、新しいSSOアカウントに管理者ロールを割り当てます。
   - メール+パスワードのアカウントの場合は、`https://console.clickhouse.cloud/?with=email`を使用してください。
   - ソーシャルログインの場合は、適切なボタンをクリックしてください（**Googleで続行**または**Microsoftで続行**）

   5. 元の認証方法でログアウトし、再び`https://console.clickhouse.cloud`または上記の「SAML統合を設定する」で設定した直接リンクを通じてログインします。

   6. 非SAMLユーザーを削除し、組織に対してSAMLを強制します。今後のユーザーはアイデンティティプロバイダーを経由して割り当てられます。
   
</details>

### Okta SAMLを設定する {#configure-okta-saml}

OktaでClickHouse組織ごとに2つのアプリ統合を設定します: 1つはSAMLアプリ、もう1つは直接リンクを保持するブックマークです。

<details>
   <summary> 1. アクセス管理のためにグループを作成する </summary>
   
   1. Oktaインスタンスに**管理者**としてログインします。

   2. 左側の**グループ**を選択します。

   3. **グループを追加**をクリックします。

   4. グループの名前と説明を入力します。このグループはSAMLアプリと関連するブックマークアプリのユーザーを一貫して管理するために使用されます。

   5. **保存**をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **人を割り当てる**をクリックして、ClickHouse組織にアクセスをしたいユーザーを割り当てます。

</details>

<details>
   <summary> 2. ユーザーがシームレスにログインできるようにブックマークアプリを作成する </summary>
   
   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**のサブヘッダーを選択します。
   
   2. **アプリカタログをブラウズ**をクリックします。
   
   3. **ブックマークアプリ**を検索して選択します。
   
   4. **統合を追加**をクリックします。
   
   5. アプリのラベルを選択します。
   
   6. URLを`https://console.clickhouse.cloud?connection={organizationid}`として入力します。
   
   7. **割り当て**タブに移動して、上記で作成したグループを追加します。
   
</details>

<details>
   <summary> 3. 接続を有効にするためにSAMLアプリを作成する </summary>
   
   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**のサブヘッダーを選択します。
   
   2. **アプリ統合を作成**をクリックします。
   
   3. SAML 2.0を選択し、次に**次へ**をクリックします。
   
   4. アプリケーションの名前を入力し、**ユーザーにアプリケーションアイコンを表示しない**にチェックを入れてから、**次へ**をクリックします。 
   
   5. 以下の値を使用してSAML設定画面を入力します。
   
      | フィールド                          | 値 |
      |------------------------------------|-------|
      | シングルサインオンURL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)       | `urn:auth0:ch-production:{organizationid}` |
      | デフォルトRelayState              | 空白       |
      | Name ID形式                       | 未指定       |
      | アプリケーションユーザー名       | メール       |
      | アプリケーションユーザー名を更新  | 作成および更新 |
   
   7. 以下の属性ステートメントを入力します。

      | 名前    | 名前形式     | 値         |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. **次へ**をクリックします。
   
   10. フィードバック画面で要求された情報を入力し、**完了**をクリックします。
   
   11. **割り当て**タブに移動し、上記で作成したグループを追加します。
   
   12. 新しいアプリの**サインオン**タブで、**SAML設定手順を表示**ボタンをクリックします。 
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/8d316548-5fb7-4d3a-aad9-5d025c51f158'
              class="image"
              alt="Okta SAML設定手順"
              style={{width: '60%', display: 'inline'}} />
   
   13. 次の3つのアイテムを集め、上記のサポートケースを提出するに移動してプロセスを完了します。
     - アイデンティティプロバイダーシングルサインオンURL
     - アイデンティティプロバイダーissuer
     - X.509証明書
   
</details>

### Google SAMLを設定する {#configure-google-saml}

Googleで各組織ごとに1つのSAMLアプリを設定し、マルチオーガニゼーションSSOを使用している場合はユーザーに直接リンク（`https://console.clickhouse.cloud?connection={organizationId}`）をブックマークさせる必要があります。

<details>
   <summary> Google Webアプリを作成する </summary>
   
   1. Google管理コンソール(admin.google.com)に移動します。

   <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b931bd12-2fdf-4e25-b0b5-1170bbd20760'
        class="image"
        alt="Google SAMLアプリ"
        style={{width: '60%', display: 'inline'}} />

   2. 左側の**アプリ**をクリックし、次に**Webおよびモバイルアプリ**を選択します。
   
   3. 上部メニューから**アプリを追加**をクリックし、次に**カスタムSAMLアプリを追加**を選択します。
   
   4. アプリの名前を入力し、**続行**をクリックします。
   
   5. 次の2つのアイテムを収集し、上記のサポートケースを提出するに移動して私たちに情報を送信してください。注意：このデータをコピーする前にセットアップを完了した場合は、アプリのホーム画面から**メタデータをダウンロード**をクリックしてX.509証明書を取得してください。
     - SSO URL
     - X.509証明書
   
   7. ACS URLとEntity IDを以下に入力します。
   
      | フィールド     | 値 |
      |---------------|-------|
      | ACS URL       | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID     | `urn:auth0:ch-production:{organizationid}` |
   
   8. **署名付きレスポンス**のチェックボックスをオンにします。
   
   9. Name ID形式に**EMAIL**を選択し、Name IDは**基本情報 > プライマリメール**のままにします。
   
   10. **続行**をクリックします。
   
   11. 以下の属性マッピングを入力します。
       
      | フィールド          | 値         |
      |--------------------|-------------|
      | 基本情報          | プライマリメール |
      | アプリ属性        | email       |
       
   13. **完了**をクリックします。
   
   14. アプリを有効にするには、皆のために**オフ**から**オン**に設定を変更します。アクセスは左側の画面のオプションを選択することでグループまたは組織単位に制限することもできます。
       
</details>

### Azure (Microsoft) SAMLを設定する {#configure-azure-microsoft-saml}

Azure（Microsoft）SAMLは、Azure Active Directory（AD）やMicrosoft Entraとも呼ばれることがあります。

<details>
   <summary> Azureエンタープライズアプリケーションを作成する </summary>
   
   各組織に対して別のサインオンURLを持つアプリケーション統合を1つ設定します。
   
   1. Microsoft Entra管理センターにログインします。
   
   2. 左側の**アプリケーション > エンタープライズ**アプリケーションに移動します。
   
   3. 上部メニューで**新しいアプリケーション**をクリックします。
   
   4. 上部メニューで**独自のアプリケーションを作成**をクリックします。
   
   5. 名前を入力し、**ギャラリーに見つからない他のアプリケーションを統合する（非ギャラリー）**を選択してから、**作成**をクリックします。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/5577b3ed-56e0-46b9-a9f7-80aa27f9a97a'
           class="image"
           alt="Azure非ギャラリーアプリ"
           style={{width: '60%', display: 'inline'}} />
   
   6. 左側の**ユーザーとグループ**をクリックし、ユーザーを割り当てます。
   
   7. 左側の**シングルサインオン**をクリックします。
   
   8. **SAML**をクリックします。
   
   9. 基本的なSAML構成画面を入力するために次の設定を使用します。
   
      | フィールド                     | 値 |
      |-------------------------------|-------|
      | 識別子（Entity ID）           | `urn:auth0:ch-production:{organizationid}` |
      | 応答URL（アサーション消費サービスURL） | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サインインURL                  | `https://console.clickhouse.cloud?connection={organizationid}` |
      | Relay State                   | 空白 |
      | ログアウトURL                 | 空白 |
   
   11. 属性とクレームの下に以下を追加（A）または更新（U）します。
   
       | クレーム名                          | 形式        | ソース属性 |
       |-------------------------------------|-------------|------------|
       | (U) 一意のユーザー識別子（Name ID） | メールアドレス | user.mail  |
       | (A) email                            | 基本         | user.mail  |
       | (U) /identity/claims/name            | 除外         | user.mail  |
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b59af49f-4cdc-47f4-99e0-fe4a7ffbceda'
              class="image"
              alt="属性とクレーム"
              style={{width: '60%', display: 'inline'}} />
   
   12. 上記のサポートケースを提出するに移動してプロセスを完了しますために次の2つのアイテムを収集してください:
     - ログインURL
     - 証明書（Base64）

</details>

## 動作の仕組み {#how-it-works}

### サービスプロバイダー主導のSSO {#service-provider-initiated-sso}

私たちはサービスプロバイダー主導のSSOのみを利用します。ユーザーは`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力することでIdPにリダイレクトされ、認証を受けます。すでにあなたのIdPを通じて認証されたユーザーは、ログインページでメールアドレスを入力せずに直接リンクを使用して組織に自動的にログインできます。

### ユーザーロールの割り当て {#assigning-user-roles}

ユーザーはIdPアプリケーションに割り当てられ、最初にログインするとClickHouse Cloudコンソールに表示されます。少なくとも1人のSSOユーザーが組織内で管理者ロールを割り当てられている必要があります。ソーシャルログインまたは`https://console.clickhouse.cloud?with=email`を使用して元の認証方法でログインし、SSOロールを更新します。

### 非SSOユーザーの削除 {#removing-non-sso-users}

SSOユーザーを設定し、少なくとも1人のユーザーに管理者ロールが割り当てられたら、管理者は他の方法（例: ソーシャル認証またはユーザーID + パスワード）を使用しているユーザーを削除できます。Google認証は、SSOが設定された後も引き続き機能します。ユーザーID + パスワードのユーザーは、`https://console.clickhouse.cloud?with=email`を使用しない限り、メールドメインに基づいて自動的にSSOにリダイレクトされます。

### ユーザー管理 {#managing-users}

ClickHouse Cloudは現在、SSOのためにSAMLを実装しています。ユーザーを管理するためにSCIMはまだ実装していません。つまり、SSOユーザーはClickHouse Cloud組織にアクセスするためにあなたのIdPでアプリケーションに割り当てられなければなりません。ユーザーがClickHouse Cloudに現れるには、1回ログインする必要があります。あなたのIdPでユーザーが削除されると、そのユーザーはSSOを使用してClickHouse Cloudにログインできなくなります。しかし、管理者が手動でユーザーを削除するまで、SSOユーザーは組織内に表示され続けます。

### マルチオーガニゼーションSSO {#multi-org-sso}

ClickHouse Cloudは、各組織に対して別の接続を提供することにより、マルチオーガニゼーションSSOをサポートしています。各組織にログインするには、直接リンク（`https://console.clickhouse.cloud?connection={organizationid}`）を使用します。他の組織にログインする前に、1つの組織からログアウトしていることを確認してください。

## 追加情報 {#additional-information}

セキュリティは認証に関して私たちの最優先事項です。このため、SSOを実装する際にいくつかの重要な決定を行いましたので、知っておいていただきたい点があります。

- **サービスプロバイダー主導の認証フローのみを処理します。** ユーザーは`https://console.clickhouse.cloud`に移動し、メールアドレスを入力することでアイデンティティプロバイダーにリダイレクトされる必要があります。ユーザーがURLを覚える必要がないように、ブックマークアプリケーションやショートカットを追加するための手順を提供しています。

- **IdPを通じてアプリに割り当てられたすべてのユーザーは同じメールドメインを持つ必要があります。** ClickHouseアカウントへのアクセスを希望するベンダー、契約者、コンサルタントは、従業員と同じドメイン（例: user@domain.com）のメールアドレスを持っている必要があります。

- **SSOアカウントと非SSOアカウントを自動的にリンクすることはありません。** 同じメールアドレスを使用しているにもかかわらず、ClickHouseのユーザーリストに複数のアカウントが表示されることがあります。
