---
'title': 'Postgres ClickPipe中的并行快照'
'description': '文档解释Postgres ClickPipe中的并行快照'
'slug': '/integrations/clickpipes/postgres/parallel_initial_load'
'sidebar_label': '并行快照如何工作'
'doc_type': 'guide'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

This document explains parallelized snapshot/initial load in the Postgres ClickPipe works and talks about the snapshot parameters that can be used to control it.

## 概述 {#overview-pg-snapshot}

初始加载是CDC ClickPipe的第一阶段，在此阶段，ClickPipe将源数据库中表的历史数据同步到ClickHouse，然后再开始CDC。很多时候，开发者会采用单线程的方式进行这项工作，比如使用pg_dump或pg_restore，或者使用单个线程从源数据库读取并写入ClickHouse。然而，Postgres ClickPipe可以并行化这个过程，这可以显著加快初始加载的速度。

### Postgres中的CTID列 {#ctid-pg-snapshot}
在Postgres中，表中的每一行都有一个唯一标识符称为CTID。这是一个系统列，默认情况下对用户不可见，但可以用来唯一标识表中的行。CTID是块号和块内偏移量的组合，这使得访问行的效率很高。

### 逻辑分区 {#logical-partitioning-pg-snapshot}
Postgres ClickPipe使用CTID列对源表进行逻辑分区。它通过首先对源表执行COUNT(*)，然后执行窗口函数分区查询以获取每个分区的CTID范围，从而获得分区。这使得ClickPipe可以并行读取源表，每个分区由单独的线程处理。

让我们讨论以下设置：

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### 每个分区的快照行数 {#numrows-pg-snapshot}

此设置控制每个分区包含多少行。ClickPipe将以此大小的块读取源表，这些块将根据设置的初始加载并行性并行处理。默认值是每个分区100,000行。

#### 初始加载并行性 {#parallelism-pg-snapshot}

此设置控制并行处理多少个分区。默认值为4，这意味着ClickPipe将并行读取源表中的4个分区。可以增加此值以加快初始加载，但建议根据源实例的规格将其保持在合理的值，以避免对源数据库造成过大的压力。ClickPipe将根据源表的大小和每个分区的行数自动调整分区数。

#### 并行快照的表数 {#tables-parallel-pg-snapshot}

与并行快照没有直接关系，但此设置控制在初始加载期间并行处理多少个表。默认值为1。请注意，这在分区的并行性之上，因此如果您有4个分区和2个表，ClickPipe将并行读取8个分区。

### 监控Postgres中的并行快照 {#monitoring-parallel-pg-snapshot}

您可以分析**pg_stat_activity**以查看并行快照的运行情况。ClickPipe将创建多个连接到源数据库，每个连接读取源表的不同分区。如果您看到具有不同CTID范围的**FETCH**查询，这意味着ClickPipe正在读取源表。您也可以在这里看到COUNT(*)和分区查询。

### 限制 {#limitations-parallel-pg-snapshot}

- 快照参数在管道创建后不能被编辑。如果您想更改它们，您必须创建一个新的ClickPipe。
- 当向现有ClickPipe添加表时，您不能更改快照参数。ClickPipe将对新表使用现有参数。
- 分区键列不应包含`NULL`，因为分区逻辑会跳过它们。
