---
slug: /cloud/get-started/cloud/use-cases/AI_ML
title: 'Machine learning and generative AI'
keywords: ['use cases', 'Machine Learning', 'Generative AI']
sidebar_label: 'Overview'
---

<iframe width="758" height="426" src="https://www.youtube.com/embed/GfvZHSdJ4CU?si=TSAhGGG862_82AJ8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## The rapidly evolving data landscape for Machine Learning and Generative AI {#the-rapidly-evolving-data-landscape-for-machine-learning-and-generative-ai}

Rapid advancements in Machine Learning and Generative AI are completely reshaping
how business and society operate, driving an ever-increasing demand for data on
an unparalleled scale.
At the time of writing, language training dataset size is growing on average 3.7x
per year, while it is projected that the largest training run will use all
public human-generated text by 2028. At the same time, users of these applications
increasingly expect real-time performance and the success of AI and ML-driven
insights, like personalized recommendations, accurate forecasting, or chatbots,
hinge on the ability to handle massive datasets in real-time. Against the backdrop
of these changes, traditional data architectures often face significant challenges
when it comes to meeting the scale and real-time requirements that modern AI/ML
workloads demand.

## Challenges of traditional data stacks for AI/ML workloads {#challenges-of-traditional-data-stacks}

Traditional database systems are often not designed for the massive analytical
workloads and complex queries inherent in modern ML and GenAI applications.
They frequently become bottlenecks as data volume grows and query complexity
increases, hindering the rapid processing required for AI. In addition to this,
machine learning architectures can become fragmented and challenging to handle
due to a proliferation of specialized tools and components which often leads to
higher learning curves, increased points of failure, and escalating expenses.
Real-time processing for ML faces significant challenges, including dealing with
the sheer volume and velocity of incoming data, minimizing latency and response
times, and continuously addressing issues like model drift and ensuring data
quality. These systems, designed for structured data at much smaller scales, often
take days or weeks when faced with terabytes or petabytes of data. Not only do
they become a performance bottleneck, but also a cost bottleneck, often relying
on expensive, close-coupled storage that does not scale cost effectively.

## ClickHouse as a foundation for real-time AI/ML {#clickhouse-for-real-time-ai-ml}

ClickHouse was designed and built from the ground up to tackle data at scale in
real-time. As such, it is ideally positioned for handling the requirements of
today’s AI and ML applications. Several core features enable it to ingest,
process and query datasets on the petabyte scale with real-time performance:

| Feature                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Columnar Storage**                   | ClickHouse utilizes a columnar storage model. This means that data from each column of an inserted row is stored together on disk, which enables significantly more efficient compression and boosts query speed by allowing the system to read only the relevant columns required for a query, which drastically reduces disk I/O. This is particularly advantageous for analytical queries common in ML/GenAI that often involve aggregations or filtering on a subset of columns.                                                                                                         |
| **High Performance**                   | ClickHouse offers for its lightning-fast query processing, capable of querying billions of rows in milliseconds. It achieves this through a fully parallelized query pipeline and vectorized query execution engine, which processes multiple rows simultaneously at the CPU level, maximizing efficiency.                                                                                                                                                                                                                                                                                   |
| **Scalability**                        | Designed for horizontal scalability, ClickHouse allows users to add more servers (nodes) to a cluster to handle increasing data volumes and query loads, distributing data and queries across them. Performance scales linearly with the addition of each new server, enabling it to easily handle petabytes of data.                                                                                                                                                                                                                                                                        |
| **Real-time data ingestion**           | It is built for continuous data ingestion, supporting high rates of inserts and merges (billions of rows per second, gigabytes per second) without disrupting ongoing queries or analytics. This capability is crucial for environments where data arrives in a constant stream, such as from IoT devices or application logs, ensuring that ML models are fueled with the most up-to-date information.                                                                                                                                                                                      |
| **Specialized data types & functions** | In addition to standard SQL data types, syntax and functions, ClickHouse offers a host of additional specialised data types and functions suited for ML use cases. Some of these include Array functions which natively support vector operations, distance calculations, array manipulations; Native JSON support for efficient processing of semi-structured data common to ML feature stores; Approximate algorithms like HyperLogLog, quantiles, and sampling functions for large-scale statistical analysis or numeric indexed vectors for vector aggregation and pointwise operations. |
| **Extensive integration ecosystem**    | ClickHouse's extensive integration ecosystem makes it exceptionally valuable for AI/ML applications by seamlessly connecting with every critical component of the ML toolchain—from Python/pandas and Jupyter for data science workflows, to Spark and Kafka for large-scale data processing, to Airflow for pipeline orchestration, and Grafana for model monitoring—eliminating the typical friction and data movement bottlenecks that plague multi-tool ML environments.                                                                                                                 |

## How ClickHouse helps simplify the AI/ML Data Stack {#simplify-the-ai-ml-data-stack}

ClickHouse streamlines the traditionally fragmented AI/ML data infrastructure
by serving as a unified platform that handles multiple data management
functions within a single high-performance system. Rather than maintaining
separate specialized data stores for different ML tasks, ClickHouse provides
a consolidated foundation for analytics, machine learning workloads, and
data preparation and exploration.

ClickHouse natively integrates with object storage like S3, GCP and Azure. It
integrates with data lakes, enabling direct querying of data in popular formats
like Iceberg, Delta Lake, and Hudi, positioning it as a comprehensive access and
computation layer for ML operations. This unified approach tackles challenges
faced in MLOps by reducing the complexity that typically stems from managing
multiple systems.

Data fragmentation across separate stores creates many operational pain
points such as escalating costs, increased failure risks, and the need for
duplicate transformation logic between training and inference pipelines.
ClickHouse addresses these issues by consolidating all of this functionality
into a single system, particularly for feature engineering where consistency
between offline training and online serving is critical.

Through its integration with data catalogs including Unity, AWS Glue, Polaris,
and Hive Metastore, ClickHouse minimizes data movement and duplication. This
architectural approach ensures that feature definitions remain consistent
across models and experiments, reducing the risk of discrepancies that can
undermine model performance. For MLOps teams, this
translates to less time managing infrastructure complexity and more focus on
core activities like model development and deployment, ultimately accelerating
the ML lifecycle while improving the economic viability of AI initiatives at
scale.

## ClickHouse across the AI/ML Lifecycle {#clickhouse-across-the-ai-ml-lifecycle}

ClickHouse's capabilities span the entire AI/ML lifecycle, providing a robust and
efficient platform from the very first stages of data preparation all the way to
model deployment and monitoring.

| Area                                                                                               | Description                                                                                              |
|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [Data preparation and feature engineering](/get-started/cloud/use-cases/AI_ML/feature_engineering) | Learn how ClickHouse is used in the data preparation and feature engineering stages of the AI/ML pipeline |
| [Agent-facing analytics](/cloud/get-started/cloud/use-cases/AI_ML/agent_facing_analytics)          | Learn how ClickHouse enables agentic facing analytics                                                    |
