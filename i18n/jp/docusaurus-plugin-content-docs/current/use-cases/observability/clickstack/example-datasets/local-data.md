---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'ローカルのログとメトリクス'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack のローカルおよびシステムのデータとメトリクスの利用開始ガイド'
doc_type: 'guide'
keywords: ['clickstack', 'サンプルデータ', 'サンプルデータセット', 'ログ', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

この入門ガイドでは、ローカル環境のログとメトリクスを収集し、それらを ClickStack に送信して可視化および分析します。

**このサンプルは OSX および Linux システムでのみ動作します**

:::note ClickHouse Cloud 上の HyperDX
このサンプルデータセットは、記載されているとおり手順にわずかな調整を加えるだけで、ClickHouse Cloud 上の HyperDX でも使用できます。ClickHouse Cloud で HyperDX を使用する場合は、[このデプロイメントモデル向けの入門ガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)で説明されているように、ローカルで実行される OpenTelemetry collector が必要です。
:::

<VerticalStepper>

  ## カスタムOpenTelemetry設定を作成する {#create-otel-configuration}

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

  この設定は、macOSおよびLinuxシステムのシステムログとメトリクスを収集し、結果をClickStackに送信します。この設定では、新しいレシーバーとパイプラインを追加することでClickStackコレクターを拡張します。ベースのClickStackコレクターで既に設定されている`clickhouse`エクスポーターとプロセッサー（`memory_limiter`、`batch`）を参照してください。

  :::note インジェストのタイムスタンプ
  この設定はインジェスト時にタイムスタンプを調整し、各イベントに更新された時刻値を割り当てます。正確なイベント時刻を保持するために、ユーザーはログファイル内の[タイムスタンプを前処理または解析](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)する際に、OTelプロセッサーまたはオペレーターを使用することを推奨します。

  この設定例では、receiverまたはfileプロセッサがファイルの先頭から開始するように構成されている場合、既存のすべてのログエントリには同一の調整済みタイムスタンプ（元のイベント時刻ではなく処理時刻）が割り当てられます。ファイルに追加される新しいイベントには、実際の生成時刻に近似したタイムスタンプが付与されます。

  この動作を回避するには、レシーバー設定で開始位置を `end` に設定します。これにより、新しいエントリのみが取り込まれ、実際の到着時刻に近いタイムスタンプが付与されます。
  :::

  OpenTelemetry (OTel) の設定構造の詳細については、[公式ガイド](https://opentelemetry.io/docs/collector/configuration/)を参照してください。

  ## カスタム設定でClickStackを起動する {#start-clickstack}

  カスタム設定でオールインワンコンテナを起動するには、以下のdockerコマンドを実行します:

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

  :::note rootユーザー
  すべてのシステムログにアクセスするため、コレクターをrootユーザーとして実行します。これは、Linuxベースのシステムにおいて保護されたパスからログを取得するために必要です。ただし、この方法は本番環境では推奨されません。本番環境では、OpenTelemetry Collectorは、意図するログソースへのアクセスに必要な最小限の権限のみを持つローカルエージェントとしてデプロイする必要があります。

  ホストの `/var/log` をコンテナ内の `/host/var/log` にマウントすることで、コンテナ自身のログファイルとの競合を回避しています。
  :::

  スタンドアロンコレクターでClickHouse CloudのHyperDXを使用する場合は、代わりに以下のコマンドを使用してください：

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

  ## HyperDX UIへ移動する {#navigate-to-the-hyperdx-ui}

  ローカルにデプロイする場合は、[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。ClickHouse CloudでHyperDXを使用する場合は、サービスを選択し、左メニューから`HyperDX`を選択します。

  ## システムログの確認 {#explore-system-logs}

  検索UIにローカルシステムログが表示されます。フィルタを展開して`system.log`を選択します：

  <Image img={hyperdx_20} alt="HyperDX ローカルログ" size="lg" />

  ## システムメトリクスを確認する {#explore-system-metrics}

  チャートを使用してメトリクスを確認できます。

  左側のメニューから Chart Explorer に移動します。ソースとして `Metrics` を選択し、集計タイプとして `Maximum` を選択します。

  `Select a Metric`メニューで、`system.memory.utilization (Gauge)`を選択する前に`memory`と入力します。

  実行ボタンを押して、時系列でのメモリ使用率を可視化します。

  <Image img={hyperdx_21} alt="メモリ使用量の推移" size="lg" />

  数値は浮動小数点の`%`として返されます。より明確に表示するには、`数値形式を設定`を選択してください。

  <Image img={hyperdx_22} alt="数値形式" size="lg" />

  表示されたメニューで、`Output format`ドロップダウンから`Percentage`を選択し、`Apply`をクリックします。

  <Image img={hyperdx_23} alt="メモリに費やした時間の割合（％）" size="lg" />

</VerticalStepper>