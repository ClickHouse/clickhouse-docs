---
sidebar_label: 'remoteSecure の使用'
slug: /cloud/migration/clickhouse-to-cloud
title: 'セルフマネージド版 ClickHouse と ClickHouse Cloud 間の移行'
description: 'セルフマネージド版 ClickHouse と ClickHouse Cloud 間の移行方法を説明するページ'
doc_type: 'guide'
keywords: ['移行', 'ClickHouse Cloud', 'OSS', 'セルフマネージドから Cloud への移行']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';
import CompatibilityNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/compatibility.mdx'


# remoteSecure を使用したセルフマネージド ClickHouse と ClickHouse Cloud 間の移行 \{#migrating-between-self-managed-clickhouse-and-clickhouse-cloud-using-remotesecure\}

<Image img={self_managed_01} size='lg' alt='セルフマネージド ClickHouse の移行'/>

このガイドでは、セルフマネージドの ClickHouse サーバーから ClickHouse Cloud へ移行する方法と、ClickHouse Cloud サービス間で移行する方法を説明します。
[`remoteSecure`](/sql-reference/table-functions/remote) 関数は、リモートの ClickHouse サーバーへのアクセスを可能にするために、`SELECT` および `INSERT` クエリ内で使用される関数です。これにより、`SELECT` を埋め込んだ `INSERT INTO` クエリを記述するのと同じ要領でテーブルを移行できます。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 \{#migrating-from-self-managed-clickhouse-to-clickhouse-cloud\}

<Image img={self_managed_02} size='lg' alt="セルフマネージド ClickHouse の移行"  />

元のテーブルが分片されているか、レプリカ構成か、あるいはその両方かに関わらず、ClickHouse Cloud では宛先テーブルを作成するだけで十分です（このテーブルについては Engine パラメータを省略できます。テーブルエンジンとしては `SharedMergeTree` が自動的に選択されます）。
ClickHouse Cloud が垂直方向および水平方向のスケーリングを自動的に処理します。
テーブルをどのようにレプリケートおよび分片するかを考える必要はありません。

この例では、セルフマネージドの ClickHouse サーバーが *ソース* であり、ClickHouse Cloud サービスが *宛先* です。

### 概要 \{#overview\}

手順は以下のとおりです。

1. ソースサービスに読み取り専用ユーザーを追加する
1. 移行先サービスにソーステーブルと同じ構造のテーブルを作成する
1. ソースのネットワーク疎通状況に応じて、ソースから移行先へデータをプルするか、ソースからデータをプッシュする
1. 移行先側の IP Access List からソースサーバーを削除する（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除する

### あるシステムから別のシステムへのテーブル移行: \{#migration-of-tables-from-one-system-to-another\}

この例では、セルフマネージド ClickHouse サーバーから ClickHouse Cloud へ 1 つのテーブルを移行する方法を示します。

<CompatibilityNote/>

### ソースとなる ClickHouse システム上（現在データをホストしているシステム） \{#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data\}

* ソーステーブル（この例では `db.table`）を参照できる読み取り専用ユーザーを追加します

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* テーブル定義をコピーします

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```


### 宛先側の ClickHouse Cloud システムで行う操作: \{#on-the-destination-clickhouse-cloud-system\}

* 宛先データベースを作成します。

```sql
CREATE DATABASE db
```

* ソース側の CREATE TABLE 文を使用して、移行先にテーブルを作成します。

:::tip
CREATE 文を実行する際は、ENGINE をパラメータなしの ReplicatedMergeTree に変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、適切なパラメータを自動的に設定します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、`SETTINGS` の各句はそのまま保持してください。
:::

```sql
CREATE TABLE db.table ...
```

* セルフマネージドな ClickHouse からデータを取得するために `remoteSecure` 関数を使用します

<Image img={self_managed_03} size="lg" alt="セルフマネージド ClickHouse の移行" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークから到達できない場合、`remoteSecure` 関数は `SELECT` と `INSERT` の両方で動作するため、データをプルするのではなくプッシュすることができます。次のオプションを参照してください。
:::

* `remoteSecure` 関数を使用して、データを ClickHouse Cloud サービスにプッシュします

<Image img={self_managed_04} size="lg" alt="セルフマネージド ClickHouse の移行" />

:::tip Add the remote system to your ClickHouse Cloud service IP Access List
`remoteSecure` 関数が ClickHouse Cloud サービスに接続できるようにするには、リモートシステムの IP アドレスを IP Access List で許可する必要があります。詳細については、この tip の下にある **Manage your IP Access List** を展開してください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## ClickHouse Cloud サービス間での移行 \{#migrating-between-clickhouse-cloud-services\}

<Image img={self_managed_05} size='lg' alt='セルフマネージド ClickHouse の移行'  />

ClickHouse Cloud サービス間でデータを移行する代表的なユースケースには、次のようなものがあります：

- 復元したバックアップからのデータ移行
- 開発サービスからステージングサービスへのデータコピー（またはステージングから本番環境へのコピー）

この例では 2 つの ClickHouse Cloud サービスがあり、それぞれを *source* と *destination* と呼びます。データは source から destination へプルされます。必要であればプッシュすることもできますが、ここでは read-only ユーザーを利用するため、プルの方法を示します。

<Image img={self_managed_06} size='lg' alt='セルフマネージド ClickHouse の移行'  />

移行手順は次のとおりです：

1. どちらか一方の ClickHouse Cloud サービスを *source*、もう一方を *destination* として決める
1. source サービスに read-only ユーザーを追加する
1. destination サービス上に source と同じテーブル構造を作成する
1. 一時的に source サービスへの IP アクセスを許可する
1. source から destination へデータをコピーする
1. destination 上で IP Access List を再設定する
1. source サービスから read-only ユーザーを削除する

#### ソースサービスに読み取り専用ユーザーを追加する \{#add-a-read-only-user-to-the-source-service\}

- ソーステーブル（この例では `db.table`）を参照できる読み取り専用ユーザーを追加します。
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- テーブル定義をコピーします
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 宛先サービス上でテーブル構造を複製する \{#duplicate-the-table-structure-on-the-destination-service\}

宛先側で、データベースが存在しない場合は作成します:

- 宛先データベースを作成します:
  ```sql
  CREATE DATABASE db
  ```

- ソース側の CREATE TABLE ステートメントを使用して、宛先にテーブルを作成します。

  宛先側で、ソース側の `select create_table_query...` の出力を使ってテーブルを作成します:

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する \{#allow-remote-access-to-the-source-service\}

ソースから移行先へデータを取得するためには、ソースサービスが接続を許可している必要があります。ソースサービスで一時的に「IP Access List」機能を無効化してください。

:::tip
ソースの ClickHouse Cloud サービスを今後も利用し続ける場合は、「どこからでもアクセスを許可」に切り替える前に、既存の IP Access List を JSON ファイルとしてエクスポートしておいてください。これにより、データ移行後にそのアクセスリストをインポートできます。
:::

allow list を編集し、一時的に **Anywhere** からのアクセスを許可します。詳細については [IP Access List](/cloud/security/setting-ip-filters) のドキュメントを参照してください。

#### ソースからデスティネーションへデータをコピーする \{#copy-the-data-from-source-to-destination\}

- `remoteSecure` 関数を使用して、ソースの ClickHouse Cloud サービスからデータを取得します。
  その後、デスティネーションに接続し、デスティネーションの ClickHouse Cloud サービス上で次のコマンドを実行します:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- デスティネーションサービス内のデータを確認します

#### ソース側で IP アクセスリストを再設定する \{#re-establish-the-ip-access-list-on-the-source\}

以前にアクセスリストをエクスポートしている場合は、**Share** から再インポートできます。そうでない場合は、アクセスリストにエントリを再度追加してください。

#### 読み取り専用の `exporter` ユーザーを削除する \{#remove-the-read-only-exporter-user\}

```sql
DROP USER exporter
```

* サービスの IP アクセスリストを切り替えてアクセス元を制限する
