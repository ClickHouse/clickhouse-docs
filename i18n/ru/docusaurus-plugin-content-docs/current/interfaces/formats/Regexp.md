---
alias: []
description: 'Документация по формату Regexp'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |



## Описание {#description}

Формат `Regex` разбирает каждую строку импортируемых данных согласно заданному регулярному выражению.

**Использование**

Регулярное выражение из настройки [format_regexp](/operations/settings/settings-formats.md/#format_regexp) применяется к каждой строке импортируемых данных. Количество подшаблонов в регулярном выражении должно совпадать с количеством столбцов в импортируемом наборе данных.

Строки импортируемых данных должны разделяться символом перевода строки `'\n'` или символом перевода строки в стиле DOS `"\r\n"`.

Содержимое каждого совпавшего подшаблона разбирается в соответствии с методом соответствующего типа данных согласно настройке [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule).

Если регулярное выражение не соответствует строке и параметр [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) установлен в 1, строка пропускается без уведомления. В противном случае генерируется исключение.


## Пример использования {#example-usage}

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

Вставим данные из указанного выше файла в таблицу с помощью следующего запроса:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

Теперь можно выполнить `SELECT` для получения данных из таблицы и проверить, как формат `Regex` обработал данные из файла:

```sql title="Запрос"
SELECT * FROM imp_regex_table;
```

```text title="Результат"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```


## Настройки формата {#format-settings}

При работе с форматом `Regexp` можно использовать следующие настройки:

- `format_regexp` — [String](/sql-reference/data-types/string.md). Содержит регулярное выражение в формате [re2](https://github.com/google/re2/wiki/Syntax).
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md). Поддерживаются следующие правила экранирования:
  - CSV (аналогично [CSV](/interfaces/formats/CSV))
  - JSON (аналогично [JSONEachRow](/interfaces/formats/JSONEachRow))
  - Escaped (аналогично [TSV](/interfaces/formats/TabSeparated))
  - Quoted (аналогично [Values](/interfaces/formats/Values))
  - Raw (извлекает подшаблоны целиком, без правил экранирования, аналогично [TSVRaw](/interfaces/formats/TabSeparated))

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md). Определяет, нужно ли генерировать исключение, если выражение `format_regexp` не соответствует импортируемым данным. Может принимать значение `0` или `1`.
