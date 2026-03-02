---
sidebar_position: 1
sidebar_label: '自动扩缩容'
slug: /manage/scaling
description: '配置 ClickHouse Cloud 的自动扩缩容功能'
keywords: ['自动扩缩容', '自动伸缩', '扩缩容', '水平扩展', '垂直扩展', '突发流量']
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


# 自动扩缩容 \{#automatic-scaling\}

扩缩容是指根据需求调整可用资源以满足客户端请求的能力。Scale 和 Enterprise（使用标准 1:4 配置）层级的服务可以通过以编程方式调用 API，或在 UI 中更改设置来水平扩缩系统资源。这些服务也可以进行**自动垂直扩缩容**，以满足应用负载需求。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 和 Enterprise 层级同时支持单副本和多副本服务，而 Basic 层级仅支持单副本服务。单副本服务的规模是固定的，不允许垂直或水平扩缩容。可以升级到 Scale 或 Enterprise 层级来对服务进行扩缩容。
:::

## ClickHouse Cloud 中的扩缩容工作原理 \{#how-scaling-works-in-clickhouse-cloud\}

当前，ClickHouse Cloud 在 Scale 层级服务上支持垂直自动扩缩容以及手动水平扩缩容。

对于 Enterprise 层级服务，扩缩容的工作方式如下：

- **水平扩缩容**：在 Enterprise 层级上，所有标准和自定义配置文件都支持手动水平扩缩容。
- **垂直扩缩容**：
  - 标准配置文件（1:4）支持垂直自动扩缩容。
  - 自定义配置文件（`highMemory` 和 `highCPU`）不支持垂直自动扩缩容或手动垂直扩缩容。不过，可以通过联系支持团队对这些服务进行垂直扩缩容。

:::note
ClickHouse Cloud 中的扩缩容采用我们称之为 ["Make Before Break" (MBB)](/cloud/features/mbb) 的方式。
在移除旧副本之前，会先添加一个或多个新规格的副本，从而在扩缩容操作期间避免任何容量损失。
通过消除移除现有副本与添加新副本之间的时间间隙，MBB 实现了更加平滑、干扰更小的扩缩容过程。
这对于向上扩容场景尤为有利：在高资源使用率触发额外容量需求时，如果过早移除副本只会进一步加剧资源紧张。
作为该方式的一部分，我们最多会等待一小时，让旧副本上已有的查询执行完成后再将其移除。
这在保证现有查询得以完成的同时，也避免旧副本保留时间过长。
:::

### 垂直自动扩缩容 \{#vertical-auto-scaling\}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale 和 Enterprise 服务支持基于 CPU 和内存使用率的自动扩缩容。我们会在一个回溯时间窗口内（涵盖过去 30 小时）持续监控服务的历史使用情况，以做出扩缩容决策。如果使用率升高或降低到某些阈值之外，我们会相应地扩容或缩容服务，以匹配实际需求。

对于非 MBB 服务，当 CPU 使用率跨过 50–75% 范围内的上限阈值（实际阈值取决于集群规模）时，会触发基于 CPU 的自动扩缩容。此时，分配给集群的 CPU 资源会翻倍。如果 CPU 使用率下降到该上限阈值的一半以下（例如对于 50% 的上限阈值，下降到 25%），则 CPU 分配会减半。 

对于已经采用 MBB 扩缩容方式的服务，当 CPU 使用率达到 75% 阈值时会触发扩容，而当使用率降到该阈值的一半（即 37.5%）时会触发缩容。

基于内存的自动扩缩容会将集群扩容到最大内存使用量的 125%，如果出现 OOM（out of memory）错误，则最多扩容到 150%。

会在 CPU 和内存推荐值中选择**较大**的那个，然后以 `1` 个 CPU 和 `4 GiB` 内存为同步步长，对服务所分配的 CPU 和内存进行成对扩缩容。

### 配置垂直自动扩缩容 \{#configuring-vertical-auto-scaling\}

具有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的扩缩容设置。要配置垂直自动扩缩容，请转到服务的 **Settings** 选项卡，并按照下图所示调整最小和最大内存以及 CPU 设置。

:::note
单副本服务并非在所有层级都支持扩缩容。
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

将副本的 **Maximum memory** 设置为高于 **Minimum memory** 的值。随后服务会在这些范围内按需扩缩容。这些设置也可以在服务初始创建流程中进行配置。服务中的每个副本都会被分配相同的内存和 CPU 资源。

你也可以选择将这两个值设置为相同，从而将服务“固定”到一个特定配置。这样做会立即将服务扩缩容到你选择的目标规格。

