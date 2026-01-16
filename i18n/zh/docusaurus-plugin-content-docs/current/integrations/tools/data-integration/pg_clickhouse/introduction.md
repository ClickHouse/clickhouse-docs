---
sidebar_label: '简介'
description: '直接在 PostgreSQL 中对 ClickHouse 运行分析型查询，而无需重写任何 SQL 语句'
slug: '/integrations/pg_clickhouse'
title: 'pg_clickhouse 参考文档'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部数据封装器', 'pg_clickhouse', '扩展']
---

# pg_clickhouse \{#pg_clickhouse\}

## 介绍 \\{#introduction\\}

[pg_clickhouse] 是一个开源的 PostgreSQL 扩展，可以直接从 PostgreSQL 在 ClickHouse 上运行分析查询，而无需重写任何 SQL。它支持 PostgreSQL 13 及以上版本，以及 ClickHouse v23 及以上版本。

一旦 [ClickPipes](/integrations/clickpipes) 开始将数据同步到 ClickHouse 后，即可使用 pg_clickhouse 快速、轻松地将 [外部表导入] 到 PostgreSQL 的某个模式（schema）中。然后即可在这些表上运行现有的 PostgreSQL 查询，在将执行下推到 ClickHouse 的同时，保留你现有的代码库。

## 入门 \{#getting-started\}

试用 pg&#95;clickhouse 最简单的方法是使用 [Docker image]，它
基于标准 PostgreSQL Docker 镜像，并已包含 pg&#95;clickhouse 扩展：

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

请参阅 [tutorial]，开始导入 ClickHouse 表并启用查询下推。


## 测试用例：TPC-H \\{#test-case-tpc-h\\}

下表对比了在缩放因子为 1 时，[TPC-H] 查询在常规 PostgreSQL 表与通过 pg_clickhouse 连接到 ClickHouse 的表上的性能表现；✔︎ 表示查询实现了完全下推，而短横线表示查询在 1 分钟后被取消。所有测试均在一台配备 36 GB 内存的 MacBook Pro M4 Max 上运行。

<!-- cd dev/tpch && make ch && make pg && make run -->

|    查询    | PostgreSQL | pg_clickhouse |  下推情况  |
| ----------:| ----------:| -------------:|:--------:|
|  [查询 1]  |    4693 ms |        268 ms |     ✔︎    |
|  [查询 2]  |     458 ms |       3446 ms |          |
|  [查询 3]  |     742 ms |        111 ms |     ✔︎    |
|  [查询 4]  |     270 ms |        130 ms |     ✔︎    |
|  [查询 5]  |     337 ms |       1460 ms |     ✔︎    |
|  [查询 6]  |     764 ms |         53 ms |     ✔︎    |
|  [查询 7]  |     619 ms |         96 ms |     ✔︎    |
|  [查询 8]  |     342 ms |        156 ms |     ✔︎    |
|  [查询 9]  |    3094 ms |        298 ms |     ✔︎    |
| [查询 10]  |     581 ms |        197 ms |     ✔︎    |
| [查询 11]  |     212 ms |         24 ms |     ✔︎    |
| [查询 12]  |    1116 ms |         84 ms |     ✔︎    |
| [查询 13]  |     958 ms |       1368 ms |          |
| [查询 14]  |     181 ms |         73 ms |     ✔︎    |
| [查询 15]  |    1118 ms |        557 ms |          |
| [查询 16]  |     497 ms |       1714 ms |          |
| [查询 17]  |    1846 ms |      32709 ms |          |
| [查询 18]  |    5823 ms |      10649 ms |          |
| [查询 19]  |      53 ms |        206 ms |     ✔︎    |
| [查询 20]  |     421 ms |             - |          |
| [查询 21]  |    1349 ms |       4434 ms |          |
| [查询 22]  |     258 ms |       1415 ms |          |

### 从源代码编译 \\{#compile-from-source\\}

#### 通用 Unix \\{#general-unix\\}

PostgreSQL 和 curl 的开发包会将 `pg_config` 和
`curl-config` 安装到 PATH 中，因此你只需运行 `make`（或
`gmake`），然后运行 `make install`，接着在数据库中执行
`CREATE EXTENSION pg_clickhouse` 即可。

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

请参阅 [PostgreSQL Apt]，了解如何从 PostgreSQL Apt 软件源获取软件的详细说明。

```sh
sudo apt install \
  postgresql-server-18 \
  libcurl4-openssl-dev \
  uuid-dev \
  libssl-dev \
  make \
  cmake \
  g++
```


#### RedHat / CentOS / Yum \{#redhat--centos--yum\}

```sh
sudo yum install \
  postgresql-server \
  libcurl-devel \
  libuuid-devel \
  openssl-libs \
  automake \
  cmake \
  gcc
```

有关如何从 PostgreSQL Yum 仓库拉取软件包的详细信息，请参阅 [PostgreSQL Yum]。


#### 从 PGXN 安装 \{#install-from-pgxn\}

在满足上述依赖后，使用 [PGXN client]（可通过
[Homebrew]、[Apt] 和 Yum 获取，软件包名为 `pgxnclient`）下载、编译
并安装 `pg_clickhouse`：

```sh
pgxn install pg_clickhouse
```


#### 编译和安装 \{#compile-and-install\}

要构建并安装 ClickHouse 库和 `pg_clickhouse`，请运行：

```sh
make
sudo make install
```

