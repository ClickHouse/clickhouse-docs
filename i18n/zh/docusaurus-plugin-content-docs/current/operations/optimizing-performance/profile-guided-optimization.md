---
'description': '性能指导优化的文档'
'sidebar_label': '性能指导优化 (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': '性能指导优化'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Profile guided optimization

Profile-Guided Optimization (PGO) 是一种编译器优化技术，通过运行时分析程序的性能来优化程序。

根据测试，PGO 有助于提高 ClickHouse 的性能。根据测试结果，我们在 ClickBench 测试套件中观察到 QPS 最高可提高 15%。更详细的结果可以在 [这里](https://pastebin.com/xbue3HMU) 找到。性能收益取决于您的典型工作负载 - 您可能会获得更好的或更差的结果。

关于 ClickHouse 中 PGO 的更多信息，您可以在相关的 GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) 中阅读。

## 如何使用 PGO 构建 ClickHouse？ {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。本指南描述了在 ClickHouse 中使用 Instrumentation PGO。

1. 用器件模式构建 ClickHouse。在 Clang 中，可以通过传递 `-fprofile-generate` 选项给 `CXXFLAGS` 来实现。
2. 在样本工作负载上运行器件 ClickHouse。在这里，您需要使用您的常规工作负载。可以使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为样本工作负载。ClickHouse 的器件模式可能运行较慢，因此要做好心理准备，并且不要在性能关键的环境中运行器件 ClickHouse。
3. 再次使用 `-fprofile-use` 编译器标志和前一步收集的配置文件重新编译 ClickHouse。

关于如何应用 PGO 的更详细指南在 Clang [documentation](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) 中。

如果您打算直接从生产环境中收集样本工作负载，我们建议尝试使用 Sampling PGO。
