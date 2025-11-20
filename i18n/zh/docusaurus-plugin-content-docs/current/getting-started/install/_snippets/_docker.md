# 使用 Docker 安装 ClickHouse

为方便起见，下面重现了 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。可用的 Docker 镜像基于官方的 ClickHouse deb 软件包构建。

Docker 拉取命令：

```bash
docker pull clickhouse/clickhouse-server
```


## 版本 {#versions}

- `latest` 标签指向最新稳定分支的最新发布版本。
- 分支标签(如 `22.2`)指向对应分支的最新发布版本。
- 完整版本标签(如 `22.2.3` 和 `22.2.3.5`)指向对应的发布版本。
- `head` 标签基于默认分支的最新提交构建。
- 每个标签都有一个可选的 `-alpine` 后缀,表示该镜像基于 `alpine` 构建。

### 兼容性 {#compatibility}

- amd64 镜像需要支持 [SSE3 指令集](https://en.wikipedia.org/wiki/SSE3)。
  2005 年之后的几乎所有 x86 CPU 都支持 SSE3。
- arm64 镜像需要支持 [ARMv8.2-A 架构](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A),
  以及 Load-Acquire RCpc 寄存器。该寄存器在 ARMv8.2-A 版本中为可选,在
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) 中为必需。Graviton >=2、Azure 和 GCP 实例支持该架构。
  不支持的设备示例包括 Raspberry Pi 4(ARMv8.0-A)和 Jetson AGX Xavier/Orin(ARMv8.2-A)。
- 从 ClickHouse 24.11 开始,Ubuntu 镜像使用 `ubuntu:22.04` 作为基础镜像。这需要 Docker 版本 >= `20.10.10`,
  其中包含此[补丁](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)。作为替代方案,您可以
  使用 `docker run --security-opt seccomp=unconfined`,但这存在安全风险。


## 如何使用此镜像 {#how-to-use-image}

### 启动服务器实例 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下,ClickHouse 仅可通过 Docker 网络访问。详见下文网络配置部分。

默认情况下,启动上述服务器实例时将以 `default` 用户身份运行,且无需密码。

### 从原生客户端连接 {#connect-to-it-from-native-client}


```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# 或
docker exec -it some-clickhouse-server clickhouse-client
```

有关 ClickHouse 客户端的更多信息,请参阅 [ClickHouse 客户端](/interfaces/cli)。

### 使用 curl 连接 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

有关 HTTP 接口的更多信息,请参阅 [ClickHouse HTTP 接口](/interfaces/http)。

### 停止/删除容器 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### 网络配置 {#networking}

:::note
预定义用户 `default` 在未设置密码的情况下无法进行网络访问,
请参阅下文的"启动时如何创建默认数据库和用户"以及"管理 `default` 用户"
:::

您可以通过使用主机端口[映射特定端口](https://docs.docker.com/config/containers/container-networking/)的方式,将运行在 Docker 中的 ClickHouse 暴露出来:

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

或者通过使用 `--network=host` 允许容器[直接使用主机端口](https://docs.docker.com/network/host/)
(这也能获得更好的网络性能):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上述示例中的 default 用户仅可用于 localhost 请求
:::

### 数据卷 {#volumes}

通常您可能需要在容器内挂载以下文件夹以实现数据持久化:

- `/var/lib/clickhouse/` - ClickHouse 存储数据的主文件夹
- `/var/log/clickhouse-server/` - 日志文件

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

您可能还需要挂载:

- `/etc/clickhouse-server/config.d/*.xml` - 服务器配置调整文件
- `/etc/clickhouse-server/users.d/*.xml` - 用户设置调整文件
- `/docker-entrypoint-initdb.d/` - 数据库初始化脚本文件夹(见下文)。


## Linux capabilities {#linear-capabilities}

ClickHouse 的某些高级功能需要启用若干 [Linux capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)

这些 capabilities 是可选的,可以通过以下 [docker 命令行参数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)启用:

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

更多信息请参阅 ["在 Docker 中配置 CAP_IPC_LOCK 和 CAP_SYS_NICE Capabilities"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)


## 配置 {#configuration}

该容器开放端口 8123 用于 [HTTP 接口](https://clickhouse.com/docs/interfaces/http_interface/),开放端口 9000 用于[原生客户端](https://clickhouse.com/docs/interfaces/tcp/)。

ClickHouse 的配置通过 "config.xml" 文件进行管理([文档](https://clickhouse.com/docs/operations/configuration_files/))

### 使用自定义配置启动服务器实例 {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### 以自定义用户身份启动服务器 {#start-server-custom-user}


```bash
# $PWD/data/clickhouse 应当存在且归当前用户所有
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

当使用挂载了本地目录的镜像时,您可能需要指定用户以保持正确的文件所有权。请使用 `--user` 参数并在容器内挂载 `/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。否则,镜像将报错并无法启动。

### 以 root 身份启动服务器 {#start-server-from-root}

在启用了用户命名空间的情况下,以 root 身份启动服务器会很有用。
执行以下命令:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 如何在启动时创建默认数据库和用户 {#how-to-create-default-db-and-user}

有时您可能希望在容器启动时创建用户(默认使用名为 `default` 的用户)和数据库。您可以通过环境变量 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 和 `CLICKHOUSE_PASSWORD` 来实现:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### 管理 `default` 用户 {#managing-default-user}

当未设置 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 或 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 时,`default` 用户默认禁用网络访问。

可以通过将环境变量 `CLICKHOUSE_SKIP_USER_SETUP` 设置为 1 来以不安全的方式启用 `default` 用户:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## 如何扩展此镜像 {#how-to-extend-image}

要在基于此镜像的派生镜像中执行额外的初始化操作,请在 `/docker-entrypoint-initdb.d` 目录下添加一个或多个 `*.sql`、`*.sql.gz` 或 `*.sh` 脚本。入口点调用 `initdb` 后,会在启动服务前依次运行该目录中的所有 `*.sql` 文件、执行所有可执行的 `*.sh` 脚本,并 source 所有不可执行的 `*.sh` 脚本,以完成进一步的初始化。
此外,您还可以提供环境变量 `CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`,它们将在初始化期间供 clickhouse-client 使用。

例如,要添加另一个用户和数据库,请将以下内容添加到 `/docker-entrypoint-initdb.d/init-db.sh`:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
