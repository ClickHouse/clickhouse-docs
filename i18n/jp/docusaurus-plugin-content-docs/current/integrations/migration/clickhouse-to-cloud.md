---
sidebar_position: 10
sidebar_label: 'ClickHouseからClickHouse Cloudへの移行'
slug: /cloud/migration/clickhouse-to-cloud
title: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行'
description: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行方法を説明するページ'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# セルフマネージド ClickHouse と ClickHouse Cloud 間の移行

<Image img={self_managed_01} size='md' alt='セルフマネージド ClickHouse の移行' background='white' />

このガイドでは、セルフマネージドの ClickHouse サーバーから ClickHouse Cloud へ移行する方法と、ClickHouse Cloud サービス間での移行方法を示します。`[`remoteSecure` ](../../sql-reference/table-functions/remote.md)` 関数は、リモートの ClickHouse サーバーにアクセスを許可するために `SELECT` および `INSERT` クエリで使用され、テーブルの移行は、埋め込まれた `SELECT` を使用した `INSERT INTO` クエリを書くのと同じくらい簡単です。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='セルフマネージド ClickHouse の移行' background='white' />

:::note
ソーステーブルがシャードされているかレプリケートされているかに関係なく、ClickHouse Cloud では、宛先テーブルを作成するだけで（このテーブルのエンジンパラメータは省略できます；自動的に ReplicatedMergeTree テーブルになります）、ClickHouse Cloud が自動的に縦横のスケーリングを処理します。テーブルのレプリケートやシャーディングをどのように行うかを考える必要はありません。
:::

この例では、セルフマネージド ClickHouse サーバーが *ソース* で、ClickHouse Cloud サービスが *宛先* です。

### 概要 {#overview}

手順は以下の通りです：

1. ソースサービスに読み取り専用のユーザーを追加する
1. 宛先サービスにソーステーブル構造を複製する
1. ソースから宛先へのデータを取得するか、ソースからデータをプッシュする（ネットワークの可用性に応じて）
1. 宛先の IP アクセスリストからソースサーバーを削除する（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除する


### 1つのシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}
この例では、セルフマネージド ClickHouse サーバーから ClickHouse Cloud へテーブルを1つ移行します。

### ソース ClickHouse システムで（データを現在ホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加します。
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- テーブル定義をコピーします。
```sql
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

### 宛先 ClickHouse Cloud システムで: {#on-the-destination-clickhouse-cloud-system}

- 宛先データベースを作成します:
```sql
CREATE DATABASE db
```

- ソースからの CREATE TABLE ステートメントを使用して、宛先を作成します。

:::tip
CREATE ステートメントを実行するときに ENGINE を ReplicatedMergeTree に変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、正しいパラメータを提供します。`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、および `SETTINGS` 句は保持してください。
:::

```sql
CREATE TABLE db.table ...
```


- `remoteSecure` 関数を使用して、セルフマネージドのソースからデータを取得します。

<Image img={self_managed_03} size='sm' alt='セルフマネージド ClickHouse の移行' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークからアクセスできない場合は、データをプッシュすることもできます。`remoteSecure` 関数は、選択と挿入の両方で機能します。次のオプションを参照してください。
:::

- `remoteSecure` 関数を使用して、ClickHouse Cloud サービスにデータをプッシュします。

<Image img={self_managed_04} size='sm' alt='セルフマネージド ClickHouse の移行' background='white' />

:::tip リモートシステムを ClickHouse Cloud サービスの IP アクセスリストに追加する
`remoteSecure` 関数が ClickHouse Cloud サービスに接続するには、リモートシステムの IP アドレスを IP アクセスリストで許可する必要があります。このヒントの下にある **IP アクセスリストの管理** を展開して詳細情報を確認してください。
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```



## ClickHouse Cloud サービス間の移行 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='セルフマネージド ClickHouse の移行' background='white' />

ClickHouse Cloud サービス間でデータを移行する例：
- 復元されたバックアップからのデータ移行
- 開発サービスからステージングサービスへのデータコピー（またはステージングから本番環境）

この例では、2つの ClickHouse Cloud サービスがあり、*ソース* と *宛先* と呼ばれます。データはソースから宛先に取得されます。プッシュすることもできますが、読み取り専用ユーザーを使用するため、プルの方法が示されています。

<Image img={self_managed_06} size='lg' alt='セルフマネージド ClickHouse の移行' background='white' />

移行にはいくつかの手順があります：
1. 1つの ClickHouse Cloud サービスを *ソース*、もう1つを *宛先* に設定する
1. ソースサービスに読み取り専用ユーザーを追加する
1. 宛先サービスにソーステーブル構造を複製する
1. ソースサービスへの IP アクセスを一時的に許可する
1. ソースから宛先にデータをコピーする
1. 宛先で IP アクセスリストを再設定する
1. ソースサービスから読み取り専用ユーザーを削除する


#### ソースサービスに読み取り専用ユーザーを追加する {#add-a-read-only-user-to-the-source-service}

- ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加します。
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- テーブル定義をコピーします。
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 宛先サービスでテーブル構造を複製する {#duplicate-the-table-structure-on-the-destination-service}

宛先にデータベースがまだ存在しない場合は作成します：

- 宛先データベースを作成します：
  ```sql
  CREATE DATABASE db
  ```



- ソースからの CREATE TABLE ステートメントを使用して、宛先を作成します。

  ソースからの `select create_table_query...` の出力を使用して宛先にテーブルを作成します：

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースから宛先にデータを取得するためには、ソースサービスが接続を許可する必要があります。ソースサービスで「IP アクセスリスト」機能を一時的に無効にします。

:::tip
ソース ClickHouse Cloud サービスを引き続き使用する場合は、アクセスリストをどこからでも許可する前に既存の IP アクセスリストを JSON ファイルにエクスポートしておくと、データ移行後にアクセスリストをインポートできます。
:::

許可リストを修正し、**どこからでも** 一時的にアクセスを許可します。詳細については、[IP アクセスリスト](/cloud/security/setting-ip-filters) のドキュメントを参照してください。

#### ソースから宛先へのデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure` 関数を使用して、ソース ClickHouse Cloud サービスからデータを取得します。
  宛先に接続し、このコマンドを宛先 ClickHouse Cloud サービスで実行します：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービスでデータを確認します。

#### ソースで IP アクセスリストを再設定する {#re-establish-the-ip-access-list-on-the-source}

  以前にアクセスリストをエクスポートしている場合は、**共有** を使用して再インポートできます。そうでない場合は、アクセスリストにエントリを再追加してください。

#### 読み取り専用の `exporter` ユーザーを削除する {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスの IP アクセスリストを変更し、アクセスを制限します。
