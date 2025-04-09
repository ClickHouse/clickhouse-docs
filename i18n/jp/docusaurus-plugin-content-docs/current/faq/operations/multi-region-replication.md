---
slug: /faq/operations/multi-region-replication
title: ClickHouseはマルチリージョンレプリケーションをサポートしていますか？
toc_hidden: true
toc_priority: 30
---


# ClickHouseはマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

短い答えは「はい」です。しかし、すべてのリージョン/データセンター間のレイテンシは二桁の範囲内に保つことをお勧めします。そうしないと、分散合意プロトコルを通過するために書き込みパフォーマンスが低下します。例えば、アメリカの西海岸間でのレプリケーションはうまく機能するでしょうが、アメリカとヨーロッパの間ではうまくいかないでしょう。

構成的には、シングルリージョンレプリケーションと比較して違いはなく、単にレプリカのために異なるロケーションにあるホストを使用すればよいです。

詳しくは、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
