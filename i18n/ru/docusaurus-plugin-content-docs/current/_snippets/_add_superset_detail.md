<details>
    <summary>Запуск Apache Superset в Docker</summary>

Superset предоставляет [инструкции по установке Superset локально с использованием Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/). После того как вы склонируете репозиторий Apache Superset с GitHub, вы можете запустить последний код разработки или конкретный тег. Мы рекомендуем релиз 2.0.0, так как это последний релиз, не помеченный как `pre-release`.

Перед запуском `docker compose` необходимо выполнить несколько задач:

1. Добавить официальный драйвер ClickHouse Connect
2. Получить ключ API Mapbox и добавить его в качестве переменной окружения (по желанию)
3. Указать версию Superset для запуска

:::tip
Команды ниже должны выполняться из корневой директории репозитория GitHub, `superset`.
:::

## Официальный драйвер ClickHouse Connect {#official-clickhouse-connect-driver}

Чтобы сделать драйвер ClickHouse Connect доступным в развертывании Superset, добавьте его в локальный файл зависимостей:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

Это необязательно, вы можете отображать данные о местоположении в Superset без ключа API Mapbox, но вы получите сообщение с предложением добавить ключ, и фоновое изображение карты будет отсутствовать (вы увидите только точки данных, а не фоновую карту). Mapbox предоставляет бесплатный тариф, если вы хотите его использовать.

Некоторые из образцов визуализаций, которые предлагают создать руководства, используют данные о местоположении, например долготу и широту. Superset включает поддержку карт Mapbox. Чтобы использовать визуализации Mapbox, вам нужен ключ API Mapbox. Зарегистрируйтесь для получения [бесплатного тарифа Mapbox](https://account.mapbox.com/auth/signup/) и сгенерируйте ключ API.

Сделайте ключ API доступным для Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Развертывание Superset версии 2.0.0 {#deploy-superset-version-200}

Чтобы развернуть релиз 2.0.0, выполните:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
