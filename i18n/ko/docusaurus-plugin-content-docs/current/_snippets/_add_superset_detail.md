<details>
    <summary>Docker에서 Apache Superset 시작하기</summary>

Superset은 [Docker Compose를 사용하여 Superset 로컬 설치](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 지침을 제공합니다. GitHub에서 Apache Superset 레포를 체크아웃한 후, 최신 개발 코드를 실행하거나 특정 태그를 사용할 수 있습니다. `pre-release`로 표시되지 않은 최신 릴리스인 2.0.0 릴리스를 권장합니다.

`docker compose`를 실행하기 전에 수행해야 할 작업이 몇 가지 있습니다:

1. 공식 ClickHouse Connect 드라이버 추가
2. Mapbox API 키를 얻고 환경 변수로 추가 (선택 사항)
3. 실행할 Superset 버전 지정

:::tip
아래의 명령은 GitHub 레포의 최상위 수준인 `superset`에서 실행해야 합니다.
:::

## 공식 ClickHouse Connect 드라이버 {#official-clickhouse-connect-driver}

ClickHouse Connect 드라이버를 Superset 배포에서 사용할 수 있도록 하려면 로컬 요구 사항 파일에 추가해야 합니다:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

이는 선택 사항으로, Mapbox API 키 없이도 Superset에서 위치 데이터를 플로팅할 수 있지만, 키를 추가해야 한다는 메시지가 표시되며 맵의 배경 이미지가 누락됩니다 (데이터 포인트만 표시되고 맵 배경은 보이지 않습니다). Mapbox는 사용하고자 할 경우 무료 요금제를 제공합니다.

가이드는 위도 및 경도와 같은 위치 데이터로 생성하는 몇 가지 샘플 시각화를 포함합니다. Superset은 Mapbox 맵을 지원합니다. Mapbox 시각화를 사용하려면 Mapbox API 키가 필요합니다. [Mapbox 무료 요금제](https://account.mapbox.com/auth/signup/)에 가입하고 API 키를 생성하세요.

API 키를 Superset에서 사용할 수 있게 하세요:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Superset 버전 2.0.0 배포 {#deploy-superset-version-200}

릴리스 2.0.0을 배포하려면 다음을 실행하세요:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
