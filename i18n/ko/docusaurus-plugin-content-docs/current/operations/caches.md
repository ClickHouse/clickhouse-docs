---
'description': '쿼리를 수행할 때, ClickHouse는 다양한 캐시를 사용합니다.'
'sidebar_label': '캐시'
'sidebar_position': 65
'slug': '/operations/caches'
'title': '캐시 유형'
'keywords':
- 'cache'
'doc_type': 'reference'
---


# 캐시 유형

쿼리를 수행할 때 ClickHouse는 쿼리를 가속화하고 디스크에서 읽거나 쓰는 필요성을 줄이기 위해 다양한 캐시를 사용합니다.

주요 캐시 유형은 다음과 같습니다:

- `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블 엔진에서 사용하는 [마크](/development/architecture#merge-tree) 캐시.
- `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블 엔진에서 사용하는 압축되지 않은 데이터의 캐시.
- 운영 체제 페이지 캐시 (실제 데이터가 있는 파일에 대해 간접적으로 사용됨).

또한 여러 추가 캐시 유형이 있습니다:

- DNS 캐시.
- [정규 표현식](./interfaces/formats/Regexp) 캐시.
- 컴파일된 표현식 캐시.
- [벡터 유사성 인덱스](../engines/table-engines/mergetree-family/annindexes.md) 캐시.
- [텍스트 인덱스](../engines/table-engines/mergetree-family/invertedindexes.md#tuning-the-text-index) 캐시.
- [Avro 형식](/interfaces/formats/Avro) 스키마 캐시.
- [딕셔너리](../sql-reference/dictionaries/index.md) 데이터 캐시.
- 스키마 추론 캐시.
- [파일 시스템 캐시](storing-data.md) - S3, Azure, 로컬 및 기타 디스크에서.
- [사용자 공간 페이지 캐시](/operations/userspace-page-cache).
- [쿼리 캐시](query-cache.md).
- [쿼리 조건 캐시](query-condition-cache.md).
- 형식 스키마 캐시.

성능 조정, 문제 해결 또는 데이터 일관성 이유로 캐시 중 하나를 삭제하려면 [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) 문을 사용할 수 있습니다.
