---
sidebar_label: 'Организации'
title: 'Организации'
slug: /cloud/manage/api/organizations-api-reference
description: 'Документация по API облака для организаций'
---

## Получить список доступных организаций

Возвращает список с одной организацией, ассоциированной с ключом API в запросе.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations` |

### Запрос


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка, когда была создана организация. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Получить детали организации

Возвращает детали одной организации. Для получения деталей, ключ auth должен принадлежать этой организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка, когда была создана организация. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Обновить детали организации

Обновляет поля организации. Требуется роль ключа auth ADMIN.

| Метод | Путь |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID организации для обновления. | 

### Параметры тела

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| name | string | Название организации. | 
| privateEndpoints |  |  | 

### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка, когда была создана организация. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Список активностей организации

Возвращает список всех активностей организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| from_date | date-time | Начальная дата для поиска | 
| to_date | date-time | Конечная дата для поиска | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID активности. | 
| createdAt | date-time | Временная метка активности. ISO-8601. | 
| type | string | Тип активности. | 
| actorType | string | Тип актора: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актора. | 
| actorDetails | string | Дополнительная информация об актере. | 
| actorIpAddress | string | IP-адрес актора. Определен для типов акторов 'user' и 'api'. | 
| organizationId | string | Область активности: ID организации, к которой относится эта деятельность. | 
| serviceId | string | Область активности: ID сервиса, к которому относится эта деятельность. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## Активность организации

Возвращает одну активность организации по ID.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| activityId | string | ID запрашиваемой активности. | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID активности. | 
| createdAt | date-time | Временная метка активности. ISO-8601. | 
| type | string | Тип активности. | 
| actorType | string | Тип актора: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актора. | 
| actorDetails | string | Дополнительная информация об актере. | 
| actorIpAddress | string | IP-адрес актора. Определен для типов акторов 'user' и 'api'. | 
| organizationId | string | Область активности: ID организации, к которой относится эта деятельность. | 
| serviceId | string | Область активности: ID сервиса, к которому относится эта деятельность. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
