---
'sidebar_label': 'SAML SSO セットアップ'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO セットアップ'
'description': 'ClickHouse Cloud で SAML SSO を設定する方法'
'doc_type': 'guide'
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

ClickHouse Cloud は、セキュリティ アサーション マークアップ言語 (SAML) を介したシングル サインオン (SSO) をサポートしています。これにより、アイデンティティ プロバイダー (IdP) で認証することにより、ClickHouse Cloud 組織に安全にサインインできます。

現在、サービス プロバイダーが開始する SSO、別の接続を使用する複数の組織、およびジャスト イン タイム プロビジョニングをサポートしています。クロス ドメイン アイデンティティ管理 (SCIM) や属性マッピングのシステムはまだサポートしていません。

## 開始する前に {#before-you-begin}

IdP において管理者権限、ClickHouse Cloud 組織において **Admin** ロールが必要です。IdP 内で接続を設定した後、以下の手順で要求された情報を持って当社にご連絡ください。

ログインプロセスを簡素化するために、SAML接続に加えて **組織への直接リンク** を設定することをお勧めします。各 IdP によってこの処理は異なります。以下に、IdP に対する具体的な手順を示します。

## IdP の設定方法 {#how-to-configure-your-idp}

### 手順 {#steps}

<details>
   <summary>  組織 ID を取得する  </summary>
   
   すべてのセットアップには組織 ID が必要です。組織 ID を取得するには：
   
   1. [ClickHouse Cloud](https://console.clickhouse.cloud) 組織にサインインします。
   
      <Image img={samlOrgId} size="md" alt="Organization ID" force/>
      
   3. 左下隅で、**Organization** の下にある組織名をクリックします。
   
   4. ポップアップメニューで **Organization details** を選択します。
   
   5. 以下で使用するために **Organization ID** をメモします。
      
</details>

<details> 
   <summary>  SAML 統合を設定する  </summary>
   
   ClickHouse はサービス プロバイダーが開始する SAML 接続を使用します。つまり、https://console.clickhouse.cloud または直接リンクを介してログインできます。現在、アイデンティティ プロバイダーが開始する接続はサポートしていません。基本的な SAML 設定には次のものが含まれます：

- SSO URL または ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI または Entity ID: `urn:auth0:ch-production:{organizationid}` 

- アプリケーションユーザー名: `email`

- 属性マッピング: `email = user.email`

- 組織へのアクセス用直接リンク: `https://console.clickhouse.cloud/?connection={organizationid}` 

   特定の設定手順については、以下のアイデンティティ プロバイダーに関する情報を参照してください。
   
</details>

<details>
   <summary>  接続情報を取得する  </summary>

   アイデンティティ プロバイダーの SSO URL と x.509 証明書を取得します。この情報を取得する方法については、以下の特定のアイデンティティ プロバイダーを参照してください。

</details>

<details>
   <summary>  サポートケースを提出する  </summary>
   
   1. ClickHouse Cloud コンソールに戻ります。
      
   2. 左の **Help** を選択し、次に Support サブメニューを選択します。
   
   3. **New case** をクリックします。
   
   4. 件名に「SAML SSO Setup」と入力します。
   
   5. 説明に、上記の手順から収集したリンクを貼り付け、チケットに証明書を添付します。
   
   6. この接続を許可するべきドメインもお知らせください（例: domain.com、domain.ai など）。
   
   7. 新しいケースを作成します。
   
   8. ClickHouse Cloud 内でセットアップを完了し、テストの準備ができたらお知らせします。

</details>

<details>
   <summary>  セットアップを完了する  </summary>

   1. アイデンティティ プロバイダー内でユーザーアクセスを割り当てます。 

   2. https://console.clickhouse.cloud または上記の「SAML 統合の設定」で構成した直接リンクを介して ClickHouse にログインします。ユーザーには最初に「Member」ロールが割り当てられ、組織にログインし、個人設定を更新できます。

   3. ClickHouse 組織からログアウトします。 

   4. 元の認証方法でログインし、新しい SSO アカウントに Admin ロールを割り当てます。
- メール + パスワードのアカウントの場合は、`https://console.clickhouse.cloud/?with=email` を使用してください。
- ソーシャルログインの場合は、適切なボタンをクリックしてください (**Continue with Google** または **Continue with Microsoft**)

:::note
`?with=email` 内の `email` はリテラルのパラメータ値であり、プレースホルダーではありません
:::

   5. 元の認証方法でログアウトし、再度 https://console.clickhouse.cloud または上記の「SAML 統合の設定」で構成した直接リンクを介してログインします。

   6. 非 SAML ユーザーを削除して、組織の SAML を強制します。今後はユーザーがアイデンティティ プロバイダーを通じて割り当てられます。
   
</details>

### Okta SAML の設定 {#configure-okta-saml}

各 ClickHouse 組織のために、Okta に 2 つのアプリ統合を設定します: SAML アプリと直接リンクを保存するブックマーク。

<details>
   <summary>  1. アクセス管理のためにグループを作成する  </summary>
   
   1. **Administrator** として Okta インスタンスにログインします。

   2. 左の **Groups** を選択します。

   3. **Add group** をクリックします。

   4. グループの名前と説明を入力します。このグループは、SAML アプリと関連するブックマークアプリの間でユーザーを一貫性を保つために使用されます。

   5. **Save** をクリックします。

   6. 作成したグループの名前をクリックします。

   7. **Assign people** をクリックして、この ClickHouse 組織にアクセスさせたいユーザーを割り当てます。

</details>

<details>
   <summary>  2. ユーザーがシームレスにログインできるようにブックマークアプリを作成する  </summary>
   
   1. 左の **Applications** を選択し、次に **Applications** のサブヘディングを選択します。
   
   2. **Browse App Catalog** をクリックします。
   
   3. **Bookmark App** を検索して選択します。
   
   4. **Add integration** をクリックします。
   
   5. アプリのラベルを選択します。
   
   6. URL を `https://console.clickhouse.cloud/?connection={organizationid}` として入力します。
   
   7. **Assignments** タブに移動し、上記で作成したグループを追加します。
   
</details>

<details>
   <summary>  3. 接続を有効にするための SAML アプリを作成する  </summary>
   
   1. 左の **Applications** を選択し、次に **Applications** のサブヘディングを選択します。
   
   2. **Create App Integration** をクリックします。
   
   3. SAML 2.0 を選択し、次に Next をクリックします。
   
   4. アプリケーション名を入力し、**Do not display application icon to users** の横のボックスにチェックを入れてから **Next** をクリックします。 
   
   5. SAML 設定画面を以下の値で入力します。
   
      | フィールド                          | 値 |
      |------------------------------------|-------|
      | シングルサインオン URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)        | `urn:auth0:ch-production:{organizationid}` |
      | デフォルト RelayState              | 何も入力しない       |
      | Name ID 形式                       | 指定なし       |
      | アプリケーションユーザー名        | Email             |
      | アプリケーションユーザー名を更新する | 作成して更新 |
   
   7. 以下の Attribute Statement を入力します。

      | 名称    | 名称形式   | 値      |
      |---------|-------------|------------|
      | email   | Basic       | user.email |
   
   9. **Next** をクリックします。
   
   10. フィードバック画面でリクエストされた情報を入力し、**Finish** をクリックします。
   
   11. **Assignments** タブに移動し、上記で作成したグループを追加します。
   
   12. 新しいアプリの **Sign On** タブで **View SAML setup instructions** ボタンをクリックします。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML Setup Instructions" force/>
   
   13. これら 3 つの項目を集め、プロセスを完了するために「サポートケースを提出する」を参照してください。
     - アイデンティティ プロバイダーのシングル サインオン URL
     - アイデンティティ プロバイダーの発行者
     - X.509 証明書
   
