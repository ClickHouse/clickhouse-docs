---
description: 'Документация для KILL'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'Команды KILL'
---

Существует два типа команд KILL: одна для завершения запроса и другая для завершения мутации.

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <условие для выбора из системной таблицы system.processes>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Пробует принудительно завершить в настоящее время выполняющиеся запросы. Запросы для завершения выбираются из таблицы system.processes, используя критерии, определенные в `WHERE` условии команды `KILL`.

Примеры:

Сначала вам нужно получить список незавершенных запросов. Этот SQL-запрос предоставляет их в зависимости от времени выполнения:

Список из одной узла ClickHouse:
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

Завершите запрос:
```sql
-- Принудительно завершает все запросы с указанным query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Синхронно завершает все запросы, запущенные 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
Если вы завершаете запрос в ClickHouse Cloud или в самоуправляемом кластере, обязательно используйте опцию ```ON CLUSTER [имя-кластера]```, чтобы гарантировать завершение запроса на всехReplica.
:::

Пользователи с правами только на чтение могут останавливать только свои собственные запросы.

По умолчанию используется асинхронная версия запросов (`ASYNC`), которая не ожидает подтверждения, что запросы были остановлены.

Синхронная версия (`SYNC`) ждет завершения всех запросов и выводит информацию о каждом процессе по мере его завершения. Ответ содержит столбец `kill_status`, который может принимать следующие значения:

1.  `finished` – Запрос был успешно завершен.
2.  `waiting` – Ожидание завершения запроса после отправки ему сигнала на остановку.
3.  Другие значения объясняют, почему запрос нельзя остановить.

Тестовый запрос (`TEST`) просто проверяет права пользователя и отображает список запросов для остановки.

## KILL MUTATION {#kill-mutation}

Наличие долгосрочных или незавершенных мутаций часто указывает на то, что служба ClickHouse работает некорректно. Асинхронный характер мутаций может привести к тому, что они потребляют все доступные ресурсы системы. Возможно, вам понадобится либо: 

- Приостановить все новые мутации, `INSERT` и `SELECT` и дождаться завершения очереди мутаций.
- Либо вручную завершить некоторые из этих мутаций, отправив команду `KILL`.

```sql
KILL MUTATION
  WHERE <условие для выбора из системной таблицы system.mutations>
  [TEST]
  [FORMAT format]
```

Пробует отменить и удалить [мутации](/sql-reference/statements/alter#mutations), которые в данный момент выполняются. Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, указанного в условии `WHERE` команды `KILL`.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список мутаций для остановки.

Примеры:

Получить `count()` количество незавершенных мутаций:

Количество мутаций из одной узла ClickHouse:
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

Список мутаций из одной узла ClickHouse:
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

Завершить мутации по мере необходимости:
```sql
-- Отменить и удалить все мутации одной таблицы:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Отменить конкретную мутацию:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Запрос полезен, когда мутация застряла и не может завершиться (например, если какая-либо функция в запросе мутации вызывает исключение при применении к данным, содержащимся в таблице).

Изменения, уже произведенные мутацией, не откатываются.

:::note 
Столбец `is_killed=1` (только ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Возможно, мутация останется в состоянии, где `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая долгосрочная мутация блокирует завершенную мутацию. Это нормальная ситуация.
:::
