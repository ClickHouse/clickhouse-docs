---
sidebar_label: 'SAML SSOセットアップ'
slug: '/cloud/security/saml-setup'
title: 'SAML SSOセットアップ'
description: 'ClickHouse CloudでSAML SSOを設定する方法'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSOセットアップ

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloudは、セキュリティアサーションマークアップ言語 (SAML) を介したシングルサインオン (SSO) をサポートしています。これにより、アイデンティティプロバイダー (IdP) で認証することによって、ClickHouse Cloudの組織に安全にサインインできます。

現在、サービスプロバイダーが開始するSSO、別々の接続を使用する複数の組織、およびジャストインタイムプロビジョニングをサポートしています。クロスドメインID管理システム (SCIM) や属性マッピングのシステムはまだサポートしていません。

## 始める前に {#before-you-begin}

IdPでの管理者権限とClickHouse Cloud組織での**管理者**ロールが必要です。IdP内で接続を設定した後、以下の手順で要求された情報を添えてお問い合わせください。プロセスを完了します。

SAML接続に加えて、**組織への直接リンク**を設定することをお勧めします。これにより、ログインプロセスが簡素化されます。各IdPでの取り扱いは異なりますので、あなたのIdPの設定方法を続けて読んでください。

## IdPの構成方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織IDを取得する  </summary>

   すべてのセットアップには、あなたの組織IDが必要です。組織IDを取得するには:

   1. [ClickHouse Cloud](https://console.clickhouse.cloud)の組織にサインインします。

      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/0cb69e9e-1506-4eb4-957d-f104d8c15f3a'
           class="image"
           alt="組織ID"
           style={{width: '60%', display: 'inline'}} />

   3. 左下隅で、**組織**の下の組織名をクリックします。

   4. ポップアップメニューで、**組織の詳細**を選択します。

   5. 下記で使用するために、あなたの**組織ID**をメモしてください。

</details>

<details>
   <summary>  SAML統合を構成する  </summary>

   ClickHouseはサービスプロバイダー起動のSAML接続を使用します。つまり、https://console.clickhouse.cloud または直接リンクを介してログインできます。現在、アイデンティティプロバイダーが開始する接続はサポートしていません。基本的なSAML構成は以下の通りです：

   - SSO URLまたはACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}`

   - Audience URIまたはEntity ID: `urn:auth0:ch-production:{organizationid}`

   - アプリケーションのユーザー名: `email`

   - 属性マッピング: `email = user.email`

   - 組織にアクセスするための直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}`

   特定の構成手順については、以下に各アイデンティティプロバイダーの情報を参照してください。

</details>

<details>
   <summary>  接続情報を取得する  </summary>

   アイデンティティプロバイダーのSSO URLとx.509証明書を取得してください。この情報を取得する手順については、以下の特定のアイデンティティプロバイダーを参照してください。

</details>


<details>
   <summary>  サポートケースを提出する </summary>

   1. ClickHouse Cloudコンソールに戻ります。

   2. 左側の**ヘルプ**を選択し、次にサポートサブメニューを選択します。

   3. **新しいケース**をクリックします。

   4. 件名に「SAML SSOセットアップ」と入力します。

   5. 説明欄に、上記の指示から取得したリンクを貼り付け、証明書をチケットに添付します。

   6. この接続を許可すべきドメインをお知らせください（例: domain.com, domain.ai など）。

   7. 新しいケースを作成します。

   8. ClickHouse Cloud内でセットアップを完了し、テストの準備が整ったことをお知らせします。

</details>

<details>
   <summary>  セットアップを完了する  </summary>

   1. アイデンティティプロバイダー内でユーザーアクセスを割り当てます。

   2. https://console.clickhouse.cloudまたは上記の「SAML統合を構成する」で構成した直接リンクを介してClickHouseにログインします。ユーザーは最初に「開発者」ロールを割り当てられ、組織への読み取り専用アクセスを持ちます。

   3. ClickHouse組織からログアウトします。

   4. 元の認証方法でログインし、新しいSSOアカウントに管理者ロールを割り当てます。
   - メール + パスワードアカウントの場合は、`https://console.clickhouse.cloud/?with=email`を使用してください。
   - ソーシャルログインの場合は、適切なボタンをクリックしてください (**Googleで続行** または **Microsoftで続行**)

   5. 元の認証方法でログアウトし、再度https://console.clickhouse.cloudまたは上記の「SAML統合を構成する」で構成した直接リンクを介してログインします。

   6. 組織のSAMLを強制するために、非SAMLユーザーを削除します。今後のユーザーはアイデンティティプロバイダーを介して割り当てられます。

