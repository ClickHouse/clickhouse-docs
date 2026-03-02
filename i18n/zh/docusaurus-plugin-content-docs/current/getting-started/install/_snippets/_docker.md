# 使用 Docker 安装 ClickHouse \{#install-clickhouse-using-docker\}

为方便起见，下面复现了 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。可用的 Docker 镜像基于官方 ClickHouse deb 软件包构建。

Docker 拉取命令：

```bash
docker pull clickhouse/clickhouse-server
```


## 版本 \{#versions\}

- `latest` 标签指向最新稳定分支的最新发行版本。
- 类似 `22.2` 的分支标签指向对应分支的最新发行版本。
- 类似 `22.2.3` 和 `22.2.3.5` 的完整版本标签指向相应的发行版本。
- `head` 标签是从默认分支的最新提交构建的。
- 每个标签都可以带有可选的 `-alpine` 后缀，表示它是基于 Alpine 构建的。

### 兼容性 \{#compatibility\}

- `amd64` 镜像需要支持 [SSE3 指令集](https://en.wikipedia.org/wiki/SSE3)。
  几乎所有 2005 年之后的 x86 CPU 都支持 SSE3。
- `arm64` 镜像需要支持 [ARMv8.2-A 架构](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)，
  并且还需要支持 Load-Acquire RCpc 寄存器。该寄存器在 ARMv8.2-A 版本中是可选的，在
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) 中则是必需的。在 Graviton >=2、Azure 和 GCP 实例中受支持。
  不受支持的设备示例包括 Raspberry Pi 4（ARMv8.0-A）以及 Jetson AGX Xavier/Orin（ARMv8.2-A）。
- 自 ClickHouse 24.11 起，Ubuntu 镜像开始使用 `ubuntu:22.04` 作为基础镜像。这要求 docker 版本 >= `20.10.10`，
  且包含该 [patch](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)。作为一种变通办法，可以改用
  `docker run --security-opt seccomp=unconfined`，但这会带来安全风险。

## 如何使用该镜像 \{#how-to-use-image\}

### 启动服务器实例 \{#start-server-instance\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下，ClickHouse 只能通过 Docker 网络访问。请参阅下方的网络设置部分。

默认情况下，前面启动的服务器实例将以 `default` 用户（无密码）身份运行。


### 使用原生客户端连接 \{#connect-to-it-from-native-client\}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

有关 ClickHouse 客户端的更多信息，请参阅 [ClickHouse 客户端](/interfaces/cli)。


### 使用 curl 进行连接 \{#connect-to-it-using-curl\}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

如需了解 HTTP 接口的更多信息，请参阅 [ClickHouse HTTP Interface](/interfaces/http)。


### 停止/移除容器 \{#stopping-removing-container\}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```


### 网络 \{#networking\}

:::note
预定义用户 `default` 在未设置密码前不具备网络访问权限，
请参见下文的 &quot;How to create default database and user on starting&quot; 和 &quot;Managing `default` user&quot;
:::

你可以通过[映射特定端口](https://docs.docker.com/config/containers/container-networking/)
将运行在 Docker 中的 ClickHouse 从容器内通过宿主机端口对外暴露：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

或者通过 `--network=host` 允许容器直接使用[主机端口](https://docs.docker.com/network/host/)
（这也有助于提升网络性能）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上述示例中的默认用户仅对来自 localhost 的请求生效
:::


### 卷（Volumes） \{#volumes\}

通常情况下，你可能希望在容器内挂载以下目录，以实现数据持久化存储：

* `/var/lib/clickhouse/` - ClickHouse 存储数据的主目录
* `/var/log/clickhouse-server/` - 日志目录

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

你可能还希望挂载：

* `/etc/clickhouse-server/config.d/*.xml` - 用于调整服务器配置的文件
* `/etc/clickhouse-server/users.d/*.xml` - 用于调整用户设置的文件
* `/docker-entrypoint-initdb.d/` - 包含数据库初始化脚本的目录（见下文）。


## Linux capabilities \{#linear-capabilities\}

ClickHouse 提供了一些高级功能，这些功能需要启用若干 [Linux capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html) 才能使用。

这些功能是可选的，可以通过以下 [Docker 命令行参数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) 启用：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

有关更多信息，请参阅[「在 Docker 中配置 CAP&#95;IPC&#95;LOCK 和 CAP&#95;SYS&#95;NICE 权限」](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)


## 配置 \{#configuration\}

该容器暴露 8123 端口用于 [HTTP 接口](https://clickhouse.com/docs/interfaces/http_interface/)，以及 9000 端口用于 [原生客户端](https://clickhouse.com/docs/interfaces/tcp/)。

ClickHouse 的配置由名为 `config.xml` 的文件表示（[文档](https://clickhouse.com/docs/operations/configuration_files/)）

### 使用自定义配置启动服务器实例 \{#start-server-instance-with-custom-config\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```


### 以自定义用户启动服务器 \{#start-server-custom-user\}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

使用挂载了本地目录的镜像启动容器时，你通常需要指定运行用户以保持正确的文件所有权。使用 `--user` 参数，并在容器内挂载 `/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。否则，容器会报错并无法启动。


### 从 root 启动服务器 \{#start-server-from-root\}

在启用了用户命名空间的情况下，从 root 启动服务器会很有用。
要实现这一点，请运行：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```


### 如何在启动时创建默认数据库和用户 \{#how-to-create-default-db-and-user\}

有时可能希望在容器启动时创建一个用户（默认使用名为 `default` 的用户）和一个数据库。可以通过设置环境变量 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 和 `CLICKHOUSE_PASSWORD` 来实现：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```


#### 管理 `default` 用户 \{#managing-default-user\}

如果未设置 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 或 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 中任意一个，`default` 用户默认禁用网络访问。

可以通过将环境变量 `CLICKHOUSE_SKIP_USER_SETUP` 设置为 1，使 `default` 用户在不安全的情况下对外开放：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## 如何扩展此镜像 \{#how-to-extend-image\}

要在基于此镜像构建的派生镜像中执行额外的初始化操作，请在 `/docker-entrypoint-initdb.d` 目录下添加一个或多个 `*.sql`、`*.sql.gz` 或 `*.sh` 脚本。入口点脚本调用 `initdb` 之后，会运行该目录中所有的 `*.sql` 文件、执行所有具有可执行权限的 `*.sh` 脚本，并通过 `source` 加载所有不可执行的 `*.sh` 脚本，以在启动服务之前执行进一步的初始化。

:::note
`/docker-entrypoint-initdb.d` 目录下的脚本会按照文件名的**字母顺序**执行。如果脚本之间存在依赖关系（例如，一个创建视图的脚本必须在创建被引用表的脚本之后运行），请确保文件名的排序顺序正确。
:::

此外，你还可以提供环境变量 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，它们会在初始化期间被 clickhouse-client 使用。

例如，要添加另一个用户和数据库，请将以下内容添加到 `/docker-entrypoint-initdb.d/init-db.sh` 中：

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
