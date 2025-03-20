---
slug: /operations/backup
description: 人為的エラーを効果的に軽減するために、データのバックアップと復元の戦略を慎重に準備する必要があります。
---


# バックアップと復元

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3エンドポイントを使用したバックアップ/復元の設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3ディスクを使用したバックアップ/復元](#backuprestore-using-an-s3-disk)
- [代替案](#alternatives)

## コマンドの概要 {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [,...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup]
  ALL TEMPORARY TABLES [EXCEPT ...] |
  ALL [EXCEPT ...] } [,...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
```

:::note ALL
ClickHouseのバージョン23.4以前では、 `ALL`は`RESTORE`コマンドにのみ適用されました。
:::

## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェアの故障から保護するものの、人為的エラーに対しては保護されません。データの誤削除、間違ったテーブルの削除、または間違ったクラスターでのテーブルの削除、ソフトウェアのバグにより不正なデータ処理やデータの破損が発生する可能性があります。多くの場合、これらのミスはすべてのレプリカに影響を及ぼします。ClickHouseには、いくつかの種類のミスを防ぐための組み込みのセーフガードがあります。たとえば、デフォルトでは[50Gbを超えるデータを持つMergeTreeエンジンを持つテーブルを削除することはできません](/operations/settings/settings#max_table_size_to_drop)。しかし、これらのセーフガードはすべての可能なケースをカバーしておらず、回避される可能性もあります。

人為的エラーの可能性を効果的に軽減するためには、データのバックアップと復元の戦略を**事前に**慎重に準備する必要があります。

各企業には異なるリソースとビジネス要件があるため、すべての状況に適したClickHouseのバックアップおよび復元のユニバーサルなソリューションは存在しません。1ギガバイトのデータに適している方法が、数十ペタバイトには適さない可能性があります。さまざまな利点と欠点を持つ可能性のあるアプローチがあり、これから説明します。さまざまな欠点を補うために一つの方法だけでなく、いくつかの方法を併用することをお勧めします。

:::note
何かをバックアップして、それを復元しようとしたことがない場合、実際に必要なときに復元が正しく機能しない可能性があります（少なくとも、ビジネスが許容できるよりも時間がかかるでしょう）。したがって、どのバックアップアプローチを選択するにせよ、復元プロセスも自動化し、余分なClickHouseクラスターで定期的に実行しておくことを確認してください。
:::

## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先を`Disk('backups', '1.zip')`として指定しています。バックアップ先を設定するには、`/etc/clickhouse-server/config.d/backup_disk.xml`にファイルを追加して、バックアップ先を指定します。たとえば、このファイルは名前`backups`のディスクを定義し、そのディスクを**backups > allowed_disk**リストに追加します。

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

### パラメーター {#parameters}

バックアップはフルバックアップまたは増分バックアップのいずれかであり、テーブル（マテリアライズドビュー、プロジェクション、辞書を含む）およびデータベースを含むことができます。バックアップは同期（デフォルト）または非同期にすることができ、圧縮が可能です。バックアップにはパスワード保護が施されることもあります。

BACKUPおよびRESTOREステートメントは、データベースおよびテーブル名のリスト、バックアップまたは復元のための宛先（またはソース）、オプションおよび設定を受け取ります。
- バックアップの宛先、または復元のソース。これは、前述のディスクに基付くものです。たとえば、`Disk('backups', 'filename.zip')`
- ASYNC: 非同期バックアップまたは復元
- PARTITIONS: 復元するパーティションのリスト
- SETTINGS:
    - `id`: バックアップまたは復元操作のid、手動で指定しない場合はランダムに生成されたUUIDが使用されます。同じ`id`で実行中の操作がある場合は例外がスローされます。
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec)およびcompression_level
    - ディスク上のファイルのための`password`
    - `base_backup`: このソースの前のバックアップの宛先。たとえば、`Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: base_backupをS3に対して、クエリから認証情報を引き継ぐかどうか。`S3`でのみ機能します。
    - `use_same_password_for_base_backup`: base_backupアーカイブがクエリからパスワードを引き継ぐべきかどうか。
    - `structure_only`: 有効にすると、テーブルのデータなしでCREATEステートメントのみをバックアップまたは復元できるようになります。
    - `storage_policy`: 復元されるテーブルのストレージポリシー。[データストレージに複数のブロックデバイスを使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は、`RESTORE`コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
    - `s3_storage_class`: S3バックアップに使用するストレージクラス。たとえば、`STANDARD`
    - `azure_attempt_to_create_container`: Azure Blob Storageを使用する際に、指定されたコンテナが存在しない場合に作成されるかどうか。デフォルト: true。
    - [core settings](/operations/settings/settings)もここで使用できます。

### 使用例 {#usage-examples}

テーブルをバックアップしてから復元します：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記のRESTOREは、テーブル`test.table`にデータが含まれている場合失敗します。RESTOREをテストするにはテーブルを削除する必要があります。または、設定`allow_non_empty_tables=true`を使用します：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

テーブルは新しい名前で復元またはバックアップできます：
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 増分バックアップ {#incremental-backups}

増分バックアップは`base_backup`を指定することで取得できます。
:::note
増分バックアップはbaseバックアップに依存しています。増分バックアップから復元するためには、baseバックアップが常に利用可能でなければなりません。
:::

新しいデータを増分的に保存します。設定`base_backup`により、前のバックアップ以来のデータが`Disk('backups', 'd.zip')`から`Disk('backups', 'incremental-a.zip')`に保存されます：
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップとbase_backupからすべてのデータを新しいテーブル`test.table2`に復元します：
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定する {#assign-a-password-to-the-backup}

ディスクに書き込まれたバックアップには、ファイルにパスワードが適用されることがあります：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

復元：
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

### 特定のパーティションを復元する {#restore-specific-partitions}
特定のテーブルに関連するパーティションを復元する必要がある場合、それらを指定できます。バックアップからパーティション1と4を復元します：
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### バックアップをtarアーカイブとして保存する {#backups-as-tar-archives}

バックアップはtarアーカイブとしても保存できます。機能はzipと同じですが、パスワードはサポートされていません。

tarとしてバックアップを書きます：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方法を変更するには、バックアップ名に正しいファイル拡張子を追加する必要があります。つまり、gzipを使用してtarアーカイブを圧縮するには：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされる圧縮ファイルの拡張子は`tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst`、および`.tar.xz`です。

### バックアップの状態を確認する {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップの状態を取得することができます。これは長いASYNCバックアップの進捗を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとした際に発生した失敗を示しています：
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
where id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
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

`system.backups`テーブルに加え、すべてのバックアップおよび復元操作はシステムログテーブル[backup_log](../operations/system-tables/backup_log.md)にも追跡されています：
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

## S3エンドポイントを使用したBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3バケットにバックアップを書き込むには、次の3つの情報が必要です。
- S3エンドポイント、
  たとえば`https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID、
  たとえば`ABC123`
- シークレットアクセスキー、
  たとえば`Abc+123`

:::note
S3バケットの作成は[ClickHouseディスクとしてS3オブジェクトストレージを使用](../integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)で説明されています。ポリシーを保存した後は、このドキュメントに戻ってきてください。ClickHouseをS3バケットで使用するために設定する必要はありません。
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

増分バックアップには、開始元となる_ベース_バックアップが必要です。この例は後でベースバックアップとして使用されます。S3宛先の最初のパラメータはS3エンドポイントで、その後にこのバックアップに使用するバケット内のディレクトリ名が続きます。この例では、ディレクトリは`my_backup`と呼ばれます。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### さらにデータを追加 {#add-more-data}

増分バックアップは、ベースバックアップとバックアップされているテーブルの現在の内容との間の違いで構成されます。増分バックアップを取る前に、さらなるデータを追加します：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### 増分バックアップを取得する {#take-an-incremental-backup}

このバックアップコマンドは、ベースバックアップに似ていますが、`SETTINGS base_backup`とベースバックアップの場所が追加されます。増分バックアップの宛先は、ベースバックアップとは異なるディレクトリであることに注意してください。ベースバックアップは`my_backup`にあり、増分バックアップは`my_incremental`に書き込まれます：

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### 増分バックアップから復元する {#restore-from-the-incremental-backup}

このコマンドは、増分バックアップを新しいテーブル`data3`に復元します。増分バックアップを復元すると、ベースバックアップも含まれます。復元の際には、増分バックアップのみを指定します：
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### カウントを確認する {#verify-the-count}

元のテーブル`data`には、1,000行の挿入と100行の挿入があり、合計で1,100行です。復元されたテーブルに1,100行があるか確認します：
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 内容を確認する {#verify-the-content}
元のテーブル`data`と復元されたテーブル`data3`の内容を比較します：
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'BACKUP/RESTORE後にデータが一致しません')
```
## S3ディスクを使用したBACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouseストレージ構成でS3ディスクを設定することで、`BACKUP`/`RESTORE`をS3に対して行うことも可能です。次のファイルを`/etc/clickhouse-server/config.d`に追加して、ディスクを設定します。

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

その後、通常通り`BACKUP`/`RESTORE`を実行します：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、次の点に留意してください：
- このディスクは`MergeTree`自体では使用しないでください。`BACKUP`/`RESTORE`のみの使用を推奨します。
- テーブルがS3ストレージによってバックアップされ、ディスクのタイプが異なる場合、`CopyObject`呼び出しを使用してパーツを宛先バケットにコピーするのではなく、ダウンロードしてアップロードするため、非常に非効率です。このユースケースでは`BACKUP ... TO S3(<endpoint>)`構文の使用をお勧めします。
:::

## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは、`BACKUP/RESTORE`パラメータに使用できます。[こちら](./named-collections.md#named-collections-for-backups)に例があります。

## 代替案 {#alternatives}

ClickHouseはディスク上にデータを保存し、ディスクのバックアップ方法は多くあります。以下は過去に使用された代替案の一部であり、あなたの環境に適しているかもしれません。

### ソースデータの他の場所への複製 {#duplicating-source-data-somewhere-else}

多くの場合、ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)のような持続的なキューを通じて配信されます。この場合、追加のサブスクライバーを設定して、ClickHouseに書き込まれている間に同じデータストリームを読み取ることができ、冷ストレージのどこかに保存することが可能です。ほとんどの企業には、オブジェクトストアや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような、推奨される冷ストレージがあると思われます。

### ファイルシステムのスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムにはスナップショット機能があります（例： [ZFS](https://en.wikipedia.org/wiki/ZFS)）。ただし、ライブクエリの提供には最適でない可能性があります。解決策としては、この種のファイルシステムを持つ追加のレプリカを作成し、`SELECT`クエリに使用される[分散テーブル](../engines/table-engines/special/distributed.md)から除外されるのが考えられます。そのようなレプリカのスナップショットは、データを修正するクエリの影響を受けないでしょう。さらに、これらのレプリカは、サーバーごとにより多くのディスクが接続された特別なハードウェア構成を持っている可能性があり、コスト効果的です。

より小さなデータボリュームの場合、単純な`INSERT INTO ... SELECT ...`をリモートテーブルに対して実行するのも機能するかもしれません。

### パーツに関する操作 {#manipulations-with-parts}

ClickHouseは、`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用して、テーブルパーティションのローカルコピーを作成することを許可しています。これは`/var/lib/clickhouse/shadow/`フォルダへのハードリンクを使用して実装されているため、古いデータの追加ディスクスペースを通常は消費しません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そこに放置しておくことができます。この場合、追加の外部システムを必要とせずに単純なバックアップができることになりますが、ハードウェアの問題には引き続き悩まされる可能性があります。このため、別のロケーションにリモートコピーしてからローカルコピーを削除する方が良いでしょう。分散ファイルシステムやオブジェクトストアは、これにとって良いオプションですが、十分な容量を持つ通常のファイルサーバーも機能するかもしれません（この場合の転送は、ネットワークファイルシステムまたは[rsync](https://en.wikipedia.org/wiki/Rsync)を介して行われます）。バックアップからデータを復元するには、`ALTER TABLE ... ATTACH PARTITION ...`を使用します。

パーティション操作に関連するクエリの詳細については、[ALTERドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するためのサードパーティツールがあります：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 同時バックアップ/復元を禁止する設定 {#settings-to-disallow-concurrent-backuprestore}

同時のバックアップ/復元を禁止するには、これらの設定をそれぞれ使用できます。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値はtrueであるため、デフォルトでは同時バックアップ/復元が許可されています。この設定がクラスターでfalseの場合、クラスターで実行できるバックアップ/復元は1つだけです。

## AzureBlobStorageエンドポイントを使用したBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書き込むには、次の情報が必要です：
- AzureBlobStorageエンドポイント接続文字列/URL、
- コンテナ、
- パス、
- アカウント名（URLが指定される場合）
- アカウントキー（URLが指定される場合）

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

システムテーブルもバックアップおよび復元のワークフローに含めることができますが、含めるかどうかは特定の使用例によります。

### ログテーブルのバックアップ {#backing-up-log-tables}

`query_log`や`part_log`のように歴史データを保存するシステムテーブルは、他のテーブルと同様にバックアップおよび復元できます。使用例が、履歴データの分析に依存する場合（たとえば、クエリのパフォーマンスを追跡したり、問題をデバッグするために`query_log`を使用する場合）、これらのテーブルをバックアップ戦略に含めることをお勧めします。ただし、これらのテーブルの履歴データが必要ない場合、バックアップストレージスペースを節約するためにそれらを除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

ユーザー、ロール、行ポリシー、設定プロファイル、クォータなど、アクセス管理に関連するシステムテーブルは、バックアップおよび復元操作中に特別な扱いを受けます。これらのテーブルがバックアップに含まれると、その内容は特別な`accessXX.txt`ファイルにエクスポートされ、アクセスエンティティの作成および構成のための同等のSQL文をカプセル化します。復元時には、復元プロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、その他の構成を再作成します。

この機能により、ClickHouseクラスターのアクセス制御構成をクラスター全体のセットアップの一部としてバックアップおよび復元できます。

注意: この機能は、SQLコマンドを通じて管理される構成にのみ機能します（["SQL主導のアクセス制御およびアカウント管理"](/operations/access-rights#enabling-access-control)を参照）。ClickHouseサーバー設定ファイル（例:`users.xml`）で定義されたアクセス構成はバックアップに含まれず、この方法で復元することはできません。
