---
slug: '/guides/replacing-merge-tree'
description: 'Использование движка ReplacingMergeTree в ClickHouse'
title: ReplacingMergeTree
keywords: ['replacingmergetree', 'вставки', 'дедупликация']
doc_type: guide
---
import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

While transactional databases are optimized for transactional update and delete workloads, OLAP databases offer reduced guarantees for such operations. Instead, they optimize for immutable data inserted in batches for the benefit of significantly faster analytical queries. While ClickHouse offers update operations through mutations, as well as a lightweight means of deleting rows, its column-orientated structure means these operations should be scheduled with care, as described above. These operations are handled asynchronously, processed with a single thread, and require (in the case of updates) data to be rewritten on disk. They should thus not be used for high numbers of small changes.  
Для обработки потока обновлений и удалений строк, избегая вышеуказанных паттернов использования, мы можем использовать движок таблиц ClickHouse ReplacingMergeTree.

## Автоматические вставки обновлений для добавленных строк {#automatic-upserts-of-inserted-rows}

Движок таблиц [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) позволяет применять операции обновления к строкам, не требуя использования неэффективных операторов `ALTER` или `DELETE`, предлагая возможность пользователям вставлять несколько копий одной и той же строки и обозначать одну из них как последнюю версию. Фоновый процесс, в свою очередь, асинхронно удаляет более старые версии одной и той же строки, эффективно имитируя операцию обновления с помощью неизменяемых вставок.  
Это основано на способности движка таблицы идентифицировать дубликаты строк. Это достигается с использованием клаузулы `ORDER BY` для определения уникальности, т.е. если две строки имеют одинаковые значения для колонок, указанных в `ORDER BY`, они считаются дубликатами. Колонка `version`, указанная при определении таблицы, позволяет сохранить последнюю версию строки, когда две строки идентифицируются как дубликаты; т.е. строка с наибольшим значением версии сохраняется.  
Мы иллюстрируем этот процесс в приведенном ниже примере. Здесь строки уникально идентифицируются по колонке A (параметр `ORDER BY` для таблицы). Мы предполагаем, что эти строки были вставлены в два пакета, что привело к образованию двух частей данных на диске. Позже, в процессе асинхронной фоновой обработки, эти части объединяются.

ReplacingMergeTree дополнительно позволяет указать колонку удаления. Эта колонка может содержать либо 0, либо 1, где значение 1 указывает на то, что строка (и ее дубликаты) были удалены, а 0 используется в противном случае. **Примечание: Удаленные строки не будут удалены во время слияния.**

В процессе слияния частей происходит следующее:

- Строка, обозначенная значением 1 для колонки A, имеет как обновленную строку с версией 2, так и удаленную строку с версией 3 (и значением колонки удаления равным 1). Поэтому последняя строка, отмеченная как удаленная, сохраняется.
- Строка, обозначенная значением 2 для колонки A, имеет две обновленные строки. Последняя строка сохраняется со значением 6 для колонки цены.
- Строка, обозначенная значением 3 для колонки A, имеет строку с версией 1 и удаленную строку с версией 2. Эта удаленная строка сохраняется.

В результате этого процесса слияния у нас есть четыре строки, представляющие конечное состояние:

<br />

<Image img={postgres_replacingmergetree} size="md" alt="Процесс ReplacingMergeTree"/>

<br />

Обратите внимание, что удаленные строки никогда не удаляются. Их можно принудительно удалить с помощью `OPTIMIZE table FINAL CLEANUP`. Это требует установки экспериментального параметра `allow_experimental_replacing_merge_with_cleanup=1`. Это следует делать только при выполнении следующих условий:

1. Вы можете быть уверены, что после выполнения операции не будут вставлены строки со старыми версиями (для тех, которые удаляются при очистке). Если они будут вставлены, они будут неправильно сохранены, так как удаленные строки больше не будут присутствовать.
2. Убедитесь, что все реплики синхронизированы перед выполнением очистки. Это можно сделать с помощью команды:

<br />

```sql
SYSTEM SYNC REPLICA table
```

Мы рекомендуем приостановить вставки, как только (1) будет гарантировано, и до завершения выполнения этой команды и последующей очистки.

> Обработка удалений с помощью ReplacingMergeTree рекомендуется только для таблиц с малым до умеренного количеством удалений (менее 10%), если только не могут быть запланированы периоды очистки с указанными выше условиями.

> Совет: Пользователи также могут выполнить `OPTIMIZE FINAL CLEANUP` для выборочных партиций, которые больше не подлежат изменениям.

## Выбор первичного/дедупликационного ключа {#choosing-a-primarydeduplication-key}

