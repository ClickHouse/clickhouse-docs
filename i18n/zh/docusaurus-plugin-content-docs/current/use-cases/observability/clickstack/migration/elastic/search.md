---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: '在 ClickStack 和 Elastic 中进行搜索'
pagination_prev: null
pagination_next: null
sidebar_label: '搜索'
sidebar_position: 3
description: '在 ClickStack 和 Elastic 中进行搜索'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## ClickStack 和 Elastic 中的搜索 {#search-in-clickstack-and-elastic}

ClickHouse 是原生 SQL 引擎,从底层设计之初就面向高性能分析工作负载。相比之下,Elasticsearch 提供类 SQL 接口,将 SQL 转译为底层的 Elasticsearch 查询 DSL——这意味着 SQL 并非一等公民,[功能对等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)也受到限制。

ClickHouse 不仅支持完整的 SQL,还通过一系列面向可观测性的函数对其进行扩展,例如 [`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) 和 [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming),这些函数简化了对结构化日志、指标和追踪数据的查询。

对于简单的日志和追踪探索,HyperDX 提供 [Lucene 风格语法](/use-cases/observability/clickstack/search),用于直观的基于文本的过滤,支持字段值查询、范围、通配符等功能。这与 Elasticsearch 中的 [Lucene 语法](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)以及 [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql) 的部分元素相当。

<Image img={hyperdx_search} alt='搜索' size='lg' />

HyperDX 的搜索界面支持这种熟悉的语法,但在后台将其转换为高效的 SQL `WHERE` 子句,使 Kibana 用户感到熟悉,同时仍允许用户在需要时利用 SQL 的强大功能。这使用户能够充分利用 ClickHouse 中的全部[字符串搜索函数](/sql-reference/functions/string-search-functions)、[相似度函数](/sql-reference/functions/string-functions#stringJaccardIndex)和[日期时间函数](/sql-reference/functions/date-time-functions)。

<Image img={hyperdx_sql} alt='SQL' size='lg' />

下面,我们比较 ClickStack 和 Elasticsearch 的 Lucene 查询语言。


## ClickStack 搜索语法与 Elasticsearch 查询字符串对比 {#hyperdx-vs-elasticsearch-query-string}

HyperDX 和 Elasticsearch 都提供了灵活的查询语言,以实现直观的日志和追踪过滤。Elasticsearch 的查询字符串与其 DSL 和索引引擎紧密集成,而 HyperDX 则支持受 Lucene 启发的语法,在底层转换为 ClickHouse SQL。下表概述了常见搜索模式在两个系统中的行为方式,突出了语法的相似性和后端执行的差异。

| **功能**                     | **HyperDX 语法**                  | **Elasticsearch 语法**          | **说明**                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自由文本搜索                | `error`                             | `error`                           | 匹配所有已索引字段;在 ClickStack 中会被重写为多字段 SQL `ILIKE`。                                                                                                                                                                                                                                          |
| 字段匹配                     | `level:error`                       | `level:error`                     | 语法相同。HyperDX 在 ClickHouse 中匹配精确的字段值。                                                                                                                                                                                                                                                                       |
| 短语搜索                   | `"disk full"`                       | `"disk full"`                     | 引号内的文本匹配精确序列;ClickHouse 使用字符串相等或 `ILIKE`。                                                                                                                                                                                                                                                        |
| 字段短语匹配              | `message:"disk full"`               | `message:"disk full"`             | 转换为 SQL `ILIKE` 或精确匹配。                                                                                                                                                                                                                                                                                                 |
| OR 条件                   | `error OR warning`                  | `error OR warning`                | 术语的逻辑 OR;两个系统都原生支持。                                                                                                                                                                                                                                                                                                  |
| AND 条件                  | `error AND db`                      | `error AND db`                    | 两者都转换为交集;用户语法无差异。                                                                                                                                                                                                                                                                                             |
| 否定                        | `NOT error` 或 `-error`             | `NOT error` 或 `-error`           | 支持方式相同;HyperDX 转换为 SQL `NOT ILIKE`。                                                                                                                                                                                                                                                                               |
| 分组                        | `(error OR fail) AND db`            | `(error OR fail) AND db`          | 两者都使用标准布尔分组。                                                                                                                                                                                                                                                                                                        |
| 通配符                       | `error*` 或 `*fail*`                | `error*`、`*fail*`                | HyperDX 支持前导/尾随通配符;ES 默认禁用前导通配符以提高性能。不支持术语内的通配符,例如 `f*ail`。通配符必须与字段匹配一起使用。                                                                                                                                    |
| 范围(数值/日期)           | `duration:[100 TO 200]`             | `duration:[100 TO 200]`           | HyperDX 使用 SQL `BETWEEN`;Elasticsearch 扩展为范围查询。不支持范围中的无界 `*`,例如 `duration:[100 TO *]`。如需使用,请参见下面的 `无界范围`。                                                                                                                                                         |
| 无界范围(数值/日期) | `duration:>10` 或 `duration:>=10`   | `duration:>10` 或 `duration:>=10` | HyperDX 使用标准 SQL 运算符                                                                                                                                                                                                                                                                                                       |
| 包含/排除             | `duration:{100 TO 200}`(排除) | 相同                              | 花括号表示排除边界。不支持范围中的 `*`,例如 `duration:[100 TO *]`                                                                                                                                                                                                                                       |
| 存在性检查                    | 不适用                                 | `_exists_:user` 或 `field:*`      | 不支持 `_exists_`。对于 `Map` 列(例如 `LogAttributes`),使用 `LogAttributes.log.file.path: *`。对于根列,这些列必须存在,如果事件中未包含则具有默认值。要搜索默认值或缺失列,请使用与 Elasticsearch 相同的语法 `ServiceName:*` 或 `ServiceName != ''`。 |
| 正则表达式                           | `match` 函数                    | `name:/joh?n(ath[oa]n)/`          | Lucene 语法目前不支持。用户可以使用 SQL 和 [`match`](/sql-reference/functions/string-search-functions#match) 函数或其他[字符串搜索函数](/sql-reference/functions/string-search-functions)。                                                                                                      |
| 模糊匹配                     | `editDistance('quikc', field) = 1`  | `quikc~`                          | Lucene 语法目前不支持。可以在 SQL 中使用距离函数,例如 `editDistance('rror', SeverityText) = 1` 或[其他相似度函数](/sql-reference/functions/string-functions#jaroSimilarity)。                                                                                                                  |
| 邻近搜索                | 不支持                       | `"fox quick"~5`                   | Lucene 语法目前不支持。                                                                                                                                                                                                                                                                                                 |
| 权重提升                        | `quick^2 fox`                       | `quick^2 fox`                     | HyperDX 目前不支持。                                                                                                                                                                                                                                                                                                      |
| 字段通配符                  | `service.*:error`                   | `service.*:error`                 | HyperDX 目前不支持。                                                                                                                                                                                                                                                                                                      |
| 转义特殊字符           | 使用 `\` 转义保留字符 | 相同                              | 保留符号需要转义。                                                                                                                                                                                                                                                                                                                   |


## 存在/缺失差异 {#empty-value-differences}

与 Elasticsearch 不同,ClickHouse 要求表结构中的所有列都必须存在。在 Elasticsearch 中,字段可以完全从事件中省略,因此真正"不存在";而在 ClickHouse 中,如果插入事件时未提供某个字段:

- 对于 [`Nullable`](/sql-reference/data-types/nullable) 字段,将被设置为 `NULL`。
- 对于非空字段(默认情况),将填充默认值(通常是空字符串、0 或等效值)。

在 ClickStack 中,我们使用后者,因为[不推荐](/optimize/avoid-nullable-columns)使用 [`Nullable`](/sql-reference/data-types/nullable)。

这种行为意味着不直接支持检查字段在 Elasticsearch 意义上是否"存在"。

用户可以使用 `field:*` 或 `field != ''` 来检查是否存在非空值,但无法区分真正缺失的字段和显式为空的字段。

在实践中,这种差异很少对可观测性用例造成问题,但在系统之间转换查询时需要注意这一点。
