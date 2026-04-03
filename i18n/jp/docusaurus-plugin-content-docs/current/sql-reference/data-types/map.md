---
description: 'ClickHouse の Map データ型に関するドキュメント'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---

# Map(K, V) \{#mapk-v\}

データ型 `Map(K, V)` はキーと値のペアを格納します。

他のデータベースと異なり、ClickHouse における map ではキーは一意である必要はありません。つまり、同じキーを持つ要素を 2 つ含むことができます。
（これは、map が内部的には `Array(Tuple(K, V))` として実装されているためです。）

map `m` からキー `k` に対応する値を取得するには、構文 `m[k]` を使用できます。
また、`m[k]` は map を走査するため、この操作の実行時間は map のサイズに比例します。

**パラメータ**

* `K` — Map のキーの型。[Nullable](../../sql-reference/data-types/nullable.md) と、[Nullable](../../sql-reference/data-types/nullable.md) 型をネストした [LowCardinality](../../sql-reference/data-types/lowcardinality.md) を除く任意の型。
* `V` — Map の値の型。任意の型。

**例**

map 型のカラムを持つテーブルを作成します。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

`key2` の値を選択するには:

```sql
SELECT m['key2'] FROM tab;
```

結果:

```text
┌─arrayElement(m, 'key2')─┐
│                      10 │
│                      20 │
│                      30 │
└─────────────────────────┘
```

指定したキー `k` がマップ内に含まれていない場合、`m[k]` は値型のデフォルト値を返します。例えば、整数型なら `0`、文字列型なら `''` です。
マップ内にキーが存在するかどうかを確認するには、[mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey) 関数を使用します。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

結果:

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```


## Tuple から Map への変換 \{#converting-tuple-to-map\}

`Tuple()` 型の値は、[CAST](/sql-reference/functions/type-conversion-functions#CAST) 関数を使用して `Map()` 型にキャストできます。

**例**

クエリ:

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

結果：

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```


## Map のサブカラムの読み取り \{#reading-subcolumns-of-map\}

Map 全体を読み出さずに済むように、場合によってはサブカラム `keys` と `values` を使用できます。

**例**

クエリ:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   same as mapKeys(m)
SELECT m.values FROM tab; -- same as mapValues(m)
```

結果:

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```


## MergeTree におけるバケット化マップのシリアライゼーション \{#bucketed-map-serialization\}

デフォルトでは、MergeTree の `Map` カラムは 1 つの `Array(Tuple(K, V))` ストリームとして格納されます。
`m['key']` で 1 つのキーを読み取るには、必要なのがそのキーだけであっても、カラム全体、つまりすべての行のすべてのキーと値のペアを走査する必要があります。
異なるキーが多数あるマップでは、これがボトルネックになります。

バケット化シリアライゼーション (`with_buckets`) では、キーをハッシュ化して、キーと値のペアを複数の独立したサブストリーム (バケット) に分割します。
クエリが `m['key']` にアクセスすると、そのキーを含むバケットだけがディスクから読み込まれ、他のすべてのバケットはスキップされます。

### バケット化されたシリアライゼーションを有効にする \{#enabling-bucketed-serialization\}

```sql
CREATE TABLE tab (id UInt64, m Map(String, UInt64))
ENGINE = MergeTree ORDER BY id
SETTINGS
    map_serialization_version = 'with_buckets',
    max_buckets_in_map = 32,
    map_buckets_strategy = 'sqrt';
```

挿入の速度低下を避けるため、ゼロレベルのパーツ (`INSERT` 時に作成) では `basic` シリアライゼーションを維持し、マージ後のパーツに対してのみ `with_buckets` を使うことができます：

```sql
CREATE TABLE tab (id UInt64, m Map(String, UInt64))
ENGINE = MergeTree ORDER BY id
SETTINGS
    map_serialization_version = 'with_buckets',
    map_serialization_version_for_zero_level_parts = 'basic',
    max_buckets_in_map = 32,
    map_buckets_strategy = 'sqrt';
```


