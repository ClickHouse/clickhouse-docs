---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'ClickStack による Redis ログの監視'
sidebar_label: 'Redis ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Redis ログの監視'
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
このガイドでは、OpenTelemetry Collector を構成して Redis サーバーログを取り込むことで、ClickStack を使って Redis を監視する方法を説明します。次の内容を学びます:

- Redis のログ形式を解析するように OTel collector を構成する
- カスタム構成を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って Redis メトリクス（接続数、コマンド数、メモリ、エラー）を可視化する

本番環境の Redis を構成する前に統合をテストしたい場合に利用できる、サンプルログ付きのデモデータセットも用意されています。

所要時間: 5〜10 分
:::

## 既存の Redis との統合 {#existing-redis}

このセクションでは、ClickStack の OTel collector 設定を変更して、既存の Redis 環境から ClickStack にログを送信する方法を説明します。
既存環境を設定する前に Redis との連携を試してみたい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/redis#demo-dataset) セクションにある事前構成済みセットアップとサンプルデータを使用してテストできます。

### 前提条件 {#prerequisites}

- 稼働中の ClickStack インスタンス
- 既存の Redis インストール（バージョン 3.0 以上）
- Redis のログファイルへのアクセス

<VerticalStepper headerLevel="h4">
  #### Redisのログ設定を確認する

  まず、Redisのログ設定を確認します。Redisに接続して、ログファイルの場所を確認してください：

  ```bash
  redis-cli CONFIG GET logfile
  ```

  一般的なRedisログの場所：

  * **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
  * **macOS（Homebrew）**: `/usr/local/var/log/redis.log`
  * **Docker**: 通常は標準出力（stdout）にログ出力されますが、`/data/redis.log` に書き込むように設定することもできます。

  Redisが標準出力にログを記録している場合は、`redis.conf`を更新してファイルに書き込むように設定します:

  ```bash
  # stdoutではなくファイルにログを記録
  logfile /var/log/redis/redis-server.log

  # ログレベルを設定（オプション: debug, verbose, notice, warning）
  loglevel notice
  ```

  設定変更後、Redisを再起動します：

  ```bash
  # systemd の場合
  sudo systemctl restart redis

  # Docker の場合
  docker restart <redis-container>
  ```

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントし環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `redis-monitoring.yaml` という名前のファイルを作成します：

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
  ```

  この設定では：

  * 標準の場所から Redis ログを読み取ります
  * 正規表現で Redis のログ形式を解析し、構造化フィールド（`pid`、`role`、`timestamp`、`log_level`、`message`）を抽出します
  * HyperDX でのフィルタリング用に `source: redis` 属性を追加します
  * 専用パイプラインを介してログを ClickHouse エクスポーターに転送する

  :::note

  * カスタム設定では、新しい `receivers` と `pipelines` のみを定義します
  * プロセッサ（`memory_limiter`、`transform`、`batch`）とエクスポーター（`clickhouse`）は、ClickStack のベース構成ですでに定義されているため、名前を指定するだけで利用できます
  * `time_parser` オペレーターは、元のログ時刻を保持するために、Redis ログからタイムスタンプを抽出します
  * この設定では、コレクター起動時に既存のすべてのログを読み取るために `start_at: beginning` を指定しており、ログをすぐに確認できます。本番環境のデプロイメントで、コレクターの再起動時にログを再度取り込むことを避けたい場合は、`start_at: end` に変更してください。
    :::

  #### ClickStackにカスタム設定を読み込むよう構成する

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` に `/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. コレクターが Redis のログを読み取れるように、Redis のログディレクトリをマウントします

  ##### オプション1: Docker Compose

  ClickStackのデプロイメント設定を更新します：

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

  ##### オプション2：Docker Run（オールインワンイメージ）

  Dockerでオールインワンイメージを使用している場合は、以下を実行します:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/redis:/var/log/redis:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがRedisログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント（`:ro`）を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログの確認

  設定完了後、HyperDXにログインし、ログが正常に取り込まれていることを確認してください:

  <Image img={log_view} alt="ログビュー" />

  <Image img={log} alt="ログ" />
</VerticalStepper>

## デモ用データセット {#demo-dataset}

本番環境を構成する前に Redis 連携をテストしたいユーザー向けに、現実的なパターンを含む事前生成された Redis ログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルのログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### テスト用 collector 設定を作成する {#test-config}

次の設定内容で `redis-demo.yaml` という名前のファイルを作成します:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # デモデータ向けに先頭から読み取る
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

#### デモ設定で ClickStack を実行する {#run-demo}

デモ用のログと設定を使って ClickStack を実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**この手順ではログファイルをコンテナ内に直接マウントします。これは静的なデモデータを使ったテスト目的でのみ行います。**
:::

## HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まだアカウントがない場合は先に作成してください）
2. Search ビューに移動し、ソースを `Logs` に設定します
3. タイムレンジを **2025-10-26 10:00:00 - 2025-10-29 10:00:00** に設定します

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** の範囲をカバーしています。広めのタイムレンジを指定することで、どのロケーションからでもデモログが表示されるようにしています。ログが表示されたら、可視化を見やすくするために範囲を 24 時間に絞り込むことができます。
:::

<Image img={log_view} alt="ログビュー"/>

<Image img={log} alt="ログ"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で Redis を監視し始める際に役立つように、Redis Logs 向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード構成を<TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポート {#import-dashboard}

1. HyperDX を開き、 Dashboards セクションに移動します。
2. 右上の三点リーダーアイコンから「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. redis-logs-dashboard.json ファイルをアップロードし、「Finish import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化があらかじめ設定された状態でダッシュボードが作成されます {#created-dashboard}

:::note
デモデータセットの場合、時間範囲を **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボード例"/>

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

**環境変数が正しく設定されているか確認してください。**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# 想定される出力: /etc/otelcol-contrib/custom.config.yaml
```

