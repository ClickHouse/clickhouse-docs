---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: '本地日志与指标'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack 本地及系统数据和指标入门'
doc_type: 'guide'
keywords: ['clickstack', '示例数据', '示例数据集', '日志', '可观测性']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import select_service from '@site/static/images/clickstack/select_service.png';

本入门指南可帮助你从本地系统收集日志和指标，并将其发送到 ClickStack 进行可视化和分析。

**此示例仅适用于 OSX 和 Linux 系统**

<Tabs groupId="sample-logs">
  <TabItem value="托管版 ClickStack" label="托管版 ClickStack" default>
    本指南假定您已完成[托管 ClickStack 入门指南](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)并已[记录连接凭据](/use-cases/observability/clickstack/getting-started/managed#next-steps)。

    <VerticalStepper>
      ## 创建自定义 OpenTelemetry 配置 \{#create-otel-configuration\}

      创建一个 `custom-local-config.yaml` 文件,内容如下:

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

      此配置用于收集 OSX 和 Linux 系统的日志和指标,并将结果发送到 ClickStack。该配置通过添加新的接收器和管道来扩展 ClickStack 采集器——您需要引用基础 ClickStack 采集器中已配置的 `clickhouse` 导出器和处理器(`memory_limiter`、`batch`)。

      :::note 摄取时间戳
      此配置会在摄取时调整时间戳,为每个事件分配更新后的时间值。理想情况下,您应该使用 OTel 处理器或操作符在日志文件中[预处理或解析时间戳](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching),以确保保留准确的事件时间。

      在此示例配置中,如果接收器或文件处理器配置为从文件开头开始读取,所有现有日志条目将被分配相同的调整后时间戳——即处理时间而非原始事件时间。追加到文件的新事件将接收近似其实际生成时间的时间戳。

      要避免此行为,您可以在接收器配置中将起始位置设置为 `end`。这可确保仅摄取新条目,并在接近其实际到达时间时为其添加时间戳。
      :::

      有关 OpenTelemetry (OTel) 配置结构的更多详细信息,请参阅[官方指南](https://opentelemetry.io/docs/collector/configuration/)。

      ## 启动 OpenTelemetry 采集器 \{#start-the-otel-collector\}

      使用以下命令运行独立采集器:

      ```shell
      docker run -d \
        -p 4317:4317 -p 4318:4318 \
        --user 0:0 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log:/host/var/log:ro \
        -v /private/var/log:/host/private/var/log:ro \
        clickhouse/clickstack-otel-collector:latest
      ```

      采集器将立即开始收集本地系统的日志和指标。

      ## 选择您的服务 \{#select-your-service\}

      从 ClickHouse Cloud 主页中选择带有托管 ClickStack 的服务。

      <Image img={select_service} alt="选择服务" size="lg" />

      ## 查看系统日志 \{#navigate-to-the-hyperdx-ui\}

      从左侧菜单中选择 `ClickStack` 以导航到 ClickStack UI,您将自动完成身份验证。

      搜索界面应填充本地系统日志。展开过滤器以选择 `system.log`:

      <Image img={hyperdx_20} alt="HyperDX 本地日志" size="lg" />

      ## 查看系统指标 \{#explore-system-metrics\}

      我们可以通过图表来探索指标数据。

      通过左侧菜单导航至 Chart Explorer。选择数据源 `Metrics`,聚合类型选择 `Maximum`。

      在 `Select a Metric` 菜单中,先输入 `memory`,再选择 `system.memory.utilization (Gauge)`。

      点击运行按钮以可视化内存使用率随时间的变化。

      <Image img={hyperdx_21} alt="内存使用随时间变化" size="lg" />

      注意,该数字以浮点数 `%` 的形式返回。为了更清晰地显示,请选择 `Set number format`。

      <Image img={hyperdx_22} alt="数值格式" size="lg" />

      在随后的菜单中,您可以从 `Output format` 下拉列表中选择 `Percentage`,然后单击 `Apply`。

      <Image img={hyperdx_23} alt="内存使用率（随时间变化）" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    <VerticalStepper>
      ## 创建自定义 OpenTelemetry 配置 \{#create-otel-configuration-oss\}

      创建一个 `custom-local-config.yaml` 文件,内容如下:

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

      此配置用于收集 OSX 和 Linux 系统的日志和指标,并将结果发送到 ClickStack。该配置通过添加新的接收器和管道来扩展 ClickStack 采集器——您需要引用基础 ClickStack 采集器中已配置的 `clickhouse` 导出器和处理器(`memory_limiter`、`batch`)。

      :::note 摄取时间戳
      此配置会在摄取时调整时间戳,为每个事件分配更新后的时间值。理想情况下,您应该使用 OTel 处理器或操作符在日志文件中[预处理或解析时间戳](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching),以确保保留准确的事件时间。

      在此示例配置中,如果接收器或文件处理器配置为从文件开头开始读取,所有现有日志条目将被分配相同的调整后时间戳——即处理时间而非原始事件时间。追加到文件的新事件将接收近似其实际生成时间的时间戳。

      要避免此行为,您可以在接收器配置中将起始位置设置为 `end`。这可确保仅摄取新条目,并在接近其实际到达时间时为其添加时间戳。
      :::

      有关 OpenTelemetry (OTel) 配置结构的更多详细信息,请参阅[官方指南](https://opentelemetry.io/docs/collector/configuration/)。

      ## 使用自定义配置启动 ClickStack \{#start-clickstack\}

      运行以下 docker 命令以使用自定义配置启动一体化容器:

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

      :::note Root 用户
      我们以 root 用户身份运行采集器以访问所有系统日志——这是从基于 Linux 的系统上受保护路径捕获日志所必需的。但是,不建议在生产环境中使用此方法。在生产环境中,应将 OpenTelemetry Collector 部署为本地代理,并仅授予访问目标日志源所需的最小权限。

      注意:我们将宿主机的 `/var/log` 挂载到容器内的 `/host/var/log`,以避免与容器自身的日志文件发生冲突。
      :::

      ## 查看系统日志 \{#navigate-to-the-hyperdx-ui-oss\}

      如果在本地部署,请访问 [http://localhost:8080](http://localhost:8080) 访问 ClickStack UI。

      数据源应已为您预先创建。搜索界面应填充本地系统日志。展开过滤器以选择 `system.log`:

      <Image img={hyperdx_20} alt="HyperDX 本地日志" size="lg" />

      ## 查看系统指标 \{#explore-system-metrics-oss\}

      我们可以通过图表来探索指标数据。

      通过左侧菜单导航至 Chart Explorer。选择数据源 `Metrics`,聚合类型选择 `Maximum`。

      在 `Select a Metric` 菜单中,先输入 `memory`,再选择 `system.memory.utilization (Gauge)`。

      点击运行按钮以可视化内存使用率随时间的变化。

      <Image img={hyperdx_21} alt="内存使用率随时间变化" size="lg" />

      注意,该数字以浮点数 `%` 的形式返回。为了更清晰地显示,请选择 `Set number format`。

      <Image img={hyperdx_22} alt="数字格式" size="lg" />

      在随后的菜单中,您可以从 `Output format` 下拉列表中选择 `Percentage`,然后单击 `Apply`。

      <Image img={hyperdx_23} alt="内存百分比随时间变化" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>