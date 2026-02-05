---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'ClickStack を使用した PostgreSQL メトリクスの監視'
sidebar_label: 'PostgreSQL メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した PostgreSQL メトリクスの監視'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'メトリクス', 'OTel', 'ClickStack', 'データベース監視']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した PostgreSQL メトリクスの監視 \{#postgres-metrics-clickstack\}

:::note[概要]
このガイドでは、OpenTelemetry collector の PostgreSQL receiver を構成して、ClickStack で PostgreSQL のパフォーマンスメトリクスを監視する方法を説明します。次の内容を学びます:

- PostgreSQL メトリクスを収集するように OTel collector を構成する
- カスタム構成を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して PostgreSQL のパフォーマンス（トランザクション、接続数、データベースサイズ、キャッシュヒット率）を可視化する

本番環境の PostgreSQL データベースを構成する前に連携をテストしたい場合は、サンプルメトリクスを含むデモデータセットを利用できます。

所要時間: 10〜15 分
:::

## 既存の PostgreSQL との統合 \{#existing-postgres\}

このセクションでは、ClickStack OTel collector に PostgreSQL receiver を設定して、既存の PostgreSQL 環境から ClickStack にメトリクスを送信する方法について説明します。

ご自身の既存環境を設定する前に PostgreSQL メトリクス連携を試したい場合は、[次のセクション](#demo-dataset)で事前設定済みのデモデータセットを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 既存の PostgreSQL インストール（バージョン 9.6 以降）
- ClickStack から PostgreSQL へのネットワーク アクセス（デフォルト ポート 5432）
- 適切な権限を持つ PostgreSQL 監視ユーザー

<VerticalStepper headerLevel="h4">

#### 監視ユーザーに必要な権限が付与されていることを確認する \{#monitoring-permissions\}

PostgreSQL receiver には、統計 VIEW への読み取りアクセス権を持つユーザーが必要です。監視ユーザーに `pg_monitor` ロールを付与します:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### カスタム OTel collector 設定を作成する \{#create-custom-config\}

ClickStack では、カスタム設定ファイルをマウントし、環境変数を設定することで、OpenTelemetry collector のベース設定を拡張できます。

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
`tls: insecure: true` 設定は、開発およびテスト用途のために SSL 検証を無効にします。SSL が有効な本番環境の PostgreSQL では、この行を削除するか、適切な証明書を設定してください。
:::

#### カスタム設定で ClickStack をデプロイする \{#deploy-clickstack\}

作成したカスタム設定をマウントします:

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

設定が完了したら、HyperDX にログインしてメトリクスが流れていることを確認します。

1. Metrics Explorer に移動します。
2. `postgresql.` で始まるメトリクスを検索します（例: `postgresql.backends`, `postgresql.commits`）。
3. 設定した収集間隔でメトリクスのデータポイントが表示されるはずです。

メトリクスのフローが確認できたら、事前構築済みダッシュボードをインポートするために [Dashboards and visualization](#dashboards) セクションに進みます。

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番環境を設定する前に PostgreSQL メトリクス連携をテストしたいユーザー向けに、現実的な PostgreSQL メトリクスパターンを含む、あらかじめ生成されたデータセットを提供しています。

:::note[データベースレベルのメトリクスのみ]
このデモデータセットには、サンプルデータを軽量に保つため、データベースレベルのメトリクスのみが含まれています。実際の PostgreSQL データベースを監視する場合は、テーブルおよび索引メトリクスが自動的に収集されます。
:::

<VerticalStepper headerLevel="h4">

#### サンプルメトリクスデータセットのダウンロード \{#download-sample\}

あらかじめ生成されたメトリクスファイル（現実的なパターンを持つ 24 時間分の PostgreSQL メトリクス）をダウンロードします:

```bash
# ゲージメトリクス（接続数、データベースサイズ）のダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# 合計値メトリクス（コミット、ロールバック、各種操作）のダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

このデータセットには、次のような現実的なパターンが含まれます:
- **朝の接続スパイク (08:00)** - ログイン集中
- **キャッシュ性能の問題 (11:00)** - Blocks_read のスパイク
- **アプリケーションバグ (14:00-14:30)** - ロールバック率が 15% まで急増
- **デッドロック発生 (14:15, 16:30)** - まれなデッドロック

#### ClickStack の起動 \{#start-clickstack\}

ClickStack インスタンスを起動します:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、おおよそ 30 秒待機します。

#### メトリクスを ClickStack に読み込む \{#load-metrics\}

メトリクスを直接 ClickHouse にロードします:

```bash
# ゲージメトリクスのロード
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 合計値メトリクスのロード
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX でメトリクスを検証する \{#verify-metrics-demo\}

読み込みが完了したら、最も手早くメトリクスを確認する方法は、あらかじめ用意されたダッシュボードを使うことです。

[Dashboards and visualization](#dashboards) セクションに進み、ダッシュボードをインポートして、多数の PostgreSQL メトリクスを一度に確認してください。

:::note[タイムゾーンの表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** の期間をカバーしています。場所に関わらずデモメトリクスが確実に表示されるよう、時間の範囲を **2025-11-09 00:00:00 - 2025-11-12 00:00:00** に設定してください。メトリクスが表示されることを確認したら、可視化をわかりやすくするために 24 時間の範囲へ絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で PostgreSQL を監視し始める際に役立つよう、PostgreSQL メトリクス向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定 \{#download\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `postgres-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化があらかじめ構成された状態で作成されます。

<Image img={example_dashboard} alt="PostgreSQL メトリクスダッシュボード"/>

:::note
デモデータセットの場合、時間範囲を **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### カスタム設定が読み込まれない \{#troubleshooting-not-loading\}

環境変数が設定されていることを確認してください：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされていることを確認します：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX にメトリクスが表示されない \{#no-metrics\}

PostgreSQL に正常に接続できることを確認してください:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

OTel collector のログを確認する：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```


### 認証エラー \{#auth-errors\}

パスワードが正しく設定されていることを確認してください:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

認証情報を直接テストする:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 次のステップ \{#next-steps\}

PostgreSQL メトリクス監視のセットアップが完了したら、次の作業を行います。

- 重要なしきい値（接続数上限、高いロールバック率、低いキャッシュヒット率）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- `pg_stat_statements` 拡張機能を使用して、クエリ単位の監視を有効化する
- 異なるエンドポイントとサービス名で receiver 設定を複製し、複数の PostgreSQL インスタンスを監視する

## 本番運用への移行 \{#going-to-production\}

このガイドでは、迅速なセットアップのために、ClickStack に組み込まれている OpenTelemetry Collector を利用します。本番運用へのデプロイでは、独自の OTel collector をデプロイし、ClickStack の OTLP エンドポイントへデータを送信することを推奨します。本番向けの構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。