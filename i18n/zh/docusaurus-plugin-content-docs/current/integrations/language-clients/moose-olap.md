---
description: 'Moose Stack 入门 - 一种代码优先的方法，通过类型安全的架构和本地开发环境在 ClickHouse 之上构建应用'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: '使用 Moose OLAP 开发 ClickHouse 应用'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 使用 Moose OLAP 开发 ClickHouse 应用

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) 是 [Moose Stack](https://docs.fiveonefour.com/moose) 的核心模块,后者是一个开源开发工具包,用于通过 TypeScript 和 Python 构建实时分析后端。

Moose OLAP 提供了对开发者友好的抽象层和类 ORM 功能,专为 ClickHouse 原生打造。



## Moose OLAP 的主要特性 {#key-features}

- **模式即代码**：使用 TypeScript 或 Python 定义 ClickHouse 表，支持类型安全和 IDE 自动补全
- **类型安全查询**：编写 SQL 查询时支持类型检查和自动补全
- **本地开发**：在本地 ClickHouse 实例上进行开发和测试，不影响生产环境
- **迁移管理**：通过代码对模式变更进行版本控制和迁移管理
- **实时流处理**：内置支持将 ClickHouse 与 Kafka 或 Redpanda 集成，实现流式数据摄取
- **REST API**：轻松基于 ClickHouse 表和视图生成完整文档化的 REST API


## 5 分钟快速入门 {#getting-started}

有关最新的安装和入门指南,请参阅 [Moose Stack 文档](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)。

或者按照本指南,在现有的 ClickHouse 或 ClickHouse Cloud 部署上快速启动 Moose OLAP,只需不到 5 分钟。

### 前置要求 {#prerequisites}

- **Node.js 20+** 或 **Python 3.12+** - TypeScript 或 Python 开发必需
- **Docker Desktop** - 用于本地开发环境
- **macOS/Linux** - Windows 可通过 WSL2 使用

<VerticalStepper headerLevel="h3">

### 安装 Moose {#step-1-install-moose}

将 Moose CLI 全局安装到系统:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 设置项目 {#step-2-set-up-project}

#### 选项 A:使用现有的 ClickHouse 部署 {#option-a-use-own-clickhouse}

**重要提示**:您的生产环境 ClickHouse 不会受到影响。此操作仅会初始化一个新的 Moose OLAP 项目,其数据模型派生自您的 ClickHouse 表。


```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript
```


# Python

moose init my-project --from-remote <您的_CLICKHOUSE_连接字符串> --language python

````

您的 ClickHouse 连接字符串格式应为:

```bash
https://用户名:密码@主机:端口/?database=数据库名称
````

#### 选项 B:使用 ClickHouse Playground {#option-b-use-clickhouse-playground}

还没有安装运行 ClickHouse?使用 ClickHouse Playground 试用 Moose OLAP!


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

您应该看到：`Successfully generated X models from ClickHouse tables`

### 探索生成的模型 {#step-4-explore-models}

Moose CLI 会自动从现有的 ClickHouse 表生成 TypeScript 接口或 Python Pydantic 模型。

在 `app/index.ts` 文件中查看新生成的数据模型。

### 开始开发 {#step-5-start-development}

启动开发服务器以创建本地 ClickHouse 实例,所有生产表将根据代码定义自动复制：

```bash
moose dev
````

**重要提示**：生产环境的 ClickHouse 不会受到影响。此操作将创建一个本地开发环境。

### 填充本地数据库 {#step-6-seed-database}

将数据填充到本地 ClickHouse 实例：

#### 从您自己的 ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### 从 ClickHouse playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### 使用 Moose OLAP 构建应用 {#step-7-building-with-moose-olap}

现在您已经在代码中定义了表,就可以获得与 Web 应用程序中 ORM 数据模型相同的优势——在分析数据之上构建 API 和物化视图时具有类型安全和自动补全功能。接下来,您可以尝试：

- 使用 [Moose API](https://docs.fiveonefour.com/moose/apis) 构建 REST API
- 使用 [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 或 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows) 摄取或转换数据
- 探索使用 [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 和 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate) 部署到生产环境

</VerticalStepper>


## 获取帮助并保持联系 {#get-help-stay-connected}

- **参考应用**:查看开源参考应用 [Area Code](https://github.com/514-labs/area-code):这是一个入门代码仓库,包含构建功能丰富、企业级应用所需的全部基础模块,适用于需要专用基础设施的场景。其中包含两个示例应用:面向用户的分析平台和运营数据仓库。
- **Slack 社区**:通过 [Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) 与 Moose Stack 维护者联系,获取支持和反馈
- **观看教程**:在 [Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) 上观看视频教程、演示和 Moose Stack 功能深度解析
- **贡献代码**:在 [GitHub](https://github.com/514-labs/moose) 上查看代码、为 Moose Stack 贡献代码并报告问题
