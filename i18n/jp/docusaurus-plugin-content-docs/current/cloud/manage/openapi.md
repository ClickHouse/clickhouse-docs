---
sidebar_label: 'APIキーの管理'
slug: /cloud/manage/openapi
title: 'APIキーの管理'
description: 'ClickHouse Cloudは、アカウントやサービスの側面をプログラム的に管理するためのOpenAPIを利用したAPIを提供します。'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# APIキーの管理

ClickHouse Cloudは、アカウントやサービスの側面をプログラム的に管理するためのOpenAPIを利用したAPIを提供します。

:::note
この文書はClickHouse Cloud APIについて説明します。データベースAPIエンドポイントについては、[Cloud Endpoints API](/cloud/get-started/query-endpoints.md)をご覧ください。
:::

1. 左側のメニューにある **API Keys** タブを使用して、APIキーを作成および管理できます。

  <Image img={image_01} size="sm" alt="API Keys tab" border/>

2. **API Keys** ページには、最初のAPIキーを作成するためのプロンプトが最初に表示されます。最初のキーが作成された後は、右上の `New API Key` ボタンを使用して新しいキーを作成できます。

  <Image img={image_02} size="md" alt="API Keys page" border/>
  
3. APIキーを作成するには、キー名、キーの権限、有効期限を指定し、`Generate API Key`をクリックします。
<br/>
:::note
権限はClickHouse Cloudの[事前定義されたロール](/cloud/security/cloud-access-management/overview#console-users-and-roles)に合致します。開発者ロールには割り当てられたサービスに対する読み取り専用の権限があり、管理者ロールには完全な読み取りおよび書き込み権限があります。
:::

  <Image img={image_03} size="md" alt="Create API key form" border/>

4. 次の画面には、Key IDとKey secretが表示されます。これらの値をコピーして、安全な場所（たとえばボールト）に保存してください。この画面を離れると、値は表示されなくなります。

  <Image img={image_04} size="md" alt="API key details" border/>

5. ClickHouse Cloud APIは、[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を使用してAPIキーの有効性を確認します。以下は、`curl`を使用してClickHouse Cloud APIにリクエストを送信する方法の例です：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys** ページに戻ると、キー名、Key IDの最後の4文字、権限、ステータス、有効期限、作成者が表示されます。ここからは、キー名、権限、有効期限を編集できます。また、ここからキーを無効にしたり削除したりすることもできます。
<br/>
:::note
APIキーの削除は永久的なアクションです。このキーを使用しているサービスはすぐにClickHouse Cloudへのアクセスを失います。
:::

  <Image img={image_05} size="md" alt="API Keys management page" border/>

## エンドポイント {#endpoints}

エンドポイントの詳細については、[APIリファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger)を参照してください。  
APIキーとAPIシークレットをベースURL `https://api.clickhouse.cloud/v1` と共に使用します。
