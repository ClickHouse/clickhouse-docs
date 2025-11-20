---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'ClickStack を用いた PostgreSQL メトリクスの監視'
sidebar_label: 'PostgreSQL メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いた PostgreSQL メトリクスの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'metrics', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるPostgreSQLメトリクスの監視 {#postgres-metrics-clickstack}

:::note[TL;DR]
本ガイドでは、OpenTelemetryコレクターのPostgreSQLレシーバーを設定し、ClickStackを使用してPostgreSQLのパフォーマンスメトリクスを監視する方法を説明します。以下の内容を学習できます:

- PostgreSQLメトリクスを収集するためのOTelコレクターの設定
- カスタム設定を使用したClickStackのデプロイ
- 事前構築されたダッシュボードを使用したPostgreSQLパフォーマンス(トランザクション、接続、データベースサイズ、キャッシュヒット率)の可視化

本番環境のPostgreSQLデータベースを設定する前に統合をテストする場合は、サンプルメトリクスを含むデモデータセットが利用可能です。

所要時間:10〜15分
:::


## 既存のPostgreSQLとの統合 {#existing-postgres}

このセクションでは、ClickStack OTelコレクターにPostgreSQLレシーバーを設定することで、既存のPostgreSQLインストールからClickStackへメトリクスを送信する方法について説明します。

