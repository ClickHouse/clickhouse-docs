---
sidebar_position: 1
sidebar_label: '自动伸缩'
slug: /manage/scaling
description: '在 ClickHouse Cloud 中配置自动伸缩'
keywords: ['自动伸缩', '自动扩缩容', '扩缩容', '水平扩展', '垂直扩展', '突发流量']
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


# 自动伸缩

伸缩是指根据客户端需求调整可用资源的能力。Scale 和 Enterprise 层级（标准 1:4 配置）的服务可以通过以编程方式调用 API，或在 UI 中更改设置来进行水平伸缩，从而调整系统资源。这些服务也可以进行**自动垂直伸缩**，以满足应用程序的需求。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 和 Enterprise 层级同时支持单副本和多副本服务，而 Basic 层级仅支持单副本服务。单副本服务的规格是固定的，不支持垂直或水平伸缩。用户可以升级到 Scale 或 Enterprise 层级来对其服务进行伸缩。
:::



## ClickHouse Cloud 中的扩缩容工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前，ClickHouse Cloud 在 Scale 层级服务上支持垂直自动扩缩容和手动水平扩缩容。

对于 Enterprise 层级服务，扩缩容行为如下：

- **水平扩缩容**：在 Enterprise 层级的所有标准和自定义配置中均支持手动水平扩缩容。
- **垂直扩缩容**：
  - 标准配置（1:4）支持垂直自动扩缩容。
  - 自定义配置（`highMemory` 和 `highCPU`）不支持垂直自动扩缩容或手动垂直扩缩容。不过，仍然可以通过联系支持团队对这些服务进行垂直扩缩容。

:::note
ClickHouse Cloud 中的扩缩容采用我们称之为 ["先建后拆" (Make Before Break, MBB)](/cloud/features/mbb) 的方式。
在移除旧副本之前，会先添加一个或多个新规格的副本，从而在扩缩容操作期间避免任何容量损失。
通过消除移除现有副本与添加新副本之间的空档期，MBB 能够带来更加平滑、干扰更小的扩缩容过程。
在扩容场景中，MBB 尤其有用：当高资源利用率触发额外容量需求时，如果过早移除副本只会进一步加剧资源紧张。
作为这一机制的一部分，我们会最多等待一小时，让旧副本上已有的查询执行完成后才将其移除。
这样既保证了现有查询有机会完成，又能避免旧副本长时间滞留。

请注意，作为此次变更的一部分：
1. 在扩缩容事件中，系统表的历史数据最多保留 30 天。此外，作为向新的组织层级迁移的一部分，AWS 或 GCP 上服务在 2024 年 12 月 19 日之前的系统表数据，以及 Azure 上服务在 2025 年 1 月 14 日之前的系统表数据将不会被保留。
2. 对于启用了 TDE（Transparent Data Encryption，透明数据加密）的服务，目前在 MBB 操作后不会保留系统表数据。我们正在努力消除这一限制。
:::

### 垂直自动扩缩容 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自动垂直扩缩容"/>

Scale 和 Enterprise 服务支持基于 CPU 和内存使用情况的自动扩缩容。我们会在回溯窗口（跨度为过去 30 小时）内持续监控服务的历史使用情况，以此做出扩缩容决策。如果使用率高于或低于某些阈值，我们会对服务进行相应扩缩容，以匹配负载需求。

对于非 MBB 服务，当 CPU 使用率超过 50-75% 范围内的上限阈值时（具体阈值取决于集群规模），基于 CPU 的自动扩缩容将被触发。此时，集群的 CPU 配额会被翻倍。如果 CPU 使用率降到上限阈值一半以下（例如上限阈值为 50% 时降到 25%），则 CPU 配额会减半。

对于已采用 MBB 扩缩容策略的服务，扩容会在 CPU 使用率达到 75% 阈值时触发，缩容则在该阈值的一半（即 37.5%）时触发。

基于内存的自动扩缩容会将集群扩展至最大内存使用量的 125%，如果遇到 OOM（out of memory，内存耗尽）错误，则最多扩展到 150%。

会从 CPU 和内存的扩缩容建议中选择**较大**的那个，同时为服务分配的 CPU 和内存会以 `1` CPU 和 `4 GiB` 内存为步长同步调整。

### 配置垂直自动扩缩容 {#configuring-vertical-auto-scaling}

拥有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的扩缩容配置。要配置垂直自动扩缩容，请进入服务的 **Settings** 选项卡，并按如下所示调整最小和最大内存以及 CPU 设置。

