---
title: "Использование операторов JOIN в ClickHouse"
description: "Как объединять таблицы в ClickHouse"
keywords: ["join-операции", "объединение таблиц"]
slug: /guides/joining-tables
doc_type: "guide"
---

import Image from "@theme/IdealImage"
import joins_1 from "@site/static/images/guides/joins-1.png"
import joins_2 from "@site/static/images/guides/joins-2.png"
import joins_3 from "@site/static/images/guides/joins-3.png"
import joins_4 from "@site/static/images/guides/joins-4.png"
import joins_5 from "@site/static/images/guides/joins-5.png"

ClickHouse имеет [полную поддержку `JOIN`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1) с широким выбором алгоритмов соединения. Для максимальной производительности рекомендуется следовать рекомендациям по оптимизации соединений, перечисленным в этом руководстве.

* Для оптимальной производительности пользователям следует стремиться сократить количество `JOIN` в запросах, особенно для аналитических нагрузок в реальном времени, где требуется время отклика на уровне миллисекунд. Старайтесь ограничиваться максимум 3–4 `JOIN` в запросе. Мы подробно рассматриваем ряд подходов, позволяющих минимизировать количество `JOIN`, в [разделе моделирования данных](/data-modeling/schema-design), включая денормализацию, словари и материализованные представления.
* Начиная с ClickHouse 24.12, планировщик запросов автоматически перестраивает порядок соединения двух таблиц, помещая меньшую таблицу справа для оптимальной производительности. В версии 25.9 этот механизм был расширен: теперь оптимизируется порядок соединений в запросах с тремя и более таблицами.
* Если в вашем запросе требуется прямое соединение, т. е. `LEFT ANY JOIN`, как показано ниже, мы рекомендуем по возможности использовать [Dictionaries](/dictionary).

<Image img={joins_1} size="sm" alt="LEFT ANY JOIN" />

* При выполнении внутренних соединений (`INNER JOIN`) часто более эффективно записывать их в виде подзапросов с использованием оператора `IN`. Рассмотрим следующие запросы, которые функционально эквивалентны. Оба находят количество `posts`, в которых ClickHouse не упоминается в вопросе, но упоминается в `comments`.

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

Обратите внимание, что мы используем `ANY INNER JOIN`, а не просто `INNER JOIN`, так как не хотим получать декартово произведение — нам нужно только одно совпадение для каждого поста.

Этот JOIN можно переписать в виде подзапроса, что значительно улучшит производительность:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
        SELECT PostId
        FROM stackoverflow.comments
        WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
Peak memory usage: 323.52 MiB.
```

Хотя ClickHouse пытается протолкнуть условия во все выражения `JOIN` и подзапросы, мы рекомендуем всегда вручную применять условия ко всем частям запроса, где это возможно — тем самым минимизируя объём данных для `JOIN`. Рассмотрим следующий пример, где мы хотим вычислить количество голосов «за» для постов, связанных с Java, начиная с 2020 года.

Наивный запрос, с более крупной таблицей слева, выполняется за 56 секунд:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 56.642 sec. Processed 252.30 million rows, 1.62 GB (4.45 million rows/s., 28.60 MB/s.)
```

Перестановка порядка этого соединения значительно повышает производительность — до 1,5 с:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
```

Добавление фильтра в левую таблицу ещё больше повышает производительность — до 0,5 с.

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
Peak memory usage: 249.42 MiB.
```

Этот запрос можно ещё больше улучшить, перенеся `INNER JOIN` во вложенный запрос, как уже отмечалось ранее, сохранив при этом фильтр как во внешнем, так и во внутреннем запросах.

```sql
SELECT count() AS upvotes
FROM stackoverflow.votes
WHERE (VoteTypeId = 2) AND (PostId IN (
        SELECT Id
        FROM stackoverflow.posts
        WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
))

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.383 sec. Processed 99.64 million rows, 804.55 MB (259.85 million rows/s., 2.10 GB/s.)
Peak memory usage: 250.66 MiB.
```


## Выбор алгоритма JOIN \{#choosing-a-join-algorithm\}

ClickHouse поддерживает ряд [алгоритмов соединения](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1). Эти алгоритмы, как правило, представляют собой компромисс между потреблением памяти и производительностью. Ниже приведён обзор алгоритмов JOIN в ClickHouse с точки зрения их относительного потребления памяти и времени выполнения:

<br />

<Image img={joins_2} size="lg" alt="скорость относительно потребления памяти для JOIN"/>

<br />

Эти алгоритмы определяют, каким образом запрос JOIN планируется и выполняется. По умолчанию ClickHouse использует алгоритм прямого или хеш-соединения в зависимости от типа и строгости JOIN, а также движка присоединяемых таблиц. В качестве альтернативы ClickHouse можно настроить на адаптивный выбор и динамическую смену алгоритма JOIN во время выполнения в зависимости от доступности и использования ресурсов: когда `join_algorithm=auto`, ClickHouse сначала пробует алгоритм хеш-соединения, и если лимит памяти для этого алгоритма превышен, он на лету переключается на частичный merge join. Отследить, какой алгоритм был выбран, можно по трассировочному логированию. ClickHouse также позволяет пользователям самостоятельно указать требуемый алгоритм JOIN с помощью настройки `join_algorithm`.

