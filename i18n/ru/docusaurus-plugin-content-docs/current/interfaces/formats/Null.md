---
alias: []
description: 'Документация для формата Null'
input_format: false
keywords: ['Null', 'format']
output_format: true
slug: /interfaces/formats/Null
title: 'Null'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✗    | ✔     |           |

## Описание {#description}

В формате `Null` - ничего не выводится. 
Это может показаться странным, но важно отметить, что, несмотря на отсутствие вывода, запрос все равно обрабатывается, 
и при использовании клиентa командной строки данные передаются клиенту. 

:::tip
Формат `Null` может быть полезен для тестирования производительности.
:::

## Пример использования {#example-usage}

Подключитесь к `play.clickhouse.com` с помощью клиента ClickHouse:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

Выполните следующий запрос:

```sql title="Запрос"
SELECT town
FROM uk_price_paid
LIMIT 1000
FORMAT `Null`
```

```response title="Ответ"
0 rows in set. Elapsed: 0.002 sec. Processed 1.00 thousand rows, 2.00 KB (506.97 thousand rows/s., 1.01 MB/s.)
Peak memory usage: 297.74 KiB.
```

Обратите внимание, что было обработано 1000 строк, но 0 строк было выведено в результирующем наборе.

## Настройки формата {#format-settings}
