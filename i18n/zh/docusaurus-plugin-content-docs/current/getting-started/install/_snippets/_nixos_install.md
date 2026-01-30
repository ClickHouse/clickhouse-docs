# 在 NixOS 上安装 ClickHouse \{#install-from-nix\}

> ClickHouse 可在 Nixpkgs 仓库中获取，并可在 **Linux** 和 **macOS** 上通过 Nix 安装。

<VerticalStepper>

## 使用 Nix 安装 ClickHouse \{#install-clickhouse-using-nix\}

可以使用 Nix 安装 ClickHouse，而无需将其永久添加到系统中：

```bash
# 安装最新稳定版本
nix shell nixpkgs#clickhouse

# 或安装 LTS 版本
nix shell nixpkgs#clickhouse-lts
```

这会在当前 shell 会话中提供 `clickhouse` 可执行文件。

- `nixpkgs#clickhouse` 软件包提供最新稳定版本。
- `nixpkgs#clickhouse-lts` 软件包提供长期支持（LTS）版本。
- 这两个软件包均可在 Linux 和 macOS 上使用。

## 永久安装 \{#permanent-installation\}

要在系统上永久安装 ClickHouse：

**对于 NixOS 用户**，在 `configuration.nix` 中添加：

```nix
environment.systemPackages = with pkgs; [
  clickhouse
];
```

然后重建系统：

```bash
sudo nixos-rebuild switch
```

**对于非 NixOS 用户**，使用 Nix profile 安装：

```bash
# 安装最新稳定版本
nix profile install nixpkgs#clickhouse

# 或安装 LTS 版本
nix profile install nixpkgs#clickhouse-lts
```

## 启动 ClickHouse Server \{#start-clickhouse-server\}

安装完成后，可以启动 ClickHouse 服务器：

```bash
clickhouse-server
```

默认情况下，服务器将使用基础配置启动，并监听 `localhost:9000`。

在 NixOS 上用于生产环境时，建议将 ClickHouse 配置为系统服务。可参考 [NixOS 手册](https://search.nixos.org/options?query=clickhouse) 了解可用的配置选项。

## 启动 ClickHouse Client \{#start-clickhouse-client\}

要连接到 ClickHouse 服务器，在新终端中运行：

```bash
clickhouse-client
```

</VerticalStepper>

## 关于 Nix 软件包 \{#about-nix-package\}

Nixpkgs 中的 ClickHouse 软件包包括：

- `clickhouse-server` - ClickHouse 数据库服务器
- `clickhouse-client` - 用于连接 ClickHouse 的命令行客户端
- `clickhouse-local` - 在本地文件上运行 SQL 查询的工具
- 其他 ClickHouse 实用工具

有关 Nixpkgs 中 ClickHouse 软件包的更多信息，请参阅：

- [Nixpkgs ClickHouse 软件包](https://search.nixos.org/packages?query=clickhouse)
- [NixOS ClickHouse 服务选项](https://search.nixos.org/options?query=clickhouse)