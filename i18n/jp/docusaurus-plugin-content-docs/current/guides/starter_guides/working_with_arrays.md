---
title: 'ClickHouse における配列の操作'
description: 'ClickHouse で配列を使用するための入門ガイド'
keywords: ['Arrays']
sidebar_label: 'ClickHouse における配列の操作'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> このガイドでは、ClickHouse における配列の使い方と、よく利用される[配列関数](/sql-reference/functions/array-functions)をいくつか紹介します。



## 配列の概要 {#array-basics}

配列は、複数の値をグループ化するインメモリのデータ構造です。
これらを配列の_要素_と呼び、各要素はインデックスで参照できます。インデックスは、グループ内での要素の位置を示します。

ClickHouseでは、[`array`](/sql-reference/data-types/array)関数を使用して配列を作成できます:

```sql
array(T)
```

または、角括弧を使用することもできます:

```sql
[]
```

例えば、数値の配列を作成できます:

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

または文字列の配列:

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

または[タプル](/sql-reference/data-types/tuple)などのネストされた型の配列:

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

次のように異なる型の配列を作成したくなるかもしれません:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

しかし、配列の要素は常に共通のスーパータイプを持つ必要があります。スーパータイプとは、2つ以上の異なる型の値を損失なく表現でき、それらを一緒に使用できる最小のデータ型です。
共通のスーパータイプが存在しない場合、配列を作成しようとすると例外が発生します:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

配列を動的に作成する際、ClickHouseはすべての要素に適合する最も狭い型を選択します。
例えば、整数と浮動小数点数の配列を作成すると、浮動小数点数のスーパータイプが選択されます:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
<summary>異なる型の配列を作成する</summary>

`use_variant_as_common_type`設定を使用して、上記のデフォルト動作を変更できます。
これにより、引数の型に共通の型がない場合、`if`/`multiIf`/`array`/`map`関数の結果型として[Variant](/sql-reference/data-types/variant)型を使用できます。

例:

```sql
SELECT
    [1, 'ClickHouse', ['Another', 'Array']] AS array,
    toTypeName(array)
SETTINGS use_variant_as_common_type = 1;
```

```response
┌─array────────────────────────────────┬─toTypeName(array)────────────────────────────┐
│ [1,'ClickHouse',['Another','Array']] │ Array(Variant(Array(String), String, UInt8)) │
└──────────────────────────────────────┴──────────────────────────────────────────────┘
```

その後、型名で配列から型を読み取ることもできます:

```sql
SELECT
    [1, 'ClickHouse', ['Another', 'Array']] AS array,
    array.UInt8,
    array.String,
    array.`Array(String)`
SETTINGS use_variant_as_common_type = 1;
```

```response
┌─array────────────────────────────────┬─array.UInt8───┬─array.String─────────────┬─array.Array(String)─────────┐
│ [1,'ClickHouse',['Another','Array']] │ [1,NULL,NULL] │ [NULL,'ClickHouse',NULL] │ [[],[],['Another','Array']] │
└──────────────────────────────────────┴───────────────┴──────────────────────────┴─────────────────────────────┘
```

</details>

角括弧を使用したインデックスは、配列要素にアクセスする便利な方法を提供します。
ClickHouseでは、配列のインデックスが常に**1**から始まることを知っておくことが重要です。
これは、配列がゼロインデックスである他のプログラミング言語とは異なる場合があります。


たとえば配列がある場合、次のように記述すると、その配列の先頭の要素を選択できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

負のインデックスを使用することもできます。
このようにして、最後の要素からの相対位置で要素を選択できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

配列は 1 始まりのインデックスですが、位置 0 の要素にもアクセスできます。
返される値は、その配列型の *デフォルト値* になります。
次の例では、文字列データ型のデフォルト値が空文字列であるため、空文字列が返されます。

```sql
WITH ['hello', 'world', '配列って便利ですよね?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## 配列関数 {#array-functions}

ClickHouseは配列を操作する多数の便利な関数を提供しています。
このセクションでは、最もシンプルなものから始めて、徐々に複雑なものへと進みながら、最も有用な関数のいくつかを見ていきます。

### length、arrayEnumerate、indexOf、has\* 関数 {#length-arrayEnumerate-indexOf-has-functions}

`length`関数は配列内の要素数を返します：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

また、[`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate)関数を使用して、要素のインデックスの配列を返すこともできます：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

特定の値のインデックスを見つけたい場合は、`indexOf`関数を使用できます：

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

