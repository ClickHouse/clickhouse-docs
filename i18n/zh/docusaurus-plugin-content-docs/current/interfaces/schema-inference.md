---
'description': '页面描述了在 ClickHouse 中从输入数据自动推断模式'
'sidebar_label': '模式推断'
'slug': '/interfaces/schema-inference'
'title': '从输入数据自动推断模式'
'doc_type': 'reference'
---

ClickHouse 可以在几乎所有支持的 [输入格式](formats.md) 中自动确定输入数据的结构。本文档将描述何时使用模式推断，它如何与不同的输入格式配合使用以及哪些设置可以控制它。

## 使用 {#usage}

当 ClickHouse 需要以特定的数据格式读取数据而结构未知时，会使用模式推断。

## 表函数 [file](../sql-reference/table-functions/file.md)， [s3](../sql-reference/table-functions/s3.md)， [url](../sql-reference/table-functions/url.md)， [hdfs](../sql-reference/table-functions/hdfs.md)， [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md) {#table-functions-file-s3-url-hdfs-azureblobstorage}

这些表函数有一个可选参数 `structure`，用于输入数据的结构。如果未指定此参数或将其设置为 `auto`，则将根据数据推断结构。

**示例：**

假设我们有一个位于 `user_files` 目录中的 JSONEachRow 格式的文件 `hobbies.jsonl`，内容如下：
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouse 可以在您未指定其结构的情况下读取这些数据：
```sql
SELECT * FROM file('hobbies.jsonl')
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```

注意：格式 `JSONEachRow` 是通过文件扩展名 `.jsonl` 自动确定的。

您可以使用 `DESCRIBE` 查询查看自动确定的结构：
```sql
DESCRIBE file('hobbies.jsonl')
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## 表引擎 [File](../engines/table-engines/special/file.md)， [S3](../engines/table-engines/integrations/s3.md)， [URL](../engines/table-engines/special/url.md)， [HDFS](../engines/table-engines/integrations/hdfs.md)， [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

如果在 `CREATE TABLE` 查询中未指定列的列表，表的结构将从数据中自动推断。

**示例：**

我们使用文件 `hobbies.jsonl`。我们可以使用这个文件中的数据创建一个引擎为 `File` 的表：
```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```
```response
Ok.
```
```sql
SELECT * FROM hobbies
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```
```sql
DESCRIBE TABLE hobbies
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## clickhouse-local {#clickhouse-local}

`clickhouse-local` 有一个可选参数 `-S/--structure`，用于输入数据的结构。如果未指定此参数或将其设置为 `auto`，将从数据中推断结构。

**示例：**

我们使用文件 `hobbies.jsonl`。我们可以使用 `clickhouse-local` 查询此文件中的数据：
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='DESCRIBE TABLE hobbies'
```
```response
id    Nullable(Int64)
age    Nullable(Int64)
name    Nullable(String)
hobbies    Array(Nullable(String))
```
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='SELECT * FROM hobbies'
```
```response
1    25    Josh    ['football','cooking','music']
2    19    Alan    ['tennis','art']
3    32    Lana    ['fitness','reading','shopping']
4    47    Brayan    ['movies','skydiving']
```

## 从插入表使用结构 {#using-structure-from-insertion-table}

当使用表函数 `file/s3/url/hdfs` 将数据插入表中时，可以选择使用插入表的结构，而不是从数据中提取它。这样可以提高插入性能，因为模式推断可能需要一些时间。此外，当表具有优化的模式时，这也会有所帮助，因此不会进行类型转换。

有一个特别设置 [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions) 控制此行为。它有 3 个可能的值：
- 0 - 表函数将从数据中提取结构。
- 1 - 表函数将使用插入表的结构。
- 2 - ClickHouse 会自动确定是否可以使用插入表的结构或使用模式推断。默认值。

**示例 1：**

让我们创建表 `hobbies1`，结构如下：
```sql
CREATE TABLE hobbies1
(
    `id` UInt64,
    `age` LowCardinality(UInt8),
    `name` String,
    `hobbies` Array(String)
)
ENGINE = MergeTree
ORDER BY id;
```

并从文件 `hobbies.jsonl` 插入数据：

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

在这种情况下，文件中的所有列都直接插入到表中，因此 ClickHouse 将使用插入表的结构，而不是模式推断。

**示例 2：**

让我们创建表 `hobbies2`，结构如下：
```sql
CREATE TABLE hobbies2
(
  `id` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

并从文件 `hobbies.jsonl` 插入数据：

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

在这种情况下，`SELECT` 查询中的所有列都存在于表中，因此 ClickHouse 将使用插入表的结构。 请注意，这仅适用于支持读取部分列的输入格式，如 JSONEachRow、TSKV、Parquet 等（因此不会适用于 TSV 格式）。

**示例 3：**

让我们创建表 `hobbies3`，结构如下：

```sql
CREATE TABLE hobbies3
(
  `identifier` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY identifier;
```

并从文件 `hobbies.jsonl` 插入数据：

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

在这种情况下，列 `id` 在 `SELECT` 查询中被使用，但表中没有此列（表中有一列名为 `identifier`），因此 ClickHouse 无法使用插入表的结构，模式推断将被使用。

**示例 4：**

让我们创建表 `hobbies4`，结构如下：

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

并从文件 `hobbies.jsonl` 插入数据：

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

在这种情况下，`SELECT` 查询中对列 `hobbies` 执行了一些操作，所以 ClickHouse 无法使用插入表的结构，模式推断将被使用。

## 模式推断缓存 {#schema-inference-cache}

对于大多数输入格式，模式推断会读取一些数据以确定其结构，这个过程可能需要一些时间。为了防止 ClickHouse 每次从同一文件读取数据时都推断相同的模式，推断的模式会被缓存，当再次访问同一文件时，ClickHouse 将使用缓存中的模式。

有一些特殊设置控制此缓存：
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 相应表函数的最大缓存模式数。默认值为 `4096`。这些设置应该在服务器配置中设置。
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - 允许打开/关闭模式推断的缓存。这些设置可以在查询中使用。

文件的模式可以通过修改数据或更改格式设置来改变。因此，模式推断缓存通过文件源、格式名称、使用的格式设置和文件的最后修改时间来识别模式。

注意：某些通过 `url` 表函数访问的文件可能不包含最后修改时间的信息；在这种情况下，有一个特殊设置 `schema_inference_cache_require_modification_time_for_url`。禁用此设置允许对这些文件使用缓存中的模式，而无需最后修改时间。

此外，还有一个系统表 [schema_inference_cache](../operations/system-tables/schema_inference_cache.md)，包含缓存中所有当前的模式，以及系统查询 `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]`，它允许清除所有源或特定源的模式缓存。

**示例：**

让我们试着从 s3 推断一个示例数据集 `github-2022.ndjson.gz` 的结构，看看模式推断缓存是如何工作的：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.601 sec.
```
```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.059 sec.
```

