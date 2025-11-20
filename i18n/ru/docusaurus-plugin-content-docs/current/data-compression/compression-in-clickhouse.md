---
slug: /data-compression/compression-in-clickhouse
title: 'Сжатие в ClickHouse'
description: 'Выбор алгоритмов сжатия в ClickHouse'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

Одним из секретов производительности запросов в ClickHouse является сжатие. 

Меньший объём данных на диске означает меньше операций ввода-вывода и более быстрые запросы и вставки. Затраты любого алгоритма сжатия по CPU в большинстве случаев компенсируются снижением объёма I/O. Поэтому улучшение сжатия данных должно быть первоочередной задачей при работе над обеспечением высокой скорости запросов в ClickHouse.

> Чтобы понять, почему ClickHouse так хорошо сжимает данные, мы рекомендуем [эту статью](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Вкратце: как колонночная база данных, ClickHouse записывает значения по столбцам. Если эти значения отсортированы, одинаковые значения будут находиться рядом друг с другом. Алгоритмы сжатия используют непрерывные последовательности данных. Кроме того, в ClickHouse есть кодеки и специализированные типы данных, которые позволяют пользователям ещё точнее настраивать методы сжатия.

На сжатие в ClickHouse влияют три основных фактора:
- Ключ сортировки
- Типы данных
- Используемые кодеки

Всё это настраивается через схему.



## Выбор правильного типа данных для оптимизации сжатия {#choose-the-right-data-type-to-optimize-compression}

Рассмотрим набор данных Stack Overflow в качестве примера. Сравним статистику сжатия для следующих схем таблицы `posts`:

- `posts` — схема без оптимизации типов и без ключа сортировки.
- `posts_v3` — схема с оптимизацией типов, с подходящим типом и разрядностью для каждого столбца и ключом сортировки `(PostTypeId, toDate(CreationDate), CommentCount)`.

С помощью следующих запросов можно измерить текущий сжатый и несжатый размер каждого столбца. Рассмотрим размер исходной неоптимизированной схемы `posts` без ключа сортировки.

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body                  │ 46.14 GiB       │ 127.31 GiB        │ 2.76       │
│ Title                 │ 1.20 GiB        │ 2.63 GiB          │ 2.19       │
│ Score                 │ 84.77 MiB       │ 736.45 MiB        │ 8.69       │
│ Tags                  │ 475.56 MiB      │ 1.40 GiB          │ 3.02       │
│ ParentId              │ 210.91 MiB      │ 696.20 MiB        │ 3.3        │
│ Id                    │ 111.17 MiB      │ 736.45 MiB        │ 6.62       │
│ AcceptedAnswerId      │ 81.55 MiB       │ 736.45 MiB        │ 9.03       │
│ ClosedDate            │ 13.99 MiB       │ 517.82 MiB        │ 37.02      │
│ LastActivityDate      │ 489.84 MiB      │ 964.64 MiB        │ 1.97       │
│ CommentCount          │ 37.62 MiB       │ 565.30 MiB        │ 15.03      │
│ OwnerUserId           │ 368.98 MiB      │ 736.45 MiB        │ 2          │
│ AnswerCount           │ 21.82 MiB       │ 622.35 MiB        │ 28.53      │
│ FavoriteCount         │ 280.95 KiB      │ 508.40 MiB        │ 1853.02    │
│ ViewCount             │ 95.77 MiB       │ 736.45 MiB        │ 7.69       │
│ LastEditorUserId      │ 179.47 MiB      │ 736.45 MiB        │ 4.1        │
│ ContentLicense        │ 5.45 MiB        │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName      │ 14.30 MiB       │ 142.58 MiB        │ 9.97       │
│ PostTypeId            │ 20.93 MiB       │ 565.30 MiB        │ 27         │
│ CreationDate          │ 314.17 MiB      │ 964.64 MiB        │ 3.07       │
│ LastEditDate          │ 346.32 MiB      │ 964.64 MiB        │ 2.79       │
│ LastEditorDisplayName │ 5.46 MiB        │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate    │ 2.21 MiB        │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

<details>
   
<summary>Примечание о компактных и широких частях</summary>


Если вы видите значения `compressed_size` или `uncompressed_size`, равные `0`, это может быть связано с тем, что тип
частей данных — `compact`, а не `wide` (см. описание `part_type` в [`system.parts`](/operations/system-tables/parts)).
Формат частей данных контролируется настройками [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)
и [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part), что означает: если вставленные
данные приводят к созданию части, не превышающей значения указанных настроек, часть будет компактной (compact), а не
широкой (wide), и вы не увидите значения `compressed_size` или `uncompressed_size`.

Для демонстрации:

```sql title="Query"
-- Создание таблицы с компактными частями
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
AS SELECT * FROM numbers(100000); -- Недостаточно большая, чтобы превысить значение по умолчанию min_bytes_for_wide_part = 10485760

-- Проверка типа частей данных
SELECT table, name, part_type from system.parts where table = 'compact';

-- Получение сжатых и несжатых размеров столбцов для компактной таблицы
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- Создание таблицы с широкими частями
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- Проверка типа частей данных
SELECT table, name, part_type from system.parts where table = 'wide';

-- Получение сжатых и несжатых размеров для широкой таблицы
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="Response"
   ┌─table───┬─name──────┬─part_type─┐
1. │ compact │ all_1_1_0 │ Compact   │
   └─────────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 0.00 B          │ 0.00 B            │   nan │
   └────────┴─────────────────┴───────────────────┴───────┘
   ┌─table─┬─name──────┬─part_type─┐
1. │ wide  │ all_1_1_0 │ Wide      │
   └───────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 392.31 KiB      │ 390.63 KiB        │     1 │
   └────────┴─────────────────┴───────────────────┴───────┘
```

</details>

Здесь показаны как сжатый, так и несжатый размеры. Оба важны. Сжатый размер соответствует объёму данных, которые необходимо прочитать с диска — его мы стремимся минимизировать для повышения производительности запросов (и снижения затрат на хранение). Эти данные необходимо распаковать перед чтением. Размер несжатых данных будет зависеть от используемого типа данных. Минимизация этого размера снизит потребление памяти запросами и объём данных, которые должны быть обработаны запросом, улучшая использование кэшей и, в конечном счёте, время выполнения запросов.

> Приведённый выше запрос использует таблицу `columns` в системной базе данных. Эта база данных управляется ClickHouse и представляет собой кладезь полезной информации — от метрик производительности запросов до фоновых логов кластера. Любознательному читателю рекомендуем статью [«System Tables and a Window into the Internals of ClickHouse»](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) и сопутствующие материалы[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse).

Чтобы получить общий размер таблицы, можно упростить приведённый выше запрос:


```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 ГиБ       │ 143.47 ГиБ        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

Повторив этот запрос для `posts_v3` — таблицы с оптимизированным типом и ключом сортировки, — мы видим значительное уменьшение размеров как в несжатом, так и в сжатом виде.

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB       │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

Подробный анализ по столбцам показывает значительную экономию для столбцов `Body`, `Title`, `Tags` и `CreationDate`, достигнутую за счёт упорядочивания данных перед сжатием и использования подходящих типов.

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS размер_сжатых_данных,
    formatReadableSize(sum(data_uncompressed_bytes)) AS размер_несжатых_данных,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS коэффициент_сжатия
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name
```


┌─name──────────────────┬─compressed&#95;size─┬─uncompressed&#95;size─┬───ratio─┐
│ Body                  │ 23.10 GiB       │ 63.63 GiB         │    2.75 │
│ Title                 │ 614.65 MiB      │ 1.28 GiB          │    2.14 │
│ Score                 │ 40.28 MiB       │ 227.38 MiB        │    5.65 │
│ Tags                  │ 234.05 MiB      │ 688.49 MiB        │    2.94 │
│ ParentId              │ 107.78 MiB      │ 321.33 MiB        │    2.98 │
│ Id                    │ 159.70 MiB      │ 227.38 MiB        │    1.42 │
│ AcceptedAnswerId      │ 40.34 MiB       │ 227.38 MiB        │    5.64 │
│ ClosedDate            │ 5.93 MiB        │ 9.49 MiB          │     1.6 │
│ LastActivityDate      │ 246.55 MiB      │ 454.76 MiB        │    1.84 │
│ CommentCount          │ 635.78 KiB      │ 56.84 MiB         │   91.55 │
│ OwnerUserId           │ 183.86 MiB      │ 227.38 MiB        │    1.24 │
│ AnswerCount           │ 9.67 MiB        │ 113.69 MiB        │   11.76 │
│ FavoriteCount         │ 19.77 KiB       │ 147.32 KiB        │    7.45 │
│ ViewCount             │ 45.04 MiB       │ 227.38 MiB        │    5.05 │
│ LastEditorUserId      │ 86.25 MiB       │ 227.38 MiB        │    2.64 │
│ ContentLicense        │ 2.17 MiB        │ 57.10 MiB         │   26.37 │
│ OwnerDisplayName      │ 5.95 MiB        │ 16.19 MiB         │    2.72 │
│ PostTypeId            │ 39.49 KiB       │ 56.84 MiB         │ 1474.01 │
│ CreationDate          │ 181.23 MiB      │ 454.76 MiB        │    2.51 │
│ LastEditDate          │ 134.07 MiB      │ 454.76 MiB        │    3.39 │
│ LastEditorDisplayName │ 2.15 MiB        │ 6.25 MiB          │    2.91 │
│ CommunityOwnedDate    │ 824.60 KiB      │ 1.34 MiB          │    1.66 │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘

```
```


## Выбор подходящего кодека сжатия столбцов {#choosing-the-right-column-compression-codec}

С помощью кодеков сжатия столбцов можно изменить алгоритм (и его параметры), используемый для кодирования и сжатия каждого столбца.

Кодирование и сжатие работают немного по-разному, но преследуют одну цель: уменьшить размер данных. Кодирование применяет преобразование к данным, изменяя значения на основе функции с использованием свойств типа данных. Сжатие же использует универсальный алгоритм для сжатия данных на уровне байтов.

Обычно сначала применяется кодирование, а затем сжатие. Поскольку различные методы кодирования и алгоритмы сжатия эффективны для разных распределений значений, необходимо понимать характер своих данных.

ClickHouse поддерживает большое количество кодеков и алгоритмов сжатия. Ниже приведены рекомендации в порядке важности:

| Рекомендация                                  | Обоснование                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` для всех случаев**                   | Сжатие `ZSTD` обеспечивает наилучшие коэффициенты сжатия. `ZSTD(1)` должен быть значением по умолчанию для большинства распространенных типов. Более высокие степени сжатия можно попробовать, изменив числовое значение. Мы редко наблюдаем достаточные преимущества при значениях выше 3 из-за увеличенных затрат на сжатие (более медленная вставка).                                                                                        |
| **`Delta` для последовательностей дат и целых чисел** | Кодеки на основе `Delta` хорошо работают при наличии монотонных последовательностей или небольших дельт в последовательных значениях. Точнее, кодек Delta работает хорошо при условии, что производные дают малые числа. Если нет, стоит попробовать `DoubleDelta` (обычно это дает мало преимуществ, если производная первого уровня от `Delta` уже очень мала). Последовательности с равномерным монотонным приращением будут сжиматься еще лучше, например поля DateTime. |
| **`Delta` улучшает `ZSTD`**                   | `ZSTD` является эффективным кодеком для дельта-данных — и наоборот, дельта-кодирование может улучшить сжатие `ZSTD`. При использовании `ZSTD` другие кодеки редко обеспечивают дальнейшее улучшение.                                                                                                                                                                                                                                             |
| **`LZ4` вместо `ZSTD`, если возможно**        | Если вы получаете сопоставимое сжатие между `LZ4` и `ZSTD`, отдайте предпочтение первому, так как он обеспечивает более быструю декомпрессию и требует меньше CPU. Однако `ZSTD` превосходит `LZ4` со значительным отрывом в большинстве случаев. Некоторые из этих кодеков могут работать быстрее в сочетании с `LZ4`, обеспечивая при этом сжатие, аналогичное `ZSTD` без кодека. Однако это зависит от данных и требует тестирования.            |
| **`T64` для разреженных данных или малых диапазонов** | `T64` может быть эффективен для разреженных данных или когда диапазон в блоке мал. Избегайте `T64` для случайных чисел.                                                                                                                                                                                                                                                                                                                           |
| **`Gorilla` и `T64` для неизвестных паттернов?** | Если данные имеют неизвестный паттерн, возможно, стоит попробовать `Gorilla` и `T64`.                                                                                                                                                                                                                                                                                                                                                             |
| **`Gorilla` для данных датчиков**             | `Gorilla` может быть эффективен для данных с плавающей точкой, в частности для тех, которые представляют показания датчиков, то есть случайные всплески.                                                                                                                                                                                                                                                                                          |

Дополнительные опции см. [здесь](/sql-reference/statements/create/table#column_compression_codec).

Ниже мы указываем кодек `Delta` для `Id`, `ViewCount` и `AnswerCount`, предполагая, что они будут линейно коррелировать с ключом сортировки и, следовательно, должны выиграть от дельта-кодирования.

```sql
CREATE TABLE posts_v4
(
        `Id` Int32 CODEC(Delta, ZSTD),
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta, ZSTD),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC'),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta, ZSTD),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```


Улучшения сжатия для этих столбцов показаны ниже:

```sql
SELECT
    `table`,
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (name IN ('Id', 'ViewCount', 'AnswerCount')) AND (`table` IN ('posts_v3', 'posts_v4'))
GROUP BY
    `table`,
    name
ORDER BY
    name ASC,
    `table` ASC

┌─table────┬─name────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ posts_v3 │ AnswerCount │ 9.67 МиБ        │ 113.69 МиБ        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 МиБ       │ 111.31 МиБ        │ 10.71 │
│ posts_v3 │ Id          │ 159.70 МиБ      │ 227.38 МиБ        │  1.42 │
│ posts_v4 │ Id          │ 64.91 МиБ       │ 222.63 МиБ        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 МиБ       │ 227.38 МиБ        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 МиБ       │ 222.63 МиБ        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

Выбрано 6 строк. Затрачено: 0.008 сек.
```

### Сжатие в ClickHouse Cloud {#compression-in-clickhouse-cloud}

В ClickHouse Cloud по умолчанию используется алгоритм сжатия `ZSTD` (со значением по умолчанию 1). Хотя скорость сжатия для этого алгоритма может варьироваться в зависимости от уровня сжатия (чем выше уровень — тем медленнее), он обладает преимуществом стабильно высокой скорости распаковки (разброс около 20%), а также поддерживает параллелизацию. Наши тесты также показывают, что этот алгоритм зачастую достаточно эффективен и может даже превосходить `LZ4` в сочетании с кодеком. Он эффективен для большинства типов данных и распределений, и поэтому является разумным универсальным выбором по умолчанию — именно поэтому сжатие работает превосходно даже без дополнительной оптимизации.
