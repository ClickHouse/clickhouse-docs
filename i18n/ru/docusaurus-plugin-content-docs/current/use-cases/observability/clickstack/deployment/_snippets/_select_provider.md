import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';
import ResourceEstimation from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

:::note Scale vs Enterprise
Мы рекомендуем этот [тариф Scale](/cloud/manage/cloud-tiers) для большинства нагрузок ClickStack. Выберите тариф Enterprise, если вам требуются расширенные функции безопасности, такие как SAML, CMEK или соответствие требованиям HIPAA. Он также предлагает индивидуальные профили оборудования для очень крупных развертываний ClickStack. В таких случаях мы рекомендуем связаться со службой поддержки.
:::

Выберите поставщика Cloud и регион.

<Image img={region_resources} size="md" alt="Resource selector" border />

При указании CPU и памяти оценивайте их исходя из ожидаемой пропускной способности ingesтa ClickStack. Таблица ниже предоставляет рекомендации по размеру этих ресурсов.

<ResourceEstimation />

После того как вы укажете требования, ваш управляемый сервис ClickStack будет подготовлен в течение нескольких минут. Пока идёт подготовка, вы можете изучить остальную часть [ClickHouse Cloud console](/cloud/overview).

После **завершения подготовки опция &#39;ClickStack&#39; в левом меню будет доступна**.
