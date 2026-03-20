---
slug: /use-cases/observability/clickstack/integrations/kafka-logs
title: '使用 ClickStack 监控 Kafka 日志'
sidebar_label: 'Kafka 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Kafka 日志'
doc_type: 'guide'
keywords: ['Kafka', '日志', 'OTel', 'ClickStack', 'broker 监控', 'Log4j']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/kafka/logs/log-view.png';
import search_view from '@site/static/images/clickstack/kafka/logs/search-view.png';
import finish_import from '@site/static/images/clickstack/kafka/logs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/kafka/logs/example-dashboard.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Kafka 日志 \{#kafka-logs-clickstack\}

:::note[TL;DR]
使用 OTel `filelog` 接收器在 ClickStack 中收集并可视化 Kafka broker 的日志 (Log4j 格式) 。包含演示数据集和预置仪表板。
:::

## 与现有 Kafka 集成 \{#existing-kafka\}

本节介绍如何通过修改 ClickStack OTel collector 配置，将现有的 Kafka 安装配置为向 ClickStack 发送 broker 日志。
如果您想先测试 Kafka 日志集成，再配置自己现有的环境，可以在[&quot;演示数据集&quot;](/use-cases/observability/clickstack/integrations/kafka-logs#demo-dataset)部分使用我们预配置的环境和示例数据进行测试。

### 前提条件 \{#prerequisites\}

* 正在运行的 ClickStack 实例
* 已安装 Kafka (版本 2.0 或更高) 
* 具有访问 Kafka 日志 File (`server.log`、`controller.log` 等) 的权限

<VerticalStepper headerLevel="h4">
  #### 验证 Kafka 日志配置

  Kafka 使用 Log4j，并将日志写入由 `kafka.logs.dir` 系统属性或 `LOG_DIR` 环境变量指定的目录。检查您的日志文件位置：

  ```bash
  # Default locations
  ls $KAFKA_HOME/logs/      # Standard Apache Kafka (defaults to <install-dir>/logs/)
  ls /var/log/kafka/        # RPM/DEB package installations
  ```

  关键 Kafka 日志文件：

  * **`server.log`**：通用 broker 日志 (启动、连接、复制、错误)
  * **`controller.log`**：控制器相关事件 (leader 选举、分区重新分配)
  * **`state-change.log`**：分区和副本状态变更

  Kafka 的默认 Log4j 模式生成如下格式的日志行：

  ```text
  [2026-03-09 14:23:45,123] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
  ```

  :::note
  对于基于 Docker 的 Kafka 部署 (例如 `confluentinc/cp-kafka`) ，默认的 Log4j 配置仅包含控制台追加器 (console appender) ，不包含文件追加器 (file appender) ，因此日志只会写入 stdout。若要使用 `filelog` 接收器，需要将日志重定向到文件，可通过在 `log4j.properties` 中添加文件追加器，或将 stdout 通过管道输出 (例如 `| tee /var/log/kafka/server.log`) 来实现。
  :::

  #### 为 Kafka 创建自定义 OTel collector 配置

  ClickStack 支持通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置将与由 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建一个名为 `kafka-logs-monitoring.yaml` 的文件，并填入以下配置：

  ```yaml
  receivers:
    filelog/kafka:
      include:
        - /var/log/kafka/server.log
        - /var/log/kafka/controller.log  # optional, only exists if log4j is configured with separate file appenders
        - /var/log/kafka/state-change.log  # optional, same as above
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka"

        - type: add
          field: resource["service.name"]
          value: "kafka-production"

  service:
    pipelines:
      logs/kafka:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * 你只需在自定义配置中定义新的接收器和管道。处理器 (`memory_limiter`、`transform`、`batch`) 和导出器 (`clickhouse`) 已在 ClickStack 的基础配置中定义好——你只需按名称引用即可。
  * `multiline` 配置可确保将堆栈跟踪捕获为单条日志条目。
  * 此配置使用 `start_at: beginning`，以便在 Collector 启动时读取所有已有日志。对于生产环境中的部署，请改为 `start_at: end`，以避免在 Collector 重启时重复摄取日志。
    :::

  #### 配置 ClickStack 以加载自定义配置

  要在现有 ClickStack 部署中启用自定义 Collector 配置，您必须：

  1. 将自定义配置文件挂载至 `/etc/otelcol-contrib/custom.config.yaml`
  2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. 挂载 Kafka 的日志目录，以便 Collector 读取日志

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      更新 ClickStack 的部署配置：

      ```yaml
      services:
        clickstack:
          # ... 现有配置 ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... 其他环境变量 ...
          volumes:
            - ./kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/kafka:/var/log/kafka:ro
            # ... 其他卷 ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (All-in-One 镜像)">
      如果你使用 Docker 运行一体化镜像，请执行：

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/kafka:/var/log/kafka:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  确保 ClickStack Collector 具有读取 Kafka 日志文件的适当权限。在生产环境中，请使用只读挂载 (`:ro`) 并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后，登录 HyperDX 并验证日志是否正常流入：

  <Image img={search_view} alt="搜索界面" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集

在配置生产系统之前，先使用预先生成的示例数据集测试 Kafka 日志集成。

<VerticalStepper headerLevel="h4">
  #### 下载示例数据集

  下载示例日志文件：

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/server.log
  ```

  #### 创建测试 Collector 配置

  创建一个名为 `kafka-logs-demo.yaml` 的文件，写入以下配置：

  ```yaml
  cat > kafka-logs-demo.yaml << 'EOF'
  receivers:
    filelog/kafka:
      include:
        - /tmp/kafka-demo/server.log
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka-demo"

        - type: add
          field: resource["service.name"]
          value: "kafka-demo"

  service:
    pipelines:
      logs/kafka-demo:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### 使用演示配置运行 ClickStack

  使用演示日志和配置运行 ClickStack：

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/kafka-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/server.log:/tmp/kafka-demo/server.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## 在 HyperDX 中验证日志

  ClickStack 启动后：

  1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户 (您可能需要先创建账户) 
  2. 进入 Search 视图，并将 source 设置为 `Logs`
  3. 将时间范围设置为包含 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**

  <Image img={search_view} alt="搜索视图" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 仪表板和可视化 {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-logs-dashboard.json')} download="kafka-logs-dashboard.json" eventName="docs.kafka_logs_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并导航到 Dashboards 部分。
2. 点击右上角省略号下方的“Import Dashboard”。

<Image img={import_dashboard} alt="Import Dashboard"/>

3. 上传 kafka-logs-dashboard.json File，然后点击完成导入。

<Image img={finish_import} alt="Finish importing Kafka logs dashboard"/>

#### 仪表板将被创建，并且所有可视化都已预先配置好 {#created-dashboard}

对于演示数据集，将时间范围设置为包含 **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**。

<Image img={example_dashboard} alt="Kafka Logs example dashboard"/>

</VerticalStepper>

## 故障排查

**验证生效的配置中是否包含您的 filelog 接收器：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**检查 Collector 是否有错误：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**验证 Kafka 日志格式是否符合预期模式：**

```bash
tail -1 /var/log/kafka/server.log
```

如果您的 Kafka 安装使用了自定义的 Log4j 模式，请相应调整 `regex_parser` 的正则表达式。


## 后续步骤

* 为关键事件 (broker 故障、复制错误、消费者组问题) 设置[告警](/use-cases/observability/clickstack/alerts)
* 结合 [Kafka 指标](/use-cases/observability/clickstack/integrations/kafka-metrics) 对 Kafka 进行全面监控
* 为特定用例 (控制器事件、分区重新分配) 创建更多[仪表板](/use-cases/observability/clickstack/dashboards)

## 生产环境部署

本指南利用 ClickStack 内置的 OpenTelemetry Collector 实现快速设置。对于生产环境部署，我们建议运行您自己的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参阅[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。