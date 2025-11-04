---
'description': 'UDFs 用户定义函数的文档'
'sidebar_label': 'UDF'
'slug': '/sql-reference/functions/udf'
'title': 'UDFs 用户定义函数'
'doc_type': 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 用户定义函数 (UDFs)

## 可执行用户定义函数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
此功能在 ClickHouse Cloud 中处于私有预览支持中。请联系 ClickHouse 支持以获取访问权限，网址为 https://clickhouse.cloud/support。
:::

ClickHouse 可以调用任何外部可执行程序或脚本来处理数据。

可执行用户定义函数的配置可以位于一个或多个 XML 文件中。配置的路径在 [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 参数中指定。

函数配置包含以下设置：

| 参数                          | 描述                                                                                                                                                                                                                                                                                                                                            | 必需     | 默认值               |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------------|
| `name`                        | 函数名称                                                                                                                                                                                                                                                                                                                                        | 是       | -                   |
| `command`                     | 要执行的脚本名称或如果 `execute_direct` 为 false 的命令                                                                                                                                                                                                                                                                                      | 是       | -                   |
| `argument`                    | 带有 `type` 和可选 `name` 的参数描述。每个参数在单独的设置中描述。如果参数名称是用户定义函数格式的序列化的一部分，如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)，则指定名称是必要的。                                                                                       | 是       | `c` + argument_number |
| `format`                      | 以 [format](../../interfaces/formats.md) 格式传递给命令的参数。命令输出也应使用相同的格式                                                                                                                                                                                                                                            | 是       | -                   |
| `return_type`                 | 返回值的类型                                                                                                                                                                                                                                                                                                                                    | 是       | -                   |
| `return_name`                 | 返回值的名称。如果返回名称是用户定义函数格式的序列化的一部分，如 [Native](../../interfaces/formats.md#native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)，则指定返回名称是必要的                                                                                                                                                                     | 可选     | `result`            |
| `type`                        | 可执行类型。如果 `type` 设置为 `executable`，则启动单个命令。如果设置为 `executable_pool`，则创建命令池                                                                                                                                                                                                                                          | 是       | -                   |
| `max_command_execution_time`  | 处理数据块的最大执行时间（以秒为单位）。此设置仅对 `executable_pool` 命令有效                                                                                                                                                                                                                                                                  | 可选     | `10`                |
| `command_termination_timeout` | 在命令的管道关闭后，命令应完成的时间（以秒为单位）。在该时间后，将向执行命令的进程发送 `SIGTERM`                                                                                                                                                                                                                                                | 可选     | `10`                |
| `command_read_timeout`        | 从命令标准输出读取数据的超时时间（以毫秒为单位）                                                                                                                                                                                                                                                                                              | 可选     | `10000`             |
| `command_write_timeout`       | 向命令标准输入写入数据的超时时间（以毫秒为单位）                                                                                                                                                                                                                                                                                              | 可选     | `10000`             |
| `pool_size`                   | 命令池的大小                                                                                                                                                                                                                                                                                                                                    | 可选     | `16`                |
| `send_chunk_header`           | 控制在发送数据块进行处理之前是否发送行计数                                                                                                                                                                                                                                                                                                        | 可选     | `false`             |
| `execute_direct`              | 如果 `execute_direct` = `1`，则 `command` 将在 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中查找。可以使用空格分隔符指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则 `command` 作为参数传递给 `bin/sh -c`。 | 可选     | `1`                 |
| `lifetime`                    | 函数的重载间隔（以秒为单位）。如果设置为 `0`，则不重载函数                                                                                                                                                                                                                                                                                          | 可选     | `0`                 |
| `deterministic`               | 如果函数是确定性的（对相同输入返回相同结果）                                                                                                                                                                                                                                                                                                          | 可选     | `false`             |

命令必须从 `STDIN` 读取参数，并必须将结果输出到 `STDOUT`。命令必须以迭代方式处理参数。也就是说，在处理一组参数后，必须等待下一组。

### 示例 {#examples}

**内联脚本**

创建 `test_function_sum`，手动指定 `execute_direct` 为 `0`，使用 XML 配置。
文件 `test_function.xml`（`/etc/clickhouse-server/test_function.xml`，使用默认路径设置）。

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

查询:

```sql
SELECT test_function_sum(2, 2);
```

结果:

```text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python 脚本**

从 `STDIN` 读取值并返回为字符串：

使用 XML 配置创建 `test_function`。
文件 `test_function.xml`（`/etc/clickhouse-server/test_function.xml`，使用默认路径设置）。
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

在 `user_scripts` 文件夹内的脚本文件 `test_function.py`（`/var/lib/clickhouse/user_scripts/test_function.py`，使用默认路径设置）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

查询:

```sql
SELECT test_function_python(toUInt64(2));
```

结果:

```text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

从 `STDIN` 读取两个值并作为 JSON 对象返回它们的总和：

使用命名参数和格式 [JSONEachRow](../../interfaces/formats.md#jsoneachrow) 创建 `test_function_sum_json`，使用 XML 配置。
文件 `test_function.xml`（`/etc/clickhouse-server/test_function.xml`，使用默认路径设置）。
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

在 `user_scripts` 文件夹内的脚本文件 `test_function_sum_json.py`（`/var/lib/clickhouse/user_scripts/test_function_sum_json.py`，使用默认路径设置）。

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

查询:

```sql
SELECT test_function_sum_json(2, 2);
```

结果:

```text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

在 `command` 设置中使用参数：

可执行用户定义函数可以在 `command` 设置中接收常量参数（仅适用于 `executable` 类型的用户定义函数）。这也要求 `execute_direct` 选项（以确保没有 Shell 参数扩展漏洞）。
文件 `test_function_parameter_python.xml`（`/etc/clickhouse-server/test_function_parameter_python.xml`，使用默认路径设置）。
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

在 `user_scripts` 文件夹内的脚本文件 `test_function_parameter_python.py`（`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`，使用默认路径设置）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

查询:

```sql
SELECT test_function_parameter_python(1)(2);
```

结果:

```text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**Shell 脚本**

乘以每个值的 Shell 脚本：

可执行用户定义函数可以与 Shell 脚本一起使用。
文件 `test_function_shell.xml`（`/etc/clickhouse-server/test_function_shell.xml`，使用默认路径设置）。
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

在 `user_scripts` 文件夹内的脚本文件 `test_shell.sh`（`/var/lib/clickhouse/user_scripts/test_shell.sh`，使用默认路径设置）。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

查询:

```sql
SELECT test_shell(number) FROM numbers(10);
```

结果:

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

### 错误处理 {#error-handling}

某些函数在数据无效时可能会抛出异常。在这种情况下，查询将被取消，并且错误文本将返回给客户端。对于分布式处理，当某个服务器发生异常时，其他服务器也尝试中止查询。

### 参数表达式的评估 {#evaluation-of-argument-expressions}

在几乎所有编程语言中，某些运算符可能不会评估一个参数。这通常是运算符 `&&`、`||` 和 `?:`。
但在 ClickHouse 中，函数（运算符）的参数始终被评估。这是因为整列部分是一次性评估的，而不是单独计算每一行。

### 进行分布式查询处理的函数 {#performing-functions-for-distributed-query-processing}

对于分布式查询处理，尽可能在远程服务器上执行许多查询处理阶段，其余阶段（合并中间结果及其后的所有内容）在请求服务器上执行。

这意味着函数可以在不同的服务器上执行。
例如，在查询 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- 如果 `distributed_table` 至少有两个分片，则函数 'g' 和 'h' 在远程服务器上执行，而函数 'f' 在请求服务器上执行。
- 如果 `distributed_table` 只有一个分片，则所有的 'f'、'g' 和 'h' 函数都在该分片的服务器上执行。

函数的结果通常不依赖于执行它的服务器。然而，有时这很重要。
例如，处理字典的函数使用在其运行的服务器上存在的字典。
另一个例子是 `hostName` 函数，它返回其运行的服务器名称，以便在 `SELECT` 查询中按服务器进行 `GROUP BY`。

如果查询中的函数在请求服务器上执行，但您需要在远程服务器上执行它，可以将其包装在 'any' 聚合函数中，或将其添加到 `GROUP BY` 的键中。

## SQL 用户定义函数 {#sql-user-defined-functions}

可以使用 [CREATE FUNCTION](../statements/create/function.md) 语句从 lambda 表达式创建自定义函数。要删除这些函数，请使用 [DROP FUNCTION](../statements/drop.md#drop-function) 语句。

## 相关内容 {#related-content}

### [ClickHouse Cloud 中的用户定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
