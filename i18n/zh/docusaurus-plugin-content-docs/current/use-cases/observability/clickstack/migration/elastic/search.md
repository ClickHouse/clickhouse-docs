---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: '使用 ClickStack 和 Elastic 进行搜索'
pagination_prev: null
pagination_next: null
sidebar_label: '搜索'
sidebar_position: 3
description: '使用 ClickStack 和 Elastic 进行搜索'
doc_type: 'guide'
keywords: ['clickstack', '搜索', '日志', '可观测性', '全文搜索']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## 在 ClickStack 和 Elastic 中搜索 {#search-in-clickstack-and-elastic}

ClickHouse 是原生支持 SQL 的引擎，自底向上为高性能分析型工作负载而设计。相比之下，Elasticsearch 提供的是类 SQL 接口，会将 SQL 转译为底层的 Elasticsearch 查询 DSL——这意味着 SQL 并非一等公民，其[功能对等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)存在诸多限制。

ClickHouse 不仅完整支持 SQL，还通过一系列以可观测性为重点的函数（例如 [`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) 和 [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)）进行扩展，从而简化对结构化日志、指标与链路追踪数据的查询。

对于简单的日志和链路追踪探索，HyperDX 提供了 [Lucene 风格语法](/use-cases/observability/clickstack/search)，用于直观的基于文本的过滤，包括字段-值查询、范围、通配符等。这与 Elasticsearch 中的 [Lucene 语法](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)以及 [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql) 的部分特性类似。

<Image img={hyperdx_search} alt="Search" size="lg"/>

HyperDX 的搜索界面支持这种熟悉的语法，但会在幕后将其转换为高效的 SQL `WHERE` 子句，使 Kibana 用户获得熟悉的使用体验，同时在需要时仍可让用户利用 SQL 的强大能力。借此，用户可以充分使用 ClickHouse 中完整的[字符串搜索函数](/sql-reference/functions/string-search-functions)、[相似度函数](/sql-reference/functions/string-functions#stringJaccardIndex)以及[日期时间函数](/sql-reference/functions/date-time-functions)。

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

下面我们将对比 ClickStack 和 Elasticsearch 各自的 Lucene 查询语言。



## ClickStack 搜索语法与 Elasticsearch 查询字符串对比 {#hyperdx-vs-elasticsearch-query-string}

HyperDX 和 Elasticsearch 都提供了灵活的查询语言，用于实现直观的日志和追踪过滤。Elasticsearch 的查询字符串与其 DSL 和索引引擎紧密集成，而 HyperDX 支持受 Lucene 启发的语法，并在底层转换为 ClickHouse SQL。下表说明了常见搜索模式在两个系统中的行为，突出语法上的相似性以及后端执行方式的差异。

| **Feature** | **HyperDX Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | 在所有已索引字段上匹配；在 ClickStack 中会被重写为多字段 SQL `ILIKE`。 |
| Field match             | `level:error` | `level:error` | 语法完全相同。HyperDX 会在 ClickHouse 中匹配字段的精确值。 |
| Phrase search           | `"disk full"` | `"disk full"` | 带引号的文本会匹配精确的字符串序列；ClickHouse 使用字符串相等或 `ILIKE`。 |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | 转换为 SQL `ILIKE` 或精确匹配。 |
| OR conditions           | `error OR warning` | `error OR warning` | 术语之间的逻辑 OR；两个系统都原生支持。 |
| AND conditions          | `error AND db` | `error AND db` | 都会转换为交集；用户语法无差异。 |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | 支持方式相同；HyperDX 转换为 SQL `NOT ILIKE`。 |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | 两者都支持标准的布尔分组。 |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | HyperDX 支持前后通配符；ES 默认出于性能原因禁用前导通配符。不支持在词项内部使用通配符，例如 `f*ail`。通配符必须配合字段匹配一起使用。|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX 使用 SQL `BETWEEN`；Elasticsearch 展开为范围查询。不支持在范围中使用无界 `*`，例如 `duration:[100 TO *]`。如有需要，请使用下方的 “Unbounded ranges”。|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | HyperDX 使用标准 SQL 运算符。|
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | 花括号表示排他边界。不支持在范围中使用 `*`，例如 `duration:[100 TO *]`。|
| Exists check            | N/A                       | `_exists_:user` or `field:*` | 不支持 `_exists_`。`Map` 列（例如 `LogAttributes`）请使用 `LogAttributes.log.file.path: *`。对于根级列，这些列必须存在，如果事件中未包含，则会赋予默认值。要搜索默认值或缺失列，请使用与 Elasticsearch 相同的语法，例如 `ServiceName:*` 或 `ServiceName != ''`。 |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | 当前在 Lucene 语法中不支持。用户可以使用 SQL 以及 [`match`](/sql-reference/functions/string-search-functions#match) 函数或其他[字符串搜索函数](/sql-reference/functions/string-search-functions)。|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | 当前在 Lucene 语法中不支持。可以在 SQL 中使用距离函数，例如 `editDistance('rror', SeverityText) = 1` 或[其他相似度函数](/sql-reference/functions/string-functions#jaroSimilarity)。 |
| Proximity search        | Not supported                       | `"fox quick"~5` | 当前在 Lucene 语法中不支持。 |
| Boosting                | `quick^2 fox` | `quick^2 fox` | 当前在 HyperDX 中不支持。 |
| Field wildcard          | `service.*:error` | `service.*:error` | 当前在 HyperDX 中不支持。 |
| Escaped special chars   | 使用 `\` 转义保留字符 | Same      | 需要对保留符号进行转义。 |



## 存在/缺失差异 {#empty-value-differences}

与 Elasticsearch 不同，在 Elasticsearch 中，一个字段可以在事件中被完全省略，从而真正意义上“不存在”；而在 ClickHouse 中，表结构中的所有列都必须存在。如果在插入事件中没有提供某个字段：

- 对于 [`Nullable`](/sql-reference/data-types/nullable) 字段，该字段会被设置为 `NULL`。
- 对于非 Nullable 字段（默认情况），该字段会被填充为默认值（通常是空字符串、0 或等价值）。

在 ClickStack 中，我们采用后者做法，因为 [`Nullable`](/sql-reference/data-types/nullable) [不被推荐](/optimize/avoid-nullable-columns)。

这种行为意味着，无法像在 Elasticsearch 中那样，直接检查某个字段在 Elasticsearch 语义上的“存在”状态。

相应地，用户可以使用 `field:*` 或 `field != ''` 来检查某个字段是否具有非空值。因此，无法区分真正缺失的字段和被显式设置为空的字段。

在实践中，这一差异很少会对可观测性场景造成问题，但在系统间迁移或翻译查询时，牢记这一点非常重要。
