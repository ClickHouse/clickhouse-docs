---
description: 'Набор данных, содержащий 1,3 миллиона записей исторических данных о меню
  гостиниц, ресторанов и кафе с блюдами и их ценами.'
sidebar_label: 'Набор данных New York Public Library "What''s on the Menu?"'
slug: /getting-started/example-datasets/menus
title: 'Набор данных New York Public Library "What''s on the Menu?"'
doc_type: 'guide'
keywords: ['пример набора данных', 'меню', 'исторические данные', 'образец данных', 'nypl']
---

Набор данных создан Нью-Йоркской публичной библиотекой. Он содержит исторические данные о меню гостиниц, ресторанов и кафе с перечнем блюд и их ценами.

Источник: http://menus.nypl.org/data  
Данные находятся в общественном достоянии.

Данные взяты из архивов библиотеки, поэтому они могут быть неполными и неудобными для статистического анализа. Тем не менее, они выглядят очень аппетитно.
Размер — всего 1,3 миллиона записей о блюдах в меню — это очень маленький объём данных для ClickHouse, но всё же это хороший пример.



## Загрузите набор данных {#download-dataset}

Выполните команду:


```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz
# Опционально: Проверка контрольной суммы
md5sum 2021_08_01_07_01_17_data.tgz
# Контрольная сумма должна быть: db6126724de939a5481e3160a2d67d15
```

