---
sidebar_position: 1
sidebar_label: '概述'
slug: /manage/scaling
description: 'ClickHouse Cloud 自动扩缩容概述'
keywords: ['autoscaling', 'auto scaling', 'scaling', 'horizontal', 'vertical', 'bursts']
title: '自动扩缩容'
doc_type: 'guide'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# 自动扩缩容 \{#automatic-scaling\}

扩缩容是指调整可用资源以满足客户端需求的能力。Scale 和 Enterprise (使用标准 1:4 profile) 的服务可通过编程方式调用 API，或在 UI 中更改设置来进行水平扩缩容，从而调整系统资源。这些服务还可以通过**自动垂直扩缩容**来满足应用程序需求。

<ScalePlanFeatureBadge feature="自动垂直扩缩容" />

:::note
Scale 和 Enterprise 层级同时支持单副本和多副本服务，而 Basic 层级仅支持单副本服务。单副本服务的大小固定，因此不支持垂直或水平扩缩容。您可以升级到 Scale 或 Enterprise 层级，以对服务进行扩缩容。
:::

## ClickHouse Cloud 中扩缩容的工作原理 \{#how-scaling-works-in-clickhouse-cloud\}

目前，ClickHouse Cloud 为 Scale tier 服务提供垂直自动扩缩容和手动水平扩缩容。

对于 Enterprise tier 服务，扩缩容方式如下：

* **水平扩缩容**：Enterprise tier 中的所有标准和自定义 profile 均支持手动水平扩缩容。
* **垂直扩缩容**：
  * 标准 profile (1:4) 支持垂直自动扩缩容。
  * 自定义 profile (`highMemory` 和 `highCPU`) 不支持垂直自动扩缩容或手动垂直扩缩容。不过，您可以联系支持团队，对这些服务执行垂直扩缩容。

:::note
ClickHouse Cloud 中的扩缩容采用一种我们称为[&quot;先建后拆&quot; (MBB) ](/cloud/features/mbb)的方法。
该方法会先添加一个或多个新规格的副本，再移除旧副本，从而避免在扩缩容过程中出现容量损失。
通过消除移除现有副本与添加新副本之间的空档，MBB 能让扩缩容过程更平滑，并减少中断。
这种方法在扩容场景下尤其有利：当资源利用率较高、需要额外容量时，过早移除副本只会进一步加剧资源约束。
作为这一方法的一部分，我们最多会等待一小时，让旧副本上的现有查询完成后再将其移除。
这样既能兼顾现有查询顺利完成，也能避免旧副本保留过久。
:::

## 了解更多 \{#learn-more\}

* [垂直自动扩缩容](/cloud/features/autoscaling/vertical) — 根据使用情况自动调整 CPU 和内存
* [水平扩缩容](/cloud/features/autoscaling/horizontal) — 通过 API 或 UI 手动调整副本数量
* [先建后拆 (MBB)](/cloud/features/mbb) — 了解 ClickHouse Cloud 如何无缝执行扩缩容操作
* [自动闲置状态转换](/cloud/features/autoscaling/idling) — 通过自动暂停服务来节省成本
* [扩缩容建议](/cloud/features/autoscaling/scaling-recommendations) — 了解扩缩容建议
* [定时扩缩容](/cloud/features/autoscaling/scaling-recommendations) — 了解定时扩缩容功能，该功能允许您精确定义服务何时扩容或缩容，而不依赖实时指标