</details>

### Okta SAMLの構成 {#configure-okta-saml}

Oktaで各ClickHouse組織に対して2つのアプリ統合を構成します：1つはSAMLアプリ、もう1つは直接リンクを格納するブックマークです。

<details>
   <summary>  1. アクセス管理用のグループを作成する  </summary>

   1. **管理者**としてOktaインスタンスにログインします。

   2. 左側の**グループ**を選択します。

   3. **グループを追加**をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAMLアプリと関連するブックマークアプリの間でユーザーを一貫して管理するために使用されます。

   5. **保存**をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **ユーザーを割り当て**をクリックして、このClickHouse組織にアクセスしたいユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにブックマークアプリを作成する  </summary>

   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。

   2. **アプリカタログをブラウズ**をクリックします。

   3. **ブックマークアプリ**を検索して選択します。

   4. **統合を追加**をクリックします。

   5. アプリのためのラベルを選択します。

   6. URLを`https://console.clickhouse.cloud/?connection={organizationid}`として入力します。

   7. **割り当て**タブに移動し、作成したグループを追加します。

</details>

<details>
   <summary>  3. 接続を有効にするためのSAMLアプリを作成する  </summary>

   1. 左側の**アプリケーション**を選択し、次に**アプリケーション**の見出しを選択します。

   2. **アプリ統合を作成**をクリックします。

   3. SAML 2.0を選択して次に進みます。

   4. アプリケーション名を入力し、**ユーザーにアプリケーションアイコンを表示しない**のチェックボックスをオンにして**次に進む**をクリックします。

   5. 以下の値を使用してSAML設定画面を埋めます。

      | フィールド                          | 値 |
      |------------------------------------|-------|
      | シングルサインオンURL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)       | `urn:auth0:ch-production:{organizationid}` |
      | デフォルトRelayState              | 空白のまま       |
      | Name IDフォーマット               | 未指定       |
      | アプリケーションユーザー名       | Email             |
      | アプリケーションユーザー名の更新 | 作成および更新 |

   7. 以下の属性ステートメントを入力します。

      | 名前    | 名前形式   | 値      |
      |---------|-------------|------------|
      | email   | 基本         | user.email |

   9. **次に進む**をクリックします。

   10. フィードバック画面で要求された情報を入力し、**完了**をクリックします。

   11. **割り当て**タブに移動し、作成したグループを追加します。

   12. 新しいアプリの**サインオン**タブで、**SAMLセットアップ手順を表示**ボタンをクリックします。

         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/8d316548-5fb7-4d3a-aad9-5d025c51f158'
              class="image"
              alt="Okta SAMLセットアップ手順"
              style={{width: '60%', display: 'inline'}} />

   13. これらの3つの項目を集め、上記のサポートケースを提出するに進んでプロセスを完了します。
     - アイデンティティプロバイダーのシングルサインオンURL
     - アイデンティティプロバイダーの発行者
     - X.509証明書

</details>


### Google SAMLの構成 {#configure-google-saml}

Googleで各組織に対して1つのSAMLアプリを構成し、マルチオーガニゼーションSSOを使用する場合はユーザーに直接リンク（`https://console.clickhouse.cloud/?connection={organizationId}`）をブックマークするように指示する必要があります。

