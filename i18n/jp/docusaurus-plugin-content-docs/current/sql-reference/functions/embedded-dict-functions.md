---
'description': 'Embedded Dictionaries に関する Functions のドキュメント'
'sidebar_label': 'Embedded dictionary'
'slug': '/sql-reference/functions/ym-dict-functions'
'title': '組み込み辞書での操作用関数'
'doc_type': 'reference'
---



# 埋め込み辞書を操作するための関数

:::note
以下の関数が動作するためには、サーバーの設定がすべての埋め込み辞書を取得するためのパスとアドレスを指定する必要があります。辞書は、これらの関数の最初の呼び出し時に読み込まれます。参照リストが読み込まれない場合、例外がスローされます。

そのため、このセクションで示す例は、最初に構成されていない限り、[ClickHouse Fiddle](https://fiddle.clickhouse.com/)やクイックリリースおよび本番デプロイメントではデフォルトで例外をスローします。
:::

参照リストの作成については、セクション ["Dictionaries"](../dictionaries#embedded-dictionaries) を参照してください。

## 複数のジオベース {#multiple-geobases}

ClickHouseは、特定の地域がどの国に属するかについてのさまざまな観点をサポートするために、同時に複数の代替ジオベース（地域階層）での作業をサポートしています。

'clickhouse-server'の設定では、地域階層を含むファイルが指定されます。

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域IDとジオベースを受け取り、対応する言語での地域名の文字列を返します。指定されたIDの地域が存在しない場合は、空の文字列が返されます。

**構文**

```sql
regionToName(id\[, lang\])
```
**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- `geobase`で指定された言語の地域名。[String](../data-types/string)。
- そうでない場合は、空の文字列。 

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

結果:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ World                                      │
│ USA                                        │
│ Colorado                                   │
│ Boulder County                             │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

ジオベースからの地域IDを受け取ります。この地域が都市または都市の一部である場合、適切な都市の地域IDを返します。そうでない場合は、0を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 存在する場合の適切な都市の地域ID。[UInt32](../data-types/int-uint)。
- 無ければ0。

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

地域を区域（ジオベースでのタイプ5）に変換します。その他の点では、この関数は['regionToCity'](#regiontocity)と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 存在する場合の適切な区域の地域ID。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果:

```text
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

地域を連邦地区（ジオベースでのタイプ4）に変換します。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 存在する場合の適切な都市の地域ID。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

結果:

```text
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

地域を国（ジオベースでのタイプ3）に変換します。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 存在する場合の適切な国の地域ID。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

```text
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

地域を大陸（ジオベースでのタイプ1）に変換します。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 存在する場合の適切な大陸の地域ID。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

```text
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

地域に対する階層の中で最も高い大陸を見つけます。

**構文**

```sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 階層を登っていくうちに得られる最上位の大陸の識別子。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

```text
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

地域の人口を取得します。人口はジオベースを含むファイルに記録される可能性があります。セクション ["Dictionaries"](../dictionaries#embedded-dictionaries)を参照してください。地域の人口が記録されていない場合、0を返します。ジオベースでは、人口は子地域に記録されることがありますが、親地域には記録されていないことがあります。

**構文**

```sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 地域の人口。[UInt32](../data-types/int-uint)。
- 無ければ0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果:

```text
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

`lhs`地域が`rhs`地域に属しているかどうかをチェックします。属している場合は1、属していない場合は0に等しいUInt8番号を返します。

**構文**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — ジオベースのLhs地域ID。[UInt32](../data-types/int-uint)。
- `rhs` — ジオベースのRhs地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 属していれば1。[UInt8](../data-types/int-uint)。
- 属していなければ0。

**実装の詳細**

関係は反射的です - 任意の地域は自分自身にも属します。

**例**

クエリ:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果:

```text
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

UInt32の数字（ジオベースからの地域ID）を受け取ります。渡された地域とチェーンに沿ったすべての親からなる地域IDの配列を返します。

**構文**

```sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — ジオベースの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases)を参照。 [String](../data-types/string)。オプションです。

**返される値**

- 渡された地域とチェーンに沿ったすべての親からなる地域IDの配列。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ:

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

結果:

```text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
以下のタグの内部コンテンツはシステムの関数から生成されたドキュメントでビルド時に置き換えられます。タグを変更したり削除したりしないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