この関数は、配列内に同一の値が複数存在する場合、最初に見つかったインデックスを返すことに注意してください。
配列の要素が昇順にソートされている場合は、[`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted)関数を使用できます。

`has`、`hasAll`、`hasAny`関数は、配列が特定の値を含んでいるかどうかを判定するのに便利です。
次の例を考えてみましょう：

```sql
WITH ['Airbus A380', 'Airbus A350', 'Airbus A220', 'Boeing 737', 'Boeing 747-400'] AS airplanes
SELECT
    has(airplanes, 'Airbus A350') AS has_true,
    has(airplanes, 'Lockheed Martin F-22 Raptor') AS has_false,
    hasAny(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAny_true,
    hasAny(airplanes, ['Lockheed Martin F-22 Raptor', 'Eurofighter Typhoon']) AS hasAny_false,
    hasAll(airplanes, ['Boeing 737', 'Boeing 747-400']) AS hasAll_true,
    hasAll(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAll_false
FORMAT Vertical;
```

```response
has_true:     1
has_false:    0
hasAny_true:  1
hasAny_false: 0
hasAll_true:  1
hasAll_false: 0
```


## 配列関数を使用したフライトデータの探索 {#exploring-flight-data-with-array-functions}

これまでの例はかなりシンプルなものでした。
配列の有用性は、実際のデータセットで使用した際に真価を発揮します。

米国運輸統計局のフライトデータを含む[ontimeデータセット](/getting-started/example-datasets/ontime)を使用します。
このデータセットは[SQLプレイグラウンド](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K)で確認できます。

配列は時系列データの処理に適しており、複雑なクエリを簡素化できるため、このデータセットを選択しました。

:::tip
下の「再生」ボタンをクリックすると、ドキュメント内で直接クエリを実行し、結果をリアルタイムで確認できます。
:::

### groupArray {#grouparray}

このデータセットには多くのカラムがありますが、一部のカラムに焦点を当てます。
以下のクエリを実行して、データの内容を確認してください：

```sql runnable
-- SELECT
-- *
-- FROM ontime.ontime LIMIT 100

SELECT
    FlightDate,
    Origin,
    OriginCityName,
    Dest,
    DestCityName,
    DepTime,
    DepDelayMinutes,
    ArrTime,
    ArrDelayMinutes
FROM ontime.ontime LIMIT 5
```

ランダムに選んだ特定の日、例えば'2024-01-01'における米国で最も混雑している上位10空港を見てみましょう。
各空港から出発するフライト数を把握することに関心があります。
データには1フライトにつき1行が含まれていますが、出発空港でデータをグループ化し、目的地を配列にまとめることができれば便利です。

これを実現するには、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集約関数を使用できます。この関数は各行から指定されたカラムの値を取得し、配列にグループ化します。

以下のクエリを実行して、動作を確認してください：

```sql runnable
SELECT
    FlightDate,
    Origin,
    groupArray(toStringCutToZero(Dest)) AS Destinations
FROM ontime.ontime
WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA') AND FlightDate='2024-01-01'
GROUP BY FlightDate, Origin
ORDER BY length(Destinations)
```

上記のクエリの[`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero)は、一部の空港の3文字コードの後に現れるヌル文字を削除するために使用されています。

この形式のデータを使用すると、集約された「Destinations」配列の長さを調べることで、最も混雑している空港の順位を簡単に見つけることができます：

```sql runnable
WITH
    '2024-01-01' AS date,
    busy_airports AS (
    SELECT
    FlightDate,
    Origin,
--highlight-next-line
    groupArray(toStringCutToZero(Dest)) AS Destinations
    FROM ontime.ontime
    WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA')
    AND FlightDate = date
    GROUP BY FlightDate, Origin
    ORDER BY length(Destinations)
    )
SELECT
    Origin,
    length(Destinations) AS outward_flights
FROM busy_airports
ORDER BY outward_flights DESC
```

### arrayMapとarrayZip {#arraymap}

前のクエリで、選択した特定の日においてデンバー国際空港が最も多くの出発便を持つ空港であることがわかりました。
これらのフライトのうち、定刻通り、15〜30分の遅延、または30分以上の遅延がそれぞれ何便あったかを見てみましょう。

ClickHouseの配列関数の多くは、いわゆる[「高階関数」](/sql-reference/functions/overview#higher-order-functions)であり、最初のパラメータとしてラムダ関数を受け取ります。
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap)関数はそのような高階関数の一例であり、元の配列の各要素にラムダ関数を適用することで、提供された配列から新しい配列を返します。

以下のクエリを実行して、`arrayMap`関数を使用してどのフライトが遅延または定刻通りだったかを確認してください。
出発地/目的地のペアごとに、すべてのフライトの機体番号とステータスが表示されます：

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

```


SELECT
Origin,
toStringCutToZero(Dest) AS Destination,
arrayZip(groupArray(Tail_Number), statuses) as tailNumberStatuses
FROM ontime.ontime
WHERE Origin = 'DEN'
AND FlightDate = '2024-01-01'
AND DepTime IS NOT NULL
AND DepDelayMinutes IS NOT NULL
GROUP BY ALL

````

上記のクエリでは、`arrayMap`関数が単一要素の配列`[DepDelayMinutes]`を受け取り、ラムダ関数`d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'`を適用して分類を行います。
その後、結果配列の最初の要素が`[DepDelayMinutes][1]`で抽出されます。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)関数は、`Tail_Number`配列と`statuses`配列を1つの配列に結合します。

### arrayFilter {#arrayfilter}

次に、空港`DEN`、`ATL`、`DFW`について、30分以上遅延したフライトの数のみを確認します:

```sql runnable
SELECT
    Origin,
    OriginCityName,
--highlight-next-line
    length(arrayFilter(d -> d >= 30, groupArray(ArrDelayMinutes))) AS num_delays_30_min_or_more
FROM ontime.ontime
WHERE Origin IN ('DEN', 'ATL', 'DFW')
    AND FlightDate = '2024-01-01'
GROUP BY Origin, OriginCityName
ORDER BY num_delays_30_min_or_more DESC
````

上記のクエリでは、[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter)関数の第1引数としてラムダ関数を渡しています。
このラムダ関数は遅延時間を分単位(d)で受け取り、条件が満たされた場合は`1`を、そうでない場合は`0`を返します。

```sql
d -> d >= 30
```

### arraySort と arrayIntersect {#arraysort-and-arrayintersect}

次に、[`arraySort`](/sql-reference/functions/array-functions#arraySort)関数と[`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect)関数を使用して、米国の主要空港のペアがどの共通の目的地に最も多く就航しているかを調べます。
`arraySort`は配列を受け取り、デフォルトでは要素を昇順にソートしますが、ラムダ関数を渡してソート順を定義することもできます。
`arrayIntersect`は複数の配列を受け取り、すべての配列に共通して存在する要素を含む配列を返します。

