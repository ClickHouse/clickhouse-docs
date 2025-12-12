---
description: '組み込み辞書を扱う関数のドキュメント'
sidebar_label: '組み込み辞書'
slug: /sql-reference/functions/ym-dict-functions
title: '組み込み辞書を扱う関数'
doc_type: 'reference'
---

# 埋め込みディクショナリを扱う関数 {#functions-for-working-with-embedded-dictionaries}

:::note
以下の関数が動作するためには、サーバー設定で、すべての埋め込みディクショナリを取得するためのパスとアドレスを指定しておく必要があります。ディクショナリは、これらの関数のいずれかが最初に呼び出された時点で読み込まれます。参照リストを読み込めない場合は、例外がスローされます。

そのため、このセクションで示す例は、事前に設定を行わない限り、[ClickHouse Fiddle](https://fiddle.clickhouse.com/) やクイックリリース環境および本番デプロイメント環境のデフォルト設定では、例外をスローします。
:::

参照リストの作成方法については、「[Dictionaries](../dictionaries#embedded-dictionaries)」セクションを参照してください。

## 複数のジオベース {#multiple-geobases}

ClickHouse は、複数の代替ジオベース（地域階層）を同時に扱うことをサポートしており、特定の地域がどの国に属するかについてのさまざまな見方に対応できます。

&#39;clickhouse-server&#39; の設定では、地域階層を記述したファイルを指定します。

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

このファイルに加えて、拡張子の前に `_` という文字と任意のサフィックスが付いた、同じディレクトリ内のファイルも検索されます。
たとえば、存在する場合は `/opt/geo/regions_hierarchy_ua.txt` というファイルも検出されます。ここで `ua` は辞書キーと呼ばれます。サフィックスのない辞書の場合、キーは空文字列です。

すべての辞書は実行時に再読み込みされます（[`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 設定パラメータで定義された一定秒数ごと、またはデフォルトでは 1 時間に 1 回）。ただし、利用可能な辞書の一覧は、サーバー起動時に一度だけ定義されます。

地域を扱うためのすべての関数は、末尾にオプションの引数として辞書キーを取ります。これはジオベースと呼ばれます。

例：

```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```

### regionToName {#regiontoname}

リージョン ID と geobase を受け取り、対応する言語のリージョン名を表す文字列を返します。指定された ID のリージョンが存在しない場合は、空文字列を返します。

**構文**

```

### regionToName {#regiontoname}

Accepts a region ID and geobase and returns a string of the name of the region in the corresponding language. If the region with the specified ID does not exist, an empty string is returned.

**Syntax**

```

**パラメータ**

* `id` — geobase におけるリージョン ID。 [UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。省略可能。

**戻り値**

* `geobase` で指定された対応する言語でのリージョン名。 [String](../data-types/string)。
* それ以外の場合は空文字列。

**例**

クエリ:

```
**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Name of the region in the corresponding language specified by `geobase`. [String](../data-types/string).
- Otherwise, an empty string. 

**Example**

Query:

```

結果：

```

Result:

```

### regionToCity {#regiontocity}

ジオベースからリージョン ID を受け取ります。このリージョンが都市、または都市の一部である場合は、対応する都市のリージョン ID を返します。それ以外の場合は 0 を返します。

**構文**

```

### regionToCity {#regiontocity}

Accepts a region ID from the geobase. If this region is a city or part of a city, it returns the region ID for the appropriate city. Otherwise, returns 0.

**Syntax**

```

**パラメータ**

* `id` — geobase のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。任意。

**返される値**

* 対応する都市が存在する場合は、そのリージョン ID。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate city, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果:

```

Result:

```

### regionToArea {#regiontoarea}

地域をエリア（geobase におけるタイプ 5）に変換します。それ以外の点では、この関数は [&#39;regionToCity&#39;](#regiontocity) と同様です。

**構文**

```

### regionToArea {#regiontoarea}

Converts a region to an area (type 5 in the geobase). In every other way, this function is the same as ['regionToCity'](#regiontocity).

**Syntax**

```

**パラメーター**

* `id` — geobase からのリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**返される値**

* 対応する地域が存在する場合、そのリージョン ID。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate area, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果:

```

Result:

```

### regionToDistrict {#regiontodistrict}

リージョンを、geobase におけるタイプ 4 の連邦管区に変換します。その他の点では、この関数の動作は &#39;regionToCity&#39; と同じです。

**構文**

```

### regionToDistrict {#regiontodistrict}

Converts a region to a federal district (type 4 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**パラメータ**

* `id` — geobase のリージョン ID。 [UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。 [Multiple Geobases](#multiple-geobases) を参照。 [String](../data-types/string)。省略可。

**戻り値**

* 該当する都市が存在する場合、そのリージョン ID。 [UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate city, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果:

```

Result:

```

### regionToCountry {#regiontocountry}

地域を国（geobase のタイプ 3）に変換します。それ以外の点では、この関数は `regionToCity` と同じです。

**構文**

```

### regionToCountry {#regiontocountry}

Converts a region to a country (type 3 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**パラメーター**

* `id` — ジオベース内のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 該当する国のリージョン ID（存在する場合）。[UInt32](../data-types/int-uint)。
* 該当しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate country, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果：

```

Result:

```

### regionToContinent {#regiontocontinent}

地域を大陸（geobase におけるタイプ1）に変換します。それ以外の点では、この関数は `regionToCity` と同じです。

**構文**

```

### regionToContinent {#regiontocontinent}

Converts a region to a continent (type 1 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**パラメータ**

* `id` — geobase のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[複数の Geobase](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 対応する大陸のリージョン ID が存在する場合、その値。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate continent, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果：

```

Result:

```

### regionToTopContinent {#regiontotopcontinent}

地域に対応する階層内の最上位の大陸を返します。

**構文**

```

### regionToTopContinent {#regiontotopcontinent}

Finds the highest continent in the hierarchy for the region.

**Syntax**

```

**パラメータ**

* `id` — geobase におけるリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* 最上位の大陸の識別子（リージョン階層を親方向にたどっていったときに到達する大陸）。[UInt32](../data-types/int-uint)。
* 存在しない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Identifier of the top level continent (the latter when you climb the hierarchy of regions).[UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果：

```

Result:

```

### regionToPopulation {#regiontopopulation}

指定した地域の人口を取得します。人口は geobase 対応のファイルに記録できます。セクション [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries) を参照してください。地域に対して人口が記録されていない場合は 0 を返します。geobase では、子地域には人口が記録されていても、親地域には記録されていない場合があります。

**構文**

```

### regionToPopulation {#regiontopopulation}

Gets the population for a region. The population can be recorded in files with the geobase. See the section ["Dictionaries"](../dictionaries#embedded-dictionaries). If the population is not recorded for the region, it returns 0. In the geobase, the population might be recorded for child regions, but not for parent regions.

**Syntax**

```

**パラメータ**

* `id` — geobase のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書キー。[複数の geobase](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**戻り値**

* リージョンの人口。[UInt32](../data-types/int-uint)。
* 該当するものがない場合は 0。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Population for the region. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

結果：

```

Result:

```

### regionIn {#regionin}

`lhs` のリージョンが `rhs` のリージョンに属しているかどうかをチェックします。属している場合は 1、属していない場合は 0 の UInt8 型の値を返します。

**構文**

```

### regionIn {#regionin}

Checks whether a `lhs` region belongs to a `rhs` region. Returns a UInt8 number equal to 1 if it belongs, or 0 if it does not belong.

**Syntax**

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

```

**Parameters**

- `lhs` — Lhs region ID from the geobase. [UInt32](../data-types/int-uint).
- `rhs` — Rhs region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- 1, if it belongs. [UInt8](../data-types/int-uint).
- 0, if it doesn't belong.

**Implementation details**

The relationship is reflexive – any region also belongs to itself.

**Example**

Query:

```

結果：

```

Result:

```

### regionHierarchy {#regionhierarchy}

`UInt32` 型の数値（geobase のリージョン ID）を受け取ります。指定したリージョンと、その親リージョンをチェーンに沿ってすべて含むリージョン ID の配列を返します。

**構文**

```

### regionHierarchy {#regionhierarchy}

Accepts a UInt32 number – the region ID from the geobase. Returns an array of region IDs consisting of the passed region and all parents along the chain.

**Syntax**

```

**パラメーター**

* `id` — geobase 内のリージョン ID。[UInt32](../data-types/int-uint)。
* `geobase` — 辞書のキー。[Multiple Geobases](#multiple-geobases) を参照。[String](../data-types/string)。省略可能。

**返される値**

* 渡されたリージョンおよび、その親チェーン上にあるすべての親リージョンの ID から成る配列。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Array of region IDs consisting of the passed region and all parents along the chain. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Example**

Query:

```

結果：

```

Result:

```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントに置き換えられます。
  これらのタグを変更または削除しないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
