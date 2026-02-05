---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'ClickStack を使用した PostgreSQL ログの監視'
sidebar_label: 'PostgreSQL ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した PostgreSQL ログの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'logs', 'OTEL', 'ClickStack', 'データベース監視']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した PostgreSQL ログの監視 \{#postgres-logs-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector を構成して PostgreSQL サーバーログをインジェストし、ClickStack を使用して PostgreSQL を監視する方法を説明します。次の内容を学びます:

- 構造化して解析できるように、PostgreSQL が CSV 形式でログを出力するよう構成する
- ログのインジェスト用にカスタム OTel collector 設定を作成する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して、PostgreSQL ログから得られるインサイト (エラー、低速クエリ、接続状況) を可視化する

本番 PostgreSQL を構成する前に連携をテストしたい場合は、サンプルログを含むデモデータセットを利用できます。

所要時間: 10〜15 分
:::

## 既存の PostgreSQL との統合 \{#existing-postgres\}

このセクションでは、ClickStack の OTel collector 設定を変更して、既存の PostgreSQL 環境から ClickStack へログを送信するための構成方法を説明します。

既存環境を設定する前に PostgreSQL ログ連携を試したい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset) セクションにある、あらかじめ構成済みの環境とサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- 稼働中の ClickStack インスタンス
- 既存の PostgreSQL 環境（バージョン 9.6 以降）
- PostgreSQL 設定ファイルを変更できるアクセス権
- ログファイルを保存するための十分なディスク容量

<VerticalStepper headerLevel="h4">
  #### PostgreSQLのログ設定

  PostgreSQLは複数のログ形式をサポートしています。OpenTelemetryで構造化解析を行う場合は、一貫性があり解析可能な出力を提供するCSV形式を推奨します。

  `postgresql.conf` ファイルは通常、以下の場所に配置されています:

  * **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS（Homebrew）**: `/usr/local/var/postgres/postgresql.conf` または `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**: 通常、設定は環境変数の指定または設定ファイルのマウントによって行います

  `postgresql.conf`でこれらの設定を追加または変更してください:

  ```conf
  # Required for CSV logging
  logging_collector = on
  log_destination = 'csvlog'

  # Recommended: Connection logging
  log_connections = on
  log_disconnections = on

  # Optional: Tune based on your monitoring needs
  #log_min_duration_statement = 1000  # Log queries taking more than 1 second
  #log_statement = 'ddl'               # Log DDL statements (CREATE, ALTER, DROP)
  #log_checkpoints = on                # Log checkpoint activity
  #log_lock_waits = on                 # Log lock contention
  ```

  :::note
  本ガイドでは、信頼性の高い構造化解析を実現するため、PostgreSQLの`csvlog`形式を使用しています。`stderr`または`jsonlog`形式を使用している場合は、OpenTelemetryコレクターの設定を適宜調整してください。
  :::

  これらの変更を行った後、PostgreSQLを再起動してください:

  ```bash
  # For systemd
  sudo systemctl restart postgresql

  # For Docker
  docker restart 
  ```

  ログが書き込まれていることを確認してください:

  ```bash
  # Default log location on Linux
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `postgres-logs-monitoring.yaml` という名前のファイルを作成します:

  ```yaml
  receivers:
    filelog/postgres:
      include:
        - /var/lib/postgresql/*/main/log/postgresql-*.csv # Adjust to match your PostgreSQL installation
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
      operators:
        - type: csv_parser
          parse_from: body
          parse_to: attributes
          header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
          lazy_quotes: true
          
        - type: time_parser
          parse_from: attributes.log_time
          layout: '%Y-%m-%d %H:%M:%S.%L %Z'
        
        - type: add
          field: attributes.source
          value: "postgresql"
        
        - type: add
          field: resource["service.name"]
          value: "postgresql-production"

  service:
    pipelines:
      logs/postgres:
        receivers: [filelog/postgres]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  この設定は以下の通りです:

  * PostgreSQL の CSV ログを標準の場所から読み取ります
  * 複数行にわたるログエントリを扱えます（エラーは複数行にわたることがよくあります）
  * 標準的な PostgreSQL のログフィールドをすべて含む CSV 形式を解析します
  * 元のログ時刻を保持するためにタイムスタンプを抽出します
  * HyperDX でのフィルタリングに利用できるよう、`source: postgresql` 属性を追加します
  * 専用パイプライン経由でログを ClickHouse exporter に転送します

  :::note

  * カスタム構成では、新しいレシーバーとパイプラインだけを定義します
  * `processors`（`memory_limiter`、`transform`、`batch`）および `exporters`（`clickhouse`）は、ベースの ClickStack 構成ですでに定義されているため、名前を指定するだけで利用できます
  * `csv_parser` オペレーターは、標準的な PostgreSQL の CSV ログフィールドをすべて構造化属性として抽出します
  * この設定では、コレクターの再起動時にログを再取り込みしないようにするために `start_at: end` を使用します。テスト目的では、`start_at: beginning` に変更すると、過去のログをすぐに確認できます。
  * `include` パスを、PostgreSQL のログディレクトリのパスに合うように調整してください
    :::

  #### ClickStackにカスタム設定を読み込ませる構成

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム構成ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. コレクタがログを読み取れるように、PostgreSQL のログディレクトリをマウントします

  ##### オプション1：Docker Compose

  ClickStack のデプロイメント設定を更新してください：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/lib/postgresql:/var/lib/postgresql:ro
        # ... other volumes ...
  ```

  ##### オプション2: Docker Run（オールインワンイメージ）

  docker run でオールインワンイメージを使用している場合:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがPostgreSQLログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント(`:ro`)を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログ検証

  設定後、HyperDXにログインし、ログが正常に送信されていることを確認します:

  1. 検索ビューに移動します
  2. Source を Logs に設定する
  3. `source:postgresql` でフィルタリングして、PostgreSQL 固有のログを表示します
  4. `user_name`、`database_name`、`error_severity`、`message`、`query` などのフィールドを含む構造化ログエントリを確認できるはずです。

  <Image img={logs_search_view} alt="ログ検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境を構成する前に PostgreSQL ログのインテグレーションをテストしたいユーザー向けに、現実的なパターンを含む事前生成済みの PostgreSQL ログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### テスト用コレクター設定を作成する \{#test-config\}

