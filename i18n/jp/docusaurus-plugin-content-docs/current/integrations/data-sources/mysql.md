---
slug: /integrations/mysql
sidebar_label: 'MySQL'
title: 'MySQL'
hide_title: true
description: 'MySQL との連携について説明するページ'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse'
keywords: ['mysql', 'データベース連携', '外部テーブル', 'データソース', 'SQL データベース']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse と MySQL の統合

このページでは、MySQL テーブルからデータを読み取るために `MySQL` テーブルエンジンを使用する方法について説明します。

:::note
ClickHouse Cloud では、[MySQL ClickPipe](/integrations/clickpipes/mysql)（現在パブリックベータ）を使用して、MySQL テーブルから ClickHouse へデータを簡単に移動することもできます。
:::



## MySQLテーブルエンジンを使用したClickHouseとMySQLの接続 {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL`テーブルエンジンを使用すると、ClickHouseをMySQLに接続できます。**SELECT**および**INSERT**ステートメントは、ClickHouseまたはMySQLテーブルのどちらからでも実行できます。この記事では、`MySQL`テーブルエンジンの基本的な使用方法を説明します。

### 1. MySQLの設定 {#1-configure-mysql}

1.  MySQLでデータベースを作成します:

```sql
CREATE DATABASE db1;
```

2. テーブルを作成します:

```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```

3. サンプル行を挿入します:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. ClickHouseから接続するためのユーザーを作成します:

```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. 必要に応じて権限を付与します。(デモンストレーション目的で、`mysql_clickhouse`ユーザーには管理者権限が付与されています。)

```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
ClickHouse Cloudでこの機能を使用している場合、MySQLインスタンスへのアクセスを許可するためにClickHouse CloudのIPアドレスを許可リストに追加する必要がある場合があります。
エグレストラフィックの詳細については、ClickHouseの[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を確認してください。
:::

### 2. ClickHouseでのテーブル定義 {#2-define-a-table-in-clickhouse}

1. それでは、`MySQL`テーブルエンジンを使用するClickHouseテーブルを作成しましょう:

```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

最小限必要なパラメータは以下の通りです:

| パラメータ | 説明                      | 例                    |
| --------- | ------------------------ | --------------------- |
| host      | ホスト名またはIP          | mysql-host.domain.com |
| database  | MySQLデータベース名       | db1                   |
| table     | MySQLテーブル名           | table1                |
| user      | MySQLに接続するユーザー名 | mysql_clickhouse      |
| password  | MySQLに接続するパスワード | Password123!          |

:::note
パラメータの完全なリストについては、[MySQLテーブルエンジン](/engines/table-engines/integrations/mysql.md)のドキュメントページを参照してください。
:::

### 3. 統合のテスト {#3-test-the-integration}

1. MySQLでサンプル行を挿入します:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. MySQLテーブルの既存の行が、先ほど追加した新しい行とともにClickHouseテーブルに存在することを確認します:

```sql
SELECT
    id,
    column1
FROM mysql_table1
```

4行が表示されるはずです:

```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.044 sec.
```

3. ClickHouseテーブルに行を追加してみましょう:

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4.  新しい行がMySQLに表示されることを確認します:

```bash
mysql> select id,column1 from db1.table1;
```

新しい行が表示されるはずです:

```response
+------+---------+
| id   | column1 |
+------+---------+
|    1 | abc     |
|    2 | def     |
|    3 | ghi     |
|    4 | jkl     |
|    5 | mno     |
+------+---------+
5 rows in set (0.01 sec)
```

### まとめ {#summary}


`MySQL` テーブルエンジンを使用すると、ClickHouse を MySQL に接続して、双方向にデータをやり取りできます。詳しくは、[MySQL テーブルエンジン](/sql-reference/table-functions/mysql.md) のドキュメントページを参照してください。
