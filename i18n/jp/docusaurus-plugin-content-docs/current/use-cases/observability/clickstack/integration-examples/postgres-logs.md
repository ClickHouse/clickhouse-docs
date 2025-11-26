---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'ClickStack を使用した PostgreSQL ログの監視'
sidebar_label: 'PostgreSQL ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した PostgreSQL ログの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'logs', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した PostgreSQL ログの監視 {#postgres-logs-clickstack}

:::note[概要]
このガイドでは、OpenTelemetry Collector を設定して PostgreSQL サーバーログを取り込むことで、ClickStack を使って PostgreSQL を監視する方法を説明します。次の内容を学びます。

- 構造化して解析できるように、PostgreSQL がログを CSV 形式で出力するように設定する
- ログのインジェスト用のカスタム OTel collector 設定を作成する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して、PostgreSQL ログから得られるインサイト（エラー、スロークエリ、接続状況）を可視化する

本番環境の PostgreSQL を設定する前に連携をテストしたい場合は、サンプルログを含むデモ用データセットを利用できます。

所要時間: 10〜15 分
:::

## 既存の PostgreSQL との統合 {#existing-postgres}

このセクションでは、ClickStack の OTel collector の設定を変更して、既存の PostgreSQL 環境から ClickStack にログを送信する方法について説明します。

既存環境を設定する前に PostgreSQL ログ連携を試したい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset) セクションにあるあらかじめ設定済みのセットアップとサンプルデータを使ってテストできます。

##### 前提条件 {#prerequisites}

- ClickStack インスタンスが稼働していること
- 既存の PostgreSQL 環境（バージョン 9.6 以降）
- PostgreSQL 設定ファイルを変更できるアクセス権限
- ログファイル用の十分なディスク容量

