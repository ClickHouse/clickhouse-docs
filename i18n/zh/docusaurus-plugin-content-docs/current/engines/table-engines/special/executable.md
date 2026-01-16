---
description: '`Executable` 和 `ExecutablePool` 表引擎允许你定义一张表，其行由你编写的脚本生成（脚本通过向 **stdout** 写入行）。'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Executable 和 ExecutablePool 表引擎'
doc_type: 'reference'
---

# Executable 和 ExecutablePool 表引擎 \{#executable-and-executablepool-table-engines\}

`Executable` 和 `ExecutablePool` 表引擎允许你定义一张表，其行由你编写的脚本生成（通过向 **stdout** 写入行）。可执行脚本存储在 `users_scripts` 目录中，并且可以从任意数据源读取数据。

* `Executable` 表：每次查询都会运行脚本
* `ExecutablePool` 表：维护一个持久进程池，并从池中获取进程来执行读取操作

你还可以选择性地添加一个或多个输入查询，将其结果以流式方式写入 **stdin**，供脚本读取。

## 创建 `Executable` 表 \{#creating-an-executable-table\}

`Executable` 表引擎需要两个参数：脚本名称和输入数据的格式。你还可以可选地传入一个或多个输入查询：

```sql
Executable(script_name, format, [input_query...])
```

以下是 `Executable` 表的相关设置：

* `send_chunk_header`
  * Description: 在发送要处理的数据块之前，先发送每个数据块中的行数。此设置可以帮助你更高效地编写脚本，从而提前预分配一些资源
  * Default value: false
* `command_termination_timeout`
  * Description: 命令终止超时时间（秒）
  * Default value: 10
* `command_read_timeout`
  * Description: 从命令 stdout 读取数据的超时时间（毫秒）
  * Default value: 10000
* `command_write_timeout`
  * Description: 向命令 stdin 写入数据的超时时间（毫秒）
  * Default value: 10000

来看一个示例。下面的 Python 脚本名为 `my_script.py`，保存在 `user_scripts` 文件夹中。它读取一个数字 `i`，并输出 `i` 个随机字符串，每个字符串前面带有一个数字，两者之间用制表符分隔：

