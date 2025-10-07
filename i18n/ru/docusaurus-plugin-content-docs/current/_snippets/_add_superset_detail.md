<details>
    <summary>Запуск Apache Superset в Docker</summary>

Superset предоставляет [инструкции по установке Superset локально с использованием Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/). После клонирования репозитория Apache Superset с GitHub вы можете запустить последнюю версию разработки или конкретный тег. Мы рекомендуем версию 2.0.0, так как это последняя версия, не помеченная как `pre-release`.

Перед запуском `docker compose` необходимо выполнить несколько задач:

1. Добавить официальный драйвер ClickHouse Connect
2. Получить ключ API Mapbox и добавить его как переменную окружения (необязательно)
3. Указать версию Superset для запуска

:::tip
Команды ниже следует выполнять из корневой директории репозитория GitHub, `superset`.
:::

## Официальный драйвер ClickHouse Connect {#official-clickhouse-connect-driver}

Чтобы сделать драйвер ClickHouse Connect доступным в развертывании Superset, добавьте его в файл локальных требований:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

Это необязательно, вы можете отображать данные о местоположении в Superset без ключа API Mapbox, но вы увидите сообщение, в котором говорится, что вам следует добавить ключ, а фоновое изображение карты будет отсутствовать (вы будете видеть только точки данных, а не фон карты). Mapbox предоставляет бесплатный тариф, если вы хотите его использовать.

Некоторые из образцов визуализаций, которые предлагает создать руководство, используют данные о местоположении, например, долготу и широту. Superset поддерживает карты Mapbox. Чтобы использовать визуализации Mapbox, вам нужен ключ API Mapbox. Зарегистрируйтесь на [бесплатном тарифе Mapbox](https://account.mapbox.com/auth/signup/) и сгенерируйте ключ API.

Сделайте ключ API доступным для Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Развертывание версии Superset 2.0.0 {#deploy-superset-version-200}

Чтобы развернуть версию 2.0.0, выполните:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
