// A JavaScript function that returns an object.
// `context` is provided by Docusaurus. Example: siteConfig can be accessed from context.
// `opts` is the user-defined options.
const menuItems = require('./menuItems.json')
const fetch = require('node-fetch');
async function chHeader(context, opts) {
  return {
    name: 'ch-header-plugin',
    
    async loadContent() {
      // The loadContent hook is executed after siteConfig and env has been loaded.
      // You can return a JavaScript object that will be passed to contentLoaded hook.
      const githubData = await fetch(
        'https://api.github.com/repos/ClickHouse/ClickHouse'
      )
      const data = await githubData.json()
      const stars = data?.stargazers_count ?? 28203
      return {
        github: {
          stars
        },
        menuItems
      }
    },
    
    async contentLoaded({content, actions}) {
      const {setGlobalData} = actions;
      setGlobalData(content)
    },
  };
}

module.exports = chHeader;
