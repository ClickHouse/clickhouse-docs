---
slug: /sql-reference/statements/create/quota
sidebar_position: 42
sidebar_label: QUOTA
title: "CREATE QUOTA"
---

ユーザーまたはロールに割り当て可能な[クオータ](../../../guides/sre/user-management/index.md#quotas-management)を作成します。

構文:

``` sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

`user_name`、`ip_address`、`client_key`、`client_key, user_name`、および `client_key, ip_address` のキーは、[system.quotas](../../../operations/system-tables/quotas.md)テーブルのフィールドに対応しています。

パラメータ `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`execution_time`、`failed_sequential_authentications` は、[system.quotas_usage](../../../operations/system-tables/quotas_usage.md)テーブルのフィールドに対応しています。

`ON CLUSTER`句を使用すると、クラスター上にクオータを作成できます。[分散DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

**例**

現在のユーザーの最大クエリ数を15ヶ月の制約で123に制限します:

``` sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

デフォルトユーザーの最大実行時間を30分で0.5秒に制限し、5四半期で最大クエリ数を321、最大エラー数を10に制限します:

``` sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
