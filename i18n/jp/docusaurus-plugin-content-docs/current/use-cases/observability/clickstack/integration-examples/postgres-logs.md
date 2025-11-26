---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'ClickStack を使用した PostgreSQL ログの監視'
sidebar_label: 'PostgreSQL ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した PostgreSQL ログの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'ログ', 'OTel', 'ClickStack', 'データベース監視']
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

:::note[要約]
このガイドでは、OpenTelemetry collector を設定して PostgreSQL サーバーログを取り込むことで、ClickStack で PostgreSQL を監視する方法を解説します。以下の内容を学びます:

- 構造化解析のために、PostgreSQL が CSV 形式でログを出力するように設定する
- ログインジェスト用のカスタム OTel collector 設定を作成する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して、PostgreSQL ログから得られるインサイト（エラー、遅延クエリ、接続）を可視化する

本番環境の PostgreSQL を設定する前に統合をテストしたい場合のために、サンプルログを含むデモデータセットも利用できます。

所要時間: 10〜15分
:::



## 既存のPostgreSQLとの統合 {#existing-postgres}

このセクションでは、ClickStack OTel collectorの設定を変更して、既存のPostgreSQLインストールからClickStackにログを送信する方法について説明します。

既存の設定を構成する前にPostgreSQLログ統合をテストしたい場合は、["デモデータセット"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)セクションで事前設定済みのセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- 既存のPostgreSQLインストール（バージョン9.6以降）
- PostgreSQL設定ファイルを変更するためのアクセス権限
- ログファイル用の十分なディスク容量

<VerticalStepper headerLevel="h4">

#### PostgreSQLログの設定 {#configure-postgres}

PostgreSQLは複数のログ形式をサポートしています。OpenTelemetryによる構造化解析には、一貫性があり解析可能な出力を提供するCSV形式を推奨します。

`postgresql.conf`ファイルは通常、以下の場所にあります：

- **Linux (apt/yum)**：`/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**：`/usr/local/var/postgres/postgresql.conf` または `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**：設定は通常、環境変数またはマウントされた設定ファイルを介して行われます

`postgresql.conf`に以下の設定を追加または変更してください：


```conf
# CSV ログ記録に必要
logging_collector = on
log_destination = 'csvlog'
```


# 推奨: 接続ログの記録
log_connections = on
log_disconnections = on



# 任意: 監視要件に応じて調整する

#log&#95;min&#95;duration&#95;statement = 1000  # 1 秒を超えるクエリをログに記録
#log&#95;statement = &#39;ddl&#39;               # DDL ステートメント (CREATE, ALTER, DROP) をログに記録
#log&#95;checkpoints = on                # チェックポイント処理をログに記録
#log&#95;lock&#95;waits = on                 # ロック競合をログに記録

