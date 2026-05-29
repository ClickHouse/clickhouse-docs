---
title: 'BigQuery to ClickHouse migration guide setup'
slug: /migrations/bigquery/dataset-setup
description: 'How to set up the Stack Overflow example dataset in a BigQuery project for the migration tutorials'
keywords: ['BigQuery', 'setup', 'migration', 'Stack Overflow']
sidebar_label: 'Example BigQuery project'
doc_type: 'guide'
---

import Permissions from '@site/docs/_snippets/clickpipes/bigquery/_permissions.md';
import ServiceAccountKey from '@site/docs/_snippets/clickpipes/bigquery/_service-account-key.md';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import Image from '@theme/IdealImage';

There are two recommended ways to migrate your project from BigQuery to ClickHouse:
- Using ClickPipes, a managed CDC solution available in ClickHouse Cloud
- By exporting your BigQuery tables to a GCS bucket and importing the data in ClickHouse

Both of the migration guides in this section covering the two approaches above use the [Stack Overflow dataset](/getting-started/example-datasets/stackoverflow), as an example dataset to show a typical migration from BigQuery to ClickHouse Cloud.
The dataset contains every `post`, `vote`, `user`, `comment`, and `badge` that has occurred on Stack Overflow from 2008 to Apr 2024.

The BigQuery schema for this data is shown below:

<Image img={bigquery_3} size="md" alt="Schema"/>

## Pre-requisites

Before proceeding, make sure you have the following:
- A Google Cloud account

## Create a new project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project picker at the top of the page next to the Google Cloud logo.
3. Click on **New project**.
4. Fill in the project name, for example "BigQueryClickHouse".
5. Optionally, select a parent resource, or leave it as **No organisation**.
6. Click on **Create**.

## Create table DDL and insert data

1. From the console landing page, select the project you just created.
2. You should see "You are working in" along with the name of the project you just created.
3. Make note of the **Project-ID**. You will need this in a later step.
4. Select the **Run a query in BigQuery** button to open the studio.
5. Now select the **SQL query** button.
6. It's the following DDL commands in the query editor, replacing **project-ID below** with the project ID that you took note of in step 3 above: 

Data for these tables is made available in Parquet format in a GCS bucket for convenience.

