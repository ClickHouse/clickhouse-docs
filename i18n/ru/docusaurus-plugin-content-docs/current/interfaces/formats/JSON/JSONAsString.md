---
alias: []
description: 'Документация по формату JSONAsString'
input_format: true
keywords: ['JSONAsString']
output_format: false
slug: /interfaces/formats/JSONAsString
title: 'JSONAsString'
doc_type: 'reference'
---

| Вход | Выход  | Псевдоним |
|------|--------|-----------|
| ✔    | ✗      |           |



## Описание {#description}

В этом формате один JSON-объект интерпретируется как одно значение.
Если во входных данных содержится несколько JSON-объектов (разделённых запятыми), они интерпретируются как отдельные строки.
Если входные данные заключены в квадратные скобки, они интерпретируются как массив JSON-объектов.

:::note
Этот формат может быть разобран только для таблицы с одним полем типа [String](/sql-reference/data-types/string.md).
Остальные столбцы должны иметь значение [`DEFAULT`](/sql-reference/statements/create/table.md/#default) или [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view),
либо быть опущены.
:::

После сериализации всего JSON-объекта в String можно использовать [функции JSON](/sql-reference/functions/json-functions.md) для его обработки.


## Примеры использования {#example-usage}

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
