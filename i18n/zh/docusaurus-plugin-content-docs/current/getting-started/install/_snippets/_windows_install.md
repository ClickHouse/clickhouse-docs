# 在 Windows 上通过 WSL 安装 ClickHouse {#install-clickhouse-on-windows-with-wsl}

## 要求 {#requirements}

:::note
要在 Windows 上安装 ClickHouse，您需要 WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）。
:::

<VerticalStepper>

## 安装 WSL {#install-wsl}

以管理员身份打开 Windows PowerShell，并运行以下命令：

```bash
wsl --install
```

系统会提示你输入新的 UNIX 用户名和密码。输入所需的用户名和密码后，你应该会看到类似以下的消息：

```bash
欢迎使用 Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## 使用 curl 脚本安装 ClickHouse {#install-clickhouse-via-script-using-curl}

运行以下命令，通过 curl 脚本安装 ClickHouse：

```bash
curl https://clickhouse.com/ | sh
```

如果脚本运行成功，你将会看到如下消息：

```bash
成功下载 ClickHouse 二进制文件后,可通过以下方式运行:
  ./clickhouse
```

## 启动 clickhouse-local {#start-clickhouse-local}

`clickhouse-local` 可用于在无需任何配置的情况下，借助 ClickHouse 强大的 SQL 语法处理本地和远程文件。表数据会存储在临时位置，这意味着在重启 `clickhouse-local` 后，此前创建的表将不再可用。

运行以下命令以启动 [clickhouse-local](/operations/utilities/clickhouse-local)：

```bash
./clickhouse
```

## 启动 clickhouse-server {#start-clickhouse-server}

若要持久化数据，应运行 `clickhouse-server`。可以使用以下命令启动 ClickHouse 服务器：

```bash
./clickhouse server
```

## Start clickhouse-client {#start-clickhouse-client}

服务器启动并运行后,打开新的终端窗口并运行以下命令以启动 `clickhouse-client`:

```bash
./clickhouse client
```

您将看到类似如下的输出:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

表数据存储在当前目录中,ClickHouse 服务器重启后数据仍然可用。如有必要,您可以将 `-C config.xml` 作为额外的命令行参数传递给 `./clickhouse server`,并在配置文件中提供进一步的配置。所有可用的配置设置均记录在[此处](/operations/server-configuration-parameters/settings)和[示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)中。

现在您可以开始向 ClickHouse 发送 SQL 命令了!

</VerticalStepper>
