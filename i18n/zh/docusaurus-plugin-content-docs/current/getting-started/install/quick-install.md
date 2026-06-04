---
description: '使用 ClickHouse CLI 快速安装 ClickHouse'
keywords: ['ClickHouse', '安装', '快速', 'clickhousectl', 'CLI']
sidebar_label: '快速安装'
slug: /install/quick-install
title: '快速安装'
hide_title: true
doc_type: 'guide'
---

如果你不需要为生产环境安装 ClickHouse，最快的搭建方法是使用 ClickHouse CLI (`clickhousectl`)，它可帮助你安装本地 ClickHouse 版本、启动服务器、执行查询以及管理 ClickHouse Cloud。

:::note Windows 用户
ClickHouse 可在 Linux 和 macOS 上原生运行。在 Windows 上，请在 [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) 中执行这些步骤。
:::

<VerticalStepper>
  ## 安装 ClickHouse CLI \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  为方便使用，还会自动创建一个 `chctl` 别名。

  ## 安装 ClickHouse \{#install-clickhouse\}

  安装最新的稳定版本 ClickHouse，并将其设为默认版本：

  ```bash
  clickhousectl local use stable
  ```

  如果该版本尚未安装，`local use` 会先安装它，将其设为默认版本，并在 `~/.local/bin` (位于你的 `PATH` 中) 创建一个指向 `clickhouse` 的符号链接，这样你就可以直接调用 `clickhouse` 可执行文件。这样，本文档后续任何运行 `clickhouse` 命令的步骤都可以直接照常使用。

  :::note[Use 与 install]
  `clickhousectl local use <version>` 会安装指定版本，*并且*将其设为默认版本，同时更新你 `PATH` 中的 `clickhouse` 符号链接。若只想下载某个版本，而不更改默认版本或更新符号链接，请改用 `clickhousectl local install <version>`。
  :::

  ## 启动 clickhouse-server \{#start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  服务器会在后台运行。要验证其是否正在运行：

  ```bash
  clickhousectl local server list
  ```

  ## 启动 clickhouse-client \{#start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  你会看到类似下面的内容：

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  现在你已经可以开始向 ClickHouse 发送 SQL 命令了！

  :::tip
  [快速开始](/get-started/quick-start) 将逐步引导你完成创建表和插入数据。
  :::
</VerticalStepper>