---
slug: /use-cases/observability/clickstack/migration/elastic/concepts
title: 'ClickStack 与 Elastic 的对应概念'
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


## Elastic Stack vs ClickStack \\{#elastic-vs-clickstack\\}

Elastic Stack 和 ClickStack 都涵盖了可观测性平台的核心职能，但它们以不同的设计理念来实现这些职能。这些职能包括：

- **UI 和告警**：用于查询数据、构建仪表盘以及管理告警的工具。
- **存储与查询引擎**：负责存储可观测性数据并提供分析型查询的后端系统。
- **数据采集与 ETL**：在数据摄取前收集遥测数据并对其进行处理的代理和流水线。

下表概述了每个技术栈如何将其组件映射到这些职能：

| **角色** | **Elastic Stack** | **ClickStack** | **说明** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI 与告警** | **Kibana** — 仪表盘、搜索和告警      | **HyperDX** — 实时 UI、搜索和告警   | 两者都作为用户的主要交互界面，包括可视化和告警管理。HyperDX 为可观测性场景专门构建，并与 OpenTelemetry 语义深度耦合。 |
| **存储与查询引擎** | **Elasticsearch** — 具倒排索引的 JSON 文档存储 | **ClickHouse** — 带向量化引擎的列式数据库 | Elasticsearch 使用针对搜索优化的倒排索引；ClickHouse 使用列式存储和 SQL，以高速分析结构化和半结构化数据。 |
| **数据采集** | **Elastic Agent**、**Beats**（如 Filebeat、Metricbeat） | **OpenTelemetry Collector**（边缘 + 网关）     | Elastic 支持自定义 shipper 和由 Fleet 管理的统一代理。ClickStack 依赖 OpenTelemetry，实现与厂商无关的数据采集与处理。 |
| **应用埋点 SDK** | **Elastic APM agents**（专有）             | **OpenTelemetry SDKs**（由 ClickStack 分发） | Elastic SDK 与 Elastic 技术栈强绑定。ClickStack 基于 OpenTelemetry SDK，在主流语言中支持日志、指标和追踪。 |
| **ETL / 数据处理** | **Logstash**、ingest 流水线                   | **OpenTelemetry Collector** + ClickHouse 物化视图 | Elastic 使用 ingest 流水线和 Logstash 进行转换。ClickStack 通过物化视图和 OTel collector 的 processor 将计算前移到写入阶段，高效且增量地转换数据。 |
| **架构理念** | 垂直一体化，专有代理与格式 | 基于开放标准、松耦合组件   | Elastic 构建了一个高度集成的生态系统。ClickStack 强调模块化与标准化（OpenTelemetry、SQL、对象存储），以获得更高的灵活性和成本效率。 |

ClickStack 强调开放标准和互操作性，从采集到 UI 全面支持 OpenTelemetry。相比之下，Elastic 提供的是一个紧密耦合、更加垂直一体化的生态系统，使用专有代理和数据格式。

由于 **Elasticsearch** 和 **ClickHouse** 是各自技术栈中负责数据存储、处理和查询的核心引擎，理解它们之间的差异至关重要。这些系统支撑了整个可观测性架构的性能、可扩展性和灵活性。下一节将探讨 Elasticsearch 与 ClickHouse 之间的关键差异——包括它们如何建模数据、处理摄取、执行查询以及管理存储。

## Elasticsearch 与 ClickHouse 对比 \\{#elasticsearch-vs-clickhouse\\}

ClickHouse 和 Elasticsearch 在组织和查询数据时采用了不同的底层模型，但许多核心概念具有相似的作用。本节为熟悉 Elastic 的用户梳理关键等价关系，并将其映射到 ClickHouse 中的对应项。尽管术语不同，大多数可观测性工作流都可以在 ClickStack 中复现——而且通常效率更高。

### 核心结构概念 \\{#core-structural-concepts\\}