Выше мы выделили важное дополнительное ограничение, которое также должно быть соблюдено в случае ReplacingMergeTree: значения колонок `ORDER BY` уникально идентифицируют строку при изменениях. Если вы мигрируете из транзакционной базы данных, такой как Postgres, то оригинальный первичный ключ Postgres должен быть включен в клаузу `ORDER BY` ClickHouse.

Пользователи ClickHouse знакомы с выбором колонок в клаузе `ORDER BY` для [оптимизации производительности запросов](/data-modeling/schema-design#choosing-an-ordering-key). В общем, эти колонки должны быть выбраны на основе ваших [частых запросов и перечислены в порядке возрастания кардинальности](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales). Важно отметить, что ReplacingMergeTree накладывает дополнительное ограничение — эти колонки должны быть неизменяемыми, т.е. если вы реплицируете из Postgres, добавляйте колонки в эту клаузу только в том случае, если они не изменяются в исходных данных Postgres. Хотя другие колонки могут изменяться, эти колонки должны оставаться постоянными для уникальной идентификации строк.  
Для аналитических нагрузок первичный ключ Postgres обычно мало полезен, так как пользователи редко выполняют поиск по конкретным строкам. Учитывая, что мы рекомендуем упорядочивать колонки в порядке возрастания кардинальности, а также тот факт, что совпадения по [колонкам, перечисленным ранее в ORDER BY, обычно будут быстрее](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently), первичный ключ Postgres следует добавлять в конец `ORDER BY` (если он не имеет аналитической ценности). Если несколько колонок формируют первичный ключ в Postgres, их следует добавлять в `ORDER BY`, соблюдая кардинальность и вероятность значения запроса. Пользователи также могут захотеть сгенерировать уникальный первичный ключ, используя конкатенацию значений через `MATERIALIZED` колонку.

Рассмотрим таблицу постов из набора данных Stack Overflow.

```sql
CREATE TABLE stackoverflow.posts_updateable
(
       `Version` UInt32,
       `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(Version, Deleted)
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)
```

Мы используем ключ `ORDER BY` `(PostTypeId, toDate(CreationDate), CreationDate, Id)`. Колонка `Id`, уникальная для каждого поста, обеспечивает дедупликацию строк. Колонка `Version` и колонка `Deleted` добавляются в схему по мере необходимости.  

## Запросы к ReplacingMergeTree {#querying-replacingmergetree}

Во время слияния ReplacingMergeTree идентифицирует дубликаты строк, используя значения колонок `ORDER BY` в качестве уникального идентификатора, и либо сохраняет только наивысшую версию, либо удаляет все дубликаты, если последняя версия указывает на удаление. Однако это обеспечивает только конечную корректность - это не гарантирует, что строки будут дедуплицированы, и на это не следует полагаться. Таким образом, запросы могут давать неправильные ответы из-за того, что обновленные и удаленные строки учитываются в запросах.

Чтобы получить правильные ответы, пользователи должны дополнять фоновые слияния дедупликацией и удалением строк во время выполнения запросов. Это можно сделать с помощью оператора `FINAL`.

Рассмотрим упомянутую выше таблицу постов. Мы можем использовать нормальный метод загрузки этого набора данных, но указать колонку удаления и колонку версии, добавив значения 0. Для примера мы загружаем только 10 000 строк.

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

Давайте подтвердим количество строк:

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Теперь мы обновляем нашу статистику ответов на посты. Вместо обновления этих значений мы вставляем новые копии 5000 строк и увеличиваем их номер версии на один (это означает, что 150 строк будет в таблице). Мы можем смоделировать это с помощью простого `INSERT INTO SELECT`:

```sql
INSERT INTO posts_updateable SELECT
        Version + 1 AS Version,
        Deleted,
        Id,
        PostTypeId,
        AcceptedAnswerId,
        CreationDate,
        Score,
        ViewCount,
        Body,
        OwnerUserId,
        OwnerDisplayName,
        LastEditorUserId,
        LastEditorDisplayName,
        LastEditDate,
        LastActivityDate,
        Title,
        Tags,
        AnswerCount,
        CommentCount,
        FavoriteCount,
        ContentLicense,
        ParentId,
        CommunityOwnedDate,
        ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0
LIMIT 5000

0 rows in set. Elapsed: 4.056 sec. Processed 1.42 million rows, 2.20 GB (349.63 thousand rows/s., 543.39 MB/s.)
```

Кроме того, мы удаляем 1000 случайных постов, повторно вставляя строки, но со значением колонки удаления равным 1. Снова смоделировать это можно с помощью простого `INSERT INTO SELECT`.

```sql
INSERT INTO posts_updateable SELECT
        Version + 1 AS Version,
        1 AS Deleted,
        Id,
        PostTypeId,
        AcceptedAnswerId,
        CreationDate,
        Score,
        ViewCount,
        Body,
        OwnerUserId,
        OwnerDisplayName,
        LastEditorUserId,
        LastEditorDisplayName,
        LastEditDate,
        LastActivityDate,
        Title,
        Tags,
        AnswerCount + 1 AS AnswerCount,
        CommentCount,
        FavoriteCount,
        ContentLicense,
        ParentId,
        CommunityOwnedDate,
        ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0 AND AnswerCount > 0
