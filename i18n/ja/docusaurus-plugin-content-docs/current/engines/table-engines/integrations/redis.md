---
slug: /engines/table-engines/integrations/redis
sidebar_position: 175
sidebar_label: Redis
title: "Redis"
description: "このエンジンはClickHouseをRedisと統合することを可能にします。"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Redis

<CloudNotSupportedBadge/>

このエンジンはClickHouseを[Redis](https://redis.io/)と統合することを可能にします。Redisはキーバリュー(KV)モデルを採用しているため、`where k=xx`や`where k in (xx, xx)`のようにポイントクエリでの利用を強く推奨します。

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

- `host:port` — Redisサーバーのアドレス。ポートを省略することができ、その場合はデフォルトのRedisポート6379が使用されます。
- `db_index` — Redisのデータベースインデックス、範囲は0から15までで、デフォルトは0です。
- `password` — ユーザーパスワード、デフォルトは空の文字列です。
- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16です。
- `primary_key_name` - カラムリスト内の任意のカラム名。

:::note シリアライズ
`PRIMARY KEY`は1つのカラムのみをサポートします。主キーはバイナリ形式でRedisキーとしてシリアライズされます。主キー以外のカラムは対応する順序でRedis値としてバイナリ形式でシリアライズされます。
:::

引数は[named collections](/operations/named-collections.md)を使用しても渡すことができます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは本番環境で推奨されます。この時点で、named collectionsを介してRedisに渡されるすべてのパラメータは必須です。

:::note フィルタリング
`key equals`または`in filtering`のクエリは、Redisからのマルチキー検索に最適化されます。フィルタリングキーなしのクエリでは、全テーブルスキャンが行われ、これは重い操作です。
:::

## 使用例 {#usage-example}

プレーンな引数で`Redis`エンジンを使用してClickHouseにテーブルを作成します。

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

または[named collections](/operations/named-collections.md)を使用します。

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

Redisデータベースを非同期にフラッシュします。また、`Truncate`はSYNCモードをサポートしています。

```sql
TRUNCATE TABLE redis_table SYNC;
```

結合:

他のテーブルと結合します。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 制限事項 {#limitations}

Redisエンジンは`where k > xx`のようなスキャンクエリもサポートしていますが、いくつかの制限があります:
1. スキャンクエリは、非常に稀なケースで再ハッシュ時に重複したキーを生成する可能性があります。詳細は[Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)を参照してください。
2. スキャン中にキーが作成または削除されると、結果のデータセットは有効な時点を表すことができません。
