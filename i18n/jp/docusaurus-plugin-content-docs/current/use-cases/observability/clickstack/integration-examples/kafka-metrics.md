---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'ClickStack による Kafka メトリクスの監視'
sidebar_label: 'Kafka メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Kafka メトリクスの監視'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるKafkaメトリクスの監視 {#kafka-metrics-clickstack}

:::note[TL;DR]
本ガイドでは、OpenTelemetry JMX Metric Gathererを使用して、ClickStackでApache Kafkaのパフォーマンスメトリクスを監視する方法を説明します。以下について学習します：

- KafkaブローカーでJMXを有効化し、JMX Metric Gathererを設定する
- OTLPを介してKafkaメトリクスをClickStackに送信する
- 事前構築済みダッシュボードを使用してKafkaのパフォーマンス（ブローカースループット、コンシューマーラグ、パーティションの健全性、リクエストレイテンシ）を可視化する

本番環境のKafkaクラスターを設定する前に統合をテストする場合は、サンプルメトリクスを含むデモデータセットを利用できます。

所要時間：10～15分
:::


## 既存のKafkaデプロイメントとの統合 {#existing-kafka}

OpenTelemetry JMX Metric Gathererコンテナを実行してメトリクスを収集し、OTLP経由でClickStackに送信することで、既存のKafkaデプロイメントを監視できます。

既存のセットアップを変更せずに、まずこの統合をテストしたい場合は、[デモデータセットセクション](#demo-dataset)にスキップしてください。

##### 前提条件 {#prerequisites}

- 実行中のClickStackインスタンス
- JMXが有効化された既存のKafkaインストール(バージョン2.0以降)
- ClickStackとKafka間のネットワークアクセス(JMXポート9999、Kafkaポート9092)
- OpenTelemetry JMX Metric Gatherer JAR(ダウンロード手順は以下を参照)

<VerticalStepper headerLevel="h4">

#### ClickStack APIキーの取得 {#get-api-key}

JMX Metric GathererはClickStackのOTLPエンドポイントにデータを送信します。このエンドポイントには認証が必要です。

1. ClickStackのURLでHyperDXを開きます(例: http://localhost:8080)
2. 必要に応じてアカウントを作成するか、ログインします
3. **Team Settings → API Keys**に移動します
4. **Ingestion API Key**をコピーします

<Image img={api_key} alt='ClickStack API Key' />

5. 環境変数として設定します:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### OpenTelemetry JMX Metric Gathererのダウンロード {#download-jmx}

JMX Metric Gatherer JARをダウンロードします:

```bash
curl -L -o opentelemetry-jmx-metrics.jar \
  https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
```

#### Kafka JMXが有効化されていることの確認 {#verify-jmx}

KafkaブローカーでJMXが有効化されていることを確認します。Dockerデプロイメントの場合:

```yaml
services:
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: kafka
      # ... その他のKafka設定
    ports:
      - "9092:9092"
      - "9999:9999"
```

Docker以外のデプロイメントの場合は、Kafka起動時に以下を設定します:

```bash
export JMX_PORT=9999
```

JMXがアクセス可能であることを確認します:

```bash
netstat -an | grep 9999
```

#### Docker ComposeによるJMX Metric Gathererのデプロイ {#deploy-jmx}

この例は、Kafka、JMX Metric Gatherer、ClickStackを含む完全なセットアップを示しています。既存のデプロイメントに合わせてサービス名とエンドポイントを調整してください:

```yaml
services:
  clickstack:
    image: docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    networks:
      - monitoring

  kafka:
    image: confluentinc/cp-kafka:latest
    hostname: kafka
    container_name: kafka
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092"
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:29093"
      KAFKA_LISTENERS: "PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093"
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_LOG_DIRS: "/tmp/kraft-combined-logs"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qk"
      JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: kafka
      KAFKA_JMX_OPTS: "-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999"
    ports:
      - "9092:9092"
      - "9999:9999"
    networks:
      - monitoring
```


kafka-jmx-exporter:
image: eclipse-temurin:11-jre
depends&#95;on:

* kafka
* clickstack
  environment:
* CLICKSTACK&#95;API&#95;KEY=${CLICKSTACK_API_KEY}
  volumes:
* ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
  command: &gt;
  sh -c &quot;java
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
  -Dotel.jmx.target.system=kafka
  -Dotel.metrics.exporter=otlp
  -Dotel.exporter.otlp.protocol=http/protobuf
  -Dotel.exporter.otlp.endpoint=[http://clickstack:4318](http://clickstack:4318)
  -Dotel.exporter.otlp.headers=authorization=${CLICKSTACK_API_KEY}
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
  -Dotel.jmx.interval.milliseconds=10000
  -jar /app/opentelemetry-jmx-metrics.jar&quot;
  networks:
* monitoring

networks:
monitoring:
driver: bridge

```

**主要な設定パラメータ:**

- `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - JMX接続URL（Kafkaのホスト名を使用してください）
- `otel.jmx.target.system=kafka` - Kafka固有のメトリクスを有効化します
- `http://clickstack:4318` - OTLP HTTPエンドポイント（ClickStackのホスト名を使用してください）
- `authorization=\${CLICKSTACK_API_KEY}` - 認証用のAPIキー（必須）
- `service.name=kafka,kafka.broker.id=broker-0` - フィルタリング用のリソース属性
- `10000` - 収集間隔（ミリ秒単位、10秒）

#### HyperDXでメトリクスを確認 {#verify-metrics}

HyperDXにログインし、メトリクスが正常に送信されていることを確認します:

1. Chart Explorerに移動します
2. `kafka.message.count`または`kafka.partition.count`を検索します
3. メトリクスが10秒間隔で表示されることを確認します

**確認すべき主要なメトリクス:**
- `kafka.message.count` - 処理されたメッセージの総数
- `kafka.partition.count` - パーティションの総数
- `kafka.partition.under_replicated` - 正常なクラスタでは0になります
- `kafka.network.io` - ネットワークスループット
- `kafka.request.time.*` - リクエストレイテンシのパーセンタイル
```


アクティビティを発生させてメトリクスを増やすには、次の操作を行います。

```bash
# テストトピックの作成
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"
```


# テストメッセージを送信

echo -e &quot;Message 1\nMessage 2\nMessage 3&quot; | docker exec -i kafka bash -c &quot;unset JMX&#95;PORT &amp;&amp; kafka-console-producer --topic test-topic --bootstrap-server kafka:9092&quot;

```

:::note
Kafkaコンテナ内からKafkaクライアントコマンド（kafka-topics、kafka-console-producerなど）を実行する場合は、JMXポートの競合を防ぐため、コマンドの先頭に`unset JMX_PORT &&`を付加してください。
:::

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番システムを構成する前にKafka Metricsインテグレーションをテストしたいユーザー向けに、実際のKafkaメトリクスパターンを含む事前生成済みデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットをダウンロード {#download-sample}


事前に生成されたメトリクスファイル（現実的なパターンを含む 29 時間分の Kafka メトリクス）をダウンロードします:

```bash
# ゲージメトリクスをダウンロード（パーティション数、キューサイズ、レイテンシー、コンシューマーラグ）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv
```


# 合計メトリクスのダウンロード(メッセージレート、バイトレート、リクエスト数)

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv

````

このデータセットには、単一ブローカーのeコマースKafkaクラスターにおける現実的なパターンが含まれています:
- **06:00-08:00: 朝の急増** - 夜間ベースラインからの急激なトラフィック増加
- **10:00-10:15: フラッシュセール** - 通常トラフィックの3.5倍への急激なスパイク
- **11:30: デプロイイベント** - レプリケーション不足のパーティションによる12倍のコンシューマーラグスパイク
- **14:00-15:30: ショッピングピーク** - ベースラインの2.8倍の高トラフィックが持続
- **17:00-17:30: 仕事後の急増** - 二次的なトラフィックピーク
- **18:45: コンシューマーリバランス** - リバランス中の6倍のラグスパイク
- **20:00-22:00: 夜間の減少** - 夜間レベルへの急激な低下

#### ClickStackの起動 {#start-clickstack}

ClickStackインスタンスを起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

#### ClickStackへのメトリクスの読み込み {#load-metrics}


メトリクスを ClickHouse に直接ロードします：

```bash
# ゲージメトリクスを読み込む（パーティション数、キューサイズ、レイテンシ、コンシューマラグ）
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 合計メトリクスの読み込み（メッセージレート、バイトレート、リクエスト数）

cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### HyperDXでメトリクスを確認する {#verify-demo-metrics}

読み込みが完了したら、メトリクスを確認する最も迅速な方法は、事前構築されたダッシュボードを使用することです。

[ダッシュボードと可視化](#dashboards)セクションに進み、ダッシュボードをインポートして、すべてのKafkaメトリクスを一度に表示してください。

:::note[タイムゾーン表示]
HyperDXは、ブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**です。場所に関係なくデモメトリクスを確実に表示するには、時間範囲を**2025-11-04 16:00:00 - 2025-11-07 16:00:00**に設定してください。メトリクスが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

</VerticalStepper>
```


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したKafkaの監視を開始できるよう、Kafkaメトリクスの重要な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink>する {#download}

#### 事前構築されたダッシュボードをインポートする {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します
2. 右上隅の省略記号の下にある**Import Dashboard**をクリックします

<Image img={import_dashboard} alt='ダッシュボードのインポートボタン' />

3. `kafka-metrics-dashboard.json`ファイルをアップロードし、**Finish Import**をクリックします

<Image img={finish_import} alt='インポート完了ダイアログ' />

#### ダッシュボードを表示する {#created-dashboard}

すべての可視化が事前設定された状態でダッシュボードが作成されます:

<Image img={example_dashboard} alt='Kafkaメトリクスダッシュボード' />

:::note
デモデータセットの場合、時間範囲を**2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**に設定してください(ローカルタイムゾーンに基づいて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

#### HyperDXにメトリクスが表示されない場合 {#no-metrics}

**APIキーが設定され、コンテナに渡されていることを確認する:**


```bash
# 環境変数を確認
echo $CLICKSTACK_API_KEY
```


# コンテナ内に存在することを確認

docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY

````

存在しない場合は、設定して再起動します：
```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
````

**メトリクスがClickHouseに到達しているか確認：**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName
FROM otel_metrics_sum
WHERE ServiceName = 'kafka'
LIMIT 10
"
```

結果が表示されない場合は、JMXエクスポーターのログを確認します：

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**メトリクスを収集するためにKafkaアクティビティを生成：**


```bash
# テストトピックの作成
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"
```


# テストメッセージの送信

echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"

````

#### 認証エラー {#auth-errors}

`Authorization failed` または `401 Unauthorized` が表示される場合:

1. HyperDX UI でAPIキーを確認してください（Settings → API Keys → Ingestion API Key）
2. 再エクスポートして再起動してください:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
````

#### Kafkaクライアントコマンドでのポート競合 {#port-conflicts}

Kafkaコンテナ内からKafkaコマンドを実行する際、次のエラーが表示されることがあります:

```bash
Error: Port already in use: 9999
```

コマンドの前に `unset JMX_PORT &&` を付けてください:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```

#### ネットワーク接続の問題 {#network-issues}

JMXエクスポーターのログに `Connection refused` が表示される場合:

すべてのコンテナが同じDockerネットワーク上にあることを確認してください:

```bash
docker compose ps
docker network inspect <network-name>
```


接続をテストします:

```bash
# JMXエクスポーターからClickStackへ
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## 本番環境への移行 {#going-to-production}

本ガイドでは、JMX Metric GathererからClickStackのOTLPエンドポイントに直接メトリクスを送信します。この方法はテストや小規模なデプロイメントに適しています。

本番環境では、独自のOpenTelemetry Collectorをエージェントとしてデプロイし、JMX Exporterからメトリクスを受信してClickStackに転送します。これにより、バッチ処理、耐障害性、集中管理された設定が提供されます。

本番環境のデプロイメントパターンとコレクター設定例については、[OpenTelemetryによる取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。
