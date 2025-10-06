---
'description': 'ClickHouse データベースとテーブルのバックアップおよび復元ガイド'
'sidebar_label': 'バックアップと復元'
'sidebar_position': 10
'slug': '/operations/backup'
'title': 'バックアップと復元'
'doc_type': 'guide'
---


# バックアップとリストア

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3エンドポイントを使用するためのバックアップ/リストアの構成](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3ディスクを使用したバックアップ/リストア](#backuprestore-using-an-s3-disk)
- [代替手段](#alternatives)

## コマンド概要 {#command-summary}

```bash
BACKUP|RESTORE
 TABLE [db.]table_name [AS [db.]table_name_in_backup]
   [PARTITION[S] partition_expr [,...]] |
 DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
 DATABASE database_name [AS database_name_in_backup]
   [EXCEPT TABLES ...] |
 TEMPORARY TABLE table_name [AS table_name_in_backup] |
 VIEW view_name [AS view_name_in_backup] |
 ALL [EXCEPT {TABLES|DATABASES}...] } [,...]
 [ON CLUSTER 'cluster_name']
 TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
 [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]

```

:::note ALL
ClickHouseのバージョン23.4以前では、 `ALL`は「RESTORE」コマンドにのみ適用されました。
:::

## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェアの故障からの保護を提供しますが、人為的エラーを防ぐことはできません。データの誤削除、誤ったテーブルの削除、間違ったクラスターのテーブルの削除、データ処理の誤りやデータ損失を引き起こすソフトウェアバグなどが含まれます。多くのケースで、これらのミスは全てのレプリカに影響を与えます。ClickHouseには、ある種のミスを防ぐための組み込みの安全対策があります - たとえば、[デフォルトで50GBを超えるデータを持つMergeTreeのようなエンジンでテーブルを簡単に削除することはできません](/operations/settings/settings#max_table_size_to_drop)。しかし、これらの安全対策はすべての可能なケースをカバーしているわけではなく、回避されることがあります。

人為的エラーの可能性を効果的に軽減するために、データのバックアップとリストアの戦略を**前もって**慎重に準備する必要があります。

各企業には異なるリソースとビジネス要件があるため、すべての状況に適したClickHouseのバックアップとリストアの普遍的なソリューションは存在しません。1ギガバイトのデータで機能することが、数十ペタバイトには機能しない可能性があります。利点と欠点を持つさまざまなアプローチがありますが、以下で説明します。さまざまな欠点を補うためには、一つのアプローチだけでなく、いくつかのアプローチを使用することをお勧めします。

:::note
バックアップを取ったが、リストアを試みていない場合、実際に必要なときにリストアが正しく機能しない可能性が高いことを忘れないでください（または少なくともビジネスが許容できるよりも長くかかります）。したがって、どのバックアップアプローチを選択するにせよ、リストアプロセスも自動化し、定期的に予備のClickHouseクラスターで練習してください。
:::

## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、`Disk('backups', '1.zip')`のようにバックアップ先が指定されています。バックアップ先を準備するには、`/etc/clickhouse-server/config.d/backup_disk.xml`にファイルを追加してバックアップ先を指定します。たとえば、このファイルでは、`backups`という名前のディスクを定義し、その後**backups > allowed_disk**リストにそのディスクを追加します。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
<!--highlight-next-line -->
            <backups>
                <type>local</type>
                <path>/backups/</path>
            </backups>
        </disks>
    </storage_configuration>
<!--highlight-start -->
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path>
    </backups>
<!--highlight-end -->
</clickhouse>
```

### パラメータ {#parameters}

バックアップはフルまたはインクリメンタルで、テーブル（マテリアライズドビュー、プロジェクション、ディクショナリを含む）やデータベースを含めることができます。バックアップは同期（デフォルト）または非同期に行うことができます。圧縮も可能です。バックアップはファイルにパスワード保護を適用することができます。

BACKUPおよびRESTOREステートメントは、DATABASEおよびTABLE名のリスト、宛先（またはソース）、オプションおよび設定を受け取ります：
- バックアップの宛先、またはリストアのソース。この設定は前に定義したディスクに基づいています。例えば、`Disk('backups', 'filename.zip')`
- ASYNC: 非同期でバックアップまたはリストア
- PARTITIONS: リストアするパーティションのリスト
- SETTINGS:
  - `id`: バックアップまたはリストア操作の識別子。設定されていないか空である場合は、ランダムに生成されたUUIDが使用されます。非空の文字列として明示的に設定されている場合は、毎回異なる必要があります。この`id`は、特定のバックアップまたはリストア操作に関連する`system.backups`テーブル内の行を見つけるために使用されます。
  - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec)およびcompression_level
  - ディスク上のファイルの`password`
  - `base_backup`: このソースの前のバックアップの宛先。たとえば、`Disk('backups', '1.zip')`
  - `use_same_s3_credentials_for_base_backup`: S3への基本バックアップがクエリから資格情報を引き継ぐかどうか。`S3`でのみ機能します。
  - `use_same_password_for_base_backup`: 基本バックアップアーカイブがクエリからパスワードを引き継ぐかどうか。
  - `structure_only`: 有効な場合、テーブルのデータなしでCREATEステートメントのみをバックアップまたはリストアすることを許可します
  - `storage_policy`: リストアされるテーブルのストレージポリシー。詳細は[Multiple Block Devices for Data Storageを使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は`RESTORE`コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
  - `s3_storage_class`: S3バックアップに使用されるストレージクラス。たとえば、`STANDARD`
  - `azure_attempt_to_create_container`: Azure Blob Storageを使用しているときに、指定されたコンテナが存在しない場合に作成を試みるかどうか。デフォルト: true。
  - [core settings](/operations/settings/settings)もここで使用することができます。

### 使用例 {#usage-examples}

テーブルをバックアップしてリストアします：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応するリストア：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記のRESTOREは、`test.table`にデータが含まれている場合は失敗します。RESTOREをテストするにはテーブルを削除する必要があるか、`allow_non_empty_tables=true`設定を使用する必要があります：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

テーブルは新しい名前でリストアまたはバックアップすることができます：
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### インクリメンタルバックアップ {#incremental-backups}

インクリメンタルバックアップは、`base_backup`を指定することで取得できます。
:::note
インクリメンタルバックアップは基本バックアップに依存しています。インクリメンタルバックアップからリストアするには、基本バックアップを保持する必要があります。
:::

新しいデータをインクリメンタルに保存します。`base_backup`設定により、以前のバックアップからのデータが`Disk('backups', 'd.zip')`に保存され、`Disk('backups', 'incremental-a.zip')`に保存されます：
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

インクリメンタルバックアップと基本バックアップからすべてのデータを新しいテーブル`test.table2`にリストアします：
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定する {#assign-a-password-to-the-backup}

ディスクに書き込まれたバックアップファイルにパスワードを適用できます：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

リストア：
```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### 圧縮設定 {#compression-settings}

圧縮方法やレベルを指定したい場合：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションをリストアする {#restore-specific-partitions}
テーブルに関連する特定のパーティションをリストアする必要がある場合、それらを指定することができます。バックアップからパーティション1と4をリストアするには：
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tarアーカイブとしてのバックアップ {#backups-as-tar-archives}

バックアップはtarアーカイブとして保存することもできます。機能はzipと同じですが、パスワードはサポートされていません。

tarとしてバックアップを作成：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応するリストア：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方法を変更するには、バックアップ名に適切なファイルサフィックスを追加します。つまり、gzipを使用してtarアーカイブを圧縮する場合：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイルサフィックスは、`tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst`、および`.tar.xz`です。

### バックアップの状態を確認する {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップの状態を取得できます。これは、長時間の非同期バックアップの進行状況を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとした際の失敗を示しています：
```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```
```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    *
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```
```response
Row 1:
──────
id:                7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:              Disk('backups', '1.zip')
#highlight-next-line
status:            BACKUP_FAILED
num_files:         0
uncompressed_size: 0
compressed_size:   0
#highlight-next-line
error:             Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 22.8.2.11 (official build))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

`system.backups`テーブルに加えて、すべてのバックアップおよびリストア操作は、システムログテーブル[backup_log](../operations/system-tables/backup_log.md)で追跡されます：
```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```
```response
Row 1:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.097414
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  CREATING_BACKUP
error:
start_time:              2023-08-18 11:13:43
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.174782
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  BACKUP_FAILED
#highlight-next-line
error:                   Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

2 rows in set. Elapsed: 0.075 sec.
```

## BACKUP/RESTOREをS3エンドポイントで使用するための構成 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3バケットにバックアップを保存するには、次の3つの情報が必要です：
- S3エンドポイント、
  例: `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID、
  例: `ABC123`
- シークレットアクセストークン、
  例: `Abc+123`

:::note
S3バケットの作成は[Use S3 Object Storage as a ClickHouse disk](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)で説明されています。ポリシーを保存した後にこのドキュメントに戻ってきてください。ClickHouseをS3バケットで使用するように設定する必要はありません。
:::

バックアップの宛先は次のように指定されます：

```sql
S3('<S3 endpoint>/<directory>', '<Access key ID>', '<Secret access key>')
```

```sql
CREATE TABLE data
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

### ベース（初期）バックアップを作成する {#create-a-base-initial-backup}

インクリメンタルバックアップは、_ベース_バックアップから開始する必要があります。この例は後でベースバックアップとして使用されます。S3宛先の最初のパラメータはS3エンドポイントで、次にこのバックアップに使用するバケット内のディレクトリが続きます。この例では、ディレクトリは`my_backup`と呼ばれています。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### さらにデータを追加 {#add-more-data}

インクリメンタルバックアップは、基本バックアップとバックアップされるテーブルの現在のコンテンツとの違いで構成されます。インクリメンタルバックアップを取る前にデータを追加します：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### インクリメンタルバックアップを取る {#take-an-incremental-backup}

このバックアップコマンドは基本バックアップと似ていますが、`SETTINGS base_backup`と基本バックアップの場所を追加します。インクリメンタルバックアップの宛先は基本バックアップと同じディレクトリではなく、同じエンドポイント内の異なるターゲットディレクトリです。基本バックアップは`my_backup`にあり、インクリメンタルは`my_incremental`に書き込まれます：
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### インクリメンタルバックアップからリストアする {#restore-from-the-incremental-backup}

このコマンドはインクリメンタルバックアップを新しいテーブル`data3`にリストアします。インクリメンタルバックアップがリストアされるとき、基本バックアップも含まれていることに注意してください。リストア時はインクリメンタルバックアップのみを指定します：
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### カウントを検証する {#verify-the-count}

元のテーブル`data`には、1,000行のデータと100行のデータが2回挿入された合計1,100行があります。リストアされたテーブルに1,100行があることを確認します：
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 内容を検証する {#verify-the-content}
元のテーブル`data`とリストアされたテーブル`data3`の内容を比較します：
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Data does not match after BACKUP/RESTORE')
```
## S3ディスクを使用したBACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouseストレージ設定でS3ディスクを構成することで、S3に`BACKUP`/`RESTORE`することも可能です。次のようにディスクを構成します。`/etc/clickhouse-server/config.d`にファイルを追加します：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3_plain>
                <type>s3_plain</type>
                <endpoint></endpoint>
                <access_key_id></access_key_id>
                <secret_access_key></secret_access_key>
            </s3_plain>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3_plain</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>

    <backups>
        <allowed_disk>s3_plain</allowed_disk>
    </backups>
</clickhouse>
```

そして、通常通りに`BACKUP`/`RESTORE`を実行します：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、以下の点に注意してください：
- このディスクは`MergeTree`自体には使用すべきではなく、`BACKUP`/`RESTORE`のみに使用すべきです。
- テーブルがS3ストレージにサポートされ、ディスクの種類が異なる場合、`CopyObject`コールを使用してパーツを宛先バケットにコピーするのではなく、ダウンロードとアップロードが行われ、非常に非効率的です。このユースケースには、`BACKUP ... TO S3(<endpoint>)`構文の使用をお勧めします。
:::

## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは`BACKUP/RESTORE`パラメータに使用できます。例については[こちら](./named-collections.md#named-collections-for-backups)を参照してください。

## 代替手段 {#alternatives}

ClickHouseはディスク上にデータを保存し、ディスクのバックアップには多くの方法があります。以下は、過去に使用されてきた代替手段のいくつかであり、あなたの環境に適合する可能性があります。

### 他の場所にソースデータを複製する {#duplicating-source-data-somewhere-else}

多くの場合、ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)のような永続的キューを通じて提供されます。この場合、ClickHouseに書き込まれている間に同じデータストリームを読み取る追加のサブスクライバセットを構成し、どこかのコールドストレージに保存することが可能です。ほとんどの企業には、オブジェクトストアや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムのようないくつかのデフォルトの推奨コールドストレージがあります。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供します（たとえば、[ZFS](https://en.wikipedia.org/wiki/ZFS)）。しかし、ライブクエリの提供には最適な選択肢ではないかもしれません。可能な解決策は、この種のファイルシステムで追加のレプリカを作成し、`SELECT`クエリで使用される[分散](../engines/table-engines/special/distributed.md)テーブルから除外することです。そのようなレプリカのスナップショットは、データを変更する任意のクエリからはアクセスできなくなります。ボーナスとして、これらのレプリカは、サーバーあたりにより多くのディスクが接続された特別なハードウェア構成を持つ場合があり、コスト効率が良いです。

データボリュームが小さい場合は、リモートテーブルへの単純な`INSERT INTO ... SELECT ...`も機能するかもしれません。

### パーツの操作 {#manipulations-with-parts}

ClickHouseは、`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用して、テーブルパーティションのローカルコピーを作成することを許可します。これは、`/var/lib/clickhouse/shadow/`フォルダーへのハードリンクを使用して実装されるため、古いデータに対して追加のディスクスペースを消費することは通常ありません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そこに残しておくことができます。この方法は追加の外部システムを必要としないシンプルなバックアップが得られますが、ハードウェアの問題に対しては依然として影響を受ける可能性があります。そのため、それらを別の場所にリモートコピーしてからローカルコピーを削除する方が良いです。分散ファイルシステムやオブジェクトストアは依然として良い選択肢ですが、十分な容量のある通常の接続ファイルサーバーでも機能するかもしれません（この場合、転送はネットワークファイルシステムを介して行われるか、あるいは[rsync](https://en.wikipedia.org/wiki/Rsync)を使うかもしれません）。
データは、`ALTER TABLE ... ATTACH PARTITION ...`を使用してバックアップからリストアすることができます。

パーティション操作に関連するクエリの詳細については、[ALTERドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するためのサードパーティ製ツールも利用可能です：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 同時バックアップ/リストアを禁止するための設定 {#settings-to-disallow-concurrent-backuprestore}

同時のバックアップ/リストアを禁止するには、それぞれ以下の設定を使用できます。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

デフォルト値は両方ともtrueであり、デフォルトでは同時のバックアップ/リストアが許可されています。
これらの設定がクラスターでfalseの場合、同時に1つのバックアップ/リストアの実行が許可されます。

## AzureBlobStorageエンドポイントを使用してバックアップ/リストアを構成する {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書くには、次の情報が必要です：
- AzureBlobStorageエンドポイント接続文字列 / url、
- コンテナ、
- パス、
- アカウント名（urlが指定されている場合）
- アカウントキー（urlが指定されている場合）

バックアップの宛先は次のように指定されます：

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```

## システムテーブルのバックアップ {#backup-up-system-tables}

システムテーブルもバックアップおよびリストアのワークフローに含めることができますが、その含有は特定のユースケースに依存します。

### ログテーブルのバックアップ {#backing-up-log-tables}

履歴データを保存するシステムテーブル（例えば、`query_log`、`part_log`などの_logサフィックスを持つテーブル）は、他のテーブルと同様にバックアップおよびリストアできます。ユースケースが履歴データの分析に依存する場合（たとえば、query_logを使用してクエリのパフォーマンスを追跡または問題をデバッグする場合）、これらのテーブルをバックアップ戦略に含めることが推奨されます。しかし、これらのテーブルの履歴データが必要ない場合は、バックアップストレージスペースを節約するために除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

ユーザー、ロール、row_policies、settings_profiles、およびクォータなど、アクセス管理に関連するシステムテーブルは、バックアップおよびリストア操作中に特別な扱いを受けます。これらのテーブルがバックアップに含まれると、その内容はアクセスエンティティの作成および構成のための同等のSQLステートメントをカプセル化した特別な`accessXX.txt`ファイルにエクスポートされます。リストア時には、リストアプロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、および他の構成を再作成します。

この機能により、ClickHouseクラスターのアクセス制御設定をバックアップおよびリストアし、クラスター全体のセットアップの一部として保管できます。

注意：この機能はSQLコマンドを介して管理される構成（["SQL駆動のアクセス制御とアカウント管理"](/operations/access-rights#enabling-access-control)と呼ばれます）に対してのみ機能します。ClickHouseサーバー構成ファイル（例えば、`users.xml`）に定義されたアクセス構成はバックアップに含まれず、この方法でリストアすることはできません。
