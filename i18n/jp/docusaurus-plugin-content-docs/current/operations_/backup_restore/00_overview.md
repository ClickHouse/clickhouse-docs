---
description: 'ClickHouse のバックアップとリストアの概要'
sidebar_label: '概要'
slug: /operations/backup/overview
title: 'ClickHouse のバックアップとリストア'
doc_type: 'reference'
---

import GenericSettings from '@site/docs/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/docs/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/docs/operations_/backup_restore/_snippets/_s3_settings.md';

> このセクションでは、ClickHouse におけるバックアップとリストアの概要を扱います。各バックアップ手法のより詳しい説明については、サイドバーにある各手法のページを参照してください。


## はじめに {#introduction}

[レプリケーション](/engines/table-engines/mergetree-family/replication)はハードウェア障害からの保護を提供しますが、人為的なエラーからは保護されません。例えば、データの誤削除、誤ったテーブルの削除、誤ったクラスタ上のテーブルの削除、不正なデータ処理やデータ破損を引き起こすソフトウェアのバグなどです。

多くの場合、このようなミスはすべてのレプリカに影響を及ぼします。ClickHouseには特定の種類のミスを防ぐための組み込みの保護機能があります。例えば、[デフォルト](/operations/settings/settings#max_table_size_to_drop)では、50 GB以上のデータを含む`MergeTree`ファミリーエンジンのテーブルを単純に削除することはできません。しかし、これらの保護機能はすべての可能なケースをカバーしておらず、問題は依然として発生する可能性があります。

人為的なエラーの可能性を効果的に軽減するには、データのバックアップと復元の戦略を**事前に**慎重に準備する必要があります。

各企業には利用可能なリソースやビジネス要件が異なるため、すべての状況に適合するClickHouseのバックアップと復元の万能なソリューションは存在しません。1ギガバイトのデータに有効な方法が、数十ペタバイトのデータには有効でない可能性があります。このドキュメントのセクションでは、それぞれに長所と短所を持つさまざまなアプローチを紹介しています。各アプローチの欠点を補うために、1つだけでなく複数のアプローチを使用することをお勧めします。

:::note
何かをバックアップしても復元を試したことがない場合、実際に必要になったときに復元が正常に機能しない可能性が高いことを念頭に置いてください（または少なくとも、ビジネスが許容できる時間よりも長くかかる可能性があります）。したがって、どのバックアップアプローチを選択する場合でも、復元プロセスも自動化し、予備のClickHouseクラスタで定期的に実践するようにしてください。
:::

以下のページでは、ClickHouseで利用可能なさまざまなバックアップおよび復元方法について詳しく説明します。

| ページ                                                                | 説明                                               |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| [ローカルディスクまたはS3ディスクを使用したバックアップ/復元](./01_local_disk.md)    | ローカルディスクまたはS3ディスクへの、またはそこからのバックアップ/復元の詳細 |
| [S3エンドポイントを使用したバックアップ/復元](./02_s3_endpoint.md)             | S3エンドポイントへの、またはそこからのバックアップ/復元の詳細          |
| [AzureBlobStorageを使用したバックアップ/復元](./03_azure_blob_storage.md) | Azure Blob Storageへの、またはそこからのバックアップ/復元の詳細      |
| [代替方法](./04_alternative_methods.md)                  | 代替バックアップ方法について説明                      |

バックアップは以下のことが可能です:

- [完全または増分](#backup-types)
- [同期または非同期](#synchronous-vs-asynchronous)
- [並行または非並行](#concurrent-vs-non-concurrent)
- [圧縮または非圧縮](#compressed-vs-uncompressed)
- [名前付きコレクション](#using-named-collections)の使用
- パスワード保護
- [システムテーブル、ログテーブル、またはアクセス管理テーブル](#system-backups)の取得


## バックアップの種類 {#backup-types}

バックアップには、フルバックアップと増分バックアップがあります。フルバックアップはデータの完全なコピーであり、増分バックアップは最後のフルバックアップからのデータの差分です。

フルバックアップには、シンプルで独立した（他のバックアップに依存しない）信頼性の高い復旧方法であるという利点があります。ただし、完了までに長時間を要し、多くのストレージ容量を消費する可能性があります。一方、増分バックアップは時間と容量の両面でより効率的ですが、データを復元するにはすべてのバックアップが利用可能である必要があります。

ニーズに応じて、以下の使い分けを検討してください：

- **フルバックアップ** - 小規模なデータベースや重要なデータに使用
- **増分バックアップ** - 大規模なデータベースや、頻繁かつコスト効率的にバックアップを実行する必要がある場合に使用
- **両方の併用** - 例えば、週次のフルバックアップと日次の増分バックアップ


## 同期バックアップと非同期バックアップ {#synchronous-vs-asynchronous}

`BACKUP`および`RESTORE`コマンドには`ASYNC`を指定できます。この場合、
バックアップコマンドは即座に制御を返し、バックアップ処理はバックグラウンドで実行されます。
コマンドに`ASYNC`を指定しない場合、バックアップ処理は同期的に実行され、
バックアップが完了するまでコマンドはブロックされます。


## 同時実行バックアップと非同時実行バックアップ {#concurrent-vs-non-concurrent}

デフォルトでは、ClickHouseはバックアップとリストアの同時実行を許可しています。つまり、複数のバックアップまたはリストア操作を同時に開始できます。ただし、この動作を無効化するサーバーレベルの設定が用意されています。これらの設定をfalseに設定すると、クラスタ上で同時に実行できるバックアップまたはリストア操作は1つのみに制限されます。これにより、リソースの競合や操作間の潜在的な衝突を回避できます。

バックアップ/リストアの同時実行を無効化するには、以下の設定をそれぞれ使用します:

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値はtrueであるため、デフォルトではバックアップ/リストアの同時実行が許可されています。クラスタ上でこれらの設定がfalseの場合、クラスタ上で同時に実行できるバックアップ/リストアは1つのみに制限されます。


## 圧縮バックアップと非圧縮バックアップ {#compressed-vs-uncompressed}

ClickHouseのバックアップは、`compression_method`および`compression_level`設定を使用した圧縮をサポートしています。

バックアップを作成する際は、次のように指定できます:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```


## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションを使用すると、キーと値のペア（S3認証情報、エンドポイント、設定など）を保存し、バックアップ/リストア操作全体で再利用できます。
これにより以下のことが可能になります:

- 管理者権限を持たないユーザーから認証情報を隠す
- 複雑な設定を一元管理することでコマンドを簡素化する
- 操作全体で一貫性を維持する
- クエリログでの認証情報の露出を回避する

詳細については[「名前付きコレクション」](/operations/named-collections)を参照してください。


## システムテーブル、ログテーブル、アクセス管理テーブルのバックアップ {#system-backups}

システムテーブルもバックアップとリストアのワークフローに含めることができますが、含めるかどうかは特定のユースケースによって異なります。

履歴データを保存するシステムテーブル、例えば `_log` サフィックスを持つテーブル(例: `query_log`、`part_log`)は、他のテーブルと同様にバックアップおよびリストアできます。
ユースケースが履歴データの分析に依存している場合、例えば `query_log` を使用してクエリパフォーマンスを追跡したり問題をデバッグしたりする場合は、これらのテーブルをバックアップ戦略に含めることを推奨します。
ただし、これらのテーブルの履歴データが不要な場合は、バックアップストレージ容量を節約するために除外することができます。

アクセス管理に関連するシステムテーブル、例えば users、roles、row_policies、settings_profiles、quotas は、バックアップおよびリストア操作時に特別な処理が行われます。
これらのテーブルがバックアップに含まれる場合、その内容は特別な `accessXX.txt` ファイルにエクスポートされ、アクセスエンティティを作成および設定するための同等のSQLステートメントがカプセル化されます。
リストア時には、リストアプロセスがこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、その他の設定を再作成します。
この機能により、ClickHouseクラスタのアクセス制御設定をクラスタ全体のセットアップの一部としてバックアップおよびリストアできます。

この機能は、SQLコマンドを通じて管理される設定(["SQLベースのアクセス制御とアカウント管理"](/operations/access-rights#enabling-access-control)と呼ばれます)に対してのみ動作します。
ClickHouseサーバー設定ファイル(例: `users.xml`)で定義されたアクセス設定は、バックアップに含まれず、この方法ではリストアできません。


## 一般的な構文 {#syntax}

<Syntax />

### コマンド概要 {#command-summary}

上記の各コマンドの詳細は以下の通りです:

| **コマンド**                                                            | **説明**                                                                                                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `BACKUP`                                                               | 指定されたオブジェクトのバックアップを作成します                                                                                                                |
| `RESTORE`                                                              | バックアップからオブジェクトを復元します                                                                                                                       |
| `[ASYNC]`                                                              | 操作を非同期で実行します(監視可能なIDを即座に返します)                                                              |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 特定のテーブルをバックアップ/復元します(名前変更可能)                                                                                                  |
| `[PARTITION[S] partition_expr [,...]]`                                 | テーブルの特定のパーティションのみをバックアップ/復元します                                                                                                 |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | ディクショナリオブジェクトをバックアップ/復元します                                                                                                                |
| `DATABASE database_name [AS database_name_in_backup]`                  | データベース全体をバックアップ/復元します(名前変更可能)                                                                                                |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 一時テーブルをバックアップ/復元します(名前変更可能)                                                                                                 |
| `VIEW view_name [AS view_name_in_backup]`                              | ビューをバックアップ/復元します(名前変更可能)                                                                                                            |
| `[EXCEPT TABLES ...]`                                                  | データベースをバックアップする際に特定のテーブルを除外します                                                                                                   |
| `ALL`                                                                  | すべて(全データベース、テーブルなど)をバックアップ/復元します。ClickHouseバージョン23.4以前では、`ALL`は`RESTORE`コマンドにのみ適用されていました。 |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | `ALL`を使用する際に特定のテーブルまたはデータベースを除外します                                                                                                |
| `[ON CLUSTER 'cluster_name']`                                          | ClickHouseクラスタ全体でバックアップ/復元を実行します                                                                                               |
| `TO\|FROM`                                                             | 方向: `TO`はバックアップ先、`FROM`は復元元を指定します                                                                                    |
| `File('<path>/<filename>')`                                            | ローカルファイルシステムへの保存/復元を行います                                                                                                              |
| `Disk('<disk_name>', '<path>/')`                                       | 設定されたディスクへの保存/復元を行います                                                                                                              |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | Amazon S3またはS3互換ストレージへの保存/復元を行います                                                                                             |
| `[SETTINGS ...]`                                                       | 設定の完全なリストは以下を参照してください                                                                                                              |     |

### 設定 {#settings}

**汎用バックアップ/復元設定**

<GenericSettings />

**S3固有の設定**

<S3Settings />

**Azure固有の設定**

<AzureSettings />


## 管理とトラブルシューティング {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップのステータスを取得できます。これは、長時間実行される`ASYNC`バックアップの進行状況を確認する際に非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとした際に発生したエラーを示しています:

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

[`system.backups`](/operations/system-tables/backups)テーブルに加えて、すべてのバックアップおよびリストア操作はシステムログテーブル[`system.backup_log`](/operations/system-tables/backup_log)でも記録されます:

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
