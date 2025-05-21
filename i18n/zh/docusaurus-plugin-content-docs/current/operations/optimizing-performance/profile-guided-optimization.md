---
'description': 'Documentation for Profile Guided Optimization'
'sidebar_label': 'Profile Guided Optimization (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': 'Profile Guided Optimization'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# 基于配置文件的优化

基于配置文件的优化（PGO）是一种编译器优化技术，它根据程序的运行时配置文件对程序进行优化。

根据测试，PGO 有助于提升 ClickHouse 的性能。根据测试结果，我们在 ClickBench 测试套件中观察到 QPS 的提升高达 15%。更详细的结果可以在 [这里](https://pastebin.com/xbue3HMU) 查阅。性能收益取决于您的典型工作负载 - 您可能会获得更好的或更差的结果。

关于 ClickHouse 中 PGO 的更多信息，您可以在相应的 GitHub [问题](https://github.com/ClickHouse/ClickHouse/issues/44567) 中阅读。

## 如何使用 PGO 编译 ClickHouse？ {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。本指南描述了 ClickHouse 的 Instrumentation PGO。

1. 在 Instrumented 模式下构建 ClickHouse。在 Clang 中，可以通过将 `-fprofile-generate` 选项传递给 `CXXFLAGS` 来完成。
2. 在样本工作负载上运行 Instrumented 的 ClickHouse。这里需要使用您平时的工作负载。一种方法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为样本工作负载。在 Instrumentation 模式下，ClickHouse 的工作速度可能较慢，所以请为此做好准备，不要在性能关键环境中运行 Instrumented ClickHouse。
3. 再次使用 `-fprofile-use` 编译器标志和从上一步收集的配置文件重新编译 ClickHouse。

关于如何应用 PGO 的更详细指南，请参考 Clang 的 [文档](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您打算直接从生产环境收集样本工作负载，我们建议尝试使用 Sampling PGO。
