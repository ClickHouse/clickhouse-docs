---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'Managed Postgres OpenAPI'
description: 'OpenAPI を使用して Managed Postgres サービスをプログラムで制御します'
keywords: ['managed postgres', 'openapi', 'api', 'curl', 'チュートリアル', 'コマンドライン', 'クエリインサイト', '低速クエリ']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.openapi-beta" />

[ClickHouse OpenAPI](/cloud/manage/cloud-api) を使用すると、ClickHouse サービスと同様に Managed Postgres サービスもプログラムで制御できます。同じ API では、サービスメトリクスをスクレイピングするための [Prometheus エンドポイント] も公開されています。[OpenAPI] にすでに慣れている場合は、[API キー] を取得して [Managed
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
      "id": "ee2fef9f-b443-8ad0-8c9b-724390cdb826",
      "name": "oltp",
      "provider": "aws",
      "region": "eu-west-2",
      "postgresVersion": "18",
      "size": "r6gd.medium",
      "storageSize": 59,
      "haType": "none",
      "tags": [],
      "isPrimary": true,
      "state": "running",
      "createdAt": "2026-05-25T16:42:16+00:00"
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

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

これらのプロパティに指定可能な値については、[create API] のドキュメントを参照してください。さらに、
デフォルトの 17 ではなく、Postgres 18 を指定しましょう:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large"
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
    "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
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
PG_ID=67b4bc12-8582-45d0-8806-fe9b2e5a54e6
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
  "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
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

OpenAPI には、[patch API] でサポートされていないプロパティを更新するための追加エンドポイントが用意されています。たとえば、[Postgres configuration] を更新するには、[config API] を使用します。

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"pgConfig": {"max_connections": "42"}, "pgBouncerConfig": {}}' | jq
```

出力には、更新後の設定に加えて、変更による影響を説明するメッセージも表示されます：

```json
{
  "result":{
    "pgConfig": {
      "max_connections": "42"
    },
    "pgBouncerConfig": {},
    "message": "The changes in the following parameters require a database restart to take effect: max_connections. You can restart the database by using the restart endpoint."
  },
  "requestId":"fdec06f2-66f7-45b4-9f82-0c051aba20aa",
  "status": 200
}
```

{/*

  TODO: API がリリースされたらコメントを外し、正しい出力例を挿入してください。

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

## 監視 \{#monitoring\}

Prometheus 互換の 2 つのエンドポイントで、Managed Postgres サービスの CPU、メモリ、I/O、接続、
およびトランザクションのメトリクスを公開します。1 つは組織内のすべてのサービスの
メトリクスを返し、もう 1 つは単一のサービスのメトリクスを返します。
設定については [Prometheus エンドポイント] ページを、メトリクスの完全な一覧については
[メトリクス リファレンス] を参照してください。

## クエリインサイト \{#query-insights\}

cloud
コンソールの [Query Insights] タブで利用されているステートメント単位のテレメトリーは、プログラムからも利用できます。2 つのエンドポイントにより、サービス上で最も遅い
クエリパターンが公開されています。一方は影響度順にすべてのパターンを一覧表示し、もう一方は単一のパターンとその最近の実行結果を返します。

### 遅いクエリパターンを一覧表示する \{#list-slow-query-patterns\}

[スローパターン API] は、一定期間内に観測された最も遅いクエリ
パターンの集計メトリクスを返します。この期間の指定は必須です。RFC 3339 のタイムスタンプとして
`from_date` と `to_date` を渡してください。

```bash
FROM=2026-05-25T00:00:00Z
TO=2026-05-26T00:00:00Z

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns?from_date=$FROM&to_date=$TO" \
    | jq
```

結果はデフォルトで、`total_duration` の降順にソートされた、最も負荷の高いパターンから表示されます。`sort_by` を使うと別の項目 (たとえば
`p99_duration`、`call_count`、または `total_wal_bytes`) でソートでき、`sort_order` で順序を反転できます。`db_name`、`db_user`、
`db_operation`、`app` のフィルターで対象を絞り込み、`limit` と
`offset` でページ送りできます。

各結果は 1 つの正規化されたパターンで、リテラルは除去され、
実行時間はマイクロ秒単位で表示されます:

```json
{
  "result": [
    {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "app": "orders-api",
      "callCount": 84213,
      "errorCount": 0,
      "totalDurationUs": 1012384556,
      "avgDurationUs": 12021,
      "maxDurationUs": 482915,
      "p50DurationUs": 9874,
      "p95DurationUs": 28431,
      "p99DurationUs": 41200,
      "totalRows": 842130,
      "totalSharedBlksRead": 19284,
      "totalSharedBlksHit": 48217734,
      "totalCpuTimeUs": 938472113,
      "totalWalBytes": 0
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

`queryId` は正規化されたステートメントの符号付き 64 ビットハッシュなので、
負の値になることがよくあります。先頭の `-` も含めてそのまま渡すことで、
1 つのパターンを取得できます。

### 遅いクエリパターンを取得する \{#get-slow-query-pattern\}

リストレスポンスの `queryId` を [slow pattern API] に渡すと、その
パターンの集計メトリクスと直近の個別の実行結果を取得できます。
パターンの識別に必要な `db_name`、`db_user`、`db_operation` は
必須です:

```bash
QUERY_ID=-4748036479882663975

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns/$QUERY_ID?db_name=sales&db_user=orders_service&db_operation=SELECT" \
    | jq
```

レスポンスには、一覧エンドポイントと同じ集計が
`aggregate` に含まれ、それに加えて `recentExecutions` 配列が含まれます。各実行には、
実行ごとの完全なカウンター — shared および temp block の I/O、CPU の user time と system
time、parallel workers、JIT、WAL — が含まれており、これらは
コンソールの [detail flyout] で内訳が表示されるものと同じカウンターです:

```json
{
  "result": {
    "aggregate": {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "callCount": 84213,
      "avgDurationUs": 12021,
      "p99DurationUs": 41200
    },
    "recentExecutions": [
      {
        "timestamp": "2026-05-25T16:42:09Z",
        "durationUs": 41200,
        "rows": 10,
        "sharedBlksHit": 412,
        "sharedBlksRead": 3,
        "tempBlksWritten": 0,
        "cpuUserTimeUs": 38211,
        "cpuSysTimeUs": 1044,
        "parallelWorkersPlanned": 0,
        "parallelWorkersLaunched": 0,
        "walBytes": 0,
        "serverRole": "primary"
      }
    ]
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

この例では、簡潔さのために両方のオブジェクトを省略しています。API は
[per-execution counters] に記載されている完全なカウンターセットを返します。

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

[Prometheus endpoint]: /cloud/managed-postgres/monitoring/prometheus "Managed Postgres の Prometheus エンドポイント"

[metrics reference]: /cloud/managed-postgres/monitoring/metrics "Managed Postgres メトリクスリファレンス"

[Query Insights]: /cloud/managed-postgres/monitoring/query-insights "Postgres クエリインサイト"

[detail flyout]: /cloud/managed-postgres/monitoring/query-insights#detail "クエリインサイトの詳細フライアウト"

[per-execution counters]: /cloud/managed-postgres/monitoring/query-insights#counters "クエリインサイトの実行ごとのカウンター"

[スローパターン API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternsGetList "Postgres のスロークエリパターンを一覧表示"

[slow pattern API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternGet "直近の実行を含む Postgres のスロークエリパターンを取得"