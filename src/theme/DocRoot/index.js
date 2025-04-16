import React from 'react';
import DocRoot from '@theme-original/DocRoot';
import {ClickUIProvider} from '@clickhouse/click-ui/bundled';
import {useColorMode} from "@docusaurus/theme-common";
export default function DocRootWrapper(props) {
  const { colorMode } = useColorMode();
  return (
    <>
        <ClickUIProvider theme={colorMode}>
            <DocRoot {...props} />
        </ClickUIProvider>
    </>
  );
}
