---
description: '开始使用 Moose Stack —— 一种以代码为先的方式，在 ClickHouse 之上构建具备类型安全 schema 并支持本地开发的方案'
sidebar_label: 'Moose OLAP（TypeScript / Python）'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: '使用 Moose OLAP 在 ClickHouse 上进行开发'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 使用 Moose OLAP 在 ClickHouse 上进行开发

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) 是 [Moose Stack](https://docs.fiveonefour.com/moose) 的核心模块，Moose Stack 是一个开源开发工具包，用于使用 TypeScript 和 Python 构建实时分析后端。 

Moose OLAP 为开发者提供友好的抽象层和类似 ORM 的功能，并为 ClickHouse 原生打造。



## Moose OLAP 的关键特性 {#key-features}

- **Schemas as code（以代码管理 Schema）**：使用 TypeScript 或 Python 定义 ClickHouse 表，具备类型安全和 IDE 自动补全能力
- **Type-safe queries（类型安全查询）**：编写类型安全的 SQL 查询，支持类型检查和自动补全
- **本地开发**：在本地 ClickHouse 实例上进行开发和测试，而不会影响生产环境
- **迁移管理**：通过代码对 Schema 变更进行版本控制，并管理迁移流程
- **实时流式处理**：内置支持将 ClickHouse 与 Kafka 或 Redpanda 配合使用，实现流式数据摄取
- **REST API**：轻松在 ClickHouse 的表和视图之上生成具备完整文档说明的 REST API



## 在 5 分钟内完成入门 {#getting-started}

有关最新、最完善的安装与入门指南，请参阅 [Moose Stack 文档](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)。

或者按照本指南，在现有的 ClickHouse 或 ClickHouse Cloud 部署之上，在 5 分钟内完成 Moose OLAP 的部署和运行。

### 前提条件 {#prerequisites}

- **Node.js 20+** 或 **Python 3.12+** - TypeScript 或 Python 开发所需的运行环境
- **Docker Desktop** - 用于本地开发环境
- **macOS/Linux** - Windows 环境可通过 WSL2 使用

<VerticalStepper headerLevel="h3">

### 安装 Moose {#step-1-install-moose}

在系统中全局安装 Moose CLI：

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 配置项目 {#step-2-set-up-project}

#### 选项 A：使用现有的 ClickHouse 部署 {#option-a-use-own-clickhouse}

**重要**：你的生产环境 ClickHouse 不会被修改。此操作只会基于你的 ClickHouse 表派生数据模型，并初始化一个新的 Moose OLAP 项目。


```bash
# TypeScript
moose init my-project --from-remote <您的 ClickHouse 连接字符串> --language typescript
```


# Python

moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python

````

您的 ClickHouse 连接字符串应采用以下格式：

```bash
https://username:password@host:port/?database=database_name
````

#### 选项 B：使用 ClickHouse Playground {#option-b-use-clickhouse-playground}

还没有部署并运行 ClickHouse 吗？使用 ClickHouse Playground 来体验 Moose OLAP！


```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript
```


# Python

moose init my-project --from-remote [https://explorer:@play.clickhouse.com:443/?database=default](https://explorer:@play.clickhouse.com:443/?database=default) --language python

```

### 安装依赖项 {#step-3-install-dependencies}
```


```bash
# TypeScript
cd my-project
npm install
```


# Python

cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

````

你应该会看到：`Successfully generated X models from ClickHouse tables`

### 浏览生成的模型 {#step-4-explore-models}

Moose CLI 会根据你现有的 ClickHouse 表，自动生成 TypeScript 接口或 Python Pydantic 模型。

在 `app/index.ts` 文件中查看你新生成的数据模型。

### 开始开发 {#step-5-start-development}

启动开发服务器，拉起一个本地 ClickHouse 实例，并根据你的代码定义自动重建所有生产环境的表：

```bash
moose dev
````

**重要**：你的生产 ClickHouse 不会被修改。此操作只会创建一个本地开发环境。

### 为本地数据库初始化数据 {#step-6-seed-database}

将数据初始化到你的本地 ClickHouse 实例中：

#### 使用你自己的 ClickHouse 实例 {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### 使用 ClickHouse playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### 使用 Moose OLAP 构建应用 {#step-7-building-with-moose-olap}

现在你已经在代码中定义了数据表，便可以像在 Web 应用中使用 ORM 数据模型一样获益——在基于分析数据构建 API 和物化视图时获得类型安全和自动补全能力。接下来你可以尝试：

- 使用 [Moose API](https://docs.fiveonefour.com/moose/apis) 构建 REST API
- 通过 [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 或 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows) 对数据进行摄取或转换
- 借助 [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 和 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate) 评估并推进生产环境部署

</VerticalStepper>


## 获取帮助并保持联系 {#get-help-stay-connected}
- **参考应用**：查看这个开源参考应用 [Area Code](https://github.com/514-labs/area-code)：一个入门仓库，包含构建功能丰富、面向企业且依赖专门基础设施的应用所需的全部基础模块。它提供两个示例应用：面向用户的分析（User Facing Analytics）和运营数据仓库（Operational Data Warehouse）。
- **Slack 社区**：加入 Moose Stack 维护者的 [Slack 社区](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg)，获取支持和反馈。
- **观看教程**：在 [YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) 上观看 Moose Stack 功能的视频教程、演示和深度解析。
- **参与贡献**：在 [GitHub](https://github.com/514-labs/moose) 上查看代码、为 Moose Stack 做出贡献并提交问题。
