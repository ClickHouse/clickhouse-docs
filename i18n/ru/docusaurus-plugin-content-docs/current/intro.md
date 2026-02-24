---
slug: /intro
sidebar_label: 'Что такое ClickHouse?'
description: 'ClickHouse® — это столбцовая система управления базами данных (СУБД) SQL для онлайн-аналитической обработки (OLAP). Она доступна как в виде программного обеспечения с открытым исходным кодом, так и в виде облачного сервиса.'
title: 'Что такое ClickHouse?'
keywords: ['ClickHouse', 'столбцовая база данных', 'OLAP-база данных', 'аналитическая база данных', 'высокопроизводительная база данных']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® — высокопроизводительная колоночная система управления базами данных (СУБД) SQL для онлайн-аналитической обработки (OLAP). Она доступна как в виде [программного обеспечения с открытым исходным кодом](https://github.com/ClickHouse/ClickHouse), так и как [облачный сервис](https://clickhouse.com/cloud).


## Что такое аналитика? \{#what-are-analytics\}

Аналитика, также известная как OLAP (Online Analytical Processing), — это SQL‑запросы со сложными вычислениями (например, агрегациями, обработкой строк, арифметикой) по очень большим наборам данных.

В отличие от транзакционных запросов (или OLTP, Online Transaction Processing), которые читают и записывают всего несколько строк за запрос и поэтому выполняются за миллисекунды, аналитические запросы обычно обрабатывают миллиарды и триллионы строк.

Во многих вариантах использования [аналитические запросы должны выполняться в режиме реального времени](https://clickhouse.com/engineering-resources/what-is-real-time-analytics), то есть возвращать результат за время менее одной секунды.

## Построчное и колоночное хранение данных \{#row-oriented-vs-column-oriented-storage\}

Такой уровень производительности достигается только при правильной «ориентации» данных.

Базы данных хранят данные либо [построчно, либо по столбцам](https://clickhouse.com/engineering-resources/what-is-columnar-database).

В построчной базе данных последовательные строки таблицы хранятся одна за другой. Такое расположение позволяет быстро получать строки, так как значения всех столбцов одной строки хранятся вместе.

ClickHouse — это колоночная база данных. В таких системах таблицы хранятся как набор столбцов, то есть значения каждого столбца располагаются последовательно одно за другим. Это затрудняет восстановление отдельных строк (так как между значениями строк появляются разрывы), но операции над столбцами, такие как фильтрация или агрегация, становятся значительно быстрее, чем в построчной базе данных.

Различие лучше всего проиллюстрировать на примере запроса, выполняемого по 100 миллионам строк [реальных анонимизированных данных веб-аналитики](/getting-started/example-datasets/metrica):

```sql
SELECT MobilePhoneModel, COUNT() AS c
FROM metrica.hits
WHERE
      RegionID = 229
  AND EventDate >= '2013-07-01'
  AND EventDate <= '2013-07-31'
  AND MobilePhone != 0
  AND MobilePhoneModel not in ['', 'iPad']
GROUP BY MobilePhoneModel
ORDER BY c DESC
LIMIT 8;
```

Вы можете [запустить этот запрос в ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs\&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ\&run_query=true), который выбирает и фильтрует [лишь несколько из более чем 100](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7\&tab=results\&run_query=true) существующих столбцов и возвращает результат за миллисекунды:

<Image img={column_example} alt="Пример запроса в колонко-ориентированной базе данных" size="lg" />

Как видно из раздела статистики на диаграмме выше, запрос обработал 100 миллионов строк за 92 миллисекунды, что соответствует пропускной способности примерно чуть более 1 миллиарда строк в секунду или чуть менее 7 ГБ переданных данных в секунду.

**Строко-ориентированная СУБД**

В строко-ориентированной базе данных, даже если приведенный выше запрос обрабатывает только несколько столбцов из существующих, системе все равно необходимо загрузить данные из других существующих столбцов с диска в память. Причина в том, что данные хранятся на диске в фрагментах, называемых [блоками](https://en.wikipedia.org/wiki/Block_\(data_storage\)) (обычно фиксированного размера, например 4 КБ или 8 КБ). Блоки — это наименьшие единицы данных, считываемые с диска в память. Когда приложение или база данных запрашивает данные, подсистема дискового ввода-вывода операционной системы считывает необходимые блоки с диска. Даже если нужна только часть блока, весь блок целиком считывается в память (это связано с устройством дисков и файловых систем):

<Image img={row_orientated} alt="Структура строко-ориентированной базы данных" size="lg" />

**Колонко-ориентированная СУБД**


Поскольку значения каждого столбца хранятся на диске последовательно друг за другом, при выполнении приведённого выше запроса не загружаются лишние данные.
Поскольку блочное хранение и передача данных с диска в память соответствуют характеру доступа к данным в аналитических запросах, с диска читаются только те столбцы, которые требуются для запроса, что позволяет избежать лишних операций ввода-вывода для неиспользуемых данных. Это [намного быстрее](https://benchmark.clickhouse.com/) по сравнению со строчно-ориентированным хранением, при котором считываются целые строки (включая столбцы, не относящиеся к запросу):

<Image img={column_orientated} alt="Структура столбцово-ориентированной базы данных" size="lg"/>

## Репликация данных и их целостность \{#data-replication-and-integrity\}

ClickHouse использует асинхронную мультимастерную схему репликации, чтобы обеспечивать избыточное хранение данных на нескольких узлах. После записи на любую доступную реплику все остальные реплики в фоновом режиме получают свою копию. Система поддерживает одинаковое состояние данных на разных репликах. Восстановление после большинства сбоев выполняется автоматически или полуавтоматически в более сложных случаях.

## Ролевое управление доступом \{#role-based-access-control\}

ClickHouse реализует управление учетными записями пользователей посредством SQL‑запросов и позволяет настраивать ролевое управление доступом, аналогичное описанному в стандарте ANSI SQL и реализованному в популярных системах управления реляционными базами данных.

## Поддержка SQL \{#sql-support\}

ClickHouse поддерживает [декларативный язык запросов, основанный на SQL](/sql-reference), который во многих случаях соответствует стандарту ANSI SQL. Поддерживаемые конструкции запросов включают [GROUP BY](/sql-reference/statements/select/group-by), [ORDER BY](/sql-reference/statements/select/order-by), подзапросы в секции [FROM](/sql-reference/statements/select/from), конструкцию [JOIN](/sql-reference/statements/select/join), оператор [IN](/sql-reference/operators/in), [оконные функции](/sql-reference/window-functions) и скалярные подзапросы.

## Приблизительный расчет \{#approximate-calculation\}

ClickHouse предоставляет возможности пожертвовать точностью ради производительности. Например, некоторые его агрегатные функции вычисляют приблизительное количество различных значений, медиану и квантили. Кроме того, запросы можно выполнять по выборке данных, чтобы быстро получить приблизительный результат. Наконец, агрегацию можно выполнять с ограниченным числом ключей вместо всех ключей. В зависимости от того, насколько смещено распределение ключей, это может дать достаточно точный результат при существенно меньших затратах ресурсов по сравнению с точным расчетом.

## Адаптивные алгоритмы соединения \{#adaptive-join-algorithms\}

ClickHouse адаптивно выбирает алгоритм соединения: он начинает с быстрых хеш‑соединений и переходит к merge‑соединениям, если в запросе участвует более одной крупной таблицы.

## Высочайшая производительность запросов \{#superior-query-performance\}

ClickHouse широко известен своей исключительно высокой скоростью выполнения запросов.
Чтобы узнать, почему ClickHouse такой быстрый, см. руководство [Why is ClickHouse fast?](/concepts/why-clickhouse-is-so-fast.mdx).

{/*
  ## What is OLAP?                
  OLAP scenarios require real-time responses on top of large datasets for complex analytical queries with the following characteristics:
  - Datasets can be massive - billions or trillions of rows
  - Data is organized in tables that contain many columns
  - Only a few columns are selected to answer any particular query
  - Results must be returned in milliseconds or seconds

  ## Column-oriented vs row-oriented databases                                             
  In a row-oriented DBMS, data is stored in rows, with all the values related to a row physically stored next to each other.

  In a column-oriented DBMS, data is stored in columns, with values from the same columns stored together.

  ## Why column-oriented databases work better in the OLAP scenario                                                                  

  Column-oriented databases are better suited to OLAP scenarios: they're at least 100 times faster in processing most queries. The reasons are explained in detail below, but the fact is easier to demonstrate visually:

  See the difference?

  The rest of this article explains why column-oriented databases work well for these scenarios, and why ClickHouse in particular [outperforms](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated) others in this category.

  ## Why is ClickHouse so fast?                             

  ClickHouse uses all available system resources to their full potential to process each analytical query as fast as possible. This is made possible due to a unique combination of analytical capabilities and attention to the low-level details required to implement the fastest OLAP database.

  Helpful articles to dive deeper into this topic include:
  - [ClickHouse Performance](/concepts/why-clickhouse-is-so-fast)
  - [Distinctive Features of ClickHouse](/about-us/distinctive-features.md)
  - [FAQ: Why is ClickHouse so fast?](/knowledgebase/why-clickhouse-is-so-fast)

  ## Processing analytical queries in real time                                              

  In a row-oriented DBMS, data is stored in this order:

  | Row | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
  |-----|-------------|------------|--------------------|-----------|---------------------|
  | #0 | 89354350662 | 1          | Investor Relations | 1         | 2016-05-18 05:19:20 |
  | #1 | 90329509958 | 0          | Contact us         | 1         | 2016-05-18 08:10:20 |
  | #2 | 89953706054 | 1          | Mission            | 1         | 2016-05-18 07:38:00 |
  | #N | ...           | ...          | ...                  | ...         | ...                   |

  In other words, all the values related to a row are physically stored next to each other.

  Examples of a row-oriented DBMS are MySQL, Postgres, and MS SQL Server.

  In a column-oriented DBMS, data is stored like this:

  | Row:        | #0                 | #1                 | #2                 | #N |
  |-------------|---------------------|---------------------|---------------------|-----|
  | WatchID:    | 89354350662         | 90329509958         | 89953706054         | ...   |
  | JavaEnable: | 1                   | 0                   | 1                   | ...   |
  | Title:      | Investor Relations  | Contact us          | Mission             | ...   |
  | GoodEvent:  | 1                   | 1                   | 1                   | ...   |
  | EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

  These examples only show the order that data is arranged in. The values from different columns are stored separately, and data from the same column is stored together.

  Examples of a column-oriented DBMS: Vertica, Paraccel (Actian Matrix and Amazon Redshift), Sybase IQ, Exasol, Infobright, InfiniDB, MonetDB (VectorWise and Actian Vector), LucidDB, SAP HANA, Google Dremel, Google PowerDrill, Druid, and kdb+.

  Different orders for storing data are better suited to different scenarios. The data access scenario refers to what queries are made, how often, and in what proportion; how much data is read for each type of query – rows, columns, and bytes; the relationship between reading and updating data; the working size of the data and how locally it is used; whether transactions are used, and how isolated they're; requirements for data replication and logical integrity; requirements for latency and throughput for each type of query, and so on.

  The higher the load on the system, the more important it is to customize the system set up to match the requirements of the usage scenario, and the more fine grained this customization becomes. There is no system that is equally well-suited to significantly different scenarios. If a system is adaptable to a wide set of scenarios, under a high load, the system will handle all the scenarios equally poorly, or will work well for just one or few of possible scenarios.

  ### Key properties of the OLAP scenario                                   

  - Таблицы «широкие», то есть содержат большое количество столбцов.
  - Наборы данных большие, и запросы требуют высокой пропускной способности при обработке одного запроса (до миллиардов строк в секунду на сервер).
  - Значения в столбцах достаточно маленькие: числа и короткие строки (например, 60 байт на URL).
  - Запросы извлекают большое количество строк, но только небольшой поднабор столбцов.
  - Для простых запросов допускаются задержки порядка 50 мс.
  - В каждом запросе участвует одна большая таблица; все остальные таблицы маленькие.
  - Результат запроса значительно меньше исходных данных. Другими словами, данные фильтруются или агрегируются так, что результат помещается в оперативную память одного сервера.
  - Запросы относительно редки (обычно сотни запросов в секунду на сервер или меньше).
  - Вставки выполняются достаточно крупными пакетами (\> 1000 строк), а не по одной строке.
  - Транзакции не нужны.

  Легко заметить, что OLAP-сценарий сильно отличается от других популярных сценариев (таких как OLTP или Key-Value-доступ). Поэтому не имеет смысла пытаться использовать OLTP- или Key-Value-СУБД для обработки аналитических запросов, если вы хотите получить приемлемую производительность. Например, если вы попытаетесь использовать MongoDB или Redis для аналитики, вы получите очень низкую производительность по сравнению с OLAP-базами данных.

  ### Input/output               

  1.  For an analytical query, only a small number of table columns need to be read. In a column-oriented database, you can read just the data you need. For example, if you need 5 columns out of 100, you can expect a 20-fold reduction in I/O.
  2.  Since data is read in packets, it is easier to compress. Data in columns is also easier to compress. This further reduces the I/O volume.
  3.  Due to the reduced I/O, more data fits in the system cache.

  For example, the query "count the number of records for each advertising platform" requires reading one "advertising platform ID" column, which takes up 1 byte uncompressed. If most of the traffic wasn't from advertising platforms, you can expect at least 10-fold compression of this column. When using a quick compression algorithm, data decompression is possible at a speed of at least several gigabytes of uncompressed data per second. In other words, this query can be processed at a speed of approximately several billion rows per second on a single server. This speed is actually achieved in practice.

  ### CPU       

  Since executing a query requires processing a large number of rows, it helps to dispatch all operations for entire vectors instead of for separate rows, or to implement the query engine so that there is almost no dispatching cost. If you don't do this, with any half-decent disk subsystem, the query interpreter inevitably stalls the CPU. It makes sense to both store data in columns and process it, when possible, by columns.

  There are two ways to do this:

  1.  A vector engine. All operations are written for vectors, instead of for separate values. This means you don't need to call operations very often, and dispatching costs are negligible. Operation code contains an optimized internal cycle.

  2.  Code generation. The code generated for the query has all the indirect calls in it.

  This isn't done in row-oriented databases, because it doesn't make sense when running simple queries. However, there are exceptions. For example, MemSQL uses code generation to reduce latency when processing SQL queries. (For comparison, analytical DBMSs require optimization of throughput, not latency.)

  Note that for CPU efficiency, the query language must be declarative (SQL or MDX), or at least a vector (J, K). The query should only contain implicit loops, allowing for optimization.
  */ }