/*
  The site as a file tree. This drives the home page: folders grow branches,
  files open pages. Add a page here and it appears on the tree.
*/
export interface TreeNode {
  name: string; // folders show this (e.g. work/); pages show their label
  label?: string; // the page's name, as shown on the tree
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
            { name: 'sequence', label: 'Sequence', kind: 'file', href: '/work/sequence/' },
            { name: 'realtruck-connect', label: 'RealTruck Connect', kind: 'file', href: '/work/realtruck-connect/' },
            { name: 'husky-liners', label: 'Husky Liners', kind: 'file', href: '/work/husky-liners/' },
          ],
        },
        {
          name: 'artcenter',
          kind: 'folder',
          children: [{ name: 'mindra', label: 'Mindra', kind: 'file', href: '/work/mindra/' }],
        },
      ],
    },
    { name: 'about', label: 'About', kind: 'file', href: '/about/' },
    { name: 'contact', label: 'Contact', kind: 'file', href: '/contact/' },
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
