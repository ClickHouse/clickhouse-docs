---
'slug': '/integrations/prometheus'
'sidebar_label': 'Prometheus'
'title': 'Prometheus'
'description': 'ClickHouse メトリクスを Prometheus にエクスポートする'
'keywords':
- 'prometheus'
- 'grafana'
- 'monitoring'
- 'metrics'
- 'exporter'
'doc_type': 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Prometheus統合

この機能は、ClickHouse Cloudサービスを監視するための[Prometheus](https://prometheus.io/)の統合をサポートします。Prometheusメトリクスへのアクセスは、[ClickHouse Cloud API](/cloud/manage/api/api-overview)エンドポイントを介して公開されており、ユーザーは安全に接続し、メトリクスをPrometheusメトリクスコレクタにエクスポートできます。これらのメトリクスは、可視化のためにGrafanaやDatadogなどのダッシュボードと統合できます。

始めるには、[APIキーを生成](/cloud/manage/openapi)してください。

## ClickHouse Cloudメトリクスを取得するためのPrometheusエンドポイントAPI {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### APIリファレンス {#api-reference}

| メソッド | パス                                                                                                               | 説明                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します。                     |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを返します。          |

**リクエストパラメータ**

| 名前             | 場所               | 型               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid（オプション）               |
| filtered_metrics | クエリパラメータ | boolean（オプション） |

### 認証 {#authentication}

基本認証のためにClickHouse Cloud APIキーを使用します：

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

### サンプルレスポンス {#sample-response}

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

### メトリクスラベル {#metric-labels}

すべてのメトリクスには次のラベルがあります：

| ラベル | 説明              |
|---|-------------------|
| clickhouse_org | 組織ID            |
| clickhouse_service | サービスID       |
| clickhouse_service_name | サービス名 |

ClickPipesの場合、メトリクスには次のラベルも含まれます：

| ラベル | 説明              |
| --- | ------------------- |
| clickpipe_id | ClickPipe ID        |
| clickpipe_name | ClickPipe名         |
| clickpipe_source | ClickPipeのソースタイプ |

### 情報メトリクス {#information-metrics}

ClickHouse Cloudは、常に値が`1`である`gauge`タイプの特別なメトリクス`ClickHouse_ServiceInfo`を提供します。このメトリクスには、すべての**メトリクスラベル**と次のラベルが含まれます：

| ラベル | 説明              |
|---|-------------------|
| clickhouse_cluster_status | サービスの状態。以下のいずれかです：[`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version | サービスが実行されているClickHouseサーバーのバージョン |
| scrape | 最後のスクレイプの状態を示します。`full`または`partial`のいずれかです。 |
| full | 最後のメトリクススクレイプ中にエラーがなかったことを示します |
| partial | 最後のメトリクススクレイプ中にいくつかのエラーがあり、`ClickHouse_ServiceInfo`メトリクスのみが返されたことを示します。 |

メトリクスを取得するリクエストは、アイドル状態のサービスを再開することはありません。サービスが`idle`状態にある場合、`ClickHouse_ServiceInfo`メトリクスのみが返されます。

ClickPipesの場合、同様の`ClickPipes_Info`メトリクス`gauge`が、**メトリクスラベル**に加えて次のラベルを含みます：

| ラベル | 説明              |
| --- | ------------------- |
| clickpipe_state | パイプの現在の状態 |

### Prometheusの設定 {#configuring-prometheus}

Prometheusサーバーは、指定された間隔で設定されたターゲットからメトリクスを収集します。以下は、ClickHouse Cloud Prometheusエンドポイントを使用するためのPrometheusサーバーの例の構成です：

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

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。また、上記の例では`filtered_metrics`を`true`に設定していますが、ユーザーの好みに応じて構成する必要があります。

## Grafanaとの統合 {#integrating-with-grafana}

ユーザーには、Grafanaとの統合に主に2つの方法があります：

- **メトリクスエンドポイント** – このアプローチの利点は、追加のコンポーネントやインフラが不要であることです。このオファリングはGrafana Cloudに限定され、ClickHouse Cloud PrometheusエンドポイントURLと認証情報のみが必要です。
- **Grafana Alloy** - Grafana Alloyは、Grafanaエージェントに代わるベンダー中立のOpenTelemetry（OTel）コレクターのディストリビューションです。スクレイパーとして使用でき、自分のインフラにデプロイ可能で、任意のPrometheusエンドポイントと互換性があります。

以下に、ClickHouse Cloud Prometheusエンドポイント特有の詳細に焦点を当てたこれらのオプションの使用に関する指示を提供します。

### メトリクスエンドポイントを使用したGrafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloudアカウントにログインします。
- **メトリクスエンドポイント**を選択して新しい接続を追加します。
- スクレイプURLをPrometheusエンドポイントを指すように設定し、APIキー/シークレットで接続を基本認証で構成します。
- 接続をテストして接続できることを確認します。

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafanaメトリクスエンドポイントの設定" border/>

<br />

設定が完了したら、ダッシュボードを設定するために選択できるメトリクスがドロップダウンに表示されるはずです：

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafanaメトリクスエクスプローラードロップダウン" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafanaメトリクスエクスプローラーのチャート" border/>

### Alloyを使用したGrafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloudを使用している場合、Grafana内のAlloyメニューに移動し、画面の指示に従うことでAlloyをインストールできます。

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

これにより、認証トークンを使用してGrafana Cloudエンドポイントにデータを送信するための`prometheus.remote_write`コンポーネントを含むAlloyが構成されます。ユーザーは、ClickHouse Cloud Prometheusエンドポイント用のスクレイパーを含むようにAlloyの設定（Linuxの場合は`/etc/alloy/config.alloy`にあります）を変更する必要があります。

以下は、ClickHouse Cloudエンドポイントからメトリクスをスクレイプする`prometheus.scrape`コンポーネント、そして自動的に構成された`prometheus.remote_write`コンポーネントを含むAlloyの設定例を示します。`basic_auth`構成コンポーネントには、ユーザー名とパスワードとしてそれぞれCloud APIキーIDとシークレットが含まれています。

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

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。

### Alloyを使用したセルフマネージドGrafana {#grafana-self-managed-with-alloy}

Grafanaのセルフマネージドユーザーは、Alloyエージェントのインストール手順を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で見つけることができます。ユーザーがAlloyを構成してPrometheusメトリクスを目的の宛先に送信していると仮定します。以下の`prometheus.scrape`コンポーネントは、AlloyがClickHouse Cloudエンドポイントをスクレイプする原因となります。`prometheus.remote_write`がスクレイプされたメトリクスを受け取ると仮定しています。この宛先が存在しない場合は、`forward_to key`をターゲットの宛先に調整してください。

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

設定が完了したら、メトリクスエクスプローラーにClickHouse関連のメトリクスが表示されるはずです：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafanaメトリクスエクスプローラー" border/>

<br />

`honor_labels`構成パラメータは、インスタンスラベルが適切に設定されるように`true`に設定する必要があります。

## Datadogとの統合 {#integrating-with-datadog}

Datadogの[エージェント](https://docs.datadoghq.com/agent/?tab=Linux)と[OpenMetrics統合](https://docs.datadoghq.com/integrations/openmetrics/)を使用して、ClickHouse Cloudエンドポイントからメトリクスを収集できます。以下は、このエージェントと統合のためのシンプルな設定の例です。ただし、最も重要なメトリクスのみを選択したい場合があります。以下のキャッチオールの例は、何千ものメトリクスインスタンスの組み合わせをエクスポートし、Datadogはこれをカスタムメトリクスとして扱います。

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
