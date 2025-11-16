---
'description': 'ClickHouse의 gRPC 인터페이스에 대한 문서'
'sidebar_label': 'gRPC 인터페이스'
'sidebar_position': 25
'slug': '/interfaces/grpc'
'title': 'gRPC 인터페이스'
'doc_type': 'reference'
---


# gRPC 인터페이스

## 소개 {#grpc-interface-introduction}

ClickHouse는 [gRPC](https://grpc.io/) 인터페이스를 지원합니다. 이는 HTTP/2와 [프로토콜 버퍼](https://en.wikipedia.org/wiki/Protocol_Buffers)를 사용하는 오픈 소스 원격 프로시저 호출 시스템입니다. ClickHouse에서의 gRPC 구현은 다음을 지원합니다:

- SSL;
- 인증;
- 세션;
- 압축;
- 동일한 채널을 통한 병렬 쿼리;
- 쿼리 취소;
- 진행 상황 및 로그 가져오기;
- 외부 테이블.

인터페이스의 사양은 [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)에서 설명되어 있습니다.

## gRPC 구성 {#grpc-interface-configuration}

gRPC 인터페이스를 사용하려면 주요 [서버 구성](../operations/configuration-files.md)에서 `grpc_port`를 설정합니다. 기타 구성 옵션은 다음 예제에서 참조하십시오:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- The following two files are used only if SSL is enabled -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Whether server requests client for a certificate -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- The following file is used only if ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Default compression algorithm (applied if client doesn't specify another algorithm, see result_compression in QueryInfo).
             Supported algorithms: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Default compression level (applied if client doesn't specify another level, see result_compression in QueryInfo).
             Supported levels: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Send/receive message size limits in bytes. -1 means unlimited -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Enable if you want to get detailed logs -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## 내장 클라이언트 {#grpc-client}

제공된 [사양](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)을 사용하여 gRPC에서 지원하는 프로그래밍 언어로 클라이언트를 작성할 수 있습니다. 또는 내장된 Python 클라이언트를 사용할 수 있습니다. 이 클라이언트는 리포지토리의 [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py)에 위치해 있습니다. 내장 클라이언트는 [grpcio와 grpcio-tools](https://grpc.io/docs/languages/python/quickstart) Python 모듈을 필요로 합니다.

클라이언트는 다음 인수를 지원합니다:

- `--help` – 도움말 메시지를 표시하고 종료합니다.
- `--host HOST, -h HOST` – 서버 이름. 기본값: `localhost`. IPv4 또는 IPv6 주소도 사용할 수 있습니다.
- `--port PORT` – 연결할 포트. 이 포트는 ClickHouse 서버 구성에서 활성화되어 있어야 합니다 (참조: `grpc_port`). 기본값: `9100`.
- `--user USER_NAME, -u USER_NAME` – 사용자 이름. 기본값: `default`.
- `--password PASSWORD` – 비밀번호. 기본값: 빈 문자열.
- `--query QUERY, -q QUERY` – 비대화형 모드를 사용할 때 처리할 쿼리입니다.
- `--database DATABASE, -d DATABASE` – 기본 데이터베이스. 지정하지 않으면 서버 설정에서 현재 데이터베이스(`default`가 기본값)로 설정됩니다.
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 결과 출력 [형식](formats.md). 대화형 모드의 기본값: `PrettyCompact`.
- `--debug` – 디버그 정보를 표시하도록 활성화합니다.

대화형 모드에서 클라이언트를 실행하려면 `--query` 인수 없이 호출합니다.

배치 모드에서는 쿼리 데이터를 `stdin`을 통해 전달할 수 있습니다.

**클라이언트 사용 예제**

다음 예제에서는 테이블이 생성되고 CSV 파일에서 데이터로 로드됩니다. 그런 다음 테이블의 내용이 쿼리됩니다.

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

결과:

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
