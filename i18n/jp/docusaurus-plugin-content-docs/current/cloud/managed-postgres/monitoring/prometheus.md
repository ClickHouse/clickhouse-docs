---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'Prometheus エンドポイント'
title: 'Managed Postgres Prometheus エンドポイント'
description: 'Managed Postgres のメトリクスを Prometheus、Grafana、Datadog、または OpenMetrics 対応の任意の collector でスクレイプします'
keywords: ['Managed Postgres', 'Prometheus', 'Grafana', 'Datadog', 'メトリクス', 'OpenMetrics', 'オブザーバビリティ']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Prometheus 連携 \{#prometheus-integration\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-prometheus" />

Managed Postgres は、[ClickHouse Cloud API][cloud-api] で
Prometheus 互換のメトリクスエンドポイントを 2 つ公開しています。

| エンドポイント | パス                                                     | 戻り値                                  |
| ------- | ------------------------------------------------------ | ------------------------------------ |
| 組織      | `/v1/organizations/{orgId}/postgres/prometheus`        | 組織内のすべての Managed Postgres サービスのメトリクス |
| インスタンス  | `/v1/organizations/{orgId}/postgres/{pgId}/prometheus` | 単一のサービスのメトリクス                        |

:::note
組織レベルのエンドポイントは、最大 100 個のサービスのメトリクスを返します。組織内の
Managed Postgres サービスが 100 個を超える場合は、[サポートに
お問い合わせください](https://clickhouse.com/support/program)。
:::

## 認証 \{#authentication\}

このエンドポイントでは、OpenAPI の他の部分と同じ [API キー] を使用します。API キーの作成方法と、
組織 ID およびサービス ID の確認方法については、
[OpenAPI ガイド](/cloud/managed-postgres/openapi) を参照してください。

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret
ORG_ID=myorgid
PG_ID=mypgid
```

## 組織内の全サービスをスクレイピングする \{#scrape-org\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/prometheus"
```

## 単一のサービスをスクレイピングする \{#scrape-instance\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/prometheus"
```

## レスポンス例 \{#sample-response\}

```response
# HELP PostgresServiceInfo Information about PostgreSQL service, including status and version.
# TYPE PostgresServiceInfo gauge
PostgresServiceInfo{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",postgres_status="running",postgres_version="18"} 1

# HELP PostgresServer_ActiveConnections Number of active connections by state.
# TYPE PostgresServer_ActiveConnections gauge
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="active"} 1
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="idle"} 4

# HELP PostgresServer_CacheHitRatio Buffer cache hit ratio: blocks served from cache vs. total blocks accessed (%).
# TYPE PostgresServer_CacheHitRatio gauge
PostgresServer_CacheHitRatio{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres"} 100
```

メトリクスの全一覧と各項目の意味については、
[メトリクスリファレンス](/cloud/managed-postgres/monitoring/metrics)を参照してください。

## Prometheus の設定 \{#configuring-prometheus\}

この設定では、30秒ごとに組織レベルのエンドポイントをスクレイプします。

```yaml
scrape_configs:
  - job_name: "managed-postgres"
    scheme: https
    metrics_path: "/v1/organizations/<ORG_ID>/postgres/prometheus"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
    scrape_interval: 30s
```

`honor_labels: true` を設定し、エンドポイントの `postgres_service` と
`postgres_service_name` ラベルが Prometheus によって上書きされず、保持されるようにします。

単一のサービスをスクレイプするには、`metrics_path` に `/<PG_ID>` を追加します。

## Grafana および Datadog との連携 \{#third-party-integrations\}

このエンドポイントは [ClickHouse Prometheus
エンドポイント](/integrations/prometheus) と同じ形式に従っているため、そこで説明している Grafana Cloud、Grafana
Alloy、Datadog OpenMetrics agent の設定は、ここでもそのまま
適用できます。`metrics_path` は ClickHouse 用ではなく、Managed Postgres の org または
instance のパスを指すようにしてください。

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "API キーの管理"