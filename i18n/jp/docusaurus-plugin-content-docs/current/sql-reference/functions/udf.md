---
slug: '/sql-reference/functions/udf'
sidebar_position: 15
sidebar_label: 'UDF'
keywords: ['ClickHouse UDF', 'ユーザー定義関数', 'SQL', 'データベース']
description: 'ClickHouseにおけるユーザー定義関数 (UDF) の設定と使用について'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# ユーザー定義関数 (UDF)

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は、ClickHouse Cloudのプライベートプレビューでサポートされています。アクセスには[ClickHouse Support](https://clickhouse.cloud/support)にご連絡ください。
:::

ClickHouseは、データを処理するために外部の実行可能なプログラムまたはスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の設定は、一つまたは複数のxmlファイルに保存されます。設定ファイルへのパスは[ user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config)パラメータで指定します。

関数の設定には以下の設定項目が含まれます：

- `name` - 関数名。
- `command` - 実行するスクリプト名、または`execute_direct`がfalseの場合のコマンド。
- `argument` - 引数の説明（`type`とオプションの`name`）を含む引数。この引数はそれぞれ別の設定で説明されます。引数名が[Native](/interfaces/formats/Native)や[JSONEachRow](/interfaces/formats/JSONEachRow)のようなユーザー定義関数形式のシリアル化の一部である場合には、名前を指定する必要があります。デフォルトの引数名は`c` + argument_numberです。
- `format` - コマンドに渡される引数の[フォーマット](../../interfaces/formats.md)。
- `return_type` - 戻り値の型。
- `return_name` - 戻り値の名前。戻り値の名前が[Native](../../interfaces/formats.md#native)や[JSONEachRow](/interfaces/formats/JSONEachRow)のようなユーザー定義関数形式のシリアル化の一部である場合には、戻り値名を指定する必要があります。オプション。デフォルト値は`result`です。
- `type` - 実行可能なタイプ。`type`が`executable`に設定されている場合、単一のコマンドが開始されます。`executable_pool`に設定されている場合は、コマンドのプールが作成されます。
- `max_command_execution_time` - データブロックを処理するための最大実行時間（秒単位）。この設定は`executable_pool`コマンドにのみ有効です。オプション。デフォルト値は`10`です。
- `command_termination_timeout` - コマンドがそのパイプが閉じられたあとに完了するべき時間（秒単位）。その時間が過ぎると、`SIGTERM`が実行中のコマンドに送信されます。オプション。デフォルト値は`10`です。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000。オプションのパラメータです。
- `command_write_timeout` - コマンドのstdinにデータを書くためのタイムアウト（ミリ秒単位）。デフォルト値は10000。オプションのパラメータです。
- `pool_size` - コマンドプールのサイズ。オプション。デフォルト値は`16`です。
- `send_chunk_header` - チャンクのデータを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`です。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は、空白で区切って指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションのパラメータです。
- `lifetime` - 関数の再読み込み間隔（秒単位）。`0`に設定されている場合、関数は再読み込みされません。デフォルト値は`0`です。オプションのパラメータです。

コマンドは引数を`STDIN`から読み取り、結果を`STDOUT`に出力しなければなりません。コマンドは引数を反復的に処理する必要があります。すなわち、引数のチャンクを処理した後は、次のチャンクを待たなければなりません。

### 例 {#examples}

**インラインスクリプト**

`execute_direct`を`0`に指定して`test_function_sum`を手動で作成します。
ファイル`test_function.xml` (`/etc/clickhouse-server/test_function.xml`のデフォルトパス設定)。
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

**Pythonスクリプト**

`STDIN`から値を読み取り、それを文字列として返します：

XML設定を使用して`test_function`を作成します。
ファイル`test_function.xml` (`/etc/clickhouse-server/test_function.xml`のデフォルトパス設定)。
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

`user_scripts`フォルダ内のスクリプトファイル`test_function.py` (`/var/lib/clickhouse/user_scripts/test_function.py`のデフォルトパス設定)。

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

`STDIN`から2つの値を読み取り、JSONオブジェクトとしてその合計を返します：

XML設定を使用して名前付き引数とフォーマット[JSONEachRow](../../interfaces/formats.md#jsoneachrow)の`test_function_sum_json`を作成します。
ファイル`test_function.xml` (`/etc/clickhouse-server/test_function.xml`のデフォルトパス設定)。
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

`user_scripts`フォルダ内のスクリプトファイル`test_function_sum_json.py` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py`のデフォルトパス設定)。

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

`command`設定のパラメータを使用：

実行可能なユーザー定義関数は、`command`設定で構成された定数パラメータを取ることができます（これは`executable`タイプのユーザー定義関数に対してのみ機能します）。また、`execute_direct`オプションも必要です（シェル引数の展開脆弱性を回避するため）。
ファイル`test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml`のデフォルトパス設定)。
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

`user_scripts`フォルダ内のスクリプトファイル`test_function_parameter_python.py` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`のデフォルトパス設定)。

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

実行可能なユーザー定義関数はシェルスクリプトでも使用できます。
ファイル`test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml`のデフォルトパス設定)。
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

`user_scripts`フォルダ内のスクリプトファイル`test_shell.sh` (`/var/lib/clickhouse/user_scripts/test_shell.sh`のデフォルトパス設定)。

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

データが無効な場合、一部の関数は例外をスローすることがあります。この場合、クエリはキャンセルされ、エラーテキストがクライアントに返されます。分散処理の場合、サーバーのいずれかで例外が発生すると、他のサーバーもクエリの中止を試みます。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほぼすべてのプログラミング言語において、特定の演算子に対しては引数の一つが評価されない場合があります。これは通常、演算子`&&`、`||`、および`?:`が関与します。
しかし、ClickHouseでは、関数（演算子）の引数は常に評価されます。これは、カラムの全体の部分が一度に評価され、各行を別々に計算するのではないためです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、できるだけ多くのクエリ処理ステージがリモートサーバーで行われ、残りのステージ（中間結果のマージとその後のすべて）はリクエスタサーバーで実行されます。

これは、関数が異なるサーバーで実行される可能性があることを意味します。
例えば、クエリ`SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`のように、

- `distributed_table`が少なくとも2つのシャードを持っている場合、関数'g'と'h'はリモートサーバーで実行され、関数'f'はリクエスタサーバーで実行されます。
- `distributed_table`が1つのシャードのみを持っている場合、すべての'f'、'g'、'h'関数はこのシャードのサーバーで実行されます。

関数の結果は通常、どのサーバーで実行されるかに依存しません。しかし、時にはこれが重要です。
例えば、辞書と連携する関数は、そのサーバーで実行される辞書を使用します。
もう一つの例は、`hostName`関数で、この関数は`SELECT`クエリでサーバーごとに`GROUP BY`を行うために実行されるサーバーの名前を返します。

クエリ内の関数がリクエスタサーバーで実行される場合でも、リモートサーバーで実行する必要がある場合は、それを'any'集約関数にラップするか、`GROUP BY`のキーに追加することができます。

## SQLユーザー定義関数 {#sql-user-defined-functions}

ラムダ式からカスタム関数を作成するには、[CREATE FUNCTION](../statements/create/function.md)ステートメントを使用します。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function)ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloudのユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
