---
description: 'Страница, посвящённая анализатору запросов ClickHouse'
keywords: ['анализатор']
sidebar_label: 'Анализатор'
slug: /operations/analyzer
title: 'Анализатор'
doc_type: 'reference'
---

# Анализатор {#analyzer}

В версии ClickHouse `24.3` новый анализатор запросов включён по умолчанию.
Подробнее о том, как он работает, можно прочитать [здесь](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer).

## Известные несовместимости {#known-incompatibilities}

Несмотря на исправление большого числа ошибок и внедрение новых оптимизаций, также были внесены некоторые изменения в поведении ClickHouse, нарушающие обратную совместимость. Пожалуйста, ознакомьтесь со следующими изменениями, чтобы понять, как переписать ваши запросы для нового анализатора.

### Некорректные запросы больше не оптимизируются {#invalid-queries-are-no-longer-optimized}

Предыдущая инфраструктура планирования запросов применяла оптимизации на уровне AST до шага проверки запроса.
Оптимизации могли переписать исходный запрос так, чтобы он стал корректным и исполнимым.

В новом анализаторе проверка запроса выполняется до шага оптимизации.
Это означает, что некорректные запросы, которые ранее можно было выполнить, больше не поддерживаются.
В таких случаях запрос должен быть исправлен вручную.

#### Пример 1 {#example-1}

Следующий запрос использует столбец `number` в списке проекции, хотя после агрегации доступен только `toString(number)`.
В старом анализаторе `GROUP BY toString(number)` оптимизировался в `GROUP BY number,` что делало запрос корректным.

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### Пример 2 {#example-2}

Та же проблема возникает в этом запросе. Столбец `number` используется после агрегации с другим ключом.
Предыдущий анализатор запросов исправил этот запрос, переместив фильтр `number > 5` из условия `HAVING` в условие `WHERE`.

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

Чтобы исправить запрос, перенесите все условия, относящиеся к неагрегированным столбцам, в предложение `WHERE`, чтобы он соответствовал стандартному синтаксису SQL:

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
Ранее можно было создать `VIEW` с некорректным запросом `SELECT`.
В этом случае первое обращение к представлению с `SELECT` или `INSERT` (для `MATERIALIZED VIEW`) завершалось с ошибкой.

Теперь создать `VIEW` таким способом невозможно.

#### Пример {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Известные несовместимости предложения `JOIN` {#known-incompatibilities-of-the-join-clause}

#### `JOIN` с использованием столбца из проекции {#join-using-column-from-projection}

Псевдоним из списка `SELECT` по умолчанию не может использоваться как ключ `JOIN USING`.

Новая настройка `analyzer_compatibility_join_using_top_level_identifier` при включении изменяет поведение `JOIN USING`, так что при разрешении идентификаторов приоритет отдается выражениям из списка проекций запроса `SELECT`, а не столбцам из левой таблицы напрямую.

Например:

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

При установке параметра `analyzer_compatibility_join_using_top_level_identifier` в значение `true` условие соединения интерпретируется как `t1.a + 1 = t2.b`, что соответствует поведению более ранних версий.
Результатом будет `2, 'two'`.
Если настройка установлена в значение `false`, по умолчанию используется условие соединения `t1.b = t2.b`, и запрос вернет `2, 'one'`.
Если `b` отсутствует в `t1`, запрос завершится с ошибкой.

#### Изменения в поведении с `JOIN USING` и столбцами `ALIAS`/`MATERIALIZED` {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

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

В новом анализаторе результат этого запроса будет включать столбец `payload` вместе со столбцом `id` из обеих таблиц.
Напротив, предыдущий анализатор добавлял бы эти столбцы-`ALIAS` только в том случае, если были включены определённые настройки (`asterisk_include_alias_columns` или `asterisk_include_materialized_columns`),
и столбцы могли бы идти в другом порядке.

Чтобы обеспечить стабильные и предсказуемые результаты, особенно при миграции старых запросов на новый анализатор, рекомендуется явно указывать столбцы в предложении `SELECT` вместо использования `*`.

#### Обработка модификаторов типов для столбцов в предложении `USING` {#handling-of-type-modifiers-for-columns-in-using-clause}

В новой версии анализатора правила определения общего супертипа для столбцов, указанных в предложении `USING`, были унифицированы, чтобы давать более предсказуемые результаты,
особенно при работе с модификаторами типов, такими как `LowCardinality` и `Nullable`.

* `LowCardinality(T)` и `T`: когда столбец типа `LowCardinality(T)` соединяется со столбцом типа `T`, результирующим общим супертипом будет `T`, то есть модификатор `LowCardinality` фактически отбрасывается.
* `Nullable(T)` и `T`: когда столбец типа `Nullable(T)` соединяется со столбцом типа `T`, результирующим общим супертипом будет `Nullable(T)`, что гарантирует сохранение возможности значений `NULL`.

Например:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

В этом запросе общий надтип для `id` определяется как `String`, при этом модификатор `LowCardinality` из `t1` отбрасывается.

### Изменения имён столбцов проекций {#projection-column-names-changes}

При вычислении имён столбцов проекций алиасы не подставляются.

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

В новом анализаторе вывод типов происходит на этапе первоначального анализа запроса.
Это изменение означает, что проверки типов выполняются до вычисления с коротким замыканием; поэтому аргументы функции `if` всегда должны иметь общий супертип.

Например, следующий запрос завершится с ошибкой `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Гетерогенные кластеры {#heterogeneous-clusters}

Новый анализатор существенно изменяет протокол взаимодействия между серверами в кластере. Поэтому выполнение распределённых запросов на серверах с разными значениями настройки `enable_analyzer` невозможно.

### Мутации интерпретируются предыдущим анализатором {#mutations-are-interpreted-by-previous-analyzer}

Мутации по-прежнему используют старый анализатор.
Это означает, что некоторые новые возможности ClickHouse SQL нельзя использовать в мутациях. Например, конструкцию `QUALIFY`.
Статус можно проверить [здесь](https://github.com/ClickHouse/ClickHouse/issues/61563).

### Неподдерживаемые возможности {#unsupported-features}

Список возможностей, которые новый анализатор в данный момент не поддерживает, приведён ниже:

* Индекс Annoy.
* Индекс Hypothesis. Работа ведётся [здесь](https://github.com/ClickHouse/ClickHouse/pull/48381).
* Window view не поддерживается. В будущем поддержка не планируется.
