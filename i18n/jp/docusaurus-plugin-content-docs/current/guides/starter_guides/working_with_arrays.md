---
title: 'ClickHouse で配列を扱う'
description: 'ClickHouse で配列を使うための入門ガイド'
keywords: ['配列']
sidebar_label: 'ClickHouse で配列を扱う'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> このガイドでは、ClickHouse での配列の使い方と、よく使用される[配列関数](/sql-reference/functions/array-functions)のいくつかについて学びます。



## 配列の概要 {#array-basics}

配列は、値をひとまとめにするインメモリのデータ構造です。
これらの値を配列の *要素* と呼び、各要素はインデックスで参照できます。インデックスは、配列内での要素の位置を示します。

ClickHouse では、[`array`](/sql-reference/data-types/array) 関数を使用して配列を作成できます。

```sql
array(T)
```

または、角かっこを使う方法もあります：

```sql
[]
```

例えば、数値の配列を作成できます。

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

あるいは文字列の配列：

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

あるいは、[tuple](/sql-reference/data-types/tuple) のようなネストした型の配列：

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

次のように異なる型の要素を含む配列を作りたくなるかもしれません：

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

ただし、配列の要素は常に共通のスーパータイプを持つ必要があります。スーパータイプとは、2つ以上の異なる型の値を損失なく表現でき、それらをまとめて扱える最小のデータ型のことです。
共通のスーパータイプが存在しない場合、配列を作成しようとすると例外が発生します。

```sql
例外が発生しました:
Code: 386. DB::Exception: 型 String、String、UInt8、UInt8、UInt8 に対する共通のスーパータイプが存在しません。一部が String/FixedString/Enum 型であり、一部がそれ以外の型であるためです: スコープ SELECT ['Hello', 'world', 1, 2, 3] 内。(NO_COMMON_TYPE)
```

配列をその場で作成する場合、ClickHouse はすべての要素が収まる最も狭い型を選択します。
たとえば、整数と浮動小数点数からなる配列を作成すると、浮動小数点型のスーパータイプが選択されます。

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>異なる型の配列を作成する</summary>

  上で説明したデフォルトの動作は、`use_variant_as_common_type` 設定を使って変更できます。
  これにより、引数の型に共通のデータ型がない場合でも、`if` / `multiIf` / `array` / `map` 関数の結果型として [Variant](/sql-reference/data-types/variant) 型を使用できるようになります。

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

  この設定により、配列から型名を指定して値を読み出すこともできます:

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

角括弧を使ったインデックス指定は、配列要素にアクセスする便利な方法です。
ClickHouse では、配列インデックスが常に **1** から始まることを知っておくことが重要です。
これは、他の多くのプログラミング言語で配列が 0 始まり（ゼロインデックス）であることに慣れている場合とは異なる点です。


例えば、配列がある場合、次のように書くことでその先頭要素を取得できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

負のインデックスを使用することもできます。
このように、末尾の要素を基準に要素を選択できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

配列は 1 始まりのインデックスを持ちますが、インデックス 0 の要素にもアクセスできます。
返される値は、その配列型の *デフォルト値* になります。
以下の例では、文字列データ型のデフォルト値である空文字列が返されます。

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## 配列関数 {#array-functions}

ClickHouse には、配列に対して適用できる有用な関数が数多く用意されています。
このセクションでは、最も単純なものから始めて、徐々に複雑なものへと進みながら、特に有用な関数をいくつか見ていきます。

### length, arrayEnumerate, indexOf, has* 関数 {#length-arrayEnumerate-indexOf-has-functions}

`length` 関数は、配列内の要素数を返します。

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

[`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) 関数を使用して、要素のインデックスからなる配列を返すこともできます：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

特定の値のインデックスを取得するには、`indexOf` 関数を使用します。

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

この関数は、配列内に同一の値が複数存在する場合は、最初に見つかった要素のインデックスを返す点に注意してください。
配列要素が昇順にソートされている場合は、[`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) 関数を使用できます。

関数 `has`、`hasAll`、`hasAny` は、配列が指定した値を含んでいるかどうかを判定するのに有用です。
次の例を考えてみましょう。

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


## 配列関数を使ったフライトデータの探索 {#exploring-flight-data-with-array-functions}

ここまでの例は比較的シンプルなものでした。
配列の有用性は、実際のデータセットに対して使用したときに真価を発揮します。

ここでは、米国運輸統計局のフライトデータを含む [ontime dataset](/getting-started/example-datasets/ontime) を使用します。
このデータセットは [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K) 上で確認できます。

このデータセットを選んだのは、配列が時系列データの処理に適していることが多く、
複雑になりがちなクエリを簡潔にできるためです。

