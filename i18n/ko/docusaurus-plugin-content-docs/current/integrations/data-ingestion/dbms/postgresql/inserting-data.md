---
'slug': '/integrations/postgresql/inserting-data'
'title': 'PostgreSQL에서 데이터 삽입하는 방법'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': 'ClickPipes, PeerDB 또는 Postgres 테이블 함수를 사용하여 PostgreSQL에서 데이터를 삽입하는
  방법을 설명하는 페이지'
'doc_type': 'guide'
---

We recommend reading [this guide](/guides/inserting-data) to learn best practices on inserting data to ClickHouse to optimize for insert performance.

For bulk loading data from PostgreSQL, users can use:

- using [ClickPipes](/integrations/clickpipes/postgres), the managed integration service for ClickHouse Cloud.
- `PeerDB by ClickHouse`, an ETL tool specifically designed for PostgreSQL 데이터베이스 복제를 위해 자체 호스팅된 ClickHouse와 ClickHouse Cloud 모두에 사용됩니다.
- The [Postgres Table Function](/sql-reference/table-functions/postgresql) to read data directly. This is typically appropriate for if batch replication based on a known watermark, e.g. a timestamp. is sufficient or if it's a once-off migration. This approach can scale to 10's of millions of 행. Users looking to migrate larger datasets should consider multiple requests, each dealing with a chunk of the data. Staging 테이블 can be used for each chunk prior to its 파티션 being moved to a final table. This allows failed requests to be retried.  For further details on this bulk-loading strategy, see here.
- Data can be exported from Postgres in CSV format. This can then be inserted into ClickHouse from either local files or via object storage using 테이블 함수.
