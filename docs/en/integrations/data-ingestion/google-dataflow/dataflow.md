---
sidebar_label: Integrating Dataflow with ClickHouse
slug: /en/integrations/google-dataflow/dataflow
sidebar_position: 1
description: Users can ingest data into ClickHouse using Google Dataflow
---

# Integrating Google Dataflow with ClickHouse

[Google Dataflow](https://cloud.google.com/dataflow) is a fully managed stream and batch data processing service. It supports pipelines written in Java or Python and is built on the Apache Beam SDK.

There are two main ways to use Google Dataflow with ClickHouse, both are leveraging [`ClickHouseIO Apache Beam connector`](../../apache-beam):

## 1. Java Runner
The [Java Runner](./java-runner) allows users to implement custom Dataflow pipelines using the Apache Beam SDK `ClickHouseIO` integration. This approach provides full flexibility and control over the pipeline logic, enabling users to tailor the ETL process to specific requirements.
However, this option requires knowledge of Java programming and familiarity with the Apache Beam framework.

### Key Features
- High degree of customization.
- Ideal for complex or advanced use cases.
- Requires coding and understanding of the Beam API.

## 2. Predefined Templates
ClickHouse offers [predefined templates](./templates) designed for specific use cases, such as importing data from BigQuery into ClickHouse. These templates are ready-to-use and simplify the integration process, making them an excellent choice for users who prefer a no-code solution.

### Key Features
- No Beam coding required.
- Quick and easy setup for simple use cases.
- Suitable also for users with minimal programming expertise.

Both approaches are fully compatible with Google Cloud and the ClickHouse ecosystem, offering flexibility depending on your technical expertise and project requirements.  
