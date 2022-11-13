export const GenericXMLTypes = ['html', 'body', 'section', 'title'];

export const TextTypes = ['span', 'p', 'i', 'q', 'blockquote'];

export const HeaderTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export const ArrayNodes = GenericXMLTypes.concat(HeaderTypes).concat(TextTypes);

// with preserveOrder = true
export type XMLNode = {
  // Higher Level XML Components
  html?: Array<XMLNode>;
  body?: Array<XMLNode>;
  section?: Array<XMLNode>;
  title?: Array<XMLNode>;

  // Text Types
  text?: string;
  p?: Array<XMLNode>;
  i?: Array<XMLNode>;
  q?: Array<XMLNode>;
  span?: Array<XMLNode>;
  blockquote?: Array<XMLNode>;

  // Headers
  h1?: Array<XMLNode>;
  h2?: Array<XMLNode>;
  h3?: Array<XMLNode>;
  h4?: Array<XMLNode>;
  h5?: Array<XMLNode>;
  h6?: Array<XMLNode>;
};

export type LinearXMLNode = XMLNode | Array<XMLNode>;