| **Elasticsearch** | **ClickHouse / SQL** | **描述** |
|-------------------|----------------------|------------------|
| **Field** | **Column** | 最基本的数据单元，保存一个或多个特定类型的值。Elasticsearch 字段可以存储原始类型、数组以及对象。字段只能有一个类型。ClickHouse 同样支持数组和对象（`Tuples`、`Maps`、`Nested`），以及诸如 [`Variant`](/sql-reference/data-types/variant) 和 [`Dynamic`](/sql-reference/data-types/dynamic) 这样的动态类型，允许单个列具备多种类型。 |
| **Document** | **Row** | 一组字段（列）的集合。Elasticsearch 文档默认更加灵活，可以根据数据动态添加新字段（类型从插入的数据中推断）。ClickHouse 行在默认情况下受模式约束，用户需要为一行插入所有列或其中一部分列。ClickHouse 中的 [`JSON`](/integrations/data-formats/json/overview) 类型支持基于插入数据的等价的半结构化、动态列创建方式。 |
| **Index** | **Table** | 查询执行与存储的基本单元。在这两种系统中，查询都是针对索引或表运行的，这些索引或表存储行/文档。 |
| *Implicit* | Schema (SQL)         | SQL schema 会将表按命名空间进行分组，通常用于访问控制。Elasticsearch 和 ClickHouse 本身没有 SQL schema 的概念，但二者都通过角色和 RBAC 支持行级和表级安全控制。 |
| **Cluster** | **Cluster / Database** | Elasticsearch 集群是管理一个或多个索引的运行时实例。在 ClickHouse 中，数据库在逻辑命名空间内组织表，提供与 Elasticsearch 集群相同的逻辑分组。ClickHouse 集群是由多节点组成的分布式集群，与 Elasticsearch 类似，但与数据本身解耦、相互独立。 |

### 数据建模与灵活性 \\{#data-modeling-and-flexibility\\}

