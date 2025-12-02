---
description: 'ClickHouse データベースおよびテーブルのバックアップおよび復元に関するガイド'
sidebar_label: 'バックアップと復元'
sidebar_position: 10
slug: /operations/backup
title: 'バックアップと復元'
doc_type: 'guide'
---



# バックアップと復元 {#backup-and-restore}

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3 エンドポイントを使用したバックアップ／復元の設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3 ディスクを使用したバックアップ／復元](#backuprestore-using-an-s3-disk)
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
バージョン 23.4 より前の ClickHouse では、`ALL` は `RESTORE` コマンドにのみ適用されていました。
:::


## 背景 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md) はハードウェア障害からの保護を提供しますが、人為的なミスからは保護しません。たとえば、データの誤削除、誤ったテーブルや誤ったクラスタ上のテーブルの削除、不正なデータ処理やデータ破損を引き起こすソフトウェアバグなどです。多くの場合、このようなミスはすべてのレプリカに影響します。ClickHouse には、特定の種類のミスを防ぐための組み込みの安全機構があります。たとえばデフォルトでは、[50 GB を超えるデータを含む MergeTree 系エンジンのテーブルを、そのまま DROP することはできません](/operations/settings/settings#max_table_size_to_drop)。しかし、これらの安全機構はあらゆるケースを網羅しているわけではなく、回避されてしまう可能性もあります。

起こり得る人為的なミスの影響を効果的に軽減するためには、**事前に** データのバックアップおよび復元戦略を慎重に準備しておく必要があります。

各社で利用可能なリソースやビジネス要件は異なるため、あらゆる状況に適合するような ClickHouse のバックアップおよび復元の汎用的な解決策は存在しません。1 GB のデータで有効な方法が、数十 PB のデータでも有効とは限りません。長所と短所を併せ持つさまざまなアプローチが存在し、それらについては後述します。個々の欠点を補うために、1 つのアプローチだけではなく、複数のアプローチを併用することが望ましいです。

:::note
バックアップを取得しただけで一度も復元を試していない場合、いざというときに復元が正しく動作しない（少なくとも、ビジネスが許容できるよりも長い時間がかかる）可能性が高いことを忘れないでください。どのようなバックアップ手法を選択するにせよ、復元プロセスも必ず自動化し、予備の ClickHouse クラスタで定期的に復元演習を行ってください。
:::



## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先は `Disk('backups', '1.zip')` のように指定されます。バックアップ先を準備するには、バックアップ先を指定したファイルを `/etc/clickhouse-server/config.d/backup_disk.xml` に追加します。例えば、このファイルでは `backups` という名前のディスクを定義し、そのディスクを **backups &gt; allowed&#95;disk** リストに追加します。

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

バックアップはフルバックアップまたは増分バックアップとし、テーブル（マテリアライズドビュー、プロジェクション、ディクショナリを含む）やデータベースを対象にできます。バックアップは同期（デフォルト）または非同期で実行できます。圧縮することも可能で、パスワード保護を設定できます。

`BACKUP` および `RESTORE` ステートメントは、`DATABASE` および `TABLE` 名のリスト、宛先（またはソース）、オプション、および設定を受け取ります。

* バックアップの宛先、またはリストアのソースです。これは前に定義したディスクに基づきます。例: `Disk('backups', 'filename.zip')`
* ASYNC: バックアップまたはリストアを非同期で実行
* PARTITIONS: リストアするパーティションのリスト
* SETTINGS:
  * `id`: バックアップまたはリストア処理の識別子。設定されていないか空の場合は、ランダムに生成された UUID が使用されます。
    明示的に空でない文字列に設定する場合は、毎回異なる値にする必要があります。この `id` は、特定のバックアップまたはリストア処理に関連する `system.backups` テーブル内の行を検索するために使用されます。
  * [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) と `compression_level`
  * ディスク上のファイルに対する `password`
  * `base_backup`: このソースの前回のバックアップの宛先。例: `Disk('backups', '1.zip')`
  * `use_same_s3_credentials_for_base_backup`: S3 へのベースバックアップがクエリで使用されている認証情報を継承するかどうか。`S3` でのみ動作します。
  * `use_same_password_for_base_backup`: ベースバックアップアーカイブがクエリからパスワードを継承するかどうか。
  * `structure_only`: 有効にすると、テーブルデータなしで `CREATE` ステートメントのみをバックアップまたはリストアできます。
  * `storage_policy`: リストアされるテーブルに対するストレージポリシー。[複数のブロックデバイスを使用したデータストレージ](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) を参照してください。この設定は `RESTORE` コマンドにのみ適用されます。指定されたストレージポリシーは、`MergeTree` ファミリーのエンジンを持つテーブルにのみ適用されます。
  * `s3_storage_class`: S3 バックアップに使用されるストレージクラス。例: `STANDARD`
  * `azure_attempt_to_create_container`: Azure Blob Storage を使用する場合、指定されたコンテナーが存在しないときに作成を試みるかどうか。デフォルト: true。
  * [コア設定](/operations/settings/settings) もここで使用できます

### 使用例 {#usage-examples}

テーブルをバックアップしてからリストアする例:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応するリストア：

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記の RESTORE は、テーブル `test.table` にデータが含まれている場合は失敗します。RESTORE をテストする場合は、テーブルを削除するか、設定 `allow_non_empty_tables=true` を有効にする必要があります。

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

:::

テーブルは、新しい名前を指定してリストアしたりバックアップを作成したりできます。

```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 増分バックアップ {#incremental-backups}

`base_backup` を指定すると、増分バックアップを作成できます。
:::note
増分バックアップはベースバックアップに依存します。増分バックアップからリストアできるようにするには、ベースバックアップを利用可能な状態で保持しておく必要があります。
:::


新しいデータを増分的に保存します。設定 `base_backup` により、以前のバックアップ `Disk('backups', 'd.zip')` 以降に追加されたデータが `Disk('backups', 'incremental-a.zip')` に保存されます。

```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

インクリメンタルバックアップと `base_backup` からすべてのデータを、新しいテーブル `test.table2` に復元します：

```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定する {#assign-a-password-to-the-backup}

ディスクに書き込まれるバックアップファイルには、パスワードを設定できます。

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

圧縮方式や圧縮レベルを指定したい場合は、次のように設定します。

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元する {#restore-specific-partitions}

テーブルに関連付けられた特定のパーティションのみを復元する必要がある場合は、それらを指定できます。バックアップからパーティション 1 と 4 を復元するには：

```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tar アーカイブとしてのバックアップ {#backups-as-tar-archives}

バックアップは tar アーカイブとして保存することもできます。パスワードがサポートされていない点を除き、機能は zip の場合と同じです。

バックアップを tar 形式で作成します:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応するリストア：

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方式を変更するには、バックアップ名に適切なファイル拡張子を付ける必要があります。例えば、tar アーカイブを gzip で圧縮するには次のようにします。

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイルの拡張子は、`tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst`、`.tar.xz` です。

### バックアップのステータスを確認する {#check-the-status-of-backups}

バックアップコマンドは `id` と `status` を返し、その `id` を使ってバックアップのステータスを取得できます。これは、時間のかかる ASYNC バックアップの進行状況を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとしたときに発生した失敗を示しています。

```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```

```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1行が返されました。経過時間: 0.001秒
```

```sql
SELECT
    *
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```

```response
行 1:
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

1行のセット。経過時間: 0.002秒
```


`system.backups` テーブルに加えて、すべてのバックアップおよびリストア操作は、システムログテーブル [backup&#95;log](../operations/system-tables/backup_log.md) にも記録されます。

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


## S3 エンドポイントを使用するように BACKUP/RESTORE を構成する {#configuring-backuprestore-to-use-an-s3-endpoint}

バックアップを S3 バケットに書き込むには、次の 3 つの情報が必要です。

* S3 エンドポイント\
  例: `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
* アクセスキー ID\
  例: `ABC123`
* シークレットアクセスキー\
  例: `Abc+123`

:::note
S3 バケットの作成手順については、[Use S3 Object Storage as a ClickHouse disk](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use) で説明しています。ポリシーを保存したらこのドキュメントに戻ってください。S3 バケットを使用するように ClickHouse を設定する必要はありません。
:::

バックアップの保存先は次のように指定します。

```sql
S3('<S3エンドポイント>/<ディレクトリ>', '<アクセスキーID>', '<シークレットアクセスキー>')
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

増分バックアップを実行するには、開始点となる *ベース* バックアップが必要です。この例では、後でベースバックアップとして使用します。S3 の宛先の最初のパラメーターは S3 エンドポイントであり、その後に、このバックアップで使用するバケット内のディレクトリを指定します。この例では、ディレクトリ名は `my_backup` です。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### データをさらに追加する {#add-more-data}

増分バックアップには、ベースバックアップとバックアップ対象テーブルの現在の内容との差分が格納されます。増分バックアップを作成する前に、テーブルにデータを追加します。

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### 増分バックアップを作成する {#take-an-incremental-backup}

このバックアップコマンドはベースバックアップと似ていますが、`SETTINGS base_backup` とベースバックアップの場所を指定する点が異なります。増分バックアップの保存先はベースバックアップと同じディレクトリではなく、同じエンドポイント上のバケット内にある別のターゲットディレクトリであることに注意してください。ベースバックアップは `my_backup` にあり、増分バックアップは `my_incremental` に書き込まれます。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 増分バックアップからのリストア {#restore-from-the-incremental-backup}

このコマンドは、増分バックアップを新しいテーブル `data3` にリストアします。増分バックアップをリストアする場合、ベースバックアップも合わせて含まれることに注意してください。リストア時には、増分バックアップのみを指定してください。

```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### 件数を確認する {#verify-the-count}


元のテーブル `data` には、1,000 行の挿入と 100 行の挿入の 2 回の INSERT が行われており、合計で 1,100 行になっています。復元されたテーブルに 1,100 行あることを確認します。

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

ここでは、元のテーブル `data` の内容を、復元したテーブル `data3` と比較します。

```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'BACKUP/RESTORE後にデータが一致しません')
```

## S3 ディスクを使用した BACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouse のストレージ設定で S3 ディスクを設定することで、`BACKUP`/`RESTORE` を S3 を対象として実行することもできます。`/etc/clickhouse-server/config.d` にファイルを追加して、次のようにディスクを設定します。

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

あとは通常どおり `BACKUP`/`RESTORE` を行います。

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、次の点に注意してください。

* このディスクは `MergeTree` 自体には使用せず、`BACKUP`/`RESTORE` のみに使用してください
* テーブルが S3 ストレージをバックエンドとしている場合、パーツを宛先バケットにコピーする際には、宛先側のクレデンシャルを用いて、`CopyObject` 呼び出しによる S3 のサーバーサイドコピーを試行します。認証エラーが発生した場合は、パーツを一度ダウンロードしてからアップロードするバッファ経由のコピー方式にフォールバックしますが、これは非常に非効率です。この場合、宛先バケットのクレデンシャルに、ソースバケットに対する `read` 権限が付与されていることを確認してください。
  :::


## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは `BACKUP/RESTORE` のパラメータとして使用できます。例については [こちら](./named-collections.md#named-collections-for-backups) を参照してください。



## 代替案 {#alternatives}

ClickHouse はデータをディスク上に保存しますが、ディスクをバックアップする方法は多数あります。以下はこれまでに利用されてきた代替手段の一部であり、お使いの環境にも適合する可能性があります。

### ソースデータを別の場所に複製する {#duplicating-source-data-somewhere-else}

ClickHouse に取り込まれるデータは、多くの場合、[Apache Kafka](https://kafka.apache.org) のような永続的なキューを通じて配信されます。この場合、ClickHouse に書き込まれているのと同じデータストリームを読み取り、どこかのコールドストレージに保存するための追加のサブスクライバーセットを構成することができます。ほとんどの企業には、オブジェクトストアや [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) のような分散ファイルシステムといった、推奨される標準的なコールドストレージが既に存在します。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供します（たとえば [ZFS](https://en.wikipedia.org/wiki/ZFS)）。しかし、それらはライブクエリを処理する用途には最適とは限りません。考えられる解決策としては、この種のファイルシステムを用いた追加レプリカを作成し、`SELECT` クエリに使用される [Distributed](../engines/table-engines/special/distributed.md) テーブルからそれらを除外する方法があります。このようなレプリカ上のスナップショットは、データを変更するクエリの影響を受けません。さらに、これらのレプリカは 1 サーバーあたりより多くのディスクを接続した特別なハードウェア構成にでき、コスト効率を高められます。

データ量が小さい場合には、リモートテーブルへの単純な `INSERT INTO ... SELECT ...` でも有効な場合があります。

### パーツの操作 {#manipulations-with-parts}

ClickHouse では、`ALTER TABLE ... FREEZE PARTITION ...` クエリを使用してテーブルパーティションのローカルコピーを作成できます。これは `/var/lib/clickhouse/shadow/` フォルダへのハードリンクを使って実装されているため、通常は古いデータに対して追加のディスク容量を消費しません。作成されたファイルのコピーは ClickHouse サーバーによっては扱われないため、そのまま残しておくこともできます。これにより、追加の外部システムを必要としない単純なバックアップが得られますが、それでもハードウェア障害の影響は受けます。このため、別の場所にリモートコピーを行い、その後ローカルコピーを削除する方が望ましいです。この用途には分散ファイルシステムやオブジェクトストアが引き続き有効な選択肢ですが、十分な容量を持つ通常の接続ファイルサーバーも利用可能です（この場合、転送はネットワークファイルシステム経由、または [rsync](https://en.wikipedia.org/wiki/Rsync) によって行われる可能性があります）。  
バックアップからのデータ復元は `ALTER TABLE ... ATTACH PARTITION ...` を用いて実行できます。

パーティション操作に関連するクエリの詳細については、[ALTER のドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するためのサードパーティーツールが利用可能です: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。



## バックアップとリストアの並行実行を禁止するための設定 {#settings-to-disallow-concurrent-backuprestore}

バックアップとリストアの並行実行を禁止するには、それぞれ次の設定を使用します。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値は true なので、デフォルトではバックアップ／リストアの並行実行が許可されています。
これらの設定がクラスターで false に設定されている場合、そのクラスター上で同時に実行できるバックアップ／リストアは 1 つだけになります。


## AzureBlobStorage エンドポイントを使用するように BACKUP/RESTORE を構成する {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

バックアップを書き込む AzureBlobStorage コンテナには、以下の情報が必要です。

* AzureBlobStorage エンドポイントの接続文字列 / URL
* コンテナ
* パス
* アカウント名（URL が指定されている場合）
* アカウント キー（URL が指定されている場合）

バックアップの保存先は次のように指定します。

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

システムテーブルもバックアップおよびリストアのワークフローに含めることができますが、含めるかどうかはユースケースによって異なります。

### ログテーブルのバックアップ {#backing-up-log-tables}

`query_log` や `part_log` のように、`_log` サフィックスを持ち履歴データを保存するシステムテーブルは、他のテーブルと同様にバックアップおよびリストアできます。ユースケースとして履歴データの分析に依存している場合、たとえば `query_log` を使ってクエリパフォーマンスを追跡したり、問題のデバッグに利用したりしている場合には、これらのテーブルをバックアップ戦略に含めることを推奨します。一方で、これらのテーブルの履歴データが不要な場合は、バックアップストレージ容量を節約するために除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

`users`、`roles`、`row_policies`、`settings_profiles`、`quotas` など、アクセス管理に関連するシステムテーブルは、バックアップおよびリストア処理の際に特別な扱いを受けます。これらのテーブルがバックアップに含まれている場合、その内容は特別な `accessXX.txt` ファイルにエクスポートされます。このファイルには、アクセスエンティティを作成および構成するための同等の SQL ステートメントが格納されます。リストア時には、リストア処理がこれらのファイルを解釈し、ユーザー、ロール、およびその他の設定を再作成するための SQL コマンドが再適用されます。

この機能により、ClickHouse クラスターのアクセス制御構成を、クラスター全体のセットアップの一部としてバックアップおよびリストアできます。

Note: この機能は、SQL コマンドによって管理される構成（["SQL-driven Access Control and Account Management"](/operations/access-rights#enabling-access-control) と呼ばれます）に対してのみ動作します。ClickHouse サーバーの設定ファイル（例: `users.xml`）で定義されたアクセス構成はバックアップに含まれず、この方法でリストアすることはできません。
