# curl을 사용한 스크립트로 ClickHouse 설치 \{#install-clickhouse-via-script-using-curl\}

프로덕션 환경용으로 ClickHouse를 설치할 필요가 없다면, 가장 빠르게 시작하는 방법은
`curl`을 사용하여 설치 스크립트를 실행하는 것입니다. 이 스크립트는 사용 중인 운영 체제에
적합한 바이너리를 자동으로 선택합니다.

<VerticalStepper>

## curl을 사용하여 ClickHouse 설치 \{#install-clickhouse-using-curl\}

다음 명령을 실행하여 사용하는 운영 체제에 맞는 단일 바이너리를 다운로드합니다.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Mac 사용자: 바이너리 개발자를 확인할 수 없다는 오류가 표시되는 경우 [여기](/knowledgebase/fix-developer-verification-error-in-macos)를 참조하십시오.
:::

## clickhouse-local 시작 \{#start-clickhouse-local\}

`clickhouse-local`은 별도의 구성 없이도 ClickHouse의 강력한 SQL 문법을 사용하여
로컬 및 원격 파일을 처리할 수 있습니다. 테이블 데이터는 임시 위치에
저장되므로, `clickhouse-local`을 다시 시작한 이후에는 이전에 생성된 테이블을
더 이상 사용할 수 없습니다.

다음 명령을 실행하여 [clickhouse-local](/operations/utilities/clickhouse-local)을 시작합니다:

```bash
./clickhouse
```

## clickhouse-server 시작 \{#start-clickhouse-server\}

데이터를 영구적으로 유지하려면 `clickhouse-server`를 실행해야 합니다. 다음 명령을 사용하여
ClickHouse 서버를 시작하십시오:

```bash
./clickhouse server
```

## clickhouse-client 시작 \{#start-clickhouse-client\}

서버가 실행 중이면, 새 터미널 창을 열고 다음 명령을 실행하여
`clickhouse-client`를 시작합니다:

```bash
./clickhouse client
```

다음과 같은 출력이 표시됩니다: 

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

테이블 데이터는 현재 디렉터리에 저장되며, ClickHouse 서버를 다시 시작한 후에도
계속 사용할 수 있습니다. 필요하다면, `./clickhouse server`에 추가 명령줄
인수로 `-C config.xml`을 전달하고 구성 파일에서 추가 구성을 제공할 수
있습니다. 사용 가능한 모든 구성 설정은 [여기](/operations/server-configuration-parameters/settings)와
[예시 구성 파일 템플릿](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 문서화되어 있습니다.

이제 ClickHouse에 SQL 명령을 보내기 위한 준비가 완료되었습니다!

:::tip
[Quick Start](/get-started/quick-start)는 테이블 생성과 데이터 삽입 단계를 순서대로 안내합니다.
:::

</VerticalStepper>