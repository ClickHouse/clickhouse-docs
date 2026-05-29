---
sidebar_label: '简介'
description: '无需改写任何 SQL，即可直接从 PostgreSQL 对 ClickHouse 运行分析查询'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse'
title: 'pg_clickhouse 参考文档'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', '扩展']
---

## 简介 \{#introduction\}

[pg&#95;clickhouse] 是一个开源 PostgreSQL 扩展，可让您直接在 PostgreSQL 中运行由 ClickHouse 执行的分析查询，而无需重写任何 SQL。它支持
PostgreSQL 13 及更高版本，以及 ClickHouse v23 及更高版本。

一旦 [ClickPipes](/integrations/clickpipes) 开始将数据同步到 ClickHouse，
即可使用 pg&#95;clickhouse 快速便捷地将 [导入 foreign table] 到
PostgreSQL schema 中。随后，您便可针对这些
表运行现有的 PostgreSQL 查询，在保留现有代码库的同时将执行下推到
ClickHouse。

## 入门 \{#getting-started\}

体验 pg&#95;clickhouse 的最简单方式是使用 [Docker image]，其中包含
标准的 PostgreSQL Docker 镜像，以及 pg&#95;clickhouse 和 [re2]
扩展：

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

请参阅[教程]，开始导入 ClickHouse 表并进行
查询下推。

## 测试用例：TPC-H \{#test-case-tpc-h\}

此表比较了常规 PostgreSQL 表与连接到 ClickHouse 的 pg&#95;clickhouse 在 [TPC-H] 查询上的性能。两者均加载了缩放因子为 1 的数据；✔︎ 表示完全下推，短横线表示查询在 1 分钟后取消。所有测试均在一台配备 36 GB 内存的 MacBook Pro M4 Max 上运行。

|      查询 | PostgreSQL | pg&#95;clickhouse |  下推 |
| ------: | ---------: | ----------------: | :-: |
|  [查询 1] |    4693 ms |            268 ms |  ✔︎ |
|  [查询 2] |     458 ms |           3446 ms |     |
|  [查询 3] |     742 ms |            111 ms |  ✔︎ |
|  [查询 4] |     270 ms |            130 ms |  ✔︎ |
|  [查询 5] |     337 ms |           1460 ms |  ✔︎ |
|  [查询 6] |     764 ms |             53 ms |  ✔︎ |
|  [查询 7] |     619 ms |             96 ms |  ✔︎ |
|  [查询 8] |     342 ms |            156 ms |  ✔︎ |
|  [查询 9] |    3094 ms |            298 ms |  ✔︎ |
| [查询 10] |     581 ms |            197 ms |  ✔︎ |
| [查询 11] |     212 ms |             24 ms |     |
| [查询 12] |    1116 ms |             84 ms |  ✔︎ |
| [查询 13] |     958 ms |           1368 ms |     |
| [查询 14] |     181 ms |             73 ms |  ✔︎ |
| [查询 15] |    1118 ms |            557 ms |     |
| [查询 16] |     497 ms |           1714 ms |     |
| [查询 17] |    1846 ms |          32709 ms |     |
| [查询 18] |    5823 ms |          10649 ms |     |
| [查询 19] |      53 ms |            206 ms |  ✔︎ |
| [查询 20] |     421 ms |                 - |     |
| [查询 21] |    1349 ms |           4434 ms |     |
| [查询 22] |     258 ms |           1415 ms |     |

### 从源码编译 \{#compile-from-source\}

#### 通用 Unix \{#general-unix\}

PostgreSQL 和 curl 的开发包会将 `pg_config` 和
`curl-config` 安装到 `PATH` 中，因此你通常只需运行 `make` (或
`gmake`) ，然后执行 `make install`，再在数据库中执行
`CREATE EXTENSION pg_clickhouse`。

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

有关如何从 PostgreSQL Apt 软件源获取软件包的详细信息，请参阅 [PostgreSQL Apt]。

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

#### Red Hat / CentOS / Yum \{#redhat--centos--yum\}

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

有关如何从 PostgreSQL Yum 仓库拉取的详细信息，请参阅 [PostgreSQL Yum]。

#### 从 PGXN 安装 \{#install-from-pgxn\}

满足上述依赖项后，使用 [PGXN client] (可通过
[Homebrew]、[Apt] 以及名为 `pgxnclient` 的 Yum 软件包安装) 下载、编译
并安装 `pg_clickhouse`：

```sh
pgxn install pg_clickhouse
```

#### 编译并安装 \{#compile-and-install\}

要编译并安装 ClickHouse 库和 `pg_clickhouse`，请运行：

```sh
make
sudo make install
```

{/* XXX DSO 当前已禁用。
  默认情况下，`make` 会动态链接 `clickhouse-cpp` 库（macOS 除外，因为目前尚不支持动态 `clickhouse-cpp` 库）。如果要将 ClickHouse 库静态编译进 `pg_clickhouse`，请传入
  `CH_BUILD=static`：

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

如果宿主机上安装了多个 PostgreSQL 版本，你可能需要指定
对应版本的 `pg_config`：

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

如果主机上的 `curl-config` 不在 path 中，你可以显式指定其路径：

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

如果你遇到以下错误：

```text
"Makefile", line 8: Need an operator
```

你需要使用 GNU make；它在你的系统上很可能是以
`gmake` 的名称安装的：

```sh
gmake
gmake install
gmake installcheck
```

如果你遇到如下错误：

```text
make: pg_config: Command not found
```

请确保已安装 `pg_config`，并且它已加入你的 path。如果你是通过
RPM 等包管理系统安装 PostgreSQL 的，请确保
`-devel` 包也已安装。如有必要，请告知构建过程到何处
查找它：

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

要在 PostgreSQL 18 或更高版本中将该扩展安装到自定义前缀目录下，请将
`prefix` 参数传给 `install` (但不要传给其他 `make` 目标) ：

```sh
sudo make install prefix=/usr/local/extras
```

接着，确保以下 [`postgresql.conf`
参数]中包含该前缀：

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```

#### 测试 \{#testing\}

安装该扩展后，运行以下命令以执行测试套件

```sh
make installcheck
```

如果遇到以下错误：

```text
ERROR:  must be owner of database regression
```

你需要使用超级用户来运行测试套件，例如默认的
&quot;postgres&quot; 超级用户：

```sh
make installcheck PGUSER=postgres
```

### 加载 \{#loading\}

安装 `pg_clickhouse` 后，可以使用超级用户连接到数据库，并运行以下命令将其添加到数据库中：

```sql
CREATE EXTENSION pg_clickhouse;
```

如果你想将 `pg_clickhouse` 及其所有配套对象安装到
特定的 schema 中，可使用 `SCHEMA` 子句指定该 schema，如下所示：

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```

## 依赖项 \{#dependencies\}

`pg_clickhouse` 扩展需要 [PostgreSQL] 13 或更高版本、[libcurl] 和
[libuuid]。构建该扩展还需要 C 和 C++ 编译器、[libSSL]、[GNU
make] 以及 [CMake]。

## 路线图 \{#road-map\}

我们的首要目标是在添加 DML 功能之前，完成面向分析型工作负载的下推支持。路线图如下：

* 完成对其余 10 个尚未下推的 TPC-H 查询的最优规划
* 测试并修复 ClickBench 查询的下推
* 支持对所有 PostgreSQL 聚合函数的透明下推
* 支持对所有 PostgreSQL 函数的透明下推
* 支持通过 CREATE SERVER
  和 GUCs 配置服务器级和会话级的 ClickHouse 设置
* 支持所有 ClickHouse 数据类型
* 支持轻量级 DELETE 和 UPDATE
* 支持通过 COPY 进行批量插入
* 添加一个函数，用于执行任意 ClickHouse 查询，并将其
  结果以表的形式返回
* 支持在 UNION 查询均查询远程数据库时对其进行下推

## 作者 \{#authors\}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## 版权 \{#copyright\}

* 版权所有 (c) 2025-2026，ClickHouse
* 部分版权所有 (c) 2023-2025，Ildus Kurbangaliev
* 部分版权所有 (c) 2019-2023，Adjust GmbH
* 部分版权所有 (c) 2012-2019，PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse "GitHub 上的 pg_clickhouse"

[import foreign tables]: /cloud/managed-postgres/extensions/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "最新 Docker 发布版"

[tutorial]: /cloud/managed-postgres/extensions/pg_clickhouse/tutorial "pg_clickhouse 教程"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "PGXN Client 文档"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default "Homebrew 上的 PGXN Client"

[Apt]: https://tracker.debian.org/pkg/pgxnclient "Debian Apt 上的 PGXN Client"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL：全球最先进的开源关系型数据库"

[libcurl]: https://curl.se/libcurl/ "libcurl——您的网络传输库"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid - 与 DCE 兼容的通用唯一标识符库"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake：强大的软件构建系统"

[LibSSL]: https://openssl-library.org "OpenSSL 库"

[TPC-H]: https://www.tpc.org/tpch/

[re2]: https://github.com/ClickHouse/pg_re2 "pg_re2：使用 RE2 的 ClickHouse 兼容正则函数"

[查询 1] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/1.sql
[查询 2] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/2.sql
[查询 3] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/3.sql
[查询 4] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/4.sql
[查询 5] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/5.sql
[查询 6] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/6.sql
[查询 7] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/7.sql
[查询 8] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/8.sql
[查询 9] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/9.sql
[查询 10] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/10.sql
[查询 11] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/11.sql
[查询 12] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/12.sql
[查询 13] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/13.sql
[查询 14] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/14.sql
[查询 15] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/15.sql
[查询 16] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/16.sql
[查询 17] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/17.sql
[查询 18] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/18.sql
[查询 19] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/19.sql
[查询 20] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/20.sql
[查询 21] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/21.sql
[查询 22] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/22.sql