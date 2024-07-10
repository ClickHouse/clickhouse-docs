---
sidebar_label: Designing your schema
sidebar_position: 40
title: Designing your schema
slug: /en/integrations/data-formats/json/schema
description: Designing your schema
keywords: [json, clickhouse, inserting, loading, formats, schema]
---

# Designing your schema

While [schema inference](/docs/en/integrations/data-formats/json/inference) can be used for establishing an initial schema for JSON data, and querying JSON data files in place e.g. in S3, users should aim to establish an optimixed versioned schema for their data. We discuss the options for modelling JSON structures below.

## Extract where possible

Where possible users are encouraged to extract the JSON keys they query frequently to the columns on the root of the schema. As well as simplifying query syntax, this allows users to use these columns in their `ORDER BY` clause if required or specify a [secondary index](/docs/en/optimize/skipping-indexes).

Consider the arxiv dataset explored in ["Using schema inference"](/docs/en/integrations/data-formats/json/inference):

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

Suppose we wish to make the first value of `versions.created` the main ordering key - ideally under a name `published_date`. This should be either extracted prior to insertion or at insert time using ClickHouse Materialized views or Materialized columns.

Materialized columns represent the simplest means of extracting data at query time and are prefered if the extraction logic can be captured as a simple SQL expression. As an example, the `published_date` can be added to the arxiv schema as a Materialized column and defined as an ordering key as follows:

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

:::note Column expression for nested
The above requires us to access the tuple using the notation `versions[1].1`, refering to the `created` column by position, rather than the prefered syntax of `versions.created_at[1]`.
:::

On loading the data, the column will be extracted.

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

:::note Materialized column behaviour
Values of materialized columns are always calculated at insert time and cannot be specified in INSERT queries. Materialized columns will, by default, not be returned in a `SELECT *`.  This is to preserve the invariant that the result of a SELECT * can always be inserted back into the table using INSERT. This behavior can be disabled by setting `asterisk_include_materialized_columns=1`.
:::

For more complex filtering and transformation tasks, we recommend using Materialized views. See [here](/docs/en/materialized-view) for further examples.

## Static vs dynamic JSON

The principle task on defining a schema for JSON is to determine the appropriate type for each key's value. We recommended users apply the following rules recrusively on each key in the JSON hierarchy to determine the appropriate for each.

1. If the key's value is a primitive type, irrespective of whether it is part of a sub object or on the root, ensure you select its type according to general schema [design best practices](/docs/en/data-modeling/schema-design) and [type optimization rules](/docs/en/data-modeling/schema-design#optimizing-types). Arrays of primitives, such as `phone_numbers` below can be modelled as `Array(<type>)` e.g. `Array(String)`.
2. If the key's value is a complex object i.e. either an object or array of objects, establish whether it is subject to change. Objects which rarely have new keys, where the addition of a new key can be predicted and handled with a schema change via [`ALTER TABLE ADD COLUMN`](/docs/en/sql-reference/statements/alter/column#add-column), can be considered **static**. This includes objects where only a subset of the keys maybe provided on some JSON documents. Objects where new keys are added frequently and/or not predictable, should be be considered **dynamic**. On establishing whether a value is **static** or **dynamic** see the relevant ["Handling static objects"](/docs/en/integrations/data-formats/json/schema#handling-static-objects) and ["Handling dynamic objects"](/docs/en/integrations/data-formats/json/schema#handling-dynamic-objects) below.

**Important:** The above rules should be applied recursively. If a key's value is determined to be dynamic, no further evaluation is required and the guidelines in ["Handling dynamic objects"](/docs/en/integrations/data-formats/json/schema#handling-dynamic-objects) can be followed. If the object is static, continue to assess the subkeys until either key values are primitive or dynamic keys are encountered.



To illustrate these rules we use the following JSON example representing a person:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": {
    "street": "Victor Plains",
    "suite": "Suite 879",
    "city": "Wisokyburgh",
    "zipcode": "90566-7771",
    "geo": {
      "lat": -43.9509,
      "lng": -34.4618
    }
  },
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
    "holiday_2024": "Azores, Portugal"
  }
}
```

Applying these rules:

- The root keys `name`, `username`, `email`, `website` can be represented as type `String`. The column `phone_numbers` is an Array primitive of type `Array(String)`, with `dob` and `id` type `Date` and `UInt32` respectively.
- New keys will not be be added to the `address` object and it can thus be considered **static**. If we recurse, all of the sub-columns can be considered primitives (and type `String`) except `geo`. This is also a static structure with two `Float32` columns `lat` and `lon`.
- The `tags` column is **dynamic**. We assume new arbitary tags can be added to this object.
- The `company` object is **static** and will always contain at most the 3 keys specified. The sub keys `name` and `catchPhrase` are of type `String`. The key `labels` is **dynamic**. We assume new arbitary tags can be added to this object.

## Handling static objects

We recommend static objects are handled using named tuples i.e. `Tuple`. Arrays of objects can be held using arrays of tuples i.e. `Array(Tuple)`. Within tuples themselves columns and their respective types should be defined using the same rules. This can result in nested Tuples to represent nested objects as shown below.

To illustrate this we use the earlier JSON person example, omitting the dynamic objects:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": {
    "street": "Victor Plains",
    "suite": "Suite 879",
    "city": "Wisokyburgh",
    "zipcode": "90566-7771",
    "geo": {
      "lat": -43.9509,
      "lng": -34.4618
    }
  },
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
CREATE TABLE default.people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

Note how the `company` column is defined as a `Tuple(catchPhrase String, name String)`. The `address` field likewise uses a `Tuple`, with a nested `Tuple` to represent the `geo` column.

JSON can be inserted into this table in its current structure.

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}},"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

We have minimal data in our example above, but as shown below we can query the tuple fields by their period delimited names.


## Handling dynamic objects
