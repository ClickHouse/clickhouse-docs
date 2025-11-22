---
description: '性能分析引导优化（Profile Guided Optimization）文档'
sidebar_label: '性能分析引导优化（PGO）'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: '性能分析引导优化'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# 基于性能分析的优化

Profile-Guided Optimization（PGO，基于性能分析的优化）是一种编译器优化技术，它根据程序的运行时性能分析信息对程序进行优化。

根据测试结果，PGO 有助于提升 ClickHouse 的性能。在 ClickBench 测试套件中，我们观察到 QPS 最多可提升约 15%。更详细的结果可在[此处](https://pastebin.com/xbue3HMU)查看。性能收益取决于典型工作负载——实际效果可能更好或更差。

可以在对应的 GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) 中了解有关 ClickHouse 中 PGO 的更多信息。



## 如何使用 PGO 构建 ClickHouse? {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型:[插桩](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)和[采样](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)(也称为 AutoFDO)。本指南介绍如何在 ClickHouse 中使用插桩 PGO。

1. 以插桩模式构建 ClickHouse。在 Clang 中,可以通过向 `CXXFLAGS` 传递 `-fprofile-generate` 选项来实现。
2. 在示例工作负载上运行插桩版本的 ClickHouse。这里需要使用您的常规工作负载。一种方法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为示例工作负载。插桩模式下的 ClickHouse 可能运行较慢,请做好准备,不要在性能关键型环境中运行插桩版本的 ClickHouse。
3. 使用 `-fprofile-use` 编译器标志和从上一步收集的性能分析数据重新编译 ClickHouse。

有关如何应用 PGO 的更详细指南,请参阅 Clang [文档](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您打算直接从生产环境收集示例工作负载,我们建议尝试使用采样 PGO。
