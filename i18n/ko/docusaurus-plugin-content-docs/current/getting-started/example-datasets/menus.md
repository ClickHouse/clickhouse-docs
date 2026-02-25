---
description: '호텔, 레스토랑 및 카페의 메뉴와 그 안에 포함된 요리와 가격에 대한 역사적 데이터 130만 개 레코드가 포함된 데이터세트입니다.'
sidebar_label: 'New York Public Library "what''s on the menu?" 데이터세트'
slug: /getting-started/example-datasets/menus
title: 'New York Public Library "What''s on the Menu?" 데이터세트'
doc_type: 'guide'
keywords: ['example dataset', 'menus', 'historical data', 'sample data', 'nypl']
---

이 데이터세트는 New York Public Library에서 제작했습니다. 호텔, 레스토랑 및 카페의 메뉴와 각 요리 및 그 가격에 대한 역사적 데이터를 포함합니다.

출처: http://menus.nypl.org/data  
데이터는 퍼블릭 도메인입니다.

이 데이터는 도서관 아카이브에서 가져온 것이므로 불완전할 수 있고 통계 분석에는 다소 어려울 수 있습니다. 그럼에도 불구하고 매우 흥미로운 데이터입니다.  
데이터 크기는 메뉴에 포함된 요리에 대한 약 130만 개의 레코드에 불과합니다. ClickHouse 기준으로는 매우 작은 데이터 양이지만, 여전히 좋은 예시입니다.

## 데이터셋 다운로드 \{#download-dataset\}

다음 명령을 실행하십시오:

```bash
wget https://s3.amazonaws.com/menusdata.nypl.org/gzips/2021_08_01_07_01_17_data.tgz
# Option: Validate the checksum
md5sum 2021_08_01_07_01_17_data.tgz
# Checksum should be equal to: db6126724de939a5481e3160a2d67d15
```

필요한 경우 http://menus.nypl.org/data에서 제공되는 최신 링크로 교체하십시오.
다운로드 크기는 약 35MB입니다.


## 데이터 세트 압축 해제 \{#unpack-dataset\}

```bash
tar xvf 2021_08_01_07_01_17_data.tgz
```

압축을 해제한 크기는 약 150MB입니다.

데이터는 정규화되어 있으며 네 개의 테이블로 구성됩니다:

* `Menu` — 메뉴에 대한 정보: 레스토랑 이름, 메뉴가 확인된 날짜 등.
* `Dish` — 요리에 대한 정보: 요리 이름과 몇 가지 특징.
* `MenuPage` — 메뉴 안의 페이지에 대한 정보. 각 페이지는 하나의 메뉴에 속합니다.
* `MenuItem` — 메뉴 항목. 특정 메뉴 페이지에 있는 요리와 그 가격에 대한 정보로, 요리와 메뉴 페이지에 대한 링크를 포함합니다.


## 테이블 생성 \{#create-tables\}

가격을 저장하기 위해 [Decimal](../../sql-reference/data-types/decimal.md) 데이터 형식을 사용합니다.

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


## 데이터 가져오기 \{#import-data\}

데이터를 ClickHouse로 업로드하려면 다음 명령을 실행하십시오:

```bash
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO dish FORMAT CSVWithNames" < Dish.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu FORMAT CSVWithNames" < Menu.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --query "INSERT INTO menu_page FORMAT CSVWithNames" < MenuPage.csv
clickhouse-client --format_csv_allow_single_quotes 0 --input_format_null_as_default 0 --date_time_input_format best_effort --query "INSERT INTO menu_item FORMAT CSVWithNames" < MenuItem.csv
```

데이터가 헤더가 있는 CSV로 표현되므로 [CSVWithNames](/interfaces/formats/CSVWithNames) 포맷을 사용합니다.

데이터 필드에는 큰따옴표만 사용하고 값 내부에 작은따옴표가 포함될 수 있으므로, CSV 파서가 혼동하지 않도록 `format_csv_allow_single_quotes` 설정은 비활성화합니다.

데이터에 [NULL](/operations/settings/formats#input_format_null_as_default)이 없으므로 [input&#95;format&#95;null&#95;as&#95;default](/operations/settings/formats#input_format_null_as_default) 설정은 비활성화합니다. 이 설정을 활성화하면 ClickHouse가 `\N` 시퀀스를 값으로 해석하려고 시도하며, 데이터 내의 `\` 문자와 혼동될 수 있습니다.

[date&#95;time&#95;input&#95;format best&#95;effort](/operations/settings/formats#date_time_input_format) 설정을 사용하면 매우 다양한 형식의 [DateTime](../../sql-reference/data-types/datetime.md) 필드를 해석할 수 있습니다. 예를 들어, 초가 없는 ISO-8601 형식인 &#39;2000-01-01 01:02&#39;도 인식됩니다. 이 설정을 사용하지 않으면 고정된 DateTime 형식만 허용됩니다.


## 데이터 비정규화 \{#denormalize-data\}

데이터는 [정규형](https://en.wikipedia.org/wiki/Database_normalization#Normal_forms)에 따라 여러 테이블에 나누어 저장되어 있습니다. 이는 예를 들어 메뉴 항목 테이블에서 요리 이름을 쿼리하려면 [JOIN](/sql-reference/statements/select/join)을 수행해야 함을 의미합니다.
일반적인 분석 작업에서는 매번 `JOIN`을 수행하지 않도록 사전에 JOIN해 둔 데이터로 처리하는 것이 훨씬 더 효율적입니다. 이를 「비정규화된」 데이터라고 합니다.

모든 관련 데이터를 JOIN하여 하나로 합친 `menu_item_denorm` 테이블을 생성합니다:

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


## 데이터 검증 \{#validate-data\}

쿼리:

```sql
SELECT count() FROM menu_item_denorm;
```

결과:

```text
┌─count()─┐
│ 1329175 │
└─────────┘
```


## 몇 개의 쿼리를 실행해 봅니다 \{#run-queries\}

### 요리의 과거 평균 가격 \{#query-averaged-historical-prices\}

쿼리:

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

결과:

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

지나치게 곧이곧대로 받아들이지 마십시오.


### 버거 가격 \{#query-burger-prices\}

쿼리:

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

결과:

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


### 보드카 \{#query-vodka\}

쿼리:

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

결과:

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

보드카를 찾으려면 `ILIKE '%vodka%'`라고 작성해야 하며, 이 자체로도 꽤나 의미심장합니다.


### 캐비어 \{#query-caviar\}

캐비어 가격을 출력합니다. 또한 캐비어가 들어간 임의의 요리 이름도 출력합니다.

쿼리:

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

실행 결과:

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

그래도 캐비어에 보드카는 곁들여 나오네요. 꽤 좋습니다.


## 온라인 플레이그라운드 \{#playground\}

데이터는 ClickHouse Playground에 업로드됩니다. [예시](https://sql.clickhouse.com?query_id=KB5KQJJFNBKHE5GBUJCP1B).