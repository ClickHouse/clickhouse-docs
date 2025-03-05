---
sidebar_label: MySQL
sidebar_position: 10
slug: /integrations/connecting-to-mysql
description: MySQL テーブルエンジンを使用して ClickHouse を MySQL に接続できます。
keywords: [clickhouse, mysql, connect, integrate, table, engine]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# MySQLとClickHouseの統合

このページでは、`MySQL` テーブルエンジンを使用して MySQL テーブルからデータを読み取る方法について説明します。

## MySQL テーブルエンジンを使用して ClickHouse を MySQL に接続する {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` テーブルエンジンを使用することで、ClickHouse を MySQL に接続できます。 **SELECT** および **INSERT** 文は、ClickHouse または MySQL テーブルのいずれかで実行できます。この資料では、`MySQL` テーブルエンジンの基本的な使用方法を示します。

### 1. MySQLの設定 {#1-configure-mysql}

1. MySQL にデータベースを作成します:
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

4. ClickHouse から接続するためのユーザーを作成します:
  ```sql
  CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
  ```

5. 必要に応じて権限を付与します。（デモ目的で、`mysql_clickhouse` ユーザーに管理者権限を付与しています。）
  ```sql
  GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
  ```

:::note
ClickHouse Cloud でこの機能を使用している場合は、ClickHouse Cloud の IP アドレスが MySQL インスタンスにアクセスできるように設定する必要があります。
ClickHouse の [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) で出力トラフィックの詳細を確認してください。
:::

### 2. ClickHouse にテーブルを定義する {#2-define-a-table-in-clickhouse}

1. `MySQL` テーブルエンジンを使用する ClickHouse テーブルを作成します:
  ```sql
  CREATE TABLE mysql_table1 (
    id UInt64,
    column1 String
  )
  ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
  ```

  必要な最小パラメータは次のとおりです:

  |parameter|説明                     |例                      |
  |---------|--------------------------|-------------------------|
  |host     |ホスト名または IP        |mysql-host.domain.com    |
  |database |MySQL データベース名    |db1                      |
  |table    |MySQL テーブル名         |table1                   |
  |user     |MySQL に接続するためのユーザー名|mysql_clickhouse         |
  |password |MySQL に接続するためのパスワード|Password123!             |

  :::note
  パラメータの完全なリストについては、[MySQL テーブルエンジン](/engines/table-engines/integrations/mysql.md)のドキュメントページを参照してください。
  :::

### 3. 統合をテストする {#3-test-the-integration}

1. MySQL にサンプル行を挿入します:
  ```sql
  INSERT INTO db1.table1
    (id, column1)
  VALUES
    (4, 'jkl');
  ```

2. MySQL テーブルからの既存の行が ClickHouse テーブルに表示され、新しく追加した行もあることに注目してください:
  ```sql
  SELECT
      id,
      column1
  FROM mysql_table1
  ```

  4 行が表示されるはずです:
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

3. ClickHouse テーブルに行を追加してみましょう:
  ```sql
  INSERT INTO mysql_table1
    (id, column1)
  VALUES
    (5,'mno')
  ```

4. 新しい行が MySQL に表示されることを確認してください:
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

`MySQL` テーブルエンジンを使用することで、ClickHouse を MySQL に接続してデータを双方向に交換することができます。詳細については、[MySQL テーブルエンジン](/sql-reference/table-functions/mysql.md)のドキュメントページをご覧ください。