</details>

### Google SAML の設定 {#configure-google-saml}

各組織のために Google に 1 つの SAML アプリを設定し、ユーザーにはダイレクトリンク (`https://console.clickhouse.cloud/?connection={organizationId}`) をブックマーク用に提供する必要があります。マルチ組織 SSO を使用している場合は必須です。

<details>
   <summary>  Google Web アプリを作成する  </summary>
   
   1. Google 管理コンソール (admin.google.com) にアクセスします。

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" force/>

   2. 左の **Apps** をクリックし、次に **Web and mobile apps** をクリックします。
   
   3. 上部メニューから **Add app** をクリックし、次に **Add custom SAML app** を選択します。
   
   4. アプリの名前を入力し、**Continue** をクリックします。
   
   5. 次の 2 つの項目を集め、「サポートケースを提出する」のステップに進み、情報を送信します。注意：このデータをコピーする前にセットアップを完了した場合は、アプリのホーム画面から **DOWNLOAD METADATA** をクリックして X.509 証明書を取得します。
     - SSO URL
     - X.509 証明書
   
   7. 以下の ACS URL と Entity ID を入力します。
   
      | フィールド     | 値 |
      |-----------------|-------|
      | ACS URL         | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID      | `urn:auth0:ch-production:{organizationid}` |
   
   8. **Signed response** のチェックボックスをオンにします。
   
   9. 名称 ID フォーマットに **EMAIL** を選択し、名称 ID を **Basic Information > Primary email.** として残します。
   
   10. **Continue** をクリックします。
   
   11. 以下の属性マッピングを入力します：
       
      | フィールド             | 値         |
      |-----------------------|-------------|
      | 基本情報              | プライマリメール |
      | アプリ属性            | email       |
       
   13. **Finish** をクリックします。
   
   14. アプリを有効にするために、すべてのユーザーに対して **OFF** をクリックし、設定を **ON** に変更します。アクセスは、画面左側のオプションを選択することで、グループまたは組織単位に制限することもできます。
       
