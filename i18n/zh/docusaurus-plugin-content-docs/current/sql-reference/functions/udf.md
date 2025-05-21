---
'description': 'Documentation for UDFs User Defined Functions'
'sidebar_label': 'UDF'
'sidebar_position': 15
'slug': '/sql-reference/functions/udf'
'title': 'UDFs User Defined Functions'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 用户定义函数 UDFs

## 可执行用户定义函数 {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
此功能在 ClickHouse Cloud 中支持私有预览。请联系 ClickHouse 支持以获取访问权限，网址为 https://clickhouse.cloud/support。
:::

ClickHouse 可以调用任何外部可执行程序或脚本来处理数据。

可执行用户定义函数的配置可以位于一个或多个 XML 文件中。配置的路径在 [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 参数中指定。

函数配置包含以下设置：

- `name` - 函数名称。
- `command` - 要执行的脚本名称或如果 `execute_direct` 为 false 时的命令。
- `argument` - 带有 `type` 和可选 `name` 的参数描述。每个参数在单独的设置中描述。如果参数名称是用户定义函数格式的序列化的一部分（如 [Native](/interfaces/formats/Native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)），则必须指定名称。默认参数名称值为 `c` + argument_number。
- `format` - 传递给命令的 [格式](../../interfaces/formats.md)。
- `return_type` - 返回值的类型。
- `return_name` - 返回值的名称。如果返回名称是用户定义函数格式序列化的一部分（如 [Native](../../interfaces/formats.md#native) 或 [JSONEachRow](/interfaces/formats/JSONEachRow)），则需要指定返回名称。可选。默认值为 `result`。
- `type` - 可执行类型。如果 `type` 设置为 `executable`，则启动单一命令。如果设置为 `executable_pool`，则创建命令池。
- `max_command_execution_time` - 处理数据块的最大执行时间（以秒为单位）。此设置仅对 `executable_pool` 命令有效。可选。默认值为 `10`。
- `command_termination_timeout` - 命令关闭其管道后应在多长时间内完成（以秒为单位）。超过该时间后，将向执行命令的进程发送 `SIGTERM`。可选。默认值为 `10`。
- `command_read_timeout` - 从命令标准输出读取数据的超时时间（以毫秒为单位）。默认值为 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时时间（以毫秒为单位）。默认值为 10000。可选参数。
- `pool_size` - 命令池的大小。可选。默认值为 `16`。
- `send_chunk_header` - 控制在发送数据块以进行处理之前是否发送行计数。可选。默认值为 `false`。
- `execute_direct` - 如果 `execute_direct` = `1`，则会在 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索 `command`。可以使用空格分隔符指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `1`。可选参数。
- `lifetime` - 函数的重载间隔（以秒为单位）。如果设置为 `0`，则函数不重新加载。默认值为 `0`。可选参数。
- `deterministic` - 如果函数是确定性的（对相同输入返回相同结果）。默认值为 `false`。可选参数。

命令必须从 `STDIN` 读取参数，并将结果输出到 `STDOUT`。命令必须以迭代方式处理参数。也就是说，在处理一组参数后，它必须等待下一组参数。

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

查询：

```sql
SELECT test_function_sum(2, 2);
```

结果：

```text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python 脚本**

从 `STDIN` 中读取一个值，并将其作为字符串返回：

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

在 `user_scripts` 文件夹中的脚本文件 `test_function.py`（`/var/lib/clickhouse/user_scripts/test_function.py`，使用默认路径设置）。

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

查询：

```sql
SELECT test_function_python(toUInt64(2));
```

结果：

```text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

从 `STDIN` 中读取两个值并将它们的和作为 JSON 对象返回：

使用 XML 配置创建 `test_function_sum_json`，带有命名参数和格式 [JSONEachRow](../../interfaces/formats.md#jsoneachrow)。
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

在 `user_scripts` 文件夹中的脚本文件 `test_function_sum_json.py`（`/var/lib/clickhouse/user_scripts/test_function_sum_json.py`，使用默认路径设置）。

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

查询：

```sql
SELECT test_function_sum_json(2, 2);
```

结果：

```text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

在 `command` 设置中使用参数：

可执行用户定义函数可以在 `command` 设置中使用配置的常量参数（仅适用于 `executable` 类型的用户定义函数）。这同样要求 `execute_direct` 选项（以确保没有 shell 参数扩展漏洞）。
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

在 `user_scripts` 文件夹中的脚本文件 `test_function_parameter_python.py`（`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`，使用默认路径设置）。

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

查询：

```sql
SELECT test_function_parameter_python(1)(2);
```

结果：

```text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**Shell 脚本**

将每个值乘以 2 的 Shell 脚本：

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

在 `user_scripts` 文件夹中的脚本文件 `test_shell.sh`（`/var/lib/clickhouse/user_scripts/test_shell.sh`，使用默认路径设置）。

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

查询：

```sql
SELECT test_shell(number) FROM numbers(10);
```

结果：

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

某些函数在数据无效时可能会抛出异常。在这种情况下，查询被取消，错误文本将返回给客户端。对于分布式处理，当一个服务器上发生异常时，其他服务器也尝试中止查询。

### 参数表达式的评估 {#evaluation-of-argument-expressions}

在几乎所有编程语言中，有时某个参数可能不会被某些运算符评估。这通常是运算符 `&&`、`||` 和 `?:`。但是在 ClickHouse 中，函数（运算符）的参数始终会被评估。这是因为整个列部分是一次性评估的，而不是单独计算每一行。

### 进行分布式查询处理的函数 {#performing-functions-for-distributed-query-processing}

对于分布式查询处理，尽可能多的查询处理阶段在远程服务器上进行，其余阶段（合并中间结果以及之后的一切）在请求服务器上进行。

这意味着函数可以在不同的服务器上执行。
例如，在查询 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- 如果 `distributed_table` 至少有两个分片，则在远程服务器上执行函数 'g' 和 'h'，在请求服务器上执行函数 'f'。
- 如果 `distributed_table` 只有一个分片，则所有的 'f'、'g' 和 'h' 函数都在该分片的服务器上执行。

函数的结果通常不依赖于在哪个服务器上执行。然而，有时这很重要。
例如，处理字典的函数使用运行时所在的服务器上存在的字典。
另一个例子是 `hostName` 函数，该函数返回运行时服务器的名称，以便在 `SELECT` 查询中按服务器进行 `GROUP BY`。

如果查询中的函数在请求服务器上执行，但需要在远程服务器上执行，则可以将其包装在 'any' 聚合函数中或将其添加到 `GROUP BY` 的键中。

## SQL 用户定义函数 {#sql-user-defined-functions}

可以使用 [CREATE FUNCTION](../statements/create/function.md) 语句从 lambda 表达式创建自定义函数。要删除这些函数，请使用 [DROP FUNCTION](../statements/drop.md#drop-function) 语句。

## 相关内容 {#related-content}

### [ClickHouse Cloud 中的用户定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
