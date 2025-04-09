---
sidebar_label: 'PrivateEndpointConfig'
title: 'PrivateEndpointConfig'
slug: /cloud/manage/api/privateEndpointConfig-api-reference
description: 'Документация по API облака для privateEndpointConfig'
---

## Получение конфигурации частного конечного точки для региона в облачном провайдере для организации

Информация, необходимая для настройки частного конечного точки

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| Cloud provider identifier | string | Идентификатор облачного провайдера. Один из aws, gcp или azure. | 
| Cloud provider region | string | Идентификатор региона внутри конкретных облачных провайдеров. | 


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| endpointServiceId | string | Уникальный идентификатор интерфейсного конечного пункта, который вы создали в своей VPC с ресурсом AWS (Имя службы) или GCP (Целевая служба) | 


#### Пример ответа

```
{
  "endpointServiceId": "string"
}
```