При необходимости замените ссылку на актуальную с сайта [http://menus.nypl.org/data](http://menus.nypl.org/data).
Размер загружаемого файла — около 35 МБ.


## Распаковка набора данных {#unpack-dataset}

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

Размер распакованных данных составляет около 150 МБ.

Данные нормализованы и состоят из четырёх таблиц:

- `Menu` — информация о меню: название ресторана, дата просмотра меню и т. д.
- `Dish` — информация о блюдах: название блюда и его характеристики.
- `MenuPage` — информация о страницах меню, так как каждая страница принадлежит определённому меню.
- `MenuItem` — элемент меню. Блюдо с указанием цены на определённой странице меню: содержит ссылки на блюдо и страницу меню.


## Создание таблиц {#create-tables}

Для хранения цен используется тип данных [Decimal](../../sql-reference/data-types/decimal.md).

```sql
CREATE TABLE dish
(
    id UInt32,
    name String,
    description String,
    menus_appeared UInt32,
    times_appeared Int32,
    first_appeared UInt16,
    last_appeared UInt16,
    lowest_price Decimal64(3),
    highest_price Decimal64(3)
) ENGINE = MergeTree ORDER BY id;

CREATE TABLE menu
(
    id UInt32,
    name String,
    sponsor String,
    event String,
    venue String,
    place String,
    physical_description String,
    occasion String,
    notes String,
    call_number String,
    keywords String,
    language String,
    date String,
    location String,
    location_type String,
    currency String,
    currency_symbol String,
    status String,
    page_count UInt16,
    dish_count UInt16
) ENGINE = MergeTree ORDER BY id;

CREATE TABLE menu_page
(
    id UInt32,
    menu_id UInt32,
    page_number UInt16,
    image_id String,
    full_height UInt16,
    full_width UInt16,
    uuid UUID
) ENGINE = MergeTree ORDER BY id;

CREATE TABLE menu_item
(
    id UInt32,
    menu_page_id UInt32,
    price Decimal64(3),
    high_price Decimal64(3),
    dish_id UInt32,
    created_at DateTime,
    updated_at DateTime,
    xpos Float64,
    ypos Float64
) ENGINE = MergeTree ORDER BY id;
```


## Импорт данных {#import-data}

Для загрузки данных в ClickHouse выполните:

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

Используется формат [CSVWithNames](/interfaces/formats/CSVWithNames), поскольку данные представлены в виде CSV с заголовком.

Параметр `format_csv_allow_single_quotes` отключён, так как для полей данных используются только двойные кавычки, а одинарные кавычки могут присутствовать внутри значений и не должны вводить парсер CSV в заблуждение.

Параметр [input_format_null_as_default](/operations/settings/formats#input_format_null_as_default) отключён, поскольку данные не содержат [NULL](/operations/settings/formats#input_format_null_as_default). В противном случае ClickHouse будет пытаться разобрать последовательности `\N` и может неправильно интерпретировать символ `\` в данных.

Настройка [date_time_input_format best_effort](/operations/settings/formats#date_time_input_format) позволяет разбирать поля [DateTime](../../sql-reference/data-types/datetime.md) в широком диапазоне форматов. Например, будет распознан формат ISO-8601 без секунд, такой как '2000-01-01 01:02'. Без этой настройки допускается только фиксированный формат DateTime.


## Денормализация данных {#denormalize-data}

Данные представлены в нескольких таблицах в [нормализованной форме](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms). Это означает, что для выполнения запросов, например, для получения названий блюд из элементов меню, необходимо использовать [JOIN](/sql-reference/statements/select/join).
Для типичных аналитических задач гораздо эффективнее работать с предварительно объединёнными данными, чтобы избежать выполнения `JOIN` при каждом запросе. Такие данные называются «денормализованными».

Создадим таблицу `menu_item_denorm`, которая будет содержать все объединённые данные:

```sql
CREATE TABLE menu_item_denorm
ENGINE = MergeTree ORDER BY (dish_name, created_at)
AS SELECT
    price,
    high_price,
    created_at,
    updated_at,
    xpos,
    ypos,
    dish.id AS dish_id,
    dish.name AS dish_name,
    dish.description AS dish_description,
    dish.menus_appeared AS dish_menus_appeared,
    dish.times_appeared AS dish_times_appeared,
    dish.first_appeared AS dish_first_appeared,
    dish.last_appeared AS dish_last_appeared,
    dish.lowest_price AS dish_lowest_price,
    dish.highest_price AS dish_highest_price,
    menu.id AS menu_id,
    menu.name AS menu_name,
    menu.sponsor AS menu_sponsor,
    menu.event AS menu_event,
    menu.venue AS menu_venue,
    menu.place AS menu_place,
    menu.physical_description AS menu_physical_description,
    menu.occasion AS menu_occasion,
    menu.notes AS menu_notes,
    menu.call_number AS menu_call_number,
    menu.keywords AS menu_keywords,
    menu.language AS menu_language,
    menu.date AS menu_date,
    menu.location AS menu_location,
    menu.location_type AS menu_location_type,
    menu.currency AS menu_currency,
    menu.currency_symbol AS menu_currency_symbol,
    menu.status AS menu_status,
    menu.page_count AS menu_page_count,
    menu.dish_count AS menu_dish_count
FROM menu_item
    JOIN dish ON menu_item.dish_id = dish.id
    JOIN menu_page ON menu_item.menu_page_id = menu_page.id
    JOIN menu ON menu_page.menu_id = menu.id;
```


## Проверка данных {#validate-data}

Запрос:

```sql
SELECT count() FROM menu_item_denorm;
```

Результат:

```text
┌─count()─┐
│ 1329175 │
└─────────┘
```


## Выполнение запросов {#run-queries}

### Средние исторические цены блюд {#query-averaged-historical-prices}

Запрос:

```sql
SELECT
    round(toUInt32OrZero(extract(menu_date, '^\\d{4}')), -1) AS d,
    count(),
    round(avg(price), 2),
    bar(avg(price), 0, 100, 100)
FROM menu_item_denorm
WHERE (menu_currency = 'Dollars') AND (d > 0) AND (d < 2022)
GROUP BY d
ORDER BY d ASC;
```

Результат:

```text
┌────d─┬─count()─┬─round(avg(price), 2)─┬─bar(avg(price), 0, 100, 100)─┐
│ 1850 │     618 │                  1.5 │ █▍                           │
│ 1860 │    1634 │                 1.29 │ █▎                           │
│ 1870 │    2215 │                 1.36 │ █▎                           │
│ 1880 │    3909 │                 1.01 │ █                            │
│ 1890 │    8837 │                  1.4 │ █▍                           │
│ 1900 │  176292 │                 0.68 │ ▋                            │
│ 1910 │  212196 │                 0.88 │ ▊                            │
│ 1920 │  179590 │                 0.74 │ ▋                            │
│ 1930 │   73707 │                  0.6 │ ▌                            │
│ 1940 │   58795 │                 0.57 │ ▌                            │
│ 1950 │   41407 │                 0.95 │ ▊                            │
│ 1960 │   51179 │                 1.32 │ █▎                           │
│ 1970 │   12914 │                 1.86 │ █▋                           │
│ 1980 │    7268 │                 4.35 │ ████▎                        │
│ 1990 │   11055 │                 6.03 │ ██████                       │
│ 2000 │    2467 │                11.85 │ ███████████▋                 │
│ 2010 │     597 │                25.66 │ █████████████████████████▋   │
└──────┴─────────┴──────────────────────┴──────────────────────────────┘
```

К этим данным следует относиться с определённой долей скептицизма.

### Цены на бургеры {#query-burger-prices}

Запрос:

```sql
SELECT
    round(toUInt32OrZero(extract(menu_date, '^\\d{4}')), -1) AS d,
    count(),
    round(avg(price), 2),
    bar(avg(price), 0, 50, 100)
FROM menu_item_denorm
WHERE (menu_currency = 'Dollars') AND (d > 0) AND (d < 2022) AND (dish_name ILIKE '%burger%')
GROUP BY d
ORDER BY d ASC;
```

Результат:


```text
┌────d─┬─count()─┬─round(avg(price), 2)─┬─bar(avg(price), 0, 50, 100)───────────┐
│ 1880 │       2 │                 0.42 │ ▋                                     │
│ 1890 │       7 │                 0.85 │ █▋                                    │
│ 1900 │     399 │                 0.49 │ ▊                                     │
│ 1910 │     589 │                 0.68 │ █▎                                    │
│ 1920 │     280 │                 0.56 │ █                                     │
│ 1930 │      74 │                 0.42 │ ▋                                     │
│ 1940 │     119 │                 0.59 │ █▏                                    │
│ 1950 │     134 │                 1.09 │ ██▏                                   │
│ 1960 │     272 │                 0.92 │ █▋                                    │
│ 1970 │     108 │                 1.18 │ ██▎                                   │
│ 1980 │      88 │                 2.82 │ █████▋                                │
│ 1990 │     184 │                 3.68 │ ███████▎                              │
│ 2000 │      21 │                 7.14 │ ██████████████▎                       │
│ 2010 │       6 │                18.42 │ ████████████████████████████████████▋ │
└──────┴─────────┴──────────────────────┴───────────────────────────────────────┘
```

### Водка {#query-vodka}

Запрос:

```sql
SELECT
    round(toUInt32OrZero(extract(menu_date, '^\\d{4}')), -1) AS d,
    count(),
    round(avg(price), 2),
    bar(avg(price), 0, 50, 100)
FROM menu_item_denorm
WHERE (menu_currency IN ('Dollars', '')) AND (d > 0) AND (d < 2022) AND (dish_name ILIKE '%vodka%')
GROUP BY d
ORDER BY d ASC;
```

Результат:

```text
┌────d─┬─count()─┬─round(avg(price), 2)─┬─bar(avg(price), 0, 50, 100)─┐
│ 1910 │       2 │                    0 │                             │
│ 1920 │       1 │                  0.3 │ ▌                           │
│ 1940 │      21 │                 0.42 │ ▋                           │
│ 1950 │      14 │                 0.59 │ █▏                          │
│ 1960 │     113 │                 2.17 │ ████▎                       │
│ 1970 │      37 │                 0.68 │ █▎                          │
│ 1980 │      19 │                 2.55 │ █████                       │
│ 1990 │      86 │                  3.6 │ ███████▏                    │
│ 2000 │       2 │                 3.98 │ ███████▊                    │
└──────┴─────────┴──────────────────────┴─────────────────────────────┘
```

Чтобы найти водку, необходимо использовать `ILIKE '%vodka%'`, что весьма показательно.

### Икра {#query-caviar}

Выведем цены на икру, а также название любого блюда с икрой.

Запрос:

```sql
SELECT
    round(toUInt32OrZero(extract(menu_date, '^\\d{4}')), -1) AS d,
    count(),
    round(avg(price), 2),
    bar(avg(price), 0, 50, 100),
    any(dish_name)
FROM menu_item_denorm
WHERE (menu_currency IN ('Dollars', '')) AND (d > 0) AND (d < 2022) AND (dish_name ILIKE '%caviar%')
GROUP BY d
ORDER BY d ASC;
```

Результат:


```text
┌────d─┬─count()─┬─round(avg(price), 2)─┬─bar(avg(price), 0, 50, 100)──────┬─any(dish_name)──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1090 │       1 │                    0 │                                  │ Икра                                                                                                                              │
│ 1880 │       3 │                    0 │                                  │ Икра                                                                                                                              │
│ 1890 │      39 │                 0.59 │ █▏                               │ Масло и икра                                                                                                                   │
│ 1900 │    1014 │                 0.34 │ ▋                                │ Икра анчоуса на тосте                                                                                                             │
│ 1910 │    1588 │                 1.35 │ ██▋                              │ 1/1 Брётхен с икрой                                                                                                                 │
│ 1920 │     927 │                 1.37 │ ██▋                              │ АСТРАХАНСКАЯ ИКРА                                                                                                                     │
│ 1930 │     289 │                 1.91 │ ███▋                             │ Астраханская икра                                                                                                                    │
│ 1940 │     201 │                 0.83 │ █▋                               │ (СПЕЦИАЛЬНОЕ) Сэндвич с отечественной икрой                                                                                                  │
│ 1950 │      81 │                 2.27 │ ████▌                            │ Beluga Икра                                                                                                                       │
│ 1960 │     126 │                 2.21 │ ████▍                            │ Beluga Икра                                                                                                                       │
│ 1970 │     105 │                 0.95 │ █▊                               │ ИКРА БЕЛУГИ МАЛОСОЛ С АМЕРИКАНСКОЙ ЗАПРАВКОЙ                                                                                            │
│ 1980 │      12 │                 7.22 │ ██████████████▍                  │ Подлинная иранская икра белуги, лучшая черная икра в мире, подается во льду с гарниром и образцом охлажденной 100° русской водки │
│ 1990 │      74 │                14.42 │ ████████████████████████████▋    │ Салат с авокадо, свежесрезанное авокадо с икрой                                                                                       │
│ 2000 │       3 │                 7.82 │ ███████████████▋                 │ Взбитый картофельный суп с икрой форели                                                                               │
│ 2010 │       6 │                15.58 │ ███████████████████████████████▏ │ "УСТРИЦЫ И ЖЕМЧУГ" "Сабайон" из жемчужной тапиоки с устрицами Айленд-Крик и русской икрой севрюги                                │
└──────┴─────────┴──────────────────────┴──────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

По крайней мере, у них есть икра к водке. Очень неплохо.


## Онлайн-песочница {#playground}

Данные загружены в ClickHouse Playground, [пример](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B).
