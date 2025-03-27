---
slug: /merges
title: 'Слияние частей'
description: 'Что такое слияние частей в ClickHouse'
keywords: ['слияние']
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';
import Image from '@theme/IdealImage';


## Что такое слияние частей в ClickHouse? {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [быстрый](/concepts/why-clickhouse-is-so-fast) не только для запросов, но и для вставок, благодаря его [слою хранения](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), который работает аналогично [LSM деревьям](https://en.wikipedia.org/wiki/Log-structured_merge-tree):

① Вставки (в таблицы от [движка MergeTree](/engines/table-engines/mergetree-family)) создают отсортированные, неизменяемые [части данных](/parts).

② Все операции обработки данных выполняются в **фоновом слиянии частей**.

Это делает записи данных легковесными и [высокоэффективными](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other).

Чтобы контролировать количество частей в таблице и реализовать ② выше, ClickHouse постоянно сливает ([по разделу](/partitions#per-partition-merges)) меньшие части в более крупные в фоновом режиме, пока они не достигнут сжатого размера примерно [~150 ГБ](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool).

Следующий диаграмма иллюстрирует этот процесс фонового слияния:

<Image img={merges_01} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Уровень `слияния` части увеличивается на единицу с каждым последующим слиянием. Уровень `0` означает, что часть новая и еще не была объединена. Части, которые были объединены в более крупные, помечаются как [неактивные](/operations/system-tables/parts) и в конечном итоге удаляются после [настраиваемого](/operations/settings/merge-tree-settings#old-parts-lifetime) времени (по умолчанию 8 минут). Со временем это создает **дерево** объединенных частей. Поэтому название [дерево слияния](/engines/table-engines/mergetree-family).

## Мониторинг слияний {#monitoring-merges}

В примере [что такое части таблицы](/parts) мы [показали](/parts#monitoring-table-parts), что ClickHouse отслеживает все части таблиц в системной таблице [части](/operations/system-tables/parts). Мы использовали следующий запрос для получения уровня слияния и количества храненных строк на каждую активную часть примера таблицы:
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[Запуск] (https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) запроса сейчас показывает, что четыре части слились в одну финальную часть (если в таблицу не было внесено никаких дополнительных вставок):

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

В ClickHouse 24.10 была добавлена новая [панель мониторинга слияний](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) в встроенные [панели мониторинга](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards). Доступная как в OSS, так и в Cloud через HTTP обработчик `/merges`, мы можем использовать ее для визуализации всех слияний частей для нашей примерной таблицы:

<Image img={merges_dashboard} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Записанная панель мониторинга выше фиксирует весь процесс, от начальных вставок данных до окончательного слияния в одну часть:

① Количество активных частей.

② Слияния частей, визуально представлены с помощью коробок (размер отражает размер части).

③ [Увеличение записи](https://en.wikipedia.org/wiki/Write_amplification).

## Параллельные слияния {#concurrent-merges}

Один сервер ClickHouse использует несколько фоновых [потоков слияния](/operations/server-configuration-parameters/settings#background_pool_size) для выполнения параллельных слияний частей:

<Image img={merges_02} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Каждый поток слияния выполняет цикл:

① Решить, какие части объединить следующими, и загрузить эти части в память.

② Объединить части в памяти в более крупную часть.

③ Записать объединенную часть на диск.

Идем к ①

Обратите внимание, что увеличение количества ядер CPU и объема ОЗУ позволяет увеличить пропускную способность фонового слияния.

## Оптимизированные по памяти слияния {#memory-optimized-merges}

ClickHouse не обязательно загружает все части, которые должны быть объединены, в память одновременно, как показано в [предыдущем примере](/merges#concurrent-merges). Основываясь на нескольких [факторах](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210), и чтобы снизить потребление памяти (жертвуя скоростью слияния), так называемое [вертикальное слияние](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) загружает и объединяет части кусками блоков, а не за один раз.

## Механика слияния {#merge-mechanics}

Диаграмма ниже иллюстрирует, как один фоновый [поток слияния](/merges#concurrent-merges) в ClickHouse объединяет части (по умолчанию, без [вертикального слияния](/merges#memory-optimized-merges)):

<Image img={merges_03} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Слияние частей выполняется в несколько этапов:

**① Декомпрессия и загрузка**: [Сжатые бинарные файлы столбцов](/parts#what-are-table-parts-in-clickhouse) из частей, которые должны быть объединены, декомпрессируются и загружаются в память.

**② Слияние**: Данные объединяются в более крупные файлы столбцов.

**③ Индексация**: Новый [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) генерируется для объединенных файлов столбцов.

**④ Сжатие и хранение**: Новые файлы столбцов и индекс [сжимаются](/sql-reference/statements/create/table#column_compression_codec) и сохраняются в новой [директории](/parts#what-are-table-parts-in-clickhouse), представляющей объединенную часть данных.

Дополнительные [метаданные в частях данных](/parts), такие как вторичные индексы пропуска данных, статистика столбцов, контрольные суммы и минимальные-максимальные индексы, также воссоздаются на основе объединенных файлов столбцов. Мы опустили эти детали для простоты.

Механика шага ② зависит от конкретного [движка MergeTree](/engines/table-engines/mergetree-family), используемого, поскольку разные движки обрабатывают слияние по-разному. Например, строки могут агрегироваться или заменяться, если устарели. Как уже упоминалось, этот подход **переносит всю обработку данных на фоновое слияние**, позволяя **сверхбыстрые вставки**, сохраняя операции записи легковесными и эффективными.

Далее мы кратко опишем механику слияния конкретных движков в семействе MergeTree.


### Стандартные слияния {#standard-merges}

Диаграмма ниже иллюстрирует, как части в стандартной [MergeTree](/engines/table-engines/mergetree-family/mergetree) таблице объединяются:

<Image img={merges_04} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `MergeTree` с ключом сортировки `(город, улица)`, [что означает](/parts#what-are-table-parts-in-clickhouse), что данные на диске отсортированы по этим столбцам, и соответственно генерируется разреженный первичный индекс.

Декомпрессированные, предварительно отсортированные ① столбцы таблицы объединяются ②, сохраняя глобальный порядок сортировки таблицы, определяемый ключом сортировки таблицы, ③ генерируется новый разреженный первичный индекс, и ④ объединенные файлы столбцов и индекс сжимаются и сохраняются как новая часть данных на диске.

### Заменяющие слияния {#replacing-merges}

Слияние частей в таблице [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) работает аналогично [стандартным слияниям](/merges#standard-merges), но сохраняется только самая последняя версия каждой строки, а более старые версии отбрасываются:

<Image img={merges_05} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `ReplacingMergeTree` с ключом сортировки `(город, улица, id)`, что означает, что данные на диске отсортированы по этим столбцам, с соответствующим разреженным первичным индексом.

Слияние ② работает аналогично стандартной таблице `MergeTree`, объединяя декомпрессированные, предварительно отсортированные столбцы, сохраняя глобальный порядок сортировки.

Однако `ReplacingMergeTree` удаляет дублирующиеся строки с одинаковым ключом сортировки, оставляя только самую последнюю строку на основе временной метки создания содержащей ее части.

<br/>

### Суммирующие слияния {#summing-merges}

Числовые данные автоматически суммируются во время слияний частей из таблицы [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree):

<Image img={merges_06} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше определяет таблицу `SummingMergeTree` с `городом` в качестве ключа сортировки, что означает, что данные на диске отсортированы по этому столбцу и соответственно генерируется разреженный первичный индекс.

На этапе ② слияния ClickHouse заменяет все строки с тем же ключом сортировки одной строкой, суммируя значения числовых столбцов.

### Агрегирующие слияния {#aggregating-merges}

Пример таблицы `SummingMergeTree` выше является специализированным вариантом таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), позволяющим [автоматическое инкрементальное преобразование данных](https://www.youtube.com/watch?v=QDAJTKZT8y4) с применением любой из [90+](/sql-reference/aggregate-functions/reference) агрегатных функций во время слияний частей:

<Image img={merges_07} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `AggregatingMergeTree` с `городом` в качестве ключа сортировки, обеспечивая, что данные упорядочены по этому столбцу на диске и соответствующий разреженный первичный индекс генерируется.

Во время ② слияния ClickHouse заменяет все строки с тем же ключом сортировки одной строкой, хранящей [частичные состояния агрегации](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) (например, `sum` и `count` для `avg()`). Эти состояния обеспечивают точные результаты при инкрементальных фоновых слияниях.
