---
slug: /sql-reference/functions/udf
sidebar_position: 15
sidebar_label: UDF
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# UDFs ユーザー定義関数

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud のプライベートプレビューでサポートされています。アクセスするには https://clickhouse.cloud/support の ClickHouse サポートまでお問い合わせください。
:::

ClickHouse は、データを処理するために外部の実行可能なプログラムやスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の設定は、1 つ以上の xml ファイルに格納されます。設定のパスは [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) パラメータで指定されます。

関数の設定には以下の設定が含まれます：

- `name` - 関数名。
- `command` - 実行するスクリプト名または `execute_direct` が false の場合のコマンド。
- `argument` - 引数の説明、`type` およびオプションの引数名。各引数は別々の設定で説明されます。引数名がユーザー定義関数フォーマットの直列化の一部である場合は、名前を指定する必要があります（例： [Native](/docs/interfaces/formats/Native) または [JSONEachRow](/interfaces/formats/JSONEachRow)）。デフォルトの引数名の値は `c` + argument_number です。
- `format` - コマンドに引数を渡す際の [フォーマット](../../interfaces/formats.md)。
- `return_type` - 返される値の型。
- `return_name` - 返される値の名前。返される名前がユーザー定義関数フォーマットの直列化の一部である場合、返す名前を指定する必要があります（例： [Native](../../interfaces/formats.md#native) または [JSONEachRow](/interfaces/formats/JSONEachRow)）。オプション。デフォルト値は `result` です。
- `type` - 実行可能タイプ。`type` を `executable` に設定すると、単一のコマンドが開始されます。`executable_pool` に設定すると、コマンドのプールが作成されます。
- `max_command_execution_time` - データブロックを処理するための最大実行時間（秒）。この設定は `executable_pool` コマンドのみに有効です。オプション。デフォルト値は `10` です。
- `command_termination_timeout` - コマンドのパイプが閉じられた後にコマンドが終了するべき秒数。指定された時間の後にコマンドを実行しているプロセスに `SIGTERM` が送信されます。オプション。デフォルト値は `10` です。
- `command_read_timeout` - コマンドの標準出力からデータを読み取るためのタイムアウト（ミリ秒）。デフォルト値は `10000` です。オプションのパラメータ。
- `command_write_timeout` - コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒）。デフォルト値は `10000` です。オプションのパラメータ。
- `pool_size` - コマンドプールのサイズ。オプション。デフォルト値は `16` です。
- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は `false` です。
- `execute_direct` - `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user_scripts フォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例： `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1` です。オプションのパラメータ。
- `lifetime` - 関数のリロード間隔（秒）。`0` に設定されている場合、関数はリロードされません。デフォルト値は `0` です。オプションのパラメータ。

コマンドは `STDIN` から引数を読み取り、`STDOUT` に結果を出力する必要があります。コマンドは引数を反復的に処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待つ必要があります。

### 例 {#examples}

**インラインスクリプト**

`execute_direct` を `0` に手動で指定して `test_function_sum` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` のデフォルトパス設定）。
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

クエリ：

``` sql
SELECT test_function_sum(2, 2);
```

結果：

``` text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python スクリプト**

`STDIN` から値を読み取り、文字列として返します：

XML 設定を使用して `test_function` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` のデフォルトパス設定）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function.py` (`/var/lib/clickhouse/user_scripts/test_function.py` のデフォルトパス設定)。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

クエリ：

``` sql
SELECT test_function_python(toUInt64(2));
```

結果：

``` text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

`STDIN` から2つの値を読み取り、JSONオブジェクトとしてその合計を返します：

XML 設定を使用して、名前付き引数とフォーマット [JSONEachRow](../../interfaces/formats.md#jsoneachrow) を使用して `test_function_sum_json` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` のデフォルトパス設定）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_sum_json.py` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py` のデフォルトパス設定)。

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

``` sql
SELECT test_function_sum_json(2, 2);
```

結果：

``` text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

`command` 設定でパラメータを使用する：

実行可能なユーザー定義関数は、`command` 設定で構成された定数パラメータを取ることができます（`executable` タイプのユーザー定義関数のみに機能します）。また、`execute_direct` オプションが必要です（シェル引数展開の脆弱性を回避するため）。
ファイル `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml` のデフォルトパス設定）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_parameter_python.py` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py` のデフォルトパス設定)。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

クエリ：

``` sql
SELECT test_function_parameter_python(1)(2);
```

結果：

``` text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**シェルスクリプト**

各値を2倍にするシェルスクリプト：

実行可能なユーザー定義関数は、シェルスクリプトと共に使用できます。
ファイル `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml` のデフォルトパス設定）。
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

`user_scripts` フォルダ内のスクリプトファイル `test_shell.sh` (`/var/lib/clickhouse/user_scripts/test_shell.sh` のデフォルトパス設定)。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

クエリ：

``` sql
SELECT test_shell(number) FROM numbers(10);
```

結果：

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

一部の関数は、データが無効な場合に例外をスローする可能性があります。この場合、クエリはキャンセルされ、エラーメッセージがクライアントに返されます。分散処理の場合、サーバーの一つで例外が発生した場合、他のサーバーもクエリを中止しようとします。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどのプログラミング言語では、特定の演算子については引数が評価されない場合があります。これは通常、演算子 `&&`、`||`、および `?:` です。
しかし、ClickHouse では、関数（演算子）の引数は常に評価されます。これは、列の全体が一度に評価され、各行を個別に計算しないためです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理のために、可能な限り多くのクエリ処理のステージがリモートサーバーで実行され、残りのステージ（中間結果のマージやその後すべての処理）はリクエスターサーバーで実行されます。

これは、関数が異なるサーバーで実行できることを意味します。
たとえば、クエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` では、

- `distributed_table` に少なくとも2つのシャードがある場合、関数 'g' と 'h' はリモートサーバーで実行され、関数 'f' はリクエスターサーバーで実行されます。
- `distributed_table` に1つのシャードしかない場合、すべての 'f'、'g'、および 'h' 関数はこのシャードのサーバーで実行されます。

関数の結果は通常、どのサーバーで実行されるかに依存しません。しかし、時にはこれが重要です。
たとえば、辞書を扱う関数は、実行されるサーバーに存在する辞書を使用します。
もう1つの例は、`hostName` 関数で、これは実行されているサーバーの名前を返し、`SELECT` クエリでサーバーごとに `GROUP BY` を行うために使用されます。

クエリの関数がリクエスターサーバーで実行される場合でも、リモートサーバーで実行する必要がある場合は、それを 'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

ラムダ式からカスタム関数を作成するには [CREATE FUNCTION](../statements/create/function.md) ステートメントを使用します。これらの関数を削除するには [DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloud におけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