```python
#!/usr/bin/python3

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

下面的 `my_executable_table` 是基于 `my_script.py` 的输出构建的，每次你从 `my_executable_table` 执行一次 `SELECT` 查询时，`my_script.py` 都会生成 10 个随机字符串：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

创建该表后会立即返回，不会触发脚本执行。对 `my_executable_table` 发起查询时会调用脚本：

```sql
SELECT * FROM my_executable_table
```

```response
┌─x─┬─y──────────┐
│ 0 │ BsnKBsNGNH │
│ 1 │ mgHfBCUrWM │
│ 2 │ iDQAVhlygr │
│ 3 │ uNGwDuXyCk │
│ 4 │ GcFdQWvoLB │
│ 5 │ UkciuuOTVO │
│ 6 │ HoKeCdHkbs │
│ 7 │ xRvySxqAcR │
│ 8 │ LKbXPHpyDI │
│ 9 │ zxogHTzEVV │
└───┴────────────┘
```


## 将查询结果传递给脚本 \{#passing-query-results-to-a-script\}

Hacker News 网站的用户会留下评论。Python 提供了一个自然语言处理工具包（`nltk`），其中的 `SentimentIntensityAnalyzer` 可用于判断评论是正面、负面还是中性，并为其打分，分值范围在 -1（极度负面评论）到 1（极度正面评论）之间。我们来创建一个 `Executable` 表，使用 `nltk` 计算 Hacker News 评论的情感。

本示例使用了 [此处](/engines/table-engines/mergetree-family/textindexes/#hacker-news-dataset) 描述的 `hackernews` 表。`hackernews` 表包含一个类型为 `UInt64` 的 `id` 列，以及一个名为 `comment` 的 `String` 列。我们先从定义 `Executable` 表开始：

```sql
CREATE TABLE sentiment (
   id UInt64,
   sentiment Float32
)
ENGINE = Executable(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```

关于 `sentiment` 表的一些说明：

* 文件 `sentiment.py` 保存在 `user_scripts` 文件夹中（`user_scripts_path` 配置项的默认目录）
* `TabSeparated` 格式意味着我们的 Python 脚本需要生成每行包含以制表符分隔的字段值的原始数据
* 查询从 `hackernews` 中选取两列。Python 脚本需要从输入的每一行中解析出这两列的值

下面是 `sentiment.py` 的定义：

```python
#!/usr/local/bin/python3.9

import sys
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def main():
    sentiment_analyzer = SentimentIntensityAnalyzer()

    while True:
        try:
            row = sys.stdin.readline()
            if row == '':
                break

            split_line = row.split("\t")

            id = str(split_line[0])
            comment = split_line[1]

            score = sentiment_analyzer.polarity_scores(comment)['compound']
            print(id + '\t' + str(score) + '\n', end='')
            sys.stdout.flush()
        except BaseException as x:
            break

if __name__ == "__main__":
    main()
```

关于这个 Python 脚本的一些说明：

* 要让它生效，你需要运行 `nltk.downloader.download('vader_lexicon')`。本可以把这行命令写进脚本里，但那样每次对 `sentiment` 表执行查询时都会重新下载——这并不高效
* 变量 `row` 在每次迭代时都表示以下查询结果集中的一行：`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
* 传入的行是以制表符分隔的，因此我们使用 Python 的 `split` 函数来解析出 `id` 和 `comment`
* `polarity_scores` 的结果是一个包含若干值的 JSON 对象。我们决定只获取这个 JSON 对象中的 `compound` 值
* 回忆一下，ClickHouse 中的 `sentiment` 表使用的是 `TabSeparated` 格式并包含两列，因此我们的 `print` 函数通过制表符来分隔这两列

每次你编写一个从 `sentiment` 表中选取行的查询时，都会执行 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 查询，并将结果传递给 `sentiment.py`。我们来测试一下：

```sql
SELECT *
FROM sentiment
```

返回结果如下：


```response
┌───────id─┬─sentiment─┐
│  7398199 │    0.4404 │
│ 21640317 │    0.1779 │
│ 21462000 │         0 │
│ 25168863 │         0 │
│ 25168978 │   -0.1531 │
│ 25169359 │         0 │
│ 25169394 │   -0.9231 │
│ 25169766 │    0.4137 │
│ 25172570 │    0.7469 │
│ 25173687 │    0.6249 │
│ 28291534 │         0 │
│ 28291669 │   -0.4767 │
│ 28291731 │         0 │
│ 28291949 │   -0.4767 │
│ 28292004 │    0.3612 │
│ 28292050 │    -0.296 │
│ 28292322 │         0 │
│ 28295172 │    0.7717 │
│ 28295288 │    0.4404 │
│ 21465723 │   -0.6956 │
└──────────┴───────────┘
```


## 创建 `ExecutablePool` 表 \{#creating-an-executablepool-table\}

`ExecutablePool` 的语法与 `Executable` 类似，但 `ExecutablePool` 表有几个特有的相关设置：

* `pool_size`
  * 描述：进程池大小。如果设置为 0，则表示不限制大小
  * 默认值：16
* `max_command_execution_time`
  * 描述：命令的最大执行时间（秒）
  * 默认值：10

我们可以很容易地将上面的 `sentiment` 表从使用 `Executable` 改为使用 `ExecutablePool`：

```sql
CREATE TABLE sentiment_pooled (
   id UInt64,
   sentiment Float32
)
ENGINE = ExecutablePool(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20000)
)
SETTINGS
    pool_size = 4;
```

当客户端查询 `sentiment_pooled` 表时，ClickHouse 将按需保留 4 个进程用于处理请求。
