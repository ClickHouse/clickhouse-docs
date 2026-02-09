---
sidebar_label: 'Langfuse'
slug: /cloud/features/ai-ml/langfuse
title: 'Langfuse'
description: 'Langfuse 是一个开源的 LLM 工程平台，帮助团队协同调试、分析并迭代其 LLM 应用。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Langfuse \{#langfuse\}

## 什么是 Langfuse？ \{#what-is-langfuse\}

[Langfuse](https://langfuse.com) 是一个开源的大语言模型（LLM）工程平台，帮助团队协作调试、分析并迭代其 LLM 应用。它是 ClickHouse 生态系统的一部分，以 **ClickHouse** 为核心，提供可扩展、高性能的可观测性后端。

通过利用 ClickHouse 的列式存储和高速分析能力，Langfuse 可以以低延迟处理数十亿条跟踪记录（traces）和事件，非常适合高吞吐量的生产工作负载。

## 为什么选择 Langfuse？ \{#why-langfuse\}

- **开源：** 完全开源，并提供公开 API 用于自定义集成
- **生产环境优化：** 设计时将性能开销降至最低
- **一流 SDKS：** 为 Python 和 JavaScript 提供原生 SDK
- **框架支持：** 集成 OpenAI SDK、LangChain 和 LlamaIndex 等主流框架
- **多模态：** 支持对文本、图像和其他模态进行追踪
- **完整平台：** 为整个 LLM 应用开发生命周期提供完整的工具套件

## 部署选项 \{#deployment-options\}

Langfuse 提供灵活的部署选项，以满足不同的安全性和基础设施需求。

**[Langfuse Cloud](https://cloud.langfuse.com)** 是一项完全托管的服务，由托管的 ClickHouse 集群提供支持，以实现最佳性能。它通过了 SOC 2 Type II 和 ISO 27001 认证，符合 GDPR 要求，并在美国（AWS us-west-2）和欧盟（AWS eu-west-1）数据区域可用。

**[自托管](https://langfuse.com/self-hosting)** 的 Langfuse 完全开源（MIT 许可证），可以使用 Docker 或 Kubernetes 免费部署在您自己的基础设施上。您可以运行自己的 ClickHouse 实例（或使用 ClickHouse Cloud）来存储可观测性数据，从而确保对数据实现完全掌控。 

## 架构 \{#architecture\}

Langfuse 仅依赖开源组件，可以部署在本地、云基础设施或本地自建环境中：

* **ClickHouse**：存储大规模的可观测性数据（traces、spans、generations、scores），并为仪表板提供快速聚合与分析能力。
* **Postgres**：存储事务型数据，如用户账户、项目配置和 prompt 定义。
* **Redis**：处理事件队列和缓存。
* **S3/Blob Storage**：存储大体量的负载和原始事件数据。

```mermaid
flowchart TB
    User["UI, API, SDKs"]
    subgraph vpc["VPC"]
        Web["Web Server<br/>(langfuse/langfuse)"]
        Worker["Async Worker<br/>(langfuse/worker)"]
        Postgres@{ img: "https://langfuse.com/images/logos/postgres_icon.svg", label: "Postgres - OLTP\n(Transactional Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        Cache@{ img: "https://langfuse.com/images/logos/redis_icon.png", label: "Redis\n(Cache, Queue)", pos: "b", w: 60, h: 60, constraint: "on" }
        Clickhouse@{ img: "https://langfuse.com/images/logos/clickhouse_icon.svg", label: "Clickhouse - OLAP\n(Observability Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        S3@{ img: "https://langfuse.com/images/logos/s3_icon.svg", label: "S3 / Blob Storage\n(Raw events, multi-modal attachments)", pos: "b", w: 60, h: 60, constraint: "on" }
    end
    LLM["LLM API/Gateway<br/>(optional; BYO; can be same VPC or VPC-peered)"]

    User --> Web
    Web --> S3
    Web --> Postgres
    Web --> Cache
    Web --> Clickhouse
    Web -..->|"optional for playground"| LLM

    Cache --> Worker
    Worker --> Clickhouse
    Worker --> Postgres
    Worker --> S3
    Worker -..->|"optional for evals"| LLM
```


## 功能特性 \{#features\}

### 可观测性 \{#observability\}

[可观测性](/docs/observability/overview) 对于理解和调试 LLM 应用至关重要。与传统软件不同，LLM 应用涉及复杂的、非确定性的交互，因而更难监控和调试。Langfuse 提供了全面的追踪能力，帮助你准确理解应用中正在发生的一切。

_📹 想进一步了解？[**观看端到端演示**](https://langfuse.com/watch-demo?tab=observability)，了解 Langfuse 可观测性以及如何将其集成到你的应用中。_

<Tabs groupId="observability">
<TabItem value="trace-details" label="Trace 详情">

Trace 允许你追踪应用中每一次 LLM 调用和其他相关逻辑。

<video src="https://static.langfuse.com/docs-videos/trace-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="sessions" label="会话">

Session 允许你追踪多轮对话或基于 Agent 的多步工作流。

<video src="https://static.langfuse.com/docs-videos/sessions-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="timeline" label="时间线">

通过检查时间线视图来调试延迟问题。

<video src="https://static.langfuse.com/docs-videos/timeline-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="users" label="用户">

添加你自己的 `userId` 以监控每个用户的成本和使用情况。你也可以选择在自己的系统中创建指向此视图的深度链接。

<video src="https://static.langfuse.com/docs-videos/users-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="agent-graphs" label="Agent 图">

可以使用图形来可视化 LLM Agent，以展示复杂 Agent 工作流的执行路径。

<video src="https://static.langfuse.com/docs-videos/langgraph-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="dashboard" label="仪表盘">

在仪表盘中查看质量、成本和延迟指标，以监控你的 LLM 应用。

<video src="https://static.langfuse.com/docs-videos/dashboard.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### 提示管理 \{#prompt-management\}

[提示管理](/docs/prompt-management/overview) 对于构建高效的 LLM 应用至关重要。Langfuse 提供工具，帮助你在整个开发生命周期中对提示进行管理、版本控制和优化。

_📹 想进一步了解？[**观看端到端演示**](https://langfuse.com/watch-demo?tab=prompt)，了解 Langfuse 提示管理以及如何将其集成到你的应用中。_

<Tabs groupId="prompt-management">
<TabItem value="create" label="创建">

通过 UI、SDKs 或 API 创建新的提示。

<video src="https://static.langfuse.com/docs-videos/create-update-prompts.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="version-control" label="版本控制">

通过 UI、API 或 SDKs 协作进行提示的版本管理和编辑。

<video src="https://static.langfuse.com/docs-videos/create-prompt-version.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="deploy" label="部署">

通过标签将提示部署到生产环境或任意其他环境——无需修改任何代码。

<video src="https://static.langfuse.com/docs-videos/deploy-prompt.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="metrics" label="指标">

对比不同提示版本的延迟、成本和评估指标。

<video src="https://static.langfuse.com/docs-videos/prompt-metrics.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="test-in-playground" label="在 Playground 中测试">

在 Playground 中即时测试你的提示。

<video src="https://static.langfuse.com/docs-videos/prompt-to-playground.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="link-with-traces" label="与 Traces 关联">

将提示与 traces 关联，以了解它们在你的 LLM 应用上下文中的实际表现。

<video src="https://static.langfuse.com/docs-videos/linked-generations.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="track-changes" label="跟踪变更">

跟踪提示的变更情况，以了解其随时间的演变。

<video src="https://static.langfuse.com/docs-videos/track-changes.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### 评估与数据集 \{#evaluation\}

[评估](/docs/evaluation/overview) 对于确保你的 LLM 应用的质量和可靠性至关重要。Langfuse 提供灵活的评估工具，可适配你的特定需求，无论你是在开发环境中进行测试，还是在生产环境中监控性能。

_📹 想了解更多？[**观看端到端演示**](https://langfuse.com/watch-demo?tab=evaluation)，了解 Langfuse Evaluation 以及如何利用它改进你的 LLM 应用。_

<Tabs groupId="evaluation">
<TabItem value="analytics" label="分析">

在 Langfuse 控制台中可视化评估结果。

<video src="https://static.langfuse.com/docs-videos/scores-dashboard.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="user-feedback" label="用户反馈">

收集用户反馈。可通过我们的 Browser SDK 在前端采集，也可以通过服务端 SDK 或 API 采集。视频中包含示例应用。

<video src="https://static.langfuse.com/docs-videos/scores-user-feedback.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="llm-as-a-judge" label="LLM-as-a-Judge">

在生产或开发环境中的 trace 上运行完全托管的 LLM-as-a-judge 评估。可应用于应用中的任意步骤，以执行分步评估。

<video src="https://static.langfuse.com/docs-videos/scores-llm-as-a-judge.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="experiments" label="实验">

在用户界面中直接基于数据集评估提示词和模型。无需编写自定义代码。

<video src="https://static.langfuse.com/docs-videos/prompt-experiments.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="annotation-queue" label="标注队列">

通过 Annotation Queues 中的人类标注，为你的评估工作流建立基线。

<video src="https://static.langfuse.com/docs-videos/scores-annotation-queue.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="custom-evals" label="自定义评估">

添加自定义评估结果，支持数值、布尔值和分类值。

```bash
POST /api/public/scores
```

通过 Python 或 JS SDK 添加分数。

```python title="Example (Python)"
langfuse.score(
  trace_id="123",
  name="my_custom_evaluator",
  value=0.5,
)
```

</TabItem>
</Tabs>

## 快速入门 \{#quickstarts\}

几分钟内即可开始使用 Langfuse。选择最符合当前需求的路径：

- [集成 LLM 应用/Agent 跟踪](https://langfuse.com/docs/observability/get-started)
- [集成 Prompt 管理](https://langfuse.com/docs/prompt-management/get-started)
- [设置评估](https://langfuse.com/docs/evaluation/overview)

## 了解更多 \{#learn-more\}

- [Langfuse 文档](https://langfuse.com/docs)
- [Langfuse GitHub 仓库](https://github.com/langfuse/langfuse)
- [观看演示视频](https://langfuse.com/watch-demo)