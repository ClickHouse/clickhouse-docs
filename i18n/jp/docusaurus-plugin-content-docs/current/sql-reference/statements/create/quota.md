---
description: 'クォータに関するドキュメント'
sidebar_label: 'QUOTA'
sidebar_position: 42
slug: /sql-reference/statements/create/quota
title: 'CREATE QUOTA — クォータの作成'
doc_type: 'reference'
---

ユーザーまたはロールに割り当てることができる[クォータ](../../../guides/sre/user-management/index.md#quotas-management)を作成します。

構文:

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | written_bytes | execution_time | failed_sequential_authentications} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

キー `user_name`、`ip_address`、`client_key`、`client_key, user_name`、`client_key, ip_address` は、[system.quotas](../../../operations/system-tables/quotas.md) テーブルのフィールドに対応します。

パラメータ `queries`、`query_selects`、`query_inserts`、`errors`、`result_rows`、`result_bytes`、`read_rows`、`read_bytes`、`written_bytes`、`execution_time`、`failed_sequential_authentications` は、[system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md) テーブルのフィールドに対応します。

`ON CLUSTER` 句を使用すると、クラスタ全体に対してクォータを作成できます。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

**例**

現在のユーザーのクエリ数を、15 か月間で最大 123 件に制限します。

```sql
CREATE QUOTA qA FOR INTERVAL 15 MONTH MAX QUERIES = 123 TO CURRENT_USER;
```

デフォルトユーザーに対して、30分あたりの最大実行時間を0.5秒に制限し、さらに5四半期の期間に実行できるクエリ数の上限を321件、エラー数の上限を10件に設定します。

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

XML 設定（ClickHouse Cloud ではサポートされていません）を使用したさらなる例は、[Quotas ガイド](/operations/quotas)を参照してください。

## 関連コンテンツ \\{#related-content\\}

- ブログ記事: [ClickHouse を使用したシングルページアプリケーションの構築](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
