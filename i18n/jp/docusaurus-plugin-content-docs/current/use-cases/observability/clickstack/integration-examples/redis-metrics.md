---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'ClickStack による Redis メトリクス監視'
sidebar_label: 'Redis メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Redis メトリクス監視'
doc_type: 'guide'
keywords: ['Redis', 'メトリクス', 'OTel', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# ClickStack を使用した Redis メトリクスの監視 {#redis-metrics-clickstack}

:::note[要約]
このガイドでは、OpenTelemetry collector の Redis receiver を設定し、ClickStack で Redis のパフォーマンスメトリクスを監視する方法を説明します。次のことが行えるようになります。

- Redis メトリクスを収集するように OTel collector を設定する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して Redis のパフォーマンス（commands/sec、メモリ使用量、接続クライアント数、キャッシュ性能）を可視化する

本番環境の Redis を設定する前に連携をテストしたい場合のために、サンプルメトリクスを含むデモデータセットが用意されています。

所要時間: 5～10 分
:::

## 既存の Redis との統合 {#existing-redis}

このセクションでは、ClickStack の OTel collector に Redis receiver を構成し、既存の Redis 環境からメトリクスを ClickStack に送信する方法を説明します。

既存環境を設定する前に Redis メトリクス連携を試してみたい場合は、[次のセクション](#demo-dataset)で提供している事前設定済みのデモデータセットを使ってテストできます。

##### 前提条件 {#prerequisites}

- 稼働中の ClickStack インスタンス
- Redis の既存インストール（バージョン 3.0 以降）
- ClickStack から Redis へのネットワーク アクセス（デフォルトポート 6379）
- 認証を有効にしている場合の Redis パスワード

<VerticalStepper headerLevel="h4">

  #### Redis接続の確認 {#verify-redis}

  まず、Redisに接続できること、およびINFOコマンドが機能することを確認します：

  ```bash
  # 接続をテスト
  redis-cli ping
  # 期待される出力: PONG

  # INFOコマンドをテスト（メトリクスコレクターで使用）
  redis-cli INFO server
  # Redisサーバー情報が表示されるはずです
  ```

  Redisで認証が必要な場合：

  ```bash
  redis-cli -a <your-password> ping
  ```

  **一般的なRedisエンドポイント:**

  * **ローカルインストール**: `localhost:6379`
  * **Docker**: コンテナ名またはサービス名を指定します（例: `redis:6379`）
  * **リモート**: `<redis-host>:6379`

  #### カスタムOTel collector設定を作成する {#custom-otel}

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetryコレクター設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `redis-metrics.yaml` という名前のファイルを作成します：

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Redisで認証が必要な場合はコメントを解除してください
      # password: ${env:REDIS_PASSWORD}
      
      # 収集するメトリクスを設定してください
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

  この設定では:

  * `localhost:6379` 上の Redis に接続します（ご利用の環境に合わせてエンドポイントを調整してください）
  * 10秒ごとにメトリクスを収集します
  * 主要なパフォーマンスメトリクス（コマンド、クライアント、メモリ、キー空間の統計）を収集
  * [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service) に従い、**必須の `service.name` リソース属性を設定します**
  * 専用パイプライン経由でメトリクスを ClickHouse エクスポーターに送信します

  **収集される主要メトリクス:**

  * `redis.commands.processed` - 1秒あたりの処理済みコマンド数
  * `redis.clients.connected` - 接続中のクライアント数
  * `redis.clients.blocked` - ブロッキングコールでブロックされているクライアント数
  * `redis.memory.used` - Redis が使用しているメモリ（バイト単位）
  * `redis.memory.peak` - 最大メモリ使用量
  * `redis.keyspace.hits` - 成功したキー参照数
  * `redis.keyspace.misses` - キー検索の失敗数（キャッシュヒット率の算出に使用）
  * `redis.keys.expired` - 期限切れになったキー
  * `redis.keys.evicted` - メモリ不足により破棄されたキー数
  * `redis.connections.received` - 受信した接続の総数
  * `redis.connections.rejected` - 拒否された接続数

  :::note

  * カスタム設定では、新しい receiver、processor、pipeline のみを定義します
  * `memory_limiter` と `batch` の各 processor、および `clickhouse` exporter は、ベースの ClickStack 構成内ですでに定義されているため、名前を指定するだけで参照できます
  * `resource` プロセッサは、OpenTelemetry のセマンティック規約に従い、必須の `service.name` 属性を設定します
  * 認証付きの本番運用環境では、パスワードを環境変数 `${env:REDIS_PASSWORD}` に保存してください。
  * 必要に応じて `collection_interval` を調整します（デフォルトは 10s。値を小さくするとデータ量が増加します）
  * 複数の Redis インスタンスがある場合は、それらを区別するために `service.name` をカスタマイズしてください（例: `"redis-cache"`、`"redis-sessions"`）

  #### ClickStackにカスタム設定を読み込ませる {#load-custom}

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム構成ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします。
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定してください
  3. ClickStack と Redis 間のネットワーク接続を確保する

  ##### オプション1: Docker Compose {#docker-compose}

  ClickStackのデプロイメント設定を更新します:

  ```yaml
  services:
    clickstack:
      # ... 既存の設定 ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # オプション: Redis で認証が必要な場合
        # - REDIS_PASSWORD=your-redis-password
        # ... その他の環境変数 ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... その他のボリューム ...
      # Redis が同じ compose ファイル内にある場合:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # オプション: 認証を有効にする
      # command: redis-server --requirepass your-redis-password
  ```

  ##### オプション2：Docker run（オールインワンイメージ） {#all-in-one}

  `docker run`でオールインワンイメージを使用する場合：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **重要:** Redisが別のコンテナで実行されている場合は、Dockerネットワーキングを使用してください：

  ```bash
  # ネットワークを作成
  docker network create monitoring

  # ネットワーク上でRedisを実行
  docker run -d --name redis --network monitoring redis:7-alpine

  # 同じネットワーク上でClickStackを実行（設定ファイル内のエンドポイントを "redis:6379" に更新）
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDXでメトリクスを確認する {#verifying-metrics}

  設定完了後、HyperDXにログインし、メトリクスが正常に送信されていることを確認します：

  1. 「Metrics explorer」に移動します
  2. `redis.` で始まるメトリクス（例: `redis.commands.processed`, `redis.memory.used`）を検索します。
  3. 設定した収集間隔でメトリクスのデータポイントが表示されるはずです

  {/* <Image img={metrics_view} alt="Redis メトリクスビュー"/> */ }

</VerticalStepper>

## デモ用データセット {#demo-dataset}

本番環境を設定する前に Redis Metrics との連携をテストしたいユーザー向けに、現実的な Redis Metrics のパターンを含む、あらかじめ生成されたデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルのメトリクスデータセットをダウンロードする {#download-sample}

あらかじめ生成されたメトリクスファイル（現実的なパターンを含む 24 時間分の Redis Metrics）をダウンロードします:
```bash
# gauge メトリクス（メモリ、断片化率）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# sum メトリクス（コマンド、接続数、キー空間統計）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

このデータセットには、次のような現実的なパターンが含まれています:
- **キャッシュウォーミングイベント (06:00)** - ヒット率が 30% から 80% に上昇
- **トラフィックスパイク (14:30-14:45)** - 接続数が逼迫する形でトラフィックが 5 倍に急増
- **メモリプレッシャー (20:00)** - キーの削除（エビクション）とキャッシュ性能の低下
- **日次のトラフィックパターン** - 営業時間帯のピーク、夜間の減少、ランダムなマイクロスパイク

#### ClickStack を起動する {#start-clickstack}

ClickStack インスタンスを起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、およそ 30 秒待ちます。

#### ClickStack にメトリクスを読み込む {#load-metrics}

メトリクスを直接 ClickHouse に読み込みます:
```bash
# gauge メトリクス（メモリ、断片化）を読み込む
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# sum メトリクス（コマンド、接続数、キー空間）を読み込む
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX でメトリクスを検証する {#verify-metrics}

読み込みが完了したら、メトリクスを確認する最も手早い方法は、あらかじめ用意されたダッシュボードを利用することです。

[Dashboards and visualization](#dashboards) セクションに進み、ダッシュボードをインポートして、すべての Redis Metrics を一度に表示します。

:::note
デモ用データセットのタイムレンジは 2025-10-20 00:00:00 から 2025-10-21 05:00:00 です。HyperDX 側のタイムレンジがこの期間に一致していることを確認してください。

次のような興味深いパターンに注目してください:
- **06:00** - キャッシュウォーミング（低いヒット率が上昇していく）
- **14:30-14:45** - トラフィックスパイク（クライアント接続数の急増と一部の拒否）
- **20:00** - メモリプレッシャー（キーの削除が発生し始める）
:::

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で Redis の監視を始めるにあたり、Redis Metrics 用の基本的な可視化ダッシュボードを提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> {#download}

#### 用意済みダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダーのメニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `redis-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化が事前設定された状態で作成されます。

<Image img={example_dashboard} alt="Redis Metrics ダッシュボード"/>

:::note
デモデータセットの場合は、タイムレンジを **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトではタイムレンジが指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}

環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` が正しく設定されていることを確認してください。

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルが `/etc/otelcol-contrib/custom.config.yaml` にマウントされていることを確認します。

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

カスタム設定の内容を表示して、正しく読み取れることを確認します：

```bash
docker exec <コンテナ名> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にメトリクスが表示されない {#no-metrics}

collector から Redis にアクセスできることを確認してください：

```bash
# ClickStackコンテナから
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# 期待される出力: PONG
```

Redis の INFO コマンドが正常に動作することを確認します:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Redisの統計情報が表示されるはずです
```

有効な設定に Redis レシーバーが含まれていることを確認します。

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

コレクターのログにエラーが出ていないか確認してください：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# 接続エラーまたは認証失敗を確認します
```

### 認証エラー {#auth-errors}

ログに認証エラーが表示されている場合:

```bash
# Redisが認証を要求することを確認する
redis-cli CONFIG GET requirepass

# 認証をテストする
redis-cli -a <password> ping

# ClickStack環境でパスワードが設定されていることを確認する
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

パスワードを使用するように構成を更新します。

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```

### ネットワーク接続の問題 {#network-issues}

ClickStack が Redis に接続できない場合:

```bash
# 両方のコンテナが同じネットワーク上にあるか確認
docker network inspect <network-name>

# 接続性をテスト
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Docker Compose ファイルまたは `docker run` コマンドで、両方のコンテナが同一のネットワーク上に置かれるように構成してください。

## 次のステップ {#next-steps}

さらに踏み込んで試してみたい場合は、監視について次のことに取り組んでみてください：

- 重要なメトリクス（メモリ使用量のしきい値、接続数の上限、キャッシュヒット率の低下）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（レプリケーション遅延、永続化パフォーマンス）向けの追加ダッシュボードを作成する
- 異なるエンドポイントやサービス名で `receiver` 設定を複製し、複数の Redis インスタンスを監視する