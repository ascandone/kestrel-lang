// Generated from Kestrel.g4 by ANTLR 4.13.2

import {ParseTreeVisitor} from 'antlr4';


import { ModuleNamespaceContext } from "./KestrelParser.js";
import { ProgramContext } from "./KestrelParser.js";
import { Import_Context } from "./KestrelParser.js";
import { ValueExposingContext } from "./KestrelParser.js";
import { TypeExposingContext } from "./KestrelParser.js";
import { LetDeclarationContext } from "./KestrelParser.js";
import { TypeDeclarationContext } from "./KestrelParser.js";
import { StructDeclarationContext } from "./KestrelParser.js";
import { ExternTypeDeclarationContext } from "./KestrelParser.js";
import { AttrTypeContext } from "./KestrelParser.js";
import { AttrInlineContext } from "./KestrelParser.js";
import { AttrExternContext } from "./KestrelParser.js";
import { LetDeclaration_Context } from "./KestrelParser.js";
import { TypeDeclaration_Context } from "./KestrelParser.js";
import { StructDeclaration_Context } from "./KestrelParser.js";
import { ExternTypeDeclaration_Context } from "./KestrelParser.js";
import { PubExposingContext } from "./KestrelParser.js";
import { ParamsListContext } from "./KestrelParser.js";
import { TypeVariantsContext } from "./KestrelParser.js";
import { FieldDeclContext } from "./KestrelParser.js";
import { DeclarationFieldsContext } from "./KestrelParser.js";
import { PolyTypeContext } from "./KestrelParser.js";
import { TraitImplClauseContext } from "./KestrelParser.js";
import { NamedTypeContext } from "./KestrelParser.js";
import { FnTypeContext } from "./KestrelParser.js";
import { GenericTypeContext } from "./KestrelParser.js";
import { TupleTypeContext } from "./KestrelParser.js";
import { FnTypeParamsContext } from "./KestrelParser.js";
import { TypeConstructorDeclContext } from "./KestrelParser.js";
import { QualifiedIdContext } from "./KestrelParser.js";
import { StructFieldContext } from "./KestrelParser.js";
import { StructFieldsContext } from "./KestrelParser.js";
import { ListLitContext } from "./KestrelParser.js";
import { ParensContext } from "./KestrelParser.js";
import { StringContext } from "./KestrelParser.js";
import { MulDivContext } from "./KestrelParser.js";
import { AddSubContext } from "./KestrelParser.js";
import { FieldAccessContext } from "./KestrelParser.js";
import { FnContext } from "./KestrelParser.js";
import { MatchContext } from "./KestrelParser.js";
import { PipeContext } from "./KestrelParser.js";
import { FloatContext } from "./KestrelParser.js";
import { EqContext } from "./KestrelParser.js";
import { IntContext } from "./KestrelParser.js";
import { CompContext } from "./KestrelParser.js";
import { CallContext } from "./KestrelParser.js";
import { TupleContext } from "./KestrelParser.js";
import { CharContext } from "./KestrelParser.js";
import { BoolNotContext } from "./KestrelParser.js";
import { IdContext } from "./KestrelParser.js";
import { BlockExprContext } from "./KestrelParser.js";
import { IfContext } from "./KestrelParser.js";
import { BoolOrContext } from "./KestrelParser.js";
import { StructLitContext } from "./KestrelParser.js";
import { BoolAndContext } from "./KestrelParser.js";
import { ConsContext } from "./KestrelParser.js";
import { MatchClauseContext } from "./KestrelParser.js";
import { BlockLetHashContext } from "./KestrelParser.js";
import { BlockLetContext } from "./KestrelParser.js";
import { BlockContext } from "./KestrelParser.js";
import { IntPatternContext } from "./KestrelParser.js";
import { TuplePatternContext } from "./KestrelParser.js";
import { CharPatternContext } from "./KestrelParser.js";
import { ConsPatternContext } from "./KestrelParser.js";
import { FloatPatternContext } from "./KestrelParser.js";
import { ConstructorContext } from "./KestrelParser.js";
import { MatchIdentContext } from "./KestrelParser.js";
import { StringPatternContext } from "./KestrelParser.js";


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
	 * Visit a parse tree produced by the `typeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDeclaration?: (ctx: TypeDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `structDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructDeclaration?: (ctx: StructDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `externTypeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternTypeDeclaration?: (ctx: ExternTypeDeclarationContext) => Result;
	/**
	 * Visit a parse tree produced by the `attrType`
	 * labeled alternative in `KestrelParser.valueAttribute`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAttrType?: (ctx: AttrTypeContext) => Result;
	/**
	 * Visit a parse tree produced by the `attrInline`
	 * labeled alternative in `KestrelParser.valueAttribute`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAttrInline?: (ctx: AttrInlineContext) => Result;
	/**
	 * Visit a parse tree produced by the `attrExtern`
	 * labeled alternative in `KestrelParser.valueAttribute`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAttrExtern?: (ctx: AttrExternContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.letDeclaration_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetDeclaration_?: (ctx: LetDeclaration_Context) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.typeDeclaration_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDeclaration_?: (ctx: TypeDeclaration_Context) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.structDeclaration_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructDeclaration_?: (ctx: StructDeclaration_Context) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.externTypeDeclaration_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternTypeDeclaration_?: (ctx: ExternTypeDeclaration_Context) => Result;
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
	 * Visit a parse tree produced by `KestrelParser.fieldDecl`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldDecl?: (ctx: FieldDeclContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.declarationFields`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclarationFields?: (ctx: DeclarationFieldsContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.polyType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolyType?: (ctx: PolyTypeContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.traitImplClause`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTraitImplClause?: (ctx: TraitImplClauseContext) => Result;
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
	 * Visit a parse tree produced by `KestrelParser.structField`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructField?: (ctx: StructFieldContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.structFields`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructFields?: (ctx: StructFieldsContext) => Result;
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
	 * Visit a parse tree produced by the `fieldAccess`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldAccess?: (ctx: FieldAccessContext) => Result;
	/**
	 * Visit a parse tree produced by the `fn`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFn?: (ctx: FnContext) => Result;
	/**
	 * Visit a parse tree produced by the `match`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatch?: (ctx: MatchContext) => Result;
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
	 * Visit a parse tree produced by the `structLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructLit?: (ctx: StructLitContext) => Result;
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
	 * Visit a parse tree produced by `KestrelParser.matchClause`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatchClause?: (ctx: MatchClauseContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockLetHash`
	 * labeled alternative in `KestrelParser.blockStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockLetHash?: (ctx: BlockLetHashContext) => Result;
	/**
	 * Visit a parse tree produced by the `blockLet`
	 * labeled alternative in `KestrelParser.blockStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlockLet?: (ctx: BlockLetContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlock?: (ctx: BlockContext) => Result;
	/**
	 * Visit a parse tree produced by the `intPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIntPattern?: (ctx: IntPatternContext) => Result;
	/**
	 * Visit a parse tree produced by the `tuplePattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuplePattern?: (ctx: TuplePatternContext) => Result;
	/**
	 * Visit a parse tree produced by the `charPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCharPattern?: (ctx: CharPatternContext) => Result;
	/**
	 * Visit a parse tree produced by the `consPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConsPattern?: (ctx: ConsPatternContext) => Result;
	/**
	 * Visit a parse tree produced by the `floatPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFloatPattern?: (ctx: FloatPatternContext) => Result;
	/**
	 * Visit a parse tree produced by the `constructor`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstructor?: (ctx: ConstructorContext) => Result;
	/**
	 * Visit a parse tree produced by the `matchIdent`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatchIdent?: (ctx: MatchIdentContext) => Result;
	/**
	 * Visit a parse tree produced by the `stringPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringPattern?: (ctx: StringPatternContext) => Result;
}

