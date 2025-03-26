---
description: 'Страница, описывающая анализатор запросов ClickHouse'
keywords: ['анализатор']
sidebar_label: 'Анализатор'
slug: /operations/analyzer
title: 'Анализатор'
---


# Анализатор

## Известные несовместимости {#known-incompatibilities}

В версии ClickHouse `24.3` новый анализатор запросов был включён по умолчанию. Несмотря на исправление большого количества ошибок и введение новых оптимизаций, он также вносит некоторые разрушительные изменения в поведение ClickHouse. Пожалуйста, прочитайте следующие изменения, чтобы определить, как переписать ваши запросы для нового анализатора.

### Неверные запросы больше не оптимизируются {#invalid-queries-are-no-longer-optimized}

Предыдущая инфраструктура планирования запросов применяла оптимизации на уровне Abstract Syntax Tree (AST) перед этапом проверки запросов. Оптимизации могли переписать исходный запрос так, чтобы он стал действительным и мог быть выполнен.

В новом анализаторе проверка запросов происходит перед этапом оптимизации. Это означает, что недопустимые запросы, которые могли быть выполнены ранее, теперь не поддерживаются. В таких случаях запрос должен быть исправлен вручную.

**Пример 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

Следующий запрос использует столбец `number` в списке проекций, когда только `toString(number)` доступен после агрегации. В старом анализаторе `GROUP BY toString(number)` был оптимизирован в `GROUP BY number,` что делало запрос действительным.

**Пример 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

Та же проблема возникает в этом запросе: столбец `number` используется после агрегации с другим ключом. Предыдущий анализатор запросов исправил этот запрос, переместив фильтр `number > 5` из условия `HAVING` в условие `WHERE`.

Чтобы исправить запрос, вам следует переместить все условия, которые применяются к неагрегированным столбцам, в секцию `WHERE`, чтобы соответствовать стандартному синтаксису SQL:
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW с неверным запросом {#create-view-with-invalid-query}

Новый анализатор всегда выполняет проверку типов. Ранее было возможно создать `VIEW` с недопустимым `SELECT` запросом. Он затем терпел неудачу при первом `SELECT` или `INSERT` (в случае `MATERIALIZED VIEW`).

Теперь невозможно создать такие `VIEW` больше.

**Пример:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Известные несовместимости в клаузе `JOIN` {#known-incompatibilities-of-the-join-clause}

#### Join с использованием столбца из проекции {#join-using-column-from-projection}

Псевдонимы из списка `SELECT` не могут использоваться как ключ `JOIN USING` по умолчанию.

Новая настройка, `analyzer_compatibility_join_using_top_level_identifier`, при включении изменяет поведение `JOIN USING`, чтобы предпочесть разрешать идентификаторы на основе выражений из списка проекций `SELECT` запроса, вместо использования столбцов из левой таблицы напрямую.

**Пример:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

При установленном значении `analyzer_compatibility_join_using_top_level_identifier` равным `true`, условие соединения интерпретируется как `t1.a + 1 = t2.b`, что соответствует поведению более ранних версий. В результате будет `2, 'two'`. Когда же значение настройки `false`, условие соединения по умолчанию становится `t1.b = t2.b`, и запрос вернёт `2, 'one'`. Если `b` отсутствует в `t1`, запрос завершится с ошибкой.

#### Изменения в поведении с `JOIN USING` и `ALIAS`/`MATERIALIZED` столбцами {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

В новом анализаторе использование `*` в запросе `JOIN USING`, который включает `ALIAS` или `MATERIALIZED` столбцы, будет включать эти столбцы в результирующий набор по умолчанию.

**Пример:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

В новом анализаторе результат этого запроса будет включать столбец `payload` вместе с `id` из обеих таблиц. В отличие от этого, предыдущий анализатор включал бы эти `ALIAS` столбцы только если были включены определённые настройки (`asterisk_include_alias_columns` или `asterisk_include_materialized_columns`), и столбцы могли появиться в другом порядке.

Чтобы обеспечить согласованные и ожидаемые результаты, особенно при миграции старых запросов на новый анализатор, рекомендуется явно указывать столбцы в секции `SELECT`, а не использовать `*`.

#### Обработка модификаторов типов для столбцов в клаузе `USING` {#handling-of-type-modifiers-for-columns-in-using-clause}

В новой версии анализатора правила для определения общего супертипа для столбцов, указанных в клаузе `USING`, были стандартизированы для получения более предсказуемых результатов, особенно при работе с модификаторами типов, такими как `LowCardinality` и `Nullable`.

- `LowCardinality(T)` и `T`: Когда столбец типа `LowCardinality(T)` объединяется со столбцом типа `T`, результирующий общий супертип будет `T`, эффективно отбрасывая модификатор `LowCardinality`.

- `Nullable(T)` и `T`: Когда столбец типа `Nullable(T)` объединяется со столбцом типа `T`, результирующий общий супертип будет `Nullable(T)`, гарантируя сохранение свойства нулевости.

**Пример:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

В этом запросе общий супертип для `id` определяется как `String`, отбрасывая модификатор `LowCardinality` из `t1`.

### Изменения в именах колонок проекции {#projection-column-names-changes}

Во время вычисления имен проекций алиасы не заменяются.

```sql
SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 0
FORMAT PrettyCompact

   ┌─x─┬─plus(plus(1, 1), 1)─┐
1. │ 2 │                   3 │
   └───┴─────────────────────┘

SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 1
FORMAT PrettyCompact

   ┌─x─┬─plus(x, 1)─┐
1. │ 2 │          3 │
   └───┴────────────┘
```

### Несовместимые типы аргументов функций {#incompatible-function-arguments-types}

В новом анализаторе вывод типов происходит во время первоначального анализа запроса. Это изменение означает, что проверки типов выполняются до короткой оценки; следовательно, аргументы функции `if` всегда должны иметь общий супертип.

**Пример:**

Следующий запрос завершается с ошибкой `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Гетерогенные кластеры {#heterogeneous-clusters}

Новый анализатор значительно изменил протокол коммуникации между серверами в кластере. Таким образом, невозможно запускать распределённые запросы на серверах с различными значениями настройки `enable_analyzer`.

### Мутации интерпретируются предыдущим анализатором {#mutations-are-interpreted-by-previous-analyzer}

Мутации по-прежнему используют старый анализатор. Это означает, что некоторые новые функции SQL ClickHouse не могут быть использованы в мутациях. Например, клаузу `QUALIFY`. Статус можно проверить [здесь](https://github.com/ClickHouse/ClickHouse/issues/61563).

### Неподдерживаемые функции {#unsupported-features}

Список функций, которые новый анализатор в настоящее время не поддерживает:

- Индекс Annoy.
- Индекс Hypothesis. Работа в процессе [здесь](https://github.com/ClickHouse/ClickHouse/pull/48381).
- Окно представлений не поддерживается. Не планируется поддержка в будущем.
