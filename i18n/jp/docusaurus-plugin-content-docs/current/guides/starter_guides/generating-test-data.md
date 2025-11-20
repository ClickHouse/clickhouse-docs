---
sidebar_label: 'ランダムなテストデータの生成'
title: 'ClickHouse でランダムなテストデータを生成する'
slug: /guides/generating-test-data
description: 'ClickHouse でランダムなテストデータを生成する方法を学ぶ'
show_related_blogs: true
doc_type: 'guide'
keywords: ['random data', 'test data']
---



# ClickHouse でランダムなテストデータを生成する

ランダムデータの生成は、新しいユースケースのテストや実装のベンチマークに役立ちます。
ClickHouse には [ランダムデータを生成するための多様な関数](/sql-reference/functions/random-functions) が用意されており、多くの場合、外部のデータジェネレーターは不要です。

このガイドでは、ランダム性に対する要件が異なる場合に、ClickHouse でランダムなデータセットを生成する方法のいくつかの例を紹介します。



## シンプルな一様分布データセット {#simple-uniform-dataset}

**ユースケース**: ランダムなタイムスタンプとイベントタイプを持つユーザーイベントのデータセットを素早く生成します。

```sql
CREATE TABLE user_events (
  event_id UUID,
  user_id UInt32,
  event_type LowCardinality(String),
  event_time DateTime
) ENGINE = MergeTree
ORDER BY event_time;

INSERT INTO user_events
SELECT
  generateUUIDv4() AS event_id,
  rand() % 10000 AS user_id,
  arrayJoin(['click','view','purchase']) AS event_type,
  now() - INTERVAL rand() % 3600*24 SECOND AS event_time
FROM numbers(1000000);
```

- `rand() % 10000`: 10,000ユーザーの一様分布
- `arrayJoin(...)`: 3つのイベントタイプからランダムに1つを選択
- タイムスタンプは過去24時間に分散

---


## 指数分布 {#exponential-distribution}

**ユースケース**: 大半の値が低く、一部の値が高い購入金額をシミュレートします。

```sql
CREATE TABLE purchases (
  dt DateTime,
  customer_id UInt32,
  total_spent Float32
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO purchases
SELECT
  now() - INTERVAL randUniform(1,1_000_000) SECOND AS dt,
  number AS customer_id,
  15 + round(randExponential(1/10), 2) AS total_spent
FROM numbers(500000);
```

- 直近期間における均一なタイムスタンプ
- `randExponential(1/10)` — 大半の合計値は0に近く、最小値15でオフセット ([ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4])

---


## 時間分散イベント（ポアソン分布） {#poisson-distribution}

**ユースケース**: 特定の時間帯（例：ピーク時）に集中するイベント到着をシミュレートします。

```sql
CREATE TABLE events (
  dt DateTime,
  event_type String
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO events
SELECT
  toDateTime('2022-12-12 12:00:00')
    - ((12 + randPoisson(12)) * 3600) AS dt,
  'click' AS event_type
FROM numbers(200000);
```

- イベントは正午付近にピークを迎え、ポアソン分布による偏差を持ちます

---


## 時間変動する正規分布 {#time-varying-normal-distribution}

**ユースケース**: 時間とともに変動するシステムメトリクス（例：CPU使用率）をエミュレートします。

```sql
CREATE TABLE cpu_metrics (
  host String,
  ts DateTime,
  usage Float32
) ENGINE = MergeTree
ORDER BY (host, ts);

INSERT INTO cpu_metrics
SELECT
  arrayJoin(['host1','host2','host3']) AS host,
  now() - INTERVAL number SECOND AS ts,
  greatest(0.0, least(100.0,
    randNormal(50 + 30*sin(toUInt32(ts)%86400/86400*2*pi()), 10)
  )) AS usage
FROM numbers(10000);
```

- `usage`は日周期のサイン波にランダム性を加えた値に従います
- 値は\[0,100]の範囲に制限されます

---


## カテゴリカルデータとネストされたデータ {#categorical-and-nested-data}

**ユースケース**: 複数の興味を持つユーザープロファイルを作成します。

```sql
CREATE TABLE user_profiles (
  user_id UInt32,
  interests Array(String),
  scores Array(UInt8)
) ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO user_profiles
SELECT
  number AS user_id,
  arrayShuffle(['sports','music','tech'])[1 + rand() % 3 : 1 + rand() % 3] AS interests,
  [rand() % 100, rand() % 100, rand() % 100] AS scores
FROM numbers(20000);
```

- 配列の長さは1～3の範囲でランダム
- 各興味に対してユーザーごとに3つのスコア

:::tip
さらに多くの例については、[ClickHouseでランダムデータを生成する](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse)ブログ記事をご覧ください。
:::


## ランダムテーブルの生成 {#generating-random-tables}

