---
description: "2025 年更新日志"
note: "此文件通过 yarn build 生成"
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: "2025"
title: "2025 年更新日志"
doc_type: "changelog"
---

### 目录

**[ClickHouse 版本 v25.10,2025-10-30](#2510)**<br/>
**[ClickHouse 版本 v25.9,2025-09-25](#259)**<br/>
**[ClickHouse 版本 v25.8 LTS,2025-08-28](#258)**<br/>
**[ClickHouse 版本 v25.7,2025-07-24](#257)**<br/>
**[ClickHouse 版本 v25.6,2025-06-26](#256)**<br/>
**[ClickHouse 版本 v25.5,2025-05-22](#255)**<br/>
**[ClickHouse 版本 v25.4,2025-04-22](#254)**<br/>
**[ClickHouse 版本 v25.3 LTS,2025-03-20](#253)**<br/>
**[ClickHouse 版本 v25.2,2025-02-27](#252)**<br/>
**[ClickHouse 版本 v25.1,2025-01-28](#251)**<br/>
**[2024 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouse 版本 25.10,2025-10-31 {#2510}


#### 不向后兼容的变更

* 更改了默认的 `schema_inference_make_columns_nullable` 设置，使其遵循 Parquet/ORC/Arrow 元数据中的列 `Nullable` 信息，而不是将所有列都设为 Nullable。对文本格式没有影响。[#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321))。
* 查询结果缓存将忽略 `log_comment` 设置，因此仅更改查询中的 `log_comment` 将不再强制导致缓存未命中。也有小概率存在用户是通过改变 `log_comment` 来有意对缓存进行分段的。此更改会改变该行为，因此与此前行为不兼容。请改用设置 `query_cache_tag` 来实现这一目的。[#79878](https://github.com/ClickHouse/ClickHouse/pull/79878)（[filimonov](https://github.com/filimonov)）。
* 在之前的版本中，包含与运算符实现函数同名的表函数的查询，其格式化方式不一致。修复了 [#81601](https://github.com/ClickHouse/ClickHouse/issues/81601)。修复了 [#81977](https://github.com/ClickHouse/ClickHouse/issues/81977)。修复了 [#82834](https://github.com/ClickHouse/ClickHouse/issues/82834)。修复了 [#82835](https://github.com/ClickHouse/ClickHouse/issues/82835)。`EXPLAIN SYNTAX` 查询现在不会总是对运算符进行格式化——新的行为更好地体现了解释语法的目的。`clickhouse-format`、`formatQuery` 以及类似工具，如果查询中以函数形式包含这些函数，将不再把它们格式化为运算符。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止在 `JOIN` 键中使用 `Dynamic` 类型。当 `Dynamic` 类型的值与非 `Dynamic` 类型的值进行比较时，可能会产生意外结果。建议将 `Dynamic` 列显式转换为所需类型。[#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` 服务器选项默认开启，目前无法关闭。这是一次向后兼容的变更，仅供注意。该变更仅与 25.x 版本向前兼容。这意味着，如果你需要回滚新版本，只能降级到任意 25.x 版本。[#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema))。
* 将 `replicated_deduplication_window_seconds` 从一周缩短至一小时，以便在写入速率较低时在 ZooKeeper 上存储更少的 znode。[#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema))。
* 将设置项 `query_plan_use_new_logical_join_step` 重命名为 `query_plan_use_logical_join_step`。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新的语法使文本索引的 `tokenizer` 参数表达能力更强。[#87997](https://github.com/ClickHouse/ClickHouse/pull/87997)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 将函数 `searchAny` 和 `searchAll` 重命名为 `hasAnyTokens` 和 `hasAllTokens`，以便与现有函数 `hasToken` 的命名更加一致。[#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze))。
* 从文件系统缓存中移除 `cache_hits_threshold`。该特性是在我们引入 SLRU 缓存策略之前由外部贡献者添加的，而现在我们已经有了 SLRU，就没有必要同时支持两种策略。[#88344](https://github.com/ClickHouse/ClickHouse/pull/88344)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 对 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert` 设置的工作方式做了两处小改动：- 使用未预留字节数而不是可用字节数来判断是否应拒绝一次插入。如果后台合并和变更的预留空间相对于配置阈值较小，这一点可能并不关键，但这样更为准确。- 不再将这些设置应用于 system 表。原因是我们仍然希望像 `query_log` 这样的表能够持续更新，这对调试非常有帮助。写入 system 表的数据通常与实际业务数据相比要小得多，因此在一个合理的 `min_free_disk_ratio_to_perform_insert` 阈值下，它们应该能够在更长时间内继续工作。[#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end))。
* 为 Keeper 的内部复制启用异步模式。Keeper 将在保持原有行为的前提下，可能带来性能提升。如果你是从早于 23.9 的版本升级，则需要先升级到 23.9+，然后再升级到 25.10+。你也可以在升级前将 `keeper_server.coordination_settings.async_replication` 设置为 0，在升级完成后再启用它。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515)（[Antonio Andelic](https://github.com/antonio2368)）。





#### 新功能

* 为 `LIMIT` 和 `OFFSET` 添加对负值的支持。修复了 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913)。[#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` 引擎会创建指向另一张表的代理。所有读写操作都会被转发到目标表，而别名本身不存储任何数据，只维护对目标表的引用。[#87965](https://github.com/ClickHouse/ClickHouse/pull/87965)（[Kai Zhu](https://github.com/nauu)）。
* 完全集成对运算符 `IS NOT DISTINCT FROM` (`<=>`) 的支持。[#88155](https://github.com/ClickHouse/ClickHouse/pull/88155)（[simonmichal](https://github.com/simonmichal)）。
* 在 `MergeTree` 表中新增了在所有适用列上自动创建统计信息的功能。新增了表级设置 `auto_statistics_types`，用于存储要创建的统计信息类型的逗号分隔列表（例如 `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ)).
* 用于文本的全新 Bloom 过滤器索引 `sparse_gram`。[#79985](https://github.com/ClickHouse/ClickHouse/pull/79985) ([scanhex12](https://github.com/scanhex12)).
* 新增 `conv` 函数用于在不同进制之间转换数字，目前支持的进制范围为 `2-36`。[#83058](https://github.com/ClickHouse/ClickHouse/pull/83058)（[hp](https://github.com/hp77-creator)）。
* 新增对 `LIMIT BY ALL` 语法的支持。类似于 `GROUP BY ALL` 和 `ORDER BY ALL`，`LIMIT BY ALL` 会自动展开为将 SELECT 子句中所有非聚合表达式作为 LIMIT BY 键。例如，`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` 等价于 `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name`。当你希望按所有已选的非聚合列进行限制而无需显式逐一列出它们时，此功能可以简化查询。修复了 [#59152](https://github.com/ClickHouse/ClickHouse/issues/59152)。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* 在 ClickHouse 中添加对查询 Apache Paimon 的支持。此集成将使 ClickHouse 用户能够直接访问 Paimon 的数据湖存储。[#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* 新增 `studentTTestOneSample` 聚合函数。[#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 聚合函数 `quantilePrometheusHistogram` 接受直方图桶的上界和累积值作为参数，并在找到分位数位置的桶内在桶的上下界之间进行线性插值。其行为与 PromQL 中针对经典直方图的 `histogram_quantile` 函数类似。[#86294](https://github.com/ClickHouse/ClickHouse/pull/86294)（[Stephen Chi](https://github.com/stephchi0)）。
* 用于 Delta Lake 元数据文件的新系统表。[#87263](https://github.com/ClickHouse/ClickHouse/pull/87263)（[scanhex12](https://github.com/scanhex12)）。
* 添加 `ALTER TABLE REWRITE PARTS` —— 使用所有新的设置从头重写表的各个分片（因为某些设置，例如 `use_const_adaptive_granularity`，只会应用于新的分片）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* 添加 `SYSTEM RECONNECT ZOOKEEPER` 命令，用于强制 Zookeeper 断开并重新连接（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* 通过设置 `max_named_collection_num_to_warn` 和 `max_named_collection_num_to_throw` 来限制命名集合的数量。新增指标 `NamedCollection` 和错误 `TOO_MANY_NAMED_COLLECTIONS`。[#87343](https://github.com/ClickHouse/ClickHouse/pull/87343)（[Pablo Marcos](https://github.com/pamarcos)）。
* 新增了优化过的大小写不敏感 `startsWith` 和 `endsWith` 函数变体：`startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8` 和 `endsWithCaseInsensitiveUTF8`。[#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang))。
* 通过服务器配置的 &quot;resources&#95;and&#95;workloads&quot; 部分，新增了在 SQL 中提供 `WORKLOAD` 和 `RESOURCE` 定义的方式。[#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa)).
* 新增表级设置 `min_level_for_wide_part`，用于指定将某个 part 创建为 wide part 时所需的最小 level。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm))。
* 在 Keeper 客户端中添加递归版本的 `cp`-`cpr` 和 `mv`-`mvr` 命令。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 添加了一个会话设置，用于指定在插入时排除物化的 `skip indexes` 列表（`exclude_materialize_skip_indexes_on_insert`）。添加了一个 MergeTree 表设置，用于指定在合并过程中排除物化的 `skip indexes` 列表（`exclude_materialize_skip_indexes_on_merge`）。[#87252](https://github.com/ClickHouse/ClickHouse/pull/87252) ([George Larionov](https://github.com/george-larionov)).



#### 实验特性
* 实现了以 bit-sliced 格式存储向量的 `QBit` 数据类型，以及 `L2DistanceTransposed` 函数。该函数支持近似向量搜索，并通过参数在精度与速度之间进行权衡控制。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 函数 `searchAll` 和 `searchAny` 现在也可以用于不包含文本列的列上。在这种情况下，它们会使用默认的 tokenizer。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus)).



#### 性能提升

* 在 `JOIN` 和 `ARRAY JOIN` 中实现惰性列复制。避免在某些输出格式中将 `Sparse` 和 `Replicated` 等特殊列表示转换为完整列，从而避免在内存中进行不必要的数据拷贝。[#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar)).
* 为 MergeTree 表中的顶层 String 列添加可选的 `.size` 子列序列化，以提升压缩效果并支持高效的子列访问。引入新的 MergeTree 设置，用于序列化版本控制以及针对空字符串的表达式优化。[#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird)).
* 为 Iceberg 提供按顺序读取支持。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 通过在运行时从右子树构建 Bloom filter，并将该过滤器传递给左子树中的扫描操作，加速某些 `JOIN` 查询。这对如下查询会有帮助，例如：`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'`。 [#84772](https://github.com/ClickHouse/ClickHouse/pull/84772) ([Alexander Gololobov](https://github.com/davenger))。
* 通过重构查询条件缓存（Query Condition Cache，QCC）与索引分析的执行顺序及集成方式，提升了查询性能。现在会在主键和跳过索引分析之前应用 QCC 过滤，从而减少不必要的索引计算。索引分析已扩展为支持多个范围过滤，其过滤结果现在会写回到 QCC 中。这显著加快了索引分析占主导的查询执行速度——尤其是那些依赖跳过索引（例如向量索引或倒排索引）的查询。[#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird))。
* 一系列微小优化，用于加速小查询。 [#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano)).
* 在原生协议中压缩日志和 profile 事件。在拥有 100+ 副本的集群上，未压缩的 profile 事件会占用 1..10 MB/秒，并且在较慢的网络连接上进度条会变得很卡顿。这解决了 [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533)。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过使用 [StringZilla](https://github.com/ashvardanian/StringZilla) 库（在可用时利用 SIMD CPU 指令），提升区分大小写字符串搜索（例如筛选操作 `WHERE URL LIKE '%google%'`）的性能。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* 在对包含 `SimpleAggregateFunction(anyLast)` 类型列的 AggregatingMergeTree 表使用 FINAL 进行查询时，减少内存分配和内存拷贝。[#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94))。
* 提供了将析取形式的 `JOIN` 谓词下推的相关逻辑。示例：在 TPC-H Q7 中，对于两个表 n1 和 n2 上的条件，例如 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')`，我们为每个表提取各自的部分过滤条件：对 n1 为 `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`，对 n2 为 `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'`。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 通过使用新的默认设置 `optimize_rewrite_like_perfect_affix`，提升带前缀或后缀模式的 `LIKE` 查询性能。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 修复在按多个字符串/数字列分组时，由于序列化键过大导致的性能下降问题。这是 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) 的后续工作。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 新增 `joined_block_split_single_row` 设置，以减少在每个键有大量匹配项时哈希连接的内存使用。该设置允许哈希连接结果在单个左表行对应的匹配结果内部也被拆分为多个数据块，这在左表的一行能匹配右表成千上万甚至数百万行时尤为有用。此前，所有匹配结果必须一次性在内存中物化。此更改降低了峰值内存占用，但可能会增加 CPU 使用量。[#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 改进了 `SharedMutex`（在大量并发查询场景下提升性能）。 [#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano)).
* 提升了为主要包含低频标记的文档构建文本索引时的性能。[#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ))。
* 加速 `Field` 析构函数的典型执行路径（提升大量小查询场景下的性能）。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* 在 JOIN 优化期间跳过对运行时哈希表统计信息的重新计算（提升所有包含 JOIN 的查询的性能）。新增 profile 事件 `JoinOptimizeMicroseconds` 和 `QueryPlanOptimizeMicroseconds`。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 为 MergeTreeLazy 读取器启用在缓存中保存标记，并避免直接 IO 操作。这样可提升带有 ORDER BY 且 LIMIT 较小的查询性能。[#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat))。
* 在带有 `is_deleted` 列的 `ReplacingMergeTree` 表上使用 `FINAL` 子句的 SELECT 查询现在执行得更快，这是由于对以下两项已有优化的并行化处理进行了改进：1. 对于仅包含单个 `part` 的分区，启用 `do_not_merge_across_partitions_select_final` 优化；2. 将表中其余选定的范围拆分为“相交 / 不相交”两类，仅相交的范围需要经过 FINAL 合并转换处理。 [#88090](https://github.com/ClickHouse/ClickHouse/pull/88090) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 降低在不启用故障点时（即调试未激活时的默认代码路径）的开销。[#88196](https://github.com/ClickHouse/ClickHouse/pull/88196)（[Raúl Marín](https://github.com/Algunenano)）。
* 避免在按 `uuid` 过滤时对 `system.tables` 进行全表扫描（当你只有来自日志或 ZooKeeper 路径的 UUID 时，这可能会很有用）。[#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat))。
* 提升了函数 `tokens`、`hasAllTokens`、`hasAnyTokens` 的性能。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 内联化 `AddedColumns::appendFromBlock`，在某些情况下略微提升 JOIN 性能。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat)).
* 通过使用 `system.completions` 而不是执行多次 system 表查询，客户端自动补全速度更快且行为更一致。[#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m))。
* 新增 `dictionary_block_frontcoding_compression` 文本索引参数，用于控制字典压缩。默认情况下，该参数开启，并使用 `front-coding` 压缩。[#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 在插入到物化视图之前，根据设置 `min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views` 先对来自所有线程的数据进行合并压缩。此前，如果启用了 `parallel_view_processing`，每个向特定物化视图插入数据的线程都会各自独立地进行合并压缩，这可能导致生成的分片数量增多。[#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368))。
* 新增设置 `temporary_files_buffer_size`，用于控制临时文件写入器的缓冲区大小。* 优化 `LowCardinality` 列在 `scatter` 操作（例如在 grace hash join 中使用）中的内存占用。[#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 增加了对在并行副本中直接从文本索引读取的支持。提升了从对象存储读取文本索引时的性能。[#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ))。
* 使用数据湖目录中表的查询将利用并行副本进行分布式处理。[#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* 用于调优后台合并算法的内部启发式规则（名为 `to_remove_small_parts_at_right`）将在计算合并范围得分之前执行。在此之前，合并选择器会选择宽范围合并，而在此之后，它会对其后缀进行过滤。修复：[#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736)（[Mikhail Artemenko](https://github.com/Michicosun)）。





#### 改进

* 现在，函数 `generateSerialID` 已支持以序列名称作为非常量参数。修复了 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750)。[#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 `generateSerialID` 函数新增可选的 `start_value` 参数，用于为新序列指定自定义起始值。[#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma))。
* 在 `clickhouse-format` 中添加 `--semicolons_inline` 选项，使在格式化查询时将分号放在最后一行，而不是单独放在新的一行。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan)).
* 当在 Keeper 中覆盖配置时，允许配置服务器级限流。修复 [#73964](https://github.com/ClickHouse/ClickHouse/issues/73964)。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066) ([JIaQi](https://github.com/JiaQiTang98))。
* 当两个样本都只包含相同值时，`mannWhitneyUTest` 不再抛出异常。现在会返回一个有效结果，与 SciPy 的行为保持一致。修复：[#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht))。
* 如果元数据事务已提交，则重写磁盘对象存储事务会删除之前的远程 blob。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* 修复了在优化前后结果类型的 `LowCardinality` 不一致时，对冗余相等表达式的优化过程。[#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 当 HTTP 客户端在设置 `Expect: 100-continue` 的同时额外设置请求头 `X-ClickHouse-100-Continue: defer` 时，ClickHouse 会在配额验证通过之后才向客户端发送 `100 Continue` 响应，从而避免为本来就会被丢弃的请求体浪费网络带宽。这在 INSERT 查询场景中尤为相关，其中查询语句可以通过 URL 查询字符串发送，而数据则放在请求体中。如果在未发送完整请求体之前中止请求，会导致在 HTTP/1.1 中无法复用连接，但与在大量数据场景下 INSERT 操作的整体耗时相比，为新建连接引入的额外延迟通常可以忽略不计。[#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end))。
* 在使用 `DATABASE ENGINE = Backup` 配合 S3 存储时，在日志中对 S3 凭据进行脱敏处理。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* 通过推迟其物化，使查询计划优化对相关子查询的输入子计划可见。属于 [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) 的一部分。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* 对 `SYSTEM DROP DATABASE REPLICA` 的变更： - 当在删除数据库或删除整个副本时：同时删除该数据库中每个表的副本 - 如果提供了 `WITH TABLES`，则为每个存储删除副本 - 否则逻辑不变，仅在数据库级删除副本 - 当使用 keeper 路径删除一个数据库副本时： - 若提供了 `WITH TABLES`： - 将数据库恢复为 `Atomic` - 根据 Keeper 中保存的语句恢复 RMT 表 - 删除该数据库（恢复的表也会被一并删除） - 否则，仅在指定的 keeper 路径上删除副本。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复在包含 `materialize` 函数时 TTL 格式不一致的问题。修复 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg 表状态不再存储在单一存储对象中。这应当使在 ClickHouse 中使用 Iceberg 时能够支持并发查询。[#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik))。
* 使 S3Queue 有序模式下的 bucket 锁变为持久模式，类似于在 `use_persistent_processing_nodes = 1` 情况下的 processing node。为测试添加 keeper 故障注入。[#86628](https://github.com/ClickHouse/ClickHouse/pull/86628)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 当用户在格式名称中出现拼写错误时提供提示。修复了 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761)。[#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* 当不存在投影时，远程副本将跳过索引分析。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* 允许对 ytsaurus 表关闭 UTF-8 编码。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 默认关闭 `s3_slow_all_threads_after_retryable_error`。[#87198](https://github.com/ClickHouse/ClickHouse/pull/87198) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 将表函数 `arrowflight` 重命名为 `arrowFlight`。[#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar))。
* 将 `clickhouse-benchmark` 更新为在其 CLI 标志中允许使用 `-` 替代 `_`。[#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda))。
* 在信号处理过程中，将对 `system.crash_log` 的刷新改为同步执行。[#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新增了设置 `inject_random_order_for_select_without_order_by`，该设置会在没有 `ORDER BY` 子句的顶层 `SELECT` 查询中自动注入 `ORDER BY rand()`。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn)).
* 改进 `joinGet` 的错误信息，使其能够明确指出 `join_keys` 的数量与 `right_table_keys` 的数量不一致。[#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 在写入事务期间新增检查任意 Keeper 节点状态的功能，有助于检测 ABA 问题。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 将高负载的 ytsaurus 请求重定向到高负载代理。[#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 修复了在所有可能的工作负载下，针对来自磁盘事务的元数据执行 `unlink`/`rename`/`removeRecursive`/`removeDirectory` 等操作时的回滚问题，以及硬链接计数问题，并简化了相关接口，使其更加通用，从而可以在其他元存储中复用。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新增 `keeper_server.tcp_nodelay` 配置参数，可用于为 Keeper 禁用 `TCP_NODELAY`。[#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* 在 `clickhouse-benchmarks` 中支持 `--connection`。其行为与 `clickhouse-client` 中支持的参数相同，你可以在客户端的 `config.xml`/`config.yaml` 中的 `connections_credentials` 路径下指定预定义连接，从而避免在命令行参数中显式指定用户/密码。为 `clickhouse-benchmark` 增加对 `--accept-invalid-certificate` 的支持。[#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat))。
* 现在，对 Iceberg 表设置 `max_insert_threads` 将会生效。[#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin))。
* 向 `PrometheusMetricsWriter` 添加直方图和维度指标。这样，`PrometheusRequestHandler` 处理器将具备所有关键指标，可用于在云环境中进行可靠且低开销的指标采集。[#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 函数 `hasToken` 现在在遇到空 token 时返回零个匹配结果（此前会抛出异常）。[#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 为 `Array` 和 `Map`（`mapKeys` 和 `mapValues`）类型的值添加文本索引支持。当前支持的函数为 `mapContainsKey` 和 `has`。[#87602](https://github.com/ClickHouse/ClickHouse/pull/87602)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 新增 `ZooKeeperSessionExpired` 指标，用于表示已过期的全局 ZooKeeper 会话数量。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 使用带有备份专用设置的 S3 存储客户端（例如 backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error），以在服务器端（原生）将数据复制到备份目标。废弃 s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在使用实验性 `make_distributed_plan` 进行查询计划序列化时，对 `max_joined_block_size_rows` 和 `max_joined_block_size_bytes` 设置处理不正确的问题。[#87675](https://github.com/ClickHouse/ClickHouse/pull/87675)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 设置 `enable_http_compression` 现在默认为启用状态。这意味着如果客户端接受 HTTP 压缩，服务器就会使用它。不过，这一变更也有一些缺点。客户端可以请求一种开销很大的压缩方法，例如 `bzip2`，这并不合理，并且会增加服务器的资源消耗（但只有在传输大结果集时才会明显）。客户端也可以请求 `gzip`，这虽说问题不大，但相较于 `zstd` 仍然不是最优选择。修复了 [#71591](https://github.com/ClickHouse/ClickHouse/issues/71591)。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `system.server_settings` 中新增了一个名为 `keeper_hosts` 的条目，用于显示 ClickHouse 可连接的 [Zoo]Keeper 主机列表。[#87718](https://github.com/ClickHouse/ClickHouse/pull/87718)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 为系统仪表板添加 `from` 和 `to` 值，以便更好地进行历史分析。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 在 Iceberg 的 SELECT 查询中添加更多用于性能跟踪的信息。[#87903](https://github.com/ClickHouse/ClickHouse/pull/87903)（[Daniil Ivanik](https://github.com/divanik)）。
* 改进文件系统缓存：在多个线程并发预留缓存空间时复用缓存优先级迭代器。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为 `Keeper` 新增限制请求大小的功能（`max_request_size` 设置，与 `ZooKeeper` 的 `jute.maxbuffer` 相同，默认关闭以保持向后兼容性，将在后续版本中启用）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* 使 `clickhouse-benchmark` 默认不在错误信息中包含堆栈跟踪。[#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* 当标记已在缓存中时，避免使用线程池进行异步标记加载（`load_marks_asynchronously=1`）（因为线程池可能处于高压状态，即使标记已在缓存中，查询仍会因此付出额外开销）。 [#87967](https://github.com/ClickHouse/ClickHouse/pull/87967) ([Azat Khuzhin](https://github.com/azat))。
* Ytsaurus：允许使用部分列来创建表/表函数/字典。[#87982](https://github.com/ClickHouse/ClickHouse/pull/87982)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 从现在起，`system.zookeeper_connection_log` 默认启用，可用于获取 Keeper 会话信息。[#88011](https://github.com/ClickHouse/ClickHouse/pull/88011)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 在传递重复的外部表时，使 TCP 和 HTTP 的行为保持一致。HTTP 允许同一个临时表被多次传递。[#88032](https://github.com/ClickHouse/ClickHouse/pull/88032)（[Sema Checherinda](https://github.com/CheSema)）。
* 移除用于读取 Arrow/ORC/Parquet 的自定义 `MemoryPools`。在 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 之后，这个组件似乎已经不再需要，因为现在我们无论如何都会跟踪所有内存分配。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 允许在不指定参数的情况下创建 `Replicated` 数据库。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`：新增支持连接 clickhouse-keeper 的 TLS 端口，并保持标志名称与 `clickhouse-client` 中相同。[#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep))。
* 新增了一个 profile event，用于统计后台合并因超出内存限制而被拒绝的次数。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse)).
* 为 `CREATE`/`ALTER TABLE` 语句的列默认表达式验证启用了 analyzer。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus))。
* 内部查询规划优化：对 `CROSS JOIN` 使用 JoinStepLogical。 [#88151](https://github.com/ClickHouse/ClickHouse/pull/88151) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 为 `hasAnyTokens`（`hasAnyToken`）和 `hasAllTokens`（`hasAllToken`）函数添加了别名。[#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* 默认启用全局采样分析器（这意味着即使是与查询无关的服务器线程也会启用）：每 10 秒的 CPU 时间和实际时间收集一次所有线程的栈回溯。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 更新 Azure SDK，以包含针对复制和创建容器功能中出现的 &#39;Content-Length&#39; 问题的修复。[#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 将函数 `lag` 调整为不区分大小写，以兼容 MySQL。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot))。
* 允许在 `clickhouse-server` 目录中启动 `clickhouse-local`。在之前的版本中，这样做会报错 `Cannot parse UUID: .`。现在你可以在不启动服务器的情况下运行 clickhouse-local 并操作服务器的数据库。[#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 添加配置项 `keeper_server.coordination_settings.check_node_acl_on_remove`。如果启用，在每次删除节点之前，会同时校验该节点本身及其父节点的 ACL；否则，仅校验父节点的 ACL。[#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368))。
* 在使用 `Vertical` 格式时，`JSON` 列现在会以更易读的格式打印。关闭了 [#81794](https://github.com/ClickHouse/ClickHouse/issues/81794)。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524) ([Frank Rosner](https://github.com/FRosner)).
* 将 `clickhouse-client` 文件（例如查询历史）存储在 [XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 规范所定义的位置，而不是用户主目录的根目录。如果 `~/.clickhouse-client-history` 已经存在，仍然会继续使用该文件。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `GLOBAL IN` 导致的内存泄漏（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* 为 `hasAny`/`hasAllTokens` 添加了一个重载，用于接受字符串输入。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* 在 `clickhouse-keeper` 的 `postinstall` 脚本中新增一个步骤，用于启用开机自启动。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan)).
* 仅在将凭据粘贴到 Web UI 时进行检查，而不是在每次按键时都检查。这样可以避免配置错误的 LDAP 服务器带来的问题。修复了 [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777)。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在约束被违反时限制异常消息的长度。在之前的版本中，当插入一个非常长的字符串时，可能会产生一条非常长的异常消息，并最终被写入 `query_log`。关闭了 [#87032](https://github.com/ClickHouse/ClickHouse/issues/87032)。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在创建表时从 ArrowFlight 服务器获取数据集结构的逻辑。[#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar))。





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复了 GeoParquet 导致的客户端协议错误。[#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在发起节点上执行的子查询中解析 `shardNum()` 等与主机相关函数的问题。[#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa))。
* 修复了多个与日期时间相关的函数在处理带小数秒的“epoch 之前”日期时的不正确行为，例如 `parseDateTime64BestEffort`、`change{Year,Month,Day}` 和 `makeDateTime64`。之前会将小数秒部分从秒中减去，而不是将其相加。例如，`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` 之前返回的是 `1968-12-31 23:59:59.532`，而不是 `1969-01-01 00:00:00.468`。[#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复在同一个 `ALTER` 语句中列状态发生变化时导致 `ALTER COLUMN IF EXISTS` 命令失败的问题。现在，诸如 `DROP COLUMN IF EXISTS`、`MODIFY COLUMN IF EXISTS`、`COMMENT COLUMN IF EXISTS` 和 `RENAME COLUMN IF EXISTS` 等命令，已经能够正确处理同一语句中前面的命令删除了该列的情况。[#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复在处理超出支持范围的日期时对 `Date`/`DateTime`/`DateTime64` 类型的自动推断。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个导致崩溃的问题：某些用户提交到 `AggregateFunction(quantileDD)` 列的有效数据可能会使合并操作出现无限递归。[#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi))。
* 在使用 `cluster` 表函数创建的表中支持 JSON/Dynamic 类型。[#86821](https://github.com/ClickHouse/ClickHouse/pull/86821)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在查询中使用 CTE 计算的函数结果为非确定性的情况。[#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在主键列上使用 pointInPolygon 时 EXPLAIN 中出现的 LOGICAL&#95;ERROR。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复名称中包含百分号编码序列的数据湖表。修复[#86626](https://github.com/ClickHouse/ClickHouse/issues/86626)。[#87020](https://github.com/ClickHouse/ClickHouse/pull/87020)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 修复在启用 `optimize_functions_to_subcolumns` 时，`OUTER JOIN` 中对可为空列使用 `IS NULL` 时的错误行为，关闭 [#78625](https://github.com/ClickHouse/ClickHouse/issues/78625)。[#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在 `max_temporary_data_on_disk_size` 限制跟踪中对临时数据释放统计不准确的问题，关闭 [#87118](https://github.com/ClickHouse/ClickHouse/issues/87118)。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140)（[JIaQi](https://github.com/JiaQiTang98)）。
* 函数 checkHeaders 现在能够正确验证提供的请求头并拒绝被禁止的请求头。原作者：Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* 使所有数值类型在 `toDate` 和 `toDate32` 上的行为保持一致。修复了从 int16 转换为 Date32 时的下溢检查。[#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复在并行副本场景下、包含多个 `JOIN` 的查询中的逻辑错误，特别是在 `LEFT/INNER JOIN` 之后使用 `RIGHT JOIN` 时的错误。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter))。
* 在模式推断缓存中遵从 `input_format_try_infer_variants` 设置。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* 使 `pathStartsWith` 仅匹配具有该前缀的子路径。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了 `_row_number` 虚拟列和 Iceberg 定位删除中的逻辑错误。[#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在 `JOIN` 中由于混用 const 和非 const 块导致的 “Too large size passed to allocator” `LOGICAL_ERROR`。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在使用子查询从其他 `MergeTree` 表读取数据时的轻量级更新问题。[#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了在存在行策略时 move-to-prewhere 优化失效的问题，这是对 [#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) 的后续工作。关闭 [#69777](https://github.com/ClickHouse/ClickHouse/issues/69777)。关闭 [#83748](https://github.com/ClickHouse/ClickHouse/issues/83748)。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了对数据部分中缺失且带有默认表达式的列应用补丁时的问题。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在 MergeTree 表中使用重复分区字段名时出现的段错误。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复 EmbeddedRocksDB 的升级问题。[#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了在对象存储上直接从文本索引进行读取的问题。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 防止创建针对不存在引擎的权限。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* 仅对 `s3_plain_rewritable` 忽略“未找到”错误（这可能会引发各种问题）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* 修复使用 YTSaurus 源和 *range&#95;hashed 布局的字典。[#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复创建空元组数组的行为。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 在创建临时表时检查不合法的列。[#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar))。
* 切勿在格式头中包含 Hive 分区列。修复 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515)。[#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在 DeltaLake 中使用文本格式时的读取准备过程。[#87529](https://github.com/ClickHouse/ClickHouse/pull/87529)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了对 Buffer 表执行 `SELECT` 和 `INSERT` 时的访问验证。[#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit)).
* 禁止为 S3 表创建数据跳过索引。[#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc))。
* 避免在异步日志记录中泄漏被跟踪的内存（在 10 小时内可能产生显著偏差，约 100GiB），以及在 `text_log` 中发生泄漏（也可能出现几乎相同的偏差）。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat))。
* 修复了一个错误：当某个 `View` 或 `Materialized View` 被异步删除，且服务器在完成后台清理之前重启时，可能会导致该视图的 `SELECT` 设置覆盖全局服务器设置。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在计算内存过载警告时（如果可能），不计入用户空间页缓存所占字节数。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了一个错误：CSV 反序列化时由于类型顺序不正确会导致 `LOGICAL_ERROR`。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复可执行字典中对 `command_read_timeout` 的错误处理。[#87627](https://github.com/ClickHouse/ClickHouse/pull/87627)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在使用新 analyzer 时，当在被替换列上进行过滤时，`SELECT * REPLACE` 在 `WHERE` 子句中的不正确行为。[#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复了在 `Distributed` 之上使用 `Merge` 时的两级聚合问题。[#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end))。
* 在未使用右侧行列表时，修复 HashJoin 算法中输出数据块的生成。修复了 [#87401](https://github.com/ClickHouse/ClickHouse/issues/87401)。[#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* 在进行索引分析后，如果没有可读取的数据，可能会错误地选择并行副本读取模式。修复了 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653)。[#87700](https://github.com/ClickHouse/ClickHouse/pull/87700)（[zoomxi](https://github.com/zoomxi)）。
* 修复 Glue 中对 `timestamp` / `timestamptz` 列的处理方式。[#87733](https://github.com/ClickHouse/ClickHouse/pull/87733)（[Andrey Zvonov](https://github.com/zvonand)）。
* 此更改关闭 [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587)。[#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* 修复通过 PostgreSQL 接口写入布尔值的问题。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* 修复在带有 CTE 的 `INSERT SELECT` 查询中出现的“未知表”错误，[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* 修复从不能包含在 `Nullable` 中的 `Variants` 读取空 map 子列的问题。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在集群从节点上未能完全删除数据库时的错误处理问题。[#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复多个跳过索引相关的错误。 [#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* 在 AzureBlobStorage 中，更新为优先尝试原生拷贝，如遇 “Unauthorized” 错误则回退到读写模式（在 AzureBlobStorage 中，如果源和目标使用不同的存储账户，会出现 “Unauthorized” 错误）。同时修复了在配置中定义了 endpoint 时应用 &quot;use&#95;native&#95;copy&quot; 的问题。[#87826](https://github.com/ClickHouse/ClickHouse/pull/87826)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 如果 ArrowStream 文件包含非唯一字典，ClickHouse 会崩溃。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn))。
* 修复在使用 `approx_top_k` 和 `finalizeAggregation` 时出现的致命错误。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 修复在最后一个数据块为空时带有投影的合并操作。[#87928](https://github.com/ClickHouse/ClickHouse/pull/87928)（[Raúl Marín](https://github.com/Algunenano)）。
* 如果参数类型不允许用于 GROUP BY，则不要从 GROUP BY 子句中移除单射函数。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在查询中使用 `session_timezone` 设置时，基于 datetime 的键出现错误 granule/partition 剔除的问题。[#87987](https://github.com/ClickHouse/ClickHouse/pull/87987)（[Eduard Karacharov](https://github.com/korowa)）。
* 在 PostgreSQL 接口中，在查询执行后返回受影响的行数。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov))。
* 限制在 PASTE JOIN 中使用过滤下推，以避免可能产生错误结果。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 在评估 [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) 中引入的权限检查之前，先对 URI 进行规范化。 [#88089](https://github.com/ClickHouse/ClickHouse/pull/88089) ([pufit](https://github.com/pufit))。
* 修复在新分析器中 `ARRAY JOIN COLUMNS()` 未匹配到任何列时的逻辑错误。[#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复“高 ClickHouse 内存使用率”警告（排除页面缓存）。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在设置了列级 `TTL` 的 `MergeTree` 表中可能发生的数据损坏问题。[#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在附加包含无效表的外部数据库（`PostgreSQL`/`SQLite`/...）时，读取 `system.tables` 可能产生的未捕获异常。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在使用空元组参数调用 `mortonEncode` 和 `hilbertEncode` 函数时导致的崩溃问题。[#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 现在，在集群中存在非活动副本时，`ON CLUSTER` 查询将耗时更少。[#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin))。
* 现在 DDL worker 会从副本集合中清理已过期的主机，从而减少存储在 ZooKeeper 中的元数据量。[#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin)).
* 修复在没有 cgroups 的情况下运行 ClickHouse 的问题（之前异步指标意外地将 cgroups 变成了必需条件）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* 在发生错误时正确回滚移动目录操作。我们需要重写执行过程中更改的所有 `prefix.path` 对象，而不只是根对象。[#88198](https://github.com/ClickHouse/ClickHouse/pull/88198)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* 修复了 `ColumnLowCardinality` 中 `is_shared` 标志的传递问题。如果在哈希值已经预先计算并缓存在 `ReverseIndex` 中之后再向列中插入新值，可能会导致错误的 group by 结果。[#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat))。
* 修复了工作负载设置 `max_cpu_share` 的问题。现在即使未设置工作负载参数 `max_cpus`，也可以使用它。[#88217](https://github.com/ClickHouse/ClickHouse/pull/88217)（[Neerav](https://github.com/neeravsalaria)）。
* 修复了一个错误：包含子查询的非常重的 `MUTATION` 可能会卡在准备阶段。现在可以通过 `SYSTEM STOP MERGES` 停止这些 `MUTATION`。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 现在，相关子查询也可以用于对象存储。[#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin))。
* 避免在访问 `system.projections` 和 `system.data_skipping_indices` 时初始化 DataLake 数据库。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* 现在，只有在显式启用 `show_data_lake_catalogs_in_system_tables` 时，数据湖目录才会在系统自省表中显示。[#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin))。
* 修复了 `DatabaseReplicated`，使其遵循 `interserver_http_host` 配置项。[#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 在定义 Projection 的场景中，现在已显式禁用位置参数，因为在这个内部查询阶段使用它们并不合理。这修复了 [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604)。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `countMatches` 函数中的二次时间复杂度问题。关闭 [#88400](https://github.com/ClickHouse/ClickHouse/issues/88400)。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使针对 KeeperMap 表的 `ALTER COLUMN ... COMMENT` 命令具备复制能力，以便将其提交到 Replicated 数据库元数据并在所有副本间传播。修复 [#88077](https://github.com/ClickHouse/ClickHouse/issues/88077)。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408) ([Eduard Karacharov](https://github.com/korowa))。
* 修复了在 `Database Replicated` 中与 `Materialized Views` 相关的误报循环依赖问题，该问题会阻止向数据库添加新的副本。[#88423](https://github.com/ClickHouse/ClickHouse/pull/88423)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复在 `group_by_overflow_mode` 设置为 `any` 时对稀疏列的聚合。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa)).
* 修复在将 `query_plan_use_logical_join_step` 设置为 0 并使用多个 FULL JOIN USING 子句时出现的 “column not found” 错误。修复 [#88103](https://github.com/ClickHouse/ClickHouse/issues/88103)。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 节点数量 &gt; 10 的大型集群在恢复时很有可能失败，并出现错误 `[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again`。`num_hosts` 节点会被许多主机同时写入覆盖。此修复将用于控制重试次数的设置改为可动态调节。修复了 [#87721](https://github.com/ClickHouse/ClickHouse/issues/87721)。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 此 PR 只是为了与 23.8 及之前的版本保持兼容性。兼容性问题由这个 PR 引入：[https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240)。该 SQL 在 `enable_analyzer=0` 时会执行失败（在 23.8 之前是可以的）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 修复在将大值转换为 DateTime 时，`accurateCast` 错误消息中出现的 UBSAN 整数溢出问题。[#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复了针对 `tuple` 类型的 coalescing merge tree。这修复了 [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469)。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* 禁止对 `iceberg_format_version=1` 执行删除操作。此更改关闭了 [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444)。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* 此补丁修复了 `plain-rewritable` 磁盘在任意嵌套深度文件夹中的移动操作。[#88586](https://github.com/ClickHouse/ClickHouse/pull/88586)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* 修复与 *cluster 函数一起使用时的 SQL SECURITY DEFINER。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 修复由于对底层常量 `PREWHERE` 列的并发修改导致的潜在崩溃问题。[#88605](https://github.com/ClickHouse/ClickHouse/pull/88605)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了从文本索引读取的问题，并在启用 `use_skip_indexes_on_data_read` 和 `use_query_condition_cache` 设置时支持查询条件缓存。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* 从 `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` 抛出的 `Poco::TimeoutException` 异常会导致进程因 SIGABRT 终止。[#88668](https://github.com/ClickHouse/ClickHouse/pull/88668)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 已在 [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) 中回溯修复：在恢复之后，`Replicated` 数据库副本可能会长时间卡住，并持续打印类似 `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` 的消息，现在已修复。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复在配置重新加载后，ClickHouse 首次建立连接时向 `system.zookeeper_connection_log` 追加记录的问题。[#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复了一个错误：在使用时区并设置 `date_time_overflow_behavior = 'saturate'` 的情况下，将 DateTime64 转换为 Date 时，对于超出范围的值可能会产生错误结果。[#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* 第 N 次尝试修复在启用缓存的 `s3` 表引擎中出现的“zero bytes”错误。[#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复对 `loop` 表函数执行 `SELECT` 时的访问验证问题。[#88802](https://github.com/ClickHouse/ClickHouse/pull/88802)（[pufit](https://github.com/pufit)）。
* 在异步日志记录失败时捕获异常，防止程序退出。[#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* 已在 [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) 中回溯移植：修复 `top_k` 在仅使用单个参数调用时未遵循 threshold 参数的问题。关闭 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757)。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* 已在 [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) 中回溯修复：修复函数 `reverseUTF8` 中的一个错误。在先前版本中，它会错误地反转长度为 4 的 UTF-8 码点的字节。此更改关闭了 [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913)。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 已在 [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) 中回移植：在使用 `SQL SECURITY DEFINER` 创建视图时，不再检查 `SET DEFINER <current_user>:definer` 的访问权限。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* 已在 [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) 中回溯移植：修复了 `L2DistanceTransposed(vec1, vec2, p)` 中的 `LOGICAL_ERROR`。在针对部分 `QBit` 读取的优化中，当 `p` 为 `Nullable` 时，错误地从返回类型中移除了 `Nullable`。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 已在 [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) 中回溯移植：修复未知目录类型导致的崩溃。解决 [#88819](https://github.com/ClickHouse/ClickHouse/issues/88819)。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* 已在 [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) 中回溯移植：修复了分析 skipping 索引时的性能下降问题。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### 构建/测试/打包改进

- 使用 `postgres` 库版本 18.0。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 为 FreeBSD 启用 ICU。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano))。
- 在动态分发到 SSE 4.2 时使用 SSE 4.2 而非 SSE 4。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano))。
- 当 `Speculative Store Bypass Safe` 不可用时,不再要求 `NO_ARMV81_OR_HIGHER` 标志。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 当 ClickHouse 使用 `ENABLE_LIBFIU=OFF` 构建时,故障点相关函数将变为空操作,不再影响性能。在这种情况下,`SYSTEM ENABLE/DISABLE FAILPOINT` 查询将返回 `SUPPORT_IS_DISABLED` 错误。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end))。

### ClickHouse 版本 25.9,2025-09-25 {#259}

#### 向后不兼容的变更

- 禁用 IPv4/IPv6 的无意义二元运算:禁用 IPv4/IPv6 与非整数类型的加/减运算。之前允许与浮点类型进行运算,并对某些其他类型(如 DateTime)抛出逻辑错误。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano))。
- 弃用设置 `allow_dynamic_metadata_for_data_lakes`。现在所有 Iceberg 表在执行每个查询之前都会尝试从存储中获取最新的表结构。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik))。
- 更改了 `OUTER JOIN ... USING` 子句中合并列的解析方式以提高一致性:以前,在 OUTER JOIN 中同时选择 USING 列和限定列(`a, t1.a, t2.a`)时,USING 列会被错误地解析为 `t1.a`,对于右表中没有左匹配的行显示 0/NULL。现在,USING 子句中的标识符始终解析为合并列,而限定标识符解析为非合并列,无论查询中存在哪些其他标识符。例如:```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 之前:a=0, t1.a=0, t2.a=2(不正确 - 'a' 解析为 t1.a) -- 之后:a=2, t1.a=0, t2.a=2(正确 - 'a' 已合并)。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir))。
- 将复制去重窗口增加到 10000。这是完全兼容的,但在存在大量表的情况下,此更改可能导致较高的资源消耗。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema))。


#### 新功能

* 用户现在可以通过为 NATS 引擎指定新的 `nats_stream` 和 `nats_consumer` 设置，来使用 NATS JetStream 消费消息。 [#84799](https://github.com/ClickHouse/ClickHouse/pull/84799) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* 在 `arrowFlight` 表函数中新增了对身份验证和 SSL 的支持。[#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar))。
* 为 `S3` 表引擎和 `s3` 表函数新增名为 `storage_class_name` 的参数，用于指定 AWS 支持的智能分层存储。该参数同时支持键值格式和位置（已弃用）格式。[#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin))。
* Iceberg 表引擎新增对 `ALTER UPDATE` 的支持。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12))。
* 添加系统表 `iceberg_metadata_log`，用于在 SELECT 语句执行期间获取 Iceberg 元数据文件。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152)（[scanhex12](https://github.com/scanhex12)）。
* `Iceberg` 和 `DeltaLake` 表现在支持通过存储级别设置 `disk` 来自定义磁盘配置。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12))。
* 为数据湖磁盘添加对 Azure 的支持。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* 在 Azure Blob 存储上支持 `Unity` 目录。[#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 在 `Iceberg` 写入中支持更多格式（`ORC`、`Avro`）。修复了 [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179)。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* 新增系统表 `database_replicas`，用于存储数据库副本相关信息。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov))。
* 新增函数 `arrayExcept`，用于将一个数组对应的集合从另一个数组中减去。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x)).
* 新增 `system.aggregated_zookeeper_log` 表。该表包含按会话 ID、父路径和操作类型分组的 ZooKeeper 操作统计信息（例如操作次数、平均延迟、错误），并会定期刷新到磁盘。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 新增函数 `isValidASCII`。如果输入的字符串或 FixedString 仅包含 ASCII 字节（0x00–0x7F），则返回 1，否则返回 0。修复 [#85377](https://github.com/ClickHouse/ClickHouse/issues/85377)。… [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* 布尔类型设置可以在不带参数的情况下指定，例如 `SET use_query_cache;`，这等价于将其设置为 true。[#85800](https://github.com/ClickHouse/ClickHouse/pull/85800) ([thraeka](https://github.com/thraeka))。
* 新增配置项：`logger.startupLevel` 和 `logger.shutdownLevel` 可分别在 ClickHouse 启动和关闭期间重写日志级别。[#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5))。
* 聚合函数 `timeSeriesChangesToGrid` 和 `timeSeriesResetsToGrid`。其行为与 `timeSeriesRateToGrid` 类似，接受起始时间戳、结束时间戳、步长和回溯窗口这几个参数，以及两个分别表示时间戳和值的参数，但要求每个窗口至少有 1 个样本而不是 2 个。计算 PromQL 的 `changes`/`resets`，在由这些参数定义的时间网格中，对于每个时间戳，统计在指定窗口内样本值发生变化或减少的次数。返回类型为 `Array(Nullable(Float64))`。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010) ([Stephen Chi](https://github.com/stephchi0))。
* 允许用户使用与临时表类似的语法（`CREATE TEMPORARY VIEW`）来创建临时视图。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury))。
* 在 `system.warnings` 表中添加 CPU 和内存使用情况的告警。[#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc))。
* 在 `Protobuf` 输入中支持 `oneof` 指示符。可以使用一个特殊列来标记 oneof 中哪一部分存在。如果消息包含 [oneof](https://protobuf.dev/programming-guides/proto3/#oneof)，并且设置了 `input_format_protobuf_oneof_presence`，则 ClickHouse 会填充一个列，用于指示检测到的是 oneof 的哪个字段。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* 基于 jemalloc 的内部工具改进了内存分配剖析。现在可以通过配置 `jemalloc_enable_global_profiler` 启用全局 jemalloc 剖析器。通过启用配置 `jemalloc_collect_global_profile_samples_in_trace_log`，抽样的全局分配和释放操作可以以 `JemallocSample` 类型存储在 `system.trace_log` 中。现在可以使用设置 `jemalloc_enable_profiler` 为每个查询单独启用 jemalloc 剖析。是否将样本存储在 `system.trace_log` 中，可以通过设置 `jemalloc_collect_profile_samples_in_trace_log` 在每个查询上单独控制。将 jemalloc 更新到较新的版本。[#85438](https://github.com/ClickHouse/ClickHouse/pull/85438)（[Antonio Andelic](https://github.com/antonio2368)）。
* 新增一个用于在删除 Iceberg 表时一并删除文件的设置。此更改解决了 [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211)。[#86501](https://github.com/ClickHouse/ClickHouse/pull/86501)（[scanhex12](https://github.com/scanhex12)）。



#### 实验性功能
* 从零重构了倒排文本索引，使其能够扩展到无法完全放入 RAM 的数据集。[#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* 现在 `JOIN` 重排序会利用统计信息。可以通过设置 `allow_statistics_optimize = 1` 和 `query_plan_optimize_join_order_limit = 10` 来启用该功能。[#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* 新增对 `alter table ... materialize statistics all` 的支持，该语句会物化一个表的所有统计信息。[#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).



#### 性能提升

* 在读取期间支持使用 skip index 对数据分片进行过滤，从而减少不必要的索引读取。通过新增设置 `use_skip_indexes_on_data_read` 控制（默认禁用）。此变更解决了 [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774)，并包含了一些与 [#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) 共享的通用基础工作。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* 添加了 JOIN 顺序优化功能，可以自动重新排序 JOIN 以获得更好的性能（由 `query_plan_optimize_join_order_limit` 设置控制）。请注意，当前 JOIN 顺序优化的统计信息支持仍然有限，主要依赖于存储引擎提供的行数估计——在后续版本中将引入更完善的统计信息收集和基数估计。**如果在升级后遇到 JOIN 查询问题**，可以暂时通过设置 `SET query_plan_use_new_logical_join_step = 0` 禁用新的实现，并报告该问题以便排查。**关于 USING 子句中标识符解析的说明**：修改了从 `OUTER JOIN ... USING` 子句解析合并列的方式，使其更加一致：之前，在 OUTER JOIN 中同时选择 USING 列和限定列（`a, t1.a, t2.a`）时，USING 列会被错误地解析为 `t1.a`，从而对右表中没有左表匹配的行显示 0/NULL。现在，来自 USING 子句的标识符始终解析为合并列，而限定标识符始终解析为非合并列，而不再取决于查询中还出现了哪些其他标识符。例如： ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 之前：a=0, t1.a=0, t2.a=2（不正确 - &#39;a&#39; 被解析为 t1.a） -- 之后：a=2, t1.a=0, t2.a=2（正确 - &#39;a&#39; 是合并后的列）。 [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 支持面向数据湖的分布式 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* 改进对 `func(primary_column) = 'xx'` 和 `column in (xxx)` 这类条件的 PREWHERE 优化。[#85529](https://github.com/ClickHouse/ClickHouse/pull/85529)（[李扬](https://github.com/taiyang-li)）。
* 实现了 JOIN 重写：1. 当筛选条件对匹配行或未匹配行始终为 false 时，将 `LEFT ANY JOIN` 和 `RIGHT ANY JOIN` 转换为 `SEMI`/`ANTI` JOIN。此优化由新设置项 `query_plan_convert_any_join_to_semi_or_anti_join` 控制。2. 当筛选条件对某一侧的未匹配行始终为 false 时，将 `FULL ALL JOIN` 转换为 `LEFT ALL` 或 `RIGHT ALL` JOIN。[#86028](https://github.com/ClickHouse/ClickHouse/pull/86028)（[Dmitry Novik](https://github.com/novikd)）。
* 在执行轻量级删除后，提高了垂直合并的性能。[#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* 在 `LEFT/RIGHT` 连接存在大量未匹配行的情况下，`HashJoin` 的性能略有优化。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat))。
* 基数排序：帮助编译器利用 SIMD，并改进预取行为。通过动态分派，仅在 Intel CPU 上启用软件预取。延续了 @taiyang-li 在 [https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) 中的工作。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 通过在 `deque` 基础上改用 `devector` 优化 `MarkRanges`，提升了在包含大量分片的表上执行短查询时的性能。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* 提升了在 `join` 模式下应用补丁分片的性能。[#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ))。
* 新增了设置 `query_condition_cache_selectivity_threshold`（默认值：1.0），用于将选择性较低的谓词的扫描结果排除在插入查询条件缓存之外。这样可以在牺牲一定缓存命中率的前提下，降低查询条件缓存的内存消耗。[#86076](https://github.com/ClickHouse/ClickHouse/pull/86076)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 降低 Iceberg 写入时的内存使用。[#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12))。





#### 改进

* 支持在一次插入操作中向 Iceberg 写入多个数据文件。新增设置项 `iceberg_insert_max_rows_in_data_file` 和 `iceberg_insert_max_bytes_in_data_file` 用于控制相应限制。[#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* 为 Delta Lake 中插入的数据文件新增行数/字节数限制。可通过设置 `delta_lake_insert_max_rows_in_data_file` 和 `delta_lake_insert_max_bytes_in_data_file` 进行控制。[#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 Iceberg 写入中支持更多类型的分区。这解决了 [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206)。[#86298](https://github.com/ClickHouse/ClickHouse/pull/86298)（[scanhex12](https://github.com/scanhex12)）。
* 使 S3 重试策略可配置，并在修改配置 XML 文件时支持热加载 S3 磁盘的设置。[#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* 改进了 S3(Azure)Queue 表引擎，使其在失去 ZooKeeper 连接时也能继续工作且不会产生潜在重复。需要启用 S3Queue 设置 `use_persistent_processing_nodes`（可通过 `ALTER TABLE MODIFY SETTING` 修改）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在创建物化视图时，可以在 `TO` 之后使用查询参数，例如：`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table`。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899) ([Diskein](https://github.com/Diskein))。
* 当为 `Kafka2` 表引擎指定了错误设置时，为用户提供更清晰的说明。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 不再支持为 `Time` 类型指定时区（这本身就没有意义）。 [#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 在 `best_effort` 模式下，简化了 Time/Time64 的解析逻辑，并避免了一些错误。[#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新增 `deltaLakeAzureCluster` 函数（与集群模式下的 `deltaLakeAzure` 类似）以及 `deltaLakeS3Cluster` 函数（`deltaLakeCluster` 的别名）。修复 [#85358](https://github.com/ClickHouse/ClickHouse/issues/85358)。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 将 `azure_max_single_part_copy_size` 设置应用于普通复制操作，方式与用于备份时相同。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* 在 S3 对象存储中，当出现可重试错误时放慢 S3 客户端线程。此更改将先前的设置 `backup_slow_all_threads_after_retryable_s3_error` 扩展到 S3 磁盘，并将其重命名为更通用的 `s3_slow_all_threads_after_retryable_error`。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva))。
* 将设置 `allow_experimental_variant/dynamic/json` 和 `enable_variant/dynamic/json` 标记为已废弃。现在这三种类型在所有情况下都会被无条件启用。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* 在 `http_handlers` 中支持通过完整 URL 字符串（`full_url` 指令）进行过滤（包括 schema 和 host:port）。[#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新增设置 `allow_experimental_delta_lake_writes`。 [#86180](https://github.com/ClickHouse/ClickHouse/pull/86180) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 init.d 脚本中对 systemd 的检测（修复 “Install packages” 检查）。 [#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat)).
* 新增 `startup_scripts_failure_reason` 维度指标。该指标用于区分导致启动脚本失败的不同错误类型。特别是出于告警目的，我们需要区分瞬时错误（例如 `MEMORY_LIMIT_EXCEEDED` 或 `KEEPER_EXCEPTION`）和非瞬时错误。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 允许在 Iceberg 表的分区定义中省略 `identity` 函数。[#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12))。
* 新增仅为特定通道启用 JSON 日志记录的功能，为此将 `logger.formatting.channel` 设置为 `syslog`/`console`/`errorlog`/`log` 之一。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* 允许在 `WHERE` 中使用原生数字。它们已经可以作为逻辑函数的参数使用了。这简化了 filter-push-down 和 move-to-prewhere 优化。[#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复了在对元数据已损坏的 Catalog 执行 `SYSTEM DROP REPLICA` 时出现的错误。[#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 在 Azure 中为磁盘访问检查（`skip_access_check = 0`）增加额外重试次数，因为 Azure 可能需要相当长的时间来完成访问权限的开通。[#86419](https://github.com/ClickHouse/ClickHouse/pull/86419)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 将 `timeSeries*()` 函数中的过期窗口调整为左开右闭区间。[#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* 添加 `FailedInternal*Query` profile 事件。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude))。
* 修复了通过配置文件添加用户名中包含点的用户时的处理问题。[#86633](https://github.com/ClickHouse/ClickHouse/pull/86633)（[Mikhail Koviazin](https://github.com/mkmkme)）。
* 为查询的内存使用添加异步指标（`QueriesMemoryUsage` 和 `QueriesPeakMemoryUsage`）。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* 你可以使用 `clickhouse-benchmark --precise` 标志来更精确地统计 QPS 和其他分区间的指标。当查询耗时与报告区间 `--delay D` 相当时，它有助于获得稳定一致的 QPS。[#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa))。
* 使 Linux 线程的 nice 值可配置，从而为某些线程（合并/变更、查询、物化视图、ZooKeeper 客户端）分配更高或更低的优先级。[#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复具有误导性的“specified upload does not exist”错误，该错误在分片上传过程中由于竞态条件导致原始异常丢失时会出现。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* 在 `EXPLAIN` 查询中限制查询计划描述的长度，并且不再为非 `EXPLAIN` 查询计算该描述。新增设置 `query_plan_max_step_description_length`。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 增加调整挂起信号的能力，以尝试避免 CANNOT&#95;CREATE&#95;TIMER 错误（针对查询分析器：`query_profiler_real_time_period_ns` / `query_profiler_cpu_time_period_ns`）。同时从 `/proc/self/status` 收集 `SigQ` 以便进行自检（如果 `ProcessSignalQueueSize` 接近 `ProcessSignalQueueLimit`，则很可能会出现 `CANNOT_CREATE_TIMER` 错误）。[#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat)).
* 改进 Keeper 中 `RemoveRecursive` 请求的性能。[#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* 在 JSON 类型输出时，移除 `PrettyJSONEachRow` 中多余的空白字符。[#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar)).
* 现在，当从普通可重写磁盘中删除目录时，我们会记录 `prefix.path` 的 blob 大小。 [#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin)).
* 支持对远程 ClickHouse 实例（包括 ClickHouse Cloud）执行性能测试。使用示例：`tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在已知会分配大量（&gt;16MiB）内存的部分（排序、异步插入、文件日志）中遵守内存限制。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* 如果将 `network_compression_method` 设置为不受支持的通用编解码器，则抛出异常。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* 系统表 `system.query_cache` 现在会返回*所有*查询结果缓存条目，而此前只会返回共享条目，或同一用户和角色下的非共享条目。这样是可以的，因为非共享条目本就不应泄露*查询结果*，而 `system.query_cache` 返回的是*查询字符串*。这使得该系统表的行为与 `system.query_log` 更加相似。[#87104](https://github.com/ClickHouse/ClickHouse/pull/87104)（[Robert Schulze](https://github.com/rschu1ze)）。
* 为 `parseDateTime` 函数启用短路求值。[#87184](https://github.com/ClickHouse/ClickHouse/pull/87184)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 `system.parts_columns` 中新增 `statistics` 列。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 对于复制数据库和内部复制表，`ALTER` 查询的结果现在只在发起查询的节点上进行校验。这样可以修复一种情况：已提交的 `ALTER` 查询可能会在其他节点卡住的问题。[#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 限制 `BackgroundSchedulePool` 中每种类型任务的数量，避免所有槽位都被某一种类型的任务占满、导致其他任务长期饥饿的情况，同时也避免任务之间相互等待而产生死锁。该行为由服务端设置 `background_schedule_pool_max_parallel_tasks_per_type_ratio` 控制。[#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在恢复数据库副本时正确关闭表。未正确关闭会在数据库副本恢复过程中导致某些表引擎出现 `LOGICAL_ERROR`。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* 在为数据库名称生成拼写纠正提示时检查访问权限。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd))。
* 1. 为 hive 列使用 LowCardinality 2. 在虚拟列之前填充 hive 列（为 [https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所需）3. 在 hive 的空格式上出现 LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. 修复对 hive 分区列作为唯一列时的检查 5. 断言在 schema 中指定了所有 hive 列 6. 部分修复带有 hive 的 parallel&#95;replicas&#95;cluster 7. 在 hive 工具的 extractKeyValuePairs 中使用有序容器（为 [https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所需）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538)（[Arthur Passos](https://github.com/arthurpassos)）。
* 防止对 `IN` 函数第一个参数进行不必要的优化，以免在使用数组映射时偶尔导致错误。[#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在写入 parquet 文件时，iceberg 源 id 与 parquet 名称之间的映射没有根据当时的 schema 进行调整。此 PR 针对每个 iceberg 数据文件处理其对应的 schema，而不是使用当前的 schema。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik)).
* 修复读取文件大小与打开文件分离的问题。与 [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) 相关，该变更最初是为解决 `5.10` 版本发布前 Linux 内核中的一个错误而引入的。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 在内核级别禁用 IPv6 的系统上（例如在 RHEL 中设置 ipv6.disable=1）ClickHouse Keeper 不再无法启动。现在，如果初始的 IPv6 监听器创建失败，它会尝试回退到 IPv4 监听器。[#85901](https://github.com/ClickHouse/ClickHouse/pull/85901)（[jskong1124](https://github.com/jskong1124)）。
* 此 PR 解决了 [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990)。在 `globalJoin` 中为并行副本添加了对 `TableFunctionRemote` 的支持。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* 修复 `orcschemareader::initializeifneeded()` 中的空指针问题。此 PR 解决了以下问题：[#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### 面向用户变更的文档条目：[#85951](https://github.com/ClickHouse/ClickHouse/pull/85951)（[yanglongwei](https://github.com/ylw510)）。
* 添加检查，仅当 `FROM` 子句中的相关子查询使用外层查询中的列时才允许它们。修复 [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469)。修复 [#85402](https://github.com/ClickHouse/ClickHouse/issues/85402)。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在执行 `ALTER UPDATE` 更新某列时，如果该列的子列被其他列的物化表达式使用，物化列无法正确更新的问题。此前，表达式中引用子列的物化列不会被正确更新。[#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* 禁止修改其子列已用于 PK 或分区表达式的列。[#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 DeltaLake 存储中使用非默认列映射模式读取子列的问题。[#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复在 JSON 中带有 Enum 提示的路径使用错误默认值的问题。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* 对 DataLake Hive catalog 的 URL 进行解析并添加输入校验。关闭 [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018)。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* 修复文件系统缓存动态缩放时的逻辑错误。关闭 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122)。关闭 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473)。[#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `DatabaseReplicatedSettings` 中将 `logs_to_keep` 的类型改为 `NonZeroUInt64`。[#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 当对使用设置 `index_granularity_bytes = 0` 创建的表（例如 `ReplacingMergeTree`）执行带跳过索引的 `FINAL` 查询时，会抛出异常。该异常现已修复。[#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 移除了未定义行为（UB），并修复了 Iceberg 分区表达式解析中的问题。[#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在一次 INSERT 中同时包含 const 和非 const 数据块时可能发生的崩溃。 [#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* 通过 SQL 创建 disk 时，现在会默认处理 `/etc/metrika.xml` 中的 include。 [#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar)).
* 修复将 String 转换为 JSON 时的 accurateCastOrNull/accurateCastOrDefault。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 Iceberg 引擎中支持不包含 &#39;/&#39; 的目录。[#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* 修复在 `replaceRegex` 中，当 haystack 为 `FixedString` 且 needle 为空时发生的崩溃。[#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在对 Nullable(JSON) 执行 ALTER UPDATE 时出现的崩溃。[#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 `system.tables` 中缺失的列定义信息。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* 修复从 `LowCardinality(Nullable(T))` 向 `Dynamic` 的类型转换。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复写入 DeltaLake 时的逻辑错误。修复问题 [#86175](https://github.com/ClickHouse/ClickHouse/issues/86175)。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在针对 `plain_rewritable` 磁盘从 Azure Blob Storage 读取空 blob 时出现的 `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` 错误。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复对 Nullable(JSON) 的 GROUP BY 处理。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了物化视图中的一个错误：当某个 MV 被创建、删除，然后使用相同名称重新创建时，可能无法正常工作。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 当使用 *cluster 函数读取时，如果所有副本都不可用则报错。[#86414](https://github.com/ClickHouse/ClickHouse/pull/86414)（[Julian Maicher](https://github.com/jmaicher)）。
* 修复由于 `Buffer` 表导致的 `MergesMutationsMemoryTracking` 泄漏，并修复从 `Kafka`（及其他来源）进行流式写入时的 `query_views_log`。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* 修复在删除别名存储所引用的表后 `SHOW TABLES` 的行为。[#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* 在启用 `send_chunk_header` 且通过 HTTP 协议调用 UDF 时，修复缺失的分块头问题。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在启用 jemalloc 剖析刷新时可能出现的死锁问题。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* 修复 DeltaLake 表引擎中读取子列的问题。关闭 [#86204](https://github.com/ClickHouse/ClickHouse/issues/86204)。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在处理 DDL 任务时正确处理回环地址主机 ID 以避免冲突：[#86479](https://github.com/ClickHouse/ClickHouse/pull/86479)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复针对包含 `numeric`/`decimal` 列的 `postgres` 数据库引擎表的 `DETACH`/`ATTACH` 操作。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher)).
* 修复 `getSubcolumnType` 中未初始化内存的使用。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano))。
* 函数 `searchAny` 和 `searchAll` 在以空 needle 调用时现在返回 `true`（即“匹配所有内容”）。此前，它们会返回 `false`。（问题 [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复当第一个分桶没有值时函数 `timeSeriesResampleToGridWithStaleness()` 的行为。[#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复由于将 `merge_tree_min_read_task_size` 设置为 0 而导致的崩溃。[#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510))。
* 在读取时，每个数据文件的格式现在从 Iceberg 元数据中获取（此前是从表参数中获取）。[#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* 在关闭时刷新日志的过程中忽略异常，使关闭过程更加安全（避免 `SIGSEGV`）。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* 修复 Backup 数据库引擎在执行包含零大小分片文件的查询时抛出异常的问题。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* 修复在启用 `send_chunk_header` 且通过 HTTP 协议调用 UDF 时缺失分块头的问题。[#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复由于 keeper 会话过期导致的 S3Queue 逻辑错误 “Expected current processor {} to be equal to {}”。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复插入与剪枝中的 `Nullable` 相关缺陷。已关闭 [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407)。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630)（[scanhex12](https://github.com/scanhex12)）。
* 如果 Iceberg 元数据缓存已禁用，请不要禁用文件系统缓存。[#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了 parquet reader v3 中的 “Deadlock in Parquet::ReadManager (single-threaded)” 错误。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 ArrowFlight 中 `listen_host` 对 IPv6 的支持。[#86664](https://github.com/ClickHouse/ClickHouse/pull/86664)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 修复 `ArrowFlight` 处理程序中的关闭问题。此 PR 解决了 [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596)。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 修复在 `describe_compact_output=1` 时的分布式查询问题。[#86676](https://github.com/ClickHouse/ClickHouse/pull/86676)（[Azat Khuzhin](https://github.com/azat)）。
* 修复窗口定义的解析并应用查询参数。[#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用 `PARTITION BY` 创建表但未使用分区通配符时抛出的异常 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` 的问题，此用法在 25.8 之前的版本中是可用的。修复关联的 issue：[https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567)。[#86748](https://github.com/ClickHouse/ClickHouse/pull/86748)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复并行查询尝试获取同一个锁时出现的 `LogicalError`。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在 `RowBinary` 输入格式中向 JSON 共享数据写入 `NULL` 的问题，并在 `ColumnObject` 中添加了一些额外的校验。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用 `limit` 时空 `Tuple` 排列的问题。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar))。
* 不要为持久化处理节点使用单独的 keeper 节点。修复了 [https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995)，并关闭了 [#86406](https://github.com/ClickHouse/ClickHouse/issues/86406)。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 `TimeSeries` 引擎表导致在复制数据库中创建新副本失败的问题。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复在某些任务缺少特定 Keeper 节点时查询 `system.distributed_ddl_queue` 的行为。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在解压缩块末尾的 seek 行为。[#86906](https://github.com/ClickHouse/ClickHouse/pull/86906)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在异步执行 Iceberg 迭代器期间抛出的处理异常。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* 修复保存大型预处理 XML 配置文件的问题。[#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* 修复 `system.iceberg_metadata_log` 表中日期字段赋值的问题。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了带 `WHERE` 条件的 `TTL` 无限重新计算的问题。[#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了在使用 `ROLLUP` 和 `CUBE` 修饰符时，`uniqExact` 函数可能产生不正确结果的问题。[#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat))。
* 修复在 `parallel_replicas_for_cluster_functions` 设置为 1 时，使用 `url()` 表函数解析表结构的问题。[#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在将 `PREWHERE` 拆分为多个步骤后，正确对其输出进行类型转换。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了使用 `ON CLUSTER` 子句的轻量级更新。[#87043](https://github.com/ClickHouse/ClickHouse/pull/87043)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复某些聚合函数状态与 `String` 参数的兼容性问题。[#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了一个来自 OpenAI 的模型名称未被传递的问题。[#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik))。
* EmbeddedRocksDB：路径必须位于 user&#95;files 目录内。[#87109](https://github.com/ClickHouse/ClickHouse/pull/87109)（[Raúl Marín](https://github.com/Algunenano)）。
* 修复在 25.1 之前创建的 `KeeperMap` 表在执行 `DROP` 查询后仍在 ZooKeeper 中遗留数据的问题。[#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复读取 Parquet 时 `map` 和 `array` 字段 ID 的问题。[#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12))。
* 修复在惰性物化中读取包含 `array sizes` 子列的数组时的问题。[#87139](https://github.com/ClickHouse/ClickHouse/pull/87139)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复带有 `Dynamic` 参数的 `CASE` 函数。[#87177](https://github.com/ClickHouse/ClickHouse/pull/87177)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 CSV 中从空字符串读取空数组的行为。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复非相关 `EXISTS` 可能产生错误结果的问题。该问题是在引入 `execute_exists_as_scalar_subquery=1`（[https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481)）后出现的，并影响版本 `25.8`。修复了 [#86415](https://github.com/ClickHouse/ClickHouse/issues/86415)。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 当未配置 `iceberg_metadata_log` 而用户尝试获取 Iceberg 调试元数据信息时抛出错误，修复了对 `nullptr` 的访问问题。[#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik))。

#### 构建/测试/打包改进

- 修复与 abseil-cpp 20250814.0 的兼容性问题,https://github.com/abseil/abseil-cpp/issues/1923。[#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat))。
- 将独立 WASM 词法分析器的构建置于标志控制之下。[#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复在不支持 `vmull_p64` 指令的旧版 ARM CPU 上的 crc32c 构建问题。[#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos))。
- 使用 `openldap` 2.6.10。[#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 不再尝试在 darwin 上拦截 `memalign`。[#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 使用 `krb5` 1.22.1-final。[#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复 `list-licenses.sh` 中 Rust crate 名称的解包问题。[#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able))。

### ClickHouse 25.8 LTS 版本,2025-08-28 {#258}


#### 向后不兼容变更
* 对 JSON 中包含不同类型值的数组，推断为 `Array(Dynamic)` 而不是未命名的 `Tuple`。要恢复之前的行为，请禁用设置 `input_format_json_infer_array_of_dynamic_from_array_of_different_types`。[#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 将 S3 延迟指标迁移为直方图，以实现更高的一致性和更简化的使用。[#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 在默认表达式中，要求对包含点的标识符使用反引号包裹，以防止它们被解析为复合标识符。[#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 为避免在禁用 analyzer 的情况下进行维护（而根据我们的经验，这种情况下会有一些问题，例如在条件中使用 `indexHint()` 时），仅在启用 analyzer（默认启用）时才启用惰性物化。[#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* 在 Parquet 输出格式中，默认将 `Enum` 类型的值写为逻辑类型为 `ENUM` 的 `BYTE_ARRAY`。[#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* 默认启用 MergeTree 设置 `write_marks_for_substreams_in_compact_parts`。这将显著提升从新创建的 Compact 部分读取子列的性能。版本低于 25.5 的服务器将无法读取新的 Compact 部分。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 之前 `concurrent_threads_scheduler` 的默认值为 `round_robin`，在存在大量单线程查询（例如 INSERT）时被证明是不公平的。此变更将更安全的替代方案 `fair_round_robin` 调度器设为默认值。[#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse 支持 PostgreSQL 风格的 heredoc 语法：`$tag$ string contents... $tag$`，也称为美元符号引用字符串字面量。在之前的版本中，对 tag 的限制较少：它们可以包含任意字符，包括标点符号和空白字符。这会与同样可以以美元符号开头的标识符产生解析歧义。同时，PostgreSQL 只允许在 tag 中使用单词字符。为解决该问题，我们现在限制 heredoc 的 tag 只能包含单词字符。修复 [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731)。[#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 函数 `azureBlobStorage`、`deltaLakeAzure` 和 `icebergAzure` 已更新，以正确校验 `AZURE` 权限。所有集群变体函数（`-Cluster` 函数）现在都会根据其对应的非集群变体函数来校验权限。此外，`icebergLocal` 和 `deltaLakeLocal` 函数现在会强制执行 `FILE` 权限检查。[#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 默认启用 `allow_dynamic_metadata_for_data_lakes` 设置（表引擎级别设置）。[#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* 默认禁用在 JSON 格式中对 64 位整数进行加引号输出。[#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))



#### 新功能

* 已添加对 PromQL 方言的基础支持。要使用它，在 clickhouse-client 中设置 `dialect='promql'`，再通过设置 `promql_table_name='X'` 将其指向 TimeSeries 表，然后执行类似 `rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` 的查询。另外，你还可以用 SQL 包裹 PromQL 查询：`SELECT * FROM prometheusQuery('up', ...);`。目前仅支持 `rate`、`delta` 和 `increase` 这几个函数。不支持一元/二元运算符，也没有 HTTP API。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI 驱动的 SQL 生成现在可以在可用时自动从环境变量 ANTHROPIC&#95;API&#95;KEY 和 OPENAI&#95;API&#95;KEY 中获取配置，从而实现此功能的零配置使用选项。[#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik))。
* 通过新增以下内容实现对 [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) 协议的支持：- 新的表函数 `arrowflight`。[#74184](https://github.com/ClickHouse/ClickHouse/pull/74184)（[zakr600](https://github.com/zakr600)）。
* 现在所有表都支持 `_table` 虚拟列（不再仅限于使用 `Merge` 引擎的表），这在带有 UNION ALL 的查询中尤为有用。[#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 允许在外部聚合/排序中使用任意存储策略（例如对象存储，如 S3）。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat))。
* 使用显式指定的 IAM 角色实现 AWS S3 认证。为 GCS 实现 OAuth。这些功能此前仅在 ClickHouse Cloud 中可用，现在已开源。对部分接口进行了统一处理，例如对象存储连接参数的序列化。[#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 为 Iceberg TableEngine 增加位置删除（position delete）支持。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik))。
* 支持 Iceberg 等值删除（Equality Deletes）。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* 为 `CREATE` 语句实现 Iceberg 写入支持。关闭 [#83927](https://github.com/ClickHouse/ClickHouse/issues/83927)。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 用于写入的 Glue catalog。 [#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 用于写入的 Iceberg REST 目录。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 将所有 Iceberg position delete 文件合并到数据文件中。这将减少 Iceberg 存储中的 Parquet 文件数量和大小。语法：`OPTIMIZE TABLE table_name`。 [#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 为 Iceberg 提供对 `DROP TABLE` 的支持（从 REST / Glue 目录中移除，并删除该表的元数据）。[#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 在 merge-on-read 格式的 Iceberg 中支持 `ALTER DELETE` 变更。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持写入 DeltaLake。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564) 修复了 [#79603](https://github.com/ClickHouse/ClickHouse/issues/79603)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 新增设置 `delta_lake_snapshot_version`，用于在表引擎 `DeltaLake` 中读取指定的快照版本。[#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在元数据（清单项）中写入更多 Iceberg 统计信息（列大小、下界和上界），以便进行 min-max 剪枝。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 在 Iceberg 中支持对简单类型执行增加/删除/修改列操作。[#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg：支持写入 version-hint 文件。修复了 [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097)。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 由临时用户创建的视图现在会保存一个对应真实用户的副本，并且在该临时用户被删除后将不再失效。[#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit))。
* 向量相似度索引现已支持二进制量化。二进制量化可显著降低内存占用，并加速构建向量索引的过程（因为距离计算更快）。此外，现有设置 `vector_search_postfilter_multiplier` 已被废弃，并由更通用的设置 `vector_search_index_fetch_multiplier` 取代。 [#85024](https://github.com/ClickHouse/ClickHouse/pull/85024) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在 `s3` 或 `s3Cluster` 表引擎/函数中允许使用键值参数，例如 `s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')`。[#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 新增了一个系统表，用于保存来自 Kafka 等引擎的错误输入消息（“死信队列”）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn)).
* 用于 Replicated 数据库的新 `SYSTEM RESTORE DATABASE REPLICA` 功能，类似于 `ReplicatedMergeTree` 已有的恢复功能。[#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov))。
* PostgreSQL 协议现在支持 `COPY` 命令。[#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 支持基于 MySQL 协议的 C# 客户端。修复了 [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992)。[#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 为 Hive 分区风格的读写添加支持。[#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos))。
* 添加 `zookeeper_connection_log` 系统表，用于存储 ZooKeeper 连接的历史信息。[#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 服务器端设置 `cpu_slot_preemption` 启用针对工作负载的抢占式 CPU 调度，并确保在各工作负载之间实现最大-最小公平的 CPU 时间分配。新增用于 CPU 限流的工作负载设置：`max_cpus`、`max_cpu_share` 和 `max_burst_cpu_seconds`。更多详情： [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。 [#80879](https://github.com/ClickHouse/ClickHouse/pull/80879) ([Sergei Trifonov](https://github.com/serxa))。
* 在执行了配置数量的查询或达到时间阈值后断开 TCP 连接。这有助于在负载均衡器后面的集群节点之间更均匀地分配连接。解决了 [#68000](https://github.com/ClickHouse/ClickHouse/issues/68000)。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* 并行副本现在支持在查询中使用投影（projections）。[#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。[#82807](https://github.com/ClickHouse/ClickHouse/pull/82807)（[zoomxi](https://github.com/zoomxi)）。
* 除了 `DESCRIBE (SELECT ...)` 之外，还支持 `DESCRIBE SELECT`。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 对 `mysql_port` 和 `postgresql_port` 强制使用安全连接。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* 用户现在可以使用 `JSONExtractCaseInsensitive`（以及 `JSONExtract` 的其他变体）进行不区分大小写的 JSON 键查找。[#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* 引入 `system.completions` 表。修复 [#81889](https://github.com/ClickHouse/ClickHouse/issues/81889)。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m))。
* 新增了函数 `nowInBlock64`。示例：`SELECT nowInBlock64(6)` 返回 `2025-07-29 17:09:37.775725`。[#84178](https://github.com/ClickHouse/ClickHouse/pull/84178)（[Halersson Paris](https://github.com/halersson)）。
* 向 AzureBlobStorage 添加 extra&#95;credentials，以使用 client&#95;id 和 tenant&#95;id 进行身份验证。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos))。
* 新增函数 `dateTimeToUUIDv7`，用于将 `DateTime` 值转换为 `UUIDv7`。示例用法：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` 返回 `0198af18-8320-7a7d-abd3-358db23b9d5c`。[#84319](https://github.com/ClickHouse/ClickHouse/pull/84319)（[samradovich](https://github.com/samradovich)）。
* `timeSeriesDerivToGrid` 和 `timeSeriesPredictLinearToGrid` 聚合函数用于根据指定的起始时间戳、结束时间戳和步长，将数据重新采样到时间网格上；分别计算类似 PromQL 的 `deriv` 和 `predict_linear`。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328)（[Stephen Chi](https://github.com/stephchi0)）。
* 新增两个 TimeSeries 函数：- `timeSeriesRange(start_timestamp, end_timestamp, step)`，- `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`。[#85435](https://github.com/ClickHouse/ClickHouse/pull/85435) ([Vitaly Baranov](https://github.com/vitlibar))。
* 新增了语法 `GRANT READ ON S3('s3://foo/.*') TO user`。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit)).
* 新增 `Hash` 作为一种新的输出格式。它会为结果的所有列和行计算一个单一的哈希值。这对于计算结果的「指纹」非常有用，例如在数据传输成为瓶颈的场景中。示例：`SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` 返回 `e5f9e676db098fdb9530d2059d8c23ef`。[#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 Keeper Multi 查询中新增支持设置任意 watch。[#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 为 `clickhouse-benchmark` 工具新增 `--max-concurrency` 选项，可启用一种逐步增加并行查询数量的模式。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa)).
* TODO：这是什么？支持部分聚合指标。[#85328](https://github.com/ClickHouse/ClickHouse/pull/85328)（[Mikhail Artemenko](https://github.com/Michicosun)）。



#### 实验特性
* 默认启用相关子查询支持，它们不再是实验性功能。[#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd)).
* Unity、Glue、Rest 和 Hive Metastore 数据湖目录从实验阶段提升为 Beta。[#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator)).
* 轻量级更新和删除从实验阶段提升为 Beta。
* 使用向量相似度索引的近似向量搜索现已达到 GA 阶段。[#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze)).
* 新增 Ytsaurus 表引擎和表函数。[#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 之前，文本索引数据会被拆分为多个段（每个段的默认大小为 256 MiB）。这可以在构建文本索引时减少内存消耗，但会增加磁盘空间占用并延长查询响应时间。[#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov)).



#### 性能提升

* 新的 Parquet 读取器实现。整体性能更高，并支持 page 级别过滤下推和 PREWHERE。目前为实验性功能。使用设置 `input_format_parquet_use_native_reader_v3` 来启用。[#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321))。
* 用我们自己为 Azure Blob Storage 实现的 HTTP 客户端替换了 Azure 库中的官方 HTTP 传输。为该客户端引入了多项设置，这些设置与 S3 的配置相对应。为 Azure 和 S3 都引入了更为激进的连接超时。改进了对 Azure 配置文件相关事件和指标的自省能力。新的客户端默认启用，在基于 Azure Blob Storage 的冷查询场景下提供了显著更好的延迟表现。旧的 `Curl` 客户端可以通过设置 `azure_sdk_use_native_client=false` 来恢复。[#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。此前官方提供的 Azure 客户端实现由于存在非常严重的延迟抖动（从 5 秒到几分钟不等），并不适合用于生产环境。我们已经弃用了那个糟糕的实现，并对此感到非常自豪。
* 按文件大小递增的顺序处理索引。整体索引排序会优先考虑 `minmax` 和向量索引（分别由于其简单性和选择性），随后是体积较小的其他索引。在 `minmax`/向量索引中，也会优先选择更小的索引。[#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal))。
* 默认启用 MergeTree 设置 `write_marks_for_substreams_in_compact_parts`。这将显著提升从新创建的 Compact 部件读取子列的性能。版本低于 25.5 的服务器将无法读取新的 Compact 部件。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* `azureBlobStorage` 表引擎：在可能的情况下缓存并重用托管身份的身份验证令牌，以避免被限流。[#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak))。
* 如果右侧由连接键列函数依赖确定（所有行的连接键值唯一），则 `ALL` `LEFT/INNER` JOIN 将自动转换为 `RightAny`。[#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat))。
* 添加 `max_joined_block_size_bytes`，配合 `max_joined_block_size_rows` 一起使用，以限制包含宽列的 JOIN 的内存使用。[#83869](https://github.com/ClickHouse/ClickHouse/pull/83869)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 添加了新的逻辑（由设置 `enable_producing_buckets_out_of_order_in_aggregation` 控制，默认启用），允许在内存高效聚合期间无序发送部分 bucket。当某些聚合 bucket 的合并耗时明显长于其他 bucket 时，这项改进通过允许发起方在此期间先合并具有更高 bucket id 的 bucket 来提升性能。其缺点是可能会增加内存占用（应该不会太明显）。[#80179](https://github.com/ClickHouse/ClickHouse/pull/80179)（[Nikita Taranov](https://github.com/nickitat)）。
* 引入了 `optimize_rewrite_regexp_functions` 设置（默认启用），当检测到特定正则表达式模式时，允许优化器将某些 `replaceRegexpAll`、`replaceRegexpOne` 和 `extract` 调用重写为更简单、更高效的形式。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* 在哈希 `JOIN` 主循环之外处理 `max_joined_block_rows`，使 `ALL JOIN` 的性能略有提升。[#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 优先处理粒度更高的 min-max 索引。修复 [#75381](https://github.com/ClickHouse/ClickHouse/issues/75381)。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* 使 `DISTINCT` 窗口聚合以线性时间运行，并修复 `sumDistinct` 中的一个 Bug。解决 [#79792](https://github.com/ClickHouse/ClickHouse/issues/79792)。解决 [#52253](https://github.com/ClickHouse/ClickHouse/issues/52253)。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 使用量，能够以更低的延迟完成。[#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 使用 Rendezvous 哈希，在并行副本间分配工作负载时提升缓存局部性。[#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 为 `If` 组合器实现了 `addManyDefaults`，从而使带有 `If` 组合器的聚合函数运行得更快。[#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 在对多个字符串或数字列执行 `GROUP BY` 时，以列式方式计算序列化键。[#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li))。
* 在并行副本读取时，如果索引分析结果为空范围，则消除了全表扫描。[#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* 尝试使用 -falign-functions=64，以获得更稳定的性能测试结果。[#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat))。
* 现在，bloom filter 索引也会用于类似 `has([c1, c2, ...], column)` 这样的条件，其中 `column` 不是 `Array` 类型。这样能够提升这类查询的性能，使其效率与使用 `IN` 运算符时相当。 [#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki))。
* 减少 `CompressedReadBufferBase::readCompressedData` 中不必要的 `memcpy` 调用。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano))。
* 通过移除临时数据来优化 `largestTriangleThreeBuckets`。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过简化代码来优化字符串反序列化。修复了 [#38564](https://github.com/ClickHouse/ClickHouse/issues/38564)。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修正了并行副本最小任务大小的计算方式。[#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat)).
* 提升了在 `Join` 模式下应用补丁分片的性能。[#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* 移除了零字节。关闭了 [#85062](https://github.com/ClickHouse/ClickHouse/issues/85062)。修复了少量小问题。函数 `structureToProtobufSchema`、`structureToCapnProtoSchema` 未正确写入以零结尾的字节，而是使用了换行符代替。这会导致输出中缺少换行符，并且在使用依赖零字节的其他函数（例如 `logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero` 以及 `encrypt`/`decrypt`）时，可能导致缓冲区溢出。`regexp_tree` 字典布局不支持处理包含零字节的字符串。`formatRowNoNewline` 函数在使用 `Values` 格式或其他任意末尾不带换行符的行格式调用时，会错误地截断输出的最后一个字符。函数 `stem` 存在异常安全性错误，在极其罕见的场景下可能导致内存泄漏。`initcap` 函数在处理 `FixedString` 参数时行为不正确：如果块中前一个字符串以单词字符结束，它无法在字符串开头识别单词的起始位置。修复了 Apache `ORC` 格式中的一个安全漏洞，该漏洞可能导致未初始化内存的泄露。修改了函数 `replaceRegexpAll` 及其对应别名 `REGEXP_REPLACE` 的行为：现在即使前一次匹配已经处理了整个字符串，它也可以在字符串末尾进行一次空匹配，例如在 `^a*|a*$` 或 `^|.*` 这种情况下——这与 JavaScript、Perl、Python、PHP、Ruby 的语义一致，但与 PostgreSQL 的语义不同。对许多函数的实现进行了简化和优化。多个函数的文档此前存在错误，现已修正。请注意，`byteSize` 对于 String 列以及由 String 列组成的复杂类型的输出已经发生变化（从每个空字符串 9 字节变为每个空字符串 8 字节），这是预期行为。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在仅为返回单行结果而进行常量物化的场景下，对常量物化进行了优化。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过使用 delta-kernel-rs 后端提升并行文件处理性能。[#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat))。
* 引入了一个新的设置项 enable&#95;add&#95;distinct&#95;to&#95;in&#95;subqueries。启用后，ClickHouse 会在分布式查询的 IN 子查询中自动添加 DISTINCT。这样可以显著减小在分片之间传输的临时表大小，并提升网络效率。注意：这是一个权衡——虽然可以减少网络传输，但会在每个节点上增加额外的合并（去重）开销。当网络传输成为瓶颈且可以接受合并开销时，建议启用该设置。[#81908](https://github.com/ClickHouse/ClickHouse/pull/81908) ([fhw12345](https://github.com/fhw12345))。
* 降低可执行用户自定义函数的查询内存跟踪开销。[#83929](https://github.com/ClickHouse/ClickHouse/pull/83929)（[Eduard Karacharov](https://github.com/korowa)）。
* 在 `DeltaLake` 存储中实现内部的 `delta-kernel-rs` 过滤（统计信息和分区剪枝）。[#84006](https://github.com/ClickHouse/ClickHouse/pull/84006)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 更细粒度地禁用依赖于即时更新列或通过补丁部件更新列的跳过索引。现在，只有受即时变更或补丁部件影响的部件不会使用跳过索引；之前，这些索引会在所有部件上被禁用。[#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ))。
* 为加密命名集合的 `encrypted_buffer` 分配所需的最小内存。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* 改进了对 Bloom Filter 索引（regular、ngram 和 token）的支持：当第一个参数是常量数组（集合），第二个参数是被索引的列（子集）时，也可以利用这些索引，从而更高效地执行查询。[#84700](https://github.com/ClickHouse/ClickHouse/pull/84700)（[Doron David](https://github.com/dorki)）。
* 减少 Keeper 中存储锁的争用。[#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368)).
* 为 `WHERE` 补充缺失的 `read_in_order_use_virtual_row` 支持。这样在查询存在未完全下推到 `PREWHERE` 的过滤条件时，可以避免继续读取更多分片。[#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 允许从 Iceberg 表中异步迭代对象，而无需为每个数据文件单独显式存储对象。[#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik))。
* 将非关联的 `EXISTS` 作为标量子查询执行。这样可以使用标量子查询缓存，并对结果进行常量折叠，这对于索引非常有用。为保持兼容性，新增设置 `execute_exists_as_scalar_subquery=1`。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。





#### 改进

* 添加 `database_replicated` 设置，用于定义 `DatabaseReplicatedSettings` 的默认值。如果在创建复制数据库（Replicated DB）的查询中未指定该设置，则会使用此配置项的值。[#85127](https://github.com/ClickHouse/ClickHouse/pull/85127)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 在网页 UI（play）中为表格列添加了可调整宽度的功能。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki)).
* 通过 `iceberg_metadata_compression_method` 设置支持对 `.metadata.json` 文件进行压缩。该设置支持所有 ClickHouse 压缩方法。此更改解决了 [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895)。[#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 `EXPLAIN indexes = 1` 的输出中显示要读取的区间数量。[#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm))。
* 新增用于设置 ORC 压缩块大小的配置项，并将其默认值从 64KB 更新为 256KB，以与 Spark 和 Hive 保持一致。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li))。
* 在 Wide part 中新增 `columns_substreams.txt` 文件，用于记录该 part 中存储的所有子流。这样可以跟踪 JSON 和 Dynamic 类型中的动态流，从而无需读取这些列的样本就能获取动态流列表（例如用于计算列大小）。此外，现在所有动态流都会体现在 `system.parts_columns` 中。[#81091](https://github.com/ClickHouse/ClickHouse/pull/81091)（[Pavel Kruglov](https://github.com/Avogar)）。
* 为 `clickhouse format` 添加 CLI 标志 `--show_secrets`，默认情况下隐藏敏感数据。[#81524](https://github.com/ClickHouse/ClickHouse/pull/81524)（[Nikolai Ryzhov](https://github.com/Dolaxom)）。
* S3 读写请求在 HTTP 套接字层面（而不是在整个 S3 请求层面）进行限速，以避免与 `max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server` 限速相关的问题。[#81837](https://github.com/ClickHouse/ClickHouse/pull/81837)（[Sergei Trifonov](https://github.com/serxa)）。
* 允许在不同窗口中对同一列混用不同的校对规则（用于窗口函数）。[#82877](https://github.com/ClickHouse/ClickHouse/pull/82877)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 添加了一个用于模拟、可视化和比较合并选择器的工具。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa))。
* 当在 `address_expression` 参数中提供集群时，增加对带有并行副本的 `remote*` 表函数的支持。同时修复了 [#73295](https://github.com/ClickHouse/ClickHouse/issues/73295)。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* 将所有与备份文件写入相关的日志消息级别设置为 TRACE。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 名称或编码(codec)较为特殊的用户自定义函数，可能会被 SQL 格式化器不一致地进行格式化。此更改修复了 [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092)。[#83644](https://github.com/ClickHouse/ClickHouse/pull/83644)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 用户现在可以在 `JSON` 类型中使用 `Time` 和 `Time64` 类型。[#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 现在，并行副本上的 `JOIN` 已经使用新的 `JOIN` 逻辑步骤。如果在使用并行副本的 `JOIN` 查询时遇到任何问题，请尝试执行 `SET query_plan_use_new_logical_join_step=0` 并反馈问题。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复 `cluster_function_process_archive_on_multiple_nodes` 的兼容性。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持在 `S3Queue` 表级别更改物化视图插入设置。新增 `S3Queue` 级别设置：`min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views`。默认情况下将使用配置文件级别的设置，`S3Queue` 级别的设置会覆盖这些设置。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 新增了 profile 事件 `MutationAffectedRowsUpperBound`，用于显示一次 mutation 中受影响的行数（例如，在 `ALTER UPDATE` 或 `ALTER DELETE` 查询中满足条件的行的总行数）。 [#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ)).
* 使用来自 cgroup 的信息（如适用，即 `memory_worker_use_cgroup` 和 cgroup 均可用时）来校正内存跟踪器（`memory_worker_correct_memory_tracker`）。[#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat))。
* MongoDB：将字符串隐式解析为数值类型。此前，如果从 MongoDB 源为 ClickHouse 表中的数值列接收到字符串值，会抛出异常。现在，引擎会尝试自动从字符串中解析数值。修复 [#81167](https://github.com/ClickHouse/ClickHouse/issues/81167)。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 在 `Pretty` 格式中为 `Nullable` 数值的数字分组添加高亮显示。[#84070](https://github.com/ClickHouse/ClickHouse/pull/84070)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Dashboard：当位于顶部时，tooltip 不会溢出其容器。[#84072](https://github.com/ClickHouse/ClickHouse/pull/84072)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 仪表板上的点样式稍作美化。[#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard 现在拥有稍微更好的 favicon。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI：允许浏览器保存密码，并记住 URL 的值。[#84087](https://github.com/ClickHouse/ClickHouse/pull/84087)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过 `apply_to_children` 配置，为特定 Keeper 节点增加应用额外 ACL 的支持。[#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 MergeTree 中使用“紧凑型”Variant 判别器序列化的方式。此前在某些本可以使用的情况下未被使用。[#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* 在数据库复制设置中新增了一个服务器设置 `logs_to_keep`，用于修改复制数据库的默认 `logs_to_keep` 参数。较小的取值可以减少 ZNode 的数量（尤其是在存在大量数据库时），而较大的取值则允许缺失副本在更长时间后仍能追上进度。[#84183](https://github.com/ClickHouse/ClickHouse/pull/84183)（[Alexey Khatskevich](https://github.com/Khatskevich)）。
* 添加设置 `json_type_escape_dots_in_keys`，用于在 JSON 类型解析过程中对 JSON 键中的点进行转义。该设置默认关闭。[#84207](https://github.com/ClickHouse/ClickHouse/pull/84207)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在检查 EOF 之前先检查连接是否已被取消，以防止从已关闭的连接中读取。修复了 [#83893](https://github.com/ClickHouse/ClickHouse/issues/83893)。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 Web UI 中略微改进了文本选中效果的颜色。仅在暗色模式下，被选中的表格单元格会有较为明显的变化。在之前的版本中，文本与选中背景之间的对比度不足。[#84258](https://github.com/ClickHouse/ClickHouse/pull/84258)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过简化内部检查，改进了服务器关闭时对客户端连接的处理。[#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 添加了设置 `delta_lake_enable_expression_visitor_logging`，用于关闭表达式访问器日志，因为在调试某些问题时，即便在测试日志级别下，它们也可能过于冗长。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 现在会统一报告 cgroup 级和系统级指标。cgroup 级指标命名为 `CGroup&lt;Metric&gt;`，OS 级指标（从 procfs 收集）命名为 `OS&lt;Metric&gt;`。[#84317](https://github.com/ClickHouse/ClickHouse/pull/84317)（[Nikita Taranov](https://github.com/nickitat)）。
* Web UI 中的图表略有改进。变化不大，但确实更好。[#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 Replicated 数据库设置 `max_retries_before_automatic_recovery` 的默认值更改为 10，以便在某些情况下可以更快恢复。[#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 修复带查询参数的 `CREATE USER` 语句格式（例如 `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。[#84376](https://github.com/ClickHouse/ClickHouse/pull/84376) ([Azat Khuzhin](https://github.com/azat))。
* 引入 `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor`，用于配置在备份和恢复操作期间使用的 S3 重试退避策略。[#84421](https://github.com/ClickHouse/ClickHouse/pull/84421)（[Julia Kartseva](https://github.com/jkartseva)）。
* S3Queue 有序模式修复：在调用 shutdown 后更早退出。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 支持 `iceberg` 写入，从而可通过 `pyiceberg` 进行读取。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 在将 `IN` / `GLOBAL IN` 过滤条件下推到键值存储的主键（例如 EmbeddedRocksDB、KeeperMap）时，允许对集合中的值进行类型转换。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa)).
* 将 chdig 更新到 [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1)。[#84521](https://github.com/ClickHouse/ClickHouse/pull/84521)（[Azat Khuzhin](https://github.com/azat)）。
* UDF 执行过程中的底层错误现在统一以错误码 `UDF_EXECUTION_FAILED` 失败，而之前可能会返回不同的错误码。[#84547](https://github.com/ClickHouse/ClickHouse/pull/84547)（[Xu Jia](https://github.com/XuJia0210)）。
* 在 KeeperClient 中新增 `get_acl` 命令。[#84641](https://github.com/ClickHouse/ClickHouse/pull/84641)（[Antonio Andelic](https://github.com/antonio2368)）。
* 为数据湖表引擎新增快照版本功能。[#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton)).
* 为 `ConcurrentBoundedQueue` 的大小增加一个维度型指标，并使用队列类型（即队列的用途）和队列 ID（即当前队列实例的随机生成 ID）作为标签。[#84675](https://github.com/ClickHouse/ClickHouse/pull/84675)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* `system.columns` 表现在为现有的 `name` 列提供 `column` 这一别名。[#84695](https://github.com/ClickHouse/ClickHouse/pull/84695)（[Yunchi Pang](https://github.com/yunchipang)）。
* 新增 MergeTree 设置 `search_orphaned_parts_drives`，用于限定查找孤立数据分片的范围，例如按具有本地元数据的磁盘进行查找。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* 在 Keeper 中添加 4LW 命令 `lgrq`，用于开启或关闭对已接收请求的日志记录。[#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368))。
* 以不区分大小写的方式匹配 external auth 的 `forward_headers`。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` 工具现在支持使用加密的 ZooKeeper 连接。[#84764](https://github.com/ClickHouse/ClickHouse/pull/84764)（[Roman Vasin](https://github.com/rvasin)）。
* 为 `system.errors` 添加格式字符串列。此列用于在告警规则中按错误类型进行分组。[#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 将 `clickhouse-format` 更新为接受 `--highlight` 作为 `--hilite` 的别名。- 将 `clickhouse-client` 更新为接受 `--hilite` 作为 `--highlight` 的别名。- 更新 `clickhouse-format` 文档以反映此更改。[#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 通过字段 ID 修复对复杂类型的 Iceberg 读取。[#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 引入新的 `backup_slow_all_threads_after_retryable_s3_error` 设置：当出现诸如 `SlowDown` 之类的错误并引发重试风暴时，在观测到单个可重试错误后减慢所有线程的速度，从而减轻对 S3 的压力。[#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* 在 Replicated 数据库中，跳过为非追加型 RMV DDL 创建和重命名旧临时表的步骤。[#84858](https://github.com/ClickHouse/ClickHouse/pull/84858)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 使用 `keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` 和 `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` 按条目数限制 Keeper 日志缓存大小。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368))。
* 允许在原本不支持的架构上使用 `simdjson`（之前会导致 `CANNOT_ALLOCATE_MEMORY` 错误）。[#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat)).
* 异步日志：使各项限制可调，并添加自检能力。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* 收集所有要删除的对象，以一次性执行对象存储删除操作。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg 当前对 positional delete 文件的实现会把所有数据都保存在 RAM 中。如果 positional delete 文件很大（通常确实如此），开销会非常高。我的实现只在 RAM 中保留 Parquet delete 文件的最后一个 row group，这要节省得多。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* chdig：修复屏幕残影问题，修复在编辑器中编辑查询后发生的崩溃，在 `path` 中搜索 `editor`，更新至 [25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1)。[#85341](https://github.com/ClickHouse/ClickHouse/pull/85341)（[Azat Khuzhin](https://github.com/azat)）。
* 在 Azure 配置中补充缺失的 `partition_columns_in_data_file`。[#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos))。
* 在函数 `timeSeries*ToGrid` 中允许步长为零。这是 [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) 的一部分。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 添加 `show&#95;data&#95;lake&#95;catalogs&#95;in&#95;system&#95;tables` 标志，用于控制在 `system.tables` 中显示数据湖表。修复了 [#85384](https://github.com/ClickHouse/ClickHouse/issues/85384)。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在 `remote_fs_zero_copy_zookeeper_path` 中新增了对宏展开的支持。[#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme))。
* clickhouse-client 中的 AI 界面将略有改进。[#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在旧部署中默认启用 trace&#95;log.symbolize。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat))。
* 在复合标识符的处理上支持更多情况，特别是提升了 `ARRAY JOIN` 与旧分析器的兼容性。引入新的设置 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` 以保留旧行为。[#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在为 `system.columns` 获取表列大小时忽略 `UNKNOWN_DATABASE`。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat))。
* 为补丁部分中的未压缩字节总量新增了限制（表设置 `max_uncompressed_bytes_in_patches`）。这可以防止在轻量级更新之后 `SELECT` 查询明显变慢，并避免轻量级更新被滥用。[#85641](https://github.com/ClickHouse/ClickHouse/pull/85641) ([Anton Popov](https://github.com/CurtizJ)).
* 向 `system.grants` 添加一个 `parameter` 列，用于确定 `GRANT READ/WRITE` 的来源类型，以及 `GRANT TABLE ENGINE` 的表引擎。[#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复在 `CREATE DICTIONARY` 查询中，对列定义里在带参数的列（例如 `Decimal(8)`）之后出现的尾随逗号的解析问题。修复了 [#85586](https://github.com/ClickHouse/ClickHouse/issues/85586)。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 为 `nested` 函数添加对内部数组的支持。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 现在，所有由外部库执行的内存分配都会被 ClickHouse 的内存跟踪器感知并正确计入。这可能会导致某些查询的报告内存使用量看起来“增加”，或者出现 `MEMORY_LIMIT_EXCEEDED` 错误。 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### Bug Fix（官方稳定版本中对用户可见的异常行为）



* 此 PR 修复了通过 REST Catalog 查询 Iceberg 表时的元数据解析问题。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* 修复 `DDLWorker` 和 `DatabaseReplicatedDDLWorker` 中的 `markReplicasActive`。 [#81395](https://github.com/ClickHouse/ClickHouse/pull/81395) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复在解析失败时 Dynamic 列的回滚行为。[#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar)).
* 当使用全部为常量的输入调用函数 `trim` 时，现在会生成一个常量输出字符串。（Bug [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复在启用 `optimize_syntax_fuse_functions` 时出现的重复子查询逻辑错误，关闭 [#75511](https://github.com/ClickHouse/ClickHouse/issues/75511)。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在启用查询条件缓存（设置 `use_query_condition_cache`）时，带有 `WHERE ... IN (<subquery>)` 子句的查询返回结果不正确的问题。 [#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you)).
* 之前，`gcs` 函数在使用时不需要任何访问权限。现在，它在使用前会检查是否具有 `GRANT READ ON S3` 权限。修复了 [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567)。[#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* 在从 `s3Cluster()` 执行 `INSERT SELECT` 写入复制表 `MergeTree` 时，跳过不可用节点。[#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter))。
* 修复在 MergeTree 中（用于实验性事务）使用 append 的写入操作对 `plain_rewritable`/`plain` 元数据类型的处理问题，此前这些类型会被直接忽略。[#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 对 Avro schema registry 的认证信息进行屏蔽，使其对用户不可见，并且不会出现在日志中。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复以下问题：当使用 `add_minmax_index_for_numeric_columns=1` 或 `add_minmax_index_for_string_columns=1` 创建 MergeTree 表时，索引会在后续的 ALTER 操作中被物化，从而导致 Replicated 数据库在新副本上无法正确完成初始化。[#83751](https://github.com/ClickHouse/ClickHouse/pull/83751)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复了 Parquet writer 对 Decimal 类型输出错误统计信息（最小值/最大值）的问题。[#83754](https://github.com/ClickHouse/ClickHouse/pull/83754) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `LowCardinality(Float32|Float64|BFloat16)` 类型中 NaN 值的排序方式。[#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 在从备份恢复时，`definer` 用户可能没有被一同备份，从而导致整个备份不可用。为了解决这一问题，我们将还原过程中对目标表创建的权限检查延后处理，只在运行时进行检查。[#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit))。
* 修复一次异常 INSERT 操作后连接被遗留在断开状态，从而导致客户端崩溃的问题。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* 在启用 analyzer 的情况下，允许在 `remote` 表函数的 `view(...)` 参数中引用任意表。修复 [#78717](https://github.com/ClickHouse/ClickHouse/issues/78717)。修复 [#79377](https://github.com/ClickHouse/ClickHouse/issues/79377)。[#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* `jsoneachrowwithprogress` 中的 `onprogress` 调用现已与最终化过程同步。[#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema))。
* 已关闭 [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303)。[#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 `colorSRGBToOKLCH`/`colorOKLCHToSRGB` 中同时使用 const 和非 const 参数的问题。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 RowBinary 格式中写入包含 NULL 值的 JSON 路径时的问题。 [#83923](https://github.com/ClickHouse/ClickHouse/pull/83923) ([Pavel Kruglov](https://github.com/Avogar)).
* 从 `Date` 转换为 `DateTime64` 时，对大于 2106-02-07 的值发生溢出的问题已修复。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 始终应用 `filesystem_prefetches_limit`（不仅适用于 `MergeTreePrefetchedReadPool`）。[#83999](https://github.com/ClickHouse/ClickHouse/pull/83999)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了一个罕见的错误：执行 `MATERIALIZE COLUMN` 查询时，可能会在 `checksums.txt` 中出现意外的文件，并最终导致数据分片被标记为 detached。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* 修复在对不等条件执行 JOIN 时出现的逻辑错误 `Expected single dictionary argument for function`，当其中一列为 `LowCardinality` 类型且另一列为常量时会触发该错误。修复关联问题 [#81779](https://github.com/ClickHouse/ClickHouse/issues/81779)。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在交互模式下启用语法高亮时 `clickhouse client` 崩溃的问题。 [#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复了在查询条件缓存与递归 CTE 联合使用时出现错误结果的问题（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 在定期刷新分片时正确处理异常。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 修复在等值操作数类型不同或引用常量时，将过滤器合并到 `JOIN` 条件中的问题。修复了 [#83432](https://github.com/ClickHouse/ClickHouse/issues/83432)。[#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在以下罕见场景下可能发生的 ClickHouse 崩溃：当表包含投影、`lightweight_mutation_projection_mode = 'rebuild'`，并且用户执行轻量级删除操作且该操作会从表中的任意数据块删除所有行时。[#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin))。
* 修复由后台取消检查器线程导致的死锁。[#84203](https://github.com/ClickHouse/ClickHouse/pull/84203) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复对无效 `WINDOW` 定义进行无限递归分析的问题。修复了 [#83131](https://github.com/ClickHouse/ClickHouse/issues/83131)。[#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了导致 Bech32 编码和解码结果错误的一个 bug。由于用于测试的在线算法实现也存在相同问题，因此最初未能发现该 bug。[#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov))。
* 修复了在 `array()` 函数中错误构造空元组的问题。此更改修复了 [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202)。[#84297](https://github.com/ClickHouse/ClickHouse/pull/84297)（[Amos Bird](https://github.com/amosbird)）。
* 修复在对查询使用并行副本、且包含多个 `INNER` 联接并紧接着 `RIGHT` 联接时出现的 `LOGICAL_ERROR`。对于此类查询，不要使用并行副本。[#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 此前，在检查粒度是否满足筛选条件时，`set` 索引不会考虑 `Nullable` 列（问题 [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 现在，ClickHouse 也可以从 Glue Catalog 中读取那些表类型以小写字母指定的表。[#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin))。
* 在存在 `JOIN` 或子查询的情况下，不要尝试将表函数替换为其 `cluster` 版本。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复 `IAccessStorage` 中的日志记录器使用方式。[#84365](https://github.com/ClickHouse/ClickHouse/pull/84365)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了在对表的所有列执行轻量级更新时出现的逻辑错误。[#84380](https://github.com/ClickHouse/ClickHouse/pull/84380)（[Anton Popov](https://github.com/CurtizJ)）。
* 编解码器 `DoubleDelta` 现在只能应用于数值类型的列。特别是，`FixedString` 列不再支持使用 `DoubleDelta` 进行压缩。（修复 [#80220](https://github.com/ClickHouse/ClickHouse/issues/80220)）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 在进行 `MinMax` 索引评估时，与 NaN 值的比较未使用正确的范围。[#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 修复在惰性物化情况下读取 `Variant` 列的问题。 [#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar)).
* 将 `zoutofmemory` 视为硬件错误，否则会抛出逻辑错误。参见 [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877)。 [#84420](https://github.com/ClickHouse/ClickHouse/pull/84420) ([Han Fei](https://github.com/hanfei1991))。
* 修复了一个服务器崩溃问题：使用 `no_password` 创建的用户在服务器设置 `allow_no_password` 被修改为 0 后尝试登录时会导致崩溃。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复 Keeper changelog 的乱序写入问题。之前，可能存在正在写入 changelog 的操作，但回滚会导致目标文件被并发修改。这会导致日志不一致，并可能造成数据丢失。[#84434](https://github.com/ClickHouse/ClickHouse/pull/84434)（[Antonio Andelic](https://github.com/antonio2368)）。
* 现在，如果从表中移除了所有 TTL，MergeTree 将不会再执行任何与 TTL 相关的操作。[#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin))。
* 之前允许执行带 `LIMIT` 的并行分布式 `INSERT SELECT`，这实际上是不正确的，因为会导致目标表中的数据重复。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在数据湖中基于虚拟列进行文件裁剪时的问题。 [#84520](https://github.com/ClickHouse/ClickHouse/pull/84520) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复使用 `rocksdb` 存储的 keeper 中的内存泄漏问题（迭代器未被销毁）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* 修复了 `ALTER MODIFY ORDER BY` 未校验排序键中 `TTL` 列的问题。现在在执行 `ALTER` 操作时，如果在 `ORDER BY` 子句中使用 `TTL` 列，将会被正确拒绝，从而防止潜在的表损坏。[#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 将 25.5 之前版本中的 `allow_experimental_delta_kernel_rs` 默认值改为 `false` 以提高兼容性。[#84587](https://github.com/ClickHouse/ClickHouse/pull/84587)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 不再从 manifest 文件中获取 schema，而是为每个快照独立存储对应的 schema。根据每个数据文件所属的快照推断其对应的 schema。先前的行为违反了 Iceberg 规范中关于状态为 existing 的 manifest 文件条目的要求。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了 Keeper 设置 `rotate_log_storage_interval = 0` 时会导致 ClickHouse 崩溃的问题。（问题 [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975)）。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637)（[George Larionov](https://github.com/george-larionov)）。
* 修复 S3Queue 中出现的逻辑错误 “Table is already registered”。关闭 [#84433](https://github.com/ClickHouse/ClickHouse/issues/84433)。该问题在合并 [https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) 后引入。[#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 RefreshTask 中从 `view` 获取 zookeeper 时加锁 `mutex`。 [#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复在将 lazy 列与 external sort 一起使用时出现的 `CORRUPTED_DATA` 错误。[#84738](https://github.com/ClickHouse/ClickHouse/pull/84738) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复 `DeltaLake` 存储中使用 delta-kernel 时的列剪枝问题。修复 [#84543](https://github.com/ClickHouse/ClickHouse/issues/84543)。[#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 DeltaLake 存储的 delta-kernel 中刷新凭据。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了在连接出现问题后会启动多余内部备份的情况。[#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复了在查询延迟的远程数据源时可能导致向量越界的问题。[#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` 和 `no_op` tokenizer 在遇到空输入 token 时不再导致（实验性）文本索引崩溃。[#84849](https://github.com/ClickHouse/ClickHouse/pull/84849) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复了使用 `ReplacingMergeTree` 和 `CollapsingMergeTree` 引擎的表的轻量级更新。[#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* 正确地将所有设置存储到使用 object queue 引擎的表的元数据中。[#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 Keeper 返回的总监视数计数。[#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在版本低于 25.7 的服务器上创建的 `ReplicatedMergeTree` 引擎表的轻量级更新。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在对使用非复制版 `MergeTree` 引擎的表执行 `ALTER TABLE ... REPLACE PARTITION` 查询后，轻量级更新无法正常工作的问题。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* 修复布尔字面量的列名生成方式，改为使用 &quot;true&quot;/&quot;false&quot; 而不是 &quot;1&quot;/&quot;0&quot;，从而避免在查询中布尔字面量与整数字面量产生列名冲突。 [#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复由后台调度池和执行器导致的内存跟踪偏差。[#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* 修复 Merge 表引擎中潜在的排序不准确问题。[#85025](https://github.com/ClickHouse/ClickHouse/pull/85025) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 为 DiskEncrypted 实现缺失的 API。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 在分布式场景中使用相关子查询时添加检查以避免崩溃。修复了 [#82205](https://github.com/ClickHouse/ClickHouse/issues/82205)。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* 现在 Iceberg 不再尝试在多次 `SELECT` 查询之间缓存相关的快照版本，而是始终实时解析快照。此前对 Iceberg 快照进行缓存的尝试，在结合时间穿梭功能使用 Iceberg 表时会导致问题。 [#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了 `AzureIteratorAsync` 中的 double free 问题。[#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat))。
* 在尝试创建以 JWT 标识的用户时，改进错误消息。[#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `ReplicatedMergeTree` 中补丁分片清理的问题。此前，轻量级更新的结果可能会在一段时间内在副本上不可见，直到物化这些补丁分片的合并分片或变更分片从另一副本下载完成。[#85121](https://github.com/ClickHouse/ClickHouse/pull/85121)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在类型不同的情况下，`mv` 中出现的 `illegal_type_of_argument` 错误。[#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 delta-kernel 实现中的段错误。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在移动元数据文件耗时较长时恢复副本数据库的问题。 [#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在 `additional_table_filters expression` 设置中 `IN (subquery)` 的 `Not-ready Set` 问题。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在执行 `SYSTEM DROP REPLICA` 查询时去除不必要的 `getStatus()` 调用。修复了在后台删除表时抛出 `Shutdown for storage is called` 异常的问题。[#85220](https://github.com/ClickHouse/ClickHouse/pull/85220)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复 `DeltaLake` 引擎 delta-kernel 实现中的竞争条件。[#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `DeltaLake` 引擎中禁用 delta-kernel 时读取分区数据失败的问题。该问题在 25.7 中被引入（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `CREATE OR REPLACE` 和 `RENAME` 查询中补充了缺失的表名长度检查。[#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复在 `DEFINER` 被删除时，在 `Replicated` 数据库的新副本上创建 RMV 的问题。 [#85327](https://github.com/ClickHouse/ClickHouse/pull/85327) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复 Iceberg 复杂类型的写入。[#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 复杂类型不支持写入下界和上界。[#85332](https://github.com/ClickHouse/ClickHouse/pull/85332)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复了通过 `Distributed` 表或 `remote` 表函数从对象存储函数读取数据时出现的逻辑错误。修复：[ #84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[ #85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[ #52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[ #85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 修复包含损坏 `projection` 的数据分片的备份功能。[#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368))。
* 在该功能稳定之前，禁止在 projection 中使用 `_part_offset` 列。[#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* 修复在对 JSON 执行 `ALTER UPDATE` 时可能发生的崩溃和数据损坏问题。[#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar)).
* 使用 `reading reverse in order` 优化的并行副本查询可能会产生不正确的结果。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在 `String` 反序列化期间触发 `MEMORY_LIMIT_EXCEEDED` 时可能出现的未定义行为（崩溃）。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 修复不正确的指标 KafkaAssignedPartitions 和 KafkaConsumersWithAssignment。 [#85494](https://github.com/ClickHouse/ClickHouse/pull/85494) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复在使用 PREWHERE（显式或自动）时“已处理字节”统计被低估的问题。 [#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 S3 请求速率减缓的提前返回条件：在由于可重试错误导致所有线程暂停时，要启用减缓行为，现在只需要 `s3&#95;slow&#95;all&#95;threads&#95;after&#95;network&#95;error` 或 `backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error` 其中之一为 true，而不是要求两者都为 true。[#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva)).
* 此 PR 修复了通过 REST 目录查询 Iceberg 表时的元数据解析。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* 修复了在异步插入过程中更改 `log_comment` 或 `insert_deduplication_token` 设置时可能发生的罕见崩溃问题。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ))。
* 在使用带有 multipart/form-data 的 HTTP 时，date&#95;time&#95;input&#95;format 等参数会被忽略。[#85570](https://github.com/ClickHouse/ClickHouse/pull/85570)（[Sema Checherinda](https://github.com/CheSema)）。
* 修复 `icebergS3Cluster` 和 `icebergAzureCluster` 表函数中的密钥遮蔽问题。 [#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复在将 JSON 数值转换为 Decimal 类型时 `JSONExtract` 出现的精度丢失问题。现在数值型 JSON 值可以保留其精确的小数表示，从而避免浮点舍入误差。[#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b))。
* 修复了在同一个 `ALTER` 语句中先执行 `DROP COLUMN`，再使用 `COMMENT COLUMN IF EXISTS` 时出现的 `LOGICAL_ERROR`。现在，当列在同一条语句中已被删除时，`IF EXISTS` 子句会正确跳过注释操作。[#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复从缓存中读取 Delta Lake 读取次数统计的问题。[#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在处理超大字符串时 `coalescing merge tree` 出现的段错误。修复内容见 [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582)。[#85709](https://github.com/ClickHouse/ClickHouse/pull/85709)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 Iceberg 写入过程中更新元数据时间戳。 [#85711](https://github.com/ClickHouse/ClickHouse/pull/85711) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 将 `distributed_depth` 作为 *Cluster 函数的标识是不正确的，并且可能导致数据重复；请改用 `client_info.collaborate_with_initiator`。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark 无法读取位置删除（position delete）文件。 [#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复 `send_logs_source_regexp`（在 [#85105](https://github.com/ClickHouse/ClickHouse/issues/85105) 中进行异步日志重构之后）。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在出现 MEMORY&#95;LIMIT&#95;EXCEEDED 错误时，带有 update&#95;field 的字典可能产生的不一致问题。 [#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat)).
* 在目标表为 `Distributed` 的并行分布式 `INSERT SELECT` 中，支持从 `WITH` 语句传递的全局常量。此前，该查询可能会抛出 `Unknown expression identifier` 错误。[#85811](https://github.com/ClickHouse/ClickHouse/pull/85811)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 对 `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` 和 `icebergAzureCluster` 的凭证进行脱敏处理。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* 修复在 `DatabaseReplicated` 中尝试执行 `CREATE ... AS (SELECT * FROM s3Cluster(...))` 时出现的逻辑错误。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 修复了由 `url()` 表函数发起的 HTTP 请求：在访问非标准端口时，现在会在 Host 头中正确包含端口号。此修复解决了在使用预签名 URL 访问 S3 兼容服务（例如运行在自定义端口上的 MinIO）时出现的认证失败问题，这种场景在开发环境中很常见。（修复了 [#85898](https://github.com/ClickHouse/ClickHouse/issues/85898)）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* 现在，对于非 `delta` 表，Unity Catalog 将忽略包含异常数据类型的 schema。修复了 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699)。[#85950](https://github.com/ClickHouse/ClickHouse/pull/85950)（[alesapin](https://github.com/alesapin)）。
* 修正 Iceberg 中字段的可空属性。[#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 修复了 `Replicated` 数据库恢复中的一个错误：如果表名包含 `%` 符号，在恢复过程中可能会以不同的名称重新创建该表。[#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 修复在恢复空 `Memory` 表时因出现 `BACKUP_ENTRY_NOT_FOUND` 错误而导致备份恢复失败的问题。[#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva))。
* 在对 `Distributed` 表执行 `ALTER` 时新增对 `sharding_key` 的检查。此前不正确的 `ALTER` 会破坏表定义并导致服务器在重启时出错。[#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique)).
* 不要创建空的 Iceberg 删除文件。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复由于设置值过大导致 `S3Queue` 表异常以及副本反复重启的问题。[#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 构建/测试/打包改进

- 默认在 S3 测试中使用加密磁盘。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
- 在集成测试中使用 `clickhouse` 二进制文件以获取未剥离的调试符号。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
- 将内部 libxml2 从 2.14.4 升级到 2.14.5。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze)).
- 将内部 curl 从 8.14.0 升级到 8.15.0。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze)).
- 现在 CI 中缓存使用的内存更少,并且对缓存驱逐机制进行了更完善的测试。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin)).

### ClickHouse 版本 25.7,2025-07-24 {#257}

#### 向后不兼容的变更

- 对 `extractKeyValuePairs` 函数的变更:引入新参数 `unexpected_quoting_character_strategy`,用于控制在读取非引号键或值时意外遇到 `quoting_character` 时的处理行为。该值可以是:`invalid`、`accept` 或 `promote`。`invalid` 将丢弃该键并返回等待键状态;`accept` 将其视为键的一部分;`promote` 将丢弃前一个字符并开始按引号键解析。此外,在解析引号值后,仅在找到键值对分隔符时才解析下一个键。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos)).
- 在 `countMatches` 函数中支持零字节匹配。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov)).
- 在生成备份时,除了专用服务器设置(`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server` 和 `max_merges_bandwidth_for_server`)外,还使用服务器级限流器来控制本地(`max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`)和远程(`max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server`)带宽。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa)).
- 禁止创建没有可插入列的表。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
- 按归档文件内的文件并行化集群函数。在以前的版本中,整个归档文件(如 zip、tar 或 7z)是一个工作单元。添加了新设置 `cluster_function_process_archive_on_multiple_nodes`,默认值为 `true`。如果设置为 `true`,可提高集群函数处理归档文件的性能。如果在早期版本中使用带归档文件的集群函数,为了兼容性并避免升级到 25.7+ 时出现错误,应将其设置为 `false`。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii)).
- `SYSTEM RESTART REPLICAS` 查询会导致 Lazy 数据库中的表被唤醒,即使没有访问该数据库的权限,并且这发生在这些表被并发删除时。注意:现在 `SYSTEM RESTART REPLICAS` 只会在您拥有 `SHOW TABLES` 权限的数据库中重启副本,这是符合预期的行为。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov)).


#### 新功能

* 为 `MergeTree` 系列表添加了对轻量级更新的支持。可以通过新的语法使用轻量级更新：`UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>`。通过轻量级更新实现了轻量级删除功能，可以通过设置 `lightweight_delete_mode = 'lightweight_update'` 来启用。[#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* 在 Iceberg 模式演进中支持复杂类型。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 为 Iceberg 表新增对 INSERT 的支持。[#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 通过字段 ID 读取 Iceberg 数据文件。这提升了与 Iceberg 的兼容性：字段可以在元数据中被重命名，同时仍能映射到底层 Parquet 文件中对应的不同名称。修复了 [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065)。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 现在 ClickHouse 已支持用于 Iceberg 的压缩 `metadata.json` 文件。修复了 [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874)。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* 在 Glue catalog 中支持 `TimestampTZ`。修复了 [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654)。[#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 为 ClickHouse 客户端添加 AI 驱动的 SQL 生成能力。用户现在可以通过在查询前添加前缀 `??`，根据自然语言描述生成 SQL 查询。支持 OpenAI 和 Anthropic 提供方，并具备自动 schema 发现功能。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314) ([Kaushik Iska](https://github.com/iskakaushik))。
* 新增一个函数，用于将 Geo 类型写入 WKB 格式。[#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 为 sources 引入了两种新的访问类型：`READ` 和 `WRITE`，并废弃了此前所有与 sources 相关的访问类型。之前是 `GRANT S3 ON *.* TO user`，现在为：`GRANT READ, WRITE ON S3 TO user`。这也支持将 sources 的 `READ` 和 `WRITE` 权限分离，例如：`GRANT READ ON * TO user`，`GRANT WRITE ON S3 TO user`。该功能由设置 `access_control_improvements.enable_read_write_grants` 控制，默认关闭。 [#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit))。
* NumericIndexedVector：一种新的向量数据结构，基于按位切片（bit-sliced）和 Roaring-bitmap 压缩，并配套提供 20 多个用于构建、分析和逐点算术运算的函数。可减少存储占用，并加速在稀疏数据上的 `JOIN`、过滤和聚合操作。实现了 [#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) 以及 T. Xiong 和 Y. Wang 在 VLDB 2024 发表的 [《Large-Scale Metric Computation in Online Controlled Experiment Platform》论文](https://arxiv.org/abs/2405.08411)。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193)（[FriendLey](https://github.com/FriendLey)）。
* 现在支持工作负载设置 `max_waiting_queries`。它可用于限制查询队列的长度。如果达到该限制，所有后续查询都会因 `SERVER_OVERLOADED` 错误而被终止。[#81250](https://github.com/ClickHouse/ClickHouse/pull/81250)（[Oleg Doronin](https://github.com/dorooleg)）。
* 添加财务函数：`financialInternalRateOfReturnExtended`（`XIRR`）、`financialInternalRateOfReturn`（`IRR`）、`financialNetPresentValueExtended`（`XNPV`）、`financialNetPresentValue`（`NPV`）。 [#81599](https://github.com/ClickHouse/ClickHouse/pull/81599) ([Joanna Hulboj](https://github.com/jh0x))。
* 添加地理空间函数 `polygonsIntersectCartesian` 和 `polygonsIntersectSpherical`，用于检查两个多边形是否相交。[#81882](https://github.com/ClickHouse/ClickHouse/pull/81882)（[Paul Lamb](https://github.com/plamb)）。
* 在 MergeTree 系列表中支持 `_part_granule_offset` 虚拟列。该列表示每一行在其数据 part 内所属 granule/mark 的从零开始计数的索引。此更改解决了 [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572)。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* 添加了 SQL 函数 `colorSRGBToOkLCH` 和 `colorOkLCHToSRGB`，用于在 sRGB 与 OkLCH 颜色空间之间相互转换颜色。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue))。
* 允许在 `CREATE USER` 查询中为用户名使用参数。[#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein))。
* `system.formats` 表现在包含关于格式的更多信息，例如 HTTP 内容类型、schema 推断能力等。[#81505](https://github.com/ClickHouse/ClickHouse/pull/81505)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 实验特性
* 新增函数 `searchAny` 和 `searchAll`，作为通用工具用于搜索文本索引。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 文本索引现在支持新的 `split` 分词器。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将 `text` 索引的默认索引粒度调整为 64。这提升了内部基准测试中典型测试查询的预期性能。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 位位图按顺序存储某个状态的输出标签，但输出状态在磁盘上是按照它们在哈希表中出现的顺序保存的。因此，从磁盘读取时，某个标签会指向错误的下一个状态。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 为文本索引中的 FST 树 blob 启用 zstd 压缩。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将向量相似度索引升级为 Beta 阶段。引入别名配置项 `enable_vector_similarity_index`，必须开启该配置才能使用向量相似度索引。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 移除了与实验性零拷贝复制相关的实验性 `send_metadata` 逻辑。该逻辑从未被使用，也没有人维护这段代码。由于甚至没有任何相关测试，它很可能早在很久之前就已经失效了。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* 将 `StorageKafka2` 集成到 `system.kafka_consumers` 中。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 通过统计信息估算复杂 CNF/DNF 表达式，例如 `(a < 1 and a > 0) or b = 3`。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### 性能提升

* 引入异步日志记录。当日志输出到慢速设备时，将不再拖慢查询。[#82516](https://github.com/ClickHouse/ClickHouse/pull/82516)（[Raúl Marín](https://github.com/Algunenano)）。限制队列中保留的记录数量上限。[#83214](https://github.com/ClickHouse/ClickHouse/pull/83214)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 `INSERT SELECT` 以每个分片独立执行的模式下，并行分布式 `INSERT SELECT` 默认处于启用状态，参见 `parallel_distributed_insert_select` 设置。 [#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter))。
* 当聚合查询只在一个非 `Nullable` 列上使用单个 `count()` 函数时，聚合逻辑会在哈希表探测阶段被完全内联。这样可以避免分配和维护任何聚合状态，从而显著降低内存占用和 CPU 开销。在一定程度上缓解了 [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) 中的问题。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* 通过在仅有一个键列这一典型场景下移除对哈希映射的额外遍历来优化 `HashJoin` 的性能，同时当 `null_map` 和 `join_mask` 始终为 `true`/`false` 时，省略了相应的检查。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat)).
* 对 `-If` 组合器进行了轻量优化。[#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 使用，具有更低的延迟。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在 `filterPartsByQueryConditionCache` 中遵循 `merge_tree_min_{rows,bytes}_for_seek`，使其与其他按索引过滤的方法保持一致。[#80312](https://github.com/ClickHouse/ClickHouse/pull/80312)（[李扬](https://github.com/taiyang-li)）。
* 使 `TOTALS` 步骤之后的管道支持多线程。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus)).
* 修复 `Redis` 和 `KeeperMap` 存储的按键过滤问题。[#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 新增设置 `min_joined_block_size_rows`（类似于 `min_joined_block_size_bytes`；默认值为 65409），用于控制 JOIN 输入和输出数据块的最小块大小（按行数计）（如果所用 JOIN 算法支持该设置）。过小的数据块将会被合并。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` 不再会导致所有缓存被清空。[#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过使用等价类移除冗余 JOIN 操作，优化对相关子查询生成的执行计划。如果所有相关列都有等价表达式，并且启用了 `query_plan_correlated_subqueries_use_substitution` 设置，则不会生成 `CROSS JOIN`。 [#82435](https://github.com/ClickHouse/ClickHouse/pull/82435) ([Dmitry Novik](https://github.com/novikd))。
* 当关联子查询作为函数 `EXISTS` 的参数时，仅读取所需的列。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* 在查询分析阶段，对查询树的比较进行了小幅加速。[#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在 `ProfileEvents` 的 `Counter` 中添加对齐以减少伪共享。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn))。
* 来自 [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) 的 `null_map` 和 `JoinMask` 优化已应用于含有多个析取条件的 JOIN 场景。同时，对 `KnownRowsHolder` 数据结构也进行了优化。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* 使用普通的 `std::vector<std::atomic_bool>` 作为 join 标记，以避免在每次访问标记时都计算哈希。[#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* 当 `HashJoin` 使用 `lazy` 输出模式时，不要提前为结果列预分配内存。这种做法并不理想，尤其是在匹配数量较少的情况下。此外，在完成 join 之后我们就知道了精确的匹配数量，因此可以更精确地进行预分配。[#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat))。
* 在构建 pipeline 期间尽量减少端口头部的内存拷贝。原始 [PR](https://github.com/ClickHouse/ClickHouse/pull/70105) 由 [heymind](https://github.com/heymind) 提交。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 clickhouse-keeper 使用 RocksDB 存储时改进其启动过程。[#83390](https://github.com/ClickHouse/ClickHouse/pull/83390)（[Antonio Andelic](https://github.com/antonio2368)）。
* 避免在创建存储快照数据时持有锁，从而在高并发负载下减少锁争用。[#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94))。
* 通过在未发生解析错误时复用序列化器，提升了 `ProtobufSingle` 输入格式的性能。[#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa))。
* 优化流水线构建性能，从而加速短查询执行。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 优化 `MergeTreeReadersChain::getSampleBlock`，以加速短查询。[#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano))。
* 通过异步请求加速数据目录中的表列表。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* 在启用 `s3_slow_all_threads_after_network_error` 配置时，为 S3 重试机制引入抖动。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改进

* 使用多种颜色为括号着色，以提高可读性。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在输入时高亮显示 `LIKE`/`REGEXP` 模式中的元字符。我们已经在 `clickhouse-format` 和 `clickhouse-client` 的 echo 输出中实现了这一点，现在在命令行提示符中也同样支持了。[#82871](https://github.com/ClickHouse/ClickHouse/pull/82871)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-format` 中以及在客户端的 echo 输出中，高亮显示的行为将与命令行提示符中的高亮显示方式相同。[#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 现在允许将 `plain_rewritable` 磁盘用于存储数据库元数据。在 `plain_rewritable` 中实现了 `moveFile` 和 `replaceFile` 方法，以支持其作为数据库磁盘使用。[#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 允许为 `PostgreSQL`、`MySQL` 和 `DataLake` 数据库创建备份。此类数据库的备份只会保存其定义，而不会保存其中的数据。[#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique))。
* 将设置项 `allow_experimental_join_condition` 标记为已废弃，因为它现在始终被允许。[#80566](https://github.com/ClickHouse/ClickHouse/pull/80566)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 将负载相关指标添加到 ClickHouse 异步指标中。 [#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1)).
* 新增了指标 `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles`，用于跟踪从 mark cache 中被逐出的数据。（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* 支持按照[规范](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)要求，将 Parquet 枚举类型写为字节数组。[#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos))。
* 对 `DeltaLake` 表引擎的改进：`delta-kernel-rs` 提供了 `ExpressionVisitor` API，本 PR 实现了该 API，并将其用于分区列表达式的转换（它将取代我们代码中之前使用的、现已在 `delta-kernel-rs` 中弃用的旧实现方式）。未来，这个 `ExpressionVisitor` 也将用于实现基于统计信息的剪枝，以及一些 Delta Lake 的专有特性。此外，此更改的另一个目的，是在 `DeltaLakeCluster` 表引擎中支持分区剪枝（解析后的表达式结果 `ActionsDAG` 将被序列化，并与数据路径一起从发起端发送，因为剪枝所需的这类信息只作为数据文件列表的元信息存在，而该列表仅由发起端生成，但这些信息必须在每个读取服务器上应用到数据）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在为具名 `tuple` 推导超类型时保留元素名称。[#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc))。
* 在 StorageKafka2 中手动统计已消费的消息数量，以避免依赖之前已提交的 offset。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 新增了 `clickhouse-keeper-utils`，这是一个用于管理和分析 ClickHouse Keeper 数据的新命令行工具。该工具支持从快照和变更日志中导出状态、分析变更日志文件，以及提取指定范围的日志。[#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 总的网络限速器和按用户的网络限速器都不会被重置，从而确保 `max_network_bandwidth_for_all_users` 和 `max_network_bandwidth_for_all_users` 这两个限制值永远不会被超出。[#81729](https://github.com/ClickHouse/ClickHouse/pull/81729) ([Sergei Trifonov](https://github.com/serxa))。
* 支持将 `geoparquet` 写出为结果格式。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 如果某列当前正受未完成的数据变更影响，则禁止启动会重命名该列的 `RENAME COLUMN` 变更操作。[#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 当确定是否应保留连接后，会在所有头部的末尾发送 `Connection` 头。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema)).
* 根据 `listen_backlog`（默认 4096）调整 TCP 服务器队列（默认 64）。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* 新增支持在无需重启服务器的情况下即时重新加载 `max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`。[#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu)).
* 添加对使用 `TRUNCATE TABLE system.warnings` 清除 `system.warnings` 表中所有警告的支持。[#82087](https://github.com/ClickHouse/ClickHouse/pull/82087)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复数据湖集群函数中的分区剪枝问题。[#82131](https://github.com/ClickHouse/ClickHouse/pull/82131)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了 `DeltaLakeCluster` 表函数中读取分区数据的问题。在此 PR 中提升了集群函数的协议版本，从而可以将额外信息从发起端发送到副本。这些额外信息包含用于解析分区列的 `delta-kernel` 转换表达式（以及未来的其他内容，例如生成列等）。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 函数 `reinterpret` 现在支持转换为 `Array(T)`，其中 `T` 为固定大小的数据类型（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 现在，`database Datalake` 会抛出更加易于理解的异常。修复了 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211)。[#82304](https://github.com/ClickHouse/ClickHouse/pull/82304)（[alesapin](https://github.com/alesapin)）。
* 通过在 `HashJoin::needUsedFlagsForPerRightTableRow` 中返回 false 来优化 `CROSS JOIN`。[#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc))。
* 允许将写入/读取的 `Map` 列作为 `Array(Tuple)` 使用。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 在 `system.licenses` 中列出 [Rust](https://clickhouse.com/blog/rust) crate 所使用的许可证。[#82440](https://github.com/ClickHouse/ClickHouse/pull/82440)（[Raúl Marín](https://github.com/Algunenano)）。
* 现在可以在 S3Queue 表引擎的 `keeper_path` 设置中使用 `{uuid}` 等宏。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Keeper 改进：在后台线程中在不同磁盘之间移动 changelog 文件。此前，将 changelog 移动到不同磁盘会在移动完成之前全局阻塞 Keeper。如果移动操作耗时较长（例如移动到 S3 磁盘），会导致性能下降。 [#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368))。
* Keeper 改进：新增配置项 `keeper_server.cleanup_old_and_ignore_new_acl`。启用后，所有节点上的 ACL 都会被清除，新请求的 ACL 也会被忽略。如果目标是从节点上彻底移除 ACL，务必要在创建新的快照之前一直保持该配置为启用状态。[#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368))。
* 新增了一个服务器设置 `s3queue_disable_streaming`，用于在使用 S3Queue 表引擎的表中禁用流式处理。此设置可在无需重启服务器的情况下进行更改。[#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 重构文件系统缓存的动态扩容功能。添加了更多日志以便排查分析。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在没有配置文件的情况下，`clickhouse-server` 也会像使用默认配置时一样监听 PostgreSQL 端口 9005。[#82633](https://github.com/ClickHouse/ClickHouse/pull/82633) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 `ReplicatedMergeTree::executeMetadataAlter` 中，我们获取 `StorageID`，并在不获取 `DDLGuard` 的情况下尝试调用 `IDatabase::alterTable`。在这段时间内，从技术上讲，我们可能会把目标表替换成另一张表，因此在获取定义时可能会拿到错误的那个。为避免这种情况，我们在尝试调用 `IDatabase::alterTable` 时增加了一个单独的检查，以确保 `UUID` 匹配。[#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 在附加使用只读远程磁盘的数据库时，需要将表的 UUID 手动添加到 DatabaseCatalog 中。[#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 禁止在 `NumericIndexedVector` 中使用 `nan` 和 `inf`。修复了 [#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) 以及一些额外问题。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 不要在 `X-ClickHouse-Progress` 和 `X-ClickHouse-Summary` 头部字段的格式中省略零值。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper 改进：支持为 `world:anyone` ACL 设置特定权限。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* 禁止在 SummingMergeTree 中对被显式列为要参与 sum 的列执行 `RENAME COLUMN` 或 `DROP COLUMN` 操作。修复 [#81836](https://github.com/ClickHouse/ClickHouse/issues/81836)。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 改进从 `Decimal` 到 `Float32` 的转换精度，实现从 `Decimal` 到 `BFloat16` 的转换。关闭 [#82660](https://github.com/ClickHouse/ClickHouse/issues/82660)。 [#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中滚动条的外观会略有改善。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 使用嵌入式配置的 `clickhouse-server` 现在通过返回 HTTP OPTIONS 响应来支持 Web UI。[#82870](https://github.com/ClickHouse/ClickHouse/pull/82870)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在配置中新增了为路径指定额外 Keeper ACL 的支持。如果你想为某个特定路径添加额外 ACL，可以在配置中的 `zookeeper.path_acls` 下进行定义。[#82898](https://github.com/ClickHouse/ClickHouse/pull/82898)（[Antonio Andelic](https://github.com/antonio2368)）。
* 现在将基于可见部分的快照来构建变更快照。同时，快照中使用的变更计数器会根据包含的变更重新计算。[#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 当 Keeper 因软内存限制而拒绝写入时，增加一个 `ProfileEvent`。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* 在 `system.s3queue_log` 中新增列 `commit_time` 和 `commit_id`。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在某些情况下，我们需要让指标具备多个维度。比如，与其只用单一计数器，不如按错误码统计失败的合并或变更操作。为此引入了 `system.dimensional_metrics`，它正是为这一需求而设计，并新增了首个名为 `failed_merges` 的维度化指标。 [#83030](https://github.com/ClickHouse/ClickHouse/pull/83030) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在 clickhouse client 中汇总未知设置的警告，并以摘要形式写入日志。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc)).
* 当发生连接错误时，ClickHouse 客户端现在会报告本地端口。[#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly))。
* 在 `AsynchronousMetrics` 中略微改进了错误处理。如果 `/sys/block` 目录存在但无法访问，服务器将会在不监控块设备的情况下启动。关闭了 [#79229](https://github.com/ClickHouse/ClickHouse/issues/79229)。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在普通表之后（并在系统表之前，而不是在普通表之前）关闭 `SystemLogs`。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 为 `S3Queue` 的关闭过程添加日志。[#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 可以将 `Time` 和 `Time64` 解析为 `MM:SS`、`M:SS`、`SS` 或 `S` 格式。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 当 `distributed_ddl_output_mode='*_only_active'` 时，不再等待那些复制延迟大于 `max_replication_lag_to_enqueue` 的新副本或恢复完成的副本。这样可以避免在某个新副本完成初始化或恢复后变为活跃状态时，由于其在初始化过程中累积了大量复制日志，而导致出现 `DDL task is not finished on some hosts` 的情况。同时，实现了 `SYSTEM SYNC DATABASE REPLICA STRICT` 查询，用于等待复制日志降到低于 `max_replication_lag_to_enqueue` 的水平。[#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 不要在异常消息中输出过长的表达式操作描述。修复了 [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164)。[#83350](https://github.com/ClickHouse/ClickHouse/pull/83350) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增对解析 part 前缀和后缀的支持，并对非常量列进行覆盖检查。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在使用命名集合时，统一 ODBC 和 JDBC 的参数名称。[#83410](https://github.com/ClickHouse/ClickHouse/pull/83410)（[Andrey Zvonov](https://github.com/zvonand)）。
* 当存储正在关闭时，`getStatus` 会抛出 `ErrorCodes::ABORTED` 异常。此前，这会导致 `SELECT` 查询失败。现在我们会捕获 `ErrorCodes::ABORTED` 异常并刻意将其忽略。[#83435](https://github.com/ClickHouse/ClickHouse/pull/83435)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在 `part_log` 的 profile events 中为 `MergeParts` 记录添加进程资源指标（例如 `UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds`）。[#83460](https://github.com/ClickHouse/ClickHouse/pull/83460) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在 Keeper 中默认启用 `create_if_not_exists`、`check_not_exists`、`remove_recursive` 功能标志，以支持新的请求类型。[#83488](https://github.com/ClickHouse/ClickHouse/pull/83488)（[Antonio Andelic](https://github.com/antonio2368)）。
* 在服务器关闭时，在关闭任何表之前先关闭 S3（Azure/等）队列流式传输。[#83530](https://github.com/ClickHouse/ClickHouse/pull/83530)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `JSON` 输入格式中支持将 `Date`/`Date32` 作为整数处理。[#83597](https://github.com/ClickHouse/ClickHouse/pull/83597)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 针对加载和添加 `projection` 的某些情况，改进了异常信息，使其更易于阅读。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze))。
* 为 `clickhouse-server` 引入一个配置选项，用于跳过二进制校验和的完整性检查。修复 [#83637](https://github.com/ClickHouse/ClickHouse/issues/83637)。[#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复 `clickhouse-benchmark` 中 `--reconnect` 选项错误的默认值。该默认值在 [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) 中被误改。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 `CREATE DICTIONARY` 的格式不一致问题。关闭 [#82105](https://github.com/ClickHouse/ClickHouse/issues/82105)。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复包含 `materialize` 函数的 TTL 的格式不一致问题。关联关闭 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复当子查询包含 `INTO OUTFILE` 等输出选项时，`EXPLAIN AST` 格式不一致的问题。修复了 [#82826](https://github.com/ClickHouse/ClickHouse/issues/82826)。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在不允许使用别名的上下文中，带别名括号表达式的格式不一致问题。关闭 [#82836](https://github.com/ClickHouse/ClickHouse/issues/82836)。关闭 [#82837](https://github.com/ClickHouse/ClickHouse/issues/82837)。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在将聚合函数状态与 IPv4 相乘时使用合适的错误代码。关闭 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817)。[#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复文件系统缓存中的逻辑错误：“Having zero bytes but range is not finished”。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 TTL 减少行数时重新计算 min-max 索引，以确保依赖该索引的算法（例如 `minmax_count_projection`）的正确性。修复了 [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091)。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* 对于包含 `ORDER BY ... LIMIT BY ... LIMIT N` 组合的查询，当 `ORDER BY` 以 `PartialSorting` 方式执行时，计数器 `rows_before_limit_at_least` 现在反映的是被 `LIMIT` 子句消费的行数，而不是排序变换所消费的行数。[#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 修复在使用包含交替且首个选项为非字面量的 `regexp` 对 `token`/`ngram` 索引进行过滤时出现的过度 granule 跳过问题。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* 修复了使用 `<=>` 运算符与 Join 表引擎时的逻辑错误，现在查询会返回正确的错误码。[#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复在与 `remote` 函数族一起使用时 `loop` 函数发生的崩溃问题。确保在 `loop(remote(...))` 中会遵守 LIMIT 子句。 [#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复 `to_utc_timestamp` 和 `from_utc_timestamp` 函数在处理 Unix 纪元（1970-01-01）之前及最大日期（2106-02-07 06:28:15）之后的日期时的错误行为。现在，这些函数会分别正确地将值钳制到纪元起始时间和最大日期。[#80498](https://github.com/ClickHouse/ClickHouse/pull/80498)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* 对于某些使用并行副本执行的查询，`reading in order` 优化可以在 initiator 上应用，但无法在远程节点上应用。这会导致并行副本协调器（位于 initiator 上）与远程节点所使用的读取模式不一致，从而引发逻辑错误。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter))。
* 修复在物化投影时，当列类型被更改为 `Nullable` 后出现的逻辑错误。[#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在更新 TTL 时，`TTL GROUP BY` 中错误的 TTL 重算问题。[#81222](https://github.com/ClickHouse/ClickHouse/pull/81222)（[Evgeniy Ulasik](https://github.com/H0uston)）。
* 修复了 Parquet 布隆过滤器在处理类似 `WHERE function(key) IN (...)` 的条件时，被错误地按 `WHERE key IN (...)` 的方式应用的问题。[#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复了在合并过程中抛出异常时，`Aggregator` 中可能发生的崩溃问题。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* 修复了 `InterpreterInsertQuery::extendQueryLogElemImpl`，在需要时为数据库名和表名添加反引号（例如，当名称包含 `-` 等特殊字符时）。[#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu)).
* 修复在 `transform_null_in=1` 条件下，左参数为 `null` 且子查询结果为非可空时 `IN` 的执行行为。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 在从已有表读取数据时，在执行 `default`/`materialize` 表达式期间不要校验实验性/可疑类型。[#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在合并过程中，当在 TTL 表达式中使用字典时出现的 “Context has expired” 错误。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `cast` 函数的单调性。[#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi)).
* 修复在处理标量相关子查询时未读取必需列的问题。修复了 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。 [#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 在之前的版本中，服务器在处理指向 `/js` 的请求时返回了过多的内容。此更改解决了 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 之前，`MongoDB` 表引擎定义可以在 `host:port` 参数中包含路径组件，但该组件会被悄然忽略。`mongodb` 集成会拒绝加载此类表。通过此修复，*如果 `MongoDB` 引擎有五个参数，我们允许加载此类表并忽略路径组件*，并改用参数中指定的数据库名。*注意：* 此修复不会应用于新建表、使用 `mongo` 表函数的查询、字典数据源或命名集合。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在合并过程中抛出异常时，`Aggregator` 可能发生崩溃的问题。[#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在查询中仅使用常量别名列时的筛选分析问题。修复了 [#79448](https://github.com/ClickHouse/ClickHouse/issues/79448)。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在 `GROUP BY` 和 `SET` 的 TTL 中使用相同列时出现的 `LOGICAL_ERROR` 以及随后的崩溃。[#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复了在 secret 掩码中对 S3 表函数参数的校验，防止可能出现的 `LOGICAL_ERROR`，关闭 [#80620](https://github.com/ClickHouse/ClickHouse/issues/80620)。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复 Iceberg 中的数据争用。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `DatabaseReplicated::getClusterImpl`。如果 `hosts` 的第一个元素（或多个首元素）具有 `id == DROPPED_MARK`，并且同一分片没有其他元素，则 `shards` 的第一个元素将是空向量，导致抛出 `std::out_of_range`。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复 `arraySimilarity` 中的复制粘贴错误，禁止使用 `UInt32` 和 `Int32` 作为权重类型。更新测试和文档。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 修复在包含 `WHERE` 条件和 `IndexSet` 时使用 `arrayJoin` 的查询中出现的 `Not found column` 错误。[#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复 Glue catalog 集成中的错误。现在 ClickHouse 可以读取包含嵌套数据类型的表，即使其中某些子列为十进制类型，例如：`map<string, decimal(9, 2)>`。修复了 [#81301](https://github.com/ClickHouse/ClickHouse/issues/81301)。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* 修复在 25.5 版本中通过 [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) 引入的 `SummingMergeTree` 性能下降问题。[#82130](https://github.com/ClickHouse/ClickHouse/pull/82130)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在通过 URI 传递设置时，将以最后一次出现的值为准。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 Iceberg 中的 “Context has expired” 问题。[#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* 在服务器处于内存压力时，修复远程查询可能出现的死锁问题。[#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar))。
* 修复了在将 `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 函数应用于较大数值时可能出现的溢出问题。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 修复了表依赖中的一个错误，该错误会导致物化视图遗漏 `INSERT` 查询。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复 suggestion 线程与主客户端线程之间可能发生的数据竞争问题。[#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* 现在 ClickHouse 在模式演进后也可以通过 Glue catalog 读取 Iceberg 表。修复了 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272)。[#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 修复异步指标设置 `asynchronous_metrics_update_period_s` 和 `asynchronous_heavy_metrics_update_period_s` 的验证逻辑。[#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复在包含多个 JOIN 的查询中解析 matcher 时的逻辑错误，关闭 [#81969](https://github.com/ClickHouse/ClickHouse/issues/81969)。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 为 AWS ECS 令牌添加过期时间，以便可以重新加载。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `CASE` 函数处理中 `NULL` 参数时的一个错误。[#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复客户端中的数据竞争问题（通过不再使用全局上下文）以及 `session_timezone` 覆盖逻辑（此前如果在 `users.xml`/客户端选项中将 `session_timezone` 设置为非空，而在查询上下文中设置为空，那么会错误地使用 `users.xml` 中的值；现在查询上下文将始终优先于全局上下文）。[#82444](https://github.com/ClickHouse/ClickHouse/pull/82444)（[Azat Khuzhin](https://github.com/azat)）。
* 修复外部表引擎中缓存缓冲区禁用边界对齐的行为。该行为在 [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) 中被破坏。[#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在将 `key-value` 存储与经过类型转换的键进行 `JOIN` 时发生的崩溃。[#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在 logs/query&#95;log 中隐藏命名集合值的行为。修复 [#82405](https://github.com/ClickHouse/ClickHouse/issues/82405)。[#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在终止会话时，因 `user_id` 可能为空而导致的日志记录潜在崩溃问题。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在解析 `Time` 时可能导致 msan 问题的情况。修复相关问题：[#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 禁止将 `threadpool_writer_pool_size` 设置为零，以确保服务器操作不会发生卡死。[#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复在分析与列相关的行策略表达式时出现的 `LOGICAL_ERROR`。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd))。
* 在 `enable_shared_storage_snapshot_in_query = 1` 时，修复 `mergeTreeProjection` 表函数中对父元数据的不正确使用。对应 [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634)。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 函数 `trim{Left,Right,Both}` 现在支持类型为 &quot;FixedString(N)&quot; 的输入字符串。例如，`SELECT trimBoth(toFixedString('abc', 3), 'ac')` 现在可以正常工作。[#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 AzureBlobStorage 中，对于原生复制，我们会比较不同的身份验证方法；如果在此过程中捕获到异常，则已更新代码以回退为“读取并复制”（即非原生复制）。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 修复在存在空元素时 `groupArraySample` / `groupArrayLast` 的反序列化问题（当输入为空时，反序列化可能会跳过部分二进制数据，这会在读取数据时导致数据损坏，并在 TCP 协议中导致 UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER 错误）。这不会影响数字和日期时间类型。[#82763](https://github.com/ClickHouse/ClickHouse/pull/82763)（[Pedro Ferreira](https://github.com/PedroTadim)）。
* 修复空 `Memory` 表备份的问题，该问题会导致在恢复备份时因 `BACKUP_ENTRY_NOT_FOUND` 错误而失败。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复 `union/intersect/except_default_mode` 重写中的异常安全性问题。关闭 [#82664](https://github.com/ClickHouse/ClickHouse/issues/82664)。[#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 跟踪异步表加载任务的数量。如果存在正在运行的任务，则不要在 `TransactionLog::removeOldEntries` 中更新 `tail_ptr`。 [#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复 Iceberg 中的数据竞态问题。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* 设置 `use_skip_indexes_if_final_exact_mode` 优化（在 25.6 中引入）时，可能会因 `MergeTree` 引擎设置或数据分布而无法选出合适的候选范围。该问题现已修复。[#82879](https://github.com/ClickHouse/ClickHouse/pull/82879)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 在从 AST 解析类型为 `SCRAM_SHA256_PASSWORD` 的身份验证数据时设置 salt。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 在使用不带缓存的 `Database` 实现时，在返回列并且引用失效后，相应表的元数据会被删除。[#82939](https://github.com/ClickHouse/ClickHouse/pull/82939)（[buyval01](https://github.com/buyval01)）。
* 修复了在包含对使用 `Merge` 存储的表进行 `JOIN` 表达式的查询中，对过滤条件进行修改时出现的问题。修复了 [#82092](https://github.com/ClickHouse/ClickHouse/issues/82092)。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 QueryMetricLog 中的 LOGICAL&#95;ERROR：Mutex 不能为空。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复了在将格式说明符 `%f` 与可变长度的格式说明符（例如 `%M`）一起使用时，函数 `formatDateTime` 输出不正确的问题。[#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复在启用 analyzer 时，由于次要查询始终从 `VIEW` 中读取所有列而导致的性能下降问题。修复了 [#81718](https://github.com/ClickHouse/ClickHouse/issues/81718)。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在只读磁盘上恢复备份时具有误导性的错误信息。[#83051](https://github.com/ClickHouse/ClickHouse/pull/83051)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在创建没有依赖关系的表时不再检查循环依赖。这修复了在[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405)中引入、涉及创建成千上万张表的用例中的性能下降问题。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了将负 `Time` 值隐式读取到表中的问题，并使文档表述更加清晰。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 不要在 `lowCardinalityKeys` 函数中使用共享字典中无关的部分。[#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复了在物化视图中使用子列时出现的回退问题。对应修复：[#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复在错误的 INSERT 之后连接被遗留在断开状态从而导致客户端崩溃的问题。[#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 修复在计算包含空列的块大小时发生的崩溃。[#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 `UNION` 中使用 `Variant` 类型时可能出现的崩溃。 [#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 `clickhouse-local` 中对不支持的 `SYSTEM` 查询抛出 `LOGICAL_ERROR` 的问题。[#83333](https://github.com/ClickHouse/ClickHouse/pull/83333)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* 修复 S3 客户端中的 `no_sign_request`。它可用于显式禁用对 S3 请求的签名。也可以通过基于 endpoint 的设置为特定 endpoint 定义该选项。[#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复了在启用 CPU 调度的情况下，在负载下执行且设置了 &#39;max&#95;threads=1&#39; 的查询时可能发生的崩溃问题。[#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* 修复在 CTE 定义引用另一个同名表表达式时出现的 `TOO_DEEP_SUBQUERIES` 异常。[#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd))。
* 修复执行 `REVOKE S3 ON system.*` 时的错误行为，该命令会错误地撤销 `*.*` 的 S3 权限。此修复解决了 [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417)。[#83420](https://github.com/ClickHouse/ClickHouse/pull/83420)（[pufit](https://github.com/pufit)）。
* 不要在不同查询之间共享 async&#95;read&#95;counters。[#83423](https://github.com/ClickHouse/ClickHouse/pull/83423)（[Azat Khuzhin](https://github.com/azat)）。
* 当子查询包含 `FINAL` 时，禁用并行副本。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 解决在设置 `role_cache_expiration_time_seconds` 配置项时出现的轻微整数溢出问题（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* 修复在 [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) 中引入的一个错误。在向带有 definer 的物化视图插入数据时，权限检查应使用该 definer 的权限配置。本次修复解决了 [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951)。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* 对 Iceberg 数组元素和 Iceberg 映射值（包括其所有嵌套子字段）禁用基于边界的文件裁剪。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在将文件缓存用作临时数据存储时可能出现的“未初始化”错误。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper 修复：在会话关闭时删除临时节点后，正确更新 watch 总数。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 `max_untracked_memory` 附近的错误内存处理。[#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* 在某个极端情况下，带有 `UNION ALL` 的 `INSERT SELECT` 可能会导致空指针解引用。此更改修复了 [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618)。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止将 `max_insert_block_size` 设置为零值，因为这可能导致逻辑错误。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复在 `block_size_bytes=0` 时 `estimateCompressionRatio()` 中出现的无限循环。[#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat))。
* 修复 `IndexUncompressedCacheBytes` / `IndexUncompressedCacheCells` / `IndexMarkCacheBytes` / `IndexMarkCacheFiles` 指标（此前它们被计入未带 `Cache` 前缀的指标中）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730) ([Azat Khuzhin](https://github.com/azat))。
* 修复在关闭 `BackgroundSchedulePool` 期间，由于从任务中加入线程可能导致的崩溃（abort），并希望同时避免（单元测试中）可能出现的长时间挂起。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat)).
* 引入向后兼容设置，在名称冲突时允许新的分析器在 `WITH` 子句中引用外层别名。修复 [#82700](https://github.com/ClickHouse/ClickHouse/issues/82700)。[#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* 修复由于在关闭过程中对 library bridge 进行清理时递归加锁上下文而导致的死锁。[#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### 构建/测试/打包改进

- 为 ClickHouse 词法分析器构建一个最小化的 C 库(10 KB)。这是为了满足 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 的需求。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。为独立词法分析器添加测试,添加测试标签 `fasttest-only`。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
- 为 Nix 子模块输入添加检查。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复在本地主机上运行集成测试时可能出现的一系列问题。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135) ([Oleg Doronin](https://github.com/dorooleg))。
- 在 Mac 和 FreeBSD 上编译 SymbolIndex。(但它仅在 ELF 系统、Linux 和 FreeBSD 上运行)。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 将 Azure SDK 升级到 v1.15.0。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
- 将 google-cloud-cpp 的存储模块添加到构建系统。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881) ([Pablo Marcos](https://github.com/pamarcos))。
- 修改 clickhouse-server 的 `Dockerfile.ubuntu` 以符合 Docker 官方库的要求。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 针对 [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158) 的后续修复,解决上传构建到 `curl clickhouse.com` 的问题。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 在 `clickhouse/clickhouse-server` 和官方 `clickhouse` 镜像中添加 `busybox` 二进制文件和安装工具。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 添加了对 `CLICKHOUSE_HOST` 环境变量的支持,用于指定 ClickHouse 服务器主机,与现有的 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 环境变量保持一致。这使得无需直接修改客户端或配置文件即可更轻松地进行配置。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659) ([Doron David](https://github.com/dorki))。

### ClickHouse 版本 25.6,2025-06-26 {#256}

#### 向后不兼容的变更

- 以前,函数 `countMatches` 会在第一个空匹配处停止计数,即使模式接受它。为了解决这个问题,`countMatches` 现在在出现空匹配时通过前进一个字符来继续执行。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 次要变更:强制 `backup_threads` 和 `restore_threads` 服务器设置为非零值。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano))。
- 次要变更:修复 `bitNot` 对 `String` 的处理,将在内部内存表示中返回一个以零结尾的字符串。这不应影响任何用户可见的行为,但作者希望强调这一变更。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat))。


#### 新功能

* 新增数据类型：`Time` ([H]HH:MM:SS) 和 `Time64` ([H]HH:MM:SS[.fractional])，以及一些与其他数据类型交互的基础类型转换函数和函数。新增与现有函数 `toTime` 兼容的设置。当前通过设置 `use_legacy_to_time` 来保留旧行为。[#81217](https://github.com/ClickHouse/ClickHouse/pull/81217)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。支持 Time/Time64 之间的比较。[#80327](https://github.com/ClickHouse/ClickHouse/pull/80327)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 新的 CLI 工具 [`chdig`](https://github.com/azat/chdig/) —— 面向 ClickHouse 的 TUI 界面（类似 `top`），已作为 ClickHouse 的一部分提供。[#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* 为 `Atomic` 和 `Ordinary` 数据库引擎增加对 `disk` 设置的支持，用于指定存储表元数据文件的磁盘。[#80546](https://github.com/ClickHouse/ClickHouse/pull/80546)（[Tuan Pham Anh](https://github.com/tuanpach)）。这使得可以从外部数据源附加数据库。
* 一种新的 MergeTree 类型，`CoalescingMergeTree` —— 在后台合并期间，该引擎会选取第一个非 Null 的值。这一改动解决了 [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869)。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* 支持用于读取 WKB 的函数（“Well-Known Binary” 是一种在 GIS 应用中用于以二进制形式编码各类几何类型的格式）。参见 [#43941](https://github.com/ClickHouse/ClickHouse/issues/43941)。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* 为工作负载新增查询槽调度功能，详情参见[工作负载调度](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling)。[#78415](https://github.com/ClickHouse/ClickHouse/pull/78415) ([Sergei Trifonov](https://github.com/serxa))。
* `timeSeries*` 辅助函数，用于在处理时间序列数据时加速某些场景：- 将数据重新采样到具有指定起始时间戳、结束时间戳和步长的时间网格上 - 计算 PromQL 风格的 `delta`、`rate`、`idelta` 和 `irate`。 [#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger)).
* 添加 `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 函数用于按 map 的值进行过滤，并在基于 Bloom 过滤器的索引中支持这些函数。[#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus))。
* 现在，设置约束可以指定一组禁止的值。[#78499](https://github.com/ClickHouse/ClickHouse/pull/78499)（[Bharat Nallan](https://github.com/bharatnc)）。
* 新增了设置 `enable_shared_storage_snapshot_in_query`，用于在单个查询中让所有子查询共享同一个存储快照。这样可以确保即使在一个查询中多次引用同一张表时，也能从该表获得一致的读取结果。[#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* 支持将 `JSON` 列直接写入 `Parquet`，并直接从 `Parquet` 读取 `JSON` 列。[#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 为 `pointInPolygon` 添加 `MultiPolygon` 支持。[#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 通过 `deltaLakeLocal` 表函数新增对查询挂载在本地文件系统上的 Delta 表的支持。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* 新增设置 `cast_string_to_date_time_mode`，用于在从 `String` 转换为 `DateTime` 时选择解析模式。 [#80210](https://github.com/ClickHouse/ClickHouse/pull/80210) ([Pavel Kruglov](https://github.com/Avogar))。例如，你可以将其设置为“best effort”模式。
* 添加了用于处理 Bitcoin Bech 算法的 `bech32Encode` 和 `bech32Decode` 函数（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* 添加用于分析 MergeTree 分区名称的 SQL 函数。[#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 通过引入新的虚拟列 `_disk_name`，可以根据数据所在的磁盘过滤查询所选的分片。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 添加一个包含嵌入式 Web 工具列表的登录页。当由类浏览器用户代理请求时，将打开该页面。[#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 函数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` 和 `arrayLastIndex` 会过滤掉由过滤表达式返回的 NULL 值。在早期版本中，不支持 Nullable 类型的过滤结果。修复了 [#81113](https://github.com/ClickHouse/ClickHouse/issues/81113)。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* 现在可以使用 `USE DATABASE name` 代替 `USE name`。[#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新增了系统表 `system.codecs`，用于查看可用的编解码器。（问题 [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)）。[#81600](https://github.com/ClickHouse/ClickHouse/pull/81600)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 支持 `lag` 和 `lead` 窗口函数。修复 [#9887](https://github.com/ClickHouse/ClickHouse/issues/9887)。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 函数 `tokens` 现在支持一种名为 `split` 的新分词器，非常适合处理日志。[#80195](https://github.com/ClickHouse/ClickHouse/pull/80195)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 `clickhouse-local` 中新增对 `--database` 参数的支持。你可以切换到先前创建的数据库。该改动关闭了 [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115)。[#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 实验性功能
* 使用 ClickHouse Keeper 为 `Kafka2` 实现类似 Kafka rebalance 的逻辑。对于每个副本，我们支持两类分区锁：永久锁和临时锁。副本会尽可能长时间持有永久锁。在任意时刻，某个副本上的永久锁数量不会超过 `all_topic_partitions / active_replicas_count`（其中 `all_topic_partitions` 是所有分区的数量，`active_replicas_count` 是活跃副本的数量）；如果超过，该副本会释放部分分区。部分分区会被副本临时持有。副本上的临时锁最大数量会动态变化，以便给其他副本机会将部分分区获取为永久锁。在更新临时锁时，副本会释放其所有临时锁并尝试重新获取其他分区。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 对实验性的文本索引进行了改进：现在支持通过键值对传递显式参数。目前支持的参数包括一个必需的 `tokenizer`，以及两个可选参数 `max_rows_per_postings_list` 和 `ngram_size`。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 之前，`packed` 存储不支持全文索引，因为段 id 会通过在磁盘上读写 `.gin_sid` 文件以在线方式更新。在使用 `packed` 存储的情况下，不支持从未提交文件中读取值，这会导致问题。现在这一问题已经解决。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 类型为 `gin` 的实验性索引（我不喜欢这个名字，因为它是 PostgreSQL 黑客的一个内部玩笑）已被重命名为 `text`。现有的 `gin` 类型索引仍然可以加载，但在尝试用于搜索时会抛出异常（并建议改用 `text` 索引）。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。



#### 性能提升

* 启用多投影过滤支持，允许在分片级别过滤中使用多个投影。此更改解决了 [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525)。这是实现投影索引的第二步，继 [#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) 之后。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* 在文件系统缓存中默认使用 `SLRU` 缓存策略。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 消除查询管道中 Resize 步骤的争用。 [#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* 引入了一个选项，可以将数据块的（解）压缩和（反）序列化，从原先绑定到网络连接的单个线程卸载到流水线线程中。由设置 `enable_parallel_blocks_marshalling` 控制。这应该会加速在发起端和远程节点之间传输大量数据的分布式查询。[#78694](https://github.com/ClickHouse/ClickHouse/pull/78694)（[Nikita Taranov](https://github.com/nickitat)）。
* 对所有布隆过滤器类型进行了性能优化。[OpenHouse 大会视频](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800) ([Delyan Kratunov](https://github.com/dkratunov))。
* 在 `UniqExactSet::merge` 中新增了当其中一个集合为空时的优化执行路径。此外，现在如果左侧集合是两级而右侧是单级，我们将不会再将右侧集合转换为两级集合。[#79971](https://github.com/ClickHouse/ClickHouse/pull/79971)（[Nikita Taranov](https://github.com/nickitat)）。
* 在使用两级哈希表时提高内存复用效率并减少缺页中断，从而加速 `GROUP BY`。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* 在查询条件缓存中避免不必要的更新，并减少锁竞争。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* 对 `concatenateBlocks` 进行了轻量级优化，这些优化也很可能有利于并行哈希连接。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 在从主键范围中选择标记范围时，如果主键被函数包裹，则无法使用二分查找。此 PR 对这一限制进行了改进：当主键被一条始终单调的函数链包裹，或者 RPN 中包含一个始终为真的元素时，仍然可以使用二分查找。修复了 [#45536](https://github.com/ClickHouse/ClickHouse/issues/45536)。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* 提升 `Kafka` 引擎的关闭速度（在存在多个 `Kafka` 表时去除额外的 3 秒延迟）。[#80796](https://github.com/ClickHouse/ClickHouse/pull/80796)（[Azat Khuzhin](https://github.com/azat)）。
* 异步插入：降低内存使用并提升插入查询性能。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* 如果日志表被禁用，则不要对处理器进行分析。[#81256](https://github.com/ClickHouse/ClickHouse/pull/81256)（[Raúl Marín](https://github.com/Algunenano)）。这可以加速非常短的查询。
* 当源数据与请求的结果完全一致时，加速 `toFixedString`。[#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* 如果用户没有启用配额限制，则不再处理配额值。 [#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。这可以加速非常短的查询。
* 修复了内存追踪中的性能回归问题。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 改进分布式查询的分片键优化。[#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* 并行副本：如果所有读取任务都已分配给其他副本，则不再等待那些未被使用且较慢的副本。[#80199](https://github.com/ClickHouse/ClickHouse/pull/80199)（[Igor Nikonov](https://github.com/devcrafter)）。
* 并行副本使用独立的连接超时时间，请参见 `parallel_replicas_connect_timeout_ms` 设置。在此之前，并行副本查询使用 `connect_timeout_with_failover_ms`/`connect_timeout_with_failover_secure_ms` 作为连接超时（默认 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在带有 journal 的文件系统中，`mkdir` 会被写入文件系统的 journal，然后持久化到磁盘上。在磁盘较慢的情况下，这可能会耗费较长时间。将其移出预留锁的作用域。[#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 将 Iceberg manifest 文件的读取推迟到第一次执行读取查询时再进行。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 在适用的情况下，允许将 `GLOBAL [NOT] IN` 谓词移动到 `PREWHERE` 子句中。[#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa))。





#### 改进

* `EXPLAIN SYNTAX` 现在使用新的分析器。它返回从查询树构建的 AST。新增选项 `query_tree_passes`，用于控制在将查询树转换为 AST 之前执行的遍数。[#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在 Native 格式中为 Dynamic 和 JSON 实现扁平化序列化，从而在不使用诸如 Dynamic 的 shared variant 或 JSON 的 shared data 等特殊结构的情况下序列化/反序列化 Dynamic 和 JSON 数据。可以通过设置 `output_format_native_use_flattened_dynamic_and_json_serialization` 来启用这种序列化方式。该序列化方式可用于在不同语言实现的客户端中，更方便地在 TCP 协议中支持 Dynamic 和 JSON。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在出现 `AuthenticationRequired` 错误后刷新 `S3` 凭证。[#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `system.asynchronous_metrics` 中新增了字典相关的指标 - `DictionaryMaxUpdateDelay` - 字典更新的最大延迟（以秒为单位）。 - `DictionaryTotalFailedUpdates` - 自上次成功加载以来所有字典中的错误总次数。 [#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse)).
* 添加有关可能为保存损坏表而创建的数据库的警告。[#78841](https://github.com/ClickHouse/ClickHouse/pull/78841)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 在 `S3Queue` 和 `AzureQueue` 引擎中添加 `_time` 虚拟列。 [#78926](https://github.com/ClickHouse/ClickHouse/pull/78926) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 使控制在 CPU 过载时断开连接的相关设置支持热重载。[#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats))。
* 在 Azure Blob Storage 中的普通磁盘上，为 `system.tables` 中报告的数据路径添加容器前缀，使其与 S3 和 GCP 的报告方式保持一致。[#79241](https://github.com/ClickHouse/ClickHouse/pull/79241)（[Julia Kartseva](https://github.com/jkartseva)）。
* 现在，clickhouse-client 和 local 也支持以 `param-<name>`（短横线）以及 `param_<name>`（下划线）的形式传递查询参数。此更改解决了 [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093)。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* 在从本地向远程 S3 复制数据且启用校验和时，新增了关于带宽折扣的详细警告信息。[#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu))。
* 之前，当 `input_format_parquet_max_block_size = 0`（无效值）时，ClickHouse 会卡住。现在这一问题已修复，从而关闭了 [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394)。[#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* 为 `startup_scripts` 新增 `throw_on_error` 设置：当 `throw_on_error` 为 true 时，只有在所有查询都成功完成的情况下服务器才会启动。默认情况下，`throw_on_error` 为 false，从而保留之前的行为。[#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 允许在任意类型的 `http_handlers` 中添加 `http_response_headers`。[#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand))。
* 函数 `reverse` 现在支持 `Tuple` 数据类型。修复了 [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053)。 [#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* 解决 [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817)：允许从 `system.zookeeper` 表中获取 `auxiliary_zookeepers` 数据。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146)（[Nikolay Govorov](https://github.com/mrdimidium)）。
* 添加关于服务器 TCP 套接字的异步指标，以提升可观测性。修复 [#80187](https://github.com/ClickHouse/ClickHouse/issues/80187)。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 支持将 `anyLast_respect_nulls` 和 `any_respect_nulls` 作为 `SimpleAggregateFunction` 使用。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein))。
* 移除在复制数据库中对 `adjustCreateQueryForBackup` 的不必要调用。[#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar))。
* 在 `clickhouse-local` 中允许使用不带等号的额外选项（跟在 `--` 之后，如 `-- --config.value='abc'`）。修复 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292)。[#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `SHOW ... LIKE` 查询中高亮显示通配符元字符。此更改关闭了 [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275)。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-local` 中将 SQL UDF 持久化，之前创建的函数会在启动时自动加载。修复了 [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085)。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修正执行计划中关于预先 `DISTINCT` 步骤的描述。[#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus)).
* 允许在 ODBC/JDBC 中使用命名集合。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 用于统计只读和损坏磁盘数量的指标。在 `DiskLocalCheckThread` 启动时记录相应日志。[#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu))。
* 实现对带有投影的 `s3_plain_rewritable` 存储的支持。在之前的版本中，当对象被移动时，S3 中引用投影的元数据对象不会被更新。修复了 [#70258](https://github.com/ClickHouse/ClickHouse/issues/70258)。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` 命令将不会尝试在只读磁盘和写一次磁盘上查找数据分片。修复了 [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430)。[#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 降低了已合并分片相关消息的日志级别。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* 更改 Iceberg 表的分区剪枝默认行为。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* 为索引搜索算法的可观测性新增两个 ProfileEvents：`IndexBinarySearchAlgorithm` 和 `IndexGenericExclusionSearchAlgorithm`。[#80679](https://github.com/ClickHouse/ClickHouse/pull/80679) ([Pablo Marcos](https://github.com/pamarcos))。
* 在日志中不要抱怨旧内核不支持 `MADV_POPULATE_WRITE`（以避免日志污染）。[#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 `TTL` 表达式中新增了对 `Date32` 和 `DateTime64` 的支持。[#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand))。
* 调整 `max_merge_delayed_streams_for_parallel_write` 的兼容性设置取值。[#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat))。
* 修复一个崩溃问题：如果在析构函数中尝试删除临时文件（用于将临时数据溢写到磁盘）时抛出异常，程序可能会终止。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 为 `SYSTEM SYNC REPLICA` 添加 `IF EXISTS` 修饰符。[#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* 扩展关于 “Having zero bytes, but read range is not finished...” 的异常信息，并在 `system.filesystem_cache` 中新增 `finished_download_time` 列。[#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当使用索引且将 `EXPLAIN` 的 `indexes` 参数设为 1 时，在其输出中添加搜索算法部分。该部分会显示 &quot;binary search&quot; 或 &quot;generic exclusion search&quot; 之一。[#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos))。
* 在 2024 年初，由于新的 analyzer 默认未启用，`prefer_column_name_to_alias` 在 MySQL handler 中被硬编码为 true。现在，可以取消这一硬编码设置。[#80916](https://github.com/ClickHouse/ClickHouse/pull/80916) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 现在，`system.iceberg_history` 会显示 glue、iceberg rest 等目录（catalog）数据库的历史记录。同时，为保持一致性，将 `system.iceberg_history` 中的 `table_name` 和 `database_name` 列重命名为 `table` 和 `database`。 [#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin))。
* 允许 `merge` 表函数以只读模式运行，因此在使用它时不再需要 `CREATE TEMPORARY TABLE` 授权。[#80981](https://github.com/ClickHouse/ClickHouse/pull/80981)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 改进对内存缓存的自检能力（在 `system.metrics` 中公开缓存信息，以弥补此前 `system.asynchronouse_metrics` 中信息不完整的问题）。在 `dashboard.html` 中新增内存缓存大小（以字节为单位）。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` 已重命名为 `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes`。[#81023](https://github.com/ClickHouse/ClickHouse/pull/81023) ([Azat Khuzhin](https://github.com/azat))。
* 在从 `system.rocksdb` 读取时，忽略使用无法包含 `RocksDB` 表的引擎的数据库。[#81083](https://github.com/ClickHouse/ClickHouse/pull/81083)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 允许在 `clickhouse-local` 配置文件中配置 `filesystem_caches` 和 `named_collections`。[#81105](https://github.com/ClickHouse/ClickHouse/pull/81105)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 `INSERT` 查询中 `PARTITION BY` 的语法高亮。在早期版本中，`PARTITION BY` 不会被高亮为关键字。[#81106](https://github.com/ClickHouse/ClickHouse/pull/81106) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI 中的两个小改进：- 正确处理没有输出的查询，例如 `CREATE`、`INSERT`（直到最近，这类查询都会导致加载指示器无限旋转）；- 双击表时自动滚动到顶部。[#81131](https://github.com/ClickHouse/ClickHouse/pull/81131)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `MemoryResidentWithoutPageCache` 指标表示服务器进程使用的物理内存量（以字节为单位），不包括用户态页缓存（userspace page cache）。在启用用户态页缓存时，该指标能更准确地反映实际内存使用情况；在禁用用户态页缓存时，该值等于 `MemoryResident`。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* 在 client、本地 server、keeper client 和 disks 应用中，将手动记录的异常标记为“已记录”，以避免重复记录。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` 和 `use_skip_indexes_if_final_exact_mode` 的默认值现已改为 `True`。现在带有 `FINAL` 子句的查询会使用跳过索引（如果适用）来先筛选出候选 granule，并且还会读取与匹配主键范围对应的任何额外 granule。需要沿用先前近似/不精确结果行为的用户，可以在经过仔细评估后将 `use_skip_indexes_if_final_exact_mode` 设置为 FALSE。 [#81331](https://github.com/ClickHouse/ClickHouse/pull/81331) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 当 Web UI 中存在多个查询时，将会运行光标所在位置的那条查询。[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 的延续。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 此 PR 修复了在转换函数单调性检查中 `is_strict` 实现相关的问题。目前，一些转换函数（例如 `toFloat64(UInt32)` 和 `toDate(UInt8)`）在本应返回 `is_strict` 为 true 时却错误地返回为 false。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359)（[zoomxi](https://github.com/zoomxi)）。
* 在检查 `KeyCondition` 是否匹配连续范围时，如果键被非严格函数链包裹，则可能需要将 `Constraint::POINT` 转换为 `Constraint::RANGE`。例如：`toDate(event_time) = '2025-06-03'` 蕴含了 `event_time` 的一个范围：[&#39;2025-06-03 00:00:00&#39;, &#39;2025-06-04 00:00:00&#39;)。此 PR 修复了该行为。[#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* 如果指定了 `--host` 或 `--port`，`clickhouse`/`ch` 别名将调用 `clickhouse-client` 而不是 `clickhouse-local`。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) 的后续。修复了 [#65252](https://github.com/ClickHouse/ClickHouse/issues/65252)。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 现在我们已经获得了 keeper 响应时间分布数据，就可以为指标合理设置直方图分桶了。[#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新增 profile event `PageCacheReadBytes`。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复文件系统缓存中的逻辑错误：“Having zero bytes but range is not finished”。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复使用 `SELECT EXCEPT` 查询的参数化视图。解决 [#49447](https://github.com/ClickHouse/ClickHouse/issues/49447)。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer：修复 `join` 中列类型提升后列投影名称不正确的问题。关闭 [#63345](https://github.com/ClickHouse/ClickHouse/issues/63345)。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在启用 analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier 时，列名冲突场景下的逻辑错误。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在启用 `allow_push_predicate_ast_for_distributed_subqueries` 时，修复下推谓词中 CTE 的使用。修复了 [#75647](https://github.com/ClickHouse/ClickHouse/issues/75647)。修复了 [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672)。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了一个问题：当指定的副本不存在时，`SYSTEM SYNC REPLICA LIGHTWEIGHT 'foo'` 仍会报告成功。该命令现在会在尝试同步之前，先在 Keeper 中正确验证该副本是否存在。[#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd))。
* 修复了一个在非常特定场景下触发的崩溃问题：当在 `ON CLUSTER` 查询的 `CONSTRAINT` 部分中使用 `currentDatabase` 函数时会导致崩溃。修复关联 [#78100](https://github.com/ClickHouse/ClickHouse/issues/78100)。[#79070](https://github.com/ClickHouse/ClickHouse/pull/79070) ([pufit](https://github.com/pufit))。
* 修复在服务器间查询中传递外部角色（external roles）的问题。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* 请在 `SingleValueDataGeneric` 中使用 `IColumn` 替代 `Field`。这修复了某些聚合函数（例如对 `Dynamic/Variant/JSON` 类型的 `argMax`）返回值不正确的问题。[#79166](https://github.com/ClickHouse/ClickHouse/pull/79166) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了在 Azure Blob Storage 中应用 `use_native_copy` 和 `allow_azure_native_copy` 设置的问题，并更新为仅在凭据匹配时才使用原生复制，解决了 [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964)。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在检查某列是否为相关列时，由于该列来源范围未知而导致的逻辑错误。修复 [#78183](https://github.com/ClickHouse/ClickHouse/issues/78183)。修复 [#79451](https://github.com/ClickHouse/ClickHouse/issues/79451)。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在使用 `ColumnConst` 和 Analyzer 的 `GROUPING SETS` 查询中产生错误结果的问题。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* 修复在从分布式表读取、且本地副本为陈旧副本时，本地分片结果重复的问题。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 修复带负号位的 `NaN` 的排序顺序。[#79847](https://github.com/ClickHouse/ClickHouse/pull/79847)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 现在，`GROUP BY ALL` 不再考虑 `GROUPING` 部分。[#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 修复了 `TopK` / `TopKWeighted` 函数的错误状态合并问题，该问题会在容量尚未耗尽时仍导致过大的误差。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* 在 `azure_blob_storage` 对象存储中遵从 `readonly` 设置。[#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复了在使用带有反斜杠转义字符的 `match(column, '^…')` 时出现的查询结果不正确和内存不足崩溃问题。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* 为数据湖禁用 Hive 分区，部分解决了 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937)。[#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* 带有 lambda 表达式的 skip 索引无法被应用。已修复当索引定义中的高阶函数与查询中的完全相同时无法应用的问题。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复在副本上从复制日志执行 `ATTACH_PART` 命令附加数据分片时的元数据版本问题。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 与其他函数不同，可执行用户自定义函数（eUDF）的名称不会被添加到 `system.query_log` 表的 `used_functions` 列中。此 PR 实现在请求中使用 eUDF 时，将该 eUDF 的名称添加到该列中。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush))。
* 修复 Arrow 格式在使用 LowCardinality(FixedString) 时的逻辑错误。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复从 Merge 引擎读取子列时的问题。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了 `KeyCondition` 中数值类型比较相关的一个错误。[#80207](https://github.com/ClickHouse/ClickHouse/pull/80207)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复在对包含 projection 的表应用 lazy materialization 时出现的 AMBIGUOUS&#95;COLUMN&#95;NAME 问题。[#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在使用隐式投影时，对类似 LIKE &#39;ab&#95;c%&#39; 这种字符串前缀过滤条件的 `count` 统计错误优化问题。该修复对应 [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250)。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* 修复 MongoDB 文档中嵌套数值字段被错误序列化为字符串的问题。移除对来自 MongoDB 文档的最大深度限制。[#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz))。
* 在 `Replicated` 数据库中对 RMT 放宽元数据检查的严格程度。修复了 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296)。[#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修正 PostgreSQL 存储中 `DateTime` 和 `DateTime64` 的文本表示。[#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 在 `StripeLog` 表中允许使用带时区的 `DateTime`。修复了 [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120)。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在查询计划步骤会改变行数的情况下，禁用针对包含非确定性函数的谓词的过滤下推。修复 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273)。[#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在包含子列的 projection 中可能出现的逻辑错误和崩溃。[#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 `ON` 表达式不是简单等式时，由逻辑 JOIN 分隔中的 filter-push-down 优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复了 [#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) 和 [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848)。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在分区表中读取反向顺序键时可能产生错误结果的问题。该修复解决了 [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987)。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* 修复了在主键可为空且启用了 `optimize_read_in_order` 时表中的错误排序问题。[#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复了在使用 SYSTEM STOP REPLICATED VIEW 暂停视图后，刷新型物化视图的 DROP 操作会卡死的问题。[#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在分布式查询中使用常量元组时出现的 &#39;Cannot find column&#39; 错误。[#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 修复在启用 `join_use_nulls` 时 Distributed 表中 `shardNum` 函数的问题。[#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复在 Merge 引擎中读取仅存在于部分表中的列时产生错误结果的问题。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复可能的 SSH 协议问题（由于 `replxx` 中的卡死）。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` 表中的时间戳现在应该已经是正确的。[#80711](https://github.com/ClickHouse/ClickHouse/pull/80711)（[Melvyn Peignon](https://github.com/melvynator)）。
* 修复在字典注册失败时可能发生的崩溃问题（当 `CREATE DICTIONARY` 因 `CANNOT_SCHEDULE_TASK` 失败时，字典注册表中可能会留下悬空指针，进而在之后导致崩溃）。[#80714](https://github.com/ClickHouse/ClickHouse/pull/80714)（[Azat Khuzhin](https://github.com/azat)）。
* 修复对象存储表函数中仅包含单个元素的枚举模式（glob）处理方式。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `Tuple(Dynamic)` 与 `String` 比较函数的错误结果类型问题，该问题会导致逻辑错误。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* 为 Unity Catalog 补充缺失的受支持数据类型 `timestamp_ntz`。修复 [#79535](https://github.com/ClickHouse/ClickHouse/issues/79535)、[#79875](https://github.com/ClickHouse/ClickHouse/issues/79875)。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* 修复在使用 `IN cte` 的分布式查询中出现的 `THERE_IS_NO_COLUMN` 错误。关联修复 [#75032](https://github.com/ClickHouse/ClickHouse/issues/75032)。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复外部 `ORDER BY` 产生过多文件（导致内存占用过高）的问题。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* 此 PR 可能会关闭 [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742)。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* 修复 Kafka 中的崩溃问题，原因是 get&#95;member&#95;id() 从 NULL 创建了 std::string（这很可能只会在连接 broker 失败的情况下出现）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* 在关闭 Kafka 引擎之前正确等待消费者结束（关闭后仍然处于活动状态的消费者可能会触发各种调试断言，并且在表被删除/分离后仍可能在后台从 broker 读取数据）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat))。
* 修复由 `predicate-push-down` 优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复了 [#80443](https://github.com/ClickHouse/ClickHouse/issues/80443)。[#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在使用 `USING` 的 `JOIN` 中解析表函数中的星号（*）通配符时的逻辑错误。[#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复 Iceberg 元数据文件缓存的内存记账。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* 修复使用可为空分区键时的错误分区方式。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在使用谓词下推（`allow_push_predicate_ast_for_distributed_subqueries=1`）的分布式查询中，当源表在发起端不存在时出现的 `Table does not exist` 错误。修复了 [#77281](https://github.com/ClickHouse/ClickHouse/issues/77281)。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复带命名窗口的嵌套函数中的逻辑错误。[#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复 `Nullable` 和浮点类型列的 `extremes`。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复从 system.tables 查询时可能出现的崩溃问题（在内存压力下更容易发生）。 [#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat)).
* 修复对其压缩格式由文件扩展名推断的文件执行 `truncate` 操作时的原子重命名问题。[#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复 ErrorCodes::getName。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复了一个错误：当用户没有所有表的访问权限时，无法在 Unity Catalog 中列出这些表。现在所有表都能被正确列出，尝试从受限表中读取时会抛出异常。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin)).
* 现在，ClickHouse 在执行 `SHOW TABLES` 查询时会忽略来自数据湖目录的错误和意外响应。修复了 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725)。[#81046](https://github.com/ClickHouse/ClickHouse/pull/81046) ([alesapin](https://github.com/alesapin))。
* 修复在 `JSONExtract` 和 `JSON` 类型解析中，将整数值解析为 `DateTime64` 时的错误。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar))。
* 在架构推断缓存中体现 `date_time_input_format` 设置。[#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了在执行 `INSERT` 时，如果在查询开始之后但在发送列之前表被 `DROP` 而导致的崩溃问题。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `quantileDeterministic` 中未初始化值使用（`use-of-uninitialized-value`）的问题。[#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `metadatastoragefromdisk` 磁盘事务的硬链接计数管理逻辑，并添加测试。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* 与其他函数不同，用户自定义函数（UDF）的名称不会被添加到 `system.query_log` 表中。此 PR 在请求中使用了 UDF 时，会将其名称添加到 `used_executable_user_defined_functions` 或 `used_sql_user_defined_functions` 这两个列之一中。[#81101](https://github.com/ClickHouse/ClickHouse/pull/81101)（[Kyamran](https://github.com/nibblerenush)）。
* 修复了在通过 HTTP 协议使用文本格式（`JSON`、`Values` 等）插入数据且省略 `Enum` 字段时，可能出现的 `Too large size ... passed to allocator` 错误或崩溃问题。[#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在包含稀疏列的 INSERT 块被推送到非 MT 物化视图时出现的 `LOGICAL_ERROR`。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用交叉复制且 `distributed_product_mode_local=local` 时出现的 `Unknown table expression identifier` 错误。[#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复了在过滤后错误缓存 Parquet 文件行数的问题。[#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复在使用相对缓存路径时 `fs cache max_size_to_total_space` 设置的行为。 [#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了在以 Parquet 格式输出常量 `Tuple` 或 `Map` 时导致 `clickhouse-local` 崩溃的问题。[#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321))。
* 校验通过网络接收的数组偏移量。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在查询中连接空表且使用窗口函数时的一些极端情况。该 bug 会导致并行数据流数量呈爆炸式增长，从而引发 OOM。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* 针对数据湖 Cluster 函数（`deltaLakeCluster`、`icebergCluster` 等）的修复：(1) 在旧分析器搭配 `Cluster` 函数使用时，修复 `DataLakeConfiguration` 中潜在的段错误；(2) 移除重复的数据湖元数据更新操作（多余的对象存储请求）；(3) 修复在未显式指定格式时，对象存储中多余的列举操作（此前已对非 cluster 数据湖引擎完成该修复）。[#81300](https://github.com/ClickHouse/ClickHouse/pull/81300)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 使 `force_restore_data` 标志能够恢复丢失的 Keeper 元数据。[#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `delta-kernel` 中的 region 错误。解决了 [#79914](https://github.com/ClickHouse/ClickHouse/issues/79914)。[#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 为 `divideOrNull` 禁用不正确的 JIT。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 MergeTree 表中分区列名过长时出现的插入错误。[#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* 已在 [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) 中回溯移植：修复了在合并过程中抛出异常时 `Aggregator` 可能发生的崩溃问题。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 不要在内存中存储多个 manifest 文件的内容。[#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik))。
* 修复在关闭后台线程池（`background_.*pool_size`）时可能出现的崩溃。 [#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在向使用 `URL` 引擎的表写入时，`Npy` 格式中出现的越界读取问题。修复了 [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356)。[#81502](https://github.com/ClickHouse/ClickHouse/pull/81502)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中有可能会显示 `NaN%`（典型的 JavaScript 问题）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在 `database_replicated_enforce_synchronous_settings=1` 时的 `DatabaseReplicated`。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* 修正 `LowCardinality(Nullable(...))` 类型的排序顺序。[#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 如果尚未从套接字中完整读取请求，服务器不应保留 HTTP 连接。[#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema))。
* 使标量关联子查询返回其投影表达式的可空结果。修复关联子查询产生空结果集时的处理。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* 修复在对 `ReplicatedMergeTree` 执行 `ATTACH` 时出现的 `Unexpected relative path for a deduplicated part` 错误。[#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat))。
* 查询设置 `use_iceberg_partition_pruning` 对 Iceberg 存储不会生效，因为它使用的是全局上下文而不是查询上下文。这不是严重问题，因为它的默认值为 true。此 PR 修复了该问题。[#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991))。
* 已在 [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) 中回溯移植：修复在合并期间在 TTL 表达式中使用字典时出现的 “Context has expired” 错误。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* 为 mergetree 设置 `merge_max_block_size` 添加校验，确保其不为零。[#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复了在 `clickhouse-local` 中导致 `DROP VIEW` 查询卡住的问题。[#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复 `StorageRedis` 在某些场景下的 `join` 行为。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在启用旧分析器且使用空 `USING ()` 时导致 `ConcurrentHashJoin` 崩溃的问题。[#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat))。
* Keeper 修复：当日志中存在无效条目时，阻止提交新的日志。此前，如果 leader 错误地应用了一些日志，即便 follower 会检测到摘要不匹配并中止操作，它仍会继续提交新的日志。[#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复在处理标量相关子查询时未读取必需列的问题。修复 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 有人在我们的代码里到处乱塞 `Kusto`。已经清理干净。由此关闭 [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643)。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在此前版本中，服务器对 `/js` 请求返回的内容过多。此更改修复了 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 之前，`MongoDB` 表引擎的定义中可以在 `host:port` 参数后附带路径部分，但这部分会被静默忽略。mongodb 集成会拒绝加载此类表。通过此修复，*如果 `MongoDB` 引擎有五个参数，我们允许加载此类表并忽略路径部分*，而是使用参数中指定的数据库名。*注意：* 此修复不适用于新创建的表、使用 `mongo` 表函数的查询，以及字典源和命名集合。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复了在合并过程中发生异常时 `Aggregator` 可能崩溃的问题。[#82022](https://github.com/ClickHouse/ClickHouse/pull/82022)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复 `arraySimilarity` 中的拷贝粘贴错误，禁止使用 `UInt32` 和 `Int32` 作为权重。更新测试和文档。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 修复建议线程与主客户端线程之间可能存在的数据竞争问题。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### 构建/测试/打包改进

* 使用 `postgres` 16.9。[#81437](https://github.com/ClickHouse/ClickHouse/pull/81437)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 使用 `openssl` 3.2.4。[#81438](https://github.com/ClickHouse/ClickHouse/pull/81438)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 使用 `abseil-cpp` 2025-01-27 版本。[#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `mongo-c-driver` 1.30.4。 [#81449](https://github.com/ClickHouse/ClickHouse/pull/81449)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 使用 `krb5` 1.21.3-final。 [#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `orc` 2.1.2。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `grpc` 1.73.0。 [#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `delta-kernel-rs` v0.12.1。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 `c-ares` 更新为 `v1.34.5`。 [#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 将 `curl` 升级到 8.14 以解决 CVE-2025-5025 和 CVE-2025-4947。[#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit))。
* 将 `libarchive` 升级到 3.7.9，以修复以下问题：CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。[#81174](https://github.com/ClickHouse/ClickHouse/pull/81174)（[larryluogit](https://github.com/larryluogit)）。
* 将 `libxml2` 升级到 2.14.3。[#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit))。
* 避免将 vendored 的 Rust 源码复制到 `CARGO_HOME` 中。[#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 通过将 Sentry 库替换为我们自己的端点，移除对该库的依赖。[#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 CI 镜像中更新 Python 依赖项，以处理 Dependabot 告警。[#80658](https://github.com/ClickHouse/ClickHouse/pull/80658)（[Raúl Marín](https://github.com/Algunenano)）。
* 在启动时从 Keeper 重试读取复制 DDL 的停止标志，以在为 Keeper 启用故障注入时提升测试的健壮性。[#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger))。
* 对 Ubuntu 存档 URL 使用 https。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* 更新测试镜像中的 Python 依赖项。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot)).
* 为 Nix 构建引入 `flake.nix`。[#81463](https://github.com/ClickHouse/ClickHouse/pull/81463)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `delta-kernel-rs` 在构建过程中需要访问网络的问题。关闭 [#80609](https://github.com/ClickHouse/ClickHouse/issues/80609)。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。阅读文章 [《ClickHouse 的 Rust 之年》](https://clickhouse.com/blog/rust)。

### ClickHouse 版本 25.5，2025-05-22 {#255}

#### 向后不兼容的变更

- 函数 `geoToH3` 现在按照 (lat, lon, res) 的顺序接受输入（与其他几何函数保持一致）。如需保留之前的结果顺序 (lon, lat, res)，用户可以设置 `geotoh3_argument_order = 'lon_lat'`。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008))。
- 新增文件系统缓存设置 `allow_dynamic_cache_resize`，默认值为 `false`，用于允许动态调整文件系统缓存大小。原因：在某些环境中（ClickHouse Cloud），所有扩缩容事件都通过进程重启来实现，我们希望明确禁用此功能以更好地控制行为并作为安全措施。此 PR 标记为向后不兼容，因为在旧版本中，动态缓存调整默认启用且无需特殊设置。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii))。
- 移除了对旧版索引类型 `annoy` 和 `usearch` 的支持。这两者长期以来一直是存根，即任何使用这些旧版索引的尝试都会返回错误。如果您仍有 `annoy` 和 `usearch` 索引，请删除它们。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze))。
- 移除 `format_alter_commands_with_parentheses` 服务器设置。该设置在 24.2 版本中引入并默认禁用，在 25.2 版本中默认启用。由于没有不支持新格式的 LTS 版本，我们可以移除该设置。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 默认启用 `DeltaLake` 存储的 `delta-kernel-rs` 实现。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii))。
- 如果从 `URL` 读取涉及多次重定向，设置 `enable_url_encoding` 将正确应用于链中的所有重定向。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer))。设置 `enble_url_encoding` 的默认值现在设为 `false`。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer))。


#### 新功能

* 在 `WHERE` 子句中支持标量相关子查询，关闭 [#6697](https://github.com/ClickHouse/ClickHouse/issues/6697)。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。在简单场景下支持在投影列表中使用相关子查询。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。现在已覆盖 TPC-H 测试套件的 100%。
* 基于向量相似度索引的向量搜索现已进入 beta 阶段（此前为实验性功能）。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 `Parquet` 格式中支持地理类型。此更改解决了 [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317)。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* 新增函数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8`，用于计算“sparse-ngrams”——一种稳健的子串提取算法，可用于索引和搜索。[#79517](https://github.com/ClickHouse/ClickHouse/pull/79517)（[scanhex12](https://github.com/scanhex12)）。
* `clickhouse-local`（及其简写别名 `ch`）现在在存在要处理的输入数据时，会隐式添加 `FROM table`。这解决了 [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023)。同时在 clickhouse-local 中启用了格式自动推断：如果未指定 `--input-format` 且处理的是常规文件，则会自动推断输入格式。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加 `stringBytesUniq` 和 `stringBytesEntropy` 函数，用于搜索可能为随机或加密的数据。[#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* 新增了用于 Base32 编码和解码的函数。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x)).
* 添加 `getServerSetting` 和 `getMergeTreeSetting` 函数。修复 #78318。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439) ([NamNguyenHoai](https://github.com/NamHoaiNguyen)).
* 新增 `iceberg_enable_version_hint` 设置，以利用 `version-hint.text` 文件。[#78594](https://github.com/ClickHouse/ClickHouse/pull/78594)（[Arnaud Briche](https://github.com/arnaudbriche)）。
* 可以根据 `LIKE` 关键字过滤，截断数据库中的特定表。[#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 在 `MergeTree` 系列表中支持 `_part_starting_offset` 虚拟列。该列表示所有前序 part 的累计行数，并在查询时基于当前 part 列表计算。累计值在整个查询执行期间都会保留，即使在进行 part 剪枝后仍然有效。相关内部逻辑已重构以支持这一行为。[#79417](https://github.com/ClickHouse/ClickHouse/pull/79417)（[Amos Bird](https://github.com/amosbird)）。
* 新增函数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull`，在右侧参数为零时返回 NULL。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse 向量搜索现在同时支持预过滤和后过滤，并提供相关设置以实现更精细的控制（issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)）。[#79854](https://github.com/ClickHouse/ClickHouse/pull/79854)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 添加 [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 和 [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 函数。支持对使用 [`bucket transform`](https://iceberg.apache.org/spec/#partitioning) 分区的 `Iceberg` 表进行数据文件剪枝。 [#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。



#### 实验特性
* 新增 `Time`/`Time64` 数据类型：`Time` (HHH:MM:SS) 和 `Time64` (HHH:MM:SS.`&lt;fractional&gt;`)，以及一些基础的转换函数和与其他数据类型交互的函数。同时，将已有函数名 `toTime` 更名为 `toTimeWithFixedDate`，因为 `toTime` 这个函数名需要保留给转换函数使用。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 为 Iceberg 数据湖提供 Hive metastore 目录。[#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* 将类型为 `full_text` 的索引重命名为 `gin`。这与 PostgreSQL 和其他数据库中更常见的术语保持一致。现有 `full_text` 类型的索引仍然可以加载，但在尝试在搜索中使用它们时会抛出异常（并建议改用 `gin` 索引）。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### 性能提升

* 将 Compact 部件格式修改为为每个子流保存标记，以便能够读取单独的子列。旧的 Compact 格式在读取时仍受支持，并且可以通过 MergeTree 设置 `write_marks_for_substreams_in_compact_parts` 在写入时启用。由于这会改变 Compact 部件的存储方式，为了更安全地进行升级，该设置默认禁用。它将在后续的某个版本中默认启用。[#77940](https://github.com/ClickHouse/ClickHouse/pull/77940)（[Pavel Kruglov](https://github.com/Avogar)）。
* 允许将包含子列的条件下推到 `prewhere`。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 通过在多个 granule 上一次性计算表达式来加速二级索引。[#64109](https://github.com/ClickHouse/ClickHouse/pull/64109)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 默认启用 `compile_expressions`（针对普通表达式片段的 JIT 编译器）。这修复了 [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386) 和 [#66486](https://github.com/ClickHouse/ClickHouse/issues/66486)。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增设置：`use_skip_indexes_in_final_exact_mode`。如果对 `ReplacingMergeTree` 表的查询使用了 FINAL 子句，仅根据跳过索引读取表范围可能会产生不正确的结果。此设置可以通过扫描与跳过索引返回的主键范围存在重叠的较新分片，来确保返回正确结果。设置为 0 表示禁用，1 表示启用。[#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 对象存储集群表函数（例如 `s3Cluster`）现在会基于一致性哈希将要读取的文件分配给各个副本，从而提升缓存局部性。 [#77326](https://github.com/ClickHouse/ClickHouse/pull/77326) ([Andrej Hoos](https://github.com/adikus))。
* 通过允许并行执行 `INSERT` 提高 `S3Queue`/`AzureQueue` 的性能（可通过队列设置 `parallel_inserts=true` 启用）。此前，S3Queue/AzureQueue 只能将流水线的第一部分（下载、解析）并行化，`INSERT` 是单线程执行的，而 `INSERT` 几乎总是瓶颈。现在性能将几乎可以随着 `processing_threads_num` 线性扩展。[#77671](https://github.com/ClickHouse/ClickHouse/pull/77671)（[Azat Khuzhin](https://github.com/azat)）。在 S3Queue/AzureQueue 中对 max&#95;processed&#95;files&#95;before&#95;commit 的限制也变得更加公平。[#79363](https://github.com/ClickHouse/ClickHouse/pull/79363)（[Azat Khuzhin](https://github.com/azat)）。
* 引入了一个阈值（通过设置 `parallel_hash_join_threshold` 配置），当右表大小低于该阈值时，会回退为使用 `hash` 算法。[#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat))。
* 现在，在启用并行副本读取时，我们使用副本数量来确定读取任务的大小。这样可以在待读取数据量不太大时，在副本之间实现更均衡的工作负载分配。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695)（[Nikita Taranov](https://github.com/nickitat)）。
* 允许在分布式聚合的最终阶段对 `uniqExact` 状态进行并行合并。[#78703](https://github.com/ClickHouse/ClickHouse/pull/78703)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复在按 key 聚合时并行合并 `uniqExact` 状态可能导致的性能下降问题。[#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* 减少对 Azure 存储的 List Blobs API 调用次数。[#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复使用并行副本的分布式 `INSERT SELECT` 的性能。[#79441](https://github.com/ClickHouse/ClickHouse/pull/79441)（[Azat Khuzhin](https://github.com/azat)）。
* 避免 `LogSeriesLimiter` 在每次构造时都执行清理操作，从而防止在高并发场景下出现锁竞争和性能回退。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 通过简单计数优化加速查询。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* 为 `Decimal` 类型的部分操作提供了更佳的内联优化。[#79999](https://github.com/ClickHouse/ClickHouse/pull/79999)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 默认将 `input_format_parquet_bloom_filter_push_down` 设置为 true。同时，修正设置变更历史中的一个错误。[#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 针对需要删除全部行的数据部分，对 `ALTER ... DELETE` 变更操作进行了优化。现在，在此类场景下，将创建一个空的数据部分来替代原始部分，而无需实际执行变更操作。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 在可能的情况下，避免在插入到 Compact 部分时对该块进行额外拷贝。[#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar))。
* 新增设置 `input_format_max_block_size_bytes`，用于按字节限制在输入格式中创建的数据块大小。这有助于在导入包含大尺寸值的行时避免过高的内存占用。[#79495](https://github.com/ClickHouse/ClickHouse/pull/79495)（[Pavel Kruglov](https://github.com/Avogar)）。
* 移除线程和 async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests 的保护页。将 `FiberStack` 中的内存分配方式从 `mmap` 更改为 `aligned_alloc`。由于这会拆分 VMA，在高负载下可能会触及 vm.max&#95;map&#95;count 的上限。[#79147](https://github.com/ClickHouse/ClickHouse/pull/79147)（[Sema Checherinda](https://github.com/CheSema)）。
* 使用并行副本的惰性物化。[#79401](https://github.com/ClickHouse/ClickHouse/pull/79401)（[Igor Nikonov](https://github.com/devcrafter)）。





#### 改进

* 新增支持实时应用轻量级删除（通过设置 `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` 实现）。[#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ)).
* 如果在终端中以 `Pretty` 格式显示数据，且后续数据块具有相同的列宽，则可以通过上移光标，从上一个数据块继续输出，将其与前一个数据块拼接。这解决了 [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333)。该功能由新设置 `output_format_pretty_glue_chunks` 控制。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `isIPAddressInRange` 函数扩展为支持 `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)` 和 `Nullable(IPv6)` 数据类型。[#78364](https://github.com/ClickHouse/ClickHouse/pull/78364)（[YjyJeff](https://github.com/YjyJeff)）。
* 允许动态更改 `PostgreSQL` 引擎的连接池设置。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 允许在普通 projection 中指定 `_part_offset`。这是构建 projection 索引的第一步。它可以与 [#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) 配合使用，并有助于改进 #63207。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429)（[Amos Bird](https://github.com/amosbird)）。
* 为 `system.named_collections` 添加新列（`create_query` 和 `source`）。修复 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179)。[#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 在系统表 `system.query_condition_cache` 中新增了字段 `condition`。该字段存储用其哈希值作为查询条件缓存键的明文条件。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* 现在可以在 `BFloat16` 列上创建向量相似度索引。[#78850](https://github.com/ClickHouse/ClickHouse/pull/78850)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在“尽力而为”模式的 `DateTime64` 解析中支持带小数部分的 Unix 时间戳。[#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 `DeltaLake` 存储的 delta-kernel 实现中，修复了列映射模式的问题，并为模式演进添加了测试。[#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 通过改进数值转换方式，优化以 Values 格式向 `Variant` 列插入数据。[#78923](https://github.com/ClickHouse/ClickHouse/pull/78923)（[Pavel Kruglov](https://github.com/Avogar)）。
* `tokens` 函数已扩展为接受一个额外的 “tokenizer” 参数，以及更多 tokenizer 专用参数。[#79001](https://github.com/ClickHouse/ClickHouse/pull/79001)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 现在，`SHOW CLUSTER` 语句会对其参数中的宏（如果有）进行展开。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42)).
* 哈希函数现在支持数组、元组和 map 中的 `NULL` 值。（问题 [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) 和 [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* 将 cctz 更新至 2025a。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano)).
* 将 UDF 的默认 stderr 处理方式更改为 &quot;log&#95;last&quot;，这在可用性方面更好。[#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 使 Web UI 中的标签页支持撤销操作。修复了 [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284)。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在执行 `recoverLostReplica` 时移除设置，其方式与以下变更中所做的相同：[https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 添加 profile 事件：`ParquetReadRowGroups` 和 `ParquetPrunedRowGroups`，用于对 Parquet 索引裁剪进行性能分析。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* 在集群上支持对数据库执行 `ALTER` 操作。[#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 显式跳过 `QueryMetricLog` 统计信息收集过程中错过的轮次，否则日志需要很长时间才能追上当前时间。[#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 对基于 `Arrow` 的格式读取进行了少量优化。 [#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc)).
* 设置 `allow_archive_path_syntax` 被误标为实验性。新增测试以防止实验性设置在默认情况下被启用。[#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 将页面缓存设置改为可在每个查询层面进行调整。这有助于更快速地进行实验，并可以对高吞吐量和低延迟查询进行精细调优。[#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 对于看起来像典型 64 位哈希值的数字，不要以美观格式打印数字提示。此更改关闭了 [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334)。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高级仪表板上图表的颜色将根据对应查询的哈希值计算生成。这样可以在滚动浏览仪表板时，更容易记住并定位某个图表。[#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 添加异步指标 `FilesystemCacheCapacity` —— `cache` 虚拟文件系统的总容量。此指标对全局基础设施监控非常有用。[#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 优化对 `system.parts` 的访问（仅在需要时读取列/索引大小）。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* 对 `'SHOW CLUSTER <name>'` 查询仅计算相关字段，而非所有字段。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 允许为 `DatabaseCatalog` 指定存储设置。[#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在 `DeltaLake` 中添加对本地存储的支持。[#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加一个查询级设置以启用 delta-kernel-rs：`allow_experimental_delta_kernel_rs`。[#79418](https://github.com/ClickHouse/ClickHouse/pull/79418)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复从 Azure/S3 Blob 存储列出 Blob 时可能出现的死循环问题。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* 新增文件系统缓存配置项 `max_size_ratio_to_total_space`。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 对于 `clickhouse-benchmark`，重新配置 `reconnect` 选项，使其支持将 0、1 或 N 作为取值，并据此执行重连。[#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* 允许对位于不同 `plain_rewritable` 磁盘上的表执行 `ALTER TABLE ... MOVE|REPLACE PARTITION`。[#79566](https://github.com/ClickHouse/ClickHouse/pull/79566)（[Julia Kartseva](https://github.com/jkartseva)）。
* 如果参考向量的类型为 `Array(BFloat16)`，现在也会使用向量相似性索引。[#79745](https://github.com/ClickHouse/ClickHouse/pull/79745)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 将 last&#95;error&#95;message、last&#95;error&#95;trace 和 query&#95;id 添加到 system.error&#95;log 表。相关工单 [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* 默认启用崩溃报告发送功能。可以在服务器的配置文件中将其关闭。 [#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 系统表 `system.functions` 现在会显示各个函数首次在 ClickHouse 中引入的版本。[#79839](https://github.com/ClickHouse/ClickHouse/pull/79839)（[Robert Schulze](https://github.com/rschu1ze)）。
* 新增 `access_control_improvements.enable_user_name_access_type` 设置。该设置用于启用或禁用在 [https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) 中引入的按用户/角色的精确授权功能。如果你的集群中存在版本低于 25.1 的副本，建议关闭此设置。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* 现在对 `ASTSelectWithUnionQuery::clone()` 方法的正确实现也会考虑 `is_normalized` 字段。这可能有助于解决 [#77569](https://github.com/ClickHouse/ClickHouse/issues/77569)。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复某些使用 EXCEPT 运算符的查询在格式化时不一致的问题。如果 EXCEPT 运算符左侧以 `*` 结尾，格式化后的查询会丢失括号，随后会被解析为带有 `EXCEPT` 修饰符的 `*`。这些查询是由 fuzzer 发现的，在实际使用中不太可能遇到。此更改关闭了 [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950)。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过对变体反序列化顺序使用缓存，略微提升了 `JSON` 类型的解析性能。[#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 添加了设置项 `s3_slow_all_threads_after_network_error`。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar))。
* 与所选要合并的数据片相关的日志级别设置错误（Information）。修复了 [#80061](https://github.com/ClickHouse/ClickHouse/issues/80061)。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer：在工具提示和状态消息中添加运行时/占比信息。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa))。
* trace-visualizer：从 ClickHouse 服务器加载数据。[#79042](https://github.com/ClickHouse/ClickHouse/pull/79042)（[Sergei Trifonov](https://github.com/serxa)）。
* 为失败的合并添加了相关指标。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 如果指定了最大迭代次数，`clickhouse-benchmark` 将基于该最大迭代次数显示百分比。[#79346](https://github.com/ClickHouse/ClickHouse/pull/79346)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加 `system.parts` 表可视化工具。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* 新增查询延迟分析工具。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa))。





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复分片中缺失列的重命名问题。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* `MATERIALIZED VIEW` 可能会启动得太晚，例如在为其提供数据流的 Kafka 表启动之后才开始运行。[#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复在启用 analyzer 时创建 `VIEW` 过程中对 `SELECT` 查询的重写问题。修复了 [#75956](https://github.com/ClickHouse/ClickHouse/issues/75956)。[#76356](https://github.com/ClickHouse/ClickHouse/pull/76356)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了通过 `apply_settings_from_server` 从服务器应用 `async_insert` 时的行为（此前会在客户端导致 `Unknown packet 11 from server` 错误）。[#77578](https://github.com/ClickHouse/ClickHouse/pull/77578)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在 Replicated 数据库中新添加副本上无法正常工作的可刷新的物化视图。[#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了可刷新物化视图导致备份损坏的问题。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `transform` 的旧触发逻辑错误。[#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了在使用 analyzer 时未正确应用二级索引的若干情况。修复了 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) 和 [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373)。[#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在启用压缩的 HTTP 协议下导出性能分析事件（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）的问题（误差不应超过缓冲区大小，通常约为 1MiB）。 [#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `JOIN ... USING` 涉及 `ALIAS` 列时分析器抛出 `LOGICAL_ERROR` 的问题——此时应抛出更合适的错误。[#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复分析器：当 `SELECT` 包含位置参数时，`CREATE VIEW ... ON CLUSTER` 会失败。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Okhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在对具有模式推断的表函数执行 `INSERT SELECT` 且 `SELECT` 中包含标量子查询时出现的 `Block structure mismatch` 错误。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复 analyzer：当对 Distributed 表设置 prefer&#95;global&#95;in&#95;and&#95;join=1 时，在包含 `in` 函数的 SELECT 查询中应将其替换为 `globalIn`。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复了若干类型的 `SELECT` 查询，这些查询从使用 `MongoDB` 引擎的表或 `mongodb` 表函数中读取数据：在 `WHERE` 子句中对常量值进行隐式转换的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`），以及带有 `LIMIT` 和 `GROUP BY` 的查询。此前，这些查询可能会返回错误的结果。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复不同 JSON 类型之间的转换。现在通过先转换为/从 `String` 的简单 `CAST` 来完成。这样效率较低，但可以保证 100% 的准确性。[#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复将 `Dynamic` 类型转换为 `Interval` 类型时的逻辑错误。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在解析 JSON 出错时对列的回滚行为。[#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用常量别名列进行 `JOIN` 时出现的 “bad cast” 错误。[#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 禁止在物化视图中对在视图和目标表中类型不一致的列使用 `prewhere`。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在解析 `Variant` 列异常二进制数据时的逻辑错误。[#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* 当将 Parquet 批大小设置为 0 时抛出异常。此前当 `output_format_parquet_batch_size = 0` 时，ClickHouse 会发生挂起。现在这一行为已被修复。[#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* 修复紧凑分片中使用 basic 格式的 variant 判别器的反序列化问题。该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) 中引入的。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* 现在，类型为 `complex_key_ssd_cache` 的字典会拒绝 `block_size` 和 `write_buffer_size` 为零或负数的参数（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 避免在 SummingMergeTree 中将 `Field` 用于非聚合列。这可能会在 SummingMergeTree 中使用 `Dynamic`/`Variant` 类型时导致意外错误。[#79051](https://github.com/ClickHouse/ClickHouse/pull/79051)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 analyzer 中从目标表为 Distributed 且表头不同的物化视图读取数据的问题。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个错误：在对表执行批量插入时，`arrayUnion()` 会返回多余的（不正确的）值。修复了 [#75057](https://github.com/ClickHouse/ClickHouse/issues/75057)。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* 修复 `OpenSSLInitializer` 中的段错误。修复于 [#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)，关联问题 [#79092](https://github.com/ClickHouse/ClickHouse/issues/79092)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 始终为 S3 的 ListObject 操作设置前缀。[#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在存在批量插入的表上 `arrayUnion()` 返回多余（错误）值的缺陷。修复了 [#79157](https://github.com/ClickHouse/ClickHouse/issues/79157)。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* 修复下推过滤条件后出现的逻辑错误。[#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在通过基于 HTTP 的端点使用 delta-kernel 实现的 DeltaLake 表引擎时的问题，并修复 NOSIGN。关闭 [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124)。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper 修复：避免在失败的 multi 请求上触发 watch。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* 在 `IN` 中禁止使用 Dynamic 和 JSON 类型。由于当前 `IN` 的实现方式，这可能会导致结果不正确。在 `IN` 中正确支持这些类型较为复杂，可能会在未来实现。[#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复解析 `JSON` 类型时对重复路径的检查。[#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `SecureStreamSocket` 连接问题。[#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复包含数据的 plain&#95;rewritable 磁盘的加载过程。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在 MergeTree 的宽部件中发现动态子列时发生的崩溃。[#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* 仅在初始创建查询时检查表名长度。对于后续创建则不要进行该检查，以避免破坏向后兼容性。[#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在多种包含稀疏列的表的场景中修复了 `Block structure mismatch` 错误。[#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了两处出现 “Logical Error: Can&#39;t set alias of * of Asterisk on alias” 的问题。 [#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在重命名 Atomic 数据库时使用错误路径的问题。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复按 JSON 列与其他列一起排序时的问题。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在同时禁用 `use_hedged_requests` 和 `allow_experimental_parallel_reading_from_replicas` 时，从远程读取出现结果重复的问题。[#79599](https://github.com/ClickHouse/ClickHouse/pull/79599)（[Eduard Karacharov](https://github.com/korowa)）。
* 修复在使用 Unity Catalog 时 delta-kernel 实现中的崩溃。[#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 解析用于自动发现集群的宏。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 妥善处理配置错误的 page&#95;cache&#95;limits。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在可变长度格式化符（例如 `%W`，表示星期几，如 `Monday`、`Tuesday` 等）后跟复合格式化符（一次输出多个组件的格式化符，例如 `%D`，表示美式日期 `05/04/25`）时，SQL 函数 `formatDateTime` 的结果。[#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze))。
* IcebergS3 支持 `count` 优化，但 IcebergS3Cluster 不支持。因此，在集群模式下返回的 `count()` 结果可能会是副本数量的倍数。[#79844](https://github.com/ClickHouse/ClickHouse/pull/79844)（[wxybear](https://github.com/wxybear)）。
* 修复在延迟物化场景下出现的 AMBIGUOUS&#95;COLUMN&#95;NAME 错误：当在投影之前查询执行阶段未实际使用任何列时会触发该错误。例如：SELECT * FROM t ORDER BY rand() LIMIT 5。[#79926](https://github.com/ClickHouse/ClickHouse/pull/79926)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在查询 `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` 中隐藏密码。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* 允许在 JOIN USING 中指定别名。如果列被重命名（例如由于 ARRAY JOIN），请指定该别名。修复 [#73707](https://github.com/ClickHouse/ClickHouse/issues/73707)。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 允许包含 `UNION` 的物化视图在新副本上正常工作。[#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 函数 `parseDateTime` 中的格式说明符 `%e` 现在可以识别一位数的日期（例如 `3`），此前则要求使用空格填充（例如 ` 3`）。这使其行为与 MySQL 兼容。若要保留之前的行为，请将设置项 `parsedatetime_e_requires_space_padding` 设为 `1`。 (issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)). [#80057](https://github.com/ClickHouse/ClickHouse/pull/80057) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复 ClickHouse 日志中的警告 `Cannot find 'kernel' in '[...]/memory.stat'`（问题 [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 `FunctionComparison` 中检查栈大小，以避免因栈溢出而崩溃。[#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复从 `system.workloads` 执行 `SELECT` 时的竞争条件问题。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修复：分布式查询中的延迟物化。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复 `Array(Bool)` 向 `Array(FixedString)` 的转换。[#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat))。
* 降低 `parquet` 版本选择的困惑度。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `ReservoirSampler` 的自我合并问题。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在客户端上下文中插入表的存储方式。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修正 `AggregatingSortedAlgorithm` 和 `SummingSortedAlgorithm` 的数据成员销毁顺序。[#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat))。
* `enable_user_name_access_type` 不应影响 `DEFINER` 访问类型。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* 如果 `system` 数据库的元数据存放在 keeper 中，对 `system` 数据库的查询可能会出现挂起。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### 构建/测试/打包改进

- 支持重用已构建的 `chcache` 二进制文件,无需每次都重新构建。[#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 添加 NATS 暂停等待功能。[#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
- 修复错误地将 ARM 构建发布为 amd64compat 的问题。[#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger))。
- 为 OpenSSL 使用预先生成的汇编代码。[#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 修复以支持使用 `clang20` 进行构建。[#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `chcache`:支持 Rust 缓存。[#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 为 `zstd` 汇编文件添加栈展开信息。[#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321))。

### ClickHouse 版本 25.4,2025-04-22 {#254}

#### 向后不兼容的变更

- 当 `allow_materialized_view_with_bad_select` 为 `false` 时,检查物化视图中的所有列是否与目标表匹配。[#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm))。
- 修复 `dateTrunc` 使用负数 Date/DateTime 参数时的问题。[#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
- 已移除旧版 `MongoDB` 集成。服务器设置 `use_legacy_mongodb_integration` 已废弃,现在不再生效。[#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze))。
- 增强 `SummingMergeTree` 验证,对分区键或排序键中使用的列跳过聚合。[#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。


#### 新功能

* 为工作负载新增了 CPU 插槽调度功能，详情参见[文档](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* 如果指定 `--path` 命令行参数，`clickhouse-local` 在重启后会保留其数据库。关闭了 [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647)。关闭了 [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947)。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当服务器过载时拒绝查询。该决策基于等待时间（`OSCPUWaitMicroseconds`）与忙碌时间（`OSCPUVirtualTimeMicroseconds`）的比值作出。当该比值位于 `min_os_cpu_wait_time_ratio_to_throw` 和 `max_os_cpu_wait_time_ratio_to_throw` 之间时（这两个是查询级别的设置），会以一定概率丢弃查询。[#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* 在 `Iceberg` 中实现时间旅行：新增设置，可按指定时间点查询 `Iceberg` 表。[#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* 用于 `Iceberg` 元数据的内存缓存，用于存储清单文件/清单列表和 `metadata.json`，以加速查询。[#77156](https://github.com/ClickHouse/ClickHouse/pull/77156)（[Han Fei](https://github.com/hanfei1991)）。
* 支持在 Azure Blob Storage 上使用 `DeltaLake` 表引擎。修复 [#68043](https://github.com/ClickHouse/ClickHouse/issues/68043)。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 为反序列化后的向量相似度索引新增了内存缓存，这可以加快重复执行的近似最近邻（ANN）搜索查询。新缓存的大小由服务器设置项 `vector_similarity_index_cache_size` 和 `vector_similarity_index_cache_max_entries` 控制。该功能取代了早期版本中的跳过索引缓存功能。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在 DeltaLake 中支持分区剪枝。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在只读 `MergeTree` 表中支持后台刷新，从而可以通过无限数量的分布式读取器来查询可更新表（ClickHouse 原生数据湖）。[#76467](https://github.com/ClickHouse/ClickHouse/pull/76467)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 支持使用自定义磁盘存储数据库元数据文件。目前只能在服务器全局级别进行配置。[#77365](https://github.com/ClickHouse/ClickHouse/pull/77365)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 为 plain&#95;rewritable 磁盘增加对 ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION 的支持。[#77406](https://github.com/ClickHouse/ClickHouse/pull/77406)（[Julia Kartseva](https://github.com/jkartseva)）。
* 为 `Kafka` 表引擎添加用于 `SASL` 配置和凭据的表设置。这样可以在 `CREATE TABLE` 语句中直接配置基于 SASL 的 Kafka 及 Kafka 兼容系统的身份验证，而无需使用配置文件或命名集合。[#78810](https://github.com/ClickHouse/ClickHouse/pull/78810)（[Christoph Wurm](https://github.com/cwurm)）。
* 允许为 MergeTree 表设置 `default_compression_codec`：当 `CREATE` 查询未为指定列显式定义压缩编解码器时，将使用该设置。此项关闭了 [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005)。[#66394](https://github.com/ClickHouse/ClickHouse/pull/66394)（[gvoelfin](https://github.com/gvoelfin)）。
* 在集群配置中添加 `bind_host` 设置，使 ClickHouse 可以在分布式连接中使用特定网络。[#74741](https://github.com/ClickHouse/ClickHouse/pull/74741)（[Todd Yocum](https://github.com/toddyocum)）。
* 在 `system.tables` 中新增列 `parametrized_view_parameters`。修复了 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756)。[#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* 允许修改数据库注释。修复 [#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) ### 面向用户的变更文档条目：[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* 在 PostgreSQL 兼容协议中支持 `SCRAM-SHA-256` 身份验证。 [#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12)).
* 添加了函数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted` 和 `arraySimilarity`。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 设置 `parallel_distributed_insert_select` 现在对向 `ReplicatedMergeTree` 执行 `INSERT SELECT` 生效（之前需要使用 `Distributed` 表）。[#78041](https://github.com/ClickHouse/ClickHouse/pull/78041) ([Igor Nikonov](https://github.com/devcrafter))。
* 引入 `toInterval` 函数。该函数接受 2 个参数（值和单位），并将该值转换为特定的 `Interval` 类型。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* 为 `iceberg` 表函数和引擎新增多种便捷方式来定位根 `metadata.json` 文件。修复 [#78455](https://github.com/ClickHouse/ClickHouse/issues/78455)。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* 在 ClickHouse 的 SSH 协议中支持基于密码的身份验证。[#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 实验性特性
* 在 `WHERE` 子句中的 `EXISTS` 表达式参数中支持相关子查询。修复 [#72459](https://github.com/ClickHouse/ClickHouse/issues/72459)。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 新增函数 `sparseGrams` 和 `sparseGramsHashes`，提供 ASCII 和 UTF8 两个版本。作者：[scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。请暂勿使用该功能：其实现将在后续版本中发生变更。



#### 性能提升

* 使用 `lazy columns` 优化性能，该特性会在执行 `ORDER BY` 和 `LIMIT` 之后再读取数据。[#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 默认启用查询条件缓存。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过去虚函数化 `col->insertFrom()` 的调用来加速构建 JOIN 结果。[#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger))。
* 如果可能，将筛选步骤中的相等条件从查询计划中合并到 JOIN 条件中，以便可以将它们用作哈希表键。[#78877](https://github.com/ClickHouse/ClickHouse/pull/78877)（[Dmitry Novik](https://github.com/novikd)）。
* 如果在两个部分中，`JOIN` 键都是主键的前缀，则对 `JOIN` 使用动态分片。可通过 `query_plan_join_shard_by_pk_ranges` 设置启用此优化（默认禁用）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 基于列的上下边界值支持 `Iceberg` 数据裁剪。修复了 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638)。[#78242](https://github.com/ClickHouse/ClickHouse/pull/78242)（[alesapin](https://github.com/alesapin)）。
* 为 `Iceberg` 实现了简单的 count 优化。现在使用 `count()` 且没有任何过滤条件的查询应该会更快。修复 [#77639](https://github.com/ClickHouse/ClickHouse/issues/77639)。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* 添加了通过 `max_merge_delayed_streams_for_parallel_write` 配置合并操作中可并行刷新列数的能力（这应当可以将写入 S3 的垂直合并的内存使用量降低约 25 倍）。 [#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat)).
* 在缓存处于被动使用状态时（例如用于合并操作），禁用 `filesystem_cache_prefer_bigger_buffer_size`。这可以降低合并操作的内存占用。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 现在，我们使用副本数量来确定在启用并行副本读取时的任务大小。这样在读取数据量不太大时，可以在副本之间实现更均衡的工作分配。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* 为 `ORC` 格式支持异步 IO 预取，通过隐藏远程 IO 延迟来提升整体性能。[#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li))。
* 预分配异步插入使用的内存以提升性能。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* 通过在可以使用 `multiRead` 的地方避免使用单个 `get` 请求，从而减少 Keeper 请求的数量；在副本数量增加的情况下，单个 `get` 请求可能会给 Keeper 带来显著负载。[#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* 对在 Nullable 参数上运行函数的轻微优化。[#76489](https://github.com/ClickHouse/ClickHouse/pull/76489)（[李扬](https://github.com/taiyang-li)）。
* 优化 `arraySort`。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li))。
* 合并同一 part 的标记并一次性写入查询条件缓存，以减少锁的开销。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 针对仅包含一次括号展开的查询优化 `s3Cluster` 性能。[#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis)).
* 优化按单个 `Nullable` 或 `LowCardinality` 列排序的性能。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li)).
* 优化 `Native` 格式的内存使用情况。[#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat))。
* 简单优化：如果需要进行类型转换，则不要将 `count(if(...))` 重写为 `countIf`。关闭 [#78564](https://github.com/ClickHouse/ClickHouse/issues/78564)。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 函数现在可以利用 `tokenbf_v1`、`ngrambf_v1` 全文跳跃索引。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus)).
* 向量相似度索引可能会将主内存多分配最高达 2 倍。本次修复重构了内存分配策略，从而降低内存消耗，并提升向量相似度索引缓存的效果。（issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 为 `system.metric_log` 表引入一个名为 `schema_type` 的设置，用于指定表的模式类型。允许的三种模式为：`wide` —— 当前模式，每个指标/事件使用单独的列存储（对单列读取最为高效）；`transposed` —— 类似于 `system.asynchronous_metric_log`，指标/事件按行存储；以及最有意思的 `transposed_with_wide_view` —— 使用 `transposed` 模式创建底层表，同时提供一个使用 `wide` 模式的视图，将对视图的查询转换到底层表上执行。在 `transposed_with_wide_view` 模式下，视图不支持亚秒级精度，`event_time_microseconds` 仅作为向后兼容的别名存在。[#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin))。





#### 改进

* 为 `Distributed` 查询序列化查询计划。新增设置项 `serialize_query_plan`。启用后，来自 `Distributed` 表的查询在远程执行时将使用序列化的查询计划。这为 TCP 协议引入了一种新的数据包类型，需要在服务器配置中添加 `<process_query_plan_packet>true</process_query_plan_packet>` 以允许处理该数据包。[#69652](https://github.com/ClickHouse/ClickHouse/pull/69652)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 支持从视图中读取 `JSON` 类型及其子列。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar))。
* 支持 `ALTER DATABASE ... ON CLUSTER`。[#79242](https://github.com/ClickHouse/ClickHouse/pull/79242)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 可刷新物化视图的刷新操作现在会记录在 `system.query_log` 中。[#71333](https://github.com/ClickHouse/ClickHouse/pull/71333)（[Michael Kolupaev](https://github.com/al13n321)）。
* 用户自定义函数（UDF）现在可以通过其配置中的新设置标记为确定性函数。此外，查询缓存现在会检查查询中调用的 UDF 是否为确定性函数；如果是，则会缓存该查询结果。（问题 [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)）。[#77769](https://github.com/ClickHouse/ClickHouse/pull/77769)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 为所有类型的复制任务启用了退避逻辑。这将有助于降低 CPU 使用率、内存占用以及日志文件大小。新增了 `max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms` 和 `max_postpone_time_for_failed_replicated_tasks_ms` 这几个设置，它们与 `max_postpone_time_for_failed_mutations_ms` 类似。[#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 将 `query_id` 字段添加到 `system.errors`。修复 [#75815](https://github.com/ClickHouse/ClickHouse/issues/75815)。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* 新增支持将 `UInt128` 转换为 `IPv6`。这使得可以对 `IPv6` 进行 `bitAnd` 运算和算术运算，并将结果再转换回 `IPv6`。修复了 [#76752](https://github.com/ClickHouse/ClickHouse/issues/76752)。这也允许将对 `IPv6` 进行 `bitAnd` 运算的结果转换回 `IPv6`。另见 [#57707](https://github.com/ClickHouse/ClickHouse/pull/57707)。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* 默认情况下，不在 `Variant` 类型的文本格式中解析特殊的 `Bool` 值。可以通过设置 `allow_special_bool_values_inside_variant` 来启用此行为。[#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* 在会话级别和服务器级别支持为低 `priority` 查询配置单个任务的等待时间。[#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* 为 `JSON` 数据类型的值实现比较功能。现在可以像比较 `Map` 一样比较 `JSON` 对象。[#77397](https://github.com/ClickHouse/ClickHouse/pull/77397)（[Pavel Kruglov](https://github.com/Avogar)）。
* 通过 `system.kafka_consumers` 提供更完善的权限支持。转发内部的 `librdkafka` 错误（值得一提的是，这个库相当糟糕）。[#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn))。
* 为 Buffer 表引擎的设置添加了校验。[#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 添加配置项 `enable_hdfs_pread`，用于启用或禁用 `HDFS` 中的 pread。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou)).
* 为 ZooKeeper 的 `multi` 读写请求次数添加 profile event。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo))。
* 当启用 `disable_insertion_and_mutation` 时，允许创建临时表并向其中插入数据。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* 将 `max_insert_delayed_streams_for_parallel_write` 降至 100。[#77919](https://github.com/ClickHouse/ClickHouse/pull/77919) ([Azat Khuzhin](https://github.com/azat)).
* 修复 Joda 语法中的年份解析（如果你在好奇的话，这是来自 Java 生态），例如 `yyy`。[#77973](https://github.com/ClickHouse/ClickHouse/pull/77973) ([李扬](https://github.com/taiyang-li))。
* 附加 `MergeTree` 表的部件将按照其数据块顺序执行，这对于一些特殊的合并算法（例如 `ReplacingMergeTree`）非常重要。修复了 [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009)。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 查询掩码规则现在可以在发生匹配时抛出 `LOGICAL_ERROR`。这有助于检查预定义的密码是否在日志中的任意位置泄漏。[#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 向 `information_schema.tables` 添加了列 `index_length_column`，以提升与 MySQL 的兼容性。[#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ))。
* 引入两个新指标：`TotalMergeFailures` 和 `NonAbortedMergeFailures`。这些指标用于检测在短时间内出现过多合并失败的情况。[#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复在使用路径风格但未指定 key 时对 S3 URL 的错误解析。[#78185](https://github.com/ClickHouse/ClickHouse/pull/78185)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复异步指标 `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime` 和 `BlockReadTime` 的取值错误（变更前 1 秒被错误地报告为 0.001）。[#78211](https://github.com/ClickHouse/ClickHouse/pull/78211)（[filimonov](https://github.com/filimonov)）。
* 在向 StorageS3(Azure)Queue 的物化视图推送数据时，对发生的错误开始遵守 `loading_retries` 限制。此前此类错误会被无限次重试。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在 DeltaLake 的 `delta-kernel-rs` 实现中，修复性能和进度条问题。[#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为运行时磁盘添加对 `include`、`from_env`、`from_zk` 的支持。修复了 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177)。[#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 为长时间运行的 mutation 在 `system.warnings` 表中添加一条动态告警。[#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* 在系统表 `system.query_condition_cache` 中新增字段 `condition`。该字段存储用于查询条件缓存键的原始明文条件，其哈希值被用作缓存中的键。[#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* 允许 Hive 分区为空值。[#78816](https://github.com/ClickHouse/ClickHouse/pull/78816)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复 `BFloat16` 在 `IN` 子句中的类型转换问题（即 `SELECT toBFloat16(1) IN [1, 2, 3];` 现在返回 `1`）。修复了 [#78754](https://github.com/ClickHouse/ClickHouse/issues/78754)。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 如果设置了 `disk = ...`，则不要检查其他磁盘上的 `MergeTree` 分片。[#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat))。
* 将 `system.query_log` 中 `used_data_type_families` 的数据类型记录为其规范名称。[#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在执行 `recoverLostReplica` 时的清理相关设置，与此处保持一致：[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 对 `INFILE` 的模式推断使用插入列。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复在聚合投影中使用 `count(Nullable)` 时的投影分析错误，解决了 [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495)。此 PR 还在投影分析相关位置增加了一些日志，用于明确说明为什么会使用某个投影或为什么不会使用。[#74498](https://github.com/ClickHouse/ClickHouse/pull/74498)（[Amos Bird](https://github.com/amosbird)）。
* 修复在执行 `DETACH PART` 时出现的 `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` 错误。[#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk))。
* 在 analyzer 中修复包含字面量表达式的 skip index 不生效的问题，并在索引分析过程中移除多余的类型转换。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个错误：`close_session` 查询参数之前不起作用，导致命名会话只能在经过 `session_timeout` 后才会被关闭。[#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats))。
* 修复了在没有附加 `Materialized View` 的情况下从 NATS 服务器接收消息的问题。 [#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 修复通过 `merge` 表函数从空的 `FileLog` 读取时的逻辑错误，关闭 [#75575](https://github.com/ClickHouse/ClickHouse/issues/75575)。[#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在共享 variant 中的 `Dynamic` 序列化中使用默认格式设置。[#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在本地磁盘上检查表数据路径是否存在的方式。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了对于某些类型将常量值发送到远端时的问题。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复由于 S3/AzureQueue 中上下文过期引发的崩溃。[#77720](https://github.com/ClickHouse/ClickHouse/pull/77720)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 RabbitMQ、Nats、Redis 和 AzureQueue 表引擎中隐藏凭据。[#77755](https://github.com/ClickHouse/ClickHouse/pull/77755)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在 `argMin`/`argMax` 中进行 `NaN` 比较时的未定义行为。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* 即使在操作不会产生任何需要写入的数据块的情况下，也要定期检查合并和变更是否已被取消。[#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复了在 `Replicated` 数据库中新添加副本上，刷新型物化视图无法正常工作的问题。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在出现 `NOT_FOUND_COLUMN_IN_BLOCK` 错误时可能发生的崩溃。[#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复在向 S3/AzureQueue 填充数据时发生的崩溃。[#77878](https://github.com/ClickHouse/ClickHouse/pull/77878)（[Bharat Nallan](https://github.com/bharatnc)）。
* 在 SSH 服务器中禁用历史记录的模糊搜索（因为它需要 `skim` 库）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat))。
* 修复了一个错误：当在未建立索引的列上执行向量搜索查询且表中存在另一个已定义向量相似度索引的向量列时，查询会返回不正确的结果。（Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978)）。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 修复提示信息 &quot;The requested output format {} is binary... Do you want to output it anyway? [y/N]&quot; 中的一个极小错误。[#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在 `toStartOfInterval` 使用零起点参数时的一个错误。[#78096](https://github.com/ClickHouse/ClickHouse/pull/78096) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 禁止在 HTTP 接口中使用空的 `session_id` 查询参数。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* 修复 `Replicated` 数据库中可能出现的元数据被覆盖问题，该问题可能是在执行 `ALTER` 查询后紧接着执行 `RENAME` 查询时发生的。[#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复 `NATS` 引擎中的崩溃。[#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 不要在用于 SSH 的嵌入式客户端中尝试创建 history&#95;file（在之前的版本中，创建始终失败，但仍会尝试）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* 修复在执行 `RENAME DATABASE` 或 `DROP TABLE` 查询后，`system.detached_tables` 显示不正确信息的问题。[#78126](https://github.com/ClickHouse/ClickHouse/pull/78126)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复了在 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) 之后对 `Replicated` 数据库中过多表数量的检查。同时，将该检查提前到创建存储之前执行，以避免在 `ReplicatedMergeTree` 或 `KeeperMap` 的情况下在 Keeper 中创建未计入的节点。[#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复由于并发执行 `S3Queue` 元数据初始化可能导致的崩溃问题。[#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 函数现在在 `max_size` 参数为 Int 类型且值为 0 时会返回 `BAD_ARGUMENTS` 错误，与对 UInt 类型的处理保持一致，而不会在该值下继续执行。[#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* 在本地表在被分离之前已被删除的情况下，修复丢失副本时避免发生崩溃。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `system.s3_queue_settings` 中 &quot;alterable&quot; 列始终返回 `false` 的问题。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 对 Azure 访问签名进行脱敏处理，使其对用户不可见且不会出现在日志中。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 Wide 部分中带前缀子流的预取问题。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在键数组类型为 `LowCardinality(Nullable)` 时，`mapFromArrays` 崩溃或返回错误结果的问题。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* 修复 delta-kernel-rs 认证选项。[#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当副本的 `disable_insertion_and_mutation` 为 true 时，不再调度 Refreshable Materialized Views 的任务。任务本质上是一次插入操作，如果 `disable_insertion_and_mutation` 为 true，则会失败。[#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* 校验对 `Merge` 引擎底层表的访问权限。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 在查询 `Distributed` 表时，可以忽略 `FINAL` 修饰符。[#78428](https://github.com/ClickHouse/ClickHouse/pull/78428)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 当 `bitmapMin` 处理空 bitmap 时会返回 uint32&#95;max（当输入类型更大时返回 uint64&#95;max），这与空 roaring&#95;bitmap 的最小值行为一致。[#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* 在启用 `distributed_aggregation_memory_efficient` 时，禁用在读取 FROM 之后立刻对查询进行并行处理，否则可能导致逻辑错误。修复了 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934)。[#78500](https://github.com/ClickHouse/ClickHouse/pull/78500)（[flynn](https://github.com/ucasfl)）。
* 在应用 `max_streams_to_max_threads_ratio` 设置后，如果计划的流数量为零，则至少保留一个用于读取的流。[#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* 在存储 `S3Queue` 中修复了逻辑错误 “Cannot unregister: table uuid is not registered”。修复了 [#78285](https://github.com/ClickHouse/ClickHouse/issues/78285)。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在同时启用了 cgroup v1 和 v2 的系统上，ClickHouse 现在能够自动识别其 cgroup v2。[#78566](https://github.com/ClickHouse/ClickHouse/pull/78566)（[Grigory Korolev](https://github.com/gkorolev)）。
* `-Cluster` 表函数在与表级设置一起使用时会出错。[#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik))。
* 在 `ReplicatedMergeTree` 不支持对 `INSERT` 使用事务的情况下，增加了更完善的检查。[#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat))。
* 在执行 ATTACH 期间清理查询设置。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 `iceberg_metadata_file_path` 中指定无效路径时导致的崩溃。[#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* 在使用 delta-kernel-s 实现的 `DeltaLake` 表引擎中，修复了在读取 schema 与表 schema 不一致且同时存在分区列时，导致出现 “not found column” 错误的问题。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了这样一个问题：在调度关闭一个具名会话之后（但尚未到达超时时间），如果创建了一个同名的新具名会话，它会在第一个会话原本计划关闭的时间点被关闭。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* 修复了多种从使用 `MongoDB` 引擎的表或 `mongodb` 表函数读取数据的 `SELECT` 查询：在 `WHERE` 子句中对常量值进行隐式类型转换的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`）；以及带有 `LIMIT` 和 `GROUP BY` 的查询。此前，这些查询可能会返回错误结果。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 在运行 `CHECK TABLE` 时，不再阻塞表的关闭。[#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper 修复：在所有情况下修正 ephemeral 计数。[#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在 `StorageDistributed` 中使用除 `view` 之外的表函数时出现的错误类型转换。修复 [#78464](https://github.com/ClickHouse/ClickHouse/issues/78464)。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `tupleElement(*, 1)` 的格式一致性。关闭 [#78639](https://github.com/ClickHouse/ClickHouse/issues/78639)。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 类型为 `ssd_cache` 的字典现在会拒绝 `block_size` 和 `write_buffer_size` 参数为零或负数的配置（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复在不正确关机后执行 `ALTER` 时 `Refreshable MATERIALIZED VIEW` 崩溃的问题。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `CSV` 格式中对无效 `DateTime` 值的解析。[#78919](https://github.com/ClickHouse/ClickHouse/pull/78919) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper 修复：避免在批量请求失败时触发 watch。[#79247](https://github.com/ClickHouse/ClickHouse/pull/79247)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复了在显式指定 min-max 值但该值为 `NULL` 时读取 Iceberg 表失败的问题。发现 Go Iceberg 库会生成这种有问题的文件。修复关闭了 [#78740](https://github.com/ClickHouse/ClickHouse/issues/78740)。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。

#### 构建/测试/打包改进

- 在 Rust 中遵循 CPU 目标特性,并在所有 crate 中启用 LTO。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 25.3 LTS 版本,2025-03-20 {#253}

#### 向后不兼容变更

- 禁止对复制数据库执行 TRUNCATE 操作。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc))。
- 跳数索引缓存功能已回退。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。


#### 新功能

* `JSON` 数据类型已可用于生产环境。参见 [https://jsonbench.com/](https://jsonbench.com/)。`Dynamic` 和 `Variant` 数据类型已可用于生产环境。[#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 clickhouse-server 引入 SSH 协议。现在，可以使用任意 SSH 客户端连接到 ClickHouse。关闭了：[#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 如果启用了并行副本，将表函数替换为对应的 -Cluster 版本。修复了 [#65024](https://github.com/ClickHouse/ClickHouse/issues/65024)。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 用户态页面缓存的新实现，允许在进程内存中缓存数据，而不是依赖操作系统页面缓存；当数据存储在没有本地文件系统缓存支持的远程虚拟文件系统上时，这非常有用。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 新增了 `concurrent_threads_scheduler` 服务器设置，用于控制在并发查询之间如何分配 CPU 槽位。可设置为 `round_robin`（原有行为）或 `fair_round_robin`，以解决 INSERT 和 SELECT 之间 CPU 分配不公平的问题。[#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* 新增 `estimateCompressionRatio` 聚合函数 [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。[#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 新增函数 `arraySymmetricDifference`。它返回多个数组参数中那些未在所有参数中同时出现的元素。示例：`SELECT arraySymmetricDifference([1, 2], [2, 3])` 返回 `[1, 3]`。（issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673)）。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* 允许通过存储/表函数设置 `iceberg_metadata_file_path` 来显式指定要读取的 Iceberg 元数据文件。修复 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412)。[#77318](https://github.com/ClickHouse/ClickHouse/pull/77318)（[alesapin](https://github.com/alesapin)）。
* 新增了 `keccak256` 哈希函数，该函数常用于区块链实现中，尤其是在基于 EVM 的系统中。[#76669](https://github.com/ClickHouse/ClickHouse/pull/76669)（[Arnaud Briche](https://github.com/arnaudbriche)）。
* 新增三个函数：`icebergTruncate`（按规范实现：[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details)）、`toYearNumSinceEpoch` 和 `toMonthNumSinceEpoch`。在 `Iceberg` 引擎中为分区裁剪提供对 `truncate` 变换的支持。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403) ([alesapin](https://github.com/alesapin))。
* 支持 `LowCardinality(Decimal)` 数据类型 [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833) ([zhanglistar](https://github.com/zhanglistar))。
* `FilterTransformPassedRows` 和 `FilterTransformPassedBytes` 性能分析事件将显示查询执行过程中被过滤的行数和字节数。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar))。
* 支持直方图指标类型。该接口与 Prometheus 客户端高度相似，只需调用 `observe(value)` 即可为对应值所在桶的计数器加一。直方图指标通过 `system.histogram_metrics` 对外暴露。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 为基于显式值的非常量 `CASE` 提供支持。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).



#### 实验性功能
* 为基于 AWS S3 和本地文件系统的 DeltaLake 表添加对 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 的支持。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988) ([alesapin](https://github.com/alesapin)).
* 引入与 AWS Glue 服务目录的实验性集成，用于 Iceberg 表。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257) ([alesapin](https://github.com/alesapin)).
* 增加对动态集群自动发现的支持。这扩展了现有的 _node_ 自动发现功能。ClickHouse 现在可以使用 `<multicluster_root_path>` 在同一个 ZooKeeper 路径下自动检测并注册新的 _clusters_。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 通过新增设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`，允许在可配置的超时时间之后对整个分区执行自动清理合并。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440) ([Christoph Wurm](https://github.com/cwurm)).



#### 性能改进
* 实现查询条件缓存，以提升重复条件下的查询性能。会在内存中将不满足条件的数据范围记录为临时索引，后续查询会使用该索引。修复 [#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236) ([zhongyuankai](https://github.com/zhongyuankai)).
* 在数据分片被删除时主动从缓存中驱逐数据。如果数据量较少，不要让缓存增长到最大容量。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在算术计算中用 clang 内建的 i256 替换 Int256 和 UInt256，从而带来性能提升 [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。[#73658](https://github.com/ClickHouse/ClickHouse/pull/73658) ([李扬](https://github.com/taiyang-li)).
* 在某些情况下（例如空数组列），数据分片可能包含空文件。当表位于元数据与对象存储分离的磁盘上时，可以跳过向对象存储写入空 blob，仅为此类文件存储元数据。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860) ([Alexander Gololobov](https://github.com/davenger)).
* 提升 Decimal32/Decimal64/DateTime64 的最小值/最大值计算性能。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570) ([李扬](https://github.com/taiyang-li)).
* 查询编译（设置 `compile_expressions`）现在会考虑机器类型。这显著加快了此类查询的执行速度。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753) ([ZhangLiStar](https://github.com/zhanglistar)).
* 优化 `arraySort`。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 在缓存被被动使用时（例如用于合并），禁用 `filesystem_cache_prefer_bigger_buffer_size`。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在部分代码位置应用 `preserve_most` 属性，从而实现略优的代码生成效果。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778) ([Nikita Taranov](https://github.com/nickitat)).
* 更快的 ClickHouse 服务器关闭（去除 2.5 秒延迟）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550) ([Azat Khuzhin](https://github.com/azat)).
* 避免在 ReadBufferFromS3 和其他远程读取缓冲区中出现多余的内存分配，将它们的内存占用降低一半。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692) ([Sema Checherinda](https://github.com/CheSema)).
* 将 zstd 从 1.5.5 升级到 1.5.7，这可能会带来一些[性能改进](https://github.com/facebook/zstd/releases/tag/v1.5.7)。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* 降低在宽分片（Wide parts）中对 JSON 列进行预取时的内存使用。这在 ClickHouse 运行在共享存储（例如 ClickHouse Cloud）之上时尤为重要。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640) ([Pavel Kruglov](https://github.com/Avogar)).



#### 改进

* 在将 `TRUNCATE` 与 `INTO OUTFILE` 一起使用时支持原子重命名。修复了 [#70323](https://github.com/ClickHouse/ClickHouse/issues/70323)。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 在设置中不再允许将 `NaN` 或 `inf` 作为浮点值使用。其实之前允许这么做也没有任何意义。[#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 当禁用 `analyzer` 时，默认同时禁用并行副本，与 `compatibility` 设置无关。仍然可以通过将 `parallel_replicas_only_with_analyzer` 显式设置为 `false` 来更改此行为。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter))。
* 新增支持定义一个请求头列表，用于将客户端请求中的这些请求头转发给外部 HTTP 认证器。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* 在对 `tuple` 列中的字段进行列匹配时，支持大小写不敏感的列名匹配。关闭 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324)。[#73780](https://github.com/ClickHouse/ClickHouse/pull/73780)（[李扬](https://github.com/taiyang-li)）。
* Gorilla 编解码器的参数现在将始终保存在 .sql 文件中的表元数据里。修复了：[#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 为某些数据湖实现了解析能力增强（Sequence ID 解析：新增在清单文件中解析序列标识符的功能；Avro 元数据解析：重新设计 Avro 元数据解析器，使其便于未来扩展和增强）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik)).
* 从 `system.opentelemetry_span_log` 的默认 ORDER BY 子句中移除 trace&#95;id。[#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat))。
* 现在可以将加密（属性 `encrypted_by`）应用于任意配置文件（config.xml、users.xml、嵌套配置文件）。此前，它仅适用于顶层 config.xml 文件。[#75911](https://github.com/ClickHouse/ClickHouse/pull/75911) ([Mikhail Gorshkov](https://github.com/mgorshkov))。
* 改进 `system.warnings` 表，并添加一些可动态添加、更新或移除的警告消息。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc))。
* 此 PR 禁止再运行查询 `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES`，因为所有 `DROP` 操作必须在语句中排在最前面。[#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit))。
* 对 `SYNC REPLICA` 进行了多项改进（更清晰的错误信息、更完善的测试、合理性检查）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* 在执行备份时，如果由于“Access Denied”导致对 S3 的多部分复制失败，则使用正确的回退方案。当在使用不同凭证的 bucket 之间进行备份时，多部分复制可能会产生“Access Denied”错误。[#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368))。
* 将 librdkafka（这玩意儿一塌糊涂）升级到了 2.8.0 版本（这堆垃圾也没好到哪去），并改进了 Kafka 表的关闭流程，从而减少在删除表和重启服务器时的延迟。`engine=Kafka` 在表被删除时不再显式地退出 consumer group。相反，consumer 将继续留在该 group 中，直到在 `session_timeout_ms`（默认：45 秒）时间内保持空闲后被自动移除。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* 修复对 S3 请求设置的验证。[#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar)).
* 像 `server_settings` 或 `settings` 这样的系统表中都有一个很方便的 `default` 值列。将该列同样添加到 `merge_tree_settings` 和 `replicated_merge_tree_settings` 中。[#76942](https://github.com/ClickHouse/ClickHouse/pull/76942)（[Diego Nieto](https://github.com/lesandie)）。
* 添加了 `ProfileEvents::QueryPreempted`，其逻辑与 `CurrentMetrics::QueryPreempted` 相似。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu))。
* 此前，`Replicated` 数据库可能会将查询中指定的凭据输出到日志中。此问题已修复，关闭相关 issue：[#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 允许在 `plain_rewritable` 磁盘上执行 ALTER TABLE DROP PARTITION。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* 备份/恢复设置 `allow_s3_native_copy` 现在支持三个可能的取值： - `False` - 不使用 S3 原生复制； - `True`（旧默认值）- ClickHouse 将首先尝试使用 S3 原生复制，如果失败则回退到“读+写”的方式； - `'auto'`（新默认值）- ClickHouse 会先比较源端和目标端的凭据。如果相同，ClickHouse 将尝试使用 S3 原生复制，如果失败则可能回退到“读+写”的方式；如果不同，ClickHouse 将直接采用“读+写”的方式。 [#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 DeltaLake 表引擎的 delta kernel 中支持使用 AWS 会话令牌和环境凭证。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复在处理异步分布式 INSERT 的挂起批次时出现卡顿的问题（例如由于 `No such file or directory`）。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* 在索引分析期间改进了 datetime 转换，通过对隐式的 Date 向 DateTime 转换强制采用饱和行为。这解决了由于 datetime 范围限制而可能导致的索引分析不准确问题，修复了 [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307)。同时也修复了在 `date_time_overflow_behavior = 'ignore'`（默认值）时显式调用 `toDateTime` 的转换问题。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* 修复由于 UUID 与表名之间竞争导致的各种错误（例如，它修复了 `RENAME` 与 `RESTART REPLICA` 之间的竞争：在并发执行 `RENAME` 和 `SYSTEM RESTART REPLICA` 时，可能会导致错误地重启副本，和/或将某个表一直停留在 `Table X is being restarted` 状态）。[#76308](https://github.com/ClickHouse/ClickHouse/pull/76308) ([Azat Khuzhin](https://github.com/azat)).
* 修复在启用 async insert 并使用 insert into ... from file ... 且块大小不相等时的数据丢失问题：如果第一个块大小 &lt; async&#95;max&#95;size，但第二个块大小 &gt; async&#95;max&#95;size，则第二个块不会被插入，这部分数据会一直滞留在 `squashing` 中。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* 将 `system.data_skipping_indices` 中的字段 &#39;marks&#39; 重命名为 &#39;marks&#95;bytes&#39;。[#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复动态文件系统缓存调整大小时在淘汰过程中处理意外错误的问题。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了并行哈希中 `used_flag` 的初始化，之前的实现可能导致服务器崩溃。[#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在投影中调用 `defaultProfiles` 函数时的逻辑错误。[#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit)).
* 在 Web UI 中不要通过浏览器发起交互式基本身份验证请求。修复了 [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319)。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复从分布式表中选择布尔字面量时出现的 `THERE_IS_NO_COLUMN` 异常。[#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 表目录中子路径的选取方式进行了更深入的优化。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在对主键中包含子列的表执行 `ALTER` 后出现的错误 `Not found column in block`。在 [https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 之后，还需要 [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403)。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 为 null 短路添加性能测试并修复相关错误。[#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li))。
* 在最终完成输出写入缓冲区之前先刷新它们。修复在某些输出格式（例如 `JSONEachRowWithProgressRowOutputFormat`）的最终化过程中产生的 `LOGICAL_ERROR`。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* 添加了对 MongoDB 二进制 UUID 的支持（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)） - 修复了在使用表函数时对 MongoDB 的 WHERE 下推（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)） - 修改了 MongoDB - ClickHouse 类型映射，使 MongoDB 的二进制 UUID 只能被解析为 ClickHouse 的 UUID，这应当可以避免将来的歧义和意外情况。- 修复了 OID 映射，同时保持向后兼容。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 修复 JSON 子列并行前缀反序列化过程中的异常处理。[#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `lgamma` 函数在负整数上的行为。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 修复对显式定义主键的反向键分析。类似于 [#76654](https://github.com/ClickHouse/ClickHouse/issues/76654)。[#76846](https://github.com/ClickHouse/ClickHouse/pull/76846)（[Amos Bird](https://github.com/amosbird)）。
* 修复在 JSON 格式中对 Bool 值的美化输出。 [#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在异步插入出错时，由于 JSON 列回滚处理不当可能导致的崩溃问题。[#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 之前，`multiIf` 在计划阶段和主执行阶段可能会返回不同类型的列。这会导致从 C++ 视角来看，代码产生未定义行为。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了 MergeTree 中常量 Nullable 键的错误序列化问题。此修复对应 [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939)。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `BFloat16` 值的排序。已关闭 [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487)。已关闭 [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669)。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过在数据分片一致性检查中添加跳过临时子列的校验，修复了带有 `Variant` 子列的 JSON 的错误。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 修复 `Values` 格式在解析模板时因类型不匹配而发生的崩溃。[#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar))。
* 禁止创建在主键中包含子列的 EmbeddedRocksDB 表。此前虽然可以创建此类表，但 `SELECT` 查询会失败。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复分布式查询中的非法比较问题，因为下推到远端的谓词没有正确尊重字面量类型。[#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94)).
* 修复在创建 Kafka 表时因异常引发的崩溃。[#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 Kafka 和 RabbitMQ 引擎中增加对 JSON 和子列的支持。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 macOS 上异常栈展开的问题。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* 修复在 `getSubcolumn` 函数中读取 `null` 子列的问题。 [#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用 `Array` 和不受支持函数时的布隆过滤器索引问题。[#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* 我们只应在最初的 `CREATE` 查询中检查表数量的限制。[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 不是 bug：`SELECT toBFloat16(-0.0) == toBFloat16(0.0)` 现在会正确返回 `true`（之前为 `false`）。这使得其行为与 `Float32` 和 `Float64` 保持一致。[#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 修复对未初始化的 `key_index` 变量可能存在的不正确引用，该问题可能在 debug 构建中导致崩溃（在 release 构建中，这个未初始化引用不会导致问题，因为后续代码很可能会抛出错误）。### 面向用户可见变更的文档条目。[#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear))。
* 修复了 Bool 类型分区的名称。在 [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) 中曾被引入问题。[#77319](https://github.com/ClickHouse/ClickHouse/pull/77319)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了包含可为空元素的元组与字符串之间的比较问题。举例来说，在修改之前，将元组 `(1, null)` 与字符串 `'(1,null)'` 进行比较会导致错误。另一个例子是，将元组 `(1, a)`（其中 `a` 是 Nullable 列）与字符串 `'(1, 2)'` 进行比较也会出错。此更改解决了这些问题。[#77323](https://github.com/ClickHouse/ClickHouse/pull/77323)（[Alexey Katsman](https://github.com/alexkats)）。
* 修复 `ObjectStorageQueueSource` 中的崩溃。该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) 中引入的。[#77325](https://github.com/ClickHouse/ClickHouse/pull/77325)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复使用 `input` 时的 `async_insert`。[#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat))。
* 修复：当排序列被规划器移除时，`WITH FILL` 可能因 NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK 而失败。类似的问题还与为 INTERPOLATE 表达式计算出的不一致 DAG 有关。[#77343](https://github.com/ClickHouse/ClickHouse/pull/77343)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了在为无效 AST 节点设置别名时出现的若干 `LOGICAL_ERROR`。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano))。
* 修复了 filesystem cache 实现中在写入文件段时的错误处理。[#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 使 DatabaseIceberg 使用由目录提供的正确元数据文件。修复 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187)。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 查询缓存现在假定 UDF 是非确定性的。因此，包含 UDF 的查询结果将不再被缓存。此前，用户可以定义非确定性的 UDF，其结果会被错误地缓存（问题 [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复 `system.filesystem_cache_log` 仅在开启设置 `enable_filesystem_cache_log` 时才生效的问题。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在投影中调用 `defaultRoles` 函数时的逻辑错误，作为对 [#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) 的后续修复。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 现在不允许在函数 `arrayResize` 的第二个参数中使用 `Nullable` 类型。此前，将 `Nullable` 用作第二个参数可能会导致从报错到结果错误等各种问题。（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 即使在操作不会生成任何要写入的数据块时，也要定期检查合并和变更是否已被取消。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。

#### 构建/测试/打包改进

- `clickhouse-odbc-bridge` 和 `clickhouse-library-bridge` 已迁移至独立代码仓库 https://github.com/ClickHouse/odbc-bridge/。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 修复 Rust 交叉编译问题,并支持完全禁用 Rust。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 版本 25.2,2025-02-27 {#252}

#### 向后不兼容变更

- 默认完全启用 `async_load_databases`(即使对于未升级 `config.xml` 的安装实例也是如此)。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat))。
- 新增 `JSONCompactEachRowWithProgress` 和 `JSONCompactStringsEachRowWithProgress` 格式。延续 [#69989](https://github.com/ClickHouse/ClickHouse/issues/69989)。`JSONCompactWithNames` 和 `JSONCompactWithNamesAndTypes` 不再输出 "totals"——这显然是实现中的一个错误。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- 将 `format_alter_operations_with_parentheses` 的默认值更改为 true,以消除 ALTER 命令列表的歧义(参见 https://github.com/ClickHouse/ClickHouse/pull/59532)。这会导致与 24.3 之前版本集群的复制中断。如果您正在升级使用旧版本的集群,请在服务器配置中关闭该设置,或先升级到 24.3 版本。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano))。
- 移除使用正则表达式过滤日志消息的功能。该实现引入了数据竞争问题,因此必须移除。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 设置 `min_chunk_bytes_for_parallel_parsing` 不能再为零。这修复了:[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- 验证缓存配置中的设置。以前不存在的设置会被忽略,现在它们会抛出错误,应将其移除。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii))。


#### 新功能
* 支持类型 `Nullable(JSON)`。[#73556](https://github.com/ClickHouse/ClickHouse/pull/73556)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 DEFAULT 和 MATERIALIZED 表达式中支持子列。[#74403](https://github.com/ClickHouse/ClickHouse/pull/74403)（[Pavel Kruglov](https://github.com/Avogar)）。
* 通过设置 `output_format_parquet_write_bloom_filter`（默认启用）支持写入 Parquet 布隆过滤器。[#71681](https://github.com/ClickHouse/ClickHouse/pull/71681)（[Michael Kolupaev](https://github.com/al13n321)）。
* Web UI 现在提供交互式数据库导航功能。[#75777](https://github.com/ClickHouse/ClickHouse/pull/75777)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 允许在存储策略中组合只读磁盘和读写磁盘（作为多个卷或多块磁盘）。这允许从整个卷读取数据，而写入操作将优先使用可写磁盘（即“写时复制”（Copy-on-Write）存储策略）。[#75862](https://github.com/ClickHouse/ClickHouse/pull/75862)（[Azat Khuzhin](https://github.com/azat)）。
* 新增 `DatabaseBackup` 数据库引擎，可从备份中即时挂载表/数据库。[#75725](https://github.com/ClickHouse/ClickHouse/pull/75725)（[Maksim Kita](https://github.com/kitaisreal)）。
* 在 Postgres wire 协议中支持预处理语句（prepared statements）。[#75035](https://github.com/ClickHouse/ClickHouse/pull/75035)（[scanhex12](https://github.com/scanhex12)）。
* 新增无需数据库层即可 ATTACH 表的能力，这对位于 Web、S3 等外部虚拟文件系统上的 MergeTree 表非常有用。[#75788](https://github.com/ClickHouse/ClickHouse/pull/75788)（[Azat Khuzhin](https://github.com/azat)）。
* 新增字符串比较函数 `compareSubstrings`，用于比较两个字符串的部分内容。示例：`SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` 表示“按字典序比较字符串 'Saxon' 和 'Anglo-Saxon' 的 6 个字节，从第一个字符串偏移量 0 开始，第二个字符串偏移量 5 开始”。[#74070](https://github.com/ClickHouse/ClickHouse/pull/74070)（[lgbo](https://github.com/lgbo-ustc)）。
* 新增函数 `initialQueryStartTime`，用于返回当前查询的开始时间。在分布式查询中，所有分片上的该值相同。[#75087](https://github.com/ClickHouse/ClickHouse/pull/75087)（[Roman Lomonosov](https://github.com/lomik)）。
* 为 MySQL 新增基于命名集合的 SSL 认证支持。修复问题 [#59111](https://github.com/ClickHouse/ClickHouse/issues/59111)。[#59452](https://github.com/ClickHouse/ClickHouse/pull/59452)（[Nikolay Degterinsky](https://github.com/evillique)）。

#### 实验性功能
* 新增设置 `enable_adaptive_memory_spill_scheduler`，允许同一查询中的多个 Grace JOIN 监控其合计内存占用，并自适应地触发向外部存储溢出，以防止 MEMORY_LIMIT_EXCEEDED。[#72728](https://github.com/ClickHouse/ClickHouse/pull/72728)（[lgbo](https://github.com/lgbo-ustc)）。
* 使新的实验性 `Kafka` 表引擎完全遵循 Keeper 功能标志。[#76004](https://github.com/ClickHouse/ClickHouse/pull/76004)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 恢复在 v24.10 中因许可问题被移除的（Intel）QPL 编解码器。[#76021](https://github.com/ClickHouse/ClickHouse/pull/76021)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 在与 HDFS 的集成中，新增对 `dfs.client.use.datanode.hostname` 配置选项的支持。[#74635](https://github.com/ClickHouse/ClickHouse/pull/74635)（[Mikhail Tiukavkin](https://github.com/freshertm)）。



#### 性能改进
* 提升从 S3 读取宽部件中整个 JSON 列的性能。通过为子列前缀反序列化添加预取、缓存已反序列化的前缀，以及对子列前缀进行并行反序列化来实现。在类似 `SELECT data FROM table` 的查询中，从 S3 读取 JSON 列的性能提升约 4 倍，在类似 `SELECT data FROM table LIMIT 10` 的查询中提升约 10 倍。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了在 `max_rows_in_join = max_bytes_in_join = 0` 时 `parallel_hash` 中不必要的竞争。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了在优化器交换 JOIN 两侧时 `ConcurrentHashJoin` 中的双重预分配问题。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149)（[Nikita Taranov](https://github.com/nickitat)）。
* 在某些 JOIN 场景中略有改进：预先计算输出行数并为其预留内存。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376)（[Alexander Gololobov](https://github.com/davenger)）。
* 对于类似 `WHERE a < b AND b < c AND c < 5` 的查询，可以推导出新的比较条件（`a < 5 AND b < 5`），以提高过滤能力。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164)（[Shichao Jin](https://github.com/jsc0218)）。
* Keeper 改进：在提交到内存存储时禁用 digest 计算以提高性能。可以通过 `keeper_server.digest_enabled_on_commit` 配置重新启用。在预处理请求时仍会计算 digest。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490)（[Antonio Andelic](https://github.com/antonio2368)）。
* 在可能的情况下，下推来自 JOIN ON 的过滤表达式。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 MergeTree 中延迟计算列和索引的大小。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 `MATERIALIZE TTL` 中重新遵循 `ttl_only_drop_parts` 设置；仅读取重新计算 TTL 所需的列，并通过将数据部分替换为空部分的方式来删除这些部分。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751)（[Andrey Zvonov](https://github.com/zvonand)）。
* 降低 plain_rewritable 元数据文件的写缓冲区大小。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758)（[Julia Kartseva](https://github.com/jkartseva)）。
* 降低某些窗口函数的内存使用量。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647)（[lgbo](https://github.com/lgbo-ustc)）。
* 同时评估 Parquet Bloom Filter 和 min/max 索引。这样才能正确支持 `x = 3 or x > 5` 且 data = [1, 2, 4, 5] 的情况。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383)（[Arthur Passos](https://github.com/arthurpassos)）。
* 传递给 `Executable` 存储的查询不再局限于单线程执行。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084)（[yawnt](https://github.com/yawnt)）。
* 在 ALTER TABLE FETCH PARTITION 中并行拉取数据部分（线程池大小由 `max_fetch_partition_thread_pool_size` 控制）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978)（[Azat Khuzhin](https://github.com/azat)）。
* 允许将使用 `indexHint` 函数的谓词移动到 `PREWHERE`。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987)（[Anton Popov](https://github.com/CurtizJ)）。



#### 改进

* 修复了对 `LowCardinality` 列内存占用大小的计算。[#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat))。
* `processors_profile_log` 表现在有一个默认配置，TTL 为 30 天。[#66139](https://github.com/ClickHouse/ClickHouse/pull/66139)（[Ilya Yatsishin](https://github.com/qoega)）。
* 允许在集群配置中为分片指定名称。[#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 将 Prometheus 远程写入响应的成功状态码从 200/OK 修改为 204/NoContent。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* 新增支持在无需重启服务器的情况下，动态重新加载 `max_remote_read_network_bandwidth_for_serve` 和 `max_remote_write_network_bandwidth_for_server`。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* 允许在创建备份时使用 blob 路径计算校验和。[#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar))。
* 为 `system.query_cache` 添加了查询 ID 列（修复 [#68205](https://github.com/ClickHouse/ClickHouse/issues/68205)）。 [#74982](https://github.com/ClickHouse/ClickHouse/pull/74982) ([NamHoaiNguyen](https://github.com/NamHoaiNguyen))。
* 现在允许使用 `KILL QUERY` 或通过超时（`max_execution_time`）自动取消 `ALTER TABLE ... FREEZE ...` 查询。[#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar))。
* 为 `groupUniqArrayArrayMap` 作为 `SimpleAggregateFunction` 提供支持。[#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* 在数据库引擎 `Iceberg` 中隐藏目录凭证设置。修复了 [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559)。[#75080](https://github.com/ClickHouse/ClickHouse/pull/75080)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `intExp2` / `intExp10`：对原本未定义的行为进行了约定：对于过小的参数返回 0，对于过大的参数返回 `18446744073709551615`，如果为 `nan` 则抛出异常。[#75312](https://github.com/ClickHouse/ClickHouse/pull/75312)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 在 `DatabaseIceberg` 中从目录配置中原生支持 `s3.endpoint`。修复 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558)。[#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 如果执行 `SYSTEM DROP REPLICA` 的用户权限不足，则不要默默失败。[#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc))。
* 添加一个 `ProfileEvent`，用于统计任意系统日志刷新失败的次数。[#75466](https://github.com/ClickHouse/ClickHouse/pull/75466)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为解密和解压操作添加检查和额外日志。[#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `parseTimeDelta` 函数中新增了对微符号（U+00B5）的支持。现在微符号（U+00B5）和希腊字母 μ（U+03BC）都可被识别为微秒的有效表示形式，使 ClickHouse 的行为与 Go 的实现保持一致（参见 [time.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) 和 [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* 将服务器端设置（`send_settings_to_client`）替换为客户端设置（`apply_settings_from_server`），用于控制客户端代码（例如解析 INSERT 数据和格式化查询输出）是否应使用服务器 `users.xml` 和用户配置文件中的设置。否则，将只使用来自客户端命令行、会话和查询的设置。注意，这仅适用于原生客户端（而非例如 HTTP），并且不适用于查询处理中大部分逻辑（这些是在服务器端执行的）。[#75478](https://github.com/ClickHouse/ClickHouse/pull/75478)（[Michael Kolupaev](https://github.com/al13n321)）。
* 改进语法错误的报错信息。此前，如果查询过大且长度超限的 token 是一个非常长的字符串字面量，用于说明原因的信息会被淹没在该超长 token 的两个示例之间。修复错误消息中对包含 UTF-8 的查询截断不正确的问题。修复查询片段被过度加引号的问题。修复了 [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473)。[#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在存储 `S3(Azure)Queue` 中添加性能事件（profile events）。[#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为兼容性起见，禁用从服务器向客户端发送设置（`send_settings_to_client=false`）（该功能稍后将作为客户端设置重新实现，以提升易用性）。 [#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321)).
* 添加配置项 `memory_worker_correct_memory_tracker`，以启用通过后台线程定期读取的多种来源信息来校正内部内存跟踪器。[#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* 将列 `normalized_query_hash` 添加到 `system.processes` 中。注意：虽然可以通过 `normalizedQueryHash` 函数轻松按需计算该值，但这项变更是为后续修改做准备所必需的。[#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 即使存在基于已删除数据库创建的 `Merge` 表，查询 `system.tables` 也不会抛出异常。移除 `Hive` 表中的 `getTotalRows` 方法，因为我们不允许它执行复杂操作。[#75772](https://github.com/ClickHouse/ClickHouse/pull/75772)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以微秒精度存储备份的 start&#95;time/end&#95;time。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* 新增 `MemoryTrackingUncorrected` 指标，用于显示未经过 RSS 校正的内部全局内存跟踪器的值。[#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368)).
* 允许在 `PostgreSQL` 或 `MySQL` 表函数中解析类似 `localhost:1234/handle` 的端点。修复了在 [https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) 中引入的回归。[#75944](https://github.com/ClickHouse/ClickHouse/pull/75944)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 新增服务器端设置 `throw_on_unknown_workload`，用于配置在查询中将 `workload` 设置为未知值时的行为：可以选择允许无限制访问（默认），或抛出 `RESOURCE_ACCESS_DENIED` 错误。该设置可用于强制所有查询都使用 workload 调度。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa)).
* 如非必要，不要在 `ARRAY JOIN` 中将子列改写为 `getSubcolumn`。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* 在加载表时对协调错误进行重试。 [#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 在 `SYSTEM FLUSH LOGS` 中支持单独刷新某个日志。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* 改进了 `/binary` 服务器页面。使用 Hilbert 曲线替代 Morton 曲线。在正方形中显示 512 MB 地址，从而更充分地填充正方形（在之前的版本中，地址只填充了正方形的一半）。为更接近库名称而非函数名称的地址着色。允许在区域之外额外滚动一些。 [#76192](https://github.com/ClickHouse/ClickHouse/pull/76192) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在出现 TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES 错误时重试 ON CLUSTER 查询。[#76352](https://github.com/ClickHouse/ClickHouse/pull/76352)（[Patrick Galbraith](https://github.com/CaptTofu)）。
* 添加 `CPUOverload` 异步指标，用于计算服务器的相对 CPU 不足。[#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 将 `output_format_pretty_max_rows` 的默认值从 10000 修改为 1000。我认为这在易用性方面更好。[#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov))。





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 修复在查询解释阶段出现异常时，未按自定义格式输出异常的信息。此前版本中，异常始终使用默认格式输出，而不是使用查询中指定的格式。此更改关闭了 [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422)。[#74994](https://github.com/ClickHouse/ClickHouse/pull/74994)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 SQLite 的类型映射（将整数类型映射为 `int64`，浮点类型映射为 `float64`）。[#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x))。
* 修复父作用域中的标识符解析问题。允许在 `WITH` 子句中为表达式使用别名。修复 [#58994](https://github.com/ClickHouse/ClickHouse/issues/58994)。修复 [#62946](https://github.com/ClickHouse/ClickHouse/issues/62946)。修复 [#63239](https://github.com/ClickHouse/ClickHouse/issues/63239)。修复 [#65233](https://github.com/ClickHouse/ClickHouse/issues/65233)。修复 [#71659](https://github.com/ClickHouse/ClickHouse/issues/71659)。修复 [#71828](https://github.com/ClickHouse/ClickHouse/issues/71828)。修复 [#68749](https://github.com/ClickHouse/ClickHouse/issues/68749)。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 `negate` 函数的单调性问题。在之前的版本中，查询 `select * from a where -x = -42;`（其中 `x` 是主键）可能会返回错误结果。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复 `arrayIntersect` 中对空元组的处理。这修复了 [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578)。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 修复读取 JSON 子对象子列时前缀不正确的问题。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* 为客户端与服务端通信正确传递 `Native` 格式设置。[#73924](https://github.com/ClickHouse/ClickHouse/pull/73924)（[Pavel Kruglov](https://github.com/Avogar)）。
* 检查某些存储中不支持的类型。[#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 macOS 上通过 PostgreSQL 接口执行 `INSERT INTO SELECT` 查询时发生的崩溃（问题 [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* 修复了复制度数据库中未初始化的 `max_log_ptr`。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov)).
* 修复在插入 interval 时发生的崩溃（问题 [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 修复格式化常量 JSON 字面量时的问题。此前在将查询发送到另一台服务器时，可能会导致语法错误。[#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 在启用隐式投影时，修复了在使用常量分区表达式时出错的 `CREATE` 查询。修复了 [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596)。[#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird))。
* 避免在 `INSERT` 操作因异常结束后将连接置于损坏状态。[#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 避免重用处于中间状态的连接。[#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat))。
* 修复在解析 JSON 类型声明时，当类型名不是全大写时导致的崩溃。[#74784](https://github.com/ClickHouse/ClickHouse/pull/74784)（[Pavel Kruglov](https://github.com/Avogar)）。
* Keeper：修复在连接尚未建立前就被终止时出现的 `LOGICAL_ERROR`。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了一个问题：当存在使用 `AzureBlobStorage` 的表时，服务器无法启动。现在可以在不向 Azure 发送任何请求的情况下加载这些表。[#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* 修复在 BACKUP 和 RESTORE 操作的 `query_log` 中缺失的 `used_privileges` 和 `missing_privileges` 字段。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* 如果在执行 HDFS `select` 请求期间出现 `sasl` 错误，则刷新 HDFS `krb` 票据。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* 修复在 `startup_scripts` 中对 `Replicated` 数据库的查询。[#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat))。
* 修复在 `JOIN ON` 子句中使用类型别名的表达式在进行空安全比较时出现的问题。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在移除操作失败时，将 part 的状态从 deleting 还原为 outdated。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 在之前的版本中，当存在标量子查询时，我们会在数据格式初始化阶段就开始写入进度（由处理子查询累积而来），而这一步发生在写入 HTTP 头之前。这样会导致 HTTP 头丢失，例如 X-ClickHouse-QueryId、X-ClickHouse-Format 以及 Content-Type。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在 `database_replicated_allow_replicated_engine_arguments=0` 时执行的 `CREATE TABLE AS...` 查询。[#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在发生 INSERT 异常后客户端连接被置于错误状态的问题。[#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* 修复由于 PSQL 复制中的未捕获异常导致的崩溃。[#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* Sasl 可能会导致任意 rpc 调用失败，此修复可以在 krb5 ticket 过期时重试该调用。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* 修复了在启用 `optimize_function_to_subcolumns` 设置时，对 `Array`、`Map` 和 `Nullable(..)` 列使用索引（主索引和二级索引）的方式。此前，这些列的索引可能会被忽略。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 在使用内部表创建物化视图时禁用 `flatten_nested`，因为无法使用这种扁平化后的列。[#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm))。
* 修复了一些 IPv6 地址（例如 ::ffff:1.1.1.1）在 `forwarded_for` 字段中被错误解析，从而导致客户端因抛出异常而断开连接的问题。[#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 修复了针对 LowCardinality 可空数据类型的 nullsafe JOIN 行为。此前，带有 nullsafe 比较的 JOIN ON（例如 `IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b`）在处理 LowCardinality 列时无法正常工作。[#75143](https://github.com/ClickHouse/ClickHouse/pull/75143)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 检查在为 `NumRowsCache` 统计 `total_number_of_rows` 时不会设置 `key_condition`。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 使用新的分析器修复包含未使用插值的查询。[#75173](https://github.com/ClickHouse/ClickHouse/pull/75173)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 修复了在 `INSERT` 中使用 CTE 时导致崩溃的错误。[#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper 修复：在回滚日志时避免写入损坏的变更日志。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 在合适的情况下使用 `BFloat16` 作为超类型。相关议题：[#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复在启用 `any_join_distinct_right_table_keys` 且 `JOIN ON` 条件中包含 `OR` 时，连接结果中意外出现默认值的问题。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 对 azureblobstorage 表引擎的凭据进行掩码处理。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* 修复了 ClickHouse 在对 PostgreSQL、MySQL 或 SQLite 等外部数据库执行过滤下推时可能出现的错误行为。关联问题：[#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复了在以 Protobuf 格式输出时并行执行查询 `SYSTEM DROP FORMAT SCHEMA CACHE` 时可能发生的 Protobuf 模式缓存崩溃问题。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用并行副本时，将 `HAVING` 子句中的过滤条件下推可能导致的逻辑错误或未初始化内存问题。[#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 为 `icebergS3`、`icebergAzure` 表函数和表引擎隐藏敏感信息。[#75378](https://github.com/ClickHouse/ClickHouse/pull/75378)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 现在可以正确处理使用计算得出的空裁剪字符的 `TRIM` 函数。示例：`SELECT TRIM(LEADING concat('') FROM 'foo')`（问题 [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* 修复 `IOutputFormat` 中的数据竞态。 [#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在分布式表上执行 `JOIN` 时，使用 `Array` 类型的 JSON 子列可能导致的错误：`Elements ... and ... of Nested data structure ... (Array columns) have different array sizes`。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复使用 `CODEC(ZSTD, DoubleDelta)` 时出现的数据损坏问题。关闭 [#70031](https://github.com/ClickHouse/ClickHouse/issues/70031)。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `allow_feature_tier` 与 `compatibility` mergetree 设置之间的交互问题。[#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在文件被重试时 `system.s3queue_log` 中错误的 `processed_rows` 值。[#75666](https://github.com/ClickHouse/ClickHouse/pull/75666)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 当物化视图向 URL 引擎写入且出现连接问题时，遵循 `materialized_views_ignore_errors` 设置。[#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm))。
* 修复了在对不同类型的列多次执行异步 `RENAME` 查询（`alter_sync = 0`）后，从 `MergeTree` 表读取数据时可能发生的罕见崩溃问题。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 修复某些使用 `UNION ALL` 的查询中出现的 `Block structure mismatch in QueryPipeline stream` 错误。[#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在对其主键列执行 `ALTER MODIFY` 时重建投影。此前，在修改用于投影主键的列后执行 `SELECT`，可能会导致 `CANNOT_READ_ALL_DATA` 错误。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用 analyzer 时，标量子查询的 `ARRAY JOIN` 返回结果不正确的问题。 [#75732](https://github.com/ClickHouse/ClickHouse/pull/75732) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复了 `DistinctSortedStreamTransform` 中的空指针解引用问题。[#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat))。
* 修复 `allow_suspicious_ttl_expressions` 的行为。[#75771](https://github.com/ClickHouse/ClickHouse/pull/75771)（[Aleksei Filatov](https://github.com/aalexfvk)）。
* 修复函数 `translate` 中未初始化内存读的问题。此更改关闭了 [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592)。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 Native 格式中将格式设置传播到 JSON，用于字符串格式化。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* 在设置变更历史中记录了在 v24.12 中默认启用并行哈希作为 `JOIN` 算法的改动。这意味着，如果配置了低于 v24.12 的旧兼容性级别，ClickHouse 将继续使用非并行哈希进行联接。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复了一个错误：具有隐式添加的 min-max 索引的表无法复制到新表中（问题 [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` 允许从文件系统中打开任意库，因此只有在隔离环境中运行时才是安全的。为防止其在靠近 clickhouse-server 运行时出现漏洞，我们将把库路径限制到配置中指定的位置。此漏洞由 **Arseniy Dugin** 通过 [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) 发现。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 我们曾经对某些元数据使用了 JSON 序列化，这是一个错误，因为 JSON 不支持在字符串字面量中包含二进制数据（包括零字节）。SQL 查询可以包含二进制数据和无效的 UTF-8，因此我们在元数据文件中也必须支持这一点。与此同时，ClickHouse 的 `JSONEachRow` 以及类似格式通过在二进制数据的完美往返这一点上优先保障，而有意偏离 JSON 标准，从而规避了这个问题。参见此处的动机说明：[https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解决方案是让 `Poco::JSON` 库与 ClickHouse 中 JSON 格式的序列化行为保持一致。此更改关闭了 [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668)。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复存储 `S3Queue` 中提交限制检查的逻辑。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复附加带自动索引（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）的 MergeTree 表时的问题。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* 修复了作业父线程的堆栈跟踪（受 `enable_job_stack_trace` 设置控制）未被打印的问题。修复了 `enable_job_stack_trace` 设置未正确传递到各线程的问题，该问题导致生成的堆栈跟踪内容不总是遵循此设置。[#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 修复权限检查错误，其中 `ALTER RENAME` 被错误地要求具备 `CREATE USER` 权限。修复自 [#74372](https://github.com/ClickHouse/ClickHouse/issues/74372)。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* 修复在大端架构上将 `FixedString` 使用 `reinterpretAs` 进行重解释时的问题。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* 修复 S3Queue 中的逻辑错误：“Expected current processor {} to be equal to {} for bucket {}”。[#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复在 `Memory` 数据库上执行 `ALTER` 时出现的死锁问题。[#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* 修复当 `WHERE` 条件中包含 `pointInPolygon` 函数时，索引分析中的逻辑错误。[#76360](https://github.com/ClickHouse/ClickHouse/pull/76360)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复信号处理程序中可能不安全的调用。[#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 修复 `PartsSplitter` 中对反向键（reverse key）的支持，解决了 [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400)。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### 构建/测试/打包改进

- 支持在 ARM 和 Intel Mac 上构建 HDFS。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
- 为 Darwin 交叉编译时启用 ICU 和 GRPC。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
- 更新至嵌入式 LLVM 19。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- 在 Docker 镜像中禁用 default 用户的网络访问。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。将所有 clickhouse-server 相关操作封装为函数,并仅在 `entrypoint.sh` 中启动默认二进制文件时执行。这项长期推迟的改进建议最初在 [#50724](https://github.com/ClickHouse/ClickHouse/issues/50724) 中提出。为 `clickhouse-extract-from-config` 添加了 `--users` 开关,用于从 `users.xml` 获取值。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 从二进制文件中移除约 20MB 的冗余代码。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouse 版本 25.1,2025-01-28 {#251}


#### 向后不兼容的变更
* `JSONEachRowWithProgress` 会在每次有进度时立即写出进度。在此前的版本中，进度只会在每个结果块之后显示，这使其几乎没有用。调整进度展示方式：不再显示为零的值。解决了 [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800)。[#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` 表将通过对底层表的列做并集并推导公共类型来统一其结构。解决了 [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864)。在某些情况下，此变更可能是向后不兼容的。比如，表之间不存在公共类型，但仍然可以转换为第一个表的类型，例如 `UInt64` 和 `Int64`，或者任意数值类型与 `String`。如果你想恢复旧行为，将 `merge_table_max_tables_to_look_for_schema_inference` 设置为 `1`，或者将 `compatibility` 设置为 `24.12` 或更早版本。[#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 输出格式会将 `Date` 和 `DateTime` 列转换为 Parquet 支持的日期/时间类型，而不是将其作为原始数字写出。`DateTime` 变为 `DateTime64(3)`（之前为：`UInt32`）；通过设置 `output_format_parquet_datetime_as_uint32` 可以恢复旧行为。`Date` 变为 `Date32`（之前为：`UInt16`）。[#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* 默认情况下，不再允许在 `ORDER BY` 和比较函数 `less/greater/equal/etc` 中使用不可比较类型（如 `JSON`/`Object`/`AggregateFunction`）。[#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 过时的 `MaterializedMySQL` 数据库引擎已被移除，不再可用。[#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` 字典源不再执行 `SHOW TABLE STATUS` 查询，因为它对 InnoDB 表以及任何较新的 MySQL 版本都没有提供任何有价值的信息。解决了 [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636)。此变更是向后兼容的，但仍然归入此类别，以便你能注意到它。[#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` 查询现在需要单独的 `CHECK` 权限。在之前的版本中，只要拥有 `SHOW TABLES` 权限就可以执行这些查询。但 `CHECK TABLE` 查询可能非常重，并且针对 `SELECT` 查询的常规查询复杂度限制并不适用于它，这带来了潜在的 DoS 风险。[#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 函数 `h3ToGeo()` 现在按 `(lat, lon)` 的顺序返回结果（这是几何函数的标准顺序）。希望保留旧结果顺序 `(lon, lat)` 的用户可以将设置 `h3togeo_lon_lat_result_order` 设为 `true`。[#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新的 MongoDB 驱动程序现在是默认驱动程序。希望继续使用旧驱动的用户可以将服务端设置 `use_legacy_mongodb_integration` 设为 `true`。[#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。



#### 新功能

* 新增支持在提交 `SELECT` 查询后，在执行期间立即应用尚未完成（尚未由后台进程物化）的 mutation。可通过设置 `apply_mutations_on_fly` 来启用该功能。[#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* 在 Iceberg 中为与时间相关的分区转换操作实现 `Iceberg` 表的分区裁剪。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik)).
* 在 MergeTree 排序键和跳过索引中增加对子列的支持。 [#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* 支持从 `Apache Arrow`/`Parquet`/`ORC` 中读取 `HALF_FLOAT` 值（会读取为 `Float32`）。修复了 [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960)。请注意，IEEE-754 half float 与 `BFloat16` 并不相同。修复了 [#73835](https://github.com/ClickHouse/ClickHouse/issues/73835)。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` 表中将新增两个列：`symbols` 和 `lines`，用于存储符号化后的堆栈跟踪。这样可以更方便地收集和导出性能剖析信息。该行为由服务器配置中 `trace_log` 下的 `symbolize` 参数控制，默认启用。[#73896](https://github.com/ClickHouse/ClickHouse/pull/73896)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增函数 `generateSerialID`，可用于在表中生成自增数值。承接由 [kazalika](https://github.com/kazalika) 发起的 [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) 工作，解决了 [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485)。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 DDL 查询添加语法 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN`。这意味着子查询 `{query1, query2, ... queryN}` 可以彼此并行运行（并且推荐这样使用）。[#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar))。
* 为反序列化后的 skipping 索引 granule 新增了内存缓存。这应当能加速重复使用 skipping 索引的查询。新缓存的大小由服务器设置 `skipping_index_cache_size` 和 `skipping_index_cache_max_entries` 控制。引入该缓存的最初动机是向量相似性索引，它们现在快了许多。[#70102](https://github.com/ClickHouse/ClickHouse/pull/70102) ([Robert Schulze](https://github.com/rschu1ze))。
* 现在，嵌入式 Web UI 在查询运行期间拥有进度条，并支持取消查询。它会显示记录总数以及更详细的速度信息。表格可以在数据一到达时就进行增量渲染。启用 HTTP 压缩后，表格渲染速度更快。表头变为固定。现在可以选择单元格，并通过方向键在单元格之间导航。修复了选中单元格的轮廓导致其变小的问题。单元格在鼠标悬停时不再展开，而只会在被选中时展开。停止渲染传入数据的时机现在由客户端而非服务器端决定。为数字高亮显示数字分组。整体设计进行了更新，视觉上更为醒目。它会检查服务器是否可达、凭据是否正确，并显示服务器版本与运行时间。云图标在所有字体中均为描边样式，即使在 Safari 中也是如此。嵌套数据类型中的大整数将得到更好的渲染。可以正确显示 inf/nan。在鼠标悬停在列标题上时会显示数据类型。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 通过设置 `add_minmax_index_for_numeric_columns`（针对数值列）和 `add_minmax_index_for_string_columns`（针对字符串列），为由 MergeTree 管理的列新增默认创建 min-max（skipping）索引的功能。目前，这两个设置均为禁用状态，因此尚未产生任何行为变更。[#74266](https://github.com/ClickHouse/ClickHouse/pull/74266) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 将 `script_query_number` 和 `script_line_number` 字段添加到 `system.query_log`、原生协议中的 ClientInfo，以及服务器日志中。此更改解决了 [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542)。感谢 [pinsvin00](https://github.com/pinsvin00) 早前在 [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) 中推动该特性。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增聚合函数 `sequenceMatchEvents`，用于在给定模式中返回其最长事件链中已匹配事件的时间戳。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus)).
* 新增了函数 `arrayNormalizedGini`。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl)).
* 为 `DateTime64` 添加减法运算符支持，允许在 `DateTime64` 值之间以及与 `DateTime` 之间进行相减。[#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg)).



#### 实验性功能
* `BFloat16` 数据类型已准备好用于生产环境。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### 性能提升

* 优化了函数 `indexHint`。现在，仅作为函数 `indexHint` 参数使用的列不会从表中读取。[#74314](https://github.com/ClickHouse/ClickHouse/pull/74314) ([Anton Popov](https://github.com/CurtizJ))。如果 `indexHint` 函数是你企业数据架构中的核心组件，这项优化将会“拯救你的生命”。
* 对 `parallel_hash` JOIN 算法中的 `max_joined_block_size_rows` 设置进行更精确的处理，有助于避免与 `hash` 算法相比出现更高的内存消耗。[#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* 在查询计划层面为 `MergingAggregated` 步骤支持谓词下推优化，从而提升了某些使用 analyzer 的查询的性能。[#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在 `parallel_hash` JOIN 算法的探测阶段中，已移除对左表数据块按哈希拆分的操作。[#73089](https://github.com/ClickHouse/ClickHouse/pull/73089)（[Nikita Taranov](https://github.com/nickitat)）。
* 优化 `RowBinary` 输入格式。修复 [#63805](https://github.com/ClickHouse/ClickHouse/issues/63805)。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* 如果启用了 `optimize_on_insert`，则将分片写入为 level 1。这样可以在针对新近写入分片、并带有 `FINAL` 的查询中使用多种优化。[#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* 通过底层优化加速字符串反序列化。[#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* 在对记录进行相等性比较时（例如在执行合并时），应优先从最有可能不相等的列开始比较行。[#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus))。
* 通过按键对右侧连接表重新排序，以提升 Grace 哈希连接性能。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* 允许 `arrayROCAUC` 和 `arrayAUCPR` 计算整条曲线的局部面积，从而可以在超大数据集上对其计算进行并行化。[#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias))。
* 避免生成过多空闲线程。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* 如果在表函数中只使用花括号展开，则不要枚举 blob 存储键。修复 [#73333](https://github.com/ClickHouse/ClickHouse/issues/73333)。[#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 对在 `Nullable` 参数上执行的函数进行短路优化。[#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li))。
* 不要在非函数列上应用 `maskedExecute`，并提升短路执行的性能。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* 在 `Kafka`/`NATS`/`RabbitMQ`/`FileLog` 输入格式中禁用对 header 的自动检测以提升性能。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat)).
* 在使用 `GROUPING SETS` 进行聚合后，以更高并行度执行管线。[#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat))。
* 缩小 `MergeTreeReadPool` 中的临界区。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* 并行副本性能优化：对于与并行副本协议无关的数据包，其在查询发起端的反序列化现在始终在 pipeline 线程中进行。此前，这些操作可能在负责 pipeline 调度的线程中执行，从而降低发起端的响应能力并延迟 pipeline 的执行。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter)).
* 提升 Keeper 中大规模多请求操作的性能。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* 按值使用日志包装器，不要在堆上进行分配。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在后台重新建立到 MySQL 和 Postgres 字典副本的连接，以避免阻塞对相应字典的请求。[#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 并行副本会利用关于副本可用性的历史信息来改进副本选择，但在连接不可用时不会更新该副本的错误计数。此 PR 在副本不可用时会更新其错误计数。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi))。
* 新增了一个 MergeTree 设置项 `materialize_skip_indexes_on_merge`，用于在合并过程中抑制创建 skip 索引。这样用户就可以显式控制（通过 `ALTER TABLE [..] MATERIALIZE INDEX [...]`）何时创建 skip 索引。如果构建 skip 索引的开销较大（例如向量相似度索引），这一功能会非常有用。[#74401](https://github.com/ClickHouse/ClickHouse/pull/74401)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 Storage(S3/Azure)Queue 中优化 Keeper 请求。[#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 默认情况下最多使用 `1000` 个并行副本。[#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 改进从 S3 磁盘读取时的 HTTP 会话复用（[#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)）。[#74548](https://github.com/ClickHouse/ClickHouse/pull/74548)（[Julian Maicher](https://github.com/jmaicher)）。





#### 改进

* 在带有隐式 `ENGINE` 的 `CREATE TABLE` 查询中支持使用 `SETTINGS`，并支持同时使用引擎设置和查询设置。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano)).
* 默认启用 `use_hive_partitioning`。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 支持在具有不同参数的 JSON 类型之间执行 `CAST` 和 `ALTER` 操作。 [#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar)).
* 支持对 JSON 列的值进行相等比较。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar)).
* 改进带有 JSON 子列的标识符格式，避免使用不必要的反引号。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* 交互式指标改进。修复来自并行副本的指标未被完整显示的问题。按最近一次更新时间对指标排序，然后再按名称的字典序排序。不显示已失效的指标。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631) ([Julia Kartseva](https://github.com/jkartseva)).
* 默认将 JSON 输出格式美化。新增设置 `output_format_json_pretty_print` 用于控制该行为，且默认启用。[#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar))。
* 默认允许使用 `LowCardinality(UUID)`。这在 ClickHouse Cloud 客户中已被证明是行之有效的。[#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 改进了安装过程中的提示信息。 [#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进 ClickHouse Cloud 的密码重置消息提示。[#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进在 `File` 表无法向文件追加数据时的错误消息。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 当用户在终端中不小心请求输出二进制格式（例如 `Native`、`Parquet`、`Avro`）时，增加确认提示。此更改关闭了 [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524)。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在终端中以 Pretty 和 Vertical 格式展示结果时高亮显示行尾空格，以提升可读性。该行为由设置 `output_format_pretty_highlight_trailing_spaces` 控制。最初由 [Braden Burns](https://github.com/bradenburns) 在 [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) 中实现。修复了问题 [#71590](https://github.com/ClickHouse/ClickHouse/issues/71590)。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当 `stdin` 从文件重定向时，`clickhouse-client` 和 `clickhouse-local` 会自动检测其压缩格式。此更改解决了 [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865)。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 默认在 pretty 格式中截断过长的列名。此行为由 `output_format_pretty_max_column_name_width_cut_to` 和 `output_format_pretty_max_column_name_width_min_chars_to_cut` 设置控制。这是对 [tanmaydatta](https://github.com/tanmaydatta) 在 [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) 中所做工作的延续。本更改关闭了 [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968)。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 让 `Pretty` 格式显示得更美观：如果距离上一个块输出的时间不长，则将多个块压缩（合并）在一起。这由新的设置 `output_format_pretty_squash_consecutive_ms`（默认 50 ms）和 `output_format_pretty_squash_max_wait_ms`（默认 1000 ms）控制。是对 [#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) 的后续改进。此更改关闭了 [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153)。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增一个用于统计当前正在合并的源数据部分数量的指标。此更改关闭了 [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809)。[#73868](https://github.com/ClickHouse/ClickHouse/pull/73868)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 如果输出到终端，则在 `Vertical` 格式中高亮显示列。可以通过 `output_format_pretty_color` 设置禁用此行为。[#73898](https://github.com/ClickHouse/ClickHouse/pull/73898) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 已增强 MySQL 兼容性到这样的程度：现在 `mysqlsh`（Oracle 提供的功能完善的 MySQL CLI）可以连接到 ClickHouse。这是为了便于测试所需的。[#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 漂亮格式可以在表格单元格内渲染多行字段，从而提高可读性。此功能默认启用，并且可以通过设置 `output_format_pretty_multiline_fields` 进行控制。这是对 [Volodyachan](https://github.com/Volodyachan) 在 [#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) 中工作的进一步完善。该更改解决了 [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912)。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在浏览器中将 `X-ClickHouse` HTTP 头部暴露给 JavaScript，使编写应用程序更加方便。[#74180](https://github.com/ClickHouse/ClickHouse/pull/74180)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JSONEachRowWithProgress` 格式现在会包含带有元数据的事件，以及 totals 和 extremes。同时还会包含 `rows_before_limit_at_least` 和 `rows_before_aggregation` 字段。如果在部分结果之后收到异常，该格式会正确输出异常。进度信息现在包含已耗费的纳秒数。结束时会发出一个最终进度事件。查询运行期间的进度输出频率不会高于 `interactive_delay` 设置的值。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 沙漏会在 Play UI 中平滑旋转。[#74182](https://github.com/ClickHouse/ClickHouse/pull/74182)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 即使 HTTP 响应已被压缩，也要在数据包一到达时立即发送。这样浏览器就能按进度接收数据包和压缩数据。[#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 如果输出记录的数量大于 N = `output_format_pretty_max_rows`，我们不会只显示前 N 行，而是会将输出表从中间截断，仅显示前 N/2 行和最后 N/2 行。延续了 [#64200](https://github.com/ClickHouse/ClickHouse/issues/64200)。这将关闭 [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502)。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在启用 `hash join` 算法时，允许使用更通用的 join 规划算法。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 允许在数据类型为 `DateTime64` 的列上创建 `bloom_filter` 索引。[#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean))。
* 当同时启用 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 时，数据分块合并将忽略最大字节数限制。 [#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu)).
* 为 OpenTelemetry span 日志表添加了 HTTP 头部，以增强可追踪性。[#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* 支持按自定义时区写入 `orc` 文件，而不再总是使用 `GMT` 时区。[#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou))。
* 在跨云备份写入时遵循 IO 调度设置。[#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 为 `system.asynchronous_metrics` 表中的 `metric` 列添加别名 `name`。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 过去由于某些原因，`ALTER TABLE MOVE PARTITION TO TABLE` 查询检查的是 `SELECT` 和 `ALTER DELETE` 权限，而不是专用的 `ALTER_MOVE_PARTITION` 权限。此 PR 开始使用这一访问类型。为保持兼容性，如果已授予 `SELECT` 和 `ALTER DELETE`，则仍会隐式授予此权限，但这种行为将在未来版本中移除。修复 [#16403](https://github.com/ClickHouse/ClickHouse/issues/16403)。[#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* 在尝试物化排序键中的列时抛出异常，而不是允许其破坏排序顺序。[#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48))。
* 在 `EXPLAIN QUERY TREE` 中隐藏敏感信息。[#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 “native” 读取器中支持 Parquet 整数逻辑类型。[#72105](https://github.com/ClickHouse/ClickHouse/pull/72105)（[Arthur Passos](https://github.com/arthurpassos)）。
* 如果默认用户需要密码，则在浏览器中交互式地请求输入凭证。在早期版本中，服务器返回 HTTP 403；现在返回 HTTP 401。[#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 将访问类型 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` 从全局改为参数化。这意味着用户现在可以更精细地授予访问管理相关的权限：[ #72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit))。
* 将 `latest_fail_error_code_name` 列添加到 `system.mutations` 中。我们需要通过该列引入一个用于检测卡住的 mutation 的新指标，并用它来构建云环境中所遇错误的可视化图表，同时（可选地）添加一个噪声更小的新告警。[#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 减少 `ATTACH PARTITION` 查询中的内存分配。[#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* 使 `max_bytes_before_external_sort` 的限制取决于查询的总内存消耗（之前它表示的是单个排序线程中排序块的字节数，现在它与 `max_bytes_before_external_group_by` 含义相同——是针对所有线程、整个查询的总内存限制）。另外新增了一个用于控制磁盘上块大小的设置——`min_external_sort_block_bytes`。[#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat)).
* 忽略 trace 采集器的内存限制。[#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* 将服务器设置 `dictionaries_lazy_load` 和 `wait_dictionaries_load_at_startup` 添加到 `system.server_settings`。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm)).
* 将设置 `max_backup_bandwidth` 添加到可在 `BACKUP`/`RESTORE` 查询中指定的设置列表中。[#72665](https://github.com/ClickHouse/ClickHouse/pull/72665)（[Christoph Wurm](https://github.com/cwurm)）。
* 降低 `ReplicatedMergeTree` 引擎中新出现副本分片的日志级别，从而有助于减少在副本集群中生成的日志量。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 改进在析取（disjunction）中提取公共表达式的能力。即使所有析取项之间没有共同子表达式，也允许对最终过滤表达式进行简化。延续 [#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) 的工作。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271) ([Dmitry Novik](https://github.com/novikd))。
* 在 `S3Queue`/`AzureQueue` 存储中，现在允许为创建时未指定 `settings` 的表补充添加 `settings`。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 引入设置项 `least_greatest_legacy_null_behavior`（默认值：`false`），用于控制函数 `least` 和 `greatest` 在处理 `NULL` 参数时，是无条件返回 `NULL`（为 `true` 时），还是忽略这些参数（为 `false` 时）。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 ObjectStorageQueueMetadata 的清理线程中使用 Keeper 的多请求功能。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* 当 ClickHouse 在 `cgroup` 中运行时，我们仍然会收集与系统负载、进程调度、内存等相关的全局异步指标。当 ClickHouse 是宿主机上唯一一个高资源消耗的进程时，这些指标可能会提供有用的信号。 [#73369](https://github.com/ClickHouse/ClickHouse/pull/73369) ([Nikita Taranov](https://github.com/nickitat))。
* 在 `S3Queue` 存储中，允许将 24.6 之前创建的旧有有序表迁移到带有桶（bucket）的新结构。[#73467](https://github.com/ClickHouse/ClickHouse/pull/73467)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 新增 `system.azure_queue`，类似于现有的 `system.s3queue`。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 函数 `parseDateTime64`（及其变体）现在对 1970 年之前和 2106 年之后的输入日期也能返回正确结果。示例：`SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar))。
* 解决了一些用户反馈的 `clickhouse-disks` 可用性问题。修复了 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136)。[#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* 允许在存储 S3(Azure)Queue 中修改提交设置（提交设置包括：`max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit`）。 [#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `storage S3(Azure)Queue` 中在各个 source 之间聚合进度，以便与提交限制设置进行比较。[#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `BACKUP`/`RESTORE` 查询中支持核心配置。[#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar))。
* 在 Parquet 输出中考虑 `output_format_compression_level` 设置。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos))。
* 将 Apache Arrow 的 `fixed_size_list` 读取为 `Array`，而不再将其视为不支持的类型。[#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers))。
* 添加了两个备份引擎：`Memory`（在当前用户会话内保存备份）和 `Null`（不在任何地方保存备份），供测试使用。[#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar))。
* `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_num_ratio_to_cores` 现在可以在无需重启服务器的情况下修改。[#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* 在 `formatReadable` 函数中新增对扩展数值类型（`Decimal`、大整数）的支持。[#73765](https://github.com/ClickHouse/ClickHouse/pull/73765)（[Raúl Marín](https://github.com/Algunenano)）。
* 为 PostgreSQL 线协议兼容性提供 TLS 支持。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 函数 `isIPv4String` 在正确的 IPv4 地址后面紧跟一个零字节时会返回 true，而在这种情况下它本应返回 false。[#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) 的后续修复。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使 MySQL 线路协议中的错误码与 MySQL 保持兼容。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) 的后续工作。修复 [#50957](https://github.com/ClickHouse/ClickHouse/issues/50957)。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加设置 `validate_enum_literals_in_opearators`，用于在 `IN`、`NOT IN` 等运算符中校验枚举字面量是否符合枚举类型，如果字面量不是有效的枚举值则抛出异常。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在存储 `S3(Azure)Queue` 中，将一个提交设置定义的单个批次内的所有文件在同一个 keeper 事务中提交。[#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 为可执行 UDF 和字典禁用表头检测（可能导致 Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* 为 `EXPLAIN PLAN` 添加 `distributed` 选项。现在，`EXPLAIN distributed=1 ...` 会在 `ReadFromParallelRemote*` 步骤后附加远程执行计划。[#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 为带有 Dynamic 参数的 not/xor 使用正确的返回类型。[#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar))。
* 允许在创建表之后修改 `add_implicit_sign_column_constraint_for_collapsing_engine`。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm)).
* 在物化视图的 `SELECT` 查询中支持子列。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar))。
* 现在可以通过三种简单方式在 `clickhouse-client` 中设置自定义提示符：1. 使用命令行参数 `--prompt`；2. 在配置文件中通过设置 `<prompt>[...]</prompt>`；3. 仍在配置文件中，通过每个连接的设置 `<connections_credentials><prompt>[...]</prompt></connection_credentials>`。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168) ([Christoph Wurm](https://github.com/cwurm))。
* 在 ClickHouse Client 中，通过连接到端口 9440 自动检测安全连接。[#74212](https://github.com/ClickHouse/ClickHouse/pull/74212)（[Christoph Wurm](https://github.com/cwurm)）。
* 为 `http_handlers` 启用仅凭用户名进行用户身份验证（之前还要求用户提供密码）。 [#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat)).
* 对替代查询语言 PRQL 和 KQL 的支持已标记为实验性。要使用它们，请将设置 `allow_experimental_prql_dialect = 1` 和 `allow_experimental_kusto_dialect = 1`。 [#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze))。
* 在更多聚合函数中支持返回默认的 `Enum` 类型。[#74272](https://github.com/ClickHouse/ClickHouse/pull/74272)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 `OPTIMIZE TABLE` 中，现在可以使用关键字 `FORCE` 作为现有关键字 `FINAL` 的替代。[#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze))。
* 添加 `IsServerShuttingDown` 指标，用于在服务器关闭耗时过长时触发告警。[#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在 EXPLAIN 中加入了 Iceberg 表名。[#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 在旧分析器中使用 RECURSIVE CTE 时提供更清晰的错误信息。[#74523](https://github.com/ClickHouse/ClickHouse/pull/74523)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 `system.errors` 中显示详细错误信息。[#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* 允许在客户端与 clickhouse-keeper 通信时使用密码。如果已为服务端和客户端正确配置 SSL，则此功能意义不大，但在某些场景下仍然有用。密码长度不能超过 16 个字符。它与 Keeper Auth 模型无关。[#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin))。
* 为配置重载器添加错误代码。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* 为 MySQL 和 PostgreSQL 表函数和引擎新增了对 IPv6 地址的支持。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 为 `divideDecimal` 实现短路优化，修复了 [#74280](https://github.com/ClickHouse/ClickHouse/issues/74280)。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 现在可以在启动脚本中指定用户。[#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit))。
* 添加对 Azure SAS 令牌的支持。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).





#### Bug 修复（官方稳定版本中用户可见的异常行为）

* 仅在压缩编解码器支持时才设置 Parquet 压缩级别。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos))。
* 修复了一个回归问题：使用带修饰符的排序规则区域设置时会抛出错误。例如，现在 `SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` 可以正常工作。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复无法使用 keeper-client 创建 SEQUENTIAL 节点的问题。[#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94))。
* 修复 `position` 系列函数中字符计数错误的问题。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* `RESTORE` 对访问实体的操作由于未正确处理部分权限撤销，而要求了超出实际需要的权限。此 PR 修复了该问题。关闭 [#71853](https://github.com/ClickHouse/ClickHouse/issues/71853)。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958) ([pufit](https://github.com/pufit))。
* 避免在执行 `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 后出现暂停。为后台任务调度获取正确的配置。[#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk))。
* 修复在某些输入和输出格式（例如 Parquet、Arrow）中对空元组的处理。[#72616](https://github.com/ClickHouse/ClickHouse/pull/72616) ([Michael Kolupaev](https://github.com/al13n321))。
* 现在，在通配符数据库/表上执行列级 `GRANT SELECT/INSERT` 语句会抛出错误。[#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan))。
* 修复了一种情况：由于目标访问实体中存在隐式授权，用户无法执行 `REVOKE ALL ON *.*`。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* 修复 `formatDateTime` 标量函数在正时区偏移量上的格式化问题。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* 修复在通过 PROXYv1 建立连接且已设置 `auth_use_forwarded_address` 时源端口反映错误的问题 —— 之前错误地使用了代理端口。新增 `currentQueryID()` 函数。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 `TCPHandler` 中将格式设置传递到 `NativeWriter`，从而正确应用 `output_format_native_write_json_as_string` 等设置。[#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `StorageObjectStorageQueue` 中的崩溃。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在服务器关闭期间可刷新物化视图中发生的罕见崩溃。[#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 函数 `formatDateTime` 的 `%f` 占位符现在始终生成 6 位（子秒）数字，从而使其行为与 MySQL 的 `DATE_FORMAT` 函数保持一致。可以通过设置 `formatdatetime_f_prints_scale_number_of_digits = 1` 来恢复之前的行为。[#73324](https://github.com/ClickHouse/ClickHouse/pull/73324)（[ollidraese](https://github.com/ollidraese)）。
* 修复了从 `s3` 存储和表函数读取时基于 `_etag` 列进行过滤的行为。[#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在旧分析器中，当在 `JOIN ON` 表达式中使用 `IN (subquery)` 时出现的 `Not-ready Set is passed as the second argument for function 'in'` 错误。[#73382](https://github.com/ClickHouse/ClickHouse/pull/73382)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了 Dynamic 和 JSON 列在 squash 阶段的预处理逻辑。此前在某些情况下，即使尚未达到类型/路径数量上限，新的类型仍可能被插入到 shared variant/shared data 中。[#73388](https://github.com/ClickHouse/ClickHouse/pull/73388)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在类型的二进制解码过程中检查损坏的大小字段，以避免过大的内存分配。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在启用并行副本时从单副本集群读取时出现的逻辑错误。[#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复在 ZooKeeper 和旧版 Keeper 上的 ObjectStorageQueue。[#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368))。
* 实现了启用默认 hive 分区所需的修复。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复在创建向量相似性索引时出现的数据竞争。[#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了当字典的数据源包含带有错误数据的函数时出现的段错误。[#73535](https://github.com/ClickHouse/ClickHouse/pull/73535)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复 storage S3(Azure)Queue 在插入失败时的重试机制。关闭 [#70951](https://github.com/ClickHouse/ClickHouse/issues/70951)。[#73546](https://github.com/ClickHouse/ClickHouse/pull/73546)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了函数 `tupleElement` 中的一个错误，该错误在某些情况下会出现在包含 `LowCardinality` 元素且启用了 `optimize_functions_to_subcolumns` 设置的元组中。[#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ))。
* 修复了在解析后面跟有范围 `one` 的枚举通配符时出现的问题。修复了 [#73473](https://github.com/ClickHouse/ClickHouse/issues/73473)。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了在针对非复制表的子查询中，`parallel_replicas_for_non_replicated_merge_tree` 被忽略的问题。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在任务无法被调度时抛出的 `std::logical_error` 异常的问题。在压力测试中发现。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629)（[Alexander Gololobov](https://github.com/davenger)）。
* 在 `EXPLAIN SYNTAX` 中不再解析查询，以避免在分布式查询中使用错误的处理阶段而导致逻辑错误。修复了 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205)。[#73634](https://github.com/ClickHouse/ClickHouse/pull/73634) ([Dmitry Novik](https://github.com/novikd))。
* 修复 Dynamic 列中可能出现的数据不一致问题，修正可能出现的逻辑错误 `Nested columns sizes are inconsistent with local_discriminators column size`。[#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在带有 `FINAL` 和 `SAMPLE` 的查询中出现的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复了在对 `CollapsingMergeTree` 使用 `FINAL` 的查询中产生的错误结果，并启用了对 `FINAL` 的优化。[#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在 `LIMIT BY` 子句中因列导致的崩溃。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 修复一个错误：在被强制使用普通 projection 且查询与该 projection 定义完全一致的情况下，却没有选择该 projection，导致报错的问题。[#73700](https://github.com/ClickHouse/ClickHouse/pull/73700)（[Shichao Jin](https://github.com/jsc0218)）。
* 修复 Dynamic/Object 结构的反序列化问题，该问题可能会导致 CANNOT&#95;READ&#95;ALL&#95;DATA 异常。[#73767](https://github.com/ClickHouse/ClickHouse/pull/73767)（[Pavel Kruglov](https://github.com/Avogar)）。
* 从备份恢复分片时跳过 `metadata_version.txt` 文件。[#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar))。
* 修复在对 Enum 类型进行 `CAST` 并使用 `LIKE` 时出现的段错误。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar)).
* 修复 S3 Express bucket 作为磁盘无法使用的问题。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar)).
* 允许在 CollapsingMergeTree 表中合并 sign 列值无效的行。[#73864](https://github.com/ClickHouse/ClickHouse/pull/73864)（[Christoph Wurm](https://github.com/cwurm)）。
* 修复在查询 `ddl` 时遇到离线副本会报错的问题。[#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了在可以创建未对其嵌套 `tuple` 明确命名（&#39;keys&#39;、&#39;values&#39;）的 `Map` 时，偶尔会导致无法比较 `map()` 类型的问题。[#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 在解析 `GROUP BY ALL` 子句时忽略窗口函数。修复了 [#73501](https://github.com/ClickHouse/ClickHouse/issues/73501)。[#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 修复隐式权限（之前会作为通配符生效）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* 修复在创建嵌套 `Maps` 时的高内存占用问题。[#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复解析包含空键的嵌套 JSON 的问题。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复：当一个 `alias` 被另一个 `alias` 引用且按相反顺序被选取时，可能不会被添加到 `projection` 中的问题。[#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在初始化 `plain_rewritable` 磁盘时，针对 Azure 忽略对象未找到错误。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复 `any` 和 `anyLast` 在枚举类型和空表情况下的行为。[#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* 修复了用户在 `kafka` 表引擎中使用关键字参数时的问题。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复在将 Storage `S3Queue` 的设置名在带有 &quot;s3queue&#95;&quot; 前缀和不带此前缀之间切换时出现的问题。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加设置 `allow_push_predicate_ast_for_distributed_subqueries`。这为使用 analyzer 的分布式查询增加了基于 AST 的谓词下推功能。这是一个临时解决方案，我们会使用它，直到支持带查询计划序列化的分布式查询为止。修复 [#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718)。[#74085](https://github.com/ClickHouse/ClickHouse/pull/74085)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了在 [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) 之后，`forwarded_for` 字段中可能出现端口，从而导致无法解析包含端口的主机名的问题。[#74116](https://github.com/ClickHouse/ClickHouse/pull/74116)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了 `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` 的错误格式问题。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991))。
* 修复了问题 [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112)。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 在 `CREATE TABLE` 中已无法再将 `Loop` 用作表引擎。此前这种组合会导致段错误（segfault）。[#74137](https://github.com/ClickHouse/ClickHouse/pull/74137)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复 `postgresql` 和 `sqlite` `table` 函数中的安全问题，防止 SQL 注入。[#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复从压缩的 Memory 引擎表读取子列时发生的崩溃问题。修复了 [#74009](https://github.com/ClickHouse/ClickHouse/issues/74009)。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了在查询 `system.detached_tables` 时可能出现的无限循环问题。[#74190](https://github.com/ClickHouse/ClickHouse/pull/74190)（[Konstantin Morozov](https://github.com/k-morozov)）。
* 修复在将文件标记为失败时 `s3queue` 中的逻辑错误。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复从基础备份执行 `RESTORE` 时的原生拷贝设置（`allow_s3_native_copy` / `allow_azure_native_copy`）。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* 修复了当数据库中已分离表的数量是 `max_block_size` 的整数倍时出现的问题。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov))。
* 修复通过 ObjectStorage（即 S3）进行复制时在源和目标凭证不同时的行为。[#74331](https://github.com/ClickHouse/ClickHouse/pull/74331)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在 GCS 上执行原生复制时对“在 JSON API 中使用 Rewrite 方法”的检测。[#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `BackgroundMergesAndMutationsPoolSize` 的错误计算（之前为实际值的两倍）。[#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin))。
* 修复在启用 Cluster Discovery 时导致 keeper watch 泄漏的缺陷。[#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* 修复 UBSan 报告的内存对齐问题 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。[#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在创建表期间 `KeeperMap` 的并发清理问题。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* 在存在 `EXCEPT` 或 `INTERSECT` 的情况下，为保证查询结果的正确性，不要在子查询中移除未使用的投影列。修复了 [#73930](https://github.com/ClickHouse/ClickHouse/issues/73930)。修复了 [#66465](https://github.com/ClickHouse/ClickHouse/issues/66465)。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在启用稀疏序列化时，在包含 `Tuple` 列的表之间执行的 `INSERT SELECT` 查询。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 函数 `right` 在常量负偏移量的情况下工作不正确。[#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了由于客户端解压过程存在缺陷，导致插入 gzip 压缩数据有时失败的问题。[#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7))。
* 带有通配符授权的部分撤销操作可能会移除超出预期的权限。修复了 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263)。[#74751](https://github.com/ClickHouse/ClickHouse/pull/74751)（[pufit](https://github.com/pufit)）。
* Keeper 修复：修正从磁盘读取日志记录的问题。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了对 `SYSTEM REFRESH/START/STOP VIEW` 权限检查的逻辑，现在在对特定视图执行查询时，不再需要在 `*.*` 上拥有该权限，只需对该视图本身授予相应权限即可。[#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix))。
* `hasColumnInTable` 函数目前不会处理别名列。修复它，使其同样适用于别名列。[#74841](https://github.com/ClickHouse/ClickHouse/pull/74841)（[Bharat Nallan](https://github.com/bharatnc)）。
* 修复在 Azure Blob Storage 中对包含空列的表进行数据分片合并时出现的 FILE&#95;DOESNT&#95;EXIST 错误。[#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复与临时表进行 `JOIN` 时的投影列名问题，关闭 [#68872](https://github.com/ClickHouse/ClickHouse/issues/68872)。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。



#### 构建/测试/打包改进
* 通用安装脚本现在也会在 macOS 上提示进行安装。[#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
