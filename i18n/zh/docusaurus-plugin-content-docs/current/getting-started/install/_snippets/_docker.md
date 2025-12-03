# 使用 Docker 安装 ClickHouse {#install-clickhouse-using-docker}

为方便起见，下面转载了 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。可用的 Docker 镜像使用的是官方提供的 ClickHouse deb 软件包。

Docker 拉取命令：

```bash
docker pull clickhouse/clickhouse-server
```


## 版本 {#versions}

- `latest` 标签指向最新稳定分支的最新发布版本。
- 像 `22.2` 这样的分支标签指向对应分支的最新发布版本。
- 像 `22.2.3` 和 `22.2.3.5` 这样的完整版本标签指向对应的发布版本。
- `head` 标签基于默认分支的最新提交构建。
- 每个标签都可以带有可选的 `-alpine` 后缀，表示它是基于 `alpine` 构建的。

### 兼容性 {#compatibility}

- `amd64` 镜像需要支持 [SSE3 指令](https://en.wikipedia.org/wiki/SSE3)。
  几乎所有 2005 年之后的 x86 CPU 都支持 SSE3。
- `arm64` 镜像需要支持 [ARMv8.2-A 架构](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)，
  以及额外的 Load-Acquire RCpc 寄存器特性。该寄存器在 ARMv8.2-A 版本中是可选的，在
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) 中是必选的。Graviton >=2、Azure 和 GCP 实例均支持。
  不受支持的设备示例包括 Raspberry Pi 4（ARMv8.0-A）和 Jetson AGX Xavier/Orin（ARMv8.2-A）。
- 从 ClickHouse 24.11 开始，Ubuntu 镜像开始使用 `ubuntu:22.04` 作为基础镜像。它需要包含此
  [补丁](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468) 的 docker 版本 >= `20.10.10`。
  作为变通方案，可以改用 `docker run --security-opt seccomp=unconfined`，但这会带来安全风险。



## 如何使用该镜像 {#how-to-use-image}

### 启动服务器实例 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下，ClickHouse 只能通过 Docker 网络访问。请参阅下方的网络配置部分。

默认情况下，上面启动的服务器实例将以无密码的 `default` 用户身份运行。

### 从原生客户端连接到它 {#connect-to-it-from-native-client}


```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# 或者 {#or}
docker exec -it some-clickhouse-server clickhouse-client
```

有关 ClickHouse 客户端的更多信息，请参阅[ClickHouse 客户端](/interfaces/cli)。

### 使用 curl 进行连接 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

有关 HTTP 接口的更多信息，请参阅 [ClickHouse HTTP 接口](/interfaces/http)。

### 停止/移除容器 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### 网络 {#networking}

:::note
预定义用户 `default` 在未设置密码之前不具备网络访问权限，
请参阅下文的「How to create default database and user on starting」和「Managing `default` user」
:::

你可以通过在 Docker 中[映射特定端口](https://docs.docker.com/config/containers/container-networking/)，
将容器内的端口绑定到宿主机的端口，从而对外暴露在 Docker 中运行的 ClickHouse：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

或者通过 `--network=host` 允许容器直接使用[主机端口](https://docs.docker.com/network/host/)（这也有助于提升网络性能）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上面示例中的用户默认配置仅适用于本机（localhost）请求
:::

### 卷（Volumes） {#volumes}

通常，为了实现持久化，你可能需要在容器内挂载以下目录：

* `/var/lib/clickhouse/` - ClickHouse 存储数据的主目录
* `/var/log/clickhouse-server/` - 日志目录

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

你可能还需要挂载：

* `/etc/clickhouse-server/config.d/*.xml` - 用于调整服务器配置的文件
* `/etc/clickhouse-server/users.d/*.xml` - 用于调整用户设置的文件
* `/docker-entrypoint-initdb.d/` - 包含数据库初始化脚本的文件夹（见下文）。


## Linux 能力 {#linear-capabilities}

ClickHouse 提供了一些高级功能，这些功能需要启用若干 [Linux 能力（capabilities）](https://man7.org/linux/man-pages/man7/capabilities.7.html)。

这些能力是可选的，可以通过以下 [Docker 命令行参数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) 启用：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

如需了解更多信息，请参阅 [&quot;在 Docker 中配置 CAP&#95;IPC&#95;LOCK 和 CAP&#95;SYS&#95;NICE 权限&quot;](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)


## 配置 {#configuration}

该容器对外暴露 8123 端口用于 [HTTP 接口](https://clickhouse.com/docs/interfaces/http_interface/)，以及 9000 端口用于 [原生客户端](https://clickhouse.com/docs/interfaces/tcp/)。

ClickHouse 的配置由名为 “config.xml” 的文件进行定义（[文档](https://clickhouse.com/docs/operations/configuration_files/)）。

### 使用自定义配置启动服务器实例 {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### 以自定义用户身份启动服务器 {#start-server-custom-user}


```bash
# $PWD/data/clickhouse 目录应存在且归当前用户所有 {#pwddataclickhouse-should-exist-and-be-owned-by-current-user}
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

当你使用挂载本地目录的镜像时，通常需要指定用户以保持正确的文件所有权。使用 `--user` 参数，并在容器内挂载 `/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。否则，镜像会报错，容器将无法启动。

### 以 root 启动服务器 {#start-server-from-root}

在启用了用户命名空间的场景下，以 root 用户身份启动服务器会很有用。
要这样做，请运行：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 如何在启动时创建默认数据库和用户 {#how-to-create-default-db-and-user}

有时你可能希望在容器启动时创建一个用户（系统默认使用名为 `default` 的用户）和一个数据库。你可以通过环境变量 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 和 `CLICKHOUSE_PASSWORD` 来实现：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### 管理 `default` 用户 {#managing-default-user}

当未设置 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 或 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 中任意一个时，`default` 用户默认禁用网络访问。

可以通过将环境变量 `CLICKHOUSE_SKIP_USER_SETUP` 设置为 1，以不安全的方式开放 `default` 用户：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## 如何扩展此镜像 {#how-to-extend-image}

要在基于本镜像的自定义镜像中执行额外的初始化操作，请在 `/docker-entrypoint-initdb.d` 目录下添加一个或多个 `*.sql`、`*.sql.gz` 或 `*.sh` 脚本。入口点脚本调用 `initdb` 之后，会运行所有 `*.sql` 文件、执行所有可执行的 `*.sh` 脚本，并对该目录中所有不可执行的 `*.sh` 脚本执行 `source` 引入操作，以在启动服务前完成进一步初始化。\
另外，你也可以提供环境变量 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，它们会在初始化期间被 clickhouse-client 使用。

例如，要添加另一个用户和数据库，请在 `/docker-entrypoint-initdb.d/init-db.sh` 中加入以下内容：

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
