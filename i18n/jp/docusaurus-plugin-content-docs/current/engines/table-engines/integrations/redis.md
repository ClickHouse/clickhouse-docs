---
description: 'このエンジンにより、ClickHouse と Redis を統合できます。'
sidebar_label: 'Redis'
sidebar_position: 175
slug: /engines/table-engines/integrations/redis
title: 'Redis テーブルエンジン'
doc_type: 'guide'
---



# Redis テーブルエンジン {#redis-table-engine}

このエンジンにより、ClickHouse を [Redis](https://redis.io/) と連携させることができます。Redis はキー・バリュー（KV）モデルを採用しているため、`where k=xx` や `where k in (xx, xx)` のようなポイントアクセスのクエリに限定して利用することを強く推奨します。



## テーブルを作成する {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**エンジンパラメータ**

* `host:port` — Redis サーバーのアドレス。`port` を省略した場合は、Redis のデフォルトポート 6379 が使用されます。
* `db_index` — Redis の DB インデックス。範囲は 0〜15 で、デフォルトは 0 です。
* `password` — ユーザーのパスワード。デフォルトは空文字列です。
* `pool_size` — Redis の最大接続プールサイズ。デフォルトは 16 です。
* `primary_key_name` - カラムリスト内の任意のカラム名。

:::note シリアライゼーション
`PRIMARY KEY` は 1 つのカラムのみをサポートします。プライマリキーは Redis のキーとしてバイナリ形式でシリアライズされます。
プライマリキー以外のカラムは、対応する順序で Redis の値としてバイナリ形式でシリアライズされます。
:::

引数は [named collections](/operations/named-collections.md) を使って渡すこともできます。この場合、`host` と `port` は個別に指定する必要があります。この方法は本番環境での利用に推奨されます。現時点では、named collections を使って Redis に渡されるすべてのパラメータは必須です。

:::note フィルタリング
`key equals` または `in filtering` を含むクエリは、Redis からの複数キーのルックアップに最適化されます。フィルタリング用のキーを指定しないクエリではテーブル全体スキャンが発生し、高コストな処理になります。
:::


## 使用例 {#usage-example}

単純な引数を用いて、`Redis` エンジンを使用する ClickHouse のテーブルを作成します：

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

または、[named collections](/operations/named-collections.md) を使用します:

```xml
<named_collections>
    <redis_creds>
        <host>localhost</host>
        <port>6379</port>
        <password>****</password>
        <pool_size>16</pool_size>
        <db_index>s0</db_index>
    </redis_creds>
</named_collections>
```

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis(redis_creds) PRIMARY KEY(key);
```

挿入:

```sql
INSERT INTO redis_table VALUES('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

クエリ：

```sql
SELECT COUNT(*) FROM redis_table;
```

```text
┌─count()─┐
│       2 │
└─────────┘
```

```sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

```sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

更新：

なお、主キーは更新できません。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

削除：

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

Truncate:

Redis のデータベースを非同期でフラッシュします。`Truncate` は同期（SYNC）モードにも対応しています。

```sql
TRUNCATE TABLE redis_table SYNC;
```

Join:

他のテーブルと結合します。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```


## 制約事項 {#limitations}

Redis エンジンは `where k > xx` のようなスキャンクエリもサポートしますが、いくつかの制約事項があります。
1. リハッシュ処理中のごくまれなケースでは、スキャンクエリによって重複したキーが返される場合があります。詳細は [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269) を参照してください。
2. スキャンの最中にキーが作成・削除される可能性があるため、得られるデータセットは特定時点の一貫した状態を表しているとは限りません。
