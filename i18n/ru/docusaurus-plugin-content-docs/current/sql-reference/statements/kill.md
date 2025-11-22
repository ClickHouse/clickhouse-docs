---
description: 'Документация по оператору KILL'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'Операторы KILL'
doc_type: 'reference'
---

Существует два вида операторов KILL: для завершения запроса и для завершения мутации.



## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Принудительно завершает выполняющиеся в данный момент запросы.
Запросы для завершения выбираются из таблицы system.processes с использованием критериев, определённых в условии `WHERE` запроса `KILL`.

Примеры:

Сначала необходимо получить список незавершённых запросов. Следующий SQL-запрос выводит их в порядке убывания времени выполнения:

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

Завершение запроса:

```sql
-- Принудительно завершает все запросы с указанным query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Синхронно завершает все запросы, выполняемые пользователем 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip
При завершении запроса в ClickHouse Cloud или в самостоятельно управляемом кластере обязательно используйте опцию `ON CLUSTER [cluster-name]`, чтобы гарантировать завершение запроса на всех репликах.
:::

Пользователи с правами только на чтение могут останавливать только свои собственные запросы.

По умолчанию используется асинхронная версия (`ASYNC`), которая не ожидает подтверждения остановки запросов.

Синхронная версия (`SYNC`) ожидает остановки всех запросов и отображает информацию о каждом процессе по мере его остановки.
Ответ содержит столбец `kill_status`, который может принимать следующие значения:

1.  `finished` – запрос успешно завершён.
2.  `waiting` – ожидание завершения запроса после отправки сигнала остановки.
3.  Другие значения объясняют, почему запрос не может быть остановлен.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список запросов для остановки.


## KILL MUTATION {#kill-mutation}

Наличие долго выполняющихся или незавершённых мутаций часто указывает на то, что служба ClickHouse работает неэффективно. Асинхронная природа мутаций может привести к тому, что они потребляют все доступные ресурсы системы. Возможно, потребуется:

- Приостановить все новые мутации, операции `INSERT` и `SELECT` и дождаться завершения очереди мутаций.
- Или вручную прервать некоторые из этих мутаций, отправив команду `KILL`.

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

Пытается отменить и удалить выполняющиеся в данный момент [мутации](/sql-reference/statements/alter#mutations). Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, указанного в условии `WHERE` запроса `KILL`.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список мутаций для остановки.

Примеры:

Получить количество (`count()`) незавершённых мутаций:

Количество мутаций на одном узле ClickHouse:

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

Количество мутаций в кластере реплик ClickHouse:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

Запросить список незавершённых мутаций:

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

Прервать мутации по необходимости:

```sql
-- Отменить и удалить все мутации одной таблицы:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Отменить конкретную мутацию:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Запрос полезен, когда мутация зависла и не может завершиться (например, если какая-либо функция в запросе мутации выбрасывает исключение при применении к данным, содержащимся в таблице).

Изменения, уже внесённые мутацией, не откатываются.

:::note
Столбец `is_killed=1` (только для ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Мутация может оставаться в состоянии, где `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая долго выполняющаяся мутация блокирует прерванную мутацию. Это нормальная ситуация.
:::
