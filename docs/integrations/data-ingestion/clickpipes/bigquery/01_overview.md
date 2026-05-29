---
sidebar_label: 'Overview'
description: 'How to export data from BigQuery to ClickHouse Cloud using ClickPipes.'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'Integrating BigQuery with ClickHouse Cloud'
doc_type: 'guide'
---

import IntroClickPipe from '@site/docs/_snippets/clickpipes/bigquery/_intro.md';
import Permissions from '@site/docs/_snippets/clickpipes/bigquery/_permissions.md';
import ServiceAccountKey from '@site/docs/_snippets/clickpipes/bigquery/_service-account-key.md';

<IntroClickPipe/>

## Features {#features}

### Initial load {#initial-load}

The BigQuery ClickPipe will load selected tables in a BigQuery [dataset](https://docs.cloud.google.com/bigquery/docs/datasets-intro) into the ClickHouse destination tables in a single batch operation. Once the ingestion task completes, the ClickPipe stops automatically. The initial load ingestion process requires a user-provided Google Cloud Storage (GCS) bucket for staging. In the future, the intermediary bucket will be provided and managed by ClickPipes.

:::note
ClickPipes relies on batch extract jobs to fetch data from BigQuery into the staging GCS bucket. This operations incurs **no processing charges** in BigQuery.
:::

### CDC (Change Data Capture) {#cdc}

CDC is **not supported** in Private Preview, but will be supported in the future. In the meantime, we recommend using the [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) to continuously sync BigQuery data exports into ClickHouse Cloud once the initial load is completed.

## Data type mapping {#data-type-mapping}

[BigQuery data types](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types).

| BigQuery Data Type | ClickHouse Data Type | Details                                                           |
|--------------------|----------------------|-------------------------------------------------------------------|
| `BOOL`             | `Bool`               |                                                                   |
| `INT64`            | `Int64`              |                                                                   |
| `FLOAT64`          | `Float64`            |                                                                   |
| `NUMERIC`          | `Decimal(P, S)`      | Precision up to 38, scale up to 9. Precision/scale is preserved.  |
| `BIGNUMERIC`       | `Decimal(P, S)`      | Precision up to 76, scale up to 38. Precision/scale is preserved. |
| `STRING`           | `String`             |                                                                   |
| `BYTES`            | `String`             |                                                                   |
| `JSON`             | `String` (JSON)      |                                                                   |
| `DATE`             | `Date`               |                                                                   |
| `TIME`             | `String`             | Microsecond precision.                                            |
| `DATETIME`         | `DateTime`           | Microsecond precision.                                            |
| `TIMESTAMP`        | `DateTime64(6)`      | Microsecond precision.                                            |
| `GEOGRAPHY`        | `String`             |                                                                   |
| `GEOMETRY`         | `String`             |                                                                   |
| `UUID`             | `String`             |                                                                   |
| `ARRAY<T>`         | `Array(T)`           |                                                                   |
| `ARRAY<DATE>`      | `Array(Date)`        |                                                                   |
| `STRUCT` (RECORD)  | `String`             |                                                                   |

## Access control {#access-control}

### Authentication {#authentication}

#### Service account credentials {#service-account-credentials}

<Permissions/>

<ServiceAccountKey/>
