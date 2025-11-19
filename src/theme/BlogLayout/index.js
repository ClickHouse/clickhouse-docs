import React from 'react';
import BlogLayout from '@theme-original/BlogLayout';
import {ClickUIProvider} from '@clickhouse/click-ui/bundled';
import {useColorMode} from "@docusaurus/theme-common";

function BlogContentWithProvider({children}) {
  const { colorMode } = useColorMode();
  return (
    <ClickUIProvider theme={colorMode}>
      {children}
    </ClickUIProvider>
  );
}

export default function BlogLayoutWrapper(props) {
  const {children, ...otherProps} = props;

  return (
    <BlogLayout {...otherProps}>
      <BlogContentWithProvider>
        {children}
      </BlogContentWithProvider>
    </BlogLayout>
  );
}
