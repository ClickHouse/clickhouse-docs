---
title: 'Designing JSON schema'
slug: /integrations/data-formats/json/schema
description: 'How to optimally design JSON schemas'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'explanation'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';

# Designing your schema

While [schema inference](/integrations/data-formats/json/inference) can be used to establish an initial schema for JSON data and query JSON data files in place, e.g., in S3, users should aim to establish an optimized versioned schema for their data. We discuss the recommended approach for modeling JSON structures below.

## Static vs dynamic JSON {#static-vs-dynamic-json}

The principal task on defining a schema for JSON is to determine the appropriate type for each key's value. We recommended users apply the following rules recursively on each key in the JSON hierarchy to determine the appropriate type for each key.

1. **Primitive types** - If the key's value is a primitive type, irrespective of whether it is part of a sub-object or on the root, ensure you select its type according to general schema [design best practices](/data-modeling/schema-design) and [type optimization rules](/data-modeling/schema-design#optimizing-types). Arrays of primitives, such as `phone_numbers` below, can be modeled as `Array(<type>)` e.g., `Array(String)`.
2. **Static vs dynamic** - If the key's value is a complex object i.e. either an object or an array of objects, establish whether it is subject to change. Objects that rarely have new keys, where the addition of a new key can be predicted and handled with a schema change via [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), can be considered **static**. This includes objects where only a subset of the keys may be provided on some JSON documents. Objects where new keys are added frequently and/or are not predictable should be considered **dynamic**. **The exception here is structures with hundreds or thousands of sub keys which can be considered dynamic for convenience purposes**. 

