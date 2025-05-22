import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';

# 设计您的模式

虽然 [模式推断](/integrations/data-formats/json/inference) 可以用于建立 JSON 数据的初始模式并直接查询 JSON 数据文件，例如 S3 中的文件，用户应该力求为其数据建立一个优化的版本化模式。下面我们讨论建模 JSON 结构的推荐方法。

## 静态 JSON 与动态 JSON {#static-vs-dynamic-json}

定义 JSON 模式的主要任务是确定每个键的值的适当类型。我们建议用户递归地在 JSON 层次结构中的每个键上应用以下规则，以确定每个键的适当类型。

1. **原始类型** - 如果键的值是原始类型，无论它是子对象的一部分还是根对象，都应根据一般的模式 [设计最佳实践](/data-modeling/schema-design) 和 [类型优化规则](/data-modeling/schema-design#optimizing-types) 选择其类型。原始类型的数组，如下面的 `phone_numbers`，可以建模为 `Array(<type>)`，例如 `Array(String)`。
2. **静态与动态** - 如果键的值是复杂对象，即对象或对象数组，需要确定其是否会发生变化。那些很少有新键的对象，其中可以预测并通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 的模式变化来处理新键的添加，可以视为 **静态**。这包括在某些 JSON 文档中仅提供部分键的对象。经常添加新键和/或不可预测的对象应被视为 **动态**。 **这里的例外是具有数百或数千个子键的结构，出于方便考虑可被视为动态**。 

要确定一个值是 **静态** 还是 **动态**，请参见下面的相关部分 [**处理静态对象**](/integrations/data-formats/json/schema#handling-static-structures) 和 [**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p></p>

**重要提示：** 上述规则应递归地应用。如果确定某个键的值是动态的，则无需进一步评估，可以遵循 [**处理动态对象**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) 中的指导。如果对象是静态的，继续评估子键，直到遇到原始键值或动态键。

为说明这些规则，我们使用以下表示一个人的 JSON 示例：

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

- 根键 `name`、`username`、`email`、`website` 可以表示为 `String` 类型。列 `phone_numbers` 是类型为 `Array(String)` 的原始数组，`dob` 和 `id` 类型分别为 `Date` 和 `UInt32`。
- `address` 对象不会添加新键（仅新的地址对象），因此可以被视为 **静态**。如果我们递归，所有的子列可以被视为原始类型（类型为 `String`），除了 `geo`。这也是一个静态结构，具有两个 `Float32` 列，`lat` 和 `lon`。
- `tags` 列是 **动态** 的。我们假设可以向该对象添加新的任意类型和结构的标签。
- `company` 对象是 **静态** 的，并且始终最多包含指定的 3 个键。子键 `name` 和 `catchPhrase` 的类型是 `String`。键 `labels` 是 **动态** 的。我们假设可以向该对象添加新的任意标签。值将始终是类型为字符串的键值对。

:::note
具有数百或数千个静态键的结构可以被视为动态，因为静态声明这些列通常是不切实际的。然而，在可能的情况下，应该 [跳过不必要的路径](#using-type-hints-and-skipping-paths)，以节省存储和推断开销。
:::

## 处理静态结构 {#handling-static-structures}

我们建议使用命名元组，即 `Tuple` 来处理静态结构。对象数组可以使用元组数组来保存，即 `Array(Tuple)`。在元组内部，列及其各自的类型应使用相同的规则来定义。这可能导致嵌套的元组以表示嵌套对象，如下所示。

为说明这一点，我们使用前面的 JSON 人物示例，省略动态对象：

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

注意 `company` 列被定义为 `Tuple(catchPhrase String, name String)`。`address` 键使用 `Array(Tuple)`，其中嵌套的 `Tuple` 用于表示 `geo` 列。

JSON 可以以其当前结构插入到该表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在我们上面的例子中，我们有最小数据，但如下所示，我们可以按其带点的名称查询元组列。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

注意 `address.street` 列作为 `Array` 返回。要按位置查询数组中的特定对象，数组偏移量应在列名后指定。例如，要访问第一个地址的街道：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

子列也可以用于从 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 的排序键中进行排序：

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

即使 JSON 对象是结构化的，它们通常是稀疏的，仅提供已知键的子集。幸运的是，`Tuple` 类型不要求在 JSON 有效载荷中包含所有列。如果未提供，将使用默认值。

考虑我们之前的 `people` 表和以下缺少键 `suite`、`geo`、`phone_numbers` 和 `catchPhrase` 的稀疏 JSON。

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

我们可以看到下面这行可以成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询这一行时，我们可以看到用于省略的列（包括子对象）的默认值：

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

:::note 区分空值和 NULL
如果用户需要区分一个值是空的还是未提供的，可以使用 [Nullable](/sql-reference/data-types/nullable) 类型。除非绝对必要，否则 [应避免使用](/best-practices/select-data-types#avoid-nullable-columns)，因为这会对这些列的存储和查询性能产生负面影响。
:::

### 处理新列 {#handling-new-columns}

虽然当 JSON 键是静态时，结构化的方法最简单，但如果可以规划模式的变化，即新键是已知的并且可以相应地修改模式，这种方法仍然可以使用。

请注意，ClickHouse 默认会忽略有效载荷中提供但在模式中不存在的 JSON 键。考虑以下带有 `nickname` 键添加的修改 JSON 有效载荷：

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

该 JSON 可以成功插入，且忽略 `nickname` 键：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向模式添加列。可以通过 `DEFAULT` 子句指定默认值，如果在随后的插入中没有指定，将使用此值。未提供此值的行（因为它们是在创建之前插入的）也会返回此默认值。如果未指定 `DEFAULT` 值，将使用该类型的默认值。

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

<PrivatePreviewBadge/>

如果 JSON 数据是半结构化的，其中键可以动态添加和/或具有多种类型，建议使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

更具体地说，当您的数据：

- 具有 **不可预测的键** 随时间可能会变化。
- 包含 **多种类型的值**（例如，一个路径有时可能包含字符串，有时可能包含数字）。
- 需要模式灵活性，严格类型不切实际。
- 具有 **数百或数千** 静态路径，但显然没有现实地逐一声明。这往往是罕见的。

考虑我们之前的人物 JSON [示例](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被确定为动态。

假设 `company.labels` 包含任意键。此外，结构中任何键的类型在行之间可能不一致。例如：

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

考虑到 `company.labels` 列在对象之间动态属性和类型的变化，我们有几个选项来建模此数据：

- **单个 JSON 列** - 将整个模式表示为一个 `JSON` 列，允许在此下面的所有结构都是动态的。
- **目标 JSON 列** - 仅对 `company.labels` 列使用 `JSON` 类型，保留上面所有其他列的结构化模式。

虽然第一种方法 [与之前的方法不一致](#static-vs-dynamic-json)，但单个 JSON 列的做法在原型设计和数据工程任务中很有用。

对于大规模的 ClickHouse 生产部署，我们推荐在结构上尽可能具体，并使用 JSON 类型来处理目标动态子结构。

严格的模式有许多好处：

- **数据验证** - 强制执行严格的模式避免列爆炸的风险，特定结构除外。
- **避免列爆炸的风险** – 尽管 JSON 类型可以扩展到潜在的数千列，但将子列存储为专用列可能会导致列文件爆炸，生成过多的列文件影响性能。为此，JSON 所使用的底层 [动态类型](/sql-reference/data-types/dynamic) 提供了一个 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，它限制存储为单独列文件的唯一路径数量。一旦达到阈值，额外路径将以紧凑的编码格式存储在共享的列文件中，从而保持性能和存储效率，同时支持灵活的数据摄取。然而，访问这个共享列文件的性能则不如专用列。需要注意的是，JSON 列可以与 [类型提示](#using-type-hints-and-skipping-paths) 一起使用。 "提示" 列将提供与专用列相同的性能。
- **简化路径和类型的探索** - 尽管 JSON 类型支持 [推理函数](/sql-reference/data-types/newjson#introspection-functions) 来确定已推断的类型和路径，但静态结构可以更简单地进行探索，例如使用 `DESCRIBE`。

### 单个 JSON 列 {#single-json-column}

这种方法对于原型设计和数据工程任务非常有用。在生产中，尽量仅在必要时将 `JSON` 用于动态子结构。

:::note 性能考虑
通过跳过（不存储）不需要的 JSON 路径并使用 [类型提示](#using-type-hints-and-skipping-paths)，可以优化单个 JSON 列。类型提示允许用户显式定义子列的类型，从而跳过推断和查询时的间接处理。这可以用于提供与使用显式模式相同的性能。有关详细信息，请参见 ["使用类型提示和跳过路径"](#using-type-hints-and-skipping-paths)。
:::

此处单个 JSON 列的模式很简单：

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
我们为 JSON 定义中的 `username` 列提供了 [类型提示](#using-type-hints-and-skipping-paths)，因为我们在排序/主键中使用它。这有助于 ClickHouse 知道该列不会为 NULL，并确保它知道使用哪个 `username` 子列（每种类型可能有多个，所以否则这是模糊的）。
:::

可以使用 `JSONAsObject` 格式向上述表插入行：

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

我们可以使用 [推理函数](/sql-reference/data-types/newjson#introspection-functions) 来确定已推断的子列及其类型。例如：

```sql
SELECT JSONDynamicPathsWithTypes(json) as paths
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

有关推理函数的完整列表，请参见 ["推理函数"](/sql-reference/data-types/newjson#introspection-functions)

[子路径可以访问](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)，使用 `.` 符号，例如：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

注意缺少的列在行中返回为 `NULL`。

此外，对于具有相同类型的路径，会创建一个单独的子列。例如，存在 `company.labels.type` 的 `String` 和 `Array(Nullable(String))` 两个子列。虽然可能会返回两者，但我们可以使用 `.:` 语法定位特定的子列：

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

为了返回嵌套的子对象，需要使用 `^`。这是一个设计选择，用于避免读取大量列——除非明确请求。未经 `^` 访问的对象将返回 `NULL`，如下面所示：

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

### 目标 JSON 列 {#targeted-json-column}

尽管在原型设计和数据工程挑战中有用，但我们建议在生产中尽可能使用显式模式。

我们之前的示例可以用单个 `JSON` 列来建模 `company.labels` 列。

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

我们可以使用 `JSONEachRow` 格式向该表插入：

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

可以使用 [推理函数](/sql-reference/data-types/newjson#introspection-functions) 来确定 `company.labels` 列的已推断路径和类型。

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

类型提示允许我们指定路径及其子列的类型，防止不必要的类型推断。考虑以下示例，我们在 JSON 列 `company.labels` 中指定 `dissolved`、`employees` 和 `founded` 的类型。

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

注意这些列现在具有我们的显式类型：

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

此外，我们可以使用 [`SKIP` 和 `SKIP REGEXP`](/sql-reference/data-types/newjson) 参数跳过我们不想存储的 JSON 路径，以最小化存储并避免对不需要的路径进行不必要的推断。例如，假设我们使用单个 JSON 列来存储上述数据。我们可以跳过 `address` 和 `company` 路径：

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

注意我们的列已从数据中排除：

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

类型提示不仅避免了不必要的类型推断——它们完全消除了存储和处理的间接性，同时还允许指定 [最佳原始类型](/data-modeling/schema-design#optimizing-types)。具有类型提示的 JSON 路径始终像传统列一样存储，绕过在查询时对 [**区分列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) 的需要。

这意味着，通过良好定义的类型提示，嵌套 JSON 键在性能和效率上达到了类似于一开始将其建模为顶级列的效果。

因此，对于大多数一致但仍受益于 JSON 灵活性的数据集，类型提示提供了一种方便的方法来保持性能，而无需重新构建您的模式或数据摄取流水线。

### 配置动态路径 {#configuring-dynamic-paths}

ClickHouse 将每个 JSON 路径存储为真列式布局中的子列，从而实现与传统列相同的性能优势，例如压缩、SIMD 加速处理和最小磁盘 I/O。您 JSON 数据中的每个唯一路径和类型组合都可以成为磁盘上的单独列文件。

<Image img={json_column_per_type} size="md" alt="每个 JSON 路径的列" />

例如，当插入两个具有不同类型的 JSON 路径时，ClickHouse 会将每个 [具体类型的值存储在不同的子列](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。这些子列可以独立访问，从而最小化不必要的 I/O。注意，当查询具有多种类型的列时，其值仍以单个列式响应返回。

此外，通过利用偏移量，ClickHouse 确保这些子列保持密集，对于缺失的 JSON 路径不存储默认值。这种方法最大限度地提高了压缩率，并进一步减少了I/O。

<Image img={json_offsets} size="md" alt="JSON 偏移" />

然而，在具有高基数或高度可变的 JSON 结构的场景中——例如遥测管道、日志或机器学习特征存储——这种行为可能会导致列文件的爆炸。每个新的唯一 JSON 路径会导致一个新的列文件，并且该路径下的每个类型变体增加一个额外的列文件。虽然这在读性能方面是最优的，但它引入了操作挑战：文件描述符耗尽、内存使用增加以及由于大量小文件导致的合并速度变慢。

为了解决这一问题，ClickHouse 引入了溢出子列的概念：一旦不同 JSON 路径的数量超过阈值，额外路径将以紧凑的编码格式存储在单个共享文件中。该文件仍可查询，但不享有与专用子列相同的性能特征。

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

**避免将此参数设置得过高** - 大值会增加资源消耗并降低效率。作为经验法则，将其保持在 10,000 以下。对于具有高度动态结构的工作负载，使用类型提示和 `SKIP` 参数限制存储内容。 

对于对这种新列类型的实现感到好奇的用户，我们建议阅读我们详细的博客文章 ["ClickHouse 的新强大 JSON 数据类型"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)。
