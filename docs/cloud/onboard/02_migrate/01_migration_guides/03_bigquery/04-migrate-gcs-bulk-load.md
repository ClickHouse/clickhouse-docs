---
title: 'Migrate from BigQuery to ClickHouse Cloud with GCS bulk-load'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'How to migrate your data from BigQuery to ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: 'Migrate using GCS bulk-load'
doc_type: 'guide'
---

import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import Image from '@theme/IdealImage';

This guide walks you through how you can migrate your BigQuery projects to ClickHouse Cloud by bulk-loading exported BigQuery data into ClickHouse.
It uses the Stack Overflow dataset as a practical example.

## Pre-requisites

Before proceeding with this migration guide, make sure you have the following:

- A ClickHouse Cloud account, with an empty 3x16GB service that you will be using for the migration
- You have completed the [**BigQuery to ClickHouse migration guide setup**](/migrations/bigquery/dataset-setup), which walks you through how to set up the example dataset used in this guide. You will need:
  - A BigQuery project with the Stack Overflow dataset
  - A GCS bucket
- You have an understanding of how [primary/order by keys](/best-practices/choosing-a-primary-key) work in ClickHouse
- You have read [**Schema design**](/data-modeling/schema-design)

## Migration approach {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery supports exporting data to Google's object store (GCS).
We will use this as a data source for ingestion into ClickHouse by:
1. Exporting tables to GCS.
2. Importing the data into ClickHouse Cloud using the `gcs` or `s3Cluster` functions.

The approach is illustrated below:

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

This approach has a number of advantages:

