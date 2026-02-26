---
description: '쿼리를 실행할 때 ClickHouse는 여러 종류의 캐시를 사용합니다.'
sidebar_label: '캐시'
sidebar_position: 65
slug: /operations/caches
title: '캐시 유형'
keywords: ['캐시']
doc_type: 'reference'
---

# 캐시 유형 \{#cache-types\}

쿼리를 수행할 때 ClickHouse는 여러 가지 캐시를 사용하여 쿼리를 빠르게 처리하고,
디스크에 대한 읽기 및 쓰기 필요를 줄입니다.

주요 캐시 유형은 다음과 같습니다:

* `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블 엔진에서 사용하는 [마크](/development/architecture#merge-tree) 캐시.
* `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블 엔진에서 사용하는 비압축 데이터 캐시.
* 운영 체제 페이지 캐시(실제 데이터가 있는 파일에 대해 간접적으로 사용됨).

이 외에도 다양한 추가 캐시 유형이 있습니다:

* DNS 캐시.
* [Regexp](/interfaces/formats/Regexp) 캐시.
* 컴파일된 표현식 캐시.
* [Vector similarity index](../engines/table-engines/mergetree-family/annindexes.md) 캐시.
* [Text index](../engines/table-engines/mergetree-family/textindexes.md#caching) 캐시.
* [Avro format](/interfaces/formats/Avro) 스키마 캐시.
* [Dictionaries](../sql-reference/statements/create/dictionary/overview.md) 데이터 캐시.
* 스키마 추론 캐시.
* S3, Azure, 로컬 및 기타 디스크용 [Filesystem cache](storing-data.md).
* [Userspace page cache](/operations/userspace-page-cache)
* [Query cache](query-cache.md).
* [Query condition cache](query-condition-cache.md).
* 포맷 스키마 캐시.

성능 튜닝, 문제 해결 또는 데이터 일관성 확보를 위해 캐시 중 하나를 비우려면
[`SYSTEM CLEAR ... CACHE`](../sql-reference/statements/system.md) SQL 문을 사용할 수 있습니다.