---
'sidebar_label': 'ClickHouse OSS'
'slug': '/cloud/migration/clickhouse-to-cloud'
'title': 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行'
'description': 'ページはセルフマネージド ClickHouse と ClickHouse Cloud 間の移行方法について説明します'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# セルフマネージド ClickHouse と ClickHouse Cloud の間の移行

<Image img={self_managed_01} size='md' alt='セルフマネージド ClickHouse からの移行' background='white' />

このガイドでは、セルフマネージド ClickHouse サーバーから ClickHouse Cloud へ移行する方法、および ClickHouse Cloud サービス間での移行方法を示します。[`remoteSecure`](/sql-reference/table-functions/remote) 関数は、リモート ClickHouse サーバーへのアクセスを可能にするために `SELECT` および `INSERT` クエリで使用され、移行を `INSERT INTO` クエリと埋め込みの `SELECT`を書くことと同じくらい簡単にします。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

:::note
ソーステーブルがシャーディングされているかレプリケーションされているかにかかわらず、ClickHouse Cloud では単に宛先テーブルを作成するだけです（このテーブルの Engine パラメータを省略することができ、自動的に ReplicatedMergeTree テーブルになります）、そして ClickHouse Cloud が縦および横のスケーリングを自動で処理します。テーブルのレプリケーションやシャーディングを考える必要はありません。
:::

この例では、セルフマネージド ClickHouse サーバーが *ソース* であり、ClickHouse Cloud サービスが *宛先* です。

### 概要 {#overview}

プロセスは以下の通りです：

1. ソースサービスに読み取り専用ユーザーを追加する
1. 宛先サービスにソーステーブル構造を複製する
1. ソースから宛先にデータを取得するか、ソースからデータをプッシュする（ソースのネットワーク可用性による）
1. 宛先の IP アクセスリストからソースサーバーを削除する（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除する

### 一つのシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}
この例では、セルフマネージド ClickHouse サーバーから ClickHouse Cloud へ一つのテーブルを移行します。

### ソース ClickHouse システムで（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

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
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 宛先 ClickHouse Cloud システムで: {#on-the-destination-clickhouse-cloud-system}

- 宛先データベースを作成します：
```sql
CREATE DATABASE db
```

- ソースからの CREATE TABLE ステートメントを使って宛先を作成します。

:::tip
CREATE ステートメントを実行する際に ENGINE を ReplicatedMergeTree に変更します。ClickHouse Cloud は常にテーブルをレプリケートし、正しいパラメータを提供します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、および `SETTINGS` 節は保持してください。
:::

```sql
CREATE TABLE db.table ...
```

- `remoteSecure` 関数を使用してセルフマネージドソースからデータを取得します。

<Image img={self_managed_03} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
もしソースシステムが外部ネットワークから利用できない場合は、データをプルするのではなくプッシュすることができます。`remoteSecure` 関数は、SELECT と INSERT の両方で機能します。次のオプションを参照してください。
:::

- `remoteSecure` 関数を使用してデータを ClickHouse Cloud サービスにプッシュします。

<Image img={self_managed_04} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

:::tip リモートシステムを ClickHouse Cloud サービスの IP アクセスリストに追加します
`remoteSecure` 関数が ClickHouse Cloud サービスに接続するためには、リモートシステムの IP アドレスが IP アクセスリストで許可される必要があります。このヒントの下の **IP アクセスリストの管理** を展開して詳細を確認してください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## ClickHouse Cloud サービス間の移行 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='セルフマネージド ClickHouse からの移行' background='white' />

ClickHouse Cloud サービス間でデータを移行するためのいくつかの例：
- 復元されたバックアップからデータを移行する
- 開発サービスからステージングサービスへデータをコピーする（またはステージングから本番環境へ）

この例では、2 つの ClickHouse Cloud サービスがあり、それぞれ *ソース* と *宛先* と呼ばれます。データはソースから宛先にプルされます。好きな場合はプッシュすることもできますが、読み取り専用ユーザーを使用するため、プル方式が示されています。

<Image img={self_managed_06} size='lg' alt='セルフマネージド ClickHouse からの移行' background='white' />

移行にはいくつかのステップがあります：
1. 1 つの ClickHouse Cloud サービスを *ソース* として、もう 1 つを *宛先* として特定します
1. ソースサービスに読み取り専用ユーザーを追加します
1. 宛先サービスにソーステーブル構造を複製します
1. 一時的にソースサービスへの IP アクセスを許可します
1. ソースから宛先にデータをコピーします
1. 宛先で IP アクセスリストを再設定します
1. ソースサービスから読み取り専用ユーザーを削除します

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

#### 宛先サービスにテーブル構造を複製します {#duplicate-the-table-structure-on-the-destination-service}

宛先にデータベースがまだ存在しない場合は作成します：

- 宛先データベースを作成します：
```sql
CREATE DATABASE db
```

- ソースからの CREATE TABLE ステートメントを使用して宛先を作成します。

  宛先にあるテーブルは、ソースからの `select create_table_query...` の出力を使用して作成します：

```sql
CREATE TABLE db.table ...
```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースから宛先へデータをプルするためには、ソースサービスが接続を許可する必要があります。ソースサービスで「IP アクセスリスト」の機能を一時的に無効にします。

:::tip
ソースの ClickHouse Cloud サービスを引き続き使用する場合は、アクセスをどこからでも許可する前に既存の IP アクセスリストを JSON ファイルにエクスポートすると、データ移行後にアクセスリストをインポートできます。
:::

許可リストを変更し、一時的に **Anywhere** からのアクセスを許可します。詳細については、[IP アクセスリスト](/cloud/security/setting-ip-filters) のドキュメントを参照してください。

#### ソースから宛先へデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure` 関数を使用してソース ClickHouse Cloud サービスからデータをプルします。
  宛先に接続します。宛先 ClickHouse Cloud サービスでこのコマンドを実行します：

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

- 宛先サービスにデータを確認します。

#### ソースで IP アクセスリストを再設定します {#re-establish-the-ip-access-list-on-the-source}

以前にアクセスリストをエクスポートした場合は、**Share**を使用して再インポートできます。そうでない場合は、アクセスリストに再度エントリを追加します。

#### 読み取り専用の `exporter` ユーザーを削除します {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスの IP アクセスリストを切り替えてアクセスを制限します。
