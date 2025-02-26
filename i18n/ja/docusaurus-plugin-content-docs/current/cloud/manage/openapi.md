---
sidebar_label: APIキーの管理
slug: /cloud/manage/openapi
title: APIキーの管理
---

ClickHouse Cloudは、アカウントやサービスの側面をプログラムで管理するためのOpenAPIを利用したAPIを提供します。

# APIキーの管理

:::note
このドキュメントはClickHouse Cloud APIについて説明しています。データベースAPIエンドポイントについては、[Cloud Endpoints API](/cloud/security/cloud-endpoints-api.md)を参照してください。
:::

1. 左側のメニューの**API Keys**タブを使用して、APIキーを作成および管理できます。

  ![ClickHouse Cloud APIキーのタブ](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/openapi1.png)

2. **API Keys**ページには、最初のAPIキーを作成するためのプロンプトが表示されます。最初のキーを作成した後は、右上隅に表示される`New API Key`ボタンを使用して新しいキーを作成できます。

  ![初期API画面](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/openapi2.png) 

3. APIキーを作成するには、キー名、キーの権限、および有効期限を指定し、`Generate API Key`をクリックします。
:::note
権限はClickHouse Cloudの[定義済みロール](/cloud/security/cloud-access-management#predefined-roles)に対応しています。開発者ロールは読み取り専用権限を持ち、管理者ロールは完全な読み取りおよび書き込み権限を持っています。
:::

  ![APIキーの作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/openapi3.png)
  
4. 次の画面では、Key IDとKey secretが表示されます。これらの値をコピーして、安全な場所（例：ボールト）に保存してください。この画面を離れると、値は表示されません。

  ![APIキーIDとキーシークレット](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/openapi4.png)

5. ClickHouse Cloud APIは、[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を使用してAPIキーの有効性を確認します。以下は、`curl`を使用してClickHouse Cloud APIにリクエストを送信する際にAPIキーを使用する方法の例です：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys**ページに戻ると、キー名、Key IDの最後の4文字、権限、ステータス、有効期限、作成者が表示されます。この画面からキー名、権限、および有効期限を編集できます。また、この画面からキーを無効にしたり削除したりすることもできます。

:::note
APIキーの削除は永久的なアクションです。キーを使用しているサービスは、ClickHouse Cloudへのアクセスを直ちに失います。
:::

  ![APIキーの管理](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/openapi5.png)

## エンドポイント {#endpoints}

[エンドポイントのドキュメントはこちら](/cloud/manage/api/invitations-api-reference.md)です。API KeyとAPI Secretを使用して、ベースURL`https://api.clickhouse.cloud/v1`にアクセスしてください。
