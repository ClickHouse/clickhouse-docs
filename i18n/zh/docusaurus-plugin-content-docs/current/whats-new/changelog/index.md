---
description: "2025 年变更日志"
note: "此文件通过 yarn build 生成"
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: "2025"
title: "2025 年变更日志"
doc_type: "changelog"
---

### 目录

**[ClickHouse 版本 v25.10，2025-10-30](#2510)**<br/>
**[ClickHouse 版本 v25.9，2025-09-25](#259)**<br/>
**[ClickHouse 版本 v25.8 LTS，2025-08-28](#258)**<br/>
**[ClickHouse 版本 v25.7，2025-07-24](#257)**<br/>
**[ClickHouse 版本 v25.6，2025-06-26](#256)**<br/>
**[ClickHouse 版本 v25.5，2025-05-22](#255)**<br/>
**[ClickHouse 版本 v25.4，2025-04-22](#254)**<br/>
**[ClickHouse 版本 v25.3 LTS，2025-03-20](#253)**<br/>
**[ClickHouse 版本 v25.2，2025-02-27](#252)**<br/>
**[ClickHouse 版本 v25.1，2025-01-28](#251)**<br/>
**[2024 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017 年变更日志](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouse 版本 25.10，2025-10-31 {#2510}


#### 向后不兼容的变更

* 更改了默认的 `schema_inference_make_columns_nullable` 设置，现在会根据 Parquet/ORC/Arrow 元数据中的列 `Nullable` 信息来确定列是否可为空，而不是将所有列一律设为 Nullable。文本格式不受影响。[#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321))。
* 查询结果缓存将忽略 `log_comment` 设置，因此仅在查询中更改 `log_comment` 将不再强制导致缓存未命中。存在一种小概率情况，即用户有意通过更改 `log_comment` 来对其缓存进行分段。此变更会改变该行为，因此与先前版本不兼容。如需实现该目的，请使用 `query_cache_tag` 设置。[#79878](https://github.com/ClickHouse/ClickHouse/pull/79878) ([filimonov](https://github.com/filimonov))。
* 在先前的版本中，包含与运算符实现函数同名的表函数的查询，其格式化结果并不一致。修复了 [#81601](https://github.com/ClickHouse/ClickHouse/issues/81601)。修复了 [#81977](https://github.com/ClickHouse/ClickHouse/issues/81977)。修复了 [#82834](https://github.com/ClickHouse/ClickHouse/issues/82834)。修复了 [#82835](https://github.com/ClickHouse/ClickHouse/issues/82835)。EXPLAIN SYNTAX 查询将不再总是对运算符进行格式化——新的行为更好地体现了说明语法本身这一目的。`clickhouse-format`、`formatQuery` 以及类似工具在查询中以函数形式包含这些函数时，将不会再把它们格式化为运算符。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止在 `JOIN` 键中使用 `Dynamic` 类型。当 `Dynamic` 类型的值与非 `Dynamic` 类型的值进行比较时，可能会产生意外结果。建议将 `Dynamic` 列转换为所需类型。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` 服务器选项默认开启，目前无法关闭。这是一次向后兼容的更改，仅供注意。此更改仅与 25.x 版本具有前向兼容性。这意味着如果需要回滚新版本，只能降级到任意 25.x 版本。[#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema)).
* 当插入速率较低时，将 `replicated_deduplication_window_seconds` 从一周降低到一小时，以减少在 ZooKeeper 中存储的 znode 数量。[#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema))。
* 将设置 `query_plan_use_new_logical_join_step` 重命名为 `query_plan_use_logical_join_step`。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 新的语法使文本索引的 tokenizer 参数更具表现力。[#87997](https://github.com/ClickHouse/ClickHouse/pull/87997)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 将函数 `searchAny` 和 `searchAll` 分别重命名为 `hasAnyTokens` 和 `hasAllTokens`，使其与现有函数 `hasToken` 的命名更加一致。 [#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze)).
* 从文件系统缓存中移除 `cache_hits_threshold`。该功能最初是在我们还没有 SLRU 缓存策略时由一位外部贡献者添加的，而现在我们已经有了 SLRU，同时支持这两者已无必要。[#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 对 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert` 设置的工作方式做了两项小改动：- 使用未预留（unreserved）而不是可用（available）字节来决定是否应拒绝一次插入。如果后台合并和变更所预留的空间与配置阈值相比很小，这可能并不关键，但看起来更为合理。- 不再将这些设置应用于 system 表。原因是我们仍然希望类似 `query_log` 的表能够被更新，这对调试非常有帮助。写入 system 表的数据通常与实际业务数据相比很小，因此在设置合理的 `min_free_disk_ratio_to_perform_insert` 阈值的情况下，它们应该能够在更长时间内继续工作。[#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end))。
* 为 Keeper 的内部复制启用异步模式。Keeper 在保持现有行为不变的前提下，可能带来性能提升。如果您是从 23.9 之前的版本升级，则需要先升级到 23.9 及以上版本，然后再升级到 25.10 及以上版本。您也可以在升级前将 `keeper_server.coordination_settings.async_replication` 设置为 0，并在升级完成后再启用它。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515)（[Antonio Andelic](https://github.com/antonio2368)）。





#### 新功能

* 新增对负数 `LIMIT` 和负数 `OFFSET` 的支持。修复了 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913)。[#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` 引擎会创建一张指向另一张表的代理表。所有读写操作都会被转发到目标表，而别名表本身不存储任何数据，只维护对目标表的引用。[#87965](https://github.com/ClickHouse/ClickHouse/pull/87965)（[Kai Zhu](https://github.com/nauu)）。
* 已实现对运算符 `IS NOT DISTINCT FROM` (`<=>`) 的完整支持。[#88155](https://github.com/ClickHouse/ClickHouse/pull/88155) ([simonmichal](https://github.com/simonmichal))。
* 新增了在 `MergeTree` 表中自动为所有适用列创建统计信息的功能。新增了表级设置 `auto_statistics_types`，用于存储要创建的统计信息类型的逗号分隔列表（例如 `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ)).
* 新增用于文本的 Bloom 过滤器索引 `sparse_gram`。 [#79985](https://github.com/ClickHouse/ClickHouse/pull/79985) ([scanhex12](https://github.com/scanhex12)).
* 新增 `conv` 函数用于在不同进制之间转换数字，目前支持 `2-36` 进制。[#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator))。
* 新增对 `LIMIT BY ALL` 语法的支持。类似于 `GROUP BY ALL` 和 `ORDER BY ALL`，`LIMIT BY ALL` 会自动扩展，将 SELECT 子句中所有非聚合表达式用作 LIMIT BY 键。例如，`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` 等价于 `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name`。当你希望按所有已选择的非聚合列进行限制而无需显式列出它们时，此功能可简化查询。修复了 [#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) 中的问题。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079) ([Surya Kant Ranjan](https://github.com/iit2009046))。
* 在 ClickHouse 中新增对 Apache Paimon 查询的支持。通过该集成，ClickHouse 用户可以直接访问并操作 Paimon 的数据湖存储。[#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* 新增 `studentTTestOneSample` 聚合函数。 [#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore)).
* 聚合函数 `quantilePrometheusHistogram`，其参数为直方图桶的上界以及对应的累积值，在找到分位数所在桶后，在该桶的下界和上界之间进行线性插值。在经典直方图上，其行为与 PromQL 中的 `histogram_quantile` 函数类似。[#86294](https://github.com/ClickHouse/ClickHouse/pull/86294) ([Stephen Chi](https://github.com/stephchi0))。
* 新增用于 Delta Lake 元数据文件的系统表。[#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12)).
* 添加 `ALTER TABLE REWRITE PARTS` —— 使用所有新的设置参数从头重写表的分片（因为其中某些设置，例如 `use_const_adaptive_granularity`，只会应用于新分片）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* 添加 `SYSTEM RECONNECT ZOOKEEPER` 命令，以强制断开并重新连接 ZooKeeper（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* 通过设置 `max_named_collection_num_to_warn` 和 `max_named_collection_num_to_throw` 来限制命名集合的数量。新增监控指标 `NamedCollection` 和错误 `TOO_MANY_NAMED_COLLECTIONS`。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos))。
* 新增了经过优化的 `startsWith` 和 `endsWith` 函数的不区分大小写变体：`startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8` 和 `endsWithCaseInsensitiveUTF8`。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang)).
* 新增了一种方式，可在 SQL 中通过服务器配置的 `resources_and_workloads` 部分定义 `WORKLOAD` 和 `RESOURCE`。[#87430](https://github.com/ClickHouse/ClickHouse/pull/87430)（[Sergei Trifonov](https://github.com/serxa)）。
* 新增一个表级设置 `min_level_for_wide_part`，用于指定将某个数据部分创建为宽格式部分时所需的最小层级。[#88179](https://github.com/ClickHouse/ClickHouse/pull/88179)（[Christoph Wurm](https://github.com/cwurm)）。
* 在 Keeper 客户端中添加 `cp`/`cpr` 和 `mv`/`mvr` 命令的递归版本。[#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 新增会话设置，用于在插入时排除指定的跳过索引参与物化（`exclude_materialize_skip_indexes_on_insert`）。新增 MergeTree 表设置，用于在合并过程中排除指定的跳过索引参与物化（`exclude_materialize_skip_indexes_on_merge`）。[#87252](https://github.com/ClickHouse/ClickHouse/pull/87252)（[George Larionov](https://github.com/george-larionov)）。



#### 实验性特性
* 实现了以位切片格式存储向量的 `QBit` 数据类型，以及 `L2DistanceTransposed` 函数，该函数支持近似向量搜索，并可通过参数控制精度与速度之间的权衡。[#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 函数 `searchAll` 和 `searchAny` 现在也可以用于不包含文本列的列上。在这些情况下，它们会使用默认的 tokenizer。[#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus))。



#### 性能改进

* 在 JOIN 和 ARRAY JOIN 中实现延迟列复制。避免在某些输出格式中将 Sparse 和 Replicated 等特殊列表示形式转换为完整列，从而避免在内存中产生不必要的数据拷贝。[#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar))。
* 为 MergeTree 表中顶层 String 类型列添加可选的 `.size` 子列序列化，以提升压缩效果并支持高效的子列访问。引入新的 MergeTree 设置，用于控制序列化版本以及针对空字符串的表达式优化。[#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* 支持 Iceberg 的有序读取。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 通过在运行时基于右子树构建 Bloom filter，并将该过滤器传递给左子树中的扫描操作，可以加速某些 JOIN 查询。这对于类似 `SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` 的查询可能会有明显收益。 [#84772](https://github.com/ClickHouse/ClickHouse/pull/84772) ([Alexander Gololobov](https://github.com/davenger)).
* 通过重构 Query Condition Cache（QCC）与索引分析的执行顺序和集成方式，提升了查询性能。现在会先在主键和 skip 索引分析之前应用 QCC 过滤，从而减少不必要的索引计算。索引分析已扩展为支持多个范围过滤条件，其过滤结果现在也会回写到 QCC 中。对于执行时间主要消耗在索引分析上的查询——尤其是依赖 skip 索引（例如向量索引或倒排索引）的查询——这显著加快了查询速度。[#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird)).
* 一系列微优化，用于加速小型查询。[#83096](https://github.com/ClickHouse/ClickHouse/pull/83096)（[Raúl Marín](https://github.com/Algunenano)）。
* 在原生协议中对日志和 profile 事件进行压缩。在具有 100 个以上副本的集群上，未压缩的 profile 事件会占用 1–10 MB/秒的带宽，并且在较慢的网络连接上进度条会变得迟缓。此更改关闭了 [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533)。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过使用 [StringZilla](https://github.com/ashvardanian/StringZilla) 库，并在可用时利用 SIMD CPU 指令，提升区分大小写字符串搜索（例如 `WHERE URL LIKE '%google%'` 此类过滤操作）的性能。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* 在对包含类型为 `SimpleAggregateFunction(anyLast)` 列的 AggregatingMergeTree 表使用 FINAL 进行查询时，减少内存分配和内存复制。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* 实现了将析取（OR）JOIN 谓词下推的逻辑。例如：在 TPC-H Q7 中，对于两个表 n1 和 n2 的条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')`，我们为每个表提取单独的局部过滤条件：对于 n1 提取 `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`，对于 n2 提取 `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'`。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 通过使用新的默认设置 `optimize_rewrite_like_perfect_affix`，提高了带前缀或后缀模式的 `LIKE` 查询性能。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 修复在按多个字符串/数值列进行分组时，由于序列化键过大而导致的性能下降。这是对 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) 的后续改进。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 新增 `joined_block_split_single_row` 设置，用于在某个键存在大量匹配项时减少哈希连接的内存使用。该设置允许哈希连接的结果即便在单个左表行的所有匹配中也可以被拆分成多个数据块，这在左表中的一行与右表中的数千甚至数百万行匹配时尤为有用。此前，所有匹配结果必须一次性在内存中物化。此更改可降低峰值内存使用，但可能会增加 CPU 使用率。[#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 改进 SharedMutex（在大量并发查询场景下提升性能）。[#87491](https://github.com/ClickHouse/ClickHouse/pull/87491)（[Raúl Marín](https://github.com/Algunenano)）。
* 提升了为主要由低频词元组成的文档构建文本索引时的性能。[#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ))。
* 加速 `Field` 析构函数的常见执行路径（提升大量小查询场景下的性能）。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* 在 JOIN 优化过程中跳过对运行时哈希表统计信息的重新计算（提升所有包含 JOIN 的查询性能）。新增 `JoinOptimizeMicroseconds` 和 `QueryPlanOptimizeMicroseconds` 两个 profile 事件。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 为 MergeTreeLazy 读取器启用在缓存中保存标记，并避免直接 I/O 操作。这样可以提升包含 ORDER BY 且 LIMIT 较小的查询性能。[#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat))。
* 在带有 `is_deleted` 列的 `ReplacingMergeTree` 表上使用 `FINAL` 子句的 SELECT 查询现在执行得更快，得益于对以下两项既有优化的并行化改进：1. 对仅包含单个 `part` 的表分区使用 `do_not_merge_across_partitions_select_final` 优化；2. 将表中其他被选中的范围拆分为「相交 / 不相交」两类，并且只有相交范围需要经过 FINAL 合并转换处理。 [#88090](https://github.com/ClickHouse/ClickHouse/pull/88090) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 降低在未使用 fail points（即调试未启用时采用的默认代码路径）情况下的开销。[#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* 在按 `uuid` 过滤 `system.tables` 时避免进行全表扫描（在仅有来自日志或 ZooKeeper 路径的 UUID 时非常有用）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 优化了函数 `tokens`、`hasAllTokens`、`hasAnyTokens` 的性能。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 将 `AddedColumns::appendFromBlock` 内联，以在某些情况下略微提升 JOIN 操作性能。[#88455](https://github.com/ClickHouse/ClickHouse/pull/88455)（[Nikita Taranov](https://github.com/nickitat)）。
* 通过使用 `system.completions` 而不是执行多次系统表查询，客户端自动补全变得更快且更一致。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m)).
* 新增 `dictionary_block_frontcoding_compression` 文本索引参数，用于控制字典压缩。默认情况下启用 `front-coding` 压缩。[#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 在插入到物化视图之前，根据设置 `min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views`，先将来自所有线程的数据进行合并（squash）。此前，如果启用了 `parallel_view_processing`，则每个向某个特定物化视图插入数据的线程都会独立进行合并后再插入，这可能会导致生成的数据部分（parts）数量增多。 [#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368)).
* 添加设置 `temporary_files_buffer_size`，用于控制临时文件写入器的缓冲区大小。 * 为 `LowCardinality` 列优化 `scatter` 操作（例如在 Grace 哈希连接中使用）的内存占用。 [#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新增对在并行副本上直接读取文本索引的支持。提升了从对象存储读取文本索引的性能。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ))。
* 对 Data Lakes 目录中表的查询将使用并行副本进行分布式处理。[#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12))。
* 用于调优后台合并算法的内部启发式规则，名为 &quot;to&#95;remove&#95;small&#95;parts&#95;at&#95;right&quot;，将在计算合并范围得分之前执行。在此之前，合并选择器会选择一个较宽范围的合并，而在此之后，它会对该合并的后缀进行过滤。修复：[#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736) ([Mikhail Artemenko](https://github.com/Michicosun))。





#### 改进

* 现在，函数 `generateSerialID` 支持将序列名称作为非常量参数传入。已关闭 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750)。[#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 `generateSerialID` 函数新增了可选的 `start_value` 参数，用于为新序列指定自定义起始值。[#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma))。
* 在 `clickhouse-format` 中添加 `--semicolons_inline` 选项，用于在格式化查询时将分号放在最后一行，而不是另起一行。[#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan))。
* 在 Keeper 中覆盖配置时，允许配置服务器级别的限流。关闭 [#73964](https://github.com/ClickHouse/ClickHouse/issues/73964)。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066) ([JIaQi](https://github.com/JiaQiTang98))。
* `mannWhitneyUTest` 在两个样本都只包含相同的值时不再抛出异常。现在会返回一个有效结果，与 SciPy 保持一致。由此关闭问题：[#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht))。
* 如果元数据事务已提交，则重写磁盘对象存储的事务会删除之前的远程 blob。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* 修复了在优化前后结果类型的 `LowCardinality` 不一致时，对冗余相等表达式的优化过程。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 当 HTTP 客户端在设置 `Expect: 100-continue` 的同时再设置请求头 `X-ClickHouse-100-Continue: defer` 时，ClickHouse 在通过配额验证之前不会向客户端发送 `100 Continue` 响应，从而避免为那些最终会被丢弃的请求体浪费网络带宽。对于 INSERT 查询，查询语句可以通过 URL 查询字符串发送，而数据则在请求体中发送。在未发送完整请求体的情况下中止请求，会导致在 HTTP/1.1 中无法复用连接，但与在大量数据场景下 INSERT 操作的整体耗时相比，因建立新连接而增加的额外延迟通常可以忽略不计。[#84304](https://github.com/ClickHouse/ClickHouse/pull/84304)（[c-end](https://github.com/c-end)）。
* 在使用 `DATABASE ENGINE = Backup` 并采用 S3 存储时，对日志中的 S3 凭据进行掩码处理。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* 通过推迟其物化，使查询计划中的优化对相关子查询的输入子计划可见。属于 [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890)。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* 对 `SYSTEM DROP DATABASE REPLICA` 的更改： - 当与数据库一起删除副本或删除整个副本时：同时会删除该数据库中每个表的副本 - 如果提供了 `WITH TABLES`：则为每个存储删除副本 - 否则，逻辑保持不变，仅在数据库级别删除副本 - 当使用 Keeper 路径删除数据库副本时： - 如果提供了 `WITH TABLES`： - 将数据库恢复为 Atomic - 从 Keeper 中保存的语句恢复 RMT 表 - 删除该数据库（恢复的表也会一并删除） - 否则，仅删除所提供 Keeper 路径上的副本。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了当 TTL 中包含 `materialize` 函数时格式不一致的问题。关闭 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg 表状态不再保存在存储对象中。这应当使在 ClickHouse 中使用 Iceberg 时能够支持并发查询。[#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik))。
* 将 S3Queue 有序模式下的 bucket 锁改为持久化模式，类似于 `use_persistent_processing_nodes = 1` 时的 processing nodes。在测试中添加 Keeper 故障注入。[#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当用户在格式名称中出现拼写错误时提供提示。修复了 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761)。[#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* 当没有投影时，远程副本将跳过索引分析。[#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi))。
* 允许对 ytsaurus 表禁用 UTF-8 编码。[#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 默认将 `s3_slow_all_threads_after_retryable_error` 禁用。[#87198](https://github.com/ClickHouse/ClickHouse/pull/87198) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 将表函数 `arrowflight` 重命名为 `arrowFlight`。[#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar))。
* 已更新 `clickhouse-benchmark`，现在其 CLI 标志中可以使用 `-` 来替代 `_`。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda)).
* 在信号处理程序中将对 `system.crash_log` 的刷新改为同步进行。[#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新增了设置项 `inject_random_order_for_select_without_order_by`，用于在没有 `ORDER BY` 子句的顶层 `SELECT` 查询中自动注入 `ORDER BY rand()`。[#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn))。
* 改进 `joinGet` 错误信息，使其能够正确指出 `join_keys` 的数量与 `right_table_keys` 的数量不一致。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 在写入事务期间新增检查任意 Keeper 节点 stat 的功能。这有助于检测 ABA 问题。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 将繁重的 ytsaurus 请求重定向到 heavy 代理节点。[#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复了基于磁盘事务元数据的 `unlink`/`rename`/`removeRecursive`/`removeDirectory`/等操作在各种可能工作负载下的回滚以及硬链接计数问题，并简化了相关接口，使其更加通用，从而可以在其他元数据存储中复用。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新增 `keeper_server.tcp_nodelay` 配置参数，可用于为 Keeper 禁用 `TCP_NODELAY`。[#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* 在 `clickhouse-benchmarks` 中支持 `--connection`。其行为与 `clickhouse-client` 中的同名选项一致，你可以在客户端的 `config.xml`/`config.yaml` 中的 `connections_credentials` 路径下配置预定义连接，以避免在命令行参数中显式指定用户名/密码。为 `clickhouse-benchmark` 添加对 `--accept-invalid-certificate` 的支持。[#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat))。
* 现在为 Iceberg 表设置 `max_insert_threads` 将会生效。[#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin))。
* 向 `PrometheusMetricsWriter` 添加直方图和维度型指标。这样，`PrometheusRequestHandler` 处理器就会具备所有关键指标，可用于在云环境中进行可靠、低开销的指标采集。[#87521](https://github.com/ClickHouse/ClickHouse/pull/87521)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 函数 `hasToken` 现在对空 token 返回零个匹配结果（此前会抛出异常）。[#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* 为 `Array` 和 `Map` 类型的值（`mapKeys` 和 `mapValues`）添加文本索引支持。支持的函数为 `mapContainsKey` 和 `has`。 [#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 新增一个 `ZooKeeperSessionExpired` 指标，用于指示过期的全局 ZooKeeper 会话数量。[#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 使用具有备份专用设置的 S3 存储客户端（例如 `backup_slow_all_threads_after_retryable_s3_error`），在服务端（原生）执行到备份目标的复制操作。将 `s3_slow_all_threads_after_retryable_error` 废弃。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在使用实验性功能 `make_distributed_plan` 进行查询计划序列化时，对设置 `max_joined_block_size_rows` 和 `max_joined_block_size_bytes` 的错误处理问题。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 设置 `enable_http_compression` 现在默认启用。这意味着如果客户端支持 HTTP 压缩，服务器将会使用它。然而，此更改也有一些缺点。客户端可以请求一种开销较大的压缩方法，例如 `bzip2`，这是不合理的，并且会增加服务器的资源消耗（但这只会在传输大结果集时才明显）。客户端可以请求 `gzip`，这并不算太糟，但与 `zstd` 相比并不是最优的。关闭了 [#71591](https://github.com/ClickHouse/ClickHouse/issues/71591)。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `system.server_settings` 中新增了一个名为 `keeper_hosts` 的条目，用于显示 ClickHouse 可连接的 [Zoo]Keeper 主机列表。[#87718](https://github.com/ClickHouse/ClickHouse/pull/87718)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 向系统仪表板添加 `from` 和 `to` 值，以便进行历史排查。[#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 在 Iceberg 的 SELECT 查询中新增更多用于性能跟踪的信息。[#87903](https://github.com/ClickHouse/ClickHouse/pull/87903)（[Daniil Ivanik](https://github.com/divanik)）。
* 文件系统缓存改进：在多个线程并发预留缓存空间时复用缓存优先级迭代器。[#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加了限制 `Keeper` 请求大小的能力（通过 `max_request_size` 设置，与 `ZooKeeper` 的 `jute.maxbuffer` 设置相同，默认关闭以保持向后兼容性，预计在后续版本中启用）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* 使 `clickhouse-benchmark` 默认不在错误消息中包含堆栈跟踪信息。[#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* 当标记（marks）已经在缓存中时，避免使用线程池异步加载标记（`load_marks_asynchronously=1`）（因为线程池可能处于高负载状态，即使标记已经在缓存中，查询仍会因此付出额外开销）。[#87967](https://github.com/ClickHouse/ClickHouse/pull/87967)（[Azat Khuzhin](https://github.com/azat)）。
* Ytsaurus：支持仅使用部分列创建表 / 表函数 / 字典。 [#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 从现在开始，`system.zookeeper_connection_log` 默认启用，可用于获取 Keeper 会话相关信息。[#88011](https://github.com/ClickHouse/ClickHouse/pull/88011)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 在传入重复的外部表时，使 TCP 和 HTTP 的行为保持一致。HTTP 允许同一个临时表被多次传入。[#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema)).
* 移除用于读取 Arrow/ORC/Parquet 的自定义 MemoryPools。自从 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 之后，这个组件似乎不再需要，因为现在我们已经会跟踪所有内存分配。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 支持在不带参数的情况下创建 `Replicated` 数据库。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`：新增对通过 TLS 端口连接 clickhouse-keeper 的支持，保持与 clickhouse-client 中的标志名称一致。[#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep))。
* 新增了一个 profile 事件，用于跟踪后台合并任务因超出内存限制而被拒绝的次数。[#88084](https://github.com/ClickHouse/ClickHouse/pull/88084)（[Grant Holly](https://github.com/grantholly-clickhouse)）。
* 启用用于验证 `CREATE/ALTER TABLE` 列默认表达式的分析器。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus)).
* 内部查询计划改进：在 `CROSS JOIN` 中使用 JoinStepLogical。 [#88151](https://github.com/ClickHouse/ClickHouse/pull/88151) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 为 `hasAnyTokens`（`hasAnyToken`）和 `hasAllTokens`（`hasAllToken`）函数新增了别名。[#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* 默认启用全局采样分析器（也就是说，即使是与查询无关的服务器线程也会进行采样）：每累计 10 秒的 CPU 时间和实际时间，收集一次所有线程的堆栈跟踪。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 将 Azure SDK 更新为包含针对复制和创建容器功能中出现的 &#39;Content-Length&#39; 问题的修复。[#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 使函数 `lag` 对大小写不敏感，以兼容 MySQL。[#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot))。
* 允许 `clickhouse-local` 从 `clickhouse-server` 目录启动。在早期版本中，这会产生错误 `Cannot parse UUID: .`。现在，你可以在不启动服务器的情况下启动 `clickhouse-local` 并操作该服务器的数据库。[#88383](https://github.com/ClickHouse/ClickHouse/pull/88383)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增配置项 `keeper_server.coordination_settings.check_node_acl_on_remove`。启用后，在每次删除节点之前，将同时验证该节点本身及其父节点的 ACL；否则，只验证父节点的 ACL。[#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368))。
* 在使用 `Vertical` 格式时，`JSON` 列现在会以美化后的形式输出。关闭了 [#81794](https://github.com/ClickHouse/ClickHouse/issues/81794)。 [#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* 将 `clickhouse-client` 文件（例如查询历史）存储在 [XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 规范所描述的位置，而不是直接存放在用户主目录下。如果 `~/.clickhouse-client-history` 已经存在，仍然会继续使用该文件。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了由 `GLOBAL IN` 导致的内存泄漏（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* 为 hasAny/hasAllTokens 新增重载，使其支持字符串输入。[#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* 在 `clickhouse-keeper` 的 postinstall 脚本中添加一步，以启用开机自启动。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan))。
* 仅在将凭据粘贴到 Web UI 时进行检查，而不是在每次按键时检查。这样可以避免因 LDAP 服务器配置错误而导致的问题。修复了 [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777)。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在违反约束时限制异常消息的长度。在此前的版本中，当插入一个非常长的字符串时，可能会产生同样非常长的异常消息，并最终被写入 `query_log`。修复 [#87032](https://github.com/ClickHouse/ClickHouse/issues/87032)。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在创建表时向 ArrowFlight 服务器请求数据集结构时出现的问题。[#87542](https://github.com/ClickHouse/ClickHouse/pull/87542)（[Vitaly Baranov](https://github.com/vitlibar)）。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复了由 GeoParquet 导致的客户端协议错误。[#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在发起节点上执行的子查询中解析 `shardNum()` 等与主机相关函数的问题。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa)).
* 修复了多个与日期时间相关的函数（例如 `parseDateTime64BestEffort`、`change{Year,Month,Day}` 和 `makeDateTime64`）在处理带有小数秒的 Unix 纪元之前日期时的不正确行为。此前会将秒的小数部分从秒值中减去，而不是将其相加。例如，`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` 会返回 `1968-12-31 23:59:59.532`，而非 `1969-01-01 00:00:00.468`。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复了在同一条 ALTER 语句中列状态发生变化时导致 ALTER COLUMN IF EXISTS 命令失败的问题。现在，诸如 DROP COLUMN IF EXISTS、MODIFY COLUMN IF EXISTS、COMMENT COLUMN IF EXISTS 和 RENAME COLUMN IF EXISTS 等命令，能够正确处理同一语句中某个列已被前一个命令删除的情况。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复对超出支持范围的日期推断 `Date`/`DateTime`/`DateTime64` 类型的问题。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个崩溃问题：某些合法的用户提交数据在写入 `AggregateFunction(quantileDD)` 列时可能导致合并过程陷入无限递归。[#86560](https://github.com/ClickHouse/ClickHouse/pull/86560)（[Raphaël Thériault](https://github.com/raphael-theriault-swi)）。
* 支持在通过 `cluster` 表函数创建的表中使用 JSON/Dynamic 类型。[#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复查询中在 CTE 中计算的函数结果表现为非确定性的错误。[#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复当在主键列上使用 pointInPolygon 时 EXPLAIN 中出现的 LOGICAL&#95;ERROR。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复名称中包含百分号编码序列的数据湖表的问题。关闭 [#86626](https://github.com/ClickHouse/ClickHouse/issues/86626)。[#87020](https://github.com/ClickHouse/ClickHouse/pull/87020)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 修复在启用 `optimize_functions_to_subcolumns` 的情况下，`OUTER JOIN` 中可为 NULL 的列上的 `IS NULL` 行为不正确的问题，关闭 [#78625](https://github.com/ClickHouse/ClickHouse/issues/78625)。[#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在跟踪 `max_temporary_data_on_disk_size` 限制时对临时数据释放的错误记账，关闭 [#87118](https://github.com/ClickHouse/ClickHouse/issues/87118)。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140) ([JIaQi](https://github.com/JiaQiTang98)).
* 函数 checkHeaders 现在能够正确验证所提供的 headers，并拒绝不允许的 headers。原作者：Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* 使所有数值类型上的 `toDate` 和 `toDate32` 行为保持一致。修复了从 int16 类型转换为 Date32 时的下溢检查。[#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在包含多个 JOIN 的查询中使用并行副本时的逻辑错误，特别是在 LEFT/INNER JOIN 之后使用 RIGHT JOIN 的情况。[#87178](https://github.com/ClickHouse/ClickHouse/pull/87178)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在模式推断缓存中也遵循 `input_format_try_infer_variants` 设置。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* 使 pathStartsWith 仅匹配该前缀下的路径。[#87181](https://github.com/ClickHouse/ClickHouse/pull/87181)（[Raúl Marín](https://github.com/Algunenano)）。
* 修复了 `_row_number` 虚拟列和 Iceberg 基于位置删除中的逻辑错误。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在 `JOIN` 中由于混合使用 const 和非 const 块而触发的 “Too large size passed to allocator” `LOGICAL_ERROR`。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 修复了使用子查询从其他 `MergeTree` 表读取数据的轻量级更新操作。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在存在行策略时不起作用的 move-to-prewhere 优化。是对 [#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) 的后续完善。关闭 [#69777](https://github.com/ClickHouse/ClickHouse/issues/69777)。关闭 [#83748](https://github.com/ClickHouse/ClickHouse/issues/83748)。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了在数据部分中对缺失但具有默认表达式的列应用补丁时的问题。[#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了在 MergeTree 表中使用重复的分区字段名称时可能出现的段错误。[#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 EmbeddedRocksDB 的升级问题。 [#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了在对象存储上直接读取文本索引的问题。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 防止针对不存在的引擎创建权限。[#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411))。
* 仅忽略 `s3_plain_rewritable` 的“未找到”错误（这可能会导致各种问题）。[#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat))。
* 修复以 YTSaurus 为源并使用 *range&#95;hashed 布局的字典。[#87490](https://github.com/ClickHouse/ClickHouse/pull/87490)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 修复创建空元组数组时的问题。[#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar))。
* 在创建临时表时检查无效列。[#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* 切勿在格式头部中包含 Hive 分区列。修复了 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515)。[#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在 DeltaLake 中使用文本格式时的读取准备逻辑。[#87529](https://github.com/ClickHouse/ClickHouse/pull/87529)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了对 Buffer 表执行 SELECT 和 INSERT 时的访问校验。[#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit))。
* 禁止为 S3 表创建数据跳过索引。[#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc)).
* 避免在异步日志记录中泄漏受跟踪的内存（在 10 小时内可能产生约 100GiB 的显著偏差），以及在 `text_log` 中（也可能产生几乎相同的偏差）。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* 修复了一个缺陷：在某个视图或物化视图被异步删除，并且服务器在后台清理完成之前重启的情况下，可能会导致该视图的 SELECT 设置覆盖全局服务器设置。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在计算内存过载警告时，如果可能，排除用户空间页面缓存所占字节数。[#87610](https://github.com/ClickHouse/ClickHouse/pull/87610)（[Bharat Nallan](https://github.com/bharatnc)）。
* 修复了一个问题：CSV 反序列化时类型顺序错误会导致 `LOGICAL_ERROR`。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetsky](https://github.com/yariks5s)).
* 修复在可执行字典中对 `command_read_timeout` 的错误处理。[#87627](https://github.com/ClickHouse/ClickHouse/pull/87627)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在使用新分析器时，当对被替换列进行过滤时，WHERE 子句中 SELECT * REPLACE 的错误行为。[#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复了在 `Distributed` 之上使用 `Merge` 时的两级聚合问题。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* 修复在未使用右侧行列表时 HashJoin 算法输出块的生成逻辑。修复了 [#87401](https://github.com/ClickHouse/ClickHouse/issues/87401)。 [#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* 在应用索引分析后如果没有可读取的数据，可能会错误地选择并行副本读取模式的问题已被修复。关闭 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653)。[#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi))。
* 修复 Glue 中对 `timestamp` / `timestamptz` 列的处理。[#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand))。
* 此更改关闭了 [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587)。 [#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* 修复通过 PostgreSQL 接口写入布尔值的问题。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* 修复在包含 CTE 的 `INSERT SELECT` 查询中出现的未知表错误，[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* 修复在不允许位于 Nullable 中的 Variants 中读取 null map 子列的问题。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在从节点上未能在集群中完全删除数据库时的错误处理。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复了多个跳过索引相关的错误。[#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* 在 AzureBlobStorage 中，更新为优先尝试原生复制，如遇到 “Unauthroized” 错误则回退为通过读写进行复制（在 AzureBlobStorage 中，如果源和目标使用不同的存储账户，会出现 “Unauthorized” 错误）。同时修复了在配置中定义了 endpoint 时未正确应用 `"use_native_copy"` 的问题。[#87826](https://github.com/ClickHouse/ClickHouse/pull/87826)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 如果 ArrowStream 文件包含不唯一的字典，ClickHouse 会崩溃。[#87863](https://github.com/ClickHouse/ClickHouse/pull/87863)（[Ilya Golshtein](https://github.com/ilejn)）。
* 修复在使用 approx&#95;top&#95;k 和 finalizeAggregation 时的致命错误。[#87892](https://github.com/ClickHouse/ClickHouse/pull/87892)（[Jitendra](https://github.com/jitendra1411)）。
* 修复在最后一个数据块为空时包含投影的合并操作。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano)).
* 如果参数类型不允许用于 GROUP BY，则不要从 GROUP BY 中移除单射函数。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在查询中使用 `session_timezone` 设置时，基于 datetime 的键在 granule/分区裁剪上的错误。[#87987](https://github.com/ClickHouse/ClickHouse/pull/87987)（[Eduard Karacharov](https://github.com/korowa)）。
* 在 PostgreSQL 接口中，在查询执行后返回受影响的行数。[#87990](https://github.com/ClickHouse/ClickHouse/pull/87990)（[Artem Yurov](https://github.com/ArtemYurov)）。
* 限制在 PASTE JOIN 中使用 filter pushdown，因为这可能导致结果不正确。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 在执行通过 [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) 引入的权限检查之前，先对 URI 进行规范化处理。[#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 修复了在新分析器中，当 ARRAY JOIN COLUMNS() 未匹配到任何列时出现的逻辑错误。[#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 &quot;High ClickHouse memory usage&quot; 警告（不包括页缓存）。[#88092](https://github.com/ClickHouse/ClickHouse/pull/88092)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在设置了列级 `TTL` 的 `MergeTree` 表中可能发生的数据损坏问题。[#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在附加包含无效表的外部数据库（`PostgreSQL`/`SQLite`/...）时读取 `system.tables` 可能出现的未捕获异常。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在以空元组作为参数调用 `mortonEncode` 和 `hilbertEncode` 函数时发生的崩溃问题。[#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 现在在集群中存在不活跃副本的情况下，`ON CLUSTER` 查询将耗时更短。[#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin))。
* 现在 DDL worker 会从副本集合中清理过期的主机信息，这将减少存储在 ZooKeeper 中的元数据量。[#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin))。
* 修复了在未启用 cgroups 的情况下运行 ClickHouse 的问题（由于异步指标，cgroups 被意外地变成了必需依赖）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat))。
* 在发生错误时正确回滚目录移动操作。我们需要重写在执行过程中更改的所有 `prefix.path` 对象，而不只是根目录对象。[#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 修复了 `ColumnLowCardinality` 中 `is_shared` 标志传播的问题。如果在 `ReverseIndex` 中的哈希值已经预先计算并缓存之后，又在该列中插入了新值，则可能导致错误的 GROUP BY 结果。[#88213](https://github.com/ClickHouse/ClickHouse/pull/88213)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了工作负载设置 `max_cpu_share` 的问题。现在即使未设置工作负载参数 `max_cpus`，也可以使用该参数。[#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria))。
* 修复了一个问题：包含子查询的高负载 mutation 可能会卡在准备阶段。现在可以使用 `SYSTEM STOP MERGES` 来停止这些 mutation。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 现在，相关子查询也可以用于对象存储。[#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin))。
* 避免在访问 `system.projections` 和 `system.data_skipping_indices` 时初始化 DataLake 数据库。[#88330](https://github.com/ClickHouse/ClickHouse/pull/88330)（[Azat Khuzhin](https://github.com/azat)）。
* 现在，只有在显式启用 `show_data_lake_catalogs_in_system_tables` 时，数据湖目录才会显示在系统自省表中。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin))。
* 修复了 DatabaseReplicated 使其遵循 `interserver_http_host` 配置。[#88378](https://github.com/ClickHouse/ClickHouse/pull/88378)（[xiaohuanlin](https://github.com/xiaohuanlin)）。
* 在定义 Projection 的场景中现已明确禁用位置参数，因为在这一内部查询阶段它们没有意义。此更改修复了 [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604)。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `countMatches` 函数中的平方时间复杂度问题。关闭 [#88400](https://github.com/ClickHouse/ClickHouse/issues/88400)。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使针对 KeeperMap 表的 `ALTER COLUMN ... COMMENT` 命令可被复制，从而会提交到 Replicated 数据库元数据并在所有副本间传播。关闭 [#88077](https://github.com/ClickHouse/ClickHouse/issues/88077)。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408)（[Eduard Karacharov](https://github.com/korowa)）。
* 修复了在 `Database Replicated` 中使用 `Materialized Views` 时出现的一种错误的循环依赖判定问题，该问题会阻止为数据库添加新副本。[#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复在 `group_by_overflow_mode` 设置为 `any` 时对稀疏列的聚合。[#88440](https://github.com/ClickHouse/ClickHouse/pull/88440)（[Eduard Karacharov](https://github.com/korowa)）。
* 修复在使用 `query_plan_use_logical_join_step=0` 且包含多个 FULL JOIN USING 子句时出现的 &quot;column not found&quot; 错误。关闭 [#88103](https://github.com/ClickHouse/ClickHouse/issues/88103)。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 节点数量大于 10 的大型集群在执行恢复操作时，很有可能因错误 `[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` 而导致恢复失败。`num_hosts` 节点会被许多主机同时覆盖。该修复将用于控制重试次数的设置改为动态。关闭 [#87721](https://github.com/ClickHouse/ClickHouse/issues/87721)。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 此 PR 只是为了与 23.8 及更早版本保持兼容性。兼容性问题是由这个 PR 引入的：[https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240)。在 `enable_analyzer=0` 时，这条 SQL 会执行失败（在 23.8 之前则不会）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 修复在将较大数值转换为 DateTime 时，`accurateCast` 错误消息中触发的 UBSAN 整数溢出问题。[#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复 Tuple 类型的 CoalescingMergeTree。这关闭了 [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469)。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* 对于 `iceberg_format_version=1` 禁用删除操作。此更改关闭了 [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444)。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* 此补丁修复了 `plain-rewritable` 磁盘针对任意深度文件夹的移动操作。[#88586](https://github.com/ClickHouse/ClickHouse/pull/88586)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* 修复 SQL SECURITY DEFINER 与 *cluster 函数配合使用时的问题。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 修复由于对底层常量 PREWHERE 列的并发变更可能导致的潜在崩溃。[#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat))。
* 修复了从文本索引读取数据的问题，并在启用 `use_skip_indexes_on_data_read` 和 `use_query_condition_cache` 设置时启用了查询条件缓存。[#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* 从 `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` 抛出的 `Poco::TimeoutException` 异常会导致程序因 SIGABRT 崩溃。[#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 已在 [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) 中回溯修复：在恢复后，Replicated 数据库副本可能会长时间卡住，并持续输出类似 `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` 的消息，此问题已修复。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复在配置重新加载后，ClickHouse 首次连接时向 `system.zookeeper_connection_log` 追加记录的问题。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了一个错误：在使用 `date_time_overflow_behavior = 'saturate'` 将 DateTime64 转换为 Date 并处理时区时，对于超出范围的值可能会得到不正确的结果。[#88737](https://github.com/ClickHouse/ClickHouse/pull/88737)（[Manuel](https://github.com/raimannma)）。
* 第 N 次尝试修复在启用缓存的 S3 表引擎中出现的“zero bytes”错误。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在对 `loop` 表函数执行 `SELECT` 时的访问权限验证。[#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit)).
* 在异步日志记录失败时捕获异常，防止程序异常退出。[#88814](https://github.com/ClickHouse/ClickHouse/pull/88814)（[Raúl Marín](https://github.com/Algunenano)）。
* 已在 [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) 中回溯修复：修复 `top_k` 在以单个参数调用时未正确处理 threshold 参数的问题。关闭 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757)。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* 已在 [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) 中回溯修复：修复函数 `reverseUTF8` 中的错误。在此前的版本中，它错误地反转了长度为 4 的 UTF-8 代码点的字节。此更改关闭了 [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913)。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 已在 [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) 中进行了回溯移植：在使用 SQL SECURITY DEFINER 创建视图时，不再检查执行 `SET DEFINER <current_user>:definer` 所需的访问权限。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* 已在 [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) 中回溯修复：修复了 `L2DistanceTransposed(vec1, vec2, p)` 中的 `LOGICAL_ERROR`，该错误是由于对部分读取 `QBit` 的优化导致在 `p` 为 `Nullable` 时从返回类型中错误移除了 `Nullable`。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 已在 [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) 中完成回移植：修复未知 catalog 类型导致的崩溃问题。已解决 [#88819](https://github.com/ClickHouse/ClickHouse/issues/88819)。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* 已在 [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) 中回溯移植：修复了在分析 skipping 索引时的性能下降问题。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### 构建/测试/打包改进

- 使用 `postgres` 库版本 18.0。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 为 FreeBSD 启用 ICU。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano))。
- 在动态分发到 SSE 4.2 时使用 SSE 4.2 而非 SSE 4。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano))。
- 如果 `Speculative Store Bypass Safe` 不可用,则无需 `NO_ARMV81_OR_HIGHER` 标志。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 当 ClickHouse 使用 `ENABLE_LIBFIU=OFF` 构建时,故障点相关函数将变为空操作,不再影响性能。在这种情况下,`SYSTEM ENABLE/DISABLE FAILPOINT` 查询将返回 `SUPPORT_IS_DISABLED` 错误。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end))。

### ClickHouse 版本 25.9,2025-09-25 {#259}

#### 向后不兼容的变更

- 禁用 IPv4/IPv6 的无意义二进制操作:禁用 IPv4/IPv6 与非整数类型的加/减运算。之前允许与浮点类型进行操作,并对某些其他类型(如 DateTime)抛出逻辑错误。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano))。
- 弃用设置 `allow_dynamic_metadata_for_data_lakes`。现在所有 iceberg 表在执行每个查询之前都会尝试从存储中获取最新的表结构。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik))。
- 更改了 `OUTER JOIN ... USING` 子句中合并列的解析方式以提高一致性:以前,在 OUTER JOIN 中同时选择 USING 列和限定列(`a, t1.a, t2.a`)时,USING 列会被错误地解析为 `t1.a`,对于右表中没有左匹配的行显示 0/NULL。现在,USING 子句中的标识符始终解析为合并列,而限定标识符解析为非合并列,无论查询中存在哪些其他标识符。例如:```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 之前:a=0, t1.a=0, t2.a=2(不正确 - 'a' 解析为 t1.a) -- 之后:a=2, t1.a=0, t2.a=2(正确 - 'a' 已合并)。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir))。
- 将复制去重窗口增加到 10000。这是完全兼容的,但在存在大量表的情况下,此更改可能导致较高的资源消耗。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema))。


#### 新功能

* 现在，用户可以通过为 NATS 引擎指定新的 `nats_stream` 和 `nats_consumer` 设置来使用 NATS JetStream 消费消息。[#84799](https://github.com/ClickHouse/ClickHouse/pull/84799)（[Dmitry Novikov](https://github.com/dmitry-sles-novikov)）。
* 为 `arrowFlight` 表函数添加了对身份验证和 SSL 的支持。[#87120](https://github.com/ClickHouse/ClickHouse/pull/87120)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 为 `S3` 表引擎和 `s3` 表函数新增名为 `storage_class_name` 的参数，用于指定 AWS 支持的智能分层（Intelligent-Tiering）。该参数既支持键值格式，也支持位置参数格式（已弃用）。[#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin))。
* 为 Iceberg 表引擎添加对 `ALTER UPDATE` 的支持。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12)).
* 添加了系统表 `iceberg_metadata_log`，可在 SELECT 查询中检索 Iceberg 元数据文件。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152)（[scanhex12](https://github.com/scanhex12)）。
* `Iceberg` 和 `DeltaLake` 表通过存储级别设置项 `disk` 支持自定义磁盘配置。[#86778](https://github.com/ClickHouse/ClickHouse/pull/86778)（[scanhex12](https://github.com/scanhex12)）。
* 为数据湖磁盘增加对 Azure 的支持。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* 基于 Azure Blob 存储支持 `Unity` 目录。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 在 `Iceberg` 写入中支持更多格式（`ORC`、`Avro`）。这解决了问题 [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179)。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* 新增系统表 `database_replicas`，包含数据库副本相关信息。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov)).
* 新增了函数 `arrayExcept`，用于按集合语义将一个数组从另一个数组中减去。[#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x))。
* 新增 `system.aggregated_zookeeper_log` 表。该表包含按会话 ID、父路径和操作类型分组的 ZooKeeper 操作统计信息（例如操作次数、平均延迟、错误数），并会定期写入磁盘。[#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新增函数 `isValidASCII`。如果输入字符串或 FixedString 只包含 ASCII 字节（0x00–0x7F），则返回 1，否则返回 0。修复了 [#85377](https://github.com/ClickHouse/ClickHouse/issues/85377)。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* 布尔类型的设置可以在不带参数的情况下指定，例如 `SET use_query_cache;`，这等同于将其设置为 true。[#85800](https://github.com/ClickHouse/ClickHouse/pull/85800) ([thraeka](https://github.com/thraeka))。
* 新的配置选项：`logger.startupLevel` 和 `logger.shutdownLevel` 允许分别在 ClickHouse 启动和关闭阶段重写日志级别。[#85967](https://github.com/ClickHouse/ClickHouse/pull/85967)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* 聚合函数 `timeSeriesChangesToGrid` 和 `timeSeriesResetsToGrid`。其行为与 `timeSeriesRateToGrid` 类似，接受起始时间戳、结束时间戳、步长和回溯时间窗口等参数，以及时间戳和值这两个参数，但要求每个窗口内至少有 1 个样本，而不是 2 个。计算 PromQL 的 `changes`/`resets`，在由这些参数定义的时间网格中，对每个时间戳统计在指定窗口内样本值发生变化或减小的次数。返回类型为 `Array(Nullable(Float64))`。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010) ([Stephen Chi](https://github.com/stephchi0))。
* 允许用户使用与创建临时表类似的语法（`CREATE TEMPORARY VIEW`）来创建临时视图。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury))。
* 将 CPU 和内存使用情况的警告添加到 `system.warnings` 表中。[#86838](https://github.com/ClickHouse/ClickHouse/pull/86838)（[Bharat Nallan](https://github.com/bharatnc)）。
* 在 `Protobuf` 输入中支持 `oneof` 标记。可以使用一个特殊列来指示 oneof 中某一部分是否存在。如果消息包含 [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) 并且设置了 `input_format_protobuf_oneof_presence`，ClickHouse 会填充一个列，用于指示 oneof 中发现了哪个字段。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* 基于 jemalloc 的内部工具改进内存分配分析。现在可以通过配置 `jemalloc_enable_global_profiler` 启用全局 jemalloc 分析器。通过启用配置项 `jemalloc_collect_global_profile_samples_in_trace_log`，抽样得到的全局内存分配和释放信息可以以 `JemallocSample` 类型存储在 `system.trace_log` 中。现在也可以通过设置 `jemalloc_enable_profiler` 为每个查询单独启用 jemalloc 分析器。是否将采样数据存储到 `system.trace_log` 中，可以通过设置 `jemalloc_collect_profile_samples_in_trace_log` 在每个查询粒度上进行控制。将 jemalloc 升级到较新的版本。[#85438](https://github.com/ClickHouse/ClickHouse/pull/85438)（[Antonio Andelic](https://github.com/antonio2368)）。
* 新增一个在删除 Iceberg 表时同时删除文件的设置。修复了 [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211)。[#86501](https://github.com/ClickHouse/ClickHouse/pull/86501)（[scanhex12](https://github.com/scanhex12)）。



#### 实验特性
* 倒排文本索引从头重写，现在可以扩展以支持无法完全放入内存的数据集。[#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ))。
* Join 重排序现在会使用统计信息。可通过设置 `allow_statistics_optimize = 1` 和 `query_plan_optimize_join_order_limit = 10` 启用该功能。[#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991))。
* 支持使用 `alter table ... materialize statistics all` 将表的所有统计信息物化。[#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991))。



#### 性能改进

* 在读取时支持使用 skip 索引过滤数据分片，以减少不必要的索引读取。可通过新设置 `use_skip_indexes_on_data_read` 控制（默认禁用）。用于解决 [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774)。其中部分通用基础工作与 [#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) 共享。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* 添加了 JOIN 顺序优化功能，可以自动重新排序 JOIN 以获得更好的性能（由 `query_plan_optimize_join_order_limit` 设置控制）。请注意，当前的 JOIN 顺序优化对统计信息的支持仍然有限，主要依赖于存储引擎提供的行数估计——更复杂的统计信息收集和基数估计将在未来版本中加入。**如果在升级后遇到 JOIN 查询问题**，可以通过设置 `SET query_plan_use_new_logical_join_step = 0` 临时禁用新的实现，并将问题报告给我们以便排查。**关于 USING 子句中标识符解析的说明**：对 `OUTER JOIN ... USING` 子句中合并列（coalesced column）的解析方式进行了调整，使其行为更加一致：之前，在 OUTER JOIN 中同时选择 USING 列和带限定符的列（`a, t1.a, t2.a`）时，USING 列会被错误地解析为 `t1.a`，导致右表中没有匹配左表的行显示为 0/NULL。现在，来自 USING 子句的标识符始终解析为合并列，而带限定符的标识符解析为非合并列，不受查询中其他标识符存在与否的影响。例如： ```sql
  SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a)
  -- 之前: a=0, t1.a=0, t2.a=2 (不正确 - &#39;a&#39; 被解析为 t1.a)
  -- 之后: a=2, t1.a=0, t2.a=2 (正确 - &#39;a&#39; 为合并列)。
  [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 用于数据湖的分布式 `INSERT SELECT`。[#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* 改进 PREWHERE 对类似 `func(primary_column) = 'xx'` 和 `column in (xxx)` 等条件的优化。[#85529](https://github.com/ClickHouse/ClickHouse/pull/85529)（[李扬](https://github.com/taiyang-li)）。
* 实现了对 JOIN 的重写：1. 如果对于匹配行或未匹配行的过滤条件始终为假，则将 `LEFT ANY JOIN` 和 `RIGHT ANY JOIN` 转换为 `SEMI`/`ANTI` JOIN。该优化由新设置 `query_plan_convert_any_join_to_semi_or_anti_join` 控制。2. 如果对于一侧未匹配行的过滤条件始终为假，则将 `FULL ALL JOIN` 转换为 `LEFT ALL` 或 `RIGHT ALL` JOIN。 [#86028](https://github.com/ClickHouse/ClickHouse/pull/86028) ([Dmitry Novik](https://github.com/novikd))。
* 在执行轻量级删除操作后，垂直合并的性能得到提升。[#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* 在 `LEFT`/`RIGHT` join 中存在大量未匹配行的情况下，略微优化了 `HashJoin` 的性能。[#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat))。
* 基数排序：帮助编译器使用 SIMD 并更好地进行预取。使用动态分派，仅在 Intel CPU 上启用软件预取。延续了 @taiyang-li 在 [https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) 中的工作。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 通过用 `devector` 替代 `deque` 来优化 `MarkRanges`，提升了在包含大量分片的表上的短查询性能。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* 提升了在 join 模式下应用补丁部分时的性能。[#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ))。
* 新增了设置 `query_condition_cache_selectivity_threshold`（默认值：1.0），该设置会将选择性较低的谓词的扫描结果排除在查询条件缓存之外。这样可以在一定程度降低缓存命中率的代价下减少查询条件缓存的内存消耗。[#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai))。
* 降低 Iceberg 写入的内存占用。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).





#### 改进

* 支持在单次插入中向 Iceberg 写入多个数据文件。新增配置项 `iceberg_insert_max_rows_in_data_file` 和 `iceberg_insert_max_bytes_in_data_file` 用于控制相关限制。[#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* 为 Delta Lake 中插入的数据文件新增行数/字节数限制。可通过设置 `delta_lake_insert_max_rows_in_data_file` 和 `delta_lake_insert_max_bytes_in_data_file` 进行控制。[#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在 Iceberg 写入中支持更多类型的分区。此更改解决了 [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206)。[#86298](https://github.com/ClickHouse/ClickHouse/pull/86298)（[scanhex12](https://github.com/scanhex12)）。
* 使 S3 重试策略可配置，并在修改配置 XML 文件时支持对 S3 磁盘设置进行热加载。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* 改进了 S3(Azure)Queue 表引擎，使其在 Zookeeper 连接丢失时也能继续工作，避免可能出现的重复数据。需要启用 S3Queue 设置 `use_persistent_processing_nodes`（可通过 `ALTER TABLE MODIFY SETTING` 修改）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在创建物化视图时，可以在 `TO` 之后使用查询参数，例如：`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table`。[#84899](https://github.com/ClickHouse/ClickHouse/pull/84899)（[Diskein](https://github.com/Diskein)）。
* 当为 `Kafka2` 表引擎指定错误设置时，为用户提供更清晰的指引。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 现在不再支持为 `Time` 类型指定时区（因为这没有实际意义）。[#84689](https://github.com/ClickHouse/ClickHouse/pull/84689)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 简化了 `best_effort` 模式下 Time/Time64 的解析逻辑，并避免了一些 bug。[#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新增 `deltaLakeAzureCluster` 函数（类似于集群模式下的 `deltaLakeAzure`），以及 `deltaLakeS3Cluster` 函数（`deltaLakeCluster` 的别名）。解决了 [#85358](https://github.com/ClickHouse/ClickHouse/issues/85358)。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在普通复制操作中以与备份相同的方式应用 `azure_max_single_part_copy_size` 设置。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* 在 S3 对象存储中，在出现可重试错误时减缓 S3 客户端线程的速度。此更改将之前的设置 `backup_slow_all_threads_after_retryable_s3_error` 扩展至 S3 磁盘，并将其重命名为更通用的 `s3_slow_all_threads_after_retryable_error`。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva))。
* 将设置 allow&#95;experimental&#95;variant/dynamic/json 和 enable&#95;variant/dynamic/json 标记为过时。现在这三种类型都将无条件启用。[#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar))。
* `http_handlers` 现已支持按完整 URL 字符串（`full_url` 指令）进行过滤（包括 scheme 和 host:port）。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新增一个名为 `allow_experimental_delta_lake_writes` 的设置。[#86180](https://github.com/ClickHouse/ClickHouse/pull/86180)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 init.d 脚本中对 systemd 的检测（修复了 “Install packages” 检查）。[#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat)).
* 添加一个新的 `startup_scripts_failure_reason` 维度型指标。该指标用于区分导致启动脚本失败的不同错误类型。尤其是在告警场景下，我们需要区分瞬时错误（例如 `MEMORY_LIMIT_EXCEEDED` 或 `KEEPER_EXCEPTION`）和非瞬时错误。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 支持在 Iceberg 表的分区定义中省略 `identity` 函数。[#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 新增仅为特定日志通道启用 JSON 日志记录的功能，为此将 `logger.formatting.channel` 设置为 `syslog`/`console`/`errorlog`/`log` 之一。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* 允许在 `WHERE` 中使用原生数值类型。它们已经可以作为逻辑函数的参数使用。这简化了 filter-push-down 和 move-to-prewhere 优化。[#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复了在针对具有已损坏元数据的 Catalog 执行 `SYSTEM DROP REPLICA` 时出现的错误。[#86391](https://github.com/ClickHouse/ClickHouse/pull/86391)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 在 Azure 中为磁盘访问检查（`skip_access_check = 0`）添加额外的重试次数，因为为其开通访问权限的过程可能会持续相当长一段时间。[#86419](https://github.com/ClickHouse/ClickHouse/pull/86419)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 将 `timeSeries*()` 函数中的过期窗口设为左开右闭区间。[#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar))。
* 添加 `FailedInternal*Query` 分析事件。[#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude)).
* 修复通过配置文件添加名称中包含句点 (.) 的用户时的处理。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 为查询内存使用添加异步指标（`QueriesMemoryUsage` 和 `QueriesPeakMemoryUsage`）。[#86669](https://github.com/ClickHouse/ClickHouse/pull/86669)（[Azat Khuzhin](https://github.com/azat)）。
* 你可以使用 `clickhouse-benchmark --precise` 选项来更精确地报告 QPS 和其他按时间间隔统计的指标。该选项有助于在查询执行时间与报告间隔 `--delay D` 相当的情况下获得稳定一致的 QPS。[#86684](https://github.com/ClickHouse/ClickHouse/pull/86684)（[Sergei Trifonov](https://github.com/serxa)）。
* 使 Linux 线程的 nice 值可配置，从而为某些线程（合并/变更、查询、物化视图、ZooKeeper 客户端）分配更高或更低的优先级。[#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复具有误导性的“specified upload does not exist”错误，该错误会在多部分上传中由于竞态条件导致原始异常丢失时出现。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* 限制 `EXPLAIN` 查询中的查询计划描述长度。对非 `EXPLAIN` 查询不再计算该描述。新增设置项 `query_plan_max_step_description_length`。[#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 新增对挂起信号进行调优的能力，以尝试解决 `CANNOT_CREATE_TIMER` 错误（针对查询分析器 `query_profiler_real_time_period_ns`/`query_profiler_cpu_time_period_ns`）。同时从 `/proc/self/status` 中收集 `SigQ` 以便自检（如果 `ProcessSignalQueueSize` 接近 `ProcessSignalQueueLimit`，则很可能会出现 `CANNOT_CREATE_TIMER` 错误）。 [#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat)).
* 改进 Keeper 中 `RemoveRecursive` 请求的性能。[#86789](https://github.com/ClickHouse/ClickHouse/pull/86789)（[Antonio Andelic](https://github.com/antonio2368)）。
* 在 JSON 类型输出时，去除 `PrettyJSONEachRow` 中的多余空白字符。[#86819](https://github.com/ClickHouse/ClickHouse/pull/86819)（[Pavel Kruglov](https://github.com/Avogar)）。
* 现在，对于普通的可重写磁盘，在删除目录时，我们会为 `prefix.path` 写入 blob 的大小。[#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin))。
* 支持针对远程 ClickHouse 实例（包括 ClickHouse Cloud）的性能测试。示例用法：`tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在某些已知会分配大量内存（&gt;16MiB）的模块（排序、异步插入、文件日志）中遵守内存限制。[#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* 当将 `network_compression_method` 设置为不受支持的通用编解码器时抛出异常。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* 系统表 `system.query_cache` 现在会返回 *所有* 查询结果缓存条目，而此前只返回共享条目，或者属于同一用户和角色的非共享条目。这样是合理的，因为非共享条目本应不泄露 *查询结果*，而 `system.query_cache` 返回的是 *查询字符串*。这使得该系统表的行为与 `system.query_log` 更加相似。[#87104](https://github.com/ClickHouse/ClickHouse/pull/87104) ([Robert Schulze](https://github.com/rschu1ze))。
* 为 `parseDateTime` 函数启用短路求值。[#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 `system.parts_columns` 中新增 `statistics` 列。[#87259](https://github.com/ClickHouse/ClickHouse/pull/87259)（[Han Fei](https://github.com/hanfei1991)）。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 对于复制数据库和内部复制表，`ALTER` 查询的结果现在只在发起节点上进行验证，从而解决已提交的 `ALTER` 查询可能在其他节点卡住的问题。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 限制 `BackgroundSchedulePool` 中每种类型任务的数量。避免出现所有槽位都被某一类型任务占满、而其他任务发生饥饿的情况，同时避免任务相互等待导致的死锁。该行为通过服务器设置 `background_schedule_pool_max_parallel_tasks_per_type_ratio` 进行控制。[#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在恢复数据库副本时应正确关闭表。若关闭不当，会在恢复数据库副本期间导致某些表引擎出现 `LOGICAL_ERROR`。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* 在为数据库名称生成拼写纠错提示时检查访问权限。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd))。
* 1. 为 Hive 列使用 LowCardinality 2. 在虚拟列之前填充 Hive 列（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所需）3. 在 Hive 的空格式上触发 LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. 修复当 Hive 分区列是唯一列时的检查 5. 断言所有 Hive 列都在 schema 中被指定 6. 对带有 Hive 的 parallel&#95;replicas&#95;cluster 的部分修复 7. 在 Hive 工具的 extractkeyValuePairs 中使用有序容器（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所需）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538)（[Arthur Passos](https://github.com/arthurpassos)）。
* 防止对 `IN` 函数的第一个参数进行不必要的优化，从而避免在使用数组映射时偶发错误。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在写入 Parquet 文件时，Iceberg 源 ID 与 Parquet 名称之间的映射未根据 schema 进行调整。此 PR 针对每个 Iceberg 数据文件处理其对应的 schema，而不是使用当前的 schema。[#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了将读取文件大小与打开文件分离的行为。该问题关联到 [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372)，该变更是为应对 `5.10` 版本之前 Linux 内核中的一个 bug 而引入的。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 在内核层面禁用 IPv6 的系统上（例如将 ipv6.disable 设为 1 的 RHEL），ClickHouse Keeper 不再无法启动。如果初始 IPv6 监听器创建失败，它现在会尝试回退到 IPv4 监听器。[#85901](https://github.com/ClickHouse/ClickHouse/pull/85901)（[jskong1124](https://github.com/jskong1124)）。
* 此 PR 关闭了 [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990)。为 globalJoin 中的并行副本添加了对 TableFunctionRemote 的支持。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* 修复 `OrcSchemaReader::initializeIfNeeded()` 中的空指针问题。此 PR 解决了以下 issue：[#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### 面向用户变更的文档说明。[#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510))。
* 添加校验，仅当 `FROM` 子句中的相关子查询实际使用了外层查询的列时才允许其存在。修复 [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469)。修复 [#85402](https://github.com/ClickHouse/ClickHouse/issues/85402)。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 修复当某列的子列被用于其他列的物化表达式时，对该列执行 `ALTER UPDATE` 的问题。此前，表达式中包含子列的物化列未能被正确更新。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* 禁止修改那些其子列被用于主键或分区表达式的列。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 DeltaLake 存储引擎中使用非默认列映射模式读取子列的问题。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 JSON 中带有 Enum 提示的路径使用错误默认值的问题。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* 对 DataLake Hive catalog URL 进行解析，并加入输入净化。关闭 [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018)。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* 修复在文件系统缓存动态调整大小时出现的逻辑错误。关闭 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122)。关闭 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473)。[#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 DatabaseReplicatedSettings 中将 `logs_to_keep` 的类型改为 `NonZeroUInt64`。[#86142](https://github.com/ClickHouse/ClickHouse/pull/86142)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 如果表（例如 `ReplacingMergeTree`）在创建时设置了 `index_granularity_bytes = 0`，则使用 skip index 的 `FINAL` 查询会导致抛出异常。该问题现已修复。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 消除了 UB，并修复了 Iceberg 分区表达式解析中的问题。[#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在单个 INSERT 语句中同时包含 const 和非 const 块时发生的崩溃。[#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat))。
* 在通过 SQL 创建磁盘时，进程默认会包含来自 `/etc/metrika.xml` 的配置。[#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar))。
* 修复 accurateCastOrNull/accurateCastOrDefault 在从 String 转换为 JSON 时的问题。[#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg 引擎现已支持不含 &#39;/&#39; 的目录。 [#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* 修复在使用 replaceRegex 函数时，当 haystack 为 FixedString 且 needle 为空时引发的崩溃问题。[#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在对 Nullable(JSON) 执行 ALTER UPDATE 时发生的崩溃。[#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `system.tables` 中缺失的列定义。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* 修复从 LowCardinality(Nullable(T)) 向 Dynamic 的类型转换。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复写入 Delta Lake 时的逻辑错误，关闭 [#86175](https://github.com/ClickHouse/ClickHouse/issues/86175)。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在使用 `plain_rewritable` 磁盘从 Azure Blob 存储读取空 blob 时出现的 `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` 错误。[#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复对 Nullable(JSON) 进行 GROUP BY 时的问题。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了物化视图中的一个问题：某个物化视图在被创建、删除后，再次使用相同名称创建时，可能无法正常工作。[#86413](https://github.com/ClickHouse/ClickHouse/pull/86413)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 当通过 *cluster 函数进行读取且所有副本均不可用时，操作将失败。[#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher))。
* 修复由于 `Buffer` 表导致的 `MergesMutationsMemoryTracking` 泄漏问题，并修复在从 `Kafka`（及其他）进行流式读取时的 `query_views_log`。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* 修复在删除别名（Alias）存储引擎的引用表后 `SHOW TABLES` 的展示问题。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复在启用 send&#95;chunk&#95;header 且通过 HTTP 协议调用 UDF 时缺失 chunk 头部的问题。[#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复在启用 jemalloc profile flushes 时可能出现的死锁问题。[#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat))。
* 修复 DeltaLake 表引擎中子列读取问题。关闭 [#86204](https://github.com/ClickHouse/ClickHouse/issues/86204)。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 正确处理回环地址主机 ID，以避免在处理 DDL 任务时发生冲突：[ #86479](https://github.com/ClickHouse/ClickHouse/pull/86479)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复针对包含 numeric/decimal 列的 postgres 数据库引擎表的 detach/attach 操作。[#86480](https://github.com/ClickHouse/ClickHouse/pull/86480)（[Julian Maicher](https://github.com/jmaicher)）。
* 修复 `getSubcolumnType` 中使用未初始化内存的情况。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano)).
* 当以空 `needles` 参数调用函数 `searchAny` 和 `searchAll` 时，现在会返回 `true`（即“匹配所有内容”）。此前会返回 `false`。（问题 [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复在第一个桶为空时函数 `timeSeriesResampleToGridWithStaleness()` 的行为。[#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复由于将 `merge_tree_min_read_task_size` 设置为 0 而导致的崩溃问题。[#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 在读取时，系统会从 Iceberg 元数据中获取每个数据文件的格式（此前是从表参数中获取）。 [#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik)).
* 在关闭过程中刷新日志时忽略异常，使关闭过程更加安全（避免发生 SIGSEGV）。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* 修复 Backup 数据库引擎在包含大小为零的 part 文件的查询中抛出异常的问题。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* 修复在启用 `send_chunk_header` 且通过 HTTP 协议调用 UDF 时缺失的分块头问题。[#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复由于 Keeper 会话过期导致的 S3Queue 逻辑错误：“预期当前处理器 {} 应等于 {}”。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了插入和剪枝中与可空性相关的错误。此更改关闭了 [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407)。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630)（[scanhex12](https://github.com/scanhex12)）。
* 当 Iceberg 元数据缓存被禁用时，请不要禁用文件系统缓存。[#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了 parquet reader v3 中的 “Deadlock in Parquet::ReadManager (single-threaded)” 错误。[#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 ArrowFlight 中 `listen_host` 对 IPv6 的支持问题。[#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar))。
* 修复 `ArrowFlight` 处理程序中的关闭流程。此 PR 修复了 [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596)。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 通过 `describe_compact_output=1` 修复分布式查询。[#86676](https://github.com/ClickHouse/ClickHouse/pull/86676)（[Azat Khuzhin](https://github.com/azat)）。
* 修复窗口定义的解析以及查询参数的应用。[#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat))。
* 修复在使用 `PARTITION BY` 创建表但未使用分区通配符时抛出的异常 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.`，这一用法在 25.8 之前的版本中是可行的。关闭了 [https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567)。[#86748](https://github.com/ClickHouse/ClickHouse/pull/86748)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复并行查询尝试获取同一把锁时出现的 LogicalError。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在 RowBinary 输入格式中将 NULL 写入共享的 JSON 数据的问题，并在 ColumnObject 中添加一些额外的校验。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在使用 `LIMIT` 时空 Tuple 的排列问题。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar))。
* 对于持久化处理节点，不再使用单独的 Keeper 节点。修复了 [https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995) 中的问题。关闭了 [#86406](https://github.com/ClickHouse/ClickHouse/issues/86406)。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 TimeSeries 表引擎导致在复制数据库中创建新副本失败的问题。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复在某些任务缺少特定 Keeper 节点时对 `system.distributed_ddl_queue` 的查询。[#86848](https://github.com/ClickHouse/ClickHouse/pull/86848)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复在解压后数据块末尾进行定位时的问题。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* 处理 Iceberg 迭代器异步执行过程中抛出的异常。[#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了大型预处理过的 XML 配置的保存问题。[#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end))。
* 修复 `system.iceberg_metadata_log` 表中日期字段填充的问题。[#86961](https://github.com/ClickHouse/ClickHouse/pull/86961)（[Daniil Ivanik](https://github.com/divanik)）。
* 修复了在使用 `WHERE` 时 `TTL` 被无限次重新计算的问题。[#86965](https://github.com/ClickHouse/ClickHouse/pull/86965)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复了在使用 `ROLLUP` 和 `CUBE` 修饰符时，`uniqExact` 函数可能导致结果不正确的问题。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在 `parallel_replicas_for_cluster_functions` 设置为 1 时，使用 `url()` 表函数解析表结构的问题。[#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在将 `PREWHERE` 拆分为多个步骤后，正确地对其输出进行类型转换。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了使用 `ON CLUSTER` 子句的轻量级更新。[#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ)).
* 修复某些聚合函数状态与 String 类型参数的兼容性问题。[#87049](https://github.com/ClickHouse/ClickHouse/pull/87049)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了来自 OpenAI 的模型名称无法传递的问题。[#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik))。
* EmbeddedRocksDB：路径必须在 user&#95;files 目录内。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano))。
* 修复 25.1 之前创建的 KeeperMap 表在执行 DROP 查询后仍将数据保留在 ZooKeeper 中的问题。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复在读取 Parquet 时对 Map 和 Array 字段 ID 的处理。 [#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* 修复在惰性物化中读取包含数组大小子列的数组时的问题。[#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复带有 Dynamic 参数的 CASE 函数。[#87177](https://github.com/ClickHouse/ClickHouse/pull/87177)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 CSV 中从空字符串读取空数组的问题。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复非相关 `EXISTS` 可能产生错误结果的问题。该问题出现在将 `execute_exists_as_scalar_subquery` 设为 `1` 时，该设置是在 [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) 中引入的，并影响版本 `25.8`。修复了 [#86415](https://github.com/ClickHouse/ClickHouse/issues/86415)。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 当未配置 iceberg&#95;metadata&#95;log 却尝试获取 Iceberg 调试元数据信息时抛出错误，修复了 nullptr 访问问题。[#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik))。

#### 构建/测试/打包改进

- 修复与 abseil-cpp 20250814.0 的兼容性问题,https://github.com/abseil/abseil-cpp/issues/1923。[#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat))。
- 将独立 WASM 词法分析器的构建置于标志控制之下。[#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复在不支持 `vmull_p64` 指令的旧版 ARM CPU 上的 crc32c 构建问题。[#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos))。
- 使用 `openldap` 2.6.10。[#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 不要尝试在 darwin 上拦截 `memalign`。[#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 使用 `krb5` 1.22.1-final。[#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复 `list-licenses.sh` 中 Rust crate 名称的解包问题。[#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able))。

### ClickHouse 25.8 LTS 版本,2025-08-28 {#258}


#### 向后不兼容的变更
* 对 JSON 中具有不同类型值的数组，推断为 `Array(Dynamic)` 而不是未命名的 `Tuple`。如需使用之前的行为，请禁用设置 `input_format_json_infer_array_of_dynamic_from_array_of_different_types`。[#80859](https://github.com/ClickHouse/ClickHouse/pull/80859)（[Pavel Kruglov](https://github.com/Avogar)）。
* 将 S3 延迟指标迁移到直方图中，以实现统一性和简化。[#82305](https://github.com/ClickHouse/ClickHouse/pull/82305)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在默认表达式中，要求对包含点号的标识符使用反引号包裹，以防止它们被解析为复合标识符。[#83162](https://github.com/ClickHouse/ClickHouse/pull/83162)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 为避免在不使用 analyzer 的情况下进行维护——根据我们的经验，这种情况下存在一些问题（例如在条件中使用 `indexHint()` 时）——惰性物化仅在启用了 analyzer（默认启用）时才会启用。[#83791](https://github.com/ClickHouse/ClickHouse/pull/83791)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在 Parquet 输出格式中，默认将 `Enum` 类型的值写为具有 `ENUM` 逻辑类型的 `BYTE_ARRAY`。[#84169](https://github.com/ClickHouse/ClickHouse/pull/84169)（[Pavel Kruglov](https://github.com/Avogar)）。
* 默认启用 MergeTree 设置 `write_marks_for_substreams_in_compact_parts`。这大幅提升了从新创建的 Compact 部件中读取子列的性能。版本低于 25.5 的服务器将无法读取新的 Compact 部件。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* 之前 `concurrent_threads_scheduler` 的默认值为 `round_robin`，在大量单线程查询（例如 INSERT）存在的情况下，被证明是不公平的。此变更将更安全的替代方案 `fair_round_robin` 调度器设为默认值。[#84747](https://github.com/ClickHouse/ClickHouse/pull/84747)（[Sergei Trifonov](https://github.com/serxa)）。
* ClickHouse 支持 PostgreSQL 风格的 heredoc 语法：`$tag$ string contents... $tag$`，也称为 dollar-quoted 字符串字面量。在之前的版本中，对 tag 的限制较少：可以包含任意字符，包括标点和空白符。这会与同样可以以美元符号开头的标识符产生解析歧义。同时，PostgreSQL 只允许在 tag 中使用单词字符。为解决此问题，我们现在限制 heredoc 的 tag 只能包含单词字符。已关闭 [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731)。[#84846](https://github.com/ClickHouse/ClickHouse/pull/84846)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `azureBlobStorage`、`deltaLakeAzure` 和 `icebergAzure` 函数已更新，以正确校验 `AZURE` 权限。所有集群变体函数（`-Cluster` 函数）现在都会基于各自的非集群对应函数验证权限。此外，`icebergLocal` 和 `deltaLakeLocal` 函数现在会强制执行 `FILE` 权限检查。[#84938](https://github.com/ClickHouse/ClickHouse/pull/84938)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 默认启用 `allow_dynamic_metadata_for_data_lakes` 设置（表引擎级别设置）。[#85044](https://github.com/ClickHouse/ClickHouse/pull/85044)（[Daniil Ivanik](https://github.com/divanik)）。
* 默认不再对 JSON 格式中的 64 位整数加引号。[#74079](https://github.com/ClickHouse/ClickHouse/pull/74079)（[Pavel Kruglov](https://github.com/Avogar)）



#### 新功能

* 已添加对 PromQL 方言的基础支持。要使用它，请在 clickhouse-client 中设置 `dialect='promql'`，通过设置 `promql_table_name='X'` 将其指向 TimeSeries 表，然后执行类似 `rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` 的查询。此外，也可以使用 SQL 包裹 PromQL 查询：`SELECT * FROM prometheusQuery('up', ...);`。目前仅支持 `rate`、`delta` 和 `increase` 这三个函数。不支持一元/二元运算符，也没有 HTTP API。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI 驱动的 SQL 生成现在在环境变量 `ANTHROPIC_API_KEY` 和 `OPENAI_API_KEY` 可用时会自动读取它们，从而支持以零配置方式使用该功能。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik))。
* 通过添加以下内容来实现对 [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) 协议的支持：- 新增表函数 `arrowflight`。[#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600))。
* 现在所有表都支持 `_table` 虚拟列（不仅是使用 `Merge` 引擎的表），这对包含 UNION ALL 的查询尤其有用。[#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 允许在外部聚合/排序中使用任何存储策略（例如 S3 等对象存储）。[#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat))。
* 使用显式指定的 IAM 角色实现 AWS S3 认证。为 GCS 实现 OAuth。这些功能此前仅在 ClickHouse Cloud 中可用，现在已开源。同步了一些接口，例如对象存储连接参数的序列化方式。[#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 支持 Iceberg 表引擎的 position delete。[#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* 支持 Iceberg 等值删除（Equality Deletes）功能。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* 在 `CREATE` 中支持 Iceberg 写入。关闭 [#83927](https://github.com/ClickHouse/ClickHouse/issues/83927)。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 写入支持 Glue Catalog。[#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 用于写入的 Iceberg REST catalog。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 将所有 Iceberg position delete 文件合并到数据文件中。这样可以减少 Iceberg 存储中的 Parquet 文件数量和大小。语法：`OPTIMIZE TABLE table_name`。[#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 为 Iceberg 支持 `DROP TABLE`（从 REST/Glue 目录中删除并移除该表的元数据）。 [#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持在 merge-on-read 格式的 Iceberg 表中执行 ALTER DELETE 变更操作。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 实现对 Delta Lake 的写入支持。关闭 [#79603](https://github.com/ClickHouse/ClickHouse/issues/79603)。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 新增设置 `delta_lake_snapshot_version`，以便在 `DeltaLake` 表引擎中读取指定的快照版本。[#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在元数据（manifest 条目）中写入更多 Iceberg 统计信息（列大小、上下界），以用于最小-最大剪枝。[#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 在 Iceberg 中支持对简单类型的列进行添加/删除/修改操作。[#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg：支持写入 version-hint 文件。此更改关闭了 [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097)。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 由临时用户创建的视图现在会存储对应真实用户的副本，并且在该临时用户被删除后将不再失效。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* 向量相似度索引现已支持二进制量化。二进制量化可显著降低内存消耗，并加速构建向量索引的过程（因为距离计算更快）。此外，现有设置 `vector_search_postfilter_multiplier` 已被弃用，并由更通用的设置 `vector_search_index_fetch_multiplier` 所取代。[#85024](https://github.com/ClickHouse/ClickHouse/pull/85024)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 允许在 `s3` 或 `s3Cluster` 表引擎/函数中使用键值对参数，例如：`s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')`。[#85134](https://github.com/ClickHouse/ClickHouse/pull/85134)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 一个新的系统表，用于保留从 Kafka 等引擎接收的错误消息（即“死信队列”）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn))。
* 引入了用于 Replicated 数据库的新命令 `SYSTEM RESTORE DATABASE REPLICA`，类似于 `ReplicatedMergeTree` 中现有的恢复功能。[#73100](https://github.com/ClickHouse/ClickHouse/pull/73100)（[Konstantin Morozov](https://github.com/k-morozov)）。
* PostgreSQL 协议现已支持 `COPY` 命令。[#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持使用 MySQL 协议的 C# 客户端。由此关闭 [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992)。[#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 为 Hive 分区风格的读写操作提供支持。[#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos))。
* 添加 `zookeeper_connection_log` 系统表，用于存储 ZooKeeper 连接的历史信息。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 服务器端设置 `cpu_slot_preemption` 为工作负载启用抢占式 CPU 调度，并确保在各工作负载之间实现 max-min 公平的 CPU 时间分配。新增用于 CPU 限流的工作负载设置：`max_cpus`、`max_cpu_share` 和 `max_burst_cpu_seconds`。更多详情参见：[https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#80879](https://github.com/ClickHouse/ClickHouse/pull/80879)（[Sergei Trifonov](https://github.com/serxa)）。
* 在达到配置的查询次数或时间阈值后断开 TCP 连接。这有助于在负载均衡器后面的集群节点之间实现更均匀的连接分布。解决了 [#68000](https://github.com/ClickHouse/ClickHouse/issues/68000)。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* 并行副本现在支持在查询时使用投影。[#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。 [#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi))。
* 现在除了 `DESCRIBE (SELECT ...)` 之外，还支持 `DESCRIBE SELECT`。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 强制对 `mysql_port` 和 `postgresql_port` 使用安全连接。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* 用户现在可以使用 `JSONExtractCaseInsensitive`（以及 `JSONExtract` 的其他变体）进行不区分大小写的 JSON 键查找。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* 引入`system.completions`表。解决 [#81889](https://github.com/ClickHouse/ClickHouse/issues/81889)。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m))。
* 新增函数 `nowInBlock64`。示例：`SELECT nowInBlock64(6)` 返回 `2025-07-29 17:09:37.775725`。[#84178](https://github.com/ClickHouse/ClickHouse/pull/84178) ([Halersson Paris](https://github.com/halersson))。
* 向 AzureBlobStorage 添加 extra&#95;credentials，以便使用 client&#95;id 和 tenant&#95;id 进行身份验证。[#84235](https://github.com/ClickHouse/ClickHouse/pull/84235)（[Pablo Marcos](https://github.com/pamarcos)）。
* 新增函数 `dateTimeToUUIDv7`，用于将 DateTime 值转换为 UUIDv7。示例：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` 返回 `0198af18-8320-7a7d-abd3-358db23b9d5c`。[#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich)).
* `timeSeriesDerivToGrid` 和 `timeSeriesPredictLinearToGrid` 聚合函数，用于将数据重新采样到由指定起始时间戳、结束时间戳和步长定义的时间网格中，分别计算类似 PromQL 的 `deriv` 和 `predict_linear`。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0)).
* 新增两个 TimeSeries 函数：- `timeSeriesRange(start_timestamp, end_timestamp, step)`，- `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`。[#85435](https://github.com/ClickHouse/ClickHouse/pull/85435)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 新增了语法 `GRANT READ ON S3('s3://foo/.*') TO user`。[#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit))。
* 新增 `Hash` 输出格式。它会为结果中的所有列和行计算一个单个的哈希值。这对于计算结果的“指纹”非常有用，例如在数据传输成为瓶颈的场景中。示例：`SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` 返回 `e5f9e676db098fdb9530d2059d8c23ef`。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 Keeper Multi 查询中新增设置任意 watch 的支持。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 为 `clickhouse-benchmark` 工具新增了 `--max-concurrency` 选项，可启用逐步增加并行查询数量的模式。[#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* 支持部分聚合指标。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### 实验特性
* 默认启用相关子查询支持，它们不再是实验性功能。[#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd))。
* Unity、Glue、REST 和 Hive Metastore 数据湖目录从实验阶段升级为 beta。[#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator))。
* 轻量级更新和删除从实验阶段升级为 beta。
* 使用向量相似度索引的近似向量搜索现已达到 GA（正式可用）阶段。[#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze))。
* Ytsaurus 表引擎和表函数。[#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 之前，文本索引数据会被拆分为多个段（默认每个段的大小为 256 MiB）。这在构建文本索引时可能降低内存消耗，但会增加磁盘空间占用，并延长查询响应时间。[#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov))。



#### 性能改进

* 实现了新的 Parquet 读取器。一般情况下速度更快，并支持页级过滤下推和 PREWHERE。目前为实验性功能。可通过设置 `input_format_parquet_use_native_reader_v3` 来启用。[#82789](https://github.com/ClickHouse/ClickHouse/pull/82789)（[Michael Kolupaev](https://github.com/al13n321)）。
* 将 Azure 库中官方的 HTTP 传输实现替换为我们自行实现、面向 Azure Blob Storage 的 HTTP 客户端。为该客户端引入了多项设置，这些设置与 S3 的配置相对应。为 Azure 和 S3 都引入了更为激进的连接超时策略。改进了对 Azure profile 事件和指标的观测能力。新客户端默认启用，可在基于 Azure Blob Storage 的冷查询场景下显著降低延迟。旧的 `Curl` 客户端可以通过设置 `azure_sdk_use_native_client=false` 恢复使用。[#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。此前官方的 Azure 客户端实现由于存在从 5 秒到数分钟不等的严重延迟飙升而不适合用于生产环境。我们已经弃用了那套糟糕的实现，并对此感到非常自豪。
* 按文件大小从小到大顺序处理索引。最终索引排序会优先考虑 minmax 和向量索引（分别由于其简单性和选择性），随后才是其他体积较小的索引。在 minmax/向量索引之间比较时，也会优先选择体积更小的索引。[#84094](https://github.com/ClickHouse/ClickHouse/pull/84094)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* 默认启用 MergeTree 的设置 `write_marks_for_substreams_in_compact_parts`。这将显著提升从新创建的 Compact 部分中读取子列的性能。版本低于 25.5 的服务器将无法读取新的 Compact 部分。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* `azureBlobStorage` 表引擎：在可能的情况下缓存并复用托管身份认证令牌，以避免触发限流。[#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak))。
* 如果右表在连接键列上是函数确定的（即右表所有行的连接键值唯一），则 `ALL` `LEFT/INNER` JOIN 将会自动转换为 `RightAny`。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat)).
* 新增 `max_joined_block_size_bytes`，与 `max_joined_block_size_rows` 一起使用，用于限制包含大列的 JOIN 操作的内存使用量。[#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 添加了新的逻辑（由设置 `enable_producing_buckets_out_of_order_in_aggregation` 控制，默认启用），允许在进行内存高效聚合时按非顺序发送部分 bucket。当某些聚合 bucket 的合并时间显著长于其他 bucket 时，该逻辑通过允许发起端在此期间先行合并 bucket id 更高的 bucket 来提升性能。其缺点是可能会增加内存使用量（不应有显著增加）。[#80179](https://github.com/ClickHouse/ClickHouse/pull/80179)（[Nikita Taranov](https://github.com/nickitat)）。
* 引入了 `optimize_rewrite_regexp_functions` 设置（默认启用），当检测到特定正则表达式模式时，允许优化器将某些 `replaceRegexpAll`、`replaceRegexpOne` 和 `extract` 调用重写为更简单、更高效的形式（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* 在哈希 JOIN 主循环之外处理 `max_joined_block_rows`。略微提升 ALL JOIN 的性能。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 优先处理粒度更细的 min-max 索引。关闭 [#75381](https://github.com/ClickHouse/ClickHouse/issues/75381)。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* 使 `DISTINCT` 窗口聚合能够在线性时间内运行，并修复 `sumDistinct` 中的一个缺陷。修复 [#79792](https://github.com/ClickHouse/ClickHouse/issues/79792)。修复 [#52253](https://github.com/ClickHouse/ClickHouse/issues/52253)。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 占用，因此具有更低的延迟。[#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 在并行副本之间分配工作负载时，引入 Rendezvous hashing 以提升缓存局部性。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 为 If 组合子实现 `addManyDefaults`，从而使带有 If 组合子的聚合函数运行得更快。[#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano))。
* 在对多个字符串或数字列进行 `GROUP BY` 时，以列式方式计算序列化键。[#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li))。
* 当并行副本读取时，如果索引分析结果为空范围，则避免执行全表扫描。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* 尝试使用 `-falign-functions=64` 以使性能测试更加稳定。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* 布隆过滤器索引现在可用于形如 `has([c1, c2, ...], column)` 的条件，其中 `column` 不是 `Array` 类型的列。此改进提升了此类查询的性能，使其效率可与使用 `IN` 运算符的查询相媲美。[#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki))。
* 在 CompressedReadBufferBase::readCompressedData 中减少不必要的 memcpy 调用。[#83986](https://github.com/ClickHouse/ClickHouse/pull/83986)（[Raúl Marín](https://github.com/Algunenano)）。
* 通过移除临时数据来优化 `largestTriangleThreeBuckets`。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过简化代码优化字符串反序列化。关闭 [#38564](https://github.com/ClickHouse/ClickHouse/issues/38564)。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复了并行副本最小任务大小的计算方式。[#84752](https://github.com/ClickHouse/ClickHouse/pull/84752)（[Nikita Taranov](https://github.com/nickitat)）。
* 提升了在 `Join` 模式下应用补丁数据片段时的性能。[#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ))。
* 移除零字节。关闭 [#85062](https://github.com/ClickHouse/ClickHouse/issues/85062)。修复了几个次要错误。函数 `structureToProtobufSchema`、`structureToCapnProtoSchema` 没有正确写入零终止字节，而是使用了换行符。这会导致输出中缺少换行符，并且在使用依赖零字节的其他函数（例如 `logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero` 以及 `encrypt`/`decrypt`）时可能导致缓冲区溢出。`regexp_tree` 字典布局不支持处理包含零字节的字符串。函数 `formatRowNoNewline` 在使用 `Values` 格式或其他行尾不带换行符的格式调用时，会错误地截断输出的最后一个字符。函数 `stem` 存在异常安全问题，在极少数场景下可能导致内存泄漏。函数 `initcap` 对 `FixedString` 参数的处理不正确：如果同一数据块中前一个字符串以单词字符结尾，它无法在当前字符串开头识别出单词起始位置。修复了 Apache `ORC` 格式的一个安全漏洞，该漏洞可能导致未初始化内存被泄露。更改了函数 `replaceRegexpAll` 及其对应别名 `REGEXP_REPLACE` 的行为：现在即使前一次匹配已处理整条字符串，它仍然可以在字符串末尾再进行一次空匹配，例如在 `^a*|a*$` 或 `^|.*` 这类情况下——这与 JavaScript、Perl、Python、PHP、Ruby 的语义一致，但与 PostgreSQL 的语义不同。对许多函数的实现进行了简化和优化。若干函数的文档此前有误，现已修正。请注意，对于 String 列以及包含 String 列的复杂类型，`byteSize` 的输出已经改变（从每个空字符串 9 字节变为每个空字符串 8 字节），这是正常的。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在仅为返回单行而进行常量物化时，对其进行了优化。[#85071](https://github.com/ClickHouse/ClickHouse/pull/85071)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过 delta-kernel-rs 后端改进并行文件处理。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新增了一个设置项 `enable_add_distinct_to_in_subqueries`。启用后，ClickHouse 会在分布式查询的 `IN` 子句中自动为子查询添加 `DISTINCT`。这可以显著减少在分片之间传输的临时表大小，并提升网络效率。注意：这是一个权衡——虽然网络传输量减少了，但每个节点上需要进行额外的合并（去重）工作。仅当网络传输成为瓶颈且可以接受合并带来的开销时，才启用此设置。[#81908](https://github.com/ClickHouse/ClickHouse/pull/81908)（[fhw12345](https://github.com/fhw12345)）。
* 降低对可执行用户自定义函数的查询内存跟踪开销。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* 在存储引擎 `DeltaLake` 中实现内部的 `delta-kernel-rs` 过滤（统计信息与分区裁剪）。[#84006](https://github.com/ClickHouse/ClickHouse/pull/84006)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 以更细粒度地禁用依赖于实时更新列或通过 patch parts 更新列的 skipping 索引。现在，skipping 索引只会在受实时变更或 patch parts 影响的 parts 中被禁用；此前，这些索引会在所有 parts 中被禁用。[#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ))。
* 为加密命名集合的 encrypted&#95;buffer 分配所需的最小内存量。[#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos))。
* 改进了对 Bloom filter 索引（regular、ngram 和 token）的支持：当第一个参数是常量数组（集合），第二个参数是被索引的列（子集）时，即可利用这些索引，从而实现更高效的查询执行。[#84700](https://github.com/ClickHouse/ClickHouse/pull/84700)（[Doron David](https://github.com/dorki)）。
* 减少 Keeper 中存储锁的竞争。[#84732](https://github.com/ClickHouse/ClickHouse/pull/84732)（[Antonio Andelic](https://github.com/antonio2368)）。
* 为 `WHERE` 补充此前缺失的 `read_in_order_use_virtual_row` 支持。这样，在包含未能完全下推到 `PREWHERE` 的过滤条件的查询中，可以跳过读取更多的数据片段。 [#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 支持以异步方式从 Iceberg 表中遍历对象，而无需为每个数据文件单独显式存储这些对象。[#85369](https://github.com/ClickHouse/ClickHouse/pull/85369)（[Daniil Ivanik](https://github.com/divanik)）。
* 将非相关的 `EXISTS` 作为标量子查询执行。这允许使用标量子查询缓存并对结果进行常量折叠，从而有利于索引。为兼容性起见，新增设置 `execute_exists_as_scalar_subquery=1`。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。





#### 改进

* 添加 `database_replicated` 设置，用于定义 `DatabaseReplicatedSettings` 的默认值。如果在创建 Replicated DB 的查询语句中未指定该设置，则会使用此设置中的值。[#85127](https://github.com/ClickHouse/ClickHouse/pull/85127)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 使 web UI（play）中的表格列支持调整列宽。[#84012](https://github.com/ClickHouse/ClickHouse/pull/84012)（[Doron David](https://github.com/dorki)）。
* 通过 `iceberg_metadata_compression_method` 设置支持压缩的 `.metadata.json` 文件。该设置支持所有 ClickHouse 压缩方法。关闭了 [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895)。 [#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 `EXPLAIN indexes = 1` 的输出结果中显示要读取的范围数量。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm)).
* 新增用于配置 ORC 压缩块大小的设置，并将其默认值从 64KB 更新为 256KB，以与 Spark 或 Hive 保持一致。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li))。
* 将 `columns_substreams.txt` 文件添加到 Wide 部分，用于跟踪该部分中存储的所有子流。这有助于跟踪 JSON 和 Dynamic 类型中的动态流，从而避免为获取动态流列表（例如用于列大小计算）而读取这些列的样例数据。此外，现在所有动态流都会在 `system.parts_columns` 中体现出来。[#81091](https://github.com/ClickHouse/ClickHouse/pull/81091)（[Pavel Kruglov](https://github.com/Avogar)）。
* 为 `clickhouse format` 添加 CLI 标志 `--show_secrets`，使其默认隐藏敏感数据。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom))。
* 为避免与 `max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server` 限流相关的问题，S3 读写请求现在在 HTTP 套接字级别（而不是在整个 S3 请求级别）进行限流。[#81837](https://github.com/ClickHouse/ClickHouse/pull/81837)（[Sergei Trifonov](https://github.com/serxa)）。
* 允许在窗口函数中，同一列在不同窗口使用不同的排序规则。[#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 新增一个用于模拟、可视化和对比 merge 选择器的工具。[#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa))。
* 当在 `address_expression` 参数中提供集群时，为 `remote*` 表函数添加对并行副本的支持。同时修复了 [#73295](https://github.com/ClickHouse/ClickHouse/issues/73295)。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* 将所有与写入备份文件相关的日志消息级别设置为 TRACE。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 具有异常名称和编解码器的用户自定义函数在 SQL 格式化器中的格式化结果可能不一致。此更改解决了 [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092)。[#83644](https://github.com/ClickHouse/ClickHouse/pull/83644)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 用户现在可以在 JSON 类型中使用 Time 和 Time64 类型。[#83784](https://github.com/ClickHouse/ClickHouse/pull/83784)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 现在，并行副本上的 JOIN 已经使用新的逻辑 JOIN 步骤（join logical step）。若在使用并行副本执行 JOIN 查询时遇到任何问题，请尝试执行 `SET query_plan_use_new_logical_join_step=0` 并提交问题报告。[#83801](https://github.com/ClickHouse/ClickHouse/pull/83801)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复 cluster&#95;function&#95;process&#95;archive&#95;on&#95;multiple&#95;nodes 的兼容性问题。[#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持在 `S3Queue` 表级别更改物化视图插入相关设置。新增了 `S3Queue` 级别设置：`min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views`。默认情况下将使用 profile 级别设置，而 `S3Queue` 级别设置会覆盖这些设置。[#83971](https://github.com/ClickHouse/ClickHouse/pull/83971)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 新增了性能事件 `MutationAffectedRowsUpperBound`，用于显示一次 mutation 中受影响的行数（例如，在 `ALTER UPDATE` 或 `ALTER DELETE` 查询中满足条件的行总数）。[#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ))。
* 使用来自 cgroup 的信息（如果适用，即 `memory_worker_use_cgroup` 和 cgroup 功能可用）来调整内存跟踪器（`memory_worker_correct_memory_tracker`）。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat))。
* MongoDB：字符串到数值类型的隐式解析。此前，如果从 MongoDB 源为 ClickHouse 表中的数值列接收到字符串值，会抛出异常。现在，引擎会尝试自动从字符串中解析出数值。修复 [#81167](https://github.com/ClickHouse/ClickHouse/issues/81167)。 [#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 在 `Nullable` 数值的 `Pretty` 格式中高亮显示数字分组。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard：顶部的工具提示不再溢出其容器。[#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 仪表盘上的点显示效果略有优化。[#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard 现在有了稍微更好看的 favicon。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI：允许浏览器保存密码，同时会记住 URL 的取值。[#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 添加对通过 `apply_to_children` 配置在特定 Keeper 节点上应用额外 ACL 的支持。[#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 MergeTree 中对 Variant 判别器使用 &quot;compact&quot; 序列化方式的问题。之前在某些可以使用该序列化方式的情况下并未使用。[#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* 在数据库复制设置中新增了一个服务器端设置 `logs_to_keep`，用于更改复制数据库的默认 `logs_to_keep` 参数。较低的取值会减少 ZNode 的数量（尤其是在存在大量数据库时），而较高的取值则允许落后的副本在更长时间离线后仍可追上进度。[#84183](https://github.com/ClickHouse/ClickHouse/pull/84183)（[Alexey Khatskevich](https://github.com/Khatskevich)）。
* 添加设置 `json_type_escape_dots_in_keys`，用于在解析 JSON 类型时转义 JSON 键名中的点。该设置默认关闭。[#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar))。
* 在检查 EOF 之前先检查连接是否已被取消，以防止从已关闭的连接读取数据。修复了 [#83893](https://github.com/ClickHouse/ClickHouse/issues/83893)。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 Web UI 中略微改进了文本选中效果的配色。差异仅在暗色模式下选中的表格单元格中较为明显。在此前的版本中，文本与选中背景之间的对比度不足。[#84258](https://github.com/ClickHouse/ClickHouse/pull/84258) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 通过简化内部检查，改进了服务器关闭期间对客户端连接的处理。[#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 新增了设置 `delta_lake_enable_expression_visitor_logging`，用于关闭表达式访问器日志，因为在调试时，即便只使用 test 日志级别，这些日志也可能过于冗长。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 现在会同时上报 cgroup 级和系统级的指标。cgroup 级的指标命名为 `CGroup&lt;Metric&gt;`，而操作系统级的指标（从 procfs 收集）命名为 `OS&lt;Metric&gt;`。[#84317](https://github.com/ClickHouse/ClickHouse/pull/84317)（[Nikita Taranov](https://github.com/nickitat)）。
* Web UI 中的图表略有改进。变化不大，但确实更好了一些。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 Replicated 数据库设置 `max_retries_before_automatic_recovery` 的默认值更改为 10，以便在某些情况下加快恢复速度。[#84369](https://github.com/ClickHouse/ClickHouse/pull/84369)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复在使用查询参数时的 CREATE USER 语句格式（即 `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。[#84376](https://github.com/ClickHouse/ClickHouse/pull/84376)（[Azat Khuzhin](https://github.com/azat)）。
* 引入 `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor`，用于在备份和恢复操作期间配置 S3 重试退避策略。[#84421](https://github.com/ClickHouse/ClickHouse/pull/84421)（[Julia Kartseva](https://github.com/jkartseva)）。
* 修复 S3Queue 有序模式：在调用关闭后更早退出。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持写入 Iceberg 以便可由 pyiceberg 读取。[#84466](https://github.com/ClickHouse/ClickHouse/pull/84466)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在将 `IN` / `GLOBAL IN` 过滤条件下推到键值存储主键（例如 EmbeddedRocksDB、KeeperMap）时，允许对 `IN` 集合中的值进行类型转换。[#84515](https://github.com/ClickHouse/ClickHouse/pull/84515)（[Eduard Karacharov](https://github.com/korowa)）。
* 将 chdig 升级到 [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1)。[#84521](https://github.com/ClickHouse/ClickHouse/pull/84521)（[Azat Khuzhin](https://github.com/azat)）。
* 在执行 UDF 期间发生的低级错误现在统一使用错误码 `UDF_EXECUTION_FAILED`，而之前可能会返回不同的错误码。[#84547](https://github.com/ClickHouse/ClickHouse/pull/84547)（[Xu Jia](https://github.com/XuJia0210)）。
* 向 KeeperClient 添加 `get_acl` 命令。[#84641](https://github.com/ClickHouse/ClickHouse/pull/84641)（[Antonio Andelic](https://github.com/antonio2368)）。
* 为数据湖表引擎添加对快照版本的支持。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton))。
* 为 `ConcurrentBoundedQueue` 的大小添加一个维度指标，并使用队列类型（即队列的用途）和队列 ID（即当前队列实例随机生成的 ID）作为标签。[#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `system.columns` 表现在为现有的 `name` 列提供了名为 `column` 的别名。[#84695](https://github.com/ClickHouse/ClickHouse/pull/84695)（[Yunchi Pang](https://github.com/yunchipang)）。
* 新增 MergeTree 设置项 `search_orphaned_parts_drives`，用于限定查找孤立数据分片的范围，例如仅在具有本地元数据的磁盘上进行查找。[#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn))。
* 在 Keeper 中添加 4LW 命令 `lgrq`，用于开启或关闭对已接收请求的日志记录。[#84719](https://github.com/ClickHouse/ClickHouse/pull/84719)（[Antonio Andelic](https://github.com/antonio2368)）。
* 以大小写不敏感的方式匹配 external auth forward&#95;headers。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` 工具现在支持与 ZooKeeper 的加密连接。[#84764](https://github.com/ClickHouse/ClickHouse/pull/84764)（[Roman Vasin](https://github.com/rvasin)）。
* 向 `system.errors` 新增格式字符串列。此列用于在告警规则中根据相同错误类型进行分组。[#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 将 `clickhouse-format` 更新为接受 `--highlight` 作为 `--hilite` 的别名。- 将 `clickhouse-client` 更新为接受 `--hilite` 作为 `--highlight` 的别名。- 更新 `clickhouse-format` 文档以反映此更改。[#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 修复 Iceberg 复杂类型按字段 ID 读取时的问题。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 新增一个 `backup_slow_all_threads_after_retryable_s3_error` 配置项，用于在由于 `SlowDown` 等错误引发的重试风暴期间，在检测到一次可重试错误后放慢所有线程的速度，从而降低对 S3 的压力。[#84854](https://github.com/ClickHouse/ClickHouse/pull/84854)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在复制数据库中，跳过为非追加类型的 RMV DDL 创建和重命名旧的临时表。[#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 通过 `keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` 和 `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` 按条目数量限制 Keeper 日志条目缓存大小。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* 允许在不受支持的架构上使用 `simdjson`（此前会导致 `CANNOT_ALLOCATE_MEMORY` 错误）。 [#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat))。
* 异步日志：支持调整限制并添加自检功能。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* 收集所有需要移除的对象，以通过一次对象存储删除操作完成移除。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg 目前对 positional delete 文件的实现会将所有数据都保存在内存（RAM）中。如果 positional delete 文件很大（这种情况很常见），开销会非常高。我的实现则只在内存中保留 Parquet delete 文件的最后一个行组（row-group），大大降低了开销。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* chdig：修复屏幕残留问题，修复在编辑器中编辑查询后发生的崩溃，在 `path` 中搜索 `editor`，更新到 [25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1)。[#85341](https://github.com/ClickHouse/ClickHouse/pull/85341)（[Azat Khuzhin](https://github.com/azat)）。
* 为 Azure 配置添加缺失的 `partition_columns_in_data_file`。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos))。
* 在函数 `timeSeries*ToGrid` 中允许步长为零。这是 [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) 的一部分。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 添加了 `show_data_lake_catalogs_in_system_tables` 开关，用于控制在 `system.tables` 中添加数据湖表。解决了 [#85384](https://github.com/ClickHouse/ClickHouse/issues/85384)。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 已在 `remote_fs_zero_copy_zookeeper_path` 中添加对宏展开的支持。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme)).
* clickhouse-client 中的 AI 呈现效果会略有改进。[#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在旧部署中默认启用 trace&#95;log.symbolize。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 在复合标识符处理方面支持解析更多情况，特别是提升了 `ARRAY JOIN` 与旧分析器的兼容性。引入新设置 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` 以保持旧有行为。 [#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在通过 `system.columns` 获取表列大小信息时忽略 `UNKNOWN_DATABASE`。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* 为补丁分片中的未压缩字节总量新增了限制（表级设置 `max_uncompressed_bytes_in_patches`）。这可以防止在执行轻量级更新后 `SELECT` 查询显著变慢，并防止轻量级更新的潜在滥用。[#85641](https://github.com/ClickHouse/ClickHouse/pull/85641)（[Anton Popov](https://github.com/CurtizJ)）。
* 向 `system.grants` 添加一个 `parameter` 列，用于标识 `GRANT READ/WRITE` 的来源类型以及 `GRANT TABLE ENGINE` 的表引擎。[#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复在 `CREATE DICTIONARY` 查询的列列表中，在带参数的列（例如 `Decimal(8)`) 之后出现的尾随逗号的解析问题。修复了 [#85586](https://github.com/ClickHouse/ClickHouse/issues/85586)。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 为 `nested` 函数添加对内部数组的支持。[#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 由外部库进行的所有内存分配现在都对 ClickHouse 的内存跟踪器可见，并会被正确计入。这可能会导致某些查询报告的内存使用量看起来有所“增加”，或者出现 `MEMORY_LIMIT_EXCEEDED` 错误。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。



#### Bug 修复（官方稳定版中用户可见的错误行为）



* 此 PR 修复了通过 REST 目录查询 Iceberg 表时的元数据解析问题。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* 修复 DDLWorker 和 DatabaseReplicatedDDLWorker 中 markReplicasActive 的处理。[#81395](https://github.com/ClickHouse/ClickHouse/pull/81395)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 在解析失败时修复 Dynamic 列的回滚行为。[#82169](https://github.com/ClickHouse/ClickHouse/pull/82169)（[Pavel Kruglov](https://github.com/Avogar)）。
* 如果以全为常量的输入调用函数 `trim`，现在会生成一个常量输出字符串。（缺陷 [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复在启用 `optimize_syntax_fuse_functions` 时出现的重复子查询逻辑错误，关闭 [#75511](https://github.com/ClickHouse/ClickHouse/issues/75511)。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在启用查询条件缓存（设置 `use_query_condition_cache`）时，带有 `WHERE ... IN (<subquery>)` 子句的查询结果不正确的问题。[#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you))。
* 此前，`gcs` 函数在使用时不需要任何访问权限。现在在使用时会检查是否具有 `GRANT READ ON S3` 权限。修复了 [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567)。[#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* 在使用 INSERT SELECT 将数据从 s3Cluster() 写入复制的 MergeTree 表时跳过不可用节点。 [#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在 MergeTree 中用于实验性事务的追加写入（write with append）在处理 `plain_rewritable`/`plain` 元数据类型时被直接忽略的问题。[#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 对 Avro schema registry 的身份验证详细信息进行掩码处理，使其对用户或在日志中不可见。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复以下问题：当使用 `add_minmax_index_for_numeric_columns=1` 或 `add_minmax_index_for_string_columns=1` 创建 MergeTree 表时，索引会在后续的 ALTER 操作中被物化，从而导致 Replicated 数据库无法在新副本上正确初始化。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复了 Parquet 写入器针对 Decimal 类型输出错误统计数据（最小值/最大值）的问题。[#83754](https://github.com/ClickHouse/ClickHouse/pull/83754)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复 `LowCardinality(Float32|Float64|BFloat16)` 类型中 NaN 值的排序。 [#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 从备份恢复时，definer 用户可能未被备份，从而导致整个备份失效。为解决此问题，我们将还原过程中目标表创建时的权限检查延后，仅在运行时进行检查。[#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit)).
* 修复因在一次失败的 INSERT 之后连接被留在断开状态而导致客户端崩溃的问题。[#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* 在启用 analyzer 的情况下，允许在 `remote` 表函数的 `view(...)` 参数中引用任意表。修复 [#78717](https://github.com/ClickHouse/ClickHouse/issues/78717)。修复 [#79377](https://github.com/ClickHouse/ClickHouse/issues/79377)。[#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* `jsoneachrowwithprogress` 中的 `onprogress` 回调已与最终化过程同步。[#83879](https://github.com/ClickHouse/ClickHouse/pull/83879)（[Sema Checherinda](https://github.com/CheSema)）。
* 此更改关闭了 [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303)。[#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 colorSRGBToOKLCH/colorOKLCHToSRGB 在 const 与非 const 参数混用时的问题。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 RowBinary 格式中写入包含 NULL 值的 JSON 路径时的问题。[#83923](https://github.com/ClickHouse/ClickHouse/pull/83923)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了从 Date 转换为 DateTime64 时，对超过 2106-02-07 的大值发生溢出的问题。[#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 始终应用 `filesystem_prefetches_limit`（而不只是用于 `MergeTreePrefetchedReadPool`）。[#83999](https://github.com/ClickHouse/ClickHouse/pull/83999)（[Azat Khuzhin](https://github.com/azat)）。
* 修复一个罕见的错误：在执行 `MATERIALIZE COLUMN` 查询时，可能会导致 `checksums.txt` 中出现意外的文件记录，并最终产生被分离的数据分片。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* 修复在使用不等式条件进行 JOIN 时出现的逻辑错误 `Expected single dictionary argument for function`，该错误会在一列为 `LowCardinality` 而另一列为常量时触发。修复问题 [#81779](https://github.com/ClickHouse/ClickHouse/issues/81779)。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在交互模式下启用语法高亮时使用 clickhouse client 会导致崩溃的问题。[#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在查询条件缓存与递归 CTE 结合使用时产生错误结果的问题（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 在定期分片刷新过程中正确处理异常。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 修复在等值比较的两侧操作数类型不同或引用常量时，将过滤条件合并到 JOIN 条件中的问题。修复了 [#83432](https://github.com/ClickHouse/ClickHouse/issues/83432)。[#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* 修复一个罕见的 ClickHouse 崩溃问题：当表具有投影、`lightweight_mutation_projection_mode = 'rebuild'`，并且用户执行轻量级删除操作且删除了表中某个数据块的所有行时。[#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin))。
* 修复由后台取消检测线程导致的死锁。[#84203](https://github.com/ClickHouse/ClickHouse/pull/84203)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复了对无效 `WINDOW` 定义进行无限递归分析的问题，解决了 [#83131](https://github.com/ClickHouse/ClickHouse/issues/83131)。[#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了导致 Bech32 编码和解码结果不正确的错误。之所以最初未能发现该错误，是因为用于测试的在线算法实现存在相同问题。[#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov))。
* 修复了 `array()` 函数中空元组构造不正确的问题。这一修复解决了 [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202)。 [#84297](https://github.com/ClickHouse/ClickHouse/pull/84297)（[Amos Bird](https://github.com/amosbird)）。
* 修复在使用并行副本且包含多个 `INNER` 联接并接着 `RIGHT` 联接的查询中出现的 `LOGICAL_ERROR`。对于此类查询，不要使用并行副本。[#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 此前，在检查粒度是否满足过滤条件时，`set` 索引没有考虑 `Nullable` 列（问题 [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 现在，ClickHouse 可以从 Glue Catalog 中读取表类型被指定为小写的表。[#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin))。
* 在包含 JOIN 或子查询的情况下，不要尝试将表函数替换为其对应的集群变体。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复 `IAccessStorage` 中日志记录器的使用方式。 [#84365](https://github.com/ClickHouse/ClickHouse/pull/84365) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了在对表的所有列进行轻量级更新时的逻辑错误。 [#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ)).
* `DoubleDelta` 编解码器现在只能应用于数值类型的列。具体来说，`FixedString` 列不再支持使用 `DoubleDelta` 进行压缩（修复 [#80220](https://github.com/ClickHouse/ClickHouse/issues/80220)）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 在进行 `MinMax` 索引评估时，与 NaN 值的比较未使用正确的范围。[#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 修复使用惰性物化读取 Variant 列时的问题。[#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar))。
* 将 `zoutofmemory` 设为硬件错误，否则会抛出逻辑错误。参见 [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877)。[#84420](https://github.com/ClickHouse/ClickHouse/pull/84420)（[Han Fei](https://github.com/hanfei1991)）。
* 修复了使用 `no_password` 创建的用户在服务器设置 `allow_no_password` 被更改为 0 后尝试登录时导致的服务器崩溃问题。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复对 Keeper changelog 的乱序写入。之前，我们可能会有正在进行的 changelog 写入，但回滚操作可能会导致目标文件发生并发修改。这会导致日志不一致，并可能造成数据丢失。[#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368))。
* 现在，如果从表中移除了所有 TTL，MergeTree 将不会执行任何与 TTL 相关的操作。[#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin))。
* 之前允许使用带有 LIMIT 的并行分布式 INSERT SELECT，这并不正确，因为它会导致目标表中的数据重复写入。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter))。
* 修复数据湖中基于虚拟列的文件裁剪问题。[#84520](https://github.com/ClickHouse/ClickHouse/pull/84520)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复使用 RocksDB 存储的 Keeper 中的泄漏问题（迭代器未被销毁）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* 修复了 `ALTER MODIFY ORDER BY` 未对排序键中的 TTL 列进行校验的问题。现在在执行 ALTER 操作时，如果在 ORDER BY 子句中使用 TTL 列会被正确拒绝，从而防止潜在的表损坏。[#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 将 25.5 之前版本中 `allow_experimental_delta_kernel_rs` 的取值更改为 `false` 以保持兼容性。[#84587](https://github.com/ClickHouse/ClickHouse/pull/84587) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 不再从 manifest 文件中获取 schema，而是为每个 snapshot 独立存储各自相关的 schema。为每个数据文件根据其对应的 snapshot 推断相关的 schema。此前的行为违反了 Iceberg 规范中关于具有 existing 状态的 manifest 文件条目的规定。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了在 Keeper 将 `rotate_log_storage_interval` 设置为 `0` 时会导致 ClickHouse 崩溃的问题（问题 [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975)）。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637)（[George Larionov](https://github.com/george-larionov)）。
* 修复 S3Queue 中导致报错 “Table is already registered” 的逻辑错误。关闭 [#84433](https://github.com/ClickHouse/ClickHouse/issues/84433)。该问题在合并 [https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) 后出现。[#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 RefreshTask 中从 &#39;view&#39; 获取 zookeeper 时对 &#39;mutex&#39; 加锁。[#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复在将 lazy 列与外部排序一起使用时出现的 `CORRUPTED_DATA` 错误。[#84738](https://github.com/ClickHouse/ClickHouse/pull/84738)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 修复了在存储 `DeltaLake` 中使用 delta-kernel 时的列裁剪问题。修复了 [#84543](https://github.com/ClickHouse/ClickHouse/issues/84543)。[#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 DeltaLake 存储中刷新 delta-kernel 的凭据。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在连接出现问题后会启动多余内部备份的问题。[#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar))。
* 修复了在查询存在延迟的远程数据源时可能导致向量越界的问题。 [#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` 和 `no_op` 分词器在遇到空输入 token 时，不再导致（实验性）文本索引崩溃。[#84849](https://github.com/ClickHouse/ClickHouse/pull/84849)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复了使用 `ReplacingMergeTree` 和 `CollapsingMergeTree` 引擎的表的轻量级更新。[#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* 针对使用 object queue 引擎的表，将所有设置正确存储在表元数据中。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 Keeper 返回的 watch 总数。[#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在版本低于 25.7 的服务器上创建的 `ReplicatedMergeTree` 引擎表的轻量级更新相关问题。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在对使用非复制版 `MergeTree` 引擎的表执行 `ALTER TABLE ... REPLACE PARTITION` 查询后，轻量级更新无法正常工作的问题。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了布尔字面量的列名生成方式，改为使用 &quot;true&quot;/&quot;false&quot; 而不是 &quot;1&quot;/&quot;0&quot;，以防止在查询中布尔字面量与整数字面量之间发生列名冲突。[#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复来自后台调度池和执行器的内存跟踪偏差。[#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat))。
* 修复 Merge 表引擎中可能存在的排序不准确问题。[#85025](https://github.com/ClickHouse/ClickHouse/pull/85025)（[Xiaozhe Yu](https://github.com/wudidapaopao)）。
* 补充 DiskEncrypted 缺失的 API 实现。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 在分布式场景中使用相关子查询时添加检查，以避免崩溃。修复 [#82205](https://github.com/ClickHouse/ClickHouse/issues/82205)。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* 现在 Iceberg 不再尝试在多次 `SELECT` 查询之间缓存相关的快照版本，而是每次都重新解析快照。之前尝试缓存 Iceberg 快照会在使用 Iceberg 表进行时间旅行功能时导致问题。[#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了 `AzureIteratorAsync` 中的内存重复释放问题。 [#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat)).
* 改进在尝试创建使用 JWT 进行身份标识的用户时的错误信息。[#85072](https://github.com/ClickHouse/ClickHouse/pull/85072)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了 `ReplicatedMergeTree` 中补丁 part 的清理问题。此前，轻量级更新的结果在副本上可能会暂时不可见，直到用于物化这些补丁 part 的合并或变更后的数据 part 从其他副本下载完成为止。[#85121](https://github.com/ClickHouse/ClickHouse/pull/85121) ([Anton Popov](https://github.com/CurtizJ))。
* 修复当类型不同时 `mv` 中出现的 `illegal_type_of_argument` 错误。[#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 delta-kernel 实现中的段错误。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在移动元数据文件耗时较长时复制数据库的恢复问题。[#85177](https://github.com/ClickHouse/ClickHouse/pull/85177)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复在 `additional_table_filters expression` 设置中使用 `IN (subquery)` 时出现的 `Not-ready Set` 问题。[#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在执行 SYSTEM DROP REPLICA 查询时移除不必要的 `getStatus()` 调用，修复在后台 DROP 表时抛出 `Shutdown for storage is called` 异常的问题。 [#85220](https://github.com/ClickHouse/ClickHouse/pull/85220) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复 `DeltaLake` 引擎中 delta-kernel 实现的竞争问题。 [#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `DeltaLake` 引擎中禁用 delta-kernel 时读取分区数据的问题。该问题自 25.7 版本起出现（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `CREATE OR REPLACE` 和 `RENAME` 查询中补充了缺失的表名长度检查。[#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复在 Replicated 数据库的新副本上创建 RMV 时，如果 DEFINER 已被删除会导致失败的问题。[#85327](https://github.com/ClickHouse/ClickHouse/pull/85327)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复 Iceberg 对复杂类型的写入。 [#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 不支持为复杂类型写入上下界。 [#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复通过 Distributed 表或 remote 表函数从对象存储相关函数读取数据时的逻辑错误。修复：[#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 修复包含损坏投影的数据部分的备份问题。[#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368))。
* 在正式发布版本中禁止在 projection 中使用 `_part_offset` 列，直至其稳定为止。[#85372](https://github.com/ClickHouse/ClickHouse/pull/85372)（[Sema Checherinda](https://github.com/CheSema)）。
* 修复在对 JSON 执行 ALTER UPDATE 时出现的崩溃和数据损坏问题。[#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar))
* 使用并行副本且启用了反向顺序读取优化的查询可能会产生不正确的结果。[#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* 在 String 反序列化期间出现 MEMORY&#95;LIMIT&#95;EXCEEDED 时，修复可能导致崩溃的未定义行为（UB）。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 修复 KafkaAssignedPartitions 和 KafkaConsumersWithAssignment 指标统计不正确的问题。 [#85494](https://github.com/ClickHouse/ClickHouse/pull/85494) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复了在使用 PREWHERE（显式或自动）时已处理字节统计值被低估的问题。[#85495](https://github.com/ClickHouse/ClickHouse/pull/85495)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复 S3 请求速率降速的提前返回条件：当由于可重试错误导致所有线程暂停时，要启用降速行为，现在只需 `s3_slow_all_threads_after_network_error` 或 `backup_slow_all_threads_after_retryable_s3_error` 其中之一为 true 即可，而不再要求两者同时为 true。 [#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva)).
* 此 PR 修复了通过 REST catalog 查询 Iceberg 表时的元数据解析问题。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* 修复了在异步插入中，当更改 `log_comment` 或 `insert_deduplication_token` 设置时出现的罕见崩溃问题。[#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ))。
* 在使用 HTTP 且内容类型为 multipart/form-data 时，像 date&#95;time&#95;input&#95;format 这样的参数会被忽略。 [#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 `icebergS3Cluster` 和 `icebergAzureCluster` 表函数中的机密信息脱敏处理。[#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复在将 JSON 数值转换为 Decimal 类型时 `JSONExtract` 的精度丢失问题。现在数值型 JSON 值能够保留其精确的小数表示形式，从而避免浮点舍入误差。[#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b)).
* 修复了在同一条 `ALTER` 语句中先执行 `DROP COLUMN` 后再使用 `COMMENT COLUMN IF EXISTS` 时出现的 `LOGICAL_ERROR`。现在，当列在同一语句中已被删除时，`IF EXISTS` 子句会正确跳过对该列的注释操作。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 Delta Lake 从缓存读取计数时的问题。 [#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `coalescing merge tree` 中处理大型字符串时出现的段错误。此更改关闭了 [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582)。[#85709](https://github.com/ClickHouse/ClickHouse/pull/85709)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 Iceberg 写入过程中更新元数据时间戳。[#85711](https://github.com/ClickHouse/ClickHouse/pull/85711) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 将 `distributed_depth` 作为 *Cluster 函数的标志是不正确的，可能会导致数据重复；应改为使用 `client_info.collaborate_with_initiator`。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark 无法读取 position delete 文件。[#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 修复 `send_logs_source_regexp`（在 [#85105](https://github.com/ClickHouse/ClickHouse/issues/85105) 中进行的异步日志重构之后）。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在出现 MEMORY&#95;LIMIT&#95;EXCEEDED 错误时，包含 update&#95;field 的字典可能出现的不一致性。[#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat))。
* 为目标表为 `Distributed` 的并行分布式 `INSERT SELECT` 查询，增加对由 `WITH` 语句定义的全局常量的支持。此前，该查询可能抛出 `Unknown expression identifier` 错误。[#85811](https://github.com/ClickHouse/ClickHouse/pull/85811)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 对 `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` 和 `icebergAzureCluster` 的凭据进行脱敏处理。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* 修复在 `DatabaseReplicated` 数据库中尝试执行 `CREATE ... AS (SELECT * FROM s3Cluster(...))` 时的逻辑错误。[#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `url()` 表函数发出的 HTTP 请求在访问非标准端口时未在 Host 头中正确包含端口号的问题。此修复解决了在使用预签名 URL 访问 S3 兼容服务（例如运行在自定义端口上的 MinIO）时出现的身份验证失败问题，这在开发环境中很常见。（修复 [#85898](https://github.com/ClickHouse/ClickHouse/issues/85898)）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* 现在，在处理非 Delta 表时，Unity Catalog 会忽略包含异常数据类型的 schema。修复了 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699)。[#85950](https://github.com/ClickHouse/ClickHouse/pull/85950)（[alesapin](https://github.com/alesapin)）。
* 修正 Iceberg 中字段的可空属性。 [#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复了 `Replicated` 数据库恢复中的一个错误：当表名包含 `%` 符号时，恢复过程中可能会以不同的名称重新创建该表。[#85987](https://github.com/ClickHouse/ClickHouse/pull/85987)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复在恢复空 `Memory` 引擎表时因 `BACKUP_ENTRY_NOT_FOUND` 错误导致备份恢复失败的问题。[#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva)).
* 在对 Distributed 表执行 ALTER 操作时，增加对 `sharding_key` 的检查。此前不正确的 ALTER 会破坏表定义，并导致服务器在重启时失败。[#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique))。
* 不要创建空的 Iceberg 删除文件。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复由于过大的 setting 值导致 S3Queue 表和副本重启异常的问题。 [#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique))。

#### 构建/测试/打包改进

- 默认在 S3 测试中使用加密磁盘。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- 在集成测试中使用 `clickhouse` 二进制文件以获取未剥离的调试符号。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 将内部 libxml2 从 2.14.4 升级到 2.14.5。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze))。
- 将内部 curl 从 8.14.0 升级到 8.15.0。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze))。
- 现在我们在 CI 中为缓存使用更少的内存,并改进了驱逐机制的测试。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin))。

### ClickHouse 版本 25.7,2025-07-24 {#257}

#### 向后不兼容的变更

- 对 `extractKeyValuePairs` 函数的变更:引入新参数 `unexpected_quoting_character_strategy`,用于控制在读取未加引号的键或值时意外遇到 `quoting_character` 时的处理方式。该值可以是:`invalid`、`accept` 或 `promote`。`invalid` 将丢弃该键并返回到等待键状态。`accept` 将其视为键的一部分。`promote` 将丢弃前一个字符并开始作为带引号的键进行解析。此外,在解析带引号的值后,仅在找到键值对分隔符时才解析下一个键。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos))。
- 在 `countMatches` 函数中支持零字节匹配。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 在生成备份时,除了专用服务器设置(`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server` 和 `max_merges_bandwidth_for_server`)外,还对本地(`max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`)和远程(`max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server`)使用服务器级限流器。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa))。
- 禁止创建没有可插入列的表。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
- 按归档文件内的文件并行化集群函数。在以前的版本中,整个归档文件(如 zip、tar 或 7z)是一个工作单元。添加了新设置 `cluster_function_process_archive_on_multiple_nodes`,默认值为 `true`。如果设置为 `true`,可提高集群函数中处理归档文件的性能。如果在早期版本中使用带归档文件的集群函数,为了兼容性并避免升级到 25.7+ 时出现错误,应将其设置为 `false`。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `SYSTEM RESTART REPLICAS` 查询会导致 Lazy 数据库中的表被唤醒,即使没有访问该数据库的权限,并且这发生在这些表被并发删除时。注意:现在 `SYSTEM RESTART REPLICAS` 只会在您有 `SHOW TABLES` 权限的数据库中重启副本,这是合理的行为。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov))。


#### 新功能

* 为 `MergeTree` 系列表引擎新增了轻量级更新支持。可以通过新的语法来使用轻量级更新：`UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>`。同时基于轻量级更新实现了轻量级删除功能。可以通过设置 `lightweight_delete_mode = 'lightweight_update'` 启用该功能。[#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* 在 Iceberg 模式演进中新增对复杂类型的支持。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 为 Iceberg 表引入对 INSERT 操作的支持。 [#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 按字段 ID 读取 Iceberg 数据文件。这提高了与 Iceberg 的兼容性：字段可以在元数据中被重命名，同时映射到底层 Parquet 文件中的不同名称。此更改修复了 [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065)。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse 现在支持用于 Iceberg 的压缩 `metadata.json` 文件。修复了 [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874)。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* 在 Glue catalog 中增加对 `TimestampTZ` 的支持。这解决了 [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654)。[#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 ClickHouse 客户端中新增 AI 驱动的 SQL 生成功能。用户现在可以通过在查询前添加前缀 `??`，从自然语言描述生成 SQL 查询。支持 OpenAI 和 Anthropic 服务提供商，并具备自动表结构发现功能。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314)（[Kaushik Iska](https://github.com/iskakaushik)）。
* 新增函数，用于将 Geo 类型写入 WKB 格式。[#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 为 sources 引入了两种新的访问类型：`READ` 和 `WRITE`，并弃用了此前所有与 sources 相关的访问类型。之前使用 `GRANT S3 ON *.* TO user`，现在为：`GRANT READ, WRITE ON S3 TO user`。这也可以将 sources 的 `READ` 和 `WRITE` 权限进行拆分，例如：`GRANT READ ON * TO user`，`GRANT WRITE ON S3 TO user`。该特性由设置 `access_control_improvements.enable_read_write_grants` 控制，默认关闭。[#73659](https://github.com/ClickHouse/ClickHouse/pull/73659)（[pufit](https://github.com/pufit)）。
* NumericIndexedVector：新的向量数据结构，基于按位切分（bit-sliced）、Roaring bitmap 压缩实现，配套提供 20 多个用于构建、分析和逐元素算术运算的函数。可压缩存储空间，并加速对稀疏数据执行 join、filter 和聚合操作。实现了 [#70582](https://github.com/ClickHouse/ClickHouse/issues/70582)，并对应 T. Xiong 和 Y. Wang 在 VLDB 2024 发表的论文 [“Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411)。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193)（[FriendLey](https://github.com/FriendLey)）。
* 现在支持工作负载配置项 `max_waiting_queries`。它可用于限制查询队列的大小。如果达到该限制，所有后续查询将被终止并返回 `SERVER_OVERLOADED` 错误。[#81250](https://github.com/ClickHouse/ClickHouse/pull/81250)（[Oleg Doronin](https://github.com/dorooleg)）。
* 新增财务函数：`financialInternalRateOfReturnExtended` (`XIRR`)、`financialInternalRateOfReturn` (`IRR`)、`financialNetPresentValueExtended` (`XNPV`)、`financialNetPresentValue` (`NPV`)。[#81599](https://github.com/ClickHouse/ClickHouse/pull/81599)（[Joanna Hulboj](https://github.com/jh0x)）。
* 添加地理空间函数 `polygonsIntersectCartesian` 和 `polygonsIntersectSpherical`，以检查两个多边形是否相交。[#81882](https://github.com/ClickHouse/ClickHouse/pull/81882)（[Paul Lamb](https://github.com/plamb)）。
* 在 MergeTree 系列表中支持 `_part_granule_offset` 虚拟列。该列表示每一行在其数据 part 中所属 granule/mark 的从零开始的索引。此更改解决了 [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572)。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341) ([Amos Bird](https://github.com/amosbird))。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341) ([Amos Bird](https://github.com/amosbird))
* 新增 SQL 函数 `colorSRGBToOkLCH` 和 `colorOkLCHToSRGB`，用于在 sRGB 和 OkLCH 颜色空间之间进行颜色转换。[#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue)).
* 允许在 `CREATE USER` 查询中对用户名使用参数。[#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein))。
* `system.formats` 表现在包含关于格式的扩展信息，例如 HTTP 内容类型、schema 推断能力等。[#81505](https://github.com/ClickHouse/ClickHouse/pull/81505)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 实验性特性
* 添加了函数 `searchAny` 和 `searchAll`，它们是用于搜索文本索引的通用型工具。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 文本索引现在支持新的 `split` 分词器。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将 `text` 索引的默认索引粒度值更改为 64。在内部基准测试中，这提升了典型测试查询的预期性能。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 位位图按顺序存储一个状态的外出标签，但外出状态会按照它们在哈希表中出现的顺序写入磁盘。因此，从磁盘读取时，标签会指向错误的下一状态。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 为文本索引中的 FST 树 blob 数据启用 Zstd 压缩。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将向量相似度索引提升为 beta 阶段。引入了别名设置 `enable_vector_similarity_index`，必须启用此设置才能使用向量相似度索引。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 移除了与实验性零拷贝复制相关的实验性 `send_metadata` 逻辑。它从未被使用，也没有人维护这段代码。由于甚至没有与之相关的测试，很大概率早就已经失效。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* 将 `StorageKafka2` 集成到 `system.kafka_consumers` 中。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 基于统计信息估算复杂的 CNF/DNF 表达式，例如 `(a < 1 and a > 0) or b = 3`。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### 性能改进

* 引入异步日志记录。当日志输出到较慢的设备时，将不再阻塞查询。[#82516](https://github.com/ClickHouse/ClickHouse/pull/82516)（[Raúl Marín](https://github.com/Algunenano)）。限制队列中保留的最大记录数。[#83214](https://github.com/ClickHouse/ClickHouse/pull/83214)（[Raúl Marín](https://github.com/Algunenano)）。
* 并行分布式 INSERT SELECT 默认启用，并以在每个分片上独立执行 INSERT SELECT 的模式运行，参见 `parallel_distributed_insert_select` 设置。[#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter))。
* 当聚合查询在一个非 `Nullable` 列上只包含一个 `count()` 函数时，聚合逻辑会在哈希表探测阶段被完全内联。这样可以避免分配或维护任何聚合状态，从而显著降低内存占用和 CPU 开销。这在一定程度上解决了 [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982)。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* 通过在仅有一个键列这一常见场景下移除对哈希表的额外循环来优化 `HashJoin` 的性能，同时在 `null_map` 和 `join_mask` 始终为 `true`/`false` 时省略相应检查。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat))。
* 对 `-If` 组合器进行了轻量级优化。 [#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 使用量，从而实现了更低的延迟。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在 `filterPartsByQueryConditionCache` 中遵循 `merge_tree_min_{rows,bytes}_for_seek`，使其与其他按索引过滤的方法保持一致。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* 将 `TOTALS` 步骤之后的流水线改为多线程处理。[#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus))。
* 修复 `Redis` 和 `KeeperMap` 存储的按键值过滤功能。[#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 新增设置项 `min_joined_block_size_rows`（类似于 `min_joined_block_size_bytes`，默认值为 65409），用于控制 JOIN 输入和输出数据块的最小块大小（按行数计）（前提是连接算法支持）。过小的数据块将会被合并。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` 不再会清空所有缓存。[#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过使用等价类删除冗余的 JOIN 操作来优化相关子查询生成的查询计划。如果所有相关列都有等价表达式，并且启用了 `query_plan_correlated_subqueries_use_substitution` 设置，则不会生成 `CROSS JOIN`。 [#82435](https://github.com/ClickHouse/ClickHouse/pull/82435) ([Dmitry Novik](https://github.com/novikd)).
* 当相关子查询被识别为函数 `EXISTS` 的参数时，仅读取所需的列。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* 在查询分析阶段，对查询树的比较进行了小幅提速。[#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在 ProfileEvents 的计数器中添加内存对齐，以减少伪共享现象。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* 来自 [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) 的 `null_map` 和 `JoinMask` 优化已应用于包含多个 OR 条件的 JOIN 场景。此外，还对 `KnownRowsHolder` 数据结构进行了优化。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* 使用普通的 `std::vector<std::atomic_bool>` 作为 join 标志，以避免在每次访问标志时都计算哈希。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* 当 `HashJoin` 使用 `lazy` 输出模式时，不要事先为结果列分配内存。这样做并不理想，尤其是在匹配个数较少的情况下。此外，在连接完成后，我们可以得知精确的匹配个数，从而可以更精确地预分配内存。[#83304](https://github.com/ClickHouse/ClickHouse/pull/83304)（[Nikita Taranov](https://github.com/nickitat)）。
* 在构建 pipeline 时，将端口头中的内存拷贝最小化。原始 [PR](https://github.com/ClickHouse/ClickHouse/pull/70105) 由 [heymind](https://github.com/heymind) 提交。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* 在使用 RocksDB 存储时优化 clickhouse-keeper 的启动。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368)).
* 在创建存储快照数据时避免持有锁，以减少在高并发负载下的锁争用。[#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94))。
* 通过在未发生解析错误时重用序列化器，提高了 `ProtobufSingle` 输入格式的性能。[#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa))。
* 改进管线构建性能，以加速短查询的执行。[#83631](https://github.com/ClickHouse/ClickHouse/pull/83631)（[Raúl Marín](https://github.com/Algunenano)）。
* 优化 `MergeTreeReadersChain::getSampleBlock`，以提升短查询性能。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano)).
* 通过异步请求加快在数据目录中列出表的速度。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* 当启用 `s3_slow_all_threads_after_network_error` 配置时，在 S3 重试机制中引入抖动。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改进

* 将括号着色为多种颜色以提高可读性。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在输入 LIKE/REGEXP 模式时高亮显示其中的元字符。我们已经在 `clickhouse-format` 和 `clickhouse-client` 的回显输出中提供了该功能，现在在命令行提示符中也实现了这一点。[#82871](https://github.com/ClickHouse/ClickHouse/pull/82871)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-format` 和客户端 echo 中的高亮效果将与命令行提示符中的高亮方式相同。[#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 现在允许将 `plain_rewritable` 磁盘用作存储数据库元数据的磁盘。为支持其作为数据库磁盘，在 `plain_rewritable` 中实现了 `moveFile` 和 `replaceFile` 方法。[#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 允许为 `PostgreSQL`、`MySQL` 和 `DataLake` 数据库创建备份。此类数据库的备份只会保存数据库定义，而不会保存其中的数据。[#79982](https://github.com/ClickHouse/ClickHouse/pull/79982)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 将设置 `allow_experimental_join_condition` 标记为已废弃，因为该功能现在始终被允许。[#80566](https://github.com/ClickHouse/ClickHouse/pull/80566)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 将压力指标添加到 ClickHouse 异步指标中。[#80779](https://github.com/ClickHouse/ClickHouse/pull/80779)（[Xander Garbett](https://github.com/Garbett1)）。
* 添加了指标 `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles`，用于跟踪标记缓存中的淘汰情况（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* 按该[规范](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)的要求，支持将 Parquet 枚举类型写为字节数组。 [#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos))。
* 对 `DeltaLake` 表引擎的改进：delta-kernel-rs 提供了 `ExpressionVisitor` API，本 PR 在此基础上进行了实现，并将其用于分区列表达式的转换（它将取代 delta-kernel-rs 中旧的、已弃用的实现，我们之前的代码一直使用的是该旧实现）。未来，这个 `ExpressionVisitor` 还将支持基于统计信息的剪枝，以及一些 Delta Lake 的专有特性。此外，此更改的另一个目的，是在 `DeltaLakeCluster` 表引擎中支持分区剪枝（解析后的表达式结果——ActionsDAG——将被序列化，并与数据路径一起由发起端发送，因为这类用于剪枝的信息只作为元信息存在于数据文件列表中，而数据文件列表只在发起端生成，但剪枝必须在每个读取服务器上应用到实际数据）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在为命名元组推导超类型时，保留元素名称。[#81345](https://github.com/ClickHouse/ClickHouse/pull/81345)（[lgbo](https://github.com/lgbo-ustc)）。
* 在 StorageKafka2 中手动统计已消费的消息数量，以避免依赖之前提交的偏移量。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 新增了 `clickhouse-keeper-utils` 命令行工具，用于管理和分析 ClickHouse Keeper 数据。该工具支持从快照和变更日志中导出状态、分析变更日志文件，以及提取指定的日志范围。[#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 总量和按用户划分的网络限流器永不重置，这确保了 `max_network_bandwidth_for_all_users` 和 `max_network_bandwidth_for_all_users` 限制永远不会被超过。[#81729](https://github.com/ClickHouse/ClickHouse/pull/81729)（[Sergei Trifonov](https://github.com/serxa)）。
* 支持以 GeoParquet 作为输出格式写出数据。[#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 如果某个列当前正受到未完成的数据变更影响，则禁止启动会重命名该列的 `RENAME COLUMN` 修改操作。[#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 在确定是否需要保留连接后，会在所有头部的末尾发送 `Connection` 头。[#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema))。
* 根据 `listen_backlog`（默认值为 4096）调整 TCP 服务器队列长度（默认值为 64）。[#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* 支持在无需重启服务器的情况下，即时重新加载 `max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`。[#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu))。
* 添加支持：可通过 `TRUNCATE TABLE system.warnings` 清空 `system.warnings` 表中的所有告警。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复数据湖集群函数中的分区裁剪问题。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `DeltaLakeCluster` 表函数中读取分区数据的问题。在此 PR 中，集群函数的协议版本已升级，从而允许从发起方向副本发送额外信息。该额外信息包含 `delta-kernel` 的转换表达式，用于解析分区列（以及将来可能涉及的一些其他内容，例如生成列等）。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 函数 `reinterpret` 现在支持转换为 `Array(T)`，其中 `T` 为固定大小的数据类型（问题 [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 现在 Datalake 数据库抛出的异常信息更加清晰易懂。修复了 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211)。[#82304](https://github.com/ClickHouse/ClickHouse/pull/82304) ([alesapin](https://github.com/alesapin))。
* 通过使 `HashJoin::needUsedFlagsForPerRightTableRow` 返回 false 来优化 CROSS JOIN。 [#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc)).
* 允许以 Array(Tuple) 的形式读写 Map 列。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 在 `system.licenses` 中列出各个 [Rust](https://clickhouse.com/blog/rust) crate 的许可证。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano))。
* 现在可以在 S3Queue 表引擎的 `keeper_path` 配置项中使用 `{uuid}` 这样的宏。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Keeper 的改进：通过后台线程在不同磁盘之间移动变更日志（changelog）文件。此前，将 changelog 移动到不同磁盘时，会在移动完成之前全局阻塞 Keeper。如果移动操作耗时较长（例如移动到 S3 磁盘），会导致性能下降。[#82485](https://github.com/ClickHouse/ClickHouse/pull/82485)（[Antonio Andelic](https://github.com/antonio2368)）。
* Keeper 改进：新增配置 `keeper_server.cleanup_old_and_ignore_new_acl`。如果启用，所有节点上的 ACL 都会被清除，同时新请求的 ACL 将被忽略。如果目标是从节点上完全移除 ACL，那么在创建新的快照之前务必保持该配置处于启用状态。[#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368))。
* 新增服务器设置 `s3queue_disable_streaming`，用于在使用 S3Queue 表引擎的表中禁用流式处理。该设置可在不重启服务器的情况下修改。[#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 重构了文件系统缓存的动态调整大小功能，添加了更多日志以便于诊断。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在没有配置文件的情况下，`clickhouse-server` 也会监听 PostgreSQL 端口 9005，与使用默认配置时相同。[#82633](https://github.com/ClickHouse/ClickHouse/pull/82633)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `ReplicatedMergeTree::executeMetadataAlter` 中，我们获取 `StorageID`，并且在不获取 DDLGuard 的情况下尝试调用 `IDatabase::alterTable`。在这段时间内，从技术上讲，我们可能已经将相关表替换为另一张表，因此当我们获取定义时，可能会拿到错误的那一个。为避免这种情况，我们在调用 `IDatabase::alterTable` 时增加了一个单独的检查，以确保 UUID 匹配。[#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 在附加使用只读远程磁盘的数据库时，需要将表的 UUID 手动添加到 DatabaseCatalog 中。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 禁止在 `NumericIndexedVector` 中使用 `nan` 和 `inf`。修复了 [#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) 以及其他一些问题。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 不要在 `X-ClickHouse-Progress` 和 `X-ClickHouse-Summary` HTTP 头字段格式中省略零值。[#82727](https://github.com/ClickHouse/ClickHouse/pull/82727)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Keeper 改进：支持为 world:anyone ACL 设置特定权限。[#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* 在 SummingMergeTree 中，不允许对显式列入“求和列”列表的列执行 `RENAME COLUMN` 或 `DROP COLUMN` 操作。关闭 [#81836](https://github.com/ClickHouse/ClickHouse/issues/81836)。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 提高从 `Decimal` 到 `Float32` 的转换精度。实现从 `Decimal` 到 `BFloat16` 的转换。修复 [#82660](https://github.com/ClickHouse/ClickHouse/issues/82660)。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中的滚动条看起来会稍微更美观一些。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 使用内嵌配置的 `clickhouse-server` 将通过提供 HTTP OPTIONS 响应来支持 Web UI 的使用。 [#82870](https://github.com/ClickHouse/ClickHouse/pull/82870) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在配置中新增了为路径指定额外 Keeper ACL 的支持。若要为某个特定路径添加额外 ACL，可在配置中的 `zookeeper.path_acls` 下进行定义。[#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368))。
* 现在将基于可见部分的快照来构建变更快照。同时，快照中使用的变更计数器将根据所包含的变更重新计算。[#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 当 Keeper 因软内存上限而拒绝写入时，添加 ProfileEvent。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* 向 `system.s3queue_log` 添加 `commit_time` 和 `commit_id` 列。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在某些情况下，我们需要让指标具备多个维度。例如，与其只用一个计数器，不如按错误代码统计失败的合并或变更操作次数。为此，引入了 `system.dimensional_metrics`，它正是用于这个目的，并新增了第一个名为 `failed_merges` 的维度化指标。[#83030](https://github.com/ClickHouse/ClickHouse/pull/83030)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在 ClickHouse 客户端中汇总未知设置的警告，并将其作为摘要记录到日志中。[#83042](https://github.com/ClickHouse/ClickHouse/pull/83042)（[Bharat Nallan](https://github.com/bharatnc)）。
* 当发生连接错误时，ClickHouse 客户端现在会报告本地端口号。[#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` 中的错误处理略有改进。如果 `/sys/block` 目录存在但不可访问，服务器将启动，但不会监控块设备。已关闭 [#79229](https://github.com/ClickHouse/ClickHouse/issues/79229)。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在关闭普通表之后再关闭 SystemLogs（并且在系统表之前，而不是早于普通表）。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为 `S3Queue` 的关闭流程添加日志。[#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持将 `Time` 和 `Time64` 解析为 `MM:SS`、`M:SS`、`SS` 或 `S`。[#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 当 `distributed_ddl_output_mode='*_only_active'` 时，不再等待那些复制延迟超过 `max_replication_lag_to_enqueue` 的新副本或恢复副本。这样有助于避免在新副本完成初始化或恢复后变为活动状态，但在初始化期间积累了大量复制日志的情况下出现 `DDL task is not finished on some hosts` 错误。另外，实现了 `SYSTEM SYNC DATABASE REPLICA STRICT` 查询，该查询会一直等待，直到复制日志滞后降到 `max_replication_lag_to_enqueue` 以下。 [#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 不要在异常信息中输出过长的表达式操作描述。关闭 [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164)。[#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加对 part 前缀和后缀的解析能力，并检查非常量列的覆盖情况。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在使用命名集合时，将 ODBC 和 JDBC 中的参数名统一。 [#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand))。
* 当存储处于关闭过程中时，`getStatus` 会抛出 `ErrorCodes::ABORTED` 异常。此前，这会导致 select 查询失败。现在我们会捕获 `ErrorCodes::ABORTED` 异常并有意将其忽略。[#83435](https://github.com/ClickHouse/ClickHouse/pull/83435)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 为 part&#95;log 中的 `MergeParts` 条目的 profile events 添加进程资源指标（例如 `UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds`）。[#83460](https://github.com/ClickHouse/ClickHouse/pull/83460)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 Keeper 中默认启用 `create_if_not_exists`、`check_not_exists`、`remove_recursive` 特性标志，以支持新的请求类型。[#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368))。
* 在服务器关闭过程中，在关闭任何表之前，先关闭 S3（Azure 等）队列流式处理。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `JSON` 输入格式中支持将 `Date`/`Date32` 作为整数使用。[#83597](https://github.com/ClickHouse/ClickHouse/pull/83597)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 在加载和添加 projection 的某些场景下，对异常信息进行了优化，使其更易于阅读。[#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* 为 `clickhouse-server` 新增一个配置选项，用于跳过二进制校验和完整性检查。解决 [#83637](https://github.com/ClickHouse/ClickHouse/issues/83637)。[#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复 `clickhouse-benchmark` 中 `--reconnect` 选项错误的默认值。该默认值在 [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) 中被误改。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 `CREATE DICTIONARY` 语句格式不一致的问题。关闭 [#82105](https://github.com/ClickHouse/ClickHouse/issues/82105)。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复当 TTL 包含 `materialize` 函数时的格式不一致问题。解决 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复了在子查询中包含例如 INTO OUTFILE 等输出选项时，`EXPLAIN AST` 格式不一致的问题。关闭 [#82826](https://github.com/ClickHouse/ClickHouse/issues/82826)。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在不允许使用别名的上下文中，修复带别名的括号表达式格式化不一致的问题。关闭 [#82836](https://github.com/ClickHouse/ClickHouse/issues/82836)。关闭 [#82837](https://github.com/ClickHouse/ClickHouse/issues/82837)。 [#82867](https://github.com/ClickHouse/ClickHouse/pull/82867) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在将聚合函数状态与 IPv4 相乘时使用正确的错误代码。关闭 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817)。[#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复文件系统缓存中的逻辑错误：“Having zero bytes but range is not finished”。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当 TTL 导致行数减少时，重新计算 min-max 索引，以确保依赖该索引的算法（例如 `minmax_count_projection`）的正确性。此更改解决了 [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091)。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* 对于包含 `ORDER BY ... LIMIT BY ... LIMIT N` 组合的查询，当 ORDER BY 以 PartialSorting 方式执行时，计数器 `rows_before_limit_at_least` 现在反映的是被 LIMIT 子句消耗的行数，而不是排序转换阶段消耗的行数。[#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 修复在使用包含交替且首个分支为非字面量的正则表达式，通过 token/ngram 索引进行过滤时出现的 granule 过度跳过问题。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* 修复了在使用 `<=>` 运算符与 Join 存储时出现的逻辑错误，现在查询会返回正确的错误代码。[#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复将 `loop` 函数与 `remote` 函数族一起使用时发生的崩溃问题。确保在 `loop(remote(...))` 中 LIMIT 子句能够生效。[#80299](https://github.com/ClickHouse/ClickHouse/pull/80299)（[Julia Kartseva](https://github.com/jkartseva)）。
* 修复 `to_utc_timestamp` 和 `from_utc_timestamp` 函数在处理 Unix 纪元（1970-01-01）之前和最大日期（2106-02-07 06:28:15）之后的日期时的不正确行为。现在，这些函数会分别将值正确限制在纪元起始时间和最大日期。[#80498](https://github.com/ClickHouse/ClickHouse/pull/80498)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* 对于某些使用并行副本执行的查询，读取顺序优化可以在发起端应用，但无法在远程节点上应用。这会导致发起端的并行副本协调器与远程节点采用不同的读取模式，从而造成逻辑错误。[#80652](https://github.com/ClickHouse/ClickHouse/pull/80652)（[Igor Nikonov](https://github.com/devcrafter)）。
* 修复在将列类型更改为 Nullable 后物化投影时出现的逻辑错误。[#80741](https://github.com/ClickHouse/ClickHouse/pull/80741)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在更新 TTL 时，`TTL GROUP BY` 中 TTL 重算错误的问题。[#81222](https://github.com/ClickHouse/ClickHouse/pull/81222)（[Evgeniy Ulasik](https://github.com/H0uston)）。
* 修复了 Parquet 布隆过滤器错误地将条件 `WHERE function(key) IN (...)` 当作 `WHERE key IN (...)` 处理的问题。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了在合并过程中发生异常时，`Aggregator` 中可能出现的崩溃问题。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了 `InterpreterInsertQuery::extendQueryLogElemImpl`，在需要时为数据库名和表名添加反引号（例如，当名称包含 `-` 等特殊字符时）。 [#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu)).
* 修复在 `transform_null_in=1` 时，左侧参数为 null 且子查询结果为非可空列时 `IN` 的执行问题。[#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar))。
* 在从已有表读取数据时，不在默认值/materialize 表达式执行过程中校验实验性/可疑类型。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 TTL 表达式中使用字典时合并过程中出现的 “Context has expired” 错误。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* 修复 cast 函数的单调性问题。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi)).
* 修复在处理标量相关子查询时未读取必需列的问题。修复了 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 在此前的版本中，服务器在处理对 `/js` 的请求时返回了过多的内容。由此关闭了 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前，`MongoDB` 表引擎定义可以在 `host:port` 参数中包含路径部分，但该路径部分会被静默忽略。`MongoDB` 集成会拒绝加载此类表。通过此修复，*在 `MongoDB` 引擎使用五个参数时，我们允许加载此类表并忽略路径部分*，并使用参数中提供的数据库名称。*注意：* 此修复不会应用于新建的表，或使用 `mongo` 表函数的查询，也不会应用于字典源和命名集合。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复了在合并过程中发生异常时，`Aggregator` 中可能出现的崩溃问题。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在查询中仅使用常量别名列时的过滤分析。修复了 [#79448](https://github.com/ClickHouse/ClickHouse/issues/79448)。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在 TTL 中对 GROUP BY 和 SET 使用相同列时出现的 LOGICAL&#95;ERROR 及后续崩溃问题。[#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复密钥脱敏中对 S3 表函数参数的校验逻辑，防止可能出现的 `LOGICAL_ERROR`，关闭 [#80620](https://github.com/ClickHouse/ClickHouse/issues/80620)。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复 Iceberg 中的数据竞争问题。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `DatabaseReplicated::getClusterImpl`。如果 `hosts` 的第一个元素（或前几个元素）的 `id == DROPPED_MARK`，且同一分片没有其他元素，则 `shards` 的第一个元素会是空向量，从而导致 `std::out_of_range`。[#82093](https://github.com/ClickHouse/ClickHouse/pull/82093) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复 `arraySimilarity` 中的复制粘贴错误，禁止使用 `UInt32` 和 `Int32` 作为权重类型。更新测试和文档。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 修复在使用 `arrayJoin` 且带有 `WHERE` 条件和 `IndexSet` 的查询中出现的 `Not found column` 错误。[#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复 Glue Catalog 集成中的缺陷。现在 ClickHouse 可以读取包含嵌套数据类型的表，其中部分子列为 Decimal 类型，例如：`map<string, decimal(9, 2)>`。修复了 [#81301](https://github.com/ClickHouse/ClickHouse/issues/81301)。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114) ([alesapin](https://github.com/alesapin))。
* 修复在 25.5 版本中通过 [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) 引入的 SummingMergeTree 性能下降问题。[#82130](https://github.com/ClickHouse/ClickHouse/pull/82130) ([Pavel Kruglov](https://github.com/Avogar))。
* 通过 URI 传递设置时，以最后一个值为准。[#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 Iceberg 中出现的 &quot;Context has expired&quot; 错误。 [#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* 在服务器内存吃紧时，修复远程查询可能出现的死锁问题。[#82160](https://github.com/ClickHouse/ClickHouse/pull/82160)（[Kirill](https://github.com/kirillgarbar)）。
* 修复了在将 `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 函数应用于大数时出现的溢出问题。[#82165](https://github.com/ClickHouse/ClickHouse/pull/82165)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 修复表依赖中的一个错误，该错误会导致物化视图漏掉 INSERT 查询。[#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复建议线程与主客户端线程之间可能出现的数据竞争。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* 现在 ClickHouse 可以在模式演化之后从 Glue 目录读取 Iceberg 表。修复了 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272)。[#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 修复异步指标设置 `asynchronous_metrics_update_period_s` 和 `asynchronous_heavy_metrics_update_period_s` 的验证逻辑。[#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复在含有多个 JOIN 的查询中解析匹配器时出现的逻辑错误，关闭 [#81969](https://github.com/ClickHouse/ClickHouse/issues/81969)。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 为 AWS ECS 令牌添加过期时间，使其可以重新加载。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `CASE` 函数在处理 `NULL` 参数时的一个错误。[#82436](https://github.com/ClickHouse/ClickHouse/pull/82436)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复客户端中的数据竞争问题（通过不使用全局上下文）以及 `session_timezone` 覆盖行为（之前如果在 `users.xml`/客户端选项中将 `session_timezone` 设置为非空，而在查询上下文中设置为空，则会使用 `users.xml` 中的值，这是不正确的；现在查询上下文将始终优先于全局上下文）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 修复在外部表引擎中为缓存缓冲区禁用边界对齐的功能。该功能在 [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) 中被误改导致失效。[#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在将键进行类型转换后与键值存储进行 JOIN 时发生的崩溃。[#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复在 logs/query&#95;log 中隐藏命名集合值的问题，解决了 [#82405](https://github.com/ClickHouse/ClickHouse/issues/82405)。[#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在终止会话时日志记录过程中可能发生的崩溃问题，因为 `user_id` 有时可能为空。[#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在解析 Time 时可能导致 msan 问题的情况。已修复以下问题：[#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 禁止将 `threadpool_writer_pool_size` 设为 0，以防止服务器操作发生阻塞。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在分析涉及关联列的行策略表达式时触发的 `LOGICAL_ERROR`。[#82618](https://github.com/ClickHouse/ClickHouse/pull/82618)（[Dmitry Novik](https://github.com/novikd)）。
* 在 `enable_shared_storage_snapshot_in_query = 1` 时，修复 `mergeTreeProjection` 表函数中对父元数据的不正确使用。对应问题 [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634)。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 函数 `trim{Left,Right,Both}` 现在支持类型为 `FixedString(N)` 的输入字符串。例如，`SELECT trimBoth(toFixedString('abc', 3), 'ac')` 现在可以正常执行。[#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 AzureBlobStorage 中，对于原生复制，我们会比较身份验证方法；如果在此过程中出现异常，已更新代码以回退到读取并复制的方式（即非原生复制）。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 修复在元素为空时 `groupArraySample`/`groupArrayLast` 的反序列化问题（如果输入为空，反序列化可能会跳过部分二进制数据，从而在读取数据时导致数据损坏，并在 TCP 协议中出现 UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER）。这不影响数字和日期时间类型。[#82763](https://github.com/ClickHouse/ClickHouse/pull/82763)（[Pedro Ferreira](https://github.com/PedroTadim)）。
* 修复空 `Memory` 表备份的问题，该问题会导致恢复备份失败并报 `BACKUP_ENTRY_NOT_FOUND` 错误。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复 `union/intersect/except_default_mode` 重写中的异常安全问题。关闭 [#82664](https://github.com/ClickHouse/ClickHouse/issues/82664)。[#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 跟踪异步表加载作业的数量。如果存在正在运行的作业，则不要在 `TransactionLog::removeOldEntries` 中更新 `tail_ptr`。[#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复 Iceberg 中的数据竞争。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* 启用 `use_skip_indexes_if_final_exact_mode` 优化（在 25.6 中引入）时，可能会因 `MergeTree` 引擎设置/数据分布的不同而无法选择合适的候选范围。该问题现已解决。[#82879](https://github.com/ClickHouse/ClickHouse/pull/82879) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在从 AST 解析类型为 SCRAM&#95;SHA256&#95;PASSWORD 的认证数据时设置 salt 值。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 在使用非缓存型 Database 实现时，对应表的元数据会在列返回且引用失效后被删除。[#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01))。
* 修复在包含对使用 `Merge` 引擎的表进行 `JOIN` 表达式的查询中，过滤条件被错误修改的问题。修复了 [#82092](https://github.com/ClickHouse/ClickHouse/issues/82092)。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 QueryMetricLog 中的 LOGICAL&#95;ERROR：Mutex 不能为空。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复了在将格式化符 `%f` 与可变长度格式化符（例如 `%M`）一起使用时，函数 `formatDateTime` 输出不正确的问题。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复在启用 analyzer 时，由于后续查询总是从视图中读取所有列而导致的性能下降问题。修复了 [#81718](https://github.com/ClickHouse/ClickHouse/issues/81718)。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在只读磁盘上恢复备份时具有误导性的错误信息。[#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva))。
* 在创建没有依赖关系的表时不再检查循环依赖。此更改解决了在创建成千上万张表的用例中出现的性能下降问题，该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) 中引入的。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了负的 Time 值被隐式读取到表中的问题，并改进了文档以避免产生歧义。[#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 不要在 `lowCardinalityKeys` 函数中使用共享字典中无关的部分。[#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在物化视图中使用子列时出现的回归问题。相关修复：[#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)、[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复由于异常的 INSERT 操作后连接保持在断开状态而导致客户端崩溃的问题。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 修复在计算包含空列的数据块大小时出现的崩溃。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 UNION 查询中 Variant 类型可能导致的崩溃。[#83295](https://github.com/ClickHouse/ClickHouse/pull/83295)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 clickhouse-local 中处理不受支持的 SYSTEM 查询时出现的 LOGICAL&#95;ERROR。[#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046))。
* 修复 S3 客户端的 `no_sign_request`。它可用于显式禁止对 S3 请求进行签名。也可以通过基于 endpoint 的设置为特定 endpoint 单独配置该选项。[#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复了在启用 CPU 调度的情况下，以设置 &#39;max&#95;threads=1&#39; 在负载下执行的查询可能发生崩溃的问题。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* 修复在 CTE 定义引用另一个具有相同名称的表表达式时触发的 `TOO_DEEP_SUBQUERIES` 异常问题。[#83413](https://github.com/ClickHouse/ClickHouse/pull/83413)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在执行 `REVOKE S3 ON system.*` 时的错误行为，该命令会错误地撤销 `*.*` 的 S3 权限。此更改修复了 [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417)。 [#83420](https://github.com/ClickHouse/ClickHouse/pull/83420) ([pufit](https://github.com/pufit))。
* 不要在查询之间共享 async&#95;read&#95;counters。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat)).
* 当子查询包含 FINAL 子句时禁用并行副本。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 修复在配置设置 `role_cache_expiration_time_seconds` 时出现的轻微整数溢出问题（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* 修复了在 [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) 中引入的一个错误。在向带有 definer 的物化视图（MV）插入数据时，权限检查应使用该 definer 的权限授予。此修复解决了 [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951)。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* 禁用针对 Iceberg 数组元素和 Iceberg Map 值（包括其所有嵌套子字段）的基于范围的文件剪枝。[#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik))。
* 修复在将文件缓存用作临时数据存储时可能出现的文件缓存未初始化错误。[#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc))。
* Keeper 修复：在会话关闭时删除临时节点后，正确更新 watch 总数。[#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复与 max&#95;untracked&#95;memory 相关的错误内存问题。[#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* 在某些极端情况下，带有 UNION ALL 的 INSERT SELECT 可能导致空指针解引用。此更改修复了 [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618)。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止 max&#95;insert&#95;block&#95;size 取值为 0，因为这可能导致逻辑错误。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在 `block_size_bytes=0` 时 `estimateCompressionRatio()` 出现的死循环。[#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat))。
* 修复 `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` 指标（此前它们被计入不带 `Cache` 前缀的指标中）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730) ([Azat Khuzhin](https://github.com/azat))。
* 修复在关闭 `BackgroundSchedulePool` 期间，由于在任务中 join 线程而可能导致的异常终止，以及（在单元测试中）可能出现的挂起问题。[#83769](https://github.com/ClickHouse/ClickHouse/pull/83769)（[Azat Khuzhin](https://github.com/azat)）。
* 引入向后兼容设置，使新的分析器在发生名称冲突时可以在 WITH 子句中引用外层别名。修复 [#82700](https://github.com/ClickHouse/ClickHouse/issues/82700)。[#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在关闭过程中，由于在清理 library bridge 时递归锁定上下文而导致的死锁问题。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### 构建/测试/打包改进

- 为 ClickHouse 词法分析器构建一个最小化的 C 库(10 KB)。这是 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 所需的。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。为独立词法分析器添加测试,添加测试标签 `fasttest-only`。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
- 为 Nix 子模块输入添加检查。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复在本地主机上运行集成测试时可能出现的一系列问题。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135) ([Oleg Doronin](https://github.com/dorooleg))。
- 在 Mac 和 FreeBSD 上编译 SymbolIndex。(但它仅在 ELF 系统、Linux 和 FreeBSD 上运行)。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 将 Azure SDK 升级到 v1.15.0。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
- 将 google-cloud-cpp 的存储模块添加到构建系统。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881) ([Pablo Marcos](https://github.com/pamarcos))。
- 修改 clickhouse-server 的 `Dockerfile.ubuntu` 以符合 Docker 官方库的要求。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 针对 [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158) 的后续修复,解决上传构建到 `curl clickhouse.com` 的问题。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 在 `clickhouse/clickhouse-server` 和官方 `clickhouse` 镜像中添加 `busybox` 二进制文件和安装工具。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 添加了对 `CLICKHOUSE_HOST` 环境变量的支持以指定 ClickHouse 服务器主机,与现有的 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 环境变量保持一致。这使得配置更加便捷,无需直接修改客户端或配置文件。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659) ([Doron David](https://github.com/dorki))。

### ClickHouse 版本 25.6, 2025-06-26 {#256}

#### 向后不兼容的变更

- 以前,函数 `countMatches` 会在第一个空匹配处停止计数,即使模式接受它。为了解决这个问题,`countMatches` 现在在出现空匹配时通过前进一个字符来继续执行。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 次要变更:强制 `backup_threads` 和 `restore_threads` 服务器设置为非零值。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano))。
- 次要变更:修复 `bitNot` 对 `String` 的处理,将在内部内存表示中返回一个以零结尾的字符串。这不应影响任何用户可见的行为,但作者希望强调此变更。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat))。


#### 新功能

* 新增数据类型：`Time` ([H]HH:MM:SS) 和 `Time64` ([H]HH:MM:SS[.fractional])，以及一些基本的类型转换函数和用于与其他数据类型交互的函数。为现有函数 `toTime` 增加了兼容性相关的设置。目前可通过设置 `use_legacy_to_time` 来保留旧行为。[#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。支持 Time/Time64 之间的比较。[#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新的 CLI 工具 [`chdig`](https://github.com/azat/chdig/) —— 用于 ClickHouse 的类 `top` 风格 TUI 界面，已作为 ClickHouse 的一部分提供。[#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* 为 `Atomic` 和 `Ordinary` 数据库引擎添加对 `disk` 设置的支持，用于指定用于存储表元数据文件的磁盘。[#80546](https://github.com/ClickHouse/ClickHouse/pull/80546)（[Tuan Pham Anh](https://github.com/tuanpach)）。这使得可以从外部来源附加数据库。
* 一种新的 MergeTree 类型，`CoalescingMergeTree` —— 该引擎在后台合并时会采用第一个非 Null 值。此更改解决了 [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869)。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* 支持读取 WKB（“Well-Known Binary” 是一种用于以二进制形式编码多种几何类型的格式，广泛用于 GIS 系统）的函数。参见 [#43941](https://github.com/ClickHouse/ClickHouse/issues/43941)。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* 为工作负载新增了查询槽位调度功能，详情参见 [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling)。[#78415](https://github.com/ClickHouse/ClickHouse/pull/78415)（[Sergei Trifonov](https://github.com/serxa)）。
* `timeSeries*` 辅助函数，用于在处理时序数据时加速某些场景：- 将数据按指定的起始时间戳、结束时间戳和步长重采样到时间网格上 - 计算类 PromQL 的 `delta`、`rate`、`idelta` 和 `irate`。[#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger))。
* 添加 `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 函数以基于 map 中的值进行过滤，并在基于布隆过滤器的索引中支持这些函数。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus))。
* 现在，设置约束可以指定一组禁止的取值。[#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc))。
* 添加了一个设置项 `enable_shared_storage_snapshot_in_query`，用于在单个查询中让所有子查询共享同一个存储快照。这样可以确保即使在查询中多次引用同一张表时，也能从该表获得一致的读取结果。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* 支持将 `JSON` 列写入 `Parquet`，并直接从 `Parquet` 读取 `JSON` 列。[#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 为 `pointInPolygon` 添加对 `MultiPolygon` 的支持。[#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 为通过 `deltaLakeLocal` 表函数查询挂载到本地文件系统的 Delta 表新增支持。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* 新增设置 `cast_string_to_date_time_mode`，允许在从 String 执行 cast 时选择 DateTime 的解析模式。[#80210](https://github.com/ClickHouse/ClickHouse/pull/80210)（[Pavel Kruglov](https://github.com/Avogar)）。例如，您可以将其设置为尽力而为（best effort）模式。
* 新增了用于处理比特币 Bech 算法的 `bech32Encode` 和 `bech32Decode` 函数（问题 [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* 添加用于分析 MergeTree 数据片段名称的 SQL 函数。[#80573](https://github.com/ClickHouse/ClickHouse/pull/80573)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* 通过引入新的虚拟列 `_disk_name`，允许根据数据分片所在的磁盘过滤查询选中的数据分片。[#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 添加一个包含嵌入式 Web 工具列表的着陆页。当由类似浏览器的用户代理请求时，将会打开该页面。[#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 函数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` 和 `arrayLastIndex` 会过滤掉由过滤表达式返回的 NULL 值。在之前的版本中，不支持 Nullable 类型的过滤结果。修复了 [#81113](https://github.com/ClickHouse/ClickHouse/issues/81113)。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* 现在可以编写 `USE DATABASE name` 来代替 `USE name`。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新增了一个新的系统表 `system.codecs`，用于查看可用的编解码器。（问题 [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)）。[#81600](https://github.com/ClickHouse/ClickHouse/pull/81600)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 支持 `lag` 和 `lead` 窗口函数。解决 [#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) 问题。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 函数 `tokens` 现在支持一个名为 `split` 的新分词器，非常适合处理日志。[#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `clickhouse-local` 中添加对 `--database` 参数的支持。你可以切换到之前创建的数据库。这修复了 [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115)。[#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 实验性特性
* 使用 ClickHouse Keeper 为 `Kafka2` 实现类似 Kafka 再均衡机制的逻辑。对于每个副本，我们支持两种类型的分区锁：永久锁和临时锁。副本会尽可能长时间保持永久锁，在任意时刻，副本上的永久锁数量不超过 `all_topic_partitions / active_replicas_count`（其中 `all_topic_partitions` 是所有分区的总数，`active_replicas_count` 是活动副本的数量），如果超过，副本会释放部分分区。一些分区会被副本临时持有。副本上的临时锁最大数量会动态变化，以便给其他副本机会将部分分区转为永久锁。在更新临时锁时，副本会释放其所有临时锁并尝试重新获取其他一些分区。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726) ([Daria Fomina](https://github.com/sinfillo)).
* 对实验性文本索引的改进：通过键值对支持显式参数。目前支持的参数包括一个必需的 `tokenizer`，以及两个可选的 `max_rows_per_postings_list` 和 `ngram_size`。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 之前，全文索引不支持 `packed` 存储，因为段 id 是通过在磁盘上读写 (`.gin_sid`) 文件进行在线更新的。对于 `packed` 存储，不支持从未提交的文件中读取值，这会导致问题。现在这一问题已经解决。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 类型为 `gin` 的实验性索引（我不喜欢这个名称，因为它是 PostgreSQL 黑客的内部笑话）已重命名为 `text`。现有类型为 `gin` 的索引仍然可以加载，但在查询中尝试使用它们时会抛出异常（并建议改用 `text` 索引）。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855) ([Robert Schulze](https://github.com/rschu1ze)).



#### 性能改进

* 启用多重投影过滤支持，允许在数据片段（part）级别过滤中使用多个投影。此更改解决了 [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525)。这是继 [#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) 之后实现投影索引的第二步。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343) ([Amos Bird](https://github.com/amosbird))。
* 文件系统缓存默认使用 `SLRU` 缓存策略。[#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 消除查询管道中 Resize 步骤的争用。[#77562](https://github.com/ClickHouse/ClickHouse/pull/77562)（[Zhiguo Zhou](https://github.com/ZhiguoZh)）。
* 引入了一个选项，可以将数据块的（解）压缩和（反）序列化，从原先与网络连接关联的单一线程卸载到多个 pipeline 线程中。该行为由设置 `enable_parallel_blocks_marshalling` 控制。这应当加速在发起端与远程节点之间传输大量数据的分布式查询。 [#78694](https://github.com/ClickHouse/ClickHouse/pull/78694) ([Nikita Taranov](https://github.com/nickitat)).
* 对所有 Bloom 过滤器类型进行了性能优化。[OpenHouse 大会视频](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800)（[Delyan Kratunov](https://github.com/dkratunov)）。
* 在 `UniqExactSet::merge` 中引入了当其中一个集合为空时的快速路径。此外，现在如果左侧集合为两级结构而右侧集合为单级结构，我们将不再对右侧集合执行两级结构转换。[#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat))。
* 在使用两级哈希表时提升内存复用效率并减少缺页错误，以加速 GROUP BY 的执行。[#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn))。
* 避免在查询条件缓存中进行不必要的更新，并减少锁竞争。[#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn))。
* 对 `concatenateBlocks` 进行了一项小幅优化，这也可能有助于并行哈希连接。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 当从主键范围中选择标记范围时，如果主键被函数包裹，则无法使用二分查找。此 PR 放宽了这一限制：当主键被始终单调的函数链包裹时，仍然可以应用二分查找；或者当 RPN 表达式中包含一个恒为真的元素时，也可以应用二分查找。修复了 [#45536](https://github.com/ClickHouse/ClickHouse/issues/45536)。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* 提升 `Kafka` 引擎的关闭速度（在存在多个 `Kafka` 表时去除额外的 3 秒延迟）。[#80796](https://github.com/ClickHouse/ClickHouse/pull/80796) ([Azat Khuzhin](https://github.com/azat))。
* 异步插入：降低内存占用并提升插入查询性能。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* 在日志表被禁用时不对处理器进行性能分析。 [#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。这可以加快极短查询的执行速度。
* 当源数据已经完全符合 `toFixedString` 的要求时，加速其处理。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* 如果用户没有配额限制，则不要处理配额值。[#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。这可以提升非常短查询的执行速度。
* 修复了内存跟踪中的性能回退。[#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321))。
* 在分布式查询中改进分片键的优化。[#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* 并行副本：如果所有读取任务都已分配给其他副本，则避免等待未被使用的慢副本。[#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* 并行副本现在使用单独的连接超时设置，请参阅 `parallel_replicas_connect_timeout_ms`。在此之前，并行副本查询的连接超时使用的是 `connect_timeout_with_failover_ms`/`connect_timeout_with_failover_secure_ms` 设置（默认 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在带日志功能的文件系统中，`mkdir` 操作会写入到文件系统的日志中，并持久化到磁盘上。在磁盘较慢的情况下，这可能会耗费较长时间。将其移出保留锁（reserve lock）的作用域。[#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 将 Iceberg manifest 文件的读取延迟到首次执行读取查询时再进行。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 在适用的情况下，允许将 `GLOBAL [NOT] IN` 谓词移动到 `PREWHERE` 子句中。[#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa))。





#### 改进

* `EXPLAIN SYNTAX` 现在使用新的分析器。它返回从查询树构建的 AST。新增选项 `query_tree_passes`，用于在将查询树转换为 AST 之前控制执行的遍数。[#74536](https://github.com/ClickHouse/ClickHouse/pull/74536)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 Native 格式中为 Dynamic 和 JSON 实现扁平化序列化，使得在无须使用诸如 Dynamic 的 shared variant 和 JSON 的 shared data 等特殊结构的情况下，即可对 Dynamic 和 JSON 数据进行序列化/反序列化。可以通过设置 `output_format_native_use_flattened_dynamic_and_json_serialization` 来启用该序列化方式。该序列化可用于便于不同语言实现的客户端在 TCP 协议下支持 Dynamic 和 JSON。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在出现 `AuthenticationRequired` 错误后刷新 `S3` 凭据。[#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `system.asynchronous_metrics` 中新增了字典相关指标：`DictionaryMaxUpdateDelay` —— 字典更新的最大延迟（秒）。`DictionaryTotalFailedUpdates` —— 自上次成功加载以来，所有字典中发生的失败更新次数。[#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse)).
* 为可能是为保存损坏表而创建的数据库添加一条警告。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 在 `S3Queue`、`AzureQueue` 引擎中添加 `_time` 虚拟列。[#78926](https://github.com/ClickHouse/ClickHouse/pull/78926)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 使控制在 CPU 过载时断开连接的相关设置支持热加载。[#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* 为 Azure Blob Storage 中的普通磁盘在 `system.tables` 中报告的数据路径添加容器前缀，使报告方式与 S3 和 GCP 保持一致。[#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva))。
* 现在，clickhouse-client 和 local 也接受以 `param-<name>`（连字符）作为查询参数名称，除了 `param_<name>`（下划线）之外。这解决了 [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093)。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* 在启用校验和的情况下，从本地向远程 S3 复制数据时，新增了关于带宽优惠的详细警告信息。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu)).
* 之前，当 `input_format_parquet_max_block_size = 0`（一个无效值）时，ClickHouse 会卡死。现在这一问题已被修复。相关修复关闭了 [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394)。[#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* 为 `startup_scripts` 增加 `throw_on_error` 设置：当 `throw_on_error` 为 true 时，除非所有查询都成功完成，否则服务器不会启动。默认情况下，`throw_on_error` 为 false，从而保持原有行为。[#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 允许在任何类型的 `http_handlers` 中添加 `http_response_headers`。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 函数 `reverse` 现在支持 `Tuple` 数据类型，修复了 [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053)。[#80083](https://github.com/ClickHouse/ClickHouse/pull/80083) ([flynn](https://github.com/ucasfl))。
* 解决 [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817)：允许从 `system.zookeeper` 表中获取 `auxiliary_zookeepers` 数据。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146)（[Nikolay Govorov](https://github.com/mrdimidium)）。
* 添加针对服务器 TCP 套接字的异步指标，从而提升可观测性。关闭 [#80187](https://github.com/ClickHouse/ClickHouse/issues/80187)。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 支持将 `anyLast_respect_nulls` 和 `any_respect_nulls` 作为 `SimpleAggregateFunction` 使用。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein)).
* 移除针对复制数据库的不必要的 `adjustCreateQueryForBackup` 调用。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar)).
* 支持在 `clickhouse-local` 中为额外选项（在 `--` 之后的，例如 `-- --config.value='abc'`）省略等号。修复 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292)。[#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `SHOW ... LIKE` 查询中高亮显示元字符。这解决了 [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) 中的问题。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-local` 中将 SQL UDF 持久化，之前创建的函数会在启动时加载。此更改解决了 [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085)。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复执行计划中预处理 DISTINCT 步骤的描述。[#80330](https://github.com/ClickHouse/ClickHouse/pull/80330)（[UnamedRus](https://github.com/UnamedRus)）。
* 允许在 ODBC/JDBC 中使用命名集合。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 用于统计只读和损坏磁盘数量的指标。在 DiskLocalCheckThread 启动时记录相应日志。[#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu))。
* 实现了对带有投影的 `s3_plain_rewritable` 存储的支持。在之前的版本中，移动时，S3 中引用投影的元数据对象不会被更新。修复了 [#70258](https://github.com/ClickHouse/ClickHouse/issues/70258)。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` 命令不再尝试在只读和一次写入磁盘上查找数据分片。由此关闭了 [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430)。[#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 降低了合并分片相关消息的日志级别。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* 更改 Iceberg 表的分区裁剪的默认行为。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* 为索引搜索算法的可观测性新增了两个 ProfileEvents：`IndexBinarySearchAlgorithm` 和 `IndexGenericExclusionSearchAlgorithm`。 [#80679](https://github.com/ClickHouse/ClickHouse/pull/80679) ([Pablo Marcos](https://github.com/pamarcos))。
* 不要在日志中记录关于旧内核不支持 `MADV_POPULATE_WRITE` 的抱怨信息（以避免日志污染）。[#80704](https://github.com/ClickHouse/ClickHouse/pull/80704)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 `TTL` 表达式中新增了对 `Date32` 和 `DateTime64` 的支持。[#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand))。
* 调整 `max_merge_delayed_streams_for_parallel_write` 的兼容性参数值。[#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat))。
* 修复程序崩溃问题：如果在析构函数中尝试删除临时文件（用于将临时数据溢写到磁盘）时抛出异常，可能会导致程序终止。[#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 为 `SYSTEM SYNC REPLICA` 添加 `IF EXISTS` 修饰符。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* 扩展关于 &quot;Having zero bytes, but read range is not finished...&quot; 的异常消息，并在 `system.filesystem_cache` 中新增 finished&#95;download&#95;time 列。[#80849](https://github.com/ClickHouse/ClickHouse/pull/80849)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在将 `EXPLAIN` 与 `indexes = 1` 一起使用时，在其输出中添加搜索算法部分。该部分会显示 “binary search” 或 “generic exclusion search”。[#80881](https://github.com/ClickHouse/ClickHouse/pull/80881)（[Pablo Marcos](https://github.com/pamarcos)）。
* 在 2024 年初，由于新的分析器默认未启用，`prefer_column_name_to_alias` 在 MySQL 处理器中被硬编码为 true。现在，则可以移除这一硬编码。[#80916](https://github.com/ClickHouse/ClickHouse/pull/80916)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 现在，`system.iceberg_history` 会显示 Glue 或 Iceberg REST 等目录中的数据库历史记录。同时，为保持一致性，将 `system.iceberg_history` 中的 `table_name` 和 `database_name` 列重命名为 `table` 和 `database`。[#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin)).
* 允许 `merge` 表函数以只读模式运行，因此在使用它时不再需要 `CREATE TEMPORARY TABLE` 权限。[#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 改进对内存缓存的观测（在 `system.metrics` 中公开缓存相关信息，以替代不完整的 `system.asynchronouse_metrics`）。在 `dashboard.html` 中添加以内存缓存大小（字节）为单位的指标。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` 已重命名为 `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes`。[#81023](https://github.com/ClickHouse/ClickHouse/pull/81023)（[Azat Khuzhin](https://github.com/azat)）。
* 在从 `system.rocksdb` 读取时，忽略使用不支持 `RocksDB` 表的引擎的数据库。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 允许在 `clickhouse-local` 的配置文件中使用 `filesystem_caches` 和 `named_collections`。[#81105](https://github.com/ClickHouse/ClickHouse/pull/81105)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 `INSERT` 查询中 `PARTITION BY` 的高亮显示。在此前的版本中，`PARTITION BY` 不会作为关键字高亮显示。[#81106](https://github.com/ClickHouse/ClickHouse/pull/81106)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中的两个小改进：- 正确处理没有输出的查询，例如 `CREATE`、`INSERT`（此前，这类查询会一直显示加载中的旋转图标）；- 双击表时自动滚动到顶部。[#81131](https://github.com/ClickHouse/ClickHouse/pull/81131)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `MemoryResidentWithoutPageCache` 指标表示服务器进程使用的物理内存量（不包括用户态页缓存），单位为字节。当使用用户态页缓存时，该指标可以更准确地反映实际内存使用情况。当禁用用户态页缓存时，该值等于 `MemoryResident`。[#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* 将客户端、本地服务器、Keeper 客户端和 Disks 应用中手动记录的异常标记为已记录日志，以避免重复记录。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 将 `use_skip_indexes_if_final` 和 `use_skip_indexes_if_final_exact_mode` 的默认值设为 `True`。现在，带有 `FINAL` 子句的查询将使用跳过索引（如果适用）来筛选出候选 granule，并同时读取与匹配主键范围对应的任何其他 granule。需要沿用此前近似/不精确结果行为的用户，可以在经过仔细评估后，将 `use_skip_indexes_if_final_exact_mode` 设置为 `False`。 [#81331](https://github.com/ClickHouse/ClickHouse/pull/81331) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 当 Web UI 中存在多个查询时，会执行光标所在的查询。[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 的后续。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 此 PR 修复了转换函数单调性检查中 `is_strict` 实现存在的问题。目前，一些转换函数（例如 `toFloat64(UInt32)` 和 `toDate(UInt8)`）在本应返回 true 时，却错误地将 `is_strict` 返回为 false。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359)（[zoomxi](https://github.com/zoomxi)）。
* 在检查 `KeyCondition` 是否匹配一个连续区间时，如果键被一个非严格函数链包裹，则可能需要将 `Constraint::POINT` 转换为 `Constraint::RANGE`。例如：`toDate(event_time) = '2025-06-03'` 意味着 `event_time` 的取值区间为：[`2025-06-03 00:00:00`, `2025-06-04 00:00:00`)。此 PR 修复了这一行为。[#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* 如果指定了 `--host` 或 `--port`，则 `clickhouse`/`ch` 别名将调用 `clickhouse-client` 而不是 `clickhouse-local`。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) 的后续更新。修复并关闭 [#65252](https://github.com/ClickHouse/ClickHouse/issues/65252)。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 现在我们已经拥有 keeper 响应时间分布数据，就可以为相关指标调优直方图分桶。[#81516](https://github.com/ClickHouse/ClickHouse/pull/81516)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 添加性能事件 `PageCacheReadBytes`。[#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复文件系统缓存中的逻辑错误：“Having zero bytes but range is not finished”。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii))。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复使用 SELECT EXCEPT 查询的参数化视图。解决了 [#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) 问题。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer：在 `JOIN` 运算中进行列类型提升后修正列投影名称。修复 [#63345](https://github.com/ClickHouse/ClickHouse/issues/63345)。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519)（[Dmitry Novik](https://github.com/novikd)）。
* 在启用 analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier 时，修复了列名冲突时的逻辑错误。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在启用 `allow_push_predicate_ast_for_distributed_subqueries` 时，修复下推谓词中对 CTE 的使用。修复了 [#75647](https://github.com/ClickHouse/ClickHouse/issues/75647)。修复了 [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672)。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了这样一个问题：即使指定的副本不存在，`SYSTEM SYNC REPLICA LIGHTWEIGHT &#39;foo&#39;` 也会报告成功。现在，该命令会在尝试同步之前，先在 Keeper 中正确验证该副本是否存在。[#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd))。
* 修复了一个在非常特定场景下出现的崩溃问题：当在 `ON CLUSTER` 查询的 `CONSTRAINT` 部分中使用 `currentDatabase` 函数时会导致崩溃。此修复关闭了 [#78100](https://github.com/ClickHouse/ClickHouse/issues/78100)。[#79070](https://github.com/ClickHouse/ClickHouse/pull/79070)（[pufit](https://github.com/pufit)）。
* 修复跨服务器查询中外部角色的传递。[#79099](https://github.com/ClickHouse/ClickHouse/pull/79099)（[Andrey Zvonov](https://github.com/zvonand)）。
* 尝试在 SingleValueDataGeneric 中使用 IColumn 来替代 Field。这样可以修复在处理 `Dynamic/Variant/JSON` 类型时，某些聚合函数（例如 `argMax`）返回值错误的问题。[#79166](https://github.com/ClickHouse/ClickHouse/pull/79166)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 Azure Blob Storage 中应用 `use_native_copy` 和 `allow_azure_native_copy` 设置的问题，并更新为仅在凭据匹配时使用原生拷贝，解决了 [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964)。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在检查某列是否为相关列时，关于该列来源作用域未知的逻辑错误。修复了 [#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) 和 [#79451](https://github.com/ClickHouse/ClickHouse/issues/79451)。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在 grouping sets 中使用 ColumnConst 和 Analyzer 时产生错误结果的问题。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* 修复在从分布式表读取且本地副本滞后的情况下，本地分片结果出现重复的问题。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 修正带负号位的 NaN 的排序顺序。[#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 现在 `GROUP BY ALL` 不再考虑 `GROUPING` 部分。[#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 修复了 `TopK` / `TopKWeighted` 函数中不正确的状态合并问题，该问题即使在容量未耗尽时也会导致过大的误差。[#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* 在 `azure_blob_storage` 对象存储中遵守 `readonly` 设置。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复了在使用带有反斜杠转义字符的 `match(column, '^…')` 时出现的查询结果错误和因内存不足导致的崩溃问题。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* 对数据湖禁用 Hive 分区，部分解决了 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937)。[#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* 带有 lambda 表达式的 skip 索引无法生效。修复了当索引定义中的高阶函数与查询中的完全相同时未能应用的问题。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复在副本上从复制日志执行 `ATTACH_PART` 命令附加数据片段时的元数据版本。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 与其他函数不同，可执行用户自定义函数（eUDF）的名称不会被添加到 `system.query_log` 表的 `used_functions` 列中。此 PR 实现了在请求中使用 eUDF 时，将该 eUDF 名称添加到该列中的功能。[#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush))。
* 修复 Arrow 格式中使用 LowCardinality(FixedString) 时的逻辑错误。[#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar))
* 修复从 Merge 引擎读取子列的问题。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 `KeyCondition` 中数值类型比较相关的错误。[#80207](https://github.com/ClickHouse/ClickHouse/pull/80207)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复在对包含投影的表应用惰性物化时出现的 AMBIGUOUS&#95;COLUMN&#95;NAME 错误。[#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter))。
* 修复了在使用隐式投影时，对类似 LIKE &#39;ab&#95;c%&#39; 这类字符串前缀过滤条件的错误计数优化。此修复解决了 [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250)。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* 修复 MongoDB 文档中嵌套数值字段被错误序列化为字符串的问题。移除 MongoDB 文档的最大嵌套深度限制。[#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* 在 Replicated 数据库中对 RMT 执行不那么严格的元数据检查。修复了 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296)。[#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修正 DateTime 和 DateTime64 在 PostgreSQL 存储中的文本表示。[#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 `StripeLog` 表中支持带时区的 `DateTime` 类型。此更改关闭了 [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120)。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当查询计划步骤会改变行数时，禁用对包含非确定性函数的谓词的过滤下推。修复了 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273)。[#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在包含子列的投影中可能出现的逻辑错误和崩溃。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 `ON` 表达式不是简单相等条件时，由逻辑 JOIN 步骤的过滤下推（filter push-down）优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复 [#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) 和 [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848)。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在分区表中按逆序读取键时可能产生错误结果的问题。此修复解决了 [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987)。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* 修复了在具有 Nullable 键且启用了 `optimize_read_in_order` 的表中出现的排序错误。[#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复了当通过 SYSTEM STOP REPLICATED VIEW 暂停视图后，可刷新物化视图在执行 DROP 时会卡住的问题。[#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复在分布式查询中使用常量元组时出现的 `Cannot find column` 错误。[#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在启用 `join_use_nulls` 的 Distributed 表中 `shardNum` 函数的问题。 [#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复在 Merge 引擎中读取仅在部分表中存在的列时产生错误结果的问题。[#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复可能出现的 SSH 协议问题（由 replxx 挂起导致）。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` 表中的时间戳现在应该正确了。[#80711](https://github.com/ClickHouse/ClickHouse/pull/80711)（[Melvyn Peignon](https://github.com/melvynator)）。
* 修复在字典注册失败情况下可能发生的崩溃问题（当 `CREATE DICTIONARY` 因 `CANNOT_SCHEDULE_TASK` 失败时，可能在字典注册表中留下悬空指针，从而在之后导致崩溃）。 [#80714](https://github.com/ClickHouse/ClickHouse/pull/80714) ([Azat Khuzhin](https://github.com/azat)).
* 修复在对象存储表函数中对仅包含单个元素的 enum 通配模式（glob）的处理。[#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 修复了 `Tuple(Dynamic)` 与 `String` 比较函数返回结果类型错误的问题，该问题会导致逻辑错误。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* 为 Unity Catalog 补充缺失的 `timestamp_ntz` 数据类型支持。修复 [#79535](https://github.com/ClickHouse/ClickHouse/issues/79535)，修复 [#79875](https://github.com/ClickHouse/ClickHouse/issues/79875)。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* 修复包含 `IN cte` 的分布式查询中出现的 `THERE_IS_NO_COLUMN` 错误。修复 [#75032](https://github.com/ClickHouse/ClickHouse/issues/75032)。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复外部 ORDER BY 使用过多文件（从而导致内存占用过高）的问题。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* 该 PR 可能会关闭 [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742)。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* 修复了 Kafka 中由于 `get&#95;member&#95;id()` 从 NULL 创建 `std::string` 而导致的崩溃问题（该问题很可能只在连接 broker 失败时出现）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* 在关闭 Kafka 引擎之前正确等待消费者退出（关闭后仍处于活动状态的消费者可能会触发各种调试断言，并且在表已被删除/分离后仍可能在后台继续从 broker 读取数据）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat))。
* 修复 `predicate-push-down` 优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复 [#80443](https://github.com/ClickHouse/ClickHouse/issues/80443)。[#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在带有 USING 的 JOIN 中解析表函数中的星号（*）通配符时的逻辑错误。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复 Iceberg 元数据文件缓存的内存统计问题。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用可为 NULL 的分区键时产生的错误分区。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在启用下推谓词的分布式查询（`allow_push_predicate_ast_for_distributed_subqueries=1`）且源表在查询发起端不存在时出现的 `Table does not exist` 错误。修复了 [#77281](https://github.com/ClickHouse/ClickHouse/issues/77281)。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复带有命名窗口的嵌套函数中的逻辑错误。[#80926](https://github.com/ClickHouse/ClickHouse/pull/80926)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 修复可为空列和浮点列的 extremes 结果。[#80970](https://github.com/ClickHouse/ClickHouse/pull/80970)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 修复从 system.tables 查询时可能发生的崩溃问题（在内存压力较大时更有可能发生）。[#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat))。
* 修复在对其压缩方式由文件扩展名推断的文件执行 truncate 时的原子重命名问题。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复 ErrorCodes::getName。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复了当用户并未拥有所有表的访问权限时，无法在 Unity Catalog 中列出表的问题。现在所有表都会被正确列出，尝试从受限表读取时将抛出异常。[#81044](https://github.com/ClickHouse/ClickHouse/pull/81044)（[alesapin](https://github.com/alesapin)）。
* 现在，在执行 `SHOW TABLES` 查询时，ClickHouse 将忽略来自数据湖目录的错误和异常响应。修复了 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725)。[#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* 修复在 `JSONExtract` 和 JSON 类型解析中从整数解析 `DateTime64` 时的问题。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* 使 `date_time_input_format` 设置体现在模式推断缓存中。[#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在执行 INSERT 时，如果在查询开始之后但在发送列之前表被执行 DROP 操作而导致的崩溃问题。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `quantileDeterministic` 中使用未初始化值的问题。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `metadatastoragefromdisk` 磁盘事务的硬链接数管理。添加测试。[#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* 与其他函数不同，用户定义函数（UDF）的名称不会被添加到 `system.query_log` 表中。此 PR 实现在请求中使用了 UDF 时，将其名称添加到 `used_executable_user_defined_functions` 或 `used_sql_user_defined_functions` 这两列之一。[#81101](https://github.com/ClickHouse/ClickHouse/pull/81101)（[Kyamran](https://github.com/nibblerenush)）。
* 修复了通过 HTTP 协议以文本格式（`JSON`、`Values` 等）插入数据时在省略 `Enum` 字段的情况下可能出现的 `Too large size ... passed to allocator` 错误或崩溃问题。[#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在包含 Sparse 列的 INSERT 数据块被推送到非 MT 的物化视图时出现的 LOGICAL&#95;ERROR。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* 修复在启用跨复制且设置 `distributed_product_mode_local=local` 时出现的 `Unknown table expression identifier` 错误。[#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复了在过滤后对 Parquet 文件行数的错误缓存问题。[#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在使用相对缓存路径时 `fs cache max_size_to_total_space` 设置的配置问题。[#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复了在以 Parquet 格式输出常量元组或映射时导致 clickhouse-local 崩溃的问题。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* 校验从网络接收的数组偏移量。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 修复涉及空表 JOIN 且使用窗口函数的查询中的某些极端情况。该缺陷会导致并行数据流数量爆炸式增长，从而引发 OOM。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* 针对数据湖集群函数（`deltaLakeCluster`、`icebergCluster` 等）的修复：（1）修复在使用旧版 analyzer 与 `Cluster` 函数时，`DataLakeConfiguration` 中可能出现的段错误（segfault）；（2）移除重复的数据湖元数据更新（产生额外的对象存储请求）；（3）修复在未显式指定格式时，对象存储中的多余列举操作（该问题在非集群数据湖引擎中已修复）。[#81300](https://github.com/ClickHouse/ClickHouse/pull/81300)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 使 `force_restore_data` 标志能够恢复丢失的 Keeper 元数据。[#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano))。
* 修复 delta-kernel 中的 region 错误，解决了 [#79914](https://github.com/ClickHouse/ClickHouse/issues/79914)。[#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 禁用 divideOrNull 的不正确 JIT。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano)).
* 修复当 MergeTree 表的分区列名过长时出现的插入错误。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* 已在 [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) 中回溯修复：修复了在合并过程中抛出异常时 `Aggregator` 可能发生的崩溃问题。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 不要在内存中同时存储多个 manifest 文件的内容。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在关闭后台线程池（`background_.*pool_size`）时可能发生的崩溃。[#81473](https://github.com/ClickHouse/ClickHouse/pull/81473)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在向使用 `URL` 引擎的表写入时 `Npy` 格式发生的越界读取问题。该修复关闭了 [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356)。[#81502](https://github.com/ClickHouse/ClickHouse/pull/81502)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 可能会显示 `NaN%`（这是典型的 JavaScript 问题）。 [#81507](https://github.com/ClickHouse/ClickHouse/pull/81507) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在 `database_replicated_enforce_synchronous_settings=1` 时的 `DatabaseReplicated`。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `LowCardinality(Nullable(...))` 类型的排序顺序。[#81583](https://github.com/ClickHouse/ClickHouse/pull/81583)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 如果尚未从套接字完全读取请求，服务器不应保持 HTTP 连接。[#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema))。
* 使标量相关子查询返回可为空的投影表达式结果。修复相关子查询产生空结果集时的处理。[#81632](https://github.com/ClickHouse/ClickHouse/pull/81632)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在对 `ReplicatedMergeTree` 执行 `ATTACH` 时可能出现的 `Unexpected relative path for a deduplicated part` 错误。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* 查询设置 `use_iceberg_partition_pruning` 不会对 Iceberg 存储生效，因为它使用的是全局上下文而不是查询上下文。这并不是很关键，因为它的默认值为 true。此 PR 可以修复该问题。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991)).
* 已在 [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) 中回溯：修复在合并期间，当在 TTL 表达式中使用字典（dict）时出现的 “Context has expired”。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* 为 MergeTree 设置 `merge_max_block_size` 添加校验，以确保其不为零。[#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复 `clickhouse-local` 中导致 `DROP VIEW` 查询卡住的问题。[#81705](https://github.com/ClickHouse/ClickHouse/pull/81705)（[Bharat Nallan](https://github.com/bharatnc)）。
* 修复 `StorageRedis` 在某些情况下的 join。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复当启用旧分析器且使用空的 `USING ()` 时出现的 `ConcurrentHashJoin` 崩溃问题。[#81754](https://github.com/ClickHouse/ClickHouse/pull/81754)（[Nikita Taranov](https://github.com/nickitat)）。
* Keeper 修复：当日志中存在无效日志条目时，阻止提交新的日志条目。此前，如果 leader 错误地应用了一些日志，即使 follower 会检测到摘要不匹配并中止处理，它仍会继续提交新的日志。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在处理标量关联子查询时未读取必要列的问题。修复 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 有人在我们的代码里到处乱塞 Kusto。我已经清理干净了。这就关闭了 [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643)。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在早期版本中，服务器在处理对 `/js` 的请求时会返回过多内容。已关闭 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 之前，`MongoDB` 表引擎定义可以在 `host:port` 参数中包含路径部分，该部分会被静默忽略。`mongodb` 集成会拒绝加载此类表。通过本次修复，*如果 `MongoDB` 引擎有五个参数，我们允许加载此类表并忽略路径部分*，改为使用参数中指定的数据库名称。*注意：* 此修复不适用于新创建的表、使用 `mongo` 表函数的查询，以及字典源和命名集合。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复了在合并过程中出现异常时，`Aggregator` 中可能发生的崩溃问题。[#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* 修复 `arraySimilarity` 中的拷贝粘贴错误，禁止使用 `UInt32` 和 `Int32` 作为权重。更新测试和文档。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* 修复建议线程与主客户端线程之间可能发生的数据竞争。[#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### 构建/测试/打包改进

* 使用 `postgres` 16.9。[#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `OpenSSL` 3.2.4。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `abseil-cpp` 2025-01-27 版本。[#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `mongo-c-driver` 1.30.4。[#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `krb5` 1.21.3-final 版本。[#81453](https://github.com/ClickHouse/ClickHouse/pull/81453)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 使用 `orc` 2.1.2。[#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `grpc` 1.73.0 版本。[#81629](https://github.com/ClickHouse/ClickHouse/pull/81629)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 使用 `delta-kernel-rs` v0.12.1。[#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 `c-ares` 更新到 `v1.34.5`。 [#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 将 `curl` 升级至 8.14 以修复 CVE-2025-5025 和 CVE-2025-4947。[#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit))。
* 将 `libarchive` 升级到 3.7.9，以修复以下漏洞：CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。[#81174](https://github.com/ClickHouse/ClickHouse/pull/81174)（[larryluogit](https://github.com/larryluogit)）。
* 将 `libxml2` 升级到 2.14.3。[#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit)).
* 避免将 vendored Rust 源码复制到 `CARGO_HOME` 中。[#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 通过用我们自己的端点替换 Sentry 库，移除对 Sentry 的依赖。[#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 CI 镜像中更新 Python 依赖以解决 Dependabot 告警。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano)).
* 在启用 Keeper 故障注入时，为提高测试的稳定性，在启动阶段从 Keeper 重试读取复制 DDL 停止标志。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger))。
* 将 Ubuntu archive 的 URL 改为使用 https 协议。[#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano))。
* 更新测试映像中的 Python 依赖项。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot))。
* 为 Nix 构建引入 `flake.nix`。[#81463](https://github.com/ClickHouse/ClickHouse/pull/81463)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了在构建 `delta-kernel-rs` 时需要网络访问的问题。已关闭 [#80609](https://github.com/ClickHouse/ClickHouse/issues/80609)。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。阅读文章 [A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust)。

### ClickHouse 版本 25.5，2025-05-22 {#255}

#### 向后不兼容的变更

- 函数 `geoToH3` 现在按照 (lat, lon, res) 的顺序接受输入（与其他几何函数保持一致）。希望保留之前结果顺序 (lon, lat, res) 的用户可以设置 `geotoh3_argument_order = 'lon_lat'`。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008))。
- 添加文件系统缓存设置 `allow_dynamic_cache_resize`，默认值为 `false`，用于允许动态调整文件系统缓存大小。原因：在某些环境中（ClickHouse Cloud），所有扩展事件都通过重启进程来实现，我们希望明确禁用此功能以更好地控制行为并作为安全措施。此 PR 标记为向后不兼容，因为在旧版本中，动态缓存调整默认启用，无需特殊设置。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii))。
- 移除了对旧版索引类型 `annoy` 和 `usearch` 的支持。这两者长期以来一直是存根，即每次尝试使用这些旧版索引都会返回错误。如果您仍有 `annoy` 和 `usearch` 索引，请删除它们。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze))。
- 移除 `format_alter_commands_with_parentheses` 服务器设置。该设置在 24.2 中引入并默认禁用。在 25.2 中默认启用。由于没有不支持新格式的 LTS 版本，我们可以移除该设置。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 默认启用 `DeltaLake` 存储的 `delta-kernel-rs` 实现。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii))。
- 如果从 `URL` 读取涉及多次重定向，设置 `enable_url_encoding` 将正确应用于链中的所有重定向。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer))。设置 `enble_url_encoding` 的默认值现在设为 `false`。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer))。


#### 新功能

* 在 `WHERE` 子句中支持标量关联子查询。解决了 [#6697](https://github.com/ClickHouse/ClickHouse/issues/6697)。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。在简单场景下支持在投影列表中使用关联子查询。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。现在已覆盖 TPC-H 测试套件的 100%。
* 使用向量相似度索引的向量搜索现已进入 Beta 阶段（此前为实验特性）。[#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `Parquet` 格式中支持地理空间类型，从而解决了 [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317)。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* 新增函数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8`，用于计算“稀疏 n-gram（sparse-ngrams）”——一种用于提取子串以进行索引和搜索的健壮算法。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12)).
* `clickhouse-local`（及其简写别名 `ch`）现在在存在待处理输入数据时，会隐式使用 `FROM table`。这解决了 [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023)。同时，如果未指定 `--input-format` 且处理的是常规文件，则在 clickhouse-local 中会自动推断格式。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加 `stringBytesUniq` 和 `stringBytesEntropy` 函数，用于搜索可能是随机或加密的数据。[#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* 新增用于编码和解码 Base32 的函数。[#79809](https://github.com/ClickHouse/ClickHouse/pull/79809)（[Joanna Hulboj](https://github.com/jh0x)）。
* 新增 `getServerSetting` 和 `getMergeTreeSetting` 函数，解决 #78318 问题。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439) ([NamNguyenHoai](https://github.com/NamHoaiNguyen))。
* 新增 `iceberg_enable_version_hint` 设置，用于利用 `version-hint.text` 文件。[#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche))。
* 支持根据 `LIKE` 关键字筛选，截断数据库中的特定表。[#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 在 `MergeTree` 系列表中支持 `_part_starting_offset` 虚拟列。该列表示所有先前数据部分的累计行数，在查询时基于当前数据部分列表计算。累计值在整个查询执行过程中都会保留，即使在数据部分裁剪之后仍然有效。为支持此行为，相关内部逻辑已进行了重构。[#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird))。
* 添加函数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull`，当右侧参数为零时返回 NULL。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse 向量搜索现在同时支持预过滤和后过滤，并提供相关设置以实现更细粒度的控制。（Issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)）。[#79854](https://github.com/ClickHouse/ClickHouse/pull/79854)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 添加 [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 和 [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 函数。支持对使用 [`bucket transform`](https://iceberg.apache.org/spec/#partitioning) 分区的 `Iceberg` 表进行数据文件剪枝。 [#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。



#### 实验性特性
* 新增 `Time`/`Time64` 数据类型：`Time`（HHH:MM:SS）和 `Time64`（HHH:MM:SS.`<fractional>`），以及一些基础的类型转换（cast）函数和与其他数据类型交互的函数。同时，将已有函数名 `toTime` 更名为 `toTimeWithFixedDate`，因为 `toTime` 函数需要保留给类型转换函数使用。[#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
72459).
* 用于 Iceberg 数据湖的 Hive metastore catalog。[#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* 将 `full_text` 类型的索引重命名为 `gin`。这与 PostgreSQL 和其他数据库中更常见的术语保持一致。现有的 `full_text` 类型索引仍然可以加载，但在尝试在搜索中使用它们时会抛出异常（并建议改用 `gin` 索引）。[#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### 性能改进

* 将 Compact 部件格式更改为为每个子流保存标记，从而可以读取单独的子列。旧的 Compact 格式在读取时仍然受支持，并且可以通过 MergeTree 设置 `write_marks_for_substreams_in_compact_parts` 在写入时启用。出于更安全升级的考虑，该设置默认关闭，因为这会改变 Compact 部件的存储方式。它将在接下来的某个版本中默认启用。[#77940](https://github.com/ClickHouse/ClickHouse/pull/77940)（[Pavel Kruglov](https://github.com/Avogar)）。
* 允许将包含子列的条件下推到 PREWHERE。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar))。
* 通过一次性在多个 granule 上计算表达式，加速二级索引。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 默认启用 `compile_expressions`（用于普通表达式片段的 JIT 编译器）。这解决了 [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386) 和 [#66486](https://github.com/ClickHouse/ClickHouse/issues/66486)。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增设置：`use_skip_indexes_in_final_exact_mode`。如果对 `ReplacingMergeTree` 表的查询包含 `FINAL` 子句，仅根据跳过索引读取表分段可能会产生不正确的结果。该设置可以通过扫描与跳过索引返回的主键范围有重叠的较新数据分段，来确保返回正确结果。设置为 0 表示禁用，1 表示启用。[#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 对象存储集群表函数（例如 `s3Cluster`）现在会基于一致性哈希将文件分配给各副本进行读取，以提高缓存局部性。[#77326](https://github.com/ClickHouse/ClickHouse/pull/77326)（[Andrej Hoos](https://github.com/adikus)）。
* 通过允许并行执行 `INSERT` 写入数据（可通过队列设置 `parallel_inserts=true` 启用），提升 `S3Queue`/`AzureQueue` 的性能。此前，S3Queue/AzureQueue 只能在流水线的第一部分（下载、解析）并行处理，`INSERT` 为单线程执行，而 `INSERT` 几乎总是性能瓶颈。现在性能几乎可以随着 `processing_threads_num` 线性扩展。[#77671](https://github.com/ClickHouse/ClickHouse/pull/77671)（[Azat Khuzhin](https://github.com/azat)）。在 S3Queue/AzureQueue 中实现了更公平的 max&#95;processed&#95;files&#95;before&#95;commit 限制。[#79363](https://github.com/ClickHouse/ClickHouse/pull/79363)（[Azat Khuzhin](https://github.com/azat)）。
* 引入了一个阈值（通过设置 `parallel_hash_join_threshold` 进行控制），当右表大小低于该阈值时将回退为使用 `hash` 算法。[#76185](https://github.com/ClickHouse/ClickHouse/pull/76185)（[Nikita Taranov](https://github.com/nickitat)）。
* 现在我们根据副本数量来确定在启用并行副本读取时的任务大小。这样在读取数据量不太大的情况下，可以在副本之间实现更均衡的工作分配。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695)（[Nikita Taranov](https://github.com/nickitat)）。
* 允许在分布式聚合的最终阶段并行合并 `uniqExact` 状态。[#78703](https://github.com/ClickHouse/ClickHouse/pull/78703)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复在带键聚合中并行合并 `uniqExact` 状态时可能出现的性能下降问题。[#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat))。
* 减少对 Azure 存储的 List Blobs API 调用次数。[#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复并行副本分布式 `INSERT SELECT` 的性能问题。[#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* 避免 `LogSeriesLimiter` 在每次构造时都执行清理操作，从而在高并发场景下避免锁竞争和性能退化。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 通过简单 COUNT 优化加速查询。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* 改进了对某些 `Decimal` 运算的内联优化。[#79999](https://github.com/ClickHouse/ClickHouse/pull/79999)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 将 `input_format_parquet_bloom_filter_push_down` 的默认值设为 true。同时修正设置更改历史中的一个错误。[#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 针对所有行都应被删除的数据部分，优化了 `ALTER ... DELETE` 变更操作。现在，在此类情况下会直接创建一个空的数据部分来替代原始数据部分，而无需实际执行变更操作。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 在可能的情况下，避免在插入到 Compact 部分时对该数据块进行额外拷贝。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* 添加设置 `input_format_max_block_size_bytes`，用于按字节限制输入格式中创建的块大小。这有助于在导入行中包含大体积数据时避免高内存占用。[#79495](https://github.com/ClickHouse/ClickHouse/pull/79495)（[Pavel Kruglov](https://github.com/Avogar)）。
* 移除线程和 async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests 的保护页。将 `FiberStack` 中的分配方式从 `mmap` 更改为 `aligned_alloc`。由于这会导致 VMA 被拆分，在高负载下可能会触及 vm.max&#95;map&#95;count 的限制。[#79147](https://github.com/ClickHouse/ClickHouse/pull/79147)（[Sema Checherinda](https://github.com/CheSema)）。
* 支持并行副本的惰性物化。 [#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).





#### 改进

* 新增支持按需应用轻量级删除（通过设置 `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` 实现）。[#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ))。
* 如果在终端中以 pretty 格式显示数据，且后续数据块具有相同的列宽，则可以通过上移光标，从上一个数据块继续输出，并将其与上一个数据块拼接在一起。此功能修复了 [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333)。该功能由新的设置 `output_format_pretty_glue_chunks` 控制。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `isIPAddressInRange` 函数扩展为支持 `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)` 和 `Nullable(IPv6)` 数据类型。[#78364](https://github.com/ClickHouse/ClickHouse/pull/78364)（[YjyJeff](https://github.com/YjyJeff)）。
* 允许动态更改 `PostgreSQL` 引擎的连接池设置。[#78414](https://github.com/ClickHouse/ClickHouse/pull/78414)（[Samay Sharma](https://github.com/samay-sharma)）。
* 允许在常规投影中指定 `_part_offset`。这是构建投影索引的第一步。它可以与 [#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) 一起使用，并有助于改进 #63207。 [#78429](https://github.com/ClickHouse/ClickHouse/pull/78429) ([Amos Bird](https://github.com/amosbird))。
* 为 `system.named_collections` 新增列（`create_query` 和 `source`），并关闭 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179)。[#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 在系统表 `system.query_condition_cache` 中新增了字段 `condition`。该字段存储的明文条件，其哈希值被用作查询条件缓存的键。[#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze))。
* 现在可以在 `BFloat16` 列上创建向量相似度索引。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `DateTime64` 的 best effort 解析中支持带小数部分的 Unix 时间戳。[#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 `DeltaLake` 存储的 delta-kernel 实现中，修复列映射模式，并为模式演进添加测试。[#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 通过改进值的转换方式，优化使用 Values 格式向 `Variant` 列插入数据的过程。[#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar))。
* `tokens` 函数已扩展为可接受一个额外的 “tokenizer” 参数，以及更多特定于该 tokenizer 的参数。[#79001](https://github.com/ClickHouse/ClickHouse/pull/79001)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* `SHOW CLUSTER` 语句现在会在其参数中展开宏（如果有）。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42)).
* 哈希函数现在支持处理数组、元组和映射中的 `NULL` 值。（问题 [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) 和 [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* 将 cctz 更新到 2025a。[#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano))。
* 将 UDF 的默认 stderr 处理方式更改为“log&#95;last”，以提升易用性。[#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 Web UI 中为选项卡添加撤销功能。此更改解决了 [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284)。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在执行 `recoverLostReplica` 时移除设置，其方式与以下变更中相同： [https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 新增 ProfileEvent：`ParquetReadRowGroups` 和 `ParquetPrunedRowGroups`，用于分析 Parquet 索引裁剪。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* 支持在集群中对数据库执行 `ALTER` 操作。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 在收集 `QueryMetricLog` 统计信息时显式跳过已错过的周期，否则日志将需要很长时间才能追上当前时间。[#79257](https://github.com/ClickHouse/ClickHouse/pull/79257)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* 对基于 `Arrow` 的格式的读取进行了一些小优化。[#79308](https://github.com/ClickHouse/ClickHouse/pull/79308)（[Bharat Nallan](https://github.com/bharatnc)）。
* 设置 `allow_archive_path_syntax` 被误标为实验性功能。添加测试，防止实验性设置被默认启用。[#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 支持针对单个查询调整页面缓存设置。这有助于更快速地进行实验，并对高吞吐量和低延迟查询进行精细调优。[#79337](https://github.com/ClickHouse/ClickHouse/pull/79337)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 对于看起来像典型 64 位哈希值的数字，不再使用美化格式进行打印。关闭了 [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334)。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高级仪表板上图表的颜色将根据对应查询的哈希值生成。这样可以在滚动浏览仪表板时更容易记住并找到某个图表。[#79341](https://github.com/ClickHouse/ClickHouse/pull/79341)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加异步指标 `FilesystemCacheCapacity` —— `cache` 虚拟文件系统的总容量。该指标对于全局基础设施监控非常有用。[#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 优化对 system.parts 的访问（仅在需要时读取列/索引大小）。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* 对查询 `'SHOW CLUSTER <name>'` 只计算相关字段，而不是所有字段。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach))
* 支持为 `DatabaseCatalog` 指定存储设置。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为 `DeltaLake` 提供本地存储支持。[#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 新增查询级别设置 `allow_experimental_delta_kernel_rs` 以启用 delta-kernel-rs。 [#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在从 Azure/S3 Blob 存储列举 blob 时可能出现的死循环问题。[#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* 新增文件系统缓存设置项 `max_size_ratio_to_total_space`。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 将 `clickhouse-benchmark` 中的 `reconnect` 选项重新配置为可以接受 0、1 或 N 作为值，以控制相应的重连行为。[#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* 允许对位于不同 `plain_rewritable` 磁盘上的表使用 `ALTER TABLE ... MOVE|REPLACE PARTITION`。[#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva))。
* 当参考向量的类型为 `Array(BFloat16)` 时，现在也会使用向量相似度索引。[#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 将 last&#95;error&#95;message、last&#95;error&#95;trace 和 query&#95;id 添加到 system.error&#95;log 表中。相关 issue [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* 默认启用崩溃报告发送。可以在服务器配置文件中将其关闭。[#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 系统表 `system.functions` 现在会显示各个函数首次在 ClickHouse 的哪个版本中引入。 [#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze)).
* 新增了 `access_control_improvements.enable_user_name_access_type` 设置。此设置用于启用或禁用针对用户/角色的精确权限授予功能，该功能最初在 [https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) 中引入。如果集群中存在版本早于 25.1 的副本，则可能需要关闭此设置。 [#79842](https://github.com/ClickHouse/ClickHouse/pull/79842) ([pufit](https://github.com/pufit))。
* 现在在对 `ASTSelectWithUnionQuery::clone()` 方法进行正确实现时，也会将 `is_normalized` 字段考虑在内。这可能有助于解决 [#77569](https://github.com/ClickHouse/ClickHouse/issues/77569)。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复某些使用 EXCEPT 运算符的查询在格式化时不一致的问题。如果 EXCEPT 运算符左侧以 `*` 结尾，格式化后的查询会丢失括号，随后会被解析为带有 `EXCEPT` 修饰符的 `*`。这些查询由 fuzzer 发现，在实际使用中不太可能遇到。此更改关闭了 [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950)。 [#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过对变体反序列化顺序进行缓存，实现了对 `JSON` 类型解析的小幅优化。[#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 新增设置 `s3_slow_all_threads_after_network_error`。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar)).
* 用于记录所选待合并部分的日志级别设置错误（为 Information）。关闭 [#80061](https://github.com/ClickHouse/ClickHouse/issues/80061)。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer：在工具提示和状态信息中添加 runtime/share。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa)).
* trace-visualizer：支持从 ClickHouse 服务器加载数据。[#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa))。
* 为失败的合并添加指标。[#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 如果指定了最大迭代次数，`clickhouse-benchmark` 将根据该最大迭代次数显示百分比。[#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 添加 `system.parts` 表的可视化工具。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* 添加查询延迟分析工具。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复在 part 中重命名缺失列时的问题。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* 物化视图可能会启动得太晚，例如在负责向其流式写入数据的 Kafka 表启动之后才启动。[#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复在启用 analyzer 的情况下创建 `VIEW` 时对 `SELECT` 查询的重写问题。修复了 [#75956](https://github.com/ClickHouse/ClickHouse/issues/75956)。[#76356](https://github.com/ClickHouse/ClickHouse/pull/76356)（[Dmitry Novik](https://github.com/novikd)）。
* 修复通过 `apply_settings_from_server` 从服务器应用 `async_insert` 设置的问题（此前会在客户端导致 `Unknown packet 11 from server` 错误）。 [#77578](https://github.com/ClickHouse/ClickHouse/pull/77578) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在 Replicated 数据库中新添加的副本上可刷新物化视图无法工作的问题。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了可刷新物化视图导致备份损坏的问题。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `transform` 旧触发逻辑中的错误。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了一些在使用 analyzer 时未应用二级索引的情况。修复了 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) 和 [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373)。[#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在启用压缩的 HTTP 协议下导出 profile 事件（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）的问题（误差不应超过缓冲区大小，通常约为 1MiB）。[#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `JOIN ... USING` 涉及 `ALIAS` 列时分析器产生 `LOGICAL_ERROR` 的问题——应改为抛出更合适的错误。[#78618](https://github.com/ClickHouse/ClickHouse/pull/78618)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复 analyzer：当 `SELECT` 语句包含位置参数时，`CREATE VIEW ... ON CLUSTER` 会失败的问题。[#78663](https://github.com/ClickHouse/ClickHouse/pull/78663)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复在向具有模式推断的表函数执行 `INSERT SELECT` 时，如果 `SELECT` 中包含标量子查询会出现 `Block structure mismatch` 错误的问题。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复 analyzer：当对 Distributed 表的 SELECT 查询设置 prefer&#95;global&#95;in&#95;and&#95;join=1 时，应将 `in` 函数替换为 `globalIn`。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复了多种类型的 `SELECT` 查询，这些查询从使用 `MongoDB` 引擎的表或 `mongodb` 表函数中读取数据：在 `WHERE` 子句中对常量值进行隐式转换的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`）；以及带有 `LIMIT` 和 `GROUP BY` 的查询。此前，这些查询可能会返回错误的结果。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了不同 JSON 类型之间的转换。现在通过先转换为 String 再从 String 转回进行简单的类型转换来完成。这样效率较低，但可以保证结果 100% 准确。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了将 Dynamic 类型转换为 Interval 类型时的逻辑错误。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 JSON 解析错误时列无法正确回滚的问题。[#78836](https://github.com/ClickHouse/ClickHouse/pull/78836)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在使用常量别名列进行 JOIN 时出现的 &#39;bad cast&#39; 错误。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 禁止在物化视图中对在视图和目标表中数据类型不同的列使用 PREWHERE。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在解析 Variant 列中错误二进制数据时的逻辑错误。[#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar))。
* 当 Parquet 批大小被设置为 0 时，将抛出异常。此前当 output&#95;format&#95;parquet&#95;batch&#95;size = 0 时，ClickHouse 会挂起。现在这一问题已被修复。[#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* 修复在紧凑数据分片中使用 basic 格式时 Variant 判别器的反序列化问题。该问题最初在 [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) 中引入。 [#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* 类型为 `complex_key_ssd_cache` 的字典现在会拒绝 `block_size` 和 `write_buffer_size` 参数为零或负数的情况（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 避免在 SummingMergeTree 中将 Field 用于非聚合列。这可能会导致在 SummingMergeTree 中使用 Dynamic/Variant 类型时出现意外错误。[#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 analyzer 中修复从目标表为 Distributed 且表头不同的 Materialized View 读取的问题。[#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在对包含批量插入的表执行 `arrayUnion()` 时会返回多余（不正确）值的错误。修复了 [#75057](https://github.com/ClickHouse/ClickHouse/issues/75057)。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* 修复 `OpenSSLInitializer` 中导致段错误的问题。关闭 [#79092](https://github.com/ClickHouse/ClickHouse/issues/79092)。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 始终为 S3 的 ListObject 请求设置前缀。[#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat))。
* 修复了在进行了批量插入的表上，arrayUnion() 会返回多余（错误）值的缺陷。修复了 [#79157](https://github.com/ClickHouse/ClickHouse/issues/79157)。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* 修复过滤器下推后的逻辑错误。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在通过基于 HTTP 的端点使用 delta-kernel 实现时的 DeltaLake 表引擎问题，并修复 NOSIGN。关闭 [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124)。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper 修复：避免在 multi 请求失败时触发 watches。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* 禁止在 `IN` 中使用 Dynamic 和 JSON 类型。由于当前 `IN` 的实现方式，可能会导致结果不正确。为 `IN` 提供对这些类型的完整支持较为复杂，可能会在未来实现。[#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 JSON 类型解析中用于检查重复路径的逻辑。[#79317](https://github.com/ClickHouse/ClickHouse/pull/79317)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 SecureStreamSocket 连接问题。[#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复包含数据的 plain&#95;rewritable 磁盘的加载问题。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在 MergeTree 的 Wide 数据部分进行动态子列发现时发生的崩溃。[#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar))。
* 仅在初始创建查询时验证表名长度。对于后续的再次创建不要进行该验证，以避免引发向后兼容性问题。 [#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 在若干场景下修复了包含稀疏列的表中出现的 `Block structure mismatch` 错误。[#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了两种会触发 &quot;Logical Error: Can&#39;t set alias of * of Asterisk on alias&quot; 的情况。[#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在重命名 Atomic 数据库时使用错误的路径的问题。[#79569](https://github.com/ClickHouse/ClickHouse/pull/79569)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复在与其他列一起按 JSON 列排序时的问题。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* 在从远程读取数据且同时禁用 `use_hedged_requests` 和 `allow_experimental_parallel_reading_from_replicas` 时，修复结果重复的问题。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* 修复在使用 Unity Catalog 时 delta-kernel 实现中的崩溃。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为自动发现集群解析宏。[#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 改进对错误配置的 page&#95;cache&#95;limits 的处理方式。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在可变长度格式说明符（例如 `%W`，即星期几，如 `Monday`、`Tuesday` 等）后紧跟复合格式说明符（一次输出多个时间组件的格式说明符，例如 `%D`，即美国日期格式 `05/04/25`）时，SQL 函数 `formatDateTime` 的结果。[#79835](https://github.com/ClickHouse/ClickHouse/pull/79835)（[Robert Schulze](https://github.com/rschu1ze)）。
* IcebergS3 支持对 count 的优化，但 IcebergS3Cluster 不支持。因此，在集群模式下返回的 count() 结果可能是副本数量的倍数。[#79844](https://github.com/ClickHouse/ClickHouse/pull/79844)（[wxybear](https://github.com/wxybear)）。
* 修复了在使用惰性物化且在投影之前查询执行未使用任何列时出现的 AMBIGUOUS&#95;COLUMN&#95;NAME 错误。例如：SELECT * FROM t ORDER BY rand() LIMIT 5。[#79926](https://github.com/ClickHouse/ClickHouse/pull/79926)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在查询 `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` 中隐藏密码。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* 允许在 JOIN USING 中指定别名。若列被重命名（例如由于 ARRAY JOIN），请使用该别名进行指定。修复了 [#73707](https://github.com/ClickHouse/ClickHouse/issues/73707)。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 使带有 UNION 的物化视图在新副本上能够正常工作。[#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma))。
* SQL 函数 `parseDateTime` 中的格式说明符 `%e` 现在可以识别一位数的日期（例如 `3`），此前则要求使用空格填充（例如 ` 3`）。这使其行为与 MySQL 保持兼容。若要保留之前的行为，请将设置项 `parsedatetime_e_requires_space_padding` 设为 `1`。（issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)). [#80057](https://github.com/ClickHouse/ClickHouse/pull/80057) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复 ClickHouse 日志中的警告 `Cannot find 'kernel' in '[...]/memory.stat'`（问题 [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。 [#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 FunctionComparison 中检查栈大小，以避免因栈溢出导致的崩溃。[#78208](https://github.com/ClickHouse/ClickHouse/pull/78208)（[Julia Kartseva](https://github.com/jkartseva)）。
* 修复从 `system.workloads` 执行 SELECT 时的竞态问题。[#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa))。
* 修复：分布式查询中的延迟物化。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复将 `Array(Bool)` 转换为 `Array(FixedString)` 的问题。[#78863](https://github.com/ClickHouse/ClickHouse/pull/78863)（[Nikita Taranov](https://github.com/nickitat)）。
* 让 Parquet 版本选择更加清晰明了。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `ReservoirSampler` 自合并问题。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* 修复客户端上下文中插入表的存储方式。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复 `AggregatingSortedAlgorithm` 和 `SummingSortedAlgorithm` 数据成员的析构顺序。[#79056](https://github.com/ClickHouse/ClickHouse/pull/79056)（[Nikita Taranov](https://github.com/nickitat)）。
* `enable_user_name_access_type` 不应影响 `DEFINER` 访问类型。[#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit))。
* 如果 system 数据库的元数据位于 keeper 中，对 system 数据库的查询可能会卡住。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### 构建/测试/打包改进

- 支持重用已构建的 `chcache` 二进制文件,而无需每次都重新构建。[#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 添加 NATS 暂停等待功能。[#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
- 修复将 ARM 构建错误发布为 amd64compat 的问题。[#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger))。
- 为 OpenSSL 使用预先生成的汇编代码。[#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复以支持使用 `clang20` 构建。[#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `chcache`:支持 Rust 缓存。[#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 为 `zstd` 汇编文件添加栈展开信息。[#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321))。

### ClickHouse 版本 25.4,2025-04-22 {#254}

#### 向后不兼容变更

- 当 `allow_materialized_view_with_bad_select` 为 `false` 时,检查物化视图中的所有列是否与目标表匹配。[#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm))。
- 修复 `dateTrunc` 使用负数 Date/DateTime 参数时的问题。[#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
- 已移除旧版 `MongoDB` 集成。服务器设置 `use_legacy_mongodb_integration` 已废弃,现在不再生效。[#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze))。
- 增强 `SummingMergeTree` 验证,跳过对分区键或排序键中使用的列的聚合。[#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。


#### 新功能

* 为工作负载新增了 CPU 槽位调度功能，详情请参见[文档](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* 如果指定 `--path` 命令行参数，`clickhouse-local` 在重启后将保留其数据库。由此修复了 [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647)。由此修复了 [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947)。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当服务器过载时拒绝查询。该判断基于等待时间（`OSCPUWaitMicroseconds`）与繁忙时间（`OSCPUVirtualTimeMicroseconds`）的比值作出。当该比值位于 `min_os_cpu_wait_time_ratio_to_throw` 和 `max_os_cpu_wait_time_ratio_to_throw` 之间时（这些是查询级别的设置），查询会以一定概率被丢弃。[#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* 在 `Iceberg` 中支持时间旅行：新增设置，可按指定时间戳查询 `Iceberg` 表。[#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner))。[#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik))。
* 用于 `Iceberg` 元数据的内存缓存，存储 manifest 文件/列表和 `metadata.json`，以加速查询。[#77156](https://github.com/ClickHouse/ClickHouse/pull/77156)（[Han Fei](https://github.com/hanfei1991)）。
* 在 Azure Blob Storage 上支持 `DeltaLake` 表引擎。修复了 [#68043](https://github.com/ClickHouse/ClickHouse/issues/68043)。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 为反序列化后的向量相似度索引新增了一个内存缓存，这可以加速重复执行的近似最近邻（ANN）搜索查询。新缓存的大小由服务器设置 `vector_similarity_index_cache_size` 和 `vector_similarity_index_cache_max_entries` 控制。此功能取代了早期版本中的跳过索引缓存功能。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 支持 Delta Lake 的分区裁剪功能。[#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在只读的 `MergeTree` 表中新增后台刷新支持，使得可通过无限数量的分布式读取器查询可更新表（ClickHouse 原生数据湖）。 [#76467](https://github.com/ClickHouse/ClickHouse/pull/76467) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 支持使用自定义磁盘存储数据库元数据文件。目前仅支持在服务器全局级别进行配置。[#77365](https://github.com/ClickHouse/ClickHouse/pull/77365)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 在 plain&#95;rewritable 磁盘上支持使用 `ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION`。[#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva))。
* 为 `Kafka` 表引擎添加用于 `SASL` 配置和凭据的表设置。这样可以在 `CREATE TABLE` 语句中直接配置 Kafka 及 Kafka 兼容系统的基于 SASL 的认证，而无需使用配置文件或命名集合。[#78810](https://github.com/ClickHouse/ClickHouse/pull/78810) ([Christoph Wurm](https://github.com/cwurm))。
* 允许为 MergeTree 表设置 `default_compression_codec`：当 CREATE 语句未为给定列显式指定压缩编解码器时，将使用该设置。此更改解决了 [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005)。[#66394](https://github.com/ClickHouse/ClickHouse/pull/66394)（[gvoelfin](https://github.com/gvoelfin)）。
* 在集群配置中添加 `bind_host` 设置，以便 ClickHouse 能在分布式连接中使用特定网络。[#74741](https://github.com/ClickHouse/ClickHouse/pull/74741)（[Todd Yocum](https://github.com/toddyocum)）。
* 在 `system.tables` 中新增列 `parametrized_view_parameters`。修复了 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756)。[#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* 允许修改数据库注释。关闭 [#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) ### 为面向用户的变更添加文档条目。 [#75622](https://github.com/ClickHouse/ClickHouse/pull/75622) ([NamNguyenHoai](https://github.com/NamHoaiNguyen)).
* 在 PostgreSQL 兼容协议中支持 `SCRAM-SHA-256` 身份验证。[#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12)).
* 新增函数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted` 和 `arraySimilarity`。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 设置 `parallel_distributed_insert_select` 对写入 `ReplicatedMergeTree` 的 `INSERT SELECT` 语句生效（此前仅在基于 Distributed 表时可用）。 [#78041](https://github.com/ClickHouse/ClickHouse/pull/78041) ([Igor Nikonov](https://github.com/devcrafter))。
* 引入 `toInterval` 函数。该函数接受 2 个参数（value 和 unit），并将该数值转换为特定的 `Interval` 类型。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* 在 iceberg 表函数和引擎中新增多种便捷方式，用于确定根 `metadata.json` 文件的位置。解决了 [#78455](https://github.com/ClickHouse/ClickHouse/issues/78455)。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475) ([Daniil Ivanik](https://github.com/divanik))。
* 在 ClickHouse 的 SSH 协议中增加对基于密码认证的支持。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 实验性功能
* 在 `WHERE` 子句中支持将相关子查询作为 `EXISTS` 表达式的参数。解决 [#72459](https://github.com/ClickHouse/ClickHouse/issues/72459)。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 新增 `sparseGrams` 和 `sparseGramsHashes` 函数的 ASCII 和 UTF-8 版本。作者：[scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。请勿使用：其实现将在后续版本中变更。



#### 性能改进

* 通过使用在执行 `ORDER BY` 和 `LIMIT` 之后才读取数据的惰性列来优化性能。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 现在默认启用查询条件缓存。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过去虚拟化对 `col->insertFrom()` 的调用，加速 JOIN 结果的构建。[#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger))。
* 如果可能，将查询计划中过滤步骤中的相等条件合并到 JOIN 条件中，以便可以将其用作哈希表键。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd))。
* 如果在两侧表中 JOIN 键都是各自主键（PK）的前缀，则为 JOIN 使用动态分片。此优化通过 `query_plan_join_shard_by_pk_ranges` 设置启用（默认禁用）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 支持基于列的上下边界值对 `Iceberg` 表进行数据剪枝。修复 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638)。[#78242](https://github.com/ClickHouse/ClickHouse/pull/78242) ([alesapin](https://github.com/alesapin))。
* 为 `Iceberg` 实现了简单的计数优化。现在带有 `count()` 且没有任何过滤条件的查询应该会更快。关闭了 [#77639](https://github.com/ClickHouse/ClickHouse/issues/77639)。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* 新增配置项 `max_merge_delayed_streams_for_parallel_write`，用于控制合并操作中可并行刷写的列数（预计可将写入 S3 的纵向合并内存占用降低约 25 倍）。[#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat))。
* 在缓存被被动使用时（例如用于合并），禁用 `filesystem_cache_prefer_bigger_buffer_size`。这可以降低合并操作的内存消耗。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 现在我们使用副本数量来确定在启用并行副本进行读取时的任务大小。当需要读取的数据量不太大时，这可以在副本之间实现更好的负载分配。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695)（[Nikita Taranov](https://github.com/nickitat)）。
* 为 `ORC` 格式提供异步 I/O 预取支持，通过隐藏远程 I/O 延迟来提升整体性能。[#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li))。
* 通过预分配异步插入操作使用的内存来提升性能。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* 在可以使用 `multiRead` 的场景中避免使用单个 `get` 请求，以减少 Keeper 的请求数量；随着副本数量增加，单个 `get` 请求可能会给 Keeper 带来显著负载。[#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* 对在 Nullable 参数上执行函数的小幅优化。[#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* 优化了 `arraySort`。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 将同一部分的标记合并后一次性写入查询条件缓存，从而减少锁的开销。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 优化 `s3Cluster` 在仅包含一次括号展开的查询中的性能。[#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis))。
* 针对单个 `Nullable` 或 `LowCardinality` 列优化 ORDER BY。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li)).
* 优化 `Native` 格式的内存使用。[#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat))。
* 微小优化：在需要进行类型转换时，不要将 `count(if(...))` 重写为 `countIf`。关闭 [#78564](https://github.com/ClickHouse/ClickHouse/issues/78564)。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 函数现在可以利用 `tokenbf_v1`、`ngrambf_v1` 全文本跳过索引。[#77662](https://github.com/ClickHouse/ClickHouse/pull/77662)（[UnamedRus](https://github.com/UnamedRus)）。
* 向量相似度索引此前可能会将主内存过度分配至多 2 倍。本次修复重构了内存分配策略，降低了内存消耗，并提升了向量相似度索引缓存的有效性（问题 [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 为 `system.metric_log` 表引入名为 `schema_type` 的设置，用于指定表的 schema 类型。允许的 schema 有三种：`wide` —— 当前的 schema，每个 metric/event 位于单独的列中（对按列读取最为高效）；`transposed` —— 类似于 `system.asynchronous_metric_log`，metric/event 以行的形式存储；以及最值得关注的 `transposed_with_wide_view` —— 以 `transposed` schema 创建底层表，同时引入一个使用 `wide` schema 的视图，将查询转换到底层表。在 `transposed_with_wide_view` 中，视图不支持亚秒级时间精度，`event_time_microseconds` 仅是用于向后兼容的别名。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin)).





#### 改进

* 对 `Distributed` 查询的查询计划进行序列化。新增设置 `serialize_query_plan`。启用后，来自 `Distributed` 表的查询在远程执行时将使用序列化的查询计划。这在 TCP 协议中引入了一种新的数据包类型，需要在服务器配置中添加 `<process_query_plan_packet>true</process_query_plan_packet>` 以允许处理此数据包。 [#69652](https://github.com/ClickHouse/ClickHouse/pull/69652) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 支持在视图中读取 `JSON` 类型及其子列。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar)).
* 现已支持 `ALTER DATABASE ... ON CLUSTER`。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 可刷新物化视图的刷新操作现在会记录在 `system.query_log` 中。[#71333](https://github.com/ClickHouse/ClickHouse/pull/71333)（[Michael Kolupaev](https://github.com/al13n321)）。
* 用户自定义函数（UDF）现在可以在其配置中通过新的设置被标记为确定性函数。此外，查询缓存现在会检查在查询中调用的 UDF 是否为确定性函数；如果是，则会缓存查询结果。（Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)）。[#77769](https://github.com/ClickHouse/ClickHouse/pull/77769)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 为所有类型的复制任务启用了退避逻辑。这将有助于降低 CPU 使用率、内存占用以及日志文件大小。新增设置项 `max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms` 和 `max_postpone_time_for_failed_replicated_tasks_ms`，其行为类似于 `max_postpone_time_for_failed_mutations_ms`。 [#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 将 `query_id` 添加到 `system.errors`。修复 [#75815](https://github.com/ClickHouse/ClickHouse/issues/75815)。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* 添加了将 `UInt128` 转换为 `IPv6` 的支持，从而可以对 `IPv6` 执行 `bitAnd` 运算和算术操作，并将结果再转换为 `IPv6`。修复 [#76752](https://github.com/ClickHouse/ClickHouse/issues/76752)。这也允许将对 `IPv6` 执行 `bitAnd` 运算的结果转换回 `IPv6`。另请参见 [#57707](https://github.com/ClickHouse/ClickHouse/pull/57707)。 [#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* 默认情况下，不会在 `Variant` 类型的文本格式中解析特殊的 `Bool` 值。可以通过设置 `allow_special_bool_values_inside_variant` 来启用。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* 在会话级别和服务器级别支持为低 `priority` 查询配置按任务的等待时间。[#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* 为 JSON 数据类型的值实现了比较功能。现在 JSON 对象可以像 Map 一样进行比较。[#77397](https://github.com/ClickHouse/ClickHouse/pull/77397)（[Pavel Kruglov](https://github.com/Avogar)）。
* 通过 `system.kafka_consumers` 提供了更好的权限支持。转发内部的 `librdkafka` 错误（顺便说一句，这个库实在很糟糕）。 [#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* 为 Buffer 表引擎的设置新增了验证。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 添加配置项 `enable_hdfs_pread`，用于启用或禁用 `HDFS` 中的 pread 功能。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou))。
* 为统计 ZooKeeper `multi` 读写请求数量添加 profile events。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* 在开启 `disable_insertion_and_mutation` 时，允许创建临时表并向其中插入数据。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* 将 `max_insert_delayed_streams_for_parallel_write` 的值降低到 100。[#77919](https://github.com/ClickHouse/ClickHouse/pull/77919) ([Azat Khuzhin](https://github.com/azat))。
* 修复 Joda 语法中的年份解析（如果你想知道的话，这是来自 Java 世界），例如 `yyy`。 [#77973](https://github.com/ClickHouse/ClickHouse/pull/77973) ([李扬](https://github.com/taiyang-li)).
* 附加 `MergeTree` 表的各个数据部分时，将按照其块顺序执行，这对诸如 `ReplacingMergeTree` 等特殊合并算法非常重要。此更改关闭了 [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009)。 [#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 查询掩码规则现在在发生匹配时可以抛出 `LOGICAL_ERROR` 异常。这有助于检查预定义密码是否在日志中的任意位置发生泄露。[#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 在 `information_schema.tables` 中新增列 `index_length_column`，以更好地兼容 MySQL。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 引入两个新的指标：`TotalMergeFailures` 和 `NonAbortedMergeFailures`。这些指标用于检测在短时间内发生过多合并失败的情况。[#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复在使用 path-style 模式且未在路径中指定 key 时对 S3 URL 的错误解析。[#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos))。
* 修复 `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime` 和 `BlockReadTime` 异步指标的错误数值（在此变更前，1 秒被错误地报告为 0.001）。[#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov))。
* 在向基于 StorageS3(Azure)Queue 的物化视图推送数据时，对发生的错误会应用 `loading_retries` 限制。在此之前，此类错误会被无限次重试。[#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在 DeltaLake 的 `delta-kernel-rs` 实现中，修复性能和进度条问题。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 为运行时磁盘增加对 `include`、`from_env`、`from_zk` 的支持。修复 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177)。[#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 为长时间运行的 mutation 在 `system.warnings` 表中添加动态警告。[#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* 向系统表 `system.query_condition_cache` 添加了字段 `condition`。该字段存储明文形式的条件表达式，其哈希值被用作查询条件缓存中的键。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* 允许 Hive 分区键为空值。[#78816](https://github.com/ClickHouse/ClickHouse/pull/78816)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复 `BFloat16` 在 `IN` 子句中的类型转换问题（例如，`SELECT toBFloat16(1) IN [1, 2, 3];` 现在返回 `1`）。关闭 [#78754](https://github.com/ClickHouse/ClickHouse/issues/78754)。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 如果设置了 `disk = ...`，则不再检查位于其他磁盘上的 `MergeTree` part。[#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat))。
* 使 `system.query_log` 中 `used_data_type_families` 字段的数据类型以规范名称记录。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在执行 `recoverLostReplica` 时的清理设置与在 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) 中所做的保持一致。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 在对 INFILE 进行模式推断时使用插入列。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复了在聚合投影中使用 `count(Nullable)` 时的投影分析错误，修复了 [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495)。该 PR 还在投影分析过程中增加了一些日志，以明确说明为什么会使用或不使用某个投影。[#74498](https://github.com/ClickHouse/ClickHouse/pull/74498)（[Amos Bird](https://github.com/amosbird)）。
* 修复在执行 `DETACH PART` 时可能出现的 `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` 错误。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 修复在 analyzer 中包含字面量的表达式导致 skip 索引不起作用的问题，同时在索引分析过程中移除无意义的类型转换（trivial casts）。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个错误：`close_session` 查询参数未生效，导致命名会话只能在 `session_timeout` 之后才被关闭。[#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats))。
* 修复在未附加物化视图时从 NATS 服务器接收消息的问题。[#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* 修复在通过 `merge` 表函数从空的 `FileLog` 进行读取时出现的逻辑错误，关闭 issue [#75575](https://github.com/ClickHouse/ClickHouse/issues/75575)。[#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在共享变体的 `Dynamic` 序列化中使用默认的格式设置。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在本地磁盘上检查表数据路径是否存在的逻辑。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了针对某些类型的常量值发送到远程端的问题。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 S3/AzureQueue 中由于上下文过期导致的崩溃问题。[#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 RabbitMQ、Nats、Redis、AzureQueue 表引擎中隐藏连接凭据。 [#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `argMin`/`argMax` 中进行 `NaN` 比较时的未定义行为。[#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano))。
* 定期检查合并和变更（merges 和 mutations）是否已被取消，即使在操作不会生成任何待写入的数据块时也要执行该检查。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了在 Replicated 数据库中新添加副本上无法工作的可刷新物化视图问题。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在出现 `NOT_FOUND_COLUMN_IN_BLOCK` 错误时可能导致的崩溃。 [#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在向 S3/AzureQueue 填充数据时发生的崩溃问题。[#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc))。
* 在 SSH 服务器中禁用历史记录的模糊搜索（因其依赖 skim 库）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* 修复了这样一个问题：当在未建立索引的列上执行向量搜索查询时，如果表中存在另一列已定义向量相似度索引的向量列，查询会返回不正确的结果。（Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978)）。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 修复提示信息 &quot;The requested output format {} is binary... Do you want to output it anyway? [y/N]&quot; 中的一个细微错误。[#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在 `toStartOfInterval` 的起始参数为 0 时出现的错误。[#78096](https://github.com/ClickHouse/ClickHouse/pull/78096)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 禁止在 HTTP 接口中指定空的 `session_id` 查询参数。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* 修复 `Replicated` 数据库中可能发生的元数据被覆盖问题，该问题可能由于在执行 `ALTER` 查询后立即执行 `RENAME` 查询而引发。[#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复 `NATS` 引擎中的崩溃问题。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 在 SSH 的嵌入式客户端中，不再尝试创建 history&#95;file（在先前版本中会尝试创建，但始终失败）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* 修复在执行 `RENAME DATABASE` 或 `DROP TABLE` 查询后，`system.detached_tables` 显示不正确信息的问题。 [#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复在 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) 之后对 `Replicated` 数据库中过多表数量的检查。此外，将该检查提前到创建存储之前执行，以避免在使用 `ReplicatedMergeTree` 或 `KeeperMap` 时在 Keeper 中创建未被记录的节点。[#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复由于并发初始化 `S3Queue` 元数据而可能导致的崩溃。[#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 函数现在在 Int 类型的 `max_size` 参数值为 0 时，会与 UInt 类型保持一致，返回 `BAD_ARGUMENTS` 错误，而不是尝试继续执行。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* 防止在恢复丢失副本时发生崩溃，如果本地表在分离前被删除。[#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `system.s3_queue_settings` 表中 &quot;alterable&quot; 列始终返回 `false` 的问题。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 对 Azure 访问签名进行掩码处理，使其对用户不可见，且不会出现在日志中。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 Wide 部分中对带前缀子流的预取。[#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在键数组类型为 `LowCardinality(Nullable)` 时，`mapFromArrays` 导致崩溃或返回错误结果的问题。[#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* 修复 delta-kernel-rs 身份验证选项。[#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 当副本的 `disable_insertion_and_mutation` 为 true 时，不再调度可刷新物化视图的任务。该任务本质上是插入操作，如果 `disable_insertion_and_mutation` 为 true，则会失败。[#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210))。
* 验证对 `Merge` 引擎底层表的访问权限。[#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 在查询 `Distributed` 表时，可以忽略 `FINAL` 修饰符。[#78428](https://github.com/ClickHouse/ClickHouse/pull/78428)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 当位图为空时，`bitmapMin` 返回 uint32&#95;max（当输入类型更大时返回 uint64&#95;max），这与空 roaring&#95;bitmap 的最小值行为相同。[#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* 在启用 `distributed_aggregation_memory_efficient` 时，在读取 FROM 子句后立即禁用查询处理的并行化，以避免可能导致的逻辑错误。修复了 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934)。 [#78500](https://github.com/ClickHouse/ClickHouse/pull/78500) ([flynn](https://github.com/ucasfl))。
* 在应用 `max_streams_to_max_threads_ratio` 设置后，如果计划的流数量为零，则至少保留一个用于读取的流。[#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* 在 `S3Queue` 存储中修复逻辑错误 “Cannot unregister: table uuid is not registered”。关闭 [#78285](https://github.com/ClickHouse/ClickHouse/issues/78285)。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ClickHouse 现在能够在同时启用 cgroups v1 和 v2 的系统上确定其所属的 cgroup v2。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* 在与表级设置一起使用时，`-Cluster` 表函数会出错。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik))。
* 针对在 `INSERT` 时 `ReplicatedMergeTree` 不支持事务的情况，改进了检查机制。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* 在 ATTACH 操作期间清理查询设置。[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* 修复当在 `iceberg_metadata_file_path` 中指定了无效路径时发生的崩溃。[#78688](https://github.com/ClickHouse/ClickHouse/pull/78688)（[alesapin](https://github.com/alesapin)）。
* 在使用 `DeltaLake` 表引擎且采用 delta-kernel-s 实现时，修复了在读取 schema 与表 schema 不一致且同时存在分区列的情况下导致出现 “not found column” 错误的问题。[#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复了这样一个问题：在将某个命名会话调度为关闭之后（但在超时真正生效之前），如果创建了一个具有相同名称的新命名会话，则该新会话会在第一个会话原定的关闭时间被关闭。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* 修复了多种类型的 `SELECT` 查询，这些查询从使用 `MongoDB` 引擎的表或 `mongodb` 表函数读取数据：在 `WHERE` 子句中对常量值进行隐式转换的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`）；以及带有 `LIMIT` 和 `GROUP BY` 的查询。之前，这些查询可能会返回错误结果。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 在执行 `CHECK TABLE` 时不再阻塞表的关闭。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper 修复：在所有情况下修正临时节点数量统计。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在使用除 `view` 之外的其他表函数时，`StorageDistributed` 中错误的类型转换问题。解决了 [#78464](https://github.com/ClickHouse/ClickHouse/issues/78464)。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 统一 `tupleElement(*, 1)` 的格式。关闭 [#78639](https://github.com/ClickHouse/ClickHouse/issues/78639)。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 类型为 `ssd_cache` 的字典现在会拒绝 `block_size` 和 `write_buffer_size` 参数为 0 或负数的配置（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复在非正常关闭后执行 ALTER 时，`Refreshable MATERIALIZED VIEW` 崩溃的问题。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `CSV` 格式中对无效 `DateTime` 值的解析。[#78919](https://github.com/ClickHouse/ClickHouse/pull/78919)（[Pavel Kruglov](https://github.com/Avogar)）。
* Keeper 修复：避免在失败的 multi 请求上触发 watch 监听。[#79247](https://github.com/ClickHouse/ClickHouse/pull/79247)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复了在显式指定 min-max 值但其为 `NULL` 时读取 Iceberg 表失败的问题。已发现 Go Iceberg 库会生成此类有问题的文件。关闭 [#78740](https://github.com/ClickHouse/ClickHouse/issues/78740)。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764) ([flynn](https://github.com/ucasfl))。

#### 构建/测试/打包改进

- 在 Rust 中遵循 CPU 目标特性并在所有 crate 中启用 LTO。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 25.3 LTS 版本,2025-03-20 {#253}

#### 向后不兼容变更

- 禁止截断复制数据库。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc))。
- 跳过索引缓存功能已回退。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。


#### 新功能

* `JSON` 数据类型已可用于生产环境。参见 [https://jsonbench.com/](https://jsonbench.com/)。`Dynamic` 和 `Variant` 数据类型也已可用于生产环境。[#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 clickhouse-server 引入 SSH 协议支持。现在可以使用任意 SSH 客户端连接到 ClickHouse。关闭了：[#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 启用并行副本时，请将表函数替换为对应的 -Cluster 版本。修复了 [#65024](https://github.com/ClickHouse/ClickHouse/issues/65024)。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache 的新实现，允许在进程内存中缓存数据，而不是依赖操作系统的页面缓存；当数据存储在未由本地文件系统缓存支持的远程虚拟文件系统上时，这特别有用。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 新增 `concurrent_threads_scheduler` 服务器设置，用于控制并发查询之间的 CPU 资源分配方式。可设置为 `round_robin`（此前的行为）或 `fair_round_robin`，以解决 INSERT 与 SELECT 之间 CPU 分配不公平的问题。[#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa)).
* 新增 `estimateCompressionRatio` 聚合函数 [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。 [#76661](https://github.com/ClickHouse/ClickHouse/pull/76661) ([Tariq Almawash](https://github.com/talmawash))。
* 新增了函数 `arraySymmetricDifference`。它会返回多个数组参数中未在所有参数中都出现的所有元素。示例：`SELECT arraySymmetricDifference([1, 2], [2, 3])` 返回 `[1, 3]`。（issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673)）。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* 允许在 Iceberg 存储/表函数中通过设置 `iceberg_metadata_file_path` 显式指定要读取的元数据文件。修复了 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412)。[#77318](https://github.com/ClickHouse/ClickHouse/pull/77318) ([alesapin](https://github.com/alesapin))。
* 新增 `keccak256` 哈希函数，该函数常用于区块链实现中，尤其是在基于 EVM 的系统中。[#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche))。
* 添加了三个新函数：`icebergTruncate`（遵循规范 [https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details)）、`toYearNumSinceEpoch` 和 `toMonthNumSinceEpoch`。在 `Iceberg` 引擎的分区剪枝中支持 `truncate` 转换。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403) ([alesapin](https://github.com/alesapin))。
* 支持 `LowCardinality(Decimal)` 数据类型 [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833) ([zhanglistar](https://github.com/zhanglistar))。
* `FilterTransformPassedRows` 和 `FilterTransformPassedBytes` 性能事件将显示在查询执行期间被筛选的行数和字节数。[#76662](https://github.com/ClickHouse/ClickHouse/pull/76662)（[Onkar Deshpande](https://github.com/onkar)）。
* 支持直方图指标类型。接口设计与 Prometheus 客户端高度一致，您只需调用 `observe(value)` 即可将对应桶中的计数器加一。直方图指标通过 `system.histogram_metrics` 暴露。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 为非常量 CASE 表达式提供基于显式值的匹配支持。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).



#### 实验性功能
* 为基于 AWS S3 和本地文件系统的 Delta Lake 表添加对 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 的支持。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988) ([alesapin](https://github.com/alesapin))。
* 引入与 AWS Glue 服务目录的实验性集成，用于 Iceberg 表。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257) ([alesapin](https://github.com/alesapin))。
* 增加对动态集群自动发现的支持。这扩展了现有的 _node_ 自动发现功能。ClickHouse 现在可以使用 `<multicluster_root_path>` 在统一的 ZooKeeper 路径下自动检测并注册新的 _clusters_。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 允许在可配置的超时时间之后，通过新的设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 对整个分区执行自动清理合并。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440) ([Christoph Wurm](https://github.com/cwurm))。



#### 性能改进
* 实现查询条件缓存，以提升具有重复条件的查询性能。会在内存中将不满足条件的数据范围记录为临时索引，后续查询将使用该索引。关闭 [#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236) ([zhongyuankai](https://github.com/zhongyuankai)).
* 在删除数据 part 时主动从缓存中驱逐数据。如果数据量更少，不要让缓存增长到最大大小。 [#76641](https://github.com/ClickHouse/ClickHouse/pull/76641) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在算术计算中用 clang 内建的 i256 替换 Int256 和 UInt256，从而带来性能提升 [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。 [#73658](https://github.com/ClickHouse/ClickHouse/pull/73658) ([李扬](https://github.com/taiyang-li)).
* 在某些情况下（例如空数组列）数据 part 可能包含空文件。当表位于元数据与对象存储分离的磁盘上时，可以跳过向 ObjectStorage 写入空 blob，仅为此类文件存储元数据。 [#75860](https://github.com/ClickHouse/ClickHouse/pull/75860) ([Alexander Gololobov](https://github.com/davenger)).
* 提升 Decimal32/Decimal64/DateTime64 的 min/max 性能。 [#76570](https://github.com/ClickHouse/ClickHouse/pull/76570) ([李扬](https://github.com/taiyang-li)).
* 查询编译（设置 `compile_expressions`）现在会考虑机器类型。这显著加速了此类查询。 [#76753](https://github.com/ClickHouse/ClickHouse/pull/76753) ([ZhangLiStar](https://github.com/zhanglistar)).
* 优化 `arraySort`。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 在缓存以被动方式使用时（如用于合并）禁用 `filesystem_cache_prefer_bigger_buffer_size`。 [#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在代码的部分位置应用 `preserve_most` 属性，以获得略微更好的代码生成效果。 [#67778](https://github.com/ClickHouse/ClickHouse/pull/67778) ([Nikita Taranov](https://github.com/nickitat)).
* 加快 ClickHouse 服务器关闭速度（去除 2.5 秒的延迟）。 [#76550](https://github.com/ClickHouse/ClickHouse/pull/76550) ([Azat Khuzhin](https://github.com/azat)).
* 避免在 ReadBufferFromS3 以及其他远程读取缓冲区中进行多余的内存分配，将其内存消耗减少一半。 [#76692](https://github.com/ClickHouse/ClickHouse/pull/76692) ([Sema Checherinda](https://github.com/CheSema)).
* 将 zstd 从 1.5.5 更新到 1.5.7，这可能带来一些[性能改进](https://github.com/facebook/zstd/releases/tag/v1.5.7)。 [#77137](https://github.com/ClickHouse/ClickHouse/pull/77137) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* 降低在 Wide parts 中对 JSON 列进行预取时的内存使用。当 ClickHouse 运行在共享存储之上（例如在 ClickHouse Cloud 中）时，这一点尤为重要。 [#77640](https://github.com/ClickHouse/ClickHouse/pull/77640) ([Pavel Kruglov](https://github.com/Avogar)).



#### 改进

* 在将 `TRUNCATE` 与 `INTO OUTFILE` 一起使用时，支持原子性重命名。解决 [#70323](https://github.com/ClickHouse/ClickHouse/issues/70323)。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 现在不再允许在设置中将 `NaN` 或 `inf` 作为浮点值使用。此前这样做本来也没有任何意义。[#77546](https://github.com/ClickHouse/ClickHouse/pull/77546)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 当 analyzer 被禁用时，默认禁用 parallel replicas，而不受 `compatibility` 设置影响。仍然可以通过将 `parallel_replicas_only_with_analyzer` 显式设置为 `false` 来更改此行为。[#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter))。
* 新增支持：可以定义一组请求头列表，这些请求头会从客户端请求头转发到外部 HTTP 认证器。[#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004))。
* 在元组列中匹配字段时遵循列名大小写不敏感规则。关闭 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324)。[#73780](https://github.com/ClickHouse/ClickHouse/pull/73780)（[李扬](https://github.com/taiyang-li)）。
* Gorilla 编解码器的参数现在将始终保存在 .sql 文件中的表元数据中。已关闭：[#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 为某些数据湖实现了解析功能增强（Sequence ID 解析：新增从 manifest 文件中解析序列标识符的功能；Avro 元数据解析：重新设计 Avro 元数据解析器，使其在未来添加新功能时更易于扩展）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik)).
* 从 `system.opentelemetry_span_log` 表的默认 ORDER BY 子句中移除 trace&#95;id。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 加密（属性 `encrypted_by`）现在可以应用于任何配置文件（config.xml、users.xml、嵌套配置文件）。此前，它仅适用于顶级 config.xml 文件。[#75911](https://github.com/ClickHouse/ClickHouse/pull/75911)（[Mikhail Gorshkov](https://github.com/mgorshkov)）。
* 改进 `system.warnings` 表，并新增对可动态添加、更新或删除的警告消息的支持。[#76029](https://github.com/ClickHouse/ClickHouse/pull/76029)（[Bharat Nallan](https://github.com/bharatnc)）。
* 此 PR 禁止执行查询 `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES`，因为所有 `DROP` 操作必须排在前面。[#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit))。
* 对 `SYNC REPLICA` 进行了多项改进（更清晰的错误信息、更完善的测试以及一致性检查）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* 在备份到 S3 时，如果多部分复制因 Access Denied 而失败，则使用正确的回退机制。当在使用不同凭证的存储桶之间执行备份时，多部分复制可能会触发 Access Denied 错误。[#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368))。
* 将 librdkafka（这个质量很糟糕的库）升级到 2.8.0 版本（升级也并未让情况好多少），并改进了 Kafka 表的关闭流程，从而减少在删除表和重启服务器时的延迟。`engine=Kafka` 在表被删除时不再显式离开 consumer group。现在，该 consumer 会继续留在 group 中，直到在一段时间内无活动后，根据 `session_timeout_ms`（默认：45 秒）被自动移除。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* 修复 S3 请求设置的验证。[#76658](https://github.com/ClickHouse/ClickHouse/pull/76658)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 像 `server_settings` 或 `settings` 这样的系统表有一个名为 `default` 的值列，非常方便。现在已在 `merge_tree_settings` 和 `replicated_merge_tree_settings` 中也提供该列。[#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie))。
* 添加了 `ProfileEvents::QueryPreempted`，其逻辑与 `CurrentMetrics::QueryPreempted` 类似。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu))。
* 此前，Replicated 数据库可能会将查询中指定的凭据记录到日志中。该问题已修复。已关闭相关 issue：[#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 允许在 `plain_rewritable disk` 上使用 ALTER TABLE DROP PARTITION。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* 备份/恢复设置 `allow_s3_native_copy` 现在支持三种可能的取值：- `False` - s3 native copy 将不会被使用；- `True`（旧默认） - ClickHouse 将首先尝试 s3 native copy，如果失败则回退到读取+写入的方式；- `'auto'`（新默认） - ClickHouse 会先比较源端和目标端的凭据。如果相同，ClickHouse 将尝试 s3 native copy，并可能在必要时回退到读取+写入的方式。如果不同，ClickHouse 将直接采用读取+写入的方式。[#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* 支持在 DeltaLake 表引擎的 delta kernel 中使用 AWS 会话令牌和环境凭证。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 修复在处理异步分布式 INSERT 的待处理批次时会卡住的问题（例如因 `No such file or directory` 错误）。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* 通过在索引分析期间对隐式 `Date` 到 `DateTime` 转换强制采用饱和处理行为，改进了日期时间转换。这解决了由于日期时间范围限制可能导致的索引分析结果不准确问题。修复了 [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307)。同时也修复了在 `date_time_overflow_behavior = 'ignore'`（默认值）时显式调用 `toDateTime` 的转换行为。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* 修复由 UUID 与表名之间竞态引发的各种错误（例如，这将修复 `RENAME` 和 `RESTART REPLICA` 之间的竞态。在 `RENAME` 与 `SYSTEM RESTART REPLICA` 并发的情况下，可能会导致重启错误的副本，和/或使其中一张表一直处于 `Table X is being restarted` 状态）。[#76308](https://github.com/ClickHouse/ClickHouse/pull/76308)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在启用 async insert 并使用 insert into ... from file ... 且块大小不一致时导致的数据丢失问题：如果第一个块的大小 &lt; async&#95;max&#95;size 而第二个块的大小 &gt; async&#95;max&#95;size，则第二个块不会被插入，对应数据将滞留在 `squashing` 中。[#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* 在 `system.data_skipping_indices` 中将列 &#39;marks&#39; 重命名为 &#39;marks&#95;bytes&#39;。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复动态文件系统缓存在淘汰过程中调整大小时处理意外错误的问题。[#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了并行哈希中 `used_flag` 的初始化问题，该问题可能会导致服务器崩溃。[#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat))。
* 修复在投影中调用 `defaultProfiles` 函数时的逻辑错误。[#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit))。
* 在 Web UI 中不再通过浏览器请求交互式基本身份验证。修复 [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319)。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复从分布式表中查询布尔字面量时出现的 THERE&#95;IS&#95;NO&#95;COLUMN 异常。[#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 表目录中的子路径选择方式更加合理。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在修改包含子列的主键的表后出现的错误 `Not found column in block`。在 [https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 之后，还需要 [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403)。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 为 NULL 短路机制添加性能测试并修复相关缺陷。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li))。
* 在完成输出之前刷新输出写缓冲区。修复在某些输出格式完成阶段产生的 `LOGICAL_ERROR`，例如 `JSONEachRowWithProgressRowOutputFormat`。[#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* 为 MongoDB 的二进制 UUID 提供了支持（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)） - 修复了在使用表函数时对 MongoDB 的 WHERE 条件下推（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)） - 更改了 MongoDB 与 ClickHouse 之间的类型映射，使得 MongoDB 的二进制 UUID 现在只能被解析为 ClickHouse 的 UUID 类型。此更改应避免今后出现歧义和意外情况。- 修复了 OID 映射，并保持向后兼容性。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 修复在并行前缀反序列化 JSON 子列时的异常处理。[#76809](https://github.com/ClickHouse/ClickHouse/pull/76809)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 `lgamma` 函数对负整数的处理方式。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 修复对显式定义的主键的反向键分析。类似于 [#76654](https://github.com/ClickHouse/ClickHouse/issues/76654)。[#76846](https://github.com/ClickHouse/ClickHouse/pull/76846)（[Amos Bird](https://github.com/amosbird)）。
* 修复 JSON 格式中布尔值的美化输出。 [#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在异步插入时发生错误、由于不正确的 JSON 列回滚而导致的潜在崩溃问题。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前，`multiIf` 在查询规划阶段和主执行阶段可能返回不同类型的列。这会导致在 C++ 语义下产生未定义行为的代码。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914) ([Nikita Taranov](https://github.com/nickitat))。
* 修复了在 MergeTree 中对常量 Nullable 键的错误序列化问题。此修复解决了 [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939)。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `BFloat16` 值的排序问题。已关闭 [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487)。已关闭 [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669)。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过在数据部分一致性检查中添加跳过临时子列的检查，修复了带有 Variant 子列的 JSON 的错误。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在 Values 格式的模板解析中因类型不匹配而导致的崩溃。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 不再允许创建主键包含子列的 EmbeddedRocksDB 表。此前可以创建此类表，但 `SELECT` 查询会失败。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复分布式查询中的非法比较问题，因为将谓词下推到远端时未正确处理字面量类型。[#77093](https://github.com/ClickHouse/ClickHouse/pull/77093)（[Duc Canh Le](https://github.com/canhld94)）。
* 修复在创建 Kafka 表时因异常导致的崩溃。[#77121](https://github.com/ClickHouse/ClickHouse/pull/77121)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 Kafka 和 RabbitMQ 引擎中支持 JSON 及其子列。[#77122](https://github.com/ClickHouse/ClickHouse/pull/77122)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 macOS 上异常堆栈展开的问题。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* 修复 `getSubcolumn` 函数中对 &#39;null&#39; 子列的读取。[#77163](https://github.com/ClickHouse/ClickHouse/pull/77163)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了与 `Array` 及不支持的函数一起使用时的 bloom filter 索引。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* 我们只应在初始 CREATE 查询时检查针对表数量的限制。[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 非缺陷：`SELECT toBFloat16(-0.0) == toBFloat16(0.0)` 现在会正确地返回 `true`（之前为 `false`）。这使其行为与 `Float32` 和 `Float64` 保持一致。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复了对未初始化的 key&#95;index 变量的可能错误引用，该问题可能会在调试版本中导致崩溃（在发行版本中，这种未初始化引用不会引发问题，因为后续代码很可能会抛出错误）。### 面向用户变更的文档条目。 [#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear))
* 修复 `Bool` 类型分区的名称。该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) 中引入的。[#77319](https://github.com/ClickHouse/ClickHouse/pull/77319)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复包含可空元素的元组与字符串之间的比较问题。例如，在此变更之前，将元组 `(1, null)` 与字符串 `'(1,null)'` 进行比较会导致错误。另一个例子是，将元组 `(1, a)`（其中 `a` 是 Nullable 列）与字符串 `'(1, 2)'` 进行比较。此变更解决了这些问题。[#77323](https://github.com/ClickHouse/ClickHouse/pull/77323)（[Alexey Katsman](https://github.com/alexkats)）。
* 修复 `ObjectStorageQueueSource` 中的崩溃问题。该问题由 [https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) 引入。[#77325](https://github.com/ClickHouse/ClickHouse/pull/77325)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 `async_insert` 与 `input` 的配合使用。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修复：当排序列被查询规划器移除时，`WITH FILL` 可能会因 `NOT_FOUND_COLUMN_IN_BLOCK` 错误而失败。同时修复了为 INTERPOLATE 表达式计算出的 DAG 不一致导致的类似问题。[#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复了若干与为无效 AST 节点设置别名相关的 LOGICAL&#95;ERROR。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* 在文件系统缓存实现中，修复了文件段写入时的错误处理问题。[#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 使 DatabaseIceberg 使用由目录提供的正确元数据文件。修复了 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) 中的问题。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 查询缓存现在默认将所有 UDF 视为非确定性函数。因此，包含 UDF 的查询结果将不再被缓存。此前，用户可以定义非确定性的 UDF，但其结果会被错误地缓存（问题 [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复 `system.filesystem_cache_log` 仅在将设置 `enable_filesystem_cache_log` 打开时才生效的问题。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在投影中调用 `defaultRoles` 函数时的逻辑错误。这是对 [#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) 的后续修复。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667) ([pufit](https://github.com/pufit))。
* 现在不再允许函数 `arrayResize` 的第二个参数为 `Nullable` 类型。此前，当第二个参数为 `Nullable` 时，可能会出现从报错到结果错误在内的各种问题（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 即使该操作不会产生任何要写入的数据块，也要定期检查合并和变更（mutations）是否被取消。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。

#### 构建/测试/打包改进

- `clickhouse-odbc-bridge` 和 `clickhouse-library-bridge` 已迁移至独立代码仓库 https://github.com/ClickHouse/odbc-bridge/。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 修复 Rust 交叉编译问题,并支持完全禁用 Rust。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 版本 25.2,2025-02-27 {#252}

#### 向后不兼容变更

- 默认完全启用 `async_load_databases`(即使对于未升级 `config.xml` 的安装实例也是如此)。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat))。
- 新增 `JSONCompactEachRowWithProgress` 和 `JSONCompactStringsEachRowWithProgress` 格式。延续 [#69989](https://github.com/ClickHouse/ClickHouse/issues/69989)。`JSONCompactWithNames` 和 `JSONCompactWithNamesAndTypes` 不再输出 "totals" —— 显然这是实现中的一个错误。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 将 `format_alter_operations_with_parentheses` 的默认值更改为 true,以消除 ALTER 命令列表的歧义(参见 https://github.com/ClickHouse/ClickHouse/pull/59532)。这会导致与 24.3 之前版本集群的复制中断。如果您正在升级使用旧版本的集群,请在服务器配置中关闭该设置,或先升级到 24.3。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano))。
- 移除使用正则表达式过滤日志消息的功能。该实现引入了数据竞争问题,因此必须移除。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 设置 `min_chunk_bytes_for_parallel_parsing` 不能再为零。这修复了:[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- 验证缓存配置中的设置。之前不存在的设置会被忽略,现在它们将抛出错误,应将其移除。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii))。


#### 新功能
* 支持类型 `Nullable(JSON)`。 [#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar)).
* 在 DEFAULT 和 MATERIALIZED 表达式中支持子列。 [#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar)).
* 通过设置 `output_format_parquet_write_bloom_filter`（默认启用）支持写入 Parquet 布隆过滤器。 [#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321)).
* Web UI 现在提供交互式数据库导航功能。 [#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在存储策略中允许组合使用只读磁盘和读写磁盘（作为多个卷或多个磁盘）。这样可以从整个卷读取数据，而写入将优先选择可写磁盘（即 Copy-on-Write 存储策略）。 [#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat)).
* 新增 `DatabaseBackup` 数据库引擎，可用于从备份中即时 ATTACH 表/数据库。 [#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal)).
* 在 Postgres wire 协议中支持 prepared statements。 [#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12)).
* 新增在没有 database 层的情况下 ATTACH 表的功能，这对位于 Web、S3 等外部虚拟文件系统上的 MergeTree 表非常有用。 [#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat)).
* 新增字符串比较函数 `compareSubstrings`，用于比较两个字符串的部分内容。示例：`SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` 的含义是“按字典序比较字符串 'Saxon' 和 'Anglo-Saxon' 的 6 个字节，从第一个字符串偏移量 0 开始，从第二个字符串偏移量 5 开始”。 [#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc)).
* 新增函数 `initialQueryStartTime`，用于返回当前查询的开始时间。在分布式查询中，该值在所有分片上都相同。 [#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik)).
* 为 MySQL 添加基于命名集合的 SSL 认证支持。关闭问题 [#59111](https://github.com/ClickHouse/ClickHouse/issues/59111)。 [#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 实验性功能
* 新增设置 `enable_adaptive_memory_spill_scheduler`，允许同一查询中的多个 Grace JOIN 监控其合并后的内存占用，并自适应地触发溢写到外部存储，从而防止 MEMORY_LIMIT_EXCEEDED。 [#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 使新的实验性 `Kafka` 表引擎完全遵循 Keeper 功能标志。 [#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 恢复在 v24.10 中因许可问题被移除的（Intel）QPL 编解码器。 [#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在与 HDFS 的集成中，增加对配置项 `dfs.client.use.datanode.hostname` 的支持。 [#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).



#### 性能改进
* 提升从 S3 读取 Wide 部分整个 JSON 列的性能。通过为子列前缀反序列化添加预取、对已反序列化前缀进行缓存，以及对子列前缀进行并行反序列化来实现。在类似 `SELECT data FROM table` 的查询中，从 S3 读取 JSON 列的性能提升约 4 倍，在类似 `SELECT data FROM table LIMIT 10` 的查询中提升约 10 倍。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了在 `max_rows_in_join = max_bytes_in_join = 0` 时 `parallel_hash` 中不必要的争用。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了当优化器交换 JOIN 两侧时，`ConcurrentHashJoin` 中的双重预分配问题。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149)（[Nikita Taranov](https://github.com/nickitat)）。
* 在某些 JOIN 场景中进行了轻微优化：预先计算输出行数并为其预留内存。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376)（[Alexander Gololobov](https://github.com/davenger)）。
* 对于类似 `WHERE a < b AND b < c AND c < 5` 的查询，可以推导出新的比较条件（`a < 5 AND b < 5`），以获得更好的过滤效果。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164)（[Shichao Jin](https://github.com/jsc0218)）。
* Keeper 改进：在提交到内存存储时关闭 digest 计算以获得更好性能。可以通过 `keeper_server.digest_enabled_on_commit` 配置重新启用。digest 在请求预处理时仍然会被计算。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490)（[Antonio Andelic](https://github.com/antonio2368)）。
* 在可能的情况下，将过滤表达式从 JOIN ON 子句中下推。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 MergeTree 中延迟计算列和索引大小。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938)（[Pavel Kruglov](https://github.com/Avogar)）。
* 重新在 `MATERIALIZE TTL` 中遵循 `ttl_only_drop_parts` 设置；只读取重新计算 TTL 所需的列，并通过将 part 替换为空 part 来删除这些 part。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751)（[Andrey Zvonov](https://github.com/zvonand)）。
* 降低 plain_rewritable 元数据文件的写缓冲区大小。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758)（[Julia Kartseva](https://github.com/jkartseva)）。
* 降低某些窗口函数的内存使用。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647)（[lgbo](https://github.com/lgbo-ustc)）。
* 同时评估 Parquet Bloom filter 和 min/max 索引。这对于正确支持 `x = 3 or x > 5`（其中 data = [1, 2, 4, 5]）是必要的。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383)（[Arthur Passos](https://github.com/arthurpassos)）。
* 传递给 `Executable` 存储引擎的查询不再被限制为单线程执行。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084)（[yawnt](https://github.com/yawnt)）。
* 在 ALTER TABLE FETCH PARTITION 中并行拉取分区（线程池大小由 `max_fetch_partition_thread_pool_size` 控制）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978)（[Azat Khuzhin](https://github.com/azat)）。
* 允许将带 `indexHint` 函数的谓词下推到 `PREWHERE`。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987)（[Anton Popov](https://github.com/CurtizJ)）。



#### 改进

* 修复了 `LowCardinality` 列内存占用大小的计算。[#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat))。
* `processors_profile_log` 表现在有默认配置，TTL 为 30 天。[#66139](https://github.com/ClickHouse/ClickHouse/pull/66139)（[Ilya Yatsishin](https://github.com/qoega)）。
* 在集群配置中支持为分片命名。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 将 Prometheus 远程写入响应的成功状态码从 200/OK 修改为 204/NoContent。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* 新增支持在无需重启服务器的情况下，动态重新加载 `max_remote_read_network_bandwidth_for_serve` 和 `max_remote_write_network_bandwidth_for_server`。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu))。
* 允许在创建备份时使用 blob 路径计算校验和。[#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* 为 `system.query_cache` 新增了查询 ID 列（修复了 [#68205](https://github.com/ClickHouse/ClickHouse/issues/68205)）。 [#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 现在可以使用 `KILL QUERY` 或通过超时（`max_execution_time`）自动取消 `ALTER TABLE ... FREEZE ...` 查询。[#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar))。
* 为将 `groupUniqArrayArrayMap` 用作 `SimpleAggregateFunction` 添加支持。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers))。
* 在数据库引擎 `Iceberg` 中隐藏目录凭据相关设置。修复 [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559)。[#75080](https://github.com/ClickHouse/ClickHouse/pull/75080)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `intExp2` / `intExp10`：为此前未定义的行为做出规定：对于过小的参数返回 0，对于过大的参数返回 `18446744073709551615`，若为 `nan` 则抛出异常。[#75312](https://github.com/ClickHouse/ClickHouse/pull/75312)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 在 `DatabaseIceberg` 的 catalog 配置中原生支持 `s3.endpoint`。修复 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558)。[#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 当用户执行 `SYSTEM DROP REPLICA` 且权限不足时，不再静默失败。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc))。
* 新增一个用于统计任意系统日志刷新失败次数的 ProfileEvent。[#75466](https://github.com/ClickHouse/ClickHouse/pull/75466)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为解密和解压缩添加检查和额外日志。[#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `parseTimeDelta` 函数中新增对微符号（micro sign，U+00B5）的支持。现在，微符号（micro sign，U+00B5）和希腊字母 μ（mu，U+03BC）都会被识别为微秒的有效表示形式，使 ClickHouse 的行为与 Go 的实现保持一致（[参见 time.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) 和 [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* 将服务器端设置项（`send_settings_to_client`）替换为客户端设置项（`apply_settings_from_server`），用于控制客户端代码（例如解析 INSERT 数据和格式化查询输出）是否应当采用服务器 `users.xml` 及用户配置文件中的设置。否则，仅使用来自客户端命令行、会话和查询中的设置。请注意，这仅适用于原生客户端（不适用于如 HTTP 之类的接口），并且不适用于大多数查询处理流程（这些都在服务器端执行）。[#75478](https://github.com/ClickHouse/ClickHouse/pull/75478)（[Michael Kolupaev](https://github.com/al13n321)）。
* 针对语法错误提供了更好的错误消息。此前，如果查询过大，且长度超过限制的标记是一个非常大的字符串字面量，那么说明错误原因的消息会被淹没在该超长标记的两个示例之间。修复了在错误消息中包含 UTF-8 字符的查询被错误截断的问题。修复了查询片段中过度加引号的问题。解决了 [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473)。[#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在存储 `S3(Azure)Queue` 中添加 ProfileEvents 事件。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为保证兼容性，将从服务器向客户端发送设置的功能禁用（`send_settings_to_client=false`）（该功能稍后将作为客户端设置重新实现，以提升易用性）。 [#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321)).
* 新增配置项 `memory_worker_correct_memory_tracker`，以便利用后台线程定期读取的多种来源信息来校正内部内存跟踪器。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* 在 `system.processes` 中添加列 `normalized_query_hash`。注意：虽然可以使用 `normalizedQueryHash` 函数轻松实时计算该值，但这是为后续变更做准备所必需的。[#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 即使在已不存在的数据库上创建了 `Merge` 表，查询 `system.tables` 也不会抛出异常。移除 `Hive` 表中的 `getTotalRows` 方法，因为我们不允许它执行复杂操作。[#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 将备份的 start&#95;time/end&#95;time 以微秒精度进行存储。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* 新增 `MemoryTrackingUncorrected` 指标，用于显示未经过 RSS 校正的内部全局内存跟踪器的值。[#75935](https://github.com/ClickHouse/ClickHouse/pull/75935)（[Antonio Andelic](https://github.com/antonio2368)）。
* 允许在 `PostgreSQL` 或 `MySQL` 表函数中解析类似 `localhost:1234/handle` 的端点。此更改修复了在 [https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) 中引入的回归缺陷。[#75944](https://github.com/ClickHouse/ClickHouse/pull/75944)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 新增了服务器设置 `throw_on_unknown_workload`，用于选择在查询中将 `workload` 设置为未知值时的处理方式：可以允许不受限制的访问（默认），或抛出 `RESOURCE_ACCESS_DENIED` 错误。该设置对于强制所有查询使用 workload 调度非常有用。[#75999](https://github.com/ClickHouse/ClickHouse/pull/75999)（[Sergei Trifonov](https://github.com/serxa)）。
* 如果没有必要，不要在 `ARRAY JOIN` 中将子列重写成 `getSubcolumn`。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* 在加载表时遇到协调错误时进行重试。[#76020](https://github.com/ClickHouse/ClickHouse/pull/76020)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 支持在 `SYSTEM FLUSH LOGS` 命令中刷新单个日志。[#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano))。
* 改进了 `/binary` 服务器的页面。使用 Hilbert 曲线替代 Morton 曲线。在正方形中显示 512 MB 的地址空间，使正方形填充得更充分（在之前的版本中，地址只填满正方形的一半）。对更接近库名而非函数名的地址进行着色。允许在区域外多滚动一些。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在出现 TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES 错误时重试 ON CLUSTER 查询。[#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* 添加异步指标 `CPUOverload`，用于计算服务器 CPU 资源的相对缺口。[#76404](https://github.com/ClickHouse/ClickHouse/pull/76404)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `output_format_pretty_max_rows` 的默认值从 10000 更改为 1000。这有助于提升可用性。[#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov))。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 在查询解释阶段，如果出现异常，则按照查询中指定的自定义格式对异常进行格式化。此前的版本中，异常始终使用默认格式进行格式化，而不是使用查询中指定的格式。本次更改修复了 [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422)。[#74994](https://github.com/ClickHouse/ClickHouse/pull/74994)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 SQLite 的类型映射（整数类型映射为 `int64`，浮点数类型映射为 `float64`）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x))。
* 修复父作用域中的标识符解析问题。允许在 WITH 子句中为表达式使用别名。修复 [#58994](https://github.com/ClickHouse/ClickHouse/issues/58994)。修复 [#62946](https://github.com/ClickHouse/ClickHouse/issues/62946)。修复 [#63239](https://github.com/ClickHouse/ClickHouse/issues/63239)。修复 [#65233](https://github.com/ClickHouse/ClickHouse/issues/65233)。修复 [#71659](https://github.com/ClickHouse/ClickHouse/issues/71659)。修复 [#71828](https://github.com/ClickHouse/ClickHouse/issues/71828)。修复 [#68749](https://github.com/ClickHouse/ClickHouse/issues/68749)。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 `negate` 函数的单调性问题。在先前版本中，查询 `select * from a where -x = -42;`（其中 `x` 为主键）可能会返回错误结果。[#71440](https://github.com/ClickHouse/ClickHouse/pull/71440)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复 `arrayIntersect` 中空元组的处理，从而修复了 [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578)。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 修复读取 JSON 子对象的子列时前缀错误的问题。[#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar))。
* 在客户端与服务器通信中正确传递 Native 格式设置。[#73924](https://github.com/ClickHouse/ClickHouse/pull/73924)（[Pavel Kruglov](https://github.com/Avogar)）。
* 检查某些存储中不受支持的类型。[#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 macOS 上通过 PostgreSQL 接口执行 `INSERT INTO SELECT` 查询时的崩溃问题（问题 [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。 [#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* 修复了复制数据库中未初始化的 `max_log_ptr`。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov))。
* 修复在插入 `interval` 类型值时出现的崩溃（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 修复对常量 JSON 字面量的格式化。此前在将查询发送到另一台服务器时，可能会因此导致语法错误。[#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在启用隐式投影时使用常量分区表达式会导致 `CREATE` 查询出错的问题。修复了 [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596)。[#74634](https://github.com/ClickHouse/ClickHouse/pull/74634)（[Amos Bird](https://github.com/amosbird)）。
* 避免在 INSERT 因异常结束后导致连接处于异常状态。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 避免重用已遗留在中间状态的连接。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat)).
* 修复在解析 JSON 类型声明时，如果类型名不是大写会导致的崩溃问题。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper：修复在连接建立之前已被终止时出现的 logical&#95;error。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了当存在使用 `AzureBlobStorage` 的表时服务器无法启动的问题。现在可以在无需向 Azure 发送任何请求的情况下加载这些表。[#74880](https://github.com/ClickHouse/ClickHouse/pull/74880)（[Alexey Katsman](https://github.com/alexkats)）。
* 修复 `query_log` 中 BACKUP 和 RESTORE 操作的 `used_privileges` 和 `missing_privileges` 字段缺失问题。[#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats))。
* 如果在 HDFS SELECT 请求期间发生 SASL 错误，则刷新 Kerberos 票据。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* 修复 startup&#95;scripts 中针对 Replicated 数据库的查询。[#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat))。
* 修复在使用空安全比较时，`JOIN ON` 子句中使用类型别名的表达式处理不正确的问题。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 当 remove 操作失败时，将 part 的状态从 deleting 还原为 outdated。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 在早期版本中，当存在标量子查询时，我们会在数据格式初始化阶段开始写入进度信息（从处理该子查询中累积的进度），而该阶段发生在写入 HTTP 头部之前。由此导致 HTTP 头部（例如 X-ClickHouse-QueryId 和 X-ClickHouse-Format，以及 Content-Type）丢失。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 `database_replicated_allow_replicated_engine_arguments=0` 时对 `CREATE TABLE AS...` 查询的处理。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在发生 INSERT 异常后客户端连接被遗留在错误状态的问题。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* 修复由于 PSQL 复制中未捕获的异常而导致的崩溃。[#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat))。
* SASL 可能导致任意 RPC 调用失败，此修复可在 krb5 ticket 过期时重试该调用。[#75063](https://github.com/ClickHouse/ClickHouse/pull/75063)（[inv2004](https://github.com/inv2004)）。
* 修复了在启用 `optimize_function_to_subcolumns` 设置时，对 `Array`、`Map` 和 `Nullable(..)` 列使用索引（主索引和二级索引）的行为。此前，这些列上的索引可能会被忽略。[#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 在使用内部表创建物化视图时，应禁用 `flatten_nested`，因为之后将无法使用这些被展开的列。[#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm))。
* 修复了在 `forwarded_for` 字段中对某些 IPv6 地址（例如 ::ffff:1.1.1.1）的错误解析问题，该问题会导致客户端因异常而断开连接。[#75133](https://github.com/ClickHouse/ClickHouse/pull/75133)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了对 LowCardinality 可为 NULL 数据类型的 nullsafe JOIN 处理。此前在使用 nullsafe 比较（例如 `IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b`）的 JOIN ON 时，针对 LowCardinality 列的处理不正确。[#75143](https://github.com/ClickHouse/ClickHouse/pull/75143)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 确保在为 NumRowsCache 统计 `total_number_of_rows` 时不会指定 `key_condition`。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik))。
* 使用新分析器修复带有未使用插值的查询。 [#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了在 INSERT 中使用 CTE 时导致崩溃的错误。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper 修复：在回滚日志时避免向已损坏的变更日志写入。[#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 在合适的情况下使用 `BFloat16` 作为超类型。由此关闭：[#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复在使用 any&#95;join&#95;distinct&#95;right&#95;table&#95;keys 且在 JOIN ON 子句中包含 OR 时，连接结果中出现的意外的默认值问题。[#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 对 azureblobstorage 表引擎的凭据进行脱敏处理。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* 修复了 ClickHouse 在某些情况下可能错误地将过滤条件下推到 PostgreSQL、MySQL 或 SQLite 等外部数据库的行为。已关闭的问题：[#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复了在使用 Protobuf 格式输出数据时，并行执行查询 `SYSTEM DROP FORMAT SCHEMA CACHE` 可能导致的 Protobuf 模式缓存崩溃问题。[#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在并行副本模式下将 `HAVING` 子句中的过滤条件下推时可能出现的逻辑错误或未初始化内存问题。[#75363](https://github.com/ClickHouse/ClickHouse/pull/75363)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 隐藏 `icebergS3` 和 `icebergAzure` 表函数及表引擎中的敏感信息。[#75378](https://github.com/ClickHouse/ClickHouse/pull/75378)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 现在可以正确处理 `TRIM` 函数中通过计算得到的空修剪字符参数。例如：`SELECT TRIM(LEADING concat('') FROM 'foo')`（问题 [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* 修复 IOutputFormat 中的数据竞争。[#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在对分布式表执行 JOIN 时使用 Array 类型的 JSON 子列时可能出现的错误 `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes`。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复使用 `CODEC(ZSTD, DoubleDelta)` 时发生的数据损坏。关闭 [#70031](https://github.com/ClickHouse/ClickHouse/issues/70031)。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `allow_feature_tier` 与 MergeTree 兼容性设置之间的交互问题。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* 在重试文件的情况下，修复 `system.s3queue_log` 中不正确的 `processed_rows` 值。[#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当物化视图写入 URL 引擎且发生连接问题时，遵循 `materialized_views_ignore_errors` 设置。[#75679](https://github.com/ClickHouse/ClickHouse/pull/75679)（[Christoph Wurm](https://github.com/cwurm)）。
* 修复了在多次对不同类型的列之间执行异步 `RENAME` 查询（`alter_sync = 0`）后，从 `MergeTree` 表读取数据时可能发生的罕见崩溃问题。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在某些包含 `UNION ALL` 的查询中出现的 `Block structure mismatch in QueryPipeline stream` 错误。[#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在对其主键列执行 ALTER MODIFY 操作时重建投影。此前，如果对用于投影主键的列执行 ALTER MODIFY 操作，可能会在之后的查询中导致 `CANNOT_READ_ALL_DATA` 错误。[#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在启用 analyzer 时，标量子查询的 `ARRAY JOIN` 结果不正确的问题。[#75732](https://github.com/ClickHouse/ClickHouse/pull/75732)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复 `DistinctSortedStreamTransform` 中的空指针解引用问题。[#75734](https://github.com/ClickHouse/ClickHouse/pull/75734)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复 `allow_suspicious_ttl_expressions` 的行为。 [#75771](https://github.com/ClickHouse/ClickHouse/pull/75771) ([Aleksei Filatov](https://github.com/aalexfvk))。
* 修复函数 `translate` 中读取未初始化内存的问题，从而关闭了 [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592)。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 Native 格式中，将格式设置传递到 JSON 作为字符串的格式化。[#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar))。
* 在设置变更历史中记录了在 v24.12 中默认启用并行哈希 JOIN 算法的变更。这意味着，如果配置了早于 v24.12 的兼容性级别，ClickHouse 将继续使用非并行哈希 JOIN 算法。[#75870](https://github.com/ClickHouse/ClickHouse/pull/75870)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复了一个问题，该问题导致带有隐式添加的 min-max 索引的表无法复制到新表中（问题 [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` 允许从文件系统中打开任意库，因此只有在隔离环境中运行才是安全的。为防止其与 clickhouse-server 部署在同一环境中运行时出现漏洞，我们将把库路径限制为仅允许访问配置中指定的位置。此漏洞由 **Arseniy Dugin** 通过 [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) 发现。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 我们曾经对某些元数据使用了 JSON 序列化，但这其实是一个错误，因为 JSON 不支持在字符串字面量中包含二进制数据（包括零字节）。SQL 查询可以包含二进制数据以及无效的 UTF-8，因此我们也必须在元数据文件中支持这一点。同时，ClickHouse 的 `JSONEachRow` 及类似格式通过在标准 JSON 规范上做出扩展来优先保证二进制数据的无损往返，从而规避了这一问题。动机说明参见：[https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解决方案是让 `Poco::JSON` 库与 ClickHouse 中 JSON 格式的序列化方式保持一致。此更改解决了 [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668)。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复存储 `S3Queue` 中提交限制的检查逻辑。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在附加启用自动索引（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）的 MergeTree 表时出现的问题。[#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* 修复了作业父线程的堆栈跟踪（受 `enable_job_stack_trace` 设置控制）未被打印的问题。修复了 `enable_job_stack_trace` 设置未正确传播到各线程，导致生成的堆栈跟踪内容不总是遵循该设置的问题。[#76191](https://github.com/ClickHouse/ClickHouse/pull/76191)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了权限检查错误，之前 `ALTER RENAME` 被错误地要求具备 `CREATE USER` 权限。解决 [#74372](https://github.com/ClickHouse/ClickHouse/issues/74372)。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* 在大端架构上修复 reinterpretAs 对 FixedString 的处理。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* 修复 S3Queue 中的逻辑错误 “Expected current processor {} to be equal to {} for bucket {}”。 [#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复对 Memory 数据库执行 ALTER 时可能发生的死锁问题。 [#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `WHERE` 条件中包含 `pointInPolygon` 函数时索引分析中的逻辑错误。[#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* 修复信号处理程序中可能存在的不安全调用。[#76549](https://github.com/ClickHouse/ClickHouse/pull/76549)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复 `PartsSplitter` 中对反向键的支持，从而修复了 [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400)。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### 构建/测试/打包改进

- 支持在 ARM 和 Intel Mac 上构建 HDFS。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
- 为 Darwin 交叉编译时启用 ICU 和 GRPC。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
- 更新至嵌入式 LLVM 19。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 在 Docker 镜像中禁用 default 用户的网络访问。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。将所有 clickhouse-server 相关操作改为函数,并仅在 `entrypoint.sh` 中启动默认二进制文件时执行。这项长期推迟的改进建议最初在 [#50724](https://github.com/ClickHouse/ClickHouse/issues/50724) 中提出。为 `clickhouse-extract-from-config` 添加 `--users` 开关,用于从 `users.xml` 获取值。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 从二进制文件中移除约 20MB 的冗余代码。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouse 版本 25.1,2025-01-28 {#251}


#### 向后不兼容的变更
* `JSONEachRowWithProgress` 现在会在进度发生时立即写出进度。在之前的版本中，只在每个结果块之后才显示进度，这使得进度显示几乎无用。更改进度的显示方式：在进度为零时将不再显示。此变更关闭了 [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800)。[#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` 表将通过使用其列的并集并推导公共类型来统一底层表的结构。此变更关闭了 [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864)。在某些情况下，此更改可能向后不兼容。一种情况是，表之间不存在公共类型，但仍然可以转换为第一个表的类型，例如 UInt64 和 Int64，或任意数值类型与 String。如果你希望恢复旧行为，请将 `merge_table_max_tables_to_look_for_schema_inference` 设置为 `1`，或者将 `compatibility` 设置为 `24.12` 或更早版本。[#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 输出格式会将 Date 和 DateTime 列转换为 Parquet 支持的日期/时间类型，而不是以原始数字形式写出。`DateTime` 现在变为 `DateTime64(3)`（之前为：`UInt32`）；开启设置 `output_format_parquet_datetime_as_uint32` 可恢复旧行为。`Date` 现在变为 `Date32`（之前为：`UInt16`）。[#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* 默认情况下，不再允许在 `ORDER BY` 和比较函数 `less/greater/equal/etc` 中使用不可比较类型（例如 `JSON`/`Object`/`AggregateFunction`）。[#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 过时的 `MaterializedMySQL` 数据库引擎已被移除且不再可用。[#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` 字典源不再执行 `SHOW TABLE STATUS` 查询，因为对于 InnoDB 表以及任意较新的 MySQL 版本，该查询不会提供任何有意义的值。此变更关闭了 [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636)。此变更是向后兼容的，但被放在此类别中，以便你有机会注意到它。[#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` 查询现在需要单独的 `CHECK` 权限。在之前的版本中，仅拥有 `SHOW TABLES` 权限即可运行这些查询。但 `CHECK TABLE` 查询可能非常耗资源，而且常规的 `SELECT` 查询复杂度限制并不适用于它，这带来了潜在的拒绝服务攻击（DoS）风险。[#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 函数 `h3ToGeo()` 现在以 `(lat, lon)` 顺序返回结果（这是几何函数的标准顺序）。希望保留旧有结果顺序 `(lon, lat)` 的用户可以将设置 `h3togeo_lon_lat_result_order` 设为 true。[#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新的 MongoDB 驱动程序现在为默认驱动程序。希望继续使用旧驱动程序的用户可以将服务器设置 `use_legacy_mongodb_integration` 设为 true。[#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。



#### 新功能

* 新增了在提交之后，可以在 `SELECT` 查询执行期间立即应用尚未完成（尚未由后台进程物化）的 mutation 的能力。可以通过设置 `apply_mutations_on_fly` 来启用。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* 为 Iceberg 表的与时间相关的 transform 分区操作实现分区裁剪（partition pruning）。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik)).
* 在 MergeTree 排序键和跳过索引中支持子列。[#72644](https://github.com/ClickHouse/ClickHouse/pull/72644)（[Pavel Kruglov](https://github.com/Avogar)）。
* 支持从 `Apache Arrow`/`Parquet`/`ORC` 读取 `HALF_FLOAT` 值（会被读取为 `Float32`）。这解决了 [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960)。请注意，IEEE-754 half float 与 `BFloat16` 并不相同。解决 [#73835](https://github.com/ClickHouse/ClickHouse/issues/73835)。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` 表包含两个新列：`symbols` 和 `lines`，用于存储已符号化的堆栈跟踪。这便于收集和导出性能分析信息。该功能由 `trace_log` 中的服务器配置项 `symbolize` 控制，默认启用。[#73896](https://github.com/ClickHouse/ClickHouse/pull/73896)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增函数 `generateSerialID`，可用于在表中生成自增序号。是对 [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310)（[kazalika](https://github.com/kazalika)）的延续。此改动关闭了 [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485)。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 DDL 查询新增语法 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN`。这意味着子查询 `{query1, query2, ... queryN}` 可以相互并行执行（并且推荐这样使用）。[#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar))。
* 为反序列化的 skipping 索引粒度新增了一个内存缓存。这应当可以加速多次执行、且使用 skipping 索引的查询。新缓存的大小由服务器设置项 `skipping_index_cache_size` 和 `skipping_index_cache_max_entries` 控制。引入该缓存的最初动机是向量相似度索引，而它们现在已经快了许多。[#70102](https://github.com/ClickHouse/ClickHouse/pull/70102)（[Robert Schulze](https://github.com/rschu1ze)）。
* 现在，嵌入式 Web 界面在查询运行期间显示进度条，并支持取消查询。它会显示记录总数以及更详细的速度信息。表格可以在数据一到达时就开始增量渲染。启用 HTTP 压缩，并加快了表格渲染速度。表头现在是固定的。它支持选中单元格，并可通过方向键进行导航。修复了选中单元格轮廓导致单元格变小的问题。单元格不再在鼠标悬停时展开，而只在选中时展开。停止渲染传入数据的时机现在由客户端而不是服务器端决定。对数字的分组位进行高亮显示。整体设计焕然一新，风格更加醒目。它会检查服务器是否可达以及凭据是否正确，并显示服务器版本和运行时间。云图标在所有字体和浏览器中都采用描边样式，包括 Safari。嵌套数据类型中的大整数将获得更好的渲染效果。它将正确显示 inf/nan。将鼠标悬停在列标题上时会显示数据类型。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过设置 `add_minmax_index_for_numeric_columns`（用于数值列）和 `add_minmax_index_for_string_columns`（用于字符串列），新增对由 MergeTree 管理的列默认创建 min-max（跳过）索引的功能。目前这两个设置均为禁用状态，因此暂时不会产生行为变更。[#74266](https://github.com/ClickHouse/ClickHouse/pull/74266)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 将 `script_query_number` 和 `script_line_number` 字段添加到 `system.query_log`、原生协议中的 ClientInfo，以及服务器日志中。此更改解决了 [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542)。感谢 [pinsvin00](https://github.com/pinsvin00) 此前在 [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) 中推动该特性。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增聚合函数 `sequenceMatchEvents`，用于在给定模式中返回最长匹配事件链中事件的时间戳。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus))。
* 新增 `arrayNormalizedGini` 函数。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl)).
* 为 `DateTime64` 类型添加对减号运算符的支持，以允许在 `DateTime64` 值之间以及与 `DateTime` 之间进行减法运算。[#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg))。



#### 实验性特性
* `BFloat16` 数据类型已可用于生产环境。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### 性能改进

* 优化了函数 `indexHint`。现在，仅作为函数 `indexHint` 参数使用的列不会再从表中读取。[#74314](https://github.com/ClickHouse/ClickHouse/pull/74314)（[Anton Popov](https://github.com/CurtizJ)）。如果 `indexHint` 函数是企业数据架构的核心组件，这项优化将会让你受益匪浅。
* 对 `parallel_hash` JOIN 算法中的 `max_joined_block_size_rows` 设置进行更精确的计量，有助于避免相比 `hash` 算法出现更高的内存消耗。[#74630](https://github.com/ClickHouse/ClickHouse/pull/74630)（[Nikita Taranov](https://github.com/nickitat)）。
* 在查询计划层面为 `MergingAggregated` 步骤实现谓词下推优化，从而提升了使用 analyzer 的部分查询的性能。[#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在 `parallel_hash` JOIN 算法的探测阶段中，已移除了按哈希拆分左表数据块的步骤。[#73089](https://github.com/ClickHouse/ClickHouse/pull/73089)（[Nikita Taranov](https://github.com/nickitat)）。
* 优化 RowBinary 输入格式。修复了 [#63805](https://github.com/ClickHouse/ClickHouse/issues/63805)。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* 当启用 `optimize_on_insert` 时，将数据片段写为 level 1。这样可以在针对新写入的片段执行带有 `FINAL` 的查询时使用多种优化。[#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ))。
* 通过底层优化提升字符串反序列化性能。[#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* 在对记录进行相等性比较时（例如在合并过程中），应优先从最有可能不相等的列开始比较行。[#63780](https://github.com/ClickHouse/ClickHouse/pull/63780)（[UnamedRus](https://github.com/UnamedRus)）。
* 通过按键对右侧连接表重新排序，以提升 Grace Hash Join 的性能。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* 允许 `arrayROCAUC` 和 `arrayAUCPR` 仅计算整条曲线的部分面积，以便在海量数据集上并行计算。[#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias)).
* 避免产生过多空闲线程。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* 如果在表函数中仅使用花括号展开，则不要列出 Blob 存储键。关闭了 [#73333](https://github.com/ClickHouse/ClickHouse/issues/73333)。 [#73518](https://github.com/ClickHouse/ClickHouse/pull/73518) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 对在 Nullable 参数上执行的函数进行了短路求值优化。[#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li))。
* 避免在非函数列上应用 `maskedExecute`，提高短路执行性能。[#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc))。
* 禁用 `Kafka`/`NATS`/`RabbitMQ`/`FileLog` 输入格式的表头自动检测以提升性能。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat)).
* 在使用 grouping sets 进行聚合后，以更高并行度执行流水线。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* 缩小 `MergeTreeReadPool` 中的临界区范围。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* 并行副本性能改进。对于与并行副本协议无关的数据包，其在查询发起端的反序列化现在始终在 pipeline 线程中执行。此前，它可能会在负责 pipeline 调度的线程中执行，从而降低发起端的响应性能并延迟 pipeline 的执行。[#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter))。
* 提升 Keeper 中大规模 multi 请求的性能。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* 按值使用日志包装器，不要在堆上为其分配内存。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 在后台重新建立到 MySQL 和 Postgres 字典副本的连接，从而不会延迟对相应字典的请求。[#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 并行副本基于副本可用性的历史信息来优化副本选择，但在与副本的连接不可用时不会更新该副本的错误计数。此 PR 在副本不可用时会更新该副本的错误计数。[#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi))。
* 新增了一个 MergeTree 设置项 `materialize_skip_indexes_on_merge`，用于在合并过程中禁止创建 skip 索引。这样用户可以通过显式执行 `ALTER TABLE [..] MATERIALIZE INDEX [...]` 来控制何时创建 skip 索引。如果构建 skip 索引的开销较大（例如向量相似度索引），这一设置会非常有用。[#74401](https://github.com/ClickHouse/ClickHouse/pull/74401)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 Storage(S3/Azure)Queue 中优化 Keeper 请求。[#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 默认最多可使用 `1000` 个并行副本。[#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在从 S3 磁盘读取数据时改进 HTTP 会话复用（[#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)）。[#74548](https://github.com/ClickHouse/ClickHouse/pull/74548)（[Julian Maicher](https://github.com/jmaicher)）。





#### 改进

* 在带有隐式 ENGINE 的 CREATE TABLE 查询中支持使用 SETTINGS，并支持同时混用引擎设置和查询设置。[#73120](https://github.com/ClickHouse/ClickHouse/pull/73120)（[Raúl Marín](https://github.com/Algunenano)）。
* 将 `use_hive_partitioning` 设置为默认启用。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 支持在参数不同的 JSON 类型之间执行 CAST 和 ALTER 操作。[#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar))。
* 支持对 JSON 列中的值进行相等比较。[#72991](https://github.com/ClickHouse/ClickHouse/pull/72991)（[Pavel Kruglov](https://github.com/Avogar)）。
* 改进包含 JSON 子列的标识符的格式，避免使用不必要的反引号。[#73085](https://github.com/ClickHouse/ClickHouse/pull/73085)（[Pavel Kruglov](https://github.com/Avogar)）。
* 交互式指标改进。修复来自并行副本的指标无法完整显示的问题。按最近更新时间排序显示指标，然后按名称的字典序排序。不显示陈旧的指标。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631)（[Julia Kartseva](https://github.com/jkartseva)）。
* 默认对 JSON 输出进行美化。新增设置 `output_format_json_pretty_print` 用于控制该行为，并默认启用。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* 默认允许使用 `LowCardinality(UUID)`。实践表明，这对 ClickHouse Cloud 的客户而言非常实用。[#73826](https://github.com/ClickHouse/ClickHouse/pull/73826)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 改进了安装过程中的提示信息。[#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进了 ClickHouse Cloud 的密码重置提示信息。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进在 File 表无法向文件追加写入时的错误消息。[#73832](https://github.com/ClickHouse/ClickHouse/pull/73832)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当用户在终端中不小心请求输出二进制格式（例如 Native、Parquet、Avro）时，提示进行确认。此更改关闭了 [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524)。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在终端的 Pretty 和 Vertical 输出格式中高亮显示行尾空格，以提升显示效果的清晰度。该行为通过 `output_format_pretty_highlight_trailing_spaces` 设置进行控制。初始实现由 [Braden Burns](https://github.com/bradenburns) 提供，见 [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996)。关闭了 [#71590](https://github.com/ClickHouse/ClickHouse/issues/71590)。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当 `stdin` 从文件重定向时，`clickhouse-client` 和 `clickhouse-local` 将自动检测其压缩格式。这修复了 [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865)。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 pretty 输出格式中默认截断过长的列名。该行为由 `output_format_pretty_max_column_name_width_cut_to` 和 `output_format_pretty_max_column_name_width_min_chars_to_cut` 设置控制。这是对 [tanmaydatta](https://github.com/tanmaydatta) 在 [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) 中工作的延续。本更改关闭了 [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968)。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 让 `Pretty` 格式更美观：如果距离上一个数据块输出的时间不长，则将多个数据块压缩合并。该行为由新的设置 `output_format_pretty_squash_consecutive_ms`（默认 50 ms）和 `output_format_pretty_squash_max_wait_ms`（默认 1000 ms）控制。是对 [#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) 的延续，并关闭了 [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153)。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增用于统计当前正在合并的源数据片数量的指标。由此关闭了 [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809)。[#73868](https://github.com/ClickHouse/ClickHouse/pull/73868)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当输出到终端时，对 `Vertical` 格式中的列进行高亮显示。可以通过 `output_format_pretty_color` 设置禁用此行为。 [#73898](https://github.com/ClickHouse/ClickHouse/pull/73898) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 MySQL 兼容性增强到现在 `mysqlsh`（Oracle 提供的功能丰富的 MySQL 命令行工具）也可以连接到 ClickHouse 的程度。这是为了便于测试。[#73912](https://github.com/ClickHouse/ClickHouse/pull/73912)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Pretty 系列格式可以在表格单元格内渲染多行字段，从而提高可读性。该功能默认启用，并可通过设置 `output_format_pretty_multiline_fields` 进行控制。该改进延续了 [Volodyachan](https://github.com/Volodyachan) 在 [#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) 中的工作。此更改关闭了 [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912)。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在浏览器中向 JavaScript 暴露 X-ClickHouse HTTP 头，从而使编写应用程序更加方便。[#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `JSONEachRowWithProgress` 格式现在会包含事件及其元数据，以及 totals 和 extremes。同时还会包含 `rows_before_limit_at_least` 和 `rows_before_aggregation`。如果在部分结果之后出现异常，该格式会正确输出该异常。进度信息现在包括已耗费的纳秒数。结束时会发出最后一次进度事件。在查询运行期间，进度信息的输出频率不会高于 `interactive_delay` 设置的值。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 Play UI 中的沙漏图标将平滑旋转。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 即便 HTTP 响应已压缩，也要在各个数据包到达时立即发送出去。这样浏览器仍然可以接收进度数据包和压缩数据。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 如果输出记录的数量大于 N = `output_format_pretty_max_rows`，则不再仅显示前 N 行，而是从中间截断输出表，显示前 N/2 行和最后 N/2 行。作为对 [#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) 的延续。本次更改关闭了 [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502)。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在启用哈希 JOIN 算法时，允许使用更通用的 JOIN 计划算法。[#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 允许在数据类型为 `DateTime64` 的列上创建 bloom&#95;filter 索引。[#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean))。
* 当同时启用 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 时，数据部件合并将忽略最大字节数限制。[#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu)).
* 为 OpenTelemetry Span 日志表添加了 HTTP 头部，以提高可追踪性。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* 支持按自定义时区写入 `orc` 文件，而不再始终使用 `GMT` 时区。[#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* 在跨云环境进行备份写入时遵循 IO 调度设置。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 为 `system.asynchronous_metrics` 添加列 `metric` 的别名 `name`。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 由于某些历史原因，查询 `ALTER TABLE MOVE PARTITION TO TABLE` 会检查 `SELECT` 和 `ALTER DELETE` 权限，而不是专门的 `ALTER_MOVE_PARTITION` 权限。此 PR 改为使用这一访问类型。为保持兼容性，如果已授予 `SELECT` 和 `ALTER DELETE`，则也会隐式授予此权限，但这一行为将在未来版本中移除。关闭 [#16403](https://github.com/ClickHouse/ClickHouse/issues/16403)。[#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* 在尝试对排序键中的列进行物化时抛出异常，以避免破坏排序顺序。[#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48))。
* 在 `EXPLAIN QUERY TREE` 中隐藏敏感信息。[#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在“native”读取器中支持 Parquet 整数逻辑类型。[#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos))。
* 如果默认用户需要密码，则在浏览器中以交互方式请求凭证。在之前的版本中，服务器返回 HTTP 403；现在返回 HTTP 401。[#72198](https://github.com/ClickHouse/ClickHouse/pull/72198)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将访问类型 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` 从全局改为参数化。这意味着用户现在可以更精细地授予访问管理权限：[#72246](https://github.com/ClickHouse/ClickHouse/pull/72246)（[pufit](https://github.com/pufit)）。
* 将 `latest_fail_error_code_name` 列添加到 `system.mutations` 中。我们需要这一列来引入一个关于卡住 mutation 的新指标，并使用它在云端构建错误统计图表，并（可选地）添加一个新的、噪声更低的告警。[#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 减少 `ATTACH PARTITION` 查询中的内存分配开销。[#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov))。
* 让 `max_bytes_before_external_sort` 的限制取决于整个查询的内存消耗（之前它表示单个排序线程中排序块的字节数，现在它与 `max_bytes_before_external_group_by` 含义相同——即整个查询在所有线程上的总内存上限）。另外新增一个用于控制磁盘上块大小的设置——`min_external_sort_block_bytes`。[#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat))。
* 忽略 trace 收集器施加的内存限制。[#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* 将服务器设置 `dictionaries_lazy_load` 和 `wait_dictionaries_load_at_startup` 添加到 `system.server_settings` 中。[#72664](https://github.com/ClickHouse/ClickHouse/pull/72664)（[Christoph Wurm](https://github.com/cwurm)）。
* 将 `max_backup_bandwidth` 设置添加到可在 `BACKUP`/`RESTORE` 查询中指定的设置列表中。[#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm))。
* 降低 ReplicatedMergeTree 引擎中新出现副本数据分片的日志级别，以帮助减少在复制集群中生成的日志量。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 改进对析取表达式中公共子表达式的提取。即使不存在适用于所有析取项的公共子表达式，也允许对最终的过滤表达式进行简化。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) 的后续。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* 在 `S3Queue`/`AzureQueue` 存储引擎中，现在允许为最初在未指定任何设置的情况下创建的表补充添加设置。[#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 引入设置 `least_greatest_legacy_null_behavior`（默认值：`false`），用于控制函数 `least` 和 `greatest` 在处理 `NULL` 参数时，是无条件返回 `NULL`（当为 `true` 时），还是忽略该参数（当为 `false` 时）。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 ObjectStorageQueueMetadata 的清理线程中使用 Keeper 的 multi 请求。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* 当 ClickHouse 在 cgroup 环境中运行时，我们仍然会收集与系统负载、进程调度、内存等相关的系统级异步指标。当 ClickHouse 是主机上唯一资源消耗较高的进程时，这些指标可能会提供有用的信号。 [#73369](https://github.com/ClickHouse/ClickHouse/pull/73369) ([Nikita Taranov](https://github.com/nickitat))。
* 在存储引擎 `S3Queue` 中，现在支持将 24.6 之前创建的旧有有序表迁移到使用 buckets 的新结构中。[#73467](https://github.com/ClickHouse/ClickHouse/pull/73467)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 添加 `system.azure_queue`，类似于现有的 `system.s3queue`。[#73477](https://github.com/ClickHouse/ClickHouse/pull/73477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 函数 `parseDateTime64`（及其变体）现在在处理 1970 年之前和 2106 年之后的输入日期时也能产生正确结果。示例：`SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar)).
* 解决了一些用户反馈的 `clickhouse-disks` 可用性问题。已关闭 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136)。[#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* 允许在 storage S3(Azure)Queue 中修改提交设置（提交设置包括：`max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit`）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 S3(Azure)Queue 存储中对各个源的进度进行聚合，以便与提交限制设置进行比较。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `BACKUP`/`RESTORE` 查询现在支持核心设置。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在生成 Parquet 输出时考虑 `output_format_compression_level`。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos)).
* 将 Apache Arrow 的 `fixed_size_list` 改为读取为 `Array`，而不是将其视为不受支持的类型。[#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers))。
* 新增两个备份引擎：`Memory`（在当前用户会话中保存备份）和 `Null`（不会在任何地方保存备份），主要用于测试。[#73690](https://github.com/ClickHouse/ClickHouse/pull/73690)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_num_ratio_to_cores` 现在无需重启服务器即可修改。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* 为 `formatReadable` 函数添加对扩展的数值类型（`Decimal` 和大整数）的支持。[#73765](https://github.com/ClickHouse/ClickHouse/pull/73765) ([Raúl Marín](https://github.com/Algunenano))。
* 在 Postgres 线路协议兼容模式中支持 TLS。[#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12))。
* 函数 `isIPv4String` 在正确的 IPv4 地址后跟一个零字节时会返回 true，而在这种情况下它本应返回 false。是对 [#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) 的后续修复。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使 MySQL 线协议中的错误码与 MySQL 保持兼容。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) 的后续工作。关闭 [#50957](https://github.com/ClickHouse/ClickHouse/issues/50957)。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加设置项 `validate_enum_literals_in_opearators`，用于在诸如 `IN`、`NOT IN` 等运算符中对枚举字面量进行校验，将其与对应的枚举类型进行比对；如果字面量不是该枚举类型的有效值，则抛出异常。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在 `S3(Azure)Queue` 存储中，将由提交设置定义的单个批中的所有文件在一次 Keeper 事务中统一提交。[#73991](https://github.com/ClickHouse/ClickHouse/pull/73991)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 为可执行 UDF 和字典禁用 header 检测（可能导致 Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* 为 `EXPLAIN PLAN` 新增 `distributed` 选项。现在，`EXPLAIN distributed=1 ...` 会将远程执行计划附加到 `ReadFromParallelRemote*` 步骤中。[#73994](https://github.com/ClickHouse/ClickHouse/pull/73994)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 为带有 Dynamic 参数的 not/xor 运算使用正确的返回类型。[#74013](https://github.com/ClickHouse/ClickHouse/pull/74013)（[Pavel Kruglov](https://github.com/Avogar)）。
* 允许在创建表之后更改 `add_implicit_sign_column_constraint_for_collapsing_engine`。[#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm))。
* 在物化视图的 `SELECT` 查询中支持子列。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar))。
* 现在可以通过三种简单的方式在 `clickhouse-client` 中设置自定义提示符：1. 通过命令行参数 `--prompt`；2. 在配置文件中通过设置 `<prompt>[...]</prompt>`；3. 同样在配置文件中，通过针对每个连接的设置 `<connections_credentials><prompt>[...]</prompt></connection_credentials>`。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168) ([Christoph Wurm](https://github.com/cwurm))。
* 在 ClickHouse Client 中通过连接到 9440 端口自动检测是否使用安全连接。[#74212](https://github.com/ClickHouse/ClickHouse/pull/74212)（[Christoph Wurm](https://github.com/cwurm)）。
* 支持在 `http_handlers` 中仅通过用户名对用户进行认证（此前还要求用户提供密码）。[#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat))。
* 对替代查询语言 PRQL 和 KQL 的支持已被标记为实验特性。要使用它们，请设置 `allow_experimental_prql_dialect = 1` 和 `allow_experimental_kusto_dialect = 1`。[#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze))。
* 在更多聚合函数中支持返回默认的 Enum 类型。[#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano))。
* 在 `OPTIMIZE TABLE` 中，现在可以使用关键字 `FORCE` 代替现有关键字 `FINAL`。[#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze))。
* 添加 `IsServerShuttingDown` 指标，用于在服务器关闭过程耗时过长时触发告警。[#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在 EXPLAIN 中加入了 Iceberg 表名。 [#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 在旧分析器中使用 RECURSIVE CTE 时提供更好的错误信息。[#74523](https://github.com/ClickHouse/ClickHouse/pull/74523)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 `system.errors` 中显示详细错误信息。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* 允许在客户端与 clickhouse-keeper 通信时使用密码。如果已为服务端和客户端正确配置 SSL，此特性意义不大，但在某些场景下仍然可能有用。密码长度不能超过 16 个字符。它与 Keeper 身份验证模型无关。[#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin))
* 为配置重载器添加错误码。[#74746](https://github.com/ClickHouse/ClickHouse/pull/74746)（[Garrett Thomas](https://github.com/garrettthomaskth)）。
* 在 MySQL 和 PostgreSQL 表函数和引擎中添加了对 IPv6 地址的支持。[#74796](https://github.com/ClickHouse/ClickHouse/pull/74796)（[Mikhail Koviazin](https://github.com/mkmkme)）。
* 为 `divideDecimal` 实现了短路优化。修复了 [#74280](https://github.com/ClickHouse/ClickHouse/issues/74280)。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 现在可以在启动脚本中指定用户。[#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit))。
* 添加对 Azure SAS 令牌的支持。[#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat))。





#### 错误修复(官方稳定版本中用户可见的异常行为)

* 仅在压缩编解码器支持时才设置 Parquet 压缩级别。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修复了一个回归缺陷：使用带修饰符的排序规则语言环境（collation locale）时会抛出错误。比如，`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` 现在可以正常工作。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复无法使用 keeper-client 创建 SEQUENTIAL 节点的问题。 [#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94)).
* 修复 `position` 系列函数中字符计数不正确的问题。[#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind))。
* 由于未处理的部分撤销，访问实体的 `RESTORE` 操作所需的权限超过了实际需要。本 PR 修复了该问题。关闭 [#71853](https://github.com/ClickHouse/ClickHouse/issues/71853)。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958) ([pufit](https://github.com/pufit))。
* 避免在执行 `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 后出现暂停。获取用于后台任务调度的正确设置。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 修复在某些输入和输出格式（例如 Parquet、Arrow）中对空 `tuple` 的处理问题。[#72616](https://github.com/ClickHouse/ClickHouse/pull/72616)（[Michael Kolupaev](https://github.com/al13n321)）。
* 现在，在通配符数据库/表上执行列级 GRANT SELECT/INSERT 语句会报错。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan)).
* 修复一个问题：当目标访问实体中存在隐式授权时，用户无法执行 `REVOKE ALL ON *.*`。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit))。
* 修复 formatDateTime 标量函数在正时区下的格式化问题。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* 修复在通过 PROXYv1 建立连接且设置了 `auth_use_forwarded_address` 时源端口反映不正确的问题 —— 之前会错误地使用代理端口。新增 `currentQueryID()` 函数。[#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 TCPHandler 中将格式设置传递给 NativeWriter，使诸如 `output_format_native_write_json_as_string` 之类的设置能够正确生效。[#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `StorageObjectStorageQueue` 中的崩溃问题。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在服务器关闭期间可刷新物化视图中发生的罕见崩溃。[#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 函数 `formatDateTime` 的 `%f` 占位符现在无条件生成六位小数（小数秒）。这使其行为与 MySQL 的 `DATE_FORMAT` 函数兼容。可以通过设置 `formatdatetime_f_prints_scale_number_of_digits = 1` 来恢复之前的行为。[#73324](https://github.com/ClickHouse/ClickHouse/pull/73324)（[ollidraese](https://github.com/ollidraese)）。
* 修复了从 `s3` 存储和表函数读取时按 `_etag` 列进行过滤的问题。[#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在使用旧分析器并在 `JOIN ON` 表达式中使用 `IN (subquery)` 时出现 `Not-ready Set is passed as the second argument for function 'in'` 错误的问题。[#73382](https://github.com/ClickHouse/ClickHouse/pull/73382)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复 Dynamic 和 JSON 列在执行 squash 前的准备逻辑。此前在某些情况下，即使尚未达到类型/路径数量限制，新类型仍可能被插入到 shared variant/shared data 中。 [#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar))。
* 在类型的二进制解码过程中检查损坏的大小值，以避免过大的内存分配。[#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在启用并行副本的情况下从单副本集群读取数据时的逻辑错误。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 ObjectStorageQueue 在 ZooKeeper 和旧版 Keeper 上的兼容性。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* 实现了用于默认启用 Hive 分区的修复。[#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 修复在创建向量相似性索引时出现的数据竞争问题。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在字典的数据源包含带有错误数据的函数时出现的段错误问题。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复 storage S3(Azure)Queue 中插入失败时的重试机制。解决 [#70951](https://github.com/ClickHouse/ClickHouse/issues/70951)。[#73546](https://github.com/ClickHouse/ClickHouse/pull/73546)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了在启用设置 `optimize_functions_to_subcolumns` 时，`tupleElement` 函数在处理包含 `LowCardinality` 元素的元组时，在某些情况下可能出现的错误。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* 修复解析枚举通配符（enum glob）后紧跟的第一个区间时的问题。修复了 [#73473](https://github.com/ClickHouse/ClickHouse/issues/73473)。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了在非复制表的子查询中 `parallel_replicas_for_non_replicated_merge_tree` 设置被忽略的问题。[#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复了在任务无法被调度时抛出 `std::logical&#95;error` 的问题。在压力测试中发现。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger))。
* 在 `EXPLAIN SYNTAX` 中不再解析查询，以避免在处理分布式查询时因处理阶段不正确而产生逻辑错误。修复了 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205)。[#73634](https://github.com/ClickHouse/ClickHouse/pull/73634)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 Dynamic 列中可能出现的数据不一致问题，并修复可能出现的逻辑错误 `Nested columns sizes are inconsistent with local_discriminators column size`。[#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了在包含 `FINAL` 和 `SAMPLE` 的查询中出现的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复了对 `CollapsingMergeTree` 使用 `FINAL` 的 `SELECT` 查询结果不正确的问题，并启用了 `FINAL` 的优化。[#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* 修复导致 `LIMIT BY COLUMNS` 崩溃的问题。[#73686](https://github.com/ClickHouse/ClickHouse/pull/73686)（[Raúl Marín](https://github.com/Algunenano)）。
* 修复了一个问题：当强制使用普通 projection，且查询与该 projection 的定义完全相同时，却没有选择该 projection，从而导致报错。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218))。
* 修复 Dynamic/Object 结构的反序列化问题。可能会导致 CANNOT&#95;READ&#95;ALL&#95;DATA 异常。[#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar))。
* 在从备份中恢复数据分片时跳过 `metadata_version.txt`。 [#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复在对 Enum 使用 LIKE 进行类型转换时发生的段错误。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar)).
* 修复了将 S3 Express bucket 用作磁盘时无法正常工作的问题。[#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar))。
* 允许在 CollapsingMergeTree 表中合并 sign 列中具有无效值的行。[#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm))。
* 修复在存在离线副本时查询 DDL 会报错的问题。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复了在比较 `map()` 类型时偶发失败的问题，该问题是由于可以创建其嵌套元组未显式命名（&#39;keys&#39;,&#39;values&#39;）的 `Map` 所致。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 在解析 GROUP BY ALL 子句时忽略窗口函数。修复 [#73501](https://github.com/ClickHouse/ClickHouse/issues/73501)。[#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 修复隐式权限（此前会被当作通配符处理）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* 修复在创建嵌套 Map 时的高内存占用问题。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复嵌套 JSON 中空键的解析问题。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复：当某个别名被另一个别名引用且在查询中以相反顺序被选取时，该别名可能不会被添加到投影中的问题。[#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 在初始化 `plain_rewritable` 磁盘期间，忽略 Azure 上的对象未找到错误。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复 `any` 和 `anyLast` 在枚举类型及空表情况下的行为。[#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* 修复了在 Kafka 表引擎中使用关键字参数时的问题。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复无法在带有 &quot;s3queue&#95;&quot; 前缀和不带该前缀的 `S3Queue` 存储设置之间互相切换的问题。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加设置 `allow_push_predicate_ast_for_distributed_subqueries`。这为使用 analyzer 的分布式查询增加了基于 AST 的谓词下推功能。这是一个临时解决方案，在分布式查询支持查询计划序列化之前使用。关闭 [#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718)。[#74085](https://github.com/ClickHouse/ClickHouse/pull/74085)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了自 [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) 起，`forwarded_for` 字段中可能出现端口号，从而导致无法解析包含端口号的主机名的问题。[#74116](https://github.com/ClickHouse/ClickHouse/pull/74116)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了 `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` 的格式错误。[#74126](https://github.com/ClickHouse/ClickHouse/pull/74126)（[Han Fei](https://github.com/hanfei1991)）。
* 修复了问题 [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112)。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 在 `CREATE TABLE` 中已无法再将 `Loop` 用作表引擎。此前这种组合会导致段错误（segfault）。[#74137](https://github.com/ClickHouse/ClickHouse/pull/74137)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复安全漏洞，以防止在 PostgreSQL 和 SQLite 表函数中发生 SQL 注入。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复从压缩的 Memory 引擎表中读取子列时发生的崩溃问题。修复了 [#74009](https://github.com/ClickHouse/ClickHouse/issues/74009)。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了在对 system.detached&#95;tables 执行查询时出现的无限循环问题。[#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov)).
* 修复在将文件标记为失败状态时 `s3queue` 中的逻辑错误。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复从基础备份执行 `RESTORE` 时的原生拷贝设置（`allow_s3_native_copy`/`allow_azure_native_copy`）。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* 修复了当数据库中已分离的表数量是 max&#95;block&#95;size 的倍数时出现的问题。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* 修复通过 ObjectStorage（如 S3）进行复制时，当源和目标凭证不同时出现的问题。[#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 GCS 上进行 native copy 时对“在 JSON API 中使用 Rewrite 方法”的检测。[#74338](https://github.com/ClickHouse/ClickHouse/pull/74338)（[Azat Khuzhin](https://github.com/azat)）。
* 修复 `BackgroundMergesAndMutationsPoolSize` 的错误计算（之前为实际值的 2 倍）。[#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin)).
* 修复在启用 Cluster Discovery 时导致 keeper watches 泄漏的缺陷。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* 修复 UBSan 报告的内存对齐问题 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。[#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在建表过程中 KeeperMap 并发清理的问题。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* 在存在 `EXCEPT` 或 `INTERSECT` 时，不要在子查询中删除未使用的投影列，以保证查询结果的正确性。修复了 [#73930](https://github.com/ClickHouse/ClickHouse/issues/73930)。修复了 [#66465](https://github.com/ClickHouse/ClickHouse/issues/66465)。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在启用稀疏序列化时，包含 `Tuple` 列的表之间执行 `INSERT SELECT` 查询的问题。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 函数 `right` 在常量负偏移量的情况下工作不正确。[#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了由于客户端解压实现存在缺陷而导致插入 gzip 压缩数据偶尔失败的问题。[#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* 在使用带通配符的授权时执行部分撤销操作，可能会移除超出预期的权限。修复了 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263)。[#74751](https://github.com/ClickHouse/ClickHouse/pull/74751)（[pufit](https://github.com/pufit)）。
* Keeper：修复从磁盘读取日志条目的问题。[#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了对 SYSTEM REFRESH/START/STOP VIEW 命令的权限检查，现在在对某个特定视图执行查询时，不再需要在 `*.*` 上拥有相应的权限，只需对该视图授予权限即可。[#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix))。
* `hasColumnInTable` 函数不会处理别名列。已修复，使其也适用于别名列。[#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在 Azure Blob Storage 上对包含空列的表进行数据部分合并时出现的 FILE&#95;DOESNT&#95;EXIST 错误。[#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复在与临时表进行 `JOIN` 时投影列名不正确的问题，关闭 [#68872](https://github.com/ClickHouse/ClickHouse/issues/68872)。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。



#### 构建/测试/打包改进
* 通用安装脚本现在也会在 macOS 上提示安装。[#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
