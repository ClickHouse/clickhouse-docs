---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行'
description: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行方法を説明するページ'
doc_type: 'guide'
keywords: ['移行', 'ClickHouse Cloud', 'OSS', 'セルフマネージド環境から Cloud への移行']
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

# セルフマネージド ClickHouse と ClickHouse Cloud 間の移行 {#migrating-between-self-managed-clickhouse-and-clickhouse-cloud}

<Image img={self_managed_01} size='lg' alt='セルフマネージド ClickHouse の移行'/>

このガイドでは、セルフマネージドの ClickHouse サーバーから ClickHouse Cloud への移行方法と、ClickHouse Cloud サービス間での移行方法について説明します。
[`remoteSecure`](/sql-reference/table-functions/remote) 関数は、リモートの ClickHouse サーバーへのアクセスを可能にするために `SELECT` および `INSERT` クエリ内で使用されます。これにより、テーブルの移行は、`SELECT` を埋め込んだ `INSERT INTO` クエリを書くだけで行えるようになります。

## セルフマネージド ClickHouse から ClickHouse Cloud への移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='lg' alt='セルフマネージド ClickHouse の移行'  />

ソーステーブルが分片されているか、レプリカ構成になっているか、あるいはその両方であるかに関わらず、ClickHouse Cloud では宛先テーブルを作成するだけで済みます（このテーブルでは Engine パラメータを省略できます。テーブルエンジンとしては自動的に `SharedMergeTree` が選択されます）。
ClickHouse Cloud が垂直方向および水平方向のスケーリングを自動的に処理します。
テーブルをどのようにレプリケートし分片化するかを、利用者側で検討する必要はありません。

この例では、セルフマネージドの ClickHouse サーバーが*ソース*であり、ClickHouse Cloud サービスが*宛先*となります。

### 概要 {#overview}

手順は次のとおりです。

1. ソースサービスに読み取り専用ユーザーを追加する
1. 宛先サービスにソーステーブルの構造を複製する
1. ソースのネットワーク到達性に応じて、宛先からソースのデータをプルするか、ソースから宛先へデータをプッシュする
1. （該当する場合）宛先側の IP アクセスリストからソースサーバーを削除する
1. ソースサービスから読み取り専用ユーザーを削除する

### あるシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、セルフマネージドの ClickHouse サーバーから ClickHouse Cloud にテーブルを 1 つ移行します。

<CompatibilityNote/>

### ソース側の ClickHouse システム（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

* ソーステーブル（この例では `db.table`）を読み取り可能な読み取り専用ユーザーを追加します

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* テーブル定義をコピー

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 移行先の ClickHouse Cloud システム上で: {#on-the-destination-clickhouse-cloud-system}

* 移行先データベースを作成します。

```sql
CREATE DATABASE db
```

* ソースの CREATE TABLE ステートメントを使用して、移行先テーブルを作成します。

:::tip
CREATE ステートメントを実行する際は、ENGINE をパラメータなしの ReplicatedMergeTree に変更してください。ClickHouse Cloud ではテーブルが常にレプリケートされ、適切なパラメータが自動的に設定されます。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、`SETTINGS` 句は残しておいてください。
:::

```sql
CREATE TABLE db.table ...
```

* セルフマネージドソースからデータを取得するには `remoteSecure` 関数を使用します

<Image img={self_managed_03} size="lg" alt="セルフマネージド ClickHouse の移行" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークからアクセスできない場合、`remoteSecure` 関数は SELECT と INSERT の両方で動作するため、データをプルするのではなくプッシュすることができます。次のオプションを参照してください。
:::

* `remoteSecure` 関数を使用してデータを ClickHouse Cloud サービスにプッシュする

<Image img={self_managed_04} size="lg" alt="セルフマネージド ClickHouse の移行" />

:::tip Add the remote system to your ClickHouse Cloud service IP Access List
`remoteSecure` 関数が ClickHouse Cloud サービスに接続できるようにするには、リモートシステムの IP アドレスを IP Access List で許可する必要があります。詳細については、この tip の下にある **Manage your IP Access List** セクションを展開してください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## ClickHouse Cloud サービス間での移行 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='セルフマネージド ClickHouse の移行'  />

ClickHouse Cloud サービス間でデータを移行する代表的なユースケースは次のとおりです:

- 復元したバックアップからデータを移行する
- 開発用サービスからステージング用サービスへ（またはステージングから本番環境へ）データをコピーする

この例では 2 つの ClickHouse Cloud サービスがあり、それぞれを *source* と *destination* と呼びます。データは source から destination へプルされます。プッシュすることもできますが、ここでは読み取り専用ユーザーを利用するため、プルの方法を示します。

<Image img={self_managed_06} size='lg' alt='セルフマネージド ClickHouse の移行'  />

移行は、次の手順で行います:

1. 一方の ClickHouse Cloud サービスを *source*、もう一方を *destination* として指定する
1. source サービスに読み取り専用ユーザーを追加する
1. destination サービス上に、source と同じテーブル構造を作成する
1. 一時的に source サービスへの IP アクセスを許可する
1. source から destination へデータをコピーする
1. destination の IP アクセスリストを再設定する
1. source サービスから読み取り専用ユーザーを削除する

#### ソースサービスに読み取り専用ユーザーを追加する {#add-a-read-only-user-to-the-source-service}

- ソーステーブル（この例では `db.table`）を読み取る権限だけを持つ読み取り専用ユーザーを追加する
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- テーブル定義をコピーする
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 宛先サービス側でテーブル構造を複製する {#duplicate-the-table-structure-on-the-destination-service}

宛先側で、まだ存在しない場合はデータベースを作成します。

- 宛先データベースを作成します。
  ```sql
  CREATE DATABASE db
  ```

- 送信元の `CREATE TABLE` 文を使用して、宛先側にテーブルを作成します。

  宛先側で、送信元の `select create_table_query...` の出力を使ってテーブルを作成します。
  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースからデスティネーションへデータを取得するためには、ソースサービスが接続を許可している必要があります。ソースサービスで「IP Access List」機能を一時的に無効にします。

:::tip
ソースの ClickHouse Cloud サービスを今後も継続して使用する場合は、「どこからでもアクセスを許可」に切り替える前に、既存の IP Access List を JSON ファイルにエクスポートしてください。これにより、データ移行後にアクセスリストをインポートし直すことができます。
:::

許可リストを変更し、**Anywhere** からのアクセスを一時的に許可します。詳細については [IP Access List](/cloud/security/setting-ip-filters) のドキュメントを参照してください。

#### ソースから宛先へデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure` 関数を使用して、ソースの ClickHouse Cloud サービスからデータを取得します。  
  宛先に接続し、宛先側の ClickHouse Cloud サービス上で次のコマンドを実行します:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービス内のデータを確認します。

#### ソース側で IP アクセスリストを再設定する {#re-establish-the-ip-access-list-on-the-source}

以前にアクセスリストをエクスポートしている場合は、**Share** を使って再インポートできます。そうでない場合は、アクセスリストにエントリを再度追加してください。

#### 読み取り専用の `exporter` ユーザーを削除する {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

* サービスの IP アクセスリストを変更してアクセスを制限します
