---
description: 'Руководство по использованию утилиты clickhouse-format для работы с форматами данных в ClickHouse'
slug: /operations/utilities/clickhouse-format
title: 'clickhouse-format'
doc_type: 'reference'
---



# Утилита clickhouse-format

Позволяет форматировать входные запросы.

Ключи:

- `--help` или `-h` — Вывести справочное сообщение.
- `--query` — Форматировать запросы любой длины и сложности.
- `--hilite` или `--highlight` — Добавить подсветку синтаксиса с помощью управляющих последовательностей терминала ANSI.
- `--oneline` — Форматировать в одну строку.
- `--max_line_length` — Форматировать в одну строку запросы длиной меньше указанной.
- `--comments` — Сохранять комментарии в выводе.
- `--quiet` или `-q` — Только проверить синтаксис, без вывода при успешной проверке.
- `--multiquery` или `-n` — Разрешить несколько запросов в одном файле.
- `--obfuscate` — Обфусцировать вместо форматирования.
- `--seed <string>` — Задать произвольную строку-инициализатор, определяющую результат обфускации.
- `--backslash` — Добавить обратный слэш в конец каждой строки форматированного запроса. Может быть полезно, когда вы копируете многострочный запрос из интернета или из другого источника и хотите выполнить его в командной строке.
- `--semicolons_inline` — В режиме multiquery записывать точки с запятой в последней строке запроса, а не на новой строке.



## Примеры {#examples}

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

2. Подсветка синтаксиса и вывод в одну строку:

```bash
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

Результат:

```sql
SELECT sum(number) FROM numbers(5)
```

3. Несколько запросов:

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

4. Обфускация:

```bash
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

Результат:

```sql
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

Тот же запрос с другим начальным значением:

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
