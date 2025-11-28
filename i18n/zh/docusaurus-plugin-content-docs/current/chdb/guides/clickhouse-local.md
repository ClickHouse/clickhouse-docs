---
title: '使用 clickhouse-local 数据库'
sidebar_label: '使用 clickhouse-local 数据库'
slug: /chdb/guides/clickhouse-local
description: '了解如何在 chDB 中使用 clickhouse-local 数据库'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个内置 ClickHouse 的命令行工具（CLI）。
它让用户无需安装服务器就能使用 ClickHouse 的强大功能。
在本指南中，我们将学习如何在 chDB 中使用 clickhouse-local 数据库。



## 设置

我们首先创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来我们来安装 chDB。
请确保使用的是 2.0.2 或更高版本：

```bash
pip install "chdb>=2.0.2"
```

接下来我们要安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

在本指南的后续内容中，我们将使用 `ipython` 来运行命令，你可以通过执行以下命令来启动它：

```bash
ipython
```


## 安装 clickhouse-local

下载并安装 clickhouse-local 与[下载并安装 ClickHouse](/install) 的步骤相同。
我们可以通过运行以下命令来完成安装：

```bash
curl https://clickhouse.com/ | sh
```

要启动 clickhouse-local 并将数据持久化到某个目录，需要传入一个 `--path` 参数：

```bash
./clickhouse -m --path demo.chdb
```


## 将数据摄取到 clickhouse-local 中

默认数据库只在内存中存储数据，因此我们需要创建一个命名数据库，以确保我们摄取的任何数据都会持久化到磁盘。

```sql
CREATE DATABASE foo;
```

让我们创建一个表并插入一些随机数：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

我们来写一个查询，看看现在有哪些数据：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

完成上述操作后，务必在 CLI 中执行 `exit;` 退出，因为同一时间只有一个进程可以对该目录加锁。
如果不这样做，当我们尝试从 chDB 连接到数据库时，就会遇到如下错误：

```text
ChdbError: 代码：76. DB::Exception: 无法锁定文件 demo.chdb/status。同一目录下已有另一个服务器实例正在运行。(CANNOT_OPEN_FILE)
```


## 连接到 clickhouse-local 数据库

回到 `ipython` shell，并从 chDB 中导入 `session` 模块：

```python
from chdb import session as chs
```

初始化指向 `demo..chdb` 的会话：

```python
sess = chs.Session("demo.chdb")
```

接下来，我们可以运行相同的查询来返回这些数值的分位数：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

第 1 行:
──────
quants: [0,9976599,2147776478,4209286886]
```

我们也可以从 chDB 向该数据库插入数据：

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

然后我们可以在 chDB 或 clickhouse-local 中重新运行 quantiles 查询。
