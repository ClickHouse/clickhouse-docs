---
slug: /integrations/integration-development/documenting-your-integration
sidebar_label: '为你的集成撰写文档'
sidebar_position: 4
title: '为你的 ClickHouse 集成撰写文档'
description: '介绍如何向 clickhouse-docs 贡献集成页面，包括必备章节和可复制粘贴的模板。'
keywords: ['合作伙伴', '集成', '文档', '贡献', '拉取请求', '集成文档']
doc_type: 'guide'
---

# 为你的 ClickHouse 集成编写文档 \{#documenting-your-clickhouse-integration\}

本网站上的集成文档为最终用户提供了一个统一的位置，用于了解和排查相关配置。本页说明了应包含哪些内容、文件应放在哪里，以及如何提交拉取请求。

如果你还没有阅读，请先从[构建集成](/integrations/integration-development/building-integrations)和[测试你的集成](/integrations/integration-development/testing-your-integration)开始。

## 文档位置 \{#where-docs-live\}

* **仓库：** [`ClickHouse/clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs)
* **格式：** Markdown，使用 Docusaurus 构建
* **位置：** `/docs/integrations/<category>/<your-integration>/`，其中 `<category>` 反映你的产品类别 (如 `data-visualization`、`data-ingestion`、`language-clients` 等)
* **流程：** 向 `main` 分支提交拉取请求。ClickHouse 集成团队会进行审核。首次贡献者需要在机器人于 PR 中提示时签署贡献者许可协议 (Contributor License Agreement)

此仓库中的集成页面是最终用户的主要参考资料。你可以在集成页面中添加指向你自己网站上补充文档的链接，以提供产品特定的详细信息。

优秀示例：[Tableau](/integrations/tableau) 和 [Metabase](/integrations/metabase)。

## 选择类别 \{#choosing-a-category\}

选择最符合你的产品功能的类别。在提交 PR 之前，先浏览 [Integrations](/integrations) 下的现有类别。如果你不确定，请在 PR 描述中注明你建议的类别，集成团队会帮助确定页面应归入哪个类别。

## 必需章节 \{#required-sections\}

每个集成页面都应涵盖以下内容，最好按此顺序组织：

1. **目的。** 用两到三句话说明该集成解决了什么问题。避免写成营销文案。读者通常是正在评估如何搭建方案的工程师
2. **前置条件和支持的版本矩阵。** 说明用户需要预先安装哪些内容，以及你支持哪些版本，**同时涵盖 ClickHouse Cloud 和自托管 (开源)&#x20;**。使用一个简短的表格会很清晰
3. **设置步骤。** 提供逐步说明，直至建立可用的连接；对于 Cloud 和自托管之间存在差异的地方 (主机、端口、TLS) ，要**并排说明**
4. **身份验证。** 说明支持哪些身份验证方式 (至少包括通过 TLS 使用用户名和密码，此外还可包括 mTLS、SSL 客户端证书，以及在适用时补充 IP 允许列表的说明)
5. **端到端示例。** 至少提供一个从连接到产生有意义结果的真实示例。使用一个 [ClickHouse 示例数据集](/getting-started/example-datasets)，以便读者能够复现
6. **已知限制和性能特征。** 类型系统缺口、结果集阈值、吞吐量说明、不支持的功能。如实说明这些内容可以减少支持成本
7. **故障排除。** 常见错误及其解决方法。对于第一版来说，两到三个高频案例就足够了

## 风格说明 \{#style-notes\}

* **同时涵盖 Cloud 和自托管。** Cloud 通常使用 `8443` 端口上的 HTTPS 和 `9440` 端口上的原生 TCP。自托管默认使用 `8123` 和 `9000`
* **使用 Docusaurus 提示框** (`:::note`、`:::warning`、`:::tip`) 呈现说明内容，不要使用加粗段落
* **通过链接提供更深入的信息。** 对于数据类型、格式、JDBC、ClickPipes 及类似主题，请链接到现有文档，不要在这里重复说明
* **不要加入营销内容。** 此处的集成页面是技术参考文档。宣传内容应放在你们自己的网站上；我们可以从合作伙伴目录链接过去

## 复制粘贴模板 \{#copy-paste-skeleton\}

填写方括号中的内容后，将其保存为 `/docs/integrations/<category>/<your-integration>/index.md`，然后发起一个 PR。

```markdown
# [Your product] and ClickHouse

[One to three sentences: what the integration does and why a
ClickHouse user would want it.]

## Prerequisites

- [Your product, version X.Y or later]
- ClickHouse Cloud, or self-hosted ClickHouse version [X.Y] or later
- [Anything else: driver, plugin, network access requirements]

### Version matrix

| [Your product] | ClickHouse Cloud | ClickHouse open source | Notes    |
| -------------- | ---------------- | ---------------------- | -------- |
| X.Y            | ✅               | ✅ 24.x+               | [if any] |

## Setup

### Connect to ClickHouse Cloud

1. In the ClickHouse Cloud console, select your service and click **Connect**.
2. Choose **HTTPS**. Copy the host, port (8443), username, and password.
3. In [your product], [steps to configure the connection].

### Connect to self-hosted ClickHouse

1. [How to point at a self-hosted instance — host, port 8123 or 9000, TLS notes.]
2. In [your product], [steps to configure the connection].

## Authentication

[List supported auth modes — username/password over TLS, mTLS, etc. — and how
to configure each.]

## Example: querying the [dataset] dataset

[Walkthrough using one of the ClickHouse example datasets, end-to-end.]

## Known limits

- [Types not yet supported, e.g., deeply nested JSON]
- [Result-set size thresholds or other performance notes]
- [Feature gaps]

## Troubleshooting

### [Common error message]

[Cause and resolution.]

### [Another common error]

[Cause and resolution.]
```

## 审核 \{#review\}

ClickHouse 集成团队会审核 PR 的技术准确性、对 Cloud 和自托管部署的覆盖情况，以及文档风格。请在 PR 中持续迭代，直到审核者批准。获得批准后，PR 才能合并。