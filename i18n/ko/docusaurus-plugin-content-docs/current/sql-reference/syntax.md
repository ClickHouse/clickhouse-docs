---
'description': '문서화된 Syntax'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '문법'
'sidebar_position': 2
'slug': '/sql-reference/syntax'
'title': '문법'
'doc_type': 'reference'
---

In this section, we will take a look at ClickHouse's SQL syntax. 
ClickHouse uses a syntax based on SQL but offers a number of extensions and optimizations.

## Query Parsing {#query-parsing}

ClickHouse에는 두 가지 유형의 파서가 있습니다:
- _모든 SQL 파서_ (재귀 하강 파서).
- _데이터 형식 파서_ (빠른 스트림 파서).

전체 SQL 파서는 `INSERT` 쿼리를 제외한 모든 경우에 사용됩니다. `INSERT` 쿼리는 두 개의 파서를 모두 사용합니다.

아래 쿼리를 살펴보겠습니다:

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

이미 언급했듯이, `INSERT` 쿼리는 두 개의 파서를 사용합니다. 
`INSERT INTO t VALUES` 구문은 전체 파서에 의해 구문 분석되고, 
데이터 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')`는 데이터 형식 파서 또는 빠른 스트림 파서에 의해 구문 분석됩니다.

<details>
<summary>전체 파서 켜기</summary>

