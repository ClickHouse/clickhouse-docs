---
title: 'ClickHouseでの配列の使い方'
description: 'ClickHouseで配列を使用する方法に関するスターターガイド'
keywords: ['Arrays']
sidebar_label: 'ClickHouseでの配列の使い方'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> このガイドでは、ClickHouseで配列を使用する方法と、最もよく使用される[配列関数](/sql-reference/functions/array-functions)について学習します。

## 配列の紹介 {#array-basics}

配列は、値をグループ化するメモリ内のデータ構造です。
これらを配列の_要素_と呼び、各要素はインデックスで参照できます。インデックスは、このグループ内の要素の位置を示します。

ClickHouseの配列は、[`array`](/sql-reference/data-types/array)関数を使用して作成できます:

```sql
array(T)
```

または、角括弧を使用することもできます:

```sql
[]
```

たとえば、数値の配列を作成できます:

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

ただし、配列要素は常に共通のスーパータイプを持つ必要があります。スーパータイプとは、2つ以上の異なる型の値を損失なく表現でき、それらを一緒に使用できる最小のデータ型です。
共通のスーパータイプが存在しない場合、配列を作成しようとすると例外が発生します:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

配列をその場で作成する場合、ClickHouseはすべての要素に適合する最も狭い型を選択します。
たとえば、整数と浮動小数点数の配列を作成すると、floatのスーパータイプが選択されます:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
<summary>異なる型の配列の作成</summary>

`use_variant_as_common_type`設定を使用して、上記で説明したデフォルトの動作を変更できます。
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

型名で配列から型を読み取ることもできます:

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

角括弧を使用したインデックスの使用は、配列要素にアクセスする便利な方法を提供します。
ClickHouseでは、配列インデックスが常に**1**から始まることを知っておくことが重要です。
これは、配列がゼロインデックスである他のプログラミング言語とは異なる場合があります。

たとえば、配列が与えられた場合、次のように記述して配列の最初の要素を選択できます:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

負のインデックスを使用することも可能です。
この方法で、最後の要素を基準にして要素を選択できます:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

配列が1ベースのインデックスであるにもかかわらず、位置0の要素にアクセスすることはできます。
返される値は、配列型の_デフォルト値_になります。
以下の例では、文字列データ型のデフォルト値であるため、空の文字列が返されます:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```

## 配列関数 {#array-functions}

ClickHouseは、配列を操作する多くの便利な関数を提供しています。
このセクションでは、最も有用なもののいくつかを見て、最も単純なものから始めて複雑さを増していきます。

### length、arrayEnumerate、indexOf、has*関数 {#length-arrayEnumerate-indexOf-has-functions}

`length`関数は、配列内の要素数を返すために使用されます:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

[`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate)関数を使用して、要素のインデックスの配列を返すこともできます:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

特定の値のインデックスを見つけたい場合は、`indexOf`関数を使用できます:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

この関数は、配列に複数の同一の値がある場合、最初に遭遇したインデックスを返すことに注意してください。
配列要素が昇順でソートされている場合は、[`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted)関数を使用できます。

関数`has`、`hasAll`、`hasAny`は、配列に指定された値が含まれているかどうかを判断するのに役立ちます。
次の例を考えてみましょう:

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

## 配列関数でフライトデータを探索する {#exploring-flight-data-with-array-functions}

これまでの例はかなり単純でした。
配列の有用性は、実際のデータセットで使用される場合に本当に現れます。

運輸統計局のフライトデータを含む[ontimeデータセット](/getting-started/example-datasets/ontime)を使用します。
このデータセットは[SQLプレイグラウンド](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K)で見つけることができます。

配列は時系列データの操作に適していることが多く、そうでなければ複雑なクエリを簡素化するのに役立つため、このデータセットを選択しました。

:::tip
以下の「再生」ボタンをクリックして、ドキュメント内でクエリを直接実行し、結果をライブで確認できます。
:::

### groupArray {#grouparray}

このデータセットには多くの列がありますが、列のサブセットに焦点を当てます。
以下のクエリを実行して、データがどのように見えるか確認してください:

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

ランダムに選んだ特定の日、たとえば'2024-01-01'の米国で最も混雑している空港のトップ10を見てみましょう。
各空港から出発するフライト数を理解することに興味があります。
データには1つのフライトにつき1行が含まれていますが、出発空港でデータをグループ化し、目的地を配列にまとめることができれば便利です。

これを実現するには、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集計関数を使用できます。この関数は、各行から指定された列の値を取得し、それらを配列にグループ化します。

以下のクエリを実行して、その仕組みを確認してください:

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

上記のクエリの[`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero)は、空港の3文字の指定の後に表示されるヌル文字を削除するために使用されます。

