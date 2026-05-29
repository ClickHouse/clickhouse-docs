---
slug: /migrations/bigquery
title: 'BigQuery'
pagination_prev: null
pagination_next: null
description: 'Landing page for the BigQuery migrations section'
keywords: ['BigQuery', 'migration']
doc_type: 'landing-page'
---

This section covers everything you need to migrate from BigQuery to ClickHouse Cloud.
Start with the overview to see how the two systems compare, then pick a migration path:
ClickPipes for managed change data capture, or GCS bulk-load for a one-shot export and import.
Both walk-throughs use the Stack Overflow dataset as a worked example, and the best practices guide covers schema design and performance tuning.

| Page                                                                                          | Description                                                                                                                                            |
|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](/migrations/bigquery/biquery-vs-clickhouse-cloud)                                  | An overview of the similarities and differences between BigQuery and ClickHouse Cloud, covering resource hierarchy, data types, query features, and more. |
| [Example BigQuery project](/migrations/bigquery/dataset-setup)                                | How to set up the Stack Overflow example dataset in a BigQuery project to follow along with the migration guides.                                      |
| [Migrate using ClickPipes](/migrations/bigquery/migrate-using-clickpipes)                     | A step-by-step guide to migrating the Stack Overflow dataset from BigQuery to ClickHouse Cloud using ClickPipes, the managed CDC solution.             |
| [Migrate using GCS bulk-load](/migrations/bigquery/migrating-to-clickhouse-cloud)             | A step-by-step guide to migrating the Stack Overflow dataset from BigQuery to ClickHouse Cloud by bulk-loading from a Google Cloud Storage bucket.     |
| [Best practices](/migrations/bigquery/best-practices)                                         | Recommended best practices to follow when migrating from BigQuery to ClickHouse Cloud.                                                                 |
