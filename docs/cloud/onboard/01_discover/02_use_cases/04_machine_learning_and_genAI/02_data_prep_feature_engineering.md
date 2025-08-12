---
slug: /cloud/get-started/cloud/use-cases/AI_ML/feature_engineering
title: 'Data preparation and feature engineering'
keywords: ['use cases', 'Machine Learning', 'Generative AI']
sidebar_label: 'Data preparation and feature engineering'
---

import Image from '@theme/IdealImage';
import ml_ai_01 from '@site/static/images/cloud/onboard/discover/use_cases/ml_ai_01.png';
import ml_ai_02 from '@site/static/images/cloud/onboard/discover/use_cases/ml_ai_02.png';
import ml_ai_03 from '@site/static/images/cloud/onboard/discover/use_cases/ml_ai_03.png';
import ml_ai_04 from '@site/static/images/cloud/onboard/discover/use_cases/ml_ai_04.png';

## Data preparation and feature engineering {#data-preparation-and-feature-engineering}

Data preparation bridges raw data and effective machine learning or AI
models, typically consuming the majority of time in AI/ML projects and
directly determining model success. It sits between initial data collection
and model development in the lifecycle, transforming messy, inconsistent
real-world data into clean, structured formats that algorithms can
effectively learn from. `clickhouse-local`, `chDB` (an in-process version
of ClickHouse for Python), open-source ClickHouse server or ClickHouse Cloud
allow developers and data scientists to work with ever-growing amounts of
data interactively and efficiently for ad-hoc querying, data cleaning, and
feature engineering. 

### What is a feature store? {#what-is-a-feature-store}

In its simplest form, a feature store is a centralized repository for storing
and managing feature data and acting as the source of truth. By providing
APIs that allow the storage, versioning, and retrieval of features, feature
stores aim to provide a consistent view of features for training and
inference from development to production environments. Whether a custom-built
in-house solution or off-the-shelf product, actual product-level features
provided by a feature store will vary, with some providing a complete data
platform capable of aggregating data into features and even providing a
compute engine for the training of models.

Irrespective of how many capabilities are inherent to the feature store, all
provide abstractions to the underlying data with which data scientists and
engineers will be familiar. As well as delivering data as versioned
entities, features, and classes, most expose concepts of feature groups,
training sets, batching, streaming, and point-in-time queries (such as the
ability to identify the values for a feature at either a specific point,
e.g. the latest value).

<Image img={ml_ai_01} alt="Feature store" size="md" />

### Why might you use one? {#why-use-one}

In theory, a feature store ties disparate systems and capabilities together to 
form a complete ML data layer, capable of both acting as the source of truth for
training data and also being used to provide context when predictions are being
made.

While the exact capabilities they provide vary, the objectives remain the same:

- **improve collaboration and reusability** between data scientists and data 
engineers by centralizing features and their transformation logic
- **reduce model iteration time** during both experimentation and deployment by 
allowing feature re-use at both training and inference time
- **governance and compliance** through rules and versioning which can restrict 
model access to sensitive data (and features)
- **improve model performance and reliability** by abstracting the complexity of
data engineering from data scientists and ensuring they work with only quality 
consistent features delivered through an API.

While these represent a very high-level overview of some of the problems a
feature store solves, the predominant benefit here is the ability to share
features across teams and utilize the same data for training and inference.

Feature stores also address a number of other challenges present in MLOps,
such as how to backfill feature data, handle incremental updates to the
source data (to update features), or monitor new data for drift. More
recently, they have also integrated vector databases to act as the
orchestration layer for RAG pipelines or to help find similar features
using embeddings - a useful capability during some model training.

### Components of a feature store {#components-of-a-feature-store}

Before we explore how ClickHouse might fit into a feature store, understanding 
the common components is helpful for context. Typically, a feature store will 
consist of up to 4 main components:

<Image img={ml_ai_02} alt="Components of a feature store" size="md" />

