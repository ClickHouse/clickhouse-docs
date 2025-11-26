---
slug: /integrations/mysql
sidebar_label: 'MySQL'
title: 'MySQL'
hide_title: true
description: 'MySQL 連携について説明するページ'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse'
keywords: ['mysql', 'データベース連携', '外部テーブル', 'データソース', 'SQL データベース']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse への MySQL の統合

このページでは、MySQL テーブルからデータを読み取るために `MySQL` テーブルエンジンを使用する方法について説明します。

:::note
ClickHouse Cloud では、[MySQL ClickPipe](/integrations/clickpipes/mysql)（現在パブリックベータ）を使用して、MySQL テーブルから ClickHouse にデータを簡単に移行することもできます。
:::



## MySQL テーブルエンジンを使用して ClickHouse を MySQL に接続する

`MySQL` テーブルエンジンを使用すると、ClickHouse を MySQL に接続できます。**SELECT** および **INSERT** 文は、ClickHouse 側からでも MySQL テーブル側からでも実行できます。本記事では、`MySQL` テーブルエンジンの基本的な使用方法を説明します。

### 1. MySQL を設定する

1. MySQL でデータベースを作成します：

```sql
CREATE DATABASE db1;
```

2. テーブルを作成する：

```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```

3. サンプル行を挿入します：

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. ClickHouse への接続に使用するユーザーを作成します：

```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. 必要に応じて権限を付与します。（デモンストレーション目的で、`mysql_clickhouse` ユーザーには管理者権限を付与しています。）

```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
ClickHouse Cloud でこの機能を使用している場合、ClickHouse Cloud の IP アドレスが MySQL インスタンスにアクセスできるように許可する必要になる場合があります。
外向き（egress）トラフィックの詳細については、ClickHouse の [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) を確認してください。
:::

### 2. ClickHouse でテーブルを定義する

1. 次に、`MySQL` テーブルエンジンを使用する ClickHouse テーブルを作成しましょう。

```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

最小限必要なパラメータは次のとおりです。

| parameter | 説明                  | example               |
| --------- | ------------------- | --------------------- |
| host      | ホスト名または IP          | mysql-host.domain.com |
| database  | MySQL データベース名       | db1                   |
| table     | MySQL テーブル名         | table1                |
| user      | MySQL に接続するためのユーザー名 | mysql&#95;clickhouse  |
| password  | MySQL に接続するためのパスワード | Password123!          |

:::note
利用可能なパラメータの完全な一覧は、[MySQL table engine](/engines/table-engines/integrations/mysql.md) のドキュメントページを参照してください。
:::

### 3. 統合をテストする

1. MySQL でサンプル行を挿入します。

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. MySQL テーブルに存在していた既存の行が、先ほど追加した新しい行とあわせて ClickHouse テーブルにも格納されていることを確認します。

```sql
SELECT
    id,
    column1
FROM mysql_table1
```

4行が表示されるはずです：

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

3. ClickHouse テーブルに行を追加します:

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. MySQL に新しい行が追加されていることを確認します:

```bash
mysql> select id,column1 from db1.table1;
```

新しい行が表示されているのが確認できるはずです。

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

### 概要


`MySQL` テーブルエンジンを使用すると、ClickHouse を MySQL と接続し、両者間でデータを双方向にやり取りできます。詳しくは、[MySQL テーブルエンジン](/sql-reference/table-functions/mysql.md) のドキュメントページを参照してください。
