
# 可执行和 Exe可执行池 表引擎

`Executable` 和 `ExecutablePool` 表引擎允许您定义一个表，其行是由您定义的脚本生成的（通过写入 **stdout**）。可执行脚本存储在 `users_scripts` 目录中，可以从任何来源读取数据。

- `Executable` 表：每次查询时都会运行脚本
- `ExecutablePool` 表：维护一个持久进程池，并从池中获取进程进行读取

您可以选择性地包含一个或多个输入查询，将其结果流式传输到 **stdin** 供脚本读取。

## 创建可执行表 {#creating-an-executable-table}

`Executable` 表引擎需要两个参数：脚本的名称和传入数据的格式。您可以选择性地传递一个或多个输入查询：

```sql
Executable(script_name, format, [input_query...])
```

以下是 `Executable` 表的相关设置：

- `send_chunk_header`
    - 描述：在发送块到进程之前，发送每个块中的行数。此设置可以帮助您以更高效的方式编写脚本，以预分配一些资源
    - 默认值：false
- `command_termination_timeout`
    - 描述：命令终止超时时间（秒）
    - 默认值：10
- `command_read_timeout`
    - 描述：从命令 stdout 读取数据的超时时间（毫秒）
    - 默认值：10000
- `command_write_timeout`
    - 描述：向命令 stdin 写入数据的超时时间（毫秒）
    - 默认值：10000


我们来看一个例子。以下 Python 脚本名为 `my_script.py`，保存在 `user_scripts` 文件夹中。它读取一个数字 `i` 并打印 `i` 个随机字符串，每个字符串前面都有一个由制表符分隔的数字：

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

以下 `my_executable_table` 是基于 `my_script.py` 的输出构建的，每次您从 `my_executable_table` 运行 `SELECT` 时，会生成 10 个随机字符串：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

创建表时立即返回，不会调用脚本。查询 `my_executable_table` 会导致调用脚本：

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

## 将查询结果传递给脚本 {#passing-query-results-to-a-script}

Hacker News 网站的用户会留下评论。Python 包含一个自然语言处理工具包（`nltk`），其中有一个 `SentimentIntensityAnalyzer` 用于判断评论是积极、消极还是中立 - 包括将值分配在 -1（非常消极的评论）和 1（非常积极的评论）之间。让我们创建一个 `Executable` 表，使用 `nltk` 计算 Hacker News 评论的情感。

此示例使用描述 [这里](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset) 的 `hackernews` 表。`hackernews` 表包括一个 `id` 列，类型为 `UInt64`，并有一个名为 `comment` 的 `String` 列。让我们开始定义 `Executable` 表：

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

- 文件 `sentiment.py` 保存在 `user_scripts` 文件夹中（`user_scripts_path` 设置的默认文件夹）
- `TabSeparated` 格式意味着我们的 Python 脚本需要生成包含制表符分隔值的原始数据行
- 查询选择 `hackernews` 的两列。Python 脚本需要解析出这些列的值

以下是 `sentiment.py` 的定义：

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

关于我们的 Python 脚本的一些注释：

- 为了使其正常工作，您需要运行 `nltk.downloader.download('vader_lexicon')`。这本可以放在脚本中，但那样的话，每次在 `sentiment` 表上执行查询时都会下载，这并不高效
- 每个 `row` 的值将是 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 的结果集中的一行
- 输入行以制表符分隔，因此我们使用 Python `split` 函数解析出 `id` 和 `comment`
- `polarity_scores` 的结果是一个包含多个值的 JSON 对象。我们决定仅获取此 JSON 对象的 `compound` 值
- 请记住，ClickHouse 中的 `sentiment` 表使用 `TabSeparated` 格式，并包含两列，因此我们的 `print` 函数使用制表符分隔这些列

每次您编写从 `sentiment` 表选择行的查询时，`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 查询都会被执行，结果将传递给 `sentiment.py`。让我们测试一下：

```sql
SELECT *
FROM sentiment
```

响应看起来像：

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


## 创建可执行池表 {#creating-an-executablepool-table}

`ExecutablePool` 的语法与 `Executable` 类似，但有几个与 `ExecutablePool` 表唯一相关的设置：

- `pool_size`
    - 描述：进程池大小。如果大小为 0，则没有大小限制
    - 默认值：16
- `max_command_execution_time`
    - 描述：最大命令执行时间（秒）
    - 默认值：10

我们可以轻松地将上面的 `sentiment` 表转换为使用 `ExecutablePool` 而不是 `Executable`：

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

当您的客户端查询 `sentiment_pooled` 表时，ClickHouse 将按需维护 4 个进程。
