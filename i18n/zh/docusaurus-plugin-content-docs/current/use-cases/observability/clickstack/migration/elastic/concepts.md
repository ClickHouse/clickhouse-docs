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

Elastic Stack 和 ClickStack 都覆盖了可观测性平台的核心角色，但它们在实现这些角色时采用了不同的设计理念。这些角色包括：

- **UI 和告警**：用于查询数据、构建仪表盘以及管理告警的工具。
- **存储和查询引擎**：负责存储可观测性数据并提供分析查询的后端系统。
- **数据采集和 ETL**：在数据摄取前收集遥测数据并对其进行处理的代理和管道。

下表说明了每个栈如何将其组件映射到这些角色上：

| **角色** | **Elastic Stack** | **ClickStack** | **说明** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI & 告警** | **Kibana** — 仪表盘、搜索和告警      | **HyperDX** — 实时 UI、搜索和告警   | 两者都作为用户的主要界面，包括可视化和告警管理。HyperDX 专为可观测性而设计，并与 OpenTelemetry 语义紧密耦合。 |
| **存储和查询引擎** | **Elasticsearch** — 带反向索引的 JSON 文档存储 | **ClickHouse** — 列式数据库，具有向量化引擎 | Elasticsearch 使用为搜索优化的反向索引；ClickHouse 使用列式存储和 SQL，在结构化与半结构化数据上提供高速分析。 |
| **数据采集** | **Elastic Agent**、**Beats**（如 Filebeat、Metricbeat） | **OpenTelemetry Collector**（edge + gateway）     | Elastic 支持自定义 shipper 和由 Fleet 管理的统一代理。ClickStack 依赖 OpenTelemetry，实现供应商中立的数据采集与处理。 |
| **埋点 SDKs** | **Elastic APM agents**（专有）             | **OpenTelemetry SDKS**（由 ClickStack 分发） | Elastic SDKs 与 Elastic 栈绑定。ClickStack 基于 OpenTelemetry SDKS，为主流语言提供日志、指标和追踪能力。 |
| **ETL / 数据处理** | **Logstash**、ingest 管道                   | **OpenTelemetry Collector** + ClickHouse 物化视图 | Elastic 使用摄取管道和 Logstash 进行数据转换。ClickStack 通过物化视图和 OTel collector 的处理器在写入时转移计算，高效且增量地转换数据。 |
| **架构理念** | 垂直集成，专有代理和格式 | 基于开放标准的松耦合组件   | Elastic 构建了一个紧密集成的生态系统。ClickStack 强调模块化和标准（OpenTelemetry、SQL、对象存储），以获得灵活性和成本效率。 |

ClickStack 强调开放标准和互操作性，从采集到 UI 全面原生支持 OpenTelemetry。相比之下，Elastic 提供的是一个耦合更紧密、垂直集成度更高但依赖专有代理和格式的生态系统。

由于 **Elasticsearch** 和 **ClickHouse** 是各自栈中负责数据存储、处理和查询的核心引擎，理解它们之间的差异至关重要。这些系统支撑了整个可观测性架构的性能、可扩展性和灵活性。下一节将探讨 Elasticsearch 和 ClickHouse 之间的关键差异——包括它们如何建模数据、如何执行数据摄取、如何执行查询以及如何管理存储。



## Elasticsearch 与 ClickHouse 对比 {#elasticsearch-vs-clickhouse}

ClickHouse 和 Elasticsearch 使用不同的底层模型来组织和查询数据，但许多核心概念具有相似用途。本节为熟悉 Elasticsearch 的用户梳理关键等价概念，并将其映射到 ClickHouse 中的对应概念。尽管术语有所不同，大部分可观测性工作流都可以在 ClickStack 中复现——而且通常效率更高。

