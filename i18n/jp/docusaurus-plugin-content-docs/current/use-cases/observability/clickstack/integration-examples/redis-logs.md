---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'ClickStack を使用した Redis ログ監視'
sidebar_label: 'Redis ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Redis ログ監視'
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


# ClickStack を使用した Redis ログの監視 {#redis-clickstack}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector を構成して Redis サーバーログを取り込むことで、ClickStack を使って Redis を監視する方法を解説します。次の内容を学びます:

- Redis のログ形式を解析するように OTel collector を構成する
- カスタム設定を適用した ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して Redis のメトリクス（接続数、コマンド数、メモリ、エラー）を可視化する

本番環境の Redis を構成する前に連携をテストしたい場合は、サンプルログ付きのデモデータセットを利用できます。

所要時間: 5〜10 分
:::



## 既存のRedisとの統合 {#existing-redis}

このセクションでは、ClickStack OTel collectorの設定を変更して、既存のRedisインストールからClickStackにログを送信する方法について説明します。
既存の設定を構成する前にRedis統合をテストしたい場合は、["デモデータセット"](/use-cases/observability/clickstack/integrations/redis#demo-dataset)セクションで事前設定済みのセットアップとサンプルデータを使用してテストできます。

### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- 既存のRedisインストール(バージョン3.0以降)
- Redisログファイルへのアクセス権限

<VerticalStepper headerLevel="h4">

#### Redisログ設定の確認 {#verify-redis}

まず、Redisのログ設定を確認します。Redisに接続し、ログファイルの場所を確認してください:

```bash
redis-cli CONFIG GET logfile
```

一般的なRedisログの場所:

- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: 通常はstdoutに出力されますが、`/data/redis.log`に書き込むように設定することも可能です

Redisがstdoutにログを出力している場合は、`redis.conf`を更新してファイルに書き込むように設定してください:


```bash
# stdout ではなくファイルにログを出力
logfile /var/log/redis/redis-server.log
```


# ログレベルを設定（オプション: debug, verbose, notice, warning）

loglevel notice

```

設定を変更した後、Redisを再起動します:
```


```bash
# systemd の場合
sudo systemctl restart redis
```


# Docker の場合

docker restart <redis-container>

````

#### カスタム OTel collector 設定の作成 {#custom-otel}

ClickStack では、カスタム設定ファイルをマウントし、環境変数を設定することで、基本の OpenTelemetry Collector 設定を拡張できます。カスタム設定は、HyperDX が OpAMP 経由で管理する基本設定とマージされます。

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

この設定では以下を行います:

- 標準の場所から Redis ログを読み取る
- 正規表現を使用して Redis のログ形式を解析し、構造化されたフィールド(`pid`、`role`、`timestamp`、`log_level`、`message`)を抽出する
- HyperDX でのフィルタリング用に `source: redis` 属性を追加する
- 専用パイプライン経由でログを ClickHouse エクスポーターにルーティングする

:::note

- カスタム設定では、新しいレシーバーとパイプラインのみを定義します
- プロセッサー(`memory_limiter`、`transform`、`batch`)とエクスポーター(`clickhouse`)は、ClickStack の基本設定で既に定義されているため、名前で参照するだけで使用できます
- `time_parser` オペレーターは、元のログのタイミングを保持するために Redis ログからタイムスタンプを抽出します
- この設定では、collector の起動時にすべての既存ログを読み取るために `start_at: beginning` を使用しており、ログを即座に確認できます。本番環境のデプロイメントで collector の再起動時にログの再取り込みを避けたい場合は、`start_at: end` に変更してください。
  :::

#### カスタム設定を読み込むための ClickStack の設定 {#load-custom}

既存の ClickStack デプロイメントでカスタム collector 設定を有効にするには、以下の手順を実行する必要があります:

1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントする
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定する
3. collector がログを読み取れるように Redis ログディレクトリをマウントする

##### オプション 1: Docker Compose {#docker-compose}

ClickStack デプロイメント設定を更新します:

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/redis:/var/log/redis:ro
      # ... other volumes ...
```

##### オプション 2: Docker Run (オールインワンイメージ) {#all-in-one}

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
ClickStack collector が Redis ログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント(`:ro`)を使用し、最小権限の原則に従ってください。
:::

#### HyperDX でのログの検証 {#verifying-logs}

設定が完了したら、HyperDX にログインし、ログが正常に取り込まれていることを確認します:

<Image img={log_view} alt='ログビュー' />

<Image img={log} alt='ログ' />

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番システムを構成する前にRedis統合をテストしたいユーザー向けに、現実的なパターンを持つ事前生成済みのRedisログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### テストコレクター設定を作成する {#test-config}

以下の設定内容で`redis-demo.yaml`という名前のファイルを作成します:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # デモデータのため先頭から読み取る
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

#### デモ設定でClickStackを実行する {#run-demo}

デモログと設定を使用してClickStackを実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**これはログファイルをコンテナに直接マウントします。静的なデモデータを使用したテスト目的で実行されます。**
:::


## HyperDXでログを確認する {#verify-demo-logs}

ClickStackが起動したら:

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします(初回の場合は先にアカウントを作成する必要があります)
2. 検索ビューに移動し、ソースを`Logs`に設定します
3. 時間範囲を**2025-10-26 10:00:00 - 2025-10-29 10:00:00**に設定します

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**です。広い時間範囲を設定することで、所在地に関係なくデモログを確認できます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={log_view} alt='ログビュー' />

<Image img={log} alt='ログ' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStack を使用して Redis を監視し始める際に役立つよう、Redis ログ向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">ダッシュボード構成をダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポート {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の省略記号メニューから「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. redis-logs-dashboard.json ファイルをアップロードし、「Finish import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化があらかじめ設定された状態でダッシュボードが作成されます {#created-dashboard}

:::note
デモ用データセットでは、時間範囲を **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** に設定してください（ローカルのタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボードの例"/>

</VerticalStepper>



## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}



**環境変数が正しく設定されていることを確認します：**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# 想定される出力: /etc/otelcol-contrib/custom.config.yaml
```


**カスタム設定ファイルがマウントされていることを確認する：**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# 期待される出力: ファイルサイズとパーミッションが表示されるはずです
```


**カスタム設定の内容を確認する:**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# redis-monitoring.yaml の内容が表示されるはずです
```


**有効な設定に `filelog` レシーバーが含まれていることを確認します。**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# filelog/redis レシーバーの設定が表示されるはずです
```

### HyperDX にログが表示されない場合


**Redis がログをファイルに書き込んでいることを確認する:**

```bash
redis-cli CONFIG GET logfile
# 期待される出力: 空文字列ではなく、ファイルパスが表示されるはずです
# 例: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```


**Redis が正常にログを出力していることを確認する:**

```bash
tail -f /var/log/redis/redis-server.log
# Redis形式の最近のログエントリが表示されるはずです
```


**コレクタがログを読み取れることを確認する:**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Redis のログエントリが表示されるはずです
```


**コレクターのログでエラーを確認する：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# filelog または Redis に関連するエラーメッセージを確認する
```


**docker-compose を使用している場合は、共有ボリュームを確認してください。**

```bash
# 両方のコンテナが同じボリュームを使用しているか確認する
docker volume inspect <volume-name>
# 両方のコンテナにボリュームがマウントされているか確認する
```

### ログが正しく解析されない


**Redis のログ形式が想定どおりのパターンと一致していることを確認する:**

```bash
# Redisログは以下のような形式で表示されます:
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Redis のログ形式が異なる場合は、`regex_parser` オペレーター内の正規表現パターンの調整が必要になる場合があります。標準的な形式は次のとおりです:

* `pid:role timestamp level message`
* 例: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 次のステップ {#next-steps}

さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシーのしきい値）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けに追加の[ダッシュボード](/use-cases/observability/clickstack/dashboards)を作成する