次の設定内容で `postgres-logs-demo.yaml` という名前のファイルを作成します:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # デモデータのため先頭から読み取る
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true
        
      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'
      
      - type: add
        field: attributes.source
        value: "postgresql-demo"
      
      - type: add
        field: resource["service.name"]
        value: "postgresql-demo"

service:
  pipelines:
    logs/postgres-demo:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### デモ設定で ClickStack を実行する {#run-demo}

デモログとこの設定を用いて ClickStack を実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まだアカウントがない場合は、先に作成してください）
2. Search ビューに移動し、source を `Logs` に設定します
3. タイムレンジを **2025-11-09 00:00:00 - 2025-11-12 00:00:00** に設定します

:::note[Timezone Display]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** の期間をカバーしています。広めのタイムレンジを指定することで、どのタイムゾーンからアクセスしてもデモログを確認できます。ログが表示されたら、可視化を分かりやすくするために、24 時間の範囲に絞り込むこともできます。
:::

<Image img={logs_search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で PostgreSQL を監視する際の出発点として、PostgreSQL ログ向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">ダッシュボード構成をダウンロード</TrackedLink> {#download}

#### 事前構成済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上にある三点リーダー（…）メニューから **Import Dashboard** をクリックします。

<Image img={import_dashboard} alt="ダッシュボードインポートボタン"/>

3. `postgresql-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします。

<Image img={finish_import} alt="インポート完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化が事前に設定された状態で作成されます。

<Image img={logs_dashboard} alt="ログダッシュボード"/>

:::note
デモ用データセットでは、時間範囲を **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされており、読み取り可能であることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX にログが表示されない

実際に適用されている構成に `filelog` レシーバーが含まれていることを確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

コレクターのログにエラーが出力されていないか確認します。

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

デモ用データセットを使用している場合は、ログファイルにアクセスできることを確認してください。

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 次のステップ {#next-steps}

PostgreSQL ログ監視を設定した後は、次の作業を行います。

- 重要なイベント（接続失敗、低速クエリ、エラーの急増）向けの [アラート](/use-cases/observability/clickstack/alerts) を設定する
- 包括的なデータベース監視のために、ログを [PostgreSQL メトリクス](/use-cases/observability/clickstack/integrations/postgresql-metrics) と相関付ける
- アプリケーション固有のクエリパターンに対応したカスタムダッシュボードを作成する
- 自身のパフォーマンス要件に応じた低速クエリを特定できるように `log_min_duration_statement` を設定する

## 本番運用への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために ClickStack に組み込まれている OpenTelemetry Collector（OTel collector）を拡張します。本番環境でのデプロイメントでは、独自の OTel collector を運用し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番向けの設定については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。