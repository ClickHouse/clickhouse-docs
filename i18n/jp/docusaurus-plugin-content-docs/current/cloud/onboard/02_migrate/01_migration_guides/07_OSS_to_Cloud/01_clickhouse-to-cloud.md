---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: '自己管理型 ClickHouse と ClickHouse Cloud 間の移行'
description: '自己管理型 ClickHouse と ClickHouse Cloud 間の移行方法について説明するページ'
doc_type: 'guide'
keywords: ['移行', 'ClickHouse Cloud', 'OSS', 'セルフマネージド環境から Cloud への移行']
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

このガイドでは、セルフマネージドな ClickHouse サーバーから ClickHouse Cloud への移行方法と、ClickHouse Cloud のサービス間での移行方法を説明します。[`remoteSecure`](/sql-reference/table-functions/remote) 関数は、`SELECT` および `INSERT` クエリでリモートの ClickHouse サーバーにアクセスするために使用します。これにより、`SELECT` を埋め込んだ `INSERT INTO` クエリを書くことで、テーブルを簡単に移行できます。



## 自前運用の ClickHouse から ClickHouse Cloud への移行

<Image img={self_managed_02} size="sm" alt="自前運用の ClickHouse からの移行" background="white" />

:::note
ソーステーブルがシャーディングされている場合やレプリケートされている場合でも、ClickHouse Cloud では宛先テーブルを 1 つ作成するだけで構いません（このテーブルでは `Engine` パラメータを省略できます。自動的に `ReplicatedMergeTree` テーブルになります）。
ClickHouse Cloud が垂直・水平スケーリングを自動的に処理するため、テーブルをどのようにレプリケートしたりシャーディングしたりするかを意識する必要はありません。
:::

この例では、自前運用の ClickHouse サーバーが *ソース*、ClickHouse Cloud サービスが *宛先* になります。

### 概要

手順は次のとおりです。

1. ソース側のサービスに読み取り専用ユーザーを追加する
2. 宛先側のサービスに、ソーステーブルと同じ構造のテーブルを作成する
3. ソースのネットワーク到達性に応じて、ソースから宛先へデータをプルするか、ソースからデータをプッシュする
4. （該当する場合）宛先側の IP アクセスリストからソースサーバーを削除する
5. ソース側のサービスから読み取り専用ユーザーを削除する

### あるシステムから別のシステムへのテーブルの移行

この例では、1 つのテーブルを自前運用の ClickHouse サーバーから ClickHouse Cloud に移行します。

### ソース側の ClickHouse システム（現在データを保持しているシステム）での作業

* ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加します

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

### 宛先側の ClickHouse Cloud システム上で：

* 宛先データベースを作成します。

```sql
CREATE DATABASE db
```

* ソースの CREATE TABLE ステートメントを使用して、移行先のテーブルを作成します。

:::tip
CREATE ステートメントを実行する際は、ENGINE をパラメータなしの ReplicatedMergeTree に変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、正しいパラメータを自動で設定します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、`SETTINGS` 句はそのまま保持してください。
:::

```sql
CREATE TABLE db.table ...
```

* セルフマネージドのソースからデータを取得するために、`remoteSecure` 関数を使用します

<Image img={self_managed_03} size="sm" alt="セルフマネージド ClickHouse の移行" background="white" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークからアクセスできない場合、`remoteSecure` 関数は `SELECT` と `INSERT` の両方で動作するため、データをプルするのではなくプッシュすることができます。次のオプションを参照してください。
:::

* `remoteSecure` 関数を使用して、データを ClickHouse Cloud サービスにプッシュします

<Image img={self_managed_04} size="sm" alt="Migrating Self-managed ClickHouse" background="white" />

:::tip Add the remote system to your ClickHouse Cloud service IP Access List
`remoteSecure` 関数が ClickHouse Cloud サービスに接続できるようにするには、リモートシステムの IP アドレスを IP Access List で許可する必要があります。詳細については、この tip の下にある **Manage your IP Access List** を展開してください。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## ClickHouse Cloud サービス間での移行

<Image img={self_managed_05} size="lg" alt="自己管理型 ClickHouse の移行" background="white" />

ClickHouse Cloud サービス間でデータを移行する主なユースケースとしては、次のようなものがあります:

* 復元したバックアップからのデータ移行
* 開発サービスからステージングサービスへのデータコピー（またはステージングから本番環境へのコピー）

この例では 2 つの ClickHouse Cloud サービスがあり、それぞれを *ソース* と *デスティネーション* と呼びます。データはソースからデスティネーションへプルされます。必要であればプッシュすることもできますが、ここでは読み取り専用ユーザーを利用できるため、プルの方法を示します。

<Image img={self_managed_06} size="lg" alt="自己管理型 ClickHouse の移行" background="white" />

移行には次のステップがあります:

1. 一方の ClickHouse Cloud サービスを *ソース*、もう一方を *デスティネーション* として選定する
2. ソースサービスに読み取り専用ユーザーを追加する
3. デスティネーションサービス上に、ソースと同じテーブル構造を複製する
4. 一時的にソースサービスへの IP アクセスを許可する
5. ソースからデスティネーションへデータをコピーする
6. デスティネーション上で IP Access List を再設定する
7. ソースサービスから読み取り専用ユーザーを削除する

#### ソースサービスに読み取り専用ユーザーを追加する

* ソーステーブル（この例では `db.table`）を読み取れる読み取り専用ユーザーを追加します

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
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### デスティネーションサービス上でテーブル構造を複製する

デスティネーションにまだデータベースが存在しない場合は、先に作成します:

* デスティネーションのデータベースを作成します:
  ```sql
  CREATE DATABASE db
  ```

* ソースの CREATE TABLE 文を使用して、デスティネーション側にテーブルを作成します。

  デスティネーションで、ソースの `select create_table_query...` の出力を使ってテーブルを作成します:

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する

ソースからデスティネーションへデータをプルするには、ソースサービスが接続を許可している必要があります。ソースサービス上で一時的に「IP Access List」機能を無効化します。

:::tip
今後もソースの ClickHouse Cloud サービスを使い続ける場合は、「どこからでもアクセス可能」に切り替える前に、既存の IP Access List を JSON ファイルにエクスポートしておいてください。これにより、データ移行後にそのアクセスリストを再インポートできます。
:::

許可リストを編集し、一時的に **Anywhere** からのアクセスを許可します。詳細については [IP Access List](/cloud/security/setting-ip-filters) ドキュメントを参照してください。

#### ソースからデスティネーションへデータをコピーする

* `remoteSecure` 関数を使用して、ソースの ClickHouse Cloud サービスからデータをプルします。
  デスティネーションに接続し、デスティネーション側の ClickHouse Cloud サービスで次のコマンドを実行します:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

* デスティネーションサービス上のデータを確認します

#### ソース上で IP Access List を再設定する

以前にアクセスリストをエクスポートしている場合は、**Share** を使って再インポートできます。エクスポートしていない場合は、アクセスリストにエントリを再度追加してください。

#### 読み取り専用ユーザー `exporter` を削除する

```sql
DROP USER exporter
```

* サービスの IP アクセスリストを切り替えてアクセスを制限する
