---
'description': '性能指导优化的文档'
'sidebar_label': '性能指导优化 (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': '性能指导优化'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Profile Guided Optimization

Profile-Guided Optimization (PGO) 是一种编译器优化技术，它基于运行时配置对程序进行优化。

根据测试，PGO 有助于提高 ClickHouse 的性能。根据测试，我们在 ClickBench 测试套件中观察到 QPS 的提升高达 15%。更详细的结果可以在 [这里](https://pastebin.com/xbue3HMU) 找到。性能收益取决于您的典型工作负载 - 您可能会获得更好或更差的结果。

有关 ClickHouse 中 PGO 的更多信息，您可以在相应的 GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) 中阅读。

## 如何使用 PGO 构建 ClickHouse？ {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。本指南描述了使用 ClickHouse 的 Instrumentation PGO。

1. 以 Instrumented 模式构建 ClickHouse。在 Clang 中，可以通过将 `-fprofile-generate` 选项传递给 `CXXFLAGS` 来完成。
2. 在示例工作负载上运行被注入的 ClickHouse。在这里，您需要使用您通常的工作负载。一种方法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为示例工作负载。ClickHouse 在 Instrumentation 模式下可能运行缓慢，因此请为此做好准备，并且不要在对性能要求严格的环境中运行被注入的 ClickHouse。
3. 再次使用 `-fprofile-use` 编译器标志和从上一步收集的配置重新编译 ClickHouse。

有关如何应用 PGO 的更详细指南，请参阅 Clang 的 [documentation](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您打算直接从生产环境收集示例工作负载，建议尝试使用 Sampling PGO。
