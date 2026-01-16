---
description: 'Страница, посвящённая анализатору запросов ClickHouse'
keywords: ['анализатор']
sidebar_label: 'Анализатор'
slug: /operations/analyzer
title: 'Анализатор'
doc_type: 'reference'
---

# Анализатор \{#analyzer\}

В версии ClickHouse `24.3` новый анализатор запросов включён по умолчанию.
Подробнее о том, как он работает, можно прочитать [здесь](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer).

## Известные несовместимости \\{#known-incompatibilities\\}

Несмотря на исправление большого числа ошибок и внедрение новых оптимизаций, также были внесены некоторые изменения в поведении ClickHouse, нарушающие обратную совместимость. Пожалуйста, ознакомьтесь со следующими изменениями, чтобы понять, как переписать ваши запросы для нового анализатора.

### Некорректные запросы больше не оптимизируются \\{#invalid-queries-are-no-longer-optimized\\}

Предыдущая инфраструктура планирования запросов применяла оптимизации на уровне AST до шага проверки запроса.
Оптимизации могли переписать исходный запрос так, чтобы он стал корректным и исполнимым.

В новом анализаторе проверка запроса выполняется до шага оптимизации.
Это означает, что некорректные запросы, которые ранее можно было выполнить, больше не поддерживаются.
В таких случаях запрос должен быть исправлен вручную.

#### Пример 1 \{#example-1\}

Следующий запрос использует столбец `number` в списке проекции, хотя после агрегации доступен только `toString(number)`.
В старом анализаторе `GROUP BY toString(number)` оптимизировался в `GROUP BY number,` что делало запрос корректным.

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```


#### Пример 2 \{#example-2\}

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

Чтобы исправить запрос, перенесите все условия, относящиеся к неагрегированным столбцам, в предложение `WHERE`, чтобы запрос соответствовал стандартному синтаксису SQL:

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```


### `CREATE VIEW` с некорректным запросом \\{#create-view-with-invalid-query\\}

Новый анализатор всегда выполняет проверку типов.
Ранее можно было создать `VIEW` с некорректным запросом `SELECT`.
В этом случае первое обращение к представлению с `SELECT` или `INSERT` (для `MATERIALIZED VIEW`) завершалось с ошибкой.

Теперь создать `VIEW` таким способом невозможно.

#### Пример \{#example-view\}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```


### Известные несовместимости предложения `JOIN` \\{#known-incompatibilities-of-the-join-clause\\}

#### `JOIN` с использованием столбца из проекции \{#join-using-column-from-projection\}

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
Если `b` отсутствует в `t1`, выполнение запроса завершится с ошибкой.


#### Изменения в поведении с `JOIN USING` и столбцами `ALIAS`/`MATERIALIZED` \{#changes-in-behavior-with-join-using-and-aliasmaterialized-columns\}

В новом анализаторе использование `*` в запросе `JOIN USING`, в котором используются столбцы `ALIAS` или `MATERIALIZED`, по умолчанию включает эти столбцы в результирующий набор данных.

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
В отличие от него, предыдущий анализатор включал бы такие столбцы `ALIAS` только если были включены специальные настройки (`asterisk_include_alias_columns` или `asterisk_include_materialized_columns`),
и столбцы могли бы оказаться в другом порядке.

Чтобы обеспечить предсказуемые и согласованные результаты, особенно при миграции старых запросов на новый анализатор, рекомендуется явно указывать столбцы в предложении `SELECT`, а не использовать `*`.


#### Обработка модификаторов типов для столбцов в предложении `USING` \{#handling-of-type-modifiers-for-columns-in-using-clause\}

В новой версии анализатора правила определения общего супертипа для столбцов, указанных в предложении `USING`, были унифицированы, чтобы давать более предсказуемые результаты,
особенно при работе с модификаторами типов, такими как `LowCardinality` и `Nullable`.

* `LowCardinality(T)` и `T`: когда столбец типа `LowCardinality(T)` соединяется со столбцом типа `T`, результирующим общим супертипом будет `T`, то есть модификатор `LowCardinality` фактически отбрасывается.
* `Nullable(T)` и `T`: когда столбец типа `Nullable(T)` соединяется со столбцом типа `T`, результирующим общим супертипом будет `Nullable(T)`, что гарантирует сохранение допуска значений `NULL`.

