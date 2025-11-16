---
'description': '테이블 함수로, 주어진 구조로 서버에 전송된 데이터를 효과적으로 변환하고 다른 구조의 테이블에 삽입할 수 있습니다.'
'sidebar_label': '입력'
'sidebar_position': 95
'slug': '/sql-reference/table-functions/input'
'title': '입력'
'doc_type': 'reference'
---


# input Table Function

`input(structure)` - 테이블 함수로, 주어진 구조를 가진 데이터를 서버로 전송하고, 이를 다른 구조의 테이블에 효과적으로 변환하고 삽입할 수 있습니다.

`structure` - 서버로 전송되는 데이터의 구조이며 다음 형식으로 제공됩니다: `'column1_name column1_type, column2_name column2_type, ...'`.
예를 들어, `'id UInt32, name String'`과 같습니다.

이 함수는 `INSERT SELECT` 쿼리에서만 사용할 수 있으며 한 번만 사용되지만, 그 외에는 일반적인 테이블 함수처럼 동작합니다 (예: 서브쿼리 등에서 사용할 수 있습니다).

데이터는 일반 `INSERT` 쿼리와 동일한 방식으로 전송될 수 있으며, 쿼리의 끝에 지정해야 하는 어떤 사용 가능한 [format](/sql-reference/formats)으로 전달될 수 있습니다 (일반 `INSERT SELECT`와는 다르게).

이 함수의 주요 특징은 서버가 클라이언트로부터 데이터를 수신할 때, `SELECT` 절의 표현식 목록에 따라 동시에 변환하고 대상 테이블에 삽입하는 것입니다. 모든 전송된 데이터를 포함하는 임시 테이블은 생성되지 않습니다.

## 예제 {#examples}

- `test` 테이블이 다음 구조 `(a String, b String)`를 갖고, `data.csv`의 데이터가 다른 구조 `(col1 String, col2 Date, col3 Int32)`를 갖는다고 가정합니다. `data.csv`의 데이터를 `test` 테이블에 동시 변환하여 삽입하는 쿼리는 다음과 같습니다:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- 만약 `data.csv`에 테이블 `test`와 동일한 구조인 `test_structure`의 데이터가 포함되어 있다면, 이 두 쿼리는 동일합니다:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
