---
sidebar_label: Dataset
sidebar_position: 20
title: Dataset
slug: /en/migrations/postgresql/dataset
description: Stackoverflow dataset for PostgreSQL
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres]
---

As an example dataset to show a typical migration from Postgres to ClickHouse, we use the Stack Overflow dataset documented[ here](/docs/en/getting-started/example-datasets/stackoverflow). This contains every post, vote, user, comment, and badge that has occurred on Stack Overflow from 2008 to Apr 2024. The Postgres schema for this data is shown below:

<img src={require('./images/stackoverflow_postgres.png').default} class="image" alt="Stack Overflow in Postgres" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}}/>

_DDL commands [here](https://github.com/ClickHouse/clickhouse-docs/blob/main/docs/en/migrations/assets/stackoverflow_ddl.md)_

This schema, while not necessarily the most optimal, exploits a number of popular Postgres features, including primary keys, foreign keys, partitioning, and indexes.

We will migrate each of these concepts to their ClickHouse equivalents.

For those users who wish to populate this dataset into a Postgres instance to test migration steps, we have provided the data in `pg_dump` format for download with the DDL, and subsequent data load commands are shown below:

```bash
# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql

# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql

# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql

# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql

# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql

# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql

# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```
