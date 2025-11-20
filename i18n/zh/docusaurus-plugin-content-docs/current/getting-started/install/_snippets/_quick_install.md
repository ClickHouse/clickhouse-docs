# 使用 curl 脚本安装 ClickHouse

如果您无需在生产环境中安装 ClickHouse,最快捷的方式是使用 curl 运行安装脚本。该脚本会自动为您的操作系统选择合适的二进制文件。

<VerticalStepper>


## 使用 curl 安装 ClickHouse {#install-clickhouse-using-curl}

运行以下命令以下载适用于您操作系统的单个二进制文件。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Mac 用户注意:如果遇到无法验证二进制文件开发者的错误,请参阅[此处](/knowledgebase/fix-developer-verification-error-in-macos)。
:::


## 启动 clickhouse-local {#start-clickhouse-local}

`clickhouse-local` 允许您使用 ClickHouse 强大的 SQL 语法处理本地和远程文件,无需配置。 表数据存储在临时位置,这意味着重启 `clickhouse-local` 后,之前创建的表将不再可用。

运行以下命令启动 [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```


## 启动 clickhouse-server {#start-clickhouse-server}

如果您希望持久化数据,则需要运行 `clickhouse-server`。可以使用以下命令启动 ClickHouse 服务器:

```bash
./clickhouse server
```


## 启动 clickhouse-client {#start-clickhouse-client}

服务器启动并运行后,打开一个新的终端窗口并运行以下命令来启动 `clickhouse-client`:

```bash
./clickhouse client
```

您将看到类似以下的输出:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

表数据存储在当前目录中,ClickHouse 服务器重启后数据仍然可用。如有必要,您可以在执行 `./clickhouse server` 时通过 `-C config.xml` 参数指定配置文件,以提供更多配置选项。所有可用的配置设置都记录在[此处](/operations/server-configuration-parameters/settings)以及[示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)中。

现在您可以开始向 ClickHouse 发送 SQL 命令了!

:::tip
[快速入门](/get-started/quick-start)将引导您完成创建表和插入数据的步骤。
:::

</VerticalStepper>
