---
description: 'Документация по операторам KILL'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'Операторы KILL'
doc_type: 'reference'
---

Существуют две разновидности операторов KILL: для завершения запроса и для завершения мутации

## KILL QUERY \\{#kill-query\\}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Пытается принудительно завершить выполняющиеся в данный момент запросы.
Запросы для завершения отбираются из таблицы system.processes по критериям, заданным в `WHERE`-условии запроса `KILL`.

Примеры:

Сначала нужно получить список незавершённых запросов. Этот SQL-запрос выводит их, начиная с тех, что выполняются дольше всего:

Список с одного узла ClickHouse:

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM system.processes
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

Список из кластера ClickHouse:

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM clusterAllReplicas(default, system.processes)
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

Прервать выполнение запроса:

```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip
Если вы завершаете запрос в ClickHouse Cloud или в самостоятельно управляемом кластере, обязательно используйте оператор `ON CLUSTER [cluster-name]`, чтобы гарантировать, что запрос будет остановлен на всех репликах.
:::

Пользователи с правами только на чтение могут останавливать только собственные запросы.

По умолчанию используется асинхронный режим (`ASYNC`), который не ожидает подтверждения остановки запросов.

Синхронный режим (`SYNC`) ожидает завершения всех запросов и отображает информацию о каждом процессе по мере его остановки.
Ответ содержит столбец `kill_status`, который может принимать следующие значения:

1. `finished` – запрос был успешно завершён.
2. `waiting` – ожидание завершения запроса после отправки ему сигнала на завершение.
3. Другие значения объясняют, почему запрос не может быть остановлен.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список запросов, подлежащих остановке.

## ОТМЕНА МУТАЦИИ \\{#kill-mutation\\}

Наличие долго выполняющихся или незавершённых мутаций часто указывает на некорректную работу сервиса ClickHouse. Асинхронная природа мутаций может привести к тому, что они будут потреблять все доступные ресурсы системы. Вам может потребоваться либо:

* Приостановить все новые мутации, операции `INSERT` и `SELECT` и дать очереди мутаций полностью выполниться.
* Или вручную прервать выполнение некоторых из этих мутаций, отправив команду `KILL`.

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

Пытается отменить и удалить [мутации](/sql-reference/statements/alter#mutations), которые в данный момент выполняются. Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, заданного в предложении `WHERE` запроса `KILL`.

Проверочный запрос (`TEST`) только проверяет права пользователя и выводит список мутаций для остановки.

Примеры:

Получить `count()` незавершённых мутаций:

Количество мутаций с одного узла ClickHouse:

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

Количество мутаций из кластера реплик ClickHouse:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

Выполните запрос для получения списка незавершённых мутаций:

Список мутаций на одном узле ClickHouse:

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

Список мутаций в кластере ClickHouse:

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

При необходимости остановите мутации:

```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Этот запрос полезен, когда мутация «застряла» и не может завершиться (например, если какая‑то функция в запросе мутации выбрасывает исключение при применении к данным, содержащимся в таблице).

Изменения, уже выполненные мутацией, не откатываются.

:::note
Значение `is_killed=1` в столбце (только в ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Возможна ситуация, когда мутация остаётся в состоянии, где `is_killed=1` и `is_done=0` в течение продолжительного времени. Это может произойти, если «убитую» мутацию блокирует другая, долго выполняющаяся мутация. Это нормальная ситуация.
:::
