---
slug: '/interfaces/formats/JSONAsObject'
description: 'Документация для формата JSONAsObject'
title: JSONAsObject
keywords: ['JSONAsObject']
doc_type: reference
input_format: true
output_format: false
---
## Описание {#description}

В этом формате один объект JSON интерпретируется как одно значение [JSON](/sql-reference/data-types/newjson.md). Если входные данные содержат несколько объектов JSON (разделенных запятыми), они интерпретируются как отдельные строки. Если входные данные заключены в квадратные скобки, они интерпретируются как массив JSON.

Этот формат может быть разобран только для таблицы с одним полем типа [JSON](/sql-reference/data-types/newjson.md). Остальные столбцы должны быть установлены как [`DEFAULT`](/sql-reference/statements/create/table.md/#default) или [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view).

## Пример использования {#example-usage}

### Базовый пример {#basic-example}

```sql title="Query"
CREATE TABLE json_as_object (json JSON) ENGINE = Memory;
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_object FORMAT JSONEachRow;
```

```response title="Response"
{"json":{"foo":{"bar":{"x":"y"},"baz":"1"}}}
{"json":{}}
{"json":{"any json stucture":"1"}}
```

### Массив объектов JSON {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field JSON) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsObject [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];
SELECT * FROM json_square_brackets FORMAT JSONEachRow;
```

```response title="Response"
{"field":{"id":"1","name":"name1"}}
{"field":{"id":"2","name":"name2"}}
```

### Столбцы со значениями по умолчанию {#columns-with-default-values}

```sql title="Query"
CREATE TABLE json_as_object (json JSON, time DateTime MATERIALIZED now()) ENGINE = Memory;
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"foo":{"bar":{"x":"y"},"baz":1}};
INSERT INTO json_as_object (json) FORMAT JSONAsObject {};
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"any json stucture":1}
SELECT time, json FROM json_as_object FORMAT JSONEachRow
```

```response title="Response"
{"time":"2024-09-16 12:18:10","json":{}}
{"time":"2024-09-16 12:18:13","json":{"any json stucture":"1"}}
{"time":"2024-09-16 12:18:08","json":{"foo":{"bar":{"x":"y"},"baz":"1"}}}
```

## Настройки формата {#format-settings}