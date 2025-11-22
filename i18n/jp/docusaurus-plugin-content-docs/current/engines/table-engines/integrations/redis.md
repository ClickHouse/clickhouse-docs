---
description: 'このエンジンは、ClickHouse と Redis の統合を可能にします。'
sidebar_label: 'Redis'
sidebar_position: 175
slug: /engines/table-engines/integrations/redis
title: 'Redis テーブルエンジン'
doc_type: 'guide'
---



# Redis テーブルエンジン

このエンジンにより、ClickHouse を [Redis](https://redis.io/) と統合できます。Redis はキー・バリュー (KV) モデルを採用しているため、`where k=xx` や `where k in (xx, xx)` のようなポイントルックアップのみを行うことを強く推奨します。



## テーブルの作成 {#creating-a-table}

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

- `host:port` — Redisサーバーのアドレス。ポートを省略した場合、デフォルトのRedisポート6379が使用されます。
- `db_index` — Redisデータベースインデックス。0から15の範囲で指定します。デフォルトは0です。
- `password` — ユーザーパスワード。デフォルトは空文字列です。
- `pool_size` — Redisの最大接続プールサイズ。デフォルトは16です。
- `primary_key_name` — カラムリスト内の任意のカラム名。

:::note シリアライゼーション
`PRIMARY KEY`は1つのカラムのみをサポートします。プライマリキーはRedisキーとしてバイナリ形式でシリアライズされます。
プライマリキー以外のカラムは、対応する順序でRedis値としてバイナリ形式でシリアライズされます。
:::

引数は[名前付きコレクション](/operations/named-collections.md)を使用して渡すこともできます。この場合、`host`と`port`は個別に指定する必要があります。このアプローチは本番環境で推奨されます。現時点では、名前付きコレクションを使用してRedisに渡されるすべてのパラメータが必須です。

:::note フィルタリング
`key equals`または`in filtering`を使用したクエリは、Redisからの複数キー検索に最適化されます。キーによるフィルタリングを行わないクエリの場合、フルテーブルスキャンが発生し、これは負荷の高い操作となります。
:::


## 使用例 {#usage-example}

プレーン引数を使用して`Redis`エンジンでClickHouseにテーブルを作成します:

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

または[名前付きコレクション](/operations/named-collections.md)を使用します:

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

クエリ:

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

更新:

プライマリキーは更新できないことに注意してください。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

削除:

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

トランケート:

Redisデータベースを非同期でフラッシュします。また、`Truncate`はSYNCモードもサポートしています。

```sql
TRUNCATE TABLE redis_table SYNC;
```

結合:

他のテーブルと結合します。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```


## 制限事項 {#limitations}

Redisエンジンは`where k > xx`のようなスキャンクエリもサポートしていますが、以下の制限事項があります：

1. スキャンクエリは、リハッシュ中に極めて稀なケースで重複したキーを生成する可能性があります。詳細は[Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)を参照してください。
2. スキャン中にキーが作成または削除される可能性があるため、結果のデータセットは特定時点の有効な状態を表すことができません。
