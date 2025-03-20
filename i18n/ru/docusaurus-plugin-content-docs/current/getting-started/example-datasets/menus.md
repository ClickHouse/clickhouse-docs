---
description: 'Набор данных, содержащий 1,3 миллиона записей исторических данных о меню гостиниц, ресторанов и кафе с блюдами и их ценами.'
slug: /getting-started/example-datasets/menus
sidebar_label: Набор данных Библиотеки Нью-Йорка «Что в меню?»
title: 'Набор данных Библиотеки Нью-Йорка «Что в меню?»'
---

Набор данных создан Библиотекой Нью-Йорка. Он содержит исторические данные о меню гостиниц, ресторанов и кафе с блюдами и их ценами.

Источник: http://menus.nypl.org/data  
Данные находятся в общественном достоянии.

Данные из архивов библиотеки и они могут быть неполными и трудными для статистического анализа. Тем не менее, они также очень вкусные.  
Размер составляет всего 1,3 миллиона записей о блюдах в меню — это очень небольшой объем данных для ClickHouse, но это все же хороший пример.

## Скачать набор данных {#download-dataset}

Запустите команду:

```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz

# Опция: Проверьте контрольную сумму
md5sum 2021_08_01_07_01_17_data.tgz

# Контрольная сумма должна быть равна: db6126724de939a5481e3160a2d67d15
```

При необходимости замените ссылку на актуальную по адресу http://menus.nypl.org/data.  
Размер загрузки составляет около 35 МБ.

## Распаковать набор данных {#unpack-dataset}

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

Несжатый размер составляет около 150 МБ.

Данные нормализованы и состоят из четырех таблиц:
- `Menu` — Информация о меню: название ресторана, дата, когда меню было увидено и т.д.
- `Dish` — Информация о блюдах: название блюда и некоторые характеристики.
- `MenuPage` — Информация о страницах в меню, поскольку каждая страница принадлежит какому-то меню.
- `MenuItem` — Элемент меню. Блюдо с его ценой на какой-то странице меню: ссылки на блюдо и страницу меню.

## Создать таблицы {#create-tables}

Мы используем [Decimal](../../sql-reference/data-types/decimal.md) тип данных для хранения цен.

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

Загрузите данные в ClickHouse, выполните:

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

Мы используем [CSVWithNames](../../interfaces/formats.md#csvwithnames) формат, так как данные представлены в CSV с заголовком.

Мы отключаем `format_csv_allow_single_quotes`, так как используются только двойные кавычки для полей данных, а одинарные кавычки могут быть внутри значений и не должны смущать парсер CSV.

Мы отключаем [input_format_null_as_default](/operations/settings/formats#input_format_null_as_default), так как наши данные не содержат [NULL](/operations/settings/formats#input_format_null_as_default). В противном случае ClickHouse попытается разобрать последовательности `\N` и может запутаться из-за `\` в данных.

Настройка [date_time_input_format best_effort](/operations/settings/formats#date_time_input_format) позволяет разбирать [DateTime](../../sql-reference/data-types/datetime.md) поля во множестве форматов. Например, ISO-8601 без секунд, таких как '2000-01-01 01:02', будет распознана. Без этой настройки разрешен только фиксированный формат DateTime.

## Денормализовать данные {#denormalize-data}

Данные представлены в нескольких таблицах в [нормализованной форме](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms). Это означает, что вам придется выполнять [JOIN](/sql-reference/statements/select/join), если вы хотите запрашивать, например, названия блюд из элементов меню.  
Для типичных аналитических задач гораздо эффективнее работать с предварительно "JOIN"-ненными данными, чтобы избежать выполнения `JOIN` каждый раз. Это называется "денормализованные" данные.

Мы создадим таблицу `menu_item_denorm`, которая будет содержать все данные, объединенные вместе:

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

## Проверить данные {#validate-data}

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

## Выполнить некоторые запросы {#run-queries}

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

Отнеситесь к этому с осторожностью.

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

Чтобы получить водку, нам нужно написать `ILIKE '%vodka%'`, и это определенно делает заявление.

### Икра {#query-caviar}

Давайте выведем цены на икру. Также давайте выведем название любого блюда с икрой.

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
│ 1090 │       1 │                    0 │                                  │ Caviar                                                                                                                              │
│ 1880 │       3 │                    0 │                                  │ Caviar                                                                                                                              │
│ 1890 │      39 │                 0.59 │ █▏                               │ Butter and caviar                                                                                                                   │
│ 1900 │    1014 │                 0.34 │ ▋                                │ Anchovy Caviar on Toast                                                                                                             │
│ 1910 │    1588 │                 1.35 │ ██▋                              │ 1/1 Brötchen Caviar                                                                                                                 │
│ 1920 │     927 │                 1.37 │ ██▋                              │ ASTRAKAN CAVIAR                                                                                                                     │
│ 1930 │     289 │                 1.91 │ ███▋                             │ Astrachan caviar                                                                                                                    │
│ 1940 │     201 │                 0.83 │ █▋                               │ (SPECIAL) Domestic Caviar Sandwich                                                                                                  │
│ 1950 │      81 │                 2.27 │ ████▌                            │ Beluga Caviar                                                                                                                       │
│ 1960 │     126 │                 2.21 │ ████▍                            │ Beluga Caviar                                                                                                                       │
│ 1970 │     105 │                 0.95 │ █▊                               │ BELUGA MALOSSOL CAVIAR AMERICAN DRESSING                                                                                            │
│ 1980 │      12 │                 7.22 │ ██████████████▍                  │ Authentic Iranian Beluga Caviar the world's finest black caviar presented in ice garni and a sampling of chilled 100° Russian vodka │
│ 1990 │      74 │                14.42 │ ████████████████████████████▋    │ Avocado Salad, Fresh cut avocado with caviare                                                                                       │
│ 2000 │       3 │                 7.82 │ ███████████████▋                 │ Aufgeschlagenes Kartoffelsueppchen mit Forellencaviar                                                                               │
│ 2010 │       6 │                15.58 │ ███████████████████████████████▏ │ "OYSTERS AND PEARLS" "Sabayon" of Pearl Tapioca with Island Creek Oysters and Russian Sevruga Caviar                                │
└──────┴─────────┴──────────────────────┴──────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

По крайней мере, у них есть икра с водкой. Очень приятно.

## Онлайн-площадка {#playground}

Данные загружены в ClickHouse Playground, [пример](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B).