:::tip
下の「play」ボタンをクリックすると、ドキュメント内でクエリをそのまま実行し、その場で結果を確認できます。
:::

### groupArray {#grouparray}

このデータセットには多くのカラムがありますが、ここではその一部に注目します。
次のクエリを実行して、データの内容を確認してみましょう:

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

ランダムに選んだ特定の日付、例えば「2024-01-01」における、米国内の最も混雑している空港トップ10を見てみましょう。
各空港から何便のフライトが出発しているかを把握したいとします。
データにはフライトごとに1行が含まれていますが、出発空港ごとにデータをグループ化し、目的地を配列にまとめられると便利です。

これを実現するには、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用します。この関数は、各行から指定した列の値を取り出し、それらを配列としてグループ化します。

次のクエリを実行して、どのように動作するか確認してください。

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

上記のクエリで使用している [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero) は、一部の空港コード（3文字）の後に現れるヌル文字を取り除くために使われています。

データがこの形式になっていれば、集約された「Destinations」配列の長さを求めることで、最も利用の多い空港の順位を簡単に特定できます。

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

### arrayMap と arrayZip {#arraymap}

前のクエリで、デンバー国際空港が、今回選択した特定の日に最も出発便の多い空港であることがわかりました。
これらのフライトのうち、定刻通りだったもの、15〜30分遅延したもの、30分以上遅延したものがそれぞれどれくらいあったかを確認してみましょう。

ClickHouse の多くの配列関数は、いわゆる[「高階関数」](/sql-reference/functions/overview#higher-order-functions)であり、最初の引数としてラムダ式を受け取ります。
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap) 関数はそのような高階関数の一例であり、元の配列の各要素にラムダ式を適用することで、新しい配列を返します。

以下のクエリを実行して、`arrayMap` 関数を使い、どのフライトが遅延し、どのフライトが定刻通りだったかを確認しましょう。
出発地/到着地のペアごとに、全フライトのテールナンバーとステータスを表示します：

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses
```


SELECT
Origin,
toStringCutToZero(Dest) AS Destination,
arrayZip(groupArray(Tail&#95;Number), statuses) as tailNumberStatuses
FROM ontime.ontime
WHERE Origin = &#39;DEN&#39;
AND FlightDate = &#39;2024-01-01&#39;
AND DepTime IS NOT NULL
AND DepDelayMinutes IS NOT NULL
GROUP BY ALL

````

上記のクエリでは、`arrayMap`関数が単一要素の配列`[DepDelayMinutes]`を受け取り、ラムダ関数`d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'`を適用して分類を行います。
次に、結果の配列の最初の要素が`[DepDelayMinutes][1]`で抽出されます。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)関数は、`Tail_Number`配列と`statuses`配列を単一の配列に結合します。

### arrayFilter                {#arrayfilter}

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

