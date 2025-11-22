---
description: 'クォータに関するドキュメント'
sidebar_label: 'QUOTA'
sidebar_position: 46
slug: /sql-reference/statements/alter/quota
title: 'ALTER QUOTA'
doc_type: 'reference'
---

クォータ設定を変更します。

構文:

```sql
ALTER QUOTA [IF EXISTS] name [ON CLUSTER cluster_name]
    [RENAME TO new_name]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

キー `user_name`、`ip_address`、`client_key`、`client_key, user_name` および `client_key, ip_address` は、[system.quotas](../../../operations/system-tables/quotas.md) テーブルのフィールドに対応します。

パラメータ `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`execution_time` は、[system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md) テーブルのフィールドに対応します。

`ON CLUSTER` 句を使用すると、クラスタ上にクォータを作成できます。[Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

**例**

現在のユーザーに対して、15 か月間で最大 123 件までクエリ数を制限します:

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

デフォルトユーザーについては、30 分間における最大実行時間を 0.5 秒に制限し、さらに 5 四半期の間に実行できるクエリ数の上限を 321、許容されるエラー数の上限を 10 に設定します。

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
