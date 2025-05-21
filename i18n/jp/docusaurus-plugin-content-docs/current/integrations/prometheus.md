---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'ClickHouse メトリクスを Prometheus にエクスポートする'
keywords: ['prometheus', 'grafana', 'monitoring', 'metrics', 'exporter']
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';



# Prometheus Integration

この機能は、ClickHouse Cloud サービスを監視するために [Prometheus](https://prometheus.io/) と統合することをサポートしています。 Prometheus メトリクスにアクセスするためには、ユーザーが安全に接続し、メトリクスを Prometheus メトリクスコレクタにエクスポートできる [ClickHouse Cloud API](/cloud/manage/api/api-overview) エンドポイントが提供されています。これらのメトリクスは、Grafana や Datadog などのダッシュボードに統合して視覚化することができます。

始めるには、[API キーを生成](/cloud/manage/openapi)してください。

## ClickHouse Cloud メトリクスを取得するための Prometheus エンドポイント API {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### API リファレンス {#api-reference}

| メソッド | パス                                                                                                               | 説明                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを返します |

**リクエストパラメータ**

| 名称             | 場所               | タイプ               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid (オプション)               |
| filtered_metrics | クエリパラメータ | boolean (オプション) |


### 認証 {#authentication}

基本認証のために、ClickHouse Cloud API キーを使用します:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# $ORG_ID内のすべてのサービスのために
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# 単一のサービスのために
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### サンプルレスポンス {#sample-response}

```response

# HELP ClickHouse_ServiceInfo サービスについての情報、クラスタ状態と ClickHouse バージョンを含む

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query 解釈され、実行される可能性のあるクエリの数。解析に失敗したクエリやASTサイズ制限、クォータ制限、同時に実行されているクエリの数の制限により拒否されたクエリは含まれません。ClickHouse自体によって開始された内部クエリが含まれる場合があります。サブクエリはカウントしません。

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries すべてのサブクエリを持つクエリの数

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries すべてのサブクエリを持つSELECTクエリの数

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen オープンされたファイルの数。

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek 'lseek'関数が呼び出された回数。

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840


# HELP ClickPipes_Info 常に1に等しい。ラベル "clickpipe_state" はパイプの現在の状態を含んでいます: Stopped/Provisioning/Running/Paused/Failed

# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1


# HELP ClickPipes_SentEvents_Total ClickHouse に送信されたレコードの合計数

# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250


# HELP ClickPipes_SentBytesCompressed_Total ClickHouse に送信された合計圧縮バイト

# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total ソースから取得された合計非圧縮バイト。

# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_Errors_Total データを取り込む際の合計エラー数。

# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0


# HELP ClickPipes_SentBytes_Total ClickHouse に送信された合計非圧縮バイト。

# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967


# HELP ClickPipes_FetchedBytesCompressed_Total ソースから取得された合計圧縮バイト。データがソースで非圧縮の場合、この値は ClickPipes_FetchedBytes_Total と等しくなります

# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_FetchedEvents_Total ソースから取得されたレコードの合計数。

# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### メトリクスラベル {#metric-labels}

すべてのメトリクスには以下のラベルがあります:

|ラベル|説明|
|---|---|
|clickhouse_org|組織 ID|
|clickhouse_service|サービス ID|
|clickhouse_service_name|サービス名|

ClickPipes のメトリクスには、さらに以下のラベルも含まれます:

| ラベル | 説明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe 名 |
| clickpipe_source | ClickPipe ソースタイプ |

### 情報メトリクス {#information-metrics}

ClickHouse Cloud は、常に `1` の値を持つ `gauge` である特別なメトリクス `ClickHouse_ServiceInfo` を提供します。このメトリクスには、すべての **メトリクスラベル** と以下のラベルが含まれます:

|ラベル|説明|
|---|---|
|clickhouse_cluster_status|サービスの状態。次のいずれかである可能性があります: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|サービスが実行されている ClickHouse サーバーのバージョン|
|scrape|最終スクレイプの状態を示します。`full` または `partial` である可能性があります|
|full|最終メトリクススクレイプ中にエラーが発生しなかったことを示します|
|partial|最終メトリクススクレイプ中に一部エラーが発生し、`ClickHouse_ServiceInfo` メトリクスのみが返されたことを示します|

メトリクスを取得するリクエストは、アイドル状態のサービスを再開することはありません。サービスが `idle` 状態の場合は、`ClickHouse_ServiceInfo` メトリクスのみが返されます。

ClickPipes には、**メトリクスラベル** に加えて以下のラベルを含む似たようなメトリクス `ClickPipes_Info` の `gauge` があります:

| ラベル | 説明 |
| --- | --- |
| clickpipe_state | パイプの現在の状態 |

### Prometheus の設定 {#configuring-prometheus}

Prometheus サーバーは、指定された間隔で構成されたターゲットからメトリクスを収集します。以下は、ClickHouse Cloud Prometheus エンドポイントを使用するための Prometheus サーバーの設定例です:

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

インスタンスラベルを正しく設定するためには、`honor_labels` 構成パラメータを `true` に設定する必要があります。さらに、上記の例では `filtered_metrics` を `true` に設定していますが、ユーザーの好みに応じて構成する必要があります。

## Grafana との統合 {#integrating-with-grafana}

ユーザーは Grafana との統合に二つの主要な方法があります:

- **メトリクスエンドポイント** – このアプローチの利点は、追加のコンポーネントやインフラストラクチャが必要ないことです。このオファリングは Grafana Cloud に限定されており、ClickHouse Cloud Prometheus エンドポイント URL と認証情報だけが必要です。
- **Grafana Alloy** - Grafana Alloy はオープンソースの OpenTelemetry (OTel) コレクタのベンダーニュートラルな配布版で、Grafana エージェントを置き換えます。これはスクレイパーとして使用でき、自分のインフラストラクチャ内に展開可能で、任意の Prometheus エンドポイントと互換性があります。

以下でこれらのオプションの使用法に関する指示を提供し、ClickHouse Cloud Prometheus エンドポイントに特有の詳細に焦点を当てます。

### メトリクスエンドポイントを使用した Grafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloud アカウントにログインします
- **メトリクスエンドポイント** を選択して新しい接続を追加します
- スクレイプ URL を Prometheus エンドポイントにポイントさせ、API キー/シークレットを使用して接続を構成します
- 接続をテストして、接続できることを確認します

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafana Metrics Endpoint を設定する" border/>

<br />

設定後、ダッシュボードを構成するために選択できるメトリクスがドロップダウンに表示されるはずです:

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer ドロップダウン" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer チャート" border/>

### Alloy を使用した Grafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloud を使用している場合、Alloy は Grafana の Alloy メニューに移動し、画面の指示に従うことでインストールできます:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

これにより、認証トークンを使用して Grafana Cloud エンドポイントにデータを送信するための `prometheus.remote_write` コンポーネントを使用して Alloy が構成されます。ユーザーは次に、ClickHouse Cloud Prometheus エンドポイント用のスクレイパーを含むように Alloy 設定 (/etc/alloy/config.alloy for Linux) を変更する必要があります。

以下は、ClickHouse Cloud エンドポイントからメトリクスをスクレイプするための `prometheus.scrape` コンポーネントを持つ Alloy の設定例を示しており、自動的に設定された `prometheus.remote_write` コンポーネントも含まれています。`basic_auth` 設定コンポーネントには、Cloud API キー ID とシークレットがそれぞれユーザー名とパスワードとして含まれています。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリッスンアドレスからメトリクスを収集します。
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
  // メトリクスサービスに転送します
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

インスタンスラベルを正しく設定するためには、`honor_labels` 構成パラメータを `true` に設定する必要があります。

### Alloy を使用した Grafana セルフマネージド {#grafana-self-managed-with-alloy}

Grafana のセルフマネージドユーザーは、Alloy エージェントのインストール手順を [こちら](https://grafana.com/docs/alloy/latest/get-started/install/) で見つけることができます。ユーザーは Alloy を設定して Prometheus メトリクスを希望の宛先に送信することを前提としています。以下の `prometheus.scrape` コンポーネントは、Alloy が ClickHouse Cloud エンドポイントをスクレイプします。`prometheus.remote_write` がスクレイプされたメトリクスを受信することを前提とします。この受信先が存在しない場合は、`forward_to` キーを希望の宛先に調整してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリッスンアドレスからメトリクスを収集します。
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
  // メトリクスサービスに転送します。希望の受信者に変更してください
}
```

設定後、メトリクスエクスプローラで ClickHouse に関連するメトリクスが確認できるはずです:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana メトリクスエクスプローラ" border/>

<br />

インスタンスラベルを正しく設定するためには、`honor_labels` 構成パラメータを `true` に設定する必要があります。

## Datadog との統合 {#integrating-with-datadog}

Datadog の [エージェント](https://docs.datadoghq.com/agent/?tab=Linux) と [OpenMetrics 統合](https://docs.datadoghq.com/integrations/openmetrics/) を使用して、ClickHouse Cloud エンドポイントからメトリクスを収集できます。以下は、このエージェントおよび統合のためのシンプルな設定例です。ただし、最も関心のあるメトリクスのみを選択することをお勧めします。以下のキャッチオールの例では、Datadog がカスタムメトリクスとして扱う多くのメトリクスインスタンスの組み合わせをエクスポートします。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus Datadog 統合" />
