<details>
    <summary>Запуск Apache Superset в Docker</summary>

Superset предоставляет [инструкции по установке Superset локально с использованием Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/). После клонирования репозитория Apache Superset с GitHub вы можете запустить последнюю версию кода для разработки или конкретный тег. Мы рекомендуем релиз 2.0.0, так как это последний релиз, не помеченный как `pre-release`.

Перед запуском `docker compose` необходимо выполнить несколько задач:

1. Добавить официальный драйвер ClickHouse Connect
2. Получить API-ключ Mapbox и добавить его в качестве переменной окружения (опционально)
3. Указать версию Superset для запуска

:::tip
Команды ниже должны выполняться из корневой директории репозитория GitHub `superset`.
:::


## Официальный драйвер ClickHouse Connect {#official-clickhouse-connect-driver}

Чтобы драйвер ClickHouse Connect стал доступен в развёртывании Superset, добавьте его в локальный файл зависимостей:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox {#mapbox}

Это необязательно — вы можете отображать данные о местоположении в Superset без API-ключа Mapbox, но вы увидите сообщение с рекомендацией добавить ключ, а фоновое изображение карты будет отсутствовать (вы увидите только точки данных без подложки карты). Mapbox предоставляет бесплатный тариф, если вы хотите его использовать.

Некоторые примеры визуализаций, которые создаются в руководствах, используют данные о местоположении, например долготу и широту. Superset включает поддержку карт Mapbox. Для использования визуализаций Mapbox необходим API-ключ Mapbox. Зарегистрируйтесь на [бесплатном тарифе Mapbox](https://account.mapbox.com/auth/signup/) и сгенерируйте API-ключ.

Предоставьте API-ключ для Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```


## Развёртывание Superset версии 2.0.0 {#deploy-superset-version-200}

Для развёртывания релиза 2.0.0 выполните:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
