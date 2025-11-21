---
slug: /use-cases/observability/clickstack/migration/elastic/concepts
title: 'ClickStack 与 Elastic 中的对应概念'
pagination_prev: null
pagination_next: null
sidebar_label: '对应概念'
sidebar_position: 1
description: '对应概念 - ClickStack 与 Elastic'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import elasticsearch from '@site/static/images/use-cases/observability/elasticsearch.png';
import clickhouse from '@site/static/images/use-cases/observability/clickhouse.png';
import clickhouse_execution from '@site/static/images/use-cases/observability/clickhouse-execution.png';
import elasticsearch_execution from '@site/static/images/use-cases/observability/elasticsearch-execution.png';
import elasticsearch_transforms from '@site/static/images/use-cases/observability/es-transforms.png';
import clickhouse_mvs from '@site/static/images/use-cases/observability/ch-mvs.png';


## Elastic Stack 与 ClickStack 对比 {#elastic-vs-clickstack}

Elastic Stack 和 ClickStack 都涵盖了可观测性平台的核心功能,但它们采用了不同的设计理念来实现这些功能。这些核心功能包括:

- **UI 和告警**:用于查询数据、构建仪表板和管理告警的工具。
- **存储和查询引擎**:负责存储可观测性数据并提供分析查询服务的后端系统。
- **数据收集和 ETL**:收集遥测数据并在摄取前进行处理的代理和管道。

下表概述了每个技术栈如何将其组件映射到这些功能:

| **功能**                    | **Elastic Stack**                                           | **ClickStack**                                                   | **说明**                                                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI 和告警**           | **Kibana** — 仪表板、搜索和告警                 | **HyperDX** — 实时 UI、搜索和告警                   | 两者都作为用户的主要界面,包括可视化和告警管理。HyperDX 专为可观测性而构建,与 OpenTelemetry 语义紧密集成。                          |
| **存储和查询引擎**  | **Elasticsearch** — 带倒排索引的 JSON 文档存储 | **ClickHouse** — 带向量化引擎的列式数据库 | Elasticsearch 使用针对搜索优化的倒排索引;ClickHouse 使用列式存储和 SQL 对结构化和半结构化数据进行高速分析。                                            |
| **数据收集**         | **Elastic Agent**、**Beats**(如 Filebeat、Metricbeat)    | **OpenTelemetry Collector**(边缘 + 网关)                     | Elastic 支持自定义数据采集器和由 Fleet 管理的统一代理。ClickStack 依赖 OpenTelemetry,实现供应商中立的数据收集和处理。                                                |
| **插桩 SDK**    | **Elastic APM agents**(专有)                        | **OpenTelemetry SDKs**(由 ClickStack 分发)               | Elastic SDK 与 Elastic 技术栈绑定。ClickStack 基于 OpenTelemetry SDK 构建,支持主流语言的日志、指标和追踪。                                                                             |
| **ETL / 数据处理**   | **Logstash**、摄取管道                              | **OpenTelemetry Collector** + ClickHouse 物化视图      | Elastic 使用摄取管道和 Logstash 进行转换。ClickStack 通过物化视图和 OTel 收集器处理器将计算转移到插入时执行,实现高效的增量数据转换。 |
| **架构理念** | 垂直集成、专有代理和格式       | 基于开放标准、松耦合组件                  | Elastic 构建了一个紧密集成的生态系统。ClickStack 强调模块化和标准(OpenTelemetry、SQL、对象存储),以实现灵活性和成本效益。                                           |

ClickStack 强调开放标准和互操作性,从数据收集到 UI 完全原生支持 OpenTelemetry。相比之下,Elastic 提供了一个紧密耦合但更加垂直集成的生态系统,使用专有代理和格式。

