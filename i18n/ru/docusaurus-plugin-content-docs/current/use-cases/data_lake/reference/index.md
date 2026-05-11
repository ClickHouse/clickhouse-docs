---
description: 'Справочные руководства по подключению ClickHouse к каталогам озёр данных, включая AWS Glue, Unity, REST, Lakekeeper, Nessie и OneLake.'
pagination_prev: null
pagination_next: null
sidebar_position: 2
slug: /use-cases/data-lake/reference
title: 'Руководства по каталогам'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse интегрируется с рядом каталогов озёр данных с использованием движка базы данных [`DataLakeCatalog`](/engines/database-engines/datalakecatalog). В следующих руководствах показано, как подключить ClickHouse к каждому поддерживаемому каталогу, включая конфигурацию, аутентификацию и примеры выполнения запросов.

| Catalog | Description |
|---------|-------------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | Выполняйте запросы к таблицам Iceberg, зарегистрированным в AWS Glue Data Catalog, на основе данных, хранящихся в S3. |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | Подключитесь к Databricks Unity Catalog для работы с таблицами Delta Lake и Iceberg. |
| [Iceberg REST Catalog](/use-cases/data-lake/rest-catalog) | Используйте любой каталог, реализующий спецификацию Iceberg REST, например Tabular. |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Подключитесь к каталогу Lakekeeper для таблиц Iceberg. |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Выполняйте запросы к таблицам Iceberg, используя каталог Nessie с управлением версиями данных в стиле Git. |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Выполняйте запросы к таблицам Iceberg в Microsoft Fabric OneLake. |