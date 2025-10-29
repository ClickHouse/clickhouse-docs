---
'slug': '/faq/operations/multi-region-replication'
'title': 'ClickHouseはマルチリージョンレプリケーションをサポートしていますか？'
'toc_hidden': true
'toc_priority': 30
'description': 'このページではClickHouseがマルチリージョンレプリケーションをサポートしているかどうかを回答します。'
'doc_type': 'reference'
---


# Does ClickHouse support multi-region replication? {#does-clickhouse-support-multi-region-replication}

短い答えは「はい」です。ただし、すべてのリージョン/データセンター間のレイテンシを二桁の範囲に保つことをお勧めします。そうでない場合、分散合意プロトコルを通過するため、書き込みパフォーマンスが低下します。例えば、アメリカの両海岸間のレプリケーションは問題なく機能する可能性がありますが、アメリカとヨーロッパの間ではそうではないでしょう。

構成に関しては、単一リージョンのレプリケーションと比較して違いはありません。単に異なる場所にあるホストをレプリカとして使用してください。

詳細については、[データレプリケーションに関する完全な記事](../../engines/table-engines/mergetree-family/replication.md)を参照してください。
