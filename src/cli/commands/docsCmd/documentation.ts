import { nestedMapEntries } from "../../../data/defaultMap";
import { Position, gtEqPos } from "../../../parser";
import { TypedModule, TypedTypeAst, typeToString } from "../../../typecheck";
import { TypedProject } from "../../../typecheck/project";

export type Variant = {
  name: string;
  args: string[];
};

export type Item =
  | {
      type: "value";
      name: string;
      signature: string;
      docComment?: string;
    }
  | {
      type: "adt";
      name: string;
      params: string[];
      variants?: Variant[];
      docComment?: string;
    };

export type ModuleDoc = {
  moduleDoc?: string;
  moduleName: string;
  items: Item[];
};

export type ProjectDoc = {
  version: string;
  modules: Record<string, ModuleDoc>;
};

export function makeProjectDoc(
  package_: string,
  version: string,
  typedProject: TypedProject,
): ProjectDoc {
  const modules: ProjectDoc["modules"] = {};

  for (const [moduleId, modulePackage, [typedModule]] of nestedMapEntries(
    typedProject,
  )) {
    if (package_ !== modulePackage) {
      continue;
    }
    modules[moduleId] = makeModuleDoc(moduleId, typedModule);
  }
  return { version, modules };
}

export function makeModuleDoc(
  moduleName: string,
  typedModule: TypedModule,
): ModuleDoc {
  const items: Item[] = [];

  const positions = new WeakMap<Item, Position>();

  for (const decl of typedModule.declarations) {
    if (!decl.pub) {
      continue;
    }

    const item: Item = {
      type: "value",
      name: decl.binding.name,
      signature: typeToString(decl.binding.$type),
    };

    if (decl.docComment !== undefined) {
      item.docComment = decl.docComment;
    }

    positions.set(item, decl.range.start);
    items.push(item);
  }

  for (const typeDecl of typedModule.typeDeclarations) {
    if (!typeDecl.pub) {
      continue;
    }

    const item: Item = {
      type: "adt",
      name: typeDecl.name,
      params: typeDecl.params.map((p) => p.name),
    };

    if (typeDecl.docComment !== undefined) {
      item.docComment = typeDecl.docComment;
    }

    if (
      typeDecl.type === "adt" &&
      typeDecl.pub === ".." &&
      typeDecl.variants !== undefined
    ) {
      item.variants = typeDecl.variants.map((variant) => ({
        name: variant.name,
        args: variant.args.map(typeAstToString),
      }));
    }

    positions.set(item, typeDecl.range.start);
    items.push(item);
  }

  items.sort((a, b) => {
    if (gtEqPos(positions.get(a)!, positions.get(b)!)) {
      return 1;
    }
    return -1;
  });

  const moduleDoc: ModuleDoc = {
    moduleName,
    items,
  };

  if (typedModule.moduleDoc) {
    moduleDoc.moduleDoc = typedModule.moduleDoc;
  }

  return moduleDoc;
}

function typeAstToString(typeAst: TypedTypeAst): string {
  switch (typeAst.type) {
    case "any":
      throw new Error("[unreachable]");
    case "var":
      return typeAst.ident;
    case "named": {
      const args =
        typeAst.args.length === 0
          ? ""
          : `<${typeAst.args.map(typeAstToString).join(", ")}>`;
      return `${typeAst.name}${args}`;
    }
    case "fn": {
      const args = typeAst.args.map(typeAstToString).join(", ");
      const ret = typeAstToString(typeAst.return);
      return `Fn(${args}) -> ${ret}`;
    }
  }
}
