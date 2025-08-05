---
description: 'Documentation for UDFs User Defined Functions'
sidebar_label: 'UDF'
sidebar_position: 15
slug: '/sql-reference/functions/udf'
title: 'UDFs User Defined Functions'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

```md

# UDFs ユーザー定義関数

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud のプライベートプレビューでサポートされています。アクセスするには、https://clickhouse.cloud/support で ClickHouse サポートにお問い合わせください。
:::

ClickHouse は、データを処理するために外部の実行可能プログラムやスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の設定は、1つ以上の XML ファイルに配置できます。設定のパスは、[user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) パラメータで指定します。

関数の設定には、以下の設定が含まれます：

- `name` - 関数名。
- `command` - 実行するスクリプト名または `execute_direct` が false の場合はコマンド。
- `argument` - `type` と引数のオプション `name` を含む引数の説明。各引数は別々の設定で説明されます。引数の名前が、[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) のようなユーザー定義関数フォーマットのシリアル化の一部である場合は、名前を指定する必要があります。デフォルトの引数名の値は `c` + argument_number です。
- `format` - 引数がコマンドに渡される[フォーマット](../../interfaces/formats.md)。
- `return_type` - 戻り値の型。
- `return_name` - 戻り値の名前。戻り名が [Native](../../interfaces/formats.md#native) や [JSONEachRow](/interfaces/formats/JSONEachRow) のようなユーザー定義関数フォーマットのシリアル化の一部である場合は、戻り名を指定する必要があります。オプション。デフォルト値は `result` です。
- `type` - 実行可能タイプ。`type` が `executable` に設定されている場合は、単一のコマンドが開始されます。 `executable_pool` に設定されている場合は、コマンドプールが作成されます。
- `max_command_execution_time` - データブロックの処理における最大実行時間（秒）。この設定は `executable_pool` コマンドにのみ有効です。オプション。デフォルト値は `10` です。
- `command_termination_timeout` - コマンドのパイプが閉じた後、コマンドが終了すべき秒数。指定の時間が経過した後、`SIGTERM` がコマンドを実行するプロセスに送信されます。オプション。デフォルト値は `10` です。
- `command_read_timeout` - コマンドの stdout からデータを読み取るタイムアウト（ミリ秒）。デフォルト値 10000。オプションのパラメータです。
- `command_write_timeout` - コマンドの stdin にデータを書き込むタイムアウト（ミリ秒）。デフォルト値 10000。オプションのパラメータです。
- `pool_size` - コマンドプールのサイズ。オプション。デフォルト値は `16` です。
- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は `false` です。
- `execute_direct` - `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user_scripts フォルダ内で検索されます。追加のスクリプト引数は、ホワイトスペース区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1` です。オプションのパラメータです。
- `lifetime` - 関数のリロード間隔（秒）。`0` に設定されている場合、関数はリロードされません。デフォルト値は `0` です。オプションのパラメータです。
- `deterministic` - 関数が決定論的かどうか（同じ入力に対して同じ結果を返す）。デフォルト値は `false` です。オプションのパラメータです。

コマンドは、`STDIN` から引数を読み込み、結果を `STDOUT` に出力する必要があります。コマンドは、引数を反復的に処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待つ必要があります。

### 例 {#examples}

**インラインスクリプト**

`execute_direct` を `0` に手動で指定して `test_function_sum` を作成します。ファイル `test_function.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function.xml`）。
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

クエリ:

```sql
SELECT test_function_sum(2, 2);
```

結果:

```text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Pythonスクリプト**

`STDIN` から値を読み取り、それを文字列として返します：

XML 設定を使用して `test_function` を作成します。ファイル `test_function.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function.xml`）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

クエリ:

```sql
SELECT test_function_python(toUInt64(2));
```

結果:

```text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

`STDIN` から 2 つの値を読み取り、それらの合計を JSON オブジェクトとして返します：

XML 設定を使用して名付け引数およびフォーマット [JSONEachRow](../../interfaces/formats.md#jsoneachrow) を持つ `test_function_sum_json` を作成します。ファイル `test_function.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function.xml`）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_sum_json.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`）。

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

クエリ:

```sql
SELECT test_function_sum_json(2, 2);
```

結果:

```text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

`command` 設定でパラメータを使用：

実行可能なユーザー定義関数は、`command` 設定で構成された定数パラメータを受け取ることができます（`executable` タイプのユーザー定義関数にのみ有効）。これには、`execute_direct` オプションが必要です（シェル引数展開の脆弱性を回避するため）。
ファイル `test_function_parameter_python.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function_parameter_python.xml`）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_parameter_python.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

クエリ:

```sql
SELECT test_function_parameter_python(1)(2);
```

結果:

```text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**シェルスクリプト**

各値を 2 倍にするシェルスクリプト：

実行可能なユーザー定義関数はシェルスクリプトとともに使用できます。
ファイル `test_function_shell.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function_shell.xml`）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_shell.sh` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_shell.sh`）。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

クエリ:

```sql
SELECT test_shell(number) FROM numbers(10);
```

結果:

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

一部の関数は、データが無効な場合に例外をスローすることがあります。この場合、クエリはキャンセルされ、エラーテキストがクライアントに返されます。分散処理の場合、サーバーの一つで例外が発生したとき、他のサーバーもクエリを中止しようとします。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどすべてのプログラミング言語では、特定の演算子に対して引数の1つが評価されないことがあります。これは通常、演算子 `&&`、 `||`、 および `?:` に当てはまります。しかし、ClickHouse では、関数（演算子）の引数は常に評価されます。これは、カラムの全体の部分が一度に評価され、各行を別々に計算するのではないからです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理のために、可能な限り多くのクエリ処理のステージはリモートサーバーで実行され、残りのステージ（中間結果の統合やそれ以降の全て）はリクエスターサーバーで実行されます。

これは、関数が異なるサーバーで実行される可能性があることを意味します。
例えば、クエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` の場合、

- `distributed_table` に少なくとも 2 つのシャードがある場合、関数 'g' と 'h' はリモートサーバーで実行され、関数 'f' はリクエスターサーバーで実行されます。
- `distributed_table` にひとつのシャードしかない場合、すべての 'f'、 'g'、および 'h' の関数はこのシャードのサーバーで実行されます。

関数の結果は、通常、実行されるサーバーに依存しません。ただし、時には重要なこともあります。
例えば、辞書を扱う関数は、実行されているサーバーに存在する辞書を使用します。
もう一つの例は、`hostName` 関数で、実行されているサーバーの名前を返し、`SELECT` クエリでサーバーごとに `GROUP BY` を行います。

クエリで関数がリクエスターサーバーで実行される場合でも、リモートサーバーで実行する必要がある場合は、'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

カスタム関数は、[CREATE FUNCTION](../statements/create/function.md) ステートメントを使用して lambda 式から作成できます。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloud におけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
