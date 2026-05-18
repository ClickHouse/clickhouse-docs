---
description: 'Руководство по использованию утилиты format для работы с форматами данных ClickHouse'
slug: /operations/utilities/clickhouse-format
title: 'clickhouse-format'
doc_type: 'reference'
---

Позволяет форматировать входные запросы.

Ключи:

* `--help` или `-h` — вывести справочное сообщение.
* `--query` — форматировать запросы любой длины и сложности.
* `--hilite` или `--highlight` — добавить подсветку синтаксиса с использованием управляющих последовательностей терминала ANSI.
* `--oneline` — форматировать в одну строку.
* `--max_line_length` — форматировать в одну строку запросы с длиной меньше указанной.
* `--comments` — сохранять комментарии в выводе.
* `--quiet` или `-q` — только проверить синтаксис, без вывода при успешной проверке.
* `--multiquery` или `-n` — разрешить несколько запросов в одном файле.
* `--obfuscate` — обфусцировать вместо форматирования.
* `--seed <string>` — инициализирующая строка (seed), определяющая результат обфускации.
* `--backslash` — добавить обратный слэш в конец каждой строки форматированного запроса. Может быть полезно, когда вы копируете многострочный запрос из веба или ещё откуда-то и хотите выполнить его в командной строке.
* `--semicolons_inline` — в режиме multiquery записывать точки с запятой в последней строке запроса вместо новой строки.

## Примеры \{#examples\}

1. Форматирование запроса:

```bash title="Query"
$ clickhouse-format --query "select number from numbers(10) where number%2 order by number desc;"
```

```bash title="Response"
SELECT number
FROM numbers(10)
WHERE number % 2
ORDER BY number DESC
```

2. Подсветка и режим «строка»:

```bash title="Query"
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

```sql title="Response"
SELECT sum(number) FROM numbers(5)
```

3. Мультизапросы:

```bash title="Query"
$ clickhouse-format -n <<< "SELECT min(number) FROM numbers(5); SELECT max(number) FROM numbers(5);"
```

```sql title="Response"
SELECT min(number)
FROM numbers(5)
;

SELECT max(number)
FROM numbers(5)
;

```

4. Обфускация:

```bash title="Query"
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

```sql title="Response"
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

Тот же запрос и другая строка seed:

```bash title="Query"
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

```sql title="Response"
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. Добавление обратного слэша:

```bash title="Query"
$ clickhouse-format --backslash <<< "SELECT * FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION DISTINCT SELECT 3);"
```

```sql title="Response"
SELECT * \
FROM  \
( \
    SELECT 1 AS x \
    UNION ALL \
    SELECT 1 \
    UNION DISTINCT \
    SELECT 3 \
)
```