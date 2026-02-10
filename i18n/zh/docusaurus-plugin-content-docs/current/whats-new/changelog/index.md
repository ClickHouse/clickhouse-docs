---
description: '2026 年变更日志'
note: '此文件通过 yarn build 生成'
slug: /whats-new/changelog/
sidebar_position: -9998
sidebar_label: '2026'
title: '2026 年变更日志'
doc_type: 'changelog'
---

### ClickHouse 26.1 版本，2026-01-29。[演示](https://presentations.clickhouse.com/2026-release-26.1/)，[视频](TODO) \{#261\}

#### 不兼容变更 \{#backward-incompatible-change\}

* 修复由于在 formatter 中错误替换别名而导致的格式不一致问题。修复了 [#82833](https://github.com/ClickHouse/ClickHouse/issues/82833) 中的问题。修复了 [#82832](https://github.com/ClickHouse/ClickHouse/issues/82832) 中的问题。修复了 [#68296](https://github.com/ClickHouse/ClickHouse/issues/68296) 中的问题。此更改可能存在向后不兼容性：当 analyzer 被禁用时，某些在 IN 中引用别名的 CREATE VIEW 查询将无法被处理。为避免不兼容，请启用 analyzer（自 24.3 起默认启用）。[#82838](https://github.com/ClickHouse/ClickHouse/pull/82838)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 编解码器 `DEFLATE_QPL` 和 `ZSTD_QAT` 已被移除。建议用户在升级前，将使用 `DEFLATE_QPL` 或 `ZSTD_QAT` 压缩的现有数据转换为其他编解码器。请注意，若要使用这些编解码器，必须先启用设置项 `enable_deflate_qpl_codec` 和 `enable_zstd_qat_codec`。[#92150](https://github.com/ClickHouse/ClickHouse/pull/92150)（[Robert Schulze](https://github.com/rschu1ze)）。
* 通过在 `system.query_log.exception` 中启用对 stderr 的捕获，改进 UDF 调试体验。之前，UDF 的 stderr 只会被写入文件，而不会出现在查询日志中，导致难以调试。现在，stderr 默认会触发异常，并在抛出前被完整累积（最多 1MB），因此完整的 Python 回溯和错误信息会出现在 `system.query_log.exception` 中，从而便于高效故障排查。[#92209](https://github.com/ClickHouse/ClickHouse/pull/92209)（[Xu Jia](https://github.com/XuJia0210)）。
* `JOIN USING ()` 子句中的空列列表现在被视为语法错误。此前预期的行为是在查询执行期间抛出 `INVALID_JOIN_ON_EXPRESSION`。在某些情况下（例如与 `Join` 引擎进行连接）这会导致 `LOGICAL_ERROR`，从而修复了 [#82502](https://github.com/ClickHouse/ClickHouse/issues/82502)。 [#92371](https://github.com/ClickHouse/ClickHouse/pull/92371)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 默认启用 JSON 的高级共享数据。完成此更改后，将无法降级到 25.8 之前的版本，因为这些版本将无法读取带有 JSON 列的新数据分区片段。为确保安全升级，建议将 `compatibility` 设置为前一个版本，或者在 MergeTree 中将设置 `dynamic_serialization_version='v2', object_serialization_version='v2'`。 [#92511](https://github.com/ClickHouse/ClickHouse/pull/92511) ([Pavel Kruglov](https://github.com/Avogar)).
* 默认在 JSON 类型中对 SKIP REGEXP 使用部分匹配。关闭问题 [#79250](https://github.com/ClickHouse/ClickHouse/issues/79250)。[#92847](https://github.com/ClickHouse/ClickHouse/pull/92847)（[Pavel Kruglov](https://github.com/Avogar)）。
* 回滚「Allow INSERT into simple ALIAS columns」（回滚 ClickHouse/ClickHouse[#84154](https://github.com/ClickHouse/ClickHouse/issues/84154)）。该功能无法与自定义格式配合使用，并且没有受任何设置保护。[#92849](https://github.com/ClickHouse/ClickHouse/pull/92849)（[Azat Khuzhin](https://github.com/azat)）。
* 新增设置，在数据湖目录无法访问对象存储时抛出错误。[#93606](https://github.com/ClickHouse/ClickHouse/pull/93606) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `Lazy` 数据库引擎已被移除且不再可用。已关闭 [#91231](https://github.com/ClickHouse/ClickHouse/issues/91231)。[#93627](https://github.com/ClickHouse/ClickHouse/pull/93627)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 移除 `metric_log` 的 `transposed_with_wide_view` 模式——由于一个缺陷，该模式无法使用。现在不再允许以该模式定义 `system.metric_log`。这在一定程度上回滚了 [#78412](https://github.com/ClickHouse/ClickHouse/issues/78412)。[#93867](https://github.com/ClickHouse/ClickHouse/pull/93867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 工作负载的 CPU 调度现在默认为抢占式。参见 `cpu_slot_preemption` 服务器配置项。[#94060](https://github.com/ClickHouse/ClickHouse/pull/94060)（[Sergei Trifonov](https://github.com/serxa)）。
* 对索引文件名进行转义以防止分区片段损坏。应用此更改后，ClickHouse 将无法加载由先前版本创建且名称中包含非 ASCII 字符的索引。要处理这种情况，可以使用 MergeTree SETTING `escape_index_filenames`。[#94079](https://github.com/ClickHouse/ClickHouse/pull/94079) ([Raúl Marín](https://github.com/Algunenano))。
* 格式设置 `exact_rows_before_limit`、`rows_before_aggregation`、`cross_to_inner_join_rewrite`、`regexp_dict_allow_hyperscan`、`regexp_dict_flag_case_insensitive`、`regexp_dict_flag_dotall` 和 `dictionary_use_async_executor` 现已更改为常规（非格式）设置。这是一次纯粹的内部更改，对用户没有可见的副作用，除非在（不太可能的）情况下，你在 Iceberg、DeltaLake、Kafka、S3、S3Queue、Azure、Hive、RabbitMQ、Set、FileLog 或 NATS 的表引擎定义中指定了上述任一设置。在这些情况下，此前这些设置会被忽略，而现在此类定义会报错。[#94106](https://github.com/ClickHouse/ClickHouse/pull/94106)（[Robert Schulze](https://github.com/rschu1ze)）。
* `joinGet/joinGetOrNull` 函数现在会对底层 Join 表强制要求具备 `SELECT` 权限。此更改之后，执行 `joinGet('db.table', 'column', key)` 要求用户同时对 Join 表中定义的键列以及要获取的属性列拥有 `SELECT` 权限。缺少这些权限的查询将失败，并返回 `ACCESS_DENIED`。迁移时，可通过 `GRANT SELECT ON db.join_table TO user` 授予整张表的访问权限，或通过 `GRANT SELECT(key_col, attr_col) ON db.join_table TO user` 授予列级访问权限。此更改会影响所有依赖 `joinGet`/`joinGetOrNull` 且之前未显式配置 `SELECT` 授权的用户和应用程序。[#94307](https://github.com/ClickHouse/ClickHouse/pull/94307)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 针对 `CREATE TABLE ... AS ...` 查询改为检查 `SHOW COLUMNS`。之前检查的是 `SHOW TABLES`，这对于此类权限检查来说是不正确的权限授予。[#94556](https://github.com/ClickHouse/ClickHouse/pull/94556)（[pufit](https://github.com/pufit)）。
* 使 `Hash` 输出格式不再依赖于数据块大小。[#94503](https://github.com/ClickHouse/ClickHouse/pull/94503)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。请注意，与之前版本相比，此更改会导致输出的哈希值发生变化。

#### 新特性 \{#new-feature\}

* ClickHouse Keeper 的 HTTP API 和嵌入式 Web UI。 [#78181](https://github.com/ClickHouse/ClickHouse/pull/78181) ([pufit](https://github.com/pufit)).
* 异步插入去重现在可以与依赖它的 materialized view 协同工作。当按 block&#95;id 发生冲突时，会先过滤原始数据块以移除与该 block&#95;id 关联的行，对剩余的行应用所有相关 materialized view 的 SELECT 查询进行转换，从而重建不包含冲突行的原始数据块。[#89140](https://github.com/ClickHouse/ClickHouse/pull/89140) ([Sema Checherinda](https://github.com/CheSema))。当涉及 materialized view 时，现在允许在异步插入中使用去重。[#93957](https://github.com/ClickHouse/ClickHouse/pull/93957) ([Sema Checherinda](https://github.com/CheSema))。
* 引入了一种新的语法和框架，用于简化并扩展 PROJECTION 索引功能。该变更是对 https://github.com/ClickHouse/ClickHouse/pull/81021 的后续改进。[#91844](https://github.com/ClickHouse/ClickHouse/pull/91844) ([Amos Bird](https://github.com/amosbird))。
* 为 `Array` 列添加文本索引功能支持。 [#89895](https://github.com/ClickHouse/ClickHouse/pull/89895) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* 默认启用 `use_variant_as_common_type`，从而可以在 `Array` 中、`UNION` 查询中以及 `if`/`multiIf`/`case` 分支中使用彼此不兼容的类型。[#90677](https://github.com/ClickHouse/ClickHouse/pull/90677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增系统表 `zookeeper_info`。实现了 [#88014](https://github.com/ClickHouse/ClickHouse/issues/88014)。[#90809](https://github.com/ClickHouse/ClickHouse/pull/90809)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在所有函数中支持 `Variant` 类型。[#90900](https://github.com/ClickHouse/ClickHouse/pull/90900)（[Bharat Nallan](https://github.com/bharatnc)）。
* 在 Prometheus 的 `/metrics` 端点中新增一个 `ClickHouse_Info` 指标，主要包含版本信息，从而可以构建随时间跟踪详细版本信息的图表。[#91125](https://github.com/ClickHouse/ClickHouse/pull/91125)（[Christoph Wurm](https://github.com/cwurm)）。
* 为 keeper 引入了一个新的四字母命令 `rcfg`，用于修改集群配置。与标准的 `reconfigure` 请求相比，此命令在配置变更方面提供了更大的灵活性。命令以 `json` 字符串作为参数。发送到 TCP 接口的完整字节序列应如下所示：`rcfg{json_string_length_big_endian}{json_string}`。命令的一些示例如下：`{"preconditions": {"leaders": [1, 2], "members": [1, 2, 3, 4, 5]}, "actions": [{"transfer_leadership": [3]}, {"remove_members": [1, 2]}, {"set_priority": [{"id": 4, "priority": 100}, {"id": 5, "priority": 100}]}, {"transfer_leadership": [4, 5]}, {"set_priority": [{"id": 3, "priority": 0}]}]}`。[#91354](https://github.com/ClickHouse/ClickHouse/pull/91354) ([alesapin](https://github.com/alesapin))。
* 添加函数 `reverseBySeparator`，用于将由指定分隔符分隔的字符串中的子串顺序反转。关闭 [#91463](https://github.com/ClickHouse/ClickHouse/issues/91463)。[#91780](https://github.com/ClickHouse/ClickHouse/pull/91780)（[Xuewei Wang](https://github.com/Sallery-X)）。
* 新增了 `max_insert_block_size_bytes` 设置，用于更精细地控制插入数据块的形成。[#92833](https://github.com/ClickHouse/ClickHouse/pull/92833)（[Kirill Kopnev](https://github.com/Fgrtue)）。
* 如果启用了 `ignore_on_cluster_for_replicated_database` 配置项，则可以在 Replicated 数据库中执行带有 `ON CLUSTER` 子句的 DDL 查询。在这种情况下，将忽略集群名称。 [#92872](https://github.com/ClickHouse/ClickHouse/pull/92872) ([Kirill](https://github.com/kirillgarbar))。
* 实现了 `mergeTreeAnalyzeIndex` 函数。 [#92954](https://github.com/ClickHouse/ClickHouse/pull/92954) ([Azat Khuzhin](https://github.com/azat)).
* 新增配置项 `use_primary_key`。将其设置为 `false` 以禁用基于主键的 granule 剪枝。[#93319](https://github.com/ClickHouse/ClickHouse/pull/93319)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 添加 `icebergLocalCluster` 表函数。[#93323](https://github.com/ClickHouse/ClickHouse/pull/93323) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 新增了 `cosineDistanceTransposed` 函数，用于近似计算两点之间的[余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)。[#93621](https://github.com/ClickHouse/ClickHouse/pull/93621)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 system.parts 表中新增 `files` 列，用于显示每个数据分区片段包含的文件数量。 [#94337](https://github.com/ClickHouse/ClickHouse/pull/94337) ([Match](https://github.com/gayanMatch)).
* 为并发控制添加了一个 max-min 公平调度器。在严重 oversubscription 场景下（即大量查询争夺有限的 CPU 槽位时），可以提供更好的公平性。短时运行的查询不会因为那些长时间运行并随时间占用更多槽位的查询而受到惩罚。通过将 `concurrent_threads_scheduler` 服务器 SETTING 的值设置为 `max_min_fair` 来启用。[#94732](https://github.com/ClickHouse/ClickHouse/pull/94732)（[Sergei Trifonov](https://github.com/serxa)）。
* 新增了使 ClickHouse 客户端在连接服务器时可以覆盖 TLS SNI 的功能。 [#89761](https://github.com/ClickHouse/ClickHouse/pull/89761) ([Matt Klein](https://github.com/mattklein123)).
* 在 `joinGet` 函数调用中支持使用临时表。[#92973](https://github.com/ClickHouse/ClickHouse/pull/92973)（[Eduard Karacharov](https://github.com/korowa)）。
* 支持 `DeltaLake` 表引擎中的删除向量。 [#93852](https://github.com/ClickHouse/ClickHouse/pull/93852) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为 deltaLakeCluster 添加对删除向量的支持。 [#94365](https://github.com/ClickHouse/ClickHouse/pull/94365) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为数据湖增加对 Google Cloud Storage 的支持。 [#93866](https://github.com/ClickHouse/ClickHouse/pull/93866) ([Konstantin Vedernikov](https://github.com/scanhex12)).

#### 实验特性 \{#experimental-feature\}

* 将 `QBit` 从 Experimental 提升至 Beta。 [#93816](https://github.com/ClickHouse/ClickHouse/pull/93816) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 新增对 `Nullable(Tuple)` 的支持。将 `allow_experimental_nullable_tuple_type` 设置为 1 以启用该功能。 [#89643](https://github.com/ClickHouse/ClickHouse/pull/89643) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 支持 Paimon REST catalog，延续自 https://github.com/ClickHouse/ClickHouse/pull/84423。 [#92011](https://github.com/ClickHouse/ClickHouse/pull/92011) ([JIaQi Tang](https://github.com/JiaQiTang98)).

#### 性能优化 \{#performance-improvement\}

* 默认启用 JSON 的高级共享数据。此更改后将无法降级到 &lt;25.8 版本,因为这些版本无法读取包含 JSON 列的新分区片段。为了安全升级,建议将 `compatibility` 设置为先前版本,或设置 MergeTree 设置 `dynamic_serialization_version='v2', object_serialization_version='v2'`。[#92511](https://github.com/ClickHouse/ClickHouse/pull/92511) ([Pavel Kruglov](https://github.com/Avogar))。
* Setting `use_skip_indexes_on_data_read` is now enabled by default. This setting allows filtering in a streaming fashion, at the same time as reading, improving query performance and startup time. [#93407](https://github.com/ClickHouse/ClickHouse/pull/93407) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Datalakes prewhere &amp; multistage prewhere in Parquet reader v3. Resolves [#89101](https://github.com/ClickHouse/ClickHouse/issues/89101). [#93542](https://github.com/ClickHouse/ClickHouse/pull/93542) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Improve performance of `DISTINCT` on `LowCardinality` columns. Closes [#5917](https://github.com/ClickHouse/ClickHouse/issues/5917). [#91639](https://github.com/ClickHouse/ClickHouse/pull/91639) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* Optimize `distinctJSONPaths` aggregate function so it reads only JSON paths from data parts and not the whole JSON column. [#92196](https://github.com/ClickHouse/ClickHouse/pull/92196) ([Pavel Kruglov](https://github.com/Avogar)).
* More filters pushed down JOINs. [#85556](https://github.com/ClickHouse/ClickHouse/pull/85556) ([Nikita Taranov](https://github.com/nickitat)).
* Support more cases for push down from join ON condition when the filter uses inputs only from one side. Support `ANY`, `SEMI`, `ANTI` joins. [#92584](https://github.com/ClickHouse/ClickHouse/pull/92584) ([Dmitry Novik](https://github.com/novikd)).
* Allow using equivalent sets to push down filters for `SEMI JOIN`. Closes [#85239](https://github.com/ClickHouse/ClickHouse/issues/85239). [#92837](https://github.com/ClickHouse/ClickHouse/pull/92837) ([Dmitry Novik](https://github.com/novikd)).
* Skip reading left side of hash join when right side is empty. Previously we were reading left side until first non-empty block, which might do a lot of work in case when there is heavy filtering or aggregation. [#94062](https://github.com/ClickHouse/ClickHouse/pull/94062) ([Alexander Gololobov](https://github.com/davenger)).
* Using the &quot;fastrange&quot; (Daniel Lemire) method for partitioning data inside the query pipeline. This could improve parallel sorting and JOINs. [#93080](https://github.com/ClickHouse/ClickHouse/pull/93080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Improve performance of window functions when PARTITION BY matches or is a prefix of the sorting key. [#87299](https://github.com/ClickHouse/ClickHouse/pull/87299) ([Nikita Taranov](https://github.com/nickitat)).
* Outer filter is pushed down into views which allows applying PREWHERE on local and remote nodes. Resolves [#88189](https://github.com/ClickHouse/ClickHouse/issues/88189). [#88316](https://github.com/ClickHouse/ClickHouse/pull/88316) ([Igor Nikonov](https://github.com/devcrafter)).
* Implement JIT compilations for more functions. Closes [#73509](https://github.com/ClickHouse/ClickHouse/issues/73509). [#88770](https://github.com/ClickHouse/ClickHouse/pull/88770) ([Alexey Milovidov](https://github.com/alexey-milovidov) with [Taiyang Li](https://github.com/taiyang-li)).
* If a skip index used in a `FINAL` query is on a column that is part of the primary key, the additional step to check for primary key intersection in other parts is unnecessary and now not performed. Resolves [#85897](https://github.com/ClickHouse/ClickHouse/issues/85897). [#93899](https://github.com/ClickHouse/ClickHouse/pull/93899) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Optimize performance and memory usage for fractional `LIMIT` and `OFFSET`. [#91167](https://github.com/ClickHouse/ClickHouse/pull/91167) ([Ahmed Gouda](https://github.com/0xgouda)).
* Fix using of faster random read logic for Parquet Reader V3 prefetcher. Closes [#90890](https://github.com/ClickHouse/ClickHouse/issues/90890). [#91435](https://github.com/ClickHouse/ClickHouse/pull/91435) ([Arsen Muk](https://github.com/arsenmuk)).
* Improve performance of `icebergCluster`. Closes [#91462](https://github.com/ClickHouse/ClickHouse/issues/91462). [#91537](https://github.com/ClickHouse/ClickHouse/pull/91537) ([Yang Jiang](https://github.com/Ted-Jiang)).
* Don&#39;t filter by virtual columns on constant filters. [#91588](https://github.com/ClickHouse/ClickHouse/pull/91588) ([c-end](https://github.com/c-end)).
* Reduce INSERT/merges memory usage with wide parts for very wide tables by enabling adaptive write buffers. Add support of adaptive write buffers for encrypted disks. [#92250](https://github.com/ClickHouse/ClickHouse/pull/92250) ([Azat Khuzhin](https://github.com/azat)).
* Improved performance of full text search with text index and `sparseGrams` tokenizer by reducing the number of searched tokens in the index. [#93078](https://github.com/ClickHouse/ClickHouse/pull/93078) ([Anton Popov](https://github.com/CurtizJ)).
* Function `isValidASCII` was optimized for positive outcomes, i.e. all-ASCII input values. [#93347](https://github.com/ClickHouse/ClickHouse/pull/93347) ([Robert Schulze](https://github.com/rschu1ze)).
* The read-in-order optimization now recognizes when ORDER BY columns are constant due to WHERE conditions, enabling efficient reverse-order reads. This benefits multi-tenant queries like `WHERE tenant='42' ORDER BY tenant, event_time DESC` which can now use InReverseOrder instead of requiring a full sort.&quot;. [#94103](https://github.com/ClickHouse/ClickHouse/pull/94103) ([matanper](https://github.com/matanper)).
* Introduce Enum AST specialized class to store value parameters in (string, integer) pairs instead of ASTLiteral children to optimize memory consumption. [#94178](https://github.com/ClickHouse/ClickHouse/pull/94178) ([Ilya Yatsishin](https://github.com/qoega)).
* Distributed index analysis on multiple replicas. Beneficial for shared storage and huge amount of data in cluster. This is applicable for SharedMergeTree (ClickHouse Cloud) and could be applicable for other types of MergeTree tables on a shared storage. [#86786](https://github.com/ClickHouse/ClickHouse/pull/86786) ([Azat Khuzhin](https://github.com/azat)).
* Reduce overhead of join runtime filters by disabling them in the following cases: - too many bits are set in the bloom filter - too few rows are filtered out at runtime. [#91578](https://github.com/ClickHouse/ClickHouse/pull/91578) ([Alexander Gololobov](https://github.com/davenger)).
* Use an in-memory buffer for correlated subqueries input to avoid evaluating it multiple times. Part of [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890). [#91205](https://github.com/ClickHouse/ClickHouse/pull/91205) ([Dmitry Novik](https://github.com/novikd)).
* Allow all replicas to steal orphaned ranges in parallel replicas reading. This improves load balancing and reduces long-tail latency. [#91374](https://github.com/ClickHouse/ClickHouse/pull/91374) ([zoomxi](https://github.com/zoomxi)).
* External aggregation/sorting/join now respects query setting `temporary_files_codec` in all contexts. Fixed missing profile events for grace hash join. [#92388](https://github.com/ClickHouse/ClickHouse/pull/92388) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Make query memory usage detection for spilling to disk during aggregation/sorting more robust. [#92500](https://github.com/ClickHouse/ClickHouse/pull/92500) ([Azat Khuzhin](https://github.com/azat)).
* Estimate total rows count and NDV (number of distinct values) statistics of aggregation key columns. [#92812](https://github.com/ClickHouse/ClickHouse/pull/92812) ([Alexander Gololobov](https://github.com/davenger)).
* Optimize postings list compression with simdcomp. [#92871](https://github.com/ClickHouse/ClickHouse/pull/92871) ([Peng Jian](https://github.com/fastio)).
* Refactor S3Queue Ordered mode processing with buckets. This should also improve performance, reducing the number of keeper requests. [#92889](https://github.com/ClickHouse/ClickHouse/pull/92889) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Functions `mapContainsKeyLike` and `mapContainsValueLike` can now leverage a text index on `mapKeys()` or `mapValues()`, respectively. [#93049](https://github.com/ClickHouse/ClickHouse/pull/93049) ([Michael Jarrett](https://github.com/EmeraldShift)).
* Reduce memory usage on non-Linux systems (enable immediate purging of jemalloc dirty pages). [#93360](https://github.com/ClickHouse/ClickHouse/pull/93360) ([Eduard Karacharov](https://github.com/korowa)).
* Force purging of jemalloc arenas in case the ratio of dirty pages size to `max_server_memory_usage` exceeds `memory_worker_purge_dirty_pages_threshold_ratio`. [#93500](https://github.com/ClickHouse/ClickHouse/pull/93500) ([Eduard Karacharov](https://github.com/korowa)).
* Reduce memory usage for AST. [#93601](https://github.com/ClickHouse/ClickHouse/pull/93601) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* In some cases we&#39;ve seen ClickHouse doesn&#39;t respect a memory limit when reading from a table. This behaviour is fixed. [#93715](https://github.com/ClickHouse/ClickHouse/pull/93715) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Enable `CHECK_STAT` and `TRY_REMOVE` Keeper extension by default. [#93886](https://github.com/ClickHouse/ClickHouse/pull/93886) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Parse lower and upper bounds of file names corresponding to position deletes from Iceberg manifest file entries for better selection of corresponding data files. [#93980](https://github.com/ClickHouse/ClickHouse/pull/93980) ([Daniil Ivanik](https://github.com/divanik)).
* Add two more settings to control maximum number of dynamic subcolumns in JSON column. First is MergeTree setting `merge_max_dynamic_subcolumns_in_compact_part` (similar to already added `merge_max_dynamic_subcolumns_in_wide_part`) that limits number of dynamic subcolumns created during merge into a Compact part. Second is query level setting `max_dynamic_subcolumns_in_json_type_parsing` that limits number of dynamic subcolumns created during parsing of JSON data, it will allow to specify the limit on insert. [#94184](https://github.com/ClickHouse/ClickHouse/pull/94184) ([Pavel Kruglov](https://github.com/Avogar)).
* Slightly optimize squashing of JSON columns for some cases. [#94247](https://github.com/ClickHouse/ClickHouse/pull/94247) ([Pavel Kruglov](https://github.com/Avogar)).
* Lower the thread pool queue sizes based on the production experience. Add an explicit memory consumption check before reading any data from the MergeTree. [#94692](https://github.com/ClickHouse/ClickHouse/pull/94692) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Make sure the scheduler would prefer MemoryWorker thread under the CPU starvation, because it protects ClickHouse process from an existential threat. [#94864](https://github.com/ClickHouse/ClickHouse/pull/94864) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Run purging of jemalloc dirty pages in a different thread from main thread of MemoryWorker. If purging is slow, it could delay updates of RSS usage which could lead to out of memory kills of the process. Introduce new config `memory_worker_purge_total_memory_threshold_ratio` to start purging dirty pages based on ratio of total memory usage. [#94902](https://github.com/ClickHouse/ClickHouse/pull/94902) ([Antonio Andelic](https://github.com/antonio2368)).

#### 改进 \{#improvement\}

* `system.blob_storage_log` 现已支持 Azure Blob Storage。[#93105](https://github.com/ClickHouse/ClickHouse/pull/93105)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 Local 和 HDFS 实现 `blob_storage_log`。修复 `S3Queue` 在 `blob_storage_log` 中记录日志时未使用磁盘名称而导致的错误。为 `blob_storage_log` 添加 `error_code` 列。拆分测试配置文件以简化本地测试。[#93106](https://github.com/ClickHouse/ClickHouse/pull/93106) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在输入时，`clickhouse-client` 和 `clickhouse-local` 会高亮显示数值字面量中的数字分组（千位、百万位等）。此更改修复了 [#93100](https://github.com/ClickHouse/ClickHouse/issues/93100)。[#93108](https://github.com/ClickHouse/ClickHouse/pull/93108)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-client` 中新增对在等号两侧包含空格的命令行参数的支持。修复了 [#93077](https://github.com/ClickHouse/ClickHouse/issues/93077)。[#93174](https://github.com/ClickHouse/ClickHouse/pull/93174)（[Cole Smith](https://github.com/colesmith54)）。
* 将 `<interactive_history_legacy_keymap>true</interactive_history_legacy_keymap>` 设置为 true 后，CLI 客户端现在可以像之前一样恢复为使用 Ctrl-R 进行常规搜索，而 Ctrl-T 用于模糊搜索。[#87785](https://github.com/ClickHouse/ClickHouse/pull/87785)（[Larry Snizek](https://github.com/larry-cdn77)）。
* 用于清理缓存的语句 `SYSTEM DROP [...] CACHE` 给人一种错误印象，好像该语句会禁用缓存。ClickHouse 现在支持语句 `SYSTEM CLEAR [...] CACHE`，含义更加清晰。旧的语法仍然可用。[#93727](https://github.com/ClickHouse/ClickHouse/pull/93727)（[Pranav Tiwari](https://github.com/pranavt84)）。
* 在 `EmbeddedRocksDB` 中支持使用多个列作为主键。修复 [#32819](https://github.com/ClickHouse/ClickHouse/issues/32819)。[#33917](https://github.com/ClickHouse/ClickHouse/pull/33917)（[usurai](https://github.com/usurai)）。
* 现在可以对标量使用非常量的 IN（例如查询 `val1 NOT IN if(cond, val2, val3)`）。[#93495](https://github.com/ClickHouse/ClickHouse/pull/93495)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 防止将 `x-amz-server-side-encryption` 头部字段传播到 `HeadObject`、`UploadPart` 和 `CompleteMultipartUpload` S3 请求，因为这些请求不支持该头部。[#64577](https://github.com/ClickHouse/ClickHouse/pull/64577)（[Francisco J. Jurado Moreno](https://github.com/Beetelbrox)）。
* 为 `ALTER` 查询新增语法 `ALTER TABLE <table> ATTACH PART <part_name> FROM <directory_name>`。它允许从 `detached/` 目录下的任意子目录中附加分区片段。对于附加带有自定义前缀（例如 `broken-on-start`、`unexpected` 等）的分区片段时，这非常有用，这些分区片段是因误操作而被分离的，只需要在无需人工干预的情况下重新附加即可。此前，需要在文件系统上手动重命名目录。[#74816](https://github.com/ClickHouse/ClickHouse/pull/74816)（[Anton Popov](https://github.com/CurtizJ)）。
* 在 S3Queue 中跟踪有序模式下的 Hive 分区。修复了 [#71161](https://github.com/ClickHouse/ClickHouse/issues/71161)。[#81040](https://github.com/ClickHouse/ClickHouse/pull/81040)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 优化文件系统缓存中的空间预留。`FileCache::collectCandidatesForEviction` 将在不持有独占锁的情况下执行。[#82764](https://github.com/ClickHouse/ClickHouse/pull/82764) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 支持服务器日志的复合轮转策略（大小 + 时间）。 [#87620](https://github.com/ClickHouse/ClickHouse/pull/87620) ([Jianmei Zhang](https://github.com/zhangjmruc)).
* CLI 客户端现在可以指定 `<warnings>false</warnings>` 以替代命令行参数 `--no-warnings`。 [#87783](https://github.com/ClickHouse/ClickHouse/pull/87783) ([Larry Snizek](https://github.com/larry-cdn77)).
* 为 `avg` 聚合函数添加对 Date、DateTime 和 Time 类型参数的支持。修复了 [#82267](https://github.com/ClickHouse/ClickHouse/issues/82267) 中的问题。[#87845](https://github.com/ClickHouse/ClickHouse/pull/87845)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 优化项 `use_join_disjunctions_push_down` 默认启用。[#89313](https://github.com/ClickHouse/ClickHouse/pull/89313)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在关联子查询中支持更多表引擎和数据源类型。关闭 Issue [#80775](https://github.com/ClickHouse/ClickHouse/issues/80775)。[#90175](https://github.com/ClickHouse/ClickHouse/pull/90175)（[Dmitry Novik](https://github.com/novikd)）。
* 如果显式指定了参数化视图的 schema，则会将其显示出来。关闭 [#88875](https://github.com/ClickHouse/ClickHouse/issues/88875)、[#81385](https://github.com/ClickHouse/ClickHouse/issues/81385)。[#90220](https://github.com/ClickHouse/ClickHouse/pull/90220)（[Grigorii Sokolik](https://github.com/GSokol)）。
* 如果日志早于最后一次提交的索引，则正确处理 Keeper 日志条目中的缺口。 [#90403](https://github.com/ClickHouse/ClickHouse/pull/90403) ([Antonio Andelic](https://github.com/antonio2368))。
* 改进 `min_free_disk_bytes_to_perform_insert` 设置项，使其在 JBOD 卷上能正确工作。 [#90878](https://github.com/ClickHouse/ClickHouse/pull/90878) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* 允许在命名集合中为 `S3` 表引擎和 `s3` 表函数指定 `storage_class_name` 设置。[#91926](https://github.com/ClickHouse/ClickHouse/pull/91926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 支持通过 `system.zookeeper` 插入辅助 ZooKeeper 实例。 [#92092](https://github.com/ClickHouse/ClickHouse/pull/92092) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 为 Keeper 添加新指标：`KeeperChangelogWrittenBytes`、`KeeperChangelogFileSyncMicroseconds`、`KeeperSnapshotWrittenBytes` 和 `KeeperSnapshotFileSyncMicroseconds` profile events，以及 `KeeperBatchSizeElements` 和 `KeeperBatchSizeBytes` 直方图指标。[#92149](https://github.com/ClickHouse/ClickHouse/pull/92149)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 新增一个设置项 `trace_profile_events_list`，将使用 `trace_profile_event` 的跟踪限制为指定的事件名称列表。这使得在大规模工作负载下可以进行更精确的数据采集。[#92298](https://github.com/ClickHouse/ClickHouse/pull/92298) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 为可暂停的 failpoint 提供 SYSTEM NOTIFY FAILPOINT 支持 - 支持在 SYSTEM WAIT FAILPOINT fp 中执行 PAUSE/RESUME。[#92368](https://github.com/ClickHouse/ClickHouse/pull/92368)（[Shaohua Wang](https://github.com/tiandiwonder)）。
* 为 `system.data_skipping_indices` 添加 `creation`（隐式/显式）列。 [#92378](https://github.com/ClickHouse/ClickHouse/pull/92378) ([Raúl Marín](https://github.com/Algunenano)).
* 允许将 YTsaurus 动态表的列描述信息传递给字典数据源。[#92391](https://github.com/ClickHouse/ClickHouse/pull/92391) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 在 [#63985](https://github.com/ClickHouse/ClickHouse/pull/63985) 中，我们实现了可以为每个端口单独指定 TLS 配置所需的全部参数（参见 [composable protocols](https://clickhouse.com/docs/operations/settings/composable-protocols)），从而不再需要依赖全局 TLS 配置。然而，该实现仍然隐式要求存在一个全局的 `openSSL.server` 配置节，这与需要为不同端口使用不同 TLS 配置的场景相冲突。例如，在 keeper-in-server 部署中，我们需要为 keeper 之间的通信和 ClickHouse 客户端连接分别使用不同的 TLS 配置。[#92457](https://github.com/ClickHouse/ClickHouse/pull/92457)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 引入一个新的设置 `input_format_binary_max_type_complexity`，用于限制在二进制格式中可解码的类型节点总数，以防止恶意载荷。[#92519](https://github.com/ClickHouse/ClickHouse/pull/92519) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 在 `system.background_schedule_pool{,_log}` 中反映正在运行的任务。新增文档。[#92587](https://github.com/ClickHouse/ClickHouse/pull/92587) ([Azat Khuzhin](https://github.com/azat)).
* 如果在客户端中使用 Ctrl+R 搜索时未找到历史匹配项，则执行当前查询。 [#92749](https://github.com/ClickHouse/ClickHouse/pull/92749) ([Azat Khuzhin](https://github.com/azat)).
* 支持 `EXPLAIN indices = 1` 作为 `EXPLAIN indexes = 1` 的别名。关闭 [#92483](https://github.com/ClickHouse/ClickHouse/issues/92483)。[#92774](https://github.com/ClickHouse/ClickHouse/pull/92774)（[Pranav Tiwari](https://github.com/pranavt84)）。
* Parquet 读取器现在允许将 Tuple 或 Map 类型的列以 JSON 形式读取：`select x from file(f.parquet, auto, 'x JSON')` 即使在 `f.parquet` 中列 `x` 的类型是 tuple 或 map 也能正常工作。[#92864](https://github.com/ClickHouse/ClickHouse/pull/92864)（[Michael Kolupaev](https://github.com/al13n321)）。
* 在 Parquet 读取器中添加对空元组的支持。 [#92868](https://github.com/ClickHouse/ClickHouse/pull/92868) ([Michael Kolupaev](https://github.com/al13n321)).
* 当 Azure Blob Storage 的原生复制因 BadRequest（例如 block 列表无效）失败时，回退到读写复制方式。之前仅在将 blob 复制到不同存储帐户时出现 Unauthorized 错误才会进行此回退。但我们有时也会遇到 “The specified block list is invalid” 错误。因此现在更新了条件，对所有原生复制失败的情况都回退到读写模式。[#92888](https://github.com/ClickHouse/ClickHouse/pull/92888)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在使用 EC2 实例角色凭证运行大量并发 S3 查询时对 EC2 元数据端点访问被限流的问题。之前，每个查询都会创建自己的 `AWSInstanceProfileCredentialsProvider`，导致对 EC2 元数据服务发起并发请求，从而可能引发超时和 `HTTP response code: 403` 错误。现在，凭证提供程序会被缓存，并在所有查询之间共享。[#92891](https://github.com/ClickHouse/ClickHouse/pull/92891)（[Sav](https://github.com/sberss)）。
* 重构 `insert_select_deduplicate` 设置，以支持保留向后兼容性。 [#92951](https://github.com/ClickHouse/ClickHouse/pull/92951) ([Sema Checherinda](https://github.com/CheSema)).
* 记录比平均情况更慢的后台任务（`background_schedule_pool_log.duration_threshold_milliseconds=30`），以避免过多记录任务日志。[#92965](https://github.com/ClickHouse/ClickHouse/pull/92965)（[Azat Khuzhin](https://github.com/azat)）。
* 在之前的版本中，一些 C++ 函数名在 `system.trace_log` 和 `system.symbols` 中显示不正确（被“mangled”），并且 `demangle` 函数无法正确处理它们。解决了 [#93074](https://github.com/ClickHouse/ClickHouse/issues/93074)。[#93075](https://github.com/ClickHouse/ClickHouse/pull/93075)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 引入了 `backup_data_from_refreshable_materialized_view_targets` 备份设置，用于在执行备份时跳过可刷新materialized view。使用 APPEND 刷新策略的 RMV 始终会被备份。[#93076](https://github.com/ClickHouse/ClickHouse/pull/93076) ([Julia Kartseva](https://github.com/jkartseva)). [#93658](https://github.com/ClickHouse/ClickHouse/pull/93658) ([Julia Kartseva](https://github.com/jkartseva))
* 对于较重的翻译单元（例如函数），使用最少的调试信息，而不是完全不生成调试信息。[#93079](https://github.com/ClickHouse/ClickHouse/pull/93079) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 通过为 MinIO 特定错误实现错误码映射，为 AWS S3 C++ SDK 添加了对 MinIO 的兼容性支持。此更改使 ClickHouse 在使用 MinIO 部署替代 AWS S3 时，能够正确处理并重试来自 MinIO 服务器的错误，从而提升在自托管 MinIO 集群上运行对象存储场景的可靠性。 [#93082](https://github.com/ClickHouse/ClickHouse/pull/93082) ([XiaoBinMu](https://github.com/Binnn-MX)).
* 写出已符号化的 jemalloc 性能分析文件（在生成堆内存性能分析时无需可执行二进制文件）。 [#93099](https://github.com/ClickHouse/ClickHouse/pull/93099) ([Azat Khuzhin](https://github.com/azat)).
* 恢复 `clickhouse git-import` 工具——此前该工具在处理大型和无效提交时会出错。参见 https://presentations.clickhouse.com/2020-matemarketing/。 [#93202](https://github.com/ClickHouse/ClickHouse/pull/93202) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 避免在查询日志中显示来自 URL 存储的密码。 [#93245](https://github.com/ClickHouse/ClickHouse/pull/93245) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 为 `flipCoordinates` 添加对 `Geometry` 类型的支持。 [#93303](https://github.com/ClickHouse/ClickHouse/pull/93303) ([Bharat Nallan](https://github.com/bharatnc)).
* 改进 SYSTEM INSTRUMENT ADD/REMOVE 的用户体验：对函数名使用字符串字面量，为所有匹配的函数打补丁，并允许在 `REMOVE` 中使用 function&#95;name。 [#93345](https://github.com/ClickHouse/ClickHouse/pull/93345) ([Pablo Marcos](https://github.com/pamarcos))。
* 新增一个名为 `materialize_statistics_on_merge` 的设置，用于启用或禁用在合并过程中物化统计信息。默认值为 `1`。 [#93379](https://github.com/ClickHouse/ClickHouse/pull/93379) ([Han Fei](https://github.com/hanfei1991)).
* ClickHouse 现在可以解析 `DESCRIBE SELECT` 查询中不带括号的 `SELECT`。关闭了 [#58382](https://github.com/ClickHouse/ClickHouse/issues/58382)。[#93429](https://github.com/ClickHouse/ClickHouse/pull/93429)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 在一定概率下对缓存正确性检查进行随机化。[#93439](https://github.com/ClickHouse/ClickHouse/pull/93439)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 添加设置 `type_json_allow_duplicated_key_with_literal_and_nested_object`，以允许在 JSON 中出现路径重复、且一个是字面量另一个是嵌套对象的情况，例如 `{"a" : 42, "a" : {"b" : 42}}`。在对重复路径的限制于 https://github.com/ClickHouse/ClickHouse/pull/79317 中添加之前，一些数据可能已经被创建，现在对这些数据进行进一步操作可能会导致错误。启用此设置后，此类旧数据仍然可以在无错误的情况下使用。 [#93604](https://github.com/ClickHouse/ClickHouse/pull/93604) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 Pretty JSON 中，不要将简单类型的值单独换行打印。[#93836](https://github.com/ClickHouse/ClickHouse/pull/93836) ([Pavel Kruglov](https://github.com/Avogar)).
* 当存在大量 `alter table ... modify setting ...` 语句时，可能在 5 秒内无法获取到锁。此时返回 `timeout` 比返回 `logical error` 更合适。[#93856](https://github.com/ClickHouse/ClickHouse/pull/93856)（[Han Fei](https://github.com/hanfei1991)）。
* 避免在语法错误时产生过多输出。在此更改之前，会输出整个 SQL 脚本，而脚本中可能包含大量查询。[#93876](https://github.com/ClickHouse/ClickHouse/pull/93876)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 Keeper 中对带有统计信息的 `check` 请求进行正确的字节大小计算。[#93907](https://github.com/ClickHouse/ClickHouse/pull/93907) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新增了 `use_hash_table_stats_for_join_reordering` 设置，用于控制在 join 重新排序时是否使用运行时哈希表大小统计信息。该设置默认启用，从而保留 `collect_hash_table_stats_during_joins` 的既有行为。[#93912](https://github.com/ClickHouse/ClickHouse/pull/93912)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 用户现在可以在 `system.server_settings` 表中查看部分嵌套的全局服务器设置（例如 `logger.level`）。这仅适用于具有固定结构的设置项（不包含列表、枚举、重复等）。[#94001](https://github.com/ClickHouse/ClickHouse/pull/94001)（[Hechem Selmi](https://github.com/m-selmi)）。
* `QBit` 现在支持相等性比较。[#94078](https://github.com/ClickHouse/ClickHouse/pull/94078)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 当 Keeper 检测到损坏的快照或不一致的变更日志时，抛出异常，而不是进行手动中止或自动清理文件。这样可以通过依赖人工干预，使 Keeper 的行为更加安全。[#94168](https://github.com/ClickHouse/ClickHouse/pull/94168) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 `CREATE TABLE` 失败时可能遗留多余对象的问题。 [#94174](https://github.com/ClickHouse/ClickHouse/pull/94174) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用受密码保护的 TLS 密钥时对未初始化内存的访问问题（OpenSSL 中的一个缺陷）。 [#94182](https://github.com/ClickHouse/ClickHouse/pull/94182) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 chdig 升级到 [v26.1.1](https://github.com/azat/chdig/releases/tag/v26.1.1)。[#94290](https://github.com/ClickHouse/ClickHouse/pull/94290)（[Azat Khuzhin](https://github.com/azat)）。
* 在 S3Queue 有序模式下支持更通用的分区方式。 [#94321](https://github.com/ClickHouse/ClickHouse/pull/94321) ([Bharat Nallan](https://github.com/bharatnc)).
* 为设置 `allow_statistics_optimize` 新增别名 `use_statistics`。这与现有设置 `use_primary_key` 和 `use_skip_indexes` 更加一致。[#94366](https://github.com/ClickHouse/ClickHouse/pull/94366)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在从 Numbers 转换为 Enums 时启用了 `input_format_numbers_enum_on_conversion_error` SETTING，以检查元素是否存在。 [#94384](https://github.com/ClickHouse/ClickHouse/pull/94384) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 在 S3(Azure)Queue 的有序模式下，通过跟踪限制来清理失败节点（之前这仅在无序模式下同时对失败和已处理节点执行，因此现在也会在有序模式下执行，但只针对失败节点）。 [#94412](https://github.com/ClickHouse/ClickHouse/pull/94412) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 clickhouse-local 中为 `default` 用户启用访问管理功能。`clickhouse-local` 中的默认用户缺少 `access_management` 权限，这会导致诸如 `DROP ROW POLICY IF EXISTS` 之类的操作因 `ACCESS_DENIED` 错误而失败，即使该用户本应不受限制。[#94501](https://github.com/ClickHouse/ClickHouse/pull/94501)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 YTsaurus 字典和表支持命名集合。 [#94582](https://github.com/ClickHouse/ClickHouse/pull/94582) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 为 S3 和 Azure Blob Storage 的 BACKUP/RESTORE 添加对通过 SQL 定义的命名集合的支持。关闭 [#94604](https://github.com/ClickHouse/ClickHouse/issues/94604)。[#94605](https://github.com/ClickHouse/ClickHouse/pull/94605)（[Pablo Marcos](https://github.com/pamarcos)）。
* 在有序模式下为 S3Queue 增加对基于分区键分桶的支持。[#94698](https://github.com/ClickHouse/ClickHouse/pull/94698) ([Bharat Nallan](https://github.com/bharatnc))。
* 新增一个异步指标，用于记录耗时最长的合并操作的持续时间。 [#94825](https://github.com/ClickHouse/ClickHouse/pull/94825) ([Raúl Marín](https://github.com/Algunenano))。
* 在使用 IcebergBitmapPositionDeleteTransform 执行 position delete 操作之前，增加所属文件的检查。 [#94897](https://github.com/ClickHouse/ClickHouse/pull/94897) ([Yang Jiang](https://github.com/Ted-Jiang)).
* 现在 `view_duration_ms` 显示的是该分组处于活动状态的时间，而不再是其中各线程执行时长的总和。[#94966](https://github.com/ClickHouse/ClickHouse/pull/94966)（[Sema Checherinda](https://github.com/CheSema)）。
* 移除了 `hasAnyTokens` 和 `hasAllTokens` 函数中搜索 token 数量上限为 64 的限制。示例：`SELECT count() FROM table WHERE hasAllTokens(text, ['token_1', 'token_2', [...], 'token_65']]);` 此前该查询会因为包含 65 个搜索 token 而抛出 `BAD_ARGUMENTS` 错误。通过此 PR，该限制已被完全移除，相同查询将不再报错。[#95152](https://github.com/ClickHouse/ClickHouse/pull/95152) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 添加名为 `input_format_numbers_enum_on_conversion_error` 的 SETTING，用于在将 Numbers 转换为 Enums 时检查元素是否存在。Closes: [#56144](https://github.com/ClickHouse/ClickHouse/issues/56144)。[#56240](https://github.com/ClickHouse/ClickHouse/pull/56240)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 在 Iceberg 表中，数据文件和位置删除文件的读取共用格式解析器资源，以减少内存分配。[#94701](https://github.com/ClickHouse/ClickHouse/pull/94701)（[Yang Jiang](https://github.com/Ted-Jiang)）。

#### 错误修复(官方稳定版本中用户可见的异常行为) \{#bug-fix-user-visible-misbehavior-in-an-official-stable-release\}

* 修复了一个问题：预定义查询处理程序在插入数据时会将末尾的空白字符误解释为数据。[#83604](https://github.com/ClickHouse/ClickHouse/pull/83604)（[Fabian Ponce](https://github.com/FabianPonce)）。
* 修复在 Join 存储以及“外连接转内连接”优化生效时出现的 `INCOMPATIBLE_TYPE_OF_JOIN` 错误。解决了 [#80794](https://github.com/ClickHouse/ClickHouse/issues/80794)。[#84292](https://github.com/ClickHouse/ClickHouse/pull/84292)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复在启用 `allow_experimental_join_right_table_sorting` 并使用哈希连接（hash join）时出现的异常“Invalid number of rows in Chunk”。 [#86440](https://github.com/ClickHouse/ClickHouse/pull/86440) ([yanglongwei](https://github.com/ylw510)).
* 如果文件系统不区分大小写，则在 MergeTree 中始终将文件名替换为哈希值。此前在使用不区分大小写文件系统（如 macOS）的系统上，当多个列/子列名仅在大小写上不同时，可能会导致数据损坏。 [#86559](https://github.com/ClickHouse/ClickHouse/pull/86559) ([Pavel Kruglov](https://github.com/Avogar))。
* 在创建阶段为 materialized view 中的底层查询添加完整的权限检查。[#89180](https://github.com/ClickHouse/ClickHouse/pull/89180)（[pufit](https://github.com/pufit)）。
* 修复了在常量参数上调用 `icebergHash` 函数时发生的崩溃。[#90335](https://github.com/ClickHouse/ClickHouse/pull/90335) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了在没有事务的情况下执行 mutation 时，错误地修改处于活动事务中的分区片段且最终被回滚的逻辑错误。 [#90469](https://github.com/ClickHouse/ClickHouse/pull/90469) ([Shaohua Wang](https://github.com/tiandiwonder)).
* 在将普通数据库转换为 Atomic 数据库后，正确更新 `system.warnings`。[#90473](https://github.com/ClickHouse/ClickHouse/pull/90473) ([sdk2](https://github.com/sdk2))。
* 修复了一个问题：在从 Parquet 文件读取数据时，如果 **prewhere** 表达式的一部分在查询的其他位置被使用，会导致断言失败。 [#90635](https://github.com/ClickHouse/ClickHouse/pull/90635) ([Max Kainov](https://github.com/maxknv))。
* 修复了在单节点集群中使用 split-by-buckets 模式从 Iceberg 读取时发生的崩溃问题。此更改关闭了 [#90913](https://github.com/ClickHouse/ClickHouse/issues/90913#issue-3668583963)。[#91553](https://github.com/ClickHouse/ClickHouse/pull/91553)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 Log 引擎在读取子列时可能出现的逻辑错误。关闭问题 [#91710](https://github.com/ClickHouse/ClickHouse/issues/91710)。[#91711](https://github.com/ClickHouse/ClickHouse/pull/91711)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 ATTACH AS REPLICATED 过程中出现的逻辑错误：&#39;Storage does not support transaction&#39;。 [#91772](https://github.com/ClickHouse/ClickHouse/pull/91772) ([Shaohua Wang](https://github.com/tiandiwonder)).
* 修复在 `LEFT ANTI JOIN` 带有额外后置条件时运行时过滤器行为异常的问题。[#91824](https://github.com/ClickHouse/ClickHouse/pull/91824)（[Alexander Gololobov](https://github.com/davenger)）。
* 修复了一个错误，该错误出现在对 `Nothing` 类型进行空值安全比较时。关闭了 [#91834](https://github.com/ClickHouse/ClickHouse/issues/91834)。关闭了 [#84870](https://github.com/ClickHouse/ClickHouse/issues/84870)。关闭了 [#91821](https://github.com/ClickHouse/ClickHouse/issues/91821)。[#91884](https://github.com/ClickHouse/ClickHouse/pull/91884)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复原生 Parquet 读取器中 DELTA&#95;BYTE&#95;ARRAY 解码缺陷，影响对高度重复字符串数据的处理。[#91929](https://github.com/ClickHouse/ClickHouse/pull/91929)（[Daniel Muino](https://github.com/dmuino)）。
* 在使用 globs 进行 schema 推断时，仅为其推断来源的那个文件缓存 schema，而不是为所有文件缓存 schema。修复了 [#91745](https://github.com/ClickHouse/ClickHouse/issues/91745)。[#92006](https://github.com/ClickHouse/ClickHouse/pull/92006)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复由于归档条目大小头部不正确而导致的 `Couldn't pack tar archive: Failed to write all bytes` 错误。修复了 [#89075](https://github.com/ClickHouse/ClickHouse/issues/89075)。[#92122](https://github.com/ClickHouse/ClickHouse/pull/92122)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在 INSERT SELECT 中释放请求流，以防止关闭 HTTP 连接。 [#92175](https://github.com/ClickHouse/ClickHouse/pull/92175) ([Sema Checherinda](https://github.com/CheSema)).
* 修复在包含多个带有 `USING` 子句的 JOIN 且启用了 `join_use_nulls` 的查询中的逻辑错误。[#92251](https://github.com/ClickHouse/ClickHouse/pull/92251) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在启用 join&#95;use&#95;nulls 时进行 JOIN 重排时的逻辑错误，关闭 https://github.com/ClickHouse/ClickHouse/issues/90795。 [#92289](https://github.com/ClickHouse/ClickHouse/pull/92289) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复 arrayElement 与带负号字面量组合时 AST 格式不一致的问题。关闭 [#92288](https://github.com/ClickHouse/ClickHouse/issues/92288)、[#92212](https://github.com/ClickHouse/ClickHouse/issues/92212)、[#91832](https://github.com/ClickHouse/ClickHouse/issues/91832)、[#91789](https://github.com/ClickHouse/ClickHouse/issues/91789)、[#91735](https://github.com/ClickHouse/ClickHouse/issues/91735)、[#88495](https://github.com/ClickHouse/ClickHouse/issues/88495)、[#92386](https://github.com/ClickHouse/ClickHouse/issues/92386)。[#92293](https://github.com/ClickHouse/ClickHouse/pull/92293)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在使用 `join_on_disk_max_files_to_merge` 设置时可能发生的崩溃。[#92335](https://github.com/ClickHouse/ClickHouse/pull/92335)（[Bharat Nallan](https://github.com/bharatnc)）。
* 相关问题 #https://github.com/ClickHouse/support-escalation/issues/6365。[#92339](https://github.com/ClickHouse/ClickHouse/pull/92339)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复 `SYSTEM SYNC FILE CACHE` 中缺失的访问检查。关闭 [#92101](https://github.com/ClickHouse/ClickHouse/issues/92101)。[#92372](https://github.com/ClickHouse/ClickHouse/pull/92372)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 `count_distinct_optimization` 在窗口函数和多参数场景中的处理。[#92376](https://github.com/ClickHouse/ClickHouse/pull/92376) ([Raúl Marín](https://github.com/Algunenano))。
* 修复了在将某些聚合函数与窗口函数一起使用时出现的 &quot;Cannot write to finalized buffer&quot; 错误。关闭了 [#91415](https://github.com/ClickHouse/ClickHouse/issues/91415)。[#92395](https://github.com/ClickHouse/ClickHouse/pull/92395)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复使用 `CREATE TABLE ... AS urlCluster()` 与数据库引擎 `Replicated` 时的逻辑错误。解决 [#92216](https://github.com/ClickHouse/ClickHouse/issues/92216) 中报告的问题。[#92418](https://github.com/ClickHouse/ClickHouse/pull/92418)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 MergeTree 中执行变更操作（mutation）时继承源 part 的序列化信息设置。这样可以在更改数据类型序列化方式后，修复对已变更 part 执行查询时可能出现的查询结果不正确的问题。[#92419](https://github.com/ClickHouse/ClickHouse/pull/92419)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复具有相同名称的列和子列之间可能发生的冲突，该冲突可能会导致使用错误的序列化方式并引发查询失败。修复 [#90219](https://github.com/ClickHouse/ClickHouse/issues/90219)。修复 [#85161](https://github.com/ClickHouse/ClickHouse/issues/85161)。[#92453](https://github.com/ClickHouse/ClickHouse/pull/92453)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复由于在将 outer join 转换为 inner join 时对 query plan 进行非预期修改而导致的 `LOGICAL_ERROR`。同时放宽该优化的条件，使其也能应用于在 join 过程中对聚合键应用单射函数的情况。[#92503](https://github.com/ClickHouse/ClickHouse/pull/92503) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复在对空元组列进行排序时可能出现的 `SIZES_OF_COLUMNS_DOESNT_MATCH` 错误。关闭 [#92422](https://github.com/ClickHouse/ClickHouse/issues/92422)。[#92520](https://github.com/ClickHouse/ClickHouse/pull/92520)（[Pavel Kruglov](https://github.com/Avogar)）。
* 检查 JSON 类型中的不兼容类型化路径。修复 [#91577](https://github.com/ClickHouse/ClickHouse/issues/91577)。[#92539](https://github.com/ClickHouse/ClickHouse/pull/92539)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 Backup 数据库上执行 SHOW CREATE DATABASE 时出现的死锁问题。[#92541](https://github.com/ClickHouse/ClickHouse/pull/92541) ([Azat Khuzhin](https://github.com/azat)).
* 在验证假设索引时使用正确的错误代码。 [#92559](https://github.com/ClickHouse/ClickHouse/pull/92559) ([Raúl Marín](https://github.com/Algunenano)).
* 修复分析器中列别名的动态子列解析问题。此前，列别名中的动态子列会被包装为 `getSubcolumn` 调用，在某些情况下可能根本无法解析。关闭 [#91434](https://github.com/ClickHouse/ClickHouse/issues/91434)。[#92583](https://github.com/ClickHouse/ClickHouse/pull/92583)（[Pavel Kruglov](https://github.com/Avogar)）。
* 当 `tokens()` 的第二个参数为 `null` 时避免崩溃。 [#92586](https://github.com/ClickHouse/ClickHouse/pull/92586) ([Raúl Marín](https://github.com/Algunenano))。
* 修复由于对底层 const PREWHERE 列进行就地修改可能导致的潜在崩溃问题。该问题可能在列收缩（`IColumn::shrinkToFit`）或过滤（`IColumn::filter`）时触发，这些操作可能会被多个线程并发执行。[#92588](https://github.com/ClickHouse/ClickHouse/pull/92588) ([Arsen Muk](https://github.com/arsenmuk))。
* 当前已暂时禁用在包含大型分区片段（超过 4,294,967,295 行）的表上创建和物化文本索引。此限制是为防止出现不正确的查询结果，因为当前的索引实现尚不支持如此大的分区片段。[#92644](https://github.com/ClickHouse/ClickHouse/pull/92644)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在执行 JOIN 时出现的逻辑错误 `Too large size (A) passed to allocator`。关闭 [#92043](https://github.com/ClickHouse/ClickHouse/issues/92043)。[#92667](https://github.com/ClickHouse/ClickHouse/pull/92667)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复了一个错误：当 `ngrambf_v1` 索引的 ngram 长度（第一个参数）大于 8 时会抛出异常。 [#92672](https://github.com/ClickHouse/ClickHouse/pull/92672) ([Robert Schulze](https://github.com/rschu1ze)).
* 修复在使用 ZooKeeper 存储时后台重新加载命名集合时出现的未捕获异常。修复 https://github.com/ClickHouse/clickhouse-private/issues/44180。 [#92717](https://github.com/ClickHouse/ClickHouse/pull/92717) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修正了通配符授权的访问权限检查中不正确的逻辑。之前的尝试 https://github.com/ClickHouse/ClickHouse/pull/90928 虽然修复了一个严重漏洞，但最终限制过于严格，导致某些带通配符的 `GRANT` 语句因无关的撤销操作而失败。[#92725](https://github.com/ClickHouse/ClickHouse/pull/92725)（[pufit](https://github.com/pufit)）。
* 修复在 `WHERE` 子句中使用 `not match(...)` 时的数据跳过逻辑错误，该错误会导致结果错误。修复 [#92492](https://github.com/ClickHouse/ClickHouse/issues/92492)。[#92726](https://github.com/ClickHouse/ClickHouse/pull/92726)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 如果在只读磁盘上创建了 MergeTree 表，则在启动时不要尝试删除临时目录。[#92748](https://github.com/ClickHouse/ClickHouse/pull/92748) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在 ALTER TABLE REWRITE PARTS (v2) 中出现的 &quot;Cannot add action to empty ExpressionActionsChain&quot; 错误。 [#92754](https://github.com/ClickHouse/ClickHouse/pull/92754) ([Azat Khuzhin](https://github.com/azat)).
* 避免因为从已断开的 `Connection` 读取而导致的崩溃。 [#92807](https://github.com/ClickHouse/ClickHouse/pull/92807) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 修复在 `Ordered` 模式下存储引擎 `S3Queue` 中出现的逻辑错误 ` Failed to set file processing within 100 retries`。现在该错误已被改为警告。在 25.10 版本之前，如果 Keeper 会话过期，可能会出现此错误；然而在 25.10+ 版本中，这种情况也只会记录为警告，因为在 `Ordered` 模式下高并发处理时，从理论上仍有可能出现此错误。 [#92814](https://github.com/ClickHouse/ClickHouse/pull/92814) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 之前，某些使用 PK 分片并带有恒为假条件的查询会失败，现在则不会了。此更改是 https://github.com/ClickHouse/ClickHouse/pull/89313 所需的。[#92815](https://github.com/ClickHouse/ClickHouse/pull/92815)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复了 `system.parts` 表中文本索引未压缩大小的计算方式。[#92832](https://github.com/ClickHouse/ClickHouse/pull/92832)（[Anton Popov](https://github.com/CurtizJ)）。
* 修正了在 `WHERE` 子句谓词中包含带子查询的 `IN` 子句时，轻量级更新对主索引的使用。[#92838](https://github.com/ClickHouse/ClickHouse/pull/92838)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在 JSON 中为路径 &#39;skip&#39; 生成类型提示的逻辑。关闭 [#92731](https://github.com/ClickHouse/ClickHouse/issues/92731)。[#92842](https://github.com/ClickHouse/ClickHouse/pull/92842)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 S3 表引擎中，如果存在非确定性函数，应避免缓存分区键。 [#92844](https://github.com/ClickHouse/ClickHouse/pull/92844) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复在对带有 `ratio_of_defaults_for_sparse_serialization=0.0` 的稀疏列进行 mutation 后可能出现的错误 `FILE_DOESNT_EXIST`。修复 [#92633](https://github.com/ClickHouse/ClickHouse/issues/92633)。[#92860](https://github.com/ClickHouse/ClickHouse/pull/92860)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复旧版 parquet 读取器（默认不使用）在 JSON 列位于 Tuple 列之后时的 parquet 架构推断问题。修复旧版 parquet 读取器（默认不使用）在遇到空元组时失败的问题。[#92867](https://github.com/ClickHouse/ClickHouse/pull/92867)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复在常量条件下并开启 `join_use_nulls` 时执行多个 JOIN 的逻辑错误，关闭 [#92640](https://github.com/ClickHouse/ClickHouse/issues/92640)。[#92892](https://github.com/ClickHouse/ClickHouse/pull/92892)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复在向在分区表达式中使用子列的表插入数据时可能出现的错误 `NOT_FOUND_COLUMN_IN_BLOCK`。关闭 [#93210](https://github.com/ClickHouse/ClickHouse/issues/93210)。关闭 [#83406](https://github.com/ClickHouse/ClickHouse/issues/83406)。[#92905](https://github.com/ClickHouse/ClickHouse/pull/92905)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在对带有别名的表使用 Merge 引擎时出现的 `NO_SUCH_COLUMN_IN_TABLE` 错误。关闭 [#88665](https://github.com/ClickHouse/ClickHouse/issues/88665)。[#92910](https://github.com/ClickHouse/ClickHouse/pull/92910)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 LowCardinality(Nullable(T)) 列上执行 full&#95;sorting&#95;join 时出现的 NULL != NULL 情况。[#92924](https://github.com/ClickHouse/ClickHouse/pull/92924)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在 `MergeTree` 表中执行文本索引合并时出现的多个崩溃问题。 [#92925](https://github.com/ClickHouse/ClickHouse/pull/92925) ([Anton Popov](https://github.com/CurtizJ)).
* 在进行生存时间 (TTL) 聚合时，如有需要，为 SET 表达式的结果恢复 LowCardinality 包装，以防止在表优化期间抛出异常。[#92971](https://github.com/ClickHouse/ClickHouse/pull/92971) ([Seva Potapov](https://github.com/seva-potapov)).
* 修复在索引分析中，当在 `has` 函数中使用空数组时出现的逻辑错误。关闭 [#92906](https://github.com/ClickHouse/ClickHouse/issues/92906)。[#92995](https://github.com/ClickHouse/ClickHouse/pull/92995)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复在终止后台调度池时可能发生的卡死问题（可能导致服务器在关闭时挂起）。 [#93008](https://github.com/ClickHouse/ClickHouse/pull/93008) ([Azat Khuzhin](https://github.com/azat)).
* 修复在通过 ALTER 将设置项 `ratio_of_defaults_for_sparse_serialization` 修改为 `1.0` 之后，执行稀疏列变更时可能出现的 FILE&#95;DOESNT&#95;EXIST 错误。 [#93016](https://github.com/ClickHouse/ClickHouse/pull/93016) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 WHERE 子句中使用 `not materialize(...)` 或 `not CAST(...)` 时的数据跳过逻辑错误，该错误会导致结果不正确。关闭 [#88536](https://github.com/ClickHouse/ClickHouse/issues/88536)。[#93017](https://github.com/ClickHouse/ClickHouse/pull/93017)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复在共享分区片段上由于 TOCTOU 竞态条件可能导致使用过期分区片段的问题。[#93022](https://github.com/ClickHouse/ClickHouse/pull/93022) ([Azat Khuzhin](https://github.com/azat)).
* 修复在反序列化带有越界偏移的格式错误 `groupConcat` 聚合状态时发生的崩溃。[#93028](https://github.com/ClickHouse/ClickHouse/pull/93028)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 修复了在提前取消分布式查询后连接被遗留在异常状态的问题。 [#93029](https://github.com/ClickHouse/ClickHouse/pull/93029) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在右侧 join 键为稀疏列时的 join 结果问题。这解决了 [#92920](https://github.com/ClickHouse/ClickHouse/issues/92920)。我只能在 `set compatibility='23.3'` 时重现该 bug。不确定是否需要进行回溯（backport）。[#93038](https://github.com/ClickHouse/ClickHouse/pull/93038)（[Amos Bird](https://github.com/amosbird)）。
* 修复在 `estimateCompressionRatio()` 中可能出现的 `Cannot finalize buffer after cancellation` 错误。修复：[ #87380 ](https://github.com/ClickHouse/ClickHouse/issues/87380)。[ #93068 ](https://github.com/ClickHouse/ClickHouse/pull/93068)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了基于复杂表达式（例如 `concat(col1, col2)`）构建的文本索引在合并时的问题。[#93073](https://github.com/ClickHouse/ClickHouse/pull/93073) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在过滤条件包含子列时应用 PROJECTION 的问题。解决 [#92882](https://github.com/ClickHouse/ClickHouse/issues/92882)。[#93141](https://github.com/ClickHouse/ClickHouse/pull/93141)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在将 join 运行时过滤器添加到查询计划时，在某些情况下被触发的逻辑错误。该问题是由于从 join 的一侧错误地返回了重复的常量列而导致的。 [#93144](https://github.com/ClickHouse/ClickHouse/pull/93144) ([Alexander Gololobov](https://github.com/davenger)).
* 由 join 运行时过滤器使用的特殊函数 `__applyFilter` 在某些合法情况下会返回 ILLEGAL&#95;TYPE&#95;OF&#95;ARGUMENT。 [#93187](https://github.com/ClickHouse/ClickHouse/pull/93187) ([Alexander Gololobov](https://github.com/davenger))。
* 防止在插值列实际上是同一列的别名时，不同的插值列在同一个块中被折叠为同一列。[#93197](https://github.com/ClickHouse/ClickHouse/pull/93197) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在与已填充的右表进行 JOIN 时，不要添加运行时过滤器。 [#93211](https://github.com/ClickHouse/ClickHouse/pull/93211) ([Alexander Gololobov](https://github.com/davenger)).
* 修复 Keeper 在会话终止后未清理持久化 watch 的问题。此更改关闭了 [#92480](https://github.com/ClickHouse/ClickHouse/issues/92480)。[#93213](https://github.com/ClickHouse/ClickHouse/pull/93213)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 Iceberg 中的 ORDER BY 元组问题。由此关闭 [#92977](https://github.com/ClickHouse/ClickHouse/issues/92977)。[#93225](https://github.com/ClickHouse/ClickHouse/pull/93225)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 S3Queue 中 `s3queue_migrate_old_metadata_to_buckets` 设置的 bug。关闭 [#93392](https://github.com/ClickHouse/ClickHouse/issues/93392)、[#93196](https://github.com/ClickHouse/ClickHouse/issues/93196)、[#81739](https://github.com/ClickHouse/ClickHouse/issues/81739)。[#93232](https://github.com/ClickHouse/ClickHouse/pull/93232)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在合并过程中重建投影时移除未使用的列。这样可以减少内存使用并降低临时分区片段的数量。[#93233](https://github.com/ClickHouse/ClickHouse/pull/93233) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复在存在标量关联子查询时，从子查询中删除未使用列的问题。在修复之前，如果某列仅在关联子查询中使用，则可能会被删除，从而导致查询以 `NOT_FOUND_COLUMN_IN_BLOCK` 错误失败。 [#93273](https://github.com/ClickHouse/ClickHouse/pull/93273) ([Dmitry Novik](https://github.com/novikd)).
* 修复在对源表执行 ALTER 时，物化视图中可能出现的子列缺失问题。关闭 [#93231](https://github.com/ClickHouse/ClickHouse/issues/93231)。[#93276](https://github.com/ClickHouse/ClickHouse/pull/93276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在使用 analyzer 为 `Merge` 表引擎进行查询规划时，在合并本地和远程/Distributed 表的情况下，可能对 `hostName()` 抛出 ILLEGAL&#95;COLUMN 的问题。关闭 [#92059](https://github.com/ClickHouse/ClickHouse/issues/92059)。 [#93286](https://github.com/ClickHouse/ClickHouse/pull/93286) ([Jinlin](https://github.com/withlin))。
* 修复了在使用非常量数组参数时 NOT IN 返回错误结果的问题，并增加了对非常量 Array 函数的支持。关闭 [#14980](https://github.com/ClickHouse/ClickHouse/issues/14980)。[#93314](https://github.com/ClickHouse/ClickHouse/pull/93314)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复 `use_top_k_dynamic_filtering` 优化中的 `Not found column` 错误。修复 [#93186](https://github.com/ClickHouse/ClickHouse/issues/93186)。[#93316](https://github.com/ClickHouse/ClickHouse/pull/93316)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了在子列之上创建的文本索引的重建问题。 [#93326](https://github.com/ClickHouse/ClickHouse/pull/93326) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在 `hasAllTokens` 和 `hasAnyTokens` 函数中将空数组作为第二个参数时的处理逻辑。[#93328](https://github.com/ClickHouse/ClickHouse/pull/93328)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在包含右侧表 totals 且使用运行时过滤器的查询中的逻辑错误。 [#93330](https://github.com/ClickHouse/ClickHouse/pull/93330) ([Alexander Gololobov](https://github.com/davenger)).
* 当使用非 const 分词器参数（第 2、3、4 个参数）调用函数 `tokens` 时，例如 `SELECT tokens(NULL, 1, materialize(1))`，服务器不再崩溃。[#93383](https://github.com/ClickHouse/ClickHouse/pull/93383)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复了 `groupConcat` 状态反序列化中的整数溢出漏洞，该漏洞可能在处理精心构造的聚合状态时导致内存安全问题。 [#93426](https://github.com/ClickHouse/ClickHouse/pull/93426) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 修复了在数组列上进行文本索引分析时，当索引中不包含任何 token（所有数组为空或所有 token 都被分词器跳过）时的处理。 [#93457](https://github.com/ClickHouse/ClickHouse/pull/93457) ([Anton Popov](https://github.com/CurtizJ)).
* 如果连接字符串中已包含用户名/密码，则在 ClickHouse Client 中不再使用 OAuth 登录。[#93459](https://github.com/ClickHouse/ClickHouse/pull/93459)（[Krishna Mannem](https://github.com/kcmannem)）。
* 修复 DataLakeCatalog 中对 Azure ADLS Gen2 下发凭据的支持：从 Iceberg REST 目录中解析 `adls.sas-token.*` 键，并修正 ABFSS URL 的解析。[#93477](https://github.com/ClickHouse/ClickHouse/pull/93477)（[Karun Anantharaman](https://github.com/karunmotorq)）。
* 修复在使用分析器时对 GLOBAL IN 的支持（此前会在远程节点上再次创建 Set）。 [#93507](https://github.com/ClickHouse/ClickHouse/pull/93507) ([Azat Khuzhin](https://github.com/azat))。
* 修复在反序列化时直接将子列提取到稀疏列中的问题。[#93512](https://github.com/ClickHouse/ClickHouse/pull/93512) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在直接从文本索引读取时处理重复搜索查询的错误。 [#93516](https://github.com/ClickHouse/ClickHouse/pull/93516) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在启用运行时过滤器且连接的表中存在相同列被多次返回时（例如 SELECT a, a, a FROM t）出现的 NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK 错误。 [#93526](https://github.com/ClickHouse/ClickHouse/pull/93526) ([Alexander Gololobov](https://github.com/davenger))。
* 修复一个 bug：使用 SSH 连接时，clickhouse-client 会要求输入两次密码。 [#93547](https://github.com/ClickHouse/ClickHouse/pull/93547) ([Isak Ellmer](https://github.com/spinojara)).
* 确保在关闭时正确完成 ZooKeeper 的终止（修复在极少数情况下可能发生的关闭挂起问题）。 [#93602](https://github.com/ClickHouse/ClickHouse/pull/93602) ([Azat Khuzhin](https://github.com/azat)).
* 修复在恢复 ReplicatedMergeTree 时由去重竞态导致的 LOGICAL&#95;ERROR。 [#93612](https://github.com/ClickHouse/ClickHouse/pull/93612) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复了在某些输入格式中，直接反序列化到稀疏列时用于生存时间 (TTL) 更新的稀疏列用法。该修复解决了可能出现的逻辑错误 `Unexpected type of result TTL column`。 [#93619](https://github.com/ClickHouse/ClickHouse/pull/93619) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 h3 索引函数在使用无效输入调用时偶发崩溃或卡死的问题。[#93657](https://github.com/ClickHouse/ClickHouse/pull/93657) ([Michael Kolupaev](https://github.com/al13n321)).
* 对非 UTF-8 数据使用 `ngram_bf` 索引会导致未初始化内存读取，读取到的值可能被写入到生成的索引结构中。修复了 [#92576](https://github.com/ClickHouse/ClickHouse/issues/92576)。[#93663](https://github.com/ClickHouse/ClickHouse/pull/93663)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 验证解压后的缓冲区大小是否符合预期。 [#93690](https://github.com/ClickHouse/ClickHouse/pull/93690) ([Raúl Marín](https://github.com/Algunenano)).
* 防止用户在未具备 `SHOW COLUMNS` 权限时，通过 `merge` 表引擎从表中获取列列表。 [#93695](https://github.com/ClickHouse/ClickHouse/pull/93695) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了针对子列创建的跳过索引在物化时的问题。 [#93708](https://github.com/ClickHouse/ClickHouse/pull/93708) ([Anton Popov](https://github.com/CurtizJ)).
* 我们将各存储对象的共享指针保存在 `QueryPipeline::resources::storage_holders` 中，以确保在 `PipelineExecutor` 仍然存活时不会销毁 `IStorage` 对象。 [#93746](https://github.com/ClickHouse/ClickHouse/pull/93746) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复在重启后 interserver 主机发生变化时附加 Replicated 数据库失败的问题。 [#93779](https://github.com/ClickHouse/ClickHouse/pull/93779) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在启用缓存时会在 `ReadBufferFromS3` 中触发的断言 `!read_until_position` 问题。 [#93809](https://github.com/ClickHouse/ClickHouse/pull/93809) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了在极少数情况下将空元组用于 `Map` 列时的逻辑错误。关闭了 [#93784](https://github.com/ClickHouse/ClickHouse/issues/93784)。[#93814](https://github.com/ClickHouse/ClickHouse/pull/93814)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复了在合并期间重建投影时 `_part_offset` 出现损坏的问题，并通过避免对 `_part_offset` 列的不必要读取，以及在投影计算中跳过不需要的列来优化投影处理。此更改延续了在 [#93233](https://github.com/ClickHouse/ClickHouse/issues/93233) 中引入的优化。[#93827](https://github.com/ClickHouse/ClickHouse/pull/93827)（[Amos Bird](https://github.com/amosbird)）。
* 删除对 &#39;Bad version&#39; 的处理。[#93843](https://github.com/ClickHouse/ClickHouse/pull/93843) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 修复当键为有符号整数类型时，`optimize_inverse_dictionary_lookup` 在分布式查询中不生效的问题。修复 [#93259](https://github.com/ClickHouse/ClickHouse/issues/93259)。[#93848](https://github.com/ClickHouse/ClickHouse/pull/93848)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复了在分布式 `remote()` 查询中 `lag`/`lead` 无法使用的问题。关闭 [#90014](https://github.com/ClickHouse/ClickHouse/issues/90014)。[#93858](https://github.com/ClickHouse/ClickHouse/pull/93858)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复系统监控分发问题。 [#93937](https://github.com/ClickHouse/ClickHouse/pull/93937) ([Pablo Marcos](https://github.com/pamarcos)).
* 在 https://github.com/ClickHouse/ClickHouse/pull/89173 中，我们在通过内部管道由 `TraceSender` 发送的结构体中添加了一个额外字段。但是缓冲区大小并未更新（见[这里](https://github.com/ClickHouse/ClickHouse/pull/89173/changes#diff-36ecfac5cde34c92c031652d8a77f0d12782cd5d43e68d6ef159e6d46a54224fL44)），因此我们向缓冲区写入了超过 `buffer_size` 的数据，导致缓冲区被多次 flush。并且由于 `TraceSender::send` 是在不同线程中被调用的，不同线程的 flush 可能交错，从而破坏接收端（`TraceCollector`）所依赖的不变式。[#93966](https://github.com/ClickHouse/ClickHouse/pull/93966)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复在使用 `USING` 子句进行连接操作时，存储引擎 `Join` 执行向超类型类型转换的问题。修复了 [#91672](https://github.com/ClickHouse/ClickHouse/issues/91672)。修复了 [#78572](https://github.com/ClickHouse/ClickHouse/issues/78572)。[#94000](https://github.com/ClickHouse/ClickHouse/pull/94000)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在对 Merge 表应用 join 运行时过滤器时未正确添加 FilterStep 的问题。[#94021](https://github.com/ClickHouse/ClickHouse/pull/94021)（[Alexander Gololobov](https://github.com/davenger)）。
* 包含在多个列上使用谓词、带有 Bloom 过滤器跳过索引，并同时包含 `OR` 和 `NOT` 条件的 `SELECT` 查询，此前可能会返回不一致的结果。该问题现已修复。[#94026](https://github.com/ClickHouse/ClickHouse/pull/94026) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复在存在依赖索引时对 CLEAR 列的处理问题。 [#94057](https://github.com/ClickHouse/ClickHouse/pull/94057) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `ReadWriteBufferFromHTTP` 中 use-of-uninitialized-value（使用未初始化值）的问题。 [#94058](https://github.com/ClickHouse/ClickHouse/pull/94058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复对 JSON 中带类型的路径的不正确检查。该检查在 https://github.com/ClickHouse/ClickHouse/pull/92842 中引入，并可能在启动现有表时导致错误。 [#94070](https://github.com/ClickHouse/ClickHouse/pull/94070) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在存在 OUTER JOIN 时执行过滤分析时出现的崩溃。解决了 [#90979](https://github.com/ClickHouse/ClickHouse/issues/90979)。[#94080](https://github.com/ClickHouse/ClickHouse/pull/94080)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在并行情况下（`max_threads` &gt; 1，默认设置）使用 UInt8 聚合键时 `uniqTheta` 的精度问题。[#94095](https://github.com/ClickHouse/ClickHouse/pull/94095) ([Azat Khuzhin](https://github.com/azat)).
* 修复由于在 `SCOPE_EXIT` 中调用 `socket.setBlocking(true)` 时抛出异常而导致的崩溃。[#94100](https://github.com/ClickHouse/ClickHouse/pull/94100)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复在 ReplicatedMergeTree 中，`DROP PARTITION` 会删除由后续日志记录创建的分区片段时导致的数据丢失问题。 [#94123](https://github.com/ClickHouse/ClickHouse/pull/94123) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复了 parquet reader v3 在处理跨页面边界的数组时的错误行为。比如，当读取由 Arrow 写出但未启用页面统计或页面索引的文件时会出现这种情况。仅影响 Array 数据类型的列。典型表现是大约每 1 MB 数据就会有一个数组被截断。在此修复之前，可以使用如下设置作为临时解决方案：`input_format_parquet_use_native_reader_v3 = 0`。[#94125](https://github.com/ClickHouse/ClickHouse/pull/94125) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复 ReplicatedMergeTree 在等待日志条目时 watch 数量过多的问题。[#94133](https://github.com/ClickHouse/ClickHouse/pull/94133)（[Azat Khuzhin](https://github.com/azat)）。
* 函数 `arrayShuffle`、`arrayPartialShuffle` 和 `arrayRandomSample` 用于将 const 列物化，以便不同的行得到不同的结果。[#94134](https://github.com/ClickHouse/ClickHouse/pull/94134) ([Joanna Hulboj](https://github.com/jh0x))。
* 修复在 materialized view 中执行表函数时的数据竞争问题。[#94171](https://github.com/ClickHouse/ClickHouse/pull/94171) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 `PostgreSQL` 数据库引擎中因查询不正确而导致的 `nullptr` 解引用问题。关闭 [#92887](https://github.com/ClickHouse/ClickHouse/issues/92887)。[#94180](https://github.com/ClickHouse/ClickHouse/pull/94180)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复了在可刷新materialized view 中使用包含多个子查询的 `SELECT` 查询时发生的内存泄漏问题。[#94200](https://github.com/ClickHouse/ClickHouse/pull/94200)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复了 `DataPartStorageOnDiskBase::remove` 与 `system.parts` 之间的数据竞争问题。关闭 [#49076](https://github.com/ClickHouse/ClickHouse/issues/49076)。[#94262](https://github.com/ClickHouse/ClickHouse/pull/94262)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 移除 HashTable 复制赋值运算符上错误使用的 `noexcept` 说明符，该说明符可能在发生内存异常时导致程序崩溃（调用 `std::terminate`）。[#94275](https://github.com/ClickHouse/ClickHouse/pull/94275)（[Nikita Taranov](https://github.com/nickitat)）。
* 此前，在 `GROUP BY` 中使用重复列（例如 `GROUP BY c0, c0`）创建投影并插入数据时，如果启用了 `optimize_row_order`，会抛出 `std::length_error`。修复了 [#94065](https://github.com/ClickHouse/ClickHouse/issues/94065)。[#94277](https://github.com/ClickHouse/ClickHouse/pull/94277)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 ZooKeeper 客户端在连接时的一个隐蔽 Bug，该问题会导致进程卡死或崩溃。 [#94320](https://github.com/ClickHouse/ClickHouse/pull/94320) ([Azat Khuzhin](https://github.com/azat)).
* 修复“将函数下推到子列”的优化未实际应用到子列的问题。 [#94323](https://github.com/ClickHouse/ClickHouse/pull/94323) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在启用 `enable_lazy_columns_replication` 的情况下，嵌套 RIGHT JOIN 中可能出现的不正确结果。该缺陷导致在被复制的列中，所有行错误地返回相同的值，而非各自不同的值。关闭 [#93891](https://github.com/ClickHouse/ClickHouse/issues/93891)。[#94339](https://github.com/ClickHouse/ClickHouse/pull/94339)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复基于等价集的 SEMI JOIN 过滤下推。当参数类型发生变化时，不要下推该过滤条件。修复了 [#93264](https://github.com/ClickHouse/ClickHouse/issues/93264)。[#94340](https://github.com/ClickHouse/ClickHouse/pull/94340)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 DeltaLake CDF 与 DataLake 数据库引擎中数据库的配合使用问题（Delta Lake 目录集成）。关闭 [#94122](https://github.com/ClickHouse/ClickHouse/issues/94122)。[#94342](https://github.com/ClickHouse/ClickHouse/pull/94342)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在使用 `SLRU` 缓存策略时，修复当前指标 `FilesystemCacheSizeLimit` 的取值错误。[#94363](https://github.com/ClickHouse/ClickHouse/pull/94363)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在创建 Backup 数据库引擎时，如果提供的参数少于两个，现在会返回更具描述性的错误消息（`Wrong number of arguments`，而不是 `std::out_of_range: InlinedVector::at(size_type) const failed bounds check.`）。 [#94374](https://github.com/ClickHouse/ClickHouse/pull/94374) ([Robert Schulze](https://github.com/rschu1ze))。
* 在数据库级别撤销带有 `GRANT OPTION` 的全局授权时，会忽略那些实际上不可能执行的撤销操作。[#94386](https://github.com/ClickHouse/ClickHouse/pull/94386) ([pufit](https://github.com/pufit))。
* 修复从紧凑分区片段读取稀疏偏移量时的问题。关闭 [#94385](https://github.com/ClickHouse/ClickHouse/issues/94385)。[#94399](https://github.com/ClickHouse/ClickHouse/pull/94399)（[Pavel Kruglov](https://github.com/Avogar)）。
* 即使在 `alter_column_secondary_index_mode` 处于 `throw` 模式时，也不再阻止对使用隐式索引的列执行 ALTER 操作。[#94425](https://github.com/ClickHouse/ClickHouse/pull/94425) ([Raúl Marín](https://github.com/Algunenano))。
* 修复当多次调用 `receivePacketsExpectQuery` 读取 `Protocol::Client::IgnoredPartUUIDs` 时 `TCPHandler` 崩溃的问题。[#94434](https://github.com/ClickHouse/ClickHouse/pull/94434) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复 `system.functions` 中敏感数据脱敏的问题。 [#94436](https://github.com/ClickHouse/ClickHouse/pull/94436) ([Vitaly Baranov](https://github.com/vitlibar))。
* 修复在禁用 `send_profile_events` 时出现的空指针（`nullptr`）解引用问题。该功能是最近在 ClickHouse Python 驱动中引入的。关闭了 [#92488](https://github.com/ClickHouse/ClickHouse/issues/92488)。[#94466](https://github.com/ClickHouse/ClickHouse/pull/94466)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在合并过程中出现的文本索引与 .mrk 文件不兼容的问题。[#94494](https://github.com/ClickHouse/ClickHouse/pull/94494)（[Peng Jian](https://github.com/fastio)）。
* 当启用 `read_in_order_use_virtual_row` 时，代码在未检查索引是否被截断的情况下，仍按完整主键大小访问索引列，从而导致 use-after-free / 未初始化内存问题。修复了 [#85596](https://github.com/ClickHouse/ClickHouse/issues/85596)。[#94500](https://github.com/ClickHouse/ClickHouse/pull/94500)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在使用 GLOBAL IN 的子查询发送外部表时，当类型为 Nullable 时产生的类型不匹配错误。关闭 [#94097](https://github.com/ClickHouse/ClickHouse/issues/94097)。[#94511](https://github.com/ClickHouse/ClickHouse/pull/94511)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在之前的版本中，对同一表达式具有多个索引条件的查询可能会错误地抛出异常 `Not found column`。修复了 [#60660](https://github.com/ClickHouse/ClickHouse/issues/60660)。[#94515](https://github.com/ClickHouse/ClickHouse/pull/94515)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在运行时过滤器中对 Nullable JOIN 列的不正确处理。[#94555](https://github.com/ClickHouse/ClickHouse/pull/94555)（[Alexander Gololobov](https://github.com/davenger)）。
* 在正在使用的 workload 中创建新的 workload 不再会导致崩溃。[#94599](https://github.com/ClickHouse/ClickHouse/pull/94599)（[Sergei Trifonov](https://github.com/serxa)）。
* 修复在进行 ANY LEFT JOIN 优化时，对不存在的列计算 `isNotNull` 会导致的崩溃。[#94600](https://github.com/ClickHouse/ClickHouse/pull/94600)（[Molly](https://github.com/ggmolly)）。
* 修复在默认表达式引用具有计算默认值的其他列时的求值问题。[#94615](https://github.com/ClickHouse/ClickHouse/pull/94615) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 BACKUP/RESTORE 操作中的权限问题。[#94617](https://github.com/ClickHouse/ClickHouse/pull/94617)（[Pablo Marcos](https://github.com/pamarcos)）。
* 修复在数据类型为 `Nullable(DateTime64)` 时由于错误的类型转换导致的崩溃。[#94627](https://github.com/ClickHouse/ClickHouse/pull/94627)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复了一个错误：某些带有 `ORDER BY` 的分布式查询可能会返回值被对调的 `ALIAS` 列（即列 `a` 显示为列 `b` 的数据，反之亦然）。[#94644](https://github.com/ClickHouse/ClickHouse/pull/94644) ([filimonov](https://github.com/filimonov)).
* 修复 keeper-bench 结果写入文件时的问题。[#94654](https://github.com/ClickHouse/ClickHouse/pull/94654) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在列包含负浮点数时使用 MinMax 类型统计信息导致的估计不准确问题。 [#94665](https://github.com/ClickHouse/ClickHouse/pull/94665) ([zoomxi](https://github.com/zoomxi)).
* 修复在 map 的键为 struct 时读取 Parquet 文件的问题。[#94670](https://github.com/ClickHouse/ClickHouse/pull/94670) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 修复在使用复杂 ON 条件时，RIGHT join 可能产生的不正确结果。关闭 [#92913](https://github.com/ClickHouse/ClickHouse/issues/92913)。[#94680](https://github.com/ClickHouse/ClickHouse/pull/94680)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 Vertical 合并后保留固定索引粒度（use&#95;const&#95;adaptive&#95;granularity）。[#94725](https://github.com/ClickHouse/ClickHouse/pull/94725)（[Azat Khuzhin](https://github.com/azat)）。
* 修复与标量子查询和表依赖关系相关的变更（mutation）错误。如果某个表在某列上存在依赖（索引或 PROJECTION），标量子查询可能在没有数据的情况下被求值并缓存，从而导致不正确的更改。[#94731](https://github.com/ClickHouse/ClickHouse/pull/94731) ([Raúl Marín](https://github.com/Algunenano))。
* 修复 AsynchronousMetrics 在出错时使用 cpu&#95;pressure 作为回退方案的行为。[#94827](https://github.com/ClickHouse/ClickHouse/pull/94827)（[Raúl Marín](https://github.com/Algunenano)）。
* 在解引用指针之前，`getURLHostRFC` 函数缺少边界检查。当向 `domainRFC` 传递空字符串时，它会读取未初始化的内存，从而触发 MSan 错误。[#94851](https://github.com/ClickHouse/ClickHouse/pull/94851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复加密磁盘变为只读的问题。[#94852](https://github.com/ClickHouse/ClickHouse/pull/94852) ([Azat Khuzhin](https://github.com/azat)).
* 修复在旧分析器下对分布式表使用分数形式 `LIMIT/OFFSET` 时的逻辑错误。关闭 [#94712](https://github.com/ClickHouse/ClickHouse/issues/94712)。[#94999](https://github.com/ClickHouse/ClickHouse/pull/94999)（[Ahmed Gouda](https://github.com/0xgouda)）。
* 修复在默认启用 join 运行时过滤器的情况下于某些条件下发生的崩溃。[#95000](https://github.com/ClickHouse/ClickHouse/pull/95000) ([Alexander Gololobov](https://github.com/davenger))。
* 改进对表引擎 `URL()` 和表函数 `url()` 所使用 URL 中密码的掩码处理。[#95006](https://github.com/ClickHouse/ClickHouse/pull/95006) ([Vitaly Baranov](https://github.com/vitlibar))。
* 当 `enable_extended_results_for_datetime_functions` 启用时，`toStartOfInterval` FUNCTION 的行为现在与 `toStartOfX` 相同，其中 `X` 为 `Day, Week, Month, Quarter, Year`。 [#95011](https://github.com/ClickHouse/ClickHouse/pull/95011) ([Kirill Kopnev](https://github.com/Fgrtue)).
* 修复了常量字符串比较未遵循 `cast_string_to_date_time_mode`、`bool_true_representation`、`bool_false_representation` 和 `input_format_null_as_default` 等 SETTING 的问题。关闭 [#91681](https://github.com/ClickHouse/ClickHouse/issues/91681)。[#95040](https://github.com/ClickHouse/ClickHouse/pull/95040)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复文件系统缓存中的数据竞态问题。 [#95064](https://github.com/ClickHouse/ClickHouse/pull/95064) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 Parquet 读取器中的一个罕见竞态条件。 [#95068](https://github.com/ClickHouse/ClickHouse/pull/95068) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 `LIMIT` 为零时 top K 优化中发生的崩溃。关闭 [#93893](https://github.com/ClickHouse/ClickHouse/issues/93893)。[#95072](https://github.com/ClickHouse/ClickHouse/pull/95072)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 从 DateTime/整数转换为 Time64 会使用 `toTime` 提取一天中的时间部分，但该函数不是单调的。`ToDateTimeMonotonicity` 模板错误地将此转换标记为单调的，导致在调试构建中出现 &quot;Invalid binary search result in MergeTreeSetIndex&quot; 异常。[#95125](https://github.com/ClickHouse/ClickHouse/pull/95125) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 仅在必要时才重新生成清单文件中的条目列表（此前会在每次迭代时都重新生成）。 [#95162](https://github.com/ClickHouse/ClickHouse/pull/95162) ([Daniil Ivanik](https://github.com/divanik))。

#### 构建 / 测试 / 打包改进 \{#buildtestingpackaging-improvement\}

* 添加了一组工具，用于利用 jemalloc 的堆分析能力对 ClickHouse SQL 解析器中的内存分配进行剖析。[#94072](https://github.com/ClickHouse/ClickHouse/pull/94072) ([Ilya Yatsishin](https://github.com/qoega))。
* 添加了一个简化解析器内存分配调试的工具。它在将查询解析为 AST 表示之前和之后使用 jemalloc 的 `stats.allocated` 指标来展示具体的内存分配情况。同时，它支持内存分析模式，会在解析前后转储 profile，以生成报告展示内存分配发生的位置。[#93523](https://github.com/ClickHouse/ClickHouse/pull/93523) ([Ilya Yatsishin](https://github.com/qoega))。
* 移除传递性的 libc++ 头文件包含。[#92523](https://github.com/ClickHouse/ClickHouse/pull/92523) ([Raúl Marín](https://github.com/Algunenano))。
* 将部分顺序测试改为并行执行：https://github.com/ClickHouse/ClickHouse/pull/93030/changes#diff-c3a73510dae653c9bbfa24300b32f5d6ec663fd4e72cc4a3d5daa6e4342915df。[#93030](https://github.com/ClickHouse/ClickHouse/pull/93030) ([Nikita Fomichev](https://github.com/fm4v))。
* 清理部分构建标志。[#93679](https://github.com/ClickHouse/ClickHouse/pull/93679) ([Raúl Marín](https://github.com/Algunenano))。
* 将 c-ares 从 v1.34.5 升级到 v1.34.6。这解决了 c-ares 的 `CVE-2025-62408`，该问题与 ClickHouse 无关。[#94129](https://github.com/ClickHouse/ClickHouse/pull/94129) ([Govind R Nair](https://github.com/Revertionist))。
* 使用 `curl` 8.18.0。[#94742](https://github.com/ClickHouse/ClickHouse/pull/94742) ([Konstantin Bogdanov](https://github.com/thevar1able))。