- BigQuery export functionality supports a filter for exporting a subset of data.
- BigQuery supports exporting to [Parquet, Avro, JSON, and CSV](https://cloud.google.com/bigquery/docs/exporting-data) formats and several [compression types](https://cloud.google.com/bigquery/docs/exporting-data) - all supported by ClickHouse.
- GCS supports [object life cycle management](https://cloud.google.com/storage/docs/lifecycle), allowing data that has been exported and imported into ClickHouse to be deleted after a specified period.
- [Google allows up to 50TB per day to be exported to GCS for free](https://cloud.google.com/bigquery/quotas#export_jobs). Users only pay for GCS storage.
- Exports produce multiple files automatically, limiting each to a maximum of 1GB of table data. This is beneficial to ClickHouse since it allows imports to be parallelized.

Before trying the following examples, we recommend users review the [permissions required for export](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) and [locality recommendations](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) to maximize export and import performance.

## Migration steps {#steps}

<VerticalStepper headerLevel="h3">

### Export BigQuery data {#export-data}

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project picker at the top of the page next to the Google Cloud logo and select the BigQuery project you made previously
3. Select the **Run a query in BigQuery** button to open the studio.
4. Now select the **SQL query** button.
5. Run the following DDL commands, substituting `<bucket-uri>` for the gsutil URI of your own GCS bucket e.g. `gs://bigquery-to-clickhouse`

```sql
EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/posts/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.posts
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/votes/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.votes
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/comments/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.comments
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/users/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.users
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/badges/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.badges
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/postlinks/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.postlinks
);


EXPORT DATA OPTIONS(
  uri = '<bucket-uri>/stackoverflow/posthistory/*.parquet',
  format = 'Parquet',
  overwrite = TRUE
) AS (
  SELECT
    *
  FROM
    stackoverflow.posthistory
);
```

### Create schemas on ClickHouse Cloud {#create-schemas}

1. Open the [ClickHouse Cloud console](https://console.clickhouse.cloud/)
2. Select the service you wish to use, or create a new empty service
3. Select **SQL console**
4. Select **+** next to the home icon to create a new query
5. Run the following DDL statements to create the equivalent ClickHouse database and tables:

```sql
CREATE DATABASE IF NOT EXISTS stackoverflow;

CREATE TABLE stackoverflow.posts
(
    `Id` Int32 CODEC(Delta(4), ZSTD(1)),
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
    `AcceptedAnswerId` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `Score` Int32,
    `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
    `Body` String,
    `OwnerUserId` Int32,
    `OwnerDisplayName` String,
    `LastEditorUserId` Int32,
    `LastEditorDisplayName` String,
    `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `LastActivityDate` DateTime64(3, 'UTC'),
    `Title` String,
    `Tags` String,
    `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
    `CommentCount` UInt8,
    `FavoriteCount` UInt8,
    `ContentLicense` LowCardinality(String),
    `ParentId` String,
    `CommunityOwnedDate` DateTime64(3, 'UTC'),
    `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate);

CREATE TABLE stackoverflow.votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId, UserId);

CREATE TABLE stackoverflow.comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY CreationDate;

CREATE TABLE stackoverflow.users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate);

CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId;

CREATE TABLE stackoverflow.postlinks
(
    `Id` UInt64,
    `CreationDate` DateTime64(3, 'UTC'),
    `PostId` Int32,
    `RelatedPostId` Int32,
    `LinkTypeId` Enum8('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId);

CREATE TABLE stackoverflow.posthistory
(
    `Id` UInt64,
    `PostHistoryTypeId` UInt8,
    `PostId` Int32,
    `RevisionGUID` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `Text` String,
    `ContentLicense` LowCardinality(String),
    `Comment` String,
    `UserDisplayName` String
)
ENGINE = MergeTree
ORDER BY (CreationDate, PostId);
```

The schemas above are provided to you in an already optimized state.
In practice, you will go through some iteration to find optimal schemas for your data.

We recommend focusing on migrating the primary table first.
This may not necessarily be the largest table but rather the one on which you expect to run the most analytical queries.
This approach allows you to familiarize yourself with the main ClickHouse concepts.
This table may require remodeling as additional tables are added to fully exploit ClickHouse features and obtain optimal performance.
This modeling process is explored further in [**Schema design**](/schema-design) and the recommended next steps guides of that article.

As an illustrative example, for this dataset, you would begin with the `posts` table, which is the table likely to receive the most analytical queries.

The BigQuery schema for `posts` is shown below:

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```

Applying the process described in [**Schema design**](/data-modeling/schema-design) and going further by specifying column level compression codecs results in the following optimized schema:

```sql
CREATE TABLE stackoverflow.posts
(
    `Id` Int32 CODEC(Delta(4), ZSTD(1)),
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
    `AcceptedAnswerId` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `Score` Int32,
    `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
    `Body` String,
    `OwnerUserId` Int32,
    `OwnerDisplayName` String,
    `LastEditorUserId` Int32,
    `LastEditorDisplayName` String,
    `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `LastActivityDate` DateTime64(3, 'UTC'),
    `Title` String,
    `Tags` String,
    `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
    `CommentCount` UInt8,
    `FavoriteCount` UInt8,
    `ContentLicense` LowCardinality(String),
    `ParentId` String,
    `CommunityOwnedDate` DateTime64(3, 'UTC'),
    `ClosedDate` DateTime64(3, 'UTC')
)
    ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate);
```

### Insert data from GCS {#insert-gcs}

Insert the data for each table using the `s3Cluster` function:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/posts/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.votes SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/votes/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.comments SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/comments/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.users SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/users/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.badges SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/badges/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.postlinks SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/postlinks/*.parquet', '<ACCESS_KEY>', '<SECRET>');
INSERT INTO stackoverflow.posthistory SELECT * FROM s3Cluster(default, 'gs://bigquery-to-clickhouse-migration/stackoverflow/posthistory/*.parquet', '<ACCESS_KEY>', '<SECRET>');
```

The `s3Cluster` function above is used when your service contains multiple replicas, which allows processing files from both Amazon S3 and Google Cloud Storage in parallel with multiple replicas in a specified Cloud service.
You can also use the `gcs` function (an alias for the `s3` table function) if your service has only a single replica.

The `ACCESS_ID` and `SECRET` used in the above query is your [HMAC key](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) associated with your GCS bucket.
</VerticalStepper>

