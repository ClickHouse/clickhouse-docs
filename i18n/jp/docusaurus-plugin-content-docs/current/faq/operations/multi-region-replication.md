---
slug: '/faq/operations/multi-region-replication'
title: 'ClickHouseはマルチリージョンレプリケーションをサポートしていますか？'
toc_hidden: true
toc_priority: 30
description: 'このページは、ClickHouseがマルチリージョンレプリケーションをサポートしているかどうかについて回答します。'
---




# ClickHouseはマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

短い答えは「はい」です。しかし、すべてのリージョン/データセンター間のレイテンシは二桁の範囲に保つことをお勧めします。そうしないと、分散合意プロトコルを通るため、書き込みパフォーマンスが低下します。例えば、アメリカの海岸間でのレプリケーションは問題なく機能するでしょうが、アメリカとヨーロッパ間ではうまくいかないでしょう。

構成に関しては、単一リージョンのレプリケーションと違いはなく、単に異なる場所にあるホストをレプリカに使用します。

詳細については、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
