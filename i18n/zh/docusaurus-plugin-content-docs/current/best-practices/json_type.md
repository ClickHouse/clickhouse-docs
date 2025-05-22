ClickHouse 现在提供了一种针对半结构化和动态数据的原生 JSON 列类型。重要的是要澄清 **这是一种列类型，而不是一种数据格式**——您可以将 JSON 作为字符串插入 ClickHouse，或通过支持的格式如 [JSONEachRow](/docs/interfaces/formats/JSONEachRow) 插入，但这并不意味着要使用 JSON 列类型。当数据结构是动态的时，用户应仅使用 JSON 类型，而不是在他们仅仅存储 JSON 时使用。

## 何时使用 JSON 类型 {#when-to-use-the-json-type}

当您的数据：

* 具有 **不可预测的键**，可能会随着时间而变化。
* 包含 **具有不同类型的值**（例如，路径有时可能包含字符串，有时可能是数字）。
* 需要模式灵活性，严格类型不适用。

如果您的数据结构是已知且一致的，即使数据为 JSON 格式，也很少需要使用 JSON 类型。具体来说，如果您的数据具有：

* **具有已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：使用 Tuple、Array 或 Nested 类型来处理这些结构。
* **具有不同类型的可预测结构**：可以考虑使用 Dynamic 或 Variant 类型。

您还可以混合使用不同的方法——例如，对于可预测的顶层字段使用静态列，对于有效载荷的动态部分使用单个 JSON 列。

## 使用 JSON 的注意事项和提示 {#considerations-and-tips-for-using-json}

JSON 类型通过将路径展平为子列来实现高效的列式存储。但灵活性也伴随着责任。为了有效使用它：

* 使用 [列定义中的提示](/sql-reference/data-types/newjson) 指定路径类型，以便为已知子列指定类型，避免不必要的类型推断。
* 如果不需要值，则可以跳过路径，使用 [SKIP 和 SKIP REGEXP](/sql-reference/data-types/newjson) 来减少存储并提高性能。
* **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得过高**——较大的值会增加资源消耗并降低效率。作为经验法则，保持其低于 10,000。

:::note 类型提示 
类型提示不仅仅是避免不必要类型推断的方法——它们完全消除了存储和处理间接性。带有类型提示的 JSON 路径始终像传统列一样存储，避免在查询时需要 [**区分列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) 或动态解析。这意味着，通过良好定义的类型提示，嵌套的 JSON 字段获得了与从一开始就建模为顶层字段相同的性能和效率。因此，对于大多数一致但仍从 JSON 的灵活性中受益的数据集，类型提示提供了一种方便的方法来保持性能，而无需重构架构或摄取管道。
:::

## 高级功能 {#advanced-features}

* JSON 列 **可以像其他列一样用作主键**。不能为子列指定编码器。
* 它们支持通过 [`JSONAllPathsWithTypes()` 和 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) 函数进行自检。
* 您可以使用 `.^` 语法读取嵌套子对象。
* 查询语法可能与标准 SQL 不同，可能需要对嵌套字段进行特殊的转换或操作符。

有关更多指导，请参见 [ClickHouse JSON 文档](/sql-reference/data-types/newjson) 或探索我们的博客文章 [ClickHouse 的新强大 JSON 数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。

## 示例 {#examples}

考虑以下 JSON 示例，表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行：

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

假设这个模式是静态的，并且类型可以很好地定义。即使数据的格式为 NDJSON（每行一个 JSON），对于这样的模式也没有必要使用 JSON 类型。只需使用经典类型定义模式。

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

并插入 JSON 行：

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

考虑 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，其中包含 250 万篇学术论文。该数据集中每行以 NDJSON 形式分发，代表一篇已发表的学术论文。示例行如下所示：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

尽管这里的 JSON 复杂，具有嵌套结构，但它是可预测的。字段的数量和类型不会改变。虽然我们可以对这个例子使用 JSON 类型，但我们也可以通过使用 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型显式定义结构：

```sql
CREATE TABLE arxiv
(
  `id` String,
  `submitter` String,
  `authors` String,
  `title` String,
  `comments` String,
  `journal-ref` String,
  `doi` String,
  `report-no` String,
  `categories` String,
  `license` String,
  `abstract` String,
  `versions` Array(Tuple(created String, version String)),
  `update_date` Date,
  `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

我们同样可以将数据作为 JSON 插入：

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设添加了另一个名为 `tags` 的列。如果这只是一个字符串列表，我们可以将其建模为 `Array(String)`，但假设用户可以添加任意标签结构并混合类型（请注意分数是字符串或整数）。我们修改后的 JSON 文档：

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "Number Parsing at a Gigabyte per Second",
 "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
 "journal-ref": "Software: Practice and Experience 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "With disks and networks providing gigabytes per second ....\n",
 "versions": [
 {
   "created": "Mon, 11 Jan 2021 20:31:27 GMT",
   "version": "v1"
 },
 {
   "created": "Sat, 30 Jan 2021 23:57:29 GMT",
   "version": "v2"
 }
 ],
 "update_date": "2022-11-07",
 "authors_parsed": [
 [
   "Lemire",
   "Daniel",
   ""
 ]
 ],
 "tags": {
   "tag_1": {
     "name": "ClickHouse user",
     "score": "A+",
     "comment": "A good read, applicable to ClickHouse"
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "Didn't learn much",
     "updates": [
       {
         "name": "professor X",
         "comment": "Wolverine found more interesting"
       }
     ]
   }
 }
}
```

在这种情况下，我们可以将 arXiv 文档建模为全 JSON 或者简单地添加一个 JSON `tags` 列。我们在下面提供了两个示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供了类型提示，因为我们在排序/主键中使用它。这有助于 ClickHouse 知道该列不会为 null，并确保它知道使用哪个 `update_date` 子列（每种类型可能有多个，因此否则会模糊不清）。
:::

我们可以将数据插入到此表中，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式查看随后推断的模式：

```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

```sql
SELECT JSONAllPathsWithTypes(doc)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(doc)": {
    "abstract": "String",
    "authors": "String",
    "authors_parsed": "Array(Array(Nullable(String)))",
    "categories": "String",
    "comments": "String",
    "doi": "String",
    "id": "String",
    "journal-ref": "String",
    "license": "String",
    "submitter": "String",
    "tags.28_03_2025.comment": "String",
    "tags.28_03_2025.name": "String",
    "tags.28_03_2025.score": "Int64",
    "tags.28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tags.tag_1.comment": "String",
    "tags.tag_1.name": "String",
    "tags.tag_1.score": "String",
    "title": "String",
    "update_date": "Date",
    "versions": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))"
  }
}

1 row in set. Elapsed: 0.003 sec.
```

或者，我们可以使用我们之前的模式和 JSON `tags` 列进行建模。通常更受欢迎，这样可以最小化 ClickHouse 所需的推断：

```sql
CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String)),
    `tags` JSON()
)
ENGINE = MergeTree
ORDER BY update_date
```

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

我们现在可以推断子列 tags 的类型。

```sql
SELECT JSONAllPathsWithTypes(tags)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(tags)": {
    "28_03_2025.comment": "String",
    "28_03_2025.name": "String",
    "28_03_2025.score": "Int64",
    "28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tag_1.comment": "String",
    "tag_1.name": "String",
    "tag_1.score": "String"
  }
}

1 row in set. Elapsed: 0.002 sec.
```
