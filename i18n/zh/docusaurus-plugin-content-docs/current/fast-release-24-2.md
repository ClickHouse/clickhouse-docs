---
slug: /whats-new/changelog/24.2-fast-release
title: 'v24.2 更新日志'
description: 'v24.2 快速发布更新日志'
keywords: ['changelog']
---
```

### ClickHouse release tag: 24.2.2.15987 {#clickhouse-release-tag-242215987}
#### Backward Incompatible Change {#backward-incompatible-change}
* 验证嵌套类型中的可疑/实验类型。之前我们没有对像 Array/Tuple/Map 这样的嵌套类型进行验证（JSON 除外）。 [#59385](https://github.com/ClickHouse/ClickHouse/pull/59385) ([Kruglov Pavel](https://github.com/Avogar)).
* 排序子句 `ORDER BY ALL`（在 v23.12 中引入）被 `ORDER BY *` 替换。之前的语法对于具有 `all` 列的表来说容易出错。 [#59450](https://github.com/ClickHouse/ClickHouse/pull/59450) ([Robert Schulze](https://github.com/rschu1ze)).
* 添加线程和块大小的合理性检查。 [#60138](https://github.com/ClickHouse/ClickHouse/pull/60138) ([Raúl Marín](https://github.com/Algunenano)).
* 在查询级别设置 `async_insert` 和 `deduplicate_blocks_in_dependent_materialized_views` 同时启用时拒绝传入的 INSERT 查询。该行为由设置 `throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert` 控制，默认启用。这是 [#59699](https://github.com/ClickHouse/ClickHouse/pull/59699) 的延续，解除对 [#59915](https://github.com/ClickHouse/ClickHouse/pull/59915) 的阻止。 [#60888](https://github.com/ClickHouse/ClickHouse/pull/60888) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 工具 `clickhouse-copier` 被移动到 GitHub 上的单独仓库： https://github.com/ClickHouse/copier。它不再包含在包内，但仍然可以作为单独下载使用。这关闭了： [#60734](https://github.com/ClickHouse/ClickHouse/issues/60734) 这关闭了： [#60540](https://github.com/ClickHouse/ClickHouse/issues/60540) 这关闭了： [#60250](https://github.com/ClickHouse/ClickHouse/issues/60250) 这关闭了： [#52917](https://github.com/ClickHouse/ClickHouse/issues/52917) 这关闭了： [#51140](https://github.com/ClickHouse/ClickHouse/issues/51140) 这关闭了： [#47517](https://github.com/ClickHouse/ClickHouse/issues/47517) 这关闭了： [#47189](https://github.com/ClickHouse/ClickHouse/issues/47189) 这关闭了： [#46598](https://github.com/ClickHouse/ClickHouse/issues/46598) 这关闭了： [#40257](https://github.com/ClickHouse/ClickHouse/issues/40257) 这关闭了： [#36504](https://github.com/ClickHouse/ClickHouse/issues/36504) 这关闭了： [#35485](https://github.com/ClickHouse/ClickHouse/issues/35485) 这关闭了： [#33702](https://github.com/ClickHouse/ClickHouse/issues/33702) 这关闭了： [#26702](https://github.com/ClickHouse/ClickHouse/issues/26702) ### 用户可见更改的文档条目。 [#61058](https://github.com/ClickHouse/ClickHouse/pull/61058) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 为了提高与 MySQL 的兼容性，函数 `locate` 现在默认接受参数 `(needle, haystack[, start_pos])`。之前的行为 `(haystack, needle, [, start_pos])` 可以通过设置 `function_locate_has_mysql_compatible_argument_order = 0` 进行恢复。 [#61092](https://github.com/ClickHouse/ClickHouse/pull/61092) ([Robert Schulze](https://github.com/rschu1ze)).
* 自版本 23.5 起，过时的内存数据部分已被弃用，自版本 23.10 起不再受支持。现在已删除剩余代码。这是 [#55186](https://github.com/ClickHouse/ClickHouse/issues/55186) 和 [#45409](https://github.com/ClickHouse/ClickHouse/issues/45409) 的延续。您不太可能使用内存数据部分，因为它们仅在版本 23.5 之前可用，并且仅在您手动启用指定相应设置的 MergeTree 表时可用。要检查是否有内存数据部分，请运行以下查询： `SELECT part_type, count() FROM system.parts GROUP BY part_type ORDER BY part_type`。要禁用使用内存数据部分，请执行 `ALTER TABLE ... MODIFY SETTING min_bytes_for_compact_part = DEFAULT, min_rows_for_compact_part = DEFAULT`。在从旧的 ClickHouse 版本升级之前，先检查确保没有内存数据部分。如果存在内存数据部分，请先禁用它们，然后等到没有内存数据部分再继续升级。 [#61127](https://github.com/ClickHouse/ClickHouse/pull/61127) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 默认情况下禁止在 `MergeTree` 表的 `ORDER BY` 中使用 `SimpleAggregateFunction`（就像禁止使用 `AggregateFunction` 一样，但它们被禁止是因为不可比较）。如需允许，请使用 `allow_suspicious_primary_key`。 [#61399](https://github.com/ClickHouse/ClickHouse/pull/61399) ([Azat Khuzhin](https://github.com/azat)).
* ClickHouse 允许在字符串数据类型中使用任意二进制数据，通常为 UTF-8。Parquet/ORC/Arrow 字符串仅支持 UTF-8。这就是为什么您可以选择用于 ClickHouse 字符串数据类型的 Arrow 数据类型 - 字符串或二进制。这由设置 `output_format_parquet_string_as_string`、 `output_format_orc_string_as_string` 和 `output_format_arrow_string_as_string` 控制。虽然二进制更正确且更兼容，但默认使用字符串在大多数情况下符合用户的期望。Parquet/ORC/Arrow 支持多种压缩方法，包括 lz4 和 zstd。ClickHouse 支持每一种压缩方法。一些低效的工具不支持更快的 `lz4` 压缩方法，这就是我们默认使用 `zstd` 的原因。这由设置 `output_format_parquet_compression_method`、 `output_format_orc_compression_method` 和 `output_format_arrow_compression_method` 控制。我们将 Parquet 和 ORC 的默认值更改为 `zstd`，但不包括 Arrow（强调用于低级用法）。 [#61817](https://github.com/ClickHouse/ClickHouse/pull/61817) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了物化视图的安全问题，这允许用户在没有所需权限的情况下向表中插入数据。修复验证用户不仅有权向物化视图插入数据，而且有权向所有底层表插入数据。这意味着之前的一些查询现在可能会因权限不足而失败。为了解决这个问题，此版本引入了视图的 SQL 安全性的新功能 [https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security](/sql-reference/statements/create/view#sql_security)。 [#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit))
#### New Feature {#new-feature}
* 支持 topk/topkweighed 模式，返回值的计数及其误差。 [#54508](https://github.com/ClickHouse/ClickHouse/pull/54508) ([UnamedRus](https://github.com/UnamedRus)).
* 添加了新的语法，允许在视图/物化视图中指定定义用户。这允许从视图中执行选择/插入，而无需明确授予底层表的权限。 [#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit)).
* 实现将不同类型的 merge tree 表自动转换为复制引擎。在表的数据目录中创建一个空的 `convert_to_replicated` 文件（`/clickhouse/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`），下次服务器启动时，该表将自动转换。 [#57798](https://github.com/ClickHouse/ClickHouse/pull/57798) ([Kirill](https://github.com/kirillgarbar)).
* 添加表函数 `mergeTreeIndex`。它表示 `MergeTree` 表的索引和标记文件的内容。可用于内部检查。语法： `mergeTreeIndex(database, table, [with_marks = true])`，其中 `database.table` 是一个现有的具有 `MergeTree` 引擎的表。 [#58140](https://github.com/ClickHouse/ClickHouse/pull/58140) ([Anton Popov](https://github.com/CurtizJ)).
* 尝试在模式推断过程中自动检测文件格式，如果在 `file/s3/hdfs/url/azureBlobStorage` 引擎中未知。关闭 [#50576](https://github.com/ClickHouse/ClickHouse/issues/50576)。 [#59092](https://github.com/ClickHouse/ClickHouse/pull/59092) ([Kruglov Pavel](https://github.com/Avogar)).
* 将 `generate_series` 添加为表函数。该函数生成具有自然数的等差数列的表。 [#59390](https://github.com/ClickHouse/ClickHouse/pull/59390) ([divanik](https://github.com/divanik)).
* 添加查询 `ALTER TABLE table FORGET PARTITION partition`，该查询删除与空分区相关的 ZooKeeper 节点。 [#59507](https://github.com/ClickHouse/ClickHouse/pull/59507) ([Sergei Trifonov](https://github.com/serxa)).
* 支持将备份作为 tar 归档读取和写入。 [#59535](https://github.com/ClickHouse/ClickHouse/pull/59535) ([josh-hildred](https://github.com/josh-hildred)).
* 提供新的聚合函数 ‘groupArrayIntersect’。后续： [#49862](https://github.com/ClickHouse/ClickHouse/issues/49862)。 [#59598](https://github.com/ClickHouse/ClickHouse/pull/59598) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 实现了 `system.dns_cache` 表，对于调试 DNS 问题可能非常有用。 [#59856](https://github.com/ClickHouse/ClickHouse/pull/59856) ([Kirill Nikiforov](https://github.com/allmazz)).
* 实现了 S3Express 存储桶的支持。 [#59965](https://github.com/ClickHouse/ClickHouse/pull/59965) ([Nikita Taranov](https://github.com/nickitat)).
* 编解码器 `LZ4HC` 将接受新级别 2，该级别比先前的最低级别 3 更快，代价是压缩率较低。在以前的版本中， `LZ4HC(2)` 及以下与 `LZ4HC(3)` 相同。作者：[Cyan4973](https://github.com/Cyan4973)。 [#60090](https://github.com/ClickHouse/ClickHouse/pull/60090) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 实现了 `system.dns_cache` 表，对于调试 DNS 问题可能非常有用。新的服务器设置 `dns_cache_max_size`。[#60257](https://github.com/ClickHouse/ClickHouse/pull/60257) ([Kirill Nikiforov](https://github.com/allmazz)).
* 添加了 `toMillisecond` 函数，该函数返回 `DateTime` 或 `DateTime64` 类型值的毫秒组件。 [#60281](https://github.com/ClickHouse/ClickHouse/pull/60281) ([Shaun Struwig](https://github.com/Blargian)).
* 支持合并表函数的单参数版本，例如 `merge(['db_name', ] 'tables_regexp')`。[#60372](https://github.com/ClickHouse/ClickHouse/pull/60372) ([豪肥肥](https://github.com/HowePa)).
* 所有格式名称均不区分大小写，例如 Tsv、TSV、tsv，甚至 rowbinary。 [#60420](https://github.com/ClickHouse/ClickHouse/pull/60420) ([豪肥肥](https://github.com/HowePa)).
* 添加了新的语法，允许在视图/物化视图中指定定义用户。这允许从视图中执行选择/插入，而无需明确授予底层表的权限。 [#60439](https://github.com/ClickHouse/ClickHouse/pull/60439) ([pufit](https://github.com/pufit)).
* 为 `StorageMemory`（内存引擎）添加四个属性 `min_bytes_to_keep, max_bytes_to_keep, min_rows_to_keep` 和 `max_rows_to_keep` - 添加测试以反映新更改 - 更新 `memory.md` 文档 - 为 `MemorySink` 添加表 `context` 属性以启用访问表参数边界。 [#60612](https://github.com/ClickHouse/ClickHouse/pull/60612) ([Jake Bamrah](https://github.com/JakeBamrah)).
* 添加了 `toMillisecond` 函数，该函数返回 `DateTime` 或 `DateTime64` 类型值的毫秒组件。 [#60649](https://github.com/ClickHouse/ClickHouse/pull/60649) ([Robert Schulze](https://github.com/rschu1ze)).
* 等待和执行查询的数量分开限制。新增服务器设置 `max_waiting_queries`，限制因 `async_load_databases` 等待的查询数量。现有的执行查询数量限制不再计算等待的查询。 [#61053](https://github.com/ClickHouse/ClickHouse/pull/61053) ([Sergei Trifonov](https://github.com/serxa)).
* 添加对 `ATTACH PARTITION ALL` 的支持。 [#61107](https://github.com/ClickHouse/ClickHouse/pull/61107) ([Kirill Nikiforov](https://github.com/allmazz)).
#### Performance Improvement {#performance-improvement}
* 消除 SELECT 部分中 GROUP BY 键的 min/max/any/anyLast 聚合器。 [#52230](https://github.com/ClickHouse/ClickHouse/pull/52230) ([JackyWoo](https://github.com/JackyWoo)).
* 改进序列化聚合方法在涉及多个 [nullable] 列时的性能。这是 [#51399](https://github.com/ClickHouse/ClickHouse/issues/51399) 的通用版本，不会损害抽象完整性。 [#55809](https://github.com/ClickHouse/ClickHouse/pull/55809) ([Amos Bird](https://github.com/amosbird)).
* 延迟构建连接输出，以提高 ALL 连接的性能。 [#58278](https://github.com/ClickHouse/ClickHouse/pull/58278) ([LiuNeng](https://github.com/liuneng1994)).
* 改进聚合函数 ArgMin / ArgMax / any / anyLast / anyHeavy 的性能，以及 `ORDER BY {u8/u16/u32/u64/i8/i16/u32/i64) LIMIT 1` 查询。 [#58640](https://github.com/ClickHouse/ClickHouse/pull/58640) ([Raúl Marín](https://github.com/Algunenano)).
* 通过减少分支缺失条件来优化大整数和大十进制类型的 sum/avg 性能。 [#59504](https://github.com/ClickHouse/ClickHouse/pull/59504) ([李扬](https://github.com/taiyang-li)).
* 改进活动变更下 SELECT 的性能。 [#59531](https://github.com/ClickHouse/ClickHouse/pull/59531) ([Azat Khuzhin](https://github.com/azat)).
* 对列过滤的微优化。避免对其底层数据类型不是过滤数字的过滤列进行 `result_size_hint = -1`。在某些情况下，峰值内存可减少到原来的 44%。 [#59698](https://github.com/ClickHouse/ClickHouse/pull/59698) ([李扬](https://github.com/taiyang-li)).
* 主键将使用更少的内存。 [#60049](https://github.com/ClickHouse/ClickHouse/pull/60049) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进主键和其他某些操作的内存使用。 [#60050](https://github.com/ClickHouse/ClickHouse/pull/60050) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 表的主键将在首次访问时以延迟方式加载到内存中。这由新的 MergeTree 设置 `primary_key_lazy_load` 控制，默认为开启。这提供了几个优势：- 不会加载未使用的表；- 如果内存不足，将在首次使用时抛出异常，而不是在服务器启动时。这带来了几个缺点：- 主键的加载延迟将在第一次查询上支付，而不是在接受连接之前；这理论上可能引入夺取问题。这关闭了 [#11188](https://github.com/ClickHouse/ClickHouse/issues/11188)。 [#60093](https://github.com/ClickHouse/ClickHouse/pull/60093) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 向量化函数 `dotProduct`，对向量搜索非常有用。 [#60202](https://github.com/ClickHouse/ClickHouse/pull/60202) ([Robert Schulze](https://github.com/rschu1ze)).
* 如果表的主键包含大多数无用的列，则无需将它们保留在内存中。这由一个新设置 `primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns` 控制，默认值为 `0.9`，这意味着：对于复合主键，如果某列在至少 0.9 的情况下更改其值，则将不加载其后续列。 [#60255](https://github.com/ClickHouse/ClickHouse/pull/60255) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 当 result_type 的底层类型为数字时，以列方式执行 multiIf 函数。 [#60384](https://github.com/ClickHouse/ClickHouse/pull/60384) ([李扬](https://github.com/taiyang-li)).
* 如图 1 所示，将 "&&" 替换为 "&" 可能会生成 SIMD 代码。 ![image](https://github.com/ClickHouse/ClickHouse/assets/26588299/a5a72ac4-6dc6-4d52-835a-4f512e55f0b9) 图 1. 从 '&&'（左）和 '&'（右）编译的代码。 [#60498](https://github.com/ClickHouse/ClickHouse/pull/60498) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* 更快（几乎 2 倍）的互斥锁（由于 ThreadFuzzer 而变慢）。 [#60823](https://github.com/ClickHouse/ClickHouse/pull/60823) ([Azat Khuzhin](https://github.com/azat)).
* 将连接排水从准备阶段移动到工作阶段，并并行排干多个连接。 [#60845](https://github.com/ClickHouse/ClickHouse/pull/60845) ([lizhuoyu5](https://github.com/lzydmxy)).
* 优化 nullable 数字或 nullable 字符串的 insertManyFrom。 [#60846](https://github.com/ClickHouse/ClickHouse/pull/60846) ([李扬](https://github.com/taiyang-li)).
* 优化函数 `dotProduct`，以省略不必要且昂贵的内存复制。 [#60928](https://github.com/ClickHouse/ClickHouse/pull/60928) ([Robert Schulze](https://github.com/rschu1ze)).
* 与文件系统缓存的操作将减少锁争用。 [#61066](https://github.com/ClickHouse/ClickHouse/pull/61066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 优化 ColumnString::replicate，并防止 memcpySmallAllowReadWriteOverflow15Impl 被优化为内置 memcpy。关闭 [#61074](https://github.com/ClickHouse/ClickHouse/issues/61074)。ColumnString::replicate 在 x86-64 上加速了 2.46 倍。 [#61075](https://github.com/ClickHouse/ClickHouse/pull/61075) ([李扬](https://github.com/taiyang-li)).
* 256 位整数的打印速度提高了 30 倍。 [#61100](https://github.com/ClickHouse/ClickHouse/pull/61100) ([Raúl Marín](https://github.com/Algunenano)).
* 如果查询的语法错误包含带有正则表达式的 COLUMNS 匹配器，则在解析器回溯期间每次都会编译正则表达式，而不是一次编译。这是一个根本错误。编译的 regexp 被放入 AST 中。但 AST 中的字母 A 意味着“抽象”，这意味着它不应该包含重量级对象。AST 的部分可以在解析期间创建和丢弃，包括大量的回溯。这会导致解析侧的缓慢，因此允许只读用户进行 DoS。但是，主要问题是这会阻碍模糊测试的进展。 [#61543](https://github.com/ClickHouse/ClickHouse/pull/61543) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

```yaml
title: '改进'
sidebar_label: '改进'
keywords: ['ClickHouse', '改进', '更新']
description: '更新的功能和改进建议。'
```

#### Improvement {#improvement}
* 在针对物化视图运行 `MODIFY COLUMN` 查询时，检查内部表的结构以确保每一列都存在。 [#47427](https://github.com/ClickHouse/ClickHouse/pull/47427) ([sunny](https://github.com/sunny19930321)).
* 添加了 `system.keywords` 表，包含解析器中的所有关键字。主要是需要的，将用于更好的模糊查询和语法高亮。 [#51808](https://github.com/ClickHouse/ClickHouse/pull/51808) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 添加了对带分析器的参数化视图的支持，以避免分析创建参数化视图。重构现有的参数化视图逻辑，以不分析创建参数化视图。 [#54211](https://github.com/ClickHouse/ClickHouse/pull/54211) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni)).
* 普通数据库引擎已弃用。如果您的服务器在使用它，您将在 clickhouse-client 中收到警告。这关闭了 [#52229](https://github.com/ClickHouse/ClickHouse/issues/52229)。 [#56942](https://github.com/ClickHouse/ClickHouse/pull/56942) ([shabroo](https://github.com/shabroo)).
* 与表相关的所有零拷贝锁在表被删除时必须被清除。包含这些锁的目录也必须被删除。 [#57575](https://github.com/ClickHouse/ClickHouse/pull/57575) ([Sema Checherinda](https://github.com/CheSema)).
* 为 `dictGetOrDefault` 函数添加短路能力。关闭 [#52098](https://github.com/ClickHouse/ClickHouse/issues/52098)。 [#57767](https://github.com/ClickHouse/ClickHouse/pull/57767) ([jsc0218](https://github.com/jsc0218)).
* 允许在外部表结构中声明枚举。 [#57857](https://github.com/ClickHouse/ClickHouse/pull/57857) ([Duc Canh Le](https://github.com/canhld94)).
* 在具有 `DEFAULT` 或 `MATERIALIZED` 表达式的列上运行 `ALTER COLUMN MATERIALIZE` 现在会写入正确的值：对于具有默认值的现有部分的默认值，或对于具有非默认值的现有部分的非默认值。以前，所有现有部分都写入了默认值。 [#58023](https://github.com/ClickHouse/ClickHouse/pull/58023) ([Duc Canh Le](https://github.com/canhld94)).
* 启用了退避逻辑（例如，指数退避）。将提供降低 CPU 使用率、内存使用率和日志文件大小的能力。 [#58036](https://github.com/ClickHouse/ClickHouse/pull/58036) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 在选择合并的部分时考虑轻量级删除的行。 [#58223](https://github.com/ClickHouse/ClickHouse/pull/58223) ([Zhuo Qiu](https://github.com/jewelzqiu)).
* 允许在 `storage_configuration` 中定义 `volume_priority`。 [#58533](https://github.com/ClickHouse/ClickHouse/pull/58533) ([Andrey Zvonov](https://github.com/zvonand)).
* 在 T64 编解码器中添加对 Date32 类型的支持。 [#58738](https://github.com/ClickHouse/ClickHouse/pull/58738) ([Hongbin Ma](https://github.com/binmahone)).
* 本 PR 使 HTTP/HTTPS 连接在所有使用情况下均可重用。即使响应为 3xx 或 4xx。 [#58845](https://github.com/ClickHouse/ClickHouse/pull/58845) ([Sema Checherinda](https://github.com/CheSema)).
* 为更多系统表的列添加了注释。延续 https://github.com/ClickHouse/ClickHouse/pull/58356。 [#59016](https://github.com/ClickHouse/ClickHouse/pull/59016) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 现在可以在 `PREWHERE` 中使用虚拟列。这在像 `_part_offset` 这样的非常量虚拟列中是值得的。 [#59033](https://github.com/ClickHouse/ClickHouse/pull/59033) ([Amos Bird](https://github.com/amosbird)).
* 分布式表引擎的设置现在可以在服务器配置文件中指定（类似于 MergeTree 设置），例如 ``` <distributed> <flush_on_detach>false</flush_on_detach> </distributed> ```。 [#59291](https://github.com/ClickHouse/ClickHouse/pull/59291) ([Azat Khuzhin](https://github.com/azat)).
* Keeper 改进：仅缓存一定数量的日志在内存中，由 `latest_logs_cache_size_threshold` 和 `commit_logs_cache_size_threshold` 控制。 [#59460](https://github.com/ClickHouse/ClickHouse/pull/59460) ([Antonio Andelic](https://github.com/antonio2368)).
* 现在不再使用常量密钥，而是对象存储生成密钥以确定移除对象的能力。 [#59495](https://github.com/ClickHouse/ClickHouse/pull/59495) ([Sema Checherinda](https://github.com/CheSema)).
* 默认情况下不推断以指数形式表示的浮点数。添加设置 `input_format_try_infer_exponent_floats`，将恢复以前的行为（默认情况下禁用）。关闭 [#59476](https://github.com/ClickHouse/ClickHouse/issues/59476)。 [#59500](https://github.com/ClickHouse/ClickHouse/pull/59500) ([Kruglov Pavel](https://github.com/Avogar)).
* 允许通过括号围绕变更操作。括号的发射可以通过配置 `format_alter_operations_with_parentheses` 控制。默认情况下，在格式化查询中，括号会被发射，因为我们将格式化的变更操作在某些地方存储为元数据（例如：变更）。新的语法澄清了某些变更操作以列表结束的查询。例如： `ALTER TABLE x MODIFY TTL date GROUP BY a, b, DROP COLUMN c` 以前的语法无法正确解析。在新语法中，查询 `ALTER TABLE x (MODIFY TTL date GROUP BY a, b), (DROP COLUMN c)` 是显而易见的。旧版本无法读取新语法，因此在单个集群中混合使用新旧版本的 ClickHouse 可能会导致问题。 [#59532](https://github.com/ClickHouse/ClickHouse/pull/59532) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 将 Intel QPL（由编解码器 `DEFLATE_QPL` 使用）从 v1.3.1 升级到 v1.4.0。同时修复了轮询超时机制中的一个错误，观察到在某些情况下超时不会正常工作，如果发生超时，IAA 和 CPU 可能会并发处理缓冲区。目前，我们要确保 IAA 编解码器状态不是 QPL_STS_BEING_PROCESSED，然后回退到 SW 编解码器。 [#59551](https://github.com/ClickHouse/ClickHouse/pull/59551) ([jasperzhu](https://github.com/jinjunzh)).
* 在 libhdfs3 中添加位置预读。如果您想在 libhdfs3 中调用位置读取，请使用 hdfs.h 中的 `hdfsPread` 函数，如下所示。 `tSize hdfsPread(hdfsFS fs, hdfsFile file, void * buffer, tSize length, tOffset position);`。 [#59624](https://github.com/ClickHouse/ClickHouse/pull/59624) ([M1eyu](https://github.com/M1eyu2018)).
* 检查解析器中的堆栈溢出，即使用户将 `max_parser_depth` 设置配置为非常高的值。这关闭了 [#59622](https://github.com/ClickHouse/ClickHouse/issues/59622)。 [#59697](https://github.com/ClickHouse/ClickHouse/pull/59697) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 统一 Kafka 存储中的 XML 和 SQL 创建的命名集合行为。 [#59710](https://github.com/ClickHouse/ClickHouse/pull/59710) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 如果 CREATE TABLE 明确具有 UUID，允许在 replica_path 中使用 UUID。 [#59908](https://github.com/ClickHouse/ClickHouse/pull/59908) ([Azat Khuzhin](https://github.com/azat)).
* 在 `system.tables` 系统表中添加 `ReplicatedMergeTree` 表的列 `metadata_version`。 [#59942](https://github.com/ClickHouse/ClickHouse/pull/59942) ([Maksim Kita](https://github.com/kitaisreal)).
* Keeper 改进：对与 Disk 相关的操作的失败添加重试。 [#59980](https://github.com/ClickHouse/ClickHouse/pull/59980) ([Antonio Andelic](https://github.com/antonio2368)).
* 添加新的配置设置 `backups.remove_backup_files_after_failure`：``` <clickhouse> <backups> <remove_backup_files_after_failure>true</remove_backup_files_after_failure> </backups> </clickhouse> ```。 [#60002](https://github.com/ClickHouse/ClickHouse/pull/60002) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在执行 RESTORE 命令时，用多个线程读取来自备份的表的元数据。 [#60040](https://github.com/ClickHouse/ClickHouse/pull/60040) ([Vitaly Baranov](https://github.com/vitlibar)).
* 现在，如果 `StorageBuffer` 具有多个分片（`num_layers` > 1），后台刷新将在多个线程中同时发生。 [#60111](https://github.com/ClickHouse/ClickHouse/pull/60111) ([alesapin](https://github.com/alesapin)).
* 支持在配置中使用 `user` 键为特定 S3 设置指定用户。 [#60144](https://github.com/ClickHouse/ClickHouse/pull/60144) ([Antonio Andelic](https://github.com/antonio2368)).
* 复制 S3 文件的 GCP 回退到缓冲区复制，以防 GCP 返回 `Internal Error` 伴随 `GATEWAY_TIMEOUT` HTTP 错误代码。 [#60164](https://github.com/ClickHouse/ClickHouse/pull/60164) ([Maksim Kita](https://github.com/kitaisreal)).
* 允许将 "local" 作为对象存储类型，而不是 "local_blob_storage"。 [#60165](https://github.com/ClickHouse/ClickHouse/pull/60165) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 实现 Variant 值的比较运算符和将 Field 正确插入 Variant 列。不允许默认情况下使用具有相似变体类型创建 `Variant` 类型（在设置 `allow_suspicious_variant_types` 下允许）。关闭 [#59996](https://github.com/ClickHouse/ClickHouse/issues/59996)。关闭 [#59850](https://github.com/ClickHouse/ClickHouse/issues/59850)。 [#60198](https://github.com/ClickHouse/ClickHouse/pull/60198) ([Kruglov Pavel](https://github.com/Avogar)).
* 改进虚拟列的整体可用性。现在允许在 `PREWHERE` 中使用虚拟列（这在像 `_part_offset` 这样的非常量虚拟列中是值得的）。现在可用的内置文档作为 `DESCRIBE` 查询中列的注释，可通过启用设置 `describe_include_virtual_columns` 获得。 [#60205](https://github.com/ClickHouse/ClickHouse/pull/60205) ([Anton Popov](https://github.com/CurtizJ)).
* `ULIDStringToDateTime` 的短路执行。 [#60211](https://github.com/ClickHouse/ClickHouse/pull/60211) ([Juan Madurga](https://github.com/jlmadurga)).
* 为表 `system.backups` 和 `system.backup_log` 添加了 `query_id` 列。为 `error` 列添加了错误堆栈跟踪。 [#60220](https://github.com/ClickHouse/ClickHouse/pull/60220) ([Maksim Kita](https://github.com/kitaisreal)).
* 在 `DETACH`/服务器关闭和 `SYSTEM FLUSH DISTRIBUTED` 时，并行刷新分布式引擎的待处理 INSERT 块（并行将仅在您为表设置了多磁盘策略时工作（就像目前在分布式引擎中一样））。 [#60225](https://github.com/ClickHouse/ClickHouse/pull/60225) ([Azat Khuzhin](https://github.com/azat)).
* 在 `joinRightColumnsSwitchNullability` 中选择的设置不正确，解决了 [#59625](https://github.com/ClickHouse/ClickHouse/issues/59625)。 [#60259](https://github.com/ClickHouse/ClickHouse/pull/60259) ([lgbo](https://github.com/lgbo-ustc)).
* 添加一个设置以强制对合并进行读取缓存。 [#60308](https://github.com/ClickHouse/ClickHouse/pull/60308) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 问题 [#57598](https://github.com/ClickHouse/ClickHouse/issues/57598) 提到了与事务处理相关的变体行为。未处于活动状态时发出的 COMMIT/ROLLBACK 被报告为错误，与 MySQL 行为相反。 [#60338](https://github.com/ClickHouse/ClickHouse/pull/60338) ([PapaToemmsn](https://github.com/PapaToemmsn)).
* 为 `distributed_ddl_output_mode` 设置添加 `none_only_active` 模式。 [#60340](https://github.com/ClickHouse/ClickHouse/pull/60340) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 通过 MySQL 端口的连接现在自动使用设置 `prefer_column_name_to_alias = 1` 运行，以支持 QuickSight 开箱即用。同时，设置 `mysql_map_string_to_text_in_show_columns` 和 `mysql_map_fixed_string_to_text_in_show_columns` 现在默认启用，也仅影响 MySQL 连接。这增加了与更多 BI 工具的兼容性。 [#60365](https://github.com/ClickHouse/ClickHouse/pull/60365) ([Robert Schulze](https://github.com/rschu1ze)).
* 当输出格式为 Pretty 格式并且块由超过一百万的单一数值组成时，右边将打印出可读数字。 例如 ``` ┌──────count()─┐ │ 233765663884 │ -- 233.77 billion └──────────────┘ ```. [#60379](https://github.com/ClickHouse/ClickHouse/pull/60379) ([rogeryk](https://github.com/rogeryk)).
* 允许为 clickhouse-server 配置 HTTP 重定向处理程序。例如，您可以使 `/` 重定向到 Play UI。 [#60390](https://github.com/ClickHouse/ClickHouse/pull/60390) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 高级仪表板在多行图形方面有稍微更好的颜色。 [#60391](https://github.com/ClickHouse/ClickHouse/pull/60391) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 JavaScript 代码中的竞争条件，导致重复的图表重叠在一起。 [#60392](https://github.com/ClickHouse/ClickHouse/pull/60392) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 即使用户将 `max_parser_depth` 设置配置为非常高的值，也要检查解析器中的堆栈溢出。这关闭了 [#59622](https://github.com/ClickHouse/ClickHouse/issues/59622)。 [#60434](https://github.com/ClickHouse/ClickHouse/pull/60434) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 函数 `substring` 现在有了一个新的别名 `byteSlice`。 [#60494](https://github.com/ClickHouse/ClickHouse/pull/60494) ([Robert Schulze](https://github.com/rschu1ze)).
* 将服务器设置 `dns_cache_max_size` 重命名为 `dns_cache_max_entries` 以减少歧义。 [#60500](https://github.com/ClickHouse/ClickHouse/pull/60500) ([Kirill Nikiforov](https://github.com/allmazz)).
* `SHOW INDEX | INDEXES | INDICES | KEYS` 不再按主键列排序（这原本不直观）。 [#60514](https://github.com/ClickHouse/ClickHouse/pull/60514) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeper 改进：如果检测到无效快照则启动时中止以避免数据丢失。 [#60537](https://github.com/ClickHouse/ClickHouse/pull/60537) ([Antonio Andelic](https://github.com/antonio2368)).
* 添加 MergeTree 读取拆分范围以进行交叉和非交叉故障注入，使用 `merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_fault_probability` 设置。 [#60548](https://github.com/ClickHouse/ClickHouse/pull/60548) ([Maksim Kita](https://github.com/kitaisreal)).
* 高级仪表板现在在滚动时始终显示控件。这使您无需向上滚动即可添加新图表。 [#60692](https://github.com/ClickHouse/ClickHouse/pull/60692) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 字符串类型和枚举可以在相同的上下文中使用，例如：数组、UNION 查询、条件表达式。这关闭了 [#60726](https://github.com/ClickHouse/ClickHouse/issues/60726)。 [#60727](https://github.com/ClickHouse/ClickHouse/pull/60727) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 更新 tzdata 到 2024a。 [#60768](https://github.com/ClickHouse/ClickHouse/pull/60768) ([Raúl Marín](https://github.com/Algunenano)).
* 支持在文件系统数据库中使用没有格式扩展名的文件。 [#60795](https://github.com/ClickHouse/ClickHouse/pull/60795) ([Kruglov Pavel](https://github.com/Avogar)).
* Keeper 改进：在 Keeper 设置中支持 `leadership_expiry_ms`。 [#60806](https://github.com/ClickHouse/ClickHouse/pull/60806) ([Brokenice0415](https://github.com/Brokenice0415)).
* 无论设置 `input_format_try_infer_exponent_floats` 如何，都始终在 JSON 格式中推断指数数字。添加设置 `input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects`，允许在从 JSON 对象推断命名元组时使用字符串类型用于模糊路径，而不是抛出异常。 [#60808](https://github.com/ClickHouse/ClickHouse/pull/60808) ([Kruglov Pavel](https://github.com/Avogar)).
* 为 SMJ 添加一个标志以将 null 视为最大/最小值。因此，该行为可以与其他 SQL 系统兼容，如 Apache Spark。 [#60896](https://github.com/ClickHouse/ClickHouse/pull/60896) ([loudongfeng](https://github.com/loudongfeng)).
* ClickHouse 版本已添加到 Docker 标签。关闭 [#54224](https://github.com/ClickHouse/ClickHouse/issues/54224)。 [#60949](https://github.com/ClickHouse/ClickHouse/pull/60949) ([Nikolay Monkov](https://github.com/nikmonkov)).
* 添加设置 `parallel_replicas_allow_in_with_subquery = 1`，允许与并行副本一起使用的 IN 子查询。 [#60950](https://github.com/ClickHouse/ClickHouse/pull/60950) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* DNSResolver 随机化解析的 IP 地址集合。 [#60965](https://github.com/ClickHouse/ClickHouse/pull/60965) ([Sema Checherinda](https://github.com/CheSema)).
* 支持在 `clickhouse-client` 和 `clickhouse-local` 中通过文件扩展名检测输出格式。 [#61036](https://github.com/ClickHouse/ClickHouse/pull/61036) ([豪肥肥](https://github.com/HowePa)).
* 定期检查内存限制更新。 [#61049](https://github.com/ClickHouse/ClickHouse/pull/61049) ([Han Fei](https://github.com/hanfei1991)).
* 默认情况下启用处理器的性能分析（用于排序、聚合等的时间消耗/输入和输出字节）。 [#61096](https://github.com/ClickHouse/ClickHouse/pull/61096) ([Azat Khuzhin](https://github.com/azat)).
* 添加 `toUInt128OrZero` 函数，它是由于错误而漏掉的（该错误与 https://github.com/ClickHouse/ClickHouse/pull/945 相关）。兼容别名 `FROM_UNIXTIME` 和 `DATE_FORMAT`（它们不是 ClickHouse 原生的，仅用于 MySQL 兼容性）已被设置为不区分大小写，如 SQL 兼容性别名所预期。 [#61114](https://github.com/ClickHouse/ClickHouse/pull/61114) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 对访问检查的改进，允许在目标用户没有撤销授权的情况下撤销未拥有的权限。例如： ```sql GRANT SELECT ON *.* TO user1; REVOKE SELECT ON system.* FROM user1;```。[#61115](https://github.com/ClickHouse/ClickHouse/pull/61115) ([pufit](https://github.com/pufit)).
* 修复先前优化中的错误：https://github.com/ClickHouse/ClickHouse/pull/59698：移除 break，以确保第一个过滤的列具有最小大小 cc @jsc0218。 [#61145](https://github.com/ClickHouse/ClickHouse/pull/61145) ([李扬](https://github.com/taiyang-li)).
* 修复 `has()` 函数与 `Nullable` 列的问题（修复 [#60214](https://github.com/ClickHouse/ClickHouse/issues/60214)）。 [#61249](https://github.com/ClickHouse/ClickHouse/pull/61249) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 现在可以在配置替换的子树中指定属性 `merge="true"`， `<include from_zk="/path" merge="true">`。如果指定了此属性，ClickHouse 将与现有配置合并子树，否则默认行为是将新内容附加到配置中。 [#61299](https://github.com/ClickHouse/ClickHouse/pull/61299) ([alesapin](https://github.com/alesapin)).
* 添加虚拟内存映射的异步指标：VMMaxMapCount & VMNumMaps。关闭 [#60662](https://github.com/ClickHouse/ClickHouse/issues/60662)。 [#61354](https://github.com/ClickHouse/ClickHouse/pull/61354) ([Tuan Pham Anh](https://github.com/tuanpavn)).
* 在创建临时数据的所有地方使用 `temporary_files_codec` 设置，例如外部内存排序和外部内存 GROUP BY。之前仅在 `partial_merge` JOIN 算法中工作。 [#61456](https://github.com/ClickHouse/ClickHouse/pull/61456) ([Maksim Kita](https://github.com/kitaisreal)).
* 移除重复检查 `containing_part.empty()`，此检查已在这里进行： https://github.com/ClickHouse/ClickHouse/blob/1296dac3c7e47670872c15e3f5e58f869e0bd2f2/src/Storages/MergeTree/MergeTreeData.cpp#L6141。 [#61467](https://github.com/ClickHouse/ClickHouse/pull/61467) ([William Schoeffel](https://github.com/wiledusc)).
* 添加新的设置 `max_parser_backtracks`，允许限制查询解析的复杂性。 [#61502](https://github.com/ClickHouse/ClickHouse/pull/61502) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在文件系统缓存的动态调整期间减少争用。 [#61524](https://github.com/ClickHouse/ClickHouse/pull/61524) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 禁止 StorageS3 队列的分片模式，因为它将被重写。 [#61537](https://github.com/ClickHouse/ClickHouse/pull/61537) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复拼写错误：从 `use_leagcy_max_level` 更改为 `use_legacy_max_level`。 [#61545](https://github.com/ClickHouse/ClickHouse/pull/61545) ([William Schoeffel](https://github.com/wiledusc)).
* 移除 blob_storage_log 中的一些重复条目。 [#61622](https://github.com/ClickHouse/ClickHouse/pull/61622) ([YenchangChan](https://github.com/YenchangChan)).
* 添加 `current_user` 函数作为 MySQL 的兼容别名。  [#61770](https://github.com/ClickHouse/ClickHouse/pull/61770) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 在使用 Azure Blob Storage 时，对于备份 IO 使用受管身份。添加设置以防止 ClickHouse 尝试创建不存在的容器，这需要在存储帐户层面上的权限。 [#61785](https://github.com/ClickHouse/ClickHouse/pull/61785) ([Daniel Pozo Escalona](https://github.com/danipozo)).
* 在先前版本中，以 Pretty 格式显示的一些数字不够美观。 [#61794](https://github.com/ClickHouse/ClickHouse/pull/61794) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 Pretty 格式中，如果这是结果集中的唯一值，则不会截断长值，例如在 `SHOW CREATE TABLE` 查询的结果中。 [#61795](https://github.com/ClickHouse/ClickHouse/pull/61795) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 与 `clickhouse-local` 类似，`clickhouse-client` 将接受 `--output-format` 选项作为 `--format` 选项的同义词。这关闭了 [#59848](https://github.com/ClickHouse/ClickHouse/issues/59848)。 [#61797](https://github.com/ClickHouse/ClickHouse/pull/61797) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 如果 stdout 是终端并且未指定输出格式，`clickhouse-client` 和类似工具将默认使用 `PrettyCompact`，类似于交互模式。`clickhouse-client` 和 `clickhouse-local` 将以统一的方式处理输入和输出格式的命令行参数。这关闭了 [#61272](https://github.com/ClickHouse/ClickHouse/issues/61272)。 [#61800](https://github.com/ClickHouse/ClickHouse/pull/61800) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 Pretty 格式中使用下划线数字组以提高可读性。这可通过新设置 `output_format_pretty_highlight_digit_groups` 控制。 [#61802](https://github.com/ClickHouse/ClickHouse/pull/61802) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
```
#### Bug Fix (用户可见的官方稳定版本中的错误行为) {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* 修复 `intDiv` 对于 decimal 参数的错误 [#59243](https://github.com/ClickHouse/ClickHouse/pull/59243) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复由 wingfuzz 发现的 kql 问题 [#59626](https://github.com/ClickHouse/ClickHouse/pull/59626) ([Yong Wang](https://github.com/kashwy)).
* 修复 AsynchronousBoundedReadBuffer 的 "Read beyond last offset" 错误 [#59630](https://github.com/ClickHouse/ClickHouse/pull/59630) ([Vitaly Baranov](https://github.com/vitlibar)).
* rabbitmq: 修复既没有 acked 也没有 nacked 消息的情况 [#59775](https://github.com/ClickHouse/ClickHouse/pull/59775) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 analyzer 中对 const 和 LowCardinality 使用 GROUP BY const 的函数执行 [#59986](https://github.com/ClickHouse/ClickHouse/pull/59986) ([Azat Khuzhin](https://github.com/azat)).
* 修复 DateTime64 的缩放转换 [#60004](https://github.com/ClickHouse/ClickHouse/pull/60004) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复使用单引号插入 SQLite （通过用引号而不是反斜杠转义单引号） [#60015](https://github.com/ClickHouse/ClickHouse/pull/60015) ([Azat Khuzhin](https://github.com/azat)).
* 修复 optimize_uniq_to_count 移除列别名的问题 [#60026](https://github.com/ClickHouse/ClickHouse/pull/60026) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 MergeTree 的 finished_mutations_to_keep=0 （如文档所述，0 应该保留所有内容） [#60031](https://github.com/ClickHouse/ClickHouse/pull/60031) ([Azat Khuzhin](https://github.com/azat)).
* 修复 drop 时 s3queue 表可能出现的异常 [#60036](https://github.com/ClickHouse/ClickHouse/pull/60036) ([Kseniia Sumarokova](https://github.com/kssenii)).
* PartsSplitter 对同一部分的无效范围 [#60041](https://github.com/ClickHouse/ClickHouse/pull/60041) ([Maksim Kita](https://github.com/kitaisreal)).
* 在 DDLLogEntry 中使用来自上下文的 max_query_size 而不是硬编码的 4096 [#60083](https://github.com/ClickHouse/ClickHouse/pull/60083) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复查询格式不一致的问题 [#60095](https://github.com/ClickHouse/ClickHouse/pull/60095) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复子查询中 explain 格式不一致的问题 [#60102](https://github.com/ClickHouse/ClickHouse/pull/60102) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 Nullable 中的 cosineDistance 崩溃 [#60150](https://github.com/ClickHouse/ClickHouse/pull/60150) ([Raúl Marín](https://github.com/Algunenano)).
* 允许将字符串表示中的布尔值转换为真实的布尔值 [#60160](https://github.com/ClickHouse/ClickHouse/pull/60160) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复 system.s3queue_log [#60166](https://github.com/ClickHouse/ClickHouse/pull/60166) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复具有可空聚合函数名称的 arrayReduce [#60188](https://github.com/ClickHouse/ClickHouse/pull/60188) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在初步过滤（PK, 分区修剪）期间的操作执行 [#60196](https://github.com/ClickHouse/ClickHouse/pull/60196) ([Azat Khuzhin](https://github.com/azat)).
* 隐藏 s3queue 的敏感信息 [#60233](https://github.com/ClickHouse/ClickHouse/pull/60233) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 还原 "将 `ORDER BY ALL` 替换为 `ORDER BY *`" 的更改 [#60248](https://github.com/ClickHouse/ClickHouse/pull/60248) ([Robert Schulze](https://github.com/rschu1ze)).
* Azure Blob Storage : 修复 endpoint 和 prefix 的问题 [#60251](https://github.com/ClickHouse/ClickHouse/pull/60251) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni)).
* 修复 http 异常代码。 [#60252](https://github.com/ClickHouse/ClickHouse/pull/60252) ([Austin Kothig](https://github.com/kothiga)).
* 修复 LRUResource Cache bug (Hive 缓存) [#60262](https://github.com/ClickHouse/ClickHouse/pull/60262) ([shanfengp](https://github.com/Aed-p)).
* s3queue: 修复 bug (同时修复 flaky test_storage_s3_queue/test.py::test_shards_distributed) [#60282](https://github.com/ClickHouse/ClickHouse/pull/60282) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在哈希函数中使用 IPv6 的未初始化值和无效结果 [#60359](https://github.com/ClickHouse/ClickHouse/pull/60359) ([Kruglov Pavel](https://github.com/Avogar)).
* 如果平行副本发生更改，则强制重新分析 [#60362](https://github.com/ClickHouse/ClickHouse/pull/60362) ([Raúl Marín](https://github.com/Algunenano)).
* 修复新磁盘配置选项下的普通元数据类型的使用 [#60396](https://github.com/ClickHouse/ClickHouse/pull/60396) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 不允许将 max_parallel_replicas 设置为 0，因为这没有意义 [#60430](https://github.com/ClickHouse/ClickHouse/pull/60430) ([Kruglov Pavel](https://github.com/Avogar)).
* 尝试修复 mapContainsKeyLike 中的逻辑错误 'Cannot capture column because it has incompatible type' [#60451](https://github.com/ClickHouse/ClickHouse/pull/60451) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复 OptimizeDateOrDateTimeConverterWithPreimageVisitor 中的空参数 [#60453](https://github.com/ClickHouse/ClickHouse/pull/60453) ([Raúl Marín](https://github.com/Algunenano)).
* 尝试避免在创建表时计算标量子查询。 [#60464](https://github.com/ClickHouse/ClickHouse/pull/60464) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 合并 [#59674](https://github.com/ClickHouse/ClickHouse/issues/59674). [#60470](https://github.com/ClickHouse/ClickHouse/pull/60470) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 正确检查 s3Cluster 中的键 [#60477](https://github.com/ClickHouse/ClickHouse/pull/60477) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在并行解析时大量行由于错误而被跳过时的死锁 [#60516](https://github.com/ClickHouse/ClickHouse/pull/60516) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复 KQL 复合操作符的 max_query_size: [#60534](https://github.com/ClickHouse/ClickHouse/pull/60534) ([Yong Wang](https://github.com/kashwy)).
* Keeper 修复：在等待提交日志时添加超时 [#60544](https://github.com/ClickHouse/ClickHouse/pull/60544) ([Antonio Andelic](https://github.com/antonio2368)).
* 减少从 `system.numbers` 读取的行数 [#60546](https://github.com/ClickHouse/ClickHouse/pull/60546) ([JackyWoo](https://github.com/JackyWoo)).
* 不要为日期类型输出数字提示 [#60577](https://github.com/ClickHouse/ClickHouse/pull/60577) ([Raúl Marín](https://github.com/Algunenano)).
* 修复使用非确定性函数的 MergeTree 读取筛选 [#60586](https://github.com/ClickHouse/ClickHouse/pull/60586) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复对不良兼容性设置值类型的逻辑错误 [#60596](https://github.com/ClickHouse/ClickHouse/pull/60596) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复在混合 x86-64 / ARM 集群中聚合函数状态不一致的问题 [#60610](https://github.com/ClickHouse/ClickHouse/pull/60610) ([Harry Lee](https://github.com/HarryLeeIBM)).
* 修复 (prql): 强健的恐慌处理程序 [#60615](https://github.com/ClickHouse/ClickHouse/pull/60615) ([Maximilian Roos](https://github.com/max-sixty)).
* 修复 `intDiv` 对于 decimal 和日期参数的错误 [#60672](https://github.com/ClickHouse/ClickHouse/pull/60672) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复：在 ALTER MODIFY 查询中扩展 CTE [#60682](https://github.com/ClickHouse/ClickHouse/pull/60682) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复非 Atomic/Ordinary 数据库引擎（即 Memory）下的 system.parts [#60689](https://github.com/ClickHouse/ClickHouse/pull/60689) ([Azat Khuzhin](https://github.com/azat)).
* 修复参数化视图的 "Invalid storage definition in metadata file" [#60708](https://github.com/ClickHouse/ClickHouse/pull/60708) ([Azat Khuzhin](https://github.com/azat)).
* 修复 CompressionCodecMultiple 中的缓冲区溢出 [#60731](https://github.com/ClickHouse/ClickHouse/pull/60731) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 移除 SQL/JSON 中的无意义内容 [#60738](https://github.com/ClickHouse/ClickHouse/pull/60738) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复聚合函数 quantileGK 中的错误消毒检查 [#60740](https://github.com/ClickHouse/ClickHouse/pull/60740) ([李扬](https://github.com/taiyang-li)).
* 通过将 streams 设置为 1 修复 insert-select + insert_deduplication_token 错误 [#60745](https://github.com/ClickHouse/ClickHouse/pull/60745) ([Jordi Villar](https://github.com/jrdi)).
* 防止在不支持的分块上传操作上设置自定义元数据头 [#60748](https://github.com/ClickHouse/ClickHouse/pull/60748) ([Francisco J. Jurado Moreno](https://github.com/Beetelbrox)).
* 修复 toStartOfInterval [#60763](https://github.com/ClickHouse/ClickHouse/pull/60763) ([Andrey Zvonov](https://github.com/zvonand)).
* 修复 arrayEnumerateRanked 中的崩溃 [#60764](https://github.com/ClickHouse/ClickHouse/pull/60764) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 INSERT SELECT JOIN 中使用 input() 的崩溃 [#60765](https://github.com/ClickHouse/ClickHouse/pull/60765) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复在子查询中使用不同的 allow_experimental_analyzer 值造成的崩溃 [#60770](https://github.com/ClickHouse/ClickHouse/pull/60770) ([Dmitry Novik](https://github.com/novikd)).
* 在从 S3 读取时移除递归 [#60849](https://github.com/ClickHouse/ClickHouse/pull/60849) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 HashedDictionaryParallelLoader 中的错误可能导致卡住 [#60926](https://github.com/ClickHouse/ClickHouse/pull/60926) ([vdimir](https://github.com/vdimir)).
* 修复与复制数据库的异步 RESTORE [#60934](https://github.com/ClickHouse/ClickHouse/pull/60934) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复通过原生协议向 `Log` 表异步插入时的死锁 [#61055](https://github.com/ClickHouse/ClickHouse/pull/61055) ([Anton Popov](https://github.com/CurtizJ)).
* 修复 RangeHashedDictionary 中 dictGetOrDefault 默认参数的惰性执行 [#61196](https://github.com/ClickHouse/ClickHouse/pull/61196) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复 groupArraySorted 中的多个错误 [#61203](https://github.com/ClickHouse/ClickHouse/pull/61203) ([Raúl Marín](https://github.com/Algunenano)).
* 修复独立二进制的 Keeper 重新配置 [#61233](https://github.com/ClickHouse/ClickHouse/pull/61233) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 S3 引擎中 session_token 的使用 [#61234](https://github.com/ClickHouse/ClickHouse/pull/61234) ([Kruglov Pavel](https://github.com/Avogar)).
* 修复聚合函数 `uniqExact` 可能导致的错误结果 [#61257](https://github.com/ClickHouse/ClickHouse/pull/61257) ([Anton Popov](https://github.com/CurtizJ)).
* 修复 show database 中的错误 [#61269](https://github.com/ClickHouse/ClickHouse/pull/61269) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 RabbitMQ 存储中具有 MATERIALIZED 列的逻辑错误 [#61320](https://github.com/ClickHouse/ClickHouse/pull/61320) ([vdimir](https://github.com/vdimir)).
* 修复 CREATE OR REPLACE DICTIONARY [#61356](https://github.com/ClickHouse/ClickHouse/pull/61356) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复带有外部 ON CLUSTER 的 ATTACH 查询 [#61365](https://github.com/ClickHouse/ClickHouse/pull/61365) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复 actions dag 分割的问题 [#61458](https://github.com/ClickHouse/ClickHouse/pull/61458) ([Raúl Marín](https://github.com/Algunenano)).
* 修复完成失败的 RESTORE [#61466](https://github.com/ClickHouse/ClickHouse/pull/61466) ([Vitaly Baranov](https://github.com/vitlibar)).
* 正确地使用兼容性设置禁用 async_insert_use_adaptive_busy_timeout [#61468](https://github.com/ClickHouse/ClickHouse/pull/61468) ([Raúl Marín](https://github.com/Algunenano)).
* 允许在恢复池中排队 [#61475](https://github.com/ClickHouse/ClickHouse/pull/61475) ([Nikita Taranov](https://github.com/nickitat)).
* 修复读取 system.parts 使用 UUID 时的问题（问题 61220）。 [#61479](https://github.com/ClickHouse/ClickHouse/pull/61479) ([Dan Wu](https://github.com/wudanzy)).
* 修复窗口视图中的崩溃 [#61526](https://github.com/ClickHouse/ClickHouse/pull/61526) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `repeat` 对于非原生整数的处理 [#61527](https://github.com/ClickHouse/ClickHouse/pull/61527) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复客户端的 `-s` 参数 [#61530](https://github.com/ClickHouse/ClickHouse/pull/61530) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 修复 arrayPartialReverseSort 中的崩溃 [#61539](https://github.com/ClickHouse/ClickHouse/pull/61539) ([Raúl Marín](https://github.com/Algunenano)).
* 修复使用 const 位置进行字符串搜索 [#61547](https://github.com/ClickHouse/ClickHouse/pull/61547) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在使用 datetime64 时 addDays 造成的错误 [#61561](https://github.com/ClickHouse/ClickHouse/pull/61561) ([Shuai li](https://github.com/loneylee)).
* 修复带去重的异步插入的 `system.part_log` [#61620](https://github.com/ClickHouse/ClickHouse/pull/61620) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 system.parts 的 Non-ready set。 [#61666](https://github.com/ClickHouse/ClickHouse/pull/61666) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
