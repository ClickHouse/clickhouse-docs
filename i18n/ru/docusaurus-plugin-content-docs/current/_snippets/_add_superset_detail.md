<details>
    <summary>Запуск Apache Superset в Docker</summary>

В Superset доступны инструкции по [локальной установке Superset с использованием Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/). После клонирования репозитория Apache Superset из GitHub можно запустить последнюю версию кода разработки или конкретный тег. Рекомендуется использовать релиз 2.0.0 — это последний релиз, не отмеченный как `pre-release`.

Перед запуском `docker compose` необходимо выполнить несколько задач:

1. Добавить официальный драйвер ClickHouse Connect
2. Получить API-ключ Mapbox и добавить его как переменную окружения (опционально)
3. Указать версию Superset для запуска

:::tip
Приведенные ниже команды необходимо выполнять из корневой директории репозитория GitHub `superset`.
:::


## Официальный драйвер ClickHouse Connect {#official-clickhouse-connect-driver}

Чтобы драйвер ClickHouse Connect был доступен в развертывании Superset, добавьте его в локальный файл `requirements`:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox {#mapbox}

Этот шаг необязателен: вы можете отображать геоданные в Superset без ключа API Mapbox, но при этом увидите сообщение с рекомендацией добавить ключ, а фоновое изображение карты будет отсутствовать (вы увидите только точки данных, но не подложку карты). Mapbox предоставляет бесплатный тарифный план, если вы хотите им воспользоваться.

Некоторые из примерных визуализаций, которые предлагается создать в руководствах, используют данные о местоположении, например долготу и широту. Superset поддерживает карты Mapbox. Чтобы использовать визуализации Mapbox, вам нужен ключ API Mapbox. Зарегистрируйтесь на [бесплатный тарифный план Mapbox](https://account.mapbox.com/auth/signup/) и сгенерируйте ключ API.

Сделайте ключ API доступным для Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```


## Развертывание Superset версии 2.0.0 {#deploy-superset-version-200}

Для развертывания релиза 2.0.0 выполните:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
