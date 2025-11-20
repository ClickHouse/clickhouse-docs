---
title: '设计 JSON 模式'
slug: /integrations/data-formats/json/schema
description: '如何设计最优的 JSON 模式'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# 设计你的 schema

虽然可以使用[模式推断](/integrations/data-formats/json/inference)为 JSON 数据建立初始 schema，并直接在（例如 S3 中的）JSON 数据文件上执行查询，但用户仍应为其数据设计一个经过优化且可版本化的 schema。下面我们将讨论对 JSON 结构建模的推荐方法。



## 静态与动态 JSON {#static-vs-dynamic-json}

为 JSON 定义模式的主要任务是确定每个键的值的适当类型。我们建议用户对 JSON 层次结构中的每个键递归应用以下规则,以确定每个键的适当类型。

1. **基本类型** - 如果键的值是基本类型,无论它是子对象的一部分还是位于根级别,请确保根据通用模式[设计最佳实践](/data-modeling/schema-design)和[类型优化规则](/data-modeling/schema-design#optimizing-types)选择其类型。基本类型的数组,例如下面的 `phone_numbers`,可以建模为 `Array(<type>)`,例如 `Array(String)`。
2. **静态与动态** - 如果键的值是复杂对象,即对象或对象数组,请确定它是否会发生变化。很少添加新键的对象,其中新键的添加可以预测并通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 进行模式变更来处理,可以视为**静态**。这包括某些 JSON 文档中可能只提供键的子集的对象。频繁添加新键和/或不可预测的对象应视为**动态**。**这里的例外是具有数百或数千个子键的结构,为了方便起见可以视为动态**。

要确定值是**静态**还是**动态**,请参阅下面的相关章节[**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures)和[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p></p>

**重要提示:** 上述规则应递归应用。如果确定键的值是动态的,则无需进一步评估,可以遵循[**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)中的指南。如果对象是静态的,请继续评估子键,直到键值是基本类型或遇到动态键为止。

为了说明这些规则,我们使用以下表示一个人的 JSON 示例:

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
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

应用这些规则:

- 根级别的键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是 `Array(String)` 类型的数组基本类型,`dob` 和 `id` 的类型分别为 `Date` 和 `UInt32`。
- 不会向 `address` 对象添加新键(只会添加新的地址对象),因此可以将其视为**静态**。如果我们递归,除了 `geo` 之外,所有子列都可以视为基本类型(类型为 `String`)。`geo` 也是一个静态结构,包含两个 `Float32` 列:`lat` 和 `lng`。
- `tags` 列是**动态**的。我们假设可以向此对象添加任意类型和结构的新标签。
- `company` 对象是**静态**的,最多始终包含指定的 3 个键。子键 `name` 和 `catchPhrase` 的类型为 `String`。键 `labels` 是**动态**的。我们假设可以向此对象添加新的任意标签。值始终是字符串类型的键值对。


:::note
具有数百或数千个静态键的结构也可以视为动态结构，因为在实际场景中很难为这些键逐一静态声明列。不过，在可能的情况下，应[跳过不需要的路径](#using-type-hints-and-skipping-paths)，以同时节省存储空间和推断开销。
:::



## 处理静态结构 {#handling-static-structures}

我们建议使用命名元组(即 `Tuple`)来处理静态结构。对象数组可以使用元组数组(即 `Array(Tuple)`)来保存。在元组内部,列及其对应的类型应遵循相同的定义规则。这样可以通过嵌套 Tuple 来表示嵌套对象,如下所示。

为了说明这一点,我们使用之前的 JSON 人员示例,省略动态对象:

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

该表的模式定义如下:

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

注意 `company` 列被定义为 `Tuple(catchPhrase String, name String)`。`address` 键使用 `Array(Tuple)`,其中嵌套的 `Tuple` 用于表示 `geo` 列。

JSON 可以按其当前结构插入到此表中:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在上面的示例中,虽然数据量很少,但如下所示,我们可以通过点分隔的名称来查询元组列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

注意 `address.street` 列以 `Array` 形式返回。要按位置查询数组内的特定对象,应在列名后指定数组偏移量。例如,要访问第一个地址的街道:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

从 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 版本开始,子列也可以用于排序键:

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

即使 JSON 对象是结构化的,它们通常也是稀疏的,只提供已知键的一个子集。幸运的是,`Tuple` 类型不要求 JSON 负载中包含所有列。如果未提供,将使用默认值。


考虑我们之前的 `people` 表和以下稀疏 JSON,其中缺少 `suite`、`geo`、`phone_numbers` 和 `catchPhrase` 键。

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

可以看到,该行可以成功插入:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询这一行数据,可以看到被省略的列(包括子对象)使用了默认值:

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
如果需要区分值为空和未提供值的情况,可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。除非绝对必要,否则[应避免使用](/best-practices/select-data-types#avoid-nullable-columns),因为它会对这些列的存储和查询性能产生负面影响。
:::

### 处理新列 {#handling-new-columns}

虽然当 JSON 键是静态时,结构化方法最为简单,但如果可以规划 schema 的变更,即提前知道新键并相应修改 schema,这种方法仍然适用。

请注意,默认情况下,ClickHouse 会忽略 payload 中提供但 schema 中不存在的 JSON 键。考虑以下添加了 `nickname` 键的修改后 JSON payload:

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

该 JSON 可以成功插入,`nickname` 键将被忽略:


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

已插入 1 行。耗时：0.002 秒。
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向表的模式中添加列。可以通过 `DEFAULT` 子句指定默认值，在后续插入时如果未为该列显式提供值，将使用该默认值。对于在该默认值创建之前已插入、且缺少该列值的行，查询时也会返回这个默认值。如果未指定 `DEFAULT` 值，则会使用该数据类型的默认值。

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


## 处理半结构化/动态结构 {#handling-semi-structured-dynamic-structures}

如果 JSON 数据是半结构化的,其中键可以动态添加和/或具有多种类型,建议使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说,在以下情况下使用 JSON 类型:

- 具有**不可预测的键**,这些键可能随时间变化。
- 包含**类型可变的值**(例如,某个路径有时可能包含字符串,有时包含数字)。
- 需要模式灵活性,严格类型化不可行。
- 您有**数百甚至数千个**静态路径,但显式声明它们并不现实。这种情况往往比较罕见。

考虑我们[之前的 person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json),其中 `company.labels` 对象被确定为动态的。

假设 `company.labels` 包含任意键。此外,此结构中任何键的类型在不同行之间可能不一致。例如:

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
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
  "phone_numbers": ["123-456-7890", "555-867-5309"],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": ["real-time processing"],
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

鉴于对象之间 `company.labels` 列在键和类型方面的动态特性,我们有几种选项来建模这些数据:

- **单个 JSON 列** - 将整个模式表示为单个 `JSON` 列,允许其下的所有结构都是动态的。
- **针对性 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型,对所有其他列保留上面使用的结构化模式。

虽然第一种方法[与之前的方法不一致](#static-vs-dynamic-json),但单个 JSON 列方法对于原型设计和数据工程任务很有用。

对于大规模的 ClickHouse 生产部署,我们建议明确结构,并在可能的情况下对特定的动态子结构使用 JSON 类型。

严格的模式具有许多优势:


- **数据验证** – 强制使用严格的模式可以避免特定结构之外的列爆炸风险。
- **避免列爆炸风险** - 尽管 JSON 类型可以扩展到数千列,其中子列作为专用列存储,但这可能导致列文件爆炸,即创建过多的列文件从而影响性能。为了缓解这一问题,JSON 使用的底层 [Dynamic 类型](/sql-reference/data-types/dynamic)提供了 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数,该参数限制作为单独列文件存储的唯一路径数量。一旦达到阈值,额外的路径将使用紧凑编码格式存储在共享列文件中,在支持灵活数据摄取的同时保持性能和存储效率。但是,访问此共享列文件的性能不如专用列。需要注意的是,JSON 列可以与[类型提示](#using-type-hints-and-skipping-paths)一起使用。"提示"列将提供与专用列相同的性能。
- **更简单的路径和类型内省** - 尽管 JSON 类型支持[内省函数](/sql-reference/data-types/newjson#introspection-functions)来确定已推断的类型和路径,但静态结构可能更容易探索,例如使用 `DESCRIBE`。

### 单个 JSON 列 {#single-json-column}

这种方法对于原型设计和数据工程任务很有用。对于生产环境,建议仅在必要时对动态子结构使用 `JSON`。

:::note 性能考虑
可以通过跳过(不存储)不需要的 JSON 路径以及使用[类型提示](#using-type-hints-and-skipping-paths)来优化单个 JSON 列。类型提示允许用户显式定义子列的类型,从而在查询时跳过推断和间接处理。这可以提供与使用显式模式相同的性能。有关更多详细信息,请参阅["使用类型提示和跳过路径"](#using-type-hints-and-skipping-paths)。
:::

单个 JSON 列的模式很简单:

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
我们在 JSON 定义中为 `username` 列提供了[类型提示](#using-type-hints-and-skipping-paths),因为我们在排序键/主键中使用它。这有助于 ClickHouse 知道此列不会为空,并确保它知道要使用哪个 `username` 子列(每种类型可能有多个,否则会产生歧义)。
:::

可以使用 `JSONAsObject` 格式将行插入到上表中:

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

```


第 1 行:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

第 2 行:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

返回 2 行。用时:0.005 秒。

````

我们可以使用[内省函数](/sql-reference/data-types/newjson#introspection-functions)来确定推断的子列及其类型。例如:

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

有关内省函数的完整列表,请参阅["内省函数"](/sql-reference/data-types/newjson#introspection-functions)

可以使用 `.` 符号[访问子路径](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns),例如:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

返回 2 行。用时:0.006 秒。
```

注意,行中缺失的列将返回 `NULL`。


此外,对于类型相同的路径会创建单独的子列。例如,`company.labels.type` 同时存在 `String` 和 `Array(Nullable(String))` 类型的子列。虽然两者都会在可能的情况下返回,但我们可以使用 `.:` 语法来指定特定的子列:

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

要返回嵌套的子对象,需要使用 `^` 符号。这是一个设计选择,旨在避免读取大量列 - 除非明确请求。不使用 `^` 访问的对象将返回 `NULL`,如下所示:

```sql
-- 默认情况下不会返回子对象
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- 使用 ^ 符号返回子对象
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### 指定 JSON 列 {#targeted-json-column}

虽然在原型设计和数据工程挑战中很有用,但我们建议在生产环境中尽可能使用显式架构。

我们之前的示例可以使用单个 `JSON` 列来建模 `company.labels` 列。

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

我们可以使用 `JSONEachRow` 格式向此表插入数据:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

```


1 row in set. Elapsed: 0.440 sec.

````

```sql
SELECT *
FROM people
FORMAT Vertical

第 1 行：
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

第 2 行：
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
````

可以使用[内省函数](/sql-reference/data-types/newjson#introspection-functions)来确定 `company.labels` 列推断出的路径和类型。

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

类型提示允许我们为路径及其子列指定类型，从而避免不必要的类型推断。请参考以下示例，我们为 JSON 列 `company.labels` 中的 JSON 键 `dissolved`、`employees` 和 `founded` 指定了类型：

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

```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.

````

注意这些列现在具有我们显式指定的类型:

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

此外,我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过 JSON 中不想存储的路径,以减少存储空间并避免对不需要的路径进行不必要的类型推断。例如,假设我们对上述数据使用单个 JSON 列,可以跳过 `address` 和 `company` 路径:

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

类型提示不仅可以避免不必要的类型推断,还能完全消除存储和处理的间接层,同时允许指定[最优原始类型](/data-modeling/schema-design#optimizing-types)。带有类型提示的 JSON 路径始终像传统列一样存储,无需使用[**判别列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)或在查询时进行动态解析。

这意味着通过明确定义的类型提示,嵌套 JSON 键可以达到与从一开始就建模为顶级列相同的性能和效率。

因此,对于大部分结构一致但仍需要 JSON 灵活性的数据集,类型提示提供了一种便捷方式来保持性能,而无需重构模式或数据摄取管道。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径作为子列存储在真正的列式布局中,实现与传统列相同的性能优势——如压缩、SIMD 加速处理和最小磁盘 I/O。JSON 数据中的每个唯一路径和类型组合都可以成为磁盘上独立的列文件。

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

例如,当插入两个具有不同类型的 JSON 路径时,ClickHouse 将每个[具体类型的值存储在不同的子列中](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以独立访问,最大限度减少不必要的 I/O。请注意,当查询具有多种类型的列时,其值仍作为单个列式响应返回。

此外,通过利用偏移量,ClickHouse 确保这些子列保持密集,不会为缺失的 JSON 路径存储默认值。这种方法最大化压缩效果并进一步减少 I/O。

<Image img={json_offsets} size="md" alt="JSON offsets" />

然而,在具有高基数或高度可变 JSON 结构的场景中——例如遥测管道、日志或机器学习特征存储——这种行为可能导致列文件数量激增。每个新的唯一 JSON 路径都会产生一个新列文件,该路径下的每个类型变体都会产生一个额外的列文件。虽然这对读取性能最优,但会带来运维挑战:文件描述符耗尽、内存使用增加,以及由于大量小文件导致的合并速度变慢。

为了缓解这个问题,ClickHouse 引入了溢出子列的概念:一旦不同 JSON 路径的数量超过阈值,额外的路径将使用紧凑编码格式存储在单个共享文件中。该文件仍然可查询,但不具备专用子列的性能特性。

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

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

**避免将此参数设置得过高**——较大的取值会增加资源消耗并降低效率。一般而言，应将其控制在 10,000 以下。对于结构高度动态的工作负载，使用类型提示和 `SKIP` 参数来限制实际写入和存储的内容。

如果你对这种新列类型的实现细节感兴趣，建议阅读我们的详细博文[《用于 ClickHouse 的全新强大 JSON 数据类型》](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
