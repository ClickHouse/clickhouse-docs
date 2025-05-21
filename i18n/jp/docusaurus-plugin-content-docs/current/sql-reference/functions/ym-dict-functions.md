---
description: '埋め込み辞書を操作するための関数に関するドキュメント'
sidebar_label: '埋め込み辞書'
sidebar_position: 60
slug: /sql-reference/functions/ym-dict-functions
title: '埋め込み辞書を操作するための関数'
---


# 埋め込み辞書を操作するための関数

:::note
以下の関数が機能するためには、サーバー設定で全ての埋め込み辞書を取得するためのパスとアドレスを指定する必要があります。辞書は、これらの関数のいずれかを最初に呼び出した際にロードされます。参照リストがロードできない場合、例外がスローされます。

そのため、このセクションで示されている例は、最初に設定を行わない限り、デフォルトでは[ClickHouse Fiddle](https://fiddle.clickhouse.com/)やクイックリリースおよび本番環境で例外をスローします。
:::

参照リストの作成に関する情報は、セクション["Dictionaries"](../dictionaries#embedded-dictionaries)を参照してください。

## 複数の地理基盤 {#multiple-geobases}

ClickHouseは、特定の地域がどの国に属するかのさまざまな視点をサポートするために、同時に複数の代替地理基盤（地域階層）での作業をサポートしています。

'clickhouse-server' コンフィグでは、地域階層のファイルを指定します:

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

このファイルに加えて、ファイル拡張子の前に `_` シンボルと任意のサフィックスが付加された近くのファイルも検索します。
たとえば、`/opt/geo/regions_hierarchy_ua.txt` ファイルが存在する場合も見つかります。ここで `ua` は辞書キーと呼ばれます。サフィックスのない辞書の場合、キーは空の文字列です。

すべての辞書は、実行時に再ロードされます（[`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) の設定パラメータで定義されている一定の秒数ごと、またはデフォルトでは毎時1回）。ただし、利用可能な辞書のリストは、サーバー起動時に一度だけ定義されます。

地域に対して作業するためのすべての関数には、最後にオプションの引数があります - 辞書キーです。これは、地理基盤と呼ばれます。

例:

```sql
regionToCountry(RegionID) – デフォルトの辞書を使用: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – デフォルトの辞書を使用: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 'ua' キーの辞書を使用: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域 ID と地理基盤を受け取り、対応する言語で地域の名前の文字列を返します。指定された ID の地域が存在しない場合は、空の文字列が返されます。

**構文**

```sql
regionToName(id\[, lang\])
```
**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- `geobase` に指定された対応する言語での地域の名前。 [String](../data-types/string)。
- それ以外の場合、空の文字列。 

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ 世界                                       │
│ アメリカ合衆国                              │
│ コロラド州                                  │
│ ボルダー郡                                  │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

地理基盤から地域 ID を受け取ります。この地域が都市または都市の一部である場合、適切な都市の地域 ID を返します。それ以外の場合、0 を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 存在する場合、適切な都市の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

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
│ アメリカ合衆国                              │  0 │                                                          │
│ コロラド州                                  │  0 │                                                          │
│ ボルダー郡                                  │  0 │                                                          │
│ ボルダー                                    │  5 │ ボルダー                                               │
│ 中国                                       │  0 │                                                          │
│ 四川省                                      │  0 │                                                          │
│ 成都                                       │  8 │ 成都                                                 │
│ アメリカ                                    │  0 │                                                          │
│ 北アメリカ                                  │  0 │                                                          │
│ ユーラシア                                  │  0 │                                                          │
│ アジア                                      │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

地域を地域（地理基盤内のタイプ 5）に変換します。他のすべての点で、この関数は['regionToCity'](#regiontocity) と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 存在する場合、適切な地域の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果：

```text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ モスクワおよびモスクワ州                          │
│ サンクトペテルブルクおよびレニングラード州        │
│ ベルゴロド州                                      │
│ イヴァノフスキー州                                │
│ カルーガ州                                        │
│ コストロマ州                                      │
│ クルスク州                                        │
│ リペツク州                                        │
│ オルロフ州                                        │
│ リャザン州                                        │
│ スモレンスク州                                    │
│ タンボフ州                                        │
│ トヴェール州                                      │
│ トゥーラ州                                        │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

地域を連邦地区に変換します（地理基盤内のタイプ 4）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 存在する場合、適切な都市の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果：

```text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ 中央連邦地区                                         │
│ ノースウェスト連邦地区                               │
│ 南連邦地区                                          │
│ 北カフカス連邦地区                                   │
│ プリボルジエ連邦地区                                 │
│ ウラル連邦地区                                      │
│ シベリア連邦地区                                    │
│ 極東連邦地区                                        │
│ スコットランド                                        │
│ フェロー諸島                                        │
│ フラマン地域                                        │
│ ブリュッセル首都地域                                 │
│ ワロン地域                                          │
│ ボスニア・ヘルツェゴビナ連邦                           │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

地域を国に変換します（地理基盤内のタイプ 3）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 存在する場合、適切な国の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ 世界                                       │  0 │                                                             │
│ アメリカ合衆国                              │  2 │ アメリカ合衆国                                          │
│ コロラド州                                  │  2 │ アメリカ合衆国                                          │
│ ボルダー郡                                  │  2 │ アメリカ合衆国                                          │
│ ボルダー                                    │  2 │ アメリカ合衆国                                          │
│ 中国                                       │  6 │ 中国                                                      │
│ 四川省                                      │  6 │ 中国                                                      │
│ 成都                                       │  6 │ 中国                                                      │
│ アメリカ                                    │  0 │                                                             │
│ 北アメリカ                                  │  0 │                                                             │
│ ユーラシア                                  │  0 │                                                             │
│ アジア                                      │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

地域を大陸に変換します（地理基盤内のタイプ 1）。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 存在する場合、適切な大陸の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ 世界                                       │  0 │                                                               │
│ アメリカ合衆国                              │ 10 │ 北アメリカ                                                 │
│ コロラド州                                  │ 10 │ 北アメリカ                                                 │
│ ボルダー郡                                  │ 10 │ 北アメリカ                                                 │
│ ボルダー                                    │ 10 │ 北アメリカ                                                 │
│ 中国                                       │ 12 │ アジア                                                     │
│ 四川省                                      │ 12 │ アジア                                                     │
│ 成都                                       │ 12 │ アジア                                                     │
│ アメリカ                                    │  9 │ アメリカ                                                  │
│ 北アメリカ                                  │ 10 │ 北アメリカ                                                 │
│ ユーラシア                                  │ 11 │ ユーラシア                                                 │
│ アジア                                      │ 12 │ アジア                                                     │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

地域の階層内で最も高い大陸を見つけます。

**構文**

```sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 地域の階層を上るときの最高レベルの大陸の識別子。(UInt32)[../data-types/int-uint）。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ 世界                                       │  0 │                                                                  │
│ アメリカ合衆国                              │  9 │ アメリカ                                                      │
│ コロラド州                                  │  9 │ アメリカ                                                      │
│ ボルダー郡                                  │  9 │ アメリカ                                                      │
│ ボルダー                                    │  9 │ アメリカ                                                      │
│ 中国                                       │ 11 │ ユーラシア                                                  │
│ 四川省                                      │ 11 │ ユーラシア                                                  │
│ 成都                                       │ 11 │ ユーラシア                                                  │
│ アメリカ                                    │  9 │ アメリカ                                                      │
│ 北アメリカ                                  │  9 │ アメリカ                                                      │
│ ユーラシア                                  │ 11 │ ユーラシア                                                  │
│ アジア                                      │ 11 │ ユーラシア                                                  │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

地域の人口を取得します。人口は地理基盤にあるファイルに記録されることがあります。セクション["Dictionaries"](../dictionaries#embedded-dictionaries)を参照してください。地域の人口が記録されていない場合は、0 を返します。地理基盤では、人口が子地域に対して記録される場合がありますが、親地域に対しては記録されない場合があります。

**構文**

```sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 地域の人口。 [UInt32](../data-types/int-uint)。
- 存在しない場合、0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ 世界                                       │ 4294967295 │
│ アメリカ合衆国                              │  330000000 │
│ コロラド州                                  │    5700000 │
│ ボルダー郡                                  │     330000 │
│ ボルダー                                    │     100000 │
│ 中国                                       │ 1500000000 │
│ 四川省                                      │   83000000 │
│ 成都                                       │   20000000 │
│ アメリカ                                    │ 1000000000 │
│ 北アメリカ                                  │  600000000 │
│ ユーラシア                                  │ 4294967295 │
│ アジア                                      │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

`lhs` 地域が `rhs` 地域に属しているかどうかをチェックします。属している場合は 1 を、属していない場合は 0 を返します。

**構文**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — 地理基盤からの Lhs 地域 ID。 [UInt32](../data-types/int-uint)。
- `rhs` — 地理基盤からの Rhs 地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 属している場合は 1。 [UInt8](../data-types/int-uint)。
- 属していない場合は 0。

**実装の詳細**

この関係は反射的であり、任意の地域は自身にも属します。

**例**

クエリ：

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' は ' : ' は属していません ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果：

```text
世界 は 世界に属しています
世界 は アメリカ合衆国には属していません
世界 は コロラド州には属していません
世界 は ボルダー郡には属していません
世界 は ボルダーには属していません
アメリカ合衆国 は 世界に属しています
アメリカ合衆国 は アメリカ合衆国に属しています
アメリカ合衆国 は コロラド州には属していません
アメリカ合衆国 は ボルダー郡には属していません
アメリカ合衆国 は ボルダーには属していません    
```

### regionHierarchy {#regionhierarchy}

UInt32 数を受け取り、地理基盤からの地域 ID を受け取ります。渡された地域とチェーン上のすべての親からなる地域 ID の配列を返します。

**構文**

```sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — 地理基盤からの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**戻り値**

- 渡された地域とそのすべての親からなる地域 ID の配列。 [Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ：

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

結果：

```text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['世界']                                                                                     │
│ [2,10,9,1]     │ ['アメリカ合衆国','北アメリカ','アメリカ','世界']                                                    │
│ [3,2,10,9,1]   │ ['コロラド州','アメリカ合衆国','北アメリカ','アメリカ','世界']                                         │
│ [4,3,2,10,9,1] │ ['ボルダー郡','コロラド州','アメリカ合衆国','北アメリカ','アメリカ','世界']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```
