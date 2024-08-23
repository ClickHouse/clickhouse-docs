---
sidebar_label: DynamoDB
sidebar_position: 10
slug: /en/integrations/dynamodb
description: ClickPipes allows you to connect ClickHouse to DynamoDB.
keywords: [clickhouse, dynamodb, connect, integrate, table]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# CDC from DynamoDB to ClickHouse

This page covers how set up CDC from DynamoDB to ClickHouse using ClickPipes. There are 2 components to this integration:
1. The initial snapshot via S3 ClickPipes
2. Real-time updates via Kinesis ClickPipes


Data will be ingested into a `ReplacingMergeTree`. This table engine is commonly used for CDC scenarios to allow update operations to be applied. More on this pattern can be found in the following blog articles:

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Set up Kinesis Stream

First, you will want to enable a Kinesis stream on your DynamoDB table to capture changes in real-time. We want to do this before we create the snapshot to avoid missing any data.
Find the AWS guide located [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

![dynamodb-kinesis-stream.png](../images/dynamodb-kinesis-stream.png)

## 2. Create the snapshot

Next, we will create a snapshot of the DynamoDB table. This can be achieved through an AWS export to S3. Find the AWS guide located [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**You will want to do a "Full export" in the DynamoDB JSON format.**

![dynamodb-s3-export.png](../images/dynamodb-s3-export.png)

## 3. Load the snapshot into ClickHouse

### Create necessary tables

The snapshot data from DynamoDB will look something this:
```json
{
  "age": {
    "N": "26"
  },
  "first_name": {
    "S": "sally"
  },
  "id": {
    "S": "0A556908-F72B-4BE6-9048-9E60715358D4"
  }
}
```

Observe that the data is in a nested format. We will need to flatten this data before loading it into ClickHouse. This can be done using the `JSONExtract` function in ClickHouse in a Materialized View.

We will want to create three tables:
1. A table to store the raw data from DynamoDB
2. A table to store the final flattened data (destination table)
3. A Materialized View to flatten the data


For the example DynamoDB data above, the ClickHouse tables would look like this:

```sql
/* Snapshot table */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Table for final flattened data */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Table for final flattened data */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
) 
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

There are a few requirements for the destination table:
- This table must be a `ReplacingMergeTree` table
- The table must have a `version` column
  - In later steps, we will be mapping the `ApproximateCreationDateTime` field from the Kinesis stream to the `version` column.
- The table should use the partition key as the sorting key (specified by `ORDER BY`)
  - Rows with the same sorting key will be deduplicated based on the `version` column.

### Create the snapshot ClickPipe
Now you can create a ClickPipe to load the snapshot data from S3 into ClickHouse. Follow the S3 ClickPipe guide [here](/docs/en/integrations/data-ingestion/clickpipes/object-storage.md), but use the following settings:

- **Ingest path**: You will need to locate the path of the exported json files in S3. The path will look something like this:

```
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```
- **Format**: JSONEachRow
- **Table**: Your snapshot table (e.g. `default.snapshot` in example above)

Once created, data will begin populating in the snapshot and destination tables. You do not need to wait for the snapshot load to finish before moving on to the next step.

## 4. Create the Kinesis ClickPipe

Now we can set up the Kinesis ClickPipe to capture real-time changes from the Kinesis stream. Follow the Kinesis ClickPipe guide [here](/docs/en/integrations/data-ingestion/clickpipes/kinesis.md), but use the following settings:

- **Stream**: The Kinesis stream used in step 1
- **Table**: Your destination table (e.g. `default.destination` in example above)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - Map other fields to the appropriate destination columns as shown below

![dynamodb-map-columns.png](../images/dynamodb-map-columns.png) 


## 5. Cleanup (optional)

Once the snapshot ClickPipe has finished, you can delete the snapshot table and materialized view.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```

