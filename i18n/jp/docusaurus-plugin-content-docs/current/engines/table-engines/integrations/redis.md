---
slug: /engines/table-engines/integrations/redis
sidebar_position: 175
sidebar_label: Redis
title: "Redis"
description: "このエンジンはClickHouseとRedisの統合を可能にします。"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Redis

<CloudNotSupportedBadge/>

このエンジンはClickHouseと[Redis](https://redis.io/)の統合を可能にします。Redisはkvモデルを採用しているため、`where k=xx`や`where k in (xx, xx)`のようにポイント的にクエリを実行することを強く推奨します。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**エンジンパラメータ**

- `host:port` — Redisサーバーのアドレス。ポートを省略すると、デフォルトのRedisポート6379が使用されます。
- `db_index` — Redisのdbインデックスは0から15までの範囲で、デフォルトは0です。
- `password` — ユーザーパスワード、デフォルトは空の文字列です。
- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16です。
- `primary_key_name` - カラムリストの任意のカラム名です。

:::note シリアル化
`PRIMARY KEY`は1つのカラムのみをサポートします。主キーはRedisキーとしてバイナリ形式でシリアル化されます。主キー以外のカラムは、対応する順序でRedis値としてバイナリ形式でシリアル化されます。
:::

引数は、[名前付きコレクション](/operations/named-collections.md)を使用して渡すこともできます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは本番環境で推奨されます。現時点では、Redisに渡される名前付きコレクションのすべてのパラメータが必須です。

:::note フィルタリング
`key equals`または`in filtering`を含むクエリは、Redisからのマルチキーのルックアップに最適化されます。フィルタリングキーなしのクエリは、フルテーブルスキャンを引き起こし、これは負荷の高い操作です。
:::

## 使用例 {#usage-example}

プレーンな引数を使用して、`Redis`エンジンでClickHouseにテーブルを作成します。

``` sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

または、[名前付きコレクション](/operations/named-collections.md)を使用して：

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
INSERT INTO redis_table Values('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

クエリ:

``` sql
SELECT COUNT(*) FROM redis_table;
```

``` text
┌─count()─┐
│       2 │
└─────────┘
```

``` sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

``` sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

更新:

主キーは更新できないことに注意してください。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

削除:

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

トランケート:

Redis dbを非同期でフラッシュします。また、`Truncate`はSYNCモードをサポートします。

```sql
TRUNCATE TABLE redis_table SYNC;
```

結合:

他のテーブルとの結合。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 制限事項 {#limitations}

Redisエンジンは`where k > xx`のようなスキャンクエリもサポートしていますが、いくつかの制限があります：
1. スキャンクエリは、非常に珍しいケースでリハッシュ中に重複するキーを生成する可能性があります。[Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)で詳しく説明しています。
2. スキャン中にキーが作成されたり削除されたりすることがあるため、結果のデータセットは有効な時点を表すことはできません。
