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


# Prometheus 連携

この機能により、ClickHouse Cloud サービスの監視に [Prometheus](https://prometheus.io/) を利用できます。Prometheus メトリクスへのアクセスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) のエンドポイント経由で提供されており、ユーザーは安全に接続してメトリクスを自身の Prometheus メトリクスコレクターにエクスポートできます。これらのメトリクスは、Grafana や Datadog などのダッシュボードツールと連携して可視化できます。

利用を開始するには、[API キーを生成](/cloud/manage/openapi)してください。



## ClickHouse Cloudメトリクスを取得するためのPrometheusエンドポイントAPI {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### APIリファレンス {#api-reference}

| メソッド | パス                                                                                                                            | 説明                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します              |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]`                     | 組織内のすべてのサービスのメトリクスを返します |

**リクエストパラメータ**

| 名前             | 場所         | 型               |
| ---------------- | ---------------- | ------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid(オプション)    |
| filtered_metrics | クエリパラメータ      | boolean(オプション) |

### 認証 {#authentication}

ClickHouse Cloud APIキーを使用してベーシック認証を行います:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

```


# $ORG_ID のすべてのサービスに対して
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true



# 単一サービスのみの場合

export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### サンプルレスポンス {#sample-response}


```response
# HELP ClickHouse_ServiceInfo サービスに関する情報（クラスタのステータスおよびClickHouseバージョンを含む）
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1
```


# HELP ClickHouseProfileEvents_Query 解釈され、実行される可能性のあるクエリの数。パースに失敗したクエリや、AST サイズ制限、クオータ制限、同時実行クエリ数の制限により拒否されたクエリは含まない。ClickHouse 自身によって開始された内部クエリを含む場合がある。サブクエリはカウントしない。
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6



# HELP ClickHouseProfileEvents_QueriesWithSubqueries すべてのサブクエリを含むクエリの数
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230



# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries サブクエリを含む SELECT クエリのカウント
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224



# HELP ClickHouseProfileEvents_FileOpen オープンしたファイル数。
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157



# HELP ClickHouseProfileEvents_Seek 「lseek」関数が呼び出された回数
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840



# HELP ClickPipes_Info 常に 1。ラベル "clickpipe_state" にはパイプの現在の状態が含まれます: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1



# HELP ClickPipes_SentEvents_Total ClickHouse に送信されたレコードの総数
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250



# HELP ClickPipes_SentBytesCompressed_Total ClickHouseに送信された圧縮済みバイト数の合計。

# TYPE ClickPipes_SentBytesCompressed_Total counter

ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total ソースから取得された非圧縮バイト数の総計。
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes_Errors_Total データ取り込み時のエラー総数。
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0



# HELP ClickPipes_SentBytes_Total ClickHouse に送信された非圧縮バイト数の累計。
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967



# HELP ClickPipes_FetchedBytesCompressed_Total ソースから取得された圧縮済みバイト数の合計。ソース側でデータが非圧縮の場合、この値は ClickPipes_FetchedBytes_Total と同じになります。
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes&#95;FetchedEvents&#95;Total ソースから取得されたレコードの総数。

# TYPE ClickPipes&#95;FetchedEvents&#95;Total counter

ClickPipes&#95;FetchedEvents&#95;Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376

````

### メトリックラベル {#metric-labels}

すべてのメトリックには以下のラベルが含まれます:

|ラベル|説明|
|---|---|
|clickhouse_org|組織ID|
|clickhouse_service|サービスID|
|clickhouse_service_name|サービス名|

ClickPipesの場合、メトリックには以下のラベルも含まれます:

| ラベル | 説明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe名 |
| clickpipe_source | ClickPipeソースタイプ |

### 情報メトリック {#information-metrics}

ClickHouse Cloudは、常に`1`の値を持つ`gauge`型の特別なメトリック`ClickHouse_ServiceInfo`を提供します。このメトリックには、すべての**メトリックラベル**に加えて、以下のラベルが含まれます:

|ラベル|説明|
|---|---|
|clickhouse_cluster_status|サービスのステータス。次のいずれかの値を取ります: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|サービスが実行しているClickHouseサーバーのバージョン|
|scrape|最後のスクレイプのステータスを示します。`full`または`partial`のいずれかです|
|full|最後のメトリックスクレイプ中にエラーがなかったことを示します|
|partial|最後のメトリックスクレイプ中に何らかのエラーが発生し、`ClickHouse_ServiceInfo`メトリックのみが返されたことを示します|

メトリック取得のリクエストは、アイドル状態のサービスを再開しません。サービスが`idle`状態の場合、`ClickHouse_ServiceInfo`メトリックのみが返されます。

ClickPipesの場合、**メトリックラベル**に加えて以下のラベルを含む、同様の`gauge`型メトリック`ClickPipes_Info`があります:

| ラベル | 説明 |
| --- | --- |
| clickpipe_state | パイプの現在の状態 |

### Prometheusの設定 {#configuring-prometheus}

Prometheusサーバーは、指定された間隔で設定されたターゲットからメトリックを収集します。以下は、ClickHouse Cloud Prometheusエンドポイントを使用するためのPrometheusサーバーの設定例です:

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
````

