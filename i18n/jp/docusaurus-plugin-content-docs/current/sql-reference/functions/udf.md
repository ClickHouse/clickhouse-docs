---
description: 'ユーザー定義関数 (UDF) に関するドキュメント'
sidebar_label: 'UDF'
slug: /sql-reference/functions/udf
title: 'ユーザー定義関数 (UDF)'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ユーザー定義関数（UDF） {#executable-user-defined-functions}

<PrivatePreviewBadge />

:::note
この機能はClickHouse Cloudのプライベートプレビューでサポートされています。
アクセスするには、https://clickhouse.cloud/support からClickHouseサポートにお問い合わせください。
:::

ClickHouseは、データを処理するために任意の外部実行可能プログラムまたはスクリプトを呼び出すことができます。

実行可能なユーザー定義関数の設定は、1つ以上のXMLファイルに配置できます。
設定へのパスは、[`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config)パラメータで指定されます。

関数の設定には、以下の設定が含まれます:

| パラメータ                     | 説明                                                                                                                                                                                                                                                                                                                                                                                   | 必須 | デフォルト値         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- |
| `name`                        | 関数名                                                                                                                                                                                                                                                                                                                                                                                               | はい      | -                     |
| `command`                     | 実行するスクリプト名、または`execute_direct`がfalseの場合のコマンド                                                                                                                                                                                                                                                                                                                                | はい      | -                     |
| `argument`                    | 引数の`type`と、オプションの引数の`name`を含む引数の説明。各引数は個別の設定で記述されます。[Native](/interfaces/formats/Native)や[JSONEachRow](/interfaces/formats/JSONEachRow)のようなユーザー定義関数フォーマットのシリアライゼーションに引数名が含まれる場合、名前の指定が必要です                                                             | はい      | `c` + argument_number |
| `format`                      | コマンドに引数を渡す際の[フォーマット](../../interfaces/formats.md)。コマンドの出力も同じフォーマットを使用することが期待されます                                                                                                                                                                                                                                                                                                                               | はい      | -                     |
| `return_type`                 | 戻り値の型                                                                                                                                                                                                                                                                                                                                                                                  | はい      | -                     |
| `return_name`                 | 戻り値の名前。[Native](/interfaces/formats/Native)や[JSONEachRow](/interfaces/formats/JSONEachRow)のようなユーザー定義関数フォーマットのシリアライゼーションに戻り値の名前が含まれる場合、戻り値の名前の指定が必要です                                                                                                                                                                              | オプション | `result`              |
| `type`                        | 実行可能な型。`type`が`executable`に設定されている場合、単一のコマンドが起動されます。`executable_pool`に設定されている場合、コマンドのプールが作成されます                                                                                                                                                                                                                                     | はい      | -                     |
| `max_command_execution_time`  | データブロックを処理する際の最大実行時間(秒単位)。この設定は`executable_pool`コマンドに対してのみ有効です                                                                                                                                                                                                                                                                                     | オプション | `10`                  |
| `command_termination_timeout` | パイプが閉じられた後、コマンドが終了すべき時間(秒単位)。この時間が経過すると、コマンドを実行しているプロセスに`SIGTERM`が送信されます                                                                                                                                                                                                                                         | オプション | `10`                  |
| `command_read_timeout`        | コマンドの標準出力からデータを読み取る際のタイムアウト(ミリ秒単位)                                                                                                                                                                                                                                                                                                                                  | オプション | `10000`               |
| `command_write_timeout`       | コマンドの標準入力にデータを書き込む際のタイムアウト(ミリ秒単位)                                                                                                                                                                                                                                                                                                                                     | オプション | `10000`               |
| `pool_size`                   | コマンドプールのサイズ                                                                                                                                                                                                                                                                                                                                                                    | オプション | `16`                  |
| `send_chunk_header`           | 処理するデータのチャンクを送信する前に行数を送信するかどうかを制御します                                                                                                                                                                                                                                                                                                                  | オプション | `false`               |
| `execute_direct`              | `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます | オプション | `1`                   |
| `lifetime`                    | 関数の再読み込み間隔(秒単位)。`0`に設定されている場合、関数は再読み込みされません                                                                                                                                                                                                                                                                                           | オプション | `0`                   |
| `deterministic`               | 関数が決定的であるかどうか(同じ入力に対して同じ結果を返す)                                                                                                                                                                                                                                                                                                                                 | オプション | `false`               |

コマンドは`STDIN`から引数を読み取り、結果を`STDOUT`に出力する必要があります。コマンドは引数を反復的に処理する必要があります。つまり、引数のチャンクを処理した後、次のチャンクを待つ必要があります。


## 実行可能ユーザー定義関数 {#executable-user-defined-functions}


## 例 {#examples}

### インラインスクリプトからのUDF {#udf-inline}

XMLまたはYAML設定を使用して、`execute_direct`を`0`に手動で指定し、`test_function_sum`を作成します。

<Tabs>
  <TabItem value="XML" label="XML" default>
ファイル`test_function.xml`(デフォルトのパス設定では`/etc/clickhouse-server/test_function.xml`)。

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

ファイル`test_function.yaml`(デフォルトのパス設定では`/etc/clickhouse-server/test_function.yaml`)。

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

```sql title="クエリ"
SELECT test_function_sum(2, 2);
```

```text title="結果"
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

### PythonスクリプトからのUDF {#udf-python}

この例では、`STDIN`から値を読み取り、文字列として返すUDFを作成します。

XMLまたはYAML設定を使用して`test_function`を作成します。

<Tabs>
  <TabItem value='XML' label='XML' default>
    ファイル`test_function.xml`(デフォルトのパス設定では`/etc/clickhouse-server/test_function.xml`)。
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
  <TabItem value='YAML' label='YAML'>
    ファイル`test_function.yaml`(デフォルトのパス設定では`/etc/clickhouse-server/test_function.yaml`)。
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

`user_scripts`フォルダ内にスクリプトファイル`test_function.py`を作成します(デフォルトのパス設定では`/var/lib/clickhouse/user_scripts/test_function.py`)。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

```sql title="クエリ"
SELECT test_function_python(toUInt64(2));
```

```text title="結果"
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

### `STDIN`から2つの値を読み取り、その合計をJSONオブジェクトとして返す {#udf-stdin}

XMLまたはYAML設定を使用して、名前付き引数と[JSONEachRow](/interfaces/formats/JSONEachRow)形式で`test_function_sum_json`を作成します。


<Tabs>
  <TabItem value='XML' label='XML' default>
    ファイル `test_function.xml`(デフォルトのパス設定では `/etc/clickhouse-server/test_function.xml`)。 ```xml
    title="/etc/clickhouse-server/test_function.xml"
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
  <TabItem value='YAML' label='YAML'>
    ファイル `test_function.yaml`(デフォルトのパス設定では `/etc/clickhouse-server/test_function.yaml`)。 ```yml
    title="/etc/clickhouse-server/test_function.yaml" functions: type:
    executable name: test_function_sum_json return_type: UInt64 return_name:
    result_name argument: - type: UInt64 name: argument_1 - type: UInt64 name:
    argument_2 format: JSONEachRow command: test_function_sum_json.py ```
  </TabItem>
</Tabs>

<br />

`user_scripts` フォルダ内にスクリプトファイル `test_function_sum_json.py` を作成します(デフォルトのパス設定では `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`)。

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

実行可能なユーザー定義関数は、`command` 設定で構成された定数パラメータを受け取ることができます(これは `executable` タイプのユーザー定義関数でのみ動作します)。
また、シェル引数展開の脆弱性を防ぐために `execute_direct` オプションが必要です。

<Tabs>
  <TabItem value="XML" label="XML" default>
ファイル `test_function_parameter_python.xml`(デフォルトのパス設定では `/etc/clickhouse-server/test_function_parameter_python.xml`)。
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
ファイル `test_function_parameter_python.yaml`(デフォルトのパス設定では `/etc/clickhouse-server/test_function_parameter_python.yaml`)。
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

`user_scripts` フォルダ内にスクリプトファイル `test_function_parameter_python.py` を作成します(デフォルトのパス設定では `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`)。

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


```text title="結果"
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

### シェルスクリプトからのUDF {#udf-shell-script}

この例では、各値を2倍にするシェルスクリプトを作成します。

<Tabs>
  <TabItem value='XML' label='XML' default>
    ファイル `test_function_shell.xml`
    (デフォルトのパス設定では `/etc/clickhouse-server/test_function_shell.xml`)。 ```xml title="/etc/clickhouse-server/test_function_shell.xml"
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
  <TabItem value='YAML' label='YAML'>
    ファイル `test_function_shell.yaml`
    (デフォルトのパス設定では `/etc/clickhouse-server/test_function_shell.yaml`)。 ```yml title="/etc/clickhouse-server/test_function_shell.yaml"
    functions: type: executable name: test_shell return_type: String argument: -
    type: UInt8 name: value format: TabSeparated command: test_shell.sh ```
  </TabItem>
</Tabs>

<br />

`user_scripts` フォルダ内にスクリプトファイル `test_shell.sh` を作成します(デフォルトのパス設定では `/var/lib/clickhouse/user_scripts/test_shell.sh`)。

```bash title="/var/lib/clickhouse/user_scripts/test_shell.sh"
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

```sql title="クエリ"
SELECT test_shell(number) FROM numbers(10);
```

```text title="結果"
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

データが無効な場合、一部の関数は例外をスローすることがあります。
この場合、クエリはキャンセルされ、エラーメッセージがクライアントに返されます。
分散処理において、いずれかのサーバーで例外が発生した場合、他のサーバーもクエリの中止を試みます。


## 引数式の評価 {#evaluation-of-argument-expressions}

ほぼすべてのプログラミング言語において、特定の演算子では引数の一部が評価されないことがあります。
通常、これは `&&`、`||`、`?:` などの演算子に該当します。
ClickHouseでは、関数(演算子)の引数は常に評価されます。
これは、各行を個別に計算するのではなく、カラム全体が一度に評価されるためです。


## 分散クエリ処理における関数の実行 {#performing-functions-for-distributed-query-processing}

分散クエリ処理では、クエリ処理の段階をできるだけ多くリモートサーバー上で実行し、残りの段階(中間結果のマージおよびそれ以降の処理)をリクエスト元サーバー上で実行します。

つまり、関数は異なるサーバー上で実行される可能性があります。
例えば、クエリ `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` では、

- `distributed_table` が少なくとも2つのシャードを持つ場合、関数 'g' と 'h' はリモートサーバー上で実行され、関数 'f' はリクエスト元サーバー上で実行されます。
- `distributed_table` が1つのシャードのみを持つ場合、'f'、'g'、'h' のすべての関数がこのシャードのサーバー上で実行されます。

通常、関数の結果はどのサーバー上で実行されるかに依存しません。ただし、これが重要になる場合もあります。
例えば、ディクショナリを使用する関数は、実行されているサーバー上に存在するディクショナリを使用します。
別の例として、`hostName` 関数があります。この関数は、`SELECT` クエリ内でサーバーごとに `GROUP BY` を行うために、実行されているサーバーの名前を返します。

クエリ内の関数がリクエスト元サーバー上で実行されるが、リモートサーバー上で実行する必要がある場合は、'any' 集約関数でラップするか、`GROUP BY` のキーに追加することができます。


## SQLユーザー定義関数 {#sql-user-defined-functions}

ラムダ式を使用したカスタム関数は、[CREATE FUNCTION](../statements/create/function.md)ステートメントで作成できます。これらの関数を削除するには、[DROP FUNCTION](../statements/drop.md#drop-function)ステートメントを使用します。


## 関連コンテンツ {#related-content}

- [ClickHouse Cloudのユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
