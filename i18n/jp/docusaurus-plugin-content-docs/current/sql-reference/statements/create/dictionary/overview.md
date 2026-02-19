---
description: 'Dictionary の作成と構成に関するドキュメント'
sidebar_label: '概要'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import CloudSupportedBadge from '@theme/badges/CloudSupportedBadge';


# CREATE DICTIONARY \{#create-dictionary\}

Dictionary は (`key -> attributes`) のマッピングであり、さまざまな種類の参照リストに適しています。
ClickHouse は、クエリ内で使用できる Dictionary 用の専用関数をサポートしています。参照テーブルとの `JOIN` を使うよりも、Dictionary をこれらの関数と組み合わせて使用する方が簡単かつ効率的です。

Dictionary を作成する方法は 2 つあります:

- [DDL クエリを使用する方法](#creating-a-dictionary-with-a-ddl-query)（推奨）
- [設定ファイルを使用する方法](#creating-a-dictionary-with-a-configuration-file)

## DDLクエリでDictionaryを作成する \{#creating-a-dictionary-with-a-ddl-query\}

<CloudSupportedBadge/>

DictionaryはDDLクエリを使って作成できます。  
この方法での作成が推奨されるのは、次の理由によります:

- サーバーの設定ファイルに追加のレコードを追記する必要がありません。
- Dictionaryをテーブルや VIEW などの第一級のエンティティと同様に扱うことができます。
- Dictionaryテーブル関数ではなく、なじみのある `SELECT` 構文を使ってデータを直接読み取ることができます。`SELECT` 文でDictionaryに直接アクセスする場合、キャッシュ型Dictionaryはキャッシュされているデータのみを返し、非キャッシュ型Dictionaryでは保持しているすべてのデータを返すことに注意してください。
- Dictionaryは容易に名前を変更できます。

### 構文 \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1  type1  [DEFAULT | EXPRESSION expr1] [IS_OBJECT_ID],
    key2  type2  [DEFAULT | EXPRESSION expr2],
    attr1 type2  [DEFAULT | EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2  [DEFAULT | EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

| Clause                                      | Description                                                           |
| ------------------------------------------- | --------------------------------------------------------------------- |
| [Attributes](./attributes.md)               | Dictionary の属性はテーブルのカラムと同様に指定します。必須プロパティは型のみで、それ以外にはデフォルト値を設定できます。    |
| PRIMARY KEY                                 | Dictionary に対するルックアップ用のキーとなるカラムを定義します。レイアウトに応じて、1 つ以上の属性をキーとして指定できます。 |
| [`SOURCE`](./sources/)                      | Dictionary のデータソースを定義します（例: ClickHouse テーブル、HTTP、PostgreSQL）。         |
| [`LAYOUT`](./layouts/)                      | Dictionary をメモリ上にどのように格納するかを制御します（例: `FLAT`, `HASHED`, `CACHE`）。      |
| [`LIFETIME`](./lifetime.md)                 | Dictionary のリフレッシュ間隔を設定します。                                           |
| [`ON CLUSTER`](../../../distributed-ddl.md) | クラスタ上に Dictionary を作成します。省略可能です。                                      |
| `SETTINGS`                                  | 追加の Dictionary 設定を指定します。省略可能です。                                       |
| `COMMENT`                                   | Dictionary にテキストコメントを追加します。省略可能です。                                    |


## 設定ファイルを使用して Dictionary を作成する \{#creating-a-dictionary-with-a-configuration-file\}

<CloudNotSupportedBadge />

:::note
設定ファイルを使用して Dictionary を作成する方法は ClickHouse Cloud ではサポートされていません。上記の DDL を使用し、`default` USER として Dictionary を作成してください。
:::

Dictionary の設定ファイルは次の形式です。

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

同じファイル内に任意の数の辞書を設定できます。


## 関連コンテンツ \{#related-content\}

- [Layouts](./layouts/) — Dictionary がメモリ上でどのように格納されるか
- [Sources](./sources/) — データソースへの接続方法
- [Lifetime](./lifetime.md) — 自動更新の設定
- [Attributes](./attributes.md) — キーおよび属性の設定
- [Embedded Dictionaries](./embedded.md) — 組み込み geobase Dictionary
- [system.dictionaries](../../../../operations/system-tables/dictionaries.md) — Dictionary 情報を保持するシステムテーブル