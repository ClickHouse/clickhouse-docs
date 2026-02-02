---
slug: /use-cases/observability/clickstack/integrations/temporal-metrics
title: 'ClickStack を使用した Temporal Cloud の監視'
sidebar_label: 'Temporal Cloud メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Temporal Cloud メトリクスの監視'
doc_type: 'guide'
keywords: ['Temporal', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import temporal_metrics from '@site/static/images/clickstack/temporal/temporal-metrics.png';
import finish_import from '@site/static/images/clickstack/temporal/import-temporal-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/temporal/temporal-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

:::note 警告
Temporal プラットフォームにおける OpenMetrics サポートは、[Public Preview](https://docs.temporal.io/evaluate/development-production-features/release-stages#public-preview) として提供されています。詳細については、[Temporal のドキュメント](https://docs.temporal.io/cloud/metrics/openmetrics)を参照してください。
:::

Temporal は、シンプルでありながら高度かつレジリエントなアプリケーションを構築するための抽象化レイヤーを提供します。


# ClickStack を使用した Temporal Cloud メトリクスの監視 \{#temporal-metrics-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector の Prometheus receiver を設定して ClickStack で Temporal Cloud を監視する方法を説明します。次の内容を学びます:

- Temporal Cloud メトリクスを収集するように OTel collector を構成する
- カスタム設定を適用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して Temporal Cloud のパフォーマンス（オープン中のワークフロー、actions/sec、アクティブなネームスペース、タスクバックログ）を可視化する

所要時間: 5〜10 分
:::

## 既存の Temporal Cloud との統合 \{#existing-temporal\}

このセクションでは、Prometheus レシーバーを使用して ClickStack OTel collector を設定することで、ClickStack を構成する方法について説明します。

## 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 既存の Temporal Cloud アカウントを保有していること
- ClickStack から Temporal Cloud への HTTP ネットワーク アクセスがあること

<VerticalStepper headerLevel="h4">
  #### Temporal Cloud キーを作成する

  Temporal Cloud APIキーを保有していることを確認してください。これは、Temporalドキュメントの[認証ガイド](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/api-reference#authentication)に従って作成できます。

  :::important キーファイル
  これらの認証情報は、以下で作成する設定ファイルと同じディレクトリ内の`temporal.key`ファイルに保存してください。このキーは、前後にスペースを含まないプレーンテキストとして保存する必要があります。
  :::

  #### カスタムOTel collector設定の作成

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetryコレクター設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で `temporal-metrics.yaml` という名前のファイルを作成してください:

  ```yaml title="temporal-metrics.yaml"
  receivers:
    prometheus/temporal:
      config:
        scrape_configs:
        - job_name: 'temporal-cloud'
          scrape_interval: 60s
          scrape_timeout: 30s
          honor_timestamps: true
          scheme: https
          authorization:
            type: Bearer
            credentials_file: /etc/otelcol-contrib/temporal.key
          static_configs:
            - targets: ['metrics.temporal.io']
          metrics_path: '/v1/metrics'

  processors:
    resource:
      attributes:
        - key: service.name
          value: "temporal"
          action: upsert

  service:
    pipelines:
      metrics/temporal:
        receivers: [prometheus/temporal]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  この設定では:

  * Temporal Cloud のエンドポイント `metrics.temporal.io` に接続します
  * 60秒ごとにメトリクスを収集します
  * 主要な [パフォーマンスメトリクス](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/metrics-reference) を収集します
  * [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service) に従って、必須の `service.name` リソース属性を**設定します**
  * 専用パイプラインを通じてメトリクスを ClickHouse エクスポーターに転送します

  :::note

  * カスタム設定では、新たに追加する receiver、processor、pipeline だけを定義します
  * `memory_limiter` プロセッサー、`batch` プロセッサー、および `clickhouse` エクスポーターはベースの ClickStack 設定ですでに定義されているため、その名前を指定するだけで参照できます
  * `resource` プロセッサは、OpenTelemetry のセマンティック規約に準拠して、必要な `service.name` 属性を設定します
  * 複数の Temporal Cloud アカウントがある場合は、それらを区別するために `service.name` をカスタマイズしてください（例: `"temporal-prod"`、`"temporal-dev"`）。
    :::

  #### ClickStackにカスタム設定を読み込ませる構成

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム構成ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` に `/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. `temporal.key` ファイルを `/etc/otelcol-contrib/temporal.key` にマウントします
  4. ClickStack と Temporal 間のネットワーク接続を確保する

  すべてのコマンドは、`temporal-metrics.yaml` および `temporal.key` が格納されているサンプルディレクトリから実行することを前提としています。

  ##### オプション1：Docker Compose

  ClickStack のデプロイメント設定を更新してください：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      volumes:
        - ./temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - ./temporal.key:/etc/otelcol-contrib/temporal.key:ro
        # ... other volumes ...
  ```

  ##### オプション2: Docker run（オールインワンイメージ）

  `docker run`でオールインワンイメージを使用する場合:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/temporal.key:/etc/otelcol-contrib/temporal.key:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDXでメトリクスを検証する

  設定後、HyperDXにログインし、メトリクスが流入していることを確認します:

  1. Metrics Explorer に移動します
  2. `temporal` で始まるメトリクス（例: `temporal_cloud_v1_workflow_success_count`, `temporal_cloud_v1_poll_timeout_count`）を検索します
  3. 設定した収集間隔でメトリクスのデータポイントが表示されているはずです

  <Image img={temporal_metrics} alt="Temporal のメトリクス" size="md" />
</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack を使用して Temporal Cloud の監視を開始するにあたり、Temporal Metrics 向けのサンプル可視化をいくつか提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/temporal-metrics-dashboard.json')} download="temporal-metrics-dashboard.json" eventName="docs.temporal_metrics_monitoring.dashboard_download">ダッシュボード構成</TrackedLink> をダウンロード \{#download\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 画面右上の三点リーダー配下にある **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `temporal-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ構成された状態で作成されます。

<Image img={example_dashboard} alt="Temporal Metrics ダッシュボード"/>

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数 `CUSTOM_OTELCOL_CONFIG_FILE` が正しく設定されていることを確認してください：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルが `/etc/otelcol-contrib/custom.config.yaml` にマウントされていることを確認してください。

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack ls -lh /etc/otelcol-contrib/custom.config.yaml
```

カスタム設定の内容を表示し、問題なく読めることを確認します:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack cat /etc/otelcol-contrib/custom.config.yaml
```

`temporal.key` がコンテナ内にマウントされていることを確認してください。`

```bash
docker exec <container-name> cat /etc/otelcol-contrib/temporal.key
# usually, docker exec clickstack cat /etc/otelcol-contrib/temporal.key
# This should output your temporal.key
```


### HyperDX にメトリクスが表示されない

コレクターから Temporal Cloud へ到達できることを確認してください：

```bash
# From the ClickStack container
docker exec <container-name> curl -H "Authorization: Bearer <API_KEY>" https://metrics.temporal.io/v1/metrics
```

Prometheus メトリクスが一連で次のように出力されるはずです (例):

```text
temporal_cloud_v1_workflow_success_count{operation="CompletionStats",region="aws-us-east-2",temporal_account="l2c4n",temporal_namespace="clickpipes-aws-prd-apps-us-east-2.l2c4n",temporal_task_queue="clickpipes-svc-dc118d12-b397-4975-a33e-c2888ac12ac4-peer-flow-task-queue",temporal_workflow_type="QRepPartitionWorkflow"} 0.067 1765894320
```

実効設定に Prometheus receiver が含まれていることを確認します：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "Prometheus:"
## usually, docker exec clickstack cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "prometheus:"
```

コレクターエージェントのログにエラーが出力されていないか確認してください:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
# Look for connection errors or authentication failures
# docker exec clickstack cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
```

Collector のログを確認してください：

```bash
docker exec <container> cat /var/log/otel-collector.log | grep -i error
# Look for config parsing errors - early supervisor.opamp-client can be ignored 
# docker exec clickstack cat /var/log/otel-collector.log | grep -i error
```


### 認証エラー {#auth-errors}

ログに認証エラーが記録されている場合は、API キーを確認してください。

### ネットワーク接続の問題 {#network-issues}

ClickStack が Temporal Cloud に接続できない場合は、Docker Compose ファイルまたは `docker run` コマンドで[外部ネットワーク](https://docs.docker.com/engine/network/#drivers)への接続が許可されていることを確認してください。

## 次のステップ {#next-steps}

さらに掘り下げていきたい場合は、監視について次のようなことを試してみてください。

- 重要なメトリクス（メモリ使用量のしきい値、接続数の上限、キャッシュヒット率の低下）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（レプリケーション遅延、永続化のパフォーマンス）向けの追加ダッシュボードを作成する
- エンドポイントやサービス名を変えてレシーバー設定を複製し、複数の Temporal Cloud アカウントを監視する