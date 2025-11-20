:::note ClickHouse Cloud でのクエリ実行
このシステムテーブル内のデータは、ClickHouse Cloud の各ノードにローカルに保持されます。そのため、すべてのデータを網羅的に取得するには `clusterAllReplicas` 関数が必要です。詳細については[こちら](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)を参照してください。
:::