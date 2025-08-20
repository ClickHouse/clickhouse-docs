---
sidebar_label: 'Managing API Keys'
slug: '/cloud/manage/openapi'
title: 'Managing API Keys'
description: 'ClickHouse Cloud provides an API utilizing OpenAPI that allows you
  to programmatically manage your account and aspects of your services.'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# APIキーの管理

ClickHouse Cloudは、アカウントやサービスの側面をプログラム的に管理するためのAPIを提供しており、OpenAPIを利用しています。

:::note
このドキュメントはClickHouse Cloud APIについて説明します。データベースAPIエンドポイントについては、[Cloud Endpoints API](/cloud/get-started/query-endpoints.md)をご覧ください。
:::

1. 左メニューの**API Keys**タブを使用して、APIキーを作成および管理できます。

  <Image img={image_01} size="sm" alt="API Keys tab" border/>

2. **API Keys**ページでは、最初のAPIキーを作成するためのプロンプトが最初に表示されます。最初のキーが作成された後は、右上の`New API Key`ボタンを使用して新しいキーを作成できます。

  <Image img={image_02} size="md" alt="API Keys page" border/>
  
3. APIキーを作成するには、キー名、キーの権限、有効期限を指定し、`Generate API Key`をクリックします。
<br/>
:::note
権限は、ClickHouse Cloudの[定義済みロール](/cloud/security/cloud-access-management/overview#console-users-and-roles)に準拠しています。開発者ロールは、割り当てられたサービスに対して読み取り専用の権限を持ち、管理者ロールは完全な読み書き権限を持ちます。
:::

  <Image img={image_03} size="md" alt="Create API key form" border/>

4. 次の画面には、Key IDとKey secretが表示されます。これらの値をコピーして、安全な場所に保存してください（たとえば、ボールトなど）。この画面から離れると、値は再表示されません。

  <Image img={image_04} size="md" alt="API key details" border/>

5. ClickHouse Cloud APIは、[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を使用してAPIキーの有効性を確認します。以下は、`curl`を使用してClickHouse Cloud APIにリクエストを送信する方法の例です：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys**ページに戻ると、キー名、Key IDの最後の4文字、権限、ステータス、有効期限、作成者が表示されます。この画面からキー名、権限、有効期限を編集することができます。また、ここからキーを無効にしたり削除したりすることも可能です。
<br/>
:::note
APIキーを削除することは、永久的なアクションです。このキーを使用しているサービスは、ClickHouse Cloudへのアクセスを直ちに失います。
:::

  <Image img={image_05} size="md" alt="API Keys management page" border/>

## エンドポイント {#endpoints}

エンドポイントの詳細については、[APIリファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger)をご覧ください。
APIキーとAPIシークレットを使って、ベースURL `https://api.clickhouse.cloud/v1`にアクセスしてください。
