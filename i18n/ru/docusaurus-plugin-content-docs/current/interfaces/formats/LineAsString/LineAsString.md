---
title: LineAsString
slug: /interfaces/formats/LineAsString
keywords: [LineAsString]
input_format: true
output_format: true
alias: []
---

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `LineAsString` интерпретирует каждую строку входных данных как одно значение строки. 
Этот формат можно разобрать только для таблицы с одним полем типа [String](/sql-reference/data-types/string.md). 
Оставшиеся колонки должны быть установлены в [`DEFAULT`](/sql-reference/statements/create/table.md/#default), [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) или опущены.

## Пример использования {#example-usage}

```sql title="Запрос"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="Ответ"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## Настройки формата {#format-settings}
