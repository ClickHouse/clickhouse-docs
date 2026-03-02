---
description: 'ClickHouse의 String 데이터 타입에 대한 문서'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String \{#string\}

임의 길이의 문자열입니다. 길이에 제한이 없습니다. 값에는 널 바이트(null byte)를 포함해 임의의 바이트 집합이 들어갈 수 있습니다.
`String` 타입은 다른 DBMS의 `VARCHAR`, `BLOB`, `CLOB` 등의 타입을 대체합니다.

테이블을 생성할 때 문자열 필드에 대해 숫자 매개변수(예: `VARCHAR(255)`)를 설정할 수 있지만, ClickHouse는 이를 무시합니다.

별칭:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,



## 인코딩 \{#encodings\}

ClickHouse에는 인코딩이라는 개념이 없습니다. 문자열은 임의의 바이트 집합을 포함할 수 있으며, 그대로 저장되고 출력됩니다.
텍스트를 저장해야 하는 경우 UTF-8 인코딩 사용을 권장합니다. 최소한 터미널이 권장대로 UTF-8을 사용하도록 설정되어 있다면, 값을 변환 없이 읽고 쓸 수 있습니다.
마찬가지로, 문자열을 처리하는 일부 함수는 문자열이 UTF-8로 인코딩된 텍스트를 나타내는 바이트 집합을 포함한다고 가정하고 동작하는 별도의 변형 함수를 제공합니다.
예를 들어 [length](/sql-reference/functions/array-functions#length) 함수는 문자열 길이를 바이트 단위로 계산하는 반면, [lengthUTF8](../functions/string-functions.md#lengthUTF8) 함수는 값이 UTF-8로 인코딩되어 있다고 가정하고 문자열 길이를 유니코드 코드 포인트 기준으로 계산합니다.
