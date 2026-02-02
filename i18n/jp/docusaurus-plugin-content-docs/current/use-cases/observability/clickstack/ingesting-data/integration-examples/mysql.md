---
slug: /use-cases/observability/clickstack/integrations/mysql-logs
title: 'ClickStack による MySQL ログ監視'
sidebar_label: 'MySQL ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による MySQL ログ監視'
doc_type: 'guide'
keywords: ['MySQL', 'ログ', 'OTEL', 'ClickStack', 'データベース監視', 'スロークエリ']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/mysql/search-view.png';
import log_view from '@site/static/images/clickstack/mysql/log-view.png';
import finish_import from '@site/static/images/clickstack/mysql/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mysql/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring MySQL Logs with ClickStack \{#mysql-logs-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector を設定して MySQL サーバーログを取り込むことで、ClickStack を使用して MySQL を監視する方法を説明します。以下の内容を学びます:

- MySQL を設定してエラーログとスロークエリログを書き出す
- ログのインジェスト用にカスタムの OTel collector 設定を作成する
- カスタム設定を使用して ClickStack をデプロイする
- 事前構築済みのダッシュボードを使って MySQL ログのインサイト (エラー、スロークエリ、接続) を可視化する

本番環境の MySQL を設定する前に連携をテストしたい場合は、サンプルログ付きのデモデータセットを利用できます。

所要時間: 10〜15 分
:::

## 既存の MySQL との統合 \{#existing-mysql\}

このセクションでは、ClickStack の OTel collector の設定を変更して、既存の MySQL インストールから ClickStack にログを送信するように構成する方法について説明します。

ご自身の既存環境を構成する前に MySQL ログ連携を試してみたい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/mysql-logs#demo-dataset) セクションにあるあらかじめ構成済みのセットアップとサンプルデータを使用してテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 既存の MySQL 環境（バージョン 5.7 以降）
- MySQL の設定ファイルを変更できるアクセス権
- ログ ファイル用に十分なディスク容量があること

<VerticalStepper headerLevel="h4">
  #### MySQLログの設定

  MySQLは複数のログタイプをサポートしています。OpenTelemetryを使用した包括的な監視には、エラーログとスロークエリログを有効にすることを推奨します。

  `my.cnf` または `my.ini` 設定ファイルは通常、次の場所にあります:

  * **Linux（apt/yum）**: `/etc/mysql/my.cnf` または `/etc/my.cnf`
  * **macOS（Homebrew）**: `/usr/local/etc/my.cnf` または `/opt/homebrew/etc/my.cnf`
  * **Docker**: 設定は通常、環境変数の設定や設定ファイルのマウントによって行います

  `[mysqld]` セクションで以下の設定を追加または変更します:

  ```ini
  [mysqld]
  # Error log configuration
  log_error = /var/log/mysql/error.log

  # Slow query log configuration
  slow_query_log = ON
  slow_query_log_file = /var/log/mysql/mysql-slow.log
  long_query_time = 1
  log_queries_not_using_indexes = ON

  # Optional: General query log (verbose, use with caution in production)
  # general_log = ON
  # general_log_file = /var/log/mysql/mysql-general.log
  ```

  :::note
  スロークエリログは、`long_query_time`秒を超えるクエリをキャプチャします。この閾値は、アプリケーションのパフォーマンス要件に基づいて調整してください。低く設定しすぎると、過剰なログが生成されます。
  :::

  これらの変更を行った後、MySQLを再起動してください：

  ```bash
  # For systemd
  sudo systemctl restart mysql

  # For Docker
  docker restart <mysql-container>
  ```

  ログが書き込まれていることを確認してください:

  ```bash
  # Check error log
  tail -f /var/log/mysql/error.log

  # Check slow query log
  tail -f /var/log/mysql/mysql-slow.log
  ```

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `mysql-logs-monitoring.yaml` という名前のファイルを作成します:

  ```yaml
  receivers:
    filelog/mysql_error:
      include:
        - /var/log/mysql/error.log
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
          
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-error"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

    filelog/mysql_slow:
      include:
        - /var/log/mysql/mysql-slow.log
      start_at: end
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-slow"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

  service:
    pipelines:
      logs/mysql:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  この設定:

  * 標準の場所から MySQL のエラーログとスロークエリログを読み込みます
  * 複数行にわたるログエントリを処理可能（スロークエリは複数行にわたる）
  * 両方のログ形式を解析して、構造化されたフィールド（level、error&#95;code、query&#95;time、rows&#95;examined）を抽出します
  * 元のログのタイムスタンプを保持
  * HyperDX でのフィルタリング用に `source: mysql-error` および `source: mysql-slow` 属性を追加します
  * 専用のパイプラインを使用して、ログを ClickHouse エクスポーターに転送します

  :::note
  MySQLのエラーログとスロークエリログは完全に異なる形式であるため、2つのレシーバーが必要です。`time_parser`は`gotime`レイアウトを使用して、タイムゾーンオフセット付きのMySQL ISO8601タイムスタンプ形式を処理します。
  :::

  #### ClickStackにカスタム設定を読み込ませる構成

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、カスタム設定ファイルを`/etc/otelcol-contrib/custom.config.yaml`にマウントし、環境変数`CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`を設定します。

  ClickStack のデプロイメント設定を更新してください：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./mysql-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/mysql:/var/log/mysql:ro
        # ... other volumes ...
  ```

  :::note
  ClickStackコレクターがMySQLログファイルを読み取るための適切な権限を持っていることを確認してください。読み取り専用マウント(`:ro`)を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログの確認

  設定後、HyperDXにログインし、ログが正常に取り込まれていることを確認してください:

  1. 検索ビューに移動する
  2. Source を「Logs」に設定します
  3. MySQL 固有のログを表示するには、`source:mysql-error` または `source:mysql-slow` でフィルターします
  4. `level`、`error_code`、エラーログ用の `message`、およびスロークエリログ用の `query_time`、`rows_examined`、`query` といったフィールドを含む構造化ログエントリが確認できるはずです。

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境を設定する前に MySQL ログ統合をテストしたいユーザー向けに、現実的なパターンを含む、あらかじめ生成した MySQL ログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">
  #### サンプルデータセットをダウンロードする

  サンプルログファイルをダウンロードしてください:

  ```bash
  # Download error log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/error.log

  # Download slow query log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/mysql-slow.log
  ```

  データセットには以下が含まれます。

  * エラーログのエントリ（起動時メッセージ、警告、接続エラー、InnoDB メッセージ）
  * 現実的な性能特性を反映したスロークエリ
  * 接続ライフサイクルのイベント
  * データベースサーバーの起動および停止シーケンス

  #### テストコレクター設定を作成する

  以下の設定で `mysql-logs-demo.yaml` というファイルを作成します:

  ```yaml
  cat > mysql-logs-demo.yaml << 'EOF'
  receivers:
    filelog/mysql_error:
      include:
        - /tmp/mysql-demo/error.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-error"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

    filelog/mysql_slow:
      include:
        - /tmp/mysql-demo/mysql-slow.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-slow"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

  service:
    pipelines:
      logs/mysql-demo:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### デモ設定でClickStackを実行

  デモログと設定を使用してClickStackを実行します:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/mysql-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/error.log:/tmp/mysql-demo/error.log:ro" \
    -v "$(pwd)/mysql-slow.log:/tmp/mysql-demo/mysql-slow.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDXでログを確認する

  ClickStack が起動したら:

  1. ClickStack が完全に初期化されるまで、しばらく待ちます（通常は 30〜60 秒程度）
  2. [HyperDX](http://localhost:8080/) を開き、自分のアカウントにログインしてください（まだアカウントがない場合は、先にアカウントを作成する必要があります）
  3. Search ビューに移動し、ソースを `Logs` に設定します。
  4. 時間範囲を **2025-11-13 00:00:00 - 2025-11-16 00:00:00** に設定します
  5. 合計で 40 件のログが表示されるはずです（`source:mysql-demo-error` のエラーログが 30 件 + `source:mysql-demo-slow` のスロークエリが 10 件）。

  :::note
  40件すべてのログがすぐに表示されない場合は、コレクターの処理が完了するまで約1分お待ちください。待機後もログが表示されない場合は、`docker restart clickstack-demo` を実行し、さらに1分後に再度確認してください。これは、`start_at: beginning` で既存ファイルを一括読み込みする際のOpenTelemetry filelogレシーバーの既知の問題です。`start_at: end` を使用する本番環境のデプロイメントでは、ログがリアルタイムで書き込まれる際に処理されるため、この問題は発生しません。
  :::

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />

  :::note[タイムゾーン表示]
  HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)**です。この広い時間範囲により、ロケーションに関係なくデモログを確認できます。ログが表示されたら、より明確な可視化のために24時間の期間に絞り込むことができます。
  :::
</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で MySQL の監視を開始するにあたって、MySQL ログ向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/mysql-logs-dashboard.json')} download="mysql-logs-dashboard.json" eventName="docs.mysql_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード構成 \{#download\}

#### 事前構成済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、［Dashboards］セクションに移動します
2. 右上の三点リーダーアイコンから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `mysql-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={example_dashboard} alt="ダッシュボードの例"/>

