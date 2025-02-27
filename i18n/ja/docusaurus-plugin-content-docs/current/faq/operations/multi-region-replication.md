---
slug: /faq/operations/multi-region-replication
title: ClickHouseはマルチリージョンレプリケーションをサポートしていますか？
toc_hidden: true
toc_priority: 30
---

# ClickHouseはマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

短い答えは「はい」です。しかし、すべてのリージョン/データセンター間のレイテンシを二桁の範囲に保つことを推奨します。そうしないと、分散合意プロトコルを経由するため書き込みパフォーマンスが低下します。例えば、米国の海岸間のレプリケーションは問題なく機能するでしょうが、米国とヨーロッパ間ではそうはいかないでしょう。

設定に関しては、シングルリージョンレプリケーションと比べて違いはなく、単に異なる場所にあるホストをレプリカ用に使用するだけです。

詳細については、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)をご覧ください。
