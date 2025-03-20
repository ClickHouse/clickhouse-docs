---
slug: /architecture/introduction
sidebar_label: 引言
title: 引言
sidebar_position: 1
---
import ReplicationShardingTerminology from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

这些部署示例基于 ClickHouse 支持与服务组织向 ClickHouse 用户提供的建议。这些是可用的示例，我们建议您尝试它们并根据需要进行调整。您可能会在这里找到完全符合您要求的示例。或者，如果您有要求需要将数据复制三次而不是两次，您应该能够按照这里呈现的模式添加另一个副本。

<ReplicationShardingTerminology />

## 示例 {#examples}

### 基本 {#basic}

- [**扩展**](/deployment-guides/horizontal-scaling.md) 示例展示了如何将您的数据分片到两个节点，并使用分布式表。这使得数据存储在两个 ClickHouse 节点上。这两个 ClickHouse 节点还运行 ClickHouse Keeper 提供分布式同步。第三个节点独立运行 ClickHouse Keeper，以完成 ClickHouse Keeper 的法定人数。

- [**故障容错的复制**](/deployment-guides/replicated.md) 示例展示了如何在两个节点之间复制您的数据，并使用 ReplicatedMergeTree 表。这同样使得数据存储在两个 ClickHouse 节点上。除了这两个 ClickHouse 服务器节点外，还有三个独立的 ClickHouse Keeper 节点来管理复制。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/vBjCJtw_Ei0"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

### 中级 {#intermediate}

- 敬请期待

### 高级 {#advanced}

- 敬请期待
