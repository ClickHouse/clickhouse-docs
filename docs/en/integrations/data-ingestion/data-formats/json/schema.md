---
title: Designing JSON schema
slug: /en/integrations/data-formats/json/schema
description: How to optimally design JSON schema
keywords: [json, clickhouse, inserting, loading, formats, schema]
---

# Designing your schema

While [schema inference](/docs/en/integrations/data-formats/JSON/inference) can be used to establish an initial schema for JSON data and query JSON data files in place, e.g., in S3, users should aim to establish an optimized versioned schema for their data. We discuss the options for modeling JSON structures below.

## Extract where possible

Where possible, users are encouraged to extract the JSON keys they query frequently to the columns on the root of the schema. As well as simplifying query syntax, this allows users to use these columns in their `ORDER BY` clause if required or specify a [secondary index](/docs/en/optimize/skipping-indexes).

Consider the [arxiv dataset](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) explored in the guide [**JSON schema inference**](/docs/en/integrations/data-formats/json/inference):

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

Suppose we wish to make the first value of `versions.created` the main ordering key - ideally under a name `published_date`. This should be either extracted prior to insertion or at insert time using ClickHouse [materialized views](/en/guides/developer/cascading-materialized-views) or [materialized columns](/en/sql-reference/statements/alter/column#materialize-column).

Materialized columns represent the simplest means of extracting data at query time and are preferred if the extraction logic can be captured as a simple SQL expression. As an example, the `published_date` can be added to the arxiv schema as a materialized column and defined as an ordering key as follows:

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
    `published_date` DateTime DEFAULT parseDateTimeBestEffort(versions[1].1)
)
ENGINE = MergeTree
ORDER BY published_date
```

<!--TODO: Find a better way-->
:::note Column expression for nested
The above requires us to access the tuple using the notation `versions[1].1`, referring to the `created` column by position, rather than the preferred syntax of `versions.created_at[1]`.
:::

On loading the data, the column will be extracted:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
0 rows in set. Elapsed: 39.827 sec. Processed 2.52 million rows, 1.39 GB (63.17 thousand rows/s., 34.83 MB/s.)

SELECT published_date
FROM arxiv_2
LIMIT 2
┌──────published_date─┐
│ 2007-03-31 02:26:18 │
│ 2007-03-31 03:16:14 │
└─────────────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

:::note Materialized column behavior
Values of materialized columns are always calculated at insert time and cannot be specified in `INSERT` queries. Materialized columns will, by default, not be returned in a `SELECT *`.  This is to preserve the invariant that the result of a `SELECT *` can always be inserted back into the table using INSERT. This behavior can be disabled by setting `asterisk_include_materialized_columns=1`.
:::

For more complex filtering and transformation tasks, we recommend using [materialized views](/docs/en/materialized-view).

## Static vs dynamic JSON

The principal task on defining a schema for JSON is to determine the appropriate type for each key's value. We recommended users apply the following rules recursively on each key in the JSON hierarchy to determine the appropriate type for each key.

1. **Primitive types** - If the key's value is a primitive type, irrespective of whether it is part of a sub object or on the root, ensure you select its type according to general schema [design best practices](/docs/en/data-modeling/schema-design) and [type optimization rules](/docs/en/data-modeling/schema-design#optimizing-types). Arrays of primitives, such as `phone_numbers` below, can be modeled as `Array(<type>)` e.g., `Array(String)`.
2. **Static vs dynamic** - If the key's value is a complex object i.e. either an object or an array of objects, establish whether it is subject to change. Objects that rarely have new keys, where the addition of a new key can be predicted and handled with a schema change via [`ALTER TABLE ADD COLUMN`](/docs/en/sql-reference/statements/alter/column#add-column), can be considered **static**. This includes objects where only a subset of the keys may be provided on some JSON documents. Objects where new keys are added frequently and/or not predictable should be considered **dynamic**. To establish whether a value is **static** or **dynamic**, see the relevant sections [**Handling static objects**](/docs/en/integrations/data-formats/json/schema#handling-static-objects) and [**Handling dynamic objects**](/docs/en/integrations/data-formats/json/schema#handling-dynamic-objects) below.

<p></p>

**Important:** The above rules should be applied recursively. If a key's value is determined to be dynamic, no further evaluation is required and the guidelines in [**Handling dynamic objects**](/docs/en/integrations/data-formats/json/schema#handling-dynamic-objects) can be followed. If the object is static, continue to assess the subkeys until either key values are primitive or dynamic keys are encountered.

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

Applying these rules:

- The root keys `name`, `username`, `email`, `website` can be represented as type `String`. The column `phone_numbers` is an Array primitive of type `Array(String)`, with `dob` and `id` type `Date` and `UInt32` respectively.
- New keys will not be added to the `address` object (only new address objects), and it can thus be considered **static**. If we recurse, all of the sub-columns can be considered primitives (and type `String`) except `geo`. This is also a static structure with two `Float32` columns, `lat` and `lon`.
- The `tags` column is **dynamic**. We assume new arbitary tags can be added to this object of any type and structure.
- The `company` object is **static** and will always contain at most the 3 keys specified. The subkeys `name` and `catchPhrase` are of type `String`. The key `labels` is **dynamic**. We assume new arbitrary tags can be added to this object. Values will always be key-value pairs of type string.

## Handling static objects

We recommend static objects are handled using named tuples i.e. `Tuple`. Arrays of objects can be held using arrays of tuples i.e. `Array(Tuple)`. Within tuples themselves, columns and their respective types should be defined using the same rules. This can result in nested Tuples to represent nested objects as shown below.

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
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

Note how the `company` column is defined as a `Tuple(catchPhrase String, name String)`. The `address` field uses an `Array(Tuple)`, with a nested `Tuple` to represent the `geo` column.

JSON can be inserted into this table in its current structure:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

In our example above, we have minimal data, but as shown below, we can query the tuple fields by their period-delimited names.

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

The principal disadvantage of tuples is that the sub columns cannot be used in ordering keys. The following will thus fail:

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

Code: 47. DB::Exception: Missing columns: 'company.name' while processing query: 'company.name', required columns: 'company.name' 'company.name'. (UNKNOWN_IDENTIFIER)
```

