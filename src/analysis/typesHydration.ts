import { defaultRecordGet } from "../data/defaultMap";
import {
  ErrorInfo,
  InvalidCatchall,
  InvalidTypeArity,
  TypeParamShadowing,
  UnboundTypeParam,
} from "../errors";
import {
  PolyTypeAst,
  TypeAst,
  UntypedModule,
  UntypedTypeDeclaration,
} from "../parser";
import { ResolutionAnalysis } from "./resolution";
import {
  PolyType,
  TVar,
  Type,
  TypeScheme,
  generalizeAsScheme,
} from "../typecheck/type";

export type PolytypeNode = UntypedTypeDeclaration | PolyTypeAst | TypeAst;

export class TypeAstsHydration {
  private polyTypes = new WeakMap<PolytypeNode, PolyType>();
  public getPolytype(node: PolytypeNode): PolyType {
    const t = this.polyTypes.get(node);
    if (t === undefined) {
      throw new Error("[unreachable] unbounde polytype");
    }
    return t;
  }

  constructor(
    private ns: string,
    private module: UntypedModule,
    private resolution: ResolutionAnalysis,
    private emitError: (error: ErrorInfo) => void,
  ) {
    this.initHydrateTypes();
  }

  private initHydrateTypes() {
    for (const declaration of this.module.typeDeclarations) {
      this.initHydrateTypeDeclaration(declaration);
    }

    for (const declaration of this.module.declarations) {
      if (declaration.typeHint !== undefined) {
        const poly = this.typeAstToPoly(declaration.typeHint.mono, {}, false);
        this.polyTypes.set(declaration.typeHint, poly);
      }
    }
  }

  private initHydrateTypeDeclaration(declaration: UntypedTypeDeclaration) {
    const bound: Record<string, Type> = {};
    const args = declaration.params.map((p): Type => {
      if (bound[p.name] !== undefined) {
        this.emitError({
          description: new TypeParamShadowing(p.name),
          range: p.range,
        });
      }

      const fresh = TVar.fresh().asType();
      bound[p.name] = fresh;
      return fresh;
    });

    const type: Type = {
      type: "named",
      name: declaration.name,
      moduleName: this.ns,
      args,
    };

    const scheme = generalizeAsScheme(type);
    this.polyTypes.set(declaration, [scheme, type]);
    switch (declaration.type) {
      case "adt":
        for (const variant of declaration.variants) {
          for (const arg of variant.args) {
            const [_scheme, mono] = this.typeAstToPoly(arg, bound, true);
            this.polyTypes.set(arg, [scheme, mono]);
          }
        }
        return;

      case "struct":
        throw new Error("handle struct types hydration");

      case "extern":
        return;
    }
  }

  private typeAstToPoly(
    t: TypeAst,
    boundTypes: Record<string, Type>,
    forbidUnbound: boolean,
  ): PolyType {
    const scheme: TypeScheme = {};
    const recur = (t: TypeAst): Type => {
      switch (t.type) {
        case "any":
          if (forbidUnbound) {
            this.emitError({
              description: new InvalidCatchall(),
              range: t.range,
            });
          }
          return TVar.fresh().asType();

        case "var": {
          return defaultRecordGet(boundTypes, t.ident, (): Type => {
            if (forbidUnbound) {
              this.emitError({
                description: new UnboundTypeParam(t.ident),
                range: t.range,
              });
            }

            const [tvar, id] = TVar.freshWithId();
            scheme[id] = t.ident;
            return tvar.asType();
          });
        }

        case "named": {
          const resolved = this.resolution.resolveType(t);
          if (resolved === undefined) {
            return TVar.fresh().asType();
          }

          if (resolved.declaration.params.length !== t.args.length) {
            this.emitError({
              description: new InvalidTypeArity(
                resolved.declaration.name,
                resolved.declaration.params.length,
                t.args.length,
              ),
              range: t.range,
            });
          }

          return {
            type: "named",
            args: t.args.map((arg) => recur(arg)),
            moduleName: resolved.ns,
            name: resolved.declaration.name,
          };
        }

        case "fn":
          return {
            type: "fn",
            args: t.args.map((arg) => recur(arg)),
            return: recur(t.return),
          };
      }
    };

    return [scheme, recur(t)];
  }
}
