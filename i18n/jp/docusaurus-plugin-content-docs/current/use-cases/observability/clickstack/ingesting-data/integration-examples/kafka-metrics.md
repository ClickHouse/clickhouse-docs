---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'ClickStack を使用した Kafka メトリクスの監視'
sidebar_label: 'Kafka メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Kafka メトリクスの監視'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTel', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring Kafka Metrics with ClickStack \{#kafka-metrics-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry JMX Metric Gatherer を使用して ClickStack で Apache Kafka のパフォーマンスメトリクスを監視する方法を説明します。次の内容を学びます。

- Kafka ブローカーで JMX を有効化し、JMX Metric Gatherer を構成する
- OTLP 経由で Kafka メトリクスを ClickStack に送信する
- あらかじめ用意されたダッシュボードを使用して Kafka のパフォーマンス（ブローカーのスループット、コンシューマラグ、パーティションの健全性、リクエストレイテンシ）を可視化する

本番環境の Kafka クラスターを設定する前に連携を試したい場合のために、サンプルメトリクス入りのデモデータセットも利用できます。

所要時間: 10～15 分
:::

## 既存の Kafka デプロイメントとの統合 \{#existing-kafka\}

OpenTelemetry JMX Metric Gatherer コンテナを実行してメトリクスを収集し、OTLP 経由で ClickStack に送信することで、既存の Kafka デプロイメントを監視できます。

