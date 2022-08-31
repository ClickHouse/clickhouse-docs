---
sidebar_label: Introduction
sidebar_position: 1
slug: /en/integrations/dbt/dbt-intro
description: Users can transform and model their data in ClickHouse using dbts
---

# ClickHouse and dbt

**dbt** (data build tool) enables analytics engineers to transform data in their warehouses by simply writing select statements. dbt handles materializing these select statements into objects in the database in the form of tables and views - performing the T of [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform). Users can create a model defined by a SELECT statement.

Within dbt, these models can be cross-referenced and layered to allow the construction of higher-level concepts. The boilerplate SQL required to connect models is automatically generated. Furthermore, dbt identifies dependencies between models and ensures they are created in the appropriate order using a directed acyclic graph (DAG).

Dbt is compatible with ClickHouse through a [ClickHouse-supported plugin](https://github.com/ClickHouse/dbt-clickhouse). We describe the process for connecting ClickHouse with a simple example based on a publicly available IMDB dataset. We additionally highlight some of the limitations of the current connector.

# Concepts

dbt introduces the concept of a model. This is defined as a SQL statement, potentially joining many tables. A model can be “materialized” in a number of ways. A materialization represents a build strategy for the model’s select query. The code behind a materialization is boilerplate SQL that wraps your SELECT query in a statement in order to create a new or update an existing relation.

dbt provides 4 types of materialization:

* **view** (default): The model is built as a view in the database.
* **table**: The model is built as a table in the database.
* **ephemeral**: The model is not directly built in the database but is instead pulled into dependent models as common table expressions.
* **incremental**: The model is initially materialized as a table, and in subsequent runs, dbt inserts new rows and updates changed rows in the table.

Additional syntax and clauses define how these models should be updated if their underlying data changes. dbt generally recommends starting with the view materialization until performance becomes a concern. The table materialization provides a query time performance improvement by capturing the results of the model’s query as a table at the expense of increased storage. The incremental approach builds on this further to allow subsequent updates to the underlying data to be captured in the target table.

The[ current plugin](https://github.com/silentsokolov/dbt-clickhouse) for ClickHouse supports the **view**, **table,** and **incremental** materializations. Ephemeral is not supported. The plugin also supports dbt[ snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) and[ seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) which we explore in this guide.

For the following guides, we assume you have a ClickHouse instance available.
