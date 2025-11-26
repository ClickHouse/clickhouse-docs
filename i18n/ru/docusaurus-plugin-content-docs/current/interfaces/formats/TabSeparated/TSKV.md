---
alias: []
description: 'Документация по формату TSKV'
input_format: true
keywords: ['TSKV']
output_format: true
slug: /interfaces/formats/TSKV
title: 'TSKV'
doc_type: 'reference'
---

| Входной формат | Выходной формат | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |



## Описание

Аналогичен формату [`TabSeparated`](./TabSeparated.md), но выводит значение в формате `name=value`.
Имена экранируются так же, как в формате [`TabSeparated`](./TabSeparated.md), и символ `=` также экранируется.

```text
SearchPhrase=   count()=8267016
SearchPhrase=дизайн интерьера ванной комнаты    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=весенняя мода 2014    count()=1549
SearchPhrase=фотографии в свободном стиле       count()=1480
SearchPhrase=анджелина джоли    count()=1245
SearchPhrase=омск       count()=1112
SearchPhrase=фотографии пород собак    count()=1091
SearchPhrase=дизайн штор        count()=1064
SearchPhrase=баку       count()=1000
```

```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
При большом количестве небольших столбцов этот формат неэффективен и, как правило, не имеет смысла его использовать.
Тем не менее по эффективности он не уступает формату [`JSONEachRow`](../JSON/JSONEachRow.md).
:::

При разборе поддерживается любой порядок значений различных столбцов.
Допускается опускать некоторые значения, так как они считаются эквивалентными значениям по умолчанию.
В этом случае в качестве значений по умолчанию используются нули и пустые строки.
Сложные значения, которые могли бы быть заданы в таблице, не поддерживаются в качестве значений по умолчанию.

При разборе допускается добавление дополнительного поля `tskv` без знака равенства или значения. Это поле игнорируется.

При импорте столбцы с неизвестными именами будут пропущены,
если параметр [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`.

[NULL](/sql-reference/syntax.md) форматируется как `\N`.


## Пример использования

### Вставка данных

Используем следующий файл в формате TSKV с именем `football.tskv`:

```tsv
date=2022-04-30 season=2021     home_team=Саттон Юнайтед away_team=Брэдфорд Сити home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Свиндон Таун  away_team=Барроу        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Транмер Роверс       away_team=Олдэм Атлетик       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Порт Вэйл     away_team=Ньюпорт Каунти        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Сэлфорд Сити  away_team=Мансфилд Таун        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Барроу        away_team=Нортгемптон Таун      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Брэдфорд Сити away_team=Карлайл Юнайтед       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Бристоль Роверс        away_team=Сканторп Юнайтед     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Эксетер Сити   away_team=Порт Вэйл     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Харрогейт Таун A.F.C. away_team=Саттон Юнайтед home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Хартлпул Юнайтед     away_team=Колчестер Юнайтед     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Лейтон Орриент away_team=Транмер Роверс       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Мансфилд Таун        away_team=Форест Грин Роверс   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Ньюпорт Каунти        away_team=Рочдейл      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Олдэм Атлетик       away_team=Кроули Таун  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Стивенэйдж Боро     away_team=Сэлфорд Сити  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Уолсолл       away_team=Свиндон Таун  home_team_goals=0       away_team_goals=3
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.tskv' FORMAT TSKV;
```

### Чтение данных

Считайте данные в формате `TSKV`:

```sql
SELECT *
FROM football
FORMAT TSKV
```

Результат будет в табличном формате с разделителем табуляцией и двумя строками заголовков для названий столбцов и их типов:


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


## Настройки форматирования {#format-settings}