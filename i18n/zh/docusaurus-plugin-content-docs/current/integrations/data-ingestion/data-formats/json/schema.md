---
title: '设计 JSON 模式'
slug: /integrations/data-formats/json/schema
description: '如何优化设计 JSON 模式'
keywords: ['json', 'ClickHouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# 设计你的 schema

虽然可以使用 [schema 推断](/integrations/data-formats/json/inference) 为 JSON 数据建立初始 schema，并就地查询 JSON 数据文件（例如存储在 S3 中），但仍建议用户为其数据建立一个经过优化的可版本化 schema。下面我们将讨论对 JSON 结构建模的推荐方法。



## 静态 JSON 与动态 JSON

为 JSON 定义模式（schema）的首要任务，是为每个键的值确定合适的类型。我们建议用户在 JSON 层级结构中的每个键上递归应用以下规则，以确定每个键的合适类型。

1. **基本类型（Primitive types）** - 如果某个键的值是基本类型，无论它属于子对象还是根对象，都应确保根据通用模式的[设计最佳实践](/data-modeling/schema-design)和[类型优化规则](/data-modeling/schema-design#optimizing-types)选择其类型。基本类型数组（例如下面的 `phone_numbers`）可以建模为 `Array(&lt;type&gt;)`，例如 `Array(String)`。
2. **静态 vs 动态** - 如果某个键的值是复杂对象，即对象或对象数组，需要判断其是否会发生变化。对于很少新增键、且新增键可以预期并可通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 进行模式变更来处理的对象，可视为**静态**。这也包括在某些 JSON 文档中仅提供部分键子集的对象。对于经常新增键和/或新增键不易预测的对象，应视为**动态**。**此处的例外是拥有数百或数千个子键的结构，为方便起见，这类结构可以视为动态。**

要判断某个值是**静态**还是**动态**，请参阅下文相关章节：[**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures)和[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p />

**重要提示：** 上述规则应递归应用。如果某个键的值被判定为动态，则无需进一步评估，可直接遵循[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)中的指导原则。如果对象为静态，则继续评估其子键，直到键值为基本类型，或遇到动态键为止。

为说明这些规则，我们使用下列表示某个人的 JSON 示例：

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "维克多平原街",
      "suite": "879套房",
      "city": "威索基堡",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "实时分析数据仓库",
    "labels": {
      "type": "数据库系统",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "数据库",
    "holidays": [
      {
        "year": 2024,
        "location": "葡萄牙亚速尔群岛"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

应用这些规则：

* 根级键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是类型为 `Array(String)` 的数组基本类型列，其中 `dob` 和 `id` 的类型分别为 `Date` 和 `UInt32`。
* 不会向 `address` 对象添加新的键（只会新增 `address` 对象），因此可以将其视为**静态**。如果我们递归展开该结构，除 `geo` 之外，所有子列都可以视为基本类型（且为 `String` 类型）。`geo` 同样是一个静态结构，包含两个 `Float32` 列：`lat` 和 `lon`。
* `tags` 列是**动态**的。我们假设可以向该对象中添加任意类型和结构的新标签。
* `company` 对象是**静态**的，并且始终最多只包含指定的 3 个键。子键 `name` 和 `catchPhrase` 的类型为 `String`。键 `labels` 是**动态**的。我们假设可以向该对象中添加任意新的标签，其值始终是 `String` 类型的键值对。


:::note
包含数百或数千个静态键的结构也可以视为动态结构，因为在实际场景中几乎不可能为它们静态声明所有列。不过，在可能的情况下，应尽量[跳过](#using-type-hints-and-skipping-paths)不需要的路径，以同时节省存储和推断开销。
:::



## 处理静态结构

我们建议使用具名元组类型（`Tuple`）来表示静态结构。对象数组可以使用元组数组来表示，即 `Array(Tuple)`。在元组内部，各列及其对应的类型也应按照相同的规则进行定义。这样就可以通过嵌套的 Tuple 来表示嵌套对象，如下所示。

为便于说明，我们使用前面的 JSON person 示例，并省略其中的动态对象：

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "实时分析数据仓库"
  },
  "dob": "2007-03-31"
}
```

此表的结构如下所示：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

请注意，`company` 列被定义为 `Tuple(catchPhrase String, name String)`。`address` 键使用 `Array(Tuple)`，并通过嵌套的 `Tuple` 来表示 `geo` 列。

可以按当前结构将 JSON 插入到此表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在上面的示例中，我们只有少量数据，但如下所示，可以通过它们以点号分隔的名称来查询这些 tuple 列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

请注意，`address.street` 列是以 `Array` 类型返回的。要通过位置查询数组中的某个元素，应在列名后指定数组下标。例如，要获取第一个地址中的街道信息：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

返回 1 行。耗时: 0.001 秒。
```

从 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 版本开始，还可以在排序键中使用子列：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY company.name
```

### 处理默认值

即使 JSON 对象具有结构化格式，它们通常也很稀疏，只会提供已知键的一个子集。幸运的是，`Tuple` 类型并不要求 JSON 负载中必须包含所有列。如果未提供，将使用默认值。


考虑我们之前的 `people` 表，以及下面这个稀疏的 JSON，它缺少 `suite`、`geo`、`phone_numbers` 和 `catchPhrase` 这些键。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771"
    }
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}
```

可以看到，下面这一行已成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

好的。

1 行记录。耗时：0.002 秒。
```

查询这一行记录时，我们可以看到，被省略的列（包括子对象）都使用了默认值：

```sql
SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
  "id": "1",
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "city": "Wisokyburgh",
      "geo": {
        "lat": 0,
        "lng": 0
      },
      "street": "Victor Plains",
      "suite": "",
      "zipcode": "90566-7771"
    }
  ],
  "phone_numbers": [],
  "website": "clickhouse.com",
  "company": {
    "catchPhrase": "",
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}

返回 1 行。耗时：0.001 秒。
```

:::note 区分空值和 null
如果用户需要区分值为空和未提供的情况，可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。除非绝对必要，否则[应避免使用](/best-practices/select-data-types#avoid-nullable-columns)该类型，因为它会对这些列的存储和查询性能产生负面影响。
:::

### 处理新列

当 JSON 键是静态时，采用结构化方式是最简单的。但即使可以预先规划模式（schema）变更（即事先知道新的键，并且可以相应地修改模式），仍然可以使用这种方式。

请注意，ClickHouse 默认会忽略在负载中提供但在模式中不存在的 JSON 键。考虑下面这个经过修改的 JSON 负载，其中新增了一个 `nickname` 键：

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "nickname": "Clicky",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "实时分析数据仓库"
  },
  "dob": "2007-03-31"
}
```

此 JSON 可以在忽略 `nickname` 键的情况下成功插入：


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 行数据。用时：0.002 秒。
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向表结构添加列。可以通过 `DEFAULT` 子句指定默认值，在后续插入时如果未为该列显式指定值，将使用该默认值。对于在该列创建之前已插入、因此不包含该列值的行，查询时也会返回这个默认值。如果未指定 `DEFAULT` 值，则会使用该数据类型的默认值。

例如：

```sql
-- 插入初始行（nickname 将被忽略）
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- 添加列
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 插入新行（相同数据，不同 id）
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- 查询 2 行
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```


## 处理半结构化/动态结构

如果 JSON 数据是半结构化的，其中键可以动态添加和/或具有多种类型，推荐使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说，在以下情况下应使用 JSON 类型：

* 存在**不可预测的键**，并且这些键会随时间变化。
* 包含**类型各异的值**（例如，同一路径有时是字符串，有时是数字）。
* 需要较高的模式灵活性，无法采用严格类型约束。
* 你有**成百上千甚至上千**个路径，这些路径本身是静态的，但现实中不可能全部显式声明。这种情况通常比较少见。

回顾我们[前面的人物 JSON 示例](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被判定为动态。

假设 `company.labels` 包含任意键。此外，此结构中任意键的类型在不同行之间可能并不一致。例如：

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "实时分析数据仓库",
    "labels": {
      "type": "数据库系统",
      "founded": "2021",
      "employees": 250
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "数据库",
    "holidays": [
      {
        "year": 2024,
        "location": "葡萄牙亚速尔群岛"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

```json
{
  "id": 2,
  "name": "Analytica Rowe",
  "username": "Analytica",
  "address": [
    {
      "street": "枫树大道",
      "suite": "402室",
      "city": "Dataford",
      "zipcode": "11223-4567",
      "geo": {
        "lat": 40.7128,
        "lng": -74.006
      }
    }
  ],
  "phone_numbers": [
    "123-456-7890",
    "555-867-5309"
  ],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "规模化精简分析",
    "labels": {
      "type": [
        "实时处理"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "运行仿真模拟",
    "holidays": [
      {
        "year": 2023,
        "location": "日本京都",
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

鉴于 `company.labels` 列在不同对象之间的键和类型具有动态特性，我们有多种方式来对这些数据建模：

* **单一 JSON 列** - 使用一个 `JSON` 列来表示整个 schema，使其下所有结构都可以是动态的。
* **定向 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型，其余所有列保持上文所用的结构化 schema。

尽管第一种方法[与之前的方法论不一致](#static-vs-dynamic-json)，但单一 JSON 列的方法在原型设计和数据工程任务中非常有用。

在大规模生产环境中部署 ClickHouse 时，我们建议尽可能明确结构，并仅在需要时对特定的动态子结构使用 JSON 类型。

严格的 schema 具有多方面的优势：


* **数据校验** – 强制使用严格的 schema 可以避免在特定结构之外出现列爆炸的风险。
* **避免列爆炸风险** - 虽然 JSON 类型可以扩展到潜在的数千列（其中子列作为独立列存储），但这可能导致列文件爆炸，即创建过多的列文件，从而影响性能。为缓解这一问题，JSON 使用的底层 [Dynamic 类型](/sql-reference/data-types/dynamic) 提供了一个 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制以独立列文件形式存储的唯一路径数量。一旦达到阈值，其余路径将存储在一个共享列文件中，并使用紧凑的编码格式，在支持灵活数据摄取的同时保持性能和存储效率。不过，访问这个共享列文件的性能不如访问独立列。另请注意，JSON 列可以结合 [type hints](#using-type-hints-and-skipping-paths) 使用。带有 “hint” 的列将提供与独立列相同的性能。
* **更简单的路径和类型自省** - 尽管 JSON 类型支持 [自省函数](/sql-reference/data-types/newjson#introspection-functions) 来确定推断出的类型和路径，但使用静态结构在探索时会更简单，例如通过 `DESCRIBE`。

### 单个 JSON 列

这种方式适合用于原型设计和数据工程任务。在生产环境中，请尽量仅在必要时将 `JSON` 用于动态子结构。

:::note 性能注意事项
可以通过跳过（不存储）不需要的 JSON 路径，以及使用 [type hints](#using-type-hints-and-skipping-paths)，来优化单个 JSON 列。Type hints 允许用户为子列显式定义类型，从而在查询时跳过类型推断和间接访问处理，从而实现与使用显式 schema 相同的性能。有关更多详情，请参阅 “[Using type hints and skipping paths](#using-type-hints-and-skipping-paths)”。
:::

此处单个 JSON 列的 schema 非常简单：

```sql
SET enable_json_type = 1;

CREATE TABLE people
(
    `json` JSON(username String)
)
ENGINE = MergeTree
ORDER BY json.username;
```

:::note
我们在 JSON 定义中为 `username` 列提供了一个[类型提示](#using-type-hints-and-skipping-paths)，因为我们会在排序/主键中使用这列。这样可以帮助 ClickHouse 确认该列不会为 NULL，并确保它知道应使用哪个 `username` 子列（对于每种类型可能存在多个子列，否则会产生歧义）。
:::

可以使用 `JSONAsObject` 格式向上述表中插入行：

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

已插入 1 行。用时:0.028 秒。

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

已插入 1 行。用时:0.004 秒。
```

```sql
SELECT *
FROM people
FORMAT Vertical
```


Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

返回 2 行。用时:0.005 秒。

````

可以使用[内省函数](/sql-reference/data-types/newjson#introspection-functions)确定推断的子列及其类型。例如:

```sql
SELECT JSONDynamicPathsWithTypes(json) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.employees": "Int64",
        "company.labels.founded": "String",
        "company.labels.type": "String",
        "company.name": "String",
        "dob": "Date",
        "email": "String",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}
{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.dissolved": "Int64",
        "company.labels.employees": "Int64",
        "company.labels.founded": "Int64",
        "company.labels.type": "Array(Nullable(String))",
        "company.name": "String",
        "dob": "Date",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}

返回 2 行。用时:0.009 秒。
````

有关内省函数的完整列表,请参阅["内省函数"](/sql-reference/data-types/newjson#introspection-functions)。

可以使用 `.` 符号[访问子路径](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns),例如:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

返回 2 行。用时:0.006 秒。
```

注意,行中缺失的列会返回为 `NULL`。


此外，对于具有相同路径但类型不同的列，会分别创建单独的子列。例如，`company.labels.type` 会各自对应类型为 `String` 和 `Array(Nullable(String))` 的子列。在可能的情况下会同时返回这两者，但我们可以使用 `.:` 语法来精确指定要访问的子列：

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ 数据库系统               │
│ ['实时处理']             │
└──────────────────────────┘

2 rows in set. Elapsed: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ 数据库系统               │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

为了返回嵌套的子对象，需要使用 `^`。这是一个刻意的设计选择，用于避免在未显式请求时读取大量列。未使用 `^` 访问的对象将返回 `NULL`，如下所示：

```sql
-- 默认不返回子对象
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

返回 2 行。用时:0.002 秒。

-- 使用 ^ 符号返回子对象
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

返回 2 行。用时:0.004 秒。
```

### 针对性的 JSON 列

虽然这在原型设计和数据工程场景中很有用，但我们建议在生产环境中尽可能使用显式 schema。

我们之前的示例可以建模为单个 `JSON` 列，即 `company.labels` 列。

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels JSON),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

可以使用 `JSONEachRow` 格式向该表插入数据：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

已插入 1 行。用时：0.450 秒。

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}
```


1 行记录。耗时：0.440 秒。

````

```sql
SELECT *
FROM people
FORMAT Vertical

第 1 行:
──────
id:            2
name:          Analytica Rowe
username:      Analytica
email:
address:       [('Dataford',(40.7128,-74.006),'Maple Avenue','Apt. 402','11223-4567')]
phone_numbers: ['123-456-7890','555-867-5309']
website:       fastdata.io
company:       ('Streamlined analytics at scale','FastData Inc.','{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]}')
dob:           1992-07-15
tags:          {"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}

第 2 行:
──────
id:            1
name:          Clicky McCliickHouse
username:      Clicky
email:         clicky@clickhouse.com
address:       [('Wisokyburgh',(-43.9509,-34.4618),'Victor Plains','Suite 879','90566-7771')]
phone_numbers: ['010-692-6593','020-192-3333']
website:       clickhouse.com
company:       ('The real-time data warehouse for analytics','ClickHouse','{"employees":"250","founded":"2021","type":"database systems"}')
dob:           2007-03-31
tags:          {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}

返回 2 行。用时:0.005 秒。
````

可以使用 [内省函数](/sql-reference/data-types/newjson#introspection-functions) 来确定 `company.labels` 列推断出的路径和类型。

```sql
SELECT JSONDynamicPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "Int64",
        "employees": "Int64",
        "founded": "Int64",
        "type": "Array(Nullable(String))"
 }
}
{
    "paths": {
        "employees": "Int64",
        "founded": "String",
        "type": "String"
 }
}

结果集包含 2 行。用时:0.003 秒。
```

### 使用类型提示并跳过路径

类型提示允许我们为某个路径及其子列显式指定类型，从而避免不必要的类型推断。请看下面这个示例，我们为 JSON 列 `company.labels` 中的 JSON 键 `dissolved`、`employees` 和 `founded` 指定了类型。

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(
        city String,
        geo Tuple(
            lat Float32,
            lng Float32),
        street String,
        suite String,
        zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(
        catchPhrase String,
        name String,
        labels JSON(dissolved UInt16, employees UInt16, founded UInt16)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

返回 1 行。耗时：0.450 秒。
```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.

````

注意这些列现在具有我们显式定义的类型:

```sql
SELECT JSONAllPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "String"
 }
}
{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "Array(Nullable(String))"
 }
}

2 rows in set. Elapsed: 0.003 sec.
````

此外,我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过 JSON 中不需要存储的路径,以减少存储空间并避免对不必要的路径进行类型推断。例如,假设我们对上述数据使用单个 JSON 列,可以跳过 `address` 和 `company` 路径:

```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

注意这些列已从数据中排除:

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

```


{
"json": {
"dob" : "1992-07-15",
"id" : "2",
"name" : "Analytica Rowe",
"phone_numbers" : [
"123-456-7890",
"555-867-5309"
],
"tags" : {
"car" : {
"model" : "Audi e-tron",
"year" : "2022"
},
"hobby" : "Running simulations",
"holidays" : [
{
"location" : "Kyoto, Japan",
"year" : "2023"
}
]
},
"username" : "Analytica",
"website" : "fastdata.io"
}
}
{
"json": {
"dob" : "2007-03-31",
"email" : "clicky@clickhouse.com",
"id" : "1",
"name" : "Clicky McCliickHouse",
"phone_numbers" : [
"010-692-6593",
"020-192-3333"
],
"tags" : {
"car" : {
"model" : "Tesla",
"year" : "2023"
},
"hobby" : "Databases",
"holidays" : [
{
"location" : "Azores, Portugal",
"year" : "2024"
}
]
},
"username" : "Clicky",
"website" : "clickhouse.com"
}
}

返回 2 行。耗时:0.004 秒。

```

#### 使用类型提示优化性能 {#optimizing-performance-with-type-hints}

类型提示不仅能够避免不必要的类型推断,还能完全消除存储和处理的间接层,同时允许指定[最优基本类型](/data-modeling/schema-design#optimizing-types)。带有类型提示的 JSON 路径始终像传统列一样存储,无需使用[**判别列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或在查询时进行动态解析。

这意味着通过明确定义的类型提示,嵌套的 JSON 键可以达到与从一开始就建模为顶级列相同的性能和效率。

因此,对于大部分结构一致但仍需要 JSON 灵活性的数据集,类型提示提供了一种便捷的方式来保持性能,而无需重构模式或摄取管道。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径作为子列以真正的列式布局存储,实现与传统列相同的性能优势——如压缩、SIMD 加速处理和最小化磁盘 I/O。JSON 数据中的每个唯一路径和类型组合都可以成为磁盘上独立的列文件。

<Image img={json_column_per_type} size="md" alt="每个 JSON 路径对应一列" />

例如,当插入两个具有不同类型的 JSON 路径时,ClickHouse 将每个[具体类型的值存储在不同的子列中](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以独立访问,最大限度地减少不必要的 I/O。请注意,查询具有多种类型的列时,其值仍作为单个列式响应返回。

此外,通过利用偏移量,ClickHouse 确保这些子列保持密集,不会为缺失的 JSON 路径存储默认值。这种方法最大化了压缩效果并进一步减少了 I/O。

<Image img={json_offsets} size="md" alt="JSON 偏移量" />

然而,在具有高基数或高度可变 JSON 结构的场景中——例如遥测管道、日志或机器学习特征存储——这种行为可能导致列文件数量激增。每个新的唯一 JSON 路径都会产生一个新的列文件,该路径下的每个类型变体都会产生一个额外的列文件。虽然这对读取性能是最优的,但会带来运维挑战:文件描述符耗尽、内存使用增加,以及由于大量小文件导致的合并速度变慢。

为了缓解这一问题,ClickHouse 引入了溢出子列的概念:一旦不同 JSON 路径的数量超过阈值,额外的路径将使用紧凑编码格式存储在单个共享文件中。该文件仍然可查询,但不具备专用子列的相同性能特性。

<Image img={shared_json_column} size="md" alt="共享 JSON 列" />

此阈值由 JSON 类型声明中的 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 参数控制。

```


```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**避免将此参数设置得过高**——较大的取值会增加资源消耗并降低效率。一般经验法则是将其控制在 10,000 以下。对于结构高度动态的工作负载，请使用类型提示和 `SKIP` 参数来限制存储的内容。

对于对这种新列类型实现方式感兴趣的用户，我们建议阅读我们的详细博客文章 [《A New Powerful JSON Data Type for ClickHouse》](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
