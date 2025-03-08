---
slug: /operations/utilities/clickhouse-format
title: clickhouse-format
---

Позволяет форматировать входные запросы.

Ключи:

- `--help` или `-h` — Вывести сообщение справки.
- `--query` — Форматировать запросы любой длины и сложности.
- `--hilite` — Добавить подсветку синтаксиса с помощью последовательностей управляющих символов ANSI терминала.
- `--oneline` — Форматировать в одну строку.
- `--max_line_length` — Форматировать запросы в одну строку с длиной менее указанной.
- `--comments` — Сохранять комментарии в выводе.
- `--quiet` или `-q` — Просто проверить синтаксис, без вывода при успешном выполнении.
- `--multiquery` или `-n` — Разрешить несколько запросов в одном файле.
- `--obfuscate` — Обфусцировать вместо форматирования.
- `--seed <строка>` — Произвольная строка-начало, определяющая результат обфускации.
- `--backslash` — Добавить обратный слэш в конце каждой строки отформатированного запроса. Может быть полезно, когда вы копируете запрос с веб-страницы или откуда-то еще с несколькими строками и хотите выполнить его в командной строке.

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

2. Подсветка и одна строка:

```bash
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

Результат:

```sql
SELECT sum(number) FROM numbers(5)
```

3. Мультизапросы:

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

Тот же запрос и другая строка начального значения:

```bash
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

Результат:

```sql
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. Добавление обратного слэша:

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
