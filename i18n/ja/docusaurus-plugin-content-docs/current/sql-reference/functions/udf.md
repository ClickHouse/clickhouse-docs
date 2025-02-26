---
slug: /sql-reference/functions/udf
sidebar_position: 15
sidebar_label: UDF
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# UDFs ユーザー定義関数

## 実行可能ユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud のプライベートプレビューでサポートされています。アクセスするには、https://clickhouse.cloud/support で ClickHouse サポートにお問い合わせください。
:::

ClickHouse は、データ処理のために任意の外部実行可能プログラムまたはスクリプトを呼び出すことができます。

実行可能ユーザー定義関数の設定は、1つ以上の xml ファイルにあります。設定へのパスは、[user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) パラメータで指定されます。

関数の設定には以下の設定が含まれます：

- `name` - 関数名。
- `command` - 実行するスクリプト名、または `execute_direct` が false の場合はコマンド。
- `argument` - `type` とオプションの `name` を持つ引数の説明。各引数は別の設定で説明されます。引数名が、[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) などのユーザー定義関数形式のシリアル化の一部である場合、名前を指定することが必要です。デフォルトの引数名は `c` + 引数番号です。
- `format` - コマンドに渡される引数の[フォーマット](../../interfaces/formats.md)。
- `return_type` - 戻り値の型。
- `return_name` - 戻り値の名前。戻り名が、[Native](../../interfaces/formats.md#native) や [JSONEachRow](/interfaces/formats.md/JSONEachRow) などのユーザー定義関数形式のシリアルizationの一部である場合、戻り名を指定することが必要です。オプション。デフォルト値は `result`。
- `type` - 実行可能なタイプ。`type` が `executable` に設定されている場合、単一コマンドが開始されます。`executable_pool` に設定されている場合、コマンドのプールが作成されます。
- `max_command_execution_time` - データブロックを処理するための最大実行時間（秒単位）。この設定は `executable_pool` コマンドに対してのみ有効です。オプション。デフォルト値は `10`。
- `command_termination_timeout` - コマンドのパイプが閉じられた後、コマンドが終了するまでの時間（秒単位）。その時間が経過すると、コマンドを実行しているプロセスに `SIGTERM` が送信されます。オプション。デフォルト値は `10`。
- `command_read_timeout` - コマンド stdout からデータを読み取る際のタイムアウト（ミリ秒単位）。デフォルト値は 10000。オプションのパラメータ。
- `command_write_timeout` - コマンド stdin にデータを書き込む際のタイムアウト（ミリ秒単位）。デフォルト値は 10000。オプションのパラメータ。
- `pool_size` - コマンドプールのサイズ。オプション。デフォルト値は `16`。
- `send_chunk_header` - データを処理するチャンクを送信する前に行数を送信するかどうかを制御します。オプション。デフォルト値は `false`。
- `execute_direct` - `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user_scripts フォルダー内で検索されます。追加のスクリプト引数は空白区切りを使用して指定できます。例: `script_name arg1 arg2`。 `execute_direct` = `0` の場合、`command` は `bin/sh -c` 用の引数として渡されます。デフォルト値は `1`。オプションのパラメータ。
- `lifetime` - 関数のリロード間隔（秒単位）。 `0` に設定されている場合、関数はリロードされません。デフォルト値は `0`。オプションのパラメータ。

コマンドは引数を `STDIN` から読み取り、結果を `STDOUT` に出力する必要があります。コマンドは引数を反復的に処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待たなければなりません。

### 例 {#examples}

**インラインスクリプト**

XML 設定を使用して `execute_direct` を `0` に指定して `test_function_sum` を手動で作成します。
ファイル `test_function.xml` （デフォルトのパス設定の `/etc/clickhouse-server/test_function.xml`）。
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
    </function>
</functions>
```

クエリ:

``` sql
SELECT test_function_sum(2, 2);
```

結果:

``` text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python スクリプト**

`STDIN` から値を読み取り、文字列として返します：

XML 設定を使用して `test_function` を作成します。
ファイル `test_function.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function.xml`）。
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

`user_scripts` フォルダー内のスクリプトファイル `test_function.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

クエリ:

``` sql
SELECT test_function_python(toUInt64(2));
```

結果:

``` text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

`STDIN` から2つの値を読み取り、その合計を JSON オブジェクトとして返す：

XML 設定を使用して、名前付き引数と形式 [JSONEachRow](../../interfaces/formats.md#jsoneachrow) を使用して `test_function_sum_json` を作成します。
ファイル `test_function.xml` （デフォルトパス設定の `/etc/clickhouse-server/test_function.xml`）。
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

`user_scripts` フォルダー内のスクリプトファイル `test_function_sum_json.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`）。

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

``` sql
SELECT test_function_sum_json(2, 2);
```

結果:

``` text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

`command` 設定でパラメータを使用する：

実行可能ユーザー定義関数は、`command` 設定で構成された定数パラメータを取得できます（これは `executable` タイプのユーザー定義関数にのみ機能します）。また、`execute_direct` オプションが必要です（シェル引数拡張の脆弱性を回避するため）。
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

`user_scripts` フォルダー内のスクリプトファイル `test_function_parameter_python.py` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

クエリ:

``` sql
SELECT test_function_parameter_python(1)(2);
```

結果:

``` text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**シェルスクリプト**

各値を2倍にするシェルスクリプト：

実行可能ユーザー定義関数はシェルスクリプトとともに使用できます。
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

`user_scripts` フォルダー内のスクリプトファイル `test_shell.sh` （デフォルトパス設定の `/var/lib/clickhouse/user_scripts/test_shell.sh`）。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

クエリ:

``` sql
SELECT test_shell(number) FROM numbers(10);
```

結果:

``` text
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

一部の関数はデータが無効な場合に例外をスローすることがあります。この場合、クエリはキャンセルされ、エラーテキストがクライアントに返されます。分散処理の場合、サーバーの1つで例外が発生した時、他のサーバーもクエリの中止を試みます。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどのプログラミング言語では、特定の演算子に対して引数の一部が評価されない場合があります。通常、これは演算子 `&&`、 `||`、および `?:` です。しかし、ClickHouse では、関数（演算子）の引数は常に評価されます。これは、列の全体の部分が一度に評価され、各行を別々に計算するのではないためです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、できる限り多くのクエリ処理のステージがリモートサーバーで実行され、残りのステージ（中間結果のマージやそれ以降の処理）はリクエスターサーバーで実行されます。

これにより、関数は異なるサーバーで実行される可能性があります。
例えば、`SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` のクエリで、

- `distributed_table` に少なくとも2つのシャードがある場合、関数 'g' と 'h' はリモートサーバーで実行され、関数 'f' はリクエスターサーバーで実行されます。
- `distributed_table` にシャードが1つしかない場合、すべての 'f'、'g'、および 'h' 関数がこのシャードのサーバーで実行されます。

関数の結果は通常、どのサーバーで実行されるかに依存しません。ただし、場合によってはこれが重要です。
例えば、辞書を操作する関数は、実行されているサーバー上に存在する辞書を使用します。
もう一つの例は、`hostName` 関数で、これは実行されているサーバーの名前を返し、`SELECT` クエリでサーバーごとに `GROUP BY` を行うために使用されます。

クエリ内の関数がリクエスターサーバーで実行されるが、リモートサーバーで実行する必要がある場合は、'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

ラムダ式からカスタム関数を [CREATE FUNCTION](../statements/create/function.md) ステートメントを使用して作成できます。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloud のユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
