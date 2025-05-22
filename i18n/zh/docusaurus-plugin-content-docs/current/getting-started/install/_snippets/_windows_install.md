---
null
...
---


# 在Windows上通过WSL安装ClickHouse

## 系统要求 {#requirements}

:::note
要在Windows上安装ClickHouse，您需要WSL（Windows子系统Linux）。
:::

<VerticalStepper>

## 安装WSL {#install-wsl}

以管理员身份打开Windows PowerShell并运行以下命令：

```bash
wsl --install
```

系统将提示您输入新的UNIX用户名和密码。在您输入所需的用户名和密码后，您应该会看到类似以下的消息：

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## 通过脚本使用curl安装ClickHouse {#install-clickhouse-via-script-using-curl}

运行以下命令通过脚本使用curl安装ClickHouse：

```bash
curl https://clickhouse.com/ | sh
```

如果脚本成功运行，您将看到消息：

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## 启动clickhouse-local {#start-clickhouse-local}

`clickhouse-local`允许您使用ClickHouse强大的SQL语法处理本地和远程文件，而无需配置。表数据存储在临时位置，这意味着在重启`clickhouse-local`后，先前创建的表将不再可用。

运行以下命令启动[clickhouse-local](/operations/utilities/clickhouse-local)：

```bash
./clickhouse
```

## 启动clickhouse-server {#start-clickhouse-server}

如果您希望持久化数据，您需要运行`clickhouse-server`。您可以使用以下命令启动ClickHouse服务器：

```bash
./clickhouse server
```

## 启动clickhouse-client {#start-clickhouse-client}

服务器启动后，打开一个新的终端窗口并运行以下命令以启动`clickhouse-client`：

```bash
./clickhouse client
```

您将看到类似以下内容：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

表数据存储在当前目录中，并且在ClickHouse服务器重启后仍可用。如果需要，您可以将`-C config.xml`作为附加命令行参数传递给`./clickhouse server`，并在配置文件中提供更多配置。所有可用的配置设置在[这里](/operations/server-configuration-parameters/settings)和[示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)中都有文档说明。

您现在已经准备好开始向ClickHouse发送SQL命令！

</VerticalStepper>
