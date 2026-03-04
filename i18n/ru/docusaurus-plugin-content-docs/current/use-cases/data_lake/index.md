---
description: 'Используйте ClickHouse для выполнения запросов, ускорения и анализа данных в открытых табличных форматах, таких как Apache Iceberg, Delta Lake, Apache Hudi и Apache Paimon.'
pagination_prev: null
pagination_next: use-cases/data_lake/getting-started/index
slug: /use-cases/data-lake
title: 'Лейкхаус данных (Data Lakehouse)'
keywords: ['озеро данных', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'glue', 'unity', 'rest', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse интегрируется с открытыми lakehouse-форматами таблиц, включая [Apache Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), [Apache Hudi](/engines/table-engines/integrations/hudi) и [Apache Paimon](/sql-reference/table-functions/paimon). Это позволяет пользователям подключать ClickHouse к данным, уже хранящимся в этих форматах в объектных хранилищах, объединяя аналитические возможности ClickHouse с их существующей инфраструктурой озера данных.

## Зачем использовать ClickHouse с открытыми табличными форматами? \{#why-clickhouse-uses-lake-formats\}

### Выполнение запросов к существующим данным на месте \{#querying-data-in-place\}

ClickHouse может выполнять запросы к открытым форматам таблиц напрямую в Объектном хранилище без дублирования данных. Организации, стандартизировавшиеся на использовании Iceberg, Delta Lake, Hudi или Paimon, могут подключить ClickHouse к существующим таблицам и сразу использовать его диалект SQL, аналитические функции и эффективный собственный Parquet‑ридер. Одновременно такие инструменты, как [clickhouse-local](/operations/utilities/clickhouse-local) и [chDB](/chdb), позволяют выполнять исследовательский разовый анализ по более чем 70 форматам файлов в удалённом хранилище, давая пользователям возможность интерактивно исследовать lakehouse‑наборы данных без какой‑либо инфраструктурной подготовки.

Пользователи могут добиться этого либо прямым чтением с использованием [табличных функций и Движков таблиц](/use-cases/data-lake/getting-started/querying-directly), либо [подключением к каталогу данных](/use-cases/data-lake/getting-started/connecting-catalogs).

### Real-time аналитические рабочие нагрузки с ClickHouse \{#real-time-with-clickhouse\}

Для рабочих нагрузок, требующих высокой параллельности и низкой задержки отклика, пользователи могут загружать данные из открытых табличных форматов в движок ClickHouse [MergeTree](/engines/table-engines/mergetree-family/mergetree). Это обеспечивает слой Real-time аналитики поверх данных, которые изначально хранятся в озере данных, поддерживая дашборды, оперативную отчетность и другие чувствительные к задержкам рабочие нагрузки, которые выигрывают от столбцового хранения и возможностей индексирования MergeTree.

См. руководство по началу работы по [ускорению аналитики с помощью MergeTree](/use-cases/data-lake/getting-started/accelerating-analytics).

## Возможности \{#capabilities\}

### Непосредственное чтение данных \{#read-data-directly\}

ClickHouse предоставляет [табличные функции](/sql-reference/table-functions) и [движки](/engines/table-engines/integrations) для прямого чтения открытых табличных форматов из объектного хранилища. Такие функции, как [`iceberg()`](/sql-reference/table-functions/iceberg), [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi) и [`paimon()`](/sql-reference/table-functions/paimon), позволяют пользователям выполнять запросы к таблицам в форматах озёр данных (data lake) в рамках SQL-выражения без какой-либо предварительной конфигурации. Существуют версии этих функций для большинства распространённых объектных хранилищ, таких как S3, Azure Blob Storage и GCS. Для этих функций также существуют эквивалентные Движки таблиц, которые можно использовать для создания таблиц в ClickHouse, ссылающихся на размещённые в объектном хранилище таблицы в форматах озёр данных, — что делает выполнение запросов более удобным.

См. наше руководство по началу работы: по [непосредственному выполнению запросов](/use-cases/data-lake/getting-started/querying-directly) или по [подключению к каталогу данных](/use-cases/data-lake/getting-started/connecting-catalogs).

### Публикация каталогов в виде баз данных \{#expose-catalogs-as-databases\}

Используя движок базы данных [`DataLakeCatalog`](/engines/database-engines/datalakecatalog), пользователи могут подключить ClickHouse к внешнему каталогу и представить его в виде базы данных. Таблицы, зарегистрированные в каталоге, отображаются как таблицы в ClickHouse, что позволяет прозрачно использовать весь спектр синтаксиса SQL ClickHouse и аналитических функций. Это означает, что пользователи могут выполнять запросы, объединения и агрегирования по таблицам, управляемым каталогом, как если бы это были собственные таблицы ClickHouse, пользуясь преимуществами оптимизации запросов, параллельного выполнения и возможностей чтения данных в ClickHouse.

Поддерживаемые каталоги:

| Catalog | Guide |
|---------|-------|
| AWS Glue | [Руководство по каталогу Glue](/use-cases/data-lake/glue-catalog) |
| Databricks Unity Catalog | [Руководство по каталогу Unity](/use-cases/data-lake/unity-catalog) |
| Iceberg REST Catalog | [Руководство по REST-каталогу](/use-cases/data-lake/rest-catalog) |
| Lakekeeper | [Руководство по каталогу Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie | [Руководство по каталогу Nessie](/use-cases/data-lake/nessie-catalog) |
| Microsoft OneLake | [Руководство по каталогу OneLake](/use-cases/data-lake/onelake-catalog) |

См. руководство по началу работы, посвящённое [подключению к каталогам](/use-cases/data-lake/getting-started/connecting-catalogs).

### Запись обратно в открытые табличные форматы \{#write-back-to-lakehouse-formats\}

ClickHouse поддерживает запись данных в открытые табличные форматы, что актуально в следующих сценариях:

* **Реальное время → долгосрочное хранение** — данные проходят через ClickHouse как через слой Real-time аналитики, и пользователям необходимо выгружать результаты в Iceberg или другие форматы для надежного и экономичного долгосрочного хранения.
* **Reverse ETL** — пользователи выполняют преобразования в ClickHouse с помощью materialized view или запланированных запросов и хотят сохранять результаты в открытые табличные форматы для использования другими инструментами в экосистеме данных.

См. руководство по началу работы, посвящённое [записи в озера данных](/use-cases/data-lake/getting-started/writing-data).

## Следующие шаги \{#next-steps\}

Готовы попробовать? В [руководстве по началу работы](/use-cases/data-lake/getting-started) показано, как выполнять запросы непосредственно к открытым табличным форматам, подключаться к каталогу, загружать данные в MergeTree для быстрой аналитики и записывать результаты обратно — всё в рамках единого сквозного процесса.