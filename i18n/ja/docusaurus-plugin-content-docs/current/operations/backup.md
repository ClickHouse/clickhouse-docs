---
slug: /operations/backup
description: 人為的エラーを効果的に軽減するために、データのバックアップと復元の戦略を慎重に準備する必要があります。
---

# バックアップと復元

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3エンドポイントを使用するバックアップ/復元の設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3ディスクを使用したバックアップ/復元](#backuprestore-using-an-s3-disk)
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
  VIEW view_name [AS view_name_in_backup]
  ALL TEMPORARY TABLES [EXCEPT ...] |
  ALL [EXCEPT ...] } [,...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
```

:::note ALL
ClickHouseのバージョン23.4以前では、`ALL`は`RESTORE`コマンドにのみ適用されました。
:::

## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェアの故障から保護する一方で、人為的なエラーを防ぐものではありません：データの偶発的な削除、誤ったテーブルまたは誤ったクラスターのテーブルの削除、データ処理やデータ破損を引き起こすソフトウェアのバグなどが含まれます。多くの場合、これらのようなミスはすべてのレプリカに影響を及ぼします。ClickHouseには、例えばデフォルトで[50Gb以上のデータを含むMergeTreeのようなエンジンを持つテーブルを削除することができない](server-configuration-parameters/settings.md#max-table-size-to-drop)などの一部のタイプのミスを防ぐための組み込みの保護手段があります。しかし、これらの保護手段はすべての可能なケースをカバーしているわけではなく、回避される可能性があります。

人為的なエラーを効果的に軽減するためには、データのバックアップと復元の戦略を**事前に**慎重に準備する必要があります。

各企業は異なるリソースとビジネス要件を持っているため、すべての状況に合うClickHouseのバックアップと復元の普遍的なソリューションはありません。1ギガバイトのデータに対して機能することが、十数ペタバイトには機能しない可能性があります。さまざまなアプローチにはそれぞれ利点と欠点があり、以下で説明します。それぞれの欠点を補うために、単一のアプローチではなく複数のアプローチを利用することが賢明です。

:::note
バックアップを取得したが、復元を試みなかった場合、実際に必要なときに復元が適切に機能しない可能性があることに留意してください（または、少なくともビジネスが許容できる以上に時間がかかることがあります）。したがって、どのバックアップアプローチを選択しても、復元プロセスを自動化し、予備のClickHouseクラスターで定期的に実践することを確認してください。
:::

## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先が`Disk('backups', '1.zip')`のように指定されます。バックアップ先を準備するには、`/etc/clickhouse-server/config.d/backup_disk.xml`にバックアップ先を指定するファイルを追加します。例えば、このファイルは`backups`という名前のディスクを定義し、その後そのディスクを**backups > allowed_disk**リストに追加します：

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

バックアップは完全バックアップまたは増分バックアップのいずれかであり、テーブル（マテリアライズドビュー、プロジェクション、ダイレクトリを含む）やデータベースを含めることができます。バックアップは同期（デフォルト）または非同期に行うことができ、圧縮が可能です。バックアップはパスワード保護が可能です。

BACKUPおよびRESTOREステートメントは、DATABASEおよびTABLE名のリスト、宛先（またはソース）、オプション、設定を受け取ります：
- バックアップの宛先、または復元のソース。この設定は、前述のディスクに基づいています。例えば`Disk('backups', 'filename.zip')`
- ASYNC: 非同期でバックアップまたは復元
- PARTITIONS: 復元するパーティションのリスト
- SETTINGS:
    - `id`: バックアップまたは復元操作のIDで、手動指定がない場合はランダムに生成されたUUIDが使用されます。同じ`id`で既に実行中の操作がある場合は例外がスローされます。
    - [`compression_method`](/sql-reference/statements/create/table.md/#column-compression-codecs)およびcompression_level
    - ディスク上のファイル用の`password`
    - `base_backup`: このソースの以前のバックアップの宛先。例えば、`Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: 基本バックアップがS3の資格情報をクエリから引き継ぐかどうか。`S3`でのみ機能します。
    - `use_same_password_for_base_backup`: 基本バックアップアーカイブがクエリからパスワードを引き継ぐかどうか。
    - `structure_only`: 有効な場合、テーブルのデータなしにCREATE文のみをバックアップまたは復元できます。
    - `storage_policy`: 復元されるテーブルのストレージポリシー。[複数のブロックデバイスをデータストレージに使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は`RESTORE`コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
    - `s3_storage_class`: S3バックアップに使用されるストレージクラス。例えば、`STANDARD`
    - `azure_attempt_to_create_container`: Azure Blob Storageを使用する場合、指定されたコンテナが存在しない場合に作成を試みるかどうか。デフォルトはtrueです。
    - [core settings](/operations/settings/settings)もここで使用できます。

### 使用例 {#usage-examples}

テーブルをバックアップしてから復元する：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記のRESTOREは、`test.table`テーブルにデータが含まれている場合には失敗するため、RESTOREをテストするにはテーブルを削除する必要があります。あるいは設定を`allow_non_empty_tables=true`を使用します：
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

増分バックアップは`base_backup`を指定することで行えます。
:::note
増分バックアップは基本バックアップに依存します。増分バックアップから復元するためには、基本バックアップが保持されている必要があります。
:::

新しいデータを増分的に保存します。設定`base_backup`が前のバックアップから`Disk('backups', 'd.zip')`へのデータを`Disk('backups', 'incremental-a.zip')`へ保存するようになります：
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップおよび基本バックアップからすべてのデータを新しいテーブル`test.table2`に復元します：
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定 {#assign-a-password-to-the-backup}

ディスクに書き込まれたバックアップにはファイルにパスワードを適用できます：
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

圧縮方法またはレベルを指定したい場合：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元 {#restore-specific-partitions}
特定のパーティションを復元する必要がある場合、それらを指定できます。バックアップからパーティション1と4を復元します：
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tarアーカイブとしてのバックアップ {#backups-as-tar-archives}

バックアップはtarアーカイブとしても保存できます。機能はzipと同様ですが、パスワードはサポートされていません。

tarとしてバックアップを記述します：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方法を変更するには、バックアップ名に正しいファイル拡張子を追加する必要があります。つまり、gzipを使用してtarアーカイブを圧縮するためには：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイルの拡張子は、`tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst`, `.tar.xz`です。

### バックアップのステータスを確認 {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップのステータスを取得できます。これは、長い非同期バックアップの進行状況を確認するのに非常に便利です。以下の例では、既存のバックアップファイルを上書きしようとした際の失敗が表示されています：
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

`system.backups`テーブルに加えて、すべてのバックアップおよび復元操作は、システムログテーブル[backup_log](../operations/system-tables/backup_log.md)にも記録されています：
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

## S3エンドポイントを使用するバックアップ/復元の設定 {#configuring-backuprestore-to-use-an-s3-endpoint}

バックアップをS3バケットに書き込むには、次の三つの情報が必要です：
- S3エンドポイント、
  例えば`https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID、
  例えば`ABC123`
- シークレットアクセスキー、
  例えば`Abc+123`

:::note
S3バケットの作成については、[ClickHouseディスクにS3オブジェクトストレージを使用する](https://docs/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)で説明されており、ポリシーを保存した後はこのドキュメントに戻る必要があり、ClickHouseをS3バケットで使用するように設定する必要はありません。
:::

バックアップの宛先は次のように指定します：

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

### 基本（初期）バックアップを作成 {#create-a-base-initial-backup}

増分バックアップには_基本_バックアップが必要で、これが後で基本バックアップとして使用されます。S3宛先の最初のパラメータはS3エンドポイントで、その後バケット内でこのバックアップに使用するディレクトリが続きます。この例では、ディレクトリの名前は`my_backup`です。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### さらにデータを追加 {#add-more-data}

増分バックアップは、基本バックアップとバックアップ対象のテーブルの現在の内容との差分が埋め込まれます。増分バックアップを取得する前に、さらにデータを追加します：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### 増分バックアップを取得 {#take-an-incremental-backup}

このバックアップコマンドは基本バックアップと似ていますが、`SETTINGS base_backup`と基本バックアップの場所を追加します。なお、増分バックアップの宛先は基本バックアップの同じディレクトリではなく、バケット内の異なるターゲットディレクトリです。基本バックアップは`my_backup`にあり、増分は`my_incremental`に書き込まれます：
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 増分バックアップから復元 {#restore-from-the-incremental-backup}

このコマンドは増分バックアップを新しいテーブル`data3`に復元します。増分バックアップを復元する際には、基本バックアップも含まれます。復元時には増分バックアップのみを指定します：
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### 行数を確認 {#verify-the-count}

元のテーブル`data`には1,000行と100行の2つの挿入があり、合計で1,100行です。復元されたテーブルに1,100行があることを確認します：
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 内容を確認 {#verify-the-content}
これは元のテーブル`data`と復元されたテーブル`data3`の内容を比較します：
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'バックアップ/復元後のデータが一致しません')
```
## S3ディスクを使用したバックアップ/復元 {#backuprestore-using-an-s3-disk}

ClickHouseのストレージ設定でS3ディスクを設定することによって、`BACKUP`/`RESTORE`をS3に行うことができます。以下のようにディスクを設定するには、`/etc/clickhouse-server/config.d`にファイルを追加します：

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

その後、通常通り`BACKUP`/`RESTORE`を行います：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、以下の点に注意してください：
- このディスクは`MergeTree`自体には使用しないでください、`BACKUP`/`RESTORE`のみに使用します。
- テーブルがS3ストレージによってサポートされ、ディスクのタイプが異なる場合、`CopyObject`呼び出しを使用してパーツを宛先バケットにコピーすることはせず、代わりにそれらをダウンロードしてアップロードします。これは非常に効率が悪いです。このユースケースでは`BACKUP ... TO S3(<endpoint>)`構文を使用することを推奨します。
:::

## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは、`BACKUP/RESTORE`パラメータに使用できます。例については[こちら](./named-collections.md#named-collections-for-backups)を参照してください。

## 代替手段 {#alternatives}

ClickHouseはディスクにデータを保存し、ディスクのバックアップ方法は多数あります。以下は、過去に使用されてきた代替手段のいくつかで、あなたの環境にも適合するかもしれません。

### ソースデータを他の場所に複製する {#duplicating-source-data-somewhere-else}

ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)などの永続的なキューを通じて配信されることが多いです。この場合、データがClickHouseに書き込まれている間に、同じデータストリームを読み取る追加のサブスクライバーセットを構成し、どこかの冷保存に保存することが可能です。ほとんどの企業はすでにデフォルトの推奨冷保存を持っており、それはオブジェクトストレージや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムである可能性があります。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供します（例えば、[ZFS](https://en.wikipedia.org/wiki/ZFS)）。しかし、これらはライブクエリの提供には最適な選択肢ではないかもしれません。考えられる解決策は、この種のファイルシステムを使用して追加のレプリカを作成し、`SELECT`クエリに使用される[分散](../engines/table-engines/special/distributed.md)テーブルからそれらを除外することです。このようなレプリカのスナップショットは、データを変更するクエリの影響を受けません。ボーナスとして、これらのレプリカは、より多くのディスクがサーバーに接続されている特別なハードウェア構成を持っているかもしれず、コスト効率が良いでしょう。

小さなデータボリュームの場合、リモートテーブルへのシンプルな`INSERT INTO ... SELECT ...`も機能するかもしれません。

### パーツの操作 {#manipulations-with-parts}

ClickHouseは`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用してテーブルパーティションのローカルコピーを作成できます。これは`/var/lib/clickhouse/shadow/`フォルダへのハードリンクを使用して実装されているため、通常は古いデータに対して追加のディスクスペースを消費しません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そこに放置できます：追加の外部システムを必要としないシンプルなバックアップを得ることができ、ハードウェアの問題には依然として影響を受けます。このため、それらを別のロケーションにリモートコピーしてから、ローカルコピーを削除する方が良いです。分散ファイルシステムやオブジェクトストレージは今でも良い選択肢ですが、十分な容量を備えた通常の接続されたファイルサーバも機能するかもしれません（この場合、ネットワークファイルシステムかおそらく[rsync](https://en.wikipedia.org/wiki/Rsync)を介して転送が行われます）。
バックアップからデータを復元するには`ALTER TABLE ... ATTACH PARTITION ...`を使用します。

パーティション操作に関連するクエリの詳細については、[ALTERドキュメント](../sql-reference/statements/alter/partition.md#alter_manipulations-with-partitions)を参照してください。

このアプローチを自動化するために、サードパーティツール[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)が利用可能です。

## 同時バックアップ/復元を禁止する設定 {#settings-to-disallow-concurrent-backuprestore}

同時バックアップ/復元を禁止するには、以下の設定をそれぞれ使用できます。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値はtrueであるため、デフォルトでは同時バックアップ/復元が許可されています。
これらの設定がクラスターでfalseの場合、同時にクラスター上で実行できるバックアップ/復元は1つだけになります。

## AzureBlobStorageエンドポイントを使用するバックアップ/復元の設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書き込むには、次の情報が必要です：
- AzureBlobStorageエンドポイントの接続文字列/URL、
- コンテナ、
- パス、
- アカウント名（URLが指定されている場合）
- アカウントキー（URLが指定されている場合）

バックアップの宛先は次のように指定します：

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

システムテーブルもバックアップおよび復元のワークフローに含めることができますが、これらの含め方は特定のユースケースによって決まります。

### ログテーブルのバックアップ {#backing-up-log-tables}

履歴データを保存するシステムテーブル（例：`query_log`, `part_log`など）は、他のテーブルと同様にバックアップおよび復元できます。ユースケースが履歴データの分析に依存している場合、例えば、`query_log`を使用してクエリのパフォーマンスを追跡したり、問題をデバッグしたりするために、これらのテーブルをバックアップ戦略に含めることを推奨します。ただし、これらのテーブルの履歴データが必要ない場合、バックアップストレージスペースを節約するために除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

ユーザー、ロール、行ポリシー、設定プロファイル、クォータなどのアクセス管理に関連するシステムテーブルは、バックアップおよび復元操作中に特別な扱いを受けます。これらのテーブルがバックアップに含まれる場合、その内容は特別な`accessXX.txt`ファイルにエクスポートされ、アクセスエンティティを作成および構成するための同等のSQLステートメントがカプセル化されます。復元時には、復元プロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、その他の構成を再作成します。

この機能により、ClickHouseクラスターのアクセス制御設定をバックアップして復元し、クラスター全体のセットアップの一部として管理できるようになります。

注：この機能は、SQLコマンドを通じて管理されている構成にのみ機能します（["SQL駆動のアクセス制御およびアカウント管理"](/operations/access-rights#enabling-access-control)と呼ばれます）。ClickHouseサーバーの設定ファイル（例：`users.xml`）に定義されたアクセス設定はバックアップに含まれず、この方法で復元できません。

