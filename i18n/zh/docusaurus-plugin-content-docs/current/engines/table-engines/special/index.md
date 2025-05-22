---
'description': '关于特殊 TABLE 引擎的文档'
'sidebar_label': 'Special'
'sidebar_position': 50
'slug': '/engines/table-engines/special/'
'title': '特殊表引擎'
---


# 特殊表引擎

表引擎主要分为三类：

- [MergeTree 引擎家族](../../../engines/table-engines/mergetree-family/index.md) 主要用于生产环境。
- [Log 引擎家族](../../../engines/table-engines/log-family/index.md) 适用于小型临时数据。
- [集成的表引擎](../../../engines/table-engines/integrations/index.md)。

其余引擎因用途独特尚未归类，因此被放置在这个“特殊”类别中。

<!-- 此页面的目录表通过 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
根据 YAML 前置数据字段自动生成：slug、description、title。

如果您发现错误，请编辑页面的 YML 前置数据。 -->
| 页面 | 描述 |
|-----|-----|
| [Buffer 表引擎](/engines/table-engines/special/buffer) | 将数据缓冲到内存中，定期刷新到另一个表。在读取操作期间，从缓冲区和其他表同时读取数据。 |
| [Executable 和 ExecutablePool 表引擎](/engines/table-engines/special/executable) | `Executable` 和 `ExecutablePool` 表引擎允许您定义一个表，其行由您定义的脚本生成（通过写入 **stdout**）。 |
| [URL 表引擎](/engines/table-engines/special/url) | 从远程 HTTP/HTTPS 服务器查询数据。该引擎类似于 File 引擎。 |
| [View 表引擎](/engines/table-engines/special/view) | 用于实现视图 (有关更多信息，请参见 `CREATE VIEW 查询`)。它不存储数据，而仅存储指定的 `SELECT` 查询。读取表时，将执行此查询 (并从查询中删除所有不必要的列)。 |
| [Distributed 表引擎](/engines/table-engines/special/distributed) | 使用 Distributed 引擎的表不存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取自动并行化。在读取时，如果远程服务器上有表索引，会被使用。 |
| [File 表引擎](/engines/table-engines/special/file) | File 表引擎将数据保存在支持的某种文件格式（`TabSeparated`、`Native` 等）中的文件中。 |
| [FileLog 引擎](/engines/table-engines/special/filelog) | 此引擎允许处理应用程序日志文件作为记录流。 |
| [Set 表引擎](/engines/table-engines/special/set) | 始终驻留在内存中的数据集。它用于 `IN` 操作符的右侧。 |
| [Dictionary 表引擎](/engines/table-engines/special/dictionary) | `Dictionary` 引擎将字典数据显示为 ClickHouse 表。 |
| [GenerateRandom 表引擎](/engines/table-engines/special/generate) | GenerateRandom 表引擎根据给定的表模式生成随机数据。 |
| [Memory 表引擎](/engines/table-engines/special/memory) | Memory 引擎将数据以未压缩的形式存储在内存中。数据以接收时的完全相同形式存储。换句话说，从此表读取数据是完全免费的。 |
| [Merge 表引擎](/engines/table-engines/special/merge) | `Merge` 引擎（不要与 `MergeTree` 混淆）不存储数据，而是允许同时从任意数量的其他表中读取数据。 |
| [外部数据用于查询处理](/engines/table-engines/special/external-data) | ClickHouse 允许将处理查询所需的数据与 `SELECT` 查询一起发送到服务器。此数据放在临时表中，并可以在查询中使用（例如，在 `IN` 操作符中）。 |
| [Join 表引擎](/engines/table-engines/special/join) | 用于 JOIN 操作的可选预准备数据结构。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | 此引擎允许您使用 Keeper/ZooKeeper 集群作为具有线性可写和顺序一致读取的稳定键值存储。 |
| [Null 表引擎](/engines/table-engines/special/null) | 向 `Null` 表写入时，数据会被忽略。读取 `Null` 表时，响应为空。 |
