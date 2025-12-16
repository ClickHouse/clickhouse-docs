---
title: '设计 JSON Schema'
slug: /integrations/data-formats/json/schema
description: '如何高效设计 JSON Schema'
keywords: ['json', 'clickhouse', '插入', '加载', '格式', '模式', '结构化', '半结构化']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# 设计你的 Schema {#designing-your-schema}

虽然可以使用[模式推断](/integrations/data-formats/json/inference)为 JSON 数据建立初始 schema，并对 JSON 数据文件进行就地查询（例如存放在 S3 中的数据），但你应当为数据建立一个经过优化的版本化 schema。下面我们将讨论针对 JSON 结构建模的推荐方法。

## 静态 vs 动态 JSON {#static-vs-dynamic-json}

为 JSON 定义 schema 的核心任务，是为每个键的值确定合适的类型。我们建议用户在 JSON 层级结构中的每个键上递归地应用以下规则，以确定每个键的适当类型。

1. **原始类型（Primitive types）** - 如果键的值是原始类型（primitive type），无论它是在子对象中还是在根对象上，都要根据通用 schema [设计最佳实践](/data-modeling/schema-design)和[类型优化规则](/data-modeling/schema-design#optimizing-types)来选择其类型。原始类型数组，例如下面的 `phone_numbers`，可以建模为 `Array(<type>)`，例如 `Array(String)`。
2. **静态 vs 动态** - 如果键的值是复杂对象，即对象或对象数组，需要先判断它是否会发生变化。对于几乎不会新增新键的对象，如果可以预见新键的增加，并能通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 的 schema 变更来处理，则可以视为**静态**。这也包括某些 JSON 文档中只提供部分键的对象。对于经常新增键和/或新增键不可预测的对象，应视为**动态**。**此处的例外是包含数百或数千个子键的结构，为方便起见，可以直接视为动态。**

要判断某个值是**静态**还是**动态**，请参阅下文相关部分：[**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures)和[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p />

**重要提示：**上述规则应递归应用。如果某个键的值被判断为动态，则不再需要进一步评估，可以直接遵循[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)中的指南。如果对象是静态的，则继续评估其子键，直到键值为原始类型或遇到动态键为止。

为了说明这些规则，我们使用以下表示某个人的 JSON 示例：

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

* 根键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是一个 Array 原始列，类型为 `Array(String)`，`dob` 和 `id` 的类型分别为 `Date` 和 `UInt32`。
* 不会向 `address` 对象中添加新的键（只会新增 `address` 对象），因此它可以被视为**静态**。如果向下递归展开，除 `geo` 之外的所有子列都可以视为原始列（且类型为 `String`）。`geo` 也是一个静态结构，包含两个 `Float32` 类型的列：`lat` 和 `lon`。
* `tags` 列是**动态**的。我们假设可以向该对象中添加任意类型和结构的新标签。
* `company` 对象是**静态**的，并且始终最多只包含指定的 3 个键。子键 `name` 和 `catchPhrase` 的类型为 `String`。键 `labels` 是**动态**的。我们假设可以向该对象中添加任意标签，其值始终是字符串类型的键值对。


:::note
具有数百或数千个静态键的结构也可以视为动态结构，因为在实践中很难为这些键静态声明列。不过，在可能的情况下，请[跳过不需要的路径](#using-type-hints-and-skipping-paths)，以同时节省存储和推断开销。
:::

## 处理静态结构 {#handling-static-structures}

我们建议使用具名元组（即 `Tuple`）来处理静态结构。对象数组可以使用元组数组来表示，即 `Array(Tuple)`。在元组内部，列及其对应的类型应按照相同的规则进行定义。这样可以得到嵌套的 Tuple，用于表示嵌套对象，如下所示。

为说明这一点，我们继续使用前面的 JSON person 示例，但省略其中的动态对象：

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

该表的 schema 定义如下：

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

请注意，`company` 列被定义为 `Tuple(catchPhrase String, name String)` 类型。`address` 键使用 `Array(Tuple)`，并通过嵌套的 `Tuple` 来表示 `geo` 列。

JSON 可以以当前结构插入到该表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在上面的示例中，我们的数据量很少，但如下所示，可以通过它们以句点分隔的名称来查询 tuple 列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

请注意，`address.street` 列是以 `Array` 类型返回的。要按位置查询数组中的特定对象，需要在列名后指定数组偏移量。例如，要访问第一个地址中的街道名称：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

从 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 版本开始，子列也可以用于排序键：

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

即使 JSON 对象结构良好，它们通常也是稀疏的，只提供已知键中的一部分。幸运的是，`Tuple` 类型并不要求 JSON 载荷中必须包含所有列。如果未提供，将会使用默认值。

回顾我们之前的 `people` 表，以及下面这个稀疏的 JSON，它缺少 `suite`、`geo`、`phone_numbers` 和 `catchPhrase` 这几个键。

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

在查询这一行时，可以看到，所有被省略的列（包括子对象）都使用了默认值：

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

:::note 区分空值与 null
如果需要区分“值为空”和“值未提供”，可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。除非绝对必要，[应避免使用](/best-practices/select-data-types#avoid-nullable-columns)该类型，因为它会对这些列的存储和查询性能产生负面影响。
:::


### 处理新列 {#handling-new-columns}

虽然当 JSON 键是静态时，采用结构化方案是最简单的，但只要能够预先规划 schema 的变更（即事先知道会新增哪些键，并且可以相应修改 schema），仍然可以使用这种方案。

请注意，ClickHouse 默认会忽略在负载中提供但在 schema 中不存在的 JSON 键。请看下面修改后的 JSON 负载，其中新增了一个 `nickname` 键：

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

该 JSON 数据可以成功插入，其中会忽略 `nickname` 键：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向表结构中添加列。可以通过 `DEFAULT` 子句指定一个默认值，在后续插入时如果未显式指定该列的值，将使用此默认值。对于在该列创建之前插入、因而不包含该值的行，也会返回此默认值。如果未指定 `DEFAULT` 值，则会使用该数据类型的默认值。

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


## 处理半结构化 / 动态结构 {#handling-semi-structured-dynamic-structures}

如果 JSON 数据是半结构化的，键可以被动态添加和/或具有多种类型，推荐使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说，当你的数据满足以下情况时，使用 JSON 类型：

* 具有**不可预测的键**，并且这些键会随着时间变化。
* 包含**类型各异的值**（例如，同一路径有时是字符串，有时是数字）。
* 需要在 schema 上具备灵活性，无法采用严格类型。
* 你有**数百甚至上千**个路径，这些路径本身是静态的，但数量太多，以至于逐一显式声明并不现实。这类情况通常比较少见。

回顾我们[前面示例中的 person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中的 `company.labels` 对象被确定为动态的。

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

考虑到不同对象之间 `company.labels` 列在键和对应值类型上的动态特性，我们有多种方式来对这类数据建模：

* **单个 JSON 列** - 将整个 schema 建模为一个 `JSON` 列，允许其下的所有结构都是动态的。
* **针对性 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型，其他所有列则保留上文使用的结构化 schema。

尽管第一种方法[与之前的方法论不一致](#static-vs-dynamic-json)，单个 JSON 列的方法在原型设计和数据工程任务中仍然非常有用。

对于大规模生产环境中的 ClickHouse 部署，我们建议尽可能显式地定义结构，并在可行的情况下，仅对有针对性的动态子结构使用 JSON 类型。

严格的 schema 具有多项优势：


- **数据验证** – 强制使用严格的 schema 可以在特定结构之外避免出现列爆炸的风险。 
- **避免列爆炸风险** - 尽管 JSON 类型可以扩展到潜在的数千个列，其中子列作为独立列存储，但这可能导致列文件爆炸，即创建过多列文件，从而影响性能。为缓解这一问题，JSON 底层使用的 [Dynamic type](/sql-reference/data-types/dynamic) 提供了 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制以独立列文件形式存储的唯一路径数量。一旦达到阈值，后续路径将被存储在一个共享列文件中，并使用紧凑的编码格式，从而在支持灵活数据摄取的同时保持性能和存储效率。不过，访问这个共享列文件的性能会略逊一筹。还需要注意的是，JSON 列可以结合 [type hints](#using-type-hints-and-skipping-paths) 使用，被“提示”的列将提供与独立列相同的性能。
- **更简单地查看路径和类型** - 尽管 JSON 类型支持 [introspection functions](/sql-reference/data-types/newjson#introspection-functions) 来确定已推断出的类型和路径，但静态结构在探索时可能更简单，例如使用 `DESCRIBE`。

### 单个 JSON 列 {#single-json-column}

这种方法对原型设计和数据工程任务很有用。对于生产环境，尽量仅在必要时将 `JSON` 用于动态子结构。

:::note 性能注意事项
可以通过跳过（不存储）不需要的 JSON 路径以及使用 [type hints](#using-type-hints-and-skipping-paths) 来优化单个 JSON 列。Type hints 允许用户为子列显式定义类型，从而在查询时跳过类型推断和间接处理。这样可以在性能上达到与使用显式 schema 相同的效果。有关更多详细信息，请参阅 [“Using type hints and skipping paths”](#using-type-hints-and-skipping-paths)。
:::

这里单个 JSON 列的 schema 很简单：

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
我们在 JSON 定义中为 `username` 列提供了一个[类型提示](#using-type-hints-and-skipping-paths)，因为我们在排序/主键中会用到它。这样可以帮助 ClickHouse 判断该列不会为 null，并确保它明确应使用哪个 `username` 子列（对于每种类型可能存在多个子列，否则会产生歧义）。
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

有关自省函数的完整列表，请参阅[“Introspection functions”](/sql-reference/data-types/newjson#introspection-functions)。

[子路径可以访问](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)，使用 `.` 语法，例如：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

请注意，某些行中缺失的列会返回为 `NULL`。


此外，对于具有相同类型的路径，会创建单独的子列。例如，`company.labels.type` 会分别为 `String` 和 `Array(Nullable(String))` 创建一个子列。查询时会在可能的情况下返回这两个子列，但我们也可以使用 `.:` 语法来仅针对某个特定子列：

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

要返回嵌套的子对象，必须使用 `^`。这是出于设计上的考量，用于避免在未显式请求时读取大量列。未使用 `^` 访问的对象将返回 `NULL`，如下所示：

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


### 有针对性的 JSON 列 {#targeted-json-column}

虽然在原型设计和数据工程场景下很有用，但在生产环境中我们建议尽可能使用显式 schema。

我们之前的示例可以通过一个 `JSON` 类型的 `company.labels` 列来建模。

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

我们可以使用 `JSONEachRow` 格式向该表插入数据：

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

[自省函数](/sql-reference/data-types/newjson#introspection-functions) 可用于确定 `company.labels` 列推断出的路径和类型。


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

类型提示允许我们为某个路径及其子列显式指定类型，从而避免不必要的类型推断。请看下面的示例，我们为 JSON 列 `company.labels` 中的 JSON 键 `dissolved`、`employees` 和 `founded` 显式指定了类型。

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

请注意，这些列现在已经具有我们显式指定的类型：

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

此外，我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过 JSON 中不想存储的路径，从而最小化存储占用，并避免对不需要的路径进行不必要的模式推断。比如，假设我们为上述数据使用单个 JSON 列，我们可以跳过 `address` 和 `company` 路径：


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

请注意，这些列已经从结果数据中被排除：

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

类型提示不仅仅是避免不必要类型推断的一种方式——它们可以完全消除存储和处理过程中的间接访问，同时还允许指定[最优基础类型](/data-modeling/schema-design#optimizing-types)。带有类型提示的 JSON 路径始终像传统列一样存储，从而无需使用[**discriminator columns**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)，也不需要在查询时进行动态解析。 

这意味着，在类型提示定义良好的情况下，嵌套 JSON 键可以获得与从一开始就建模为顶层列相同的性能和效率。 

因此，对于大部分结构一致、但仍希望保留 JSON 灵活性的数据集，类型提示提供了一种便捷方式，在无需重构模式或摄取管道的前提下保持性能。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径作为子列存储在真正的列式存储布局中，从而能够享受与传统列相同的性能优势——例如压缩、SIMD 加速处理和最小化磁盘 I/O。JSON 数据中每个唯一的路径与类型组合都可以在磁盘上对应一个独立的列文件。

<Image img={json_column_per_type} size="md" alt="每个 JSON 路径对应一列" />

例如，当插入的两个 JSON 路径具有不同类型时，ClickHouse 会将每种[具体类型的值存储在不同的子列中](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以被独立访问，从而最小化不必要的 I/O。请注意，当查询一个同时包含多种类型的列时，其值仍然会作为单个列式结果返回。

此外，通过利用偏移量，ClickHouse 确保这些子列保持稠密，对于缺失的 JSON 路径不会存储默认值。这种方式可以最大化压缩效果并进一步减少 I/O。

<Image img={json_offsets} size="md" alt="JSON 偏移量" />

然而，在高基数或高度可变的 JSON 结构场景中——例如遥测管道、日志或机器学习特征存储——这种行为可能导致列文件数量爆炸。每个新的唯一 JSON 路径都会产生一个新的列文件，而该路径下的每一种类型变体都会再产生一个额外的列文件。尽管这对读取性能是最优的，但也会带来运维上的挑战：文件描述符耗尽、内存使用增加，以及由于大量小文件导致的合并变慢。

为缓解这一问题，ClickHouse 引入了溢出子列的概念：一旦不同 JSON 路径的数量超过阈值，额外的路径就会使用紧凑的编码格式存储在单个共享文件中。该文件仍然可以被查询，但无法获得与专用子列相同的性能特征。

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

**避免将此参数设置得过高** —— 过大的数值会增加资源消耗并降低效率。经验法则是将其保持在 10,000 以下。对于结构高度动态的工作负载，使用类型提示和 `SKIP` 参数来限制存储的内容。

对于对这种新列类型实现细节感兴趣的用户，我们推荐阅读我们的详细博客文章：[“A New Powerful JSON Data Type for ClickHouse”](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