:::note
デモデータセットでは、時間範囲を **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください。

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされており、読み取り可能であることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX にログが表示されない

実際に適用されている設定に `filelog` レシーバーが含まれていることを確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

collector のログにエラーがないか確認する：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i mysql
```

デモデータセットを使用している場合は、ログファイルにアクセスできることを確認してください。

```bash
docker exec <container> cat /tmp/mysql-demo/error.log | wc -l
docker exec <container> cat /tmp/mysql-demo/mysql-slow.log | wc -l
```


### スロークエリログが表示されない

MySQL でスロークエリログが有効になっていることを確認してください:

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

MySQL がスロークエリログを出力しているか確認します:

```bash
tail -f /var/log/mysql/mysql-slow.log
```

テスト用のスロークエリを生成する:

```sql
SELECT SLEEP(2);
```


### ログが正しく解析されない場合

MySQL のログ形式が想定されている形式と一致していることを確認してください。このガイド内の正規表現パターンは、MySQL 5.7+ および 8.0+ のデフォルト形式向けに設計されています。

エラーログから数行を確認してください:

```bash
head -5 /var/log/mysql/error.log
```

想定されるフォーマット：

```text
2025-11-14T10:23:45.123456+00:00 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.35) starting as process 1
```

フォーマットが大きく異なる場合は、設定の正規表現パターンを調整してください。


## 次のステップ {#next-steps}

MySQL のログ監視をセットアップしたら、次のステップに進みます。

- 重大なイベント（接続失敗、しきい値を超えるスロークエリ、エラー発生数のスパイク）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- クエリパターン別のスロークエリ分析用にカスタムダッシュボードを作成する
- 観測されたクエリのパフォーマンスパターンに基づいて `long_query_time` をチューニングする

## 本番環境への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために ClickStack に組み込まれている OpenTelemetry Collector を拡張して利用します。本番運用では、独自の OTel Collector を実行し、テレメトリデータを ClickStack の OTLP エンドポイントに送信することを推奨します。本番環境向けの設定については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。