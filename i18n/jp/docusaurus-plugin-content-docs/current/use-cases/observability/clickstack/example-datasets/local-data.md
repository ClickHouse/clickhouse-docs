---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: "ローカルログとメトリクス"
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: "ClickStackでローカルおよびシステムのデータとメトリクスを使い始める"
doc_type: "guide"
keywords:
  ["clickstack", "example data", "sample dataset", "logs", "observability"]
---

import Image from "@theme/IdealImage"
import hyperdx_20 from "@site/static/images/use-cases/observability/hyperdx-20.png"
import hyperdx_21 from "@site/static/images/use-cases/observability/hyperdx-21.png"
import hyperdx_22 from "@site/static/images/use-cases/observability/hyperdx-22.png"
import hyperdx_23 from "@site/static/images/use-cases/observability/hyperdx-23.png"

このガイドでは、システムからローカルログとメトリクスを収集し、ClickStackに送信して可視化と分析を行う方法を説明します。

**この例はmacOSおよびLinuxシステムでのみ動作します**

:::note ClickHouse CloudでのHyperDX
このサンプルデータセットは、ClickHouse CloudのHyperDXでも使用できます。記載されている通り、フローに若干の調整が必要です。ClickHouse CloudでHyperDXを使用する場合、[このデプロイメントモデルのスタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)に記載されているように、OpenTelemetryコレクターをローカルで実行する必要があります。
:::

<VerticalStepper>


## カスタムOpenTelemetry設定の作成 {#create-otel-configuration}

以下の内容で`custom-local-config.yaml`ファイルを作成します:

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log # ホストからのLinuxログ
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log # ホストからのmacOSログ
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

この設定は、macOSおよびLinuxシステムのシステムログとメトリクスを収集し、結果をClickStackに送信します。この設定は、新しいレシーバーとパイプラインを追加することでClickStackコレクターを拡張します。ベースのClickStackコレクターで既に設定されている`clickhouse`エクスポーターとプロセッサー(`memory_limiter`、`batch`)を参照します。

:::note 取り込み時のタイムスタンプ
この設定は取り込み時にタイムスタンプを調整し、各イベントに更新された時刻値を割り当てます。正確なイベント時刻を保持するために、ログファイル内でOTelプロセッサーまたはオペレーターを使用して[タイムスタンプの前処理または解析](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)を行うことを推奨します。

この例の設定では、レシーバーまたはファイルプロセッサーがファイルの先頭から開始するように設定されている場合、既存のすべてのログエントリには同じ調整されたタイムスタンプ(元のイベント時刻ではなく処理時刻)が割り当てられます。ファイルに追加される新しいイベントには、実際の生成時刻に近いタイムスタンプが付与されます。

この動作を回避するには、レシーバー設定で開始位置を`end`に設定します。これにより、新しいエントリのみが取り込まれ、実際の到着時刻に近いタイムスタンプが付与されます。
:::

OpenTelemetry(OTel)設定構造の詳細については、[公式ガイド](https://opentelemetry.io/docs/collector/configuration/)を参照してください。


## カスタム設定でClickStackを起動する {#start-clickstack}

カスタム設定でオールインワンコンテナを起動するには、以下のdockerコマンドを実行します：

```shell
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note rootユーザー
すべてのシステムログにアクセスするため、コレクターをrootユーザーとして実行しています。これはLinuxベースのシステムで保護されたパスからログを取得するために必要です。ただし、この方法は本番環境では推奨されません。本番環境では、OpenTelemetry Collectorは、対象とするログソースへのアクセスに必要な最小限の権限のみを持つローカルエージェントとしてデプロイする必要があります。

コンテナ自身のログファイルとの競合を避けるため、ホストの`/var/log`をコンテナ内の`/host/var/log`にマウントしていることに注意してください。
:::

ClickHouse Cloudでスタンドアロンコレクターを使用してHyperDXを利用する場合は、代わりに以下のコマンドを使用します：

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
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

コレクターは直ちにローカルシステムのログとメトリクスの収集を開始します。


## HyperDX UIへのアクセス {#navigate-to-the-hyperdx-ui}

ローカルにデプロイしている場合は、[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIを開きます。ClickHouse CloudでHyperDXを使用している場合は、サービスを選択し、左メニューから`HyperDX`を選択してください。


## システムログの確認 {#explore-system-logs}

検索UIにローカルシステムログが表示されます。フィルタを展開して`system.log`を選択します：

<Image img={hyperdx_20} alt='HyperDX ローカルログ' size='lg' />


## システムメトリクスの探索 {#explore-system-metrics}

チャートを使用してメトリクスを探索できます。

左側のメニューからChart Explorerに移動します。ソースとして`Metrics`を選択し、集計タイプとして`Maximum`を選択します。

`Select a Metric`メニューで`memory`と入力してから、`system.memory.utilization (Gauge)`を選択します。

実行ボタンを押すと、時系列でメモリ使用率を可視化できます。

<Image img={hyperdx_21} alt='時系列のメモリ使用率' size='lg' />

数値は浮動小数点の`%`として返されることに注意してください。より明確に表示するには、`Set number format`を選択します。

<Image img={hyperdx_22} alt='数値フォーマット' size='lg' />

表示されるメニューで、`Output format`ドロップダウンから`Percentage`を選択してから、`Apply`をクリックします。

<Image img={hyperdx_23} alt='時系列のメモリ使用率（パーセント表示）' size='lg' />

</VerticalStepper>
