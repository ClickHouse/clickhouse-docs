---
description: 'ユーザー定義関数（UDF）のドキュメント'
sidebar_label: 'UDF（ユーザー定義関数）'
slug: /sql-reference/functions/udf
title: 'ユーザー定義関数（UDF）'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ユーザー定義関数 (UDF) {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
この機能は ClickHouse Cloud でプライベートプレビューとしてサポートされています。
利用を希望する場合は https://clickhouse.cloud/support から ClickHouse Support にお問い合わせください。
:::

ClickHouse は、任意の外部実行可能プログラムやスクリプトを呼び出してデータを処理できます。

実行可能ユーザー定義関数の設定は、1つ以上の XML ファイルに配置できます。
設定ファイルへのパスは、パラメータ [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) で指定します。

関数の設定には、次の項目が含まれます。

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                   | Required  | Default Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | 関数名                                                                                                                                                                                                                                                                                                                                                                                        | Yes       | -                     |
| `command`                     | 実行するスクリプト名、または `execute_direct` が false の場合はコマンド                                                                                                                                                                                                                                                                                                                       | Yes       | -                     |
| `argument`                    | 引数の `type` と、任意の `name` を含む引数の説明。各引数は個別の設定で記述します。[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) など、ユーザー定義関数のフォーマットで引数名がシリアライズの一部となる場合は、name の指定が必要です                                                                                              | Yes       | `c` + argument_number |
| `format`                      | 引数をコマンドに受け渡す際に使用する [format](../../interfaces/formats.md)。コマンドの出力も同じフォーマットであることが想定されています                                                                                                                                                                                                                                                     | Yes       | -                     |
| `return_type`                 | 戻り値の型                                                                                                                                                                                                                                                                                                                                                                                    | Yes       | -                     |
| `return_name`                 | 戻り値の名前。[Native](/interfaces/formats/Native) や [JSONEachRow](/interfaces/formats/JSONEachRow) など、ユーザー定義関数のフォーマットで戻り値の名前がシリアライズの一部となる場合は、戻り値の名前の指定が必要です                                                                                                                                                                      | Optional  | `result`              |
| `type`                        | 実行タイプ。`type` が `executable` に設定されている場合は単一のコマンドが起動されます。`executable_pool` に設定されている場合はコマンドのプールが作成されます                                                                                                                                                                                                                              | Yes       | -                     |
| `max_command_execution_time`  | データブロックを処理するための最大実行時間（秒）。この設定は `executable_pool` コマンドにのみ有効です                                                                                                                                                                                                                                                                                         | Optional  | `10`                  |
| `command_termination_timeout` | パイプがクローズされた後、コマンドが終了すべき時間（秒）。この時間を過ぎると、コマンドを実行しているプロセスに `SIGTERM` が送信されます                                                                                                                                                                                                                                                         | Optional  | `10`                  |
| `command_read_timeout`        | コマンドの stdout からデータを読み取る際のタイムアウト（ミリ秒）                                                                                                                                                                                                                                                                                                                              | Optional  | `10000`               |
| `command_write_timeout`       | コマンドの stdin にデータを書き込む際のタイムアウト（ミリ秒）                                                                                                                                                                                                                                                                                                                                 | Optional  | `10000`               |
| `pool_size`                   | コマンドプールのサイズ                                                                                                                                                                                                                                                                                                                                                                        | Optional  | `16`                  |
| `send_chunk_header`           | データのチャンクを処理に送る前に行数を送信するかどうかを制御します                                                                                                                                                                                                                                                                                                                            | Optional  | `false`               |
| `execute_direct`              | `execute_direct` = `1` の場合、`command` は [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user_scripts フォルダ内から検索されます。追加のスクリプト引数は空白区切りで指定できます（例: `script_name arg1 arg2`）。`execute_direct` = `0` の場合、`command` は `bin/sh -c` への引数として渡されます | Optional  | `1`                   |
| `lifetime`                    | 関数をリロードする間隔（秒）。`0` に設定された場合、関数はリロードされません                                                                                                                                                                                                                                                                                                                 | Optional  | `0`                   |
| `deterministic`               | 関数が決定的（同じ入力に対して常に同じ結果を返す）かどうか                                                                                                                                                                                                                                                                                                                                    | Optional  | `false`               |

コマンドは `STDIN` から引数を読み込み、結果を `STDOUT` に出力しなければなりません。コマンドは引数を逐次的に処理する必要があります。つまり、あるチャンクの引数を処理した後、次のチャンクを待機しなければなりません。

## 実行可能なユーザー定義関数 {#executable-user-defined-functions}

## 例 {#examples}

### インラインスクリプトを用いた UDF {#udf-inline}

XML または YAML 設定を使用して、`execute_direct` を `0` に設定した `test_function_sum` を手動で作成します。

<Tabs>
  <TabItem value="XML" label="XML" default>
    ファイル `test_function.xml`（デフォルトのパス設定の場合は `/etc/clickhouse-server/test_function.xml`）。

    ```xml title="/etc/clickhouse-server/test_function.xml"
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
  </TabItem>

  <TabItem value="YAML" label="YAML">
    ファイル `test_function.yaml`（デフォルトのパス設定の場合は `/etc/clickhouse-server/test_function.yaml`）。

    ```yml title="/etc/clickhouse-server/test_function.yaml"
functions:
  type: executable
  name: test_function_sum
  return_type: UInt64
  argument:
    - type: UInt64
      name: lhs
    - type: UInt64
      name: rhs
  format: TabSeparated
  command: 'cd /; clickhouse-local --input-format TabSeparated --output-format TabSeparated --structure ''x UInt64, y UInt64'' --query "SELECT x + y FROM table"'
  execute_direct: 0
  deterministic: true
```
  </TabItem>
</Tabs>

<br />

```sql title="Query"
SELECT test_function_sum(2, 2);
```

```text title="Result"
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

### Python スクリプトからの UDF {#udf-python}

この例では、`STDIN` から値を読み取り、それを文字列として返す UDF を作成します。

XML または YAML のいずれかの設定で `test_function` を作成します。

<Tabs>
  <TabItem value="XML" label="XML" default>
    ファイル `test_function.xml`（デフォルトのパス設定では `/etc/clickhouse-server/test_function.xml`）。

    ```xml title="/etc/clickhouse-server/test_function.xml"
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
  </TabItem>

  <TabItem value="YAML" label="YAML">
    ファイル `test_function.yaml`（デフォルトのパス設定では `/etc/clickhouse-server/test_function.yaml`）。

    ```yml title="/etc/clickhouse-server/test_function.yaml"
functions:
  type: executable
  name: test_function_python
  return_type: String
  argument:
    - type: UInt64
      name: value
  format: TabSeparated
  command: test_function.py
```
  </TabItem>
</Tabs>

<br />

`user_scripts` ディレクトリ内にスクリプトファイル `test_function.py` を作成します（デフォルトのパス設定では `/var/lib/clickhouse/user_scripts/test_function.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

```sql title="Query"
SELECT test_function_python(toUInt64(2));
```

```text title="Result"
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

### `STDIN` から 2 つの値を読み取り、その合計を JSON オブジェクトとして返す {#udf-stdin}

XML または YAML の設定を使用して、名前付き引数を取り、フォーマットに [JSONEachRow](/interfaces/formats/JSONEachRow) を指定した `test_function_sum_json` を作成します。

<Tabs>
  <TabItem value="XML" label="XML" default>
    ファイル `test_function.xml`（パス設定がデフォルトの場合は `/etc/clickhouse-server/test_function.xml`）。

    ```xml title="/etc/clickhouse-server/test_function.xml"
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
  </TabItem>

  <TabItem value="YAML" label="YAML">
    ファイル `test_function.yaml`（パス設定がデフォルトの場合は `/etc/clickhouse-server/test_function.yaml`）。

    ```yml title="/etc/clickhouse-server/test_function.yaml"
functions:
  type: executable
  name: test_function_sum_json
  return_type: UInt64
  return_name: result_name
  argument:
    - type: UInt64
      name: argument_1
    - type: UInt64
      name: argument_2
  format: JSONEachRow
  command: test_function_sum_json.py
```
  </TabItem>
</Tabs>

<br />

`user_scripts` フォルダ内にスクリプトファイル `test_function_sum_json.py` を作成します（パス設定がデフォルトの場合は `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`）。

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

```sql title="Query"
SELECT test_function_sum_json(2, 2);
```

```text title="Result"
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

### `command` 設定でパラメータを使用する {#udf-parameters-in-command}

実行可能なユーザー定義関数は、`command` 設定で指定された定数パラメータを受け取ることができます（これは `executable` 型のユーザー定義関数でのみ動作します）。\
また、シェルによる引数展開に起因する脆弱性を防ぐために、`execute_direct` オプションが必要です。

<Tabs>
  <TabItem value="XML" label="XML" default>
    ファイル `test_function_parameter_python.xml`（デフォルトのパス設定では `/etc/clickhouse-server/test_function_parameter_python.xml`）。

    ```xml title="/etc/clickhouse-server/test_function_parameter_python.xml"
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
  </TabItem>

  <TabItem value="YAML" label="YAML">
    ファイル `test_function_parameter_python.yaml`（デフォルトのパス設定では `/etc/clickhouse-server/test_function_parameter_python.yaml`）。

    ```yml title="/etc/clickhouse-server/test_function_parameter_python.yaml"
functions:
  type: executable
  execute_direct: true
  name: test_function_parameter_python
  return_type: String
  argument:
    - type: UInt64
  format: TabSeparated
  command: test_function_parameter_python.py {test_parameter:UInt64}
```
  </TabItem>
</Tabs>

<br />

`user_scripts` フォルダ内にスクリプトファイル `test_function_parameter_python.py` を作成します（デフォルトのパス設定では `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

```sql title="Query"
SELECT test_function_parameter_python(1)(2);
```

```text title="Result"
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

### シェルスクリプトを使った UDF {#udf-shell-script}

この例では、各値を 2 倍にするシェルスクリプトを作成します。

<Tabs>
  <TabItem value="XML" label="XML" default>
    ファイル `test_function_shell.xml`（デフォルトのパス設定の場合は `/etc/clickhouse-server/test_function_shell.xml`）。

    ```xml title="/etc/clickhouse-server/test_function_shell.xml"
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
  </TabItem>

  <TabItem value="YAML" label="YAML">
    ファイル `test_function_shell.yaml`（デフォルトのパス設定の場合は `/etc/clickhouse-server/test_function_shell.yaml`）。

    ```yml title="/etc/clickhouse-server/test_function_shell.yaml"
functions:
  type: executable
  name: test_shell
  return_type: String
  argument:
    - type: UInt8
      name: value
  format: TabSeparated
  command: test_shell.sh
```
  </TabItem>
</Tabs>

<br />

`user_scripts` ディレクトリ内にスクリプトファイル `test_shell.sh` を作成します（デフォルトのパス設定の場合は `/var/lib/clickhouse/user_scripts/test_shell.sh`）。

```bash title="/var/lib/clickhouse/user_scripts/test_shell.sh"
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

```sql title="Query"
SELECT test_shell(number) FROM numbers(10);
```

```text title="Result"
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

## エラー処理 {#error-handling}

一部の関数は、データが無効な場合に例外をスローすることがあります。
この場合、クエリは中断され、エラーメッセージがクライアントに返されます。
分散処理では、いずれかのサーバーで例外が発生すると、他のサーバーもクエリの中断を試みます。

## 引数式の評価 {#evaluation-of-argument-expressions}

ほとんどのプログラミング言語では、特定の演算子において、引数の一方が評価されないことがあります。
通常、これは演算子 `&&`、`||`、および `?:` に当てはまります。
ClickHouse では、関数（演算子）の引数は常に評価されます。
これは、行ごとに個別に計算するのではなく、列の一部をまとめて一度に評価するためです。

## 分散クエリ処理における関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、クエリ処理のできるだけ多くの段階をリモートサーバー上で実行し、残りの段階（中間結果のマージとそれ以降のすべて）はリクエスト元サーバーで実行します。

つまり、関数は異なるサーバー上で実行される場合があります。
例えば、次のクエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` では、

- `distributed_table` に少なくとも 2 つのシャードがある場合、関数 `g` と `h` はリモートサーバー上で実行され、関数 `f` はリクエスト元サーバー上で実行されます。
- `distributed_table` に 1 つのシャードしかない場合、関数 `f`、`g`、`h` はすべてこのシャードのサーバー上で実行されます。

関数の結果は通常、それがどのサーバーで実行されるかには依存しません。しかし、これが重要になる場合もあります。
例えば、辞書を扱う関数は、自身が実行されているサーバー上に存在する辞書を使用します。
別の例として `hostName` 関数は、`SELECT` クエリでサーバー単位の `GROUP BY` を行えるように、自身が実行されているサーバー名を返します。

クエリ内の関数がリクエスト元サーバーで実行されるようになっていても、それをリモートサーバー上で実行する必要がある場合は、その関数を `any` 集約関数でラップするか、`GROUP BY` 句のキーに追加することができます。

## SQL ユーザー定義関数 {#sql-user-defined-functions}

ラムダ式を用いてカスタム関数を作成するには、[CREATE FUNCTION](../statements/create/function.md) ステートメントを使用します。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function) ステートメントを使用します。

## 関連コンテンツ {#related-content}
- [ClickHouse Cloudのユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
