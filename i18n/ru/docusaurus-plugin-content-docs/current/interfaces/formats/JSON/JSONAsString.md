---
title: JSONAsString
slug: /interfaces/formats/JSONAsString
keywords: [JSONAsString]
input_format: true
output_format: false
alias: []
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |


## Описание {#description}

В этом формате единый JSON-объект интерпретируется как единое значение. 
Если входные данные содержат несколько JSON-объектов (разделённых запятыми), они интерпретируются как отдельные строки. 
Если входные данные заключены в квадратные скобки, это интерпретируется как массив JSON-объектов.

:::note
Этот формат может быть разобран только для таблицы с единственным полем типа [String](/sql-reference/data-types/string.md). 
Остальные колонки должны быть установлены либо на [`DEFAULT`](/sql-reference/statements/create/table.md/#default), либо на [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view), 
или могут быть опущены. 
:::

После того как вы сериализуете весь JSON-объект в строку, вы можете использовать [JSON функции](/sql-reference/functions/json-functions.md) для его обработки.

## Пример использования {#example-usage}

### Основной пример {#basic-example}

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

### Массив JSON-объектов {#an-array-of-json-objects}

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
