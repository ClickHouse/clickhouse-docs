---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'ClickHouse のメトリクスを Prometheus にエクスポートする'
keywords: ['prometheus', 'grafana', 'monitoring', 'metrics', 'exporter']
doc_type: 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Prometheus 連携 \{#prometheus-integration\}

この機能により、[Prometheus](https://prometheus.io/) を利用して ClickHouse Cloud サービスを監視できます。Prometheus メトリクスへのアクセスは、[ClickHouse Cloud API](/cloud/manage/api/api-overview) エンドポイント経由で提供されており、Prometheus メトリクスコレクターに安全に接続してメトリクスをエクスポートできます。これらのメトリクスは、Grafana や Datadog などのダッシュボードと連携して可視化できます。

開始するには、[API キーを生成](/cloud/manage/openapi)してください。

## ClickHouse Cloud メトリクスを取得するための Prometheus エンドポイント API \{#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics\}

### API リファレンス \{#api-reference\}

| Method | Path                                                                                                               | Description                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを取得します |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを取得します |

**Request Parameters**

| Name             | Location               | Type               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid (任意)               |
| filtered_metrics | クエリパラメータ | boolean (任意) |

### 認証 \{#authentication\}

Basic 認証には、ClickHouse Cloud の API キーを使用してください。

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

# For all services in $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true

# For a single service only
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```


### 応答例 \{#sample-response\}

```response
# HELP ClickHouse_ServiceInfo Information about service, including cluster status and ClickHouse version
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1

# HELP ClickHouseProfileEvents_Query Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries Count queries with all subqueries
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Count SELECT queries with all subqueries
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen Number of files opened.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek Number of times the 'lseek' function was called.
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840

# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1

# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_SentBytesCompressed_Total Total compressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name

# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_Errors_Total Total errors ingesting data.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_FetchedBytesCompressed_Total Total compressed bytes fetched from the source. If data is uncompressed at the source, this will equal ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### メトリクスラベル \{#metric-labels\}

すべてのメトリクスには次のラベルが付きます:

|Label|Description|
|---|---|
|clickhouse_org|組織 ID|
|clickhouse_service|サービス ID|
|clickhouse_service_name|サービス名|

ClickPipes については、メトリクスに次のラベルも付きます:

| Label | Description |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe 名|
| clickpipe_source | ClickPipe ソース種別|

### 情報メトリクス \{#information-metrics\}

ClickHouse Cloud は、常に値が `1` となる `gauge` 型の特別なメトリクス `ClickHouse_ServiceInfo` を提供します。このメトリクスには、すべての **Metric Labels** に加えて、次のラベルが含まれます。

|Label|Description|
|---|---|
|clickhouse_cluster_status|サービスのステータス。次のいずれかの値になります: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|サービスが実行している ClickHouse サーバーのバージョン|
|scrape|直近のスクレイプのステータスを示します。`full` または `partial` のいずれかになります|
|full|直近のメトリクススクレイプでエラーが発生しなかったことを示します|
|partial|直近のメトリクススクレイプでいくつかのエラーが発生し、`ClickHouse_ServiceInfo` メトリクスのみが返されたことを示します。|

メトリクスを取得するリクエストでは、アイドル状態のサービスは起動されません。サービスが `idle` 状態の場合は、`ClickHouse_ServiceInfo` メトリクスのみが返されます。

ClickPipes については、同様に `ClickPipes_Info` という `gauge` メトリクスがあり、**Metric Labels** に加えて次のラベルが含まれます。

| Label | Description |
| --- | --- |
| clickpipe_state | パイプの現在の状態 |

### Prometheus の設定 \{#configuring-prometheus\}

Prometheus サーバーは、設定された対象から指定された間隔でメトリクスを収集します。以下は、ClickHouse Cloud の Prometheus エンドポイントを利用するための Prometheus サーバーの設定例です。

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "clickhouse"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    scheme: https
    params:
      filtered_metrics: ["true"]
    metrics_path: "/v1/organizations/<ORG_ID>/prometheus"
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
```

`instance` ラベルを正しく設定するには、`honor_labels` 設定パラメータを `true` にする必要があります。さらに、上記の例では `filtered_metrics` が `true` に設定されていますが、これはユーザーの好みに応じて設定してください。


## Grafana との連携 \{#integrating-with-grafana\}

Grafana と連携するには、主に次の 2 通りの方法があります。

- **Metrics Endpoint** – 追加のコンポーネントやインフラストラクチャが不要である点が利点です。この方法は Grafana Cloud 専用で、必要なのは ClickHouse Cloud Prometheus Endpoint の URL と認証情報だけです。
- **Grafana Alloy** - Grafana Alloy は、Grafana Agent の代替となる OpenTelemetry (OTel) Collector のベンダーニュートラルなディストリビューションです。スクレイパーとして利用でき、自前のインフラストラクチャにデプロイ可能で、あらゆる Prometheus Endpoint と互換性があります。

以下では、これらのオプションの使用方法について、ClickHouse Cloud Prometheus Endpoint に特有の詳細に焦点を当てて説明します。

### Grafana Cloud とメトリクスエンドポイント \{#grafana-cloud-with-metrics-endpoint\}

- Grafana Cloud アカウントにログインします
- **Metrics Endpoint** を選択して新しい接続を追加します
- Scrape URL を Prometheus エンドポイントに向けるように設定し、Basic 認証を使用して API キー／シークレットで接続を設定します
- 接続テストを実行し、正常に接続できることを確認します

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafana Metrics Endpoint の構成" border/>

<br />

構成が完了すると、ダッシュボードを設定する際に選択できるメトリクスがドロップダウンに表示されます:

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer のドロップダウン" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer のチャート" border/>

### Grafana Cloud と Alloy \{#grafana-cloud-with-alloy\}

Grafana Cloud を使用している場合、Grafana 内の Alloy メニューに移動し、画面の指示に従うだけで Alloy をインストールできます。

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

これにより、認証トークンを使用して Grafana Cloud エンドポイントにデータを送信するための `prometheus.remote_write` コンポーネントを含むように Alloy が構成されます。ユーザーは、その後、ClickHouse Cloud Prometheus Endpoint 用のスクレイパーを含めるように Alloy の設定（Linux の場合は `/etc/alloy/config.alloy`）を変更するだけでかまいません。

以下は、ClickHouse Cloud Endpoint からメトリクスをスクレイプするための `prometheus.scrape` コンポーネントと、自動的に構成される `prometheus.remote_write` コンポーネントを含む Alloy のサンプル構成です。`basic_auth` 設定コンポーネントには、それぞれユーザー名とパスワードとして Cloud API key の ID とシークレットが含まれている点に注意してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service below
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana API username>"
          password = "<grafana API token>"
    }
  }
}
```

`honor_labels` 設定パラメータは、`instance` ラベルが正しく設定されるように `true` に設定する必要がある点に注意してください。


### Alloy を用いたセルフマネージドの Grafana \{#grafana-self-managed-with-alloy\}

セルフマネージド版 Grafana のユーザーは、Alloy エージェントのインストール手順を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で確認できます。ここでは、ユーザーが Alloy を構成し、Prometheus のメトリクスを目的の送信先に送信するよう既に設定済みであることを前提とします。以下の `prometheus.scrape` コンポーネントにより、Alloy は ClickHouse Cloud のエンドポイントをスクレイプします。スクレイプされたメトリクスは `prometheus.remote_write` が受信することを想定しています。これが存在しない場合は、`forward_to` キーをターゲットの送信先に合わせて調整してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service. Modify to your preferred receiver
}
```

構成が完了したら、Metrics Explorer に ClickHouse 関連のメトリクスが表示されるはずです。

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana Metrics Explorer" border />

<br />

`honor_labels` 構成パラメータは、`instance` ラベルが正しく設定されるように `true` に設定しておく必要があることに注意してください。


## Datadog との連携 \{#integrating-with-datadog\}

Datadog の [Agent](https://docs.datadoghq.com/agent/?tab=Linux) と [OpenMetrics インテグレーション](https://docs.datadoghq.com/integrations/openmetrics/) を使用して、ClickHouse Cloud エンドポイントからメトリクスを収集できます。以下は、この Agent とインテグレーションのためのシンプルなサンプル設定です。ただし、実運用では特に重要なメトリクスのみに絞り込むことを検討してください。下記の包括的な例では、数千ものメトリクスとインスタンスの組み合わせがエクスポートされ、Datadog によってカスタムメトリクスとして扱われます。

```yaml
init_config:

instances:
   - openmetrics_endpoint: 'https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true'
     namespace: 'clickhouse'
     metrics:
         - '^ClickHouse.*'
     username: username
     password: password
```

<br />

<Image img={prometheus_datadog} size="md" alt="Prometheus と Datadog の連携" />