### 核心结构概念 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL** | **Description** |
|-------------------|----------------------|------------------|
| **Field** | **Column** | 数据的基本单元，包含一个或多个特定类型的值。Elasticsearch 字段可以存储基础类型、数组以及对象，且每个字段只能有一种类型。ClickHouse 同样支持数组和对象（`Tuples`、`Maps`、`Nested`），并提供诸如 [`Variant`](/sql-reference/data-types/variant) 和 [`Dynamic`](/sql-reference/data-types/dynamic) 这样的动态类型，允许单个列中存储多种类型的值。 |
| **Document** | **Row** | 字段（列）的集合。Elasticsearch 文档默认更为灵活，可根据数据动态添加新字段（类型会根据数据推断）。ClickHouse 行默认受模式约束，用户需要为某一行插入该行的全部列或部分列。ClickHouse 中的 [`JSON`](/integrations/data-formats/json/overview) 类型支持基于插入数据的等价半结构化动态列创建。 |
| **Index** | **Table** | 查询执行与存储的基本单位。在两个系统中，查询都是针对索引或表执行的，这些索引或表存储行/文档。 |
| *Implicit* | Schema (SQL)         | SQL schema 将表分组到命名空间中，通常用于访问控制。Elasticsearch 和 ClickHouse 本身没有 schema 概念，但二者都通过角色和 RBAC 支持行级和表级安全控制。 |
| **Cluster** | **Cluster / Database** | Elasticsearch 集群是运行时实例，用于管理一个或多个索引。在 ClickHouse 中，数据库在逻辑命名空间内组织表，提供与 Elasticsearch 集群相同的逻辑分组。ClickHouse 集群是分布式节点集合，与 Elasticsearch 类似，但与数据本身解耦且相互独立。 |

### 数据建模与灵活性 {#data-modeling-and-flexibility}

