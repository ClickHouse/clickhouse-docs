---
description: 'Страница, описывающая анализатор запросов ClickHouse'
keywords: ['анализатор']
sidebar_label: 'Анализатор'
slug: /operations/analyzer
title: 'Анализатор'
---


# Анализатор

## Известные несовместимости {#known-incompatibilities}

В версии ClickHouse `24.3` новый анализатор запросов был включен по умолчанию. Несмотря на исправление множества ошибок и ввод новых оптимизаций, он также вводит некоторые разрывные изменения в поведении ClickHouse. Пожалуйста, ознакомьтесь с изменениями, чтобы определить, как переписать ваши запросы для нового анализатора.

### Неверные запросы больше не оптимизируются {#invalid-queries-are-no-longer-optimized}

Предыдущая инфраструктура планирования запросов применяла оптимизации на уровне AST до этапа проверки запроса. Оптимизации могли изменить исходный запрос так, чтобы он стал корректным и мог быть выполнен.

В новом анализаторе проверка запроса осуществляется до этапа оптимизации. Это означает, что неверные запросы, которые ранее можно было выполнить, теперь не поддерживаются. В таких случаях запрос необходимо исправить вручную.

**Пример 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

Следующий запрос использует колонку `number` в списке проекции, когда только `toString(number)` доступна после агрегации. В старом анализаторе `GROUP BY toString(number)` оптимизировался в `GROUP BY number`, что делало запрос корректным.

**Пример 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

Та же проблема возникает в этом запросе: колонка `number` используется после агрегации с другим ключом. Предыдущий анализатор запросов исправлял этот запрос, перемещая фильтр `number > 5` из `HAVING` в `WHERE`.

Чтобы исправить запрос, вы должны переместить все условия, которые применяются к неагрегированным колонкам, в секцию `WHERE`, чтобы соответствовать стандартному синтаксису SQL:
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW с неверным запросом {#create-view-with-invalid-query}

Новый анализатор всегда выполняет проверку типов. Ранее было возможно создать `VIEW` с неверным `SELECT` запросом. Тогда он будет завершаться ошибкой при первом `SELECT` или `INSERT` (в случае `MATERIALIZED VIEW`).

Теперь создать такие `VIEW` больше невозможно.

**Пример:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Известные несовместимости при использовании `JOIN` {#known-incompatibilities-of-the-join-clause}

#### Объединение с использованием колонки из проекции {#join-using-column-from-projection}

Псевдонимы из списка `SELECT` не могут быть использованы в качестве ключа `JOIN USING` по умолчанию.

Новая настройка `analyzer_compatibility_join_using_top_level_identifier`, при включении, изменяет поведение `JOIN USING`, предпочитая разрешать идентификаторы на основе выражений из списка проекции запроса `SELECT`, а не используя непосредственно колонки из левой таблицы.

**Пример:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

При установленной `analyzer_compatibility_join_using_top_level_identifier` в значение `true`, условие соединения интерпретируется как `t1.a + 1 = t2.b`, что соответствует поведению более ранних версий. Таким образом, результат будет `2, 'two'`. Когда настройка равна `false`, условие соединения по умолчанию становится `t1.b = t2.b`, и запрос вернет `2, 'one'`. Если `b` отсутствует в `t1`, запрос завершится ошибкой.

#### Изменения в поведении с `JOIN USING` и колонками `ALIAS`/`MATERIALIZED` {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

В новом анализаторе использование `*` в запросе `JOIN USING`, который включает колонки `ALIAS` или `MATERIALIZED`, будет по умолчанию включать эти колонки в результирующий набор.

**Пример:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

В новом анализаторе результат этого запроса будет включать колонку `payload` наряду с `id` из обеих таблиц. В отличие от этого, предыдущий анализатор включал эти `ALIAS` колонки только если были включены определенные настройки (`asterisk_include_alias_columns` или `asterisk_include_materialized_columns`), и колонки могли появляться в другом порядке.

Чтобы обеспечить последовательные и ожидаемые результаты, особенно при миграции старых запросов в новый анализатор, рекомендуется явно указывать колонки в секции `SELECT`, а не использовать `*`.

#### Обработка модификаторов типов для колонок в `USING` Clause {#handling-of-type-modifiers-for-columns-in-using-clause}

В новой версии анализатора правила определения общего суперттипа для колонок, указанных в клаузе `USING`, были стандартизированы для достижения более предсказуемых результатов, особенно при работе с модификаторами типов, такими как `LowCardinality` и `Nullable`.

- `LowCardinality(T)` и `T`: Когда колонка типа `LowCardinality(T)` объединяется с колонкой типа `T`, результатом общего суперттипа будет `T`, эффективно отбрасывая модификатор `LowCardinality`.

- `Nullable(T)` и `T`: Когда колонка типа `Nullable(T)` объединяется с колонкой типа `T`, результатом общего суперттипа будет `Nullable(T)`, гарантируя сохранение свойства `nullable`.

**Пример:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

В этом запросе общий суперттип для `id` определен как `String`, отбрасывая модификатор `LowCardinality` из `t1`.

### Изменения в именах колонок проекции {#projection-column-names-changes}

Во время вычисления имен проекций псевдонимы не заменяются.

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

В новом анализаторе вывод типов происходит во время первоначального анализа запроса. Это изменение значит, что проверки типов выполняются до оценки с коротким замыканием; таким образом, аргументы функции `if` должны всегда иметь общий супертип.

**Пример:**

Следующий запрос завершается ошибкой `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Гетерогенные кластеры {#heterogeneous-clusters}

Новый анализатор значительно изменил протокол связи между серверами в кластере. Таким образом, невозможно выполнять распределенные запросы на серверах с разными значениями настройки `enable_analyzer`.

### Мутации интерпретируются старым анализатором {#mutations-are-interpreted-by-previous-analyzer}

Мутации по-прежнему используют старый анализатор. Это означает, что некоторые новые функции SQL ClickHouse не могут быть использованы в мутациях. Например, клаузу `QUALIFY`. Статус можно проверить [здесь](https://github.com/ClickHouse/ClickHouse/issues/61563).

### Неподдерживаемые функции {#unsupported-features}

Список функций, которые новый анализатор в настоящее время не поддерживает:

- Индекс Annoy.
- Индекс гипотез. Работа в процессе [здесь](https://github.com/ClickHouse/ClickHouse/pull/48381).
- Оконное представление не поддерживается. Нет планов поддерживать его в будущем.
