---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'ClickStack を用いた PostgreSQL ログの監視'
sidebar_label: 'PostgreSQL ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いた PostgreSQL ログの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'ログ', 'OTEL', 'ClickStack', 'データベース監視']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるPostgreSQLログの監視 {#postgres-logs-clickstack}

:::note[要約]
本ガイドでは、OpenTelemetryコレクターを設定してPostgreSQLサーバーログを取り込み、ClickStackでPostgreSQLを監視する方法を説明します。以下の内容を学習できます:

- 構造化解析のためにPostgreSQLでCSV形式のログ出力を設定する
- ログ取り込み用のカスタムOTelコレクター設定を作成する
- カスタム設定を使用してClickStackをデプロイする
- 事前構築されたダッシュボードを使用してPostgreSQLログの分析情報(エラー、低速クエリ、接続)を可視化する

本番環境のPostgreSQLを設定する前に統合をテストする場合は、サンプルログを含むデモデータセットが利用可能です。

所要時間: 10〜15分
:::


## 既存のPostgreSQLとの統合 {#existing-postgres}

このセクションでは、ClickStack OTelコレクターの設定を変更して、既存のPostgreSQLインストールからClickStackにログを送信する方法について説明します。

既存の設定を構成する前にPostgreSQLログ統合をテストしたい場合は、["デモデータセット"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)セクションにある事前設定済みのセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- 既存のPostgreSQLインストール(バージョン9.6以降)
- PostgreSQL設定ファイルを変更するアクセス権
- ログファイル用の十分なディスク容量

<VerticalStepper headerLevel="h4">

#### PostgreSQLログ記録の設定 {#configure-postgres}

PostgreSQLは複数のログ形式をサポートしています。OpenTelemetryによる構造化解析には、一貫性があり解析可能な出力を提供するCSV形式を推奨します。

`postgresql.conf`ファイルは通常、以下の場所にあります:

- **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` または `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**: 設定は通常、環境変数またはマウントされた設定ファイルを介して行われます

`postgresql.conf`に以下の設定を追加または変更してください:


```conf
# CSV ログ記録に必要
logging_collector = on
log_destination = 'csvlog'
```


# 推奨: 接続ログの有効化
log_connections = on
log_disconnections = on



# 任意: 監視要件に合わせて調整

#log&#95;min&#95;duration&#95;statement = 1000  # 1 秒以上かかるクエリをログに記録
#log&#95;statement = &#39;ddl&#39;               # DDL 文 (CREATE、ALTER、DROP) をログに記録
#log&#95;checkpoints = on                # チェックポイント処理をログに記録
#log&#95;lock&#95;waits = on                 # ロック競合をログに記録

```

:::note
本ガイドでは、信頼性の高い構造化解析を実現するため、PostgreSQLの`csvlog`形式を使用します。`stderr`または`jsonlog`形式を使用している場合は、OpenTelemetryコレクターの設定を適宜調整してください。
:::

これらの変更を適用した後、PostgreSQLを再起動します:
```


```bash
# systemd の場合
sudo systemctl restart postgresql
```


# Docker の場合

docker restart

```

ログが書き込まれていることを確認してください:
```


```bash
# Linuxでのデフォルトのログ保存場所
tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log
```


# macOS Homebrew

tail -f /usr/local/var/postgres/log/postgresql-\*.log

````

#### カスタムOTelコレクター設定の作成 {#custom-otel}

ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースとなるOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定とマージされます。

以下の設定内容で`postgres-logs-monitoring.yaml`という名前のファイルを作成します:

