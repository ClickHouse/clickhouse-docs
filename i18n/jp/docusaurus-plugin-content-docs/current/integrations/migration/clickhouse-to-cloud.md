---
'sidebar_position': 10
'sidebar_label': 'ClickHouseからClickHouseクラウドへの移行'
'slug': '/cloud/migration/clickhouse-to-cloud'
'title': 'セルフマネージドClickHouseとClickHouseクラウド間の移行'
'description': 'セルフマネージドClickHouseとClickHouseクラウド間を移行する方法について説明するページ'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# セルフマネージド ClickHouse から ClickHouse Cloud への移行

<Image img={self_managed_01} size='md' alt='セルフマネージド ClickHouse からの移行' background='white' />

このガイドでは、セルフマネージド ClickHouse サーバーから ClickHouse Cloud への移行方法と、ClickHouse Cloud サービス間の移行方法を説明します。 [`remoteSecure`](../../sql-reference/table-functions/remote.md) 関数は、リモート ClickHouse サーバーにアクセスするために `SELECT` および `INSERT` クエリで使用されており、テーブルの移行を `INSERT INTO` クエリに埋め込まれた `SELECT` のように簡単に行うことができます。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

:::note
ソーステーブルがシャーディングされているか、レプリケーションされているかに関係なく、ClickHouse Cloud では単に宛先テーブルを作成するだけです（このテーブルのエンジンパラメータは省略できます。自動的に ReplicatedMergeTree テーブルになります）。そして ClickHouse Cloud は、自動的に垂直および水平方向のスケーリングを管理します。テーブルのレプリケーションやシャーディングについて考える必要はありません。
:::

この例では、セルフマネージド ClickHouse サーバーが *ソース* であり、ClickHouse Cloud サービスが *宛先* です。

### 概要 {#overview}

プロセスは以下の通りです：

1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブル構造を複製
1. ネットワークの可用性に応じて、ソースから宛先にデータをプルまたはプッシュ
1. 宛先の IP アクセスリストからソースサーバーを削除（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除


### システム間でのテーブル移行: {#migration-of-tables-from-one-system-to-another}
この例では、セルフマネージド ClickHouse サーバーから ClickHouse Cloud へ 1 つのテーブルを移行します。

### ソース ClickHouse システムで（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

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

### 宛先 ClickHouse Cloud システムで: {#on-the-destination-clickhouse-cloud-system}

- 宛先データベースを作成:
```sql
CREATE DATABASE db
```

- ソースからの CREATE TABLE 文を使用して宛先を作成します。

:::tip
CREATE 文を実行する際に、ENGINE を ReplicatedMergeTree に変更し、パラメータを指定しないでください。ClickHouse Cloud は常にテーブルをレプリケートし、適切なパラメータを提供します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、および `SETTINGS` の句は保持してください。
:::

```sql
CREATE TABLE db.table ...
```


- `remoteSecure` 関数を使用して、セルフマネージドソースからデータをプル

<Image img={self_managed_03} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークから利用できない場合は、データをプッシュすることができます。`remoteSecure` 関数は、SELECT と INSERT の両方で機能します。次のオプションを参照してください。
:::

- `remoteSecure` 関数を使用して、ClickHouse Cloud サービスにデータをプッシュします。

<Image img={self_managed_04} size='sm' alt='セルフマネージド ClickHouse からの移行' background='white' />

:::tip リモートシステムを ClickHouse Cloud サービスの IP アクセスリストに追加
`remoteSecure` 関数が ClickHouse Cloud サービスに接続するためには、リモートシステムの IP アドレスが IP アクセスリストで許可されている必要があります。このヒントの下にある **IP アクセスリストを管理する** を展開して、詳細情報を得てください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```



## ClickHouse Cloud サービス間の移行 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='セルフマネージド ClickHouse からの移行' background='white' />

ClickHouse Cloud サービス間でのデータ移行の例:
- 復元されたバックアップからのデータ移行
- 開発サービスからステージングサービスへのデータコピー（またはステージングから本番）

この例では、2 つの ClickHouse Cloud サービスがあり、それぞれを *ソース* および *宛先* と呼びます。データはソースから宛先にプルされます。プッシュも可能ですが、読み取り専用ユーザーを使用しているためプルの方法が示されています。

<Image img={self_managed_06} size='lg' alt='セルフマネージド ClickHouse からの移行' background='white' />

移行にはいくつかのステップがあります：
1. 1 つの ClickHouse Cloud サービスを *ソース* とし、もう 1 つを *宛先* として識別
1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブル構造を複製
1. 一時的にソースサービスへの IP アクセスを許可
1. ソースから宛先へデータをコピー
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

宛先にデータベースがまだない場合は、作成します：

- 宛先データベースを作成:
  ```sql
  CREATE DATABASE db
  ```



- ソースからの CREATE TABLE 文を使用して宛先を作成します。

  ソースからの `select create_table_query...` の出力を使用して、宛先にテーブルを作成します：

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可 {#allow-remote-access-to-the-source-service}

ソースから宛先にデータをプルするためには、ソースサービスが接続を許可する必要があります。一時的にソースサービスの「IP アクセスリスト」機能を無効にします。

:::tip
ソース ClickHouse Cloud サービスを引き続き使用する場合は、どこからでものアクセスを許可する前に、既存の IP アクセスリストを JSON ファイルにエクスポートしてください。これにより、データが移行された後にアクセスリストをインポートすることができます。
:::

許可リストを変更し、一時的に **Anywhere** からのアクセスを許可します。詳細については、[IP アクセスリスト](/cloud/security/setting-ip-filters) ドキュメントを参照してください。

#### ソースから宛先へデータをコピー {#copy-the-data-from-source-to-destination}

- `remoteSecure` 関数を使用して、ソース ClickHouse Cloud サービスからデータをプル
  宛先に接続します。宛先 ClickHouse Cloud サービスでこのコマンドを実行します：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービスのデータを確認

#### ソースでの IP アクセスリストを再設定 {#re-establish-the-ip-access-list-on-the-source}

もし早めにアクセスリストをエクスポートしていれば、**Share** を使用して再インポートできます。そうでない場合は、アクセスリストにエントリを再追加してください。

#### 読み取り専用の `exporter` ユーザーを削除 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスの IP アクセスリストを切り替え、アクセスを制限します。
