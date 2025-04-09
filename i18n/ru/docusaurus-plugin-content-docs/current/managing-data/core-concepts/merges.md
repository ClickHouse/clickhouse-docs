---
slug: /merges
title: 'Слияние частей'
description: 'Что такое слияние частей в ClickHouse'
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
import Image from '@theme/IdealImage';

## Что такое слияние частей в ClickHouse? {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [быстрый](/concepts/why-clickhouse-is-so-fast) не только для запросов, но и для вставок, благодаря своему [слою хранения](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), который работает аналогично [LSM-деревьям](https://en.wikipedia.org/wiki/Log-structured_merge-tree):

① Вставки (в таблицы из семейства [MergeTree engine](/engines/table-engines/mergetree-family)) создают отсортированные, неизменяемые [части данных](/parts).

② Вся обработка данных выполняется в **фоновом слиянии частей**.

Это делает записи данных лёгкими и [высокоэффективными](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other).

Чтобы контролировать количество частей на таблицу и реализовать ② выше, ClickHouse непрерывно сливает ([по партиции](/partitions#per-partition-merges)) меньшие части в более крупные в фоновом режиме, пока они не достигнут сжатого размера примерно [~150 ГБ](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool).

Следующая диаграмма иллюстрирует этот процесс фонового слияния:

<Image img={merges_01} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

`merge level` части увеличивается на единицу с каждым дополнительным слиянием. Уровень `0` означает, что часть новая и ещё не была слита. Части, которые были слиты в более крупные, помечаются как [неактивные](/operations/system-tables/parts) и в конечном итоге удаляются после [настраиваемого](/operations/settings/merge-tree-settings#old_parts_lifetime) времени (по умолчанию 8 минут). Со временем это создает **дерево** слитых частей. Отсюда название [дерево слияния](/engines/table-engines/mergetree-family) таблицы.

## Мониторинг слияний {#monitoring-merges}

В [примерe частей таблицы](/parts) мы [показали](/parts#monitoring-table-parts), что ClickHouse отслеживает все части таблицы в системной таблице [parts](/operations/system-tables/parts). Мы использовали следующий запрос для получения уровня слияния и количества хранимых строк в каждой активной части примерной таблицы:
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[Запускающий](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) запрос сейчас показывает, что четыре части слились в одну финальную часть (если не было дополнительных вставок в таблицу):

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

В ClickHouse 24.10 была добавлена новая [панель слияний](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) в встроенные [панели мониторинга](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards). Доступная как в OSS, так и в Cloud через HTTP-обработчик `/merges`, мы можем использовать её для визуализации всех слияний частей для нашей примерной таблицы:

<Image img={merges_dashboard} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

Записанная выше панель захватывает весь процесс, начиная с начальных вставок данных и заканчивая финальным слиянием в одну часть:

① Количество активных частей.

② Слияния частей, визуально представленные с помощью прямоугольников (размер отражает размер части).

③ [Увеличение записи](https://en.wikipedia.org/wiki/Write_amplification).

## Параллельные слияния {#concurrent-merges}

Один сервер ClickHouse использует несколько фоновых [потоков слияния](/operations/server-configuration-parameters/settings#background_pool_size) для выполнения параллельных слияний частей:

<Image img={merges_02} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

Каждый поток слияния выполняет цикл:

① Определяет, какие части слить следующими, и загружает эти части в память.

② Сливает части в памяти в большую часть.

③ Записывает слитую часть на диск.

Перейти к ①

Обратите внимание, что увеличение количества ядер CPU и объема RAM позволяет увеличить пропускную способность фоновых слияний.

## Оптимизированные по памяти слияния {#memory-optimized-merges}

ClickHouse не обязательно загружает все части, которые будут слиты, в память одновременно, как было показано в [предыдущем примере](/merges#concurrent-merges). Основываясь на нескольких [факторах](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210), и для снижения потребления памяти (путем жертвы скоростью слияния), так называемые [вертикальные слияния](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) загружают и сливают части блоками вместо сразу.

## Механика слияния {#merge-mechanics}

Следующая диаграмма иллюстрирует, как один фоновый [поток слияния](/merges#concurrent-merges) в ClickHouse сливает части (по умолчанию, без [вертикального слияния](/merges#memory-optimized-merges)):

<Image img={merges_03} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

Слияние частей выполняется в несколько этапов:

**① Декомпрессия и загрузка**: [Сжатые бинарные файлы колонок](/parts#what-are-table-parts-in-clickhouse) из частей для слияния декомпрессируются и загружаются в память.

**② Слияние**: Данные сливаются в более крупные файлы колонок.

**③ Индексирование**: Генерируется новый [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) для слитых файлов колонок.

**④ Сжатие и хранение**: Новые файлы колонок и индекс [сжимаются](/sql-reference/statements/create/table#column_compression_codec) и сохраняются в новом [каталоге](/parts#what-are-table-parts-in-clickhouse), представляющем слитую часть данных.

Дополнительные [метаданные в частях данных](/parts), такие как вторичные индексы пропуска данных, статистика по колонкам, контрольные суммы и минимальные/максимальные индексы, также воссоздаются на основе слитых файлов колонок. Мы опустили эти детали ради простоты.

Механика шага ② зависит от конкретного [движка MergeTree](/engines/table-engines/mergetree-family), поскольку разные движки обрабатывают слияние по-разному. Например, строки могут агрегироваться или заменяться, если устарели. Как уже упоминалось, этот подход **переносит всю обработку данных на фоновые слияния**, обеспечивая **супершвидкие вставки** благодаря облегчению операций записи.

Далее мы кратко обрисуем механику слияния специфичных движков в семействе MergeTree.


### Стандартные слияния {#standard-merges}

Следующая диаграмма иллюстрирует, как части в стандартной [MergeTree](/engines/table-engines/mergetree-family/mergetree) таблице сливаются:

<Image img={merges_04} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `MergeTree` с ключом сортировки `(town, street)`, [что означает](/parts#what-are-table-parts-in-clickhouse), что данные на диске отсортированы по этим колонкам, и разреженный первичный индекс создается соответственно.

Сначала ① декомпрессированные, предсортированные колонки таблицы ② сливаются, сохраняя глобальный порядок сортировки таблицы, определяемый ключом сортировки таблицы, ③ создается новый разреженный первичный индекс, и ④ слитые файлы колонок и индекс сжимаются и хранятся как новая часть данных на диске.

### Заменяющие слияния {#replacing-merges}

Слияния частей в таблице [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) работают аналогично [стандартным слияниям](/merges#standard-merges), но сохраняется только самая последняя версия каждой строки, а старые версии отбрасываются:

<Image img={merges_05} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `ReplacingMergeTree` с ключом сортировки `(town, street, id)`, что значит, что данные на диске отсортированы по этим колонкам, с разреженным первичным индексом созданным соответственно.

Слияние ② работает аналогично стандартной таблице `MergeTree`, объединяя декомпрессированные, предсортированные колонки, сохраняя глобальный порядок сортировки.

Однако `ReplacingMergeTree` удаляет дубликаты строк с одинаковым ключом сортировки, сохраняя только самую последнюю строку на основе времени создания содержащей её части.

<br/>

### Суммирующие слияния {#summing-merges}

Числовые данные автоматически суммируются во время слияний частей из таблицы [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree):

<Image img={merges_06} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше определяет таблицу `SummingMergeTree` с `town` в качестве ключа сортировки, что означает, что данные на диске отсортированы по этой колонке и соответственно создается разреженный первичный индекс.

На этапе ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, суммируя значения числовых колонок.

### Агрегирующие слияния {#aggregating-merges}

Пример таблицы `SummingMergeTree` выше является специализированным вариантом таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), позволяющим [автоматическое инкрементное преобразование данных](https://www.youtube.com/watch?v=QDAJTKZT8y4) при применении любой из [90+](/sql-reference/aggregate-functions/reference) агрегатных функции во время слияний частей:

<Image img={merges_07} size="lg" alt='СЛИЯНИЯ ЧАСТЕЙ'/>

<br/>

DDL оператор на диаграмме выше создает таблицу `AggregatingMergeTree` с `town` в качестве ключа сортировки, гарантируя, что данные упорядочены по этой колонке на диске и создается соответствующий разреженный первичный индекс.

Во время ② слияния ClickHouse заменяет все строки с одинаковым ключом сортировки одной строкой, хранящей [частичные состояния агрегации](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) (например, `sum` и `count` для `avg()`). Эти состояния обеспечивают точные результаты через инкрементные фоновые слияния.
