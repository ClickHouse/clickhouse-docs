---
slug: /use-cases/observability/clickstack/api-reference
title: 'API リファレンス'
pagination_prev: null
pagination_next: null
description: 'ダッシュボード、アラート、ソースをプログラムから管理するための ClickStack API リファレンス'
doc_type: 'guide'
keywords: ['ClickStack', 'オブザーバビリティ', 'API', 'REST API', 'dashboards', 'alerts', 'HyperDX']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack は、ダッシュボード、アラート、およびデータソースをプログラムから管理するための REST API を提供しています。API は **Managed ClickStack**（ClickHouse Cloud）と **ClickStack Open Source** の両方のデプロイメントで利用できますが、両者ではエンドポイントと認証方式が異なります。


## API リファレンスドキュメント \{#api-docs\}

<Tabs>
<TabItem value="managed" label="マネージド ClickStack" default>

マネージド ClickStack の場合、API は **ClickHouse Cloud API** を経由して利用できます。ClickStack のエンドポイントは [Cloud API 仕様](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickStack) に記載されています。

利用可能なエンドポイントは次のとおりです。

| リソース | 操作 |
|---|---|
| **Dashboards** | ダッシュボードの作成、一覧取得、取得、更新、および削除 |
| **Alerts** | アラートの作成、一覧取得、取得、更新、および削除 |
| **Sources** | データソースの一覧取得 |

</TabItem>
<TabItem value="oss" label="オープンソース ClickStack">

ClickStack Open Source の場合、完全な API 仕様は [HyperDX リポジトリ](https://github.com/hyperdxio/hyperdx) で管理されており、インタラクティブに閲覧するか、OpenAPI 仕様としてダウンロードできます。

- [インタラクティブ API リファレンス](https://www.clickhouse.com/docs/clickstack/api-reference)
- [OpenAPI 仕様 (JSON) をダウンロード](https://raw.githubusercontent.com/hyperdxio/hyperdx/refs/heads/main/packages/api/openapi.json)

利用可能なエンドポイントは次のとおりです。

| リソース | 操作 |
|---|---|
| **Dashboards** | ダッシュボードの作成、一覧取得、取得、更新、および削除 |
| **Alerts** | アラートの作成、一覧取得、取得、更新、および削除 |
| **Charts** | 時系列データに対するクエリの実行 (POST のみ) |
| **Sources** | データソースの一覧取得 |
| **Webhooks** | Webhook の一覧取得 |

</TabItem>
</Tabs>

## 認証 \{#authentication\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

Managed ClickStack では、[HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) による認証に **ClickHouse Cloud API key** を使用します。API key の作成と管理については、[Managing API keys](/docs/cloud/manage/openapi) を参照してください。

HTTP Basic Authentication を使用して key ID と secret を指定します。

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>

curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

ClickStack Open Source では、**Personal API Access Key** を使用した **Bearer token** で認証を行います。

API key を取得するには:

1. ClickStack の URL で HyperDX を開きます (例: http://localhost:8080)
2. 必要に応じてアカウントを作成するか、ログインします
3. **Team Settings → API Keys** に移動します
4. **Personal API Access Key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

:::note
これは Team Settings にある **インジェスト API key** とは異なります。インジェスト API key は、OpenTelemetry collector に送信されるテレメトリデータの認証に使用されます。
:::

API サーバーはデフォルトでポート `8000` で動作します (ポート `8080` 上の UI とは別です)。all-in-one Docker イメージを使用する場合は、このポートを明示的にマッピングしてください。

```bash
docker run -p 8080:8080 -p 8000:8000 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`Authorization` ヘッダーにキーを含めます。

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

</TabItem>
</Tabs>

## ベースURLとリクエスト形式 \{#base-url\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

Managed ClickStack API へのすべてのリクエストは、ClickHouse Cloud API に送信されます。

```bash
https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/<resource>
```

**Organization ID** は、ClickHouse Cloud コンソールの **Organization → Organization details** で確認できます。**Service ID** は、サービスの URL またはサービス詳細ページで確認できます。

### 例: ダッシュボード一覧の取得 \{#list-dashboards-managed\}

```bash
curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

### 例: アラートの作成 \{#create-alert-managed\}

```bash
curl -X POST --user $KEY_ID:$KEY_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "dashboardId": "<DASHBOARD_ID>",
    "tileId": "<TILE_ID>",
    "threshold": 100,
    "interval": "1h",
    "source": "tile",
    "thresholdType": "above",
    "channel": {
      "type": "webhook",
      "webhookId": "<WEBHOOK_ID>"
    },
    "name": "Error Spike Alert",
    "message": "Error rate exceeded 100 in the last hour"
  }' \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/alerts
```

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

Open Source ClickStack API へのすべてのリクエストは、ポート `8000` の HyperDX API サーバーに送信されます。

```bash
http://<YOUR_HYPERDX_HOST>:8000/api/v2/<resource>
```

たとえば、デフォルトのローカルデプロイメントの場合は次のとおりです。

```bash
http://localhost:8000/api/v2/dashboards
```

### 例: ダッシュボード一覧の取得 \{#list-dashboards-oss\}

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

### 例: アラートの作成 \{#create-alert-oss\}

```bash
curl -X POST \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboardId": "<DASHBOARD_ID>",
    "tileId": "<TILE_ID>",
    "threshold": 100,
    "interval": "1h",
    "source": "tile",
    "thresholdType": "above",
    "channel": {
      "type": "webhook",
      "webhookId": "<WEBHOOK_ID>"
    },
    "name": "Error Spike Alert",
    "message": "Error rate exceeded 100 in the last hour"
  }' \
  http://localhost:8000/api/v2/alerts
```

### 例: チャート系列データのクエリ \{#query-series-data\}

```bash
curl -X POST \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": 1647014400000,
    "endTime": 1647100800000,
    "granularity": "1h",
    "series": [
      {
        "sourceId": "<SOURCE_ID>",
        "aggFn": "count",
        "where": "SeverityText:error",
        "groupBy": []
      }
    ]
  }' \
  http://localhost:8000/api/v2/charts/series
```

</TabItem>
</Tabs>