---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'ClickStack による Redis メトリクスの監視'
sidebar_label: 'Redis メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Redis メトリクスの監視'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した Redis メトリクスの監視 \{#redis-metrics-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector の Redis receiver を設定して、ClickStack で Redis のパフォーマンスメトリクスを監視する方法を解説します。次の内容を学びます:

- Redis メトリクスを収集するように OTel collector を構成する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って Redis のパフォーマンス (commands/sec、メモリ使用量、接続クライアント数、キャッシュ性能) を可視化する

本番環境の Redis を設定する前に統合をテストしたい場合に使用できる、サンプルメトリクスを含むデモ用データセットも用意されています。

所要時間: 5〜10 分
:::

## 既存の Redis との統合 \{#existing-redis\}

このセクションでは、Redis receiver を用いて ClickStack の OTel collector を構成し、既存の Redis インスタンスから ClickStack へメトリクスを送信する方法を説明します。

既存環境を構成する前に Redis メトリクス連携を試したい場合は、[次のセクション](#demo-dataset)で事前設定済みのデモデータセットを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 既存の Redis 環境（バージョン 3.0 以降）
- ClickStack から Redis へのネットワーク アクセス（デフォルトポート 6379）
- 認証が有効な場合の Redis パスワード

<VerticalStepper headerLevel="h4">
  #### Redis接続を確認する

  まず、Redisに接続可能であること、およびINFOコマンドが正常に動作することを確認します:

  ```bash
  # Test connection
  redis-cli ping
  # Expected output: PONG

  # Test INFO command (used by metrics collector)
  redis-cli INFO server
  # Should display Redis server information
  ```

  Redis に認証が必要な場合:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **一般的なRedisエンドポイント:**

  * **ローカル環境**: `localhost:6379`
  * **Docker**：コンテナ名またはサービス名を指定します（例：`redis:6379`）
  * **リモートアドレス**: `<redis-host>:6379`

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetryコレクター設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `redis-metrics.yaml` という名前のファイルを作成してください:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Uncomment if Redis requires authentication
      # password: ${env:REDIS_PASSWORD}
      
      # Configure which metrics to collect
      metrics:
        redis.commands.processed:
          enabled: true
        redis.clients.connected:
          enabled: true
        redis.memory.used:
          enabled: true
        redis.keyspace.hits:
          enabled: true
        redis.keyspace.misses:
          enabled: true
        redis.keys.evicted:
          enabled: true
        redis.keys.expired:
          enabled: true

  processors:
    resource:
      attributes:
        - key: service.name
          value: "redis"
          action: upsert

  service:
    pipelines:
      metrics/redis:
        receivers: [redis]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  この設定は以下を行います:

  * `localhost:6379` で稼働している Redis に接続します（ご利用の環境に合わせてエンドポイントを変更してください）
  * 10秒ごとにメトリクスを収集します
  * 主要なパフォーマンス指標（コマンド、クライアント、メモリ、キースペース統計）を収集します
  * **[OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service) に従い、必須の `service.name` リソース属性を設定します**
  * 専用パイプライン経由でメトリクスを ClickHouse exporter に転送します

  **収集される主要メトリクス:**

  * `redis.commands.processed` - 1 秒あたりに処理されたコマンド数
  * `redis.clients.connected` - 接続中のクライアント数
  * `redis.clients.blocked` - ブロッキングコールでブロックされているクライアント数
  * `redis.memory.used` - Redis が使用しているメモリ（バイト単位）
  * `redis.memory.peak` - ピーク時のメモリ使用量
  * `redis.keyspace.hits` - キー検索の成功回数
  * `redis.keyspace.misses` - 失敗したキー検索回数（キャッシュヒット率算出用）
  * `redis.keys.expired` - 期限切れになったキー数
  * `redis.keys.evicted` - メモリ不足により削除されたキーの数
  * `redis.connections.received` - 受信した接続数の合計
  * `redis.connections.rejected` - 拒否された接続数

  :::note

  * カスタム設定では、新しい receiver、processor、pipeline だけを定義します
  * `memory_limiter` プロセッサ、`batch` プロセッサ、および `clickhouse` エクスポーターは、ベースの ClickStack 構成内ですでに定義されているため、名前を指定するだけで参照できます
  * `resource` プロセッサは、OpenTelemetry のセマンティック規約に従い、必須となる `service.name` 属性を設定します
  * 本番環境で認証を行う場合は、パスワードを環境変数 `${env:REDIS_PASSWORD}` に保存してください。
  * 必要に応じて `collection_interval` を調整します（デフォルトは 10 秒。値を小さくすると収集されるデータ量が増加します）
  * 複数の Redis インスタンスがある場合には、それらを区別できるように `service.name` をカスタマイズします（例: `"redis-cache"`、`"redis-sessions"`）
    :::

  #### ClickStackでカスタム設定を読み込むように構成する

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行する必要があります:

  1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします。
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` に `/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. ClickStack と Redis 間のネットワーク接続が確立されていること

  ##### オプション1：Docker Compose

  ClickStackのデプロイメント設定を更新してください：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # Optional: If Redis requires authentication
        # - REDIS_PASSWORD=your-redis-password
        # ... other environment variables ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... other volumes ...
      # If Redis is in the same compose file:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # Optional: Enable authentication
      # command: redis-server --requirepass your-redis-password
  ```

  ##### オプション2: Docker run（オールインワンイメージ）

  `docker run` でオールインワンイメージを使用する場合：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **重要:** Redisが別のコンテナで実行されている場合は、Dockerネットワーキングを使用します:

  ```bash
  # Create a network
  docker network create monitoring

  # Run Redis on the network
  docker run -d --name redis --network monitoring redis:7-alpine

  # Run ClickStack on the same network (update endpoint to "redis:6379" in config)
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDXでメトリクスを検証する

  設定完了後、HyperDXにログインしてメトリクスが流れていることを確認します:

  1. Metrics Explorer を開きます
  2. `redis.` で始まるメトリクス（例: `redis.commands.processed`, `redis.memory.used`）を検索してください
  3. 設定した収集間隔でメトリクスのデータポイントが表示されているはずです

  {/* <Image img={metrics_view} alt="Redis メトリクスビュー"/> */ }
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境を設定する前に Redis Metrics インテグレーションをテストしたいユーザー向けに、現実的な Redis Metrics パターンを含むあらかじめ生成されたデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットのダウンロード \{#download-sample\}

あらかじめ生成されたメトリクスファイル（現実的なパターンを含む 24 時間分の Redis Metrics）をダウンロードします:
```bash
# ゲージメトリクス（メモリ、断片化率）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# 合計メトリクス（コマンド、接続数、キースペース統計）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

このデータセットには、次のような現実的なパターンが含まれます:
- **キャッシュウォーミングイベント (06:00)** - ヒット率が 30% から 80% に上昇
- **トラフィックスパイク (14:30-14:45)** - 接続圧力を伴う 5 倍のトラフィック急増
- **メモリプレッシャー (20:00)** - キーの削除とキャッシュ性能の低下
- **日次トラフィックパターン** - 営業時間帯のピーク、夜間の減少、ランダムなマイクロスパイク

#### ClickStack の起動 \{#start-clickstack\}

ClickStack インスタンスを起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまでおよそ 30 秒待ちます。

#### ClickStack へのメトリクスのロード {#load-metrics}

メトリクスを直接 ClickHouse にロードします:
```bash
# ゲージメトリクス（メモリ、断片化）をロード
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 合計メトリクス（コマンド、接続数、キースペース）をロード
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX でメトリクスを確認 {#verify-metrics}

ロードが完了したら、メトリクスを確認する最も手早い方法は、事前に用意されたダッシュボードを利用することです。

[Dashboards and visualization](#dashboards) セクションに進み、ダッシュボードをインポートして、すべての Redis Metrics を一括で可視化します。

:::note
デモデータセットのタイムレンジは 2025-10-20 00:00:00 から 2025-10-21 05:00:00 です。HyperDX のタイムレンジがこの期間と一致していることを確認してください。

次のような興味深いパターンを探してみてください:
- **06:00** - キャッシュウォーミング（低いヒット率が上昇）
- **14:30-14:45** - トラフィックスパイク（クライアント接続数の増加と一部リジェクト）
- **20:00** - メモリプレッシャー（キー削除が始まる）
:::

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で Redis の監視を開始するにあたって、Redis Metrics 向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード構成ファイル {#download}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の三点リーダー（…）メニューの下にある **Import Dashboard** をクリックします。

<Image img={import_dashboard} alt="ダッシュボードインポートボタン"/>

3. `redis-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします。

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={example_dashboard} alt="Redis Metrics ダッシュボード"/>

:::note
デモデータセットの場合、時間範囲を **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` が正しく設定されていることを確認してください。

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルが `/etc/otelcol-contrib/custom.config.yaml` にマウントされていることを確認してください。

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

カスタム設定の内容を表示し、正しく読み取れることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX にメトリクスが表示されない場合

Collector から Redis へ接続できることを確認します:

```bash
# From the ClickStack container
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Expected output: PONG
```

Redis の `INFO` コマンドが動作するか確認してください：

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Should display Redis statistics
```

実際に適用されている設定に Redis レシーバーが含まれていることを確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

コレクターのログにエラーが出ていないか確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Look for connection errors or authentication failures
```


### 認証エラー

ログに認証エラーが表示されている場合:

```bash
# Verify Redis requires authentication
redis-cli CONFIG GET requirepass

# Test authentication
redis-cli -a <password> ping

# Ensure password is set in ClickStack environment
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

パスワードを使用するように設定を更新します。

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```


### ネットワーク接続の問題

ClickStack が Redis に接続できない場合:

```bash
# Check if both containers are on the same network
docker network inspect <network-name>

# Test connectivity
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Docker Compose ファイルまたは `docker run` コマンドで、両方のコンテナが同一ネットワーク上に置かれるようにしてください。


## 次のステップ {#next-steps}

さらに活用したい場合は、モニタリング設定を拡張するために次のステップを試してください。

- 重要なメトリクス（メモリ使用量のしきい値、接続数の上限、キャッシュヒット率の低下）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（レプリケーション遅延、永続化パフォーマンス）向けに追加のダッシュボードを作成する
- レシーバーの設定をエンドポイントやサービス名を変えて複製し、複数の Redis インスタンスを監視する