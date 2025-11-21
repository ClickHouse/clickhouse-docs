---
slug: /faq/operations/multi-region-replication
title: 'ClickHouse はマルチリージョンレプリケーションをサポートしていますか？'
toc_hidden: true
toc_priority: 30
description: 'このページでは、ClickHouse がマルチリージョンレプリケーションをサポートしているかどうかを解説します'
doc_type: 'reference'
keywords: ['multi-region', 'replication', 'geo-distributed', 'distributed systems', 'data synchronization']
---



# ClickHouseはマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

端的に言えば「はい」です。ただし、すべてのリージョン/データセンター間のレイテンシを2桁のミリ秒範囲に保つことを推奨します。そうしないと、分散コンセンサスプロトコルを経由するため、書き込みパフォーマンスが低下します。例えば、米国の東海岸と西海岸間のレプリケーションは問題なく動作する可能性が高いですが、米国と欧州間では適切に動作しない可能性があります。

設定に関しては、単一リージョンレプリケーションと比較して違いはありません。レプリカ用に異なる場所に配置されたホストを使用するだけです。

詳細については、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
