<details>
    <summary>Запуск Apache Superset в Docker</summary>

Superset предоставляет [инструкции по установке Superset локально с использованием Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/). После получения репозитория Apache Superset с GitHub вы можете запустить последнюю версию разработки или конкретный тег. Мы рекомендуем версию 2.0.0, так как она является последним релизом, не отмеченным как `pre-release`.

Перед запуском `docker compose` необходимо выполнить несколько задач:

1. Добавить официальный драйвер ClickHouse Connect
2. Получить API-ключ Mapbox и добавить его в качестве переменной окружения (опционально)
3. Указать версию Superset для запуска

:::tip
Команды ниже необходимо выполнять из корневого уровня репозитория GitHub, `superset`.
:::

## Официальный драйвер ClickHouse Connect {#official-clickhouse-connect-driver}

Чтобы сделать драйвер ClickHouse Connect доступным в развертывании Superset, добавьте его в локальный файл требований:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

Это опционально, вы можете визуализировать данные о местоположении в Superset без API-ключа Mapbox, но вы увидите сообщение, сообщающее о том, что необходимо добавить ключ, а фоновой изображение карты будет отсутствовать (вы увидите только точки данных, а не фон карты).  Mapbox предоставляет бесплатный тариф, если вы хотите его использовать.

Некоторые из образцов визуализаций, которые предлагают создать руководства, используют данные о местоположении, например долготу и широту. Superset поддерживает карты Mapbox. Чтобы использовать визуализации Mapbox, вам нужен API-ключ Mapbox. Зарегистрируйтесь на [бесплатный тариф Mapbox](https://account.mapbox.com/auth/signup/) и сгенерируйте API-ключ.

Сделайте API-ключ доступным для Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Развертывание версии Superset 2.0.0 {#deploy-superset-version-200}

Чтобы развернуть релиз 2.0.0, выполните:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
