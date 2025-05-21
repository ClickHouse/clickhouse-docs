---
'sidebar_position': 1
'sidebar_label': '自动缩放'
'slug': '/manage/scaling'
'description': '在ClickHouse Cloud中配置自动缩放'
'keywords':
- 'autoscaling'
- 'auto scaling'
- 'scaling'
- 'horizontal'
- 'vertical'
- 'bursts'
'title': '自动缩放'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自动扩展

扩展是调整可用资源以满足客户需求的能力。Scale和Enterprise（标准1:4配置）层服务可以通过编程调用API或在UI上更改设置来水平扩展系统资源。或者，这些服务可以进行**垂直自动扩展**以满足应用程序需求。

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

## ClickHouse Cloud中的扩展是如何工作的 {#how-scaling-works-in-clickhouse-cloud}

目前，ClickHouse Cloud 支持Scale层服务的垂直自动扩展和手动水平扩展。

对于Enterprise层服务的扩展，如下所示：

- **水平扩展**：手动水平扩展将在企业层的所有标准和自定义配置中可用。
- **垂直扩展**：
  - 标准配置（1:4）将支持垂直自动扩展。
  - 自定义配置在推出时将不支持垂直自动扩展或手动垂直扩展。不过，可以通过联系支持团队来垂直扩展这些服务。

:::note
我们正在为计算副本引入一种新的垂直扩展机制，称为“Make Before Break”（MBB）。这种方法是在删除旧副本之前添加一个或多个新大小的副本，从而防止扩展操作期间的任何容量损失。通过消除删除现有副本和添加新副本之间的间隙，MBB 创建了更无缝且影响较小的扩展过程。它在规模扩大场景中特别有益，因为高资源利用率触发了对额外容量的需求，因为过早删除副本只会加剧资源约束。

请注意，作为此更改的一部分，历史系统表数据将在扩展事件中保留最长30天。此外，任何AWS或GCP上服务的系统表数据，如果早于2024年12月19日，或Azure上服务早于2025年1月14日的都不会被保留，作为迁移到新组织层的一部分。
:::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自动垂直扩展"/>

Scale和Enterprise服务支持基于CPU和内存使用情况的自动扩展。我们不断监控服务在观察窗口内的历史使用情况（持续过去30小时），以做出扩展决策。如果使用量超过或低于某些阈值，我们会相应地调整服务以匹配需求。

当CPU使用率超过50-75%（实际阈值取决于集群大小）的上限阈值时，基于CPU的自动扩展启动。在这一点上，集群的CPU分配翻倍。如果CPU使用率低于上限阈值的一半（例如，在50%的上限阈值情况下降低到25%），则CPU分配减半。

基于内存的自动扩展将集群调整到最大内存使用的125%，如果遇到OOM（内存不足）错误则最多可扩大到150%。

选择**CPU**和**内存**推荐值中**较大**的值，CPU和内存按`1`个CPU和`4 GiB`内存的同步增量进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale或Enterprise服务的扩展可以由具有**管理员**角色的组织成员进行调整。要配置垂直自动扩展，请转到服务的**设置**选项卡，并根据如下所示调整最小和最大内存以及CPU设置。

:::note
单副本服务在所有层中不能进行扩展。
:::

<Image img={auto_scaling} size="lg" alt="扩展设置页面" border/>

将副本的**最大内存**设置为高于**最小内存**的值。服务将在这些界限内按需扩展。这些设置在初始服务创建流程中也是可用的。服务中的每个副本将被分配相同的内存和CPU资源。

您还可以选择将这些值设置为相同，实际上是将服务“固定”到特定配置。这样做将立即强制服务扩展到您选择的所需大小。

请注意，这将禁用集群上的任何自动扩展，且您的服务将无法抵御超出这些设置的CPU或内存使用增加。

:::note
对于Enterprise层服务，标准1:4配置将支持垂直自动扩展。自定义配置在推出时将不支持垂直自动扩展或手动垂直扩展。不过，可以通过联系支持团队来垂直扩展这些服务。
:::

## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手动水平扩展"/>

您可以使用ClickHouse Cloud [公共API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的扩展设置或从云控制台调整副本数量来扩展您的服务。

**Scale**和**Enterprise**层支持单副本服务。然而，开始时具有多个副本的服务，或扩展为多个副本的服务只能缩减为至少`2`个副本。

:::note
服务的水平扩展最多可达到20个副本。如果您需要更多副本，请联系我们的支持团队。
:::

### 通过API进行水平扩展 {#horizontal-scaling-via-api}

要水平扩展集群，通过API发出`PATCH`请求以调整副本数量。下面的截图显示了将`3`个副本集群扩展到`6`个副本的API调用及其对应的响应。

<Image img={scaling_patch_request} size="lg" alt="扩展PATCH请求" border/>

*更新`numReplicas`的`PATCH`请求*

<Image img={scaling_patch_response} size="md" alt="扩展PATCH响应" border/>

*`PATCH`请求的响应*

如果您在一项扩展请求已经进行中时发出新的扩展请求或多个请求，扩展服务将忽略中间状态，并收敛到最终副本数量。

### 通过UI进行水平扩展 {#horizontal-scaling-via-ui}

要通过UI水平扩展服务，您可以在**设置**页面上调整服务的副本数量。

<Image img={scaling_configure} size="md" alt="扩展配置设置" border/>

*来自ClickHouse Cloud控制台的服务扩展设置*

一旦服务扩展完成，云控制台中的指标仪表板应该显示正确的服务分配。下面的截图显示集群扩展至总内存为`96 GiB`，即`6`个副本，每个副本具有`16 GiB`内存分配。

<Image img={scaling_memory_allocation} size="md" alt="扩展内存分配" border />

## 自动闲置 {#automatic-idling}
在**设置**页面上，您还可以选择是否在服务不活动时允许自动闲置，如上图所示（即，当服务没有执行任何用户提交的查询时）。自动闲置可以减少您的服务成本，因为在服务暂停时，您不会为计算资源付费。

:::note
在某些特殊情况下，例如当服务具有大量分区片段时，服务将不会自动闲置。

服务可能进入闲置状态，暂停对[可刷新的物化视图](/materialized-view/refreshable-materialized-view)的刷新、从[S3Queue](/engines/table-engines/integrations/s3queue)的消费以及新合并的调度。现有的合并操作将在服务过渡到闲置状态之前完成。为确保可刷新的物化视图和S3Queue消费的持续操作，请禁用闲置状态功能。
:::

:::danger 何时不使用自动闲置
仅在您的用例能够处理查询响应延迟时使用自动闲置，因为当服务处于暂停状态时，与服务的连接将超时。自动闲置非常适合使用频率较低且可以容忍延迟的服务。不建议用于驱动频繁使用的客户特性服务。
:::

## 处理突发工作负载 {#handling-bursty-workloads}
如果您预期即将出现工作负载的峰值，可以使用
[ClickHouse Cloud API](/cloud/manage/api/api-overview) 
提前扩展您的服务以应对峰值，并在需求下降后缩减。

要了解每个副本当前使用的CPU核心和内存，您可以运行以下查询：

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