Например:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

В этом запросе общий надтип для `id` определяется как тип `String`, при этом модификатор `LowCardinality` из `t1` отбрасывается.


### Изменения имён столбцов проекций \{#projection-column-names-changes\}

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


### Несовместимые типы аргументов функций \{#incompatible-function-arguments-types\}

В новом анализаторе вывод типов происходит на этапе первоначального анализа запроса.
Это изменение означает, что проверки типов выполняются до вычисления с коротким замыканием; поэтому аргументы функции `if` всегда должны иметь общий супертип.

Например, следующий запрос завершится с ошибкой `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```


### Гетерогенные кластеры \\{#heterogeneous-clusters\\}

Новый анализатор существенно изменяет протокол взаимодействия между серверами в кластере. Поэтому выполнение распределённых запросов на серверах с разными значениями настройки `enable_analyzer` невозможно.

### Мутации интерпретируются предыдущим анализатором \\{#mutations-are-interpreted-by-previous-analyzer\\}

Мутации по-прежнему используют старый анализатор.
Это означает, что некоторые новые возможности ClickHouse SQL нельзя использовать в мутациях. Например, конструкцию `QUALIFY`.
Статус можно проверить [здесь](https://github.com/ClickHouse/ClickHouse/issues/61563).

### Неподдерживаемые возможности \\{#unsupported-features\\}

Список возможностей, которые новый анализатор в данный момент не поддерживает, приведён ниже:

* Индекс Annoy.
* Индекс Hypothesis. Работа ведётся [здесь](https://github.com/ClickHouse/ClickHouse/pull/48381).
* Window view не поддерживается. В будущем поддержка не планируется.

## Миграция в Cloud \\{#cloud-migration\\}

Мы включаем новый анализатор запросов во всех экземплярах, где он сейчас отключен, чтобы обеспечить поддержку новых функциональных возможностей и оптимизаций производительности. Это изменение вводит более строгие правила области видимости в SQL, что потребует от клиентов вручную обновить запросы, не соответствующие этим правилам.

### Процесс миграции \{#migration-workflow\}

1. Определите запрос, отфильтровав `system.query_log` по `normalized_query_hash`:

```sql
SELECT query 
FROM clusterAllReplicas(default, system.query_log)
WHERE normalized_query_hash='{hash}' 
LIMIT 1 
SETTINGS skip_unavailable_shards=1
```

2. Выполните запрос с включённым анализатором, добавив эти настройки.

```sql
SETTINGS
    enable_analyzer=1,
    analyzer_compatibility_join_using_top_level_identifier=1
```

3. Перепишите и проверьте результаты запроса, чтобы убедиться, что они совпадают с результатом, получаемым при отключённом анализаторе.

Пожалуйста, ознакомьтесь с наиболее частыми несовместимостями, выявленными во время внутреннего тестирования.


### Неизвестный идентификатор выражения \\{#unknown-expression-identifier\\}

Ошибка: `Unknown expression identifier ... in scope ... (UNKNOWN_IDENTIFIER)`. Код исключения: 47

Причина: запросы, которые полагаются на нестандартное, чрезмерно либеральное устаревшее поведение — например, обращение к вычисляемым псевдонимам в фильтрах, неоднозначные проекции подзапросов или «динамическую» область видимости CTE, — теперь корректно распознаются как недопустимые и немедленно отклоняются.   

Решение: обновите шаблоны SQL следующим образом:

- Логика фильтрации: перенесите логику из WHERE в HAVING, если фильтрация выполняется по результатам, или продублируйте выражение в WHERE, если фильтруются исходные данные.
- Область видимости подзапроса: явно выбирайте все столбцы, необходимые внешнему запросу.
- Ключи JOIN: используйте ON с полными выражениями вместо USING, если ключ — это псевдоним.
- Во внешних запросах ссылайтесь на псевдоним самого подзапроса/CTE, а не на таблицы внутри него.

### Неагрегированные столбцы в GROUP BY \{#non-aggregated-columns-in-group-by\}

Ошибка: `Column ... is not under aggregate function and not in GROUP BY keys (NOT_AN_AGGREGATE)`. Код исключения: 215

Причина: старый анализатор позволял выбирать столбцы, отсутствующие в предложении GROUP BY (часто выбирая произвольное значение). Новый анализатор следует стандарту SQL: каждый столбец в SELECT должен быть либо агрегатом, либо ключом группировки.

Решение: оберните столбец в `any()`, `argMax()` или добавьте его в GROUP BY.

```sql
/* ORIGINAL QUERY */
-- device_id is ambiguous
SELECT user_id, device_id FROM table GROUP BY user_id

/* FIXED QUERY */
SELECT user_id, any(device_id) FROM table GROUP BY user_id
-- OR
SELECT user_id, device_id FROM table GROUP BY user_id, device_id
```


### Повторяющиеся имена CTE \{#duplicate-cte-names\}

Ошибка: `CTE with name ... already exists (MULTIPLE_EXPRESSIONS_FOR_ALIAS)`. Код исключения: 179

Причина: старый анализатор допускал определение нескольких Common Table Expressions (WITH ...) с одинаковым именем, при котором более позднее определение перекрывало предыдущее. Новый анализатор запрещает такую неоднозначность.

Решение: переименуйте повторяющиеся CTE так, чтобы их имена были уникальными.

```sql
/* ORIGINAL QUERY */
WITH 
  data AS (SELECT 1 AS id), 
  data AS (SELECT 2 AS id) -- Redefined
SELECT * FROM data;

/* FIXED QUERY */
WITH 
  raw_data AS (SELECT 1 AS id), 
  processed_data AS (SELECT 2 AS id)
SELECT * FROM processed_data;
```


### Неоднозначные идентификаторы столбцов \{#ambiguous-column-identifiers\}

Ошибка: `JOIN [JOIN TYPE] ambiguous identifier ... (AMBIGUOUS_IDENTIFIER)` Код исключения: 207

Причина: запрос ссылается на имя столбца, которое встречается в нескольких таблицах в JOIN, без указания исходной таблицы. Старый анализатор часто выбирал столбец на основе внутренней логики, новый анализатор требует явного указания.

Решение: укажите полное имя столбца в формате table&#95;alias.column&#95;name.

```sql
/* ORIGINAL QUERY */
SELECT table1.ID AS ID FROM table1, table2 WHERE ID...

/* FIXED QUERY */
SELECT table1.ID AS ID_RENAMED FROM table1, table2 WHERE ID_RENAMED...
```


### Некорректное использование FINAL \{#invalid-usage-of-final\}

Ошибка: `Table expression modifiers FINAL are not supported for subquery...` или `Storage ... doesn't support FINAL` (`UNSUPPORTED_METHOD`). Коды исключений: 1, 181

Причина: FINAL — это модификатор для табличного движка (в частности, [Shared]ReplacingMergeTree). Новый анализатор отклоняет использование FINAL, когда он применяется к:

* Подзапросам или производным таблицам (например, FROM (SELECT ...) FINAL).
* Движкам таблиц, которые его не поддерживают (например, SharedMergeTree).

Решение: Применяйте FINAL только к исходной таблице внутри подзапроса или удалите его, если движок его не поддерживает.

```sql
/* ORIGINAL QUERY */
SELECT * FROM (SELECT * FROM my_table) AS subquery FINAL ...

/* FIXED QUERY */
SELECT * FROM (SELECT * FROM my_table FINAL) AS subquery ...
```


### Чувствительность к регистру функции `countDistinct()` \\{#countdistinct-case-insensitivity\\}

Ошибка: `Function with name countdistinct does not exist (UNKNOWN_FUNCTION)`. Код исключения: 46

Причина: Имена функций чувствительны к регистру или строго сопоставляются в новом анализаторе. `countdistinct` (полностью в нижнем регистре) больше не определяется автоматически. 

Решение: Используйте стандартную `countDistinct` (camelCase) или специфичную для ClickHouse функцию `uniq`.