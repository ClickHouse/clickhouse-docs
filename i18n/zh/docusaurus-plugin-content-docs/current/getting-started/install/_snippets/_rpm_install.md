---
null
...
---


# 在基于rpm的发行版上安装ClickHouse {#from-rpm-packages}

> 建议使用官方预编译的 `rpm` 软件包来安装 **CentOS**、**RedHat** 以及其他所有基于rpm的 
> Linux 发行版。

<VerticalStepper>

## 设置RPM仓库 {#setup-the-rpm-repository}

通过运行以下命令添加官方仓库：

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

对于使用 `zypper` 包管理器的系统（如openSUSE，SLES），请运行：

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

在下面的步骤中，`yum install` 可以根据您使用的包管理器替换为 `zypper install`。

## 安装ClickHouse服务器和客户端 {#install-clickhouse-server-and-client-1}

要安装ClickHouse，运行以下命令：

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 您可以将 `stable` 替换为 `lts`，以根据您的需求使用不同的 [发布类型](/knowledgebase/production)。
- 您可以从 [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) 手动下载和安装软件包。
- 要指定特定版本，请在软件包名称的末尾添加 `-$version`，例如：

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## 启动ClickHouse服务器 {#start-clickhouse-server-1}

要启动ClickHouse服务器，请运行：

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

要启动ClickHouse客户端，请运行：

```sql
clickhouse-client
```

如果您为服务器设置了密码，则需要运行：

```bash
clickhouse-client --password
```

## 安装独立的ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
在生产环境中，我们强烈建议在专用节点上运行ClickHouse Keeper。
在测试环境中，如果您决定在同一服务器上运行ClickHouse Server和ClickHouse Keeper，则无需安装ClickHouse Keeper，因为它已包含在ClickHouse服务器中。
:::

要在独立的ClickHouse Keeper服务器上安装 `clickhouse-keeper`，请运行：

```bash
sudo yum install -y clickhouse-keeper
```

## 启用并启动ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
