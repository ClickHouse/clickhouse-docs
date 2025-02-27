---
sidebar_position: 10
sidebar_label: ClickHouseからClickHouse Cloudへ
slug: /cloud/migration/clickhouse-to-cloud
---
import AddARemoteSystem from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';

# セルフマネージドClickHouseからClickHouse Cloudへの移行


<img src={require('./images/self-managed-01.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}}/>


このガイドでは、セルフマネージドのClickHouseサーバーからClickHouse Cloudへ移行する方法と、ClickHouse Cloudサービス間の移行方法を示します。 [`remoteSecure`](../../sql-reference/table-functions/remote.md)関数は、リモートClickHouseサーバーへのアクセスを許可するために`SELECT`および`INSERT`クエリで使用され、テーブルの移行を`INSERT INTO`クエリと組み合わせた`SELECT`を書くことで簡単に行うことができます。

## セルフマネージドClickHouseからClickHouse Cloudへの移行 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<img src={require('./images/self-managed-02.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}}/>


:::note
ソーステーブルがシャードまたはレプリケートされている場合でも、ClickHouse Cloudでは宛先テーブルを作成するだけで（このテーブルのエンジンパラメーターは省略可能で、デフォルトでReplicatedMergeTreeテーブルになります）、ClickHouse Cloudが垂直および水平スケーリングを自動的に処理します。テーブルをレプリケートまたはシャードする方法について考慮する必要はありません。
:::

この例では、セルフマネージドClickHouseサーバーが*ソース*で、ClickHouse Cloudサービスが*宛先*です。

### 概要 {#overview}

プロセスは以下の通りです：

1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブルの構造を複製
1. ソースから宛先へのデータを引き出すか、ソースからプッシュする（ソースのネットワーク可用性に依存）
1. 宛先のIPアクセスリストからソースサーバーを削除（該当する場合）
1. ソースサービスから読み取り専用ユーザーを削除


### 一つのシステムから別のシステムへのテーブルの移行： {#migration-of-tables-from-one-system-to-another}
この例では、セルフマネージドClickHouseサーバーからClickHouse Cloudに1つのテーブルを移行します。

### ソースClickHouseシステム上で（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソーステーブル（この例では`db.table`）を読み取ることができる読み取り専用ユーザーを追加
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

### 宛先ClickHouse Cloudシステム上で： {#on-the-destination-clickhouse-cloud-system}

- 宛先データベースを作成：
```sql
CREATE DATABASE db
```

- ソースからのCREATE TABLE文を使用して、宛先を作成します。

:::tip
CREATE文を実行するときに、エンジンをReplicatedMergeTreeに変更し、パラメーターなしで実行してください。ClickHouse Cloudは常にテーブルをレプリケートし、正しいパラメータを提供します。ただし、`ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL`、および`SETTINGS`句は維持してください。
:::

```sql
CREATE TABLE db.table ...
```


- `remoteSecure`関数を使用してセルフマネージドソースからデータを引き出す

<img src={require('./images/self-managed-03.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}}/>


```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
ソースシステムが外部ネットワークから利用できない場合は、データをプッシュすることもできます。`remoteSecure`関数はSELECTとINSERTの両方で機能します。次のオプションを参照してください。
:::

- `remoteSecure`関数を使用してClickHouse Cloudサービスにデータをプッシュする

<img src={require('./images/self-managed-04.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '30%', padding: '30px'}}/>


:::tip リモートシステムをClickHouse CloudサービスのIPアクセスリストに追加
`remoteSecure`関数がClickHouse Cloudサービスに接続するためには、リモートシステムのIPアドレスをIPアクセスリストで許可する必要があります。 このヒントの下で**IPアクセスリストの管理**を展開して、詳細を確認してください。
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```



## ClickHouse Cloudサービス間の移行 {#migrating-between-clickhouse-cloud-services}

<img src={require('./images/self-managed-05.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}}/>


ClickHouse Cloudサービス間でデータを移行する際のいくつかの使用例：
- 復元したバックアップからデータを移行
- 開発サービスからステージングサービスにデータをコピー（またはステージングから本番へのコピー）

この例では、2つのClickHouse Cloudサービスがあり、それぞれを*ソース*と*宛先*と呼びます。データはソースから宛先に引き出されます。プッシュも可能ですが、読み取り専用ユーザーを使用するため、引き出す方法を示します。


<img src={require('./images/self-managed-06.png').default} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '80%', padding: '30px'}}/>


移行にはいくつかのステップがあります：
1. 一つのClickHouse Cloudサービスを*ソース*に、もう一つを*宛先*に指定
1. ソースサービスに読み取り専用ユーザーを追加
1. 宛先サービスにソーステーブルの構造を複製
1. 一時的にソースサービスへのIPアクセスを許可
1. ソースから宛先にデータをコピー
1. 宛先のIPアクセスリストを再設定
1. ソースサービスから読み取り専用ユーザーを削除


#### ソースサービスに読み取り専用ユーザーを追加 {#add-a-read-only-user-to-the-source-service}

- ソーステーブル（この例では`db.table`）を読み取ることができる読み取り専用ユーザーを追加
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

#### 宛先サービスにテーブル構造を複製する {#duplicate-the-table-structure-on-the-destination-service}

宛先にデータベースがまだ存在しない場合は作成します：

- 宛先データベースを作成：
  ```sql
  CREATE DATABASE db
  ```



- ソースからのCREATE TABLE文を使用して宛先を作成。

  ソースの`select create_table_query...`の出力を使用して、宛先にテーブルを作成します：

  ```sql
  CREATE TABLE db.table ...
  ```

#### ソースサービスへのリモートアクセスを許可する {#allow-remote-access-to-the-source-service}

ソースから宛先にデータを引き出すためには、ソースサービスが接続を許可する必要があります。ソースサービスで「IPアクセスリスト」機能を一時的に無効にします。

:::tip
ソースClickHouse Cloudサービスを引き続き使用する場合は、どこからでもアクセスできるようにする前に、既存のIPアクセスリストをJSONファイルにエクスポートしてください。これにより、データが移行された後にアクセスリストをインポートできます。
:::

許可リストを変更し、一時的に**Anywhere**からのアクセスを許可します。詳細については、[IPアクセスリスト](/cloud/security/setting-ip-filters)のドキュメントを参照してください。

#### ソースから宛先へのデータをコピーする {#copy-the-data-from-source-to-destination}

- `remoteSecure`関数を使用してソースClickHouse Cloudサービスからデータを引き出す
  宛先に接続します。宛先ClickHouse Cloudサービスでこのコマンドを実行します：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 宛先サービスでデータを確認します

#### ソースのIPアクセスリストを再設定する {#re-establish-the-ip-access-list-on-the-source}

  以前にアクセスリストをエクスポートしている場合は、**Share**を使用して再度インポートできます。それ以外の場合は、アクセスリストにエントリーを再追加してください。

#### 読み取り専用の`exporter`ユーザーを削除する {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- サービスのIPアクセスリストを切り替えてアクセスを制限します
