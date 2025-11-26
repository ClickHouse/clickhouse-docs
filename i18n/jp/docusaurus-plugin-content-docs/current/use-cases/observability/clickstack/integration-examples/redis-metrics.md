---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'ClickStack を使用した Redis メトリクスの監視'
sidebar_label: 'Redis メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Redis メトリクスの監視'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使った Redis メトリクスの監視 {#redis-metrics-clickstack}

:::note[概要]
このガイドでは、OpenTelemetry collector の Redis receiver を設定して、ClickStack で Redis のパフォーマンス メトリクスを監視する方法を説明します。次の内容を学びます:

- Redis メトリクスを収集するように OTel collector を設定する
- カスタム設定を適用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って Redis のパフォーマンス（commands/sec、メモリ使用量、接続クライアント数、キャッシュ性能）を可視化する

本番環境の Redis を設定する前に連携をテストしたい場合は、サンプル メトリクスを含むデモ データセットを利用できます。

所要時間: 5〜10 分
:::



## 既存のRedisとの統合 {#existing-redis}

このセクションでは、ClickStack OTel collectorにRedisレシーバーを設定し、既存のRedisインストールからClickStackへメトリクスを送信する方法について説明します。

既存のセットアップを設定する前にRedisメトリクス統合をテストする場合は、[次のセクション](#demo-dataset)の事前設定済みデモデータセットを使用してテストできます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働中であること
- 既存のRedisインストール(バージョン3.0以降)
- ClickStackからRedisへのネットワークアクセス(デフォルトポート6379)
- 認証が有効な場合、Redisパスワード

<VerticalStepper headerLevel="h4">

#### Redis接続の確認 {#verify-redis}


まず、Redis に接続できることと、`INFO` コマンドが動作することを確認してください。

```bash
# 接続をテスト
redis-cli ping
# 期待される出力: PONG
```


# INFO コマンドのテスト（metrics collector が使用する）

redis-cli INFO server

# Redis サーバー情報が表示されるはずです

````

Redisで認証が必要な場合:
```bash
redis-cli -a <your-password> ping
````

**一般的な Redis エンドポイント:**

* **ローカルインストール**: `localhost:6379`
* **Docker**: コンテナ名またはサービス名を使用 (例: `redis:6379`)
* **リモート**: `<redis-host>:6379`

#### カスタム OTel collector 設定を作成する

ClickStack では、カスタム設定ファイルをマウントし、環境変数を設定することで、ベースの OpenTelemetry collector の設定を拡張できます。カスタム設定は、HyperDX が OpAMP 経由で管理するベース設定とマージされます。

次の設定内容で `redis-metrics.yaml` という名前のファイルを作成します:

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

この構成は次のことを行います:

* `localhost:6379` 上の Redis に接続します（環境に合わせてエンドポイントを調整してください）
* 10秒ごとにメトリクスを収集します
* 主要なパフォーマンスメトリクス（コマンド、クライアント、メモリ、キー空間統計）を収集します
* [OpenTelemetry セマンティック規約](https://opentelemetry.io/docs/specs/semconv/resource/#service) に従って、必須の `service.name` リソース属性を**設定します**
* 専用のパイプライン経由でメトリクスを ClickHouse エクスポーターにルーティングします

**収集される主なメトリクス:**

* `redis.commands.processed` - 1秒あたりに処理されたコマンド数
* `redis.clients.connected` - 接続されているクライアント数
* `redis.clients.blocked` - ブロッキング呼び出しでブロックされているクライアント数
* `redis.memory.used` - Redis が使用しているメモリ（バイト数）
* `redis.memory.peak` - メモリ使用量のピーク値
* `redis.keyspace.hits` - 成功したキー検索回数
* `redis.keyspace.misses` - 失敗したキー検索回数（キャッシュヒット率の計算に使用）
* `redis.keys.expired` - 期限切れになったキーの数
* `redis.keys.evicted` - メモリ圧迫により削除されたキーの数
* `redis.connections.received` - 受信した接続の総数
* `redis.connections.rejected` - 拒否された接続数

:::note

* カスタム設定では、新しい receiver、processor、pipeline のみを定義します
* `memory_limiter` および `batch` processor と `clickhouse` exporter は、ベースの ClickStack 設定ですでに定義されているため、名前で参照するだけで済みます
* `resource` processor は、OpenTelemetry セマンティック規約に従って必須の `service.name` 属性を設定します
* 認証を有効にした本番環境では、パスワードを環境変数 `${env:REDIS_PASSWORD}` に保存してください
* ニーズに応じて `collection_interval` を調整してください（デフォルトは 10 秒。値を小さくするとデータ量が増加します）
* 複数の Redis インスタンスがある場合は、それらを区別できるように `service.name` をカスタマイズしてください（例: `"redis-cache"`, `"redis-sessions"`）
  :::

#### カスタム設定を読み込むように ClickStack を構成する

既存の ClickStack デプロイメントでカスタム collector の設定を有効にするには、次を実行する必要があります:

1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します
3. ClickStack と Redis 間のネットワーク接続を確保します

##### オプション 1: Docker Compose

ClickStack のデプロイメント構成を更新します:

```yaml
services:
  clickstack:
    # ... 既存の設定 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # オプション: Redisで認証が必要な場合
      # - REDIS_PASSWORD=your-redis-password
      # ... その他の環境変数 ...
    volumes:
      - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... その他のボリューム ...
    # Redisが同じcomposeファイル内にある場合:
    depends_on:
      - redis
```


redis:
image: redis:7-alpine
ports:

* &quot;6379:6379&quot;

# オプション: 認証を有効化

# コマンド例: redis-server --requirepass your-redis-password

````

##### オプション2: Docker run（オールインワンイメージ）{#all-in-one}

`docker run`でオールインワンイメージを使用する場合：
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````


**重要:** Redis が別のコンテナで動作している場合は、Docker のネットワーク機能を使用してください。

```bash
# ネットワークを作成する
docker network create monitoring
```


# ネットワーク上で Redis を起動する
docker run -d --name redis --network monitoring redis:7-alpine



# 同じネットワーク上で ClickStack を実行する（設定ファイル内のエンドポイントを &quot;redis:6379&quot; に更新）

docker run --name clickstack \
--network monitoring \
-p 8080:8080 -p 4317:4317 -p 4318:4318 \
-e CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml \
-v &quot;$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro&quot; \
docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest

```

#### HyperDXでメトリクスを確認する {#verifying-metrics}

設定完了後、HyperDXにログインしてメトリクスが正常に送信されていることを確認します：

1. Metricsエクスプローラーに移動します
2. `redis.`で始まるメトリクスを検索します（例：`redis.commands.processed`、`redis.memory.used`）
3. 設定した収集間隔でメトリクスデータポイントが表示されます

<!-- <Image img={metrics_view} alt="Redisメトリクスビュー"/> -->

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番環境を構成する前にRedis Metricsインテグレーションをテストしたいユーザー向けに、実際のRedis Metricsパターンを含む事前生成済みデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットをダウンロードする {#download-sample}


あらかじめ生成されたメトリクスファイル（現実的なパターンを含む、Redis の 24 時間分のメトリクス）をダウンロードします:

```bash
# ゲージメトリクス（メモリ、断片化率）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv
```


# 合計メトリクス（コマンド数、接続数、キースペース統計）のダウンロード

curl -O [https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv)

````

データセットには以下の現実的なパターンが含まれています:
- **キャッシュウォーミングイベント (06:00)** - ヒット率が30%から80%に上昇
- **トラフィックスパイク (14:30-14:45)** - 5倍のトラフィック急増による接続負荷
- **メモリ負荷 (20:00)** - キーの削除とキャッシュパフォーマンスの低下
- **日次トラフィックパターン** - 営業時間帯のピーク、夕方の減少、ランダムなマイクロスパイク

#### ClickStackの起動                    

ClickStackインスタンスを起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

ClickStack が完全に起動するまで、約 30 秒待ちます。

#### ClickStack にメトリクスを読み込む


メトリクスを直接 ClickHouse に取り込みます:

```bash
# ゲージメトリクス（メモリ、断片化）をロードする
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 合計メトリクス（commands、connections、keyspace）を読み込む

cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### HyperDXでメトリクスを確認する {#verify-metrics}

読み込みが完了したら、メトリクスを確認する最も迅速な方法は、事前構築済みのダッシュボードを使用することです。

[ダッシュボードと可視化](#dashboards)セクションに進み、ダッシュボードをインポートしてすべてのRedisメトリクスを一度に表示してください。

:::note
デモデータセットの時間範囲は2025-10-20 00:00:00から2025-10-21 05:00:00です。HyperDXの時間範囲がこの期間と一致していることを確認してください。

以下の注目すべきパターンを確認してください:
- **06:00** - キャッシュウォーミング(低いヒット率が上昇中)
- **14:30-14:45** - トラフィックスパイク(クライアント接続数が高く、一部接続拒否が発生)
- **20:00** - メモリ圧迫(キーの削除が開始)
:::

</VerticalStepper>
```


## ダッシュボードと可視化 {#dashboards}

ClickStack を使って Redis の監視を始めやすくするために、Redis Metrics 用の基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定ファイル {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、［Dashboards］セクションに移動します
2. 右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `redis-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={example_dashboard} alt="Redis Metrics ダッシュボード"/>

:::note
デモ用データセットでは、時間範囲を **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートしたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>



## トラブルシューティング

### カスタム設定が読み込まれない

環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` が正しく設定されていることを確認してください。

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム構成ファイルが `/etc/otelcol-contrib/custom.config.yaml` にマウントされていることを確認します。

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

カスタム設定の内容を表示し、問題なく読み取れることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にメトリクスが表示されない場合


コレクターから Redis にアクセス可能であることを確認します：

```bash
# ClickStack コンテナから実行
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# 期待される出力：PONG
```


Redis の INFO コマンドが動作するか確認します。

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Redis統計情報が表示されます
```

実際の設定に Redis レシーバーが含まれていることを確認してください。

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```


コレクターのログにエラーがないか確認します。

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# 接続エラーまたは認証失敗を確認します
```

### 認証エラー


ログに認証エラーが記録されている場合：

```bash
# Redis が認証を必要とすることを確認
redis-cli CONFIG GET requirepass
```


# 認証のテスト

redis-cli -a <password> ping


# ClickStack環境でパスワードが設定されていることを確認

docker exec <clickstack-container> printenv REDIS_PASSWORD

````

パスワードを使用するように設定を更新します：
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
````

### ネットワーク接続の問題 {#network-issues}


ClickStack から Redis へ接続できない場合：

```bash
# 両方のコンテナが同じネットワーク上にあるか確認
docker network inspect <network-name>
```


# 接続性のテスト

docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379

```

Docker Composeファイルまたは`docker run`コマンドにおいて、両方のコンテナが同一ネットワーク上に配置されていることを確認してください。

```


## 次のステップ {#next-steps}

さらに深く検証したい場合は、モニタリングについて次のステップを試してみてください。

- 重要なメトリクス（メモリ使用量のしきい値、接続数の上限、キャッシュヒット率の低下）向けの[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（レプリケーション遅延、永続化パフォーマンス）向けの追加ダッシュボードを作成する
- 異なるエンドポイントとサービス名でレシーバー設定を複製し、複数の Redis インスタンスを監視する