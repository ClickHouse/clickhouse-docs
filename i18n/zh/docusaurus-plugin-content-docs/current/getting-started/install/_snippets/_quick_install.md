
# 通过脚本使用 curl 安装 ClickHouse

如果您不需要为生产环境安装 ClickHouse，最快的设置方式是运行一个使用 curl 的安装脚本。该脚本将为您的操作系统确定一个合适的二进制文件。

<VerticalStepper>

## 使用 curl 安装 ClickHouse {#install-clickhouse-using-curl}

运行以下命令以下载适用于您的操作系统的单个二进制文件。

```bash
curl https://clickhouse.com/ | sh
```

:::note
对于 Mac 用户：如果您收到提示说无法验证二进制文件的开发者，请参见 [这里](/knowledgebase/fix-developer-verification-error-in-macos)。
:::

## 启动 clickhouse-local {#start-clickhouse-local}

`clickhouse-local` 允许您使用 ClickHouse 的强大 SQL 语法处理本地和远程文件，而无需进行配置。表数据存储在一个临时位置，这意味着在重新启动 `clickhouse-local` 后，之前创建的表将不再可用。

运行以下命令以启动 [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## 启动 clickhouse-server {#start-clickhouse-server}

如果您希望持久存储数据，需要运行 `clickhouse-server`。您可以使用以下命令启动 ClickHouse 服务器：

```bash
./clickhouse server
```

## 启动 clickhouse-client {#start-clickhouse-client}

服务器启动后，打开一个新的终端窗口，运行以下命令以启动 `clickhouse-client`：

```bash
./clickhouse client
```

您将看到类似于以下内容：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

表数据存储在当前目录中，并在 ClickHouse 服务器重新启动后仍然可用。如有必要，您可以将 `-C config.xml` 作为额外的命令行参数传递给 `./clickhouse server`，并在配置文件中提供进一步的配置。所有可用的配置设置在 [这里](/operations/server-configuration-parameters/settings) 以及在 [示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) 中有详细记录。

您现在准备开始向 ClickHouse 发送 SQL 命令了！

:::tip
[快速开始](/quick-start.mdx) 介绍了创建表和插入数据的步骤。
:::

</VerticalStepper>
