import slugify from "@sindresorhus/slugify";

const stripTrailingSlash = (str: string) => {
  return str.endsWith("/") ? str.slice(0, -1) : str;
};

const currentTenantUrl = (params?: { [param: string]: any }, path?: string) => {
  const tenant = params ? params.tenant : undefined;
  if (path) {
    const appPath = path.startsWith("/") ? path.substring(1, path.length - 1) : path;
    // console.log({ appPath });
    return `/app/${tenant}/${appPath}`;
  }
  return `/app/${tenant}/`;
};

export default {
  currentTenantUrl,
  stripTrailingSlash,
  slugify,
};
