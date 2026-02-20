---
description: '組み込み辞書を扱う関数のドキュメント'
sidebar_label: '組み込み辞書'
slug: /sql-reference/functions/ym-dict-functions
title: '組み込み辞書を扱う関数'
doc_type: 'reference'
---

# 埋め込みディクショナリを扱う関数 \{#functions-for-working-with-embedded-dictionaries\}

:::note
以下の関数が動作するためには、サーバー設定で、すべての埋め込みディクショナリを取得するためのパスとアドレスを指定しておく必要があります。ディクショナリは、これらの関数のいずれかが最初に呼び出された時点で読み込まれます。参照リストを読み込めない場合は、例外がスローされます。

そのため、このセクションで示す例は、事前に設定を行わない限り、[ClickHouse Fiddle](https://fiddle.clickhouse.com/) やクイックリリース環境および本番デプロイメント環境のデフォルト設定では、例外をスローします。
:::

参照リストの作成方法については、「[Dictionaries](../statements/create/dictionary/embedded#embedded-dictionaries)」セクションを参照してください。

## 複数のジオベース \{#multiple-geobases\}

ClickHouse は、複数の代替ジオベース（地域階層）を同時に扱うことをサポートしており、特定の地域がどの国に属するかについてのさまざまな見方に対応できます。

&#39;clickhouse-server&#39; の設定では、地域階層を記述したファイルを指定します。

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

このファイルに加えて、拡張子の前に `_` という文字と任意のサフィックスが付いた、同じディレクトリ内のファイルも検索されます。
たとえば、存在する場合は `/opt/geo/regions_hierarchy_ua.txt` というファイルも検出されます。ここで `ua` は辞書キーと呼ばれます。サフィックスのない辞書の場合、キーは空文字列です。

すべての辞書は実行時に再読み込みされます（[`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 設定パラメータで定義された一定秒数ごと、またはデフォルトでは 1 時間に 1 回）。ただし、利用可能な辞書の一覧は、サーバー起動時に一度だけ定義されます。

地域を扱うためのすべての関数は、末尾にオプションの引数として辞書キーを取ります。これはジオベースと呼ばれます。

例：

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```


### regionToName

リージョン ID と geobase を受け取り、対応する言語のリージョン名を表す文字列を返します。指定された ID のリージョンが存在しない場合は、空文字列を返します。

**構文**

```sql
regionToName(id\[, lang\])
```

**パラメータ**

* `id` — geobase におけるリージョン ID。 [UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。省略可能。

**戻り値**

* `geobase` で指定された対応する言語でのリージョン名。 [String](../data-types/string)。
* それ以外の場合は空文字列。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

結果：

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ World                                      │
│ USA                                        │
│ Colorado                                   │
│ Boulder County                             │
└────────────────────────────────────────────┘
```


### regionToCity

ジオベースからリージョン ID を受け取ります。このリージョンが都市、または都市の一部である場合は、対応する都市のリージョン ID を返します。それ以外の場合は 0 を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

* `id` — geobase のリージョン ID。 [UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。任意。

**戻り値**

* 対応する都市が存在する場合は、そのリージョン ID。 [UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

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


### regionToArea

地域をエリア（geobase におけるタイプ 5）に変換します。それ以外の点では、この関数は [&#39;regionToCity&#39;](#regiontocity) と同様です。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメーター**

* `id` — geobase からのリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**返される値**

* 対応する地域が存在する場合、そのリージョン ID。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

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


### regionToDistrict

リージョンを、geobase におけるタイプ 4 の連邦管区に変換します。その他の点では、この関数の動作は &#39;regionToCity&#39; と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメーター**

* `id` — geobase からのリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 該当する都市が存在する場合、そのリージョン ID。 [UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

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


### regionToCountry

地域を国（geobase におけるタイプ 3）に変換します。それ以外の点では、この関数は `regionToCity` と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

* `id` — ジオベース内のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 該当する国のリージョン ID（存在する場合）。[UInt32](../data-types/int-uint)。
* 該当しない場合は 0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

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


### regionToContinent

地域を大陸（geobase におけるタイプ1）に変換します。それ以外の点では、この関数は `regionToCity` と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

* `id` — geobase におけるリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 対応する大陸のリージョン ID が存在する場合、その値。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

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


### regionToTopContinent

地域に対応する階層内の最上位の大陸を返します。

**構文**

```sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

* `id` — geobase におけるリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 最上位の大陸の識別子（リージョン階層を親方向にたどっていったときに到達する大陸）。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

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


### regionToPopulation

指定した地域の人口を取得します。人口は geobase 対応のファイルに記録できます。セクション [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded#embedded-dictionaries) を参照してください。地域に対して人口が記録されていない場合は 0 を返します。geobase では、子地域には人口が記録されていても、親地域には記録されていない場合があります。

**構文**

```sql
regionToPopulation(id[, geobase])
```

**パラメータ**

* `id` — geobase のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[複数の geobase](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* リージョンの人口。[UInt32](../data-types/int-uint)。
* 該当するものがない場合は 0。

**例**

クエリ:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

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


### regionIn

`lhs` のリージョンが `rhs` のリージョンに属しているかどうかをチェックします。属している場合は 1、属していない場合は 0 の UInt8 型の値を返します。

**構文**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメーター**

* `lhs` — geobase における Lhs リージョン ID。[UInt32](../data-types/int-uint)。
* `rhs` — geobase における Rhs リージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可。

**返される値**

* 1 — 属する場合。[UInt8](../data-types/int-uint)。
* 0 — 属さない場合。

**実装の詳細**

この関係は反射律を満たします。任意のリージョンは自分自身にも属します。

**例**

クエリ:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

結果：

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


### regionHierarchy

`UInt32` 型の数値（geobase のリージョン ID）を受け取ります。指定したリージョンと、その親リージョンをチェーンに沿ってすべて含むリージョン ID の配列を返します。

**構文**

```sql
regionHierarchy(id\[, geobase\])
```

**パラメーター**

* `id` — geobase 内のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**返される値**

* 渡されたリージョンおよび、その親チェーン上にあるすべての親リージョンの ID から成る配列。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ:

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

結果：

```text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から生成されたドキュメントに置き換えられます。
  これらのタグを変更または削除しないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
