---
description: '通过 CLI 或 curl 快速安装 ClickHouse'
keywords: ['ClickHouse', '安装', '快速', 'curl', 'clickhousectl', 'CLI']
sidebar_label: '快速安装'
slug: /install/quick-install
title: '快速安装'
hide_title: true
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickInstall from './_snippets/_quick_install.md'

# 快速安装 \{#quick-install\}

如果你不需要为生产环境安装 ClickHouse，最快的搭建方法是使用 ClickHouse CLI，或通过 `curl` 运行安装脚本。

<Tabs>
  <TabItem value="cli" label="ClickHouse CLI" default>
    ClickHouse CLI (`clickhousectl`) 可帮助你安装和管理本地 ClickHouse
    版本、启动服务器以及执行查询。

    <VerticalStepper>
      ## 安装 ClickHouse CLI \{#install-the-cli\}

      ```bash
      curl https://clickhouse.com/cli | sh
      ```

      为方便使用，还会自动创建一个 `chctl` 别名。

      ## 安装 ClickHouse \{#install-clickhouse\}

      ```bash
      clickhousectl local install stable
      ```

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
  </TabItem>

  <TabItem value="curl" label="Curl 脚本">
    <QuickInstall />
  </TabItem>
</Tabs>