---
slug: '/engines/table-engines/special/'
sidebar_position: 50
sidebar_label: '特殊'
---


# 特殊表引擎

表引擎主要分为三个类别：

- [MergeTree 引擎系列](../../../engines/table-engines/mergetree-family/index.md) 用于主要生产用途。
- [Log 引擎系列](../../../engines/table-engines/log-family/index.md) 用于小型临时数据。
- [用于集成的表引擎](../../../engines/table-engines/integrations/index.md)。

其余的引擎因其特定用途而独特，尚未分组，因此被归入这个“特殊”类别。

<!-- 本页面的目录表由以下链接自动生成： 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
来自 YAML 前言字段：slug、description、title。

如果您发现错误，请编辑页面的 YML 前言。 -->
| 页面 | 描述 |
|-----|-----|
| [Buffer 表引擎](/engines/table-engines/special/buffer) | 将数据缓冲到内存中，定期刷新到另一张表。在读取操作期间，同时从缓冲区和另一张表中读取数据。 |
| [Executable and ExecutablePool 表引擎](/engines/table-engines/special/executable) | `Executable` 和 `ExecutablePool` 表引擎允许您定义一个表，其行是通过您定义的脚本生成的（通过将行写入 **stdout**）。 |
| [URL 表引擎](/engines/table-engines/special/url) | 从远程 HTTP/HTTPS 服务器查询数据。该引擎与文件引擎类似。 |
| [View 表引擎](/engines/table-engines/special/view) | 用于实现视图（有关更多信息，请参见 `CREATE VIEW 查询`）。它不存储数据，只存储指定的 `SELECT` 查询。在从表中读取时，它会运行该查询（并删除查询中所有不必要的列）。 |
| [Distributed 表引擎](/engines/table-engines/special/distributed) | 使用 Distributed 引擎的表不存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取会自动并行化。在读取时，会使用远程服务器上的表索引（如果有的话）。 |
| [File 表引擎](/engines/table-engines/special/file) | File 表引擎将数据保存在以支持的文件格式（`TabSeparated`、`Native` 等）中的文件中。 |
| [FileLog 引擎](/engines/table-engines/special/filelog) | 此引擎允许将应用程序日志文件作为记录流进行处理。 |
| [Set 表引擎](/engines/table-engines/special/set) | 一个始终保存在内存中的数据集。它的目的在于用于 `IN` 运算符的右侧。 |
| [Dictionary 表引擎](/engines/table-engines/special/dictionary) | `Dictionary` 引擎将字典数据展示为 ClickHouse 表。 |
| [GenerateRandom 表引擎](/engines/table-engines/special/generate) | GenerateRandom 表引擎为给定的表模式生成随机数据。 |
| [Memory 表引擎](/engines/table-engines/special/memory) | Memory 引擎将数据以未压缩的形式存储在内存中。数据与读取时接收的形式完全相同。换句话说，从此表中读取是完全免费的。 |
| [Merge 表引擎](/engines/table-engines/special/merge) | `Merge` 引擎（与 `MergeTree` 不同）本身不存储数据，但允许同时从任意多个其他表中读取数据。 |
| [External Data for Query Processing](/engines/table-engines/special/external-data) | ClickHouse 允许将处理查询所需的数据与 `SELECT` 查询一起发送给服务器。这些数据放在临时表中，可以在查询中使用（例如，在 `IN` 运算符中）。 |
| [Join 表引擎](/engines/table-engines/special/join) | 用于 JOIN 操作的可选准备数据结构。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | 此引擎允许您使用 Keeper/ZooKeeper 集群作为具有线性可写和顺序一致读的持久键值存储。 |
| [Null 表引擎](/engines/table-engines/special/null) | 向 `Null` 表写入时，数据会被忽略。读取 `Null` 表时，响应是空的。 |
