---
description: 'ClickHouse용 타사 프록시 솔루션을 설명합니다'
sidebar_label: '프록시'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: '타사 개발자가 제공하는 프록시 서버'
doc_type: 'reference'
---



# 서드파티 개발자가 제공하는 프록시 서버 \{#proxy-servers-from-third-party-developers\}



## chproxy \{#chproxy\}

[chproxy](https://github.com/Vertamedia/chproxy)는 ClickHouse 데이터베이스용 HTTP 프록시이자 로드 밸런서입니다.

기능:

- 사용자별 라우팅 및 응답 캐싱
- 유연한 제한 설정
- 자동 SSL 인증서 갱신

Go로 구현되었습니다.



## KittenHouse \{#kittenhouse\}

[KittenHouse](https://github.com/VKCOM/kittenhouse)는 애플리케이션 측에서 `INSERT` 데이터를 버퍼링하기 어렵거나 불편한 경우, ClickHouse와 애플리케이션 서버 사이의 로컬 프록시로 동작하도록 설계되었습니다.

기능:

- 메모리 및 디스크 기반 데이터 버퍼링
- 테이블별 라우팅
- 로드 밸런싱 및 헬스 체크

Go로 구현되었습니다.



## ClickHouse-Bulk \{#clickhouse-bulk\}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk)는 간단한 ClickHouse insert 수집기입니다.

기능:

- 요청을 묶어서 임계값 또는 간격에 따라 전송합니다.
- 여러 원격 서버를 지원합니다.
- 기본 인증을 지원합니다.

Go로 구현되었습니다.
