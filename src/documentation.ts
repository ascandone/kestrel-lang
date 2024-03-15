import { TypedModule, TypedTypeAst, typeToString } from "./typecheck";

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
  moduleName: string;
  items: Item[];
};

export function extractDocs(
  moduleName: string,
  typedModule: TypedModule,
): ModuleDoc {
  const items: Item[] = [];

  for (const decl of typedModule.declarations) {
    if (!decl.pub) {
      continue;
    }

    const item: Item = {
      type: "value",
      name: decl.binding.name,
      signature: typeToString(decl.binding.$.asType()),
    };

    if (decl.docComment !== undefined) {
      item.docComment = decl.docComment;
    }

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

    items.push(item);
  }

  return {
    moduleName,
    items,
  };
}

function typeAstToString(typeAst: TypedTypeAst): string {
  switch (typeAst.type) {
    case "any":
      throw new Error("[unrechable]");
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
