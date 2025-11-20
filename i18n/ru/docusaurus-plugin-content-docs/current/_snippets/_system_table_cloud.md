:::note Выполнение запросов в ClickHouse Cloud
Данные в этой системной таблице хранятся локально на каждом узле в ClickHouse Cloud. Поэтому для получения полного представления обо всех данных необходимо использовать функцию `clusterAllReplicas`. Дополнительные сведения см. [здесь](/operations/system-tables/overview#system-tables-in-clickhouse-cloud).
:::