---
'title': '문제 해결'
'description': '설치 문제 해결 가이드'
'slug': '/guides/troubleshooting'
'doc_type': 'guide'
'keywords':
- 'troubleshooting'
- 'debugging'
- 'problem solving'
- 'errors'
- 'diagnostics'
---

## 설치 {#installation}

### apt-key 로 keyserver.ubuntu.com에서 GPG 키를 가져올 수 없음 {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key` 기능은 [고급 패키지 도구(APT)가 더 이상 사용되지 않습니다](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). 사용자는 대신 `gpg` 명령을 사용해야 합니다. [설치 가이드](../getting-started/install/install.mdx) 문서를 참조하십시오.

### gpg로 keyserver.ubuntu.com에서 GPG 키를 가져올 수 없음 {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg`가 설치되어 있는지 확인하십시오:

```shell
sudo apt-get install gnupg
```

### apt-get으로 ClickHouse 저장소에서 deb 패키지를 가져올 수 없음 {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. 방화벽 설정을 확인하십시오.
1. 어떤 이유로든 저장소에 접근할 수 없는 경우, [설치 가이드](../getting-started/install/install.mdx) 문서에 설명된 대로 패키지를 다운로드하고 `sudo dpkg -i <packages>` 명령을 사용하여 수동으로 설치하십시오. `tzdata` 패키지도 필요합니다.

### apt-get으로 ClickHouse 저장소에서 deb 패키지를 업데이트할 수 없음 {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

문제가 발생하는 이유는 GPG 키가 변경되었기 때문일 수 있습니다.

저장소 구성을 업데이트하려면 [설정](/install/debian_ubuntu) 페이지의 매뉴얼을 사용하십시오.

### `apt-get update`로 다양한 경고 메시지가 표시됨 {#you-get-different-warnings-with-apt-get-update}

완전한 경고 메시지는 다음 중 하나입니다:

```shell
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```shell
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```shell
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

위 문제를 해결하려면 다음 스크립트를 사용하십시오:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 잘못된 서명으로 인해 Yum으로 패키지를 가져올 수 없음 {#cant-get-packages-with-yum-because-of-wrong-signature}

가능한 문제: 캐시가 잘못되었거나 2022-09에 GPG 키가 업데이트된 이후로 손상되었을 수 있습니다.

해결 방법은 Yum의 캐시 및 lib 디렉터리를 정리하는 것입니다:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

그 후 [설치 가이드](/install/redhat)를 따르십시오.

## 서버에 연결 {#connecting-to-the-server}

가능한 문제:

- 서버가 실행되고 있지 않음.
- 예상치 못한 구성 매개변수 또는 잘못된 매개변수.

### 서버 실행 중이 아님 {#server-is-not-running}

#### 서버가 실행 중인지 확인 {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

서버가 실행 중이지 않으면 다음 명령어로 시작하십시오:

```shell
sudo service clickhouse-server start
```

#### 로그 확인 {#check-the-logs}

기본적으로 `clickhouse-server`의 주요 로그는 `/var/log/clickhouse-server/clickhouse-server.log`에 있습니다.

서버가 성공적으로 시작되었다면 다음 문자열을 볼 수 있어야 합니다:

- `<Information> Application: starting up.` — 서버 시작됨.
- `<Information> Application: Ready for connections.` — 서버가 실행 중이며 연결을 기다림.

`clickhouse-server`가 구성 오류로 시작에 실패하면 오류 설명과 함께 `<Error>` 문자열을 볼 수 있어야 합니다. 예를 들어:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

파일 끝에서 오류를 찾을 수 없다면, 문자열에서 시작하여 전체 파일을 살펴보십시오:

```plaintext
<Information> Application: starting up.
```

서버에서 `clickhouse-server`의 두 번째 인스턴스를 시작하려고 하면 다음 로그를 볼 수 있습니다:

```plaintext
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

#### system.d 로그 보기 {#see-systemd-logs}

`clickhouse-server` 로그에서 유용한 정보를 찾을 수 없거나 로그가 없다면, 다음 명령을 사용하여 `system.d` 로그를 볼 수 있습니다:

```shell
sudo journalctl -u clickhouse-server
```

#### 인터랙티브 모드에서 clickhouse-server 시작 {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

이 명령은 서버를 자동 시작 스크립트의 기본 매개변수를 사용하는 대화형 앱으로 시작합니다. 이 모드에서는 `clickhouse-server`가 모든 이벤트 메시지를 콘솔에 출력합니다.

### 구성 매개변수 {#configuration-parameters}

확인하십시오:

1. Docker 설정:

    - IPv6 네트워크에서 Docker로 ClickHouse를 실행하는 경우, `network=host`가 설정되어 있는지 확인하십시오.

1. 엔드포인트 설정.
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host) 및 [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) 설정을 확인하십시오.
    - 기본적으로 ClickHouse 서버는 localhost 연결만 허용합니다.

1. HTTP 프로토콜 설정:

    - HTTP API에 대한 프로토콜 설정을 확인하십시오.

1. 안전한 연결 설정.

    - 다음을 확인하십시오:
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 설정.
        - [SSL 인증서](/operations/server-configuration-parameters/settings#openssl)에 대한 설정.
    - 연결 시 적절한 매개변수를 사용하십시오. 예를 들어, `clickhouse_client`와 함께 `port_secure` 매개변수를 사용하십시오.

1. 사용자 설정:

    - 잘못된 사용자 이름이나 비밀번호를 사용하고 있을 수 있습니다.

## 쿼리 처리 {#query-processing}

ClickHouse가 쿼리를 처리할 수 없는 경우, 클라이언트에 오류 설명을 보냅니다. `clickhouse-client`에서 콘솔에 오류 설명을 얻습니다. HTTP 인터페이스를 사용하는 경우 ClickHouse는 응답 본문에 오류 설명을 전송합니다. 예를 들어:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`를 `stack-trace` 매개변수로 시작하면 ClickHouse는 오류 설명과 함께 서버의 스택 트레이스를 반환합니다.

연결이 끊어졌다는 메시지를 볼 수 있습니다. 이 경우 쿼리를 다시 시도할 수 있습니다. 쿼리를 수행할 때마다 연결이 끊어지면 서버 로그에서 오류를 확인하십시오.

## 쿼리 처리의 효율성 {#efficiency-of-query-processing}

ClickHouse가 너무 느리게 작동하는 경우, 서버 리소스와 네트워크에 대한 부하를 프로파일링해야 합니다.

쿼리를 프로파일링하려면 clickhouse-benchmark 유틸리티를 사용할 수 있습니다. 이 도구는 초당 처리된 쿼리 수, 초당 처리된 행 수, 쿼리 처리 시간의 백분위를 보여줍니다.