:::note
单副本服务在所有层级中都无法进行扩缩容。
:::

<Image img={auto_scaling} size="lg" alt="扩缩容设置页面" border/>

将副本的 **Maximum memory** 设置为高于 **Minimum memory** 的值。随后，服务会在这些边界范围内根据需要自动扩缩容。在初始创建服务流程中也可以设置这些参数。服务中的每个副本都会被分配相同的内存和 CPU 资源。

你也可以选择将这两个值设置为相同，从而将服务“锁定”在一个固定配置上。这样做会立即将服务扩缩容到你选择的目标规格。

需要注意的是，这会禁用集群上的任何自动扩缩容功能，你的服务也将无法再针对 CPU 或内存使用率超出这些设置的情况获得保护。

:::note
对于 Enterprise 层级服务，标准 1:4 配置将支持垂直自动扩缩容。
自定义配置在首发时不支持垂直自动扩缩容或手动垂直扩缩容。
不过，仍然可以通过联系支持团队对这些服务进行垂直扩缩容。
:::



## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

可以使用 ClickHouse Cloud 的 [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的伸缩设置来扩展服务，或者在云控制台中调整副本数量。

**Scale** 和 **Enterprise** 级别也支持单副本服务。服务在横向扩容之后，可以再缩容至最少单个副本。请注意，单副本服务的可用性较低，不建议用于生产环境。

:::note
服务在水平方向最多可以扩展到 20 个副本。如果需要更多副本，请联系我们的支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要对集群进行水平扩展，可通过 API 发出 `PATCH` 请求来调整副本数量。下面的截图展示了一个将 `3` 副本集群扩容到 `6` 副本的 API 调用以及对应的响应。

<Image img={scaling_patch_request} size="lg" alt="扩展 PATCH 请求" border/>

*用于更新 `numReplicas` 的 `PATCH` 请求*

<Image img={scaling_patch_response} size="md" alt="扩展 PATCH 响应" border/>

*来自 `PATCH` 请求的响应*

如果在已有扩展操作正在进行时再次发起新的扩展请求或连续发起多个请求，伸缩服务将忽略中间状态，并收敛到最终的副本数量。

### 通过 UI 进行水平扩展 {#horizontal-scaling-via-ui}

要在 UI 中对服务进行水平扩展，可以在 **Settings** 页面中调整该服务的副本数量。

<Image img={scaling_configure} size="md" alt="扩展配置设置" border/>

*ClickHouse Cloud 控制台中的服务扩展设置*

服务扩展完成后，云控制台中的指标仪表盘应显示该服务正确的资源分配。下面的截图展示了集群扩展到总内存 `96 GiB` 的情况，即 `6` 个副本，每个副本分配 `16 GiB` 内存。

<Image img={scaling_memory_allocation} size="md" alt="内存扩展分配" border />



## 自动空闲 {#automatic-idling}
在 **Settings** 页面中，你还可以选择是否允许在服务处于非活动状态时自动进入空闲，如上图所示（即服务当前未执行任何用户提交的查询时）。自动空闲可以降低服务成本，因为当服务暂停时，你无需为计算资源付费。

:::note
在某些特殊情况下，例如当服务包含大量数据片段（parts）时，服务不会被自动置为空闲。

服务可能进入一种空闲状态，在该状态下会暂停刷新[可刷新的物化视图](/materialized-view/refreshable-materialized-view)、从 [S3Queue](/engines/table-engines/integrations/s3queue) 中消费数据，以及调度新的合并操作。现有的合并操作会在服务转换为空闲状态之前完成。若要确保可刷新的物化视图和 S3Queue 消费能够持续运行，请禁用自动空闲功能。
:::

:::danger 不应使用自动空闲的场景
仅当你的使用场景可以接受查询开始响应前的一段延迟时，才应使用自动空闲，因为当服务被暂停时，与服务的连接会超时。自动空闲非常适合不经常使用、且可以容忍一定延迟的服务。不建议在为高频使用的、面向客户的功能提供支撑的服务上启用自动空闲。
:::



## 处理工作负载峰值

如果您预期即将出现工作负载峰值，可以使用
[ClickHouse Cloud API](/cloud/manage/api/api-overview)
提前将服务向上扩容以应对这一峰值，并在需求回落后再缩容。

要了解每个副本当前使用的 CPU 核心数和内存使用情况，可以运行下面的查询：

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
