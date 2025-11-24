---
'description': 'Clickhouse Obfuscator에 대한 문서'
'slug': '/operations/utilities/clickhouse-obfuscator'
'title': 'clickhouse-obfuscator'
'doc_type': 'reference'
---

A simple tool for table data obfuscation.

It reads an input table and produces an output table, that retains some properties of input, but contains different data. It allows publishing almost real production data for usage in benchmarks.

It is designed to retain the following properties of data:
- cardinalities of values (number of distinct values) for every column and every tuple of columns;
- conditional cardinalities: number of distinct values of one column under the condition on the value of another column;
- probability distributions of the absolute value of integers; the sign of signed integers; exponent and sign for floats;
- probability distributions of the length of strings;
- probability of zero values of numbers; empty strings and arrays, `NULL`s;

- data compression ratio when compressed with LZ77 and entropy family of codecs;
- continuity (magnitude of difference) of time values across the table; continuity of floating-point values;
- date component of `DateTime` values;

- UTF-8 validity of string values;
- string values look natural.

Most of the properties above are viable for performance testing:

reading data, filtering, aggregation, and sorting will work at almost the same speed as on original data due to saved cardinalities, magnitudes, compression ratios, etc.

It works in a deterministic fashion: you define a seed value and the transformation is determined by input data and by seed. Some transformations are one to one and could be reversed, so you need to have a large seed and keep it in secret.

It uses some cryptographic primitives to transform data but from the cryptographic point of view, it does not do it properly, that is why you should not consider the result as secure unless you have another reason. The result may retain some data you don't want to publish.

It always leaves 0, 1, -1 numbers, dates, lengths of arrays, and null flags exactly as in source data. For example, you have a column `IsMobile` in your table with values 0 and 1. In transformed data, it will have the same value.

So, the user will be able to count the exact ratio of mobile traffic.

Let's give another example. When you have some private data in your table, like user email, and you don't want to publish any single email address. If your table is large enough and contains multiple different emails and no email has a very high frequency than all others, it will anonymize all data. But if you have a small number of different values in a column, it can reproduce some of them. You should look at the working algorithm of this tool works, and fine-tune its command line parameters.

This tool works fine only with at least a moderate amount of data (at least 1000s of rows).

---

단순한 테이블 데이터 오브퓨스케이션 도구입니다.

입력 테이블을 읽고 일부 속성을 유지하되 다른 데이터를 포함하는 출력 테이블을 생성합니다. 벤치마크에서 사용하기 위해 거의 실제 프로덕션 데이터를 게시할 수 있습니다.

데이터의 다음 속성을 유지하도록 설계되었습니다:
- 모든 컬럼 및 모든 튜플의 값의 카디널리티 (고유한 값의 수);
- 조건부 카디널리티: 다른 컬럼의 값에 따른 하나의 컬럼의 고유한 값의 수;
- 정수의 절대값; 부호 있는 정수의 부호; 부동 소수점의 지수 및 부호에 대한 확률 분포;
- 문자열 길이에 대한 확률 분포;
- 숫자의 0값 확률; 빈 문자열 및 배열, `NULL` 값;

- LZ77 및 엔트로피 계열 코덱으로 압축할 때의 데이터 압축 비율;
- 테이블 전체 시간 값의 연속성 (차이의 크기); 부동 소수점 값의 연속성;
- `DateTime` 값의 날짜 구성 요소;

- 문자열 값의 UTF-8 유효성;
- 문자열 값은 자연스럽게 보입니다.

위의 대부분 속성은 성능 테스트에 유효합니다:

데이터 읽기, 필터링, 집계 및 정렬은 저장된 카디널리티, 크기, 압축 비율 등으로 인해 원본 데이터와 거의 같은 속도로 작동합니다.

확정적인 방식으로 작동합니다: 시드 값을 정의하고 변환은 입력 데이터와 시드에 의해 결정됩니다. 일부 변환은 일대일이며 역으로 되돌릴 수 있으므로 큰 시드를 가지고 비밀로 유지해야 합니다.

데이터를 변환하기 위해 일부 암호화 원시를 사용하지만, 암호화 관점에서 제대로 수행되지 않으므로 다른 이유가 없다면 결과를 안전한 것으로 간주하지 않아야 합니다. 결과에는 게시하고 싶지 않은 일부 데이터가 남을 수 있습니다.

항상 0, 1, -1 숫자, 날짜, 배열 길이 및 NULL 플래그를 원본 데이터와 정확히 동일하게 유지합니다. 예를 들어, 값이 0과 1인 테이블의 `IsMobile` 컬럼이 있다고 가정합니다. 변환된 데이터에서는 동일한 값을 가질 것입니다.

따라서 사용자는 모바일 트래픽의 정확한 비율을 계산할 수 있습니다.

또 다른 예를 들어 보겠습니다. 테이블에 사용자 이메일과 같은 개인 데이터가 있는 경우, 특정 이메일 주소를 게시하고 싶지 않은 경우입니다. 테이블이 충분히 크고 여러 개의 다른 이메일을 포함하고, 어떤 이메일도 다른 이메일보다 빈도가 매우 높지 않으면 모든 데이터가 익명화됩니다. 그러나 컬럼에 서로 다른 값의 수가 적으면 일부 값을 재현할 수 있습니다. 이 도구의 작동 알고리즘을 살펴보고 명령 줄 매개변수를 세밀하게 조정해야 합니다.

이 도구는 최소한 적당량의 데이터(최소 1000행)와만 잘 작동합니다.
