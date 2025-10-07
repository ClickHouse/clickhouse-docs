---
slug: '/interfaces/formats/LineAsString'
description: 'Документация для формата LineAsString'
title: LineAsString
keywords: ['LineAsString']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `LineAsString` интерпретирует каждую строку входных данных как одно строковое значение. 
Этот формат может быть разобран только для таблицы с одним полем типа [String](/sql-reference/data-types/string.md). 
Оставшиеся колонки должны быть установлены в [`DEFAULT`](/sql-reference/statements/create/table.md/#default), [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) или быть опущены.

## Пример использования {#example-usage}

```sql title="Query"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="Response"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## Настройки формата {#format-settings}