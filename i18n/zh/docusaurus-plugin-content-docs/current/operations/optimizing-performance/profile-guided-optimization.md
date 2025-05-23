---
'description': '性能指导优化的文档'
'sidebar_label': '性能指导优化 (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': '性能指导优化'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Profiling 引导优化

Profiling 引导优化 (PGO) 是一种编译器优化技术，程序根据运行时配置文件进行优化。

根据测试，PGO 有助于提升 ClickHouse 的性能。根据测试，我们在 ClickBench 测试套件中看到 QPS 有高达 15% 的提升。更详细的结果可以在 [这里](https://pastebin.com/xbue3HMU) 找到。性能收益取决于您的典型工作负载 - 您可能会得到更好或更差的结果。

关于 ClickHouse 中 PGO 的更多信息，您可以阅读相应的 GitHub [问题](https://github.com/ClickHouse/ClickHouse/issues/44567)。

## 如何构建带 PGO 的 ClickHouse？ {#how-to-build-clickhouse-with-pgo}

PGO 有两种主要类型: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。在本指南中描述了 ClickHouse 的 Instrumentation PGO。

1. 以 Instrumented 模式构建 ClickHouse。在 Clang 中，可以通过将 `-fprofile-generate` 选项传递给 `CXXFLAGS` 来完成。
2. 在样本工作负载上运行被插装的 ClickHouse。在这里，您需要使用您通常的工作负载。一个可行的方法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为样本工作负载。由于插装模式下的 ClickHouse 可能运行较慢，因此请做好准备，不要在性能关键的环境中运行被插装的 ClickHouse。
3. 再次使用 `-fprofile-use` 编译器标志和从上一步收集的配置文件重新编译 ClickHouse。

有关如何应用 PGO 的更详细指南，请参见 Clang [文档](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您打算直接从生产环境中收集样本工作负载，我们建议尝试使用 Sampling PGO。
