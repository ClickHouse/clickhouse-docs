---
alias: []
description: 'Документация по формату LineAsString'
input_format: true
keywords: ['LineAsString']
output_format: true
slug: /interfaces/formats/LineAsString
title: 'LineAsString'
doc_type: 'reference'
---

| Input | Output | Псевдоним |
|-------|--------|-----------|
| ✔     | ✔      |           |



## Описание {#description}

Формат `LineAsString` интерпретирует каждую строку входных данных как единое строковое значение.
Этот формат может быть разобран только для таблицы с одним полем типа [String](/sql-reference/data-types/string.md).
Остальные столбцы должны быть заданы как [`DEFAULT`](/sql-reference/statements/create/table.md/#default), [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) или опущены.


## Пример использования {#example-usage}

```sql title="Запрос"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="Результат"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```


## Настройки формата {#format-settings}
