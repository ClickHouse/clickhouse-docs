---
description: '기본 타입에 추가 기능을 제공하는 ClickHouse 도메인 타입 개요'
sidebar_label: '도메인'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: '도메인'
doc_type: 'reference'
---



# 도메인(Domains) \{#domains\}

도메인은 기존 기본 타입 위에 추가 기능을 제공하면서도, 기본 데이터 타입의 전송 형식(on-wire format)과 디스크 상의 형식(on-disk format)을 그대로 유지하는 특수 목적 타입입니다. 현재 ClickHouse에서는 사용자 정의 도메인을 지원하지 않습니다.

도메인은 해당 기본 타입을 사용할 수 있는 곳이라면 어디에서나 사용할 수 있습니다. 예를 들면 다음과 같습니다.

- 도메인 타입 컬럼 생성
- 도메인 컬럼에서 값 읽기/도메인 컬럼에 값 쓰기
- 기본 타입을 인덱스로 사용할 수 있는 경우 인덱스로 사용
- 도메인 컬럼 값을 사용하여 함수 호출

### 도메인의 추가 기능 \{#extra-features-of-domains\}

- `SHOW CREATE TABLE` 또는 `DESCRIBE TABLE`에서 명시적인 컬럼 타입 이름 사용
- `INSERT INTO domain_table(domain_column) VALUES(...)`를 사용한 사람이 읽기 쉬운 형식의 입력
- `SELECT domain_column FROM domain_table`에 대한 사람이 읽기 쉬운 형식의 출력
- 사람이 읽기 쉬운 형식으로 되어 있는 외부 소스에서의 데이터 적재: `INSERT INTO domain_table FORMAT CSV ...`

### 제한 사항 \{#limitations\}

- `ALTER TABLE`을 통해 기본 타입의 인덱스 컬럼을 도메인 타입으로 변환할 수 없습니다.
- 다른 컬럼이나 테이블에서 데이터를 삽입할 때 문자열 값을 도메인 값으로 암시적으로 변환할 수 없습니다.
- 도메인은 저장된 값에 대해 아무런 제약도 추가하지 않습니다.
