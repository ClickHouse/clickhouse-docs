---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: '使用 JSON'
title: '在合适的场景下使用 JSON'
description: '介绍何时应当使用 JSON 的页面'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse 现在提供了一种原生的 JSON 列类型，用于处理半结构化和动态数据。需要特别说明的是，**这是一种列类型，而不是一种数据格式**——可以将 JSON 作为字符串插入到 ClickHouse 中，或者通过诸如 [JSONEachRow](/interfaces/formats/JSONEachRow) 之类的受支持格式进行插入，但这并不意味着在使用 JSON 列类型。只有当数据结构本身是动态的，而不是只是碰巧以 JSON 形式存储时，才应使用 JSON 列类型。



## 何时使用 JSON 类型 {#when-to-use-the-json-type}

在以下情况下使用 JSON 类型：

* 数据具有**不可预测的键名（key）**，并且这些键名会随着时间变化。
* 数据包含**类型各异的值**（例如，同一路径上的值有时是字符串，有时是数字）。
* 在模式（schema）上需要较高的灵活性，无法采用严格类型。

如果数据结构是已知且稳定的，即使数据本身是 JSON 格式，通常也很少需要使用 JSON 类型。具体来说，如果数据具有：

* **扁平结构且键名是已知的**：使用标准列类型，例如 String。
* **可预测的嵌套结构**：对这些结构使用 Tuple、Array 或 Nested 类型。
* **结构可预测但值类型多样**：可以考虑使用 Dynamic 或 Variant 类型。

也可以混合使用多种方式——例如，为可预测的顶层字段使用静态列，同时为负载中动态变化的部分使用单个 JSON 列。



## 使用 JSON 的注意事项和技巧 {#considerations-and-tips-for-using-json}

`JSON` 类型通过将路径展平成子列，实现了高效的列式存储。但更高的灵活性也意味着需要承担相应的责任。要高效地使用它：

* **指定路径类型**，在[列定义中使用类型提示](/sql-reference/data-types/newjson)为已知子列指定类型，从而避免不必要的类型推断。
* **跳过不需要的路径**，如果你不需要某些值，可以使用 [SKIP 和 SKIP REGEXP](/sql-reference/data-types/newjson) 来减少存储占用并提升性能。
* **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得过高**——过大的数值会增加资源消耗并降低效率。经验法则是将其控制在 10,000 以下。

:::note 类型提示 
类型提示不仅仅是避免不必要类型推断的一种方式——它还能彻底消除存储和处理过程中的间接层。带有类型提示的 JSON 路径始终与传统列以相同方式存储，从而不再需要在查询时依赖[**判别器列（discriminator columns）**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或进行动态解析。也就是说，在类型提示定义完善的情况下，嵌套的 JSON 字段可以获得与从一开始就建模为顶层字段几乎相同的性能和效率。因此，对于大多数结构相对稳定、但仍希望保留 JSON 灵活性的数据集，类型提示提供了一种便捷方式，在无需重构模式（schema）或摄取管道的前提下，保持性能。
:::



## 高级功能 {#advanced-features}

* JSON 列**可以像其他任意列一样用于主键**。不能为子列指定编解码器（codec）。
* 它们支持通过诸如 [`JSONAllPathsWithTypes()` 和 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) 等函数进行自省。
* 可以使用 `.^` 语法读取嵌套子对象。
* 查询语法可能与标准 SQL 不同，对嵌套字段可能需要使用特殊的类型转换或操作符。

如需更多指导，请参阅 [ClickHouse JSON 文档](/sql-reference/data-types/newjson)，或查看我们的博文 [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。



## 示例 {#examples}

请看以下 JSON 示例，它表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行数据：

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

假设这个模式是静态的，且各字段类型都可以被明确定义。即使数据是 NDJSON 格式（每行一条 JSON 记录），对于这样的模式也没有必要使用 JSON 类型。只需使用常规类型来定义该模式即可。

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

并插入 JSON 记录：

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

以包含 250 万篇学术论文的 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)为例。该数据集以 NDJSON 格式分发，其中每一行代表一篇已发表的学术论文。下面是一行示例数据：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "每秒千兆字节级数字解析",
  "comments": "软件位于 https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "随着磁盘和网络提供每秒千兆字节级的吞吐量....\n",
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

虽然这里的 JSON 结构复杂且包含嵌套，但它是可预测的，字段的数量和类型是固定的。虽然在本示例中我们可以使用 JSON 类型，但也可以直接使用 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型显式定义结构：

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

同样，我们可以以 JSON 格式插入数据：


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设新增了一列名为 `tags`。如果它只是一个字符串列表，我们可以将其建模为 `Array(String)`，但假设用户可以添加具有混合类型的任意标签结构（注意 `score` 可能是字符串或整数）。我们修改后的 JSON 文档如下：

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "每秒千兆字节的数字解析速度",
 "comments": "软件地址：https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/",
 "journal-ref": "Software: Practice and Experience 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "随着磁盘和网络提供每秒千兆字节的传输速度....\n",
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
     "name": "ClickHouse 用户",
     "score": "A+",
     "comment": "值得一读，适用于 ClickHouse",
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "收获不大",
     "updates": [
       {
         "name": "professor X",
         "comment": "发现金刚狼的内容更有趣"
       }
     ]
   }
 }
}
```

在本例中，我们可以将 arXiv 文档建模为全部使用 JSON，或者仅添加一个 JSON 类型的 `tags` 列。下面给出这两种示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供了类型提示，因为会在排序/主键中使用该列。这有助于 ClickHouse 确定该列不会为 null，并确保它知道应使用哪个 `update_date` 子列（每种类型可能都有多个子列，否则就会产生歧义）。
:::

我们可以向该表插入数据，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式查看后续推断出的 schema：


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"每秒千兆字节的数字解析","comments":"软件位于 https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"随着磁盘和网络提供每秒千兆字节的速度....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"值得一读,适用于 ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"收获不大","updates":[{"name":"professor X","comment":"Wolverine 觉得更有趣"}]}}}
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

返回 1 行。用时:0.003 秒。
```

或者，我们也可以使用之前的 schema，并通过一个 JSON `tags` 列来建模。通常更推荐这种方式，因为它可以最大程度减少 ClickHouse 所需的推断工作：

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse 用户","score":"A+","comment":"值得一读，适用于 ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"收获不大","updates":[{"name":"professor X","comment":"金刚狼认为更有意思"}]}}}
```


现在我们就可以推断出子列 `tags` 的类型了。

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
