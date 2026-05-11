### 扩展 collector 配置 \{#extending-collector-config\}

ClickStack 发行版中的 OTel collector 支持通过挂载自定义配置文件并设置环境变量来扩展基础配置。

要添加自定义接收器（receivers）、处理器（processors）或管道（pipelines）：

1. 创建一个包含额外配置的自定义配置文件
2. 将该文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
3. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

**自定义配置示例：**

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

**使用独立采集器进行部署：**

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
在自定义配置中只需要定义新增的 receivers、processors 和 pipelines。基础 processors（`memory_limiter`、`batch`）和 exporters（`clickhouse`）已经预先定义好——只需通过名称引用它们即可。自定义配置会与基础配置合并，且不能覆盖已有组件。
:::

对于更复杂的配置需求，请参考 [默认 ClickStack collector 配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) 和 [ClickHouse exporter 文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。


#### 配置结构 \{#configuration-structure\}

关于如何配置 OTel collector 的详细说明，包括 [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 和 [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，建议参考 [官方 OpenTelemetry collector 文档](https://opentelemetry.io/docs/collector/configuration)。