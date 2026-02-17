
[//]: # (이 파일은 FAQ > 문제 해결에 포함됩니다)

- [설치](#troubleshooting-installation-errors)
- [서버에 연결](#troubleshooting-accepts-no-connections)
- [쿼리 처리](#troubleshooting-does-not-process-queries)
- [쿼리 처리 효율성](#troubleshooting-too-slow)



## 설치 \{#troubleshooting-installation-errors\}

### apt-get으로 ClickHouse 리포지토리에서 deb 패키지를 가져올 수 없습니다 \{#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get\}

* 방화벽 설정을 확인합니다.
* 어떤 이유로든 리포지토리에 접근할 수 없는 경우, [설치 가이드](../getting-started/install.md) 문서에 설명된 대로 패키지를 다운로드한 후 `sudo dpkg -i <packages>` 명령을 사용하여 수동으로 설치합니다. 이때 `tzdata` 패키지도 필요합니다.

### apt-get으로 ClickHouse 리포지토리의 deb 패키지를 업데이트할 수 없습니다 \{#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get\}

* GPG 키가 변경되었을 때 발생할 수 있는 문제입니다.

리포지토리 구성을 업데이트하려면 [설정](../getting-started/install.md#setup-the-debian-repository) 페이지의 안내를 참고하십시오.

### `apt-get update` 실행 시 여러 가지 경고가 표시됩니다 \{#you-get-different-warnings-with-apt-get-update\}

* 전체 경고 메시지는 다음 중 하나일 수 있습니다.

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

위 문제를 해결하려면 다음 스크립트를 사용하십시오:

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 잘못된 서명 때문에 yum으로 패키지를 설치할 수 없음 \{#you-cant-get-packages-with-yum-because-of-wrong-signature\}

가능한 원인: 캐시가 올바르지 않거나, 2022년 9월에 GPG 키를 업데이트한 이후 손상되었을 수 있습니다.

해결 방법은 yum의 캐시와 lib 디렉터리를 정리하는 것입니다:

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

그 후 [설치 가이드](../getting-started/install.md#from-rpm-packages)를 따르십시오.

### Docker 컨테이너를 실행할 수 없습니다 \{#you-cant-run-docker-container\}

단순히 `docker run clickhouse/clickhouse-server` 명령을 실행했는데, 아래와 유사한 스택 트레이스를 남기고 비정상 종료됩니다:

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (when copying this message, always include the lines below):
```


0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char\*\*) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char\*\*) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. \_start @ 0x00000000062e802e
    (version 24.10.1.2812 (official build))

```

원인은 `20.10.10`보다 낮은 버전의 오래된 Docker 데몬입니다. 이를 해결하려면 버전을 업그레이드하거나 `docker run [--privileged | --security-opt seccomp=unconfined]`을 실행하십시오. 후자는 보안에 영향을 미칩니다.

```


## 서버에 연결하기 \{#troubleshooting-accepts-no-connections\}

발생할 수 있는 문제:

* 서버가 실행 중이 아닙니다.
* 구성 매개변수가 예기치 않게 설정되었거나 잘못되었습니다.

### 서버가 실행 중이지 않음 \{#server-is-not-running\}

**서버가 실행 중인지 확인**

명령:

```bash
$ sudo service clickhouse-server status
```

서버가 실행 중이 아니면 다음 명령으로 서버를 시작하십시오:

```bash
$ sudo service clickhouse-server start
```

**로그 확인**

`clickhouse-server`의 기본 로그는 `/var/log/clickhouse-server/clickhouse-server.log`에 있습니다.

서버가 정상적으로 시작되었다면, 다음과 같은 로그 메시지가 기록됩니다:

* `<Information> Application: starting up.` — 서버가 시작되었습니다.
* `<Information> Application: Ready for connections.` — 서버가 실행 중이며 연결을 받을 준비가 되었습니다.

구성 오류로 인해 `clickhouse-server` 시작에 실패한 경우, 오류 설명과 함께 `<Error>` 로그 메시지가 기록됩니다. 예를 들어:

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

파일 끝에 오류가 보이지 않으면 다음 문자열이 나오는 부분부터 파일 전체를 살펴보십시오:

```text
<Information> Application: starting up.
```

서버에서 `clickhouse-server`의 두 번째 인스턴스를 시작하려고 하면 다음과 같은 로그가 출력됩니다.

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

`clickhouse-server` 로그에서 유용한 정보를 찾지 못했거나 로그 자체가 없는 경우, 다음 명령을 사용하여 `system.d` 로그를 확인할 수 있습니다:

```bash
$ sudo journalctl -u clickhouse-server
```

**clickhouse-server를 인터랙티브 모드로 시작하십시오**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

이 명령은 자동 시작 스크립트의 기본 매개변수로 서버를 대화형 애플리케이션으로 시작합니다. 이 모드에서는 `clickhouse-server`가 모든 이벤트 메시지를 콘솔에 출력합니다.

### 구성 매개변수 \{#configuration-parameters\}

다음을 확인하십시오.

* Docker 설정.

  IPv6 네트워크에서 Docker로 ClickHouse를 실행하는 경우 `network=host`가 설정되어 있는지 확인합니다.

* 엔드포인트 설정.

  [listen&#95;host](../operations/server-configuration-parameters/settings.md#listen_host) 및 [tcp&#95;port](../operations/server-configuration-parameters/settings.md#tcp_port) 설정을 확인합니다.

  기본적으로 ClickHouse 서버는 localhost 연결만 허용합니다.

* HTTP 프로토콜 설정.

  HTTP API에 대한 프로토콜 설정을 확인합니다.

* 보안 연결 설정.

  다음을 확인합니다.

  * [tcp&#95;port&#95;secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 설정
  * [SSL certificates](../operations/server-configuration-parameters/settings.md#openssl)에 대한 설정

    연결 시 적절한 매개변수를 사용하십시오. 예를 들어 `clickhouse_client`에서 `port_secure` 매개변수를 사용합니다.

* 사용자 설정.

  잘못된 사용자 이름이나 비밀번호를 사용하고 있을 수 있습니다.


## 쿼리 처리 \{#troubleshooting-does-not-process-queries\}

ClickHouse가 쿼리를 처리하지 못하면 클라이언트로 오류에 대한 설명을 전송합니다. `clickhouse-client`에서는 콘솔에서 오류 설명을 확인할 수 있습니다. HTTP 인터페이스를 사용하는 경우 ClickHouse는 응답 본문에 오류 설명을 전송합니다. 예를 들어 다음과 같습니다:

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`를 `stack-trace` 매개변수와 함께 시작하면, ClickHouse는 서버 스택 트레이스와 오류 설명을 반환합니다.

연결이 끊어졌다는 메시지가 표시될 수 있습니다. 이 경우 쿼리를 다시 실행해 보십시오. 쿼리를 실행할 때마다 연결이 끊어지는 경우, 서버 로그에서 오류를 확인하십시오.


## 쿼리 처리 효율성 \{#troubleshooting-too-slow\}

ClickHouse의 처리가 지나치게 느린 경우, 쿼리가 서버 리소스와 네트워크에 가하는 부하를 프로파일링해야 합니다.

`clickhouse-benchmark` 유틸리티를 사용하여 쿼리를 프로파일링할 수 있습니다. 이 유틸리티는 초당 처리된 쿼리 수, 초당 처리된 행 수, 그리고 쿼리 처리 시간의 분위수를 보여 줍니다.
