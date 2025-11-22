---
description: '組み込みディクショナリを操作する関数に関するドキュメント'
sidebar_label: '組み込みディクショナリ'
slug: /sql-reference/functions/ym-dict-functions
title: '組み込みディクショナリを操作する関数'
doc_type: 'reference'
---



# 組み込みディクショナリを扱うための関数

:::note
以下の関数を動作させるには、サーバー設定で、すべての組み込みディクショナリを取得するためのパスとアドレスを指定しておく必要があります。これらのディクショナリは、これらの関数のいずれかが最初に呼び出されたときに読み込まれます。参照リストを読み込めない場合は、例外がスローされます。

そのため、このセクションで示すサンプルは、事前に設定を行わない限り、デフォルトでは [ClickHouse Fiddle](https://fiddle.clickhouse.com/) やクイックリリースおよび本番デプロイメントで例外をスローします。
:::

参照リストの作成方法については、["Dictionaries"](../dictionaries#embedded-dictionaries) セクションを参照してください。



## 複数のジオベース {#multiple-geobases}

ClickHouseは、特定の地域がどの国に属するかについての様々な観点をサポートするために、複数の代替ジオベース(地域階層)を同時に使用できます。

'clickhouse-server'の設定ファイルで地域階層ファイルを指定します:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

このファイルに加えて、ファイル名(拡張子の前)に`_`記号と任意の接尾辞が付加されたファイルも同じディレクトリ内で検索されます。
例えば、`/opt/geo/regions_hierarchy_ua.txt`というファイルが存在する場合、それも検出されます。ここで`ua`は辞書キーと呼ばれます。接尾辞のない辞書の場合、キーは空文字列になります。

すべての辞書は実行時に再読み込みされます([`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval)設定パラメータで定義された一定秒数ごと、またはデフォルトでは1時間ごと)。ただし、利用可能な辞書のリストは、サーバー起動時に一度だけ定義されます。

地域を扱うすべての関数には、末尾にオプション引数として辞書キーがあります。これはジオベースと呼ばれます。

例:

```sql
regionToCountry(RegionID) – デフォルト辞書を使用: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – デフォルト辞書を使用: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 'ua'キーの辞書を使用: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域IDとジオベースを受け取り、対応する言語での地域名の文字列を返します。指定されたIDの地域が存在しない場合は、空文字列が返されます。

**構文**

```sql
regionToName(id\[, lang\])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- `geobase`で指定された対応する言語での地域名。[String](../data-types/string)。
- それ以外の場合は、空文字列。

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

ジオベースから地域IDを受け取ります。この地域が都市または都市の一部である場合、対応する都市の地域IDを返します。それ以外の場合は0を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- 対応する都市の地域ID(存在する場合)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

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

地域をエリア(ジオベースのタイプ5)に変換します。その他の点では、この関数は['regionToCity'](#regiontocity)と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- 該当するエリアの地域ID(存在する場合)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ:

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Result:

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

地域を連邦管区(ジオベースのタイプ4)に変換します。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- 該当する都市の地域ID(存在する場合)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

**例**

クエリ:

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Result:

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

地域を国(ジオベースのタイプ3)に変換します。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**


- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**返される値**

- 該当する国の地域ID(存在する場合)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

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

地域を大陸に変換します(ジオベースのタイプ1)。その他の点では、この関数は'regionToCity'と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**返される値**

- 該当する大陸の地域ID(存在する場合)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

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

地域の階層における最上位の大陸を検索します。

**構文**

```sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — ジオベースからの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のジオベース](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**返される値**

- 最上位の大陸の識別子(地域の階層を上っていった際の最後のもの)。[UInt32](../data-types/int-uint)。
- 存在しない場合は0。

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

地域の人口を取得します。人口はgeobaseのファイルに記録できます。["辞書"](../dictionaries#embedded-dictionaries)のセクションを参照してください。地域の人口が記録されていない場合は0を返します。geobaseでは、子地域には人口が記録されていても、親地域には記録されていない場合があります。

**構文**

```sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — geobaseの地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のGeobase](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- 地域の人口。[UInt32](../data-types/int-uint)。
- 記録されていない場合は0。

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

`lhs`地域が`rhs`地域に属しているかどうかを確認します。属している場合は1、属していない場合は0のUInt8数値を返します。

**構文**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — geobaseの左辺地域ID。[UInt32](../data-types/int-uint)。
- `rhs` — geobaseの右辺地域ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数のGeobase](#multiple-geobases)を参照してください。[String](../data-types/string)。オプション。

**戻り値**

- 属している場合は1。[UInt8](../data-types/int-uint)。
- 属していない場合は0。

**実装の詳細**

この関係は反射的です。つまり、すべての地域は自分自身にも属します。

**例**

クエリ:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果:


```text
World は World に含まれる
World は USA に含まれない
World は Colorado に含まれない
World は Boulder County に含まれない
World は Boulder に含まれない
USA は World に含まれる
USA は USA に含まれる
USA は Colorado に含まれない
USA は Boulder County に含まれない
USA は Boulder に含まれない
```

### regionHierarchy {#regionhierarchy}

geobase の地域 ID である UInt32 の数値を受け取ります。渡された地域とその階層上のすべての親地域で構成される地域 ID の配列を返します。

**構文**

```sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — geobase の地域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。[複数の Geobase](#multiple-geobases) を参照してください。[String](../data-types/string)。省略可能。

**返される値**

- 渡された地域とその階層上のすべての親地域で構成される地域 ID の配列。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

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
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