鉴于 **Elasticsearch** 和 **ClickHouse** 是各自技术栈中负责数据存储、处理和查询的核心引擎,理解它们之间的差异至关重要。这些系统支撑着整个可观测性架构的性能、可扩展性和灵活性。以下部分将探讨 Elasticsearch 和 ClickHouse 之间的关键差异,包括它们如何建模数据、处理摄取、执行查询以及管理存储。


## Elasticsearch vs ClickHouse {#elasticsearch-vs-clickhouse}

ClickHouse 和 Elasticsearch 使用不同的底层模型来组织和查询数据,但许多核心概念的作用相似。本节为熟悉 Elastic 的用户概述了关键的对应关系,将它们映射到 ClickHouse 中的对应概念。虽然术语不同,但大多数可观测性工作流都可以在 ClickStack 中重现——而且通常效率更高。

### 核心结构概念 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL**   | **描述**                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field**         | **Column**             | 数据的基本单元,保存一个或多个特定类型的值。Elasticsearch 字段可以存储基本类型以及数组和对象。字段只能有一种类型。ClickHouse 也支持数组和对象(`Tuples`、`Maps`、`Nested`),以及动态类型如 [`Variant`](/sql-reference/data-types/variant) 和 [`Dynamic`](/sql-reference/data-types/dynamic),这些类型允许列具有多种类型。              |
| **Document**      | **Row**                | 字段(列)的集合。Elasticsearch 文档默认更加灵活,可以根据数据动态添加新字段(类型从数据中推断)。ClickHouse 行默认受模式约束,用户需要插入行的所有列或部分列。ClickHouse 中的 [`JSON`](/integrations/data-formats/json/overview) 类型支持基于插入数据的等效半结构化动态列创建。 |
| **Index**         | **Table**              | 查询执行和存储的单元。在两个系统中,查询都针对索引或表运行,它们存储行/文档。                                                                                                                                                                                                                                                                                                                                       |
| _Implicit_        | Schema (SQL)           | SQL 模式将表分组到命名空间中,通常用于访问控制。Elasticsearch 和 ClickHouse 没有模式概念,但两者都通过角色和 RBAC 支持行级和表级安全性。                                                                                                                                                                                                                                                        |
| **Cluster**       | **Cluster / Database** | Elasticsearch 集群是管理一个或多个索引的运行时实例。在 ClickHouse 中,数据库在逻辑命名空间内组织表,提供与 Elasticsearch 中集群相同的逻辑分组。ClickHouse 集群是分布式节点集,与 Elasticsearch 类似,但与数据本身解耦且相互独立。                                                                                           |

### 数据建模和灵活性 {#data-modeling-and-flexibility}