既存のセットアップを設定する前にPostgreSQLメトリクス統合をテストしたい場合は、[次のセクション](#demo-dataset)の事前設定済みデモデータセットを使用できます。

##### 前提条件 {#prerequisites}

- 実行中のClickStackインスタンス
- 既存のPostgreSQLインストール(バージョン9.6以降)
- ClickStackからPostgreSQLへのネットワークアクセス(デフォルトポート5432)
- 適切な権限を持つPostgreSQL監視ユーザー

<VerticalStepper headerLevel="h4">

#### 監視ユーザーに必要な権限があることを確認 {#monitoring-permissions}

PostgreSQLレシーバーには、統計ビューへの読み取りアクセス権を持つユーザーが必要です。監視ユーザーに`pg_monitor`ロールを付与してください:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### カスタムOTelコレクター設定の作成 {#create-custom-config}

ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetryコレクター設定を拡張できます。

`postgres-metrics.yaml`を作成します:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # 実際のデータベース名に置き換えてください
    collection_interval: 30s
    tls:
      insecure: true

processors:
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://localhost:9000
    database: default
    ttl: 96h

service:
  pipelines:
    metrics/postgres:
      receivers: [postgresql]
      processors: [resourcedetection, batch]
      exporters: [clickhouse]
```

:::note
`tls: insecure: true`設定は、開発/テスト環境でSSL検証を無効にします。SSLが有効な本番環境のPostgreSQLでは、この行を削除するか、適切な証明書を設定してください。
:::

#### カスタム設定でClickStackをデプロイ {#deploy-clickstack}

カスタム設定をマウントします:

```bash
docker run -d \
  --name clickstack-postgres \
  -p 8123:8123 -p 9000:9000 -p 4317:4317 -p 4318:4318 \
  -e HYPERDX_API_KEY=your-api-key \
  -e CLICKHOUSE_PASSWORD=your-clickhouse-password \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack:latest
```

#### メトリクス収集の検証 {#verify-metrics}

設定完了後、HyperDXにログインしてメトリクスが送信されていることを確認します:

1. メトリクスエクスプローラーに移動
2. postgresql.で始まるメトリクスを検索(例: postgresql.backends、postgresql.commits)
3. 設定した収集間隔でメトリクスデータポイントが表示されます

メトリクスの送信が確認できたら、[ダッシュボードと可視化](#dashboards)セクションに進んで、事前構築済みダッシュボードをインポートしてください。

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番環境を構成する前にPostgreSQLメトリクス統合をテストしたいユーザー向けに、実際のPostgreSQLメトリクスパターンを含む事前生成済みデータセットを提供しています。

:::note[データベースレベルのメトリクスのみ]
このデモデータセットには、サンプルデータを軽量に保つため、データベースレベルのメトリクスのみが含まれています。テーブルおよびインデックスのメトリクスは、実際のPostgreSQLデータベースを監視する際に自動的に収集されます。
:::

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットのダウンロード {#download-sample}

事前生成済みのメトリクスファイル(実際のパターンを含む24時間分のPostgreSQLメトリクス)をダウンロードします:


```bash
# ゲージメトリクス（接続数、データベースサイズ）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# 合計メトリクスのダウンロード（コミット、ロールバック、操作）

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv

````

データセットには以下のような実際の運用パターンが含まれています：
- **朝の接続スパイク（08:00）** - ログインラッシュ
- **キャッシュパフォーマンスの問題（11:00）** - Blocks_readのスパイク
- **アプリケーションのバグ（14:00-14:30）** - ロールバック率が15%に急増
- **デッドロックインシデント（14:15、16:30）** - 稀なデッドロック

#### ClickStackの起動 {#start-clickstack}

ClickStackインスタンスを起動します：

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

ClickStackが完全に起動するまで約30秒待機します。

#### ClickStackへのメトリクスの読み込み {#load-metrics}

メトリクスをClickHouseに直接読み込みます：


```bash
# ゲージメトリクスを読み込む
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 合計メトリクスを読み込む

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### HyperDXでメトリクスを確認する {#verify-metrics-demo}

読み込みが完了したら、事前構築されたダッシュボードを使用するのがメトリクスを確認する最も迅速な方法です。

[ダッシュボードと可視化](#dashboards)セクションに進んでダッシュボードをインポートし、複数のPostgreSQLメトリクスを一度に表示してください。

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**です。場所に関係なくデモメトリクスを確実に表示するには、時間範囲を**2025-11-09 00:00:00 - 2025-11-12 00:00:00**に設定してください。メトリクスが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

</VerticalStepper>
```


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したPostgreSQLの監視を開始できるよう、PostgreSQLメトリクスの重要な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### 事前構築されたダッシュボードをインポート {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します
2. 右上隅の省略記号の下にある**Import Dashboard**をクリックします

<Image img={import_dashboard} alt='ダッシュボードのインポートボタン' />

3. `postgres-metrics-dashboard.json`ファイルをアップロードし、**Finish Import**をクリックします

<Image img={finish_import} alt='インポート完了ダイアログ' />

#### ダッシュボードを表示 {#created-dashboard}

すべての可視化が事前設定された状態でダッシュボードが作成されます:

<Image img={example_dashboard} alt='PostgreSQLメトリクスダッシュボード' />

:::note
デモデータセットの場合、時間範囲を**2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**に設定してください(ローカルタイムゾーンに基づいて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}

環境変数が設定されているか確認してください:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされているか確認してください:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDXにメトリクスが表示されない {#no-metrics}

PostgreSQLにアクセス可能か確認してください:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel Collectorのログを確認してください:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### 認証エラー {#auth-errors}

パスワードが正しく設定されているか確認してください:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

認証情報を直接テストしてください:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 次のステップ {#next-steps}

PostgreSQLメトリクス監視を設定した後:

- 重要なしきい値（接続数上限、高いロールバック率、低いキャッシュヒット率）に対して[アラート](/use-cases/observability/clickstack/alerts)を設定する
- `pg_stat_statements`拡張機能でクエリレベルの監視を有効にする
- 異なるエンドポイントとサービス名でレシーバー設定を複製し、複数のPostgreSQLインスタンスを監視する


## 本番環境への移行 {#going-to-production}

本ガイドでは、迅速なセットアップのためにClickStackの組み込みOpenTelemetry Collectorを拡張する方法を説明しています。本番環境へのデプロイでは、独自のOTel Collectorを実行し、ClickStackのOTLPエンドポイントにデータを送信することを推奨します。本番環境の構成については、[OpenTelemetryデータの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。
