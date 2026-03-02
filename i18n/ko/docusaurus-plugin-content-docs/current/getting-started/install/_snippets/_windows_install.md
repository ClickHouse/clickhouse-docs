# Windows에서 WSL로 ClickHouse 설치하기 \{#install-clickhouse-on-windows-with-wsl\}

## 요구 사항 \{#requirements\}

:::note
Windows에 ClickHouse를 설치하려면 WSL(Windows Subsystem for Linux)이 필요합니다.
:::

<VerticalStepper>

## WSL 설치 \{#install-wsl\}

관리자 권한으로 Windows PowerShell을 열고 다음 명령을 실행합니다:

```bash
wsl --install
```

UNIX 사용자 이름과 비밀번호를 새로 입력하라는 메시지가 표시됩니다. 원하는 사용자 이름과 비밀번호를 입력한 후에는 다음과 유사한 메시지가 표시됩니다:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## curl을 사용한 스크립트로 ClickHouse 설치 \{#install-clickhouse-via-script-using-curl\}

curl을 사용한 스크립트로 ClickHouse를 설치하려면 다음 명령을 실행합니다:

```bash
curl https://clickhouse.com/ | sh
```

스크립트가 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## clickhouse-local 시작 \{#start-clickhouse-local\}

`clickhouse-local`은 ClickHouse의 강력한 SQL 문법을 사용하여 별도의 구성 없이
로컬 및 원격 파일을 처리할 수 있게 해줍니다. 테이블 데이터는 임시 위치에
저장되므로 `clickhouse-local`을 다시 시작하면 이전에 생성한 테이블을
더 이상 사용할 수 없습니다.

[clickhouse-local](/operations/utilities/clickhouse-local)을 시작하려면 다음 명령을 실행합니다:

```bash
./clickhouse
```

## clickhouse-server 시작 \{#start-clickhouse-server\}

데이터를 영구적으로 보관하려면 `clickhouse-server`를 실행해야 합니다. 다음 명령을 사용하여
ClickHouse 서버를 시작할 수 있습니다:

```bash
./clickhouse server
```

## clickhouse-client 시작 \{#start-clickhouse-client\}

서버가 실행 중이면 새 터미널 창을 열고 다음 명령을 실행하여
`clickhouse-client`를 실행합니다:

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

테이블 데이터는 현재 디렉터리에 저장되며 ClickHouse 서버를 재시작한 후에도
계속 사용할 수 있습니다. 필요하다면 `-C config.xml`을 `./clickhouse server`에
추가 명령줄 인자로 전달하고, 설정 파일에서 추가 설정을 지정할 수 있습니다.
사용 가능한 모든 설정은 [여기](/operations/server-configuration-parameters/settings)와
[예제 설정 파일 템플릿](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에
문서화되어 있습니다.

이제 ClickHouse에서 SQL 명령을 실행할 준비가 되었습니다!

</VerticalStepper>