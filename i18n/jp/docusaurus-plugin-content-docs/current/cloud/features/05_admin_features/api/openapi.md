---
'sidebar_label': 'APIキーの管理'
'slug': '/cloud/manage/openapi'
'title': 'APIキーの管理'
'description': 'ClickHouse Cloudは、OpenAPIを利用したAPIを提供しており、アカウントやサービスの側面をプログラムで管理することができます。'
'doc_type': 'guide'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# APIキーの管理

ClickHouse Cloudは、アカウントおよびサービスの側面を自動的に管理するためのAPIをOpenAPIを使用して提供します。

:::note
この文書はClickHouse Cloud APIについて説明しています。データベースのAPIエンドポイントについては、[Cloud Endpoints API](/cloud/get-started/query-endpoints)をご覧ください。
:::

1. 左メニューの**API Keys**タブを使用して、APIキーを作成および管理できます。

  <Image img={image_01} size="sm" alt="API Keys tab" border/>

2. **API Keys**ページには、最初のAPIキーを作成するためのプロンプトが表示されます。最初のキーが作成された後は、右上の`New API Key`ボタンを使用して新しいキーを作成できます。

  <Image img={image_02} size="md" alt="API Keys page" border/>
  
3. APIキーを作成するには、キー名、キーの権限、および有効期限を指定し、`Generate API Key`をクリックします。
<br/>
:::note
権限はClickHouse Cloudの[定義済みロール](/cloud/security/cloud-access-management/overview#console-users-and-roles)に対応しています。開発者ロールは割り当てられたサービスに対して読み取り専用の権限を持ち、管理者ロールは完全な読み取りおよび書き込みの権限を持っています。
:::

  <Image img={image_03} size="md" alt="Create API key form" border/>

4. 次の画面には、キーIDとキーのシークレットが表示されます。これらの値をコピーして、安全な場所（例えば、ボールト）に保管してください。この画面を離れると、これらの値は再表示されません。

  <Image img={image_04} size="md" alt="API key details" border/>

5. ClickHouse Cloud APIでは、APIキーの有効性を確認するために[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を使用します。以下の例は、`curl`を使用してClickHouse Cloud APIにリクエストを送信する際にAPIキーを使用する方法を示しています。

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys**ページに戻ると、キー名、キーIDの最後の4文字、権限、ステータス、有効期限、作成者が表示されます。この画面からキー名、権限、有効期限を編集できます。この画面からキーを無効にしたり削除したりすることもできます。
<br/>
:::note
APIキーを削除することは永久的なアクションです。キーを使用しているサービスは、ClickHouse Cloudへのアクセスを即座に失います。
:::

  <Image img={image_05} size="md" alt="API Keys management page" border/>

## エンドポイント {#endpoints}

エンドポイントの詳細については、[APIリファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger)を参照してください。  
ベースURL `https://api.clickhouse.cloud/v1` とともにAPIキーとAPIシークレットを使用してください。
