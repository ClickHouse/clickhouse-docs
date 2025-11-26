---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'ClickStack を用いた PostgreSQL メトリクス監視'
sidebar_label: 'PostgreSQL メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いた PostgreSQL メトリクス監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'メトリクス', 'OTel', 'ClickStack', 'データベース監視']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した PostgreSQL メトリクスの監視 {#postgres-metrics-clickstack}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector の PostgreSQL receiver を設定して、ClickStack で PostgreSQL のパフォーマンスメトリクスを監視する方法を説明します。次のことを学びます。

- PostgreSQL メトリクスを収集するように OTel collector を構成する
- カスタム構成で ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して PostgreSQL のパフォーマンス（トランザクション、接続数、データベースサイズ、キャッシュヒット率）を可視化する

本番環境の PostgreSQL データベースを設定する前に連携をテストしたい場合は、サンプルメトリクスを含むデモデータセットを利用できます。

所要時間: 10〜15 分
:::



## 既存の PostgreSQL との統合 {#existing-postgres}

このセクションでは、ClickStack の OTel collector に PostgreSQL receiver を設定することで、既存の PostgreSQL 環境から ClickStack にメトリクスを送信するための構成方法を説明します。

独自の既存環境を設定する前に PostgreSQL メトリクス連携を試したい場合は、[次のセクション](#demo-dataset)にある事前設定済みのデモデータセットでテストできます。

##### 前提条件 {#prerequisites}
- ClickStack インスタンスが起動していること
- 既存の PostgreSQL インストール（バージョン 9.6 以降）
- ClickStack から PostgreSQL へのネットワーク アクセス（デフォルト ポート 5432）
- 適切な権限を持つ PostgreSQL 監視ユーザー

<VerticalStepper headerLevel="h4">

#### 監視ユーザーに必要な権限があることを確認する {#monitoring-permissions}

PostgreSQL receiver には、統計ビューへの読み取りアクセス権を持つユーザーが必要です。監視ユーザーに `pg_monitor` ロールを付与します:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### カスタム OTel collector 設定を作成する {#create-custom-config}

ClickStack では、カスタム設定ファイルをマウントし、環境変数を設定することで、ベースの OpenTelemetry collector 設定を拡張できます。

`postgres-metrics.yaml` を作成します:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # Replace with your actual database names
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
`tls: insecure: true` 設定は、開発／テスト用途で SSL 検証を無効にします。SSL が有効な本番 PostgreSQL 環境では、この行を削除するか、適切な証明書を設定してください。
:::

#### カスタム設定で ClickStack をデプロイする {#deploy-clickstack}

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

#### メトリクス収集を確認する {#verify-metrics}

設定が完了したら、HyperDX にログインしてメトリクスが送信されていることを確認します:

1. Metrics explorer に移動する
2. `postgresql.` で始まるメトリクスを検索する（例: `postgresql.backends`, `postgresql.commits`）
3. 設定した収集間隔でメトリクスのデータポイントが表示されるはずです

メトリクスの送信が確認できたら、事前構築済みダッシュボードをインポートするために [Dashboards and visualization](#dashboards) セクションに進んでください。

</VerticalStepper>



## デモデータセット {#demo-dataset}

本番環境を構成する前にPostgreSQLメトリクス統合をテストしたい場合、実際のPostgreSQLメトリクスパターンを含む事前生成済みデータセットを提供しています。

:::note[データベースレベルのメトリクスのみ]
このデモデータセットには、サンプルデータを軽量に保つため、データベースレベルのメトリクスのみが含まれています。テーブルおよびインデックスのメトリクスは、実際のPostgreSQLデータベースを監視する際に自動的に収集されます。
:::

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットのダウンロード {#download-sample}

事前生成済みのメトリクスファイル（実際のパターンを含む24時間分のPostgreSQLメトリクス）をダウンロードします：


```bash
# ゲージメトリクス（接続数、データベースサイズ）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# 合計メトリクス（コミット、ロールバック、オペレーション）のダウンロード

curl -O [https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv)

````

データセットには現実的なパターンが含まれています:
- **朝の接続スパイク (08:00)** - ログインラッシュ
- **キャッシュパフォーマンスの問題 (11:00)** - Blocks_readのスパイク
- **アプリケーションのバグ (14:00-14:30)** - ロールバック率が15%に急増
- **デッドロックインシデント (14:15, 16:30)** - 稀なデッドロック

#### ClickStackの起動                    

ClickStackインスタンスを起動します:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

ClickStack が完全に起動するまで、約 30 秒待機します。

#### メトリクスを ClickStack に読み込む

メトリクスを直接 ClickHouse に読み込みます。


```bash
# ゲージメトリクスをロードする
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 合計メトリクスを読み込む

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### HyperDXでメトリクスを確認する {#verify-metrics-demo}

読み込みが完了したら、メトリクスを確認する最も迅速な方法は、事前構築済みのダッシュボードを使用することです。

[ダッシュボードと可視化](#dashboards)セクションに進み、ダッシュボードをインポートして、複数のPostgreSQLメトリクスを一度に表示してください。

:::note[タイムゾーン表示]
HyperDXは、ブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの範囲は**2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**です。場所に関係なくデモメトリクスを確実に表示するには、時間範囲を**2025-11-09 00:00:00 - 2025-11-12 00:00:00**に設定してください。メトリクスが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

</VerticalStepper>
```


## ダッシュボードと可視化 {#dashboards}

ClickStack で PostgreSQL の監視を始めやすくするために、PostgreSQL メトリクス向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> する {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します
2. 画面右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `postgres-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={example_dashboard} alt="PostgreSQL メトリクスダッシュボード"/>

:::note
デモデータセットでは、タイムレンジを **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトではタイムレンジが指定されていません。
:::

</VerticalStepper>



## トラブルシューティング

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム構成ファイルがマウントされていることを確認します:

```bash
docker exec <コンテナ名> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にメトリクスが表示されない場合

PostgreSQL に正常に接続できるか確認します:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel collector のログを確認する：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### 認証エラー

パスワードが正しく設定されていることを確認してください。

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

認証情報を直接テストする：

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 次のステップ {#next-steps}

PostgreSQL メトリクス監視の設定が完了したら、次の手順に進みます。

- 重要な閾値（接続数の上限、高いロールバック率、低いキャッシュヒット率）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- `pg_stat_statements` 拡張機能でクエリレベルの監視を有効化する
- 異なるエンドポイントとサービス名を用いて receiver の設定を複製し、複数の PostgreSQL インスタンスを監視する



## 本番運用 {#going-to-production}

このガイドでは、ClickStack に組み込まれている OpenTelemetry Collector を利用したクイックセットアップ方法を説明します。本番環境で運用する場合は、独自の OTel collector を稼働させ、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番向けの構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
