---
alias: []
description: 'Документация для формата LineAsString'
input_format: true
keywords: ['LineAsString']
output_format: true
slug: /interfaces/formats/LineAsString
title: 'LineAsString'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

Формат `LineAsString` интерпретирует каждую строку входных данных как одно строковое значение. 
Этот формат может быть разобран только для таблицы с единственным полем типа [String](/sql-reference/data-types/string.md). 
Остальные колонки должны быть установлены на [`DEFAULT`](/sql-reference/statements/create/table.md/#default), [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) или опущены.

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
