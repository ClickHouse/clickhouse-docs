---
alias: []
description: 'Документация формата JSONAsString'
input_format: true
keywords: ['JSONAsString']
output_format: false
slug: /interfaces/formats/JSONAsString
title: 'JSONAsString'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|---------|-------|
| ✔     | ✗       |       |



## Описание {#description}

В этом формате один JSON-объект интерпретируется как одно значение. 
Если на входе несколько JSON-объектов (разделённых запятыми), они интерпретируются как отдельные строки. 
Если входные данные заключены в квадратные скобки, они интерпретируются как массив JSON-объектов.

:::note
Этот формат можно разобрать только для таблицы с единственным полем типа [String](/sql-reference/data-types/string.md). 
Оставшиеся столбцы должны быть заданы либо как [`DEFAULT`](/sql-reference/statements/create/table.md/#default), либо как [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view), 
или не указываться. 
:::

После сериализации всего JSON-объекта в значение типа String вы можете использовать [JSON-функции](/sql-reference/functions/json-functions.md) для его обработки.



## Пример использования

### Простейший пример

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

### Массив объектов JSON

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


## Параметры форматирования {#format-settings}
