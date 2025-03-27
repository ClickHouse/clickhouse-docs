---
alias: []
description: 'Документация для формата TSKV'
input_format: true
keywords: ['TSKV']
output_format: true
slug: /interfaces/formats/TSKV
title: 'TSKV'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похож на формат [`TabSeparated`](./TabSeparated.md), но выводит значение в формате `name=value`. 
Имена экранируются так же, как в формате [`TabSeparated`](./TabSeparated.md), и символ `=` также экранируется.

```text
SearchPhrase=   count()=8267016
SearchPhrase=bathroom interior design    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014 spring fashion    count()=1549
SearchPhrase=freeform photos       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=photos of dog breeds    count()=1091
SearchPhrase=curtain designs        count()=1064
SearchPhrase=baku       count()=1000
```

```sql title="Запрос"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Ответ"
x=1    y=\N
```

:::note
Когда имеется большое количество небольших столбцов, этот формат неэффективен, и, как правило, нет причины его использовать. 
Тем не менее, он не хуже формата [`JSONEachRow`](../JSON/JSONEachRow.md) с точки зрения эффективности.
:::

Парсинг поддерживает любой порядок для значений различных столбцов. 
Допускается пропуск некоторых значений, так как они рассматриваются как равные своим значениям по умолчанию.
В этом случае нули и пустые строки используются как значения по умолчанию. 
Сложные значения, которые могут быть указаны в таблице, не поддерживаются в качестве значений по умолчанию.

Парсинг позволяет добавить дополнительное поле `tskv` без знака равенства или значения. Это поле игнорируется.

При импорте столбцы с неизвестными именами будут пропущены, 
если параметр [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`.

[NULL](/sql-reference/syntax.md) форматируется как `\N`.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
