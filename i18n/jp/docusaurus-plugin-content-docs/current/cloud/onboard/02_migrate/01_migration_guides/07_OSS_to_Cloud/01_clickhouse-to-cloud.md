---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行'
description: 'セルフマネージド ClickHouse と ClickHouse Cloud 間の移行方法を説明するページ'
doc_type: 'ガイド'
keywords: ['migration', 'ClickHouse Cloud', 'OSS', 'Migrate self-managed to Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# 自前運用の ClickHouse と ClickHouse Cloud 間の移行

<Image img={self_managed_01} size='md' alt='自前運用の ClickHouse の移行' background='white' />

このガイドでは、自前運用の ClickHouse サーバーから ClickHouse Cloud への移行方法と、ClickHouse Cloud サービス間での移行方法について説明します。[`remoteSecure`](/sql-reference/table-functions/remote) 関数は、リモートの ClickHouse サーバーへアクセスするために `SELECT` および `INSERT` クエリ内で使用されます。これにより、`SELECT` を埋め込んだ `INSERT INTO` クエリを記述するだけで、テーブルを簡単に移行できます。



## セルフマネージドClickHouseからClickHouse Cloudへの移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image
  img={self_managed_02}
  size='sm'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

:::note
ソーステーブルがシャーディングやレプリケーションされているかどうかに関わらず、ClickHouse Cloudでは移行先テーブルを作成するだけで済みます(このテーブルのEngineパラメータは省略可能で、自動的にReplicatedMergeTreeテーブルになります)。
ClickHouse Cloudが垂直および水平スケーリングを自動的に処理するため、テーブルのレプリケーションやシャーディングについて考慮する必要はありません。
:::

この例では、セルフマネージドClickHouseサーバーが_ソース_、ClickHouse Cloudサービスが_移行先_となります。

### 概要 {#overview}

手順は以下の通りです:

1. ソースサービスに読み取り専用ユーザーを追加する
1. 移行先サービスでソーステーブルの構造を複製する
1. ソースのネットワーク可用性に応じて、ソースから移行先へデータをプルするか、ソースからデータをプッシュする
1. 移行先のIPアクセスリストからソースサーバーを削除する(該当する場合)
1. ソースサービスから読み取り専用ユーザーを削除する

### あるシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、セルフマネージドClickHouseサーバーからClickHouse Cloudへ1つのテーブルを移行します。

### ソースClickHouseシステム(現在データをホストしているシステム)での作業 {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソーステーブル(この例では`db.table`)を読み取れる読み取り専用ユーザーを追加する

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
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 移行先ClickHouse Cloudシステムでの作業: {#on-the-destination-clickhouse-cloud-system}

- 移行先データベースを作成する:

```sql
CREATE DATABASE db
```

- ソースからのCREATE TABLE文を使用して、移行先テーブルを作成する。

:::tip
CREATE文を実行する際、ENGINEをパラメータなしのReplicatedMergeTreeに変更してください。ClickHouse Cloudは常にテーブルをレプリケートし、正しいパラメータを提供します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、`SETTINGS`句は保持してください。
:::

```sql
CREATE TABLE db.table ...
```

- `remoteSecure`関数を使用してセルフマネージドソースからデータをプルする

<Image
  img={self_managed_03}
  size='sm'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークから利用できない場合は、データをプルするのではなくプッシュすることができます。`remoteSecure`関数はSELECTとINSERTの両方で機能します。次のオプションを参照してください。
:::

- `remoteSecure`関数を使用してClickHouse Cloudサービスへデータをプッシュする

<Image
  img={self_managed_04}
  size='sm'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

:::tip リモートシステムをClickHouse CloudサービスのIPアクセスリストに追加する
`remoteSecure`関数がClickHouse Cloudサービスに接続するには、リモートシステムのIPアドレスがIPアクセスリストで許可されている必要があります。詳細については、このヒントの下にある**IPアクセスリストの管理**を展開してください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## ClickHouse Cloudサービス間の移行 {#migrating-between-clickhouse-cloud-services}

<Image
  img={self_managed_05}
  size='lg'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

ClickHouse Cloudサービス間でデータを移行する使用例：

- 復元したバックアップからのデータ移行
- 開発環境からステージング環境へのデータコピー（またはステージングから本番環境へ）

この例では、2つのClickHouse Cloudサービスがあり、それぞれ_ソース_と_宛先_と呼びます。データはソースから宛先へプルされます。プッシュすることも可能ですが、ここでは読み取り専用ユーザーを使用するプル方式を示します。

<Image
  img={self_managed_06}
  size='lg'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

移行には以下のステップがあります：

1. 1つのClickHouse Cloudサービスを_ソース_として、もう1つを_宛先_として特定する
1. ソースサービスに読み取り専用ユーザーを追加する
1. 宛先サービスでソーステーブルの構造を複製する
1. ソースサービスへのIPアクセスを一時的に許可する
1. ソースから宛先へデータをコピーする
1. 宛先でIPアクセスリストを再設定する
1. ソースサービスから読み取り専用ユーザーを削除する

#### ソースサービスに読み取り専用ユーザーを追加する {#add-a-read-only-user-to-the-source-service}

- ソーステーブル（この例では`db.table`）を読み取ることができる読み取り専用ユーザーを追加します

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

#### 宛先サービスでテーブル構造を複製する {#duplicate-the-table-structure-on-the-destination-service}

宛先でデータベースがまだ存在しない場合は作成します：

- 宛先データベースを作成します：

  ```sql
  CREATE DATABASE db
  ```

- ソースからのCREATE TABLEステートメントを使用して、宛先にテーブルを作成します。

  宛先で、ソースからの`select create_table_query...`の出力を使用してテーブルを作成します：

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースから宛先へデータをプルするには、ソースサービスが接続を許可する必要があります。ソースサービスの「IPアクセスリスト」機能を一時的に無効にします。

:::tip
ソースのClickHouse Cloudサービスを引き続き使用する場合は、どこからでもアクセスを許可するように切り替える前に、既存のIPアクセスリストをJSONファイルにエクスポートしてください。これにより、データ移行後にアクセスリストを再インポートできます。
:::

許可リストを変更し、一時的に**どこからでも**アクセスを許可します。詳細については、[IPアクセスリスト](/cloud/security/setting-ip-filters)のドキュメントを参照してください。

#### ソースから宛先へデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure`関数を使用して、ソースのClickHouse Cloudサービスからデータをプルします
  宛先に接続します。宛先のClickHouse Cloudサービスでこのコマンドを実行します：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービスでデータを検証します

#### ソースでIPアクセスリストを再設定する {#re-establish-the-ip-access-list-on-the-source}

以前にアクセスリストをエクスポートした場合は、**共有**を使用して再インポートできます。そうでない場合は、アクセスリストにエントリを再追加してください。

#### 読み取り専用の`exporter`ユーザーを削除する {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスのIPアクセスリストを切り替えてアクセスを制限します
