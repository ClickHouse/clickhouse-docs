---
sidebar_label: Migrating from Rockset
sidebar_position: 20
slug: /en/migrations/rockset
description: Migrating from Rockset to ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, rockset]
---

# Migrating from Rockset

Rockset is a real-time analytics database that was [acquired by OpenAI in June 2024](https://rockset.com/blog/openai-acquires-rockset/).
Users have until September 30th, 2024, 5 PM PDT to [off-board from the service](https://docs.rockset.com/documentation/docs/faq).

We think ClickHouse Cloud will provide an excellent home for Rockset users, and in this guide, we'll go through some things to consider when migrating between these services.

Let's get started!

## Immediate assistance

If you need immediate assistance, please contact us by filling out [this form](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) and human will get in touch with you! 


## ClickHouse vs Rockset - High-Level Comparison

We'll begin with a brief overview of its strengths and where you might see some benefits compared to Rockset.

ClickHouse focuses on real-time performance and cost efficiency through a schema-first approach. 
While semi-structured data is supported, our philosophy is that users should decide how to structure their data to maximize performance and resource efficiency. 
As a result of the schema-first approach described above, in our benchmarks, ClickHouse exceeds Rockset in scalability, ingestion throughput, query performance, and cost-efficiency.

Regarding integration with other data systems, ClickHouse has [broad capabilities](/en/integrations) that exceed Rockset's. 

Finally, unlike Rockset, ClickHouse has both open-source and cloud distribution. 
This migration guide focuses on migrating to ClickHouse Cloud, but users can refer to the [rest of our documentation](/) on open-source capabilities.

## Rockset Key Concepts

Let's start by going through the [key concepts of Rockset](https://docs.rockset.com/documentation/docs/key-concepts) and explain their equivalents (where they exist) in ClickHouse Cloud.

### Data Sources

Rockset and ClickHouse both support loading data from a variety of sources. 

In Rockset, you create a data source and then create a _collection_ based on that data source.
There are fully managed integrations for event streaming platforms, OLTP databases, and cloud bucket storage.

In ClickHouse Cloud, the equivalent of fully managed integrations is [ClickPipes](/en/integrations/ClickPipes).
ClickPipes supports continuously loading data from event streaming platforms and cloud bucket storage.
ClickPipes loads data into _tables_.

### Ingest Transformations

Rockset's ingest transformations let you transform the raw data coming into Rockset before it's stored in a collection.
ClickHouse Cloud does the same via ClickPipes, which uses ClickHouse's [materialized views feature](/en/guides/developer/cascading-materialized-views) to transform the data.

### Collections

In Rockset, you query collections. In ClickHouse Cloud, you query tables.
In both services, querying is done using SQL.
ClickHouse adds extra functions on top of the ones in the SQL standard to give you more power to manipulate and transform your data.

### Query Lambdas

Rockset supports query lambdas, named parameterized queries stored in Rockset that can be executed from a dedicated REST endpoint.
ClickHouse Cloud's [Query API Endpoints](/en/get-started/query-endpoints) offer similar functionality.

### Views

In Rockset, you can create views, virtual collections defined by SQL queries.
ClickHouse Cloud supports several types of [views](/en/sql-reference/statements/create/view):

* _Normal views_ do not store any data. They just perform a read from another table at query time.
* _Parameterized views_ are similar to normal views but can be created with parameters resolved at query time.
* _Materialized views_ store data transformed by the corresponding `SELECT` query. They are like a trigger that runs when new data is added to the source data to which they refer.
* _Refreshable materialized views_ periodically run the corresponding query and store its result in a table, atomically replacing the table's previous contents.


### Aliases

Rockset aliases are used to associate multiple names with a collection.
ClickHouse Cloud does not support an equivalent feature.

### Workspaces

Rockset workspaces are containers that hold resources (i.e., collections, query lambdas, views, and aliases) and other workspaces.
ClickHouse Cloud does not support an equivalent feature.

## Design Considerations

In this section, we will review some of the key features of Rockset and learn how to address them when using ClickHouse Cloud. 

### JSON support

Rockset supports an extended version of the JSON format that allows for Rockset-specific types.

There are multiple ways to work with JSON in ClickHouse:

* JSON inference
* JSON extract at query time
* JSON extract at insert time

To understand the best approach for your user case, see [our JSON documentation](/en/integrations/data-formats/json).

In addition, ClickHouse will soon have [a Semistructured column data type](https://github.com/ClickHouse/ClickHouse/issues/54864) that will replace the deprecated `JSON` type.
This new type should give users the flexibility Rockset's JSON type offers.

### Full-Text Search

Rockset supports full-text search with its `SEARCH` function.
While ClickHouse isn't a search engine, it does have [various functions for searching in strings](/en/sql-reference/functions/string-search-functions). 
ClickHouse also supports [bloom filters](/en/optimize/skipping-indexes), which can help in many scenarios.

### Vector Search

Rockset has a similarity index, which can be used to index the embeddings used in vector search applications.

ClickHouse also has a similarity index, but the index isn't yet used by the new query analyzer. 
At the time of writing, you can still do vector search in ClickHouse using a linear scan approach. 
This will be suitable for small to medium data volumes, but will obviously be too slow when working with big data.

### Ingesting data from OLTP databases

Rockset's managed integrations support ingesting data from OLTP databases like MongoDB and DynamoDB.

If you're ingesting data from DynamoDB, we suggest you turn on the option to export data into a Kinesis stream.

In the AWS Console for the Dynamo table, turn on `Amazon Kinesis Data Streams`:

<img src={require('./images/rockset_0.png').default} class="image" alt="Migrating Self-managed ClickHouse" style={{width: '100%', padding: '30px'}}/>

Let's have a look at a message that contains all of the supported DynamoDB attributes. 
The attributes are named.

* id (primary key)
* number set
* number
* binary set
* string
* map
* boolean
* list

If eventName is `MODIFY`, there will be both a `NewImage` and `OldImage` key.
If eventName is `REMOVE`, there will be only an `OldImage` key.

An example message is shown below:

```json
{
  "awsRegion": "us-east-1",
  "eventID": "5a88419c-468a-4ac4-8bad-7f832caf7345",
  "eventName": "INSERT",
  "userIdentity": null,
  "recordFormat": "application/json",
  "tableName": "kelsey-rockset-testing",
  "dynamodb": {
    "ApproximateCreationDateTime": 1719347890250647,
    "Keys": {
      "id": {
        "S": "some-partition-key"
      }
    },
    "NewImage": {
      "number set": {
        "NS": [
          "0",
          "1"
        ]
      },
      "number": {
        "N": "10"
      },
      "binary set": {
        "BS": [
          "MTMyMQ==",
          "MTQzMQ=="
        ]
      },
      "string": {
        "S": "some-string"
      },
      "null": {
        "NULL": true
      },
      "map": {
        "M": {
          "a": {
            "S": "some-string"
          },
          "b": {
            "N": "0"
          }
        }
      },
      "boolean": {
        "BOOL": false
      },
      "id": {
        "S": "some-partition-key"
      },
      "string set": {
        "SS": [
          "some-string-1",
          "some-string-2"
        ]
      },
      "binary": {
        "B": "MTMyMQ=="
      },
      "list": {
        "L": [
          {
            "S": "some-string-1"
          },
          {
            "N": "13"
          }
        ]
      }
    },
    "SizeBytes": 198,
    "ApproximateCreationDateTimePrecision": "MICROSECOND"
  },
  "eventSource": "aws:dynamodb"
}
```

Once you've configured that, you can set up a [Kinesis ClickPipe](/en/integrations/clickpipes/kinesis) for the stream configured for the DynamoDB table.

Record data will be ingested into the `dynamodb` column as a JSON string.

You must configure ClickPipes to extract the data into the desired format by specifying expressions in the `default value` column.


<img src={require('./images/rockset_1.png').default} class="image" alt="Migrating Self-managed ClickHouse" style={{width: '100%', padding: '30px'}}/>

Existing users of ClickHouse Cloud have also successfully created CDC pipelines to data from other OLTP databases.

You can read more in a two-part blog series:

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2)

### Compute-compute separation

Compute-compute separation is an architectural design pattern in real-time analytics systems that makes dealing with sudden bursts of incoming data or queries possible.
Suppose a single component handles both ingestion and querying. 
In that case, we will see ingestion latency increase if there is a flood of queries, and query latency increases if there's a flood of data to ingest.

Compute-compute separation separates the data ingestion and query processing code paths to avoid this problem, and this is a feature that Rockset implemented in March 2023.

This feature is currently being implemented in ClickHouse Cloud and will be released in private preview in mid-July 2024.

## Free migration services

We appreciate that this is a stressful time for Rockset users - no one wants to move a production database in such a short period!

If ClickHouse could be a good fit for you, we will [provide free migration services](https://clickhouse.com/comparison/rockset) to help smooth the transition. 
