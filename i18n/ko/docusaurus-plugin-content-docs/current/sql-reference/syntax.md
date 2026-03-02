---
description: '구문에 대한 문서'
sidebar_label: '구문'
sidebar_position: 2
slug: /sql-reference/syntax
title: '구문'
doc_type: 'reference'
---

이 섹션에서는 ClickHouse의 SQL 구문을 살펴봅니다. 
ClickHouse는 SQL을 기반으로 한 구문을 사용하지만, 다양한 확장 기능과 최적화를 제공합니다.

## 쿼리 파싱 \{#query-parsing\}

ClickHouse에는 두 종류의 파서가 있습니다.

* *전체 SQL 파서*(재귀 하강 파서)
* *데이터 포맷 파서*(고속 스트림 파서)

전체 SQL 파서는 `INSERT` 쿼리를 제외한 모든 경우에 사용되며, `INSERT` 쿼리는 두 파서를 모두 사용합니다.

다음 쿼리를 살펴보겠습니다:

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

앞에서 언급했듯이 `INSERT` 쿼리는 두 종류의 파서를 모두 사용합니다.
`INSERT INTO t VALUES` 구문은 전체 파서(full parser)가 파싱하고,
데이터 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` 는 데이터 포맷 파서 또는 빠른 스트림 파서가 파싱합니다.

<details>
  <summary>전체 파서 켜기</summary>

  [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 설정을 사용하여
  데이터에 대해서도 전체 파서를 켤 수 있습니다.

  위에서 언급한 설정을 `1`로 지정하면,
  ClickHouse는 먼저 빠른 스트림 파서를 사용하여 값을 파싱하려고 합니다.
  실패할 경우, ClickHouse는 데이터를 SQL [expression](#expressions)처럼 취급하여 전체 파서로 파싱을 시도합니다.
</details>

데이터는 어떤 포맷이든 사용할 수 있습니다.
쿼리가 수신되면 서버는 요청의 최대 [max&#95;query&#95;size](../operations/settings/settings.md#max_query_size) 바이트까지만 RAM에서 처리하고
(기본값은 1MB), 나머지는 스트림 방식으로 파싱합니다.
이는 대용량 `INSERT` 쿼리에서 발생할 수 있는 문제를 피하기 위한 것으로, ClickHouse에 데이터를 삽입하는 데 권장되는 방식입니다.

`INSERT` 쿼리에서 [`Values`](/interfaces/formats/Values) 포맷을 사용할 때,
데이터가 `SELECT` 쿼리의 expression과 동일한 방식으로 파싱되는 것처럼 보일 수 있지만 실제로는 그렇지 않습니다.
`Values` 포맷은 훨씬 더 제한적입니다.

이 절의 나머지 부분에서는 전체 파서에 대해 설명합니다.

:::note
포맷 파서에 대한 더 많은 정보는 [Formats](../interfaces/formats.md) 섹션을 참고하십시오.
:::


## 공백 \{#spaces\}

- 구문 구성 요소 사이(쿼리의 시작과 끝을 포함)에는 공백 문자가 얼마든지 올 수 있습니다. 
- 공백 문자에는 스페이스, 탭, 줄 바꿈(라인 피드), CR(캐리지 리턴), 폼 피드가 포함됩니다.

## 주석 \{#comments\}

ClickHouse는 SQL 스타일과 C 스타일 주석을 모두 지원합니다.

- SQL 스타일 주석은 `--`, `#!` 또는 `# `로 시작하여 줄 끝까지 이어집니다. `--`와 `#!` 뒤의 공백은 생략할 수 있습니다.
- C 스타일 주석은 `/*`와 `*/` 사이에 작성되며, 여러 줄에 걸칠 수 있습니다. 공백 역시 필수는 아닙니다.

## 키워드 \{#keywords\}

ClickHouse에서 키워드는 상황에 따라 *대소문자를 구분(case-sensitive)* 하거나 *대소문자를 구분하지 않을 수 있습니다(case-insensitive)*.

