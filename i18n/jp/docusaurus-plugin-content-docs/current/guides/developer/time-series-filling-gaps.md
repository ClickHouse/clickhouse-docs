---
'slug': '/guides/developer/time-series-filling-gaps'
'sidebar_label': '時系列 - ギャップ埋め'
'sidebar_position': 10
'description': '時系列データのギャップを埋める'
'keywords':
- 'time series'
- 'gap fill'
'title': '時系列データのギャップ埋め'
---




# 時系列データのギャップを埋める

時系列データを扱うとき、データの欠落や非活動によりギャップが発生することがあります。
通常、データをクエリするときにこれらのギャップが存在しないことを望みます。このような場合に、`WITH FILL` 句が役立ちます。
このガイドでは、時系列データのギャップを埋めるための `WITH FILL` の使い方について説明します。

## セットアップ {#setup}

次のようなテーブルがあり、GenAI画像サービスによって生成された画像のメタデータを格納しているとしましょう。

```sql
CREATE TABLE images
(
    `id` String,
    `timestamp` DateTime64(3),
    `height` Int64,
    `width` Int64,
    `size` Int64
)
ENGINE = MergeTree
ORDER BY (size, height, width);
```

次に、いくつかのレコードをインポートします。

```sql
INSERT INTO images VALUES (1088619203512250448, '2023-03-24 00:24:03.684', 1536, 1536, 2207289);
INSERT INTO images VALUES (1088619204040736859, '2023-03-24 00:24:03.810', 1024, 1024, 1928974);
INSERT INTO images VALUES (1088619204749561989, '2023-03-24 00:24:03.979', 1024, 1024, 1275619);
INSERT INTO images VALUES (1088619206431477862, '2023-03-24 00:24:04.380', 2048, 2048, 5985703);
INSERT INTO images VALUES (1088619206905434213, '2023-03-24 00:24:04.493', 1024, 1024, 1558455);
INSERT INTO images VALUES (1088619208524431510, '2023-03-24 00:24:04.879', 1024, 1024, 1494869);
INSERT INTO images VALUES (1088619208425437515, '2023-03-24 00:24:05.160', 1024, 1024, 1538451);
```

## バケット別にクエリする {#querying-by-bucket}

2023年3月24日の `00:24:03` と `00:24:04` の間に作成された画像を探索するので、その時間点のパラメータを作成しましょう。

```sql
SET param_start = '2023-03-24 00:24:03',
    param_end = '2023-03-24 00:24:04';
```

次に、データを100msのバケットにグループ分けし、バケット内に作成された画像の数を返すクエリを書きます。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

結果セットには画像が作成されたバケットのみが含まれていますが、時系列分析のためには、エントリーがない場合でも各100msバケットを返すことを望むかもしれません。

## WITH FILL {#with-fill}

`WITH FILL` 句を使用してこれらのギャップを埋めることができます。
ギャップを埋めるための `STEP` も指定します。これは `DateTime` 型の場合、デフォルトで1秒ですが、100msの間隔を埋めたいので、ステップ値として100msの間隔を設定します。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

ギャップが `count` 列の0の値で埋められたことが確認できます。

## WITH FILL...FROM {#with-fillfrom}

しかし、時間範囲の最初にもギャップが残っています。これを `FROM` を指定することで修正できます。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.000 │     0 │
│ 2023-03-24 00:24:03.100 │     0 │
│ 2023-03-24 00:24:03.200 │     0 │
│ 2023-03-24 00:24:03.300 │     0 │
│ 2023-03-24 00:24:03.400 │     0 │
│ 2023-03-24 00:24:03.500 │     0 │
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

結果から、`00:24:03.000`から`00:24:03.500`までのバケットが全て表示されることが確認できます。

## WITH FILL...TO {#with-fillto}

