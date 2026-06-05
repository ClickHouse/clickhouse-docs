---
slug: /use-cases/observability/clickstack/getting-started/otelgen
title: 'otelgenで合成OpenTelemetryデータを生成'
sidebar_label: 'otelgenで合成データを生成'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'otelgenを使って、合成ログ、トレース、メトリクスをClickStack OpenTelemetry collectorへ送信する'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'otelgen', '合成データ', 'OpenTelemetry', 'テスト', 'ログ', 'トレース', 'メトリクス', 'オブザーバビリティ']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[`otelgen`](https://github.com/krzko/otelgen) は、合成 OTLP ログ、トレース、メトリクスを生成する小さな Go CLI です。これを使うと、既存の ClickStack OpenTelemetry collector がデータを受信しており、イベントが ClickStack UI に表示されることを確認できます。

このガイドでは、collector が `4317` (gRPC) および `4318` (HTTP) の OTLP エンドポイントですでに稼働していることを前提としています。

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="Managed ClickStack" default>
    <VerticalStepper headerLevel="h3">
      ### 前提条件 \{#prerequisites-managed\}

      このガイドは、[Managed ClickStack の Getting Started ガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) を完了しており、OTLP gRPC (`4317`) および HTTP (`4318`) の endpoint に、`otelgen` を実行するマシンから到達できる OpenTelemetry collector が稼働していることを前提としています。[collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) に従って `OTLP_AUTH_TOKEN` を設定している場合は、その値をすぐ使えるようにしておいてください。

      ### otelgen をインストールする \{#install-otelgen-managed\}

      Homebrew でインストールします。

      ```shell
      brew install krzko/tap/otelgen
      ```

      または、Go でインストールします。

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 環境変数を設定する \{#set-env-vars-managed\}

      collector の endpoint と、collector が保護されている場合は認証トークンを export します。

      ```shell
      export OTEL_ENDPOINT=<host>:4317
      export OTLP_AUTH_TOKEN=<your_otlp_auth_token>
      ```

      collector の host と port を指定してください。同じマシン上で collector を実行している場合は、`localhost:4317` です。

      :::note[保護されていない collector]
      ClickStack OpenTelemetry collector はデフォルトで認証なしです。[collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) に従って `OTLP_AUTH_TOKEN` を設定していない場合は、ここで `OTLP_AUTH_TOKEN` は省略し、以下のコマンドから `--header` フラグを削除してください。
      :::

      ### traces を生成する \{#generate-traces-managed\}

      複数 span を含む traces を短時間バースト送信します。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` は 1 秒あたりの trace 数、`--duration` は実行時間 (秒) です。`--insecure` は gRPC connection の TLS を無効にします。これは、collector の平文 OTLP port を `otelgen` の接続先として使用する場合に必要です。

      ### logs を生成する \{#generate-logs-managed\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### メトリクスを生成する \{#generate-metrics-managed\}

      metrics のサブコマンドは `--duration` をサポートしていません。コマンドを実行し、数秒後に `Ctrl+C` を押して停止してください。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` は、`metrics` の下で `gauge`、`histogram`、`up-down-counter`、`exponential-histogram` の各サブコマンドもサポートしています。

      ### ClickStack で確認する \{#verify-managed\}

      ClickHouse Cloud console から ClickStack UI を開きます。`Search` ビューで `Logs` と `Traces` の間でログソースを切り替え、新しいイベントが表示されることを確認してください。時間範囲は `Last 15 minutes` に設定します。`Chart Explorer` を開いて `Metrics` を選択し、`otelgen` が生成したメトリクス名の 1 つ (たとえば `otelgen.metrics.sum`) を chart して、メトリクスがインジェストされていることを確認します。
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack オープンソース版">
    <VerticalStepper headerLevel="h3">
      ### 前提条件 \{#prerequisites-oss\}

      このガイドでは、[all-in-one イメージの手順](/use-cases/observability/clickstack/getting-started/oss)に従って Open Source ClickStack を起動済みであり、OTLP エンドポイント (`4317` gRPC および `4318` HTTP) にアクセスできることを前提としています。また、HyperDX UI の `Team Settings > API Keys` にあるインジェスト API key も必要です。

      ### otelgen をインストールする \{#install-otelgen-oss\}

      Homebrew でインストールします。

      ```shell
      brew install krzko/tap/otelgen
      ```

      または Go でインストールします。

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 環境変数を設定する \{#set-env-vars-oss\}

      collector endpoint とインジェスト API key をエクスポートします。

      ```shell
      export OTEL_ENDPOINT=localhost:4317
      export CLICKSTACK_API_KEY=<your_ingestion_api_key>
      ```

      ### traces を生成する \{#generate-traces-oss\}

      複数の span を含む traces を短時間にまとめて送信します。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` は 1 秒あたりの traces 数、`--duration` は実行時間 (秒) です。`--insecure` はローカル collector に対する平文 gRPC を有効にします。

      ### logs を生成する \{#generate-logs-oss\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### メトリクスを生成する \{#generate-metrics-oss\}

      `metrics` のサブコマンドは `--duration` をサポートしていません。コマンドを実行し、数秒後に `Ctrl+C` を押して停止してください。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` は `metrics` 配下で `gauge`、`histogram`、`up-down-counter`、`exponential-histogram` の各サブコマンドもサポートしています。

      ### ClickStack で確認する \{#verify-oss\}

      [http://localhost:8080](http://localhost:8080) にアクセスして ClickStack UI を開きます。`Search` ビューで、`Logs` と `Traces` を切り替えて新しいイベントを確認します。時間範囲を `Last 15 minutes` に設定します。`Chart Explorer` を開き、`Metrics` を選択して、`otelgen` が生成したメトリクス名の 1 つ (たとえば `otelgen.metrics.sum`) をチャート化し、メトリクスのインジェストを確認します。
    </VerticalStepper>
  </TabItem>
</Tabs>