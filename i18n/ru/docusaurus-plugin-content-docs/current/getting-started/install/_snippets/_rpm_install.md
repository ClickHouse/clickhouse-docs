# Установка ClickHouse на дистрибутивах, основанных на RPM \{#from-rpm-packages\}

> Рекомендуется использовать официальные предварительно скомпилированные пакеты `rpm` для **CentOS**, **RedHat** и всех других Linux-дистрибутивов на основе RPM.

<VerticalStepper>

## Настройка RPM-репозитория \{#setup-the-rpm-repository\}

Добавьте официальный репозиторий, выполнив следующие команды:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

Для систем с пакетным менеджером `zypper` (openSUSE, SLES) выполните:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

В последующих шагах команду `yum install` можно заменить на `zypper install` в зависимости
от используемого пакетного менеджера.

## Установка сервера и клиента ClickHouse \{#install-clickhouse-server-and-client-1\}

Установите ClickHouse, выполнив следующие команды:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

* Вы можете заменить `stable` на `lts`, чтобы использовать другой [тип релиза](/knowledgebase/production) в зависимости от ваших потребностей.
* Вы можете загрузить и установить пакеты вручную по адресу [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable).
* Чтобы указать конкретную версию, добавьте `-$version` в конец имени пакета,
  например:

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## Запуск сервера ClickHouse \{#start-clickhouse-server-1\}

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

Если вы задали пароль для вашего сервера, вам потребуется выполнить:

```bash
clickhouse-client --password
```

## Установка автономного ClickHouse Keeper \{#install-standalone-clickhouse-keeper-1\}

:::tip
В продуктивных средах мы настоятельно рекомендуем запускать ClickHouse Keeper на отдельных узлах.
В тестовых средах, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном и том же сервере,
то вам не нужно устанавливать ClickHouse Keeper отдельно, так как он включен в состав ClickHouse Server.
:::

Чтобы установить `clickhouse-keeper` на отдельных серверах ClickHouse Keeper, выполните:

```bash
sudo yum install -y clickhouse-keeper
```

## Включение и запуск ClickHouse Keeper \{#enable-and-start-clickhouse-keeper-1\}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>