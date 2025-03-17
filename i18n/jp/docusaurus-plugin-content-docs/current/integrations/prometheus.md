---
slug: /integrations/prometheus
sidebar_label: Prometheus
title: Prometheus
description: ClickHouseのメトリクスをPrometheusにエクスポート
keywords: [prometheus, grafana, monitoring, metrics, exporter]
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';



# Prometheus統合

この機能は、[Prometheus](https://prometheus.io/)と統合してClickHouse Cloudサービスを監視することをサポートします。Prometheusメトリクスへのアクセスは、ユーザーが安全に接続し、メトリクスをPrometheusメトリクスコレクターにエクスポートできる[ClickHouse Cloud API](/cloud/manage/api/api-overview)エンドポイントを介して公開されます。これらのメトリクスは、GrafanaやDatadogなどのダッシュボードと統合して視覚化することができます。

始めるには、[APIキーを生成](/cloud/manage/openapi)します。

## ClickHouse Cloudメトリクスを取得するためのPrometheusエンドポイントAPI {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### APIリファレンス {#api-reference}

| メソッド | パス                                                                                                               | 説明                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを返します |

**リクエストパラメータ**

| 名前             | ロケーション            | 型               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | エンドポイントアドレス | uuid               |
| Service ID       | エンドポイントアドレス | uuid (オプション)               |
| filtered_metrics | クエリパラメータ     | boolean (オプション) |


### 認証 {#authentication}

基本認証には、ClickHouse Cloud APIキーを使用します:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
リクエストの例
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# $ORG_IDのすべてのサービスについて
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# 単一サービスのみ
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### サンプルレスポンス {#sample-response}

```response

# HELP ClickHouse_ServiceInfo サービスに関する情報、クラスタの状態とClickHouseのバージョンを含む

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query 解釈され、潜在的に実行されるクエリの数。解析に失敗したクエリやASTサイズ制限、クォータ制限、同時実行クエリ数の制限により拒否されたクエリは含まれません。ClickHouse自体が開始した内部クエリを含む場合があります。サブクエリはカウントしません。

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries すべてのサブクエリを含むクエリの数

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries すべてのサブクエリを含むSELECTクエリの数

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen 開いたファイルの数。

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek 'lseek'関数が呼び出された回数。

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### メトリクスラベル {#metric-labels}

すべてのメトリクスには、次のラベルがあります:

|ラベル|説明|
|---|---|
|clickhouse_org|組織ID|
|clickhouse_service|サービスID|
|clickhouse_service_name|サービス名|

### 情報メトリクス {#information-metrics}

ClickHouse Cloudは、`ClickHouse_ServiceInfo`という特別なメトリクスを提供します。これは常に値が`1`である`gauge`です。このメトリクスには、すべての**メトリクスラベル**に加えて、次のラベルも含まれています:

|ラベル|説明|
|---|---|
|clickhouse_cluster_status|サービスの状態。次のいずれかの値です: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|サービスが実行されているClickHouseサーバーのバージョン|
|scrape|最後のスクレイプの状態を示します。`full`または`partial`のいずれかです|
|full|最後のメトリクススクレイプ中にエラーがなかったことを示します|
|partial|最後のメトリクススクレイプ中にいくつかのエラーがあり、`ClickHouse_ServiceInfo`メトリクスのみが返されたことを示します|

メトリクスを取得するためのリクエストは、アイドル状態のサービスを再開しません。サービスが`idle`状態の場合、`ClickHouse_ServiceInfo`メトリクスのみが返されます。

### Prometheusの設定 {#configuring-prometheus}

Prometheusサーバーは、設定されたターゲットからメトリクスを指定された間隔で収集します。以下は、ClickHouse Cloud Prometheusエンドポイントを使用するためのPrometheusサーバーの設定例です:

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

`honor_labels`設定パラメータは、インスタンスラベルを正しく設定するために`true`に設定する必要があります。さらに、上記の例では`filtered_metrics`が`true`に設定されていますが、ユーザーの好みに基づいて設定する必要があります。

## Grafanaとの統合 {#integrating-with-grafana}

ユーザーはGrafanaと統合するための2つの主要な方法があります:

- **メトリクスエンドポイント** – このアプローチは、追加のコンポーネントやインフラが不要な利点があります。この提供はGrafana Cloudに限定されており、ClickHouse Cloud PrometheusエンドポイントのURLと資格情報のみが必要です。
- **Grafana Alloy** - Grafana Alloyは、Grafanaエージェントに代わるベンダーニュートラルなOpenTelemetry (OTel) コレクターの配布です。これはスクレイパーとして使用でき、自分のインフラストラクチャにデプロイ可能で、すべてのPrometheusエンドポイントと互換性があります。

以下に、ClickHouse Cloud Prometheusエンドポイントに特化した詳細に焦点を当てて、これらのオプションを使用するための手順を提供します。

### メトリクスエンドポイントを使用したGrafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloudアカウントにログインします。
- **メトリクスエンドポイント**を選択して新しい接続を追加します。
- スクレイプURLをPrometheusエンドポイントにポイントし、APIキー/シークレットで接続を構成するために基本認証を使用します。
- 接続できることを確認するために接続をテストします。

<img src={prometheus_grafana_metrics_endpoint}
  class='image'
  alt='Grafanaメトリクスエンドポイントの設定'
  style={{width: '600px'}} />

<br />

設定が完了すると、ダッシュボードを構成するために選択できるメトリクスがドロップダウンに表示されるはずです:

<img src={prometheus_grafana_dropdown}
  class='image'
  alt='Grafanaメトリクスエクスプローラードロップダウン'
  style={{width: '400px'}} />

<br />

<img src={prometheus_grafana_chart}
  class='image'
  alt='Grafanaメトリクスエクスプローラーのチャート'
  style={{width: '800px'}} />

### Alloyを使用したGrafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloudを使用している場合、GrafanaのAlloyメニューに移動し、画面の指示に従ってAlloyをインストールできます:

<img src={prometheus_grafana_alloy}
  class='image'
  alt='Grafana Alloy'
  style={{width: '600px'}} />

<br />

これにより、データをGrafana Cloudエンドポイントに送信するための`prometheus.remote_write`コンポーネントを使用してAlloyが構成されます。ユーザーは次に、ClickHouse Cloud Prometheusエンドポイント用のスクレイパーを含めるためにAlloyの設定（Linuxでは`/etc/alloy/config.alloy`にあります）を変更する必要があります。

以下は、ClickHouse Cloudエンドポイントからメトリクスをスクレイプするための`prometheus.scrape`コンポーネントを持つAlloyの設定例と、自動的に構成された`prometheus.remote_write`コンポーネントを示しています。`basic_auth`設定コンポーネントには、Cloud APIキーIDとシークレットがそれぞれユーザー名とパスワードとして含まれています。

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
  	  username = "<Grafana API username>"
  	  password = "<grafana API token>"
    }
  }
}
```

`honor_labels`設定パラメータは、インスタンスラベルを正しく設定するために`true`に設定する必要があります。

### Alloyを使用したセルフマネージドGrafana {#grafana-self-managed-with-alloy}

セルフマネージドのGrafanaユーザーは、Alloyエージェントのインストールに関する指示を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で見つけることができます。ユーザーは、Alloyを設定してPrometheusメトリクスを希望の宛先に送信するように設定されたと仮定します。以下の`prometheus.scrape`コンポーネントは、AlloyがClickHouse Cloudエンドポイントをスクレイプする原因となります。`prometheus.remote_write`はスクレイプされたメトリクスを受け取ると仮定します。この宛先が存在しない場合は、`forward_to`キーを希望の受信先に調整してください。

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
  // metrics_serviceに転送します。希望の受信先に変更してください
}
```

設定が完了すると、メトリクスエクスプローラーにClickHouse関連のメトリクスが表示されるようになります:

<img src={prometheus_grafana_metrics_explorer}
  class='image'
  alt='Grafanaメトリクスエクスプローラー'
  style={{width: '800px'}} />

<br />

`honor_labels`設定パラメータは、インスタンスラベルを正しく設定するために`true`に設定する必要があります。

## Datadogとの統合 {#integrating-with-datadog}

Datadogの[エージェント](https://docs.datadoghq.com/agent/?tab=Linux)および[OpenMetrics統合](https://docs.datadoghq.com/integrations/openmetrics/)を使用して、ClickHouse Cloudエンドポイントからメトリクスを収集できます。以下に、このエージェントと統合のシンプルな設定例を示します。ただし、最も関心のあるメトリクスのみを選択することをお勧めします。以下の汎用例では、Datadogがカスタムメトリクスとして扱う数千のメトリクスインスタンスの組み合わせがエクスポートされます。

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

<img src={prometheus_datadog}
  class='image'
  alt='Prometheus Datadog統合'
  style={{width: '600px'}} />

