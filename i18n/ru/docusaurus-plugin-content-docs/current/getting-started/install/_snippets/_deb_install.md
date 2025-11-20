import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



# Установка ClickHouse на Debian/Ubuntu {#install-from-deb-packages}

> Рекомендуется использовать официальные предкомпилированные пакеты `deb` для **Debian** или **Ubuntu**.

<VerticalStepper>


## Настройка репозитория Debian {#setup-the-debian-repository}

Для установки ClickHouse выполните следующие команды:


```bash
# Установка необходимых пакетов
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
```


# Загрузите GPG-ключ ClickHouse и сохраните его в хранилище ключей
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg



# Определить архитектуру системы
ARCH=$(dpkg --print-architecture)



# Добавьте репозиторий ClickHouse в список источников apt
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list



# Обновление списка пакетов apt

sudo apt-get update

```

- Вы можете заменить `stable` на `lts`, чтобы использовать различные [типы релизов](/knowledgebase/production) в зависимости от ваших потребностей.
- Вы можете скачать и установить пакеты вручную с [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).
<br/>
<details>
<summary>Устаревший метод установки deb-пакетов для дистрибутивов</summary>
```


```bash
# Установка необходимых пакетов
sudo apt-get install apt-transport-https ca-certificates dirmngr
```


# Добавьте GPG‑ключ ClickHouse для проверки подлинности пакетов
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754



# Добавьте репозиторий ClickHouse в список источников apt
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    


# Обновите списки пакетов apt
sudo apt-get update



# Установка пакетов сервера и клиента ClickHouse
sudo apt-get install -y clickhouse-server clickhouse-client



# Запустите сервис сервера ClickHouse
sudo service clickhouse-server start



# Запуск клиентского приложения командной строки ClickHouse

clickhouse-client # или &quot;clickhouse-client --password&quot;, если вы задали пароль.

```

</details>
```


## Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```


## Запуск ClickHouse {#start-clickhouse-server}

Чтобы запустить сервер ClickHouse, выполните:

```bash
sudo service clickhouse-server start
```

Чтобы запустить клиент ClickHouse, выполните:

```bash
clickhouse-client
```

Если вы установили пароль для сервера, то необходимо выполнить:

```bash
clickhouse-client --password
```


## Установка автономного ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
В производственных окружениях мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых окружениях, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном сервере,
то устанавливать ClickHouse Keeper не требуется, так как он входит в состав ClickHouse Server.
:::

Для установки `clickhouse-keeper` на автономных серверах ClickHouse Keeper выполните:

```bash
sudo apt-get install -y clickhouse-keeper
```


## Включение и запуск ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>


## Пакеты {#packages}

Ниже приведено описание доступных deb-пакетов:

| Пакет                          | Описание                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse-common-static`     | Устанавливает скомпилированные бинарные файлы ClickHouse.                                                                                                                                                                                                                             |
| `clickhouse-server`            | Создаёт символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.                                                                                                                                                                               |
| `clickhouse-client`            | Создаёт символическую ссылку для `clickhouse-client` и других клиентских инструментов, а также устанавливает конфигурационные файлы клиента.                                                                                                                                          |
| `clickhouse-common-static-dbg` | Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.                                                                                                                                                                                                    |
| `clickhouse-keeper`            | Используется для установки ClickHouse Keeper на выделенных узлах ClickHouse Keeper. Если ClickHouse Keeper запускается на том же сервере, что и ClickHouse server, устанавливать этот пакет не требуется. Устанавливает ClickHouse Keeper и конфигурационные файлы ClickHouse Keeper по умолчанию. |

<br />
:::info Если необходимо установить конкретную версию ClickHouse, следует
установить все пакеты одной и той же версии: `sudo apt-get install
clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7
clickhouse-common-static=21.8.5.7` :::