[`generateRandomStructure`](/sql-reference/functions/other-functions#generateRandomStructure)関数は、[`generateRandom`](/sql-reference/table-functions/generate)テーブルエンジンと組み合わせることで、テスト、ベンチマーク、または任意のスキーマを持つモックデータの作成に特に有用です。

まず、`generateRandomStructure`関数を使用してランダムな構造がどのように見えるかを確認してみましょう:

```sql
SELECT generateRandomStructure(5);
```

次のような結果が表示されるかもしれません:

```response
c1 UInt32, c2 Array(String), c3 DateTime, c4 Nullable(Float64), c5 Map(String, Int16)
```

シード値を使用することで、毎回同じ構造を取得することもできます:

```sql
SELECT generateRandomStructure(3, 42);
```

```response
c1 String, c2 Array(Nullable(Int32)), c3 Tuple(UInt8, Date)
```

それでは、実際のテーブルを作成してランダムデータで埋めてみましょう:

```sql
CREATE TABLE my_test_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT *
FROM generateRandom(
    'col1 UInt32, col2 String, col3 Float64, col4 DateTime',
    1,  -- データ生成用のシード値
    10  -- 異なるランダム値の数
)
LIMIT 100;  -- 100行

-- ステップ2: 新しいテーブルをクエリする
SELECT * FROM my_test_table LIMIT 5;
```

```response
┌───────col1─┬─col2──────┬─────────────────────col3─┬────────────────col4─┐
│ 4107652264 │ &b!M-e;7  │  1.0013455832230728e-158 │ 2059-08-14 19:03:26 │
│  652895061 │ Dj7peUH{T │   -1.032074207667996e112 │ 2079-10-06 04:18:16 │
│ 2319105779 │ =D[       │    -2.066555415720528e88 │ 2015-04-26 11:44:13 │
│ 1835960063 │ _@}a      │  -1.4998020545039013e110 │ 2063-03-03 20:36:55 │
│  730412674 │ _}!       │ -1.3578492992094465e-275 │ 2098-08-23 18:23:37 │
└────────────┴───────────┴──────────────────────────┴─────────────────────┘
```

両方の関数を組み合わせて、完全にランダムなテーブルを作成してみましょう。
まず、どのような構造が得られるかを確認します:

```sql
SELECT generateRandomStructure(7, 123) AS structure FORMAT vertical;
```

```response
┌─structure──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal64(7), c2 Enum16('c2V0' = -21744, 'c2V1' = 5380), c3 Int8, c4 UUID, c5 UUID, c6 FixedString(190), c7 Map(Enum16('c7V0' = -19581, 'c7V1' = -10024, 'c7V2' = 27615, 'c7V3' = -10177, 'c7V4' = -19644, 'c7V5' = 3554, 'c7V6' = 29073, 'c7V7' = 28800, 'c7V8' = -11512), Float64) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

次に、その構造でテーブルを作成し、`DESCRIBE`文を使用して作成した内容を確認します:

```sql
CREATE TABLE fully_random_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT *
FROM generateRandom(generateRandomStructure(7, 123), 1, 10)
LIMIT 1000;

DESCRIBE TABLE fully_random_table;
```


```response
   ┌─name─┬─type─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
1. │ c1   │ Decimal(18, 7)                                                                                                                                                           │              │                    │         │                  │                │
2. │ c2   │ Enum16('c2V0' = -21744, 'c2V1' = 5380)                                                                                                                                   │              │                    │         │                  │                │
3. │ c3   │ Int8                                                                                                                                                                     │              │                    │         │                  │                │
4. │ c4   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
5. │ c5   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
6. │ c6   │ FixedString(190)                                                                                                                                                         │              │                    │         │                  │                │
7. │ c7   │ Map(Enum16('c7V4' = -19644, 'c7V0' = -19581, 'c7V8' = -11512, 'c7V3' = -10177, 'c7V1' = -10024, 'c7V5' = 3554, 'c7V2' = 27615, 'c7V7' = 28800, 'c7V6' = 29073), Float64) │              │                    │         │                  │                │
   └──────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

生成されたデータの一例として、最初の行を確認します：

```sql
SELECT * FROM fully_random_table LIMIT 1 FORMAT vertical;
```

```response
行 1:
──────
c1: 80416293882.257732 -- 804.2億
c2: c2V1
c3: -84
c4: 1a9429b3-fd8b-1d72-502f-c051aeb7018e
c5: 7407421a-031f-eb3b-8571-44ff279ddd36
c6: g̅b�&��rҵ���5C�\�|��H�>���l'V3��R�[��=3�G�LwVMR*s緾/2�J.���6#��(�h>�lە��L^�M�:�R�9%d�ž�zv��W����Y�S��_no��BP+��u��.0��UZ!x�@7:�nj%3�Λd�S�k>���w��|�&��~
c7: {'c7V8':-1.160941256852442}
```
