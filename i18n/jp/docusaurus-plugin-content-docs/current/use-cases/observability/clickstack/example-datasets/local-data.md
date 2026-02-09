---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'ローカルログとメトリクス'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack のローカルおよびシステムデータとメトリクスのはじめ方'
doc_type: 'guide'
keywords: ['clickstack', 'サンプルデータ', 'サンプルデータセット', 'ログ', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

このクイックスタートガイドでは、ローカル環境のログとメトリクスを収集し、それらを可視化と分析のために ClickStack に送信する手順を説明します。

**このサンプルは OSX および Linux システムでのみ動作します**

:::note ClickHouse Cloud での HyperDX
このサンプルデータセットは、処理フローに対してわずかな調整を行うだけで、ClickHouse Cloud の HyperDX でも使用できます。ClickHouse Cloud の HyperDX を使用する場合は、[このデプロイメントモデル向けのクイックスタートガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)で説明されているように、ローカルで OpenTelemetry コレクターを実行しておく必要があります。
:::

<VerticalStepper>
  ## カスタムOpenTelemetry設定の作成 \{#create-otel-configuration\}

  以下の内容で `custom-local-config.yaml` ファイルを作成します:

  ```yaml
  receivers:
    filelog:
      include:
        - /host/var/log/**/*.log        # Linux logs from host
        - /host/var/log/syslog
        - /host/var/log/messages
        - /host/private/var/log/*.log   # macOS logs from host
      start_at: beginning
      resource:
        service.name: "system-logs"

    hostmetrics:
      collection_interval: 1s
      scrapers:
        cpu:
          metrics:
            system.cpu.time:
              enabled: true
            system.cpu.utilization:
              enabled: true
        memory:
          metrics:
            system.memory.usage:
              enabled: true
            system.memory.utilization:
              enabled: true
        filesystem:
          metrics:
            system.filesystem.usage:
              enabled: true
            system.filesystem.utilization:
              enabled: true
        paging:
          metrics:
            system.paging.usage:
              enabled: true
            system.paging.utilization:
              enabled: true
            system.paging.faults:
              enabled: true
        disk:
        load:
        network:
        processes:

  service:
    pipelines:
      logs/local:
        receivers: [filelog]
        processors:
          - memory_limiter
          - batch
        exporters:
          - clickhouse
      metrics/hostmetrics:
        receivers: [hostmetrics]
        processors:
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  この設定は、OSXおよびLinuxシステムのシステムログとメトリクスを収集し、結果をClickStackに送信します。この設定では、新しいレシーバーとパイプラインを追加することでClickStackコレクターを拡張します。ベースのClickStackコレクターで既に設定されている`clickhouse`エクスポーターとプロセッサー(`memory_limiter`、`batch`)を参照してください。

  :::note インジェストのタイムスタンプ
  この設定は、インジェスト時にタイムスタンプを調整し、各イベントに更新された時刻値を割り当てます。正確なイベント時刻を保持するために、ログファイル内のOTelプロセッサまたはオペレータを使用して[タイムスタンプの前処理または解析](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)を行うことを推奨します。

  この設定例では、レシーバーまたはファイルプロセッサがファイルの先頭から開始するように構成されている場合、既存のすべてのログエントリには同一の調整済みタイムスタンプが割り当てられます。これは元のイベント時刻ではなく、処理時刻です。ファイルに追加される新しいイベントには、実際の生成時刻に近似したタイムスタンプが付与されます。

  この動作を回避するには、レシーバー設定で開始位置を `end` に設定します。これにより、新しいエントリのみが取り込まれ、実際の到着時刻に近いタイムスタンプが付与されます。
  :::

  OpenTelemetry (OTel) の設定構造の詳細については、[公式ガイド](https://opentelemetry.io/docs/collector/configuration/)を参照してください。

  ## カスタム設定でClickStackを起動する \{#start-clickstack\}

  カスタム構成でオールインワンコンテナを起動するには、以下のDockerコマンドを実行します:

  ```shell
  docker run -d --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    --user 0:0 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/host/var/log:ro \
    -v /private/var/log:/host/private/var/log:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note Rootユーザー
  すべてのシステムログにアクセスするため、コレクターをrootユーザーとして実行します。これは、Linuxベースのシステムにおいて保護されたパスからログを取得するために必要です。ただし、この方法は本番環境では推奨されません。本番環境では、OpenTelemetry Collectorを、対象のログソースへのアクセスに必要な最小限の権限のみを持つローカルエージェントとしてデプロイする必要があります。

  ホストの `/var/log` をコンテナ内の `/host/var/log` にマウントすることで、コンテナ自身のログファイルとの競合を回避しています。
  :::

  ClickHouse Cloudでスタンドアロンコレクターを使用してHyperDXを利用する場合は、代わりに次のコマンドを使用してください:

  ```shell
  docker run -d \
    -p 4317:4317 -p 4318:4318 \
    --user 0:0 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/host/var/log:ro \
    -v /private/var/log:/host/private/var/log:ro \
    clickhouse/clickstack-otel-collector:latest
  ```

  コレクターは即座にローカルシステムのログとメトリクスの収集を開始します。

  ## HyperDX UIに移動する \{#navigate-to-the-hyperdx-ui\}

  ローカルにデプロイする場合は、[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。ClickHouse Cloud で HyperDX を使用する場合は、サービスを選択し、左メニューから `HyperDX` を選択します。

  ## システムログを確認する \{#explore-system-logs\}

  検索UIにローカルシステムログが入力されます。フィルタを展開して`system.log`を選択してください:

  <Image img={hyperdx_20} alt="HyperDX ローカルログ" size="lg" />

  ## システムメトリクスを探索する \{#explore-system-metrics\}

  チャートを使用してメトリクスを確認できます。

  左側のメニューからChart Explorerに移動します。ソースとして`Metrics`を選択し、集計タイプとして`Maximum`を選択してください。

  `Select a Metric`メニューで、`system.memory.utilization (Gauge)`を選択する前に`memory`と入力します。

  実行ボタンを押して、メモリ使用率の時系列推移を可視化してください。

  <Image img={hyperdx_21} alt="時間経過に伴うメモリ使用量" size="lg" />

  数値は浮動小数点の`%`として返されることに注意してください。より明確に表示するには、`Set number format`を選択してください。

  <Image img={hyperdx_22} alt="数値フォーマット" size="lg" />

  次のメニューから、`Output format`ドロップダウンで`Percentage`を選択してから、`Apply`をクリックします。

  <Image img={hyperdx_23} alt="メモリ使用時間の割合（％）" size="lg" />
</VerticalStepper>