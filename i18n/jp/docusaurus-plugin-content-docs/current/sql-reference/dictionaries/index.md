---
slug: '/sql-reference/dictionaries'
sidebar_label: '辞書の定義'
sidebar_position: 35
---
```


# 辞書

辞書は、さまざまな種類の参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリで使用できる辞書を操作するための特別な関数をサポートします。辞書を関数と共に使用する方が、参照テーブルとの`JOIN`よりも簡単で効率的です。

ClickHouseは次のことをサポートしています：

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouseの辞書の使い始めとして、関連するトピックをカバーするチュートリアルがあります。 [こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースは、ClickHouseのテーブル、ローカルテキストまたは実行ファイル、HTTP(s)リソース、または別のDBMSである可能性があります。詳細については、"[辞書ソース](#dictionary-sources)"を参照してください。

ClickHouseは以下のことを行います：

- 辞書を完全または部分的にRAMに保存します。
- 定期的に辞書を更新し、欠落している値を動的にロードします。言い換えれば、辞書は動的にロードできます。
- xmlファイルや[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成することを許可します。

辞書の構成は1つ以上のxmlファイルに存在することができます。構成へのパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定されます。

辞書は、サーバーの起動時または初回使用時にロードでき、これは[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定に依存します。

[辞書](/operations/system-tables/dictionaries)システムテーブルには、サーバーで構成された辞書に関する情報が含まれています。各辞書については、以下の情報を見つけることができます：

- 辞書のステータス。
- 構成パラメータ。
- 辞書が正常にロードされて以来のRAMの割り当て量やクエリの数などのメトリック。

<CloudDetails />
## DDLクエリで辞書を作成する {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成でき、これは推奨される方法です。なぜなら、DDLで作成された辞書は以下の利点があります：
- サーバーの構成ファイルに追加のレコードが追加されません
- 辞書はテーブルやビューのような一級エンティティとして扱えます
- データは辞書テーブル関数ではなく、慣れ親しんだSELECTを使用して直接読み取ることができます
- 辞書は簡単に名前変更できます

## 構成ファイルで辞書を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
構成ファイルで辞書を作成することは、ClickHouse Cloudには適用できません。上記のDDLを使用して、ユーザー`default`として辞書を作成してください。
:::

辞書の構成ファイルは次の形式を持ちます：

``` xml
<clickhouse>
    <comment>任意の内容を持つオプションの要素。ClickHouseサーバーによって無視されます。</comment>

    <!--オプションの要素。置換を含むファイル名-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- 辞書の構成。 -->
        <!-- 構成ファイルには任意の数の辞書セクションを含めることができます。 -->
    </dictionary>

</clickhouse>
```

同じファイルで任意の数の辞書を[構成](#configuring-a-dictionary)できます。

:::note
小さな辞書の値を変換するには、`SELECT`クエリでそれを説明することができます（[transform](../../sql-reference/functions/other-functions.md)関数を参照）。この機能は辞書には関連していません。
:::
## 辞書を設定する {#configuring-a-dictionary}

<CloudDetails />

辞書がxmlファイルを使用して構成されている場合、その構成は次のような構造を持ちます：

``` xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複雑なキー構成 -->
    </structure>

    <source>
      <!-- ソース構成 -->
    </source>

    <layout>
      <!-- メモリレイアウトの構成 -->
    </layout>

    <lifetime>
      <!-- メモリ内の辞書の有効期限 -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は次のような構造を持ちます：

``` sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複雑または単一のキー構成
SOURCE(...) -- ソース構成
LAYOUT(...) -- メモリレイアウトの構成
LIFETIME(...) -- メモリ内の辞書の有効期限
```
## メモリに辞書を保存する {#storing-dictionaries-in-memory}

辞書をメモリに保存するためのさまざまな方法があります。

