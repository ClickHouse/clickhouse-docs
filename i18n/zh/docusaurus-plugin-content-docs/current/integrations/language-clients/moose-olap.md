---
description: '开始使用 Moose Stack——一种以代码为先的方式，在 ClickHouse 之上进行构建，并提供类型安全的 schema 和本地开发体验'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: '基于 ClickHouse 使用 Moose OLAP 进行开发'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 使用 Moose OLAP 在 ClickHouse 上进行开发 \\{#developing-on-clickhouse-with-moose-olap\\}

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) 是 [Moose Stack](https://docs.fiveonefour.com/moose) 的核心模块，Moose Stack 是一个开源的开发者工具集，用于使用 TypeScript 和 Python 构建实时分析后端。 

Moose OLAP 提供对开发者友好的抽象层和类 ORM 功能，并且为 ClickHouse 原生构建。

## Moose OLAP 的关键特性 \\{#key-features\\}

- **以代码管理 Schema**：使用 TypeScript 或 Python 定义 ClickHouse 表，具备类型安全和 IDE 自动补全能力
- **类型安全的查询**：编写具备类型检查和自动补全支持的 SQL 查询
- **本地开发**：在本地 ClickHouse 实例上进行开发和测试，而不影响生产环境
- **迁移管理**：通过代码对 Schema 变更进行版本控制并管理迁移
- **实时流式处理**：内置支持将 ClickHouse 与 Kafka 或 Redpanda 集成，用于实时流式数据摄取
- **REST API**：在 ClickHouse 表和视图之上轻松生成带完整文档的 REST API

## 5 分钟内快速上手 \\{#getting-started\\}

如需最新、最完整的安装和入门指南，请参阅 [Moose Stack 文档](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)。

或者按照本指南，在不到 5 分钟内，即可在现有的 ClickHouse 或 ClickHouse Cloud 部署上运行 Moose OLAP。

### 前置条件 \\{#prerequisites\\}

- **Node.js 20+** 或 **Python 3.12+** - 用于 TypeScript 或 Python 开发
- **Docker Desktop** - 用于本地开发环境
- **macOS/Linux** - Windows 可通过 WSL2 使用

<VerticalStepper headerLevel="h3">

### 安装 Moose \\{#step-1-install-moose\\}

在系统中全局安装 Moose CLI：

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 设置你的项目 \\{#step-2-set-up-project\\}

#### 选项 A：使用你已有的 ClickHouse 部署 \\{#option-a-use-own-clickhouse\\}

**重要**：你的生产 ClickHouse 不会被修改。此操作只会基于你的 ClickHouse 表初始化一个新的 Moose OLAP 项目，并从中派生数据模型。

```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript

# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

你的 ClickHouse 连接字符串应当是以下格式：

```bash
https://username:password@host:port/?database=database_name
```

#### 选项 B：使用 ClickHouse Playground \\{#option-b-use-clickhouse-playground\\}

还没有正在运行的 ClickHouse 实例？使用 ClickHouse Playground 来试用 Moose OLAP！

```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript

# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 安装依赖 \\{#step-3-install-dependencies\\}

```bash
# TypeScript
cd my-project
npm install

# Python
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

你应该会看到：`Successfully generated X models from ClickHouse tables`

### 浏览生成的模型 \\{#step-4-explore-models\\}

Moose CLI 会根据你现有的 ClickHouse 表自动生成 TypeScript 接口或 Python Pydantic 模型。

在 `app/index.ts` 文件中查看你新的数据模型。

### 开始开发 \\{#step-5-start-development\\}

启动开发服务器，以拉起一个本地 ClickHouse 实例，并根据你的代码定义自动还原所有生产表：

```bash
moose dev
```

**重要**：你的生产 ClickHouse 不会被修改。此操作只会创建一个本地开发环境。

### 为本地数据库预置数据 \\{#step-6-seed-database\\}

将数据预置到本地 ClickHouse 实例中：

#### 来自你自己的 ClickHouse \\{#from-own-clickhouse\\}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### 来自 ClickHouse Playground \\{#from-clickhouse-playground\\}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### 使用 Moose OLAP 构建应用 \\{#step-7-building-with-moose-olap\\}

现在你已经在代码中定义了表，可以像在 Web 应用中使用 ORM 数据模型一样获得相同的好处——在基于分析数据构建 API 和物化视图时具备类型安全和自动补全能力。下一步你可以尝试：
* 使用 [Moose API](https://docs.fiveonefour.com/moose/apis) 构建 REST API
* 使用 [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 或 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows) 来摄取或转换数据
* 通过 [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 和 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate) 探索如何进入生产环境

</VerticalStepper>

## 获取帮助并保持联系 \\{#get-help-stay-connected\\}

- **参考应用**：查看这个开源参考应用 [Area Code](https://github.com/514-labs/area-code)：一个包含构建功能丰富、可用于生产的企业级应用所需全部基础模块的入门代码仓库，适用于需要专用基础设施的场景。该项目包含两个示例应用：“面向用户的分析”（User Facing Analytics）和“运营数据仓库”（Operational Data Warehouse）。
- **Slack 社区**：通过 [Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) 与 Moose Stack 维护者交流，以获得支持和反馈。
- **观看教程**：在 [YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) 上观看关于 Moose Stack 功能的视频教程、演示和深度讲解。
- **参与贡献**：在 [GitHub](https://github.com/514-labs/moose) 上查看代码、为 Moose Stack 做出贡献并提交问题。