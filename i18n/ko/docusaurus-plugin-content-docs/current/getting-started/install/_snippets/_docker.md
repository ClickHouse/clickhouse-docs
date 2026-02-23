# Docker를 사용하여 ClickHouse 설치 \{#install-clickhouse-using-docker\}

편의를 위해 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)의 가이드를 아래에 그대로 제공합니다. 제공되는 Docker 이미지는
공식 ClickHouse DEB 패키지를 사용합니다.

Docker pull 명령어:

```bash
docker pull clickhouse/clickhouse-server
```


## Versions \{#versions\}

- `latest` 태그는 최신 안정 브랜치의 최신 릴리스를 가리킵니다.
- `22.2`와 같은 브랜치 태그는 해당 브랜치의 최신 릴리스를 가리킵니다.
- `22.2.3` 및 `22.2.3.5`와 같은 전체 버전 태그는 해당 릴리스를 가리킵니다.
- `head` 태그는 기본 브랜치의 최신 커밋을 기반으로 빌드됩니다.
- 각 태그에는 선택적으로 `-alpine` 접미사가 포함될 수 있으며, 이는 `alpine` 기반으로 빌드되었음을 나타냅니다.

### 호환성 \{#compatibility\}

- amd64 이미지는 [SSE3 명령어 집합](https://en.wikipedia.org/wiki/SSE3) 지원이 필요합니다.
  사실상 2005년 이후의 모든 x86 CPU는 SSE3를 지원합니다.
- arm64 이미지는 [ARMv8.2-A 아키텍처](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) 지원이 필요하고,
  추가로 Load-Acquire RCpc 레지스터를 지원해야 합니다. 이 레지스터는 ARMv8.2-A 버전에서는 선택 사항이며 
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)에서는 필수입니다. Graviton >=2, Azure 및 GCP 인스턴스에서 지원됩니다.
  지원되지 않는 디바이스 예로는 Raspberry Pi 4 (ARMv8.0-A)와 Jetson AGX Xavier/Orin (ARMv8.2-A)이 있습니다.
- ClickHouse 24.11부터 Ubuntu 이미지는 기본 이미지(base image)로 `ubuntu:22.04`를 사용하기 시작했습니다. 이 이미지는 
  [patch](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)가 포함된 `20.10.10` 이상 버전의 Docker가 필요합니다.
  우회 방법으로 `docker run --security-opt seccomp=unconfined`를 대신 사용할 수 있으나, 이 경우 보안에 영향을 줄 수 있습니다.

## 이 이미지를 사용하는 방법 \{#how-to-use-image\}

### 서버 인스턴스 시작하기 \{#start-server-instance\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

기본적으로 ClickHouse는 Docker 네트워크를 통해서만 접근할 수 있습니다. 아래의 네트워크 섹션을 참조하십시오.

기본적으로 위에서 시작한 서버 인스턴스는 비밀번호 없이 `default` 사용자로 실행됩니다.


### 네이티브 클라이언트를 사용해 연결하기 \{#connect-to-it-from-native-client\}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouse 클라이언트에 대한 자세한 내용은 [ClickHouse 클라이언트](/interfaces/cli) 문서를 참조하십시오.


### curl로 연결하기 \{#connect-to-it-using-curl\}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTP 인터페이스에 대한 더 자세한 내용은 [ClickHouse HTTP Interface](/interfaces/http)를 참고하십시오.


### 컨테이너 중지 및 제거 \{#stopping-removing-container\}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```


### 네트워킹 \{#networking\}

:::note
사전 정의된 사용자 `default`는 비밀번호가 설정되지 않으면 네트워크에 접근할 수 없습니다.
아래의 「시작 시 기본(default) 데이터베이스와 사용자 생성 방법」 및 「`default` 사용자 관리」를 참고하십시오.
:::

