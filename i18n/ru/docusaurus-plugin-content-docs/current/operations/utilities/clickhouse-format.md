---
description: 'Руководство по работе с утилитой clickhouse-format для форматов данных ClickHouse'
slug: /operations/utilities/clickhouse-format
title: 'clickhouse-format'
doc_type: 'reference'
---

# Утилита clickhouse-format \{#clickhouse-format-utility\}

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

```bash
$ clickhouse-format --query "select number from numbers(10) where number%2 order by number desc;"
```

Результат:

```bash
SELECT number
FROM numbers(10)
WHERE number % 2
ORDER BY number DESC
```

2. Подсветка и однострочные фрагменты:

```bash
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

Результат:

```sql
SELECT sum(number) FROM numbers(5)
```

3. Множественные запросы:

```bash
$ clickhouse-format -n <<< "SELECT min(number) FROM numbers(5); SELECT max(number) FROM numbers(5);"
```

Результат:

```sql
SELECT min(number)
FROM numbers(5)
;

SELECT max(number)
FROM numbers(5)
;

```

4. Обфускация данных:

```bash
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

Результат:

```sql
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

Тот же запрос, но другая строка-затравка:

```bash
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

Результат:

```sql
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. Добавление обратного слеша:

```bash
$ clickhouse-format --backslash <<< "SELECT * FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION DISTINCT SELECT 3);"
```

Результат:

```sql
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
