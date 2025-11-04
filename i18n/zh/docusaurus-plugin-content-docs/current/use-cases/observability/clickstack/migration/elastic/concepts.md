---
'slug': '/use-cases/observability/clickstack/migration/elastic/concepts'
'title': 'ClickStack和Elastic中的等效概念'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '等效概念'
'sidebar_position': 1
'description': '等效概念 - ClickStack和Elastic'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import elasticsearch from '@site/static/images/use-cases/observability/elasticsearch.png';
import clickhouse from '@site/static/images/use-cases/observability/clickhouse.png';
import clickhouse_execution from '@site/static/images/use-cases/observability/clickhouse-execution.png';
import elasticsearch_execution from '@site/static/images/use-cases/observability/elasticsearch-execution.png';
import elasticsearch_transforms from '@site/static/images/use-cases/observability/es-transforms.png';
import clickhouse_mvs from '@site/static/images/use-cases/observability/ch-mvs.png';

## Elastic Stack与ClickStack的对比 {#elastic-vs-clickstack}

Elastic Stack和ClickStack都涵盖了可观察性平台的核心角色，但它们在设计理念上有所不同。这些角色包括：

- **UI和警报**：用于查询数据、构建仪表板和管理警报的工具。
- **存储和查询引擎**：负责存储可观察性数据和处理分析查询的后台系统。
- **数据收集和ETL**：收集遥测数据并在摄取之前处理它的代理和管道。

下面的表格概述了每个栈如何将其组件映射到这些角色：

| **角色** | **Elastic Stack** | **ClickStack** | **备注** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI和警报** | **Kibana** — 仪表板、搜索和警报      | **HyperDX** — 实时UI、搜索和警报   | 两者作为用户的主要界面，包括可视化和警报管理。HyperDX是专为可观察性而构建，并紧密结合OpenTelemetry语义。 |
| **存储和查询引擎** | **Elasticsearch** — JSON文档存储，带有倒排索引 | **ClickHouse** — 列式数据库，带有矢量化引擎 | Elasticsearch使用为搜索优化的倒排索引；ClickHouse使用列式存储和SQL为结构化和半结构化数据提供高速分析。 |
| **数据收集** | **Elastic Agent**、**Beats**（例如Filebeat、Metricbeat） | **OpenTelemetry Collector**（边缘 + 网关）     | Elastic支持自定义发货者和由Fleet管理的统一代理。ClickStack依赖OpenTelemetry，允许与供应商无关的数据收集和处理。 |
| **工具包SDK** | **Elastic APM agents**（专有） | **OpenTelemetry SDKs**（由ClickStack分发） | Elastic SDK与Elastic Stack绑定。ClickStack基于OpenTelemetry SDKs构建，支持主要语言的日志、指标和追踪。 |
| **ETL / 数据处理** | **Logstash**，摄取管道                   | **OpenTelemetry Collector** + ClickHouse物化视图 | Elastic使用摄取管道和Logstash进行转化。ClickStack通过物化视图和OTel collector处理器将计算推到插入时间，有效地增量转换数据。 |
| **架构理念** | 垂直集成，专有代理和格式 | 基于开放标准，松耦合组件   | Elastic构建了一个紧密集成的生态系统。ClickStack强调模块化和标准（OpenTelemetry、SQL、对象存储）的灵活性和成本效率。 |

ClickStack强调开放标准和互操作性，从收集到UI完全基于OpenTelemetry。相比之下，Elastic提供了一个紧密耦合但更垂直集成的生态系统，采用专有代理和格式。

鉴于**Elasticsearch**和**ClickHouse**是各自堆栈中负责数据存储、处理和查询的核心引擎，了解它们的区别至关重要。这些系统支撑了整个可观察性架构的性能、可扩展性和灵活性。接下来的部分将探讨Elasticsearch和ClickHouse之间的关键差异，包括它们如何建模数据、处理摄取、执行查询和管理存储。
## Elasticsearch与ClickHouse的对比 {#elasticsearch-vs-clickhouse}