:::note Tuples in ordering key
While tuple columns cannot be used in ordering keys, the entire tuple can be used. While possible, this rarely makes sense.
:::

### Handling default values

Even if JSON objects are structured, they are often sparse with only a subset of the known keys provided. Fortunately, the `Tuple` type does not require all columns in the JSON payload. If not provided, default values will be used.

Consider our earlier `people` table and the following sparse JSON, missing the keys `suite`, `geo`, `phone_numbers` and `catchPhrase`.

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

Querying this single row, we can see that default values are used for the columns (including sub-objects) that were ommitted:

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
If users need to differentiate between a value being empty and not provided, the [Nullable](/docs/en/sql-reference/data-types/nullable) type can be used. This [should be avoided](/docs/en/cloud/bestpractices/avoid-nullable-columns) unless absolutely required, as it will negatively impact storage and query performance on these columns.
:::

### Handling new columns

While a structured approach is simplest when the JSON keys are static, this approach can still be used if the changes to the schema can be planned, i.e., new keys are known in advance, and the schema can be modified accordingly.

Note that ClickHouse will by default ignore JSON keys which are provided in the payload and are not present in the schema. Consider the following modified JSON payload with the addition of a `nickname` key:

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

This JSON can be successfully inserted with the `nickname` key ignored:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Columns can be added to a schema using the [`ALTER TABLE ADD COLUMN`](/en/sql-reference/statements/alter/column#add-column) command. A default can be specified via the `DEFAULT` clause, which will be used if it is not specified during the subsequent inserts. Rows for which this value is not present (as they were inserted prior to its creation) will also return this default value. If no `DEFAULT` value is specified, the default value for the type will be used.

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

## Handling dynamic objects

There are two recommended approaches to handling dynamic objects:

- [Map(String,V)](/docs/en/sql-reference/data-types/map) type
- [String](/docs/en/sql-reference/data-types/string) with JSON functions

The following rules can be applied to determine the most appropriate.

1. If the objects are highly dynamic, with no predictable structure and contain arbitary nested objects, users should use the `String` type. Values can be extracted at query time using JSON functions as we show below.
2. If the object is used to store arbitrary keys, mostly of one type, consider using the `Map` type. Ideally, the number of unique keys should not exceed several hundred. The `Map` type can also be considered for objects with sub-objects, provided the latter have uniformity in their types. Generally, we recommend the `Map` type be used for labels and tags, e.g. Kubernertes pod labels in log data.

<br />

:::note Apply an object level approach
Different techniques may be applied to different objects in the same schema. Some objects can be best solved with a `String` and others `Map`. Note that once a `String` type is used, no further schema decisions need to be made. Conversely, it is possible to nest sub-objects within a `Map` key as we show below - including a `String` representing JSON.
:::

### Using String

Handling data using the structured approach described above is often not viable for those users with dynamic JSON, which is either subject to change or for which the schema is not well understood. For absolute flexibility, users can simply store JSON as `String`s before using functions to extract fields as required. This represents the extreme opposite of handling JSON as a structured object. This flexibility incurs costs with significant disadvantages - primarily an increase in query syntax complexity as well as degraded performance.

As noted earlier, for the [original person object](/docs/en/integrations/data-formats/json/schema#static-vs-dynamic-json), we cannot ensure the structure of the `tags` column. We insert the original row (we also include `company.labels`, which we ignore for now), declaring the `Tags` column as a `String`:

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
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

We can select the `tags` column and see that the JSON has been inserted as a string:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

The [JSONExtract](/docs/en/sql-reference/functions/json-functions#jsonextract-functions) functions can be used to retrieve values from this JSON. Consider the simple example below:

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Notice how the functions require both a reference to the `String` column `tags` and a path in the JSON to extract. Nested paths require functions to be nested e.g. `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` which extracts the column `tags.car.year`. The extraction of nested paths can be simplified through the functions [JSON_QUERY](/docs/en/sql-reference/functions/json-functions.md/#json_queryjson-path) AND [JSON_VALUE](/docs/en/sql-reference/functions/json-functions.md/#json_valuejson-path).

Consider the extreme case with the `arxiv` dataset where we consider the entire body to be a `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

To insert into this schema, we need to use the `JSONAsString` format:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

Suppose we wish to count the number of papers released by year. Contrast the query against the [structured version](/docs/en/integrations/data-formats/json/inference#creating-tables) of the schema vs using only a string:

```sql
-- using structured schema
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- using unstructured String

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

Notice the use of an xpath expression here to filter the JSON by method i.e. `JSON_VALUE(body, '$.versions[0].created')`.

String functions are appreciably slower (> 10x) than explicit type conversions with indices. The above queries always require a full table scan and processing of every row. While these queries will still be fast on a small dataset such as this, performance will degrade on larger datasets.

This approach's flexibility comes at a clear performance and syntax cost, and it should be used only for highly dynamic objects in the schema.

#### Simple JSON Functions

The above examples use the JSON* family of functions. These utilize a full JSON parser based on [simdjson](https://github.com/simdjson/simdjson), that is rigorous in its parsing and will distinguish between the same field nested at different levels. These functions are able to deal with JSON that is syntactically correct but not well-formatted, e.g. double spaces between keys.

A faster and more strict set of functions are available. These `simpleJSON*` functions offer potentially superior performance, primarily by making strict assumptions as to the structure and format of the JSON. Specifically:

* Field names must be constants
* Consistent encoding of field names e.g. `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, but `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* The field names are unique across all nested structures. No differentiation is made between nesting levels and matching is indiscriminate. In the event of multiple matching fields, the first occurrence is used.
* No special characters outside of string literals. This includes spaces. The following is invalid and will not parse.

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    Whereas, the following will parse correctly:

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

In some circumstances, where performance is critical and your JSON meets the above requirements, these may be appropriate. An example of the earlier query, re-written to use `simpleJSON*` functions, is shown below:

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
Peak memory usage: 211.49 MiB.
```

The above uses the `simpleJSONExtractString` to extract the `created` key, exploiting the fact we want the first value only for the published date. In this case, the limitations of the `simpleJSON*` functions are acceptable for the gain in performance.

### Using Map

If an object is used to store arbitrary keys of mostly one type, consider using the `Map` type. Ideally, the number of unique keys should not exceed several hundred. We recommend the `Map` type be used for labels and tags e.g. Kubernertes pod labels in log data. While a simple way to represent nested structures, `Map`s have some notable limitations:

- The fields must be of all the same type.
- Accessing sub-columns requires a special map syntax since the fields don’t exist as columns; the entire object is a column.
- Accessing a subcolumn loads the entire `Map` value i.e. all siblings and their respective values. For larger maps, this can result in a significant performance penalty.

:::note String keys
When modelling objects as `Map`s, a `String` key is used to store the JSON key name. The map will therefore always be `Map(String, T)`, where `T` depends on the data.
:::

#### Primitive values

The simplest application of a `Map` is when the object contains the same primitive type as values. In most cases, this involves using the `String` type for the value `T`.

Consider our [earlier person JSON](/docs/en/integrations/data-formats/json/schema#static-vs-dynamic-json) where the `company.labels` object was determined to be dynamic. Importantly, we only expect key-value pairs of type String to be added to this object. We can thus declare this as `Map(String, String)`:

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
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

We can insert our original complete JSON object:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Querying these fields within the request object requires a map syntax e.g.:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

A full set of `Map` functions is available to query this time, described [here](/docs/en/sql-reference/functions/tuple-map-functions.md). If your data is not of a consistent type, functions exist to perform the [necessary type coercion](/docs/en/sql-reference/functions/type-conversion-functions).

#### Object values

The `Map` type can also be considered for objects which have sub-objects, provided the latter have consistency in their types.

Suppose the `tags` key for our `persons` object requires a consistent structure, where the sub-object for each `tag` has a `name` and `time` column. A simplified example of such a JSON document might look like the following:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

This can be modelled with a `Map(String, Tuple(name String, time DateTime))` as shown below:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

The application of maps in this case is typically rare, and suggests that the data should be remodelled such that dynamic key names do not have sub-objects. For example, the above could be remodelled as follows allowing the use of `Array(Tuple(key String, name String, time DateTime))`.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```
