---
slug: '/interfaces/formats/JSONAsString'
description: 'Документация для формата JSONAsString'
title: JSONAsString
keywords: ['JSONAsString']
doc_type: reference
input_format: true
output_format: false
---
| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## Описание {#description}

В этом формате один объект JSON интерпретируется как одно значение. 
Если входные данные содержат несколько объектов JSON (разделенных запятыми), они интерпретируются как отдельные строки. 
Если входные данные заключены в квадратные скобки, они интерпретируются как массив объектов JSON.

:::note
Этот формат может быть разобран только для таблицы с единственным полем типа [String](/sql-reference/data-types/string.md). 
Остальные колонки должны быть установлены либо в [`DEFAULT`](/sql-reference/statements/create/table.md/#default), либо в [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view), 
или могут быть опущены. 
:::

Как только вы сериализуете весь объект JSON в строку, вы можете использовать [JSON функции](/sql-reference/functions/json-functions.md) для его обработки.

## Пример использования {#example-usage}

### Основной пример {#basic-example}

```sql title="Query"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="Response"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### Массив объектов JSON {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="Response"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## Настройки формата {#format-settings}