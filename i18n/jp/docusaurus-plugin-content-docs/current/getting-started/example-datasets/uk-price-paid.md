---
description: "イギリスとウェールズの不動産物件に支払われた価格に関するデータを含むUKプロパティデータセットを使用して、頻繁に実行するクエリのパフォーマンスを向上させるためにプロジェクションを使用する方法を学びましょう"
slug: /getting-started/example-datasets/uk-price-paid
sidebar_label: UKプロパティ価格
sidebar_position: 1
title: "UKプロパティ価格データセット"
---

プロジェクションは、頻繁に実行するクエリのパフォーマンスを向上させる素晴らしい方法です。英国とウェールズの不動産物件に支払われた価格に関するデータを含むUKプロパティデータセットを使用して、プロジェクションの力を示します。このデータは1995年から利用可能で、圧縮されていない形式のデータセットのサイズは約4 GiB（ClickHouseでは約278 MiBしかかかりません）。

- ソース: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- フィールドの説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM土地登記局データを含む © Crown copyright and database right 2021。このデータはOpen Government Licence v3.0の下でライセンスされています。

## テーブルの作成 {#create-table}

```sql
CREATE TABLE uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

## データの前処理と挿入 {#preprocess-import-data}

`url` 関数を使用して、データをClickHouseにストリーミングします。その前に、いくつかの入力データの前処理を行う必要があります。これには以下が含まれます：
- `postcode`を2つの異なるカラム - `postcode1`と`postcode2`に分割します。これはストレージとクエリの観点からより良いです。
- `time`フィールドを日時に変換します。なぜなら、そこには00:00の時間しか含まれていないからです。
- 分析に不要な[UUID](../../sql-reference/data-types/uuid.md)フィールドを無視します。
- [transform](../../sql-reference/functions/other-functions.md#transform)関数を使用して、`type`と`duration`をより読みやすい`Enum`フィールドに変換します。
- `is_new`フィールドを単一文字列（`Y`/`N`）から[UInt8](/sql-reference/data-types/int-uint)フィールドに変換します（0または1）。
- 最後の2つのカラムは、すべて同じ値（0）を持つため、削除します。

`url`関数は、ウェブサーバーからClickHouseテーブルにデータをストリーミングします。次のコマンドは、`uk_price_paid`テーブルに500万行を挿入します：

```sql
INSERT INTO uk_price_paid
WITH
   splitByChar(' ', postcode) AS p
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    p[1] AS postcode1,
    p[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

データが挿入されるまで待ちます - ネットワーク速度に応じて1分か2分かかります。

## データの検証 {#validate-data}

挿入された行数を確認することで、正常に動作したかどうかを確認しましょう：

```sql
SELECT count()
FROM uk_price_paid
```

このクエリが実行された時点で、データセットには27,450,499行がありました。ClickHouseにおけるテーブルのストレージサイズを確認しましょう：

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルのサイズはわずか221.43 MiBです！

## いくつかのクエリを実行する {#run-queries}

データを分析するためにいくつかのクエリを実行してみましょう：

### クエリ1. 年ごとの平均価格 {#average-price}

```sql
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80)
FROM uk_price_paid
GROUP BY year
ORDER BY year
```

結果は次のようになります：

```response
┌─year─┬──price─┬─bar(round(avg(price)), 0, 1000000, 80)─┐
│ 1995 │  67934 │ █████▍                                 │
│ 1996 │  71508 │ █████▋                                 │
│ 1997 │  78536 │ ██████▎                                │
│ 1998 │  85441 │ ██████▋                                │
│ 1999 │  96038 │ ███████▋                               │
│ 2000 │ 107487 │ ████████▌                              │
│ 2001 │ 118888 │ █████████▌                             │
│ 2002 │ 137948 │ ███████████                            │
│ 2003 │ 155893 │ ████████████▍                          │
│ 2004 │ 178888 │ ██████████████▎                        │
│ 2005 │ 189359 │ ███████████████▏                       │
│ 2006 │ 203532 │ ████████████████▎                      │
│ 2007 │ 219375 │ █████████████████▌                     │
│ 2008 │ 217056 │ █████████████████▎                     │
│ 2009 │ 213419 │ █████████████████                      │
│ 2010 │ 236110 │ ██████████████████▊                    │
│ 2011 │ 232805 │ ██████████████████▌                    │
│ 2012 │ 238381 │ ███████████████████                    │
│ 2013 │ 256927 │ ████████████████████▌                  │
│ 2014 │ 280008 │ ██████████████████████▍                │
│ 2015 │ 297263 │ ███████████████████████▋               │
│ 2016 │ 313518 │ █████████████████████████              │
│ 2017 │ 346371 │ ███████████████████████████▋           │
│ 2018 │ 350556 │ ████████████████████████████           │
│ 2019 │ 352184 │ ████████████████████████████▏          │
│ 2020 │ 375808 │ ██████████████████████████████         │
│ 2021 │ 381105 │ ██████████████████████████████▍        │
│ 2022 │ 362572 │ █████████████████████████████          │
└──────┴────────┴────────────────────────────────────────┘
```

### クエリ2. ロンドンの年ごとの平均価格 {#average-price-london}

```sql
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100)
FROM uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

結果は次のようになります：

```response
┌─year─┬───price─┬─bar(round(avg(price)), 0, 2000000, 100)───────────────┐
│ 1995 │  109110 │ █████▍                                                │
│ 1996 │  118659 │ █████▊                                                │
│ 1997 │  136526 │ ██████▋                                               │
│ 1998 │  153002 │ ███████▋                                              │
│ 1999 │  180633 │ █████████                                             │
│ 2000 │  215849 │ ██████████▋                                           │
│ 2001 │  232987 │ ███████████▋                                          │
│ 2002 │  263668 │ █████████████▏                                        │
│ 2003 │  278424 │ █████████████▊                                        │
│ 2004 │  304664 │ ███████████████▏                                      │
│ 2005 │  322887 │ ████████████████▏                                     │
│ 2006 │  356195 │ █████████████████▋                                    │
│ 2007 │  404062 │ ████████████████████▏                                 │
│ 2008 │  420741 │ █████████████████████                                 │
│ 2009 │  427754 │ █████████████████████▍                                │
│ 2010 │  480322 │ ████████████████████████                              │
│ 2011 │  496278 │ ████████████████████████▋                             │
│ 2012 │  519482 │ █████████████████████████▊                            │
│ 2013 │  616195 │ ██████████████████████████████▋                       │
│ 2014 │  724121 │ ████████████████████████████████████▏                 │
│ 2015 │  792101 │ ███████████████████████████████████████▌              │
│ 2016 │  843589 │ ██████████████████████████████████████████▏           │
│ 2017 │  983523 │ █████████████████████████████████████████████████▏    │
│ 2018 │ 1016753 │ ██████████████████████████████████████████████████▋   │
│ 2019 │ 1041673 │ ████████████████████████████████████████████████████  │
│ 2020 │ 1060027 │ █████████████████████████████████████████████████████ │
│ 2021 │  958249 │ ███████████████████████████████████████████████▊      │
│ 2022 │  902596 │ █████████████████████████████████████████████▏        │
└──────┴─────────┴───────────────────────────────────────────────────────┘
```

2020年に家の価格に何かが起こりました！しかし、それはおそらく驚くことではないでしょう...

### クエリ3. 最も高価な地域 {#most-expensive-neighborhoods}

```sql
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

結果は次のようになります：

```response
┌─town─────────────────┬─district───────────────┬─────c─┬───price─┬─bar(round(avg(price)), 0, 5000000, 100)─────────────────────────┐
│ LONDON               │ CITY OF LONDON         │   578 │ 3149590 │ ██████████████████████████████████████████████████████████████▊ │
│ LONDON               │ CITY OF WESTMINSTER    │  7083 │ 2903794 │ ██████████████████████████████████████████████████████████      │
│ LONDON               │ KENSINGTON AND CHELSEA │  4986 │ 2333782 │ ██████████████████████████████████████████████▋                 │
│ LEATHERHEAD          │ ELMBRIDGE              │   203 │ 2071595 │ █████████████████████████████████████████▍                      │
│ VIRGINIA WATER       │ RUNNYMEDE              │   308 │ 1939465 │ ██████████████████████████████████████▋                         │
│ LONDON               │ CAMDEN                 │  5750 │ 1673687 │ █████████████████████████████████▍                              │
│ WINDLESHAM           │ SURREY HEATH           │   182 │ 1428358 │ ████████████████████████████▌                                   │
│ NORTHWOOD            │ THREE RIVERS           │   112 │ 1404170 │ ████████████████████████████                                    │
│ BARNET               │ ENFIELD                │   259 │ 1338299 │ ██████████████████████████▋                                     │
│ LONDON               │ ISLINGTON              │  5504 │ 1275520 │ █████████████████████████▌                                      │
│ LONDON               │ RICHMOND UPON THAMES   │  1345 │ 1261935 │ █████████████████████████▏                                      │
│ COBHAM               │ ELMBRIDGE              │   727 │ 1251403 │ █████████████████████████                                       │
│ BEACONSFIELD         │ BUCKINGHAMSHIRE        │   680 │ 1199970 │ ███████████████████████▊                                        │
│ LONDON               │ TOWER HAMLETS          │ 10012 │ 1157827 │ ███████████████████████▏                                        │
│ LONDON               │ HOUNSLOW               │  1278 │ 1144389 │ ██████████████████████▊                                         │
│ BURFORD              │ WEST OXFORDSHIRE       │   182 │ 1139393 │ ██████████████████████▋                                         │
│ RICHMOND             │ RICHMOND UPON THAMES   │  1649 │ 1130076 │ ██████████████████████▌                                         │
│ KINGSTON UPON THAMES │ RICHMOND UPON THAMES   │   147 │ 1126111 │ ██████████████████████▌                                         │
│ ASCOT                │ WINDSOR AND MAIDENHEAD │   773 │ 1106109 │ ██████████████████████                                          │
│ LONDON               │ HAMMERSMITH AND FULHAM │  6162 │ 1056198 │ █████████████████████                                           │
│ RADLETT              │ HERTSMERE              │   513 │ 1045758 │ ████████████████████▊                                           │
│ LEATHERHEAD          │ GUILDFORD              │   354 │ 1045175 │ ████████████████████▊                                           │
│ WEYBRIDGE            │ ELMBRIDGE              │  1275 │ 1036702 │ ████████████████████▋                                           │
│ FARNHAM              │ EAST HAMPSHIRE         │   107 │ 1033682 │ ████████████████████▋                                           │
│ ESHER                │ ELMBRIDGE              │   915 │ 1032753 │ ████████████████████▋                                           │
│ FARNHAM              │ HART                   │   102 │ 1002692 │ ████████████████████                                            │
│ GERRARDS CROSS       │ BUCKINGHAMSHIRE        │   845 │  983639 │ ███████████████████▋                                            │
│ CHALFONT ST GILES    │ BUCKINGHAMSHIRE        │   286 │  973993 │ ███████████████████▍                                            │
│ SALCOMBE             │ SOUTH HAMS             │   215 │  965724 │ ███████████████████▎                                            │
│ SURBITON             │ ELMBRIDGE              │   181 │  960346 │ ███████████████████▏                                            │
│ BROCKENHURST         │ NEW FOREST             │   226 │  951278 │ ███████████████████                                             │
│ SUTTON COLDFIELD     │ LICHFIELD              │   110 │  930757 │ ██████████████████▌                                             │
│ EAST MOLESEY         │ ELMBRIDGE              │   372 │  927026 │ ██████████████████▌                                             │
│ LLANGOLLEN           │ WREXHAM                │   127 │  925681 │ ██████████████████▌                                             │
│ OXFORD               │ SOUTH OXFORDSHIRE      │   638 │  923830 │ ██████████████████▍                                             │
│ LONDON               │ MERTON                 │  4383 │  923194 │ ██████████████████▍                                             │
│ GUILDFORD            │ WAVERLEY               │   261 │  905733 │ ██████████████████                                              │
│ TEDDINGTON           │ RICHMOND UPON THAMES   │  1147 │  894856 │ █████████████████▊                                              │
│ HARPENDEN            │ ST ALBANS              │  1271 │  893079 │ █████████████████▋                                              │
│ HENLEY-ON-THAMES     │ SOUTH OXFORDSHIRE      │  1042 │  887557 │ █████████████████▋                                              │
│ POTTERS BAR          │ WELWYN HATFIELD        │   314 │  863037 │ █████████████████▎                                              │
│ LONDON               │ WANDSWORTH             │ 13210 │  857318 │ █████████████████▏                                              │
│ BILLINGSHURST        │ CHICHESTER             │   255 │  856508 │ █████████████████▏                                              │
│ LONDON               │ SOUTHWARK              │  7742 │  843145 │ ████████████████▋                                               │
│ LONDON               │ HACKNEY                │  6656 │  839716 │ ████████████████▋                                               │
│ LUTTERWORTH          │ HARBOROUGH             │  1096 │  836546 │ ████████████████▋                                               │
│ KINGSTON UPON THAMES │ KINGSTON UPON THAMES   │  1846 │  828990 │ ████████████████▌                                               │
│ LONDON               │ EALING                 │  5583 │  820135 │ ████████████████▍                                               │
│ INGATESTONE          │ CHELMSFORD             │   120 │  815379 │ ████████████████▎                                               │
│ MARLOW               │ BUCKINGHAMSHIRE        │   718 │  809943 │ ████████████████▏                                               │
│ EAST GRINSTEAD       │ TANDRIDGE              │   105 │  809461 │ ████████████████▏                                               │
│ CHIGWELL             │ EPPING FOREST          │   484 │  809338 │ ████████████████▏                                               │
│ EGHAM                │ RUNNYMEDE              │   989 │  807858 │ ████████████████▏                                               │
│ HASLEMERE            │ CHICHESTER             │   223 │  804173 │ ████████████████                                                │
│ PETWORTH             │ CHICHESTER             │   288 │  803206 │ ████████████████                                                │
│ TWICKENHAM           │ RICHMOND UPON THAMES   │  2194 │  802616 │ ████████████████                                                │
│ WEMBLEY              │ BRENT                  │  1698 │  801733 │ ████████████████                                                │
│ HINDHEAD             │ WAVERLEY               │   233 │  801482 │ ████████████████                                                │
│ LONDON               │ BARNET                 │  8083 │  792066 │ ███████████████▋                                                │
│ WOKING               │ GUILDFORD              │   343 │  789360 │ ███████████████▋                                                │
│ STOCKBRIDGE          │ TEST VALLEY            │   318 │  777909 │ ███████████████▌                                                │
│ BERKHAMSTED          │ DACORUM                │  1049 │  776138 │ ███████████████▌                                                │
│ MAIDENHEAD           │ BUCKINGHAMSHIRE        │   236 │  775572 │ ███████████████▌                                                │
│ SOLIHULL             │ STRATFORD-ON-AVON      │   142 │  770727 │ ███████████████▍                                                │
│ GREAT MISSENDEN      │ BUCKINGHAMSHIRE        │   431 │  764493 │ ███████████████▎                                                │
│ TADWORTH             │ REIGATE AND BANSTEAD   │   920 │  757511 │ ███████████████▏                                                │
│ LONDON               │ BRENT                  │  4124 │  757194 │ ███████████████▏                                                │
│ THAMES DITTON        │ ELMBRIDGE              │   470 │  750828 │ ███████████████                                                 │
│ LONDON               │ LAMBETH                │ 10431 │  750532 │ ███████████████                                                 │
│ RICKMANSWORTH        │ THREE RIVERS           │  1500 │  747029 │ ██████████████▊                                                 │
│ KINGS LANGLEY        │ DACORUM                │   281 │  746536 │ ██████████████▊                                                 │
│ HARLOW               │ EPPING FOREST          │   172 │  739423 │ ██████████████▋                                                 │
│ TONBRIDGE            │ SEVENOAKS              │   103 │  738740 │ ██████████████▋                                                 │
│ BELVEDERE            │ BEXLEY                 │   686 │  736385 │ ██████████████▋                                                 │
│ CRANBROOK            │ TUNBRIDGE WELLS        │   769 │  734328 │ ██████████████▋                                                 │
│ SOLIHULL             │ WARWICK                │   116 │  733286 │ ██████████████▋                                                 │
│ ALDERLEY EDGE        │ CHESHIRE EAST          │   357 │  732882 │ ██████████████▋                                                 │
│ WELWYN               │ WELWYN HATFIELD        │   404 │  730281 │ ██████████████▌                                                 │
│ CHISLEHURST          │ BROMLEY                │   870 │  730279 │ ██████████████▌                                                 │
│ LONDON               │ HARINGEY               │  6488 │  726715 │ ██████████████▌                                                 │
│ AMERSHAM             │ BUCKINGHAMSHIRE        │   965 │  725426 │ ██████████████▌                                                 │
│ SEVENOAKS            │ SEVENOAKS              │  2183 │  725102 │ ██████████████▌                                                 │
│ BOURNE END           │ BUCKINGHAMSHIRE        │   269 │  724595 │ ██████████████▍                                                 │
│ NORTHWOOD            │ HILLINGDON             │   568 │  722436 │ ██████████████▍                                                 │
│ PURFLEET             │ THURROCK               │   143 │  722205 │ ██████████████▍                                                 │
│ SLOUGH               │ BUCKINGHAMSHIRE        │   832 │  721529 │ ██████████████▍                                                 │
│ INGATESTONE          │ BRENTWOOD              │   301 │  718292 │ ██████████████▎                                                 │
│ EPSOM                │ REIGATE AND BANSTEAD   │   315 │  709264 │ ██████████████▏                                                 │
│ ASHTEAD              │ MOLE VALLEY            │   524 │  708646 │ ██████████████▏                                                 │
│ BETCHWORTH           │ MOLE VALLEY            │   155 │  708525 │ ██████████████▏                                                 │
│ OXTED                │ TANDRIDGE              │   645 │  706946 │ ██████████████▏                                                 │
│ READING              │ SOUTH OXFORDSHIRE      │   593 │  705466 │ ██████████████                                                  │
│ FELTHAM              │ HOUNSLOW               │  1536 │  703815 │ ██████████████                                                  │
│ TUNBRIDGE WELLS      │ WEALDEN                │   207 │  703296 │ ██████████████                                                  │
│ LEWES                │ WEALDEN                │   116 │  701349 │ ██████████████                                                  │
│ OXFORD               │ OXFORD                 │  3656 │  700813 │ ██████████████                                                  │
│ MAYFIELD             │ WEALDEN                │   177 │  698158 │ █████████████▊                                                  │
│ PINNER               │ HARROW                 │   997 │  697876 │ █████████████▊                                                  │
│ LECHLADE             │ COTSWOLD               │   155 │  696262 │ █████████████▊                                                  │
│ WALTON-ON-THAMES     │ ELMBRIDGE              │  1850 │  690102 │ █████████████▋                                                  │
└──────────────────────┴────────────────────────┴───────┴─────────┴─────────────────────────────────────────────────────────────────┘
```

## プロジェクションを使用してクエリを加速する {#speedup-with-projections}

[プロジェクション](../../sql-reference/statements/alter/projection.md)を使用すると、事前集約されたデータを任意の形式で保存することによってクエリ速度を改善できます。この例では、年、地区、都市別の平均価格、合計価格、物件数を追跡するプロジェクションを作成します。クエリ時に、ClickHouseがプロジェクションを使用することでクエリのパフォーマンスが改善されると判断した場合、プロジェクションが使用されます（プロジェクションを使用するために特別な操作は不要で、ClickHouseがプロジェクションの有用性を判断します）。

### プロジェクションの作成 {#build-projection}

`toYear(date)`、`district`、`town`のディメンションごとに集約プロジェクションを作成しましょう：

```sql
ALTER TABLE uk_price_paid
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

既存のデータに対してプロジェクションをポピュレートします（物化せずに作成されたプロジェクションは、新しく挿入されたデータに対してのみ作成されます）：

```sql
ALTER TABLE uk_price_paid
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

## パフォーマンスをテストする {#test-performance}

再度、同じ3つのクエリを実行してみましょう：

### クエリ1. 年ごとの平均価格 {#average-price-projections}

```sql
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk_price_paid
GROUP BY year
ORDER BY year ASC
```

結果は同じですが、パフォーマンスは改善されています！
```response
No projection:   28 rows in set. Elapsed: 1.775 sec. Processed 27.45 million rows, 164.70 MB (15.47 million rows/s., 92.79 MB/s.)
With projection: 28 rows in set. Elapsed: 0.665 sec. Processed 87.51 thousand rows, 3.21 MB (131.51 thousand rows/s., 4.82 MB/s.)
```

### クエリ2. ロンドンの年ごとの平均価格 {#average-price-london-projections}

```sql
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

同じ結果ですが、クエリパフォーマンスが改善されたことに注意してください：

```response
No projection:   28 rows in set. Elapsed: 0.720 sec. Processed 27.45 million rows, 46.61 MB (38.13 million rows/s., 64.74 MB/s.)
With projection: 28 rows in set. Elapsed: 0.015 sec. Processed 87.51 thousand rows, 3.51 MB (5.74 million rows/s., 230.24 MB/s.)
```

### クエリ3. 最も高価な地域 {#most-expensive-neighborhoods-projections}

条件（date >= '2020-01-01'）をプロジェクションのディメンション（`toYear(date) >= 2020`）に合わせて修正する必要があります：

```sql
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk_price_paid
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

結果は再び同じですが、クエリパフォーマンスが改善されたことに注意してください：

```response
No projection:   100 rows in set. Elapsed: 0.928 sec. Processed 27.45 million rows, 103.80 MB (29.56 million rows/s., 111.80 MB/s.)
With projection: 100 rows in set. Elapsed: 0.336 sec. Processed 17.32 thousand rows, 1.23 MB (51.61 thousand rows/s., 3.65 MB/s.)
```

### Playgroundでテストする {#playground}

データセットは[オンラインプレイグラウンド](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)でも利用可能です。
