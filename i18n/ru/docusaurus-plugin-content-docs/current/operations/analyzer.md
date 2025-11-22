---
description: 'Страница с описанием анализатора запросов ClickHouse'
keywords: ['analyzer']
sidebar_label: 'Анализатор'
slug: /operations/analyzer
title: 'Анализатор'
doc_type: 'reference'
---



# Анализатор

В версии ClickHouse `24.3` новый анализатор запросов был включен по умолчанию.
Подробнее о том, как он работает, можно прочитать [здесь](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer).



## Известные несовместимости {#known-incompatibilities}

Несмотря на исправление большого количества ошибок и внедрение новых оптимизаций, новый анализатор также вносит некоторые критические изменения в поведение ClickHouse. Ознакомьтесь со следующими изменениями, чтобы понять, как адаптировать ваши запросы для работы с новым анализатором.

### Некорректные запросы больше не оптимизируются {#invalid-queries-are-no-longer-optimized}

Предыдущая инфраструктура планирования запросов применяла оптимизации на уровне AST до этапа валидации запроса.
Оптимизации могли переписать исходный запрос таким образом, чтобы он стал корректным и выполнимым.

В новом анализаторе валидация запроса выполняется до этапа оптимизации.
Это означает, что некорректные запросы, которые ранее можно было выполнить, теперь не поддерживаются.
В таких случаях запрос необходимо исправить вручную.

#### Пример 1 {#example-1}

Следующий запрос использует столбец `number` в списке проекции, хотя после агрегации доступен только `toString(number)`.
В старом анализаторе `GROUP BY toString(number)` оптимизировался в `GROUP BY number`, что делало запрос корректным.

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### Пример 2 {#example-2}

Та же проблема возникает в этом запросе. Столбец `number` используется после агрегации с другим ключом.
Предыдущий анализатор запросов исправлял этот запрос, перемещая фильтр `number > 5` из секции `HAVING` в секцию `WHERE`.

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

Чтобы исправить запрос, переместите все условия, применяемые к неагрегированным столбцам, в секцию `WHERE` в соответствии со стандартным синтаксисом SQL:

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### `CREATE VIEW` с некорректным запросом {#create-view-with-invalid-query}

Новый анализатор всегда выполняет проверку типов.
Ранее было возможно создать `VIEW` с некорректным запросом `SELECT`.
Такой запрос завершался ошибкой при первом выполнении `SELECT` или `INSERT` (в случае `MATERIALIZED VIEW`).

Создание `VIEW` таким способом больше невозможно.

#### Пример {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Известные несовместимости секции `JOIN` {#known-incompatibilities-of-the-join-clause}

#### `JOIN` с использованием столбца из проекции {#join-using-column-from-projection}

Псевдоним из списка `SELECT` не может использоваться в качестве ключа `JOIN USING` по умолчанию.

Новая настройка `analyzer_compatibility_join_using_top_level_identifier` при включении изменяет поведение `JOIN USING`, отдавая предпочтение разрешению идентификаторов на основе выражений из списка проекции запроса `SELECT`, а не прямому использованию столбцов из левой таблицы.

Например:

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

При установке `analyzer_compatibility_join_using_top_level_identifier` в `true` условие соединения интерпретируется как `t1.a + 1 = t2.b`, что соответствует поведению более ранних версий.
Результатом будет `2, 'two'`.
Когда настройка установлена в `false`, условие соединения по умолчанию принимает вид `t1.b = t2.b`, и запрос вернет `2, 'one'`.
Если `b` отсутствует в `t1`, запрос завершится с ошибкой.

#### Изменения в поведении `JOIN USING` со столбцами `ALIAS`/`MATERIALIZED` {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

В новом анализаторе использование `*` в запросе `JOIN USING`, который включает столбцы `ALIAS` или `MATERIALIZED`, по умолчанию будет включать эти столбцы в результирующий набор.

Например:

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```


В новом анализаторе результат этого запроса будет включать столбец `payload` вместе с `id` из обеих таблиц.
В отличие от этого, предыдущий анализатор включал бы эти столбцы `ALIAS` только при включении определённых настроек (`asterisk_include_alias_columns` или `asterisk_include_materialized_columns`),
и столбцы могли бы появляться в другом порядке.

Для обеспечения согласованных и ожидаемых результатов, особенно при миграции старых запросов на новый анализатор, рекомендуется явно указывать столбцы в предложении `SELECT` вместо использования `*`.

#### Обработка модификаторов типов для столбцов в предложении `USING` {#handling-of-type-modifiers-for-columns-in-using-clause}

В новой версии анализатора правила определения общего супертипа для столбцов, указанных в предложении `USING`, были стандартизированы для получения более предсказуемых результатов,
особенно при работе с модификаторами типов, такими как `LowCardinality` и `Nullable`.

- `LowCardinality(T)` и `T`: Когда столбец типа `LowCardinality(T)` объединяется со столбцом типа `T`, результирующим общим супертипом будет `T`, фактически отбрасывая модификатор `LowCardinality`.
- `Nullable(T)` и `T`: Когда столбец типа `Nullable(T)` объединяется со столбцом типа `T`, результирующим общим супертипом будет `Nullable(T)`, обеспечивая сохранение свойства nullable.

Например:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

В этом запросе общий супертип для `id` определяется как `String`, отбрасывая модификатор `LowCardinality` из `t1`.

### Изменения имён столбцов проекции {#projection-column-names-changes}

При вычислении имён проекции псевдонимы не подставляются.

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

В новом анализаторе вывод типов происходит во время начального анализа запроса.
Это изменение означает, что проверки типов выполняются до вычисления с коротким замыканием; таким образом, аргументы функции `if` всегда должны иметь общий супертип.

Например, следующий запрос завершается с ошибкой `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Гетерогенные кластеры {#heterogeneous-clusters}

Новый анализатор существенно изменяет протокол связи между серверами в кластере. Таким образом, невозможно выполнять распределённые запросы на серверах с различными значениями настройки `enable_analyzer`.

### Мутации интерпретируются предыдущим анализатором {#mutations-are-interpreted-by-previous-analyzer}

Мутации по-прежнему используют старый анализатор.
Это означает, что некоторые новые возможности ClickHouse SQL не могут использоваться в мутациях. Например, предложение `QUALIFY`.
Статус можно проверить [здесь](https://github.com/ClickHouse/ClickHouse/issues/61563).

### Неподдерживаемые возможности {#unsupported-features}

Список возможностей, которые новый анализатор в настоящее время не поддерживает, приведён ниже:

- Индекс Annoy.
- Индекс Hypothesis. Работа в процессе [здесь](https://github.com/ClickHouse/ClickHouse/pull/48381).
- Window view не поддерживается. Планов по поддержке в будущем нет.
