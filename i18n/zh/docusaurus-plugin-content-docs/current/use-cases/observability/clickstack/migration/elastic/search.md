---
'slug': '/use-cases/observability/clickstack/migration/elastic/search'
'title': '在 ClickStack 和 Elastic 中搜索'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '搜索'
'sidebar_position': 3
'description': '在 ClickStack 和 Elastic 中搜索'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';

## 在 ClickStack 和 Elastic 中搜索 {#search-in-clickstack-and-elastic}

ClickHouse 是一个从底层为高性能分析工作负载设计的 SQL 本地引擎。相比之下，Elasticsearch 提供一种类似 SQL 的接口，将 SQL 转换为基础的 Elasticsearch 查询 DSL — 这意味着它不是一等公民，并且 [功能对等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) 有所限制。

ClickHouse 不仅支持完整的 SQL，还扩展了一系列以可观察性为中心的功能，例如 [`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) 和 [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)，简化结构化日志、指标和追踪的查询。

对于简单的日志和追踪探索，HyperDX 提供一种 [Lucene 风格的语法](/use-cases/observability/clickstack/search)，用于直观的基于文本的字段值查询、范围、通配符等。这与 Elasticsearch 中的 [Lucene 语法](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 和 [Kibana 查询语言](https://www.elastic.co/docs/reference/query-languages/kql) 的某些元素是相似的。

<Image img={hyperdx_search} alt="搜索" size="lg"/>

HyperDX 的搜索接口支持这种熟悉的语法，但在背后将其转换为高效的 SQL `WHERE` 子句，使 Kibana 用户的体验更加亲切，同时仍允许用户在需要时利用 SQL 的强大功能。这使用户能够充分利用 ClickHouse 中的 [字符串搜索函数](/sql-reference/functions/string-search-functions)、[相似性函数](/sql-reference/functions/string-functions#stringjaccardindex) 和 [日期时间函数](/sql-reference/functions/date-time-functions)。

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

下面，我们比较 ClickStack 和 Elasticsearch 的 Lucene 查询语言。

## ClickStack 搜索语法与 Elasticsearch 查询字符串 {#hyperdx-vs-elasticsearch-query-string}

HyperDX 和 Elasticsearch 都提供灵活的查询语言，以实现直观的日志和追踪过滤。虽然 Elasticsearch 的查询字符串与其 DSL 和索引引擎紧密集成，但 HyperDX 支持一种受到 Lucene 启发的语法，在后端转换为 ClickHouse SQL。下表概述了两种系统中常见搜索模式的行为，突出语法之间的相似性和后端执行的差异。

| **特性** | **HyperDX 语法** | **Elasticsearch 语法** | **备注** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| 自由文本搜索        | `error` | `error` | 在所有索引字段中匹配；在 ClickStack 中，这被重写为多字段 SQL `ILIKE`。 |
| 字段匹配             | `level:error` | `level:error` | 语法完全相同。HyperDX 在 ClickHouse 中匹配确切的字段值。 |
| 短语搜索           | `"disk full"` | `"disk full"` | 引号文本匹配确切序列；ClickHouse 使用字符串相等或 `ILIKE`。 |
| 字段短语匹配      | `message:"disk full"` | `message:"disk full"` | 转换为 SQL `ILIKE` 或精确匹配。 |
| OR 条件           | `error OR warning` | `error OR warning` | 逻辑 OR 术语；两个系统都原生支持此功能。 |
| AND 条件          | `error AND db` | `error AND db` | 均转换为交集；用户语法没有区别。 |
| 否定                | `NOT error` 或 `-error` | `NOT error` 或 `-error` | 否定的支持相同；HyperDX 转换为 SQL `NOT ILIKE`。 |
| 分组                | `(error OR fail) AND db` | `(error OR fail) AND db` | 两者中的标准布尔分组。 |
| 通配符               | `error*` 或 `*fail*` | `error*`, `*fail*` | HyperDX 支持前导/尾随通配符；为了性能，ES 默认禁用前导通配符。术语内的通配符不被支持，例如 `f*ail`。通配符必须与字段匹配一起应用。|
| 范围（数字/日期）   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX 使用 SQL `BETWEEN`；Elasticsearch 扩展为范围查询。范围中的无界 `*` 不被支持，例如 `duration:[100 TO *]`。如有需要，请使用下面的 `无界范围`。|
| 无界范围（数字/日期）   | `duration:>10` 或 `duration:>=10` | `duration:>10` 或 `duration:>=10` | HyperDX 使用标准 SQL 运算符 |
| 包含/排除     | `duration:{100 TO 200}`（排除）    | 相同                                   | 大括号表明排除边界。范围中的 `*` 不被支持。例如 `duration:[100 TO *]`|
| 存在检查            | 不适用                       | `_exists_:user` 或 `field:*` | `_exists_` 不被支持。对于 `Map` 列如 `LogAttributes`，使用 `LogAttributes.log.file.path: *`。对于根列，这些列必须存在，如果没有被包含在事件中，则会有默认值。要搜索默认值或缺失列，使用与 Elasticsearch 相同的语法 ` ServiceName:*` 或 `ServiceName != ''`。 |
| 正则匹配                   |      `match` 函数          | `name:/joh?n(ath[oa]n)/` | 当前在 Lucene 语法中不支持。用户可以使用 SQL 和 [`match`](/sql-reference/functions/string-search-functions#match) 函数或其他 [字符串搜索函数](/sql-reference/functions/string-search-functions)。|
| 模糊匹配             |      `editDistance('quikc', field) = 1` | `quikc~` | 当前在 Lucene 语法中不支持。可以在 SQL 中使用距离函数，例如 `editDistance('rror', SeverityText) = 1` 或 [其他相似性函数](/sql-reference/functions/string-functions#jarosimilarity)。 |
| 邻近搜索        | 不支持                       | `"fox quick"~5` | 当前在 Lucene 语法中不支持。 |
| 提升                | `quick^2 fox` | `quick^2 fox` | 目前在 HyperDX 中不支持。 |
| 字段通配符          | `service.*:error` | `service.*:error` | 目前在 HyperDX 中不支持。 |
| 转义特殊字符   | 使用 `\` 转义保留字符 | 相同      | 对保留符号需要进行转义。 |

## 存在/缺失差异 {#empty-value-differences}

与 Elasticsearch 不同，在 Elasticsearch 中，字段可以完全从事件中省略，因此真正的 “不存在”，ClickHouse 要求表模式中的所有列都必须存在。如果在插入事件中未提供字段：

- 对于 [`Nullable`](/sql-reference/data-types/nullable) 字段，它将被设置为 `NULL`。
- 对于非可空字段（默认），它将填充默认值（通常为空字符串、0 或等效）。

在 ClickStack 中，我们使用后者，因为 [`Nullable`](/sql-reference/data-types/nullable) [不推荐使用](/optimize/avoid-nullable-columns)。

这种行为意味着在 Elasticsearch 意义上检查字段是否“存在”并不直接支持。

相反，用户可以使用 `field:*` 或 `field != ''` 来检查非空值的存在。因此，无法区分真正缺失和显式为空的字段。

在实践中，这种差异很少导致可观察性用例问题，但在两个系统之间转换查询时，牢记这一点是很重要的。
