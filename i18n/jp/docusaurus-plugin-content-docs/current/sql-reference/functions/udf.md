---
description: 'ユーザー定義関数 (UDF) のドキュメント'
sidebar_label: 'UDF'
sidebar_position: 15
slug: /sql-reference/functions/udf
title: 'ユーザー定義関数 (UDF)'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# ユーザー定義関数 (UDF)

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud でプライベートプレビュー中にサポートされています。アクセスするには [ClickHouse サポート](https://clickhouse.cloud/support) にお問い合わせください。
:::

ClickHouse は、データを処理するために、任意の外部実行可能プログラムやスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の設定は、1 つ以上の XML ファイルに配置されます。設定へのパスは [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) パラメータで指定されます。

関数の設定には、以下の設定が含まれます。

- `name` - 関数名。
- `command` - 実行するスクリプト名または `execute_direct` が false の場合のコマンド。
- `argument` - `type` およびオプションの `name` を持つ引数の説明。各引数は個別の設定で説明されます。引数名がユーザー定義関数形式（[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) など）のシリアル化の一部である場合、名前を指定する必要があります。デフォルトの引数名値は `c` + 引数番号です。
- `format` - コマンドに引数が渡される [フォーマット](../../interfaces/formats.md)。
- `return_type` - 返される値の型。
- `return_name` - 返される値の名前。返す名前がユーザー定義関数形式のシリアル化の一部である場合、返す名前を指定する必要があります。オプション。デフォルト値は `result` です。
- `type` - 実行可能なタイプ。`type` が `executable` に設定されている場合、単一のコマンドが開始されます。`executable_pool` に設定されている場合は、コマンドのプールが作成されます。
- `max_command_execution_time` - データブロックの処理における最大実行時間（秒単位）。この設定は `executable_pool` コマンドにのみ有効です。オプション。デフォルト値は `10` です。
- `command_termination_timeout` - コマンドのパイプが閉じられた後にコマンドが終了する必要がある時間（秒単位）。その時間が過ぎると、コマンドを実行しているプロセスに `SIGTERM` が送信されます。オプション。デフォルト値は `10` です。
- `command_read_timeout` - コマンドの標準出力からデータを読み取る際のタイムアウト（ミリ秒単位）。デフォルト値は 10000。オプションのパラメータです。
- `command_write_timeout` - コマンドの標準入力にデータを書き込む際のタイムアウト（ミリ秒単位）。デフォルト値は 10000。オプションのパラメータです。
- `pool_size` - コマンドプールのサイズ。オプション。デフォルト値は `16` です。
- `send_chunk_header` - データブロックを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は `false` です。
- `execute_direct` - `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) に指定された user_scripts フォルダ内で検索されます。追加のスクリプト引数は、ホワイトスペースで区切って指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1`。オプションのパラメータです。
- `lifetime` - 関数のリロード間隔（秒単位）。`0` に設定されている場合、関数はリロードされません。デフォルト値は `0`。オプションのパラメータです。
- `deterministic` - 関数が決定的であるか否か（同じ入力に対して同じ結果を返す）。デフォルト値は `false`。オプションのパラメータです。

コマンドは、引数を `STDIN` から読み取り、結果を `STDOUT` に出力する必要があります。コマンドは、引数を反復処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待機する必要があります。

### 例 {#examples}

**インラインスクリプト**

`execute_direct` を `0` に手動で指定して `test_function_sum` を作成します。ファイル `test_function.xml` （デフォルトのパス設定で `/etc/clickhouse-server/test_function.xml`）。
```xml
<functions>
    <function>
        <type>executable</type>
        <name>test_function_sum</name>
        <return_type>UInt64</return_type>
        <argument>
            <type>UInt64</type>
            <name>lhs</name>
        </argument>
        <argument>
            <type>UInt64</type>
            <name>rhs</name>
        </argument>
        <format>TabSeparated</format>
        <command>cd /; clickhouse-local --input-format TabSeparated --output-format TabSeparated --structure 'x UInt64, y UInt64' --query "SELECT x + y FROM table"</command>
        <execute_direct>0</execute_direct>
        <deterministic>true</deterministic>
    </function>
</functions>
```

クエリ：

```sql
SELECT test_function_sum(2, 2);
```

結果：

```text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python スクリプト**

`STDIN` から値を読み取り、それを文字列として返します：

XML 設定を使用して `test_function` を作成します。ファイル `test_function.xml` （デフォルトのパス設定で `/etc/clickhouse-server/test_function.xml`）。
```xml
<functions>
    <function>
        <type>executable</type>
        <name>test_function_python</name>
        <return_type>String</return_type>
        <argument>
            <type>UInt64</type>
            <name>value</name>
        </argument>
        <format>TabSeparated</format>
        <command>test_function.py</command>
    </function>
</functions>
```

`user_scripts` フォルダ内のスクリプトファイル `test_function.py` （デフォルトのパス設定で `/var/lib/clickhouse/user_scripts/test_function.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

クエリ：

```sql
SELECT test_function_python(toUInt64(2));
```

結果：

```text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

`STDIN` から 2 つの値を読み取り、それらの合計を JSON オブジェクトとして返します：

XML 設定を使用して `test_function_sum_json` を作成します。ファイル `test_function.xml` （デフォルトのパス設定で `/etc/clickhouse-server/test_function.xml`）。
```xml
<functions>
    <function>
        <type>executable</type>
        <name>test_function_sum_json</name>
        <return_type>UInt64</return_type>
        <return_name>result_name</return_name>
        <argument>
            <type>UInt64</type>
            <name>argument_1</name>
        </argument>
        <argument>
            <type>UInt64</type>
            <name>argument_2</name>
        </argument>
        <format>JSONEachRow</format>
        <command>test_function_sum_json.py</command>
    </function>
</functions>
```

`user_scripts` フォルダ内のスクリプトファイル `test_function_sum_json.py` （デフォルトのパス設定で `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`）。

```python
#!/usr/bin/python3

import sys
import json

if __name__ == '__main__':
    for line in sys.stdin:
        value = json.loads(line)
        first_arg = int(value['argument_1'])
        second_arg = int(value['argument_2'])
        result = {'result_name': first_arg + second_arg}
        print(json.dumps(result), end='\n')
        sys.stdout.flush()
```

クエリ：

```sql
SELECT test_function_sum_json(2, 2);
```

結果：

```text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

`command` 設定でパラメータを使用：

実行可能なユーザー定義関数には、`command` 設定で構成された定数パラメータを渡すことができます（`executable` タイプのユーザー定義関数でのみ機能します）。これには `execute_direct` オプションも必要です（シェル引数の展開の脆弱性を回避するため）。ファイル `test_function_parameter_python.xml` （デフォルトのパス設定で `/etc/clickhouse-server/test_function_parameter_python.xml`）。
```xml
<functions>
    <function>
        <type>executable</type>
        <execute_direct>true</execute_direct>
        <name>test_function_parameter_python</name>
        <return_type>String</return_type>
        <argument>
            <type>UInt64</type>
        </argument>
        <format>TabSeparated</format>
        <command>test_function_parameter_python.py {test_parameter:UInt64}</command>
    </function>
</functions>
```

`user_scripts` フォルダ内のスクリプトファイル `test_function_parameter_python.py` （デフォルトのパス設定で `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

クエリ：

```sql
SELECT test_function_parameter_python(1)(2);
```

結果：

```text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**シェルスクリプト**

各値を 2 倍にするシェルスクリプト：

実行可能なユーザー定義関数は、シェルスクリプトと共に使用できます。ファイル `test_function_shell.xml` （デフォルトのパス設定で `/etc/clickhouse-server/test_function_shell.xml`）。
```xml
<functions>
    <function>
        <type>executable</type>
        <name>test_shell</name>
        <return_type>String</return_type>
        <argument>
            <type>UInt8</type>
            <name>value</name>
        </argument>
        <format>TabSeparated</format>
        <command>test_shell.sh</command>
    </function>
</functions>
```

`user_scripts` フォルダ内のスクリプトファイル `test_shell.sh` （デフォルトのパス設定で `/var/lib/clickhouse/user_scripts/test_shell.sh`）。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

クエリ：

```sql
SELECT test_shell(number) FROM numbers(10);
```

結果：

```text
    ┌─test_shell(number)─┐
 1. │ 0                  │
 2. │ 2                  │
 3. │ 4                  │
 4. │ 6                  │
 5. │ 8                  │
 6. │ 10                 │
 7. │ 12                 │
 8. │ 14                 │
 9. │ 16                 │
10. │ 18                 │
    └────────────────────┘
```

### エラーハンドリング {#error-handling}

一部の関数は、データが無効な場合に例外をスローすることがあります。この場合、クエリはキャンセルされ、エラーテキストがクライアントに返されます。分散処理では、サーバーの 1 つで例外が発生した場合、他のサーバーもクエリを中止しようとします。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどのプログラミング言語では、ある演算子に対して引数の 1 つも評価されないことがあります。これは通常 `&&`、`||` および `?:` の演算子です。しかし、ClickHouse では、関数（演算子）の引数は常に評価されます。これは、カラムの全体の部分が一度に評価され、各行を個別に計算するのではないためです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、可能な限り多くのクエリ処理のステージがリモートサーバー上で実行され、残りのステージ（中間結果のマージおよびその後すべて）はリクエスターサーバーで実行されます。

これは、関数が異なるサーバー上で実行できることを意味します。
例えば、クエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` の場合、

- `distributed_table` に少なくとも 2 つのシャードがある場合、関数 'g' と 'h' はリモートサーバーで実行され、関数 'f' はリクエスターサーバーで実行されます。
- `distributed_table` に 1 つのシャードしかない場合、すべての 'f'、'g' および 'h' 関数はこのシャードのサーバーで実行されます。

関数の結果は通常、どのサーバーで実行されるかに依存しません。ただし、時には重要です。
例えば、辞書を使用する関数は、実行されているサーバーに存在する辞書を使用します。
もう1つの例は、`hostName` 関数で、これは実行されているサーバーの名前を返し、`SELECT` クエリでサーバーごとに `GROUP BY` を行うために使用されます。

クエリ内の関数がリクエスターサーバーで実行される場合、リモートサーバーで実行する必要がある場合は、'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

カスタム関数は、[CREATE FUNCTION](../statements/create/function.md) ステートメントを使用して lambda 式から作成できます。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloud におけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
