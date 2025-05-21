---
'description': '特殊表引擎文档'
'sidebar_label': '特殊'
'sidebar_position': 50
'slug': '/engines/table-engines/special/'
'title': 'Special Table Engines'
---




# 特殊表引擎

表引擎主要分为三大类：

- [MergeTree 引擎系列](../../../engines/table-engines/mergetree-family/index.md)用于主要的生产用途。
- [Log 引擎系列](../../../engines/table-engines/log-family/index.md)用于小型临时数据。
- [集成用表引擎](../../../engines/table-engines/integrations/index.md)。

其余引擎在其用途上是独特的，尚未归入任何系列，因此被置于这个“特殊”类别。

<!-- 此页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 自动生成
基于 YAML 前端字段：slug、description、title。

如果您发现错误，请编辑页面本身的 YML 前端。
-->
| 页面 | 描述 |
|-----|-----|
| [缓冲表引擎](/engines/table-engines/special/buffer) | 在 RAM 中缓冲待写入的数据，定期刷新到另一张表。在读取操作中，同时从缓冲区和另一张表中读取数据。 |
| [可执行和可执行池表引擎](/engines/table-engines/special/executable) | `Executable` 和 `ExecutablePool` 表引擎允许您定义一张由您定义的脚本生成的表（通过将行写入 **stdout**）。 |
| [URL 表引擎](/engines/table-engines/special/url) | 从远程 HTTP/HTTPS 服务器查询数据。这种引擎类似于文件引擎。 |
| [视图表引擎](/engines/table-engines/special/view) | 用于实现视图（更多信息请参见 `CREATE VIEW 查询`）。它不存储数据，仅存储指定的 `SELECT` 查询。在读取表时，它执行此查询并删除查询中所有不必要的列。 |
| [分布式表引擎](/engines/table-engines/special/distributed) | 分布式引擎的表不存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取操作会自动并行化。在读取时，将使用远程服务器上的表索引（如果有的话）。 |
| [文件表引擎](/engines/table-engines/special/file) | 文件表引擎将数据保存在支持的文件格式中的一个文件中（`TabSeparated`、`Native` 等）。 |
| [文件日志引擎](/engines/table-engines/special/filelog) | 此引擎允许将应用程序日志文件处理为记录流。 |
| [集合表引擎](/engines/table-engines/special/set) | 始终在 RAM 中的数据集。旨在用于 `IN` 操作符的右侧。 |
| [字典表引擎](/engines/table-engines/special/dictionary) | `Dictionary` 引擎将字典数据显示为 ClickHouse 表。 |
| [随机生成表引擎](/engines/table-engines/special/generate) | 随机生成表引擎为给定的表模式生成随机数据。 |
| [内存表引擎](/engines/table-engines/special/memory) | 内存引擎以未压缩的形式将数据存储在 RAM 中。数据以接收时的相同形式存储。换句话说，从此表读取是完全免费的。 |
| [合并表引擎](/engines/table-engines/special/merge) | `Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，但允许同时从任意数量的其他表中读取数据。 |
| [查询处理的外部数据](/engines/table-engines/special/external-data) | ClickHouse 允许向服务器发送处理查询所需的数据，以及一个 `SELECT` 查询。这些数据被放入临时表中，并可在查询中使用（例如，在 `IN` 操作符中）。 |
| [连接表引擎](/engines/table-engines/special/join) | 用于 JOIN 操作的可选预备数据结构。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | 此引擎允许您将 Keeper/ZooKeeper 集群用作具有线性化写入和顺序一致性读取的一致键值存储。 |
| [空表引擎](/engines/table-engines/special/null) | 写入 `Null` 表时，数据会被忽略。从 `Null` 表读取时，响应为空。 |