Elasticsearch 以其通过[动态映射](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping)实现的模式灵活性而闻名。字段在文档摄取时创建,类型自动推断——除非指定了模式。ClickHouse 默认更严格——表使用显式模式定义——但通过 [`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant) 和 [`JSON`](/integrations/data-formats/json/overview) 类型提供灵活性。这些类型支持半结构化数据的摄取,具有类似于 Elasticsearch 的动态列创建和类型推断功能。同样,[`Map`](/sql-reference/data-types/map) 类型允许存储任意键值对——尽管键和值都强制使用单一类型。

ClickHouse 的类型灵活性方法更加透明和可控。与 Elasticsearch 不同(类型冲突可能导致摄取错误),ClickHouse 允许在 [`Variant`](/sql-reference/data-types/variant) 列中使用混合类型数据,并通过使用 [`JSON`](/integrations/data-formats/json/overview) 类型支持模式演化。

如果不使用 [`JSON`](/integrations/data-formats/json/overview),模式是静态定义的。如果未为行提供值,它们将被定义为 [`Nullable`](/sql-reference/data-types/nullable)(在 ClickStack 中不使用)或恢复为该类型的默认值,例如 `String` 的空值。

### 摄取和转换 {#ingestion-and-transformation}

Elasticsearch 使用带有处理器(例如 `enrich`、`rename`、`grok`)的摄取管道在索引之前转换文档。在 ClickHouse 中,类似的功能通过[**增量物化视图**](/materialized-view/incremental-materialized-view)实现,它可以对传入数据进行[过滤、转换](/materialized-view/incremental-materialized-view#filtering-and-transformation)或[丰富](/materialized-view/incremental-materialized-view#lookup-table),并将结果插入目标表。如果只需要存储物化视图的输出,还可以将数据插入 `Null` 表引擎。这意味着只保留物化视图的结果,而原始数据被丢弃——从而节省存储空间。


对于数据增强,Elasticsearch 支持专用的 [enrich processors](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor) 来为文档添加上下文信息。在 ClickHouse 中,[**字典**](/dictionary) 可以在 [查询时](/dictionary#query-time-enrichment) 和 [数据摄取时](/dictionary#index-time-enrichment) 用于增强行数据 - 例如,[将 IP 地址映射到地理位置](/use-cases/observability/schema-design#using-ip-dictionaries) 或在插入时应用 [用户代理解析](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)。

### 查询语言 {#query-languages}

Elasticsearch 支持 [多种查询语言](https://www.elastic.co/docs/explore-analyze/query-filter/languages),包括 [DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql) 和 [KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)(Lucene 风格)查询,但对连接操作的支持有限 — 仅通过 [`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join) 支持**左外连接**。ClickHouse 支持**完整的 SQL 语法**,包括 [所有连接类型](/sql-reference/statements/select/join#supported-types-of-join)、[窗口函数](/sql-reference/window-functions)、子查询(包括关联子查询)和公用表表达式(CTE)。对于需要关联可观测性信号与业务或基础设施数据的用户来说,这是一个重要优势。

在 ClickStack 中,[HyperDX 提供了与 Lucene 兼容的搜索界面](/use-cases/observability/clickstack/search) 以便于迁移过渡,同时通过 ClickHouse 后端提供完整的 SQL 支持。此语法与 [Elastic 查询字符串](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 语法类似。有关此语法的详细比较,请参阅 ["在 ClickStack 和 Elastic 中搜索"](/use-cases/observability/clickstack/migration/elastic/search)。

### 文件格式和接口 {#file-formats-and-interfaces}

Elasticsearch 支持 JSON(以及 [有限的 CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor))数据摄取。ClickHouse 支持超过 **70 种文件格式**,包括 Parquet、Protobuf、Arrow、CSV 等 — 同时支持数据摄取和导出。这使得与外部数据管道和工具的集成更加便捷。

两个系统都提供 REST API,但 ClickHouse 还提供了用于低延迟、高吞吐量交互的**原生协议**。原生接口在查询进度跟踪、压缩和流式传输方面比 HTTP 更高效,并且是大多数生产环境数据摄取的默认选择。

### 索引和存储 {#indexing-and-storage}

<Image img={elasticsearch} alt='Elasticsearch' size='lg' />

分片概念是 Elasticsearch 可扩展性模型的基础。每个 ① [**索引**](https://www.elastic.co/blog/what-is-an-elasticsearch-index) 被划分为**分片**,每个分片都是一个物理的 Lucene 索引,以段(segment)的形式存储在磁盘上。一个分片可以有一个或多个物理副本,称为副本分片,用于提供容错能力。为了实现可扩展性,分片和副本可以分布在多个节点上。单个分片 ② 由一个或多个不可变段组成。段是 Lucene 的基本索引结构,Lucene 是为 Elasticsearch 提供索引和搜索功能的 Java 库。

:::note Elasticsearch 中的插入处理
Ⓐ 新插入的文档 Ⓑ 首先进入内存索引缓冲区,默认情况下每秒刷新一次。使用路由公式来确定刷新文档的目标分片,并在磁盘上为该分片写入新段。为了提高查询效率并实现已删除或已更新文档的物理删除,段会在后台持续合并为更大的段,直到达到 5 GB 的最大大小。不过,也可以强制合并为更大的段。
:::


Elasticsearch 建议将分片大小控制在大约 [50 GB 或 2 亿个文档](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards)，原因是 [JVM 堆和元数据开销](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead)。此外，每个分片还有一个 [20 亿文档的硬性上限](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit)。Elasticsearch 会在分片之间并行化查询，但每个分片只使用**单线程**进行处理，使得过度分片既昂贵又适得其反。这从根本上将分片与扩展能力紧密耦合，要提升性能就需要更多分片（和节点）。

Elasticsearch 会将所有字段索引到 [**倒排索引**](https://www.elastic.co/docs/manage-data/data-store/index-basics) 中以实现快速搜索，并可选地使用 [**doc values**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) 用于聚合、排序以及脚本字段访问。数值和地理字段使用 [Block K-D trees](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) 来支持对地理空间数据以及数值和日期范围的搜索。 

更重要的是，Elasticsearch 会在 [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) 中存储完整的原始文档（使用 `LZ4`、`Deflate` 或 `ZSTD` 压缩），而 ClickHouse 不会存储单独的文档表示形式。数据会在查询时从列中重建，从而节省存储空间。对于 Elasticsearch，可以通过 [Synthetic `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) 实现类似能力，但存在一些[限制](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)。禁用 `_source` 还有一些 [影响](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude)，这些在 ClickHouse 中并不存在。

在 Elasticsearch 中，[索引映射](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（相当于 ClickHouse 中的表结构）控制字段类型以及用于持久化和查询的数据结构。

相比之下，ClickHouse 是**列式存储**——每一列独立存储，但始终按表的主键/排序键排序。这样的排序支持使用 [稀疏主键索引](/primary-indexes)，使 ClickHouse 能在查询执行过程中高效跳过无关数据。当查询根据主键字段进行过滤时，ClickHouse 只会读取每列中相关的部分，大幅减少磁盘 I/O 并提升性能——即使并未为每一列构建完整索引。 

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse 还支持 [**跳过索引**](/optimize/skipping-indexes)，通过为选定列预计算索引数据来加速过滤。这些索引需要显式定义，但可以显著提升性能。此外，ClickHouse 允许用户为每一列指定 [compression codecs](/use-cases/observability/schema-design#using-codecs) 和压缩算法——这是 Elasticsearch 所不支持的（其 [compression](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) 仅适用于 `_source` JSON 存储）。

ClickHouse 同样支持分片，但其模型旨在优先支持**纵向扩展**。单个分片可以存储**数万亿行**数据，并且只要内存、CPU 和磁盘资源允许，就能持续高效运行。与 Elasticsearch 不同，ClickHouse 中每个分片**没有硬性行数上限**。ClickHouse 中的分片是逻辑概念——实质上是独立的表——且仅当数据集超过单节点容量时才需要进行分区。通常这是由于磁盘容量限制，只有在必须进行横向扩展时才会引入分片①，从而降低复杂度和开销。在这种情况下，与 Elasticsearch 类似，一个分片会保存数据的一个子集。单个分片中的数据被组织为 ② 不可变数据部分的集合，这些部分内部包含 ③ 若干数据结构。

在 ClickHouse 分片内部，处理是**完全并行化**的，并鼓励用户优先进行纵向扩展，以避免在节点之间移动数据所带来的网络成本。 



:::note ClickHouse 中的插入处理
ClickHouse 中的插入操作**默认为同步模式** — 只有在提交后才会确认写入 — 但可以配置为**异步插入**以实现类似 Elastic 的缓冲和批处理机制。如果使用[异步数据插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse),Ⓐ 新插入的行首先进入 Ⓑ 内存插入缓冲区,默认每 200 毫秒刷新一次。如果使用多个分片,则通过[分布式表](/engines/table-engines/special/distributed)将新插入的行路由到目标分片。分片会在磁盘上写入一个新的数据部分。
:::

### 分布与复制 {#distribution-and-replication}

虽然 Elasticsearch 和 ClickHouse 都使用集群、分片和副本来确保可扩展性和容错性,但它们的模型在实现方式和性能特征方面存在显著差异。

Elasticsearch 使用**主从**模型进行复制。当数据写入主分片时,会同步复制到一个或多个副本。这些副本本身是分布在各个节点上的完整分片,以确保冗余。Elasticsearch 仅在所有必需的副本确认操作后才确认写入 — 这种模型提供接近**顺序一致性**的保证,尽管在完全同步之前可能从副本读取到**脏数据**。**主节点**负责协调集群,管理分片分配、健康状况和领导者选举。

相反,ClickHouse 默认采用**最终一致性**,由 **Keeper** 协调 - 这是 ZooKeeper 的轻量级替代方案。写入可以直接发送到任何副本,或通过[**分布式表**](/engines/table-engines/special/distributed)发送,后者会自动选择副本。复制是异步的 - 在确认写入后,更改会传播到其他副本。为了获得更严格的保证,ClickHouse [支持**顺序一致性**](/migrations/postgresql/appendix#sequential-consistency),即只有在跨副本提交后才确认写入,尽管由于性能影响,这种模式很少使用。分布式表统一了对多个分片的访问,将 `SELECT` 查询转发到所有分片并合并结果。对于 `INSERT` 操作,它们通过在分片之间均匀路由数据来平衡负载。ClickHouse 的复制非常灵活:任何副本(分片的副本)都可以接受写入,所有更改都会异步同步到其他副本。这种架构允许在故障或维护期间不间断地提供查询服务,重新同步会自动处理 - 无需在数据层强制执行主从关系。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中,架构引入了无共享计算模型,其中单个**分片由对象存储支持**。这取代了传统的基于副本的高可用性方案,允许分片**同时被多个节点读取和写入**。存储和计算的分离实现了弹性扩展,无需显式管理副本。
:::

总结:

- **Elastic**: 分片是与 JVM 内存绑定的物理 Lucene 结构。过度分片会带来性能损失。复制是同步的,由主节点协调。
- **ClickHouse**: 分片是逻辑的且可垂直扩展,具有高效的本地执行能力。复制是异步的(但可以是顺序的),协调是轻量级的。

最终,ClickHouse 通过最小化分片调优的需求来实现大规模场景下的简单性和高性能,同时在需要时仍提供强一致性保证。

### 去重与路由 {#deduplication-and-routing}

Elasticsearch 根据文档的 `_id` 进行去重,并相应地将它们路由到分片。ClickHouse 不存储默认的行标识符,但支持**插入时去重**,允许用户安全地重试失败的插入。为了获得更多控制,`ReplacingMergeTree` 和其他表引擎支持按特定列进行去重。

Elasticsearch 中的索引路由确保特定文档始终路由到特定分片。在 ClickHouse 中,用户可以定义**分片键**或使用 `Distributed` 表来实现类似的数据局部性。

### 聚合与执行模型 {#aggregations-execution-model}

虽然两个系统都支持数据聚合,但 ClickHouse 提供了显著[更多的函数](/sql-reference/aggregate-functions/reference),包括统计、近似和专门的分析函数。

在可观测性用例中,聚合最常见的应用之一是统计特定日志消息或事件发生的频率(并在频率异常时发出警报)。

在 Elasticsearch 中,与 ClickHouse 的 `SELECT count(*) FROM ... GROUP BY ...` SQL 查询等效的是 [terms 聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html),这是一种 Elasticsearch [桶聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)。

ClickHouse 的 `GROUP BY` 配合 `count(*)` 与 Elasticsearch 的 terms 聚合在功能上通常是等效的,但它们在实现方式、性能和结果质量方面存在很大差异。


当查询数据跨越多个分片时,Elasticsearch 中的此聚合会[在"top-N"查询中估算结果](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)(例如,按计数排名前 10 的主机)。这种估算提高了速度,但可能会影响准确性。用户可以通过[检查 `doc_count_error_upper_bound`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error) 并增加 `shard_size` 参数来减少此误差——但代价是增加内存使用量和降低查询性能。

Elasticsearch 还要求所有分桶聚合都设置 [`size` 参数](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)——如果不显式设置限制,就无法返回所有唯一分组。高基数聚合可能会触及 [`max_buckets` 限制](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets),或者需要使用[复合聚合](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation)进行分页,这通常既复杂又低效。

相比之下,ClickHouse 开箱即用地执行精确聚合。像 `count(*)` 这样的函数无需配置调整即可返回准确结果,使查询行为更简单、更可预测。

ClickHouse 不施加大小限制。您可以对大型数据集执行无界的 group-by 查询。如果超出内存阈值,ClickHouse [可以溢出到磁盘](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)。按主键前缀分组的聚合特别高效,通常以最小的内存消耗运行。

#### 执行模型 {#execution-model}

上述差异可归因于 Elasticsearch 和 ClickHouse 的执行模型,它们在查询执行和并行处理方面采用了根本不同的方法。

ClickHouse 旨在最大化现代硬件的效率。默认情况下,ClickHouse 在具有 N 个 CPU 核心的机器上使用 N 个并发执行通道运行 SQL 查询:

<Image img={clickhouse_execution} alt='ClickHouse 执行' size='lg' />

在单个节点上,执行通道将数据拆分为独立的范围,允许跨 CPU 线程并发处理。这包括过滤、聚合和排序。每个通道的本地结果最终会被合并,如果查询包含 limit 子句,则会应用 limit 运算符。

查询执行通过以下方式进一步并行化:

1. **SIMD 向量化**:对列式数据的操作使用 [CPU SIMD 指令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)(例如 [AVX512](https://en.wikipedia.org/wiki/AVX-512)),允许批量处理值。
2. **集群级并行**:在分布式设置中,每个节点在本地执行查询处理。[部分聚合状态](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)会流式传输到发起节点并进行合并。如果查询的 `GROUP BY` 键与分片键对齐,则可以[最小化或完全避免](/operations/settings/settings#distributed_group_by_no_merge)合并。
   <br />
   此模型能够在核心和节点之间高效扩展,使
   ClickHouse 非常适合大规模分析。使用*部分
   聚合状态*允许合并来自不同线程和
   节点的中间结果而不损失准确性。

相比之下,Elasticsearch 对于大多数聚合,无论有多少个 CPU 核心可用,都为每个分片分配一个线程。这些线程返回分片本地的 top-N 结果,然后在协调节点进行合并。这种方法可能会导致系统资源利用不足,并在全局聚合中引入潜在的不准确性,特别是当高频词项分布在多个分片上时。可以通过增加 `shard_size` 参数来提高准确性,但代价是更高的内存使用量和查询延迟。

<Image img={elasticsearch_execution} alt='Elasticsearch 执行' size='lg' />

总之,ClickHouse 以更细粒度的并行性和对硬件资源的更强控制来执行聚合和查询,而 Elasticsearch 依赖于基于分片的执行,具有更严格的约束。

有关各技术中聚合机制的更多详细信息,我们推荐阅读博客文章 ["ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)。

### 数据管理 {#data-management}

Elasticsearch 和 ClickHouse 在管理时间序列可观测性数据方面采用了根本不同的方法——特别是在数据保留、滚动更新和分层存储方面。


#### 索引生命周期管理与原生 TTL {#lifecycle-vs-ttl}

在 Elasticsearch 中,长期数据管理通过**索引生命周期管理 (ILM)** 和**数据流**来处理。这些功能允许用户定义策略,控制索引何时滚动(例如达到特定大小或使用时长后)、何时将旧索引移动到低成本存储(例如温层或冷层)以及何时最终删除。这是必要的,因为 Elasticsearch **不支持重新分片**,且分片不能无限增长而不出现性能下降。为了管理分片大小并支持高效删除,必须定期创建新索引并删除旧索引——实际上是在索引级别进行数据轮换。

ClickHouse 采用不同的方法。数据通常存储在**单个表**中,并使用列级或分区级的 **TTL(生存时间)表达式**进行管理。数据可以**按日期分区**,允许高效删除而无需创建新表或执行索引滚动。当数据老化并满足 TTL 条件时,ClickHouse 会自动删除它——无需额外的基础设施来管理轮换。

#### 存储层级和热温架构 {#storage-tiers}

Elasticsearch 支持**热-温-冷-冻结**存储架构,其中数据在具有不同性能特征的存储层之间移动。这通常通过 ILM 配置,并与集群中的节点角色绑定。

ClickHouse 通过原生表引擎(如 `MergeTree`)支持**分层存储**,可以根据自定义规则自动在不同**卷**之间移动旧数据(例如从 SSD 到 HDD 再到对象存储)。这可以模拟 Elastic 的热-温-冷方法——但无需管理多个节点角色或集群的复杂性。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中,这变得更加无缝:所有数据都存储在**对象存储(例如 S3)** 上,计算与存储解耦。数据可以保留在对象存储中直到被查询,此时会被获取并在本地(或分布式缓存中)缓存——提供与 Elastic 冻结层相同的成本特征,但具有更好的性能特性。这种方法意味着无需在存储层之间移动数据,使热温架构变得多余。
:::

### 汇总与增量聚合 {#rollups-vs-incremental-aggregates}

在 Elasticsearch 中,**汇总**或**聚合**是通过一种称为 [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html) 的机制实现的。这些用于使用**滑动窗口**模型以固定间隔(例如每小时或每天)汇总时间序列数据。它们被配置为定期后台作业,从一个索引聚合数据并将结果写入单独的**汇总索引**。这通过避免重复扫描高基数原始数据来帮助降低长期查询的成本。

以下图表抽象地展示了 transforms 的工作原理(注意我们对属于同一桶的所有文档使用蓝色,我们希望为这些文档预先计算聚合值):

<Image
  img={elasticsearch_transforms}
  alt='Elasticsearch transforms'
  size='lg'
/>

连续 transforms 使用基于可配置检查间隔时间的 transform [检查点](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)(transform [频率](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html),默认值为 1 分钟)。在上图中,我们假设 ① 在检查间隔时间过后创建了一个新检查点。现在 Elasticsearch 检查 transforms 源索引中的更改,并检测到自上一个检查点以来存在的三个新 `blue` 文档(11、12 和 13)。因此,源索引被过滤以获取所有现有的 `blue` 文档,并通过[复合聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)(以利用结果[分页](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html))重新计算聚合值(目标索引会更新为一个文档,替换包含先前聚合值的文档)。类似地,在 ② 和 ③ 处,通过检查更改并从属于同一 'blue' 桶的所有现有文档重新计算聚合值来处理新检查点。

ClickHouse 采用根本不同的方法。ClickHouse 不是定期重新聚合数据,而是支持**增量物化视图**,在**插入时**转换和聚合数据。当新数据写入源表时,物化视图仅对新**插入的块**执行预定义的 SQL 聚合查询,并将聚合结果写入目标表。


此模型得益于 ClickHouse 对[**部分聚合状态**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)的支持——聚合函数的中间表示形式,可以存储并在之后合并。这使用户能够维护部分聚合的结果,查询速度快且更新成本低。由于聚合在数据到达时即发生,因此无需运行昂贵的定期作业或重新汇总旧数据。

我们抽象地描述增量物化视图的工作机制(注意,我们对所有属于同一组的行使用蓝色标识,这些行是我们需要预先计算聚合值的对象):

<Image img={clickhouse_mvs} alt='ClickHouse 物化视图' size='lg' />

在上图中,物化视图的源表已经包含一个数据部分,存储了属于同一组的一些 `blue` 行(1 到 10)。对于该组,视图的目标表中也已经存在一个数据部分,存储了 `blue` 组的[部分聚合状态](https://www.youtube.com/watch?v=QDAJTKZT8y4)。当 ① ② ③ 向源表插入新行时,每次插入都会创建相应的源表数据部分,同时,针对每个新插入的行块,会计算部分聚合状态并以数据部分的形式插入到物化视图的目标表中。④ 在后台部分合并期间,部分聚合状态会被合并,从而实现增量数据聚合。

请注意,所有[聚合函数](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)(超过 90 个),包括它们与聚合函数[组合器](https://www.youtube.com/watch?v=7ApwD0cfAFI)的组合,均支持[部分聚合状态](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)。

有关 Elasticsearch 与 ClickHouse 在增量聚合方面的更具体示例,请参阅此[示例](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)。

ClickHouse 方法的优势包括:

- **始终保持最新的聚合**:物化视图始终与源表保持同步。
- **无需后台作业**:聚合在插入时执行而非查询时执行。
- **更优的实时性能**:非常适合需要即时获取最新聚合的可观测性工作负载和实时分析场景。
- **可组合**:物化视图可以分层或与其他视图和表连接,以实现更复杂的查询加速策略。
- **不同的 TTL**:可以对物化视图的源表和目标表应用不同的 TTL 设置。

此模型对于可观测性用例特别强大,用户需要计算诸如每分钟错误率、延迟或 top-N 分解等指标,而无需在每次查询时扫描数十亿条原始记录。

### 湖仓支持 {#lakehouse-support}

ClickHouse 和 Elasticsearch 在湖仓集成方面采用了根本不同的方法。ClickHouse 是一个成熟的查询执行引擎,能够对湖仓格式(如 [Iceberg](/sql-reference/table-functions/iceberg) 和 [Delta Lake](/sql-reference/table-functions/deltalake))执行查询,并与数据湖目录(如 [AWS Glue](/use-cases/data-lake/glue-catalog) 和 [Unity catalog](/use-cases/data-lake/unity-catalog))集成。这些格式依赖于对 [Parquet](/interfaces/formats/Parquet) 文件的高效查询,ClickHouse 完全支持此功能。ClickHouse 可以直接读取 Iceberg 和 Delta Lake 表,实现与现代数据湖架构的无缝集成。

相比之下,Elasticsearch 与其内部数据格式和基于 Lucene 的存储引擎紧密耦合。它无法直接查询湖仓格式或 Parquet 文件,限制了其参与现代数据湖架构的能力。Elasticsearch 要求在查询之前将数据转换并加载到其专有格式中。

ClickHouse 的湖仓能力不仅限于读取数据:


- **数据目录集成**：ClickHouse 支持与诸如 [AWS Glue](/use-cases/data-lake/glue-catalog) 等数据目录集成，从而能够自动发现并访问对象存储中的表。
- **对象存储支持**：原生支持直接查询存放在 [S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) 中的数据，无需进行数据搬移。
- **联邦查询**：能够通过 [外部字典](/dictionary) 和 [表函数](/sql-reference/table-functions) 关联来自多个数据源的数据，包括 lakehouse 表、传统数据库以及 ClickHouse 表。
- **增量加载**：支持将 lakehouse 表中的数据持续加载到本地 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中，可使用 [S3Queue](/engines/table-engines/integrations/s3queue) 和 [ClickPipes](/integrations/clickpipes) 等功能。
- **性能优化**：通过 [cluster 表函数](/sql-reference/table-functions/cluster) 对 lakehouse 数据执行分布式查询，以提升性能。

这些特性使 ClickHouse 成为采用 lakehouse 架构的组织的自然之选，既能利用数据湖的灵活性，又能获得列式数据库的高性能。 
