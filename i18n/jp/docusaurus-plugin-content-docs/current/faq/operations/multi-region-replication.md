---
slug: /faq/operations/multi-region-replication
title: 'ClickHouse はマルチリージョンレプリケーションをサポートしますか？'
toc_hidden: true
toc_priority: 30
description: 'このページでは、ClickHouse がマルチリージョンレプリケーションをサポートしているかどうかを説明します'
doc_type: 'reference'
keywords: ['マルチリージョン', 'レプリケーション', '地理的分散', '分散システム', 'データ同期']
---



# ClickHouse はマルチリージョンレプリケーションをサポートしていますか？ {#does-clickhouse-support-multi-region-replication}

結論としては「はい」です。ただし、すべてのリージョン／データセンター間のレイテンシは 2 桁台に収まるようにすることを推奨します。そうでない場合、分散コンセンサスプロトコルを経由するため、書き込みパフォーマンスが低下します。たとえば、米国の東西海岸間でのレプリケーションは問題なく機能する可能性が高いですが、米国とヨーロッパ間では現実的ではありません。

設定面では、単一リージョンでのレプリケーションと違いはありません。レプリカとして、異なる場所にあるホストを指定して使用するだけです。

詳しくは、[データレプリケーションに関する詳細な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
