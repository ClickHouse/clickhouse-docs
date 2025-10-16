---
'slug': '/use-cases/observability/clickstack/getting-started/local-data'
'title': 'ローカルログとメトリクス'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackのローカルおよびシステムデータとメトリクスの取り扱いを始める'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';

This getting started guide allows you collect local logs and metrics from your system, sending them to ClickStack for visualization and analysis.

**この例はOSXおよびLinuxシステムでのみ動作します**

The following example assumes you have started ClickStack using the [instructions for the all-in-one image](/use-cases/observability/clickstack/getting-started) and connected to the [local ClickHouse instance](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) or a [ClickHouse Cloud instance](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

:::note HyperDX in ClickHouse Cloud
このサンプルデータセットは、HyperDX in ClickHouse Cloudでも使用できますが、フローにわずかな調整が必要です。 ClickHouse CloudでHyperDXを使用する場合、ユーザーは[この展開モデルのためのスタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)で説明されているように、ローカルでOpen Telemetryコレクタを実行する必要があります。
:::

<VerticalStepper>

## HyperDX UIに移動する {#navigate-to-the-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI if deploying locally. If using HyperDX in ClickHouse Cloud, select your service and `HyperDX` from the left menu.

## 取り込みAPIキーをコピーする {#copy-ingestion-api-key}

:::note HyperDX in ClickHouse Cloud
このステップは、ClickHouse CloudでHyperDXを使用している場合は必要ありません。
:::

Navigate to [`Team Settings`](http://localhost:8080/team) and copy the `Ingestion API Key` from the `API Keys` section. This API key ensures data ingestion through the OpenTelemetry collector is secure.

<Image img={copy_api_key} alt="APIキーをコピー" size="lg"/>

## ローカルOpenTelemetry構成を作成する {#create-otel-configuration}

Create a `otel-local-file-collector.yaml` file with the following content.

**重要**: 上記でコピーした取り込みAPIキーの値を`<YOUR_INGESTION_API_KEY>`に設定してください (ClickHouse CloudでのHyperDXには必要ありません)。

```yaml
receivers:
  filelog:
    include:
      - /var/log/**/*.log             # Linux
      - /var/log/syslog
      - /var/log/messages
      - /private/var/log/*.log       # macOS
      - /tmp/all_events.log # macos - see below
    start_at: beginning # modify to collect new files only

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

exporters:
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    tls:
      insecure: true
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 262144  # 262,144 items × ~8 KB per item ≈ 2 GB

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [otlp]
    metrics:
      receivers: [hostmetrics]
      exporters: [otlp]
```

この構成は、OSXおよびLinuxシステムのシステムログおよびメトリックを収集し、その結果をポート4317のOTLPエンドポイントを介してClickStackに送信します。

:::note 取り込みのタイムスタンプ
この構成は取り込み時にタイムスタンプを調整し、各イベントに更新された時間値を割り当てます。ユーザーは、正確なイベント時刻が保持されるように、OTelプロセッサやオペレーターを使用してログファイル内のタイムスタンプを[前処理または解析](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)することが理想的です。

この例のセットアップでは、受信者またはファイルプロセッサがファイルの先頭から開始するように構成されている場合、すべての既存のログエントリには同じ調整されたタイムスタンプが割り当てられます - それはオリジナルのイベント時刻ではなく、処理の時間です。ファイルに追加された新しいイベントには、実際の生成時間に近いタイムスタンプが付与されます。

この動作を避けるには、受信者の構成で開始位置を`end`に設定できます。これにより、新しいエントリのみが取り込まれ、真の到着時刻に近いタイムスタンプが付与されます。
:::

For more details on the OpenTelemetry (OTel) configuration structure, we recommend [the official guide](https://opentelemetry.io/docs/collector/configuration/).

:::note OSXの詳細ログ
OSXでより詳細なログを取得したいユーザーは、以下のコマンドを実行してコレクタを開始する前に`log stream --debug --style ndjson >> /tmp/all_events.log`を実行できます。これにより、詳細なオペレーティングシステムログが`/tmp/all_events.log`ファイルにキャプチャされます。このファイルは、上記の構成ですでに含まれています。
:::

## コレクタを起動する {#start-the-collector}

Run the following docker command to start an instance of the OTel collector.

```shell
docker run --network=host --rm -it \
  --user 0:0 \
  -v "$(pwd)/otel-local-file-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml
```

:::note ルートユーザー
すべてのシステムログにアクセスするためにコレクタをルートユーザーとして実行します - これはLinuxベースのシステムから保護されたパスのログをキャプチャするために必要です。ただし、このアプローチは本番環境では推奨されません。本番環境では、OpenTelemetryコレクタは、意図されたログソースにアクセスするために必要な最小限の権限でローカルエージェントとして展開されるべきです。
:::

The collector will immediately begin collecting local system logs and metrics.

## システムログを探索する {#explore-system-logs}

Navigate to the HyperDX UI. The search UI should be populated with local system logs. Expand the filters to select the `system.log`:

<Image img={hyperdx_20} alt="HyperDX ローカルログ" size="lg"/>

## システムメトリックを探索する {#explore-system-metrics}

We can explore our metrics using charts.

Navigate to the Chart Explorer via the left menu. Select the source `Metrics` and `Maximum` as the aggregation type. 

For the `Select a Metric` menu simply type `memory` before selecting `system.memory.utilization (Gauge)`.

Press the run button to visualize your memory utilization over time.

<Image img={hyperdx_21} alt="時間経過によるメモリ" size="lg"/>

Note the number is returned as a floating point `%`. To render it more clearly, select `Set number format`. 

<Image img={hyperdx_22} alt="数値フォーマット" size="lg"/>

From the subsequent menu you can select `Percentage` from the `Output format` drop down before clicking `Apply`.

<Image img={hyperdx_23} alt="時間のメモリ %" size="lg"/>

</VerticalStepper>
