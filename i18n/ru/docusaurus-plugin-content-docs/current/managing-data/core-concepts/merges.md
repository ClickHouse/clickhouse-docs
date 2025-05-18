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

ClickHouse [быстрый](/concepts/why-clickhouse-is-so-fast) не только для запросов, но и для вставок, благодаря своему [слою хранения](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), который функционирует аналогично [LSM-деревьям](https://en.wikipedia.org/wiki/Log-structured_merge-tree):

① Вставки (в таблицы из [движка MergeTree](/engines/table-engines/mergetree-family)) создают отсортированные, неизменяемые [части данных](/parts).

② Вся обработка данных осуществляется с помощью **фоновый слияний частей**.

Это делает записи данных легковесными и [высокоэффективными](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other).

Чтобы контролировать количество частей на таблицу и реализовать ② выше, ClickHouse постоянно сливает ([по партициям](/partitions#per-partition-merges)) меньшие части в большие в фоновом режиме до достижения сжатого размера примерно [~150 ГБ](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool).

Следующая диаграмма схематически изображает этот процесс фонового слияния:

<Image img={merges_01} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Уровень `слияния` части увеличивается на один с каждым дополнительным слиянием. Уровень `0` означает, что часть новая и еще не была слита. Части, которые были слиты в большие части, помечаются как [неактивные](/operations/system-tables/parts) и в конечном итоге удаляются после [настраиваемого](/operations/settings/merge-tree-settings#old_parts_lifetime) времени (по умолчанию 8 минут). С течением времени это создает **дерево** слитых частей. Поэтому название [слияние деревьев](/engines/table-engines/mergetree-family) таблицы.

## Мониторинг слияний {#monitoring-merges}

В [примере, что такое части таблицы](/parts) мы [показали](/parts#monitoring-table-parts), что ClickHouse отслеживает все части таблицы в системной таблице [parts](/operations/system-tables/parts). Мы использовали следующий запрос, чтобы получить уровень слияния и количество хранимых строк для каждой активной части примерной таблицы:
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[Выполнение](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) запрос сейчас показывает, что четыре части слились в одну финальную часть (при условии, что в таблицу нет новых вставок):

```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[Выполнение](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) запрос сейчас показывает, что четыре части слились в одну финальную часть (при условии, что в таблицу нет новых вставок):

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

В ClickHouse 24.10 был добавлен новый [приборная панель слияний](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) в встроенные [панели мониторинга](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards). Доступная как в OSS, так и в Cloud через HTTP-обработчик `/merges`, мы можем использовать ее для визуализации всех слияний частей для нашей примерной таблицы:

<Image img={merges_dashboard} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Записанная выше панель захватывает весь процесс, начиная с первоначальных вставок данных и заканчивая финальным слиянием в одну часть:

① Количество активных частей.

② Слияния частей, визуально представлены в виде коробок (размер отражает размер части).

③ [Увеличение записи](https://en.wikipedia.org/wiki/Write_amplification).

## Одновременные слияния {#concurrent-merges}

Один сервер ClickHouse использует несколько фоновых [потоков слияния](/operations/server-configuration-parameters/settings#background_pool_size) для выполнения одновременных слияний частей:

<Image img={merges_02} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Каждый поток слияния выполняет цикл:

① Определяет, какие части слить следующими, и загружает эти части в память.

② Сливает части в памяти в большую часть.

③ Записывает слитую часть на диск.

Перейти к ①

Обратите внимание, что увеличение количества ядер CPU и объема ОЗУ позволяет увеличить пропускную способность фонового слияния.

## Оптимизированные для памяти слияния {#memory-optimized-merges}

ClickHouse не обязательно загружает все части, которые будут слиты, в память сразу, как показано в [предыдущем примере](/merges#concurrent-merges). Основываясь на нескольких [факторах](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210), и чтобы уменьшить потребление памяти (пожертвовав скоростью слияния), так называемое [вертикальное слияние](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) загружает и сливает части по блокам, а не сразу.

## Механика слияния {#merge-mechanics}

Диаграмма ниже иллюстрирует, как один фоновый [поток слияния](/merges#concurrent-merges) в ClickHouse сливает части (по умолчанию, без [вертикального слияния](/merges#memory-optimized-merges)):

<Image img={merges_03} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

Процесс слияния частей выполняется в несколько этапов:

**① Декомпрессия и загрузка**: [Сжатые двоичные файлы колонок](/parts#what-are-table-parts-in-clickhouse) из частей, которые будут слиты, декомпрессируются и загружаются в память.

**② Слияние**: Данные сливаются в большие файлы колонок.

**③ Индексация**: Новый [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) создается для слитых файлов колонок.

**④ Сжатие и хранение**: Новые файлы колонок и индекс [сжимаются](/sql-reference/statements/create/table#column_compression_codec) и сохраняются в новой [директории](/parts#what-are-table-parts-in-clickhouse), представляющей часть слитых данных.

Дополнительные [метаданные в частях данных](/parts), такие как вторичные индексы пропуска данных, статистика колонок, контрольные суммы и мин-макс индексы, также воссоздаются на основе слитых файлов колонок. Мы опустили эти детали для упрощения.

Механика шага ② зависит от конкретного [движка MergeTree](/engines/table-engines/mergetree-family), так как разные движки обрабатывают слияние по-разному. Например, строки могут агрегироваться или заменяться, если устарели. Как упоминалось ранее, этот подход **перекладывает всю обработку данных на фоновые слияния**, позволяя **супербыстрые вставки**, сохраняя операции записи легковесными и эффективными.

В следующем разделе мы кратко изложим механику слияния специфических движков в семействе MergeTree.


### Стандартные слияния {#standard-merges}

Диаграмма ниже иллюстрирует, как части в стандартной таблице [MergeTree](/engines/table-engines/mergetree-family/mergetree) сливаются:

<Image img={merges_04} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL-запрос в диаграмме выше создает таблицу `MergeTree` с ключом сортировки `(town, street)`, [что означает](/parts#what-are-table-parts-in-clickhouse), что данные на диске отсортированы по этим колонкам, и соответствующий разреженный первичный индекс генерируется.

① Декомпрессированные, предварительно отсортированные колонки таблицы ② сливаются с сохранением глобального порядка сортировки таблицы, определенного ключом сортировки таблицы, ③ создается новый разреженный первичный индекс, и ④ слитые файлы колонок и индекс сжимаются и сохраняются как новая часть данных на диске.

### Замещающие слияния {#replacing-merges}

Слияния частей в таблице [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) работают аналогично [стандартным слияниям](/merges#standard-merges), но сохраняется только самая последняя версия каждой строки, предыдущие версии отбрасываются:

<Image img={merges_05} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL-запрос в диаграмме выше создает таблицу `ReplacingMergeTree` с ключом сортировки `(town, street, id)`, что означает, что данные на диске отсортированы по этим колонкам, и соответствующий разреженный первичный индекс генерируется.

② Слияние работает аналогично стандартной таблице `MergeTree`, объединяя декомпрессированные, предварительно отсортированные колонки, сохраняя глобальный порядок сортировки.

Однако `ReplacingMergeTree` удаляет дублирующиеся строки с одинаковым ключом сортировки, сохраняя только самую последнюю строку на основе временной метки создания содержащей ее части.

<br/>

### Суммирующие слияния {#summing-merges}

Числовые данные автоматически суммируются во время слияний частей из таблицы [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree):

<Image img={merges_06} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL-запрос в диаграмме выше определяет таблицу `SummingMergeTree` с `town` в качестве ключа сортировки, что означает, что данные на диске отсортированы по этой колонке, и соответствующий разреженный первичный индекс создается.

На этапе ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, суммируя значения числовых колонок.

### Аггрегирующие слияния {#aggregating-merges}

Пример таблицы `SummingMergeTree` выше является специализированным вариантом таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), позволяющим [автоматическую инкрементную трансформацию данных](https://www.youtube.com/watch?v=QDAJTKZT8y4) путем применения любой из [90+](/sql-reference/aggregate-functions/reference) агрегатных функций во время слияний частей:

<Image img={merges_07} size="lg" alt='СЛИЯНИЕ ЧАСТЕЙ'/>

<br/>

DDL-запрос в диаграмме выше создает таблицу `AggregatingMergeTree` с `town` в качестве ключа сортировки, обеспечивая упорядочение данных по этой колонке на диске и создание соответствующего разреженного первичного индекса.

Во время ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, хранящей [частичные состояния агрегации](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) (например, `sum` и `count` для `avg()`). Эти состояния обеспечивают точные результаты с помощью инкрементных фоновых слияний.
