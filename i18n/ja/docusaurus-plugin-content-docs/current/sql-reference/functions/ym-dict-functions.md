---
slug: /sql-reference/functions/ym-dict-functions
sidebar_position: 60
sidebar_label: 組み込み辞書
---

# 組み込み辞書を操作するための関数

:::note
以下の関数が動作するためには、サーバーの設定ですべての組み込み辞書を取得するためのパスとアドレスが指定されている必要があります。辞書は、これらの関数のいずれかが初めて呼び出された際にロードされます。参照リストをロードできない場合、例外がスローされます。

このため、このセクションで示される例は、初めて設定されない限り、[ClickHouse Fiddle](https://fiddle.clickhouse.com/) および迅速リリースおよび生産環境のデプロイメントで例外をスローします。
:::

参照リストの作成に関する情報は、セクション ["Dictionaries"](../dictionaries#embedded-dictionaries) を参照してください。

## 複数のジオベース {#multiple-geobases}

ClickHouse は、特定の地域がどの国に属するかに関するさまざまな視点をサポートするために、複数の代替ジオベース（地域階層）を同時に扱うことをサポートしています。

'clickhouse-server' 設定で地域階層を含むファイルを指定します:

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

このファイルに加えて、ファイル拡張子の前に `_` シンボルと任意のサフィックスが付けられたファイルも、その近くで検索されます。
たとえば、`/opt/geo/regions_hierarchy_ua.txt` というファイルが存在する場合、それも見つかります。ここで、`ua` は辞書キーと呼ばれます。サフィックスのない辞書の場合、キーは空文字列となります。

すべての辞書は実行中に再ロードされます（一定の秒数ごとに一度、`builtin_dictionaries_reload_interval` 設定パラメータで定義されたように、またはデフォルトで毎時一度）。ただし、利用可能な辞書のリストは、サーバーが起動したときに一度だけ定義されます。

地域を操作するためのすべての関数には、最後にオプションの引数があります - 辞書キーです。これはジオベースと呼ばれます。

例:

``` sql
regionToCountry(RegionID) – デフォルトの辞書を使用します: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – デフォルトの辞書を使用します: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 'ua' キーの辞書を使用します: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域 ID とジオベースを受け取り、対応する言語で地域の名前の文字列を返します。指定された ID の地域が存在しない場合は、空文字列が返されます。

**構文**

``` sql
regionToName(id\[, lang\])
```
**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- `geobase` で指定された対応する言語の地域の名前。 [String](../data-types/string)。
- それ以外の場合は、空文字列。

**例**

クエリ:

``` sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

結果:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ World                                      │
│ USA                                        │
│ Colorado                                   │
│ Boulder County                             │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

ジオベースから地域 ID を受け取ります。この地域が都市または都市の一部の場合、適切な都市の地域 ID を返します。それ以外の場合は、0 を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 該当する都市の地域 ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

```response
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCity(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                          │
│ World                                      │  0 │                                                          │
│ USA                                        │  0 │                                                          │
│ Colorado                                   │  0 │                                                          │
│ Boulder County                             │  0 │                                                          │
│ Boulder                                    │  5 │ Boulder                                                  │
│ China                                      │  0 │                                                          │
│ Sichuan                                    │  0 │                                                          │
│ Chengdu                                    │  8 │ Chengdu                                                  │
│ America                                    │  0 │                                                          │
│ North America                              │  0 │                                                          │
│ Eurasia                                    │  0 │                                                          │
│ Asia                                       │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

地域を地域（ジオベース内のタイプ5）に変換します。他のすべての点で、この関数は ['regionToCity'](#regiontocity) と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 該当する地域の地域 ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果:

``` text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ Moscow and Moscow region                             │
│ St. Petersburg and Leningrad region                  │
│ Belgorod region                                      │
│ Ivanovsk region                                      │
│ Kaluga region                                        │
│ Kostroma region                                      │
│ Kursk region                                         │
│ Lipetsk region                                       │
│ Orlov region                                         │
│ Ryazan region                                        │
│ Smolensk region                                      │
│ Tambov region                                        │
│ Tver region                                          │
│ Tula region                                          │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

地域を連邦地区（ジオベース内のタイプ4）に変換します。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 該当する都市の地域 ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果:

``` text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ Central federal district                                 │
│ Northwest federal district                               │
│ South federal district                                   │
│ North Caucases federal district                          │
│ Privolga federal district                                │
│ Ural federal district                                    │
│ Siberian federal district                                │
│ Far East federal district                                │
│ Scotland                                                 │
│ Faroe Islands                                            │
│ Flemish region                                           │
│ Brussels capital region                                  │
│ Wallonia                                                 │
│ Federation of Bosnia and Herzegovina                     │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

地域を国（ジオベース内のタイプ3）に変換します。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 該当する国の地域 ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ World                                      │  0 │                                                             │
│ USA                                        │  2 │ USA                                                         │
│ Colorado                                   │  2 │ USA                                                         │
│ Boulder County                             │  2 │ USA                                                         │
│ Boulder                                    │  2 │ USA                                                         │
│ China                                      │  6 │ China                                                       │
│ Sichuan                                    │  6 │ China                                                       │
│ Chengdu                                    │  6 │ China                                                       │
│ America                                    │  0 │                                                             │
│ North America                              │  0 │                                                             │
│ Eurasia                                    │  0 │                                                             │
│ Asia                                       │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

地域を大陸（ジオベース内のタイプ1）に変換します。他のすべての点で、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 該当する大陸の地域 ID（存在する場合）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ World                                      │  0 │                                                               │
│ USA                                        │ 10 │ North America                                                 │
│ Colorado                                   │ 10 │ North America                                                 │
│ Boulder County                             │ 10 │ North America                                                 │
│ Boulder                                    │ 10 │ North America                                                 │
│ China                                      │ 12 │ Asia                                                          │
│ Sichuan                                    │ 12 │ Asia                                                          │
│ Chengdu                                    │ 12 │ Asia                                                          │
│ America                                    │  9 │ America                                                       │
│ North America                              │ 10 │ North America                                                 │
│ Eurasia                                    │ 11 │ Eurasia                                                       │
│ Asia                                       │ 12 │ Asia                                                          │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

地域に対して、階層内で最も高い大陸を見つけます。

**構文**

``` sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 高レベルの大陸の識別子（地域の階層を登る際の最後の要素）。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ World                                      │  0 │                                                                  │
│ USA                                        │  9 │ America                                                          │
│ Colorado                                   │  9 │ America                                                          │
│ Boulder County                             │  9 │ America                                                          │
│ Boulder                                    │  9 │ America                                                          │
│ China                                      │ 11 │ Eurasia                                                          │
│ Sichuan                                    │ 11 │ Eurasia                                                          │
│ Chengdu                                    │ 11 │ Eurasia                                                          │
│ America                                    │  9 │ America                                                          │
│ North America                              │  9 │ America                                                          │
│ Eurasia                                    │ 11 │ Eurasia                                                          │
│ Asia                                       │ 11 │ Eurasia                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

地域の人口を取得します。人口はジオベース内のファイルに記録されることがあります。詳細はセクション ["Dictionaries"](../dictionaries#embedded-dictionaries) を参照してください。地域の人口が記録されていない場合は、0 を返します。ジオベース内では、人口は子地域に対して記録されることがありますが、親地域に対しては記録されない場合があります。

**構文**

``` sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 地域の人口。 [UInt32](../data-types/int-uint)。
- 0、存在しない場合。

**例**

クエリ:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ World                                      │ 4294967295 │
│ USA                                        │  330000000 │
│ Colorado                                   │    5700000 │
│ Boulder County                             │     330000 │
│ Boulder                                    │     100000 │
│ China                                      │ 1500000000 │
│ Sichuan                                    │   83000000 │
│ Chengdu                                    │   20000000 │
│ America                                    │ 1000000000 │
│ North America                              │  600000000 │
│ Eurasia                                    │ 4294967295 │
│ Asia                                       │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

`lhs` 地域が `rhs` 地域に属しているかどうかをチェックします。属している場合は1に等しい UInt8 数値を返し、属していない場合は0を返します。

**構文**

``` sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — ジオベースからの Lhs 地域 ID。 [UInt32](../data-types/int-uint)。
- `rhs` — ジオベースからの Rhs 地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 属している場合は 1。 [UInt8](../data-types/int-uint)。
- 属していない場合は 0。

**実装詳細**

関係は自反的であり、任意の地域も自分に属します。

**例**

クエリ:

``` sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果:

``` text
World is in World
World is not in USA
World is not in Colorado
World is not in Boulder County
World is not in Boulder
USA is in World
USA is in USA
USA is not in Colorado
USA is not in Boulder County
USA is not in Boulder    
```

### regionHierarchy {#regionhierarchy}

UInt32 数値 – ジオベースからの地域 ID を受け取ります。渡された地域とそのチェーンに沿ったすべての親からなる地域 ID の配列を返します。

**構文**

``` sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — ジオベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照してください。 [String](../data-types/string)。 オプション。

**返される値**

- 渡された地域とそのチェーンに沿ったすべての親から構成される地域 ID の配列。 [Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ:

``` sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

結果:

``` text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```
