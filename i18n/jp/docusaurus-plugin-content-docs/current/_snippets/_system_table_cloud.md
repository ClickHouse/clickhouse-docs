:::note ClickHouse Cloud でのクエリ実行
このシステムテーブルのデータは、ClickHouse Cloud の各ノードにローカルで保持されています。したがって、すべてのデータを俯瞰的に取得するには `clusterAllReplicas` 関数を使用する必要があります。詳細は[こちら](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)を参照してください。
:::