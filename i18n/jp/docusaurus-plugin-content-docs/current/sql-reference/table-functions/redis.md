---
description: 'このテーブル関数により、ClickHouse を Redis と統合できます。'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
doc_type: 'reference'
---



# redis テーブル関数

このテーブル関数を使用すると、ClickHouse を [Redis](https://redis.io/) と連携できます。



## 構文 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```


## 引数 {#arguments}

| 引数    | 説明                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `host:port` | Redisサーバーのアドレス。ポートを省略した場合、デフォルトのRedisポート6379が使用されます。                                             |
| `key`       | カラムリスト内の任意のカラム名。                                                                                             |
| `structure` | この関数から返されるClickHouseテーブルのスキーマ。                                                                |
| `db_index`  | Redisデータベースインデックス。0から15の範囲で指定します。デフォルトは0です。                                                                                |
| `password`  | ユーザーパスワード。デフォルトは空文字列です。                                                                                         |
| `pool_size` | Redisの最大接続プールサイズ。デフォルトは16です。                                                                                  |
| `primary`   | 必須項目。主キーには1つのカラムのみ指定できます。主キーはバイナリ形式でシリアライズされ、Redisキーとして使用されます。 |

- 主キー以外のカラムは、対応する順序でバイナリ形式にシリアライズされ、Redis値として格納されます。
- キーの等価条件またはIN条件を含むクエリは、Redisからの複数キー検索に最適化されます。キーによるフィルタリングがないクエリの場合、フルテーブルスキャンが発生し、これは負荷の高い操作となります。

現時点では、`redis`テーブル関数は[名前付きコレクション](/operations/named-collections.md)に対応していません。


## 戻り値 {#returned_value}

Redisキーをキーとし、その他のカラムをまとめてRedis値としたテーブルオブジェクト。


## 使用例 {#usage-example}

Redisからの読み取り:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redisへの挿入:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```


## 関連項目 {#related}

- [`Redis`テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [辞書ソースとしてRedisを使用する](/sql-reference/dictionaries/index.md#redis)
