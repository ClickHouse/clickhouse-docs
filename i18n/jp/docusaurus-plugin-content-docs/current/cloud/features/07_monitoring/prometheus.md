---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'ClickHouse メトリクスを Prometheus にエクスポートする'
keywords: ['prometheus', 'grafana', '監視', 'メトリクス', 'エクスポーター']
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

この機能では、[Prometheus](https://prometheus.io/) と連携して ClickHouse Cloud サービスを監視できます。Prometheus メトリクスへのアクセスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) のエンドポイント経由で提供されており、ユーザーはこのエンドポイントに安全に接続して、メトリクスを Prometheus のメトリクスコレクターにエクスポートできます。これらのメトリクスは、Grafana や Datadog などのダッシュボードと連携して可視化できます。

利用を開始するには、[API キーを生成](/cloud/manage/openapi)してください。



## ClickHouse Cloud メトリクス取得用 Prometheus エンドポイント API

### API リファレンス

| Method | Path                                                                                                                            | Description             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 特定のサービスのメトリクスを返します      |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]`                     | 組織内のすべてのサービスのメトリクスを返します |

**リクエストパラメータ**

| Name                 | Location    | Type               |
| -------------------- | ----------- | ------------------ |
| Organization ID      | エンドポイントアドレス | uuid               |
| Service ID           | エンドポイントアドレス | uuid (optional)    |
| filtered&#95;metrics | クエリパラメータ    | boolean (optional) |

### 認証

Basic 認証には ClickHouse Cloud の API キーを使用します:

```bash
ユーザー名: <KEY_ID>
パスワード: <KEY_SECRET>
リクエスト例
export KEY_SECRET=&lt;key_secret&gt;
export KEY_ID=&lt;key_id&gt;
export ORG_ID=&lt;org_id&gt;
```


# $ORG_ID 配下のすべてのサービス向け
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true



# 単一サービス向け

export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### 応答例 {#sample-response}


```response
# HELP ClickHouse_ServiceInfo サービス情報（クラスターステータスおよび ClickHouse バージョンを含む）
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1
```


# HELP ClickHouseProfileEvents_Query 解釈され、実行される可能性のあるクエリの数。パースに失敗したクエリや、AST サイズ制限、クォータ制限、同時実行クエリ数の制限により拒否されたクエリは含まれません。ClickHouse 自身によって開始される内部クエリを含む場合があります。サブクエリはカウントしません。
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6



# HELP ClickHouseProfileEvents_QueriesWithSubqueries すべてのサブクエリを含むクエリ数
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230



# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries すべてのサブクエリを含む SELECT クエリの数
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224



# HELP ClickHouseProfileEvents_FileOpen 開いたファイル数。
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157



# HELP ClickHouseProfileEvents_Seek lseek 関数が呼び出された回数。
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840



# HELP ClickPipes_Info 常に 1。ラベル「clickpipe_state」にはパイプの現在の状態 (Stopped/Provisioning/Running/Paused/Failed) が格納されます
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1



# HELP ClickPipes_SentEvents_Total ClickHouse に送信されたレコード総数
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250



# HELP ClickPipes_SentBytesCompressed_Total ClickHouse に送信された圧縮バイト数の合計。

# TYPE ClickPipes_SentBytesCompressed_Total counter

ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes デモインスタンス",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent デモパイプ",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total ソースから取得した非圧縮バイト数の合計。
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes_Errors_Total データ取り込みエラーの累計。
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0



# HELP ClickPipes_SentBytes_Total ClickHouse に送信された非圧縮バイト数の総計。
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967



# HELP ClickPipes_FetchedBytesCompressed_Total ソースから取得した圧縮済みバイト数の合計。データがソース側で圧縮されていない場合、この値は ClickPipes_FetchedBytes_Total と同じになります
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes&#95;FetchedEvents&#95;Total ソースから取得したレコードの総数。

# TYPE ClickPipes&#95;FetchedEvents&#95;Total counter

ClickPipes&#95;FetchedEvents&#95;Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376

````

### メトリクスラベル {#metric-labels}

すべてのメトリクスには、次のラベルが含まれます。

|ラベル|説明|
|---|---|
|clickhouse_org|組織 ID|
|clickhouse_service|サービス ID|
|clickhouse_service_name|サービス名|

ClickPipes の場合、メトリクスには次のラベルも含まれます。

| ラベル | 説明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe 名 |
| clickpipe_source | ClickPipe ソースタイプ |

### 情報メトリクス {#information-metrics}

ClickHouse Cloud は、常に値が `1` となる `gauge` 型の特別なメトリクス `ClickHouse_ServiceInfo` を提供します。このメトリクスには、すべての **メトリクスラベル** に加えて、次のラベルが含まれます。

|ラベル|説明|
|---|---|
|clickhouse_cluster_status|サービスの状態。次のいずれかになります: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|サービスが実行している ClickHouse サーバーのバージョン|
|scrape|最後のスクレイプの状態を示します。`full` または `partial` のいずれかになります。|
|full|最後のメトリクススクレイプでエラーが発生しなかったことを示します。|
|partial|最後のメトリクススクレイプでいくつかのエラーが発生し、`ClickHouse_ServiceInfo` メトリクスのみが返されたことを示します。|

メトリクス取得リクエストによって、アイドル状態のサービスが再開されることはありません。サービスが `idle` 状態の場合、`ClickHouse_ServiceInfo` メトリクスのみが返されます。

ClickPipes についても、同様の `ClickPipes_Info` という `gauge` 型メトリクスがあり、**メトリクスラベル** に加えて次のラベルを含みます。

| ラベル | 説明 |
| --- | --- |
| clickpipe_state | パイプの現在の状態 |

### Prometheus の設定 {#configuring-prometheus}

Prometheus サーバーは、設定されたターゲットから指定された間隔でメトリクスを収集します。以下は、ClickHouse Cloud の Prometheus エンドポイントを使用するための Prometheus サーバーの設定例です。

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

`honor_labels` 設定パラメータは、instance ラベルが正しく設定されるように `true` にする必要があります。さらに、上記の例では `filtered_metrics` が `true` に設定されていますが、これはユーザーの要件や好みに応じて調整してください。


## Grafana との連携

Grafana と連携する方法は主に 2 通りあります。

* **Metrics Endpoint** – 追加のコンポーネントやインフラが不要であるという利点があります。この方法は Grafana Cloud のみに限定されており、必要なのは ClickHouse Cloud Prometheus Endpoint の URL と認証情報だけです。
* **Grafana Alloy** - Grafana Alloy は OpenTelemetry (OTel) Collector のベンダーニュートラルなディストリビューションで、Grafana Agent の代替となるものです。スクレイパーとして利用でき、自前のインフラにデプロイでき、任意の Prometheus エンドポイントと互換性があります。

以下では、これらのオプションの使用方法について、ClickHouse Cloud Prometheus Endpoint 固有の詳細に焦点を当てて説明します。

### Metrics Endpoint を利用した Grafana Cloud との連携

* Grafana Cloud アカウントにログインします
* **Metrics Endpoint** を選択して新しい接続を追加します
* Scrape URL を Prometheus エンドポイントを指すように設定し、basic auth を使用して API キーとシークレットによる接続設定を行います
* 接続テストを実行し、接続可能であることを確認します

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Grafana Metrics Endpoint の設定" border />

<br />

設定が完了すると、ダッシュボードを構成するために選択可能なメトリクスがドロップダウンに表示されます。

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer のドロップダウン" border />

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer のチャート" border />

### Alloy を利用した Grafana Cloud との連携

Grafana Cloud を使用している場合は、Grafana 内の Alloy メニューに移動し、画面の指示に従うことで Alloy をインストールできます。

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

これにより、認証トークンを使用して Grafana Cloud エンドポイントにデータを送信するための `prometheus.remote_write` コンポーネントを含むように Alloy が構成されます。ユーザーは、その後 Alloy の設定（Linux では `/etc/alloy/config.alloy` にあります）を変更し、ClickHouse Cloud Prometheus Endpoint 用のスクレイパーを追加するだけで済みます。

以下は、ClickHouse Cloud Endpoint からメトリクスをスクレイプするための `prometheus.scrape` コンポーネントと、自動的に構成される `prometheus.remote_write` コンポーネントを含む Alloy の設定例です。`basic_auth` 設定コンポーネントには、Cloud API キー ID とシークレットが、それぞれユーザー名とパスワードとして設定されている点に注意してください。

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
  // 以下の metrics_service に転送します
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana API ユーザー名>"
          password = "<Grafana API トークン>"
    }
  }
}
```