Elasticsearch 以其通过 [dynamic mappings](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping) 提供的模式灵活性而闻名。字段会在文档被摄取时创建，并在未显式指定 schema 的情况下自动推断类型。ClickHouse 默认更为严格——表需要使用显式 schema 定义——但通过 [`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant) 和 [`JSON`](/integrations/data-formats/json/overview) 类型提供灵活性。这些类型支持对半结构化数据的摄取，并支持类似 Elasticsearch 的动态列创建和类型推断。同样，[`Map`](/sql-reference/data-types/map) 类型允许存储任意键值对——不过键和值都必须使用同一种类型。

ClickHouse 在类型灵活性上的方式更加透明且可控。与 Elasticsearch 中类型冲突可能导致摄取错误不同，ClickHouse 允许在 [`Variant`](/sql-reference/data-types/variant) 列中存储混合类型数据，并通过使用 [`JSON`](/integrations/data-formats/json/overview) 类型支持 schema 演进。

如果不使用 [`JSON`](/integrations/data-formats/json/overview)，则使用静态定义的 schema。如果某行未提供字段值，它们要么会被定义为 [`Nullable`](/sql-reference/data-types/nullable)（在 ClickStack 中不使用），要么会回退为该类型的默认值，例如 `String` 的默认值为空字符串。

### 摄取与转换 \\{#ingestion-and-transformation\\}

Elasticsearch 使用带有处理器（例如 `enrich`、`rename`、`grok`）的摄取管道（ingest pipeline）在索引之前转换文档。在 ClickHouse 中，可以使用[**增量物化视图**](/materialized-view/incremental-materialized-view)实现类似功能，它可以对传入数据进行[过滤和转换](/materialized-view/incremental-materialized-view#filtering-and-transformation)，或进行[富化](/materialized-view/incremental-materialized-view#lookup-table)，并将结果插入目标表。如果只需要存储物化视图的输出，也可以将数据插入到 `Null` 表引擎中。这意味着只保留物化视图的结果，而原始数据会被丢弃，从而节省存储空间。

在富化方面，Elasticsearch 支持专门的 [enrich 处理器](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor)为文档添加上下文。在 ClickHouse 中，可以在[查询时](/dictionary#query-time-enrichment)和[摄取时](/dictionary#index-time-enrichment)都使用[**字典**](/dictionary)来富化行数据，例如，在插入时[将 IP 映射到地理位置](/use-cases/observability/schema-design#using-ip-dictionaries)，或进行[用户代理（user agent）查表解析](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)。

### 查询语言 \\{#query-languages\\}

Elasticsearch 支持[多种查询语言](https://www.elastic.co/docs/explore-analyze/query-filter/languages)，包括 [DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql) 和 [KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)（Lucene 风格），但对 join 的支持有限——目前仅在 [`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join) 中提供**左外连接（left outer join）**。ClickHouse 支持**完整 SQL 语法**，包括[所有连接类型](/sql-reference/statements/select/join#supported-types-of-join)、[窗口函数](/sql-reference/window-functions)、子查询（包括关联子查询）以及 CTE。如果你需要在可观测性信号与业务或基础设施数据之间进行关联分析，这是一个重要优势。

在 ClickStack 中，[HyperDX 提供了兼容 Lucene 的搜索界面](/use-cases/observability/clickstack/search)，便于从现有系统平滑迁移，同时通过 ClickHouse 后端提供完整 SQL 支持。其语法与 [Elastic query string](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 语法类似。要对这套语法进行精确对比，请参阅[《在 ClickStack 和 Elastic 中进行搜索》](/use-cases/observability/clickstack/migration/elastic/search)。

### 文件格式和接口 \\{#file-formats-and-interfaces\\}

Elasticsearch 支持 JSON（以及[有限的 CSV 支持](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)）摄取。ClickHouse 支持超过 **70 种文件格式**，包括 Parquet、Protobuf、Arrow、CSV 等——既可用于摄取，也可用于导出。这使得与外部数据管道和工具的集成更加容易。

两个系统都提供 REST API，但 ClickHouse 还提供用于低延迟、高吞吐交互的**原生协议**。与 HTTP 相比，原生接口在查询进度、压缩和流式处理方面更高效，并且是在多数生产环境中进行摄取时的默认选择。

### 索引与存储 \\{#indexing-and-storage\\}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

分片这一概念是 Elasticsearch 可扩展性模型的基础。每个 ① [**index**](https://www.elastic.co/blog/what-is-an-elasticsearch-index) 都会被拆分为多个 **shard（分片）**，每个 shard 是一个物理的 Lucene 索引，以 segment 的形式存储在磁盘上。一个 shard 可以拥有一个或多个物理副本，称为副本 shard，用于提升可靠性与容错能力。为了实现横向扩展，shard 和副本可以分布在多个节点上。单个 shard ② 由一个或多个不可变的 segment 组成。segment 是 Lucene 的基本索引结构；Lucene 是提供索引和搜索功能的 Java 库，是 Elasticsearch 的基础组件。

:::note 在 Elasticsearch 中的写入处理
Ⓐ 新插入的文档 Ⓑ 首先进入内存中的索引缓冲区，默认每秒刷新一次。系统使用路由公式来确定刷新后文档的目标 shard，并在磁盘上为该 shard 写入一个新的 segment。为了提升查询效率并实现对已删除或更新文档的物理删除，后台会持续将多个 segment 合并为更大的 segment，直到其达到最大 5 GB 的大小。当然，也可以强制将其合并为更大的 segment。
:::

出于 [JVM 堆和元数据开销](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead) 的考虑，Elasticsearch 建议将 shard 大小控制在约 [50 GB 或 2 亿个文档](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards)。此外，每个 shard 还有 [20 亿个文档的硬性上限](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit)。Elasticsearch 会在多个 shard 之间并行执行查询，但每个 shard 仅由**单个线程**处理，这使得过度分片既成本高昂又适得其反。这从根本上将分片与扩展紧密耦合在一起：要扩展性能就必须增加 shard（和节点）的数量。

Elasticsearch 会将所有字段索引到 [**inverted indices（倒排索引）**](https://www.elastic.co/docs/manage-data/data-store/index-basics) 中以实现快速搜索，并可选地使用 [**doc values**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) 来支持聚合、排序和脚本字段访问。数值和地理字段使用 [Block K-D trees](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) 来支持地理空间数据以及数值和日期范围搜索。 

更重要的是，Elasticsearch 会在 [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) 中存储完整的原始文档（使用 `LZ4`、`Deflate` 或 `ZSTD` 进行压缩），而 ClickHouse 不会单独存储文档式的表示。ClickHouse 会在查询时从列中重建数据，从而节省存储空间。对于 Elasticsearch，也可以使用 [Synthetic `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) 实现类似的能力，但存在一些[限制](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)。禁用 `_source` 也会产生一些[影响](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude)，而这些影响并不适用于 ClickHouse。

在 Elasticsearch 中，[index mappings](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（相当于 ClickHouse 中的表 schema）控制字段类型以及用于持久化和查询的数据结构。

相比之下，ClickHouse 是 **列式存储（column-oriented）** —— 每一列都是独立存储的，但始终按表的主键/排序键进行排序。这样的排序使得 [稀疏主键索引](/primary-indexes) 成为可能，从而让 ClickHouse 能够在查询执行过程中高效跳过无关数据。当查询按主键字段进行过滤时，ClickHouse 只会读取每列中相关的部分，大幅减少磁盘 I/O 并提升性能 —— 即便并未为每一列建立完整索引。

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse 还支持 [**skip indexes（跳过索引）**](/optimize/skipping-indexes)，通过为选定列预计算索引数据来加速过滤。这些索引需要显式定义，但可以显著提升性能。此外，ClickHouse 允许你按列指定 [compression codecs](/use-cases/observability/schema-design#using-codecs) 和压缩算法 —— 这是 Elasticsearch 所不支持的（其[压缩](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) 仅适用于 `_source` 的 JSON 存储）。

ClickHouse 也支持分片（sharding），但其模型被设计为优先进行**纵向扩展（vertical scaling）**。单个分片可以存储**数万亿行**数据，并且只要内存、CPU 和磁盘资源允许，就能持续保持高效性能。与 Elasticsearch 不同，每个分片**没有硬性的行数上限**。ClickHouse 中的分片是逻辑概念——本质上是独立的数据表——仅当数据集超过单个节点的容量时才需要进行分片。通常这是由于磁盘容量限制所致，只有在需要进行水平扩展时才引入 sharding ①，从而降低复杂性和开销。在这种情况下，与 Elasticsearch 类似，一个分片将持有数据的一个子集。单个分片内的数据被组织为 ② 不可变数据部分（immutable data parts）的集合，这些部分包含 ③ 若干数据结构。

在单个 ClickHouse 分片内部，处理是**完全并行化**的，并建议用户优先进行纵向扩展，以避免在节点之间移动数据所带来的网络开销。 

:::note ClickHouse 中的写入处理
ClickHouse 中的写入（insert）**默认是同步的**——只有在提交后写入才会被确认——但也可以配置为**异步写入（asynchronous inserts）**，以实现类似 Elasticsearch 的缓冲和批处理行为。如果使用[异步数据写入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则 Ⓐ 新插入的行首先进入 Ⓑ 内存中的写入缓冲区，该缓冲区默认每 200 毫秒刷新一次。如果使用多个分片，则会使用[分布式表](/engines/table-engines/special/distributed)将新插入的行路由到其目标分片。随后会为该分片在磁盘上写入一个新的数据部分（part）。
:::

### 分布与复制 \\{#distribution-and-replication\\}

虽然 Elasticsearch 和 ClickHouse 都使用集群、分片和副本来保证可扩展性和容错性，但它们在实现方式和性能特性上存在显著差异。

Elasticsearch 使用 **主-从（primary-secondary）** 复制模型。当数据写入主分片时，会同步复制到一个或多个副本。这些副本本身是分布在各个节点上的完整分片，用于确保冗余。只有在所有必需副本确认操作后，Elasticsearch 才会确认写入 —— 这种模型提供接近于 **顺序一致性（sequential consistency）** 的保证，尽管在完全同步完成前，从副本进行 **脏读（dirty reads）** 仍有可能。一个 **master node** 用于协调整个集群，管理分片分配、健康状况以及领导者选举。

相反，ClickHouse 默认采用由 **Keeper**（一种轻量级的 ZooKeeper 替代方案）协调的 **最终一致性（eventual consistency）**。写入可以直接发送到任意副本，或通过 [**distributed table**](/engines/table-engines/special/distributed) 发送，由其自动选择副本。复制是异步的 —— 写入被确认后，变更才会传播到其他副本。对于更严格的一致性保证，ClickHouse [支持 **顺序一致性**](/migrations/postgresql/appendix#sequential-consistency)，在该模式下，只有当写入在各个副本上提交后才会被确认，尽管由于对性能的影响，这种模式很少使用。Distributed table 统一了跨多个分片的访问，对 `SELECT` 查询会转发到所有分片并合并结果。对于 `INSERT` 操作，它会通过在分片间均匀路由数据来实现负载均衡。ClickHouse 的复制机制非常灵活：任何副本（某个分片的拷贝）都可以接受写入，所有变更都会异步同步到其他副本。这种架构在故障或维护期间依然可以不中断地提供查询服务，并自动完成重新同步 —— 从而无需在数据层强制执行主-从模型。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中，架构引入了无共享（shared-nothing）的计算模型，其中单个 **shard 由对象存储作为后端存储支撑**。这取代了传统基于副本的高可用方式，使得该 shard 可以 **被多个节点同时读取和写入**。存储与计算的分离使得在无需显式管理副本的情况下即可实现弹性扩缩容。
:::

总结如下：

- **Elastic**：分片是绑定到 JVM 内存的物理 Lucene 结构。过度分片会带来性能损失。复制是同步的，由 master node 进行协调。
- **ClickHouse**：分片是逻辑上的，且支持垂直扩展，具备高效的本地执行能力。复制是异步的（也可以配置为顺序一致），协调开销很小。

总体而言，ClickHouse 通过尽量减少对分片调优的需求，同时在需要时仍然提供强一致性保证，在大规模场景下更侧重于简洁性和性能。

### 去重与路由 \\{#deduplication-and-routing\\}

Elasticsearch 基于文档的 `_id` 进行去重，并相应地将其路由到分片。ClickHouse 不会存储默认的行标识符，但支持**写入时去重（insert-time deduplication）**，从而允许用户安全地重试失败的插入操作。如需更细粒度的控制，可以使用 `ReplacingMergeTree` 和其他表引擎按特定列进行去重。

Elasticsearch 中的索引路由可以确保特定文档始终被路由到特定分片。在 ClickHouse 中，你可以定义**分片键（shard keys）**或使用 `Distributed` 表来实现类似的数据局部性。

### 聚合与执行模型 \\{#aggregations-execution-model\\}

虽然两个系统都支持数据聚合，但 ClickHouse 提供了显著[更多的函数](/sql-reference/aggregate-functions/reference)，包括统计函数、近似计算函数以及专用分析函数。

在可观测性场景中，聚合最常见的用途之一是统计特定日志消息或事件出现的次数（并在出现频率异常时触发告警）。

在 Elasticsearch 中，与 ClickHouse 中 `SELECT count(*) FROM ... GROUP BY ...` SQL 查询等价的是 [terms 聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)，它是一种 Elasticsearch 的[桶聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)。

ClickHouse 的 `GROUP BY` 加 `count(*)` 与 Elasticsearch 的 terms 聚合在功能上通常是等价的，但在实现方式、性能和结果质量方面存在较大差异。

当查询的数据跨多个分片时，Elasticsearch 中这种聚合会[对“top-N”查询的结果进行估算](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)（例如按计数排序的前 10 个主机）。这种估算可以提高速度，但可能会影响准确性。用户可以通过[检查 `doc_count_error_upper_bound`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)并增大 `shard_size` 参数来降低该误差——代价是更高的内存占用和更慢的查询性能。

Elasticsearch 还要求为所有桶聚合设置 [`size` 参数](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)——不显式设置上限就无法返回所有唯一分组。高基数聚合存在触及 [`max_buckets` 限制](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)的风险，或者需要通过[复合聚合](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation)进行分页，而这通常既复杂又低效。

相比之下，ClickHouse 默认执行精确聚合。像 `count(*)` 这样的函数无需调整配置就能返回精确结果，使查询行为更简单、更可预测。

ClickHouse 不施加大小限制。您可以在大型数据集上执行不设上限的 `GROUP BY` 查询。如果超出内存阈值，ClickHouse [可以将数据溢写到磁盘](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)。按主键前缀进行分组的聚合尤其高效，通常只需极少的内存即可运行。

#### 执行模型 \\{#execution-model\\}

上述差异可以归因于 Elasticsearch 和 ClickHouse 的执行模型，这两者在查询执行和并行化方面采取了截然不同的策略。

ClickHouse 的设计目标是在现代硬件上最大化效率。默认情况下，在具有 N 个 CPU 核心的机器上，ClickHouse 会使用 N 条并发执行通道来运行一条 SQL 查询：

<Image img={clickhouse_execution} alt="ClickHouse 执行" size="lg"/>

在单个节点上，执行通道会将数据拆分为相互独立的区间，从而允许在多个 CPU 线程之间并发处理，包括过滤、聚合和排序。每条通道产生的本地结果最终会被合并；如果查询中包含 `LIMIT` 子句，则会在此基础上应用 limit 算子。

查询执行进一步通过以下方式实现并行化：

1. **SIMD 向量化**：对列式数据的操作使用 [CPU SIMD 指令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)（例如 [AVX512](https://en.wikipedia.org/wiki/AVX-512)），从而支持对大量值进行批处理。
2. **集群级并行**：在分布式部署中，每个节点都会在本地执行查询处理。[部分聚合状态](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states) 会被流式传输到发起查询的节点并在该处合并。如果查询的 `GROUP BY` 键与分片键对齐，则可以[最大限度减少甚至完全避免](/operations/settings/settings#distributed_group_by_no_merge)合并。

<br/>

这种模型可以高效地在多核和多节点之间扩展，使 ClickHouse 非常适合大规模分析。使用 *partial aggregation states（部分聚合状态）* 可以在不损失精度的前提下合并来自不同线程和节点的中间结果。

相比之下，Elasticsearch 在大多数聚合中为每个分片分配一个线程，而不考虑可用 CPU 核心的数量。这些线程返回分片本地的 top-N 结果，然后在协调节点上进行合并。这种方式可能无法充分利用系统资源，并在全局聚合中引入潜在的不准确性，尤其是在高频项分布在多个分片上的情况下。可以通过增大 `shard_size` 参数来提高准确性，但代价是更高的内存占用和查询延迟。

<Image img={elasticsearch_execution} alt="Elasticsearch 执行" size="lg"/>

总之，ClickHouse 在执行聚合和查询时具有更细粒度的并行度，并能更好地控制硬件资源，而 Elasticsearch 则依赖基于分片的执行模型，约束更为刚性。

关于这两种技术中聚合机制的更多细节，推荐阅读博客文章 ["ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)。

### 数据管理 \\{#data-management\\}

Elasticsearch 和 ClickHouse 在管理时间序列可观测性数据时采用了根本不同的策略——尤其是在数据保留、rollover（滚动切分）以及分层存储方面。

#### 索引生命周期管理 vs 原生 TTL \\{#lifecycle-vs-ttl\\}

在 Elasticsearch 中，长期数据管理是通过 **Index Lifecycle Management (ILM)** 和 **Data Streams** 来实现的。这些功能允许用户定义策略，以控制索引在何时滚动（例如在达到一定大小或存在时间之后）、何时将较旧的索引迁移到更低成本的存储（例如 warm 或 cold 分层），以及何时最终删除它们。之所以需要这样做，是因为 Elasticsearch **不支持重新分片（re-sharding）**，并且分片不能无限制增长，否则会导致性能下降。为了管理分片大小并支持高效删除，必须定期创建新索引并移除旧索引——本质上是在索引级别进行数据轮转。

ClickHouse 采用了不同的方法。数据通常存储在 **单个表** 中，并通过在列或分区级别定义的 **TTL（time-to-live，生存时间）表达式** 进行管理。数据可以按 **日期分区**，从而在无需创建新表或执行索引滚动的情况下实现高效删除。随着数据变旧并满足 TTL 条件，ClickHouse 会自动将其移除——不需要额外的基础设施来管理数据轮转。

#### 存储层级与热-温架构 \\{#storage-tiers\\}

Elasticsearch 支持 **热-温-冷-冻结（hot-warm-cold-frozen）** 存储架构，数据会在具备不同性能特征的存储层级之间迁移。通常通过 ILM 配置，并与集群中的节点角色绑定。

ClickHouse 通过原生表引擎（如 `MergeTree`）支持 **分层存储（tiered storage）**，可以根据自定义规则，自动在不同的 **卷（volume）** 之间移动较旧的数据（例如从 SSD 到 HDD 再到对象存储）。这可以模拟 Elastic 的 hot-warm-cold 模型——但无需面对管理多种节点角色或多个集群的复杂性。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中，这一点变得更加无缝：所有数据都存储在 **对象存储（例如 S3）** 中，计算与存储解耦。数据可以一直保留在对象存储中，直到被查询为止；在查询时数据会被拉取并缓存到本地（或分布式缓存）——在保持与 Elastic 冻结层类似成本结构的同时，具备更好的性能特性。这种方式意味着无需在不同存储层级之间迁移数据，从而使热-温架构不再必要。
:::

### 汇总（Rollups）与增量聚合 \\{#rollups-vs-incremental-aggregates\\}

在 Elasticsearch 中，**rollups** 或 **aggregates** 是通过一种称为 [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html) 的机制来实现的。它们用于以固定时间间隔（例如按小时或按天），通过**滑动窗口**模型对时序数据进行汇总。这些被配置为周期性运行的后台任务，从一个索引聚合数据，并将结果写入单独的 **rollup 索引**。这样可以避免对高基数原始数据进行重复扫描，从而降低长时间范围查询的成本。

下图以抽象方式示意了 transforms 的工作原理（注意我们使用蓝色来表示属于同一分桶、且需要预先计算聚合值的所有文档）：

<Image img={elasticsearch_transforms} alt="Elasticsearch transforms" size="lg"/>

连续 transforms 使用基于可配置检查间隔时间的 transform [检查点（checkpoints）](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)（transform [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html) 的默认值为 1 分钟）。在上图中，我们假定 ① 在检查间隔时间过去之后会创建一个新的检查点。此时 Elasticsearch 会检查 transform 源索引中的变化，并检测到自上一个检查点以来新出现了三个 `blue` 文档（11、12 和 13）。因此，会在源索引中筛选出所有现有的 `blue` 文档，并使用[复合聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)（以利用结果[分页](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)）重新计算聚合值（然后用包含新聚合值的文档替换目标索引中之前的聚合文档）。类似地，在 ② 和 ③，会处理新的检查点：通过检查变更并从所有属于同一 “blue” 分桶的现有文档重新计算聚合值。

ClickHouse 采用了完全不同的方法。ClickHouse 不会周期性地重新聚合数据，而是通过支持**增量物化视图**，在**写入时（insert time）**对数据进行转换和聚合。当新数据写入源表时，物化视图仅对新的**插入数据块（inserted blocks）**执行预定义的 SQL 聚合查询，并将聚合结果写入目标表。

这种模型之所以可行，是因为 ClickHouse 支持[**部分聚合状态（partial aggregate states）**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)——即可以存储并在之后合并的聚合函数中间表示。借助这一特性，用户可以维护部分聚合结果，它们查询速度快、更新成本低。由于聚合在数据到达时就已完成，无需再运行昂贵的周期性任务或对旧数据进行重新汇总。

我们以抽象方式示意增量物化视图的机制（注意我们使用蓝色来表示属于同一分组、且需要预先计算聚合值的所有行）：

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

在上图中，物化视图的源表已经包含了一个数据部分（data part），其中存储了一些属于同一分组的 `blue` 行（1 到 10）。对于该分组，在视图的目标表中也已经存在一个数据部分，用于存储该 `blue` 分组的[部分聚合状态](https://www.youtube.com/watch?v=QDAJTKZT8y4)。当 ① ② ③ 多次向源表插入新行时，每次插入都会在源表中创建一个对应的数据部分，并且同时，仅针对每个新插入行所在的数据块，计算一个部分聚合状态，并以数据部分的形式插入到物化视图的目标表中。④ 在后台的数据部分合并过程中，这些部分聚合状态会被合并，从而实现增量数据聚合。

请注意，所有[聚合函数](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)（超过 90 个），以及它们与聚合函数[组合器（combinators）](https://www.youtube.com/watch?v=7ApwD0cfAFI)的组合，都支持[部分聚合状态](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)。

关于 Elasticsearch 与 ClickHouse 在增量聚合上的更具体示例，请参见此[示例](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)。

ClickHouse 方法的优势包括：

- **始终最新的聚合结果**：物化视图始终与源表保持同步。
- **无需后台任务**：聚合在写入时完成，而不是在查询时完成。
- **更佳的实时性能**：非常适合需要即时获得最新聚合结果的可观测性工作负载和实时分析场景。
- **可组合性强**：物化视图可以与其他视图和数据表进行分层或关联，用于实现更复杂的查询加速策略。
- **不同的 TTL**：可以为物化视图的源表和目标表设置不同的 TTL 设置。

这种模式在可观测性场景中尤其强大，当你需要计算每分钟错误率、延迟或 Top-N 细分等指标时，无需在每次查询时扫描数十亿条原始记录。

### Lakehouse 支持 \\{#lakehouse-support\\}

ClickHouse 和 Elasticsearch 在 Lakehouse 集成方面采用了根本不同的方法。ClickHouse 是一个完备的查询执行引擎，能够在 [Iceberg](/sql-reference/table-functions/iceberg) 和 [Delta Lake](/sql-reference/table-functions/deltalake) 等 Lakehouse 格式上执行查询，并与 [AWS Glue](/use-cases/data-lake/glue-catalog) 和 [Unity Catalog](/use-cases/data-lake/unity-catalog) 等数据湖目录集成。这些格式依赖对 [Parquet](/interfaces/formats/Parquet) 文件的高效查询，而 ClickHouse 对 Parquet 提供了完整支持。ClickHouse 可以直接读取 Iceberg 和 Delta Lake 表，从而与现代数据湖架构实现无缝集成。

相比之下，Elasticsearch 与其内部数据格式和基于 Lucene 的存储引擎高度耦合。它无法直接查询 Lakehouse 格式或 Parquet 文件，限制了其参与现代数据湖架构的能力。Elasticsearch 要求先将数据转换并加载到其专有格式中之后，才能对其进行查询。

ClickHouse 的 Lakehouse 能力不仅仅局限于读取数据：

- **数据目录集成**：ClickHouse 支持与 [AWS Glue](/use-cases/data-lake/glue-catalog) 等数据目录集成，实现对象存储中表的自动发现和访问。
- **对象存储支持**：原生支持在不移动数据的前提下，查询存储在 [S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) 中的数据。
- **联邦查询**：能够使用 [external dictionaries](/dictionary) 和 [table functions](/sql-reference/table-functions) 在多个数据源之间进行关联分析，包括 Lakehouse 表、传统数据库以及 ClickHouse 表。
- **增量加载**：支持将 Lakehouse 表中的数据持续加载到本地 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中，可使用 [S3Queue](/engines/table-engines/integrations/s3queue) 和 [ClickPipes](/integrations/clickpipes) 等特性。
- **性能优化**：通过 [cluster functions](/sql-reference/table-functions/cluster) 在 Lakehouse 数据之上执行分布式查询，以提升性能。

这些能力使 ClickHouse 非常适合采用 Lakehouse 架构的组织，既可以利用数据湖的灵活性，又能发挥列式数据库的高性能优势。 