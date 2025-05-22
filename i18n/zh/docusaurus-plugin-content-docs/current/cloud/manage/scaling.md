---
'sidebar_position': 1
'sidebar_label': '自动伸缩'
'slug': '/manage/scaling'
'description': '在 ClickHouse Cloud 中配置自动伸缩'
'keywords':
- 'autoscaling'
- 'auto scaling'
- 'scaling'
- 'horizontal'
- 'vertical'
- 'bursts'
'title': '自动伸缩'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动扩展

扩展是根据客户需求调整可用资源的能力。Scale 和 Enterprise（标准 1:4 配置）层服务可以通过编程调用 API 或在 UI 上更改设置以横向扩展系统资源。或者，这些服务可以**垂直自动扩展**以满足应用程序需求。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

## ClickHouse Cloud 中的扩展工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前，ClickHouse Cloud 支持垂直自动扩展和手动横向扩展 Scale 层服务。

对于 Enterprise 层服务，扩展如下工作：

- **横向扩展**：在企业层，所有标准和自定义配置都可以手动横向扩展。
- **垂直扩展**：
  - 标准配置（1:4）将支持垂直自动扩展。
  - 自定义配置在启动时将不支持垂直自动扩展或手动垂直扩展。但是，可以通过联系支持团队进行垂直扩展。

:::note
我们正在为计算副本引入一种新的垂直扩展机制，我们称之为“Make Before Break”（MBB）。这种方法在移除旧副本之前增加一个或多个新的副本，以防止在扩展操作期间出现任何容量损失。通过消除移除现有副本与添加新副本之间的差距，MBB 创建了一个更无缝且干扰更小的扩展过程。它在向上扩展的场景中特别有利，因为高资源利用率触发了对额外容量的需求，因为过早移除副本只会加剧资源限制。

请注意，作为此更改的一部分，历史系统表数据将在最多 30 天内保留，以便于扩展事件。此外，对于 AWS 或 GCP 上的服务，任何早于 2024 年 12 月 19 日的系统表数据和对于 Azure 上的服务，任何早于 2025 年 1 月 14 日的系统表数据将不会在迁移到新的组织层时保留。
:::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale 和 Enterprise 服务支持基于 CPU 和内存使用情况的自动扩展。我们持续监控服务在过去 30 小时内的历史使用情况，以做出扩展决策。如果使用量超过或低于某些阈值，我们会相应地扩展服务以匹配需求。

基于 CPU 的自动扩展在 CPU 使用量超过 50-75% 的上限阈值时启动（实际阈值取决于集群的大小）。此时，集群的 CPU 分配将加倍。如果 CPU 使用量降到上限阈值的一半以下（例如，在 50% 的上限阈值情况下降到 25%），CPU 分配将减半。

基于内存的自动扩展将集群扩展到最大内存使用量的 125%，如果出现 OOM（内存不足）错误，则扩展到 150%。

选择**更大**的 CPU 或内存建议，并以 `1` CPU 和 `4 GiB` 内存的步幅进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

具有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的扩展配置。要配置垂直自动扩展，请转到服务的 **设置** 选项卡，并根据下图调整最小和最大内存以及 CPU 设置。

:::note
单副本服务不能在所有层进行扩展。
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

将副本的 **最大内存** 设置为高于 **最小内存** 的值。服务将在这些范围内按需扩展。这些设置在初始服务创建流程中也可以使用。您服务中的每个副本将分配相同的内存和 CPU 资源。

您还可以选择将这些值设置为相同，基本上将服务“固定”到特定配置。这样会立即强制扩展到您选择的所需大小。

需要注意的是，这将禁用集群上的任何自动扩展，您的服务将不会受到超过这些设置的 CPU 或内存使用增加的保护。

:::note
对于 Enterprise 层服务，标准 1:4 配置将支持垂直自动扩展。
自定义配置在启动时将不支持垂直自动扩展或手动垂直扩展。
但是，可以通过联系支持进行垂直扩展。
:::

## 手动横向扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

您可以使用 ClickHouse Cloud [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的扩展设置或从云控制台调整副本数量来扩展服务。

**Scale** 和 **Enterprise** 层确实支持单副本服务。然而，在这些层中，起始有多个副本的服务，或扩展到多个副本的服务只能缩减到至少 `2` 个副本。

:::note
服务可以横向扩展到最多 20 个副本。如果您需要额外的副本，请联系支持团队。
:::

### 通过 API 进行横向扩展 {#horizontal-scaling-via-api}

要横向扩展集群，请通过 API 发送 `PATCH` 请求以调整副本数量。以下截图显示了将 `3` 个副本的集群扩展到 `6` 个副本的 API 调用及其对应的响应。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`PATCH` 请求以更新 `numReplicas`*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` 请求的响应*

如果您在一个请求正在进行时发出新的扩展请求或连续发出多个请求，扩展服务将忽略中间状态，并收敛到最终的副本计数。

### 通过 UI 进行横向扩展 {#horizontal-scaling-via-ui}

要通过 UI 横向扩展服务，可以在 **设置** 页面上调整服务的副本数量。

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*来自 ClickHouse Cloud 控制台的服务扩展设置*

服务扩展后，云控制台中的指标仪表板应显示服务的正确分配情况。下图显示集群扩展到总内存为 `96 GiB`，这是 `6` 个副本，每个副本的内存分配为 `16 GiB`。

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 自动闲置 {#automatic-idling}
在 **设置** 页面上，您还可以选择在服务处于非活动状态时是否允许自动闲置，如上图所示（即当服务没有执行任何用户提交的查询时）。自动闲置减少了服务的成本，因为在服务暂停时您不会为计算资源付费。

:::note
在某些特殊情况下，例如当服务具有大量部分时，服务将无法自动闲置。

服务可能会进入一种闲置状态，此时暂停对 [可刷新物化视图](/materialized-view/refreshable-materialized-view) 的刷新，消耗 [S3Queue](/engines/table-engines/integrations/s3queue) 的数据，以及调度新的合并。现有的合并操作将在服务转换到闲置状态之前完成。为了确保可刷新物化视图和 S3Queue 消耗的连续操作，请禁用闲置状态功能。
:::

:::danger 何时不使用自动闲置
仅在您的用例能够在响应查询前处理延迟的情况下使用自动闲置，因为当服务暂停时，连接到服务的请求将超时。自动闲置非常适合不频繁使用的服务，并且可以容忍延迟。对于经常使用并驱动面向客户的功能的服务，不推荐使用。
:::

## 处理突发工作负载 {#handling-bursty-workloads}
如果您预期即将发生工作负载高峰，您可以使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 预先扩展服务以应对高峰，并在需求减退后缩减服务。

要了解每个副本当前的 CPU 核心和内存使用情况，您可以运行以下查询：

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