以下のクエリを実行して、これら2つの配列関数の動作を確認してください:

```sql runnable
WITH airport_routes AS (
    SELECT
        Origin,
--highlight-next-line
        arraySort(groupArray(DISTINCT toStringCutToZero(Dest))) AS destinations
    FROM ontime.ontime
    WHERE FlightDate = '2024-01-01'
    GROUP BY Origin
)
SELECT
    a1.Origin AS airport1,
    a2.Origin AS airport2,
--highlight-next-line
    length(arrayIntersect(a1.destinations, a2.destinations)) AS common_destinations
FROM airport_routes a1
CROSS JOIN airport_routes a2
WHERE a1.Origin < a2.Origin
    AND a1.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
    AND a2.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
ORDER BY common_destinations DESC
LIMIT 10
```

このクエリは2つの主要な段階で動作します。
まず、共通テーブル式(CTE)を使用して`airport_routes`という一時データセットを作成します。これは2024年1月1日のすべてのフライトを調べ、各出発空港について、その空港が就航するすべての一意の目的地のソート済みリストを構築します。
`airport_routes`の結果セットでは、例えばDENは`['ATL', 'BOS', 'LAX', 'MIA', ...]`のように、就航するすべての都市を含む配列を持つことになります。

第2段階では、クエリは米国の5つの主要ハブ空港(`DEN`、`ATL`、`DFW`、`ORD`、`LAS`)を取り、それらのすべての可能なペアを比較します。
これはクロス結合を使用して行われ、これらの空港のすべての組み合わせを作成します。
次に、各ペアについて、`arrayIntersect`関数を使用して両方の空港のリストに現れる目的地を見つけます。
length関数は、共通の目的地がいくつあるかをカウントします。


条件 `a1.Origin < a2.Origin` により、各ペアが一度だけ表示されることが保証されます。
この条件がない場合、JFK-LAX と LAX-JFK が別々の結果として取得されますが、これらは同じ比較を表すため冗長になります。
最後に、クエリは結果をソートして、共通の目的地が最も多い空港ペアを表示し、上位10件のみを返します。
これにより、最も重複するルートネットワークを持つ主要ハブが明らかになります。これは、複数の航空会社が同じ都市ペアにサービスを提供している競争市場を示している可能性があるほか、類似の地理的地域にサービスを提供しており、旅行者の代替接続ポイントとして利用できる可能性のあるハブを示している場合もあります。

