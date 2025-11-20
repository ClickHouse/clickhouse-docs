
# Docker를 이용한 ClickHouse 설치

편의를 위해 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)의 가이드가 아래에 재현되었습니다. 사용 가능한 Docker 이미지들은 공식 ClickHouse deb 패키지를 사용합니다.

Docker pull 커맨드:

```bash
docker pull clickhouse/clickhouse-server
```

## Versions {#versions}

- `latest` 태그는 최신 안정 분기의 최신 릴리스를 가리킵니다.
- `22.2`와 같은 브랜치 태그는 해당 브랜치의 최신 릴리스를 가리킵니다.
- `22.2.3`과 `22.2.3.5`와 같은 전체 버전 태그는 해당 릴리스를 가리킵니다.
- `head` 태그는 기본 브랜치의 최신 커밋으로 빌드됩니다.
- 각 태그에는 `-alpine` 접미사가 선택적으로 붙어 있으며, 이는 `alpine` 위에 빌드되었음을 반영합니다.

### Compatibility {#compatibility}

- amd64 이미지는 [SSE3 명령어](https://en.wikipedia.org/wiki/SSE3)를 지원해야 합니다. 2005년 이후의 대부분의 x86 CPU는 SSE3를 지원합니다.
- arm64 이미지는 [ARMv8.2-A 아키텍처](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)를 지원해야 하며,
  추가로 Load-Acquire RCpc 레지스터도 필요합니다. 이 레지스터는 ARMv8.2-A 버전에서는 선택 사항이며, [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)에서는 필수입니다. Graviton >=2, Azure 및 GCP 인스턴스에서 지원됩니다. 지원되지 않는 장치의 예로는 Raspberry Pi 4 (ARMv8.0-A) 및 Jetson AGX Xavier/Orin (ARMv8.2-A)이 있습니다.
- ClickHouse 24.11부터 Ubuntu 이미지는 `ubuntu:22.04`를 기본 이미지로 사용하기 시작했습니다. 이는 docker 버전 >= `20.10.10`을 요구하며 [patch](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)가 포함되어야 합니다. 우회 방법으로 `docker run --security-opt seccomp=unconfined`를 사용할 수 있지만, 이는 보안에 문제를 일으킬 수 있습니다.

## 이 이미지를 사용하는 방법 {#how-to-use-image}

### 서버 인스턴스 시작 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

기본적으로 ClickHouse는 Docker 네트워크를 통해서만 접근할 수 있습니다. 아래의 네트워킹 섹션을 참조하십시오.

기본적으로 위의 서버 인스턴스는 비밀번호 없이 `default` 사용자로 실행됩니다.

### 네이티브 클라이언트로 연결하기 {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouse 클라이언트에 대한 더 많은 정보는 [ClickHouse 클라이언트](/interfaces/cli)를 참조하십시오.

### curl을 사용하여 연결하기 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTP 인터페이스에 대한 추가 정보는 [ClickHouse HTTP 인터페이스](/interfaces/http)를 참조하십시오.

### 컨테이너 중지 / 제거하기 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### 네트워킹 {#networking}

:::note
미리 정의된 사용자 `default`는 비밀번호가 설정되지 않은 경우 네트워크 접근 권한이 없습니다. "기본 데이터베이스 및 사용자 생성 방법" 및 "default 사용자 관리"를 참조하십시오.
:::

Docker에서 실행 중인 ClickHouse를 [특정 포트 매핑](https://docs.docker.com/config/containers/container-networking/)을 사용하여 노출할 수 있습니다:

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

또는 `--network=host`를 사용하여 컨테이너가 [호스트 포트를 직접 사용하도록 허용](https://docs.docker.com/network/host/)할 수 있으며 (이는 더 나은 네트워크 성능을 달성할 수 있습니다):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
위 예제의 기본 사용자는 localhost 요청에만 사용할 수 있습니다.
:::

### 볼륨 {#volumes}

일반적으로 지속성을 유지하기 위해 컨테이너 내에 다음 폴더를 마운트하려고 할 수 있습니다:

- `/var/lib/clickhouse/` - ClickHouse가 데이터를 저장하는 주요 폴더
- `/var/log/clickhouse-server/` - 로그

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

마운트할 수도 있습니다:

- `/etc/clickhouse-server/config.d/*.xml` - 서버 구성 조정 파일
- `/etc/clickhouse-server/users.d/*.xml` - 사용자 설정 조정 파일
- `/docker-entrypoint-initdb.d/` - 데이터베이스 초기화 스크립트가 있는 폴더(아래 참조).

## 리눅스 기능 {#linear-capabilities}

ClickHouse에는 여러 [리눅스 기능](https://man7.org/linux/man-pages/man7/capabilities.7.html)을 활성화해야 하는 고급 기능이 있습니다.

이들은 선택 사항이며, 다음 [docker 명령줄 인수](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)를 사용하여 활성화할 수 있습니다:

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

자세한 정보는 ["Docker에서 CAP_IPC_LOCK 및 CAP_SYS_NICE 기능 구성하기"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)를 참조하십시오.

## 설정 {#configuration}

컨테이너는 [HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http_interface/)를 위한 8123 포트와 [네이티브 클라이언트](https://clickhouse.com/docs/interfaces/tcp/)를 위한 9000 포트를 노출합니다.

ClickHouse 구성은 "config.xml" 파일로 표현됩니다 ([문서](https://clickhouse.com/docs/operations/configuration_files/))

### 사용자 정의 구성으로 서버 인스턴스 시작 {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### 사용자 정의 사용자로 서버 시작 {#start-server-custom-user}

로컬 디렉토리를 마운트하여 이미지를 사용할 때는 적절한 파일 소유권을 유지하기 위해 사용자를 지정하려고 할 수 있습니다. `--user` 인수를 사용하고 `/var/lib/clickhouse`와 `/var/log/clickhouse-server`를 컨테이너 내에 마운트하십시오. 그렇지 않으면 이미지가 불만을 제기하고 시작되지 않을 것입니다.

### 루트로 서버 시작 {#start-server-from-root}

루트에서 서버를 시작하는 것은 사용자 네임스페이스가 활성화된 경우에 유용합니다. 이렇게 하려면:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 시작 시 기본 데이터베이스 및 사용자 만들기 {#how-to-create-default-db-and-user}

때때로 컨테이너 시작 시 사용자 (기본적으로 사용되는 사용자 이름 `default`)와 데이터베이스를 만들고 싶을 수 있습니다. 환경 변수 `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 및 `CLICKHOUSE_PASSWORD`를 사용하여 이를 수행할 수 있습니다:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### `default` 사용자 관리 {#managing-default-user}

사용자 `default`는 기본적으로 네트워크 접근이 차단되어 있으며, 이는 `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` 또는 `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` 중 하나도 설정되지 않은 경우입니다.

환경 변수 `CLICKHOUSE_SKIP_USER_SETUP`을 1로 설정하면 `default` 사용자를 안전하지 않게 사용할 수 있는 방법이 있습니다:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## 이 이미지를 확장하는 방법 {#how-to-extend-image}

이 이미지에서 파생된 이미지에서 추가 초기화를 수행하려면 `/docker-entrypoint-initdb.d` 아래에 하나 이상의 `*.sql`, `*.sql.gz` 또는 `*.sh` 스크립트를 추가하십시오. 엔트리포인트가 `initdb`를 호출하면 모든 `*.sql` 파일을 실행하고, 모든 실행 가능한 `*.sh` 스크립트를 실행하며, 해당 디렉토리에서 찾아지는 실행되지 않는 `*.sh` 스크립트를 소싱하여 서비스를 시작하기 전에 추가 초기화를 수행합니다. 또한, 초기화 동안 clickhouse-client에 사용될 `CLICKHOUSE_USER` 및 `CLICKHOUSE_PASSWORD` 환경 변수를 제공할 수 있습니다.

예를 들어, 다른 사용자 및 데이터베이스를 추가하려면 `/docker-entrypoint-initdb.d/init-db.sh`에 다음을 추가하십시오:
