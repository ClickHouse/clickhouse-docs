---
description: 'ホテル、レストラン、カフェのメニューに関する 130 万件の過去データを含み、料理名とその価格が記録されたデータセット。'
sidebar_label: 'New York Public Library「what''s on the menu?」データセット'
slug: /getting-started/example-datasets/menus
title: 'New York Public Library「What''s on the Menu?」データセット'
doc_type: 'guide'
keywords: ['example dataset', 'menus', 'historical data', 'sample data', 'nypl']
---

このデータセットは New York Public Library（ニューヨーク公共図書館）によって作成されたものです。ホテル、レストラン、カフェのメニューに関する過去データが含まれており、料理名とその価格が記録されています。

出典: http://menus.nypl.org/data
このデータはパブリックドメインです。

データは図書館のアーカイブ由来であり、不完全であったり、統計分析には扱いにくい場合があります。それでも、とても「おいしい」データです。
メニューに掲載された料理についてのレコードは 130 万件にすぎず、ClickHouse にとってはごく小さなデータ量ですが、サンプルとしては十分有用です。



## データセットをダウンロードする {#download-dataset}

以下のコマンドを実行します。



```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz
# オプション: チェックサムを検証
md5sum 2021_08_01_07_01_17_data.tgz
# チェックサムは次の値と一致する必要があります: db6126724de939a5481e3160a2d67d15
```

必要に応じて、[http://menus.nypl.org/data](http://menus.nypl.org/data) から取得した最新のリンクに差し替えてください。
ダウンロードサイズは約 35 MB です。


## データセットを展開する

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

非圧縮サイズは約 150 MB です。

データは正規化されており、4 つのテーブルで構成されています:

* `Menu` — メニューに関する情報: レストラン名、メニューが取得された日付など。
* `Dish` — 料理に関する情報: 料理名およびその特徴。
* `MenuPage` — メニュー内のページに関する情報。各ページはいずれかのメニューに属します。
* `MenuItem` — メニュー項目。特定のメニューページ上における料理とその価格: 料理およびメニューページへのリンクを含みます。


## テーブルを作成する

価格を格納するために [Decimal](../../sql-reference/data-types/decimal.md) データ型を使用します。

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


## データをインポートする

ClickHouse にデータを取り込むには、次のコマンドを実行します:

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

データがヘッダー付きの CSV で表現されているため、[CSVWithNames](/interfaces/formats/CSVWithNames) フォーマットを使用します。

データフィールドには二重引用符のみを使用し、値の中には単一引用符が含まれる場合があり、それによって CSV パーサーが混乱しないようにするため、`format_csv_allow_single_quotes` を無効にします。

データに [NULL](/operations/settings/formats#input_format_null_as_default) が含まれていないため、[input&#95;format&#95;null&#95;as&#95;default](/operations/settings/formats#input_format_null_as_default) を無効にします。これを有効のままにしておくと、ClickHouse は `\N` シーケンスをパースしようとし、データ内の `\` と紛らわしくなる可能性があります。

[date&#95;time&#95;input&#95;format best&#95;effort](/operations/settings/formats#date_time_input_format) 設定を使用すると、[DateTime](../../sql-reference/data-types/datetime.md) フィールドを多様な形式でパースできます。たとえば、秒を含まない ISO-8601 形式である &#39;2000-01-01 01:02&#39; も認識されます。この設定を有効にしない場合は、固定の DateTime 形式のみが使用できます。


## データを非正規化する

データは、[正規化形式](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms)で複数のテーブルに分割して格納されています。つまり、例えばメニュー項目から料理名をクエリしたい場合には、[JOIN](/sql-reference/statements/select/join) を実行する必要があります。
一般的な分析タスクでは、毎回 `JOIN` を実行しなくてよいように、あらかじめ JOIN 済みのデータを扱う方がはるかに効率的です。これを「非正規化された」データと呼びます。

すべてのデータを JOIN してまとめた `menu_item_denorm` テーブルを作成します。

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


## データを検証する

クエリ:

```sql
SELECT count() FROM menu_item_denorm;
```

結果：

```text
┌─count()─┐
│ 1329175 │
└─────────┘
```


## クエリを実行する

### 料理の過去価格の平均値

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

結果：

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

あくまで目安としてお考えください。

### バーガーの価格

Query:

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

結果：


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

### Vodka

クエリ：

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

結果：

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

ウォッカを検索するには `ILIKE '%vodka%'` と書く必要があり、これは間違いなくインパクトのある書き方です。

### キャビア

キャビアの価格を出力しましょう。さらに、キャビアを使った料理名も1つ出力しましょう。

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
│ 1090 │       1 │                    0 │                                  │ キャビア                                                                                                                            │
│ 1880 │       3 │                    0 │                                  │ キャビア                                                                                                                            │
│ 1890 │      39 │                 0.59 │ █▏                               │ バターとキャビア                                                                                                                    │
│ 1900 │    1014 │                 0.34 │ ▋                                │ アンチョビキャビアのせトースト                                                                                                      │
│ 1910 │    1588 │                 1.35 │ ██▋                              │ 1/1 Brötchen キャビア                                                                                                               │
│ 1920 │     927 │                 1.37 │ ██▋                              │ ASTRAKAN キャビア                                                                                                                  │
│ 1930 │     289 │                 1.91 │ ███▋                             │ Astrachan キャビア                                                                                                                 │
│ 1940 │     201 │                 0.83 │ █▋                               │ （スペシャル）国産キャビアサンドイッチ                                                                                             │
│ 1950 │      81 │                 2.27 │ ████▌                            │ ベルーガ・キャビア                                                                                                                 │
│ 1960 │     126 │                 2.21 │ ████▍                            │ ベルーガ・キャビア                                                                                                                 │
│ 1970 │     105 │                 0.95 │ █▊                               │ ベルーガ・マロソル・キャビア、アメリカンドレッシング                                                                               │
│ 1980 │      12 │                 7.22 │ ██████████████▍                  │ 本格的なイラン産ベルーガキャビア。世界最高級の黒キャビアをアイスガルニに載せ、よく冷えた100°ロシアンウォッカのテイスティング付きで提供 │
│ 1990 │      74 │                14.42 │ ████████████████████████████▋    │ アボカドサラダ、フレッシュカットアボカドのキャビア添え                                                                            │
│ 2000 │       3 │                 7.82 │ ███████████████▋                 │ Aufgeschlagenes Kartoffelsüppchen mit Forellenkaviar                                                                                │
│ 2010 │       6 │                15.58 │ ███████████████████████████████▏ │ 「OYSTERS AND PEARLS」パールタピオカの「サバイヨン」、Island Creek産オイスターとロシア産セヴルーガキャビア添え                      │
└──────┴─────────┴──────────────────────┴──────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

少なくとも、ウォッカにキャビアが付いてくる。なかなかいいじゃないか。


## オンラインプレイグラウンド {#playground}

データは ClickHouse Playground にアップロードされています（[例](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B)）。
