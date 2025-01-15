import { visit } from 'unist-util-visit';

export default function fixLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      // e.g. fix `.md/#` → `.md#`
      if (node.url.includes('.md/#')) {
        node.url = node.url.replace('.md/#', '.md#');
      }
    });
  };
}
