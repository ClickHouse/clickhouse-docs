---
slug: /guides/developer/time-series-filling-gaps
sidebar_label: '時系列 - 欠損補完'
sidebar_position: 10
description: '時系列データの欠損を補完する。'
keywords: ['時系列', '欠損補完']
title: '時系列データの欠損を補完する'
doc_type: 'guide'
---



# 時系列データの欠損を補完する

時系列データを扱う際、欠損データや非アクティブな期間が原因で、データに空白が生じることがあります。
通常、そのような空白はクエリでデータを取得する際には存在してほしくありません。このような場合に役立つのが `WITH FILL` 句です。
このガイドでは、`WITH FILL` を使用して時系列データの欠損を補完する方法について解説します。



## セットアップ {#setup}

GenAI画像サービスで生成された画像のメタデータを格納する次のテーブルがあるとします：

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

いくつかのレコードをインポートします：

```sql
INSERT INTO images VALUES (1088619203512250448, '2023-03-24 00:24:03.684', 1536, 1536, 2207289);
INSERT INTO images VALUES (1088619204040736859, '2023-03-24 00:24:03.810', 1024, 1024, 1928974);
INSERT INTO images VALUES (1088619204749561989, '2023-03-24 00:24:03.979', 1024, 1024, 1275619);
INSERT INTO images VALUES (1088619206431477862, '2023-03-24 00:24:04.380', 2048, 2048, 5985703);
INSERT INTO images VALUES (1088619206905434213, '2023-03-24 00:24:04.493', 1024, 1024, 1558455);
INSERT INTO images VALUES (1088619208524431510, '2023-03-24 00:24:04.879', 1024, 1024, 1494869);
INSERT INTO images VALUES (1088619208425437515, '2023-03-24 00:24:05.160', 1024, 1024, 1538451);
```


## バケット単位でのクエリ {#querying-by-bucket}

2023年3月24日の`00:24:03`から`00:24:04`の間に作成された画像を調査します。まず、これらの時点に対するパラメータを作成しましょう:

```sql
SET param_start = '2023-03-24 00:24:03',
    param_end = '2023-03-24 00:24:04';
```

次に、データを100ミリ秒のバケットにグループ化し、そのバケット内で作成された画像の数を返すクエリを記述します:

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

結果セットには画像が作成されたバケットのみが含まれますが、時系列分析では、エントリが存在しない場合でも100ミリ秒ごとのバケットをすべて返したい場合があります。


## WITH FILL {#with-fill}

`WITH FILL`句を使用して、これらのギャップを埋めることができます。
また、埋めるギャップのサイズを指定する`STEP`も指定します。
`DateTime`型のデフォルトは1秒ですが、100msの長さのギャップを埋めたいので、ステップ値として100msの間隔を指定します:

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

ギャップが`count`列で0の値で埋められていることが確認できます。


## WITH FILL...FROM {#with-fillfrom}

ただし、時間範囲の開始時点にはまだギャップが存在します。これは`FROM`を指定することで修正できます:

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

結果から、`00:24:03.000`から`00:24:03.500`までのバケットがすべて表示されていることが確認できます。


## WITH FILL...TO {#with-fillto}

ただし、時間範囲の終端部分のバケットがまだ不足しています。これは`TO`値を指定することで補完できます。
`TO`は終端を含まないため、終了時刻が確実に含まれるように、終了時刻に少量の値を加算します。

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

すべての欠損が補完され、`00:24:03.000`から`00:24:05.000`まで100ミリ秒ごとのエントリが揃いました。


## 累積カウント {#cumulative-count}

バケット全体で作成された画像数の累積カウントを保持したい場合を考えます。
以下のように`cumulative`列を追加することで実現できます:

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

cumulative列の値が期待通りに動作していません。


## WITH FILL...INTERPOLATE {#with-fillinterpolate}

`count`列が`0`の行は`cumulative`列も`0`になりますが、`cumulative`列の直前の値を使用する方が望ましいです。
これは以下のように`INTERPOLATE`句を使用することで実現できます:

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

これで大幅に改善されました。
最後に、`bar`関数を使用して棒グラフを追加します。新しい列を`INTERPOLATE`句に追加することを忘れないでください。

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
