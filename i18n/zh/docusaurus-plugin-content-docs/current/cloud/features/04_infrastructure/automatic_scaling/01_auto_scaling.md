---
sidebar_position: 1
sidebar_label: '自动扩缩容'
slug: /manage/scaling
description: '在 ClickHouse Cloud 中配置自动扩缩容'
keywords: ['autoscaling', 'auto scaling', 'scaling', 'horizontal', 'vertical', 'bursts']
title: '自动扩缩容'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动伸缩

伸缩是指根据客户端需求调整可用资源的能力。Scale 和 Enterprise（标准 1:4 配置）级别的服务可以通过以编程方式调用 API，或在 UI 中更改设置来进行水平伸缩，以调整系统资源。这些服务也可以根据应用需求进行**垂直自动伸缩**。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 和 Enterprise 级别同时支持单副本和多副本服务，而 Basic 级别仅支持单副本服务。单副本服务的规模是固定的，不支持垂直或水平伸缩。用户可以升级到 Scale 或 Enterprise 级别来对其服务进行伸缩。
:::



## ClickHouse Cloud 中的弹性伸缩工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前，对于 Scale 等级的服务，ClickHouse Cloud 支持纵向自动伸缩和手动横向伸缩。

对于 Enterprise 等级的服务，伸缩机制如下：

- **横向伸缩**：在 Enterprise 等级中，所有标准和自定义配置都支持手动横向伸缩。
- **纵向伸缩**：
  - 标准配置（1:4）将支持纵向自动伸缩。
  - 自定义配置（`highMemory` 和 `highCPU`）不支持纵向自动伸缩或手动纵向伸缩。不过，可以通过联系支持团队对这些服务进行纵向伸缩。

:::note
ClickHouse Cloud 中的伸缩采用我们称之为 ["Make Before Break"（MBB）](/cloud/features/mbb) 的方式。
在移除旧副本之前，会先添加一个或多个新规格的副本，从而在伸缩操作期间避免任何容量损失。
通过消除移除现有副本与添加新副本之间的空档，MBB 能够实现更加平滑、干扰更小的伸缩过程。
这种方式在扩容场景中特别有用：当资源利用率较高、需要额外容量时，如果过早移除副本只会进一步加剧资源紧张。
作为这一方法的一部分，我们会等待最长一小时，让旧副本上的现有查询执行完成之后再将其移除。
这样既兼顾了现有查询顺利完成的需求，又能避免旧副本长时间保留。

请注意，作为此次变更的一部分：

1. 在伸缩事件中，历史系统表数据最多保留 30 天。此外，作为迁移到新的组织等级的一部分，对于运行在 AWS 或 GCP 上的服务，早于 2024 年 12 月 19 日的系统表数据将不会被保留；对于运行在 Azure 上的服务，早于 2025 年 1 月 14 日的系统表数据将不会被保留。
2. 对于启用了 TDE（Transparent Data Encryption，透明数据加密）的服务，目前在执行 MBB 操作后不会保留系统表数据。我们正在努力消除这一限制。
   :::

### 纵向自动伸缩 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature='Automatic vertical scaling' />

Scale 和 Enterprise 服务支持基于 CPU 和内存使用率的自动伸缩。我们会在一个回溯时间窗口内（覆盖过去 30 小时）持续监控服务的历史使用情况，并据此做出伸缩决策。如果使用率高于或低于某些阈值，我们会相应地调整服务规模以匹配负载需求。

对于非 MBB 服务，当 CPU 使用率超过 50–75% 范围内的上限阈值（实际阈值取决于集群规模）时，会触发基于 CPU 的自动伸缩，此时集群的 CPU 分配会翻倍。如果 CPU 使用率下降到该上限阈值的一半以下（例如上限为 50% 时降到 25%），CPU 分配则会减半。

对于已经采用 MBB 伸缩方式的服务，当 CPU 使用率达到 75% 时触发扩容，当 CPU 使用率降到该阈值的一半（即 37.5%）时触发缩容。

基于内存的自动伸缩会将集群内存规模调整到峰值内存使用量的 125%，如果出现 OOM（out of memory，内存不足）错误，则最多可扩展到 150%。

会在 CPU 和内存推荐值中选择**较大**的一个，并按 `1` 个 CPU 和 `4 GiB` 内存为步长同步调整分配给服务的 CPU 与内存资源。

### 配置纵向自动伸缩 {#configuring-vertical-auto-scaling}

具有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的伸缩行为。要配置纵向自动伸缩，请转到对应服务的 **Settings** 选项卡，并按照下图所示调整最小和最大内存以及 CPU 设置。

:::note
在所有等级中，单副本服务都无法进行伸缩。
:::

<Image img={auto_scaling} size='lg' alt='伸缩设置页面' border />

将副本的 **Maximum memory** 设置为高于 **Minimum memory** 的值。之后服务会在这两个边界之间按需伸缩。这些设置同样可以在初始创建服务流程中进行配置。服务中的每个副本都会被分配相同的内存和 CPU 资源。

你也可以选择将这两个值设置为相同，从而将服务“固定”在一个特定配置上。这样做会立即强制服务伸缩到你选择的目标规格。

需要特别注意，这样会禁用集群上的所有自动伸缩机制，当 CPU 或内存使用率超过这些设置时，你的服务将得不到自动保护。

:::note
对于 Enterprise 等级的服务，标准 1:4 配置将支持纵向自动伸缩。
自定义配置在初始阶段不支持纵向自动伸缩或手动纵向伸缩。
不过，可以通过联系支持团队对这些服务进行纵向伸缩。
:::


## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature='Manual horizontal scaling' />

您可以使用 ClickHouse Cloud [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 更新服务的扩展设置来扩展服务,或从云控制台调整副本数量。

**Scale** 和 **Enterprise** 层级还支持单副本服务。服务扩展后,可以缩减至最少一个副本。请注意,单副本服务的可用性较低,不建议在生产环境中使用。

:::note
服务最多可以水平扩展至 20 个副本。如果您需要更多副本,请联系我们的支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要水平扩展集群,请通过 API 发送 `PATCH` 请求以调整副本数量。下面的截图显示了将 `3` 副本集群扩展到 `6` 副本的 API 调用及相应的响应。

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

在 **Settings** 页面中,您可以选择是否允许服务在不活动时自动进入空闲状态,如上图所示(即服务未执行任何用户提交的查询时)。自动空闲可降低服务成本,因为服务暂停时不会对计算资源计费。

:::note
在某些特殊情况下,例如当服务具有大量数据分片(parts)时,服务不会自动进入空闲状态。

服务可能进入空闲状态,此时会暂停[可刷新物化视图](/materialized-view/refreshable-materialized-view)的刷新、[S3Queue](/engines/table-engines/integrations/s3queue) 的消费以及新合并操作的调度。现有的合并操作将在服务转换到空闲状态之前完成。为确保可刷新物化视图和 S3Queue 消费的持续运行,请禁用空闲状态功能。
:::

:::danger 何时不应使用自动空闲
仅当您的使用场景可以容忍查询响应延迟时才使用自动空闲,因为当服务暂停时,与服务的连接将超时。自动空闲非常适合不经常使用且可以容忍延迟的服务。不建议将其用于支持频繁使用的面向客户功能的服务。
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
