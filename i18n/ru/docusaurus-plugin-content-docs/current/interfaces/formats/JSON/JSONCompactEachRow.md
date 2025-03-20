---
title: 'JSONCompactEachRow'
slug: '/interfaces/formats/JSONCompactEachRow'
keywords: ['JSONCompactEachRow']
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |

## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md) только тем, что строки данных выводятся в виде массивов, а не объектов.

## Пример использования {#example-usage}

Пример:

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## Настройки формата {#format-settings}
