import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



# Установка ClickHouse на Debian/Ubuntu {#install-from-deb-packages}

> Рекомендуется использовать официальные предкомпилированные пакеты `deb` для **Debian** или **Ubuntu**.

<VerticalStepper>


## Настройка репозитория Debian {#setup-the-debian-repository}

Чтобы установить ClickHouse, выполните следующие команды:



```bash
# Установите необходимые пакеты
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
```


# Загрузите GPG‑ключ ClickHouse и сохраните его в ключевом хранилище
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg



# Определите архитектуру системы
ARCH=$(dpkg --print-architecture)



# Добавьте репозиторий ClickHouse в список источников пакетов apt
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list



# Обновить списки пакетов apt

sudo apt-get update

```

- Вы можете заменить `stable` на `lts`, чтобы использовать различные [типы релизов](/knowledgebase/production) в зависимости от ваших потребностей.
- Вы можете скачать и установить пакеты вручную с [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).
<br/>
<details>
<summary>Устаревший метод установки deb-пакетов для дистрибутивов</summary>
```


```bash
# Установите необходимые пакеты
sudo apt-get install apt-transport-https ca-certificates dirmngr
```


# Добавьте GPG-ключ ClickHouse для аутентификации пакетов
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754



# Добавьте репозиторий ClickHouse в список источников APT
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    


# Обновите списки пакетов apt
sudo apt-get update



# Установите пакеты сервера и клиента ClickHouse
sudo apt-get install -y clickhouse-server clickhouse-client



# Запустите службу сервера ClickHouse
sudo service clickhouse-server start



# Запустите клиент командной строки ClickHouse

clickhouse-client # или &quot;clickhouse-client --password&quot;, если вы указали пароль.

```

</details>
```


## Установка сервера и клиента ClickHouse

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```


## Запуск ClickHouse

Чтобы запустить сервер ClickHouse, выполните следующую команду:

```bash
sudo service clickhouse-server start
```

Чтобы запустить клиент ClickHouse, выполните:

```bash
clickhouse-client
```

Если вы задали пароль для своего сервера, вам потребуется выполнить:

```bash
clickhouse-client --password
```


## Установка автономного ClickHouse Keeper

:::tip
В производственных средах настоятельно рекомендуется запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном сервере,
то вам не нужно отдельно устанавливать ClickHouse Keeper, так как он включён в ClickHouse Server.
:::

Чтобы установить `clickhouse-keeper` на автономные серверы ClickHouse Keeper, выполните:

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

Доступные deb-пакеты описаны ниже:

| Package                        | Description                                                                                                                                                                                                                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | Устанавливает скомпилированные бинарные файлы ClickHouse.                                                                                                                                                                                                                             |
| `clickhouse-server`            | Создает символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.                                                                                                                                                                               |
| `clickhouse-client`            | Создает символическую ссылку для `clickhouse-client` и другие клиентские утилиты, а также устанавливает файлы конфигурации клиента.                                                                                                                                                   |
| `clickhouse-common-static-dbg` | Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.                                                                                                                                                                                                    |
| `clickhouse-keeper`            | Используется для установки ClickHouse Keeper на выделенные узлы ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, устанавливать этот пакет не нужно. Устанавливает ClickHouse Keeper и конфигурационные файлы ClickHouse Keeper по умолчанию. |

<br/>
:::info
Если вам нужно установить определенную версию ClickHouse, необходимо установить все пакеты одной и той же версии:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
