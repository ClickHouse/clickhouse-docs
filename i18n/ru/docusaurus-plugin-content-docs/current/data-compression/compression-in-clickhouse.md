---
slug: /data-compression/compression-in-clickhouse
title: Сжатие в ClickHouse
description: Выбор алгоритмов сжатия ClickHouse
keywords: ['compression', 'codec', 'encoding']
---

Одним из секретов производительности запросов ClickHouse является сжатие.

Меньше данных на диске означает меньше I/O и более быстрые запросы и вставки. Накладные расходы любого алгоритма сжатия относительно CPU в большинстве случаев будут перевешены сокращением I/O. Поэтому улучшение сжатия данных должно быть первой задачей при работе над обеспечением быстрой работы запросов ClickHouse.

> Для получения информации о том, почему ClickHouse так хорошо сжимает данные, мы рекомендуем [статью](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Вкратце, как колоночной базе данных, значения будут записываться в порядке колонок. Если эти значения отсортированы, то одинаковые значения будут расположены рядом друг с другом. Алгоритмы сжатия используют смежные шаблоны данных. Кроме того, ClickHouse имеет кодеки и детализированные типы данных, которые позволяют пользователям дополнительно настраивать методы сжатия.

Сжатие в ClickHouse будет зависеть от 3 основных факторов:
- Ключ сортировки
- Типы данных
- Какой кодек используется

Все это настраивается через схему.

## Выбор правильного типа данных для оптимизации сжатия {#choose-the-right-data-type-to-optimize-compression}

Давайте возьмем в качестве примера набор данных Stack Overflow. Сравним статистику сжатия для следующих схем таблицы `posts`:

- `posts` - Непрограммированная схема без ключа сортировки.
- `posts_v3` - Оптимизированная по типу схема с соответствующим типом и размером бит для каждой колонки с ключом сортировки `(PostTypeId, toDate(CreationDate), CommentCount)`.

Используя следующие запросы, мы можем измерить текущий сжатый и несжатый размер каждой колонки. Давайте посмотрим на размер начальной оптимизированной схемы `posts` без ключа сортировки.

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body              	│ 46.14 GiB   	  │ 127.31 GiB        │	2.76       │
│ Title             	│ 1.20 GiB    	  │ 2.63 GiB          │	2.19       │
│ Score             	│ 84.77 MiB   	  │ 736.45 MiB        │	8.69       │
│ Tags              	│ 475.56 MiB  	  │ 1.40 GiB          │	3.02       │
│ ParentId          	│ 210.91 MiB  	  │ 696.20 MiB        │ 3.3        │
│ Id                	│ 111.17 MiB  	  │ 736.45 MiB        │	6.62       │
│ AcceptedAnswerId  	│ 81.55 MiB   	  │ 736.45 MiB        │	9.03       │
│ ClosedDate        	│ 13.99 MiB   	  │ 517.82 MiB        │ 37.02      │
│ LastActivityDate  	│ 489.84 MiB  	  │ 964.64 MiB        │	1.97       │
│ CommentCount      	│ 37.62 MiB   	  │ 565.30 MiB        │ 15.03      │
│ OwnerUserId       	│ 368.98 MiB  	  │ 736.45 MiB        │ 2          │
│ AnswerCount       	│ 21.82 MiB   	  │ 622.35 MiB        │ 28.53      │
│ FavoriteCount     	│ 280.95 KiB  	  │ 508.40 MiB        │ 1853.02    │
│ ViewCount         	│ 95.77 MiB   	  │ 736.45 MiB        │	7.69       │
│ LastEditorUserId  	│ 179.47 MiB  	  │ 736.45 MiB        │ 4.1        │
│ ContentLicense    	│ 5.45 MiB    	  │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName  	│ 14.30 MiB   	  │ 142.58 MiB        │	9.97       │
│ PostTypeId        	│ 20.93 MiB   	  │ 565.30 MiB        │ 27         │
│ CreationDate      	│ 314.17 MiB  	  │ 964.64 MiB        │	3.07       │
│ LastEditDate      	│ 346.32 MiB  	  │ 964.64 MiB        │	2.79       │
│ LastEditorDisplayName │ 5.46 MiB    	  │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate	│ 2.21 MiB    	  │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

Мы показываем как сжатый, так и несжатый размер. Оба важны. Сжатый размер соответствует тому, что нам нужно считать с диска - то, что мы хотим минимизировать для производительности запросов (и стоимости хранения). Эти данные необходимо будет декомпрессировать перед чтением. Размер этой несжатой величины будет зависеть от используемого типа данных в данном случае. Минимизация этого размера уменьшит накладные расходы памяти запросов и количество данных, которые должны быть обработаны запросом, улучшая использование кешей и, в конечном итоге, время выполнения запросов.

> Вышеуказанный запрос зависит от таблицы `columns` в системной базе данных. Эта база данных управляется ClickHouse и является сокровищницей полезной информации, начиная от метрик производительности запросов и заканчивая фоновыми логами кластера. Мы рекомендуем ["Системные таблицы и взгляд в внутренности ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) и сопутствующие статьи[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) для любопытного читателя.

Чтобы подвести итоги общего размера таблицы, мы можем упростить вышеуказанный запрос:

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB   	  │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

Повторяя этот запрос для `posts_v3`, таблицы с оптимизированным типом и ключом сортировки, мы можем увидеть значительное сокращение несжатого и сжатого размеров.

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB   	  │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

Полная разбивка колонок показывает значительные экономии для колонок `Body`, `Title`, `Tags` и `CreationDate`, достигнутые за счет упорядочивания данных перед сжатием и использования соответствующих типов.

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

## Выбор правильного кодека сжатия колонки {#choosing-the-right-column-compression-codec}

С помощью кодеков сжатия колонок мы можем изменить алгоритм (и его настройки), используемый для кодирования и сжатия каждой колонки.

Кодирование и сжатие работают немного иначе, но имеют одну цель: сократить размер наших данных. Кодирования применяют отображение к нашим данным, преобразуя значения на основе функции, используя свойства типа данных. Напротив, сжатие использует общий алгоритм для сжатия данных на уровне байтов.

Как правило, кодирования применяются в первую очередь, прежде чем будет использовано сжатие. Поскольку разные кодирования и алгоритмы сжатия эффективны при различных распределениях значений, мы должны понимать наши данные.

ClickHouse поддерживает множество кодеков и алгоритмов сжатия. Вот некоторые рекомендации в порядке важности:

Рекомендация                                      | Обоснование
---                                               |    ---
**`ZSTD` везде**                                  | Сжатие `ZSTD` предлагает лучшие коэффициенты сжатия. `ZSTD(1)` должен быть установлен по умолчанию для большинства общих типов. Более высокие коэффициенты сжатия можно попробовать, изменяя числовое значение. Мы редко наблюдаем достаточные преимущества при значениях выше 3 из-за увеличенных затрат на сжатие (более медленная вставка).
**`Delta` для последовательностей дат и целых чисел** | Кодеки на основе `Delta` хорошо работают каждый раз, когда у вас есть монотонные последовательности или небольшие дельты в последовательных значениях. Более конкретно, кодек Delta работает хорошо, если производные дают маленькие числа. Если нет, то стоит попробовать `DoubleDelta` (это обычно добавляет мало, если первая производная от `Delta` уже очень мала). Последовательности, где монотонное увеличение является равномерным, будут сжиматься еще лучше, например, поля DateTime.
**`Delta` улучшает `ZSTD`**                       | `ZSTD` является эффективным кодеком для дельта-данных - наоборот, дельта-кодирование может улучшить сжатие `ZSTD`. В присутствии `ZSTD` другие кодеки редко предлагают дополнительное улучшение.
**`LZ4` вместо `ZSTD`, если возможно**             | Если вы получаете сопоставимое сжатие между `LZ4` и `ZSTD`, предпочитайте первое, так как оно предлагает более быстрое декомпрессирование и требует меньше CPU. Однако `ZSTD` часто значительно превосходит `LZ4` в большинстве случаев. Некоторые из этих кодеков могут работать быстрее в комбинации с `LZ4`, обеспечивая аналогичное сжатие по сравнению с `ZSTD` без кодека. Это будет специфично для данных, однако, и требует тестирования.
**`T64` для разреженных или малых диапазонов**    | `T64` может быть эффективным для разреженных данных или когда диапазон в блоке мал. Избегайте `T64` для случайных чисел.
**`Gorilla` и `T64` для неизвестных паттернов?**   | Если данные имеют неизвестный паттерн, стоит попробовать `Gorilla` и `T64`.
**`Gorilla` для данных с измерениями**             | `Gorilla` может быть эффективным для данных с плавающей точкой, особенно тех, которые представляют показания измерений, т.е. случайные всплески.

Смотрите [здесь](/sql-reference/statements/create/table#column_compression_codec) для других опций.

Ниже мы указываем кодек `Delta` для `Id`, `ViewCount` и `AnswerCount`, предполагая, что они будут линейно коррелированы с ключом сортировки и, следовательно, должны извлечь выгоду от дельта-кодирования.

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

Улучшения сжатия для этих колонок показаны ниже:

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
│ posts_v3 │ AnswerCount │ 9.67 MiB    	   │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB   	   │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id      	 │ 159.70 MiB  	   │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id      	 │ 64.91 MiB   	   │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB   	   │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB   	   │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### Сжатие в ClickHouse Cloud {#compression-in-clickhouse-cloud}

В ClickHouse Cloud по умолчанию используется алгоритм сжатия `ZSTD` (с установленным значением по умолчанию 1). Хотя скорости сжатия могут варьироваться для этого алгоритма в зависимости от уровня сжатия (выше = медленнее), у него есть преимущество в том, что он последовательно быстро разжимается (разница около 20%) и также имеет возможность быть параллелизованным. Наши исторические тесты также показывают, что этот алгоритм часто является достаточно эффективным и может даже превосходить `LZ4`, комбинированным с кодеком. Он эффективен для большинства типов данных и распределений информации, и поэтому является разумным общим вариантом по умолчанию, и именно поэтому наше начальное сжатие уже отлично, даже без оптимизации.