如您所见，第二个查询几乎瞬间成功。

让我们尝试更改一些可能影响推断模式的设置：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.611 sec
```

如您所见，由于影响推断模式的设置已更改，因此对同一文件未使用缓存中的模式。

让我们检查一下 `system.schema_inference_cache` 表的内容：

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Object(Nullable('json')), repo Object(Nullable('json')), created_at Nullable(String), payload Object(Nullable('json')) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                         │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

如您所见，对于同一文件，有两个不同的模式。

我们可以使用一个系统查询清除模式缓存：
```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```
```response
Ok.
```
```sql
SELECT count() FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─count()─┐
│       0 │
└─────────┘
```

## 文本格式 {#text-formats}

对于文本格式，ClickHouse 按行读取数据，根据格式提取列值，然后使用一些递归解析器和启发式方法确定每个值的类型。在模式推断中读取的数据的最大行数和字节数由设置 `input_format_max_rows_to_read_for_schema_inference`（默认值为 25000）和 `input_format_max_bytes_to_read_for_schema_inference`（默认值为 32Mb）控制。默认情况下，所有推断的类型都是 [Nullable](../sql-reference/data-types/nullable.md)，但您可以通过设置 `schema_inference_make_columns_nullable` 更改此设置（见 [settings](#settings-for-text-formats) 部分的示例）。

### JSON 格式 {#json-formats}

在 JSON 格式中，ClickHouse 根据 JSON 规范解析值，然后尝试为它们找到最合适的数据类型。

让我们看看它是如何工作的，可以推断出什么类型以及在 JSON 格式中可以使用哪些具体设置。

**示例**

在这里和后面的示例中，将使用 [format](../sql-reference/table-functions/format.md) 表函数。

整数、浮点数、布尔值、字符串：
```sql
DESC format(JSONEachRow, '{"int" : 42, "float" : 42.42, "string" : "Hello, World!"}');
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日期、日期时间：

```sql
DESC format(JSONEachRow, '{"date" : "2022-01-01", "datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}')
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date       │ Nullable(Date)          │              │                    │         │                  │                │
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

数组：
```sql
DESC format(JSONEachRow, '{"arr" : [1, 2, 3], "nested_arrays" : [[1, 2, 3], [4, 5, 6], []]}')
```
```response
┌─name──────────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr           │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ nested_arrays │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果数组包含 `null`，ClickHouse 将使用其他数组元素的类型：
```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果数组包含不同类型的值，并且设置 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` 被启用（默认启用），则它将被视为 `Array(Dynamic)`：
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

命名元组：

当设置 `input_format_json_try_infer_named_tuples_from_objects` 启用时，在模式推断期间 ClickHouse 将尝试从 JSON 对象推断命名元组。结果命名元组将包含来自样本数据中所有相应 JSON 对象的所有元素。

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

未命名元组：

如果将设置 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` 禁用，我们将把包含不同类型元素的数组视为 JSON 格式中的未命名元组。
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果某些值为 `null` 或为空，我们将使用其他行中对应值的类型：
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
DESC format(JSONEachRow, $$
                              {"tuple" : [1, null, null]}
                              {"tuple" : [null, "Hello, World!", []]}
                              {"tuple" : [null, null, [1, 2, 3]]}
                         $$)
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

映射：

在 JSON 中，我们可以将具有相同类型值的对象读取为映射类型。
注意：这仅在设置 `input_format_json_read_objects_as_strings` 和 `input_format_json_try_infer_named_tuples_from_objects` 禁用时有效。

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

JSON 对象类型（如果启用设置 `allow_experimental_object_type`）：

```sql
SET allow_experimental_object_type = 1
DESC format(JSONEachRow, $$
                            {"obj" : {"key1" : 42}}
                            {"obj" : {"key2" : "Hello, World!"}}
                            {"obj" : {"key1" : 24, "key3" : {"a" : 42, "b" : null}}}
                         $$)
```
```response
┌─name─┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Object(Nullable('json')) │              │                    │         │                  │                │
└──────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

嵌套复杂类型：
```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果 ClickHouse 无法为某个键确定类型，因为数据仅包含空值/空对象/空数组，当设置 `input_format_json_infer_incomplete_types_as_strings` 启用时将使用类型 `String`，否则将抛出异常：
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 1;
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(String)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 0;
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'arr' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

#### JSON 设置 {#json-settings}
##### input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

启用此设置允许从字符串值推断数字。

此设置默认禁用。

**示例：**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(JSONEachRow, $$
                              {"value" : "42"}
                              {"value" : "424242424242"}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

启用此设置允许从 JSON 对象推断命名元组。结果的命名元组将包含来自样本数据中所有相应 JSON 对象的所有元素。当 JSON 数据不稀疏时，这个设置可能会很有用，样本数据将包含所有可能的对象键。

此设置默认启用。

**示例**

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

结果：

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"array" : [{"a" : 42, "b" : "Hello"}, {}, {"c" : [1,2,3]}, {"d" : "2020-01-01"}]}')
```

