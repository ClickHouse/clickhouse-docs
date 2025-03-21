---
description: '包含130万条历史数据的数据集，涉及酒店、餐厅和咖啡馆的菜单及其价格。'
slug: /getting-started/example-datasets/menus
sidebar_label: 纽约公共图书馆 "菜单上的内容？" 数据集
title: '纽约公共图书馆 "菜单上的内容？" 数据集'
---

该数据集由纽约公共图书馆创建。它包含酒店、餐厅和咖啡馆的菜单历史数据，附有菜肴及其价格。

来源: http://menus.nypl.org/data  
数据属于公有领域。

数据来自图书馆的档案，可能不完整并且难以进行统计分析。尽管如此，它还是非常美味的。  
数据量仅为130万条关于菜单中菜肴的数据——对于ClickHouse而言，这是一个非常小的数据量，但仍然是一个很好的示例。

## 下载数据集 {#download-dataset}

运行以下命令：

```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz

# 选项：验证校验和
md5sum 2021_08_01_07_01_17_data.tgz

# 校验和应等于： db6126724de939a5481e3160a2d67d15
```

如有需要，请将链接替换为 http://menus.nypl.org/data 上的最新链接。  
下载大小约为35 MB。

## 解压数据集 {#unpack-dataset}

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

解压后大小约为150 MB。

数据由四个表构成，规范化如下：
- `Menu` — 关于菜单的信息：餐厅名称、菜单查看日期等。
- `Dish` — 关于菜肴的信息：菜肴名称及一些特性。
- `MenuPage` — 关于菜单页的信息，因为每一页都属于某个菜单。
- `MenuItem` — 菜单项。某个菜单页面上菜肴的价格：指向菜肴和菜单页面的链接。

## 创建表 {#create-tables}

我们使用 [Decimal](../../sql-reference/data-types/decimal.md) 数据类型来存储价格。

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

## 导入数据 {#import-data}

上传数据到ClickHouse，运行：

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

我们使用 [CSVWithNames](../../interfaces/formats.md#csvwithnames) 格式，因为数据以带有标题的CSV形式表示。

我们禁用 `format_csv_allow_single_quotes`，因为数据字段中仅使用双引号，并且单引号可以出现在值中，不应干扰CSV解析器。

我们禁用 [input_format_null_as_default](/operations/settings/formats#input_format_null_as_default)，因为我们的数据中没有 [NULL](/operations/settings/formats#input_format_null_as_default)。否则，ClickHouse会尝试解析 `\N` 序列，并可能会与数据中的 `\` 混淆。

设置 [date_time_input_format best_effort](/operations/settings/formats#date_time_input_format) 允许解析 [DateTime](../../sql-reference/data-types/datetime.md) 字段的各种格式。例如，ISO-8601格式的时间字符串（如'2000-01-01 01:02'）将被识别。没有该设置时，仅允许固定的DateTime格式。

## 反规范化数据 {#denormalize-data}

数据以多张表的形式呈现，是 [规范化形式](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms)。这意味着如果你想查询，例如菜单项中的菜肴名称，就必须执行 [JOIN](/sql-reference/statements/select/join)。  
对于典型的分析任务，处理预先JOIN的数据效率更高，以避免每次都要执行 `JOIN`。这被称为“反规范化”数据。

我们将创建一个表 `menu_item_denorm`，其中包含所有连接在一起的数据：

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

## 验证数据 {#validate-data}

查询：

```sql
SELECT count() FROM menu_item_denorm;
```

结果：

```text
┌─count()─┐
│ 1329175 │
└─────────┘
```

## 执行一些查询 {#run-queries}

### 菜肴的平均历史价格 {#query-averaged-historical-prices}

查询：

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

结果：

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

对此要保持审慎。

### 汉堡价格 {#query-burger-prices}

查询：

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

结果：

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

### 伏特加 {#query-vodka}

查询：

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

结果：

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

要获取伏特加，我们必须写 `ILIKE '%vodka%'` ，这确实很关键。

### 鱼子酱 {#query-caviar}

让我们打印鱼子酱的价格，同时也打印名称任意带有鱼子酱的菜肴。

查询：

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

结果：

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

至少他们有鱼子酱和伏特加。非常好。

## 在线游乐场 {#playground}

数据已经上传到ClickHouse游乐场，[示例](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B)。