LIMIT 1000

0 rows in set. Elapsed: 0.166 sec. Processed 135.53 thousand rows, 212.65 MB (816.30 thousand rows/s., 1.28 GB/s.)
```

Результатом вышеуказанных операций будут 16 000 строк, т.е. 10 000 + 5000 + 1000. Правильная общая сумма здесь — на самом деле, у нас должно быть только 1000 строк меньше, чем наша оригинальная общая сумма, т.е. 10 000 - 1000 = 9000.

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

Ваши результаты могут варьироваться в зависимости от произошедших слияний. Мы видим, что в этом случае общая сумма отличается, так как у нас есть дубликаты строк. Применение `FINAL` к таблице дает правильный результат.

```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│    9000 │
└─────────┘

1 row in set. Elapsed: 0.006 sec. Processed 11.81 thousand rows, 212.54 KB (2.14 million rows/s., 38.61 MB/s.)
Peak memory usage: 8.14 MiB.
```

## Производительность FINAL {#final-performance}

Оператор `FINAL` действительно имеет небольшие накладные расходы на производительность запросов.  
Это будет наиболее заметно, когда запросы не фильтруются по колонкам первичного ключа, что приводит к чтению большего объема данных и увеличению накладных расходов на дедупликацию. Если пользователи фильтруют по ключевым колонкам, используя условие `WHERE`, объем загружаемых данных и передаваемых для дедупликации данных будет уменьшен.  

Если условие `WHERE` не использует колонку ключа, ClickHouse в настоящее время не использует оптимизацию `PREWHERE`, когда используется `FINAL`. Эта оптимизация направлена на снижение числа читаемых строк для неотфильтрованных колонок. Примеры эмуляции этого `PREWHERE` и, таким образом, потенциального улучшения производительности можно найти [здесь](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance).

## Использование партиций с ReplacingMergeTree {#exploiting-partitions-with-replacingmergetree}

Слияние данных в ClickHouse происходит на уровне партиций. При использовании ReplacingMergeTree мы рекомендуем пользователям разбивать свою таблицу на партиции в соответствии с лучшими практиками, при условии, что пользователи могут гарантировать, что **ключ партиционирования не меняется для строки**. Это обеспечит отправку обновлений, относящихся к одной и той же строке, в одну и ту же партицию ClickHouse. Вы можете повторно использовать тот же ключ партиционирования, что и в Postgres, при условии, что вы соблюдаете описанные здесь лучшие практики.

При условии, что это так, пользователи могут использовать настройку `do_not_merge_across_partitions_select_final=1` для улучшения производительности запросов `FINAL`. Эта настройка заставляет партиции объединяться и обрабатываться независимо при использовании FINAL.

Рассмотрим следующую таблицу постов, где мы не используем партиционирование:

```sql
CREATE TABLE stackoverflow.posts_no_part
(
        `Version` UInt32,
        `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        ...
)
ENGINE = ReplacingMergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

INSERT INTO stackoverflow.posts_no_part SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 182.895 sec. Processed 59.82 million rows, 38.07 GB (327.07 thousand rows/s., 208.17 MB/s.)
```

Чтобы убедиться, что `FINAL` требуется выполнить какую-то работу, мы обновляем 1 миллион строк - увеличивая их `AnswerCount`, вставляя дублирующиеся строки.

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

Вычисление суммы ответов за год с использованием `FINAL`:

```sql
SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_no_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │        371480 │
...
│ 2024 │        127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 2.338 sec. Processed 122.94 million rows, 1.84 GB (52.57 million rows/s., 788.58 MB/s.)
Peak memory usage: 2.09 GiB.
```

Повторение этих же шагов для таблицы, разбиваемой по годам, и повторение вышеуказанного запроса с `do_not_merge_across_partitions_select_final=1`.

```sql
CREATE TABLE stackoverflow.posts_with_part
(
        `Version` UInt32,
        `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        ...
)
ENGINE = ReplacingMergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

// populate & update omitted

SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_with_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │       387832  │
│ 2009 │       1165506 │
│ 2010 │       1755437 │
...
│ 2023 │       787032  │
│ 2024 │       127765  │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

Как показано, партиционирование значительно улучшило производительность запросов в этом случае, позволяя процессу дедупликации выполняться на уровне партиций параллельно.

