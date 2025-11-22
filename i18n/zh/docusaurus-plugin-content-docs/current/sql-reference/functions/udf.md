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


# 用户自定义函数 (UDF) {#executable-user-defined-functions}

<PrivatePreviewBadge />

:::note
此功能在 ClickHouse Cloud 中以私有预览版形式提供支持。
如需访问权限,请通过 https://clickhouse.cloud/support 联系 ClickHouse 支持团队。
:::

ClickHouse 可以调用任何外部可执行程序或脚本来处理数据。

可执行用户自定义函数的配置可以位于一个或多个 XML 文件中。
配置路径通过 [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 参数指定。

函数配置包含以下设置:

| 参数                          | 描述                                                                                                                                                                                                                                                                                                                                                                                          | 是否必需 | 默认值                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- |
| `name`                        | 函数名称                                                                                                                                                                                                                                                                                                                                                                                      | 是       | -                     |
| `command`                     | 要执行的脚本名称,或当 `execute_direct` 为 false 时的命令                                                                                                                                                                                                                                                                                                                                      | 是       | -                     |
| `argument`                    | 参数描述,包含参数的 `type` 和可选的 `name`。每个参数在单独的设置中描述。如果参数名称是用户自定义函数格式序列化的一部分(如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)),则必须指定名称                                                                                                                                                              | 是       | `c` + argument_number |
| `format`                      | 参数传递给命令时使用的[格式](../../interfaces/formats.md)。命令输出也应使用相同的格式                                                                                                                                                                                                                                                                                                          | 是       | -                     |
| `return_type`                 | 返回值的类型                                                                                                                                                                                                                                                                                                                                                                                  | 是       | -                     |
| `return_name`                 | 返回值的名称。如果返回名称是用户自定义函数格式序列化的一部分(如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)),则必须指定返回名称                                                                                                                                                                                                                      | 可选     | `result`              |
| `type`                        | 可执行类型。如果 `type` 设置为 `executable`,则启动单个命令。如果设置为 `executable_pool`,则创建命令池                                                                                                                                                                                                                                                                                          | 是       | -                     |
| `max_command_execution_time`  | 处理数据块的最大执行时间(秒)。此设置仅对 `executable_pool` 命令有效                                                                                                                                                                                                                                                                                                                           | 可选     | `10`                  |
| `command_termination_timeout` | 命令在其管道关闭后应完成的时间(秒)。超过此时间后,将向执行命令的进程发送 `SIGTERM` 信号                                                                                                                                                                                                                                                                                                        | 可选     | `10`                  |
| `command_read_timeout`        | 从命令标准输出读取数据的超时时间(毫秒)                                                                                                                                                                                                                                                                                                                                                        | 可选     | `10000`               |
| `command_write_timeout`       | 向命令标准输入写入数据的超时时间(毫秒)                                                                                                                                                                                                                                                                                                                                                        | 可选     | `10000`               |
| `pool_size`                   | 命令池的大小                                                                                                                                                                                                                                                                                                                                                                                  | 可选     | `16`                  |
| `send_chunk_header`           | 控制在发送数据块进行处理之前是否发送行数                                                                                                                                                                                                                                                                                                                                                      | 可选     | `false`               |
| `execute_direct`              | 如果 `execute_direct` = `1`,则将在 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索 `command`。可以使用空格分隔符指定额外的脚本参数。示例:`script_name arg1 arg2`。如果 `execute_direct` = `0`,则 `command` 作为参数传递给 `bin/sh -c`                                                                      | 可选     | `1`                   |
| `lifetime`                    | 函数的重新加载间隔(秒)。如果设置为 `0`,则不重新加载函数                                                                                                                                                                                                                                                                                                                                       | 可选     | `0`                   |
| `deterministic`               | 函数是否是确定性的(对于相同的输入返回相同的结果)                                                                                                                                                                                                                                                                                                                                              | 可选     | `false`               |

命令必须从 `STDIN` 读取参数,并将结果输出到 `STDOUT`。命令必须以迭代方式处理参数,即在处理完一批参数后,必须等待下一批参数。


## 可执行用户定义函数 {#executable-user-defined-functions}


## 示例 {#examples}

### 从内联脚本创建 UDF {#udf-inline}

使用 XML 或 YAML 配置手动创建 `test_function_sum`,并将 `execute_direct` 设置为 `0`。

<Tabs>
  <TabItem value="XML" label="XML" default>
文件 `test_function.xml`(使用默认路径设置时为 `/etc/clickhouse-server/test_function.xml`)。

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

文件 `test_function.yaml`(使用默认路径设置时为 `/etc/clickhouse-server/test_function.yaml`)。

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

```sql title="查询"
SELECT test_function_sum(2, 2);
```

```text title="结果"
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

### 从 Python 脚本创建 UDF {#udf-python}

在此示例中,我们创建一个从 `STDIN` 读取值并将其作为字符串返回的 UDF。

使用 XML 或 YAML 配置创建 `test_function`。

<Tabs>
  <TabItem value='XML' label='XML' default>
    文件 `test_function.xml`(使用默认路径设置时为 `/etc/clickhouse-server/test_function.xml`)。```xml
    title="/etc/clickhouse-server/test_function.xml"
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
    文件 `test_function.yaml`(使用默认路径设置时为 `/etc/clickhouse-server/test_function.yaml`)。```yml
    title="/etc/clickhouse-server/test_function.yaml" functions: type:
    executable name: test_function_python return_type: String argument: - type:
    UInt64 name: value format: TabSeparated command: test_function.py ```
  </TabItem>
