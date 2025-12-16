---
title: '设计 JSON 架构'
slug: /integrations/data-formats/json/schema
description: '如何优化 JSON 架构设计'
keywords: ['json', 'clickhouse', '插入', '加载', '格式', '架构', '结构化', '半结构化']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';

# 设计你的 schema {#designing-your-schema}

虽然可以使用 [schema 推断](/integrations/data-formats/json/inference) 为 JSON 数据建立初始 schema，并直接查询存储在 S3 等位置的 JSON 数据文件，但用户仍应以为其数据建立经过优化的版本化 schema 为目标。下面我们将讨论对 JSON 结构建模的推荐方法。

## 静态 JSON 与动态 JSON {#static-vs-dynamic-json}

为 JSON 定义模式的首要任务是确定每个键的合适值类型。我们建议用户在 JSON 层级结构中的每一个键上递归应用以下规则，以确定每个键的合适类型。

1. **原始类型（Primitive types）** - 如果键的值是原始类型（primitive type），无论它位于子对象中还是根对象中，都应确保根据通用模式[设计最佳实践](/data-modeling/schema-design)和[类型优化规则](/data-modeling/schema-design#optimizing-types)选择其类型。原始类型数组，例如下面的 `phone_numbers`，可以建模为 `Array(<type>)`，例如 `Array(String)`。
2. **静态 vs 动态** - 如果键的值是复杂对象，即对象或对象数组，需要判断其是否会发生变化。那些很少新增键，并且新增键可以被预测并通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 进行模式变更来处理的对象，可视为**静态**。这也包括某些 JSON 文档中只会提供部分键子集的对象。而那些经常新增新键且/或新增键不可预测的对象，则应被视为**动态**。**这里唯一的例外是拥有数百或数千个子键的结构，为了方便起见可以视为动态结构。**

要判断一个值是**静态**还是**动态**，请参阅下文相应章节：[**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures)和[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p />

**重要说明：** 上述规则应递归应用。如果某个键的值被确定为动态，则无需进一步评估，可直接遵循[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)中的指导原则。如果对象是静态的，则继续评估其子键，直到键值为原始类型或遇到动态键为止。

为说明这些规则，我们使用以下表示某个人的 JSON 示例：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
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
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

根据这些规则：

* 根级键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是基础数组类型 `Array(String)`，`dob` 和 `id` 的类型分别是 `Date` 和 `UInt32`。
* 不会向 `address` 对象中添加新的键（只会添加新的 `address` 对象），因此它可以视为**静态**结构。递归下钻时，除 `geo` 之外，所有子列都可以视为基础类型（且使用 `String` 类型）。`geo` 同样是一个静态结构，包含两个 `Float32` 列：`lat` 和 `lon`。
* 列 `tags` 是**动态**的。我们假设可以向该对象中添加任意类型和结构的新标签。
* 对象 `company` 是**静态**的，且始终至多只包含所列出的 3 个键。子键 `name` 和 `catchPhrase` 的类型为 `String`。键 `labels` 是**动态**的。我们假设可以向该对象中添加任意的新标签，其值始终是字符串类型的键值对。

:::note
包含数百或数千个静态键的结构也可以视为动态结构，因为在实际场景中很少会为这些键静态声明所有列。不过，在可能的情况下，应[跳过不需要的路径](#using-type-hints-and-skipping-paths)，以同时节省存储和推断开销。
:::

## 处理静态结构 {#handling-static-structures}

我们建议使用具名元组（即 `Tuple`）来处理静态结构。对象数组可以使用元组数组（即 `Array(Tuple)`）来存储。在元组内部，列及其对应的类型也应按照相同的规则进行定义。这样就可以通过嵌套的 Tuple 来表示嵌套对象，如下所示。

为便于说明，我们使用前面的 JSON 中 person 的示例，并省略其中的动态对象：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
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
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

此表的表结构如下所示：

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

可以按其当前结构将 JSON 插入到此表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在上面的示例中，虽然数据量很少，但如下所示，我们可以通过其以句点分隔的名称来查询这些 tuple 列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

请注意，`address.street` 列是以 `Array` 类型返回的。要按位置查询数组中的特定元素，需要在列名后面指定数组偏移量。例如，要访问第一个地址中的街道字段：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

从 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 版本开始，子列也可以用于定义排序键：

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

### 处理默认值 {#handling-default-values}

即使 JSON 对象是结构化的，它们通常也比较稀疏，只提供部分已知键。好在，`Tuple` 类型并不要求 JSON 载荷中必须包含所有列；如果某些列未提供，将使用默认值。

回顾我们之前的 `people` 表和下面这个稀疏的 JSON，其中缺少键 `suite`、`geo`、`phone_numbers` 和 `catchPhrase`。

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

可以看到下方这一行已成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询这一行记录时，我们可以看到，省略的列（包括子对象）都使用了默认值：

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

1 row in set. Elapsed: 0.001 sec.
```

:::note 区分空与 NULL
如果需要区分“值为空”和“未提供”，可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。但除非绝对必要，[应尽量避免使用](/best-practices/select-data-types#avoid-nullable-columns) Nullable，因为这会对这些列的存储和查询性能产生负面影响。
:::

### 处理新列 {#handling-new-columns}

当 JSON 键是固定的时，使用结构化方法是最简单的。但即使可以事先规划模式变更（即预先知道会新增哪些键，并且可以相应修改模式），这种方法仍然适用。

请注意，ClickHouse 默认会忽略负载中出现但在模式中不存在的 JSON 键。请看下面这个修改后的 JSON 负载，它新增了一个 `nickname` 键：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
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
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

在忽略 `nickname` 键的情况下，该 JSON 依然可以成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向表的模式中添加列。可以通过 `DEFAULT` 子句指定默认值，当后续插入时未显式指定该列时将使用该默认值。对于在该列创建之前插入的行（因此缺少该列的值），查询时也会返回该默认值。如果未指定 `DEFAULT` 值，则会使用该数据类型的默认值。

例如：

```sql
-- insert initial row (nickname will be ignored)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- add column
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- insert new row (same data different id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- select 2 rows
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

## 处理半结构化/动态结构 {#handling-semi-structured-dynamic-structures}

如果 JSON 数据是半结构化的，其中的键可以动态增加和/或具有多种类型，则推荐使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说，在以下情况下应使用 JSON 类型：

* 具有**不可预测的键**，并且这些键会随时间变化。
* 包含**类型各异的值**（例如，同一路径有时是字符串，有时是数字）。
* 需要灵活的 schema，而无法采用严格的类型约束。
* 存在**数百甚至数千条**路径，这些路径本身是静态的，但在实践中几乎不可能全部显式声明。这种情况往往比较少见。

回顾我们之前的[人员 JSON 示例](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被认定为是动态的。

假设 `company.labels` 包含任意键。此外，该结构中任意键的类型在不同行之间可能并不一致。例如：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
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
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021",
      "employees": 250
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
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
      "street": "Maple Avenue",
      "suite": "Apt. 402",
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
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": [
        "real-time processing"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "Running simulations",
    "holidays": [
      {
        "year": 2023,
        "location": "Kyoto, Japan"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

鉴于 `company.labels` 列在不同对象之间的键和类型都具有动态特性，我们有多种方式来建模这类数据：

* **单一 JSON 列** - 使用单个 `JSON` 列来表示整个模式，允许其下所有结构保持动态。
* **针对性 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型，其余列继续使用上文所示的结构化模式。

虽然第一种方法[与前文的方法论不一致](#static-vs-dynamic-json)，但在原型设计和数据工程任务中，使用单一 JSON 列的方法仍然非常有用。

对于在生产环境中大规模部署 ClickHouse，我们建议尽可能明确定义结构，并在可行情形下仅对特定的动态子结构使用 JSON 类型。

严格的模式具有一系列优势：

- **数据验证** – 强制使用严格的 schema，可以在特定结构之外避免列数量爆炸的风险。 
- **避免列爆炸风险** - 尽管 JSON 类型可以扩展到潜在的数千个列（其中子列作为独立列存储），但这可能导致列文件数量爆炸，产生过多的列文件，从而影响性能。为缓解这一问题，JSON 所使用的底层 [Dynamic type](/sql-reference/data-types/dynamic) 提供了 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制以独立列文件形式存储的唯一路径数量。一旦达到阈值，额外的路径将存储在一个共享的列文件中，并使用紧凑的编码格式，从而在支持灵活数据摄取的同时保持性能和存储效率。但需要注意的是，访问这个共享列文件的性能会略低一些。另请注意，JSON 列可以结合使用[类型提示](#using-type-hints-and-skipping-paths)。带有“提示”的列在性能上将与独立列相当。
- **更简单的路径和类型自省** - 虽然 JSON 类型支持用于确定已推断类型和路径的[自省函数](/sql-reference/data-types/newjson#introspection-functions)，但静态结构在探索时（例如使用 `DESCRIBE`）可能更为简单。

### 单一 JSON 列 {#single-json-column}

此方法适用于原型开发和数据工程任务。对于生产环境，建议仅在确有需要的动态子结构中使用 `JSON`。

:::note 性能注意事项
可以通过跳过（不存储）不需要的 JSON 路径，并使用 [类型提示](#using-type-hints-and-skipping-paths) 来优化单一 JSON 列。类型提示允许用户为子列显式定义类型，从而在查询时跳过类型推断和间接处理。这样可以获得与使用显式模式时相当的性能。更多详情请参见[「使用类型提示与跳过路径」](#using-type-hints-and-skipping-paths)。
:::

这里单一 JSON 列的模式很简单：

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
我们在 JSON 定义中为 `username` 列提供了一个[类型提示](#using-type-hints-and-skipping-paths)，因为在排序键/主键中会用到它。这样可以帮助 ClickHouse 确定该列不会为 NULL，并确保它知道要使用哪个 `username` 子列（每种类型可能存在多个子列，否则就会产生歧义）。
:::

可以使用 `JSONAsObject` 格式向上述表中插入行：

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.004 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.
```

我们可以使用[自省函数](/sql-reference/data-types/newjson#introspection-functions)来确定推断出的子列及其数据类型。例如：

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

2 rows in set. Elapsed: 0.009 sec.
```

如需查看完整的内省函数列表，请参阅 [&quot;Introspection functions&quot;](/sql-reference/data-types/newjson#introspection-functions)

[可以访问子路径](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)，可使用 `.` 符号表示法，例如：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

请注意，某些行中缺失的列会返回为 `NULL`。

此外，还会为具有相同类型的路径创建单独的子列。比如，`company.labels.type` 会分别存在类型为 `String` 和 `Array(Nullable(String))` 的子列。在可能的情况下会同时返回这两者，但我们也可以使用 `.:` 语法来仅针对特定的子列进行查询：

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

2 rows in set. Elapsed: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

为了返回嵌套的子对象，需要使用 `^`。这是为了在未显式请求的情况下避免读取大量列所做的设计选择。未使用 `^` 访问的对象将返回 `NULL`，如下所示：

```sql
-- sub objects will not be returned by default
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- return sub objects using ^ notation
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### 专用 JSON 列 {#targeted-json-column}

尽管在原型设计和数据工程场景中很有用，但在生产环境中我们建议在可能的情况下使用显式的 schema（模式）定义。

我们之前的示例也可以建模为：将 `company.labels` 实现为单个 `JSON` 类型的列。

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

我们可以使用 `JSONEachRow` 格式向该表中插入数据：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
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

Row 2:
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

2 rows in set. Elapsed: 0.005 sec.
```

[自省函数](/sql-reference/data-types/newjson#introspection-functions) 可用于确定为 `company.labels` 列推断出的路径和类型。

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

2 rows in set. Elapsed: 0.003 sec.
```

### 使用类型提示和跳过路径 {#using-type-hints-and-skipping-paths}

类型提示允许我们为某个路径及其子列显式指定类型，从而避免不必要的类型推断。来看下面这个示例，我们为 JSON 列 `company.labels` 中的 JSON 键 `dissolved`、`employees` 和 `founded` 指定了类型。

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

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

注意，这些列现在都具有我们显式声明的类型：

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
```

此外，我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过不希望存储的 JSON 路径，从而减少存储占用并避免对不需要的路径进行不必要的推断。比如，假设我们将上述数据存放在单个 JSON 列中，那么就可以跳过 `address` 和 `company` 路径：

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

请注意，这些列已经从数据中被排除：

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

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

2 rows in set. Elapsed: 0.004 sec.
```

#### 使用类型提示优化性能 {#optimizing-performance-with-type-hints}  

类型提示不仅仅是避免不必要类型推断的一种手段——它们还能完全消除存储和处理过程中的间接开销，并允许指定[最优基础类型](/data-modeling/schema-design#optimizing-types)。带有类型提示的 JSON 路径始终以与传统列相同的方式存储，从而无需使用[**判别器列（discriminator columns）**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或在查询时进行动态解析。 

这意味着，在类型提示定义良好的情况下，嵌套 JSON 键可以获得与从一开始就建模为顶层列时相同的性能和效率。 

因此，对于大体结构一致、但仍希望保留 JSON 灵活性的数据集，类型提示提供了一种便利方式，从而在无需重构 schema 或摄取流水线的前提下，保持良好的性能表现。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径作为一个子列存储在真正的列式存储布局中，从而能够享受到与传统列相同的性能优势——例如压缩、SIMD 加速处理以及最小化磁盘 I/O。JSON 数据中每个唯一的路径与类型组合都可以在磁盘上对应到自己的列文件。

<Image img={json_column_per_type} size="md" alt="每个 JSON 路径一个列" />

例如，当插入的两个 JSON 路径具有不同类型时，ClickHouse 会将每种[具体类型的值存储在不同的子列中](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以独立访问，从而最小化不必要的 I/O。需要注意的是，当查询一个包含多种类型的列时，其值仍然作为一个单一的列式结果返回。

此外，通过利用偏移量，ClickHouse 确保这些子列保持稠密，对于不存在的 JSON 路径不会存储默认值。这种方式最大化压缩率，并进一步减少 I/O。

<Image img={json_offsets} size="md" alt="JSON 偏移量" />

然而，在 JSON 结构具有高基数或高度可变的场景中——例如遥测流水线、日志或机器学习特征存储——这种行为可能导致列文件数量激增。每个新的唯一 JSON 路径都会产生一个新的列文件，而该路径下的每个类型变体又会额外产生一个列文件。虽然这对读取性能是最优的，但会引入运维挑战：文件描述符耗尽、内存使用增加，以及由于大量小文件导致的合并变慢。

为缓解这一问题，ClickHouse 引入了溢出子列（overflow subcolumn）的概念：一旦不同 JSON 路径的数量超过阈值，额外的路径就会使用紧凑的编码格式存储在一个共享文件中。该文件仍然可以被查询，但无法享受与专用子列相同的性能特性。

<Image img={shared_json_column} size="md" alt="共享 JSON 列" />

该阈值由 JSON 类型声明中的 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 参数控制。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**避免将该参数设置得过高** —— 数值过大会增加资源消耗并降低效率。经验法则是将其控制在 10,000 以下。对于结构高度动态的工作负载，请使用类型提示（type hints）和 `SKIP` 参数来限制存储的内容。

对于对这种新列类型实现细节感兴趣的用户，我们推荐阅读我们的详细博文《[A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)》。
