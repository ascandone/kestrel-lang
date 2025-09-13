import { VersionsJson, versionsJsonDecoder } from "./registry";

async function fetchData(repo: string) {
  const response = await fetch(
    // `https://registry.npmjs.org/${repo}`
    `https://raw.githubusercontent.com/ascandone/kestrel-packages/refs/heads/main/${repo}/versions.json`,
  );

  const body = await response.json();

  const parsedBody = versionsJsonDecoder.decodeUnsafeThrow(body);
  return parsedBody;
}

export class Fetcher {
  private schemas = new Map<string, Promise<VersionsJson>>();

  private async cachedFetch(repo: string): Promise<VersionsJson> {
    const lookup = this.schemas.get(repo);
    if (lookup !== undefined) {
      return lookup;
    }

    const data = fetchData(repo);
    this.schemas.set(repo, data);
    return data;
  }

  async fetchAvailableVersions(repo: string): Promise<string[]> {
    const data = await this.cachedFetch(repo);
    return Object.keys(data.versions);
  }

  async fetchDependencies(
    pkg: string,
    version: string,
  ): Promise<Record<string, string>> {
    const data = await this.cachedFetch(pkg);

    const dep = data.versions[version];
    if (dep === undefined) {
      throw new Error(`Dep not found: ${pkg}@${version}`);
    }

    return dep.dependencies;
  }
}