ClickHouse和Elasticsearch使用不同的底层模型组织和查询数据，但许多核心概念服务于类似的目的。本节概述了熟悉Elastic的用户的关键等价项，并将其映射到ClickHouse的对应项。尽管术语不同，大多数可观察性工作流可以在ClickStack中重现——通常更为高效。
### 核心结构概念 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL** | **描述** |
|-------------------|----------------------|------------------|
| **字段** | **列** | 数据的基本单元，包含一个或多个特定类型的值。Elasticsearch字段可以存储原始值以及数组和对象。字段只能有一种类型。ClickHouse也支持数组和对象（`Tuples`、`Maps`、`Nested`），以及动态类型，如[`Variant`](/sql-reference/data-types/variant)和[`Dynamic`](/sql-reference/data-types/dynamic)，允许列具有多种类型。 |
| **文档** | **行** | 字段（列）的集合。Elasticsearch文档默认更灵活，可以根据数据动态添加新字段（类型从中推断）。ClickHouse行在默认情况下是模式绑定的，用户需要插入行或子集的所有列。ClickHouse中的[`JSON`](/integrations/data-formats/json/overview)类型支持根据插入数据创建相应的半结构化动态列。 |
| **索引** | **表** | 查询执行和存储的单位。在两个系统中，查询都是针对索引或表运行，存储行/文档。 |
| *隐式* | 模式（SQL）         | SQL模式将表分组到命名空间，通常用于访问控制。Elasticsearch和ClickHouse不具备模式，但都支持通过角色和RBAC进行行和表级安全性。 |
| **集群** | **集群 / 数据库** | Elasticsearch集群是管理一个或多个索引的运行实例。在ClickHouse中，数据库在逻辑命名空间内组织表，提供与Elasticsearch中集群相同的逻辑分组。ClickHouse集群是一组分布式节点，类似于Elasticsearch，但与数据本身解耦且独立。 |
### 数据建模和灵活性 {#data-modeling-and-flexibility}

