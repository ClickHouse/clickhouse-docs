---
description: '用户自定义函数（UDF）文档'
sidebar_label: 'UDF'
slug: /sql-reference/functions/udf
title: '用户自定义函数（UDF）'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 用户定义函数（UDF） {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
此功能目前在 ClickHouse Cloud 中提供私有预览。
如需开通访问权限，请通过 https://clickhouse.cloud/support 联系 ClickHouse 支持。
:::

ClickHouse 可以调用任意外部可执行程序或脚本来处理数据。

可执行用户定义函数的配置可以位于一个或多个 XML 文件中。
配置路径通过 [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 参数指定。

函数配置包含以下设置：

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                   | Required  | Default Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | 函数名称                                                                                                                                                                                                                                                                                                                                                                                      | Yes       | -                     |
| `command`                     | 要执行的脚本名称，或者在 `execute_direct` 为 false 时要执行的命令                                                                                                                                                                                                                                                                                                                             | Yes       | -                     |
| `argument`                    | 参数描述，包含参数的 `type` 以及可选的参数 `name`。每个参数在单独的配置项中描述。如果参数名称是用户定义函数序列化格式（例如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)）的一部分，则必须指定名称                                                                                                                                        | Yes       | `c` + argument_number |
| `format`                      | 向命令传递参数所使用的[格式](../../interfaces/formats.md)。命令的输出也必须使用相同的格式                                                                                                                                                                                                                                                                                                      | Yes       | -                     |
| `return_type`                 | 返回值的类型                                                                                                                                                                                                                                                                                                                                                                                  | Yes       | -                     |
| `return_name`                 | 返回值名称。如果返回名称是用户定义函数序列化格式（例如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)）的一部分，则必须指定返回名称                                                                                                                                                                                                                | Optional  | `result`              |
| `type`                        | 可执行类型。如果 `type` 设置为 `executable`，则启动单个命令；如果设置为 `executable_pool`，则创建一个命令池                                                                                                                                                                                                                                                                                  | Yes       | -                     |
| `max_command_execution_time`  | 处理一块数据的最大执行时间（秒）。此设置仅对 `executable_pool` 命令有效                                                                                                                                                                                                                                                                                                                      | Optional  | `10`                  |
| `command_termination_timeout` | 在管道关闭后，命令应在该秒数内结束。超过该时间后，将向执行该命令的进程发送 `SIGTERM`                                                                                                                                                                                                                                                                                                          | Optional  | `10`                  |
| `command_read_timeout`        | 从命令 stdout 读取数据的超时时间（毫秒）                                                                                                                                                                                                                                                                                                                                                     | Optional  | `10000`               |
| `command_write_timeout`       | 向命令 stdin 写入数据的超时时间（毫秒）                                                                                                                                                                                                                                                                                                                                                      | Optional  | `10000`               |
| `pool_size`                   | 命令池的大小                                                                                                                                                                                                                                                                                                                                                                                  | Optional  | `16`                  |
| `send_chunk_header`           | 控制在发送要处理的数据块之前是否先发送行数                                                                                                                                                                                                                                                                                                                                                    | Optional  | `false`               |
| `execute_direct`              | 如果 `execute_direct` = `1`，则会在由 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 目录中搜索 `command`。可以通过空格分隔指定额外的脚本参数，例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则将 `command` 作为参数传递给 `bin/sh -c`                                      | Optional  | `1`                   |
| `lifetime`                    | 函数的重新加载间隔（秒）。如果设置为 `0`，则函数不会被重新加载                                                                                                                                                                                                                                                                                                                                | Optional  | `0`                   |
| `deterministic`               | 是否为确定性函数（对相同输入返回相同结果）                                                                                                                                                                                                                                                                                                                                                    | Optional  | `false`               |

命令必须从 `STDIN` 读取参数，并将结果输出到 `STDOUT`。命令必须以迭代方式处理参数。也就是说，在处理完一块参数后，它必须等待下一块参数。

## 可执行用户定义函数 {#executable-user-defined-functions}

## 示例 {#examples}

### 使用内联脚本的 UDF {#udf-inline}

使用 XML 或 YAML 配置手动创建 `test_function_sum`，并将 `execute_direct` 显式设置为 `0`。

<Tabs>
  <TabItem value="XML" label="XML" default>
    文件 `test_function.xml`（在默认路径设置下路径为 `/etc/clickhouse-server/test_function.xml`）。

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
    文件 `test_function.yaml`（在默认路径设置下路径为 `/etc/clickhouse-server/test_function.yaml`）。

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

### 来自 Python 脚本的 UDF {#udf-python}

在本示例中，我们创建一个 UDF，它从 `STDIN` 读取一个值，并将其作为字符串返回。

使用 XML 或 YAML 配置创建 `test_function`。

