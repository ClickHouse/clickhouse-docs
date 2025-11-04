---
'description': 'UDFs ユーザー定義関数に関するドキュメント'
'sidebar_label': 'UDF'
'slug': '/sql-reference/functions/udf'
'title': 'UDFs ユーザー定義関数'
'doc_type': 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# UDFs ユーザー定義関数

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud のプライベートプレビューでサポートされています。アクセスするには、https://clickhouse.cloud/support で ClickHouse サポートにお問い合わせください。
:::

ClickHouse は、データを処理するために外部の実行可能プログラムやスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の構成は、1 つ以上の XML ファイルに格納できます。設定へのパスは [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) パラメータで指定されます。

関数の構成には、以下の設定が含まれています。

| パラメータ                   | 説明                                                                                                                                                                                                                                                                                                                                                                           | 必須       | デフォルト値              |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | 関数の名前                                                                                                                                                                                                                                                                                                                                                                    | はい      | -                     |
| `command`                     | 実行するスクリプト名または `execute_direct` が false の場合のコマンド                                                                                                                                                                                                                                                                                                          | はい      | -                     |
| `argument`                    | `type` とオプションの引数の `name` を持つ引数の説明。各引数は別々に設定で説明されます。引数名は、[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) のようなユーザー定義関数の形式のシリアル化の一部である場合、指定する必要があります。                                                                          | はい      | `c` + 引数番号         |
| `format`                      | 引数がコマンドに渡される [フォーマット](../../interfaces/formats.md) 。コマンド出力も同じフォーマットを使用することが期待されます。                                                                                                                                                                                                                                      | はい      | -                     |
| `return_type`                 | 返される値の型                                                                                                                                                                                                                                                                                                                                                                 | はい      | -                     |
| `return_name`                 | 返される値の名前。返り値名は、[Native](../../interfaces/formats.md#native) や [JSONEachRow](/interfaces/formats/JSONEachRow) のようなユーザー定義関数の形式のシリアル化の一部である場合、指定する必要があります。                                                                                                                             | オプション  | `result`              |
| `type`                        | 実行可能なタイプ。`type` が `executable` に設定されている場合は、単一コマンドが起動します。`executable_pool` に設定されている場合は、コマンドのプールが作成されます。                                                                                                                                                                                                                                            | はい      | -                     |
| `max_command_execution_time`  | データブロックを処理するための最大実行時間（秒単位）。この設定は、`executable_pool` コマンドのみに有効です。                                                                                                                                                                                                                                                                  | オプション  | `10`                  |
| `command_termination_timeout` | コマンドのパイプが閉じられた後に、コマンドが終了するまでの時間（秒単位）。その時間を超えると、コマンドを実行しているプロセスに `SIGTERM` が送信されます。                                                                                                                                                                                                                                                  | オプション  | `10`                  |
| `command_read_timeout`        | コマンドの標準出力からデータを読み取るためのタイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                        | オプション  | `10000`               |
| `command_write_timeout`       | コマンドの標準入力にデータを書き込むためのタイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                         | オプション  | `10000`               |
| `pool_size`                   | コマンドプールのサイズ                                                                                                                                                                                                                                                                                                                                                        | オプション  | `16`                  |
| `send_chunk_header`           | データのチャンクを処理する前に行数を送信するかどうかを制御します。                                                                                                                                                                                                                                                                                                            | オプション  | `false`               |
| `execute_direct`              | `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user_scripts フォルダ内で検索されます。追加のスクリプト引数は、空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。                             | オプション  | `1`                   |
| `lifetime`                    | 関数のリロード間隔（秒単位）。`0` に設定すると関数はリロードされません。                                                                                                                                                                                                                                                                                                      | オプション  | `0`                   |
| `deterministic`               | 関数が決定的であるかどうか（同じ入力に対して同じ結果を返す）。                                                                                                                                                                                                                                                                                                                  | オプション  | `false`               |

コマンドは `STDIN` から引数を読み取り、結果を `STDOUT` に出力する必要があります。コマンドは引数を反復処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待機する必要があります。

### 例 {#examples}

**インラインスクリプト**

XML 構成を使用して `execute_direct` を `0` に手動設定した `test_function_sum` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` デフォルトパス設定)。

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

**Python スクリプト**

`STDIN` から値を読み取り、文字列として返します。

XML 構成を使用して `test_function` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` デフォルトパス設定)。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function.py` (`/var/lib/clickhouse/user_scripts/test_function.py` デフォルトパス設定)。

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

2 つの値を `STDIN` から読み取り、それらの合計を JSON オブジェクトとして返します。

XML 構成を使用して named arguments とフォーマット [JSONEachRow](../../interfaces/formats.md#jsoneachrow) を使って `test_function_sum_json` を作成します。
ファイル `test_function.xml` (`/etc/clickhouse-server/test_function.xml` デフォルトパス設定)。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_sum_json.py` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py` デフォルトパス設定)。

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

`command` 設定でパラメータを使用します。

実行可能なユーザー定義関数は、`command` 設定で設定された定数パラメータを取ることができます（`executable` タイプのユーザー定義関数にのみ有効）。さらに、`execute_direct` オプションも必要です（シェル引数展開の脆弱性を防ぐため）。
ファイル `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml` デフォルトパス設定)。
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

`user_scripts` フォルダ内のスクリプトファイル `test_function_parameter_python.py` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py` デフォルトパス設定)。

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

実行可能なユーザー定義関数はシェルスクリプトと一緒に使用できます。
ファイル `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml` デフォルトパス設定)。
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

`user_scripts` フォルダ内のスクリプトファイル `test_shell.sh` (`/var/lib/clickhouse/user_scripts/test_shell.sh` デフォルトパス設定)。

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

データが無効な場合、一部の関数は例外をスローする可能性があります。この場合、クエリはキャンセルされ、エラー テキストがクライアントに返されます。分散処理の場合、1 つのサーバーで例外が発生すると、他のサーバーもクエリを中止しようと試みます。

### 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどのプログラミング言語では、特定の演算子に対して引数の一部が評価されない場合があります。これは通常 `&&`、`||`、`?:` 演算子です。
しかし、ClickHouse では、関数（演算子）の引数は常に評価されます。これは、カラムの全体の部分が一度に評価され、各行を個別に計算するのではなく、そのためです。

### 分散クエリ処理のための関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、可能な限り多くのクエリ処理のステージがリモートサーバーで実行され、残りのステージ（中間結果のマージとその後のすべての処理）はリクエスターサーバーで実行されます。

これは、関数が異なるサーバーで実行できることを意味します。
たとえば、クエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- `distributed_table` に少なくとも 2 つのシャードがある場合、関数 'g' および 'h' はリモートサーバーで実行され、関数 'f' はリクエスターサーバーで実行されます。
- `distributed_table` にシャードが 1 つしかない場合、すべての 'f'、'g' および 'h' 関数はこのシャードのサーバーで実行されます。

関数の結果は通常、どのサーバーで実行されるかに依存しません。ただし、時にはそれが重要です。
たとえば、辞書で作業する関数は、実行しているサーバーに存在する辞書を使用します。
もう一つの例は、`hostName` 関数で、実行しているサーバーの名前を返し、`SELECT` クエリでサーバーで `GROUP BY` を行うために使用されます。

クエリ内の関数がリクエスターサーバーで実行される場合でも、リモートサーバーで実行する必要がある場合は、それを 'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

ラムダ式からカスタム関数を作成するには、[CREATE FUNCTION](../statements/create/function.md) ステートメントを使用します。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}

### [ClickHouse Cloud におけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
