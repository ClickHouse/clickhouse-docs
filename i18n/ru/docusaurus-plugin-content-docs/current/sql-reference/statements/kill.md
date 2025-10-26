---
slug: '/sql-reference/statements/kill'
sidebar_label: KILL
sidebar_position: 46
description: 'Документация для KILL'
title: 'Команды KILL'
doc_type: reference
---
Существует два вида операторов kill: для завершения запроса и для завершения мутации.

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Пытается принудительно завершить выполняющиеся в данный момент запросы. Запросы для завершения выбираются из таблицы system.processes с использованием критериев, определенных в операторе `WHERE` запроса `KILL`.

Примеры:

Сначала вам нужно получить список незавершенных запросов. Этот SQL запрос предоставляет их согласно тому, какие выполняются дольше всего:

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
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
Если вы завершаете запрос в ClickHouse Cloud или в самоуправляемом кластере, убедитесь, что используете опцию ```ON CLUSTER [cluster-name]```, чтобы гарантировать завершение запроса на всех репликах.
:::

Пользователи с правами только на чтение могут завершать только свои собственные запросы.

По умолчанию используется асинхронная версия запросов (`ASYNC`), которая не ждет подтверждения того, что запросы были остановлены.

Синхронная версия (`SYNC`) ждет, пока все запросы не остановятся, и отображает информацию о каждом процессе по мере его остановки. Ответ содержит колонку `kill_status`, которая может принимать следующие значения:

1.  `finished` – Запрос был успешно завершен.
2.  `waiting` – Ожидание завершения запроса после отправки сигнала на его завершение.
3.  Остальные значения объясняют, почему запрос не может быть остановлен.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список запросов для остановки.

## KILL MUTATION {#kill-mutation}

Наличие длительно выполняющихся или незавершенных мутаций часто указывает на то, что сервис ClickHouse работает нестабильно. Асинхронная природа мутаций может привести к тому, что они потребляют все доступные ресурсы системы. Возможно, вам нужно либо:

- Приостановить все новые мутации, `INSERT` и `SELECT` и дать очереди мутаций завершиться.
- Либо вручную завершить некоторые из этих мутаций, отправив команду `KILL`.

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

Пытается отменить и удалить [мутации](/sql-reference/statements/alter#mutations), которые в данный момент выполняются. Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, указанного в операторе `WHERE` запроса `KILL`.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список мутаций для остановки.

Примеры:

Получите `count()` количества незавершенных мутаций:

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

Запрос списка незавершенных мутаций:

Список мутаций с одного узла ClickHouse:
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

Список мутаций из кластера ClickHouse:
```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

Завершите мутации по мере необходимости:
```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Этот запрос полезен, когда мутация зависла и не может завершиться (например, если какая-либо функция в запросе мутации вызывает исключение при применении к данным, содержащимся в таблице).

Изменения, уже внесенные мутацией, не откатываются.

:::note 
Колонка `is_killed=1` (только ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Возможно, что мутация останется в состоянии, где `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая длительно выполняющаяся мутация блокирует убитую мутацию. Это нормальная ситуация.
:::