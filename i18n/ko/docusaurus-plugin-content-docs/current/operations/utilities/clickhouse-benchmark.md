---
'description': 'clickhouse-benchmark에 대한 문서'
'sidebar_label': 'clickhouse-benchmark'
'sidebar_position': 61
'slug': '/operations/utilities/clickhouse-benchmark'
'title': 'clickhouse-benchmark'
'doc_type': 'reference'
---


# clickhouse-benchmark 

ClickHouse 서버에 연결하고 지정된 쿼리를 반복적으로 전송합니다.

**구문**

```bash
$ clickhouse-benchmark --query ["single query"] [keys]
```

또는

```bash
$ echo "single query" | clickhouse-benchmark [keys]
```

또는

```bash
$ clickhouse-benchmark [keys] <<< "single query"
```

일련의 쿼리를 전송하려면, 텍스트 파일을 생성하고 이 파일의 개별 문자열에 각 쿼리를 배치합니다. 예를 들어:

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

그런 다음 이 파일을 `clickhouse-benchmark`의 표준 입력으로 전달합니다:

```bash
clickhouse-benchmark [keys] < queries_file;
```

## 커맨드 라인 옵션 {#clickhouse-benchmark-command-line-options}

- `--query=QUERY` — 실행할 쿼리. 이 매개변수가 전달되지 않으면, `clickhouse-benchmark`는 표준 입력에서 쿼리를 읽습니다.
- `--query_id=ID` — 쿼리 ID.
- `--query_id_prefix=ID_PREFIX` — 쿼리 ID 접두사.
- `-c N`, `--concurrency=N` — `clickhouse-benchmark`가 동시에 전송하는 쿼리 수. 기본값: 1.
- `-C N`, `--max_concurrency=N` — 지정된 값까지 평행 쿼리 수를 점진적으로 증가시키며, 각 동시성 수준에 대해 하나의 보고서를 만듭니다.
- `--precise` — 가중치 메트릭으로 정확한 구간별 보고 기능을 활성화합니다.
- `-d N`, `--delay=N` — 중간 보고서 간의 간격(보고서를 비활성화하려면 0 설정). 기본값: 1.
- `-h HOST`, `--host=HOST` — 서버 호스트. 기본값: `localhost`. [비교 모드](#clickhouse-benchmark-comparison-mode)를 위해 여러 `-h` 키를 사용할 수 있습니다.
- `-i N`, `--iterations=N` — 총 쿼리 수. 기본값: 0 (무한 반복).
- `-r`, `--randomize` — 입력 쿼리가 하나 이상일 경우 쿼리 실행의 무작위 순서.
- `-s`, `--secure` — `TLS` 연결 사용.
- `-t N`, `--timelimit=N` — 시간 제한(초). `clickhouse-benchmark`는 지정된 시간 제한에 도달하면 쿼리 전송을 중지합니다. 기본값: 0 (시간 제한 비활성화).
- `--port=N` — 서버 포트. 기본값: 9000. [비교 모드](#clickhouse-benchmark-comparison-mode)를 위해 여러 `--port` 키를 사용할 수 있습니다.
- `--confidence=N` — T-test의 신뢰 수준. 가능한 값: 0 (80%), 1 (90%), 2 (95%), 3 (98%), 4 (99%), 5 (99.5%). 기본값: 5. [비교 모드](#clickhouse-benchmark-comparison-mode)에서는 `clickhouse-benchmark`가 선택된 신뢰 수준으로 두 분포가 다르지 않은지 판단하기 위해 [독립 두 샘플 Student's t-test](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test)를 수행합니다.
- `--cumulative` — 구간별 데이터 대신 누적 데이터를 인쇄합니다.
- `--database=DATABASE_NAME` — ClickHouse 데이터베이스 이름. 기본값: `default`.
- `--user=USERNAME` — ClickHouse 사용자 이름. 기본값: `default`.
- `--password=PSWD` — ClickHouse 사용자 비밀번호. 기본값: 빈 문자열.
- `--stacktrace` — 스택 추적 출력. 이 키가 설정되면 `clickhouse-benchmark`는 예외의 스택 추적을 출력합니다.
- `--stage=WORD` — 서버에서의 쿼리 처리 단계. ClickHouse는 쿼리 처리를 중단하고 지정된 단계에서 `clickhouse-benchmark`에 응답을 반환합니다. 가능한 값: `complete`, `fetch_columns`, `with_mergeable_state`. 기본값: `complete`.
- `--roundrobin` — 서로 다른 `--host`/`--port`에 대한 쿼리를 비교하는 대신 매 쿼리마다 하나의 무작위 `--host`/`--port`를 선택하여 쿼리를 전송합니다.
- `--reconnect=N` — 재연결 동작 제어. 가능한 값 0 (결코 재연결하지 않음), 1 (각 쿼리에 대해 재연결), 또는 N (각 N 쿼리 후 재연결). 기본값: 0.
- `--max-consecutive-errors=N` — 허용된 연속 오류 수. 기본값: 0.
- `--ignore-error`,`--continue_on_errors` — 쿼리가 실패하더라도 테스트를 계속합니다.
- `--client-side-time` — 서버 측 시간 대신 네트워크 통신을 포함한 시간을 표시합니다; 22.8 이전의 서버 버전에서는 항상 클라이언트 측 시간을 표시합니다.
- `--proto-caps` — 데이터 전송에서 청크화 활성화/비활성화. 선택 사항 (쉼표로 구분 가능): `chunked_optional`, `notchunked`, `notchunked_optional`, `send_chunked`, `send_chunked_optional`, `send_notchunked`, `send_notchunked_optional`, `recv_chunked`, `recv_chunked_optional`, `recv_notchunked`, `recv_notchunked_optional`. 기본값: `notchunked`.
- `--help` — 도움말 메시지를 표시합니다.
- `--verbose` — 도움말 메시지의 자세한 정도를 증가시킵니다.

쿼리에 대해 일부 [설정](/operations/settings/overview)을 적용하려면, 키 `--<세션 설정 이름>= SETTING_VALUE`로 전달합니다. 예: `--max_memory_usage=1048576`.

## 환경 변수 옵션 {#clickhouse-benchmark-environment-variable-options}

사용자 이름, 비밀번호 및 호스트는 환경 변수 `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` 및 `CLICKHOUSE_HOST`를 통해 설정할 수 있습니다.  
커맨드 라인 인수 `--user`, `--password` 또는 `--host`는 환경 변수보다 우선합니다.

## 출력 {#clickhouse-benchmark-output}

기본적으로, `clickhouse-benchmark`는 각 `--delay` 간격에 대해 보고서를 생성합니다.

보고서 예시:

```text
Queries executed: 10.

localhost:9000, queries 10, QPS: 6.772, RPS: 67904487.440, MiB/s: 518.070, result RPS: 67721584.984, result MiB/s: 516.675.

0.000%      0.145 sec.
10.000%     0.146 sec.
20.000%     0.146 sec.
30.000%     0.146 sec.
40.000%     0.147 sec.
50.000%     0.148 sec.
60.000%     0.148 sec.
70.000%     0.148 sec.
80.000%     0.149 sec.
90.000%     0.150 sec.
95.000%     0.150 sec.
99.000%     0.150 sec.
99.900%     0.150 sec.
99.990%     0.150 sec.
```

보고서에서 다음을 찾을 수 있습니다:

- `Queries executed:` 필드에서 쿼리 수.

- 상태 문자열에는 (순서대로):

  - ClickHouse 서버의 엔드포인트.
  - 처리된 쿼리 수.
  - QPS: 지정된 `--delay` 인수의 기간 동안 서버가 수행한 쿼리 수.
  - RPS: 지정된 `--delay` 인수의 기간 동안 서버가 독서한 행 수.
  - MiB/s: 지정된 `--delay` 인수의 기간 동안 서버가 읽은 미비바이트 수.
  - 결과 RPS: 지정된 `--delay` 인수의 기간 동안 서버가 쿼리의 결과에 배치한 행 수.
  - 결과 MiB/s: 지정된 `--delay` 인수의 기간 동안 서버가 쿼리의 결과에 배치한 미비바이트 수.

- 쿼리 실행 시간의 백분위수.

## 비교 모드 {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark`는 두 개의 실행 중인 ClickHouse 서버의 성능을 비교할 수 있습니다.

비교 모드를 사용하려면, 두 쌍의 `--host`, `--port` 키로 두 서버의 엔드포인트를 지정합니다. 키는 인수 목록에서 위치에 따라 매치됩니다. 첫 번째 `--host`는 첫 번째 `--port`와 매치되고 그 다음이 이어집니다. `clickhouse-benchmark`는 두 서버에 대한 연결을 설정한 후 쿼리를 전송합니다. 각 쿼리는 무작위로 선택된 서버로 전송됩니다. 결과는 표 형식으로 표시됩니다.

## 예시 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
Loaded 1 queries.

Queries executed: 5.

localhost:9001, queries 2, QPS: 3.764, RPS: 75446929.370, MiB/s: 575.614, result RPS: 37639659.982, result MiB/s: 287.168.
localhost:9000, queries 3, QPS: 3.815, RPS: 76466659.385, MiB/s: 583.394, result RPS: 38148392.297, result MiB/s: 291.049.

0.000%          0.258 sec.      0.250 sec.
10.000%         0.258 sec.      0.250 sec.
20.000%         0.258 sec.      0.250 sec.
30.000%         0.258 sec.      0.267 sec.
40.000%         0.258 sec.      0.267 sec.
50.000%         0.273 sec.      0.267 sec.
60.000%         0.273 sec.      0.267 sec.
70.000%         0.273 sec.      0.267 sec.
80.000%         0.273 sec.      0.269 sec.
90.000%         0.273 sec.      0.269 sec.
95.000%         0.273 sec.      0.269 sec.
99.000%         0.273 sec.      0.269 sec.
99.900%         0.273 sec.      0.269 sec.
99.990%         0.273 sec.      0.269 sec.

No difference proven at 99.5% confidence
```
