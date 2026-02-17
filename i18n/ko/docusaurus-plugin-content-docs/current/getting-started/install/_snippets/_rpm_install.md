# rpm 기반 배포판에 ClickHouse 설치 \{#from-rpm-packages\}

> **CentOS**, **RedHat** 및 기타 모든 rpm 기반 Linux 배포판에서는 공식 사전 컴파일된 `rpm` 패키지 사용을 권장합니다.

<VerticalStepper>

## RPM 리포지토리 설정 \{#setup-the-rpm-repository\}

다음 명령을 실행하여 공식 리포지토리를 추가합니다:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` 패키지 관리자(openSUSE, SLES)를 사용하는 시스템에서는 다음을 실행합니다:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

아래 단계에서 `yum install`은 사용하는 패키지 관리자에 따라 `zypper install`로 대체할 수 있습니다.

## ClickHouse server와 client 설치 \{#install-clickhouse-server-and-client-1\}

ClickHouse를 설치하려면 다음 명령을 실행합니다:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 필요에 따라 다른 [릴리스 종류](/knowledgebase/production)를 사용하려면 `stable`을 `lts`로 변경할 수 있습니다.
- [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable)에서 패키지를 수동으로 다운로드하여 설치할 수 있습니다.
- 특정 버전을 지정하려면 패키지 이름 끝에 `-$version`을 추가합니다. 예를 들어:

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## ClickHouse server 시작 \{#start-clickhouse-server-1\}

ClickHouse server를 시작하려면 다음을 실행합니다:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouse client를 시작하려면 다음을 실행합니다:

```sql
clickhouse-client
```

서버에 비밀번호를 설정한 경우 다음과 같이 실행합니다:

```bash
clickhouse-client --password
```

## 독립 실행형 ClickHouse Keeper 설치 \{#install-standalone-clickhouse-keeper-1\}

:::tip
운영 환경에서는 ClickHouse Keeper를 전용 노드에서 실행할 것을 강력히 권장합니다.
테스트 환경에서 ClickHouse Server와 ClickHouse Keeper를 동일한 서버에서 실행하기로 한 경우,
ClickHouse server에 ClickHouse Keeper가 포함되어 있으므로 별도로 ClickHouse Keeper를 설치할 필요가 없습니다.
:::

독립 실행형 ClickHouse Keeper 서버에 `clickhouse-keeper`를 설치하려면 다음을 실행합니다:

```bash
sudo yum install -y clickhouse-keeper
```

## ClickHouse Keeper 활성화 및 시작 \{#enable-and-start-clickhouse-keeper-1\}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>