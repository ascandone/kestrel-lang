// Generated from Kestrel.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { ModuleNamespaceContext } from "./KestrelParser";
import { ProgramContext } from "./KestrelParser";
import { Import_Context } from "./KestrelParser";
import { ValueExposingContext } from "./KestrelParser";
import { TypeExposingContext } from "./KestrelParser";
import { LetDeclarationContext } from "./KestrelParser";
import { ExternLetDeclarationContext } from "./KestrelParser";
import { TypeDeclarationContext } from "./KestrelParser";
import { ExternTypeDeclarationContext } from "./KestrelParser";
import { ExposingNestedContext } from "./KestrelParser";
import { PubExposingContext } from "./KestrelParser";
import { ParamsListContext } from "./KestrelParser";
import { TypeVariantsContext } from "./KestrelParser";
import { PolyTypeContext } from "./KestrelParser";
import { NamedTypeContext } from "./KestrelParser";
import { FnTypeContext } from "./KestrelParser";
import { GenericTypeContext } from "./KestrelParser";
import { TupleTypeContext } from "./KestrelParser";
import { FnTypeParamsContext } from "./KestrelParser";
import { TypeConstructorDeclContext } from "./KestrelParser";
import { QualifiedIdContext } from "./KestrelParser";
import { ListLitContext } from "./KestrelParser";
import { ParensContext } from "./KestrelParser";
import { StringContext } from "./KestrelParser";
import { MulDivContext } from "./KestrelParser";
import { AddSubContext } from "./KestrelParser";
import { FnContext } from "./KestrelParser";
import { PipeContext } from "./KestrelParser";
import { FloatContext } from "./KestrelParser";
import { EqContext } from "./KestrelParser";
import { IntContext } from "./KestrelParser";
import { CompContext } from "./KestrelParser";
import { CallContext } from "./KestrelParser";
import { TupleContext } from "./KestrelParser";
import { CharContext } from "./KestrelParser";
import { BoolNotContext } from "./KestrelParser";
import { IdContext } from "./KestrelParser";
import { BlockExprContext } from "./KestrelParser";
import { IfContext } from "./KestrelParser";
import { BoolOrContext } from "./KestrelParser";
import { BoolAndContext } from "./KestrelParser";
import { ConsContext } from "./KestrelParser";
import { BlockContext } from "./KestrelParser";
import { BlockContentExprContext } from "./KestrelParser";
import { BlockContentLetHashExprContext } from "./KestrelParser";
import { BlockContentLetExprContext } from "./KestrelParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `KestrelParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class KestrelVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `KestrelParser.moduleNamespace`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModuleNamespace?: (ctx: ModuleNamespaceContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.program`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram?: (ctx: ProgramContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.import_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImport_?: (ctx: Import_Context) => Result;
	/**
	 * Visit a parse tree produced by the `valueExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueExposing?: (ctx: ValueExposingContext) => Result;
	/**
	 * Visit a parse tree produced by the `typeExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeExposing?: (ctx: TypeExposingContext) => Result;
	/**
	 * Visit a parse tree produced by the `letDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetDeclaration?: (ctx: LetDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `externLetDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternLetDeclaration?: (ctx: ExternLetDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `typeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDeclaration?: (ctx: TypeDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `externTypeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternTypeDeclaration?: (ctx: ExternTypeDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.exposingNested`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExposingNested?: (ctx: ExposingNestedContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.pubExposing`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPubExposing?: (ctx: PubExposingContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.paramsList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParamsList?: (ctx: ParamsListContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.typeVariants`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeVariants?: (ctx: TypeVariantsContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.polyType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolyType?: (ctx: PolyTypeContext) => Result;
	/**
	 * Visit a parse tree produced by the `namedType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNamedType?: (ctx: NamedTypeContext) => Result;
	/**
	 * Visit a parse tree produced by the `fnType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFnType?: (ctx: FnTypeContext) => Result;
	/**
	 * Visit a parse tree produced by the `genericType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGenericType?: (ctx: GenericTypeContext) => Result;
	/**
	 * Visit a parse tree produced by the `tupleType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTupleType?: (ctx: TupleTypeContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.fnTypeParams`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFnTypeParams?: (ctx: FnTypeParamsContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.typeConstructorDecl`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeConstructorDecl?: (ctx: TypeConstructorDeclContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.qualifiedId`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedId?: (ctx: QualifiedIdContext) => Result;
	/**
	 * Visit a parse tree produced by the `listLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListLit?: (ctx: ListLitContext) => Result;
	/**
	 * Visit a parse tree produced by the `parens`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParens?: (ctx: ParensContext) => Result;
	/**
	 * Visit a parse tree produced by the `string`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitString?: (ctx: StringContext) => Result;
	/**
	 * Visit a parse tree produced by the `MulDiv`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMulDiv?: (ctx: MulDivContext) => Result;
	/**
	 * Visit a parse tree produced by the `AddSub`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAddSub?: (ctx: AddSubContext) => Result;
	/**
	 * Visit a parse tree produced by the `fn`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFn?: (ctx: FnContext) => Result;
	/**
	 * Visit a parse tree produced by the `Pipe`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPipe?: (ctx: PipeContext) => Result;
	/**
	 * Visit a parse tree produced by the `float`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFloat?: (ctx: FloatContext) => Result;
	/**
	 * Visit a parse tree produced by the `Eq`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEq?: (ctx: EqContext) => Result;
	/**
	 * Visit a parse tree produced by the `int`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInt?: (ctx: IntContext) => Result;
	/**
	 * Visit a parse tree produced by the `Comp`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComp?: (ctx: CompContext) => Result;
	/**
	 * Visit a parse tree produced by the `call`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCall?: (ctx: CallContext) => Result;
	/**
	 * Visit a parse tree produced by the `tuple`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple?: (ctx: TupleContext) => Result;
	/**
	 * Visit a parse tree produced by the `char`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitChar?: (ctx: CharContext) => Result;
	/**
	 * Visit a parse tree produced by the `BoolNot`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolNot?: (ctx: BoolNotContext) => Result;
	/**
	 * Visit a parse tree produced by the `id`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitId?: (ctx: IdContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockExpr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockExpr?: (ctx: BlockExprContext) => Result;
	/**
	 * Visit a parse tree produced by the `if`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIf?: (ctx: IfContext) => Result;
	/**
	 * Visit a parse tree produced by the `BoolOr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolOr?: (ctx: BoolOrContext) => Result;
	/**
	 * Visit a parse tree produced by the `BoolAnd`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolAnd?: (ctx: BoolAndContext) => Result;
	/**
	 * Visit a parse tree produced by the `cons`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCons?: (ctx: ConsContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlock?: (ctx: BlockContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockContentExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockContentExpr?: (ctx: BlockContentExprContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockContentLetHashExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockContentLetHashExpr?: (ctx: BlockContentLetHashExprContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockContentLetExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockContentLetExpr?: (ctx: BlockContentLetExprContext) => Result;
}

