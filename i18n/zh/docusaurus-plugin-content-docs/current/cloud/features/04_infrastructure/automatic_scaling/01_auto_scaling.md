---
sidebar_position: 1
sidebar_label: '自动伸缩'
slug: /manage/scaling
description: '在 ClickHouse Cloud 中配置自动伸缩'
keywords: ['autoscaling', 'auto scaling', 'scaling', 'horizontal', 'vertical', 'bursts']
title: '自动伸缩'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动扩缩容

扩缩容是指根据客户端需求调整可用资源的能力。Scale 和 Enterprise（标准 1:4 配置）层级的服务可以通过以编程方式调用 API，或在 UI 中更改设置以调整系统资源，实现水平扩缩容。这些服务也可以进行**自动垂直扩缩容**，以满足应用程序需求。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 和 Enterprise 层级支持单副本和多副本服务，而 Basic 层级仅支持单副本服务。单副本服务的规模是固定的，不支持垂直或水平扩缩容。用户可以升级到 Scale 或 Enterprise 层级来扩缩容其服务。
:::



## ClickHouse Cloud 中扩展的工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前,ClickHouse Cloud 为 Scale 层级服务提供垂直自动扩展和手动水平扩展功能。

对于 Enterprise 层级服务,扩展的工作方式如下:

- **水平扩展**:Enterprise 层级的所有标准配置和自定义配置均支持手动水平扩展。
- **垂直扩展**:
  - 标准配置 (1:4) 支持垂直自动扩展。
  - 自定义配置(`highMemory` 和 `highCPU`)不支持垂直自动扩展或手动垂直扩展。但可以通过联系技术支持对这些服务进行垂直扩展。

:::note
ClickHouse Cloud 中的扩展采用我们称之为["先建后断"(MBB)](/cloud/features/mbb) 的方法。
该方法在移除旧副本之前先添加一个或多个新规格的副本,从而防止扩展操作期间出现任何容量损失。
通过消除移除现有副本和添加新副本之间的间隙,MBB 实现了更加平滑且干扰更少的扩展过程。
这在扩容场景中尤其有益,因为在高资源利用率触发额外容量需求时,过早移除副本只会加剧资源约束。
作为该方法的一部分,我们会等待最多一小时,让旧副本上的所有现有查询完成后再将其移除。
这在确保现有查询完成的同时,也保证了旧副本不会保留过长时间。

请注意,作为此变更的一部分:

1. 历史系统表数据作为扩展事件的一部分最多保留 30 天。此外,在迁移到新组织层级的过程中,AWS 或 GCP 上服务早于 2024 年 12 月 19 日的系统表数据,以及 Azure 上服务早于 2025 年 1 月 14 日的系统表数据将不会被保留。
2. 对于使用 TDE(透明数据加密)的服务,系统表数据目前在 MBB 操作后不会被保留。我们正在努力消除此限制。
   :::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature='Automatic vertical scaling' />

Scale 和 Enterprise 服务支持基于 CPU 和内存使用率的自动扩展。我们持续监控服务在回溯窗口(过去 30 小时)内的历史使用情况以做出扩展决策。如果使用率超过或低于特定阈值,我们会相应地扩展服务以匹配需求。

对于非 MBB 服务,当 CPU 使用率超过 50-75% 范围内的上限阈值(实际阈值取决于集群规模)时,基于 CPU 的自动扩展会启动。此时,分配给集群的 CPU 会翻倍。如果 CPU 使用率降至上限阈值的一半以下(例如,在上限阈值为 50% 的情况下降至 25%),CPU 分配会减半。

对于已采用 MBB 扩展方法的服务,扩容发生在 CPU 阈值达到 75% 时,缩容发生在该阈值的一半即 37.5% 时。

基于内存的自动扩展会将集群扩展到最大内存使用量的 125%,如果遇到 OOM(内存不足)错误,则扩展到 150%。

系统会选择 CPU 或内存建议中**较大**的一个,分配给服务的 CPU 和内存会以 `1` 个 CPU 和 `4 GiB` 内存的同步增量进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

具有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的扩展配置。要配置垂直自动扩展,请转到服务的 **Settings** 选项卡,并按如下所示调整最小和最大内存以及 CPU 设置。

:::note
所有层级的单副本服务均无法进行扩展。
:::

<Image img={auto_scaling} size='lg' alt='Scaling settings page' border />

