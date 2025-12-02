---
description: '性能分析引导优化（PGO）文档'
sidebar_label: '性能分析引导优化（PGO）'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: '性能分析引导优化'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# 基于性能分析的优化 {#profile-guided-optimization}

Profile-Guided Optimization（PGO，基于性能分析的优化）是一种编译器优化技术，它根据程序的运行时性能分析数据对程序进行优化。

根据测试结果，PGO 有助于提升 ClickHouse 的性能。在 ClickBench 测试套件中，我们观测到 QPS 最高可提升约 15%。更详细的结果可在[这里](https://pastebin.com/xbue3HMU)查看。性能收益取决于典型工作负载，实际结果可能更好或更差。

关于 ClickHouse 中 PGO 的更多信息，可在对应的 GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) 中查阅。

## 如何使用 PGO 构建 ClickHouse？ {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。本指南介绍的是在 ClickHouse 中使用 Instrumentation PGO 的方法。

1. 以 Instrumentation 模式构建 ClickHouse。在 Clang 中，可以通过在 `CXXFLAGS` 中加入 `-fprofile-generate` 选项来实现。
2. 在样本工作负载上运行插桩版 ClickHouse。这里应使用您常规的工作负载，其中一种做法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为样本工作负载。处于 Instrumentation 模式下的 ClickHouse 可能运行较慢，请提前做好预期，并避免在对性能敏感的环境中运行插桩版 ClickHouse。
3. 使用 `-fprofile-use` 编译器选项以及在上一步中收集到的 profile，再次编译 ClickHouse。

关于如何应用 PGO 的更详细说明，请参阅 Clang 的[文档](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您计划直接在生产环境中收集样本工作负载，我们建议尝试使用 Sampling PGO。
