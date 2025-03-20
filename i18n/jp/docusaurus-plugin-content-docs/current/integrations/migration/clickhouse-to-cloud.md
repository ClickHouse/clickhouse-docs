---
sidebar_position: 10
sidebar_label: ClickHouseからClickHouse Cloudへの移行
slug: /cloud/migration/clickhouse-to-cloud
---
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# セルフマネージド ClickHouse から ClickHouse Cloud への移行

<img src={self_managed_01} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}} />

このガイドでは、セルフマネージド ClickHouse サーバーから ClickHouse Cloud への移行方法と、ClickHouse Cloud サービス間の移行方法を示します。 [`remoteSecure`](../../sql-reference/table-functions/remote.md) 関数は、リモートの ClickHouse サーバーへのアクセスを許可するために `SELECT` および `INSERT` クエリで使用され、テーブルの移行を `INSERT INTO` クエリを埋め込んだ `SELECT` で書くことと同じくらい簡単にします。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<img src={self_managed_02} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}} />

:::note
ソーステーブルがシャーディングされているかどうかに関わらず、ClickHouse Cloud では宛先テーブルを作成するだけです（このテーブルに対してエンジンパラメータを省略できます。自動的に ReplicatedMergeTree テーブルになります）。ClickHouse Cloud は垂直および水平スケーリングを自動的に処理します。テーブルのレプリケーションやシャーディングについて考える必要はありません。
:::

この例では、セルフマネージドの ClickHouse サーバーが *ソース* であり、ClickHouse Cloud サービスが *宛先* です。

### 概要 {#overview}

プロセスは以下の通りです：

1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブル構造を複製
1. ソースから宛先にデータをプルするか、ソースからデータをプッシュする（ソースのネットワーク可用性による）
1. 宛先の IP アクセスリストからソースサーバーを削除（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除


### 一つのシステムから別のシステムへのテーブルの移行 {#migration-of-tables-from-one-system-to-another}
この例では、セルフマネージド ClickHouse サーバーから ClickHouse Cloud への一つのテーブルを移行します。

### ソース ClickHouse システム上で {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- テーブル定義をコピー
```sql
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

### 宛先 ClickHouse Cloud システム上で {#on-the-destination-clickhouse-cloud-system}

- 宛先データベースを作成：
```sql
CREATE DATABASE db
```

- ソースからの CREATE TABLE ステートメントを使用して、宛先を作成する。

:::tip
CREATE ステートメントを実行するときに ENGINE を ReplicatedMergeTree に変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、適切なパラメータを提供します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` および `SETTINGS` 句は保持してください。
:::

```sql
CREATE TABLE db.table ...
```

- `remoteSecure` 関数を使用してセルフマネージドソースからデータをプル

<img src={self_managed_03} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}} />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
もしソースシステムが外部ネットワークから利用できない場合は、データをプルするのではなくプッシュすることができます。`remoteSecure` 関数は、SELECT と INSERT の両方に対応しています。次のオプションを参照してください。
:::

- `remoteSecure` 関数を使用してデータを ClickHouse Cloud サービスにプッシュ

<img src={self_managed_04} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}} />

:::tip リモートシステムを ClickHouse Cloud サービスの IP アクセスリストに追加
`remoteSecure` 関数があなたの ClickHouse Cloud サービスに接続するためには、リモートシステムの IP アドレスが IP アクセスリストによって許可されている必要があります。このヒントの下にある **IP アクセスリストの管理** を展開して、詳細情報を確認してください。
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```



## ClickHouse Cloud サービス間の移行 {#migrating-between-clickhouse-cloud-services}

<img src={self_managed_05} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}} />

ClickHouse Cloud サービス間でデータを移行する例としては以下があります：
- 復元されたバックアップからデータを移行する
- 開発サービスからステージングサービス（またはステージングから本番）にデータをコピーする

この例では、2つの ClickHouse Cloud サービスがあり、*ソース* と *宛先* と呼ばれます。データはソースから宛先にプルされます。プッシュすることもできますが、読み取り専用ユーザーを使用するためプルする方法が示されています。

<img src={self_managed_06} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}} />

移行にはいくつかのステップがあります：
1. 一つの ClickHouse Cloud サービスを *ソース* とし、もう一つを *宛先* とします
1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブル構造を複製
1. ソースサービスへの IP アクセスを一時的に許可
1. ソースから宛先にデータをコピー
1. 宛先の IP アクセスリストを再設定
1. ソースサービスから読み取り専用ユーザーを削除


#### ソースサービスに読み取り専用ユーザーを追加 {#add-a-read-only-user-to-the-source-service}

- ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- テーブル定義をコピー
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 宛先サービスでテーブル構造を複製 {#duplicate-the-table-structure-on-the-destination-service}

宛先にデータベースがない場合は、作成します：

- 宛先データベースを作成：
  ```sql
  CREATE DATABASE db
  ```

- ソースからの CREATE TABLE ステートメントを使用して、宛先を作成。

  ソースからの `select create_table_query...` の出力を使用して宛先でテーブルを作成します：

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースから宛先にデータをプルするには、ソースサービスが接続を許可する必要があります。ソースサービスで "IP アクセスリスト" 機能を一時的に無効にします。

:::tip
ソースの ClickHouse Cloud サービスを引き続き使用する場合は、どこからでもアクセスを許可する前に既存の IP アクセスリストを JSON ファイルにエクスポートしてください。これにより、データが移行された後にアクセスリストをインポートできます。
:::

許可リストを変更し、一時的に **Anywhere** からのアクセスを許可します。詳細については、[IP アクセスリスト](/cloud/security/setting-ip-filters) ドキュメントを参照してください。

#### ソースから宛先にデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure` 関数を使用してソース ClickHouse Cloud サービスからデータをプルします
  宛先に接続します。宛先 ClickHouse Cloud サービス上でこのコマンドを実行します：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービス内のデータを確認する

#### ソースの IP アクセスリストを再設定する {#re-establish-the-ip-access-list-on-the-source}

  以前にアクセスリストをエクスポートした場合は、**Share** を使用して再インポートできます。そうでない場合は、アクセスリストにエントリを再追加します。

#### 読み取り専用 `exporter` ユーザーを削除する {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスの IP アクセスリストを変更し、アクセスを制限します。
