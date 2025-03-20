---
title: 使用 clickhouse-local 数据库
sidebar_label: 使用 clickhouse-local 数据库
slug: /chdb/guides/clickhouse-local
description: 了解如何使用 chDB 中的 clickhouse-local 数据库
keywords: [chdb, clickhouse-local]
---

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个带有嵌入式 ClickHouse 版本的 CLI。
它为用户提供了 ClickHouse 的强大功能，而无需安装服务器。
在本指南中，我们将学习如何从 chDB 使用 clickhouse-local 数据库。

## 设置 {#setup}

首先，我们创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来，我们将安装 chDB。
确保您拥有 2.0.2 或更高版本：

```bash
pip install "chdb>=2.0.2"
```

现在我们将安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

我们将使用 `ipython` 运行本指南中的命令，您可以通过运行以下命令来启动它：

```bash
ipython
```

## 安装 clickhouse-local {#installing-clickhouse-local}

下载和安装 clickhouse-local 的过程与 [下载和安装 ClickHouse](/install) 相同。
我们可以通过运行以下命令来完成：

```bash
curl https://clickhouse.com/ | sh
```

要以持久化数据到目录的方式启动 clickhouse-local，我们需要传入 `--path` 选项：

```bash
./clickhouse -m --path demo.chdb
```

## 向 clickhouse-local 中导入数据 {#ingesting-data-into-clickhouse-local}

默认数据库仅在内存中存储数据，因此我们需要创建一个命名数据库，以确保我们导入的任何数据都持久化到磁盘。

```sql
CREATE DATABASE foo;
```

让我们创建一个表并插入一些随机数字：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

让我们编写一个查询以查看我们获得了什么数据：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

完成后，请确保您从 CLI 中 `exit;`，因为只有一个进程可以持有此目录的锁定。
如果不这样做，当我们尝试从 chDB 连接到数据库时，将会出现以下错误：

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## 连接到 clickhouse-local 数据库 {#connecting-to-a-clickhouse-local-database}

返回到 `ipython` Shell 并从 chDB 导入 `session` 模块：

```python
from chdb import session as chs
```

初始化指向 `demo.chdb` 的会话：

```python
sess = chs.Session("demo.chdb")
```

然后我们可以运行相同的查询来返回数字的分位数：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

我们还可以从 chDB 向此数据库插入数据：

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

然后我们可以从 chDB 或 clickhouse-local 重新运行分位数查询。
