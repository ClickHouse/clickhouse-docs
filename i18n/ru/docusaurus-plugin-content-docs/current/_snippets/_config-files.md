:::important лучшие практики
При настройке сервера ClickHouse при добавлении или редактировании файлов конфигурации следует:

- Добавлять файлы в каталог `/etc/clickhouse-server/config.d/`
- Добавлять файлы в каталог `/etc/clickhouse-server/users.d/`
- Оставлять файл `/etc/clickhouse-server/config.xml` без изменений
- Оставлять файл `/etc/clickhouse-server/users.xml` без изменений 
:::