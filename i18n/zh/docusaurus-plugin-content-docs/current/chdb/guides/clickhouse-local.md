---
'title': '使用 ClickHouse 本地数据库'
'sidebar_label': '使用 ClickHouse 本地数据库'
'slug': '/chdb/guides/clickhouse-local'
'description': '学习如何在 chDB 中使用 ClickHouse 本地数据库'
'keywords':
- 'chdb'
- 'clickhouse-local'
---



[clickhouse-local](/operations/utilities/clickhouse-local) 是一个带有内嵌版本 ClickHouse 的 CLI。  
它让用户能够使用 ClickHouse 而无需安装服务器。  
在本指南中，我们将学习如何从 chDB 使用 clickhouse-local 数据库。

## Setup {#setup}

让我们首先创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

现在我们将安装 chDB。  
确保您安装的版本为 2.0.2 或更高：

```bash
pip install "chdb>=2.0.2"
```

接下来，我们要安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

我们将使用 `ipython` 来运行本指南剩余部分中的命令，您可以通过运行以下命令来启动它：

```bash
ipython
```

## Installing clickhouse-local {#installing-clickhouse-local}

下载和安装 clickhouse-local 的过程与 [下载和安装 ClickHouse](/install) 相同。  
我们可以通过运行以下命令来完成：

```bash
curl https://clickhouse.com/ | sh
```

要启动 clickhouse-local 并将数据持久化到一个目录中，我们需要传入一个 `--path`：

```bash
./clickhouse -m --path demo.chdb
```

## Ingesting data into clickhouse-local {#ingesting-data-into-clickhouse-local}

默认数据库只在内存中存储数据，因此我们需要创建一个命名数据库，以确保持久化我们导入的数据到磁盘。

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

让我们写一个查询来查看我们有什么数据：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

完成后，请确保您从 CLI `exit;` 退出，因为只有一个进程可以持有此目录的锁。  
如果我们不这样做，则在尝试从 chDB 连接到数据库时将会出现以下错误：

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## Connecting to a clickhouse-local database {#connecting-to-a-clickhouse-local-database}

返回到 `ipython` shell，并从 chDB 导入 `session` 模块：

```python
from chdb import session as chs
```

初始化一个指向 `demo..chdb` 的会话：

```python
sess = chs.Session("demo.chdb")
```

然后我们可以运行相同的查询，以获取数字的分位数：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

我们也可以从 chDB 向这个数据库插入数据：

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

然后我们可以重新运行来自 chDB 或 clickhouse-local 的分位数查询。
