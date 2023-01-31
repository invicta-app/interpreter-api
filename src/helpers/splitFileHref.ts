export const splitFileHref = (href: string) => {
  if (typeof href !== 'string' || !href) return {};
  const hash = href.lastIndexOf('#');
  const href_id = href.slice(hash);
  const href_path = href.replace(href_id, '');
  return { href_path: href_path || '', href_id: href_id || '' };
};
