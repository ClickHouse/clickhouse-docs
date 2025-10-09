---
'slug': '/use-cases/observability/clickstack/migration/elastic/types'
'title': '映射类型'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '类型'
'sidebar_position': 2
'description': 'ClickHouse 和 Elasticsearch 中的映射类型'
'show_related_blogs': true
'keywords':
- 'JSON'
- 'Codecs'
'doc_type': 'reference'
---

Elasticsearch 和 ClickHouse 支持多种数据类型，但它们的底层存储和查询模型是根本不同的。本节将常用的 Elasticsearch 字段类型映射到其对应的 ClickHouse 类型（如适用），并提供上下文来帮助指导迁移。若没有对应的类型，将在注释中提供替代方案或说明。

| **Elasticsearch 类型**        | **ClickHouse 等效类型**   | **注释** |
|-------------------------------|------------------------------|--------------|
| `boolean`                     | [`UInt8`](/sql-reference/data-types/int-uint)  或 [`Bool`](/sql-reference/data-types/boolean)        | ClickHouse 在较新版本中支持将 `Boolean` 作为 `UInt8` 的别名。 |
| `keyword`                     | [`String`](/sql-reference/data-types/string)                    | 用于精确匹配过滤、分组和排序。 |
| `text`                        | [`String`](/sql-reference/data-types/string)                    | ClickHouse 的全文搜索功能有限；标记化需要使用 `tokens` 函数结合数组函数的自定义逻辑。 |
| `long`                        | [`Int64`](/sql-reference/data-types/int-uint)                     | 64 位有符号整数。 |
| `integer`                    | [`Int32`](/sql-reference/data-types/int-uint)                      | 32 位有符号整数。 |
| `short`                       | [`Int16`](/sql-reference/data-types/int-uint)                      | 16 位有符号整数。 |
| `byte`                        | [`Int8`](/sql-reference/data-types/int-uint)                       | 8 位有符号整数。 |
| `unsigned_long`              | [`UInt64`](/sql-reference/data-types/int-uint)                    | 无符号 64 位整数。 |
| `double`                      | [`Float64`](/sql-reference/data-types/float)                   | 64 位浮点数。 |
| `float`                       | [`Float32`](/sql-reference/data-types/float)                   | 32 位浮点数。 |
| `half_float`                 | [`Float32`](/sql-reference/data-types/float) 或 [`BFloat16`](/sql-reference/data-types/float)      | 最接近的等效类型。ClickHouse 不支持 16 位浮点数。ClickHouse 有一个 `BFloat16` - 这与半浮点数 IEE-754 不同：半浮点数提供更高的精度，但范围较小，而 bfloat16 为了更宽泛的范围而牺牲了精度，使其更适合机器学习工作负载。 |
| `scaled_float`              | [`Decimal(x, y)`](/sql-reference/data-types/decimal)             | 存储定点数值。 |
| `date`         | [`DateTime`](/sql-reference/data-types/datetime)    | 精确到秒的等效日期类型。 |
| `date_nanos`         | [`DateTime64`](/sql-reference/data-types/datetime64)    | ClickHouse 支持以纳秒精度的 `DateTime64(9)`。 |
| `binary`                      | [`String`](/sql-reference/data-types/string), [`FixedString(N)`](/sql-reference/data-types/fixedstring)  | 二进制字段需要进行 base64 解码。 |
| `ip`                          | [`IPv4`](/sql-reference/data-types/ipv4), [`IPv6`](/sql-reference/data-types/ipv6)    | 提供原生的 `IPv4` 和 `IPv6` 类型。 |
| `object`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Map`](/sql-reference/data-types/map), [`Tuple`](/sql-reference/data-types/tuple), [`JSON`](/sql-reference/data-types/newjson) | ClickHouse 可以使用 [`Nested`](/sql-reference/data-types/nested-data-structures/nested) 或 [`JSON`](/sql-reference/data-types/newjson) 模拟类似 JSON 的对象。 |
| `flattened`                  | [`String`](/sql-reference/data-types/string)                      | Elasticsearch 中的扁平化类型将整个 JSON 对象存储为单个字段，从而允许灵活、无模式的访问嵌套键，而无需完整映射。在 ClickHouse 中，可以使用 String 类型实现类似的功能，但需要在物化视图中进行处理。 |
| `nested`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                    | ClickHouse 的 `Nested` 列提供了类似的语义，用于分组子字段，假设用户使用 `flatten_nested=0`。 |
| `join`                        | NA                           | 没有直接的父子关系概念。在 ClickHouse 中不需要，因为支持跨表连接。 |
| `alias`                       | [`Alias`](/sql-reference/statements/create/table#alias) 列修饰符      | 别名 [受到支持](/sql-reference/statements/create/table#alias)，可以通过字段修饰符使用。可以对这些别名应用函数，例如 `size String ALIAS formatReadableSize(size_bytes)` |
| `range` types (`*_range`)     | [`Tuple(start, end)`](/sql-reference/data-types/tuple) 或 [`Array(T)`](/sql-reference/data-types/array) | ClickHouse 没有原生范围类型，但可以使用 [`Tuple(start, end)`](/sql-reference/data-types/tuple) 或 [`Array`](/sql-reference/data-types/array) 结构表示数值和日期范围。对于 IP 范围 (`ip_range`)，将 CIDR 值存储为 `String` 并使用像 `isIPAddressInRange()` 的函数进行评估。或者，可以考虑使用 `ip_trie` 基于查找字典进行高效过滤。 |
| `aggregate_metric_double`     | [`AggregateFunction(...)`](/sql-reference/data-types/aggregatefunction) 和 [`SimpleAggregateFunction(...)`](/sql-reference/data-types/simpleaggregatefunction)    | 使用汇聚函数状态和物化视图来建模预汇聚指标。所有聚合函数都支持聚合状态。|
| `histogram`                   | [`Tuple(Array(Float64), Array(UInt64))`](/sql-reference/data-types/tuple) | 使用数组或自定义模式手动表示桶和计数。 |
| `annotated-text`              | [`String`](/sql-reference/data-types/string)                    | 不支持实体感知搜索或注释的内置支持。 |
| `completion`, `search_as_you_type` | NA                    | 没有原生的自动完成或建议引擎。可以通过 `String` 和 [搜索函数](/sql-reference/functions/string-search-functions) 来重现。 |
| `semantic_text`               | NA                           | 没有原生的语义搜索 - 生成嵌入并使用向量搜索。 |
| `token_count`                 | [`Int32`](/sql-reference/data-types/int-uint)                    | 在数据摄取过程中使用，以手动计算标记计数，例如 `length(tokens())`，例如使用物化列 |
| `dense_vector`                | [`Array(Float32)`](/sql-reference/data-types/array)            | 使用数组存储嵌入 |
| `sparse_vector`               | [`Map(UInt32, Float32)`](/sql-reference/data-types/map)      | 使用映射模拟稀疏向量。不支持原生稀疏向量。 |
| `rank_feature` / `rank_features` | [`Float32`](/sql-reference/data-types/float), [`Array(Float32)`](/sql-reference/data-types/array) | 没有原生的查询时间加权，但可以在评分逻辑中手动建模。 |
| `geo_point`                   | [`Tuple(Float64, Float64)`](/sql-reference/data-types/tuple) 或 [`Point`](/sql-reference/data-types/geo#point) | 使用 (纬度, 经度) 的元组。[`Point`](/sql-reference/data-types/geo#point) 作为 ClickHouse 类型可用。 |
| `geo_shape`, `shape`          | [`Ring`](/sql-reference/data-types/geo#ring), [`LineString`](/sql-reference/data-types/geo#linestring), [`MultiLineString`](/sql-reference/data-types/geo#multilinestring), [`Polygon`](/sql-reference/data-types/geo#polygon), [`MultiPolygon`](/sql-reference/data-types/geo#multipolygon)                          | 原生支持地理形状和空间索引。 |
| `percolator`                  | NA                           | 没有索引查询的概念。使用标准 SQL + 增量物化视图代替。 |
| `version`                     | [`String`](/sql-reference/data-types/string)                    | ClickHouse 没有原生的版本类型。将版本作为字符串存储，并在需要时使用自定义 UDF 函数执行语义比较。如果需要范围查询，考虑标准化为数字格式。 |

### 注释 {#notes}

- **数组**：在 Elasticsearch 中，所有字段原生支持数组。在 ClickHouse 中，数组必须显式定义（例如，`Array(String)`），其优势在于可以访问和查询特定位置，例如 `an_array[1]`。
- **多字段**：Elasticsearch 允许以 [多种方式对相同字段进行索引](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields#_multi_fields_with_multiple_analyzers)（例如，`text` 和 `keyword`）。在 ClickHouse 中，此模式必须通过单独的列或视图建模。
- **Map 和 JSON 类型** - 在 ClickHouse 中，[`Map`](/sql-reference/data-types/map) 类型常用于建模动态键值结构，例如 `resourceAttributes` 和 `logAttributes`。此类型通过允许在运行时添加任意键来实现无模式的灵活摄取 - 在精神上与 Elasticsearch 中的 JSON 对象类似。然而，有几个重要的限制需要考虑：

  - **统一值类型**：ClickHouse [`Map`](/sql-reference/data-types/map) 列必须具有一致的值类型（例如，`Map(String, String)`）。不支持混合类型值，除非进行强制转换。
  - **性能成本**：访问 [`Map`](/sql-reference/data-types/map) 中的任何键都需要将整个映射加载到内存中，这可能会对性能产生不利影响。
  - **没有子列**：与 JSON 不同，[`Map`](/sql-reference/data-types/map) 中的键并不表示真实的子列，这限制了 ClickHouse 在编制索引、压缩和高效查询方面的能力。

  鉴于这些限制，ClickStack 正在从 [`Map`](/sql-reference/data-types/map) 迁移到 ClickHouse 加强版的 [`JSON`](/sql-reference/data-types/newjson) 类型。[`JSON`](/sql-reference/data-types/newjson) 类型解决了 `Map` 的许多缺点：

  - **真正的列式存储**：每个 JSON 路径作为子列存储，允许高效的压缩、过滤和向量化查询执行。
  - **混合类型支持**：不同的数据类型（例如，整数、字符串、数组）可以在同一路径下共存，而无需强制转换或类型统一。
  - **文件系统可扩展性**：动态键（`max_dynamic_paths`）和类型（`max_dynamic_types`）的内部限制防止了列文件在磁盘上的爆炸，即使具有高基数的键集也如此。
  - **密集存储**：空值和缺失值被稀疏存储以避免不必要的开销。

    [`JSON`](/sql-reference/data-types/newjson) 类型特别适合可观察性工作负载，提供了无模式摄取的灵活性，以及本地 ClickHouse 类型的性能和可扩展性 - 使其成为动态属性字段中 [`Map`](/sql-reference/data-types/map) 的理想替代品。

    有关 JSON 类型的进一步详细信息，我们建议参阅 [JSON 指南](https://clickhouse.com/docs/integrations/data-formats/json/overview) 和 ["我们是如何为 ClickHouse 构建一种新的强大的 JSON 数据类型的"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
