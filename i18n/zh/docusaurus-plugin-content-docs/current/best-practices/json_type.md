---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': '使用 JSON'
'title': '在适当的情况下使用 JSON'
'description': '页面描述何时使用 JSON'
'keywords':
- 'JSON'
'show_related_blogs': true
---

ClickHouse 现在提供了一种原生 JSON 列类型，专为半结构化和动态数据设计。需要明确的是，**这是一种列类型，而不是数据格式**——您可以将 JSON 作为字符串插入到 ClickHouse 中，或者通过支持的格式如 [JSONEachRow](/docs/interfaces/formats/JSONEachRow) 插入，但这并不意味着使用 JSON 列类型。用户应仅在数据结构动态时使用 JSON 类型，而不是仅仅因为他们存储 JSON。

## 何时使用 JSON 类型 {#when-to-use-the-json-type}

当您的数据：

* 具有 **不可预测的键**，可能会随着时间变化。
* 包含 **多种类型的值** （例如，一个路径有时可能包含字符串，有时包含数字）。
* 需要模式灵活性，严格的类型定义不可行。

如果您的数据结构已知且一致，则很少需要使用 JSON 类型，即使您的数据是 JSON 格式的。具体来说，如果您的数据具有：

* **已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：对于这些结构，使用 Tuple、Array 或 Nested 类型。
* **可预测的具有不同类型的结构**：考虑使用 Dynamic 或 Variant 类型。

您也可以混合使用方法——例如，对可预测的顶层字段使用静态列，对有效负载的动态部分使用单一 JSON 列。

## 使用 JSON 的考虑事项和提示 {#considerations-and-tips-for-using-json}

JSON 类型通过将路径扁平化为子列来实现高效的列式存储。但灵活性带来了责任。要有效使用它：

* 使用 [列定义中的提示](/sql-reference/data-types/newjson) 来 **指定路径类型**，为已知子列指定类型，从而避免不必要的类型推断。
* 如果不需要值，请 **跳过路径**，使用 [SKIP 和 SKIP REGEXP](/sql-reference/data-types/newjson) 来减少存储和提高性能。
* **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得太高**——大值会增加资源消耗并降低效率。一般规则是保持在 10,000 以下。

:::note 类型提示
类型提示不仅仅是避免不必要类型推断的一种方式——它们完全消除了存储和处理间接性。带有类型提示的 JSON 路径总是像传统列一样存储，避免了在查询时使用 [**判别列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) 或动态解析的需要。这意味着，使用明确定义的类型提示，嵌套 JSON 字段获得的性能和效率与从一开始就将它们建模为顶层字段是相同的。因此，对于大多数一致但仍有利于 JSON 灵活性的 数据集，类型提示提供了一种方便的方式来保持性能，无需重新构建您的模式或数据摄取管道。
:::

## 高级功能 {#advanced-features}

* JSON 列 **可以像其他列一样用作主键**。不能为子列指定编解码器。
* 它们支持通过 [`JSONAllPathsWithTypes()` 和 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) 函数进行自省。
* 您可以使用 `.^` 语法读取嵌套子对象。
* 查询语法可能与标准 SQL 不同，可能需要对嵌套字段使用特殊的类型转换或操作符。

有关更多指导，请参见 [ClickHouse JSON 文档](/sql-reference/data-types/newjson) 或浏览我们的博客文章 [ClickHouse的新强大JSON数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。

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

假设此模式是静态的，类型可以很好地定义。即使数据是 NDJSON 格式（每行一个 JSON），对于这样的模式也不需要使用 JSON 类型。只需用经典类型定义模式。

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

考虑包含 250 万篇学术论文的 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)。该数据集中每一行，都以 NDJSON 形式分发，表示一篇已发布的学术论文。下面是一个示例行：

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

尽管这里的 JSON 结构复杂且嵌套，但它是可预测的。字段的数量和类型不会变化。虽然我们可以对这个示例使用 JSON 类型，但我们也可以仅使用 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型显式定义结构：

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

我们再次可以将数据作为 JSON 插入：

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设添加了另一个名为 `tags` 的列。如果这只是一个字符串列表，我们可以建模为 `Array(String)`，但假设用户可以添加混合类型的任意标签结构（请注意分数是字符串或整数）。我们的修改后的 JSON 文档：

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

在这种情况下，我们可以将 arXiv 文档建模为全部 JSON 或仅添加一个 JSON `tags` 列。我们在下面提供两个示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供类型提示，因为我们在排序/主键中使用它。这帮助 ClickHouse 知道此列不会为空，并确保它知道使用哪个 `update_date` 子列（可能会有多个，因此否则会模糊）。
:::

我们可以将数据插入该表，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式查看随后的推断模式：

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

或者，我们可以使用我们早期的模式和一个 JSON `tags` 列进行建模。这通常是优选的，最小化 ClickHouse 所需的推断：

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