```sql
CREATE SCHEMA `project-ID.stackoverflow`;

CREATE TABLE stackoverflow.posts (
    Id INTEGER,
    PostTypeId INTEGER,
    AcceptedAnswerId INTEGER,
    CreationDate TIMESTAMP,
    Score INTEGER,
    ViewCount INTEGER,
    Body STRING,
    OwnerUserId INTEGER,
    OwnerDisplayName STRING,
    LastEditorUserId INTEGER,
    LastEditorDisplayName STRING,
    LastEditDate TIMESTAMP,
    LastActivityDate TIMESTAMP,
    Title STRING,
    Tags STRING,
    AnswerCount INTEGER,
    CommentCount INTEGER,
    FavoriteCount INTEGER,
    ContentLicense STRING,
    ParentId STRING,
    CommunityOwnedDate TIMESTAMP,
    ClosedDate TIMESTAMP
);

LOAD DATA OVERWRITE stackoverflow.posts (
    Id INTEGER,
    PostTypeId INTEGER,
    AcceptedAnswerId INTEGER,
    CreationDate TIMESTAMP,
    Score INTEGER,
    ViewCount INTEGER,
    Body STRING,
    OwnerUserId INTEGER,
    OwnerDisplayName STRING,
    LastEditorUserId INTEGER,
    LastEditorDisplayName STRING,
    LastEditDate TIMESTAMP,
    LastActivityDate TIMESTAMP,
    Title STRING,
    Tags STRING,
    AnswerCount INTEGER,
    CommentCount INTEGER,
    FavoriteCount INTEGER,
    ContentLicense STRING,
    ParentId STRING,
    CommunityOwnedDate TIMESTAMP,
    ClosedDate TIMESTAMP
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet']);

CREATE TABLE stackoverflow.votes (
    Id INTEGER,
    PostId INTEGER,
    VoteTypeId INTEGER,
    CreationDate TIMESTAMP,
    UserId INTEGER,
    BountyAmount INTEGER
);

LOAD DATA OVERWRITE stackoverflow.votes (
    Id INTEGER,
    PostId INTEGER,
    VoteTypeId INTEGER,
    CreationDate TIMESTAMP,
    UserId INTEGER,
    BountyAmount INTEGER
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/votes/*.parquet']);

CREATE TABLE stackoverflow.comments (
    Id INTEGER,
    PostId INTEGER,
    Score INTEGER,
    Text STRING,
    CreationDate TIMESTAMP,
    UserId INTEGER,
    UserDisplayName STRING
);

LOAD DATA OVERWRITE stackoverflow.comments (
    Id INTEGER,
    PostId INTEGER,
    Score INTEGER,
    Text STRING,
    CreationDate TIMESTAMP,
    UserId INTEGER,
    UserDisplayName STRING
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/comments/*.parquet']);

CREATE TABLE stackoverflow.users (
    Id INTEGER,
    Reputation STRING,
    CreationDate TIMESTAMP,
    DisplayName STRING,
    LastAccessDate TIMESTAMP,
    AboutMe STRING,
    Views INTEGER,
    UpVotes INTEGER,
    DownVotes INTEGER,
    WebsiteUrl STRING,
    Location STRING,
    AccountId INTEGER
);

LOAD DATA OVERWRITE stackoverflow.users (
    Id INTEGER,
    Reputation STRING,
    CreationDate TIMESTAMP,
    DisplayName STRING,
    LastAccessDate TIMESTAMP,
    AboutMe STRING,
    Views INTEGER,
    UpVotes INTEGER,
    DownVotes INTEGER,
    WebsiteUrl STRING,
    Location STRING,
    AccountId INTEGER
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/users/*.parquet']);

CREATE TABLE stackoverflow.badges (
    Id INTEGER,
    UserId INTEGER,
    Name STRING,
    Date TIMESTAMP,
    Class INTEGER,
    TagBased BOOL
);

LOAD DATA OVERWRITE stackoverflow.badges (
    Id INTEGER,
    UserId INTEGER,
    Name STRING,
    Date TIMESTAMP,
    Class INTEGER,
    TagBased INTEGER
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/badges/*.parquet']);

CREATE TABLE stackoverflow.postlinks (
    Id INTEGER,
    CreationDate TIMESTAMP,
    PostId INTEGER,
    RelatedPostId INTEGER,
    LinkTypeId INTEGER
);

LOAD DATA OVERWRITE stackoverflow.postlinks (
    Id INTEGER,
    CreationDate TIMESTAMP,
    PostId INTEGER,
    RelatedPostId INTEGER,
    LinkTypeId INTEGER
)
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/postlinks/*.parquet']);

CREATE TABLE stackoverflow.posthistory (
    Id INTEGER,
    PostHistoryTypeId INTEGER,
    PostId INTEGER,
    RevisionGUID STRING,
    CreationDate TIMESTAMP,
    UserId INTEGER,
    Text STRING,
    ContentLicense STRING,
    Comment STRING,
    UserDisplayName STRING
);

LOAD DATA OVERWRITE stackoverflow.posthistory
-- (
--     Id INTEGER,
--     PostHistoryTypeId INTEGER,
--     PostId INTEGER,
--     RevisionGUID STRING,
--     CreationDate TIMESTAMP,
--     UserId INTEGER,
--     Text STRING,
--     ContentLicense STRING,
--     Comment STRING,
--     UserDisplayName STRING
-- )
FROM FILES (
  format = 'Parquet',
  uris = ['gs://clickhouse-public-datasets/stackoverflow/parquet/posthistory/2008.parquet']);
```

7. Click the **Run** button to execute the statements. It will take about six minutes to complete.

When the queries have finished executing you should see a BigQuery resource in the tab to the left of the query editor.
If you click on the resource name to expand it, you should now see the **stackoverflow** schema and 7 tables.

You have successfully created the tables that we'll be using in these migration guides.

## Create a GCS bucket for staging {#gcs-bucket-staging}

:::note
This step is required regardless of which migration method you will be using.
:::

The initial load process requires a user-provided Google Cloud Storage (GCS) bucket for staging.
Refer to the [Google Cloud documentation](https://docs.cloud.google.com/storage/docs/creating-buckets) on how to do so.

You will need the bucket's gsutil URI if you intend to use ClickPipes (e.g. **gs://bigquery-clickhouse**),
or the bucket's Cloud Console URL (e.g. **https://console.cloud.google.com/storage/browser/bigquery-clickhouse**) if you intend to import the data directly.

You can find these by clicking the name of your bucket, and then selecting the **Configuration** tab.
They are listed in a table under the header **Overview**.

## Create a service account file and key {#create-service-account}

<Permissions/>

### Create access keys {#create-access-keys}

<ServiceAccountKey/>

## Next steps

After completing the steps in this setup guide, you can now proceed with one of the following migration guides depending on which approach you would like to take:
- [**Migrate from BigQuery to ClickHouse Cloud using ClickPipes**](/migrations/bigquery/migrate-using-clickpipes)
- [**Migrate from BigQuery to ClickHouse Cloud with object-storage**](/migrations/bigquery/migrating-to-clickhouse-cloud)



