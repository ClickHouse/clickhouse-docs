---
sidebar_label: 'API キーの管理'
slug: /cloud/manage/openapi
title: 'API キーの管理'
description: 'ClickHouse Cloud は OpenAPI を利用する API を提供しており、アカウントおよびサービスの各種項目をプログラムから管理できます。'
doc_type: 'guide'
keywords: ['api', 'openapi', 'REST API', 'ドキュメント', 'クラウド管理']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';

# API キーの管理 \{#managing-api-keys\}

ClickHouse Cloud は OpenAPI を利用した API を提供しており、アカウントおよびサービスをプログラムから管理できます。

:::note
このドキュメントでは ClickHouse Cloud API について説明します。データベース API エンドポイントについては、[Cloud Endpoints API](/cloud/get-started/query-endpoints) を参照してください。
:::

1. 左側メニューの **API Keys** タブを使用して、API キーを作成および管理できます。

<Image img={image_01} size="sm" alt="API Keys タブ" border />

2. **API Keys** ページには、最初に以下のように最初の API キーを作成するためのプロンプトが表示されます。最初のキーを作成した後は、右上に表示される `New API Key` ボタンを使用して新しいキーを作成できます。

<Image img={image_02} size="md" alt="API Keys ページ" border />

3. API キーを作成するには、キー名、キーに付与する権限、および有効期限を指定し、`Generate API Key` をクリックします。

<br />

:::note
権限は ClickHouse Cloud の[事前定義ロール](/cloud/security/console-roles)に対応しています。developer ロールは割り当てられたサービスに対する読み取り専用権限を持ち、admin ロールは完全な読み取りおよび書き込み権限を持ちます。
:::

:::tip Query API Endpoints
[Query API Endpoints](/cloud/get-started/query-endpoints) で API キーを使用するには、Organization Role を最低でも `Member` に設定し、Service Role に `Query Endpoints` へのアクセスを付与してください。
:::

<Image img={image_03} size="md" alt="API キー作成フォーム" border />

4. 次の画面に Key ID と Key secret が表示されます。これらの値をコピーし、Vault などの安全な場所に保管してください。この画面を離れた後は値は再表示されません。

<Image img={image_04} size="md" alt="API キー詳細" border />

5. ClickHouse Cloud API は [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) を使用して API キーの有効性を検証します。以下は、`curl` を使用して ClickHouse Cloud API にリクエストを送信する際の API キーの使用例です。

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys** ページに戻ると、キー名、Key ID の末尾 4 文字、権限、ステータス、有効期限、作成者が表示されます。この画面から、キー名、権限、有効期限を編集できます。キーはこの画面から無効化または削除することもできます。

<br />

:::note
API キーの削除は元に戻せない操作です。そのキーを使用しているサービスは、直ちに ClickHouse Cloud へのアクセス権を失います。
:::

<Image img={image_05} size="md" alt="API キー管理ページ" border />

## エンドポイント \{#endpoints\}

エンドポイントの詳細については、[API リファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger) を参照してください。
ベース URL `https://api.clickhouse.cloud/v1` を使用し、API キーと API シークレットを指定してください。
