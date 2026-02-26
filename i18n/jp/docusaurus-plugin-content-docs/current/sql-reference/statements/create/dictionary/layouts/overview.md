---
description: 'Dictionary をメモリ内に格納するためのレイアウト型'
sidebar_label: '概要'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary/layouts
title: 'Dictionary レイアウト'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## Dictionary のレイアウトタイプ \{#storing-dictionaries-in-memory\}

Dictionary をメモリ上に保存する方法にはさまざまな種類があり、それぞれ CPU および RAM の使用量にトレードオフがあります。

| Layout | 説明 |
|---|---|
| [flat](./flat.md) | キーでインデックスされたフラットな配列にデータを格納します。最も高速なレイアウトですが、キーは `UInt64` であり、`max_array_size` の範囲内である必要があります。 |
| [hashed](./hashed.md) | データをハッシュテーブルに格納します。キーサイズにも要素数にも制限がありません。 |
| [sparse_hashed](./hashed.md#sparse_hashed) | `hashed` に似ていますが、CPU を多く消費する代わりにメモリ使用量を抑えます。 |
| [complex_key_hashed](./hashed.md#complex_key_hashed) | 複合キー向けの `hashed` に似たレイアウトです。 |
| [complex_key_sparse_hashed](./hashed.md#complex_key_sparse_hashed) | 複合キー向けの `sparse_hashed` に似たレイアウトです。 |
| [hashed_array](./hashed-array.md) | 属性を配列に格納し、キーから配列インデックスへのマッピングをハッシュテーブルで管理します。多くの属性を扱う場合にメモリ効率が高くなります。 |
| [complex_key_hashed_array](./hashed-array.md#complex_key_hashed_array) | 複合キー向けの `hashed_array` に似たレイアウトです。 |
| [range_hashed](./range-hashed.md) | ソートされた範囲を持つハッシュテーブルです。キー + 日付/時刻の範囲によるルックアップをサポートします。 |
| [complex_key_range_hashed](./range-hashed.md#complex_key_range_hashed) | 複合キー向けの `range_hashed` に似たレイアウトです。 |
| [cache](./cache.md) | 固定サイズのインメモリキャッシュです。頻繁にアクセスされるキーのみが保存されます。 |
| [complex_key_cache](/sql-reference/statements/create/dictionary/layouts/hashed#complex_key_hashed) | 複合キー向けの `cache` に似たレイアウトです。 |
| [ssd_cache](./ssd-cache.md) | `cache` に似ていますが、データを SSD 上に保存し、インメモリのインデックスを持ちます。 |
| [complex_key_ssd_cache](./ssd-cache.md#complex_key_ssd_cache) | 複合キー向けの `ssd_cache` に似たレイアウトです。 |
| [direct](./direct.md) | インメモリでの保存を行わず、各リクエストごとにソースを直接クエリします。 |
| [complex_key_direct](./direct.md#complex_key_direct) | 複合キー向けの `direct` に似たレイアウトです。 |
| [ip_trie](./ip-trie.md) | 高速な IP プレフィックスルックアップ（CIDR ベース）のための Trie 構造です。 |

:::tip 推奨レイアウト
[flat](./flat.md)、[hashed](./hashed.md)、および [complex_key_hashed](./hashed.md#complex_key_hashed) は、最も優れたクエリ性能を提供します。
キャッシュ系レイアウトは、性能が出にくく、パラメータ調整も困難なため推奨されません。詳細は [cache](./cache.md) を参照してください。
:::

## Dictionary レイアウトを指定する \{#specify-dictionary-layout\}

<CloudDetails />

Dictionary レイアウトは、DDL では `LAYOUT` 句、設定ファイル定義では `layout` 設定で指定できます。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

</TabItem>
<TabItem value="xml" label="Configuration file">

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

</TabItem>
</Tabs>

<br/>

完全な DDL 構文については、[CREATE DICTIONARY](../overview.md) も参照してください。

レイアウトに `complex-key*` という語を含まない Dictionary は、キーとして [UInt64](/sql-reference/data-types/int-uint.md) 型を持ち、`complex-key*` を含む Dictionary は複合キー（任意の型を組み合わせた複雑なキー）を持ちます。

**数値キーの例**（カラム `key_column` は [UInt64](/sql-reference/data-types/int-uint.md) 型）:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    key_column UInt64,
    ...
)
PRIMARY KEY key_column
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <id>
        <name>key_column</name>
    </id>
    ...
</structure>
```

</TabItem>
</Tabs>

<br/>

**複合キーの例**（キーは [String](/sql-reference/data-types/string.md) 型の要素を 1 つ持つ）:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    country_code String,
    ...
)
PRIMARY KEY country_code
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
    ...
</structure>
```

</TabItem>
</Tabs>

## Dictionary のパフォーマンスを改善する \{#improve-performance\}

Dictionary のパフォーマンスを改善する方法がいくつかあります。

- Dictionary を操作する関数は `GROUP BY` の後に呼び出します。
- 抽出する属性を単射としてマークします。
  属性は、異なるキーに対して異なる属性値が対応する場合に単射と呼ばれます。
  そのため、`GROUP BY` がキーから属性値を取得する関数を使用している場合、この関数は自動的に `GROUP BY` の外に分離されます。

ClickHouse は Dictionary に関連するエラーに対して例外をスローします。
エラーの例としては次のようなものがあります。

- アクセスしようとしている Dictionary をロードできなかった。
- `cached` Dictionary へのクエリでエラーが発生した。

[system.dictionaries](/operations/system-tables/dictionaries.md) テーブルで Dictionary の一覧とそのステータスを確認できます。