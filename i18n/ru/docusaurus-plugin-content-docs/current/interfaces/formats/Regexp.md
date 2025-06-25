---
alias: []
description: 'Документация формата Regexp'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✗               |           |

## Описание {#description}

Формат `Regex` анализирует каждую строку импортируемых данных в соответствии с предоставленным регулярным выражением.

**Использование**

Регулярное выражение из параметра [format_regexp](/operations/settings/settings-formats.md/#format_regexp) применяется ко всем строкам импортируемых данных. Количество подшаблонов в регулярном выражении должно соответствовать количеству колонок в импортируемом наборе данных.

Строки импортируемых данных должны разделяться символом новой строки `'\n'` или символом новой строки в стиле DOS `"\r\n"`.

Содержимое каждого совпадающего подшаблона анализируется с использованием метода соответствующего типа данных, в соответствии с параметром [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule).

Если регулярное выражение не совпадает со строкой, а [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) установлен в 1, строка будет тихо пропущена. В противном случае будет выброшено исключение.

## Пример Использования {#example-usage}

Рассмотрим файл `data.tsv`:

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```
и таблицу `imp_regex_table`:

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

Мы вставим данные из упомянутого файла в таблицу с использованием следующего запроса:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

Теперь мы можем `SELECT` данные из таблицы, чтобы увидеть, как формат `Regex` обработал данные из файла:

```sql title="Query"
SELECT * FROM imp_regex_table;
```

```text title="Response"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```

## Настройки Формата {#format-settings}

При работе с форматом `Regexp` вы можете использовать следующие настройки:

- `format_regexp` — [String](/sql-reference/data-types/string.md). Содержит регулярное выражение в формате [re2](https://github.com/google/re2/wiki/Syntax).
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md). Поддерживаются следующие правила экранирования:

  - CSV (аналогично [CSV](/interfaces/formats/CSV))
  - JSON (аналогично [JSONEachRow](/interfaces/formats/JSONEachRow))
  - Escaped (аналогично [TSV](/interfaces/formats/TabSeparated))
  - Quoted (аналогично [Values](/interfaces/formats/Values))
  - Raw (извлекает подшаблоны целиком, без правил экранирования, аналогично [TSVRaw](/interfaces/formats/TabSeparated))

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md). Определяет необходимость выбрасывать исключение в случае, если выражение `format_regexp` не совпадает с импортированными данными. Может быть установлен в `0` или `1`.
