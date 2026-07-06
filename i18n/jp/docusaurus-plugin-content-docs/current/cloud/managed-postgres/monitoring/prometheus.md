---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'Prometheus エンドポイント'
title: 'Managed Postgres Prometheus 連携'
description: 'Managed Postgres のメトリクスを Prometheus、Grafana、Datadog、または OpenMetrics 互換の collector にスクレイプ'
keywords: ['managed postgres', 'prometheus', 'grafana', 'datadog', 'メトリクス', 'openmetrics', 'オブザーバビリティ']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import grafanaDashboard from '@site/static/images/managed-postgres/monitoring/grafana-dashboard.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-prometheus-beta" />

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

この設定では、60秒ごとに組織レベルのエンドポイントをスクレイプします。

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
    scrape_interval: 60s
```

エンドポイントはメトリクスを1分ごとに更新します。`60s` より短い間隔で
スクレイプすると、サンプルが重複し、Gauge パネルに階段状のパターンが表示されます。

`honor_labels: true` を設定し、エンドポイントの `postgres_service` と
`postgres_service_name` ラベルが Prometheus によって上書きされず、保持されるようにします。

単一のサービスをスクレイプするには、`metrics_path` に `/<PG_ID>` を追加します。

## 構築済みの Grafana ダッシュボード \{#grafana-dashboard\}

すぐに利用できる Grafana ダッシュボードで、エンドポイントが公開するすべてのメトリクスを可視化できます。これには、並べ替え可能なサービステーブル、CPU とメモリの使用率、閾値アラート付きのディスク使用量、状態別の接続数、トランザクションとロールバック率、タプルアクティビティ、I/O、データベースごとのストレージ、デッドロックが含まれます。

<Image img={grafanaDashboard} alt="Managed Postgres Services の Grafana ダッシュボード" size="md" border />

### ダッシュボードのインポート \{#import-dashboard\}

<VerticalStepper headerLevel="h4">
  #### ダッシュボード JSON をダウンロードする \{#download\}

  <TrackedLink href={'https://clickhouse-docs-assets.s3.us-east-1.amazonaws.com/examples/managed-postgres-grafana-dashboard.json'} download="managed-postgres-grafana-dashboard.json" eventName="docs.managed_postgres_grafana_dashboard.download">ダッシュボード JSON をダウンロード</TrackedLink>。

  #### Grafana でインポート画面を開く \{#open-import\}

  **Dashboards → New → Import** に移動します。JSON ファイルをアップロードするか、その内容を貼り付けます。

  #### Prometheus データソースを選択する \{#pick-datasource\}

  `DS_PROMETHEUS` の入力を求められたら、[前のセクション](#configuring-prometheus)で設定したエンドポイントをスクレイプしている Prometheus データソースを選択します。
</VerticalStepper>

Grafana をプロビジョニングしているデプロイメントでは、JSON を
ダッシュボードのプロビジョニングパスに配置します。Grafana は `${DS_PROMETHEUS}`
参照を、そのインスタンスで利用可能な Prometheus データソースに対応付けます。

### Template 変数 \{#template-variables\}

このダッシュボードでは、3 つの変数を使用できます。

* **データソース** — ダッシュボードの参照先となる Prometheus データソースです。
* **サービス** — `postgres_service_name` に対する複数選択フィルターです。
  デフォルトは *All* です。1 つ以上のサービスを選択すると、すべてのパネルの対象をそのサービスに絞り込めます。
* **スクレイプ間隔** — 非表示の定数で、デフォルトは `60s` です。これは
  Grafana の `$__rate_interval` の計算に使用されます。スクレイプ間隔が異なる場合は、
  JSON 内でこの値を変更してください。

### 1 つのサービスに絞り込んでドリルインする \{#drill-in\}

いくつかのパネルは、**Service** 変数で 1 つの
サービスに絞り込むと、さらに詳細を確認できるように設計されています。たとえば CPU by mode パネルでは、
`user`、`system`、`iowait`、`steal` などの CPU
モードを積み上げて表示するため、スパイクの原因が application code なのか、カーネルの
処理なのか、ディスク待機なのか、あるいはハイパーバイザーの競合なのかを見分けられます。

## Grafana および Datadog との連携 \{#third-party-integrations\}

このエンドポイントは [ClickHouse Prometheus
エンドポイント](/integrations/prometheus) と同じ形式に従っているため、そこで説明している Grafana Cloud、Grafana
Alloy、Datadog OpenMetrics agent の設定は、ここでもそのまま
適用できます。`metrics_path` は ClickHouse 用ではなく、Managed Postgres の org または
instance のパスを指すようにしてください。

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "API キーの管理"