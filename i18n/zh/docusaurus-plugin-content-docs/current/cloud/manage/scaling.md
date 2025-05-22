import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# 自动扩展

扩展是调整可用资源以满足客户需求的能力。Scale 和 Enterprise（标准 1:4 配置文件）级别的服务可以通过编程调用 API 或在用户界面上更改设置来水平扩展。此外，这些服务还可以 **自动垂直扩展** 以满足应用需求。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

## 在 ClickHouse Cloud 中扩展的工作原理 {#how-scaling-works-in-clickhouse-cloud}

当前，ClickHouse Cloud 支持 Scale 级别服务的垂直自动扩展和手动水平扩展。

对于 Enterprise 级别的服务，扩展工作如下：

- **水平扩展**：手动水平扩展将适用于企业级别的所有标准和自定义配置文件。
- **垂直扩展**：
  - 标准配置文件（1:4）将支持垂直自动扩展。
  - 自定义配置文件在启动时不支持垂直自动扩展或手动垂直扩展。不过，您可以通过联系支持团队进行垂直扩展。

:::note
我们正在为计算副本引入一种新的垂直扩展机制，我们称之为“先建后拆”（Make Before Break，MBB）。这种方法在移除旧副本之前先添加一个或多个新大小的副本，从而防止在扩展操作期间容量的损失。通过消除移除现有副本和添加新副本之间的空白，MBB 创建了一个更无缝且更少干扰的扩展过程。它在向上扩展场景中特别有益，因为高资源利用率会触发额外容量的需求，过早移除副本只会加剧资源限制。

请注意，作为此更改的一部分，历史系统表数据将作为扩展事件的一部分保留最长 30 天。此外，对于 AWS 或 GCP 的服务，2024 年 12 月 19 日之前的任何系统表数据将不会被保留，对于 Azure 的服务，则在2025年1月14日之前的任何系统表数据将不会作为迁移到新组织级别的一部分被保留。
:::

### 垂直自动扩展 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale 和 Enterprise 服务支持基于 CPU 和内存使用情况的自动扩展。我们持续监控一个服务在回顾窗口（过去 30 小时）内的历史使用情况，以做出扩展决策。如果使用情况高于或低于某些阈值，我们将适当地扩展服务以匹配需求。

当 CPU 使用率跨越 50-75% 的上限阈值时，基于 CPU 的自动扩展开始生效（实际阈值取决于集群的大小）。此时，分配给集群的 CPU 资源将加倍。如果 CPU 使用率低于上限阈值的一半（例如，在 50% 上限阈值情况下降至 25%），则 CPU 分配减半。

基于内存的自动扩展将集群扩展至最大内存使用的 125%，如果出现 OOM（内存不足）错误，则扩展至 150%。

**更大的** CPU 或内存建议被选中，并且分配给服务的 CPU 和内存以 `1` 个 CPU 和 `4 GiB` 内存的递增步长进行扩展。

### 配置垂直自动扩展 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale 或 Enterprise 服务的扩展可以由拥有 **管理员** 角色的组织成员进行调整。要配置垂直自动扩展，请转到您的服务的 **设置** 标签并调整最低和最高内存，以及 CPU 设置，如下所示。

:::note
单副本服务在所有级别中无法扩展。
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

将副本的 **最大内存** 设置为大于 **最小内存** 的较高值。然后，服务将在这些范围内根据需要进行扩展。这些设置在初始服务创建流程中也可用。您服务中的每个副本将分配相同的内存和 CPU 资源。

您还可以选择将这些值设置为相同，从而实际上“固定”服务到特定配置。这样将立即强制服务扩展到您选择的大小。

请注意，这将禁用集群的任何自动扩展，您的服务将不会在这些设置之外受到 CPU 或内存使用增加的保护。

:::note
对于 Enterprise 级别服务，标准 1:4 配置文件将支持垂直自动扩展。
自定义配置文件在启动时不支持垂直自动扩展或手动垂直扩展。
不过，您可以通过联系支持团队进行垂直扩展。
:::

## 手动水平扩展 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

您可以使用 ClickHouse Cloud [公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) 通过更新服务的扩展设置或调整副本数量来扩展服务。

**Scale** 和 **Enterprise** 级别支持单副本服务。然而，这些级别中起始时具有多个副本的服务，或扩展为多个副本的服务只能缩减到最少 `2` 个副本。

:::note
服务可以水平扩展至最多 20 个副本。如果您需要额外的副本，请联系支持团队。
:::

### 通过 API 进行水平扩展 {#horizontal-scaling-via-api}

要水平扩展集群，可以通过 API 发送 `PATCH` 请求以调整副本数量。下面的屏幕截图显示了一个扩展 `3` 个副本集群至 `6` 个副本的 API 调用及其相应响应。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*更新 `numReplicas` 的 `PATCH` 请求*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` 请求的响应*

如果您在一个扩展请求正在进行的同时发出新的扩展请求或多个请求，扩展服务将忽略中间状态，并收敛到最终的副本数量。

### 通过 UI 进行水平扩展 {#horizontal-scaling-via-ui}

要通过用户界面水平扩展服务，可以在 **设置** 页面上调整服务的副本数量。

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*ClickHouse Cloud 控制台中的服务扩展设置*

一旦服务扩展，云控制台中的指标仪表板应显示分配给服务的正确资源。下面的屏幕截图显示集群扩展到总内存 `96 GiB`，对应 `6` 个副本，每个副本分配 `16 GiB` 内存。

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 自动闲置 {#automatic-idling}
在 **设置** 页面，您还可以选择在服务处于非活动状态时是否允许其自动闲置，如上图所示（即，服务未执行任何用户提交的查询时）。自动闲置可以减少您的服务成本，因为在服务被暂停时您不会为计算资源付费。

:::note
在某些特殊情况下，例如当服务有大量分片时，服务将不会自动闲置。

服务可能会进入闲置状态，暂停刷新 [可刷新的物化视图](/materialized-view/refreshable-materialized-view)、从 [S3Queue](/engines/table-engines/integrations/s3queue) 的消费以及调度新的合并。现有的合并操作将在服务转换为闲置状态之前完成。要确保可刷新的物化视图和 S3Queue 消费的持续操作，请禁用闲置状态功能。
:::

:::danger 何时不使用自动闲置
仅在您的用例能够处理响应查询的延迟时使用自动闲置，因为当服务被暂停时，与服务的连接将超时。自动闲置非常适合那些不常用且可以容忍延迟的服务。对于那些为用户频繁使用的客户功能提供支持的服务，不建议使用。
:::

## 处理突发工作负载 {#handling-bursty-workloads}
如果您预计工作负载即将出现高峰，您可以使用
[ClickHouse Cloud API](/cloud/manage/api/api-overview) 
主动扩展您的服务以应对高峰，并在需求减退后缩减服务。

要了解每个副本当前使用的 CPU 核心和内存，您可以运行以下查询：

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