この形式のデータを使用すると、ロールアップされた「Destinations」配列の長さを見つけることで、最も混雑している空港の順序を簡単に見つけることができます:

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

前のクエリで、デンバー国際空港が、選択した特定の日に最も多くの出発便を持つ空港であることがわかりました。
これらのフライトのうち、定時運行、15〜30分の遅延、または30分以上の遅延がどれだけあったかを見てみましょう。

ClickHouseの配列関数の多くは、いわゆる[「高階関数」](/sql-reference/functions/overview#higher-order-functions)であり、最初のパラメータとしてラムダ関数を受け入れます。
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap)関数は、そのような高階関数の例であり、元の配列の各要素にラムダ関数を適用することで、提供された配列から新しい配列を返します。

以下のクエリを実行してください。`arrayMap`関数を使用して、どのフライトが遅延または定時運行だったかを確認できます。
出発地/目的地のペアについて、すべてのフライトの機体番号とステータスを表示します:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

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
```

上記のクエリでは、`arrayMap`関数が単一要素配列`[DepDelayMinutes]`を取り、ラムダ関数`d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'`を適用して分類します。
次に、結果の配列の最初の要素が`[DepDelayMinutes][1]`で抽出されます。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)関数は、`Tail_Number`配列と`statuses`配列を1つの配列に結合します。

### arrayFilter {#arrayfilter}

次に、空港`DEN`、`ATL`、`DFW`について、30分以上遅延したフライト数のみを見てみましょう:

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
```

上記のクエリでは、[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter)関数の最初の引数としてラムダ関数を渡します。
このラムダ関数自体は、遅延時間(d)を取り、条件が満たされる場合は`1`を返し、そうでない場合は`0`を返します。

```sql
d -> d >= 30
```

### arraySortとarrayIntersect {#arraysort-and-arrayintersect}

次に、[`arraySort`](/sql-reference/functions/array-functions#arraySort)と[`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect)関数の助けを借りて、米国の主要空港のペアがどの共通の目的地に最も多くサービスを提供しているかを把握します。
`arraySort`は配列を取り、デフォルトでは要素を昇順にソートしますが、ソート順を定義するラムダ関数を渡すこともできます。
`arrayIntersect`は複数の配列を取り、すべての配列に存在する要素を含む配列を返します。

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

クエリは2つの主要な段階で動作します。
まず、共通テーブル式(CTE)を使用して`airport_routes`と呼ばれる一時的なデータセットを作成します。このデータセットは、2024年1月1日のすべてのフライトを調べ、各出発空港について、その空港がサービスを提供するすべてのユニークな目的地のソートされたリストを構築します。
`airport_routes`結果セットでは、たとえば、DENには、飛行先のすべての都市を含む配列がある可能性があります。たとえば、`['ATL', 'BOS', 'LAX', 'MIA', ...]`などです。

第2段階では、クエリは5つの主要な米国のハブ空港(`DEN`、`ATL`、`DFW`、`ORD`、`LAS`)を取り、それらのすべての可能なペアを比較します。
これは、これらの空港のすべての組み合わせを作成するクロス結合を使用して行われます。
次に、各ペアについて、`arrayIntersect`関数を使用して、両方の空港のリストに表示される目的地を見つけます。
length関数は、共通の目的地の数をカウントします。

