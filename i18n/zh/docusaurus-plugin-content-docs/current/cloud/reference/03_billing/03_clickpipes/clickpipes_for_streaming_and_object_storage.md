---
sidebar_label: '流式数据和对象存储'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: '用于流式数据和对象存储的 ClickPipes'
description: '流式数据和对象存储类 ClickPipes 的计费概览'
doc_type: 'reference'
keywords: ['计费', 'clickpipes', '流式数据定价', '成本', '价格']
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# 用于流式传输和对象存储的 ClickPipes {#clickpipes-for-streaming-object-storage}

本节概述 ClickPipes 在流式传输和对象存储场景下的定价模型。



## ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

ClickPipes 的定价由两个维度组成：

- **计算资源（Compute）**：按**每单元每小时**计费。
  计算资源费用表示运行 ClickPipes 副本 pod（容器组）的成本，无论当前是否在主动摄取数据。
  该维度适用于所有类型的 ClickPipes。
- **已摄取数据**：按 **GB** 计费。
  已摄取数据费率适用于所有流式 ClickPipes
  （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），
  针对通过副本 pod（容器组）传输的数据进行计费。已摄取数据大小（GB）根据从源端接收到的字节数（无论是否压缩）折算为 GB 后计费。



## 什么是 ClickPipes 副本？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源摄取数据，
该基础设施在运行和伸缩方面独立于 ClickHouse Cloud 服务。
因此，它使用专用的计算副本。



## 默认的副本数量及其规格是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认为 1 个副本，规格为 512 MiB 内存和 0.125 个 vCPU（XS）。
这相当于 **0.0625** 个 ClickHouse 计算单元（1 个单元 = 8 GiB 内存、2 个 vCPU）。



## ClickPipes 公开价格是多少？ {#what-are-the-clickpipes-public-prices}

- Compute：每单位每小时 \$0.20（默认副本规格为每个副本每小时 \$0.0125）
- 摄取数据：每 GB \$0.04

Compute 计费维度的价格取决于 ClickPipe 中副本的**数量**和**规格**。可以通过垂直扩缩容调整默认副本规格，各副本规格的定价如下：

| 副本规格                   | Compute 单位 | RAM     | vCPU   | 每小时价格     |
|----------------------------|--------------|---------|--------|----------------|
| Extra Small (XS)（默认）   | 0.0625       | 512 MiB | 0.125  | $0.0125        |
| Small (S)                  | 0.125        | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25         | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5          | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0          | 8 GiB   | 2.0    | $0.20          |



## 在示例场景中是什么样子？ {#how-does-it-look-in-an-illustrative-example}

以下示例均假设使用单个 M 规格副本，除非另有说明。

<table><thead>
  <tr>
    <th></th>
    <th>100 GB / 24 小时</th>
    <th>1 TB / 24 小时</th>
    <th>10 TB / 24 小时</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流式 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>使用 4 个副本：<br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>对象存储 ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _此处仅计入用于编排的 ClickPipes 计算成本，实际数据传输由底层 ClickHouse Service 负责_



## 关于流式传输和对象存储 ClickPipes 的常见问题解答 {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>