## Соображения по поведению слияния {#merge-behavior-considerations}

Механизм выбора слияния ClickHouse выходит за рамки простого слияния частей. Ниже мы рассмотрим это поведение в контексте ReplacingMergeTree, включая параметры конфигурации для включения более агрессивного слияния старых данных и соображения для больших частей.

### Логика выбора слияния {#merge-selection-logic}

Хотя цель слияния заключается в минимизации числа частей, она также учитывает эту цель в контексте стоимости увеличения записи. Соответственно, некоторые диапазоны частей исключаются из слияния, если это приведет к чрезмерному увеличению записи, на основе внутренних расчетов. Это поведение помогает предотвратить ненужное использование ресурсов и продлевает срок службы компонентов хранения.

### Поведение слияния больших частей {#merging-behavior-on-large-parts}

Движок ReplacingMergeTree в ClickHouse оптимизирован для управления дублирующимися строками путем слияния частей данных, сохраняя только последнюю версию каждой строки на основе указанного уникального ключа. Однако, когда объединенная часть достигает порога max_bytes_to_merge_at_max_space_in_pool, она больше не будет выбрана для дальнейшего слияния, даже если установлен параметр min_age_to_force_merge_seconds. В результате автоматические слияния больше не могут полагаться на удаление дубликатов, которые могут накапливаться с продолжением ввода данных.

Чтобы решить эту проблему, пользователи могут вызвать OPTIMIZE FINAL для ручного слияния частей и удаления дубликатов. В отличие от автоматических слияний, OPTIMIZE FINAL обходится без порога max_bytes_to_merge_at_max_space_in_pool, сливая части, основываясь исключительно на доступных ресурсах, особенно дисковом пространстве, пока в каждой партиции не останется одна часть. Однако этот подход может потребовать большого объема памяти для больших таблиц и может требовать неоднократного выполнения по мере добавления новых данных.

Для более устойчивого решения, которое поддерживает производительность, рекомендуется разбить таблицу на партиции. Это поможет предотвратить достижение частями максимального размера для слияния и снизить необходимость в постоянной ручной оптимизации.

### Партиционирование и слияние между партициями {#partitioning-and-merging-across-partitions}

Как обсуждалось в разделе Использование партиций с ReplacingMergeTree, мы рекомендуем разбивать таблицы на партиции как лучшую практику. Партиционирование изолирует данные для более эффективных слияний и предотвращает слияние между партициями, особенно во время выполнения запросов. Это поведение усиливается в версиях с 23.12 и выше: если ключ партиционирования является префиксом ключа сортировки, слияние между партициями не выполняется во время выполнения запросов, что приводит к более быстрой производительности запросов.

### Настройка слияний для улучшения производительности запросов {#tuning-merges-for-better-query-performance}

По умолчанию параметры min_age_to_force_merge_seconds и min_age_to_force_merge_on_partition_only установлены на 0 и false соответственно, отключая эти функции. В этой конфигурации ClickHouse будет применять стандартное поведение слияния без принудительного слияния на основе возраста партиций.

Если указано значение для min_age_to_force_merge_seconds, ClickHouse будет игнорировать обычные эвристики слияния для частей, старше указанного периода. Хотя это обычно эффективно только в случае, если цель состоит в том, чтобы минимизировать общее количество частей, это может улучшить производительность запросов в ReplacingMergeTree, уменьшая количество частей, которые необходимо слить во время выполнения запроса.

Это поведение можно дополнительно настроить, установив min_age_to_force_merge_on_partition_only=true, требуя, чтобы все части в партиции были старше min_age_to_force_merge_seconds для агрессивного слияния. Эта конфигурация позволяет старым партициям сливать до одной части со временем, что консолидирует данные и поддерживает производительность запросов.

### Рекомендуемые настройки {#recommended-settings}

:::warning  
Настройка поведения слияния является продвинутой операцией. Мы рекомендуем проконсультироваться с поддержкой ClickHouse перед включением этих настроек в рабочих нагрузках на производстве.  
:::

В большинстве случаев рекомендуется установить min_age_to_force_merge_seconds на низкое значение — значительно меньше, чем период партиционирования. Это минимизирует количество частей и предотвращает ненужное слияние во время выполнения запросов с оператором FINAL.

Например, рассмотрим месячное партиционирование, которое уже было объединившимся в одну часть. Если небольшая случайная вставка создаёт новую часть внутри этой партиции, производительность запросов может пострадать, так как ClickHouse должен прочитать несколько частей, пока слияние не завершится. Установка min_age_to_force_merge_seconds может гарантировать, что эти части будут агрессивно объединены, предотвращая ухудшение производительности запросов.