---
slug: /sql-reference/statements/kill
sidebar_position: 46
sidebar_label: KILL
title: "KILL Операторы"
---

Существует два типа операторов KILL: для завершения запроса и для завершения мутации

## KILL QUERY {#kill-query}

``` sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Оператор пытается принудительно завершить выполняющиеся запросы.
Запросы для завершения выбираются из таблицы system.processes с использованием критериев, определенных в предложении `WHERE` оператора `KILL`.

Примеры:

Сначала вам нужно получить список незавершенных запросов. Этот SQL-запрос предоставляет их в зависимости от времени выполнения:

Список с одного узла ClickHouse:
``` sql
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
``` sql
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
``` sql
-- Принудительно завершает все запросы с указанным query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Синхронно завершает все запросы, выполненные 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
Если вы завершаете запрос в ClickHouse Cloud или в самоуправляемом кластере, обязательно используйте опцию ```ON CLUSTER [cluster-name]```, чтобы убедиться, что запрос завершен на всех репликах.
:::

Пользователи с правами только для чтения могут останавливать только свои собственные запросы.

По умолчанию используется асинхронная версия запросов (`ASYNC`), которая не ждет подтверждения о том, что запросы остановлены.

Синхронная версия (`SYNC`) ожидает завершения всех запросов и отображает информацию о каждом процессе в момент его остановки.
В ответе содержится колонка `kill_status`, которая может принимать следующие значения:

1.  `finished` – Запрос был успешно завершен.
2.  `waiting` – Ожидание завершения запроса после отправки ему сигнала для завершения.
3.  Другие значения объясняют, почему запрос не может быть остановлен.

Тестовый запрос (`TEST`) просто проверяет права пользователя и отображает список запросов для остановки.

## KILL MUTATION {#kill-mutation}

Наличие долгосрочных или незавершенных мутаций часто указывает на то, что служба ClickHouse работает плохо. Асинхронная природа мутаций может привести к тому, что они будут потреблять все доступные ресурсы системы. Вам может потребоваться либо: 

- Приостановить все новые мутации, `INSERT` и `SELECT` и разрешить завершение очереди мутаций.
- Либо вручную завершить некоторые из этих мутаций, отправив команду `KILL`.

``` sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

Пытается отменить и удалить [мутации](/sql-reference/statements/alter#mutations), которые в настоящее время выполняются. Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, указанного в предложении `WHERE` оператора `KILL`.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список мутаций для остановки.

Примеры:

Получите `count()` количества незавершенных мутаций:

Количество мутаций с одного узла ClickHouse:
``` sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

Количество мутаций с кластера реплик ClickHouse:
``` sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

Запрос списка незавершенных мутаций:

Список мутаций с одного узла ClickHouse:
``` sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

Список мутаций из кластера ClickHouse:
``` sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

Завершите мутации по мере необходимости:
``` sql
-- Отменить и удалить все мутации одной таблицы:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Отменить конкретную мутацию:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Запрос полезен, когда мутация "застряла" и не может завершиться (например, если какая-то функция в запросе мутации вызывает исключение при применении к данным в таблице).

Изменения, уже внесенные мутацией, не отменяются.

:::note 
`is_killed=1` колонка (только ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Мутация может оставаться в состоянии, когда `is_killed=1` и `is_done=0` в течение продолжительного времени. Это может произойти, если другая долгосрочная мутация блокирует завершенную мутацию. Это нормальная ситуация.
:::
