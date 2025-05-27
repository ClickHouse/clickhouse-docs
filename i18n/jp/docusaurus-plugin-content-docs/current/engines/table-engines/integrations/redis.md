---
'description': 'This engine allows integrating ClickHouse with Redis.'
'sidebar_label': 'Redis'
'sidebar_position': 175
'slug': '/engines/table-engines/integrations/redis'
'title': 'Redis'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Redis

<CloudNotSupportedBadge/>

このエンジンは、ClickHouseを[Redis](https://redis.io/)と統合することを可能にします。Redisはkvモデルを使用するため、`where k=xx`や`where k in (xx, xx)`のようにポイントでのみクエリを実行することを強く推奨します。

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

- `host:port` — Redisサーバーのアドレス。ポートを無視することができ、デフォルトのRedisポート6379が使用されます。
- `db_index` — Redisのdbインデックスは0から15の範囲、デフォルトは0です。
- `password` — ユーザーパスワード、デフォルトは空文字列です。
- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16です。
- `primary_key_name` - カラムリストの任意のカラム名。

:::note シリアル化
`PRIMARY KEY`は1つのカラムのみをサポートします。プライマリキーはRedisキーとしてバイナリにシリアル化されます。
プライマリキー以外のカラムは対応する順序でRedis値としてバイナリにシリアル化されます。
:::

引数は[named collections](/operations/named-collections.md)を使用して渡すこともできます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは、本番環境で推奨されます。この時点で、named collectionsを使用してRedisに渡されるすべてのパラメータは必須です。

:::note フィルタリング
`key equals`または`in filtering`を伴うクエリは、Redisからの複数キーのルックアップに最適化されます。フィルタリングキーなしのクエリでは、全テーブルスキャンが発生し、これは重い操作です。
:::

## 使用例 {#usage-example}

プレーン引数を使用して`Redis`エンジンでClickHouseにテーブルを作成します：

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

もしくは[named collections](/operations/named-collections.md)を使用して：

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

挿入：

```sql
INSERT INTO redis_table Values('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
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

プライマリキーは更新できないことに注意してください。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

削除：

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

トランケート：

Redis dbを非同期でフラッシュします。また、`Truncate`はSYNCモードをサポートしています。

```sql
TRUNCATE TABLE redis_table SYNC;
```

結合：

他のテーブルと結合します。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 制限事項 {#limitations}

Redisエンジンは、`where k > xx`のようなスキャンクエリもサポートしていますが、いくつかの制限があります：
1. スキャンクエリは、リハッシュ中に非常にまれに重複したキーを生成する可能性があります。詳細は[Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)を参照してください。
2. スキャン中にキーが作成され、削除される可能性があるため、結果のデータセットは有効な時点を表さないことがあります。
