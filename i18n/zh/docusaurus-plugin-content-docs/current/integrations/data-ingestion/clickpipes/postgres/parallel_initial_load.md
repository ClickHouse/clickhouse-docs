---
title: 'Postgres ClickPipe 中的并行快照'
description: '解释 Postgres ClickPipe 中并行快照机制的文档'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '并行快照的工作原理'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

本文档介绍了 Postgres ClickPipe 中并行快照/初始加载的工作机制，并说明了可用于控制该过程的快照参数。


## 概述 {#overview-pg-snapshot}

初始加载是 CDC ClickPipe 的第一个阶段,在此阶段 ClickPipe 会将源数据库中表的历史数据同步到 ClickHouse,然后再启动 CDC。通常情况下,开发人员会以单线程方式执行此操作——例如使用 pg_dump 或 pg_restore,或使用单个线程从源数据库读取数据并写入 ClickHouse。
然而,Postgres ClickPipe 可以并行化此过程,从而显著加快初始加载速度。

### Postgres 中的 CTID 列 {#ctid-pg-snapshot}

在 Postgres 中,表中的每一行都有一个称为 CTID 的唯一标识符。这是一个系统列,默认情况下对用户不可见,但可用于唯一标识表中的行。CTID 是块编号和块内偏移量的组合,可实现对行的高效访问。

### 逻辑分区 {#logical-partitioning-pg-snapshot}

Postgres ClickPipe 使用 CTID 列对源表进行逻辑分区。它首先对源表执行 COUNT(\*),然后执行窗口函数分区查询来获取每个分区的 CTID 范围,从而获得分区。这使得 ClickPipe 能够并行读取源表,每个分区由单独的线程处理。

下面我们来讨论以下设置:

<Image img={snapshot_params} alt='快照参数' size='md' />

#### 每个分区的快照行数 {#numrows-pg-snapshot}

此设置控制一个分区包含多少行。ClickPipe 将按此大小的块读取源表,并根据设置的初始加载并行度并行处理这些块。默认值为每个分区 100,000 行。

#### 初始加载并行度 {#parallelism-pg-snapshot}

此设置控制并行处理的分区数量。默认值为 4,这意味着 ClickPipe 将并行读取源表的 4 个分区。可以增加此值以加快初始加载速度,但建议根据源实例的规格将其保持在合理范围内,以避免源数据库过载。ClickPipe 将根据源表的大小和每个分区的行数自动调整分区数量。

#### 并行快照的表数量 {#tables-parallel-pg-snapshot}

虽然与并行快照没有直接关系,但此设置控制在初始加载期间并行处理的表数量。默认值为 1。请注意,这是在分区并行度之上的,因此如果您有 4 个分区和 2 个表,ClickPipe 将并行读取 8 个分区。

### 在 Postgres 中监控并行快照 {#monitoring-parallel-pg-snapshot}

您可以通过分析 **pg_stat_activity** 来查看并行快照的运行情况。ClickPipe 将创建到源数据库的多个连接,每个连接读取源表的不同分区。如果您看到具有不同 CTID 范围的 **FETCH** 查询,则表示 ClickPipe 正在读取源表。您还可以在此处看到 COUNT(\*) 和分区查询。

### 限制 {#limitations-parallel-pg-snapshot}

- 创建管道后无法编辑快照参数。如果要更改它们,则必须创建新的 ClickPipe。
- 向现有 ClickPipe 添加表时,无法更改快照参数。ClickPipe 将对新表使用现有参数。
- 分区键列不应包含 `NULL` 值,因为分区逻辑会跳过它们。
