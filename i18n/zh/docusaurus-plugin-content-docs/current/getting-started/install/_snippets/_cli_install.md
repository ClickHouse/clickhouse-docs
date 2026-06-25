# 使用 ClickHouse CLI 安装 ClickHouse \{#install-clickhouse-using-the-clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) 可帮助您安装和管理本地 ClickHouse
版本、启动服务器并执行查询。

<VerticalStepper>
  ## 安装 ClickHouse CLI \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  为方便使用，还会自动创建一个 `chctl` 别名。

  ## 安装 ClickHouse \{#cli-install-clickhouse\}

  安装最新的稳定版 ClickHouse，并将其设为默认版本：

  ```bash
  clickhousectl local use stable
  ```

  `local use` 会在该版本尚未安装时自动进行安装，将其设为您的
  默认版本，并在 `~/.local/bin` (位于您的 `PATH` 中) 中创建一个 `clickhouse` 符号链接，
  这样您就可以直接调用 `clickhouse` 可执行文件。这样一来，本文档中后续任何运行
  `clickhouse` 命令的步骤都可以直接照常使用。

  您也可以选择指定版本：

  ```bash
  clickhousectl local use lts             # 最新 LTS 版本
  clickhousectl local use 25.6            # 最新 25.6.x.x
  clickhousectl local use 25.6.1.1        # 精确版本
  ```

  :::note[Use 与 install]
  `clickhousectl local use <version>` 会安装一个版本，*并且* 将其设为您的
  默认版本，同时更新您 `PATH` 中的 `clickhouse` 符号链接。若只想下载某个版本，
  而不更改默认版本或更新符号链接，请改用
  `clickhousectl local install <version>`。
  :::

  ## 启动 clickhouse-server \{#cli-start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  服务器会在后台运行。要验证其是否正在运行：

  ```bash
  clickhousectl local server list
  ```

  ## 启动 clickhouse-client \{#cli-start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  您将看到类似下面的内容：

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  现在，您可以开始向 ClickHouse 发送 SQL 命令了！

  :::tip
  [快速入门](/get-started/quick-start) 将逐步引导您完成创建表和插入数据的操作。
  :::
</VerticalStepper>