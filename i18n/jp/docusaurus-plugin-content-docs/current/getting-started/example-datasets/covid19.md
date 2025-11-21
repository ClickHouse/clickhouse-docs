---
description: 'COVID-19 Open-Data は、COVID-19 の疫学データと、人口統計、経済、政府対応などの関連要因を含む大規模なオープンソースデータベースです'
sidebar_label: 'COVID-19 open-data'
slug: /getting-started/example-datasets/covid19
title: 'COVID-19 Open-Data'
keywords: ['COVID-19 data', 'epidemiological data', 'health dataset', 'example dataset', 'getting started']
doc_type: 'guide'
---

COVID-19 Open-Data は、最大規模の COVID-19 の疫学データベースを構築することを目指しており、あわせて強力で広範な共変量データのセットも提供します。人口統計、経済、疫学、地理、医療、入院、モビリティ、政府の対応、天候などに関する、オープンで公開ソースから収集され、ライセンスされたデータが含まれます。

詳細は GitHub の[こちら](https://github.com/GoogleCloudPlatform/covid-19-open-data)にあります。

このデータを ClickHouse に挿入するのはとても簡単です...

:::note
以下のコマンドは、[ClickHouse Cloud](https://clickhouse.cloud) の **本番** インスタンスで実行されました。ローカル環境にインストールした ClickHouse でも簡単に実行できます。
:::

1. まず、どのようなデータか確認してみましょう。

```sql
DESCRIBE url(
    'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
    'CSVWithNames'
);
```

この CSV ファイルには 10 個の列があります:

```response
┌─name─────────────────┬─type─────────────┐
│ date                 │ Nullable(Date)   │
│ location_key         │ Nullable(String) │
│ new_confirmed        │ Nullable(Int64)  │
│ new_deceased         │ Nullable(Int64)  │
│ new_recovered        │ Nullable(Int64)  │
│ new_tested           │ Nullable(Int64)  │
│ cumulative_confirmed │ Nullable(Int64)  │
│ cumulative_deceased  │ Nullable(Int64)  │
│ cumulative_recovered │ Nullable(Int64)  │
│ cumulative_tested    │ Nullable(Int64)  │
└──────────────────────┴──────────────────┘

10行が設定されています。経過時間: 0.745秒
```

2. では、いくつかの行を表示してみましょう。

```sql
SELECT *
FROM url('https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv')
LIMIT 100;
```

`url` 関数を使うと、CSV ファイルからデータを簡単に読み取れることに注目してください。


```response
┌─c1─────────┬─c2───────────┬─c3────────────┬─c4───────────┬─c5────────────┬─c6─────────┬─c7───────────────────┬─c8──────────────────┬─c9───────────────────┬─c10───────────────┐
│ date       │ location_key │ new_confirmed │ new_deceased │ new_recovered │ new_tested │ cumulative_confirmed │ cumulative_deceased │ cumulative_recovered │ cumulative_tested │
│ 2020-04-03 │ AD           │ 24            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 466                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-04 │ AD           │ 57            │ 0            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 523                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-05 │ AD           │ 17            │ 4            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 540                  │ 21                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-06 │ AD           │ 11            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 551                  │ 22                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-07 │ AD           │ 15            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 566                  │ 24                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-08 │ AD           │ 23            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 589                  │ 26                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
└────────────┴──────────────┴───────────────┴──────────────┴───────────────┴────────────┴──────────────────────┴─────────────────────┴──────────────────────┴───────────────────┘
```

3. データの内容が分かったので、テーブルを作成します。

```sql
CREATE TABLE covid19 (
    date Date,
    location_key LowCardinality(String),
    new_confirmed Int32,
    new_deceased Int32,
    new_recovered Int32,
    new_tested Int32,
    cumulative_confirmed Int32,
    cumulative_deceased Int32,
    cumulative_recovered Int32,
    cumulative_tested Int32
)
ENGINE = MergeTree
ORDER BY (location_key, date);
```

4. 次のコマンドは、データセット全体を `covid19` テーブルに挿入します。

```sql
INSERT INTO covid19
   SELECT *
   FROM
      url(
        'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
        CSVWithNames,
        'date Date,
        location_key LowCardinality(String),
        new_confirmed Int32,
        new_deceased Int32,
        new_recovered Int32,
        new_tested Int32,
        cumulative_confirmed Int32,
        cumulative_deceased Int32,
        cumulative_recovered Int32,
        cumulative_tested Int32'
    );
```

5. 挿入はすぐに終わります — 何行挿入されたか確認してみましょう:

```sql
SELECT formatReadableQuantity(count())
FROM covid19;
```

```response
┌─formatReadableQuantity(count())─┐
│ 1253万                          │
└─────────────────────────────────┘
```

6. COVID-19 の症例が合計で何件記録されているか見てみましょう。

```sql
SELECT formatReadableQuantity(sum(new_confirmed))
FROM covid19;
```

```response
┌─formatReadableQuantity(sum(new_confirmed))─┐
│ 13.9億                                      │
└────────────────────────────────────────────┘
```


7. 日付データには 0 が多く含まれていることに気付くでしょう。これは土日などの週末や、毎日数値が報告されなかった日があるためです。ウィンドウ関数を使って、新規症例数の日次平均を平滑化できます。

```sql
SELECT
   AVG(new_confirmed) OVER (PARTITION BY location_key ORDER BY date ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS cases_smoothed,
   new_confirmed,
   location_key,
   date
FROM covid19;
```

8. このクエリでは、各地域ごとの最新の値を取得します。すべての国が毎日報告しているわけではないため `max(date)` は使えないので、`ROW_NUMBER` を使って最後の行を取得します。

```sql
WITH latest_deaths_data AS
   ( SELECT location_key,
            date,
            new_deceased,
            new_confirmed,
            ROW_NUMBER() OVER (PARTITION BY location_key ORDER BY date DESC) AS rn
     FROM covid19)
SELECT location_key,
       date,
       new_deceased,
       new_confirmed,
       rn
FROM latest_deaths_data
WHERE rn=1;
```

9. `lagInFrame` を使用して、各日の新規症例数の `LAG` を求めることができます。このクエリでは、`US_DC` のロケーションでフィルタリングしています。

```sql
SELECT
   new_confirmed - lagInFrame(new_confirmed,1) OVER (PARTITION BY location_key ORDER BY date) AS confirmed_cases_delta,
   new_confirmed,
   location_key,
   date
FROM covid19
WHERE location_key = 'US_DC';
```

レスポンスは次のとおりです。

```response
┌─confirmed_cases_delta─┬─new_confirmed─┬─location_key─┬───────date─┐
│                     0 │             0 │ US_DC        │ 2020-03-08 │
│                     2 │             2 │ US_DC        │ 2020-03-09 │
│                    -2 │             0 │ US_DC        │ 2020-03-10 │
│                     6 │             6 │ US_DC        │ 2020-03-11 │
│                    -6 │             0 │ US_DC        │ 2020-03-12 │
│                     0 │             0 │ US_DC        │ 2020-03-13 │
│                     6 │             6 │ US_DC        │ 2020-03-14 │
│                    -5 │             1 │ US_DC        │ 2020-03-15 │
│                     4 │             5 │ US_DC        │ 2020-03-16 │
│                     4 │             9 │ US_DC        │ 2020-03-17 │
│                    -1 │             8 │ US_DC        │ 2020-03-18 │
│                    24 │            32 │ US_DC        │ 2020-03-19 │
│                   -26 │             6 │ US_DC        │ 2020-03-20 │
│                    15 │            21 │ US_DC        │ 2020-03-21 │
│                    -3 │            18 │ US_DC        │ 2020-03-22 │
│                     3 │            21 │ US_DC        │ 2020-03-23 │
```

10. このクエリは、日ごとの新規症例数の増減率を計算し、結果セットに増加か減少かを示す単純な `increase` または `decrease` 列を含めます。

```sql
WITH confirmed_lag AS (
  SELECT
    *,
    lagInFrame(new_confirmed) OVER(
      PARTITION BY location_key
      ORDER BY date
    ) AS confirmed_previous_day
  FROM covid19
),
confirmed_percent_change AS (
  SELECT
    *,
    COALESCE(ROUND((new_confirmed - confirmed_previous_day) / confirmed_previous_day * 100), 0) AS percent_change
  FROM confirmed_lag
)
SELECT
  date,
  new_confirmed,
  percent_change,
  CASE
    WHEN percent_change > 0 THEN '増加'
    WHEN percent_change = 0 THEN '変化なし'
    ELSE '減少'
  END AS trend
FROM confirmed_percent_change
WHERE location_key = 'US_DC';
```

結果は次のようになります。


```response
┌───────date─┬─new_confirmed─┬─percent_change─┬─trend─────┐
│ 2020-03-08 │             0 │            nan │ 減少  │
│ 2020-03-09 │             2 │            inf │ 増加  │
│ 2020-03-10 │             0 │           -100 │ 減少  │
│ 2020-03-11 │             6 │            inf │ 増加  │
│ 2020-03-12 │             0 │           -100 │ 減少  │
│ 2020-03-13 │             0 │            nan │ 減少  │
│ 2020-03-14 │             6 │            inf │ 増加  │
│ 2020-03-15 │             1 │            -83 │ 減少  │
│ 2020-03-16 │             5 │            400 │ 増加  │
│ 2020-03-17 │             9 │             80 │ 増加  │
│ 2020-03-18 │             8 │            -11 │ 減少  │
│ 2020-03-19 │            32 │            300 │ 増加  │
│ 2020-03-20 │             6 │            -81 │ 減少  │
│ 2020-03-21 │            21 │            250 │ 増加  │
│ 2020-03-22 │            18 │            -14 │ 減少  │
│ 2020-03-23 │            21 │             17 │ 増加  │
│ 2020-03-24 │            46 │            119 │ 増加  │
│ 2020-03-25 │            48 │              4 │ 増加  │
│ 2020-03-26 │            36 │            -25 │ 減少  │
│ 2020-03-27 │            37 │              3 │ 増加  │
│ 2020-03-28 │            38 │              3 │ 増加  │
│ 2020-03-29 │            59 │             55 │ 増加  │
│ 2020-03-30 │            94 │             59 │ 増加  │
│ 2020-03-31 │            91 │             -3 │ 減少  │
│ 2020-04-01 │            67 │            -26 │ 減少  │
│ 2020-04-02 │           104 │             55 │ 増加  │
│ 2020-04-03 │           145 │             39 │ 増加  │
```

:::note
[GitHub リポジトリ](https://github.com/GoogleCloudPlatform/covid-19-open-data)で言及されているように、このデータセットは2022年9月15日以降、更新されていません。
:::