호스트 포트를 사용하여 컨테이너 내부 포트를
[특정 포트에 매핑](https://docs.docker.com/config/containers/container-networking/)함으로써,
Docker에서 실행 중인 ClickHouse를 외부에 노출할 수 있습니다.

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

또는 `--network=host`를 사용하여 컨테이너가 [호스트 포트를 직접](https://docs.docker.com/network/host/) 사용하도록 허용하여
(더 나은 네트워크 성능을 얻을 수도 있습니다):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
위 예제의 `default` 사용자는 localhost에서 오는 요청에만 사용할 수 있습니다.
:::


### 볼륨(Volumes) \{#volumes\}

일반적으로 컨테이너 내부에 다음 폴더를 마운트하여 데이터 지속성을 확보합니다:

* `/var/lib/clickhouse/` - ClickHouse가 데이터를 저장하는 기본 폴더
* `/var/log/clickhouse-server/` - 로그

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

다음을 마운트하는 것도 좋습니다:

* `/etc/clickhouse-server/config.d/*.xml` - 서버 설정을 조정하기 위한 파일
* `/etc/clickhouse-server/users.d/*.xml` - 사용자 설정을 조정하기 위한 파일
* `/docker-entrypoint-initdb.d/` - 데이터베이스 초기화 스크립트가 포함된 폴더(아래 참조).


## Linux capabilities \{#linear-capabilities\}

ClickHouse에는 몇 가지 고급 기능이 있으며, 이를 사용하려면 여러 [Linux capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)을(를) 활성화해야 합니다.

이 기능들은 선택 사항이며, 다음 [Docker 명령줄 인수](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)를 사용하여 활성화할 수 있습니다.

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

자세한 내용은 [&quot;Docker에서 CAP&#95;IPC&#95;LOCK 및 CAP&#95;SYS&#95;NICE Capabilities 구성하기&quot;](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)를 참조하십시오.


## Configuration \{#configuration\}

이 컨테이너는 [HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http_interface/)용으로 포트 8123을, [네이티브 클라이언트](https://clickhouse.com/docs/interfaces/tcp/)용으로 포트 9000을 사용합니다.

ClickHouse 구성은 "config.xml" 파일로 정의됩니다([문서](https://clickhouse.com/docs/operations/configuration_files/)).

### 사용자 정의 구성으로 서버 인스턴스 시작 \{#start-server-instance-with-custom-config\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```


### 사용자 정의 계정으로 서버 시작 \{#start-server-custom-user\}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

로컬 디렉터리를 마운트하여 이미지를 사용하는 경우, 적절한 파일 소유권을 유지하기 위해 사용자 계정을 지정하는 것이 좋습니다. `--user` 인자를 사용하고 컨테이너 내부에 `/var/lib/clickhouse`와 `/var/log/clickhouse-server`를 마운트하십시오. 그렇지 않으면 이미지가 오류를 내고 시작되지 않습니다.


### 루트 권한으로 서버 시작 \{#start-server-from-root\}

사용자 네임스페이스가 활성화된 환경에서는 루트 권한으로 서버를 시작하는 것이 유용합니다.
이를 위해 다음 명령을 실행하십시오:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```


### 시작 시 기본 데이터베이스와 사용자를 생성하는 방법 \{#how-to-create-default-db-and-user\}

컨테이너를 시작할 때 기본 사용자 이름인 `default` 사용자와 데이터베이스를 생성해야 하는 경우가 있습니다. 이 작업은 환경 변수 `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`, `CLICKHOUSE_PASSWORD`를 사용하여 수행할 수 있습니다:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```


#### `default` 사용자 관리 \{#managing-default-user\}

`CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 중 어느 것도 설정되어 있지 않은 경우, `default` 사용자는 기본적으로 네트워크 액세스가 비활성화되어 있습니다.

환경 변수 `CLICKHOUSE_SKIP_USER_SETUP`을 1로 설정하면 `default` 사용자를 보안에 취약한 상태로 사용할 수 있게 됩니다:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## 이 이미지를 확장하는 방법 \{#how-to-extend-image\}

이 이미지를 기반으로 만든 이미지에서 추가 초기화를 수행하려면, 하나 이상의 `*.sql`, `*.sql.gz`, 또는 `*.sh` 스크립트를 `/docker-entrypoint-initdb.d` 아래에 추가하십시오. 엔트리포인트가 `initdb`를 호출한 후, 해당 디렉터리에서 발견된 `*.sql` 파일은 모두 실행하고, 실행 가능한(`executable`) `*.sh` 스크립트는 실행하며, 실행 권한이 없는 `*.sh` 스크립트는 현재 셸에서 실행되도록(source) 불러와 서비스가 시작되기 전에 추가 초기화를 수행합니다.

:::note
`/docker-entrypoint-initdb.d` 아래의 스크립트는 파일 이름 기준으로 **알파벳 순서**로 실행됩니다. 스크립트 간에 의존성이 있는 경우(예: 뷰를 생성하는 스크립트가 참조되는 테이블을 생성하는 스크립트 이후에 실행되어야 하는 경우), 파일 이름이 올바른 순서로 정렬되도록 해야 합니다.
:::

또한, 초기화 동안 clickhouse-client에서 사용할 환경 변수 `CLICKHOUSE_USER` 및 `CLICKHOUSE_PASSWORD`를 지정할 수 있습니다.

예를 들어, 다른 사용자와 데이터베이스를 추가하려면 `/docker-entrypoint-initdb.d/init-db.sh`에 다음 내용을 추가하십시오:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
