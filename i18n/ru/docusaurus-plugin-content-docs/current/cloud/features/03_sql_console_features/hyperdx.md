---
'sidebar_label': 'HyperDX'
'slug': '/cloud/manage/hyperdx'
'title': 'HyperDX'
'description': 'Представляет HyperDX, UI для ClickStack - платформы мониторинга промышленного
  уровня, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трассировки,
  метрики и сессии в одном высокопроизводительном решении.'
'doc_type': 'guide'
---
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge/>

HyperDX — это пользовательский интерфейс для [**ClickStack**](/use-cases/observability/clickstack) — платформы наблюдаемости промышленного уровня, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трассировки, метрики и сеансы в одном высокопроизводительном решении. Разработанный для мониторинга и отладки сложных систем, ClickStack позволяет разработчикам и SRE отслеживать проблемы от начала до конца, не переключаясь между инструментами и не соединяя данные вручную с использованием временных меток или идентификаторов корреляции.

HyperDX — это специализированный фронтенд для исследования и визуализации данных наблюдаемости, поддерживающий как запросы в стиле Lucene, так и SQL, интерактивные панели мониторинга, оповещения, исследование трассировок и многое другое — все оптимизировано для ClickHouse в качестве бэкенда.

HyperDX в ClickHouse Cloud позволяет пользователям наслаждаться более простым опытом использования ClickStack — без инфраструктуры для управления, без отдельной аутентификации для настройки. HyperDX можно запустить одним щелчком и подключить к вашим данным — полностью интегрирован в систему аутентификации ClickHouse Cloud для бесшовного и безопасного доступа к вашим данным наблюдаемости.

## Развертывание {#main-concepts}

HyperDX в ClickHouse Cloud в настоящее время находится в частном превью и должен быть активирован на уровне организации. После активации пользователи найдут HyperDX доступным в главном левом навигационном меню при выборе любой службы.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

Чтобы начать работу с HyperDX в ClickHouse Cloud, рекомендуем ознакомиться с нашим специальным [руководством по началу работы](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).

Для получения дополнительных подробностей о ClickStack см. [полную документацию](/use-cases/observability/clickstack).