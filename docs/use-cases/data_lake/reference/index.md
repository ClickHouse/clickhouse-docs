---
description: 'Reference guides for connecting ClickHouse to data lake catalogs including AWS Glue, Unity, REST, Lakekeeper, Nessie, and OneLake.'
pagination_prev: null
pagination_next: null
sidebar_position: 2
slug: /use-cases/data-lake/reference
title: 'Catalog guides'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse integrates with a range of data lake catalogs through the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine. The following guides walk through connecting ClickHouse to each supported catalog, including configuration, authentication, and querying examples.

| Catalog | Description |
|---------|-------------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | Query Iceberg tables registered in the AWS Glue Data Catalog from data stored in S3. |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | Connect to Databricks Unity Catalog for Delta Lake and Iceberg tables. |
| [Iceberg REST Catalog](/use-cases/data-lake/rest-catalog) | Use any catalog implementing the Iceberg REST specification, such as Tabular. |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Connect to the Lakekeeper Catalog for Iceberg tables. |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Query Iceberg tables using the Nessie Catalog with Git-like data version control. |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Query Iceberg tables in Microsoft Fabric OneLake. |
