---
sidebar_label: APIキーの管理
slug: /cloud/manage/openapi
title: APIキーの管理
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';


# APIキーの管理

ClickHouse Cloudは、アカウント及びサービスの管理をプログラム的に行うためのOpenAPIを利用するAPIを提供しています。

:::note
このドキュメントはClickHouse Cloud APIを扱います。データベースAPIエンドポイントについては、[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)をご覧ください。
:::

1. 左側のメニューの**API Keys**タブを使用して、APIキーの作成と管理を行うことができます。

  <img src={image_01} width="50%"/>

2. **API Keys**ページには、最初のAPIキーを作成するためのプロンプトが表示されます。これは以下のようになります。最初のキーが作成された後は、右上隅に表示される`New API Key`ボタンを使用して新しいキーを作成できます。

  <img src={image_02} width="100%"/>
  
3. APIキーを作成するには、キー名、キーの権限、および有効期限を指定し、`Generate API Key`をクリックします。
<br/>
:::note
権限はClickHouse Cloudの[定義済みロール](/cloud/security/cloud-access-management/overview#predefined-roles)に準じています。開発者ロールには読み取り専用の権限があり、管理者ロールには完全な読み取りおよび書き込み権限があります。
:::

  <img src={image_03} width="100%"/>

4. 次の画面には、キーIDとキーシークレットが表示されます。これらの値をコピーし、安全な場所（例えば、金庫）に保存してください。この画面を離れると、値は表示されなくなります。

  <img src={image_04} width="100%"/>

5. ClickHouse Cloud APIは、[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を使用してAPIキーの有効性を確認します。以下は、`curl`を使用してClickHouse Cloud APIにリクエストを送信する方法の例です：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys**ページに戻ると、キー名、キーIDの最後の4文字、権限、ステータス、有効期限、および作成者が表示されます。この画面からキー名、権限、および有効期限を編集することができます。また、この画面からキーを無効にしたり削除したりすることができます。
<br/>
:::note
APIキーを削除することは永久的な操作です。キーを使用しているサービスは、直ちにClickHouse Cloudへのアクセスを失います。
:::

  <img src={image_05} width="100%"/>

## エンドポイント {#endpoints}

[エンドポイントのドキュメントはこちら](/cloud/manage/api/invitations-api-reference.md)です。APIキーとAPIシークレットを使用して、ベースURL `https://api.clickhouse.cloud/v1` を使用してください。
