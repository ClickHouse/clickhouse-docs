---
description: 'ユーザー定義関数 (UDF) の読み込みステータスと設定メタデータを含むシステムテーブル。'
keywords: ['システムテーブル', 'user_defined_functions', 'udf', 'executable']
slug: /operations/system-tables/user_defined_functions
title: 'system.user_defined_functions'
doc_type: 'reference'
---

# system.user_defined_functions \{#systemuser_defined_functions\}

[ユーザー定義関数 (UDF)](/sql-reference/functions/udf.md) の読み込みステータス、エラー情報、および設定メタデータを含みます。

カラム:

**読み込みステータス**

* `name` ([String](/sql-reference/data-types/string.md)) — UDF 名。
* `load_status` ([Enum8](/sql-reference/data-types/enum.md)) — 読み込みステータス: `Success` (UDF が読み込まれて準備完了)、`Failed` (UDF の読み込みに失敗)。
* `loading_error_message` ([String](/sql-reference/data-types/string.md)) — 読み込みに失敗した場合の詳細なエラーメッセージ。正常に読み込まれた場合は空文字列。
* `last_successful_update_time` ([Nullable(DateTime)](/sql-reference/data-types/datetime.md)) — 直近の正常な読み込みのタイムスタンプ。成功したことがない場合は `NULL`。
* `loading_duration_ms` ([UInt64](/sql-reference/data-types/int-uint.md)) — UDF の読み込みに要した時間 (ミリ秒)。

**UDF 設定**

* `type` ([Enum8](/sql-reference/data-types/enum.md)) — UDF の種類: `executable` (ブロックごとに 1 プロセス) または `executable_pool` (永続プロセスプール)。
* `command` ([String](/sql-reference/data-types/string.md)) — 引数を含む実行対象のスクリプトまたはコマンド。
* `format` ([String](/sql-reference/data-types/string.md)) — 入出力用のデータフォーマット (例: `TabSeparated`, `JSONEachRow`)。
* `return_type` ([String](/sql-reference/data-types/string.md)) — 関数の戻り値の型 (例: `String`, `UInt64`)。
* `return_name` ([String](/sql-reference/data-types/string.md)) — 任意の戻り値識別子。設定されていない場合は空。
* `argument_types` ([Array(String)](/sql-reference/data-types/array.md)) — 引数の型の配列。
* `argument_names` ([Array(String)](/sql-reference/data-types/array.md)) — 引数名の配列。名前なしの引数の場合は空文字列。

**実行パラメータ**

* `max_command_execution_time` ([UInt64](/sql-reference/data-types/int-uint.md)) — データブロックを処理する最大秒数。`executable_pool` 型でのみ使用。
* `command_termination_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — コマンドプロセスに SIGTERM を送信するまでの秒数。
* `command_read_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — コマンドの stdout から読み取る際のタイムアウト (ミリ秒)。
* `command_write_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — コマンドの stdin へ書き込む際のタイムアウト (ミリ秒)。
* `pool_size` ([UInt64](/sql-reference/data-types/int-uint.md)) — プール内のプロセスインスタンス数。`executable_pool` 型でのみ使用。
* `send_chunk_header` ([UInt8](/sql-reference/data-types/int-uint.md)) — 各データ chunk の先頭で行数を送信するかどうか (1 = true, 0 = false)。
* `execute_direct` ([UInt8](/sql-reference/data-types/int-uint.md)) — コマンドを直接実行するか (1)、`/bin/bash` 経由で実行するか (0)。
* `lifetime` ([UInt64](/sql-reference/data-types/int-uint.md)) — 再読み込み間隔 (秒)。0 の場合は再読み込みが無効。
* `deterministic` ([UInt8](/sql-reference/data-types/int-uint.md)) — 同じ引数に対して常に同じ結果を返すかどうか (1 = true, 0 = false)。

**例**

すべての UDF とその読み込みステータスを表示:

```sql
SELECT
    name,
    load_status,
    type,
    command,
    return_type,
    argument_types
FROM system.user_defined_functions
FORMAT Vertical;
```

```response
Row 1:
──────
name:           my_sum_udf
load_status:    Success
type:           executable
command:        /var/lib/clickhouse/user_scripts/sum.py
return_type:    UInt64
argument_types: ['UInt64','UInt64']
```

失敗した UDF を見つける:

```sql
SELECT
    name,
    loading_error_message
FROM system.user_defined_functions
WHERE load_status = 'Failed';
```

**関連項目**

* [ユーザー定義関数](/sql-reference/functions/udf.md) — UDF の作成と設定方法。
