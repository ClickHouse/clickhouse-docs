---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: '使用 ClickStack 监控 JVM 指标'
sidebar_label: 'JVM 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 JVM'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/jvm/jvm-metrics-import.png';
import example_dashboard from '@site/static/images/clickstack/jvm/jvm-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 JVM 指标 \{#jvm-clickstack\}

:::note[TL;DR]
本指南演示如何使用 OpenTelemetry Java agent 收集指标，从而通过 ClickStack 监控 JVM 应用程序。你将学到如何：

- 将 OpenTelemetry Java agent 附加到你的 JVM 应用程序
- 配置该 agent 通过 OTLP 将指标发送到 ClickStack
- 使用预构建的仪表盘可视化堆内存、垃圾回收、线程和 CPU

如果你想在为生产应用接入观测之前先测试集成，可以使用带有示例指标的演示数据集。

所需时间：5-10 分钟
:::

## 集成现有 JVM 应用程序 \{#existing-jvm\}

本节介绍如何配置现有 JVM 应用程序，通过 OpenTelemetry Java agent 向 ClickStack 发送指标。

如果希望在配置生产环境之前先测试集成效果，可以使用我们的演示数据集进行验证，详见 [演示数据集部分](#demo-dataset)。

##### 先决条件 \{#prerequisites\}

- 已经在运行的 ClickStack 实例
- 现有的 Java 应用（Java 8+）
- 可修改 JVM 启动参数的权限

<VerticalStepper headerLevel="h4">

#### 获取 ClickStack API key \{#get-api-key\}

OpenTelemetry Java agent 会将数据发送到 ClickStack 的 OTLP 端点，该端点需要进行身份验证。

1. 在你的 ClickStack URL 打开 HyperDX（例如：http://localhost:8080）
2. 如有需要，创建账户或登录
3. 前往 **Team Settings → API Keys**
4. 复制你的 **摄取 API key**

<Image img={api_key} alt="ClickStack API key"/>

#### 下载 OpenTelemetry Java agent \{#download-agent\}

下载 OpenTelemetry Java agent 的 JAR 文件：

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

这会将 agent 下载到你当前目录。你可以将其放在适合你部署的位置（例如 `/opt/opentelemetry/`，或与你的应用 JAR 位于同一目录）。

#### 配置 JVM 启动参数 \{#configure-jvm\}

在 JVM 启动命令中添加 Java agent。该 agent 会自动收集 JVM 指标并将其发送到 ClickStack。

##### 选项 1：命令行参数 \{#command-line-flags\}

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=my-java-app \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -Dotel.exporter.otlp.protocol=http/protobuf \
  -Dotel.exporter.otlp.headers="authorization=YOUR_API_KEY" \
  -Dotel.metrics.exporter=otlp \
  -Dotel.logs.exporter=none \
  -Dotel.traces.exporter=none \
  -jar my-application.jar
```

**请将以下内容替换为：**
- `opentelemetry-javaagent.jar` → agent JAR 的完整路径（例如 `/opt/opentelemetry/opentelemetry-javaagent.jar`）
- `my-java-app` → 有实际含义的服务名称（例如 `payment-service`、`user-api`）
- `YOUR_API_KEY` → 上述步骤中获取的 ClickStack API key
- `my-application.jar` → 你的应用 JAR 文件名
- `http://localhost:4318` → 你的 ClickStack endpoint（如果 ClickStack 运行在同一台机器上，使用 `localhost:4318`，否则使用 `http://your-clickstack-host:4318`）

##### 选项 2：环境变量 \{#env-vars\}

或者，使用环境变量：

```bash
export JAVA_TOOL_OPTIONS="-javaagent:opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="my-java-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=YOUR_API_KEY"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="none"
export OTEL_TRACES_EXPORTER="none"

java -jar my-application.jar
```

**请将以下内容替换为：**
- `opentelemetry-javaagent.jar` → agent JAR 的完整路径
- `my-java-app` → 你的服务名称
- `YOUR_API_KEY` → 你的 ClickStack API key
- `http://localhost:4318` → 你的 ClickStack endpoint
- `my-application.jar` → 你的应用 JAR 文件名

:::tip
OpenTelemetry Java agent 会自动收集以下 JVM 指标：

- **内存**：`jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **垃圾回收**：`jvm.gc.duration`
- **线程**：`jvm.thread.count`
- **类**：`jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**：`jvm.cpu.time`, `jvm.cpu.count`
:::

#### 在 HyperDX 中验证指标 \{#verifying-metrics\}

当你的应用在附加了 agent 的情况下运行后，验证指标是否已流入 ClickStack：

1. 在 http://localhost:8080（或你的 ClickStack URL）打开 HyperDX
2. 前往 **Chart Explorer**
3. 搜索以 `jvm.` 开头的指标（例如 `jvm.memory.used`、`jvm.gc.duration`、`jvm.thread.count`）

</VerticalStepper>

## 演示数据集 \{#demo-dataset\}

对于希望在为自己的应用接入监控之前先测试 JVM 指标集成的用户，我们提供了一个示例数据集，其中包含预生成的指标，展示了一个中等规模微服务在稳定中等流量下的真实 JVM 行为。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

```bash
# 下载 gauge 指标（内存、线程、CPU、类）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# 下载 sum 指标（GC 事件）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

该数据集包含 24 小时的 JVM 指标，展示了：
- 堆内存增长以及周期性的垃圾回收事件
- 线程数变化
- 真实的 GC 暂停时间
- 类加载活动
- CPU 利用率变化模式

#### 启动 ClickStack \{#start-clickstack\}

如果您尚未运行 ClickStack：

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待片刻，让 ClickStack 完全启动。

#### 导入演示数据集 \{#import-demo-data\}

```bash
# 导入 gauge 指标（内存、线程、CPU、类）
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# 导入 sum 指标（GC 事件）
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

这会将指标直接导入到 ClickStack 的指标表中。

#### 验证演示数据 \{#verify-demo-metrics\}

导入完成后：

1. 在 http://localhost:8080 打开 HyperDX 并登录（如有需要先创建账号）
2. 进入 Search 视图，并将 source 设置为 **Metrics**
3. 将时间范围设置为 **2025-12-06 14:00:00 - 2025-12-09 14:00:00**
4. 搜索 `jvm.memory.used` 或 `jvm.gc.duration`

您应该可以看到该演示服务的指标。

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**。请将时间范围设置为 **2025-12-06 14:00:00 - 2025-12-09 14:00:00**，以确保无论您身在何处都能看到演示指标。在看到指标之后，您可以将时间范围收窄为 24 小时，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 \{#dashboards\}

为了帮助您使用 ClickStack 监控 JVM 应用，我们提供了一个预先构建的仪表板，其中包含 JVM 指标的关键可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并导航到 Dashboards 部分
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `jvm-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表板 \{#created-dashboard\}

系统会创建该仪表板，并包含所有预配置的可视化视图：

<Image img={example_dashboard} alt="Kafka 指标仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**。您可以根据本地时区进行调整。
:::

</VerticalStepper>

## 故障排查 \{#troubleshooting\}

### Agent 未启动 \{#troubleshooting-not-loading\}

**确认 agent 的 JAR 文件是否存在：**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**检查 Java 版本兼容性（需要 Java 8 或更高版本）：**

```bash
java -version
```

**查看 agent 启动日志消息：**
当应用启动时，你应当能看到：

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### HyperDX 中没有显示任何指标 \{#no-metrics\}

**验证 ClickStack 正在运行且可访问：**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**检查是否已配置指标导出器：**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**检查应用日志中的 OpenTelemetry 错误：**
在应用日志中查找与 OpenTelemetry 或 OTLP 导出失败相关的错误消息。

**验证网络连通性：**
如果 ClickStack 部署在远程主机上，确保应用服务器可以访问 4318 端口。

**验证 agent 版本：**
确保你使用的是最新的稳定 agent 版本（当前为 2.22.0），因为较新的版本通常包含性能改进。


## 下一步 \{#next-steps\}

现在已经将 JVM 指标导入 ClickStack，可以考虑：

- 为关键指标（如高堆内存使用率、频繁 GC 暂停或线程耗尽）[设置告警](/use-cases/observability/clickstack/alerts)
- 探索[其他 ClickStack 集成](/use-cases/observability/clickstack/integration-guides)，以统一可观测性数据

## 投入生产环境 \{#going-to-production\}

本指南演示了如何为本地测试配置 OpenTelemetry Java 代理。对于生产环境部署，应将该代理的 JAR 文件打包进容器镜像中，并通过环境变量进行配置，以便于管理。对于包含大量 JVM 实例的大型环境，应部署集中式 OpenTelemetry Collector，对来自多个应用的指标进行批处理和转发，而不是直接发送到 ClickStack。

有关生产环境部署模式和 Collector 配置示例，请参阅 [使用 OpenTelemetry 进行数据摄取](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。