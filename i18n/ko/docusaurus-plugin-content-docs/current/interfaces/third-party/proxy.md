---
'description': 'ClickHouse에 대한 사용 가능한 타사 프록시 솔루션을 설명합니다.'
'sidebar_label': 'Proxies'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': '타사 개발자의 프록시 서버'
'doc_type': 'reference'
---


# 타사 개발자의 프록시 서버

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy)는 ClickHouse 데이터베이스를 위한 HTTP 프록시 및 로드 밸런서입니다.

기능:

- 사용자별 라우팅 및 응답 캐싱.
- 유연한 제한.
- 자동 SSL 인증서 갱신.

Go로 구현되었습니다.

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse)는 ClickHouse와 애플리케이션 서버 사이의 로컬 프록시로 설계되었습니다. 애플리케이션 측에서 INSERT 데이터를 버퍼링하는 것이 불가능하거나 불편한 경우에 사용됩니다.

기능:

- 메모리 및 디스크 데이터 버퍼링.
- 테이블별 라우팅.
- 로드 밸런싱 및 상태 점검.

Go로 구현되었습니다.

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk)은 간단한 ClickHouse 삽입 수집기입니다.

기능:

- 요청 그룹화 및 임계값 또는 간격에 따라 전송.
- 여러 원격 서버.
- 기본 인증.

Go로 구현되었습니다.
