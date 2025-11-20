---
'description': 'ClickHouse의 문자열 데이터 유형에 대한 문서'
'sidebar_label': '문자열'
'sidebar_position': 8
'slug': '/sql-reference/data-types/string'
'title': '문자열'
'doc_type': 'reference'
---


# 문자열

임의의 길이를 가진 문자열. 길이에 제한이 없습니다. 값은 null 바이트를 포함하여 임의의 바이트 집합을 포함할 수 있습니다.  
String 타입은 다른 DBMS의 VARCHAR, BLOB, CLOB 등 타입을 대체합니다.

테이블을 생성할 때 문자열 필드에 대한 숫자 매개변수를 설정할 수 있지만(e.g. `VARCHAR(255)`), ClickHouse는 이를 무시합니다.

별칭:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## 인코딩 {#encodings}

ClickHouse는 인코딩의 개념이 없습니다. 문자열은 임의의 바이트 집합을 포함할 수 있으며, 이는 있는 그대로 저장 및 출력됩니다.  
텍스트를 저장해야 하는 경우, UTF-8 인코딩을 사용하는 것을 권장합니다. 최소한, 터미널이 UTF-8을 사용하는 경우(권장됨), 변환 없이 값을 읽고 쓸 수 있습니다.  
마찬가지로, 문자열 작업을 위한 특정 함수들은 문자열이 UTF-8 인코딩된 텍스트를 나타내는 바이트 집합을 포함한다고 가정하는 별도의 변형이 있습니다.  
예를 들어, [length](/sql-reference/functions/array-functions#length) 함수는 문자열 길이를 바이트 단위로 계산하고, [lengthUTF8](../functions/string-functions.md#lengthUTF8) 함수는 값이 UTF-8 인코딩되어 있다고 가정하고 문자열 길이를 유니코드 코드 포인트 단위로 계산합니다.