既存のセットアップを変更せずにまずこの統合を試したい場合は、[デモデータセットのセクション](#demo-dataset)までスキップしてください。

##### 前提条件 \{#prerequisites\}

- 稼働中の ClickStack インスタンス
- JMX が有効化された既存の Kafka インストール（バージョン 2.0 以降）
- ClickStack と Kafka 間のネットワークアクセス（JMX ポート 9999、Kafka ポート 9092）
- OpenTelemetry JMX Metric Gatherer JAR ファイル（ダウンロード手順は以下を参照）

<VerticalStepper headerLevel="h4">
  #### ClickStack API キーを取得する

  JMX Metric GathererはClickStackのOTLPエンドポイントにデータを送信します。このエンドポイントには認証が必要です。

  1. ClickStack の URL（例: http://localhost:8080）にある HyperDX を開きます
  2. 必要に応じてアカウントを作成するか、ログインしてください
  3. **Team Settings → API Keys** に移動します
  4. **インジェスト API key** をコピーします

  <Image img={api_key} alt="ClickStack の API キー" />

  5. これを環境変数として設定します：

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### OpenTelemetry JMXメトリック収集ツールのダウンロード

  JMX Metric Gatherer JARをダウンロード:

  ```bash
  curl -L -o opentelemetry-jmx-metrics.jar \
    https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
  ```

  #### Kafka JMXが有効になっていることを確認する

  KafkaブローカーでJMXが有効化されていることを確認してください。Dockerデプロイの場合：

  ```yaml
  services:
    kafka:
      image: confluentinc/cp-kafka:latest
      environment:
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        # ... other Kafka configuration
      ports:
        - "9092:9092"
        - "9999:9999"
  ```

  Docker以外のデプロイの場合は、Kafkaの起動時に以下を設定してください:

  ```bash
  export JMX_PORT=9999
  ```

  JMXにアクセス可能であることを確認してください:

  ```bash
  netstat -an | grep 9999
  ```

  #### Docker ComposeによるJMX Metric Gathererのデプロイ

  この例は、Kafka、JMX Metric Gatherer、ClickStackを使用した完全なセットアップを示しています。既存のデプロイメントに合わせて、サービス名とエンドポイントを調整してください：

  ```yaml
  services:
    clickstack:
      image: clickhouse/clickstack-all-in-one:latest
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
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9092'
        KAFKA_PROCESS_ROLES: 'broker,controller'
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:29093'
        KAFKA_LISTENERS: 'PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093'
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
        KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        KAFKA_JMX_OPTS: '-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999'
      ports:
        - "9092:9092"
        - "9999:9999"
      networks:
        - monitoring

    kafka-jmx-exporter:
      image: eclipse-temurin:11-jre
      depends_on:
        - kafka
        - clickstack
      environment:
        - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      volumes:
        - ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
      command: >
        sh -c "java
        -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
        -Dotel.jmx.target.system=kafka
        -Dotel.metrics.exporter=otlp
        -Dotel.exporter.otlp.protocol=http/protobuf
        -Dotel.exporter.otlp.endpoint=http://clickstack:4318
        -Dotel.exporter.otlp.headers=authorization=\${CLICKSTACK_API_KEY}
        -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
        -Dotel.jmx.interval.milliseconds=10000
        -jar /app/opentelemetry-jmx-metrics.jar"
      networks:
        - monitoring

  networks:
    monitoring:
      driver: bridge
  ```

  **主要な設定パラメータ:**

  * `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - JMX 接続 URL（ご使用の Kafka ホスト名を使用）
  * `otel.jmx.target.system=kafka` - Kafka 固有のメトリクスを有効化します
  * `http://clickstack:4318` - OTLP HTTP エンドポイント（ご利用の ClickStack のホスト名を使用）
  * `authorization=\${CLICKSTACK_API_KEY}` - 認証用の API キー（必須）
  * `service.name=kafka,kafka.broker.id=broker-0` - フィルタ用のリソース属性
  * `10000` - データ収集間隔（ミリ秒単位、10秒）

  #### HyperDXでメトリクスを検証する

  HyperDXにログインし、メトリクスが送信されていることを確認します:

  1. Chart Explorer に移動します
  2. `kafka.message.count` または `kafka.partition.count` を検索します
  3. メトリクスは10秒間隔で出力されるはずです

  **確認すべき主要メトリクス:**

  * `kafka.message.count` - 処理されたメッセージの総数
  * `kafka.partition.count` - パーティション数の合計
  * `kafka.partition.under_replicated` - 正常なクラスターでは 0 であるべきです
  * `kafka.network.io` - ネットワークのスループット
  * `kafka.request.time.*` - リクエストレイテンシーのパーセンタイル値

  アクティビティを生成し、より多くのメトリクスを収集するには:

  ```bash
  # Create a test topic
  docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

  # Send test messages
  echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
  ```

  :::note
  Kafkaコンテナ内からKafkaクライアントコマンド(kafka-topics、kafka-console-producerなど)を実行する場合は、JMXポートの競合を防ぐため、コマンドの先頭に`unset JMX_PORT &&`を付けてください。
  :::
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境を設定する前に Kafka Metrics 連携をテストしたいユーザー向けに、実運用に近い Kafka メトリクスパターンを含む事前生成済みデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットをダウンロードする \{#download-sample\}

事前生成済みのメトリクスファイル（実運用に近いパターンを持つ 29 時間分の Kafka メトリクス）をダウンロードします:
```bash
# gauge メトリクスをダウンロード（パーティション数、キューサイズ、レイテンシ、コンシューマラグ）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# sum メトリクスをダウンロード（メッセージレート、バイトレート、リクエスト数）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

このデータセットには、単一ブローカー構成の EC サイト向け Kafka クラスターを想定した、実運用に近いパターンが含まれています:
- **06:00-08:00: 朝のトラフィック急増** - 夜間ベースラインからの急激なトラフィック増加
- **10:00-10:15: フラッシュセール** - 通常トラフィックの 3.5 倍への劇的なスパイク
- **11:30: デプロイメントイベント** - レプリカ不足のパーティションを伴うコンシューマラグの 12 倍スパイク
- **14:00-15:30: ショッピングピーク** - ベースラインの 2.8 倍で継続する高トラフィック
- **17:00-17:30: 退勤後のトラフィック増** - 二度目のトラフィックピーク
- **18:45: コンシューマリバランス** - リバランス中のラグ 6 倍スパイク
- **20:00-22:00: 夜間のトラフィック減少** - 夜間レベルへの急激な減少

#### ClickStack を起動する \{#start-clickstack\}

ClickStack インスタンスを起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

#### メトリクスを ClickStack に読み込む \{#load-metrics\}

メトリクスを直接 ClickHouse に読み込みます:
```bash
# gauge メトリクスを読み込む（パーティション数、キューサイズ、レイテンシ、コンシューマラグ）
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# sum メトリクスを読み込む（メッセージレート、バイトレート、リクエスト数）
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX でメトリクスを確認する \{#verify-demo-metrics\}

読み込みが完了したら、最も手早くメトリクスを確認する方法は、あらかじめ用意されたダッシュボードを利用することです。

[ダッシュボードと可視化](#dashboards) セクションに進み、ダッシュボードをインポートして、すべての Kafka メトリクスを一括で表示します。

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** の期間をカバーしています。場所に依存せずデモメトリクスを確実に表示するため、タイムレンジを **2025-11-04 16:00:00 - 2025-11-07 16:00:00** に設定してください。メトリクスが確認できたら、可視化をわかりやすくするためにレンジを 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack を使って Kafka の監視を開始しやすくするために、Kafka メトリクス向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード構成を <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> する \{#download\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダーアイコンをクリックし、表示されるメニューから **Import Dashboard** を選択します

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `kafka-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化が事前設定された状態で作成されます。

<Image img={example_dashboard} alt="Kafka メトリクスダッシュボード"/>

:::note
デモデータセットを利用する場合は、時間範囲を **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートしたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

#### HyperDX にメトリクスが表示されない

**API キーが設定されており、コンテナに渡されていることを確認する：**

```bash
# Check environment variable
echo $CLICKSTACK_API_KEY

# Verify it's in the container
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

存在しない場合は、設定してから再起動してください：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
```

**メトリクスが ClickHouse に送信されているか確認する：**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
LIMIT 10
"
```

結果が何も表示されない場合は、JMX Exporter のログを確認してください。

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**メトリクスを収集するために Kafka のアクティビティを生成する:**

```bash
# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```


#### 認証エラー \{#download\}

`Authorization failed` または `401 Unauthorized` が表示される場合は:

1. HyperDX UI で API key を確認します（Settings → API Keys → インジェスト API key）
2. 再度エクスポートして再起動します:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```


#### Kafka クライアントコマンドとのポート競合 \{#import-dashboard\}

Kafka コンテナ内から Kafka コマンドを実行すると、次のようなメッセージが表示されることがあります。

```bash
Error: Port already in use: 9999
```

各コマンドの先頭に `unset JMX_PORT &&` を付けて実行します:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```


#### ネットワーク接続の問題 \{#created-dashboard\}

JMX exporter のログに `Connection refused` が表示される場合:

すべてのコンテナが同じ Docker ネットワーク上にあることを確認してください:

```bash
docker compose ps
docker network inspect <network-name>
```

接続をテストする：

```bash
# From JMX exporter to ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## 本番環境での運用 \{#going-to-production\}

このガイドでは、JMX Metric Gatherer から ClickStack の OTLP エンドポイントへメトリクスを直接送信します。これはテストや小規模なデプロイメントには適した構成です。

本番環境では、エージェントとして OpenTelemetry Collector をデプロイし、JMX Exporter からメトリクスを受信して ClickStack に転送してください。これにより、バッチング、耐障害性、構成管理の一元化が可能になります。

本番向けのデプロイメントパターンとコレクター構成例については、[OpenTelemetry を使用した取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。