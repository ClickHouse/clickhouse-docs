---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: '使用 ClickStack 监控 Node.js 跟踪数据'
sidebar_label: 'Node.js 跟踪数据'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Node.js 应用的跟踪数据'
doc_type: 'guide'
keywords: ['Node.js', 'traces', 'OTel', 'ClickStack', '分布式追踪']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import api_key from '@site/static/images/clickstack/api-key.png';
import search_view from '@site/static/images/clickstack/nodejs/traces-search-view.png';
import trace_view from '@site/static/images/clickstack/nodejs/trace-view.png';
import finish_import from '@site/static/images/clickstack/nodejs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/nodejs/example-traces-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# 使用 ClickStack 监控 Node.js 链路追踪 \{#nodejs-traces-clickstack\}

:::note[要点速览]
本指南演示如何通过 OpenTelemetry 自动埋点，从你的 Node.js 应用捕获分布式链路追踪数据，并在 ClickStack 中进行可视化。你将学到如何：

- 为 Node.js 安装和配置带自动埋点的 OpenTelemetry
- 将链路追踪数据发送到 ClickStack 的 OTLP 端点
- 验证链路追踪数据是否已在 HyperDX 中出现
- 使用预构建的仪表板可视化应用性能

如果你想在为生产应用启用埋点前先测试集成，可以使用提供的包含示例链路追踪数据的演示数据集。

所需时间：10-15 分钟
:::

## 与现有 Node.js 应用程序集成 \{#existing-nodejs\}

本节介绍如何使用 OpenTelemetry 的自动埋点功能，为现有的 Node.js 应用程序添加分布式追踪。

如果你希望在为自己的现有环境完成配置之前先测试集成效果，可以先通过我们预先配置好的环境和示例数据进行测试，详见 [演示数据集章节](#demo-dataset)。

##### 前置条件 \{#prerequisites\}

- 已运行的 ClickStack 实例，并且 OTLP 端点可访问（端口 4317/4318）
- 已有的 Node.js 应用程序（Node.js 14 或更高版本）
- npm 或 yarn 包管理器
- ClickStack 主机名或 IP 地址

<VerticalStepper headerLevel="h4">

#### 安装并配置 OpenTelemetry \{#install-configure\}

安装 `@hyperdx/node-opentelemetry` 包，并在应用程序启动时完成初始化。详细安装步骤见 [Node.js SDK 指南](/use-cases/observability/clickstack/sdks/nodejs#getting-started)。

#### 获取 ClickStack API key \{#get-api-key\}

用于将 traces 发送到 ClickStack OTLP 端点的 API key。

1. 在你的 ClickStack URL (例如 http://localhost:8080) 上打开 HyperDX
2. 如有需要，创建一个账号或登录
3. 导航到 **Team Settings → API Keys**
4. 复制你的 **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

#### 运行你的应用程序 \{#run-application\}

设置好环境变量后启动你的 Node.js 应用程序：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### 生成一些流量 \{#generate-traffic\}

向你的应用程序发起请求以生成 traces：

```bash
# 简单请求
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# 模拟负载
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### 在 HyperDX 中验证 traces \{#verify-traces\}

配置完成后，登录 HyperDX 并验证 traces 是否正常上报。你应能看到类似下图的界面。如果没有看到 traces，尝试调整时间范围：

<Image img={search_view} alt="Traces search view"/>

点击任意 trace 以查看包含 spans、时间和属性的详细视图：

<Image img={trace_view} alt="Individual trace view"/>

</VerticalStepper>

## 演示数据集 \{#demo-dataset\}

对于在为生产环境应用接入监控之前，想先使用 ClickStack 测试 Node.js 链路追踪的用户，我们提供了一个预生成的 Node.js 应用 trace 示例数据集，包含逼真的流量模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

下载示例 trace 文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### 启动 ClickStack \{#start-clickstack\}

如果你还没有正在运行的 ClickStack，可通过以下命令启动：
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### 获取 ClickStack API key \{#get-api-key-demo\}

用于将 traces 发送到 ClickStack OTLP endpoint 的 API key。

1. 在你的 ClickStack URL (例如：http://localhost:8080) 中打开 HyperDX
2. 如有需要，先创建账户或登录
3. 进入 **Team Settings → API Keys**
4. 复制你的 **摄取 API key**

<Image img={api_key} alt="ClickStack API Key"/>

将你的 API key 设置为环境变量：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### 将 traces 发送到 ClickStack \{#send-traces\}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

你应当会看到类似 `{"partialSuccess":{}}` 的响应，表示 traces 已成功发送。

#### 在 HyperDX 中验证 traces \{#verify-demo-traces\}

1. 打开 [HyperDX](http://localhost:8080/) 并登录到你的账户（如有需要，先创建账户）
2. 进入 **Search** 视图，并将 source 设置为 **Traces**
3. 将时间范围设置为 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

<Image img={search_view} alt="Traces search view"/>

<Image img={trace_view} alt="Individual trace view"/>

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**。这里设置较宽的时间范围是为了确保你无论身在何处都能看到演示 traces。一旦看到 traces 后，你可以将范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 \{#dashboards\}

为了帮助你快速开始监控 Node.js 应用的性能，我们提供了一个预构建的仪表板，其中包含关键的跟踪（traces）可视化。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.nodejs_traces_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download-dashboard\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并进入 **Dashboards** 部分
2. 点击右上角省略号菜单中的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板"/>

3. 上传 `nodejs-traces-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 仪表板将被创建，并且所有可视化都已预先配置好 \{#created-dashboard\}

<Image img={example_dashboard} alt="示例仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**（根据本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 \{#troubleshooting\}

### 通过 curl 发送的示例 trace 未出现 \{#demo-traces-not-appearing\}

如果您已经通过 curl 发送了 trace，但在 HyperDX 中仍未看到，请尝试再次发送这些 trace：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

这是一个已知问题，只会在通过 curl 使用演示方式时出现，不会影响已接入监控的生产环境应用。

### HyperDX 中未显示 Trace 数据 \{#no-traces\}

**确认环境变量已设置：**

```bash
echo $CLICKSTACK_API_KEY
# Should output your API key

echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should output http://localhost:4318 or your ClickStack host
```

**验证网络连通性：**

```bash
curl -v http://localhost:4318/v1/traces
```

应已成功连接到 OTLP 端点。

**检查应用日志：**
在应用启动时查找 OpenTelemetry 初始化相关的日志消息。HyperDX SDK 应该会输出一条确认其已完成初始化的日志。

## 后续步骤 \{#next-steps\}

如果您希望进一步探索，可以尝试以下步骤来改进和扩展您的仪表板：

- 为关键指标（错误率、延迟阈值）[设置告警](/use-cases/observability/clickstack/alerts)
- 为特定使用场景（API 监控、安全事件）创建额外的仪表板

## 迁移到生产环境 \{#going-to-production\}

本指南使用 HyperDX SDK，将 trace 数据直接发送到 ClickStack 的 OTLP 端点。此方式非常适合开发、测试以及中小规模的生产部署。
对于更大规模的生产环境，或者当你需要对遥测数据进行更精细的控制时，建议以 agent 形式部署你自己的 OpenTelemetry Collector。
有关生产环境部署模式和 Collector 配置示例，请参阅 [使用 OpenTelemetry 进行数据摄取](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。