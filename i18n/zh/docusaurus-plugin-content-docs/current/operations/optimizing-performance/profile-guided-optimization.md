---
sidebar_position: 54
sidebar_label: '基于 Profiling 的优化 (PGO)'
---
import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 基于 Profiling 的优化

基于 Profiling 的优化 (PGO) 是一种编译器优化技术，程序根据运行时的性能分析进行优化。

根据测试，PGO 有助于提高 ClickHouse 的性能。根据测试，ClickBench 测试套件显示 QPS 提升高达 15%。更详细的结果可以在 [这里](https://pastebin.com/xbue3HMU) 查看。性能提升取决于您的典型工作负载 - 您可能会获得更好或更差的结果。

关于 ClickHouse 中 PGO 的更多信息，您可以在相应的 GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) 中阅读。

## 如何构建带有 PGO 的 ClickHouse? {#how-to-build-clickhouse-with-pgo}

PGO 主要有两种类型：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 和 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（也称为 AutoFDO）。本指南描述了 ClickHouse 的 Instrumentation PGO。

1. 在 Instrumented 模式下构建 ClickHouse。在 Clang 中，可以通过将 `-fprofile-generate` 选项传递给 `CXXFLAGS` 来实现。
2. 在样本工作负载上运行 Instrumented 的 ClickHouse。此处您需要使用您的常规工作负载。一种方法是使用 [ClickBench](https://github.com/ClickHouse/ClickBench) 作为样本工作负载。Instrumented 模式下的 ClickHouse 可能会运行得比较慢，因此请做好准备，避免在性能关键的环境中运行 Instrumented 的 ClickHouse。
3. 使用从上一步骤收集的配置文件和 `-fprofile-use` 编译器标志再次重新编译 ClickHouse。

有关如何应用 PGO 的更详细指南，请查看 Clang [文档](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)。

如果您打算直接从生产环境收集样本工作负载，我们建议尝试使用 Sampling PGO。
