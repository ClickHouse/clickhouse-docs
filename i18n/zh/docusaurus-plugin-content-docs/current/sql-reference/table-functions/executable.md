---
description: '`executable` 表函数会基于用户自定义函数 (UDF) 的输出创建一张表，该函数在脚本中定义，并将行写到 **stdout**。'
keywords: ['udf', 'user defined function', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---

# 用于 UDF 的 `executable` 表函数 {#executable-table-function-for-udfs}

`executable` 表函数会基于用户自定义函数（UDF）的输出创建一张表，该函数定义在一个向 **stdout** 输出行的脚本中。可执行脚本存储在 `users_scripts` 目录中，并且可以从任意数据源读取数据。请确保你的 ClickHouse 服务器具备运行该可执行脚本所需的全部软件包。例如，如果这是一个 Python 脚本，则要确保服务器已经安装了所需的 Python 包。

你可以选择性地提供一个或多个输入查询，将其结果以流式方式写入 **stdin**，供脚本读取。

:::note
普通 UDF 函数与 `executable` 表函数和 `Executable` 表引擎之间的一个关键区别在于，普通 UDF 函数不能改变行数。例如，如果输入是 100 行，则结果也必须返回 100 行。使用 `executable` 表函数或 `Executable` 表引擎时，你的脚本可以执行任意所需的数据转换，包括复杂聚合。
:::

## 语法 {#syntax}

`executable` 表函数需要三个参数，并且可以接收一个可选的输入查询列表：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

* `script_name`: 脚本的文件名。保存在 `user_scripts` 文件夹中（即 `user_scripts_path` 设置的默认文件夹）
* `format`: 生成表的格式
* `structure`: 生成表的表结构（schema）
* `input_query`: 可选查询（或查询集合），其结果通过 **stdin** 传递给脚本

:::note
如果你要使用相同的输入查询重复调用同一个脚本，建议使用 [`Executable` 表引擎](../../engines/table-engines/special/executable.md)。
:::

下面的 Python 脚本名为 `generate_random.py`，保存在 `user_scripts` 文件夹中。它读取一个数字 `i` 作为输入，并输出 `i` 个随机字符串，每个字符串前面带有一个数字，二者之间用制表符分隔：

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Read input value
    for number in sys.stdin:
        i = int(number)

        # Generate some random rows
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Flush results to stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

我们来调用该脚本，让它生成 10 个随机字符串：

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

响应结果如下：

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

- `send_chunk_header` - 控制在发送要处理的数据块之前，是否先发送行数。默认值为 `false`。
- `pool_size` — 连接池大小。如果 `pool_size` 指定为 0，则不限制连接池大小。默认值为 `16`。
- `max_command_execution_time` — 处理数据块时，可执行脚本命令的最大执行时间。以秒为单位指定。默认值为 10。
- `command_termination_timeout` — 可执行脚本应包含主读写循环。在表函数被销毁后，管道会被关闭，可执行文件有 `command_termination_timeout` 秒的时间完成关闭，然后 ClickHouse 会向子进程发送 SIGTERM 信号。以秒为单位指定。默认值为 10。
- `command_read_timeout` - 从命令的 stdout 读取数据的超时时间，单位为毫秒。默认值为 10000。
- `command_write_timeout` - 向命令的 stdin 写入数据的超时时间，单位为毫秒。默认值为 10000。

## 将查询结果传递给脚本 {#passing-query-results-to-a-script}

请务必查看 `Executable` 表引擎中关于[如何将查询结果传递给脚本](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)的示例。下面展示如何使用 `executable` 表函数来执行该示例中相同的脚本：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
