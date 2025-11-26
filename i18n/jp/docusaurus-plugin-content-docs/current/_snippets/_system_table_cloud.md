:::note ClickHouse Cloud でのクエリ実行
このシステムテーブルのデータは、ClickHouse Cloud の各ノードにローカルに格納されています。そのため、すべてのデータを包括的に確認するには、`clusterAllReplicas` 関数を使用する必要があります。詳細については[こちら](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)を参照してください。
:::