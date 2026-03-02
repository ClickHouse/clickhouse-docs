# tgz 아카이브를 사용하여 ClickHouse 설치 \{#install-clickhouse-using-tgz-archives\}

> `deb` 또는 `rpm` 패키지를 설치할 수 없는 Linux 배포판에서는 공식적으로 미리 컴파일된 `tgz` 아카이브 사용을 권장합니다.

<VerticalStepper>

## 최신 안정(stable) 버전 다운로드 및 설치 \{#install-latest-stable\}

필요한 버전은 `curl` 또는 `wget`을 사용하여 저장소 https://packages.clickhouse.com/tgz/ 에서 다운로드할 수 있습니다.
그다음 다운로드한 아카이브의 압축을 해제한 뒤 설치 스크립트를 사용하여 설치합니다.

아래는 최신 안정 버전을 설치하는 예제입니다.

:::note
프로덕션 환경에서는 최신 `stable` 버전 사용을 권장합니다.
릴리스 번호는 이 [GitHub 페이지](https://github.com/ClickHouse/ClickHouse/tags)에서
`-stable` 접미사가 붙은 항목으로 확인할 수 있습니다.
:::

## 최신 ClickHouse 버전 가져오기 \{#get-latest-version\}

GitHub에서 최신 ClickHouse 버전을 가져와 `LATEST_VERSION` 변수에 저장합니다.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## 시스템 아키텍처 감지 \{#detect-system-architecture\}

시스템 아키텍처를 감지하고 ARCH 변수를 해당 값으로 설정합니다:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64비트 프로세서용
  aarch64) ARCH=arm64 ;;        # ARM 64비트 프로세서용
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # 지원되지 않는 아키텍처인 경우 종료
esac
```

## 각 ClickHouse 컴포넌트용 tarball 다운로드 \{#download-tarballs\}

각 ClickHouse 컴포넌트용 tarball을 다운로드합니다. 이 루프는 먼저 아키텍처별 패키지를
시도한 후 실패하면 일반(generic) 패키지로 폴백합니다.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## 패키지 압축 해제 및 설치 \{#extract-and-install\}

아래 명령을 실행하여 다음 패키지를 압축 해제하고 설치합니다:
- `clickhouse-common-static`

```bash
# clickhouse-common-static 패키지 압축 해제 및 설치
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash
# 디버그 심볼 패키지 압축 해제 및 설치
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash
# 설정과 함께 서버 패키지 압축 해제 및 설치
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # 서버 시작
```

- `clickhouse-client`

```bash
# 클라이언트 패키지 압축 해제 및 설치
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>