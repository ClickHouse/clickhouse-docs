---
sidebar_label: MySQL
sidebar_position: 10
slug: /integrations/connecting-to-mysql
description: MySQLテーブルエンジンを使用してClickHouseをMySQLに接続することができます。
keywords: [clickhouse, mysql, connect, integrate, table, engine]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouseとMySQLの統合

このページでは、MySQLテーブルからデータを読み取るための `MySQL` テーブルエンジンの使用について説明します。

## MySQLテーブルエンジンを使用してClickHouseをMySQLに接続する {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` テーブルエンジンを使用すると、ClickHouseをMySQLに接続できます。**SELECT** および **INSERT** ステートメントは、ClickHouse内またはMySQLテーブル内で実行可能です。この記事では、`MySQL` テーブルエンジンの基本的な使い方を示します。

### 1. MySQLの設定 {#1-configure-mysql}

1. MySQLでデータベースを作成します:
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

5. 必要に応じて権限を付与します。（デモ目的のため、`mysql_clickhouse` ユーザーに管理者権限を付与しています。）
  ```sql
  GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
  ```

:::note
ClickHouse Cloudでこの機能を使用している場合は、ClickHouse CloudのIPアドレスがMySQLインスタンスにアクセスできるようにする必要があります。
出力トラフィックの詳細については、ClickHouseの [Cloud Endpoints API](/cloud/security/cloud-endpoints-api.md) をご確認ください。
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

  最小限のパラメータは次のとおりです:

  | パラメータ  | 説明                              | 例                       |
  |-------------|-----------------------------------|--------------------------|
  | ホスト      | ホスト名またはIP                   | mysql-host.domain.com    |
  | データベース| MySQLデータベース名               | db1                      |
  | テーブル    | MySQLテーブル名                   | table1                   |
  | ユーザー    | MySQLへの接続に使用するユーザー名 | mysql_clickhouse         |
  | パスワード  | MySQLへの接続に使用するパスワード | Password123!             |

  :::note
  完全なパラメータのリストについては、[MySQLテーブルエンジン](/engines/table-engines/integrations/mysql.md)のドキュメントページをご覧ください。
  :::

### 3. 統合をテストする {#3-test-the-integration}

1. MySQLに、サンプル行を挿入します:
  ```sql
  INSERT INTO db1.table1
    (id, column1)
  VALUES
    (4, 'jkl');
  ```

2. MySQLテーブルに存在する行がClickHouseテーブルにあることを確認します。新しく追加した行も一緒です:
  ```sql
  SELECT
      id,
      column1
  FROM mysql_table1
  ```

  4行見ることができるはずです:
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

4. MySQLに新しい行が表示されることを確認します:
  ```bash
  mysql> select id,column1 from db1.table1;
  ```

  新しい行を見ることができるはずです:
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

`MySQL` テーブルエンジンを使用すると、ClickHouseをMySQLに接続してデータを双方向に交換できます。詳細については、[MySQLテーブルエンジン](/sql-reference/table-functions/mysql.md)のドキュメントページをご確認ください。