条件`a1.Origin < a2.Origin`は、各ペアが1回だけ表示されるようにします。
これがないと、JFK-LAXとLAX-JFKの両方が別々の結果として得られますが、これらは同じ比較を表すため冗長です。
最後に、クエリは結果をソートして、共通の目的地の数が最も多い空港ペアを表示し、上位10件のみを返します。
これにより、最も重複するルートネットワークを持つ主要ハブが明らかになります。これは、複数の航空会社が同じ都市ペアにサービスを提供している競争市場、または同様の地理的地域にサービスを提供し、旅行者の代替接続ポイントとして使用できる可能性のあるハブを示している可能性があります。

### arrayReduce {#arrayReduce}

遅延を見ている間に、別の高階配列関数である`arrayReduce`を使用して、デンバー国際空港からの各ルートの平均遅延と最大遅延を見つけましょう:

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

上記の例では、`arrayReduce`を使用して、`DEN`からのさまざまな出発便の平均遅延と最大遅延を見つけました。
`arrayReduce`は、関数の最初のパラメータで指定された集計関数を、関数の2番目のパラメータで指定された提供された配列の要素に適用します。

### arrayJoin {#arrayJoin}

ClickHouseの通常の関数には、受け取った行と同じ数の行を返すという特性があります。
ただし、このルールを破る興味深くユニークな関数が1つあり、学ぶ価値があります - `arrayJoin`関数です。

`arrayJoin`は、配列を取り、各要素に対して個別の行を作成することで配列を「展開」します。
これは、他のデータベースの`UNNEST`または`EXPLODE` SQL関数に似ています。

配列や スカラー値を返すほとんどの配列関数とは異なり、`arrayJoin`は行数を乗算することで結果セットを根本的に変更します。

以下のクエリを考えてみましょう。これは、0から100まで10ステップで値の配列を返します。
配列は、異なる遅延時間と見なすことができます:0分、10分、20分など。

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

`arrayJoin`を使用してクエリを作成し、2つの空港間でその分数までの遅延がいくつあったかを計算できます。
以下のクエリは、2024年1月1日のデンバー(DEN)からマイアミ(MIA)へのフライト遅延の分布を示すヒストグラムを作成します。累積遅延バケットを使用します:

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

上記のクエリでは、CTE句(`WITH`句)を使用して遅延の配列を返します。
`Destination`は、目的地コードを文字列に変換します。

`arrayJoin`を使用して、delay配列を個別の行に展開します。
`delay`配列の各値は、エイリアス`del`を持つ独自の行になり、
10行が得られます:`del=0`用に1行、`del=10`用に1行、`del=20`用に1行など。
各遅延しきい値(`del`)について、クエリは、
`countIf(DepDelayMinutes >= del)`を使用して、そのしきい値以上の遅延を持つフライトの数をカウントします。

`arrayJoin`には、SQL コマンドに相当する`ARRAY JOIN`もあります。
上記のクエリは、比較のためにSQL コマンドに相当するものを使用して以下に再現されています:

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

おめでとうございます! ClickHouseで配列を操作する方法を学習しました。基本的な配列の作成とインデックス付けから、`groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce`、`arrayJoin`などの強力な関数まで。
学習を続けるには、完全な配列関数リファレンスを調べて、`arrayFlatten`、`arrayReverse`、`arrayDistinct`などの追加の関数を見つけてください。
[`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson)、[Map](/sql-reference/data-types/map)型などの関連するデータ構造について学ぶこともお勧めします。これらは配列とうまく連携します。
これらの概念を独自のデータセットに適用し、SQLプレイグラウンドまたは他のサンプルデータセットでさまざまなクエリを試してください。

配列は、効率的な分析クエリを可能にするClickHouseの基本的な機能です - 配列関数により慣れてくると、複雑な集計や時系列分析を劇的に簡素化できることがわかります。
配列のさらなる楽しみのために、データの専門家であるMarkによる以下のYouTubeビデオをお勧めします:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
