---
description: 'ClickHouse のバックアップとリストアの概要'
sidebar_label: 'S3 エンドポイント'
slug: /operations/backup/s3_endpoint
title: 'S3 エンドポイントへのバックアップおよび復元'
doc_type: 'guide'
---

import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# S3エンドポイントを使用したバックアップ/リストア {#backup-to-a-local-disk}

この記事では、S3エンドポイントを経由してS3バケットへバックアップする方法、およびS3バケットからリストアする方法について説明します。


## 構文 {#syntax}

<Syntax />


## 使用例 {#usage-examples}

### S3エンドポイントへの増分バックアップ {#incremental-backup-to-an-s3-endpoint}

この例では、S3エンドポイントへバックアップを作成し、そこから復元を行います。

:::note
完全バックアップと増分バックアップの違いについては、[「バックアップの種類」](/operations/backup/overview/#backup-types)を参照してください
:::

この方法を使用するには、以下の情報が必要です:

| パラメータ         | 例                                                      |
| ----------------- | ------------------------------------------------------------ |
| S3エンドポイント    | `https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/` |
| アクセスキーID     | `BKIOZLE2VYN3VXXTP9RC`                                       |
| シークレットアクセスキー | `40bwYnbqN7xU8bVePaUCh3+YEyGXu8UOMV9ANpwL`                   |

:::tip
S3バケットの作成については、[「S3オブジェクトストレージをClickHouseディスクとして使用する」](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)のセクションを参照してください
:::

バックアップの保存先は次のように指定します:

```sql
S3('<s3 endpoint>/<directory>', '<access key id>', '<secret access key>', '<extra_credentials>')
```

<br/>
<VerticalStepper headerLevel="h4">

#### セットアップ {#create-a-table}

以下のデータベースとテーブルを作成し、ランダムなデータを挿入します:

```sql
CREATE DATABASE IF NOT EXISTS test_db;
CREATE TABLE test_db.test_table
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

#### ベースバックアップの作成 {#create-a-base-initial-backup}

増分バックアップには、開始点となる_ベース_バックアップが必要です。S3保存先の最初のパラメータはS3エンドポイントで、その後にこのバックアップに使用するバケット内のディレクトリが続きます。この例では、ディレクトリ名は`my_backup`です。

以下のコマンドを実行してベースバックアップを作成します:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### データの追加 {#add-more-data}

増分バックアップには、ベースバックアップとバックアップ対象テーブルの現在の内容との差分が格納されます。増分バックアップを取得する前に、さらにデータを追加します:

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

#### 増分バックアップの取得 {#take-an-incremental-backup}

このバックアップコマンドはベースバックアップと似ていますが、`SETTINGS base_backup`とベースバックアップの場所が追加されています。増分バックアップの保存先はベースと同じディレクトリではなく、同じエンドポイントでバケット内の異なるターゲットディレクトリになることに注意してください。ベースバックアップは`my_backup`にあり、増分バックアップは`my_incremental`に書き込まれます:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
SETTINGS base_backup = S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### 増分バックアップからの復元 {#restore-from-the-incremental-backup}

このコマンドは、増分バックアップを新しいテーブル`test_table_restored`に復元します。  
増分バックアップを復元する際、ベースバックアップも含まれることに注意してください。
復元時には**増分バックアップ**のみを指定します:


```sql
RESTORE TABLE data AS test_db.test_table_restored FROM S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

#### 件数の確認 {#verify-the-count}

元のテーブル `data` には2回の挿入が行われており、1回目は1,000行、2回目は100行で、合計1,100行です。
復元されたテーブルに1,100行が含まれていることを確認します:

```sql
SELECT count()
FROM test_db.test_table_restored
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

#### 内容の確認 {#verify-the-content}

元のテーブル `test_table` の内容と復元されたテーブル `test_table_restored` の内容を比較します:

```sql
SELECT throwIf((
   SELECT groupArray(tuple(*))
   FROM test_db.test_table
   ) != (
   SELECT groupArray(tuple(*))
   FROM test_db.test_table_restored
), 'Data does not match after BACKUP/RESTORE')
```

</VerticalStepper>