しかし、時間範囲の終わりにもいくつかのバケットが欠けています。これを `TO` 値を提供することで埋めることができます。
`TO` は含まれないので、終了時間に少し追加してそれが含まれるようにします。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 1 millisecond
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.000 │     0 │
│ 2023-03-24 00:24:03.100 │     0 │
│ 2023-03-24 00:24:03.200 │     0 │
│ 2023-03-24 00:24:03.300 │     0 │
│ 2023-03-24 00:24:03.400 │     0 │
│ 2023-03-24 00:24:03.500 │     0 │
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
│ 2023-03-24 00:24:04.900 │     0 │
│ 2023-03-24 00:24:05.000 │     0 │
└─────────────────────────┴───────┘
```

ギャップがすべて埋まり、`00:24:03.000`から`00:24:05.000`までの各100msにエントリーがあることが確認できます。

## 累積カウント {#cumulative-count}

次に、バケット内で作成された画像の数を累積カウントで保持したいとします。
以下のように `cumulative` 列を追加することでこれを実現できます。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 1 millisecond
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │
│ 2023-03-24 00:24:03.100 │     0 │          0 │
│ 2023-03-24 00:24:03.200 │     0 │          0 │
│ 2023-03-24 00:24:03.300 │     0 │          0 │
│ 2023-03-24 00:24:03.400 │     0 │          0 │
│ 2023-03-24 00:24:03.500 │     0 │          0 │
│ 2023-03-24 00:24:03.600 │     1 │          1 │
│ 2023-03-24 00:24:03.700 │     0 │          0 │
│ 2023-03-24 00:24:03.800 │     1 │          2 │
│ 2023-03-24 00:24:03.900 │     1 │          3 │
│ 2023-03-24 00:24:04.000 │     0 │          0 │
│ 2023-03-24 00:24:04.100 │     0 │          0 │
│ 2023-03-24 00:24:04.200 │     0 │          0 │
│ 2023-03-24 00:24:04.300 │     1 │          4 │
│ 2023-03-24 00:24:04.400 │     1 │          5 │
│ 2023-03-24 00:24:04.500 │     0 │          0 │
│ 2023-03-24 00:24:04.600 │     0 │          0 │
│ 2023-03-24 00:24:04.700 │     0 │          0 │
│ 2023-03-24 00:24:04.800 │     1 │          6 │
│ 2023-03-24 00:24:04.900 │     0 │          0 │
│ 2023-03-24 00:24:05.000 │     0 │          0 │
└─────────────────────────┴───────┴────────────┘
```

累積列の値は、私たちが望むようには動作していません。

## WITH FILL...INTERPOLATE {#with-fillinterpolate}

`count` 列に `0` がある行は、累積列にも `0` があり、むしろ累積列の前の値を使用してほしいです。
これを `INTERPOLATE` 句を使用することで実現できます。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 100 millisecond
STEP toIntervalMillisecond(100)
INTERPOLATE (cumulative);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │
│ 2023-03-24 00:24:03.100 │     0 │          0 │
│ 2023-03-24 00:24:03.200 │     0 │          0 │
│ 2023-03-24 00:24:03.300 │     0 │          0 │
│ 2023-03-24 00:24:03.400 │     0 │          0 │
│ 2023-03-24 00:24:03.500 │     0 │          0 │
│ 2023-03-24 00:24:03.600 │     1 │          1 │
│ 2023-03-24 00:24:03.700 │     0 │          1 │
│ 2023-03-24 00:24:03.800 │     1 │          2 │
│ 2023-03-24 00:24:03.900 │     1 │          3 │
│ 2023-03-24 00:24:04.000 │     0 │          3 │
│ 2023-03-24 00:24:04.100 │     0 │          3 │
│ 2023-03-24 00:24:04.200 │     0 │          3 │
│ 2023-03-24 00:24:04.300 │     1 │          4 │
│ 2023-03-24 00:24:04.400 │     1 │          5 │
│ 2023-03-24 00:24:04.500 │     0 │          5 │
│ 2023-03-24 00:24:04.600 │     0 │          5 │
│ 2023-03-24 00:24:04.700 │     0 │          5 │
│ 2023-03-24 00:24:04.800 │     1 │          6 │
│ 2023-03-24 00:24:04.900 │     0 │          6 │
│ 2023-03-24 00:24:05.000 │     0 │          6 │
└─────────────────────────┴───────┴────────────┘
```

これでずっと良くなりました。
最後に、`bar` 関数を使ってバーチャートを追加し、`INTERPOLATE` 句に新しい列を追加することを忘れないようにしましょう。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative,
    bar(cumulative, 0, 10, 10) AS barChart
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 100 millisecond
STEP toIntervalMillisecond(100)
INTERPOLATE (cumulative, barChart);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┬─barChart─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │          │
│ 2023-03-24 00:24:03.100 │     0 │          0 │          │
│ 2023-03-24 00:24:03.200 │     0 │          0 │          │
│ 2023-03-24 00:24:03.300 │     0 │          0 │          │
│ 2023-03-24 00:24:03.400 │     0 │          0 │          │
│ 2023-03-24 00:24:03.500 │     0 │          0 │          │
│ 2023-03-24 00:24:03.600 │     1 │          1 │ █        │
│ 2023-03-24 00:24:03.700 │     0 │          1 │ █        │
│ 2023-03-24 00:24:03.800 │     1 │          2 │ ██       │
│ 2023-03-24 00:24:03.900 │     1 │          3 │ ███      │
│ 2023-03-24 00:24:04.000 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.100 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.200 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.300 │     1 │          4 │ ████     │
│ 2023-03-24 00:24:04.400 │     1 │          5 │ █████    │
│ 2023-03-24 00:24:04.500 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.600 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.700 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.800 │     1 │          6 │ ██████   │
│ 2023-03-24 00:24:04.900 │     0 │          6 │ ██████   │
│ 2023-03-24 00:24:05.000 │     0 │          6 │ ██████   │
└─────────────────────────┴───────┴────────────┴──────────┘
```