{/* XXX DSO currently disabled.
  默认情况下，`make` 会以动态方式链接 `clickhouse-cpp` 库（macOS 除外，因为目前尚不支持动态版的 `clickhouse-cpp` 库）。若要将 ClickHouse 库静态编译进 `pg_clickhouse`，请传入
  `CH_BUILD=static` 参数：

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

如果你的主机上安装了多个 PostgreSQL，你可能需要指定对应版本的 `pg_config`：

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

如果在你的主机上 `curl-config` 不在 PATH 中，可以显式指定其路径：

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

如果遇到如下所示的错误：

```text
"Makefile", line 8: Need an operator
```

你需要使用 GNU make，它在你的系统中通常会以 `gmake` 的名称安装：

```sh
gmake
gmake install
gmake installcheck
```

如果遇到如下错误：

```text
make: pg_config: Command not found
```

请确保已安装 `pg_config` 并且它已加入你的 `PATH` 环境变量。如果你使用诸如 RPM 之类的软件包管理系统来安装 PostgreSQL，请确认同时安装了 `-devel` 包。如有必要，请告知构建过程到哪里去查找它：

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

要在 PostgreSQL 18 或更高版本上将该扩展安装到自定义前缀目录中，请在执行 `install` 目标时传递 `prefix` 参数（但不要在任何其他 `make` 目标中使用该参数）：

```sh
sudo make install prefix=/usr/local/extras
```

然后确保在下列 [`postgresql.conf` 参数] 中包含该前缀：

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```


#### 测试 \{#testing\}

安装扩展后，如需运行测试套件，请执行：

```sh
make installcheck
```

如果遇到类似下述错误：

```text
ERROR:  must be owner of database regression
```

需要使用超级用户来运行测试套件，例如默认的 “postgres” 超级用户账户：

```sh
make installcheck PGUSER=postgres
```


### 加载 \{#loading\}

安装好 `pg_clickhouse` 之后，可以以超级用户身份连接到目标数据库，并运行以下命令将其添加进去：

```sql
CREATE EXTENSION pg_clickhouse;
```

如果要将 `pg_clickhouse` 及其所有辅助对象安装到特定的 schema 中，请使用 `SCHEMA` 子句来指定该 schema，如下所示：

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```


## 依赖项 \\{#dependencies\\}

`pg_clickhouse` 扩展依赖 [PostgreSQL] 13 或更高版本、[libcurl] 和 [libuuid]。构建该扩展需要 C 和 C++ 编译器、[libSSL]、[GNU make] 和 [CMake]。

## Road Map \\{#road-map\\}

我们当前的首要任务是在添加 DML 功能之前，先完成对分析型工作负载的下推覆盖率。我们的路线图：

*   让剩余的 10 个尚未下推的 TPC-H 查询都能够获得最优执行计划
*   测试并修复 ClickBench 查询的下推
*   支持对所有 PostgreSQL 聚合函数的透明下推
*   支持对所有 PostgreSQL 函数的透明下推
*   允许通过 CREATE SERVER 和 GUC 在服务器级和会话级配置 ClickHouse 设置
*   支持所有 ClickHouse 数据类型
*   支持轻量级 DELETE 和 UPDATE
*   通过 COPY 支持批量插入
*   添加一个函数，用于执行任意 ClickHouse 查询并将其结果作为表返回
*   在所有子查询都访问远程数据库时，添加对 UNION 查询下推的支持

## 作者 \\{#authors\\}

*   [David E. Wheeler](https://justatheory.com/)
*   [Ildus Kurbangaliev](https://github.com/ildus)
*   [Ibrar Ahmed](https://github.com/ibrarahmad)

## 版权 \\{#copyright\\}

*   Copyright (c) 2025-2026，ClickHouse
*   部分版权 (c) 2023-2025，Ildus Kurbangaliev
*   部分版权 (c) 2019-2023，Adjust GmbH
*   部分版权 (c) 2012-2019，PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse
    "GitHub 上的 pg_clickhouse"

[import foreign tables]: /integrations/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "最新 Docker 发布版本"

[tutorial]: /integrations/pg_clickhouse/tutorial "pg_clickhouse 教程"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "PGXN client 文档"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default
    "Homebrew 上的 PGXN client"

[Apt]: https://tracker.debian.org/pkg/pgxnclient
    "Debian Apt 上的 PGXN client"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL：全球最先进的开源关系型数据库"

[libcurl]: https://curl.se/libcurl/ "libcurl — 网络传输库"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid - 与 DCE 兼容的通用唯一标识符库"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake：强大的软件构建系统"

[LibSSL]: https://openssl-library.org "OpenSSL 库"

[TPC-H]: https://www.tpc.org/tpch/

[查询 1] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/1.sql
  [查询 2] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/2.sql
  [查询 3] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/3.sql
  [查询 4] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/4.sql
  [查询 5] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/5.sql
  [查询 6] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/6.sql
  [查询 7] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/7.sql
  [查询 8] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/8.sql
  [查询 9] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/9.sql
  [查询 10] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/10.sql
  [查询 11] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/11.sql
  [查询 12] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/12.sql
  [查询 13] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/13.sql
  [查询 14] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/14.sql
  [查询 15] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/15.sql
  [查询 16] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/16.sql
  [查询 17] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/17.sql
  [查询 18] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/18.sql
  [查询 19] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/19.sql
  [查询 20] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/20.sql
  [查询 21] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/21.sql
  [查询 22] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/22.sql