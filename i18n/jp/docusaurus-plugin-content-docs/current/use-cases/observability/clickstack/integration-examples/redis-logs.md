---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'ClickStack を使用した Redis ログの監視'
sidebar_label: 'Redis ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Redis ログの監視'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるRedisログの監視 {#redis-clickstack}

:::note[要約]
このガイドでは、OpenTelemetryコレクターを設定してRedisサーバーログを取り込み、ClickStackでRedisを監視する方法を説明します。以下の内容を学習します：

- Redisログ形式を解析するためのOTelコレクターの設定
- カスタム設定を使用したClickStackのデプロイ
- 事前構築されたダッシュボードを使用したRedisメトリクス（接続、コマンド、メモリ、エラー）の可視化

本番環境のRedisを設定する前に統合をテストする場合は、サンプルログを含むデモデータセットが利用可能です。

所要時間：5〜10分
:::


## 既存のRedisとの統合 {#existing-redis}

このセクションでは、ClickStack OTelコレクターの設定を変更して、既存のRedisインストールからClickStackにログを送信する方法について説明します。
既存のセットアップを設定する前にRedis統合をテストする場合は、[「デモデータセット」](/use-cases/observability/clickstack/integrations/redis#demo-dataset)セクションで提供している事前設定済みのセットアップとサンプルデータを使用できます。

### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- 既存のRedisインストール（バージョン3.0以降）
- Redisログファイルへのアクセス権

<VerticalStepper headerLevel="h4">

#### Redisログ設定の確認 {#verify-redis}

まず、Redisのログ設定を確認します。Redisに接続して、ログファイルの場所を確認してください：

```bash
redis-cli CONFIG GET logfile
```

一般的なRedisログの保存場所：

- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: 通常はstdoutに出力されますが、`/data/redis.log`に書き込むように設定することもできます

Redisがstdoutにログを出力している場合は、`redis.conf`を更新してファイルに書き込むように設定します：


```bash
# stdoutの代わりにファイルへログを出力
logfile /var/log/redis/redis-server.log
```


# ログレベルを設定する（設定可能な値: debug, verbose, notice, warning）

loglevel notice

```

設定を変更した後、Redisを再起動してください:
```


```bash
# systemd の場合
sudo systemctl restart redis
```


# Docker の場合

docker restart <redis-container>

````

#### カスタム OTel コレクター設定の作成 {#custom-otel}

ClickStack では、カスタム設定ファイルをマウントして環境変数を設定することで、ベースの OpenTelemetry Collector 設定を拡張できます。カスタム設定は、HyperDX が OpAMP 経由で管理するベース設定とマージされます。

以下の設定で `redis-monitoring.yaml` という名前のファイルを作成します:
```yaml
receivers:
  filelog/redis:
    include:
      - /var/log/redis/redis-server.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P\d+):(?P\w+) (?P\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P[.\-*#]) (?P.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'

      - type: add
        field: attributes.source
        value: "redis"

      - type: add
        field: resource["service.name"]
        value: "redis-production"

service:
  pipelines:
    logs/redis:
      receivers: [filelog/redis]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
````

この設定の内容:

- 標準的な場所から Redis ログを読み取ります
- 正規表現を使用して Redis のログ形式を解析し、構造化されたフィールド（`pid`、`role`、`timestamp`、`log_level`、`message`）を抽出します
- HyperDX でのフィルタリング用に `source: redis` 属性を追加します
- 専用パイプライン経由でログを ClickHouse エクスポーターにルーティングします

:::note

- カスタム設定では、新しいレシーバーとパイプラインのみを定義します
- プロセッサー（`memory_limiter`、`transform`、`batch`）とエクスポーター（`clickhouse`）は、ベースの ClickStack 設定で既に定義されているため、名前で参照するだけで使用できます
- `time_parser` オペレーターは Redis ログからタイムスタンプを抽出し、元のログのタイミングを保持します
- この設定では `start_at: beginning` を使用して、コレクター起動時に既存のすべてのログを読み取り、すぐにログを確認できるようにしています。コレクター再起動時にログの再取り込みを避けたい本番環境では、`start_at: end` に変更してください。
  :::

#### カスタム設定を読み込むための ClickStack の設定 {#load-custom}

既存の ClickStack デプロイメントでカスタムコレクター設定を有効にするには、以下の手順が必要です:

1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します
3. コレクターがログを読み取れるように Redis ログディレクトリをマウントします

##### オプション 1: Docker Compose {#docker-compose}

ClickStack デプロイメント設定を更新します:

```yaml
services:
  clickstack:
    # ... 既存の設定 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... その他の環境変数 ...
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/redis:/var/log/redis:ro
      # ... その他のボリューム ...
```

##### オプション 2: Docker Run（オールインワンイメージ） {#all-in-one}

docker でオールインワンイメージを使用している場合は、以下を実行します:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack コレクターが Redis ログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント（`:ro`）を使用し、最小権限の原則に従ってください。
:::

#### HyperDX でのログの検証 {#verifying-logs}

設定が完了したら、HyperDX にログインし、ログが流れていることを確認します:

<Image img={log_view} alt='ログビュー' />

<Image img={log} alt='ログ' />

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番環境を構成する前にRedis統合をテストしたいユーザー向けに、実際のパターンを含む事前生成されたRedisログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード {#download-sample}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### テストコレクター設定の作成 {#test-config}

以下の設定で`redis-demo.yaml`という名前のファイルを作成します:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # デモデータは先頭から読み取り
    operators:
      - type: regex_parser
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'

      - type: add
        field: attributes.source
        value: "redis-demo"

      - type: add
        field: resource["service.name"]
        value: "redis-demo"

service:
  pipelines:
    logs/redis-demo:
      receivers: [filelog/redis]
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
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**ログファイルをコンテナに直接マウントしています。これは静的なデモデータを使用したテスト目的で行われます。**
:::


## HyperDXでログを確認する {#verify-demo-logs}

ClickStackが起動したら:

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします（初回の場合はアカウントの作成が必要です）
2. 検索ビューに移動し、ソースを`Logs`に設定します
3. 時間範囲を**2025-10-26 10:00:00 - 2025-10-29 10:00:00**に設定します

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータは**2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**の期間をカバーしています。広い時間範囲を設定することで、所在地に関係なくデモログを確認できます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={log_view} alt='ログビュー' />

<Image img={log} alt='ログ' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したRedisの監視を開始できるよう、Redis Logsの重要な可視化機能を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### 事前構築済みダッシュボードのインポート {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します。
2. 右上隅の省略記号の下にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt='ダッシュボードのインポート' />

3. redis-logs-dashboard.jsonファイルをアップロードし、finish importをクリックします。

<Image img={finish_import} alt='インポートの完了' />

#### すべての可視化が事前設定されたダッシュボードが作成されます {#created-dashboard}

:::note
デモデータセットの場合、時間範囲を**2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**に設定してください（ローカルタイムゾーンに基づいて調整してください）。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt='ダッシュボードの例' />

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}


**環境変数が正しく設定されていることを確認します：**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# 想定される出力: /etc/otelcol-contrib/custom.config.yaml
```


**カスタム設定ファイルがマウントされていることを確認する:**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# 期待される出力: ファイルサイズとパーミッションが表示されます
```


**カスタム設定の内容を確認する:**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# redis-monitoring.yaml の内容が表示されるはずです
```


**有効な設定にfilelogレシーバーが含まれていることを確認してください:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# filelog/redisレシーバーの設定が表示されます
```

### HyperDXにログが表示されない {#no-logs}


**Redis がログをファイルに書き込むよう設定されていることを確認します：**

```bash
redis-cli CONFIG GET logfile
# 期待される出力: 空文字列ではなく、ファイルパスが表示されます
# 例: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```


**Redis がアクティブにログを出力していることを確認する:**

```bash
tail -f /var/log/redis/redis-server.log
# Redis形式の最近のログエントリが表示されるはずです
```


**コレクターがログを読み取れることを確認する：**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Redisのログエントリが表示されます
```


**コレクターのログでエラーを確認する：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# filelogまたはRedisに関連するエラーメッセージを確認する
```


**docker-composeを使用している場合は、共有ボリュームを確認してください:**

```bash
# 両方のコンテナが同じボリュームを使用していることを確認
docker volume inspect <volume-name>
# 両方のコンテナにボリュームがマウントされていることを確認
```

### ログが正しく解析されない {#logs-not-parsing}


**Redis のログ形式が期待されるパターンと一致していることを確認する:**

```bash
# Redisログは次のような形式になります:
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Redis のログ形式が異なる場合は、`regex_parser` オペレーター内の正規表現パターンを調整する必要がある場合があります。標準的な形式は次のとおりです。

* `pid:role timestamp level message`
* 例: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 次のステップ {#next-steps}

ダッシュボードをさらに活用したい場合は、以下の手順を試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対して[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（APIモニタリング、セキュリティイベント）用の追加[ダッシュボード](/use-cases/observability/clickstack/dashboards)を作成する
