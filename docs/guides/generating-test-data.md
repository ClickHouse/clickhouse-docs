---
sidebar_label: 'Generating random test data'
title: 'Generating random test data in ClickHouse'
slug: /guides/generating-test-data
description: 'Learn about Generating Random Test Data in ClickHouse'
show_related_blogs: true
doc_type: 'guide'
keywords: ['random data', 'test data']
---

# Generating random test data in ClickHouse

Generating random data is useful when testing new use cases or benchmarking your implementation.
ClickHouse has a [wide range of functions for generating random data](/sql-reference/functions/random-functions) that, in many cases, avoid the need for an external data generator.

This guide provides several examples of how to generate random datasets in ClickHouse with different randomness requirements.

## Simple uniform dataset {#simple-uniform-dataset}

**Use-case**: Generate a quick dataset of user events with random timestamps and event types.

```sql
CREATE TABLE user_events (
  event_id UUID,
  user_id UInt32,
  event_type LowCardinality(String),
  event_time DateTime
) ENGINE = MergeTree
ORDER BY event_time;

INSERT INTO user_events
SELECT
  generateUUIDv4() AS event_id,
  rand() % 10000 AS user_id,
  arrayJoin(['click','view','purchase']) AS event_type,
  now() - INTERVAL rand() % 3600*24 SECOND AS event_time
FROM numbers(1000000);
```

* `rand() % 10000`: uniform distribution of 10k users
* `arrayJoin(...)`: randomly selects one of three event types
* Timestamps spread over the previous 24 hours

---

## Exponential distribution {#exponential-distribution}

**Use-case**: Simulate purchase amounts where most values are low, but a few are high.

```sql
CREATE TABLE purchases (
  dt DateTime,
  customer_id UInt32,
  total_spent Float32
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO purchases
SELECT
  now() - INTERVAL randUniform(1,1_000_000) SECOND AS dt,
  number AS customer_id,
  15 + round(randExponential(1/10), 2) AS total_spent
FROM numbers(500000);
```

* Uniform timestamps over recent period
* `randExponential(1/10)` — most totals near 0, offset by 15 as a minimum ([ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4])

---

## Time-distributed events (Poisson) {#poisson-distribution}

**Use-case**: Simulate event arrivals that cluster around a specific period (e.g., peak hour).

```sql
CREATE TABLE events (
  dt DateTime,
  event_type String
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO events
SELECT
  toDateTime('2022-12-12 12:00:00')
    - ((12 + randPoisson(12)) * 3600) AS dt,
  'click' AS event_type
FROM numbers(200000);
```

* Events peak around noon, with Poisson-distributed deviation

---

## Time-varying normal distribution {#time-varying-normal-distribution}

**Use-case**: Emulate system metrics (e.g., CPU usage) that vary over time.

```sql
CREATE TABLE cpu_metrics (
  host String,
  ts DateTime,
  usage Float32
) ENGINE = MergeTree
ORDER BY (host, ts);

INSERT INTO cpu_metrics
SELECT
  arrayJoin(['host1','host2','host3']) AS host,
  now() - INTERVAL number SECOND AS ts,
  greatest(0.0, least(100.0,
    randNormal(50 + 30*sin(toUInt32(ts)%86400/86400*2*pi()), 10)
  )) AS usage
FROM numbers(10000);
```

* `usage` follows a diurnal sine wave + randomness
* Values bounded to \[0,100]

---

## Categorical and nested data {#categorical-and-nested-data}

**Use-case**: Create user profiles with multi-valued interests.

```sql
CREATE TABLE user_profiles (
  user_id UInt32,
  interests Array(String),
  scores Array(UInt8)
) ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO user_profiles
SELECT
  number AS user_id,
  arrayShuffle(['sports','music','tech'])[1 + rand() % 3 : 1 + rand() % 3] AS interests,
  [rand() % 100, rand() % 100, rand() % 100] AS scores
FROM numbers(20000);
```

* Random array length between 1–3
* Three per-user scores for each interest

:::tip
Read the [Generating Random Data in ClickHouse](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse) blog for even more examples.
:::