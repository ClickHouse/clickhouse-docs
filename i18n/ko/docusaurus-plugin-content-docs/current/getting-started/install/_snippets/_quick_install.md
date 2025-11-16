
# Install ClickHouse via script using curl

ClickHouse를 생산 환경이 아닌 경우 가장 빠르게 설정하는 방법은 curl을 사용하여 설치 스크립트를 실행하는 것입니다. 이 스크립트는 귀하의 OS에 적합한 바이너리를 결정합니다.

<VerticalStepper>

## Install ClickHouse using curl {#install-clickhouse-using-curl}

다음 명령을 실행하여 운영 체제에 맞는 단일 바이너리를 다운로드하십시오.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Mac 사용자 주의: 바이너리의 개발자를 확인할 수 없다는 오류가 발생하는 경우 [여기](https://knowledgebase/fix-developer-verification-error-in-macos)를 참조하십시오.
:::

## Start clickhouse-local {#start-clickhouse-local}

`clickhouse-local`은 ClickHouse의 강력한 SQL 구문을 사용하여 로컬 및 원격 파일을 처리할 수 있게 해주며, 구성 없이 사용할 수 있습니다. 테이블 데이터는 임시 위치에 저장되므로 `clickhouse-local`을 재시작하면 이전에 생성된 테이블은 더 이상 사용할 수 없습니다.

[clickhouse-local](/operations/utilities/clickhouse-local)를 시작하려면 다음 명령을 실행하십시오:

```bash
./clickhouse
```

## Start clickhouse-server {#start-clickhouse-server}

데이터를 지속적으로 유지하려면 `clickhouse-server`를 실행해야 합니다. 다음 명령을 사용하여 ClickHouse 서버를 시작할 수 있습니다:

```bash
./clickhouse server
```

## Start clickhouse-client {#start-clickhouse-client}

서버가 실행 중일 때 새 터미널 창을 열고 다음 명령을 실행하여 `clickhouse-client`를 시작하십시오:

```bash
./clickhouse client
```

다음과 같은 내용이 표시됩니다:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

테이블 데이터는 현재 디렉터리에 저장되며 ClickHouse 서버를 재시작한 후에도 여전히 사용할 수 있습니다. 필요에 따라 `./clickhouse server`에 추가 명령 행 인수로 `-C config.xml`을 전달하여 구성 파일에서 추가 구성을 제공할 수 있습니다. 사용 가능한 모든 구성 설정은 [여기](https://operations/server-configuration-parameters/settings) 및 [예제 구성 파일 템플릿](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 문서화되어 있습니다.

이제 ClickHouse에 SQL 명령을 전송할 준비가 되었습니다!

:::tip
[빠른 시작](/get-started/quick-start)은 테이블 생성 및 데이터 삽입 단계를 안내합니다.
:::

</VerticalStepper>
