---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: "本地日志与指标"
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: "ClickStack 本地及系统数据与指标入门"
doc_type: "指南"
keywords:
  ["clickstack", "示例数据", "样本数据集", "日志", "可观测性"]
---

import Image from "@theme/IdealImage"
import hyperdx_20 from "@site/static/images/use-cases/observability/hyperdx-20.png"
import hyperdx_21 from "@site/static/images/use-cases/observability/hyperdx-21.png"
import hyperdx_22 from "@site/static/images/use-cases/observability/hyperdx-22.png"
import hyperdx_23 from "@site/static/images/use-cases/observability/hyperdx-23.png"

本入门指南将指导您从系统中收集本地日志和指标,并将其发送至 ClickStack 进行可视化和分析。

**此示例仅适用于 macOS 和 Linux 系统**

:::note ClickHouse Cloud 中的 HyperDX
此样本数据集也可与 ClickHouse Cloud 中的 HyperDX 配合使用,仅需对流程进行少量调整(如下文所述)。如果在 ClickHouse Cloud 中使用 HyperDX,用户需要在本地运行 OpenTelemetry 收集器,具体说明请参见[此部署模型的入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。
:::

<VerticalStepper>


## 创建自定义 OpenTelemetry 配置

创建一个名为 `custom-local-config.yaml` 的文件，内容如下：

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log        # 主机 Linux 日志
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log   # 主机 macOS 日志
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

此配置会收集 OSX 和 Linux 系统的系统日志和指标，并将结果发送到 ClickStack。该配置通过添加新的 receiver 和 pipeline 来扩展 ClickStack collector——复用基础 ClickStack collector 中已配置好的 `clickhouse` exporter 和 processors（`memory_limiter`、`batch`）。

:::note 摄取时间戳
此配置会在摄取时调整时间戳，为每个事件分配更新后的时间。理想情况下，用户应使用日志文件中的 OTel processor 或 operator 来[预处理或解析时间戳](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)，以确保保留准确的事件时间。

在此示例设置中，如果将 receiver 或 file processor 配置为从文件开头开始读取，那么所有现有日志条目都会被分配相同的调整后时间戳——即处理时刻，而不是原始事件时间。任何追加到文件中的新事件将获得与其实际生成时间大致相符的时间戳。

为避免这种情况，可以在 receiver 配置中将起始位置设置为 `end`。这可确保只摄取新的条目，并为其打上接近真实到达时间的时间戳。
:::

有关 OpenTelemetry (OTel) 配置结构的更多详细信息，建议参阅[官方指南](https://opentelemetry.io/docs/collector/configuration/)。


## 使用自定义配置启动 ClickStack

运行以下 docker 命令，以你的自定义配置启动一体化容器：

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
我们以 root 用户身份运行 collector，以访问所有系统日志——这是在基于 Linux 的系统上从受保护路径捕获日志所必需的。不过，这种方式不建议用于生产环境。在生产环境中，应将 OpenTelemetry Collector 作为本地 agent 部署，并仅授予访问目标日志源所需的最小权限。

请注意，我们将主机的 `/var/log` 挂载到容器内的 `/host/var/log`，以避免与容器自身的日志文件发生冲突。
:::

如果在 ClickHouse Cloud 中使用 HyperDX 并配合独立 collector，请改用以下命令：

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

收集器会立即开始采集本地系统的日志和指标。


## 进入 HyperDX UI {#navigate-to-the-hyperdx-ui}

如果在本地部署，请访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。若在 ClickHouse Cloud 中使用 HyperDX，请在左侧菜单中先选择您的服务，然后选择 `HyperDX`。



## 浏览系统日志 {#explore-system-logs}

搜索界面此时应该已经显示本地系统日志。展开过滤器并选择 `system.log`：

<Image img={hyperdx_20} alt="HyperDX 本地日志" size="lg"/>



## 探索系统指标 {#explore-system-metrics}

我们可以使用图表来探索指标数据。

通过左侧菜单导航至图表浏览器。选择数据源 `Metrics`,并将聚合类型设置为 `Maximum`。

在 `Select a Metric` 菜单中输入 `memory`,然后选择 `system.memory.utilization (Gauge)`。

点击运行按钮,可视化内存利用率随时间的变化。

<Image img={hyperdx_21} alt='内存随时间变化' size='lg' />

注意,返回的数值为浮点数形式的 `%`。为了更清晰地显示,请选择 `Set number format`。

<Image img={hyperdx_22} alt='数字格式' size='lg' />

在随后的菜单中,从 `Output format` 下拉列表中选择 `Percentage`,然后点击 `Apply`。

<Image img={hyperdx_23} alt='内存百分比随时间变化' size='lg' />

</VerticalStepper>