<VerticalStepper headerLevel="h4">
  #### PostgreSQLログの設定

  PostgreSQLは複数のログ形式をサポートしています。OpenTelemetryで構造化解析を行う場合は、一貫性があり解析可能な出力を提供するCSV形式を推奨します。

  `postgresql.conf` ファイルは通常、以下の場所に配置されています:

  * **Linux（apt/yum）**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS（Homebrew）**: `/usr/local/var/postgres/postgresql.conf` または `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**: 通常、設定は環境変数またはマウントした設定ファイルで行います

  `postgresql.conf` に以下の設定を追加または変更します：

  ```conf
  # CSV ログ出力に必須
  logging_collector = on
  log_destination = 'csvlog'

  # 推奨: 接続ログの記録
  log_connections = on
  log_disconnections = on

  # オプション: 監視要件に応じて調整
  #log_min_duration_statement = 1000  # 1秒以上かかるクエリを記録
  #log_statement = 'ddl'               # DDL文 (CREATE, ALTER, DROP) を記録
  #log_checkpoints = on                # チェックポイント動作を記録
  #log_lock_waits = on                 # ロック競合を記録
  ```

  :::note
  本ガイドでは、信頼性の高い構造化解析を実現するため、PostgreSQLの`csvlog`形式を使用しています。`stderr`または`jsonlog`形式を使用する場合は、OpenTelemetryコレクターの設定を適宜調整してください。
  :::

  これらの変更を行った後、PostgreSQLを再起動します：

  ```bash
  # systemd の場合
  sudo systemctl restart postgresql

  # Docker の場合
  docker restart
  ```

  ログが書き込まれていることを確認してください:

  ```bash
  # Linuxでのデフォルトログ保存場所
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントし環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `postgres-logs-monitoring.yaml` という名前のファイルを作成します：

  ```yaml
  receivers:
    filelog/postgres:
      include:
        - /var/lib/postgresql/*/main/log/postgresql-*.csv # お使いのPostgreSQLインストール環境に合わせて調整してください
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

  この設定では：

  * 標準の場所から PostgreSQL の CSV ログを読み取ります
  * 複数行のログエントリを扱える（エラーは複数行にわたることが多い）
  * 標準的な PostgreSQL のすべてのログフィールドを含む CSV 形式を解析します
  * 元のログ時刻を保持するためにタイムスタンプを抽出します
  * HyperDX でのフィルタリングに使用する `source: postgresql` 属性を追加します
  * 専用パイプラインを介してログを ClickHouse エクスポーターに転送します

  :::note

  * カスタム設定では、新しい receiver と pipeline だけを定義します
  * プロセッサ（`memory_limiter`、`transform`、`batch`）とエクスポータ（`clickhouse`）は、ベースの ClickStack 設定ですでに定義されているので、名前を指定するだけで参照できます
  * `csv_parser` オペレーターは、標準的な PostgreSQL の CSV ログフィールドをすべて抽出し、構造化された属性に変換します
  * この構成では、コレクターの再起動時にログが再度取り込まれるのを避けるために `start_at: end` を使用します。テストする場合は、`start_at: beginning` に変更すると、過去のログをすぐに確認できます。
  * `include` のパスを、PostgreSQL のログディレクトリに一致するように調整します
    :::

  #### ClickStackにカスタム設定を読み込むよう構成する

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム構成ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` に `/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. コレクターがログを読み込めるように、PostgreSQL のログディレクトリをマウントします

  ##### オプション1: Docker Compose

  ClickStackのデプロイメント設定を更新します：

  ```yaml
  services:
    clickstack:
      # ... 既存の設定 ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... その他の環境変数 ...
      volumes:
        - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/lib/postgresql:/var/lib/postgresql:ro
        # ... その他のボリューム ...
  ```

  ##### オプション2：Docker Run（オールインワンイメージ）

  `docker run`でオールインワンイメージを使用している場合:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがPostgreSQLログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント(`:ro`)を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログの確認

  設定完了後、HyperDXにログインし、ログが正常に送信されていることを確認してください：

  1. 検索ビューに移動する
  2. ソースを「Logs」に設定する
  3. PostgreSQL 固有のログを表示するには、`source:postgresql` でフィルタリングします
  4. `user_name`、`database_name`、`error_severity`、`message`、`query` などのフィールドを含む構造化されたログエントリを確認できるはずです。

  <Image img={logs_search_view} alt="ログ検索画面" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモ用データセット {#demo-dataset}

本番環境を設定する前に PostgreSQL ログのインテグレーションを試したいユーザー向けに、実際に近いパターンを含むあらかじめ生成された PostgreSQL ログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード {#download-sample}

サンプルのログファイルをダウンロードします：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### テスト用コレクター設定の作成 {#test-config}

次の設定内容で `postgres-logs-demo.yaml` という名前のファイルを作成します：

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # デモデータ用に最初から読み取る
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

#### デモ用設定で ClickStack を実行する {#run-demo}

デモ用ログと設定を使って ClickStack を実行します：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次の手順を実行します：

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まだアカウントがない場合は作成してください）
2. Search ビューに移動し、ソースを `Logs` に設定します
3. 時間範囲を **2025-11-09 00:00:00 - 2025-11-12 00:00:00** に設定します

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定することで、どのタイムゾーンからアクセスしてもデモログを表示できるようにしています。ログが表示されたら、より見やすい可視化のために時間範囲を 24 時間程度に絞り込んでください。
:::

<Image img={logs_search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack を使って PostgreSQL の監視を始めやすくするために、PostgreSQL ログ向けの基本的な可視化用ダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> {#download}

#### 事前構築済みダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します
2. 画面右上の三点リーダー（省略記号）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `postgresql-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化が事前設定された状態で作成されます。

<Image img={logs_dashboard} alt="ログダッシュボード"/>

:::note
デモデータセットでは、時間範囲を **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートしたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください：

```bash
docker exec <コンテナ名> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされ、読み取り可能であることを確認してください：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX にログが表示されない

実際に適用されている設定に `filelog` レシーバーが含まれているか確認します:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

コレクターのログにエラーが出ていないか確認します：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

デモ用データセットを使用している場合は、ログファイルにアクセスできることを確認してください：

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 次のステップ {#next-steps}

PostgreSQL ログ監視の設定が完了したら、次の作業を行ってください：

- 重要なイベント（接続失敗、遅いクエリ、エラーの急増）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 包括的なデータベース監視のために、ログを[PostgreSQL メトリクス](/use-cases/observability/clickstack/integrations/postgresql-metrics)と相関付ける
- アプリケーション固有のクエリパターン向けにカスタムダッシュボードを作成する
- パフォーマンス要件に応じた遅いクエリを特定するために `log_min_duration_statement` を設定する

## 本番環境への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために、ClickStack に組み込まれている OpenTelemetry Collector を利用した構成について説明します。本番環境へのデプロイでは、独自の OTel Collector を実行し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番環境向けの設定については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。