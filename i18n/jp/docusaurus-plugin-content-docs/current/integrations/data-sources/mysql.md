---
'slug': '/integrations/mysql'
'sidebar_label': 'MySQL'
'title': 'MySQL'
'hide_title': true
'description': '页面描述 MySQL 集成'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# MySQLとClickHouseの統合

このページでは、MySQLテーブルから読み取るための `MySQL` テーブルエンジンの使用について説明します。

:::note
ClickHouse Cloudの場合、[MySQL ClickPipe](/integrations/clickpipes/mysql)（現在パブリックベータ版）を使用して、MySQLテーブルからClickHouseにデータを簡単に移動できます。
:::

## MySQLテーブルエンジンを使用してClickHouseをMySQLに接続する {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` テーブルエンジンを使用すると、ClickHouseをMySQLに接続できます。 **SELECT** と **INSERT** ステートメントは、ClickHouseまたはMySQLテーブルのいずれかで実行できます。この記事では、`MySQL` テーブルエンジンの基本的な使用方法を示します。

### 1. MySQLの構成 {#1-configure-mysql}

1.  MySQLにデータベースを作成します:
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

5. 必要に応じて権限を付与します。（デモンストレーションの目的で、`mysql_clickhouse` ユーザーに管理者権限が付与されています。）
```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
ClickHouse Cloudでこの機能を使用する場合は、ClickHouse CloudのIPアドレスがMySQLインスタンスにアクセスできるようにする必要があります。
ClickHouseの[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を確認して、エグレストラフィックの詳細を参照してください。
:::

### 2. ClickHouseでテーブルを定義する {#2-define-a-table-in-clickhouse}

1. それでは、`MySQL` テーブルエンジンを使用するClickHouseテーブルを作成しましょう:
```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

最小パラメータは次のとおりです：

|parameter|説明                    |例                      |
|---------|---------------------|-----------------------|
|host     |ホスト名またはIP         |mysql-host.domain.com  |
|database |mysqlデータベース名      |db1                    |
|table    |mysqlテーブル名         |table1                 |
|user     |mysqlに接続するユーザー名 |mysql_clickhouse       |
|password |mysqlに接続するパスワード  |Password123!           |

:::note
完全なパラメータのリストについては、[MySQLテーブルエンジン](/engines/table-engines/integrations/mysql.md)のドキュメントページをご覧ください。
:::

### 3. 統合をテストする {#3-test-the-integration}

1. MySQLでサンプル行を挿入します:
```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. MySQLテーブルの既存の行がClickHouseテーブルに表示され、先ほど追加した新しい行も確認できます:
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

3. ClickHouseテーブルに行を追加しましょう:
```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. 新しい行がMySQLに表示されます:
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

### 概要 {#summary}

`MySQL` テーブルエンジンを使用すると、ClickHouseとMySQLを接続し、データを双方向に交換できます。詳細については、[MySQLテーブルエンジン](/sql-reference/table-functions/mysql.md)のドキュメントページを必ずご確認ください。
