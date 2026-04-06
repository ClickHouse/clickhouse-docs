---
slug: /use-cases/observability/clickstack/estimating-resources
title: '资源估算'
sidebar_label: '资源估算'
pagination_prev: null
pagination_next: null
description: '托管 ClickStack 部署的资源估算指南'
doc_type: 'guide'
keywords: ['ClickStack', '资源', '容量估算', '计算资源', '生产环境', '容量规划']
---

import ResourceEstimation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

<ResourceEstimation />

## 隔离可观测性工作负载 \{#isolating-workloads\}

如果您要将 ClickStack 添加到一个**现有的 ClickHouse Cloud 服务**中，而该服务已承载其他工作负载 (例如实时应用分析) ，则强烈建议隔离可观测性流量。

使用 [**托管仓库**](/cloud/reference/warehouses) 创建一个专用于 ClickStack 的**子服务**。这可以让您：

* 将摄取和查询负载与现有应用隔离
* 独立扩展可观测性工作负载
* 防止可观测性查询影响生产分析
* 在需要时跨服务共享相同的底层数据集

这种方法可确保现有工作负载不受影响，同时让 ClickStack 能够随着可观测性数据的增长独立扩展。

对于更大规模的部署或自定义容量规划建议，请联系 Support 以获取更准确的评估。