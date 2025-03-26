---
slug: /managing-data/drop_partition
sidebar_label: 'Удаление Раздела'
title: 'Удаление Разделов'
hide_title: false
description: 'Страница, описывающая удаление разделов'
---

## Фон {#background}

Разделение задается для таблицы, когда она определяется изначально с помощью оператора `PARTITION BY`. Этот оператор может содержать SQL выражение по любым столбцам, результаты которого определят, в какой раздел будет отправлена строка.

Части данных логически связаны с каждым разделом на диске и могут запрашиваться изолированно. В следующем примере мы разделяем таблицу `posts` по годам, используя выражение `toYear(CreationDate)`. По мере вставки строк в ClickHouse это выражение будет оцениваться для каждой строки и направляться в результирующий раздел, если он существует (если строка является первой для года, раздел будет создан).

```sql
 CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

Узнайте о том, как установить выражение раздела в разделе [Как установить выражение раздела](/sql-reference/statements/alter/partition/#how-to-set-partition-expression).

В ClickHouse пользователи должны в первую очередь считать разделение функцией управления данными, а не техникой оптимизации запросов. Разделяя данные логически на основе ключа, каждый раздел может обрабатываться независимо, например, удаляться. Это позволяет пользователям перемещать разделы, а значит, подмножества, между [уровнями хранения](/integrations/s3#storage-tiers) эффективно по времени или [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition).

## Удаление Разделов {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` предоставляет экономичный способ удаления целого раздела.

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Этот запрос помечает раздел как неактивный и полностью удаляет данные, примерно за 10 минут. Запрос реплицируется – он удаляет данные на всех репликах.

В примере ниже мы удаляем посты 2008 года для ранее созданной таблицы, удаляя связанный раздел.

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 строк в наборе. Затрачено времени: 0.002 сек.

ALTER TABLE posts
(DROP PARTITION '2008')

0 строк в наборе. Затрачено времени: 0.103 сек.
```