- **Data source** - While this can be as simple as a CSV file, it is often a
database or data lake with files in a format like Iceberg and accessible
through a query engine.

- **Transformation engine (optional)** - Raw data needs to be transformed into
features. In a simple case, a feature can be correlated with a column's
values. More likely, it is the result of a transformation process involving
joins, aggregations, and expressions changing the structure and/or type of
column values. Some feature stores (see Types of Feature Store) might
provide built-in capabilities to achieve this; others may offload the work
to local Python functions or, for larger datasets, the database (maybe even
using dbt under the hood) via materializations, or a processing engine such
as Spark. With ClickHouse, this is achievable through Materialized Views.
Features that are continuously subject to update often require some form of
streaming pipeline, typically implemented with tooling such as Flink or
Spark Streaming. Normally, some form of directed acyclic graph (DAG) is
required, if these transformations are chained, and dependencies need to be
tracked.

- **Offline (Training) Store** - The offline store holds the features
resulting from the previous transformation pipeline. These features are
typically grouped as entities and associated with a label (the target
prediction). Usually, models need to consume these features selectively,
either iteratively or through aggregations, potentially multiple times and
in random order. Models often require more than one feature, requiring
features to be grouped together in a "feature group" - usually by an entity
ID and time dimension. This requires the offline store to be able to deliver
the correct version of a feature and label for a specific point in time.
This "point-in-time correctness" is often fundamental to models, which need
to be trained incrementally.

- **Online (Interference) Store** - Once a model has been trained, it can be
deployed and used for making predictions. This inference process requires
information that is only available at the moment of prediction, e.g. the
user's ID for a transaction. However, it can also require features for the
prediction, which may be precomputed, e.g. features representing historical
purchases. These are often too expensive to compute at inference time, even
for ClickHouse. These features need to be served in latency-sensitive
situations, based on the most recent version of the data, especially in
scenarios, where predictions need to be made in real-time, such as fraud
detection. Features may be materialized from the offline store to the online
store for serving.

### Feature stores and ClickHouse {#feature-stores-and-clickhouse}

As a real-time data warehouse, ClickHouse can fulfill the role of a number
of the components - potentially significantly simplifying the feature store
architecture.

<Image img={ml_ai_03} alt="Feature stores and ClickHouse" size="md" />

Specifically, ClickHouse can act as a:

- **Data source** - With the ability to query or ingest data in over 70
different file formats, including data lake formats such as Iceberg and
Delta Lake, ClickHouse makes an ideal long-term store holding or querying
data. By separating storage and compute using object storage, ClickHouse
Cloud additionally allows data to be held indefinitely - with compute scaled
down or made completely idle to minimize costs. Flexible codecs, coupled
with column-oriented storage and ordering of data on disk, maximize
compression rates, thus minimizing the required storage. Users can easily
combine ClickHouse with data lakes, with built-in functions to query data in
place on object storage.

- **Transformation engine** - SQL provides a natural means of declaring data
  transformations. When extended with ClickHouse's analytical and statistical
  functions, these transformations become succinct and optimized. As well as
  applying to either ClickHouse tables, in cases where ClickHouse is used as a
  data store, table functions allow SQL queries to be written against data
  stored in formats such as Parquet, on-disk or object storage, or even other
  data stores such as Postgres and MySQL. A completely parallelization query
  execution engine, combined with a column-oriented storage format, allows
  ClickHouse to perform aggregations over PBs of data in seconds - unlike
  transformations on in memory data frames, users are not memory-bound.
  Furthermore, materialized views allow data to be transformed at insert time,
  thus overloading compute to data load time from query time. These views can
  exploit the same range of analytical and statistical functions ideal for
  data analysis and summarization. Should any of ClickHouse's existing
  analytical functions be insufficient or custom libraries need to be
  integrated, users can also utilize User Defined Functions (UDFs).

  While users can transform data directly in ClickHouse or prior to insertion
  using SQL queries, ClickHouse can also be used in programming environments
  such as Python via chDB. This allows embedded ClickHouse to be exposed as a
  Python module and used to transform and manipulate large data frames within
  notebooks. This allows transformation work to be performed client-side by
  data engineers, with results potentially materialized as feature tables in
  a centralized ClickHouse instance.

