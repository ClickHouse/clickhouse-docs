---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: '使用 JSON'
title: '在合适的场景下使用 JSON'
description: '说明在何种情况下应使用 JSON 的页面'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse 现在提供了原生的 JSON 列类型，用于半结构化和动态数据。需要明确的是，**这是一种列类型，而不是一种数据格式**——你可以将 JSON 以字符串形式插入 ClickHouse，或者通过 [JSONEachRow](/interfaces/formats/JSONEachRow) 等受支持的格式插入，但这并不意味着你在使用 JSON 列类型。只有在数据结构是动态的情况下，你才应该使用 JSON 类型，而不是仅仅因为数据恰好以 JSON 形式存储就使用它。

## 何时使用 JSON 类型 {#when-to-use-the-json-type}

在以下情况下使用 JSON 类型：

* 存在**不可预测的键名**，并且这些键名会随时间变化。
* 包含**类型各异的值**（例如，同一路径有时是字符串，有时是数字）。
* 需要灵活的 schema，无法采用严格类型定义时。

如果你的数据结构是已知且一致的，即使数据本身是 JSON 格式，也很少需要使用 JSON 类型。具体而言，如果你的数据具有：

* **扁平结构且键名是已知的**：使用标准列类型，例如 String。
* **可预测的嵌套结构**：为这些结构使用 Tuple、Array 或 Nested 类型。
* **可预测的结构但值类型可能不同**：可以考虑使用 Dynamic 或 Variant 类型。

你也可以混合使用这些方法——例如，对可预测的顶层字段使用静态列，对负载中动态部分使用单独的 JSON 列。

## 使用 JSON 的注意事项和技巧 {#considerations-and-tips-for-using-json}

`JSON` 类型通过将路径展开为子列，实现了高效的列式存储。但灵活性也意味着需要更谨慎地使用。要高效使用它：

* **指定路径类型**：在[列定义中使用提示](/sql-reference/data-types/newjson)为已知子列指定类型，避免不必要的类型推断。 
* **跳过路径**：如果不需要某些值，可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 来减少存储并提升性能。
* **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得过高**——值太大将增加资源消耗并降低效率。作为经验法则，建议将其保持在 10,000 以下。

:::note 类型提示 
类型提示不仅仅是避免不必要类型推断的一种方式——它们还能完全消除存储和处理中的间接开销。带有类型提示的 JSON 路径始终像传统列一样存储，无需[**判别列（discriminator columns）**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或在查询时进行动态解析。也就是说，如果类型提示定义得当，嵌套 JSON 字段可以获得与一开始就建模为顶层字段相同的性能和效率。因此，对于大部分结构一致、但仍希望利用 JSON 灵活性的数据集，类型提示提供了一种便捷方式，在无需重构模式（schema）或摄取管道的前提下保持性能。
:::

## 高级特性 {#advanced-features}

* JSON 列**可以像其他列一样用作主键**。无法为子列指定编解码器。
* 它们支持通过诸如 [`JSONAllPathsWithTypes()` 和 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) 等函数进行自省。
* 可以使用 `.^` 语法读取嵌套子对象。
* 查询语法可能与标准 SQL 不同，对于嵌套字段可能需要使用特殊的类型转换或运算符。

如需更多指导，请参阅 [ClickHouse JSON 文档](/sql-reference/data-types/newjson)，或阅读我们的博文 [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。

## 示例 {#examples}

考虑以下 JSON 示例，它表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行数据：

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

假设该 schema 是静态的，其类型可以被明确定义。即使数据采用 NDJSON 格式（每行一条 JSON 记录），对于这样的 schema 也没有必要使用 JSON 类型。只需使用常规类型来定义该 schema 即可。

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

并插入 JSON 数据行：

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

请参考 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，其中包含 250 万篇学术论文。该数据集以 NDJSON 形式分发，其中每一行代表一篇已发表的学术论文。下面是一行示例数据：

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

虽然这里的 JSON 很复杂，包含嵌套结构，但其结构是可预测的，字段的数量和类型不会发生变化。在这个示例中，我们可以使用 JSON 类型，但也可以直接使用 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型显式地定义结构：

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

同样也可以将数据以 JSON 形式插入：


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设我们又添加了一列，名为 `tags`。如果这只是一个字符串列表，我们可以将其建模为 `Array(String)`，但我们假设你可以添加包含混合类型的任意标签结构（注意 `score` 可以是字符串或整数）。我们修改后的 JSON 文档如下：

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

在这种情况下，我们可以将 arXiv 文档建模为全部使用 JSON 格式，或者仅添加一个 JSON 类型的 `tags` 列。下面我们提供这两种方式的示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供了类型提示，因为我们在排序/主键中使用它。这有助于 ClickHouse 确定该列不会为 null，并确保它能够知道应使用哪个 `update_date` 子列（针对每种类型可能存在多个子列，否则会产生歧义）。
:::

我们可以向此表中插入数据，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式来查看随后推断出的表结构：


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

或者，我们也可以使用之前的模式和一个 JSON `tags` 列来建模。一般更推荐这种方式，因为它可以尽量减少 ClickHouse 需要进行的推断：

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


现在我们可以推断子列 `tags` 的数据类型了。

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
