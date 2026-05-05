---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'OpenAPI'
description: 'OpenAPI を使用して Managed Postgres サービスを管理します'
keywords: ['managed postgres', 'openapi', 'api', 'curl', 'チュートリアル', 'コマンドライン']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres OpenAPI \{#managed-postgres-openapi\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="openapi" />

[ClickHouse OpenAPI](/cloud/manage/cloud-api) を使用すると、ClickHouse サービスと同様に Managed Postgres サービスもプログラムで制御できます。[OpenAPI] にすでに慣れている場合は、[API キー] を取得して [Managed
Postgres API リファレンス][pg-openapi] に直接進んでください。そうでない場合は、このまま読み進めて概要をすばやく確認してください。

## API キー \{#api-keys\}

ClickHouse OpenAPI の使用には認証が必要です。作成方法については [API キー] を参照してください。その後、次のようにBasic認証の認証情報として使用します。

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret

curl -s --user "$KEY_ID:$KEY_SECRET" https://api.clickhouse.cloud/v1/organizations | jq
```

## 組織 ID \{#organization-id\}

次に、組織 ID を取得します。

1. コンソールの左下にある組織名を選択します。
2. **Organization details** を選択します。
3. **Organization ID** の右側にあるコピーアイコンをクリックして、
   クリップボードに直接コピーします。

{/*

  TODO: API の提供開始後、コメントを外して正しい出力例を挿入する。

  これで、次のようにリクエストで使用できます。

  ```bash
  ORG_ID=myorgid

  curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" | jq
  ```

  これで、最初の Postgres API リクエストを実行できました。上記の [list API] では、
  組織内のすべての Postgres サーバーが一覧表示されます。出力は次のようになります。

  ```json
  {
  "result": [
    {
      "id": "c0d0b15d-5e8b-431d-8943-51b6e233e0b1",
      "name": "顧客の組織",
      "createdAt": "2026-03-24T14:21:31Z",
      "privateEndpoints": [],
      "enableCoreDumps": true
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
  }
  ```

  */ }

## CRUD \{#crud\}

それでは、Postgresサービスのライフサイクルを見ていきます。

### 作成 \{#create\}

まず、[create API] を使用して新しいサービスを作成します。リクエストの
JSON ボディには、次のプロパティを含める必要があります。

* `name`: 新しい Postgres サービスの名前
* `provider`: クラウドプロバイダーの名前
* `region`: サービスをデプロイするプロバイダーのネットワーク内の
  区域
* `size`: VM のサイズ
* `storageSize`: VM のストレージサイズ

これらのプロパティに指定可能な値については、[create API] のドキュメントを参照してください。さらに、
デフォルトの 17 ではなく、Postgres 18 を指定しましょう:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118
}'
```

では、このデータを使用して新しいインスタンスを作成します。なお、`content-type` ヘッダーが必要です:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" \
    -d "$create_data" | jq
```

成功すると、新しいインスタンスが作成され、その情報が返されます。
これには接続データも含まれます：

```json
{
  "result": {
    "id": "pg7myrd1j06p3gx4zrm2ze8qz6",
    "name": "my postgres",
    "provider": "aws",
    "region": "us-west-2",
    "postgresVersion": "18",
    "size": "r8gd.large",
    "storageSize": 118,
    "haType": "none",
    "tags": [],
    "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
    "username": "postgres",
    "password": "vV6cfEr2p_-TzkCDrZOx",
    "hostname": "my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com",
    "isPrimary": true,
    "state": "creating"
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

### 取得 \{#read\}

レスポンスの `id` を使用して、サービスを再度取得します。

```bash
PG_ID=pg7myrd1j06p3gx4zrm2ze8qz6
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

出力は作成時に返されるJSONとほぼ同じですが、`state`を
確認してください。`running`に変わったら、サーバーの準備完了です:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq .result.state
```

```json
"running"
```

これで、`connectionString` プロパティを使用して、たとえば
[psql] 経由で接続できます。

```bash
$ psql "$(
    curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq -r .result.connectionString
)"

psql (18.3)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

postgres=# 
```

[psql] を終了するには、`\q` を入力します。

### 更新 \{#update\}

Managed
Postgres サービスのプロパティの子集は、[RFC 7396] JSON Merge Patch を使用する [patch API] で更新できます。複雑なデプロイでは、タグが特に重要になる場合があります。その場合は、リクエストでタグだけを送信してください。

```bash
curl -sX PATCH --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    -d '{"tags": [{"key": "Environment", "value": "production"}]}' \
    | jq .result
```

返されるデータには、次の新しいタグが含まれているはずです：

```json
{
  "id": "$PG_ID",
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118,
  "haType": "none",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    }
  ],
  "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
  "username": "postgres",
  "password": "vV6cfEr2p_-TzkCDrZOx",
  "hostname": "my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com",
  "isPrimary": true,
  "state": "running"
}
```

{/*

  TODO: 実装後に追記。

  OpenAPI には、[patch API] でサポートされていないプロパティを更新するための追加エンドポイントが用意されています。たとえば、[Postgres configuration] を更新するには、[config API] を使用します。

  ```bash
  curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"max_connections": "42"}'
  ```

  出力には、更新後の設定が表示されます。

  ```json
  {"max_connections": "42"}
  ```

  追加の更新 API には、次のものがあります。

  * スーパーユーザーのパスワードをリセット
  * Postgres サービスの名前を変更（ホスト名も変更されます）
  * 次のメジャー Postgres バージョンにアップグレード

  */ }

### 削除 \{#delete\}

Postgres サービスを削除するには、[delete API] を使用します。

:::warning
Postgres サービスを削除すると、サービス自体とそのすべての
データが完全に削除されます。サービスを削除する前に、
必ずバックアップを取得するか、レプリカをプライマリに昇格させてください。
:::

```bash
curl -sX DELETE --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

成功すると、レスポンスにはステータスコード 200 が返されます。例:

```json
{
  "requestId": "ac9bbffa-e370-410c-8bdd-bd24bf3d7f82",
  "status": 200
}
```

[ClickHouse OpenAPI]: /cloud/manage/cloud-api "Cloud API"

[OpenAPI]: https://www.openapis.org "OpenAPI Initiative"

[API keys]: /cloud/manage/openapi "APIキーの管理"

[pg-openapi]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres "ClickHouse Cloud の OpenAPI 仕様: Postgres"

[list API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceGetList "組織の Postgres サービス一覧を取得"

[create API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceCreate "新しい Postgres サービスを作成"

[psql]: https://www.postgresql.org/docs/current/app-psql.html "PostgreSQL ドキュメント: psql — PostgreSQL 対話型端末"

[patch API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServicePatch "PostgreSQL サービスを更新"

[RFC 7396]: https://www.rfc-editor.org/rfc/rfc7396 "RFC 7396: JSON Merge Patch"

[Postgres configuration]: https://www.postgresql.org/docs/18/runtime-config.html "PostgreSQL ドキュメント: サーバー設定"

[config API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceSetConfig "Postgres サービスの設定を更新"

[delete API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceDelete "PostgreSQL サービスを削除"
