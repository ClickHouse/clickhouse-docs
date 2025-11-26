---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: "ローカルログとメトリクス"
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: "ClickStackでローカルおよびシステムのデータとメトリクスを使い始める"
doc_type: "guide"
keywords:
  ["clickstack", "サンプルデータ", "サンプルデータセット", "ログ", "オブザーバビリティ"]
---

import Image from "@theme/IdealImage"
import hyperdx_20 from "@site/static/images/use-cases/observability/hyperdx-20.png"
import hyperdx_21 from "@site/static/images/use-cases/observability/hyperdx-21.png"
import hyperdx_22 from "@site/static/images/use-cases/observability/hyperdx-22.png"
import hyperdx_23 from "@site/static/images/use-cases/observability/hyperdx-23.png"

この入門ガイドでは、システムからローカルログとメトリクスを収集し、ClickStackに送信して可視化と分析を行います。

**この例はmacOSおよびLinuxシステムでのみ動作します**

:::note ClickHouse CloudのHyperDX
このサンプルデータセットは、ClickHouse CloudのHyperDXでも使用できます。記載されているように、フローに若干の調整が必要です。ClickHouse CloudでHyperDXを使用する場合、[このデプロイメントモデルの入門ガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)に記載されているように、OpenTelemetryコレクターをローカルで実行する必要があります。
:::

<VerticalStepper>


## カスタム OpenTelemetry 設定を作成する

以下の内容で `custom-local-config.yaml` ファイルを作成します：

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log        # ホストからのLinuxログ
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log   # ホストからのmacOSログ
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

この構成は、OSX および Linux システムのシステムログとメトリクスを収集し、そのデータを ClickStack に送信します。この構成では、新しい receiver と pipeline を追加することで ClickStack collector を拡張し、ベースの ClickStack collector ですでに設定されている `clickhouse` exporter および processor（`memory_limiter`、`batch`）を参照します。

:::note Ingestion timestamps
この構成では、インジェスト時にタイムスタンプを調整し、各イベントに更新された時刻値を割り当てます。ユーザーは理想的には、ログファイル内で OTel processor または operator を使用して [タイムスタンプを事前処理またはパース](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) し、正確なイベント時刻が保持されるようにする必要があります。

このサンプルセットアップでは、receiver または file processor がファイルの先頭から読み込みを開始するように設定されている場合、既存のすべてのログエントリには同じ調整済みタイムスタンプ、つまり元のイベント時刻ではなく処理時刻が割り当てられます。ファイルに追記された新しいイベントには、実際の発生時刻に近いタイムスタンプが付与されます。

この挙動を避けるには、receiver の構成で start position を `end` に設定します。これにより、新しいエントリのみがインジェストされ、実際の到着時刻に近いタイムスタンプが割り当てられるようになります。
:::

OpenTelemetry (OTel) の構成構造の詳細については、[公式ガイド](https://opentelemetry.io/docs/collector/configuration/) の参照を推奨します。


## カスタム設定で ClickStack を起動する

次の Docker コマンドを実行して、カスタム設定を使用したオールインワンコンテナを起動します。

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

:::note Root user
すべてのシステムログにアクセスするために、コレクターは root ユーザーとして実行しています。これは、Linux ベースのシステムで保護されたパスからログを取得するために必要です。ただし、この方法は本番環境では推奨されません。本番環境では、OpenTelemetry Collector は、対象とするログソースにアクセスするために必要な最小限の権限のみを持つローカルエージェントとしてデプロイしてください。

また、コンテナ自身のログファイルとの競合を避けるため、ホストの `/var/log` をコンテナ内の `/host/var/log` にマウントしている点に注意してください。
:::

ClickHouse Cloud 上で HyperDX を使用し、スタンドアロンのコレクターを利用する場合は、代わりに次のコマンドを使用してください：

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

コレクターはすぐにローカルシステムのログとメトリクスの収集を開始します。


## HyperDX UI に移動する {#navigate-to-the-hyperdx-ui}

ローカル環境でデプロイしている場合は、[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。ClickHouse Cloud 上で HyperDX を利用している場合は、対象のサービスを選択し、左側のメニューから `HyperDX` を選択します。



## システムログを探索する {#explore-system-logs}

検索 UI にはローカルのシステムログが表示されているはずです。フィルタを展開して `system.log` を選択します。

<Image img={hyperdx_20} alt="HyperDX ローカルログ" size="lg"/>



## システムメトリクスの探索 {#explore-system-metrics}

チャートを使用してメトリクスを探索できます。

左側のメニューからChart Explorerに移動します。ソースとして`Metrics`を選択し、集計タイプとして`Maximum`を選択します。

`Select a Metric`メニューで`memory`と入力し、`system.memory.utilization (Gauge)`を選択します。

実行ボタンを押して、メモリ使用率の時系列推移を可視化します。

<Image img={hyperdx_21} alt='時系列のメモリ使用率' size='lg' />

数値は浮動小数点の`%`として返されます。より明確に表示するには、`Set number format`を選択します。

<Image img={hyperdx_22} alt='数値フォーマット' size='lg' />

表示されるメニューで`Output format`ドロップダウンから`Percentage`を選択し、`Apply`をクリックします。

<Image img={hyperdx_23} alt='時系列のメモリ使用率(%)' size='lg' />

</VerticalStepper>
