import { defaultMapGet } from "../data/defaultMap";
import {
  ErrorInfo,
  InvalidCatchall,
  InvalidTypeArity,
  TypeParamShadowing,
  UnboundTypeParam,
} from "./errors";
import {
  PolyTypeAst,
  Range,
  TypeAst,
  UntypedModule,
  UntypedTypeDeclaration,
} from "../parser";
import { TraitsMap, Type, Unifier } from "../type";
import { ResolutionAnalysis } from "./resolution";

export type PolytypeNode = UntypedTypeDeclaration | PolyTypeAst | TypeAst;

export class TypeAstsHydration {
  /**
   * Remember to handle instantiation before unifying it
   * */
  public getPolyType(node: PolytypeNode): Type {
    const t = this.polyTypes.get(node);
    if (t === undefined) {
      throw new Error("[unreachable] polytype not set");
    }
    return t;
  }

  public getAstPolytype(node: PolyTypeAst): [Type, TraitsMap] {
    const t = this.polyTypes.get(node);
    if (t === undefined) {
      throw new Error("[unreachable] polytype not set");
    }

    const traitsMap = this.traitsMaps.get(node);
    if (traitsMap === undefined) {
      throw new Error("[unreachable] polytype not set");
    }

    return [t, traitsMap];
  }

  private readonly traitsMaps = new WeakMap<PolyTypeAst, TraitsMap>();
  private readonly polyTypes = new WeakMap<PolytypeNode, Type>();

  constructor(
    private readonly package_: string,
    private readonly ns: string,
    private readonly module: UntypedModule,
    private readonly resolution: ResolutionAnalysis,
    private readonly emitError: (error: ErrorInfo) => void,
  ) {
    // Hydrate type declarations
    for (const declaration of this.module.typeDeclarations) {
      this.initHydrateTypeDeclaration(declaration);
    }

    // Hydrate type declarations' type hints
    for (const declaration of this.module.declarations) {
      if (declaration.typeHint === undefined) {
        continue;
      }

      const [type, traitsMap] = this.typeHintToType(declaration.typeHint);
      this.traitsMaps.set(declaration.typeHint, traitsMap);
      this.polyTypes.set(declaration.typeHint, type);
    }
  }

  private initHydrateTypeDeclaration(declaration: UntypedTypeDeclaration) {
    // Since we are creating a polytype, we don't care whether the variables are fresh
    // therefore we can use a local instance of a unifier as a type variables pool
    const unifier = new Unifier();

    const bound = new Map<string, Type>();

    const type: Type = {
      tag: "Named",
      module: this.ns,
      package: this.package_,
      name: declaration.name,
      args: declaration.params.map((p): Type => {
        if (bound.has(p.name)) {
          this.emitError({
            description: new TypeParamShadowing(p.name),
            range: p.range,
          });
        }

        const fresh = unifier.freshVar();
        bound.set(p.name, fresh);
        return fresh;
      }),
    };

    this.polyTypes.set(declaration, type);
    switch (declaration.type) {
      case "adt":
        for (const variant of declaration.variants) {
          for (const arg of variant.args) {
            const type = this.adtArgToType(arg, unifier, bound);
            this.polyTypes.set(arg, type);
          }
        }
        return;

      case "struct":
        throw new Error("handle struct types hydration");

      case "extern":
        return;
    }
  }

  // --- Cast type ASTs to actual types
  private adtArgToType(
    typeAst: TypeAst,
    unifier: Unifier,
    bound: Map<string, Type>,
  ): Type {
    return this.typeAstToType(typeAst, {
      getFreshVariable: () => unifier.freshVar(),
      getTypeVariable: (name, range) => {
        const lookup = bound.get(name);
        if (lookup === undefined) {
          this.emitError({
            description: new UnboundTypeParam(name),
            range,
          });
          return unifier.freshVar();
        }
        return lookup;
      },
      onCatchall: (range) => {
        this.emitError({
          description: new InvalidCatchall(),
          range,
        });
      },
    });
  }

  private typeHintToType(typeAst: PolyTypeAst): [Type, TraitsMap] {
    // Same as before: since we are going to instantiate this type later on,
    // we can have a local instance of Unifier
    const unifier = new Unifier();

    const boundTypes = new Map<string, Type>();
    const boundTraits = new Map<string, string[]>();
    for (const traitDef of typeAst.where) {
      boundTraits.set(traitDef.typeVar, traitDef.traits);
    }

    const outputTraits: TraitsMap = {};

    const type = this.typeAstToType(typeAst.mono, {
      boundTraits,
      getFreshVariable: () => unifier.freshVar(),
      getTypeVariable: (name) =>
        defaultMapGet(boundTypes, name, () => {
          const traits = boundTraits.get(name) ?? [];
          const tvar = unifier.freshVar();
          outputTraits[tvar.id] = traits;
          return tvar;
        }),
    });

    return [type, outputTraits];
  }

  private typeAstToType(
    typeAst: TypeAst,
    options: {
      getTypeVariable: (name: string, range: Range) => Type;
      getFreshVariable: () => Type;
      onCatchall?: (range: Range) => void;
      boundTraits?: Map<string, string[]>;
    },
  ): Type {
    switch (typeAst.type) {
      case "any":
        options.onCatchall?.(typeAst.range);
        return options.getFreshVariable();

      case "var":
        return options.getTypeVariable(typeAst.ident, typeAst.range);

      case "fn":
        return {
          tag: "Fn",
          args: typeAst.args.map((arg) => this.typeAstToType(arg, options)),
          return: this.typeAstToType(typeAst.return, options),
        };

      case "named": {
        const resolution = this.resolution.resolveType(typeAst);
        if (resolution === undefined) {
          return options.getFreshVariable();
        }

        if (resolution.declaration.params.length !== typeAst.args.length) {
          this.emitError({
            description: new InvalidTypeArity(
              resolution.declaration.name,
              resolution.declaration.params.length,
              typeAst.args.length,
            ),
            range: typeAst.range,
          });
        }

        return {
          tag: "Named",
          module: resolution.ns,
          package: resolution.package,
          name: resolution.declaration.name,
          args: typeAst.args.map((arg) => this.typeAstToType(arg, options)),
        };
      }
    }
  }
}
