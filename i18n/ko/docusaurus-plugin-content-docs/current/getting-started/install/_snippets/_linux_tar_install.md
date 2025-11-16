
# ClickHouse 설치하기 (tgz 아카이브 사용)

> `deb` 또는 `rpm` 패키지 설치가 불가능한 모든 Linux 배포판에 대해 공식적으로 미리 컴파일된 `tgz` 아카이브를 사용하는 것이 권장됩니다.

<VerticalStepper>

## 최신 안정 버전 다운로드 및 설치 {#install-latest-stable}

필요한 버치는 `curl` 또는 `wget`을 사용하여 https://packages.clickhouse.com/tgz/에서 다운로드할 수 있습니다.
다운로드한 아카이브는 압축을 풀고 설치 스크립트를 사용하여 설치해야 합니다.

아래는 최신 안정 버전을 설치하는 방법의 예입니다.

:::note
프로덕션 환경에서는 최신 `stable` 버전을 사용하는 것이 권장됩니다.
릴리스 번호는 이 [GitHub 페이지](https://github.com/ClickHouse/ClickHouse/tags)에서 
`-stable` 접미사를 가지고 찾을 수 있습니다.
:::

## 최신 ClickHouse 버전 가져오기 {#get-latest-version}

GitHub에서 최신 ClickHouse 버전을 가져와 `LATEST_VERSION` 변수에 저장합니다.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## 시스템 아키텍처 감지하기 {#detect-system-architecture}

시스템 아키텍처를 감지하고 ARCH 변수를 적절히 설정합니다:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## 각 ClickHouse 구성요소에 대한 tarball 다운로드 {#download-tarballs}

각 ClickHouse 구성 요소에 대한 tarball을 다운로드합니다. 루프는 먼저 아키텍처 전용 패키지를 시도하고, 그 후 일반 패키지로 대체됩니다.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## 패키지 추출 및 설치 {#extract-and-install}

아래 명령어를 실행하여 다음 패키지를 추출하고 설치합니다:
- `clickhouse-common-static`

```bash

# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash

# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash

# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

- `clickhouse-client`

```bash

# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
