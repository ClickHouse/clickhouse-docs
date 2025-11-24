[//]: # (This file is included in FAQ > Troubleshooting)

- [설치](#troubleshooting-installation-errors)
- [서버에 연결](#troubleshooting-accepts-no-connections)
- [쿼리 처리](#troubleshooting-does-not-process-queries)
- [쿼리 처리의 효율성](#troubleshooting-too-slow)

## 설치 {#troubleshooting-installation-errors}

### apt-get으로 ClickHouse 저장소에서 deb 패키지를 가져올 수 없습니다 {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- 방화벽 설정을 확인하세요.
- 어떤 이유로든 저장소에 접근할 수 없는 경우, [설치 가이드](../getting-started/install.md) 기사에 설명된 대로 패키지를 다운로드하고 `sudo dpkg -i <packages>` 명령으로 수동 설치합니다. `tzdata` 패키지도 필요할 것입니다.

### apt-get으로 ClickHouse 저장소에서 deb 패키지를 업데이트할 수 없습니다 {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- GPG 키가 변경되었을 때 문제가 발생할 수 있습니다.

[setup](../getting-started/install.md#setup-the-debian-repository) 페이지의 매뉴얼을 사용하여 저장소 구성을 업데이트하세요.

### `apt-get update`로 다양한 경고가 발생합니다 {#you-get-different-warnings-with-apt-get-update}

- 완전한 경고 메시지는 다음 중 하나입니다:

```bash
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```bash
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```text
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

위 문제를 해결하기 위해 다음 스크립트를 사용하세요:

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 잘못된 서명으로 인해 yum으로 패키지를 가져올 수 없습니다 {#you-cant-get-packages-with-yum-because-of-wrong-signature}

가능한 문제: 캐시가 잘못되었거나 2022-09에 GPG 키 업데이트 후 손상되었을 수 있습니다.

해결 방법은 yum에 대한 캐시 및 lib 디렉토리를 정리하는 것입니다:

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

그 후 [설치 가이드](../getting-started/install.md#from-rpm-packages)를 따라 하세요.

### Docker 컨테이너를 실행할 수 없습니다 {#you-cant-run-docker-container}

간단한 `docker run clickhouse/clickhouse-server` 명령을 실행했을 때 다음과 유사한 스택 트레이스와 함께 크래시가 발생합니다:

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (when copying this message, always include the lines below):

0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char**) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char**) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. _start @ 0x00000000062e802e
 (version 24.10.1.2812 (official build))
```

그 이유는 `20.10.10` 미만의 오래된 docker daemon 때문입니다. 이를 해결하는 방법은 업그레이드하거나 `docker run [--privileged | --security-opt seccomp=unconfined]`를 실행하는 것입니다. 후자는 보안에 영향을 미칩니다.

## 서버에 연결 {#troubleshooting-accepts-no-connections}

가능한 문제:

- 서버가 실행되지 않습니다.
- 예기치 않거나 잘못된 구성 매개변수입니다.

### 서버가 실행되지 않음 {#server-is-not-running}

**서버가 실행 중인지 확인하세요**

명령:

```bash
$ sudo service clickhouse-server status
```

서버가 실행 중이지 않다면, 다음 명령으로 시작하세요:

```bash
$ sudo service clickhouse-server start
```

**로그 확인**

기본적으로 `clickhouse-server`의 주요 로그는 `/var/log/clickhouse-server/clickhouse-server.log`에 있습니다.

서버가 성공적으로 시작되었다면 다음 문자열을 확인할 수 있습니다:

- `<Information> Application: starting up.` — 서버가 시작되었습니다.
- `<Information> Application: Ready for connections.` — 서버가 실행 중이며 연결 준비가 완료되었습니다.

`clickhouse-server`가 구성 오류로 실패했다면, 오류 설명과 함께 `<Error>` 문자열을 확인할 수 있습니다. 예를 들어:

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

파일의 끝에 오류가 표시되지 않으면 다음 문자열부터 파일을 전체적으로 확인하세요:

```text
<Information> Application: starting up.
```

서버에서 `clickhouse-server`의 두 번째 인스턴스를 시작하려고 하면 다음 로그를 볼 수 있습니다:

```text
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Status file ./status already exists - unclean restart. Contents:
PID: 8510
Started at: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Cannot lock file ./status. Another server instance in same directory is already running.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: shutting down
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Uninitializing subsystem: Logging Subsystem
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

**system.d 로그 보기**

`clickhouse-server` 로그에서 유용한 정보를 찾지 못하거나 로그가 없는 경우, 다음 명령으로 `system.d` 로그를 확인할 수 있습니다:

```bash
$ sudo journalctl -u clickhouse-server
```

**대화형 모드로 clickhouse-server 시작**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

이 명령은 서버를 자동 시작 스크립트의 기본 매개변수로 대화형 앱으로 실행합니다. 이 모드에서 `clickhouse-server`는 모든 이벤트 메시지를 콘솔에 출력합니다.

### 구성 매개변수 {#configuration-parameters}

다음 사항을 확인하세요:

- Docker 설정.

    IPv6 네트워크에서 Docker에서 ClickHouse를 실행하는 경우, `network=host`가 설정되어 있는지 확인하세요.

- 엔드포인트 설정.

    [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) 및 [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port) 설정을 확인하세요.

    ClickHouse 서버는 기본적으로 localhost 연결만 허용합니다.

- HTTP 프로토콜 설정.

    HTTP API의 프로토콜 설정을 확인하세요.

- 보안 연결 설정.

    다음 사항을 확인하세요:

  - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 설정.
  - [SSL 인증서](../operations/server-configuration-parameters/settings.md#openssl)에 대한 설정.

    연결할 때 적절한 매개변수를 사용하세요. 예를 들어, `clickhouse_client`와 함께 `port_secure` 매개변수를 사용하세요.

- 사용자 설정.

    잘못된 사용자 이름이나 비밀번호를 사용하고 있을 수 있습니다.

## 쿼리 처리 {#troubleshooting-does-not-process-queries}

ClickHouse가 쿼리를 처리하지 못하는 경우, 클라이언트에게 오류 설명을 보냅니다. `clickhouse-client`에서는 콘솔에서 오류 설명을 확인할 수 있습니다. HTTP 인터페이스를 사용하는 경우, ClickHouse는 응답 본문에 오류 설명을 보냅니다. 예를 들어:

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`stack-trace` 매개변수로 `clickhouse-client`를 시작하면 ClickHouse는 오류 설명과 함께 서버 스택 트레이스를 반환합니다.

연결이 끊겼다는 메시지를 볼 수도 있습니다. 이 경우, 쿼리를 반복해서 실행해 보세요. 쿼리 수행 시마다 연결이 끊어진다면 서버 로그에서 오류를 확인하세요.

## 쿼리 처리의 효율성 {#troubleshooting-too-slow}

ClickHouse가 너무 느리게 작동하는 경우, 서버 리소스와 네트워크의 부하를 프로파일링해야 합니다.

쿼리 프로파일링을 위해 clickhouse-benchmark 유틸리티를 사용할 수 있습니다. 이 유틸리티는 초당 처리된 쿼리 수, 초당 처리된 행 수, 쿼리 처리 시간의 백분위를 보여줍니다.
