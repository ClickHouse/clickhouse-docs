---
'description': '特殊表引擎的文档'
'sidebar_label': '特殊'
'sidebar_position': 50
'slug': '/engines/table-engines/special/'
'title': '特殊表引擎'
---


# 特殊表引擎

表引擎主要分为三个类别：

- [MergeTree 引擎系列](../../../engines/table-engines/mergetree-family/index.md) 适用于主要生产用途。
- [Log 引擎系列](../../../engines/table-engines/log-family/index.md) 适用于小型临时数据。
- [集成的表引擎](../../../engines/table-engines/integrations/index.md)。

其余引擎在用途上独特，尚未被归类到系列中，因此被放置在这个“特殊”类别中。

<!-- 此页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
根据 YAML 前言字段：slug, description, title 自动生成。

如果您发现错误，请编辑页面本身的 YML 前言。
-->
| 页面 | 描述 |
|-----|-----|
| [缓冲表引擎](/engines/table-engines/special/buffer) | 将数据缓冲到 RAM 中，定期刷新到另一个表。在读取操作期间，同步从缓冲区和其他表中读取数据。 |
| [可执行和可执行池表引擎](/engines/table-engines/special/executable) | `Executable` 和 `ExecutablePool` 表引擎允许您定义一个表，其行由您定义的脚本生成（通过写入 **stdout**）。 |
| [URL 表引擎](/engines/table-engines/special/url) | 查询来自远程 HTTP/HTTPS 服务器的数据。此引擎类似于文件引擎。 |
| [视图表引擎](/engines/table-engines/special/view) | 用于实现视图（欲了解更多信息，请参见 `CREATE VIEW 查询`）。它不存储数据，仅存储指定的 `SELECT` 查询。在从表中读取时，它执行此查询（并从查询中删除所有不必要的列）。 |
| [分布式表引擎](/engines/table-engines/special/distributed) | 使用分布式引擎的表不存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取被自动并行化。在读取过程中，如果远程服务器上有表索引，则会使用这些索引。 |
| [文件表引擎](/engines/table-engines/special/file) | 文件表引擎将数据保存在以某种受支持的文件格式（`TabSeparated`, `Native` 等）中的文件中。 |
| [FileLog 引擎](/engines/table-engines/special/filelog) | 此引擎允许处理应用程序日志文件，作为记录流。 |
| [集合表引擎](/engines/table-engines/special/set) | 一种始终保存在 RAM 中的数据集。它旨在用于 `IN` 操作符的右侧。 |
| [字典表引擎](/engines/table-engines/special/dictionary) | `Dictionary` 引擎将字典数据显示为 ClickHouse 表。 |
| [生成随机表引擎](/engines/table-engines/special/generate) | GenerateRandom 表引擎根据给定的表模式生成随机数据。 |
| [内存表引擎](/engines/table-engines/special/memory) | 内存引擎以未压缩的形式将数据存储在 RAM 中。数据以读取时接收的完全相同的形式存储。换句话说，从此表读取数据是完全免费的。 |
| [合并表引擎](/engines/table-engines/special/merge) | `Merge` 引擎（不要与 `MergeTree` 混淆）不存储数据本身，但允许同时从任意数量的其他表中读取数据。 |
| [查询处理的外部数据](/engines/table-engines/special/external-data) | ClickHouse 允许向服务器发送处理查询所需的数据，以及一个 `SELECT` 查询。这些数据被放入临时表中，并可以在查询中使用（例如，在 `IN` 操作符中）。 |
| [连接表引擎](/engines/table-engines/special/join) | 用于在 JOIN 操作中使用的可选预处理数据结构。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | 此引擎允许您使用 Keeper/ZooKeeper 集群作为一致性键值存储，具有线性可写和顺序一致的读取。 |
| [空表引擎](/engines/table-engines/special/null) | 写入 `Null` 表时，数据被忽略。从 `Null` 表读取时，响应为空。 |
