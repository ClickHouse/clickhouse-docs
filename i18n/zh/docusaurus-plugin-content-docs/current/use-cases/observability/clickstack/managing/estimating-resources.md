---
slug: /use-cases/observability/clickstack/estimating-resources
title: '资源估算'
sidebar_label: '资源估算'
pagination_prev: null
pagination_next: null
description: '托管 ClickStack 部署的资源估算指南'
doc_type: 'guide'
keywords: ['ClickStack', '资源', '容量估算', '计算资源', '生产环境', '容量规划']
---

import ResourceEstimation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

<ResourceEstimation />

## 根据您的环境细化容量估算假设 \{#refining-sizing-assumptions\}

该模型假设来自 ClickStack 的持续平均查询量为 1 QPS，涵盖搜索、仪表板和告警等所有查询类型。

对于更高的查询量，可按目标 QPS 线性增加 CPU 需求，即用 CPU 需求乘以目标 QPS。例如，一个以 100 MB/s 速率摄取数据且目标为 9 QPS 的部署，需要 90 个查询 CPU (10 × 9) ，而不是基准的 10 个，因此修正后的总 CPU 数为 100 个 (10 个用于摄取 + 90 个用于查询) 。

存储估算采用保守的 10 倍压缩率。实际情况下，日志、链路追踪和指标通常能达到更高的压缩率。我们建议先用一部分样本数据进行测试，在投入生产前确定压缩率和存储需求。要计算更长保留期所需的存储量，请将每月存储量乘以需要保留的月数。

这假设查询分布相对均衡。若工作负载偏向更重的历史查询或归档查询，计算需求可能会显著不同，应通过负载测试进行验证。我们计划引入更灵活的容量估算模型，以便根据不同的查询分布模式推算查询侧的计算需求。

### 计算示例 \{#worked-example\}

**要求：**每月摄取 1.5 PB，5 QPS，保留 3 个月。

**转换为 MB/s**

容量规划模型以 MB/s 表示。将每月 1.5 PB (1,500 TB) 换算为持续处理量：

* 1,500 TB = 1,500,000,000 MB
* 每月秒数 (30 天) ：30 × 24 × 60 × 60 = 2,592,000
* MB/s = 1,500,000,000 ÷ 2,592,000 ≈ **579 MB/s**

**摄取计算资源**

按每 10 MB/s 的持续摄取需要 1 个 vCPU 计算：

579 ÷ 10 = 摄取需要 **约 58 个 vCPU**

**查询计算资源**

查询计算资源会随摄取处理量和 QPS 同步增长。在 5 QPS 下：

(579 ÷ 10) × 5 = 58 × 5 = 查询需要 **290 个 vCPU**

**存储**

按 30 天持续 579 MB/s 计算，原始摄取量等于每月 1,500 TB。应用假设的 10 倍压缩率后：

* 每月压缩后：1,500 TB ÷ 10 = **150 TB/月**
* 保留 3 个月：150 TB × 3 = **共 450 TB**

**总结**

| 资源          | 数值         |
| ----------- | ---------- |
| 摄取计算资源      | 58 个 vCPU  |
| 查询计算资源      | 290 个 vCPU |
| 总计算资源       | 348 个 vCPU |
| 每月存储 (压缩后)  | 150 TB     |
| 3 个月保留期所需存储 | 450 TB     |

## 隔离可观测性工作负载 \{#isolating-workloads\}

如果您要将 ClickStack 添加到一个**现有的 ClickHouse Cloud 服务**中，而该服务已承载其他工作负载 (例如实时应用分析) ，则强烈建议隔离可观测性流量。

使用 [**托管仓库**](/cloud/reference/warehouses) 创建一个专用于 ClickStack 的**子服务**。这可以让您：

* 将摄取和查询负载与现有应用隔离
* 独立扩展可观测性工作负载
* 防止可观测性查询影响生产分析
* 在需要时跨服务共享相同的底层数据集

这种方法可确保现有工作负载不受影响，同时让 ClickStack 能够随着可观测性数据的增长独立扩展。

对于更大规模的部署或自定义容量规划建议，请联系 Support 以获取更准确的评估。