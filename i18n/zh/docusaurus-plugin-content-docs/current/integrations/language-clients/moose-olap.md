---
'description': '开始使用 Moose Stack - 一种在 ClickHouse 上构建的代码优先方法，具有类型安全的模式和本地开发.'
'sidebar_label': 'Moose OLAP (TypeScript / Python)'
'sidebar_position': 25
'slug': '/interfaces/third-party/moose-olap'
'title': '在 ClickHouse 上使用 Moose OLAP 开发'
'keywords':
- 'Moose'
'doc_type': 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 在 ClickHouse 上使用 Moose OLAP 开发

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) 是 [Moose Stack](https://docs.fiveonefour.com/moose) 的核心模块，Moose Stack 是一个开源开发工具包，用于使用 TypeScript 和 Python 构建实时分析后端。

Moose OLAP 提供了开发者友好的抽象和类似 ORM 的功能，专为 ClickHouse 原生构建。

## Moose OLAP 的主要特点 {#key-features}

- **将模式视为代码**：使用 TypeScript 或 Python 定义 ClickHouse 表，具有类型安全和 IDE 自动补全
- **类型安全的查询**：编写带有类型检查和自动补全支持的 SQL 查询
- **本地开发**：在本地 ClickHouse 实例上开发和测试，而不影响生产环境
- **迁移管理**：对模式更改进行版本控制，并通过代码管理迁移
- **实时流处理**：内置支持将 ClickHouse 与 Kafka 或 Redpanda 配对以进行流式数据摄取
- **REST API**：轻松在 ClickHouse 表和视图上生成完整文档的 REST API

## 5 分钟内入门 {#getting-started}

有关最新的安装和入门指南，请参阅 [Moose Stack 文档](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)。

或者按照本指南，在现有的 ClickHouse 或 ClickHouse Cloud 部署上在 5 分钟内启动并运行 Moose OLAP。

### 先决条件 {#prerequisites}

- **Node.js 20+** 或 **Python 3.12+** - TypeScript 或 Python 开发所需
- **Docker Desktop** - 用于本地开发环境
- **macOS/Linux** - Windows 通过 WSL2 工作

<VerticalStepper headerLevel="h3">

### 安装 Moose {#step-1-install-moose}

将 Moose CLI 全局安装到您的系统中：

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 设置您的项目 {#step-2-set-up-project}

#### 选项 A：使用您自己的现有 ClickHouse 部署 {#option-a-use-own-clickhouse}

**重要提示**：您的生产 ClickHouse 将保持不变。这将仅初始化一个新的 Moose OLAP 项目，其数据模型来自您的 ClickHouse 表。

```bash

# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript


# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

您的 ClickHouse 连接字符串应为以下格式：

```bash
https://username:password@host:port/?database=database_name
```

#### 选项 B：使用 ClickHouse playground {#option-b-use-clickhouse-playground}

还没有让 ClickHouse 启动并运行？使用 ClickHouse Playground 尝试 Moose OLAP！

```bash

# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript


# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 安装依赖项 {#step-3-install-dependencies}

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

您应该看到：`Successfully generated X models from ClickHouse tables`

### 浏览您的生成模型 {#step-4-explore-models}

Moose CLI 会自动从您现有的 ClickHouse 表生成 TypeScript 接口或 Python Pydantic 模型。

在 `app/index.ts` 文件中查看您的新数据模型。

### 开始开发 {#step-5-start-development}

启动您的开发服务器，以从您的代码定义自动恢复所有生产表的本地 ClickHouse 实例：

```bash
moose dev
```

**重要提示**：您的生产 ClickHouse 将保持不变。这会创建一个本地开发环境。

### 为您的本地数据库预填充数据 {#step-6-seed-database}

在您的本地 ClickHouse 实例中预填充数据：

#### 从您自己的 ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### 从 ClickHouse playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### 使用 Moose OLAP 构建 {#step-7-building-with-moose-olap}

现在您已经在代码中定义了表，您将获得与 Web 应用中的 ORM 数据模型相同的好处 - 在构建API和物化视图时的类型安全和自动补全。作为下一步，您可以尝试：
* 使用 [Moose API](https://docs.fiveonefour.com/moose/apis) 构建 REST API
* 使用 [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 或 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows) 摄取或转换数据
* 探索使用 [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 和 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate) 进行生产准备

</VerticalStepper>

## 获取帮助并保持联系 {#get-help-stay-connected}
- **参考应用**：查看开源参考应用 [Area Code](https://github.com/514-labs/area-code)：一个包含所有必要构建模块的启动库，用于构建需要专用基础设施的功能丰富、企业级应用。包括两个示例应用：用户面向分析和操作数据仓库。
- **Slack 社区**：与 Moose Stack 维护者在 [Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) 上联系以获取支持和反馈
- **观看教程**：在 [Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) 上观看视频教程、演示以及对 Moose Stack 功能的深入讲解
- **贡献**：查看代码，为 Moose Stack 做贡献，并在 [GitHub](https://github.com/514-labs/moose) 上报告问题