最適な処理速度を提供するため、[flat](#flat)、[hashed](#hashed)、および[complex_key_hashed](#complex_key_hashed)を推奨します。

キャッシングは、パフォーマンスが低下する可能性や最適なパラメータの選択の難しさから推奨されません。[cache](#cache)のセクションで詳細を読むことができます。

辞書のパフォーマンスを向上させるためのいくつかの方法があります：

- `GROUP BY`の後に辞書を操作するための関数を呼び出します。
- 抽出する属性をinjectiveとしてマークします。ある属性がinjectiveであるとは、異なるキーが異なる属性値に対応する場合を指します。したがって、`GROUP BY`でキーによって属性値を取得する関数を使用する際、この関数は自動的に`GROUP BY`から除外されます。

ClickHouseは辞書に関連するエラーに対して例外を生成します。エラーの例：

- アクセスされている辞書を読み込むことができませんでした。
- `cached`辞書に対するクエリエラー。

[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで辞書のリストとそのステータスを表示できます。

<CloudDetails />

構成は次のように見えます：

``` xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- レイアウトの設定 -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)：

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウトの設定
...
```

`complex-key*`という単語が含まれないレイアウトの辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`辞書は複合キー（複雑な、任意の型を持つ）です。

XML辞書における[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されます。

例：

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合的な`complex`キーを持つXML辞書は`<key>`タグで定義されます。

構成の例（キーが1つの[String](../../sql-reference/data-types/string.md)型の要素を持つ複合キー）：

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

辞書は完全にメモリにフラット配列の形式で保存されます。辞書が使用するメモリはどれくらいですか？その量は、最大キーのサイズ（使用される空間に対して）に比例します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型であり、値は`max_array_size`（デフォルトでは500,000）に制限されています。辞書を作成するときにより大きなキーが発見された場合、ClickHouseは例外を投げて辞書を作成しません。辞書のフラット配列の初期サイズは`initial_array_size`設定（デフォルトは1024）によって制御されます。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み取られます。

この方法は、利用可能なすべての辞書の保存方法の中で最も優れたパフォーマンスを提供します。

構成の例：

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

辞書は、ハッシュテーブルの形式で完全にメモリに保存されます。辞書には任意の識別子を持つ任意の数の要素を含めることができます。実際のところ、キーの数は数千万を超えることができます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み取られます。

構成の例：

``` xml
<layout>
  <hashed />
</layout>
```

または

``` sql
LAYOUT(HASHED())
```

構成の例：

``` xml
<layout>
  <hashed>
    <!-- シャードが1より大きい場合（デフォルトは`1`）、辞書は並列にデータをロードします。
         大量の要素が1つの辞書にある場合に便利です。 -->
    <shards>10</shards>

    <!-- 並列キュー内のブロックのバックログのサイズ。

         並行ロードのボトルネックは再ハッシュであるため、スレッドが再ハッシュを行っている間に停止するのを避けるためにバックログが必要です。

         10000はメモリと速度のバランスの良い値です。
         10e10要素に対しても、全負荷を処理できることがわかります。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷係数。大きな値でメモリがより効率的に使用されます（メモリが無駄になりにくい）が、読み取り/パフォーマンスが悪化する恐れがあります。

         有効な値：[0.5, 0.99]
         デフォルト：0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

`hashed`に似ていますが、より多くのCPU使用量の代わりにメモリを節約します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

構成の例：

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

このタイプの辞書でも`shards`を使用することができ、`sparse_hashed`にとっては`hashed`よりも重要です。なぜなら、`sparse_hashed`は遅いためです。

### complex_key_hashed {#complex_key_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`hashed`に似ています。

構成の例：

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`sparse_hashed`に似ています。

構成の例：

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

辞書は完全にメモリに保存されます。各属性は配列に保存され、キー属性はハッシュテーブルの形式で保存され、そこでは値が属性配列内のインデックスです。辞書には任意の数の要素を持たせることができ、実際のところキーの数は数千万を超えることができます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み取られます。

構成の例：

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`hashed_array`に似ています。

構成の例：

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

辞書は、範囲の順序付き配列とその対応する値のハッシュテーブルの形式でメモリに保存されます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。このストレージ方法は、`hashed`と同様に動作し、キーに加えて日付/時間（任意の数値型）の範囲も使用できます。

例：テーブルには、各広告主に対する割引が次の形式で含まれています：

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields)内で`range_min`と`range_max`要素を定義します。これらの要素は`name`と`type`の要素を含む必要があります（`type`が指定されていない場合、デフォルトの型が使用されます - Date）。`type`は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）が使用できます。

:::note
`range_min`および`range_max`の値は`Int64`型に収まる必要があります。
:::

例：

``` xml
<layout>
    <range_hashed>
        <!-- 重複範囲に対する戦略（min/max）。デフォルト：min（最小の値を持つ一致する範囲を返します） -->
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

これらの辞書を操作するには、範囲が選択される`dictGet`関数に追加の引数を渡する必要があります：

``` sql
dictGet('dict_name', 'attr_name', id, date)
```

クエリの例：

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された`id`と、渡された日付を含む日付範囲に対して値を返します。

アルゴリズムの詳細：

- `id`が見つからない場合や、`id`の範囲が見つからない場合、属性の型のデフォルト値を返します。
- 重複する範囲があり、`range_lookup_strategy=min`の場合、最小の`range_min`を持つ一致する範囲を返します。複数の範囲が見つかった場合、最小の`range_max`を持つ範囲を返し、さらに複数の範囲が見つかった（同じ`range_min`と`range_max`を持つ範囲が複数ある）場合、ランダムにその範囲の1つを返します。
- 重複する範囲があり、`range_lookup_strategy=max`の場合、最大の`range_min`を持つ一致する範囲を返します。同様に、複数の範囲が見つかると、最大の`range_max`を持つ範囲を返し、さらに複数の範囲が見つかるとランダムに選ばれます。
- `range_max`が`NULL`の場合、範囲はオープンです。`NULL`は最大の可能な値として扱われます。`range_min`に対して、`1970-01-01`または`0`（-MAX_INT）をオープン値として使用できます。

構成の例：

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

重複範囲およびオープン範囲の構成例：

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
│ 0.1 │ -- 一致する範囲は1つしかなく：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 一致する範囲が2つある。range_min 2015-01-15 (0.2) が2015-01-01 (0.1) よりも大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 一致する範囲が2つある。range_min 2015-01-04 (0.4) が2015-01-01 (0.3) よりも大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 一致する範囲が2つある。range_minが等しい場合、2015-01-15 (0.5) が2015-01-10 (0.6) よりも大きい
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
│ 0.1 │ -- 一致する範囲は1つしかなく：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲が2つある。range_min 2015-01-01 (0.1) が2015-01-15 (0.2) よりも小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 一致する範囲が2つある。range_min 2015-01-01 (0.3) が2015-01-04 (0.4) よりも小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 一致する範囲が2つある。range_minが等しい場合、2015-01-10 (0.6) が2015-01-15 (0.5) よりも小さい
└─────┘
```

### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、範囲の順序付き配列とその対応する値を持つハッシュテーブルの形式でメモリに保存されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。

構成の例：

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

辞書は、固定数のセルを持つキャッシュに保存されます。これらのセルには、頻繁に使用される要素が含まれます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際、最初にキャッシュが検索されます。データの各ブロックに対して、キャッシュに見つからないか、古くなったすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を使用してソースから要求されます。受信したデータは、次にキャッシュに書き込まれます。

キーが辞書に見つからない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定で制御できます。

キャッシュ辞書に対しては、キャッシュ内のデータの有効期限[Lifetime](#refreshing-dictionary-data-using-lifetime)が設定できます。セルにデータがロードされてから`lifetime`の時間が経過した場合、セルの値は使用されず、キーが期限切れになります。そのキーは、次回使用される必要があるときに再要求されます。この動作は、`allow_read_expired_keys`設定で構成できます。

これは、辞書を保存する方法の中で最も効果が低いです。キャッシュの速度は、正しい設定と使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合（推奨99％以上）のみ良好に機能します。ヒット率の平均を[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで表示できます。

設定`allow_read_expired_keys`が1に設定されている場合、デフォルトは0です。その場合、辞書は非同期更新をサポートします。クライアントがキーを要求し、そのすべてがキャッシュに存在しますが、一部が期限切れの場合、辞書は期限切れのキーをクライアントに返し、それらを非同期にソースから要求します。

キャッシュのパフォーマンスを向上させるには、`LIMIT`を使用したサブクエリを利用し、辞書を外部から呼び出す関数を使用してください。

すべてのタイプのソースがサポートされています。

設定の例：

``` xml
<layout>
    <cache>
        <!-- キャッシュのサイズ、セルの数で。2の累乗に繰り上げられます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 有効期限のあるキーを読み取ることを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 更新タスクをキューにプッシュする最大タイムアウト（ミリ秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクが完了するまでの最大待機タイムアウト（ミリ秒）。 -->
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

十分に大きなキャッシュサイズを設定してください。セルの数を選択するために実験する必要があります：

1.  一部の値を設定します。
2.  キャッシュが完全に満杯になるまでクエリを実行します。
3.  `system.dictionaries`テーブルを使用してメモリ消費量を評価します。
4.  必要なメモリ消費量に達するまで、セルの数を増減させます。

:::note
ClickHouseをソースとして使用しないでください。ランダムな読み取りを処理するクエリは遅くなります。
:::

### complex_key_cache {#complex_key_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`cache`に似ています。

### ssd_cache {#ssd_cache}

`cache`に似ていますが、データをSSDに保存し、インデックスをRAMに置きます。更新キューに関連するすべてのキャッシュ辞書の設定も、SSDキャッシュ辞書に適用できます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

``` xml
<layout>
    <ssd_cache>
        <!-- 読み取りブロックのサイズ（バイト単位）。SSDのページサイズと同じであることが推奨されます。 -->
        <block_size>4096</block_size>
        <!-- 最大キャッシュファイルサイズ（バイト単位）。 -->
        <file_size>16777216</file_size>
        <!-- SSDから要素を読み取るためのRAMバッファのサイズ（バイト単位）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSDに書き込む前に要素を集約するためのRAMバッファのサイズ（バイト単位）。 -->
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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`ssd_cache`に似ています。

### direct {#direct}

辞書はメモリに保存されず、リクエストの処理中にソースに直接アクセスします。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプの[ソース](#dictionary-sources)、ローカルファイルを除いてサポートされています。

構成の例：

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)と共に使用されます。`direct`に似ています。

### ip_trie {#ip_trie}

このストレージタイプは、ネットワークプレフィックス（IPアドレス）をASNなどのメタデータにマッピングするために使用されます。

**例**

ClickHouseにIPプレフィックスとマッピングを含むテーブルがあるとしましょう：

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

このテーブルのために`ip_trie`辞書を定義しましょう。`ip_trie`レイアウトは複合キーを必要とします：

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
        <!-- キー属性`prefix`は、dictGetStringを介して取得できます。 -->
        <!-- このオプションは、メモリ使用量を増加させます。 -->
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

キーには、許可されたIPプレフィックスを含む文字列型の属性を1つだけ持つ必要があります。他の型は現在サポートされていません。

構文は次のとおりです：

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4用の`UInt32`またはIPv6用の`FixedString(16)`を受け取ります。例えば：

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

他の型は現在サポートされていません。この関数は、指定されたIPアドレスに対応するプレフィックスの属性を返します。重複するプレフィックスがある場合、最も特定的なものが返されます。

データは完全にRAMに収まる必要があります。
```
```yaml
title: '辞書データの更新におけるLIFETIMEの使用'
sidebar_label: 'LIFETIMEによる辞書データの更新'
keywords: 'ClickHouse, 辞書, LIFETIME, 更新'
description: 'ClickHouseにおける辞書データの更新に関するLIFETIMEの使用方法について説明します。'
```

## 辞書データの更新におけるLIFETIME {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒単位で定義）に基づいて辞書を定期的に更新します。 `LIFETIME`は、完全にダウンロードされた辞書の更新間隔と、キャッシュされた辞書の無効化間隔を示します。

更新中は、辞書の旧バージョンをクエリすることができます。 辞書の更新（辞書を初めて使用するためにロードする場合を除く）は、クエリをブロックしません。 更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは旧バージョンの辞書を使用し続けることができます。 辞書の更新が成功した場合、旧バージョンの辞書は原子的に置き換えられます。

設定の例：

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

`<lifetime>0</lifetime>`（`LIFETIME(0)`）を設定すると、辞書の更新が防止されます。

更新のための時間間隔を設定でき、ClickHouseはこの範囲内で均等にランダムな時刻を選択します。 これは、多数のサーバーで同時に更新する際に辞書ソースへの負荷を分散するために必要です。

設定の例：

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

`<min>0</min>`および`<max>0</max>`の場合、ClickHouseはタイムアウトによる辞書の再ロードを行いません。
この場合、辞書構成ファイルが変更された場合や`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合には、ClickHouseは辞書を早めに再ロードできます。

辞書を更新する際、ClickHouseサーバーは[ソース](#dictionary-sources)のタイプに応じて異なる論理を適用します：

- テキストファイルの場合、変更時間を確認します。 変更時間が以前に記録された時間と異なる場合、辞書が更新されます。
- 他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）では、実際に変更された場合にのみ辞書が更新されるようにクエリをセットアップできます。 そのためには、次の手順に従います：

- 辞書テーブルには、ソースデータが更新されると常に変更されるフィールドを含める必要があります。
- ソースの設定には、変更フィールドを取得するクエリを指定する必要があります。 ClickHouseサーバーはクエリ結果を行として解釈し、この行が以前の状態と比較して変更された場合に、辞書が更新されます。 スタイル設定の[ソース](#dictionary-sources)内の`<invalidate_query>`フィールドにクエリを指定してください。

設定の例：

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

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書では、同期および非同期の更新がサポートされています。

`Flat`、`Hashed`、`ComplexKeyHashed`辞書においても、前回の更新後に変更されたデータのみを要求することができます。 辞書ソース設定の一部として`update_field`が指定されている場合は、データ要求に前回の更新時間の秒数が追加されます。 ソースのタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC）によって、リクエストする前に`update_field`に異なる論理が適用されます。

- ソースがHTTPの場合、`update_field`はクエリパラメータとして追加され、最後の更新時間がパラメータ値として使用されます。
- ソースがExecutableの場合、`update_field`は実行可能ファイルの引数として追加され、最後の更新時間が引数値として使用されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、追加の`WHERE`部分があり、ここで`update_field`が最後の更新時間と比較されます。
    - デフォルトでは、この`WHERE`条件はSQLクエリの最上位でチェックされます。 代わりに、`{condition}`キーワードを使用してクエリ内の他の`WHERE`句で条件をチェックできます。 例：
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

`update_field`オプションが設定されている場合、追加のオプション`update_lag`を設定することができます。 `update_lag`オプションの値は、更新されたデータをリクエストする前に前回の更新時間から減算されます。

設定の例：

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

辞書がxmlファイルを使用して構成されている場合、構成は次のようになります：

``` xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- ソース構成 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の構成は次のようになります：

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソース構成
...
```

ソースは`source`セクションで構成されています。

[ローカルファイル](#local-file)、[実行可能ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)のソースタイプでは、オプション設定が利用可能です：

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

ソースタイプ（`source_type`）：

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

設定の例：

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

設定フィールド：

- `path` – ファイルの絶対パス。
- `format` – ファイル形式。 [フォーマット](/sql-reference/formats)で説明されているすべての形式がサポートされています。

`FILE`ソースを使用して辞書がDDLコマンド（`CREATE DICTIONARY ...`）経由で作成される場合、ソースファイルは`user_files`ディレクトリに配置する必要があります。これは、DBユーザーがClickHouseノード上の任意のファイルにアクセスできないようにするためです。

**関連情報**

- [辞書関数](/sql-reference/table-functions/dictionary)
### 実行可能ファイル {#executable-file}

実行可能ファイルとの作業は、[辞書がメモリにどのように格納されているか](#storing-dictionaries-in-memory)に依存します。 辞書が`cache`と`complex_key_cache`を使用してストレージされている場合、ClickHouseは実行可能ファイルのSTDINにリクエストを送信して必要なキーを要求します。そうでない場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

設定の例：

``` xml
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
- `format` — ファイル形式。 [フォーマット](/sql-reference/formats)で説明されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能なスクリプトは、メインの読み書きループを含む必要があります。 辞書が削除された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒以内にシャットダウンする必要があります。そうしないと、ClickHouseは子プロセスにSIGTERM信号を送信します。 `command_termination_timeout`は秒単位で指定されます。 デフォルト値は10です。 オプションのパラメータです。
- `command_read_timeout` - コマンドの標準出力からデータを読み取るためのタイムアウト（ミリ秒）。 デフォルト値10000。 オプションのパラメータです。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒）。 デフォルト値10000。 オプションのパラメータです。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されるキーとの対応は暗黙的に決定されます。結果の行の順序によって決まります。 デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。 追加のスクリプト引数を空白区切りで指定できます。例：`script_name arg1 arg2`。 `execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。 デフォルト値は`0`です。 オプションのパラメータです。
- `send_chunk_header` - データのチャンクを処理するために送信する前に行数を送信するかどうかを制御します。 オプションです。 デフォルト値は`false`です。

この辞書ソースはXML構成経由でのみ構成できます。 DDLを介して実行可能ソースを持つ辞書を作成することは無効になっており、そうでない場合、DBユーザーはClickHouseノード上で任意のバイナリを実行できるようになります。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスのプールからデータを読み込むことを可能にします。 このソースは、ソースからすべてのデータを読み込む必要がある辞書レイアウトでは機能しません。 実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して[保存](#ways-to-store-dictionaries-in-memory)されている場合に機能します。

実行可能プールは、指定されたコマンドでプロセスのプールを生成し、終了するまでそれらを実行し続けます。 プログラムは、STDINからデータを読み取る必要があります。 ClickHouseはデータブロックを処理した後、STDINを閉じずに必要に応じて別のデータチャンクをパイプします。 実行可能なスクリプトは、このデータ処理方法に対応する必要があり、STDINをポーリングしてデータを早期にSTDOUTにフラッシュする必要があります。

設定の例：

``` xml
<source>
    <executable_pool>
        <command>while read key; do printf "$key\tData for key $key\n"; done</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10</max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

設定フィールド：

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムのディレクトリが`PATH`に記載されている場合）。
- `format` — ファイル形式。 [フォーマット](/sql-reference/formats)で説明されているすべての形式がサポートされています。
- `pool_size` — プールのサイズ。 `pool_size`として0を指定する場合、プールサイズに制限はありません。 デフォルト値は`16`です。
- `command_termination_timeout` — 実行可能なスクリプトは、メインの読み書きループを含む必要があります。 辞書が削除された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒以内にシャットダウンする必要があります。そうしないと、ClickHouseはSIGTERM信号を子プロセスに送信します。 秒で指定します。 デフォルト値は10です。 オプションのパラメータです。
- `max_command_execution_time` — データブロックを処理するための実行可能スクリプトコマンドの最大実行時間。 秒で指定します。 デフォルト値は10です。 オプションのパラメータです。
- `command_read_timeout` - コマンドの標準出力からデータを読み取るためのタイムアウト（ミリ秒）。 デフォルト値10000。 オプションのパラメータです。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒）。 デフォルト値10000。 オプションのパラメータです。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されるキーとの対応は暗黙的に決定されます。結果の行の順序によって決まります。 デフォルト値はfalseです。 オプションのパラメータです。
- `execute_direct` - `execute_direct` = `1`の場合、 `command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)のuser_scriptsフォルダ内で検索されます。 追加のスクリプト引数を空白区切りで指定できます。 例：`script_name arg1 arg2`。 `execute_direct` = `0`の場合，`command`は`bin/sh -c`の引数として渡されます。 デフォルト値は`1`です。 オプションパラメータです。
- `send_chunk_header` - データ処理のためにチャンクを送信する前に行数を送信するかどうかを制御します。 オプション。 デフォルト値は`false`です。

この辞書ソースはXML構成経由でのみ構成できます。 実行可能ソースを持つ辞書をDDL経由で作成することは無効にされており、そうでない場合、DBユーザーはClickHouseノード上で任意のバイナリを実行できるようになります。
### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリにどのように格納されているか](#storing-dictionaries-in-memory)に依存します。 辞書が`cache`および`complex_key_cache`を使用してストレージされている場合、ClickHouseは`POST`メソッドを介してリクエストを送信して必要なキーを要求します。

設定の例：

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

ClickHouseがHTTPSリソースにアクセスするためには、サーバー構成で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)を設定する必要があります。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。 [フォーマット](/sql-reference/formats)で説明されているすべての形式がサポートされています。
- `credentials` – 基本的なHTTP認証。 オプションのパラメータです。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリ。 オプションのパラメータです。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエストで送信されるヘッダーに使用される識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成すると、HTTP辞書用のリモートホストは構成から`remote_url_allow_hosts`セクションの内容に対して確認され、データベースユーザーが任意のHTTPサーバーにアクセスできないようにします。
### DBMS {#dbms}
#### ODBC {#odbc}

ODBCドライバーを持つ任意のデータベースに接続するためのこの方法を使用できます。

設定の例：

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

設定フィールド：

- `db` – データベース名。 `<connection_string>`のパラメータでデータベース名が設定されている場合は省略します。
- `table` – テーブル名およびスキーマ名（存在する場合）。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。 オプションのパラメータです。 辞書データの更新に関するセクション[辞書データの更新におけるLIFETIME](#refreshing-dictionary-data-using-lifetime)で詳しく説明しています。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。 オプションのパラメータです。
- `query` – カスタムクエリ。 オプションのパラメータです。

:::note
`table`と`query`フィールドは一緒に使用できません。 どちらか一方の`table`または`query`フィールドを宣言する必要があります。
:::

ClickHouseはODBCドライバーから引用シンボルを受け取り、ドライバーのクエリで設定をすべて引用します。 そのため、テーブル名はデータベース内のテーブル名のケースに従って正しく設定する必要があります。

Oracleを使用する際にエンコーディングに関する問題がある場合は、該当する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。
##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられる可能性があります。 この場合、`odbc.ini`の`USERNAME`および`PASSWORD`の値がリモートサーバーに送信され、漏洩する可能性があります。
:::

**安全でない使用の例**

PostgreSQL用にunixODBCを設定してみましょう。 `/etc/odbc.ini`の内容：

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

次に、次のようなクエリを実行すると：

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバーは`odbc.ini`の`USERNAME`および`PASSWORD`の値を`some-server.com`に送信します。
##### PostgreSQLに接続する例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCとPostgreSQL用ODBCドライバーをインストールする：

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（またはClickHouseを実行するユーザーでログインしている場合の`~/.odbc.ini`）を設定する：

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

ClickHouseでの辞書構成：

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 接続文字列に次のパラメータを指定できます： -->
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

ドライバーのライブラリへのフルパスを指定するために`odbc.ini`を編集する必要があるかもしれません。 `DRIVER=/usr/local/lib/psqlodbcw.so`。
##### MS SQL Serverに接続する例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLに接続するためのODBCドライバーをインストール：

``` bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーの設定：

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # TDS接続のテスト
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


    # （オプション）ODBC接続のテスト（isqlツールを使用するには[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストールしてください）
    $ isql -v MSSQL "user" "password"
```

備考：
- 特定のSQL Serverバージョンがサポートする最も古いTDSバージョンを特定するには、製品文書を参照するか、[MS-TDS製品の動作](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を見る必要があります。

ClickHouseでの辞書の設定：

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

設定の例：

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

設定フィールド：

- `port` – MySQLサーバーのポート。 これはすべてのレプリカに対して指定することも、各レプリカごとに個別に指定することもできます（`<replica>`内）。
- `user` – MySQLユーザーの名前。 これはすべてのレプリカに対して指定することも、各レプリカごとに個別に指定することもできます（`<replica>`内）。
- `password` – MySQLユーザーのパスワード。 これはすべてのレプリカに対して指定することも、各レプリカごとに個別に指定することもできます（`<replica>`内）。
- `replica` – レプリカ設定セクション。 複数のセクションを作成できます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。 接続を試みるとき、ClickHouseは優先度の順にレプリカを遍歴します。数が小さいほど優先度が高くなります。

- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択基準。 条件の構文はMySQLの`WHERE`句と同じで、例えば`id > 10 AND id < 20`のようになります。 オプションのパラメータです。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。 オプションのパラメータです。 辞書データの更新に関するセクション[辞書データの更新におけるLIFETIME](#refreshing-dictionary-data-using-lifetime)で詳しく説明しています。
- `fail_on_connection_loss` – 接続が失われたときのサーバーの動作を制御する設定パラメータ。 `true`の場合、クライアントとサーバーの接続が失われるとすぐに例外がスローされます。 `false`の場合、ClickHouseサーバーは、例外をスローする前にクエリを3回再実行します。 リトライにより応答時間が増加することに注意してください。 デフォルト値: `false`。
- `query` – カスタムクエリ。 オプションのパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒には使用できません。 どちらか一方の`table`または`query`フィールドを宣言する必要があります。
:::

:::note
明示的なパラメータ`secure`はありません。 SSL接続を確立するときはセキュリティが必須です。
:::

MySQLにはソケットを介してローカルホストへの接続ができます。 これを行うには、`host`と`socket`を設定します。

設定の例：

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

設定の例：

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

設定フィールド：

- `host` – ClickHouseホスト。 ローカルホストの場合、クエリはネットワークアクティビティなしで処理されます。 障害耐性を向上させるために、[分散](../../engines/table-engines/special/distributed.md)テーブルを作成し、次の構成に追加することができます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択基準。 省略することができます。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。 オプションのパラメータです。 辞書データの更新に関するセクション[辞書データの更新におけるLIFETIME](#refreshing-dictionary-data-using-lifetime)で詳しく説明しています。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。 オプションのパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒には使用できません。 どちらか一方の`table`または`query`フィールドを宣言する必要があります。
:::
#### MongoDB {#mongodb}

設定の例：

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

設定フィールド：

- `host` – MongoDBホスト。
- `port` – MongoDBサーバーのポート。
- `user` – MongoDBユーザーの名前。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベース名。
- `collection` – コレクション名。
- `options` - MongoDB接続文字列オプション（オプションのパラメータ）。

または

``` sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド：

- `uri` - 接続を確立するためのURI。
- `collection` – コレクション名。

[エンジンに関する詳細](../../engines/table-engines/integrations/mongodb.md)
```
```yaml
title: 'Redisの設定'
sidebar_label: 'Redis'
keywords:
  - 'Redis'
description: 'Redisの設定の例'
```

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

設定項目:

- `host` – Redisホスト。
- `port` – Redisサーバのポート。
- `storage_type` – キーとの作業に使用する内部Redisストレージの構造。`simple` はシンプルなソースおよびハッシュ化された単一キーソース用、`hash_map` は2つのキーを持つハッシュ化されたソース用です。範囲ソースおよび複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は `simple` です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。

```yaml
title: 'Cassandraの設定'
sidebar_label: 'Cassandra'
keywords:
  - 'Cassandra'
description: 'Cassandraの設定の例'
```

#### Cassandra {#cassandra}

設定の例:

``` xml
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

設定項目:

- `host` – Cassandraホストまたはカンマ区切りのホストリスト。
- `port` – Cassandraサーバのポート。指定しない場合、デフォルトのポート 9042 が使用されます。
- `user` – Cassandraユーザ名。
- `password` – Cassandraユーザのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリ（テーブル）の名前。
- `allow_filtering` – クラスタキー列に対する潜在的に高コストの条件を許可するフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルの主キーにおけるパーティションキー列の数。構成キー辞書に必要です。辞書定義におけるキー列の順序はCassandraと同じでなければなりません。デフォルト値は1（最初のキー列はパーティションキーで、他のキー列はクラスタキー）。
- `consistency` – 一貫性レベル。可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One`。
- `where` – オプションの選択基準。
- `max_threads` – 複数のパーティションからデータを読み込むために使用する最大スレッド数。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`column_family` または `where` フィールドは、`query` フィールドと一緒に使用できません。また、`column_family` または `query` フィールドのいずれかを宣言する必要があります。
:::

```yaml
title: 'PostgreSQLの設定'
sidebar_label: 'PostgreSQL'
keywords:
  - 'PostgreSQL'
description: 'PostgreSQLの設定の例'
```

#### PostgreSQL {#postgresql}

設定の例:

``` xml
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

設定項目:

- `host` – PostgreSQLサーバのホスト。すべてのレプリカに対して指定することも、各レプリカに個別に指定することもできます（`<replica>` 内）。
- `port` – PostgreSQLサーバのポート。すべてのレプリカに対して指定することも、各レプリカに個別に指定することもできます（`<replica>` 内）。
- `user` – PostgreSQLユーザ名。すべてのレプリカに対して指定することも、各レプリカに個別に指定することもできます（`<replica>` 内）。
- `password` – PostgreSQLユーザのパスワード。すべてのレプリカに対して指定することも、各レプリカに個別に指定することもできます（`<replica>` 内）。
- `replica` – レプリカ設定のセクション。複数のセクションが可能です:
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカを辿ります。数が小さいほど優先度が高くなります。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`。オプションのパラメータです。
- `invalidate_query` – 辞書の状態をチェックするためのクエリ。オプションのパラメータです。詳しくは[有効期限を使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションを参照してください。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。オプションのパラメータです。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` または `where` フィールドは、`query` フィールドと一緒に使用できません。また、`table` または `query` フィールドのいずれかを宣言する必要があります。
:::

```yaml
title: 'Nullソース'
sidebar_label: 'Null'
keywords:
  - 'Null'
description: 'ダミー辞書を作成するための特別なソース'
```

### Null {#null}

ダミー（空）辞書を作成するために使用できる特別なソース。このような辞書はテストや、分散テーブルでのデータとクエリノードが分離されているセットアップで役立ちます。

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

```yaml
title: '辞書のキーとフィールド'
sidebar_label: '辞書のキーとフィールド'
keywords:
  - '辞書'
description: '辞書の構造とフィールド'
```

## Dictionary Key and Fields {#dictionary-key-and-fields}

<CloudDetails />

`structure`句は、辞書キーおよびクエリで使用可能なフィールドを記述します。

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
- `<attribute>` — データカラム: 複数の属性がある場合があります。

DDLクエリ:

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリ本体で説明されます:

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性がある場合があります。

```yaml
title: 'キー'
sidebar_label: 'キー'
keywords:
  - 'キー'
description: 'ClickHouseがサポートするキーのタイプ'
```

## Key {#key}

ClickHouseは以下のタイプのキーをサポートしています:

- 数値キー。`UInt64`。`<id>`タグで定義されるか、`PRIMARY KEY`キーワードを使用して定義されます。
- 複合キー。異なるタイプの値のセット。`<key>`タグまたは`PRIMARY KEY`キーワードで定義されます。

XML構造には`<id>`または`<key>`のいずれかを含むことができます。DDLクエリには単一の`PRIMARY KEY`を含める必要があります。

:::note
キーを属性として記述してはいけません。
:::

```yaml
title: '数値キー'
sidebar_label: '数値キー'
keywords:
  - '数値キー'
description: '数値キーの設定例'
```

### Numeric Key {#numeric-key}

タイプ: `UInt64`。

構成の例:

``` xml
<id>
    <name>Id</name>
</id>
```

構成項目:

- `name` – キーを持つカラムの名前。

DDLクエリ用:

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを持つカラムの名前。

```yaml
title: '複合キー'
sidebar_label: '複合キー'
keywords:
  - '複合キー'
description: '複合キーの設定例'
```

### Composite Key {#composite-key}

キーは任意のタイプのフィールドの`tuple`であることができます。この場合、[レイアウト](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`でなければなりません。

:::tip
複合キーは単一の要素から構成されることができます。これにより、文字列をキーとして使用することが可能になります。
:::

キー構造は`<key>`要素で設定されます。キー項目は辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例:

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

`dictGet*`関数へのクエリでは、タプルをキーとして渡します。例: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

```yaml
title: '属性'
sidebar_label: '属性'
keywords:
  - '属性'
description: '辞書の属性設定例'
```

## Attributes {#attributes}

構成の例:

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

構成項目:

| タグ                                                  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 必須     |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい     |
| `type`                                               | ClickHouseデータ型: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書から指定されたデータ型への値のキャストを試みます。例えば、MySQLの場合、フィールドはMySQLソーステーブルで`TEXT`、`VARCHAR`、または`BLOB`であるかもしれませんが、ClickHouseでは`String`としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は、[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)辞書で現在サポートされています。[IPTrie](#ip_trie)辞書では`Nullable`タイプはサポートされていません。 | はい     |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>例では、空文字列です。NULL値は`Nullable`タイプにのみ使用できます（前述のタイプ説明を参照）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | はい     |
| `expression`                                         | ClickHouseが値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式はリモートSQLデータベース内のカラム名である場合があります。これにより、リモートカラムのエイリアスを作成することができます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | いいえ   |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`であれば、その属性は現在のキーの親キーの値を含みます。[階層辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | いいえ   |
| `injective`                                          | `id -> attribute`の画像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true`であれば、ClickHouseは辞書に対する要求を`GROUP BY`句の後に自動的に配置することができます。通常、これによりそのような要求の数が大幅に減少します。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | いいえ   |
| `is_object_id`                                       | クエリが`ObjectID`によってMongoDBドキュメントに対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | いいえ   |

```yaml
title: '階層辞書'
sidebar_label: '階層辞書'
keywords:
  - '階層辞書'
description: 'ClickHouseにおける階層辞書のサポートについて'
```

## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouseは[数値キー](#numeric-key)を持つ階層辞書をサポートしています。

次の階層構造を見てください:

``` text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (センター)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は次の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | センター      |
| 4          | 0              | イギリス      |
| 5          | 4              | ロンドン      |

このテーブルには、要素の最も近い親のキーを含むカラム`parent_region`があります。

ClickHouseは外部辞書属性に対して階層的な性質をサポートしています。この属性を使用すると、前述のように階層辞書を構成することができます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得することができます。

私たちの例では、辞書の構造は次のようになる可能性があります:

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
```yaml
title: 'ポリゴン辞書'
sidebar_label: 'ポリゴン辞書'
keywords: 'ポリゴン 辞書'
description: 'ポリゴン辞書は、指定された点を含むポリゴンを効率的に検索することを可能にします。'
```

## ポリゴン辞書 {#polygon-dictionaries}

ポリゴン辞書は、指定された点を含むポリゴンを効率的に検索することを可能にします。  
例えば、地理的座標によって都市の領域を定義することです。

ポリゴン辞書の設定の例：

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

対応する [DDL-query](/sql-reference/statements/create/dictionary):
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

ポリゴン辞書を設定する際、キーは二つのタイプのいずれかでなければなりません：

- 単純ポリゴン。これは点の配列です。
- MultiPolygon。これはポリゴンの配列です。各ポリゴンは点の二次元配列です。この配列の最初の要素がポリゴンの外境、以降の要素はその中から除外する領域を指定します。

点は配列またはその座標のタプルとして指定できます。現在の実装では、二次元の点のみがサポートされています。

ユーザーは、ClickHouseがサポートするすべてのフォーマットで自分のデータをアップロードできます。

利用可能な [インメモリストレージ](#storing-dictionaries-in-memory) のタイプは3つあります：

- `POLYGON_SIMPLE`。これは簡単な実装で、各クエリごとにすべてのポリゴンを線形に走査し、それぞれでメンバーシップをチェックしますが、追加のインデックスを使用しません。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して個別のインデックスが構築され、ほとんどの場合、どのポリゴンに属するかを迅速にチェックできます（地理的地域に最適化されています）。また、考慮中の地域にグリッドが重ねられ、考慮すべきポリゴンの数が大幅に絞り込まれます。このグリッドは、セルを16等分する形で再帰的に作成され、二つのパラメータで設定されます。再帰の深さが`MAX_DEPTH`に達するか、セルが`MIN_INTERSECTIONS`ポリゴンを越えない場合に分割は停止します。クエリに応じて対応するセルがあり、そこに格納されたポリゴンのインデックスに交互にアクセスします。

- `POLYGON_INDEX_CELL`。この配置でも、上記のようなグリッドが作成されます。同じオプションが利用可能です。各シートセルに対して、その中に入るすべてのポリゴンのピースに対してインデックスが構築され、迅速に応答が可能です。

- `POLYGON`。`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書を操作するための標準 [関数](../../sql-reference/functions/ext-dict-functions.md) を使用して実行されます。重要な違いは、ここでのキーは、それらを含むポリゴンを見つけたい点です。

**例**

上記で定義された辞書を使用する例：

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

`points` テーブルの各点に対して最後のコマンドを実行した結果、最小の領域ポリゴンが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書からのカラムは、SELECTクエリを通じて読み取ることができ、辞書設定または対応するDDLクエリで `store_polygon_key_column = 1` を有効にするだけで済みます。

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

正規表現ツリー辞書は、キーと属性のマッピングを正規表現のツリーを使用して表現する特別なタイプの辞書です。例として、[ユーザーエージェント](https://en.wikipedia.org/wiki/User_agent) 文字列の解析があり、これは正規表現ツリー辞書を使用して優雅に表現できます。

### ClickHouseオープンソースでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、正規表現ツリーを含むYAMLファイルへのパスを提供するYAMLRegExpTreeソースを使用してClickHouseオープンソースで定義されます。

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

辞書ソース `YAMLRegExpTree` は、regexpツリーの構造を表します。例えば：

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

この設定は、正規表現ツリーのノードのリストで構成されます。各ノードは次の構造を持ちます：

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義辞書属性のリスト。この例では二つの属性があり、`name` と `version` です。最初のノードが両方の属性を定義し、二番目のノードは属性`name`のみを定義します。属性`version`は二番目のノードの子ノードによって提供されます。
  - 属性の値は、マッチした正規表現のキャプチャグループを参照する**バックリファレンス**を含む場合があります。この例では、最初のノードの属性`version`の値は、正規表現内のキャプチャグループ`(\d+[\.\d]*)`のバックリファレンス`\1`で構成されています。バックリファレンス番号は1から9までで、`$1`または`\1`（番号1の場合）として書かれます。バックリファレンスは、クエリ実行中にマッチしたキャプチャグループによって置き換えられます。
- **child nodes**: 正規表現ツリーノードの子のリストで、それぞれ独自の属性と（潜在的に）子ノードを持っています。文字列のマッチングは深さ優先で進行します。文字列が正規表現ノードにマッチする場合、辞書はノードの子ノードにもマッチするかどうかを確認します。もしマッチすれば、最も深くマッチしたノードの属性が割り当てられます。子ノードの属性は、親ノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は任意で、例えば上の例での`versions`などです。

正規表現ツリー辞書には、`dictGet`、`dictGetOrDefault`、および `dictGetAll` 関数でのみアクセスできます。

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

この場合、最初に正規表現`\d+/tclwebkit(?:\d+[\.\d]*)`が最上層の第二ノードでマッチします。辞書はその後、子ノードを調べ続け、文字列が`3[12]/tclwebkit`にもマッチすることを発見します。その結果、属性`name`の値は`Android`（最初のレイヤーで定義された）であり、属性`version`の値は`12`（子ノードで定義された）となります。

強力なYAML設定ファイルを使用することで、正規表現ツリー辞書をユーザーエージェント文字列パーサーとして利用できます。私たちは [uap-core](https://github.com/ua-parser/uap-core) をサポートしており、機能テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) での使用方法を示しています。
#### 属性値の収集 {#collecting-attribute-values}

時には、葉ノードの値だけでなく、マッチした複数の正規表現からの値を返すことが有用です。このような場合、特化した [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 関数を使用できます。ノードに属性値の型`T`がある場合、`dictGetAll` はゼロまたはそれ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチの数に制限はありません。制限は、`dictGetAll` にオプションの第四引数として渡すことができます。配列は _トポロジカル順序_ でポピュレートされ、つまり子ノードが親ノードの前に来て、兄弟ノードはソースの順序に従います。

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
#### マッチモード {#matching-modes}

パターンマッチングの動作は、特定の辞書設定によって変更できます：
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを使用します（デフォルトは`false`）。個々の表現で`(?i)`および`(?-i)`で上書きできます。
- `regexp_dict_flag_dotall`: `.`が改行文字と一致することを許可します（デフォルトは`false`）。
### ClickHouse Cloudでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースは ClickHouseオープンソースで動作しますが、ClickHouse Cloudでは動作しません。ClickHouse Cloudで正規表現ツリー辞書を使用するには、初めにClickHouseオープンソースでYAMLファイルから正規表現ツリー辞書を作成し、次に `dictionary` テーブル関数および [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してこの辞書をCSVファイルにダンプします。

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
- `regexp String`: 正規表現の文字列。
- `keys Array(String)`: ユーザー定義の属性の名前。
- `values Array(String)`: ユーザー定義の属性の値。

ClickHouse Cloudに辞書を作成するには、まず次のテーブル構造で `regexp_dictionary_source_table` を作成します：

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

次に、ローカルCSVを以下のように更新します。

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

詳細については、[ローカルファイルを挿入](https://clickhouse.com/docs/ja/operations/insert/insert-local-files) を参照できます。ソーステーブルを初期化したら、テーブルソースからRegexpTreeを作成できます：

``` sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
## 組み込み辞書 {#embedded-dictionaries}

<SelfManaged />

ClickHouseには、ジオベースで作業するための組み込み機能があります。

これにより、次のことが可能になります：

- 地域のIDを使用して、希望の言語でその名前を取得する。
- 地域のIDを使用して、都市、地域、連邦地区、国、または大陸のIDを取得する。
- 地域が別の地域の一部であるかどうかを確認する。
- 親地域の連鎖を取得する。

すべての関数は「トランスローカリティ」をサポートしており、地域の所有権に関する異なる視点を同時に使用する能力を持っています。詳細については、「ウェブ分析辞書を操作するための関数」のセクションを参照してください。

内部辞書はデフォルトパッケージで無効になっています。これらを有効にするには、サーバー設定ファイルで `path_to_regions_hierarchy_file` および `path_to_regions_names_files` パラメータのコメントを外します。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この構成パラメータには `regions_hierarchy.txt` ファイル（デフォルトの地域階層）へのパスが含まれている必要があり、他のファイル（`regions_hierarchy_ua.txt`）も同じディレクトリに配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルは自分で作成することもできます。ファイルフォーマットは次の通りです：

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 親地域ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 市; 他のタイプには値がない
- 人口 (`UInt32`) — 任意のカラム

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含めることはできない（エスケープされたものも含まれない）。

RAMに保存するためにフラットな配列が使用されます。このため、IDは百万を超えないようにしてください。

辞書はサーバーを再起動せずに更新できます。ただし、使用可能な辞書のセットは更新されません。更新時にはファイルの変更時刻が確認されます。ファイルが変更されている場合、辞書が更新されます。変更を確認する間隔は `builtin_dictionaries_reload_interval` パラメータで設定できます。最初の使用時のロードを除き、辞書の更新はクエリをブロックしません。更新中は、クエリは古いバージョンの辞書を使用します。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは古いバージョンの辞書を使用し続けます。

私たちは、ジオベースで辞書を定期的に更新することを推奨します。更新中は新しいファイルを生成し、それらを別の場所に書き込みます。すべての準備が整ったら、サーバーが使用するファイルに名前を変更します。

OS識別子や検索エンジンを操作するための関数もありますが、それらは使用しないことを推奨します。