Elasticsearch因其通过[动态映射](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping)实现的模式灵活性而闻名。字段随着文档的摄取而创建，并且类型自动推断——除非明确指定模式。ClickHouse默认更严格——表是以显式模式定义的——但通过[`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant)和[`JSON`](/integrations/data-formats/json/overview)类型提供灵活性。这些类型支持半结构化数据的摄取，动态列创建和类型推断与Elasticsearch类似。类似地，[`Map`](/sql-reference/data-types/map)类型允许存储任意键值对——不过对键和值都强制执行单一类型。

ClickHouse对类型灵活性的处理更加透明和受控。与可能因类型冲突而导致摄入错误的Elasticsearch不同，ClickHouse允许[`Variant`](/sql-reference/data-types/variant)列中的混合类型数据，并通过使用[`JSON`](/integrations/data-formats/json/overview)类型支持模式演变。

如果不使用[`JSON`](/integrations/data-formats/json/overview)，模式是静态定义的。如果未为行提供值，它们将被定义为[`Nullable`](/sql-reference/data-types/nullable)（在ClickStack中不使用）或恢复为该类型的默认值，例如`String`的空值。
### 摄取和转换 {#ingestion-and-transformation}

Elasticsearch使用摄取管道与处理器（例如`enrich`，`rename`，`grok`）在索引之前转换文档。在ClickHouse中，类似的功能通过[**增量物化视图**](/materialized-view/incremental-materialized-view)实现，这可以[过滤、转换](/materialized-view/incremental-materialized-view#filtering-and-transformation)或[增强](/materialized-view/incremental-materialized-view#lookup-table)传入的数据，并将结果插入目标表。如果只需要物化视图的输出被存储，可以插入到`Null`表引擎。这意味着只有物化视图的结果会保留，而原始数据被丢弃——从而节省存储空间。

对于增强，Elasticsearch支持专用的[增强处理器](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor)为文档添加上下文。在ClickHouse中，[**字典**](/dictionary)可以在[查询时间](/dictionary#query-time-enrichment)和[摄取时间](/dictionary#index-time-enrichment)用于增强行——例如，用于[将IP映射到位置](/use-cases/observability/schema-design#using-ip-dictionaries)或在插入时应用[用户代理查找](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)。
### 查询语言 {#query-languages}

Elasticsearch支持多种查询语言，包括[DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql)和[KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)（Lucene风格）查询，但对连接的支持有限——只有通过[`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join)可以进行**左外连接**。ClickHouse支持**完整的SQL语法**，包括[所有连接类型](/sql-reference/statements/select/join#supported-types-of-join)、[窗口函数](/sql-reference/window-functions)、子查询（以及相关子查询）和CTE。这是需要关联可观察性信号与业务或基础设施数据的用户的一大优势。

在ClickStack中，[HyperDX提供与Lucene兼容的搜索界面](/use-cases/observability/clickstack/search)以便于过渡，同时通过ClickHouse后端提供完整的SQL支持。该语法可与[Elastic查询字符串](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)语法进行比较。有关此语法的确切比较，请参见["ClickStack与Elastic中的搜索"](/use-cases/observability/clickstack/migration/elastic/search)。
### 文件格式和接口 {#file-formats-and-interfaces}

Elasticsearch支持JSON（和[有限的CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)）摄取。ClickHouse支持超过**70种文件格式**，包括Parquet、Protobuf、Arrow、CSV等——用于摄取和导出。这使得与外部管道和工具的集成更加便捷。

两个系统都提供REST API，但ClickHouse还提供**原生协议**以实现低延迟、高吞吐量的交互。原生接口比HTTP支持查询进度、压缩和流式传输，更加高效，是大多数生产摄取的默认模式。
### 索引与存储 {#indexing-and-storage}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

分片的概念是Elasticsearch可扩展性模型的基础。每个 ① [**索引**](https://www.elastic.co/blog/what-is-an-elasticsearch-index)被划分为**分片**，每个分片是物理Lucene索引，存储为磁盘上的段。一个分片可以有一个或多个称为副本分片的物理副本以保证弹性。为了实现可扩展性，分片和副本可以分布在多个节点之间。单个分片 ② 由一个或多个不可变段组成。段是Lucene的基本索引结构，这是提供索引和搜索功能的Java库，Elasticsearch基于该库开发。

:::note Elasticsearch中的插入处理
Ⓐ 新插入的文档 Ⓑ 首先进入一个默认每秒刷新一次的内存索引缓冲区。使用路由公式确定冲刷文档的目标分片，并在磁盘上为该分片写入新段。为了提高查询效率并实现已删除或更新文档的物理删除，段会在后台不断合并为更大的段，直到达到最大大小5GB。然而，仍然可以强制合并为更大的段。
:::

Elasticsearch建议将分片大小设置为约[50GB或2亿文档](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards)，因为存在[JVM堆和元数据开销](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead)。每个分片还有[最多20亿文档](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit)的硬限制。Elasticsearch对各个分片的查询进行并行化处理，但每个分片使用**单线程**进行处理，使得分片过多既昂贵又适得其反。这在本质上将分片与可扩展性紧密耦合，需要更多的分片（和节点）以提升性能。

Elasticsearch将所有字段索引到[**倒排索引**](https://www.elastic.co/docs/manage-data/data-store/index-basics)中以实现快速搜索，可选择使用[**文档值**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values)进行聚合、排序和脚本字段访问。数值和地理字段使用[块K-D树](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf)进行地理空间数据和数字、日期范围的搜索。

重要的是，Elasticsearch在[`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field)中存储完整的原始文档（用`LZ4`、`Deflate`或`ZSTD`压缩），而ClickHouse不存储单独的文档表示。数据在查询时从列中重构，节省存储空间。这种相同的能力也可以通过Elasticsearch使用[合成的`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source)实现，但有一些[限制](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)。禁用`_source`的做法也有[影响](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude)，这些影响对ClickHouse没有适用性。

在Elasticsearch中，[索引映射](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（相当于ClickHouse的表模式）控制字段的类型和用于这种持久性与查询的数据结构。

相比之下，ClickHouse是**列式**的——每列独立存储，但始终按表的主键/排序键排序。这种排序使[稀疏主索引](/primary-indexes)成为可能，允许ClickHouse在查询执行期间有效跳过数据。当查询按主键字段过滤时，ClickHouse仅读取每列的相关部分，显著减少磁盘I/O并提高性能——即使没有对每列进行完整索引。

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse还支持[**跳过索引**](/optimize/skipping-indexes)，通过预计算所选列的索引数据来加速过滤。这些必须显式定义，但可以显著提高性能。此外，ClickHouse允许用户为每列指定[压缩编解码器](/use-cases/observability/schema-design#using-codecs)和压缩算法——这是Elasticsearch不支持的（其[压缩](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules)仅适用于`_source` JSON存储）。

ClickHouse也支持分片，但其模型旨在偏向**垂直扩展**。单个分片可以存储**万亿行**，并在内存、CPU和磁盘允许的情况下继续高效运行。与Elasticsearch不同，分片没有**硬行限制**。ClickHouse中的分片是逻辑的——有效地是单独的表——除非数据集超过单个节点的容量，否则不需要分区。这通常由于磁盘大小限制而发生，在这种情况下，只有当需要水平扩展时，① 才引入分片——从而减少复杂性和开销。在这种情况下，类似于Elasticsearch，一个分片将包含数据的子集。单个分片中的数据组织为包含多个数据结构的② 不可变数据部分。

ClickHouse分片内的处理是**完全并行化**的，鼓励用户纵向扩展以避免与跨节点移动数据相关的网络成本。

:::note ClickHouse中的插入处理
ClickHouse中的插入默认是**同步的**——写入只有在提交后才会被确认——但可以配置为**异步插入**以匹配类似Elastic的缓冲和批处理。如果使用[异步数据插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，Ⓐ 新插入的行首先进入Ⓑ 默认每200毫秒刷新一次的内存插入缓冲区。如果使用多个分片，则使用[分布式表](/engines/table-engines/special/distributed)将新插入的行路由到其目标分片。为该分片在磁盘上写入一个新部分。
:::
### 分布与复制 {#distribution-and-replication}

虽然Elasticsearch和ClickHouse都使用集群、分片和副本来确保可扩展性和容错能力，但它们的实现和性能特征差异显著。

Elasticsearch使用**主-副本**模型进行复制。当数据写入主分片时，它会同步复制到一个或多个副本。这些副本本身就是分布在节点之间以确保冗余的完整分片。Elasticsearch仅在所有所需副本确认操作后才会确认写入——这个模型提供接近**顺序一致性**的保证，尽管在完全同步之前，副本上可能会发生**脏读取**。一个**主节点**协调集群，管理分片分配、健康状况和领导者选举。

相反，ClickHouse默认采用**最终一致性**，由**Keeper**协调——这是ZooKeeper的轻量级替代品。写入可以直接发送到任何副本，或者通过[**分布式表**](/engines/table-engines/special/distributed)发送，后者自动选择副本。复制是异步的——更改在写入确认后传播到其他副本。对于更严格的保证，ClickHouse[支持**顺序一致性**](/migrations/postgresql/appendix#sequential-consistency)，在所有副本都提交后才确认写入，虽然由于其性能影响很少使用。分布式表统一跨多个分片的访问，将`SELECT`查询转发到所有分片并合并结果。对于`INSERT`操作，它们通过均匀路由数据来平衡负载。ClickHouse的复制高度灵活：任何副本（一个分片的副本）都可以接受写入，所有更改都以异步方式同步到其他副本。这种架构容许在故障或维护期间不中断查询服务，重新同步自动处理——消除了对数据层的主-副本强制执行的需求。

:::note ClickHouse Cloud
在**ClickHouse Cloud**中，架构引入了一种无共享计算模型，其中单个**分片由对象存储**支持。这取代了基于副本的传统高可用性，允许多个节点同时**读取和写入**分片。存储与计算的分离使得弹性扩展成为可能，而无需显式的副本管理。
:::

总结如下：

- **Elastic**：分片是与JVM内存相关的物理Lucene结构。过度分片会引入性能惩罚。复制是同步的，由主节点协调。
- **ClickHouse**：分片是逻辑的且垂直可扩展，具有高度有效的本地执行。复制是异步的（但可以是顺序的），协调轻量。

最终，ClickHouse通过最小化对分片调优的需求，在规模上更偏向于简化和性能，同时在需要时提供强一致性保证。
### 去重与路由 {#deduplication-and-routing}

Elasticsearch根据其`_id`对文档进行去重，相应地将它们路由到分片。ClickHouse不存储默认行标识符，但支持**插入时去重**，允许用户安全地重试失败的插入。为了获得更多控制，`ReplacingMergeTree`和其他表引擎允许按特定列去重。

Elasticsearch中的索引路由确保特定文档始终路由到特定分片。在ClickHouse中，用户可以定义**分片键**，或使用`Distributed`表实现类似的数据本地性。
### 聚合与执行模型 {#aggregations-execution-model}

虽然两个系统都支持数据聚合，但ClickHouse提供显著[更多的函数](/sql-reference/aggregate-functions/reference)，包括统计、近似和专有分析函数。

在可观察性用例中，聚合最常见的应用之一是计算特定日志消息或事件发生的频率（并在频率异常时发出警报）。

Elasticsearch中相当于ClickHouse `SELECT count(*) FROM ... GROUP BY ...` SQL查询的是[术语聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)，这是Elasticsearch的[桶聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)。

ClickHouse的`GROUP BY`与`count(*)`和Elasticsearch的术语聚合在功能上通常是等价的，但在实现、性能和结果质量上有着广泛的差异。

在Elasticsearch中，这种聚合在“top-N”查询中[估算结果](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)（例如，按计数排序的前10个主机），当查询的数据跨多个分片时。这种估算提高了速度，但可能会影响准确性。用户可以通过[检查`doc_count_error_upper_bound`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)和增加`shard_size`参数来减少此错误——这增加了内存使用并降低了查询性能。

Elasticsearch还要求所有桶聚合都需要设置[`size`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)——没有办法返回所有唯一组而不显式设置限制。高基数聚合会面临[`max_buckets`限制](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)或需要使用[复合聚合](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation)进行分页，这往往复杂且效率较低。

相比之下，ClickHouse的精确聚合开箱即用。像`count(*)`这样的函数在不需要配置调整的情况下返回准确的结果，使查询行为更简单和可预测。

ClickHouse没有大小限制。您可以在大型数据集上执行无界的组聚合查询。如果超出内存阈值，ClickHouse[可以溢出到磁盘](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)。按主键前缀进行分组的聚合尤其高效，通常运行时所需的内存消耗最小。
#### 执行模型 {#execution-model}

上述差异可以归因于Elasticsearch和ClickHouse的执行模型，它们在查询执行和并行性方面采用了根本不同的方法。

ClickHouse旨在最大化现代硬件的效率。默认情况下，ClickHouse在具有N个CPU核心的机器上以N个并发执行通道运行SQL查询：

<Image img={clickhouse_execution} alt="ClickHouse execution" size="lg"/>

在单节点上，执行通道将数据划分为独立的范围，允许在CPU线程上并行处理。这包括过滤、聚合和排序。每个通道的本地结果最终被合并，并在查询包含限制子句时应用限制操作符。

查询执行通过以下方式进一步并行化：
1. **SIMD矢量化**：在列式数据上的操作使用[CPU SIMD指令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)（例如，[AVX512](https://en.wikipedia.org/wiki/AVX-512)），允许对值进行批处理。
2. **集群级并行性**：在分布式设置中，每个节点本地执行查询处理。来自各个节点的[部分聚合状态](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)被流式传输到发起节点并合并。如果查询的`GROUP BY`键与分片键对齐，可以[大幅减少或完全避免合并](/operations/settings/settings#distributed_group_by_no_merge)。
<br/>
该模型能够在核心和节点之间有效扩展，使ClickHouse非常适合大规模分析。使用*部分聚合状态*使来自不同线程和节点的中间结果可以无损合并。

相比之下，Elasticsearch为大多数聚合分配一个线程到每个分片，无论可用的CPU核心数量。这些线程返回分片本地的top-N结果，这些结果在协调节点上合并。这种方式可能会低效利用系统资源，并引入潜在的全局聚合不准确性，尤其是当频繁出现的术语分散在多个分片时。通过增加`shard_size`参数可以改善准确性，但会增加内存使用和查询延迟。

<Image img={elasticsearch_execution} alt="Elasticsearch execution" size="lg"/>

总之，ClickHouse以更细粒度的并行性和对硬件资源的更大控制来执行聚合和查询，而Elasticsearch则依赖于基于分片的执行，约束更为严格。

有关各自技术中聚合机制的更多详细信息，我们推荐博客文章["ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)。
### 数据管理 {#data-management}

Elasticsearch和ClickHouse在管理时间序列可观察性数据方面采取了根本不同的方法——特别是在数据保留、轮换和分层存储方面。
#### 索引生命周期管理与原生TTL {#lifecycle-vs-ttl}

在Elasticsearch中，长期数据管理通过**索引生命周期管理（ILM）**和**数据流**来处理。这些功能允许用户定义管理何时轮换索引的策略（例如，在达到某个大小或年龄后），何时将旧索引移动到低成本存储（例如，温暖或寒冷级别），以及何时最终删除它们。这是必要的，因为Elasticsearch不**支持重新分片**，且分片不会无限增长而不降低性能。为了管理分片大小，并支持高效删除，必须定期创建新索引并移除旧索引——有效地在索引级别轮换数据。

ClickHouse采取不同的方法。数据通常存储在**单个表中**，并使用**TTL（存活时间）表达式**在列或分区级别进行管理。数据可以按日期**进行分区**，允许高效删除，而无需创建新表或执行索引轮换。随着数据的老化并满足TTL条件，ClickHouse将自动删除数据——无需额外的基础设施来管理轮换。
#### 存储层次和热-温架构 {#storage-tiers}

Elasticsearch支持**热-温-冷-冻结**存储架构，其中数据在不同性能特征的存储层之间移动。这通常通过ILM配置，并与集群中的节点角色相关。

ClickHouse通过原生表引擎（如`MergeTree`）支持**分层存储**，可以根据自定义规则自动在不同【卷】之间移动旧数据（例如，从SSD到HDD再到对象存储）。这可以模仿Elastic的热-温-冷方法——但无需管理多个节点角色或集群的复杂度。

:::note ClickHouse Cloud
在**ClickHouse Cloud**中，这变得更加无缝：所有数据存储在**对象存储（例如S3）**上，并且计算被解耦。数据可以保留在对象存储中，直到被查询，此时会被提取并在本地（或在分布式缓存中）缓存——提供与Elastic的冻结层相同的成本特征，但具有更好的性能特征。这种方法意味着不需要在存储层之间移动数据，从而使热-温架构变得冗余。
:::
### Rollups vs incremental aggregates {#rollups-vs-incremental-aggregates}

在Elasticsearch中，**rollups**或**aggregates**是通过一种叫做[**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html)的机制实现的。这些机制用于在固定时间间隔（例如，每小时或每天）内使用**滑动窗口**模型汇总时间序列数据。这些配置为定期后台作业，从一个索引聚合数据并将结果写入一个单独的**rollup index**。这有助于通过避免重复扫描高基数原始数据来降低长时间查询的成本。

下面的图示抽象性地描绘了transform是如何工作的（请注意，我们使用蓝色表示所有属于同一桶的文档，我们希望预先计算其聚合值）：

<Image img={elasticsearch_transforms} alt="Elasticsearch transforms" size="lg"/>

连续transform使用基于可配置检查间隔时间的transform [checkpoints](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)（transform [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html)的默认值为1分钟）。在上面的图中，我们假设在检查间隔时间到期后创建一个新的检查点。现在，Elasticsearch检查transform的源索引的变化，并检测到自上一个检查点以来存在三个新的`blue`文档（11、12和13）。因此，源索引被过滤为所有已有的`blue`文档，并且通过[复合聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)（利用结果[分页](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)），重新计算聚合值（目标索引被用新文档替换，更新包含先前聚合值的文档）。同样，在②和③处，通过检查变化并重新计算属于同一'blue'桶的所有现有文档的聚合值来处理新的检查点。

ClickHouse采取根本不同的方法。与其定期重新聚合数据，ClickHouse支持**增量物化视图**，在**插入时间**对数据进行变换和聚合。当新数据写入源表时，物化视图对仅新**插入的块**执行预定义的SQL聚合查询，并将聚合结果写入目标表。

这种模型得益于ClickHouse对[**部分聚合状态**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)的支持——聚合函数的中间表示可以被存储和后续合并。这使得用户能够维护部分聚合结果，这些结果查询速度快且更新成本低。由于聚合在数据到达时发生，因此无需运行昂贵的定期作业或重新汇总旧数据。

我们抽象地勾勒了增量物化视图的机制（请注意，我们使用蓝色表示所有属于同一组的行，我们希望预先计算其聚合值）：

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

在上面的图中，物化视图的源表已经包含一个数据部分，存储一些属于同一组的`blue`行（1到10）。对于这个组，物化视图的目标表中也已经存在一个数据部分，存储`blue`组的[部分聚合状态](https://www.youtube.com/watch?v=QDAJTKZT8y4)。当在源表中进行①②③插入新行时，为每个插入创建一个相应的源表数据部分，并且针对每个新插入的行块并行计算并插入部分聚合状态以数据部分的形式到物化视图的目标表中。在后台部分合并过程中，部分聚合状态被合并，从而实现增量数据聚合。

请注意，所有[聚合函数](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)（超过90个），包括与聚合函数[组合器](https://www.youtube.com/watch?v=7ApwD0cfAFI)的组合，均支持[部分聚合状态](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)。

有关Elasticsearch与ClickHouse在增量聚合方面的更具体示例，请参见此[示例](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)。

ClickHouse方法的优点包括：

- **始终最新的聚合**：物化视图始终与源表同步。
- **无后台作业**：聚合在插入时间推送，而非查询时间。
- **更好的实时性能**：适用于观察工作负载和需要即时更新聚合的实时分析。
- **可组合性**：物化视图可以与其他视图和表层次分离或联接，以加速更复杂的查询。
- **不同的TTL**：可以对物化视图的源表和目标表应用不同的TTL设置。

此模型对于需要计算每分钟错误率、延迟或前N名分解等指标的观察用例非常强大，无需在每个查询中扫描数十亿的原始记录。

### Lakehouse support {#lakehouse-support}

ClickHouse和Elasticsearch在lakehouse集成方面采取根本不同的方法。ClickHouse是一个完整的查询执行引擎，能够对如[Iceberg](/sql-reference/table-functions/iceberg)和[Delta Lake](/sql-reference/table-functions/deltalake)这样的lakehouse格式执行查询，同时也能与数据湖目录如[AWS Glue](/use-cases/data-lake/glue-catalog)和[Unity catalog](/use-cases/data-lake/unity-catalog)集成。这些格式依赖于高效查询[Parquet](/interfaces/formats/Parquet)文件，ClickHouse完全支持这种格式。ClickHouse可以直接读取Iceberg和Delta Lake表，从而实现与现代数据湖架构的无缝集成。

相反，Elasticsearch与其内部数据格式和基于Lucene的存储引擎紧密耦合。它无法直接查询lakehouse格式或Parquet文件，限制其参与现代数据湖架构的能力。Elasticsearch需要将数据转换并加载到其专有格式中，才能进行查询。

ClickHouse的lakehouse能力不仅限于读取数据：

- **数据目录集成**：ClickHouse支持与数据目录的集成，如[AWS Glue](/use-cases/data-lake/glue-catalog)，实现对对象存储中表的自动发现和访问。
- **对象存储支持**：原生支持查询驻留在[S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs)和[Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage)中的数据，而无需移动数据。
- **查询联合**：能够跨多个来源关联数据，包括lakehouse表、传统数据库和ClickHouse表，使用[外部字典](/dictionary)和[表函数](/sql-reference/table-functions)。
- **增量加载**：支持从lakehouse表持续加载数据到本地[MergeTree](/engines/table-engines/mergetree-family/mergetree)表，使用[S3Queue](/engines/table-engines/integrations/s3queue)和[ClickPipes](/integrations/clickpipes)等功能。
- **性能优化**：利用[集群函数](/sql-reference/table-functions/cluster)在lakehouse数据上进行分布式查询执行，以提高性能。

这些能力使ClickHouse成为采用lakehouse架构的组织的自然选择，允许它们利用数据湖的灵活性和列式数据库的性能。
