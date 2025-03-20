---
title: TSKV
slug: /interfaces/formats/TSKV
keywords: ['TSKV']
input_format: true
output_format: true
alias: []
---

| Входной | Выходной | Псевдоним |
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
Когда имеется большое количество мелких колонок, этот формат неэффективен, и, как правило, нет причин его использовать. 
Тем не менее, по эффективности он не хуже формата [`JSONEachRow`](../JSON/JSONEachRow.md).
:::

Для парсинга поддерживается любой порядок значений различных колонок. 
Допускается, что некоторые значения могут быть опущены, так как они рассматриваются как эквивалентные своим значениям по умолчанию.
В этом случае нули и пустые строки используются в качестве значений по умолчанию. 
Сложные значения, которые могут быть указаны в таблице, не поддерживаются как значения по умолчанию.

Парсинг позволяет добавить дополнительное поле `tskv` без знака равенства или значения. Это поле игнорируется.

При импорте колонки с неизвестными названиями будут пропущены, 
если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.

[NULL](/sql-reference/syntax.md) форматируется как `\N`.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
