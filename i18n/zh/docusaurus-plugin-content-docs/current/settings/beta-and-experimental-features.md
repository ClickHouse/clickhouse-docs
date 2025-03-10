---
sidebar_position: 1
sidebar_label: 贝塔特性和实验性特性
title: 贝塔和实验性特性
description: "ClickHouse 有贝塔和实验性特性。本 документа 页面讨论定义。"
slug: /beta-and-experimental-features
---

因为 ClickHouse 是开源的，所以它不仅得到了 ClickHouse 员工的许多贡献，还得到了社区的贡献。这些贡献的开发速度通常不同；某些特性可能需要较长的原型阶段或更多时间以获得足够的社区反馈和迭代，才能被视为正式可用（GA）。

由于何时特性被分类为正式可用的不确定性，我们将特性划分为两类：**贝塔**和**实验性**。

**贝塔**特性由 ClickHouse 团队正式支持。**实验性**特性是由 ClickHouse 团队或社区驱动的早期原型，并未得到正式支持。

以下部分明确描述了 **贝塔** 和 **实验性** 特性的属性：

## 贝塔特性 {#beta-features}

- 正在积极开发中，以使其正式可用（GA）
- 主要已知问题可在 GitHub 上追踪
- 功能可能在未来发生变化
- 可能在 ClickHouse Cloud 中启用
- ClickHouse 团队支持贝塔特性

以下特性被视为 ClickHouse Cloud 中的贝塔特性，并可在 ClickHouse Cloud Services 中使用，尽管它们可能目前处于一个名为 ```allow_experimental_*``` 的 ClickHouse 设置下：

注意：请确保您使用的是 ClickHouse [兼容性](/operations/settings/settings#compatibility) 设置的当前版本，以使用最近引入的特性。

## 实验性特性 {#experimental-features}

- 可能永远不会成为 GA
- 可能会被移除
- 可以引入破坏性变化
- 功能可能在未来发生变化
- 需要故意启用
- ClickHouse 团队 **不支持** 实验性特性
- 可能缺乏重要的功能和文档
- 不能在云中启用

请注意：除了上述列为贝塔的特性，ClickHouse Cloud 中不允许启用其他实验性特性。
