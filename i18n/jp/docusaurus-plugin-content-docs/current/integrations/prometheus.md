---
slug: '/integrations/prometheus'
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'Export ClickHouse metrics to Prometheus'
keywords:
- 'prometheus'
- 'grafana'
- 'monitoring'
- 'metrics'
- 'exporter'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';



# Prometheus統合

この機能は、[Prometheus](https://prometheus.io/)を統合してClickHouse Cloudサービスを監視することをサポートします。Prometheusメトリクスへのアクセスは、[ClickHouse Cloud API](/cloud/manage/api/api-overview)エンドポイントを介して公開されており、ユーザーは安全に接続してメトリクスをPrometheusメトリクスコレクタにエクスポートできます。これらのメトリクスは、GrafanaやDatadogなどのダッシュボードと統合して視覚化することができます。

始めるには、[APIキーを生成する](/cloud/manage/openapi)必要があります。

## ClickHouse Cloudメトリクスを取得するためのPrometheusエンドポイントAPI {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### APIリファレンス {#api-reference}

| メソッド | パス                                                                                                               | 説明                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します                      |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを返します            |

**リクエストパラメータ**

| 名称             | 所在地               | 型               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid (オプション)               |
| filtered_metrics | クエリパラメータ      | boolean (オプション) |


### 認証 {#authentication}

基本認証のためにClickHouse Cloud APIキーを使用してください：

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
例のリクエスト
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# $ORG_IDのすべてのサービスのために
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# 単一サービスのみに対して
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### サンプルレスポンス {#sample-response}

```response

# HELP ClickHouse_ServiceInfo サービスに関する情報、クラスタの状態とClickHouseのバージョンを含む

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query 解釈され実行される可能性のあるクエリの数。解析に失敗したクエリやASTサイズ制限、クォータ制限、または同時実行クエリの制限により拒否されたクエリは含まれません。ClickHouse自体が起動した内部クエリを含む場合があります。サブクエリはカウントしません。

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries サブクエリを含むクエリの数

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries サブクエリを含むSELECTクエリの数

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen 開かれたファイルの数。

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek 'lseek'関数が呼び出された回数。

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840


# HELP ClickPipes_Info 常に1に等しい。ラベル"clickpipe_state"には、パイプの現在の状態が含まれています：停止/プロビジョニング/実行中/一時停止/失敗

# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1


# HELP ClickPipes_SentEvents_Total ClickHouseに送信されたレコードの総数

# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250


# HELP ClickPipes_SentBytesCompressed_Total ClickHouseに送信された圧縮バイトの総数。

# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total ソースから取得した未圧縮バイトの総数。

# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_Errors_Total データの取り込み時に発生したエラーの総数。

# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0


# HELP ClickPipes_SentBytes_Total ClickHouseに送信された未圧縮バイトの総数。

# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967


# HELP ClickPipes_FetchedBytesCompressed_Total ソースから取得した圧縮バイトの総数。データがソースで未圧縮の場合は、ClickPipes_FetchedBytes_Totalに等しい。

# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_FetchedEvents_Total ソースから取得したレコードの総数。

# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### メトリクスラベル {#metric-labels}

すべてのメトリクスには以下のラベルがあります：

| ラベル | 説明 |
|---|---|
|clickhouse_org|組織ID|
|clickhouse_service|サービスID|
|clickhouse_service_name|サービス名|

ClickPipesの場合、メトリクスには次のラベルも含まれます：

| ラベル | 説明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe名 |
| clickpipe_source | ClickPipeソースタイプ |

### 情報メトリクス {#information-metrics}

ClickHouse Cloudは、常に値が`1`の`gauge`である特別なメトリクス `ClickHouse_ServiceInfo` を提供します。このメトリクスには、すべての**メトリクスラベル**と次のラベルが含まれています：

| ラベル | 説明 |
|---|---|
|clickhouse_cluster_status|サービスの状態。次のいずれかの状態です：[ `awaking` \| `running` \| `degraded` \| `idle` \| `stopped` ]|
|clickhouse_version|サービスが実行されているClickHouseサーバーのバージョン|
|scrape|最後のスクレイプの状態を示します。`full`または`partial`のいずれかです。|
|full|最後のメトリクススクレイプ中にエラーが発生しなかったことを示します。|
|partial|最後のメトリクススクレイプ中にいくつかのエラーが発生し、`ClickHouse_ServiceInfo`メトリクスのみが返されたことを示します。|

メトリクスを取得するリクエストは、一時停止されたサービスを再開することはありません。サービスが`idle`状態の場合、`ClickHouse_ServiceInfo`メトリクスのみが返されます。

ClickPipesの場合、同様の`ClickPipes_Info`メトリクスの`gauge`があります。これは、**メトリクスラベル**に加えて次のラベルを含みます：

| ラベル | 説明 |
| --- | --- |
| clickpipe_state | パイプの現在の状態 |

### Prometheusの設定 {#configuring-prometheus}

Prometheusサーバーは、設定されたターゲットから指定された間隔でメトリクスを収集します。以下は、ClickHouse Cloud Prometheusエンドポイントを使用するためのPrometheusサーバーの設定例です：

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

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。さらに、上記の例では`filtered_metrics`は`true`に設定されていますが、ユーザーの好みに基づいて構成する必要があります。

## Grafanaとの統合 {#integrating-with-grafana}

ユーザーは、Grafanaとの統合に2つの主な方法があります：

- **メトリクスエンドポイント** – このアプローチは、追加のコンポーネントやインフラストラクチャを必要としないという利点があります。この提供はGrafana Cloudに限定され、ClickHouse Cloud PrometheusエンドポイントのURLと認証情報のみが必要です。
- **Grafana Alloy** - Grafana Alloyは、Grafana Agentの代わりとなるベンダー中立のOpenTelemetry (OTel) Collectorの配布版です。これはスクレイパーとして使用でき、自分のインフラストラクチャにデプロイ可能で、任意のPrometheusエンドポイントと互換性があります。

以下では、ClickHouse Cloud Prometheusエンドポイントに特有の詳細に焦点を当てたこれらのオプションの使用に関する手順を提供します。

### メトリクスエンドポイントを使用したGrafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloudアカウントにログインします
- **メトリクスエンドポイント**を選択して新しい接続を追加します
- スクレイプURLをPrometheusエンドポイントを指すように設定し、APIキー/シークレットで接続の基本認証を設定します
- 接続をテストして接続できることを確認します

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafanaメトリクスエンドポイントの設定" border/>

<br />

設定が完了すると、ダッシュボードを設定するために選択できるメトリクスがドロップダウンに表示されるはずです：

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafanaメトリクスエクスプローラードロップダウン" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafanaメトリクスエクスプローラーのチャート" border/>

### Alloyを使用したGrafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloudを使用している場合、GrafanaのAlloyメニューに移動し、画面上の指示に従うことでAlloyをインストールできます：

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

これにより、認証トークンを使用してGrafana Cloudエンドポイントにデータを送信するための`prometheus.remote_write`コンポーネントを持つAlloyが設定されます。その後、ユーザーはClickHouse Cloud Prometheusエンドポイントのスクレイパーを含むようにAlloyの設定（Linuxでは`/etc/alloy/config.alloy`にあります）を修正するだけです。

以下は、ClickHouse Cloudエンドポイントからメトリクスをスクレイプするための`prometheus.scrape`コンポーネントを持つAlloyの設定例を示します。自動的に設定された`prometheus.remote_write`コンポーネントも含まれています。`basic_auth`構成コンポーネントには、Cloud APIキーIDとシークレットがそれぞれユーザー名とパスワードとして含まれていることに注意してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリッスンアドレスからメトリクスを収集します。
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// 例: https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // metrics_serviceに転送します
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana APIのユーザー名>"
          password = "<grafana APIトークン>"
    }
  }
}
```

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。

### Alloyを使用したGrafanaのセルフマネージド {#grafana-self-managed-with-alloy}

Grafanaのセルフマネージドユーザーは、Alloyエージェントのインストール手順を[ここ](https://grafana.com/docs/alloy/latest/get-started/install/)で見つけることができます。ユーザーがAlloyを構成してPrometheusメトリクスを希望の宛先に送信していると仮定します。以下の`prometheus.scrape`コンポーネントは、AlloyがClickHouse Cloudエンドポイントをスクレイプする原因となります。`prometheus.remote_write`がスクレイプされたメトリクスを受け取ることを仮定します。これが存在しない場合は、`forward_to`キーを目的の宛先に調整してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリッスンアドレスからメトリクスを収集します。
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// 例: https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // metrics_serviceに転送します。お好みの受信者に合わせてください
}
```

設定が完了すると、メトリクスエクスプローラーでClickHouse関連のメトリクスが表示されるはずです：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafanaメトリクスエクスプローラー" border/>

<br />

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。

## Datadogとの統合 {#integrating-with-datadog}

Datadogの[エージェント](https://docs.datadoghq.com/agent/?tab=Linux)と[OpenMetrics統合](https://docs.datadoghq.com/integrations/openmetrics/)を使用して、ClickHouse Cloudエンドポイントからメトリクスを収集できます。以下は、このエージェントと統合のシンプルな設定例です。ただし、最も重要なメトリクスだけを選択したい場合があります。以下の包括的な例では、Datadogがカスタムメトリクスと見なす多くのメトリクス・インスタンスの組み合わせがエクスポートされます。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus Datadog統合" />
