---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'ClickStack による PostgreSQL メトリクスの監視'
sidebar_label: 'PostgreSQL メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack による PostgreSQL メトリクスの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'メトリクス', 'OTEL', 'ClickStack', 'データベース監視']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# ClickStack を使用した PostgreSQL メトリクスの監視 \{#postgres-metrics-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector の PostgreSQL receiver を構成し、ClickStack で PostgreSQL のパフォーマンスメトリクスを監視する方法を説明します。次のことを学べます:

- PostgreSQL メトリクスを収集するように OTel collector を構成する
- カスタム設定を適用した ClickStack をデプロイする
- 事前構築済みのダッシュボードを使用して PostgreSQL のパフォーマンス（トランザクション、接続数、データベースサイズ、キャッシュヒット率）を可視化する

本番環境の PostgreSQL データベースを設定する前にインテグレーションをテストしたい場合のために、サンプルメトリクスを含むデモデータセットも利用できます。

所要時間: 10〜15 分
:::

## 既存の PostgreSQL との統合 \{#existing-postgres\}

このセクションでは、PostgreSQL レシーバーを用いて ClickStack の OTel collector を構成し、既存の PostgreSQL 環境から ClickStack へメトリクスを送信できるようにする方法を説明します。

お使いの既存環境を構成する前に PostgreSQL メトリクス連携を試してみたい場合は、[次のセクション](#demo-dataset)の事前構成済みデモデータセットを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 既存の PostgreSQL インストール（バージョン 9.6 以降）
- ClickStack から PostgreSQL へのネットワークアクセス（デフォルトポート 5432）
- 適切な権限を持つ PostgreSQL 監視ユーザー

<VerticalStepper headerLevel="h4">

#### 監視ユーザーに必要な権限が付与されていることを確認する \{#monitoring-permissions\}

PostgreSQL receiver には、統計ビューへの読み取りアクセス権を持つユーザーが必要です。監視ユーザーに `pg_monitor` ロールを付与します:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### カスタム OTel collector 設定を作成する \{#create-custom-config\}

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
`tls: insecure: true` 設定は、開発／テスト用途で SSL 検証を無効化します。SSL が有効な本番環境の PostgreSQL では、この行を削除するか、適切な証明書を設定してください。
:::

#### カスタム設定を用いて ClickStack をデプロイする \{#deploy-clickstack\}

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

#### メトリクス収集を検証する \{#verify-metrics\}

設定後、HyperDX にログインしてメトリクスが流れていることを確認します:

1. Metrics explorer に移動します
2. `postgresql.` で始まるメトリクスを検索します（例: `postgresql.backends`, `postgresql.commits`）
3. 設定した収集間隔でメトリクスのデータポイントが表示されるはずです

メトリクスが流れていることを確認できたら、事前構築済みダッシュボードをインポートするために [Dashboards and visualization](#dashboards) セクションに進みます。

</VerticalStepper>

## デモ用データセット \{#demo-dataset\}

本番環境を設定する前に PostgreSQL メトリクス連携をテストしたいユーザー向けに、実運用に近い PostgreSQL メトリクスパターンを含む、あらかじめ生成されたデータセットを提供します。

:::note[データベースレベルのメトリクスのみ]
このデモ用データセットには、サンプルデータを軽量に保つため、データベースレベルのメトリクスのみが含まれます。実際の PostgreSQL データベースを監視する際には、テーブルおよび索引のメトリクスは自動的に収集されます。
:::

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットをダウンロードする \{#download-sample\}

あらかじめ生成されたメトリクスファイル（実運用に近いパターンを持つ 24 時間分の PostgreSQL メトリクス）をダウンロードします:

```bash
# ゲージメトリクス（接続数、データベースサイズ）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# 積算メトリクス（コミット、ロールバック、各種操作）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

このデータセットには、以下のような実運用に近いパターンが含まれます:
- **午前の接続スパイク (08:00)** - ログインの集中
- **キャッシュ性能の問題 (11:00)** - Blocks_read のスパイク
- **アプリケーションのバグ (14:00-14:30)** - ロールバック率が 15% までスパイク
- **デッドロック発生 (14:15, 16:30)** - 稀なデッドロック

#### ClickStack を起動する \{#start-clickstack\}

ClickStack インスタンスを起動します:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、約 30 秒待機してください。

#### メトリクスを ClickStack に読み込む \{#load-metrics\}

メトリクスを ClickHouse に直接読み込みます:

```bash
# ゲージメトリクスをロード
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 積算メトリクスをロード
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX でメトリクスを確認する \{#verify-metrics-demo\}

読み込みが完了したら、メトリクスを確認する最も手軽な方法は、あらかじめ用意されたダッシュボードを利用することです。

[Dashboards and visualization](#dashboards) セクションに進み、ダッシュボードをインポートして、多数の PostgreSQL メトリクスをまとめて表示します。

:::note[タイムゾーンの表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** の期間をカバーしています。場所に依存せずデモメトリクスを必ず表示できるよう、タイムレンジを **2025-11-09 00:00:00 - 2025-11-12 00:00:00** に設定してください。メトリクスが確認できたら、可視化を見やすくするためにレンジを 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で PostgreSQL の監視を開始するにあたって、PostgreSQL メトリクス向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> \{#download\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、［Dashboards］セクションに移動します
2. 右上の三点リーダーメニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードをインポートするボタン"/>

3. `postgres-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化が事前に設定された状態で作成されます。

<Image img={example_dashboard} alt="PostgreSQL メトリクスダッシュボード"/>

:::note
デモデータセットの場合、時間範囲を **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートしたダッシュボードでは、デフォルトで時間範囲は指定されていません。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### カスタム設定が読み込まれない \{#troubleshooting-not-loading\}

環境変数が設定されていることを確認してください：

```bash
docker exec <コンテナ名> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされていることを確認してください：

```bash
docker exec <コンテナ名> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にメトリクスが表示されない場合 \{#no-metrics\}

PostgreSQL にアクセスできることを確認してください。

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel collector のログを確認します：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### 認証エラー \{#auth-errors\}

パスワードが正しく設定されていることを確認してください：

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

認証情報を直接検証します：

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```

## 次のステップ \{#next-steps\}

PostgreSQL メトリクスの監視をセットアップしたら、次のことを実施します:

- 重要なしきい値（接続数上限、高いロールバック率、低いキャッシュヒット率）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- `pg_stat_statements` 拡張機能でクエリレベルの監視を有効にする
- 異なるエンドポイントとサービス名でレシーバー設定を複製して、複数の PostgreSQL インスタンスを監視する

## 本番環境への移行 \{#going-to-production\}

このガイドでは、クイックセットアップのために、ClickStack に組み込まれている OpenTelemetry Collector をベースとして利用します。本番環境では、独自の OTel Collector を稼働させ、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番環境向けの設定については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。