---
sidebar_position: 3
sidebar_label: '水平扩缩容'
slug: /cloud/features/autoscaling/horizontal
description: '在 ClickHouse Cloud 中进行手动水平扩缩容'
keywords: ['水平扩缩容', '扩缩容', '副本', '手动扩缩容', '峰值', '突发流量']
title: '水平扩缩容'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## 手动水平扩缩容 \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="手动水平扩缩容" />

您可以使用 ClickHouse Cloud 的[公共 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)，通过更新服务的扩缩容设置来调整服务规模，或者在 Cloud Console 中调整副本数量。

**Scale** 和 **Enterprise** ティア也支持单副本服务。服务在扩容后，最少可再缩容回单个副本。请注意，单副本服务的可用性较低，不建议用于生产环境。

:::note
服务最多可水平扩缩容至 20 个副本。如果您需要更多副本，请联系我们的支持团队。
:::

### 通过 API 进行水平扩缩容 \{#horizontal-scaling-via-api\}

要对集群进行水平扩缩容，可通过 API 发起 `PATCH` 请求来调整副本数量。下方截图展示了一个 API 调用：将一个 `3` 副本集群扩容到 `6` 个副本，以及相应的响应。

<Image img={scaling_patch_request} size="lg" alt="扩缩容 PATCH 请求" border />

*用于更新 `numReplicas` 的 `PATCH` 请求*

<Image img={scaling_patch_response} size="md" alt="扩缩容 PATCH 响应" border />

*`PATCH` 请求的响应*

如果某个扩缩容操作已在进行中，此时又发起新的扩缩容请求，或连续发起多个请求，扩缩容服务会忽略中间状态，并最终收敛到最后指定的副本数。

### 通过 UI 进行水平扩缩容 \{#horizontal-scaling-via-ui\}

要通过 UI 对服务进行水平扩缩容，您可以在**设置**页面调整该服务的副本数量。

<Image img={scaling_configure} size="md" alt="扩缩容配置设置" border />

*ClickHouse Cloud 控制台中的服务扩缩容设置*

服务完成扩缩容后，Cloud 控制台中的指标仪表板应显示该服务的正确资源分配。下方截图显示该集群已扩缩至总内存 `96 GiB`，即 `6` 个副本，每个副本分配 `16 GiB` 内存。

<Image img={scaling_memory_allocation} size="md" alt="扩缩容内存分配" border />