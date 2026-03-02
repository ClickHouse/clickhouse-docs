<details>
    <summary>Docker에서 Apache Superset 실행</summary>

Superset은 [Docker Compose를 사용한 로컬 Superset 설치](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 가이드를 제공합니다. GitHub에서 Apache Superset 저장소를 체크아웃한 후 최신 개발 코드 또는 특정 태그를 실행할 수 있습니다. `pre-release`로 표시되지 않은 최신 릴리스인 2.0.0 릴리스를 권장합니다.

`docker compose` 실행 전에 수행해야 할 작업은 다음과 같습니다:

1. 공식 ClickHouse Connect 드라이버 추가
2. Mapbox API 키 획득 및 환경 변수로 추가 (선택 사항)
3. 실행할 Superset 버전 지정

:::tip
아래 명령어는 GitHub 저장소 `superset`의 최상위 디렉터리에서 실행하십시오.
:::


## 공식 ClickHouse Connect 드라이버 \{#official-clickhouse-connect-driver\}

Superset 배포 환경에서 ClickHouse Connect 드라이버를 사용할 수 있도록 하려면 로컬 requirements 파일에 추가하십시오:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox \{#mapbox\}

이 단계는 선택 사항입니다. Mapbox API 키 없이도 Superset에서 위치 데이터를 시각화할 수 있지만, 키를 추가해야 한다는 메시지가 표시되고 지도 배경 이미지는 보이지 않아 데이터 포인트만 표시됩니다. Mapbox는 사용하려는 경우 무료 플랜을 제공합니다.

가이드에서 만들게 될 일부 예제 시각화는 경도와 위도 같은 위치 데이터를 사용합니다. Superset은 Mapbox 지도를 지원합니다. Mapbox 시각화를 사용하려면 Mapbox API 키가 필요합니다. [Mapbox 무료 플랜](https://account.mapbox.com/auth/signup/)에 가입한 후 API 키를 생성하십시오.

다음과 같이 Superset에서 API 키를 사용할 수 있도록 설정하십시오:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```


## Superset 버전 2.0.0 배포하기 \{#deploy-superset-version-200\}

릴리스 2.0.0을 배포하려면 다음 명령을 실행하세요:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