### 仕組み \{#how-it-works\}

データパーツが `with_buckets` シリアライゼーションで書き込まれる場合、次のように処理されます。

1. ブロックの統計値から、1行あたりの平均キー数が計算されます。
2. バケット数は、設定された戦略に基づいて決定されます ([設定](#bucketed-map-settings)を参照) 。
3. 各キーと値のペアは、キーをハッシュ化してバケットに割り当てられます: `bucket = hash(key) % num_buckets`。
4. 各バケットは、それぞれ独自のキー、値、オフセットを持つ独立したサブストリームとして格納されます。
5. `buckets_info` メタデータストリームには、バケット数と統計値が記録されます。

クエリで特定のキー (`m['key']`) を読み取る場合、オプティマイザはこの式をキーのサブカラム (`m.key_<serialized_key>`) に書き換えます。
シリアライゼーション層は、要求されたキーが属するバケットを計算し、その1つのバケットだけをディスクから読み取ります。

マップ全体を読み取る場合 (たとえば `SELECT m`) 、すべてのバケットが読み取られ、元のマップに再構築されます。これは、複数のサブストリームの読み取りとマージのオーバーヘッドがあるため、`basic` シリアライゼーションより低速です。

バケット数はパーツごとに異なる場合があります。異なるバケット数を持つパーツがマージされると、新しいパーツのバケット数はマージ後の統計値に基づいて再計算されます。`basic` と `with_buckets` シリアライゼーションのパーツは同じテーブル内に共存でき、透過的にマージされます。

### 設定 \{#bucketed-map-settings\}

| 設定                                               | デフォルト   | 説明                                                                                                                                                                                                                     |
| ------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map_serialization_version`                      | `basic` | `Map` カラムのシリアライゼーションフォーマットです。`basic` は単一の配列ストリームとして保存します。`with_buckets` は、単一キーの読み取りを高速化するために、キーをバケットに分割します。                                                                                                                |
| `map_serialization_version_for_zero_level_parts` | `basic` | ゼロレベルのパーツ (`INSERT` で作成される) のシリアライゼーションフォーマットです。挿入時は書き込みオーバーヘッドを避けるために `basic` のままにしつつ、マージ後のパーツでは `with_buckets` を使えます。                                                                                                    |
| `max_buckets_in_map`                             | `32`    | バケット数の上限です。実際の数は `map_buckets_strategy` によって決まります。許容される最大値は 256 です。                                                                                                                                                    |
| `map_buckets_strategy`                           | `sqrt`  | 平均マップサイズからバケット数を計算する戦略です: `constant` — 常に `max_buckets_in_map` を使う; `sqrt` — `round(coefficient * sqrt(avg_size))` を使う; `linear` — `round(coefficient * avg_size)` を使う。結果は `[1, max_buckets_in_map]` の範囲に収まるように調整されます。 |
| `map_buckets_coefficient`                        | `1.0`   | `sqrt` および `linear` 戦略で使う係数です。戦略が `constant` の場合は無視されます。                                                                                                                                                               |
| `map_buckets_min_avg_size`                       | `32`    | バケット化を有効にするための、1 行あたりの平均キー数の最小値です。平均がこのしきい値を下回る場合は、他の設定に関係なく単一のバケットが使われます。しきい値を無効にするには `0` に設定します。                                                                                                                     |

### パフォーマンスのトレードオフ \{#performance-trade-offs\}

次の表は、さまざまなマップサイズ (1 行あたり 10 ～ 10,000 キー) において、`basic` シリアライゼーションと比較した `with_buckets` のパフォーマンスへの影響をまとめたものです。bucket 数は、上限を 32 とする `sqrt` 戦略で決定しています。実際の数値は、キー/値の型、データ分布、ハードウェアによって異なります。

| Operation                                      | 10 keys     | 100 keys    | 1,000 keys  | 10,000 keys | 備考                                                                                                                                 |
| ---------------------------------------------- | ----------- | ----------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Single key lookup** (`m['key']`)             | 1.6～3.2 倍高速 | 4.5～7.7 倍高速 | 16～39 倍高速   | 21～49 倍高速   | カラム全体ではなく、1 つの bucket だけを読み取ります。                                                                                                   |
| **5 key lookups**                              | 約 1 倍       | 1.5～3.1 倍高速 | 2.9～8.3 倍高速 | 4.5～6.7 倍高速 | 各キーはそれぞれの bucket を読み取ります。bucket が重複する場合もあります。                                                                                      |
| **PREWHERE** (`SELECT m WHERE m['key'] = ...`) | 1.5～3.0 倍高速 | 2.9～7.3 倍高速 | 5.3～31 倍高速  | 20～45 倍高速   | PREWHERE フィルタリングでは 1 つの bucket だけを読み取り、マッチした行に対してのみ完全なマップを読み取ります。高速化の度合いは選択性に依存します。つまり、マッチする granules が少ないほど、完全なマップの I/O は少なくなります。 |
| **Full map scan** (`SELECT m`)                 | 約 2 倍低速     | 約 2 倍低速     | 約 2 倍低速     | 約 2 倍低速     | すべての bucket を読み取って再構築する必要があります。                                                                                                    |
| **INSERT**                                     | 1.5～2.5 倍低速 | 1.5～2.5 倍低速 | 1.5～2.5 倍低速 | 1.5～2.5 倍低速 | キーのハッシュ化と複数のサブストリームへの書き込みによるオーバーヘッドがあります。                                                                                          |

### 推奨事項 \{#recommendations\}

* **小さなマップ (平均キー数が 32 未満) :** `basic` シリアライゼーションをそのまま使ってください。小さなマップでは、バケット化のオーバーヘッドに見合う効果はありません。デフォルトの `map_buckets_min_avg_size = 32` によって、これは自動的に適用されます。
* **中程度のマップ (キー数 32～100) :** クエリで個々のキーに頻繁にアクセスする場合は、`sqrt` 戦略の `with_buckets` を使ってください。単一キーのルックアップは 4～8 倍高速化します。
* **大きなマップ (キー数 100 以上) :** `with_buckets` を使ってください。単一キーのルックアップは 16～49 倍高速です。insert の速度をベースラインに近い水準に保つには、`map_serialization_version_for_zero_level_parts = 'basic'` を検討してください。
* **ワークロードの大半がマップ全体のスキャン:** `basic` をそのまま使ってください。バケット化シリアライゼーションでは、全体スキャン時に約 2 倍のオーバーヘッドが発生します。
* **混在ワークロード (一部はキールックアップ、一部は全体スキャン) :** ゼロレベルパーツを `basic` に設定したうえで、`with_buckets` を使ってください。`PREWHERE` 最適化では、まずフィルタリングに必要なバケットだけを読み取り、その後、一致した行についてのみマップ全体を読み取るため、全体として大幅な高速化が得られます。

### 代替アプローチ \{#map-alternatives\}

バケット化した`Map`のシリアライゼーションがユースケースに適さない場合、キー単位でのアクセスのパフォーマンスを向上させるための代替アプローチが2つあります。

#### JSON データ型の使用 \{#using-the-json-data-type\}

[JSON](/sql-reference/data-types/newjson) データ型は、頻出する各パスを個別の動的サブカラムとして格納します。`max_dynamic_paths` の上限を超えたパスは、[共有データ構造](/sql-reference/data-types/newjson#shared-data-structure) に格納されます。この共有データ構造では、単一パスの読み取りを最適化するために `advanced` シリアライゼーションを利用できます。`advanced` シリアライゼーションの詳しい概要については、[ブログ記事](https://clickhouse.com/blog/json-data-type-gets-even-better)を参照してください。

| 観点           | バケット化 `Map`                                                       | `JSON`                                                                                   |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 単一キーの読み取り    | 1 つのバケットを読み取ります (他のキーも含まれる場合があります) 。バケット内のすべてのキーと値のペアがデシリアライズされます。 | 頻出パスは動的サブカラムから直接読み取られます。低頻度のパスは共有データに格納され、`advanced` シリアライゼーションを使うと、対象のパスのデータだけが読み取られます。 |
| 値の型          | すべての値は同じ型 `V` を共有します                                               | 各パスはそれぞれ独自の型を持てます。型ヒントのないパスでは `Dynamic` が使われます。                                          |
| スキップ索引のサポート  | `mapKeys`/`mapValues` に対して作成された一部の索引型で利用できます                       | スキップ索引を作成できるのは特定のパスサブカラムに対してのみで、すべてのパスや値に一度に作成することはできません。                                |
| カラム全体の読み取り   | バケットを再構成する必要があるため、`basic` より約 2 倍遅くなります                            | `Dynamic` 型のエンコーディングとパスの再構成によるオーバーヘッドがあります。                                              |
| ストレージオーバーヘッド | 追加のメタデータは最小限です                                                     | `Dynamic` 型のエンコーディング、パス名の格納、および `advanced` シリアライゼーションにおける追加メタデータにより大きくなります。              |
| スキーマの柔軟性     | テーブル作成時にキーと値の型が固定されます                                              | 完全に動的で、キーと値の型は行ごとに変えられます。既知のパスについては、直接サブカラムにアクセスできるよう、型付きパスヒントを宣言できます。                   |

異なるキーごとに異なる値の型が必要な場合、キーの集合が行ごとに大きく異なる場合、または頻繁にアクセスするキーが事前に分かっており、型付きパスとして宣言してサブカラムへ直接アクセスしたい場合は、`JSON` を使います。

#### 複数のマップカラムへの手動分片 \{#manual-sharding-into-multiple-map-columns\}

アプリケーションレベルで、キーのハッシュに基づき、1 つの `Map` を複数のカラムに手動で分割できます：

```sql
CREATE TABLE tab (
    id UInt64,
    m0 Map(String, UInt64),
    m1 Map(String, UInt64),
    m2 Map(String, UInt64),
    m3 Map(String, UInt64)
) ENGINE = MergeTree ORDER BY id;
```

挿入時には、各キーと値のペアをカラム `m{hash(key) % 4}` に振り分けます。クエリ時には、対応するカラム `m{hash('target_key') % 4}['target_key']` から読み取ります。

| 観点     | バケット付き `Map`                       | 手動分片                                                |
| ------ | ---------------------------------- | --------------------------------------------------- |
| 使いやすさ  | 透過的 — ストレージエンジンが処理します              | INSERT/SELECT 用にアプリケーションレベルのルーティングロジックが必要です         |
| 垂直マージ  | サポートされていません — すべてのバケットは1つのカラムに属します | サポートされます — 各 `Map` カラムは独立したカラムであり、垂直マージできます         |
| スキーマ変更 | バケット数はパーツごとに自動調整されます               | 分片数を変更するには、データの書き換えまたは新しいカラムの追加が必要です                |
| クエリ構文  | `m['key']` をそのまま使えます               | 正しいカラムを計算して指定する必要があります: `m0['key']`, `m1['key']` など |
| バケット粒度 | パーツ単位で、データの統計値に応じて調整されます           | テーブル作成時に固定されます                                      |

手動分片は、多数のカラムを持つテーブルのマージ時にメモリ使用量を減らすうえで垂直マージが重要な場合や、分片数を固定して明示的に制御する必要がある場合に有効です。ほとんどのユースケースでは、自動バケット化シリアライゼーションのほうがシンプルで十分です。

**関連項目**

* [map()](/sql-reference/functions/tuple-map-functions#map) 関数
* [CAST()](/sql-reference/functions/type-conversion-functions#CAST) 関数
* [Map データ型向けの -Map コンビネータ](../aggregate-functions/combinators.md#-map)


## 関連コンテンツ \{#related-content\}

- ブログ記事: [Building an Observability Solution with ClickHouse - Part 2 - Traces](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)