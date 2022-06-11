export const getRootPath = (ref?: string): string =>
  `${process.env.EPUB_URL}${ref ? '/' + ref : ''}`;
