---
null
...
---


# 使用 Docker 安装 ClickHouse

为了方便，以下是 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。可用的 Docker 镜像使用官方的 ClickHouse deb 包。

Docker 拉取命令：

```bash
docker pull clickhouse/clickhouse-server
```

## 版本 {#versions}

- `latest` 标签指向最新稳定分支的最新发布版本。
- 像 `22.2` 的分支标签指向相应分支的最新发布版本。
- 完整版本标签如 `22.2.3` 和 `22.2.3.5` 指向相应的发布版本。
- `head` 标签是从默认分支的最新提交构建的。
- 每个标签都有一个可选的 `-alpine` 后缀，以反映其基于 `alpine`。

### 兼容性 {#compatibility}

- amd64 镜像需要支持 [SSE3 指令](https://en.wikipedia.org/wiki/SSE3)。几乎所有2005年之后的 x86 CPU 都支持 SSE3。
- arm64 镜像需要支持 [ARMv8.2-A 架构](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)，并且还需要 Load-Acquire RCpc 寄存器。该寄存器在 ARMv8.2-A 版本中是可选的，在 [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) 中是强制性的。支持的设备包括 Graviton >=2、Azure 和 GCP 实例。不支持的设备示例有 Raspberry Pi 4 (ARMv8.0-A) 和 Jetson AGX Xavier/Orin (ARMv8.2-A)。
- 从 ClickHouse 24.11 开始，Ubuntu 镜像开始使用 `ubuntu:22.04` 作为基础镜像。它需要 docker 版本 >= `20.10.10`，包含 [patch](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)。作为变通方法，您可以使用 `docker run --security-opt seccomp=unconfined`，但这有安全隐患。

## 如何使用此镜像 {#how-to-use-image}

### 启动服务器实例 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下，ClickHouse 只能通过 Docker 网络访问。请参阅下面的网络部分。

默认情况下，启动的上述服务器实例将作为 `default` 用户运行，无需密码。

### 从本地客户端连接 {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# OR
docker exec -it some-clickhouse-server clickhouse-client
```

有关 ClickHouse 客户端的更多信息，请参阅 [ClickHouse 客户端](/interfaces/cli)。

### 使用 curl 连接 {#connect-to-it-using-curl}

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
预定义用户 `default` 除非设置了密码，否则没有网络访问权限，请参阅“如何在启动时创建默认数据库和用户”和下面的“管理 `default` 用户”
:::

您可以通过 [映射特定端口](https://docs.docker.com/config/containers/container-networking/) 将容器内部的 ClickHouse 公开到主机端口：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

或者通过允许容器直接使用 [主机端口](https://docs.docker.com/network/host/) 使用 `--network=host`（也可以实现更好的网络性能）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上面示例中的默认用户仅对本地请求可用
:::

### 卷 {#volumes}

通常，您可能希望在容器内部挂载以下文件夹以实现持久性：

- `/var/lib/clickhouse/` - ClickHouse 存储数据的主要文件夹
- `/var/log/clickhouse-server/` - 日志

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

您还可能希望挂载：

- `/etc/clickhouse-server/config.d/*.xml` - 带有服务器配置调整的文件
- `/etc/clickhouse-server/users.d/*.xml` - 带有用户设置调整的文件
- `/docker-entrypoint-initdb.d/` - 包含数据库初始化脚本的文件夹（见下文）。

## Linux 功能 {#linear-capabilities}

ClickHouse 有一些高级功能，这需要启用多个 [Linux 功能](https://man7.org/linux/man-pages/man7/capabilities.7.html)。

它们是可选的，可以使用以下 [docker 命令行参数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) 启用：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

有关更多信息，请参阅 [“在 Docker 中配置 CAP_IPC_LOCK 和 CAP_SYS_NICE 功能”](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)。

## 配置 {#configuration}

容器通过端口 8123 提供 [HTTP 接口](https://clickhouse.com/docs/interfaces/http_interface/)，通过端口 9000 提供 [本地客户端](https://clickhouse.com/docs/interfaces/tcp/)。

ClickHouse 配置以文件 "config.xml" 表示（[文档](https://clickhouse.com/docs/operations/configuration_files/)）。

### 使用自定义配置启动服务器实例 {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### 以自定义用户启动服务器 {#start-server-custom-user}

当您使用挂载本地目录的镜像时，您可能希望指定用户以维护正确的文件所有权。使用 `--user` 参数并挂载 `/var/lib/clickhouse` 和 `/var/log/clickhouse-server` 到容器内。否则，镜像将会提示错误并不会启动。

### 以 root 用户启动服务器 {#start-server-from-root}

以 root 用户启动服务器在启用用户命名空间的情况下非常有用。
为此运行：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 如何在启动时创建默认数据库和用户 {#how-to-create-default-db-and-user}

有时，您可能希望在容器启动时创建一个用户（默认使用名为 `default` 的用户）和数据库。您可以使用环境变量 `CLICKHOUSE_DB`，`CLICKHOUSE_USER`，`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 和 `CLICKHOUSE_PASSWORD` 来实现：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### 管理 `default` 用户 {#managing-default-user}

如果未设置 `CLICKHOUSE_USER`，`CLICKHOUSE_PASSWORD` 或 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`，则默认情况下用户 `default` 被禁用网络访问。

有一种方法可以通过将环境变量 `CLICKHOUSE_SKIP_USER_SETUP` 设置为 1 来不安全地使 `default` 用户可用：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## 如何扩展此镜像 {#how-to-extend-image}

要在基于此镜像的镜像中执行其他初始化，请在 `/docker-entrypoint-initdb.d` 下添加一个或多个 `*.sql`，`*.sql.gz` 或 `*.sh` 脚本。在入口点调用 `initdb` 后，它将运行任何 `*.sql` 文件，运行任何可执行的 `*.sh` 脚本，并源任何在该目录中找到的非可执行 `*.sh` 脚本，以便在启动服务之前进行进一步初始化。  
此外，您可以提供环境变量 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，这些将用于初始化过程中点击点击客户端。

例如，要添加另一个用户和数据库，请将以下内容添加到 `/docker-entrypoint-initdb.d/init-db.sh`：
