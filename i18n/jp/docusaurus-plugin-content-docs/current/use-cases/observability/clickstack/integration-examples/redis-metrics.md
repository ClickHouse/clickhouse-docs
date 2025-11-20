---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'ClickStack を使った Redis メトリクスの監視'
sidebar_label: 'Redis メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使った Redis メトリクスの監視'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるRedisメトリクスの監視 {#redis-metrics-clickstack}

:::note[TL;DR]
本ガイドでは、OpenTelemetryコレクターのRedisレシーバーを設定し、ClickStackを使用してRedisのパフォーマンスメトリクスを監視する方法を説明します。以下の内容を学習できます:

- OTelコレクターを設定してRedisメトリクスを収集する
- カスタム設定でClickStackをデプロイする
- 事前構築されたダッシュボードを使用してRedisのパフォーマンスを可視化する(コマンド数/秒、メモリ使用量、接続クライアント数、キャッシュパフォーマンス)

本番環境のRedisを設定する前に統合をテストする場合は、サンプルメトリクスを含むデモデータセットが利用可能です。

所要時間:5〜10分
:::


## 既存のRedisとの統合 {#existing-redis}

このセクションでは、ClickStack OTelコレクターにRedisレシーバーを設定し、既存のRedisインストールからClickStackへメトリクスを送信する方法について説明します。

既存のセットアップを設定する前にRedisメトリクス統合をテストする場合は、[次のセクション](#demo-dataset)の事前設定済みデモデータセットを使用できます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働中であること
- 既存のRedisインストール（バージョン3.0以降）
- ClickStackからRedisへのネットワークアクセス（デフォルトポート6379）
- 認証が有効な場合、Redisパスワード

<VerticalStepper headerLevel="h4">

#### Redis接続の確認 {#verify-redis}


まず、Redis に接続できることと、`INFO` コマンドが正しく動作することを確認します。

```bash
# 接続をテスト
redis-cli ping
# 期待される出力：PONG
```


# INFO コマンドのテスト（メトリクスコレクターで使用）

redis-cli INFO server

# Redis サーバー情報が表示されます

````

Redis で認証が必要な場合：
```bash
redis-cli -a <your-password> ping
````

**一般的な Redis エンドポイント：**

- **ローカルインストール**: `localhost:6379`
- **Docker**: コンテナ名またはサービス名を使用（例：`redis:6379`）
- **リモート**: `<redis-host>:6379`

#### カスタム OTel コレクター設定の作成 {#custom-otel}

ClickStack では、カスタム設定ファイルをマウントして環境変数を設定することで、ベースの OpenTelemetry コレクター設定を拡張できます。カスタム設定は、HyperDX が OpAMP 経由で管理するベース設定とマージされます。

以下の設定で `redis-metrics.yaml` という名前のファイルを作成します：

```yaml title="redis-metrics.yaml"
receivers:
  redis:
    endpoint: "localhost:6379"
    collection_interval: 10s
    # Redis で認証が必要な場合はコメントを解除
    # password: ${env:REDIS_PASSWORD}

    # 収集するメトリクスを設定
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

この設定の内容：

- `localhost:6379` の Redis に接続（環境に応じてエンドポイントを調整）
- 10 秒ごとにメトリクスを収集
- 主要なパフォーマンスメトリクスを収集（コマンド、クライアント、メモリ、キースペース統計）
- [OpenTelemetry セマンティック規約](https://opentelemetry.io/docs/specs/semconv/resource/#service)に従って**必須の `service.name` リソース属性を設定**
- 専用パイプライン経由でメトリクスを ClickHouse エクスポーターにルーティング

**収集される主要メトリクス：**

- `redis.commands.processed` - 1 秒あたりに処理されたコマンド数
- `redis.clients.connected` - 接続中のクライアント数
- `redis.clients.blocked` - ブロッキング呼び出しでブロックされているクライアント数
- `redis.memory.used` - Redis が使用しているメモリ（バイト単位）
- `redis.memory.peak` - ピークメモリ使用量
- `redis.keyspace.hits` - 成功したキー検索数
- `redis.keyspace.misses` - 失敗したキー検索数（キャッシュヒット率の計算用）
- `redis.keys.expired` - 期限切れになったキー数
- `redis.keys.evicted` - メモリ圧迫により退避されたキー数
- `redis.connections.received` - 受信した接続の総数
- `redis.connections.rejected` - 拒否された接続数

:::note

- カスタム設定では新しいレシーバー、プロセッサー、パイプラインのみを定義します
- `memory_limiter` および `batch` プロセッサーと `clickhouse` エクスポーターは、ベースの ClickStack 設定で既に定義されているため、名前で参照するだけです
- `resource` プロセッサーは、OpenTelemetry セマンティック規約に従って必須の `service.name` 属性を設定します
- 認証を使用する本番環境では、パスワードを環境変数に保存します：`${env:REDIS_PASSWORD}`
- 必要に応じて `collection_interval` を調整します（デフォルトは 10 秒。値を小さくするとデータ量が増加します）
- 複数の Redis インスタンスを使用する場合は、`service.name` をカスタマイズして区別します（例：`"redis-cache"`、`"redis-sessions"`）
  :::

#### カスタム設定を読み込むための ClickStack の設定 {#load-custom}

既存の ClickStack デプロイメントでカスタムコレクター設定を有効にするには、以下を行う必要があります：

1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウント
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定
3. ClickStack と Redis 間のネットワーク接続を確保

##### オプション 1：Docker Compose {#docker-compose}

ClickStack デプロイメント設定を更新します：

```yaml
services:
  clickstack:
    # ... 既存の設定 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # オプション：Redis で認証が必要な場合
      # - REDIS_PASSWORD=your-redis-password
      # ... その他の環境変数 ...
    volumes:
      - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... その他のボリューム ...
    # Redis が同じ compose ファイル内にある場合：
    depends_on:
      - redis
```


redis:
image: redis:7-alpine
ports:

* &quot;6379:6379&quot;

# オプション: 認証を有効化する

# command: redis-server --requirepass your-redis-password

````

##### オプション2: Docker run (オールインワンイメージ) {#all-in-one}

`docker run`でオールインワンイメージを使用する場合:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````


**重要:** Redis が別のコンテナで動作している場合は、Docker ネットワークを使用します:

```bash
# ネットワークを作成する
docker network create monitoring
```


# ネットワーク上で Redis を起動する
docker run -d --name redis --network monitoring redis:7-alpine



# 同じネットワーク上で ClickStack を実行する（設定ファイル内のエンドポイントを「redis:6379」に更新）

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

<!-- <Image img={metrics_view} alt="Redis Metrics view"/> -->

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番環境を構成する前にRedis Metricsインテグレーションをテストしたいユーザー向けに、実際のRedis Metricsパターンを含む事前生成済みデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットをダウンロード {#download-sample}


事前に生成されたメトリクスファイル（現実的なパターンを含む 24 時間分の Redis メトリクス）をダウンロードします：

```bash
# ゲージメトリクス（メモリ、断片化率）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv
```


# 合計メトリクスのダウンロード（コマンド、接続、キースペース統計）

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv

````

データセットには以下のような実際の運用パターンが含まれています：
- **キャッシュウォーミングイベント（06:00）** - ヒット率が30%から80%に上昇
- **トラフィックスパイク（14:30-14:45）** - トラフィックが5倍に急増し接続負荷が発生
- **メモリ負荷（20:00）** - キーの削除とキャッシュパフォーマンスの低下
- **日次トラフィックパターン** - 営業時間帯のピーク、夕方の減少、ランダムなマイクロスパイク

#### ClickStackの起動 {#start-clickstack}

ClickStackインスタンスを起動します：
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

ClickStackが完全に起動するまで約30秒待ちます。

#### ClickStackへのメトリクスの読み込み {#load-metrics}


メトリクスを直接 ClickHouse に読み込みます：

```bash
# ゲージメトリクス（メモリ、断片化）をロードする
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 合計メトリクスを読み込む（commands、connections、keyspace）

cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### HyperDXでメトリクスを確認する {#verify-metrics}

読み込みが完了したら、事前構築されたダッシュボードを使用してメトリクスを確認するのが最も迅速な方法です。

[ダッシュボードと可視化](#dashboards)セクションに進み、ダッシュボードをインポートしてすべてのRedisメトリクスを一度に表示してください。

:::note
デモデータセットの時間範囲は2025-10-20 00:00:00から2025-10-21 05:00:00です。HyperDXの時間範囲がこの期間と一致していることを確認してください。

以下の注目すべきパターンを確認してください:
- **06:00** - キャッシュウォーミング（低いヒット率が上昇）
- **14:30-14:45** - トラフィックスパイク（クライアント接続数の増加、一部接続拒否）
- **20:00** - メモリ圧迫（キーの退避が開始）
:::

</VerticalStepper>
```


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したRedisの監視を開始できるよう、Redis Metricsの重要な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### 事前構築済みダッシュボードのインポート {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します
2. 右上隅の省略記号メニューから**Import Dashboard**をクリックします

<Image img={import_dashboard} alt='ダッシュボードのインポートボタン' />

3. `redis-metrics-dashboard.json`ファイルをアップロードし、**Finish Import**をクリックします

<Image img={finish_import} alt='インポート完了ダイアログ' />

#### ダッシュボードの表示 {#created-dashboard}

すべての可視化が事前設定された状態でダッシュボードが作成されます:

<Image img={example_dashboard} alt='Redis Metricsダッシュボード' />

:::note
デモデータセットの場合、時間範囲を**2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)**に設定してください(ローカルタイムゾーンに応じて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}

環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` が正しく設定されているか確認してください:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルが `/etc/otelcol-contrib/custom.config.yaml` にマウントされているか確認してください:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

カスタム設定の内容を表示して、読み取り可能であることを確認してください:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にメトリクスが表示されない {#no-metrics}


コレクターから Redis にアクセスできることを確認します：

```bash
# ClickStack コンテナから
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# 期待される出力: PONG
```


Redis の `INFO` コマンドが動作するか確認します：

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Redis統計情報が表示されるはずです
```

有効な構成に Redis レシーバーが含まれていることを確認します：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```


コレクターログでエラーを確認します：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# 接続エラーまたは認証失敗を確認してください
```

### 認証エラー {#auth-errors}


ログに認証エラーが記録されている場合は、次を確認します。

```bash
# Redis が認証を必要とするか確認する
redis-cli CONFIG GET requirepass
```


# 認証をテストする

redis-cli -a <password> ping


# ClickStack環境でパスワードが設定されていることを確認

docker exec <clickstack-container> printenv REDIS_PASSWORD

````

パスワードを使用するように設定を更新してください：
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
````

### ネットワーク接続の問題 {#network-issues}


ClickStack が Redis に接続できない場合：

```bash
# 両方のコンテナが同じネットワーク上にあるか確認
docker network inspect <network-name>
```


# 接続性のテスト

docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379

```

Docker Composeファイルまたは`docker run`コマンドで、両方のコンテナが同じネットワーク上に配置されていることを確認してください。

```


## 次のステップ {#next-steps}

モニタリングをさらに試してみたい場合は、以下の手順を参考にしてください：

- 重要なメトリクスに対して[アラート](/use-cases/observability/clickstack/alerts)を設定する（メモリ使用量の閾値、接続数の上限、キャッシュヒット率の低下など）
- 特定のユースケースに応じた追加のダッシュボードを作成する（レプリケーション遅延、永続化パフォーマンスなど）
- 異なるエンドポイントとサービス名でレシーバー設定を複製し、複数のRedisインスタンスをモニタリングする