<details>
   <summary>  Google Webアプリを作成する  </summary>

   1. Google Adminコンソール(admin.google.com)にアクセスします。

   <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b931bd12-2fdf-4e25-b0b5-1170bbd20760'
        class="image"
        alt="Google SAMLアプリ"
        style={{width: '60%', display: 'inline'}} />

   2. 左側の**アプリ**、次に**ウェブおよびモバイルアプリ**をクリックします。

   3. トップメニューから**アプリを追加**をクリックし、次に**カスタムSAMLアプリを追加**を選択します。

   4. アプリの名前を入力し、**続行**をクリックします。

   5. 以下の2つの項目を集め、上記のサポートケースを提出するに進んで情報を提出してください。注：このデータをコピーする前にセットアップを完了した場合、アプリのホーム画面から**メタデータをダウンロード**をクリックしてX.509証明書を取得します。
     - SSO URL
     - X.509証明書

   7. 以下にACS URLとEntity IDを入力します。

      | フィールド     | 値 |
      |------------------|-------|
      | ACS URL          | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID        | `urn:auth0:ch-production:{organizationid}` |

   8. **署名された応答**のチェックボックスをオンにします。

   9. 名前ID形式を**EMAIL**に選択し、名前IDを**基本情報 > プライマリメール**としてそのままにします。

   10. **続行**をクリックします。

   11. 以下の属性マッピングを入力します。

      | フィールド             | 値         |
      |------------------------|---------------|
      | 基本情報              | プライマリメール |
      | アプリ属性            | email         |

   13. **完了**をクリックします。

   14. アプリを有効にするには、全員に対して**OFF**をクリックし、設定を**ON**に変更します。アクセスは、画面の左側でオプションを選択することでグループまたは組織単位に制限することもできます。

</details>

### Azure (Microsoft) SAMLの構成 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAMLは、Azure Active Directory (AD)またはMicrosoft Entraとも呼ばれることがあります。