`honor_labels` 設定パラメータは、instance ラベルが正しく設定されるように `true` にする必要がある点に注意してください。

### Grafana のセルフマネージド環境と Alloy

Grafana をセルフマネージドで運用しているユーザーは、Alloy エージェントのインストール手順を[こちら](https://grafana.com/docs/alloy/latest/get-started/install/)で確認できます。ここでは、ユーザーが Alloy を構成し、Prometheus メトリクスを目的の送信先へ送るように設定済みであると仮定します。以下の `prometheus.scrape` コンポーネントによって、Alloy は ClickHouse Cloud エンドポイントをスクレイプします。`prometheus.remote_write` がスクレイプされたメトリクスを受信するようになっていると仮定しています。存在しない場合は、`forward_to key` を対象の送信先に合わせて調整してください。

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
```


forward&#95;to = [prometheus.remote&#95;write.metrics&#95;service.receiver]
// metrics&#95;service に転送します。必要に応じて任意のレシーバーに変更してください
&#125;

```

設定が完了すると、メトリクスエクスプローラーに ClickHouse 関連のメトリクスが表示されます。

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana メトリクスエクスプローラー" border/>

<br />

なお、インスタンスラベルが正しく設定されるように、`honor_labels` 構成パラメータを `true` に設定しておく必要があります。
```


## Datadog との統合

Datadog の [Agent](https://docs.datadoghq.com/agent/?tab=Linux) と [OpenMetrics インテグレーション](https://docs.datadoghq.com/integrations/openmetrics/) を使用して、ClickHouse Cloud のエンドポイントからメトリクスを収集できます。以下は、この Agent と OpenMetrics インテグレーション向けの簡単な設定例です。ただし、実際には特に重要なメトリクスのみに絞り込むことを推奨します。下記の網羅的な例では、何千ものメトリクスとインスタンスの組み合わせがエクスポートされ、Datadog によってカスタムメトリクスとして扱われます。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus と Datadog の統合" />
