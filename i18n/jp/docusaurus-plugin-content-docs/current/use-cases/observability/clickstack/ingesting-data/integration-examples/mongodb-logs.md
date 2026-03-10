---
slug: /use-cases/observability/clickstack/integrations/mongodb-logs
title: 'ClickStack で MongoDB のログを監視する'
sidebar_label: 'MongoDB ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack で MongoDB のログを監視する'
doc_type: 'guide'
keywords: ['MongoDB', 'ログ', 'OTel', 'ClickStack', 'データベース監視', 'スロークエリ']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/mongodb/log-view.png';
import search_view from '@site/static/images/clickstack/mongodb/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/mongodb/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mongodb/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackでMongoDBログを監視する \{#mongodb-logs-clickstack\}

:::note[要点]
OTel `filelog` レシーバーを使用して、MongoDBサーバーのログ (4.4以降のJSON形式) をClickStackで収集・可視化します。デモ用データセットと事前構築済みダッシュボードが含まれます。
:::

## 既存のMongoDBとの統合 \{#existing-mongodb\}

このセクションでは、ClickStack OTel collector の設定を変更して、既存の MongoDB インストールから ClickStack にログを送信するよう構成する方法を説明します。
独自の既存環境を構成する前に MongoDB 統合を試したい場合は、["デモ用データセット"](/use-cases/observability/clickstack/integrations/mongodb-logs#demo-dataset) セクションにある事前設定済みの構成とサンプルデータを使用してテストできます。

### 前提条件 \{#prerequisites\}

* 稼働中の ClickStack インスタンス
* 既存のセルフマネージド MongoDB 環境 (バージョン 4.4 以降) 
* MongoDB のログファイルへのアクセス

<VerticalStepper headerLevel="h4">
  #### MongoDBのログ設定を確認する

  MongoDB 4.4以降は、デフォルトで構造化JSONログを出力します。ログファイルの場所を確認してください：

  ```bash
  cat /etc/mongod.conf | grep -A 5 systemLog
  ```

  MongoDBの一般的なログの場所:

  * **Linux (apt/yum)**: `/var/log/mongodb/mongod.log`
  * **macOS (Homebrew)**: `/usr/local/var/log/mongodb/mongo.log`
  * **Docker**: 多くの場合、stdout に出力されますが、`/var/log/mongodb/mongod.log` に書き込むよう設定することもできます

  MongoDB が stdout にログを出力している場合は、`mongod.conf` を更新してファイルへの書き込みを設定してください：

  ```yaml
  systemLog:
    destination: file
    path: /var/log/mongodb/mongod.log
    logAppend: true
  ```

  設定を変更したら、MongoDBを再起動してください：

  ```bash
  # For systemd
  sudo systemctl restart mongod

  # For Docker
  docker restart <mongodb-container>
  ```

  #### MongoDB用のカスタムOTel collector設定を作成する

  ClickStack では、カスタム設定ファイルをマウントして環境変数を設定することで、ベースの OpenTelemetry Collector 設定を拡張できます。カスタム設定は、OpAMP を介して HyperDX が管理するベース設定にマージされます。

  以下の設定で `mongodb-monitoring.yaml` という名前のファイルを作成してください。

  ```yaml
  receivers:
    filelog/mongodb:
      include:
        - /var/log/mongodb/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb"

        - type: add
          field: resource["service.name"]
          value: "mongodb-production"

  service:
    pipelines:
      logs/mongodb:
        receivers: [filelog/mongodb]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * カスタム設定では、新しいレシーバーとパイプラインのみを定義します。プロセッサー (`memory_limiter`、`transform`、`batch`) とエクスポーター (`clickhouse`) は、ベースの ClickStack 設定ですでに定義されているため、名前で参照するだけです。
  * この設定では、コレクターの起動時に既存のすべてのログを読み込むために `start_at: beginning` を使用します。本番環境へのデプロイメントでは、コレクターの再起動時にログを再取り込みしないよう、`start_at: end` に変更してください。
    :::

  #### カスタム設定を読み込むようにClickStackを設定する

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください。

  1. カスタム設定ファイルを`/etc/otelcol-contrib/custom.config.yaml`にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. コレクターが読み取れるように、MongoDB のログディレクトリをマウントします

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      ClickStack のデプロイメント設定を更新します。

      ```yaml
      services:
        clickstack:
          # ... 既存の設定 ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... その他の環境変数 ...
          volumes:
            - ./mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/mongodb:/var/log/mongodb:ro
            # ... その他のボリューム ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (All-in-One Image)">
      Docker で all-in-one イメージを使用している場合は、次を実行します。

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/mongodb:/var/log/mongodb:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  ClickStack コレクターに MongoDB ログファイルを読み取るための適切な権限が付与されていることを確認してください。本番環境では、読み取り専用マウント (`:ro`) を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでログを確認する

  設定が完了したら、HyperDX にログインして、ログが正常に流れていることを確認します。

  <Image img={search_view} alt="MongoDB のログ検索ビュー" />

  <Image img={log_view} alt="MongoDB ログ詳細ビュー" />
</VerticalStepper>

## デモデータセット

本番システムを構成する前に、事前に生成されたサンプルデータセットを使って MongoDB インテグレーションをテストします。

<VerticalStepper headerLevel="h4">
  #### サンプルデータセットをダウンロードする

  サンプルログファイルをダウンロードします。

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mongodb/mongod.log
  ```

  #### テスト用のコレクター設定を作成する

  以下の設定内容で、`mongodb-demo.yaml` という名前のファイルを作成します。

  ```yaml
  cat > mongodb-demo.yaml << 'EOF'
  receivers:
    filelog/mongodb:
      include:
        - /tmp/mongodb-demo/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb-demo"

        - type: add
          field: resource["service.name"]
          value: "mongodb-demo"

  service:
    pipelines:
      logs/mongodb-demo:
        receivers: [filelog/mongodb]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### デモ設定で ClickStack を実行する

  デモ用ログと設定を使用して ClickStack を実行します。

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/mongodb-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/mongod.log:/tmp/mongodb-demo/mongod.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## HyperDX でログを確認する

  ClickStack が起動したら、次の手順を実行します。

  1. [HyperDX](http://localhost:8080/) を開いてアカウントにログインします (必要に応じて、先にアカウントを作成してください) 
  2. Search ビューに移動し、ソースを `Logs` に設定します
  3. 時間範囲に **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)** が含まれるように設定します

  <Image img={search_view} alt="MongoDB ログの検索ビュー" />

  <Image img={log_view} alt="MongoDB ログの詳細ビュー" />
</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/mongodb-logs-dashboard.json')} download="mongodb-logs-dashboard.json" eventName="docs.mongodb_logs_monitoring.dashboard_download">ダウンロード</TrackedLink>する \{#download\}

#### 事前構築済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、ダッシュボードセクションに移動します。
2. 右上の三点メニュー内にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="Import Dashboard"/>

3. mongodb-logs-dashboard.json ファイルをアップロードし、finish import をクリックします。

<Image img={finish_import} alt="Finish importing MongoDB logs dashboard"/>

#### すべての可視化が事前設定されたダッシュボードが作成されます {#created-dashboard}

デモ用データセットでは、**2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)** を含むように時間範囲を設定します。

