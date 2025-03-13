---
slug: /sql-reference/table-functions/redis
sidebar_position: 170
sidebar_label: redis
title: "redis"
description: "このテーブル関数は、ClickHouseとRedisを統合することを可能にします。"
---


# redis テーブル関数

このテーブル関数は、ClickHouseと [Redis](https://redis.io/) を統合することを可能にします。

**構文**

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

**引数**

- `host:port` — Redisサーバーのアドレス。ポートを無視することができ、デフォルトのRedisポート6379が使用されます。

- `key` — カラムリスト内の任意のカラム名。

- `structure` — この関数から返されるClickHouseテーブルのスキーマ。

- `db_index` — RedisのDBインデックスは0から15の範囲、デフォルトは0。

- `password` — ユーザーパスワード、デフォルトは空文字列。

- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16。

- `primary` は指定する必要があり、主キーには1つのカラムのみをサポートします。主キーはバイナリ形式でRedisキーとしてシリアライズされます。

- 主キー以外のカラムは、対応する順序でRedis値としてバイナリ形式でシリアライズされます。

- キーが等しいかフィルタリング内のクエリは、Redisからのマルチキーのルックアップに最適化されます。フィルタリングキーなしのクエリでは、全テーブルスキャンが発生し、これは負荷の高い操作です。

現時点では、`redis` テーブル関数に対して [名前付きコレクション](/operations/named-collections.md) はサポートされていません。

**戻り値**

キーをRedisキーとし、他のカラムを一緒にパッケージ化したRedis値を持つテーブルオブジェクト。

## 使用例 {#usage-example}

Redisから読み取る:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redisに挿入する:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

**参照**

- [`Redis` テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [辞書ソースとしてのRedisの使用](/sql-reference/dictionaries/index.md#redis)