**カスタム設定ファイルがマウントされていることを確認する：**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# 期待される出力: ファイルサイズとパーミッションが表示されるはずです
```

**カスタム設定の内容を表示する:**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# redis-monitoring.yaml の内容が表示されます
```

**実効設定に `filelog` レシーバーが含まれていることを確認します：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# filelog/Redis レシーバーの設定が表示されるはずです
```


### HyperDX にログが表示されない

**Redis がログをファイルに書き出していることを確認する：**

```bash
redis-cli CONFIG GET logfile
# 期待される出力: 空文字列ではなく、ファイルパスが表示されること
# 例: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```

**Redis が継続的にログを出力していることを確認する:**

```bash
tail -f /var/log/redis/redis-server.log
# Redis形式の最新のログエントリが表示されます
```

**コレクターがログを読み取れることを確認する:**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Redisのログエントリが表示されます
```

**コレクターのログでエラーを確認する：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# filelogまたはRedisに関連するエラーメッセージを確認する
```

**docker-compose を使用している場合は、共有ボリュームを確認してください：**

```bash
# 両方のコンテナが同じボリュームを使用しているか確認する {#expected-output-etcotelcol-contribcustomconfigyaml}
docker volume inspect <volume-name>
# 両方のコンテナにボリュームがマウントされているか確認する {#expected-output-should-show-file-size-and-permissions}
```


### ログが正しくパースされない場合

**Redis のログ形式が期待されるパターンと一致していることを確認する:**

```bash
# Redisログは次のような形式になります: {#should-show-your-filelogredis-receiver-configuration}
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Redis のログ形式が異なる場合は、`regex_parser` オペレーター内の正規表現パターンを調整する必要があります。標準的な形式は次のとおりです：

* `pid:role timestamp level message`
* 例: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 次のステップ {#next-steps}

さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）向けに[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けに追加の[ダッシュボード](/use-cases/observability/clickstack/dashboards)を作成する