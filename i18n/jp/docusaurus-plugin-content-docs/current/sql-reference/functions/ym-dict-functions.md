---
slug: /sql-reference/functions/ym-dict-functions
sidebar_position: 60
sidebar_label: 埋め込まれた辞書
---


# 埋め込まれた辞書を扱うための関数

:::note
以下の関数が機能するためには、サーバー設定で全ての埋め込まれた辞書を取得するためのパスとアドレスを指定する必要があります。辞書は、これらの関数のいずれかが最初に呼ばれた時に読み込まれます。参照リストが読み込めない場合、例外がスローされます。

したがって、このセクションに示されている例は、最初に設定されていない限り、デフォルトで [ClickHouse Fiddle](https://fiddle.clickhouse.com/) や迅速なリリースおよび生産環境のデプロイで例外をスローします。
:::

参照リストの作成についての情報は、セクション ["辞書"](../dictionaries#embedded-dictionaries) を参照してください。

## 複数の地域ベース {#multiple-geobases}

ClickHouse は、特定の地域がどの国に属するかについてのさまざまな視点をサポートするために、複数の代替地域ベース（地域階層）を同時に扱うことをサポートしています。

'clickhouse-server' 設定は、地域階層のファイルを指定します：

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

このファイルに加えて、名前に `_` 記号と任意のサフィックスが追加された近隣のファイルも検索します（ファイル拡張子の前）。たとえば、もし存在すれば `/opt/geo/regions_hierarchy_ua.txt` というファイルも見つかります。ここで `ua` は辞書キーと呼ばれます。サフィックスのない辞書の場合、キーは空文字列です。

すべての辞書は、実行時に再読み込みされます（一定の秒数ごとに、[`builtin_dictionaries_reload_interval`](../../operations/server-configuration-parameters/settings#builtin-dictionaries-reload-interval) 設定パラメータで定義されているか、デフォルトでは1時間ごとに）。ただし、使用可能な辞書のリストは、サーバー起動時に一度だけ定義されます。

地域と共に働くためのすべての関数には、最後にオプションの引数があります – 辞書キー、すなわち地域ベースと呼ばれます。

例：

```sql
regionToCountry(RegionID) – デフォルト辞書を使用：/opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – デフォルト辞書を使用：/opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 'ua'キーの辞書を使用：/opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

地域 ID と地域ベースを受け取り、対応する言語での地域名の文字列を返します。指定された ID の地域が存在しない場合は、空文字列を返します。

**構文**

```sql
regionToName(id\[, lang\])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- `geobase` で指定された対応する言語の地域名。 [String](../data-types/string)。
- それ以外の場合、空文字列。 

**例**

クエリ：

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

### regionToCity {#regiontocity}

地域ベースから地域 ID を受け取ります。この地域が都市または都市の一部である場合、対応する都市の地域 ID を返します。そうでない場合、0 を返します。

**構文**

```sql
regionToCity(id [, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 存在する場合は、適切な都市の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

**例**

クエリ：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

結果：

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

地域を地域区域（地理ベースにおけるタイプ 5）に変換します。その他の点では、この関数は ['regionToCity'](#regiontocity) と同じです。

**構文**

```sql
regionToArea(id [, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 存在する場合は、適切な地域区域の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

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

地域を連邦地区（地理ベースにおけるタイプ 4）に変換します。その他の点では、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToDistrict(id [, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 存在する場合は、適切な城市の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

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

地域を国（地理ベースにおけるタイプ 3）に変換します。その他の点では、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToCountry(id [, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 存在する場合は、適切な国の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

**例**

クエリ：

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

### regionToContinent {#regiontocontinent}

地域を大陸（地理ベースにおけるタイプ 1）に変換します。その他の点では、この関数は 'regionToCity' と同じです。

**構文**

```sql
regionToContinent(id [, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 存在する場合は、適切な大陸の地域 ID。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

**例**

クエリ：

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

### regionToTopContinent {#regiontotopcontinent}

地域の階層における最も高い大陸を見つけます。

**構文**

```sql
regionToTopContinent(id[, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 地域の階層を上るときの最上位レベルの大陸の識別子。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

**例**

クエリ：

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

### regionToPopulation {#regiontopopulation}

地域の人口を取得します。人口は地域ベースのファイルに記録される場合があります。 ["辞書"](../dictionaries#embedded-dictionaries) セクションを参照してください。地域の人口が記録されていない場合は、0 を返します。地域ベースでは、子地域用に人口が記録されている場合がありますが、親地域には記録されていない場合があります。

**構文**

```sql
regionToPopulation(id[, geobase])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 地域の人口。 [UInt32](../data-types/int-uint)。
- 存在しない場合は、0。

**例**

クエリ：

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

### regionIn {#regionin}

`lhs` 地域が `rhs` 地域に属するかどうかをチェックします。属している場合は 1 を、属していない場合は 0 を返します。

**構文**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**パラメータ**

- `lhs` — 地域ベースからの左辺地域 ID。 [UInt32](../data-types/int-uint)。
- `rhs` — 地域ベースからの右辺地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 属している場合は 1。 [UInt8](../data-types/int-uint)。
- 属していない場合は 0。

**実装の詳細**

関係は再帰的です – どの地域も自分自身に属します。

**例**

クエリ：

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

### regionHierarchy {#regionhierarchy}

UInt32 数値（地域ベースからの地域 ID）を受け取ります。渡された地域とその親すべてを含む地域 ID の配列を返します。

**構文**

```sql
regionHierarchy(id\[, geobase\])
```

**パラメータ**

- `id` — 地域ベースからの地域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 辞書キー。 [複数の地域ベース](#multiple-geobases) を参照。 [String](../data-types/string)。オプション。

**返される値**

- 渡された地域とその親すべてを含む地域 ID の配列。 [Array](../data-types/array)([UInt32](../data-types/int-uint))。

**例**

クエリ：

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
