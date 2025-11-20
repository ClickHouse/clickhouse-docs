
# Windows에서 WSL로 ClickHouse 설치하기

## 요구 사항 {#requirements}

:::note
Windows에 ClickHouse를 설치하려면 WSL (Windows Subsystem for Linux)이 필요합니다.
:::

<VerticalStepper>

## WSL 설치하기 {#install-wsl}

Windows PowerShell을 관리자 권한으로 열고 다음 명령을 실행하세요:

```bash
wsl --install
```

새로운 UNIX 사용자 이름과 비밀번호를 입력하라는 메시지가 표시됩니다. 원하는 사용자 이름과 비밀번호를 입력하면 다음과 유사한 메시지가 표시됩니다:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## curl을 사용한 스크립트로 ClickHouse 설치하기 {#install-clickhouse-via-script-using-curl}

curl을 사용하여 스크립트로 ClickHouse를 설치하려면 다음 명령을 실행하세요:

```bash
curl https://clickhouse.com/ | sh
```

스크립트가 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## clickhouse-local 시작하기 {#start-clickhouse-local}

`clickhouse-local`은 ClickHouse의 강력한 SQL 문법을 사용하여 로컬 및 원격 파일을 처리할 수 있게 해주며, 별도의 설정이 필요하지 않습니다. 테이블 데이터는 임시 위치에 저장되므로 `clickhouse-local`을 재시작하면 이전에 생성된 테이블이 더 이상 사용 불가능합니다.

다음 명령을 실행하여 [clickhouse-local](/operations/utilities/clickhouse-local)를 시작하세요:

```bash
./clickhouse
```

## clickhouse-server 시작하기 {#start-clickhouse-server}

데이터를 영구적으로 저장하고자 한다면 `clickhouse-server`를 실행해야 합니다. 다음 명령을 사용하여 ClickHouse 서버를 시작할 수 있습니다:

```bash
./clickhouse server
```

## clickhouse-client 시작하기 {#start-clickhouse-client}

서버가 실행 중일 때, 새로운 터미널 창을 열고 다음 명령을 실행하여 `clickhouse-client`를 시작하세요:

```bash
./clickhouse client
```

다음과 같은 결과를 보게 될 것입니다:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

테이블 데이터는 현재 디렉터리에 저장되며 ClickHouse 서버가 재시작된 후에도 여전히 이용 가능합니다. 필요한 경우, 추가적인 구성 매개변수로 `-C config.xml`을 `./clickhouse server`에 전달하여 구성 파일에서 추가 설정을 제공할 수 있습니다. 사용 가능한 모든 구성 설정은 [여기](/operations/server-configuration-parameters/settings)와 [예제 구성 파일 템플릿](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 문서화되어 있습니다.

이제 ClickHouse에 SQL 명령을 보내기 시작할 준비가 되었습니다!

</VerticalStepper>
