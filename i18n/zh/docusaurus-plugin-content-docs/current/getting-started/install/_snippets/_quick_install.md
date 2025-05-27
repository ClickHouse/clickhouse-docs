---
null
...
---


# 使用 curl 脚本安装 ClickHouse

如果您不需要为生产环境安装 ClickHouse，最快的方式是使用 curl 运行安装脚本。该脚本将为您的操作系统确定合适的二进制文件。

<VerticalStepper>

## 使用 curl 安装 ClickHouse {#install-clickhouse-using-curl}

运行以下命令下载适合您的操作系统的单个二进制文件。

```bash
curl https://clickhouse.com/ | sh
```

:::note
对于 Mac 用户：如果您收到无法验证二进制文件开发者的错误，请参见 [这里](/knowledgebase/fix-developer-verification-error-in-macos)。
:::

## 启动 clickhouse-local {#start-clickhouse-local}

`clickhouse-local` 允许您使用 ClickHouse 强大的 SQL 语法处理本地和远程文件，无需配置。表数据存储在临时位置，这意味着在重启 `clickhouse-local` 后，先前创建的表将不再可用。

运行以下命令启动 [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## 启动 clickhouse-server {#start-clickhouse-server}

如果您希望持久化数据，您需要运行 `clickhouse-server`。您可以使用以下命令启动 ClickHouse 服务器：

```bash
./clickhouse server
```

## 启动 clickhouse-client {#start-clickhouse-client}

服务器运行后，打开一个新的终端窗口并运行以下命令启动 `clickhouse-client`：

```bash
./clickhouse client
```

您将看到类似这样的内容：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

表数据存储在当前目录中，并且在 ClickHouse 服务器重启后仍然可用。如果需要，您可以将 `-C config.xml` 作为额外的命令行参数传递给 `./clickhouse server`，并在配置文件中提供进一步的配置。所有可用的配置设置都在 [这里](/operations/server-configuration-parameters/settings) 和 [示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) 中有详细记录。

您现在准备开始向 ClickHouse 发送 SQL 命令了!

:::tip
[快速开始](/quick-start.mdx) 介绍了创建表和插入数据的步骤。
:::

</VerticalStepper>
