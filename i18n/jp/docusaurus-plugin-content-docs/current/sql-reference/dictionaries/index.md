---
description: 'ClickHouse での外部辞書機能の概要'
sidebar_label: '辞書の定義'
sidebar_position: 35
slug: '/sql-reference/dictionaries'
title: 'Dictionaries'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 辞書

辞書は、さまざまなタイプの参照リストに便利なマッピング (`key -> attributes`) です。

ClickHouse は、クエリで使用できる辞書の操作のための特別な関数をサポートしています。参照テーブルとの `JOIN` よりも、関数を用いた辞書の使用が簡単で効率的です。

ClickHouse では以下をサポートしています。

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込まれた辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouse の辞書を始めたばかりの方は、このトピックに関するチュートリアルがあります。[こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースは、ClickHouse テーブル、ローカルのテキストまたは実行ファイル、HTTP(S) リソース、または別の DBMS である可能性があります。詳細については、「[辞書のソース](#dictionary-sources)」をご覧ください。

ClickHouse は次のことを行います。

- 辞書を RAM に完全または部分的に保存します。
- 辞書を定期的に更新し、欠落している値を動的にロードします。言い換えれば、辞書は動的にロードされる可能性があります。
- xml ファイルまたは[DDL クエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成できます。

辞書の設定は、1つまたは複数の xml ファイルに配置できます。設定へのパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) パラメータで指定されます。

辞書は、サーバーの起動時または初回の使用時にロードされます。これは、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 設定に依存します。

[dictionaries](/operations/system-tables/dictionaries) システムテーブルには、サーバーで設定された辞書に関する情報が含まれています。各辞書に対して以下が見つかります。

- 辞書のステータス。
- 設定パラメータ。
- 辞書に割り当てられた RAM の量や、辞書が正常にロードされてからのクエリ数などのメトリクス。

<CloudDetails />
## DDL クエリで辞書を作成する {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDL クエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成でき、これは推奨される方法です。なぜなら、DDL で作成された辞書は、
- サーバー設定ファイルに追加レコードが追加されない
- 辞書はテーブルやビューと同様にファーストクラスのエンティティとして扱える
- データを辞書テーブル関数ではなく、親しみのある SELECT を用いて直接読み取ることができる
- 辞書を容易にリネームできるからです。
## 設定ファイルで辞書を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
設定ファイルを使用して辞書を作成することは ClickHouse Cloud に該当しません。上記のように DDL を使用し、ユーザー `default` として辞書を作成してください。
:::

辞書の設定ファイルは次の形式です。

```xml
<clickhouse>
    <comment>任意の内容を含むオプションの要素。ClickHouse サーバーによって無視されます。</comment>

    <!--オプション要素。置き換え可能なファイル名-->
    <include_from>/etc/metrika.xml</include_from>

    <dictionary>
        <!-- 辞書の設定。 -->
        <!-- 設定ファイル内に辞書セクションが任意の数存在することができます。 -->
    </dictionary>

</clickhouse>
```

同じファイル内で任意の数の辞書を[構成](#configuring-a-dictionary)できます。

:::note
小規模な辞書の値を変換するには、`SELECT` クエリで説明することができます (見てみる [transform](../../sql-reference/functions/other-functions.md) 関数)。この機能は辞書には関連しません。
:::
## 辞書の設定 {#configuring-a-dictionary}

<CloudDetails />

辞書が xml ファイルを使用して設定された場合、辞書の設定は以下の構造を持っています。

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複雑なキーの設定 -->
    </structure>

    <source>
      <!-- ソースの設定 -->
    </source>

    <layout>
      <!-- メモリレイアウトの設定 -->
    </layout>

    <lifetime>
      <!-- メモリ内の辞書の寿命 -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は以下の構造を持っています。

```sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複雑または単一のキー設定
SOURCE(...) -- ソース設定
LAYOUT(...) -- メモリレイアウト設定
LIFETIME(...) -- メモリ内の辞書の寿命
```
## メモリに辞書を保存する {#storing-dictionaries-in-memory}

辞書をメモリに保存するためのさまざまな方法があります。

最適な処理速度を提供する[flat](#flat)、[hashed](#hashed)、および[complex_key_hashed](#complex_key_hashed)を推奨します。

キャッシングは、パフォーマンスが悪くなる可能性や最適なパラメータの選択の難しさから推奨されません。詳細は[cache](#cache)セクションで説明しています。

辞書のパフォーマンスを向上させる方法はいくつかあります。

- `GROUP BY` の後に辞書を操作するための関数を呼び出します。
- 抽出する属性を単射としてマークします。異なるキーに対して異なる属性値が対応する場合、属性は単射と呼ばれます。したがって、`GROUP BY` がキーによって属性値を取得する関数を使用する際、この関数は自動的に `GROUP BY` から除外されます。

ClickHouse は辞書のエラーに対して例外を生成します。エラーの例：

- アクセスされている辞書をロードできませんでした。
- `cached` 辞書のクエリエラー。

辞書とそのステータスのリストは、[system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで確認できます。

<CloudDetails />

設定は次のようになります。

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- レイアウト設定 -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

`complex-key*`という単語がレイアウトに含まれていない辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*` 辞書は合成キー（複雑で、任意の型を持つ）を持っています。

[UInt64](../../sql-reference/data-types/int-uint.md) 型のキーは、XML 辞書で `<id>` タグで定義されます。

設定例（列 key_column は UInt64 型）:
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

合成 `complex` キーの XML 辞書は `<key>` タグで定義されます。

合成キーの設定例（キーが [String](../../sql-reference/data-types/string.md) 型の要素を1つ持つ場合）:
```xml
...
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
...
```
## メモリに辞書を保存する方法 {#ways-to-store-dictionaries-in-memory}

- [flat](#flat)
- [hashed](#hashed)
- [sparse_hashed](#sparse_hashed)
- [complex_key_hashed](#complex_key_hashed)
- [complex_key_sparse_hashed](#complex_key_sparse_hashed)
- [hashed_array](#hashed_array)
- [complex_key_hashed_array](#complex_key_hashed_array)
- [range_hashed](#range_hashed)
- [complex_key_range_hashed](#complex_key_range_hashed)
- [cache](#cache)
- [complex_key_cache](#complex_key_cache)
- [ssd_cache](#ssd_cache)
- [complex_key_ssd_cache](#complex_key_ssd_cache)
- [direct](#direct)
- [complex_key_direct](#complex_key_direct)
- [ip_trie](#ip_trie)

### flat {#flat}

辞書はメモリにフラットな配列の形で完全に保存されます。辞書はどれくらいのメモリを使用しますか？その量は、使用された空間内の最も大きなキーのサイズに比例します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型であり、値は `max_array_size` に制限されています（デフォルトは 500,000）。辞書を作成する際により大きなキーが発見された場合、ClickHouse は例外を発生させ、辞書を作成しません。辞書のフラット配列の初期サイズは `initial_array_size` 設定によって制御されます（デフォルトは 1024）。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）のすべてが読み込まれます。

この方法は、辞書を保存するためのすべての利用可能な方法の中で、最高のパフォーマンスを提供します。

設定例：

```xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

または

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```
### hashed {#hashed}

辞書は、メモリにハッシュテーブルの形で完全に保存されます。辞書は、任意の数の要素を含むことができます。実際には、キーの数は数千万に達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）のすべてが読み込まれます。

設定例：

```xml
<layout>
  <hashed />
</layout>
```

または

```sql
LAYOUT(HASHED())
```

設定例：

```xml
<layout>
  <hashed>
    <!-- シャードが 1 より大きい場合（デフォルトは `1`）、辞書はデータを並行処理でロードします。巨大な要素数がある辞書に便利です。 -->
    <shards>10</shards>

    <!-- 並行キュー内のブロックの待機サイズ。

         並行読み込みのボトルネックは再ハッシュであり、スレッドが再ハッシュを行っているためにプロセスが進行しないように、ある程度のバックログを保持する必要があります。

         10000はメモリと速度のバランスが良いです。
         10e10 要素の場合でも、すべての負荷を飽和することなく処理できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷係数。大きな値ではメモリがより効率的に使用されます（メモリの無駄が少なくなる）が、読み込み性能が低下する可能性があります。

         有効な値: [0.5, 0.99]
         デフォルト: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### sparse_hashed {#sparse_hashed}

`hashed` に似ていますが、メモリを少なくし、CPU 使用量を増やします。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

設定例：

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

または

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

この辞書タイプでも `shards` を使用でき、`sparse_hashed` では `hashed` より重要です。なぜなら `sparse_hashed` の方が遅いためです。

### complex_key_hashed {#complex_key_hashed}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。`hashed` に似ています。

設定例：

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### complex_key_sparse_hashed {#complex_key_sparse_hashed}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。[sparse_hashed](#sparse_hashed) に似ています。

設定例：

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### hashed_array {#hashed_array}

辞書はメモリに完全に保存されます。各属性は配列に保存されます。キー属性はハッシュテーブルの形で保存され、値は属性の配列内のインデックスです。辞書は任意の数の要素を含むことができ、実際にはキーの数は数千万に達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）のすべてが読み込まれます。

設定例：

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

または

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```
### complex_key_hashed_array {#complex_key_hashed_array}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。[hashed_array](#hashed_array) に似ています。

設定例：

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```
### range_hashed {#range_hashed}

辞書は、範囲の順序付き配列とその対応する値の形でメモリに保存されるハッシュテーブルとして保存されます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。
このストレージ方法はハッシュと同様に機能し、キーに加えて日付/時間（任意の数値型）の範囲を使うことができます。

例：テーブルには、各広告主に対する割引が次の形式で格納されています。

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields) 内で `range_min` および `range_max` 要素を定義します。これらの要素には、`name` と `type` の要素を含める必要があります（`type` が指定されていない場合、デフォルトの型が使用されます - Date）。`type` は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）を指定できます。

:::note
`range_min` および `range_max` の値は `Int64` 型に収まる必要があります。
:::

例：

```xml
<layout>
    <range_hashed>
        <!-- オーバーラップ範囲の戦略（min/max）。デフォルト: min（min(range_min -> range_max) 値を持つ一致する範囲を返す） -->
        <range_lookup_strategy>min</range_lookup_strategy>
    </range_hashed>
</layout>
<structure>
    <id>
        <name>advertiser_id</name>
    </id>
    <range_min>
        <name>discount_start_date</name>
        <type>Date</type>
    </range_min>
    <range_max>
        <name>discount_end_date</name>
        <type>Date</type>
    </range_max>
    ...
```

または

```sql
CREATE DICTIONARY discounts_dict (
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Date,
    amount Float64
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'discounts'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN discount_start_date MAX discount_end_date)
```

このような辞書で操作を行うには、`dictGet` 関数に範囲を選択するための追加の引数を渡す必要があります。

```sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリの例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された `id` と渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細：

- `id` が見つからない場合や、`id` に対する範囲が見つからない場合、属性の型のデフォルト値が返されます。
- オーバーラップする範囲があり、`range_lookup_strategy=min` の場合、一致する範囲の最小 `range_min` が返されます。同じ範囲も見つかれば、最小の `range_max` を持つ範囲が返されます。また、再度同じ範囲が見つかっても（複数の範囲が同じ `range_min` と `range_max` を持つ場合は、その中のランダムな範囲が返されます。
- オーバーラップする範囲があり、`range_lookup_strategy=max` の場合、一致する範囲の最大 `range_min` が返され、同様の条件で最小の `range_max` も返されます。
- `range_max` が `NULL` の場合、その範囲はオープンです。`NULL` は最大の可能値として扱われます。`range_min` には、`1970-01-01` または `0` (-MAX_INT) をオープン値として使用できます。

設定例：

```xml
<clickhouse>
    <dictionary>
        ...

        <layout>
            <range_hashed />
        </layout>

        <structure>
            <id>
                <name>Abcdef</name>
            </id>
            <range_min>
                <name>StartTimeStamp</name>
                <type>UInt64</type>
            </range_min>
            <range_max>
                <name>EndTimeStamp</name>
                <type>UInt64</type>
            </range_max>
            <attribute>
                <name>XXXType</name>
                <type>String</type>
                <null_value />
            </attribute>
        </structure>

    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

オーバーラップ範囲やオープン範囲の設定例：

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;

INSERT INTO discounts VALUES (1, '2015-01-01', Null, 0.1);
INSERT INTO discounts VALUES (1, '2015-01-15', Null, 0.2);
INSERT INTO discounts VALUES (2, '2015-01-01', '2015-01-15', 0.3);
INSERT INTO discounts VALUES (2, '2015-01-04', '2015-01-10', 0.4);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-15', 0.5);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-10', 0.6);

SELECT * FROM discounts ORDER BY advertiser_id, discount_start_date;
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│             1 │          2015-01-01 │              ᴺᵁᴸᴸ │    0.1 │
│             1 │          2015-01-15 │              ᴺᵁᴸᴸ │    0.2 │
│             2 │          2015-01-01 │        2015-01-15 │    0.3 │
│             2 │          2015-01-04 │        2015-01-10 │    0.4 │
│             3 │          1970-01-01 │        2015-01-15 │    0.5 │
│             3 │          1970-01-01 │        2015-01-10 │    0.6 │
└───────────────┴─────────────────────┴───────────────────┴────────┘

-- RANGE_LOOKUP_STRATEGY 'max'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'max'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲は唯一: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 一致する範囲が2つあり、範囲最小値2015-01-15 (0.2) は2015-01-01 (0.1) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 一致する範囲が2つあり、範囲最小値2015-01-04 (0.4) は2015-01-01 (0.3) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 一致する範囲が2つあり、範囲最小値が等しい場合、2015-01-15 (0.5) は2015-01-10 (0.6) より大きい
└─────┘

DROP DICTIONARY discounts_dict;

-- RANGE_LOOKUP_STRATEGY 'min'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'min'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲は唯一: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲が2つあり、範囲最小値2015-01-01 (0.1) は2015-01-15 (0.2) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 一致する範囲が2つあり、範囲最小値2015-01-01 (0.3) は2015-01-04 (0.4) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 一致する範囲が2つあり、範囲最小値が等しい場合、2015-01-10 (0.6) は2015-01-15 (0.5) より小さい
└─────┘
```
### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、順序付きの範囲配列とその対応する値の形でメモリにハッシュテーブルとして保存されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。

設定例：

```sql
CREATE DICTIONARY range_dictionary
(
  CountryID UInt64,
  CountryKey String,
  StartDate Date,
  EndDate Date,
  Tax Float64 DEFAULT 0.2
)
PRIMARY KEY CountryID, CountryKey
SOURCE(CLICKHOUSE(TABLE 'date_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
```
### cache {#cache}

辞書は、固定数のセルを持つキャッシュに保存されます。これらのセルには、頻繁に使用される要素が含まれます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際には、最初にキャッシュが検索されます。各データのブロックに対して、キャッシュに見つからないか、または古くなったすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` を使用してソースからリクエストされます。その後、受信したデータはキャッシュに書き込まれます。

辞書にキーが見つからない場合、更新キャッシュタスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 設定で制御できます。

キャッシュ辞書の場合、データの有効期限[寿命](#refreshing-dictionary-data-using-lifetime)を設定できます。キャッシュ内のセルにデータが読み込まれてから `lifetime` より時間が経過している場合、そのセルの値は使用されず、そのキーが期限切れとなります。次回使用する際にキーが再リクエストされます。この動作は、`allow_read_expired_keys` 設定で構成可能です。

これは、辞書を保存するためのすべての方法の中で最も効果的ではありません。キャッシュの速度は、正しい設定と使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合（推奨は 99％ 以上）にのみ良好に機能します。平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで確認できます。

設定 `allow_read_expired_keys` が 1 に設定されている場合（デフォルトは 0）、辞書は非同期更新をサポートします。クライアントがキーをリクエストし、すべてのキーがキャッシュ内にあるが、一部が期限切れの場合、辞書はクライアントに期限切れのキーを返し、それらを非同期でソースからリクエストします。

キャッシュのパフォーマンスを改善するには、`LIMIT` のあるサブクエリを使用し、外部で辞書を使用する関数を呼び出します。

すべてのタイプのソースがサポートされています。

設定の例：

```xml
<layout>
    <cache>
        <!-- キャッシュのサイズ（セルの数）。2 のべき乗に切り上げられます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 期限切れのキーの読み取りを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- キューに更新タスクをプッシュする際の最大タイムアウト（ミリ秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクが完了するまでの最大待機タイムアウト（ミリ秒）。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- キャッシュ辞書の更新用スレッドの最大数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分なサイズのキャッシュを設定します。セルの数を選択するには実験が必要です：

1.  いくつかの値を設定します。
2.  クエリを実行してキャッシュが完全に満杯になるまで実行します。
3.  `system.dictionaries` テーブルを使用してメモリ消費を評価します。
4.  必要なメモリ消費量が達成されるまで、セルの数を増減します。

:::note
ClickHouse をソースとして使用しないでください。ランダム読み取りを伴うクエリの処理が遅くなります。
:::
### complex_key_cache {#complex_key_cache}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。`cache` に似ています。

### ssd_cache {#ssd_cache}

`cache` に似ていますが、データを SSD に保存し、インデックスを RAM に保存します。更新キューに関連するすべてのキャッシュ辞書設定も SSD キャッシュ辞書に適用できます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

```xml
<layout>
    <ssd_cache>
        <!-- バイト単位の基本的な読み取りブロックのサイズ。SSD のページサイズと等しいことが推奨されます。 -->
        <block_size>4096</block_size>
        <!-- 最大キャッシュファイルサイズ（バイト）。 -->
        <file_size>16777216</file_size>
        <!-- SSD から要素を読み込むための RAM バッファサイズ（バイト）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSD にフラッシュする前に要素を集計するための RAM バッファサイズ（バイト）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルを保存するパス。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

または

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```
### complex_key_ssd_cache {#complex_key_ssd_cache}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。`ssd_cache` に似ています。

### direct {#direct}

辞書はメモリに保存されず、リクエストの処理中に直接ソースに移動します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプの[ソース](#dictionary-sources)、ローカルファイルを除きますがサポートされます。

設定例：

```xml
<layout>
  <direct />
</layout>
```

または

```sql
LAYOUT(DIRECT())
```
### complex_key_direct {#complex_key_direct}

このストレージタイプは合成[キー](#dictionary-key-and-fields)での使用に適しています。`direct` に似ています。

### ip_trie {#ip_trie}

このストレージタイプは、ネットワークプレフィックス（IP アドレス）を ASN などのメタデータにマッピングします。

**例**

ClickHouse に次の IP プレフィックスとマッピングを含むテーブルがあると仮定します。

```sql
CREATE TABLE my_ip_addresses (
    prefix String,
    asn UInt32,
    cca2 String
)
ENGINE = MergeTree
PRIMARY KEY prefix;
```

```sql
INSERT INTO my_ip_addresses VALUES
    ('202.79.32.0/20', 17501, 'NP'),
    ('2620:0:870::/48', 3856, 'US'),
    ('2a02:6b8:1::/48', 13238, 'RU'),
    ('2001:db8::/32', 65536, 'ZZ')
;
```

このテーブル用の `ip_trie` 辞書を定義します。`ip_trie` レイアウトは合成キーを必要データを持ちます。

```xml
<structure>
    <key>
        <attribute>
            <name>prefix</name>
            <type>String</type>
        </attribute>
    </key>
    <attribute>
            <name>asn</name>
            <type>UInt32</type>
            <null_value />
    </attribute>
    <attribute>
            <name>cca2</name>
            <type>String</type>
            <null_value>??</null_value>
    </attribute>
    ...
</structure>
<layout>
    <ip_trie>
        <!-- キー属性 `prefix` は dictGetString により取得できます。 -->
        <!-- このオプションはメモリ使用量を増加させます。 -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

または

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix String,
    asn UInt32,
    cca2 String DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(CLICKHOUSE(TABLE 'my_ip_addresses'))
LAYOUT(IP_TRIE)
LIFETIME(3600);
```

キーは、許可された IP プレフィックスを含む単一の `String` 型属性のみである必要があります。他の型はまだサポートされていません。

構文は次の通りです。

```sql
dictGetT('dict_name', 'attr_name', ip)
```

関数は IPv4 の `UInt32` または IPv6 の `FixedString(16)` を受け取ります。例えば：

```sql
SELECT dictGet('my_ip_trie_dictionary', 'cca2', toIPv4('202.79.32.10')) AS result;

┌─result─┐
│ NP     │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', 'asn', IPv6StringToNum('2001:db8::1')) AS result;

┌─result─┐
│  65536 │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', ('asn', 'cca2'), IPv6StringToNum('2001:db8::1')) AS result;

┌─result───────┐
│ (65536,'ZZ') │
└──────────────┘
```

他の型はまだサポートされていません。この関数は、この IP アドレスに対応するプレフィックスの属性を返します。オーバーラップするプレフィックスがある場合、最も特異なものが返されます。

データは完全に RAM に収まる必要があります。
```
## LIFETIMEを使用して辞書データを更新する {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒数で定義）に基づいて定期的に辞書を更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔と、キャッシュされた辞書の無効化間隔です。

更新中は、古いバージョンの辞書に対してクエリを実行することができます。辞書の更新（辞書を初めて使用するために読み込む場合を除く）は、クエリをブロックしません。更新中にエラーが発生した場合、そのエラーはサーバーログに記録され、クエリは古いバージョンの辞書を使用し続けることができます。辞書の更新が成功した場合、古いバージョンの辞書は原子的に置き換えられます。

設定の例：

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

または

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>`（`LIFETIME(0)`）を設定すると、辞書は更新されません。

更新のための時間間隔を設定することができ、ClickHouseはこの範囲内で均等にランダムな時間を選択します。これは、多数のサーバーで更新する際に辞書のソースへの負荷を分散するために必要です。

設定の例：

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

または

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>`および`<max>0</max>`の場合、ClickHouseはタイムアウトによる辞書の再読み込みを行いません。この場合、辞書の設定ファイルが変更された場合や、`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合、ClickHouseは辞書を早期に再読み込みすることができます。

辞書を更新する際、ClickHouseサーバーは[ソースの種類](#dictionary-sources)に応じて異なるロジックを適用します：

- テキストファイルの場合、最終更新時刻を確認します。時刻が以前に記録された時刻と異なる場合、辞書が更新されます。
- その他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）については、辞書が実際に変更された場合にのみ辞書を更新するクエリを設定できます。その手順は次のとおりです：

- 辞書テーブルには、ソースデータが更新されるたびに常に変更されるフィールドが必要です。
- ソースの設定には、変更フィールドを取得するクエリを指定します。ClickHouseサーバーは、クエリ結果を行として解釈し、この行が以前の状態と比較して変更されていれば辞書が更新されます。ソースの設定`<invalidate_query>`フィールドにクエリを指定します。

設定の例：

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

または

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書では、同期的更新と非同期的更新の両方がサポートされています。

`Flat`、`Hashed`、`ComplexKeyHashed`辞書では、前回の更新後に変更されたデータのみを要求することも可能です。辞書ソース設定の一部として`update_field`が指定されている場合、更新データのリクエストに前回の更新時刻の値（秒単位）が追加されます。ソースの種類に応じて（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、ODBC）、データを外部ソースからリクエストする前に`update_field`に異なるロジックが適用されます。

- ソースがHTTPの場合、`update_field`は最終更新時刻をパラメータ値として持つクエリパラメータとして追加されます。
- ソースがExecutableの場合、`update_field`は最終更新時刻を引数値として持つ実行可能スクリプトの引数として追加されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、`update_field`は最終更新時刻と比較して大なりまたは等しい追加の`WHERE`部分が作成されます。
    - デフォルトでは、この`WHERE`条件はSQLクエリの最上位レベルでチェックされます。あるいは、`{condition}`キーワードを使用してクエリの他の`WHERE`句内で条件をチェックすることもできます。例：
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

`update_field`オプションが設定されている場合、追加オプション`update_lag`を設定することもできます。`update_lag`オプションの値は、更新されたデータをリクエストする前に前回の更新時刻から引かれます。

設定の例：

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

または

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
## 辞書ソース {#dictionary-sources}

<CloudDetails />

辞書は、さまざまなソースからClickHouseに接続できます。

辞書がxmlファイルを使用して設定されている場合、設定は次のようになります：

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- ソース設定 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の設定は次のようになります：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソース設定
...
```

ソースは`source`セクションで設定されます。

ソースタイプ [Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)に対してオプション設定が可能です：

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

または

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

ソースの種類（`source_type`）：

- [Local file](#local-file)
- [Executable File](#executable-file)
- [Executable Pool](#executable-pool)
- [HTTP(S)](#https)
- DBMS
    - [ODBC](#odbc)
    - [MySQL](#mysql)
    - [ClickHouse](#clickhouse)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Cassandra](#cassandra)
    - [PostgreSQL](#postgresql)
### ローカルファイル {#local-file}

設定の例：

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

または

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

設定フィールド：

- `path` – ファイルの絶対パス。
- `format` – ファイル形式。 [Formats](/sql-reference/formats) に記載されているすべての形式がサポートされています。

`FILE`ソースを持つ辞書がDDLコマンド（`CREATE DICTIONARY ...`）を介して作成されるとき、ソースファイルは`user_files`ディレクトリに配置される必要があります。これにより、DBユーザーがClickHouseノードの任意のファイルにアクセスすることを防ぎます。

**関連情報**

- [辞書関数](/sql-reference/table-functions/dictionary)
### 実行可能ファイル {#executable-file}

実行可能ファイルとの作業は、[辞書がメモリにどのように格納されるか](#storing-dictionaries-in-memory)に依存します。辞書が`cache`および`complex_key_cache`を使用して格納されている場合、ClickHouseは必要なキーを実行可能ファイルのSTDINにリクエストを送信して要求します。そうでない場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

設定の例：

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

設定フィールド：

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`に含まれている場合）。
- `format` — ファイル形式。 [Formats](/sql-reference/formats) に記載されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み取り/書き込みループを含むべきです。辞書が破棄された後、パイプは閉じられ、実行可能ファイルはClickHouseが子プロセスにSIGTERMシグナルを送信する前に`command_termination_timeout`秒でシャットダウンする必要があります。`command_termination_timeout`は秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `command_read_timeout` - コマンドの標準出力からのデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は暗黙的に結果の行の順序によって決定されます。デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は、空白区切りで指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`です。オプションパラメータ。
- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`です。

この辞書ソースは、XML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効になっています。そうでない場合、DBユーザーはClickHouseノード上で任意のバイナリを実行できるようになります。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスのプールからデータをロードすることを可能にします。このソースは、ソースからすべてのデータをロードする必要がある辞書レイアウトでは機能しません。実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して[格納されても](#ways-to-store-dictionaries-in-memory)機能します。

実行可能プールは、指定されたコマンドのプロセスプールを生成し、それらが終了するまで実行し続けます。プログラムは、STDINからデータを読み取り、結果をSTDOUTに出力する必要があります。STDIN上で次のデータブロックを待つことができます。ClickHouseはデータブロックを処理した後、STDINを閉じることはなく、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトはこのデータ処理の方法に対応できるようにする必要があります。STDINをポーリングし、早期にデータをSTDOUTにフラッシュする必要があります。

設定の例：

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

設定フィールド：

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムのディレクトリが`PATH`に書き込まれている場合）。
- `format` — ファイル形式。 [Formats](/sql-reference/formats) に記載されているすべての形式がサポートされています。
- `pool_size` — プールのサイズ。`pool_size`に0を指定すると、プールサイズの制限がなくなります。デフォルト値は`16`です。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み取り/書き込みループを含むべきです。辞書が破棄された後、パイプは閉じられ、実行可能ファイルはClickHouseが子プロセスにSIGTERMシグナルを送信する前に`command_termination_timeout`秒でシャットダウンする必要があります。秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `max_command_execution_time` — データブロックを処理するための最大実行可能スクリプトコマンド実行時間。秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `command_read_timeout` - コマンドの標準出力からのデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は暗黙的に結果の行の順序によって決定されます。デフォルト値はfalseです。オプションパラメータ。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は、空白区切りで指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションパラメータ。
- `send_chunk_header` - データ処理の前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`です。

この辞書ソースは、XML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効になっています。そうでない場合、DBユーザーはClickHouseノード上で任意のバイナリを実行できるようになります。
### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリにどのように格納されるか](#storing-dictionaries-in-memory)に依存します。辞書が`cache`および`complex_key_cache`を使用して格納されている場合、ClickHouseは必要なキーを`POST`メソッドを使用してリクエストします。

設定の例：

```xml
<source>
    <http>
        <url>http://[::1]/os.tsv</url>
        <format>TabSeparated</format>
        <credentials>
            <user>user</user>
            <password>password</password>
        </credentials>
        <headers>
            <header>
                <name>API-KEY</name>
                <value>key</value>
            </header>
        </headers>
    </http>
</source>
```

または

```sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

ClickHouseがHTTPSリソースにアクセスできるようにするには、サーバーの設定で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)を構成する必要があります。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。 [Formats](/sql-reference/formats) に記載されているすべての形式がサポートされています。
- `credentials` – 基本HTTP認証。オプションパラメータ。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリー。オプションパラメータ。
- `header` – 単一のHTTPヘッダーエントリー。
- `name` – リクエストで送信されるヘッダーに使用される識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成するとき、HTTP辞書のリモートホストは、データベースユーザーが任意のHTTPサーバーにアクセスするのを防ぐために、設定の`remote_url_allow_hosts`セクションの内容に対して確認されます。
### DBMS {#dbms}
#### ODBC {#odbc}

ODBCドライバーを持つ任意のデータベースに接続するためにこのメソッドを使用できます。

設定の例：

```xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>ShemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
    </odbc>
</source>
```

または

```sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド：

- `db` – データベースの名前。`<connection_string>`パラメータでデータベース名が設定されている場合は省略します。
- `table` – 存在する場合のテーブル名とスキーマ名。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションパラメータ。 [LIFETIMEを使用して辞書データを更新する](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を確認してください。
- `background_reconnect` – 接続に失敗した場合にバックグラウンドでレプリカに再接続します。オプションパラメータ。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table` と `query` フィールドは一緒に使用できません。`table` または `query` フィールドのどちらかは宣言する必要があります。
:::

ClickHouseはODBCドライバーから引用記号を受け取り、クエリ内のすべての設定を引用符で囲むため、テーブル名はデータベース内のテーブル名の大文字小文字に応じて適切に設定する必要があります。

Oracleを使用する際にエンコーディングに問題がある場合は、対応する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。
##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられることがあります。この場合、`odbc.ini`からの`USERNAME`と`PASSWORD`の値がリモートサーバーに送信され、危険にさらされる可能性があります。
:::

**不安全な使用の例**

PostgreSQL用にunixODBCを構成しましょう。`/etc/odbc.ini`の内容：

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

次に、次のようなクエリを実行すると

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバーは`odbc.ini`からの`USERNAME`と`PASSWORD`の値を`some-server.com`に送信します。
##### PostgreSQLへの接続の例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCおよびPostgreSQL用のODBCドライバーをインストールします：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`を構成します（または、ClickHouseを実行しているユーザーでサインインしている場合は`~/.odbc.ini`）：

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL connection to my_db
    Driver              = PostgreSQL Unicode
    Database            = my_db
    Servername          = 127.0.0.1
    UserName            = username
    Password            = password
    Port                = 5432
    Protocol            = 9.3
    ReadOnly            = No
    RowVersioning       = No
    ShowSystemTables    = No
    ConnSettings        =
```

ClickHouseの辞書設定：

```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 次のパラメータをconnection_stringに指定できます: -->
                <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                <connection_string>DSN=myconnection</connection_string>
                <table>postgresql_table</table>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <hashed/>
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>some_column</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

おそらく、ドライバのライブラリへのフルパスを指定するために`odbc.ini`を編集する必要があります`DRIVER=/usr/local/lib/psqlodbcw.so`。
##### MS SQL Serverへの接続の例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLに接続するためのODBCドライバーをインストールします：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーを構成します：

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # test TDS connection
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
    $ isql -v MSSQL "user" "password"
```

備考：
- 特定のSQL Serverバージョンでサポートされる最も早いTDSバージョンを特定するには、製品のドキュメントを参照するか、[MS-TDS製品動作](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を確認してください。

ClickHouseでの辞書構成：

```xml
<clickhouse>
    <dictionary>
        <name>test</name>
        <source>
            <odbc>
                <table>dict</table>
                <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
            </odbc>
        </source>

        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>

        <layout>
            <flat />
        </layout>

        <structure>
            <id>
                <name>k</name>
            </id>
            <attribute>
                <name>s</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```
#### MySQL {#mysql}

設定の例：

```xml
<source>
  <mysql>
      <port>3306</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <replica>
          <host>example01-1</host>
          <priority>1</priority>
      </replica>
      <replica>
          <host>example01-2</host>
          <priority>1</priority>
      </replica>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

または

```sql
SOURCE(MYSQL(
    port 3306
    user 'clickhouse'
    password 'qwerty'
    replica(host 'example01-1' priority 1)
    replica(host 'example01-2' priority 1)
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド：

- `port` – MySQLサーバーのポート。すべてのレプリカに対して、または各レプリカ個別（`<replica>`内）に指定できます。

- `user` – MySQLユーザーの名前。すべてのレプリカに対して、または各レプリカ個別（`<replica>`内）に指定できます。

- `password` – MySQLユーザーのパスワード。すべてのレプリカに対して、または各レプリカ個別（`<replica>`内）に指定できます。

- `replica` – レプリカ構成のセクション。複数のセクションを指定できます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度に従ってレプリカを走査します。数値が小さいほど優先度が高くなります。

- `db` – データベースの名前。

- `table` – テーブルの名前。

- `where` – 選択条件。条件の構文はMySQLの`WHERE`句と同じで、例えば`id > 10 AND id < 20`のように記述されます。オプションパラメータ。

- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションパラメータ。 [LIFETIMEを使用して辞書データを更新する](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を確認してください。

- `fail_on_connection_loss` – 接続損失時のサーバーの動作を制御する設定パラメータ。`true`の場合、クライアントとサーバー間の接続が失われた瞬間に例外がスローされます。`false`の場合、ClickHouseサーバーは例外をスローする前にクエリを三回再実行します。なお、再試行は応答時間を延長する可能性があります。デフォルト値：`false`。

- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table` または `where` フィールドは`query`フィールドと一緒に使用できません。そして、`table` または `query` フィールドのいずれかは宣言する必要があります。
:::

:::note
明示的な`secure`パラメータはありません。SSL接続を確立する際にはセキュリティが必須です。
:::

MySQLには、ソケットを介してローカルホストに接続できます。これを行うには、`host`と`socket`を設定します。

設定の例：

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

または

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```
#### ClickHouse {#clickhouse}

設定の例：

```xml
<source>
    <clickhouse>
        <host>example01-01-1</host>
        <port>9000</port>
        <user>default</user>
        <password></password>
        <db>default</db>
        <table>ids</table>
        <where>id=10</where>
        <secure>1</secure>
        <query>SELECT id, value_1, value_2 FROM default.ids</query>
    </clickhouse>
</source>
```

または

```sql
SOURCE(CLICKHOUSE(
    host 'example01-01-1'
    port 9000
    user 'default'
    password ''
    db 'default'
    table 'ids'
    where 'id=10'
    secure 1
    query 'SELECT id, value_1, value_2 FROM default.ids'
));
```

設定フィールド：

- `host` – ClickHouseホスト。ローカルホストの場合、ネットワークアクティビティなしでクエリが処理されます。障害耐性を高めるために、[分散](../../engines/table-engines/special/distributed.md)テーブルを作成し、その後の設定で参照することができます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択条件。省略可能。
- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションパラメータ。 [LIFETIMEを使用して辞書データを更新する](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を確認してください。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table` または `where` フィールドは`query`フィールドと一緒に使用できません。そして、`table` または `query` フィールドのいずれかは宣言する必要があります。
:::
#### MongoDB {#mongodb}

設定の例：

```xml
<source>
    <mongodb>
        <host>localhost</host>
        <port>27017</port>
        <user></user>
        <password></password>
        <db>test</db>
        <collection>dictionary_source</collection>
        <options>ssl=true</options>
    </mongodb>
</source>
```

または

```xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

または

```sql
SOURCE(MONGODB(
    host 'localhost'
    port 27017
    user ''
    password ''
    db 'test'
    collection 'dictionary_source'
    options 'ssl=true'
))
```

設定フィールド：

- `host` – MongoDBホスト。
- `port` – MongoDBサーバーのポート。
- `user` – MongoDBユーザーの名前。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベース名。
- `collection` – コレクション名。
- `options` - MongoDB接続文字列オプション（オプションパラメータ）。

または

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド：

- `uri` - 接続を確立するためのURI。
- `collection` – コレクション名。

[エンジンに関する詳細情報](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

設定の例：

```xml
<source>
    <redis>
        <host>localhost</host>
        <port>6379</port>
        <storage_type>simple</storage_type>
        <db_index>0</db_index>
    </redis>
</source>
```

または

```sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

設定フィールド：

- `host` – Redisホスト。
- `port` – Redisサーバーのポート。
- `storage_type` – キーを使用して内部Redisストレージの構造。 `simple` は単純なソースとハッシュ化された単一キーソース用、 `hash_map` は2つのキーを持つハッシュ化されたソース用。範囲ソースおよび複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は `simple` です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。
#### Cassandra {#cassandra}

設定の例：

```xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspase>database_name</keyspase>
        <column_family>table_name</column_family>
        <allow_filtering>1</allow_filtering>
        <partition_key_prefix>1</partition_key_prefix>
        <consistency>One</consistency>
        <where>"SomeColumn" = 42</where>
        <max_threads>8</max_threads>
        <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
    </cassandra>
</source>
```

設定フィールド：

- `host` – Cassandraホストまたはカンマ区切りのホストのリスト。
- `port` – Cassandraサーバーのポート。指定しない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリー（テーブル）の名前。
- `allow_filtering` – クラスターキー列に対する高コストな条件を許可するフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルの主キーにおけるパーティションキー列の数。構成キー辞書に必要です。辞書定義でのキー列の順序はCassandraと同じでなければなりません。デフォルト値は1（最初のキー列はパーティションキーであり、他のキー列はクラスターキーです）。
- `consistency` – 一貫性レベル。可能な値： `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One` です。
- `where` – オプションの選択基準。
- `max_threads` – 複数のパーティションからデータを読み込むために使用する最大スレッド数。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`column_family` または `where` フィールドは、 `query` フィールドと一緒に使用することはできません。また、 `column_family` または `query` フィールドのいずれかは宣言する必要があります。
:::
#### PostgreSQL {#postgresql}

設定の例：

```xml
<source>
  <postgresql>
      <host>postgresql-hostname</hoat>
      <port>5432</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </postgresql>
</source>
```

または

```sql
SOURCE(POSTGRESQL(
    port 5432
    host 'postgresql-hostname'
    user 'postgres_user'
    password 'postgres_password'
    db 'db_name'
    table 'table_name'
    replica(host 'example01-1' port 5432 priority 1)
    replica(host 'example01-2' port 5432 priority 2)
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド：

- `host` – PostgreSQLサーバーのホスト。すべてのレプリカに対して指定できるか、各レプリカに個別に指定できます（ `<replica>` 内）。
- `port` – PostgreSQLサーバーのポート。すべてのレプリカに対して指定できるか、各レプリカに個別に指定できます（ `<replica>` 内）。
- `user` – PostgreSQLユーザーの名前。すべてのレプリカに対して指定できるか、各レプリカに個別に指定できます（ `<replica>` 内）。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカに対して指定できるか、各レプリカに個別に指定できます（ `<replica>` 内）。
- `replica` – レプリカ構成のセクション。複数のセクションを持つことができます：
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みるとき、ClickHouseは優先度の順序でレプリカを探索します。数字が小さいほど優先度が高くなります。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの `WHERE` 句と同じです。例えば、 `id > 10 AND id < 20` 。オプションのパラメータ。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータ。詳細はセクション [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) を参照してください。
- `background_reconnect` – 接続に失敗した場合、バックグラウンドでレプリカに再接続します。オプションのパラメータ。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table` または `where` フィールドは、 `query` フィールドと一緒に使用することはできません。また、 `table` または `query` フィールドのいずれかは宣言する必要があります。
:::
### Null {#null}

ダミー（空の）辞書を作成するために使用できる特別なソース。このような辞書はテストや、分散テーブルを持つデータノードとクエリノードが分離されているセットアップで便利です。

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```
## 辞書のキーとフィールド {#dictionary-key-and-fields}

<CloudDetails />

`structure` 句は、辞書のキーとクエリに使用可能なフィールドを説明します。

XML記述：

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- 属性パラメータ -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性は以下の要素で説明されています：

- `<id>` — キーカラム
- `<attribute>` — データカラム：複数の属性を持つことができます。

DDLクエリ：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリの本文で説明されています：

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性を持つことができます。
## キー {#key}

ClickHouseは以下のタイプのキーをサポートします：

- 数値キー。 `UInt64` 。 `<id>` タグで定義されるか、 `PRIMARY KEY` キーワードを使用します。
- 複合キー。異なるタイプの値のセット。 `<key>` タグまたは `PRIMARY KEY` キーワードで定義されます。

XML構造には `<id>` または `<key>` のいずれかを含むことができます。DDLクエリには単一の `PRIMARY KEY` を含める必要があります。

:::note
キーを属性として記述してはいけません。
:::
### 数値キー {#numeric-key}

タイプ: `UInt64`。

設定の例：

```xml
<id>
    <name>Id</name>
</id>
```

設定フィールド：

- `name` – キーを持つカラムの名前。

DDLクエリ用：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを持つカラムの名前。
### 複合キー {#composite-key}

キーは、任意のデータ型フィールドの `tuple` であることができます。この場合の [layout](#storing-dictionaries-in-memory) は `complex_key_hashed` または `complex_key_cache` にする必要があります。

:::tip
複合キーは単一の要素で構成することができます。これにより、文字列をキーとして使用することが可能です。
:::

キーの構造は `<key>` 要素で設定されます。キーのフィールドは辞書の [属性](#dictionary-key-and-fields) と同じ形式で指定されます。例：

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

または

```sql
CREATE DICTIONARY (
    field1 String,
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*` 関数へのクエリでは、タプルがキーとして渡されます。例： `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。
## 属性 {#attributes}

設定の例：

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

または

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

設定フィールド：

| タグ                                                  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 必須   |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | はい   |
| `type`                                               | ClickHouseデータ型： [UInt8](../../sql-reference/data-types/int-uint.md)、 [UInt16](../../sql-reference/data-types/int-uint.md)、 [UInt32](../../sql-reference/data-types/int-uint.md)、 [UInt64](../../sql-reference/data-types/int-uint.md)、 [Int8](../../sql-reference/data-types/int-uint.md)、 [Int16](../../sql-reference/data-types/int-uint.md)、 [Int32](../../sql-reference/data-types/int-uint.md)、 [Int64](../../sql-reference/data-types/int-uint.md)、 [Float32](../../sql-reference/data-types/float.md)、 [Float64](../../sql-reference/data-types/float.md)、 [UUID](../../sql-reference/data-types/uuid.md)、 [Decimal32](../../sql-reference/data-types/decimal.md)、 [Decimal64](../../sql-reference/data-types/decimal.md)、 [Decimal128](../../sql-reference/data-types/decimal.md)、 [Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、 [Date32](../../sql-reference/data-types/date32.md)、 [DateTime](../../sql-reference/data-types/datetime.md)、 [DateTime64](../../sql-reference/data-types/datetime64.md)、 [String](../../sql-reference/data-types/string.md)、 [Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書の値を指定されたデータ型にキャストしようとします。例えば、MySQLの場合、フィールドはMySQLのソーステーブルで `TEXT`、 `VARCHAR`、または `BLOB` ですが、ClickHouseでは `String` としてアップロードすることができます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は現在、[フラット](#flat)、 [ハッシュ化](#hashed)、 [複雑キー・ハッシュ化](#complex_key_hashed)、 [直接](#direct)、 [複雑キー・直接](#complex_key_direct)、 [範囲ハッシュ化](#range_hashed)、ポリゴン、 [キャッシュ](#cache)、[複雑キー・キャッシュ](#complex_key_cache)、 [SSDキャッシュ](#ssd_cache)、 [SSD複雑キーキャッシュ](#complex_key_ssd_cache) 辞書にサポートされています。 [IPTrie](#ip_trie) 辞書では `Nullable` タイプはサポートされていません。 | はい   |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>この例では、空の文字列です。[NULL](../syntax.md#null) 値は `Nullable` タイプにのみ使用できます（前の行のタイプ説明を参照）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい   |
| `expression`                                         | ClickHouseが値に対して実行する [式](../../sql-reference/syntax.md#expressions)。<br/>式はリモートSQLデータベース内のカラム名として使用できます。したがって、リモートカラムのエイリアスを作成するために使用できます。<br/><br/>デフォルト値：式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | いいえ |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、属性は現在のキーの親キーの値を含みます。[階層型辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値： `false` 。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | いいえ |
| `injective`                                          | `id -> attribute` 画像が [単射](https://en.wikipedia.org/wiki/Injective_function) であるかどうかを示すフラグ。<br/> `true` の場合、ClickHouseは自動的に `GROUP BY` 句の後に辞書へのリクエストを配置できます。通常、これによりそのようなリクエストの数が大幅に減少します。<br/><br/>デフォルト値： `false` 。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | いいえ |
| `is_object_id`                                       | クエリが `ObjectID` によってMongoDBドキュメントに対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値： `false` 。  
## 階層型辞書 {#hierarchical-dictionaries}

ClickHouseは [数値キー](#numeric-key) を持つ階層型辞書をサポートします。

以下の階層構造を見てください：

```text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (中心)
│
└── 4 (グレートブリテン)
    │
    └── 5 (ロンドン)
```

この階層は次の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | 中心          |
| 4          | 0              | グレートブリテン |
| 5          | 4              | ロンドン      |

このテーブルには、要素の最近接親のキーを含む `parent_region` カラムが含まれています。

ClickHouseは外部辞書の属性に階層型の特性をサポートします。この特性により、上記のように階層型辞書を設定できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 関数を使用すると、要素の親チェーンを取得できます。

私たちの例では、辞書の構造は次のようになります：

```xml
<dictionary>
    <structure>
        <id>
            <name>region_id</name>
        </id>

        <attribute>
            <name>parent_region</name>
            <type>UInt64</type>
            <null_value>0</null_value>
            <hierarchical>true</hierarchical>
        </attribute>

        <attribute>
            <name>region_name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

    </structure>
</dictionary>
```
## Polygon dictionaries {#polygon-dictionaries}

Polygon dictionariesは、指定されたポイントを含むポリゴンを効率的に検索することを可能にします。
例えば、地理座標による市の地域を定義することです。

ポリゴン辞書の設定例：

<CloudDetails />

```xml
<dictionary>
    <structure>
        <key>
            <attribute>
                <name>key</name>
                <type>Array(Array(Array(Array(Float64))))</type>
            </attribute>
        </key>

        <attribute>
            <name>name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

        <attribute>
            <name>value</name>
            <type>UInt64</type>
            <null_value>0</null_value>
        </attribute>
    </structure>

    <layout>
        <polygon>
            <store_polygon_key_column>1</store_polygon_key_column>
        </polygon>
    </layout>

    ...
</dictionary>
```

対応する [DDL-query](/sql-reference/statements/create/dictionary):
```sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

ポリゴン辞書を設定する際、キーは以下のいずれかの2つのタイプを持たなければなりません：

- 単純ポリゴン。これはポイントの配列です。
- MultiPolygon。これはポリゴンの配列です。各ポリゴンは2次元ポイントの配列であり、この配列の最初の要素はポリゴンの外境界であり、以降の要素は除外する領域を指定します。

ポイントはその座標の配列またはタプルとして指定できます。現在の実装では、2次元ポイントのみがサポートされています。

ユーザーはClickHouseがサポートするすべてのフォーマットで独自のデータをアップロードできます。

利用可能な3種類の [インメモリストレージ](#storing-dictionaries-in-memory) があります：

- `POLYGON_SIMPLE`。これはナイーブな実装で、クエリごとにすべてのポリゴンを線形に通過し、追加のインデックスを使用せずにそれぞれのメンバーシップを確認します。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して別々のインデックスが構築されており、大部分の場合に迅速にそれに属するかどうかをチェックできます（地理的地域に最適化されています）。
また、考慮対象の領域にグリッドが重ねられ、考慮すべきポリゴンの数が大幅に絞り込まれます。
グリッドはセルを16等分して再帰的に分割することによって作成され、2つのパラメータで設定されます。
再帰の深さが `MAX_DEPTH` に達するか、セルが `MIN_INTERSECTIONS` ポリゴンを超えない場合に分割が停止します。
クエリに応じて、対応するセルがあり、その中に保存されたポリゴンのインデックスが交互にアクセスされます。

- `POLYGON_INDEX_CELL`。この配置は、上記で説明したグリッドを作成します。同じオプションが利用可能です。各シートセルに対して、その中に入るすべてのポリゴンのパーツに関してインデックスが構築されており、迅速にリクエストに応答できます。

- `POLYGON`。 `POLYGON_INDEX_CELL` の同義語です。

辞書クエリは、辞書に対して操作するための標準 [関数](../../sql-reference/functions/ext-dict-functions.md) を使用して実行されます。
重要な違いは、ここでのキーがポリゴンを見つけたいポイントになることです。

**例**

上記で定義した辞書を使用する例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

'points' テーブル内の各ポイントに対して、最後のコマンドを実行した結果、一番小さいエリアのポリゴンがそのポイントを含むものが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書からカラムをSELECTクエリを介して読むことができます。辞書設定または対応するDDLクエリに `store_polygon_key_column = 1` をオンにするだけです。

クエリ：

```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

結果：

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## Regular Expression Tree Dictionary {#regexp-tree-dictionary}

正規表現ツリー辞書は、キーから属性へのマッピングを正規表現のツリーを使用して表現する特殊な辞書のタイプです。いくつかのユースケース、例えば [ユーザーエージェント](https://en.wikipedia.org/wiki/User_agent) 文字列の解析など、正規表現ツリー辞書で優雅に表現することができます。
### ClickHouse Open-Sourceで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、YAMLファイルを指定するYAMLRegExpTreeソースを使用してClickHouseオープンソースで定義されています。

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

辞書ソース `YAMLRegExpTree` は、正規表現ツリーの構造を表します。例えば：

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tcl.webkit'
      version: '12'
    - regexp: '30/tcl.webkit'
      version: '11'
    - regexp: '29/tcl.webkit'
      version: '10'
```

この構成は、正規表現ツリーのノードのリストで構成されています。各ノードは以下の構造を持っています：

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、2つの属性があります： `name` および `version` 。最初のノードは両方の属性を定義しています。2番目のノードは属性 `name` のみを定義しています。属性 `version` は2番目のノードの子ノードによって提供されます。
  - 属性の値には **バックリファレンス** が含まれる場合があり、マッチした正規表現のキャプチャグループを参照します。例として、最初のノードの属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` へのバックリファレンス `\1` で構成されます。バックリファレンスの番号は1から9までの範囲で、 `$1` または `\1`（番号1の場合）として記述されます。バックリファレンスはクエリ実行時にマッチしたキャプチャグループに置き換えられます。
- **子ノード**: 正規表現ツリーのノードの子ノードのリストで、各ノードは独自の属性と（潜在的に）子ノードを持ちます。文字列のマッチングは深さ優先方式で進行します。文字列が正規表現ノードにマッチすると、辞書はそれがノードの子ノードにもマッチするかどうかを確認します。そうであれば、最も深いマッチングノードの属性が割り当てられます。子ノードの属性は、親ノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は任意であり、上記の例の `versions` なども可能です。

Regexpツリー辞書は、`dictGet`、`dictGetOrDefault`、`dictGetAll` の関数を使用してのみアクセスできます。

例：

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

結果：

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

この場合、最初にトップレイヤーの2番目のノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` にマッチします。その後辞書は子ノードをさらに確認し、文字列が `3[12]/tclwebkit` にもマッチすることを見つけます。その結果、属性 `name` の値は `Android`（最初のレイヤーで定義されている）で、属性 `version` の値は `12`（子ノードで定義されている）になります。

強力なYAML設定ファイルを使用することで、ユーザーエージェント文字列パーサーとして正規表現ツリーディクショナリを使用できます。 [uap-core](https://github.com/ua-parser/uap-core) をサポートし、実行テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) の使用方法を示します。
#### 属性値の収集 {#collecting-attribute-values}

場合によっては、葉ノードの値だけでなく、マッチした複数の正規表現からの値を返すことが有用です。このような場合には、特別な [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 関数を使用できます。ノードに属性値がタイプ `T` の場合、`dictGetAll` はゼロ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチの数には上限はありません。制限は、`dictGetAll` にオプションの第4引数として渡すことができます。配列は _トポロジカル順序_ で格納され、子ノードが親ノードの前に、兄弟ノードはソースでの順序に従います。

例：

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml

# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

結果：

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```
#### マッチングモード {#matching-modes}

パターンマッチングの動作は、特定の辞書設定で変更できます：
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを使用します（デフォルトは `false` です）。個々の式において `(?i)` および `(?-i)` でオーバーライドできます。
- `regexp_dict_flag_dotall`: `.` が改行文字にマッチすることを許可します（デフォルトは `false` です）。
### ClickHouse Cloudで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースはClickHouseオープンソースでは機能しますが、ClickHouse Cloudでは機能しません。ClickHouse Cloudで正規表現ツリー辞書を使用するには、まずClickHouseオープンソースでYAMLファイルから正規表現ツリーディクショナリを作成し、その後、`dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してこの辞書をCSVファイルにダンプします。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSVファイルの内容は次の通りです：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプされたファイルのスキーマは次の通りです：

- `id UInt64`: RegexpTreeノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義の属性の名称。
- `values Array(String)`: ユーザー定義の属性の値。

ClickHouse Cloudで辞書を作成するには、まず以下のテーブル構造の `regexp_dictionary_source_table` を作成します：

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

その後、ローカルCSVを次のように更新します：

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

詳しくは、[ローカルファイルを挿入する方法](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルを初期化したら、テーブルソースからRegexpTreeを作成できます：

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
## Embedded Dictionaries {#embedded-dictionaries}

<SelfManaged />

ClickHouseには、ジオベースワークフローのための組み込み機能が含まれています。

これにより以下が可能になります：

- 地域のIDを使用して、希望する言語でその名前を取得します。
- 地域のIDを使用して、都市、地域、連邦地区、国、または大陸のIDを取得します。
- 地域が別の地域の一部であるかどうかを確認します。
- 親地域のチェーンを取得します。

すべての関数は「トランスローカリティ」をサポートしており、地域の所有権に関する異なる視点を同時に使用することができます。詳細については、「ウェブ分析辞書操作用の関数」セクションを参照してください。

内部辞書はデフォルトパッケージで無効になっています。
それらを有効にするには、サーバー設定ファイル内の `path_to_regions_hierarchy_file` および `path_to_regions_names_files` のパラメータのコメントを解除します。

ジオベースはテキストファイルから読み込まれます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータには `regions_hierarchy.txt` ファイルへのパス（デフォルトの地域階層）を含める必要があり、他のファイル（`regions_hierarchy_ua.txt`）は同じディレクトリに配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルは自分で作成することもできます。ファイルフォーマットは次のとおりです：

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 親地域ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 都市; 他のタイプには値はありません
- 人口 (`UInt32`) — オプションカラム

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含むことはできません（エスケープされたものでも）。

RAMに保存するためにフラットな配列が使用されています。このため、IDは百万を超えてはいけません。

辞書はサーバーを再起動することなく更新できます。ただし、利用可能な辞書のセットは更新されません。
更新では、ファイルの修正時刻がチェックされます。ファイルが変更された場合、辞書が更新されます。
変更を確認する間隔は、`builtin_dictionaries_reload_interval` パラメータで構成されます。
辞書の更新（初回使用時の読み込みを除いて）は、クエリをブロックしません。更新中は、クエリは古いバージョンの辞書を使用します。更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは古いバージョンの辞書を使用し続けます。

地理的にベースの辞書を定期的に更新することをお勧めします。更新中に新しいファイルを生成し、別の場所に書き込みます。すべてが準備が整ったら、サーバーが使用しているファイルに名前を変更します。

OS識別子や検索エンジンに関する関数もありますが、それらは使用しない方が良いです。
