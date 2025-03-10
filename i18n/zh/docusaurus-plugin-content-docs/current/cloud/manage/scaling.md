---
sidebar_position: 1
sidebar_label: 自动扩展
slug: /manage/scaling
description: 在 ClickHouse Cloud 中配置自动扩展
keywords: [自动扩展, auto scaling, scaling, 水平, 垂直, 峰值]
---

import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动扩展

扩展是根据客户需求调整可用资源的能力。Scale 和 Enterprise（具有标准 1:4 配置文件）级别的服务可以通过编程调用 API 进行水平扩展，或者通过 UI 更改设置来调整系统资源。或者，这些服务可以进行 **自动垂直扩展** 以满足应用需求。

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

## 在 ClickHouse Cloud 中扩展的工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前，ClickHouse Cloud 支持 Scale 级别服务的垂直自动扩展和手动水平扩展。

对于 Enterprise 级别服务，扩展工作如下：

- **水平扩展**：手动水平扩展将在企业级的所有标准和自定义配置文件中可用。
- **垂直扩展**：
  - 标准配置文件（1:4）将支持垂直自动扩展。
  - 自定义配置文件在启动时将不支持垂直自动扩展或手动垂直扩展。然而，联系支持团队后，这些服务可以进行垂直扩展。

:::note
我们正在为计算副本引入一种新的垂直扩展机制，称为“先添加后删除”（Make Before Break，MBB）。这种方法在删除旧副本之前添加一个或多个新大小的副本，防止在扩展操作期间任何容量的丢失。通过消除删除现有副本和添加新副本之间的空档，MBB 创建了一个更无缝且干扰更小的扩展过程。这在高资源利用率触发额外容量需求的向上扩展场景中尤其有益，因为过早删除副本只会加剧资源限制。

请注意，作为此更改的一部分，历史系统表数据将在扩展事件中最多保留 30 天。此外，2024 年 12 月 19 日之前的 AWS 或 GCP 服务的任何系统表数据，以及 2025 年 1 月 14 日之前的 Azure 服务的任何系统表数据，将不会作为迁移到新组织级别的一部分被保留。
:::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

Scale 和 Enterprise 服务根据 CPU 和内存使用情况支持自动扩展。我们不断监控服务在 30 小时的回顾窗口中的历史使用情况来做出扩展决策。如果使用率超过或低于某些阈值，我们将相应地扩展服务以匹配需求。

基于 CPU 的自动扩展将在 CPU 使用率超过 50-75% 的上限阈值时启动（实际阈值取决于集群的大小）。此时，分配给集群的 CPU 将翻倍。如果 CPU 使用率低于上限阈值的一半（例如，在上限阈值为 50% 的情况下降至 25%），则 CPU 分配将减半。

基于内存的自动扩展将集群扩展至最大内存使用的 125%，如果遇到 OOM（内存不足）错误，则扩展至 150%。

**较大** 的 CPU 或内存建议被选中，并且分配给服务的 CPU 和内存将在 `1` 个 CPU 和 `4 GiB` 内存的锁步增量中进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale 或 Enterprise 服务的扩展可以由具有 **Admin** 角色的组织成员进行调整。要配置垂直自动扩展，请前往您服务的 **设置** 选项卡并调整最小和最大内存，以及如下面所示的 CPU 设置。

:::note
单副本服务在所有级别中无法扩展。
:::

<div class="eighty-percent">
<img src={auto_scaling}
    alt="扩展设置页面"
    class="image"
/>
</div>

将您副本的 **最大内存** 设置为高于 **最小内存** 的值。服务将根据需要在这些范围内进行扩展。这些设置在初始服务创建过程中也可用。您服务中的每个副本将被分配相同的内存和 CPU 资源。

您还可以选择将这些值设置为相同，从而将服务“固定”到特定配置。这将立即强制扩展到您选择的所需大小。

需要注意的是，这将禁用集群上的任何自动扩展，且您的服务将无法应对超出这些设置的 CPU 或内存使用增加。

:::note
对于 Enterprise 级服务，标准 1:4 配置将支持垂直自动扩展。
自定义配置文件在启动时将不支持垂直自动扩展或手动垂直扩展。
但这些服务可以通过联系支持团队进行垂直扩展。
:::

## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手动水平扩展"/>

您可以使用 ClickHouse Cloud 的 [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的扩展设置或从云控制台调整副本数量来扩展服务。

**Scale** 和 **Enterprise** 级别确实支持单副本服务。然而，在这些级别中，起始为多个副本的服务，或扩展至多个副本的服务只能缩减至至少 `2` 个副本。

:::note
服务可以水平扩展，最多可达 20 个副本。如果您需要更多副本，请联系支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要水平扩展集群，通过 API 发出 `PATCH` 请求以调整副本数量。下面的屏幕截图显示了一个 API 调用，将 `3` 个副本的集群扩展至 `6` 个副本及相应的响应。

<img alt="扩展 PATCH 请求"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_patch_request} />

*`PATCH` 请求以更新 `numReplicas`*

<img alt="扩展 PATCH 响应"
    style={{width: '450px', marginLeft: 0}}
    src={scaling_patch_response} />

*来自 `PATCH` 请求的响应*

如果您发出一个新的扩展请求或多个请求，而其中一个请求已经在进行中，扩展服务将忽略中间状态，并收敛到最终的副本计数。

### 通过 UI 进行水平扩展 {#horizontal-scaling-via-ui}

要通过 UI 水平扩展服务，您可以在 **设置** 页面上调整服务的副本数量。

<img alt="扩展配置设置"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_configure} />

*来自 ClickHouse Cloud 控制台的服务扩展设置*

一旦服务扩展，云控制台中的指标仪表板应显示服务的正确分配。下面的屏幕截图显示集群扩展到总内存 `96 GiB`，这是 `6` 个副本，每个副本的内存分配为 `16 GiB`。

<img alt="扩展内存分配"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_memory_allocation} />

## 自动闲置 {#automatic-idling}
在 **设置** 页面上，您还可以选择是否允许在服务不活动时自动闲置您的服务，如上图所示（即当服务没有执行任何用户提交的查询时）。自动闲置可以降低服务成本，因为当服务处于暂停状态时，您不会被收取计算资源费用。

:::note
在某些特殊情况下，例如，当服务具有大量分区片段时，服务将不会自动闲置。

服务可能进入一种闲置状态，在该状态下暂停 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) 的刷新、来自 [S3Queue](/engines/table-engines/integrations/s3queue) 的消费以及新合并的调度。现有的合并操作将在服务转换到闲置状态之前完成。要确保可刷新的物化视图和 S3Queue 消费的持续运行，请禁用闲置状态功能。
:::

:::danger 何时不使用自动闲置
仅在您的用例能够处理查询响应延迟的情况下使用自动闲置，因为当服务暂停时，连接到服务将超时。自动闲置非常适合不频繁使用且可以容忍延迟的服务。不推荐用于驱动频繁使用的客户功能的服务。
:::

## 处理突发工作负载 {#handling-bursty-workloads}
如果您预期工作负载即将出现高峰，您可以使用
[ClickHouse Cloud API](/cloud/manage/api/services-api-reference.md) 来预先扩展服务以处理高峰，待需求减退后再缩减服务规模。要了解每个副本当前正在使用的 CPU 核心和内存，您可以运行以下查询：

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
