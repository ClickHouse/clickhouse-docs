---
description: 'ClickHouse データベースおよびテーブルのバックアップと復元ガイド'
sidebar_label: 'バックアップと復元'
sidebar_position: 10
slug: /operations/backup
title: 'バックアップと復元'
doc_type: 'guide'
---



# バックアップとリストア

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3 エンドポイントを利用したバックアップ/リストアの設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3 ディスクを利用したバックアップ/リストア](#backuprestore-using-an-s3-disk)
- [代替案](#alternatives)



## コマンドの概要 {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [, ...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup] |
  ALL [EXCEPT {TABLES|DATABASES}...] } [, ...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
  [SYNC|ASYNC]

```

:::note ALL
ClickHouseバージョン23.4より前では、`ALL`は`RESTORE`コマンドにのみ適用されます。
:::


## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェア障害からの保護を提供しますが、人為的なミスからは保護されません。データの誤削除、誤ったテーブルの削除、誤ったクラスタ上のテーブルの削除、不正なデータ処理やデータ破損を引き起こすソフトウェアのバグなどが該当します。多くの場合、このようなミスはすべてのレプリカに影響を及ぼします。ClickHouseには、いくつかの種類のミスを防ぐための組み込みの保護機能があります。例えば、デフォルトでは[50 GB以上のデータを含むMergeTree系エンジンのテーブルを単純に削除することはできません](/operations/settings/settings#max_table_size_to_drop)。しかし、これらの保護機能はすべての可能なケースをカバーしておらず、回避することも可能です。

人為的なミスの可能性を効果的に軽減するためには、データのバックアップと復元の戦略を**事前に**慎重に準備する必要があります。

各企業には利用可能なリソースやビジネス要件が異なるため、あらゆる状況に適合するClickHouseのバックアップと復元の万能な解決策は存在しません。1ギガバイトのデータに有効な方法は、数十ペタバイトには適さない可能性があります。それぞれに長所と短所を持つさまざまなアプローチが存在し、以下で説明します。さまざまな欠点を補うために、1つだけでなく複数のアプローチを使用することが推奨されます。

:::note
バックアップを取得しても復元を試したことがない場合、実際に必要になったときに復元が正常に機能しない可能性が高い(または少なくともビジネスが許容できる時間よりも長くかかる)ことを念頭に置いてください。したがって、どのバックアップアプローチを選択する場合でも、復元プロセスも自動化し、予備のClickHouseクラスタで定期的に実践するようにしてください。
:::


## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先が`Disk('backups', '1.zip')`のように指定されています。バックアップ先を準備するには、`/etc/clickhouse-server/config.d/backup_disk.xml`にファイルを追加してバックアップ先を指定します。例えば、このファイルは`backups`という名前のディスクを定義し、そのディスクを**backups > allowed_disk**リストに追加します:

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

バックアップは完全バックアップまたは増分バックアップのいずれかで、テーブル(マテリアライズドビュー、プロジェクション、ディクショナリを含む)とデータベースを含めることができます。バックアップは同期(デフォルト)または非同期で実行できます。圧縮することも可能です。バックアップはパスワードで保護することができます。

BACKUPおよびRESTORE文は、DATABASEとTABLEの名前のリスト、宛先(または復元元)、オプション、設定を受け取ります:

- バックアップの宛先、または復元の復元元。これは先に定義したディスクに基づきます。例: `Disk('backups', 'filename.zip')`
- ASYNC: バックアップまたは復元を非同期で実行
- PARTITIONS: 復元するパーティションのリスト
- SETTINGS:
  - `id`: バックアップまたは復元操作の識別子。未設定または空の場合、ランダムに生成されたUUIDが使用されます。
    空でない文字列に明示的に設定する場合は、毎回異なる値にする必要があります。この`id`は、特定のバックアップまたは復元操作に関連する`system.backups`テーブルの行を検索するために使用されます。
  - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec)とcompression_level
  - ディスク上のファイルの`password`
  - `base_backup`: この復元元の以前のバックアップの宛先。例: `Disk('backups', '1.zip')`
  - `use_same_s3_credentials_for_base_backup`: S3へのベースバックアップがクエリから認証情報を継承するかどうか。`S3`でのみ動作します。
  - `use_same_password_for_base_backup`: ベースバックアップアーカイブがクエリからパスワードを継承するかどうか。
  - `structure_only`: 有効にすると、テーブルのデータなしでCREATE文のみをバックアップまたは復元できます
  - `storage_policy`: 復元されるテーブルのストレージポリシー。[データストレージに複数のブロックデバイスを使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は`RESTORE`コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
  - `s3_storage_class`: S3バックアップに使用されるストレージクラス。例: `STANDARD`
  - `azure_attempt_to_create_container`: Azure Blob Storageを使用する場合、指定されたコンテナが存在しない場合に作成を試みるかどうか。デフォルト: true。
  - [コア設定](/operations/settings/settings)もここで使用できます

### 使用例 {#usage-examples}

テーブルをバックアップして復元する:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応する復元:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
テーブル`test.table`にデータが含まれている場合、上記のRESTOREは失敗します。RESTOREをテストするにはテーブルを削除するか、設定`allow_non_empty_tables=true`を使用する必要があります:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

:::

テーブルは新しい名前で復元またはバックアップできます:

```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 増分バックアップ {#incremental-backups}

増分バックアップは`base_backup`を指定することで取得できます。
:::note
増分バックアップはベースバックアップに依存します。増分バックアップから復元できるようにするには、ベースバックアップを利用可能な状態に保つ必要があります。
:::


新しいデータを増分保存します。`base_backup`設定により、`Disk('backups', 'd.zip')`への以前のバックアップ以降のデータが`Disk('backups', 'incremental-a.zip')`に保存されます:

```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップとbase_backupからすべてのデータを新しいテーブル`test.table2`に復元します:

```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定する {#assign-a-password-to-the-backup}

ディスクに書き込まれるバックアップファイルにはパスワードを設定できます:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

復元:

```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### 圧縮設定 {#compression-settings}

圧縮方式またはレベルを指定する場合:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元する {#restore-specific-partitions}

テーブルに関連付けられた特定のパーティションを復元する必要がある場合、それらを指定できます。バックアップからパーティション1と4を復元するには:

```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tarアーカイブとしてのバックアップ {#backups-as-tar-archives}

バックアップはtarアーカイブとして保存することもできます。機能はzipと同じですが、パスワードはサポートされていません。

tarとしてバックアップを書き込む:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応する復元:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方式を変更するには、バックアップ名に適切なファイル拡張子を追加する必要があります。例えば、gzipを使用してtarアーカイブを圧縮するには:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイル拡張子は`tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst`、`.tar.xz`です。

### バックアップのステータスを確認する {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップのステータスを取得できます。これは長時間実行されるASYNCバックアップの進行状況を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとしたときに発生した失敗を示しています:

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


`system.backups` テーブルに加えて、すべてのバックアップおよびリストアの操作は、システムログテーブルである [backup&#95;log](../operations/system-tables/backup_log.md) にも記録されます。

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


## S3エンドポイントを使用するBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3バケットにバックアップを書き込むには、次の3つの情報が必要です:

- S3エンドポイント
  例: `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID
  例: `ABC123`
- シークレットアクセスキー
  例: `Abc+123`

:::note
S3バケットの作成については、[ClickHouseディスクとしてS3オブジェクトストレージを使用する](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)を参照してください。ポリシーを保存した後、このドキュメントに戻ってください。S3バケットを使用するためにClickHouseを設定する必要はありません。
:::

バックアップの保存先は次のように指定します:

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

### ベース(初期)バックアップの作成 {#create-a-base-initial-backup}

増分バックアップには、開始点となる_ベース_バックアップが必要です。この例は後でベースバックアップとして使用されます。S3保存先の最初のパラメータはS3エンドポイントで、その後にこのバックアップに使用するバケット内のディレクトリが続きます。この例では、ディレクトリ名は`my_backup`です。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### データの追加 {#add-more-data}

増分バックアップには、ベースバックアップとバックアップ対象テーブルの現在の内容との差分が格納されます。増分バックアップを取得する前に、さらにデータを追加します:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### 増分バックアップの取得 {#take-an-incremental-backup}

このバックアップコマンドはベースバックアップと似ていますが、`SETTINGS base_backup`とベースバックアップの場所が追加されています。増分バックアップの保存先はベースと同じディレクトリではなく、同じエンドポイントでバケット内の異なるターゲットディレクトリであることに注意してください。ベースバックアップは`my_backup`にあり、増分は`my_incremental`に書き込まれます:

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 増分バックアップからの復元 {#restore-from-the-incremental-backup}

このコマンドは、増分バックアップを新しいテーブル`data3`に復元します。増分バックアップを復元する際、ベースバックアップも含まれることに注意してください。復元時には増分バックアップのみを指定します:

```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### カウントの確認 {#verify-the-count}


元のテーブル `data` には 2 回の挿入が行われており、1 回は 1,000 行、もう 1 回は 100 行で、合計 1,100 行です。復元されたテーブルにも 1,100 行があることを確認します。

```sql
SELECT count()
FROM data3
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```


### コンテンツの検証 {#verify-the-content}

元のテーブル `data` の内容と復元されたテーブル `data3` の内容を比較します：

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

ClickHouseストレージ設定でS3ディスクを構成することで、S3への`BACKUP`/`RESTORE`も可能です。`/etc/clickhouse-server/config.d`にファイルを追加して、次のようにディスクを構成します：

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
ただし、以下の点に留意してください：

- このディスクは`MergeTree`自体には使用せず、`BACKUP`/`RESTORE`のみに使用してください
- テーブルがS3ストレージを使用している場合、その認証情報を使用して`CopyObject`呼び出しによるS3サーバー側コピーでパーツを宛先バケットにコピーしようとします。認証エラーが発生した場合、バッファを使用したコピー方式（パーツをダウンロードしてアップロードする）にフォールバックしますが、これは非常に非効率的です。この場合、宛先バケットの認証情報でソースバケットに対する`read`権限があることを確認することを推奨します。
  :::


## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは`BACKUP/RESTORE`パラメータで使用できます。例については[こちら](./named-collections.md#named-collections-for-backups)を参照してください。


## 代替手段 {#alternatives}

ClickHouseはディスク上にデータを保存しており、ディスクをバックアップする方法は多数存在します。以下は過去に使用されてきた代替手段であり、お使いの環境に適している可能性があります。

### ソースデータを別の場所に複製する {#duplicating-source-data-somewhere-else}

ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)のような永続的なキューを通じて配信されることがよくあります。この場合、ClickHouseへの書き込みと同時に同じデータストリームを読み取り、別の場所のコールドストレージに保存する追加のサブスクライバーセットを構成することが可能です。ほとんどの企業は、オブジェクトストアや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムなど、デフォルトで推奨されるコールドストレージを既に保有しています。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供していますが(例:[ZFS](https://en.wikipedia.org/wiki/ZFS))、ライブクエリの処理には最適な選択肢ではない可能性があります。考えられる解決策は、この種のファイルシステムで追加のレプリカを作成し、`SELECT`クエリに使用される[Distributed](../engines/table-engines/special/distributed.md)テーブルからそれらを除外することです。このようなレプリカ上のスナップショットは、データを変更するクエリの影響を受けません。さらに、これらのレプリカはサーバーあたりより多くのディスクが接続された特別なハードウェア構成を持つ可能性があり、コスト効率が高くなります。

データ量が少ない場合は、リモートテーブルへのシンプルな`INSERT INTO ... SELECT ...`も有効です。

### パーツの操作 {#manipulations-with-parts}

ClickHouseでは、`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用してテーブルパーティションのローカルコピーを作成できます。これは`/var/lib/clickhouse/shadow/`フォルダへのハードリンクを使用して実装されているため、通常は古いデータに対して追加のディスク容量を消費しません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そのまま残しておくことができます。これにより、追加の外部システムを必要としないシンプルなバックアップが得られますが、ハードウェア障害の影響を受けやすい状態は残ります。このため、別の場所にリモートコピーしてからローカルコピーを削除する方が望ましいです。分散ファイルシステムやオブジェクトストアは依然として良い選択肢ですが、十分な容量を持つ通常の接続ファイルサーバーでも機能する可能性があります(この場合、転送はネットワークファイルシステムまたは[rsync](https://en.wikipedia.org/wiki/Rsync)を介して行われます)。
バックアップからのデータ復元は、`ALTER TABLE ... ATTACH PARTITION ...`を使用して行うことができます。

パーティション操作に関連するクエリの詳細については、[ALTERドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するサードパーティツールが利用可能です:[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。


## 同時バックアップ/リストアを無効化する設定 {#settings-to-disallow-concurrent-backuprestore}

同時バックアップ/リストアを無効化するには、以下の設定をそれぞれ使用します。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値は true であるため、デフォルトでは同時バックアップ/リストアが許可されています。
クラスタでこれらの設定が false の場合、クラスタ上で同時に実行できるバックアップ/リストアは1つのみとなります。


## AzureBlobStorageエンドポイントを使用したBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書き込むには、以下の情報が必要です:

- AzureBlobStorageエンドポイントの接続文字列またはURL
- コンテナ
- パス
- アカウント名(URLを指定する場合)
- アカウントキー(URLを指定する場合)

バックアップの保存先は次のように指定します:

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

システムテーブルもバックアップおよびリストアのワークフローに含めることができますが、含めるかどうかは特定のユースケースによって異なります。

### ログテーブルのバックアップ {#backing-up-log-tables}

履歴データを保存するシステムテーブル、例えば \_log 接尾辞を持つテーブル(例:`query_log`、`part_log`)は、他のテーブルと同様にバックアップおよびリストアできます。履歴データの分析に依存するユースケース、例えばquery_logを使用してクエリパフォーマンスを追跡したり問題をデバッグしたりする場合は、これらのテーブルをバックアップ戦略に含めることを推奨します。ただし、これらのテーブルの履歴データが不要な場合は、バックアップストレージ容量を節約するために除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

アクセス管理に関連するシステムテーブル、例えばusers、roles、row_policies、settings_profiles、quotasは、バックアップおよびリストア操作において特別な扱いを受けます。これらのテーブルがバックアップに含まれる場合、その内容は特別な`accessXX.txt`ファイルにエクスポートされ、アクセスエンティティを作成および設定するための同等のSQL文がカプセル化されます。リストア時には、リストアプロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、その他の設定を再作成します。

この機能により、ClickHouseクラスタのアクセス制御設定をクラスタ全体のセットアップの一部としてバックアップおよびリストアできます。

注意:この機能は、SQLコマンドを通じて管理される設定(["SQLベースのアクセス制御とアカウント管理"](/operations/access-rights#enabling-access-control)と呼ばれる)に対してのみ機能します。ClickHouseサーバー設定ファイル(例:`users.xml`)で定義されたアクセス設定は、バックアップに含まれず、この方法ではリストアできません。
