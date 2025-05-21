---
slug: /faq/operations/multi-region-replication
title: 'ClickHouseはマルチリージョンレプリケーションをサポートしていますか？'
toc_hidden: true
toc_priority: 30
description: 'このページでは、ClickHouseがマルチリージョンレプリケーションをサポートしているかどうかを回答します'
---


# ClickHouseはマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

短い答えは「はい」です。しかし、すべてのリージョン/データセンター間のレイテンシは二桁の範囲内に保つことを推奨します。そうしないと、分散合意プロトコルを通じて書き込みパフォーマンスが低下します。例えば、米国の両海岸間のレプリケーションは問題なく機能する可能性が高いですが、米国とヨーロッパの間では問題が発生するでしょう。

構成面では、単一リージョンレプリケーションと比較して違いはなく、単に異なる場所にあるホストをレプリカとして使用します。

詳細については、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
