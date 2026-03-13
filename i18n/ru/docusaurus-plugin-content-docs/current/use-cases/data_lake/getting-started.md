---
title: 'Начало работы с форматами таблиц lakehouse'
sidebar_label: 'Начало работы'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: null
pagination_next: use-cases/data_lake/guides/querying-directly
description: 'Практическое введение в выполнение запросов, ускорение и запись данных обратно в открытых форматах таблиц с ClickHouse.'
keywords: ['озера данных', 'lakehouse', 'начало работы', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import iceberg_query_direct from '@site/static/images/datalake/iceberg-query-direct.png';
import iceberg_query_engine from '@site/static/images/datalake/iceberg-query-engine.png';
import iceberg_query from '@site/static/images/datalake/iceberg-query.png';
import clickhouse_query from '@site/static/images/datalake/clickhouse-query.png';

# Начало работы с озерами данных \{#data-lake-getting-started\}

:::note[Вкратце]
Практическое руководство по выполнению запросов к таблицам озера данных, ускорению их с помощью MergeTree и записи результатов обратно в Iceberg. Во всех шагах используются общедоступные наборы данных; они работают как в Cloud, так и в OSS.
:::

Скриншоты в этом руководстве взяты из SQL-консоли [ClickHouse Cloud](https://console.clickhouse.cloud). Все запросы работают как в Cloud, так и в самоуправляемых развертываниях.

<VerticalStepper headerLevel="h2">
  ## Прямые запросы к данным Iceberg \{#query-directly\}

  Самый быстрый способ начать работу — использовать табличную функцию [`icebergS3()`](/sql-reference/table-functions/iceberg): укажите на таблицу Iceberg в S3 и сразу выполняйте запросы — никакой предварительной настройки не требуется.

  Изучите схему:

  ```sql
  DESCRIBE icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  Выполните запрос:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_direct} alt="Запрос к Iceberg" />

  ClickHouse считывает метаданные Iceberg напрямую из S3 и автоматически определяет схему. Тот же подход применим для [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi) и [`paimon()`](/sql-reference/table-functions/paimon).

  **Подробнее:** [Прямые запросы к открытым табличным форматам](/use-cases/data-lake/getting-started/querying-directly) — описание всех четырёх форматов, кластерных вариантов для распределённого чтения и параметров серверной части хранилища (S3, Azure, HDFS, локальное).

  ## Создание постоянного табличного движка \{#table-engine\}

  Для многократного доступа создайте таблицу с использованием движка таблиц Iceberg, чтобы не указывать путь каждый раз. Данные остаются в S3 — никакого дублирования данных не происходит:

  ```sql
  CREATE TABLE hits_iceberg
      ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  Теперь выполните запрос к ней, как к любой таблице ClickHouse:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_engine} alt="Запрос к Iceberg" />

  Движок таблиц поддерживает кэширование данных, кэширование метаданных, эволюцию схемы и перемещение во времени. Подробнее о возможностях движка таблиц см. в руководстве [Прямые запросы](/use-cases/data-lake/getting-started/querying-directly), а полное сравнение функций — в [матрице поддержки](/use-cases/data-lake/support-matrix).

  ## Подключение к каталогу \{#connect-catalog\}

  Большинство организаций управляют таблицами Iceberg через каталог данных для централизации метаданных таблиц и упрощения их обнаружения. ClickHouse поддерживает подключение к каталогу с помощью движка базы данных [`DataLakeCatalog`](/engines/database-engines/datalakecatalog), предоставляя все таблицы каталога как базу данных ClickHouse. Это более масштабируемый подход: по мере создания новых таблиц Iceberg они автоматически становятся доступны в ClickHouse без каких-либо дополнительных действий.

  Ниже приведён пример подключения к [AWS Glue](/use-cases/data-lake/glue-catalog):

  ```sql
  CREATE DATABASE my_lake
  ENGINE = DataLakeCatalog
  SETTINGS
      catalog_type = 'glue',
      region = '<your-region>',
      aws_access_key_id = '<your-access-key>',
      aws_secret_access_key = '<your-secret-key>'
  ```

  Каждый тип каталога требует собственных настроек подключения — полный список поддерживаемых каталогов и их параметров конфигурации см. в [руководствах по каталогам](/use-cases/data-lake/reference).

  Просматривайте таблицы и выполняйте запросы:

  ```sql
  SHOW TABLES FROM my_lake;
  ```

  ```sql
  SELECT count(*) FROM my_lake.`<database>.<table>`
  ```

  :::note
  Обратные кавычки вокруг `<database>.<table>` обязательны, поскольку ClickHouse не поддерживает более одного пространства имён нативно.
  :::

  **Подробнее:** [Подключение к каталогу данных](/use-cases/data-lake/getting-started/connecting-catalogs) — полное руководство по настройке Unity Catalog с примерами для Delta и Iceberg.

  ## Выполнение запроса \{#issue-query\}

  Независимо от того, какой метод вы использовали выше — табличная функция, движок таблиц или каталог — один и тот же ClickHouse SQL работает во всех случаях:

  ```sql
  -- Table function
  SELECT url, count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Table engine
  SELECT url, count() AS cnt
  FROM hits_iceberg
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Catalog
  SELECT url, count() AS cnt
  FROM my_lake.`<database>.<table>`
  GROUP BY url ORDER BY cnt DESC LIMIT 5
  ```

  Синтаксис запроса идентичен — изменяется только секция `FROM`. Все функции SQL ClickHouse, объединения и агрегации работают одинаково вне зависимости от источника данных.

  ## Загрузка подмножества данных в ClickHouse \{#load-data\}

  Выполнение запросов к Iceberg напрямую удобно, однако производительность ограничена пропускной способностью сети и структурой файлов. Для аналитических нагрузок загружайте данные в нативную таблицу MergeTree.

  Сначала выполните отфильтрованный запрос к таблице Iceberg, чтобы получить базовые показатели:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  Этот запрос сканирует весь набор данных в S3, поскольку Iceberg не учитывает фильтр `counterid` — выполнение может занять несколько секунд.

  <Image img={iceberg_query} alt="Запрос к Iceberg" />

  Теперь создайте таблицу MergeTree и загрузите данные:

  ```sql
  CREATE TABLE hits_clickhouse
  (
      url String,
      eventtime DateTime,
      counterid UInt32
  )
  ENGINE = MergeTree()
  ORDER BY (counterid, eventtime);
  ```

  ```sql
  INSERT INTO hits_clickhouse
  SELECT url, eventtime, counterid
  FROM hits_iceberg
  ```

  Повторно выполните тот же запрос к таблице MergeTree:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={clickhouse_query} alt="Запрос к ClickHouse" />

  Поскольку `counterid` является первым столбцом в ключе `ORDER BY`, разреженный первичный индекс ClickHouse переходит непосредственно к нужным гранулам — считывая только строки, где `counterid = 38`, вместо сканирования всех 100 миллионов строк. Это обеспечивает значительное ускорение.

  Руководство [по ускорению аналитики](/use-cases/data-lake/getting-started/accelerating-analytics) развивает эту тему, рассматривая типы `LowCardinality`, полнотекстовые индексы и оптимизированные ключи сортировки, и демонстрирует **~40-кратное ускорение** на наборе данных из 283 миллионов строк.

  **Подробнее:** [Ускорение аналитики с MergeTree](/use-cases/data-lake/getting-started/accelerating-analytics) — оптимизация схемы, полнотекстовое индексирование и полное сравнение производительности до и после.

  ## Запись данных обратно в Iceberg \{#write-back\}

  ClickHouse также может записывать данные обратно в таблицы Iceberg, обеспечивая обратные ETL-процессы — публикацию агрегированных результатов или подмножеств данных для использования другими инструментами (Spark, Trino, DuckDB и др.).

  Создайте таблицу Iceberg для вывода данных:

  ```sql
  CREATE TABLE output_iceberg
  (
      url String,
      cnt UInt64
  )
  ENGINE = IcebergS3('https://your-bucket.s3.amazonaws.com/output/', 'access_key', 'secret_key')
  ```

  Запись агрегированных результатов:

  ```sql
  SET allow_experimental_insert_into_iceberg = 1;

  INSERT INTO output_iceberg
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  GROUP BY url
  ORDER BY cnt DESC
  ```

  Полученная таблица Iceberg доступна для чтения в любом совместимом с Iceberg движке.

  **Подробнее:** [Запись данных в открытые табличные форматы](/use-cases/data-lake/getting-started/writing-data) — запись необработанных данных и агрегированных результатов на основе набора данных UK Price Paid, включая вопросы проектирования схемы при сопоставлении типов ClickHouse с форматом Iceberg.
</VerticalStepper>

## Следующие шаги \{#next-steps\}

Теперь, когда вы увидели весь процесс целиком, изучите подробнее каждое направление:

* [Выполнение запросов напрямую](/use-cases/data-lake/getting-started/querying-directly) — Все четыре формата, варианты кластеров, Движки таблиц, кэширование
* [Подключение к каталогам](/use-cases/data-lake/getting-started/connecting-catalogs) — Полное руководство по Unity Catalog с Delta и Iceberg
* [Ускорение аналитики](/use-cases/data-lake/getting-started/accelerating-analytics) — Оптимизация схемы, индексирование, демонстрация ускорения примерно в 40 раз
* [Запись в озера данных](/use-cases/data-lake/getting-started/writing-data) — Запись сырых данных, агрегированная запись, сопоставление типов
* [Матрица поддержки](/use-cases/data-lake/support-matrix) — Сравнение возможностей в разных форматах и бэкендах хранения