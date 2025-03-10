---
slug: /managing-data/drop_partition
sidebar_label: Удаление партиции
title: Удаление партиций
hide_title: false
---

## Обзор {#background}

Партиционирование задается для таблицы при её первоначальном определении с помощью оператора `PARTITION BY`. Этот оператор может содержать SQL-выражение по любым колонкам, результаты которого определят, в какую партицию будет отправлена строка.

Данные парты логически связаны с каждой партицией на диске и могут быть запрашиваемы изолированно. В приведенном ниже примере мы партиционируем таблицу `posts` по годам, используя выражение `toYear(CreationDate)`. По мере вставки строк в ClickHouse это выражение будет оцениваться для каждой строки и направляться в соответствующую партицию, если она существует (если строка первая для года, партиция будет создана).

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

Прочитайте о том, как задать выражение партиции в разделе [Как задать выражение партиции](/sql-reference/statements/alter/partition/#how-to-set-partition-expression).

В ClickHouse пользователи должны прежде всего рассматривать партиционирование как функцию управления данными, а не как технику оптимизации запросов. Логически разделяя данные по ключу, каждую партицию можно обрабатывать независимо, например, удалять. Это позволяет пользователям перемещать партиции и, таким образом, подмножества между [уровнями хранения](/integrations/s3#storage-tiers) эффективно по времени или [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition).

## Удаление партиций {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` предоставляет экономически эффективный способ удаления целой партиции.

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

Этот запрос помечает партицию как неактивную и полностью удаляет данные, что занимает примерно 10 минут. Запрос реплицируется – он удаляет данные на всех репликах.

В приведенном ниже примере мы удаляем посты 2008 года из ранее созданной таблицы, удаляя связанную партицию.

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 строк в наборе. Затраченное время: 0.002 сек.
	
	ALTER TABLE posts
	(DROP PARTITION '2008')

0 строк в наборе. Затраченное время: 0.103 сек.
```
