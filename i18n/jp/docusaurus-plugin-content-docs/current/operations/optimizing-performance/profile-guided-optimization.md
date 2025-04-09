---
sidebar_position: 54
sidebar_label: プロファイルガイド最適化 (PGO)
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# プロファイルガイド最適化

プロファイルガイド最適化 (PGO) は、プログラムの実行時プロファイルに基づいて最適化されるコンパイラ最適化技術です。

テストによると、PGOはClickHouseのパフォーマンスを向上させるのに役立ちます。テストによれば、ClickBenchテストスイートでQPSが最大15%改善されることが見られます。より詳細な結果は[こちら](https://pastebin.com/xbue3HMU)でご覧いただけます。パフォーマンスの利点は、通常のワークロードに依存します - 結果が良くなることもあれば悪くなることもあります。

ClickHouseにおけるPGOに関する詳細情報は、対応するGitHubの[イシュー](https://github.com/ClickHouse/ClickHouse/issues/44567)でお読みいただけます。

## PGOを用いてClickHouseをビルドする方法は？ {#how-to-build-clickhouse-with-pgo}

PGOには二つの主要な種類があります: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) と [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（AutoFDOとしても知られています）。このガイドでは、ClickHouseにおけるInstrumentation PGOについて説明します。

1. InstrumentedモードでClickHouseをビルドします。Clangでは、`CXXFLAGS`に`-fprofile-generate`オプションを渡すことで実行できます。
2. サンプルワークロードでInstrumented ClickHouseを実行します。ここでは、通常のワークロードを使用する必要があります。サンプルワークロードとして[ClickBench](https://github.com/ClickHouse/ClickBench)を使用することが考えられます。InstrumentationモードのClickHouseは遅く動作する可能性があるため、その準備をして、パフォーマンスが重要な環境でInstrumented ClickHouseを実行しないでください。
3. `-fprofile-use`コンパイラフラグと前のステップから収集したプロファイルを使用して、ClickHouseを再度コンパイルします。

PGOを適用する方法についてのより詳細なガイドはClangの[ドキュメント](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)にあります。

生産環境から直接サンプルワークロードを収集する予定がある場合は、Sampling PGOの使用を試みることをお勧めします。
