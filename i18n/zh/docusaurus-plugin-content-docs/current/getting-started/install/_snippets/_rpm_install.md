
# 在基于 rpm 的发行版上安装 ClickHouse {#from-rpm-packages}

> 建议使用官方预编译的 `rpm` 包来安装 **CentOS**、**RedHat** 及所有其他基于 rpm 的 
> Linux 发行版。

<VerticalStepper>

## 设置 RPM 仓库 {#setup-the-rpm-repository}

通过运行以下命令添加官方仓库：

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

对于使用 `zypper` 包管理器的系统（如 openSUSE、SLES），运行：

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

在以下步骤中，根据您使用的包管理器，可以将 `yum install` 替换为 `zypper install`。

## 安装 ClickHouse 服务器和客户端 {#install-clickhouse-server-and-client-1}

要安装 ClickHouse，运行以下命令：

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 您可以将 `stable` 替换为 `lts`，以根据您的需求使用不同的 [发行版本](/knowledgebase/production)。
- 您可以从 [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) 手动下载和安装包。
- 要指定特定版本，请在包名称的末尾添加 `-$version`，例如：

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## 启动 ClickHouse 服务器 {#start-clickhouse-server-1}

要启动 ClickHouse 服务器，请运行：

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

要启动 ClickHouse 客户端，请运行：

```sql
clickhouse-client
```

如果您为服务器设置了密码，则需要运行：

```bash
clickhouse-client --password
```

## 安装独立的 ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
在生产环境中，我们强烈建议在专用节点上运行 ClickHouse Keeper。
在测试环境中，如果您决定在同一服务器上运行 ClickHouse 服务器和 ClickHouse Keeper，
则无需单独安装 ClickHouse Keeper，因为它已包含在 ClickHouse 服务器中。
:::

要在独立的 ClickHouse Keeper 服务器上安装 `clickhouse-keeper`，请运行：

```bash
sudo yum install -y clickhouse-keeper
```

## 启用并启动 ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
