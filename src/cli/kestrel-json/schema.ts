export type KestrelJson = {
  /**
   * The name of the package.
   * Mandatory when publishing packages.
   */
  name?: string;

  /**
   * The version of the package.
   * Mandatory when publishing packages.
   */
  version?: string;

  description?: string;
  tags?: string[];
  licence?: string;

  /**
   * The public modules when publishing the package.
   * Mandatory when publishing packages.
   * @example
   * ["My.Public.Mod", "Another.Mod"]
   */
  exposedModules?: string[];

  /**
   * The directories where to read kestrel modules from.
   * @example
   * ["src"]
   */
  sources: string[];

  devSources?: string[];

  dependencies?: {
    [packageName in string]: string;
  };

  devDependencies?: {
    [packageName in string]: string;
  };

  /**
   * @example
   * { main: "Main" }
   */
  entrypoints?: {
    [packageName in string]: string;
  };
};
