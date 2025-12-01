---
title: 'MySQL ClickPipe 中的并行快照'
description: '介绍 MySQL ClickPipe 中并行快照机制的文档'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '并行快照的工作原理'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

本文说明 MySQL ClickPipe 中并行快照/初始加载的工作机制，并介绍可用于控制该过程的快照参数。


## 概览 {#overview-mysql-snapshot}

初始加载是 CDC ClickPipe 的第一个阶段，在此阶段 ClickPipe 会在开始 CDC 之前，将源数据库中各个表的历史数据同步到 ClickHouse。很多情况下，开发者会以单线程的方式来执行这一步。
不过，MySQL ClickPipe 可以将这一过程并行化，从而显著加快初始加载速度。

### 分区键列 {#key-mysql-snapshot}

启用功能开关（feature flag）后，你应当在 ClickPipe 的表选择器中看到如下设置（在创建和编辑 ClickPipe 时均会显示）：
<Image img={partition_key} alt="分区键列" size="md"/>

MySQL ClickPipe 会使用源表中的某一列来对源表进行逻辑分区。该列称为 **分区键列（partition key column）**。它用于将源表拆分为多个分区，之后 ClickPipe 可以并行处理这些分区。

:::warning
要获得明显的性能提升，分区键列必须在源表中建立索引。你可以在 MySQL 中运行 `SHOW INDEX FROM <table_name>` 来查看。
:::

### 逻辑分区 {#logical-partitioning-mysql-snapshot}

下面来说明这些设置：

<Image img={snapshot_params} alt="快照参数" size="md"/>

#### 每个分区的快照行数 {#numrows-mysql-snapshot}
此设置控制多少行数据构成一个分区。ClickPipe 会按该大小分块读取源表，而这些分块会根据设定的初始加载并行度并行处理。默认值为每个分区 100,000 行。

#### 初始加载并行度 {#parallelism-mysql-snapshot}
此设置控制有多少个分区会被并行处理。默认值为 4，这意味着 ClickPipe 会并行读取源表的 4 个分区。你可以增大此值以加快初始加载，但建议根据源实例的规格将其保持在合理范围内，以避免给源数据库带来过大压力。ClickPipe 会根据源表大小和每个分区的行数自动调整分区数量。

#### 并行快照的表数量 {#tables-parallel-mysql-snapshot}
此设置与分区并行快照并非直接相关，但它控制在初始加载期间有多少张表会被并行处理。默认值为 1。注意，这是在分区并行度之上的额外并行度，因此如果你有 4 个分区和 2 张表，ClickPipe 将会并行读取 8 个分区。

### 在 MySQL 中监控并行快照 {#monitoring-parallel-mysql-snapshot}
你可以在 MySQL 中运行 **SHOW processlist** 来查看并行快照的执行情况。ClickPipe 会对源数据库创建多个连接，每个连接读取源表的不同分区。如果你看到带有不同范围条件的 **SELECT** 查询，就表示 ClickPipe 正在读取源表。你还可以在其中看到 COUNT(*) 和用于分区的查询。

### 限制 {#limitations-parallel-mysql-snapshot}
- 在创建管道后，快照参数无法编辑。如果你想修改它们，需要重新创建一个 ClickPipe。
- 当向已有的 ClickPipe 中添加表时，你不能更改快照参数。ClickPipe 会对新表沿用现有参数。
- 分区键列不应包含 `NULL` 值，因为分区逻辑会跳过这些值所在的行。