</Tabs>

<br />

在 `user_scripts` 文件夹中创建脚本文件 `test_function.py`(使用默认路径设置时为 `/var/lib/clickhouse/user_scripts/test_function.py`)。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

```sql title="查询"
SELECT test_function_python(toUInt64(2));
```

```text title="结果"
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

### 从 `STDIN` 读取两个值并将其和作为 JSON 对象返回 {#udf-stdin}

使用 XML 或 YAML 配置创建带有命名参数和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式的 `test_function_sum_json`。


<Tabs>
  <TabItem value='XML' label='XML' default>
    文件 `test_function.xml`(默认路径为 `/etc/clickhouse-server/test_function.xml`)。 ```xml
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
    文件 `test_function.yaml`(默认路径为 `/etc/clickhouse-server/test_function.yaml`)。 ```yml
    title="/etc/clickhouse-server/test_function.yaml" functions: type:
    executable name: test_function_sum_json return_type: UInt64 return_name:
    result_name argument: - type: UInt64 name: argument_1 - type: UInt64 name:
    argument_2 format: JSONEachRow command: test_function_sum_json.py ```
  </TabItem>
</Tabs>

<br />

在 `user_scripts` 文件夹中创建脚本文件 `test_function_sum_json.py`(默认路径为 `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`)。

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

```sql title="查询"
SELECT test_function_sum_json(2, 2);
```

```text title="结果"
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

### 在 `command` 设置中使用参数 {#udf-parameters-in-command}

可执行用户自定义函数可以接受在 `command` 设置中配置的常量参数(仅适用于 `executable` 类型的用户自定义函数)。
还需要启用 `execute_direct` 选项以防止 shell 参数扩展漏洞。

<Tabs>
  <TabItem value="XML" label="XML" default>
文件 `test_function_parameter_python.xml`(默认路径为 `/etc/clickhouse-server/test_function_parameter_python.xml`)。
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
文件 `test_function_parameter_python.yaml`(默认路径为 `/etc/clickhouse-server/test_function_parameter_python.yaml`)。
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

在 `user_scripts` 文件夹中创建脚本文件 `test_function_parameter_python.py`(默认路径为 `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`)。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

```sql title="查询"
SELECT test_function_parameter_python(1)(2);
```


```text title="结果"
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

### 基于 Shell 脚本的 UDF {#udf-shell-script}

在本示例中,我们创建一个 shell 脚本,将每个值乘以 2。

<Tabs>
  <TabItem value='XML' label='XML' default>
    文件 `test_function_shell.xml`
    (使用默认路径设置时为 `/etc/clickhouse-server/test_function_shell.xml`)。```xml title="/etc/clickhouse-server/test_function_shell.xml"
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
    文件 `test_function_shell.yaml`
    (使用默认路径设置时为 `/etc/clickhouse-server/test_function_shell.yaml`)。```yml title="/etc/clickhouse-server/test_function_shell.yaml"
    functions: type: executable name: test_shell return_type: String argument: -
    type: UInt8 name: value format: TabSeparated command: test_shell.sh ```
  </TabItem>
</Tabs>

<br />

在 `user_scripts` 文件夹中创建脚本文件 `test_shell.sh`(使用默认路径设置时为 `/var/lib/clickhouse/user_scripts/test_shell.sh`)。

```bash title="/var/lib/clickhouse/user_scripts/test_shell.sh"
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

```sql title="查询"
SELECT test_shell(number) FROM numbers(10);
```

```text title="结果"
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

某些函数在遇到无效数据时可能会抛出异常。
此时,查询会被取消,并向客户端返回错误信息。
在分布式处理中,当某台服务器发生异常时,其他服务器也会尝试中止该查询。


## 参数表达式的求值 {#evaluation-of-argument-expressions}

在几乎所有编程语言中,某些运算符可能不会对其中一个参数进行求值。
这通常指的是运算符 `&&`、`||` 和 `?:`。
在 ClickHouse 中,函数(运算符)的参数始终会被求值。
这是因为 ClickHouse 会一次性对整列数据进行求值,而不是逐行单独计算。


## 分布式查询处理中的函数执行 {#performing-functions-for-distributed-query-processing}

在分布式查询处理中,查询处理会尽可能多地在远程服务器上执行各个阶段,其余阶段(合并中间结果及后续所有操作)则在请求服务器上执行。

这意味着函数可以在不同的服务器上执行。

例如,在查询 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` 中:

- 如果 `distributed_table` 至少有两个分片,则函数 'g' 和 'h' 在远程服务器上执行,函数 'f' 在请求服务器上执行。
- 如果 `distributed_table` 只有一个分片,则所有 'f'、'g' 和 'h' 函数都在该分片的服务器上执行。

函数的结果通常不依赖于它在哪个服务器上执行。但有时这一点很重要。

例如,使用字典的函数会使用其运行所在服务器上的字典。

另一个例子是 `hostName` 函数,它返回其运行所在服务器的名称,以便在 `SELECT` 查询中按服务器进行 `GROUP BY`。

如果查询中的函数在请求服务器上执行,但您需要在远程服务器上执行它,可以将其包装在 'any' 聚合函数中,或将其添加到 `GROUP BY` 的键中。


## SQL 用户自定义函数 {#sql-user-defined-functions}

可以使用 [CREATE FUNCTION](../statements/create/function.md) 语句基于 lambda 表达式创建自定义函数。要删除这些函数,请使用 [DROP FUNCTION](../statements/drop.md#drop-function) 语句。


## 相关内容 {#related-content}

- [ClickHouse Cloud 中的自定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
