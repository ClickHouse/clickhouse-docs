---
slug: /use-cases/observability/clickstack/integrations/kafka-logs
title: 'ClickStack で Kafka ログを監視する'
sidebar_label: 'Kafka ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack で Kafka ログを監視する'
doc_type: 'guide'
keywords: ['Kafka', 'ログ', 'OTEL', 'ClickStack', 'ブローカー監視', 'Log4j']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/kafka/logs/log-view.png';
import search_view from '@site/static/images/clickstack/kafka/logs/search-view.png';
import finish_import from '@site/static/images/clickstack/kafka/logs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/kafka/logs/example-dashboard.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackでKafkaログを監視する \{#kafka-logs-clickstack\}

:::note[要点]
OTel `filelog` receiver を使用して、Kafkaブローカーのログ (Log4j形式) を ClickStack で収集・可視化します。デモ用データセットとあらかじめ用意されたダッシュボードが含まれています。
:::

## 既存のKafkaとの統合 \{#existing-kafka\}

このセクションでは、ClickStack OTel collector の設定を変更し、既存の Kafka 環境からブローカーログを ClickStack に送信するように設定する方法を説明します。
既存環境の設定を行う前に Kafka ログ統合をテストしたい場合は、[&quot;デモ用データセット&quot;](/use-cases/observability/clickstack/integrations/kafka-logs#demo-dataset) セクションにある事前設定済みの構成とサンプルデータを使ってテストできます。

### 前提条件 \{#prerequisites\}

* 稼働中の ClickStack インスタンス
* 既存の Kafka 環境 (バージョン 2.0 以降) 
* Kafka のログファイル (`server.log`、`controller.log` など) へのアクセス

<VerticalStepper headerLevel="h4">
  #### Kafkaのログ設定を確認する

  KafkaはLog4jを使用し、`kafka.logs.dir`システムプロパティまたは`LOG_DIR`環境変数で指定されたディレクトリにログを書き込みます。ログファイルの場所をチェックしてください：

  ```bash
  # Default locations
  ls $KAFKA_HOME/logs/      # Standard Apache Kafka (defaults to <install-dir>/logs/)
  ls /var/log/kafka/        # RPM/DEB package installations
  ```

  主要な Kafka ログファイル:

  * **`server.log`**: 一般的なブローカーのログ (起動、接続、レプリケーション、エラー)
  * **`controller.log`**: コントローラーに固有のイベント (リーダー選出、パーティションの再割り当て)
  * **`state-change.log`**: パーティションとレプリカの状態の遷移

  KafkaのデフォルトのLog4jパターンは、次のような行を出力します：

  ```text
  [2026-03-09 14:23:45,123] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
  ```

  :::note
  DockerベースのKafkaデプロイメント (例：`confluentinc/cp-kafka`) では、デフォルトのLog4j設定にはコンソールアペンダーのみが含まれており、ファイルアペンダーは存在しないため、ログはstdoutにのみ書き込まれます。`filelog` receiverを使用するには、`log4j.properties`にファイルアペンダーを追加するか、stdoutをパイプ経由でファイルに出力する (例：`| tee /var/log/kafka/server.log`) ことで、ログをファイルにリダイレクトする必要があります。
  :::

  #### Kafka用のカスタムOTel collector設定を作成する

  ClickStack では、カスタム設定ファイルをマウントして環境変数を設定することで、ベースの OpenTelemetry Collector 設定を拡張できます。カスタム設定は、OpAMP を介して HyperDX が管理するベース設定にマージされます。

  以下の設定で `kafka-logs-monitoring.yaml` という名前のファイルを作成してください。

  ```yaml
  receivers:
    filelog/kafka:
      include:
        - /var/log/kafka/server.log
        - /var/log/kafka/controller.log  # optional, only exists if log4j is configured with separate file appenders
        - /var/log/kafka/state-change.log  # optional, same as above
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka"

        - type: add
          field: resource["service.name"]
          value: "kafka-production"

  service:
    pipelines:
      logs/kafka:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * カスタム設定では、新しいreceiverとパイプラインのみを定義します。プロセッサ (`memory_limiter`、`transform`、`batch`) とエクスポーター (`clickhouse`) は、ベースのClickStack設定ですでに定義されているため、ここでは名前で参照するだけです。
  * `multiline` 設定により、スタックトレースは1つのログエントリとして取り込まれます。
  * この設定では、collector の起動時に既存のすべてのログを読み取るため、`start_at: beginning` を使用します。本番環境のデプロイでは、collector の再起動時にログが再度取り込まれるのを防ぐため、`start_at: end` に変更してください。
    :::

  #### カスタム設定を読み込むようにClickStackを設定する

  既存のClickStackデプロイメントでカスタムcollector設定を有効にするには、次の手順を実行してください。

  1. カスタム設定ファイルを`/etc/otelcol-contrib/custom.config.yaml`にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します。
  3. collector がログを読み取れるように、Kafka のログディレクトリをマウントします

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      ClickStack のデプロイ構成を更新します。

      ```yaml
      services:
        clickstack:
          # ... 既存の設定 ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... その他の環境変数 ...
          volumes:
            - ./kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/kafka:/var/log/kafka:ro
            # ... その他のボリューム ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run（オールインワン イメージ）">
      Docker でオールインワン イメージを使用している場合は、次を実行します。

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/kafka:/var/log/kafka:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  ClickStack collectorがKafkaのログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント (`:ro`) を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでログを確認する

  設定が完了したら、HyperDX にログインしてログが流れていることを確認してください。

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモ用データセット

本番システムを構成する前に、事前生成済みのサンプルデータセットを使って Kafka ログ統合をテストします。

<VerticalStepper headerLevel="h4">
  #### サンプルデータセットをダウンロードする

  サンプルログファイルをダウンロードします。

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/server.log
  ```

  #### テスト用 collector 設定を作成する

  次の設定内容で、`kafka-logs-demo.yaml` という名前のファイルを作成します。

  ```yaml
  cat > kafka-logs-demo.yaml << 'EOF'
  receivers:
    filelog/kafka:
      include:
        - /tmp/kafka-demo/server.log
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka-demo"

        - type: add
          field: resource["service.name"]
          value: "kafka-demo"

  service:
    pipelines:
      logs/kafka-demo:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### デモ設定で ClickStack を実行する

  デモログと設定を使用して ClickStack を実行します。

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/kafka-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/server.log:/tmp/kafka-demo/server.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## HyperDX でログを確認する

  ClickStack が起動したら、次の操作を行います。

  1. [HyperDX](http://localhost:8080/) を開いてアカウントにログインします (必要に応じて先にアカウントを作成してください) 
  2. 検索ビューに移動し、ソースを `Logs` に設定します
  3. 時間範囲が **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)** を含むように設定します

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## ダッシュボードとビジュアライゼーション {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-logs-dashboard.json')} download="kafka-logs-dashboard.json" eventName="docs.kafka_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定 \{#download\}

#### 事前構築済みのダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、ダッシュボードセクションに移動します。
2. 右上の三点リーダーの下にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="Import Dashboard"/>

3. kafka-logs-dashboard.json ファイルをアップロードし、finish import をクリックします。

<Image img={finish_import} alt="Finish importing Kafka logs dashboard"/>

#### すべてのビジュアライゼーションが事前設定された状態でダッシュボードが作成されます {#created-dashboard}

デモ用データセットでは、時間範囲に **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)** が含まれるように設定します。

<Image img={example_dashboard} alt="Kafka Logs example dashboard"/>

</VerticalStepper>

## トラブルシューティング

**有効な設定に、ご使用のfilelog receiverが含まれていることを確認します。**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**collector のエラーをチェック：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**Kafka のログ形式が想定どおりのパターンに一致していることを確認します。**

```bash
tail -1 /var/log/kafka/server.log
```

Kafka のインストールでカスタムの Log4j パターンを使用している場合は、それに合わせて `regex_parser` の正規表現を調整してください。


## 次のステップ

* 重大なイベント (ブローカー障害、レプリケーションエラー、コンシューマーグループの問題) に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
* 包括的なKafka監視を実現するために、[Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics)と組み合わせる
* 特定のユースケース (コントローラーイベント、パーティションの再割り当て) 向けに、追加の[ダッシュボード](/use-cases/observability/clickstack/dashboards)を作成する

## 本番環境への移行

このガイドでは、迅速にセットアップできるよう、ClickStack に組み込まれている OpenTelemetry Collector を利用しています。本番環境にデプロイする場合は、独自の OTel collector を実行し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番環境向けの設定については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。