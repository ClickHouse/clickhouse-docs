---
'title': 'MySQL ClickPipe 中的并行快照'
'description': '文档解释 MySQL ClickPipe 中的并行快照'
'slug': '/integrations/clickpipes/mysql/parallel_initial_load'
'sidebar_label': '并行快照的工作原理'
'doc_type': 'guide'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

这份文档解释了 MySQL ClickPipe 中的并行快照/初始加载工作原理，并介绍了可以用于控制它的快照参数。

## 概述 {#overview-mysql-snapshot}

初始加载是 CDC ClickPipe 的第一阶段，在此阶段，ClickPipe 会将源数据库中表的历史数据同步到 ClickHouse，然后再开始 CDC。很多时候，开发人员会以单线程的方式进行。然而，MySQL ClickPipe 可以并行化该过程，这可以显著加快初始加载速度。

### 分区键列 {#key-mysql-snapshot}

一旦我们启用了功能标志，您应该在 ClickPipe 表选择器中看到以下设置（在创建和编辑 ClickPipe 时）：
<Image img={partition_key} alt="分区键列" size="md"/>

MySQL ClickPipe 使用源表上的一个列来逻辑上对源表进行分区。这个列称为 **分区键列**。它用于将源表划分为多个分区，然后 ClickPipe 可以并行处理这些分区。

:::warning
分区键列必须在源表中被索引，以便获得良好的性能提升。可以通过在 MySQL 中运行 `SHOW INDEX FROM <table_name>` 来查看。
:::

### 逻辑分区 {#logical-partitioning-mysql-snapshot}

让我们来讨论以下设置：

<Image img={snapshot_params} alt="快照参数" size="md"/>

#### 每个分区的快照行数 {#numrows-mysql-snapshot}
此设置控制构成一个分区的行数。ClickPipe 将以此大小的块读取源表，并根据设置的初始加载并行处理这些块。默认值是每个分区 100,000 行。

#### 初始加载并行度 {#parallelism-mysql-snapshot}
此设置控制并行处理多少个分区。默认值为 4，这意味着 ClickPipe 将并行读取源表的 4 个分区。可以增加此值以加快初始加载，但建议根据源实例规格将其保持在合理的值，以避免对源数据库造成过大压力。ClickPipe 将根据源表的大小和每个分区的行数自动调整分区数量。

#### 并行快照中的表数量 {#tables-parallel-mysql-snapshot}
此设置与并行快照没有直接关系，但它控制在初始加载过程中并行处理多少个表。默认值为 1。请注意，这是在分区并行性基础之上的，因此如果您有 4 个分区和 2 个表，则 ClickPipe 将并行读取 8 个分区。

### 监控 MySQL 中的并行快照 {#monitoring-parallel-mysql-snapshot}
您可以在 MySQL 中运行 **SHOW processlist** 来查看并行快照的实际情况。ClickPipe 会创建多个连接到源数据库，每个连接读取源表的不同分区。如果您看到具有不同范围的 **SELECT** 查询，这意味着 ClickPipe 正在读取源表。您还可以在这里看到 COUNT(*) 和分区查询。

### 限制 {#limitations-parallel-mysql-snapshot}
- 快照参数在管道创建后不能被编辑。如果您想更改它们，则必须创建一个新的 ClickPipe。
- 在现有 ClickPipe 中添加表时，您不能更改快照参数。ClickPipe 将使用现有参数处理新表。
- 分区键列不应包含 `NULL`，因为它们会被分区逻辑跳过。