[`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 설정을 사용하여 데이터에 대해 전체 파서를 켤 수 있습니다. 

위에서 언급한 설정이 `1`로 설정되면, 
ClickHouse는 먼저 값을 빠른 스트림 파서로 구문 분석하려고 시도합니다. 
실패할 경우 ClickHouse는 SQL [표현식](#expressions)처럼 데이터를 전체 파서로 사용하려고 시도합니다.
</details>

데이터는 어떤 형식이든 가질 수 있습니다. 
쿼리를 수신할 때, 서버는 요청의 [max_query_size](../operations/settings/settings.md#max_query_size) 바이트까지 RAM에서 계산하며 
(기본적으로 1 MB), 나머지는 스트림 파싱됩니다.
이는 ClickHouse에 데이터를 삽입하는 권장 방법인 큰 `INSERT` 쿼리와 관련된 문제를 피하기 위함입니다.

`INSERT` 쿼리에서 [`Values`](/interfaces/formats/Values) 형식을 사용하는 경우, 
데이터는 `SELECT` 쿼리의 표현식과 동일하게 구문 분석되는 것처럼 보일 수 있지만, 이는 사실이 아닙니다. 
`Values` 형식은 훨씬 더 제한적입니다.

이 섹션의 나머지 부분은 전체 파서에 대한 것입니다.

:::note
형식 파서에 대한 자세한 정보는 [형식](../interfaces/formats.md) 섹션을 참조하세요.
:::

## Spaces {#spaces}

- 구문적 구성 요소 사이에 (쿼리의 시작 및 끝을 포함하여) 공백 기호가 아무 수만큼 있을 수 있습니다. 
- 공백 기호에는 공백, 탭, 줄 바꿈, CR, 폼 피드가 포함됩니다.

## Comments {#comments}

ClickHouse는 SQL 스타일과 C 스타일의 주석을 모두 지원합니다:

- SQL 스타일 주석은 `--`, `#!` 또는 `# `로 시작하며, 줄 끝까지 계속됩니다. `--` 및 `#!` 뒤의 공백은 생략할 수 있습니다.
- C 스타일 주석은 `/*`에서 `*/`까지 포함되며 여러 줄로 구성될 수 있습니다. 공백도 필요하지 않습니다.

## Keywords {#keywords}

ClickHouse의 키워드는 문맥에 따라 _대소문자를 구분할 수_ 있으며 _대소문자를 구분하지 않을 수_ 있습니다.

키워드는 다음과 같은 경우에 **대소문자를 구분하지 않습니다**:

- SQL 표준. 예를 들어, `SELECT`, `select` 및 `SeLeCt`는 모두 유효합니다.
- 인기 있는 DBMS(MySQL 또는 Postgres)에서의 구현. 예를 들어, `DateTime`은 `datetime`과 동일합니다.

:::note
데이터 유형 이름이 대소문자를 구분하는지 확인하려면 [system.data_type_families](/operations/system-tables/data_type_families) 테이블을 확인할 수 있습니다.
:::

표준 SQL와는 달리, 모든 다른 키워드(함수 이름 포함)는 **대소문자를 구분합니다**.

또한, 키워드는 예약되지 않습니다. 
그들은 해당 문맥에서만 그렇게 취급됩니다. 
동일한 이름의 [식별자](#identifiers)를 사용할 경우, 이를 큰따옴표 또는 백틱으로 묶어야 합니다.

예를 들어, 테이블 `table_name`에 `"FROM"`이라는 이름의 컬럼이 있을 경우 다음 쿼리는 유효합니다:

```sql
SELECT "FROM" FROM table_name
```

## Identifiers {#identifiers}

식별자는 다음과 같습니다:

- 클러스터, 데이터베이스, 테이블, 파티션 및 컬럼 이름.
- [함수](#functions).
- [데이터 유형](../sql-reference/data-types/index.md).
- [표현식 별칭](#expression-aliases).

식별자는 따옴표로 묶이거나 묶이지 않을 수 있지만, 후자가 더 선호됩니다.

인용되지 않은 식별자는 정규 표현식 `^[a-zA-Z_][0-9a-zA-Z_]*$`에 일치해야 하며 [키워드](#keywords)와 같을 수 없습니다.
다음 표는 유효하고 무효한 식별자의 예입니다:

| 유효한 식별자                             | 무효한 식별자                             |
|-------------------------------------------|-------------------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_`| `1x`, `tom@gmail.com`, `äußerst_schön`   |

키워드와 동일한 식별자를 사용하거나 식별자에 다른 기호를 사용하고자 하는 경우, 큰따옴표 또는 백틱을 사용하여 인용하십시오. 예: `"id"`, `` `id` ``.

:::note
인용된 식별자에 대한 이스케이프 규칙은 문자열 리터럴에도 적용됩니다. 더 자세한 내용은 [String](#string)을 참조하십시오.
:::

## Literals {#literals}

ClickHouse에서 리터럴은 쿼리에서 직접 표현되는 값입니다.
다시 말해, 이는 쿼리 실행 중에 변경되지 않는 고정 값입니다.

리터럴은 다음과 같을 수 있습니다:
- [String](#string)
- [Numeric](#numeric)
- [Compound](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc) (사용자 정의 문자열 리터럴)

아래 섹션에서 각 항목을 더 자세히 살펴보겠습니다.

### String {#string}

문자열 리터럴은 작은따옴표로 묶여야 합니다. 큰따옴표는 지원되지 않습니다.

이스케이프는 다음과 같이 작동합니다:

- 작은따옴표 문자가 등장하는 곳에 앞에 작은따옴표를 사용하면 `'` (그리고 오직 이 문자) 이 `''`로 이스케이프될 수 있습니다, 또는
- 다음 지원되는 이스케이프 시퀀스와 함께 앞에 백슬래시를 사용합니다.

:::note
백슬래시는 특수한 의미를 잃으며, 아래에 나열된 문자 외의 문자에 앞에 있을 경우 문자 그대로 해석됩니다.
:::

| 지원되는 이스케이프                         | 설명                                                                 |
|----------------------------------------------|----------------------------------------------------------------------|
| `\xHH`                                       | 8비트 문자 사양 뒤에 임의의 수의 16진수 숫자(H)가 따릅니다.         | 
| `\N`                                         | 예약어로, 아무런 기능이 없습니다 (예: `SELECT 'a\Nb'`는 `ab`를 반환합니다) |
| `\a`                                         | 알림                                                               |
| `\b`                                         | 백스페이스                                                         |
| `\e`                                         | 이스케이프 문자                                                   |
| `\f`                                         | 폼 피드                                                           |
| `\n`                                         | 줄 바꿈                                                           |
| `\r`                                         | 캐리지 리턴                                                       |
| `\t`                                         | 수평 탭                                                           |
| `\v`                                         | 수직 탭                                                           |
| `\0`                                         | 널 문자                                                           |
| `\\`                                         | 백슬래시                                                         |
| `\'` (또는 ` '' `)                           | 작은따옴표                                                       |
| `\"`                                         | 큰따옴표                                                          |
| `` ` ``                                      | 백틱                                                              |
| `\/`                                         | 슬래시                                                           |
| `\=`                                         | 등호                                                             |
| ASCII 제어 문자 (c &lt;= 31).               |                                                                     |

:::note
문자열 리터럴에서, 적어도 `'` 및 `\`는 이스케이프 코드 `\'` (또는: `''`)와 `\\`를 사용하여 이스케이프해야 합니다.
:::

### Numeric {#numeric}

숫자 리터럴은 다음과 같이 구문 분석됩니다:

- 리터럴에 마이너스 기호 `-`가 접두어로 있는 경우, 토큰이 생략되며 파싱 후 결과가 부정됩니다.
- 숫자 리터럴은 먼저 64비트 부호 없는 정수로 파싱되며, [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 함수를 사용합니다.
  - 값이 `0b` 또는 `0x`/`0X`로 시작하는 경우, 숫자는 각각 이진 또는 16진수로 파싱됩니다.
  - 값이 음수이고 절대 크기가 2<sup>63</sup>보다 큰 경우 오류가 반환됩니다.
- 실패할 경우, 값은 [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 함수를 사용하여 부동 소수점 수로 다시 파싱됩니다.
- 그렇지 않으면 오류가 반환됩니다.

리터럴 값은 값이 적절하게 들어맞는 가장 작은 유형으로 변환됩니다.
예를 들어:
- `1`은 `UInt8`로 파싱됩니다.
- `256`은 `UInt16`으로 파싱됩니다. 

:::note 중요
64비트보다 넓은 정수 값(`UInt128`, `Int128`, `UInt256`, `Int256`)은 올바르게 파싱하기 위해 더 큰 유형으로 캐스팅되어야 합니다:

```sql
-170141183460469231731687303715884105728::Int128
340282366920938463463374607431768211455::UInt128
-57896044618658097711785492504343953926634992332820282019728792003956564819968::Int256
115792089237316195423570985008687907853269984665640564039457584007913129639935::UInt256
```

이 알고리즘을 우회하고 임의의 정밀도를 지원하는 루틴으로 정수를 파싱합니다.

그렇지 않으면 리터럴은 부동 소수점 수로 파싱되며, 이로 인해 절단으로 인한 정밀도 손실이 발생할 수 있습니다.
:::

자세한 내용은 [데이터 유형](../sql-reference/data-types/index.md)을 참조하십시오.

숫자 리터럴 내의 밑줄 `_`은 무시되며 더 나은 가독성을 위해 사용할 수 있습니다.

지원되는 숫자 리터럴은 다음과 같습니다:

| 숫자 리터럴                                 | 예제                                           |
|----------------------------------------------|------------------------------------------------|
| **정수**                                      | `1`, `10_000_000`, `18446744073709551615`, `01`|
| **소수**                                     | `0.1`                                         |
| **지수 표기법**                             | `1e100`, `-1e-100`                            |
| **부동 소수점 수**                           | `123.456`, `inf`, `nan`                        |
| **16진수**                                   | `0xc0fe`                                      |
| **SQL 표준 호환 16진수 문자열**               | `x'c0fe'`                                     |
| **이진수**                                   | `0b1101`                                      |
| **SQL 표준 호환 이진수 문자열**               | `b'1101'`                                     |

:::note
우연한 해석 오류를 피하기 위해 8진수 리터럴은 지원되지 않습니다.
:::

### Compound {#compound}

배열은 대괄호 `[1, 2, 3]`로 구성됩니다. 튜플은 둥근 괄호 `(1, 'Hello, world!', 2)`로 구성됩니다.
이들은 기술적으로 리터럴이 아닌 배열 생성을 위한 연산자와 튜플 생성을 위한 연산자가 있는 표현식입니다.
배열은 최소한 한 항목으로 구성되어야 하며, 튜플은 최소 두 개의 항목이 있어야 합니다.

:::note
튜플이 `SELECT` 쿼리의 `IN` 절에 나타나는 경우 별도의 사례가 있습니다. 
쿼리 결과는 튜플을 포함할 수 있지만, 튜플은 데이터베이스에 저장될 수 없습니다(단, [Memory](../engines/table-engines/special/memory.md) 엔진을 사용하는 테이블 제외).
:::

### NULL {#null}

`NULL`은 값이 없음을 나타내는 데 사용됩니다. 
테이블 필드에 `NULL`을 저장하려면 [Nullable](../sql-reference/data-types/nullable.md) 유형이어야 합니다.

:::note
`NULL`과 관련하여 다음 사항을 알아야 합니다:

- 데이터 형식(입력 또는 출력)에 따라 `NULL`은 다른 표현을 가질 수 있습니다. 자세한 내용은 [데이터 형식](/interfaces/formats)을 참조하십시오.
- `NULL` 처리는 미세합니다. 예를 들어, 비교 작업의 인자 중 하나라도 `NULL`인 경우, 이 작업의 결과도 `NULL`입니다. 곱셈, 덧셈 및 다른 작업에도 동일하게 적용됩니다. 각 작업에 대한 문서를 참고하시기 바랍니다.
- 쿼리에서 `NULL`을 확인하려면 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isNull) 및 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isNotNull) 연산자와 관련 함수 `isNull` 및 `isNotNull`을 사용할 수 있습니다.
:::

### Heredoc {#heredoc}

[heredoc](https://en.wikipedia.org/wiki/Here_document)는 문자열(종종 다중 행)을 정의하면서 원래 형식을 유지하는 방법입니다. 
Heredoc는 두 개의 `$` 기호 사이에 배치된 사용자 정의 문자열 리터럴로 정의됩니다.

예를 들어:

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 두 heredoc 사이의 값은 "있는 그대로" 처리됩니다.
:::

:::tip
- heredoc을 사용하여 SQL, HTML, XML 코드 등의 코드 조각을 포함시킬 수 있습니다.
:::

## Defining and Using Query Parameters {#defining-and-using-query-parameters}

쿼리 매개변수를 사용하면 구체적인 식별자 대신 추상적인 자리 표시자를 포함하는 일반 쿼리를 작성할 수 있습니다. 
쿼리 매개변수가 있는 쿼리가 실행될 때, 
모든 자리 표시자는 실제 쿼리 매개변수 값으로 해결되고 교체됩니다.

쿼리 매개변수를 정의하는 두 가지 방법이 있습니다:

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

두 번째 변형을 사용하는 경우, 이는 `clickhouse-client`의 명령 줄 인수로 전달됩니다:
- `<name>`은 쿼리 매개변수의 이름입니다.
- `<value>`는 해당 값입니다.

쿼리 매개변수는 쿼리에서 `{<name>: <datatype>}`를 사용하여 참조할 수 있으며, 여기서 `<name>`은 쿼리 매개변수 이름이고 `<datatype>`은 변환되는 데이터 유형입니다.

<details>
<summary>SET 명령을 사용한 예제</summary>

예를 들어, 다음 SQL은 서로 다른 데이터 유형을 가진 매개변수 `a`, `b`, `c` 및 `d`를 정의합니다:

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
<summary>clickhouse-client와 함께 사용하는 예제</summary>

`clickhouse-client`를 사용하는 경우, 매개변수는 `--param_name=value`로 지정됩니다. 예를 들어, 다음 매개변수는 이름이 `message`이며 `String`으로 검색됩니다:

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

쿼리 매개변수가 데이터베이스, 테이블, 함수 또는 다른 식별자의 이름을 나타내는 경우, `Identifier`를 해당 유형으로 사용하십시오. 예를 들어, 다음 쿼리는 `uk_price_paid`라는 테이블에서 행을 반환합니다:

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
쿼리 매개변수는 임의의 SQL 쿼리의 임의의 위치에서 사용할 수 있는 일반 텍스트 치환이 아닙니다. 
이들은 주로 식별자나 리터럴 대신 `SELECT` 문장에서 작동하도록 설계되었습니다.
:::

## Functions {#functions}

함수 호출은 인수 목록(비어 있을 수 있음)이 괄호로 묶인 식별자처럼 작성됩니다. 
표준 SQL와 달리, 괄호는 비어 있는 인수 목록에도 필요합니다. 
예를 들어: 

```sql
now()
```

또한:
- [정규 함수](/sql-reference/functions/overview).
- [집계 함수](/sql-reference/aggregate-functions).

일부 집계 함수는 괄호 안에 두 목록의 인수를 포함할 수 있습니다. 예를 들어: 

```sql
quantile (0.9)(x) 
```

이러한 집계 함수는 "매개변수적" 함수라고 하며, 첫 번째 목록의 인수를 "매개변수"라고 부릅니다.

:::note
매개변수 없이 집계 함수의 구문은 일반 함수와 동일합니다.
:::

## Operators {#operators}

연산자는 쿼리 파싱 중에 해당하는 함수로 변환되며, 그들의 우선 순위 및 결합성을 고려합니다.

예를 들어, 표현식 

```text
1 + 2 * 3 + 4
```

은 다음으로 변환됩니다 

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## Data Types and Database Table Engines {#data-types-and-database-table-engines}

`CREATE` 쿼리의 데이터 유형 및 테이블 엔진은 식별자나 함수와 동일하게 작성됩니다. 
즉, 괄호 안에 인수 목록이 포함될 수도 있고 포함되지 않을 수도 있습니다. 

자세한 내용은 다음 섹션을 참조하십시오:
- [데이터 유형](/sql-reference/data-types/index.md)
- [테이블 엔진](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md).

## Expressions {#expressions}

표현식은 다음 중 하나가 될 수 있습니다:
- 함수
- 식별자
- 리터럴
- 연산자의 적용
- 괄호 안의 표현식
- 서브쿼리
- 별표

또한 [별칭](#expression-aliases)을 포함할 수 있습니다.

표현식 목록은 하나 이상의 표현식이 쉼표로 구분된 것입니다.
함수와 연산자는 차례로 표현식을 인수로 가질 수 있습니다.

상수 표현식은 쿼리 분석 중에 결과가 알려진 표현식입니다. 즉, 실행 전에 알려집니다.
예를 들어, 리터럴에 대한 표현식은 상수 표현식입니다.

## Expression Aliases {#expression-aliases}

별칭은 쿼리에서 [표현식](#expressions)에 대한 사용자 정의 이름입니다.

```sql
expr AS alias
```

위 구문의 부분은 아래에 설명되어 있습니다.

| 구문 부분   | 설명                                                                                       | 예제                                                                    | 비고                                                                                                                                      |
|-------------|--------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`        | 별칭 정의를 위한 키워드입니다. 별칭은 `SELECT` 절에서 테이블 이름 또는 컬럼 이름에 정의할 수 있으며 `AS` 키워드를 사용하지 않을 수 있습니다.| `SELECT table_name_alias.column_name FROM table_name table_name_alias`  | [CAST](/sql-reference/functions/type-conversion-functions#cast) 함수에서 `AS` 키워드는 또 다른 의미를 가집니다. 함수 설명서를 참조하십시오. |
| `expr`      | ClickHouse에서 지원되는 모든 표현식입니다.                                               | `SELECT column_name * 2 AS double FROM some_table`                     |                                                                                                                                          |
| `alias`     | `expr`의 이름입니다. 별칭은 [식별자](#identifiers) 구문을 준수해야 합니다.                        | `SELECT "table t".column_name FROM table_name AS "table t"`          |                                                                                                                                          |

### Notes on Usage {#notes-on-usage}

- 별칭은 쿼리 또는 서브쿼리에 대해 전역적이며, 쿼리 내의 어떤 부분에서도 어떤 표현식에 대해서도 별칭을 정의할 수 있습니다. 예를 들어:

```sql
SELECT (1 AS n) + 2, n`.
```

- 별칭은 서브쿼리 및 서브쿼리 간에 보이지 않습니다. 예를 들어, 다음 쿼리를 실행하는 동안 ClickHouse는 `Unknown identifier: num` 예외를 발생시킵니다:

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- 서브쿼리의 `SELECT` 절에서 결과 열에 별칭이 정의되면, 이러한 열은 외부 쿼리에서 보입니다. 예를 들어:

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- 열 또는 테이블 이름과 동일한 별칭에 주의하십시오. 다음 예를 생각해 보십시오:

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

앞서 예에서 우리는 컬럼 `b`가 있는 테이블 `t`를 선언했습니다. 
그런 다음 데이터를 선택할 때, 우리는 `sum(b) AS b` 별칭을 정의했습니다. 
별칭은 전역적이므로, ClickHouse는 식 표현식 `argMax(a, b)` 내의 리터럴 `b`를 표현식 `sum(b)`로 대체했습니다. 
이 대체로 인해 예외가 발생했습니다.

:::note
기본 동작을 변경하려면 [prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias)를 `1`로 설정하십시오.
:::

## Asterisk {#asterisk}

`SELECT` 쿼리 내에서, 별표는 표현식을 대체할 수 있습니다. 
자세한 내용은 [SELECT](/sql-reference/statements/select/index.md#asterisk) 섹션을 참조하십시오.
