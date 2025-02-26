---
sidebar_position: 54
sidebar_label: プロファイル誘導最適化 (PGO)
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# プロファイル誘導最適化

プロファイル誘導最適化 (PGO) は、プログラムが実行時のプロファイルに基づいて最適化されるコンパイラによる最適化手法です。

テストによると、PGO は ClickHouse のパフォーマンス向上に寄与します。テストの結果、ClickBench テストスイートで QPS が最大 15% 向上することが確認されています。詳細な結果は [こちら](https://pastebin.com/xbue3HMU) で確認できます。パフォーマンスの向上は、典型的なワークロードに依存するため、結果が良くなる場合もあれば悪くなる場合もあります。

ClickHouse における PGO の詳細については、関連する GitHub の [イシュー](https://github.com/ClickHouse/ClickHouse/issues/44567) を参照してください。

## ClickHouse を PGO でビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGO には主に二つの種類があります: [インストゥルメンテーション](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) と [サンプリング](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (AutoFDO とも呼ばれます)。このガイドでは ClickHouse におけるインストゥルメンテーション PGO について説明します。

1. インストゥルメンテッドモードで ClickHouse をビルドします。Clang では `CXXFLAGS` に `-fprofile-generate` オプションを渡すことで実行できます。
2. サンプルワークロード上でインストゥルメンテッド ClickHouse を実行します。ここでは通常のワークロードを使用する必要があります。サンプルワークロードとして [ClickBench](https://github.com/ClickHouse/ClickBench) を使用するのも一つの方法です。インストゥルメンテーションモードの ClickHouse は遅く動作する場合があるため、その準備をしておき、パフォーマンスが重要な環境でインストゥルメンテッド ClickHouse を実行しないようにしてください。
3. 前のステップで収集したプロファイルを用いて、再度 `-fprofile-use` コンパイラフラグで ClickHouse を再コンパイルします。

PGO を適用する方法についての詳細なガイドは Clang の [ドキュメント](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) にあります。

もしプロダクション環境から直接サンプルワークロードを収集する予定がある場合は、サンプリング PGO を試すことをお勧めします。
