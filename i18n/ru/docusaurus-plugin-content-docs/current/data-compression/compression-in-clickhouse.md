---
'slug': '/data-compression/compression-in-clickhouse'
'title': 'Сжатие в ClickHouse'
'description': 'Выбор алгоритмов сжатия ClickHouse'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
'doc_type': 'reference'
---

Одним из секретов производительности запросов ClickHouse является сжатие.

Меньше данных на диске означает меньше ввода-вывода и более быстрые запросы и вставки. Накладные расходы любого алгоритма сжатия в отношении CPU в большинстве случаев перекрываются сокращением ввода-вывода. Улучшение сжатия данных, следовательно, должно стать первой целью при работе над обеспечением быстрой работы запросов в ClickHouse.

> Почему ClickHouse так хорошо сжимает данные, мы рекомендуем [эту статью](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). В кратком изложении, как столбцовая база данных, значения будут записываться в порядковой последовательности. Если эти значения отсортированы, одинаковые значения будут находиться рядом друг с другом. Алгоритмы сжатия используют непрерывные паттерны данных. Кроме того, ClickHouse имеет кодеки и детализированные типы данных, которые позволяют пользователям дополнительно настраивать техники сжатия.

На сжатие в ClickHouse влияют три основных фактора:
- Ключ сортировки
- Типы данных
- Каккие кодеки используются

Все это настраивается через схему.

## Выбор правильного типа данных для оптимизации сжатия {#choose-the-right-data-type-to-optimize-compression}

Возьмем набор данных Stack Overflow в качестве примера. Сравним статистику сжатия для следующих схем таблицы `posts`:

- `posts` - не оптимизированная по типу схема без ключа сортировки.
- `posts_v3` - оптимизированная по типу схема с соответствующим типом и размером бит для каждого столбца с ключом сортировки `(PostTypeId, toDate(CreationDate), CommentCount)`.

Используя следующие запросы, мы можем измерить текущий сжатый и несжатый размер каждого столбца. Давайте рассмотрим размер начальной оптимизированной схемы `posts` без ключа сортировки.

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

Если вы видите значения `compressed_size` или `uncompressed_size`, равные `0`, это может быть связано с тем, что тип частей `compact`, а не `wide` (см. описание для `part_type` в [`system.parts`](/operations/system-tables/parts)).
Формат части контролируется настройками [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)
и [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part), означая что если вставленные
данные приводят к образованию части, которая не превышает значения вышеупомянутых настроек, то часть будет компактной, а не широкой, и вы не увидите значения для `compressed_size` или `uncompressed_size`.

Чтобы продемонстрировать:

```sql title="Query"
-- Create a table with compact parts
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- Not big enough to exceed default of min_bytes_for_wide_part = 10485760

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'compact';

-- Get the compressed and uncompressed column sizes for the compact table
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- Create a table with wide parts 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'wide';

-- Get the compressed and uncompressed sizes for the wide table
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

Мы показываем как сжатый, так и несжатый размер здесь. Оба важны. Сжатый размер соответствует тому, что нам нужно прочитать с диска — это то, что мы хотим минимизировать для производительности запросов (и затрат на хранение). Эти данные должны быть распакованы перед чтением. Размер этого несжатого размера будет зависеть от используемого типа данных в данном случае. Минимизация этого размера снизит накладные расходы памяти запросов и количество данных, которые должны быть обработаны запросом, улучшая использование кэшей и в конечном итоге время выполнения запросов.

> Вышеупомянутый запрос опирается на таблицу `columns` в системной базе данных. Эта база данных управляется ClickHouse и является сокровищницей полезной информации, от метрик производительности запросов до фоновых журналов кластера. Мы рекомендуем ["Системные таблицы и окно в внутренности ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) и сопутствующие статьи[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) для любопытных читателей. 

Чтобы подвести итог общего размера таблицы, мы можем упростить вышеупомянутый запрос:

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB       │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

Повторяя этот запрос для `posts_v3`, таблицы с оптимизированным типом и ключом сортировки, мы можем наблюдать значительное снижение несжатых и сжатых размеров.

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

Полная разбивка по столбцам показывает значительную экономию для столбцов `Body`, `Title`, `Tags` и `CreationDate`, достигнутую благодаря упорядочиванию данных перед сжатием и использованию соответствующих типов.

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
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

## Выбор правильного кодека сжатия столбца {#choosing-the-right-column-compression-codec}

С кодеками сжатия столбцов мы можем изменить алгоритм (и его настройки), используемый для кодирования и сжатия каждого столбца.

Кодировки и сжатие работают немного по-разному, но с одной и той же целью: уменьшить размер наших данных. Кодировки применяют отображение к нашим данным, преобразуя значения на основе функции, используя свойства типа данных. Напротив, сжатие использует общий алгоритм для сжатия данных на уровне байтов.

Как правило, кодировки применяются сначала, а затем используется сжатие. Поскольку разные кодировки и алгоритмы сжатия эффективны при разных распределениях значений, мы должны понимать наши данные.

ClickHouse поддерживает большое количество кодеков и алгоритмов сжатия. Ниже приведены некоторые рекомендации в порядке важности:

Рекомендация                                     | Обоснование
---                                                |    ---
**`ZSTD` — вперед!**                             | Сжатие `ZSTD` предлагает лучшие коэффициенты сжатия. `ZSTD(1)` должен быть по умолчанию для большинства общих типов. Более высокие коэффициенты сжатия можно добиться, изменяя числовое значение. Мы редко видим достаточные преимущества при значениях выше 3 из-за увеличенных затрат на сжатие (медленнее вставка).
**`Delta` для последовательностей дат и целых чисел** | Кодеки, основанные на `Delta`, хорошо работают, когда у вас есть монотонные последовательности или небольшие дельты между последовательными значениями. Более конкретно, кодек Delta хорошо работает при условии, что производные дают маленькие числа. Если нет, стоит попробовать `DoubleDelta` (это обычно добавляет немного, если первая производная от `Delta` уже очень маленькая). Последовательности, где монотонное увеличение равномерно, будут сжиматься еще лучше, например, поля DateTime.
**`Delta` улучшает `ZSTD`**                        | `ZSTD` является эффективным кодеком для данных дельты — наоборот, кодирование дельты может улучшить сжатие `ZSTD`. При наличии `ZSTD` другие кодеки редко предлагают дальнейшие улучшения.
**`LZ4` вместо `ZSTD`, если возможно**           | если вы получаете сопоставимое сжатие между `LZ4` и `ZSTD`, отдайте предпочтение первому, так как он предлагает более быстрое разжатие и требует меньше CPU. Однако в большинстве случаев `ZSTD` будет значительно превосходить `LZ4`. Некоторые из этих кодеков могут работать быстрее в сочетании с `LZ4`, обеспечивая аналогичное сжатие по сравнению с `ZSTD` без кодека. Это будет специфично для данных и требует тестирования.
**`T64` для разреженных или малых диапазонов**   | `T64` может быть эффективным для разреженных данных или когда диапазон в блоке небольшой. Избегайте `T64` для случайных чисел.
**`Gorilla` и `T64` для неизвестных паттернов?**  | Если данные имеют неизвестный паттерн, возможно, стоит попробовать `Gorilla` и `T64`.
**`Gorilla` для данных об измерениях**           | `Gorilla` может быть эффективным для данных с плавающей точкой, особенно для тех, которые представляют показания измерительных приборов, т.е. случайные всплески.

Смотрите [здесь](/sql-reference/statements/create/table#column_compression_codec) для дальнейших опций.

Ниже мы указываем кодек `Delta` для `Id`, `ViewCount` и `AnswerCount`, предполагая, что они будут линейно коррелированы с ключом сортировки и, таким образом, должны извлечь выгоду от кодирования Delta.

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
│ posts_v3 │ AnswerCount │ 9.67 MiB        │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB       │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id          │ 159.70 MiB      │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id          │ 64.91 MiB       │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB       │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB       │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### Сжатие в ClickHouse Cloud {#compression-in-clickhouse-cloud}

В ClickHouse Cloud мы по умолчанию используем алгоритм сжатия `ZSTD` (со значением по умолчанию 1). Хотя скорости сжатия могут варьироваться для этого алгоритма в зависимости от уровня сжатия (выше = медленнее), он имеет преимущество постоянной скорости на разжатии (около 20% вариации) и также позволяет параллелизацию. Наши исторические тесты также показывают, что этот алгоритм часто достаточно эффективен и даже может превзойти `LZ4`, комбинированный с кодеком. Он эффективен для большинства типов данных и распределений информации, и, следовательно, является разумным универсальным вариантом по умолчанию, по этой причине наше начальное сжатие уже отлично, даже без оптимизации.
