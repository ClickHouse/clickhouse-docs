---
'description': 'ClickHouse データベースとテーブルのバックアップおよび復元ガイド'
'sidebar_label': 'バックアップと復元'
'sidebar_position': 10
'slug': '/operations/backup'
'title': 'バックアップと復元'
---




# バックアップと復元

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3エンドポイントを使用するバックアップ/復元の設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3ディスクを使用したバックアップ/復元](#backuprestore-using-an-s3-disk)
- [代替手段](#alternatives)

## コマンドの概要 {#command-summary}

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
ClickHouseのバージョン23.4以前では、`ALL`は`RESTORE`コマンドにのみ適用されました。
:::

## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェア障害から保護しますが、人為的なエラー（データの誤削除、間違ったテーブルの削除、間違ったクラスターのテーブル削除、データ処理やデータ破損を引き起こすソフトウェアのバグ）からは保護しません。これらのような間違いは、多くの場合、すべてのレプリカに影響を及ぼします。ClickHouseには、[MergeTree](../engines/table-engines/mergetree-family/mergetree.md)のようなエンジンを使用しているテーブルを単純に削除できないようにするなど、一部のタイプのエラーを防ぐための組み込みの安全策があります。しかし、これらの安全策はすべての可能なケースをカバーしているわけではなく、回避することも可能です。

人為的なエラーを効果的に軽減するためには、**事前に**データのバックアップと復元の戦略を慎重に準備する必要があります。

各企業には異なるリソースやビジネス要件があり、すべての状況に適合するClickHouseのバックアップと復元の普遍的な解決策は存在しません。1ギガバイトのデータに対して有効な方法が、数十ペタバイトに対してはうまく機能しない可能性があります。さまざまな利点と欠点を持つ複数のアプローチがありますが、これらについては下で説明します。さまざまな欠点を補うために、「単一のアプローチ」を使用するのではなく、複数のアプローチを使用することをお勧めします。

:::note
バックアップを行い、その後復元を試みていない場合、実際に必要なときに復元が正常に動作しない可能性が高いです（または少なくとも業務が許容できるよりも時間がかかります）。したがって、どのバックアップアプローチを選択しても、復元プロセスも自動化し、定期的に予備のClickHouseクラスターで実践することを確認してください。
:::

## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先が`Disk('backups', '1.zip')`のように指定されています。バックアップ先を準備するには、`/etc/clickhouse-server/config.d/backup_disk.xml`にファイルを追加してバックアップ先を指定します。たとえば、このファイルは`backups`という名前のディスクを定義し、その後そのディスクを**backups > allowed_disk**リストに追加します。

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

バックアップはフルバックアップまたは増分バックアップとすることができ、テーブル（マテリアライズドビュー、プロジェクション、辞書を含む）およびデータベースを含むことができます。バックアップは同期（デフォルト）または非同期であり、圧縮することもできます。バックアップはパスワードで保護することができます。

BACKUPおよびRESTOREステートメントは、DATABASEおよびTABLEの名前のリスト、宛先（またはソース）、オプション、設定を受け取ります：
- バックアップの宛先、または復元のためのソース。これは前に定義されたディスクに基づいています。たとえば`Disk('backups', 'filename.zip')`
- ASYNC: 非同期でバックアップまたは復元する
- PARTITIONS: 復元するパーティションのリスト
- SETTINGS:
    - `id`: バックアップまたは復元操作のID、手動で指定されない場合はランダム生成されたUUIDが使用されます。同じ`id`で実行中の操作がある場合は例外がスローされます。
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec)とcompression_level
    - ディスク上のファイル用の`password`
    - `base_backup`: このソースの以前のバックアップの宛先。たとえば、`Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: S3への基本バックアップがクエリから資格情報を継承するかどうか。`S3`でのみ機能します。
    - `use_same_password_for_base_backup`: 基本バックアップアーカイブがクエリからパスワードを継承するかどうか。
    - `structure_only`: 有効にすると、テーブルのデータなしでCREATEステートメントのみをバックアップまたは復元できます。
    - `storage_policy`: 復元されるテーブルのストレージポリシー。[複数のブロックデバイスをデータストレージに使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は`RESTORE`コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
    - `s3_storage_class`: S3バックアップに使用されるストレージクラス。たとえば、`STANDARD`
    - `azure_attempt_to_create_container`: Azure Blob Storageを使用する場合、指定されたコンテナが存在しない場合に作成を試みるかどうか。デフォルト: true。
    - [コア設定](/operations/settings/settings)も使用できます。

### 使用例 {#usage-examples}

テーブルをバックアップしてから復元します:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応する復元:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記のRESTOREは`test.table`がデータを含む場合に失敗します。RESTOREをテストするにはテーブルを削除する必要があるか、`allow_non_empty_tables=true`を使用する必要があります:
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

増分バックアップは、`base_backup`を指定することで取得できます。
:::note
増分バックアップは基本バックアップに依存します。増分バックアップから復元するためには基本バックアップを保持しておく必要があります。
:::

新しいデータを増分で保存します。`base_backup`の設定により、前のバックアップから`Disk('backups', 'd.zip')`にあるデータが`Disk('backups', 'incremental-a.zip')`に保存されます:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップと基本バックアップからすべてのデータを新しいテーブル`test.table2`に復元します:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを割り当てる {#assign-a-password-to-the-backup}

ディスクに書き込まれたバックアップには、ファイルにパスワードを設定できます:
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

圧縮方法やレベルを指定したい場合:
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元する {#restore-specific-partitions}
特定のテーブルに関連するパーティションを復元する必要がある場合、これを指定できます。バックアップからパーティション1と4を復元するため:
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

圧縮方法を変更するには、バックアップ名に正しいファイルサフィックスを追加する必要があります。つまり、gzipを使用してtarアーカイブを圧縮するには:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイルのサフィックスは`tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst`、および`.tar.xz`です。

### バックアップのステータスを確認する {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップのステータスを取得できます。これは、長時間の非同期バックアップの進捗を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとしたときに発生した失敗を示しています:
```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```
```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1行がセットにあります。経過時間: 0.001秒。
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

1行がセットにあります。経過時間: 0.002秒。
```

`system.backups`テーブルに加えて、すべてのバックアップおよび復元操作は、システムログテーブル[backup_log](../operations/system-tables/backup_log.md)にも記録されます:
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

2行がセットにあります。経過時間: 0.075秒。
```

## S3エンドポイントを使用するBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3バケットにバックアップを書くには、次の3つの情報が必要です：
- S3エンドポイント、
  例：`https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID、
  例：`ABC123`
- シークレットアクセスキー、
  例：`Abc+123`

:::note
S3バケットの作成については、[ClickHouseディスクとしてS3オブジェクトストレージを使用する](./integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)を参照してください。ポリシーを保存した後はこの文書に戻りますが、ClickHouseをS3バケットで使用するように設定する必要はありません。
:::

バックアップの宛先は以下のように指定されます:

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

増分バックアップを取得するには_基本_バックアップから始める必要があります。この例は後で基本バックアップとして使用します。S3の宛先の最初のパラメータはS3エンドポイントで、その後のパラメータはこのバックアップに使用するバケット内のディレクトリです。この例のディレクトリ名は`my_backup`です。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### データを追加 {#add-more-data}

増分バックアップは、基本バックアップと現在のテーブルのコンテンツとの違いによって構成されます。増分バックアップを取得する前により多くのデータを追加します:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### 増分バックアップを取得 {#take-an-incremental-backup}

このバックアップコマンドは基本バックアップと似ていますが、`SETTINGS base_backup`と基本バックアップの場所が追加されます。増分バックアップの宛先は基本バックアップと同じディレクトリではなく、バケット内の異なるターゲットディレクトリです。基本バックアップは`my_backup`にあり、増分バックアップは`my_incremental`に書き込まれます：
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 増分バックアップから復元 {#restore-from-the-incremental-backup}

このコマンドは増分バックアップを新しいテーブル`data3`に復元します。増分バックアップが復元されると、基本バックアップも含まれることに注意してください。復元する際には増分バックアップのみを指定します:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### 行数を確認 {#verify-the-count}

元のテーブル`data`には、1,000行のインサートと100行のインサートの2つのインサートがあり、合計で1,100行です。復元されたテーブルに1,100行があることを確認します:
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### コンテンツを確認 {#verify-the-content}
元のテーブル`data`と復元されたテーブル`data3`の内容を比較します:
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'データはバックアップ/復元後に一致しません')
```

## S3ディスクを使用したBACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouseストレージ構成でS3ディスクを設定することにより、`BACKUP`/`RESTORE`をS3に行うことも可能です。このようにディスクを設定します。`/etc/clickhouse-server/config.d`にファイルを追加します。

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

その後、通常通り`BACKUP`/`RESTORE`を実行します:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、次のことを考慮してください：
- このディスクは、`MergeTree`自体には使用しないでください。`BACKUP`/`RESTORE`のみに使用します。
- テーブルがS3ストレージにバックアップされ、ディスクのタイプが異なる場合、`CopyObject`呼び出しを使用してパーツを宛先バケットにコピーせず、代わりにダウンロードしてアップロードすることになります。これは非常に非効率的です。このユースケースでは、`BACKUP ... TO S3(<endpoint>)`構文を使用することをお勧めします。
:::

## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは、`BACKUP/RESTORE`パラメータに使用できます。[こちら](./named-collections.md#named-collections-for-backups)で例を参照してください。

## 代替手段 {#alternatives}

ClickHouseはディスク上にデータを保存しており、ディスクのバックアップには多くの方法があります。これまでに使用された代替手段の一部は、環境に適合する可能性があります。

### ソースデータを他の場所に複製 {#duplicating-source-data-somewhere-else}

ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)などの持続的キューを介して提供されることが多いです。この場合、データがClickHouseに書き込まれている間に、同じデータストリームを読み取る追加のサブスクライバーを設定し、別の冷ストレージに保存することが可能です。ほとんどの企業には、オブジェクトストレージや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムなど、デフォルトで推奨される冷ストレージがあります。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供しています（たとえば、[ZFS](https://en.wikipedia.org/wiki/ZFS)）。ただし、これらはライブクエリに最適ではないかもしれません。可能な解決策は、この種のファイルシステムを持つ追加のレプリカを作成し、`SELECT`クエリで使用される[Distributed](../engines/table-engines/special/distributed.md)テーブルから除外することです。そのようなレプリカのスナップショットは、データを変更するクエリのリーチから外れます。ボーナスとして、これらのレプリカは、サーバーごとにより多くのディスクが接続された特別なハードウェア構成を持つ可能性があり、コスト効率が良いです。

データのボリュームが小さい場合は、単純な`INSERT INTO ... SELECT ...`をリモートテーブルに使用することも可能です。

### パーツの操作 {#manipulations-with-parts}

ClickHouseは、`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用して、テーブルパーティションのローカルコピーを作成することを許可します。これは、`/var/lib/clickhouse/shadow/`フォルダーへのハードリンクを使用して実装されるため、通常は古いデータの余分なディスクスペースを消費しません。ファイルの作成されたコピーはClickHouseサーバーによって処理されないため、そのままにしておくことができます: これにより、追加の外部システムを必要としない簡単なバックアップが得られますが、それでもハードウェアの問題には弱いです。そのため、リモートで別の場所にコピーしてから、ローカルコピーを削除するのが良いでしょう。分散ファイルシステムやオブジェクトストレージはまだ良い選択肢ですが、十分な容量を持つ通常の接続ファイルサーバーでも機能することがあります（この場合、転送はネットワークファイルシステムまたは[rsync](https://en.wikipedia.org/wiki/Rsync)を介して行われます）。
バックアップからデータを復元するには`ALTER TABLE ... ATTACH PARTITION ...`を使用します。

パーティション操作に関連するクエリについての詳細は、[ALTERドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するためのサードパーティツールがあります：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 同時バックアップ/復元を禁止する設定 {#settings-to-disallow-concurrent-backuprestore}

同時バックアップ/復元を禁止するには、それぞれ次の設定を使用できます。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

どちらもデフォルトではtrueであるため、デフォルトでは同時バックアップ/復元が許可されています。
これらの設定がクラスターでfalseのとき、同時に実行できるバックアップ/復元は1つのみです。

## AzureBlobStorageエンドポイントを使用するBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書くには、次の情報が必要です：
- AzureBlobStorageエンドポイント接続文字列/ URL、
- コンテナ、
- パス、
- アカウント名（URLが指定される場合）
- アカウントキー（URLが指定される場合）

バックアップの宛先は以下のように指定されます:

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

システムテーブルもバックアップおよび復元ワークフローに含めることができますが、その含有は特定のユースケースによって異なります。

### ログテーブルのバックアップ {#backing-up-log-tables}

履歴データを保存するシステムテーブル（`query_log`や`part_log`のように_ログの接尾辞を持つテーブル）は、他のテーブルと同様にバックアップおよび復元できます。ユースケースが履歴データの分析に依存している場合（たとえば、クエリ性能を追跡するために`query_log`を使用するなど）、これらのテーブルをバックアップ戦略に含めることをお勧めします。ただし、これらのテーブルからの履歴データが必要ない場合、バックアップストレージスペースを節約するために除外することができます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

ユーザー、ロール、行ポリシー、設定プロファイル、クォータなどのアクセス管理に関連するシステムテーブルは、バックアップおよび復元操作中に特別扱いされます。これらのテーブルがバックアップに含まれると、その内容は特別な`accessXX.txt`ファイルにエクスポートされ、アクセスエンティティを作成および設定するための等価のSQLステートメントがカプセル化されます。復元時には、復元プロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、および他の設定を再作成します。

この機能により、ClickHouseクラスターのアクセス制御構成をバックアップおよび復元することができ、クラスター全体のセットアップの一部として利用できます。

注意：この機能は、SQLコマンドを介して管理される構成に対してのみ機能します（「[SQL駆動のアクセス制御とアカウント管理](../operations/access-rights#enabling-access-control)」を参照）。ClickHouseサーバー構成ファイル（例:`users.xml`）で定義されたアクセス構成はバックアップに含まれず、この方法で復元することはできません。