</details>

### Azure (Microsoft) SAML の設定 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML は Azure Active Directory (AD) または Microsoft Entra とも呼ばれる場合があります。

<details>
   <summary>  Azure エンタープライズ アプリケーションを作成する  </summary>
   
   各組織のために独自のサインオン URL を持つ 1 つのアプリケーション統合を設定します。
   
   1. Microsoft Entra 管理センターにログインします。
   
   2. 左の **Applications > Enterprise** アプリケーションに移動します。
   
   3. 上部メニューの **New application** をクリックします。
   
   4. 上部メニューの **Create your own application** をクリックします。
   
   5. 名前を入力し、**Integrate any other application you don't find in the gallery (Non-gallery)** を選択してから **Create** をクリックします。
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" force/>
   
   6. 左の **Users and groups** をクリックし、ユーザーを割り当てます。
   
   7. 左の **Single sign-on** をクリックします。
   
   8. **SAML** をクリックします。
   
   9. 基本的な SAML 設定画面を以下の設定で入力します。
   
      | フィールド                     | 値 |
      |-------------------------------|-------|
      | Identifier (Entity ID)        | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL                   | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State                   | 空白 |
      | Logout URL                    | 空白 |
   
   11. 属性および請求の下に次の項目を追加 (A) または更新 (U) します：
   
       | クレーム名                             | 形式        | ソース属性 |
       |--------------------------------------|-------------|-------------|
       | (U) Unique User Identifier (Name ID) | メールアドレス | user.mail  |
       | (A)メール                            | Basic       | user.mail |
       | (U) /identity/claims/name            | 省略        | user.mail  |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" force/>
   
   12. プロセスを完了するために、上記で「サポートケースを提出する」で参照した 2 つのアイテムを集めます：
     - ログイン URL
     - 証明書 (Base64)

</details>

### Duo SAML の設定 {#configure-duo-saml}

<details>
   <summary> Duo 用の汎用 SAML サービス プロバイダーを作成する  </summary>
   
   1. [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) の指示に従います。 
   
   2. 次のブリッジ属性マッピングを使用します：

      |  ブリッジ属性  |  ClickHouse 属性  | 
      |:----------------|:------------------|
      | メールアドレス      | email            |
   
   3. Duo のクラウドアプリケーションを更新するために次の値を使用します：

      |  フィールド    |  値                                       |
      |:--------------|:-----------------------------------------|
      | Entity ID     | `urn:auth0:ch-production:{organizationid}` |
      | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | サービスプロバイダーログインURL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. プロセスを完了するために、上記で「サポートケースを提出する」で参照した 2 つのアイテムを集めます：
      - シングル サインオン URL
      - 証明書
   
