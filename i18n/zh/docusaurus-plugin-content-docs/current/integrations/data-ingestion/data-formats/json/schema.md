---
'title': '设计 JSON 模式'
'slug': '/integrations/data-formats/json/schema'
'description': '如何最佳地设计 JSON 模式'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'formats'
- 'schema'
- 'structured'
- 'semi-structured'
'score': 20
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# 设计您的模式

虽然 [模式推断](/integrations/data-formats/json/inference) 可用于为 JSON 数据建立初始模式并在指定位置查询 JSON 数据文件，例如在 S3 中，但用户应旨在为其数据建立一个优化的版本化模式。我们将在下面讨论建模 JSON 结构的推荐方法。

## 静态 vs 动态 JSON {#static-vs-dynamic-json}

定义 JSON 模式的主要任务是确定每个键值的适当类型。我们建议用户对 JSON 层次结构中的每个键递归应用以下规则，以确定每个键的适当类型。

1. **原始类型** - 如果键的值是原始类型，无论它是处于子对象中还是在根级别，都确保根据一般的模式 [设计最佳实践](/data-modeling/schema-design) 和 [类型优化规则](/data-modeling/schema-design#optimizing-types) 选择其类型。原始类型的数组，例如下面的 `phone_numbers`，可以建模为 `Array(<type>)`，例如 `Array(String)`。
2. **静态 vs 动态** - 如果键的值是复杂对象，即一个或多个对象的数组，确定它是否会发生变化。那些很少有新键的对象，添加新键可以预测并通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 进行模式更改的，可以视为 **静态**。这包括在某些 JSON 文档中可能仅提供键的子集的对象。添加新键的对象频繁且/或不可预测的，应视为 **动态**。**这里的例外是具有数百或数千个子键的结构，可以方便地视为动态。**

要确定值是 **静态** 还是 **动态**，请查看下面相关章节 [**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures) 和 [**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p></p>

**重要：** 上述规则应递归应用。如果键的值被确定为动态，则不需要进一步评估，可以遵循 [**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) 中的指南。如果对象是静态的，则继续评估子键，直到遇到原始键值或动态键为止。

为了说明这些规则，我们使用以下 JSON 示例表示一个人：

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

应用这些规则：

- 根键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是原始类型的数组，类型为 `Array(String)`，`dob` 和 `id` 的类型分别为 `Date` 和 `UInt32`。
- `address` 对象不会添加新键（仅新地址对象），因此可以视为 **静态**。如果我们递归，所有子列都可以视为原始类型（且类型为 `String`），除了 `geo`。这也是一个静态结构，包含两个 `Float32` 类型的列，即 `lat` 和 `lon`。
- `tags` 列是 **动态的**。我们假设可以向该对象添加任意类型和结构的新标签。
- `company` 对象是 **静态的**，并且始终最多包含指定的 3 个键。子键 `name` 和 `catchPhrase` 是 `String` 类型。键 `labels` 是 **动态的**。我们假设可以向该对象添加任意类型的标签。值始终是键值对，类型为字符串。

:::note
具有数百或数千个静态键的结构可以视为动态，因为在静态声明这些列的情况下很少是现实的。然而，在可能的情况下 [跳过路径](#using-type-hints-and-skipping-paths) ，以节省存储和推断开销。
:::

## 处理静态结构 {#handling-static-structures}

我们建议使用命名元组来处理静态结构，即 `Tuple`。对象数组可以使用元组数组来保存，即 `Array(Tuple)`。在元组内部，应使用相同的规则来定义列及其相应的类型。这可能会导致嵌套元组以表示嵌套对象，如下所示。

为了说明这一点，我们使用之前的 JSON 人示例，省略动态对象：

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

该表的模式如下所示：

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

请注意，`company` 列被定义为 `Tuple(catchPhrase String, name String)`。`address` 键使用 `Array(Tuple)`，并嵌套 `Tuple` 来表示 `geo` 列。

JSON 可以按其当前结构插入到此表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在我们之前的示例中，我们的数据很少，但如下面所示，我们可以按其点分隔的名称查询元组列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

请注意，`address.street` 列被返回为一个 `Array`。要按位置查询数组中的特定对象，数组偏移量应在列名称后指定。例如，要访问第一个地址中的街道：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

子列也可以用于来自 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 的排序键：

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

即使 JSON 对象是结构化的，它们通常也是稀疏的，仅提供已知键的子集。幸运的是，`Tuple` 类型不要求 JSON 有效负载中的所有列。如果未提供，将使用默认值。

考虑我们之前的 `people` 表以及以下稀疏 JSON，缺少键 `suite`、`geo`、`phone_numbers` 和 `catchPhrase`。

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

我们可以看到，下面这一行可以成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询这一行后，我们可以看到对于省略的列（包括子对象）使用了默认值：

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

:::note 区分空值和 null
如果用户需要区分一个值是空的还是未提供的，可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。除非绝对需要，否则 [应避免](/best-practices/select-data-types#avoid-nullable-columns) 使用，因为这会对这些列的存储和查询性能产生负面影响。
:::

### 处理新列 {#handling-new-columns}

虽然当 JSON 键静态时，结构化的方法是最简单的，但如果可以计划模式变化，即新键是提前已知的，仍然可以使用此方法并相应地修改模式。

请注意，ClickHouse 默认会忽略有效负载中提供的并且不在模式中的 JSON 键。考虑以下修改后的 JSON 有效负载，添加了 `nickname` 键：

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

此 JSON 可以成功插入，并忽略 `nickname` 键：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向模式添加列。可以通过 `DEFAULT` 子句指定默认值，如果在随后的插入中未指定，则会使用该默认值。对于未提供该值的行（因为它们在创建该值之前插入），也将返回此默认值。如果未指定 `DEFAULT` 值，则会使用该类型的默认值。

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

如果 JSON 数据是半结构化的，其中键可以动态添加和/或具有多个类型，建议使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说，当您的数据：

- 具有 **不可预测的键**，可能会随着时间推移而变化。
- 包含 **具有不同类型的值**（例如，一个路径有时可能包含字符串，有时可能包含数字）。
- 需要模式灵活性，其中严格类型化不可行。
- 你有 **数百或甚至千个** 路径，它们是静态的，但显然不现实地明确声明。这往往是罕见的。

考虑我们的 [早期人 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) 示例，其中 `company.labels` 对象被确定为动态。

假设 `company.labels` 包含任意键。此外，这个结构中任何键的类型可能在行之间不一致。例如：

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

鉴于 `company.labels` 列在对象之间的动态性质，包括键和值类型，我们有几种选项来建模此数据：

- **单一 JSON 列** - 将整个模式表示为一个单一的 `JSON` 列，允许在其下方的所有结构都是动态的。
- **有针对性的 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型，对所有其他列保留上面使用的结构化模式。

虽然第一种方法 [与之前的方法不符](#static-vs-dynamic-json)，但单一 JSON 列的方法对原型设计和数据工程任务是有用的。

对于大规模生产部署的 ClickHouse，我们建议在可能的情况下使用结构的特定性，并为有针对性的动态子结构使用 JSON 类型。

严格的模式有许多好处：

- **数据验证** – 强制执行严格的模式避免了管道溢出的风险，而超出特定结构。
- **避免列溢出的风险** - 尽管 JSON 类型可以扩展到可能数千列，但如果子列作为专用列存储，这可能会导致列文件的爆炸，创建过多的列文件会影响性能。为了缓解这一点，JSON 使用的基本 [Dynamic type](/sql-reference/data-types/dynamic) 提供了一个 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，限制存储为单独列文件的唯一路径数。一旦达到阈值，额外的路径将使用紧凑编码格式存储在共享列文件中，在支持灵活数据摄取的同时保持性能和存储效率。然而，访问此共享列文件的性能较差。请注意，JSON 列可以与 [类型提示](#using-type-hints-and-skipping-paths) 一起使用。"提示" 列将提供与专用列相同的性能。
- **简化路径和类型的内省** - 尽管 JSON 类型支持 [内省函数](/sql-reference/data-types/newjson#introspection-functions) 以确定已经推断出的类型和路径，但静态结构可以更简单地进行探索，例如使用 `DESCRIBE`。

### 单一 JSON 列 {#single-json-column}

这种方法对原型设计和数据工程任务很有用。对于生产，尽可能只在必要时为动态子结构使用 `JSON`。

:::note 性能注意事项
单个 JSON 列可以通过跳过（不存储）不需要的 JSON 路径以及使用 [类型提示](#using-type-hints-and-skipping-paths) 来优化。类型提示允许用户显式定义子列的类型，从而跳过推断和在查询时的间接处理。这可以用于提供与使用显式模式相同的性能。详见 ["使用类型提示和跳过路径"](#using-type-hints-and-skipping-paths)。
:::

这里单个 JSON 列的模式是简单的：

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
在 JSON 定义中，我们对 `username` 列提供了 [类型提示](#using-type-hints-and-skipping-paths)，因为我们在排序/主键中使用它。这有助于 ClickHouse 知道此列不会为 null，并确保它知道使用哪个 `username` 子列（每种类型可能有多个，因此否则会产生歧义）。
:::

可以使用 `JSONAsObject` 格式将行插入到上述表中：

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

我们可以使用 [内省函数](/sql-reference/data-types/newjson#introspection-functions) 确定推断的子列及其类型。例如：

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

有关完整的内省函数列表，请参见 ["内省函数"](/sql-reference/data-types/newjson#introspection-functions)。

[子路径可以通过](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 使用 `.` 表示法访问，例如：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

请注意，缺失于行中的列被返回为 `NULL`。

此外，对于具有相同类型的路径，将创建一个单独的子列。例如，存在一个 `company.labels.type` 的子列，分别为 `String` 和 `Array(Nullable(String))`。虽然尽可能返回两个，我们可以使用 `.:` 语法来定位特定的子列：

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

要返回嵌套的子对象，必须使用 `^`，这是为了避免读取大量列 - 除非明确请求。没有 `^` 的访问对象将返回 `NULL`，如下所示：

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

在原型设计和数据工程挑战中很有用，但我们建议在生产中尽可能使用显式模式。

我们之前的示例可以模建为 `company.labels` 列的单个 `JSON` 列。

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

我们可以使用 `JSONEachRow` 格式插入到此表中：

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

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions) 可以用于确定推断的 `company.labels` 列的路径和类型。

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

类型提示允许我们为路径及其子列指定类型，从而防止不必要的类型推断。考虑以下示例，其中我们为 JSON 列 `company.labels` 中的 JSON 键 `dissolved`、`employees` 和 `founded` 指定类型。

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

请注意，这些列现在具有我们的显式类型：

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

此外，我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过我们不想存储的路径，以最小化存储并避免对不需要路径的推断。例如，假设我们对上述数据使用单个 JSON 列。我们可以跳过 `address` 和 `company` 路径：

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

请注意，我们的列已从数据中排除：

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

类型提示不仅仅是避免不必要类型推断的方法 - 它们完全消除了存储和处理间接性，并允许指定 [最佳原始类型](/data-modeling/schema-design#optimizing-types)。具有类型提示的 JSON 路径始终像传统列一样存储，跳过在查询时的 [**区分列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) 或动态解析的需要。

这意味着，利用良好定义的类型提示，嵌套 JSON 键获得与一开始作为顶级列建模时相同的性能和效率。

因此，对于主要一致但仍受益于 JSON 灵活性的 数据集，类型提示提供了一种便捷的方式来保持性能，而无需重构您的模式或摄取管道。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径存储为真实列式布局中的子列，从而启用与传统列相同的性能优势，例如压缩、SIMD 加速处理和最小磁盘 I/O。您 JSON 数据中的每个唯一路径和类型组合可以成为其在磁盘上的单独列文件。

<Image img={json_column_per_type} size="md" alt="按 JSON 路径划分的列" />

例如，当插入两个具有不同类型的 JSON 路径时，ClickHouse 将每个 [具体类型的值存储在不同的子列中](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以独立访问，从而最小化不必要的 I/O。请注意，当查询具有多种类型的列时，其值仍以单个列式响应返回。

此外，通过利用偏移量，ClickHouse 确保这些子列保持稠密，不会为缺失的 JSON 路径存储默认值。这种方法最大程度地提高了压缩并进一步降低了 I/O。

<Image img={json_offsets} size="md" alt="JSON 偏移量" />

然而，在具有高基数或高度可变 JSON 结构的场景中，例如遥测管道、日志或机器学习特征存储，可能会导致列文件的爆炸。每一个新的唯一 JSON 路径都会导致一个新的列文件，每个路径下的每种类型变体都导致额外的列文件。尽管这对读取性能是最佳的，但它引入了操作上的挑战：文件描述符耗尽、内存使用增加和由于小文件过多导致的合并速度减慢。

为了解决此问题，ClickHouse 引入了溢出子列的概念：一旦不同的 JSON 路径数超过阈值，额外路径将以紧凑编码格式存储在一个共享文件中。这个文件仍然可以查询，但不具备与专用子列相同的性能特征。

<Image img={shared_json_column} size="md" alt="共享 JSON 列" />

此阈值由 JSON 类型声明中的 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 参数控制。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**避免将此参数设置得过高** - 较大的值会增加资源消耗并降低效率。作为经验法则，应将其保持在 10,000 以下。对于具有高度动态结构的工作负载，使用类型提示和 `SKIP` 参数来限制存储内容。

对于对这种新列类型的实现感兴趣的用户，我们建议阅读我们的详细博客文章 ["ClickHouse 的新强大 JSON 数据类型"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