```yaml
receivers:
  filelog/postgres:
    include:
      - /var/lib/postgresql/*/main/log/postgresql-*.csv # PostgreSQLのインストール環境に合わせて調整してください
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
````

この設定の内容:

- 標準的な場所からPostgreSQL CSVログを読み取ります
- 複数行のログエントリを処理します(エラーは複数行にまたがることがよくあります)
- すべての標準PostgreSQLログフィールドを含むCSV形式を解析します
- 元のログのタイミングを保持するためにタイムスタンプを抽出します
- HyperDXでのフィルタリング用に`source: postgresql`属性を追加します
- 専用パイプライン経由でClickHouseエクスポーターにログをルーティングします

:::note

- カスタム設定では新しいレシーバーとパイプラインのみを定義します
- プロセッサー(`memory_limiter`、`transform`、`batch`)とエクスポーター(`clickhouse`)は、ベースとなるClickStack設定ですでに定義されているため、名前で参照するだけです
- `csv_parser`オペレーターは、すべての標準PostgreSQL CSVログフィールドを構造化された属性に抽出します
- この設定では、コレクターの再起動時にログを再取り込みしないように`start_at: end`を使用しています。テストの場合は、`start_at: beginning`に変更すると、過去のログをすぐに確認できます
- `include`パスをPostgreSQLログディレクトリの場所に合わせて調整してください
  :::

#### カスタム設定を読み込むためのClickStackの設定 {#load-custom}

既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、以下の手順を実行する必要があります:

1. カスタム設定ファイルを`/etc/otelcol-contrib/custom.config.yaml`にマウントします
2. 環境変数`CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`を設定します
3. コレクターがログを読み取れるように、PostgreSQLログディレクトリをマウントします

##### オプション1: Docker Compose {#docker-compose}

ClickStackデプロイメント設定を更新します:

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

##### オプション2: Docker Run(オールインワンイメージ) {#all-in-one}

docker runでオールインワンイメージを使用している場合:

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

#### HyperDXでのログの検証 {#verifying-logs}


設定完了後、HyperDXにログインしてログが正常に送信されていることを確認します：

1. 検索ビューに移動します
2. ソースをLogsに設定します
3. `source:postgresql`でフィルタリングしてPostgreSQL固有のログを表示します
4. `user_name`、`database_name`、`error_severity`、`message`、`query`などのフィールドを含む構造化ログエントリが表示されます

<Image img={logs_search_view} alt='ログ検索ビュー' />

<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番環境を構成する前にPostgreSQLログ統合をテストしたいユーザー向けに、実際のパターンを含む事前生成されたPostgreSQLログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード {#download-sample}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### テストコレクター設定の作成 {#test-config}

以下の設定で`postgres-logs-demo.yaml`という名前のファイルを作成します:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # デモデータは最初から読み取る
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

#### デモ設定でClickStackを実行 {#run-demo}

デモログと設定でClickStackを実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### HyperDXでログを確認 {#verify-demo-logs}

ClickStackが実行されたら:

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします(最初にアカウントを作成する必要がある場合があります)
2. 検索ビューに移動し、ソースを`Logs`に設定します
3. 時間範囲を**2025-11-09 00:00:00 - 2025-11-12 00:00:00**に設定します

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの範囲は**2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**です。広い時間範囲を指定することで、場所に関係なくデモログが表示されます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={logs_search_view} alt='ログ検索ビュー' />

<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したPostgreSQLの監視を開始できるよう、PostgreSQLログの重要な可視化機能を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">ダウンロード</TrackedLink>ダッシュボード設定 {#download}

#### 事前構築されたダッシュボードのインポート {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します
2. 右上隅の省略記号の下にある**Import Dashboard**をクリックします

<Image img={import_dashboard} alt='Import dashboard button' />

3. `postgresql-logs-dashboard.json`ファイルをアップロードし、**Finish Import**をクリックします

<Image img={finish_import} alt='Finish import' />

#### ダッシュボードの表示 {#created-dashboard}

すべての可視化が事前設定されたダッシュボードが作成されます:

<Image img={logs_dashboard} alt='Logs dashboard' />

:::note
デモデータセットの場合、時間範囲を**2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**に設定してください(ローカルタイムゾーンに基づいて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}

環境変数が設定されていることを確認してください:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされており、読み取り可能であることを確認してください:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDXにログが表示されない {#no-logs}

有効な設定にfilelogレシーバーが含まれていることを確認してください:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

コレクターログでエラーを確認してください:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

デモデータセットを使用している場合は、ログファイルにアクセス可能であることを確認してください:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 次のステップ {#next-steps}

PostgreSQLログ監視を設定した後:

- 重大なイベント（接続障害、スロークエリ、エラー急増）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 包括的なデータベース監視のため、ログを[PostgreSQLメトリクス](/use-cases/observability/clickstack/integrations/postgresql-metrics)と関連付ける
- アプリケーション固有のクエリパターン用のカスタムダッシュボードを作成する
- パフォーマンス要件に応じたスロークエリを特定するため、`log_min_duration_statement`を設定する


## 本番環境への移行 {#going-to-production}

本ガイドでは、迅速なセットアップのためにClickStackの組み込みOpenTelemetry Collectorを拡張します。本番環境へのデプロイでは、独自のOTel Collectorを実行し、ClickStackのOTLPエンドポイントにデータを送信することを推奨します。本番環境の構成については、[OpenTelemetryデータの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。