上記のクエリでは、[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 関数の第1引数としてラムダ関数を渡しています。
このラムダ関数自体は、遅延時間（分）を表す `d` を受け取り、条件が満たされれば `1` を、そうでなければ `0` を返します。

```sql
d -> d >= 30
```

### arraySort と arrayIntersect {#arraysort-and-arrayintersect}

次に、[`arraySort`](/sql-reference/functions/array-functions#arraySort) と [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect) 関数を使って、主要な米国空港のペアのうち、どのペアが最も多くの共通の目的地に就航しているかを調べます。
`arraySort` は配列を受け取り、デフォルトでは要素を昇順に並べ替えますが、ラムダ関数を渡してソート順を指定することもできます。
`arrayIntersect` は複数の配列を受け取り、すべての配列に共通して含まれる要素のみから成る配列を返します。

以下のクエリを実行して、これら 2 つの配列関数の動作を確認しましょう。

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

このクエリは、主に 2 つの段階で動作します。
まず、共通テーブル式 (CTE) を使って `airport_routes` という一時データセットを作成します。これは 2024 年 1 月 1 日のすべてのフライトを対象とし、各出発空港ごとに、その空港が運航しているすべての重複のない目的地のソート済みリストを構築します。
たとえば、`airport_routes` の結果セットでは、DEN には `['ATL', 'BOS', 'LAX', 'MIA', ...]` のように、その空港が就航しているすべての都市を含む配列が格納されます。

第 2 段階では、クエリは 5 つの主要な米国ハブ空港 (`DEN`、`ATL`、`DFW`、`ORD`、`LAS`) を取り上げ、それらのあらゆるペアの組み合わせを比較します。
これはクロスジョインを使って実行され、これらの空港のすべての組み合わせを生成します。
その後、各ペアごとに `arrayIntersect` 関数を使って、両方の空港のリストに共通して現れる目的地を特定します。
`length` 関数は、それらが共通して持つ目的地の数をカウントします。


`a1.Origin < a2.Origin` という条件により、各ペアが 1 回だけ現れるようにしています。
これがないと、同じ比較であるにもかかわらず、JFK-LAX と LAX-JFK の両方が別々の結果として返されてしまい、冗長になります。
最後に、このクエリは結果をソートして、どの空港ペアが最も多くの共通の目的地を持っているかを示し、上位 10 件だけを返します。
これにより、どの主要ハブが最もルートネットワークの重なりが大きいかが分かり、複数の航空会社が同じ都市ペアを運航している競合市場である可能性や、類似した地理的地域にサービスを提供していて旅行者にとって代替的な乗り継ぎ拠点として利用できるハブである可能性を示唆します。

### arrayReduce {#arrayReduce}

遅延を見ているついでに、さらに別の高階配列関数である `arrayReduce` を使って、デンバー国際空港発の各ルートについて平均遅延と最大遅延を求めてみましょう。

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

上の例では、`arrayReduce` を使用して、`DEN` から出発するさまざまな便について、平均遅延時間と最大遅延時間を求めました。
`arrayReduce` は、関数の最初のパラメータで指定された集約関数を、関数の 2 番目のパラメータで指定された配列の要素に適用します。

### arrayJoin {#arrayJoin}

ClickHouse の通常の関数は、受け取った行数と同じ行数を返すという性質を持っています。
ただし、この規則を破る、学んでおく価値のあるユニークで興味深い関数が 1 つあります。それが `arrayJoin` 関数です。

`arrayJoin` は配列を「展開」し、その配列を受け取って、各要素ごとに個別の行を作成します。
これは、他のデータベースにおける `UNNEST` や `EXPLODE` といった SQL 関数と似ています。

配列やスカラー値を返すほとんどの配列関数とは異なり、`arrayJoin` は行数を増やすことで結果セットを根本的に変更します。

次のクエリを考えてみましょう。これは 0 から 100 までを 10 刻みで表す値の配列を返します。
この配列は、0 分、10 分、20 分、といった具合に、さまざまな遅延時間を表していると考えることができます。

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

`arrayJoin` を使ったクエリを書くことで、2 つの空港間のフライトについて、遅延時間がある分数以下となる便が何件あったかを求めることができます。
以下のクエリは、累積遅延バケットを使って、2024 年 1 月 1 日におけるデンバー (DEN) からマイアミ (MIA) へのフライト遅延の分布を示すヒストグラムを作成します。

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

上記のクエリでは、CTE 句（`WITH` 句）を使って遅延時間の配列を返しています。
`Destination` は目的地コードを文字列に変換します。

`arrayJoin` を使用して、遅延時間の配列を複数の行に展開します。
`delay` 配列の各値は、エイリアス `del` を持つ独立した行となり、
`del=0` の行が 1 つ、`del=10` の行が 1 つ、`del=20` の行が 1 つ、といった具合に合計 10 行が得られます。
各遅延しきい値（`del`）ごとに、クエリはそのしきい値以上の遅延があったフライトの数を
`countIf(DepDelayMinutes >= del)` を使ってカウントします。

`arrayJoin` には、同等の SQL コマンドである `ARRAY JOIN` もあります。
上記のクエリを、この SQL コマンドを用いた同等の表現として書き換えたものを、比較のために以下に示します。

```sql runnable
WITH range(0, 100, 10) AS delay, 
     toStringCutToZero(Dest) AS Destination

SELECT    
    del || '分まで' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```


## 次のステップ {#next-steps}

おめでとうございます！このガイドを通じて、ClickHouse における配列について、基本的な配列の作成とインデックス付けから、`groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce`、`arrayJoin` といった強力な関数まで一通り学びました。
学習をさらに進めるには、配列関数の完全なリファレンスを参照し、`arrayFlatten`、`arrayReverse`、`arrayDistinct` などの追加の関数も確認してください。
[`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson)、[Map](/sql-reference/data-types/map) 型など、配列と相性の良い関連データ構造について学ぶのもよいでしょう。
これらのコンセプトを自身のデータセットに適用して練習し、SQL Playground やその他のサンプルデータセット上でさまざまなクエリを試してみてください。

配列は ClickHouse における基本機能であり、効率的な分析クエリを可能にする重要な機能です。配列関数に慣れてくると、複雑な集計処理や時系列分析を劇的に簡素化できることがわかるはずです。
配列をさらに深く学びたい場合は、当社のデータ専門家 Mark による、以下の YouTube 動画をおすすめします。

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>