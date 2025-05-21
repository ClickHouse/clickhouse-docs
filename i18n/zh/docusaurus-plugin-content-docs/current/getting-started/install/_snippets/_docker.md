---
{}
---




# 使用 Docker 安装 ClickHouse

为了方便起见，下面重复了 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。可用的 Docker 镜像使用官方的 ClickHouse deb 包。

Docker 拉取命令：

```bash
docker pull clickhouse/clickhouse-server
```

## 版本 {#versions}

- `latest` 标签指向最新稳定分支的最新发布版本。
- 像 `22.2` 这样的分支标签指向对应分支的最新发布版本。
- 完整版本标签如 `22.2.3` 和 `22.2.3.5` 指向相应的发布版本。
- 标签 `head` 是从默认分支的最新提交构建的。
- 每个标签都有一个可选的 `-alpine` 后缀，表示它是基于 `alpine` 构建的。

### 兼容性 {#compatibility}

- amd64 镜像要求支持 [SSE3 指令](https://en.wikipedia.org/wiki/SSE3)。几乎所有 2005 年之后的 x86 CPU 都支持 SSE3。
- arm64 镜像要求支持 [ARMv8.2-A 架构](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)，并且额外需要 Load-Acquire RCpc 寄存器。该寄存器在 ARMv8.2-A 版本中是可选的，而在 [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) 中是强制性的。支持的实例包括 Graviton >=2、Azure 和 GCP 实例。未受支持的设备示例包括 Raspberry Pi 4 (ARMv8.0-A) 和 Jetson AGX Xavier/Orin (ARMv8.2-A)。
- 从 ClickHouse 24.11 开始，Ubuntu 镜像开始使用 `ubuntu:22.04` 作为基础镜像。它需要 docker 版本 >= `20.10.10`，包含 [补丁](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)。作为变通，您可以使用 `docker run --security-opt seccomp=unconfined`，但这会带来安全隐患。

## 如何使用此镜像 {#how-to-use-image}

### 启动服务器实例 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下，ClickHouse 只能通过 Docker 网络访问。请参见下面的网络部分。

默认情况下，启动上述服务器实例将以 `default` 用户身份运行，不需要密码。

### 从本地客户端连接 {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# OR
docker exec -it some-clickhouse-server clickhouse-client
```

有关 ClickHouse 客户端的更多信息，请参见 [ClickHouse 客户端](/interfaces/cli)。

### 使用 curl 连接 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

有关 HTTP 接口的更多信息，请参见 [ClickHouse HTTP 接口](/interfaces/http)。

### 停止/删除容器 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### 网络 {#networking}

:::note
预定义用户 `default` 默认没有网络访问权限，除非设置密码，请参见“启动时如何创建默认数据库和用户”和下面的“管理 `default` 用户”。
:::

您可以通过 [映射特定端口](https://docs.docker.com/config/containers/container-networking/) 将运行在 docker 中的 ClickHouse 暴露出来：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

或者通过允许容器直接使用 [主机端口](https://docs.docker.com/network/host/) 使用 `--network=host`（这也能实现更好的网络性能）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上述示例中的默认用户仅对本地主机请求可用。
:::

### 卷 {#volumes}

通常，您可能希望挂载以下文件夹到您的容器中以实现持久性：

- `/var/lib/clickhouse/` - ClickHouse 存储数据的主要文件夹
- `/var/log/clickhouse-server/` - 日志

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

您可能还希望挂载：

- `/etc/clickhouse-server/config.d/*.xml` - 带有服务器配置调整的文件
- `/etc/clickhouse-server/users.d/*.xml` - 带有用户设置调整的文件
- `/docker-entrypoint-initdb.d/` - 带有数据库初始化脚本的文件夹（见下文）。

## Linux 能力 {#linear-capabilities}

ClickHouse 具有一些高级功能，这需要启用几个 [Linux 能力](https://man7.org/linux/man-pages/man7/capabilities.7.html)。

这些能力是可选的，可以通过以下 [docker 命令行参数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) 启用：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

有关更多信息，请参见 [“在 Docker 中配置 CAP_IPC_LOCK 和 CAP_SYS_NICE 能力”](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)。

## 配置 {#configuration}

该容器公开端口 8123 用于 [HTTP 接口](https://clickhouse.com/docs/interfaces/http_interface/)，并且端口 9000 用于 [本地客户端](https://clickhouse.com/docs/interfaces/tcp/)。

ClickHouse 配置以文件 "config.xml" 表示 ([文档](https://clickhouse.com/docs/operations/configuration_files/))。

### 使用自定义配置启动服务器实例 {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### 以自定义用户启动服务器 {#start-server-custom-user}

当您使用带有本地目录挂载的镜像时，您可能希望指定用户以维护适当的文件所有权。使用 `--user` 参数，并在容器内挂载 `/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。否则，镜像会抱怨并无法启动。

### 以 root 启动服务器 {#start-server-from-root}

从 root 启动服务器在用户命名空间启用的情况下非常有用。
要实现这一点，请运行：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 启动时如何创建默认数据库和用户 {#how-to-create-default-db-and-user}

有时您可能希望在容器启动时创建一个用户（默认使用 `default` 用户）和数据库。您可以使用环境变量 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 和 `CLICKHOUSE_PASSWORD` 来实现：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### 管理 `default` 用户 {#managing-default-user}

如果没有设置 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 或 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`，则用户 `default` 默认禁用网络访问。

可以通过将环境变量 `CLICKHOUSE_SKIP_USER_SETUP` 设置为 1 来不安全地使 `default` 用户可用：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## 如何扩展此镜像 {#how-to-extend-image}

要在从此镜像派生的镜像中执行额外的初始化，请在 `/docker-entrypoint-initdb.d` 下添加一个或多个 `*.sql`、`*.sql.gz` 或 `*.sh` 脚本。在入口点调用 `initdb` 后，它将运行任何 `*.sql` 文件，执行任何可执行的 `*.sh` 脚本，并在启动服务之前源检索该目录中找到的任何非可执行 `*.sh` 脚本以进行进一步初始化。  
此外，您可以提供环境变量 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，将在初始化期间用于 clickhouse-client。

例如，要添加另一个用户和数据库，可以将以下内容添加到 `/docker-entrypoint-initdb.d/init-db.sh`：