Elasticsearch 以其通过 [dynamic mappings](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping) 提供的模式灵活性而闻名。字段会在文档被摄取时创建，类型会自动推断——除非事先指定了 schema。ClickHouse 默认更加严格——表通过显式 schema 定义——但通过 [`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant) 和 [`JSON`](/integrations/data-formats/json/overview) 类型提供灵活性。这些类型支持半结构化数据的摄取，并提供类似于 Elasticsearch 的动态列创建与类型推断。类似地，[`Map`](/sql-reference/data-types/map) 类型允许存储任意键值对——不过键和值都必须使用单一类型。

ClickHouse 对类型灵活性的处理更加透明且可控。与 Elasticsearch 中类型冲突可能导致摄取错误不同，ClickHouse 允许在 [`Variant`](/sql-reference/data-types/variant) 列中存储混合类型数据，并且通过使用 [`JSON`](/integrations/data-formats/json/overview) 类型支持模式演化。

如果不使用 [`JSON`](/integrations/data-formats/json/overview)，则 schema 为静态定义。如果某一行未提供某些值，它们要么被定义为 [`Nullable`](/sql-reference/data-types/nullable)（在 ClickStack 中不使用），要么回退为该类型的默认值，例如 `String` 的空字符串。

### 摄取与转换 {#ingestion-and-transformation}

Elasticsearch 使用带处理器（例如 `enrich`、`rename`、`grok`）的 ingest pipeline 在索引之前转换文档。在 ClickHouse 中，可通过[**增量物化视图**](/materialized-view/incremental-materialized-view)实现类似功能，它可以[过滤、转换](/materialized-view/incremental-materialized-view#filtering-and-transformation)或[富化](/materialized-view/incremental-materialized-view#lookup-table)传入数据，并将结果插入目标表。如果你只需要存储物化视图的输出，也可以将数据插入到 `Null` 表引擎中。这意味着只保留物化视图的结果，而原始数据会被丢弃——从而节省存储空间。



在数据富化方面，Elasticsearch 支持专用的 [enrich processors](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor) 来为文档添加上下文。在 ClickHouse 中，可以在[查询时](/dictionary#query-time-enrichment)和[摄取时](/dictionary#index-time-enrichment)都使用 [**dictionaries**](/dictionary) 来富化行，例如在插入时[将 IP 映射到地理位置](/use-cases/observability/schema-design#using-ip-dictionaries)或执行 [User Agent 查找](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)。

### 查询语言 {#query-languages}

Elasticsearch 支持[多种查询语言](https://www.elastic.co/docs/explore-analyze/query-filter/languages)，包括 [DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql) 和 [KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)（类 Lucene）查询，但对 join 的支持有限——仅可通过 [`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join) 使用**左外连接**。ClickHouse 支持**完整 SQL 语法**，包括[所有 join 类型](/sql-reference/statements/select/join#supported-types-of-join)、[窗口函数](/sql-reference/window-functions)、子查询（包括关联子查询）以及 CTE（公用表表达式）。这对需要在可观测性信号与业务或基础设施数据之间进行关联的用户来说是一个重要优势。

在 ClickStack 中，[HyperDX 提供与 Lucene 兼容的搜索界面](/use-cases/observability/clickstack/search)，以便平滑迁移，同时通过 ClickHouse 后端提供完整的 SQL 支持。该语法与 [Elastic query string](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 语法类似。要对这种语法进行精确对比，请参阅「[在 ClickStack 和 Elastic 中的搜索](/use-cases/observability/clickstack/migration/elastic/search)」。

### 文件格式和接口 {#file-formats-and-interfaces}

Elasticsearch 支持 JSON（以及[有限的 CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)）摄取。ClickHouse 支持 **70 多种文件格式**，包括 Parquet、Protobuf、Arrow、CSV 等——同时支持摄取和导出。这使其更容易与外部数据管道和工具集成。

两套系统都提供 REST API，但 ClickHouse 还提供用于低延迟、高吞吐交互的 **原生协议**。相比 HTTP，原生接口对查询进度、压缩和流式传输的支持更加高效，并且是大多数生产摄取场景中的默认选择。

### 索引与存储 {#indexing-and-storage}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

分片（sharding）的概念是 Elasticsearch 可扩展性模型的基础。每个 ① [**index**](https://www.elastic.co/blog/what-is-an-elasticsearch-index) 会被拆分为多个 **shard**，每个 shard 都是一个物理的 Lucene 索引，以 segment 的形式存储在磁盘上。一个 shard 可以有一个或多个物理副本，称为副本 shard，用于提升弹性。为实现可扩展性，shard 和副本可以分布在多个节点上。单个 shard ② 由一个或多个不可变的 segment 组成。segment 是 Lucene 的基本索引结构，Lucene 是为 Elasticsearch 提供索引与搜索功能的 Java 库。

:::note Insert processing in Elasticsearch
Ⓐ 新插入的文档 Ⓑ 首先进入内存中的索引缓冲区，默认每秒刷新一次。系统会使用路由公式来确定刷新文档的目标 shard，并在磁盘上为该 shard 写入一个新的 segment。为提升查询效率并实现对已删除或更新文档的物理删除，后台会持续将多个 segment 合并为更大的 segment，直到其达到最大 5 GB 的大小。不过，也可以强制合并到更大的 segment。
:::



Elasticsearch 建议将分片大小控制在大约 [50 GB 或 2 亿文档](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards)，原因是 [JVM 堆和元数据开销](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead)。另外，每个分片还有一个 [20 亿文档的硬性上限](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit)。Elasticsearch 会在分片之间并行化查询，但每个分片仅使用 **单线程** 处理，这使得过度拆分分片既昂贵又适得其反。这在本质上将分片与扩展紧密耦合，要扩展性能就需要更多分片（以及节点）。

Elasticsearch 会将所有字段索引到 [**倒排索引（inverted indices）**](https://www.elastic.co/docs/manage-data/data-store/index-basics) 中以实现快速搜索，并可选地使用 [**doc values**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) 来支持聚合、排序和脚本字段访问。数值和地理字段使用 [Block K-D 树](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) 来支持地理空间数据以及数值和日期范围上的查询。 

更重要的是，Elasticsearch 会在 [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) 中存储完整的原始文档（使用 `LZ4`、`Deflate` 或 `ZSTD` 压缩），而 ClickHouse 不会单独存储一份文档表示形式。在查询时从列中重建数据，从而节省存储空间。Elasticsearch 也可以通过 [Synthetic `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) 实现类似能力，但存在一些[限制](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)。禁用 `_source` 还会产生一些 [影响](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude)，这些影响并不适用于 ClickHouse。

在 Elasticsearch 中，[索引映射（index mappings）](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（相当于 ClickHouse 中的表模式）控制字段的类型以及用于持久化和查询的数据结构。

相比之下，ClickHouse 是 **列式数据库** —— 每一列都是独立存储的，但始终按表的主键/排序键排序。这种排序使得 [稀疏主索引](/primary-indexes) 成为可能，从而允许 ClickHouse 在查询执行期间高效跳过数据。当查询按主键字段过滤时，ClickHouse 只读取每列中相关的部分，大幅减少磁盘 I/O 并提升性能 —— 即使并没有在每一列上建立完整索引。 

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse 还支持 [**跳过索引（skip indexes）**](/optimize/skipping-indexes)，通过为选定列预计算索引数据来加速过滤。这些索引需要显式定义，但可以显著提升性能。此外，ClickHouse 允许用户为每一列指定 [压缩编解码器](/use-cases/observability/schema-design#using-codecs) 和压缩算法 —— 这是 Elasticsearch 不支持的（其[压缩](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) 仅适用于 `_source` JSON 存储）。

ClickHouse 也支持分片，但其模型是为 **纵向扩展** 优化设计的。单个分片可以存储 **数万亿行** 数据，只要内存、CPU 和磁盘资源允许，就能持续高效运行。与 Elasticsearch 不同的是，每个分片 **没有行数硬性上限**。ClickHouse 中的分片是逻辑概念 —— 实际上就是独立的表 —— 除非数据集超出单个节点的容量，否则不需要进行分区。这通常是由于磁盘容量限制而发生，此时只在需要横向扩展时才引入 ① 分片，从而降低复杂性和开销。在这种情况下，与 Elasticsearch 类似，一个分片会保存数据的一个子集。单个分片内的数据被组织为一组 ② 不可变的数据 part，每个 part 包含 ③ 多种数据结构。

在单个 ClickHouse 分片内的处理是 **充分并行化** 的，并且通常建议用户优先通过纵向扩展来避免在节点之间移动数据所带来的网络成本。 



:::note ClickHouse 中的插入处理
ClickHouse 中的插入默认是**同步的**——只有在提交之后写入才会被确认——但可以配置为**异步插入**，以匹配类似 Elastic 的缓冲和批处理行为。如果使用了[异步数据插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则 Ⓐ 新插入的行首先进入 Ⓑ 内存插入缓冲区，该缓冲区默认每 200 毫秒刷新一次。如果使用了多个分片，则会使用[分布式表](/engines/table-engines/special/distributed)将新插入的行路由到其目标分片。然后会为该分片在磁盘上写入一个新的数据 part。
:::

### 分布与复制 {#distribution-and-replication}

尽管 Elasticsearch 和 ClickHouse 都使用集群、分片和副本来确保可扩展性和容错性，但它们在实现方式和性能特性方面存在显著差异。

Elasticsearch 使用**主-从（primary-secondary）**复制模型。当数据写入主分片时，会同步复制到一个或多个副本。这些副本本身是完整分片，分布在各节点上以确保冗余。Elasticsearch 只有在所有必需副本确认操作之后才会确认写入——这种模型提供了接近**顺序一致性**的保证，尽管在完全同步之前，从副本读取时可能会出现**脏读**。一个**master 节点**协调整个集群，负责分片分配、健康检查和主节点选举。

相较之下，ClickHouse 默认采用由 **Keeper** 协调的**最终一致性**模型——Keeper 是 ZooKeeper 的轻量级替代方案。写入可以直接发送到任意副本，或者通过[**分布式表**](/engines/table-engines/special/distributed)发送，由其自动选择副本。复制是异步的——在写入被确认之后，变更才会被传播到其他副本。若需要更严格的保证，ClickHouse [支持**顺序一致性**](/migrations/postgresql/appendix#sequential-consistency)，即只有在变更在所有副本上提交之后，写入才会被确认，但这种模式由于其性能影响而很少被使用。分布式表统一了跨多个分片的访问，对 `SELECT` 查询会转发到所有分片并合并结果。对于 `INSERT` 操作，它们通过将数据均匀路由到各个分片来实现负载均衡。ClickHouse 的复制极其灵活：任意副本（某个分片的完整拷贝）都可以接受写入，所有变更会异步地同步到其他副本。这种架构允许在故障或维护期间查询不中断，由系统自动完成重新同步——从而消除了在数据层强制实施主-从模型的需要。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中，架构引入了一个 shared-nothing（共享无）计算模型，其中单个**分片由对象存储提供后端支持**。这取代了传统的基于副本的高可用方式，使该分片可以被多个节点**同时读写**。存储与计算的分离使得在无需显式管理副本的情况下实现弹性伸缩。
:::

总结如下：

- **Elastic**：分片是与 JVM 内存绑定的物理 Lucene 结构。过度分片会带来性能损失。复制是同步的，由 master 节点协调。
- **ClickHouse**：分片是逻辑的且可垂直扩展，本地执行效率极高。复制是异步的（也可以配置为顺序一致性），协调开销轻量。

总体而言，ClickHouse 在大规模场景下通过最小化分片调优需求，同时在必要时仍然提供较强的一致性保证，从而在简化性与性能之间取得平衡。

### 去重与路由 {#deduplication-and-routing}

Elasticsearch 基于文档的 `_id` 进行去重，并据此将文档路由到相应分片。ClickHouse 默认不存储行级标识符，但支持**插入时去重**，允许用户安全地重试失败的插入。若需要更多控制，可以使用 `ReplacingMergeTree` 及其他表引擎，按特定列实现去重。

Elasticsearch 中的索引路由确保特定文档总是被路由到特定分片。在 ClickHouse 中，用户可以定义**分片键（shard keys）**或使用 `Distributed` 表来实现类似的数据本地性。

### 聚合与执行模型 {#aggregations-execution-model}

尽管两个系统都支持数据聚合，但 ClickHouse 提供了显著[更多的函数](/sql-reference/aggregate-functions/reference)，包括统计、近似和专用分析函数。

在可观测性场景中，聚合最常见的应用之一是统计特定日志消息或事件发生的频率（并在频率异常时触发告警）。

Elasticsearch 中与 ClickHouse `SELECT count(*) FROM ... GROUP BY ...` SQL 查询等价的是 [terms 聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)，它是一种 Elasticsearch 的[桶聚合（bucket aggregation）](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)。

ClickHouse 的 `GROUP BY` 配合 `count(*)` 与 Elasticsearch 的 terms 聚合在功能上通常是等价的，但在实现、性能和结果质量方面差异很大。



Elasticsearch 中的这种聚合在查询数据跨多个分片时，[会对「top-N」查询的结果进行估算](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)（例如按计数排序的前 10 个主机）。这种估算提升了速度，但可能牺牲精度。用户可以通过[检查 `doc_count_error_upper_bound`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)并增大 `shard_size` 参数来降低这种误差——代价是更高的内存占用和更慢的查询性能。

Elasticsearch 还要求为所有分桶聚合设置一个 [`size` 参数](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)——没有办法在不显式设置上限的情况下返回所有唯一分组。高基数聚合有可能触发 [`max_buckets` 限制](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)，或者需要使用 [composite aggregation](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation) 进行分页，这通常既复杂又低效。

相比之下，ClickHouse 默认执行精确聚合。诸如 `count(*)` 之类的函数无需调整配置即可返回准确结果，使查询行为更简单、更可预测。

ClickHouse 不施加大小限制。你可以在大型数据集上执行无上限的 group by 查询。如果超出内存阈值，ClickHouse [可以将数据溢写到磁盘](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)。按主键前缀进行分组的聚合尤其高效，通常只需要极少的内存消耗即可运行。

#### Execution model {#execution-model}

上述差异可归因于 Elasticsearch 和 ClickHouse 的执行模型，它们在查询执行和并行化方面采用了根本不同的方法。

ClickHouse 的设计目标是在现代硬件上最大化效率。默认情况下，在具有 N 个 CPU 核的机器上，ClickHouse 使用 N 条并发执行通道来运行一条 SQL 查询：

<Image img={clickhouse_execution} alt="ClickHouse execution" size="lg"/>

在单节点上，执行通道将数据拆分为彼此独立的范围，从而允许在多个 CPU 线程之间并发处理。这包括过滤、聚合和排序。每条通道的本地结果最终会被合并，并在查询包含 limit 子句时应用 limit 算子。

查询执行还通过以下方式进一步并行化：
1. **SIMD 向量化**：对列式数据的操作使用 [CPU SIMD 指令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)（例如 [AVX512](https://en.wikipedia.org/wiki/AVX-512)），从而实现批量处理值。
2. **集群级并行**：在分布式部署中，每个节点本地执行查询处理。[部分聚合状态](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states) 会被流式传输到发起查询的节点并在该处合并。如果查询的 `GROUP BY` 键与分片键对齐，则合并过程可以被[最小化，甚至完全避免](/operations/settings/settings#distributed_group_by_no_merge)。
<br/>
这种模型能够在多个 CPU 核和节点之间高效扩展，使 ClickHouse 非常适合大规模分析。使用 *部分聚合状态* 可以在不损失精度的情况下合并来自不同线程和节点的中间结果。

与之相对，Elasticsearch 在大多数聚合中采用「每个分片一个线程」的模型，而不考虑可用 CPU 核的数量。这些线程返回分片本地的 top-N 结果，然后在协调节点进行合并。这种方式可能导致系统资源未被充分利用，并在全局聚合中引入潜在的不准确性，尤其是当高频 term 分布在多个分片时。可以通过增大 `shard_size` 参数来提升精度，但代价是更高的内存占用和更长的查询延迟。

<Image img={elasticsearch_execution} alt="Elasticsearch execution" size="lg"/>

总之，ClickHouse 在执行聚合和查询时具有更细粒度的并行度，并能对硬件资源进行更精细的控制，而 Elasticsearch 则依赖基于分片的执行模型，约束更加固定。

若需了解这两种技术中聚合机制的更多细节，建议阅读博客文章《[ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)》。

### Data management {#data-management}

Elasticsearch 和 ClickHouse 在管理时序可观测性数据方面采取了根本不同的策略——尤其是在数据保留、滚动切分和分层存储等方面。



#### 索引生命周期管理 vs 原生 TTL {#lifecycle-vs-ttl}

在 Elasticsearch 中，长期数据管理是通过 **Index Lifecycle Management (ILM)** 和 **Data Streams** 来实现的。这些功能允许用户定义策略，用于控制索引何时进行 rollover（例如在达到某个大小或存活时间后）、何时将较老的索引迁移到更低成本的存储（例如 warm 或 cold 层），以及何时最终删除这些索引。这是必要的，因为 Elasticsearch **不支持重新分片（re-sharding）**，而且分片不能无限制增长，否则会导致性能下降。为了管理分片大小并支持高效删除，必须定期创建新索引并移除旧索引——本质上是在索引层面对数据进行轮转。

ClickHouse 采用了不同的方法。数据通常存储在**单个表**中，并通过在列或分区级别使用 **TTL（time-to-live）表达式** 进行管理。数据可以按**日期进行分区**，从而在无需创建新表或执行索引 rollover 的情况下实现高效删除。随着数据老化并满足 TTL 条件，ClickHouse 会自动删除这些数据——无需额外的基础设施来管理数据轮转。

#### 存储层级和 hot-warm 架构 {#storage-tiers}

Elasticsearch 支持 **hot-warm-cold-frozen** 存储架构，数据会在具有不同性能特征的存储层之间迁移。这通常通过 ILM 配置，并与集群中的节点角色绑定。

ClickHouse 通过诸如 `MergeTree` 之类的原生表引擎支持**分层存储**，可以基于自定义规则，在不同 **卷（volume）** 之间自动移动旧数据（例如从 SSD 到 HDD，再到对象存储）。这可以模拟 Elastic 的 hot-warm-cold 架构——但无需管理多个节点角色或集群所带来的复杂性。

:::note ClickHouse Cloud
在 **ClickHouse Cloud** 中，这一过程变得更加无缝：所有数据都存储在 **对象存储（例如 S3）** 上，并与计算解耦。数据可以始终保留在对象存储中，直到被查询，此时才会被拉取并在本地（或分布式缓存中）进行缓存——在提供与 Elastic frozen 层类似成本模型的同时，具备更好的性能特征。这种方式意味着无需在存储层之间迁移数据，使得 hot-warm 架构变得多余。
:::

### Rollups vs 增量聚合 {#rollups-vs-incremental-aggregates}

在 Elasticsearch 中，**rollups** 或 **aggregates** 是通过一种称为 [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html) 的机制来实现的。它们用于以固定时间间隔（例如按小时或按天）汇总时序数据，采用的是一种**滑动窗口**模型。这些 transform 被配置为周期性后台作业，从一个索引中聚合数据，并将结果写入单独的 **rollup 索引**。通过避免反复扫描高基数原始数据，这有助于降低长时间范围查询的成本。

下图以抽象方式勾勒出 transforms 的工作原理（注意我们使用蓝色表示属于同一个 bucket 的所有文档，我们希望为该 bucket 预先计算聚合值）：

<Image img={elasticsearch_transforms} alt="Elasticsearch transforms" size="lg"/>

连续 transforms 使用基于可配置检查时间间隔（transform [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html)，默认值为 1 分钟）的 transform [checkpoints](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)。在上图中，我们假设 ① 在检查时间间隔过去后创建了一个新的 checkpoint。此时 Elasticsearch 会检查 transform 源索引中的变化，并检测到自上一个 checkpoint 以来出现的三个新的 `blue` 文档（11、12 和 13）。因此，会对源索引中所有现有的 `blue` 文档进行过滤，并使用 [composite aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)（以利用结果的 [pagination](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)）重新计算聚合值（并在目标索引中用一个新文档替换包含先前聚合值的文档）。类似地，在 ② 和 ③，会通过检查变化，并从所有属于同一“blue” bucket 的现有文档重新计算聚合值来处理新的 checkpoints。

ClickHouse 采用了根本不同的方法。与其周期性地重新聚合数据，ClickHouse 支持**增量物化视图**，在**写入时**对数据进行转换和聚合。当新数据写入源表时，物化视图只会针对新的**插入数据块**执行预定义的 SQL 聚合查询，并将聚合结果写入目标表。



该模型得益于 ClickHouse 对[**部分聚合状态（partial aggregate states）**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)的支持——这是聚合函数的中间表示形式，可以存储并在之后进行合并。借此，用户可以维护部分聚合结果，查询速度快、更新成本低。由于聚合在数据写入时就发生，因此无需运行昂贵的周期性任务或对历史数据反复汇总。

我们在抽象层面简要说明增量物化视图的机制（注意，我们使用蓝色表示属于同一分组的所有行，并希望为该分组预先计算聚合值）：

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

在上图中，物化视图的源表已经包含一个数据 part，其中存储了一些属于同一分组的 `blue` 行（1 到 10）。对于该分组，视图目标表中也已经存在一个数据 part，其中存储了 `blue` 分组的[部分聚合状态](https://www.youtube.com/watch?v=QDAJTKZT8y4)。当发生 ① ② ③ 次向源表插入新行时，会为每次插入创建一个对应的源表数据 part，并且同时，仅针对每个新插入行的 block（数据块）计算一个部分聚合状态，并以数据 part 的形式插入到物化视图的目标表中。④ 在后台进行 part 合并时，这些部分聚合状态会被合并，从而实现增量数据聚合。

请注意，所有[聚合函数](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)（超过 90 个），包括它们与聚合函数[组合器（combinators）](https://www.youtube.com/watch?v=7ApwD0cfAFI)的组合，都支持[部分聚合状态](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)。

关于 Elasticsearch 与 ClickHouse 在增量聚合方面的一个更具体示例，请参见此[示例](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)。

ClickHouse 这种方法的优势包括：

- **始终最新的聚合结果**：物化视图始终与源表保持同步。
- **无需后台任务**：将聚合从查询时前移到写入时完成。
- **更佳的实时性能**：非常适合需要即时获取最新聚合结果的可观测性工作负载和实时分析。
- **可组合性强**：物化视图可以分层，或与其他视图和表进行关联，用于更复杂的查询加速策略。
- **不同的 TTL**：可以对物化视图的源表和目标表应用不同的 TTL 设置。

这种模型对于可观测性场景尤为强大，用户可以在无需为每个查询扫描数十亿条原始记录的情况下，计算诸如每分钟错误率、延迟或 Top-N 细分等指标。

### Lakehouse support {#lakehouse-support}

ClickHouse 与 Elasticsearch 在 lakehouse（湖仓一体）集成方面采用了根本不同的方法。ClickHouse 是一个完备的查询执行引擎，能够对 [Iceberg](/sql-reference/table-functions/iceberg) 和 [Delta Lake](/sql-reference/table-functions/deltalake) 等 lakehouse 格式执行查询，并与 [AWS Glue](/use-cases/data-lake/glue-catalog) 和 [Unity catalog](/use-cases/data-lake/unity-catalog) 等数据湖目录集成。这些格式依赖对 [Parquet](/interfaces/formats/Parquet) 文件的高效查询，而 ClickHouse 对 Parquet 提供了完整支持。ClickHouse 可以直接读取 Iceberg 和 Delta Lake 表，从而与现代数据湖架构无缝集成。

相比之下，Elasticsearch 与其内部数据格式和基于 Lucene 的存储引擎紧密耦合。它无法直接查询 lakehouse 格式或 Parquet 文件，因此在参与现代数据湖架构方面受到限制。Elasticsearch 需要先将数据转换并加载到其专有格式中，之后才能被查询。

ClickHouse 的 lakehouse 能力不仅仅局限于读取数据：



- **数据目录集成**：ClickHouse 支持与 [AWS Glue](/use-cases/data-lake/glue-catalog) 等数据目录集成，从而自动发现并访问对象存储中的表。
- **对象存储支持**：原生支持查询位于 [S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) 中的数据，而无需移动数据。
- **查询联邦**：能够使用 [外部字典](/dictionary) 和 [表函数](/sql-reference/table-functions) 在湖仓表、传统数据库以及 ClickHouse 表等多个数据源之间进行数据关联分析。
- **增量加载**：支持将湖仓表中的数据持续加载到本地 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中，利用 [S3Queue](/engines/table-engines/integrations/s3queue) 和 [ClickPipes](/integrations/clickpipes) 等特性。
- **性能优化**：使用 [cluster functions](/sql-reference/table-functions/cluster) 对湖仓数据执行分布式查询，以提升性能。

这些能力使 ClickHouse 自然适用于采用湖仓架构的组织，既能利用数据湖的灵活性，又能发挥列式数据库的高性能优势。 