<details>
   <summary>  Azureエンタープライズアプリケーションを作成する  </summary>

   各組織に対して、別々のサインオンURLを持つ1つのアプリケーション統合を設定します。

   1. Microsoft Entra管理センターにログインします。

   2. 左側で**アプリケーション > エンタープライズ**アプリケーションに移動します。

   3. トップメニューから**新しいアプリケーション**をクリックします。

   4. トップメニューから**独自のアプリケーションを作成**をクリックします。

   5. 名前を入力し、**ギャラリーに見つからないアプリケーションを統合する (ギャラリー外)**を選択し、**作成**をクリックします。

      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/5577b3ed-56e0-46b9-a9f7-80aa27f9a97a'
           class="image"
           alt="Azure非ギャラリーアプリ"
           style={{width: '60%', display: 'inline'}} />

   6. 左側の**ユーザーとグループ**をクリックしてユーザーを割り当てます。

   7. 左側の**シングルサインオン**をクリックします。

   8. **SAML**をクリックします。

   9. 以下の設定を使用して基本SAML構成画面を埋めます。

      | フィールド                     | 値 |
      |-------------------------------|-------|
      | 識別子 (Entity ID)            | `urn:auth0:ch-production:{organizationid}` |
      | 応答URL (アサーション消費者サービスURL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サインオンURL                 | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | リレー状態                   | 空白     |
      | ログアウトURL                 | 空白     |

   11. 属性とクレームの下に次の項目を追加 (A) または更新 (U) します。

       | クレーム名                           | 形式        | ソース属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 一意のユーザー識別子 (Name ID)   | メールアドレス | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 除外         | user.mail        |

         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b59af49f-4cdc-47f4-99e0-fe4a7ffbceda'
              class="image"
              alt="属性とクレーム"
              style={{width: '60%', display: 'inline'}} />

   12. これらの2つの項目を集め、上記のサポートケースを提出するに進んでプロセスを完了します：
     - ログインURL
     - 証明書 (Base64)

</details>

### Duo SAMLの構成 {#configure-duo-saml}

<details>
   <summary> Duo用の一般的なSAMLサービスプロバイダーを作成する  </summary>

   1. [一般的なSAMLサービスプロバイダー向けのDuoシングルサインオンの手順](https://duo.com/docs/sso-generic)に従ってください。

   2. 以下のブリッジ属性マッピングを使用します：

      |  ブリッジ属性    |  ClickHouse属性  |
      |:-----------------|:------------------|
      | メールアドレス    | email              |

   3.  CloudアプリケーションをDuoで更新するために、以下の値を使用します：

      |  フィールド    |  値                                         |
      |:---------------|:-------------------------------------------|
      | Entity ID      | `urn:auth0:ch-production:{organizationid}` |
      | アサーション消費者サービス (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サービスプロバイダーのログインURL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. これらの2つの項目を集め、上記のサポートケースを提出するに進んでプロセスを完了してください：
      - シングルサインオンURL
      - 証明書

</details>


## 仕組み {#how-it-works}

### サービスプロバイダー起動のSSO {#service-provider-initiated-sso}

私たちはサービスプロバイダー起動のSSOのみを利用します。つまり、ユーザーは`https://console.clickhouse.cloud`にアクセスし、メールアドレスを入力してIdPにリダイレクトされます。すでにIdPで認証されたユーザーは、直接リンクを使用して、ログインページでメールアドレスを入力せずに自動的に組織にログインできます。

### ユーザーロールの割り当て {#assigning-user-roles}

ユーザーは、あなたのIdPアプリケーションに割り当てられ、初めてログインすると、ClickHouse Cloudコンソールに表示されます。少なくとも1人のSSOユーザーが組織内で管理者ロールを割り当てられる必要があります。ソーシャルログインまたは`https://console.clickhouse.cloud/?with=email`を使用して、元の認証方法でログインし、SSOロールを更新します。

### 非SSOユーザーの削除 {#removing-non-sso-users}

SSOユーザーが設定され、少なくとも1人のユーザーに管理者ロールが割り当てられると、管理者は他の方法（例：ソーシャル認証またはユーザーID + パスワード）を使用してユーザーを削除できます。SSOが設定された後もGoogle認証は機能し続けます。ユーザーID + パスワードのユーザーは、メールドメインに基づいて自動的にSSOにリダイレクトされますが、ユーザーが`https://console.clickhouse.cloud/?with=email`を使用しない限り、そうなります。

### ユーザー管理 {#managing-users}

ClickHouse Cloudは現在SSOのためにSAMLを実装しています。SCIMを実装してユーザーを管理していないため、SSOユーザーはClickHouse Cloud組織にアクセスするためにIdP内のアプリケーションに割り当てられる必要があります。ユーザーは**ユーザー**エリアに表示するために、1回ClickHouse Cloudにログインする必要があります。IdPでユーザーが削除されると、そのユーザーはSSOを使用してClickHouse Cloudにログインできなくなります。しかし、管理者がユーザーを手動で削除するまで、そのSSOユーザーは組織に表示され続けます。

### マルチオーガニゼーションSSO {#multi-org-sso}

ClickHouse Cloudは、各組織に対して別々の接続を提供することによって、マルチオーガニゼーションSSOをサポートしています。各組織にログインするために直接リンク（`https://console.clickhouse.cloud/?connection={organizationid}`）を使用します。他の組織にログインする前に、1つの組織からログアウトしてください。

## 追加情報 {#additional-information}

セキュリティは認証に関して私たちの最優先事項です。このため、SSOを実装する際にいくつかの決定を下しましたので、あなたに知っておいていただきたいことがあります。

- **私たちはサービスプロバイダーが起動する認証フローのみを処理します。** ユーザーは`https://console.clickhouse.cloud`にナビゲートし、メールアドレスを入力してアイデンティティプロバイダーにリダイレクトされる必要があります。ユーザーがURLを覚える必要がないように、ブックマークアプリケーションまたはショートカットを追加する手順が提供されています。

- **IdPを介してアプリに割り当てられたすべてのユーザーは、同じメールドメインを持っている必要があります。** ベンダー、コントラクター、またはコンサルタントがClickHouseアカウントにアクセスする必要がある場合、彼らのメールアドレスは従業員と同じドメイン（例: user@domain.com）を持っている必要があります。

- **SSOアカウントと非SSOアカウントは自動的にリンクされません。** 同じメールアドレスを使用していても、ClickHouseのユーザーリストにユーザーの複数のアカウントが表示されることがあります。
