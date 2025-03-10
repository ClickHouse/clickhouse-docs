---
slug: /merges
title: Слияния частей
description: Что такое слияния частей в ClickHouse
keywords: ['merges']
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';

## Что такое слияния частей в ClickHouse? {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [быстрый](/concepts/why-clickhouse-is-so-fast) не только для запросов, но и для вставок, благодаря своему [слою хранения](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), который работает аналогично [LSM-деревьям](https://en.wikipedia.org/wiki/Log-structured_merge-tree):

① Вставки (в таблицы из семейства [MergeTree engine](/engines/table-engines/mergetree-family)) создают отсортированные, неизменяемые [части данных](/parts).

② Вся обработка данных выполняется в рамках **фоновый слияний частей**.

Это делает записи данных легковесными и [высокоэффективными](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other).

Для контроля количества частей на таблицу и реализации ② выше, ClickHouse непрерывно сливает ([по партиции](/partitions#per-partition-merges)) более мелкие части в более крупные в фоновом режиме до тех пор, пока они не достигнут сжатого размера примерно [~150 ГБ](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool).

Следующая диаграмма изображает этот процесс фонового слияния:

<img src={merges_01} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

Уровень `слияния` части увеличивается на единицу с каждым дополнительным слиянием. Уровень `0` означает, что часть новая и еще не была слита. Части, которые были слиты в более крупные части, помечаются как [неактивные](/operations/system-tables/parts) и в конечном итоге удаляются после [конфигурируемого](/operations/settings/merge-tree-settings#old-parts-lifetime) времени (по умолчанию 8 минут). Со временем это создает **дерево** объединенных частей. Поэтому таблица называется [деревом слияния](/engines/table-engines/mergetree-family).

## Мониторинг слияний {#monitoring-merges}

В примере [что такое части таблицы](/parts) мы [показали](/parts#monitoring-table-parts), что ClickHouse отслеживает все части таблицы в системной таблице [parts](/operations/system-tables/parts). Мы использовали следующий запрос, чтобы получить уровень слияния и количество хранимых строк на каждую активную часть примерной таблицы:
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[Запуск](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) теперь показывает, что четыре части слились в одну финальную часть (при условии, что в таблицу не было добавлено новых вставок):

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

В ClickHouse 24.10 была добавлена новая [панель слияний](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) в встроенные [панели мониторинга](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards). Доступная как в OSS, так и в Cloud через HTTP-обработчик `/merges`, мы можем использовать ее для визуализации всех слияний частей для нашей примерной таблицы:

<img src={merges_dashboard} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

Записанная панель выше фиксирует весь процесс, от первоначальных вставок данных до финального слияния в одну часть:

① Число активных частей.

② Слияния частей, визуально представленные в виде прямоугольников (размер отражает размер части).

③ [Увеличение записи](https://en.wikipedia.org/wiki/Write_amplification).

## Параллельные слияния {#concurrent-merges}

Один сервер ClickHouse использует несколько фоновых [потоков слияния](/operations/server-configuration-parameters/settings#background_pool_size), чтобы выполнять параллельные слияния частей:

<img src={merges_02} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

Каждый поток слияния выполняет цикл:

① Решить, какие части слить следующими, и загрузить эти части в память.

② Слить части в памяти в более крупную часть.

③ Записать слитую часть на диск.

Идем к ①

Обратите внимание, что увеличение числа ядер процессора и размера ОП позволяет увеличить пропускную способность фонового слияния.

## Оптимизированные по памяти слияния {#memory-optimized-merges}

ClickHouse не обязательно загружает все части, которые будут сливаться, в память сразу, как показано в [предыдущем примере](/merges#concurrent-merges). В зависимости от нескольких [факторов](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210) и для сокращения потребления памяти (пожертвовав скоростью слияния), так называемое [вертикальное слияние](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) загружает и сливает части по блокам, а не все сразу.

## Механика слияния {#merge-mechanics}

Диаграмма ниже иллюстрирует, как один фоновый [поток слияния](/merges#concurrent-merges) в ClickHouse сливает части (по умолчанию, без [вертикального слияния](/merges#memory-optimized-merges)):

<img src={merges_03} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

Слияние частей выполняется в несколько этапов:

**① Декомпрессия и загрузка**: [Сжатые двоичные файловые столбцы](/parts#what-are-table-parts-in-clickhouse) из частей, которые будут сливаться, декомпрессируются и загружаются в память.

**② Слияние**: Данные сливаются в более крупные файловые столбцы.

**③ Индексирование**: Новый [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) создается для слитых файловых столбцов.

**④ Сжатие и хранение**: Новые файловые столбцы и индекс [сжимаются](/sql-reference/statements/create/table#column_compression_codec) и сохраняются в новой [директории](/parts#what-are-table-parts-in-clickhouse), представляющей объединенную часть данных.

Дополнительные [метаданные в частях данных](/parts), такие как вторичные индексы для пропуска данных, статистика колонок, контрольные суммы и мин-макс индексы, также восстанавливаются на основе слитых файловых столбцов. Мы опустили эти детали для простоты.

Механика шага ② зависит от конкретного [движка MergeTree](/engines/table-engines/mergetree-family), так как разные движки обрабатывают слияние по-разному. Например, строки могут быть агрегированы или заменены, если они устарели. Как упоминалось ранее, этот подход **перекладывает всю обработку данных на фоновые слияния**, позволяя **сверхбыстрые вставки**, благодаря легковесным и эффективным операциям записи.

Далее мы кратко изложим механики слияния конкретных движков в семье MergeTree.


### Стандартные слияния {#standard-merges}

Диаграмма ниже иллюстрирует, как части в стандартной таблице [MergeTree](/engines/table-engines/mergetree-family/mergetree) сливаются:

<img src={merges_04} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

DDL-оператор на приведенной выше диаграмме создает таблицу `MergeTree` с ключом сортировки `(town, street)`, [что означает](/parts#what-are-table-parts-in-clickhouse), что данные на диске отсортированы по этим колонкам, и соответственно создается разреженный первичный индекс.

① Декомпрессированные, предварительно отсортированные столбцы таблицы ② сливаются, при этом сохраняется глобальный порядок сортировки таблицы, определяемый ключом сортировки таблицы, ③ создается новый разреженный первичный индекс, и ④ слитые файловые столбцы и индекс сжимаются и хранятся как новая часть данных на диске.

### Заменяющие слияния {#replacing-merges}

Слияния частей в таблице [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) работают аналогично [стандартным слияниям](/merges#standard-merges), но только наиболее последняя версия каждой строки сохраняется, а более старые версии отбрасываются:

<img src={merges_05} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

DDL-оператор на приведенной выше диаграмме создает таблицу `ReplacingMergeTree` с ключом сортировки `(town, street, id)`, что означает, что данные на диске отсортированы по этим колонкам, с соответствующим созданием разреженного первичного индекса.

Слияние ② работает аналогично стандартной таблице `MergeTree`, объединяя декомпрессированные, предварительно отсортированные столбцы при сохранении глобального порядка сортировки.

Тем не менее, `ReplacingMergeTree` удаляет дубликаты строк с одинаковым ключом сортировки, оставляя только наиболее последнюю строку на основе временной метки создания ее содержащей части.

<br/>

### Суммирующие слияния {#summing-merges}

Числовые данные автоматически суммируются во время слияний частей из таблицы [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree):

<img src={merges_06} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

DDL-оператор на приведенной выше диаграмме определяет таблицу `SummingMergeTree` с `town` в качестве ключа сортировки, что означает, что данные на диске отсортированы по этому столбцу и соответственно создается разреженный первичный индекс.

На этапе ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, суммируя значения числовых столбцов.

### Агрегирующие слияния {#aggregating-merges}

Пример таблицы `SummingMergeTree` из выше — это специализированный вариант таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), позволяющий [автоматическую инкрементальную трансформацию данных](https://www.youtube.com/watch?v=QDAJTKZT8y4) с применением любой из [90+](/sql-reference/aggregate-functions/reference) агрегатных функций во время слияний частей:

<img src={merges_07} alt='СЛИЯНИЯ ЧАСТЕЙ' class='image' />
<br/>

DDL-оператор на приведенной выше диаграмме создает таблицу `AggregatingMergeTree` с `town` в качестве ключа сортировки, обеспечивая порядок данных по этому столбцу на диске и соответственно создавая разреженный первичный индекс.

Во время ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, хранящей [частичные состояния агрегирования](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) (например, `sum` и `count` для `avg()`). Эти состояния обеспечивают точные результаты в результате инкрементальных фоновых слияний.
