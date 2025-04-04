---
alias: []
description: 'Документация для формата JSONAsString'
input_format: true
keywords: ['JSONAsString']
output_format: false
slug: /interfaces/formats/JSONAsString
title: 'JSONAsString'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✗              |           |

## Описание {#description}

В этом формате один объект JSON интерпретируется как одно значение. 
Если входные данные содержат несколько объектов JSON (разделённых запятыми), они интерпретируются как отдельные строки. 
Если входные данные заключены в квадратные скобки, то они интерпретируются как массив объектов JSON.

:::note
Этот формат можно разобрать только для таблицы с одним полем типа [String](/sql-reference/data-types/string.md). 
Оставшиеся колонки должны быть установлены либо в [`DEFAULT`](/sql-reference/statements/create/table.md/#default), либо в [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view), 
или могут быть опущены. 
:::

Как только вы сериализуете весь объект JSON в строку, вы можете использовать [JSON функции](/sql-reference/functions/json-functions.md) для его обработки.

## Пример использования {#example-usage}

### Базовый пример {#basic-example}

```sql title="Запрос"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="Ответ"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### Массив объектов JSON {#an-array-of-json-objects}

```sql title="Запрос"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="Ответ"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## Настройки формата {#format-settings}
