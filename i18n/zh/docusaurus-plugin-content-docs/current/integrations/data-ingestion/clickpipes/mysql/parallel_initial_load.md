---
title: 'MySQL ClickPipe 中的并行快照'
description: '解释 MySQL ClickPipe 中并行快照机制的文档'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '并行快照的工作原理'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

本文介绍 MySQL ClickPipe 中的并行快照/初始加载机制，并讨论可用于控制该过程的快照参数。


## 概览 \{#overview-mysql-snapshot\}

初始加载是 CDC ClickPipe 的第一阶段，在这一阶段中，ClickPipe 会先将源数据库中各个表的历史数据同步到 ClickHouse，然后再开始 CDC。很多情况下，开发者会以单线程方式执行这一过程。
不过，MySQL ClickPipe 可以将这一过程并行化，从而显著加速初始加载。

### 分区键列 \{#key-mysql-snapshot\}

启用该功能开关后，你应当在 ClickPipe 表选择器中看到如下设置（在创建和编辑 ClickPipe 时都会出现）：

<Image img={partition_key} alt="分区键列" size="md"/>

MySQL ClickPipe 会使用源表中的某一列来对源表进行逻辑分区。该列被称为**分区键列（partition key column）**。它用于将源表划分为多个分区，这些分区随后可以由 ClickPipe 并行处理。

:::warning
为了获得良好的性能提升，分区键列在源表中必须建立索引。可以通过在 MySQL 中运行 `SHOW INDEX FROM <table_name>` 来进行确认。
:::

### 逻辑分区 \{#logical-partitioning-mysql-snapshot\}

下面我们来看看这些 SETTING：

<Image img={snapshot_params} alt="Snapshot 参数" size="md"/>

#### 每个分区的快照行数 \{#numrows-mysql-snapshot\}

该设置控制构成一个分区的行数。ClickPipe 会按该大小将源表分块读取，并根据设置的初始加载并行度并行处理这些分块。默认值为每个分区 100,000 行。

#### 初始加载并行度 \{#parallelism-mysql-snapshot\}

该设置控制可以并行处理多少个分区。默认值为 4，这意味着 ClickPipe 将并行读取源表中的 4 个分区。可以提高该值以加快初始加载速度，但建议根据源实例规格将其保持在一个合理范围内，以避免给源数据库带来过大压力。ClickPipe 会根据源表的大小以及每个分区的行数自动调整分区数量。

#### 并行快照的表数量 \{#tables-parallel-mysql-snapshot\}

这与并行快照本身并不直接相关，但该设置控制初始加载期间可并行处理的表数量。默认值为 1。请注意，这是在分区并行度之上的，因此如果你有 4 个分区和 2 张表，ClickPipe 将会并行读取 8 个分区。

### 在 MySQL 中监控并行快照 \{#monitoring-parallel-mysql-snapshot\}

你可以在 MySQL 中运行 **SHOW processlist** 来观察并行快照的运行情况。ClickPipe 会对源数据库创建多个连接，每个连接读取源表的不同分区。如果你看到带有不同范围条件的 **SELECT** 查询，这意味着 ClickPipe 正在读取源表。在这里你还可以看到 COUNT(*) 查询以及分区相关的查询。

### 限制 \{#limitations-parallel-mysql-snapshot\}

- 创建 pipe 之后，无法修改快照参数。如果需要更改这些参数，必须创建一个新的 ClickPipe。
- 向现有 ClickPipe 添加表时，不能更改快照参数。ClickPipe 会对新表使用现有参数。
- 分区键列不应包含 `NULL`，因为分区逻辑会跳过这些值。