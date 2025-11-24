---
'description': 'DEFLATE_QPL Codec을 사용하여 Clickhouse를 구축하고 벤치마크를 실행하는 방법'
'sidebar_label': 'DEFLATE_QPL 구축 및 벤치마크'
'sidebar_position': 73
'slug': '/development/building_and_benchmarking_deflate_qpl'
'title': 'DEFLATE_QPL로 Clickhouse 구축하기'
'doc_type': 'guide'
---


# DEFLATE_QPL로 Clickhouse 빌드하기

- 호스트 머신이 QPL 필수 [전제 조건](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)을 충족하는지 확인하십시오.
- deflate_qpl은 cmake 빌드 중 기본적으로 활성화되어 있습니다. 실수로 변경된 경우, 빌드 플래그: ENABLE_QPL=1을 다시 확인하십시오.

- 일반적인 요구 사항은 Clickhouse의 일반 [빌드 지침](/development/build.md)을 참조하십시오.


# DEFLATE_QPL로 벤치마크 실행하기

## 파일 목록 {#files-list}

폴더 `benchmark_sample` 하의 [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake)는 파이썬 스크립트를 사용하여 벤치마크를 실행하는 예를 제공합니다:

`client_scripts`는 전형적인 벤치마크를 실행하기 위한 파이썬 스크립트를 포함합니다. 예를 들면:
- `client_stressing_test.py`: [1~4] 서버 인스턴스와의 쿼리 스트레스 테스트를 위한 파이썬 스크립트입니다.
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/)에 대한 모든 쿼리 목록 파일입니다.
- `allin1_ssb.sh`: 이 셸 스크립트는 모든 벤치마크 워크플로우를 자동으로 실행합니다.

`database_files`는 lz4/deflate/zstd 코덱에 따라 데이터베이스 파일을 저장할 것임을 의미합니다.

## 스타 스키마에 대해 자동으로 벤치마크 실행하기: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

완료 후, 이 폴더에서 모든 결과를 확인하십시오: `./output/`

실패하는 경우, 아래 섹션에 따라 수동으로 벤치마크를 실행하십시오.

## 정의 {#definition}

[CLICKHOUSE_EXE]는 ClickHouse 실행 파일의 경로를 의미합니다.

## 환경 {#environment}

- CPU: Sapphire Rapid
- OS 요건은 [QPL의 시스템 요구 사항](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)을 참조하십시오.
- IAA 설정은 [가속기 구성](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)을 참조하십시오.
- 파이썬 모듈 설치:

```bash
pip3 install clickhouse_driver numpy
```

[IAA에 대한 자가 점검]

```bash
$ accel-config list | grep -P 'iax|state'
```

예상 출력을 다음과 같이 확인하십시오:
```bash
"dev":"iax1",
"state":"enabled",
        "state":"enabled",
```

아무 것도 출력되지 않는 경우, IAA가 작동할 준비가 되지 않았음을 의미합니다. IAA 설정을 다시 확인하십시오.

## 원시 데이터 생성하기 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema)를 사용하여 매개변수: -s 20로 1억 행 데이터를 생성합니다.

`*.tbl`과 같은 파일이 `./benchmark_sample/rawdata_dir/ssb-dbgen` 아래에 출력될 것으로 예상됩니다:

## 데이터베이스 설정 {#database-setup}

LZ4 코덱으로 데이터베이스 설정

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

여기서 콘솔에 `Connected to ClickHouse server` 메시지를 보아야 하며, 이는 클라이언트가 서버와의 연결을 성공적으로 설정했음을 의미합니다.

[Star Schema Benchmark](/getting-started/example-datasets/star-schema)에 명시된 세 가지 단계를 완료하십시오.
- ClickHouse에서 테이블 생성
- 데이터 삽입. 여기서 `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl`을 입력 데이터로 사용해야 합니다.
- "스타 스키마"를 비정규화된 "플랫 스키마"로 변환

IAA Deflate 코덱으로 데이터베이스 설정

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
위의 lz4와 동일한 세 단계를 완료하십시오.

ZSTD 코덱으로 데이터베이스 설정

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
위의 lz4와 동일한 세 단계를 완료하십시오.

[자가 점검]
각 코덱(lz4/zstd/deflate)에 대해 아래 쿼리를 실행하여 데이터베이스가 성공적으로 생성되었는지 확인하십시오:
```sql
SELECT count() FROM lineorder_flat
```
다음 출력을 보아야 합니다:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflate 코덱에 대한 자가 점검]

클라이언트에서 삽입 또는 쿼리를 처음 실행할 때 ClickHouse 서버 콘솔에서 이 로그를 출력할 것으로 예상됩니다:
```text
Hardware-assisted DeflateQpl codec is ready!
```
이 로그를 찾지 못하고 아래와 같은 다른 로그를 보게 된다면:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
이는 IAA 장치가 준비되지 않았음을 의미하므로, IAA 설정을 다시 확인해야 합니다.

