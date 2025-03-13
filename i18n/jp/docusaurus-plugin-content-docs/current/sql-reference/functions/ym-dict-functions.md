---
slug: '/sql-reference/functions/ym-dict-functions'
sidebar_position: 60
sidebar_label: '埋め込み辞書の関数'
---


# 埋め込み辞書で作業するための関数

:::note
以下の関数が動作するためには、サーバー設定で埋め込み辞書を取得するためのパスとアドレスを指定する必要があります。これらの関数の最初の呼び出し時に辞書が読み込まれます。参照リストが読み込まれない場合、例外がスローされます。

そのため、このセクションに示されている例は、最初に設定されていない限り、[ClickHouse Fiddle](https://fiddle.clickhouse.com/) やクイックリリースおよび本番デプロイで例外をスローします。
:::

参照リストの作成については、セクション「["Dictionaries"](../dictionaries#embedded-dictionaries)」を参照してください。

## 複数のジオベース {#multiple-geobases}

ClickHouseは、特定の地域が属する国に関するさまざまな視点をサポートするために、複数の代替ジオベース（地域階層）で同時に作業することをサポートしています。

'clickhouse-server' 設定ファイルは、地域階層を含むファイルを指定します：

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

このファイルに加えて、ファイル名に `_` シンボルと任意のサフィックスが追加された近くのファイルも検索します（ファイル拡張子の前です）。
例えば、もし存在すれば、ファイル `/opt/geo/regions_hierarchy_ua.txt` も見つかります。ここで `ua` は辞書キーと呼ばれます。サフィックスが無い辞書の場合、キーは空の文字列になります。

すべての辞書は実行時に再読み込みされます（特定の秒数ごとに、[`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 設定パラメータで定義されている場合、またはデフォルトで毎時1回）。ただし、利用可能な辞書のリストはサーバー起動時に一度だけ定義されます。

地域で作業するためのすべての関数は、最後にオプションの引数を持っており、それは辞書キーと呼ばれます。これをジオベースと呼びます。

例：

``` sql
regionToCountry(RegionID) – デフォルトの辞書を使用： /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – デフォルトの辞書を使用： /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 'ua' キーの辞書を使用： /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域IDとジオベースを受け取り、対応する言語で地域の名前の文字列を返します。指定されたIDの地域が存在しない場合、空の文字列が返されます。

**構文**

``` sql
regionToName(id\[, lang\])
```
**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- `geobase`で指定された対応する言語での地域の名前。 [String](../data-types/string)。
- それ以外の場合、空の文字列。

**例**

クエリ：

``` sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

結果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ 世界                                       │
│ アメリカ合衆国                             │
│ コロラド州                                 │
│ ボルダー郡                                 │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

ジオベースから地域IDを受け取ります。この地域が都市または都市の一部である場合、適切な都市の地域IDを返します。そうでない場合、0を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 適切な都市の地域ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

```response
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCity(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                          │
│ 世界                                       │  0 │                                                          │
│ アメリカ合衆国                             │  0 │                                                          │
│ コロラド州                                 │  0 │                                                          │
│ ボルダー郡                                 │  0 │                                                          │
│ ボルダー                                   │  5 │ ボルダー                                               │
│ 中国                                       │  0 │                                                          │
│ 四川省                                     │  0 │                                                          │
│ 成都                                       │  8 │ 成都                                                   │
│ アメリカ                                   │  0 │                                                          │
│ 北アメリカ                                 │  0 │                                                          │
│ ユーラシア                                 │  0 │                                                          │
│ アジア                                     │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

地域を地域（ジオベースのタイプ5）に変換します。他のすべての点で、この関数は ['regionToCity'](#regiontocity) と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 適切な地域の地域ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果：

``` text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ モスクワ及びモスクワ州                           │
│ サンクトペテルブルク及びレニングラード州         │
│ ベルゴロド州                                     │
│ イワノボ州                                       │
│ カルーガ州                                       │
│ コストロマ州                                     │
│ クルスク州                                       │
│ リペツク州                                       │
│ オルロフ州                                       │
│ リャザン州                                       │
│ スモレンスク州                                   │
│ タンボフ州                                       │
│ トヴェリ州                                       │
│ トゥーラ州                                       │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

地域を連邦地区に変換します（ジオベースのタイプ4）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 適切な都市の地域ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果：

``` text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ 中央連邦地区                                        │
│ 北西連邦地区                                        │
│ 南連邦地区                                           │
│ 北カフカス連邦地区                                   │
│ ボルガ連邦地区                                      │
│ ウラル連邦地区                                      │
│ シベリア連邦地区                                    │
│ 極東連邦地区                                        │
│ スコットランド                                        │
│ フェロー諸島                                       │
│ フランドル地域                                      │
│ ブリュッセル首都地域                                 │
│ ワロニア                                            │
│ ボスニア・ヘルツェゴビナ連邦                       │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

地域を国に変換します（ジオベースのタイプ3）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 適切な国の地域ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ 世界                                       │  0 │                                                             │
│ アメリカ合衆国                             │  2 │ アメリカ合衆国                                             │
│ コロラド州                                 │  2 │ アメリカ合衆国                                             │
│ ボルダー郡                                 │  2 │ アメリカ合衆国                                             │
│ ボルダー                                   │  2 │ アメリカ合衆国                                             │
│ 中国                                       │  6 │ 中国                                                       │
│ 四川省                                     │  6 │ 中国                                                       │
│ 成都                                       │  6 │ 中国                                                       │
│ アメリカ                                   │  0 │                                                             │
│ 北アメリカ                                 │  0 │                                                             │
│ ユーラシア                                 │  0 │                                                             │
│ アジア                                     │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

地域を大陸に変換します（ジオベースのタイプ1）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 適切な大陸の地域ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ 世界                                       │  0 │                                                               │
│ アメリカ合衆国                             │ 10 │ 北アメリカ                                                   │
│ コロラド州                                 │ 10 │ 北アメリカ                                                   │
│ ボルダー郡                                 │ 10 │ 北アメリカ                                                   │
│ ボルダー                                   │ 10 │ 北アメリカ                                                   │
│ 中国                                       │ 12 │ アジア                                                       │
│ 四川省                                     │ 12 │ アジア                                                       │
│ 成都                                       │ 12 │ アジア                                                       │
│ アメリカ                                   │  9 │ アメリカ                                                     │
│ 北アメリカ                                 │ 10 │ 北アメリカ                                                   │
│ ユーラシア                                 │ 11 │ ユーラシア                                                   │
│ アジア                                     │ 12 │ アジア                                                       │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

地域の階層で最高の大陸を見つけます。

**構文**

``` sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 地域の階層を上にたどるときのトップレベルの大陸の識別子。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ 世界                                       │  0 │                                                                  │
│ アメリカ合衆国                             │  9 │ アメリカ                                                       │
│ コロラド州                                 │  9 │ アメリカ                                                       │
│ ボルダー郡                                 │  9 │ アメリカ                                                       │
│ ボルダー                                   │  9 │ アメリカ                                                       │
│ 中国                                       │ 11 │ ユーラシア                                                   │
│ 四川省                                     │ 11 │ ユーラシア                                                   │
│ 成都                                       │ 11 │ ユーラシア                                                   │
│ アメリカ                                   │  9 │ アメリカ                                                       │
│ 北アメリカ                                 │  9 │ アメリカ                                                       │
│ ユーラシア                                 │ 11 │ ユーラシア                                                   │
│ アジア                                     │ 11 │ ユーラシア                                                   │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

地域の人口を取得します。人口はジオベースのファイルに記録される場合があります。「["Dictionaries"](../dictionaries#embedded-dictionaries)」セクションを参照してください。地域の人口が記録されていない場合、0を返します。ジオベースでは、人口は子地域に記録される場合がありますが、親地域には記録されない可能性があります。

**構文**

``` sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 地域の人口。 [UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ 世界                                       │ 4294967295 │
│ アメリカ合衆国                             │  330000000 │
│ コロラド州                                 │    5700000 │
│ ボルダー郡                                 │     330000 │
│ ボルダー                                   │     100000 │
│ 中国                                       │ 1500000000 │
│ 四川省                                     │   83000000 │
│ 成都                                       │   20000000 │
│ アメリカ                                   │ 1000000000 │
│ 北アメリカ                                 │  600000000 │
│ ユーラシア                                 │ 4294967295 │
│ アジア                                     │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

`lhs`地域が `rhs`地域に属しているかどうかを確認します。属している場合は1、属していない場合は0を返します。

**構文**

``` sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `rhs` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 属している場合は1。 [UInt8](../data-types/int-uint)。
- 属していない場合は0。

**実装の詳細**

この関係は反射的です – どんな地域も自分自身に属します。

**例**

クエリ：

``` sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' に含まれる ' : ' に含まれない ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果：

``` text
世界 に含まれる 世界
世界 に含まれない アメリカ合衆国
世界 に含まれない コロラド州
世界 に含まれない ボルダー郡
世界 に含まれない ボルダー
アメリカ合衆国 に含まれる 世界
アメリカ合衆国 に含まれる アメリカ合衆国
アメリカ合衆国 に含まれない コロラド州
アメリカ合衆国 に含まれない ボルダー郡
アメリカ合衆国 に含まれない ボルダー  
```

### regionHierarchy {#regionhierarchy}

UInt32数値（ジオベースからの地域ID）を受け取ります。渡された地域とその親全てのチェーンから成る地域IDの配列を返します。

**構文**

``` sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — ジオベースからの地域ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。 オプションです。

**返される値**

- 渡された地域とその親全てのチェーンから成る地域IDの配列。 [Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ：

``` sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

結果：

``` text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['世界']                                                                                      │
│ [2,10,9,1]     │ ['アメリカ合衆国','北アメリカ','アメリカ']                                                │
│ [3,2,10,9,1]   │ ['コロラド州','アメリカ合衆国','北アメリカ','アメリカ']                                   │
│ [4,3,2,10,9,1] │ ['ボルダー郡','コロラド州','アメリカ合衆国','北アメリカ','アメリカ']                     │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```