<Image img={example_dashboard} alt="MongoDB logs dashboard"/>

</VerticalStepper>

## トラブルシューティング

**実際に適用されている設定に `filelog` レシーバーが含まれていることを確認します。**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**コレクターのエラーを確認する:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**MongoDB が JSON 形式のログを出力していることを確認します (4.4+) ：**

```bash
tail -1 /var/log/mongodb/mongod.log | python3 -m json.tool
```

出力が有効なJSONでない場合は、お使いのMongoDBのバージョンで従来のテキストログ形式 (4.4以前) が使用されている可能性があります。`json_parser`オペレーターを`regex_parser`に置き換えるか、MongoDB 4.4以降にアップグレードする必要があります。


## 次のステップ

* 重大なイベント (エラーの急増、スロークエリのしきい値) に対する[アラート](/use-cases/observability/clickstack/alerts)を設定します
* 特定のユースケース (レプリカセットの監視、接続追跡) 向けに追加の[ダッシュボード](/use-cases/observability/clickstack/dashboards)を作成します

## 本番環境への移行

このガイドでは、すばやくセットアップできるよう、ClickStack に組み込まれている OpenTelemetry Collector を拡張した構成を使用しています。本番環境にデプロイする場合は、独自の OTel Collector を実行し、データを ClickStack の OTLP エンドポイントに送信することを推奨します。本番環境向けの設定については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。