---
sidebar_position: 2
sidebar_label: '垂直自动扩缩容'
slug: /cloud/features/autoscaling/vertical
description: '配置 ClickHouse Cloud 中的垂直自动扩缩容'
keywords: ['autoscaling', 'auto scaling', 'vertical', 'scaling', 'CPU', 'memory']
title: '垂直自动扩缩容'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

<ScalePlanFeatureBadge feature="自动垂直扩缩容" />

Scale 和 Enterprise 层级的服务支持根据 CPU 和内存使用情况自动扩缩容。系统会持续监控回溯时间窗口内的服务使用情况，以据此做出扩缩容决策。当使用量高于或低于特定阈值时，服务会相应地扩容或缩容，以匹配需求。

## 配置垂直自动扩缩容 \{#configuring-vertical-auto-scaling\}

具有 **Admin** 角色的组织成员可以调整 ClickHouse Cloud Scale 或 Enterprise 服务的扩缩容设置。要配置垂直自动扩缩容，请前往服务的 **设置** 选项卡，并按如下所示调整最小和最大内存以及 CPU 设置。

:::note
并非所有层级都支持对单副本服务进行扩缩容。
:::

<Image img={auto_scaling} size="lg" alt="扩缩容设置页面" border />

请将副本的 **最大内存** 设置为高于 **最小内存** 的值。这样，服务就会在这些范围内按需扩缩容。这些设置在初始服务创建流程中也可用。您服务中的每个副本都会分配相同的内存和 CPU 资源。

您也可以选择将这些值设为相同，相当于将服务“固定”在某个特定配置上。这样做会立即强制服务扩缩容到您选择的目标规格。

需要注意的是，这将禁用集群上的所有自动扩缩容能力，并且当 CPU 或内存使用量增长超出这些设置时，您的服务将无法得到保护。

:::note
对于 Enterprise 层级的服务，标准 1:4 profile 支持垂直自动扩缩容。自定义 profile 不支持垂直自动扩缩容或手动垂直扩缩容。不过，您可以联系支持团队，对这些服务进行垂直扩缩容。
:::