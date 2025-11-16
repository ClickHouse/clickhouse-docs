---
'description': 'ClickHouse 데이터 형식 작업을 위한 형식 유틸리티 사용 가이드'
'slug': '/operations/utilities/clickhouse-format'
'title': 'clickhouse-format'
'doc_type': 'reference'
---


# clickhouse-format 유틸리티

입력 쿼리를 포맷하는 기능을 제공합니다.

키:

- `--help` 또는 `-h` — 도움말 메시지를 출력합니다.
- `--query` — 길이와 복잡성에 관계없이 쿼리를 포맷합니다.
- `--hilite` 또는 `--highlight` — ANSI 터미널 이스케이프 시퀀스를 사용하여 구문 강조를 추가합니다.
- `--oneline` — 한 줄로 포맷합니다.
- `--max_line_length` — 지정된 길이보다 짧은 한 줄 쿼리를 포맷합니다.
- `--comments` — 출력에 주석을 유지합니다.
- `--quiet` 또는 `-q` — 구문만 검사하고, 성공 시 출력하지 않습니다.
- `--multiquery` 또는 `-n` — 동일한 파일에 여러 쿼리를 허용합니다.
- `--obfuscate` — 포맷하는 대신 모호하게 만듭니다.
- `--seed <string>` — 모호함의 결과를 결정하는 임의의 문자열을 시드합니다.
- `--backslash` — 포맷된 쿼리의 각 줄 끝에 백슬래시를 추가합니다. 여러 줄로 된 쿼리를 웹 등에서 복사하여 명령줄에서 실행할 때 유용할 수 있습니다.
- `--semicolons_inline` — 다중 쿼리 모드에서 쿼리의 마지막 줄에 세미콜론을 새 줄 대신 씁니다.

## 예제 {#examples}

1. 쿼리 포맷팅:

```bash
$ clickhouse-format --query "select number from numbers(10) where number%2 order by number desc;"
```

결과:

```bash
SELECT number
FROM numbers(10)
WHERE number % 2
ORDER BY number DESC
```

2. 강조 및 한 줄:

```bash
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

결과:

```sql
SELECT sum(number) FROM numbers(5)
```

3. 다중 쿼리:

```bash
$ clickhouse-format -n <<< "SELECT min(number) FROM numbers(5); SELECT max(number) FROM numbers(5);"
```

결과:

```sql
SELECT min(number)
FROM numbers(5)
;

SELECT max(number)
FROM numbers(5)
;

```

4. 모호하게 하기:

```bash
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

결과:

```sql
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

같은 쿼리와 다른 시드 문자열:

```bash
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

결과:

```sql
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. 백슬래시 추가하기:

```bash
$ clickhouse-format --backslash <<< "SELECT * FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION DISTINCT SELECT 3);"
```

결과:

```sql
SELECT * \
FROM  \
( \
    SELECT 1 AS x \
    UNION ALL \
    SELECT 1 \
    UNION DISTINCT \
    SELECT 3 \
)
```