## 단일 인스턴스로 벤치마크 실행하기 {#benchmark-with-single-instance}

- 벤치마크를 시작하기 전에, C6를 비활성화하고 CPU 주파수 거버너를 `performance`로 설정하십시오.

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Cross sockets에서 메모리 바인딩의 영향을 제거하기 위해, `numactl`을 사용하여 서버를 하나의 소켓에 바인딩하고 클라이언트를 다른 소켓에 바인딩합니다.
- 단일 인스턴스는 단일 서버가 단일 클라이언트와 연결된 것을 의미합니다.

이제 각각 LZ4/Deflate/ZSTD에 대해 벤치마크를 실행하십시오:

LZ4:

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

이제 세 개의 로그가 예상대로 출력되어야 합니다:
```text
lz4.log
deflate.log
zstd.log
```

성능 지표를 확인하는 방법:

우리는 QPS에 주목하며, `QPS_Final`라는 키워드를 검색하여 통계를 수집합니다.

## 다중 인스턴스로 벤치마크 실행하기 {#benchmark-with-multi-instances}

- 너무 많은 스레드에서 메모리 바인딩의 영향을 줄이기 위해, 다중 인스턴스로 벤치마크를 실행하는 것이 좋습니다.
- 다중 인스턴스는 여러 (2 또는 4) 서버가 각각의 클라이언트와 연결된 것을 의미합니다.
- 하나의 소켓의 코어는 균등하게 나누어 각 서버에 할당해야 합니다.
- 다중 인스턴스의 경우 각 코덱에 대해 새 폴더를 생성하고 단일 인스턴스와 유사한 단계에 따라 데이터셋을 삽입해야 합니다.

두 가지 차이점이 있습니다:
- 클라이언트 측에서는 테이블 생성 및 데이터 삽입 시 할당된 포트로 ClickHouse를 실행해야 합니다.
- 서버 측에서는 포트가 할당된 특정 xml 구성 파일을 사용하여 ClickHouse를 실행해야 합니다. 다중 인스턴스를 위한 모든 사용자 정의 xml 구성 파일은 ./server_config 아래에 제공됩니다.

여기서는 소켓당 60 코어가 있다고 가정하고 2 인스턴스를 예로 들겠습니다.
첫 번째 인스턴스에 대해 서버 시작
LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[두 번째 인스턴스에 대해 서버 시작]

LZ4:

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

두 번째 인스턴스의 테이블 생성 및 데이터 삽입

테이블 생성:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

데이터 삽입:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME]은 `./benchmark_sample/rawdata_dir/ssb-dbgen` 아래의 *. tbl이라는 정규 표현식으로 명명된 파일의 이름을 나타냅니다.
- `--port=9001`은 서버 인스턴스의 할당된 포트를 나타내며, 이 포트는 config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml에서 정의되어 있습니다. 더 많은 인스턴스의 경우 값: 9002/9003으로 교체해야 하며, 이는 각각 s3/s4 인스턴스를 나타냅니다. 포트를 할당하지 않으면 기본적으로 9000이 사용되며, 이는 첫 번째 인스턴스에서 사용되었습니다.

2 인스턴스로 벤치마크 실행하기

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

여기서 마지막 인수: `2`는 client_stressing_test.py에서 인스턴스의 수를 나타냅니다. 더 많은 인스턴스의 경우, 이를 3이나 4로 교체해야 합니다. 이 스크립트는 최대 4 인스턴스를 지원합니다.

이제 세 개의 로그가 예상대로 출력되어야 합니다:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
성능 지표를 확인하는 방법:

우리는 QPS에 주목하며, `QPS_Final`라는 키워드를 검색하여 통계를 수집합니다.

4 인스턴스에 대한 벤치마크 설정은 위의 2 인스턴스와 유사합니다.
최종 보고서 리뷰를 위해 2 인스턴스 벤치마크 데이터를 사용하는 것을 권장합니다.

## 팁 {#tips}

새 ClickHouse 서버를 실행하기 전에 매번 백그라운드 ClickHouse 프로세스가 실행 중이지 않은지 확인하십시오. 이전 프로세스를 확인하고 종료하십시오:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
./client_scripts/queries_ssb.sql의 쿼리 목록과 공식 [Star Schema Benchmark](/getting-started/example-datasets/star-schema)를 비교해보면, Q1.2/Q1.3/Q3.4라는 3개의 쿼리가 포함되어 있지 않음을 알 수 있습니다. 이는 이러한 쿼리에 대한 CPU 사용률%가 매우 낮은 < 10%이기 때문에 성능 차이를 시연할 수 없음을 의미합니다.