- **Offline store** - With the above capabilities to read data from multiple
  sources and apply transformations via SQL, the results of these queries can
  also be persisted in ClickHouse via `INSERT INTO SELECT` statements. With
  transformations often grouped by an entity ID and returning a number of
  columns as results, ClickHouse's schema inference can automatically detect
  the required types from these results and produce an appropriate table
  schema to store them. Functions for generating random numbers and
  statistical sampling allow data to be efficiently iterated and scaled at
  millions or rows per second for feeding to model training pipelines.

  Often, features are represented in tables with a timestamp indicating the
  value for an entity and feature at a specific point in time. As described
  earlier, training pipelines often need the state of features at specific
  points in time and in groups. ClickHouse's sparse indices allow fast
  filtering of data to satisfy point-in-time queries and feature selection
  filters. While other technologies such as Spark, Redshift, and BigQuery
  rely on slow stateful windowed approaches to identify the state of features
  at a specific point in time, ClickHouse supports the `ASOF` (as-of-this-time)
  `LEFT JOIN` query and `argMax` function. As well as simplifying syntax, this
  approach is highly performant on large datasets through the use of a sort
  and merge algorithm. This allows feature groups to be built quickly,
  reducing data preparation time prior to training.

  <Image img={ml_ai_04} alt="ClickHouse as an offline store" size="md" />

- **Online store** - As a real-time analytics database, ClickHouse can serve highly 
  concurrent query workloads at low latency. While this requires data to be typically
  denormalized, this aligns with the storage of feature groups used at both training
  and inference time. Importantly, ClickHouse is able to deliver this query 
  performance while being subject to high write workloads thanks to its log-structured
  merge tree. These properties are required in an online store to keep features 
  up-to-date. Since the features are already available within the offline store, 
  they can easily be materialized to new tables within either the same ClickHouse 
  cluster or a different instance via existing capabilities, e.g., [`remoteSecure`](/sql-reference/table-functions/remote#parameters).

  :::note
  For use cases requiring very high request concurrency i.e., thousands per second, 
  and very low latency, we recommend users still consider a dedicated data store, 
  e.g., Redis, designed for these workloads.
  :::

- **Vector database** - ClickHouse has built-in support for vector embeddings 
  through floating point arrays. These can be searched and compared through 
  [distance functions](https://clickhouse.com/docs/en/sql-reference/functions/distance-functions#cosinedistance),
  allowing ClickHouse to be used as a vector database. This linear comparison can 
  be easily scaled and parallelized for larger datasets. Additionally, ClickHouse
  has maturing support for [Approximate Nearest Neighbour (ANN)](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes)
  indices, as well as [hyperplane indexes using pure-SQL](https://clickhouse.com/blog/approximate-nearest-neighbour-ann-with-sql-powered-local-sensitive-hashing-lsh-random-projections),
  as required for larger vector datasets.

By satisfying each of the above roles, ClickHouse can dramatically simplify
the feature store architecture. Aside from the simplification of operations,
this architecture allows features to be built and deployed faster. A single
instance of ClickHouse can be scaled vertically to handle PBs of data, with
additional instances simply added for high availability. This minimizes the
movement of data between data stores, minimizing the typical network
bottlenecks. ClickHouse Cloud expands on this further by storing only a
single copy of the data in object storage and allowing nodes to be scaled
vertically or horizontally dynamically in response to load as required.

The above architecture still requires several key components not satisfied
by ClickHouse: a streaming engine such as Kafka + Flink and a framework to
provide compute for model training. A means of hosting models is also
required. For simplicity, we assume the use of a cloud-hosted solution to
these, such as Confluent and Amazon SageMaker.
