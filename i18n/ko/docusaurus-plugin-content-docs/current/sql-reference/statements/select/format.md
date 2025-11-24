---
'description': 'FORMAT 절에 대한 문서'
'sidebar_label': 'FORMAT'
'slug': '/sql-reference/statements/select/format'
'title': 'FORMAT 절'
'doc_type': 'reference'
---


# FORMAT 절

ClickHouse는 쿼리 결과 등에서 사용할 수 있는 다양한 [직렬화 형식](../../../interfaces/formats.md)을 지원합니다. `SELECT` 출력 형식을 선택하는 방법은 여러 가지가 있으며, 그 중 하나는 쿼리 끝에 `FORMAT format`을 지정하여 특정 형식으로 결과 데이터를 얻는 것입니다.

특정 형식은 편리함, 다른 시스템과의 통합 또는 성능 향상을 위해 사용될 수 있습니다.

## 기본 형식 {#default-format}

`FORMAT` 절이 생략되면 기본 형식이 사용되며, 이는 ClickHouse 서버에 접근하는 데 사용되는 설정 및 인터페이스에 따라 달라집니다. [HTTP 인터페이스](../../../interfaces/http.md) 및 배치 모드에서의 [명령줄 클라이언트](../../../interfaces/cli.md)에서는 기본 형식이 `TabSeparated`입니다. 대화형 모드에서의 명령줄 클라이언트에서는 기본 형식이 `PrettyCompact`입니다(이는 사람이 읽기 쉬운 압축된 테이블을 생성합니다).

## 구현 세부사항 {#implementation-details}

명령줄 클라이언트를 사용할 때, 데이터는 항상 내부 효율적인 형식(`Native`)으로 네트워크를 통해 전송됩니다. 클라이언트는 쿼리의 `FORMAT` 절을 독립적으로 해석하고 데이터를 자체적으로 포맷합니다(따라서 네트워크와 서버의 추가 부하를 경감시킵니다).
