---
title: 'Postgres ClickPipe 中的并行快照'
description: '本文档说明 Postgres ClickPipe 中的并行快照'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '并行快照的工作原理'
doc_type: 'guide'
keywords: ['ClickPipes', 'PostgreSQL', 'CDC', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

本文介绍了 Postgres ClickPipe 中并行快照和初始加载的工作原理，并说明了可用于控制该过程的快照参数。

## 概览 \{#overview-pg-snapshot\}

初始加载是 CDC ClickPipe 的第一阶段，在这一阶段，ClickPipe 会先将源数据库中各个表的历史数据同步到 ClickHouse，然后再开始 CDC。很多情况下，开发者会以单线程方式来执行这一过程——例如使用 pg_dump 或 pg_restore，或者用单个线程从源数据库读取并写入到 ClickHouse。
然而，Postgres ClickPipe 可以将这一过程并行化，从而显著加快初始加载。

### Postgres 中的 CTID 列 \{#ctid-pg-snapshot\}

在 Postgres 中，表中的每一行都有一个名为 CTID 的唯一标识符。它是一个系统列，默认对用户不可见，但可以用来在表中唯一标识行。CTID 由块号和块内偏移量组成，这种结构使得访问行非常高效。

### 逻辑分区 \{#logical-partitioning-pg-snapshot\}
Postgres ClickPipe 使用 CTID 列对源表进行逻辑分区。它首先对源表执行一次 COUNT(*)，然后通过一个带窗口函数的分区查询获取每个分区的 CTID 范围。这样 ClickPipe 就可以并行读取源表，每个分区由一个独立线程处理。

下面来介绍以下这些设置：

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### 每个分区的快照行数 \{#numrows-pg-snapshot\}

此设置控制一个分区包含多少行。ClickPipe 会按该大小对源表进行分块读取，并根据配置的初始加载并行度对这些分块进行并行处理。默认值为每个分区 100,000 行。

#### 初始加载并行度 \{#parallelism-pg-snapshot\}

此设置控制有多少个分区会被并行处理。默认值为 4，这意味着 ClickPipe 会并行读取源表的 4 个分区。可以通过增大该值来加快初始加载，但建议根据源实例的规格将其控制在合理范围内，以避免压垮源数据库。ClickPipe 会根据源表大小以及每个分区的行数自动调整分区数量。

#### 并行加载的表数量 \{#tables-parallel-pg-snapshot\}

虽然与分区级别的并行快照没有直接关系，但该设置控制在初始加载过程中有多少张表会被并行处理。默认值为 1。需要注意的是，这是在分区并行度之上的叠加效果，因此如果你有 4 个分区和 2 张表，ClickPipe 将会并行读取 8 个分区。

### 在 Postgres 中监控并行快照 \{#monitoring-parallel-pg-snapshot\}

你可以分析 **pg_stat_activity** 来查看并行快照的实际执行情况。ClickPipe 会创建多个到源数据库的连接，每个连接读取源表的不同分区。如果你看到带有不同 CTID 范围的 **FETCH** 查询，就说明 ClickPipe 正在读取源表。你也可以在这里看到 COUNT(*) 和分区查询。

### 限制 \{#limitations-parallel-pg-snapshot\}

- 在创建 ClickPipe 之后，快照参数无法修改。如果你想更改这些参数，必须创建一个新的 ClickPipe。
- 当向已有的 ClickPipe 中添加表时，你不能更改快照参数。ClickPipe 会对新表沿用已有参数。
- 分区键列不应包含 `NULL`，因为分区逻辑会跳过这些值。