```

:::note
本ガイドでは、信頼性の高い構造化解析を実現するため、PostgreSQLの`csvlog`形式を使用します。`stderr`または`jsonlog`形式を使用する場合は、OpenTelemetryコレクターの設定を適宜調整してください。
:::

これらの変更を適用後、PostgreSQLを再起動します:
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

tail -f /usr/local/var/postgres/log/postgresql-*.log

````

#### カスタムOTel collector設定を作成する               

ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースとなるOpenTelemetry Collectorの設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定とマージされます。

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

この構成では、次のことを行います:

* PostgreSQL の CSV ログを標準の場所から読み取る
* 複数行にまたがるログエントリを処理する（エラーは複数行にわたることがよくあります）
* すべての標準的な PostgreSQL ログフィールドを含む CSV 形式を解析する
* タイムスタンプを抽出して、元のログ時刻を保持する
* HyperDX でのフィルタリング用に `source: postgresql` 属性を追加する
* 専用のパイプライン経由で ClickHouse エクスポーターにログをルーティングする

:::note

* カスタム構成では、新しい receiver と pipeline だけを定義します
* processor（`memory_limiter`、`transform`、`batch`）と exporter（`clickhouse`）は、すでにベースとなる ClickStack 構成内で定義済みであり、名前を参照するだけで利用できます
* `csv_parser` オペレーターは、標準的な PostgreSQL CSV ログフィールドをすべて構造化された属性として抽出します
* この構成では、コレクター再起動時にログを再度取り込まないようにするために `start_at: end` を使用しています。テスト時には、履歴ログをすぐに確認できるように `start_at: beginning` に変更してください。
* PostgreSQL のログディレクトリの場所に合わせて `include` パスを調整してください
  :::

#### ClickStack にカスタム構成を読み込むように設定する

既存の ClickStack デプロイメントでカスタムコレクター構成を有効にするには、次を行う必要があります:

1. カスタム構成ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントする
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定する
3. コレクターがログを読み取れるように、PostgreSQL のログディレクトリをマウントする

##### オプション 1: Docker Compose

ClickStack デプロイメント構成を更新します:

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

##### オプション 2: Docker Run（オールインワンイメージ）

`docker run` でオールインワンイメージを使用する場合は:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack コレクターが PostgreSQL のログファイルを読み取れるよう、適切な権限が付与されていることを確認してください。本番環境では、読み取り専用マウント（`:ro`）を使用し、最小特権の原則に従ってください。
:::

#### HyperDX でログを確認する


設定完了後、HyperDXにログインしてログが正常に流れていることを確認します：

1. 検索ビューに移動します
2. ソースをLogsに設定します
3. `source:postgresql`でフィルタリングしてPostgreSQL固有のログを表示します
4. `user_name`、`database_name`、`error_severity`、`message`、`query`などのフィールドを含む構造化ログエントリが表示されます

<Image img={logs_search_view} alt='ログ検索ビュー' />

<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## デモ用データセット {#demo-dataset}

本番環境を設定する前に PostgreSQL ログ連携をテストしたいユーザー向けに、現実的なパターンを含む、あらかじめ生成された PostgreSQL ログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### テスト用 Collector 設定を作成する {#test-config}

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

#### デモ用設定で ClickStack を実行する {#run-demo}

デモログとこの設定を使用して ClickStack を実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントにログインします（まだアカウントがない場合は、先に作成する必要があります）
2. Search ビューに移動し、`Logs` をソースとして選択します
3. 時間範囲を **2025-11-09 00:00:00 - 2025-11-12 00:00:00** に設定します

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** の期間をカバーしています。時間範囲を広めに指定することで、どの地域からアクセスしてもデモログが表示されるようにしています。ログが表示されたら、より分かりやすい可視化のために、時間範囲を 24 時間に絞り込むことができます。
:::

<Image img={logs_search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>



## ダッシュボードと可視化 {#dashboards}

ClickStack で PostgreSQL を監視するにあたって、PostgreSQL ログ向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードインポートボタン"/>

3. `postgresql-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する {#created-dashboard}

すべての可視化があらかじめ設定された状態でダッシュボードが作成されます。

<Image img={logs_dashboard} alt="ログダッシュボード"/>

:::note
デモデータセットの場合、時間範囲を **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>



## トラブルシューティング

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされており、読み取れることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDX にログが表示されない場合

実際に適用されている設定に `filelog` レシーバーが含まれているか確認してください:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

コレクターのログにエラーが出力されていないか確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

デモデータセットを使用している場合は、ログファイルにアクセスできることを確認してください。

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 次のステップ {#next-steps}

PostgreSQL ログ監視をセットアップしたら、次の作業を行ってください:

- 重大なイベント（接続失敗、低速クエリ、エラー急増）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 包括的なデータベース監視のために、ログを[PostgreSQL メトリクス](/use-cases/observability/clickstack/integrations/postgresql-metrics)と相関付ける
- アプリケーション固有のクエリパターン向けにカスタムダッシュボードを作成する
- `log_min_duration_statement` を構成して、自身のパフォーマンス要件に応じた低速クエリを特定する



## 本番環境への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために、ClickStack に組み込まれている OpenTelemetry Collector を拡張して利用します。本番環境へのデプロイメントでは、自前の OTel collector を実行し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番環境向けの設定については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
