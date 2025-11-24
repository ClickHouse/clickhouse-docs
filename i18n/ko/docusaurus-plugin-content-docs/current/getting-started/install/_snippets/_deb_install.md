import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickHouse를 Debian/Ubuntu에 설치하기 {#install-from-deb-packages}

> **Debian** 또는 **Ubuntu**에 대해 공식적으로 미리 컴파일된 `deb` 패키지를 사용하는 것이 권장됩니다.

<VerticalStepper>

## Debian 저장소 설정하기 {#setup-the-debian-repository}

ClickHouse를 설치하려면 다음 명령어를 실행하십시오:

```bash

# Install prerequisite packages
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg


# Download the ClickHouse GPG key and store it in the keyring
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg


# Get the system architecture
ARCH=$(dpkg --print-architecture)


# Add the ClickHouse repository to apt sources
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list


# Update apt package lists
sudo apt-get update
```

- 필요에 따라 `stable`을 `lts`로 바꿔 다양한 [릴리스 종류](/knowledgebase/production)를 사용할 수 있습니다.
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/)에서 패키지를 수동으로 다운로드하고 설치할 수 있습니다.
<br/>
<details>
<summary>deb 패키지를 설치하기 위한 구식 배포판 방법</summary>

```bash

# Install prerequisite packages
sudo apt-get install apt-transport-https ca-certificates dirmngr


# Add the ClickHouse GPG key to authenticate packages
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754


# Add the ClickHouse repository to apt sources
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list


# Update apt package lists
sudo apt-get update


# Install ClickHouse server and client packages
sudo apt-get install -y clickhouse-server clickhouse-client


# Start the ClickHouse server service
sudo service clickhouse-server start


# Launch the ClickHouse command line client
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

## ClickHouse 서버 및 클라이언트 설치하기 {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## ClickHouse 시작하기 {#start-clickhouse-server}

ClickHouse 서버를 시작하려면 다음을 실행하십시오:

```bash
sudo service clickhouse-server start
```

ClickHouse 클라이언트를 시작하려면 다음을 실행하십시오:

```bash
clickhouse-client
```

서버에 대한 비밀번호를 설정한 경우, 다음을 실행해야 합니다:

```bash
clickhouse-client --password
```

## 독립형 ClickHouse Keeper 설치하기 {#install-standalone-clickhouse-keeper}

:::tip
운영 환경에서는 ClickHouse Keeper를 전용 노드에서 실행하는 것을 강력히 권장합니다.
테스트 환경에서는 ClickHouse 서버와 ClickHouse Keeper를 동일한 서버에서 실행하기로 결정한 경우, 
ClickHouse 서버에 포함되어 있으므로 ClickHouse Keeper를 별도로 설치할 필요가 없습니다.
:::

독립형 ClickHouse Keeper 서버에서 `clickhouse-keeper`를 설치하려면 다음을 실행하십시오:

```bash
sudo apt-get install -y clickhouse-keeper
```

## ClickHouse Keeper 활성화 및 시작하기 {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## 패키지 {#packages}

다양한 deb 패키지는 아래에서 자세히 설명됩니다:

| 패키지                          | 설명                                                                                                                                                                                                                                                                                    |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | ClickHouse 컴파일된 이진 파일을 설치합니다.                                                                                                                                                                                                                                             |
| `clickhouse-server`            | `clickhouse-server`에 대한 기호 링크를 생성하고 기본 서버 구성 파일을 설치합니다.                                                                                                                                                                                                     |
| `clickhouse-client`            | `clickhouse-client` 및 기타 클라이언트 관련 도구에 대한 기호 링크를 생성하고 클라이언트 구성 파일을 설치합니다.                                                                                                                                                                   |
| `clickhouse-common-static-dbg` | 디버그 정보를 포함한 ClickHouse 컴파일된 이진 파일을 설치합니다.                                                                                                                                                                                                                     |
| `clickhouse-keeper`            | 전용 ClickHouse Keeper 노드에 ClickHouse Keeper를 설치하는 데 사용됩니다. ClickHouse 서버와 동일한 서버에서 ClickHouse Keeper를 실행하는 경우 이 패키지를 설치할 필요가 없습니다. ClickHouse Keeper 및 기본 ClickHouse Keeper 구성 파일을 설치합니다. |

<br/>
:::info
특정 버전의 ClickHouse를 설치해야 하는 경우, 동일한 버전의 모든 패키지를 설치해야 합니다:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
