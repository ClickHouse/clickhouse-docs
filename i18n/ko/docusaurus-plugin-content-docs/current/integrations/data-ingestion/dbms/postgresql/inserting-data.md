---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQL에서 데이터를 삽입하는 방법'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes, PeerDB 또는 Postgres 테이블 함수(Postgres table function)를 사용하여 PostgreSQL에서 데이터를 삽입하는 방법을 설명하는 페이지입니다.'
doc_type: 'guide'
---

ClickHouse에 데이터 삽입 성능을 최적화하기 위한 모범 사례를 학습하려면 [이 가이드](/guides/inserting-data)를 읽을 것을 권장합니다.

PostgreSQL에서 대량으로 데이터를 적재할 때는 다음 방법을 사용할 수 있습니다:

- [ClickPipes](/integrations/clickpipes/postgres)를 사용하는 방법으로, ClickHouse Cloud를 위한 관리형 통합 서비스입니다.
- `PeerDB by ClickHouse`를 사용하는 방법으로, PostgreSQL 데이터베이스를 셀프 호스팅한 ClickHouse와 ClickHouse Cloud 모두로 복제하도록 특별히 설계된 ETL 도구입니다.
- 데이터를 직접 읽기 위해 [Postgres Table Function](/sql-reference/table-functions/postgresql)을 사용하는 방법입니다. 이는 일반적으로 타임스탬프와 같은 알려진 워터마크를 기반으로 하는 배치 복제가 충분한 경우나 단발성 마이그레이션에 적합합니다. 이 방식은 수천만 행까지 확장 가능합니다. 더 큰 데이터셋을 마이그레이션하려는 사용자는 데이터를 여러 청크로 나누어 각 청크를 별도의 요청으로 처리하는 방법을 고려해야 합니다. 각 청크에 대해 스테이징 테이블을 사용한 후, 해당 파티션을 최종 테이블로 이동할 수 있습니다. 이렇게 하면 실패한 요청을 재시도할 수 있습니다. 이 대량 적재 전략에 대한 자세한 내용은 여기에서 확인할 수 있습니다.
- Postgres에서 데이터를 CSV 형식으로 내보낸 후, 로컬 파일에서 직접 또는 테이블 함수를 사용하여 객체 스토리지를 통해 ClickHouse에 삽입할 수 있습니다.