<Tabs>
  <TabItem value="XML" label="XML" default>
    文件 `test_function.xml`（在默认路径设置下为 `/etc/clickhouse-server/test_function.xml`）。

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
    文件 `test_function.yaml`（在默认路径设置下为 `/etc/clickhouse-server/test_function.yaml`）。

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

在 `user_scripts` 目录中创建脚本文件 `test_function.py`（在默认路径设置下为 `/var/lib/clickhouse/user_scripts/test_function.py`）。

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

### 从 `STDIN` 读取两个值，并以 JSON 对象形式返回它们的和 {#udf-stdin}

使用命名参数和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式，通过 XML 或 YAML 配置创建 `test_function_sum_json`。

<Tabs>
  <TabItem value="XML" label="XML" default>
    文件 `test_function.xml`（在默认路径配置下位于 `/etc/clickhouse-server/test_function.xml`）。

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
    文件 `test_function.yaml`（在默认路径配置下位于 `/etc/clickhouse-server/test_function.yaml`）。

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

在 `user_scripts` 目录中创建脚本文件 `test_function_sum_json.py`（在默认路径配置下位于 `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`）。

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

### 在 `command` 设置中使用参数 {#udf-parameters-in-command}

可执行类型的用户自定义函数可以在 `command` 设置中接受常量参数（这仅适用于 `executable` 类型的用户自定义函数）。
还需要启用 `execute_direct` 选项，以避免出现 shell 参数展开带来的安全漏洞。

<Tabs>
  <TabItem value="XML" label="XML" default>
    文件 `test_function_parameter_python.xml`（在默认路径设置下为 `/etc/clickhouse-server/test_function_parameter_python.xml`）。

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
    文件 `test_function_parameter_python.yaml`（在默认路径设置下为 `/etc/clickhouse-server/test_function_parameter_python.yaml`）。

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

在 `user_scripts` 文件夹中创建脚本文件 `test_function_parameter_python.py`（在默认路径设置下为 `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`）。

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

### 基于 shell 脚本的 UDF {#udf-shell-script}

在本示例中，我们创建一个 shell 脚本，将每个值乘以 2。

<Tabs>
  <TabItem value="XML" label="XML" default>
    文件 `test_function_shell.xml`（默认路径为 `/etc/clickhouse-server/test_function_shell.xml`）。

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
    文件 `test_function_shell.yaml`（默认路径为 `/etc/clickhouse-server/test_function_shell.yaml`）。

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

在 `user_scripts` 文件夹中创建脚本文件 `test_shell.sh`（默认路径为 `/var/lib/clickhouse/user_scripts/test_shell.sh`）。

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

## 错误处理 {#error-handling}

如果数据无效，某些函数可能会抛出异常。
在这种情况下，查询会被取消，并向客户端返回错误信息。
对于分布式处理，当某个服务器上发生异常时，其他服务器也会尝试中止该查询。

## 参数表达式的求值 {#evaluation-of-argument-expressions}

在几乎所有编程语言中，对于某些运算符，其某个参数可能不会被求值。
常见的例子包括运算符 `&&`、`||` 和 `?:`。
在 ClickHouse 中，函数（运算符）的参数始终会被求值。
这是因为 ClickHouse 一次会对成块的列数据进行求值，而不是分别对每一行单独计算。

## 分布式查询处理中的函数执行 {#performing-functions-for-distributed-query-processing}

对于分布式查询处理，会尽可能多地在远程服务器上执行查询处理阶段，其余阶段（合并中间结果及其后的所有步骤）在请求方服务器上执行。

这意味着函数可以在不同的服务器上执行。
例如，在查询 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` 中：

- 如果 `distributed_table` 至少有两个分片，函数 `g` 和 `h` 在远程服务器上执行，而函数 `f` 在请求方服务器上执行。
- 如果 `distributed_table` 只有一个分片，则函数 `f`、`g` 和 `h` 都在该分片所在的服务器上执行。

函数的结果通常与其在哪台服务器上执行无关。但在某些情况下，这一点很重要。
例如，操作字典的函数会使用其运行所在服务器上的字典。
另一个例子是 `hostName` 函数，它返回其运行所在服务器的名称，以便在 `SELECT` 查询中按服务器进行 `GROUP BY`。

如果查询中的某个函数默认在请求方服务器上执行，但您需要在远程服务器上执行它，可以将其封装在 `any` 聚合函数中，或者将其加入到 `GROUP BY` 的键中。

## SQL 用户自定义函数 {#sql-user-defined-functions}

可以使用 [CREATE FUNCTION](../statements/create/function.md) 语句，基于 lambda 表达式创建自定义函数。要删除这些函数，请使用 [DROP FUNCTION](../statements/drop.md#drop-function) 语句。

## 相关内容 {#related-content}
- [ClickHouse Cloud 中的用户自定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