To establish whether a value is **static** or **dynamic**, see the relevant sections [**Handling static objects**](/integrations/data-formats/json/schema#handling-static-structures) and [**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) below.

<p></p>

**Important:** The above rules should be applied recursively. If a key's value is determined to be dynamic, no further evaluation is required and the guidelines in [**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) can be followed. If the object is static, continue to assess the subkeys until either key values are primitive or dynamic keys are encountered.

To illustrate these rules, we use the following JSON example representing a person:

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

Applying these rules:

- The root keys `name`, `username`, `email`, `website` can be represented as type `String`. The column `phone_numbers` is an Array primitive of type `Array(String)`, with `dob` and `id` type `Date` and `UInt32` respectively.
- New keys will not be added to the `address` object (only new address objects), and it can thus be considered **static**. If we recurse, all of the sub-columns can be considered primitives (and type `String`) except `geo`. This is also a static structure with two `Float32` columns, `lat` and `lon`.
- The `tags` column is **dynamic**. We assume new arbitrary tags can be added to this object of any type and structure.
- The `company` object is **static** and will always contain at most the 3 keys specified. The subkeys `name` and `catchPhrase` are of type `String`. The key `labels` is **dynamic**. We assume new arbitrary tags can be added to this object. Values will always be key-value pairs of type string.

:::note
Structures with hundreds or thousands of static keys can be considered dynamic, as it is rarely realistic to statically declare the columns for these. However, where possible [skip paths](#using-type-hints-and-skipping-paths) which are not needed to save both storage and inference overhead.
:::

## Handling static structures {#handling-static-structures}

We recommend static structures are handled using named tuples i.e. `Tuple`. Arrays of objects can be held using arrays of tuples i.e. `Array(Tuple)`. Within tuples themselves, columns and their respective types should be defined using the same rules. This can result in nested Tuples to represent nested objects as shown below.

To illustrate this, we use the earlier JSON person example, omitting the dynamic objects:

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

The schema for this table is shown below:

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

Note how the `company` column is defined as a `Tuple(catchPhrase String, name String)`. The `address` key uses an `Array(Tuple)`, with a nested `Tuple` to represent the `geo` column.

JSON can be inserted into this table in its current structure:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

In our example above, we have minimal data, but as shown below, we can query the tuple columns by their period-delimited names.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Note how the `address.street` column is returned as an `Array`. To query a specific object inside an array by position, the array offset should be specified after the column name. For example, to access the street from the first address:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Sub columns can also be used in ordering keys from [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

### Handling default values {#handling-default-values}

Even if JSON objects are structured, they are often sparse with only a subset of the known keys provided. Fortunately, the `Tuple` type does not require all columns in the JSON payload. If not provided, default values will be used.

Consider our earlier `people` table and the following sparse JSON, missing the keys `suite`, `geo`, `phone_numbers`, and `catchPhrase`.

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

We can see below this row can be successfully inserted:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Querying this single row, we can see that default values are used for the columns (including sub-objects) that were omitted:

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

:::note Differentiating empty and null
If users need to differentiate between a value being empty and not provided, the [Nullable](/sql-reference/data-types/nullable) type can be used. This [should be avoided](/best-practices/select-data-types#avoid-nullable-columns) unless absolutely required, as it will negatively impact storage and query performance on these columns.
:::

### Handling new columns {#handling-new-columns}

While a structured approach is simplest when the JSON keys are static, this approach can still be used if the changes to the schema can be planned, i.e., new keys are known in advance, and the schema can be modified accordingly.

Note that ClickHouse will, by default, ignore JSON keys that are provided in the payload and are not present in the schema. Consider the following modified JSON payload with the addition of a `nickname` key:

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

This JSON can be successfully inserted with the `nickname` key ignored:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Columns can be added to a schema using the [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) command. A default can be specified via the `DEFAULT` clause, which will be used if it is not specified during the subsequent inserts. Rows for which this value is not present (as they were inserted prior to its creation) will also return this default value. If no `DEFAULT` value is specified, the default value for the type will be used.

For example:

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

## Handling semi-structured/dynamic structures {#handling-semi-structured-dynamic-structures}

If JSON data is semi-structured where keys can be dynamically added and/or have multiple types, the [`JSON`](/sql-reference/data-types/newjson) type is recommended.

More specifically, use the JSON type when your data:

- Has **unpredictable keys** that can change over time.
- Contains **values with varying types** (e.g., a path might sometimes contain a string, sometimes a number).
- Requires schema flexibility where strict typing isn't viable.
- You have **hundreds or even thousands** of paths which are static but simply not realistic to declare explicitly. This tends to be a rare.

Consider our [earlier person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) where the `company.labels` object was determined to be dynamic.

Let's suppose that `company.labels` contains arbitrary keys. Additionally, the type for any key in this structure may not be consistent between rows. For example:

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

Given the dynamic nature of the `company.labels` column between objects, with respect to keys and types, we have several options to model this data:

- **Single JSON column** - represents the entire schema as a single `JSON` column, allowing all structures to be dynamic beneath this.
- **Targeted JSON column** - only use the `JSON` type for the `company.labels` column, retaining the structured schema used above for all other columns.

While the first approach [does not align with previous methodology](#static-vs-dynamic-json), a single JSON column approach is useful for prototyping and data engineering tasks. 

For production deployments of ClickHouse at scale, we recommend being specific with structure and using the JSON type for targeted dynamic sub-structures where possible. 

A strict schema has a number of benefits:

- **Data validation** – enforcing a strict schema avoids the risk of column explosion, outside of specific structures. 
- **Avoids risk of column explosion** - Although the JSON type scales to potentially thousands of columns, where subcolumns are stored as dedicated columns, this can lead to a column file explosion where an excessive number of column files are created that impacts performance. To mitigate this, the underlying [Dynamic type](/sql-reference/data-types/dynamic) used by JSON offers a [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) parameter, which limits the number of unique paths stored as separate column files. Once the threshold is reached, additional paths are stored in a shared column file using a compact encoded format, maintaining performance and storage efficiency while supporting flexible data ingestion. Accessing this shared column file is, however, not as performant. Note, however, that the JSON column can be used with [type hints](#using-type-hints-and-skipping-paths). "Hinted" columns will deliver the same performance as dedicated columns.
- **Simpler introspection of paths and types** - Although the JSON type supports [introspection functions](/sql-reference/data-types/newjson#introspection-functions) to determine the types and paths that have been inferred, static structures can be simpler to explore e.g. with `DESCRIBE`.

### Single JSON column {#single-json-column}

This approach is useful for prototyping and data engineering tasks. For production, try use `JSON` only for dynamic sub structures where necessary.

:::note Performance considerations
A single JSON column can be optimized by skipping (not storing) JSON paths that are not required and by using [type hints](#using-type-hints-and-skipping-paths). Type hints allow the user to explicitly define the type for a sub-column, thereby skipping inference and indirection processing at query time. This can be used to deliver the same performance as if an explicit schema was used. See ["Using type hints and skipping paths"](#using-type-hints-and-skipping-paths) for further details.
:::

The schema for a single JSON column here is simple:

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
We provide a [type hint](#using-type-hints-and-skipping-paths) for the `username` column in the JSON definition as we use it in the ordering/primary key. This helps ClickHouse know this column won't be null and ensures it knows which `username` sub-column to use (there may be multiple for each type, so this is ambiguous otherwise).
:::

Inserting rows into the above table can be achieved using the `JSONAsObject` format:

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

We can determine the inferred sub columns and their types using [introspection functions](/sql-reference/data-types/newjson#introspection-functions). For example:

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

For a complete list of introspection functions, see the ["Introspection functions"](/sql-reference/data-types/newjson#introspection-functions)

[Sub paths can be accessed](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) using `.` notation e.g.

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

Note how columns missing in rows are returned as `NULL`.

Additionally, a separate sub column is created for paths with the same type. For example, a subcolumn exists for `company.labels.type` of both `String` and `Array(Nullable(String))`. While both will be returned where possible, we can target specific sub-columns using `.:` syntax:

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

In order to return nested sub-objects, the `^` is required. This is a design choice to avoid reading a high number of columns - unless explicitly requested. Objects accessed without `^` will return `NULL` as shown below:

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

### Targeted JSON column {#targeted-json-column}

While useful in prototyping and data engineering challenges, we recommend using an explicit schema in production where possible.

Our previous example can be modeled with a single `JSON` column for the `company.labels` column.

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

We can insert into this table using the `JSONEachRow` format:

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

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions) can be used to determine the inferred paths and types for the `company.labels` column.

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

### Using type hints and skipping paths {#using-type-hints-and-skipping-paths}

Type hints allow us to specify the type for a path and its sub-column, preventing unnecessary type inference. Consider the following example where we specify the types for the JSON keys `dissolved`, `employees`, and `founded` within the JSON column `company.labels`

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

Notice how these columns now have our explicit types:

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

Additionally, we can skip paths within JSON that we don't want to store with the [`SKIP` and `SKIP REGEXP`](/sql-reference/data-types/newjson) parameters in order to minimize storage and avoid unnecessary inference on unneeded paths. For example, suppose we use a single JSON column for the above data. We can skip the `address` and `company` paths:

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

Note how our columns have been excluded from our data:

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

#### Optimizing performance with type hints {#optimizing-performance-with-type-hints}  

Type hints offer more than just a way to avoid unnecessary type inference - they eliminate storage and processing indirection entirely, as well as allowing [optimal primitive types](/data-modeling/schema-design#optimizing-types) to be specified. JSON paths with type hints are always stored just like traditional columns, bypassing the need for [**discriminator columns**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) or dynamic resolution during query time. 

This means that with well-defined type hints, nested JSON keys achieve the same performance and efficiency as if they were modeled as top-level columns from the outset. 

As a result, for datasets that are mostly consistent but still benefit from the flexibility of JSON, type hints provide a convenient way to preserve performance without needing to restructure your schema or ingest pipeline.

### Configuring dynamic paths {#configuring-dynamic-paths}

ClickHouse stores each JSON path as a subcolumn in a true columnar layout, enabling the same performance benefits seen with traditional columns—such as compression, SIMD-accelerated processing, and minimal disk I/O. Each unique path and type combination in your JSON data can become its own column file on disk.

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

For example, when two JSON paths are inserted with differing types, ClickHouse stores the values of each [concrete type in distinct sub-columns](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). These sub-columns can be accessed independently, minimizing unnecessary I/O. Note that when querying a column with multiple types, its values are still returned as a single columnar response.

Additionally, by leveraging offsets, ClickHouse ensures that these sub-columns remain dense, with no default values stored for absent JSON paths. This approach maximizes compression and further reduces I/O.

<Image img={json_offsets} size="md" alt="JSON offsets" />

However, in scenarios with high-cardinality or highly variable JSON structures—such as telemetry pipelines, logs, or machine-learning feature stores - this behavior can lead to an explosion of column files. Each new unique JSON path results in a new column file, and each type variant under that path results in an additional column file. While this is optimal for read performance, it introduces operational challenges: file descriptor exhaustion, increased memory usage, and slower merges due to a high number of small files.

To mitigate this, ClickHouse introduces the concept of an overflow subcolumn: once the number of distinct JSON paths exceeds a threshold, additional paths are stored in a single shared file using a compact encoded format. This file is still queryable but does not benefit from the same performance characteristics as dedicated subcolumns.

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

This threshold is controlled by the [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) parameter in the JSON type declaration.

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**Avoid setting this parameter too high** - large values increase resource consumption and reduce efficiency. As a rule of thumb, keep it below 10,000.  For workloads with highly dynamic structures, use type hints and `SKIP` parameters to restrict what's stored.

For users curious about the implementation of this new column type, we recommend reading our detailed blog post ["A New Powerful JSON Data Type for ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
