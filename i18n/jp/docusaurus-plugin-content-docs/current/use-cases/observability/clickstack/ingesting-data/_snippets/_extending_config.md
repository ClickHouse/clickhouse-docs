### コレクター設定の拡張 \{#extending-collector-config\}

ClickStack の OTel collector ディストリビューションでは、カスタム設定ファイルをマウントし、環境変数を設定することで、基本設定を拡張できます。

カスタムの receiver、processor、pipeline を追加するには:

1. 追加の設定を含むカスタム設定ファイルを作成する
2. ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントする
3. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定する

**カスタム設定の例:**

```yaml
receivers:
  # Collect logs from local files
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Collect host system metrics
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
        metrics:
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.utilization:
            enabled: true
      disk:
      network:
      filesystem:
        metrics:
          system.filesystem.utilization:
            enabled: true

service:
  pipelines:
    # Logs pipeline
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # Metrics pipeline
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**スタンドアロン コレクターでデプロイする：**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  # -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

:::note
カスタム構成では、新しい receiver、processor、pipeline だけを定義します。ベースとなる processor（`memory_limiter`、`batch`）および exporter（`clickhouse`）はすでに定義されているため、名前で参照してください。カスタム構成はベース構成とマージされ、既存のコンポーネントを上書きすることはできません。
:::

より複雑な構成については、[デフォルトの ClickStack コレクター構成](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)および [ClickHouse exporter ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)を参照してください。


#### 設定構造 \{#configuration-structure\}

[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)、および [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors) を含む OTel collector の設定方法の詳細については、[公式の OpenTelemetry collector ドキュメント](https://opentelemetry.io/docs/collector/configuration) を参照することを推奨します。