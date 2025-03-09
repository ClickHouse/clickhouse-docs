---
slug: /engines/table-functions/executable
sidebar_position: 50
sidebar_label:  executable
keywords: [udf, user defined function, clickhouse, executable, table, function]
title: 'executable'
description: 'The `executable` table function creates a table based on the output of a user-defined function (UDF) that you define in a script that outputs rows to **stdout**.'
---


# UDF的 executable 表函数

`executable` 表函数根据您在脚本中定义的用户定义函数（UDF）的输出创建一个表，该脚本将行输出到 **stdout**。可执行脚本存储在 `users_scripts` 目录中，可以从任何来源读取数据。确保您的 ClickHouse 服务器安装了运行可执行脚本所需的所有软件包。例如，如果它是一个 Python 脚本，请确保服务器已安装必要的 Python 软件包。

您可以选择性地包含一个或多个输入查询，将其结果流式传输到 **stdin** 以供脚本读取。

:::note
普通 UDF 函数与 `executable` 表函数和 `Executable` 表引擎之间的一个关键优势是，普通 UDF 函数不能更改行数。例如，如果输入是 100 行，则结果必须返回 100 行。使用 `executable` 表函数或 `Executable` 表引擎时，您的脚本可以进行任何您想要的数据转换，包括复杂的聚合。
:::

## 语法 {#syntax}

`executable` 表函数需要三个参数，并接受一个可选的输入查询列表：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: 脚本的文件名，保存在 `user_scripts` 文件夹中（`user_scripts_path` 设置的默认文件夹）
- `format`: 生成表的格式
- `structure`: 生成表的表模式
- `input_query`: 一个可选查询（或查询集合），其结果通过 **stdin** 传递给脚本

:::note
如果您打算使用相同的输入查询多次调用相同的脚本，请考虑使用 [`Executable` 表引擎](../../engines/table-engines/special/executable.md)。
:::

以下 Python 脚本名为 `generate_random.py`，并保存在 `user_scripts` 文件夹中。它读取一个数字 `i`，并打印 `i` 个随机字符串，每个字符串前面都有一个用制表符分隔的数字：

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # 读取输入值
    for number in sys.stdin:
        i = int(number)

        # 生成一些随机行
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # 刷新结果到 stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

让我们调用脚本并让它生成 10 个随机字符串：

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

响应如下所示：

```response
┌─id─┬─random─────┐
│  0 │ xheXXCiSkH │
│  1 │ AqxvHAoTrl │
│  2 │ JYvPCEbIkY │
│  3 │ sWgnqJwGRm │
│  4 │ fTZGrjcLon │
│  5 │ ZQINGktPnd │
│  6 │ YFSvGGoezb │
│  7 │ QyMJJZOOia │
│  8 │ NfiyDDhmcI │
│  9 │ REJRdJpWrg │
└────┴────────────┘
```

## 设置 {#settings}

- `send_chunk_header` - 控制在发送数据块之前是否发送行数。默认值为 `false`。
- `pool_size` — 池的大小。如果指定 `0` 作为 `pool_size`，则没有池大小限制。默认值为 `16`。
- `max_command_execution_time` — 可执行脚本命令处理数据块的最大执行时间。以秒为单位。默认值为 10。
- `command_termination_timeout` — 可执行脚本应包含主要读写循环。在表函数销毁后，管道被关闭，可执行文件将有 `command_termination_timeout` 秒的时间来关闭，然后 ClickHouse 将向子进程发送 SIGTERM 信号。以秒为单位。默认值为 10。
- `command_read_timeout` - 从命令 stdout 读取数据的超时，单位为毫秒。默认值 10000。
- `command_write_timeout` - 向命令 stdin 写入数据的超时，单位为毫秒。默认值 10000。

## 将查询结果传递给脚本 {#passing-query-results-to-a-script}

务必查看 `Executable` 表引擎中的示例，了解 [如何将查询结果传递给脚本](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)。以下是如何使用 `executable` 表函数在该示例中执行相同的脚本：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
