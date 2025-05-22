---
'sidebar_label': 'MySQL'
'sidebar_position': 10
'slug': '/integrations/connecting-to-mysql'
'description': 'The MySQL table engine allows you to connect ClickHouse to MySQL.'
'keywords':
- 'clickhouse'
- 'mysql'
- 'connect'
- 'integrate'
- 'table'
- 'engine'
'title': 'Integrating MySQL with ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouseとMySQLの統合

このページでは、MySQLテーブルからデータを読み取るための `MySQL` テーブルエンジンの使用方法について説明します。

:::note
ClickHouse Cloudでは、[MySQL ClickPipe](/integrations/clickpipes/mysql)（現在プライベートプレビュー中）を使用して、MySQLテーブルからClickHouseにデータを簡単に移動できます。
:::

## MySQLテーブルエンジンを使用したClickHouseとMySQLの接続 {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` テーブルエンジンを使用すると、ClickHouseをMySQLに接続できます。**SELECT**および**INSERT**文は、ClickHouseまたはMySQLテーブルのどちらでも実行できます。この記事では、`MySQL` テーブルエンジンの基本的な使用方法を示します。

### 1. MySQLの設定 {#1-configure-mysql}

1. MySQLにデータベースを作成します:
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

4. ClickHouseから接続するユーザーを作成します:
  ```sql
  CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
  ```

5. 必要に応じて権限を付与します。（デモ目的で、`mysql_clickhouse` ユーザーに管理者権限を付与しています。）
  ```sql
  GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
  ```

:::note
ClickHouse Cloudでこの機能を使用している場合は、ClickHouse CloudのIPアドレスがMySQLインスタンスにアクセスできるようにする必要があります。
Egressトラフィックの詳細については、ClickHouseの[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を確認してください。
:::

### 2. ClickHouseでテーブルを定義する {#2-define-a-table-in-clickhouse}

1. それでは、`MySQL` テーブルエンジンを使用したClickHouseテーブルを作成しましょう:
  ```sql
  CREATE TABLE mysql_table1 (
    id UInt64,
    column1 String
  )
  ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
  ```

  最小限のパラメータは次の通りです：

  |parameter|説明|例|
  |---------|----------------------------|---------------------|
  |host     |ホスト名またはIP|mysql-host.domain.com|
  |database |MySQLデータベース名|db1|
  |table    |MySQLテーブル名|table1|
  |user     |MySQLに接続するためのユーザー名|mysql_clickhouse|
  |password |MySQLに接続するためのパスワード|Password123!|

  :::note
  パラメータの完全なリストについては、[MySQL テーブルエンジン](/engines/table-engines/integrations/mysql.md)のドキュメントページを参照してください。
  :::

### 3. 統合をテストする {#3-test-the-integration}

1. MySQLでサンプル行を挿入します:
  ```sql
  INSERT INTO db1.table1
    (id, column1)
  VALUES
    (4, 'jkl');
  ```

2. MySQLテーブルの既存の行がClickHouseテーブルに表示され、追加した新しい行も表示されていることに気付きます:
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

4. 新しい行がMySQLに表示されることに気付きます:
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

`MySQL` テーブルエンジンは、ClickHouseとMySQLを接続してデータを双方向で交換することを可能にします。詳細については、[MySQL テーブルエンジン](/sql-reference/table-functions/mysql.md)のドキュメントページを必ず確認してください。
