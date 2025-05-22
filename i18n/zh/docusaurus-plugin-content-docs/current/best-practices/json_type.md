---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': '使用 JSON'
'title': '在适当的地方使用 JSON'
'description': '页面描述何时使用 JSON'
---

ClickHouse 现在提供了一种专为半结构化和动态数据设计的原生 JSON 列类型。重要的是要明确 **这是一种列类型，而不是数据格式**——您可以将 JSON 作为字符串插入 ClickHouse，或者通过支持的格式如 [JSONEachRow](/docs/interfaces/formats/JSONEachRow) 插入，但这并不意味着使用 JSON 列类型。当数据结构是动态时，用户应仅使用 JSON 类型，而不是仅仅因为存储了 JSON。

## 何时使用 JSON 类型 {#when-to-use-the-json-type}

当您的数据：

* 具有 **不可预测的键**，可能会随着时间而变化。
* 包含 **具有不同类型的值**（例如，一个路径有时可能包含字符串，有时可能包含数字）。
* 需要模式灵活性，严格类型不切实际。

如果您的数据结构是已知且一致的，即使数据是 JSON 格式，也很少需要使用 JSON 类型。具体来说，如果您的数据具有：

* **具有已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：对于这些结构，使用 Tuple、Array 或 Nested 类型。
* **具有不同类型的可预测结构**：可以考虑使用 Dynamic 或 Variant 类型。

您还可以混合使用方法——例如，使用静态列来存储可预测的顶级字段，并为有效载荷的动态部分使用单个 JSON 列。

## 使用 JSON 的注意事项和建议 {#considerations-and-tips-for-using-json}

JSON 类型通过将路径扁平化为子列，启用高效的列式存储。但是，灵活性伴随着责任。要有效使用它：

* **使用[column definition中的提示]( /sql-reference/data-types/newjson)** 指定路径类型，以避免不必要的类型推断。
* **跳过不需要的路径**，使用 [SKIP 和 SKIP REGEXP](/sql-reference/data-types/newjson) 以减少存储并提高性能。
* **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得过高**——较大的值会增加资源消耗并降低效率。作为经验法则，保持在 10,000 以下。

:::note 类型提示
类型提示不仅仅是避免不必要类型推断的方法——它们完全消除了存储和处理间接的需要。带有类型提示的 JSON 路径始终像传统列一样存储，避免了在查询时需要[**鉴别列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或动态解析。这意味着，使用明确定义的类型提示，嵌套 JSON 字段能够达到与从一开始就建模为顶级字段相同的性能和效率。因此，对于大部分一致但仍受益于 JSON 灵活性的数据集，类型提示提供了一种方便的方式来保持性能，而无需重构您的模式或摄取管道。
:::

## 高级功能 {#advanced-features}

* JSON 列 **可以像其他列一样用于主键**。子列不能指定编解码器。
* 它们支持通过 [JSONAllPathsWithTypes() 和 JSONDynamicPaths()]( /sql-reference/data-types/newjson#introspection-functions)等函数进行自省。
* 您可以使用 `.^` 语法读取嵌套子对象。
* 查询语法可能与标准 SQL 不同，可能需要为嵌套字段进行特殊的类型转换或操作符。

有关额外指导，请参阅 [ClickHouse JSON 文档](/sql-reference/data-types/newjson) 或探索我们的博客文章 [ClickHouse 的新强大 JSON 数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。

## 示例 {#examples}

考虑以下 JSON 示例，代表 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 中的一行：

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

假设此模式是静态的且类型可以明确定义。即使数据采用 NDJSON 格式（每行一个 JSON），对于此模式也没有必要使用 JSON 类型。只需使用经典类型定义架构即可。

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

考虑包含 250 万篇学术论文的 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)。此数据集中，每行分布为 NDJSON，代表已发布的学术论文。以下是一个示例行：

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

虽然这里的 JSON 结构复杂，并且存在嵌套结构，但它是可预测的。字段的数量和类型不会改变。虽然我们可以为此示例使用 JSON 类型，但我们也可以仅使用 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型明确定义该结构：

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

同样，我们可以将数据作为 JSON 插入：

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设添加了一个名为 `tags` 的列。如果这只是一个字符串列表，我们可以将其建模为 `Array(String)`，但假设用户可以添加具有混合类型的任意标签结构（注意 score 是字符串或整数）。我们的修改 JSON 文档：

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

在这种情况下，我们可以将 arXiv 文档建模为全部 JSON 或简单地添加一个 JSON `tags` 列。我们在下面提供两种示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供类型提示，因为我们在排序/主键中使用它。这有助于 ClickHouse 知道该列不会为 null，并确保它知道使用哪个 `update_date` 子列（每种类型可能有多个，因此否则会造成歧义）。
:::

我们可以向此表插入数据，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式查看随后的推断架构：

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

另外，我们可以使用先前的模式和 JSON `tags` 列进行建模。这通常更可取，最小化 ClickHouse 所需的推断：

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
