---
description: 'このテーブル関数により、ClickHouse を Redis と統合できます。'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
doc_type: 'reference'
---

# redis テーブル関数 \{#redis-table-function\}

このテーブル関数により、ClickHouse を [Redis](https://redis.io/) と統合できます。

## 構文 \{#syntax\}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 引数 \{#arguments\}

| 引数        | 説明                                                                                                      |
|-------------|------------------------------------------------------------------------------------------------------------|
| `host:port` | Redis サーバーのアドレス。`port` を省略した場合は、デフォルトの Redis ポート 6379 が使用されます。              |
| `key`       | カラムリスト内の任意のカラム名。                                                                           |
| `structure` | この関数から返される ClickHouse テーブルのスキーマ。                                                       |
| `db_index`  | Redis の DB インデックス。0〜15 の範囲で指定し、デフォルトは 0。                                           |
| `password`  | ユーザーのパスワード。デフォルトは空文字列。                                                                |
| `pool_size` | Redis の最大接続プールサイズ。デフォルトは 16。                                                             |
| `primary`   | 必須で、プライマリキーとして 1 つのカラムのみをサポートします。プライマリキーは Redis キーとしてバイナリ形式でシリアライズされます。 |

- プライマリキー以外のカラムは、指定された順序で Redis の値としてバイナリ形式でシリアライズされます。
- `key` に対する `=` または `IN` でのフィルタ条件を含むクエリは、Redis への複数キーのルックアップとして最適化されます。キーでのフィルタ条件がないクエリでは全表スキャンが行われ、これは高コストな処理になります。

現在のところ、`redis` テーブル関数では [Named collections](/operations/named-collections.md) はサポートされていません。

## 返される値 \{#returned_value\}

Redis のキーをキー列とし、その他のカラムをまとめて 1 つの Redis の値として格納するテーブルオブジェクトです。

## 使用例 \{#usage-example\}

Redis からの読み込み：

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redis への書き込み:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

## 関連項目 \{#related\}

- [`Redis` テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [辞書のデータソースとして `Redis` を使用する](/sql-reference/dictionaries/index.md#redis)
