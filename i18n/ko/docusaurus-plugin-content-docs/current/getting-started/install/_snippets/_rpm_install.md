
# Install ClickHouse on rpm-based distributions {#from-rpm-packages}

> **CentOS**, **RedHat** 및 기타 모든 rpm 기반 Linux 배포판에 대해 공식적으로 사전 컴파일된 `rpm` 패키지를 사용하는 것이 권장됩니다.

<VerticalStepper>

## Setup the RPM repository {#setup-the-rpm-repository}

다음 명령어를 실행하여 공식 저장소를 추가합니다:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` 패키지 관리자가 있는 시스템( openSUSE, SLES)에서는 다음을 실행합니다:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

아래 단계에서는 사용 중인 패키지 관리자에 따라 `yum install`을 `zypper install`로 대체할 수 있습니다.

## Install ClickHouse server and client {#install-clickhouse-server-and-client-1}

ClickHouse를 설치하려면 다음 명령어를 실행합니다:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 필요에 따라 다른 [release kinds](/knowledgebase/production)를 사용하려면 `stable`을 `lts`로 바꿀 수 있습니다.
- 패키지를 수동으로 [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable)에서 다운로드하고 설치할 수 있습니다.
- 특정 버전을 지정하려면 패키지 이름 끝에 `-$version`을 추가합니다, 예를 들면:

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## Start ClickHouse server {#start-clickhouse-server-1}

ClickHouse 서버를 시작하려면 다음을 실행합니다:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouse 클라이언트를 시작하려면 다음을 실행합니다:

```sql
clickhouse-client
```

서버에 대한 비밀번호를 설정한 경우 다음을 실행해야 합니다:

```bash
clickhouse-client --password
```

## Install standalone ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
생산 환경에서는 ClickHouse Keeper를 전용 노드에서 실행하는 것을 강력히 권장합니다.
테스트 환경에서 ClickHouse Server와 ClickHouse Keeper를 동일한 서버에서 실행하기로 결정한 경우 ClickHouse 서버에 포함되어 있으므로 ClickHouse Keeper를 설치할 필요가 없습니다.
:::

Standalone ClickHouse Keeper 서버에 `clickhouse-keeper`를 설치하려면 다음을 실행합니다:

```bash
sudo yum install -y clickhouse-keeper
```

## Enable and start ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