结果：

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named-tuple-inference-from-objects}

启用此设置允许在从 JSON 对象推断命名元组时对模糊路径使用字符串类型（当启用 `input_format_json_try_infer_named_tuples_from_objects`）而不是抛出异常。它允许在存在模糊路径的情况下将 JSON 对象读取为命名元组。

默认禁用。

**示例**

禁用设置时：
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```
结果：

```response
Code: 636. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'a' has type 'Int64' and in some - 'Tuple(b String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'a'. (INCORRECT_DATA) (version 24.3.1.1).
You can specify the structure manually. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

启用设置时：
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : "a" : 42}, {"obj" : {"a" : {"b" : "Hello"}}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

结果：
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(String))     │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
┌─obj─────────────────┐
│ ('42')              │
│ ('{"b" : "Hello"}') │
└─────────────────────┘
```
##### input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

启用此设置允许将嵌套 JSON 对象作为字符串读取。该设置可用于在不使用 JSON 对象类型的情况下读取嵌套 JSON 对象。

此设置默认启用。

注意：启用此设置仅在 `input_format_json_try_infer_named_tuples_from_objects` 设置禁用时生效。

```sql
SET input_format_json_read_objects_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, $$
                             {"obj" : {"key1" : 42, "key2" : [1,2,3,4]}}
                             {"obj" : {"key3" : {"nested_key" : 1}}}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

启用此设置允许将数值作为字符串读取。

此设置默认启用。

**示例**

```sql
SET input_format_json_read_numbers_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : 1055}
                                {"value" : "unknown"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

启用此设置允许将布尔值作为数字读取。

此设置默认启用。

**示例：**

```sql
SET input_format_json_read_bools_as_numbers = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : 42}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

启用此设置允许将布尔值作为字符串读取。

此设置默认启用。

**示例：**

```sql
SET input_format_json_read_bools_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : "Hello, World"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

启用此设置允许将 JSON 数组值作为字符串读取。

此设置默认启用。

**示例**

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```
```response
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```
##### input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

启用此设置允许对样本数据中的 JSON 键在仅包含 `Null`/`{}`/`[]` 的情况下，在模式推断时使用字符串类型。在 JSON 格式中，如果启用所有对应设置（它们都是默认启用），任何值都可以作为字符串读取，我们可以通过对未知类型的键使用字符串类型，避免在模式推断中出现诸如 `无法通过前 25000 行数据确定列 'column_name' 的类型，该列很可能只包含 Nulls 或空数组/映射` 的错误。

示例：

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

结果：
```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```
### CSV {#csv}

在 CSV 格式中，ClickHouse 根据分隔符从行中提取列值。ClickHouse 期望所有类型，除了数字和字符串，都用双引号括起来。如果值在双引号中，ClickHouse 将尝试使用递归解析器解析引号内的数据，然后尝试为其找到最合适的数据类型。如果值不在双引号中，ClickHouse 将尝试将其解析为数字，如果该值不是数字，则 ClickHouse 将其视为字符串。

如果您不希望 ClickHouse 尝试使用某些解析器和启发式方法来确定复杂类型，可以禁用设置 `input_format_csv_use_best_effort_in_schema_inference`，并且 ClickHouse 将所有列视为字符串。

如果启用设置 `input_format_csv_detect_header`，ClickHouse 将尝试在推断模式时检测带有列名（以及可能的类型）的头部。此设置默认启用。

**示例：**

