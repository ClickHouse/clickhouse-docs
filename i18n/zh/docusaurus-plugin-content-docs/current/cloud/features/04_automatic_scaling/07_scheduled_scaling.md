---
sidebar_position: 7
sidebar_label: '定时扩缩容'
slug: /cloud/features/autoscaling/scheduled-scaling
description: '介绍 ClickHouse Cloud 中定时扩缩容功能的文章'
keywords: ['定时扩缩容']
title: '定时扩缩容'
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import scheduled_scaling_1 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-1.png';
import scheduled_scaling_2 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-2.png';

<PrivatePreviewBadge />

ClickHouse Cloud 服务会根据 CPU 和内存利用率自动扩缩容，但许多工作负载都遵循可预测的模式——例如每日的摄取高峰、夜间运行的批次作业，或周末流量大幅下降。对于这些场景，定时扩缩容 可让你精确指定服务应在何时扩容或缩容，而不受实时指标影响。

使用 定时扩缩容 时，你可以直接在 ClickHouse Cloud 控制台中配置一组基于时间的规则。每条规则都会指定执行时间、重复周期 (每日、每周或自定义) 以及目标规模——可以是副本数 (水平扩缩容) 或内存层级 (垂直扩缩容) 。到达计划时间后，ClickHouse Cloud 会自动应用该修改，因此你的服务会在需求到来之前就调整到合适的规模，而不是等到事后再响应。

这不同于基于指标的自动扩缩容，后者会根据 CPU 和内存压力动态调整。定时扩缩容 是确定性的：你可以明确知道扩缩容会在何时发生，以及会调整到什么规模。这两种方法是互补的——服务既可以设置基础扩缩容计划，也能在该时间窗口内继续受益于自动扩缩容，以应对工作负载的意外波动。

定时扩缩容 当前处于 **私有预览** 阶段。要为你的组织启用它，请联系 ClickHouse Support.

## 设置扩缩容计划 \{#setting-up-a-scaling-schedule\}

要配置计划，请在 ClickHouse Cloud 控制台中进入您的服务，然后转到设置。接着，选择**计划重写**并添加一条新规则。

<Image img={scheduled_scaling_1} size="md" alt="ClickHouse Cloud 控制台中的扩缩容计划界面，显示基于时间的扩缩容规则" border />

<Image img={scheduled_scaling_2} size="md" alt="在 ClickHouse Cloud 控制台中配置计划扩缩容规则" border />

每条规则都需要包含：

* **时间：**执行扩缩容操作的时间 (使用您的本地时区)
* **重复周期：**规则的重复频率 (例如每个工作日、每周日)
* **目标规模：**要扩缩到的副本数或内存分配量

您可以组合多条规则，形成完整的每周计划。例如，您可以设置为每个工作日上午 6 点扩容到 5 个副本，并在晚上 8 点缩回到 2 个副本。

## 使用场景 \{#use-cases\}

**批次和 ETL 工作负载：** 在夜间摄取作业开始前扩容，并在作业完成后缩容，避免在白天空闲时段过度配置资源。

**可预测的流量模式：** 对于高峰时段固定的服务 (例如工作时间内的查询流量) ，可以在负载到来前预先扩容，而不是等待自动扩缩容作出响应。

**周末缩容：** 在周末需求较低时减少副本数或降低内存层级，然后在周一早高峰到来前恢复容量。

**成本控制：** 对于需要控制 ClickHouse Cloud 支出的团队，在已知低利用率时段安排缩容，可在无需人工干预的情况下显著减少资源消耗。

:::note
计划的扩缩容操作可能会与同时发生的自动扩缩容建议相互影响——在触发时刻，以计划操作为准。
:::

## 处理工作负载突增 \{#handling-bursty-workloads\}

如果您预计工作负载即将出现高峰，您可以使用
[ClickHouse Cloud API](/cloud/manage/api/api-overview)
提前扩容服务以应对高峰，并在
需求回落后再将其缩容。

要了解每个副本当前使用的 CPU 核心数和内存，
您可以运行以下查询：

```sql
SELECT *
FROM clusterAllReplicas('default', view(
    SELECT
        hostname() AS server,
        anyIf(value, metric = 'CGroupMaxCPU') AS cpu_cores,
        formatReadableSize(anyIf(value, metric = 'CGroupMemoryTotal')) AS memory
    FROM system.asynchronous_metrics
))
ORDER BY server ASC
SETTINGS skip_unavailable_shards = 1
```