インスタンスラベルが正しく設定されるようにするには、`honor_labels` 設定パラメータを `true` に設定する必要があります。さらに、上記の例では `filtered_metrics` は `true` に設定されていますが、これはユーザーの好みに応じて設定してください。


## Grafanaとの統合 {#integrating-with-grafana}

ユーザーはGrafanaと統合する主な方法が2つあります：

- **Metrics Endpoint** – このアプローチは、追加のコンポーネントやインフラストラクチャを必要としないという利点があります。この方法はGrafana Cloudに限定されており、ClickHouse Cloud Prometheus EndpointのURLと認証情報のみが必要です。
- **Grafana Alloy** - Grafana AlloyはOpenTelemetry（OTel）Collectorのベンダー中立的なディストリビューションで、Grafana Agentの後継です。スクレイパーとして使用でき、独自のインフラストラクチャにデプロイ可能で、任意のPrometheusエンドポイントと互換性があります。

以下では、これらのオプションの使用方法について、ClickHouse Cloud Prometheus Endpointに固有の詳細に焦点を当てて説明します。

### Grafana Cloudとメトリクスエンドポイント {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloudアカウントにログインします
- **Metrics Endpoint**を選択して新しい接続を追加します
- Scrape URLをPrometheusエンドポイントに向けるように設定し、Basic認証を使用してAPIキー/シークレットで接続を構成します
- 接続をテストして、正常に接続できることを確認します

<Image
  img={prometheus_grafana_metrics_endpoint}
  size='md'
  alt='Grafana Metrics Endpointの設定'
  border
/>

<br />

設定が完了すると、ダッシュボードを構成するために選択できるメトリクスがドロップダウンに表示されます：

<Image
  img={prometheus_grafana_dropdown}
  size='md'
  alt='Grafana Metrics Explorerのドロップダウン'
  border
/>

<br />

<Image
  img={prometheus_grafana_chart}
  size='md'
  alt='Grafana Metrics Explorerのチャート'
  border
/>

### Grafana CloudとAlloy {#grafana-cloud-with-alloy}

Grafana Cloudを使用している場合、GrafanaのAlloyメニューに移動し、画面上の指示に従うことでAlloyをインストールできます：

<Image img={prometheus_grafana_alloy} size='md' alt='Grafana Alloy' border />

<br />

これにより、認証トークンを使用してGrafana Cloudエンドポイントにデータを送信するための`prometheus.remote_write`コンポーネントでAlloyが構成されます。その後、ユーザーはAlloy設定ファイル（Linuxでは`/etc/alloy/config.alloy`）を変更して、ClickHouse Cloud Prometheus Endpointのスクレイパーを追加するだけで済みます。

以下は、ClickHouse Cloud Endpointからメトリクスをスクレイピングするための`prometheus.scrape`コンポーネントと、自動的に構成された`prometheus.remote_write`コンポーネントを含むAlloyの設定例です。`basic_auth`設定コンポーネントには、Cloud APIキーIDとシークレットがそれぞれユーザー名とパスワードとして含まれていることに注意してください。

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

インスタンスラベルが適切に設定されるように、`honor_labels`設定パラメータを`true`に設定する必要があることに注意してください。

### セルフマネージドGrafanaとAlloy {#grafana-self-managed-with-alloy}

セルフマネージドGrafanaのユーザーは、Alloyエージェントのインストール手順を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で確認できます。ユーザーは、PrometheusメトリクスをAlloyから目的の宛先に送信するように構成済みであることを前提としています。以下の`prometheus.scrape`コンポーネントにより、AlloyがClickHouse Cloud Endpointをスクレイピングします。`prometheus.remote_write`がスクレイピングされたメトリクスを受信することを前提としています。これが存在しない場合は、`forward_to`キーをターゲット宛先に調整してください。

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
```


forward&#95;to = [prometheus.remote&#95;write.metrics&#95;service.receiver]
// metrics&#95;service に転送します。必要に応じて任意の受信先に変更してください
&#125;

```

設定が完了すると、メトリクスエクスプローラーにClickHouse関連のメトリクスが表示されるようになります：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafanaメトリクスエクスプローラー" border/>

<br />

注：インスタンスラベルを正しく設定するには、`honor_labels`設定パラメータを`true`に設定する必要があります。
```


## Datadogとの統合 {#integrating-with-datadog}

Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux)と[OpenMetrics統合](https://docs.datadoghq.com/integrations/openmetrics/)を使用して、ClickHouse Cloudエンドポイントからメトリクスを収集できます。以下は、このエージェントと統合の簡単な設定例です。ただし、最も重要なメトリクスのみを選択することをお勧めします。以下の包括的な例では、数千のメトリクス・インスタンスの組み合わせがエクスポートされ、Datadogはこれらをカスタムメトリクスとして扱います。

```yaml
init_config:

instances:
  - openmetrics_endpoint: "https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true"
    namespace: "clickhouse"
    metrics:
      - "^ClickHouse.*"
    username: username
    password: password
```

<br />

<Image
  img={prometheus_datadog}
  size='md'
  alt='Prometheus Datadog統合'
/>