整数、浮点数、布尔值、字符串：
```sql
DESC format(CSV, '42,42.42,true,"Hello,World!"')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

没有引号的字符串：
```sql
DESC format(CSV, 'Hello world!,World hello!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日期、日期时间：

```sql
DESC format(CSV, '"2020-01-01","2020-01-01 00:00:00","2022-01-01 00:00:00.000"')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

数组：
```sql
DESC format(CSV, '"[1,2,3]","[[1, 2], [], [3, 4]]"')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(CSV, $$"['Hello', 'world']","[['Abc', 'Def'], []]"$$)
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果数组包含 null，ClickHouse 将使用其他数组元素的类型：
```sql
DESC format(CSV, '"[NULL, 42, NULL]"')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

映射：
```sql
DESC format(CSV, $$"{'key1' : 42, 'key2' : 24}"$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

嵌套数组和映射：
```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```
```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果 ClickHouse 无法确定引号内的类型，因为数据仅包含 null，ClickHouse 将其视为字符串：
```sql
DESC format(CSV, '"[NULL, NULL]"')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

禁用设置 `input_format_csv_use_best_effort_in_schema_inference` 的示例：
```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
DESC format(CSV, '"[1,2,3]",42.42,Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

启用 `input_format_csv_detect_header` 的头部自动检测示例：

仅名称：
```sql
SELECT * FROM format(CSV,
$$"number","string","array"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

名称和类型：

```sql
DESC format(CSV,
$$"number","string","array"
"UInt32","String","Array(UInt16)"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

请注意，只有在至少有一列具有非字符串类型时，才能检测头部。如果所有列都是字符串类型，则不会检测到头部：

```sql
SELECT * FROM format(CSV,
$$"first_column","second_column"
"Hello","World"
"World","Hello"
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```

#### CSV 设置 {#csv-settings}
##### input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

启用此设置允许从字符串值推断数字。

此设置默认禁用。

**示例：**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(CSV, '42,42.42');
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### TSV/TSKV {#tsv-tskv}

在 TSV/TSKV 格式中，ClickHouse 根据制表符分隔符从行中提取列值，然后使用递归解析器解析提取的值以确定最合适的类型。如果无法确定类型，ClickHouse 将此值视为字符串。

如果您不希望 ClickHouse 尝试使用某些解析器和启发式方法来确定复杂类型，可以禁用设置 `input_format_tsv_use_best_effort_in_schema_inference`，并且 ClickHouse 将所有列视为字符串。

如果启用设置 `input_format_tsv_detect_header`，ClickHouse 将在推断模式时尝试检测带有列名（以及可能的类型）的头部。此设置默认启用。

**示例：**

整数、浮点数、布尔值、字符串：
```sql
DESC format(TSV, '42    42.42    true    Hello,World!')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSKV, 'int=42    float=42.42    bool=true    string=Hello,World!\n')
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日期、日期时间：

```sql
DESC format(TSV, '2020-01-01    2020-01-01 00:00:00    2022-01-01 00:00:00.000')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

数组：
```sql
DESC format(TSV, '[1,2,3]    [[1, 2], [], [3, 4]]')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSV, '[''Hello'', ''world'']    [[''Abc'', ''Def''], []]')
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果数组包含 null，ClickHouse 将使用其他数组元素的类型：
```sql
DESC format(TSV, '[NULL, 42, NULL]')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

元组：
```sql
DESC format(TSV, $$(42, 'Hello, world!')$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

映射：
```sql
DESC format(TSV, $${'key1' : 42, 'key2' : 24}$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

嵌套数组、元组和映射：
```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果 ClickHouse 无法确定类型，因为数据仅包含 null，ClickHouse 将其视为字符串：
```sql
DESC format(TSV, '[NULL, NULL]')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

禁用设置 `input_format_tsv_use_best_effort_in_schema_inference` 的示例：
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

启用 `input_format_tsv_detect_header` 的头部自动检测示例：

仅名称：
```sql
SELECT * FROM format(TSV,
$$number    string    array
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$);
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

名称和类型：

```sql
DESC format(TSV,
$$number    string    array
UInt32    String    Array(UInt16)
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

请注意，只有在至少有一列具有非字符串类型时，才能检测头部。如果所有列都是字符串类型，则不会检测到头部：

```sql
SELECT * FROM format(TSV,
$$first_column    second_column
Hello    World
World    Hello
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```
### 值 {#values}

在 Values 格式中，ClickHouse 从行中提取列值，然后使用递归解析器解析它，类似于文本字面量的解析方式。

**示例：**

整数、浮点数、布尔值、字符串：
```sql
DESC format(Values, $$(42, 42.42, true, 'Hello,World!')$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日期、日期时间：

```sql
DESC format(Values, $$('2020-01-01', '2020-01-01 00:00:00', '2022-01-01 00:00:00.000')$$)
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

数组：
```sql
DESC format(Values, '([1,2,3], [[1, 2], [], [3, 4]])')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果数组包含 null，ClickHouse 将使用其他数组元素的类型：
```sql
DESC format(Values, '([NULL, 42, NULL])')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

元组：
```sql
DESC format(Values, $$((42, 'Hello, world!'))$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

映射：
```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

嵌套数组、元组和映射：
```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

如果 ClickHouse 无法确定类型，因为数据仅包含 null，将抛出异常：
```sql
DESC format(Values, '([NULL, NULL])')
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

禁用设置 `input_format_tsv_use_best_effort_in_schema_inference` 的示例：
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### 自定义分隔符 {#custom-separated}

在 CustomSeparated 格式中，ClickHouse 首先根据指定的分隔符从行中提取所有列值，然后尝试根据转义规则推断每个值的数据类型。

如果启用设置 `input_format_custom_detect_header`，ClickHouse 将尝试在推断模式时检测带有列名（以及可能的类型）的头部。此设置默认启用。

**示例**

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64)      │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

启用 `input_format_custom_detect_header` 的头部自动检测示例：

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>'number'<field_delimiter>'string'<field_delimiter>'array'<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```

```response
┌─number─┬─string────────┬─array──────┐
│  42.42 │ Some string 1 │ [1,NULL,3] │
│   ᴺᵁᴸᴸ │ Some string 3 │ [1,2,NULL] │
└────────┴───────────────┴────────────┘
```
### 模板 {#template}

在 Template 格式中，ClickHouse 首先根据指定的模板从行中提取所有列值，然后尝试根据它们的转义规则推断每个值的数据类型。

**示例**

假设我们有一个内容如下的文件 `resultset`：
```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

还有一个内容如下的文件 `row_format`：

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

那么我们可以执行以下查询：

```sql
SET format_template_rows_between_delimiter = '<row_between_delimiter>\n',
       format_template_row = 'row_format',
       format_template_resultset = 'resultset_format'

DESC format(Template, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter_1>'Some string 1'<field_delimiter_2>[1, null, 2]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>\N<field_delimiter_1>'Some string 3'<field_delimiter_2>[1, 2, null]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─────┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ column_1 │ Nullable(Float64)      │              │                    │         │                  │                │
│ column_2 │ Nullable(String)       │              │                    │         │                  │                │
│ column_3 │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### 正则表达式 {#regexp}

类似于模板，在 Regexp 格式中，ClickHouse 首先根据指定的正则表达式从行中提取所有列值，然后尝试根据指定的转义规则推断每个值的数据类型。

**示例**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'

DESC format(Regexp, $$Line: value_1=42, value_2="Some string 1", value_3="[1, NULL, 3]"
Line: value_1=2, value_2="Some string 2", value_3="[4, 5, NULL]"$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### 文本格式的设置 {#settings-for-text-formats}
#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

这些设置控制在模式推断时读取的数据量。读取的行/字节越多，模式推断所花费的时间就越长，但更有可能正确确定类型（尤其是当数据包含大量 null 时）。

默认值：
- `25000` 用于 `input_format_max_rows_to_read_for_schema_inference`。
- `33554432`（32 Mb）用于 `input_format_max_bytes_to_read_for_schema_inference`。
#### column_names_for_schema_inference {#column-names-for-schema-inference}

用于没有显式列名的格式的模式推断的列名列表。指定的名称将被用作默认值 `c1,c2,c3,...` 的替代。格式： `column1,column2,column3,...`。

**示例**

```sql
DESC format(TSV, 'Hello, World!    42    [1, 2, 3]') settings column_names_for_schema_inference = 'str,int,arr'
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ str  │ Nullable(String)       │              │                    │         │                  │                │
│ int  │ Nullable(Int64)        │              │                    │         │                  │                │
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_hints {#schema-inference-hints}

用于模式推断的列名和类型列表，而不是自动确定的类型。格式： 'column_name1 column_type1，column_name2 column_type2，...'。此设置可用于指定无法自动确定类型的列的类型，或用于优化模式。

**示例**

```sql
DESC format(JSONEachRow, '{"id" : 1, "age" : 25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}') SETTINGS schema_inference_hints = 'age LowCardinality(UInt8), status Nullable(String)', allow_suspicious_low_cardinality_types=1
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ LowCardinality(UInt8)   │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_make_columns_nullable {#schema-inference-make-columns-nullable}

控制在没有 nullability 信息的格式下使推断类型为 `Nullable`。可能的值：
* 0 - 推断的类型永远不会是 `Nullable`，
* 1 - 所有推断的类型将是 `Nullable`，
* 2 或 'auto' - 对于文本格式，仅当列在模式推断期间的样本中包含 `NULL` 时，推断的类型才会为 `Nullable`；对于强类型格式（Parquet、ORC、Arrow），则从文件元数据中获取 nullability 信息，
* 3 - 对于文本格式，使用 `Nullable`；对于强类型格式，使用文件元数据。

默认值： 3。

**示例**

```sql
SET schema_inference_make_columns_nullable = 1
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET schema_inference_make_columns_nullable = 'auto';
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64            │              │                    │         │                  │                │
│ age     │ Int64            │              │                    │         │                  │                │
│ name    │ String           │              │                    │         │                  │                │
│ status  │ Nullable(String) │              │                    │         │                  │                │
│ hobbies │ Array(String)    │              │                    │         │                  │                │
└─────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET schema_inference_make_columns_nullable = 0;
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response

┌─name────┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64         │              │                    │         │                  │                │
│ age     │ Int64         │              │                    │         │                  │                │
│ name    │ String        │              │                    │         │                  │                │
│ status  │ String        │              │                    │         │                  │                │
│ hobbies │ Array(String) │              │                    │         │                  │                │
└─────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_integers {#input-format-try-infer-integers}

:::note
此设置不适用于 `JSON` 数据类型。
:::

如启用，ClickHouse将在文本格式的模式推断中尝试推断整数，而不是浮点数。如果样本数据中列中的所有数值都是整数，则结果类型将为 `Int64`，如果至少有一个数值为浮点数，则结果类型将为 `Float64`。如果样本数据仅包含整数，并且至少一个整数为正且超出了 `Int64`，则 ClickHouse 将推断为 `UInt64`。

默认启用。

**示例**

```sql
SET input_format_try_infer_integers = 0
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_integers = 1
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Int64) │              │                    │         │                  │                │
└────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 18446744073709551615}
                         $$)
```
```response
┌─name───┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(UInt64) │              │                    │         │                  │                │
└────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2.2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_datetimes {#input-format-try-infer-datetimes}

如果启用，ClickHouse 将尝试从字符串字段的模式推断中推断类型 `DateTime` 或 `DateTime64`。如果样本数据中列的所有字段的解析成功，则结果类型将为 `DateTime` 或 `DateTime64(9)`（如果任何日期时间具有小数部分），如果至少有一个字段未解析为日期时间，则结果类型将为 `String`。

默认启用。

**示例**

```sql
SET input_format_try_infer_datetimes = 0;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_datetimes = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "unknown", "datetime64" : "unknown"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_datetimes_only_datetime64 {#input-format-try-infer-datetimes-only-datetime64}

如果启用，即使日期时间值不包含小数部分，ClickHouse 也将始终在启用 `input_format_try_infer_datetimes` 时推断为 `DateTime64(9)`。

默认禁用。

**示例**

```sql
SET input_format_try_infer_datetimes = 1;
SET input_format_try_infer_datetimes_only_datetime64 = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```

```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

注意：在模式推断期间解析日期时间时，遵循设置 [date_time_input_format](/operations/settings/settings-formats.md#date_time_input_format)

#### input_format_try_infer_dates {#input-format-try-infer-dates}

如果启用，ClickHouse 将尝试从字符串字段的模式推断中推断类型 `Date`。如果样本数据中列的所有字段的解析成功，则结果类型将为 `Date`，如果至少有一个字段未解析为日期，则结果类型将为 `String`。

默认启用。

**示例**

```sql
SET input_format_try_infer_datetimes = 0, input_format_try_infer_dates = 0
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_dates = 1
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(Date) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "unknown"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_exponent_floats {#input-format-try-infer-exponent-floats}

如果启用，ClickHouse 将尝试在文本格式（除了 JSON 中的数字始终推断为指数形式）中推断浮点数的指数形式。

默认禁用。

**示例**

```sql
SET input_format_try_infer_exponent_floats = 1;
DESC format(CSV,
$$1.1E10
2.3e-12
42E00
$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## 自描述格式 {#self-describing-formats}

自描述格式包含数据结构的信息，通常是某种头部描述、二进制类型树或某种表格。为了自动推断这种格式文件的模式，ClickHouse 读取数据的一部分，包含有关类型的信息，并将其转换为 ClickHouse 表的模式。

### 带有 -WithNamesAndTypes 后缀的格式 {#formats-with-names-and-types}

ClickHouse 支持一些带有 -WithNamesAndTypes 后缀的文本格式。此后缀意味着数据在实际数据之前包含两行附加的列名和类型。在这种格式的模式推断中，ClickHouse 读取前两行并提取列名和类型。

**示例**

```sql
DESC format(TSVWithNamesAndTypes,
$$num    str    arr
UInt8    String    Array(UInt8)
42    Hello, World!    [1,2,3]
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### 带有元数据的 JSON 格式 {#json-with-metadata}

某些 JSON 输入格式（[JSON](formats.md#json)， [JSONCompact](/interfaces/formats/JSONCompact)， [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)）包含带有列名和类型的元数据。在这种格式的模式推断中，ClickHouse 读取这些元数据。

**示例**
```sql
DESC format(JSON, $$
{
    "meta":
    [
        {
            "name": "num",
            "type": "UInt8"
        },
        {
            "name": "str",
            "type": "String"
        },
        {
            "name": "arr",
            "type": "Array(UInt8)"
        }
    ],

    "data":
    [
        {
            "num": 42,
            "str": "Hello, World",
            "arr": [1,2,3]
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.005723915,
        "rows_read": 1,
        "bytes_read": 1
    }
}
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### Avro {#avro}

在 Avro 格式中，ClickHouse 从数据中读取其模式并将其转换为 ClickHouse 模式，采用以下类型匹配：

| Avro 数据类型                     | ClickHouse 数据类型                                                           |
|------------------------------------|--------------------------------------------------------------------------------|
| `boolean`                          | [Bool](../sql-reference/data-types/boolean.md)                                 |
| `int`                              | [Int32](../sql-reference/data-types/int-uint.md)                               |
| `int (date)` \*                    | [Date32](../sql-reference/data-types/date32.md)                                |
| `long`                             | [Int64](../sql-reference/data-types/int-uint.md)                               |
| `float`                            | [Float32](../sql-reference/data-types/float.md)                                |
| `double`                           | [Float64](../sql-reference/data-types/float.md)                                |
| `bytes`, `string`                  | [String](../sql-reference/data-types/string.md)                                |
| `fixed`                            | [FixedString(N)](../sql-reference/data-types/fixedstring.md)                   |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)                                    |
| `array(T)`                         | [Array(T)](../sql-reference/data-types/array.md)                               |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                             |
| `null`                             | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md) |
| `string (uuid)` \*                 | [UUID](../sql-reference/data-types/uuid.md)                                    |
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                         |

\* [Avro 逻辑类型](https://avro.apache.org/docs/current/spec.html#Logical+Types)

其他 Avro 类型不受支持。
### Parquet {#parquet}

在 Parquet 格式中，ClickHouse 从数据中读取其模式，并使用以下类型匹配将其转换为 ClickHouse 模式：

| Parquet 数据类型               | ClickHouse 数据类型                                     |
|-------------------------------|-----------------------------------------------------|
| `BOOL`                        | [Bool](../sql-reference/data-types/boolean.md)         |
| `UINT8`                       | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `INT8`                        | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UINT16`                      | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `INT16`                       | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UINT32`                      | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `INT32`                       | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UINT64`                      | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `INT64`                       | [Int64](../sql-reference/data-types/int-uint.md)       |
| `FLOAT`                       | [Float32](../sql-reference/data-types/float.md)        |
| `DOUBLE`                      | [Float64](../sql-reference/data-types/float.md)        |
| `DATE`                        | [Date32](../sql-reference/data-types/date32.md)        |
| `TIME (ms)`                   | [DateTime](../sql-reference/data-types/datetime.md)    |
| `TIMESTAMP`, `TIME (us, ns)`  | [DateTime64](../sql-reference/data-types/datetime64.md)|
| `STRING`, `BINARY`            | [String](../sql-reference/data-types/string.md)        |
| `DECIMAL`                     | [Decimal](../sql-reference/data-types/decimal.md)      |
| `LIST`                        | [Array](../sql-reference/data-types/array.md)          |
| `STRUCT`                      | [Tuple](../sql-reference/data-types/tuple.md)          |
| `MAP`                         | [Map](../sql-reference/data-types/map.md)              |

其他 Parquet 类型不受支持。
### Arrow {#arrow}

在 Arrow 格式中，ClickHouse 从数据中读取其模式，并使用以下类型匹配将其转换为 ClickHouse 模式：

| Arrow 数据类型                  | ClickHouse 数据类型                                     |
|---------------------------------|-----------------------------------------------------|
| `BOOL`                          | [Bool](../sql-reference/data-types/boolean.md)         |
| `UINT8`                         | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `INT8`                          | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UINT16`                        | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `INT16`                         | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UINT32`                        | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `INT32`                         | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UINT64`                        | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `INT64`                         | [Int64](../sql-reference/data-types/int-uint.md)       |
| `FLOAT`, `HALF_FLOAT`            | [Float32](../sql-reference/data-types/float.md)        |
| `DOUBLE`                        | [Float64](../sql-reference/data-types/float.md)        |
| `DATE32`                        | [Date32](../sql-reference/data-types/date32.md)        |
| `DATE64`                        | [DateTime](../sql-reference/data-types/datetime.md)    |
| `TIMESTAMP`, `TIME32`, `TIME64` | [DateTime64](../sql-reference/data-types/datetime64.md)|
| `STRING`, `BINARY`              | [String](../sql-reference/data-types/string.md)        |
| `DECIMAL128`, `DECIMAL256`       | [Decimal](../sql-reference/data-types/decimal.md)      |
| `LIST`                          | [Array](../sql-reference/data-types/array.md)          |
| `STRUCT`                        | [Tuple](../sql-reference/data-types/tuple.md)          |
| `MAP`                           | [Map](../sql-reference/data-types/map.md)              |

其他 Arrow 类型不受支持。
### ORC {#orc}

在 ORC 格式中，ClickHouse 从数据中读取其模式，并使用以下类型匹配将其转换为 ClickHouse 模式：

| ORC 数据类型                        | ClickHouse 数据类型                                     |
|--------------------------------------|-----------------------------------------------------|
| `Boolean`                            | [Bool](../sql-reference/data-types/boolean.md)         |
| `Tinyint`                            | [Int8](../sql-reference/data-types/int-uint.md)        |
| `Smallint`                           | [Int16](../sql-reference/data-types/int-uint.md)       |
| `Int`                                | [Int32](../sql-reference/data-types/int-uint.md)       |
| `Bigint`                             | [Int64](../sql-reference/data-types/int-uint.md)       |
| `Float`                              | [Float32](../sql-reference/data-types/float.md)        |
| `Double`                             | [Float64](../sql-reference/data-types/float.md)        |
| `Date`                               | [Date32](../sql-reference/data-types/date32.md)        |
| `Timestamp`                          | [DateTime64](../sql-reference/data-types/datetime64.md)|
| `String`, `Char`, `Varchar`, `BINARY` | [String](../sql-reference/data-types/string.md)        |
| `Decimal`                            | [Decimal](../sql-reference/data-types/decimal.md)      |
| `List`                               | [Array](../sql-reference/data-types/array.md)          |
| `Struct`                             | [Tuple](../sql-reference/data-types/tuple.md)          |
| `Map`                                | [Map](../sql-reference/data-types/map.md)              |

其他 ORC 类型不受支持。
### Native {#native}

本地格式在 ClickHouse 内部使用，并在数据中包含模式。
在模式推断中，ClickHouse 从数据中读取模式，而不进行任何转换。
## 具有外部模式的格式 {#formats-with-external-schema}

这些格式需要在特定的模式语言中以单独文件描述数据的模式。
为了自动推断这些格式中文件的模式，ClickHouse 从单独的文件读取外部模式，并将其转换为 ClickHouse 表模式。
### Protobuf {#protobuf}

在 Protobuf 格式的模式推断中，ClickHouse 使用以下类型匹配：

| Protobuf 数据类型               | ClickHouse 数据类型                             |
|--------------------------------|-----------------------------------------------|
| `bool`                         | [UInt8](../sql-reference/data-types/int-uint.md) |
| `float`                        | [Float32](../sql-reference/data-types/float.md)  |
| `double`                       | [Float64](../sql-reference/data-types/float.md)  |
| `int32`, `sint32`, `sfixed32`  | [Int32](../sql-reference/data-types/int-uint.md)  |
| `int64`, `sint64`, `sfixed64`  | [Int64](../sql-reference/data-types/int-uint.md)  |
| `uint32`, `fixed32`            | [UInt32](../sql-reference/data-types/int-uint.md) |
| `uint64`, `fixed64`            | [UInt64](../sql-reference/data-types/int-uint.md) |
| `string`, `bytes`              | [String](../sql-reference/data-types/string.md)   |
| `enum`                         | [Enum](../sql-reference/data-types/enum.md)       |
| `repeated T`                   | [Array(T)](../sql-reference/data-types/array.md)  |
| `message`, `group`             | [Tuple](../sql-reference/data-types/tuple.md)     |
### CapnProto {#capnproto}

在 CapnProto 格式的模式推断中，ClickHouse 使用以下类型匹配：

| CapnProto 数据类型                | ClickHouse 数据类型                                    |
|------------------------------------|--------------------------------------------------|
| `Bool`                             | [UInt8](../sql-reference/data-types/int-uint.md)     |
| `Int8`                             | [Int8](../sql-reference/data-types/int-uint.md)      |
| `UInt8`                            | [UInt8](../sql-reference/data-types/int-uint.md)     |
| `Int16`                            | [Int16](../sql-reference/data-types/int-uint.md)     |
| `UInt16`                           | [UInt16](../sql-reference/data-types/int-uint.md)    |
| `Int32`                            | [Int32](../sql-reference/data-types/int-uint.md)     |
| `UInt32`                           | [UInt32](../sql-reference/data-types/int-uint.md)    |
| `Int64`                            | [Int64](../sql-reference/data-types/int-uint.md)     |
| `UInt64`                           | [UInt64](../sql-reference/data-types/int-uint.md)    |
| `Float32`                          | [Float32](../sql-reference/data-types/float.md)      |
| `Float64`                          | [Float64](../sql-reference/data-types/float.md)      |
| `Text`, `Data`                     | [String](../sql-reference/data-types/string.md)      |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)          |
| `List`                             | [Array](../sql-reference/data-types/array.md)        |
| `struct`                           | [Tuple](../sql-reference/data-types/tuple.md)        |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md)|
## 强类型二进制格式 {#strong-typed-binary-formats}

在这些格式中，每个序列化值包含其类型（可能还有其名称）的信息，但没有关于整个表的信息。
在这样的格式的模式推断中，ClickHouse 逐行读取数据（达到 `input_format_max_rows_to_read_for_schema_inference` 行或 `input_format_max_bytes_to_read_for_schema_inference` 字节）并提取每个值的类型（可能还包括名称），然后将这些类型转换为 ClickHouse 类型。
### MsgPack {#msgpack}

在 MsgPack 格式中，行之间没有分隔符，要使用此格式的模式推断，您应该使用设置 `input_format_msgpack_number_of_columns` 指定表中的列数。ClickHouse 使用以下类型匹配：

| MessagePack 数据类型 (`INSERT`)                                | ClickHouse 数据类型                                     |
|---------------------------------------------------------------|-----------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`      | [Int64](../sql-reference/data-types/int-uint.md)       |
| `bool`                                                        | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [String](../sql-reference/data-types/string.md)        |
| `float 32`                                                    | [Float32](../sql-reference/data-types/float.md)        |
| `float 64`                                                    | [Float64](../sql-reference/data-types/float.md)        |
| `uint 16`                                                     | [Date](../sql-reference/data-types/date.md)            |
| `uint 32`                                                     | [DateTime](../sql-reference/data-types/datetime.md)    |
| `uint 64`                                                     | [DateTime64](../sql-reference/data-types/datetime.md)  |
| `fixarray`, `array 16`, `array 32`                            | [Array](../sql-reference/data-types/array.md)          |
| `fixmap`, `map 16`, `map 32`                                  | [Map](../sql-reference/data-types/map.md)              |

默认情况下，所有推断的类型都在 `Nullable` 中，但可以使用设置 `schema_inference_make_columns_nullable` 进行更改。
### BSONEachRow {#bsoneachrow}

在 BSONEachRow 中，每一行数据表示为 BSON 文档。在模式推断中，ClickHouse 逐个读取 BSON 文档，并从数据中提取值、名称和类型，然后使用以下类型匹配将这些类型转换为 ClickHouse 类型：

| BSON 类型                                                                                     | ClickHouse 类型                                                                                                   |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                   |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                 |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                 |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                  |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                          |
| `\x05` binary with `\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                   |
| `\x07` ObjectId,                                                                             | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                    |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                      |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md)（如果嵌套类型不同）        |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md)（带有字符串键）          |

默认情况下，所有推断的类型都在 `Nullable` 中，但可以使用设置 `schema_inference_make_columns_nullable` 进行更改。
## 具有固定模式的格式 {#formats-with-constant-schema}

这种格式中的数据始终具有相同的模式。
### LineAsString {#line-as-string}

在此格式中，ClickHouse 从数据中将整行读取到具有 `String` 数据类型的单列中。此格式的推断类型始终为 `String`，列名为 `line`。

**示例**

```sql
DESC format(LineAsString, 'Hello\nworld!')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ line │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsString {#json-as-string}

在此格式中，ClickHouse 从数据中将整个 JSON 对象读取到具有 `String` 数据类型的单列中。此格式的推断类型始终为 `String`，列名为 `json`。

**示例**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsObject {#json-as-object}

在此格式中，ClickHouse 从数据中将整个 JSON 对象读取到具有 `Object('json')` 数据类型的单列中。此格式的推断类型始终为 `String`，列名为 `json`。

注意：此格式仅在启用 `allow_experimental_object_type` 时有效。

**示例**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}') SETTINGS allow_experimental_object_type=1
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ Object('json') │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## 模式推断模式 {#schema-inference-modes}

从一组数据文件进行模式推断可以在两种不同的模式下工作：`default` 和 `union`。
模式由设置 `schema_inference_mode` 控制。
### 默认模式 {#default-schema-inference-mode}

在默认模式中，ClickHouse 假定所有文件具有相同的模式，并尝试通过逐个读取文件来推断模式，直到成功为止。

示例：

假设我们有 3 个文件 `data1.jsonl`、`data2.jsonl` 和 `data3.jsonl`，内容如下：

`data1.jsonl`：
```json
{"field1" :  1, "field2" :  null}
{"field1" :  2, "field2" :  null}
{"field1" :  3, "field2" :  null}
```

`data2.jsonl`：
```json
{"field1" :  4, "field2" :  "Data4"}
{"field1" :  5, "field2" :  "Data5"}
{"field1" :  6, "field2" :  "Data5"}
```

`data3.jsonl`：
```json
{"field1" :  7, "field2" :  "Data7", "field3" :  [1, 2, 3]}
{"field1" :  8, "field2" :  "Data8", "field3" :  [4, 5, 6]}
{"field1" :  9, "field2" :  "Data9", "field3" :  [7, 8, 9]}
```

让我们尝试在这 3 个文件上使用模式推断：
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='default'
```

结果：

```response
┌─name───┬─type─────────────┐
│ field1 │ Nullable(Int64)  │
│ field2 │ Nullable(String) │
└────────┴──────────────────┘
```

正如我们所看到的，我们没有从文件 `data3.jsonl` 中获得 `field3`。
发生这种情况是因为 ClickHouse 首先尝试从文件 `data1.jsonl` 推断模式，由于 `field2` 只有 null，推断失败，然后尝试从 `data2.jsonl` 推断模式并成功，因此未读取来自 `data3.jsonl` 的数据。
### 联合模式 {#default-schema-inference-mode-1}

在联合模式中，ClickHouse 假定文件可能具有不同的模式，因此它推断所有文件的模式，然后将它们联合为公共模式。

假设我们有 3 个文件 `data1.jsonl`、`data2.jsonl` 和 `data3.jsonl`，内容如下：

`data1.jsonl`：
```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`：
```json
{"field2" :  "Data4"}
{"field2" :  "Data5"}
{"field2" :  "Data5"}
```

`data3.jsonl`：
```json
{"field3" :  [1, 2, 3]}
{"field3" :  [4, 5, 6]}
{"field3" :  [7, 8, 9]}
```

让我们尝试在这 3 个文件上使用模式推断：
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='union'
```

结果：

```response
┌─name───┬─type───────────────────┐
│ field1 │ Nullable(Int64)        │
│ field2 │ Nullable(String)       │
│ field3 │ Array(Nullable(Int64)) │
└────────┴────────────────────────┘
```

正如我们所看到的，我们从所有文件中都有所有字段。

注意：
- 由于一些文件可能不包含结果模式中的某些列，联合模式仅支持那些支持读取列子集的格式（如 JSONEachRow、Parquet、TSVWithNames 等），且不适用于其他格式（如 CSV、TSV、JSONCompactEachRow 等）。
- 如果 ClickHouse 无法从其中一个文件推断模式，则会抛出异常。
- 如果您有许多文件，从所有文件读取模式可能需要很长时间。
## 自动格式检测 {#automatic-format-detection}

如果未指定数据格式且无法通过文件扩展名确定，ClickHouse 将尝试通过内容检测文件格式。

**示例：**

假设我们有  `data`，其内容如下：
```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

我们可以检查和查询此文件，而无需指定格式或结构：
```sql
:) desc file(data);
```

```repsonse
┌─name─┬─type─────────────┐
│ a    │ Nullable(Int64)  │
│ b    │ Nullable(String) │
└──────┴──────────────────┘
```

```sql
:) select * from file(data);
```

```response
┌─a─┬─b─────┐
│ 1 │ Data1 │
│ 2 │ Data2 │
│ 3 │ Data3 │
└───┴───────┘
```

:::note
ClickHouse 只能检测某些格式的子集，且这种检测需要一些时间，通常最好显式指定格式。
:::
