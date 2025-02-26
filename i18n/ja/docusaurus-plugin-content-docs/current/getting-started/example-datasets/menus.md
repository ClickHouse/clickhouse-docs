---
description: "ホテル、レストラン、カフェのメニューに関する歴史的データを含む130万件のレコードからなるデータセット。"
slug: /getting-started/example-datasets/menus
sidebar_label: ニューヨーク公共図書館「メニューには何がある？」データセット
title: "ニューヨーク公共図書館「メニューには何がある？」データセット"
---

このデータセットはニューヨーク公共図書館によって作成されました。ホテル、レストラン、カフェのメニューに関する歴史的データを含み、料理とその価格に関する情報が提供されています。

出典: [http://menus.nypl.org/data](http://menus.nypl.org/data)  
データはパブリックドメインにあります。

このデータは図書館のアーカイブから取得されたもので、完全ではない可能性があり、統計分析には難しい場合があります。それにもかかわらず、非常に美味しいデータです。  
サイズはメニューに関する料理についての130万件のレコードで、ClickHouseにとっては非常に小さなデータボリュームですが、それでも良い例です。

## データセットをダウンロード {#download-dataset}

次のコマンドを実行します。

```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz
# オプション: チェックサムを確認する
md5sum 2021_08_01_07_01_17_data.tgz
# チェックサムは次と等しいはずです: db6126724de939a5481e3160a2d67d15
```

必要に応じて、[http://menus.nypl.org/data](http://menus.nypl.org/data) から最新のリンクに置き換えてください。  
ダウンロードサイズは約35 MBです。

## データセットを解凍 {#unpack-dataset}

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

解凍後のサイズは約150 MBです。

データは4つのテーブルから構成され、正規化されています：
- `Menu` — メニューに関する情報：レストランの名前、メニューが確認された日付など。
- `Dish` — 料理に関する情報：料理の名前といくつかの特徴。
- `MenuPage` — メニューのページに関する情報。各ページはあるメニューに属しています。
- `MenuItem` — メニューのアイテム。あるメニューのページ上の料理とその価格：料理とメニューページへのリンク。

## テーブルを作成 {#create-tables}

価格を保存するために[Decimal](../../sql-reference/data-types/decimal.md) データ型を使用します。

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

## データをインポート {#import-data}

データをClickHouseにアップロードするには、次のコマンドを実行します。

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

データはヘッダー付きのCSVで表現されているため、[CSVWithNames](../../interfaces/formats.md#csvwithnames)フォーマットを使用します。

`format_csv_allow_single_quotes`を無効にするのは、データフィールドにはダブルクォートのみが使用され、シングルクォートが値の中に存在する可能性があるため、CSVパーサーを混乱させないようにするためです。

また、私たちのデータには[NULL](../../sql-reference/syntax.md#null-literal)が含まれていないため、[input_format_null_as_default](../../operations/settings/settings-formats.md#settings-input-format-null-as-default)を無効にします。そうでないと、ClickHouseが`\N`シーケンスを解析し、データ内の`\`に混乱する可能性があります。

[date_time_input_format best_effort](../../operations/settings/settings-formats.md#settings-date_time_input_format)の設定を使うことで、さまざまな形式で[DateTime](../../sql-reference/data-types/datetime.md)フィールドを解析できます。たとえば、'2000-01-01 01:02'のような秒数のないISO-8601形式が認識されます。この設定がなければ、固定のDateTimeフォーマットのみが許可されます。

## データを非正規化 {#denormalize-data}

データは[正規化形式](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms)で複数のテーブルで表現されています。これにより、例えばメニューアイテムから料理名をクエリするには[JOIN](../../sql-reference/statements/select/join.md#select-join)を実行する必要があります。  
典型的な分析タスクの場合、毎回`JOIN`を実行しないように、事前に`JOIN`されたデータを扱う方が効率的です。これを「非正規化データ」と呼びます。

`menu_item_denorm`というテーブルを作成し、すべてのデータを結合します。

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

## データを検証 {#validate-data}

クエリ:

```sql
SELECT count() FROM menu_item_denorm;
```

結果:

```text
┌─count()─┐
│ 1329175 │
└─────────┘
```

## クエリを実行 {#run-queries}

### 料理の歴史的価格の平均 {#query-averaged-historical-prices}

クエリ:

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

結果:

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

信じてください。

### ハンバーガーの価格 {#query-burger-prices}

クエリ:

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

結果:

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

### ウォッカ {#query-vodka}

クエリ:

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

結果:

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

ウォッカを得るには `ILIKE '%vodka%'`と書かなければならず、これは間違いなく重要な意味を持ちます。

### キャビア {#query-caviar}

キャビアの価格を表示しましょう。また、キャビアを使った料理の名前も表示します。

クエリ:

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

結果:

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

少なくとも、彼らはウォッカのあるキャビアを持っています。素晴らしいですね。

## オンラインプレイグラウンド {#playground}

データはClickHouse Playgroundにアップロードされています。[例はこちら](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B)。