</details>

## 動作の仕組み {#how-it-works}

### サービス プロバイダーが開始する SSO {#service-provider-initiated-sso}

私たちはサービス プロバイダーが開始する SSO のみを利用します。これは、ユーザーが `https://console.clickhouse.cloud` に移動し、メールアドレスを入力して IdP にリダイレクトされることを意味します。すでに IdP を通じて認証されたユーザーは、ログインページでメールアドレスを入力することなく組織に自動的にログインするために直接リンクを使用できます。

### ユーザーロールの割り当て {#assigning-user-roles}

ユーザーは IdPアプリケーションに割り当てられ、初めてログインすると、ClickHouse Cloud コンソールに表示されます。少なくとも 1 人の SSO ユーザーに Admin ロールを割り当てる必要があり、SSO でログインする追加のユーザーは ["Member"](/cloud/security/cloud-access-management/overview#console-users-and-roles) ロールで作成されるため、デフォルトではサービスにアクセスできず、アクセス権とロールは Admin によって更新する必要があります。

社会的なログイン、または https://console.clickhouse.cloud/?with=email を使用して元の認証方法でログインして SSO ロールを更新します。

### 非 SSO ユーザーの削除 {#removing-non-sso-users}

SSO ユーザーを設定し、少なくとも 1 人のユーザーに Admin ロールを割り当てたら、Admin は他の方法 (例: ソーシャル認証やユーザー ID + パスワード) を使用してユーザーを削除できます。Google 認証は、SSO が設定された後も動作し続けます。ユーザー ID + パスワードのユーザーは、そのメールドメインに基づいて SSO に自動的にリダイレクトされますが、ユーザーが https://console.clickhouse.cloud/?with=email を使用しない限りです。

### ユーザーの管理 {#managing-users}

ClickHouse Cloud は現在、SSO に対して SAML を実装しています。ユーザー管理のために SCIM はまだ実装されていません。これは、SSO ユーザーは ClickHouse Cloud 組織にアクセスするために IdP 内のアプリケーションに割り当てる必要があることを意味します。ユーザーは ClickHouse Cloud に一度ログインする必要があり、組織の **Users** 領域に表示されます。ユーザーが IdP で削除されると、SSO を介して ClickHouse Cloud にログインすることができなくなります。ただし、SSO ユーザーは、管理者が手動でユーザーを削除するまで、組織に表示され続けます。

### マルチ組織 SSO {#multi-org-sso}

ClickHouse Cloud は、各組織に対して別々の接続を提供することによってマルチ組織 SSO をサポートしています。直接リンク (`https://console.clickhouse.cloud/?connection={organizationid}`) を使用して、それぞれの組織にログインします。別の組織にログインする前に、必ず一つの組織からログアウトしてください。

## 追加情報 {#additional-information}

認証に関してはセキュリティが最優先事項です。この理由から、SSO の実装時にいくつかの決定を行いましたので、お知らせします。

- **サービス プロバイダーが開始する認証フローのみを処理します。** ユーザーは `https://console.clickhouse.cloud` に移動し、メール アドレスを入力して IdP にリダイレクトされる必要があります。ブックマーク アプリケーションやショートカットを追加する手順が提供されており、ユーザーは URL を覚えておく必要はありません。

- **IdP 経由でアプリに割り当てられたすべてのユーザーは同じメール ドメインを持っている必要があります。** ベンダーや請負業者、コンサルタントが ClickHouse アカウントにアクセスできるようにするには、従業員と同じドメイン (例: user@domain.com) のメールアドレスを持たなければなりません。

- **SSO アカウントと非 SSO アカウントは自動的にはリンクされません。** 同じメールアドレスを使用している場合でも、ClickHouse ユーザーリストに複数のアカウントが表示される場合があります。
