---
description: '2025 年变更日志'
note: '此文件通过 yarn build 生成'
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: '2025'
title: '2025 年变更日志'
doc_type: 'changelog'
---

### 目录

**[ClickHouse 发行版 v25.11，2025-11-25](#2511)**<br/>
**[ClickHouse 发行版 v25.10，2025-10-30](#2510)**<br/>
**[ClickHouse 发行版 v25.9，2025-09-25](#259)**<br/>
**[ClickHouse 发行版 v25.8 LTS，2025-08-28](#258)**<br/>
**[ClickHouse 发行版 v25.7，2025-07-24](#257)**<br/>
**[ClickHouse 发行版 v25.6，2025-06-26](#256)**<br/>
**[ClickHouse 发行版 v25.5，2025-05-22](#255)**<br/>
**[ClickHouse 发行版 v25.4，2025-04-22](#254)**<br/>
**[ClickHouse 发行版 v25.3 LTS，2025-03-20](#253)**<br/>
**[ClickHouse 发行版 v25.2，2025-02-27](#252)**<br/>
**[ClickHouse 发行版 v25.1，2025-01-28](#251)**<br/>
**[2024 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017 年更新日志](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouse 25.11 版本，2025-11-25 {#2511}

#### 不向后兼容的变更

* 移除已弃用的 `Object` 类型。[#85718](https://github.com/ClickHouse/ClickHouse/pull/85718) ([Pavel Kruglov](https://github.com/Avogar))。
* 移除已弃用的 `LIVE VIEW` 功能。如果你正在使用 `LIVE VIEW`，则无法升级到该新版本。[#88706](https://github.com/ClickHouse/ClickHouse/pull/88706) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在之前的版本中，`Geometry` 类型只是 `String` 的别名，但现在它已经成为一个功能完备的类型。[#83344](https://github.com/ClickHouse/ClickHouse/pull/83344)（[scanhex12](https://github.com/scanhex12)）。
* 对 MergeTree 表的 Wide 数据部分中为 `Variant` 类型子列创建的文件名进行转义。此更改会导致与包含 Variant/Dynamic/JSON 数据类型的旧表不兼容。它修复了在 Variant 内部存储包含特殊字符的类型的问题（例如包含 `\` 的特定时区的 DateTime）。可以通过修改 MergeTree 设置 `escape_variant_subcolumn_filenames` 来禁用转义（如需保持兼容性，请在 MergeTree 的配置中禁用此设置，或在升级前将 `compatibility` 设置为之前的版本）。解决了 [#69590](https://github.com/ClickHouse/ClickHouse/issues/69590)。[#87300](https://github.com/ClickHouse/ClickHouse/pull/87300)（[Pavel Kruglov](https://github.com/Avogar)）。
* 默认对 `String` 数据类型启用 `with_size_stream` 序列化格式。此更改是向后兼容的，但新序列化格式仅从 25.10 版本开始支持，这意味着无法降级到 25.10 之前的版本。如果希望保留降级到 25.9 及更早版本的可能性，请在服务器配置的 `merge_tree` 部分中，将 `serialization_info_version` 设置为 `basic`，并将 `string_serialization_version` 设置为 `single_stream`。[#89329](https://github.com/ClickHouse/ClickHouse/pull/89329)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 HTTP 响应结果增加异常标记支持，以便客户端能够更可靠地解析异常。解决了 [#75175](https://github.com/ClickHouse/ClickHouse/issues/75175)。为了在各种格式之间保持一致性，设置 `http_write_exception_in_output_format` 默认处于禁用状态。[#88818](https://github.com/ClickHouse/ClickHouse/pull/88818)（[Kaviraj Kanagaraj](https://github.com/kavirajk)）。虽然它本不应破坏任何现有行为（最糟情况也只是向异常消息中附加一个有些奇怪的字符串），但出于提示/提醒的目的，仍然有必要将其纳入 &quot;Backward Incompatible Change&quot; 这一变更日志类别中（因为谁知道某些乱写的脚本是如何解析异常消息的）。
* TODO，@Michicosun - 需要澄清或删除。`PlainRewritable` 磁盘会将其文件系统树存储在内存中。如果另一个磁盘更改了对象存储结构，内存中的结构将不会被更新，这会导致无效的文件系统操作，并可能出现 `no such key` 错误。[#89038](https://github.com/ClickHouse/ClickHouse/pull/89038) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 修复了 Kafka 存储中 SASL 设置的优先级处理问题。现在，在 CREATE TABLE 查询中指定的表级 SASL 设置会正确覆盖配置文件中为消费者/生产者指定的设置。[#89401](https://github.com/ClickHouse/ClickHouse/pull/89401)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 现在会将不带时区的 Parquet `timestamp`（`isAdjustedToUTC=false`）读取为 `DateTime64(..., 'UTC')`，而不是 `DateTime64(...)`。这样虽仍不完全正确，但在将此类 UTC `timestamp` 转换为字符串时，会得到正确的本地时间表示。使用 `input_format_parquet_local_time_as_utc = 0` 可以恢复旧的行为。修复了 [#87469](https://github.com/ClickHouse/ClickHouse/issues/87469)。[#87872](https://github.com/ClickHouse/ClickHouse/pull/87872)（[Michael Kolupaev](https://github.com/al13n321)）。
* 对 `T64` codec 做了一个小改进：它不再接受与压缩元素大小未对齐的数据类型，否则会触发一个 bug。修复了 [#89282](https://github.com/ClickHouse/ClickHouse/issues/89282)。[#89432](https://github.com/ClickHouse/ClickHouse/pull/89432)（[yanglongwei](https://github.com/ylw510)）。

#### 新功能

* 引入 `Geometry` 类型，并支持读取其 `WKB` 和 `WKT` 格式。在之前的版本中，`Geometry` 类型只是 `String` 的别名，但现在它已成为一个功能完整的类型。[#83344](https://github.com/ClickHouse/ClickHouse/pull/83344)（[scanhex12](https://github.com/scanhex12)）。
* 新增 SQL 语句 `EXECUTE AS` 以支持用户身份模拟。修复 [#39048](https://github.com/ClickHouse/ClickHouse/issues/39048)。[#70775](https://github.com/ClickHouse/ClickHouse/pull/70775) ([Shankar](https://github.com/shiyer7474))。
* 添加 `naiveBayesClassifier` 函数，用于基于 n-gram 的朴素贝叶斯方法对文本进行分类。 [#88677](https://github.com/ClickHouse/ClickHouse/pull/88677) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 为 `LIMIT` 和 `OFFSET` 添加对小数值的支持，以便选取表的一部分。解决 [#81892](https://github.com/ClickHouse/ClickHouse/issues/81892)。[#88755](https://github.com/ClickHouse/ClickHouse/pull/88755)（[Ahmed Gouda](https://github.com/0xgouda)）。
* 用于 Microsoft OneLake 目录的 ClickHouse 子系统。[#89366](https://github.com/ClickHouse/ClickHouse/pull/89366) ([scanhex12](https://github.com/scanhex12))。
* 添加 `flipCoordinates` 函数，用于在数组中展开指定数量的维度，并在 Tuple 列内交换指针。修复 [#79469](https://github.com/ClickHouse/ClickHouse/issues/79469)。[#79634](https://github.com/ClickHouse/ClickHouse/pull/79634)（[Sachin Kumar Singh](https://github.com/sachinkumarsingh092)）。
* 添加 `system.unicode` 表，其中包含 Unicode 字符及其属性的列表。解决了 [#80055](https://github.com/ClickHouse/ClickHouse/issues/80055)。[#80857](https://github.com/ClickHouse/ClickHouse/pull/80857)（[wxybear](https://github.com/wxybear)）。
* 新增一个 MergeTree 设置项 `merge_max_dynamic_subcolumns_in_wide_part`，用于在合并后限制 Wide part 中动态子列的数量，而不受数据类型中指定参数的影响。[#87646](https://github.com/ClickHouse/ClickHouse/pull/87646) ([Pavel Kruglov](https://github.com/Avogar))。
* 新增对 `cume_dist` 窗口函数的支持。修复了 [#86920](https://github.com/ClickHouse/ClickHouse/issues/86920)。[#88102](https://github.com/ClickHouse/ClickHouse/pull/88102)（[Manuel](https://github.com/raimannma)）。
* 用户现在可以在构建文本索引时添加一个新的参数 `preprocessor`。该参数是一个任意表达式，用于在分词之前对每个文档进行转换。[#88272](https://github.com/ClickHouse/ClickHouse/pull/88272)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 为 `X-ClickHouse-Progress` 和 `X-ClickHouse-Summary` 新增 `memory_usage` 字段。可用于在客户端实时收集查询的内存使用情况。[#88393](https://github.com/ClickHouse/ClickHouse/pull/88393) ([Christoph Wurm](https://github.com/cwurm))。
* 添加 `into_outfile_create_parent_directories` 设置，在使用 `INTO OUTFILE` 时自动创建父目录，以避免在输出路径不存在时出错。这简化了查询将结果写入多级目录时的工作流。修复 [#88610](https://github.com/ClickHouse/ClickHouse/issues/88610)。[#88795](https://github.com/ClickHouse/ClickHouse/pull/88795)（[Saksham](https://github.com/Saksham10-11)）。
* 支持临时表的 `CREATE OR REPLACE` 语法。解决了 [#35888](https://github.com/ClickHouse/ClickHouse/issues/35888)。[#89450](https://github.com/ClickHouse/ClickHouse/pull/89450)（[Aleksandr Musorin](https://github.com/AVMusorin)）。
* 增加对 `arrayRemove` 的支持，用于从数组 `arr` 中移除所有等于 `elem` 的元素。此功能仅出于与 Postgres 的兼容性考虑，因为 ClickHouse 已经提供了更加强大的 `arrayFilter` 函数。解决 [#52099](https://github.com/ClickHouse/ClickHouse/issues/52099)。[#89585](https://github.com/ClickHouse/ClickHouse/pull/89585)（[tiwarysaurav](https://github.com/tiwarysaurav)）。
* 新增用于计算平均值的 `midpoint` 标量函数。修复了 [#89029](https://github.com/ClickHouse/ClickHouse/issues/89029)。[#89679](https://github.com/ClickHouse/ClickHouse/pull/89679)（[simonmichal](https://github.com/simonmichal)）。
* Web UI 现在提供了下载按钮。即使界面只显示部分结果，也会下载全部结果。[#89768](https://github.com/ClickHouse/ClickHouse/pull/89768) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 添加 `arrow_flight_request_descriptor_type` 设置项，以支持 Dremio 和其他要求使用 command 风格 descriptor 的 Arrow Flight 服务器。实现了 [#89523](https://github.com/ClickHouse/ClickHouse/issues/89523)。[#89826](https://github.com/ClickHouse/ClickHouse/pull/89826)（[Shreyas Ganesh](https://github.com/shreyasganesh0)）。
* 新增聚合函数 `argAndMin` 和 `argAndMax`，用于返回参数值及其对应的极值。在之前的版本中，也可以通过将元组作为参数来实现同样的效果。 [#89884](https://github.com/ClickHouse/ClickHouse/pull/89884) ([AbdAlRahman Gad](https://github.com/AbdAlRahmanGad))。
* 用于写入和验证 Parquet 校验和的设置。 [#79012](https://github.com/ClickHouse/ClickHouse/pull/79012) ([Michael Kolupaev](https://github.com/al13n321)).
* 在 Kafka 表引擎中新增 `kafka_schema_registry_skip_bytes` 配置项，用于在解析消息负载之前跳过封套头部字节（例如 AWS Glue Schema Registry 的 19 字节前缀）。这使得 ClickHouse 能够从在消息前添加元数据头的 Schema 注册中心消费消息。[#89621](https://github.com/ClickHouse/ClickHouse/pull/89621)（[Taras Polishchuk](https://github.com/wake-up-neo)）。
* 添加 `h3PolygonToCells` 函数，用于将几何区域填充为 h3 六边形。解决了 [#33991](https://github.com/ClickHouse/ClickHouse/issues/33991)。[#66262](https://github.com/ClickHouse/ClickHouse/pull/66262)（[Zacharias Knudsen](https://github.com/zachasme)）。
* 添加新的虚拟列 `_tags`（`Map(String, String)`），其中包含在 S3 中与该 blob 关联的所有标签（注意，如果 blob 没有任何标签，将不会发出额外的请求）。解决 [#72945](https://github.com/ClickHouse/ClickHouse/issues/72945)。[#77773](https://github.com/ClickHouse/ClickHouse/pull/77773)（[Zicong Qu](https://github.com/zicongleoqu)）。
* TODO，@vdimir —— 说明其中的差异并移到其他类别。添加对 `NULL` 安全的比较运算符 `<=>`（别名 `IS NOT DISTINCT FROM`）和 `IS DISTINCT FROM`，以便在相等性判断中正确处理 `NULL` 值。修复 [#86763](https://github.com/ClickHouse/ClickHouse/issues/86763)。[#87581](https://github.com/ClickHouse/ClickHouse/pull/87581)（[yanglongwei](https://github.com/ylw510)）。

#### 实验性功能

* 支持从 ACME 提供商（如 Let&#39;s Encrypt）获取 TLS 证书，参见 [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555)。这使得可以在分布式集群上自动配置 TLS。[#66315](https://github.com/ClickHouse/ClickHouse/pull/66315) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 支持部分 Prometheus HTTP Query API。要启用它，请在配置文件的 `<prometheus>` 部分添加一个类型为 `query_api` 的规则。支持的处理器为 `/api/v1/query_range` 和 `/api/v1/query`。[#86132](https://github.com/ClickHouse/ClickHouse/pull/86132) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 全文搜索现已进入 beta 阶段（此前为实验阶段）。[#88928](https://github.com/ClickHouse/ClickHouse/pull/88928) ([Robert Schulze](https://github.com/rschu1ze))。
* 将 `Alias` 标记为实验特性，可通过设置 `allow_experimental_alias_table_engine = 1` 启用。[#89712](https://github.com/ClickHouse/ClickHouse/pull/89712) ([Kai Zhu](https://github.com/nauu))。

#### 性能优化

* Parquet 读取器 v3 已默认启用。[#88827](https://github.com/ClickHouse/ClickHouse/pull/88827)（[Michael Kolupaev](https://github.com/al13n321)）。
* 分布式执行：最好按行组 ID 而不是按文件来拆分任务。[#87508](https://github.com/ClickHouse/ClickHouse/pull/87508) ([scanhex12](https://github.com/scanhex12))。
* `RIGHT` 和 `FULL` JOIN 现在使用 ConcurrentHashJoin；这意味着这些类型的 JOIN 现在可以以更高的并行度运行。在多种 `RIGHT` 和 `FULL` JOIN 场景下，性能最高可提升两倍。修复 [#78027](https://github.com/ClickHouse/ClickHouse/issues/78027)。[#78462](https://github.com/ClickHouse/ClickHouse/pull/78462)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 针对查询中包含大常量值的表达式进行了优化。修复了 [#72880](https://github.com/ClickHouse/ClickHouse/issues/72880)。[#81104](https://github.com/ClickHouse/ClickHouse/pull/81104)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 在包含 1 万个以上 part 的表上，借助大量分区裁剪，`SELECT` 查询性能可提升至 8 倍。[#85535](https://github.com/ClickHouse/ClickHouse/pull/85535)（[James Morrison](https://github.com/jawm)）。
* 当查询在聚合状态中使用固定哈希表（按小整数分组）时，ClickHouse 会并行合并聚合状态，以提升查询性能。[#87366](https://github.com/ClickHouse/ClickHouse/pull/87366)（[Jianfei Hu](https://github.com/incfly)）。
* 允许将使用 `_part_offset` 的 SELECT 且具有不同 ORDER BY 的 projection 用作二级索引。启用后，某些查询谓词可以通过读取 projection 分片生成位图，用于在 PREWHERE 阶段高效过滤行。这是实现 projection 索引的第三步，前两步见 [#80343](https://github.com/ClickHouse/ClickHouse/issues/80343)。[#81021](https://github.com/ClickHouse/ClickHouse/pull/81021)（[Amos Bird](https://github.com/amosbird)）。
* 修复在极少数 Aarch64 系统和可能的其他架构/内核组合上出现的 VDSO 问题。[#86096](https://github.com/ClickHouse/ClickHouse/pull/86096) ([Tomas Hulata](https://github.com/tombokombo)).
* 通过简化代码并微调[选择算法](https://clickhouse.com/blog/lz4-compression-in-clickhouse#how-to-choose-the-best-algorithm)，提高 LZ4 解压缩速度。[#88360](https://github.com/ClickHouse/ClickHouse/pull/88360)（[Raúl Marín](https://github.com/Algunenano)）。
* S3 会根据键名前缀在内部对对象进行分区，并可自动扩展以支持每个分区上的高请求速率。此更改引入了两个新的 BACKUP 设置：`data_file_name_generator` 和 `data_file_name_prefix_length`。当 `data_file_name_generator=checksum` 时，备份数据文件将使用其内容的哈希值来命名。示例：对于 checksum = `abcd1234ef567890abcd1234ef567890` 且 `data_file_name_prefix_length = 3`，生成的路径将为：`abc/d1234ef567890abcd1234ef567890`。这样生成的对象键分布可增强跨 S3 分区的负载均衡，并降低被限流的风险。[#88418](https://github.com/ClickHouse/ClickHouse/pull/88418)（[Julia Kartseva](https://github.com/jkartseva)）。
* 通过缓存字典块并使用哈希表而非二分查找来进行 token 查找，提升了文本索引的性能。[#88786](https://github.com/ClickHouse/ClickHouse/pull/88786) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 查询现在可以同时利用 `optimize_read_in_order` 和 `query_plan_optimize_lazy_materialization`。解决了 [#88767](https://github.com/ClickHouse/ClickHouse/issues/88767)。[#88866](https://github.com/ClickHouse/ClickHouse/pull/88866)（[Manuel](https://github.com/raimannma)）。
* 对包含 `DISTINCT` 的查询使用聚合投影。修复 [#86925](https://github.com/ClickHouse/ClickHouse/issues/86925)。[#88894](https://github.com/ClickHouse/ClickHouse/pull/88894)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 缓存倒排列表，以提升连续运行时的性能。[#88912](https://github.com/ClickHouse/ClickHouse/pull/88912) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 当输入的排序顺序与 LIMIT BY 键一致时运行流式 LIMIT BY 转换。[#88969](https://github.com/ClickHouse/ClickHouse/pull/88969) ([Eduard Karacharov](https://github.com/korowa)).
* 在某些情况下，允许将 `ANY LEFT JOIN` 或 `ANY RIGHT JOIN` 重写为 `ALL INNER JOIN`。 [#89403](https://github.com/ClickHouse/ClickHouse/pull/89403) ([Dmitry Novik](https://github.com/novikd))。
* 降低日志开销：为每条日志使用更少的原子操作。[#89651](https://github.com/ClickHouse/ClickHouse/pull/89651) ([Sergei Trifonov](https://github.com/serxa)).
* 当在包含多个 join 的查询中启用了 runtime filter 并添加了多个 runtime filter 时，实现将新添加的过滤步骤优先于其他过滤步骤进行下推。 [#89725](https://github.com/ClickHouse/ClickHouse/pull/89725) ([Alexander Gololobov](https://github.com/davenger)).
* 通过减少合并哈希表的开销，略微加速某些 `uniqExact` 操作。[#89727](https://github.com/ClickHouse/ClickHouse/pull/89727)（[Raúl Marín](https://github.com/Algunenano)）。
* 将延迟物化的行数限制从 10 提高到 100。[#89772](https://github.com/ClickHouse/ClickHouse/pull/89772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 默认启用 `allow_special_serialization_kinds_in_output_formats` 设置。这将在某些行输出格式中，对稀疏列/复制列的输出减少内存使用并提升查询速度。[#89402](https://github.com/ClickHouse/ClickHouse/pull/89402) ([Pavel Kruglov](https://github.com/Avogar))。
* 为 `ALTER TABLE ... FREEZE` 查询增加了并行执行能力。[#71743](https://github.com/ClickHouse/ClickHouse/pull/71743) ([Kirill](https://github.com/kirillgarbar))。
* 为 bcrypt 身份验证添加缓存。[#87115](https://github.com/ClickHouse/ClickHouse/pull/87115) ([Nikolay Degterinsky](https://github.com/evillique))。
* 如果在带有 `FINAL` 的查询中，所使用的 skip index 作用在主键列上，那么在其他部分检查主键交集的额外步骤是多余的，因此现在不再执行。修复了 [#85897](https://github.com/ClickHouse/ClickHouse/issues/85897)。[#88368](https://github.com/ClickHouse/ClickHouse/pull/88368)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 优化项 `enable_lazy_columns_replication` 现在已成为默认设置，这将在执行 join 操作时减少内存占用。[#89316](https://github.com/ClickHouse/ClickHouse/pull/89316)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为各数据片段引入按表级的 `ColumnsDescription` 缓存，当表包含大量数据片段和列时可减少内存占用。[#89352](https://github.com/ClickHouse/ClickHouse/pull/89352) ([Azat Khuzhin](https://github.com/azat))。
* 为文本索引的反序列化后 header 引入了缓存，以减少 I/O 并提升查询性能。可以通过以下新的服务器设置进行配置：- `text_index_header_cache_policy` - `text_index_header_cache_size` - `text_index_header_cache_max_entries` - `text_index_header_cache_size_ratio`。[#89513](https://github.com/ClickHouse/ClickHouse/pull/89513)（[Elmi Ahmadov](https://github.com/ahmadov)）。

#### 改进

* 当启用 `use_variant_as_common_type` 时，UNION 如有需要会将类型统一为 `Variant`。修复了 [#82772](https://github.com/ClickHouse/ClickHouse/issues/82772)。[#83246](https://github.com/ClickHouse/ClickHouse/pull/83246)（[Mithun p](https://github.com/mithunputhusseri)）。
* 在 SQL 中定义的角色现在可以授予在 `users.xml` 中定义的用户。[#88139](https://github.com/ClickHouse/ClickHouse/pull/88139) ([c-end](https://github.com/c-end))。
* 将内部查询（由字典、可刷新物化视图等在内部执行的查询）记录到日志中，并在 `system.query_log` 中新增 `is_internal` 列。 [#83277](https://github.com/ClickHouse/ClickHouse/pull/83277) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 交互模式下的 `clickhouse-client` 和 `clickhouse-local` 会在命令行中高亮显示与当前光标下标识符同名的所有标识符。 [#89689](https://github.com/ClickHouse/ClickHouse/pull/89689) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 现在，输出格式相关设置不再影响查询缓存。此外，查询缓存会忽略 `http_response_headers` 设置。这样可以支持在 Web UI 中实现从缓存中下载查询结果等功能。[#89756](https://github.com/ClickHouse/ClickHouse/pull/89756)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当启用了查询结果缓存时，HTTP 接口会提供 `Age` 和 `Expires` 头部。`Age` 头部的存在用于指示结果是否来自缓存，而 `Expires` 头部则会在首次写入时设置。引入新的 profile events：`QueryCacheAgeSeconds`、`QueryCacheReadRows`、`QueryCacheReadBytes`、`QueryCacheWrittenRows`、`QueryCacheWrittenBytes`。[#89759](https://github.com/ClickHouse/ClickHouse/pull/89759) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在启用 `disable_insertion_and_mutation` 时，允许向远程表和数据湖表插入数据（这意味着 ClickHouse Cloud 中的只读仓库）。[#88549](https://github.com/ClickHouse/ClickHouse/pull/88549) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 新增查询语句 `SYSTEM DROP TEXT INDEX CACHES`。 [#90287](https://github.com/ClickHouse/ClickHouse/pull/90287) ([Anton Popov](https://github.com/CurtizJ)).
* 默认启用 `enable_shared_storage_snapshot_in_query`，以获得更好的一致性保证。预计不会有任何负面影响。[#82634](https://github.com/ClickHouse/ClickHouse/pull/82634) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增了 `send_profile_events` 设置，使客户端在未使用 profile events 时可以减少网络流量。[#89588](https://github.com/ClickHouse/ClickHouse/pull/89588) ([Kaviraj Kanagaraj](https://github.com/kavirajk))。
* 支持在单个查询级别禁用邻近分段的后台下载。修复 [#89524](https://github.com/ClickHouse/ClickHouse/issues/89524)。[#89668](https://github.com/ClickHouse/ClickHouse/pull/89668)（[tanner-bruce](https://github.com/tanner-bruce)）。
* 当复制 MergeTree 表中存在损坏磁盘时，允许执行 `FETCH PARTITION`。 [#58663](https://github.com/ClickHouse/ClickHouse/pull/58663) ([Duc Canh Le](https://github.com/canhld94)).
* 修复在 MySQL 数据库引擎中获取 MySQL 表结构时的未捕获异常。[#69358](https://github.com/ClickHouse/ClickHouse/pull/69358)（[Duc Canh Le](https://github.com/canhld94)）。
* 现在所有 DDL `ON CLUSTER` 查询都会在原始发起查询的用户上下文中执行，以改进访问权限校验。[#71334](https://github.com/ClickHouse/ClickHouse/pull/71334) ([pufit](https://github.com/pufit)).
* 在 `Parquet` 中新增对 `UUID` 的支持，当其以逻辑类型为 `UUID` 的 `FixedString(16)` 形式表示时。[#74484](https://github.com/ClickHouse/ClickHouse/pull/74484) ([alekseev-maksim](https://github.com/alekseev-maksim))。
* 默认在非服务器端二进制文件中禁用 ThreadFuzzer。 [#89115](https://github.com/ClickHouse/ClickHouse/pull/89115) ([Raúl Marín](https://github.com/Algunenano)).
* 通过推迟其物化，使相关子查询的输入子计划能够看到查询计划优化。属于 [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) 的一部分。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* 在 clickhouse-client 中，对于包含 `SELECT` 的 `CREATE OR REPLACE TABLE` 查询，你可以看到进度条、日志和性能统计。即使 `SELECT` 非常耗时，该查询也不会再导致超时。解决了 [#38416](https://github.com/ClickHouse/ClickHouse/issues/38416)。[#87247](https://github.com/ClickHouse/ClickHouse/pull/87247)（[Diskein](https://github.com/Diskein)）。
* 为哈希函数添加对 `JSON` 和 `Dynamic` 类型的支持。解决了 [#87734](https://github.com/ClickHouse/ClickHouse/issues/87734)。[#87791](https://github.com/ClickHouse/ClickHouse/pull/87791)（[Pavel Kruglov](https://github.com/Avogar)）。
* 补全 ArrowFlight 服务器中缺失的部分。[#88013](https://github.com/ClickHouse/ClickHouse/pull/88013) ([Vitaly Baranov](https://github.com/vitlibar))。
* 为 server 和 keeper 添加多种直方图指标，用于观测 keeper 请求各个执行阶段的耗时。将向 server 添加以下指标：`keeper_client_queue_duration_milliseconds`、`keeper_client_send_duration_milliseconds`、`keeper_client_roundtrip_duration_milliseconds`。将向 keeper 添加以下指标：`keeper_server_preprocess_request_duration_milliseconds`、`keeper_server_process_request_duration_milliseconds`、`keeper_server_queue_duration_milliseconds`、`keeper_server_send_duration_milliseconds`。[#88158](https://github.com/ClickHouse/ClickHouse/pull/88158)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在 `EXPLAIN` 查询中新增 `input_headers` 选项，用于在各个步骤中附加输入头部信息。 [#88311](https://github.com/ClickHouse/ClickHouse/pull/88311) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 新增 profile events，用于统计被限流器延迟的 S3 和 AzureBlobStorage 请求数量。修复了磁盘相关与非磁盘相关的 ThrottlerCount profile events 之间的不一致问题。现在 AzureBlobStorage 的 HTTP DELETE 请求不再被限流。[#88535](https://github.com/ClickHouse/ClickHouse/pull/88535) ([Sergei Trifonov](https://github.com/serxa)).
* 为表级统计信息增加缓存功能，新增两个设置：MergeTree 表引擎设置 `refresh_statistics_interval` 表示刷新统计信息缓存的时间间隔，0 表示不创建缓存。会话级设置 `use_statistics_cache` 表示在查询中是否使用表级统计信息。有时我们希望得到更精确的统计，就会选择不使用该缓存。[#88670](https://github.com/ClickHouse/ClickHouse/pull/88670) ([Han Fei](https://github.com/hanfei1991))。
* 修复了 `Array` 和 `Map` 的二进制反序列化，在验证大小限制时改为使用 `max_binary_array_size` 设置，而不是 `max_binary_string_size`。这样可以确保在读取 `RowBinary` 格式时应用正确的限制。[#88744](https://github.com/ClickHouse/ClickHouse/pull/88744)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 引入了一个 `LockGuardWithStopWatch` 类，并在后台线程池中用于执行合并操作。当某个互斥量被持有超过一秒，或某个线程在一秒内一直尝试获取该互斥量时，会打印一条警告信息。将 `MergeMutateSelectedEntry` 析构函数中的开销较大的代码移动到了 `finalize` 方法中，以避免在 `MergeTreeBackground` 执行器中持有锁的时间过长。 [#88898](https://github.com/ClickHouse/ClickHouse/pull/88898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 当在 endpoint 中未指定 region 时，自动启用对 S3 使用需显式开通的 AWS 区域。参考文档：[opt-in AWS regions](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)。[#88930](https://github.com/ClickHouse/ClickHouse/pull/88930)（[Andrey Zvonov](https://github.com/zvonand)）。
* 当分页器正在运行时，用户现在可以在 clickhouse-client 中按 Ctrl-C 取消查询。解决了 [#80778](https://github.com/ClickHouse/ClickHouse/issues/80778)。[#88935](https://github.com/ClickHouse/ClickHouse/pull/88935)（[Grigorii](https://github.com/GSokol)）。
* Web UI 即使在数值为负时也会在表格中显示条形。因此，它可以显示正负两侧使用不同颜色条形的双向条形图。 [#89016](https://github.com/ClickHouse/ClickHouse/pull/89016) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 禁用 `shared_merge_tree_create_per_replica_metadata_nodes`，以减少 `SharedMergeTree` 在 Keeper 中存储的元数据数量。 [#89036](https://github.com/ClickHouse/ClickHouse/pull/89036) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 使 `S3Queue` 遵守服务器设置 `disable_insertion_and_mutation`。[#89048](https://github.com/ClickHouse/ClickHouse/pull/89048)（[Raúl Marín](https://github.com/Algunenano)）。
* 将 25.6 版本中的默认 `s3_retry_attempts` 设置为 500，以确保在发生 S3 重新分区且 S3 持续超过 10 分钟返回 SlowDown 错误响应时，备份仍然可以成功完成。[#89051](https://github.com/ClickHouse/ClickHouse/pull/89051) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 现在可以使用 `kafka_compression_codec` 和 `kafka_compression_level` 设置来为两个 Kafka 引擎中的 Kafka 生产者指定压缩算法。[#89073](https://github.com/ClickHouse/ClickHouse/pull/89073)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 在 `system.columns` 中新增一列 `statistics`，用于表示在该表上构建的统计信息类型。如果某种统计信息是自动创建的，其后缀将显示为 (auto)。[#89086](https://github.com/ClickHouse/ClickHouse/pull/89086) ([Han Fei](https://github.com/hanfei1991))。
* 当向 `*Cluster` 表函数传递通用展开（generic expansion）而非集群名称时，改进错误提示。 [#89093](https://github.com/ClickHouse/ClickHouse/pull/89093) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* YTsaurus：允许将 `replicated_table` 用作数据源。[#89107](https://github.com/ClickHouse/ClickHouse/pull/89107) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 在 CLI 中，以空白字符开头的查询将不再保存到历史记录中。[#89116](https://github.com/ClickHouse/ClickHouse/pull/89116)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 支持将字符串数组作为 `hasAnyTokens` 或 `hasAllTokens` 函数的输入。[#89124](https://github.com/ClickHouse/ClickHouse/pull/89124) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 修改 plain-rewritable 磁盘在内存中存放元数据的方式，修复了大量与目录嵌套等相关的错误。[#89125](https://github.com/ClickHouse/ClickHouse/pull/89125) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 在查询 Iceberg 表时，`IN` 表达式中的子查询会在分区裁剪分析之前被正确地预计算。 [#89177](https://github.com/ClickHouse/ClickHouse/pull/89177) ([Daniil Ivanik](https://github.com/divanik)).
* 默认启用 `create_table_empty_primary_key_by_default`。这有利于提升易用性。[#89333](https://github.com/ClickHouse/ClickHouse/pull/89333) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复 `Backup` 数据库引擎中的错误实现，避免在执行 `SHOW CREATE DATABASE` 或从 `system.databases` 查询 `engine_full` 时生成无效查询。修复 [#89477](https://github.com/ClickHouse/ClickHouse/issues/89477)。[#89341](https://github.com/ClickHouse/ClickHouse/pull/89341)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在早期版本中，当在 CREATE TABLE 查询中未指定表引擎时，设置 `create_table_empty_primary_key_by_default` 不会生效。 [#89342](https://github.com/ClickHouse/ClickHouse/pull/89342) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 将 `chdig` 更新至 v25.11.1 —— 包含对日志的重大改进以及其他多项增强（[25.11 版本说明](https://github.com/azat/chdig/releases/tag/v25.11.1)）。[#89957](https://github.com/ClickHouse/ClickHouse/pull/89957)（[Azat Khuzhin](https://github.com/azat)）。 （[25.10 版本说明](https://github.com/azat/chdig/releases/tag/v25.10.1)）。[#89452](https://github.com/ClickHouse/ClickHouse/pull/89452)（[Azat Khuzhin](https://github.com/azat)）。
* 将 Web UI 中查询文本区域的调整控件改为全宽，使其使用起来稍微更方便一些。另外，此前在 iPad 上的 Safari 中无法使用浏览器原生的调整控件，在此变更之后，至少可以通过拖动文本区域的底部来调整大小。[#89457](https://github.com/ClickHouse/ClickHouse/pull/89457)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 改进了哈希 JOIN 结果生成过程中的内存跟踪。之前，在生成 JOIN 结果时的临时内存分配没有被正确跟踪，这可能会导致内存超限。[#89560](https://github.com/ClickHouse/ClickHouse/pull/89560)（[Azat Khuzhin](https://github.com/azat)）。
* 异步服务器日志：提前刷新并增大默认队列容量。[#89597](https://github.com/ClickHouse/ClickHouse/pull/89597) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 `system.asynchronous_metrics` 中错误的 `FilesystemCacheBytes`（以及其他相关指标）。仅对文件系统缓存执行一次 `SYSTEM` 查询。为缓存提供一个指向 `system.filesystem_caches` 中相同路径的原子视图。 [#89640](https://github.com/ClickHouse/ClickHouse/pull/89640) ([Azat Khuzhin](https://github.com/azat)).
* 对 `system.view_refreshes` 中部分列的描述进行了澄清。[#89701](https://github.com/ClickHouse/ClickHouse/pull/89701) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 与 STS 端点交互时缓存 S3 凭证，以便可在不同的函数调用中复用。可使用 `s3_credentials_provider_max_cache_size` 控制缓存凭证的数量。[#89734](https://github.com/ClickHouse/ClickHouse/pull/89734) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复在其下方存在多个表达式步骤时的运行时过滤器下推问题。[#89741](https://github.com/ClickHouse/ClickHouse/pull/89741) ([Alexander Gololobov](https://github.com/davenger)).
* 如果系统内存低于 5GB，则默认不要对可执行文件使用 mlock。 [#89751](https://github.com/ClickHouse/ClickHouse/pull/89751) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI 中的类型提示信息不再溢出到表头区域。同时修复了工具提示的显示——它们不再被表头遮挡。 [#89753](https://github.com/ClickHouse/ClickHouse/pull/89753) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 Web UI 中显示表的属性。点击行数或字节数会打开一条从 `system.tables` 生成的查询。点击表引擎会打开 `SHOW TABLES`。[#89771](https://github.com/ClickHouse/ClickHouse/pull/89771) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 为使用不支持追加写入的磁盘的表增加对 `non_replicated_deduplication_window` 的支持。修复 [#87281](https://github.com/ClickHouse/ClickHouse/issues/87281)。[#89796](https://github.com/ClickHouse/ClickHouse/pull/89796)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 在命令 `SYSTEM FLUSH ASYNC INSERT QUEUE` 中新增了可以指定要刷新的表列表的功能。[#89915](https://github.com/ClickHouse/ClickHouse/pull/89915) ([Sema Checherinda](https://github.com/CheSema))。
* 在 `system.part_log` 中存储去重块的 ID。[#89928](https://github.com/ClickHouse/ClickHouse/pull/89928) ([Sema Checherinda](https://github.com/CheSema))。
* 将文件系统缓存设置 `keep_free_space_remove_batch` 的默认值从 10 更改为 100，因为这样更为优化。 [#90030](https://github.com/ClickHouse/ClickHouse/pull/90030) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 引入 TTL DROP 合并类型，并在此类合并后不再更新下一次删除 TTL 合并调度。 [#90077](https://github.com/ClickHouse/ClickHouse/pull/90077) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在清理 S3Queue 时，对 RemoveRecursive Keeper 请求使用更低的节点数上限。 [#90201](https://github.com/ClickHouse/ClickHouse/pull/90201) ([Antonio Andelic](https://github.com/antonio2368)).
* 使 `SYSTEM FLUSH LOGS` 查询即使在日志为空时也会等待表创建完成。 [#89408](https://github.com/ClickHouse/ClickHouse/pull/89408) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复在分布式合并聚合中涉及多个远程分片，或存在子查询 IN 时 `rows_before_limit_at_least` 值不正确的问题。修复了 [#63280](https://github.com/ClickHouse/ClickHouse/issues/63280)。[#63511](https://github.com/ClickHouse/ClickHouse/pull/63511)（[Amos Bird](https://github.com/amosbird)）。
* 修复了在执行 `INSERT INTO ... SELECT` 查询后错误显示 `0 rows in set` 的问题，并关闭了 [#47800](https://github.com/ClickHouse/ClickHouse/issues/47800)。[#79462](https://github.com/ClickHouse/ClickHouse/pull/79462)（[Engel Danila](https://github.com/aaaengel)）。

#### 缺陷修复（官方稳定版中对用户可见的异常行为）

* 修复 `multiIf` 在使用常量参数时的短路求值问题。解决 [#72714](https://github.com/ClickHouse/ClickHouse/issues/72714)。[#84546](https://github.com/ClickHouse/ClickHouse/pull/84546)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了在从带有子查询约束的表中查询时出现的逻辑错误。解决了 [#84190](https://github.com/ClickHouse/ClickHouse/issues/84190)。[#85575](https://github.com/ClickHouse/ClickHouse/pull/85575)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 修复了在使用包含问号的 URI 执行特殊查询时出现的错误。 [#85663](https://github.com/ClickHouse/ClickHouse/pull/85663) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了 `EXPLAIN indexes = 1` 输出中有时会缺失某些列的问题。解决了 [#86696](https://github.com/ClickHouse/ClickHouse/issues/86696)。[#87083](https://github.com/ClickHouse/ClickHouse/pull/87083)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复可能出现的 `Cannot add subcolumn with parallel replicas` 错误。关闭 [#84888](https://github.com/ClickHouse/ClickHouse/issues/84888)。[#87514](https://github.com/ClickHouse/ClickHouse/pull/87514)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 Parquet writer 中，以正确的格式输出 `created_by` 字符串，例如使用 `ClickHouse version 25.10.1 (build 5b1dfb14925db8901a4e9202cd5d63c11ecfbb9f)`，而不是 `ClickHouse v25.9.1.1-testing`。修复 Parquet reader 与由旧版 parquet-mr 写出的不规范文件之间的兼容性问题。[#87735](https://github.com/ClickHouse/ClickHouse/pull/87735) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复 `cramersV`、`cramersVBiasCorrected`、`theilsU` 和 `contingency` 中 φ² 计算错误导致结果不正确的问题。[#87831](https://github.com/ClickHouse/ClickHouse/pull/87831)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复 JSON 中读取同时包含浮点数和布尔值的混合数组时的问题。之前插入此类数据会导致异常。[#88008](https://github.com/ClickHouse/ClickHouse/pull/88008)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在 `TCPHandler` 中为 `QueryState` 使用 `shared_ptr`，以便在 `setProgressCallback`、`setFileProgressCallback` 和 `setBlockMarshallingCallback` 中检测状态是否无效。 [#88201](https://github.com/ClickHouse/ClickHouse/pull/88201) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在 `query_plan_optimize_join_order_limit` &gt; 1 时对 CROSS JOIN 重排的逻辑错误，关闭 [#89409](https://github.com/ClickHouse/ClickHouse/issues/89409)。[#88286](https://github.com/ClickHouse/ClickHouse/pull/88286)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复 [#88426](https://github.com/ClickHouse/ClickHouse/issues/88426)：1. 禁止在 Alias 中显式定义列，列将自动从目标表中加载。这确保别名始终与目标表的模式保持一致。2. 通过 IStorage 代理更多方法。[#88552](https://github.com/ClickHouse/ClickHouse/pull/88552)（[Kai Zhu](https://github.com/nauu)）。
* 在恢复后，Replicated 数据库的副本可能会长时间卡住，并不断打印类似 `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` 的消息，此问题已修复。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 修复新分析器在处理子查询时可能出现的“Context has expired”问题。 [#88694](https://github.com/ClickHouse/ClickHouse/pull/88694) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在将 input&#95;format&#95;parquet&#95;local&#95;file&#95;min&#95;bytes&#95;for&#95;seek 设置为 0 时，Parquet 读取器发生段错误的问题。解决了 [#78456](https://github.com/ClickHouse/ClickHouse/issues/78456)。[#88784](https://github.com/ClickHouse/ClickHouse/pull/88784)（[Animesh](https://github.com/anibilthare)）。
* 修复当主键（PK）以逆序排列时 `min(PK)`/`max(PK)` 结果不正确的问题。此修复对应 [#83619](https://github.com/ClickHouse/ClickHouse/issues/83619)。[#88796](https://github.com/ClickHouse/ClickHouse/pull/88796)（[Amos Bird](https://github.com/amosbird)）。
* 修复在对内部表执行 `DROP` 时，`max_table_size_to_drop` 和 `max_partition_size_to_drop` 设置的大小限制未正确生效的问题。[#88812](https://github.com/ClickHouse/ClickHouse/pull/88812) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复了在仅以单个参数调用时 `top_k` 未遵循 threshold 参数的问题。关闭 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757)。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* 现在，需要使用 SSL 连接的 ArrowFlight 端点数据源（例如位于 AWS ALB 后面的端点）现已能够正确请求特定数据集。[#88868](https://github.com/ClickHouse/ClickHouse/pull/88868) ([alex-shchetkov](https://github.com/alex-shchetkov))。
* 修复对通过 ALTER 添加的未物化 Nested(Tuple(...)) 的处理逻辑。修复了 [#83133](https://github.com/ClickHouse/ClickHouse/issues/83133)。[#88879](https://github.com/ClickHouse/ClickHouse/pull/88879)（[Azat Khuzhin](https://github.com/azat)）。
* 修复函数 `reverseUTF8` 中的错误。在之前的版本中，该函数错误地反转了长度为 4 的 UTF-8 码点的字节顺序。本次修复关闭了 [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913)。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 icebergS3Cluster 协议。iceberg 集群函数现已支持模式演进、位置删除和等值删除。解决 [#88287](https://github.com/ClickHouse/ClickHouse/issues/88287)。[#88919](https://github.com/ClickHouse/ClickHouse/pull/88919)（[Yang Jiang](https://github.com/Ted-Jiang)）。
* 对在分布式表上使用并行副本的查询禁用 `parallel_replicas_support_projection`。修复 [#88899](https://github.com/ClickHouse/ClickHouse/issues/88899)。[#88922](https://github.com/ClickHouse/ClickHouse/pull/88922)（[zoomxi](https://github.com/zoomxi)）。
* 在内部 `cast` 操作中传播上下文。修复了多个未能传播 `cast` 设置的问题。已关闭 [#88873](https://github.com/ClickHouse/ClickHouse/issues/88873)。已关闭 [#78025](https://github.com/ClickHouse/ClickHouse/issues/78025)。[#88929](https://github.com/ClickHouse/ClickHouse/pull/88929)（[Manuel](https://github.com/raimannma)）。
* 修复在 `file()` 函数中通过 glob 模式获取文件格式的问题。解决了 [#88920](https://github.com/ClickHouse/ClickHouse/issues/88920)。[#88947](https://github.com/ClickHouse/ClickHouse/pull/88947)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 在使用 SQL SECURITY DEFINER 创建视图时，不再检查对 `SET DEFINER <current_user>:definer` 的访问权限。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968) ([pufit](https://github.com/pufit))。
* 修复了 `L2DistanceTransposed(vec1, vec2, p)` 中的 `LOGICAL_ERROR`，该错误出现在针对部分 `QBit` 读取的优化中：当 `p` 为 `Nullable` 时，错误地从返回类型中移除了 `Nullable`。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 修复在未知目录类型时发生的崩溃。解决了 [#88819](https://github.com/ClickHouse/ClickHouse/issues/88819)。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* 已关闭 [#88081](https://github.com/ClickHouse/ClickHouse/issues/88081)。[#88988](https://github.com/ClickHouse/ClickHouse/pull/88988)（[scanhex12](https://github.com/scanhex12)）。
* 修复了在分析 skipping 索引时出现的性能下降问题。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004) ([Anton Popov](https://github.com/CurtizJ)).
* 修复使用具有不存在角色的用户执行 clusterAllReplicas 时出现的 ACCESS&#95;ENTITY&#95;NOT&#95;FOUND 错误。解决了 [#87670](https://github.com/ClickHouse/ClickHouse/issues/87670)。[#89068](https://github.com/ClickHouse/ClickHouse/pull/89068) ([pufit](https://github.com/pufit))。
* 通过 `CHECK` 约束修复稀疏列的处理逻辑。Closes [#88637](https://github.com/ClickHouse/ClickHouse/issues/88637)。[#89076](https://github.com/ClickHouse/ClickHouse/pull/89076) ([Eduard Karacharov](https://github.com/korowa))。
* 修复在 MergeTreeReaderTextIndex 中填充虚拟列时行数统计错误，导致触发 LOGICAL&#95;ERROR 并引发崩溃的问题。[#89095](https://github.com/ClickHouse/ClickHouse/pull/89095) ([Peng Jian](https://github.com/fastio)).
* 在合并准备阶段发生异常时，防止 TTL 合并计数器泄漏。解决 [#89019](https://github.com/ClickHouse/ClickHouse/issues/89019)。[#89127](https://github.com/ClickHouse/ClickHouse/pull/89127)（[save-my-heart](https://github.com/save-my-heart)）。
* 修正 base32/base58 编码和解码操作所需缓冲区大小的计算。[#89133](https://github.com/ClickHouse/ClickHouse/pull/89133)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复 Distributed 中由于关闭过程与后台 INSERT 操作之间的竞争条件导致的释放后再次使用（use-after-free）问题。解决了 [#88640](https://github.com/ClickHouse/ClickHouse/issues/88640)。[#89136](https://github.com/ClickHouse/ClickHouse/pull/89136)（[Azat Khuzhin](https://github.com/azat)）。
* 在解析 Parquet 时避免由可变异常引起的潜在数据竞态问题。修复 [#88385](https://github.com/ClickHouse/ClickHouse/issues/88385)。[#89174](https://github.com/ClickHouse/ClickHouse/pull/89174)（[Azat Khuzhin](https://github.com/azat)）。
* 可刷新物化视图：修复了在刷新期间如果源表被完全删除时会导致的罕见服务器崩溃问题。 [#89203](https://github.com/ClickHouse/ClickHouse/pull/89203) ([Michael Kolupaev](https://github.com/al13n321)).
* 在通过 HTTP 接口传输的压缩流中途发送错误时刷新缓冲区。 [#89256](https://github.com/ClickHouse/ClickHouse/pull/89256) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 防止查询掩码规则被错误地应用到 DDL 语句上。[#89272](https://github.com/ClickHouse/ClickHouse/pull/89272) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复了在 MergeTreeReaderTextIndex 中填充虚拟列时行数统计错误导致触发 LOGICAL&#95;ERROR 崩溃的问题。重新打开 [#89095](https://github.com/ClickHouse/ClickHouse/issues/89095)。[#89303](https://github.com/ClickHouse/ClickHouse/pull/89303)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复 Statistics 的 countmin 对 LowCardinality(Nullable(String)) 的 estimate 数据类型不支持而导致的 LOGICAL&#95;ERROR。 [#89343](https://github.com/ClickHouse/ClickHouse/pull/89343) ([Han Fei](https://github.com/hanfei1991)).
* 在 IN 函数中，如果主键列的类型与 IN 函数右侧的列类型不同，可能会发生崩溃或出现未定义行为。示例：SELECT string&#95;column, int&#95;column FROM test&#95;table WHERE (string&#95;column, int&#95;column) IN (SELECT &#39;5&#39;, &#39;not a number&#39;)。当选出的行很多且其中包含类型不兼容的行时会出现该问题。[#89367](https://github.com/ClickHouse/ClickHouse/pull/89367) ([Ilya Golshtein](https://github.com/ilejn)).
* 修复 `countIf(*)` 的参数被截断的问题。关闭 [#89372](https://github.com/ClickHouse/ClickHouse/issues/89372)。[#89373](https://github.com/ClickHouse/ClickHouse/pull/89373)（[Manuel](https://github.com/raimannma)）。
* 避免在变更操作统计信息中丢失未压缩的校验和。[#89381](https://github.com/ClickHouse/ClickHouse/pull/89381) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `L2DistanceTransposed(vec1, vec2, p)` 中的 `LOGICAL_ERROR`，此前针对部分 QBit 读取的优化在 `p` 为 `LowCardinality(Nullable(T))` 时错误地从返回类型中移除了 `Nullable`。解决了 [#88362](https://github.com/ClickHouse/ClickHouse/issues/88362)。[#89397](https://github.com/ClickHouse/ClickHouse/pull/89397)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 修复加载由较早版本的 ClickHouse 写入、在元组本身上采用不正确稀疏序列化的表时的问题。 [#89405](https://github.com/ClickHouse/ClickHouse/pull/89405) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在使用 `deduplicate_merge_projection_mode='ignore'` 时，对被 TTL 清空但仍包含非空投影的 part 的合并处理不正确的问题。解决了 [#89430](https://github.com/ClickHouse/ClickHouse/issues/89430)。[#89458](https://github.com/ClickHouse/ClickHouse/pull/89458)（[Amos Bird](https://github.com/amosbird)）。
* 修复在存在重复列时 `full_sorting_merge` 连接中的逻辑错误。解决了 [#86957](https://github.com/ClickHouse/ClickHouse/issues/86957)。[#89495](https://github.com/ClickHouse/ClickHouse/pull/89495)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复 Keeper 在启动时读取变更日志的逻辑，以处理在轮换过程中某个变更日志未被正确重命名的情况。[#89496](https://github.com/ClickHouse/ClickHouse/pull/89496) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复在使用 OR 条件且右表键唯一时产生的错误 JOIN 结果。解决 [#89391](https://github.com/ClickHouse/ClickHouse/issues/89391)。[#89512](https://github.com/ClickHouse/ClickHouse/pull/89512)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复在使用 analyzer 且 PK IN (subquery) (v2) 时可能出现的 “Context has expired” 错误。修复 [#89433](https://github.com/ClickHouse/ClickHouse/issues/89433)。[#89527](https://github.com/ClickHouse/ClickHouse/pull/89527)（[Azat Khuzhin](https://github.com/azat)）。
* 修复 MaterializedPostgreSQL 在包含大写列名的表上的复制问题。解决了 [#72363](https://github.com/ClickHouse/ClickHouse/issues/72363)。[#89530](https://github.com/ClickHouse/ClickHouse/pull/89530)（[Danylo Osipchuk](https://github.com/Lenivaya)）。
* 修复当聚合函数的状态中包含 `LowCardinality(String)` 列的序列化值时可能发生的崩溃。[#89550](https://github.com/ClickHouse/ClickHouse/pull/89550) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在启用 `enable_lazy_columns_replication` 设置时，在 JOIN 右侧使用 `ARRAY JOIN` 会导致崩溃的问题。[#89551](https://github.com/ClickHouse/ClickHouse/pull/89551) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `query_plan_convert_join_to_in` 的逻辑错误。解决了 [#89066](https://github.com/ClickHouse/ClickHouse/issues/89066)。[#89554](https://github.com/ClickHouse/ClickHouse/pull/89554)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了统计估算器在尝试估算包含列与常量类型不匹配且无法转换的条件时抛出的异常。 [#89596](https://github.com/ClickHouse/ClickHouse/pull/89596) ([Han Fei](https://github.com/hanfei1991)).
* 仅针对当前受支持的连接算法（即哈希连接）添加运行时过滤器。只有当连接算法先完整读取右侧，再读取左侧时，才能构建过滤器，但例如 FullSortingMergeJoin 会同时读取两侧。修复 [#89220](https://github.com/ClickHouse/ClickHouse/issues/89220)。[#89652](https://github.com/ClickHouse/ClickHouse/pull/89652)（[Alexander Gololobov](https://github.com/davenger)）。
* 修复在使用 `sparseGrams` 分词器时并发执行 `hasAnyTokens`、`hasAllTokens` 和 `tokens` 函数所导致的问题。解决了 [#89605](https://github.com/ClickHouse/ClickHouse/issues/89605)。[#89665](https://github.com/ClickHouse/ClickHouse/pull/89665) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 修复了在某些情况下使用 JOIN 运行时过滤器时出现的逻辑错误/崩溃问题。修复了 [#89062](https://github.com/ClickHouse/ClickHouse/issues/89062)。[#89666](https://github.com/ClickHouse/ClickHouse/pull/89666)（[Alexander Gololobov](https://github.com/davenger)）。
* 修复在启用 `enable_lazy_columns_replication` 时，对 Map 列执行 ARRAY JOIN 时可能出现的逻辑错误。修复 [#89705](https://github.com/ClickHouse/ClickHouse/issues/89705)。[#89717](https://github.com/ClickHouse/ClickHouse/pull/89717)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在取消远程查询时，避免在断开连接后继续从远程服务器读取而导致崩溃。修复了 [#89468](https://github.com/ClickHouse/ClickHouse/issues/89468)。[#89740](https://github.com/ClickHouse/ClickHouse/pull/89740)（[Azat Khuzhin](https://github.com/azat)）。
* 修复投影索引读取路径中的竞态条件。解决 [#89497](https://github.com/ClickHouse/ClickHouse/issues/89497)。[#89762](https://github.com/ClickHouse/ClickHouse/pull/89762)（[Peng Jian](https://github.com/fastio)）。
* 修复在读取 projection 索引时可能导致竞态条件的 bug。解决了 [#89497](https://github.com/ClickHouse/ClickHouse/issues/89497)。[#89775](https://github.com/ClickHouse/ClickHouse/pull/89775)（[Amos Bird](https://github.com/amosbird)）。
* 修复了对无分区表使用 Paimon 表函数时的处理逻辑。解决了 [#89690](https://github.com/ClickHouse/ClickHouse/issues/89690)。[#89793](https://github.com/ClickHouse/ClickHouse/pull/89793)（[JIaQi](https://github.com/JiaQiTang98)）。
* 修复在高级 JSON 共享数据序列化中读取路径及其子列时可能出现的逻辑错误。解决 [#89805](https://github.com/ClickHouse/ClickHouse/issues/89805)。[#89819](https://github.com/ClickHouse/ClickHouse/pull/89819)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了数据类型在二进制反序列化过程中的潜在栈溢出问题。关闭了 [#88710](https://github.com/ClickHouse/ClickHouse/issues/88710)。[#89822](https://github.com/ClickHouse/ClickHouse/pull/89822)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 `IN` 函数在处理空元组时的逻辑错误。关闭 [#88343](https://github.com/ClickHouse/ClickHouse/issues/88343)。[#89850](https://github.com/ClickHouse/ClickHouse/pull/89850)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 在旧版解析器中，为了兼容性，无论 `optimize_injective_functions_in_group_by` 设置为何值，都移除 `GROUP BY` 中的单射函数。解决 [#89854](https://github.com/ClickHouse/ClickHouse/issues/89854)。[#89870](https://github.com/ClickHouse/ClickHouse/pull/89870)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 如果合并因某些原因中断，例如触发了内存限制，`merge mutate background executor` 会在未加锁的情况下对合并任务调用 `cancel`，但在这种情况下，部分生成的结果分片不会被删除（因为它尚未完成，并且在该阶段不可见）。之后，合并任务会被销毁，从而触发结果分片的销毁。这样会回滚磁盘事务，并导致数据从 S3 中被删除。最终，这一垃圾清理过程是在持有 `merge mutate background executor` 锁的情况下执行的。 [#89875](https://github.com/ClickHouse/ClickHouse/pull/89875) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 修复了在 `reverse` 和 `CAST` 函数中处理空元组时的逻辑错误，并关闭了 [#89137](https://github.com/ClickHouse/ClickHouse/issues/89137)。[#89908](https://github.com/ClickHouse/ClickHouse/pull/89908)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 现在 ClickHouse 在默认情况下会在 `SHOW DATABASES` 查询中显示数据湖目录数据库。[#89914](https://github.com/ClickHouse/ClickHouse/pull/89914) ([alesapin](https://github.com/alesapin)).
* 修复在 GCS 上进行备份时使用原生复制的问题。由于客户端克隆实现不正确，GCS 原生复制总是失败，并降级为通过手动读写数据的次优方式。[#89923](https://github.com/ClickHouse/ClickHouse/pull/89923) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 `base32Encode` 的缓冲区大小计算。对长度小于 5 的字符串列计算 `base32Encode` 时可能会导致崩溃。修复了 [#89911](https://github.com/ClickHouse/ClickHouse/issues/89911)。[#89929](https://github.com/ClickHouse/ClickHouse/pull/89929)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复 `SHOW COLUMNS` 和 `SHOW FUNCTIONS` 查询中的错误转义。[#89942](https://github.com/ClickHouse/ClickHouse/pull/89942) ([alesapin](https://github.com/alesapin)).
* 修复 MongoDB 引擎中当用户名包含 &#39;@&#39; 字符时的 URL 验证问题。此前，由于编码不当，包含 &#39;@&#39; 的用户名会导致错误。[#89970](https://github.com/ClickHouse/ClickHouse/pull/89970) ([Kai Zhu](https://github.com/nauu))。
* 已在 [#90592](https://github.com/ClickHouse/ClickHouse/issues/90592) 中回溯：修复在远程查询中，当在 `IN` 内部使用 `ARRAY JOIN` 且启用了 `enable_lazy_columns_replication` 设置时可能发生的崩溃问题。解决了 [#90361](https://github.com/ClickHouse/ClickHouse/issues/90361)。[#89997](https://github.com/ClickHouse/ClickHouse/pull/89997)（[Pavel Kruglov](https://github.com/Avogar)）。
* 已在 [#90448](https://github.com/ClickHouse/ClickHouse/issues/90448) 中回溯移植：在某些情况下修复了从文本格式的字符串推断出错误 DateTime64 值的问题。解决了 [#89368](https://github.com/ClickHouse/ClickHouse/issues/89368)。[#90013](https://github.com/ClickHouse/ClickHouse/pull/90013)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 `BSONEachRow` 和 `MsgPack` 中由空 tuple 列引起的逻辑错误。关闭 [#89814](https://github.com/ClickHouse/ClickHouse/issues/89814)。关闭 [#71536](https://github.com/ClickHouse/ClickHouse/issues/71536)。[#90018](https://github.com/ClickHouse/ClickHouse/pull/90018)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 已在 [#90457](https://github.com/ClickHouse/ClickHouse/issues/90457) 中回溯移植：在从聚合状态和其他来源反序列化数据时进行大小检查。[#90031](https://github.com/ClickHouse/ClickHouse/pull/90031)（[Raúl Marín](https://github.com/Algunenano)）。
* 修复在包含重复列的 JOIN 中可能出现的 “Invalid number of rows in Chunk” 错误。解决了 [#89411](https://github.com/ClickHouse/ClickHouse/issues/89411)。[#90053](https://github.com/ClickHouse/ClickHouse/pull/90053) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 已在 [#90588](https://github.com/ClickHouse/ClickHouse/issues/90588) 中回溯：修复了在启用 `enable_lazy_columns_replication` 设置并使用 `ARRAY JOIN` 进行插入时可能出现的错误 `Column with Array type is not represented by ColumnArray column: Replicated`。[#90066](https://github.com/ClickHouse/ClickHouse/pull/90066)（[Pavel Kruglov](https://github.com/Avogar)）。
* 允许 user&#95;files 中的文件以点开头。修复 [#89662](https://github.com/ClickHouse/ClickHouse/issues/89662)。[#90079](https://github.com/ClickHouse/ClickHouse/pull/90079)（[Raúl Marín](https://github.com/Algunenano)）。
* 已在 [#90647](https://github.com/ClickHouse/ClickHouse/issues/90647) 中完成回溯移植：修复在使用较大步长时，`numbers` 系统表中的逻辑错误和取模错误，并关闭 [#83398](https://github.com/ClickHouse/ClickHouse/issues/83398)。[#90123](https://github.com/ClickHouse/ClickHouse/pull/90123)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复了字典参数解析中的整数溢出问题。关闭 [#78506](https://github.com/ClickHouse/ClickHouse/issues/78506)。[#90171](https://github.com/ClickHouse/ClickHouse/pull/90171)（[Raúl Marín](https://github.com/Algunenano)）。
* 已在 [#90468](https://github.com/ClickHouse/ClickHouse/issues/90468) 中回溯集成：修复 Hive 分区不兼容问题，避免在 25.8 版本升级时出现问题（修复升级过程中出现的 `All hive partitioning columns must be present in the schema` 错误）。[#90202](https://github.com/ClickHouse/ClickHouse/pull/90202)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了在启用查询条件缓存时，`SELECT` 查询在轻量级更新之后可能返回错误查询结果的问题。修复了 [#90176](https://github.com/ClickHouse/ClickHouse/issues/90176)。修复了 [#90054](https://github.com/ClickHouse/ClickHouse/issues/90054)。[#90204](https://github.com/ClickHouse/ClickHouse/pull/90204)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在解析格式错误的分片目录名称时导致 StorageDistributed 崩溃的问题。 [#90243](https://github.com/ClickHouse/ClickHouse/pull/90243) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* 在 `LogicalExpressionOptimizerPass` 中处理字符串向整数或布尔值的隐式转换。修复 [#89803](https://github.com/ClickHouse/ClickHouse/issues/89803)。[#90245](https://github.com/ClickHouse/ClickHouse/pull/90245)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复表定义中某些 skip 索引格式不正确的问题，该问题会导致 `METADATA_MISMATCH`，并阻止在 Replicated Database 中创建新副本。[#90251](https://github.com/ClickHouse/ClickHouse/pull/90251)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 已在 [#90381](https://github.com/ClickHouse/ClickHouse/issues/90381) 中回溯修复：修复当某个 part 中的行数少于 `index_granularity` 时，`MergeTreeReaderIndex` 中行数不匹配的问题。解决 [#89691](https://github.com/ClickHouse/ClickHouse/issues/89691)。[#90254](https://github.com/ClickHouse/ClickHouse/pull/90254)（[Peng Jian](https://github.com/fastio)）。
* 在 [#90608](https://github.com/ClickHouse/ClickHouse/issues/90608) 中进行了回溯移植：修复了在 compact 部分中从 JSON 读取子列时可能导致 `CANNOT_READ_ALL_DATA` 错误的 bug。解决 [#90264](https://github.com/ClickHouse/ClickHouse/issues/90264)。[#90302](https://github.com/ClickHouse/ClickHouse/pull/90302)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 `trim`、`ltrim`、`rtrim` 函数在使用两个参数时不起作用的问题。修复了 [#90170](https://github.com/ClickHouse/ClickHouse/issues/90170)。[#90305](https://github.com/ClickHouse/ClickHouse/pull/90305)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 已在 [#90625](https://github.com/ClickHouse/ClickHouse/issues/90625) 中回溯：修正 `index_granularity_bytes=0` 时，`prewhere` 中针对不存在的 JSON 路径可能出现的逻辑错误。解决 [#86924](https://github.com/ClickHouse/ClickHouse/issues/86924)。[#90375](https://github.com/ClickHouse/ClickHouse/pull/90375)（[Pavel Kruglov](https://github.com/Avogar)）。
* 已在 [#90484](https://github.com/ClickHouse/ClickHouse/issues/90484) 中回溯：修复了 `L2DistanceTransposed` 中的一个 bug，当 `precision` 参数超出有效范围时会导致崩溃。已关闭 [#90401](https://github.com/ClickHouse/ClickHouse/issues/90401)。[#90405](https://github.com/ClickHouse/ClickHouse/pull/90405)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 已在 [#90577](https://github.com/ClickHouse/ClickHouse/issues/90577) 中回溯：修正了在 `L2DistanceTransposed` 中，当使用数组引用向量（默认类型为 `Array(Float64))`）与元素类型为非 `Float64`（如 `Float32`、`BFloat16`）的 `QBit` 列一起使用时的距离计算错误。该函数现在会自动将引用向量转换为与 `QBit` 的元素类型一致。解决了 [#89976](https://github.com/ClickHouse/ClickHouse/issues/89976)。[#90485](https://github.com/ClickHouse/ClickHouse/pull/90485)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 已在 [#90601](https://github.com/ClickHouse/ClickHouse/issues/90601) 中回溯移植：修复 `equals` 函数在极少数情况下导致的逻辑错误。关闭 [#88142](https://github.com/ClickHouse/ClickHouse/issues/88142)。[#90557](https://github.com/ClickHouse/ClickHouse/pull/90557)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 修复针对 `Tuple` 类型的 `CoalescingMergeTree`。 [#88828](https://github.com/ClickHouse/ClickHouse/pull/88828) ([scanhex12](https://github.com/scanhex12)).

#### 构建/测试/打包改进

* 修复在 Docker 中运行带有 initdb SQL 脚本且重写了 TCP 端口的 ClickHouse 时出现的 “Connection refused” 错误。[#88042](https://github.com/ClickHouse/ClickHouse/pull/88042) ([Grigorii](https://github.com/GSokol)).
* 试验性支持 e2k 作为 ClickHouse 的新平台。[#90159](https://github.com/ClickHouse/ClickHouse/pull/90159) ([Ramil Sattarov](https://github.com/r-a-sattarov)).
* 从 CMake 中移除剩余的 `FindPackage` 用法。构建过程不应依赖系统软件包。[#89380](https://github.com/ClickHouse/ClickHouse/pull/89380) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 CMake 配置阶段的构建中使用编译器缓存（例如用于 `protoc`）。[#89613](https://github.com/ClickHouse/ClickHouse/pull/89613) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 FreeBSD 13.4 sysroot。[#89617](https://github.com/ClickHouse/ClickHouse/pull/89617) ([Konstantin Bogdanov](https://github.com/thevar1able)).

### ClickHouse 25.10 发行版，2025-10-31 {#2510}

#### 不向后兼容的变更

* 将默认的 `schema_inference_make_columns_nullable` 设置修改为根据 Parquet/ORC/Arrow 元数据中的列 `Nullable` 信息来决定是否可为空，而不是将所有列都设为 Nullable。对文本格式无变化。[#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321)).
* 查询结果缓存现在会忽略 `log_comment` 设置，因此仅在查询中更改 `log_comment` 将不再被视为强制缓存未命中。存在一种小概率情况，即用户可能有意通过改变 `log_comment` 来对缓存进行分段。此更改会改变该行为，因此与之前版本不兼容。请使用 `query_cache_tag` 设置来实现这一目的。 [#79878](https://github.com/ClickHouse/ClickHouse/pull/79878) ([filimonov](https://github.com/filimonov)).
* 在之前的版本中，对包含与运算符实现函数同名的表函数的查询，其格式化结果不一致。修复了 [#81601](https://github.com/ClickHouse/ClickHouse/issues/81601)。修复了 [#81977](https://github.com/ClickHouse/ClickHouse/issues/81977)。修复了 [#82834](https://github.com/ClickHouse/ClickHouse/issues/82834)。修复了 [#82835](https://github.com/ClickHouse/ClickHouse/issues/82835)。EXPLAIN SYNTAX 查询将不会总是对运算符进行格式化——新的行为更好地体现了“解释语法”这一目的。`clickhouse-format`、`formatQuery` 及类似工具在查询中以函数调用形式使用这些运算符实现函数时，将不会再把它们格式化为运算符。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止在 `JOIN` 键中使用 `Dynamic` 类型。当 `Dynamic` 类型的值与非 `Dynamic` 类型的值进行比较时，可能会导致意外结果。最好将 `Dynamic` 列转换为所需的类型。[#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` 服务器选项默认开启，目前无法关闭。这是一个向后兼容的变更，仅供注意。此变更仅与 25.x 版本向前兼容。这意味着，如果你需要回滚到旧版本，只能降级到 25.x 系列中的任意版本。[#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema))。
* 将 `replicated_deduplication_window_seconds` 从一周降低到一小时，以便在插入速率较低时减少在 ZooKeeper 上存储的 znode 数量。[#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema))。
* 将设置 `query_plan_use_new_logical_join_step` 重命名为 `query_plan_use_logical_join_step`。[#87679](https://github.com/ClickHouse/ClickHouse/pull/87679)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 新的语法使文本索引的 tokenizer 参数配置更加灵活。[#87997](https://github.com/ClickHouse/ClickHouse/pull/87997)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 将函数 `searchAny` 和 `searchAll` 重命名为 `hasAnyTokens` 和 `hasAllTokens`，以更好地与现有函数 `hasToken` 保持一致。[#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze))。
* 从文件系统缓存中移除 `cache_hits_threshold`。该特性是在我们引入 SLRU 缓存策略之前由一位外部贡献者添加的，而现在我们已经有了 SLRU 缓存策略，再同时支持这两者就没有意义了。[#88344](https://github.com/ClickHouse/ClickHouse/pull/88344)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 对 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert` 设置的行为做了两处小改动：- 使用未预留（unreserved）字节而不是可用（available）字节来决定是否应拒绝一次插入。如果针对后台合并（background merges）和变更（mutations）的预留空间相对于配置的阈值来说很小，这一点可能并不关键，但这样更为准确。- 不再将这些设置应用于 system 表。这样做的原因是我们仍然希望像 `query_log` 这样的表能够被更新，这对调试非常有帮助。写入 system 表的数据通常相对于实际数据来说很小，因此在合理的 `min_free_disk_ratio_to_perform_insert` 阈值下，它们应该能够在更长时间内继续写入。[#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end)).
* 为 Keeper 的内部复制启用异步模式。Keeper 在保持原有行为不变的同时，有望带来性能提升。如果你是从 23.9 之前的版本升级，则需要先升级到 23.9+，然后再升级到 25.10+。你也可以在升级前将 `keeper_server.coordination_settings.async_replication` 设置为 0，并在升级完成后再将其启用。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515) ([Antonio Andelic](https://github.com/antonio2368))。

#### 新功能

* 新增对负值 `LIMIT` 和负值 `OFFSET` 的支持。修复了 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913)。[#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` 引擎会创建指向另一张表的代理。所有读写操作都会被转发到目标表，而别名本身不存储任何数据，只维护对目标表的引用。[#87965](https://github.com/ClickHouse/ClickHouse/pull/87965)（[Kai Zhu](https://github.com/nauu)）。
* 已全面支持运算符 `IS NOT DISTINCT FROM`（`<=>`）。[#88155](https://github.com/ClickHouse/ClickHouse/pull/88155)（[simonmichal](https://github.com/simonmichal)）。
* 增加了在所有适用的 `MergeTree` 表的列上自动创建统计信息的功能。新增了表级设置 `auto_statistics_types`，用于存储要创建的统计信息类型（以逗号分隔，例如 `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ))。
* 新的文本布隆过滤器索引 `sparse_gram`。[#79985](https://github.com/ClickHouse/ClickHouse/pull/79985)（[scanhex12](https://github.com/scanhex12)）。
* 新增 `conv` 函数用于在不同进制之间转换数字，目前支持的进制范围为 `2 到 36`。[#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator))。
* 新增对 `LIMIT BY ALL` 语法的支持。类似于 `GROUP BY ALL` 和 `ORDER BY ALL`，`LIMIT BY ALL` 会自动展开为将 SELECT 子句中所有非聚合表达式用作 LIMIT BY 键。例如，`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` 等价于 `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name`。当需要按所有已选择的非聚合列进行限制而又不想显式列出它们时，此特性能简化查询。修复并关闭了 [#59152](https://github.com/ClickHouse/ClickHouse/issues/59152)。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* 支持在 ClickHouse 中查询 Apache Paimon。此集成将使 ClickHouse 用户能够直接与 Paimon 的数据湖存储交互。[#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* 新增了 `studentTTestOneSample` 聚合函数。[#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 聚合函数 `quantilePrometheusHistogram`，其参数为直方图桶的上界和累积值，并在包含所求分位数位置的桶内，在该桶的上、下界之间执行线性插值。其行为与 PromQL 中针对经典直方图的 `histogram_quantile` 函数类似。[#86294](https://github.com/ClickHouse/ClickHouse/pull/86294)（[Stephen Chi](https://github.com/stephchi0)）。
* 新增用于 Delta Lake 元数据文件的系统表。[#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12)).
* 添加 `ALTER TABLE REWRITE PARTS` 语句——使用所有新的设置从头重写表的各个数据 part（因为有些设置，例如 `use_const_adaptive_granularity`，只会应用于新的 part）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* 添加 `SYSTEM RECONNECT ZOOKEEPER` 命令，用于强制 ZooKeeper 断开并重新连接（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* 通过设置 `max_named_collection_num_to_warn` 和 `max_named_collection_num_to_throw` 来限制命名集合的数量。新增度量指标 `NamedCollection` 和错误 `TOO_MANY_NAMED_COLLECTIONS`。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos)).
* 添加了经过优化的 `startsWith` 和 `endsWith` 函数的不区分大小写变体：`startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8` 和 `endsWithCaseInsensitiveUTF8`。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang))。
* 添加了一种方式，可在 SQL 中通过服务器配置的 &quot;resources&#95;and&#95;workloads&quot; 部分提供 `WORKLOAD` 和 `RESOURCE` 定义。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa))。
* 新增一个名为 `min_level_for_wide_part` 的表设置，用于指定将某个 part 创建为 wide part 所需的最小 level。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm)).
* 在 Keeper 客户端中新增 `cp`-`cpr` 和 `mv`-`mvr` 命令的递归版本。[#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 添加了会话级设置，用于指定在插入时不进行物化的 skip 索引列表（`exclude_materialize_skip_indexes_on_insert`）。添加了 MergeTree 表级设置，用于指定在合并期间不进行物化的 skip 索引列表（`exclude_materialize_skip_indexes_on_merge`）。[#87252](https://github.com/ClickHouse/ClickHouse/pull/87252)（[George Larionov](https://github.com/george-larionov)）。

#### 实验性功能

* 实现了以比特切片格式存储向量的 `QBit` 数据类型，以及用于近似向量搜索的 `L2DistanceTransposed` 函数，其精度与速度的权衡由一个参数控制。[#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath))。
* `searchAll` 和 `searchAny` 函数现在可以用于不包含文本列的列。在这些情况下，它们会使用默认分词器。[#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus))。

#### 性能优化

* 在 JOIN 和 ARRAY JOIN 中实现惰性列复制。在某些输出格式中，避免将 Sparse 和 Replicated 等特殊列表示形式转换为完整列，从而避免在内存中进行不必要的数据拷贝。[#88752](https://github.com/ClickHouse/ClickHouse/pull/88752)（[Pavel Kruglov](https://github.com/Avogar)）。
* 为 MergeTree 表中的顶层 String 列添加可选的 `.size` 子列序列化，以提高压缩率并实现对子列的高效访问。引入新的 MergeTree 设置项，用于序列化版本控制以及对空字符串的表达式优化。[#82850](https://github.com/ClickHouse/ClickHouse/pull/82850)（[Amos Bird](https://github.com/amosbird)）。
* 支持 Iceberg 的顺序读取。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 通过在运行时从右侧子树构建 Bloom 过滤器，并将该过滤器传递给左侧子树中的扫描操作，可加速部分 JOIN 查询。这对于如下查询可能有益：`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'`。 [#84772](https://github.com/ClickHouse/ClickHouse/pull/84772) ([Alexander Gololobov](https://github.com/davenger))。
* 通过重构查询条件缓存（Query Condition Cache，QCC）与索引分析的顺序和集成方式，提升了查询性能。现在会在主键和跳过索引分析之前先应用 QCC 过滤，从而减少不必要的索引计算。索引分析已扩展为支持多个范围过滤，其过滤结果现在也会回写到 QCC 中。这显著加速了在执行时间中索引分析占主导的查询——尤其是那些依赖跳过索引（例如向量索引或倒排索引）的查询。[#82380](https://github.com/ClickHouse/ClickHouse/pull/82380)（[Amos Bird](https://github.com/amosbird)）。
* 多项微小优化，用于加速小型查询。[#83096](https://github.com/ClickHouse/ClickHouse/pull/83096)（[Raúl Marín](https://github.com/Algunenano)）。
* 在原生协议中压缩日志和 profile 事件。在具有 100+ 副本的集群上，未压缩的 profile 事件会占用 1..10 MB/秒，并且在网络连接较慢时进度条会变得很慢。这解决了 [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533)。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过使用 [StringZilla](https://github.com/ashvardanian/StringZilla) 库，在可用时利用 SIMD CPU 指令，提升区分大小写的字符串搜索（如 `WHERE URL LIKE '%google%'` 之类的过滤操作）的性能。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* 在对包含类型为 `SimpleAggregateFunction(anyLast)` 的列的 AggregatingMergeTree 表使用 FINAL 进行查询时，减少内存分配和内存拷贝。[#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94))。
* 提供了将 JOIN 谓词中的析取（OR）条件下推的逻辑。例如：在 TPC-H Q7 中，对于两个表 n1 和 n2 上的条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')`，我们为每个表分别提取部分过滤条件：对于 n1 提取 `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`，对于 n2 提取 `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'`。[#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 通过启用新的默认设置 `optimize_rewrite_like_perfect_affix`，提升带前缀或后缀匹配的 `LIKE` 表达式性能。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 修复在按多个字符串/数字列进行分组时，由于序列化键过大导致的性能下降问题。这是对 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) 的后续改进。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 新增 `joined_block_split_single_row` 设置，用于在每个键对应大量匹配项的哈希连接中降低内存使用。这样即使是单个左表行的所有匹配结果，也可以被拆分成多个块，这在左表一行匹配右表成千上万甚至数百万行时尤其有用。之前，所有匹配项都必须一次性在内存中物化。该改动可降低峰值内存占用，但可能会增加 CPU 开销。[#87913](https://github.com/ClickHouse/ClickHouse/pull/87913)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 改进 SharedMutex，在大量并发查询场景下提升性能。[#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano))。
* 针对主要由低频 token 构成的文档，提升了构建文本索引的性能。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ))。
* 加速 `Field` 析构函数的常见路径（在大量小型查询场景下提升性能）。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* 在 JOIN 优化过程中跳过对运行时哈希表统计信息的重新计算（提升所有包含 JOIN 的查询的性能）。新增 profile 事件 `JoinOptimizeMicroseconds` 和 `QueryPlanOptimizeMicroseconds`。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在 MergeTreeLazy 读取器中启用将标记保存在缓存中，并避免直接进行 IO 操作。这样可以提升带有 ORDER BY 且 LIMIT 较小的查询性能。[#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat))。
* 在带有 `is_deleted` 列的 `ReplacingMergeTree` 表上使用 `FINAL` 子句的 SELECT 查询现在执行得更快，这是因为对两项现有优化的并行化进行了改进：1. 对仅包含单个 `part` 的分区应用 `do_not_merge_across_partitions_select_final` 优化；2. 将表中其他选中的范围拆分为 `intersecting / non-intersecting`，且只有相交的范围需要经过 `FINAL` 合并转换。[#88090](https://github.com/ClickHouse/ClickHouse/pull/88090)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 降低未使用 fail point 时（调试未启用时的默认代码路径）的影响。[#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* 避免在按 `uuid` 过滤时对 `system.tables` 进行全表扫描（当你只从日志或 ZooKeeper 路径中获得 UUID 时，这会很有用）。[#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat))。
* 优化了函数 `tokens`、`hasAllTokens`、`hasAnyTokens` 的性能。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 内联 `AddedColumns::appendFromBlock`，以在某些情况下略微提升 JOIN 性能。[#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat))。
* 通过使用 `system.completions` 而不是执行多个 system 表的查询，可以让客户端自动补全更快且更一致。[#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m))。
* 添加新的 `dictionary_block_frontcoding_compression` 文本索引参数，用于控制字典压缩。默认情况下，该参数处于启用状态，并使用 `front-coding` 压缩。[#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 在插入到物化视图之前，会根据 `min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views` 设置，先将来自所有线程的数据进行合并。此前，如果启用了 `parallel_view_processing`，则每个线程在向某个特定物化视图插入数据时都会独立进行合并，这可能会导致生成的分片数量更多。[#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368))。
* 添加 `temporary_files_buffer_size` 设置，以控制临时文件写入器的缓冲区大小。* 优化 `scatter` 操作在 `LowCardinality` 列上的内存消耗（例如在 Grace Hash Join 中使用时）。[#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 增加了通过并行副本直接读取文本索引的支持。提升了从对象存储读取文本索引时的性能。[#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* 对 Data Lakes 目录中表的查询将使用并行副本进行分布式处理。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* 用于调优后台合并算法的内部启发式规则，名为 &quot;to&#95;remove&#95;small&#95;parts&#95;at&#95;right&quot;，将在计算合并区间得分之前执行。在此之前，合并选择器会选择一个宽范围的合并，而在此之后，它会过滤其后缀。修复：[#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736)（[Mikhail Artemenko](https://github.com/Michicosun)）。

#### 改进

* 现在，函数 `generateSerialID` 已支持为序列名称使用非常量参数。关闭了 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750)。[#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 `generateSerialID` 函数新增了可选的 `start_value` 参数，用于为新序列指定自定义起始值。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma)).
* 在 `clickhouse-format` 中新增 `--semicolons_inline` 选项，用于在格式化查询时将分号放在最后一行末尾，而不是单独换行。[#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan))。
* 在 Keeper 中覆盖配置时，支持配置服务器级限流。关闭 [#73964](https://github.com/ClickHouse/ClickHouse/issues/73964)。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066)（[JIaQi](https://github.com/JiaQiTang98)）。
* `mannWhitneyUTest` 在两个样本都只包含相同值时不再抛出异常。现在会返回一个有效结果，与 SciPy 保持一致。这解决了：[#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009)（[DeanNeaht](https://github.com/DeanNeaht)）。
* 在提交元数据事务后，重写磁盘对象存储的事务会删除之前的远程 blob。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema))。
* 修复了在对冗余相等表达式进行优化时，当优化前后结果类型的 `LowCardinality` 不一致时的优化过程。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 当 HTTP 客户端在设置 `Expect: 100-continue` 的同时额外设置请求头 `X-ClickHouse-100-Continue: defer` 时，ClickHouse 在配额验证通过之前不会向客户端发送 `100 Continue` 响应，从而避免为那些最终会被丢弃的请求体白白浪费网络带宽。这主要适用于 INSERT 查询，此时查询本身可以通过 URL 查询字符串发送，而数据则放在请求体中。如果在未发送完整请求体之前中止请求，将会阻止在 HTTP/1.1 中复用该连接，但为建立新连接所引入的额外延迟，相比在处理大批量数据的 INSERT 时的总耗时而言通常可以忽略不计。 [#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end))。
* 在使用基于 S3 存储的 `DATABASE ENGINE = Backup` 时，对日志中的 S3 凭证进行掩码处理。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* 通过推迟对其进行物化，使查询计划优化对关联子查询的输入子计划可见。属于 [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890)。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* 对 `SYSTEM DROP DATABASE REPLICA` 的变更： - 当连同数据库一起删除或删除整个副本时：现在还会为该数据库中的每个表删除副本 - 如果提供了 `WITH TABLES`：为每个存储删除副本 - 否则逻辑保持不变，仅删除数据库级别的副本 - 当使用 Keeper 路径删除数据库副本时： - 如果提供了 `WITH TABLES`： - 将数据库恢复为 `Atomic` - 根据 Keeper 中的语句恢复 RMT 表 - 删除该数据库（恢复的表也会被删除） - 否则，仅在提供的 Keeper 路径上删除副本。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在包含 `materialize` 函数时 TTL 格式不一致的问题。解决了 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg 表的状态不再存储在存储对象中。这应当使 ClickHouse 中的 Iceberg 能够安全支持并发查询。[#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik))。
* 将 S3Queue 有序模式下的 bucket 锁改为持久化模式，类似于在 `use_persistent_processing_nodes = 1` 情况下的 processing nodes。在测试中加入 Keeper 故障注入。 [#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当用户在格式名称中出现拼写错误时提供提示。修复 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761)。[#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* 当不存在任何 projection 时，远程副本将跳过索引分析。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi))。
* 允许禁用 ytsaurus 表的 UTF-8 编码。[#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 默认禁用 `s3_slow_all_threads_after_retryable_error`。 [#87198](https://github.com/ClickHouse/ClickHouse/pull/87198) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 将表函数 `arrowflight` 重命名为 `arrowFlight`。[#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar))。
* 更新了 `clickhouse-benchmark`，使其在命令行参数中可以使用 `-` 替代 `_`。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda)).
* 在信号处理期间，将对 `system.crash_log` 的刷新改为同步执行。 [#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 新增了设置 `inject_random_order_for_select_without_order_by`，会在缺少 `ORDER BY` 子句的顶层 `SELECT` 查询中自动注入 `ORDER BY rand()`。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn))
* 改进 `joinGet` 错误信息，使其能够准确说明 `join_keys` 的数量与 `right_table_keys` 的数量不一致。[#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara))。
* 在写入事务期间新增支持检查任意 Keeper 节点的 stat，有助于检测 ABA 问题。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 将高负载的 ytsaurus 请求重定向到高负载代理。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 修复了在基于磁盘事务的元数据中，针对 unlink/rename/removeRecursive/removeDirectory 等操作的回滚以及硬链接计数在各种工作负载下可能出现的问题，并简化了相关接口，使其更加通用，以便在其他元数据存储中复用。[#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新增 `keeper_server.tcp_nodelay` 配置参数，以便在 Keeper 中禁用 `TCP_NODELAY`。[#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* 在 `clickhouse-benchmarks` 中支持 `--connection`。其行为与 `clickhouse-client` 中的相同，你可以在客户端的 `config.xml`/`config.yaml` 的 `connections_credentials` 路径下指定预定义连接，从而避免通过命令行参数显式指定用户/密码。为 `clickhouse-benchmark` 增加对 `--accept-invalid-certificate` 的支持。[#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat)).
* 现在，设置 `max_insert_threads` 将会在 Iceberg 表上生效。[#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin))。
* 向 `PrometheusMetricsWriter` 添加直方图和维度型指标。这样，`PrometheusRequestHandler` 处理器将具备所有必要指标，可用于在云环境中进行可靠且低开销的指标采集。[#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 函数 `hasToken` 现在对空 token 返回 0 个匹配（此前会抛出异常）。[#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* 为 `Array` 和 `Map`（`mapKeys` 和 `mapValues`）类型的值添加文本索引支持。支持的函数为 `mapContainsKey` 和 `has`。[#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 新增了一个 `ZooKeeperSessionExpired` 指标，用于统计已过期的全局 ZooKeeper 会话数量。[#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在进行服务端（原生）复制到备份目标时，使用带有备份专用设置（例如 backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）的 S3 存储客户端。弃用 s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在使用实验性功能 `make_distributed_plan` 对查询计划进行序列化时，对设置项 `max_joined_block_size_rows` 和 `max_joined_block_size_bytes` 的错误处理。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 设置项 `enable_http_compression` 现已默认启用。这意味着如果客户端接受 HTTP 压缩，服务器就会使用它。不过，此更改也有一些缺点。客户端可以请求一种开销很大的压缩方法，比如 `bzip2`，这是不合理的，而且会增加服务器的资源消耗（但只有在传输大型结果时才会明显）。客户端也可以请求 `gzip`，这不算太糟，但相较于 `zstd` 并非最优。修复了 [#71591](https://github.com/ClickHouse/ClickHouse/issues/71591)。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `system.server_settings` 中新增了一个条目 `keeper_hosts`，用于提供 ClickHouse 可连接的 [Zoo]Keeper 主机列表。[#87718](https://github.com/ClickHouse/ClickHouse/pull/87718)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 在系统仪表板中添加 `from` 和 `to` 值，以便更方便地进行历史问题排查。[#87823](https://github.com/ClickHouse/ClickHouse/pull/87823)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 在 Iceberg 的 SELECT 查询中添加更多用于性能跟踪的信息。[#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik))。
* 文件系统缓存优化：在多个线程同时预留缓存空间时重用缓存优先级迭代器。[#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 新增对 `Keeper` 请求大小进行限制的功能（`max_request_size` 设置，与 `ZooKeeper` 的 `jute.maxbuffer` 相同，默认关闭以保持向后兼容性，将在后续版本中启用）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* 使 `clickhouse-benchmark` 默认不在错误信息中包含堆栈跟踪。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* 当标记（marks）已在缓存中时，避免启用基于线程池的异步标记加载（`load_marks_asynchronously=1`）（因为线程池可能处于繁忙状态，即使标记已经在缓存中，查询仍会因此付出额外开销）。 [#87967](https://github.com/ClickHouse/ClickHouse/pull/87967) ([Azat Khuzhin](https://github.com/azat)).
* Ytsaurus：允许使用部分列创建表、表函数和字典。[#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 现在起，`system.zookeeper_connection_log` 已默认启用，可用于获取 Keeper 会话相关信息。 [#88011](https://github.com/ClickHouse/ClickHouse/pull/88011) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 在传入重复的外部表时，使 TCP 与 HTTP 的行为保持一致。HTTP 允许多次传递同一个临时表。[#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema))。
* 移除用于读取 Arrow/ORC/Parquet 的自定义 MemoryPools。该组件在 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 之后似乎已不再需要，因为现在我们无论如何都会跟踪所有内存分配。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 允许在不提供参数的情况下创建 `Replicated` 数据库。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`：新增对连接到 clickhouse-keeper 的 TLS 端口的支持，保持参数标志名称与 clickhouse-client 中一致。[#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep))。
* 新增了一个 profile 事件，用于统计后台合并因超出内存限制而被拒绝的次数。[#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse))。
* 启用用于校验 `CREATE/ALTER TABLE` 列默认表达式的 analyzer。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus)).
* 内部查询计划优化：对 `CROSS JOIN` 使用 JoinStepLogical。 [#88151](https://github.com/ClickHouse/ClickHouse/pull/88151) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 为 `hasAnyTokens`（`hasAnyToken`）和 `hasAllTokens`（`hasAllToken`）函数添加了别名。[#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* 默认启用全局采样性能分析器（这意味着：即使是与查询无关的服务器线程也会启用）：每 10 秒（按 CPU 时间和实际时间）收集一次所有线程的堆栈跟踪（stacktrace）。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 更新 Azure SDK，以包含针对复制和创建容器操作中 `Content-Length` 问题的修复。[#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 使函数 `lag` 不区分大小写，以与 MySQL 兼容。[#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* 允许从 `clickhouse-server` 目录启动 `clickhouse-local`。在之前的版本中，这会产生错误 `Cannot parse UUID: .`。现在，可以在不启动服务器的情况下启动 `clickhouse-local` 并操作服务器上的数据库。[#88383](https://github.com/ClickHouse/ClickHouse/pull/88383)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加配置项 `keeper_server.coordination_settings.check_node_acl_on_remove`。启用后，在每次删除节点之前，将同时验证该节点本身及其父节点的 ACL。否则，仅验证父节点的 ACL。[#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368))。
* 在使用 `Vertical` 格式时，`JSON` 列现在会以美化格式输出。修复 [#81794](https://github.com/ClickHouse/ClickHouse/issues/81794)。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* 将 `clickhouse-client` 文件（例如查询历史）存储在 [XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 规范描述的位置，而不是主目录根目录下。如果 `~/.clickhouse-client-history` 已经存在，仍会继续使用该文件。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `GLOBAL IN` 导致的内存泄漏问题（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* 为 hasAny/hasAllTokens 添加了新的重载，使其支持字符串输入。[#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* 为 `clickhouse-keeper` 的安装后脚本新增一个步骤，以便在开机时自动启动。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan)).
* 仅在将凭据粘贴到 Web UI 时进行检查，而不是在每次按键时检查。这样可以避免因 LDAP 服务器配置错误而导致的问题。修复了 [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777)。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在违反约束时限制异常信息长度。在之前的版本中，插入超长字符串时，可能会生成同样很长的异常信息，并最终被写入 `query_log`。修复 [#87032](https://github.com/ClickHouse/ClickHouse/issues/87032)。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在创建表时从 ArrowFlight 服务器请求数据集结构时出现的问题。[#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar))。

#### Bug 修复（官方稳定版中对用户可见的异常行为）

* 修复了 GeoParquet 导致的客户端协议错误。[#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在发起节点上执行的子查询中解析 `shardNum()` 等与主机相关函数时的问题。[#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa))。
* 修复了多个与日期时间相关的函数（例如 `parseDateTime64BestEffort`、`change{Year,Month,Day}` 和 `makeDateTime64`）在处理 Unix 纪元之前且带有小数秒的日期时的错误。此前，小数秒部分会被从秒数中减去，而不是相加。例如，`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` 会返回 `1968-12-31 23:59:59.532`，而不是 `1969-01-01 00:00:00.468`。[#85396](https://github.com/ClickHouse/ClickHouse/pull/85396)（[xiaohuanlin](https://github.com/xiaohuanlin)）。
* 修复在同一条 ALTER 语句中列状态发生变化时，`ALTER COLUMN IF EXISTS` 命令执行失败的问题。现在，`DROP COLUMN IF EXISTS`、`MODIFY COLUMN IF EXISTS`、`COMMENT COLUMN IF EXISTS` 和 `RENAME COLUMN IF EXISTS` 等命令可以正确处理在同一语句中前一个命令已删除该列的情况。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 修复在日期超出支持范围时推断 `Date`/`DateTime`/`DateTime64` 类型的问题。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个崩溃问题：某些用户提交到 `AggregateFunction(quantileDD)` 列的有效数据可能会导致合并过程发生无限递归。[#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi))。
* 在通过 `cluster` 表函数创建的表中支持 JSON/Dynamic 类型。[#86821](https://github.com/ClickHouse/ClickHouse/pull/86821)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在查询中通过 CTE 计算的函数结果非确定性的问题。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在主键列上使用 pointInPolygon 时 EXPLAIN 中出现的 LOGICAL&#95;ERROR。[#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复名称中包含百分号编码序列的数据湖表。修复 [#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) 中的问题。[#87020](https://github.com/ClickHouse/ClickHouse/pull/87020)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 修复在包含可空列且启用了 `optimize_functions_to_subcolumns` 的 `OUTER JOIN` 中出现的不正确 `IS NULL` 行为，关闭 [#78625](https://github.com/ClickHouse/ClickHouse/issues/78625)。[#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在 `max_temporary_data_on_disk_size` 上限跟踪中对临时数据释放计数不正确的问题，关闭 [#87118](https://github.com/ClickHouse/ClickHouse/issues/87118)。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140)（[JIaQi](https://github.com/JiaQiTang98)）。
* 函数 `checkHeaders` 现在会正确验证提供的 headers，并拒绝不允许的 headers。原作者：Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* 对所有数值类型实现了与 `toDate` 和 `toDate32` 相同的行为。修复了从 int16 类型转换为 Date32 时的下溢检查。[#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在包含多个 JOIN 的查询中使用并行副本时的逻辑错误，尤其是在 LEFT/INNER JOIN 之后使用 RIGHT JOIN 的情况下。[#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter))。
* 使 schema 推断缓存遵循 `input_format_try_infer_variants` 设置。[#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* 使 pathStartsWith 仅匹配位于该前缀之下的路径。[#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano))。
* 修复了 `_row_number` 虚拟列和 Iceberg 基于位置删除中的逻辑错误。[#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在 `JOIN` 中由于混合使用常量和非常量数据块而导致的 `LOGICAL_ERROR` 异常 “Too large size passed to allocator”。[#87231](https://github.com/ClickHouse/ClickHouse/pull/87231)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在轻量级更新中使用从其他 `MergeTree` 表读取数据的子查询时出现的问题。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在存在行策略时不起作用的 move-to-prewhere 优化。延续自 [#85118](https://github.com/ClickHouse/ClickHouse/issues/85118)。修复并关闭了 [#69777](https://github.com/ClickHouse/ClickHouse/issues/69777)。修复并关闭了 [#83748](https://github.com/ClickHouse/ClickHouse/issues/83748)。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复了在对数据分片中缺失但定义了默认表达式的列应用补丁时出现的问题。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在 MergeTree 表中使用重复分区字段名称时导致的段错误。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 EmbeddedRocksDB 的升级问题。[#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了从对象存储上的文本索引直接读取的问题。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 禁止为不存在的引擎创建权限。[#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* 仅对 `s3_plain_rewritable` 的「未找到」错误执行忽略（否则可能会导致各种问题）。[#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* 修复基于 YTSaurus 源和 *range&#95;hashed 布局的字典。[#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 修复创建空元组数组时的行为。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 在创建临时表时检查无效列。[#87524](https://github.com/ClickHouse/ClickHouse/pull/87524)（[Pavel Kruglov](https://github.com/Avogar)）。
* 切勿在 format 头部中包含 Hive 分区列。修复了 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515)。[#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在 DeltaLake 中使用 text 格式时的读取准备过程。[#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了 Buffer 表在执行 SELECT 和 INSERT 时的访问权限校验问题。[#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit))。
* 不允许为 S3 表创建数据跳过索引。 [#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc)).
* 避免异步日志和 text&#95;log 的已跟踪内存泄漏（在 10 小时内可能产生约 100GiB 的显著偏差，text&#95;log 中也可能出现几乎相同的偏差）。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat))。
* 修复了一个错误：当某个 View 或物化视图被异步删除，且服务器在完成后台清理之前重启时，可能会导致该视图的 SELECT 设置覆盖全局服务器设置。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在计算内存过载预警时（如果可能），排除用户空间页缓存所占字节数。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在 CSV 反序列化过程中，由于类型顺序不正确而导致 `LOGICAL_ERROR` 的问题。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复在可执行字典中对 `command_read_timeout` 的错误处理。[#87627](https://github.com/ClickHouse/ClickHouse/pull/87627)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了在使用新分析器且对被替换列进行过滤时，`SELECT * REPLACE` 在 `WHERE` 子句中的错误行为。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复在 `Distributed` 之上使用 `Merge` 时的两层聚合问题。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* 修复在未使用右侧行列表时 HashJoin 算法中输出数据块的生成。修复了 [#87401](https://github.com/ClickHouse/ClickHouse/issues/87401)。[#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* 在应用索引分析后如果没有可读数据，可能会错误地选择并行副本读取模式。修复了 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653)。[#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi))。
* 修复在 Glue 中处理 `timestamp` / `timestamptz` 列的问题。[#87733](https://github.com/ClickHouse/ClickHouse/pull/87733)（[Andrey Zvonov](https://github.com/zvonand)）。
* 此更改关闭了 [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587)。[#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* 修复 PostgreSQL 接口中的布尔值写入。[#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* 修复在包含 CTE 的 INSERT SELECT 查询中出现的 “unknown table” 错误，[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* 修复从无法位于 Nullable 中的 Variant 读取为 null 的 map 子列时的问题。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在集群的次级节点上未能在整个集群中完全删除数据库时的错误处理。[#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了多个与 skip indices 相关的 bug。[#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano))。
* 在 AzureBlobStorage 中，更新为先尝试原生复制，如遇到“Unauthroized”错误则回退到读写方式（在 AzureBlobStorage 中，如果源和目标使用不同的存储账户，会出现“Unauthorized”错误）。并修复了当在配置中定义了 endpoint 时应用 &quot;use&#95;native&#95;copy&quot; 的问题。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 如果 ArrowStream 文件包含非唯一字典，ClickHouse 会崩溃。[#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn))。
* 修复在使用 approx&#95;top&#95;k 和 finalizeAggregation 时的致命错误。[#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 修复当最后一个数据块为空时的投影合并问题。[#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano))。
* 如果参数类型不允许用于 GROUP BY，则不要从 GROUP BY 中移除单射函数。[#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在查询中使用 `session_timezone` 设置时，基于 datetime 的键进行数据块/分区裁剪不正确的问题。[#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa))。
* 在 PostgreSQL 接口中在查询执行后返回受影响的行数。[#87990](https://github.com/ClickHouse/ClickHouse/pull/87990)（[Artem Yurov](https://github.com/ArtemYurov)）。
* 限制在 PASTE JOIN 中使用过滤下推功能，因为这可能导致结果不正确。[#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 在对 [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) 中引入的权限检查进行评估之前先应用 URI 规范化。[#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 修复了在新的分析器中，当 ARRAY JOIN COLUMNS() 未匹配到任何列时的逻辑错误。 [#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 “ClickHouse 内存使用率过高” 警告（排除页面缓存）。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在设置了列级 `TTL` 的 `MergeTree` 表中可能发生的数据损坏问题。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在附加了包含无效表的外部数据库（`PostgreSQL`/`SQLite`/...）的情况下读取 `system.tables` 时可能发生的未捕获异常。[#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用空元组参数调用 `mortonEncode` 和 `hilbertEncode` 函数时出现的崩溃问题。[#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 现在在集群中存在不活动副本时，`ON CLUSTER` 查询将花费更少的时间。[#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin))。
* 现在 DDL worker 会从副本集中清理过期的主机。这将减少存储在 ZooKeeper 中的元数据量。[#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin))。
* 修复在未启用 cgroups 的情况下运行 ClickHouse 的问题（此前异步指标误将 cgroups 设为必需条件）。[#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* 在出错时正确回滚移动目录操作。我们需要重写执行过程中更改的所有 `prefix.path` 对象，而不仅仅是根对象。[#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 修复了 `ColumnLowCardinality` 中 `is_shared` 标志的传播问题。如果在 `ReverseIndex` 中的哈希值已经预先计算并缓存之后，又在该列中插入了新值，可能会导致错误的 GROUP BY 结果。[#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat))。
* 修复了工作负载设置项 `max_cpu_share`。现在即使未设置工作负载设置项 `max_cpus`，也可以使用它。[#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria)).
* 修复了带有子查询的高负载 mutation 会卡在准备阶段的问题。现在可以使用 `SYSTEM STOP MERGES` 来停止这些 mutation。[#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 现在，关联子查询也可以与对象存储一起使用。[#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin))。
* 避免在访问 `system.projections` 和 `system.data_skipping_indices` 的同时初始化 DataLake 数据库。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* 现在，只有在显式启用 `show_data_lake_catalogs_in_system_tables` 时，数据湖目录才会显示在系统内省表中。[#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin))。
* 修复了 DatabaseReplicated，使其遵守 `interserver_http_host` 配置。[#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 在定义 Projection 的上下文中，现在已显式禁用位置参数，因为在该内部查询阶段使用它们并不合理。此更改修复了 [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604)。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `countMatches` 函数中的二次时间复杂度问题。关闭 [#88400](https://github.com/ClickHouse/ClickHouse/issues/88400)。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使针对 KeeperMap 表的 `ALTER COLUMN ... COMMENT` 命令也会被复制，从而写入到 Replicated 数据库的元数据中，并在所有副本间传播。修复 [#88077](https://github.com/ClickHouse/ClickHouse/issues/88077)。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408)（[Eduard Karacharov](https://github.com/korowa)）。
* 修复在 `Database Replicated` 中与物化视图相关的伪循环依赖问题，该问题会阻止向数据库添加新的副本。[#88423](https://github.com/ClickHouse/ClickHouse/pull/88423)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复在 `group_by_overflow_mode` 设置为 `any` 时对稀疏列的聚合。[#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa))。
* 修复在使用 `query_plan_use_logical_join_step=0` 且包含多个 FULL JOIN USING 子句时出现的 &quot;column not found&quot; 错误。解决 [#88103](https://github.com/ClickHouse/ClickHouse/issues/88103)。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 节点数量 &gt; 10 的大型集群在执行恢复时，很容易因为错误 `[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` 而失败。`num_hosts` 节点会被许多主机同时覆盖。此修复将用于控制重试次数的设置改为动态可调。关闭 [#87721](https://github.com/ClickHouse/ClickHouse/issues/87721)。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 此 PR 仅用于与 23.8 及之前的版本保持兼容。兼容性问题由此 PR 引入： [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) 这条 SQL 在 `enable_analyzer=0` 时会执行失败（在 23.8 之前是正常的）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 修复在将大数值转换为 DateTime 时，`accurateCast` 错误消息中 UBSAN 报告的整数溢出问题。 [#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 `CoalescingMergeTree` 对 tuple 类型的处理。这一变更关闭了 [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469)。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* 禁止对 `iceberg_format_version=1` 执行删除操作。解决了 [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444)。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* 此补丁修复了 `plain-rewritable` 磁盘在任意深度文件夹中执行移动操作时的问题。[#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 修复与 *cluster 函数一起使用的 SQL SECURITY DEFINER。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 修复由于对底层 const PREWHERE 列的并发修改导致的潜在崩溃问题。[#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat)).
* 修复了从文本索引读取数据的问题，并启用了查询条件缓存（通过启用设置 `use_skip_indexes_on_data_read` 和 `use_query_condition_cache`）。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* 从 `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` 抛出的 `Poco::TimeoutException` 异常会导致因 SIGABRT 崩溃。 [#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 已在 [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) 中回溯修复：在恢复后，Replicated 数据库的副本可能会长时间卡住，并持续打印类似 `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` 的日志信息，该问题已修复。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复在配置重新加载后，ClickHouse 首次建立连接时向 `system.zookeeper_connection_log` 追加写入的行为。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了一个缺陷：在处理时区时，将 DateTime64 转换为 Date 且 `date_time_overflow_behavior = 'saturate'` 时，超出取值范围的数值可能会产生错误结果。[#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* 第 N 次尝试修复在启用缓存的 S3 表引擎中出现的“having zero bytes”错误。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了 `loop` 表函数在执行 `SELECT` 时的访问验证问题。[#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit))。
* 在异步日志记录失败时捕获异常，防止程序异常终止。[#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano))。
* 已在 [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) 中回溯该修复：修复 `top_k` 在仅以一个参数调用时未遵守阈值参数的问题。关闭了 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757)。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* 在 [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) 中回溯：修复函数 `reverseUTF8` 中的一个错误。在先前版本中，它会错误地反转长度为 4 的 UTF-8 码点的字节顺序。此更改关闭了 [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913)。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 已在 [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) 回溯移植：在使用 SQL SECURITY DEFINER 创建视图时，不再检查 `SET DEFINER &lt;current_user&gt;:definer` 的访问权限。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* 已在 [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) 中回溯：修复了 `L2DistanceTransposed(vec1, vec2, p)` 中的 `LOGICAL_ERROR`，该错误源于针对部分 `QBit` 读取的优化在 `p` 为 `Nullable` 类型时错误地从返回类型中移除了 `Nullable`。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 已在 [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) 中回溯修复：修复未知 catalog 类型导致的崩溃。解决了 [#88819](https://github.com/ClickHouse/ClickHouse/issues/88819)。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* 已在 [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) 中回溯修复：修复了在分析 skipping 索引时的性能下降问题。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### 构建 / 测试 / 打包改进

* 使用 `postgres` 库 18.0 版本。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 为 FreeBSD 启用 ICU。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891)（[Raúl Marín](https://github.com/Algunenano)）。
* 在使用动态调度到 SSE 4.2 时，使用 SSE 4.2 而不是 SSE 4。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029)（[Raúl Marín](https://github.com/Algunenano)）。
* 如果 `Speculative Store Bypass Safe` 不可用，则不再要求 `NO_ARMV81_OR_HIGHER` 标志。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 当 ClickHouse 使用 `ENABLE_LIBFIU=OFF` 构建时，与 failpoint 相关的函数会变为空操作（no-op），不再对性能产生影响。在这种情况下，`SYSTEM ENABLE/DISABLE FAILPOINT` 查询会返回 `SUPPORT_IS_DISABLED` 错误。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184)（[c-end](https://github.com/c-end)）。

### ClickHouse 25.9 版本发布，2025-09-25 {#259}

#### 不向后兼容的变更

* 禁用对 IPv4/IPv6 的无意义二元运算：禁用了 IPv4/IPv6 与非整数类型的加/减运算。此前允许与浮点类型进行此类运算，并且在某些其他类型（例如 DateTime）上会抛出逻辑错误。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336)（[Raúl Marín](https://github.com/Algunenano)）。
* 弃用设置 `allow_dynamic_metadata_for_data_lakes`。现在所有 Iceberg 表在每次执行查询之前，都会尝试从存储中获取最新的表 schema。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366)（[Daniil Ivanik](https://github.com/divanik)）。
* 更改了 `OUTER JOIN ... USING` 子句中合并列（coalesced column）的解析方式，使其更加一致：此前，在 OUTER JOIN 中同时选择 USING 列和带限定名的列（`a, t1.a, t2.a`）时，USING 列会被错误地解析为 `t1.a`，从而在右表中没有左表匹配的行上显示 0/NULL。现在，USING 子句中的标识符始终解析为合并列，而带限定名的标识符解析为非合并列，与查询中还存在哪些其他标识符无关。例如：```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 之前：a=0, t1.a=0, t2.a=2（错误 —— 'a' 被解析为 t1.a） -- 之后：a=2, t1.a=0, t2.a=2（正确 —— 'a' 为合并列）。```[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 将副本去重窗口上限提高到 10000。此变更在功能上是完全兼容的，但可以想象在存在大量表的情况下，可能会导致较高的资源消耗。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820)（[Sema Checherinda](https://github.com/CheSema)）。

#### 新增功能

* 用户现在可以通过在 NATS 引擎中指定新的 `nats_stream` 和 `nats_consumer` 设置，使用 NATS JetStream 来消费消息。[#84799](https://github.com/ClickHouse/ClickHouse/pull/84799)（[Dmitry Novikov](https://github.com/dmitry-sles-novikov)）。
* 在 `arrowFlight` 表函数中新增了对身份验证和 SSL 的支持。[#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar))。
* 在 `S3` 表引擎和 `s3` 表函数中新增名为 `storage_class_name` 的参数，用于指定 AWS 支持的智能分层（Intelligent-Tiering）存储级别。该参数同时支持键值格式和位置参数格式（已弃用）。[#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin)).
* Iceberg 表引擎支持 `ALTER UPDATE`。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12)).
* 添加系统表 `iceberg_metadata_log`，以便在 SELECT 查询时获取 Iceberg 元数据文件。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152) ([scanhex12](https://github.com/scanhex12)).
* `Iceberg` 和 `DeltaLake` 表通过在存储层级中设置 `disk` 选项来支持自定义磁盘配置。[#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12)).
* 为数据湖磁盘增加对 Azure 的支持。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* 在 Azure Blob Storage 之上支持 `Unity` 目录。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 为 `Iceberg` 写入支持更多格式（`ORC`、`Avro`）。此变更关闭了 [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179)。 [#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* 添加一个新的系统表 `database_replicas`，包含数据库副本相关信息。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov)).
* 新增函数 `arrayExcept`，用于按集合语义从一个数组中减去另一个数组。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x)).
* 新增 `system.aggregated_zookeeper_log` 表。该表包含按会话 ID、父路径和操作类型分组的 ZooKeeper 操作统计信息（例如操作数量、平均延迟、错误），并会定期刷新到磁盘。[#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新增函数 `isValidASCII`。如果输入的 `String` 或 `FixedString` 仅包含 ASCII 字节（0x00–0x7F），则返回 1，否则返回 0。关闭 [#85377](https://github.com/ClickHouse/ClickHouse/issues/85377)。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* 布尔类型设置项可以在不带参数的情况下指定，例如 `SET use_query_cache;`，这等同于将其设置为 true。[#85800](https://github.com/ClickHouse/ClickHouse/pull/85800)（[thraeka](https://github.com/thraeka)）。
* 新的配置选项：`logger.startupLevel` 和 `logger.shutdownLevel` 分别允许在 ClickHouse 启动和关闭阶段重写日志级别。[#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 聚合函数 `timeSeriesChangesToGrid` 和 `timeSeriesResetsToGrid`。其行为与 `timeSeriesRateToGrid` 类似，接受起始时间戳、结束时间戳、步长和回溯窗口等参数，以及时间戳和值两个参数，但每个窗口至少需要 1 个样本，而非 2 个。计算 PromQL 的 `changes`/`resets`，在由这些参数定义的时间网格中，对每个时间戳统计指定窗口内样本值发生变化或减少的次数。返回类型为 `Array(Nullable(Float64))`。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010)（[Stephen Chi](https://github.com/stephchi0)）。
* 允许用户使用与创建临时表（`CREATE TEMPORARY TABLE`）类似的语法 `CREATE TEMPORARY VIEW` 来创建临时视图。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury)).
* 为 `system.warnings` 表新增 CPU 和内存使用情况的警告。[#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc))。
* 在 `Protobuf` 输入中支持 `oneof` 指示符。可以使用一列特殊列来指示 oneof 中哪个字段被设置。如果消息包含 [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) 且已设置 `input_format_protobuf_oneof_presence`，ClickHouse 会填充该列，用于指示 oneof 中实际出现的是哪个字段。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* 基于 jemalloc 的内部工具改进内存分配性能分析。现在可以通过配置 `jemalloc_enable_global_profiler` 启用全局 jemalloc profiler。通过启用配置 `jemalloc_collect_global_profile_samples_in_trace_log`，采样得到的全局内存分配和释放信息可以以 `JemallocSample` 类型存储在 `system.trace_log` 中。现在可以使用设置 `jemalloc_enable_profiler` 为每个查询单独启用 jemalloc profiling。是否将采样数据存储到 `system.trace_log` 中可以通过设置 `jemalloc_collect_profile_samples_in_trace_log` 在查询级别逐个控制。将 jemalloc 更新到更高版本。[#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* 一个用于在删除 Iceberg 表时一并删除其文件的新设置项。此更改解决了 [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211)。[#86501](https://github.com/ClickHouse/ClickHouse/pull/86501)（[scanhex12](https://github.com/scanhex12)）。

#### 实验性特性

* 从零重构了倒排文本索引，使其能够对无法完全放入内存的数据集进行可扩展处理。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* Join 重排现在会利用统计信息。可以通过设置 `allow_statistics_optimize = 1` 和 `query_plan_optimize_join_order_limit = 10` 来启用该特性。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* 支持 `alter table ... materialize statistics all`，该命令会物化一个表的所有统计信息。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).

#### 性能优化

* 在读取时支持使用 skip 索引过滤数据部分，从而减少不必要的索引读取。由新设置 `use_skip_indexes_on_data_read` 控制（默认禁用）。这解决了 [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774)。其中包含了一些与 [#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) 共享的通用基础改动。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* 添加了 JOIN 顺序优化功能，可以自动重新排序 JOIN 以获得更好的性能（由 `query_plan_optimize_join_order_limit` 设置控制）。请注意，当前的 JOIN 顺序优化仅有有限的统计信息支持，主要依赖于存储引擎提供的行数估计值——未来版本将增加更完善的统计信息收集和基数估计功能。**如果在升级后遇到 JOIN 查询相关的问题**，可以暂时通过设置 `SET query_plan_use_new_logical_join_step = 0` 来禁用新的实现，并报告该问题以便进一步排查。**关于 USING 子句中标识符解析的说明**：修改了 `OUTER JOIN ... USING` 子句中合并列（coalesced column）的解析方式，使其行为更加一致：之前在 OUTER JOIN 中同时选择 USING 列和限定列（`a, t1.a, t2.a`）时，USING 列会被错误地解析为 `t1.a`，导致右表中没有左侧匹配的行显示为 0/NULL。现在，来自 USING 子句的标识符始终解析为合并列，而限定标识符始终解析为未合并的列，与查询中是否存在其他标识符无关。例如： ```sql
  SELECT a, t1.a, t2.a
  FROM (SELECT 1 as a WHERE 0) t1
  FULL JOIN (SELECT 2 as a) t2 USING (a)
  -- Before: a=0, t1.a=0, t2.a=2 (incorrect - &#39;a&#39; resolved to t1.a)
  -- After: a=2, t1.a=0, t2.a=2 (correct - &#39;a&#39; is coalesced).
  [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 针对数据湖的分布式 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* 改进针对 `func(primary_column) = 'xx'` 和 `column in (xxx)` 此类条件的 PREWHERE 优化。[#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li))。
* 实现了 JOIN 重写：1. 如果对匹配行或未匹配行的过滤条件始终为假，则将 `LEFT ANY JOIN` 和 `RIGHT ANY JOIN` 转换为 `SEMI`/`ANTI` JOIN。此优化由新设置 `query_plan_convert_any_join_to_semi_or_anti_join` 控制。2. 如果一侧未匹配行的过滤条件始终为假，则将 `FULL ALL JOIN` 转换为 `LEFT ALL` 或 `RIGHT ALL` JOIN。[#86028](https://github.com/ClickHouse/ClickHouse/pull/86028)（[Dmitry Novik](https://github.com/novikd)）。
* 在执行轻量级删除之后，优化了纵向合并的性能。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* 在 `LEFT/RIGHT` join 存在大量未匹配行的情况下，`HashJoin` 的性能略有优化。[#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat))。
* 基数排序：帮助编译器利用 SIMD，并改进预取效果。通过动态派发，仅在 Intel CPU 上启用软件预取。延续了 @taiyang-li 在 [https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) 中的工作。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 通过在 `MarkRanges` 中将底层容器从 `deque` 优化为 `devector`，提升了在包含大量数据片段的表上执行短查询时的性能。[#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat))。
* 改进了在 join 模式下应用补丁部件的性能。[#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 新增了设置 `query_condition_cache_selectivity_threshold`（默认值：1.0），用于将选择性较低的谓词扫描结果排除在写入 query condition cache 之外。这样可以在缓存命中率略有下降的前提下，降低 query condition cache 的内存消耗。[#86076](https://github.com/ClickHouse/ClickHouse/pull/86076)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 减少 Iceberg 写入过程中的内存使用。[#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).

#### 改进

* 在单次插入操作中支持向 Iceberg 写入多个数据文件。新增设置项 `iceberg_insert_max_rows_in_data_file` 和 `iceberg_insert_max_bytes_in_data_file` 用于控制相应限制。[#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12))。
* 为 Delta Lake 中插入的数据文件新增行数/字节数限制，可通过设置 `delta_lake_insert_max_rows_in_data_file` 和 `delta_lake_insert_max_bytes_in_data_file` 进行控制。[#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 Iceberg 写入中支持更多类型的分区。修复了 [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206)。[#86298](https://github.com/ClickHouse/ClickHouse/pull/86298)（[scanhex12](https://github.com/scanhex12)）。
* 使 S3 重试策略可配置，并在修改配置 XML 文件后可以热加载 S3 磁盘的设置。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 改进了 S3(Azure)Queue 表引擎，使其在 ZooKeeper 连接丢失时也能继续运行且不会产生潜在的重复数据。需要启用 S3Queue 设置 `use_persistent_processing_nodes`（可通过 `ALTER TABLE MODIFY SETTING` 更改）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在创建物化视图时，可以在 `TO` 之后使用查询参数，例如：`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table`。[#84899](https://github.com/ClickHouse/ClickHouse/pull/84899)（[Diskein](https://github.com/Diskein)）。
* 当为 `Kafka2` 表引擎指定错误设置时，现在会向用户提供更清晰的说明。[#83701](https://github.com/ClickHouse/ClickHouse/pull/83701)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 不再支持为 `Time` 类型指定时区（这样做在语义上没有意义）。[#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 在 `best_effort` 模式下，简化了与解析 Time/Time64 相关的逻辑，并修复了一些缺陷。[#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新增 `deltaLakeAzureCluster` 函数（类似于 `deltaLakeAzure` 的集群模式版本）以及 `deltaLakeS3Cluster` 函数（`deltaLakeCluster` 的别名）。解决了 [#85358](https://github.com/ClickHouse/ClickHouse/issues/85358)。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在常规复制操作中，以与备份相同的方式应用 `azure_max_single_part_copy_size` 设置。[#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn))。
* 在 S3 对象存储中，当出现可重试错误时放慢 S3 客户端线程。此更改将之前的设置 `backup_slow_all_threads_after_retryable_s3_error` 扩展到 S3 磁盘，并将其重命名为更通用的 `s3_slow_all_threads_after_retryable_error`。[#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva))。
* 将设置 allow&#95;experimental&#95;variant/dynamic/json 和 enable&#95;variant/dynamic/json 标记为已废弃。现在这三种类型都会被无条件启用。[#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 `http_handlers` 中支持按完整 URL 字符串（`full_url` 指令，包括 scheme 和 host:port）进行过滤。[#86155](https://github.com/ClickHouse/ClickHouse/pull/86155)（[Azat Khuzhin](https://github.com/azat)）。
* 新增了一个设置 `allow_experimental_delta_lake_writes`。[#86180](https://github.com/ClickHouse/ClickHouse/pull/86180) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复 init.d 脚本中对 systemd 的检测（从而修复“安装软件包”（Install packages）检查）。[#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat))。
* 新增一个名为 `startup_scripts_failure_reason` 的维度指标。该指标用于区分会导致启动脚本失败的不同错误类型。特别是为了告警目的，我们需要区分瞬时错误（例如 `MEMORY_LIMIT_EXCEEDED` 或 `KEEPER_EXCEPTION`）与非瞬时错误。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 允许在 Iceberg 表的分区定义中省略 `identity` 函数。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 添加仅针对特定通道启用 JSON 日志的功能。为此，将 `logger.formatting.channel` 设置为 `syslog`/`console`/`errorlog`/`log` 之一。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* 允许在 `WHERE` 中使用原生数值类型。它们已经可以作为逻辑函数的参数使用。这简化了过滤下推（filter-push-down）和移动到 PREWHERE（move-to-prewhere）的优化。[#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复了在针对元数据损坏的 Catalog 执行 `SYSTEM DROP REPLICA` 时出现的错误。[#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 在 Azure 中为磁盘访问检查（`skip_access_check = 0`）添加额外重试，因为磁盘访问权限的开通可能需要相当长的时间。[#86419](https://github.com/ClickHouse/ClickHouse/pull/86419)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 将 `timeSeries*()` 函数中的陈旧时间窗口设为左开右闭区间。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* 添加 `FailedInternal*Query` 概要事件（profile events）。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude))。
* 修复了通过配置文件添加用户名中包含点的用户时的处理问题。[#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 添加用于查询内存使用情况的异步指标（`QueriesMemoryUsage` 和 `QueriesPeakMemoryUsage`）。[#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* 你可以使用 `clickhouse-benchmark --precise` 选项来更精确地报告 QPS 和其他按时间间隔统计的指标。当查询的执行时长与报告间隔 `--delay D` 相当时，这有助于获得稳定的 QPS。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa)).
* 使 Linux 线程的 nice 值可配置，从而可以为某些线程（merge/mutate、query、物化视图、ZooKeeper 客户端）设置更高或更低的优先级。[#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 修复具有误导性的 “specified upload does not exist” 错误，该错误会在分片上传过程中因竞争条件导致原始异常丢失时出现。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* 限制 `EXPLAIN` 查询中的查询计划描述长度。对非 `EXPLAIN` 查询不再计算描述。新增设置 `query_plan_max_step_description_length`。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 新增对待处理信号进行调优的能力，以尝试解决 CANNOT&#95;CREATE&#95;TIMER 问题（针对查询分析器：`query_profiler_real_time_period_ns`/`query_profiler_cpu_time_period_ns`）。同时从 `/proc/self/status` 中收集 `SigQ` 用于自检（如果 `ProcessSignalQueueSize` 接近 `ProcessSignalQueueLimit`，则很可能会出现 `CANNOT_CREATE_TIMER` 错误）。 [#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat))。
* 提高 Keeper 中 `RemoveRecursive` 请求的性能。[#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* 在输出 JSON 类型时，移除 `PrettyJSONEachRow` 中的多余空白字符。[#86819](https://github.com/ClickHouse/ClickHouse/pull/86819)（[Pavel Kruglov](https://github.com/Avogar)）。
* 现在在删除普通可重写磁盘上的目录时，会为 `prefix.path` 记录 blob 的大小。[#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin))。
* 支持对远程 ClickHouse 实例（包括 ClickHouse Cloud）进行性能测试。使用示例：`tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在已知会分配大量内存（&gt;16MiB）的地方（排序、异步插入、FileLog）中遵守内存限制。[#87035](https://github.com/ClickHouse/ClickHouse/pull/87035)（[Azat Khuzhin](https://github.com/azat)）。
* 如果将 `network_compression_method` 设置为不受支持的通用编解码器，则抛出异常。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* 系统表 `system.query_cache` 现在会返回*所有*查询结果缓存条目，而之前只返回共享条目，或当前用户和角色的非共享条目。这是合理的，因为非共享条目本身就不应泄露*查询结果*，而 `system.query_cache` 返回的是*查询字符串*。这使得该系统表的行为更接近 `system.query_log`。[#87104](https://github.com/ClickHouse/ClickHouse/pull/87104) ([Robert Schulze](https://github.com/rschu1ze)).
* 启用 `parseDateTime` 函数的短路求值。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar)).
* 在 `system.parts_columns` 中新增 `statistics` 列。[#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).

#### Bug Fix（官方稳定版中对用户可见的异常行为）

* 对于复制数据库和内部复制表，`ALTER` 查询的结果现在仅在发起节点上进行验证。这将修复这样的问题：某个已提交的 `ALTER` 查询可能会在其他节点上卡住不动。[#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 限制 `BackgroundSchedulePool` 中每种类型任务的数量。避免出现所有槽位都被同一类型任务占满、导致其他任务饥饿的情况，并避免任务相互等待而产生死锁。该行为由服务器设置项 `background_schedule_pool_max_parallel_tasks_per_type_ratio` 控制。[#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在恢复数据库副本时应正确关闭表，否则会在恢复过程中导致某些表引擎出现 LOGICAL&#95;ERROR。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* 在为数据库名称生成拼写更正建议时检查访问权限。[#85371](https://github.com/ClickHouse/ClickHouse/pull/85371)（[Dmitry Novik](https://github.com/novikd)）。
* 1. 对 hive 列使用 LowCardinality 2. 在虚拟列之前填充 hive 列（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所必需）3. 在 hive 的空格式上触发 LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. 修复对“hive 分区列是否是唯一列”的检查 5. 断言在 schema 中显式指定了所有 hive 列 6. 针对带有 hive 的 parallel&#95;replicas&#95;cluster 的部分修复 7. 在 hive 工具的 extractKeyValuePairs 中使用有序容器（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) 所必需）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538) ([Arthur Passos](https://github.com/arthurpassos))。
* 防止对 `IN` 函数的第一个参数进行不必要的优化，以避免在使用数组映射时偶发错误。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在写入 Parquet 文件时，Iceberg 源 ID 与 Parquet 名称之间的映射没有根据当时的 schema 进行调整。此 PR 会基于每个 Iceberg 数据文件自身的 schema 进行处理，而不是使用当前的 schema。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了在打开文件时单独读取其大小的问题。该修复与 [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) 相关，该变更是为修复 `5.10` 版本发布之前的 Linux 内核中的一个 bug 而引入的。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 在内核级禁用 IPv6 的系统上（例如在 RHEL 上设置 `ipv6.disable=1`），ClickHouse Keeper 不再启动失败。现在，如果初始 IPv6 监听创建失败，它会尝试回退为使用 IPv4 监听。[#85901](https://github.com/ClickHouse/ClickHouse/pull/85901)（[jskong1124](https://github.com/jskong1124)）。
* 此 PR 关闭了 [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990)，为 globalJoin 中的并行副本添加了对 TableFunctionRemote 的支持。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* 修复 `orcschemareader::initializeifneeded()` 中的空指针。此 PR 解决以下问题：[#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### 用户可见变更的文档条目。[#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510))。
* 添加检查，仅当 `FROM` 子句中的关联子查询使用外层查询中的列时才允许。修复 [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469)。修复 [#85402](https://github.com/ClickHouse/ClickHouse/issues/85402)。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在对某个列执行 `ALTER UPDATE` 时，如果该列的某个子列被用于其他列的 `MATERIALIZED` 表达式的情况。此前，在表达式中包含该子列的物化列不会被正确更新。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* 禁止修改其子列用作主键或分区表达式的列。[#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 DeltaLake 存储引擎中使用非默认列映射模式读取子列的问题。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 JSON 中带有 Enum 提示的路径使用了错误的默认值的问题。[#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* 对 DataLake hive catalog URL 的解析增加了输入校验与清理。关闭了 [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018)。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* 修复文件系统缓存动态调整大小过程中的逻辑错误。关闭 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122)。关闭 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473)。[#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 DatabaseReplicatedSettings 中对 `logs_to_keep` 使用 `NonZeroUInt64` 类型。[#86142](https://github.com/ClickHouse/ClickHouse/pull/86142)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 在对使用 `index_granularity_bytes = 0` 设置创建的表（例如 `ReplacingMergeTree`）执行带有跳过索引的 `FINAL` 查询时，会抛出异常。该异常现已修复。[#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 消除了未定义行为（UB），并修复了 Iceberg 分区表达式的解析问题。[#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在一次 INSERT 中同时包含 const 和非 const 块时可能发生的崩溃问题。[#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* 通过 SQL 创建磁盘时，现在会默认处理 `/etc/metrika.xml` 中的 include 配置。[#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar))。
* 修复 accurateCastOrNull/accurateCastOrDefault 从 String 到 JSON 的转换问题。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* 在 Iceberg 引擎中支持不含 &#39;/&#39; 的目录。[#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* 修复在 `replaceRegex` 中使用 `FixedString` 类型的 haystack 且 needle 为空时的崩溃。[#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在执行 ALTER UPDATE Nullable(JSON) 时发生的崩溃。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `system.tables` 中缺失的列定义字段。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* 修复从 LowCardinality(Nullable(T)) 到 Dynamic 的类型转换问题。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了向 DeltaLake 写入时的逻辑错误。关闭 [#86175](https://github.com/ClickHouse/ClickHouse/issues/86175)。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在从 Azure Blob 存储读取空 blob 时，plain&#95;rewritable 磁盘出现 `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` 错误的问题。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复在 Nullable(JSON) 上执行 GROUP BY 时的问题。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了物化视图的一个问题：如果一个物化视图被创建、删除后又以相同名称重新创建，则可能无法正常工作。[#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 在从 *cluster 系列函数读取时，如果所有副本都不可用则失败。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher)).
* 修复由于 `Buffer` 表导致的 `MergesMutationsMemoryTracking` 泄漏，并修复用于从 `Kafka`（及其他）进行流式读取的 `query_views_log`。[#86422](https://github.com/ClickHouse/ClickHouse/pull/86422)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在删除别名存储的引用表后执行 `SHOW TABLES` 的行为。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复在启用 `send_chunk_header` 且通过 HTTP 协议调用 UDF 时分块头缺失的问题。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在启用 jemalloc profile 刷新功能时可能发生的死锁。[#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* 修复 DeltaLake 表引擎中子列读取问题。关闭 [#86204](https://github.com/ClickHouse/ClickHouse/issues/86204)。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 正确处理回环主机 ID，避免在处理 DDL 任务时发生冲突。[#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复了针对包含 numeric/decimal 列的 Postgres 数据库引擎表的 detach/attach 操作。[#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher))。
* 修复在 getSubcolumnType 中使用未初始化内存的问题。[#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano)).
* 函数 `searchAny` 和 `searchAll` 在以空 needle 调用时现在会返回 `true`（即“匹配任意内容”）。之前它们会返回 `false`。（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复函数 `timeSeriesResampleToGridWithStaleness()` 在第一个 bucket 没有值时的行为。[#86507](https://github.com/ClickHouse/ClickHouse/pull/86507)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 修复由于将 `merge_tree_min_read_task_size` 设置为 0 引发的崩溃问题。[#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 读取时会从 Iceberg 元数据中获取每个数据文件的格式（此前是从表参数中获取）。 [#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* 在关闭时刷新日志的过程中忽略异常，使关闭过程更加安全（避免 SIGSEGV）。[#86546](https://github.com/ClickHouse/ClickHouse/pull/86546)（[Azat Khuzhin](https://github.com/azat)）。
* 修复 `Backup` 数据库引擎在查询包含大小为零的分片文件时抛出异常的问题。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* 修复在启用 `send_chunk_header` 并通过 HTTP 协议调用 UDF 时缺失 chunk header 的问题。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复由于 keeper 会话过期导致的 S3Queue 逻辑错误 &quot;Expected current processor {} to be equal to {}&quot;。[#86615](https://github.com/ClickHouse/ClickHouse/pull/86615)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了插入和分区裁剪中的可空性缺陷。已关闭 [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407)。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630)（[scanhex12](https://github.com/scanhex12)）。
* 如果已禁用 Iceberg 元数据缓存，请不要禁用文件系统缓存。 [#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了 parquet reader v3 中出现的 “Deadlock in Parquet::ReadManager (single-threaded)” 错误。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 ArrowFlight 的 `listen_host` 对 IPv6 的支持。[#86664](https://github.com/ClickHouse/ClickHouse/pull/86664)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 修复 `ArrowFlight` 处理程序中的关闭逻辑。此 PR 解决了 [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596)。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 通过设置 `describe_compact_output=1` 修复分布式查询问题。[#86676](https://github.com/ClickHouse/ClickHouse/pull/86676) ([Azat Khuzhin](https://github.com/azat)).
* 修复窗口定义的解析和查询参数的应用。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* 修复在使用 `PARTITION BY` 创建表但未使用分区通配符时，错误抛出异常 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` 的问题；这种用法在 25.8 之前的版本中是可行的。关闭：[https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567)。[#86748](https://github.com/ClickHouse/ClickHouse/pull/86748)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复并行查询尝试获取同一个锁时出现的 LogicalError。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在 RowBinary 输入格式中将 NULL 写入 JSON 共享数据的问题，并在 ColumnObject 中增加一些额外的校验。[#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在使用 `limit` 时空 `Tuple` 的排列问题。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar)).
* 不要为持久化处理节点使用单独的 keeper 节点。用于修复 [https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995)。关闭了 [#86406](https://github.com/ClickHouse/ClickHouse/issues/86406)。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 TimeSeries 引擎表导致无法在 Replicated Database 中创建新副本的问题。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复当任务缺少某些 Keeper 节点时对 `system.distributed_ddl_queue` 的查询问题。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在解压后数据块末尾进行定位时的问题。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* 在异步执行 Iceberg Iterator 期间抛出的进程异常。[#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* 修复保存大体积预处理 XML 配置时的问题。[#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* 修复 `system.iceberg&#95;metadata&#95;log` 表中日期字段填充逻辑的问题。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* 修复了在使用 `WHERE` 时对 `TTL` 的无限重算问题。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在使用 `ROLLUP` 和 `CUBE` 修饰符时，`uniqExact` 函数可能返回不正确结果的问题。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在 `parallel_replicas_for_cluster_functions` 设置为 1 时使用 `url()` 表函数解析表结构的问题。[#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 在将 `PREWHERE` 拆分为多个步骤后，正确对其输出进行类型转换。[#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复了使用 `ON CLUSTER` 子句的轻量级更新问题。[#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ)).
* 修复部分带有 `String` 参数的聚合函数状态的兼容性问题。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了一个来自 OpenAI 的模型名称未被正确传递的问题。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB：路径必须位于 user&#95;files 目录内。[#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在 25.1 之前创建的 KeeperMap 表在执行 DROP 查询后仍会在 ZooKeeper 中遗留数据的问题。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复在读取 Parquet 时对 map 和 array 字段 ID 的处理问题。 [#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* 修复惰性物化（lazy materialization）中读取带有 array sizes 子列的数组时的问题。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 CASE 函数在使用 Dynamic 参数时的问题。[#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 CSV 中将空字符串解析为空数组的问题。[#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复非关联 `EXISTS` 可能产生错误结果的问题。该问题是在引入 `execute_exists_as_scalar_subquery=1` 时出现的，此设置是在 [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) 中引入的，并影响 `25.8` 版本。修复 [#86415](https://github.com/ClickHouse/ClickHouse/issues/86415)。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 如果未配置 iceberg&#95;metadata&#95;log，但用户尝试获取 Iceberg 元数据调试信息，则抛出错误。修复空指针解引用问题。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik)).

#### 构建/测试/打包改进

* 修复与 abseil-cpp 20250814.0 的兼容性问题（参见 https://github.com/abseil/abseil-cpp/issues/1923）。 [#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat)).
* 将构建独立 WASM 词法分析器置于一个开关控制之下。 [#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复在不支持 `vmull_p64` 指令的较旧 ARM CPU 上构建 crc32c 的问题。 [#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos)).
* 使用 `openldap` 2.6.10。 [#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 不再尝试在 darwin 上拦截 `memalign`。 [#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 `krb5` 1.22.1-final。 [#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复在 `list-licenses.sh` 中解析 Rust crate 名称的问题。 [#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able)).

### ClickHouse 25.8 LTS 发布版本，2025-08-28 {#258}

#### 向后不兼容的变更

* 对于 JSON 中包含不同类型值的数组，推断为 `Array(Dynamic)` 而不是未命名的 `Tuple`。要恢复之前的行为，请禁用设置 `input_format_json_infer_array_of_dynamic_from_array_of_different_types`。[#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar))。
* 将 S3 延迟指标迁移为直方图，以提升一致性和简化性。[#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在默认表达式中，要求对包含点号的标识符使用反引号包裹，以防止其被解析为复合标识符。[#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 惰性物化仅在启用了 analyzer（默认启用）时可用，以避免同时维护无 analyzer 的模式——根据我们的经验，无 analyzer 模式在某些情况下（例如在条件中使用 `indexHint()` 时）会存在问题。[#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter))。
* 在 Parquet 输出格式中，默认将 `Enum` 类型的值写为逻辑类型为 `ENUM` 的 `BYTE_ARRAY`。[#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar))。
* 默认启用 MergeTree 设置 `write_marks_for_substreams_in_compact_parts`。这显著提升从新创建的 Compact part 中读取子列的性能。版本低于 25.5 的服务器将无法读取新的 Compact part。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar))。
* 之前 `concurrent_threads_scheduler` 的默认值是 `round_robin`，在存在大量单线程查询（例如 INSERT）时被证明是不公平的。此次更改将更安全的 `fair_round_robin` 调度器设为默认值。[#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa))。
* ClickHouse 支持 PostgreSQL 风格的 heredoc 语法：`$tag$ string contents... $tag$`，也称为 dollar-quoted 字符串字面量。在之前的版本中，对 tag 的限制更少：它们可以包含任意字符，包括标点和空白。这会与同样可以以美元符号开头的标识符产生解析歧义。同时，PostgreSQL 仅允许在 tag 中使用“单词字符”（字母、数字和下划线）。为解决该问题，我们现在将 heredoc 的 tag 限制为只能包含单词字符。据此关闭 [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731)。[#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 函数 `azureBlobStorage`、`deltaLakeAzure` 和 `icebergAzure` 已更新，以正确校验 `AZURE` 权限。所有集群变体函数（`-Cluster` 函数）现在会针对其对应的非集群函数验证权限。此外，`icebergLocal` 和 `deltaLakeLocal` 函数现在会强制执行 `FILE` 权限检查。[#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 默认启用 `allow_dynamic_metadata_for_data_lakes` 设置（表引擎级别设置）。[#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik))。
* 默认禁用在 JSON 格式中对 64 位整数加引号。[#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))

#### 新功能

* 已添加对 PromQL 方言的基本支持。要使用它，请在 clickhouse-client 中设置 `dialect='promql'`，并通过设置 `promql_table_name='X'` 将其指向 TimeSeries 表，然后执行类似 `rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` 的查询。此外，还可以通过 SQL 包装 PromQL 查询：`SELECT * FROM prometheusQuery('up', ...);`。目前仅支持 `rate`、`delta` 和 `increase` 函数。不支持一元/二元运算符，也不提供 HTTP API。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI 驱动的 SQL 生成功能现在可以在环境中自动读取 ANTHROPIC&#95;API&#95;KEY 和 OPENAI&#95;API&#95;KEY（如果存在），从而实现零配置即可使用此功能。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik)).
* 通过添加以下内容来实现对 [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) 协议的支持：- 新增表函数 `arrowflight`。[#74184](https://github.com/ClickHouse/ClickHouse/pull/74184)（[zakr600](https://github.com/zakr600)）。
* 现在所有表都支持 `_table` 虚拟列（不仅限于使用 `Merge` 引擎的表），这对于包含 UNION ALL 的查询尤其有用。[#63665](https://github.com/ClickHouse/ClickHouse/pull/63665)（[Xiaozhe Yu](https://github.com/wudidapaopao)）。
* 允许在外部聚合/排序中使用任意存储策略（例如 S3 等对象存储）。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 基于显式指定的 IAM 角色实现 AWS S3 身份验证；为 GCS 实现 OAuth 支持。这些特性此前仅在 ClickHouse Cloud 中可用，现在已经开源。统一部分接口，例如对象存储连接参数的序列化方式。[#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 支持 Iceberg TableEngine 的 position delete 操作。[#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik))。
* 支持 Iceberg Equality Deletes。[#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991))。
* 为 `CREATE` 操作提供 Iceberg 写入支持。关闭 [#83927](https://github.com/ClickHouse/ClickHouse/issues/83927)。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 用于写操作的 Glue 目录。[#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持通过 Iceberg REST 目录进行写入。[#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 将所有 Iceberg 位置删除（position delete）文件合并到数据文件中。这将减少 Iceberg 存储中 Parquet 文件的数量和大小。语法：`OPTIMIZE TABLE table_name`。[#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 支持对 Iceberg 表执行 `drop table`（从 REST/Glue 目录中移除该表并删除其元数据）。 [#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 为 merge-on-read 格式的 Iceberg 表增加对 ALTER DELETE 变更操作的支持。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持写入 DeltaLake。关闭了 [#79603](https://github.com/ClickHouse/ClickHouse/issues/79603)。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 新增设置 `delta_lake_snapshot_version`，用于在表引擎 `DeltaLake` 中读取指定的快照版本。[#85295](https://github.com/ClickHouse/ClickHouse/pull/85295)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在元数据（manifest 条目）中写入更多 Iceberg 统计信息（列大小、下界和上界），以改进 min-max 剪枝。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 支持在 Iceberg 中对简单类型的列执行新增/删除/修改操作。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg：支持写入 version-hint 文件，关闭了 [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097)。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 由临时用户创建的视图现在会存储一份对应真实用户的副本，并且在该临时用户被删除后不再失效。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* 向量相似索引现在支持二进制量化。二进制量化可显著降低内存消耗，并加快构建向量索引的过程（因为距离计算更快）。此外，现有的参数 `vector_search_postfilter_multiplier` 已被废弃，替换为更通用的参数：`vector_search_index_fetch_multiplier`。 [#85024](https://github.com/ClickHouse/ClickHouse/pull/85024) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 在 `s3` 或 `s3Cluster` 表引擎/函数中允许使用键值对形式的参数，例如：`s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')`。 [#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 新增一个系统表，用于保存来自 Kafka 等引擎的出错传入消息（“死信队列”）。[#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn)).
* 用于 Replicated 数据库的新命令 SYSTEM RESTORE DATABASE REPLICA，类似于现有的 ReplicatedMergeTree 恢复功能。[#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov))。
* PostgreSQL 协议现已支持 `COPY` 命令。[#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 新增对 MySQL 协议的 C# 客户端支持。此更改关闭了 [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992)。[#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 新增对 Hive 分区风格的读写支持。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* 添加 `zookeeper_connection_log` 系统表，用于存储 ZooKeeper 连接的历史信息。[#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 服务器端设置 `cpu_slot_preemption` 启用工作负载的抢占式 CPU 调度，并确保在各个工作负载之间实现 CPU 时间的 max-min 公平分配。新增了用于 CPU 限制的工作负载设置：`max_cpus`、`max_cpu_share` 和 `max_burst_cpu_seconds`。更多详情：[https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#80879](https://github.com/ClickHouse/ClickHouse/pull/80879)（[Sergei Trifonov](https://github.com/serxa)）。
* 在达到配置的查询次数或时间阈值后主动关闭 TCP 连接。这有助于在负载均衡器后方的集群节点之间实现更均匀的连接分布。解决 [#68000](https://github.com/ClickHouse/ClickHouse/issues/68000)。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* 并行副本现在支持在查询中使用投影功能。[#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。[#82807](https://github.com/ClickHouse/ClickHouse/pull/82807)（[zoomxi](https://github.com/zoomxi)）。
* 在原有对 DESCRIBE (SELECT ...) 的支持基础上，新增对 DESCRIBE SELECT 的支持。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 强制对 mysql&#95;port 和 postgresql&#95;port 使用安全连接。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* 用户现在可以使用 `JSONExtractCaseInsensitive`（以及 `JSONExtract` 的其他变体）进行不区分大小写的 JSON 键查找。[#83770](https://github.com/ClickHouse/ClickHouse/pull/83770)（[Alistair Evans](https://github.com/alistairjevans)）。
* 引入 `system.completions` 表，解决 [#81889](https://github.com/ClickHouse/ClickHouse/issues/81889)。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m))。
* 新增了函数 `nowInBlock64`。示例用法：`SELECT nowInBlock64(6)` 返回 `2025-07-29 17:09:37.775725`。[#84178](https://github.com/ClickHouse/ClickHouse/pull/84178) ([Halersson Paris](https://github.com/halersson)).
* 为 AzureBlobStorage 添加 extra&#95;credentials，用于通过 client&#95;id 和 tenant&#95;id 进行身份验证。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* 新增函数 `dateTimeToUUIDv7`，用于将 DateTime 值转换为 UUIDv7。示例用法：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` 返回 `0198af18-8320-7a7d-abd3-358db23b9d5c`。[#84319](https://github.com/ClickHouse/ClickHouse/pull/84319)（[samradovich](https://github.com/samradovich)）。
* `timeSeriesDerivToGrid` 和 `timeSeriesPredictLinearToGrid` 聚合函数，用于将数据重新采样到由指定起始时间戳、结束时间戳和步长定义的时间网格，并分别计算类似 PromQL 中 `deriv` 和 `predict_linear` 的结果。[#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0))。
* 新增两个 TimeSeries 函数：- `timeSeriesRange(start_timestamp, end_timestamp, step)`，- `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`。[#85435](https://github.com/ClickHouse/ClickHouse/pull/85435)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 新增语法 `GRANT READ ON S3('s3://foo/.*') TO user`。[#84503](https://github.com/ClickHouse/ClickHouse/pull/84503)（[pufit](https://github.com/pufit)）。
* 新增 `Hash` 作为一种新的输出格式。它会为结果的所有列和所有行计算一个单个的哈希值。这对于计算结果的“指纹”非常有用，例如在数据传输成为瓶颈的场景中。示例：`SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` 返回 `e5f9e676db098fdb9530d2059d8c23ef`。[#84607](https://github.com/ClickHouse/ClickHouse/pull/84607)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 Keeper Multi 查询中支持设置任意 watch。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 为 `clickhouse-benchmark` 工具添加了选项 `--max-concurrency`，用于启用一种模式，以逐步增加并行查询的数量。[#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* 支持部分聚合指标。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### 实验性特性

* 默认启用对关联子查询的支持，该功能不再是实验性功能。[#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd))。
* Unity、Glue、REST 和 Hive Metastore 数据湖目录由实验性阶段提升为 beta 阶段。[#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator))。
* 轻量级更新和删除功能由实验性阶段提升为 beta 阶段。
* 基于向量相似度索引的近似向量搜索现已达到 GA 阶段。[#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze))。
* 支持 Ytsaurus 表引擎和表函数。[#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 之前，文本索引数据会被划分为多个分段（每个分段的默认大小为 256 MiB）。这可能在构建文本索引时降低内存消耗，但会增加磁盘空间占用并延长查询响应时间。[#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov))。

#### 性能优化

* 新的 Parquet 读取器实现。通常更快，并支持页面级过滤下推和 PREWHERE。目前为实验性功能。通过设置 `input_format_parquet_use_native_reader_v3` 启用。[#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321))。
* 用我们自研的 HTTP 客户端实现替换了 Azure 库中官方的 HTTP 传输层，用于访问 Azure Blob Storage。为该客户端引入了多项配置选项，这些选项与 S3 的配置保持一致。为 Azure 和 S3 都引入了更激进的连接超时机制。改进了对 Azure profile 事件和指标的观测能力。新客户端默认启用，在基于 Azure Blob Storage 的冷查询场景下显著降低了延迟。旧的 `Curl` 客户端可以通过设置 `azure_sdk_use_native_client=false` 恢复使用。[#83294](https://github.com/ClickHouse/ClickHouse/pull/83294)（[alesapin](https://github.com/alesapin)）。此前官方提供的 Azure 客户端实现由于出现极其严重的延迟尖峰（从 5 秒到数分钟不等），完全不适合在生产环境中使用。我们已经彻底弃用那套糟糕的实现，并对此感到非常自豪。
* 按文件大小递增的顺序处理索引。综合考虑后的索引排序会优先处理 minmax 索引和向量索引（分别因为其实现简单和高选择性），然后是其他较小的索引。在 minmax/向量索引之间的排序中，也会优先选择更小的索引。[#84094](https://github.com/ClickHouse/ClickHouse/pull/84094)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* 默认启用 MergeTree 设置 `write_marks_for_substreams_in_compact_parts`。这将显著提升从新创建的 Compact 部分读取子列的性能。服务器版本低于 25.5 的实例将无法读取新的 Compact 部分。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* `azureBlobStorage` table engine: 在可能的情况下缓存并复用托管身份验证令牌，以避免触发限流。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak)).
* 如果右侧在连接键列上由函数依赖唯一确定（即所有行的连接键值唯一），则所有 `ALL` `LEFT/INNER` JOIN 将会自动转换为 `RightAny`。[#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat))。
* 除 `max_joined_block_size_rows` 外，新增 `max_joined_block_size_bytes`，用于限制包含大列的 JOIN 的内存使用量。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 添加了新的逻辑（由设置 `enable_producing_buckets_out_of_order_in_aggregation` 控制，默认启用），允许在节省内存的聚合过程中无序发送部分 bucket。当某些聚合 bucket 的合并耗时明显长于其他 bucket 时，该逻辑通过允许发起端在此期间先合并具有更高 bucket ID 的 bucket 来提升性能。其缺点是可能会增加内存使用量（预计不会很显著）。[#80179](https://github.com/ClickHouse/ClickHouse/pull/80179)（[Nikita Taranov](https://github.com/nickitat)）。
* 引入了 `optimize_rewrite_regexp_functions` 设置（默认启用），在检测到特定正则表达式模式时，允许优化器将某些 `replaceRegexpAll`、`replaceRegexpOne` 和 `extract` 调用重写为更简单且更高效的形式（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* 将对 `max_joined_block_rows` 的处理移到哈希 JOIN 主循环之外。对 ALL JOIN 略有性能提升。[#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 优先处理粒度更高的 min-max 索引。关闭 [#75381](https://github.com/ClickHouse/ClickHouse/issues/75381)。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* 使 `DISTINCT` 窗口聚合以线性时间运行，并修复 `sumDistinct` 中的一个错误。Closes [#79792](https://github.com/ClickHouse/ClickHouse/issues/79792). Closes [#52253](https://github.com/ClickHouse/ClickHouse/issues/52253). [#79859](https://github.com/ClickHouse/ClickHouse/pull/79859) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 使用量，从而以更低的延迟完成。[#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 使用 Rendezvous 哈希改进并行副本之间负载分配的缓存局部性。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 为 If 组合器实现了 `addManyDefaults`，从而带有 If 组合器的聚合函数运行得更快。[#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano))。
* 在对多个字符串或数字列执行 `GROUP BY` 时，以列式方式计算序列化键。[#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li))。
* 当索引分析对并行副本读取得出空区间结果时，避免了全表扫描。[#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* 尝试使用 `-falign-functions=64`，以获得更稳定的性能测试结果。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* 现在，布隆过滤器索引也会用于形如 `has([c1, c2, ...], column)` 的条件，其中 `column` 不是 `Array` 类型。这样提升了此类查询的性能，使其效率与使用 `IN` 运算符相当。[#83945](https://github.com/ClickHouse/ClickHouse/pull/83945)（[Doron David](https://github.com/dorki)）。
* 减少在 CompressedReadBufferBase::readCompressedData 中不必要的 memcpy 调用。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 通过删除临时数据来优化 `largestTriangleThreeBuckets`。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 通过简化代码优化了字符串反序列化。解决了 [#38564](https://github.com/ClickHouse/ClickHouse/issues/38564)。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复了并行副本的最小任务大小计算。 [#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat)).
* 优化了在 `Join` 模式下应用补丁分片时的性能。 [#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* 移除零字节。关闭了 [#85062](https://github.com/ClickHouse/ClickHouse/issues/85062)。修复了一些次要错误。函数 `structureToProtobufSchema`、`structureToCapnProtoSchema` 未正确写入结尾的零终止字节，而是使用了换行符。这会导致输出中缺少换行符，并且在使用依赖于零字节的其他函数（例如 `logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero` 和 `encrypt`/`decrypt`）时可能引发缓冲区溢出。`regexp_tree` 字典布局不支持处理包含零字节的字符串。`formatRowNoNewline` 函数在使用 `Values` 格式或任何其他行末不带换行符的格式调用时，会错误地截断输出的最后一个字符。函数 `stem` 存在异常安全问题，在极少数情况下可能导致内存泄漏。`initcap` 函数对 `FixedString` 参数的行为不正确：如果同一数据块中前一个字符串以单词字符结束，它无法在当前字符串开头识别单词的起始位置。修复了 Apache `ORC` 格式的一个安全漏洞，该漏洞可能导致未初始化内存的泄露。修改了函数 `replaceRegexpAll` 及其对应别名 `REGEXP_REPLACE` 的行为：现在即使前一个匹配已经处理了整个字符串（例如在 `^a*|a*$` 或 `^|.*` 的情况下），它在字符串末尾仍然可以进行一次空匹配——这与 JavaScript、Perl、Python、PHP、Ruby 的语义一致，但不同于 PostgreSQL 的语义。简化并优化了许多函数的实现。若干函数的文档此前存在错误，现已修正。请注意，`byteSize` 对 String 列以及由 String 列组成的复杂类型的输出已发生变化（每个空字符串从 9 字节变为 8 字节），这是预期行为。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在仅为返回单行结果而进行常量实体化的场景下，对该过程进行了优化。[#85071](https://github.com/ClickHouse/ClickHouse/pull/85071)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使用 delta-kernel-rs 后端改进并行文件处理。[#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新增了一个设置：enable&#95;add&#95;distinct&#95;to&#95;in&#95;subqueries。启用后，ClickHouse 会在分布式查询的 IN 子句中自动为子查询添加 DISTINCT。这样可以显著减少在分片之间传输的临时表大小，从而提高网络传输效率。注意：这是一种权衡——虽然可以减少网络传输，但每个节点上需要执行额外的合并（去重）工作。当网络传输成为瓶颈且可以接受合并开销时，建议启用该设置。[#81908](https://github.com/ClickHouse/ClickHouse/pull/81908)（[fhw12345](https://github.com/fhw12345)）。
* 降低执行用户自定义函数时的查询内存跟踪开销。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* 在 `DeltaLake` 存储引擎中实现基于 `delta-kernel-rs` 的内部过滤（统计信息与分区剪枝）。[#84006](https://github.com/ClickHouse/ClickHouse/pull/84006)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 以更细粒度的方式禁用依赖于在线更新列或由 patch parts 更新列的跳过索引。现在，这些跳过索引只会在受在线变更或 patch parts 影响的 part 中不再使用；之前，这些索引会在所有 part 中被禁用。[#84241](https://github.com/ClickHouse/ClickHouse/pull/84241)（[Anton Popov](https://github.com/CurtizJ)）。
* 仅为加密命名集合的 encrypted&#95;buffer 分配所需的最小内存。[#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* 改进了对 Bloom filter 索引（regular、ngram 和 token）的支持，以便在第一个参数为常量数组（集合）、第二个参数为建立索引的列（子集）时也能利用这些索引，从而更高效地执行查询。[#84700](https://github.com/ClickHouse/ClickHouse/pull/84700)（[Doron David](https://github.com/dorki)）。
* 减少 Keeper 中存储锁的竞争。[#84732](https://github.com/ClickHouse/ClickHouse/pull/84732)（[Antonio Andelic](https://github.com/antonio2368)）。
* 为 `WHERE` 子句补充对缺失的 `read_in_order_use_virtual_row` 的支持。这样可以在过滤条件未完全下推到 `PREWHERE` 的查询中，跳过读取更多的数据分片。[#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 允许对 Iceberg 表中的对象进行异步迭代，而无需为每个数据文件显式存储对象。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik)).
* 将非关联的 `EXISTS` 作为标量子查询来执行。这样可以使用标量子查询缓存并对结果进行常量折叠，这对索引很有帮助。为兼容性新增了设置 `execute_exists_as_scalar_subquery=1`。[#85481](https://github.com/ClickHouse/ClickHouse/pull/85481)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。

#### 改进

* 添加 `database_replicated` 设置，用于定义 `DatabaseReplicatedSettings` 的默认值。如果在创建 Replicated 数据库的查询中未包含该设置，则会使用这里配置的值。 [#85127](https://github.com/ClickHouse/ClickHouse/pull/85127) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 现可在 Web UI（play）中调整表格列宽度。[#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki))。
* 通过 `iceberg_metadata_compression_method` 设置支持压缩的 `.metadata.json` 文件。该设置支持 ClickHouse 的所有压缩方法。解决了 [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895)。[#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 `EXPLAIN indexes = 1` 的输出中显示要读取的范围数量。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm)).
* 新增用于设置 ORC 压缩块大小的配置项，并将其默认值从 64KB 更新为 256KB，以与 Spark 或 Hive 保持一致。[#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li))。
* 在 Wide part 中添加 `columns_substreams.txt` 文件，用于跟踪该 part 中存储的所有子流。这样可以跟踪 JSON 和 Dynamic 类型中的动态子流，从而避免为获取动态子流列表（例如用于计算列大小）而去读取这些列的样本。此外，现在所有动态子流也都会体现在 `system.parts_columns` 中。[#81091](https://github.com/ClickHouse/ClickHouse/pull/81091)（[Pavel Kruglov](https://github.com/Avogar)）。
* 为 clickhouse format 命令添加 CLI 选项 --show&#95;secrets，使其默认隐藏敏感数据。[#81524](https://github.com/ClickHouse/ClickHouse/pull/81524)（[Nikolai Ryzhov](https://github.com/Dolaxom)）。
* 在 HTTP 套接字层面对 S3 读写请求进行限流（而不是对整个 S3 请求限流），以避免与 `max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server` 的限流机制产生冲突。[#81837](https://github.com/ClickHouse/ClickHouse/pull/81837)（[Sergei Trifonov](https://github.com/serxa)）。
* 允许在窗口函数中，对同一列在不同窗口使用不同的排序规则（collation）。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 新增一个用于模拟、可视化和比较 merge selector 的工具。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa)).
* 当在 `address_expression` 参数中指定集群时，为使用并行副本的 `remote*` 表函数添加支持。同时修复 [#73295](https://github.com/ClickHouse/ClickHouse/issues/73295)。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* 将所有与写入备份文件相关的日志消息级别设置为 TRACE。[#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 名称或编解码器比较特殊的用户定义函数，可能会在 SQL 格式化器中出现不一致的格式化结果。此更改修复了 [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092)。[#83644](https://github.com/ClickHouse/ClickHouse/pull/83644)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 用户现在可以在 JSON 类型中使用 Time 和 Time64 类型。[#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 现在，使用并行副本的 JOIN 现已采用新的 JOIN 逻辑步骤。如果在使用并行副本的 JOIN 查询时遇到任何问题，请尝试执行 `SET query_plan_use_new_logical_join_step=0`，并提交 issue。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复 `cluster_function_process_archive_on_multiple_nodes` 的兼容性问题。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持在 `S3Queue` 表级别更改物化视图插入相关设置。新增 `S3Queue` 级别设置：`min_insert_block_size_rows_for_materialized_views` 和 `min_insert_block_size_bytes_for_materialized_views`。默认情况下将使用 profile 级别的设置，`S3Queue` 级别的设置会覆盖这些设置。[#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 新增了 profile 事件 `MutationAffectedRowsUpperBound`，用于显示一次变更操作（mutation）中受影响的行数（例如，在 `ALTER UPDATE` 或 `ALTER DELETE` 查询中满足条件的行总数）。[#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ))。
* 使用 cgroup 的信息（在适用情况下，即启用了 `memory_worker_use_cgroup` 且 cgroups 可用）来调整内存跟踪器（`memory_worker_correct_memory_tracker`）。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat)).
* MongoDB：字符串向数值类型的隐式解析。此前，如果从 MongoDB 源为 ClickHouse 表中的数值列收到字符串值，则会抛出异常。现在，引擎会尝试自动从字符串中解析出数值。修复了 [#81167](https://github.com/ClickHouse/ClickHouse/issues/81167)。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 在 `Pretty` 格式中高亮显示 `Nullable` 数字的数字分组。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard：顶部的工具提示现在不会溢出其容器。[#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 仪表板上的点看起来稍微更美观一些。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard 现在的 favicon 略有改进。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI：允许浏览器保存密码，同时也会记住 URL 的值。[#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增支持使用 `apply_to_children` 配置为特定 Keeper 节点应用额外的 ACL。[#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 MergeTree 中 &quot;compact&quot; Variant 判别器序列化的用法。之前在某些本可以使用的情况下没有被使用。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* 在复制数据库设置中新增了一个服务器级设置 `logs_to_keep`，用于修改复制数据库的默认 `logs_to_keep` 参数。较低的取值会减少 ZNode 的数量（尤其是在存在大量数据库时），而较高的取值则允许缺失副本在更长时间后仍能追上进度。[#84183](https://github.com/ClickHouse/ClickHouse/pull/84183)（[Alexey Khatskevich](https://github.com/Khatskevich)）。
* 添加设置项 `json_type_escape_dots_in_keys`，用于在 JSON 类型解析过程中对 JSON 键中的点号进行转义。该设置默认关闭。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar))。
* 在检查 EOF 之前先检查连接是否已被取消，以防止对已关闭的连接进行读取。修复了 [#83893](https://github.com/ClickHouse/ClickHouse/issues/83893)。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 略微优化了 Web UI 中文本选中时的颜色。只有在深色模式下选中的表格单元格中差异才较为明显。在之前的版本中，文本与选中背景之间的对比度不足。[#84258](https://github.com/ClickHouse/ClickHouse/pull/84258)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过简化内部检查，改进了在服务器关闭时对客户端连接的处理。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 新增配置项 `delta_lake_enable_expression_visitor_logging`，用于关闭表达式访问器日志，因为在调试时，即使在测试日志级别下，它们的输出也可能过于冗长。[#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 现在会同时上报 cgroup 级和系统级的指标。cgroup 级指标命名为 `CGroup&lt;Metric&gt;`，操作系统级指标（从 procfs 收集）命名为 `OS&lt;Metric&gt;`。[#84317](https://github.com/ClickHouse/ClickHouse/pull/84317)（[Nikita Taranov](https://github.com/nickitat)）。
* Web UI 中的图表略有改进。变化不大，但确实更好。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 将 Replicated 数据库设置项 `max_retries_before_automatic_recovery` 的默认值更改为 10，以便在某些情况下可以更快恢复。[#84369](https://github.com/ClickHouse/ClickHouse/pull/84369)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 修复带查询参数占位符的 `CREATE USER` 语句的格式（即 `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。[#84376](https://github.com/ClickHouse/ClickHouse/pull/84376) ([Azat Khuzhin](https://github.com/azat))。
* 引入 `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor`，用于配置在备份和恢复操作期间所使用的 S3 重试退避策略。[#84421](https://github.com/ClickHouse/ClickHouse/pull/84421) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复 S3Queue 有序模式：如果已调用关闭，则提前退出。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持向 Iceberg 写入，以便通过 pyiceberg 进行读取。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 在将 `IN` / `GLOBAL IN` 过滤条件下推到键值存储的主键（例如 EmbeddedRocksDB、KeeperMap）时，允许对 IN 集合中的值进行类型转换。[#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa)).
* 将 chdig 升级至 [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1)。[#84521](https://github.com/ClickHouse/ClickHouse/pull/84521)（[Azat Khuzhin](https://github.com/azat)）。
* 在执行 UDF 期间发生的底层错误现在会统一返回错误码 `UDF_EXECUTION_FAILED`，而此前可能会返回不同的错误码。[#84547](https://github.com/ClickHouse/ClickHouse/pull/84547)（[Xu Jia](https://github.com/XuJia0210)）。
* 在 KeeperClient 中添加 `get_acl` 命令。[#84641](https://github.com/ClickHouse/ClickHouse/pull/84641)（[Antonio Andelic](https://github.com/antonio2368)）。
* 为数据湖表引擎添加快照版本支持。[#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton))。
* 为 `ConcurrentBoundedQueue` 的大小添加一个带维度的指标，并按队列类型（即该队列的用途）和队列 ID（即当前队列实例随机生成的 ID）进行标注。[#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `system.columns` 表现在为现有的 `name` 列提供名为 `column` 的别名。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang))。
* 新增 MergeTree 设置 `search_orphaned_parts_drives`，用于限定查找数据片时的范围，例如仅在具有本地元数据的磁盘上查找。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* 在 Keeper 中添加 4LW 命令 `lgrq`，用于切换对已接收请求的日志记录。[#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368)).
* 以不区分大小写的方式匹配 external auth 的 forward&#95;headers。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` 工具现在支持加密 ZooKeeper 连接。[#84764](https://github.com/ClickHouse/ClickHouse/pull/84764)（[Roman Vasin](https://github.com/rvasin)）。
* 为 `system.errors` 添加一个格式字符串列，以便在告警规则中按相同错误类型进行分组。[#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 已更新 `clickhouse-format`，现在接受 `--highlight` 作为 `--hilite` 的别名。 - 已更新 `clickhouse-client`，现在接受 `--hilite` 作为 `--highlight` 的别名。 - 更新了 `clickhouse-format` 文档以反映此更改。 [#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769)).
* 修复 Iceberg 复杂类型基于字段 ID 的读取问题。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 新增名为 `backup_slow_all_threads_after_retryable_s3_error` 的设置，在出现可重试错误（例如 `SlowDown`）引发的重试风暴时，通过在首次观察到可重试错误后减慢所有线程的速度，来降低对 S3 的压力。[#84854](https://github.com/ClickHouse/ClickHouse/pull/84854)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在 Replicated 数据库中，跳过为非追加型 RMV DDL 创建和重命名旧临时表的步骤。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 使用 `keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` 和 `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` 按条目数量限制 Keeper 日志缓存大小。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* 允许在不受支持的架构上使用 `simdjson`（之前会导致 `CANNOT_ALLOCATE_MEMORY` 错误）。[#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat))。
* 异步日志：将各项限制改为可调，并增加自检功能。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) （[Raúl Marín](https://github.com/Algunenano)）。
* 收集所有待删除的对象，以通过一次对象存储删除操作统一删除。[#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun))。
* Iceberg 当前对 positional delete 文件的实现会将所有数据都保留在内存中。如果 positional delete 文件很大（这种情况很常见），代价就会非常高。我的实现只在内存中保留 Parquet delete 文件的最后一个行组（row-group），大幅降低了内存开销。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* chdig：修复屏幕残留内容，修复在编辑器中编辑查询后发生的崩溃问题，在 `path` 中搜索 `editor`，更新至 [25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1)。[#85341](https://github.com/ClickHouse/ClickHouse/pull/85341)（[Azat Khuzhin](https://github.com/azat)）。
* 在 Azure 配置中补全缺失的 `partition_columns_in_data_file`。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos)).
* 在函数 `timeSeries*ToGrid` 中允许步长为 0。这是 [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) 的一部分。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 添加了 `show_data_lake_catalogs_in_system_tables` 标志，用于控制是否在 `system.tables` 中添加数据湖表。解决了 [#85384](https://github.com/ClickHouse/ClickHouse/issues/85384)。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 在 `remote_fs_zero_copy_zookeeper_path` 中新增了对宏展开的支持。[#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme))。
* clickhouse-client 中的 AI 显示效果将略有改进。[#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 默认对旧部署启用 trace&#95;log.symbolize。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 支持解析更多涉及复合标识符的场景。尤其是提升了 `ARRAY JOIN` 与旧分析器的兼容性。引入新的设置 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` 以保留旧行为。[#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在从 system.columns 获取各列大小时忽略 UNKNOWN&#95;DATABASE。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* 为补丁部分中的未压缩字节总量添加了一个限制（表级设置 `max_uncompressed_bytes_in_patches`）。这可以防止在执行轻量级更新后 `SELECT` 查询出现显著变慢，并防止轻量级更新可能被滥用。[#85641](https://github.com/ClickHouse/ClickHouse/pull/85641)（[Anton Popov](https://github.com/CurtizJ)）。
* 向 `system.grants` 添加 `parameter` 列，用于确定 `GRANT READ/WRITE` 的源类型以及 `GRANT TABLE ENGINE` 的表引擎。[#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 解决了在 `CREATE DICTIONARY` 查询中，如果在带参数的列（例如 `Decimal(8)`）之后的列后面存在尾随逗号时的解析问题。关闭 [#85586](https://github.com/ClickHouse/ClickHouse/issues/85586)。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 为 `nested` 函数添加对内部数组的支持。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 所有由外部库进行的内存分配现在都可以被 ClickHouse 的内存追踪器感知并正确计入。这可能会导致某些查询报告的内存使用量看起来“增加”，或者因 `MEMORY_LIMIT_EXCEEDED` 而报错。 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。

#### Bug 修复（官方稳定版中对用户可见的异常行为）

* 此 PR 修复了通过 REST catalog 查询 Iceberg 表时的元数据解析逻辑。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* 修复 DDLWorker 和 DatabaseReplicatedDDLWorker 中的 markReplicasActive。[#81395](https://github.com/ClickHouse/ClickHouse/pull/81395)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复在解析失败时 Dynamic 列回滚的问题。 [#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar)).
* 函数 `trim` 在使用全常量输入调用时，现在会产生一个常量输出字符串。（缺陷 [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复在启用 `optimize_syntax_fuse_functions` 时因重复子查询导致的逻辑错误，关闭 [#75511](https://github.com/ClickHouse/ClickHouse/issues/75511)。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 修复了在启用查询条件缓存（设置 `use_query_condition_cache`）时，包含 `WHERE ... IN (&lt;subquery&gt;)` 子句的查询返回结果不正确的问题。[#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you))。
* 此前，`gcs` 函数在使用时不需要任何访问权限。现在在使用时会检查是否具有 `GRANT READ ON S3` 权限。修复了 [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567)。[#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* 在通过 INSERT SELECT 从 s3Cluster() 向 replicated MergeTree 插入数据时跳过不可用节点。[#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter))。
* 修复在 MergeTree 中用于实验性事务的追加写入在 `plain_rewritable`/`plain` 元数据类型下被忽略的问题，此前这些类型会被直接忽略。[#83695](https://github.com/ClickHouse/ClickHouse/pull/83695)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 对 Avro schema registry 的认证信息进行掩码处理，使其对用户不可见，并且不会出现在日志中。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 修复以下问题：当使用 `add_minmax_index_for_numeric_columns=1` 或 `add_minmax_index_for_string_columns=1` 创建 MergeTree 表时，索引会在之后的 ALTER 操作中被物化，从而导致 Replicated 数据库在新副本上无法正确完成初始化。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复了 Parquet writer 为 Decimal 类型输出错误统计值（最小值/最大值）的问题。[#83754](https://github.com/ClickHouse/ClickHouse/pull/83754)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复 `LowCardinality(Float32|Float64|BFloat16)` 类型中 NaN 值排序的问题。[#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 从备份恢复时，`definer` 用户可能不会被一并备份，从而导致整个备份失效。为了解决这个问题，我们在恢复过程中推迟对目标表创建操作的权限检查，仅在运行时进行检查。[#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit))。
* 修复由于在一次失败的 INSERT 之后连接被置于断开状态而导致客户端崩溃的问题。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* 在启用 analyzer 后，允许在 `remote` 表函数的 `view(...)` 参数中引用任意表。修复了 [#78717](https://github.com/ClickHouse/ClickHouse/issues/78717)。修复了 [#79377](https://github.com/ClickHouse/ClickHouse/issues/79377)。[#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* 在 jsoneachrowwithprogress 中，onprogress 回调的调用与最终收尾过程同步执行。[#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema)).
* 此更改解决了 [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303)。[#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 修复 `colorSRGBToOKLCH`/`colorOKLCHToSRGB` 中混用 const 和非 const 参数的问题。[#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat))。
* 修复在 RowBinary 格式中写入包含 NULL 值的 JSON 路径的问题。[#83923](https://github.com/ClickHouse/ClickHouse/pull/83923) ([Pavel Kruglov](https://github.com/Avogar)).
* 从 Date 转换为 DateTime64 时，大于 2106-02-07 的大日期值溢出问题已修复。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 始终应用 `filesystem_prefetches_limit`（而非仅在 `MergeTreePrefetchedReadPool` 中）。[#83999](https://github.com/ClickHouse/ClickHouse/pull/83999)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了一个罕见的错误：在执行 `MATERIALIZE COLUMN` 查询时，可能会在 `checksums.txt` 中出现非预期的文件记录，并最终导致数据分片被标记为 detached。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* 修复在基于不等条件执行 JOIN 时，当其中一列为 `LowCardinality` 而另一列为常量时出现的逻辑错误 `Expected single dictionary argument for function`。关闭 [#81779](https://github.com/ClickHouse/ClickHouse/issues/81779)。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在交互模式下启用语法高亮时 ClickHouse 客户端会崩溃的问题。[#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在查询条件缓存与递归 CTE 结合使用时产生错误结果的问题（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 在周期性 parts 刷新过程中正确处理异常。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 修复在相等运算两侧操作数类型不同或引用常量时，将过滤条件错误地合并进 JOIN 条件的问题。修复了 [#83432](https://github.com/ClickHouse/ClickHouse/issues/83432)。[#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在表包含投影、`lightweight_mutation_projection_mode = 'rebuild'`，且用户执行轻量级删除操作并从表中任意数据块中删除所有行时可能导致 ClickHouse 罕见崩溃的问题。[#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin)).
* 修复由后台取消检测线程导致的死锁。[#84203](https://github.com/ClickHouse/ClickHouse/pull/84203)（[Antonio Andelic](https://github.com/antonio2368)）。
* 修复在分析无效 `WINDOW` 定义时出现的无限递归问题。修复了 [#83131](https://github.com/ClickHouse/ClickHouse/issues/83131)。[#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了一个导致 Bech32 编码和解码结果不正确的 bug。之所以最初没有发现该 bug，是因为用于测试的该算法的在线实现存在相同问题。[#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov))。
* 修复了 `array()` 函数中空元组构造不正确的问题。此修复解决了 [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202)。[#84297](https://github.com/ClickHouse/ClickHouse/pull/84297)（[Amos Bird](https://github.com/amosbird)）。
* 修复在使用并行副本且包含多个 `INNER` 联接并在其后跟随 `RIGHT` 联接的查询中出现的 `LOGICAL_ERROR`。请勿对这类查询使用并行副本。[#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 此前，在检查粒度是否满足过滤条件时，`set` 索引不会考虑 `Nullable` 列（问题 [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 现在 ClickHouse 可以从 Glue Catalog 读取其中表类型使用小写指定的表。[#84316](https://github.com/ClickHouse/ClickHouse/pull/84316)（[alesapin](https://github.com/alesapin)）。
* 在存在 `JOIN` 或子查询的情况下，不要尝试将表函数替换为其集群版本。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复 `IAccessStorage` 中 logger 的使用。[#84365](https://github.com/ClickHouse/ClickHouse/pull/84365) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 修复了在对表中所有列执行轻量级更新时存在的逻辑错误。[#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ))。
* 编解码器 `DoubleDelta` 现在只能用于数值类型列。具体来说，`FixedString` 列不再支持使用 `DoubleDelta` 进行压缩。（修复了 [#80220](https://github.com/ClickHouse/ClickHouse/issues/80220)）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 在进行 `MinMax` 索引评估时，对 NaN 值的比较未使用正确的区间。[#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 修复使用惰性物化读取 Variant 列时的问题。[#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar)).
* 将 `zoutofmemory` 视为硬件错误，否则会抛出逻辑错误。参见 [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877)。[#84420](https://github.com/ClickHouse/ClickHouse/pull/84420)（[Han Fei](https://github.com/hanfei1991)）。
* 修复了以下场景下的服务器崩溃问题：当使用 `no_password` 创建的用户在服务器设置 `allow_no_password` 被修改为 0 后尝试登录时，服务器会崩溃。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 修复 Keeper 变更日志的乱序写入问题。此前，我们可能会有正在进行中的变更日志写入，但回滚操作可能会导致目标文件发生并发修改。这会导致日志不一致，并可能造成数据丢失。[#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368)).
* 现在，如果从表中移除了所有 TTL，MergeTree 将不再执行任何与 TTL 相关的操作。[#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin)).
* 此前允许执行带 LIMIT 的并行分布式 INSERT SELECT，但这是不正确的，会导致目标表中数据重复。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在数据湖中基于虚拟列进行文件裁剪的问题。 [#84520](https://github.com/ClickHouse/ClickHouse/pull/84520) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 Keeper 在使用 RocksDB 存储时的内存泄漏问题（迭代器未被销毁）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* 修复 ALTER MODIFY ORDER BY 未校验排序键中 TTL 列的问题。现在，在 ALTER 操作中如果在 ORDER BY 子句里使用 TTL 列，会被正确拒绝，从而防止潜在的表损坏。 [#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 在 25.5 之前的版本中，将 `allow_experimental_delta_kernel_rs` 的值修改为 `false` 以确保兼容性。[#84587](https://github.com/ClickHouse/ClickHouse/pull/84587) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 不再从 manifest 文件获取 schema，而是为每个快照单独存储相应的 schema。对每个数据文件，根据其所属快照推断对应的 schema。之前的行为违反了 Iceberg 规范中关于 manifest 文件中状态为 existing 的条目的要求。[#84588](https://github.com/ClickHouse/ClickHouse/pull/84588)（[Daniil Ivanik](https://github.com/divanik)）。
* 修复了在 Keeper 中将 `rotate_log_storage_interval` 设置为 `0` 时会导致 ClickHouse 崩溃的问题（issue [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975)）。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637)（[George Larionov](https://github.com/george-larionov)）。
* 修复 S3Queue 中导致 “Table is already registered” 的逻辑错误。解决 [#84433](https://github.com/ClickHouse/ClickHouse/issues/84433)。该问题在合并 [https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) 后出现。[#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 RefreshTask 中从 &#39;view&#39; 获取 ZooKeeper 时为 &#39;mutex&#39; 加锁。[#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在使用惰性列配合外部排序时出现的 `CORRUPTED_DATA` 错误。[#84738](https://github.com/ClickHouse/ClickHouse/pull/84738) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复存储 `DeltaLake` 中基于 delta-kernel 的列裁剪问题。关闭 [#84543](https://github.com/ClickHouse/ClickHouse/issues/84543)。[#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 DeltaLake 存储中刷新 delta-kernel 的凭证。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在出现连接问题后会启动不必要内部备份的情况。[#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar)).
* 修复了在查询存在延迟的远程数据源时，可能导致向量访问越界的问题。[#84820](https://github.com/ClickHouse/ClickHouse/pull/84820)（[George Larionov](https://github.com/george-larionov)）。
* `ngram` 和 `no_op` 分词器在处理空输入 token 时不再导致（实验性）文本索引崩溃。[#84849](https://github.com/ClickHouse/ClickHouse/pull/84849)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复了对使用 `ReplacingMergeTree` 和 `CollapsingMergeTree` 引擎的表执行轻量级更新时的问题。 [#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* 在使用 object queue 引擎的表的表元数据中正确保存所有设置。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复 Keeper 返回的 watches 总数。 [#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了在版本低于 25.7 的服务器上创建的 `ReplicatedMergeTree` 引擎表的轻量级更新问题。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* 修复了在运行 `ALTER TABLE ... REPLACE PARTITION` 查询后，对使用非复制 MergeTree 引擎的表执行轻量级更新时的问题。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* 修复布尔字面量的列名生成逻辑，使其使用 &quot;true&quot;/&quot;false&quot; 而不是 &quot;1&quot;/&quot;0&quot;，从而避免查询中布尔字面量与整数字面量之间的列名冲突。[#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复由后台调度池和执行器导致的内存跟踪偏移。[#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* 修复 Merge 表引擎中的潜在排序不准确问题。[#85025](https://github.com/ClickHouse/ClickHouse/pull/85025)（[Xiaozhe Yu](https://github.com/wudidapaopao)）。
* 补全 DiskEncrypted 缺失的 API。[#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 在分布式环境中使用关联子查询时增加检查以避免崩溃。修复了 [#82205](https://github.com/ClickHouse/ClickHouse/issues/82205)。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* 现在 Iceberg 不再尝试在多次 select 查询之间缓存相关的快照版本，而是始终在每次查询时重新解析快照。此前对 Iceberg 快照进行缓存的尝试，会在使用 Iceberg 表进行时间旅行（time travel）时导致问题。 [#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* 修复了 `AzureIteratorAsync` 中的重复释放问题。 [#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat)).
* 改进在尝试创建以 JWT 标识的用户时的错误消息。 [#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `ReplicatedMergeTree` 中补丁部件清理的行为。此前，轻量级更新的结果可能会在一段时间内在副本上暂时不可见，直到物化这些补丁部件的已合并或已变更部件从其他副本下载完成。 [#85121](https://github.com/ClickHouse/ClickHouse/pull/85121) ([Anton Popov](https://github.com/CurtizJ))。
* 当类型不同时，修复 mv 中的 illegal&#95;type&#95;of&#95;argument 错误。 [#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* 修复 delta-kernel 实现中的段错误。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在移动元数据文件耗时较长期间恢复复制数据库的问题。[#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复在 `additional_table_filters expression` 设置中，`IN (subquery)` 出现 `Not-ready Set` 的问题。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 在执行 SYSTEM DROP REPLICA 查询时去除不必要的 `getStatus()` 调用。修复了当表在后台被删除时会抛出 `Shutdown for storage is called` 异常的问题。[#85220](https://github.com/ClickHouse/ClickHouse/pull/85220)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复 `DeltaLake` 引擎中 delta-kernel 实现的竞态问题。[#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `DeltaLake` 引擎中禁用 delta-kernel 时读取分区数据失败的问题。该问题在 25.7 版本中被引入（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `CREATE OR REPLACE` 和 `RENAME` 查询中补充了遗漏的表名长度检查。[#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复当 DEFINER 被删除时，在 Replicated 数据库的新副本上创建 RMV 的问题。[#85327](https://github.com/ClickHouse/ClickHouse/pull/85327)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复 Iceberg 复杂类型写入问题。 [#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 不支持为复杂类型写入下界和上界。[#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复通过 Distributed 表或 remote 表函数调用对象存储相关函数读取数据时的逻辑错误。修复了以下问题：[#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 修复包含损坏投影的数据片段的备份。 [#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368)).
* 在各发行版本中禁止在投影（projection）中使用 `_part_offset` 列，直至其稳定为止。[#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* 修复在对 JSON 执行 ALTER UPDATE 时发生的崩溃和数据损坏。[#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar))。
* 使用并行副本且启用了“反向顺序读取”优化的查询可能会产生错误结果。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* 在 String 反序列化期间出现 MEMORY&#95;LIMIT&#95;EXCEEDED 时，修复可能出现的未定义行为（崩溃）。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 修复不正确的指标 KafkaAssignedPartitions 和 KafkaConsumersWithAssignment。[#85494](https://github.com/ClickHouse/ClickHouse/pull/85494)（[Ilya Golshtein](https://github.com/ilejn)）。
* 修复了在使用 PREWHERE（显式或自动）时，对已处理字节数的统计被低估的问题。 [#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321))。
* 修复针对 S3 请求速率减缓的提前返回条件：当由于可重试错误而暂停所有线程时，现在只要 `s3_slow_all_threads_after_network_error` 或 `backup_slow_all_threads_after_retryable_s3_error` 之一为 true 即可启用减缓行为，而不再要求两者都为 true。[#85505](https://github.com/ClickHouse/ClickHouse/pull/85505)（[Julia Kartseva](https://github.com/jkartseva)）。
* 此 PR 修复了通过 REST catalog 查询 Iceberg 表时的元数据解析问题。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha))。
* 修复了在异步插入中更改 `log_comment` 或 `insert_deduplication_token` 设置时可能出现的罕见崩溃。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ)).
* 在通过 HTTP 并使用 multipart/form-data 时，类似 date&#95;time&#95;input&#95;format 的参数会被忽略。[#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema))。
* 修复 icebergS3Cluster 和 icebergAzureCluster 表函数中的机密信息掩码问题。[#85658](https://github.com/ClickHouse/ClickHouse/pull/85658)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 修复在将 JSON 数值转换为 Decimal 类型时 `JSONExtract` 的精度丢失问题。现在 JSON 数值可以保留其精确的小数表示，避免浮点数舍入误差。[#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b))。
* 修复了在 `DROP COLUMN` 之后、同一条 `ALTER` 语句中使用 `COMMENT COLUMN IF EXISTS` 时出现的 `LOGICAL_ERROR`。现在，当列在同一语句中已被删除时，`IF EXISTS` 子句会正确地跳过对该列的注释操作。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 修复 Delta Lake 从缓存读取计数的问题。[#85704](https://github.com/ClickHouse/ClickHouse/pull/85704)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复 `CoalescingMergeTree` 在处理大字符串时发生的段错误。此更改关闭了 [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582)。[#85709](https://github.com/ClickHouse/ClickHouse/pull/85709)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 在 Iceberg 写入操作中更新元数据时间戳。[#85711](https://github.com/ClickHouse/ClickHouse/pull/85711) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 将 `distributed_depth` 用作 *Cluster 函数的指示器是不正确的，可能导致数据重复；请改用 `client_info.collaborate_with_initiator`。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark 无法读取 position delete 文件。[#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 修复 `send_logs_source_regexp`（在 [#85105](https://github.com/ClickHouse/ClickHouse/issues/85105) 中的异步日志重构之后）。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* 修复在出现 MEMORY&#95;LIMIT&#95;EXCEEDED 错误时，可能导致带有 update&#95;field 的字典数据不一致的问题。[#85807](https://github.com/ClickHouse/ClickHouse/pull/85807)（[Azat Khuzhin](https://github.com/azat)）。
* 为目标表为 `Distributed` 的并行分布式 `INSERT SELECT` 提供对 `WITH` 语句中全局常量的支持。此前，该查询可能会抛出 `Unknown expression identifier` 错误。[#85811](https://github.com/ClickHouse/ClickHouse/pull/85811) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 对 `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` 和 `icebergAzureCluster` 的凭据进行隐藏处理。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* 修复在 `DatabaseReplicated` 中尝试执行 `CREATE ... AS (SELECT * FROM s3Cluster(...))` 时的逻辑错误。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `url()` 表函数发出的 HTTP 请求在访问非标准端口时未在 Host 头中正确包含端口号的问题。此更改解决了在使用运行于自定义端口上的 MinIO 等 S3 兼容服务的预签名 URL 时发生的身份验证失败问题，这在开发环境中很常见。（修复 [#85898](https://github.com/ClickHouse/ClickHouse/issues/85898)）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* 现在，Unity Catalog 在处理非 Delta 表时，会忽略包含异常数据类型的 schema。修复了 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699)。[#85950](https://github.com/ClickHouse/ClickHouse/pull/85950)（[alesapin](https://github.com/alesapin)）。
* 修复 Iceberg 中字段的可空属性。[#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复了 `Replicated` 数据库在恢复过程中的一个 bug：如果表名包含 `%` 符号，在恢复过程中可能会以不同的名称重新创建该表。[#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 修复在恢复空 `Memory` 表时出现 `BACKUP_ENTRY_NOT_FOUND` 错误而导致备份恢复失败的问题。 [#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva))。
* 在对 Distributed 表执行 ALTER 时，增加对 sharding&#95;key 的检查。之前错误的 ALTER 会破坏表定义并需要重启服务器。[#86015](https://github.com/ClickHouse/ClickHouse/pull/86015)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 避免创建空的 Iceberg 删除文件。[#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 修复由于过大的设置值导致 S3Queue 表异常和副本重启的问题。[#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique))。

#### 构建/测试/打包改进

* 默认对使用 S3 的测试启用加密磁盘。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 在集成测试中使用 `clickhouse` 可执行文件，以获取未裁剪的调试符号。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 将内部使用的 libxml2 版本从 2.14.4 升级到 2.14.5。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze)).
* 将内部使用的 curl 版本从 8.14.0 升级到 8.15.0。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze)).
* 现在在 CI 中为缓存使用更少的内存，并且具备更完善的缓存淘汰测试。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin)).

### ClickHouse 发行版 25.7，2025-07-24 {#257}

#### 向后不兼容的变更

* 对 `extractKeyValuePairs` 函数的更改：引入一个新的参数 `unexpected_quoting_character_strategy`，用于控制在读取未加引号的键或值时意外遇到 `quoting_character` 时的行为。该参数的取值可以是：`invalid`、`accept` 或 `promote`。`invalid` 会丢弃该键并回到等待键的状态；`accept` 会将其视为键的一部分；`promote` 会丢弃前一个字符并开始按带引号的键来解析。此外，在解析完一个带引号的值之后，只有在发现键值对分隔符时才解析下一个键。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos))。
* 在 `countMatches` 函数中支持零长度匹配。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 在生成 BACKUP 时，对本地（`max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`）和远程（`max_remote_read_network_bandwidth_for_server` 和 `max_remote_write_network_bandwidth_for_server`）操作使用服务器级限流器，此外仍保留其各自的专用服务器设置（`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server` 和 `max_merges_bandwidth_for_server`）。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa))。
* 禁止创建没有可插入列的表。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 在集群函数中按归档内的文件进行并行处理。在之前的版本中，整个归档文件（例如 zip、tar 或 7z）是一个工作单元。新增了一个设置 `cluster_function_process_archive_on_multiple_nodes`，默认值为 `true`。如果设置为 `true`，将提升集群函数处理中归档文件的性能。如果在更早版本上使用带归档的集群函数，为了兼容性并避免升级到 25.7+ 期间出现错误，应将其设置为 `false`。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `SYSTEM RESTART REPLICAS` 查询会导致唤醒 Lazy 数据库中的表，即使没有访问该数据库的权限，而且这一行为会在这些表被并发删除时发生。注意：现在 `SYSTEM RESTART REPLICAS` 只会在你拥有 `SHOW TABLES` 权限的数据库中重启副本，这是更自然的行为。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

#### 新功能

* 为 `MergeTree` 系列表增加了对轻量级更新的支持。轻量级更新可以通过以下新语法使用：`UPDATE &lt;table&gt; SET col1 = val1, col2 = val2, ... WHERE &lt;condition&gt;`。通过轻量级更新实现了轻量级删除功能。可以通过设置 `lightweight_delete_mode = 'lightweight_update'` 来启用该功能。[#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* 在 Iceberg 架构演进中支持复杂类型。[#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 新增对 Iceberg 表执行 INSERT 的支持。[#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 按字段 ID 读取 Iceberg 数据文件。这提高了与 Iceberg 的兼容性：可以在元数据中重命名字段名，同时仍然能够映射到底层 Parquet 文件中的不同字段名。修复了 [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065)。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 现在 ClickHouse 已支持用于 Iceberg 的压缩 `metadata.json` 文件。修复了问题 [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874)。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451) ([alesapin](https://github.com/alesapin))。
* 在 Glue catalog 中支持 `TimestampTZ`，从而关闭了 [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654)。 [#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 为 ClickHouse 客户端添加 AI 驱动的 SQL 生成功能。用户现在可以通过在查询前添加前缀 `??`，根据自然语言描述生成 SQL 查询。支持 OpenAI 和 Anthropic 提供商，并具备自动 schema 发现功能。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314) ([Kaushik Iska](https://github.com/iskakaushik))。
* 新增用于将 Geo 类型写入 WKB 格式的函数。[#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 为 sources 引入了两种新的访问类型：`READ` 和 `WRITE`，并弃用此前所有与 sources 相关的访问类型。之前的写法是 `GRANT S3 ON *.* TO user`，现在为：`GRANT READ, WRITE ON S3 TO user`。这也使得可以分别为 sources 授予 `READ` 和 `WRITE` 权限，例如：`GRANT READ ON * TO user`、`GRANT WRITE ON S3 TO user`。该特性由设置 `access_control_improvements.enable_read_write_grants` 控制，默认关闭。 [#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit))。
* NumericIndexedVector：新的向量数据结构，基于按位切片（bit-sliced）和 Roaring bitmap 压缩，并提供 20 多个用于构建、分析和逐元素算术运算的函数。可减少存储占用，并加速在稀疏数据上的 JOIN、过滤和聚合操作。实现了 [#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) 以及 T. Xiong 和 Y. Wang 在 VLDB 2024 发表的 [论文 “Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411)。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193)（[FriendLey](https://github.com/FriendLey)）。
* 现在支持工作负载配置项 `max_waiting_queries`。它可用于限制查询队列的大小。如果达到该限制，所有后续查询将被终止，并返回 `SERVER_OVERLOADED` 错误。[#81250](https://github.com/ClickHouse/ClickHouse/pull/81250)（[Oleg Doronin](https://github.com/dorooleg)）。
* 新增财务函数：`financialInternalRateOfReturnExtended`（`XIRR`）、`financialInternalRateOfReturn`（`IRR`）、`financialNetPresentValueExtended`（`XNPV`）、`financialNetPresentValue`（`NPV`）。[#81599](https://github.com/ClickHouse/ClickHouse/pull/81599)（[Joanna Hulboj](https://github.com/jh0x)）。
* 新增地理空间函数 `polygonsIntersectCartesian` 和 `polygonsIntersectSpherical`，用于检查两个多边形是否相交。 [#81882](https://github.com/ClickHouse/ClickHouse/pull/81882) ([Paul Lamb](https://github.com/plamb))。
* 在 MergeTree 系列表中支持 `_part_granule_offset` 虚拟列。该列表示每一行在其数据分片（data part）内所属粒度/标记的从 0 开始的索引。此改动解决了 [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572)。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* 新增 SQL 函数 `colorSRGBToOkLCH` 和 `colorOkLCHToSRGB`，用于在 sRGB 和 OkLCH 颜色空间之间转换颜色。[#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue))。
* 在 `CREATE USER` 查询语句中允许将用户名设为参数。[#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein)).
* `system.formats` 表现在包含关于各格式的更多信息，例如 HTTP 内容类型、架构推断能力等。[#81505](https://github.com/ClickHouse/ClickHouse/pull/81505)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。

#### 实验性特性

* 新增函数 `searchAny` 和 `searchAll`，作为通用工具用于搜索文本索引。 [#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 文本索引现在支持新的 `split` 分词器。 [#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将 `text` 索引的默认索引粒度更改为 64。这提升了内部基准测试中典型测试查询的预期性能。 [#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 位位图按顺序存储某个状态的出边标签，但出边状态在磁盘中的保存顺序是它们在哈希表中出现的顺序。因此，从磁盘读取时，一个标签会指向错误的下一状态。 [#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 为文本索引中的 FST 树 blob 启用 zstd 压缩。 [#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 将向量相似度索引升级为 beta。引入别名设置 `enable_vector_similarity_index`，必须启用该设置才能使用向量相似度索引。 [#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 移除了与实验性零拷贝复制相关的实验性 `send_metadata` 逻辑。该逻辑从未被使用，也没有人维护这段代码。由于甚至没有任何与之相关的测试，它很大概率早就已经失效。 [#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* 将 `StorageKafka2` 集成到 `system.kafka_consumers` 中。 [#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 基于统计信息估计复杂的 CNF/DNF 表达式，例如 `(a < 1 and a > 0) or b = 3`。 [#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).

#### 性能优化

* 引入异步日志记录。当日志写入到慢速设备时，将不再阻塞查询。[#82516](https://github.com/ClickHouse/ClickHouse/pull/82516)（[Raúl Marín](https://github.com/Algunenano)）。限制队列中保留的最大日志条目数量。[#83214](https://github.com/ClickHouse/ClickHouse/pull/83214)（[Raúl Marín](https://github.com/Algunenano)）。
* 默认启用了并行分布式 INSERT SELECT，在该模式下，INSERT SELECT 会在每个分片上独立执行，参见 `parallel_distributed_insert_select` 设置。[#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter))。
* 当聚合查询仅包含一个针对非 `Nullable` 列的 `count()` 函数时，聚合逻辑会被完全内联到哈希表探测过程中。这样可以避免分配和维护任何聚合状态，从而显著降低内存使用和 CPU 开销。此优化在一定程度上解决了 [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982)。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* 通过在仅有一个键列这一典型场景下移除对哈希映射的额外循环来优化 `HashJoin` 的性能；同时，当 `null_map` 和 `join_mask` 始终为 `true`/`false` 时，相关检查也被消除。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat)).
* 对 `-If` 组合器进行了小优化。[#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* 使用向量相似度索引的向量搜索查询，由于减少了存储读取和 CPU 使用而具有更低的延迟。[#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 在 `filterPartsByQueryConditionCache` 中考虑 `merge_tree_min_{rows,bytes}_for_seek`，使其与其他按索引进行过滤的方法保持一致。[#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* 将 `TOTALS` 步骤之后的 pipeline 改为多线程执行。[#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus))。
* 修复 `Redis` 和 `KeeperMap` 存储的基于 key 的过滤功能。[#81833](https://github.com/ClickHouse/ClickHouse/pull/81833)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 新增设置项 `min_joined_block_size_rows`（类似于 `min_joined_block_size_bytes`；默认值为 65409），用于控制 JOIN 输入和输出块的最小块大小（以行数计，前提是所用 JOIN 算法支持该设置）。过小的数据块会被合并。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` 不再会触发清空所有缓存。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过使用等价类删除多余的 JOIN 操作来优化为相关子查询生成的执行计划。如果所有关联列都存在等价表达式，且启用了 `query_plan_correlated_subqueries_use_substitution` 设置，则不会生成 `CROSS JOIN`。[#82435](https://github.com/ClickHouse/ClickHouse/pull/82435) ([Dmitry Novik](https://github.com/novikd))。
* 当关联子查询被推断为函数 `EXISTS` 的参数时，仅读取其中所需的列。[#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd))。
* 略微提升查询分析阶段查询树比较的速度。[#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 为 ProfileEvents 的 Counter 添加内存对齐以减少伪共享。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* 来自 [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) 的针对 `null_map` 和 `JoinMask` 的优化已应用于包含多个析取条件的 JOIN 场景。同时，对 `KnownRowsHolder` 数据结构也进行了优化。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* 直接使用 `std::vector<std::atomic_bool>` 作为 join 标志位，以避免在每次访问标志时计算哈希。[#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* 当 `HashJoin` 使用 `lazy` 输出模式时，不要提前为结果列分配内存。这样做并不理想，尤其是在匹配数量较少的情况下。此外，在完成 join 之后，我们就知道确切的匹配数量，因此可以更精确地预分配内存。[#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat))。
* 在构建 pipeline 时，尽量减少端口头部中的内存拷贝。原始 [PR](https://github.com/ClickHouse/ClickHouse/pull/70105) 由 [heymind](https://github.com/heymind) 提交。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 clickhouse-keeper 使用 RocksDB 存储时改进其启动过程。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368)).
* 在创建存储快照数据时避免持有锁，以减少在高并发负载下的锁竞争。[#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94))。
* 在未发生解析错误时复用序列化器，从而提升了 `ProtobufSingle` 输入格式的性能。[#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa)).
* 改进 pipeline 构建性能，以加速短查询。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 优化 `MergeTreeReadersChain::getSampleBlock`，从而加速短查询。[#83875](https://github.com/ClickHouse/ClickHouse/pull/83875)（[Raúl Marín](https://github.com/Algunenano)）。
* 通过异步请求加快数据目录中表的列出速度。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* 在启用 `s3_slow_all_threads_after_network_error` 配置时，为 S3 重试机制加入抖动（jitter）。[#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi))。

#### 改进

* 使用多种颜色显示括号，以提高可读性。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在输入 LIKE/REGEXP 模式时高亮显示其中的元字符。我们已经在 `clickhouse-format` 和 `clickhouse-client` 的 echo 输出中提供了该功能，现在在命令行提示符中也实现了。[#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在 `clickhouse-format` 和客户端的 echo 输出中的高亮效果，现在将与命令行提示符中的高亮保持一致。[#82874](https://github.com/ClickHouse/ClickHouse/pull/82874)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 现在允许将 `plain_rewritable` 磁盘用于存储数据库元数据。在 `plain_rewritable` 中实现了 `moveFile` 和 `replaceFile` 方法，使其可以作为数据库磁盘使用。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 允许为 `PostgreSQL`、`MySQL` 和 `DataLake` 数据库创建备份。此类数据库的备份仅会保存其定义（元数据），而不会备份其中的数据。[#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique))。
* 将设置 `allow_experimental_join_condition` 标记为已废弃，因为它现在始终被允许。[#80566](https://github.com/ClickHouse/ClickHouse/pull/80566)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 将压力相关指标添加到 ClickHouse 异步指标中。[#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1))。
* 新增指标 `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles`，用于跟踪标记缓存（mark cache）中的逐出情况。（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* 支持按照[规范](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)要求，将 Parquet enum 写出为字节数组。 [#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos))。
* 对 `DeltaLake` 表引擎的改进：delta-kernel-rs 提供了 `ExpressionVisitor` API，本 PR 对其进行了实现，并将其应用于分区列表达式的转换（它将取代我们代码中之前使用、且在 delta-kernel-rs 中已弃用的旧实现方式）。未来，这个 `ExpressionVisitor` 还将支持基于统计信息的裁剪以及一些 Delta Lake 的专有特性。此外，此更改的另一个目的，是为 `DeltaLakeCluster` 表引擎提供分区裁剪支持（解析后的表达式结果 ActionsDAG 将被序列化，并与数据路径一起从发起端发送，因为这类用于裁剪的信息仅作为数据文件列表的元信息在发起端可用，但必须在每个读取服务器上应用于数据）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在为具名元组推导超类型时保留元素名称。[#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc))。
* 手动统计已消费的消息数量，以避免在 StorageKafka2 中依赖之前已提交的偏移量。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 新增 `clickhouse-keeper-utils`，这是一款用于管理和分析 ClickHouse Keeper 数据的新命令行工具。该工具支持从快照和变更日志中导出状态、分析变更日志文件，以及提取特定的日志范围。[#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 全局和按用户的网络限速器都不会被重置，从而确保 `max_network_bandwidth_for_all_users` 和 `max_network_bandwidth_for_all_users` 的限制永远不会被超出。[#81729](https://github.com/ClickHouse/ClickHouse/pull/81729)（[Sergei Trifonov](https://github.com/serxa)）。
* 支持以 GeoParquet 文件作为输出格式。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 如果某个 `RENAME COLUMN` 修改操作会重命名当前正受未完成数据变更影响的列，则禁止执行该 `RENAME COLUMN` 修改操作。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在确定是否应保留连接后，`Connection` 头会在所有其他头之后发送。[#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema))。
* 根据 listen&#95;backlog（默认 4096）调整 TCP 服务器队列长度（默认 64）。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* 新增支持在无需重启服务器的情况下动态重新加载 `max_local_read_bandwidth_for_server` 和 `max_local_write_bandwidth_for_server`。[#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu))。
* 新增支持使用 `TRUNCATE TABLE system.warnings` 清空 `system.warnings` 表中的所有警告。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复使用数据湖集群函数时的分区裁剪问题。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `DeltaLakeCluster` 表函数中读取分区数据的问题。在此 PR 中，提高了集群函数的协议版本，从而允许从发起方向副本发送额外信息。该额外信息包含 delta-kernel 的转换表达式，用于解析分区列（以及将来的一些其他内容，例如生成列等）。[#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `reinterpret` 函数现在支持转换为 `Array(T)` 类型，其中 `T` 是固定大小的数据类型（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 现在 Datalake 数据库会抛出更易理解的异常。修复 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211)。[#82304](https://github.com/ClickHouse/ClickHouse/pull/82304) ([alesapin](https://github.com/alesapin))。
* 通过让 `HashJoin::needUsedFlagsForPerRightTableRow` 返回 false 来改进 CROSS JOIN。[#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc))。
* 允许以 Tuple 数组（Array of Tuples）形式读写 Map 列。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 在 `system.licenses` 中列出 [Rust](https://clickhouse.com/blog/rust) crate 库的许可证。[#82440](https://github.com/ClickHouse/ClickHouse/pull/82440)（[Raúl Marín](https://github.com/Algunenano)）。
* 现在可以在 S3Queue 表引擎的 `keeper_path` 设置中使用类似 `{uuid}` 的宏。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463) ([Nikolay Degterinsky](https://github.com/evillique))。
* Keeper 改进：通过后台线程在不同磁盘之间移动 changelog 文件。此前，将 changelog 移动到不同磁盘会在移动完成前全局阻塞 Keeper。如果移动操作耗时较长（例如移动到 S3 磁盘），会导致性能下降。 [#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper 改进：新增配置项 `keeper_server.cleanup_old_and_ignore_new_acl`。如果启用，所有节点的 ACL 都将被清除，而新请求的 ACL 将被忽略。如果目标是从节点上彻底移除 ACL，务必在创建新的快照之前始终保持该配置处于启用状态。[#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368))。
* 新增了一个服务器设置项 `s3queue_disable_streaming`，用于在使用 S3Queue 表引擎的表中禁用流式处理。该设置可在无需重启服务器的情况下进行更改。[#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 重构文件系统缓存的动态缩放功能。添加了更多日志以便进行内部诊断。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在未提供配置文件时，`clickhouse-server` 也会像默认配置一样监听 PostgreSQL 端口 9005。[#82633](https://github.com/ClickHouse/ClickHouse/pull/82633)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `ReplicatedMergeTree::executeMetadataAlter` 中，我们获取 `StorageID`，并且在不获取 DDLGuard 的情况下尝试调用 `IDatabase::alterTable`。在这段时间内，从技术上讲，我们可能会把相关的那张表与另一张表交换掉，因此当我们获取表定义时，可能会拿到错误的定义。为避免这种情况，我们在调用 `IDatabase::alterTable` 时增加了一个额外的 UUID 匹配检查。[#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 在附加使用只读远程磁盘的数据库时，需要将表 UUID 手动添加到 DatabaseCatalog 中。[#82670](https://github.com/ClickHouse/ClickHouse/pull/82670)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 防止用户在 `NumericIndexedVector` 中使用 `nan` 和 `inf`。修复了 [#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) 以及一些其他小问题。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 在 `X-ClickHouse-Progress` 和 `X-ClickHouse-Summary` 头字段格式中不要省略 0 值。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper 改进：支持为 world:anyone ACL 配置特定权限。[#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* 不允许对在 SummingMergeTree 中显式指定为求和列的列执行 `RENAME COLUMN` 或 `DROP COLUMN` 操作。修复了 [#81836](https://github.com/ClickHouse/ClickHouse/issues/81836)。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 提高从 `Decimal` 到 `Float32` 的转换精度。实现从 `Decimal` 到 `BFloat16` 的转换。关闭 Issue [#82660](https://github.com/ClickHouse/ClickHouse/issues/82660)。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中的滚动条外观将略有改善。[#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 带有嵌入式配置的 `clickhouse-server` 现在通过提供 HTTP OPTIONS 响应来允许使用 Web UI。[#82870](https://github.com/ClickHouse/ClickHouse/pull/82870)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在配置中新增对为路径指定额外 Keeper ACL 的支持。如果想为某个特定路径添加额外的 ACL，可在配置中的 `zookeeper.path_acls` 下进行定义。[#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368))。
* 现在，变更快照将从可见部分的快照构建。同时，快照中使用的变更计数器会根据所包含的变更重新计算。[#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 在 Keeper 因软内存限制而拒绝写入时添加 ProfileEvent。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* 向 `system.s3queue_log` 添加 `commit_time` 和 `commit_id` 列。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在某些情况下，我们需要为指标增加多个维度。例如，与其使用单一计数器，不如按错误码统计失败的 merge 或 mutation 次数。为此引入了 `system.dimensional_metrics`，它正是为此而设计的，并新增了首个名为 `failed_merges` 的维度化指标。[#83030](https://github.com/ClickHouse/ClickHouse/pull/83030)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在 ClickHouse client 中汇总未知设置相关的警告，并以摘要形式写入日志。[#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc))。
* 在发生连接错误时，ClickHouse 客户端现在会报告本地端口号。[#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly))。
* 对 `AsynchronousMetrics` 的错误处理进行了小幅改进。如果 `/sys/block` 目录存在但不可访问，服务器将在不监控块设备的情况下启动。修复了 [#79229](https://github.com/ClickHouse/ClickHouse/issues/79229)。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在关闭普通表之后关闭 SystemLogs（位于系统表之前，而不是普通表之前）。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `S3Queue` 关闭过程中添加日志。[#83163](https://github.com/ClickHouse/ClickHouse/pull/83163)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 支持将 `Time` 和 `Time64` 解析为 `MM:SS`、`M:SS`、`SS` 或 `S`。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 当 `distributed_ddl_output_mode='*_only_active'` 时，不再等待复制延迟大于 `max_replication_lag_to_enqueue` 的新副本或恢复中的副本。这样可以避免在新副本完成初始化或恢复后变为活动状态时，由于在初始化期间积累了大量复制日志而导致出现 `DDL task is not finished on some hosts`。同时，实现了 `SYSTEM SYNC DATABASE REPLICA STRICT` 查询，用于等待复制日志降到低于 `max_replication_lag_to_enqueue`。[#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 不要在异常消息中输出过长的表达式操作描述。关闭 [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164)。[#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 增加对解析 part 前缀和后缀的支持，并检查非常量列的覆盖情况。[#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 在使用命名集合时统一 ODBC 和 JDBC 中的参数名。[#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* 当存储处于关闭过程中时，`getStatus` 会抛出 `ErrorCodes::ABORTED` 异常。之前，这会导致 SELECT 查询失败。现在我们会捕获 `ErrorCodes::ABORTED` 异常并刻意忽略它们。[#83435](https://github.com/ClickHouse/ClickHouse/pull/83435)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 将进程资源指标（例如 `UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds`）添加到 `MergeParts` 条目的 part&#95;log profile 事件中。[#83460](https://github.com/ClickHouse/ClickHouse/pull/83460)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在 Keeper 中默认启用 `create_if_not_exists`、`check_not_exists`、`remove_recursive` 特性标志，以支持新的请求类型。[#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368))。
* 在服务器关闭时，应先停止 S3(Azure/etc)Queue 流式处理，然后再关闭任何表。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `JSON` 输入格式中支持将 `Date`/`Date32` 作为整数使用。[#83597](https://github.com/ClickHouse/ClickHouse/pull/83597) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 针对在加载和添加 projection 过程中某些特定情况，改进了异常消息的可读性，使其更易于阅读。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* 为 `clickhouse-server` 引入一个配置选项，用于跳过二进制文件校验和完整性检查。解决了 [#83637](https://github.com/ClickHouse/ClickHouse/issues/83637)。 [#83749](https://github.com/ClickHouse/ClickHouse/pull/83749) ([Rafael Roquetto](https://github.com/rafaelroquetto))。

#### Bug 修复（官方稳定版本中对用户可见的错误行为）

* 修复 `clickhouse-benchmark` 中 `--reconnect` 选项的错误默认值。该值在 [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) 中被误改。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 `CREATE DICTIONARY` 语句格式不一致的问题。关闭 [#82105](https://github.com/ClickHouse/ClickHouse/issues/82105)。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在 TTL 包含 `materialize` 函数时格式不一致的问题。关闭 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828)。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在子查询中使用 `EXPLAIN AST` 且包含 `INTO OUTFILE` 等输出选项时的格式不一致问题。关闭 [#82826](https://github.com/ClickHouse/ClickHouse/issues/82826)。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复在不允许使用别名的上下文中，对带别名括号表达式进行格式化时不一致的问题。关闭 [#82836](https://github.com/ClickHouse/ClickHouse/issues/82836)。关闭 [#82837](https://github.com/ClickHouse/ClickHouse/issues/82837)。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在将聚合函数状态与 IPv4 相乘时改为使用正确的错误代码。修复 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817)。[#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复文件系统缓存中的逻辑错误：“字节数为零但范围尚未结束”。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当 TTL 导致行数减少时，重新计算 min-max 索引，以确保依赖该索引的算法（例如 `minmax_count_projection`）的正确性。修复了 [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091)。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* 对于包含 `ORDER BY ... LIMIT BY ... LIMIT N` 组合的查询，当 ORDER BY 以 PartialSorting 方式执行时，计数器 `rows_before_limit_at_least` 现在反映的是被 LIMIT 子句处理的行数，而不是被排序变换阶段处理的行数。[#78999](https://github.com/ClickHouse/ClickHouse/pull/78999)（[Eduard Karacharov](https://github.com/korowa)）。
* 修复在通过 token/ngram 索引并使用包含交替且首个备选项为非字面量的正则表达式进行过滤时出现的 granule 过度跳过问题。[#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* 修复了 `<=>` 运算符在 Join 存储引擎中的逻辑错误，使查询现在能返回正确的错误代码。[#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在与 `remote` 函数族一起使用时 `loop` 函数发生崩溃的问题。确保在 `loop(remote(...))` 中 LIMIT 子句能够被正确生效。[#80299](https://github.com/ClickHouse/ClickHouse/pull/80299)（[Julia Kartseva](https://github.com/jkartseva)）。
* 修复 `to_utc_timestamp` 和 `from_utc_timestamp` 函数在处理 Unix 纪元开始时间（1970-01-01）之前以及超过最大日期（2106-02-07 06:28:15）的日期时的错误行为。现在，这些函数会将值分别正确地限制在纪元起始时间和最大日期。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* 对于某些使用并行副本执行的查询，发起端可以应用有序读取优化，而远程节点无法应用该优化。这会导致发起端的并行副本协调器与远程节点使用不同的读取模式，从而产生逻辑错误。[#80652](https://github.com/ClickHouse/ClickHouse/pull/80652)（[Igor Nikonov](https://github.com/devcrafter)）。
* 修复在物化投影中，当列类型更改为 Nullable 时出现的逻辑错误。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在更新 TTL 时，`TTL GROUP BY` 中 TTL 重新计算不正确的问题。[#81222](https://github.com/ClickHouse/ClickHouse/pull/81222)（[Evgeniy Ulasik](https://github.com/H0uston)）。
* 修复了 Parquet 布隆过滤器错误地将形如 `WHERE function(key) IN (...)` 的条件当作 `WHERE key IN (...)` 来处理的问题。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了在合并过程中出现异常时，`Aggregator` 中可能发生的崩溃问题。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat))。
* 修复了 `InterpreterInsertQuery::extendQueryLogElemImpl`，在需要时为数据库和表名添加反引号（例如，当名称包含诸如 `-` 之类的特殊字符时）。[#81528](https://github.com/ClickHouse/ClickHouse/pull/81528)（[Ilia Shvyrialkin](https://github.com/Harzu)）。
* 修复在 `transform_null_in=1` 且左侧参数为 null、子查询结果为非可空时 `IN` 的执行行为。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 在从现有表读取数据时，执行 default/materialize 表达式时不再校验实验性/可疑类型。[#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在合并时，当在 TTL 表达式中使用 dict 时出现的 “Context has expired” 错误。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `cast` 函数的单调性。[#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi))。
* 修复在标量关联子查询处理过程中未读取必需列的问题。修复 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 在之前的版本中，服务器对 `/js` 请求返回了过多的内容。已关闭 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 此前，在 `MongoDB` 表引擎定义中，可以在 `host:port` 参数中包含路径部分，但该部分会被静默忽略。`mongodb` 集成会拒绝加载此类表。通过此次修复，*如果 `MongoDB` 引擎有五个参数，则允许加载此类表并忽略路径部分*，并使用参数中提供的数据库名称。*注意：* 此修复不适用于新创建的表、带有 `mongo` 表函数的查询，以及字典源和命名集合。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复了在合并过程中发生异常时 `Aggregator` 可能崩溃的问题。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* 修复了在查询仅使用常量别名列时的过滤条件分析问题。修复了 [#79448](https://github.com/ClickHouse/ClickHouse/issues/79448)。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在 TTL 中对 GROUP BY 和 SET 使用相同列时出现的 `LOGICAL_ERROR` 以及随后发生的崩溃。 [#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复在敏感信息掩码处理中对 S3 表函数参数的校验问题，防止可能出现的 `LOGICAL_ERROR`，关闭 [#80620](https://github.com/ClickHouse/ClickHouse/issues/80620)。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 修复 Iceberg 中的数据竞争。[#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `DatabaseReplicated::getClusterImpl`。如果 `hosts` 中第一个元素（或前几个元素）的 `id == DROPPED_MARK`，且同一分片没有其他元素，那么 `shards` 的第一个元素将是一个空向量，从而导致抛出 `std::out_of_range` 异常。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复 arraySimilarity 中的拷贝粘贴错误，禁用 UInt32 和 Int32 权重。更新测试和文档。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 修复在包含 `WHERE` 条件和 `IndexSet` 时使用 `arrayJoin` 的查询中出现的 `Not found column` 错误。[#82113](https://github.com/ClickHouse/ClickHouse/pull/82113)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复 Glue Catalog 集成中的缺陷。现在 ClickHouse 可以读取包含嵌套数据类型的表，其中部分子列为 Decimal 类型，例如：`map&lt;string, decimal(9, 2)&gt;`。修复了 [#81301](https://github.com/ClickHouse/ClickHouse/issues/81301)。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* 修复 SummingMergeTree 在 25.5 版本中因 [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) 引入的性能下降问题。[#82130](https://github.com/ClickHouse/ClickHouse/pull/82130)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在通过 URI 传递设置时，将采用最后一个值。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema))。
* 修复 Iceberg 中 “Context has expired” 错误。[#82146](https://github.com/ClickHouse/ClickHouse/pull/82146)（[Azat Khuzhin](https://github.com/azat)）。
* 在服务器内存吃紧时，修复远程查询可能出现的死锁问题。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar)).
* 修复了在将 `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 这些函数应用于大数时出现的溢出问题。[#82165](https://github.com/ClickHouse/ClickHouse/pull/82165)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 修复表依赖中的一个错误，该错误会导致物化视图无法捕获 `INSERT` 查询。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* 修复建议线程与主客户端线程之间可能发生的数据竞争。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* 现在，在进行模式演进后，ClickHouse 可以从 Glue Catalog 中读取 Iceberg 表。修复 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272)。[#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 修复异步指标配置项 `asynchronous_metrics_update_period_s` 和 `asynchronous_heavy_metrics_update_period_s` 的验证逻辑。[#82310](https://github.com/ClickHouse/ClickHouse/pull/82310)（[Bharat Nallan](https://github.com/bharatnc)）。
* 修复在包含多个 JOIN 的查询中解析匹配器时出现的逻辑错误，关闭 [#81969](https://github.com/ClickHouse/ClickHouse/issues/81969)。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 为 AWS ECS 令牌添加过期时间，以支持重新加载。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复了 `CASE` 函数处理 `NULL` 参数时的一个错误。[#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 修复了客户端中的数据竞争问题（通过不再使用全局 context），以及 `session_timezone` 覆盖逻辑（此前，如果在 `users.xml`/客户端选项中将 `session_timezone` 设置为非空，而在查询 context 中设置为空，则会错误地使用 `users.xml` 中的值；现在，查询 context 将始终优先于全局 context）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 修复 external table 引擎中缓存缓冲区禁用边界对齐的功能。在 [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) 中该功能被破坏。[#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复在将 key-value 存储与经类型转换的键进行 JOIN 时发生的崩溃。[#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复在 logs/query&#95;log 中隐藏命名集合值的逻辑。关闭 [#82405](https://github.com/ClickHouse/ClickHouse/issues/82405)。[#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了在终止会话时，如果 `user_id` 为空，可能导致日志记录崩溃的问题。[#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复了在解析 Time 时可能导致 msan 问题的情况。相关修复：[#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 禁止将 `threadpool_writer_pool_size` 设置为 0，以避免服务器操作发生阻塞。[#82532](https://github.com/ClickHouse/ClickHouse/pull/82532)（[Bharat Nallan](https://github.com/bharatnc)）。
* 修复在分析包含关联列的行策略表达式时出现的 `LOGICAL_ERROR`。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd)).
* 当 `enable_shared_storage_snapshot_in_query = 1` 时，修复 `mergeTreeProjection` 表函数中对父元数据的不正确使用。这对应于 [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634)。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 函数 `trim{Left,Right,Both}` 现已支持类型为 &quot;FixedString(N)&quot; 的输入字符串。例如，`SELECT trimBoth(toFixedString('abc', 3), 'ac')` 现在可以正常执行。[#82691](https://github.com/ClickHouse/ClickHouse/pull/82691)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 AzureBlobStorage 中，对于 native copy，我们会比较身份验证方法；如果在此过程中遇到异常，代码已更新为回退到读取并复制（即非 native copy）。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 修复在元素为空时对 `groupArraySample`/`groupArrayLast` 的反序列化问题（当输入为空时，反序列化可能会跳过部分二进制数据，这会在读取数据期间导致数据损坏，并在 TCP 协议中触发 UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER）。这不会影响数值和日期时间类型。[#82763](https://github.com/ClickHouse/ClickHouse/pull/82763)（[Pedro Ferreira](https://github.com/PedroTadim)）。
* 修复空 `Memory` 表备份的问题，该问题会导致在恢复备份时因 `BACKUP_ENTRY_NOT_FOUND` 错误而失败。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复 `union/intersect/except_default_mode` 重写过程中的异常安全性。关闭 [#82664](https://github.com/ClickHouse/ClickHouse/issues/82664)。[#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 跟踪异步表加载任务的数量。如果仍有任务在运行，则不要在 `TransactionLog::removeOldEntries` 中更新 `tail_ptr`。[#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 修复 Iceberg 中的数据竞态。[#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* 在设置 `use_skip_indexes_if_final_exact_mode` 优化项（在 25.6 中引入）时，可能会根据 `MergeTree` 引擎设置或数据分布而无法选取相关的候选范围。该问题现已修复。[#82879](https://github.com/ClickHouse/ClickHouse/pull/82879)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 在从 AST 解析类型为 SCRAM&#95;SHA256&#95;PASSWORD 的认证数据时设置 salt。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 在使用非缓存的 Database 实现时，在返回列并使引用失效后，对应表的元数据会被删除。[#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01))。
* 修复在包含对使用 `Merge` 存储的表执行 JOIN 表达式的查询中，过滤条件被修改的问题。修复了 [#82092](https://github.com/ClickHouse/ClickHouse/issues/82092)。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 QueryMetricLog 中的 LOGICAL&#95;ERROR：Mutex cannot be NULL。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos))。
* 修复了在同时使用格式说明符 `%f` 和可变长度格式说明符（例如 `%M`）时，函数 `formatDateTime` 输出不正确的问题。[#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复在启用 analyzer 时，由于二级查询总是从视图读取所有列而导致的性能下降问题。修复了 [#81718](https://github.com/ClickHouse/ClickHouse/issues/81718)。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在只读磁盘上恢复备份时的误导性错误信息。[#83051](https://github.com/ClickHouse/ClickHouse/pull/83051)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在创建没有依赖关系的表时不再检查循环依赖。该改动修复了在创建成千上万张表的用例中出现的性能退化问题，此问题是在 [https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) 中引入的。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了将负的 Time 值隐式读取到表中的问题，并澄清了相关文档的表述，避免产生混淆。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 不要在 `lowCardinalityKeys` 函数中使用共享字典中不相关的部分。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复在物化视图中使用子列时出现的回归问题。此修复对应：[#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复在错误的 INSERT 操作后连接被遗留在断开状态，从而导致客户端崩溃的问题。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 修复在计算包含空列的块大小时发生的崩溃。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 UNION 中使用 Variant 类型时可能发生的崩溃。[#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复在 clickhouse-local 中针对不支持的 SYSTEM 查询触发的 LOGICAL&#95;ERROR。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* 修复 S3 客户端中的 `no_sign_request`。它可用于显式禁止为 S3 请求签名，也可以通过基于 endpoint 的设置为特定 endpoint 单独配置。 [#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368))。
* 修复了在启用 CPU 调度的高负载场景下执行、且设置了 &#39;max&#95;threads=1&#39; 的查询可能出现的崩溃问题。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* 修复当 CTE 定义引用另一个具有相同名称的表表达式时会抛出 `TOO_DEEP_SUBQUERIES` 异常的问题。[#83413](https://github.com/ClickHouse/ClickHouse/pull/83413)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在执行 `REVOKE S3 ON system.*` 时的错误行为，该命令错误地撤销了 `*.*` 的 S3 权限。此修复解决了 [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417)。[#83420](https://github.com/ClickHouse/ClickHouse/pull/83420)（[pufit](https://github.com/pufit)）。
* 不要在不同查询之间共享 async&#95;read&#95;counters。[#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat))。
* 当子查询包含 FINAL 时，禁用并行副本。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi))。
* 修复在配置设置 `role_cache_expiration_time_seconds` 时的轻微整数溢出问题（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* 修复在 [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) 中引入的一个 Bug。当向带有定义者（definer）的物化视图（MV）插入数据时，权限检查应使用该定义者的权限。此更改修复了 [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951)。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* 对 Iceberg 数组元素和 Iceberg map 值禁用基于范围的文件剪枝，包括其所有嵌套子字段。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik)).
* 修复在将文件缓存作为临时数据存储使用时可能出现的 file cache not initialized 错误。[#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc))。
* Keeper 修复：在会话关闭时删除临时节点后，正确更新 watch 总数。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复与 `max_untracked_memory` 相关的错误内存统计问题。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* 在某些极端情况下，带有 UNION ALL 的 INSERT SELECT 可能导致空指针解引用。此更改修复了 [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618)。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 禁止将 `max&#95;insert&#95;block&#95;size` 设置为 0，因为这可能导致逻辑错误。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复 `block_size_bytes=0` 时 `estimateCompressionRatio()` 中的无限循环问题。[#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat))。
* 修复 `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` 指标（此前它们被纳入了不带 `Cache` 前缀的指标中）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730) ([Azat Khuzhin](https://github.com/azat)).
* 修复在关闭 `BackgroundSchedulePool` 期间，因从任务中 join 线程而可能触发的 abort，并尽量避免（特别是在单元测试中）发生挂起。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat)).
* 引入向后兼容设置，在存在名称冲突的情况下，允许新的分析器在 `WITH` 子句中引用外层别名。修复 [#82700](https://github.com/ClickHouse/ClickHouse/issues/82700)。[#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在关闭期间，由于在 library bridge 清理过程中对上下文进行递归加锁而导致的死锁问题。[#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat))。

#### 构建/测试/打包改进

* 为 ClickHouse 词法分析器构建一个最小的 C 库（大小约 10 KB）。这是 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 所需。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。为独立词法分析器添加测试，新增测试标签 `fasttest-only`。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 为 Nix 子模块的输入添加检查。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复在尝试在 localhost 上运行集成测试时可能出现的一系列问题。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135)（[Oleg Doronin](https://github.com/dorooleg)）。
* 在 Mac 和 FreeBSD 上编译 SymbolIndex。（但它仅能在 ELF 系统上运行，即 Linux 和 FreeBSD）。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 Azure SDK 升级到 v1.15.0。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 将 google-cloud-cpp 的存储模块添加到构建系统中。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881)（[Pablo Marcos](https://github.com/pamarcos)）。
* 修改 clickhouse-server 的 `Dockerfile.ubuntu` 以满足 Docker 官方镜像库的要求。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 作为 [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158) 的后续修改，修复通过 `curl clickhouse.com` 上传构建产物的问题。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 在 `clickhouse/clickhouse-server` 以及官方 `clickhouse` 镜像中添加 `busybox` 可执行文件并安装相关工具。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 添加对 `CLICKHOUSE_HOST` 环境变量的支持，用于指定 ClickHouse 服务器主机地址，与现有的 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 环境变量保持一致。这样可以在不直接修改客户端或配置文件的情况下，更方便地进行配置。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659)（[Doron David](https://github.com/dorki)）。

### ClickHouse 25.6 版本发布，2025-06-26 {#256}

#### 向后不兼容的更改

* 之前，函数 `countMatches` 在遇到第一个空匹配时就会停止计数，即使模式允许空匹配。为解决这一问题，现在在出现空匹配时，`countMatches` 会先前进一个字符后再继续执行。希望保留旧行为的用户可以启用设置 `count_matches_stop_at_empty_match`。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 次要：强制将服务器设置项 `backup_threads` 和 `restore_threads` 设为非零值。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano)).
* 次要：修复 `String` 类型的 `bitNot` 在内部内存表示中会返回以零结尾字符串的问题。这不应影响任何用户可见的行为，不过作者希望强调这一变更。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat)).

#### 新功能

* 新增数据类型：`Time`（[H]HH:MM:SS）和 `Time64`（[H]HH:MM:SS[.fractional]），以及一些基本的类型转换函数和用于与其他数据类型交互的函数。添加了与现有函数 `toTime` 兼容的设置。当前将 `use_legacy_to_time` 设置为保留旧行为。[#81217](https://github.com/ClickHouse/ClickHouse/pull/81217)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。支持 Time/Time64 之间的比较。[#80327](https://github.com/ClickHouse/ClickHouse/pull/80327)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 一个新的 CLI 工具 [`chdig`](https://github.com/azat/chdig/) —— 面向 ClickHouse 的 TUI 界面（类似 `top`），现已作为 ClickHouse 的一部分提供。[#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* 为 `Atomic` 和 `Ordinary` 数据库引擎增加对 `disk` 设置的支持，用于指定存储表元数据文件的磁盘。[#80546](https://github.com/ClickHouse/ClickHouse/pull/80546)（[Tuan Pham Anh](https://github.com/tuanpach)）。这使得可以从外部来源附加数据库。
* 一种新的 MergeTree 类型，`CoalescingMergeTree` —— 该引擎在后台合并时取第一个非 Null 值。该更改关闭了 [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869)。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* 支持读取 WKB（“Well-Known Binary”，一种在地理信息系统（GIS）应用中用于对各种几何类型进行二进制编码的格式）的函数。参见 [#43941](https://github.com/ClickHouse/ClickHouse/issues/43941)。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* 为工作负载新增了查询槽位调度功能，详情参见 [工作负载调度](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling)。[#78415](https://github.com/ClickHouse/ClickHouse/pull/78415)（[Sergei Trifonov](https://github.com/serxa)）。
* 用于处理时序数据并在某些场景下加速操作的 `timeSeries*` 辅助函数：- 将数据按指定的起始时间戳、结束时间戳和步长重新采样到时间网格上 - 计算类 PromQL 的 `delta`、`rate`、`idelta` 和 `irate`。[#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger)).
* 添加 `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 函数，以便根据 map 值进行过滤，并支持基于布隆过滤器的索引。[#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus))。
* 现在，设置约束可以指定一组不允许的值。[#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc))。
* 添加了设置 `enable_shared_storage_snapshot_in_query`，用于在单个查询内让所有子查询共享同一个存储快照。这样即使在一个查询中多次引用同一张表，也能确保对该表的读取保持一致性。[#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* 支持将 `JSON` 列写入 `Parquet`，并直接从 `Parquet` 读取 `JSON` 列。[#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 为 `pointInPolygon` 添加 `MultiPolygon` 支持。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* 添加对通过 `deltaLakeLocal` 表函数查询本地文件系统中挂载的 Delta 表的支持。[#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98))。
* 新增设置 `cast_string_to_date_time_mode`，用于在从 String 转换为 DateTime 时选择解析模式。[#80210](https://github.com/ClickHouse/ClickHouse/pull/80210) ([Pavel Kruglov](https://github.com/Avogar))。例如，你可以将其设置为尽力而为模式。
* 新增 `bech32Encode` 和 `bech32Decode` 函数，用于处理 Bitcoin 的 Bech 编码算法（问题 [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* 添加用于分析 MergeTree 数据分片名称的 SQL 函数。[#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 通过引入新的虚拟列 `_disk_name`，允许在查询时根据数据所在的磁盘对选中的数据部分进行过滤。[#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 添加一个包含嵌入式 Web 工具列表的着陆页。当由类似浏览器的用户代理访问时，将会打开该页面。[#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 函数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` 和 `arrayLastIndex` 会过滤掉由过滤表达式返回的 NULL 值。在之前的版本中，不支持 Nullable 类型的过滤结果。修复了 [#81113](https://github.com/ClickHouse/ClickHouse/issues/81113)。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* 现在可以使用 `USE DATABASE name` 来代替 `USE name`。[#81307](https://github.com/ClickHouse/ClickHouse/pull/81307)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 新增系统表 `system.codecs`，用于查看可用的编解码器。（问题 [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)）。[#81600](https://github.com/ClickHouse/ClickHouse/pull/81600)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 已支持 `lag` 和 `lead` 窗口函数。修复 [#9887](https://github.com/ClickHouse/ClickHouse/issues/9887)。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 函数 `tokens` 现在支持一种名为 `split` 的新分词器，非常适合日志处理。[#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `clickhouse-local` 中添加对 `--database` 参数的支持。你可以切换到此前创建的数据库。由此关闭了 [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115)。[#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。

#### 实验性功能

* 使用 ClickHouse Keeper 为 `Kafka2` 实现类似 Kafka rebalance 的逻辑。对于每个副本，我们支持两种类型的分区锁：永久锁和临时锁。副本会尽可能长时间持有永久锁，在任意时刻，副本上的永久锁数量不超过 `all_topic_partitions / active_replicas_count`（其中 `all_topic_partitions` 是所有分区的数量，`active_replicas_count` 是活动副本的数量），如果超过，则副本会释放部分分区。一些分区会被副本临时持有。副本上的临时锁最大数量会动态变化，以便给其他副本机会将部分分区获取为永久锁。在更新临时锁时，副本会释放其所有临时锁，并尝试重新获取其他分区。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 对实验性的文本索引进行了改进：现在通过键值对形式支持显式参数。目前支持的参数包括一个必需的 `tokenizer`，以及两个可选参数 `max_rows_per_postings_list` 和 `ngram_size`。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 之前，`packed` 存储不支持全文索引，因为 segment ID 会通过在磁盘上读写（`.gin_sid`）文件进行实时更新。在使用 `packed` 存储的情况下，不支持从未提交的文件中读取值，这会导致问题。现在这一问题已经解决。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 类型为 `gin` 的实验性索引（我不喜欢这个名字，因为它是 PostgreSQL 黑客的一个内部玩笑）已被重命名为 `text`。现有的 `gin` 类型索引仍然可以加载，但在尝试在搜索中使用它们时会抛出异常（并建议改用 `text` 索引）。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。

#### 性能优化

* 启用多投影过滤功能，允许在分片级过滤时使用多个 projection。此更改解决了 [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525)。这是实现 projection 索引的第二步，继 [#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) 之后。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* 默认在文件系统缓存中使用 `SLRU` 缓存策略。[#75072](https://github.com/ClickHouse/ClickHouse/pull/75072)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 移除查询管线中 Resize 步骤的争用。[#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* 引入了一个选项，可以将数据块的（解）压缩和（反）序列化从与网络连接绑定的单线程卸载到多个流水线线程中。通过设置 `enable_parallel_blocks_marshalling` 控制。此功能有望加速在发起端与远端节点之间传输大量数据的分布式查询。[#78694](https://github.com/ClickHouse/ClickHouse/pull/78694)（[Nikita Taranov](https://github.com/nickitat)）。
* 对所有类型的布隆过滤器进行了性能优化。[来自 OpenHouse 大会的演讲视频](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800) ([Delyan Kratunov](https://github.com/dkratunov)).
* 在 `UniqExactSet::merge` 中新增了当其中一个集合为空时的优化路径。此外，现在如果左侧集合是两级结构而右侧是单级结构，将不再把右侧转换为两级结构。[#79971](https://github.com/ClickHouse/ClickHouse/pull/79971)（[Nikita Taranov](https://github.com/nickitat)）。
* 在使用两级哈希表时提升内存复用效率并减少缺页错误，旨在加速 `GROUP BY`。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* 避免不必要的更新操作，减少查询条件缓存中的锁竞争。[#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn))。
* 对 `concatenateBlocks` 进行了一个简单优化，这可能也有助于并行哈希连接。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 在从主键范围中选择 mark 范围时，如果主键被函数包裹，则无法使用二分查找。本 PR 放宽了这一限制：当主键被始终单调的函数链包裹时，或者当逆波兰表达式（RPN）中包含恒为真的元素时，仍然可以使用二分查找。关闭 [#45536](https://github.com/ClickHouse/ClickHouse/issues/45536)。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* 提高 `Kafka` 引擎的关闭速度（在存在多个 `Kafka` 表时取消额外的 3 秒延迟）。 [#80796](https://github.com/ClickHouse/ClickHouse/pull/80796) ([Azat Khuzhin](https://github.com/azat)).
* 异步插入：降低内存占用并提升插入查询性能。[#80972](https://github.com/ClickHouse/ClickHouse/pull/80972)（[Raúl Marín](https://github.com/Algunenano)）。
* 当日志表被禁用时，不要对处理器进行性能分析。[#81256](https://github.com/ClickHouse/ClickHouse/pull/81256)（[Raúl Marín](https://github.com/Algunenano)）。这样可以加快非常短查询的执行速度。
* 当源数据恰好满足请求要求时，加速 `toFixedString`。[#81257](https://github.com/ClickHouse/ClickHouse/pull/81257)（[Raúl Marín](https://github.com/Algunenano)）。
* 如果用户不受限，则不处理配额值。[#81549](https://github.com/ClickHouse/ClickHouse/pull/81549)（[Raúl Marín](https://github.com/Algunenano)）。这能加速非常短的查询。
* 修复了内存跟踪中的性能回归。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 改进分布式查询中的分片键优化。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* 并行副本：如果所有读取任务都已分配给其他副本，则避免因未使用的慢副本而阻塞等待。 [#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* 并行副本现在使用单独的连接超时时间，请参阅 `parallel_replicas_connect_timeout_ms` 设置。在此之前，并行副本查询的连接超时时间使用的是 `connect_timeout_with_failover_ms`/`connect_timeout_with_failover_secure_ms` 设置（默认 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* 在带有日志的文件系统中，`mkdir` 会被写入文件系统的日志，该日志会持久化到磁盘上。在磁盘较慢的情况下，这可能会花费较长时间。已将其移出保留锁的作用域。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 将 Iceberg manifest 文件的读取推迟到首次执行读取查询时再进行。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 允许在适用的情况下将 `GLOBAL [NOT] IN` 谓词移动到 `PREWHERE` 子句中。 [#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa)).

#### 改进

* `EXPLAIN SYNTAX` 现在使用了新的分析器。它返回由查询树构建的 AST。新增选项 `query_tree_passes`，用于在将查询树转换为 AST 之前控制要执行的遍数。[#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在 Native 格式中为 Dynamic 和 JSON 实现了扁平化序列化，使在序列化/反序列化 Dynamic 和 JSON 数据时无需使用诸如 Dynamic 的 shared variant 和 JSON 的 shared data 等特殊结构。可以通过设置 `output_format_native_use_flattened_dynamic_and_json_serialization` 来启用此序列化方式。该序列化方式可用于便于不同语言的客户端通过 TCP 协议支持 Dynamic 和 JSON。 [#80499](https://github.com/ClickHouse/ClickHouse/pull/80499) ([Pavel Kruglov](https://github.com/Avogar)).
* 在出现 `AuthenticationRequired` 错误后刷新 `S3` 凭证。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `system.asynchronous_metrics` 中添加了字典相关指标 — `DictionaryMaxUpdateDelay` — 字典更新的最大延迟时间（秒）。 — `DictionaryTotalFailedUpdates` — 自上次成功加载以来所有字典中的错误总次数。 [#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse)).
* 已添加关于可能为保存损坏的表而创建的数据库的警告。[#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 在 `S3Queue`、`AzureQueue` 引擎中添加 `_time` 虚拟列。[#78926](https://github.com/ClickHouse/ClickHouse/pull/78926) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 使用于控制 CPU 过载时连接中断的设置支持热重载。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* 为 Azure Blob Storage 中的普通磁盘在 `system.tables` 中报告的数据路径添加容器前缀，使其与 S3 和 GCP 的报告保持一致。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* 现在，clickhouse-client 和 local 也支持将查询参数命名为 `param-<name>`（短横线）以及 `param_<name>`（下划线）。此更改解决了 [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093)。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* 在启用 checksum 时，从本地复制数据到远程 S3 会给出关于带宽折扣的更详细警告信息。[#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu))。
* 之前，当 `input_format_parquet_max_block_size = 0`（无效值）时，ClickHouse 会卡住。现在这一问题已修复。关联 issue：[#79394](https://github.com/ClickHouse/ClickHouse/issues/79394)。关联 PR：[#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* 为 `startup_scripts` 添加 `throw_on_error` 设置：当 `throw_on_error` 为 true 时，除非所有查询都成功完成，否则服务器不会启动。默认情况下，`throw_on_error` 为 false，从而保持原有行为。[#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 支持在任何类型的 `http_handlers` 中添加 `http_response_headers`。[#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 函数 `reverse` 现已支持 `Tuple` 数据类型。解决了 [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053)。[#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* 解决 [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817)：支持从 `system.zookeeper` 表中获取 `auxiliary_zookeepers` 数据。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146)（[Nikolay Govorov](https://github.com/mrdimidium)）。
* 为服务器的 TCP 套接字添加异步指标，以提升可观测性。关闭了 [#80187](https://github.com/ClickHouse/ClickHouse/issues/80187)。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 支持将 `anyLast_respect_nulls` 和 `any_respect_nulls` 作为 `SimpleAggregateFunction`。[#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein))。
* 移除在复制数据库中不必要的 `adjustCreateQueryForBackup` 调用。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar)).
* 允许在 `clickhouse-local` 中使用在 `--` 之后出现且不带等号的额外参数（例如 `-- --config.value='abc'`）。修复了 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292)。[#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `SHOW ... LIKE` 查询中突出显示元字符。修复了 [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275)。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `clickhouse-local` 中让 SQL UDF 持久化。之前创建的函数将在启动时加载。解决了 [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085)。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 EXPLAIN 计划中 preliminary DISTINCT 步骤的描述。[#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus))。
* 允许在 ODBC/JDBC 中使用命名集合。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 用于统计只读磁盘和损坏磁盘数量的指标。在 `DiskLocalCheckThread` 启动时记录标识性日志。 [#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu))。
* 实现对带投影的 `s3_plain_rewritable` 存储的支持。在早期版本中，S3 中引用投影的元数据对象在被移动时不会更新。关闭 [#70258](https://github.com/ClickHouse/ClickHouse/issues/70258)。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` 命令将不再尝试在只读和一次写入磁盘上查找数据分片。这解决了 [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430)。[#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 降低了关于合并 part 的日志消息级别。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* 修改 Iceberg 表的分区裁剪默认行为。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* 为索引搜索算法的可观测性新增两个 ProfileEvents：`IndexBinarySearchAlgorithm` 和 `IndexGenericExclusionSearchAlgorithm`。[#80679](https://github.com/ClickHouse/ClickHouse/pull/80679)（[Pablo Marcos](https://github.com/pamarcos)）。
* 不再在日志中针对旧内核不支持 `MADV_POPULATE_WRITE` 进行抱怨（以避免日志污染）。[#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `TTL` 表达式中新增了对 `Date32` 和 `DateTime64` 的支持。[#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand)).
* 调整 `max_merge_delayed_streams_for_parallel_write` 的兼容性设置。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* 修复崩溃问题：如果在析构函数中尝试删除临时文件（用于将临时数据溢写到磁盘）时抛出异常，程序可能会终止。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 为 `SYSTEM SYNC REPLICA` 添加 `IF EXISTS` 修饰符。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano))。
* 完善关于“Having zero bytes, but read range is not finished...”的异常消息，在 `system.filesystem_cache` 中新增 `finished_download_time` 列。 [#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在与索引一起使用且 indexes = 1 时，为 `EXPLAIN` 输出新增搜索算法部分。该部分会显示 “binary search” 或 “generic exclusion search” 之一。[#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos))。
* 在 2024 年初，由于新分析器默认未启用，`prefer_column_name_to_alias` 在 MySQL 处理器中被硬编码为 true。现在，可以去除该硬编码。[#80916](https://github.com/ClickHouse/ClickHouse/pull/80916)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 现在，`system.iceberg_history` 会显示 glue 或 iceberg rest 等 catalog 数据库的历史记录。同时，为保持一致性，将 `system.iceberg_history` 中的 `table_name` 和 `database_name` 列重命名为 `table` 和 `database`。[#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin)).
* 为 `merge` 表函数启用只读模式，从而在使用该函数时无需授予 `CREATE TEMPORARY TABLE` 权限。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 更好地观测内存缓存（在 `system.metrics` 中暴露缓存信息，以替代不完整的 `system.asynchronouse_metrics`）。在 `dashboard.html` 中新增内存缓存大小显示（以字节为单位）。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` 已重命名为 `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes`。[#81023](https://github.com/ClickHouse/ClickHouse/pull/81023)（[Azat Khuzhin](https://github.com/azat)）。
* 在从 `system.rocksdb` 读取时，忽略引擎不支持 `RocksDB` 表的数据库。[#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 允许在 `clickhouse-local` 的配置文件中配置 `filesystem_caches` 和 `named_collections`。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复 `INSERT` 查询中 `PARTITION BY` 的高亮显示。在早期版本中，`PARTITION BY` 不会作为关键字高亮显示。[#81106](https://github.com/ClickHouse/ClickHouse/pull/81106)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI 中的两个小改进：- 正确处理没有输出的查询，例如 `CREATE`、`INSERT`（此前，这类查询会导致加载图标一直无限旋转）；- 双击某个表时，自动滚动到顶部。[#81131](https://github.com/ClickHouse/ClickHouse/pull/81131)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `MemoryResidentWithoutPageCache` 指标表示服务器进程使用的物理内存用量（不包括用户空间页缓存），单位为字节。在使用用户空间页缓存时，该指标可以更准确地反映实际内存使用情况。当用户空间页缓存被禁用时，该值等于 `MemoryResident`。[#81233](https://github.com/ClickHouse/ClickHouse/pull/81233)（[Jayme Bird](https://github.com/jaymebrd)）。
* 将客户端、本地服务器、Keeper 客户端和 disks 应用中手动记录的异常标记为“已记录”，以避免在日志中重复记录。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` 和 `use_skip_indexes_if_final_exact_mode` 的默认值现在为 `True`。带有 `FINAL` 子句的查询现在会使用跳过索引（如适用）来初步筛选数据块（granule），并读取匹配主键范围所对应的所有额外数据块（granule）。如果用户需要沿用之前近似/不精确结果的行为，在经过仔细评估后可以将 `use_skip_indexes_if_final_exact_mode` 设置为 `FALSE`。[#81331](https://github.com/ClickHouse/ClickHouse/pull/81331)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 当在 Web UI 中有多个查询时，将会运行光标所在的那个查询。作为对 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) 的延续。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 此 PR 解决了在转换函数单调性检查中 `is_strict` 实现相关的问题。目前，一些转换函数（例如 `toFloat64(UInt32)` 和 `toDate(UInt8)`）在本应返回 `is_strict` 为 true 时，却错误地返回为 false。 [#81359](https://github.com/ClickHouse/ClickHouse/pull/81359) ([zoomxi](https://github.com/zoomxi))。
* 在检查 `KeyCondition` 是否匹配一个连续范围时，如果键被非严格函数链包裹，则可能需要将 `Constraint::POINT` 转换为 `Constraint::RANGE`。例如：`toDate(event_time) = '2025-06-03'` 意味着 `event_time` 的取值范围为：[&#39;2025-06-03 00:00:00&#39;, &#39;2025-06-04 00:00:00&#39;)。此 PR 修复了这一行为。[#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* 如果指定了 `--host` 或 `--port`，`clickhouse`/`ch` 别名将调用 `clickhouse-client`，而不是 `clickhouse-local`。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) 的后续。关闭问题 [#65252](https://github.com/ClickHouse/ClickHouse/issues/65252)。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 现在我们已经获取了 keeper 响应时间分布数据，就可以对指标用的直方图桶进行调优。[#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 添加 profile 事件 `PageCacheReadBytes`。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 修复文件系统缓存中的逻辑错误：“Having zero bytes but range is not finished”。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。

#### Bug 修复（在官方稳定版中对用户可见的错误行为）

* 修复参数化视图在使用 SELECT EXCEPT 查询时的问题。关闭 [#49447](https://github.com/ClickHouse/ClickHouse/issues/49447)。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer：修复在 join 中列类型提升后列投影名称不正确的问题。关闭 [#63345](https://github.com/ClickHouse/ClickHouse/issues/63345)。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519) ([Dmitry Novik](https://github.com/novikd))。
* 修复了在启用 analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier 且发生列名冲突时的逻辑错误。[#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在启用 `allow_push_predicate_ast_for_distributed_subqueries` 时，修复下推谓词中对 CTE 的使用方式。修复 [#75647](https://github.com/ClickHouse/ClickHouse/issues/75647)。修复 [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672)。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了一个问题：即使指定的副本不存在，`SYSTEM SYNC REPLICA LIGHTWEIGHT 'foo'` 也会报告成功。现在该命令会在尝试同步之前，先在 Keeper 中正确检查该副本是否存在。[#78405](https://github.com/ClickHouse/ClickHouse/pull/78405)（[Jayme Bird](https://github.com/jaymebrd)）。
* 修复了一个极其特定情况下的崩溃问题：当在 `ON CLUSTER` 查询的 `CONSTRAINT` 部分中使用 `currentDatabase` 函数时会导致崩溃。此修复关闭了 [#78100](https://github.com/ClickHouse/ClickHouse/issues/78100)。[#79070](https://github.com/ClickHouse/ClickHouse/pull/79070)（[pufit](https://github.com/pufit)）。
* 修复在服务器间查询中外部角色传递的问题。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* 请在 `SingleValueDataGeneric` 中改用 `IColumn` 而不是 `Field`。这修复了某些聚合函数（例如在 `Dynamic/Variant/JSON` 类型上的 `argMax`）返回值不正确的问题。[#79166](https://github.com/ClickHouse/ClickHouse/pull/79166)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复了在 Azure Blob Storage 中应用 `use_native_copy` 和 `allow_azure_native_copy` 设置的问题，并改为仅在凭据匹配时才使用原生拷贝功能，解决了 [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964)。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在检查某列是否有关联时，由其来源作用域未知而导致的逻辑错误。修复 [#78183](https://github.com/ClickHouse/ClickHouse/issues/78183)。修复 [#79451](https://github.com/ClickHouse/ClickHouse/issues/79451)。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* 修复在包含 ColumnConst 和 Analyzer 的 grouping sets 中导致结果错误的问题。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* 修复在从分布式表读取且本地副本滞后时，本地分片结果被重复返回的问题。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 修复符号位为负的 NaN 的排序顺序。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 现在 GROUP BY ALL 不再将 GROUPING 部分考虑在内。[#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了 `TopK` / `TopKWeighted` 函数中不正确的状态合并问题，该问题会在容量尚未耗尽时导致误差显著增大。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* 支持在 `azure_blob_storage` 对象存储中使用 `readonly` 设置。[#79954](https://github.com/ClickHouse/ClickHouse/pull/79954)（[Julia Kartseva](https://github.com/jkartseva)）。
* 修复了在使用包含反斜杠转义字符的 `match(column, '^…')` 时导致的查询结果错误和内存不足崩溃问题。[#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov))。
* 在数据湖中禁用 Hive 分区。部分解决 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937)。[#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* 修复了包含 lambda 表达式的 skip 索引无法生效的问题。当索引定义中的高阶函数与查询中的完全一致时，现在能够正确应用。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修正副本在根据复制日志执行 `ATTACH_PART` 命令附加分片时的元数据版本。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 与其他函数不同，可执行用户自定义函数（eUDF）的名称不会被添加到 `system.query_log` 表的 `used_functions` 列中。此 PR 实现在请求中使用 eUDF 时将其名称添加到该列中。[#80073](https://github.com/ClickHouse/ClickHouse/pull/80073)（[Kyamran](https://github.com/nibblerenush)）。
* 修复在 Arrow 格式中使用 LowCardinality(FixedString) 时的逻辑错误。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复从 Merge 引擎读取子列的问题。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了 `KeyCondition` 中数值类型比较的一个错误。[#80207](https://github.com/ClickHouse/ClickHouse/pull/80207)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 修复在对带有投影的表使用惰性物化时出现的 AMBIGUOUS&#95;COLUMN&#95;NAME 错误。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在使用隐式投影时，对 `LIKE &#39;ab&#95;c%&#39;` 这类字符串前缀过滤条件的计数优化不正确的问题。此修复解决了 [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250)。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* 修复 MongoDB 文档中嵌套的数值字段被错误地序列化为字符串的问题。移除对来自 MongoDB 的文档的最大深度限制。[#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* 在 Replicated 数据库中对 RMT 的元数据检查放宽限制。关闭 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296)。[#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复用于 PostgreSQL 存储的 DateTime 和 DateTime64 的文本表示形式。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 允许在 `StripeLog` 表中使用带时区的 `DateTime`。从而关闭了 [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120)。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当查询计划中的某个步骤会改变行数时，如果谓词中包含非确定性函数，则对该谓词禁用过滤下推（filter push-down）。修复了 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273)。[#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在包含子列的投影（projection）中可能出现的逻辑错误和崩溃。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 `ON` 表达式不是简单等值条件时，由逻辑 JOIN sep 的 filter-push-down 优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。同时修复 [#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) 和 [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848)。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在分区表中读取逆序键时返回错误结果的问题。该修复解决了 [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987)。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* 修复了在具有可为空键且启用 optimize&#95;read&#95;in&#95;order 的表中出现的排序错误问题。[#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 修复了在使用 SYSTEM STOP REPLICATED VIEW 暂停视图后，删除可刷新物化视图（DROP）操作会卡住的问题。[#80543](https://github.com/ClickHouse/ClickHouse/pull/80543)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复在分布式查询中使用常量元组时出现的 &#39;Cannot find column&#39; 错误。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在启用 `join_use_nulls` 时 Distributed 表中的 `shardNum` 函数。[#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复在 Merge 引擎中读取仅存在于部分表中的列时返回结果不正确的问题。[#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 SSH 协议可能因 replxx 卡死而出现的问题。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* iceberg&#95;history 表中的时间戳现在应该已经是正确的。[#80711](https://github.com/ClickHouse/ClickHouse/pull/80711)（[Melvyn Peignon](https://github.com/melvynator)）。
* 修复在字典注册失败时可能发生的崩溃（当 `CREATE DICTIONARY` 因 `CANNOT_SCHEDULE_TASK` 失败时，有可能在字典注册表中留下悬空指针，后续可能导致崩溃）。 [#80714](https://github.com/ClickHouse/ClickHouse/pull/80714) ([Azat Khuzhin](https://github.com/azat)).
* 修复对象存储表函数中对仅包含单个元素的 enum 通配模式的处理。[#80716](https://github.com/ClickHouse/ClickHouse/pull/80716)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复了 `Tuple(Dynamic)` 与 `String` 之间比较函数的错误结果类型问题，该问题会导致逻辑错误。[#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* 为 Unity Catalog 补充对数据类型 `timestamp_ntz` 的支持。修复 [#79535](https://github.com/ClickHouse/ClickHouse/issues/79535) 和 [#79875](https://github.com/ClickHouse/ClickHouse/issues/79875)。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* 修复在包含 `IN CTE` 的分布式查询中出现的 `THERE_IS_NO_COLUMN` 错误。修复了 [#75032](https://github.com/ClickHouse/ClickHouse/issues/75032)。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复外部 ORDER BY 产生过多文件（导致内存占用过高）的问题。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* 此 PR 可能会关闭 [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742)。 [#80783](https://github.com/ClickHouse/ClickHouse/pull/80783) ([zoomxi](https://github.com/zoomxi))。
* 修复 Kafka 中因 get&#95;member&#95;id() 从 NULL 创建 std::string 导致的崩溃问题（很可能只会在连接 broker 失败时出现）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* 在关闭 Kafka 引擎之前，正确地等待所有消费者退出（关闭后仍然存在的活动消费者可能会触发各种调试断言失败，并且在表被删除/分离后仍可能在后台继续从 broker 读取数据）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat)).
* 修复由 `predicate-push-down` 优化导致的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误，解决了 [#80443](https://github.com/ClickHouse/ClickHouse/issues/80443)。[#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在带 USING 的 JOIN 中解析表函数中的星号 (*) 通配符时的逻辑错误。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复 Iceberg 元数据文件缓存的内存计量问题。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* 修复使用可为空分区键时的错误分区问题。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在启用谓词下推（`allow_push_predicate_ast_for_distributed_subqueries=1`）的分布式查询中，当源表在发起查询的节点上不存在时出现的 `Table does not exist` 错误。修复了 [#77281](https://github.com/ClickHouse/ClickHouse/issues/77281)。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复具名窗口中嵌套函数的逻辑错误。[#80926](https://github.com/ClickHouse/ClickHouse/pull/80926)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 修复 nullable 列和浮点列的 extremes 统计。[#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在查询 `system.tables` 时可能发生的崩溃问题（在内存压力较大时很可能出现）。 [#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat))。
* 修复了对压缩格式由文件扩展名推断的文件执行带截断的原子重命名时的问题。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* 修复 ErrorCodes::getName。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复了当用户没有对所有表的访问权限时，无法在 Unity Catalog 中列出表的问题。现在所有表都会被正确列出，尝试读取受限表时将抛出异常。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin)).
* 现在，ClickHouse 在执行 `SHOW TABLES` 查询时将忽略来自数据湖目录的错误和意外响应。修复 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725)。[#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* 修复在 `JSONExtract` 和 JSON 类型解析中，将整数解析为 `DateTime64` 时出现的问题。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* 将 `date_time_input_format` 设置反映到 schema 推断缓存中。[#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在执行 INSERT 时，如果表在查询开始之后但在发送列数据之前被 DROP 而导致的崩溃。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `quantileDeterministic` 中未初始化值的使用问题。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* 修复 metadatastoragefromdisk 磁盘事务中的硬链接计数管理问题，并添加测试。[#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* 与其他函数不同，用户自定义函数 (UDF) 的名称不会被写入 `system.query_log` 表中。该 PR 实现了在查询中使用 UDF 时，将该 UDF 的名称添加到 `used_executable_user_defined_functions` 或 `used_sql_user_defined_functions` 这两列之一中。[#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush))。
* 修复了通过 HTTP 协议以文本格式（`JSON`、`Values` 等）插入数据且省略 `Enum` 字段时，出现 `Too large size ... passed to allocator` 错误或可能崩溃的问题。[#81145](https://github.com/ClickHouse/ClickHouse/pull/81145)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复在将包含稀疏列的 INSERT 数据块写入非 MT 物化视图时触发的 LOGICAL&#95;ERROR。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* 修复在跨副本复制场景下使用 `distributed_product_mode_local=local` 时出现的 `Unknown table expression identifier` 错误。[#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复了在过滤后错误缓存 Parquet 文件行数的问题。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在使用相对缓存路径时 fs cache 的 max&#95;size&#95;to&#95;total&#95;space 设置问题。[#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了 clickhouse-local 在以 Parquet 格式输出常量元组或 Map 时崩溃的问题。[#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321))。
* 校验通过网络接收的数组偏移量。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 修复在查询连接空表且使用窗口函数时的一些边界情况。该 bug 会导致并行流数量爆炸式增长，进而引发 OOM。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* 针对数据湖集群函数（`deltaLakeCluster`、`icebergCluster` 等）的修复：（1）在使用旧版 analyzer 搭配 `Cluster` 函数时，修复 `DataLakeConfiguration` 中潜在的段错误（segfault）；（2）移除重复的数据湖元数据更新（多余的对象存储请求）；（3）修复在未显式指定格式时对对象存储进行的冗余列出操作（此前已对非 Cluster 数据湖引擎完成了该修复）。[#81300](https://github.com/ClickHouse/ClickHouse/pull/81300) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 使 `force&#95;restore&#95;data` 标志可用于恢复丢失的 Keeper 元数据。[#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* 修复 delta-kernel 中的 region 错误，解决了 [#79914](https://github.com/ClickHouse/ClickHouse/issues/79914)。[#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 禁用了针对 divideOrNull 的不正确 JIT。[#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano)).
* 修复当 MergeTree 表的分区列名过长时出现的插入错误。[#81390](https://github.com/ClickHouse/ClickHouse/pull/81390)（[hy123q](https://github.com/haoyangqian)）。
* 已在 [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) 中回溯修复：修复了在合并期间发生异常时 `Aggregator` 可能出现的崩溃问题。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 不要在内存中存储多份 manifest 文件的内容。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470)（[Daniil Ivanik](https://github.com/divanik)）。
* 修复在关闭后台线程池（`background_.*pool_size`）时可能发生的崩溃。[#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat))。
* 修复在向使用 `URL` 引擎的表写入时，`Npy` 格式导致的越界读取问题。关闭了 [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356)。[#81502](https://github.com/ClickHouse/ClickHouse/pull/81502)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在某些情况下，Web UI 可能会显示为 `NaN%`（典型的 JavaScript 问题）。 [#81507](https://github.com/ClickHouse/ClickHouse/pull/81507) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复在 `database_replicated_enforce_synchronous_settings=1` 配置下的 `DatabaseReplicated` 问题。[#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat))。
* 修复 LowCardinality(Nullable(...)) 类型的排序顺序。 [#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 如果尚未从套接字中完全读取请求，服务器不应保留该 HTTP 连接。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* 使标量关联子查询返回可空的投影表达式结果。修复关联子查询产生空结果集时的行为。[#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd))。
* 修复在对 `ReplicatedMergeTree` 执行 `ATTACH` 时出现的 `Unexpected relative path for a deduplicated part` 错误。[#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat))。
* 查询设置 `use_iceberg_partition_pruning` 对 iceberg 存储不会生效，因为它使用的是全局上下文而不是查询上下文。由于其默认值为 true，因此影响不大。此 PR 对其进行了修复。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991)).
* 已在 [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) 中回溯修复：修复在 TTL 表达式中使用字典进行合并时出现的 “Context has expired” 错误。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* 为 MergeTree 设置 `merge_max_block_size` 添加校验，以确保其不为 0。 [#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复 `clickhouse-local` 中导致 `DROP VIEW ` 查询阻塞的问题。[#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc)).
* 在某些情况下修复 StorageRedis 的 JOIN。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在启用旧版分析器且使用空的 `USING ()` 时导致 `ConcurrentHashJoin` 崩溃的问题。 [#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat)).
* Keeper 修复：当日志中存在无效条目时，阻止提交新的日志条目。之前，如果 leader 错误地应用了一些日志，即使 follower 会检测到摘要不匹配并中止，leader 仍会继续提交新的日志条目。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在处理标量关联子查询时未读取所需列的问题。修复了 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 有人在我们的代码里到处乱用 Kusto。我已经清理干净了。关闭了 [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643)。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在此前的版本中，服务器在处理对 `/js` 的请求时会返回过多的内容。该更改修复了 [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890)。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 之前，在 `MongoDB` 表引擎定义中可以在 `host:port` 参数里包含路径组件，但会被悄然忽略。MongoDB 集成现在会拒绝加载此类表。通过此修复，*如果 `MongoDB` 引擎有五个参数，我们允许加载此类表，并忽略路径组件*，而是使用参数中的数据库名称。*注意：* 此修复不适用于新创建的表、使用 `mongo` 表函数的查询，以及字典源和命名集合。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在合并过程中抛出异常时 `Aggregator` 可能发生崩溃的问题。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* 修复 `arraySimilarity` 中的复制粘贴错误，禁止将 `UInt32` 和 `Int32` 用作权重。更新测试和文档。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* 修复建议线程与主客户端线程之间潜在的数据竞争问题。[#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat))。

#### 构建/测试/打包优化

* 使用 `postgres` 16.9。[#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `openssl` 3.2.4。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 2025-01-27 版 `abseil-cpp`。[#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `mongo-c-driver` 1.30.4 版本。[#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `krb5` 1.21.3-final 版本。[#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `orc` 2.1.2。[#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 使用 `grpc` 1.73.0 版本。 [#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 使用 `delta-kernel-rs` v0.12.1。[#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 `c-ares` 更新到 `v1.34.5`。[#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 将 `curl` 升级到 8.14，以修复 CVE-2025-5025 和 CVE-2025-4947。[#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit))。
* 将 `libarchive` 升级到 3.7.9，以修复以下漏洞：CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。[#81174](https://github.com/ClickHouse/ClickHouse/pull/81174)（[larryluogit](https://github.com/larryluogit)）。
* 将 `libxml2` 升级至 2.14.3。[#81187](https://github.com/ClickHouse/ClickHouse/pull/81187)（[larryluogit](https://github.com/larryluogit)）。
* 避免将 vendor 目录中的 Rust 源码复制到 `CARGO_HOME` 中。[#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* 通过用我们自己的端点替换 Sentry 库，移除了对该库的依赖。[#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 CI 镜像中更新 Python 依赖，以处理 Dependabot 告警。[#80658](https://github.com/ClickHouse/ClickHouse/pull/80658)（[Raúl Marín](https://github.com/Algunenano)）。
* 在启用 Keeper 故障注入时，为提高测试的鲁棒性，在启动阶段重试从 Keeper 读取复制 DDL 停止标记。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger)).
* 将 Ubuntu 存档 URL 改为使用 https。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* 在测试镜像中更新 Python 依赖。[#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot)).
* 为 Nix 构建引入 `flake.nix`。[#81463](https://github.com/ClickHouse/ClickHouse/pull/81463) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复 `delta-kernel-rs` 在构建期间需要访问网络的问题。已关闭 [#80609](https://github.com/ClickHouse/ClickHouse/issues/80609)。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。请阅读文章 [A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust)。

### ClickHouse 25.5 版本发布于 2025-05-22 {#255}

#### 向后不兼容的变更

* 函数 `geoToH3` 现在按 (lat, lon, res) 的顺序接收输入（这与其他几何函数的通用约定一致）。如果用户希望保留之前的参数顺序 (lon, lat, res)，可以将设置 `geotoh3_argument_order = 'lon_lat'`。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852)（[Pratima Patel](https://github.com/pratimapatel2008)）。
* 新增文件系统缓存设置 `allow_dynamic_cache_resize`，默认值为 `false`，用于控制是否允许动态调整文件系统缓存大小。原因：在某些环境（如 ClickHouse Cloud）中，所有扩缩容事件都通过重启进程来完成，我们希望显式禁用该特性，以便对行为有更多控制，同时作为一项安全防护措施。此 PR 被标记为向后不兼容，因为在旧版本中，动态缓存调整在默认情况下无需特殊设置即可启用。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 移除了对旧版索引类型 `annoy` 和 `usearch` 的支持。这两者已经长期只是占位实现，即任何尝试使用这些旧索引的操作都会返回错误。如果你仍然有 `annoy` 和 `usearch` 索引，请将它们删除。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802)（[Robert Schulze](https://github.com/rschu1ze)）。
* 移除服务器设置 `format_alter_commands_with_parentheses`。该设置在 24.2 版本中引入且默认禁用，并在 25.2 中改为默认启用。由于不存在不支持新格式的 LTS 版本，因此我们可以移除此设置。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 默认启用 `DeltaLake` 存储的 `delta-kernel-rs` 实现。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 如果从 `URL` 读取时涉及多次重定向，设置 `enable_url_encoding` 会在整个重定向链中被正确应用。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563)（[Shankar Iyer](https://github.com/shankar-iyer)）。设置 `enble_url_encoding` 的默认值现在为 `false`。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088)（[Shankar Iyer](https://github.com/shankar-iyer)）。

#### 新功能

* 在 WHERE 子句中支持标量关联子查询，解决了 [#6697](https://github.com/ClickHouse/ClickHouse/issues/6697)。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。在简单场景下，在 SELECT 列表中支持关联子查询。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。现在已经覆盖了 100% 的 TPC-H 测试套件。
* 使用向量相似度索引的向量搜索现已进入 beta 阶段（此前为实验特性）。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 `Parquet` 格式中支持地理类型（geo types）。修复了 [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) 问题。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* 新增函数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8`，用于计算“稀疏 n-gram（sparse-ngrams）”——一种用于索引和搜索的鲁棒子串提取算法。[#79517](https://github.com/ClickHouse/ClickHouse/pull/79517)（[scanhex12](https://github.com/scanhex12)）。
* `clickhouse-local`（及其简写别名 `ch`）现在在存在需要处理的输入数据时，会隐式使用 `FROM table`。这解决了 [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023)。同时，在处理常规文件且未指定 `--input-format` 时，已在 `clickhouse-local` 中启用格式推断。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加 `stringBytesUniq` 和 `stringBytesEntropy` 函数，用于搜索可能是随机或加密的数据。[#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* 新增了用于 Base32 编码和解码的函数。[#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x))。
* 添加 `getServerSetting` 和 `getMergeTreeSetting` 函数，关闭 #78318。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439) ([NamNguyenHoai](https://github.com/NamHoaiNguyen))。
* 新增 `iceberg_enable_version_hint` 设置项，用于利用 `version-hint.text` 文件。[#78594](https://github.com/ClickHouse/ClickHouse/pull/78594)（[Arnaud Briche](https://github.com/arnaudbriche)）。
* 支持按 `LIKE` 关键字进行过滤，截断数据库中的特定表。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 在 `MergeTree` 系列表中支持 `_part_starting_offset` 虚拟列。该列表示所有之前 part 的行数累积值，并在查询时基于当前 part 列表进行计算。该累积值在整个查询执行过程中都会被保留，即使在 part 剪枝之后仍然有效。相关内部逻辑已重构以支持此行为。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird))。
* 添加函数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull`，当右侧参数为零时返回 NULL。[#78276](https://github.com/ClickHouse/ClickHouse/pull/78276)（[kevinyhzou](https://github.com/KevinyhZou)）。
* ClickHouse 向量搜索现在同时支持预过滤和后过滤，并提供相关设置以实现更细粒度的控制。（issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)）。[#79854](https://github.com/ClickHouse/ClickHouse/pull/79854)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 添加 [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 和 [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 函数。支持对使用 [`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) 分区的 `Iceberg` 表进行数据文件裁剪。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。

#### 实验特性

* 新增 `Time`/`Time64` 数据类型：`Time`（HHH:MM:SS）和 `Time64`（HHH:MM:SS.`&lt;fractional&gt;`），以及一些基础的类型转换函数和用于与其他数据类型交互的函数。同时，将现有函数 `toTime` 的名称更改为 `toTimeWithFixedDate`，因为类型转换函数需要保留 `toTime` 这个函数名。[#75735](https://github.com/ClickHouse/ClickHouse/pull/75735)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 面向 Iceberg 数据湖的 Hive metastore 目录。[#77677](https://github.com/ClickHouse/ClickHouse/pull/77677)（[scanhex12](https://github.com/scanhex12)）。
* 类型为 `full_text` 的索引重命名为 `gin`。这与 PostgreSQL 和其他数据库中更常见的术语保持一致。现有的 `full_text` 类型索引仍然可以加载，但在尝试在搜索中使用它们时会抛出异常（并建议改用 `gin` 索引）。[#79024](https://github.com/ClickHouse/ClickHouse/pull/79024)（[Robert Schulze](https://github.com/rschu1ze)）。

#### 性能优化

* 将 Compact 部分格式更改为为每个子流保存标记，从而可以单独读取子列。旧的 Compact 格式在读取时仍然受支持，并且可以通过 MergeTree 设置 `write_marks_for_substreams_in_compact_parts` 在写入时启用。由于它更改了 Compact 部分的存储方式，为了更安全地进行升级，默认情况下是禁用的。在接下来的某个版本中，它将默认启用。[#77940](https://github.com/ClickHouse/ClickHouse/pull/77940)（[Pavel Kruglov](https://github.com/Avogar)）。
* 允许将包含子列的条件下推到 PREWHERE [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar))。
* 通过在多个 granule 上并行计算其表达式，加速二级索引。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 默认启用 `compile_expressions`（用于普通表达式片段的 JIT 编译器）。由此关闭了 [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386) 和 [#66486](https://github.com/ClickHouse/ClickHouse/issues/66486)。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增设置：`use_skip_indexes_in_final_exact_mode`。如果对 `ReplacingMergeTree` 表的查询使用 FINAL 子句，只根据 skip index 选择要读取的表范围，可能会产生不正确的结果。该设置可以通过扫描与 skip index 返回的主键范围有重叠的较新数据部分，来确保返回正确结果。设置为 0 表示禁用，1 表示启用。[#78350](https://github.com/ClickHouse/ClickHouse/pull/78350)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 对象存储集群表函数（例如 `s3Cluster`）现在会基于一致哈希将待读取的文件分配给各副本，从而提升缓存局部性。[#77326](https://github.com/ClickHouse/ClickHouse/pull/77326)（[Andrej Hoos](https://github.com/adikus)）。
* 通过允许并行执行 `INSERT` 来提升 `S3Queue`/`AzureQueue` 的性能（可通过队列设置 `parallel_inserts=true` 启用）。此前 S3Queue/AzureQueue 只能对处理流水线的第一部分（下载、解析）并行化，而 `INSERT` 是单线程的，并且 `INSERT` 几乎总是性能瓶颈。现在性能几乎可以随 `processing_threads_num` 线性扩展。[#77671](https://github.com/ClickHouse/ClickHouse/pull/77671)（[Azat Khuzhin](https://github.com/azat)）。在 S3Queue/AzureQueue 中对 `max_processed_files_before_commit` 的处理更加公平。[#79363](https://github.com/ClickHouse/ClickHouse/pull/79363)（[Azat Khuzhin](https://github.com/azat)）。
* 引入了一个阈值（通过设置 `parallel_hash_join_threshold` 进行控制），当右表大小低于该阈值时会回退为使用 `hash` 算法。[#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat))。
* 现在我们在启用并行副本读取时，通过副本数量来确定读取任务的规模。当待读取的数据量不大时，这可以在副本之间实现更合理的工作负载分配。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* 在分布式聚合的最终阶段，允许对 `uniqExact` 状态进行并行合并。[#78703](https://github.com/ClickHouse/ClickHouse/pull/78703)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复在按键聚合中并行合并 `uniqExact` 状态时可能出现的性能下降问题。[#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* 减少对 Azure Storage 的 List Blobs API 调用次数。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复使用并行副本的分布式 INSERT SELECT 的性能问题。[#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* 避免 `LogSeriesLimiter` 在每次构造时都执行清理操作，从而防止在高并发场景下出现锁竞争和性能退化。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 通过启用 trivial count 优化加速查询。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* 改进了部分 `Decimal` 运算的内联处理。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 将 `input_format_parquet_bloom_filter_push_down` 的默认值设置为 true。同时，修正设置变更历史中的一处错误。[#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 针对需要删除所有行的分片，优化了 `ALTER ... DELETE` 变更操作。现在，在这类情况下会直接创建一个空分片来替代原始分片，而无需执行变更操作本身。[#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 在可能的情况下，避免在插入 Compact part 时对数据块进行额外拷贝。[#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar))。
* 添加了设置 `input_format_max_block_size_bytes`，用于按字节限制在输入格式中创建的块大小。这有助于在行包含大值时，避免数据导入期间出现高内存占用。[#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar))。
* 移除线程和 async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests 的保护页。将 `FiberStack` 中的分配方法从 `mmap` 更改为 `aligned_alloc`。由于这会导致 VMA 被拆分，在高负载下可能会触及 vm.max&#95;map&#95;count 的上限。[#79147](https://github.com/ClickHouse/ClickHouse/pull/79147)（[Sema Checherinda](https://github.com/CheSema)）。
* 使用并行副本的惰性物化。[#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).

#### 改进

* 新增了实时应用轻量级删除的功能（通过设置 `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` 实现）。[#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ))。
* 如果在终端中以 pretty 格式显示数据，并且后续数据块具有相同的列宽，则可以从前一个数据块继续显示，通过上移光标将其与前一个数据块拼接起来。这解决了 [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333)。该特性由新的设置项 `output_format_pretty_glue_chunks` 控制。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `isIPAddressInRange` 函数扩展以支持 `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)` 和 `Nullable(IPv6)` 数据类型。[#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff))。
* 允许动态更改 `PostgreSQL` 引擎的连接池参数。[#78414](https://github.com/ClickHouse/ClickHouse/pull/78414)（[Samay Sharma](https://github.com/samay-sharma)）。
* 允许在普通 Projection 中指定 `_part_offset`。这是构建 Projection 索引的第一步。它可以与 [#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) 配合使用，并有助于改进 #63207。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429)（[Amos Bird](https://github.com/amosbird)）。
* 为 `system.named_collections` 添加新列（`create_query` 和 `source`）。修复 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179)。[#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 在系统表 `system.query_condition_cache` 中新增了字段 `condition`。该字段存储明文条件，其对应的哈希值被用作查询条件缓存中的键。[#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze))。
* 现在可以基于 `BFloat16` 列创建向量相似性索引。[#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze))。
* 在 `DateTime64` 的尽力解析模式中支持带小数部分的 Unix 时间戳。[#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* 在存储 `DeltaLake` 的 delta-kernel 实现中，修复列映射模式相关问题，并为 schema 演进添加测试。[#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 通过改进数值转换，优化以 Values 格式向 `Variant` 列插入数据的操作。[#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar))。
* `tokens` 函数已扩展为可接受一个额外的 tokenizer 参数，以及更多 tokenizer 特定的参数。[#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov))。
* `SHOW CLUSTER` 语句现在会展开其参数中的宏（如果有）。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42)).
* 哈希函数现在支持数组、元组和映射中的 `NULL` 值（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) 和 [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008) ([Michael Kolupaev](https://github.com/al13n321))。
* 将 cctz 更新到 2025a。[#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano))
* 将 UDF 的默认 stderr 处理方式改为 &quot;log&#95;last&quot;，以提升易用性。[#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 在 Web UI 中为选项卡支持撤销操作。修复了 [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284)。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `recoverLostReplica` 过程中移除相关设置，其方式与此前在以下变更中所做的处理相同： [https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 添加 profile 事件：`ParquetReadRowGroups` 和 `ParquetPrunedRowGroups`，用于分析 Parquet 索引裁剪情况。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* 支持在集群上对数据库执行 `ALTER` 操作。[#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 显式跳过 QueryMetricLog 统计收集过程中错过的运行，否则日志需要很长时间才能追上当前时间。[#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 对基于 `Arrow` 的格式的读取进行了一些小优化。[#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc)).
* 设置 `allow_archive_path_syntax` 被误标记为实验性。添加了一个测试，以防止实验性设置在默认情况下被启用。[#79320](https://github.com/ClickHouse/ClickHouse/pull/79320)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使页面缓存设置可针对每个查询进行调整。这对于更快地进行试验，以及对高吞吐量和低延迟查询进行精细调优是必要的。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 对于看起来像典型 64 位哈希值的数字，不再以美化格式输出其数值提示信息。已关闭 [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334)。 [#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高级仪表板中图表的颜色会根据对应查询的哈希值计算得出。这样在滚动浏览仪表板时，更容易记住并找到某个图表。[#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 新增异步指标 `FilesystemCacheCapacity` —— `cache` 虚拟文件系统中的总容量。该指标对于整体基础设施监控非常有用。[#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 优化对 system.parts 的访问（仅在需要时读取列/索引大小）。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* 改为仅为查询 `'SHOW CLUSTER <name>'` 计算相关字段，而非所有字段。[#79368](https://github.com/ClickHouse/ClickHouse/pull/79368)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 允许指定 `DatabaseCatalog` 的存储设置。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 `DeltaLake` 中支持本地存储。 [#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 添加一个查询级设置以启用 delta-kernel-rs：`allow_experimental_delta_kernel_rs`。[#79418](https://github.com/ClickHouse/ClickHouse/pull/79418)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复从 Azure Blob Storage/S3 对象存储列出 blob 时可能出现的死循环问题。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger))。
* 新增文件系统缓存设置 `max_size_ratio_to_total_space`。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 对于 `clickhouse-benchmark`，将 `reconnect` 选项重新配置为接受 0、1 或 N 作为取值，以按相应方式执行重连。[#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* 允许对位于不同 `plain_rewritable` 磁盘上的表使用 `ALTER TABLE ... MOVE|REPLACE PARTITION`。[#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva)).
* 现在，如果参考向量的类型为 `Array(BFloat16)`，也会使用向量相似度索引。[#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer))
* 将 last&#95;error&#95;message、last&#95;error&#95;trace 和 query&#95;id 添加到 system.error&#95;log 表。相关 issue [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* 默认启用崩溃报告发送功能。可以在服务器的配置文件中将其关闭。[#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 系统表 `system.functions` 现在会显示各个函数首次引入时所使用的 ClickHouse 版本。[#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze))。
* 添加了 `access_control_improvements.enable_user_name_access_type` 设置。此设置用于启用或禁用针对用户/角色的精细化授权功能，该功能最初在 [https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) 中引入。如果你的集群中存在版本低于 25.1 的副本，建议关闭此设置。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* 现在 `ASTSelectWithUnionQuery::clone()` 方法的正确实现也会考虑 `is_normalized` 字段。这可能有助于解决问题 [#77569](https://github.com/ClickHouse/ClickHouse/issues/77569)。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复使用 EXCEPT 运算符的某些查询在格式化时不一致的问题。如果 EXCEPT 运算符左侧以 `*` 结尾，格式化后的查询会丢失括号，进而被解析为带有 `EXCEPT` 修饰符的 `*`。这些查询是通过模糊测试工具（fuzzer）发现的，在实际使用中不太可能遇到。此更改关闭 [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950)。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过使用变体反序列化顺序缓存，对 `JSON` 类型的解析进行了小幅优化。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 添加设置 `s3_slow_all_threads_after_network_error`。[#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar))。
* 用于记录所选待合并数据部分的日志级别不正确（Information）。关闭了 [#80061](https://github.com/ClickHouse/ClickHouse/issues/80061)。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer：在工具提示和状态信息中添加 runtime/share 信息。[#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa))。
* trace-visualizer：从 ClickHouse 服务器加载数据。[#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa))。
* 为失败的合并操作添加指标。[#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `clickhouse-benchmark` 在指定最大迭代次数时，将基于该最大值显示百分比。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新增 `system.parts` 表可视化器。[#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa))。
* 新增查询延迟分析工具。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).

#### Bug 修复（官方稳定版中出现的用户可见错误行为）

* 修复对数据 part 中缺失列的重命名处理。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* 物化视图可能启动得太晚，例如在向其传输数据的 Kafka 表之后才启动。[#72123](https://github.com/ClickHouse/ClickHouse/pull/72123)（[Ilya Golshtein](https://github.com/ilejn)）。
* 修复了在启用 analyzer 时创建 `VIEW` 时对 `SELECT` 查询重写的问题，关闭 [#75956](https://github.com/ClickHouse/ClickHouse/issues/75956)。[#76356](https://github.com/ClickHouse/ClickHouse/pull/76356) ([Dmitry Novik](https://github.com/novikd))。
* 修复了从服务器（通过 `apply_settings_from_server`）应用 `async_insert` 的问题（之前会在客户端触发 `Unknown packet 11 from server` 错误）。 [#77578](https://github.com/ClickHouse/ClickHouse/pull/77578) ([Azat Khuzhin](https://github.com/azat)).
* 修复了在 Replicated 数据库中新添加副本上无法正常使用可刷新物化视图的问题。[#77774](https://github.com/ClickHouse/ClickHouse/pull/77774)（[Michael Kolupaev](https://github.com/al13n321)）。
* 修复了可刷新的物化视图会破坏备份的问题。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `transform` 中旧版触发逻辑的错误。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复了在某些情况下与 analyzer 配合使用时未能应用二级索引的问题。修复了 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607)，[#69373](https://github.com/ClickHouse/ClickHouse/issues/69373)。[#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复在启用压缩的 HTTP 协议下导出 profile 事件（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）时的问题（误差不应超过缓冲区大小，通常约为 1MiB）。 [#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `JOIN ... USING` 涉及 `ALIAS` 列时分析器产生 `LOGICAL_ERROR` 的问题——现在应抛出更合适的错误。[#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复分析器：当 `SELECT` 包含位置参数时，`CREATE VIEW ... ON CLUSTER` 会失败的问题。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复在对支持模式推断的表函数执行 `INSERT SELECT` 且 `SELECT` 中包含标量子查询时出现的 `Block structure mismatch` 错误。[#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复分析器：当在针对 Distributed 表的 SELECT 查询中使用 `in` 函数且 `prefer_global_in_and_join=1` 时，应将其替换为 `globalIn`。[#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 修复了多种类型的 `SELECT` 查询，这些查询会从使用 `MongoDB` 引擎的表或 `mongodb` 表函数中读取数据：在 `WHERE` 子句中对常量值进行隐式类型转换的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`）；以及带有 `LIMIT` 和 `GROUP BY` 的查询。先前，这些查询可能会返回错误的结果。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复不同 JSON 类型之间的转换。现在通过先转换为/从 `String` 的简单类型转换来完成。这种方式效率较低，但可以确保 100% 的准确性。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在将 Dynamic 类型转换为 Interval 类型时发生的逻辑错误。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复因 JSON 解析错误导致的列回滚问题。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在使用常量别名列进行 JOIN 时出现的“bad cast”错误。[#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 不允许在物化视图中对视图与目标表数据类型不一致的列使用 prewhere。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在解析 Variant 列损坏二进制数据时的逻辑错误。[#78982](https://github.com/ClickHouse/ClickHouse/pull/78982)（[Pavel Kruglov](https://github.com/Avogar)）。
* 当将 Parquet 批处理大小设置为 0 时抛出异常。之前当 `output_format_parquet_batch_size = 0` 时，ClickHouse 会出现挂起问题。现在这一行为已被修复。[#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* 修复 compact 部分中使用 basic 格式的 variant 判别符的反序列化。该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) 中引入的。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* 类型为 `complex_key_ssd_cache` 的字典现在会拒绝 `block_size` 和 `write_buffer_size` 为 0 或负数的参数（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 避免在 SummingMergeTree 中对未聚合列使用 Field，否则可能会导致 SummingMergeTree 中使用的 Dynamic/Variant 类型出现意外错误。[#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复分析器中，从目标表为 Distributed 且表结构不同的物化视图读取数据时的问题。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了一个问题：在执行批量插入操作的表上，`arrayUnion()` 会返回多余（错误）的值。修复了 [#75057](https://github.com/ClickHouse/ClickHouse/issues/75057)。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* 修复 `OpenSSLInitializer` 中导致段错误的问题。关闭 [#79092](https://github.com/ClickHouse/ClickHouse/issues/79092)。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 始终为 S3 ListObject 设置前缀。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* 修复了一个错误：在对表执行批量插入时，`arrayUnion()` 会返回多余（不正确）的值。修复了 [#79157](https://github.com/ClickHouse/ClickHouse/issues/79157)。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* 修复过滤下推后的逻辑错误。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复在使用基于 HTTP 的端点时采用 delta-kernel 实现的 DeltaLake 表引擎的问题，并修复 NOSIGN。关闭 [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124)。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper 修复：避免在失败的 multi 请求上触发 watch。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* 在 `IN` 中禁止使用 Dynamic 和 JSON 类型。由于当前 `IN` 的实现方式，这可能会导致结果不正确。对这些类型在 `IN` 中提供完善支持较为复杂，可能会在未来实现。[#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 JSON 类型解析时对重复路径的检查。[#79317](https://github.com/ClickHouse/ClickHouse/pull/79317)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复 SecureStreamSocket 连接问题。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复对包含数据的 plain&#95;rewritable 磁盘的加载问题。[#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复在 MergeTree 的 Wide 部分进行动态子列发现时发生的崩溃。[#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar))。
* 仅在初始 CREATE 查询时校验表名长度。对于后续创建不要执行该校验，以避免破坏向后兼容性。[#79488](https://github.com/ClickHouse/ClickHouse/pull/79488)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 在多种情况下，修复了在包含稀疏列的表上出现的 `Block structure mismatch` 错误。[#79491](https://github.com/ClickHouse/ClickHouse/pull/79491)（[Anton Popov](https://github.com/CurtizJ)）。
* 修复两种会触发 `Logical Error: Can't set alias of * of Asterisk on alias` 的情况。[#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在重命名 Atomic 数据库时使用错误的路径的问题。[#79569](https://github.com/ClickHouse/ClickHouse/pull/79569)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复在 JSON 列与其他列组合使用 ORDER BY 时的问题。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在同时禁用 `use_hedged_requests` 和 `allow_experimental_parallel_reading_from_replicas` 时，从远程读取数据会出现结果重复的问题。[#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* 修复在使用 Unity Catalog 时导致 delta-kernel 实现发生崩溃的问题。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 解析自动发现集群的宏。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 对错误配置的 `page_cache_limits` 进行适当处理。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复了在可变长度格式化符（例如 `%W`，即工作日 `Monday`、`Tuesday` 等）后跟复合格式化符（一次输出多个日期时间组件的格式化符，例如 `%D`，即美国日期格式 `05/04/25`）时，SQL 函数 `formatDateTime` 的结果不正确的问题。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze)).
* IcebergS3 支持 count() 优化，但 IcebergS3Cluster 不支持。因此，在集群模式下返回的 count() 结果可能是副本数量的倍数。[#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear))。
* 修复在使用惰性物化且在应用投影之前查询执行阶段未使用任何列时出现的 `AMBIGUOUS_COLUMN_NAME` 错误。例如：`SELECT * FROM t ORDER BY rand() LIMIT 5`。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926) ([Igor Nikonov](https://github.com/devcrafter))。
* 在查询 `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` 中隐藏密码。[#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991))。
* 允许在 JOIN USING 中为列指定别名。在列被重命名时（例如由于 ARRAY JOIN），请使用该别名。修复 [#73707](https://github.com/ClickHouse/ClickHouse/issues/73707)。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复包含 UNION 的物化视图在新副本上无法正常工作的问题。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 函数 `parseDateTime` 中的格式说明符 `%e` 现在可以识别一位数的日期（例如 `3`），而之前需要在前面填充空格（例如 ` 3`）。这使其行为与 MySQL 兼容。若要保留之前的行为，请将设置 `parsedatetime_e_requires_space_padding` 设为 `1`。（问题 [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)）。[#80057](https://github.com/ClickHouse/ClickHouse/pull/80057)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复 ClickHouse 日志中出现的警告 `Cannot find 'kernel' in '[...]/memory.stat'`（问题 [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* 在 FunctionComparison 中检查栈大小，以避免栈溢出导致崩溃。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* 修复从 `system.workloads` 执行 SELECT 时的竞态条件。[#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修复：分布式查询中的惰性物化。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复 `Array(Bool)` 到 `Array(FixedString)` 的转换。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat)).
* 让 Parquet 版本选择更清晰。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复 `ReservoirSampler` 的自合并问题。[#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat))。
* 修复客户端上下文中插入表的存储逻辑。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 修复 `AggregatingSortedAlgorithm` 和 `SummingSortedAlgorithm` 的数据成员析构顺序。[#79056](https://github.com/ClickHouse/ClickHouse/pull/79056)（[Nikita Taranov](https://github.com/nickitat)）。
* `enable_user_name_access_type` 不应影响 `DEFINER` 访问类型。[#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* 如果 `system` 数据库的元数据位于 Keeper 中，对 `system` 数据库的查询可能会挂起。[#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun))。

#### 构建/测试/打包改进

* 支持复用已构建的 `chcache` 二进制文件，而不是每次都重新构建。 [#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 添加 NATS 暂停等待逻辑。 [#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 修复错误地将 ARM 构建发布为 `amd64compat` 的问题。 [#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger)).
* 为 OpenSSL 使用预生成的汇编代码。 [#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 修复以支持使用 `clang20` 进行构建。 [#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `chcache`：支持 Rust 缓存。 [#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 为 `zstd` 汇编文件添加栈展开（unwind）信息。 [#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321)).

### ClickHouse 25.4 版本，2025-04-22 {#254}

#### 向后不兼容的变更

* 当 `allow_materialized_view_with_bad_select` 为 `false` 时，检查物化视图中的所有列是否与目标表完全匹配。 [#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm)).
* 修复 `dateTrunc` 与负值 Date/DateTime 参数一起使用时的行为。 [#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 已移除旧版 `MongoDB` 集成。服务器设置项 `use_legacy_mongodb_integration` 已废弃，现已无效，不再产生任何效果。 [#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze)).
* 增强 `SummingMergeTree` 验证逻辑，以跳过对用于分区键或排序键的列进行聚合。 [#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).

#### 新功能

* 为工作负载新增了 CPU 槽位调度功能，详情请参见[文档](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* 如果指定了 `--path` 命令行参数，`clickhouse-local` 在重启后会保留其数据库。此更改修复了 [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647)。此更改修复了 [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947)。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当服务器过载时拒绝处理查询。是否拒绝的决策基于等待时间（`OSCPUWaitMicroseconds`）与繁忙时间（`OSCPUVirtualTimeMicroseconds`）的比值作出。当该比值介于 `min_os_cpu_wait_time_ratio_to_throw` 和 `max_os_cpu_wait_time_ratio_to_throw` 之间时（这些是查询级别设置），将以一定概率丢弃查询。 [#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* 在 `Iceberg` 中进行时间回溯：新增设置，可按指定时间戳查询 `Iceberg` 表。[#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner))。[#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik))。
* 用于 `Iceberg` 元数据的内存缓存，存储 manifest 文件/列表和 `metadata.json`，以加速查询。[#77156](https://github.com/ClickHouse/ClickHouse/pull/77156)（[Han Fei](https://github.com/hanfei1991)）。
* 为 Azure Blob Storage 提供对 `DeltaLake` 表引擎的支持。修复 [#68043](https://github.com/ClickHouse/ClickHouse/issues/68043)。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 为反序列化后的向量相似度索引添加了内存缓存，这应当能加快重复的近似最近邻（ANN）搜索查询。新缓存的大小由服务器设置项 `vector_similarity_index_cache_size` 和 `vector_similarity_index_cache_max_entries` 控制。此功能取代了早期版本中的 skipping index 缓存功能。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 支持 Delta Lake 的分区剪枝。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为只读 `MergeTree` 表增加对后台刷新的支持，从而可以在拥有无限数量的分布式读取节点的情况下查询可更新表（ClickHouse 原生数据湖）。[#76467](https://github.com/ClickHouse/ClickHouse/pull/76467)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 支持使用自定义磁盘来存储数据库元数据文件。目前只能在服务器全局级别进行配置。[#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 在 plain&#95;rewritable 磁盘上支持 `ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION`。 [#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva))。
* 为 `Kafka` 表引擎添加用于 `SASL` 配置和凭据的表设置。这样可以在 `CREATE TABLE` 语句中直接配置到 Kafka 和兼容 Kafka 系统的基于 SASL 的身份验证，而无需使用配置文件或命名集合。[#78810](https://github.com/ClickHouse/ClickHouse/pull/78810)（[Christoph Wurm](https://github.com/cwurm)）。
* 允许为 MergeTree 表设置 `default_compression_codec`：当 CREATE 查询未为相应列显式指定压缩编解码器时，将使用该设置。这解决了 [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005)。[#66394](https://github.com/ClickHouse/ClickHouse/pull/66394)（[gvoelfin](https://github.com/gvoelfin)）。
* 在 clusters 配置中添加 `bind_host` 设置，使 ClickHouse 能在分布式连接中使用特定网络。[#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum))。
* 在 `system.tables` 中新增一列 `parametrized_view_parameters`。修复 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756)。[#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* 允许修改数据库注释。Closes [#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) ### 面向用户的变更文档条目。[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622) ([NamNguyenHoai](https://github.com/NamHoaiNguyen))。
* 在 PostgreSQL 兼容协议中支持 `SCRAM-SHA-256` 身份验证。[#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12))。
* 新增函数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted` 和 `arraySimilarity`。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 设置 `parallel_distributed_insert_select` 现在也会对向 `ReplicatedMergeTree` 执行的 `INSERT SELECT` 生效（之前则需要通过 Distributed 表实现）。[#78041](https://github.com/ClickHouse/ClickHouse/pull/78041)（[Igor Nikonov](https://github.com/devcrafter)）。
* 引入 `toInterval` 函数。该函数接受 2 个参数（值和单位），并将该值转换为指定的 `Interval` 类型。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* 在 iceberg 表函数和引擎中新增多种便捷方式，用于定位根 `metadata.json` 文件。修复 [#78455](https://github.com/ClickHouse/ClickHouse/issues/78455)。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* 在 ClickHouse 的 SSH 协议中支持基于密码的身份验证。[#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。

#### 实验性特性

* 支持在 `WHERE` 子句中将关联子查询用作 `EXISTS` 表达式的参数。关闭 [#72459](https://github.com/ClickHouse/ClickHouse/issues/72459)。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 新增 `sparseGrams` 和 `sparseGramsHashes` 函数的 ASCII 和 UTF-8 版本。作者：[scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。请不要使用：其实现将在后续版本中发生变化。

#### 性能优化

* 通过使用惰性列来优化性能，使数据在执行 ORDER BY 和 LIMIT 之后才被读取。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* 默认启用查询条件缓存。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 通过对 `col->insertFrom()` 调用进行去虚拟化，加速构建 JOIN 结果集。[#77350](https://github.com/ClickHouse/ClickHouse/pull/77350)（[Alexander Gololobov](https://github.com/davenger)）。
* 在可能的情况下，将查询计划中过滤步骤中的等值条件合并到 JOIN 条件中，从而可以将其用作哈希表键。[#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd))。
* 当 JOIN 键在两侧都为主键（PK）的前缀时，对 JOIN 使用动态分片。该优化可通过 `query_plan_join_shard_by_pk_ranges` 设置启用（默认禁用）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 支持基于列的上下边界值进行 `Iceberg` 数据剪枝。修复 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638)。[#78242](https://github.com/ClickHouse/ClickHouse/pull/78242)（[alesapin](https://github.com/alesapin)）。
* 为 `Iceberg` 实现了基础的 `count()` 优化。现在带有 `count()` 且没有任何过滤条件的查询应该会更快。关闭了 [#77639](https://github.com/ClickHouse/ClickHouse/issues/77639)。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* 添加了通过 `max_merge_delayed_streams_for_parallel_write` 配置合并操作中可并行刷写列数的能力（这应当可以将写入 S3 的纵向合并的内存使用量降低约 25 倍）。 [#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat)).
* 在缓存以被动方式使用时（例如用于合并操作），禁用 `filesystem_cache_prefer_bigger_buffer_size`。这可以降低合并时的内存消耗。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 现在我们使用副本数量来确定在启用并行副本读取时的读取任务大小。这样在待读取数据量不太大的情况下，可以在副本之间实现更好的工作分配。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat)).
* 为 `ORC` 格式增加异步 IO 预取支持，通过隐藏远程 IO 延迟来提升整体性能。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 预先为异步插入分配内存以提升性能。[#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn))。
* 通过在可以使用 `multiRead` 的地方避免使用单个 `get` 请求，来减少对 Keeper 的请求数量；在副本数量增加的情况下，这些单个 `get` 请求可能会给 Keeper 带来显著负载。[#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* 对在 Nullable 参数上运行的函数进行了小幅优化。 [#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* 优化 `arraySort`。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 将同一部分的标记合并，一次性写入查询条件缓存，以减少锁开销。[#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai))。
* 为仅包含一次括号展开的查询优化 `s3Cluster` 的性能。[#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis))。
* 优化对单个 Nullable 或 LowCardinality 列的 ORDER BY。[#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li))。
* 优化 `Native` 格式的内存使用。[#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat))。
* 小幅优化：如果需要进行类型转换，则不要将 `count(if(...))` 重写为 `countIf`。关闭 [#78564](https://github.com/ClickHouse/ClickHouse/issues/78564)。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 函数现在可以利用 `tokenbf_v1`、`ngrambf_v1` 这类全文跳过索引。[#77662](https://github.com/ClickHouse/ClickHouse/pull/77662)（[UnamedRus](https://github.com/UnamedRus)）。
* 向量相似度索引可能会导致主内存分配过多，最多达到实际需求的 2 倍。本次修复重新设计了内存分配策略，降低了内存消耗，并提升了向量相似度索引缓存的有效性。（issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 为 `system.metric_log` 表引入一个用于指定表结构类型的设置 `schema_type`。允许的表结构有三种：`wide` —— 当前使用的结构，每个指标/事件（metric/event）位于单独的列中（对读取单列最为高效）；`transposed` —— 类似于 `system.asynchronous_metric_log`，指标/事件按行存储；以及最有意思的 `transposed_with_wide_view` —— 底层表使用 `transposed` 结构创建，同时再引入一个 `wide` 结构的视图，用于将针对视图的查询转换到底层表。在 `transposed_with_wide_view` 中，不支持视图的子秒级时间精度，`event_time_microseconds` 只是为了向后兼容而保留的别名。[#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin))。

#### 改进

* 对 `Distributed` 查询的查询计划进行序列化。新增设置项 `serialize_query_plan`。启用后，来自 `Distributed` 表的查询在远程执行时将使用序列化的查询计划。这会在 TCP 协议中引入一个新的数据包类型，需要在服务器配置中添加 `<process_query_plan_packet>true</process_query_plan_packet>`，以允许处理该数据包。[#69652](https://github.com/ClickHouse/ClickHouse/pull/69652)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 支持从视图中读取 `JSON` 类型及其子列。[#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar)).
* 支持在集群上使用 `ALTER DATABASE ... ON CLUSTER`。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 可刷新的物化视图的刷新操作现在会记录在 `system.query_log` 中。[#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321)).
* 现在可以通过在其配置中使用一个新的设置，将用户自定义函数（UDF）标记为确定性的。此外，查询缓存现在会检查查询中调用的 UDF 是否为确定性的；如果是，则会缓存该查询的结果。（Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)）。[#77769](https://github.com/ClickHouse/ClickHouse/pull/77769)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 为所有类型的复制任务启用了退避逻辑，这样可以降低 CPU 使用率、内存使用率以及日志文件大小。新增了与 `max_postpone_time_for_failed_mutations_ms` 类似的设置：`max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms` 和 `max_postpone_time_for_failed_replicated_tasks_ms`。[#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 将 `query_id` 添加到 `system.errors`。解决 [#75815](https://github.com/ClickHouse/ClickHouse/issues/75815)。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* 新增支持将 `UInt128` 转换为 `IPv6`。这使得可以对 `IPv6` 执行 `bitAnd` 运算和算术操作，并将结果转换回 `IPv6`。解决了 [#76752](https://github.com/ClickHouse/ClickHouse/issues/76752)。同样也可以将对 `IPv6` 执行 `bitAnd` 运算得到的结果再转换回 `IPv6`。另见 [#57707](https://github.com/ClickHouse/ClickHouse/pull/57707)。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* 默认情况下，不在 `Variant` 类型的文本格式中解析特殊的 `Bool` 值。可以通过设置 `allow_special_bool_values_inside_variant` 来启用此行为。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* 在会话级和服务器级支持为低 `priority` 查询按任务配置等待时间。[#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* 为 JSON 数据类型的值实现了比较功能。现在可以像比较 Map 一样比较 JSON 对象。[#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar))。
* 通过 `system.kafka_consumers` 改进了权限支持。转发内部的 `librdkafka` 错误（顺带一提，这个库本身相当糟糕）。[#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* 为 Buffer 表引擎的设置增加了验证。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 添加配置项 `enable_hdfs_pread`，用于在 `HDFS` 中启用或禁用 `pread`。[#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou))。
* 增加用于统计 ZooKeeper `multi` 读写请求数量的 profile events。[#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* 在开启 `disable_insertion_and_mutation` 时，仍允许创建临时表并向其中插入数据。[#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* 将 `max_insert_delayed_streams_for_parallel_write` 降为 100。[#77919](https://github.com/ClickHouse/ClickHouse/pull/77919)（[Azat Khuzhin](https://github.com/azat)）。
* 修复 Joda 语法中的年份解析（如果你在好奇，这是来自 Java 生态），例如 `yyy`。[#77973](https://github.com/ClickHouse/ClickHouse/pull/77973)（[李扬](https://github.com/taiyang-li)）。
* 对 `MergeTree` 表的数据片段进行附加时，将按照其块顺序执行，这对 `ReplacingMergeTree` 等特殊合并算法非常重要。此更改从而关闭了 [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009)。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 查询脱敏规则现在可以在发生匹配时抛出 `LOGICAL_ERROR`。这有助于检查预定义密码是否在日志中的任意位置泄露。[#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 在 `information_schema.tables` 中添加了列 `index_length_column`，以提高与 MySQL 的兼容性。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 引入两个新指标：`TotalMergeFailures` 和 `NonAbortedMergeFailures`。这些指标用于检测在短时间内发生过多合并失败的情况。[#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 修复在 path-style 模式下未指定 key 时对 S3 URL 的错误解析。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos)).
* 修正异步指标 `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime` 和 `BlockReadTime` 的数值错误（在此更改之前，1 秒被错误地上报为 0.001）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov)).
* 在向 StorageS3(Azure)Queue 的物化视图推送数据时，对发生的错误现在会遵循 `loading_retries` 限制。此前，这类错误会被无限次重试。[#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 在 DeltaLake 的 `delta-kernel-rs` 实现中，修复了性能和进度条。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 为运行时磁盘新增对 `include`、`from_env`、`from_zk` 的支持。关闭 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177)。[#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 `system.warnings` 表中为长时间运行的 mutation 添加动态警告。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc)).
* 向系统表 `system.query_condition_cache` 新增字段 `condition`。该字段存储条件的明文形式，其哈希值用作查询条件缓存中的键。[#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze))。
* 允许 Hive 分区键为空值。[#78816](https://github.com/ClickHouse/ClickHouse/pull/78816)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复 `BFloat16` 在 `IN` 子句中的类型转换问题（例如，`SELECT toBFloat16(1) IN [1, 2, 3];` 现在返回 `1`）。修复了 [#78754](https://github.com/ClickHouse/ClickHouse/issues/78754)。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 如果设置了 `disk = ...`，则不要检查位于其他磁盘上的 `MergeTree` 数据片段。[#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* 使 `system.query_log` 中 `used_data_type_families` 的数据类型以规范名称形式记录。[#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` 期间的清理设置与此前在 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) 中的处理方式相同。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 在 INFILE 的 schema 推断中使用插入列。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).

#### Bug 修复（在官方稳定版本中对用户可见的问题）

* 修复在聚合投影中使用 `count(Nullable)` 时的错误投影分析，修复了 [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495)。此 PR 还在投影分析相关位置增加了一些日志，用于澄清为什么会使用某个投影或不使用某个投影。[#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* 修复在执行 `DETACH PART` 操作时可能出现的 `Part &lt;...&gt; does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` 错误。[#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk))。
* 修复在 analyzer 中使用包含字面量表达式时无法正常工作的 skip index，并在索引分析过程中移除多余的类型转换。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了一个问题：`close_session` 查询参数不起作用，导致命名会话只有在 `session_timeout` 之后才会被关闭。[#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats))。
* 修复了在未附加物化视图的情况下从 NATS 服务器接收消息的问题。[#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 修复通过 `merge` 表函数从空 `FileLog` 读取时的逻辑错误，关闭 [#75575](https://github.com/ClickHouse/ClickHouse/issues/75575)。[#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 在共享 variant 的 `Dynamic` 序列化中使用默认格式设置。[#77572](https://github.com/ClickHouse/ClickHouse/pull/77572)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在本地磁盘上检查表数据路径是否存在的逻辑。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 修复某些类型在向远程端发送常量值时的问题。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复由于 S3/AzureQueue 中上下文过期而导致的崩溃。[#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 在 RabbitMQ、NATS、Redis、AzureQueue 表引擎中隐藏凭据。[#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在 `argMin`/`argMax` 中比较 `NaN` 时的未定义行为。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* 即使在操作不会产生任何需要写入的数据块时，也要定期检查合并和变更（merges 和 mutations）是否被取消。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复：在 Replicated 数据库中，可刷新物化视图在新添加的副本上不起作用的问题。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在出现 `NOT_FOUND_COLUMN_IN_BLOCK` 错误时可能导致的崩溃。[#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 修复在 S3/AzureQueue 中填充数据时发生的崩溃问题。[#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* 在 SSH 服务器中禁用历史记录的模糊搜索（因为它需要 skim 库）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* 修复了一个 bug：当对未建立索引的向量列执行向量搜索查询时，如果表中存在另一列已定义向量相似度索引的向量列，则会返回不正确的结果。（Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978)）。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 修复提示 &quot;The requested output format {} is binary... Do you want to output it anyway? [y/N]&quot; 中的一个细微错误。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 `toStartOfInterval` 中使用零起点参数时的错误。[#78096](https://github.com/ClickHouse/ClickHouse/pull/78096)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 禁止通过 HTTP 接口传递空的 `session_id` 查询参数。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats))。
* 修复在 `Replicated` 数据库中可能发生的元数据被覆盖问题，该问题出现在在执行 `ALTER` 查询后紧接着执行 `RENAME` 查询的情况下。[#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复 `NATS` 引擎中的崩溃问题。[#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 不要在用于 SSH 的嵌入式客户端中尝试创建 history&#95;file 文件（在之前的版本中虽然会尝试创建，但始终失败）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* 修复在执行 `RENAME DATABASE` 或 `DROP TABLE` 查询后，`system.detached_tables` 显示不正确信息的问题。[#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique))。
* 修复了在使用 `Replicated` 数据库时对过多表进行检查的问题，该问题出现在 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) 之后。同时，将检查提前到创建存储之前执行，以避免在 `ReplicatedMergeTree` 或 `KeeperMap` 的情况下在 Keeper 中创建未被记录的节点。[#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 修复并发初始化 `S3Queue` 元数据时可能发生的崩溃。[#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat))。
* `groupArray*` 函数现在在 `max_size` 参数为 Int 类型且值为 0 时会产生 `BAD_ARGUMENTS` 错误，与之前对 UInt 类型的处理保持一致，而不是在该值下继续尝试执行。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* 防止在恢复丢失副本时，如果本地表在分离之前已被移除而导致崩溃。[#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano))。
* 修复了 `system.s3_queue_settings` 中 `alterable` 列始终返回 `false` 的问题。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 隐藏 Azure 访问签名，使其对用户不可见且不会在日志中显示。[#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复 Wide 部分中带前缀子流的预取。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在键数组类型为 `LowCardinality(Nullable)` 时，`mapFromArrays` 崩溃或返回错误结果的问题。[#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa))。
* 修复 delta-kernel-rs 认证选项。 [#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 如果副本的 `disable_insertion_and_mutation` 为 true，则不再调度可刷新物化视图的任务。该任务本质上是一次插入操作，如果 `disable_insertion_and_mutation` 为 true，则会失败。[#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* 验证对 `Merge` 引擎底层表的访问权限。[#78339](https://github.com/ClickHouse/ClickHouse/pull/78339)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 在查询 `Distributed` 表时可以忽略 `FINAL` 修饰符。[#78428](https://github.com/ClickHouse/ClickHouse/pull/78428)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 当 bitmap 为空时，`bitmapMin` 返回 uint32&#95;max（当输入类型更大时返回 uint64&#95;max），这与空 roaring&#95;bitmap 的最小值行为一致。[#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* 在启用 `distributed_aggregation_memory_efficient` 时，禁用在读取 FROM 之后立即对查询进行并行处理，以避免可能出现的逻辑错误。修复了 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934)。[#78500](https://github.com/ClickHouse/ClickHouse/pull/78500) ([flynn](https://github.com/ucasfl))。
* 在应用 `max_streams_to_max_threads_ratio` 设置后，如果计划的流数为零，则至少保留一个用于读取的流。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* 在存储 `S3Queue` 中修复逻辑错误 “Cannot unregister: table uuid is not registered”。关闭 [#78285](https://github.com/ClickHouse/ClickHouse/issues/78285)。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ClickHouse 现在可以在同时启用了 cgroups v1 和 v2 的系统上正确识别自身的 cgroup v2。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev))。
* 在使用表级设置时，`-Cluster` 表函数执行失败。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik)).
* 在不支持事务的 `ReplicatedMergeTree` 上执行 `INSERT` 时，增加了更完善的检查。[#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* 在执行 ATTACH 操作时清理查询相关设置。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* 修复在 `iceberg_metadata_file_path` 中指定无效路径时引发的崩溃。[#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* 在使用基于 delta-kernel-s 实现的 `DeltaLake` 表引擎时，修复了当读取 schema 与表的 schema 不一致且同时存在分区列时，会导致的“未找到列”错误。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了一个问题：在计划关闭一个具名会话之后（但尚未达到超时时间之前），如果创建了一个同名的新具名会话，该新会话会在原先第一个会话计划关闭的时间点被错误关闭。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* 修复了多种 `SELECT` 查询类型，这些查询会从使用 `MongoDB` 引擎或 `mongodb` 表函数的表中读取数据：在 `WHERE` 子句中隐式转换常量值的查询（例如 `WHERE datetime = '2025-03-10 00:00:00'`）；带有 `LIMIT` 和 `GROUP BY` 的查询。此前，这些查询可能会返回错误的结果。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* 运行 `CHECK TABLE` 时不再阻塞表的关闭。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper 修复：在所有情况下修正 ephemeral 计数。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在使用除 `view` 之外的表函数时，`StorageDistributed` 中的错误类型转换。修复 [#78464](https://github.com/ClickHouse/ClickHouse/issues/78464)。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 统一 `tupleElement(*, 1)` 的格式。修复 [#78639](https://github.com/ClickHouse/ClickHouse/issues/78639)。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 类型为 `ssd_cache` 的字典现在会拒绝 `block_size` 和 `write_buffer_size` 为零或负数的参数值（问题 [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 修复在异常关闭后对 Refreshable 物化视图执行 ALTER 时发生的崩溃问题。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `CSV` 格式中对无效 `DateTime` 值的解析问题。 [#78919](https://github.com/ClickHouse/ClickHouse/pull/78919) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper 修复：避免在 multi 请求失败时触发 watch。[#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复在显式指定的 min-max 值为 `NULL` 时读取 Iceberg 表失败的问题。已发现 Go Iceberg 库会生成这种有问题的文件。关闭 [#78740](https://github.com/ClickHouse/ClickHouse/issues/78740)。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。

#### 构建/测试/打包改进

* 在 Rust 中遵循 CPU 目标特性，并在所有 crate 中启用 LTO。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 25.3 LTS 发行版，2025-03-20 {#253}

#### 向后不兼容的变更

* 禁止对复制数据库执行 TRUNCATE 操作。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc))。
* 回滚此前跳过索引缓存的更改。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。

#### 新功能

* `JSON` 数据类型已可用于生产环境，详见 [https://jsonbench.com/](https://jsonbench.com/)。`Dynamic` 和 `Variant` 数据类型也已可用于生产环境。[#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 clickhouse-server 引入 SSH 协议支持。现在可以使用任意 SSH 客户端连接到 ClickHouse。已关闭以下问题：[#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 当启用并行副本时，将表函数替换为其对应的 -Cluster 版本。修复了 [#65024](https://github.com/ClickHouse/ClickHouse/issues/65024)。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache 的新实现，它允许在进程内存中缓存数据，而无需依赖操作系统的页面缓存；当数据存储在没有本地文件系统缓存支持的远程虚拟文件系统上时，这非常有用。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 新增了 `concurrent_threads_scheduler` 服务器设置，用于控制并发查询之间 CPU 时隙的分配方式。可以设置为 `round_robin`（之前的行为）或 `fair_round_robin`，以解决 INSERT 和 SELECT 之间 CPU 分配不公平的问题。[#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* 新增 `estimateCompressionRatio` 聚合函数 [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。 [#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 新增函数 `arraySymmetricDifference`。该函数返回多个数组参数中未在所有参数中同时出现的所有元素。示例：`SELECT arraySymmetricDifference([1, 2], [2, 3])` 返回 `[1, 3]`。（issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673)）。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* 通过在存储/表函数中设置 `iceberg_metadata_file_path`，可以显式指定要读取的 Iceberg 元数据文件。修复 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412)。[#77318](https://github.com/ClickHouse/ClickHouse/pull/77318)（[alesapin](https://github.com/alesapin)）。
* 新增了 `keccak256` 哈希函数，在区块链实现中被广泛使用，尤其是在基于 EVM 的系统中。[#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche))。
* 新增三个函数：`icebergTruncate`（按照规范实现，[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details)）、`toYearNumSinceEpoch` 和 `toMonthNumSinceEpoch`。在 `Iceberg` 引擎的分区裁剪中支持 `truncate` 转换。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403) ([alesapin](https://github.com/alesapin))。
* 支持 `LowCardinality(Decimal)` 数据类型 [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833) ([zhanglistar](https://github.com/zhanglistar))。
* `FilterTransformPassedRows` 和 `FilterTransformPassedBytes` 性能分析事件将显示在查询执行过程中被过滤的行数和字节数。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar))。
* 支持直方图指标类型。该接口与 Prometheus 客户端的接口设计非常相似，你只需调用 `observe(value)`，即可将与该值对应的桶中的计数器加一。直方图指标通过 `system.histogram_metrics` 对外暴露。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 支持在 CASE 表达式中使用非常量显式值进行分支选择。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).

#### 实验特性

* 为基于 AWS S3 和本地文件系统的 Delta Lake 表添加对 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 的支持。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988) ([alesapin](https://github.com/alesapin))。
* 引入与 AWS Glue 服务目录的实验性集成，用于 Iceberg 表。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257) ([alesapin](https://github.com/alesapin))。
* 增加对动态集群自动发现的支持，扩展现有的 _node_ 自动发现功能。ClickHouse 现在可以使用 `<multicluster_root_path>` 在统一的 ZooKeeper 路径下自动检测并注册新的 _clusters_。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 通过新的设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`，允许在可配置的超时时间后自动对整个分区执行清理合并操作。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440) ([Christoph Wurm](https://github.com/cwurm))。

#### 性能改进

* 实现查询条件缓存，以提升重复条件场景下的查询性能。不满足条件的数据区间会被记录为内存中的临时索引，后续查询将复用该索引。关闭 [#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 在数据分片被移除时主动从缓存中驱逐对应数据。如果数据量较少，不要让缓存膨胀到最大容量。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在算术计算中使用 clang 内建的 i256 替代 Int256 和 UInt256，从而带来性能提升 [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。[#73658](https://github.com/ClickHouse/ClickHouse/pull/73658)（[李扬](https://github.com/taiyang-li)）。
* 在某些情况下（例如空数组列），数据分片中可能包含空文件。当表位于元数据与对象存储分离的磁盘上时，可以跳过向 ObjectStorage 写入空的 blob，只为此类文件保存元数据。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860)（[Alexander Gololobov](https://github.com/davenger)）。
* 提升 Decimal32/Decimal64/DateTime64 的 min/max 运算性能。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570)（[李扬](https://github.com/taiyang-li)）。
* 查询编译（设置 `compile_expressions`）现在会考虑机器类型。这显著加快了此类查询。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753)（[ZhangLiStar](https://github.com/zhanglistar)）。
* 优化 `arraySort`。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850)（[李扬](https://github.com/taiyang-li)）。
* 当缓存以被动方式使用时（例如用于合并），禁用 `filesystem_cache_prefer_bigger_buffer_size`。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在代码的部分位置应用 `preserve_most` 属性，从而获得略优的代码生成效果。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778)（[Nikita Taranov](https://github.com/nickitat)）。
* 加快 ClickHouse 服务器关闭速度（去除 2.5 秒延迟）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550)（[Azat Khuzhin](https://github.com/azat)）。
* 避免在 ReadBufferFromS3 和其他远程读取缓冲区中进行多余的内存分配，将其内存占用减少一半。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692)（[Sema Checherinda](https://github.com/CheSema)）。
* 将 zstd 从 1.5.5 升级到 1.5.7，这可能会带来一些[性能改进](https://github.com/facebook/zstd/releases/tag/v1.5.7)。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* 降低在 Wide 数据部分中预取 JSON 列时的内存使用。当 ClickHouse 部署在共享存储之上（例如在 ClickHouse Cloud 中）时，这一点尤为重要。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640)（[Pavel Kruglov](https://github.com/Avogar)）。

#### 改进

* 在将 `TRUNCATE` 与 `INTO OUTFILE` 一起使用时支持原子重命名。修复 [#70323](https://github.com/ClickHouse/ClickHouse/issues/70323)。 [#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 现在已经无法在设置中将 `NaN` 或 `inf` 用作浮点数值。之前允许这么做其实也没有什么意义。 [#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 当 analyzer 被禁用时，将默认禁用并行副本，而不考虑 `compatibility` 设置。仍然可以通过显式将 `parallel_replicas_only_with_analyzer` 设为 `false` 来更改此行为。[#77115](https://github.com/ClickHouse/ClickHouse/pull/77115)（[Igor Nikonov](https://github.com/devcrafter)）。
* 新增支持定义一个要转发的 header 列表，用于将客户端请求中的这些 header 转发给外部 HTTP 认证器。[#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004))。
* 在 tuple 列中对字段匹配时，遵循列名大小写不敏感的匹配规则。修复 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324)。[#73780](https://github.com/ClickHouse/ClickHouse/pull/73780)（[李扬](https://github.com/taiyang-li)）。
* Gorilla 编解码器的参数现在将始终保存在 .sql 文件中的表元数据中。已修复：[#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 为特定数据湖实现了解析能力增强（Sequence ID 解析：新增了对 manifest 文件中序列标识符的解析功能；Avro 元数据解析：重新设计了 Avro 元数据解析器，使其便于未来扩展和增强）。[#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik)).
* 从 `system.opentelemetry_span_log` 的默认 ORDER BY 中删除 trace&#95;id。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 现在可以将加密（属性 `encrypted_by`）应用于任何配置文件（config.xml、users.xml、嵌套配置文件）。此前，它仅适用于顶级 config.xml 配置文件。[#75911](https://github.com/ClickHouse/ClickHouse/pull/75911)（[Mikhail Gorshkov](https://github.com/mgorshkov)）。
* 改进 `system.warnings` 表，并添加一些可添加、更新或删除的动态告警消息。[#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc))。
* 此 PR 不再允许运行查询 `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES`，因为所有 `DROP` 操作都必须在语句中排在最前面。[#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit)).
* 针对 SYNC REPLICA 进行多项增强（更清晰的错误信息、更完善的测试、合理性检查）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* 在备份到 S3 时，如果分段复制因 Access Denied 而失败，使用正确的回退策略。当在具有不同凭证的 bucket 之间执行备份时，多部分复制可能会产生 Access Denied 错误。[#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368))。
* 将 librdkafka（这堆不太好用的东西）升级到 2.8.0 版本（升级后也并没有好到哪去），并改进了 Kafka 表的关闭流程，从而减少在删除表和重启服务器时的延迟。`engine=Kafka` 在表被删除时不再显式地退出 consumer group。相反，consumer 会继续留在 group 中，直到在空闲超过 `session_timeout_ms`（默认：45 秒）后被自动移除。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* 修复 S3 请求设置的验证。[#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar))。
* 像 `server_settings` 或 `settings` 这样的系统表包含一个 `default` 值列，这非常方便。现在也在 `merge_tree_settings` 和 `replicated_merge_tree_settings` 中添加了该列。[#76942](https://github.com/ClickHouse/ClickHouse/pull/76942)（[Diego Nieto](https://github.com/lesandie)）。
* 新增了 `ProfileEvents::QueryPreempted`，其逻辑与 `CurrentMetrics::QueryPreempted` 类似。[#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu))。
* 之前，Replicated 数据库可能会将查询中指定的凭证打印到日志中。该问题已修复，相关 issue 已关闭：[#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 允许对 `plain_rewritable` 磁盘执行 ALTER TABLE DROP PARTITION。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* 备份/恢复设置 `allow_s3_native_copy` 现在支持三个取值：- `False` - 不使用 S3 原生拷贝；- `True`（旧默认值）- ClickHouse 将首先尝试使用 S3 原生拷贝，如果失败则回退到读写方式；- `'auto'`（新默认值）- ClickHouse 将首先比较源端和目标端的凭证。如果相同，ClickHouse 将尝试使用 S3 原生拷贝，然后可能回退到读写方式。如果不同，ClickHouse 将直接使用读写方式。[#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* 在 DeltaLake 表引擎的 delta kernel 中增加对 AWS 会话令牌和环境变量凭证的支持。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).

#### 缺陷修复（在官方稳定版中对用户可见的异常行为）

* 修复在处理异步分布式 INSERT 的待处理批次时会卡住的问题（例如由于 `No such file or directory`）。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* 通过在索引分析期间对隐式的 Date 到 DateTime 转换强制采用饱和策略，改进了日期时间转换。这解决了由于日期时间范围限制而可能导致的索引分析不准确问题。修复了 [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307)。同时还修复了在 `date_time_overflow_behavior = 'ignore'`（默认值）时显式调用 `toDateTime` 的转换行为。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* 修复各种由于 UUID 与表名之间竞态条件导致的错误（例如，它将修复 `RENAME` 与 `RESTART REPLICA` 之间的竞态问题；在并发执行 `RENAME` 与 `SYSTEM RESTART REPLICA` 的情况下，可能最终会重启错误的副本，和/或使其中一个表停留在 `Table X is being restarted` 状态）。 [#76308](https://github.com/ClickHouse/ClickHouse/pull/76308) ([Azat Khuzhin](https://github.com/azat)).
* 修复在启用 async insert 并执行 insert into ... from file ... 且块大小不一致时的数据丢失问题：当第一个块大小 &lt; async&#95;max&#95;size 而第二个块 &gt; async&#95;max&#95;size 时，第二个块不会被插入，其数据会滞留在 `squashing` 中。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* 将 `system.data_skipping_indices` 中的字段 &#39;marks&#39; 重命名为 &#39;marks&#95;bytes&#39;。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze))。
* 修复动态文件系统缓存调整大小时在淘汰过程中处理意外错误的问题。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复了并行哈希中 `used_flag` 的初始化问题，这可能会导致服务器崩溃。[#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat)).
* 修复在投影中调用 `defaultProfiles` 函数时的逻辑错误。[#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit))。
* 在 Web UI 中不再在浏览器中请求交互式基本身份验证。修复了 [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319)。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复从分布式表中查询布尔字面量时抛出的 THERE&#95;IS&#95;NO&#95;COLUMN 异常。[#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 现在以更合理的方式确定表目录中的子路径。[#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik))。
* 修复在对主键中包含子列的表执行 `ALTER` 后出现的错误 `Not found column in block`。在 [https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 之后，还需要 [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403)。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 为 null 短路添加性能测试并修复相关错误。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li)).
* 在对输出写缓冲区进行最终处理之前先刷新它们。修复在某些输出格式最终处理阶段生成的 `LOGICAL_ERROR`，例如 `JSONEachRowWithProgressRowOutputFormat`。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* 增加了对 MongoDB 二进制 UUID 的支持（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)）——修复了在使用表函数时对 MongoDB 的 WHERE 条件下推（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)）——修改了 MongoDB - ClickHouse 类型映射，使 MongoDB 的二进制 UUID 只能被解析为 ClickHouse 的 UUID，从而避免今后的歧义和意外情况。——修复了 OID 映射，同时保留向后兼容性。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* 修复 JSON 子列并行前缀反序列化过程中的异常处理。[#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复 `lgamma` 函数针对负整数的行为。[#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 修复对显式定义主键的反向键分析。类似于 [#76654](https://github.com/ClickHouse/ClickHouse/issues/76654)。[#76846](https://github.com/ClickHouse/ClickHouse/pull/76846)（[Amos Bird](https://github.com/amosbird)）。
* 修复 JSON 格式中 Bool 布尔值的格式化输出。[#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在异步插入出错时，由于对 JSON 列回滚处理不当而可能导致的崩溃。[#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 之前，`multiIf` 在计划阶段和主执行阶段可能返回不同类型的列。这会导致代码在 C++ 层面上产生未定义行为。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复了 MergeTree 中常量 Nullable 键的错误序列化。这修复了 [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939)。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* 修复 `BFloat16` 值的排序问题。已关闭 [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487)。已关闭 [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669)。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 通过在 part 一致性检查中添加跳过临时子列的检查，修复了 JSON 中包含 Variant 子列时的错误。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 修复在 `Values` 格式中解析模板时，由类型不匹配导致的崩溃。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 不再允许创建主键中包含子列的 EmbeddedRocksDB 表。此前可以创建这样的表，但 `SELECT` 查询会失败。[#77074](https://github.com/ClickHouse/ClickHouse/pull/77074)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复分布式查询中的非法比较问题，因为在将谓词下推到远程端时未正确考虑字面量类型。[#77093](https://github.com/ClickHouse/ClickHouse/pull/77093)（[Duc Canh Le](https://github.com/canhld94)）。
* 修复在创建 Kafka 表时由于异常导致的崩溃问题。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar)).
* 为 Kafka 和 RabbitMQ 引擎增加对 JSON 和子列的支持。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 macOS 上的异常栈展开逻辑。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* 修复 getSubcolumn 函数中读取 `null` 子列时的问题。[#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在与 `Array` 类型和不受支持函数一起使用时的 Bloom 过滤器索引问题。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar))。
* 我们应当仅在初始 CREATE 查询时检查表数量限制。[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique))。
* 并非 Bug：`SELECT toBFloat16(-0.0) == toBFloat16(0.0)` 现在会正确返回 `true`（此前为 `false`）。这使其行为与 `Float32` 和 `Float64` 保持一致。[#77290](https://github.com/ClickHouse/ClickHouse/pull/77290)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 修复对未初始化的 `key_index` 变量可能出现的不正确引用，该问题可能会在调试构建中导致崩溃（在发布构建中，这个未初始化引用不会造成问题，因为后续代码很可能会抛出错误）。### 面向用户可见变更的文档条目。[#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear))。
* 修复 Bool 类型分区名称的问题。该问题是在 [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) 中引入的。 [#77319](https://github.com/ClickHouse/ClickHouse/pull/77319) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复包含可为空元素的 Tuple 与字符串之间的比较问题。举例来说，在此变更之前，Tuple `(1, null)` 与 String `'(1,null)'` 之间的比较会导致错误。另一个示例是比较 Tuple `(1, a)`（其中 `a` 是 Nullable 列）和 String `'(1, 2)'`。此变更解决了这些问题。[#77323](https://github.com/ClickHouse/ClickHouse/pull/77323)（[Alexey Katsman](https://github.com/alexkats)）。
* 修复 `ObjectStorageQueueSource` 中的崩溃问题。该问题是由 [https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) 引入的。[#77325](https://github.com/ClickHouse/ClickHouse/pull/77325)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复与 `input` 一起使用时的 `async_insert`。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修复：当排序列被规划器移除时，`WITH FILL` 可能会因 NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK 而失败。修复了一个类似的问题，该问题与对 INTERPOLATE 表达式计算出的 DAG 不一致有关。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复了在为无效 AST 节点设置别名时出现的多个 LOGICAL&#95;ERROR。[#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano))。
* 在 filesystem cache 的实现中修复了文件段写入过程中的错误处理。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 使 DatabaseIceberg 使用目录提供的正确元数据文件。修复 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187)。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 查询缓存现在假定 UDF 为非确定性函数。因此，包含 UDF 的查询结果将不再被缓存。此前，用户可以定义非确定性的 UDF，其结果会被错误地缓存（问题 [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* 修复 `system.filesystem_cache_log` 仅在设置 `enable_filesystem_cache_log` 时才生效的问题。[#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在投影中调用 `defaultRoles` 函数时的逻辑错误。作为对 [#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) 的后续修复。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 现在不再允许将类型为 `Nullable` 的值作为函数 `arrayResize` 的第二个参数。此前，当第二个参数为 `Nullable` 时，可能会出现从报错到结果错误在内的各种问题。（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 即使在操作不会产生任何要写入的数据块时，也要定期检查合并和变更是否被取消。[#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).

#### 构建/测试/打包改进

* 将 `clickhouse-odbc-bridge` 和 `clickhouse-library-bridge` 移动到独立的代码仓库：https://github.com/ClickHouse/odbc-bridge/。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 修复 Rust 交叉编译问题，并允许完全禁用 Rust。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse 25.2 版本发布，2025-02-27 {#252}

#### 向后不兼容的变更

* 默认完全启用 `async_load_databases`（即使对于那些没有升级 `config.xml` 的安装）。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772)（[Azat Khuzhin](https://github.com/azat)）。
* 新增 `JSONCompactEachRowWithProgress` 和 `JSONCompactStringsEachRowWithProgress` 格式，为 [#69989](https://github.com/ClickHouse/ClickHouse/issues/69989) 的延续。`JSONCompactWithNames` 和 `JSONCompactWithNamesAndTypes` 不再输出 "totals" —— 显然这是实现中的一个错误。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `format_alter_operations_with_parentheses` 的默认值改为 true，以消除 ALTER 命令列表的歧义（见 https://github.com/ClickHouse/ClickHouse/pull/59532）。这会导致与 24.3 之前版本集群的复制失败。如果你正在升级使用旧版本的集群，请在服务器配置中关闭该设置，或者先升级到 24.3。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302)（[Raúl Marín](https://github.com/Algunenano)）。
* 移除使用正则表达式过滤日志消息的功能。该实现引入了数据竞争，因此必须移除。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 设置 `min_chunk_bytes_for_parallel_parsing` 不再允许为零。修复了：[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 校验缓存配置中的设置。此前，配置中不存在的设置项会被忽略；现在会抛出错误，需要将其移除。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452)（[Kseniia Sumarokova](https://github.com/kssenii)）。

#### 新功能

* 支持 `Nullable(JSON)` 类型。 [#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar))。
* 在 DEFAULT 和 MATERIALIZED 表达式中支持子列。 [#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar))。
* 支持通过设置 `output_format_parquet_write_bloom_filter`（默认启用）写入 Parquet 布隆过滤器。 [#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321))。
* Web UI 现在具有交互式数据库导航功能。 [#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 允许在存储策略中组合只读和读写磁盘（作为多个卷或多个磁盘）。这允许从整个卷读取数据，而插入操作将优先选择可写磁盘（即 Copy-on-Write 存储策略）。 [#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat))。
* 新增 `DatabaseBackup` 数据库引擎，可从备份中即时挂载表或数据库。 [#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal))。
* 在 Postgres 线协议中支持 prepared statements。 [#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12))。
* 新增在没有数据库层的情况下 ATTACH 表的功能，这对于位于 Web、S3 等外部虚拟文件系统上的 MergeTree 表非常有用。 [#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat))。
* 新增字符串比较函数 `compareSubstrings`，用于比较两个字符串的部分内容。示例：`SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` 的含义是“从第一个字符串的偏移量 0 和第二个字符串的偏移量 5 开始，按字典序比较字符串 `Saxon` 和 `Anglo-Saxon` 的 6 个字节”。 [#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc))。
* 新增函数 `initialQueryStartTime`。它返回当前查询的开始时间。在分布式查询中，该值在所有分片上都是相同的。 [#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik))。
* 为 MySQL 增加通过 named collections 进行 SSL 认证的支持。关闭 [#59111](https://github.com/ClickHouse/ClickHouse/issues/59111)。 [#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique))。

#### 实验性功能

* 新增了设置项 `enable_adaptive_memory_spill_scheduler`，允许同一查询中的多个 Grace JOIN 监控其合计内存占用，并自适应地触发将数据溢写到外部存储，以防止出现 MEMORY_LIMIT_EXCEEDED。 [#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 使新的实验性 `Kafka` 表引擎完全遵循 Keeper 特性标志。 [#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 恢复 (Intel) QPL 编解码器，该编解码器曾因授权问题在 v24.10 中被移除。 [#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在与 HDFS 的集成中，为配置项 `dfs.client.use.datanode.hostname` 新增了支持。 [#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).

#### 性能提升

* 改进了从 S3 读取 Wide 部分中整个 JSON 列的性能。这是通过为子列前缀反序列化添加预取、缓存已反序列化的前缀，以及对子列前缀进行并行反序列化来实现的。对于类似 `SELECT data FROM table` 的查询，从 S3 读取 JSON 列的速度提升约 4 倍，对于类似 `SELECT data FROM table LIMIT 10` 的查询提升约 10 倍。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在 `max_rows_in_join = max_bytes_in_join = 0` 时 `parallel_hash` 中不必要的竞争。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155) ([Nikita Taranov](https://github.com/nickitat)).
* 修复了在优化器交换 JOIN 两侧时 `ConcurrentHashJoin` 中的重复预分配问题。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149) ([Nikita Taranov](https://github.com/nickitat)).
* 在某些 JOIN 场景下进行了轻微优化：预先计算输出行数并为其预留内存。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376) ([Alexander Gololobov](https://github.com/davenger)).
* 对于类似 `WHERE a < b AND b < c AND c < 5` 的查询，可以推导出新的比较条件（`a < 5 AND b < 5`），以获得更好的过滤效果。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper 改进：在提交到内存存储时禁用摘要计算以提升性能。可以通过配置 `keeper_server.digest_enabled_on_commit` 启用。预处理请求时仍会计算摘要。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490) ([Antonio Andelic](https://github.com/antonio2368)).
* 在可能的情况下，将过滤表达式从 JOIN 的 ON 子句下推。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在 MergeTree 中延迟计算列和索引大小。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938) ([Pavel Kruglov](https://github.com/Avogar)).
* 在 `MATERIALIZE TTL` 中重新使 `ttl_only_drop_parts` 生效；仅读取重新计算 TTL 所需的列，并通过将数据部分替换为空部分来删除它们。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751) ([Andrey Zvonov](https://github.com/zvonand)).
* 减小 plain_rewritable 元数据文件的写缓冲区大小。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758) ([Julia Kartseva](https://github.com/jkartseva)).
* 降低某些窗口函数的内存使用。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647) ([lgbo](https://github.com/lgbo-ustc)).
* 同时评估 Parquet Bloom 过滤器和 min/max 索引。这对于正确支持 `x = 3 or x > 5`（其中 data = [1, 2, 4, 5]）是必要的。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383) ([Arthur Passos](https://github.com/arthurpassos)).
* 传递给 `Executable` 存储的查询不再局限于单线程执行。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084) ([yawnt](https://github.com/yawnt)).
* 在 ALTER TABLE FETCH PARTITION 中并行获取数据部分（线程池大小由 `max_fetch_partition_thread_pool_size` 控制）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978) ([Azat Khuzhin](https://github.com/azat)).
* 允许将使用 `indexHint` 函数的谓词下推到 `PREWHERE`。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987) ([Anton Popov](https://github.com/CurtizJ)).

#### 改进

* 修复了 `LowCardinality` 列内存占用大小的计算。[#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat)).
* `processors_profile_log` 表现在有默认配置，TTL 为 30 天。[#66139](https://github.com/ClickHouse/ClickHouse/pull/66139)（[Ilya Yatsishin](https://github.com/qoega)）。
* 允许在集群配置中为分片指定名称。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 将 Prometheus 远程写入响应的成功状态码从 200/OK 更改为 204/No Content。[#74170](https://github.com/ClickHouse/ClickHouse/pull/74170)（[Michael Dempsey](https://github.com/bluestealth)）。
* 新增在无需重启服务器的情况下，动态重新加载 `max_remote_read_network_bandwidth_for_serve` 和 `max_remote_write_network_bandwidth_for_server` 的能力。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* 允许在执行备份时使用 blob 路径计算校验和。 [#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在 `system.query_cache` 中新增了查询 ID 列（关闭 [#68205](https://github.com/ClickHouse/ClickHouse/issues/68205)）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 现在支持使用 `KILL QUERY` 或因超时（`max_execution_time`）自动取消 `ALTER TABLE ... FREEZE ...` 查询。[#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar))。
* 添加对 `groupUniqArrayArrayMap` 作为 `SimpleAggregateFunction` 的支持。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* 在 `Iceberg` 数据库引擎中隐藏 catalog 凭据配置。修复 [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559)。[#75080](https://github.com/ClickHouse/ClickHouse/pull/75080)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `intExp2` / `intExp10`：对原本未定义的行为作出规定：对于过小的参数返回 0，对于过大的参数返回 `18446744073709551615`，如果为 `nan` 则抛出异常。[#75312](https://github.com/ClickHouse/ClickHouse/pull/75312)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 在 `DatabaseIceberg` 中通过 catalog 配置原生支持 `s3.endpoint`。关闭了 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558)。[#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在执行 `SYSTEM DROP REPLICA` 时，如果用户权限不足，则不再静默失败。[#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc))。
* 添加一个 ProfileEvent，用于统计各系统日志刷写失败的次数。 [#75466](https://github.com/ClickHouse/ClickHouse/pull/75466) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 添加用于解密和解压的检查和额外日志记录。[#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar))。
* 在 `parseTimeDelta` 函数中新增了对微符号（U+00B5）的支持。现在微符号（U+00B5）和希腊字母 μ（U+03BC）都会被识别为微秒的有效表示形式，从而使 ClickHouse 的行为与 Go 的实现保持一致（[参见 time.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) 和 [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* 将服务器设置（`send_settings_to_client`）替换为客户端设置（`apply_settings_from_server`），用于控制客户端代码（例如解析 INSERT 数据和格式化查询输出）是否应使用来自服务器 `users.xml` 和用户配置中的设置。否则，将只使用来自客户端命令行、会话和查询本身的设置。注意，这仅适用于原生客户端（不适用于例如 HTTP），并且不适用于大部分查询处理（这些处理发生在服务器端）。[#75478](https://github.com/ClickHouse/ClickHouse/pull/75478)（[Michael Kolupaev](https://github.com/al13n321)）。
* 改进语法错误的错误消息。此前，如果查询过大，并且超出长度限制的标记是一个非常大的字符串字面量，那么描述错误原因的消息会被夹在该超长标记的两个示例之间而丢失。修复在错误消息中包含带有 UTF-8 字符的查询时被错误截断的问题。修复查询片段被过度加引号的问题。修复了 [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473)。[#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 `S3(Azure)Queue` 存储中添加 ProfileEvents。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 出于兼容性考虑，禁用从服务器向客户端发送设置（`send_settings_to_client=false`）（该功能稍后将作为客户端设置重新实现，以提升易用性）。 [#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321)).
* 新增配置项 `memory_worker_correct_memory_tracker`，用于启用利用后台线程定期读取的不同来源信息来校正内部内存跟踪器的功能。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* 将列 `normalized_query_hash` 添加到 `system.processes` 中。注意：虽然可以使用 `normalizedQueryHash` 函数在执行时轻松计算该值，但仍需要该列以便为后续更改做准备。[#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 查询 `system.tables` 时，即使存在一个建立在已被删除的数据库上的 `Merge` 表，也不会抛出异常。移除 `Hive` 表中的 `getTotalRows` 方法，因为我们不允许它执行复杂操作。[#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 以微秒精度存储备份的 start&#95;time/end&#95;time。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 添加 `MemoryTrackingUncorrected` 指标，用于显示内部全局内存跟踪器的取值（其值未经过 RSS 校正）。 [#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368))。
* 允许在 `PostgreSQL` 或 `MySQL` 表函数中解析 `localhost:1234/handle` 之类的端点。此更改修复了在 [https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) 中引入的回归问题。[#75944](https://github.com/ClickHouse/ClickHouse/pull/75944)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 新增了一个服务器设置 `throw_on_unknown_workload`，用于选择当查询中设置了 `workload` 但其值未知时的处理行为：要么允许无限制访问（默认），要么抛出 `RESOURCE_ACCESS_DENIED` 错误。此设置可用于强制所有查询都必须使用 workload 调度。[#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa))。
* 如果没有必要，不要在 `ARRAY JOIN` 中将子列重写为 `getSubcolumn`。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar))。
* 在加载表时遇到协调错误会进行重试。[#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `SYSTEM FLUSH LOGS` 现在支持刷新单条日志。[#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* 改进了 `/binary` 服务器页面。使用 Hilbert 曲线替代 Morton 曲线。在方形区域中显示 512 MB 的地址空间，使方形被填充得更充分（在之前的版本中，地址只填充了方形的一半）。根据更接近的库名而非函数名为地址着色。允许在区域外稍微多滚动一些。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 在出现 TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES 错误时重试 ON CLUSTER 查询。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* 添加异步指标 `CPUOverload`，用于计算服务器的相对 CPU 资源不足。[#76404](https://github.com/ClickHouse/ClickHouse/pull/76404)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将 `output_format_pretty_max_rows` 的默认值从 10000 修改为 1000。我认为这样在使用上更方便。[#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

#### Bug 修复（在官方稳定版中出现的、用户可感知的异常行为）

* 在查询解析阶段，如果出现异常，则使用自定义格式对其进行格式化。此前版本中，异常是采用默认格式进行格式化，而不是使用查询中指定的格式。修复了 [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422)。[#74994](https://github.com/ClickHouse/ClickHouse/pull/74994)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复 SQLite 的类型映射（整数类型映射为 `int64`，浮点类型映射为 `float64`）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x)).
* 修复来自父作用域的标识符解析。允许在 `WITH` 子句中为表达式使用别名。修复 [#58994](https://github.com/ClickHouse/ClickHouse/issues/58994)。修复 [#62946](https://github.com/ClickHouse/ClickHouse/issues/62946)。修复 [#63239](https://github.com/ClickHouse/ClickHouse/issues/63239)。修复 [#65233](https://github.com/ClickHouse/ClickHouse/issues/65233)。修复 [#71659](https://github.com/ClickHouse/ClickHouse/issues/71659)。修复 [#71828](https://github.com/ClickHouse/ClickHouse/issues/71828)。修复 [#68749](https://github.com/ClickHouse/ClickHouse/issues/68749)。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 `negate` 函数的单调性问题。在早期版本中，当 `x` 为主键时，查询 `select * from a where -x = -42;` 可能会返回错误结果。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321)).
* 修正 `arrayIntersect` 对空元组的处理。此更改修复了 [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578)。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 修复读取 JSON 子对象子列时使用错误前缀的问题。[#73182](https://github.com/ClickHouse/ClickHouse/pull/73182)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在客户端-服务器通信中正确传递 Native 格式设置。[#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar))。
* 为某些存储引擎添加对不支持类型的检查。[#74218](https://github.com/ClickHouse/ClickHouse/pull/74218)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在 macOS 上通过 PostgreSQL 接口执行 `INSERT INTO SELECT` 查询时出现的崩溃问题（问题 [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* 修复了副本数据库中未初始化的 max&#95;log&#95;ptr。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov))。
* 修复在插入 interval 时发生的崩溃（问题 [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 修复常量 JSON 字面量的格式化问题。此前在将查询发送到另一台服务器时，可能会导致语法错误。[#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 在启用隐式投影并使用常量分区表达式时，修复了 `CREATE` 查询会失败的问题。修复了 [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596)。[#74634](https://github.com/ClickHouse/ClickHouse/pull/74634)（[Amos Bird](https://github.com/amosbird)）。
* 避免在 `INSERT` 因异常结束后将连接置于异常状态。[#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat))。
* 避免复用已被遗留在中间状态的连接。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat))。
* 修复在解析 JSON 类型声明且类型名称不是大写时出现的崩溃问题。[#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper：修复在连接在建立之前就被终止时出现的 `logical_error`。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复了一个问题：当存在使用 `AzureBlobStorage` 的表时，服务器无法启动。现在可以在无需向 Azure 发送任何请求的情况下加载这些表。[#74880](https://github.com/ClickHouse/ClickHouse/pull/74880)（[Alexey Katsman](https://github.com/alexkats)）。
* 修复 `query_log` 中在 BACKUP 和 RESTORE 操作时缺失的 `used_privileges` 和 `missing_privileges` 字段。[#74887](https://github.com/ClickHouse/ClickHouse/pull/74887)（[Alexey Katsman](https://github.com/alexkats)）。
* 在 HDFS select 请求期间如果出现 SASL 错误，则刷新 HDFS 的 Kerberos 票据。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* 修复 startup&#95;scripts 中针对 Replicated 数据库的查询。[#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat))。
* 修复在 `JOIN ON` 子句中对通过类型别名定义的表达式使用空安全（null-safe）比较时出现的问题。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 在 remove 操作失败时，将 part 的状态从 deleting 恢复为 outdated。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 在之前的版本中，当存在标量子查询时，我们会在数据格式初始化期间开始写入进度信息（从处理该子查询累积而来），而这发生在写入 HTTP 头部之前。这样会导致 HTTP 头部丢失，比如 X-ClickHouse-QueryId 和 X-ClickHouse-Format，以及 Content-Type。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 修复当 `database_replicated_allow_replicated_engine_arguments=0` 时 `CREATE TABLE AS...` 查询的问题。[#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc)).
* 修复在发生 INSERT 异常后客户端连接处于错误状态的问题。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* 修复 PSQL 复制中未捕获异常导致的崩溃。[#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* SASL 可能会导致任何 RPC 调用失败，此修复使得在 krb5 ticket 过期时可以重试该调用。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* 修复了在启用设置 `optimize_function_to_subcolumns` 时，`Array`、`Map` 和 `Nullable(..)` 列上的主键和二级索引未正确生效的问题。此前，这些列上的索引可能会被忽略。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 在创建带有内部表的物化视图时禁用 `flatten_nested`，因为无法使用这些扁平化后的列。[#75085](https://github.com/ClickHouse/ClickHouse/pull/75085)（[Christoph Wurm](https://github.com/cwurm)）。
* 修复了在 `forwarded_for` 字段中对某些 IPv6 地址（例如 ::ffff:1.1.1.1）的错误解析问题，该问题会导致客户端断开连接并抛出异常。[#75133](https://github.com/ClickHouse/ClickHouse/pull/75133)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复针对 LowCardinality 可为空数据类型的 NULL 安全 JOIN 处理。此前，在 JOIN ON 中使用 NULL 安全比较（例如 `IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b`）时，与 LowCardinality 列配合时无法正确工作。[#75143](https://github.com/ClickHouse/ClickHouse/pull/75143) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 验证在为 NumRowsCache 统计 total&#95;number&#95;of&#95;rows 时未指定 key&#95;condition。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 通过新的分析器修复含有未使用插值的查询。[#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 修复在 Insert 中使用 CTE 时出现的崩溃问题。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper 修复：在回滚日志时避免向已损坏的变更日志写入数据。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 在合适的情况下将 `BFloat16` 用作超类型。修复/关闭了以下问题：[#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复在启用 any&#95;join&#95;distinct&#95;right&#95;table&#95;keys 且 JOIN 的 ON 条件中包含 OR 时，连接结果中出现的意外的默认值。[#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 对 azureblobstorage 表引擎的凭据进行脱敏处理。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* 修复了 ClickHouse 可能会错误地将过滤条件下推到 PostgreSQL、MySQL 或 SQLite 等外部数据库的行为。已关闭：[#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 修复了在以 Protobuf 格式输出的同时并行执行查询 `SYSTEM DROP FORMAT SCHEMA CACHE` 时，Protobuf schema 缓存中可能发生的崩溃。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在并行副本场景下，下推 `HAVING` 过滤条件时可能出现的逻辑错误或未初始化内存问题。 [#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 隐藏 `icebergS3`、`icebergAzure` 表函数和表引擎中的敏感信息。[#75378](https://github.com/ClickHouse/ClickHouse/pull/75378)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 当用于修剪的字符通过计算得到且为空字符串时，函数 `TRIM` 现在已能被正确处理。示例：`SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* 修复 IOutputFormat 中的数据竞争。[#75448](https://github.com/ClickHouse/ClickHouse/pull/75448)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复在对分布式表执行 JOIN 时使用 Array 类型 JSON 子列时可能出现的错误 `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes`。[#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* 通过 `CODEC(ZSTD, DoubleDelta)` 修复数据损坏问题。关闭了 [#70031](https://github.com/ClickHouse/ClickHouse/issues/70031)。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复 `allow_feature_tier` 与 MergeTree 兼容性设置之间的交互。[#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano))。
* 修复在重试处理文件时，system.s3queue&#95;log 中 processed&#95;rows 值不正确的问题。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 当物化视图向 URL 引擎写入数据且存在连接问题时，遵守 `materialized_views_ignore_errors` 设置。[#75679](https://github.com/ClickHouse/ClickHouse/pull/75679)（[Christoph Wurm](https://github.com/cwurm)）。
* 修复了在对不同类型的列多次执行异步 `RENAME` 查询（`alter_sync = 0`）后，从 `MergeTree` 表读取数据时偶发崩溃的问题。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 修复某些包含 `UNION ALL` 的查询会报 `Block structure mismatch in QueryPipeline stream` 错误的问题。[#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在对其主键列执行 ALTER MODIFY 时重建 projection。此前，在对用于 projection 主键的列执行 ALTER MODIFY 后进行查询，可能会导致 `CANNOT_READ_ALL_DATA` 错误。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复在 analyzer 中对标量子查询执行 `ARRAY JOIN` 时结果不正确的问题。[#75732](https://github.com/ClickHouse/ClickHouse/pull/75732) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 修复 `DistinctSortedStreamTransform` 中的空指针解引用问题。[#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* 修正 `allow_suspicious_ttl_expressions` 的行为。[#75771](https://github.com/ClickHouse/ClickHouse/pull/75771)（[Aleksei Filatov](https://github.com/aalexfvk)）。
* 修复函数 `translate` 中未初始化内存读取的问题。此更改关闭了 [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592)。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在 Native 格式下，将格式设置传递到 JSON 的字符串格式化中。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* 在设置变更历史中记录了在 v24.12 中默认启用并行哈希 JOIN 算法的变更。这意味着，如果配置了早于 v24.12 的兼容性级别，ClickHouse 将继续使用非并行哈希进行 JOIN。[#75870](https://github.com/ClickHouse/ClickHouse/pull/75870)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复了一个错误：具有隐式添加的 min-max 索引的表无法被复制到新表中（问题 [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` 允许从文件系统中打开任意库，因此只适合在隔离环境中运行。为防止在其与 clickhouse-server 紧邻部署时产生漏洞，我们将把可访问库的路径限制在配置中指定的位置。此漏洞由 **Arseniy Dugin** 通过 [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) 发现。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 我们当时恰好对某些元数据使用了 JSON 序列化，这是一个错误，因为 JSON 不支持在字符串字面量中包含二进制数据（包括空字节）。SQL 查询可以包含二进制数据和无效的 UTF-8，因此我们也必须在元数据文件中支持这一点。与此同时，ClickHouse 的 `JSONEachRow` 和类似格式则通过偏离 JSON 标准来确保二进制数据可以完美往返。动机说明见此处：[https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解决方案是让 `Poco::JSON` 库与 ClickHouse 中的 JSON 格式序列化行为保持一致。此变更关闭了 [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668)。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 修复存储 `S3Queue` 中关于提交限制的检查。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在附加带有自动索引（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）的 MergeTree 表时的错误。[#76139](https://github.com/ClickHouse/ClickHouse/pull/76139)（[Azat Khuzhin](https://github.com/azat)）。
* 修复了作业父线程的堆栈跟踪（受 `enable_job_stack_trace` 设置控制）未打印的问题。修复了 `enable_job_stack_trace` 设置未正确传播到线程，导致生成的堆栈跟踪内容有时不遵循该设置的问题。[#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 修复权限检查错误，此前 `ALTER RENAME` 被错误地要求具备 `CREATE USER` 授权。关闭 [#74372](https://github.com/ClickHouse/ClickHouse/issues/74372)。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* 修复在大端架构上对 FixedString 使用 reinterpretAs 的问题。[#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* 修复 S3Queue 中的逻辑错误：“Expected current processor {} to be equal to {} for bucket {}”。[#76358](https://github.com/ClickHouse/ClickHouse/pull/76358)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 针对 Memory 数据库的 ALTER 操作修复死锁问题。[#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat))。
* 修复在 `WHERE` 条件中使用 `pointInPolygon` 函数时索引分析中的逻辑错误。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* 修复信号处理程序中的潜在不安全调用。[#76549](https://github.com/ClickHouse/ClickHouse/pull/76549)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复 PartsSplitter 中对反向键的支持问题。这解决了 [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400)。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### 构建/测试/打包改进

* 支持在 ARM 和 Intel 架构的 Mac 上构建 HDFS。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp)).
* 在为 Darwin 进行交叉编译时启用 ICU 和 gRPC。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano)).
* 将内置 LLVM 更新至 19 版本。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在 docker 镜像中为默认用户禁用网络访问。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid)). 将所有与 clickhouse-server 相关的操作封装为函数，并仅在 `entrypoint.sh` 中启动默认二进制文件时执行这些操作。此前长期被推迟的一项改进在 [#50724](https://github.com/ClickHouse/ClickHouse/issues/50724) 中被提出。为 `clickhouse-extract-from-config` 新增开关 `--users`，用于从 `users.xml` 中获取值。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 从二进制文件中移除约 20MB 的死代码。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

### ClickHouse 25.1 版本，2025-01-28 {#251}

#### 向后不兼容的变更

* `JSONEachRowWithProgress` 现在会在实际产生进度时写出进度信息。在之前的版本中，进度只会在每个结果块之后显示，这使得它几乎没有用。修改进度显示方式：不再显示零值。这解决了 [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800)。[#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` 表现在会通过取各个底层表列的并集并推导公共类型来统一它们的结构。这解决了 [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864)。在某些情况下，此变更可能是向后不兼容的。一个例子是各个表之间不存在公共类型，但仍然可以转换为第一个表的类型，比如 UInt64 和 Int64，或任意数值类型与 String。如果你希望恢复旧行为，将 `merge_table_max_tables_to_look_for_schema_inference` 设置为 `1`，或将 `compatibility` 设置为 `24.12` 或更早版本。[#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 输出格式会将 Date 和 DateTime 列转换为 Parquet 所支持的日期/时间类型，而不是按原始数字写入。`DateTime` 将变为 `DateTime64(3)`（之前为：`UInt32`）；通过设置 `output_format_parquet_datetime_as_uint32` 可以恢复旧行为。`Date` 将变为 `Date32`（之前为：`UInt16`）。[#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* 默认情况下，不再允许在 `ORDER BY` 和比较函数 `less/greater/equal/etc` 中使用不可比较类型（例如 `JSON`/`Object`/`AggregateFunction`）。[#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 过时的 `MaterializedMySQL` 数据库引擎已被移除，不再可用。[#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` 字典源不再执行 `SHOW TABLE STATUS` 查询，因为对于 InnoDB 表以及任何较新的 MySQL 版本来说，它并不提供任何有价值的信息。这解决了 [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636)。此变更是向后兼容的，但被放到本小节中，以便你有机会注意到它。[#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` 查询现在需要单独的 `CHECK` 权限。在之前的版本中，仅有 `SHOW TABLES` 权限就足以执行这些查询。但 `CHECK TABLE` 查询可能非常重，而且常规的 `SELECT` 查询复杂度限制并不适用于它，这带来了潜在的拒绝服务（DoS）风险。[#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 函数 `h3ToGeo()` 现在按 `(lat, lon)` 的顺序返回结果（这是几何函数的标准顺序）。希望保留旧结果顺序 `(lon, lat)` 的用户可以将设置 `h3togeo_lon_lat_result_order` 设为 `true`。[#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新的 MongoDB 驱动现在为默认驱动。希望继续使用旧版驱动的用户可以将服务端设置 `use_legacy_mongodb_integration` 设为 `true`。[#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。

#### 新功能

* 在提交 `SELECT` 查询后，其执行期间可以立即应用尚未完成（尚未由后台进程物化）的 mutation。可以通过设置 `apply_mutations_on_fly` 来启用该功能。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* 在 Iceberg 中为时间相关的 transform 分区操作实现 `Iceberg` 表的分区剪枝。[#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik))。
* 在 MergeTree 的排序键和跳过索引中支持子列。[#72644](https://github.com/ClickHouse/ClickHouse/pull/72644)（[Pavel Kruglov](https://github.com/Avogar)）。
* 已支持从 `Apache Arrow`/`Parquet`/`ORC` 读取 `HALF_FLOAT` 值（会被读取为 `Float32`）。修复了 [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960)。请注意，IEEE-754 半精度浮点数与 `BFloat16` 并不相同。修复了 [#73835](https://github.com/ClickHouse/ClickHouse/issues/73835)。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` 表将包含两个新列 `symbols` 和 `lines`，用于存储符号化后的堆栈跟踪。这样便于收集和导出性能分析信息。该行为由 `trace_log` 中的服务器配置项 `symbolize` 控制，且默认启用。[#73896](https://github.com/ClickHouse/ClickHouse/pull/73896)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增函数 `generateSerialID`，用于在表中生成自增序号。是 [kazalika](https://github.com/kazalika) 提交的 [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) 的后续工作。本项变更关闭了 [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485)。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 为 DDL 查询添加语法 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN`。这意味着子查询 `{query1, query2, ... queryN}` 可以彼此并行执行（并且推荐这样使用）。[#73983](https://github.com/ClickHouse/ClickHouse/pull/73983)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 为反序列化后的 skipping 索引 granule 新增了一个内存缓存。这将加速重复执行、且使用 skipping 索引的查询。新缓存的大小由服务器设置 `skipping_index_cache_size` 和 `skipping_index_cache_max_entries` 控制。引入该缓存的最初动机是向量相似度索引，而这些索引现在已经快了很多。[#70102](https://github.com/ClickHouse/ClickHouse/pull/70102)（[Robert Schulze](https://github.com/rschu1ze)）。
* 现在，内嵌的 Web UI 在查询运行期间提供进度条，并允许取消查询。它会显示记录总数以及关于查询速度的详细信息。数据一到达，数据表就可以增量渲染。启用 HTTP 压缩后，表格渲染速度变得更快。表头现在是固定的。它支持选中单元格，并可以通过方向键在单元格之间导航。修复了选中单元格轮廓导致其变小的问题。单元格不再在鼠标悬停时展开，而只会在选中时展开。停止渲染传入数据的时机现在由客户端而不是服务器端决定。对数字的分组进行高亮显示。整体设计进行了焕新并变得更鲜明。它会检查服务器是否可达以及凭证是否正确，并显示服务器版本和运行时长。在所有字体中（即使在 Safari 中），云图标都是轮廓样式。嵌套数据类型中的大整数将得到更好的渲染。它将正确显示 inf/nan。将在鼠标悬停在列头时显示数据类型。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加了对通过设置 `add_minmax_index_for_numeric_columns`（用于数值列）和 `add_minmax_index_for_string_columns`（用于字符串列），为由 MergeTree 管理的列默认创建最小-最大（跳过）索引的支持。目前这两个设置均为禁用状态，因此尚未引入行为变更。[#74266](https://github.com/ClickHouse/ClickHouse/pull/74266)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 将 `script_query_number` 和 `script_line_number` 字段添加到 `system.query_log`、原生协议中的 ClientInfo，以及服务器日志中。此更改解决了 [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542)。感谢 [pinsvin00](https://github.com/pinsvin00) 先前在 [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) 中发起该功能。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增聚合函数 `sequenceMatchEvents`，用于为模式中最长的事件链返回匹配事件的时间戳。[#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus))。
* 新增函数 `arrayNormalizedGini`。[#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl))。
* 为 `DateTime64` 增加减号运算符支持，从而允许在 `DateTime64` 值之间以及与 `DateTime` 之间进行减法运算。[#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg))。

#### 实验性功能

* `BFloat16` 数据类型已可用于生产环境。[#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

#### 性能优化

* 对函数 `indexHint` 进行了优化。现在，仅作为函数 `indexHint` 参数使用的列不会从表中读取。[#74314](https://github.com/ClickHouse/ClickHouse/pull/74314)（[Anton Popov](https://github.com/CurtizJ)）。如果 `indexHint` 函数是你企业数据架构的核心组件，那么这一优化简直可以说能“救你一命”。
* 对 `parallel_hash` JOIN 算法中的 `max_joined_block_size_rows` 设置进行更精确的处理，有助于避免相比 `hash` 算法出现更高的内存消耗。[#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat))。
* 在查询计划层面对 `MergingAggregated` 步骤支持谓词下推优化，从而提升了一些使用 analyzer 的查询的性能。[#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 在 `parallel_hash` JOIN 算法的探测阶段，已移除按哈希拆分左表数据块的操作。[#73089](https://github.com/ClickHouse/ClickHouse/pull/73089)（[Nikita Taranov](https://github.com/nickitat)）。
* 优化 RowBinary 输入格式。修复 [#63805](https://github.com/ClickHouse/ClickHouse/issues/63805)。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* 当启用 `optimize_on_insert` 时，将数据部分写入为 1 级。这样可以对新写入的数据部分在带有 `FINAL` 的查询中使用多种优化。[#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ))。
* 通过底层优化提升字符串反序列化速度。[#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* 在对记录进行相等性比较（例如在执行合并时）时，应优先从最有可能不相等的列开始比较行。[#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus))。
* 通过按照键对右表重新排序，以提升 Grace 哈希连接性能。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* 允许 `arrayROCAUC` 和 `arrayAUCPR` 计算整个曲线的部分面积，从而可以在海量数据集上并行计算。[#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias))。
* 避免生成过多的空闲线程。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* 当在表函数中只使用花括号展开时，不要列出对象存储键。解决了 [#73333](https://github.com/ClickHouse/ClickHouse/issues/73333)。[#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 对在 Nullable 参数上的函数执行进行短路优化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li))。
* 不要在非函数类型的列上应用 `maskedExecute`，以提升短路执行的性能。[#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* 禁用 `Kafka`/`NATS`/`RabbitMQ`/`FileLog` 输入格式中的消息头自动检测以提升性能。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat)).
* 在使用 grouping sets 进行聚合后，以更高的并行度执行 pipeline。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* 缩小 `MergeTreeReadPool` 中的临界区范围。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* 并行副本性能改进。对于与并行副本协议无关的数据包，其在查询发起端的反序列化现在始终在 pipeline 线程中进行。此前，这一步可能在负责 pipeline 调度的线程中执行，从而降低发起端的响应能力并延迟 pipeline 的执行。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter)).
* 提升 Keeper 中大规模批量请求的性能。[#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* 按值使用日志包装器，不要在堆上分配它们。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 在后台重新建立到 MySQL 和 Postgres 字典副本的连接，以避免延迟对相应字典的请求。[#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 并行副本利用关于副本可用性的历史信息来改进副本选择，但在连接不可用时不会更新该副本的错误计数。此 PR 现在会在副本不可用时更新其错误计数。[#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi))。
* 新增了一个 MergeTree 设置 `materialize_skip_indexes_on_merge`，用于在合并过程中禁止自动创建 skip 索引。这样允许用户通过显式命令（`ALTER TABLE [..] MATERIALIZE INDEX [...]`）来控制何时创建 skip 索引。如果构建 skip 索引的开销较大（例如向量相似度索引），这会非常有用。[#74401](https://github.com/ClickHouse/ClickHouse/pull/74401) ([Robert Schulze](https://github.com/rschu1ze))。
* 优化 Storage(S3/Azure)Queue 中的 Keeper 请求。 [#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 默认最多可使用 `1000` 个并行副本。 [#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 在从 S3 磁盘读取数据时改进 HTTP 会话复用（[#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)）。[#74548](https://github.com/ClickHouse/ClickHouse/pull/74548)（[Julian Maicher](https://github.com/jmaicher)）。

#### 改进

* 在具有隐式 ENGINE 的 `CREATE TABLE` 查询中支持 `SETTINGS`，并支持混合使用引擎设置和查询设置。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano))。
* 将默认启用 `use_hive_partitioning`。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 支持在参数不同的 JSON 类型之间进行 CAST 和 ALTER 操作。 [#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar)).
* 支持对 JSON 列的值进行相等比较。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar))。
* 改进含 JSON 子列的标识符的格式，避免不必要的反引号。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* 交互式指标功能改进。修复来自并行副本的指标未被完整展示的问题。按照最近一次更新时间排序展示指标，其次按名称的字典序排序。不展示陈旧的指标。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631) ([Julia Kartseva](https://github.com/jkartseva))。
* 将 JSON 输出格式默认设为美化格式。新增设置 `output_format_json_pretty_print` 用于控制该行为，并默认启用该设置。[#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar))。
* 默认允许使用 `LowCardinality(UUID)`。实践证明，这一设置在 ClickHouse Cloud 客户中十分实用。[#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 改进安装过程中的消息提示。[#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进了关于 ClickHouse Cloud 密码重置的提示信息。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 改进在 File 表无法向文件追加时的错误消息。[#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 当用户在终端中意外选择将结果输出为二进制格式（例如 Native、Parquet、Avro）时，弹出确认提示。此更改解决了 [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524)。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在终端中的 Pretty 和 Vertical 格式下高亮显示行尾空格，以提高可读性。该行为由设置 `output_format_pretty_highlight_trailing_spaces` 控制。最初由 [Braden Burns](https://github.com/bradenburns) 在 [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) 中实现，并关闭了 [#71590](https://github.com/ClickHouse/ClickHouse/issues/71590)。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当 stdin 从文件重定向输入时，`clickhouse-client` 和 `clickhouse-local` 将自动检测其压缩格式。此更改修复了 [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865)。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 默认在 pretty 输出格式中截断过长的列名。该行为由 `output_format_pretty_max_column_name_width_cut_to` 和 `output_format_pretty_max_column_name_width_min_chars_to_cut` 设置控制。这是对 [tanmaydatta](https://github.com/tanmaydatta) 在 [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) 中工作成果的延续。此更改解决了 [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968)。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 让 `Pretty` 格式更美观：如果距离上一个块输出的时间不长，则将多个块合并为一个块。通过新的设置 `output_format_pretty_squash_consecutive_ms`（默认 50 ms）和 `output_format_pretty_squash_max_wait_ms`（默认 1000 ms）进行控制。是对 [#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) 的延续。本次改动关闭了 [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153)。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新增一个指标，用于统计当前正在合并的源数据片数量。以解决 [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809)。[#73868](https://github.com/ClickHouse/ClickHouse/pull/73868)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 当输出到终端时，在 `Vertical` 格式下高亮显示列。此行为可通过 `output_format_pretty_color` 设置禁用。[#73898](https://github.com/ClickHouse/ClickHouse/pull/73898) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 已将 MySQL 兼容性提升到现在 `mysqlsh`（Oracle 提供的功能丰富的 MySQL CLI）也可以连接到 ClickHouse 的水平。这有助于测试。[#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Pretty 输出格式现在可以在表格单元格内渲染多行字段，从而提高可读性。该功能默认启用，并可以通过设置 `output_format_pretty_multiline_fields` 进行控制。这是对 [Volodyachan](https://github.com/Volodyachan) 在 [#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) 中工作的延续。此更改关闭了 [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912)。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在浏览器中将 X-ClickHouse HTTP 头部暴露给 JavaScript，从而使编写应用程序更加方便。[#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `JSONEachRowWithProgress` 格式将包含带有元数据的事件，以及 totals 和 extremes。它还包含 `rows_before_limit_at_least` 和 `rows_before_aggregation`。如果在输出部分结果后收到异常，该格式会正确输出异常信息。现在进度信息中包含已消耗的纳秒数。结束时会发出最后一个进度事件。查询运行期间的进度输出频率不会高于 `interactive_delay` 设置指定的时间间隔。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 沙漏将在 Play UI 中顺畅旋转。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 即使 HTTP 响应经过压缩，也要在数据包一到达时立即发送。这样可以让浏览器及时接收进度数据包和压缩数据。[#74201](https://github.com/ClickHouse/ClickHouse/pull/74201)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 如果输出记录数大于 N = `output_format_pretty_max_rows`，则不再只显示前 N 行，而是从中间截断输出表，显示前 N/2 行和后 N/2 行。[#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) 的延续。此更改关闭了 [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502)。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 在启用哈希 JOIN 算法时，允许使用更通用的 JOIN 规划算法。[#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 支持在数据类型为 `DateTime64` 的列上创建 bloom&#95;filter 索引。[#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean)).
* 当同时启用 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 时，数据片段合并将忽略最大字节数限制。[#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* 为 OpenTelemetry span 日志表添加了 HTTP 头部，以提高可追踪性。[#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* 支持按自定义时区写入 `orc` 文件，而不是始终使用 `GMT` 时区。[#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou))。
* 在跨云写入备份时遵循 I/O 调度设置。[#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 在 `system.asynchronous_metrics` 中为 `metric` 列添加列别名 `name`。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 由于一些历史原因，查询 `ALTER TABLE MOVE PARTITION TO TABLE` 之前检查的是 `SELECT` 和 `ALTER DELETE` 权限，而不是专门的 `ALTER_MOVE_PARTITION`。本 PR 改为使用这一访问类型。出于兼容性考虑，如果已授予 `SELECT` 和 `ALTER DELETE`，则仍会隐式授予此权限，但这种行为将在未来版本中被移除。修复了 [#16403](https://github.com/ClickHouse/ClickHouse/issues/16403)。[#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* 在尝试物化排序键中的列时抛出异常，而不是让其导致排序顺序被打乱。[#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48)).
* 在 `EXPLAIN QUERY TREE` 中隐藏敏感信息。 [#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 &quot;native&quot; 读取器中新增对 Parquet 整数逻辑类型的支持。 [#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos)).
* 如果默认用户配置了密码，则在浏览器中以交互方式请求凭证。在早期版本中，服务器返回 HTTP 403；现在返回 HTTP 401。[#72198](https://github.com/ClickHouse/ClickHouse/pull/72198)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 将访问类型 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` 从全局形式转换为参数化形式。也就是说，用户现在可以更精细地授予访问管理权限：[ #72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit))。
* 将 `latest_fail_error_code_name` 列添加到 `system.mutations` 中。我们需要该列来引入一个用于卡住（stuck）mutations 的新指标，并利用它在云端中构建错误图表，并且（可选）添加一个更少噪声的新告警。[#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 减少 `ATTACH PARTITION` 查询中的内存分配量。[#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* 使 `max_bytes_before_external_sort` 限制取决于整个查询的内存消耗（此前它表示单个排序线程中排序块的字节数，现在它与 `max_bytes_before_external_group_by` 含义相同——即所有线程在整个查询中可用内存的总量上限）。另外新增一个用于控制落盘块大小的设置——`min_external_sort_block_bytes`。[#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat))。
* 忽略 trace collector 施加的内存限制。[#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* 在 `system.server_settings` 中添加服务器设置 `dictionaries_lazy_load` 和 `wait_dictionaries_load_at_startup`。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm))。
* 将 `max_backup_bandwidth` 设置添加到可在 `BACKUP`/`RESTORE` 查询中指定的设置列表中。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* 降低 ReplicatedMergeTree 引擎中新出现的副本分片的日志级别，以帮助尽量减少在副本集群中生成的日志量。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 改进对析取表达式中公共子表达式的抽取。即使各个析取分支之间不存在公共子表达式，也允许简化生成的过滤表达式。本项是对 [#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) 的延续。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* 在 Storage 中，`S3Queue`/`AzureQueue` 现在允许为创建时未指定设置的表补充设置。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 引入设置 `least_greatest_legacy_null_behavior`（默认值：`false`），用于控制函数 `least` 和 `greatest` 在处理 `NULL` 参数时，是无条件返回 `NULL`（当为 `true` 时），还是忽略该参数（当为 `false` 时）。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze)).
* 在 ObjectStorageQueueMetadata 的清理线程中使用 Keeper multi 请求。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* 当 ClickHouse 在 cgroup 环境中运行时，我们仍然会收集与系统负载、进程调度、内存等相关的系统范围异步指标。当 ClickHouse 是主机上唯一一个资源消耗较高的进程时，这些指标可能提供有用的信号。[#73369](https://github.com/ClickHouse/ClickHouse/pull/73369)（[Nikita Taranov](https://github.com/nickitat)）。
* 在 `S3Queue` 存储中，现在支持将 24.6 之前创建的旧有序表迁移到基于 bucket 的新结构中。 [#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加 `system.azure_queue`，其功能类似于现有的 `system.s3queue`。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 函数 `parseDateTime64`（及其变体）现在对于 1970 年之前和 2106 年之后的输入日期也能返回正确结果。示例：`SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。[#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar))。
* 修复了一些用户反馈的 `clickhouse-disks` 易用性问题。关闭了 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136)。[#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* 允许在 S3(Azure)Queue 存储中修改提交设置。（提交设置包括：`max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit`）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 在 S3(Azure)Queue 存储中汇总各个源的进度，以便与提交上限设置进行比较。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 支持在 `BACKUP`/`RESTORE` 查询中使用核心设置。[#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* 在生成 Parquet 输出时考虑 `output_format_compression_level`。[#73651](https://github.com/ClickHouse/ClickHouse/pull/73651)（[Arthur Passos](https://github.com/arthurpassos)）。
* 将对 Apache Arrow 的 `fixed_size_list` 的读取改为按 `Array` 处理，而不是将其视为不受支持的类型。[#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers)).
* 添加了两个备份引擎：`Memory`（在当前用户会话内保存备份）和 `Null`（不会在任何地方保存备份），用于测试。[#73690](https://github.com/ClickHouse/ClickHouse/pull/73690)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_num_ratio_to_cores` 可以在无需重启服务器的情况下修改。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* 为 `formatReadable` 函数新增对扩展数值类型（`Decimal`、大整数）的支持。[#73765](https://github.com/ClickHouse/ClickHouse/pull/73765)（[Raúl Marín](https://github.com/Algunenano)）。
* 为 Postgres wire protocol 兼容性提供 TLS 支持。[#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 函数 `isIPv4String` 在正确的 IPv4 地址后面跟随一个 0 字节时会返回 true，而在这种情况下它本应返回 false。是对 [#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) 的后续修复。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 使 MySQL 线协议中的错误码与 MySQL 保持一致。是 [#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) 的后续工作。关闭 [#50957](https://github.com/ClickHouse/ClickHouse/issues/50957)。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 添加设置 `validate_enum_literals_in_opearators`，用于在 `IN`、`NOT IN` 等运算符中对枚举字面量进行校验，检查其是否属于对应的枚举类型；当字面量不是有效的枚举值时抛出异常。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 在 `S3(Azure)Queue` 存储中，将由提交设置定义的单个批次中的所有文件在一次 Keeper 事务中统一提交。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 为可执行 UDF 和字典禁用头部检测（可能导致错误：Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* 为 `EXPLAIN PLAN` 添加 `distributed` 选项。现在，`EXPLAIN distributed=1 ...` 会将远程计划追加到 `ReadFromParallelRemote*` 步骤中。[#73994](https://github.com/ClickHouse/ClickHouse/pull/73994)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 对带有 Dynamic 参数的 not/xor 使用正确的返回类型。[#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar))。
* 允许在表创建后修改 `add_implicit_sign_column_constraint_for_collapsing_engine`。[#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm)).
* 在物化视图的 SELECT 查询中增加对子列的支持。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar)).
* 现在可以通过三种简单方法在 `clickhouse-client` 中设置自定义提示符：1. 通过命令行参数 `--prompt`，2. 在配置文件中通过设置 `<prompt>[...]</prompt>`，3. 同样在配置文件中，通过按连接的设置 `<connections_credentials><prompt>[...]</prompt></connection_credentials>`。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168) ([Christoph Wurm](https://github.com/cwurm))。
* 在 ClickHouse Client 中通过连接到端口 9440 自动检测是否使用安全连接。[#74212](https://github.com/ClickHouse/ClickHouse/pull/74212)（[Christoph Wurm](https://github.com/cwurm)）。
* 支持在 `http_handlers` 中仅通过用户名对用户进行认证（此前还要求用户提供密码）。[#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat))。
* 对替代查询语言 PRQL 和 KQL 的支持目前为实验性功能。要使用它们，请设置 `allow_experimental_prql_dialect = 1` 和 `allow_experimental_kusto_dialect = 1`。[#74224](https://github.com/ClickHouse/ClickHouse/pull/74224)（[Robert Schulze](https://github.com/rschu1ze)）。
* 支持在更多聚合函数中返回默认的 Enum 类型。[#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* 在 `OPTIMIZE TABLE` 中，现在可以使用关键字 `FORCE` 作为现有关键字 `FINAL` 的替代。[#74342](https://github.com/ClickHouse/ClickHouse/pull/74342)（[Robert Schulze](https://github.com/rschu1ze)）。
* 添加 `IsServerShuttingDown` 指标，用于在服务器关闭耗时过长时触发告警。[#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 在 `EXPLAIN` 输出中新增了 Iceberg 表名。 [#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 在使用旧分析器配合 RECURSIVE CTE 时提供更好的错误信息。[#74523](https://github.com/ClickHouse/ClickHouse/pull/74523)（[Raúl Marín](https://github.com/Algunenano)）。
* 在 `system.errors` 中显示详细错误信息。[#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar))。
* 允许客户端在与 clickhouse-keeper 通信时使用密码。如果你已经为服务器和客户端正确配置了 SSL，这个功能的作用不大，但在某些场景下仍然可能有用。密码长度不能超过 16 个字符。它与 Keeper 认证模型无关。[#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin))。
* 为配置重载器添加错误码。[#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth))。
* 为 MySQL 和 PostgreSQL 表函数和表引擎添加了对 IPv6 地址的支持。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 为 `divideDecimal` 实现短路优化。修复 [#74280](https://github.com/ClickHouse/ClickHouse/issues/74280)。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 现在可以在启动脚本中配置用户。[#74894](https://github.com/ClickHouse/ClickHouse/pull/74894)（[pufit](https://github.com/pufit)）。
* 新增对 Azure SAS 令牌的支持。[#72959](https://github.com/ClickHouse/ClickHouse/pull/72959)（[Azat Khuzhin](https://github.com/azat)）。

#### 缺陷修复（官方稳定版中用户可见的异常行为）

* 仅在压缩编解码器支持时才设置 Parquet 压缩级别。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修复了一个回归缺陷：在使用带修饰符的排序规则语言环境时会抛出错误。现在，例如 `SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` 可以正常工作。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* 修复无法使用 keeper-client 创建 SEQUENTIAL 节点的问题。[#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94)).
* 修复 position 系列函数中字符计数不正确的问题。[#71003](https://github.com/ClickHouse/ClickHouse/pull/71003)（[思维](https://github.com/heymind)）。
* 由于未处理的部分权限撤销，`RESTORE` 针对访问实体的操作所需权限超出了必要范围。此 PR 修复了该问题。关闭 [#71853](https://github.com/ClickHouse/ClickHouse/issues/71853)。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958)（[pufit](https://github.com/pufit)）。
* 避免在执行 `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 后出现停顿。正确获取后台任务调度的相关设置。[#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 修复在某些输入和输出格式（如 Parquet、Arrow）中对空元组的处理。[#72616](https://github.com/ClickHouse/ClickHouse/pull/72616)（[Michael Kolupaev](https://github.com/al13n321)）。
* 现在，在通配符数据库/表上执行列级 GRANT SELECT/INSERT 语句会抛出错误。[#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan))。
* 修复用户由于目标访问实体中的隐式授权而无法执行 `REVOKE ALL ON *.*` 的问题。[#72872](https://github.com/ClickHouse/ClickHouse/pull/72872)（[pufit](https://github.com/pufit)）。
* 修复 `formatDateTime` 标量函数对正时区偏移量的格式化。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* 修复在通过 PROXYv1 建立连接且设置了 `auth_use_forwarded_address` 时，源端口反映不正确的问题——此前错误地使用了代理端口。新增 `currentQueryID()` 函数。[#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 TCPHandler 中将格式设置传递给 NativeWriter，从而确保诸如 `output_format_native_write_json_as_string` 之类的设置能够被正确应用。[#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复 StorageObjectStorageQueue 中的崩溃问题。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复在服务器关闭期间可刷新物化视图中发生的罕见崩溃。[#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321))。
* 函数 `formatDateTime` 的 `%f` 占位符现在无条件生成 6 位小数（秒的小数部分）。这使其行为与 MySQL 的 `DATE_FORMAT` 函数兼容。可以通过将设置 `formatdatetime_f_prints_scale_number_of_digits` 设为 `1` 来恢复此前的行为。[#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese))。
* 修复了从 `s3` 存储和表函数读取时按 `_etag` 列进行过滤的问题。[#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 修复在旧分析器中，当在 `JOIN ON` 表达式中使用 `IN (subquery)` 时出现的 `Not-ready Set is passed as the second argument for function 'in'` 错误。[#73382](https://github.com/ClickHouse/ClickHouse/pull/73382)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 修复为 Dynamic 和 JSON 列准备压缩合并（squash）时的处理逻辑。此前在某些情况下，即使尚未达到类型 / 路径数量限制，新的类型仍可能被插入到 shared variant/shared data 中。[#73388](https://github.com/ClickHouse/ClickHouse/pull/73388)（[Pavel Kruglov](https://github.com/Avogar)）。
* 在对类型进行二进制解码时检查损坏的大小信息，以避免过大的内存分配。[#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复了在启用并行副本时，从单副本集群读取数据时的逻辑错误。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321)).
* 修复在搭配 ZooKeeper 和旧版 Keeper 使用时的 ObjectStorageQueue。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* 实现了修复，使得可以默认启用 hive 分区。[#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 修复创建向量相似度索引时的数据竞争。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了当字典的源包含数据错误的函数时导致的段错误（segfault）。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复 storage S3(Azure)Queue 中插入失败后的重试机制。关闭关联问题 [#70951](https://github.com/ClickHouse/ClickHouse/issues/70951)。[#73546](https://github.com/ClickHouse/ClickHouse/pull/73546)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 修复了在启用 `optimize_functions_to_subcolumns` 设置时，对于包含 `LowCardinality` 元素的元组，函数 `tupleElement` 在某些情况下可能出现的错误。[#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在枚举 `glob` 之后紧跟 `range one` 时的解析问题。修复 [#73473](https://github.com/ClickHouse/ClickHouse/issues/73473)。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 修复在非复制表的子查询中忽略 parallel&#95;replicas&#95;for&#95;non&#95;replicated&#95;merge&#95;tree 设置的问题。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* 修复在任务无法调度时抛出的 `std::logical_error`。该问题在压力测试中被发现。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger))。
* 在 `EXPLAIN SYNTAX` 中不要对查询进行语义解释，以避免因对分布式查询选择了错误的处理阶段而导致逻辑错误。修复了 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205)。[#73634](https://github.com/ClickHouse/ClickHouse/pull/73634)（[Dmitry Novik](https://github.com/novikd)）。
* 修复 Dynamic 列中可能的数据不一致问题。修复可能出现的逻辑错误 `Nested columns sizes are inconsistent with local_discriminators column size`。 [#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar))。
* 修复了在带有 `FINAL` 和 `SAMPLE` 的查询中出现的 `NOT_FOUND_COLUMN_IN_BLOCK` 错误。修复了在从 `CollapsingMergeTree` 读取数据时使用 `FINAL` 的查询结果不正确的问题，并启用了针对 `FINAL` 的优化。[#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ))。
* 修复在 LIMIT BY COLUMNS 子句中的崩溃问题。[#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 修复了这样一个 Bug：在强制使用普通 projection 时，即使查询与定义的 projection 完全相同，却没有选中该 projection，导致报错的问题。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* 修复 Dynamic/Object 结构的反序列化问题。该问题可能会导致出现 CANNOT&#95;READ&#95;ALL&#95;DATA 异常。[#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* 在从备份恢复分片时跳过 `metadata_version.txt` 文件。[#73768](https://github.com/ClickHouse/ClickHouse/pull/73768)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 修复在使用 LIKE 将值 Cast 为 Enum 时出现的段错误。[#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar))。
* 修复 S3 Express 存储桶无法作为磁盘使用的问题。[#73777](https://github.com/ClickHouse/ClickHouse/pull/73777)（[Sameer Tamsekar](https://github.com/stamsekar)）。
* 允许在 CollapsingMergeTree 表中合并具有无效的 sign 列值的行。[#73864](https://github.com/ClickHouse/ClickHouse/pull/73864)（[Christoph Wurm](https://github.com/cwurm)）。
* 修复在存在离线副本时查询 DDL 出错的问题。[#73876](https://github.com/ClickHouse/ClickHouse/pull/73876)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 修复了在比较 `map()` 类型时偶发失败的问题，该问题是由于可以创建其嵌套 tuple 中未对字段（&#39;keys&#39;、&#39;values&#39;）进行显式命名的 `Map` 所导致。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在解析 `GROUP BY ALL` 子句时忽略窗口函数。修复 [#73501](https://github.com/ClickHouse/ClickHouse/issues/73501)。[#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 修复隐式权限（之前起到通配符的作用）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* 修复在创建嵌套 `Map` 时的高内存占用问题。[#73982](https://github.com/ClickHouse/ClickHouse/pull/73982)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修复解析包含空键名的嵌套 JSON 时的问题。[#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修复：当某个别名被另一个别名引用并在 SELECT 中按相反顺序被选择时，可能不会被添加到 projection 中。[#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 在 Azure 上初始化 plain&#95;rewritable 磁盘时忽略对象未找到错误。[#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva))。
* 修复 `any` 和 `anyLast` 在处理枚举类型和空表时的行为。[#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x))。
* 修复了当用户在 Kafka 表引擎中指定关键字参数时出现的异常情况。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复在将存储引擎 `S3Queue` 的设置在带有 &quot;s3queue&#95;&quot; 前缀和不带此前缀之间相互转换时的问题。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 添加设置 `allow_push_predicate_ast_for_distributed_subqueries`。这为使用 analyzer 的分布式查询提供了基于 AST 的谓词下推能力。这是一个临时解决方案，在支持带查询计划序列化的分布式查询之前将采用该方案。修复 [#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718)。 [#74085](https://github.com/ClickHouse/ClickHouse/pull/74085) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 修复了在 [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) 之后，`forwarded_for` 字段中可能包含端口，从而导致无法解析带端口的主机名的问题。[#74116](https://github.com/ClickHouse/ClickHouse/pull/74116)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 修复了 `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` 的错误格式。[#74126](https://github.com/ClickHouse/ClickHouse/pull/74126)（[Han Fei](https://github.com/hanfei1991)）。
* 修复问题 [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112)。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 在 `CREATE TABLE` 中已无法再将 `Loop` 用作表引擎。此前这种组合会导致段错误。 [#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 修复 `postgresql` 和 `sqlite` 表函数中的安全问题，防止 SQL 注入攻击。[#74144](https://github.com/ClickHouse/ClickHouse/pull/74144)（[Pablo Marcos](https://github.com/pamarcos)）。
* 修复从压缩的 Memory 引擎表读取子列时发生的崩溃。修复了 [#74009](https://github.com/ClickHouse/ClickHouse/issues/74009)。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* 修复在查询 system.detached&#95;tables 时出现的无限循环问题。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov))。
* 在将文件设置为失败状态时，修复 `s3queue` 中的逻辑错误。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 修复从基础备份执行 `RESTORE` 时的原生复制设置（`allow_s3_native_copy`/`allow_azure_native_copy`）。[#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* 修复了当数据库中分离表的数量为 max&#95;block&#95;size 的整数倍时出现的问题。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* 修复通过对象存储（如 S3）进行复制时，当源端和目标端凭证不同时出现的问题。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* 修复在 GCS 上进行原生复制时对“在 JSON API 中使用 Rewrite 方法”的检测。[#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* 修复 `BackgroundMergesAndMutationsPoolSize` 计算不正确的问题（之前计算结果为实际值的 2 倍）。[#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin))。
* 修复在启用 Cluster Discovery 时导致 keeper watches 泄漏的问题。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* 修复 UBSan 报告的内存对齐问题 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。[#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* 修复在创建表时 KeeperMap 并发清理的问题。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* 当查询中包含 `EXCEPT` 或 `INTERSECT` 时，不要在子查询中删除未使用的投影列，以确保查询结果正确。修复 [#73930](https://github.com/ClickHouse/ClickHouse/issues/73930)。修复 [#66465](https://github.com/ClickHouse/ClickHouse/issues/66465)。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* 修复了在启用稀疏序列化时，包含 `Tuple` 列的表之间执行 `INSERT SELECT` 查询时出现的问题。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 函数 `right` 在负的常量偏移量情况下行为不正确。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik)).
* 修复由于客户端解压缩缺陷导致 gzip 压缩后的数据插入有时失败的问题。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* 带有通配符授权的部分撤销可能会撤销超出预期范围的权限。修复 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263)。[#74751](https://github.com/ClickHouse/ClickHouse/pull/74751)（[pufit](https://github.com/pufit)）。
* Keeper 修复：修正从磁盘读取日志记录的问题。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* 修复了对 SYSTEM REFRESH/START/STOP VIEW 权限检查的逻辑，现在在对某个特定 VIEW 执行查询时，不再需要在 `*.*` 上拥有该权限，只需对该 VIEW 本身授予权限即可。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `hasColumnInTable` 函数目前不会考虑别名列。对其进行修复，使其也支持别名列。 [#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* 修复在 Azure Blob Storage 中，对包含空列的表执行数据部分合并时出现的 FILE&#95;DOESNT&#95;EXIST 错误。[#74892](https://github.com/ClickHouse/ClickHouse/pull/74892)（[Julia Kartseva](https://github.com/jkartseva)）。
* 在连接临时表时修正投影列名，关闭 [#68872](https://github.com/ClickHouse/ClickHouse/issues/68872)。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。

#### 构建/测试/打包优化

* 通用安装脚本现在即使在 macOS 上也会提示安装。[#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).