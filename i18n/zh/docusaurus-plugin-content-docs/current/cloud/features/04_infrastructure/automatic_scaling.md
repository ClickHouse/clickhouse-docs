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
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动扩展

扩展是根据客户需求调整可用资源的能力。Scale 和 Enterprise (具有标准 1:4 配置文件) 级别的服务可以通过调用 API 进行水平扩展，或者通过在 UI 上更改设置来调整系统资源。这些服务还可以 **自动垂直扩展** 以满足应用程序需求。

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

:::note
Scale 和 Enterprise 级别支持单副本和多副本服务，而 Basic 级别仅支持单副本服务。单副本服务的大小是固定的，不允许进行垂直或水平扩展。用户可以升级到 Scale 或 Enterprise 级别以扩展他们的服务。
:::

## ClickHouse Cloud 中的扩展工作原理 {#how-scaling-works-in-clickhouse-cloud}

目前，ClickHouse Cloud 支持对 Scale 级服务进行垂直自动扩展和手动水平扩展。

对于 Enterprise 级服务，扩展工作如下：

- **水平扩展**：手动水平扩展将在企业级的所有标准和自定义配置文件中可用。
- **垂直扩展**：
  - 标准配置文件 (1:4) 将支持垂直自动扩展。
  - 自定义配置文件 (`highMemory` 和 `highCPU`) 不支持垂直自动扩展或手动垂直扩展。但是，可以通过联系支持团队对这些服务进行垂直扩展。

:::note
ClickHouse Cloud 中的扩展采用我们称之为 “Make Before Break” (MBB) 的方法。在删除旧副本之前，先添加一个或多个新大小的副本，以防止扩展操作期间的容量损失。通过消除移除现有副本和添加新副本之间的间隙，MBB 创建了一个更加无缝和较少干扰的扩展过程。这在扩展场景中特别有利，因为高资源利用率触发了对额外容量的需求，因为提前删除副本只会加剧资源限制。作为此方法的一部分，我们会等待最长一个小时，以让任何现有查询在旧副本上完成，然后再将其删除。这平衡了现有查询完成的需求，同时确保旧副本不会停留太久。

请注意，作为此变化的一部分：
1. 历史系统表数据将在扩展事件中保留最多 30 天。此外，2024 年 12 月 19 日之前的 AWS 或 GCP 服务上的任何系统表数据，以及 2025 年 1 月 14 日之前的 Azure 服务上的数据将不会在迁移到新组织级别时保留。
2. 对于使用 TDE (Transparent Data Encryption) 的服务，系统表数据在 MBB 操作后当前不会维护。我们正在努力消除这一限制。
:::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

Scale 和 Enterprise 服务支持基于 CPU 和内存使用情况的自动扩展。我们会不断监控服务在回溯窗口 (过去 30 小时) 期间的历史使用情况以做出扩展决策。如果使用率超过或低于某些阈值，我们会相应地扩展服务以满足需求。

基于 CPU 的自动扩展在 CPU 使用率超过 50-75% 的上限阈值时启动（实际阈值取决于集群的大小）。此时，分配给集群的 CPU 配额会加倍。如果 CPU 使用率降到上限阈值的一半以下（例如，对于 50% 的上限阈值，降到 25%），则 CPU 配额减半。

基于内存的自动扩展会将集群扩展到最大内存使用量的 125%，如果遇到 OOM (内存不足) 错误，则最多可扩展到 150%。

***CPU*** 和 ***内存*** 推荐中选择 **较大者**，分配给服务的 CPU 和内存将按步进大小 `1` CPU 和 `4 GiB` 内存进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale 或 Enterprise 服务的扩展可以由具有 **Admin** 角色的组织成员进行调整。要配置垂直自动扩展，请转到服务的 **设置** 选项卡，并按如下所示调整最小和最大内存及 CPU 设置。

:::note
单副本服务在所有级别都不能进行扩展。
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

将副本的 **最大内存** 设置为高于 **最小内存** 的值。服务将在这些范围内根据需要进行扩展。这些设置在服务初始创建过程中也可用。每个副本将分配相同的内存和 CPU 资源。

您还可以选择将这些值设置为相同，从而“固定”服务到特定配置。这样做会立即强制扩展到您选择的期望大小。

需要注意的是，这将禁用集群上的任何自动扩展，并且您的服务将在超出这些设置的 CPU 或内存使用量增加时不受保护。

:::note
对于 Enterprise 级服务，标准 1:4 配置文件将支持垂直自动扩展。
自定义配置文件在推出时将不支持垂直自动扩展或手动垂直扩展。
但是，可以通过联系支持来对这些服务进行垂直扩展。
:::

## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手动水平扩展"/>

您可以使用 ClickHouse Cloud [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的扩展设置，或在云控制台中调整副本数量来扩展您的服务。

**Scale** 和 **Enterprise** 级别也支持单副本服务。服务扩展后，可以缩减到最低单副本。请注意，单副本服务的可用性降低，不推荐用于生产使用。

:::note
服务可以水平扩展到最多 20 个副本。如果您需要额外的副本，请联系支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要进行水平扩展，发送一个 `PATCH` 请求通过 API 调整副本数量。下图展示了一个将 `3` 副本集群扩展到 `6` 个副本的 API 调用和相应的响应。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`PATCH` 请求以更新 `numReplicas`*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*来自 `PATCH` 请求的响应*

如果在一个扩展请求正在进行时发出新的扩展请求或多个请求，扩展服务将忽略中间状态，并最终收敛到最终的副本计数。

### 通过 UI 进行水平扩展 {#horizontal-scaling-via-ui}

要通过 UI 对服务进行水平扩展，您可以在 **设置** 页面上调整服务的副本数量。

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*来自 ClickHouse Cloud 控制台的服务扩展设置*

扩展服务后，云控制台中的指标仪表板应显示服务的正确分配。下图显示集群总内存扩展到 `96 GiB`，这意味着 `6` 个副本，每个副本分配 `16 GiB` 内存。

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 自动闲置 {#automatic-idling}
在 **设置** 页面中，您还可以选择是否在服务不活动时允许自动闲置，如上图所示（即当服务未执行任何用户提交的查询时）。 自动闲置减少了您的服务成本，因为在服务暂停时不会对计算资源进行计费。

:::note
在某些特殊情况下，例如当服务具有大量分片时，服务将不会自动闲置。

服务可能会进入一种闲置状态，在这种状态下，它暂停 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) 的刷新、从 [S3Queue](/engines/table-engines/integrations/s3queue) 的消费和新合并的调度。现有的合并操作将在服务过渡到闲置状态之前完成。为了确保可刷新的物化视图和 S3Queue 消费的连续操作，请禁用闲置状态功能。
:::

:::danger 何时不使用自动闲置
仅当您的用例能承受响应查询的延迟时，才使用自动闲置，因为当服务暂停时，连接到服务的连接将超时。自动闲置非常适合不常使用且可以容忍延迟的服务。不建议用于频繁使用并驱动面向客户功能的服务。
:::

## 处理工作负载激增 {#handling-bursty-workloads}

如果您预期即将出现工作负载激增，您可以使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 预先扩展您的服务以应对激增，并在需求减退后缩减服务。

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
