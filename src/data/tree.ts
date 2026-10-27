/*
  The site as a file tree. This drives the home page: folders grow branches,
  files open pages. Add a page here and it appears on the tree.
*/
export interface TreeNode {
  name: string;
  kind: 'folder' | 'file';
  href?: string; // files only
  children?: TreeNode[]; // folders only
}

export const EMAIL = 'evan.a.springer@gmail.com';

export const tree: TreeNode = {
  name: 'evan',
  kind: 'folder',
  children: [
    {
      name: 'work',
      kind: 'folder',
      children: [
        {
          name: 'realtruck',
          kind: 'folder',
          children: [
            { name: 'sequence.md', kind: 'file', href: '/work/sequence/' },
            { name: 'realtruck-connect.md', kind: 'file', href: '/work/realtruck-connect/' },
            { name: 'husky-liners.md', kind: 'file', href: '/work/husky-liners/' },
          ],
        },
        { name: 'mindra.md', kind: 'file', href: '/work/mindra/' },
      ],
    },
    { name: 'about.md', kind: 'file', href: '/about/' },
    { name: 'contact.txt', kind: 'file', href: `mailto:${EMAIL}` },
  ],
};

/** Folder names leading to the file that links to `href`, e.g. ['work', 'realtruck']. */
export function folderPathTo(href: string, node: TreeNode = tree, trail: string[] = []): string[] | null {
  for (const child of node.children ?? []) {
    if (child.kind === 'file' && child.href === href) return trail;
    if (child.kind === 'folder') {
      const found = folderPathTo(href, child, [...trail, child.name]);
      if (found) return found;
    }
  }
  return null;
}

/** Link back to the home page with the tree grown and opened to this page's folder. */
export function treeLinkFor(href: string): string {
  const path = folderPathTo(href) ?? [];
  return `/#/${path.join('/')}`; // "#/" also tells the home page the tree is already grown
}