다음에 해당하는 경우 키워드는 **대소문자를 구분하지 않습니다(case-insensitive)**.

* SQL 표준. 예를 들어 `SELECT`, `select`, `SeLeCt` 모두 유효합니다.
* 일부 널리 사용되는 DBMS(MySQL 또는 Postgres)의 구현. 예를 들어 `DateTime`은 `datetime`과 동일합니다.

:::note
데이터 타입 이름이 대소문자를 구분하는지 여부는 [system.data&#95;type&#95;families](/operations/system-tables/data_type_families) 테이블에서 확인할 수 있습니다.
:::

표준 SQL과는 달리, 그 외 모든 키워드(함수 이름 포함)는 **대소문자를 구분합니다(case-sensitive)**.

또한 키워드는 예약어가 아닙니다.
해당되는 문맥에서만 키워드로 취급됩니다.
키워드와 같은 이름의 [식별자](#identifiers)를 사용하는 경우, 큰따옴표나 백틱으로 감싸야 합니다.

예를 들어, 테이블 `table_name`에 `"FROM"`이라는 이름의 컬럼이 있는 경우 다음 쿼리는 유효합니다:

```sql
SELECT "FROM" FROM table_name
```


## 식별자 \{#identifiers\}

식별자는 다음과 같습니다.

- 클러스터, 데이터베이스, 테이블, 파티션, 컬럼 이름
- [함수](#functions)
- [데이터 타입](../sql-reference/data-types/index.md)
- [식 별칭](#expression-aliases)

식별자는 따옴표로 둘러싼 형태(quoted)와 따옴표로 둘러싸지 않은 형태(non-quoted)가 있으며, 일반적으로는 후자를 사용하는 것이 권장됩니다.

따옴표로 둘러싸지 않은 식별자는 정규식 `^[a-zA-Z_][0-9a-zA-Z_]*$`와 일치해야 하며, [키워드](#keywords)와 동일할 수 없습니다.
유효한 식별자와 유효하지 않은 식별자의 예시는 아래 표를 참고하십시오.

| 유효한 식별자                                    | 유효하지 않은 식별자                     |
|--------------------------------------------------|------------------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_`   | `1x`, `tom@gmail.com`, `äußerst_schön`   |

식별자를 키워드와 동일하게 사용하거나 식별자에 다른 기호를 사용하려면 `"id"`, `` `id` ``처럼 큰따옴표나 백틱으로 감싸서 사용하십시오.

:::note
따옴표로 둘러싸인 식별자에 적용되는 이스케이프 규칙은 문자열 리터럴에도 동일하게 적용됩니다. 자세한 내용은 [String](#string)을 참고하십시오.
:::

## 리터럴 \{#literals\}

ClickHouse에서 리터럴은 쿼리에서 직접 지정하는 값입니다.
다시 말해, 쿼리 실행 중에 변하지 않는 고정 값입니다.

리터럴의 종류는 다음과 같습니다:

- [문자열(String)](#string)
- [숫자형(Numeric)](#numeric)
- [복합형(Compound)](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc) (사용자 정의 문자열 리터럴)

아래 섹션에서 각 유형을 더 자세히 살펴봅니다.

### String \{#string\}

문자열 리터럴은 작은따옴표로 감싸야 합니다. 큰따옴표는 지원되지 않습니다.

이스케이프는 다음 두 가지 방식으로 동작합니다.

- 앞에 작은따옴표를 사용하여, 작은따옴표 문자 `'`(이 문자만 해당)를 `''` 형태로 이스케이프하거나,
- 앞에 백슬래시를 사용하여, 아래 표에 나열된 지원되는 이스케이프 시퀀스를 사용하는 방식입니다.

:::note
백슬래시는 아래에 나열된 문자 외의 문자가 뒤따르는 경우 특수한 의미를 잃고 문자 그대로 해석됩니다.
:::

| Supported Escape                    | Description                                                             |
|-------------------------------------|-------------------------------------------------------------------------|
| `\xHH`                              | 8비트 문자 지정으로, 그 뒤에 임의 개수의 16진수 숫자(H)가 올 수 있음              | 
| `\N`                                | 예약됨, 아무 동작도 하지 않음 (예: `SELECT 'a\Nb'`는 `ab`를 반환)              |
| `\a`                                | 경고(벨)                                                                |
| `\b`                                | 백스페이스                                                              |
| `\e`                                | escape 문자                                                             |
| `\f`                                | 폼 피드                                                                 |
| `\n`                                | 라인 피드(줄 바꿈)                                                      |
| `\r`                                | 캐리지 리턴                                                             |
| `\t`                                | 수평 탭                                                                 |
| `\v`                                | 수직 탭                                                                 |
| `\0`                                | null 문자                                                               |
| `\\`                                | 백슬래시                                                                |
| `\'` (or ` '' `)                    | 작은따옴표                                                              |
| `\"`                                | 큰따옴표                                                                |
| `` ` ``                             | 백틱                                                                    |
| `\/`                                | 슬래시(정방향 슬래시)                                                   |
| `\=`                                | 등호                                                                    |
| ASCII control characters (c &lt;= 31). | ASCII 제어 문자(c &lt;= 31)                                           |

:::note
문자열 리터럴에서는 최소한 `'`과 `\`는 각각 이스케이프 코드 `\'`(또는 `''`)와 `\\`를 사용하여 이스케이프해야 합니다.
:::

### 숫자형 \{#numeric\}

숫자 리터럴은 다음과 같이 파싱됩니다.

* 리터럴 앞에 마이너스 기호 `-`가 붙어 있으면, 해당 토큰은 건너뛰고 파싱이 끝난 후 결과에 음수를 적용합니다.
* 숫자 리터럴은 먼저 [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 함수를 사용해 64비트 부호 없는 정수로 파싱됩니다.
  * 값 앞에 `0b` 또는 `0x`/`0X`가 붙어 있으면, 각각 이진수 또는 16진수로 파싱됩니다.
  * 값이 음수이고 절대값이 2<sup>63</sup>보다 크면 오류를 반환합니다.
* 위 과정이 실패하면, [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 함수를 사용해 부동 소수점 값으로 파싱을 시도합니다.
* 그렇지 않으면 오류를 반환합니다.

리터럴 값은 해당 값이 들어갈 수 있는 가장 작은 타입으로 캐스팅됩니다.
예를 들어:

* `1`은 `UInt8`로 파싱됩니다.
* `256`은 `UInt16`으로 파싱됩니다.

:::note Important
64비트보다 폭이 넓은 정수 값(`UInt128`, `Int128`, `UInt256`, `Int256`)은 올바르게 파싱되려면 더 큰 타입으로 캐스팅해야 합니다:

```sql
-170141183460469231731687303715884105728::Int128
340282366920938463463374607431768211455::UInt128
-57896044618658097711785492504343953926634992332820282019728792003956564819968::Int256
115792089237316195423570985008687907853269984665640564039457584007913129639935::UInt256
```

이 방식은 위의 알고리즘을 우회하고, 임의 정밀도를 지원하는 루틴으로 정수를 파싱합니다.

그렇지 않으면 해당 리터럴은 부동소수점 수로 파싱되며, 잘림으로 인해 정밀도가 손실될 수 있습니다.
:::

자세한 내용은 [Data types](../sql-reference/data-types/index.md)를 참조하십시오.

숫자 리터럴 내부의 밑줄 `_`은 무시되며, 가독성을 높이기 위해 사용할 수 있습니다.

다음과 같은 수치형(Numeric) 리터럴을 지원합니다:

| 수치형 리터럴(Numeric Literal)            | 예시                                              |
| ----------------------------------- | ----------------------------------------------- |
| **정수(Integers)**                    | `1`, `10_000_000`, `18446744073709551615`, `01` |
| **소수(Decimals)**                    | `0.1`                                           |
| **지수 표기(Exponential notation)**     | `1e100`, `-1e-100`                              |
| **부동소수점 수(Floating point numbers)** | `123.456`, `inf`, `nan`                         |
| **16진수(Hex)**                       | `0xc0fe`                                        |
| **SQL 표준 호환 16진수 문자열**              | `x'c0fe'`                                       |
| **2진수(Binary)**                     | `0b1101`                                        |
| **SQL 표준 호환 2진수 문자열**               | `b'1101'`                                       |

:::note
해석 시 우발적인 오류를 방지하기 위해 8진수 리터럴은 지원되지 않습니다.
:::


### 복합형 \{#compound\}

배열은 대괄호를 사용해 `[1, 2, 3]`처럼 구성합니다. 튜플은 소괄호를 사용해 `(1, 'Hello, world!', 2)`처럼 구성합니다.
기술적으로 이들은 리터럴이 아니라, 각각 배열 생성 연산자와 튜플 생성 연산자를 사용하는 표현식입니다.
배열은 최소 하나의 항목으로 구성되어야 하며, 튜플은 최소 두 개의 항목을 가져야 합니다.

:::note
`SELECT` 쿼리의 `IN` 절에 튜플이 나타나는 별도로 취급되는 경우가 있습니다. 
쿼리 결과에는 튜플이 포함될 수 있지만, 튜플은 데이터베이스에 저장할 수 없습니다( [Memory](../engines/table-engines/special/memory.md) 엔진을 사용하는 테이블은 예외입니다).
:::

### NULL \{#null\}

`NULL`은(는) 값이 존재하지 않음을 나타내는 데 사용됩니다. 
테이블 필드에 `NULL`을 저장하려면 해당 필드는 [널 허용(Nullable)](../sql-reference/data-types/nullable.md) 타입이어야 합니다.

:::note
`NULL`에 대해 다음 사항을 유의하십시오.

- 데이터 형식(입력 또는 출력)에 따라 `NULL`은 서로 다른 형태로 표현될 수 있습니다. 자세한 내용은 [데이터 형식](/interfaces/formats)을 참조하십시오.
- `NULL` 처리는 주의할 점이 많습니다. 예를 들어, 비교 연산의 인수 중 하나라도 `NULL`이면 이 연산의 결과도 `NULL`이 됩니다. 곱셈, 덧셈 및 기타 연산도 마찬가지입니다. 각 연산에 대한 문서를 읽을 것을 권장합니다.
- 쿼리에서 `NULL`은 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isNull) 및 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isNotNull) 연산자와 관련 함수 `isNull`, `isNotNull`을 사용하여 확인할 수 있습니다.
:::

### Heredoc \{#heredoc\}

[heredoc](https://en.wikipedia.org/wiki/Here_document)은 여러 줄로 이루어진 문자열을 정의하면서도 원래 서식을 그대로 유지할 수 있는 방법입니다.
heredoc은 두 개의 `$` 기호 사이에 배치한 사용자 지정 문자열 리터럴로 정의됩니다.

예를 들어:

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note

* 두 heredoc 사이의 값은 그대로 처리됩니다.
  :::

:::tip

* heredoc을 사용하여 SQL, HTML, XML 등의 코드 스니펫을 포함할 수 있습니다.
  :::


## 쿼리 매개변수 정의 및 사용 \{#defining-and-using-query-parameters\}

쿼리 매개변수를 사용하면 구체적인 식별자 대신 추상적인 플레이스홀더를 포함하는 범용 쿼리를 작성할 수 있습니다. 
쿼리 매개변수가 포함된 쿼리가 실행되면 
모든 플레이스홀더가 해석되어 실제 쿼리 매개변수 값으로 치환됩니다.

쿼리 매개변수를 정의하는 방법은 두 가지입니다:

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

두 번째 방식을 사용할 때는, 명령줄에서 `clickhouse-client`에 인수로 전달하며, 여기서:

- `<name>`는 쿼리 매개변수의 이름입니다.
- `<value>`는 해당 값입니다.

쿼리 안에서 쿼리 매개변수는 `{<name>: <datatype>}` 형식으로 참조할 수 있으며, 여기서 `<name>`는 쿼리 매개변수 이름이고 `<datatype>`는 변환할 데이터 타입(data type)입니다.

<details>
<summary>SET 명령어 예시</summary>

예를 들어, 다음 SQL은 `a`, `b`, `c`, `d`라는 이름의 매개변수를 정의하며, 각각 서로 다른 데이터 타입을 가집니다:

```sql
SET param_a = 13;
SET param_b = 'str';
SET param_c = '2022-08-04 18:30:53';
SET param_d = {'10': [11, 12], '13': [14, 15]};

SELECT
   {a: UInt32},
   {b: String},
   {c: DateTime},
   {d: Map(String, Array(UInt8))};

13    str    2022-08-04 18:30:53    {'10':[11,12],'13':[14,15]}
```
</details>

<details>
<summary>clickhouse-client 사용 예시</summary>

`clickhouse-client`를 사용하는 경우 매개변수는 `--param_name=value` 형식으로 지정합니다. 예를 들어, 다음 매개변수의 이름은 `message`이며, `String`으로 활용됩니다:

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

쿼리 매개변수가 데이터베이스, 테이블, 함수 또는 기타 식별자의 이름을 나타내는 경우, 타입으로 `Identifier`를 사용합니다. 예를 들어, 다음 쿼리는 `uk_price_paid`라는 이름의 테이블에서 행을 반환합니다:

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
쿼리 매개변수는 임의의 SQL 쿼리에서 임의의 위치에 사용할 수 있는 일반적인 텍스트 치환 기능이 아닙니다. 
주로 식별자나 리터럴이 들어가는 위치에서 `SELECT` SQL 문과 함께 동작하도록 설계되었습니다.
:::

## 함수 \{#functions\}

함수 호출은 식별자 뒤에 소괄호로 묶인 인수 목록(비어 있을 수도 있음)을 붙여서 작성합니다.
표준 SQL과 달리, 인수 목록이 비어 있는 경우에도 소괄호는 반드시 필요합니다.
예를 들어:

```sql
now()
```

또한 다음과 같은 함수들이 있습니다:

* [일반 함수](/sql-reference/functions/overview).
* [집계 함수](/sql-reference/aggregate-functions).

일부 집계 함수는 대괄호 안에 두 개의 인수 목록을 가질 수 있습니다. 예를 들어:

```sql
quantile (0.9)(x) 
```

이러한 집계 함수는 「매개변수 함수(parametric function)」라고 하며,
첫 번째 인수 목록의 인수들을 「매개변수(parameters)」라고 합니다.

:::note
매개변수가 없는 집계 함수의 구문은 일반 함수와 동일합니다.
:::


## 연산자(Operators) \{#operators\}

연산자는 쿼리 파싱 과정에서 우선순위와 결합법칙을 고려하여 해당하는 함수 호출로 변환됩니다.

예를 들어, 다음과 같은 표현식이 있습니다.

```text
1 + 2 * 3 + 4
```

으로 변환됩니다

```text
plus(plus(1, multiply(2, 3)), 4)`
```


## 데이터 타입과 데이터베이스 테이블 엔진 \{#data-types-and-database-table-engines\}

`CREATE` 쿼리에서 데이터 타입과 테이블 엔진은 식별자(identifier)나 함수와 마찬가지 방식으로 작성됩니다. 
즉, 괄호 안에 인수를 포함할 수도 있고 포함하지 않을 수도 있습니다. 

자세한 내용은 다음 섹션을 참조하십시오:

- [데이터 타입](/sql-reference/data-types/index.md)
- [테이블 엔진](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md).

## Expressions \{#expressions\}

식(Expression)은 다음 중 하나가 될 수 있습니다.

- 함수
- 식별자
- 리터럴
- 연산자 적용
- 괄호로 묶인 식
- 서브쿼리
- 별표(*)

또한 [별칭(alias)](#expression-aliases)을 포함할 수 있습니다.

식 목록은 하나 이상의 식이 쉼표로 구분된 것입니다.
함수와 연산자는 인자로 식을 사용할 수 있습니다.

상수 식(constant expression)은 쿼리 분석, 즉 실행 이전에 결과를 알 수 있는 식입니다.
예를 들어, 리터럴만을 사용하는 식은 상수 식입니다.

## 표현식 별칭(Expression Aliases) \{#expression-aliases\}

별칭(alias)은 쿼리에서 [표현식](#expressions)에 대해 사용자가 정의하는 이름입니다.

```sql
expr AS alias
```

위에 제시한 구문의 각 요소는 아래와 같습니다.

| Part of syntax | Description                                                                            | Example                                                                 | Notes                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `AS`           | 별칭을 정의하기 위한 키워드입니다. `SELECT` 절에서 테이블 이름이나 컬럼 이름에 대한 별칭은 `AS` 키워드를 사용하지 않고도 정의할 수 있습니다. | `SELECT table_name_alias.column_name FROM table_name table_name_alias`. | [CAST](/sql-reference/functions/type-conversion-functions#CAST) 함수에서는 `AS` 키워드가 다른 의미를 갖습니다. 해당 함수 설명을 참고하십시오. |
| `expr`         | ClickHouse에서 지원하는 임의의 표현식입니다.                                                          | `SELECT column_name * 2 AS double FROM some_table`                      |                                                                                                                |
| `alias`        | `expr`에 대한 이름입니다. 별칭은 [identifiers](#identifiers) 문법을 준수해야 합니다.                        | `SELECT "table t".column_name FROM table_name AS "table t"`.            |                                                                                                                |


### 사용 시 유의 사항 \{#notes-on-usage\}

* 별칭(alias)은 하나의 쿼리 또는 서브쿼리 내에서 전역적으로 적용되며, 쿼리의 어느 부분에서든任의의 표현식에 대해 별칭을 정의할 수 있습니다. 예를 들어 다음과 같습니다.

```sql
SELECT (1 AS n) + 2, n`.
```

* 별칭은 서브쿼리 내부와 서로 다른 서브쿼리 사이에서는 보이지 않습니다. 예를 들어, 다음 쿼리를 실행하면 ClickHouse에서 `Unknown identifier: num` 예외가 발생합니다.

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

* 서브쿼리의 `SELECT` 절에서 결과 컬럼에 별칭을 정의하면, 이 컬럼들은 외부 쿼리에서 사용할 수 있습니다. 예를 들어:

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

* 컬럼이나 테이블과 같은 이름의 별칭(alias)을 사용할 때에는 주의해야 합니다. 다음 예제를 살펴보겠습니다.

```sql
CREATE TABLE t
(
    a Int,
    b Int
)
ENGINE = TinyLog();

SELECT
    argMax(a, b),
    sum(b) AS b
FROM t;

Received exception from server (version 18.14.17):
Code: 184. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: Aggregate function sum(b) is found inside another aggregate function in query.
```

앞선 예시에서는 `b` 컬럼이 있는 테이블 `t`를 선언했습니다.
그런 다음 데이터를 조회할 때 `sum(b) AS b` 별칭을 정의했습니다.
별칭은 전역 범위이므로,
ClickHouse는 `argMax(a, b)` 표현식에서 리터럴 `b`를 `sum(b)` 표현식으로 대체했습니다.
이 대체로 인해 예외가 발생했습니다.

:::note
[prefer&#95;column&#95;name&#95;to&#95;alias](/operations/settings/settings#prefer_column_name_to_alias)를 `1`로 설정하여 이 기본 동작을 변경할 수 있습니다.
:::


## 별표 \{#asterisk\}

`SELECT` 쿼리에서 별표(`*`)는 표현식을 대체할 수 있습니다. 
자세한 내용은 [SELECT](/sql-reference/statements/select/index.md#asterisk) 섹션을 참조하십시오.