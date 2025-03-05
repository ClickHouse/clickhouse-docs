---
slug: /sql-reference/dictionaries
sidebar_label: 辞書の定義
sidebar_position: 35
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 辞書

辞書は、さまざまなタイプの参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリで使用できる辞書に対して特別な関数をサポートしています。辞書を関数と共に使用する方が、参照テーブルとの`JOIN`よりも簡単かつ効率的です。

ClickHouseは次の機能をサポートしています:

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouseで辞書を始める場合は、そのトピックを扱ったチュートリアルがあります。 [こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースは、ClickHouseのテーブル、ローカルのテキストまたは実行可能ファイル、HTTP(S)リソース、または他のDBMSである可能性があります。詳細については、"[辞書のソース](#dictionary-sources)"を参照してください。

ClickHouseは:

- 辞書をRAMに完全または部分的に保存します。
- 定期的に辞書を更新し、欠落している値を動的にロードします。つまり、辞書は動的に読み込むことができます。
- xmlファイルや[DDLクエリ](../../sql-reference/statements/create/dictionary.md)によって辞書を作成することを許可します。

辞書の設定は1つまたは複数のxmlファイルに配置できます。設定へのパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定されます。

辞書はサーバーの起動時または初回使用時に読み込まれることがあり、これは[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定に依存します。

[dictionaries](../../operations/system-tables/dictionaries.md#system_tables-dictionaries)システムテーブルには、サーバーで設定された辞書に関する情報が含まれています。各辞書について、以下の情報を見つけることができます:

- 辞書の状態。
- 設定パラメータ。
- 辞書が正常に読み込まれてからのクエリの数や、辞書に割り当てられたRAMの量などのメトリック。

<CloudDetails />
## DDLクエリで辞書を作成する {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成することができ、これは推奨される方法です。なぜなら、DDLで作成された辞書は以下のような利点があるからです:
- サーバーの設定ファイルに追加のレコードが追加されない
- 辞書はテーブルやビューのような第一級エンティティとして扱える
- データは辞書テーブル関数ではなく、馴染みのあるSELECTを使用して直接読み取ることができる
- 辞書の名前を簡単に変更することができる

## 設定ファイルで辞書を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
設定ファイルで辞書を作成することはClickHouse Cloudには適用されません。上記のDDLを使用し、ユーザー`default`として辞書を作成してください。
:::

辞書設定ファイルは以下のフォーマットを持っています:

``` xml
<clickhouse>
    <comment>任意の内容を持つオプションの要素。ClickHouseサーバーによって無視されます。</comment>

    <!--オプションの要素。置換を含むファイル名-->
    <include_from>/etc/metrika.xml</include_from>

    <dictionary>
        <!-- 辞書の設定。 -->
        <!-- 設定ファイル内には辞書セクションの数に制限はありません。 -->
    </dictionary>

</clickhouse>
```

同じファイル内で任意の数の辞書を[設定](#configuring-a-dictionary)できます。

:::note
小規模な辞書の値を変換する場合は、`SELECT`クエリでそれを記述することができます（[transform](../../sql-reference/functions/other-functions.md)関数を参照）。この機能は辞書には関連していません。
:::

## 辞書の設定 {#configuring-a-dictionary}

<CloudDetails />

辞書がxmlファイルを使用して設定されている場合、辞書設定は以下の構造を持ちます:

``` xml
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
      <!-- 辞書のメモリ内での寿命 -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は以下の構造を持ちます:

``` sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複雑または単一のキー設定
SOURCE(...) -- ソース設定
LAYOUT(...) -- メモリレイアウトの設定
LIFETIME(...) -- 辞書のメモリ内での寿命
```

## メモリ内の辞書の保存 {#storing-dictionaries-in-memory}

辞書をメモリに保存する方法は多様です。

最適な処理速度を提供するため、[flat](#flat)、[hashed](#hashed)および[complex_key_hashed](#complex_key_hashed)を推奨します。

キャッシングはパフォーマンスが悪化する可能性があるため推奨されません。詳細は、[cache](#cache)セクションを参照してください。

辞書のパフォーマンスを向上させるための方法はいくつかあります：

- `GROUP BY`の後に辞書を操作するための関数を呼び出します。
- 抽出する属性をinjectiveとしてマークします。異なるキーが異なる属性値に対応する場合、その属性はinjectiveと呼ばれます。したがって、`GROUP BY`がキーによって属性値を取得する関数を使用すると、この関数は自動的に`GROUP BY`から除外されます。

ClickHouseは辞書に関するエラーについて例外を生成します。エラーの例：

- アクセスしている辞書を読み込むことができませんでした。
- `cached`辞書のクエリエラー。

辞書とそのステータスのリストは、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

<CloudDetails />

設定は以下のようになります:

``` xml
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

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

`complex-key*`という単語がレイアウトに含まれない辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`辞書は複合キー（複雑な、任意の型）を持ちます。

XML辞書内の[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されます。

設定例（カラムkey_columnはUInt64型）:
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合的`complex`キーXML辞書は`<key>`タグで定義されます。

複合キーの設定例（キーが[String](../../sql-reference/data-types/string.md)型の1つの要素を持つ）:
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
## メモリ内の辞書を保存する方法 {#ways-to-store-dictionaries-in-memory}

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

辞書は完全にメモリにフラット配列の形で保存されます。辞書はどれだけのメモリを使用しますか？その量は最大のキーのサイズに比例します（使用される空間）。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型で、値は`max_array_size`（デフォルトは500,000）に制限されています。辞書を作成する際に、より大きなキーが発見された場合、ClickHouseは例外を投げ、辞書を作成しません。辞書のフラット配列の初期サイズは`initial_array_size`設定（デフォルトは1024）で制御されます。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）はすべて読み取られます。

この方法は、辞書の保存方法の中で最も優れたパフォーマンスを提供します。

設定例:

``` xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

または

``` sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```
### hashed {#hashed}

辞書は完全にメモリにハッシュテーブルの形で保存されます。辞書は任意の数の要素を持つことができます。実際には、キーの数は数千万に達する可能性があります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）はすべて読み取られます。

設定例:

``` xml
<layout>
  <hashed />
</layout>
```

または

``` sql
LAYOUT(HASHED())
```

設定例:

``` xml
<layout>
  <hashed>
    <!-- シャードが1より大きい場合（デフォルトは`1`）、辞書は
         大量の要素を持つ場合に便利な並列でデータをロードします。 -->
    <shards>10</shards>

    <!-- 並列キューのブロック用のバックログのサイズ。

         並列読み込みのボトルネックはrehashであり、rehashを行っているスレッドで
         停滞しないようにするためには、バックログを持つ必要があります。

         10000はメモリと速度のバランスが良いです。
         10e10要素の場合でも、飢餓を感じることなくすべての向きを処理することができます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大ロードファクタ。値が大きいほど、メモリが
         より効率的に利用されますが（メモリの無駄が少なくなります）、
         読み取り/パフォーマンスが悪化する可能性があります。

         有効な値: [0.5, 0.99]
         デフォルト: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### sparse_hashed {#sparse_hashed}

`hashed`に似ていますが、CPU使用量が多くなる代わりにメモリの使用量が少なくなります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

設定例:

``` xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

または

``` sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

このタイプの辞書には`shards`を使用することも可能ですが、`sparse_hashed`の方が重要です。なぜなら、`sparse_hashed`は遅くなるからです。
### complex_key_hashed {#complex_key_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`hashed`に似ています。

設定例:

``` xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### complex_key_sparse_hashed {#complex_key_sparse_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`sparse_hashed`に似ています。

設定例:

``` xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### hashed_array {#hashed_array}

辞書は完全にメモリに保存されます。各属性は配列内に保存され、キー属性はハッシュテーブルの形で保存され、値は属性配列内のインデックスです。辞書は任意の数の要素を持つことができ、実際にはキーの数は数千万に達する可能性があります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）はすべて読み取られます。

設定例:

``` xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

または

``` sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```
### complex_key_hashed_array {#complex_key_hashed_array}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`hashed_array`に似ています。

設定例:

``` xml
<layout>
  <complex_key_hashed_array />
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```
### range_hashed {#range_hashed}

辞書は、範囲の対応する値の配列の順序付けされた数を格納する形でメモリに格納されます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。
このストレージ方法は、hasheeと同様に機能し、キーの他に日付/時間（任意の数値型）の範囲の使用も許可します。

例: テーブルには次の形式の各広告主の割引が含まれています:

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields)内で`range_min`および`range_max`要素を定義します。これらの要素は`name`と`type`の要素を持っている必要があります（`type`が指定されていない場合は、デフォルトの型（日付）を使用します）。`type`は任意の数値型（日付/日時/UInt64/Int32/その他）になることができます。

:::note
`range_min`と`range_max`の値は`Int64`型に収まる必要があります。
:::

例:

``` xml
<layout>
    <range_hashed>
        <!-- 重複する範囲に対する戦略（最小/最大）。デフォルト: min（min(range_min -> range_max)値を持つ一致する範囲を返す） -->
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

``` sql
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

これらの辞書を操作するには、`dictGet`関数に追加の引数を渡す必要があります。この引数は選択された範囲です。

``` sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリの例:

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された`id`の値と、渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細:

- `id`が見つからない場合や、`id`に対する範囲が見つからない場合は、属性の型のデフォルト値を返します。
- 重複する範囲があり、`range_lookup_strategy=min`の場合、一致する範囲の最小`range_min`を返します。複数の範囲が見つかった場合は、最小の`range_max`を持つ範囲を返し、さらに複数の範囲が見つかった場合（同一の`range_min`と`range_max`を持つ複数の範囲があった場合）、その範囲のうちのランダムな範囲を返します。
- 重複する範囲があり、`range_lookup_strategy=max`の場合、一致する範囲の最大`range_min`を返します。複数の範囲が見つかった場合は、最大の`range_max`を持つ範囲を返し、さらに複数の範囲が見つかった場合（同一の`range_min`と`range_max`を持つ複数の範囲があった場合）、その範囲のうちのランダムな範囲を返します。
- `range_max`が`NULL`である場合、その範囲はオープンです。`NULL`は可能な最大値と見なされます。`range_min`には`1970-01-01`または`0`（-MAX_INT）をオープン値として使用できます。

設定例:

``` xml
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

``` sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

重複する範囲やオープン範囲の設定例:

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
│ 0.1 │ -- 一致する範囲は1つだけ: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 一致する範囲が2つあり、range_min 2015-01-15 (0.2)は2015-01-01 (0.1)よりも大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 一致する範囲が2つあり、range_min 2015-01-04 (0.4)は2015-01-01 (0.3)よりも大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 一致する範囲が2つあり、range_minが等しい場合、2015-01-15 (0.5)は2015-01-10 (0.6)よりも大きい
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
│ 0.1 │ -- 一致する範囲は1つだけ: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.1)は2015-01-15 (0.2)よりも小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.3)は2015-01-04 (0.4)よりも小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 一致する範囲が2つあり、range_minが等しい場合、2015-01-10 (0.6)は2015-01-15 (0.5)よりも小さい
└─────┘
```
### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、重複した範囲とその対応する値の順序付けされた配列の形でメモリに保存されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)を使用するためのものです。

設定例:

``` sql
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

辞書は固定数のセルを持つキャッシュに格納されます。これらのセルには、頻繁に使用される要素が含まれます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際は、最初にキャッシュが検索されます。データの各ブロックについて、キャッシュに見つからなかったすべてのキーまたは古いキーは、ソースから `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を使用して要求されます。受け取ったデータはその後、キャッシュに書き込まれます。

辞書内でキーが見つからない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューの特性は、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定で制御できます。

キャッシュ辞書の場合、キャッシュ内のデータの有効期限[ライフタイム](#refreshing-dictionary-data-using-lifetime)を設定できます。セルにデータが読み込まれてから`lifetime`よりも長く経過した場合、そのセルの値は使用されず、キーは期限切れになります。次回使用する必要があるときにキーが再要求されます。この動作は設定`allow_read_expired_keys`で構成できます。

これは、すべての辞書の保存方法の中で最も効果が薄いです。キャッシュの速度は正しい設定と使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合（推奨99％以上）に優れた性能を発揮します。平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

設定`allow_read_expired_keys`が1に設定されている場合は（デフォルトは0）、辞書は非同期の更新をサポートできます。クライアントがキーを要求し、すべてがキャッシュにあるが、その中のいくつかが期限切れの場合、辞書はクライアントに期限切れのキーを返し、ソースから非同期でそれらを要求します。

キャッシュ性能を向上させるために、`LIMIT`を使用した副問い合わせを使用し、辞書を外部で呼び出す関数を使用します。

すべてのタイプのソースがサポートされています。

設定例:

``` xml
<layout>
    <cache>
        <!-- キャッシュのサイズ（セルの数）。2の累乗に切り上げられます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 期限切れのキーを読み取ることを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- キューに更新タスクを追加するための最大タイムアウト（ミリ秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクが完了するのを待つための最大タイムアウト（ミリ秒）。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- キャッシュ辞書の更新用の最大スレッド数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

``` sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分に大きなキャッシュサイズを設定してください。セルの数を選択するには実験が必要です：

1.  何らかの値を設定する。
2.  キャッシュが完全に満たされるまでクエリを実行する。
3.  `system.dictionaries`テーブルを使用してメモリ使用量を評価する。
4.  必要なメモリ使用量に達するまでセルの数を増減する。

:::note
ClickHouseをソースとして使用しないでください。ランダムリードを持つクエリを処理するのは遅くなります。
:::
### complex_key_cache {#complex_key_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`cache`に似ています。
### ssd_cache {#ssd_cache}

`cache`に似ていますが、データをSSDに保存し、インデックスをRAMに格納します。更新キューに関連するキャッシュ辞書のすべての設定もSSDキャッシュ辞書に適用できます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

``` xml
<layout>
    <ssd_cache>
        <!-- 読み取りブロックのサイズ（バイト）。SSDのページサイズに等しくなることを推奨します。 -->
        <block_size>4096</block_size>
        <!-- 最大キャッシュファイルサイズ（バイト）。 -->
        <file_size>16777216</file_size>
        <!-- SSDから要素を読み取るためのRAMバッファのサイズ（バイト）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSDに書き込む前に要素を集約するためのRAMバッファのサイズ（バイト）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルが保存されるパス。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

または

``` sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```
### complex_key_ssd_cache {#complex_key_ssd_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`ssd_cache`に似ています。
### direct {#direct}

辞書はメモリに保存されず、リクエストの処理中にソースに直接アクセスします。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべての[ソース](#dictionary-sources)のタイプがサポートされていますが、ローカルファイルは例外です。

設定例:

``` xml
<layout>
  <direct />
</layout>
```

または

``` sql
LAYOUT(DIRECT())
```
### complex_key_direct {#complex_key_direct}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)の使用に適しています。`direct`に似ています。
### ip_trie {#ip_trie}

このストレージタイプは、ネットワークプレフィックス（IPアドレス）をASNなどのメタデータにマッピングします。

**例**

ClickHouseに自分のIPプレフィックスとマッピングを含むテーブルがあると仮定しましょう:

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

このテーブル用に`ip_trie`辞書を定義しましょう。`ip_trie`レイアウトには複合キーが必要です:

``` xml
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
        <!-- キー属性`prefix`はdictGetStringを介して取得できます。 -->
        <!-- このオプションはメモリ使用量を増加させます。 -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

または

``` sql
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

キーは許可されたIPプレフィックスを含む1つの`String`型の属性のみで構成する必要があります。他の型はまだサポートされていません。

構文は次のとおりです:

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4の場合は`UInt32`、IPv6の場合は`FixedString(16)`を受け取ります。例えば:

``` sql
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

他の型はまだサポートされていません。この関数は、このIPアドレスに対応するプレフィックスの属性を返します。重複するプレフィックスがある場合、最も具体的なものが返されます。

データは完全にRAMに収まる必要があります。
## LIFETIMEを使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒で定義）に基づいて辞書を定期的に更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔と、キャッシュされた辞書の無効化間隔です。

更新中、辞書の古いバージョンに対してもクエリを実行できます。辞書の更新（辞書を初めて使用するためにロードする際を除く）は、クエリをブロックしません。更新中にエラーが発生した場合、そのエラーはサーバーログに記録され、古いバージョンの辞書を使用してクエリを続行できます。辞書の更新が成功した場合、古いバージョンの辞書は原子性を持って置き換えられます。

設定の例:

<CloudDetails />

``` xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

または

``` sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>` (`LIFETIME(0)`)を設定すると、辞書の更新が防止されます。

更新のための時間間隔を設定すると、ClickHouseはこの範囲内で均等にランダムな時間を選択します。これは、大規模なサーバー数での更新時に辞書ソースへの負荷を分散させるために必要です。

設定の例:

``` xml
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

``` sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>` および `<max>0</max>`の場合、ClickHouseはタイムアウトにより辞書を再読み込みしません。
この場合、辞書の構成ファイルが変更されたり、`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合には、ClickHouseは辞書を早期に再読み込みできます。

辞書を更新する際、ClickHouseサーバーは[ソース](#dictionary-sources)のタイプに応じて異なる論理を適用します。

- テキストファイルの場合、修正日時を確認します。修正日時が以前に記録された時刻と異なる場合、辞書は更新されます。
- 他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）では、辞書が実際に変更された場合のみ辞書を更新するクエリを設定できます。これを行うには、次の手順に従います。

- 辞書テーブルには、ソースデータが更新されるたびに常に変更されるフィールドが必要です。
- ソースの設定には、変更されたフィールドを取得するクエリを指定する必要があります。ClickHouseサーバーは、クエリ結果を行として解釈し、この行が前の状態と比較して変更されていれば、辞書が更新されるようになっています。ソースの設定内の `<invalidate_query>` フィールドにクエリを指定します。

設定の例:

``` xml
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

``` sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および `SSDComplexKeyCache` 辞書では、同期更新と非同期更新の両方がサポートされています。

`Flat`、`Hashed`、`ComplexKeyHashed` 辞書では、前回の更新以降に変更されたデータのみをリクエストすることも可能です。辞書ソース構成の一部として `update_field` が指定されている場合、以前の更新時刻の値がリクエストデータに追加されます。ソースタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC）によって、`update_field`に異なる論理が適用されます。

- ソースがHTTPの場合、`update_field`は、最後の更新時刻をパラメータ値として持つクエリパラメーターとして追加されます。
- ソースがExecutableの場合、`update_field`は、最後の更新時刻を引数として持つ実行可能スクリプトの引数として追加されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、`update_field`が最後の更新時刻に対して大きいまたは等しいと比較される`WHERE`の追加部分があります。
    - デフォルトでは、この `WHERE` 条件はSQLクエリの最高レベルで確認されます。条件は、クエリ内の任意の `WHERE` 条件で`{condition}`キーワードを使用してチェックできます。例:
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

`update_field`オプションが設定されている場合、追加のオプション`update_lag`を設定できます。`update_lag`オプションの値は、更新されたデータをリクエストする前に以前の更新時刻から引かれます。

設定の例:

``` xml
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

``` sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
## 辞書ソース {#dictionary-sources}

<CloudDetails />

辞書は、さまざまなソースからClickHouseに接続できます。

辞書がxmlファイルを使用して構成されている場合、構成は次のようになります。

``` xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- ソースの構成 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の構成は次のようになります。

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソースの構成
...
```

ソースは`source`セクションで構成されます。

ソースタイプ[ローカルファイル](#local-file)、[実行可能ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)には、以下のオプション設定が可能です。

``` xml
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

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

ソースのタイプ（`source_type`）:

- [ローカルファイル](#local-file)
- [実行可能ファイル](#executable-file)
- [実行可能プール](#executable-pool)
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

設定の例:

``` xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

または

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

設定項目:

- `path` – ファイルの絶対パス。
- `format` – ファイル形式。[Formats](../../interfaces/formats.md#formats)で記述されているすべてのフォーマットがサポートされています。

`FILE`ソースを持つ辞書がDDLコマンド（`CREATE DICTIONARY ...`）を介して作成される場合、ソースファイルは`user_files`ディレクトリ内にある必要があります。これにより、データベースユーザーがClickHouseノード上の任意のファイルにアクセスするのを防ぎます。

**関連項目**

- [辞書機能](../../sql-reference/table-functions/dictionary.md#dictionary-function)
### 実行可能ファイル {#executable-file}

実行可能ファイルとの作業は、[辞書がメモリにどのように保存されているか](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは必要なキーを実行可能ファイルのSTDINにリクエストを送信して要求します。そうでない場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

設定の例:

``` xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

設定項目:

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`に含まれている場合）。
- `format` — ファイル形式。[Formats](../../interfaces/formats.md#formats)で記述されているすべてのフォーマットがサポートされています。
- `command_termination_timeout` — 実行可能スクリプトには、主な読み取り-書き込みループが含まれる必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒以内にシャットダウンする必要があります。ClickHouseが子プロセスにSIGTERM信号を送信します。`command_termination_timeout`は秒単位で指定します。デフォルト値は10です。オプションパラメータです。
- `command_read_timeout` - コマンドからの標準出力のデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `implicit_key` — 実行可能ソースファイルは値のみを返し、要求されたキーとの対応は行の順序によって暗黙的に決定されます。デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)によって指定されるuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は、空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`です。オプションパラメータです。
- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML構成を介してのみ設定できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効です。そうしないと、データベースユーザーがClickHouseノード上で任意のバイナリを実行できるようになります。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスのプールからデータを読み込むことを可能にします。このソースは、ソースからすべてのデータを読み込む必要がある辞書レイアウトでは機能しません。実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して保存されている場合に機能します。

実行可能プールは、指定されたコマンドでプロセスのプールを生成し、終了するまで実行を続けます。プログラムは、利用可能な場合にSTDINからデータを読み取り、結果をSTDOUTに出力する必要があります。次のデータブロックをSTDINで待機できます。ClickHouseは、データブロックの処理後にSTDINを閉じず、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトは、このようなデータ処理の方法に対応する準備をしておく必要があります。STDINをポーリングし、早期にSTDOUTにデータをフラッシュする必要があります。

設定の例:

``` xml
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

設定項目:

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムディレクトリが`PATH`に記載されている場合）。
- `format` — ファイル形式。[Formats](../../interfaces/formats.md#formats)で記述されているすべてのフォーマットがサポートされています。
- `pool_size` — プールのサイズ。`pool_size` に 0 を指定した場合、プールサイズの制約はありません。デフォルト値は `16` です。
- `command_termination_timeout` — 実行可能スクリプトにはメインの読み取り-書き込みループが含まれる必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒にわたって終了する必要があります。ClickHouseが子プロセスにSIGTERM信号を送信します。秒単位で指定します。デフォルト値は`10`です。オプションパラメータです。
- `max_command_execution_time` — データブロックを処理するための実行可能スクリプトのコマンド実行の最大時間。秒単位で指定します。デフォルト値は`10`です。オプションパラメータです。
- `command_read_timeout` - コマンドの標準出力からデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `implicit_key` — 実行可能ソースファイルは値のみを返し、要求されたキーとの対応は行の順序によって暗黙的に決定されます。デフォルト値はfalseです。オプションパラメータです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)によって指定されるuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は、空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションパラメータです。
- `send_chunk_header` - データを処理する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML構成を介してのみ設定できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効です。そうしないと、データベースユーザーがClickHouseノード上で任意のバイナリを実行できるようになります。
### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリにどのように保存されているか](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは`POST`メソッドを介してリクエストを送信し、必要なキーを要求します。

設定の例:

``` xml
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

``` sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

ClickHouseがHTTPSリソースにアクセスできるようにするには、サーバー構成で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)を構成する必要があります。

設定項目:

- `url` – ソースのURL。
- `format` – ファイル形式。[Formats](../../interfaces/formats.md#formats)で記述されているすべてのフォーマットがサポートされています。
- `credentials` – ベーシックHTTP認証。オプションパラメータ。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリ。オプションパラメータ。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエストで送信されるヘッダーの識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成する際、HTTP辞書のためのリモートホストは、データベースユーザーが任意のHTTPサーバーにアクセスするのを防ぐために、configの`remote_url_allow_hosts`セクションの内容と照合されます。
### DBMS {#dbms}
#### ODBC {#odbc}

ODBCドライバーを持つ任意のデータベースに接続するためにこの方法を使用できます。

設定の例:

``` xml
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

``` sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定項目:

- `db` – データベースの名前。`<connection_string>`パラメータでデータベース名が設定されていれば省略できます。
- `table` – テーブルの名前とスキーマ（存在する場合）。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。辞書データの更新に関するセクション[Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)を参照してください。
- `background_reconnect` – 接続に失敗した場合、バックグラウンドでレプリカに再接続します。オプションパラメータ。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`および`query`フィールドは一緒に使用できません。また、`table`または`query`のいずれか一方のフィールドは宣言する必要があります。
:::

ClickHouseはODBCドライバーから引用符を受け取り、ドライバーへのクエリ内のすべての設定を引用符で囲むため、テーブル名はデータベース内のテーブル名の大文字小文字に適切に合わせて設定する必要があります。

Oracleを使用する際にエンコーディングの問題がある場合は、対応する[FAQ](/knowledgebase/oracle-odbc)アイテムを参照してください。
##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられる可能性があります。この場合、`odbc.ini`からの`USERNAME`および`PASSWORD`の値がリモートサーバーに送信される可能性があり、危険にさらされる可能性があります。
:::

**不安全な使用の例**

PostgreSQL用にunixODBCを構成します。`/etc/odbc.ini`の内容:

``` text
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

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバーは`odbc.ini`の`USERNAME`および`PASSWORD`の値を`some-server.com`に送信します。
##### PostgreSQLへの接続の例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCおよびPostgreSQL用のODBCドライバーをインストールします。

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`を構成します（またはClickHouseを実行しているユーザーでサインインした場合は`~/.odbc.ini`を使用します）。

``` text
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

ClickHouseでの辞書構成:

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 接続文字列に次のパラメータを指定できます: -->
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

``` sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

`odbc.ini`を編集して、ライブラリのドライバのフルパスを指定する必要があるかもしれません。 `DRIVER=/usr/local/lib/psqlodbcw.so`。
##### MS SQL Serverへの接続の例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLへの接続用のODBCドライバーをインストールします。

``` bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーを構成します。

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # TDS接続をテスト
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # ClickHouseを実行しているユーザーでサインインした場合

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (オプション) ODBC接続をテストする（isql-toolを使用するには[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストールします）
    $ isql -v MSSQL "user" "password"
```

備考:
- 特定のSQL Serverバージョンでサポートされている最も早いTDSバージョンを確認するには、製品のドキュメントを参照するか、[MS-TDS製品の動作](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を確認します。

ClickHouse内の辞書を構成:

``` xml
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

``` sql
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

設定の例:

``` xml
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

``` sql
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

設定項目:

- `port` – MySQLサーバーのポート。これをすべてのレプリカに適用するか、各レプリカ（`<replica>`内）ごとに指定できます。

- `user` – MySQLユーザーの名前。これをすべてのレプリカに適用するか、各レプリカ（`<replica>`内）ごとに指定できます。

- `password` – MySQLユーザーのパスワード。これをすべてのレプリカに適用するか、各レプリカ（`<replica>`内）ごとに指定できます。

- `replica` – レプリカ構成のセクション。複数セクションを持つことができます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度に従ってレプリカをトラバースします。数字が小さいほど、優先度が高くなります。

- `db` – データベースの名前。

- `table` – テーブルの名前。

- `where` – 選択基準。条件の構文はMySQLの`WHERE`句と同じで、例えば`id > 10 AND id < 20`のようになります。オプションパラメータです。

- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。辞書データの更新に関するセクション[Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)を参照してください。

- `fail_on_connection_loss` – 接続喪失時のサーバーの動作を制御する構成パラメータ。`true`の場合、クライアントとサーバー間の接続が失われた時点で即座に例外がスローされます。`false`の場合、ClickHouseサーバーは例外をスローする前に、クエリの実行を3回再試行します。再試行は応答時間の延長につながります。デフォルト値: `false`。

- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは、`query`フィールドと一緒に使用できません。また、`table`または`query`のいずれか一方のフィールドは宣言する必要があります。
:::

:::note
明示的なパラメータ`secure`はありません。SSL接続を確立する際にはセキュリティが必須です。
:::

MySQLにはソケットを介してローカルホストに接続できます。そのためには、`host`と`socket`を設定します。

設定の例:

``` xml
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

``` sql
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

設定の例:

``` xml
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

``` sql
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

設定項目:

- `host` – ClickHouseホスト。ローカルホストの場合、クエリはネットワーク活動なしで処理されます。フォールトトレランスを向上させるために、[分散](../../engines/table-engines/special/distributed.md)テーブルを作成し、その後の構成に入力できます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。省略可能です。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。辞書データの更新に関するセクション[Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)を参照してください。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは、`query`フィールドと一緒に使用できません。また、`table`または`query`のいずれか一方のフィールドは宣言する必要があります。
:::
#### MongoDB {#mongodb}

設定の例:

``` xml
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

``` xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

または

``` sql
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

設定項目:

- `host` – MongoDBホスト。
- `port` – MongoDBサーバーのポート。
- `user` – MongoDBユーザーの名前。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベースの名前。
- `collection` – コレクションの名前。
- `options` - MongoDB接続文字列オプション（オプションパラメータ）。

または

``` sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定項目:

- `uri` - 接続を確立するためのURI。
- `collection` – コレクションの名前。

[エンジンに関する詳細情報](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

設定の例:

``` xml
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

``` sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

設定フィールド:

- `host` – Redisのホスト。
- `port` – Redisサーバーのポート。
- `storage_type` – キーと共に作業するための内部Redisストレージの構造。`simple`はシンプルなソースやハッシュされた単一キーソースに使用され、`hash_map`は2つのキーを持つハッシュされたソースに使用されます。範囲ソースや複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は`simple`です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。

#### Cassandra {#cassandra}

設定の例:

``` xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspace>database_name</keyspace>
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

設定フィールド:

- `host` – Cassandraホストまたはカンマ区切りのホストリスト。
- `port` – Cassandraサーバーのポート。指定しない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリー（テーブル）の名前。
- `allow_filtering` – クラスタリングキー列に対して潜在的にコストが高い条件を許可するフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルの主キーにおけるパーティションキー列の数。構成キー辞書には必須です。辞書定義内のキー列の順序はCassandra内と同じでなければなりません。デフォルト値は1（最初のキー列がパーティションキーで、他のキー列がクラスタリングキー）です。
- `consistency` – 一貫性レベル。可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は`One`です。
- `where` – 任意の選択基準。
- `max_threads` – 構成キー辞書から複数のパーティションにデータを読み込むために使用する最大スレッド数。
- `query` – カスタムクエリ。任意のパラメータ。

:::note
`column_family`または`where`フィールドは`query`フィールドと一緒に使用することはできません。また、`column_family`または`query`フィールドのいずれかを宣言する必要があります。
:::

#### PostgreSQL {#postgresql}

設定の例:

``` xml
<source>
  <postgresql>
      <host>postgresql-hostname</host>
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

``` sql
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

設定フィールド:

- `host` – PostgreSQLサーバーのホスト。全てのレプリカに対して指定できますし、各レプリカごとに個別に指定することも可能です（`<replica>`内）。
- `port` – PostgreSQLサーバーのポート。全てのレプリカに対して指定できますし、各レプリカごとに個別に指定することも可能です（`<replica>`内）。
- `user` – PostgreSQLユーザーの名前。全てのレプリカに対して指定できますし、各レプリカごとに個別に指定することも可能です（`<replica>`内）。
- `password` – PostgreSQLユーザーのパスワード。全てのレプリカに対して指定できますし、各レプリカごとに個別に指定することも可能です（`<replica>`内）。
- `replica` – レプリカ設定のセクション。複数のセクションが存在することがあります：
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカを走査します。数値が低いほど優先度が高くなります。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`のように、任意のパラメータです。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。任意のパラメータです。詳細は[Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)のセクションを参照してください。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。任意のパラメータです。
- `query` – カスタムクエリ。任意のパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用することはできません。また、`table`または`query`フィールドのいずれかを宣言する必要があります。
:::

### Null {#null}

ダミー（空）の辞書を作成するために使用できる特別なソース。このような辞書はテストや分散テーブルを持つノードのデータとクエリノードが分離されたセットアップで役立ちます。

``` sql
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

## Dictionary Key and Fields {#dictionary-key-and-fields}

<CloudDetails />

`structure`句は辞書キーとクエリで使用可能なフィールドを説明します。

XML説明:

``` xml
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

属性は以下の要素で説明されます:

- `<id>` — キーカラム
- `<attribute>` — データカラム: 複数の属性が存在する可能性があります。

DDLクエリ:

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリボディ内で説明されます:

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性が存在する可能性があります。

## Key {#key}

ClickHouseは以下のキータイプをサポートしています:

- 数値キー。`UInt64`。 `<id>`タグ内で定義されるか、`PRIMARY KEY`キーワードを使用します。
- 複合キー。異なるタイプの値の集合。`<key>`タグまたは`PRIMARY KEY`キーワードで定義されます。

XML構造には`<id>`または`<key>`のいずれかを含むことができます。DDLクエリは単一の`PRIMARY KEY`を持たなければなりません。

:::note
キーを属性として説明しないでください。
:::

### Numeric Key {#numeric-key}

タイプ: `UInt64`。

設定例:

``` xml
<id>
    <name>Id</name>
</id>
```

設定フィールド:

- `name` – キーを持つカラムの名前。

DDLクエリのために:

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを持つカラムの名前。

### Composite Key {#composite-key}

キーは任意のタイプのフィールドからなる`tuple`であることができます。この場合の[layout](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`でなければなりません。

:::tip
複合キーは単一の要素で構成されることがあります。これにより、キーとして文字列を使用することができます。
:::

キー構造は`<key>`要素で設定されます。キーのフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例:

``` xml
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

``` sql
CREATE DICTIONARY (
    field1 String,
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*`関数へのクエリでは、タプルがキーとして渡されます。例:`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## Attributes {#attributes}

設定例:

``` xml
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

``` sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

設定フィールド:

| タグ                                                  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 必須性 |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | はい      |
| `type`                                               | ClickHouseデータ型: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書から指定されたデータ型への値の型変換を試みます。たとえば、MySQLではフィールドは`TEXT`、`VARCHAR`、または`BLOB`である可能性がありますが、ClickHouseにアップロードする際には`String`としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は、[Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache)辞書で現在サポートされています。[IPTrie](#ip_trie)辞書では`Nullable`型はサポートされていません。 | はい      |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>この例では空文字列です。[NULL](../syntax.md#null)値は`Nullable`型にのみ使用できます（前の行に記載の型説明を参照）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい      |
| `expression`                                         | ClickHouseが値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式はリモートSQLデータベース内のカラム名であることができます。これにより、リモートカラムのエイリアスを作成することができます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | いいえ       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`の場合、属性は現在のキーの親キーの値を含んでいます。 [Hierarchical Dictionaries](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | いいえ       |
| `injective`                                          | `id -> attribute`の画像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true`の場合、ClickHouseは`GROUP BY`句の後に自動的に辞書への挿入を行うリクエストを配置できる。通常、このリクエストの量は大幅に削減されます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | いいえ       |
| `is_object_id`                                       | クエリがMongoDBドキュメントに対して`ObjectID`のために実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。

## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouseは[数値キー](#numeric-key)を持つ階層辞書をサポートしています。

以下の階層構造を見てください:

``` text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (中心)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は以下の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | 中心          |
| 4          | 0              | イギリス      |
| 5          | 4              | ロンドン      |

このテーブルには、要素の最近の親のキーを含む`parent_region`というカラムがあります。

ClickHouseは外部辞書属性に対して階層的なプロパティをサポートしています。このプロパティを使用して、上記のように階層辞書を構成できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得できます。

我々の例では、辞書の構造は以下のようになります:

``` xml
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
## ポリゴン辞書 {#polygon-dictionaries}

ポリゴン辞書を使用することで、指定したポイントを含むポリゴンを効率的に検索できます。
例えば、地理座標を使って都市のエリアを定義することができます。

ポリゴン辞書の設定例：

<CloudDetails />

``` xml
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

対応する [DDLクエリ](../../sql-reference/statements/create/dictionary.md#create-dictionary-query):
``` sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

ポリゴン辞書を設定する際、キーは次の2つのタイプのいずれかである必要があります：

- 単純ポリゴン。これはポイントの配列です。
- マルチポリゴン。これはポリゴンの配列です。各ポリゴンはポイントの2次元配列です。この配列の最初の要素はポリゴンの外部境界であり、続く要素は除外する領域を指定します。

ポイントは配列またはその座標のタプルとして指定できます。現在の実装では、2次元ポイントのみがサポートされています。

ユーザーは、ClickHouse がサポートするすべてのフォーマットでデータをアップロードできます。

利用可能な3種類の [インメモリストレージ](#storing-dictionaries-in-memory) があります：

- `POLYGON_SIMPLE`。これは最も単純な実装で、各クエリごとにすべてのポリゴンを線形に通過し、追加のインデックスを使用せずに各ポリゴンに対してメンバーシップを確認します。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して別々のインデックスが構築されます。これにより、ほとんどの場合において迅速に関連付けを確認できます（地理地域向けに最適化されています）。また、考慮中のエリアにグリッドが重ねられるため、考慮するポリゴンの数を大幅に絞り込むことができます。グリッドはセルを16の等しい部分に再帰的に分割して作成され、2つのパラメータで設定されます。再帰の深さが `MAX_DEPTH` に達するか、セルが `MIN_INTERSECTIONS` ポリゴンを超えない場合、分割が停止します。クエリに応答するには、対応するセルがあり、そこに保存されているポリゴンのインデックスに交互にアクセスします。

- `POLYGON_INDEX_CELL`。この配置は、上記で説明したグリッドを作成します。同様のオプションが利用可能です。各シートセルに対して、そのセルに入っているすべてのポリゴンのパーツに基づいてインデックスが構築され、リクエストに迅速に応答できます。

- `POLYGON`。これは `POLYGON_INDEX_CELL` の同義語です。

辞書クエリは、辞書を操作するための標準の [関数](../../sql-reference/functions/ext-dict-functions.md) を使用して実行されます。
重要な違いは、ここでのキーがポリゴンを見つけるために使用したいポイントであるということです。

**例**

上記で定義された辞書を操作する例：

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

'points' テーブル内の各ポイントに対して最後のコマンドを実行すると、そのポイントを含む最小面積のポリゴンが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書のカラムを SELECT クエリを介して読み取ることができます。辞書の設定または対応するDDLクエリに `store_polygon_key_column = 1` を含めるだけです。

クエリ：

``` sql
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

``` text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## 正規表現ツリー辞書 {#regexp-tree-dictionary}

正規表現ツリー辞書は、キーから属性へのマッピングを正規表現の木を使用して表現する特別なタイプの辞書です。いくつかのユースケース、例えば [ユーザーエージェント](https://en.wikipedia.org/wiki/User_agent) 文字列の解析に、正規表現ツリー辞書を使ったエレガントな実現が可能です。
### ClickHouse オープンソースで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、正規表現ツリーを含む YAML ファイルのパスを指定する YAMLRegExpTree ソースを使用して ClickHouse オープンソースで定義されます。

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

辞書ソース `YAMLRegExpTree` は、正規表現ツリーの構造を表現します。例えば：

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは次の構造を持っています：

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、`name` と `version` の2つの属性があります。最初のノードは両方の属性を定義します。2番目のノードは属性 `name` のみを定義し、属性 `version` は2番目のノードの子ノードによって提供されます。
  - 属性の値は、マッチした正規表現のキャプチャグループを参照する **バックリファレンス** を含むことができます。例では、最初のノードの属性 `version` の値は、正規表現のキャプチャグループ `(\d+[\.\d]*)` に対するバックリファレンス `\1` で構成されています。バックリファレンスの番号は1から9までで、`$1` または `\1`（番号1の場合）として書かれます。バックリファレンスは、クエリ実行中にマッチしたキャプチャグループに置き換えられます。
- **child nodes**: 正規表現ツリーノードの子のリストで、各子ノードには独自の属性と（可能性として）子ノードがあります。文字列のマッチングは深さ優先方式で進行します。文字列が正規表現ノードと一致した場合、辞書はそれがノードの子ノードにも一致するかを確認します。その場合、最も深く一致したノードの属性が割り当てられます。子ノードの属性は、同じ名前の親ノードの属性を上書きします。YAML ファイル内の子ノードの名前は任意で、例では `versions` となっています。

正規表現ツリー辞書には、`dictGet`、`dictGetOrDefault`、および `dictGetAll` によるアクセスのみが許可されています。

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

この場合、最初にトップレイヤーの第二ノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` に一致します。辞書は、文字列が子ノードにも一致するかどうかを探し続け、文字列が `3[12]/tclwebkit` にも一致することを見つけます。その結果、属性 `name` の値は `Android`（最初のレイヤーで定義）で、属性 `version` の値は `12`（子ノードで定義されている）となります。

強力な YAML 構成ファイルを使用することで、正規表現ツリー辞書をユーザーエージェント文字列パーサーとして使用できます。私たちは [uap-core](https://github.com/ua-parser/uap-core) をサポートし、機能テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) でどのように使用するかを示しています。
#### 属性値の取得 {#collecting-attribute-values}

時には、マッチした複数の正規表現から値を返す方が有用です。これを行うために、専門の [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 関数を使用できます。ノードが型 `T` の属性値を持っている場合、`dictGetAll` はゼロまたはそれ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチ数に制限はありません。制限は、`dictGetAll` にオプションの第四引数として渡すことができます。配列は _トポロジカル順序_ で補填され、すなわち子ノードが親ノードの前に来て、兄弟ノードはソース内の順序に従います。

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
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを使用します（デフォルトは `false`）。個々の表現では `(?i)` および `(?-i)` でオーバーライドできます。
- `regexp_dict_flag_dotall`: '.' が改行文字にマッチすることを許可します（デフォルトは `false`）。
### ClickHouse Cloud で正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースは、ClickHouse オープンソースでは機能しますが、ClickHouse Cloud では機能しません。ClickHouse Cloud で正規表現ツリー辞書を使用するには、まず ClickHouse オープンソースで YAML ファイルから正規表現ツリー辞書を作成し、その後 `dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してこの辞書を CSV ファイルにダンプします。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV ファイルの内容は次の通りです：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプしたファイルのスキーマは次の通りです：

- `id UInt64`: RegexpTree ノードの ID。
- `parent_id UInt64`: ノードの親の ID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義属性の名前。
- `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloud に辞書を作成するには、まず次のテーブル構造で `regexp_dictionary_source_table` を作成します：

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

次に、ローカルの CSV を次のように更新します。

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

詳細については、[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルを初期化した後、テーブルソースから RegexpTree を作成できます：

``` sql
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
## 埋め込み辞書 {#embedded-dictionaries}

<SelfManaged />

ClickHouse には、ジオベースで作業するための組み込み機能があります。

これにより、以下が可能になります：

- 地域の ID を使用して、その名前を希望の言語で取得する。
- 地域の ID を使用して、都市、エリア、連邦地区、国、または大陸の ID を取得する。
- 地域が他の地域の一部であるかを確認する。
- 親地域の連鎖を取得する。

すべての関数は「トランスローカリティ」をサポートしており、地域の所有権について異なる視点を同時に使用する能力を持っています。詳細については、「ウェブアナリティクス辞書を操作するための関数」セクションを参照してください。

内部辞書はデフォルトパッケージでは無効になっています。
これらを有効にするには、サーバー構成ファイルで `path_to_regions_hierarchy_file` と `path_to_regions_names_files` のパラメータのコメントを外してください。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータは `regions_hierarchy.txt` ファイル（デフォルトの地域階層）へのパスを含む必要があり、他のファイル（`regions_hierarchy_ua.txt`）は同じディレクトリに配置される必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置してください。

自分でこれらのファイルを作成することもできます。ファイルフォーマットは次の通りです：

`regions_hierarchy*.txt`：タブ区切り（ヘッダなし）、カラム：

- 地域 ID (`UInt32`)
- 親地域 ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 都市；他のタイプは値を持ちません
- 人口 (`UInt32`) — オプションのカラム

`regions_names_*.txt`：タブ区切り（ヘッダなし）、カラム：

- 地域 ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含むことはできません（エスケープされたものでも含みません）。

RAM内には平坦な配列が使用されます。このため、ID は百万を超えてはいけません。

辞書は、サーバーを再起動することなく更新できます。ただし、利用可能な辞書のセットは更新されません。
更新を行うために、ファイルの変更時刻が確認されます。ファイルが変更された場合、辞書が更新されます。
変更を確認する間隔は、`builtin_dictionaries_reload_interval` パラメータで設定されます。
辞書の更新（初回使用時の読み込みを除く）は、クエリをブロックしません。更新中は、古い辞書のバージョンが使用されます。更新中にエラーが発生した場合、エラーはサーバーログに記録され、クエリは古い辞書のバージョンを使用し続けます。

ジオベースを使用して辞書を定期的に更新することをお勧めします。更新中に新しいファイルを生成し、それらを別の場所に書き込みます。すべてが準備できたら、それらをサーバーが使用するファイル名に変更します。

OS識別子や検索エンジンに関する操作のための関数もありますが、使用しないことをお勧めします。