### arrayReduce {#arrayReduce}

遅延を調べている間に、さらに別の高階配列関数 `arrayReduce` を使用して、デンバー国際空港からの各ルートの平均遅延と最大遅延を求めてみましょう:

```sql runnable
SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    groupArray(DepDelayMinutes) AS delays,
--highlight-start
    round(arrayReduce('avg', groupArray(DepDelayMinutes)), 2) AS avg_delay,
    round(arrayReduce('max', groupArray(DepDelayMinutes)), 2) AS worst_delay
--highlight-end
FROM ontime.ontime
WHERE Origin = 'DEN'
    AND FlightDate = '2024-01-01'
    AND DepDelayMinutes IS NOT NULL
GROUP BY Origin, Destination
ORDER BY avg_delay DESC
```

上記の例では、`arrayReduce` を使用して `DEN` からのさまざまな出発便の平均遅延と最大遅延を求めました。
`arrayReduce` は、関数の第1パラメータで指定された集約関数を、関数の第2パラメータで指定された配列の要素に適用します。

### arrayJoin {#arrayJoin}

ClickHouse の通常の関数は、受け取った行数と同じ行数を返すという特性を持っています。
しかし、このルールを破る興味深くユニークな関数が1つあり、学ぶ価値があります。それが `arrayJoin` 関数です。

`arrayJoin` は配列を「展開」し、各要素に対して個別の行を作成します。
これは他のデータベースの `UNNEST` または `EXPLODE` SQL関数に似ています。

配列やスカラー値を返すほとんどの配列関数とは異なり、`arrayJoin` は行数を増やすことで結果セットを根本的に変更します。

以下のクエリは、0から100まで10刻みの値の配列を返します。
この配列を異なる遅延時間と考えることができます:0分、10分、20分、といった具合です。

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

`arrayJoin` を使用してクエリを記述し、2つの空港間でその分数までの遅延がいくつあったかを算出できます。
以下のクエリは、2024年1月1日のデンバー(DEN)からマイアミ(MIA)への便の遅延分布を、累積遅延バケットを使用してヒストグラムとして作成します:

```sql runnable
WITH range(0, 100, 10) AS delay,
    toStringCutToZero(Dest) AS Destination

SELECT
    'Up to ' || arrayJoin(delay) || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= arrayJoin(delay)) AS flightsDelayed
FROM ontime.ontime
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY delayTime
ORDER BY flightsDelayed DESC
```

上記のクエリでは、CTE句(`WITH` 句)を使用して遅延の配列を返します。
`Destination` は目的地コードを文字列に変換します。

`arrayJoin` を使用して遅延配列を個別の行に展開します。
`delay` 配列の各値は、エイリアス `del` を持つ独自の行になり、
10行が得られます:`del=0` に対して1行、`del=10` に対して1行、`del=20` に対して1行、といった具合です。
各遅延閾値(`del`)に対して、クエリは `countIf(DepDelayMinutes >= del)` を使用して、その閾値以上の遅延があった便の数をカウントします。

`arrayJoin` には、SQLコマンドの同等機能である `ARRAY JOIN` もあります。
上記のクエリを、比較のためにSQLコマンドの同等機能を使用して以下に再現します:

```sql runnable
WITH range(0, 100, 10) AS delay,
     toStringCutToZero(Dest) AS Destination

SELECT
    'Up to ' || del || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```


## 次のステップ {#next-steps}

おめでとうございます！ClickHouseにおける配列の操作方法を学習しました。基本的な配列の作成とインデックス参照から、`groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce`、`arrayJoin`といった強力な関数まで習得しました。
学習を続けるには、配列関数の完全なリファレンスを参照して、`arrayFlatten`、`arrayReverse`、`arrayDistinct`などの追加関数を確認してください。
また、配列と併用できる関連データ構造として、[`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson)、[Map](/sql-reference/data-types/map)型についても学習することをお勧めします。
これらの概念を自身のデータセットに適用して実践し、SQLプレイグラウンドやその他のサンプルデータセットで様々なクエリを試してみてください。

配列はClickHouseの基本機能であり、効率的な分析クエリを実現します。配列関数に慣れるにつれて、複雑な集計や時系列分析を劇的に簡素化できることがわかるでしょう。
配列についてさらに学ぶには、当社のデータエキスパートであるMarkによる以下のYouTube動画をお勧めします：

<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX'
  title='YouTube動画プレーヤー'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>