Поддерживаемые типы `JOIN` для каждого алгоритма JOIN показаны ниже и должны учитываться при оптимизации:

<br />

<Image img={joins_3} size="lg" alt="возможности различных алгоритмов JOIN"/>

<br />

Полное подробное описание каждого алгоритма `JOIN` можно найти [здесь](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2), включая их преимущества, недостатки и характеристики масштабируемости.

Выбор подходящего алгоритма JOIN зависит от того, хотите ли вы оптимизировать по памяти или по производительности.

## Оптимизация производительности JOIN \{#optimizing-join-performance\}

Если вашим основным показателем оптимизации является производительность и вы хотите выполнить JOIN как можно быстрее, вы можете использовать следующую блок-схему для выбора подходящего алгоритма JOIN:

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** Если данные из правой таблицы можно заранее загрузить в расположенную в памяти key-value структуру данных с низкой задержкой, например словарь, и если ключ JOIN совпадает с ключевым атрибутом базового key-value хранилища, и если семантика `LEFT ANY JOIN` является достаточной — тогда можно применять **direct join**, который обеспечивает наивысшую скорость.

- **(2)** Если [физический порядок строк](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) в вашей таблице совпадает с порядком сортировки по ключу JOIN, то всё зависит от ситуации. В этом случае **full sorting merge join** [пропускает](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) фазу сортировки, что приводит к существенно меньшему использованию памяти и, в зависимости от объёма данных и распределения значений ключа JOIN, к более быстрому выполнению, чем некоторые алгоритмы hash join.

- **(3)** Если правая таблица помещается в память, даже с учётом [дополнительных накладных расходов по памяти](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary) у **parallel hash join**, то этот алгоритм или hash join могут быть быстрее. Это зависит от объёма данных, типов данных и распределения значений по столбцам ключа JOIN.

- **(4)** Если правая таблица не помещается в память, то снова всё зависит от ситуации. ClickHouse предлагает три алгоритма JOIN, не ограниченных объёмом оперативной памяти. Все три временно выгружают данные на диск. **Full sorting merge join** и **partial merge join** требуют предварительной сортировки данных. **Grace hash join** вместо этого строит по данным хеш-таблицы. В зависимости от объёма данных, типов данных и распределения значений по столбцам ключа JOIN возможны сценарии, когда построение хеш-таблиц по данным быстрее, чем сортировка данных, и наоборот.

Partial merge join оптимизирован для минимизации использования памяти при объединении больших таблиц — ценой скорости выполнения JOIN, которая получается довольно низкой. Это особенно заметно, когда физический порядок строк в левой таблице не совпадает с порядком сортировки по ключу JOIN.

Grace hash join является наиболее гибким из трёх алгоритмов JOIN, не ограниченных объёмом памяти, и обеспечивает хороший контроль баланса между использованием памяти и скоростью JOIN с помощью настройки [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759). В зависимости от объёма данных grace hash может быть как быстрее, так и медленнее, чем алгоритм partial merge, если количество [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) выбрано так, что использование памяти обоими алгоритмами примерно совпадает. Когда использование памяти grace hash join сконфигурировано так, чтобы оно было примерно сопоставимо с использованием памяти full sorting merge, в наших тестовых прогонах full sorting merge всегда был быстрее.

То, какой из трёх алгоритмов, не ограниченных объёмом памяти, окажется самым быстрым, зависит от объёма данных, типов данных и распределения значений по столбцам ключа JOIN. Всегда лучше запустить несколько бенчмарков с реалистичными объёмами и структурой данных, чтобы определить, какой алгоритм будет самым быстрым.

## Оптимизация по памяти \{#optimizing-for-memory\}

Если вы хотите оптимизировать `JOIN` на минимальное использование памяти, а не на максимально быстрое время выполнения, вы можете использовать следующее дерево решений:

<br />

<Image img={joins_5} size="lg" alt="Дерево решений по оптимизации потребления памяти при JOIN" />

<br />

- **(1)** Если физический порядок строк в вашей таблице совпадает с порядком сортировки по ключу `JOIN`, то потребление памяти у **full sorting merge join** будет минимально возможным. Дополнительным преимуществом является высокая скорость выполнения `JOIN`, поскольку фаза сортировки [отключается](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order).
- **(2)** **Grace hash join** можно настроить на очень низкое потребление памяти, [настроив](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) большое количество [бакетов](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) ценой снижения скорости `JOIN`. **Partial merge join** изначально спроектирован так, чтобы использовать малый объем оперативной памяти. **Full sorting merge join** с включенной внешней сортировкой, как правило, потребляет больше памяти, чем **partial merge join** (если порядок строк не совпадает с порядком сортировки по ключу), но обеспечивает значительно более высокую скорость выполнения `JOIN`.

Пользователям, которым требуется больше подробностей по указанному выше материалу, мы рекомендуем следующую [серию статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).