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

  安装最新的稳定版 ClickHouse：

  ```bash
  clickhousectl local install stable
  ```

  您也可以安装指定版本：

  ```bash
  clickhousectl local install lts             # 最新 LTS 版本
  clickhousectl local install 25.6            # 最新 25.6.x.x
  clickhousectl local install 25.6.1.1        # 精确版本
  ```

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