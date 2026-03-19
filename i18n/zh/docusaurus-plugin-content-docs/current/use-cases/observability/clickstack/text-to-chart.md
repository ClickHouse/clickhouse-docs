---
slug: /use-cases/observability/clickstack/text-to-chart
title: '文本转图表'
sidebar_label: '文本转图表'
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中使用 AI 驱动的文本转图表功能，根据自然语言提示生成图表。'
doc_type: 'guide'
keywords: ['clickstack', 'text-to-chart', 'AI', 'visualization', 'Chart Explorer', 'natural language', '可观测性']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import text_to_chart from '@site/static/images/clickstack/text-to-chart/text-to-chart.png';
import chart_explorer from '@site/static/images/clickstack/text-to-chart/chart-explorer.png';
import create_connection from '@site/static/images/clickstack/text-to-chart/create-connection.png';

ClickStack 的 Text-to-Chart 功能允许您通过自然语言描述想要查看的内容来创建可视化。无需手动选择指标、过滤器和分组字段，您只需输入诸如 &quot;过去 24 小时内按服务划分的错误率&quot; 这样的提示词，ClickStack 就会自动生成相应的图表。

此功能使用大型语言模型 (LLM) 将您的文本提示词转换为查询，然后在 [Chart Explorer](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) 中生成可视化。它适用于任何已配置的数据源。


## 前提条件 \{#prerequisites\}

Text-to-Chart 需要 [Anthropic API 密钥](https://console.anthropic.com/)。启动 ClickStack 时，请设置 `ANTHROPIC_API_KEY` 环境变量。

对于开源部署，请通过环境变量传入该密钥。具体方式因部署类型而异：

<Tabs groupId="deployMethod">
  <TabItem value="docker-aio" label="Docker（All-in-One 或本地模式）" default>
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
    ```
  </TabItem>

  <TabItem value="docker-hyperdx" label="Docker（仅 HyperDX）">
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
    ```
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    将该变量添加到 `.env` 文件中，或直接在 `docker-compose.yaml` 中设置：

    ```yaml
    services:
      app:
        environment:
          ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ```
  </TabItem>

  <TabItem value="helm" label="Helm">
    使用 `--set` 传入该密钥：

    ```bash
    helm install my-hyperdx hyperdx/hdx-oss-v2 \
      --set env[0].name=ANTHROPIC_API_KEY \
      --set env[0].value=<YOUR_KEY>
    ```
  </TabItem>
</Tabs>

## 使用 Text-to-Chart \{#using-text-to-chart\}

<VerticalStepper headerLevel="h3">

### 打开 Chart Explorer \{#navigate-chart-explorer\}

在 HyperDX 左侧菜单中选择 **Chart Explorer**。

### 选择数据源 \{#select-data-source\}

选择您想要可视化的数据源，例如 **日志**、**链路追踪** 或 **Metrics**。

<Image img={chart_explorer} alt="Chart explorer" />

### 输入文本提示词 \{#enter-text-prompt\}

在 Chart Explorer 顶部找到 **AI Assistant** 输入框。输入您想创建的图表的自然语言描述。例如：

- `Show error rates by service over the last 24 hours`
- `Latency breakdown by endpoint`
- `Count of events over time grouped by severity`

ClickStack 会将该提示词转换为查询，并自动渲染可视化结果。

<Image img={text_to_chart} alt="Text to chart" />

</VerticalStepper>

## 使用演示数据试用 \{#demo-data\}

试用 Text-to-Chart 的最快方式是使用[本地模式](/use-cases/observability/clickstack/deployment/local-mode-only) Docker 镜像和[远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data)：

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 clickhouse/clickstack-local:latest
```

访问 `localhost:8080`。要连接到演示数据，请前往 **Team Settings**，然后使用以下信息创建一个新连接：

* **Connection Name**: `Demo`
* **Host**: `https://sql-clickhouse.clickhouse.com`
* **Username**: `otel_demo`
* **Password**: 留空

<Image img={create_connection} alt="创建连接" />

然后将各个数据源——**Logs**、**Traces**、**Metrics** 和 **Sessions**——修改为使用 `otel_v2` 数据库。有关数据源配置的完整说明，请参阅[远程演示数据集指南](/use-cases/observability/clickstack/getting-started/remote-demo-data)。

连接成功后，打开 **Chart Explorer**，针对可用的日志、链路追踪和指标尝试输入提示词。


## 示例提示词 \{#example-prompts\}

以下提示词演示了处理可观测性数据时的常见用例：

| 提示词                                               | 数据源  | 描述                 |
| ------------------------------------------------- | ---- | ------------------ |
| `Error count by service over time`                | 日志   | 按时间展示各服务的错误频率      |
| `Average request duration grouped by endpoint`    | 链路追踪 | 显示各端点的延迟模式         |
| `P99 latency by service`                          | 链路追踪 | 识别各服务的尾延迟          |
| `Count of 5xx status codes over the last 6 hours` | 日志   | 跟踪过去 6 小时内服务器错误的趋势 |

提示词可以引用已配置数据源中任何可用的列或属性。提示词越具体，生成的图表就越准确。

## 限制 \{#limitations\}

* Text-to-Chart 目前支持使用 Anthropic 作为 LLM 提供商。对包括 OpenAI 在内的更多提供商的支持计划将在后续版本中推出。
* 目前仅支持将日志和链路追踪用作数据源，尚不支持 Prometheus 指标。
* 图表的准确性取决于提示词是否清晰以及底层数据的结构。如果生成的图表不符合预期，请尝试改写提示词，或明确指定列名。

## 延伸阅读 \{#further-reading\}

* [从文本到图表：借助 ClickStack 更快实现可视化](https://clickhouse.com/blog/text-to-charts-faster-way-to-visualize-clickstack) — 介绍该功能的博文
* [仪表板和可视化](/use-cases/observability/clickstack/dashboards) — 使用 Chart Explorer 手动创建图表
* [搜索](/use-cases/observability/clickstack/search) — 全文搜索和属性搜索语法
* [配置](/use-cases/observability/clickstack/config) — ClickStack 的全部环境变量