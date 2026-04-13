---
description: '2026 年变更日志'
note: '此文件通过 yarn build 生成'
slug: /whats-new/changelog/
sidebar_position: -9998
sidebar_label: '2026'
title: '2026 年变更日志'
doc_type: 'changelog'
---

### ClickHouse 26.3 LTS 发布，2026-03-26。[演示文稿](https://presentations.clickhouse.com/)、[视频](https://www.youtube.com/watch?v=_bY0ucNB1lQ) \{#263\}

#### 不兼容变更 \{#backward-incompatible-change\}

* 升级后再降级可能会导致数据丢失。将数据类型的序列化版本传递到嵌套数据类型中。例如，String 的序列化版本 `with_size_stream` 之前仅应用于顶层 String 列和 Tuple 元素。现在，它会应用于任何嵌套类型 (如 `Array`/`Map`/`Variant`/`JSON`/etc.) 中的任意 String 类型。这种行为由 MergeTree 设置 `propagate_types_serialization_versions_to_nested_types` 控制，且该设置现已默认启用。此修改后，新创建的数据分区片段无法被旧版本读取，但旧 parts 仍可在新版本中正常读取。**升级是安全的，但降级则不安全——如果您在升级到 26.3 后需要回滚，则 26.3 在包含嵌套类型的列中写入的数据将无法读取！** 详情请参见 [#101429](https://github.com/ClickHouse/ClickHouse/issues/101429) 。[#94859](https://github.com/ClickHouse/ClickHouse/pull/94859) ([Pavel Kruglov](https://github.com/Avogar)).
* 移除 `hypothesis` 跳过索引类型。这是一项冷门的 Experimental 功能，实际用途有限。现在，使用 `INDEX ... TYPE hypothesis` 创建表会报错。[#96874](https://github.com/ClickHouse/ClickHouse/pull/96874) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 移除处于 Experimental 阶段的 `detectProgrammingLanguage` 函数。[#99567](https://github.com/ClickHouse/ClickHouse/pull/99567) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `NOT` 运算符的优先级以符合 SQL 标准：`NOT` 现在的优先级低于 `IS NULL`、`BETWEEN`、`LIKE` 和算术运算符。例如，`NOT (x) IS NULL` 现在会被解析为 `NOT (x IS NULL)`，而不是 `(NOT x) IS NULL`。这可能会改变依赖此前 (非标准) 行为的查询结果。[#97680](https://github.com/ClickHouse/ClickHouse/pull/97680) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修正了普通投影的元数据，使具有多列排序键的投影能够被正确识别。这是在 [#90429](https://github.com/ClickHouse/ClickHouse/issues/90429) 的基础上进一步完善的。[#91352](https://github.com/ClickHouse/ClickHouse/pull/91352) ([Amos Bird](https://github.com/amosbird)) 。
* 修复了跳过索引文件未遵循 replace&#95;long&#95;file&#95;name&#95;to&#95;hash 设置的问题；该问题会导致出现 &quot;File name too long&quot; 错误，并使名称较长的索引无法正常读取。现在，当跳过索引文件名超过 max&#95;file&#95;name&#95;length 时，会像列文件一样对文件名进行哈希处理。这一更改向后兼容 (新服务器可读取旧 parts) ，但降级 (或滚动升级期间使用旧服务器) 可能导致名称较长的索引被忽略。[#97128](https://github.com/ClickHouse/ClickHouse/pull/97128) ([Raúl Marín](https://github.com/Algunenano)).
* 默认启用异步插入。ClickHouse 现在会默认将所有小型插入按批次处理。此设置在 compatibility 中配置。如果您设置 `compatibility=<version less than 26.2>`，则默认值将恢复为之前的值，即 `false`。您可以在多个层级启用或禁用异步插入：在用户 profile 配置中、在会话级别、查询级别，或在 MergeTree 表级别。[#97590](https://github.com/ClickHouse/ClickHouse/pull/97590) ([Sema Checherinda](https://github.com/CheSema))。
* 将 `mysql_datatypes_support_level` 的默认值从空改为 `decimal,datetime64,date2Date32`，默认启用将 MySQL `DATE` 正确映射到 `Date32`、将 `DECIMAL`/`NUMERIC` 映射到 `Decimal`，以及将带精度的 `DATETIME`/`TIMESTAMP` 映射到 `DateTime64`。此前，MySQL `DATE` 列会被映射到 `Date`，而后者无法表示 1970-01-01 之前的日期，从而导致数据损坏。[#97716](https://github.com/ClickHouse/ClickHouse/pull/97716) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 由于正则表达式较慢，`mergeTreeAnalyzeIndexes{,UUID}` 现支持接受 part 名称数组，而不是 regexp (*Experimental 功能*)。[#98474](https://github.com/ClickHouse/ClickHouse/pull/98474) ([Azat Khuzhin](https://github.com/azat)).
* 将可执行用户定义函数的默认 `stderr_reaction` 从 `throw` 修改为 `log_last`。UDFs 在向 stderr 写入警告且退出代码为 0 时将不再失败。退出代码异常现在会包含 stderr 的内容。[#99232](https://github.com/ClickHouse/ClickHouse/pull/99232) ([Xu Jia](https://github.com/XuJia0210)).

#### 新特性 \{#new-feature\}

* 为 MergeTree 中的 Map 列新增了分桶序列化支持 (`map_serialization_version = 'with_buckets'`) 。键会按哈希拆分到不同的桶中，因此读取单个键 (`m['key']`) 时只需读取一个桶，而不是整个列，从而根据 Map 大小将单键查找速度提升 2 到 49 倍。桶的数量和分桶策略可通过新的 MergeTree 设置进行控制：`map_serialization_version`、`max_buckets_in_map`、`map_buckets_strategy`、`map_buckets_coefficient` 和 `map_buckets_min_avg_size`。[#99200](https://github.com/ClickHouse/ClickHouse/pull/99200) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 支持物化 CTE。允许在查询执行期间仅计算一次 CTE，并将结果存储在临时表中。关闭 [#53449](https://github.com/ClickHouse/ClickHouse/issues/53449)。[#94849](https://github.com/ClickHouse/ClickHouse/pull/94849) ([Dmitry Novik](https://github.com/novikd)) 。
* 允许某些符合 SQL 标准的函数在不加括号时也能使用，以保持兼容性，例如 `NOW`。关闭 [#52102](https://github.com/ClickHouse/ClickHouse/issues/52102)。[#95949](https://github.com/ClickHouse/ClickHouse/pull/95949) ([Aly Kafoury](https://github.com/AlyHKafoury)) 。
* 您现在可以使用自然排序键函数 `naturalSortKey(s)`。[#90322](https://github.com/ClickHouse/ClickHouse/pull/90322) ([Nazarii Piontko](https://github.com/nazarii-piontko)) 。
* 您现在可以为 JSONExtract 函数使用原生的 JSON/Object 输入。修复了 [#88370](https://github.com/ClickHouse/ClickHouse/issues/88370)。[#96711](https://github.com/ClickHouse/ClickHouse/pull/96711) ([Fisnik Kastrati](https://github.com/fkastrati)).
* 如果某个查询参数的类型为 `Nullable`，且未显式指定，则会假定其值为 `NULL`。[#93869](https://github.com/ClickHouse/ClickHouse/pull/93869) ([Vikash Kumar](https://github.com/vikashkumar2020)) 。
* 支持 `Replicated` 数据库使用辅助 ZooKeeper。[#95590](https://github.com/ClickHouse/ClickHouse/pull/95590) ([RinChanNOW](https://github.com/RinChanNOWWW)) 。
* 支持对 JSON 类型使用 `has` 函数来检查路径是否存在，类似于 `Map`。 [#96927](https://github.com/ClickHouse/ClickHouse/pull/96927) ([DQ](https://github.com/il9ue)).
* 新增了 `mergeTreeTextIndex(database, table, index)` 表函数，可直接从文本索引中读取数据。该函数可用于内省，或基于文本索引数据执行聚合。 [#97003](https://github.com/ClickHouse/ClickHouse/pull/97003) ([Anton Popov](https://github.com/CurtizJ)).
* 新增 `table_readonly` MergeTree 设置，可将表标记为只读，从而防止插入和修改。[#97652](https://github.com/ClickHouse/ClickHouse/pull/97652) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增设置 `use_partition_pruning` 及其别名 `use_partition_key`。将其设为 `false` 以禁用基于分区键的分区剪枝。[#97888](https://github.com/ClickHouse/ClickHouse/pull/97888) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 支持对 Iceberg 表执行 `ALTER TABLE ... EXECUTE expire_snapshots('<timestamp>')`。[#97904](https://github.com/ClickHouse/ClickHouse/pull/97904) ([murphy-4o](https://github.com/murphy-4o))。[#99130](https://github.com/ClickHouse/ClickHouse/pull/99130)
* 允许 `<protocols>` 中每个 `type=http` 条目指定自定义的 `<handlers>` 键，使其指向单独的 `<http_handlers_*>` 配置节，从而为各端口启用不同的 HTTP 路由规则。[#98414](https://github.com/ClickHouse/ClickHouse/pull/98414) ([Amos Bird](https://github.com/amosbird)).
* 为 `EXPLAIN` 添加 `pretty=1` 设置以输出树状缩进格式，并添加 `compact=1` 以折叠 `Expression` 步骤，让查询计划更易读。[#98500](https://github.com/ClickHouse/ClickHouse/pull/98500) ([Kirill Kopnev](https://github.com/Fgrtue))。
* 新增 `restore_access_entities_with_current_grants` 服务器设置。启用后，从备份中恢复的用户/角色，其授权会被限制在执行恢复操作的用户有权授予的范围内 (语义与 `GRANT CURRENT GRANTS` 相同) ，而不会因 `ACCESS_DENIED` 而失败。[#98795](https://github.com/ClickHouse/ClickHouse/pull/98795) ([pufit](https://github.com/pufit)).
* 新增 `caseFoldUTF8` 和 `removeDiacriticsUTF8` 函数，用于 Unicode 大小写折叠和去除变音符号。[#98973](https://github.com/ClickHouse/ClickHouse/pull/98973) ([George Larionov](https://github.com/george-larionov)).
* 新增 `normalizeUTF8NFKCCasefold` 字符串函数，用于执行 NFKC&#95;Casefold Unicode 规范化，将 NFKC 规范化与大小写折叠结合起来。[#99276](https://github.com/ClickHouse/ClickHouse/pull/99276) ([George Larionov](https://github.com/george-larionov)) 。
* 为全文索引和 `tokens` 函数新增 `asciiCJK` 分词器。它按 Unicode 单词边界规则拆分文本：ASCII 单词可包含连接字符 (下划线、冒号、点号、单引号) ，而非 ASCII 的 Unicode 字符则会被拆分为单字符标记。[#99357](https://github.com/ClickHouse/ClickHouse/pull/99357) ([Amos Bird](https://github.com/amosbird)) 。
* 新增 `max_skip_unavailable_shards_num` 和 `max_skip_unavailable_shards_ratio` 设置，用于限制在启用 `skip_unavailable_shards` 时可静默跳过的分片数。如果不可用分片的数量或占比超过配置的阈值，则会抛出异常，而不是静默返回不完整的结果。[#99369](https://github.com/ClickHouse/ClickHouse/pull/99369) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 现在，用户可以在子查询表达式中使用 `SOME` 关键字。其行为与 `ANY` 完全一致。[#99842](https://github.com/ClickHouse/ClickHouse/pull/99842) ([Artem Kytkin](https://github.com/Vinceent)).
* 新增 `output_format_trim_fixed_string` 设置，用于在文本输出格式中去除 `FixedString` 值末尾的空字节。[#97558](https://github.com/ClickHouse/ClickHouse/pull/97558) ([NeedmeFordev](https://github.com/spider-yamet)) 。
* 支持在 FROM 子句中使用加括号的表连接表达式，例如 `SELECT * FROM (t1 CROSS JOIN t2)`。[#97650](https://github.com/ClickHouse/ClickHouse/pull/97650) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 实现函数 `toDaysInMonth`：返回指定日期所在月份的天数。[#99227](https://github.com/ClickHouse/ClickHouse/pull/99227) ([Vitaly Baranov](https://github.com/vitlibar))。

#### Experimental 功能 \{#experimental-feature\}

* 新增对基于 WebAssembly 的用户定义函数 (UDF) 的 Experimental 支持，允许在 WebAssembly 中实现自定义函数逻辑，并在 ClickHouse 内执行。特别感谢 [Alexey Smirnov](https://github.com/lioshik) 贡献了 Wasmtime 后端支持。[#88747](https://github.com/ClickHouse/ClickHouse/pull/88747) ([Vladimir Cherkasov](https://github.com/vdimir)) 。同时还对 WASM UDF 支持进行了增量改进。[#99373](https://github.com/ClickHouse/ClickHouse/pull/99373) ([Vasily Chekalkin](https://github.com/bacek)) 。
* 新增通过 `polyglot` 库支持外部 SQL 方言。[#99496](https://github.com/ClickHouse/ClickHouse/pull/99496) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 新增 `ALP` 浮点压缩编解码器 (对于不可压缩的 double，不使用 ALP&#95;rd 回退) 。[#91362](https://github.com/ClickHouse/ClickHouse/pull/91362) ([Nazarii Piontko](https://github.com/nazarii-piontko)) 。
* 为 `JSON` 列新增 Experimental 惰性类型提示支持。通过 `allow_experimental_json_lazy_type_hints` 启用后，仅添加或修改类型提示的 `ALTER TABLE ... MODIFY COLUMN json JSON(path TypeName)` 会作为纯元数据操作立即完成，而无需重写历史数据。对于旧 parts，类型提示会在查询时生效；在 INSERT 和后台合并期间则会被物化。[#97412](https://github.com/ClickHouse/ClickHouse/pull/97412) ([tanner-bruce](https://github.com/tanner-bruce)) 。
* 为 YTsaurus 表引擎启用并行读取。[#97343](https://github.com/ClickHouse/ClickHouse/pull/97343) ([MikhailBurdukov](https://github.com/MikhailBurdukov)) 。

#### 性能优化 \{#performance-improvement\}

* 提升数据湖性能。在之前的版本中，从对象存储读取时，管道不会根据处理线程数自动调整大小。这在多核机器上可带来数量级的性能提升 (约 40 倍) 。[#99548](https://github.com/ClickHouse/ClickHouse/pull/99548) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 现在，`enable_parallel_replicas` 与 `automatic_parallel_replicas_mode` 之间的关系如下：只有当 `enable_parallel_replicas > 0` 时，查询才能使用并行副本。此外，如果 `automatic_parallel_replicas_mode=1`，则是否使用并行副本会在计划阶段根据先前收集的统计信息决定。如果 `automatic_parallel_replicas_mode=0`，则所有受支持的查询都会使用并行副本，而不考虑任何统计信息。一个值得注意的例外是使用并行副本的分布式 insert-select：在这种情况下，查询始终会像 `automatic_parallel_replicas_mode=0` 那样执行。[#97517](https://github.com/ClickHouse/ClickHouse/pull/97517) ([Nikita Taranov](https://github.com/nickitat)) 。
* 当谓词包含任意比较运算符 (`=`, `<`, `>`, `!=`) ，且分区键被包裹在一串决定论函数中时，允许进行分区剪枝 (例如，`PARTITION BY x` 以及 `cityHash64(x) % 5 > 2`、`toYYYYMM(x) < 2026`、`toYYYYMM(x) = 2026` 或 `toYYYYMM(x) != 2026` 这类谓词，都会使用分区键进行剪枝) 。关闭 [#28800](https://github.com/ClickHouse/ClickHouse/issues/28800)。[#98432](https://github.com/ClickHouse/ClickHouse/pull/98432) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 当 `CAST` 的目标类型为 `Nullable` 且转换具有单调性时，支持按序读取优化和主键剪枝；例如，在 `PRIMARY KEY x` 的情况下，ClickHouse 可以对 `ORDER BY x::Nullable(UInt64)` 使用按序读取优化，并对 `WHERE x::Nullable(UInt64) > 500000` 这类谓词条件应用主键剪枝。 [#98482](https://github.com/ClickHouse/ClickHouse/pull/98482) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 当整型列与浮点字面量比较时，现已支持索引剪枝和过滤条件下推；例如，`WHERE x < 10.5` 这类谓词现在可以使用主键进行剪枝，而 `prime < 1e9` 或 `number < 1e5` 这类过滤条件现在也会下推到 `primes()` 和 `numbers()` 表函数中，而不会导致无界执行。关闭 [#85167](https://github.com/ClickHouse/ClickHouse/issues/85167)。[#98516](https://github.com/ClickHouse/ClickHouse/pull/98516) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 新增了用于 Parquet 元数据的 SLRU 缓存，无需仅为读取元数据而重新下载文件，从而提升了读取性能。[#98140](https://github.com/ClickHouse/ClickHouse/pull/98140) ([Grant Holly](https://github.com/grantholly-clickhouse)) 。
* 支持根据优化器统计信息对 ANTI、SEMI 和 FULL 连接的两侧进行互换。[#97498](https://github.com/ClickHouse/ClickHouse/pull/97498) ([Hechem Selmi](https://github.com/m-selmi)).
* 优化 `pointInPolygon` 在大型多边形场景下的 그래뉼 跳过，并修复 `pointInPolygon` 索引分析在主键剪枝期间抛出异常的问题。 [#91633](https://github.com/ClickHouse/ClickHouse/pull/91633) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 优化 `levenshteinDistance` 函数的性能。[#94543](https://github.com/ClickHouse/ClickHouse/pull/94543) ([Joanna Hulboj](https://github.com/jh0x)) 。
* 通过避免对每个元素调用函数，优化批次 decimal 类型转换。[#95923](https://github.com/ClickHouse/ClickHouse/pull/95923) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Iceberg 表现已支持通过 `iceberg_metadata_async_prefetch_period_ms` 表设置进行异步元数据预取，定期预先填充元数据缓存。此外，`iceberg_metadata_staleness_ms` 查询设置允许 SELECT 查询在缓存的元数据比指定的陈旧阈值更新时使用缓存元数据，从而避免在请求处理过程中调用 Iceberg 目录。[#96191](https://github.com/ClickHouse/ClickHouse/pull/96191) ([Arsen Muk](https://github.com/arsenmuk)) 。
* `S3Queue` 有序模式使用 S3 ListObjectsV2 StartAfter，以避免重新列出整个前缀历史，从而减少 ListObjects 调用。[#96370](https://github.com/ClickHouse/ClickHouse/pull/96370) ([Venkata  Vineel ](https://github.com/vyalamar)).
* 降低插入去重的内存占用。通常，去重需要保留原始块；但对于同步插入，可以省略它，从而显著节省内存。[#96661](https://github.com/ClickHouse/ClickHouse/pull/96661) ([Sema Checherinda](https://github.com/CheSema)).
* 使用与架构对应的缓存行大小值，而不是将其硬编码为 64。 [#97357](https://github.com/ClickHouse/ClickHouse/pull/97357) ([Nikita Taranov](https://github.com/nickitat)).
* 对文本索引字典的读取做了小幅优化，提升了文本索引分析的整体性能。[#97519](https://github.com/ClickHouse/ClickHouse/pull/97519) ([Anton Popov](https://github.com/CurtizJ)) 。
* 提升 ARM 上 16 字节块的 `LZ4` 解压缩速度。[#97774](https://github.com/ClickHouse/ClickHouse/pull/97774) ([Raúl Marín](https://github.com/Algunenano)).
* 将分词功能重构为新的高性能接口，以替换旧的迭代器风格 API，从而支持 SIMD 和有状态分词器。属于 [#90268](https://github.com/ClickHouse/ClickHouse/issues/90268) 的一部分。[#97871](https://github.com/ClickHouse/ClickHouse/pull/97871) ([Amos Bird](https://github.com/amosbird)) 。
* 改进了对同时包含已建立索引列和未建立索引列的组合条件查询进行 텍스트 인덱스 分析时的性能。此前，在这种情况下，索引分析期间的提前退出优化会被错误地禁用。 [#98096](https://github.com/ClickHouse/ClickHouse/pull/98096) ([Anton Popov](https://github.com/CurtizJ)).
* 提升包含会生成超长数组或 Map 的常量表达式的查询性能。[#98287](https://github.com/ClickHouse/ClickHouse/pull/98287) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了将 `DateTime64` 主键与整型常量比较时的键条件分析问题；此前这会导致无法进行 그래뉼 剪枝。[#98410](https://github.com/ClickHouse/ClickHouse/pull/98410) ([Amos Bird](https://github.com/amosbird)).
* 设置 `optimize_syntax_fuse_functions` 默认处于启用状态。[#98424](https://github.com/ClickHouse/ClickHouse/pull/98424) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 通过使用局部累加器，而不是按行经由聚合状态进行存储转发，优化了 `avgWeighted` 聚合函数；对于 Nullable 输入，性能最高可提升 27%。[#98793](https://github.com/ClickHouse/ClickHouse/pull/98793) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 在某些场景下，这项改进可提升并行窗口函数的性能并降低内存占用，对处理大数组的 `arrayFold` workload 也有帮助。它还可以减轻缺页压力，并在内存限制较紧时提高受影响查询的稳定性。[#98892](https://github.com/ClickHouse/ClickHouse/pull/98892) ([filimonov](https://github.com/filimonov)).
* 提升有序合并的性能。[#99013](https://github.com/ClickHouse/ClickHouse/pull/99013) ([Artem Zuikov](https://github.com/4ertus2)) 。
* 优化了 `INTERSECT ALL` 和 `EXCEPT ALL`。[#99097](https://github.com/ClickHouse/ClickHouse/pull/99097) ([Raufs Dunamalijevs](https://github.com/rienath)) 。
* 支持在逆序读取中使用 `read_in_order_use_virtual_row` 优化。[#99198](https://github.com/ClickHouse/ClickHouse/pull/99198) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 通过在写入前检查 JoinUsedFlags 是否已设置，减少 `RIGHT` 和 `FULL` JOIN 中的缓存竞争。[#99274](https://github.com/ClickHouse/ClickHouse/pull/99274) ([Hechem Selmi](https://github.com/m-selmi)).
* 通过将浮点运算替换为纯整数运算，优化 `PrefetchingHelper::calcPrefetchLookAhead`，从而改进指令缓存布局，并减少聚合循环期间的周期开销。[#99327](https://github.com/ClickHouse/ClickHouse/pull/99327) ([Riyane El Qoqui](https://github.com/riyaneel)) 。
* 通过将用于存储节点子节点的 `absl::flat_hash_set` 替换为 `CompactChildrenSet`，降低了 Keeper 的内存占用。新容器可内联存储 0–1 个子节点而无需堆分配，这涵盖了绝大多数 Keeper 节点。这样可将 `KeeperMemNode` 的大小从 144 字节减小到 128 字节。[#99860](https://github.com/ClickHouse/ClickHouse/pull/99860) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 现在已在视图中正确支持聚合投影。修复了 [#32753](https://github.com/ClickHouse/ClickHouse/issues/32753)。[#88798](https://github.com/ClickHouse/ClickHouse/pull/88798) ([Amos Bird](https://github.com/amosbird)) 。
* 支持在启用 `join_use_nulls` 时，将 OUTER 连接转换为 INNER 连接的优化。关闭 [#90978](https://github.com/ClickHouse/ClickHouse/issues/90978)。[#95968](https://github.com/ClickHouse/ClickHouse/pull/95968) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 通过在读取前正确计算大小，优化了子列读取。这减少了内存占用，并提升了子列读取速度。 [#96251](https://github.com/ClickHouse/ClickHouse/pull/96251) ([Pavel Kruglov](https://github.com/Avogar)).
* 让 mark 缓存、未压缩缓存和页面缓存使用各自独立的 jemalloc arena，以避免短生命周期的内存分配 (即查询和请求的分配) 与缓存所需的长生命周期分配混用时产生内存碎片。 [#96812](https://github.com/ClickHouse/ClickHouse/pull/96812) ([Seva Potapov](https://github.com/seva-potapov)). [#98812](https://github.com/ClickHouse/ClickHouse/pull/98812). [#99021](https://github.com/ClickHouse/ClickHouse/pull/99021)
* 带有 `DELETE TTL` 规则的表现在也可以使用垂直合并算法。[#97332](https://github.com/ClickHouse/ClickHouse/pull/97332) ([murphy-4o](https://github.com/murphy-4o)).
* 在分散索引分析过程中应用数据跳过索引。[#97767](https://github.com/ClickHouse/ClickHouse/pull/97767) ([Azat Khuzhin](https://github.com/azat)) 。
* 启用 `prewarm_mark_cache` 设置后，现在会预热辅助索引的标记 (即在拉取数据分区片段以及表启动期间，将其加载到索引标记缓存中) 。[#97772](https://github.com/ClickHouse/ClickHouse/pull/97772) ([Anton Popov](https://github.com/CurtizJ)) 。
* 减少了访问控制期间的锁争用。[#97894](https://github.com/ClickHouse/ClickHouse/pull/97894) ([Nikita Taranov](https://github.com/nickitat)) 。
* 启用 apply&#95;row&#95;policy&#95;after&#95;final 或 apply&#95;prewhere&#95;after&#95;final 后，现在会分解行策略和 PREWHERE 中由 AND 组合的复合条件，以提取排序键原子条件并用于主键索引分析。此前，如果延后过滤器同时包含排序键和非排序键 프레디케이트 (例如 x &gt; 1 AND y != &#39;foo&#39;) ，则整个表达式都不会纳入索引分析。现在，即使在嵌套的 AND 表达式中，也能提取排序键原子条件 (如 x &gt; 1) ，并将其用于 그래뉼剪枝。[#98513](https://github.com/ClickHouse/ClickHouse/pull/98513) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* 通过让任务资源在无需获取锁的情况下释放，减少 MergeTreeBackgroundExecutor 中的锁竞争。关闭 [#93620](https://github.com/ClickHouse/ClickHouse/issues/93620)。[#98604](https://github.com/ClickHouse/ClickHouse/pull/98604) ([Dmitry Novik](https://github.com/novikd)) 。
* 修复了读取非 Arrow 数据时在自动检测格式期间内存占用过高 (约 514 MiB) 的问题 (例如，从 `url` 或 `file` 读取且未显式指定格式的 JSON) ；原因是 ArrowStream 读取器将起始几个字节误判为超大的元数据长度。[#98893](https://github.com/ClickHouse/ClickHouse/pull/98893) ([Konstantin Bogdanov](https://github.com/thevar1able)).

#### 改进 \{#improvement\}

* 现已支持解析同一列中包含不同 Geo 类型的 GeoParquet 文件。[#97851](https://github.com/ClickHouse/ClickHouse/pull/97851) ([Mark Needham](https://github.com/mneedham)).
* 引入 `tokensForLikePattern` SQL 函数，用于在保留通配符语义的同时对 LIKE 模式进行标记化：`%` 和 `_` 视为通配符，转义后的通配符 (`\%`、`\_`) 视为字面量，与未转义通配符相邻的标记会被丢弃。[#97872](https://github.com/ClickHouse/ClickHouse/pull/97872) ([Amos Bird](https://github.com/amosbird)) 。
* 为 S3 表引擎新增 `{_schema_hash}` 占位符，用于将表列定义的哈希值插入到 S3 路径中。[#98265](https://github.com/ClickHouse/ClickHouse/pull/98265) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `SymbolIndex`、`addressToSymbol`、`system.symbols` 和 `buildId` 现已可在 macOS 上通过解析 Mach-O 符号表来工作。[#99014](https://github.com/ClickHouse/ClickHouse/pull/99014) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `system.stack_trace` 表现在已可在 macOS 上运行，支持检查所有服务器线程的堆栈跟踪。[#98982](https://github.com/ClickHouse/ClickHouse/pull/98982) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增按服务器配置的 LDAP 选项 `<follow_referrals>` (默认值为 `false`) ，用于控制 LDAP 客户端是否跟随转介。禁用转介跟随可避免从 Active Directory 域根 base DN 开始搜索时出现超时和卡住的问题。与转介相关的日志消息已从 `warn` 调整为 `trace`。[#96765](https://github.com/ClickHouse/ClickHouse/pull/96765) ([paf91](https://github.com/paf91)).
* 我们现在会将查询执行期间使用的所有数据跳过索引记录到 query&#95;log 表新增的 `skip_indices` 列中。修复了 [#78676](https://github.com/ClickHouse/ClickHouse/issues/78676)。原始著者为 @pheepa。[#87862](https://github.com/ClickHouse/ClickHouse/pull/87862) ([Grant Holly](https://github.com/grantholly-clickhouse)) 。
* ACCESS&#95;DENIED 提示不再暴露列名，除非用户有权查看所有必需的列；数据库/表名在提示中仍然可见。[#91067](https://github.com/ClickHouse/ClickHouse/pull/91067) ([filimonov](https://github.com/filimonov)).
* 为 MergeTree 新增一个专用清理线程，以避免在高合并负载下发生清理延迟。此项改动修复了 [#86181](https://github.com/ClickHouse/ClickHouse/issues/86181)。[#91574](https://github.com/ClickHouse/ClickHouse/pull/91574) ([Amos Bird](https://github.com/amosbird)) 。
* 仅在本地服务器主机名对应的 IP 发生变化时才重新加载集群配置，而不是在任意主机的 IP 发生变化时重新加载。修复了 [#81215](https://github.com/ClickHouse/ClickHouse/issues/81215)、[#70156](https://github.com/ClickHouse/ClickHouse/issues/70156) 和 [#65268](https://github.com/ClickHouse/ClickHouse/issues/65268)。[#93726](https://github.com/ClickHouse/ClickHouse/pull/93726) ([Zhigao Hong](https://github.com/zghong)) 。
* 支持 optimize&#95;aggregators&#95;of&#95;group&#95;by&#95;keys 在 GROUPING SETS 查询中正确优化聚合函数。 [#93935](https://github.com/ClickHouse/ClickHouse/pull/93935) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* Keeper-bench：在指标中报告错误，并为 `--input-request-log` 模式生成 JSON 指标文件。[#95748](https://github.com/ClickHouse/ClickHouse/pull/95748) ([Mohammad Lareb Zafar](https://github.com/zlareb1)).
* 在 CREATE USER 中新增 ROLE 子句。[#97074](https://github.com/ClickHouse/ClickHouse/pull/97074) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 您现在可以为由 Replicated 数据库创建的集群配置 internal&#95;replication 设置。[#97228](https://github.com/ClickHouse/ClickHouse/pull/97228) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)) 。
* 新设置 `allow_nullable_tuple_in_extracted_subcolumns` 用于控制从 `Tuple`、`Variant`、`Dynamic` 和 `JSON` 中提取的 `Tuple(...)` 子列是返回为 `Nullable(Tuple(...))` (缺失行返回 `NULL`) ，还是返回为 `Tuple(...)` (缺失行返回默认的 tuple 值) 。该设置默认禁用，且只能通过重启服务器进行修改。[#97299](https://github.com/ClickHouse/ClickHouse/pull/97299) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 在 EXPLAIN 查询的输出中，将延迟筛选器信息作为单独一项添加进去 (在使用 Row Policies/PREWHERE 和 FINAL 时) 。相关：[#91065](https://github.com/ClickHouse/ClickHouse/pull/91065)。[#97374](https://github.com/ClickHouse/ClickHouse/pull/97374) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* 默认启用 `type_json_allow_duplicated_key_with_literal_and_nested_object`。它可避免在解析 `{"a" : 42, "a" : {"b" : 42}}` 这类 JSON 时因重复键而报错；这类 JSON 可能是 ClickHouse 根据原始 JSON 数据 `{"a" : 42, "a.b" : 42}` 格式化生成的。[#97423](https://github.com/ClickHouse/ClickHouse/pull/97423) ([Pavel Kruglov](https://github.com/Avogar)) 。
* Keeper 改进：`find_super_nodes` 是一个非常有用的命令语，可用于调试 Keeper 中节点数量意外增长的问题。遗憾的是，如果存在多个超级节点，几乎不可能找到一个以上，因为该命令语在遍历遇到的第一个超级节点的子节点时会一直卡住。此 PR 禁止遍历超级节点的子节点。[#97819](https://github.com/ClickHouse/ClickHouse/pull/97819) ([pufit](https://github.com/pufit)).
* 新增对 `clickhouse-keeper-client` 的初始自动补全支持。[#97828](https://github.com/ClickHouse/ClickHouse/pull/97828) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 在发生崩溃时，刷新异步日志缓冲区。[#97836](https://github.com/ClickHouse/ClickHouse/pull/97836) ([Azat Khuzhin](https://github.com/azat)).
* 默认启用 impersonate 功能 (参见 [EXECUTE AS target&#95;user](https://clickhouse.com/docs/sql-reference/statements/execute_as)) 。[#97870](https://github.com/ClickHouse/ClickHouse/pull/97870) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 改进了 SQLite 表引擎对 KILL QUERY 和在 clickhouse-client 中按 Ctrl+C 取消查询的支持。[#97944](https://github.com/ClickHouse/ClickHouse/pull/97944) ([Roman Vasin](https://github.com/rvasin)).
* 新增 server setting `jemalloc_profiler_sampling_rate`，用于控制 jemalloc 的 `lg_prof_sample`，并将其作为 `jemalloc.prof.lg_sample` 异步指标暴露出来。[#97945](https://github.com/ClickHouse/ClickHouse/pull/97945) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 为并发有界队列实现增加权重支持。[#97962](https://github.com/ClickHouse/ClickHouse/pull/97962) ([Daniil Ivanik](https://github.com/divanik)) 。
* 将 sslmode 添加到 PostgreSQL 字典源的允许键列表中。此前，sslmode 不在 PostgreSQLDictionarySource.cpp 的 dictionary&#95;allowed&#95;keys 允许列表内，因此无法为 PostgreSQL 字典连接配置 SSL 模式。这会导致字典无法连接到要求使用 SSL 的 PostgreSQL 服务器 (例如默认强制启用 SSL 的 AWS RDS) ，因为连接会在 TLS 协商阶段失败，服务器也会拒绝回退到未加密连接。[#98014](https://github.com/ClickHouse/ClickHouse/pull/98014) ([mcalfin](https://github.com/mcalfin)).
* 当向 `clickhouse` 或 `clickhouse-local` 传入不存在的文件路径时，显示清晰的 &quot;no such file&quot; 错误，而不是令人困惑的通用错误消息。[#98048](https://github.com/ClickHouse/ClickHouse/pull/98048) ([Raúl Marín](https://github.com/Algunenano)).
* 现在已支持在 `Nullable([Fixed]String)` 和 `Array(Nullable([Fixed]String))` 列上构建文本索引。[#98118](https://github.com/ClickHouse/ClickHouse/pull/98118) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 避免删除作为字典源依赖的命名集合。[#98127](https://github.com/ClickHouse/ClickHouse/pull/98127) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 为带有 totals 的查询启用 `grace_hash` 连接算法。[#98144](https://github.com/ClickHouse/ClickHouse/pull/98144) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)) 。
* 在 DROP DATABASE 过程中提前取消 ordinary shared merge tree 的后台合并。[#98161](https://github.com/ClickHouse/ClickHouse/pull/98161) ([Shaohua Wang](https://github.com/tiandiwonder)) 。
* 通过 KILL QUERY 和 clickhouse-client 中的取消查询 (Ctrl+C) ，改进了对 MongoDB 和 MySQL 查询取消的支持。[#98187](https://github.com/ClickHouse/ClickHouse/pull/98187) ([Roman Vasin](https://github.com/rvasin)).
* 移除 NetlinkMetricsProvider，并改为仅使用 procfs 收集每线程 taskstats 指标。基于 Netlink 的收集方式在容器化环境中存在问题，而且在发生争用时尾延迟更高。[#98229](https://github.com/ClickHouse/ClickHouse/pull/98229) ([Amos Bird](https://github.com/amosbird)).
* 重构 Iceberg 清单文件的处理逻辑，以修复清单文件缓存问题。[#98231](https://github.com/ClickHouse/ClickHouse/pull/98231) ([Daniil Ivanik](https://github.com/divanik)) 。
* 现在我们也会考虑这样一种情况：表的排序键可以是 `toDate(time)` 这样的表达式；如果这类表达式是筛选条件的一部分，就可以据此决定不延迟对它们的处理。 [#98237](https://github.com/ClickHouse/ClickHouse/pull/98237) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 新增 `MaxAllocatedEphemeralLockSequentialNumber` 指标，用于表示 ZooKeeper 中临时锁 znode 已分配的最大顺序号。[#98243](https://github.com/ClickHouse/ClickHouse/pull/98243) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)) 。
* 将 ClickStack 更新到 2.20.0 版本。[#98252](https://github.com/ClickHouse/ClickHouse/pull/98252) ([Aaron Knudtson](https://github.com/knudtty)) 。
* 新增了一个 profile 事件 `KeeperRequestTotalWithSubrequests`，会对多重请求中的每个子请求分别计数，从而更清楚地反映 Keeper 的实际工作负载。现有的 `KeeperRequestTotal` 事件仍会将每个多重请求计为一个请求。[#98348](https://github.com/ClickHouse/ClickHouse/pull/98348) ([Antonio Andelic](https://github.com/antonio2368)) 。
* `SYSTEM RELOAD DICTIONARIES` 现在会按拓扑顺序重新加载字典，因此以其他字典为数据源的字典在重新加载后可以读取到最新数据。[#98356](https://github.com/ClickHouse/ClickHouse/pull/98356) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 更改 MergeTree 设置后，重启统计信息缓存。[#98520](https://github.com/ClickHouse/ClickHouse/pull/98520) ([Han Fei](https://github.com/hanfei1991)) 。
* 只有“存活”的副本 (即可以连接的副本) 才会参与分散索引分析。[#98521](https://github.com/ClickHouse/ClickHouse/pull/98521) ([Azat Khuzhin](https://github.com/azat)) 。
* 添加设置 `access_control_improvements.disallow_config_defined_profiles_for_sql_defined_users` (默认禁用/允许) ，用于禁止 SQL 定义的用户使用配置中定义的设置 profile (`default` profile 除外) 。[#98662](https://github.com/ClickHouse/ClickHouse/pull/98662) ([Alexander Tokmakov](https://github.com/tavplubix)) 。
* 将自动并行副本启发式所使用的节点数量上限限定为集群中的实际节点数 (而不是仅受 `max_parallel_replicas` 设置限制) 。[#98668](https://github.com/ClickHouse/ClickHouse/pull/98668) ([Nikita Taranov](https://github.com/nickitat)) 。
* 为分散索引分析实现对冲请求与异步读取。[#98724](https://github.com/ClickHouse/ClickHouse/pull/98724) ([Azat Khuzhin](https://github.com/azat)) 。
* 二进制 `AggregateFunction` 状态的反序列化现在需要读取完整输入。如果存在多余的尾随冗余字节，ClickHouse 将抛出异常，而不再接受格式错误的状态数据。[#98786](https://github.com/ClickHouse/ClickHouse/pull/98786) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 使 TRUNCATE DATABASE 支持响应查询取消。[#98828](https://github.com/ClickHouse/ClickHouse/pull/98828) ([Shaohua Wang](https://github.com/tiandiwonder)) 。
* 改进了 `keeper-bench`，新增请求流水线、预热期、单操作统计信息、可复现的随机种子以及更完善的错误处理。[#98906](https://github.com/ClickHouse/ClickHouse/pull/98906) ([Antonio Andelic](https://github.com/antonio2368)).
* 支持在分散索引分析中支持 SAMPLE 子句。[#98931](https://github.com/ClickHouse/ClickHouse/pull/98931) ([Azat Khuzhin](https://github.com/azat)).
* 即使查询返回空结果或报错，也会在仪表板中显示图表标题。[#98975](https://github.com/ClickHouse/ClickHouse/pull/98975) ([Yash ](https://github.com/Onyx2406)).
* Analyzer 错误消息不再输出表中的所有列 (这可能会导致异常信息达到 150KB+) 。列列表现已限制为最多 10 项。[#99002](https://github.com/ClickHouse/ClickHouse/pull/99002) ([Yash ](https://github.com/Onyx2406)).
* 正确返回带有连接的子查询中的列统计信息，以便父查询可利用这些信息对连接顺序进行重排。 [#99096](https://github.com/ClickHouse/ClickHouse/pull/99096) ([Alexander Gololobov](https://github.com/davenger)).
* 在开始最终化时立即将 ZooKeeper 会话标记为已过期，而不是等待发送线程退出。这样可让其他线程立即建立新会话，无需等待。[#99102](https://github.com/ClickHouse/ClickHouse/pull/99102) ([Raúl Marín](https://github.com/Algunenano)).
* 开始更多使用 LLVM-libc 中的数学函数：`exp`、`exp2`、`expm1`、`fabs`、`fabsl`、`floor`、`fmodl`、`log`、`log2`、`logf`、`pow`、`scalbn`、`scalbnl`、`copysignl`、`nan`、`nanf`、`nanl`，以及 `explogxf` 共享常量。[#99118](https://github.com/ClickHouse/ClickHouse/pull/99118) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 降低 `system.jemalloc_profile_text` 折叠格式的内存占用，并修复潜在的重复输出问题。[#99121](https://github.com/ClickHouse/ClickHouse/pull/99121) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 向 `system.aggregated_zookeeper_log` 添加 `is_subrequest` 列，以区分独立请求与 Multi/MultiRead 请求中的子请求。此前，子请求会被聚合到与独立请求相同的桶中，而且由于每个子操作记录的都是整个多请求的总持续时间，平均延迟会产生误导。现在，子请求的延迟为零。[#99169](https://github.com/ClickHouse/ClickHouse/pull/99169) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 允许在不指定列类型的情况下执行 `ALTER TABLE MODIFY COLUMN x TTL ...` 命令。 [#99208](https://github.com/ClickHouse/ClickHouse/pull/99208) ([Nikolay Degterinsky](https://github.com/evillique)).
* 跳过已断开连接会话的过期 Keeper 请求，避免不必要的 Raft 往返。被跟踪的已结束会话数量上限由协调设置 `max_finished_sessions_cache_size` 限制。[#99246](https://github.com/ClickHouse/ClickHouse/pull/99246) ([Antonio Andelic](https://github.com/antonio2368)).
* 支持在基于 `mapValues(map)` 构建的文本索引中使用 `IN` 运算符。[#99286](https://github.com/ClickHouse/ClickHouse/pull/99286) ([Anton Popov](https://github.com/CurtizJ)) 。
* 在 clickhouse keeper-client 中新增类 shell 的补全支持 (支持补全引号中的参数，即 `'foo ba'`；支持转义参数，即 `foo\ ba`；如果节点包含空白字符，则让 `ls` 以带引号的形式输出节点) 。[#99312](https://github.com/ClickHouse/ClickHouse/pull/99312) ([Azat Khuzhin](https://github.com/azat)) 。
* 防止 Keeper 的 `mntr` 命令因锁竞争而发生卡顿。[#99472](https://github.com/ClickHouse/ClickHouse/pull/99472) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 通过在互斥锁作用域外调用回调并分发读取请求，减少 Keeper 分发器中的锁竞争，并添加带性能剖析的锁保护，以增强可观测性。[#99751](https://github.com/ClickHouse/ClickHouse/pull/99751) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 允许 Parquet 文件最后一个块末尾缺少填充。[#99857](https://github.com/ClickHouse/ClickHouse/pull/99857) ([Seva Potapov](https://github.com/seva-potapov)).

#### 错误修复(官方稳定版本中用户可见的异常行为) \{#bug-fix-user-visible-misbehavior-in-an-official-stable-release\}

* 修复了当别名表目标未完全限定时，其作为 DDL 依赖项的保存方式：现在会使用别名表所在的数据库，而不是会话数据库来保存。[#95175](https://github.com/ClickHouse/ClickHouse/pull/95175) ([Enric Calabuig](https://github.com/eclbg)).
* 修复读取 ALIAS 列的子列时返回错误结果或抛出异常的问题。[#95408](https://github.com/ClickHouse/ClickHouse/pull/95408) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在旧分析器中，JOIN 使用非标准标识符别名时出现列缺失的问题。修复了 [#25594](https://github.com/ClickHouse/ClickHouse/issues/25594)、[#47288](https://github.com/ClickHouse/ClickHouse/issues/47288) 和 [#53263](https://github.com/ClickHouse/ClickHouse/issues/53263)。[#95679](https://github.com/ClickHouse/ClickHouse/pull/95679) ([Zhigao Hong](https://github.com/zghong)) 。
* 修复了 Kusto 方言函数 `bin()`、`bin_at()`、`extract()` 和 `indexof()` 在传入空参数时发生崩溃的问题。[#95736](https://github.com/ClickHouse/ClickHouse/pull/95736) ([NeedmeFordev](https://github.com/spider-yamet)) 。
* 禁止在 clickhouse-client 中，将 local&#95;object&#95;storage (用于构建基于本地文件系统的数据湖，也可能被 LocalDisk 使用) 挂载到 user&#95;files&#95;path 以外的任何位置。[#96201](https://github.com/ClickHouse/ClickHouse/pull/96201) ([Daniil Ivanik](https://github.com/divanik)).
* 在 `DeltaLake` 表引擎中，修复快照版本变化时的逻辑竞态问题，并移除冗余且开销较大的快照重新加载。[#96226](https://github.com/ClickHouse/ClickHouse/pull/96226) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复了 MergeTree 中在分离与附加之间发生多次链式重命名时附加 part 的逻辑错误。[#96351](https://github.com/ClickHouse/ClickHouse/pull/96351) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了一个问题：在同一请求中与 `compatibility` 一起发送的显式设置，如果其值恰好与服务器默认值相同，可能会被静默忽略。[#97078](https://github.com/ClickHouse/ClickHouse/pull/97078) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 修复以下问题：当启用并行解析的 INSERT 遇到无效数据时，客户端会报告 `NETWORK_ERROR`，而不是实际的解析错误 (并显示正确的行号) 。 [#97339](https://github.com/ClickHouse/ClickHouse/pull/97339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在引入 `Nullable(Tuple)` 后，`sumCount` 聚合函数无法读取旧版序列化状态的问题。关闭 [#97370](https://github.com/ClickHouse/ClickHouse/issues/97370)。[#97502](https://github.com/ClickHouse/ClickHouse/pull/97502) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 修复在结合 `GROUPING SETS` 和 `ORDER BY` 使用时，涉及 `Nothing` 类型元素 (例如与 `NULL` 元组元素比较) 的元组比较中出现的异常。[#97509](https://github.com/ClickHouse/ClickHouse/pull/97509) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在使用多个压缩编解码器时，Compact MergeTree parts 的 `uncompressed_hash` 计算具有非确定性的问题，这可能导致错误的去重行为。[#97522](https://github.com/ClickHouse/ClickHouse/pull/97522) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在使用 JSON 和 shared data 中的 buckets 执行 INSERT SELECT 时因缺少流而引发的逻辑错误。关闭了 [#97331](https://github.com/ClickHouse/ClickHouse/issues/97331)。[#97523](https://github.com/ClickHouse/ClickHouse/pull/97523) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了在 SummingMergeTree 和 CoalescingMergeTree 合并过程中，`MEMORY_LIMIT_EXCEEDED` 异常被误报为 `CORRUPTED_DATA` 的问题。[#97537](https://github.com/ClickHouse/ClickHouse/pull/97537) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)) 。
* 修复了包含 `url()` 等表函数的关联子查询中出现的“Context has expired”异常。[#97544](https://github.com/ClickHouse/ClickHouse/pull/97544) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `optimize_syntax_fuse_functions` 在处理聚合投影、Date 类型以及保留列名时出现的异常和错误行为。[#97545](https://github.com/ClickHouse/ClickHouse/pull/97545) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 移除了将 `replaceRegexpOne` 重写为 `extract` 的错误查询重写，该重写在正则表达式未匹配时会产生错误结果；同时修复了在 `replaceRegexpOne` 与 `GROUP BY ... WITH CUBE` 及 `group_by_use_nulls=1` 一起使用时出现的异常。[#97546](https://github.com/ClickHouse/ClickHouse/pull/97546) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在查询被终止时，启用 `database_atomic_wait_for_drop_and_detach_synchronously` 的 `DROP DATABASE` 无限期卡住的问题。[#97586](https://github.com/ClickHouse/ClickHouse/pull/97586) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `KILL QUERY` 无法终止以下卡住的查询的问题：卡在 `WITH FILL` 生成过程中、通过 `dictGet` 加载字典时，或在 `ReplicatedMergeTree` 上执行带有 `mutations_sync=1` 的 `ALTER DELETE` 时。[#97589](https://github.com/ClickHouse/ClickHouse/pull/97589) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `loop` 表函数会直接调用 `inner_storage->read()`，从而绕过解释器层；而行策略、列级授权及其他安全检查正是在这一层执行的。因此，即使直接执行 SELECT 返回零行，受行策略限制的用户仍可通过 `loop(table)` 读取所有行。[#97682](https://github.com/ClickHouse/ClickHouse/pull/97682) ([pufit](https://github.com/pufit)).
* 修复了在使用 Unix 纪元前的 DateTime64 配合 `toDate()` 函数时，分区剪枝不正确的问题。[#97746](https://github.com/ClickHouse/ClickHouse/pull/97746) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 应用此补丁后，如果数据分区片段集合中存在另一个分区 ID 更高的分区，`hasPartitionId` 将返回 false。[#97748](https://github.com/ClickHouse/ClickHouse/pull/97748) ([Mikhail Artemenko](https://github.com/Michicosun)) 。
* 修复读取 JSON 中进阶共享数据里的空 granule 时可能出现的崩溃问题。关闭 [#97563](https://github.com/ClickHouse/ClickHouse/issues/97563)。[#97778](https://github.com/ClickHouse/ClickHouse/pull/97778) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了因 `DROP` 与 `INSERT` 之间的竞争条件，向 `Distributed` 执行 `INSERT` 时出现 `Cannot schedule a file` `LOGICAL_ERROR` 的问题。[#97822](https://github.com/ClickHouse/ClickHouse/pull/97822) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在使用 `tokenbf_v1` 跳过索引调用 `mapContainsKey/mapContainsKeyLike` 时，ClickHouse 服务端发生崩溃/断言的问题。[#97826](https://github.com/ClickHouse/ClickHouse/pull/97826) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复了在 `concatWithSeparator`、`format`、`IN` 子查询、`GLOBAL IN` 以及带有运行时过滤器的连接中，复合类型 (`Variant`、`Dynamic`、`Tuple`) 内的 `LowCardinality` 引发的 `LOGICAL&#95;ERROR` 异常。 [#97831](https://github.com/ClickHouse/ClickHouse/pull/97831) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了这样一个问题：在多个 Distributed 表上使用 `merge()` 表函数并配合 `GROUP BY` 时，若再使用 `ARRAY JOIN`，会触发 `LOGICAL_ERROR` 异常 `Chunk info was not set for chunk in MergingAggregatedTransform`。[#97838](https://github.com/ClickHouse/ClickHouse/pull/97838) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了在高并发情况下，连接组达到硬限制时，HTTP 连接池析构函数中未捕获异常导致的服务器崩溃 (`std::terminate`) 问题。将连接回收到连接池时，异常 `HTTP_CONNECTION_LIMIT_REACHED` 可能会从 `~PooledConnection` 中泄漏出来，进而导致 `SIGABRT`。[#97850](https://github.com/ClickHouse/ClickHouse/pull/97850) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在使用 `grace_hash` 算法处理非等值连接时，若因连接结果大小受限而无法完整处理左侧块，导致结果错误的问题。[#97866](https://github.com/ClickHouse/ClickHouse/pull/97866) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了在 [#96686](https://github.com/ClickHouse/ClickHouse/pull/96686) 中引入的 DeltaLake 元数据扫描性能问题。[#97880](https://github.com/ClickHouse/ClickHouse/pull/97880) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复 ZooKeeper 客户端中 sendThread 与 receiveThread 之间的数据竞争问题。[#97887](https://github.com/ClickHouse/ClickHouse/pull/97887) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复了一个错误：此前无法在分布式 INSERT SELECT 中使用 CTE。这是 https://github.com/ClickHouse/ClickHouse/pull/87789 的后续修复。关闭 [#95837](https://github.com/ClickHouse/ClickHouse/issues/95837)。[#97889](https://github.com/ClickHouse/ClickHouse/pull/97889) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* 修复 `CachedOnDiskReadBufferFromFile::readBigAt` 中的异常。关闭了 [#97325](https://github.com/ClickHouse/ClickHouse/issues/97325)。[#97890](https://github.com/ClickHouse/ClickHouse/pull/97890) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复 `Alias` 引擎在使用物化列时因列不匹配引发的 `LOGICAL_ERROR` 异常。关闭 [#97907](https://github.com/ClickHouse/ClickHouse/issues/97907)。[#97921](https://github.com/ClickHouse/ClickHouse/pull/97921) ([Kai Zhu](https://github.com/nauu)).
* 修复了在使用 Azure Blob Storage 且日志存储使用 `s3_plain` 元数据时，Keeper 重启后数据丢失的问题。[#97987](https://github.com/ClickHouse/ClickHouse/pull/97987) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 `sign` 函数在宽于 `Int8` 的整数类型上的 JIT 误编译问题——超出 -128..127 范围的值可能会产生错误的符号。 [#98012](https://github.com/ClickHouse/ClickHouse/pull/98012) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在读取使用列映射 &quot;name&quot; 模式且 struct 字段名中包含点号 (例如 ``STRUCT<`a.foo`: STRING, `b.foo`: STRING>``) 的 Delta Lake 表时，出现 `DUPLICATE_COLUMN` 异常以及无提示返回 NULL 的问题。[#98013](https://github.com/ClickHouse/ClickHouse/pull/98013) ([Caio Ishizaka Costa](https://github.com/ch-caioishizaka)).
* 修复轻量级更新和二级索引后的 mutation 问题。[#98044](https://github.com/ClickHouse/ClickHouse/pull/98044) ([Raúl Marín](https://github.com/Algunenano)) 。
* 修复了在混用主键和非主键跳过索引时，FINAL 查询结果错误的问题。[#98097](https://github.com/ClickHouse/ClickHouse/pull/98097) ([Raúl Marín](https://github.com/Algunenano)).
* 对 scalar file() 和 DESCRIBE TABLE file() 强制执行 READ ON FILE 权限检查。[#98115](https://github.com/ClickHouse/ClickHouse/pull/98115) ([Nikolay Degterinsky](https://github.com/evillique)) 。
* 修复了一处崩溃问题：使用 glob 模式查询文件时 (例如 `file('dir/**', 'LineAsString')`) ，如果目录中包含悬空符号链接，先前会抛出未处理的文件系统异常 (`STD_EXCEPTION`) 。现在会静默跳过悬空符号链接，查询将返回所有有效文件的结果。 [#98143](https://github.com/ClickHouse/ClickHouse/pull/98143) ([Mark Andreev](https://github.com/mrk-andreev)).
* 修复了在将外连接转换为内连接时，如果过滤表达式中使用 `arrayJoin`，查询计划优化期间发生段错误的问题。[#98147](https://github.com/ClickHouse/ClickHouse/pull/98147) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 `ProtobufList` 格式因消息之间未重置读取状态而无法在 Kafka 引擎中正常工作的问题。[#98151](https://github.com/ClickHouse/ClickHouse/pull/98151) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier 与 ARRAY JOIN 中的逻辑错误，并关闭 [#98164](https://github.com/ClickHouse/ClickHouse/issues/98164)。[#98179](https://github.com/ClickHouse/ClickHouse/pull/98179) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在 `aggregated_zookeeper_log` 中，将监视响应的 `Watch` 部分设为 `Watch`，而不是留空。[#98202](https://github.com/ClickHouse/ClickHouse/pull/98202) ([Antonio Andelic](https://github.com/antonio2368)).
* 如果排序键未覆盖分区键列，那么分区剪枝可能会错误地跳过某些分区，而这些分区中包含的行本应在 FINAL 去重时&quot;胜出&quot;。[#98242](https://github.com/ClickHouse/ClickHouse/pull/98242) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复在以常量数组参数调用 `kql_array_sort_asc`/`kql_array_sort_desc` 时出现的逻辑错误 &quot;Bad cast from type DB::ColumnConst to DB::ColumnArray&quot;。[#98251](https://github.com/ClickHouse/ClickHouse/pull/98251) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `ColumnConst::getExtremes` 中的越界访问问题；启用 `extremes = 1` 时，该问题可能导致崩溃。[#98263](https://github.com/ClickHouse/ClickHouse/pull/98263) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复两个并发执行的 `MOVE PARTITION` 操作在以相反方向处理同一对表时可能发生的死锁。[#98264](https://github.com/ClickHouse/ClickHouse/pull/98264) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* HTTP 服务器现在会在因标头格式错误而导致的 400 Bad Request 响应中，于响应体内返回错误消息，而不再返回空响应体。[#98268](https://github.com/ClickHouse/ClickHouse/pull/98268) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复使用分散索引分析 (Experimental 功能) 和查询条件缓存时出现的错误结果。[#98269](https://github.com/ClickHouse/ClickHouse/pull/98269) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了在对数据跨过 65535 边界的键列执行 `toDate` 转换时触发的 LOGICAL&#95;ERROR 异常 &quot;`MergeTreeSetIndex` 中的二分查找结果无效&quot;。[#98276](https://github.com/ClickHouse/ClickHouse/pull/98276) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在旧版连接步骤代码路径中，当 `query_plan_join_swap_table` 优化交换包裹在 CROSS JOIN 中的 RIGHT JOIN 的顺序时触发的 `LOGICAL_ERROR` 异常。[#98279](https://github.com/ClickHouse/ClickHouse/pull/98279) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 `DDSketch` 反序列化过程中对损坏数据进行校验，防止在读取已损坏的 `quantilesDD` 聚合函数状态时出现段错误、异常、无限循环和 OOM。[#98284](https://github.com/ClickHouse/ClickHouse/pull/98284) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在 `arrayMap` 等 lambda 函数中引用外层查询中的关联列时出现的 LOGICAL&#95;ERROR &quot;Trying to execute PLACEHOLDER action&quot; 问题。[#98285](https://github.com/ClickHouse/ClickHouse/pull/98285) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了当 `CASE` 表达式涉及 `materialize(NULL)` 或其他 `Nullable(Nothing)` 参数时，`caseWithExpression` 中抛出逻辑错误异常的问题。[#98290](https://github.com/ClickHouse/ClickHouse/pull/98290) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在 `merge` 表函数中过滤 `_table` 虚拟列时触发的 bad cast 异常。[#98291](https://github.com/ClickHouse/ClickHouse/pull/98291) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了偶发的去重失效问题：由于 `blocks/` 与 `deduplication_hashes/` ZooKeeper 目录的清理顺序不一致，重新插入的数据会被错误地判定为重复并去重。[#98293](https://github.com/ClickHouse/ClickHouse/pull/98293) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了同时使用 `ORDER BY ... WITH FILL` 和 `LIMIT BY` 时触发的异常。[#98361](https://github.com/ClickHouse/ClickHouse/pull/98361) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了将 Parquet/Arrow `Date` 列插入 `Enum` 列时出现的静默数据损坏问题——现在会正确拒绝不兼容的类型转换，而不是存储无效的枚举值。[#98364](https://github.com/ClickHouse/ClickHouse/pull/98364) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复将包含 `Array` 列的 Arrow 文件读入具有 `Nested` 列的表时出现的异常。[#98365](https://github.com/ClickHouse/ClickHouse/pull/98365) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了这样一个问题：如果在 mutation 完成前删除索引或投影，`MATERIALIZE INDEX` 和 `MATERIALIZE PROJECTION` mutation 会卡住。[#98369](https://github.com/ClickHouse/ClickHouse/pull/98369) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复从 `Nullable(Tuple(...))` 读取时的异常：当 Tuple 元素名称与 Nullable 的 `null` 子列重名时会触发该异常。[#98372](https://github.com/ClickHouse/ClickHouse/pull/98372) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复将 `Merge` 表 (封装 `Distributed` 表) 与另一张表连接时出现的异常：&quot;Column ... query tree node does not have valid source node&quot;。 [#98376](https://github.com/ClickHouse/ClickHouse/pull/98376) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复原生 V3 读取器中将 Parquet `Bool` 错误转换为 `FixedString` 的问题；此前会产生原始字节，而不是字符串形式。 [#98378](https://github.com/ClickHouse/ClickHouse/pull/98378) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `tryGetColumnDescription`，使其按父列类型筛选子列，与其他列查找方法保持一致。[#98391](https://github.com/ClickHouse/ClickHouse/pull/98391) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 在 HTTP Basic Auth 中接受不带填充的 base64 凭据。某些 HTTP 客户端会省略 `Authorization: Basic` 头中的末尾 `=` 填充，这此前会导致身份验证失败。[#98392](https://github.com/ClickHouse/ClickHouse/pull/98392) ([Amos Bird](https://github.com/amosbird)).
* 修复了在合并 parts 后，由于 min-max 索引边界错误，导致带有 `Nullable` 分区键列的分区剪枝结果不正确的问题。 [#98405](https://github.com/ClickHouse/ClickHouse/pull/98405) ([Amos Bird](https://github.com/amosbird)).
* 修复了管道执行器中的一个罕见异常：当管道扩展与查询取消发生竞争时，可能触发 `Received signal 6` (仅在调试构建中) 。[#98428](https://github.com/ClickHouse/ClickHouse/pull/98428) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在同时使用 `count_distinct_optimization` 和 `QUALIFY` 子句时出现的 &quot;Column identifier is already registered&quot; 异常。 [#98433](https://github.com/ClickHouse/ClickHouse/pull/98433) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复将 `IN`/`NOT IN` 与 `LowCardinality` 列参数一起使用时出现的异常 &quot;cannot be inside Nullable type&quot; (例如 `a NOT IN (b)`，其中 `a` 的类型为 `LowCardinality(String)`) 。[#98443](https://github.com/ClickHouse/ClickHouse/pull/98443) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `full_sorting_merge` 连接中的“管道卡住”异常：当 `FilterBySetOnTheFly` 优化与 `MergeJoinTransform` 形成循环依赖时，`PingPongProcessor` 中会发生死锁。[#98454](https://github.com/ClickHouse/ClickHouse/pull/98454) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在合并具有会删除所有行的生存时间 (TTL) 的 parts，以及具有常量 `GROUP BY` 键的聚合投影时出现的 `LOGICAL_ERROR` 异常 &quot;Projection 无法增加块中的行数&quot;。[#98458](https://github.com/ClickHouse/ClickHouse/pull/98458) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `CROSS JOIN` 与 `INNER JOIN USING` 一起使用时触发的逻辑错误异常。[#98459](https://github.com/ClickHouse/ClickHouse/pull/98459) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了当键参数为 `Nullable` 时，`dictGetOrDefault` 中空指针解引用的问题。[#98460](https://github.com/ClickHouse/ClickHouse/pull/98460) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了这样一种情况下 `DISTINCT` 查询中的异常：使用聚合投影时，`materialize` 会导致查询与投影之间的 `LowCardinality` 类型不一致。[#98462](https://github.com/ClickHouse/ClickHouse/pull/98462) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在启用 `join_use_nulls` 时，于包含 OUTER JOIN 的过滤表达式中使用 `arrayJoin` 会触发的 LOGICAL&#95;ERROR 异常。[#98464](https://github.com/ClickHouse/ClickHouse/pull/98464) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在使用并行副本和 `optimize_aggregation_in_order` 时出现的逻辑错误异常 &quot;副本决定以 WithOrder 模式读取，而不是以 ReverseOrder 模式读取&quot;。 [#98467](https://github.com/ClickHouse/ClickHouse/pull/98467) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 ClickHouse Keeper 在处理 `addWatch` 请求后断开 Java ZooKeeper 客户端会话的问题。Java 客户端期望在 `addWatch` 响应中收到一个 4 字节的 `ErrorResponse` 响应体，但 Keeper 发送的是空响应体，导致触发 `EOFException` 并断开会话。这会导致 Apache Curator 的 `CuratorCache` 以及任何使用持久 watches 的 Java 应用程序无法正常工作。修复了 [#98079](https://github.com/ClickHouse/ClickHouse/issues/98079)。[#98499](https://github.com/ClickHouse/ClickHouse/pull/98499) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了当跟随者宕机时，`zk_followers` 和 `zk_synced_followers` 这两个 Keeper 指标不会减少的问题。向 `mntr` 四字母命令中新增 `zk_learners` 和 `zk_synced_non_voting_followers` 指标。修复 [#54173](https://github.com/ClickHouse/ClickHouse/issues/54173)。[#98504](https://github.com/ClickHouse/ClickHouse/pull/98504) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 修复了 `renameAndCommitEmptyParts` 中的 LOGICAL&#95;ERROR 异常：在使用 MergeTree 事务时，`TRUNCATE TABLE` 与 `OPTIMIZE TABLE` 并发执行可能会触发该异常。[#98508](https://github.com/ClickHouse/ClickHouse/pull/98508) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 Keeper 安全 raft 端口忽略 `openSSL` 配置中 `cipherList` 和 `dhParamsFile` 的问题，此前始终使用默认值，而不是用户指定的值。关闭 [#51188](https://github.com/ClickHouse/ClickHouse/issues/51188)。[#98509](https://github.com/ClickHouse/ClickHouse/pull/98509) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 修复了具有误导性的 Keeper 日志消息，例如 &quot;Receiving request for session X took 9963 ms&quot;：其中报告的时间实际上是心跳间隔期间在 `poll()` 中空闲等待所耗费的时间，而非操作本身的执行时间。修复了 [#79026](https://github.com/ClickHouse/ClickHouse/issues/79026)。[#98510](https://github.com/ClickHouse/ClickHouse/pull/98510) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 修复 read&#95;in&#95;order&#95;use&#95;virtual&#95;row 与单调函数配合使用时导致结果异常的问题，关闭 [#97837](https://github.com/ClickHouse/ClickHouse/issues/97837)。 [#98514](https://github.com/ClickHouse/ClickHouse/pull/98514) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复了在 MergeTree 表上配合 `IN` 子查询使用 `PREWHERE` 时出现的 `LOGICAL_ERROR: Not-ready Set is passed as the second argument for function 'in'` 问题。[#98522](https://github.com/ClickHouse/ClickHouse/pull/98522) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 Keeper TCP 连接未响应关闭信号、导致服务器无法平滑关闭的问题。[#98525](https://github.com/ClickHouse/ClickHouse/pull/98525) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在启用 `query_plan_convert_join_to_in` 且 `query_plan_merge_expressions = 0` 时出现的异常：&quot;Sorting column wasn&#39;t found in the ActionsDAG&#39;s outputs&quot;。[#98526](https://github.com/ClickHouse/ClickHouse/pull/98526) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了使用命名集合时 MongoDB 字典源失效的问题。解决了 [#97840](https://github.com/ClickHouse/ClickHouse/issues/97840)。[#98528](https://github.com/ClickHouse/ClickHouse/pull/98528) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复了参数替换后 Identifier 为空时触发的 LOGICAL&#95;ERROR。[#98530](https://github.com/ClickHouse/ClickHouse/pull/98530) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)) 。
* 修复在同时使用 `sort_overflow_mode = 'break'` 和窗口函数时出现的管道死锁问题。[#98543](https://github.com/ClickHouse/ClickHouse/pull/98543) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 Buffer 引擎在追加新块过程中处理异常时的列回滚问题。旧逻辑可能导致列的内存状态损坏。[#98551](https://github.com/ClickHouse/ClickHouse/pull/98551) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了在使用 const `Dynamic` 或 `Variant` 列与 `NULL` 进行空安全比较 (`<=>` / `IS NOT DISTINCT FROM`) 时触发的异常 `Bad cast from type ColumnConst to ColumnDynamic`。同时还修复了 `Dynamic`/`Variant` 与 `NULL` 进行 `IS DISTINCT FROM` 比较时始终错误地返回 0 的问题。[#98553](https://github.com/ClickHouse/ClickHouse/pull/98553) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了文本索引与其他跳过索引配合使用时的问题。此前，当查询过滤条件同时使用文本索引和其他常规跳过索引时，可能会抛出诸如 &quot;尝试获取不存在的 mark&quot; 之类的逻辑错误。[#98555](https://github.com/ClickHouse/ClickHouse/pull/98555) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复逻辑错误 &quot;TABLE&#95;FUNCTION 不允许出现在表达式上下文中&quot;：当带有别名的表函数在同一查询作用域内多次出现时 (例如同时出现在 `PREWHERE` 和 `QUALIFY` 子句中) 。[#98557](https://github.com/ClickHouse/ClickHouse/pull/98557) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 PK 中包含表达式 (而非仅列) 时的分散索引分析问题 (否则会导致无法过滤远程副本上的冗余 granule) 。[#98561](https://github.com/ClickHouse/ClickHouse/pull/98561) ([Azat Khuzhin](https://github.com/azat)) 。
* 当某列的子列已在其他列的默认/别名表达式中使用时，禁止删除该列；并在执行 `ALTER DROP COLUMN` 时，使用分析器处理默认表达式。[#98569](https://github.com/ClickHouse/ClickHouse/pull/98569) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)) 。
* 修复了 HTTP 客户端在遇到不可重试错误 (包括 `HTTP_CONNECTION_LIMIT_REACHED`) 时仍错误重试 S3 请求的问题。 [#98598](https://github.com/ClickHouse/ClickHouse/pull/98598) ([Sema Checherinda](https://github.com/CheSema)).
* 修复了使用 DateTime64 进行分区剪枝时出现的小数溢出问题。[#98628](https://github.com/ClickHouse/ClickHouse/pull/98628) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* 修复 JIT expression 编译中的两个错误：一是 `nativeCast` 类型检查中的复制粘贴错误，导致整数到整数以及浮点数到浮点数的类型转换分支无法命中；二是向 LLVM `PassBuilder` 传入了错误的 `nullptr` TargetMachine，导致无法注册目标特定的优化 Pass。 [#98660](https://github.com/ClickHouse/ClickHouse/pull/98660) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了一个 RBAC 绕过漏洞：用户可通过指向 localhost 的 `remote()`、`remoteSecure()`、`cluster()` 或 `clusterAllReplicas()` 对任意表执行 `DESCRIBE`，且无需 `SHOW_COLUMNS` 特权。[#98669](https://github.com/ClickHouse/ClickHouse/pull/98669) ([pufit](https://github.com/pufit)).
* 修复在存在 `JOIN` 的情况下，当非布尔表达式 (例如 `sin(col)`) 同时用于 `WHERE` 和 `SELECT` 时，由于过滤器下推优化破坏共享 DAG 节点而导致的 `BAD_GET` 异常以及错误的查询结果。[#98681](https://github.com/ClickHouse/ClickHouse/pull/98681) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在结合并行副本使用 `read_in_order_through_join` 时出现的 LOGICAL&#95;ERROR &quot;副本决定以 Default 模式读取，而不是 WithOrder&quot; 问题。[#98685](https://github.com/ClickHouse/ClickHouse/pull/98685) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复将 `input` 表函数用作 `remote` 参数时出现的异常 &quot;Bad cast from type `DB::TableFunctionNode` to `DB::QueryNode`&quot;。[#98694](https://github.com/ClickHouse/ClickHouse/pull/98694) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复因错误清理空的覆盖型数据分区片段而导致过期数据分区片段重新出现的问题。[#98698](https://github.com/ClickHouse/ClickHouse/pull/98698) ([Shaohua Wang](https://github.com/tiandiwonder)).
* 修复了在 `equals` 比较中布尔函数返回 `Variant` 类型时，`LogicalExpressionOptimizerPass` 中发生的异常。[#98712](https://github.com/ClickHouse/ClickHouse/pull/98712) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `parseDateTimeBestEffort` 将以月份/星期前缀开头的单词错误解析的问题。关闭 [#97965](https://github.com/ClickHouse/ClickHouse/issues/97965)。[#98742](https://github.com/ClickHouse/ClickHouse/pull/98742) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复在启用新 analyzer 时，对包含参数不同的 JSON 列 (例如 `SKIP` 字段不同) 且带有引用 JSON 子路径的 ALIAS 列的表执行 `merge()` 表函数或 `Merge` 引擎查询时出现的 `UNKNOWN_IDENTIFIER` 异常。关闭 [#97812](https://github.com/ClickHouse/ClickHouse/issues/97812)。[#98753](https://github.com/ClickHouse/ClickHouse/pull/98753) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了在 `View` 中使用 `Distributed` 存储时，分析器对 `optimize_skip_unused_shards` 优化的相关问题。[#98754](https://github.com/ClickHouse/ClickHouse/pull/98754) ([Nikolai Kochetov](https://github.com/KochetovNicolai)) 。
* 修复了通过 `clickhouse-client` 中的 `--external` 传递的外部表无法按名称访问元组子列的问题 (例如，对 `Tuple(a UUID, b Int32)` 使用 `SELECT x.a`) 。关闭 [#96925](https://github.com/ClickHouse/ClickHouse/issues/96925)。[#98755](https://github.com/ClickHouse/ClickHouse/pull/98755) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复 `reverseUTF8` 在无效 (截断的) UTF-8 输入时抛出异常的问题。[#98770](https://github.com/ClickHouse/ClickHouse/pull/98770) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在 OR 条件带有 false 谓词 (即 or(x, 0)) 时，无法正确检测 set 跳过索引是否有用的问题。[#98776](https://github.com/ClickHouse/ClickHouse/pull/98776) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了一个 `LOGICAL_ERROR` 异常 (`removeUnusedColumns` 中的块结构不匹配) ；该问题可能会在使用 `FINAL` + `PREWHERE` + 常量 `WHERE` 表达式 + 与列无关的聚合函数 (如 `count()`) 时发生。[#98778](https://github.com/ClickHouse/ClickHouse/pull/98778) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 使 ClickHouse 字典自动重载相关的 `system.trace_log` 条目的查询 ID 不再为空。[#98784](https://github.com/ClickHouse/ClickHouse/pull/98784) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 修复了一个崩溃问题：在 `IDatabaseTablesIterator::table()` 调用中对系统表进行快照后，如果在后续迭代期间另一线程修改了这些表，我们可能会对在这期间创建的系统表解引用空指针。 [#98792](https://github.com/ClickHouse/ClickHouse/pull/98792) ([Grant Holly](https://github.com/grantholly-clickhouse)).
* 修复 `SYSTEM START REPLICATED VIEW` 无法唤醒刷新任务的问题。[#98797](https://github.com/ClickHouse/ClickHouse/pull/98797) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复在另一个连接中使用内部包含 JOIN 的 `view()` 表函数时出现的“表名不一致”异常 (仅在使用旧分析器时) 。[#98809](https://github.com/ClickHouse/ClickHouse/pull/98809) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了通过 pending&#95;signals 调整 RLIMIT&#95;SIGPENDING 时的问题。 [#98829](https://github.com/ClickHouse/ClickHouse/pull/98829) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `loop` 与集群表函数组合使用时触发的异常。[#98860](https://github.com/ClickHouse/ClickHouse/pull/98860) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 具有多个连接键列的 LEFT ANTI JOIN 在 `enable_join_runtime_filters=1` (默认启用) 时返回了错误结果。[#98871](https://github.com/ClickHouse/ClickHouse/pull/98871) ([Alexander Gololobov](https://github.com/davenger)) 。
* 修复了在分多个块读取数据时 (例如使用较小的 `index_granularity` 时) ，`WITH FILL STALENESS` 会生成多余填充行的问题。[#98895](https://github.com/ClickHouse/ClickHouse/pull/98895) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 &quot;RPNBuilderFunctionTreeNode 有 A 个参数，却尝试获取索引 B 处的参数&quot; LOGICAL&#95;ERROR。[#98900](https://github.com/ClickHouse/ClickHouse/pull/98900) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了因分配失败后未回滚而导致的内存跟踪漂移、`nallocx(0)` 的未定义行为，以及全局峰值跟踪中的差一错误。将跟踪范围扩展至 `io_uring` 环形缓冲区。[#98915](https://github.com/ClickHouse/ClickHouse/pull/98915) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 禁止将位于用户路径之外的本地数据湖表附加到系统中，而不只是禁止创建这些表。[#98936](https://github.com/ClickHouse/ClickHouse/pull/98936) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了一个竞态条件：在使用 `urlCluster` 或类似集群表函数的查询中，该问题可能导致出现 &quot;ReadBuffer is canceled&quot; 异常。[#98955](https://github.com/ClickHouse/ClickHouse/pull/98955) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在传入 `BFloat16` 类型参数时，金融函数 (`financialNetPresentValue`、`financialInternalRateOfReturn` 等) 中触发的 `LOGICAL_ERROR` 异常。[#98958](https://github.com/ClickHouse/ClickHouse/pull/98958) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在禁用查询计划表达式合并时 (query&#95;plan&#95;merge&#95;expressions = 0 或 query&#95;plan&#95;enable&#95;optimizations = 0) ，跳过索引 (以及主键条件) 未对 ALIAS 列生效的问题。 [#98960](https://github.com/ClickHouse/ClickHouse/pull/98960) ([Peng](https://github.com/fastio)).
* 在异步插入时递增 `InsertQuery` ProfileEvent 计数。关闭 [#98626](https://github.com/ClickHouse/ClickHouse/issues/98626)。[#98962](https://github.com/ClickHouse/ClickHouse/pull/98962) ([Narasimha Pakeer](https://github.com/npakeer)) 。
* 修复在调试构建中、当主键包含 NaN 浮点值时出现的 &quot;Inconsistent KeyCondition behavior&quot; 异常：使 `accurateLess` 和 `accurateEquals` 按照 ClickHouse 排序顺序一致地处理 NaN。关闭 [#98075](https://github.com/ClickHouse/ClickHouse/issues/98075)。[#98964](https://github.com/ClickHouse/ClickHouse/pull/98964) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* SummingMergeTree 不再对 Bool (以及其他域类型) 的列求和。Bool 值会保持原样，而不是进行算术求和。[#98976](https://github.com/ClickHouse/ClickHouse/pull/98976) ([Yash ](https://github.com/Onyx2406)).
* 修复了在设置 `optimize_const_name_size` 且 `enable_scalar_subquery_optimization` = 0 时，查询远程分片时出现的 Scalar doesn&#39;t exist 异常。远程查询中，被替换为 `__getScalar` 引用的大常量未发送到分片，导致查询失败。[#98979](https://github.com/ClickHouse/ClickHouse/pull/98979) ([andriibeee](https://github.com/andriibeee)).
* 修复某些查询中的 `NOT_FOUND_COLUMN_IN_BLOCK` 问题：这些查询包含 `GROUP BY` 以及带有逆向字典查找、`Date/DateTime` 转换比较和元组比较的表达式。关闭 [#98888](https://github.com/ClickHouse/ClickHouse/issues/98888)。[#98980](https://github.com/ClickHouse/ClickHouse/pull/98980) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 修复了在 MergeTree 引擎中将 version/sign/is&#95;deleted 列修改为 `EPHEMERAL` 或 `ALIAS` 时出现的未定义行为 (空指针解引用) 。现在，这类修改会被正确地拒绝。[#98985](https://github.com/ClickHouse/ClickHouse/pull/98985) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了一个问题：`system.grants` 在 `access_object` 列中遗漏了 `URL` 和 `S3` 授权中的正则表达式参数。[#98987](https://github.com/ClickHouse/ClickHouse/pull/98987) ([DQ](https://github.com/il9ue)).
* 修复了 Iceberg BigLake 读取相关问题：现在会将 ADC 凭据转发给 GCS S3 客户端 (修复 403 错误) ；发送前会先对 OAuth2 凭据进行 URL 编码 (修复包含特殊字符的令牌导致的身份验证失败) ；此外，命名空间遍历在遇到 BigLake HTTP 400 响应时也不再中止。[#98998](https://github.com/ClickHouse/ClickHouse/pull/98998) ([Nikita Fomichev](https://github.com/fm4v)) 。
* 修复了在 `TZ` 环境变量使用 POSIX 文件路径语法时 (例如 `TZ=:/etc/localtime`) ，`clickhouse-client` 无法切换时区的问题。[#99000](https://github.com/ClickHouse/ClickHouse/pull/99000) ([Yash ](https://github.com/Onyx2406)).
* 修复了在 `FixedString` 列上使用 `startsWith`、`LIKE`、`NOT LIKE` 时出现错误或剪枝不足的问题。此外，当在键列外层包裹从 `FixedString` 到 `String` 的类型转换函数时，现在也可以对 granules 进行剪枝。关闭了 [#98940](https://github.com/ClickHouse/ClickHouse/issues/98940)。[#99001](https://github.com/ClickHouse/ClickHouse/pull/99001) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 修复了 `windowFunnel` 在遇到重复事件时使用 `strict_deduplication` 会返回错误级别的问题。[#99003](https://github.com/ClickHouse/ClickHouse/pull/99003) ([Yash ](https://github.com/Onyx2406)) 。
* 修复了一个 bug：在子查询中，EXISTS 会忽略 LIMIT 和 OFFSET 子句，导致当子查询因 offset 或 limit 为 0 而未返回任何行时，结果不正确。关闭了 [#88722](https://github.com/ClickHouse/ClickHouse/issues/88722)。[#99005](https://github.com/ClickHouse/ClickHouse/pull/99005) ([andriibeee](https://github.com/andriibeee)) 。
* 修复在 `GROUPING SETS` 中，过滤器下推优化遇到会短路为常量的 AND 表达式时触发的“块结构不匹配”异常。[#99010](https://github.com/ClickHouse/ClickHouse/pull/99010) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在查询计划中读取不带 `_part_offset` 列的补丁分区片段 (轻量级更新) 时触发的异常。 [#99023](https://github.com/ClickHouse/ClickHouse/pull/99023) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 像 `SELECT * FROM table WHERE pk_id = ''` 这样的查询，如果 `pk_id` 是 `String` 类型的主键，现在会正确使用主键索引来过滤 granules。[#99027](https://github.com/ClickHouse/ClickHouse/pull/99027) ([Shankar Iyer](https://github.com/shankar-iyer)) 。
* 修复了 Kafka 引擎中的 `DEPENDENCIES_NOT_FOUND` 异常：在后台线程流式传输数据时分离 materialized view 会触发该异常。[#99028](https://github.com/ClickHouse/ClickHouse/pull/99028) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了创建表时出现的异常：表中包含与虚拟列 (例如 `_part_offset`) 同名的 `EPHEMERAL` 列。[#99031](https://github.com/ClickHouse/ClickHouse/pull/99031) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了通过带有 glob 模式的 `url()` 表函数读取不存在的压缩文件时，出现具有误导性的 &quot;inflate failed: buffer error&quot; 报错的问题。现在，启用 `http_skip_not_found_url_for_globs` 后，会按预期返回空结果。[#99034](https://github.com/ClickHouse/ClickHouse/pull/99034) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 schema 修改 (例如 ADD COLUMN) 后，对补丁 part 执行 `ALTER TABLE ... DROP PART` 时触发的服务器崩溃 (`std::terminate`) 问题。该崩溃是由于空覆盖 part 的元数据中缺少系统列 (`_part`) ，从而导致在 `NOEXCEPT&#95;SCOPE` 内部抛出未捕获的异常。[#99036](https://github.com/ClickHouse/ClickHouse/pull/99036) ([Peng](https://github.com/fastio)).
* 如果在*缓存磁盘读取*期间因抛出内存限制超出异常，ClickHouse 服务端进程可能会崩溃。该问题现已修复。[#99042](https://github.com/ClickHouse/ClickHouse/pull/99042) ([Shankar Iyer](https://github.com/shankar-iyer)) 。
* 修复了在使用 `dictGet` 查询同时具有 ROW POLICY 和 ALIAS 列的表时出现的 `LOGICAL_ERROR`。该问题是由于新 analyzer 在解析 ALIAS 列期间过早访问表表达式而导致的。[#99065](https://github.com/ClickHouse/ClickHouse/pull/99065) ([Peng](https://github.com/fastio)).
* 修复了这样一种越界错误：当用户尝试仅查询使用 Avro 格式存储数据的 Iceberg 表中的虚拟列时，会触发该错误。这种情况极为罕见，因此未将其标记为严重问题。修复了 [#88238](https://github.com/ClickHouse/ClickHouse/issues/88238)。[#99080](https://github.com/ClickHouse/ClickHouse/pull/99080) ([alesapin](https://github.com/alesapin)) 。
* 修复递归 CTE 中使用 `remote()` + `view()` 时出现的段错误。[#99081](https://github.com/ClickHouse/ClickHouse/pull/99081) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 应用按顺序读取优化时，跳过不必要的额外索引分析。[#99084](https://github.com/ClickHouse/ClickHouse/pull/99084) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 修复了在应用补丁 part 时因抛出内存限制异常而导致的崩溃。[#99086](https://github.com/ClickHouse/ClickHouse/pull/99086) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了 `DDLWorker` 中的调试断言问题：在重新初始化恢复过程中删除 ZooKeeper 条目后，遗留的 `first_failed_task_name` 会触发该问题。 [#99099](https://github.com/ClickHouse/ClickHouse/pull/99099) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在带有生存时间 (TTL) 的合并期间重建文本索引的问题。[#99107](https://github.com/ClickHouse/ClickHouse/pull/99107) ([Anton Popov](https://github.com/CurtizJ)).
* 修复 Iceberg 表引擎执行 `ALTER TABLE ... REMOVE SETTINGS` 查询时发生崩溃的问题。修复了 [#86330](https://github.com/ClickHouse/ClickHouse/issues/86330)。[#99108](https://github.com/ClickHouse/ClickHouse/pull/99108) ([alesapin](https://github.com/alesapin)) 。
* 修复了 `query_plan_convert_any_join_to_semi_or_anti_join` 优化中的一个缺陷，该缺陷会导致不匹配的行返回错误结果。相关：https://github.com/ClickHouse/ClickHouse/pull/95995。 [#99112](https://github.com/ClickHouse/ClickHouse/pull/99112) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复 `ASTColumnsExceptTransformer::transform` 中的 LOGICAL&#95;ERROR 异常。[#99119](https://github.com/ClickHouse/ClickHouse/pull/99119) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复了一个 RBAC 绕过问题：用户可在不具备所需源访问特权的情况下，通过表函数 (`mysql()`、`postgresql()`、`sqlite()`、`arrowFlight()`、`jdbc()`、`odbc()` 等) 上的 `DESCRIBE TABLE` 或 `CREATE TABLE AS` 获取表结构。对于会从远程服务器推断 schema 的函数，这还允许在未经授权的情况下触发出站连接 (SSRF) 。[#99122](https://github.com/ClickHouse/ClickHouse/pull/99122) ([pufit](https://github.com/pufit)) 。
* 修复 Keeper 在动态重配置和领导权移交期间崩溃 (NuRaft 中的段错误) 的问题。 [#99133](https://github.com/ClickHouse/ClickHouse/pull/99133) ([JIaQi Tang](https://github.com/JiaQiTang98)).
* 修复了在目标端不支持 `SAMPLE` 时，使用带有 `SAMPLE` 的 Buffer 表会发生崩溃的问题。[#99141](https://github.com/ClickHouse/ClickHouse/pull/99141) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了因补丁分区片段列顺序不一致而导致的 LOGICAL&#95;ERROR。 [#99164](https://github.com/ClickHouse/ClickHouse/pull/99164) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复了一个极其罕见的崩溃问题：当 Iceberg 表包含混合格式 (ORC 和 Parquet) 的文件时，可能会发生崩溃。修复 [#88126](https://github.com/ClickHouse/ClickHouse/issues/88126)。[#99168](https://github.com/ClickHouse/ClickHouse/pull/99168) ([alesapin](https://github.com/alesapin)) 。
* 修复在备份/恢复时未应用 max&#95;execution&#95;time 的问题。[#99205](https://github.com/ClickHouse/ClickHouse/pull/99205) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复了在未使用 `ORDER BY ALL` 的 `INSERT SELECT` 查询中，`insert_deduplication_token` 被静默忽略的问题。此前，对于未排序的 `INSERT SELECT`，去重会被完全禁用，即使提供了显式的用户标记也不例外。现在，无论是否使用 `ORDER BY ALL`，只要提供 `insert_deduplication_token` 就足以启用去重。[#99206](https://github.com/ClickHouse/ClickHouse/pull/99206) ([Desel72](https://github.com/Desel72)).
* 修复了 `InverseDictionaryLookupPass` 优化期间过多的访问检查：在该 pass 开始前仅检查一次 `CREATE_TEMPORARY_TABLE` 权限，而不是对每个访问到的节点都进行检查。[#99210](https://github.com/ClickHouse/ClickHouse/pull/99210) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 修复 `clickhouse format --obfuscate` 在混淆跳过索引类型、压缩编解码器名称、数据库引擎名称以及字典布局/来源定义时生成无效 SQL 的问题。[#99260](https://github.com/ClickHouse/ClickHouse/pull/99260) ([Raúl Marín](https://github.com/Algunenano)) 。
* 修复了一个问题：在某些情况下，`Time[64]` 与 `DateTime[64]` 类型之间的比较行为容易引起混淆；现在，遇到这类情况时，会通过添加日期部分 `1970-01-01`，将 `Time[64]` 值提升为 `DateTime[64]`。[#99267](https://github.com/ClickHouse/ClickHouse/pull/99267) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* 收紧 DDL worker 中分布式 DDL 查询的设置约束。[#99317](https://github.com/ClickHouse/ClickHouse/pull/99317) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复 TOTP 身份验证中的一些小问题：`--one-time-password` CLI 选项在密码为空时的处理，以及对 `<digits>` 和 `<period>` 配置值的校验。[#99322](https://github.com/ClickHouse/ClickHouse/pull/99322) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复了 Avro 输出格式中的逻辑错误 `unordered_map::at: key not found`：序列化 `Enum8`/`Enum16` 列时，如果值不在枚举定义中，就会触发该错误。[#99332](https://github.com/ClickHouse/ClickHouse/pull/99332) ([Desel72](https://github.com/Desel72)).
* 修复了在包含 Dynamic 的 Tuple 中使用稀疏序列化时 `CHECK TABLE` 的问题。关闭了 [#96588](https://github.com/ClickHouse/ClickHouse/issues/96588)。[#99351](https://github.com/ClickHouse/ClickHouse/pull/99351) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了对텍스트 인덱스预处理器的验证过于严格的问题。[#99359](https://github.com/ClickHouse/ClickHouse/pull/99359) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复带有隐式 minmax 索引的复制表从 25.10 升级到更新版本时的兼容性问题。[#99392](https://github.com/ClickHouse/ClickHouse/pull/99392) ([Raúl Marín](https://github.com/Algunenano)).
* 在文本索引分析中，已移除对否定函数 (`notEquals`、`notLike`、`notIn`) 的支持。这些函数本来就无法跳过任何 granules，因此为它们分析索引只会增加额外开销，而没有任何收益。[#99393](https://github.com/ClickHouse/ClickHouse/pull/99393) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在 IN 子查询中使用 `Distributed` 表时，新分析器无法正确处理 `optimize_skip_unused_shards` 的问题。[#99436](https://github.com/ClickHouse/ClickHouse/pull/99436) ([Nikolai Kochetov](https://github.com/KochetovNicolai)) 。
* 修复了当查询产生重复列名时，`INTERSECT`/`EXCEPT` 中的 heap-use-after-free 问题。[#99471](https://github.com/ClickHouse/ClickHouse/pull/99471) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在将带类型的查询参数作为 part 名称使用时，`ALTER TABLE ... DROP PART` 中的逻辑错误。[#99489](https://github.com/ClickHouse/ClickHouse/pull/99489) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在通过别名同时于 `SELECT` 和 `WHERE` 子句中引用文本索引谓词 (例如 `hasAllTokens`) 时触发的 `NOT_FOUND_COLUMN_IN_BLOCK` 异常。[#99504](https://github.com/ClickHouse/ClickHouse/pull/99504) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复在对具有各自独立文本索引的多列跨列使用 OR 时，`hasAllTokens` 返回错误结果的问题。[#99505](https://github.com/ClickHouse/ClickHouse/pull/99505) ([Anton Popov](https://github.com/CurtizJ)).
* 在 `clickhouse-local` 中初始化 page cache，以使 `page_cache_max_size` 设置生效。[#99510](https://github.com/ClickHouse/ClickHouse/pull/99510) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了一个罕见问题：在执行 `DETACH/ATTACH TABLE` 查询后，数据分区片段会被误标为损坏，并被分离。 [#99529](https://github.com/ClickHouse/ClickHouse/pull/99529) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了通过 HTTP 接口使用 Pretty 格式查询空系统表时触发的 `std::length_error` 异常。 [#99541](https://github.com/ClickHouse/ClickHouse/pull/99541) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在使用 `ALTER TABLE ADD COLUMN` 创建与虚拟列同名的 `EPHEMERAL` 列 (例如 `_part_offset`) 时触发的 `LOGICAL_ERROR`。 [#99549](https://github.com/ClickHouse/ClickHouse/pull/99549) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复因缓存键不匹配导致 `VectorSimilarityIndexCache` 条目在 part 移除后始终不会被逐出的问题。[#99575](https://github.com/ClickHouse/ClickHouse/pull/99575) ([Seva Potapov](https://github.com/seva-potapov)).
* 禁止从本地文件中读取 Google 凭据。此设置存在安全风险，因为一旦知道文件路径，就可能读取其他凭据。[#99584](https://github.com/ClickHouse/ClickHouse/pull/99584) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复分析器中的性能劣化问题。裁剪 ARRAY JOIN 中未使用的列。[#99587](https://github.com/ClickHouse/ClickHouse/pull/99587) ([Dmitry Novik](https://github.com/novikd)) 。
* 修复了在已存在轻量级删除和行策略的表中读取텍스트 인덱스时的问题。 [#99661](https://github.com/ClickHouse/ClickHouse/pull/99661) ([Anton Popov](https://github.com/CurtizJ)).
* 修复 Parquet 读取器中的 nullptr 解引用问题：当解码器中的过滤路径遇到已过滤掉的页面时，会触发该问题。关闭 [#99676](https://github.com/ClickHouse/ClickHouse/issues/99676)。[#99677](https://github.com/ClickHouse/ClickHouse/pull/99677) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 AsynchronousReadBufferFromFileDescriptor 在使用 O&#95;DIRECT 时错误的 seek。关闭 [#99358](https://github.com/ClickHouse/ClickHouse/issues/99358)。[#99678](https://github.com/ClickHouse/ClickHouse/pull/99678) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了解压格式错误的压缩数据时，`CompressionCodecT64` 中的 heap-buffer-overflow 和 `CompressionCodecMultiple` 中的进程异常终止问题。这两个问题均由新的 libFuzzer 目标发现。现在这些编解码器会抛出异常，而不是发生崩溃。[#99680](https://github.com/ClickHouse/ClickHouse/pull/99680) ([Rahul](https://github.com/motsc)).
* 将处理推迟到服务器完成所有表加载之后。[#99700](https://github.com/ClickHouse/ClickHouse/pull/99700) ([Seva Potapov](https://github.com/seva-potapov)) 。
* 修复 MySQL 字典源在内联 DDL 参数下绕过 `RemoteHostFilter` 的问题。[#99720](https://github.com/ClickHouse/ClickHouse/pull/99720) ([Shaohua Wang](https://github.com/tiandiwonder)) 。
* 修复遍历 `system.tables` 中数据湖表时的逻辑错误。[#99739](https://github.com/ClickHouse/ClickHouse/pull/99739) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复了带有预处理器的文本索引在分析使用 `IN` 函数的谓词时的问题。修复了文本索引中搜索标记发生冲突的问题，这可能导致结果错误。[#99755](https://github.com/ClickHouse/ClickHouse/pull/99755) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复读取形状维度为负数的 `Npy` 格式文件时出现无限循环的问题。[#99812](https://github.com/ClickHouse/ClickHouse/pull/99812) ([Desel72](https://github.com/Desel72)).
* 修复了在计算查询计划头部信息时，`CRC32` 函数以零行对 `FixedString` 参数求值时出现的 global-buffer-overflow。 [#99835](https://github.com/ClickHouse/ClickHouse/pull/99835) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 Iceberg 表上执行 `ALTER TABLE ... MODIFY COLUMN ... COMMENT` 时因空指针解引用导致的崩溃。[#99838](https://github.com/ClickHouse/ClickHouse/pull/99838) ([Desel72](https://github.com/Desel72)) 。
* 修复 `aggregate_functions_null_for_empty` 设置，使其适用于返回非 `Nullable` 类型 (如 `Array` 或 `Map`) 的聚合函数 (例如 `groupArray`、`sumMap`) 。[#99839](https://github.com/ClickHouse/ClickHouse/pull/99839) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了以混合有符号/无符号整数类型调用 `midpoint` 函数时触发的 LOGICAL&#95;ERROR 异常。[#99867](https://github.com/ClickHouse/ClickHouse/pull/99867) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了以下情况下查询中出现的“Block structure mismatch”异常：HAVING 子句的过滤表达式同时包含被会产生 NULL 的函数包裹的聚合以及 `materialize(0)`。[#99915](https://github.com/ClickHouse/ClickHouse/pull/99915) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `sipHash128Keyed` (以及类似的带键哈希函数) 中的断言失败问题：当数据参数为键中包含数组或其他嵌套数组类型的 Map 时，会触发该问题。[#99921](https://github.com/ClickHouse/ClickHouse/pull/99921) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了使用 `convertAnyJoinToSemiOrAntiJoin` 优化查询计划时，`IN` 函数中的 `LOGICAL_ERROR` 异常 &quot;Not-ready Set&quot;。 [#99939](https://github.com/ClickHouse/ClickHouse/pull/99939) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### 构建/测试/打包改进 \{#buildtestingpackaging-improvement\}

* 通过移除重量级头文件引用，并将高开销的模板实例化移出头文件，缩短编译时间。[#97893](https://github.com/ClickHouse/ClickHouse/pull/97893) ([Raúl Marín](https://github.com/Algunenano)).
* 通过缩减模板分派矩阵并移除重量级引用，缩短算术函数及相关头文件的编译时间。[#98204](https://github.com/ClickHouse/ClickHouse/pull/98204) ([Raúl Marín](https://github.com/Algunenano)).
* 使用 `mongo-c-driver` 2.2.2。[#98304](https://github.com/ClickHouse/ClickHouse/pull/98304) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 `postgres` REL&#95;18&#95;3。[#98306](https://github.com/ClickHouse/ClickHouse/pull/98306) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 为 UBSan 构建启用 jemalloc 分配器，以避免因 glibc malloc 内存回收能力较差而导致 RSS 持续累积。[#98444](https://github.com/ClickHouse/ClickHouse/pull/98444) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 使用 Rust v0 符号修饰，并从 PRQL 库中剥离内部符号，以减少解析器组合子库导致的符号名膨胀。[#98446](https://github.com/ClickHouse/ClickHouse/pull/98446) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 向 `tests/benchmarks` 添加 TPC-H 基准测试套件和 TPC-DS README。[#98495](https://github.com/ClickHouse/ClickHouse/pull/98495) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 为全部 99 个 TPC-DS 查询添加正确性测试。[#99204](https://github.com/ClickHouse/ClickHouse/pull/99204) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 添加一个用于复现离线副本 bug 中 DDL CREATE TABLE + ALTER 问题的集成测试 ([#44070](https://github.com/ClickHouse/ClickHouse/issues/44070)) ，并将其标记为预期失败。[#99259](https://github.com/ClickHouse/ClickHouse/pull/99259) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 集成带有 `je_` 前缀的 jemalloc，并移除对链接器 --wrap 的使用。[#99342](https://github.com/ClickHouse/ClickHouse/pull/99342) ([Azat Khuzhin](https://github.com/azat)).

### ClickHouse 发布 26.2，2026-02-26。 [演示](https://presentations.clickhouse.com/2026-release-26.2/), [视频](https://www.youtube.com/watch?v=7qHba08vNfo) \{#262\}

#### 不兼容变更 \{#backward-incompatible-change\}

* 默认情况下，所有插入都会开启去重。此前，异步插入和 MV 默认关闭去重，而同步插入默认开启。此更改的目标是让这两种插入方式使用相同的默认值。如果你在集群上显式禁用了去重，则必须显式设置 `deduplicate_insert='backward_compatible_choice'` 以保持旧行为。`deduplicate_blocks_in_dependent_materialized_views` 也是如此。[#95970](https://github.com/ClickHouse/ClickHouse/pull/95970) ([Sema Checherinda](https://github.com/CheSema)).
* 优化了统计信息的存储格式。现在，所有统计信息都存储在单个文件中。[#93414](https://github.com/ClickHouse/ClickHouse/pull/93414) ([Anton Popov](https://github.com/CurtizJ)) 。如果你未显式启用表统计信息，可忽略此项。
* 限制 S3(Azure)Queue 的内存元数据。系统表已从 `azure_queue` 重命名为 `azure_queue_metadata_cache`，并将 `system.s3queue` 重命名为 `s3queue_metadata_cache`。[#95809](https://github.com/ClickHouse/ClickHouse/pull/95809) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 此前，将函数应用于 `Variant` 列时，如果变体子类型与函数不兼容，会静默返回 NULL；现在则会抛出异常，这可能导致依赖这种静默 NULL 行为的查询失效。[#95811](https://github.com/ClickHouse/ClickHouse/pull/95811) ([Bharat Nallan](https://github.com/bharatnc)).
* 来自 PostgreSQL 的 `DATE` 列现在在 ClickHouse 中会被推断为 `Date32` (在之前的版本中会被推断为 `Date`，这会导致超出较小范围的值发生溢出) 。现已允许将 `Date32` 值插入回 PostgreSQL。关闭 [#73084](https://github.com/ClickHouse/ClickHouse/issues/73084)。[#95999](https://github.com/ClickHouse/ClickHouse/pull/95999) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `do_not_merge_across_partitions_select_final` 设置的语义现在更加清晰。此前，如果未在配置中显式设置该参数，此功能可能会被自动启用。这一行为反复引发困惑，而且遗憾的是，还导致了生产环境中的一些问题。现在规则更简单了：`do_not_merge_across_partitions_select_final=1` 会无条件启用该功能。如果 `do_not_merge_across_partitions_select_final=0`，则仅在新设置 `enable_automatic_decision_for_merging_across_partitions_for_final=1` 时才会使用自动决策，否则不会使用。为尽可能保留旧行为，默认值设为 `do_not_merge_across_partitions_select_final=0` 和 `enable_automatic_decision_for_merging_across_partitions_for_final=1`。[#96110](https://github.com/ClickHouse/ClickHouse/pull/96110) ([Nikita Taranov](https://github.com/nickitat)) 。
* 现在，在创建显式指定列的 S3 表时，ClickHouse 会验证这些列名是否确实存在于远程 File 的 schema 中。此前使用不匹配列名时仍可正常运行的查询，现在会在建表时失败。这解决了 [#96089](https://github.com/ClickHouse/ClickHouse/issues/96089)。[#96194](https://github.com/ClickHouse/ClickHouse/pull/96194) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 禁止在 ORDER BY 及其他表键表达式中使用子查询。 [#96847](https://github.com/ClickHouse/ClickHouse/pull/96847) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 默认启用 `apply_row_policy_after_final`。最初，当 `optimize_move_to_prewhere_if_final=0` 时，ROW POLICY 和 PREWHERE 都遵循 FINAL，并在 FINAL 之后应用。这一行为被 [#87303](https://github.com/ClickHouse/ClickHouse/issues/87303) 破坏了：该变更在 ROW POLICY 过滤条件中忽略了 `optimize_move_to_prewhere_if_final`。为修复此问题，此 PR 启用了在 [#91065](https://github.com/ClickHouse/ClickHouse/issues/91065) 中引入的设置 `apply_row_policy_after_final`。启用 `apply_row_policy_after_final` 后，ROW POLICY 将继续像之前一样默认遵循 FINAL。此 PR 是一项不兼容变更，因为它改变了 `optimize_move_to_prewhere_if_final=1` 时的行为。现在，若要让 ROW POLICY 在 FINAL 之前应用，应使用 `apply_row_policy_after_final`，而不是 `optimize_move_to_prewhere_if_final`。[#97279](https://github.com/ClickHouse/ClickHouse/pull/97279) ([Nikolai Kochetov](https://github.com/KochetovNicolai)) 。
* `Date` 类型现在在 Arrow/ArrowStream 格式中会序列化为 Arrow 原生的 `date32` 类型，而不再是 `uint16`。PyArrow 等工具现在会正确地将该列识别为日期类型。旧行为可通过 `output_format_arrow_date_as_uint16` 设置恢复。对于旧版 Arrow File (其中 `Date` 列使用 `uint16`) ，仍然支持读取。[#96860](https://github.com/ClickHouse/ClickHouse/pull/96860) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。

#### 新特性 \{#new-feature\}

* 用户现在可以直接在 ClickHouse 中使用 ClickStack (一款可观测性 UI) ，这对调试和本地开发很有帮助。[#96597](https://github.com/ClickHouse/ClickHouse/pull/96597) ([Aaron Knudtson](https://github.com/knudtty)) 。
* 支持将基于时间的一次性密码 (TOTP) 作为身份验证方式。[#71273](https://github.com/ClickHouse/ClickHouse/pull/71273) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 添加 `lazy_load_tables` 数据库设置。启用后，表不会在数据库启动时加载——而是改为创建一个轻量级的 `StorageTableProxy`，并在首次访问时才实例化实际的表引擎。[#96283](https://github.com/ClickHouse/ClickHouse/pull/96283) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 新增了 `input_format_max_block_wait_ms` 设置，以便在达到超时时间时输出数据块，并允许在 HTTP 连接意外关闭时继续处理剩余数据。[#94509](https://github.com/ClickHouse/ClickHouse/pull/94509) ([Mostafa Mohamed Salah](https://github.com/Sasao4o)).
* Google BigLake 目录集成。[#95339](https://github.com/ClickHouse/ClickHouse/issues/95339) 已关闭。[#97104](https://github.com/ClickHouse/ClickHouse/pull/97104) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 新增系统表 `system.tokenizers`，用于显示所有可用的 tokenizer。[#96753](https://github.com/ClickHouse/ClickHouse/pull/96753) ([Robert Schulze](https://github.com/rschu1ze)) 。
* 新增系统表 `system.user_defined_functions`，用于监控 UDF 导入状态及配置。[#90340](https://github.com/ClickHouse/ClickHouse/pull/90340) ([Xu Jia](https://github.com/XuJia0210)) 。
* 新增了 `system.jemalloc_stats` 表，通过 `malloc_stats_print` 暴露 jemalloc 内存分配器的统计信息，用于诊断使用 jemalloc 构建的服务器上的内存使用情况。还在 ClickHouse HTTP 接口中新增了 `/jemalloc.html` HTTP 端点，用于对这些统计信息进行交互式可视化。[#97077](https://github.com/ClickHouse/ClickHouse/pull/97077) ([Antonio Andelic](https://github.com/antonio2368)).
* 新增 `system.jemalloc_profile_text` 表，用于读取和分析 jemalloc 堆 profile。输出格式由 `jemalloc_profile_text_output_format` 设置控制 (raw、symbolized 或 collapsed；默认值为 collapsed) 。内联帧解析由 `jemalloc_profile_text_symbolize_with_inline` 控制 (启用时会包含内联帧，但会降低符号化速度；禁用时会跳过内联帧，以加快输出) 。对于 collapsed 格式，`jemalloc_profile_text_collapsed_use_count` 控制栈是按存活分配 count (true) 还是按存活字节数 (false，默认值) 加权。这使得对 jemalloc 堆 profile 进行内存分析和火焰图可视化更加方便。修复了 [#93248](https://github.com/ClickHouse/ClickHouse/issues/93248)。[#97218](https://github.com/ClickHouse/ClickHouse/pull/97218) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 添加 `default_dictionary_database` 设置，使 ClickHouse 能够在指定的默认数据库中解析未带数据库限定符的外部字典引用。这简化了从 XML 定义的全局字典迁移到 SQL 定义的按数据库划分字典的过程，从而使现有的字典查询 (例如 `dictGet(&#39;name&#39;, …)`) 无需修改即可继续工作。[#91412](https://github.com/ClickHouse/ClickHouse/pull/91412) ([Dmitrii Plotnikov](https://github.com/dimbo4ka)) 。
* 支持为 `DatabaseReplicated` 配置辅助 ZooKeeper。[#91683](https://github.com/ClickHouse/ClickHouse/pull/91683) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 实现新的表函数 `primes` 和新的系统表 `system.primes`，其中包含按升序排列的质数。关闭 [#90839](https://github.com/ClickHouse/ClickHouse/issues/90839)。[#92776](https://github.com/ClickHouse/ClickHouse/pull/92776) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 异步插入支持并行 quorum。已插入的数据会复制到 quorum 副本。如果发现重复项，查询会等待先前已插入的数据也完成复制。[#93356](https://github.com/ClickHouse/ClickHouse/pull/93356) ([Sema Checherinda](https://github.com/CheSema)).
* 新增了 functions `colorOKLABToSRGB`、`colorSRGBToOKLAB`，用于在 sRGB 与 OKLAB 之间相互转换值。[#93361](https://github.com/ClickHouse/ClickHouse/pull/93361) ([Pranav Tiwari](https://github.com/pranavt84)) 。
* 新增 `deduplicate_insert` 设置，用于覆盖 `insert_deduplicate` 和 `async_insert_deduplicate`。[#94413](https://github.com/ClickHouse/ClickHouse/pull/94413) ([Sema Checherinda](https://github.com/CheSema)) 。
* 服务器设置 `insert_deduplication_version` 支持迁移到统一的去重哈希。[#95409](https://github.com/ClickHouse/ClickHouse/pull/95409) ([Sema Checherinda](https://github.com/CheSema)).
* 新增 `xxh3_128` 哈希函数。[#96055](https://github.com/ClickHouse/ClickHouse/pull/96055) ([Raúl Marín](https://github.com/Algunenano)) 。
* 新增了 `OPTIMIZE <table> DRY RUN PARTS <part names>` 查询，可在不提交结果 part 的情况下模拟合并。这在测试场景中可能很有用：验证新版本中的合并正确性、确定性复现与合并相关的 bug，以及可靠地对合并性能进行基准测试。[#96122](https://github.com/ClickHouse/ClickHouse/pull/96122) ([Anton Popov](https://github.com/CurtizJ)) 。
* 新增一项默认启用的检查，可通过设置 `check_named_collection_dependencies` 防止删除被表使用的命名集合。[#96181](https://github.com/ClickHouse/ClickHouse/pull/96181) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 新增了 `system.fail_points`，用于检查服务器中现有的 failpoint 及其是否已启用。这将有助于实现测试自动化。[#96762](https://github.com/ClickHouse/ClickHouse/pull/96762) ([Pedro Ferreira](https://github.com/PedroTadim)).
* 为 Glue 目录添加基于角色的访问控制。使用设置 `aws_role_arn`，并可选使用 `aws_role_session_name`。[#90825](https://github.com/ClickHouse/ClickHouse/pull/90825) ([Antonio Andelic](https://github.com/antonio2368)).
* 新增设置 `add_minmax_index_for_temporal_columns`；启用后，会自动为所有 `Date`、`Date32`、`Time`、`Time64`、`DateTime` 和 `DateTime64` 列创建 minmax 索引。[#93355](https://github.com/ClickHouse/ClickHouse/pull/93355) ([Michael Jarrett](https://github.com/EmeraldShift)) 。
* 支持 JOIN 的扩展表别名 (例如 `SELECT * FROM (SELECT 1) AS t(a) JOIN (SELECT 1) AS u(b) ON a = b` 这样的查询) 。已关闭 [#95131](https://github.com/ClickHouse/ClickHouse/issues/95131)。[#95331](https://github.com/ClickHouse/ClickHouse/pull/95331) ([Yarik Briukhovetskyi](https://github.com/yariks5s)) 。
* Iceberg 表新增支持 `ALTER TABLE RENAME COLUMN`。此前仅支持 `ADD COLUMN, DROP COLUMN, and MODIFY COLUMN`。[#97455](https://github.com/ClickHouse/ClickHouse/pull/97455) ([murphy-4o](https://github.com/murphy-4o)) 。

#### 实验性功能 \{#experimental-feature\}

* 文本索引现已 GA。[#96794](https://github.com/ClickHouse/ClickHouse/pull/96794) ([Robert Schulze](https://github.com/rschu1ze)).
* 用于量化位打包向量存储 (用于近似最近邻搜索) 的 `QBit` 数据类型现已一般可用，且不再需要启用实验性设置。[#95358](https://github.com/ClickHouse/ClickHouse/pull/95358) ([Raufs Dunamalijevs](https://github.com/rienath)).
* ClickHouse 中的向量搜索现在可以使用集群中的副本来&#95;分担&#95;向量索引 parts 的负载并执行搜索。这使 ClickHouse 能够支持超出单台 VM 内存容量的大型向量索引。[#95876](https://github.com/ClickHouse/ClickHouse/pull/95876) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 新增由 `ast_fuzzer_runs` 和 `ast_fuzzer_any_query` 设置控制的服务端 AST fuzzer。启用后，服务器会在每个查询正常执行后，对其运行随机变更版本，并丢弃结果。[#97568](https://github.com/ClickHouse/ClickHouse/pull/97568) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在实验性的 KQL 方言中新增 `iif` 函数。[#94790](https://github.com/ClickHouse/ClickHouse/pull/94790) ([happyso](https://github.com/sunyeongchoi)).
* schema 推断 现已遵循 `allow_experimental_nullable_tuple_type`。启用后，它允许推断出的元组类型为 `Nullable(Tuple(...))`，这样缺失的嵌套对象可以变为 `NULL`，而不是变成由 `NULL` 元素组成的元组。[#95525](https://github.com/ClickHouse/ClickHouse/pull/95525) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `use_statistics_cache` 设置现已默认启用，因此列统计信息会缓存在内存中，以加快查询优化速度，而无需从每个分区片段重新加载。[#95950](https://github.com/ClickHouse/ClickHouse/pull/95950) ([Han Fei](https://github.com/hanfei1991)).

#### 性能优化 \{#performance-improvement\}

* 允许使用主键中的任意确定性表达式来进行数据跳过 (例如 `ORDER BY cityHash64(user_id)`/ `ORDER BY length(user_id)`) 。对于确定性表达式，ClickHouse 可以将该表达式应用到查询中的常量上，并在主键索引中使用结果来处理 `=`、`IN` 和 `has` 等谓词。如果该表达式还是单射的 (例如 `ORDER BY hex(p)` 或 `ORDER BY reverse(tuple(reverse(p), hex(p)))`) ，则索引也可有效用于其否定形式：`!=`、`NOT IN` 和 `NOT has`。已关闭 [#10685](https://github.com/ClickHouse/ClickHouse/issues/10685)。已关闭 [#82161](https://github.com/ClickHouse/ClickHouse/issues/82161)。[#92952](https://github.com/ClickHouse/ClickHouse/pull/92952) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 优化了统计信息的存储格式。现在，所有统计信息都存储在单个文件中。[#93414](https://github.com/ClickHouse/ClickHouse/pull/93414) ([Anton Popov](https://github.com/CurtizJ)) 。
* 支持对文件系统缓存中的远程表引擎/函数进行并行读取。 [#71781](https://github.com/ClickHouse/ClickHouse/pull/71781) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 允许在本地 File 和对象存储表函数中使用用户态页面缓存。[#77874](https://github.com/ClickHouse/ClickHouse/pull/77874) ([Michael Kolupaev](https://github.com/al13n321)) 。
* 避免用户态页面缓存中不必要的 memcpy。[#77884](https://github.com/ClickHouse/ClickHouse/pull/77884) ([Michael Kolupaev](https://github.com/al13n321)).
* `concurrent_threads_scheduler` 的默认值现已由 `fair_round_robin` 改为 `max_min_fair`。通过优先处理分配槽位较少的查询，这项更改提升了高负载下的公平性，从而避免短时运行的查询因长时间运行的查询而受到不利影响。[#95300](https://github.com/ClickHouse/ClickHouse/pull/95300) ([Sergei Trifonov](https://github.com/serxa)).
* 如果 `FINAL` 查询使用主键条件进行筛选，并对其他条件使用 skip 索引，`PrimaryKeyExpand` 处理步骤现在将只检查初步筛选出的主键范围是否存在交集。[#94903](https://github.com/ClickHouse/ClickHouse/pull/94903) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 当并行副本与 `s3(...)` 等表函数配合使用时，若查询中只有一个封装该表函数的子查询，现在也会自动在各副本间并行执行；而此前只有直接引用表函数的查询才会并行执行。关闭 [#92264](https://github.com/ClickHouse/ClickHouse/issues/92264)。[#96332](https://github.com/ClickHouse/ClickHouse/pull/96332) ([phulv94](https://github.com/phulv94)).
* 支持将 cache 中的数据和系统 File 在缓存中拆分为独立段。[#87834](https://github.com/ClickHouse/ClickHouse/pull/87834) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 通过为 `ColumnVector::replicate` 实现动态分派，加速部分哈希连接操作。[#79573](https://github.com/ClickHouse/ClickHouse/pull/79573) ([Raúl Marín](https://github.com/Algunenano)) 。
* 复杂谓词场景下并行 hash join 的性能提升。此前，未 join 的行仅由单个线程处理，这并不理想；此次优化旨在将未 join 行的处理并行化到多个线程中。可通过 `parallel_non_joined_rows_processing` 设置进行切换。默认启用。 [#92068](https://github.com/ClickHouse/ClickHouse/pull/92068) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 小幅优化 JSON 类型的解析。[#93614](https://github.com/ClickHouse/ClickHouse/pull/93614) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 优化 AST 的内存占用。在未使用高亮且不进行 VALUES 解析时，此项优化是合理的。[#93974](https://github.com/ClickHouse/ClickHouse/pull/93974) ([Ilya Yatsishin](https://github.com/qoega)).
* 优化具名 Tuple AST 对象的内存占用。将列名以字符串形式存储在 tuple 对象中，而不是存放在通用 AST 字面量节点中。[#94704](https://github.com/ClickHouse/ClickHouse/pull/94704) ([Ilya Yatsishin](https://github.com/qoega)) 。
* 通过增加额外的链接器选项，改进了去虚拟化效果。[#94737](https://github.com/ClickHouse/ClickHouse/pull/94737) ([Nikita Taranov](https://github.com/nickitat)) 。
* 通过对 ZooKeeper 请求进行批处理，提升拥有大量 parts 的 ReplicatedMergeTree 表的副本克隆性能。[#94847](https://github.com/ClickHouse/ClickHouse/pull/94847) ([c-end](https://github.com/c-end)) 。
* 当读取步骤中已有 PREWHERE 过滤器时，就无法再添加新的过滤器。此次变更将 PREWHERE 优化推迟到 JOIN 运行时过滤器优化之后，以便也能将运行时过滤器下推到 PREWHERE。[#95838](https://github.com/ClickHouse/ClickHouse/pull/95838) ([Alexander Gololobov](https://github.com/davenger)) 。
* 通过在 x86 上使用动态分派，加快 `T64` codec 压缩速度。 [#95881](https://github.com/ClickHouse/ClickHouse/pull/95881) ([Raúl Marín](https://github.com/Algunenano)).
* 在可能的情况下 (非 null、非 `-If`、无 GROUP BY、无 IPv6 或 String) ，通过批次插入加快数值类型上 `uniq` 的执行速度。[#95904](https://github.com/ClickHouse/ClickHouse/pull/95904) ([Raúl Marín](https://github.com/Algunenano)) 。
* Keeper 的底层优化：`ZooKeeper::observeOperations` 已被发现占 ZooKeeper 接收线程 CPU 消耗的 &gt;20%。此变更通过以下方式解决该问题：1. 对于 `AggregatedZooKeeperLog::stats`，使用 `CityHash64` 替代 `SipHash`，前者速度快 &gt;10 倍。2. 对于 `Coordination::ErrorCounter`，使用 `std::array<std::atomic<UInt32>, N>` 替代 `std::unordered_map` 和 `std::mutex`。[#95962](https://github.com/ClickHouse/ClickHouse/pull/95962) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)) 。
* 取消 ProfileEvents::Counter 的 64 字节对齐，以节省内存。[#96097](https://github.com/ClickHouse/ClickHouse/pull/96097) ([Azat Khuzhin](https://github.com/azat)) 。
* 内存优化：将 `CachedOnDiskReadBufferFromFile` 结构体大小缩小 50 倍。[#96098](https://github.com/ClickHouse/ClickHouse/pull/96098) ([Azat Khuzhin](https://github.com/azat)) 。
* 如果 hash table 为空，扩容时不要复制旧数据。[#96180](https://github.com/ClickHouse/ClickHouse/pull/96180) ([Raúl Marín](https://github.com/Algunenano)) 。
* 为 `RIGHT OUTER` JOIN 提供 JOIN 运行时过滤器支持。[#96183](https://github.com/ClickHouse/ClickHouse/pull/96183) ([Hechem Selmi](https://github.com/m-selmi)) 。
* 优化项 `enable_join_runtime_filters` 现已默认启用。[#89314](https://github.com/ClickHouse/ClickHouse/pull/89314) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 此前，文本索引直接读取优化仅在所有 parts 都具有已物化的文本索引时才会应用。此 PR 增加了部分支持：如果某些 parts 具有已物化的文本索引，这些 parts 将使用它，而没有已物化文本索引的 parts 则会回退到执行原始过滤表达式。[#96411](https://github.com/ClickHouse/ClickHouse/pull/96411) ([Anton Popov](https://github.com/CurtizJ)).
* 在系统日志表的时间列上添加了 `minmax` 次级索引，并在 `query_id`/`initial_query_id` 列上添加了 `bloom_filter` 索引，以加快过滤。[#96712](https://github.com/ClickHouse/ClickHouse/pull/96712) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 现在，lazy materialization 优化已应用于 `UNION ALL` 查询的所有分支，而不再仅限于第一个分支。对于通过 `UNION ALL` 组合来自不同 `MergeTree` 表的多个已排序且数量受限的读取操作的查询，现在每个分支都能受益于延迟列读取，从而减少 I/O。[#96832](https://github.com/ClickHouse/ClickHouse/pull/96832) ([Federico Ginosa](https://github.com/menxit)) 。
* 通过移除一次不必要的数据复制，并为数值列启用向量化的最小/最大值计算，优化了 INSERT 期间 minmax 跳过索引的计算。[#97392](https://github.com/ClickHouse/ClickHouse/pull/97392) ([Raúl Marín](https://github.com/Algunenano)) 。
* 存储 `DeltaLake` 现在会从 delta lake 元数据中获取 `count()` 的结果，并在 system.tables 中显示正确的表统计信息 (总字节数/总行数) 。[#96190](https://github.com/ClickHouse/ClickHouse/pull/96190) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 如果是从 MergeTree 读取，未使用的列也会在读取步骤中被删除。当过滤条件被下推到 `PREWHERE` 时，这一优化尤其有用。[#89982](https://github.com/ClickHouse/ClickHouse/pull/89982) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 优化了 `SHOW TABLES` 查询的处理：仅获取表名，并改进了 getLightweightTablesIterator，使其返回仅包含表名的结构。解决了 [#93835](https://github.com/ClickHouse/ClickHouse/issues/93835)。[#94467](https://github.com/ClickHouse/ClickHouse/pull/94467) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)) 。
* 改进 `assumeNotNull`、`coalesce`、`ifNull`，使得当键列被这些函数包裹时，范围谓词也能启用主键和跳数索引裁剪。关闭 [#94689](https://github.com/ClickHouse/ClickHouse/issues/94689)。[#94754](https://github.com/ClickHouse/ClickHouse/pull/94754) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 为 Keeper 的 getChildren 请求添加 with&#95;data 和 with&#95;stat 扩展。这样一来，一次操作即可不仅获取子节点列表，还能获取其 `stat` 和/或 `data`。[#94826](https://github.com/ClickHouse/ClickHouse/pull/94826) ([Nikolay Degterinsky](https://github.com/evillique)) 。
* 无论最终执行的是本地计划还是包含并行副本的计划，索引分析通常都只需执行一次。[#94854](https://github.com/ClickHouse/ClickHouse/pull/94854) ([Nikita Taranov](https://github.com/nickitat)) 。
* 支持根据 parts 的数量 (`distributed_index_analysis_min_parts_to_activate`) 和索引大小 (`distributed_index_analysis_min_indexes_size_to_activate`) 启用分布式索引分析。[#95216](https://github.com/ClickHouse/ClickHouse/pull/95216) ([Azat Khuzhin](https://github.com/azat)).
* 为 Iceberg 表启用 PREWHERE 优化。[#95476](https://github.com/ClickHouse/ClickHouse/pull/95476) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 降低部分 AST 类的内存占用。[#95514](https://github.com/ClickHouse/ClickHouse/pull/95514) ([Raúl Marín](https://github.com/Algunenano)) 。
* 限制在启用 `split_intersecting_parts_ranges_into_layers` 时生成的管道流数量，以避免内存占用过高。[#96478](https://github.com/ClickHouse/ClickHouse/pull/96478) ([Nikita Taranov](https://github.com/nickitat)) 。
* 为多个 join 实现等价 Set 优化。包含多个连续 `INNER JOIN` 操作的查询现在可受益于改进后的过滤条件下推优化。当表在等价列上进行连接时 (例如，`t1 JOIN t2 ON t1.id = t2.id JOIN t3 ON t2.id = t3.id WHERE t1.id > 10`) ，应用于该链中任意表的过滤条件都会自动下推到所有表。关闭 [#96550](https://github.com/ClickHouse/ClickHouse/issues/96550)。[#96596](https://github.com/ClickHouse/ClickHouse/pull/96596) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 优化 delta lake 元数据扫描。采用了 delta-kernel PR https://github.com/delta-io/delta-kernel-rs/pull/1827 中的更改。[#96686](https://github.com/ClickHouse/ClickHouse/pull/96686) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 在 Replicated database 中，不要针对每个 dummy 查询都更新已缓存的集群。[#96897](https://github.com/ClickHouse/ClickHouse/pull/96897) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 如果前缀仅包含 ASCII 字符，则在使用 `startsWithUTF8` 进行过滤时可使用主键索引。[#97055](https://github.com/ClickHouse/ClickHouse/pull/97055) ([vkcku](https://github.com/vkcku)) 。

#### 改进 \{#improvement\}

* 为 Keeper 请求添加 OpenTelemetry 追踪。[#91332](https://github.com/ClickHouse/ClickHouse/pull/91332) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)) 。
* 新增配置选项：`logger.startup_console_level` 和 `logger.shutdown_console_level`，分别用于在 ClickHouse 启动和关闭期间覆盖控制台日志级别。[#95919](https://github.com/ClickHouse/ClickHouse/pull/95919) ([Garrett Thomas](https://github.com/garrettthomaskth)) 。
* 重新加载配置时，遵循命令行覆盖参数。关闭 [#80294](https://github.com/ClickHouse/ClickHouse/issues/80294)。[#80295](https://github.com/ClickHouse/ClickHouse/pull/80295) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 允许在 `mongodb` 表函数中通过键值对覆盖命名集合参数。[#89616](https://github.com/ClickHouse/ClickHouse/pull/89616) ([vanchaklar](https://github.com/vanchaklar)) 。
* 针对 Iceberg 表的按顺序读取优化现在可与 `icebergBucket` 和 `icebergTruncate` 等复杂排序函数配合使用，而不再仅限于简单的列引用。[#90256](https://github.com/ClickHouse/ClickHouse/pull/90256) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 在 system.mutations 中新增一个名为 parts&#95;postpone&#95;reasons 的列，以改进诊断，显示 parts 被延后的原因。[#92206](https://github.com/ClickHouse/ClickHouse/pull/92206) ([Shaohua Wang](https://github.com/tiandiwonder)) 。
* 跟踪 `DataflowStatisticsCache` 中待读取行数的变化 (由插入/删除或查询条件缓存的使用导致) 。 [#93636](https://github.com/ClickHouse/ClickHouse/pull/93636) ([Nikita Taranov](https://github.com/nickitat)).
* 支持 `SYSTEM RESET DDL WORKER [ON CLUSTER]` 查询。该查询会请求重置 DDLWorker 主线程中的状态。当主机 ID 更新时，这有助于刷新副本的活跃状态。[#93780](https://github.com/ClickHouse/ClickHouse/pull/93780) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `system.part_log` 现已为 `MUTATE_PART` 和 `MUTATE_PART_START` 事件类型支持 `mutation_ids`。 [#93811](https://github.com/ClickHouse/ClickHouse/pull/93811) ([Shaohua Wang](https://github.com/tiandiwonder)).
* 后台操作 (Mutate、Merge) 现在可以通过 &#39;background&#39; profile 单独配置。此前，这类操作通过 &#39;default&#39; profile 与常规查询共享 settings。[#93905](https://github.com/ClickHouse/ClickHouse/pull/93905) ([Arsen Muk](https://github.com/arsenmuk)) 。
* 为 `system.crash_log` 增加更多信息。[#94112](https://github.com/ClickHouse/ClickHouse/pull/94112) [#95857](https://github.com/ClickHouse/ClickHouse/pull/95857) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)) 。
* 新增了 `QueryNonInternal` 指标，用于跟踪正在执行的非内部查询数量。该指标以 `ClickHouseMetrics_QueryNonInternal` 形式暴露，可帮助运维人员针对仅适用于非内部查询的 `max_concurrent_queries` 限制监控查询并发度。[#94284](https://github.com/ClickHouse/ClickHouse/pull/94284) ([Ashwath Singh](https://github.com/ashwath)) 。
* 支持在 `RuntimeDataflowStatisticsCacheUpdater` 中收集来自 compact parts 的列输入字节统计信息。[#94626](https://github.com/ClickHouse/ClickHouse/pull/94626) ([Nikita Taranov](https://github.com/nickitat)) 。
* 新增一项检查，用于检测会导致集群组建失败的 Keeper 配置错误。关闭了 [#60932](https://github.com/ClickHouse/ClickHouse/issues/60932)。[#94682](https://github.com/ClickHouse/ClickHouse/pull/94682) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 改进在分区片段导入期间对 JSON 前缀的反序列化处理。[#94848](https://github.com/ClickHouse/ClickHouse/pull/94848) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 使用完整的 INSERT 管道重构写入流程，从而触发目标表上的 materialized views。[#94890](https://github.com/ClickHouse/ClickHouse/pull/94890) ([Kai Zhu](https://github.com/nauu)) 。
* 仅在搜索列存在索引时，才使用向量相似性搜索的计划优化。[#94998](https://github.com/ClickHouse/ClickHouse/pull/94998) ([Eduard Karacharov](https://github.com/korowa)) 。
* 在用户身份验证之前检查总内存限制；如果总限制超过允许值，则抛出 `(total) memory limit exceeded`。[#95003](https://github.com/ClickHouse/ClickHouse/pull/95003) ([Nikolai Kochetov](https://github.com/KochetovNicolai)) 。
* 新增了 `throw_on_unmatched_row_policies` 配置选项；启用后，如果用户查询某个表，而该表配置了行策略但没有任何一条适用于该用户，则会抛出异常，从而避免因访问控制配置错误而产生返回所有行这一含义模糊的行为。[#95014](https://github.com/ClickHouse/ClickHouse/pull/95014) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 在使用 Unity Catalog 的长时间运行查询中动态更新 S3 访问 token。此更改关闭了 [#93981](https://github.com/ClickHouse/ClickHouse/issues/93981)。[#95069](https://github.com/ClickHouse/ClickHouse/pull/95069) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 如果 ClickHouse 持续处于内存压力下达 `memory_worker_decay_adjustment_period_ms` 毫秒，则禁用 jemalloc 的脏页衰减；如果 ClickHouse 在相同时间内恢复到正常工作状态，则重新启用 jemalloc 的脏页衰减。[#95145](https://github.com/ClickHouse/ClickHouse/pull/95145) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 支持 S3Queue 使用 s3Queue 的 `keeper_path` 设置作为辅助 ZooKeeper。[#95203](https://github.com/ClickHouse/ClickHouse/pull/95203) ([Diego Nieto](https://github.com/lesandie)).
* 使 TTL drop part merge 遵循 `max_parts_to_merge_at_once`。[#95315](https://github.com/ClickHouse/ClickHouse/pull/95315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 向 query&#95;log 中新增 `connection_address` 和 `connection_port`，以反映实际物理连接 (当通过代理连接且 auth&#95;use&#95;forwarded&#95;address=1 时，`address` 和 `port` 会被替换) 。[#95471](https://github.com/ClickHouse/ClickHouse/pull/95471) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)) 。
* 修复查询条件缓存的内存核算错误。问题的关键在于，此前未将由多个字符串组成的缓存键纳入计算 (例如 part&#95;name、表 id 以及整个 SQL 条件) 。[#95478](https://github.com/ClickHouse/ClickHouse/pull/95478) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)) 。
* 使用嵌入式配置启动的服务器将允许操作用户和授权，并像常规配置一样将其保存到 `access` 目录中。这有助于改进测试。此外，还在嵌入式配置和 clickhouse-local 中启用了所有 access&#95;control&#95;improvements。[#95481](https://github.com/ClickHouse/ClickHouse/pull/95481) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 改进了 S3 身份验证错误消息：在访问被拒绝时，加入了提示以建议检查凭据。[#95648](https://github.com/ClickHouse/ClickHouse/pull/95648) ([Gerald Latkovic](https://github.com/batkovic75)) 。
* 启用统计信息 cache，并将 cache 的更新周期设置为 300 秒。[#95841](https://github.com/ClickHouse/ClickHouse/pull/95841) ([Han Fei](https://github.com/hanfei1991)) 。
* 在 `system.aggregated_zookeeper_log` 中添加组件名称。[#95882](https://github.com/ClickHouse/ClickHouse/pull/95882) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 从 `system.tables` 查询 `DeltaLake` 表时，跳过对对象存储的读取。[#95899](https://github.com/ClickHouse/ClickHouse/pull/95899) ([Antonio Andelic](https://github.com/antonio2368)).
* 如果 `compatibility` 设置为 `26.2` 或更高版本，则默认启用 `enable_max_bytes_limit_for_min_age_to_force_merge`。 [#95917](https://github.com/ClickHouse/ClickHouse/pull/95917) ([Christoph Wurm](https://github.com/cwurm)) 。
* Delta Lake 现已可在 macOS 上使用。关闭 #95979。[#95985](https://github.com/ClickHouse/ClickHouse/pull/95985) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 在早期版本中，将相互冲突的 ALTER 表达式与 UPDATE 和 RENAME COLUMN 组合使用时，抛出的是逻辑错误，而不是恰当的异常。修复了 [#70678](https://github.com/ClickHouse/ClickHouse/issues/70678)。[#96022](https://github.com/ClickHouse/ClickHouse/pull/96022) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 改进所有 ClickHouse 应用的帮助输出，添加 `--no-sudo` 选项，并进行了一些修复。这是对 [Ilya Yatsishin](https://github.com/qoega) 的 [#58244](https://github.com/ClickHouse/ClickHouse/issues/58244) 的延续。[#96025](https://github.com/ClickHouse/ClickHouse/pull/96025) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 为 `cosineDistance` 新增 `distanceCosine` 别名，因为其他所有距离函数都已有这种形式的别名。[#96065](https://github.com/ClickHouse/ClickHouse/pull/96065) ([Raufs Dunamalijevs](https://github.com/rienath)) 。
* 新增对 `with_data` Keeper 扩展的支持，以改进 Replicated 数据库中的表获取流程。 [#96090](https://github.com/ClickHouse/ClickHouse/pull/96090) ([Nikolay Degterinsky](https://github.com/evillique)).
* 将 chdig 更新至 [v26.2.1](https://github.com/azat/chdig/releases/tag/v26.2.1) (新增功能并支持 MacOS) 。[#96113](https://github.com/ClickHouse/ClickHouse/pull/96113) ([Azat Khuzhin](https://github.com/azat)) 。
* 改进 `numbers` 和 `primes` 的 filter 下推。现在，当无法根据 `WHERE` 条件推导出精确边界时，ClickHouse 可以推导出保守的取值范围，并据此限制序列生成 (例如，对于 `WHERE number % 5 < 2 AND number > 100 AND number < 300`，ClickHouse 只会生成 100 到 300 之间的数字，然后再应用该谓词) ，从而避免无界扫描。关闭 [#84853](https://github.com/ClickHouse/ClickHouse/issues/84853)。关闭 [#93913](https://github.com/ClickHouse/ClickHouse/issues/93913)。[#96115](https://github.com/ClickHouse/ClickHouse/pull/96115) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 格式化器此前在存在 `COMMENT` 子句时，会将 SELECT 用括号括起来，以消除解析歧义。现在改为在 `AS SELECT` 之前输出 `COMMENT`，这样无需括号即可消除歧义。[#96293](https://github.com/ClickHouse/ClickHouse/pull/96293) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* `allow_impersonate_user` config 设置现已位于 `access_control_improvements` 部分中，不再是独立的服务器设置。[#96451](https://github.com/ClickHouse/ClickHouse/pull/96451) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 使 `core_dump.size_limit` 配置项支持热重载，从而避免为使配置更改生效而必须重启服务器。[#96524](https://github.com/ClickHouse/ClickHouse/pull/96524) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)) 。
* 改进了 CPU 分析器与实时分析器在 socket 超时场景下的互操作性。[#96601](https://github.com/ClickHouse/ClickHouse/pull/96601) ([Sergei Trifonov](https://github.com/serxa)) 。
* 防止在 DROP COLUMN 变更后很快执行 ADD COLUMN 时，已删除的数据重新恢复。[#96713](https://github.com/ClickHouse/ClickHouse/pull/96713) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 `system.instrumentation` 中 `function_id` 的类型从 LowCardinality(Int32) 改为 Int32。[#96726](https://github.com/ClickHouse/ClickHouse/pull/96726) (Copilot) 。
* 同步等待变更时，将遵循查询取消和时间限制。[#96756](https://github.com/ClickHouse/ClickHouse/pull/96756) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 新增了系统命令 `SYSTEM RELOAD DELTA KERNEL TRACING <level>`，可用于更改 delta-kernel 的日志级别，这对调试很有帮助。[#96763](https://github.com/ClickHouse/ClickHouse/pull/96763) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 按 IP 地址族进行过滤 (即 `dns_allow_resolve_names_to_ipv4/ipv6` settings) 即使在 DNS cache 被禁用时也会生效。[#96810](https://github.com/ClickHouse/ClickHouse/pull/96810) ([c-end](https://github.com/c-end)).
* 增强 jemalloc 自省功能。[#96840](https://github.com/ClickHouse/ClickHouse/pull/96840) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了 `/play` Web UI 在查询系统表时抛出 `QUERY_CACHE_USED_WITH_SYSTEM_TABLE` 错误的问题。[#96869](https://github.com/ClickHouse/ClickHouse/pull/96869) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 改进 Web UI：更改 favicon 以指示查询正在运行的状态；显示辅助查询 (加载数据库和表) 返回的错误，而不是将其静默忽略。关闭 [#85055](https://github.com/ClickHouse/ClickHouse/issues/85055)。[#96883](https://github.com/ClickHouse/ClickHouse/pull/96883) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 将 `/play` UI 中的左侧面板设为可点击，以切换数据库列表。[#96884](https://github.com/ClickHouse/ClickHouse/pull/96884) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `DROP DATABASE` 现在会按依赖关系的逆序删除表，从而在数据库包含具有导入依赖关系的表时提升崩溃安全性 (例如使用 `joinGet` 的 `Distributed` 表) 。[#97057](https://github.com/ClickHouse/ClickHouse/pull/97057) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 升级 yaml-cpp，以避免跳过无效 YAML。[#97333](https://github.com/ClickHouse/ClickHouse/pull/97333) ([Azat Khuzhin](https://github.com/azat)) 。
* 在获取表时，在 `play.html` 侧边栏中显示加载指示器。[#97531](https://github.com/ClickHouse/ClickHouse/pull/97531) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 在内置 Web UI (play.html) 中新增了用于将原始查询结果复制到剪贴板的按钮。[#97532](https://github.com/ClickHouse/ClickHouse/pull/97532) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复查询混淆器 (`clickhouse-format --obfuscate`) ，使其在更多情况下能够生成可解析的 SQL。[#97584](https://github.com/ClickHouse/ClickHouse/pull/97584) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。

#### 错误修复(官方稳定版本中用户可见的异常行为) \{#bug-fix-user-visible-misbehavior-in-an-official-stable-release\}

* 在仅涉及元数据的 ALTER (例如扩展 Enums 的元素) 之后，使用 projection 进行聚合优化时可能会抛出异常。[#84143](https://github.com/ClickHouse/ClickHouse/pull/84143) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* materialized views 现在使用其创建所在的数据库作为执行上下文，这意味着： - 可以省略在视图的 select query 中引用名称时对数据库的显式限定 - 如果未显式限定数据库，则默认使用创建 materialized view 时所在的同一数据库。 [#88193](https://github.com/ClickHouse/ClickHouse/pull/88193) ([Dmitry Kovalev](https://github.com/dk-github)).
* 修复在使用 ON CLUSTER 时，CREATE USER 认证方法中查询参数的替换问题。此前，认证方法中的查询参数 (例如密码) 不会被替换，导致远程节点上出现 UNKNOWN&#95;QUERY&#95;PARAMETER 错误。[#92777](https://github.com/ClickHouse/ClickHouse/pull/92777) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复了 `has`、`mapContainsKey` 和 `mapContainsValue` 函数在文本索引分析中的不一致问题。此前，使用这些函数的查询在表达式使用或不使用文本索引进行求值时，可能会返回不同的结果。[#93578](https://github.com/ClickHouse/ClickHouse/pull/93578) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复在将表附加到 `MaterializedPostgreSQL` 数据库时，若 `dropReplicationSlot` 在栈展开过程中抛出异常而引发的崩溃。[#96871](https://github.com/ClickHouse/ClickHouse/pull/96871) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 如果对同一批 File 执行多个相互冲突的并发备份，可能会导致服务器崩溃。[#93659](https://github.com/ClickHouse/ClickHouse/pull/93659) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了使用并行副本以及与非 MT 表进行 JOIN 时的查询问题。关闭了 [#92056](https://github.com/ClickHouse/ClickHouse/issues/92056)。[#93902](https://github.com/ClickHouse/ClickHouse/pull/93902) ([Igor Nikonov](https://github.com/devcrafter)) 。
* 修复了一个问题：名称中带有点号的 Iceberg 列返回值为 NULL。 [#94335](https://github.com/ClickHouse/ClickHouse/pull/94335) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 修复了 `stringJaccardIndexUTF8` 对 UTF8 字符串的处理问题，并提升了性能。[#94613](https://github.com/ClickHouse/ClickHouse/pull/94613) ([Joanna Hulboj](https://github.com/jh0x)) 。
* 修复 `WITH FILL STALENESS` 中可能出现的溢出问题 (会导致未定义行为和/或无限循环) 。修复因大跨度跳变而可能导致的无限循环。添加对旧版分析器的支持 (主要用于压力测试) 。[#94663](https://github.com/ClickHouse/ClickHouse/pull/94663) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复在主机名解析为多个地址且远程副本冻结时，分布式查询可能卡住的问题。[#94726](https://github.com/ClickHouse/ClickHouse/pull/94726) ([c-end](https://github.com/c-end)).
* 修复了对多个表表达式执行 JOIN 时出现的无效结果问题，当最左侧的表表达式为 `-Cluster` 表函数时。解决了 [#89996](https://github.com/ClickHouse/ClickHouse/issues/89996)。[#94748](https://github.com/ClickHouse/ClickHouse/pull/94748) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 修复涉及 `toWeek`、`toYearWeek`、`toStartOfWeek`、`toLastDayOfWeek` 和 `toDayOfWeek` 的谓词中主键裁剪和跳数索引裁剪不正确的问题，并修复其中某些函数在对 `LowCardinality(String)` 执行有效查询时引发的异常。[#94816](https://github.com/ClickHouse/ClickHouse/pull/94816) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 移除对启用 SQL Security 的视图执行 `ATTACH` 查询时不必要的跳过权限检查行为。这样可防止用户在未验证所需访问权限的情况下附加带有 definer 的视图，从而造成潜在的权限提升。 [#94865](https://github.com/ClickHouse/ClickHouse/pull/94865) ([pufit](https://github.com/pufit)).
* 修复了 `ReplicatedMergeTree` 启动期间因并发删除 `delete_tmp_*` 目录导致的崩溃。[#94892](https://github.com/ClickHouse/ClickHouse/pull/94892) ([myeongjun](https://github.com/myeongjjun)).
* 修复了向带有 materialized views 的 Iceberg 表执行 `INSERT` 时丢失去重信息并导致异常的问题。[#94938](https://github.com/ClickHouse/ClickHouse/pull/94938) ([Daniil Ivanik](https://github.com/divanik)) 。
* 修复了一个 bug：`SYSTEM DROP QUERY CACHE TAG 'TAGNAME' ON CLUSTER <CLUSTERNAME>` 会清空集群上的整个查询缓存。[#94978](https://github.com/ClickHouse/ClickHouse/pull/94978) ([Rory Crispin](https://github.com/RoryCrispin)) 。
* 在 Vertical 合并后保留固定的索引粒度 (use&#95;const&#95;adaptive&#95;granularity)  (v2，修复了 Nested 的问题，并进行了整体改进) 。[#95013](https://github.com/ClickHouse/ClickHouse/pull/95013) ([Azat Khuzhin](https://github.com/azat)).
* 修复了 26.1 版本在 [ClickHouse/ClickHouse[#82764](https://github.com/ClickHouse/ClickHouse/issues/82764)](https://github.com/ClickHouse/ClickHouse/pull/82764) 之后引入的文件系统缓存竞争问题。[#95042](https://github.com/ClickHouse/ClickHouse/pull/95042) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复在 clickhouse-client 中使用 KILL QUERY 和取消查询 (Ctrl+C) 中止 `postgresql()` 表函数时的问题。 [#95136](https://github.com/ClickHouse/ClickHouse/pull/95136) ([Roman Vasin](https://github.com/rvasin)).
* 修复了在使用多个带有 `USING` 子句的 JOIN 时，对源表中带限定符的列进行类型推断的问题。此前，后续 JOIN 会错误地将底层源列的类型更新为共同超类型，即使该列并未参与该次 JOIN (例如，在 `SELECT t2.a FROM t1 LEFT JOIN t2 USING (a) LEFT JOIN t3 USING (a)` 中，`t2.a` 列仅用于第一个 JOIN，因此其类型应为 `t1.a` 和 `t2.a` 的超类型，不应包含 `t3.a`) 。当函数预期的列类型与执行计划中实际出现的类型不一致时，这可能会导致逻辑错误或崩溃。[#95157](https://github.com/ClickHouse/ClickHouse/pull/95157) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 在获取 manifest .avro 列表和 File 内容时，列转换仅执行一次。[#95164](https://github.com/ClickHouse/ClickHouse/pull/95164) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了 JSON 列大小计算不正确的问题，此问题可能导致内存占用过高或列统计信息错误。[#95207](https://github.com/ClickHouse/ClickHouse/pull/95207) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在轻量级更新后应用大型补丁分区片段时内存核算不准确的问题。此前，应用大型补丁可能导致内存占用过高，并使服务器进程被 OOM 杀手终止。[#95231](https://github.com/ClickHouse/ClickHouse/pull/95231) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了一处未定义行为：当带有 `max_parallel_replicas` 的分布式查询在索引分析期间回退到本地副本时，可能会返回错误结果或抛出异常。[#95263](https://github.com/ClickHouse/ClickHouse/pull/95263) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复在 `group_by_overflow_mode` 设置为 `any` 时，`sum` 和时间序列对稀疏列进行聚合的问题。[#95301](https://github.com/ClickHouse/ClickHouse/pull/95301) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 修复了 `plain_rewritable` 磁盘策略中的一个可靠性问题：在解除元数据 File 链接的过程中，如果中途发生网络错误，可能导致存储处于不一致状态。[#95302](https://github.com/ClickHouse/ClickHouse/pull/95302) ([Mikhail Artemenko](https://github.com/Michicosun)) 。
* 将 Iceberg 中的 Date 替换为 Date32。[#95322](https://github.com/ClickHouse/ClickHouse/pull/95322) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* `redis`表函数的 password 参数现在会在日志和系统表中被屏蔽 (例如：`query_log`) 。[#95325](https://github.com/ClickHouse/ClickHouse/pull/95325) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了一个 bug：在分布式查询仍在相关表上执行时，这些表仍可能被删除或修改，进而导致异常或错误结果。[#95356](https://github.com/ClickHouse/ClickHouse/pull/95356) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了在某些情况下，分布式查询中使用负数 `LIMIT/OFFSET` 时出现的逻辑错误。[#95357](https://github.com/ClickHouse/ClickHouse/pull/95357) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 修复了一个 bug：通过 ssh 连接时，clickhouse-client 会提示输入两次密码。[#95372](https://github.com/ClickHouse/ClickHouse/pull/95372) ([Isak Ellmer](https://github.com/spinojara)) 。
* 修复 storage S3(Azure)Queue 中的数据竞争问题。[#95385](https://github.com/ClickHouse/ClickHouse/pull/95385) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复了由 prewhere 中的 lambda 表达式引起的 prewhere filter 错误。[#95395](https://github.com/ClickHouse/ClickHouse/pull/95395) ([Xiaozhe Yu](https://github.com/wudidapaopao)) 。
* 修复 `optimize_syntax_fuse_functions`：当聚合 argument 为 `Nullable` 时，不再将 `sum/count/avg` Rewrite 为 `sumCount()`。关闭 [#95390](https://github.com/ClickHouse/ClickHouse/issues/95390)。[#95441](https://github.com/ClickHouse/ClickHouse/pull/95441) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 避免在取消 distributed queries 时可能发生的崩溃。[#95466](https://github.com/ClickHouse/ClickHouse/pull/95466) ([Aleksandr Musorin](https://github.com/AVMusorin)) 。
* 修复 S3(Azure)Queue 引擎流式传输中的去重问题。[#95467](https://github.com/ClickHouse/ClickHouse/pull/95467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了在分布式查询中更新分配给初始用户的行级策略时出现的问题。[#95469](https://github.com/ClickHouse/ClickHouse/pull/95469) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 修复对基于 plain&#95;rewritable 的加密磁盘的检查 (修复可能出现的 `It is not possible to register multiple plain-rewritable disks with the same object storage prefix` 问题) 。[#95470](https://github.com/ClickHouse/ClickHouse/pull/95470) ([Azat Khuzhin](https://github.com/azat)) 。
* `mergeTreeProjection` 表函数此前缺少访问检查，导致没有表 SELECT 权限 (但具有表函数权限) 的用户也可以读取其投影中的数据。此修复增加了与 `mergeTreeIndex` 和 `mergeTreeAnalyzeIndexes` 已具备的相同访问检查。[#95480](https://github.com/ClickHouse/ClickHouse/pull/95480) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复读取 Dynamic/JSON 类型动态子列中的 size 子列时可能出现的逻辑错误。[#95573](https://github.com/ClickHouse/ClickHouse/pull/95573) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复了由 [#94262](https://github.com/ClickHouse/ClickHouse/issues/94262) 引入的 (实验性) 零拷贝复制中的回归问题：共享的 parts 可能会在其他副本完成获取这些 parts 之前被删除。[#95597](https://github.com/ClickHouse/ClickHouse/pull/95597) ([filimonov](https://github.com/filimonov)) 。
* 修复对 JSON 数组应用 `tupleElement` 时发生的崩溃问题。关闭 [#95581](https://github.com/ClickHouse/ClickHouse/issues/95581)。[#95647](https://github.com/ClickHouse/ClickHouse/pull/95647) ([Pavel Kruglov](https://github.com/Avogar)) 。
* 修复在带有 USING 的 JOIN 中，在 VALUES 子句内的 lambda 函数中使用匹配器 (`*`) 时触发的逻辑错误异常。关闭 [#93675](https://github.com/ClickHouse/ClickHouse/issues/93675)。[#95661](https://github.com/ClickHouse/ClickHouse/pull/95661) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 修复了在等待分布式 DDL 的同时并发删除 Replicated 数据库时出现的 `There was an error: Cannot obtain error message` 逻辑错误。修复 [#95539](https://github.com/ClickHouse/ClickHouse/issues/95539)。[#95664](https://github.com/ClickHouse/ClickHouse/pull/95664) ([Alexander Tokmakov](https://github.com/tavplubix)) 。
* 修复了在启用 `transform_null_in` 时，`IN` 函数对 `NULL` 值返回错误结果的问题。关闭 [#65776](https://github.com/ClickHouse/ClickHouse/issues/65776)。[#95674](https://github.com/ClickHouse/ClickHouse/pull/95674) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 启用设置 `cast_keep_nullable` 时，正确处理 `CAST` 中的 LowCardinality Nullable 类型。修复 [#95670](https://github.com/ClickHouse/ClickHouse/issues/95670)。[#95747](https://github.com/ClickHouse/ClickHouse/pull/95747) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复合并已分区的 delta lake 数据时的问题。[#95773](https://github.com/ClickHouse/ClickHouse/pull/95773) ([Kseniia Sumarokova](https://github.com/kssenii)) 。
* 修复运行时过滤器中 Nullable join 列的竞态条件。[#95775](https://github.com/ClickHouse/ClickHouse/pull/95775) ([Hechem Selmi](https://github.com/m-selmi)) 。
* 修复了在表和选择列表中的 `USING` 列类型不同时，带有匹配器 (`*`、`table.*`) 和 `analyzer_compatibility_join_using_top_level_identifier` 的查询中可能出现的逻辑错误。关闭 [#90477](https://github.com/ClickHouse/ClickHouse/issues/90477)。[#95808](https://github.com/ClickHouse/ClickHouse/pull/95808) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 修复并行线程池操作 (备份、聚合、分布式查询) 中的内存安全问题；当任务调度期间发生错误时，这些问题可能导致异常。[#95818](https://github.com/ClickHouse/ClickHouse/pull/95818) ([Raúl Marín](https://github.com/Algunenano)) 。
* 修复了在执行 DROP WORKLOAD、且同时有查询使用正在被删除的 workload 时发生的崩溃。[#95856](https://github.com/ClickHouse/ClickHouse/pull/95856) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了以下情况下查询 system table 时性能缓慢的问题：使用的 USER 在许多数据库上仅具有有限授权。关闭了 [#89371](https://github.com/ClickHouse/ClickHouse/issues/89371)。[#95874](https://github.com/ClickHouse/ClickHouse/pull/95874) ([pufit](https://github.com/pufit)) 。
* 修复了在具有嵌套路径的 JSON 上执行 tupleElement 时的问题，此前这可能会导致错误的查询结果。[#95907](https://github.com/ClickHouse/ClickHouse/pull/95907) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个可能出现的 `NOT_SUPPORTED` 错误：在空的 MergeTree 表上使用 `direct` join 算法时，可能会触发该错误。[#95935](https://github.com/ClickHouse/ClickHouse/pull/95935) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 修复了客户端不会为 settings 的别名提供建议和自动补全的问题，关闭 [#92190](https://github.com/ClickHouse/ClickHouse/issues/92190)。[#95945](https://github.com/ClickHouse/ClickHouse/pull/95945) ([phulv94](https://github.com/phulv94)).
* 修复 system.asynchronous&#95;metric&#95;log 中 event&#95;date 的问题。[#95947](https://github.com/ClickHouse/ClickHouse/pull/95947) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了 JSON 数据类型中跳过路径的问题。此前使用 `JSON(SKIP path)` 时，所有以前缀 `path` 开头的 JSON 键都会被跳过，甚至包括 `"pathpath"` 这样的键，因此在 insert 期间可能导致这些路径的数据丢失。现在该问题已修复，只有键 `"path"` 会被跳过。[#95948](https://github.com/ClickHouse/ClickHouse/pull/95948) ([Pavel Kruglov](https://github.com/Avogar)).
* 带有未知 projections 的分区片段不应被永久标记为丢失。[#95952](https://github.com/ClickHouse/ClickHouse/pull/95952) ([Mikhail Artemenko](https://github.com/Michicosun)) 。
* 修复 `Join` 表中使用 `Nullable(String)` 键时，空字符串变为 `NULL` 的问题。关闭 [#71414](https://github.com/ClickHouse/ClickHouse/issues/71414)。[#96002](https://github.com/ClickHouse/ClickHouse/pull/96002) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 现在，PostgreSQL 引擎已可正确读取 `BOOLEAN[]`。修复了 [#72754](https://github.com/ClickHouse/ClickHouse/issues/72754)。[#96006](https://github.com/ClickHouse/ClickHouse/pull/96006) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了从空文件读取时 `ProtobufList` 格式的问题。已关闭 [#70059](https://github.com/ClickHouse/ClickHouse/issues/70059)。[#96007](https://github.com/ClickHouse/ClickHouse/pull/96007) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `ProtobufList` 格式在空表中产生幽灵记录的问题。关闭 [#72596](https://github.com/ClickHouse/ClickHouse/issues/72596)。[#96010](https://github.com/ClickHouse/ClickHouse/pull/96010) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在一种涉及分布式查询、PREWHERE 和类型推断的特殊情况下，`if` function 的 `UInt64` 与 `Int32` type 不匹配问题。关闭了 [#70017](https://github.com/ClickHouse/ClickHouse/issues/70017)。[#96012](https://github.com/ClickHouse/ClickHouse/pull/96012) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复涉及 `Bool` 类型的 `JIT` 编译查询问题。[#96013](https://github.com/ClickHouse/ClickHouse/pull/96013) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复从 SQLite TEXT 列读取 UUID 列时出现的逻辑错误。关闭 [#71263](https://github.com/ClickHouse/ClickHouse/issues/71263)。[#96016](https://github.com/ClickHouse/ClickHouse/pull/96016) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 SQLite 引擎对 `DateTime`、`Date`、`UUID` 及其他类型的转换问题。关闭 [#73481](https://github.com/ClickHouse/ClickHouse/issues/73481)。[#96017](https://github.com/ClickHouse/ClickHouse/pull/96017) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 在针对外部数据库 SQLite 和 PostgreSQL 的查询中，`FixedString` 值被错误地转义。关闭 [#73519](https://github.com/ClickHouse/ClickHouse/issues/73519)。与 @jh0x 共同完成。[#96019](https://github.com/ClickHouse/ClickHouse/pull/96019) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 WindowTransform 在 PRECEDING 偏移量较大时触发的断言失败。关闭了 [#75852](https://github.com/ClickHouse/ClickHouse/issues/75852)。[#96026](https://github.com/ClickHouse/ClickHouse/pull/96026) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了一个可能导致数据损坏的问题：当并发异步插入使用相同的参数名但参数值不同时，可能会发生数据损坏。[#96035](https://github.com/ClickHouse/ClickHouse/pull/96035) ([Seva Potapov](https://github.com/seva-potapov)) 。
* 修复全局 profiler 的周期 (由 `global_profiler_real_time_period_ns` 和 `global_profiler_cpu_time_period_ns` 控制) 。此前使用的是截断后的值，而不是设定值，导致 profiler 的唤醒频率高于预期。[#96048](https://github.com/ClickHouse/ClickHouse/pull/96048) ([Antonio Andelic](https://github.com/antonio2368)).
* 此前，如果用于 position delete 的 Iceberg manifest File 中，某个 entry 里存在 reference data File 但其值为 null，我们就无法获取对应 data File 的正确边界。此 PR 修复了该 bug。[#96061](https://github.com/ClickHouse/ClickHouse/pull/96061) ([Daniil Ivanik](https://github.com/divanik)).
* 修复撤销默认角色时的问题。 [#96103](https://github.com/ClickHouse/ClickHouse/pull/96103) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复了一种罕见情况下索引分析中的释放后使用问题：当 `use_primary_key` 被禁用，且使用索引的条件析取数量非常大时会触发该问题。[#96112](https://github.com/ClickHouse/ClickHouse/pull/96112) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 `Gorilla` codec 中的一个回归问题：当显式指定的大小与数据类型大小不一致，且缓冲区大小过小时，在先前版本中会在解压时抛出异常。关闭了 [#78253](https://github.com/ClickHouse/ClickHouse/issues/78253)。[#96118](https://github.com/ClickHouse/ClickHouse/pull/96118) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 避免在已加载的字典中出现死锁：当某个字典引用了一个递归引用该字典的 Merge 表时，会发生这种情况。关闭 [#78360](https://github.com/ClickHouse/ClickHouse/issues/78360)。[#96120](https://github.com/ClickHouse/ClickHouse/pull/96120) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `formatDateTime` 在使用非固定宽度 Formatter (如 MySQL 和 JODA 风格) 时读取未初始化值的问题。[#96133](https://github.com/ClickHouse/ClickHouse/pull/96133) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 设置 `use_const_adaptive_granularity` 与 `index_granularity_bytes` 的组合 (即“非自适应粒度”) 导致待读取行数计算错误，并引发异常。[#96143](https://github.com/ClickHouse/ClickHouse/pull/96143) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 在对象存储上的类文件表 (例如 S3 和 Azure) 上执行无效的 ALTER UPDATE 变更，可能会导致 nullptr 解引用。关闭 [#92994](https://github.com/ClickHouse/ClickHouse/issues/92994)。[#96162](https://github.com/ClickHouse/ClickHouse/pull/96162) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `AccessRights::contains` 在存在部分撤销时返回结果错误的问题。[#96170](https://github.com/ClickHouse/ClickHouse/pull/96170) ([pufit](https://github.com/pufit)) 。
* 修复了 CTE 折叠常量导致的查询条件缓存哈希冲突问题，该问题可能会导致错误的查询结果。关闭 [#96060](https://github.com/ClickHouse/ClickHouse/issues/96060)。[#96172](https://github.com/ClickHouse/ClickHouse/pull/96172) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 ProcessList 中可能出现的死锁。当我们向 cancellation checker 添加任务时，如果 memory overcommit tracker 被触发，可能会因潜在的锁顺序反转而导致该问题。[#96182](https://github.com/ClickHouse/ClickHouse/pull/96182) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 修复了一个错误：由于非法的 JOIN 重排序，包含外连接 (LEFT、RIGHT 或 FULL) 并结合多个 INNER JOIN 的查询可能返回错误结果。当外连接的 ON 条件引用了多个此前已 JOIN 的表中的列时，优化器未能考虑所有表依赖关系，因此可能错误地对 JOIN 进行重排序，导致结果缺少行。关闭 [#95972](https://github.com/ClickHouse/ClickHouse/issues/95972)。[#96193](https://github.com/ClickHouse/ClickHouse/pull/96193) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 当表未定义统计信息时，ClickHouse 不应尝试导入这些统计信息。这样可避免因检查统计信息 File 是否存在而带来的一些额外开销 (100+ 毫秒) 。 (问题 [#96068](https://github.com/ClickHouse/ClickHouse/issues/96068)) 。[#96233](https://github.com/ClickHouse/ClickHouse/pull/96233) ([Han Fei](https://github.com/hanfei1991)) 。
* 修复 `optimize_syntax_fuse_functions`：当聚合参数为 `LowCardinality(Nullable)` 时，不再将 `sum/count/avg` 重写为 `sumCount()`。关闭 [#95390](https://github.com/ClickHouse/ClickHouse/issues/95390)。[#96239](https://github.com/ClickHouse/ClickHouse/pull/96239) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 修复了在某些情况下 `not IN` 和 `not has` 函数分区裁剪错误的问题。[#96241](https://github.com/ClickHouse/ClickHouse/pull/96241) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 修复向量相似度索引中的 `stack-use-after-scope` 问题。[#96259](https://github.com/ClickHouse/ClickHouse/pull/96259) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了当查询前有 SQL 注释时，测试运行器无法识别错误提示注释的问题。[#96336](https://github.com/ClickHouse/ClickHouse/pull/96336) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)) 。
* 修复了在以下情况下 KeyCondition 中的逻辑错误：表的主键为 Nullable，且查询使用了`coalesce`函数，并且其第一个参数为常量。[#96340](https://github.com/ClickHouse/ClickHouse/pull/96340) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* `GROUPING SETS`、`group_by_use_nulls` 以及内部包含 `LowCardinality` 的 `Tuple` 数据类型之间的相互作用，可能会在查询管道中产生非预期的数据块结构，从而导致逻辑错误。该问题出现在引入 `Nullable` `Tuple` 之后。 [#96358](https://github.com/ClickHouse/ClickHouse/pull/96358) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 此前可以使用空表达式 `()` 作为索引创建表，从而导致无效的内存访问。[#96363](https://github.com/ClickHouse/ClickHouse/pull/96363) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了旧版分析器在出现 JOIN 和重复别名时崩溃的问题。[#96405](https://github.com/ClickHouse/ClickHouse/pull/96405) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复因针对 Variant 列的错误就地过滤优化而导致的 `Nested columns sizes are inconsistent with local_discriminators` 错误。[#96410](https://github.com/ClickHouse/ClickHouse/pull/96410) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `CREATE TABLE ... CLONE AS ...` 忽略 source 表全限定名的问题。[#96415](https://github.com/ClickHouse/ClickHouse/pull/96415) ([Hasyimi Bahrudin](https://github.com/hasyimibhar)) 。
* 修复了在 clickhouse-client 中无法通过 KILL QUERY 和取消查询 (Ctrl+C) 取消 `mysql` 表函数的问题。 [#96437](https://github.com/ClickHouse/ClickHouse/pull/96437) ([Roman Vasin](https://github.com/rvasin)).
* 修复了 `max_execution_time` 值较高的查询中，取消检查线程的活锁问题。[#96450](https://github.com/ClickHouse/ClickHouse/pull/96450) ([Sergei Trifonov](https://github.com/serxa)) 。
* 修复了在分布式查询中使用非整数 `LIMIT/OFFSET` 时，在某些情况下出现的逻辑错误。[#96475](https://github.com/ClickHouse/ClickHouse/pull/96475) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 修复某些包含 lambda 函数的表达式中的空指针解引用问题。[#96479](https://github.com/ClickHouse/ClickHouse/pull/96479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复将 `LowCardinality` 列转换为 `Nullable` 时结果错误的问题。[#96483](https://github.com/ClickHouse/ClickHouse/pull/96483) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 修复了创建 Iceberg 表时，`ORDER BY` 子句引用不存在的列或使用位置参数而导致的崩溃。关闭 [#93280](https://github.com/ClickHouse/ClickHouse/issues/93280)。[#96484](https://github.com/ClickHouse/ClickHouse/pull/96484) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复了带有 Nullable 子字段的 Tuple 列上的运行时过滤器异常。[#96509](https://github.com/ClickHouse/ClickHouse/pull/96509) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 Parquet V3 原生读取器中的 `LOGICAL_ERROR` 异常：当 `PREWHERE` 过滤列包含非布尔型 UInt8 值时会触发该异常。[#96594](https://github.com/ClickHouse/ClickHouse/pull/96594) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复复制表在元数据变更期间隐式重新生成索引的问题。[#96600](https://github.com/ClickHouse/ClickHouse/pull/96600) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了执行 DROP WORKLOAD 时的数据竞争问题。[#96614](https://github.com/ClickHouse/ClickHouse/pull/96614) ([Sergei Trifonov](https://github.com/serxa)) 。
* 修复了 Iceberg 表写入中的一个缺陷：分区插入可能会导致数据在各分区 File 之间分布不正确。[#96620](https://github.com/ClickHouse/ClickHouse/pull/96620) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复了在包含约束的 `CREATE TABLE` 中出现的 `heap-use-after-free` 问题。[#96669](https://github.com/ClickHouse/ClickHouse/pull/96669) ([Nikita Taranov](https://github.com/nickitat)) 。
* 验证 bech32 中的 witness version，以避免缓冲区溢出。[#96671](https://github.com/ClickHouse/ClickHouse/pull/96671) ([Raúl Marín](https://github.com/Algunenano)) 。
* 修复了在使用无效的 `auth_header` 设置创建数据湖 REST 目录时，`system.tables` 报错的问题。[#96680](https://github.com/ClickHouse/ClickHouse/pull/96680) ([Han Fei](https://github.com/hanfei1991)).
* 修复了以下问题：在 TTL 合并后，如果一个数据块中的所有行都被过滤掉，`_minmax_count_projection` 会使 `min(timestamp)` 返回 epoch (`1970-01-01`) 。[#96703](https://github.com/ClickHouse/ClickHouse/pull/96703) ([Raquel Barbadillo](https://github.com/rbarbadillo)).
* 改进对 `iceberg_metadata_file_path` 设置项的校验，防止路径遍历，并确保指定的元数据文件位于表目录内。[#96754](https://github.com/ClickHouse/ClickHouse/pull/96754) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了在 `GROUP BY` 中使用 `Variant` 参数时 `ifNull` 发生崩溃的问题。[#96790](https://github.com/ClickHouse/ClickHouse/pull/96790) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了设置 `table_disk=1` 的表之间的 cache 键冲突问题。[#96818](https://github.com/ClickHouse/ClickHouse/pull/96818) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 修复因竞争条件导致 MemoryWorker 的清理线程卡死的问题。[#96819](https://github.com/ClickHouse/ClickHouse/pull/96819) ([Antonio Andelic](https://github.com/antonio2368)) 。
* 不要在 Iceberg 目录中记录包含凭证的数据。[#96831](https://github.com/ClickHouse/ClickHouse/pull/96831) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复服务器发生错误后 clickhouse-client 的退出状态。[#96841](https://github.com/ClickHouse/ClickHouse/pull/96841) ([Vitaly Baranov](https://github.com/vitlibar)) 。
* 使用 CROSS JOIN 且启用并行副本的查询可能会返回错误结果。修复了 [#74337](https://github.com/ClickHouse/ClickHouse/issues/74337)。[#96848](https://github.com/ClickHouse/ClickHouse/pull/96848) ([Igor Nikonov](https://github.com/devcrafter)) 。
* 修复了此前在同一列上执行轻量级更新后，`ALTER TABLE DROP COLUMN` 查询失败的问题。[#96861](https://github.com/ClickHouse/ClickHouse/pull/96861) ([Anton Popov](https://github.com/CurtizJ)) 。
* 修复了在 `plain_rewritable` 对象存储磁盘上创建基于归档文件的备份 (`.zip`、`.tzst`) 时发生堆栈溢出 (崩溃) 的问题。[#96872](https://github.com/ClickHouse/ClickHouse/pull/96872) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了以下问题：当备份因目标文件系统磁盘已满或其他 I/O 错误而失败时，服务器会发生崩溃。 [#96873](https://github.com/ClickHouse/ClickHouse/pull/96873) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 `EXCEPT ALL` 和 `INTERSECT ALL` 会忽略行的重复次数、表现得与其 `DISTINCT` 版本相同的问题。[#96876](https://github.com/ClickHouse/ClickHouse/pull/96876) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `indexOfAssumeSorted` 在使用不兼容类型调用时触发的 `std::terminate` 异常 (例如，`IPv4` 数组搭配整型搜索值) 。[#96877](https://github.com/ClickHouse/ClickHouse/pull/96877) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在使用窗口函数且 `group_by_use_nulls = 1` 并结合 CUBE/ROLLUP/GROUPING SETS 时出现的异常 `Bad cast from type DB::ColumnNullable to DB::ColumnString`。[#96878](https://github.com/ClickHouse/ClickHouse/pull/96878) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 JIT 已编译表达式将 `DateTime` 转换为 `DateTime64` 时产生的错误结果 (例如，在 `CASE`/`if`/`multiIf` 中混用 DateTime 类型时) 。此前，该值会被重新解释，而不是按正确比例缩放，导致表达式编译生效后生成错误的时间戳。[#96879](https://github.com/ClickHouse/ClickHouse/pull/96879) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 `CoalescingMergeTree` 中的逻辑错误异常：当数据跳过索引表达式生成常量列时 (例如，对整型列上的 `ifNotFinite(1, c0)` 使用 `bloom_filter`) 。[#96880](https://github.com/ClickHouse/ClickHouse/pull/96880) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在误用 HTTP 连接到已启用 TLS 的原生协议端口时，错误信息中端口号显示错误的问题。[#96881](https://github.com/ClickHouse/ClickHouse/pull/96881) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在 CTE 和子查询中，各子查询的 `SETTINGS` 未应用于 `file` 等表函数的问题。[#96882](https://github.com/ClickHouse/ClickHouse/pull/96882) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复读取 X509 证书时 BIO 对象的内存泄漏问题。[#96885](https://github.com/ClickHouse/ClickHouse/pull/96885) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了查询分析器中的 `LOGICAL_ERROR` 异常：当在应为具体值的位置传入 lambda 表达式时，会触发该异常 (例如，将其作为 `arrayFold` 的累加器参数时) 。[#96892](https://github.com/ClickHouse/ClickHouse/pull/96892) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复对复杂嵌套类型 (包含带有 Nullable Enum 值的 Map 的 Nullable Tuple 数组) 进行类型转换时出现的 `ColumnNullable is not compatible with original` 异常。[#96924](https://github.com/ClickHouse/ClickHouse/pull/96924) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了分片 `HASHED` 字典并行导入中的竞争条件，该问题偶尔会导致部分行未能导入。[#96953](https://github.com/ClickHouse/ClickHouse/pull/96953) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了 `REPLACE PARTITION` 与后台变更之间的竞争条件，该问题可能导致替换后旧数据和新数据同时可见。[#96955](https://github.com/ClickHouse/ClickHouse/pull/96955) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 `arrayJoin` 函数在与 INNER JOIN 和 WHERE 子句一同使用时产生重复行的问题。其原因是部分谓词下推优化错误地将包含 `arrayJoin` 的过滤条件下推到 JOIN 之下。[#96989](https://github.com/ClickHouse/ClickHouse/pull/96989) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `clearCaches` 中的崩溃 (SEGFAULT) ：`BlockIO::operator=` 未移动 `query_metadata_cache`，导致缓存的存储快照被提前销毁，并对 `MergeTreeData` 存储发生释放后使用。 [#96995](https://github.com/ClickHouse/ClickHouse/pull/96995) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `IfTransformStringsToEnumPass` 中的断言失败：当 `if` 或 `transform` 函数返回 `Nullable(String)` 时会触发该问题 (例如在使用 `GROUP BY ... WITH CUBE` 且 `group_by_use_nulls = true` 时) 。[#97002](https://github.com/ClickHouse/ClickHouse/pull/97002) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在使用带有 `UNION ALL` 和 `JOIN` 的 `INSERT ... SELECT` 时写入错误数据的问题：常量字符串列在数据块合并后可能会被赋予错误的值。[#97019](https://github.com/ClickHouse/ClickHouse/pull/97019) ([Hasyimi Bahrudin](https://github.com/hasyimibhar)).
* 修复在 `ALTER TABLE MODIFY COLUMN` 更改列类型后构建列统计信息时触发的 `assert_cast` 异常 (或在发布构建中发生静默数据损坏) 问题。[#97027](https://github.com/ClickHouse/ClickHouse/pull/97027) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 Azure Blob 存储、SSH 协议和 Arrow Flight 接口中读取未初始化内存的问题。[#97053](https://github.com/ClickHouse/ClickHouse/pull/97053) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在带有 row policy/PREWHERE 和 FINAL 的查询中，查询结果受索引影响的问题。 [#97076](https://github.com/ClickHouse/ClickHouse/pull/97076) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了 `MergeTree` 表中 `REPLACE PARTITION` 与后台变更之间仍存在的竞争条件，该问题可能导致旧数据重新出现。[#97105](https://github.com/ClickHouse/ClickHouse/pull/97105) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复带有别名列的隐式索引，并在创建前先进行全面验证。 [#97115](https://github.com/ClickHouse/ClickHouse/pull/97115) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `FunctionVariantAdaptor` 中的逻辑错误，该错误会影响需要常量参数的函数，例如 `arrayROCAUC`。[#97116](https://github.com/ClickHouse/ClickHouse/pull/97116) ([Bharat Nallan](https://github.com/bharatnc)) 。
* 修复了这样一个问题：当 `PartCheckThread` 为已变更的分区片段重新将 `GET_PART` 入队时，会导致变更卡住，并在 `parts_to_do` 中留下幽灵条目。[#97162](https://github.com/ClickHouse/ClickHouse/pull/97162) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了带有 `ORDER BY ... LIMIT` 的子查询在查询计划中的行数估算问题，否则可能导致优化器选择次优的 join 顺序。[#97193](https://github.com/ClickHouse/ClickHouse/pull/97193) ([Alexander Gololobov](https://github.com/davenger)).
* 修复了 `FunctionVariantAdaptor` 中的 `LOGICAL_ERROR` 异常：当作用于 Variant 列的函数返回 `Nothing` 类型时，会触发该异常；这种情况可能发生在 `UNION ALL` 查询中的空数组场景下。[#97213](https://github.com/ClickHouse/ClickHouse/pull/97213) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了 S3 多段复制操作期间的数据竞争问题 (例如向 S3 执行 `BACKUP`/`RESTORE` 时) ，该问题在并发访问下可能导致异常。[#97227](https://github.com/ClickHouse/ClickHouse/pull/97227) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复了当 `WHERE` 子句中的 `arrayJoin` 引用 `JOIN` 两侧的列时导致的 `LOGICAL_ERROR` 异常。[#97239](https://github.com/ClickHouse/ClickHouse/pull/97239) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在带 PREWHERE 的 Tuple 中读取稀疏 `Nullable(String)` 的 `.size` 子列时出现的 `LOGICAL_ERROR` 异常。[#97264](https://github.com/ClickHouse/ClickHouse/pull/97264) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在使用 `ORDER BY ... LIMIT` 从采用非自适应索引粒度 (`index_granularity_bytes = 0`) 的表读取时，`LazyMaterializingTransform` 中出现的异常：&quot;lazy chunk 中的行数与偏移量数目不一致&quot;。[#97270](https://github.com/ClickHouse/ClickHouse/pull/97270) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `SYSTEM RESTART REPLICA` 在因非 ZooKeeper 异常 (例如内存限制) 导致表重建失败时，会使数据库中的表丢失，并导致 `DatabaseReplicated` 中元数据摘要不匹配的问题。[#97276](https://github.com/ClickHouse/ClickHouse/pull/97276) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* `system.merge_tree_settings` 中的 `readonly` 字段现在能够正确反映某些 merge tree 设置 (例如 `index_granularity`) 是无条件只读的。[#97277](https://github.com/ClickHouse/ClickHouse/pull/97277) ([Robert Schulze](https://github.com/rschu1ze)) 。
* 修复了在 `MergeTree` 表上对 `count()` 进行优化时发生的崩溃问题：当 storage snapshot 在无数据的情况下创建时，会触发该问题。[#97281](https://github.com/ClickHouse/ClickHouse/pull/97281) ([Pablo Marcos](https://github.com/pamarcos)) 。
* 修复了从调试信息中解析堆栈跟踪的函数名称时可能发生的崩溃。[#97294](https://github.com/ClickHouse/ClickHouse/pull/97294) ([Azat Khuzhin](https://github.com/azat)) 。
* 修复 analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier 与 ALIAS 列相关的逻辑错误。关闭 [#96228](https://github.com/ClickHouse/ClickHouse/issues/96228)。[#97297](https://github.com/ClickHouse/ClickHouse/pull/97297) ([Vladimir Cherkasov](https://github.com/vdimir)) 。
* 修复了在配合 `QUALIFY` 子句使用带有文本索引的列时，`applyOrder` 中出现的 `LOGICAL_ERROR` 异常。[#97313](https://github.com/ClickHouse/ClickHouse/pull/97313) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 系统表 `system.functions` 现在会将内部函数的 `categories` 显示为 `Internal`，而不是空字符串 (`categories = ''`) 。[#97315](https://github.com/ClickHouse/ClickHouse/pull/97315) ([Robert Schulze](https://github.com/rschu1ze)) 。
* 使用 RIGHT JOIN 链且启用并行副本的查询可能会产生错误结果。修复了 [#74341](https://github.com/ClickHouse/ClickHouse/issues/74341)。[#97316](https://github.com/ClickHouse/ClickHouse/pull/97316) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在可刷新materialized view 及其他表被重命名的场景下可能出现的误报 `TABLE_UUID_MISMATCH` 错误。[#97323](https://github.com/ClickHouse/ClickHouse/pull/97323) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `StorageKeeperMap` 备份中的段错误：原因是在惰性备份批次中对悬空的 storage 指针发生了释放后继续使用。[#97336](https://github.com/ClickHouse/ClickHouse/pull/97336) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了在启用 `mutations_execute_subqueries_on_initiator` 时，`ALTER UPDATE/DELETE` 中包含标量子查询的 `exists` 函数的问题。此前，该标量子查询会被错误地求值，可能导致报错，或生成损坏的变更命令，使表在下次服务器重启后无法加载。[#97347](https://github.com/ClickHouse/ClickHouse/pull/97347) ([Kirill Kopnev](https://github.com/Fgrtue)).
* 修复了在将 NULL 与包含 LowCardinality 类型的 Variant 列进行比较时出现的逻辑异常 `Unexpected return type from equals. Expected Nullable(UInt8). Got Const(LowCardinality(Nullable(UInt8)))`。[#97379](https://github.com/ClickHouse/ClickHouse/pull/97379) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复了在启用分片查询缓存时并行执行 `EXCHANGE TABLES` 可能导致的竞态条件问题。 [#97411](https://github.com/ClickHouse/ClickHouse/pull/97411) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复了将 Array 转换为 `QBit` 时的 `LOGICAL_ERROR` 异常：当外层 `Tuple` 包装器中的 `nullable_source` 以不匹配的列 type 替换已转换的数组列时，会触发该问题。关闭 [#97389](https://github.com/ClickHouse/ClickHouse/issues/97389)。[#97413](https://github.com/ClickHouse/ClickHouse/pull/97413) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复括号内带别名的元组字面量在 AST 格式化往返时不一致的问题，例如，`(('a', 'b') AS x)` 之前会被错误地重新格式化为 `tuple(('a', 'b') AS x)`。[#97418](https://github.com/ClickHouse/ClickHouse/pull/97418) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了启用去重的异步插入过程中出现的异常：当解析失败生成零行的空数据块时，会触发该异常。[#97460](https://github.com/ClickHouse/ClickHouse/pull/97460) ([Sema Checherinda](https://github.com/CheSema)).
* 修复了在使用 `ORDER BY ... LIMIT` 从采用非自适应索引粒度 (`index_granularity_bytes = 0`) 的表中读取时，`LazyMaterializingTransform` 中出现的异常 &quot;Number of rows in lazy chunk does not match number of offsets&quot;。[#97482](https://github.com/ClickHouse/ClickHouse/pull/97482) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 insert Iceberg 相关设置。为 `allow_experimental_insert_into_iceberg` 设置添加别名。[#97483](https://github.com/ClickHouse/ClickHouse/pull/97483) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 修复了这样一个 `ACCESS_DENIED` 问题：当 `optimize_inverse_dictionary_lookup` 优化重写 `dictGet(...)` 谓词时，没有 `CREATE TEMPORARY TABLE` 权限的用户会遇到该问题。ClickHouse 现在会跳过该重写并执行原始表达式。关闭 [#97269](https://github.com/ClickHouse/ClickHouse/issues/97269)。[#97484](https://github.com/ClickHouse/ClickHouse/pull/97484) ([Nihal Z. Miaji](https://github.com/nihalzp)) 。
* 修复 `Set` 和 `MergeTreeIndexSet` 在处理带有内部稀疏子列的列时出现的断言失败问题 (在 debug/sanitizer 构建中会以异常形式表现出来) ，例如来自具有不同稀疏序列化 profile 的 MergeTree parts 的 `Tuple` 列。[#97493](https://github.com/ClickHouse/ClickHouse/pull/97493) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 StorageKafka2 中可能出现的释放后使用问题。[#97520](https://github.com/ClickHouse/ClickHouse/pull/97520) ([Bharat Nallan](https://github.com/bharatnc)) 。
* 修复当输出路径包含目录时，`INTO OUTFILE` 配合 `TRUNCATE` 和 `into_outfile_create_parent_directories` 设置使用时出现的问题。[#97549](https://github.com/ClickHouse/ClickHouse/pull/97549) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在启用分析器时，通过 `merge()` 表函数查询 ALIAS 列中包含 lambda 表达式的表时出现的 `BAD_ARGUMENTS` 错误。[#97551](https://github.com/ClickHouse/ClickHouse/pull/97551) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 Keeper 的 zxid 为 0 时 `system.zookeeper_info` 抛出异常的问题。[#97553](https://github.com/ClickHouse/ClickHouse/pull/97553) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复了当键类型不是 String 时，`ip_trie` 字典中可能存在的逻辑错误。[#97555](https://github.com/ClickHouse/ClickHouse/pull/97555) ([Bharat Nallan](https://github.com/bharatnc)) 。
* 修复基础 `RestCatalog` 的 REST 目录 OAuth 身份验证失效问题 (此前仅对派生目录 (如 `OneLakeCatalog`) 生效) 。BigLake 目录引入后，默认 REST 目录因此损坏。[#97561](https://github.com/ClickHouse/ClickHouse/pull/97561) ([Konstantin Vedernikov](https://github.com/scanhex12)) 。
* 几何函数 (`perimeterSpherical`、`areaSpherical` 等) 现在除 `Geometry` 变体类型外，还接受单独的几何子类型 (`Polygon`、`Ring`、`Point` 等) 。[#97571](https://github.com/ClickHouse/ClickHouse/pull/97571) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复对 `Nullable(Tuple(... Nullable(T) ...))` 类型的子列使用 `isNull`/`isNotNull` 时触发的 `LOGICAL_ERROR` 异常。关闭 [#97224](https://github.com/ClickHouse/ClickHouse/issues/97224)。[#97582](https://github.com/ClickHouse/ClickHouse/pull/97582) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在轻量级更新期间应用补丁分区片段时发生的空指针解引用问题。[#97583](https://github.com/ClickHouse/ClickHouse/pull/97583) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* `BaseSettings::readBinary` 将 `accessor.find` 返回的索引直接传给 `field_infos[]`，但未检查“未找到”的哨兵值 (即 `-1`) ，这可能导致 `std::vector` 越界访问。该问题因 libcxx 的加固机制而被发现。这很可能发生在查询计划反序列化期间：较新的服务器向较旧的服务器发送其无法识别的设置时，就会触发该问题。基于字符串的读取方法已正确处理这种情况；`readBinary` 只是缺少相同的检查。 [#97585](https://github.com/ClickHouse/ClickHouse/pull/97585) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 修复 `UNION ALL` 查询在某个分支包含恒为 false 的谓词时返回错误结果的问题——该分支本应不返回任何结果，却会错误地读取数据。[#97620](https://github.com/ClickHouse/ClickHouse/pull/97620) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了 `IN (col)` 在仅包含单个列引用时会失败并报 `UNSUPPORTED_METHOD` 错误的问题。[#97646](https://github.com/ClickHouse/ClickHouse/pull/97646) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复在 `GROUP BY ... WITH ROLLUP/CUBE` 中，当键在 `Nullable(Tuple(...))` 内包含 `LowCardinality(Nullable(...))` 时引发的逻辑错误异常。[#97647](https://github.com/ClickHouse/ClickHouse/pull/97647) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `NOT (1, 1, 1)` 的 AST 格式不一致问题，该问题可能会在调试构建中导致 `LOGICAL_ERROR`。[#97653](https://github.com/ClickHouse/ClickHouse/pull/97653) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复 `keeper-converter` 在遇到空的 ZooKeeper transaction log File 时抛出异常的问题。[#97673](https://github.com/ClickHouse/ClickHouse/pull/97673) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### 构建/测试/打包方面的改进 \{#buildtestingpackaging-improvement\}

* ClickHouse 现已可使用 clang-23 (master) 进行构建。[#95578](https://github.com/ClickHouse/ClickHouse/pull/95578) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 修复：当配置了 `bind_host` 时，强制将 `is_local` 设为 false，并改用集成测试。对 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) 的后续跟进。[#93109](https://github.com/ClickHouse/ClickHouse/pull/93109) [#96018](https://github.com/ClickHouse/ClickHouse/pull/96018) ([Zhigao Hong](https://github.com/zghong)).
* 压力测试：修复 CI 中的压力测试和升级测试；忽略 `no-{build}` 标签；增加兼容性随机化。[#94693](https://github.com/ClickHouse/ClickHouse/pull/94693) ([Nikita Fomichev](https://github.com/fm4v)) 。
* 在构建产物中发布 parser&#95;memory&#95;profiler 二进制文件。该工具可用于分析 AST 的内存占用。[#95826](https://github.com/ClickHouse/ClickHouse/pull/95826) ([Ilya Yatsishin](https://github.com/qoega)) 。
* 为 `parser_memory_profiler` 工具添加 `--symbolize` 标志，用于生成在结果中包含已解析符号的 `.heap.sym` File。[#96477](https://github.com/ClickHouse/ClickHouse/pull/96477) ([Ilya Yatsishin](https://github.com/qoega)) 。
* 将 integration tests 中使用的第三方 Docker images 固定为特定版本。[#96500](https://github.com/ClickHouse/ClickHouse/pull/96500) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 重新支持动态链接 `OpenSSL`。虽然不推荐这样做，而且任何生产构建都不会采用，但这个选项仍然保留，供互联网上的爱好者使用。[#96506](https://github.com/ClickHouse/ClickHouse/pull/96506) ([Govind R Nair](https://github.com/Revertionist)) 。
* 通过为 `Coordination::OpNum` 使用按类型特化，将 `magic_enum` 的范围从 [-100, 1000] 缩减为默认值 [-128, 127]，从而缩短构建时间。[#96632](https://github.com/ClickHouse/ClickHouse/pull/96632) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 从 Function 类中移除不必要的 C++ 模板，以缩短构建时间。[#96646](https://github.com/ClickHouse/ClickHouse/pull/96646) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 将 `StorageSystemLicenses` 的生成移至 configure 阶段，以提升构建并行性。[#96697](https://github.com/ClickHouse/ClickHouse/pull/96697) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 将许可证扫描并行化。[#96727](https://github.com/ClickHouse/ClickHouse/pull/96727) ([Raúl Marín](https://github.com/Algunenano)).
* 新增对 SSH 协议支持的无状态功能测试。[#96996](https://github.com/ClickHouse/ClickHouse/pull/96996) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 将 Kafka 3.9.0 添加到无状态功能测试基础设施中，使其能够使用 ClickHouse Keeper 充当 ZooKeeper，直接测试 Kafka 和 Kafka2 表引擎。六个新的无状态测试涵盖基本的生产/消费、虚拟列、INSERT、多种格式、损坏消息处理以及基于 Keeper 的偏移量存储。[#96997](https://github.com/ClickHouse/ClickHouse/pull/96997) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 新增一个 CI 工作流，用于构建经 PGO+BOLT 优化的 clang 工具链。[#96991](https://github.com/ClickHouse/ClickHouse/pull/96991) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 CI 中使用 PGO 优化的 LLVM/Clang 构建，可将构建速度提升 20..30%。[#97031](https://github.com/ClickHouse/ClickHouse/pull/97031) ([Alexey Milovidov](https://github.com/alexey-milovidov)) 。
* 将 glibc 中的数学函数替换为 llvm-libc 的实现。[#90151](https://github.com/ClickHouse/ClickHouse/pull/90151) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 将 Boost 从 1.83 升级到 1.90，修复了调试构建中 `devector` 的断言失败问题。[#97037](https://github.com/ClickHouse/ClickHouse/pull/97037) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 `postgres` 更新至 REL&#95;18&#95;1。 [#95189](https://github.com/ClickHouse/ClickHouse/pull/95189) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 `libexpat` 2.7.3。[#95218](https://github.com/ClickHouse/ClickHouse/pull/95218) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 使用 `OpenSSL` 3.5.5。[#95345](https://github.com/ClickHouse/ClickHouse/pull/95345) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 使用 `simdjson` v4.2.4。[#97129](https://github.com/ClickHouse/ClickHouse/pull/97129) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 升级至 `libarchive` 3.8.5。[#97131](https://github.com/ClickHouse/ClickHouse/pull/97131) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 升级到 `fast_float` v8.2.3。[#97133](https://github.com/ClickHouse/ClickHouse/pull/97133) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 使用 `abseil-cpp` 20260107.1，并将 `s2geometry` 升级至 v0.13.1。[#97134](https://github.com/ClickHouse/ClickHouse/pull/97134) ([Konstantin Bogdanov](https://github.com/thevar1able)) 。
* 将 `libxml2` 升级至 2.15.1。[#95574](https://github.com/ClickHouse/ClickHouse/pull/95574) ([Robert Schulze](https://github.com/rschu1ze)) 。
* 将 7 个等级 3 集成测试 Docker 镜像从已终止生命周期或已删除的基础镜像升级到当前支持的版本。[#97314](https://github.com/ClickHouse/ClickHouse/pull/97314) ([Rahul](https://github.com/motsc)).
* 新增 TPC-DS 基准测试查询。[#97349](https://github.com/ClickHouse/ClickHouse/pull/97349) ([Raufs Dunamalijevs](https://github.com/rienath)) 。
* 将各个 x86 指令集 cmake 选项 (`ENABLE_SSSE3`、`ENABLE_AVX2`、`NO_SSE3_OR_HIGHER`、`ARCH_NATIVE` 等) 统一替换为单个数字型 `X86_ARCH_LEVEL` 选项 (`1`/`2`/`3`/`4`) ，以匹配运行时分发系统已采用的标准 x86-64 微架构级别。[#97354](https://github.com/ClickHouse/ClickHouse/pull/97354) ([Raúl Marín](https://github.com/Algunenano)) 。
* 避免在 `FunctionBinaryArithmetic` 中为非除法运算实例化 `division_by_nullable=true` 模板变体，以减少编译时间和二进制体积。[#97496](https://github.com/ClickHouse/ClickHouse/pull/97496) ([Raúl Marín](https://github.com/Algunenano)).
* 通过将 `Exception.h` 从 `typeid_cast.h`、`assert_cast.h`、`Context_fwd.h`、`IDataType.h` 等被广泛包含的头文件以及各种 Column 头文件中移除，缩小其包含依赖范围。 [#97497](https://github.com/ClickHouse/ClickHouse/pull/97497) ([Raúl Marín](https://github.com/Algunenano)).
* 始终使用随附的 `compiler-rt` 头文件 (sanitizer 和 XRay 接口) ，而不是主机编译器的头文件，并且默认情况下从源码构建 `compiler-rt` 库。[#97499](https://github.com/ClickHouse/ClickHouse/pull/97499) ([Raúl Marín](https://github.com/Algunenano)) 。
* 在具备足够 `long double` 支持的平台上，避免在 `wide_integer_impl.h` 中包含 boost/multiprecision 头文件，以缩短构建时间。[#96633](https://github.com/ClickHouse/ClickHouse/pull/96633) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 实现 LLVM 代码覆盖率作业，并首先为 master 分支启用该作业。[#90952](https://github.com/ClickHouse/ClickHouse/pull/90952) ([Alexey Bakharew](https://github.com/alexbakharew)) 。
* 为发布构建启用快速 libcxx 加固。这主要用于越界检查。根据性能测试结果，预计不会带来明显的性能影响。 [#94757](https://github.com/ClickHouse/ClickHouse/pull/94757) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).

### ClickHouse 26.1 版本，2026-01-29。[演示](https://presentations.clickhouse.com/2026-release-26.1/)，[视频](https://www.youtube.com/watch?v=fWuYt4M0xE4) \{#261\}

#### 不兼容变更 \{#backward-incompatible-change\}

* 修复由于在 formatter 中错误替换别名而导致的格式不一致问题。修复了 [#82833](https://github.com/ClickHouse/ClickHouse/issues/82833) 中的问题。修复了 [#82832](https://github.com/ClickHouse/ClickHouse/issues/82832) 中的问题。修复了 [#68296](https://github.com/ClickHouse/ClickHouse/issues/68296) 中的问题。此更改可能存在向后不兼容性：当 analyzer 被禁用时，某些在 IN 中引用别名的 CREATE VIEW 查询将无法被处理。为避免不兼容，请启用 analyzer（自 24.3 起默认启用）。[#82838](https://github.com/ClickHouse/ClickHouse/pull/82838)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 编解码器 `DEFLATE_QPL` 和 `ZSTD_QAT` 已被移除。建议用户在升级前，将使用 `DEFLATE_QPL` 或 `ZSTD_QAT` 压缩的现有数据转换为其他编解码器。请注意，若要使用这些编解码器，必须先启用设置项 `enable_deflate_qpl_codec` 和 `enable_zstd_qat_codec`。[#92150](https://github.com/ClickHouse/ClickHouse/pull/92150)（[Robert Schulze](https://github.com/rschu1ze)）。
* 通过在 `system.query_log.exception` 中启用对 stderr 的捕获，改进 UDF 调试体验。之前，UDF 的 stderr 只会被写入文件，而不会出现在查询日志中，导致难以调试。现在，stderr 默认会触发异常，并在抛出前被完整累积（最多 1MB），因此完整的 Python 回溯和错误信息会出现在 `system.query_log.exception` 中，从而便于高效故障排查。[#92209](https://github.com/ClickHouse/ClickHouse/pull/92209)（[Xu Jia](https://github.com/XuJia0210)）。
* `JOIN USING ()` 子句中的空列列表现在被视为语法错误。此前预期的行为是在查询执行期间抛出 `INVALID_JOIN_ON_EXPRESSION`。在某些情况下（例如与 `Join` 引擎进行连接）这会导致 `LOGICAL_ERROR`，从而修复了 [#82502](https://github.com/ClickHouse/ClickHouse/issues/82502)。 [#92371](https://github.com/ClickHouse/ClickHouse/pull/92371)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 默认在 JSON 类型中对 SKIP REGEXP 使用部分匹配。已关闭 [#79250](https://github.com/ClickHouse/ClickHouse/issues/79250)。[#92847](https://github.com/ClickHouse/ClickHouse/pull/92847)（[Pavel Kruglov](https://github.com/Avogar)）。
* 回滚「Allow INSERT into simple ALIAS columns」（回滚 ClickHouse/ClickHouse[#84154](https://github.com/ClickHouse/ClickHouse/issues/84154)）。该功能无法与自定义格式配合使用，并且没有受任何设置保护。[#92849](https://github.com/ClickHouse/ClickHouse/pull/92849)（[Azat Khuzhin](https://github.com/azat)）。
* 新增一个设置项，当数据湖目录无法访问对象存储时抛出错误。[#93606](https://github.com/ClickHouse/ClickHouse/pull/93606) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `Lazy` 数据库引擎已被移除且不再可用。已关闭 [#91231](https://github.com/ClickHouse/ClickHouse/issues/91231)。[#93627](https://github.com/ClickHouse/ClickHouse/pull/93627)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 移除 `metric_log` 的 `transposed_with_wide_view` 模式——由于一个缺陷，该模式无法使用。现在不再允许以该模式定义 `system.metric_log`。这在一定程度上回滚了 [#78412](https://github.com/ClickHouse/ClickHouse/issues/78412)。[#93867](https://github.com/ClickHouse/ClickHouse/pull/93867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 工作负载的 CPU 调度现在默认为抢占式。参见 `cpu_slot_preemption` 服务器设置项。[#94060](https://github.com/ClickHouse/ClickHouse/pull/94060)（[Sergei Trifonov](https://github.com/serxa)）。
* 对索引文件名进行转义以防止分区片段损坏。应用此更改后，ClickHouse 将无法加载由先前版本创建且名称中包含非 ASCII 字符的索引。要处理这种情况，可以使用 MergeTree SETTING `escape_index_filenames`。[#94079](https://github.com/ClickHouse/ClickHouse/pull/94079) ([Raúl Marín](https://github.com/Algunenano))。
* 格式设置 `exact_rows_before_limit`、`rows_before_aggregation`、`cross_to_inner_join_rewrite`、`regexp_dict_allow_hyperscan`、`regexp_dict_flag_case_insensitive`、`regexp_dict_flag_dotall` 和 `dictionary_use_async_executor` 现已更改为常规（非格式）设置。这是一次纯粹的内部更改，对用户没有可见的副作用，除非在（不太可能的）情况下，你在 Iceberg、DeltaLake、Kafka、S3、S3Queue、Azure、Hive、RabbitMQ、Set、FileLog 或 NATS 的表引擎定义中指定了上述任一设置。在这些情况下，此前这些设置会被忽略，而现在此类定义会报错。[#94106](https://github.com/ClickHouse/ClickHouse/pull/94106)（[Robert Schulze](https://github.com/rschu1ze)）。
* `joinGet/joinGetOrNull` 函数现在会对底层 Join 表强制要求具备 `SELECT` 权限。此更改之后，执行 `joinGet('db.table', 'column', key)` 要求用户同时对 Join 表中定义的键列以及要获取的属性列拥有 `SELECT` 权限。缺少这些权限的查询将失败，并返回 `ACCESS_DENIED`。迁移时，可通过 `GRANT SELECT ON db.join_table TO user` 授予整张表的访问权限，或通过 `GRANT SELECT(key_col, attr_col) ON db.join_table TO user` 授予列级访问权限。此更改会影响所有依赖 `joinGet`/`joinGetOrNull` 且之前未显式配置 `SELECT` 授权的用户和应用程序。[#94307](https://github.com/ClickHouse/ClickHouse/pull/94307)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 针对 `CREATE TABLE ... AS ...` 查询改为检查 `SHOW COLUMNS`。之前检查的是 `SHOW TABLES`，这对于此类权限检查来说是不正确的权限授予。[#94556](https://github.com/ClickHouse/ClickHouse/pull/94556)（[pufit](https://github.com/pufit)）。
* 使 `Hash` 输出格式不再依赖于数据块大小。[#94503](https://github.com/ClickHouse/ClickHouse/pull/94503)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。请注意，与之前版本相比，此更改会导致输出的哈希值发生变化。

#### 新特性 \{#new-feature\}

* ClickHouse Keeper 的 HTTP API 和嵌入式 Web UI。 [#78181](https://github.com/ClickHouse/ClickHouse/pull/78181) ([pufit](https://github.com/pufit) 和 [speeedmaster](https://github.com/speeedmaster))。
* 异步插入去重现在可以与依赖它的 materialized view 协同工作。当按 block&#95;id 发生冲突时，会先过滤原始数据块以移除与该 block&#95;id 关联的行，对剩余的行应用所有相关 materialized view 的 SELECT 查询进行转换，从而重建不包含冲突行的原始数据块。[#89140](https://github.com/ClickHouse/ClickHouse/pull/89140) ([Sema Checherinda](https://github.com/CheSema))。当涉及 materialized view 时，现在允许在异步插入中使用去重。[#93957](https://github.com/ClickHouse/ClickHouse/pull/93957) ([Sema Checherinda](https://github.com/CheSema))。
* 引入了一种新的语法和框架，用于简化并扩展 PROJECTION 索引功能。该变更是对 https://github.com/ClickHouse/ClickHouse/pull/81021 的后续改进。[#91844](https://github.com/ClickHouse/ClickHouse/pull/91844) ([Amos Bird](https://github.com/amosbird))。
* 为 `Array` 列添加文本索引功能支持。 [#89895](https://github.com/ClickHouse/ClickHouse/pull/89895) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 默认启用 `use_variant_as_common_type`，从而可以在 `Array` 中、`UNION` 查询中以及 `if`/`multiIf`/`case` 分支中使用彼此不兼容的类型。[#90677](https://github.com/ClickHouse/ClickHouse/pull/90677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增系统表 `zookeeper_info`。实现了 [#88014](https://github.com/ClickHouse/ClickHouse/issues/88014)。[#90809](https://github.com/ClickHouse/ClickHouse/pull/90809)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在所有函数中支持 `Variant` 类型。[#90900](https://github.com/ClickHouse/ClickHouse/pull/90900)（[Bharat Nallan](https://github.com/bharatnc)）。
* 在 Prometheus 的 `/metrics` 端点中新增一个 `ClickHouse_Info` 指标，主要包含版本信息，从而可以构建随时间跟踪详细版本信息的图表。[#91125](https://github.com/ClickHouse/ClickHouse/pull/91125)（[Christoph Wurm](https://github.com/cwurm)）。
* 为 keeper 引入了一个新的四字母命令 `rcfg`，用于修改集群配置。与标准的 `reconfigure` 请求相比，此命令在配置变更方面提供了更大的灵活性。命令以 `json` 字符串作为参数。发送到 TCP 接口的完整字节序列应如下所示：`rcfg{json_string_length_big_endian}{json_string}`。命令的一些示例如下：`{"preconditions": {"leaders": [1, 2], "members": [1, 2, 3, 4, 5]}, "actions": [{"transfer_leadership": [3]}, {"remove_members": [1, 2]}, {"set_priority": [{"id": 4, "priority": 100}, {"id": 5, "priority": 100}]}, {"transfer_leadership": [4, 5]}, {"set_priority": [{"id": 3, "priority": 0}]}]}`。[#91354](https://github.com/ClickHouse/ClickHouse/pull/91354) ([alesapin](https://github.com/alesapin))。
* 添加函数 `reverseBySeparator`，用于将由指定分隔符分隔的字符串中的子串的顺序反转。关闭 [#91463](https://github.com/ClickHouse/ClickHouse/issues/91463)。[#91780](https://github.com/ClickHouse/ClickHouse/pull/91780)（[Xuewei Wang](https://github.com/Sallery-X)）。
* 新增了 `max_insert_block_size_bytes` 设置，用于更精细地控制插入数据块的形成。[#92833](https://github.com/ClickHouse/ClickHouse/pull/92833)（[Kirill Kopnev](https://github.com/Fgrtue)）。
* 如果启用了 `ignore_on_cluster_for_replicated_database` 配置项，则可以在 Replicated 数据库中执行带有 `ON CLUSTER` 子句的 DDL 查询。在这种情况下，将忽略集群名称。 [#92872](https://github.com/ClickHouse/ClickHouse/pull/92872) ([Kirill](https://github.com/kirillgarbar)).
* 实现了 `mergeTreeAnalyzeIndexes` 函数。[#92954](https://github.com/ClickHouse/ClickHouse/pull/92954) ([Azat Khuzhin](https://github.com/azat)).
* 新增配置项 `use_primary_key`。将其设置为 `false` 以禁用基于主键的 granule 剪枝。[#93319](https://github.com/ClickHouse/ClickHouse/pull/93319)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 添加 `icebergLocalCluster` 表函数。[#93323](https://github.com/ClickHouse/ClickHouse/pull/93323) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 新增了 `cosineDistanceTransposed` 函数，用于近似计算两点之间的[余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)。[#93621](https://github.com/ClickHouse/ClickHouse/pull/93621)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 system.parts 表中新增 `files` 列，用于显示每个数据分区片段包含的文件数量。 [#94337](https://github.com/ClickHouse/ClickHouse/pull/94337) ([Match](https://github.com/gayanMatch)).
* 为并发控制添加了一个 max-min 公平调度器。在严重 oversubscription 场景下（即大量查询争夺有限的 CPU 槽位时），可以提供更好的公平性。短时运行的查询不会因为那些长时间运行并随时间占用更多槽位的查询而受到惩罚。通过将 `concurrent_threads_scheduler` 服务器 SETTING 的值设置为 `max_min_fair` 来启用。[#94732](https://github.com/ClickHouse/ClickHouse/pull/94732)（[Sergei Trifonov](https://github.com/serxa)）。
* 新增了允许 ClickHouse 客户端在连接服务器时覆盖 TLS SNI 的功能。 [#89761](https://github.com/ClickHouse/ClickHouse/pull/89761) ([Matt Klein](https://github.com/mattklein123)).
* 在 `joinGet` 函数调用中支持使用临时表。[#92973](https://github.com/ClickHouse/ClickHouse/pull/92973)（[Eduard Karacharov](https://github.com/korowa)）。
* 支持 `DeltaLake` 表引擎中的删除向量。 [#93852](https://github.com/ClickHouse/ClickHouse/pull/93852) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为 `deltaLakeCluster` 添加对删除向量的支持。 [#94365](https://github.com/ClickHouse/ClickHouse/pull/94365) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为数据湖增加对 Google Cloud Storage 的支持。 [#93866](https://github.com/ClickHouse/ClickHouse/pull/93866) ([Konstantin Vedernikov](https://github.com/scanhex12)).

#### 实验特性 \{#experimental-feature\}
* 将 `QBit` 从 Experimental 提升至 Beta。 [#93816](https://github.com/ClickHouse/ClickHouse/pull/93816) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 新增对 `Nullable(Tuple)` 的支持。将 `allow_experimental_nullable_tuple_type` 设置为 1 以启用该功能。 [#89643](https://github.com/ClickHouse/ClickHouse/pull/89643) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 支持 Paimon REST catalog，延续自 https://github.com/ClickHouse/ClickHouse/pull/84423。 [#92011](https://github.com/ClickHouse/ClickHouse/pull/92011) ([JIaQi Tang](https://github.com/JiaQiTang98)).

#### 性能优化 \{#performance-improvement\}

* Setting `use_skip_indexes_on_data_read` is now enabled by default. This setting allows filtering in a streaming fashion, at the same time as reading, improving query performance and startup time. [#93407](https://github.com/ClickHouse/ClickHouse/pull/93407) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 提升在 `LowCardinality` 列上执行 `DISTINCT` 时的性能。关闭 [#5917](https://github.com/ClickHouse/ClickHouse/issues/5917)。[#91639](https://github.com/ClickHouse/ClickHouse/pull/91639) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 优化 `distinctJSONPaths` 聚合函数，使其仅从分区片段中读取 JSON 路径，而无需扫描整个 JSON 列。[#92196](https://github.com/ClickHouse/ClickHouse/pull/92196) ([Pavel Kruglov](https://github.com/Avogar))。
* 将更多过滤条件下推到 JOIN 操作中。[#85556](https://github.com/ClickHouse/ClickHouse/pull/85556) ([Nikita Taranov](https://github.com/nickitat)).
* 在过滤条件仅使用一侧输入时，支持更多从 JOIN 的 ON 条件下推过滤的场景。支持 `ANY`、`SEMI`、`ANTI` JOIN。[#92584](https://github.com/ClickHouse/ClickHouse/pull/92584) ([Dmitry Novik](https://github.com/novikd))。
* 允许使用等价 Set 将过滤条件下推到 `SEMI JOIN`。Closes [#85239](https://github.com/ClickHouse/ClickHouse/issues/85239)。[#92837](https://github.com/ClickHouse/ClickHouse/pull/92837) ([Dmitry Novik](https://github.com/novikd))。
* 当哈希 JOIN 的右侧为空时,跳过读取左侧。此前会一直读取左侧直到遇到第一个非空数据块,在存在大量过滤或聚合时可能会做大量无用工作。[#94062](https://github.com/ClickHouse/ClickHouse/pull/94062) ([Alexander Gololobov](https://github.com/davenger)).
* 在查询管线内部使用 &quot;fastrange&quot;（Daniel Lemire）方法对数据进行分区。这可以提升并行排序和 JOIN 的性能。[#93080](https://github.com/ClickHouse/ClickHouse/pull/93080) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 PARTITION BY 子句与排序键完全匹配或为其前缀时，提高窗口函数的性能。[#87299](https://github.com/ClickHouse/ClickHouse/pull/87299) ([Nikita Taranov](https://github.com/nickitat))。
* 将外层过滤条件下推到视图中，从而可以在本地和远程节点上应用 PREWHERE。解决了 [#88189](https://github.com/ClickHouse/ClickHouse/issues/88189) 问题。[#88316](https://github.com/ClickHouse/ClickHouse/pull/88316) ([Igor Nikonov](https://github.com/devcrafter))。
* Implement JIT compilations for more functions. Closes [#73509](https://github.com/ClickHouse/ClickHouse/issues/73509). [#88770](https://github.com/ClickHouse/ClickHouse/pull/88770) ([Alexey Milovidov](https://github.com/alexey-milovidov) with [Taiyang Li](https://github.com/taiyang-li)).
* 如果在 `FINAL` 查询中使用的跳过索引位于主键中的某个列上，那么在其他分区片段中检查主键交集的额外步骤就是多余的，因此现在不会再执行。Resolves [#85897](https://github.com/ClickHouse/ClickHouse/issues/85897)。[#93899](https://github.com/ClickHouse/ClickHouse/pull/93899) ([Shankar Iyer](https://github.com/shankar-iyer))。
* Optimize performance and memory usage for fractional `LIMIT` and `OFFSET`. [#91167](https://github.com/ClickHouse/ClickHouse/pull/91167) ([Ahmed Gouda](https://github.com/0xgouda)).
* 修复在 Parquet Reader V3 预取器中使用更快随机读取逻辑的问题。Closes [#90890](https://github.com/ClickHouse/ClickHouse/issues/90890)。[#91435](https://github.com/ClickHouse/ClickHouse/pull/91435) ([Arsen Muk](https://github.com/arsenmuk))。
* 提升 `icebergCluster` 的性能。关闭 [#91462](https://github.com/ClickHouse/ClickHouse/issues/91462)。[#91537](https://github.com/ClickHouse/ClickHouse/pull/91537)（[Yang Jiang](https://github.com/Ted-Jiang)）。
* 不要在常量过滤条件上使用虚拟列进行过滤。 [#91588](https://github.com/ClickHouse/ClickHouse/pull/91588) ([c-end](https://github.com/c-end)).
* 通过启用自适应写缓冲区 (adaptive write buffers)，在针对超宽表使用宽分区片段时降低 INSERT/合并操作的内存占用。为加密磁盘新增对自适应写缓冲区的支持。[#92250](https://github.com/ClickHouse/ClickHouse/pull/92250) ([Azat Khuzhin](https://github.com/azat)).
* Improved performance of full text search with text index and `sparseGrams` tokenizer by reducing the number of searched tokens in the index. [#93078](https://github.com/ClickHouse/ClickHouse/pull/93078) ([Anton Popov](https://github.com/CurtizJ)).
* Function `isValidASCII` 已针对正向结果（即输入完全为 ASCII 的情况）进行了优化。[#93347](https://github.com/ClickHouse/ClickHouse/pull/93347)（[Robert Schulze](https://github.com/rschu1ze)）。
* 顺序读取优化现在能够识别由于 WHERE 条件导致 ORDER BY 列为常量的情况，从而实现高效的反向顺序读取。这对于类似 `WHERE tenant='42' ORDER BY tenant, event_time DESC` 的多租户查询非常有益，此类查询现在可以使用 InReverseOrder，而不再需要执行完整排序。[#94103](https://github.com/ClickHouse/ClickHouse/pull/94103) ([matanper](https://github.com/matanper))。
* 引入专门的 Enum AST 类，用 (string, integer) 对而非 ASTLiteral 子节点来存储值参数，从而优化内存占用。[#94178](https://github.com/ClickHouse/ClickHouse/pull/94178) ([Ilya Yatsishin](https://github.com/qoega))。
* 在多个副本上执行分布式索引分析。对于共享存储以及集群中海量数据场景具有优势。适用于 SharedMergeTree（ClickHouse Cloud），也可能适用于使用共享存储的其他类型 MergeTree 表。[#86786](https://github.com/ClickHouse/ClickHouse/pull/86786) ([Azat Khuzhin](https://github.com/azat))。
* Reduce overhead of join runtime filters by disabling them in the following cases: - too many bits are set in the bloom filter - too few rows are filtered out at runtime. [#91578](https://github.com/ClickHouse/ClickHouse/pull/91578) ([Alexander Gololobov](https://github.com/davenger)).
* Use an in-memory buffer for correlated subqueries input to avoid evaluating it multiple times. Part of [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890). [#91205](https://github.com/ClickHouse/ClickHouse/pull/91205) ([Dmitry Novik](https://github.com/novikd)).
* 允许所有副本在并行副本读取时抢占孤立区间。这可以改善负载均衡并减少长尾延迟。[#91374](https://github.com/ClickHouse/ClickHouse/pull/91374) ([zoomxi](https://github.com/zoomxi))。
* 外部聚合/排序/JOIN 现在在所有场景下都会遵循查询设置 `temporary_files_codec`。修复了 Grace 哈希 JOIN 中缺失 profile 事件的问题。[#92388](https://github.com/ClickHouse/ClickHouse/pull/92388) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 改进在聚合/排序过程中将数据溢写到磁盘时对查询内存使用情况的检测,使其更加健壮。[#92500](https://github.com/ClickHouse/ClickHouse/pull/92500) ([Azat Khuzhin](https://github.com/azat))。
* 估算聚合键列的总行数和 NDV（不同值数量）统计。[#92812](https://github.com/ClickHouse/ClickHouse/pull/92812) ([Alexander Gololobov](https://github.com/davenger))。
* 使用 simdcomp 优化倒排列表压缩。[#92871](https://github.com/ClickHouse/ClickHouse/pull/92871) ([Peng Jian](https://github.com/fastio))。
* 通过分桶重构 S3Queue 的 Ordered 模式处理流程。这也应当提升性能，减少 keeper 请求的数量。[#92889](https://github.com/ClickHouse/ClickHouse/pull/92889) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 函数 `mapContainsKeyLike` 和 `mapContainsValueLike` 现在可以分别利用 `mapKeys()` 或 `mapValues()` 上的文本索引。[#93049](https://github.com/ClickHouse/ClickHouse/pull/93049) ([Michael Jarrett](https://github.com/EmeraldShift))。
* Reduce memory usage on non-Linux systems (enable immediate purging of jemalloc dirty pages). [#93360](https://github.com/ClickHouse/ClickHouse/pull/93360) ([Eduard Karacharov](https://github.com/korowa)).
* 当脏页大小与 `max_server_memory_usage` 的比值超过 `memory_worker_purge_dirty_pages_threshold_ratio` 时，强制清理 jemalloc arena。[#93500](https://github.com/ClickHouse/ClickHouse/pull/93500) ([Eduard Karacharov](https://github.com/korowa))。
* 降低 AST（抽象语法树）的内存占用。[#93601](https://github.com/ClickHouse/ClickHouse/pull/93601) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* In some cases we&#39;ve seen ClickHouse doesn&#39;t respect a memory limit when reading from a table. This behaviour is fixed. [#93715](https://github.com/ClickHouse/ClickHouse/pull/93715) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 默认启用 Keeper 的 `CHECK_STAT` 和 `TRY_REMOVE` 扩展。[#93886](https://github.com/ClickHouse/ClickHouse/pull/93886) ([Mikhail Artemenko](https://github.com/Michicosun))。
* Parse lower and upper bounds of file names corresponding to position deletes from Iceberg manifest file entries for better selection of corresponding data files. [#93980](https://github.com/ClickHouse/ClickHouse/pull/93980) ([Daniil Ivanik](https://github.com/divanik)).
* 新增两个设置，用于控制 JSON 列中动态子列的最大数量。第一个是 MergeTree 设置 `merge_max_dynamic_subcolumns_in_compact_part`（类似于已添加的 `merge_max_dynamic_subcolumns_in_wide_part`），用于限制在合并为 Compact 分片时创建的动态子列数量。第二个是查询级别设置 `max_dynamic_subcolumns_in_json_type_parsing`，用于限制在解析 JSON 数据时创建的动态子列数量，从而可以在插入时指定该上限。[#94184](https://github.com/ClickHouse/ClickHouse/pull/94184) ([Pavel Kruglov](https://github.com/Avogar)).
* 在部分场景下对 JSON 列的压缩合并进行了小幅优化。[#94247](https://github.com/ClickHouse/ClickHouse/pull/94247) ([Pavel Kruglov](https://github.com/Avogar))。
* 根据生产环境经验减小线程池队列大小。在从 MergeTree 读取任何数据之前，添加一次显式的内存使用量检查。[#94692](https://github.com/ClickHouse/ClickHouse/pull/94692) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 确保在 CPU 资源饥饿时，调度器会优先调度 MemoryWorker 线程，因为它可以保护 ClickHouse 进程免受致命威胁。[#94864](https://github.com/ClickHouse/ClickHouse/pull/94864) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 在与 MemoryWorker 主线程不同的线程中执行 jemalloc 脏页清理。如果清理较慢，可能会延迟 RSS 使用量的更新，从而导致进程因内存不足而被杀死。引入新的配置项 `memory_worker_purge_total_memory_threshold_ratio`，用于根据总内存使用量的比例启动脏页清理。[#94902](https://github.com/ClickHouse/ClickHouse/pull/94902) ([Antonio Andelic](https://github.com/antonio2368))。

#### 改进 \{#improvement\}

* `system.blob_storage_log` 现已可用于 Azure Blob Storage。[#93105](https://github.com/ClickHouse/ClickHouse/pull/93105)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 Local 和 HDFS 实现 `blob_storage_log`。修复 `S3Queue` 在 `blob_storage_log` 中记录日志时未使用磁盘名称而导致的错误。为 `blob_storage_log` 添加 `error_code` 列。拆分测试配置文件以简化本地测试。[#93106](https://github.com/ClickHouse/ClickHouse/pull/93106)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在输入时，`clickhouse-client` 和 `clickhouse-local` 会高亮显示数值字面量中的数字分组（千位、百万位等）。此更改修复了 [#93100](https://github.com/ClickHouse/ClickHouse/issues/93100)。[#93108](https://github.com/ClickHouse/ClickHouse/pull/93108)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-client` 中新增对在等号两侧包含空格的命令行参数的支持。修复了 [#93077](https://github.com/ClickHouse/ClickHouse/issues/93077)。[#93174](https://github.com/ClickHouse/ClickHouse/pull/93174)（[Cole Smith](https://github.com/colesmith54)）。
* 在配置 `<interactive_history_legacy_keymap>true</interactive_history_legacy_keymap>` 后，CLI 客户端现在可以像之前一样回退为使用 Ctrl-R 进行常规搜索，而 Ctrl-T 用于模糊搜索。[#87785](https://github.com/ClickHouse/ClickHouse/pull/87785)（[Larry Snizek](https://github.com/larry-cdn77)）。
* 用于清理缓存的语句 `SYSTEM DROP [...] CACHE` 给人一种错误印象，好像该语句会禁用缓存。ClickHouse 现在支持语句 `SYSTEM CLEAR [...] CACHE`，含义更加清晰。旧的语法仍然可用。[#93727](https://github.com/ClickHouse/ClickHouse/pull/93727)（[Pranav Tiwari](https://github.com/pranavt84)）。
* 在 `EmbeddedRocksDB` 中支持使用多个列作为主键。修复 [#32819](https://github.com/ClickHouse/ClickHouse/issues/32819)。[#33917](https://github.com/ClickHouse/ClickHouse/pull/33917)（[usurai](https://github.com/usurai)）。
* 现在可以在标量上使用非常量的 IN（例如查询 `val1 NOT IN if(cond, val2, val3)`）。[#93495](https://github.com/ClickHouse/ClickHouse/pull/93495)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 防止在 `HeadObject`、`UploadPart` 和 `CompleteMultipartUpload` S3 请求中继续传递 `x-amz-server-side-encryption` 头部，因为这些请求不支持该头部。[#64577](https://github.com/ClickHouse/ClickHouse/pull/64577)（[Francisco J. Jurado Moreno](https://github.com/Beetelbrox)）。
* 在 S3Queue 中跟踪有序模式下的 Hive 分区。修复了 [#71161](https://github.com/ClickHouse/ClickHouse/issues/71161)。[#81040](https://github.com/ClickHouse/ClickHouse/pull/81040)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 优化文件系统缓存中的空间预留。`FileCache::collectCandidatesForEviction` 将在不持有独占锁的情况下执行。[#82764](https://github.com/ClickHouse/ClickHouse/pull/82764) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 支持服务器日志的复合轮转策略（大小 + 时间）。 [#87620](https://github.com/ClickHouse/ClickHouse/pull/87620) ([Jianmei Zhang](https://github.com/zhangjmruc)).
* CLI 客户端现在可以指定 `<warnings>false</warnings>` 以替代命令行参数 `--no-warnings`。 [#87783](https://github.com/ClickHouse/ClickHouse/pull/87783) ([Larry Snizek](https://github.com/larry-cdn77)).
* 为 `avg` 聚合函数添加对 Date、DateTime 和 Time 类型参数的支持。修复了 [#82267](https://github.com/ClickHouse/ClickHouse/issues/82267) 中的问题。[#87845](https://github.com/ClickHouse/ClickHouse/pull/87845)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 优化项 `use_join_disjunctions_push_down` 默认启用。[#89313](https://github.com/ClickHouse/ClickHouse/pull/89313)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在关联子查询中支持更多表引擎和数据源类型。关闭 Issue [#80775](https://github.com/ClickHouse/ClickHouse/issues/80775)。[#90175](https://github.com/ClickHouse/ClickHouse/pull/90175)（[Dmitry Novik](https://github.com/novikd)）。
* 如果显式指定了参数化视图的 schema，则会显示该 schema。关闭 [#88875](https://github.com/ClickHouse/ClickHouse/issues/88875)、[#81385](https://github.com/ClickHouse/ClickHouse/issues/81385)。[#90220](https://github.com/ClickHouse/ClickHouse/pull/90220)（[Grigorii Sokolik](https://github.com/GSokol)）。
* 如果日志早于最后一次提交的索引，则正确处理 Keeper 日志条目中的间隙。 [#90403](https://github.com/ClickHouse/ClickHouse/pull/90403) ([Antonio Andelic](https://github.com/antonio2368))。
* 改进 `min_free_disk_bytes_to_perform_insert` 设置项，使其在 JBOD 卷上能正确工作。 [#90878](https://github.com/ClickHouse/ClickHouse/pull/90878) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* 允许在命名集合中为 `S3` 表引擎和 `s3` 表函数指定 `storage_class_name` 设置。[#91926](https://github.com/ClickHouse/ClickHouse/pull/91926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 支持通过 `system.zookeeper` 插入辅助 ZooKeeper。 [#92092](https://github.com/ClickHouse/ClickHouse/pull/92092) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 为 Keeper 添加新指标：`KeeperChangelogWrittenBytes`、`KeeperChangelogFileSyncMicroseconds`、`KeeperSnapshotWrittenBytes` 和 `KeeperSnapshotFileSyncMicroseconds` profile events，以及 `KeeperBatchSizeElements` 和 `KeeperBatchSizeBytes` 直方图指标。[#92149](https://github.com/ClickHouse/ClickHouse/pull/92149)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 新增一个设置项 `trace_profile_events_list`，将使用 `trace_profile_event` 的跟踪限制为指定的事件名称列表。这使得在大规模工作负载下可以进行更精确的数据采集。[#92298](https://github.com/ClickHouse/ClickHouse/pull/92298) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 为可暂停的 failpoint 新增对 SYSTEM NOTIFY FAILPOINT 的支持；在 SYSTEM WAIT FAILPOINT fp 中新增对 PAUSE/RESUME 的支持。[#92368](https://github.com/ClickHouse/ClickHouse/pull/92368)（[Shaohua Wang](https://github.com/tiandiwonder)）。
* 为 `system.data_skipping_indices` 添加 `creation`（隐式/显式）列。 [#92378](https://github.com/ClickHouse/ClickHouse/pull/92378) ([Raúl Marín](https://github.com/Algunenano)).
* 允许将 YTsaurus 动态表的列描述传递给字典数据源。[#92391](https://github.com/ClickHouse/ClickHouse/pull/92391) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 在 [#63985](https://github.com/ClickHouse/ClickHouse/pull/63985) 中，我们实现了可以按端口粒度指定 TLS 配置所需的全部参数（参见 [composable protocols](https://clickhouse.com/docs/operations/settings/composable-protocols)），从而不再需要依赖全局 TLS 配置。然而，该实现仍然隐式要求存在一个全局的 `openSSL.server` 配置段，这与需要为不同端口使用不同 TLS 配置的场景相冲突。例如，在 keeper-in-server 部署中，我们需要分别为 keeper 之间的通信和 ClickHouse 客户端连接配置独立的 TLS 配置。[#92457](https://github.com/ClickHouse/ClickHouse/pull/92457)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 引入一个新的设置 `input_format_binary_max_type_complexity`，用于限制在二进制格式中可解码的类型节点总数，以防止恶意载荷。[#92519](https://github.com/ClickHouse/ClickHouse/pull/92519)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 `system.background_schedule_pool{,_log}` 中展示当前正在运行的任务。新增文档。[#92587](https://github.com/ClickHouse/ClickHouse/pull/92587) ([Azat Khuzhin](https://github.com/azat)).
* 如果在客户端中使用 Ctrl+R 搜索时在历史记录中未找到匹配项，则执行当前查询。[#92749](https://github.com/ClickHouse/ClickHouse/pull/92749)（[Azat Khuzhin](https://github.com/azat)）。
* 支持 `EXPLAIN indices = 1` 作为 `EXPLAIN indexes = 1` 的别名。关闭 [#92483](https://github.com/ClickHouse/ClickHouse/issues/92483)。[#92774](https://github.com/ClickHouse/ClickHouse/pull/92774)（[Pranav Tiwari](https://github.com/pranavt84)）。
* Parquet 读取器现在允许将 Tuple 或 Map 类型的列以 JSON 形式读取：`select x from file(f.parquet, auto, 'x JSON')` 即使在 `f.parquet` 中列 `x` 的类型是 tuple 或 map 也能正常工作。[#92864](https://github.com/ClickHouse/ClickHouse/pull/92864)（[Michael Kolupaev](https://github.com/al13n321)）。
* 在 Parquet 读取器中添加对空元组的支持。 [#92868](https://github.com/ClickHouse/ClickHouse/pull/92868) ([Michael Kolupaev](https://github.com/al13n321)).
* 当 Azure Blob Storage 的原生复制因 BadRequest（例如 block 列表无效）失败时，回退到读写复制方式。之前仅在将 blob 复制到不同存储帐户时出现 Unauthorized 错误才会进行此回退。但我们有时也会遇到 “The specified block list is invalid” 错误。因此现在更新了条件，对所有原生复制失败的情况都回退到读写模式。[#92888](https://github.com/ClickHouse/ClickHouse/pull/92888)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在使用 EC2 实例角色凭证运行大量并发 S3 查询时对 EC2 元数据端点访问被限流的问题。之前，每个查询都会创建自己的 `AWSInstanceProfileCredentialsProvider`，导致对 EC2 元数据服务发起并发请求，从而可能引发超时和 `HTTP response code: 403` 错误。现在，凭证提供程序会被缓存，并在所有查询之间共享。[#92891](https://github.com/ClickHouse/ClickHouse/pull/92891)（[Sav](https://github.com/sberss)）。
* 重构 `insert_select_deduplicate` 设置，以支持保留向后兼容性。 [#92951](https://github.com/ClickHouse/ClickHouse/pull/92951) ([Sema Checherinda](https://github.com/CheSema)).
* 将耗时超过平均水平的后台任务记录到日志中（`background_schedule_pool_log.duration_threshold_milliseconds=30`），以避免产生过多的任务日志。[#92965](https://github.com/ClickHouse/ClickHouse/pull/92965)（[Azat Khuzhin](https://github.com/azat)）。
* 在之前的版本中，一些 C++ 函数名在 `system.trace_log` 和 `system.symbols` 中显示不正确（被“mangled”），并且 `demangle` 函数无法正确处理它们。解决了 [#93074](https://github.com/ClickHouse/ClickHouse/issues/93074)。[#93075](https://github.com/ClickHouse/ClickHouse/pull/93075)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 引入了名为 `backup_data_from_refreshable_materialized_view_targets` 的备份设置，用于在执行备份时跳过可刷新 materialized view。使用 APPEND 刷新策略的 RMV 始终会被备份。[#93076](https://github.com/ClickHouse/ClickHouse/pull/93076) ([Julia Kartseva](https://github.com/jkartseva)). [#93658](https://github.com/ClickHouse/ClickHouse/pull/93658) ([Julia Kartseva](https://github.com/jkartseva))
* Use minimal debug info instead of no debug info for heavy translation units, such as functions. [#93079](https://github.com/ClickHouse/ClickHouse/pull/93079) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过为 MinIO 特定错误实现错误码映射，为 AWS S3 C++ SDK 添加了对 MinIO 的兼容性支持。此更改使 ClickHouse 在使用 MinIO 部署替代 AWS S3 时，能够正确处理并重试来自 MinIO 服务器的错误，从而提升在自托管 MinIO 集群上运行对象存储场景的可靠性。 [#93082](https://github.com/ClickHouse/ClickHouse/pull/93082) ([XiaoBinMu](https://github.com/Binnn-MX)).
* 写入已符号化的 jemalloc 性能分析文件（在生成堆内存性能分析时无需提供可执行二进制文件）。 [#93099](https://github.com/ClickHouse/ClickHouse/pull/93099) ([Azat Khuzhin](https://github.com/azat)).
* 恢复 `clickhouse git-import` 工具——此前在处理较大或无效的提交时会出错。参见 https://presentations.clickhouse.com/2020-matemarketing/。 [#93202](https://github.com/ClickHouse/ClickHouse/pull/93202) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 不在查询日志中显示来自 URL 存储的密码。[#93245](https://github.com/ClickHouse/ClickHouse/pull/93245) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 为 `flipCoordinates` 添加对 `Geometry` 类型的支持。 [#93303](https://github.com/ClickHouse/ClickHouse/pull/93303) ([Bharat Nallan](https://github.com/bharatnc)).
* 改进 SYSTEM INSTRUMENT ADD/REMOVE 的用户体验：对函数名使用字符串字面量，为所有匹配的函数应用补丁，并允许在 `REMOVE` 中使用 function&#95;name。 [#93345](https://github.com/ClickHouse/ClickHouse/pull/93345) ([Pablo Marcos](https://github.com/pamarcos))。
* 新增一个名为 `materialize_statistics_on_merge` 的设置，用于启用或禁用在合并过程中物化统计信息。默认值为 `1`。 [#93379](https://github.com/ClickHouse/ClickHouse/pull/93379) ([Han Fei](https://github.com/hanfei1991)).
* ClickHouse 现在可以解析 `DESCRIBE SELECT` 查询中不带括号的 `SELECT`。关闭了 [#58382](https://github.com/ClickHouse/ClickHouse/issues/58382)。[#93429](https://github.com/ClickHouse/ClickHouse/pull/93429)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* Add randomization of cache correctness checks under probability. [#93439](https://github.com/ClickHouse/ClickHouse/pull/93439) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加设置 `type_json_allow_duplicated_key_with_literal_and_nested_object`，以允许在 JSON 中出现重复路径，其中一个是字面量，另一个是嵌套对象，例如 `{"a" : 42, "a" : {"b" : 42}}`。在对重复路径的限制于 https://github.com/ClickHouse/ClickHouse/pull/79317 中添加之前，部分数据可能已经被创建，现在对这些数据进行进一步操作可能会导致错误。启用此设置后，此类旧数据仍然可以在无错误的情况下使用。[#93604](https://github.com/ClickHouse/ClickHouse/pull/93604) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 Pretty JSON 中，不要将简单类型的值打印在单独的行上。[#93836](https://github.com/ClickHouse/ClickHouse/pull/93836)（[Pavel Kruglov](https://github.com/Avogar)）。
* 当存在大量 `alter table ... modify setting ...` 语句时，可能在 5 秒内无法获取到锁。此时返回 `timeout` 比返回 `logical error` 更合适。[#93856](https://github.com/ClickHouse/ClickHouse/pull/93856)（[Han Fei](https://github.com/hanfei1991)）。
* 避免在发生语法错误时产生过多输出。在此更改之前，会输出整个 SQL 脚本，而脚本中可能包含大量查询语句。[#93876](https://github.com/ClickHouse/ClickHouse/pull/93876)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 正确计算 Keeper 中带有统计信息的 `check` 请求的字节大小。[#93907](https://github.com/ClickHouse/ClickHouse/pull/93907) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新增了 `use_hash_table_stats_for_join_reordering` 设置，用于控制在 JOIN 重排序时是否使用运行时哈希表大小的统计信息。该设置默认启用，从而保留 `collect_hash_table_stats_during_joins` 的现有行为。[#93912](https://github.com/ClickHouse/ClickHouse/pull/93912)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 用户现在可以在 `system.server_settings` 表中查看部分嵌套的全局服务器设置（例如 `logger.level`）。这仅适用于具有固定结构的设置项（不包含列表、枚举、重复等）。[#94001](https://github.com/ClickHouse/ClickHouse/pull/94001)（[Hechem Selmi](https://github.com/m-selmi)）。
* `QBit` 现在可以进行相等性比较。[#94078](https://github.com/ClickHouse/ClickHouse/pull/94078)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 当 Keeper 检测到快照损坏或变更日志不一致时，将抛出异常，而不是直接中止或自动清理文件。这样可以通过依赖人工干预，使 Keeper 的行为更加安全。[#94168](https://github.com/ClickHouse/ClickHouse/pull/94168) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复 `CREATE TABLE` 失败时可能遗留多余对象的问题。 [#94174](https://github.com/ClickHouse/ClickHouse/pull/94174) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用受密码保护的 TLS 密钥时访问未初始化内存的问题（OpenSSL 中的一个缺陷）。 [#94182](https://github.com/ClickHouse/ClickHouse/pull/94182) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 chdig 升级到 [v26.1.1](https://github.com/azat/chdig/releases/tag/v26.1.1)。[#94290](https://github.com/ClickHouse/ClickHouse/pull/94290)（[Azat Khuzhin](https://github.com/azat)）。
* 在 S3Queue 有序模式下支持更通用的分区方式。[#94321](https://github.com/ClickHouse/ClickHouse/pull/94321) ([Bharat Nallan](https://github.com/bharatnc))。
* 为设置 `allow_statistics_optimize` 新增别名 `use_statistics`。这与现有设置 `use_primary_key` 和 `use_skip_indexes` 更加一致。[#94366](https://github.com/ClickHouse/ClickHouse/pull/94366)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在从 Numbers 转换为 Enums 时启用了 `input_format_numbers_enum_on_conversion_error` SETTING，以检查元素是否存在。[#94384](https://github.com/ClickHouse/ClickHouse/pull/94384) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 在 S3(Azure)Queue 的有序模式下，通过跟踪限制来清理失败节点（此前该操作仅在无序模式下同时对失败和已处理节点执行，因此现在也会在有序模式下执行，但只针对失败节点）。 [#94412](https://github.com/ClickHouse/ClickHouse/pull/94412) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 clickhouse-local 中为 `default` 用户启用访问管理功能。`clickhouse-local` 中的默认用户缺少 `access_management` 权限，这会导致诸如 `DROP ROW POLICY IF EXISTS` 之类的操作因 `ACCESS_DENIED` 错误而失败，即使该用户本应不受限制。[#94501](https://github.com/ClickHouse/ClickHouse/pull/94501)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 YTsaurus 字典和表启用命名集合。[#94582](https://github.com/ClickHouse/ClickHouse/pull/94582) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 为 S3 和 Azure Blob Storage 的 BACKUP/RESTORE 添加对通过 SQL 定义的命名集合的支持。关闭 [#94604](https://github.com/ClickHouse/ClickHouse/issues/94604)。[#94605](https://github.com/ClickHouse/ClickHouse/pull/94605)（[Pablo Marcos](https://github.com/pamarcos)）。
* 在有序模式下，为 S3Queue 提供基于分区键的分桶支持。[#94698](https://github.com/ClickHouse/ClickHouse/pull/94698) ([Bharat Nallan](https://github.com/bharatnc))。
* 新增一个异步指标，用于记录耗时最长的合并操作的已用时间。 [#94825](https://github.com/ClickHouse/ClickHouse/pull/94825) ([Raúl Marín](https://github.com/Algunenano)).
* 在使用 IcebergBitmapPositionDeleteTransform 执行 position delete 操作之前，增加所属文件的检查。 [#94897](https://github.com/ClickHouse/ClickHouse/pull/94897) ([Yang Jiang](https://github.com/Ted-Jiang)).
* 现在 `view_duration_ms` 显示的是该分组处于活跃状态的持续时间，而不再是其中各线程持续时间的总和。[#94966](https://github.com/ClickHouse/ClickHouse/pull/94966)（[Sema Checherinda](https://github.com/CheSema)）。
* 移除了 `hasAnyTokens` 和 `hasAllTokens` 函数中搜索 token 数量上限为 64 的限制。示例：`SELECT count() FROM table WHERE hasAllTokens(text, ['token_1', 'token_2', [...], 'token_65']]);` 此前该查询会因为包含 65 个搜索 token 而抛出 `BAD_ARGUMENTS` 错误。通过此 PR，该限制已被完全移除，相同查询将不再报错。[#95152](https://github.com/ClickHouse/ClickHouse/pull/95152) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 添加名为 `input_format_numbers_enum_on_conversion_error` 的 SETTING，用于在将 Numbers 转换为 Enums 时检查元素是否存在。Closes: [#56144](https://github.com/ClickHouse/ClickHouse/issues/56144)。[#56240](https://github.com/ClickHouse/ClickHouse/pull/56240)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Share format parser resources between data file and position delete file reading in Iceberg tables to reduce memory allocations. [#94701](https://github.com/ClickHouse/ClickHouse/pull/94701) ([Yang Jiang](https://github.com/Ted-Jiang)).

#### 错误修复(官方稳定版本中用户可见的异常行为) \{#bug-fix-user-visible-misbehavior-in-an-official-stable-release\}

* 修复了一个问题：预定义查询处理程序在插入数据时会将末尾的空白字符误解释为数据。[#83604](https://github.com/ClickHouse/ClickHouse/pull/83604)（[Fabian Ponce](https://github.com/FabianPonce)）。
* 修复在 Join 存储以及“外连接转内连接”优化生效时出现的 `INCOMPATIBLE_TYPE_OF_JOIN` 错误。解决了 [#80794](https://github.com/ClickHouse/ClickHouse/issues/80794)。[#84292](https://github.com/ClickHouse/ClickHouse/pull/84292)（[Vladimir Cherkasov](https://github.com/vdimir))。
* 修复在启用 `allow_experimental_join_right_table_sorting` 并使用哈希连接（hash join）时出现的异常“Invalid number of rows in Chunk”。 [#86440](https://github.com/ClickHouse/ClickHouse/pull/86440) ([yanglongwei](https://github.com/ylw510)).
* 如果文件系统不区分大小写，则在 MergeTree 中始终将文件名替换为哈希值。此前在使用不区分大小写文件系统（如 macOS）的系统上，当多个列/子列名仅在大小写上不同时，可能会导致数据损坏。 [#86559](https://github.com/ClickHouse/ClickHouse/pull/86559) ([Pavel Kruglov](https://github.com/Avogar))。
* 在创建 materialized view 时，对其中的底层查询执行完整的权限检查。[#89180](https://github.com/ClickHouse/ClickHouse/pull/89180)（[pufit](https://github.com/pufit)）。
* 修复了在常量参数上调用 `icebergHash` 函数时发生的崩溃。[#90335](https://github.com/ClickHouse/ClickHouse/pull/90335) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了这样一个逻辑错误：在没有事务的情况下执行 mutation 时，会修改处于活动事务中的分区片段，而该活动事务最终会被回滚。 [#90469](https://github.com/ClickHouse/ClickHouse/pull/90469) ([Shaohua Wang](https://github.com/tiandiwonder)).
* 在将普通数据库转换为 Atomic 数据库后，正确更新 `system.warnings`。[#90473](https://github.com/ClickHouse/ClickHouse/pull/90473) ([sdk2](https://github.com/sdk2))。
* 修复了在从 Parquet 文件读取数据时，如果 **prewhere** 表达式的一部分在查询的其他位置被使用时出现的断言失败。 [#90635](https://github.com/ClickHouse/ClickHouse/pull/90635) ([Max Kainov](https://github.com/maxknv)).
* 修复了在单节点集群中使用 split-by-buckets 模式从 Iceberg 读取时发生的崩溃问题。此更改关闭了 [#90913](https://github.com/ClickHouse/ClickHouse/issues/90913#issue-3668583963)。[#91553](https://github.com/ClickHouse/ClickHouse/pull/91553)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 Log 引擎在读取子列时可能出现的逻辑错误。关闭问题 [#91710](https://github.com/ClickHouse/ClickHouse/issues/91710)。[#91711](https://github.com/ClickHouse/ClickHouse/pull/91711)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 ATTACH AS REPLICATED 过程中出现的逻辑错误：&#39;Storage does not support transaction&#39;。 [#91772](https://github.com/ClickHouse/ClickHouse/pull/91772) ([Shaohua Wang](https://github.com/tiandiwonder))。
* 修复在 `LEFT ANTI JOIN` 带有额外后置条件时运行时过滤器行为异常的问题。[#91824](https://github.com/ClickHouse/ClickHouse/pull/91824)（[Alexander Gololobov](https://github.com/davenger)）。
* 修复了一个错误，该错误出现在对 `Nothing` 类型进行空值安全比较时。关闭了 [#91834](https://github.com/ClickHouse/ClickHouse/issues/91834)。关闭了 [#84870](https://github.com/ClickHouse/ClickHouse/issues/84870)。关闭了 [#91821](https://github.com/ClickHouse/ClickHouse/issues/91821)。[#91884](https://github.com/ClickHouse/ClickHouse/pull/91884)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复原生 Parquet 读取器中 DELTA&#95;BYTE&#95;ARRAY 解码缺陷，影响对高度重复字符串数据的处理。[#91929](https://github.com/ClickHouse/ClickHouse/pull/91929)（[Daniel Muino](https://github.com/dmuino)）。
* 在使用 globs 进行 schema 推断时，仅为其推断来源的那个文件缓存 schema，而不是为所有文件缓存 schema。修复了 [#91745](https://github.com/ClickHouse/ClickHouse/issues/91745)。[#92006](https://github.com/ClickHouse/ClickHouse/pull/92006)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复由于归档条目大小头部不正确而导致的 `Couldn't pack tar archive: Failed to write all bytes` 错误。修复了 [#89075](https://github.com/ClickHouse/ClickHouse/issues/89075)。[#92122](https://github.com/ClickHouse/ClickHouse/pull/92122)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在 INSERT SELECT 中释放请求流，以防止关闭 HTTP 连接。 [#92175](https://github.com/ClickHouse/ClickHouse/pull/92175) ([Sema Checherinda](https://github.com/CheSema)).
* 修复在包含多个带有 `USING` 子句的 JOIN 且启用了 `join_use_nulls` 的查询中的逻辑错误。[#92251](https://github.com/ClickHouse/ClickHouse/pull/92251) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在启用 `join_use_nulls` 时进行 JOIN 重排时的逻辑错误，关闭 https://github.com/ClickHouse/ClickHouse/issues/90795。 [#92289](https://github.com/ClickHouse/ClickHouse/pull/92289) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复 arrayElement 与带负号字面量组合时 AST 格式不一致的问题。关闭 [#92288](https://github.com/ClickHouse/ClickHouse/issues/92288)、[#92212](https://github.com/ClickHouse/ClickHouse/issues/92212)、[#91832](https://github.com/ClickHouse/ClickHouse/issues/91832)、[#91789](https://github.com/ClickHouse/ClickHouse/issues/91789)、[#91735](https://github.com/ClickHouse/ClickHouse/issues/91735)、[#88495](https://github.com/ClickHouse/ClickHouse/issues/88495)、[#92386](https://github.com/ClickHouse/ClickHouse/issues/92386)。[#92293](https://github.com/ClickHouse/ClickHouse/pull/92293)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在使用 `join_on_disk_max_files_to_merge` 设置时可能发生的崩溃。[#92335](https://github.com/ClickHouse/ClickHouse/pull/92335) ([Bharat Nallan](https://github.com/bharatnc))。
* 相关问题 #https://github.com/ClickHouse/support-escalation/issues/6365。[#92339](https://github.com/ClickHouse/ClickHouse/pull/92339)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复 `SYSTEM SYNC FILE CACHE` 中缺失的访问检查。关闭 [#92101](https://github.com/ClickHouse/ClickHouse/issues/92101)。[#92372](https://github.com/ClickHouse/ClickHouse/pull/92372)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 `count_distinct_optimization` 在处理窗口函数和多参数时的优化过程。[#92376](https://github.com/ClickHouse/ClickHouse/pull/92376) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了在将某些聚合函数与窗口函数一起使用时出现的 &quot;Cannot write to finalized buffer&quot; 错误。关闭了 [#91415](https://github.com/ClickHouse/ClickHouse/issues/91415)。[#92395](https://github.com/ClickHouse/ClickHouse/pull/92395)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复使用 `CREATE TABLE ... AS urlCluster()` 与数据库引擎 `Replicated` 时的逻辑错误。解决 [#92216](https://github.com/ClickHouse/ClickHouse/issues/92216) 中报告的问题。[#92418](https://github.com/ClickHouse/ClickHouse/pull/92418)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 MergeTree 中执行变更操作（mutation）时继承源 part 的序列化信息设置。这样可以在更改数据类型序列化方式后，修复对已变更 part 执行查询时可能出现的查询结果不正确的问题。[#92419](https://github.com/ClickHouse/ClickHouse/pull/92419)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复具有相同名称的列和子列之间可能发生的冲突，该冲突可能会导致采用错误的序列化方式，从而引发查询失败。修复 [#90219](https://github.com/ClickHouse/ClickHouse/issues/90219)。修复 [#85161](https://github.com/ClickHouse/ClickHouse/issues/85161)。[#92453](https://github.com/ClickHouse/ClickHouse/pull/92453)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复由于在将外连接转换为内连接时对查询计划进行非预期修改而导致的 `LOGICAL_ERROR`。同时放宽该优化的条件，使其也能应用于在 JOIN 过程中对聚合键应用单射函数的情况。[#92503](https://github.com/ClickHouse/ClickHouse/pull/92503) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复在对空元组列进行排序时可能出现的 `SIZES_OF_COLUMNS_DOESNT_MATCH` 错误。关闭 [#92422](https://github.com/ClickHouse/ClickHouse/issues/92422)。[#92520](https://github.com/ClickHouse/ClickHouse/pull/92520)（[Pavel Kruglov](https://github.com/Avogar)）。
* 检查 JSON 类型中的不兼容类型化路径。修复 [#91577](https://github.com/ClickHouse/ClickHouse/issues/91577)。[#92539](https://github.com/ClickHouse/ClickHouse/pull/92539)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 Backup 数据库上执行 SHOW CREATE DATABASE 时出现的死锁问题。[#92541](https://github.com/ClickHouse/ClickHouse/pull/92541) ([Azat Khuzhin](https://github.com/azat)).
* 在验证假设索引时使用正确的错误代码。 [#92559](https://github.com/ClickHouse/ClickHouse/pull/92559) ([Raúl Marín](https://github.com/Algunenano)).
* 修复分析器中列别名的动态子列解析问题。此前，列别名中的动态子列会被包装为 `getSubcolumn` 调用，在某些情况下可能根本无法解析。关闭 [#91434](https://github.com/ClickHouse/ClickHouse/issues/91434)。[#92583](https://github.com/ClickHouse/ClickHouse/pull/92583)（[Pavel Kruglov](https://github.com/Avogar)）。
* 防止在 `tokens()` 的第二个参数为 `NULL` 时发生崩溃。[#92586](https://github.com/ClickHouse/ClickHouse/pull/92586) ([Raúl Marín](https://github.com/Algunenano))。
* 修复由于对底层 const PREWHERE 列进行就地修改可能导致的潜在崩溃问题。该问题可能在列收缩（`IColumn::shrinkToFit`）或过滤（`IColumn::filter`）时触发，这些操作可能会被多个线程并发执行。[#92588](https://github.com/ClickHouse/ClickHouse/pull/92588) ([Arsen Muk](https://github.com/arsenmuk)).
* 当前已暂时禁用在包含大型分区片段（超过 4,294,967,295 行）的表上创建和物化文本索引。此限制是为防止出现不正确的查询结果，因为当前的索引实现尚不支持如此大的分区片段。[#92644](https://github.com/ClickHouse/ClickHouse/pull/92644)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在执行 JOIN 时出现的逻辑错误 `Too large size (A) passed to allocator`。关闭 [#92043](https://github.com/ClickHouse/ClickHouse/issues/92043)。[#92667](https://github.com/ClickHouse/ClickHouse/pull/92667)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复了一个错误：当 `ngrambf_v1` 索引的 ngram 长度（第一个参数）大于 8 时会抛出异常的问题。[#92672](https://github.com/ClickHouse/ClickHouse/pull/92672) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复在使用 ZooKeeper 存储时后台重新加载命名集合时出现的未捕获异常。修复 https://github.com/ClickHouse/clickhouse-private/issues/44180。 [#92717](https://github.com/ClickHouse/ClickHouse/pull/92717) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修正了通配符授权的访问权限检查中不正确的逻辑。之前的尝试 https://github.com/ClickHouse/ClickHouse/pull/90928 虽然修复了一个严重漏洞，但最终限制过于严格，导致某些带通配符的 `GRANT` 语句因无关的撤销操作而失败。[#92725](https://github.com/ClickHouse/ClickHouse/pull/92725)（[pufit](https://github.com/pufit)）。
* 修复在 `WHERE` 子句中使用 `not match(...)` 时的数据跳过逻辑错误，该错误会导致结果错误。修复 [#92492](https://github.com/ClickHouse/ClickHouse/issues/92492)。[#92726](https://github.com/ClickHouse/ClickHouse/pull/92726)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 如果在只读磁盘上创建了 MergeTree 表，则在启动时不要尝试删除临时目录。[#92748](https://github.com/ClickHouse/ClickHouse/pull/92748) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在 ALTER TABLE REWRITE PARTS (v2) 中出现的 &quot;Cannot add action to empty ExpressionActionsChain&quot; 错误。 [#92754](https://github.com/ClickHouse/ClickHouse/pull/92754) ([Azat Khuzhin](https://github.com/azat)).
* 避免因为从已断开的 `Connection` 读取而导致的崩溃。[#92807](https://github.com/ClickHouse/ClickHouse/pull/92807) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 修复在 `Ordered` 模式下存储引擎 `S3Queue` 中出现的逻辑错误 ` Failed to set file processing within 100 retries`。现在该错误已被改为警告。在 25.10 版本之前，如果 Keeper 会话过期，可能会出现此错误；然而在 25.10+ 版本中，这种情况也只会记录为警告，因为在 `Ordered` 模式下高并发处理时，从理论上仍有可能出现此错误。 [#92814](https://github.com/ClickHouse/ClickHouse/pull/92814) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 之前，某些使用 PK 分片并带有恒为假条件的查询会失败，现在则不会了。此更改是 https://github.com/ClickHouse/ClickHouse/pull/89313 所需的。[#92815](https://github.com/ClickHouse/ClickHouse/pull/92815)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复了 `system.parts` 表中文本索引未压缩大小的计算方式。[#92832](https://github.com/ClickHouse/ClickHouse/pull/92832)（[Anton Popov](https://github.com/CurtizJ)）。
* 修正了在 `WHERE` 子句谓词中包含带子查询的 `IN` 子句时，轻量级更新对主索引的使用。[#92838](https://github.com/ClickHouse/ClickHouse/pull/92838)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在 JSON 中为路径 &#39;skip&#39; 创建类型提示时的问题。关闭 [#92731](https://github.com/ClickHouse/ClickHouse/issues/92731)。[#92842](https://github.com/ClickHouse/ClickHouse/pull/92842)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 S3 表引擎中，如果存在非确定性函数，应避免缓存分区键。 [#92844](https://github.com/ClickHouse/ClickHouse/pull/92844) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 修复在对带有 `ratio_of_defaults_for_sparse_serialization=0.0` 的稀疏列进行 mutation 后可能出现的错误 `FILE_DOESNT_EXIST`。修复 [#92633](https://github.com/ClickHouse/ClickHouse/issues/92633)。[#92860](https://github.com/ClickHouse/ClickHouse/pull/92860)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复旧版 Parquet 读取器（默认不启用）在 JSON 列位于 Tuple 列之后时的 Parquet schema 推断问题。修复旧版 Parquet 读取器（默认不启用）在处理空元组时失败的问题。[#92867](https://github.com/ClickHouse/ClickHouse/pull/92867)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复在常量条件下并开启 `join_use_nulls` 时执行多个 JOIN 的逻辑错误，关闭 [#92640](https://github.com/ClickHouse/ClickHouse/issues/92640)。[#92892](https://github.com/ClickHouse/ClickHouse/pull/92892)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复在向分区表达式中包含子列的表插入数据时可能出现的错误 `NOT_FOUND_COLUMN_IN_BLOCK`。关闭 [#93210](https://github.com/ClickHouse/ClickHouse/issues/93210)。关闭 [#83406](https://github.com/ClickHouse/ClickHouse/issues/83406)。[#92905](https://github.com/ClickHouse/ClickHouse/pull/92905)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在对带有别名的表使用 Merge 引擎时出现的 `NO_SUCH_COLUMN_IN_TABLE` 错误。关闭 [#88665](https://github.com/ClickHouse/ClickHouse/issues/88665)。[#92910](https://github.com/ClickHouse/ClickHouse/pull/92910)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 LowCardinality(Nullable(T)) 列上执行 full&#95;sorting&#95;join 时出现的 NULL != NULL 的情况。[#92924](https://github.com/ClickHouse/ClickHouse/pull/92924)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在 `MergeTree` 表中执行文本索引合并时出现的多个崩溃问题。 [#92925](https://github.com/ClickHouse/ClickHouse/pull/92925) ([Anton Popov](https://github.com/CurtizJ)).
* 在进行生存时间 (TTL) 聚合时，如有需要，为 SET 表达式的结果恢复 LowCardinality 包装，以防止在表优化期间抛出异常。[#92971](https://github.com/ClickHouse/ClickHouse/pull/92971) ([Seva Potapov](https://github.com/seva-potapov)).
* 修复在索引分析中，当在 `has` 函数中使用空数组时出现的逻辑错误。关闭 [#92906](https://github.com/ClickHouse/ClickHouse/issues/92906)。[#92995](https://github.com/ClickHouse/ClickHouse/pull/92995)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复在终止后台调度池时可能发生的卡死问题（可能导致服务器在关闭时挂起）。 [#93008](https://github.com/ClickHouse/ClickHouse/pull/93008) ([Azat Khuzhin](https://github.com/azat)).
* 修复在通过 ALTER 将设置项 `ratio_of_defaults_for_sparse_serialization` 修改为 `1.0` 之后，执行稀疏列变更时可能出现的 FILE&#95;DOESNT&#95;EXIST 错误。 [#93016](https://github.com/ClickHouse/ClickHouse/pull/93016) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 WHERE 子句中使用 `not materialize(...)` 或 `not CAST(...)` 时的数据跳过逻辑错误，该错误会导致结果不正确。关闭 [#88536](https://github.com/ClickHouse/ClickHouse/issues/88536)。[#93017](https://github.com/ClickHouse/ClickHouse/pull/93017)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复由于共享分区片段上的 TOCTOU 竞态条件，可能会误用已过期分区片段的问题。[#93022](https://github.com/ClickHouse/ClickHouse/pull/93022) ([Azat Khuzhin](https://github.com/azat))。
* 修复在反序列化格式错误且包含越界偏移的 `groupConcat` 聚合状态时发生的崩溃。[#93028](https://github.com/ClickHouse/ClickHouse/pull/93028)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 修复在提前取消分布式查询后导致连接处于损坏状态的问题。 [#93029](https://github.com/ClickHouse/ClickHouse/pull/93029) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在右侧 join 键为稀疏列时的 join 结果问题。这解决了 [#92920](https://github.com/ClickHouse/ClickHouse/issues/92920)。我只能在 `set compatibility='23.3'` 时重现该 bug。不确定是否需要进行回溯（backport）。[#93038](https://github.com/ClickHouse/ClickHouse/pull/93038)（[Amos Bird](https://github.com/amosbird)）。
* 修复在 `estimateCompressionRatio()` 中可能出现的 `Cannot finalize buffer after cancellation` 错误。修复：[ #87380 ](https://github.com/ClickHouse/ClickHouse/issues/87380)。[ #93068 ](https://github.com/ClickHouse/ClickHouse/pull/93068)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了基于复杂表达式（例如 `concat(col1, col2)`）构建的文本索引在合并时的问题。[#93073](https://github.com/ClickHouse/ClickHouse/pull/93073) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在过滤条件包含子列时应用 PROJECTION 的问题。解决 [#92882](https://github.com/ClickHouse/ClickHouse/issues/92882)。[#93141](https://github.com/ClickHouse/ClickHouse/pull/93141)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在将 join 运行时过滤器添加到查询计划时，在某些情况下被触发的逻辑错误。该问题是由于从 join 的一侧错误地返回了重复的常量列而导致的。 [#93144](https://github.com/ClickHouse/ClickHouse/pull/93144) ([Alexander Gololobov](https://github.com/davenger)).
* 由 join 运行时过滤器使用的特殊函数 `__applyFilter` 在某些本应合法的情况下错误地返回错误码 ILLEGAL&#95;TYPE&#95;OF&#95;ARGUMENT。 [#93187](https://github.com/ClickHouse/ClickHouse/pull/93187) ([Alexander Gololobov](https://github.com/davenger))。
* 防止在插值列实际上是同一列的别名时，不同的插值列在同一数据块中被折叠到同一列上。[#93197](https://github.com/ClickHouse/ClickHouse/pull/93197) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 在与已填充的右侧表进行 JOIN 时，不要添加运行时过滤器。[#93211](https://github.com/ClickHouse/ClickHouse/pull/93211) ([Alexander Gololobov](https://github.com/davenger))。
* 修复 Keeper 在会话终止后未清理持久化 watch 的问题。此更改关闭了 [#92480](https://github.com/ClickHouse/ClickHouse/issues/92480)。[#93213](https://github.com/ClickHouse/ClickHouse/pull/93213)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 Iceberg 中按元组进行 ORDER BY 时的问题。由此关闭 [#92977](https://github.com/ClickHouse/ClickHouse/issues/92977)。[#93225](https://github.com/ClickHouse/ClickHouse/pull/93225)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
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
* 修复了 `groupConcat` 状态反序列化中的整数溢出漏洞，该漏洞可能在处理精心构造的聚合状态时导致内存安全问题。 [#93426](https://github.com/ClickHouse/ClickHouse/pull/93426) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 修复了在数组列上进行文本索引分析时，如果索引中不包含任何 token（所有数组为空或所有 token 都被分词器跳过）时的处理逻辑。 [#93457](https://github.com/ClickHouse/ClickHouse/pull/93457) ([Anton Popov](https://github.com/CurtizJ)).
* 如果连接字符串中已包含用户名/密码，则在 ClickHouse Client 中不再使用 OAuth 登录。[#93459](https://github.com/ClickHouse/ClickHouse/pull/93459)（[Krishna Mannem](https://github.com/kcmannem)）。
* 修复 DataLakeCatalog 中对 Azure ADLS Gen2 下发凭据的支持：从 Iceberg REST 目录中解析 `adls.sas-token.*` 键，并修正 ABFSS URL 解析。[#93477](https://github.com/ClickHouse/ClickHouse/pull/93477)（[Karun Anantharaman](https://github.com/karunmotorq)）。
* 修复在使用分析器时对 GLOBAL IN 的支持（此前会在远程节点上再次创建 Set）。 [#93507](https://github.com/ClickHouse/ClickHouse/pull/93507) ([Azat Khuzhin](https://github.com/azat)).
* 修复在反序列化期间直接将子列提取到稀疏列时的问题。[#93512](https://github.com/ClickHouse/ClickHouse/pull/93512) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了在直接从文本索引读取时处理重复搜索查询时的错误。 [#93516](https://github.com/ClickHouse/ClickHouse/pull/93516) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在启用运行时过滤器且参与 JOIN 的表中存在相同列被多次返回时（例如 SELECT a, a, a FROM t）出现的 NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK 错误。 [#93526](https://github.com/ClickHouse/ClickHouse/pull/93526) ([Alexander Gololobov](https://github.com/davenger))。
* 修复一个 bug：使用 SSH 连接时，clickhouse-client 会要求输入两次密码。 [#93547](https://github.com/ClickHouse/ClickHouse/pull/93547) ([Isak Ellmer](https://github.com/spinojara)).
* 确保在关闭时正确完成 ZooKeeper 的终止（修复在极少数情况下可能发生的关闭挂起问题）。 [#93602](https://github.com/ClickHouse/ClickHouse/pull/93602) ([Azat Khuzhin](https://github.com/azat)).
* 修复在恢复 ReplicatedMergeTree 时，由去重竞态条件导致的 LOGICAL&#95;ERROR。[#93612](https://github.com/ClickHouse/ClickHouse/pull/93612)（[Pablo Marcos](https://github.com/pamarcos)）。
* 修复在某些输入格式中，直接反序列化到稀疏列时，用稀疏列执行生存时间 (TTL) 更新的方式。该修复解决了可能出现的逻辑错误 `Unexpected type of result TTL column`。 [#93619](https://github.com/ClickHouse/ClickHouse/pull/93619) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 h3 索引函数在使用无效输入调用时偶发崩溃或卡死的问题。[#93657](https://github.com/ClickHouse/ClickHouse/pull/93657) ([Michael Kolupaev](https://github.com/al13n321)).
* 对非 UTF-8 数据使用 `ngram_bf` 索引会导致未初始化内存读取，读取到的值可能被写入到生成的索引结构中。修复了 [#92576](https://github.com/ClickHouse/ClickHouse/issues/92576)。[#93663](https://github.com/ClickHouse/ClickHouse/pull/93663)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 验证解压后的缓冲区大小是否符合预期。 [#93690](https://github.com/ClickHouse/ClickHouse/pull/93690) ([Raúl Marín](https://github.com/Algunenano)).
* 防止用户在未经过 `SHOW COLUMNS` 权限检查的情况下，使用 `merge` 表引擎从表中获取列列表。 [#93695](https://github.com/ClickHouse/ClickHouse/pull/93695) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复了针对子列创建的跳过索引在物化时的问题。 [#93708](https://github.com/ClickHouse/ClickHouse/pull/93708) ([Anton Popov](https://github.com/CurtizJ)).
* 我们将各存储对象的共享指针保存在 `QueryPipeline::resources::storage_holders` 中，以确保在 `PipelineExecutor` 仍然存活时不会销毁 `IStorage` 对象。 [#93746](https://github.com/ClickHouse/ClickHouse/pull/93746) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 修复在重启后 interserver 主机发生变化时附加 Replicated 数据库失败的问题。[#93779](https://github.com/ClickHouse/ClickHouse/pull/93779) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复在启用缓存时会在 `ReadBufferFromS3` 中触发的断言 `!read_until_position` 问题。 [#93809](https://github.com/ClickHouse/ClickHouse/pull/93809) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了在极少数情况下将空元组用于 `Map` 列时的逻辑错误。关闭了 [#93784](https://github.com/ClickHouse/ClickHouse/issues/93784)。[#93814](https://github.com/ClickHouse/ClickHouse/pull/93814)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复了在合并期间重建投影时 `_part_offset` 出现损坏的问题，并通过避免对 `_part_offset` 列的不必要读取，以及在投影计算中跳过不需要的列来优化投影处理。此更改延续了在 [#93233](https://github.com/ClickHouse/ClickHouse/issues/93233) 中引入的优化。[#93827](https://github.com/ClickHouse/ClickHouse/pull/93827)（[Amos Bird](https://github.com/amosbird)）。
* 移除对 &#39;Bad version&#39; 的处理逻辑。[#93843](https://github.com/ClickHouse/ClickHouse/pull/93843) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 修复当键为有符号整数类型时，`optimize_inverse_dictionary_lookup` 在分布式查询中不生效的问题。修复 [#93259](https://github.com/ClickHouse/ClickHouse/issues/93259)。[#93848](https://github.com/ClickHouse/ClickHouse/pull/93848)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复了在分布式 `remote()` 查询中 `lag`/`lead` 无法使用的问题。关闭 [#90014](https://github.com/ClickHouse/ClickHouse/issues/90014)。[#93858](https://github.com/ClickHouse/ClickHouse/pull/93858)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复系统监控分发问题。 [#93937](https://github.com/ClickHouse/ClickHouse/pull/93937) ([Pablo Marcos](https://github.com/pamarcos)).
* 在 https://github.com/ClickHouse/ClickHouse/pull/89173 中，我们在通过内部管道由 `TraceSender` 发送的结构体中添加了一个额外字段。但是缓冲区大小并未更新（见[这里](https://github.com/ClickHouse/ClickHouse/pull/89173/changes#diff-36ecfac5cde34c92c031652d8a77f0d12782cd5d43e68d6ef159e6d46a54224fL44)），因此我们向缓冲区写入了超过 `buffer_size` 的数据，导致缓冲区被多次 flush。并且由于 `TraceSender::send` 是在不同线程中被调用的，不同线程的 flush 可能交错，从而破坏接收端（`TraceCollector`）所依赖的不变式。[#93966](https://github.com/ClickHouse/ClickHouse/pull/93966)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复在使用 `USING` 子句进行连接操作时，存储引擎 `Join` 执行向超类型类型转换的问题。修复了 [#91672](https://github.com/ClickHouse/ClickHouse/issues/91672)。修复了 [#78572](https://github.com/ClickHouse/ClickHouse/issues/78572)。[#94000](https://github.com/ClickHouse/ClickHouse/pull/94000)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在 Merge 表上应用 join 运行时过滤器时未正确添加 FilterStep 的问题。[#94021](https://github.com/ClickHouse/ClickHouse/pull/94021)（[Alexander Gololobov](https://github.com/davenger)）。
* 包含在多个列上使用谓词、带有 Bloom 过滤器跳过索引，并同时包含 `OR` 和 `NOT` 条件的 `SELECT` 查询，此前可能会返回不一致的结果。该问题现已修复。[#94026](https://github.com/ClickHouse/ClickHouse/pull/94026) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 修复在存在依赖索引时对 CLEAR 列的处理问题。[#94057](https://github.com/ClickHouse/ClickHouse/pull/94057) ([Raúl Marín](https://github.com/Algunenano))。
* 修复 `ReadWriteBufferFromHTTP` 中 use-of-uninitialized-value（使用未初始化值）的问题。 [#94058](https://github.com/ClickHouse/ClickHouse/pull/94058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复对 JSON 中类型化路径的错误检查。该检查在 https://github.com/ClickHouse/ClickHouse/pull/92842 中引入，可能会在启动现有表时导致错误。 [#94070](https://github.com/ClickHouse/ClickHouse/pull/94070) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在存在 OUTER JOIN 时执行过滤分析时出现的崩溃。解决了 [#90979](https://github.com/ClickHouse/ClickHouse/issues/90979)。[#94080](https://github.com/ClickHouse/ClickHouse/pull/94080)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在并行执行时（`max_threads` &gt; 1，默认值）使用 UInt8 聚合键时 `uniqTheta` 的精度问题。[#94095](https://github.com/ClickHouse/ClickHouse/pull/94095) ([Azat Khuzhin](https://github.com/azat)).
* 修复由于在 `SCOPE_EXIT` 中调用 `socket.setBlocking(true)` 时抛出异常而导致的崩溃。[#94100](https://github.com/ClickHouse/ClickHouse/pull/94100)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复在 ReplicatedMergeTree 中，`DROP PARTITION` 删除由后续日志条目创建的分区片段时导致的数据丢失问题。 [#94123](https://github.com/ClickHouse/ClickHouse/pull/94123) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复了 parquet reader v3 在处理跨页面边界的数组时的错误行为。比如，当读取由 Arrow 写出但未启用页面统计或页面索引的文件时会出现这种情况。仅影响 Array 数据类型的列。典型表现是大约每 1 MB 数据就会有一个数组被截断。在此修复之前，可以使用如下设置作为临时解决方案：`input_format_parquet_use_native_reader_v3 = 0`。[#94125](https://github.com/ClickHouse/ClickHouse/pull/94125) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复 ReplicatedMergeTree 在等待日志记录时产生过多 watch 的问题。[#94133](https://github.com/ClickHouse/ClickHouse/pull/94133)（[Azat Khuzhin](https://github.com/azat)）。
* 函数 `arrayShuffle`、`arrayPartialShuffle` 和 `arrayRandomSample` 用于将 const 列物化，以便不同的行得到不同的结果。[#94134](https://github.com/ClickHouse/ClickHouse/pull/94134) ([Joanna Hulboj](https://github.com/jh0x)).
* 修复在 materialized view 中执行表函数时的数据竞争问题。[#94171](https://github.com/ClickHouse/ClickHouse/pull/94171) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在 `PostgreSQL` 数据库引擎中因查询不正确而导致的 `nullptr` 解引用问题。关闭 [#92887](https://github.com/ClickHouse/ClickHouse/issues/92887)。[#94180](https://github.com/ClickHouse/ClickHouse/pull/94180)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复了在可刷新materialized view 中使用包含多个子查询的 `SELECT` 查询时出现的内存泄漏。[#94200](https://github.com/ClickHouse/ClickHouse/pull/94200)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复了 `DataPartStorageOnDiskBase::remove` 与 `system.parts` 之间的数据竞争问题。关闭 [#49076](https://github.com/ClickHouse/ClickHouse/issues/49076)。[#94262](https://github.com/ClickHouse/ClickHouse/pull/94262)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 移除 HashTable 复制赋值运算符上错误使用的 `noexcept` 说明符，该说明符可能在发生内存异常时导致程序崩溃（调用 `std::terminate`）。[#94275](https://github.com/ClickHouse/ClickHouse/pull/94275)（[Nikita Taranov](https://github.com/nickitat)）。
* 此前，在 `GROUP BY` 中使用重复列（例如 `GROUP BY c0, c0`）创建投影并插入数据时，如果启用了 `optimize_row_order`，会抛出 `std::length_error`。修复了 [#94065](https://github.com/ClickHouse/ClickHouse/issues/94065)。[#94277](https://github.com/ClickHouse/ClickHouse/pull/94277)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 ZooKeeper 客户端在连接时的一个隐蔽 Bug，该问题会导致进程卡死或崩溃。 [#94320](https://github.com/ClickHouse/ClickHouse/pull/94320) ([Azat Khuzhin](https://github.com/azat)).
* 修复“函数下推到子列”优化未真正应用于子列的问题。 [#94323](https://github.com/ClickHouse/ClickHouse/pull/94323) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在启用 `enable_lazy_columns_replication` 的情况下，嵌套 RIGHT JOIN 中可能出现的不正确结果。该缺陷导致在被复制的列中，所有行错误地返回相同的值，而非各自不同的值。关闭 [#93891](https://github.com/ClickHouse/ClickHouse/issues/93891)。[#94339](https://github.com/ClickHouse/ClickHouse/pull/94339)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复基于等价集的 SEMI JOIN 过滤下推。当参数类型发生变化时，不要下推该过滤条件。修复了 [#93264](https://github.com/ClickHouse/ClickHouse/issues/93264)。[#94340](https://github.com/ClickHouse/ClickHouse/pull/94340)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 DeltaLake CDF 与 DataLake 数据库引擎中数据库的配合使用问题（Delta Lake 目录集成）。关闭 [#94122](https://github.com/ClickHouse/ClickHouse/issues/94122)。[#94342](https://github.com/ClickHouse/ClickHouse/pull/94342)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在使用 `SLRU` 缓存策略时，修复当前指标 `FilesystemCacheSizeLimit` 值不正确的问题。[#94363](https://github.com/ClickHouse/ClickHouse/pull/94363)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 创建 Backup 数据库引擎时，如果提供的参数少于两个，现在会返回更具描述性的错误消息（`Wrong number of arguments`，而不是 `std::out_of_range: InlinedVector::at(size_type) const failed bounds check.`）。[#94374](https://github.com/ClickHouse/ClickHouse/pull/94374) ([Robert Schulze](https://github.com/rschu1ze))。
* 在数据库级别撤销带有 `GRANT OPTION` 的全局授权时，会忽略那些实际上不可能执行的撤销操作。[#94386](https://github.com/ClickHouse/ClickHouse/pull/94386) ([pufit](https://github.com/pufit)).
* 修复从紧凑分区片段读取稀疏偏移量时的问题。关闭 [#94385](https://github.com/ClickHouse/ClickHouse/issues/94385)。[#94399](https://github.com/ClickHouse/ClickHouse/pull/94399)（[Pavel Kruglov](https://github.com/Avogar)）。
* 即使在 `alter_column_secondary_index_mode` 处于 `throw` 模式时，也不再阻止对使用隐式索引的列执行 ALTER 操作。[#94425](https://github.com/ClickHouse/ClickHouse/pull/94425) ([Raúl Marín](https://github.com/Algunenano)).
* 修复当多次调用 `receivePacketsExpectQuery` 读取 `Protocol::Client::IgnoredPartUUIDs` 时 `TCPHandler` 崩溃的问题。[#94434](https://github.com/ClickHouse/ClickHouse/pull/94434) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复 `system.functions` 中敏感数据掩码处理的问题。 [#94436](https://github.com/ClickHouse/ClickHouse/pull/94436) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复在禁用 `send_profile_events` 时出现的空指针（`nullptr`）解引用问题。该功能是最近在 ClickHouse Python 驱动中引入的。关闭了 [#92488](https://github.com/ClickHouse/ClickHouse/issues/92488)。[#94466](https://github.com/ClickHouse/ClickHouse/pull/94466)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在合并过程中出现的文本索引与 .mrk 文件之间的不兼容问题。[#94494](https://github.com/ClickHouse/ClickHouse/pull/94494)（[Peng Jian](https://github.com/fastio)）。
* 当启用 `read_in_order_use_virtual_row` 时，代码在未检查索引是否被截断的情况下，仍按完整主键大小访问索引列，从而导致 use-after-free / 未初始化内存问题。修复了 [#85596](https://github.com/ClickHouse/ClickHouse/issues/85596)。[#94500](https://github.com/ClickHouse/ClickHouse/pull/94500)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在使用 GLOBAL IN 的子查询发送外部表时，当类型为 Nullable 时产生的类型不匹配错误。关闭 [#94097](https://github.com/ClickHouse/ClickHouse/issues/94097)。[#94511](https://github.com/ClickHouse/ClickHouse/pull/94511)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在之前的版本中，对同一表达式具有多个索引条件的查询可能会错误地抛出异常 `Not found column`。修复了 [#60660](https://github.com/ClickHouse/ClickHouse/issues/60660)。[#94515](https://github.com/ClickHouse/ClickHouse/pull/94515)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在运行时过滤器中对 Nullable JOIN 列的不正确处理。[#94555](https://github.com/ClickHouse/ClickHouse/pull/94555)（[Alexander Gololobov](https://github.com/davenger)）。
* 在一个正在使用的 workload 内创建另一个 workload 时不再会导致崩溃。[#94599](https://github.com/ClickHouse/ClickHouse/pull/94599)（[Sergei Trifonov](https://github.com/serxa)）。
* 修复在进行 ANY LEFT JOIN 优化时，对不存在的列计算 `isNotNull` 会导致的崩溃。[#94600](https://github.com/ClickHouse/ClickHouse/pull/94600)（[Molly](https://github.com/ggmolly)）。
* 修复在默认表达式引用具有计算默认值的其他列时的求值问题。[#94615](https://github.com/ClickHouse/ClickHouse/pull/94615) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 BACKUP/RESTORE 操作中的权限问题。[#94617](https://github.com/ClickHouse/ClickHouse/pull/94617)（[Pablo Marcos](https://github.com/pamarcos)）。
* 修复在数据类型为 `Nullable(DateTime64)` 时由于错误的类型转换导致的崩溃。[#94627](https://github.com/ClickHouse/ClickHouse/pull/94627)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 修复了一个错误：某些带有 `ORDER BY` 的分布式查询可能会返回值被对调的 `ALIAS` 列（即列 `a` 显示为列 `b` 的数据，反之亦然）。[#94644](https://github.com/ClickHouse/ClickHouse/pull/94644) ([filimonov](https://github.com/filimonov)).
* 修复 keeper-bench 结果写入文件时的问题。[#94654](https://github.com/ClickHouse/ClickHouse/pull/94654) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在列包含负浮点数值时，MinMax 类型统计信息产生的估算错误。 [#94665](https://github.com/ClickHouse/ClickHouse/pull/94665) ([zoomxi](https://github.com/zoomxi)).
* 修复在 Map 的键为 Struct 时读取 Parquet 文件的问题。[#94670](https://github.com/ClickHouse/ClickHouse/pull/94670) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 修复在使用复杂 ON 条件时，RIGHT join 可能产生的不正确结果。关闭 [#92913](https://github.com/ClickHouse/ClickHouse/issues/92913)。[#94680](https://github.com/ClickHouse/ClickHouse/pull/94680)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 Vertical 合并后保留固定索引粒度（use&#95;const&#95;adaptive&#95;granularity）。[#94725](https://github.com/ClickHouse/ClickHouse/pull/94725)（[Azat Khuzhin](https://github.com/azat)）。
* 修复与标量子查询和表依赖相关的 mutation 错误。如果某个表在某列上存在依赖（索引或 PROJECTION），标量子查询可能在没有数据的情况下被求值并缓存，从而导致不正确的变更。[#94731](https://github.com/ClickHouse/ClickHouse/pull/94731) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 AsynchronousMetrics 在出错时回退到 cpu&#95;pressure 的逻辑。[#94827](https://github.com/ClickHouse/ClickHouse/pull/94827)（[Raúl Marín](https://github.com/Algunenano)）。
* 在解引用指针之前，`getURLHostRFC` 函数缺少边界检查。当向 `domainRFC` 传递空字符串时，它会读取未初始化的内存，从而触发 MSan 错误。[#94851](https://github.com/ClickHouse/ClickHouse/pull/94851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复加密磁盘变为只读的问题。[#94852](https://github.com/ClickHouse/ClickHouse/pull/94852) ([Azat Khuzhin](https://github.com/azat)).
* 修复在旧分析器下对分布式表使用分数形式 `LIMIT/OFFSET` 时的逻辑错误。关闭 [#94712](https://github.com/ClickHouse/ClickHouse/issues/94712)。[#94999](https://github.com/ClickHouse/ClickHouse/pull/94999)（[Ahmed Gouda](https://github.com/0xgouda)）。
* 修复在默认启用 join 运行时过滤器时，在某些条件下发生的崩溃。[#95000](https://github.com/ClickHouse/ClickHouse/pull/95000) ([Alexander Gololobov](https://github.com/davenger))。
* 改进对表引擎 `URL()` 和表函数 `url()` 所使用 URL 中的密码的脱敏处理。[#95006](https://github.com/ClickHouse/ClickHouse/pull/95006) ([Vitaly Baranov](https://github.com/vitlibar))。
* 当 `enable_extended_results_for_datetime_functions` 启用时，`toStartOfInterval` FUNCTION 的行为现在与 `toStartOfX` 相同，其中 `X` 为 `Day, Week, Month, Quarter, Year`。 [#95011](https://github.com/ClickHouse/ClickHouse/pull/95011) ([Kirill Kopnev](https://github.com/Fgrtue)).
* 修复了常量字符串比较未遵循 `cast_string_to_date_time_mode`、`bool_true_representation`、`bool_false_representation` 和 `input_format_null_as_default` 等 SETTING 的问题。关闭 [#91681](https://github.com/ClickHouse/ClickHouse/issues/91681)。[#95040](https://github.com/ClickHouse/ClickHouse/pull/95040)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复文件系统缓存中的数据竞态问题。[#95064](https://github.com/ClickHouse/ClickHouse/pull/95064) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
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