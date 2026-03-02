:::note ClickHouse Cloud에서 쿼리하기
이 시스템 테이블의 데이터는 ClickHouse Cloud의 각 노드에 로컬로 저장됩니다. 따라서 전체 데이터를 조회하려면 `clusterAllReplicas` 함수를 사용해야 합니다. 자세한 내용은 [여기](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)를 참고하십시오.
:::