将副本的 **Maximum memory** 设置为高于 **Minimum memory** 的值。服务将根据需要在这些边界内进行扩展。这些设置在初始服务创建流程中也可用。服务中的每个副本将被分配相同的内存和 CPU 资源。

您也可以选择将这些值设置为相同,实质上是将服务"固定"到特定配置。这样做会立即强制扩展到您选择的目标规格。

需要注意的是,这将禁用集群上的任何自动扩展,并且您的服务将无法应对超出这些设置的 CPU 或内存使用率增加。

:::note
对于 Enterprise 层级服务,标准 1:4 配置支持垂直自动扩展。
自定义配置在发布时不支持垂直自动扩展或手动垂直扩展。
但可以通过联系技术支持对这些服务进行垂直扩展。
:::


## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature='Manual horizontal scaling' />

您可以使用 ClickHouse Cloud [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 更新服务的扩展设置来扩展服务,或从云控制台调整副本数量。

**Scale** 和 **Enterprise** 层级还支持单副本服务。服务扩展后,可以缩减至最少一个副本。请注意,单副本服务的可用性较低,不建议用于生产环境。

:::note
服务最多可以水平扩展至 20 个副本。如果您需要更多副本,请联系我们的支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要水平扩展集群,请通过 API 发出 `PATCH` 请求以调整副本数量。下面的截图显示了将 `3` 副本集群扩展到 `6` 副本的 API 调用及相应响应。

<Image
  img={scaling_patch_request}
  size='lg'
  alt='扩展 PATCH 请求'
  border
/>

_更新 `numReplicas` 的 `PATCH` 请求_

<Image
  img={scaling_patch_response}
  size='md'
  alt='扩展 PATCH 响应'
  border
/>

_`PATCH` 请求的响应_

如果您在一个扩展请求正在进行时发出新的扩展请求或连续发出多个请求,扩展服务将忽略中间状态并收敛到最终的副本数量。

### 通过 UI 进行水平扩展 {#horizontal-scaling-via-ui}

要从 UI 水平扩展服务,您可以在 **Settings** 页面调整服务的副本数量。

<Image
  img={scaling_configure}
  size='md'
  alt='扩展配置设置'
  border
/>

_ClickHouse Cloud 控制台中的服务扩展设置_

服务扩展完成后,云控制台中的指标仪表板应显示服务的正确分配情况。下面的截图显示集群已扩展至总内存 `96 GiB`,即 `6` 个副本,每个副本分配 `16 GiB` 内存。

<Image
  img={scaling_memory_allocation}
  size='md'
  alt='扩展内存分配'
  border
/>


## 自动空闲 {#automatic-idling}

在**设置**页面中,您可以选择是否允许服务在不活动时自动进入空闲状态,如上图所示(即服务未执行任何用户提交的查询时)。自动空闲功能可降低服务成本,因为服务暂停时不会对计算资源计费。

:::note
在某些特殊情况下,例如当服务包含大量数据分片(parts)时,服务不会自动进入空闲状态。

服务可能进入空闲状态,此时会暂停[可刷新物化视图](/materialized-view/refreshable-materialized-view)的刷新、[S3Queue](/engines/table-engines/integrations/s3queue)的消费以及新合并操作的调度。现有的合并操作将在服务转换到空闲状态之前完成。为确保可刷新物化视图和 S3Queue 消费的持续运行,请禁用空闲状态功能。
:::

:::danger 何时不应使用自动空闲
仅当您的使用场景可以容忍查询响应延迟时才使用自动空闲功能,因为当服务暂停时,与服务的连接将超时。自动空闲非常适合不经常使用且可以容忍延迟的服务。不建议将其用于支持频繁使用的面向客户功能的服务。
:::


## 处理工作负载峰值 {#handling-bursty-workloads}

如果预计工作负载即将出现峰值,您可以使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 提前扩容服务以应对峰值,并在需求回落后进行缩容。

要了解每个副本当前使用的 CPU 核心数和内存,可以运行以下查询:

```sql
SELECT *
FROM clusterAllReplicas('default', view(
    SELECT
        hostname() AS 服务器,
        anyIf(value, metric = 'CGroupMaxCPU') AS CPU 核心数,
        formatReadableSize(anyIf(value, metric = 'CGroupMemoryTotal')) AS 内存
    FROM system.asynchronous_metrics
))
ORDER BY 服务器 ASC
SETTINGS skip_unavailable_shards = 1
```
