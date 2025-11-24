---
'description': 'ClickHouse의 도메인 유형에 대한 개요로, 기본 유형에 추가 기능을 확장합니다.'
'sidebar_label': '도메인'
'sidebar_position': 56
'slug': '/sql-reference/data-types/domains/'
'title': '도메인'
'doc_type': 'reference'
---


# 도메인

도메인은 기존 기본 유형 위에 추가 기능을 추가하는 특수 목적 유형이며, 기본 데이터 유형의 전송 중 및 디스크 형식은 그대로 유지합니다. 현재 ClickHouse는 사용자 정의 도메인을 지원하지 않습니다.

도메인은 해당 기본 유형을 사용할 수 있는 곳이면 어디에서나 사용할 수 있습니다. 예를 들어:

- 도메인 유형의 컬럼 생성
- 도메인 컬럼에서 읽기/쓰기 값
- 기본 유형을 인덱스로 사용할 수 있다면 인덱스로 사용
- 도메인 컬럼의 값으로 함수 호출

### 도메인의 추가 기능 {#extra-features-of-domains}

- `SHOW CREATE TABLE` 또는 `DESCRIBE TABLE`에서 명시적인 컬럼 유형 이름
- `INSERT INTO domain_table(domain_column) VALUES(...)`를 사용하여 사람 친화적인 형식으로 입력
- `SELECT domain_column FROM domain_table`에 대한 사람 친화적인 형식으로 출력
- 외부 소스에서 데이터를 사람 친화적인 형식으로 로드: `INSERT INTO domain_table FORMAT CSV ...`

### 제한 사항 {#limitations}

- `ALTER TABLE`를 통해 기본 유형의 인덱스 컬럼을 도메인 유형으로 변환할 수 없습니다.
- 다른 컬럼 또는 테이블에서 데이터를 삽입할 때 문자열 값을 도메인 값으로 암시적으로 변환할 수 없습니다.
- 도메인은 저장된 값에 대한 제약 조건을 추가하지 않습니다.
