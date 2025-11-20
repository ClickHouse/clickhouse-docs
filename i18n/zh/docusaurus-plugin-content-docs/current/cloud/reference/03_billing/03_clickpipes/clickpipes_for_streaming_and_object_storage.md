---
sidebar_label: '流式传输和对象存储'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: '用于流式传输和对象存储的 ClickPipes'
description: '流式传输和对象存储 ClickPipes 的计费概览'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'streaming pricing', 'costs', 'pricing']
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# 用于流式处理和对象存储的 ClickPipes {#clickpipes-for-streaming-object-storage}

本节介绍 ClickPipes 针对流式处理和对象存储的定价模型。


## ClickPipes 的定价结构是怎样的? {#what-does-the-clickpipes-pricing-structure-look-like}

定价包含两个维度:

- **计算资源**: 按**每单位每小时**计费。
  计算资源费用是指运行 ClickPipes 副本 Pod 的成本,无论其是否正在主动摄取数据。
  此项费用适用于所有 ClickPipes 类型。
- **摄取数据**: 按**每 GB** 计费。
  摄取数据费用适用于所有流式 ClickPipes
  (Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs)
  通过副本 Pod 传输的数据。摄取数据大小 (GB) 按从数据源接收的字节数(无论是否压缩)计费。


## 什么是 ClickPipes 副本？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源采集数据，该基础设施独立于 ClickHouse Cloud 服务运行和扩展。因此，它使用专用计算副本。


## 默认的副本数量及其大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认为 1 个副本,配置 512 MiB 内存和 0.125 vCPU(XS 规格)。
这相当于 **0.0625** 个 ClickHouse 计算单元(1 个单元 = 8 GiB 内存、2 vCPU)。


## ClickPipes 的公开定价是多少？ {#what-are-the-clickpipes-public-prices}

- 计算资源：每单位每小时 \$0.20（默认副本规格为每副本每小时 \$0.0125）
- 数据摄取：每 GB \$0.04

计算资源的价格取决于 ClickPipe 中副本的**数量**和**规格**。默认副本规格可通过垂直扩展进行调整，各副本规格的定价如下：

| 副本规格                    | 计算单位       | 内存     | vCPU   | 每小时价格      |
| -------------------------- | ------------- | ------- | ------ | -------------- |
| 超小型 (XS)（默认）         | 0.0625        | 512 MiB | 0.125. | $0.0125        |
| 小型 (S)                   | 0.125         | 1 GiB   | 0.25   | $0.025         |
| 中型 (M)                   | 0.25          | 2 GiB   | 0.5    | $0.05          |
| 大型 (L)                   | 0.5           | 4 GiB   | 1.0    | $0.10          |
| 超大型 (XL)                | 1.0           | 8 GiB   | 2.0    | $0.20          |


## 示例说明 {#how-does-it-look-in-an-illustrative-example}

以下示例假设使用单个 M 型副本,除非另有明确说明。

<table>
  <thead>
    <tr>
      <th></th>
      <th>24 小时 100 GB</th>
      <th>24 小时 1 TB</th>
      <th>24 小时 10 TB</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>流式 ClickPipe</td>
      <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
      <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
      <td>
        使用 4 个副本: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) =
        \$404.80
      </td>
    </tr>
    <tr>
      <td>对象存储 ClickPipe $^*$</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
    </tr>
  </tbody>
</table>

$^1$ _仅计算 ClickPipes 的编排计算费用,
实际数据传输由底层 ClickHouse 服务承担_


## 流式传输和对象存储 ClickPipes 常见问题解答 {#faq-streaming-and-object-storage}

<ClickPipesFAQ />
