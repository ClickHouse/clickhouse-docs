---
slug: /integrations/prometheus
sidebar_label: Prometheus
title: Prometheus
description: ClickHouseメトリクスをPrometheusにエクスポート
keywords: [prometheus, grafana, monitoring, metrics, exporter] 
---

# Prometheus統合

この機能は、ClickHouse Cloudサービスを監視するために[Prometheus](https://prometheus.io/)との統合をサポートします。Prometheusメトリクスへのアクセスは、ユーザーが安全に接続し、Prometheusメトリクスコレクタにメトリクスをエクスポートできるようにする[ClickHouse Cloud API](/cloud/manage/api/api-overview)エンドポイントを介して公開されています。これらのメトリクスは、GrafanaやDatadogなどのダッシュボードに統合して視覚化できます。

始めるには、[APIキーを生成する](/cloud/manage/openapi)必要があります。

## ClickHouse Cloudメトリクスを取得するためのPrometheusエンドポイントAPI {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### APIリファレンス {#api-reference}

| メソッド | パス                                                                                                               | 説明                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 組織内のすべてのサービスのメトリクスを返します |

**リクエストパラメータ**

| 名前             | 所在地               | 型               |
| ---------------- | ------------------ |------------------ |
| 組織ID  | エンドポイントアドレス | uuid               |
| サービスID       | エンドポイントアドレス | uuid（オプショナル）               |
| filtered_metrics | クエリパラメータ | boolean（オプショナル） |


### 認証 {#authentication}

基本認証のためにClickHouse Cloud APIキーを使用します：

```bash
ユーザー名: <KEY_ID>
パスワード: <KEY_SECRET>
例リクエスト
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

# $ORG_IDのすべてのサービスのため
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true

# 単一サービスのみのため
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true 
```

### サンプルレスポンス {#sample-response}

```response
# HELP ClickHouse_ServiceInfo サービスに関する情報、クラスタ状態やClickHouseのバージョンを含む
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1

# HELP ClickHouseProfileEvents_Query 解釈および実行される可能性のあるクエリの数。解析に失敗したクエリやASTサイズ制限、クォータ制限、または同時に実行されるクエリの数の制限により拒否されたクエリは含まれません。ClickHouse自身によって開始された内部クエリが含まれる場合があります。サブクエリはカウントされません。
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries サブクエリを含むクエリの数をカウントします
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries サブクエリを含むSELECTクエリの数をカウントします
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen 開かれたファイルの数。
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek 'lseek'関数が呼び出された回数。
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### メトリクスラベル {#metric-labels}

すべてのメトリクスには次のラベルがあります：

| ラベル | 説明 |
|---|---|
| clickhouse_org | 組織ID |
| clickhouse_service | サービスID |
| clickhouse_service_name | サービス名 |

### 情報メトリクス {#information-metrics}

ClickHouse Cloudは、常に値が`1`である`gauge`タイプの特別なメトリクス`ClickHouse_ServiceInfo`を提供します。このメトリクスは、すべての**メトリクスラベル**に加えて、次のラベルを含みます：

| ラベル | 説明 |
|---|---|
| clickhouse_cluster_status | サービスの状態。次のいずれかの値になります: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version | サービスが実行しているClickHouseサーバのバージョン |
| scrape | 最後のスクレイプのステータスを示します。`full`または`partial`のいずれかである可能性があります |
| full | 最後のメトリクススクレイプ中にエラーがなかったことを示します |
| partial | 最後のメトリクススクレイプ中にエラーがあり、`ClickHouse_ServiceInfo`メトリクスのみが返されたことを示します |

メトリクスを取得するためのリクエストは、アイドル状態のサービスを再開しません。サービスが`idle`状態の場合、`ClickHouse_ServiceInfo`メトリクスのみが返されます。

### Prometheusの設定 {#configuring-prometheus}

Prometheusサーバは、設定されたターゲットから指定された間隔でメトリクスを収集します。以下は、ClickHouse Cloud Prometheusエンドポイントを使用するPrometheusサーバの例の設定です：

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

`honor_labels`設定パラメータは、インスタンスラベルが正しく設定されるために`true`に設定する必要があります。また、上記の例では`filtered_metrics`は`true`に設定されていますが、ユーザーの好みに基づいて設定する必要があります。

## Grafanaとの統合 {#integrating-with-grafana}

ユーザーはGrafanaとの統合に主に2つの方法を持っています：

- **メトリクスエンドポイント** – このアプローチは、追加のコンポーネントやインフラストラクチャを必要としないという利点があります。この提供はGrafana Cloudに制限され、ClickHouse Cloud PrometheusエンドポイントのURLと認証情報のみを必要とします。
- **Grafana Alloy** - Grafana Alloyは、Grafanaエージェントを置き換えるOpenTelemetry (OTel) コレクターのベンダー中立的な配布です。これはスクレイパーとして使用でき、独自のインフラストラクチャにデプロイ可能で、任意のPrometheusエンドポイントと互換性があります。

以下に、ClickHouse Cloud Prometheusエンドポイントに特化した詳細に焦点を合わせて、これらのオプションの使用方法を示します。

### メトリクスエンドポイントを使用したGrafana Cloud {#grafana-cloud-with-metrics-endpoint}

- Grafana Cloudアカウントにログインします
- **メトリクスエンドポイント**を選択して新しい接続を追加します
- スクレイプURLをPrometheusエンドポイントに設定し、基本認証を使用してAPIキー/シークレットで接続を構成します
- 接続をテストして接続できることを確認します

<img src={require('./images/prometheus-grafana-metrics-endpoint.png').default}    
  class='image'
  alt='Configure Grafana Metrics Endpoint'
  style={{width: '600px'}} />

<br />

設定が完了したら、ダッシュボードを設定するために選択できるメトリクスがドロップダウンに表示されるはずです：

<img src={require('./images/prometheus-grafana-dropdown.png').default}    
  class='image'
  alt='Grafana Metrics Explorer Drop-down'
  style={{width: '400px'}} />

<br />

<img src={require('./images/prometheus-grafana-chart.png').default}    
  class='image'
  alt='Grafana Metrics Explorer Chart'
  style={{width: '800px'}} />

### Alloyを使用したGrafana Cloud {#grafana-cloud-with-alloy}

Grafana Cloudを使用している場合、GrafanaのAlloyメニューに移動して画面の指示に従うことでAlloyをインストールできます：

<img src={require('./images/prometheus-grafana-alloy.png').default}    
  class='image'
  alt='Grafana Alloy'
  style={{width: '600px'}} />

<br />

これにより、データをGrafana Cloudエンドポイントに送信するための`prometheus.remote_write`コンポーネントでAlloyが設定されます。ユーザーは、ClickHouse Cloud Prometheusエンドポイントのスクレイパーを含めるために、Alloyの設定（Linuxでは`/etc/alloy/config.alloy`にあります）を変更する必要があります。

以下は、ClickHouse Cloudエンドポイントからメトリクスをスクレイプするための`prometheus.scrape`コンポーネントを持つAlloyの例の設定と、自動的に設定された`prometheus.remote_write`コンポーネントの例を示します。`basic_auth`設定コンポーネントには、Cloud APIキーIDとシークレットがそれぞれユーザー名とパスワードとして含まれていることに注意してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリスンアドレスからメトリクスを収集します。
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

`honor_labels`設定パラメータは、インスタンスラベルが正しく設定されるために`true`に設定する必要があります。

### Alloyを使用したGrafanaのセルフマネージド {#grafana-self-managed-with-alloy}

Grafanaのセルフマネージドユーザーは、Alloyエージェントのインストール手順を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で見つけることができます。ユーザーが希望する宛先にPrometheusメトリクスを送信するようにAlloyを設定したと仮定します。以下の`prometheus.scrape`コンポーネントは、AlloyがClickHouse Cloudエンドポイントをスクレイプする原因となります。`prometheus.remote_write`がスクレイプされたメトリクスを受け取ると仮定します。この設定が存在しない場合は、`forward_to key`をターゲット宛先に合わせるように調整してください。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // デフォルトのリスンアドレスからメトリクスを収集します。
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
  // メトリクスサービスに転送します。好みの受信者に合わせて修正します
}
```

設定が完了すると、メトリクスエクスプローラーにClickHouseに関連するメトリクスが表示されるはずです：

<img src={require('./images/prometheus-grafana-metrics-explorer.png').default}    
  class='image'
  alt='Grafana Metrics Explorer'
  style={{width: '800px'}} />

<br />

`honor_labels`設定パラメータは、インスタンスラベルが正しく設定されるために`true`に設定する必要があります。

## Datadogとの統合 {#integrating-with-datadog}

Datadogの[エージェント](https://docs.datadoghq.com/agent/?tab=Linux)と[OpenMetrics統合](https://docs.datadoghq.com/integrations/openmetrics/)を使用して、ClickHouse Cloudエンドポイントからメトリクスを収集できます。以下は、このエージェントおよび統合のための簡単な例の設定です。ただし、最も気になるメトリクスだけを選択したくなるかもしれません。以下の全てを取り込む例では、Datadogがカスタムメトリクスとして扱う多くのメトリクスインスタンスの組み合わせをエクスポートします。

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

<img src={require('./images/prometheus-datadog.png').default}    
  class='image'
  alt='Prometheus Datadog Integration'
  style={{width: '600px'}} />

