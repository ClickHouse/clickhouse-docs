:::note ClickHouse Cloud におけるクエリ
このシステムテーブルのデータは、ClickHouse Cloud 内の各ノードにローカルに保持されています。そのため、すべてのデータの全体像を取得するには `clusterAllReplicas` 関数が必要です。詳細は[こちら](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)を参照してください。
:::