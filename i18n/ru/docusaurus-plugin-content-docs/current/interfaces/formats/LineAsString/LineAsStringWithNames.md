---
slug: '/interfaces/formats/LineAsStringWithNames'
description: 'Документация для формата LineAsStringWithNames'
title: LineAsStringWithNames
keywords: ['LineAsStringWithNames']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Формат `LineAsStringWithNames` похож на формат [`LineAsString`](./LineAsString.md), но выводит строку заголовка с именами колонок.

## Пример использования {#example-usage}

```sql title="Query"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="Response"
name    value
John    30
Jane    25
Peter    35
```

## Настройки формата {#format-settings}