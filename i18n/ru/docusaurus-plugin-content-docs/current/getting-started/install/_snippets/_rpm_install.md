# Установка ClickHouse на дистрибутивы на основе rpm {#from-rpm-packages}

> Рекомендуется использовать официальные предкомпилированные пакеты `rpm` для **CentOS**, **RedHat** и всех других дистрибутивов Linux на основе rpm.

<VerticalStepper>


## Настройка RPM-репозитория {#setup-the-rpm-repository}

Добавьте официальный репозиторий, выполнив следующую команду:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

Для систем с менеджером пакетов `zypper` (openSUSE, SLES) выполните:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

В приведённых ниже шагах команду `yum install` можно заменить на `zypper install` в зависимости
от того, какой менеджер пакетов вы используете.


## Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client-1}

Для установки ClickHouse выполните следующие команды:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- Вы можете заменить `stable` на `lts`, чтобы использовать другие [типы релизов](/knowledgebase/production) в зависимости от ваших потребностей.
- Вы можете скачать и установить пакеты вручную с [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable).
- Чтобы указать конкретную версию, добавьте `-$version` в конец имени пакета,
  например:

```bash
sudo yum install clickhouse-server-22.8.7.34
```


## Запуск сервера ClickHouse {#start-clickhouse-server-1}

Чтобы запустить сервер ClickHouse, выполните:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

Чтобы запустить клиент ClickHouse, выполните:

```sql
clickhouse-client
```

Если вы установили пароль для сервера, то необходимо выполнить:

```bash
clickhouse-client --password
```


## Установка автономного ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
В продуктивных окружениях мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых окружениях, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном сервере,
то устанавливать ClickHouse Keeper не требуется, так как он входит в состав ClickHouse Server.
:::

Для установки `clickhouse-keeper` на автономных серверах ClickHouse Keeper выполните:

```bash
sudo yum install -y clickhouse-keeper
```


## Включение и запуск ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
