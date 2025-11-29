---
description: 'ClickHouse のバックアップとリストアの概要'
sidebar_label: '概要'
slug: /operations/backup/overview
title: 'ClickHouse のバックアップとリストア'
doc_type: 'reference'
---

import GenericSettings from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';

> このセクションでは、ClickHouse におけるバックアップとリストアの概要を扱います。各バックアップ方式のより詳細な説明については、サイドバーにある各方式のページを参照してください。


## はじめに {#introduction}

[レプリケーション](/engines/table-engines/mergetree-family/replication) はハードウェア障害からの保護を提供しますが、人的ミスからは 
保護しません。たとえば、データを誤って削除してしまうこと、誤ったテーブルや誤ったクラスター上のテーブルを削除してしまうこと、誤ったデータ処理やデータ破損を引き起こすソフトウェアバグなどです。

多くの場合、このようなミスはすべてのレプリカに影響します。ClickHouse には一部の種類のミスを防ぐための
組み込みの安全機構があり、たとえば [デフォルトでは](/operations/settings/settings#max_table_size_to_drop)、50 GB を超えるデータを含む 
`MergeTree` ファミリーエンジンのテーブルを安易に DROP することはできません。しかし、これらの安全機構は
あらゆるケースを網羅しているわけではなく、問題が発生する可能性は依然としてあります。

起こりうる人的ミスを効果的に軽減するには、データのバックアップおよびリストア戦略を **事前に**
慎重に準備しておく必要があります。

各社が利用できるリソースやビジネス要件は異なるため、あらゆる状況に適合するような
ClickHouse のバックアップおよびリストアの万能な解決策は存在しません。1 ギガバイトのデータで有効な方法は、
数十ペタバイトのデータではまず機能しません。さまざまなアプローチが存在し、それぞれに長所と短所があり、
このセクションで解説します。1 つの方法だけに頼るのではなく、複数のアプローチを組み合わせて
それぞれの欠点を補完することをお勧めします。

:::note
バックアップを取得していても、一度もリストアを試したことがなければ、
いざ必要になったときに正しくリストアできない可能性があります（少なくとも、ビジネスが許容できる時間より
長くかかるかもしれません）。そのため、どのようなバックアップアプローチを選択する場合でも、
リストア手順も自動化し、予備の ClickHouse クラスター上で定期的にテストするようにしてください。
:::

次のページでは、ClickHouse で利用可能なさまざまなバックアップおよび
リストア方法の詳細を説明します。

| Page                                                                | Description                                                         |
|---------------------------------------------------------------------|---------------------------------------------------------------------|
| [Backup/restore using local disk or S3 disk](./01_local_disk.md)    | ローカルディスクまたは S3 ディスクへの／からのバックアップ／リストアの詳細 |
| [Backup/restore using S3 endpoint](./02_s3_endpoint.md)             | S3 エンドポイントへの／からのバックアップ／リストアの詳細                |
| [Backup/restore using AzureBlobStorage](./03_azure_blob_storage.md) | Azure blob storage への／からのバックアップ／リストアの詳細          |
| [Alternative methods](./04_alternative_methods.md)                  | 代替的なバックアップ手法についての説明                               |        

バックアップは次のように分類できます:
- [フルまたは増分](#backup-types)
- [同期または非同期](#synchronous-vs-asynchronous)
- [並行または非並行](#concurrent-vs-non-concurrent)
- [圧縮ありまたは圧縮なし](#compressed-vs-uncompressed)
- [名前付きコレクション](#using-named-collections) を使用
- パスワード保護の有無
- [system テーブル、log テーブル、アクセス管理テーブル](#system-backups) のバックアップかどうか



## バックアップの種類 {#backup-types}

バックアップにはフルバックアップと増分バックアップの 2 種類があります。フルバックアップは
データの完全なコピーであり、増分バックアップは最後のフルバックアップからのデータの差分です。

フルバックアップは、他のバックアップに依存しない単純で信頼性の高い復旧方法という利点があります。
しかし、完了までに時間がかかる場合があり、多くのストレージ容量を消費する可能性があります。
一方、増分バックアップは時間と容量の両面でより効率的ですが、データを復元する際には、
関連するすべてのバックアップが利用可能である必要があります。

要件に応じて、次のように使い分けることができます。
- 小規模なデータベースや重要なデータには **フルバックアップ**。
- 大規模なデータベース、または高頻度かつコスト効率良くバックアップを行う必要がある場合には **増分バックアップ**。
- 例えば、週次のフルバックアップと日次の増分バックアップのように **両方** を併用。



## 同期バックアップと非同期バックアップ {#synchronous-vs-asynchronous}

`BACKUP` および `RESTORE` コマンドには `ASYNC` を付与することもできます。この場合、
バックアップコマンドはすぐに制御が返され、バックアップ処理はバックグラウンドで実行されます。
コマンドに `ASYNC` が付与されていない場合、バックアップ処理は同期的に行われ、
バックアップが完了するまでコマンドはブロックされます。



## 同時実行バックアップと非同時実行バックアップ {#concurrent-vs-non-concurrent}

デフォルトでは、ClickHouse はバックアップおよびリストアの同時実行を許可します。つまり、
複数のバックアップまたはリストア処理を同時に開始できます。ただし、この動作を
無効化できるサーバーレベルの設定があります。これらの設定を false にすると、
クラスタ上で同時に実行できるバックアップまたはリストア処理は 1 件だけになります。
これにより、リソース競合や処理同士の潜在的なコンフリクトを回避するのに役立ちます。

バックアップおよびリストアの同時実行を禁止するには、それぞれ次の設定を使用します。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値は true であり、デフォルトではバックアップおよびリストアの同時実行が許可されています。クラスタでこれらの設定が false に設定されている場合、そのクラスタでは同時に実行できるバックアップ／リストアは 1 つだけになります。


## 圧縮バックアップと非圧縮バックアップ {#compressed-vs-uncompressed}

ClickHouse のバックアップは、`compression_method` と `compression_level` 設定による圧縮をサポートしています。

バックアップを作成する際には、次の項目を指定できます。

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```


## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションを使用すると、バックアップ／リストア処理で再利用できるキーと値のペア（S3 の認証情報、エンドポイント、設定など）を保存できます。これにより、次のことが可能になります:

- 管理者権限を持たないユーザーから認証情報を隠す
- 複雑な設定を集中管理してコマンドを簡潔にする
- 処理間で一貫性を維持する
- クエリログ上で認証情報が露出することを防ぐ

詳細については、["named collections"](/operations/named-collections) を参照してください。



## システムテーブル、ログテーブル、アクセス管理テーブルのバックアップ {#system-backups}

システムテーブルもバックアップおよびリストアのワークフローに含めることができますが、
含めるかどうかは特定のユースケースに依存します。

`query_log` や `part_log` など、`_log` サフィックスを持つ履歴データを保存するシステムテーブルは、
他のテーブルと同様にバックアップおよびリストアできます。
ユースケースとして履歴データの分析（たとえば、`query_log` を使用してクエリのパフォーマンスを追跡したり、
問題をデバッグしたりすること）に依存している場合は、これらのテーブルをバックアップ戦略に
含めることが推奨されます。逆に、これらのテーブルの履歴データが不要な場合は、
バックアップストレージ容量を節約するために除外できます。

ユーザー、ロール、row_policies、settings_profiles、quotas など、アクセス管理に関連する
システムテーブルは、バックアップおよびリストア操作時に特別に扱われます。
これらのテーブルがバックアップに含まれている場合、その内容は特別な `accessXX.txt`
ファイルにエクスポートされます。このファイルには、アクセスエンティティを作成および設定するための
同等の SQL ステートメントが含まれます。リストア時には、リストア処理がこれらのファイルを
解釈し、SQL コマンドを適用してユーザー、ロール、およびその他の設定を再作成します。
この機能により、ClickHouse クラスターのアクセス制御設定を、クラスター全体のセットアップの一部として
バックアップおよびリストアできるようになります。

この機能は、SQL コマンドによって管理される設定
（["SQL-driven Access Control and Account Management"](/operations/access-rights#enabling-access-control) と呼ばれます）
に対してのみ動作します。
ClickHouse サーバーの設定ファイル（例: `users.xml`）で定義されたアクセス設定は、
バックアップには含まれず、この方法でリストアすることはできません。



## 一般的な構文 {#syntax}

<Syntax/>

### コマンド概要 {#command-summary}

上記の各コマンドの詳細は以下のとおりです。

| **Command**                                                            | **Description**                                                                                                                                      |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BACKUP`                                                               | 指定したオブジェクトのバックアップを作成する                                                                                                        |
| `RESTORE`                                                              | バックアップからオブジェクトを復元する                                                                                                              |
| `[ASYNC]`                                                              | 操作を非同期で実行する（即時に制御を返し、監視できる ID を返す）                                                                                    |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 特定のテーブルをバックアップ／復元する（名前を変更可能）                                                                                            |
| `[PARTITION[S] partition_expr [,...]]`                                 | テーブルの特定パーティションのみバックアップ／復元する                                                                                              |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | 辞書オブジェクトをバックアップ／復元する                                                                                                            |
| `DATABASE database_name [AS database_name_in_backup]`                  | データベース全体をバックアップ／復元する（名前を変更可能）                                                                                          |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 一時テーブルをバックアップ／復元する（名前を変更可能）                                                                                              |
| `VIEW view_name [AS view_name_in_backup]`                              | ビューをバックアップ／復元する（名前を変更可能）                                                                                                    |
| `[EXCEPT TABLES ...]`                                                  | データベースをバックアップする際に特定のテーブルを除外する                                                                                          |
| `ALL`                                                                  | すべて（すべてのデータベース、テーブルなど）をバックアップ／復元する。ClickHouse バージョン 23.4 より前では、`ALL` は `RESTORE` コマンドにのみ適用されていた。 |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | `ALL` を使用する際に、特定のテーブルまたはデータベースを除外する                                                                                    |
| `[ON CLUSTER 'cluster_name']`                                          | ClickHouse クラスター全体でバックアップ／復元を実行する                                                                                             |
| `TO\|FROM`                                                             | 方向を指定：バックアップ先には `TO`、復元元には `FROM` を使用                                                                                        |
| `File('<path>/<filename>')`                                            | ローカルファイルシステムに保存／ローカルファイルシステムから復元する                                                                                |
| `Disk('<disk_name>', '<path>/')`                                       | 設定済みのディスクに保存／そのディスクから復元する                                                                                                  |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | Amazon S3 または S3 互換ストレージに保存／そこから復元する                                                                                           |
| `[SETTINGS ...]`                                                       | 設定の全一覧は以下を参照                                                                                                                            |                                                                                                                         |

### 設定 {#settings}

**汎用バックアップ／復元設定**

<GenericSettings/>

**S3 固有の設定**

<S3Settings/>

**Azure 固有の設定**

<AzureSettings/>



## 管理とトラブルシューティング {#check-the-status-of-backups}

バックアップコマンドは `id` と `status` を返し、この `id` を使って
バックアップの状態を取得できます。これは、時間のかかる
`ASYNC` バックアップの進行状況を確認するのに有用です。以下の例は、
既存のバックアップファイルを上書きしようとした際に発生したエラーを示しています。

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
error:             コード: 598. DB::Exception: バックアップ Disk('backups', '1.zip') は既に存在します。(BACKUP_ALREADY_EXISTS) (バージョン 22.8.2.11 (公式ビルド))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

[`system.backups`](/operations/system-tables/backups) テーブルに加えて、すべてのバックアップおよび復元操作は
システムログ用テーブル [`system.backup_log`](/operations/system-tables/backup_log) でも記録されます。

```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```

```response
行 1:
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

行 2:
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

2行のセット。経過時間: 0.075秒
```
