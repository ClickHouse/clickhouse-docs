// A JavaScript function that returns an object.
// `context` is provided by Docusaurus. Example: siteConfig can be accessed from context.
// `opts` is the user-defined options.
import menuItems from './menuItems.json' with { type: 'json' };

export default async function chHeader(context, opts) {
  return {
    name: 'ch-header-plugin',
    
    async loadContent() {
      let github_stars = 38100;
      try {
        const githubData = await fetch(
          'https://api.github.com/repos/ClickHouse/ClickHouse'
        )
        const data = await githubData.json()
        github_stars = data?.stargazers_count ?? github_stars
      } catch (error) {
        console.warn('Failed to fetch GitHub stars:', error)
      }
      return {
        github_stars,
        menuItems
      }
    },
    
    async contentLoaded({content, actions}) {
      const {setGlobalData} = actions;
      setGlobalData(content)
    },
  };
}
