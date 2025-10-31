---
slug: '/interfaces/formats/TSKV'
description: 'Документация для формата TSKV'
title: TSKV
keywords: ['TSKV']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похож на формат [`TabSeparated`](./TabSeparated.md), но выводит значение в формате `name=value`. 
Имена экранируются так же, как и в формате [`TabSeparated`](./TabSeparated.md), а символ `=` также экранируется.

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

```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
Когда есть большое количество мелких колонок, этот формат неэффективен, и в общем нет причин его использовать. 
Тем не менее, он не хуже, чем формат [`JSONEachRow`](../JSON/JSONEachRow.md) по эффективности.
:::

Для парсинга поддерживается любой порядок значений разных колонок. 
Допускается пропуск некоторых значений, так как они считаются равными своим значениям по умолчанию.
В этом случае нули и пустые строки используются в качестве значений по умолчанию. 
Сложные значения, которые могли бы быть указаны в таблице, не поддерживаются в качестве значений по умолчанию.

Парсинг позволяет добавить дополнительное поле `tskv` без знака равенства или значения. Это поле игнорируется.

При импорте колонки с неизвестными именами будут пропущены, 
если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.

[NULL](/sql-reference/syntax.md) форматируется как `\N`.

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя следующий файл tskv, называемый `football.tskv`:

```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.tskv' FORMAT TSKV;
```

### Чтение данных {#reading-data}

Чтение данных с использованием формата `TSKV`:

```sql
SELECT *
FROM football
FORMAT TSKV
```

Вывод будет в табличном формате с двумя строками заголовка для имен колонок и типов:

```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```

## Настройки формата {#format-settings}