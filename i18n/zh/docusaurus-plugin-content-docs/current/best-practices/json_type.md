---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Using JSON'
title: '在适当场景下使用 JSON'
description: '说明何时使用 JSON 的页面'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse 现在提供了专为半结构化和动态数据设计的原生 JSON 列类型。需要特别说明的是，**这是一种列类型，而不是一种数据格式**——可以将 JSON 以字符串形式插入 ClickHouse，或者通过 [JSONEachRow](/interfaces/formats/JSONEachRow) 等受支持的格式导入，但这并不意味着在使用 JSON 列类型。只有在数据结构本身是动态的情况下才应使用 JSON 类型，而不是仅仅因为数据碰巧以 JSON 形式存储就选择它。



## 何时使用 JSON 类型 {#when-to-use-the-json-type}

在以下情况下使用 JSON 类型:

- 具有**不可预测的键**,这些键可能随时间变化。
- 包含**类型可变的值**(例如,某个路径有时可能包含字符串,有时包含数字)。
- 需要模式灵活性,而严格的类型约束不适用。

如果您的数据结构是已知且一致的,则很少需要使用 JSON 类型,即使您的数据采用 JSON 格式。具体而言,如果您的数据具有:

- **具有已知键的扁平结构**:使用标准列类型,例如 String。
- **可预测的嵌套结构**:对这些结构使用 Tuple、Array 或 Nested 类型。
- **结构可预测但类型可变**:考虑使用 Dynamic 或 Variant 类型。

您还可以混合使用多种方法——例如,对可预测的顶级字段使用静态列,对数据负载的动态部分使用单个 JSON 列。


## 使用 JSON 的注意事项和技巧 {#considerations-and-tips-for-using-json}

JSON 类型通过将路径展平为子列来实现高效的列式存储。但灵活性意味着责任。要有效使用它：

- **指定路径类型**：使用[列定义中的类型提示](/sql-reference/data-types/newjson)为已知子列指定类型，避免不必要的类型推断。
- **跳过路径**：如果不需要某些值，可使用 [SKIP 和 SKIP REGEXP](/sql-reference/data-types/newjson) 来减少存储并提高性能。
- **避免将 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 设置得过高**——较大的值会增加资源消耗并降低效率。根据经验，应将其保持在 10,000 以下。

:::note 类型提示
类型提示不仅仅是避免不必要类型推断的方法——它们完全消除了存储和处理的间接层。带有类型提示的 JSON 路径始终像传统列一样存储,无需使用[**判别列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或在查询时进行动态解析。这意味着通过明确定义的类型提示，嵌套的 JSON 字段可以达到与从一开始就建模为顶级字段相同的性能和效率。因此，对于大部分结构一致但仍需要 JSON 灵活性的数据集，类型提示提供了一种便捷的方式来保持性能，而无需重构模式或数据摄取管道。
:::


## 高级功能 {#advanced-features}

- JSON 列**可以像其他列一样用于主键**。子列无法指定编解码器。
- 支持通过 [`JSONAllPathsWithTypes()` 和 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) 等函数进行内省。
- 可以使用 `.^` 语法读取嵌套的子对象。
- 查询语法可能与标准 SQL 不同,嵌套字段可能需要特殊的类型转换或运算符。

如需更多指导,请参阅 [ClickHouse JSON 文档](/sql-reference/data-types/newjson)或浏览我们的博客文章[ClickHouse 的新型强大 JSON 数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。


## 示例 {#examples}

考虑以下 JSON 示例,它代表 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 中的一行数据:

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

假设此模式是静态的,且类型可以明确定义。即使数据采用 NDJSON 格式(每行一个 JSON 对象),也无需为此类模式使用 JSON 类型。只需使用经典类型定义模式即可。

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

然后插入 JSON 行:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

考虑包含 250 万篇学术论文的 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)。该数据集以 NDJSON 格式分发,其中每一行代表一篇已发表的学术论文。下面显示了一个示例行:

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

虽然这里的 JSON 结构复杂,包含嵌套结构,但它是可预测的。字段的数量和类型不会改变。虽然我们可以在此示例中使用 JSON 类型,但也可以使用 [Tuple](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型显式定义结构:

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

同样,我们可以将数据作为 JSON 插入:


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

假设新增了一列名为 `tags`。如果这只是一个字符串列表，我们可以将其建模为 `Array(String)`，但我们假设用户可以添加包含多种类型的任意标签结构（注意 `score` 可以是字符串或整数）。我们修改后的 JSON 文档如下：

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "每秒千兆字节的数字解析",
 "comments": "软件位于 https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/",
 "journal-ref": "软件:实践与经验 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "随着磁盘和网络提供每秒千兆字节的速度....\n",
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
     "comment": "值得一读,适用于 ClickHouse",
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "收获不大",
     "updates": [
       {
         "name": "professor X",
         "comment": "发现 Wolverine 更有趣"
       }
     ]
   }
 }
}
```

在这种情况下，我们可以将 arXiv 文档全部建模为 JSON，或者只新增一个 JSON 类型的 `tags` 列。下面我们提供这两种做法的示例：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
我们在 JSON 定义中为 `update_date` 列提供了类型提示，因为在排序键和主键中会使用到该列。这样可以让 ClickHouse 确认该列不会为 NULL，并确保它能够确定应使用哪个 `update_date` 子列（每种类型可能都有多个子列，否则会产生歧义）。
:::

我们可以向此表中插入数据，并使用 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 函数和 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 输出格式查看随后推断出的表结构：


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"以每秒千兆字节速度解析数字","comments":"软件位于 https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"随着磁盘和网络提供每秒千兆字节的速度....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse 用户","score":"A+","comment":"值得一读,适用于 ClickHouse"},"28_03_2025":{"name":"X 教授","score":10,"comment":"收获不多","updates":[{"name":"X 教授","comment":"金刚狼认为更有趣"}]}}}
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

或者，我们也可以使用之前的模式，并通过一个 JSON `tags` 列来建模。通常更推荐这种做法，因为它可以尽量减少 ClickHouse 所需的推断工作：

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"以每秒千兆字节速度解析数字","comments":"软件位于 https://github.com/fastfloat/fast_float 和\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"随着磁盘和网络提供每秒千兆字节的速度....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse 用户","score":"A+","comment":"值得一读,适用于 ClickHouse"},"28_03_2025":{"name":"X 教授","score":10,"comment":"收获不多","updates":[{"name":"X 教授","comment":"金刚狼认为更有趣"}]}}}
```


现在我们可以推断出子列 `tags` 的类型了。

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
