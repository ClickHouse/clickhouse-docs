# NixOS에 ClickHouse 설치 \{#install-from-nix\}

> ClickHouse는 Nixpkgs 저장소에서 제공되며 **Linux**와 **macOS**에서 Nix를 사용해 설치할 수 있습니다.

<VerticalStepper>

## Nix를 사용해 ClickHouse 설치 \{#install-clickhouse-using-nix\}

Nix를 사용하면 ClickHouse를 시스템에 영구적으로 추가하지 않고도 설치할 수 있습니다:

```bash
# 최신 안정(stable) 버전 설치
nix shell nixpkgs#clickhouse

# 또는 LTS 버전 설치
nix shell nixpkgs#clickhouse-lts
```

이렇게 하면 현재 셸 세션에서 `clickhouse` 바이너리를 사용할 수 있습니다.

- `nixpkgs#clickhouse` 패키지는 최신 안정(stable) 버전을 제공합니다.
- `nixpkgs#clickhouse-lts` 패키지는 장기 지원(Long Term Support) 버전을 제공합니다.
- 두 패키지는 모두 Linux와 macOS에서 사용할 수 있습니다.

## 영구 설치 \{#permanent-installation\}

시스템에 ClickHouse를 영구적으로 설치하려면:

**NixOS 사용자**는 `configuration.nix`에 다음을 추가합니다:

```nix
environment.systemPackages = with pkgs; [
  clickhouse
];
```

그런 다음 시스템을 재빌드합니다:

```bash
sudo nixos-rebuild switch
```

**NixOS가 아닌 사용자**는 Nix profile을 사용해 설치합니다:

```bash
# 최신 안정(stable) 버전 설치
nix profile install nixpkgs#clickhouse

# 또는 LTS 버전 설치
nix profile install nixpkgs#clickhouse-lts
```

## ClickHouse 서버 시작 \{#start-clickhouse-server\}

설치 후에는 다음과 같이 ClickHouse 서버를 시작합니다:

```bash
clickhouse-server
```

기본적으로 서버는 기본 구성으로 시작되며 `localhost:9000`에서 수신 대기합니다.

NixOS에서 운영 환경으로 사용할 경우 ClickHouse를 시스템 서비스로 구성하는 것이 좋습니다. 사용 가능한 구성 옵션은 [NixOS 매뉴얼](https://search.nixos.org/options?query=clickhouse)을 참고하십시오.

## ClickHouse 클라이언트 시작 \{#start-clickhouse-client\}

ClickHouse 서버에 연결하려면 새 터미널을 열고 다음을 실행합니다:

```bash
clickhouse-client
```

</VerticalStepper>

## Nix 패키지 소개 \{#about-nix-package\}

Nixpkgs의 ClickHouse 패키지에는 다음이 포함됩니다:

- `clickhouse-server` - ClickHouse 데이터베이스 서버
- `clickhouse-client` - ClickHouse에 연결하기 위한 명령줄 클라이언트
- `clickhouse-local` - 로컬 파일에서 SQL 쿼리를 실행하기 위한 도구
- 기타 ClickHouse 유틸리티

Nixpkgs의 ClickHouse 패키지에 대한 자세한 내용은 다음을 참조하십시오:

- [Nixpkgs ClickHouse 패키지](https://search.nixos.org/packages?query=clickhouse)
- [NixOS ClickHouse 서비스 옵션](https://search.nixos.org/options?query=clickhouse)