---
description: 'Документация для KILL'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'Команды KILL'
---

Существует два типа команд KILL: для завершения запроса и для завершения мутации.

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <условие для выбора из system.processes запроса>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

Команда пытается принудительно завершить выполняющиеся в данный момент запросы. Запросы для завершения выбираются из таблицы system.processes с использованием критериев, определенных в `WHERE` клаузе запроса `KILL`.

Примеры:

Сначала вам нужно получить список незавершённых запросов. Этот SQL-запрос предоставляет их согласно времени выполнения:

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

Завершить запрос:
```sql
-- Принудительно завершает все запросы с указанным query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Синхронно завершает все запросы, запущенные 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
Если вы завершаете запрос в ClickHouse Cloud или в самоуправляемом кластере, обязательно используйте опцию ```ON CLUSTER [имя-кластера]```, чтобы гарантировать, что запрос завершится на всех репликах.
:::

Пользователи с правами только для чтения могут останавливать только свои собственные запросы.

По умолчанию используется асинхронная версия запросов (`ASYNC`), которая не ждёт подтверждения о том, что запросы завершены.

Синхронная версия (`SYNC`) ждёт завершения всех запросов и отображает информацию о каждом процессе по мере его завершения. Ответ содержит колонку `kill_status`, которая может принимать следующие значения:

1.  `finished` – Запрос был успешно завершён.
2.  `waiting` – Ожидает завершения запроса после отправки ему сигнала на завершение.
3.  Остальные значения объясняют, почему запрос не может быть остановлен.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список запросов для остановки.

## KILL MUTATION {#kill-mutation}

Наличие долго выполняющихся или незавершённых мутаций часто указывает на то, что служба ClickHouse работает плохо. Асинхронный характер мутаций может привести к тому, что они будут потреблять все доступные ресурсы системы. Вам может потребоваться либо: 

- Приостановить все новые мутации, `INSERT`ы и `SELECT`ы, и позволить очереди мутаций завершиться.
- Или вручную завершить некоторые из этих мутаций, отправив команду `KILL`.

```sql
KILL MUTATION
  WHERE <условие для выбора из system.mutations запроса>
  [TEST]
  [FORMAT format]
```

Команда пытается отменить и удалить [мутации](/sql-reference/statements/alter#mutations), которые в данный момент выполняются. Мутации для отмены выбираются из таблицы [`system.mutations`](/operations/system-tables/mutations) с использованием фильтра, заданного в `WHERE` клаузе запроса `KILL`.

Тестовый запрос (`TEST`) только проверяет права пользователя и отображает список мутаций для остановки.

Примеры:

Получить `count()` количества незавершённых мутаций:

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

Запросить список незавершённых мутаций:

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

Завершить мутации по мере необходимости:
```sql
-- Отменить и удалить все мутации одной таблицы:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Отменить конкретную мутацию:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

Запрос полезен, когда мутация застряла и не может завершиться (например, если некоторая функция в запросе мутации вызывает исключение, когда применяется к данным, содержащимся в таблице).

Изменения, уже внесённые мутацией, не откатываются.

:::note 
`is_killed=1` колонка (только ClickHouse Cloud) в таблице [system.mutations](/operations/system-tables/mutations) не обязательно означает, что мутация полностью завершена. Возможна ситуация, когда мутация остаётся в состоянии, где `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая долго выполняющаяся мутация блокирует завершённую мутацию. Это обычная ситуация.
:::