需要注意的是，这样会禁用集群上的任何自动扩缩容，并且当 CPU 或内存使用超过这些设置时，你的服务将不会受到保护。

:::note
对于 Enterprise 层级服务，标准 1:4 配置规格将支持垂直自动扩缩容。
自定义配置规格在创建时不支持垂直自动扩缩容或手动垂直扩缩容。
不过，可以通过联系支持团队对这些服务进行垂直扩缩容。
:::

## 手动水平扩展 \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

你可以使用 ClickHouse Cloud 的[公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)，通过更新服务的扩缩容设置来对服务进行扩缩容，或者在 Cloud 控制台中调整副本数量。

**Scale** 和 **Enterprise** 等级也支持单副本服务。已扩容的服务可以再缩容回至少一个副本。请注意，单副本服务的可用性较低，不建议在生产环境中使用。

:::note
服务在水平方向最多可以扩展到 20 个副本。如果你需要更多副本，请联系我们的支持团队。
:::

### 通过 API 进行水平扩缩容 \{#horizontal-scaling-via-api\}

要对集群进行水平扩缩容，可通过 API 发送 `PATCH` 请求来调整副本数量。下方截图展示了一个将 `3` 个副本的集群扩容到 `6` 个副本的 API 调用，以及相应的响应结果。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*用于更新 `numReplicas` 的 `PATCH` 请求*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` 请求返回的响应*

如果在某个扩缩容操作仍在进行时再次发起新的扩缩容请求，或连续发起多个请求，扩缩容服务会忽略中间状态，并最终收敛到目标副本数量。

### 通过 UI 进行横向扩展 \{#horizontal-scaling-via-ui\}

要在 UI 中对服务进行横向扩展，可以在 **Settings** 页面上调整该服务的副本数。

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*来自 ClickHouse Cloud 控制台的服务扩展设置*

服务扩展完成后，ClickHouse Cloud 控制台中的指标仪表板应正确显示分配给该服务的资源。下方截图显示集群已经扩展到总内存 `96 GiB`，即 `6` 个副本，每个副本分配 `16 GiB` 内存。

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 自动空闲 \{#automatic-idling\}

在 **Settings** 页面中，您还可以选择是否允许服务在一段时间内处于非活动状态时自动进入空闲状态（即当服务未执行任何用户提交的查询时）。自动空闲可以降低服务成本，因为在服务暂停时不会为计算资源计费。

### 自适应空闲 \{#adaptive-idling\}

ClickHouse Cloud 实现了自适应空闲机制，在优化成本节约的同时防止服务中断。系统在将服务切换为空闲状态之前会评估多个条件。当满足以下任一条件时，自适应空闲会覆盖已配置的空闲持续时间：

- 当分区片段数量超过最大空闲分区片段阈值（默认：10,000）时，为了让后台维护能够持续进行，服务不会进入空闲状态
- 当存在正在进行中的合并操作时，为避免中断关键数据整合，在这些合并完成之前服务不会进入空闲状态
- 此外，服务还会根据服务器初始化时间调整空闲超时时间：
  - 如果服务器初始化时间少于 15 分钟，则不会应用自适应超时，而是使用用户配置的默认空闲超时时间
  - 如果服务器初始化时间在 15 到 30 分钟之间，则空闲超时时间设置为 15 分钟
  - 如果服务器初始化时间在 30 到 60 分钟之间，则空闲超时时间设置为 30 分钟
  - 如果服务器初始化时间超过 60 分钟，则空闲超时时间设置为 1 小时

:::note
服务可能会进入一种空闲状态，在该状态下会暂停刷新 [refreshable materialized views](/materialized-view/refreshable-materialized-view)、从 [S3Queue](/engines/table-engines/integrations/s3queue) 中消费数据，以及调度新的合并操作。现有的合并操作会在服务切换为空闲状态之前完成。若要确保 refreshable materialized views 刷新和 S3Queue 消费的持续运行，请禁用空闲状态功能。
:::

:::danger 何时不应使用自动空闲
仅当你的用例可以接受在响应查询前存在一定延迟时，才使用自动空闲机制，因为当服务被暂停时，与服务的连接会超时。自动空闲非常适合使用频率较低且可容忍延迟的服务。不建议在支撑高频使用的、面向客户功能的服务上使用自动空闲。
:::

## 处理工作负载高峰 \{#handling-bursty-workloads\}

如果您预期工作负载即将出现高峰，可以使用
[ClickHouse Cloud API](/cloud/manage/api/api-overview)
预先向上扩容服务以应对高峰，并在需求回落后再缩减规模。

要了解每个副本当前使用的 CPU 核心数和内存情况，可以运行下面的查询：

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
