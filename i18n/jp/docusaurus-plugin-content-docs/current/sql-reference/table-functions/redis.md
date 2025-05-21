---
description: 'このテーブル関数は、ClickHouseをRedisと統合することを可能にします。'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
---


# redis テーブル関数

このテーブル関数は、ClickHouseを[Redis](https://redis.io/)と統合することを可能にします。

**構文**

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

**引数**

- `host:port` — Redisサーバーのアドレスで、ポートを無視することができ、デフォルトのRedisポート6379が使用されます。

- `key` — カラムリスト内の任意のカラム名。

- `structure` — この関数から返されるClickHouseテーブルのスキーマ。

- `db_index` — Redisのdbインデックスは0から15の範囲、デフォルトは0です。

- `password` — ユーザーパスワード、デフォルトは空文字列です。

- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16です。

- `primary` は指定する必要があり、主キーには1つのカラムのみがサポートされています。主キーは、Redisキーとしてバイナリ形式でシリアライズされます。

- 主キー以外のカラムは、対応する順序でRedis値としてバイナリ形式でシリアライズされます。

- キーが等しいかフィルタリングの中にあるクエリは、Redisからの複数キーのルックアップに最適化されます。フィルタリングキーなしのクエリでは、全テーブルスキャンが発生し、これは重い操作です。

現在、`redis`テーブル関数では[命名されたコレクション](/operations/named-collections.md)はサポートされていません。

**返される値**

キーがRedisキーで、他のカラムがRedis値としてまとめられたテーブルオブジェクト。

## 使用例 {#usage-example}

Redisから読み取る：

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redisに挿入する：

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

**関連情報**

- [`Redis`テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [Redisを辞書ソースとして使用する](/sql-reference/dictionaries/index.md#redis)
