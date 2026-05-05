---
title: '문제 해결'
description: '설치 문제 해결 가이드'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['문제 해결', '디버깅', '장애 처리', '오류', '진단']
---

## 설치 \{#installation\}

### apt-key로 keyserver.ubuntu.com에서 GPG 키를 가져올 수 없음 \{#cant-import-gpg-keys-from-keyserverubuntucom-with-apt-key\}

[Advanced Package Tool (APT)의 `apt-key` 기능은 사용 중단(deprecated)되었습니다](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). 대신 `gpg` 명령을 사용해야 합니다. 자세한 내용은 [설치 가이드](../getting-started/install/install.mdx)를 참고하십시오.

### gpg로 keyserver.ubuntu.com에서 GPG 키를 가져올 수 없는 경우 \{#cant-import-gpg-keys-from-keyserverubuntucom-with-gpg\}

1. `gpg`가 설치되어 있는지 확인합니다:

```shell
sudo apt-get install gnupg
```


### apt-get으로 ClickHouse 저장소에서 deb 패키지를 가져올 수 없는 경우 \{#cant-get-deb-packages-from-clickhouse-repository-with-apt-get\}

1. 방화벽 설정을 확인합니다.
1. 어떠한 이유로든 저장소에 접속할 수 없는 경우, [설치 가이드](../getting-started/install/install.mdx)에 설명된 대로 패키지를 다운로드한 후 `sudo dpkg -i <packages>` 명령으로 수동 설치합니다. 이때 `tzdata` 패키지도 필요합니다.

### apt-get으로 ClickHouse 저장소의 deb 패키지를 업데이트할 수 없음 \{#cant-update-deb-packages-from-clickhouse-repository-with-apt-get\}

이 문제는 GPG 키가 변경되었을 때 발생할 수 있습니다.

저장소 구성을 업데이트하려면 [setup](/install/debian_ubuntu) 페이지의 안내를 따르십시오.

### `apt-get update` 실행 시 여러 가지 경고가 표시됨 \{#you-get-different-warnings-with-apt-get-update\}

전체 경고 메시지는 다음 중 하나입니다:

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

위의 문제를 해결하려면 다음 스크립트를 실행하십시오:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```


### 잘못된 서명으로 인해 Yum에서 패키지를 가져올 수 없음 \{#cant-get-packages-with-yum-because-of-wrong-signature\}

가능한 원인: 캐시가 올바르지 않거나, 2022-09에 GPG 키를 업데이트한 이후 손상되었을 수 있습니다.

해결 방법은 Yum의 캐시와 lib 디렉터리를 정리(삭제)하는 것입니다:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

그 다음에는 [설치 가이드](/install/redhat)를 따르십시오.


## 서버에 연결 \{#connecting-to-the-server\}

발생할 수 있는 문제:

- 서버가 실행 중이 아닙니다.
- 구성 매개변수가 예기치 않거나 잘못되었습니다.

### 서버가 실행 중이지 않습니다 \{#server-is-not-running\}

#### 서버 실행 여부 확인 \{#check-if-server-is-running\}

```shell
sudo service clickhouse-server status
```

서버가 실행 중이 아니면 다음 명령으로 서버를 시작하십시오:

```shell
sudo service clickhouse-server start
```


#### 로그 확인 \{#check-the-logs\}

기본적으로 `clickhouse-server`의 주요 로그는 `/var/log/clickhouse-server/clickhouse-server.log`에 기록됩니다.

서버가 성공적으로 시작되었다면 다음 문자열을 확인할 수 있습니다:

* `<Information> Application: starting up.` — 서버가 시작되었습니다.
* `<Information> Application: Ready for connections.` — 서버가 실행 중이며 연결을 받을 준비가 되었습니다.

구성 오류로 인해 `clickhouse-server` 시작에 실패한 경우, 오류 설명과 함께 `<Error>` 문자열이 표시됩니다. 예를 들면 다음과 같습니다:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

파일 끝부분에 오류가 보이지 않으면 다음 문자열이 나타나는 부분부터 파일 전체를 확인하십시오:

```plaintext
<Information> Application: starting up.
```

서버에서 `clickhouse-server`의 두 번째 인스턴스를 시작하려고 하면 다음 로그가 출력됩니다.

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


#### systemd 로그 보기 \{#see-systemd-logs\}

`clickhouse-server` 로그에서 유용한 정보를 찾지 못했거나 로그가 전혀 없는 경우, 다음 명령어를 사용하여 `systemd` 로그를 확인할 수 있습니다:

```shell
sudo journalctl -u clickhouse-server
```


#### 대화형 모드에서 clickhouse-server 시작 \{#start-clickhouse-server-in-interactive-mode\}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

이 명령은 autostart 스크립트의 표준 매개변수를 사용하여 서버를 대화형 애플리케이션으로 실행합니다. 이 모드에서는 `clickhouse-server`가 모든 이벤트 메시지를 콘솔에 출력합니다.


### 구성 매개변수 \{#configuration-parameters\}

다음을 확인하십시오:

1. Docker 설정:

    - IPv6 네트워크 환경에서 Docker로 ClickHouse를 실행하는 경우 `network=host`가 설정되어 있는지 확인합니다.

1. 엔드포인트 설정:
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host) 및 [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) 설정을 확인합니다.
    - 기본적으로 ClickHouse 서버는 localhost에서의 연결만 허용합니다.

1. HTTP 프로토콜 설정:

    - HTTP API에 대한 프로토콜 설정을 확인합니다.

1. 보안 연결 설정:

    - 다음을 확인합니다:
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 설정.
        - [SSL 인증서](/operations/server-configuration-parameters/settings#openssl)에 대한 설정.
    - 연결 시 적절한 매개변수를 사용합니다. 예를 들어 `clickhouse_client`와 함께 `port_secure` 매개변수를 사용합니다.

1. 사용자 설정:

    - 잘못된 사용자 이름이나 비밀번호를 사용하고 있을 수 있습니다.

## 쿼리 처리 \{#query-processing\}

ClickHouse가 쿼리를 처리할 수 없으면 클라이언트에 오류 설명을 보냅니다. `clickhouse-client`에서는 콘솔에 오류 설명이 출력됩니다. HTTP 인터페이스를 사용하는 경우 ClickHouse는 응답 본문에 오류 설명을 보냅니다. 예를 들어 다음과 같습니다.

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`stack-trace` 파라미터와 함께 `clickhouse-client`를 시작하면, ClickHouse는 오류 설명과 함께 서버 스택 트레이스를 반환합니다.

연결이 끊어졌다는 메시지가 표시될 수 있습니다. 이때는 쿼리를 다시 실행하십시오. 쿼리를 실행할 때마다 연결이 끊어지면 서버 로그에서 오류를 확인하십시오.


## 쿼리 처리 효율성 \{#efficiency-of-query-processing\}

ClickHouse의 처리 속도가 너무 느리게 느껴지면, 쿼리에 대해 서버 리소스와 네트워크에 가해지는 부하를 프로파일링해야 합니다.

`clickhouse-benchmark` 유틸리티를 사용하여 쿼리를 프로파일링할 수 있습니다. 이를 통해 초당 처리되는 쿼리 수, 초당 처리되는 행 수, 그리고 쿼리 처리 시간의 백분위수를 확인할 수 있습니다.