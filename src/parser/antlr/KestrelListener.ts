// Generated from Kestrel.g4 by ANTLR 4.13.1

import {ParseTreeListener} from "antlr4";


import { ModuleNamespaceContext } from "./KestrelParser";
import { ProgramContext } from "./KestrelParser";
import { Import_Context } from "./KestrelParser";
import { ValueExposingContext } from "./KestrelParser";
import { TypeExposingContext } from "./KestrelParser";
import { LetDeclarationContext } from "./KestrelParser";
import { ExternLetDeclarationContext } from "./KestrelParser";
import { TypeDeclarationContext } from "./KestrelParser";
import { StructDeclarationContext } from "./KestrelParser";
import { ExternTypeDeclarationContext } from "./KestrelParser";
import { LetDeclaration_Context } from "./KestrelParser";
import { ExternLetDeclaration_Context } from "./KestrelParser";
import { TypeDeclaration_Context } from "./KestrelParser";
import { StructDeclaration_Context } from "./KestrelParser";
import { ExternTypeDeclaration_Context } from "./KestrelParser";
import { PubExposingContext } from "./KestrelParser";
import { ParamsListContext } from "./KestrelParser";
import { TypeVariantsContext } from "./KestrelParser";
import { FieldDeclContext } from "./KestrelParser";
import { DeclarationFieldsContext } from "./KestrelParser";
import { PolyTypeContext } from "./KestrelParser";
import { TraitImplClauseContext } from "./KestrelParser";
import { NamedTypeContext } from "./KestrelParser";
import { FnTypeContext } from "./KestrelParser";
import { GenericTypeContext } from "./KestrelParser";
import { TupleTypeContext } from "./KestrelParser";
import { FnTypeParamsContext } from "./KestrelParser";
import { TypeConstructorDeclContext } from "./KestrelParser";
import { QualifiedIdContext } from "./KestrelParser";
import { StructFieldContext } from "./KestrelParser";
import { StructFieldsContext } from "./KestrelParser";
import { ListLitContext } from "./KestrelParser";
import { ParensContext } from "./KestrelParser";
import { StringContext } from "./KestrelParser";
import { MulDivContext } from "./KestrelParser";
import { AddSubContext } from "./KestrelParser";
import { FieldAccessContext } from "./KestrelParser";
import { FnContext } from "./KestrelParser";
import { MatchContext } from "./KestrelParser";
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
import { StructLitContext } from "./KestrelParser";
import { BoolAndContext } from "./KestrelParser";
import { ConsContext } from "./KestrelParser";
import { MatchClauseContext } from "./KestrelParser";
import { BlockContext } from "./KestrelParser";
import { BlockContentExprContext } from "./KestrelParser";
import { BlockContentLetHashExprContext } from "./KestrelParser";
import { BlockContentLetExprContext } from "./KestrelParser";
import { IntPatternContext } from "./KestrelParser";
import { TuplePatternContext } from "./KestrelParser";
import { CharPatternContext } from "./KestrelParser";
import { ConsPatternContext } from "./KestrelParser";
import { FloatPatternContext } from "./KestrelParser";
import { ConstructorContext } from "./KestrelParser";
import { MatchIdentContext } from "./KestrelParser";
import { StringPatternContext } from "./KestrelParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `KestrelParser`.
 */
export default class KestrelListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `KestrelParser.moduleNamespace`.
	 * @param ctx the parse tree
	 */
	enterModuleNamespace?: (ctx: ModuleNamespaceContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.moduleNamespace`.
	 * @param ctx the parse tree
	 */
	exitModuleNamespace?: (ctx: ModuleNamespaceContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.program`.
	 * @param ctx the parse tree
	 */
	enterProgram?: (ctx: ProgramContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.program`.
	 * @param ctx the parse tree
	 */
	exitProgram?: (ctx: ProgramContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.import_`.
	 * @param ctx the parse tree
	 */
	enterImport_?: (ctx: Import_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.import_`.
	 * @param ctx the parse tree
	 */
	exitImport_?: (ctx: Import_Context) => void;
	/**
	 * Enter a parse tree produced by the `valueExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 */
	enterValueExposing?: (ctx: ValueExposingContext) => void;
	/**
	 * Exit a parse tree produced by the `valueExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 */
	exitValueExposing?: (ctx: ValueExposingContext) => void;
	/**
	 * Enter a parse tree produced by the `typeExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 */
	enterTypeExposing?: (ctx: TypeExposingContext) => void;
	/**
	 * Exit a parse tree produced by the `typeExposing`
	 * labeled alternative in `KestrelParser.importExposing`.
	 * @param ctx the parse tree
	 */
	exitTypeExposing?: (ctx: TypeExposingContext) => void;
	/**
	 * Enter a parse tree produced by the `letDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterLetDeclaration?: (ctx: LetDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by the `letDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitLetDeclaration?: (ctx: LetDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by the `externLetDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterExternLetDeclaration?: (ctx: ExternLetDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by the `externLetDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitExternLetDeclaration?: (ctx: ExternLetDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by the `typeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterTypeDeclaration?: (ctx: TypeDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by the `typeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitTypeDeclaration?: (ctx: TypeDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by the `structDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterStructDeclaration?: (ctx: StructDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by the `structDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitStructDeclaration?: (ctx: StructDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by the `externTypeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterExternTypeDeclaration?: (ctx: ExternTypeDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by the `externTypeDeclaration`
	 * labeled alternative in `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitExternTypeDeclaration?: (ctx: ExternTypeDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.letDeclaration_`.
	 * @param ctx the parse tree
	 */
	enterLetDeclaration_?: (ctx: LetDeclaration_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.letDeclaration_`.
	 * @param ctx the parse tree
	 */
	exitLetDeclaration_?: (ctx: LetDeclaration_Context) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.externLetDeclaration_`.
	 * @param ctx the parse tree
	 */
	enterExternLetDeclaration_?: (ctx: ExternLetDeclaration_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.externLetDeclaration_`.
	 * @param ctx the parse tree
	 */
	exitExternLetDeclaration_?: (ctx: ExternLetDeclaration_Context) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.typeDeclaration_`.
	 * @param ctx the parse tree
	 */
	enterTypeDeclaration_?: (ctx: TypeDeclaration_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.typeDeclaration_`.
	 * @param ctx the parse tree
	 */
	exitTypeDeclaration_?: (ctx: TypeDeclaration_Context) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.structDeclaration_`.
	 * @param ctx the parse tree
	 */
	enterStructDeclaration_?: (ctx: StructDeclaration_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.structDeclaration_`.
	 * @param ctx the parse tree
	 */
	exitStructDeclaration_?: (ctx: StructDeclaration_Context) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.externTypeDeclaration_`.
	 * @param ctx the parse tree
	 */
	enterExternTypeDeclaration_?: (ctx: ExternTypeDeclaration_Context) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.externTypeDeclaration_`.
	 * @param ctx the parse tree
	 */
	exitExternTypeDeclaration_?: (ctx: ExternTypeDeclaration_Context) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.pubExposing`.
	 * @param ctx the parse tree
	 */
	enterPubExposing?: (ctx: PubExposingContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.pubExposing`.
	 * @param ctx the parse tree
	 */
	exitPubExposing?: (ctx: PubExposingContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.paramsList`.
	 * @param ctx the parse tree
	 */
	enterParamsList?: (ctx: ParamsListContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.paramsList`.
	 * @param ctx the parse tree
	 */
	exitParamsList?: (ctx: ParamsListContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.typeVariants`.
	 * @param ctx the parse tree
	 */
	enterTypeVariants?: (ctx: TypeVariantsContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.typeVariants`.
	 * @param ctx the parse tree
	 */
	exitTypeVariants?: (ctx: TypeVariantsContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.fieldDecl`.
	 * @param ctx the parse tree
	 */
	enterFieldDecl?: (ctx: FieldDeclContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.fieldDecl`.
	 * @param ctx the parse tree
	 */
	exitFieldDecl?: (ctx: FieldDeclContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.declarationFields`.
	 * @param ctx the parse tree
	 */
	enterDeclarationFields?: (ctx: DeclarationFieldsContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.declarationFields`.
	 * @param ctx the parse tree
	 */
	exitDeclarationFields?: (ctx: DeclarationFieldsContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.polyType`.
	 * @param ctx the parse tree
	 */
	enterPolyType?: (ctx: PolyTypeContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.polyType`.
	 * @param ctx the parse tree
	 */
	exitPolyType?: (ctx: PolyTypeContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.traitImplClause`.
	 * @param ctx the parse tree
	 */
	enterTraitImplClause?: (ctx: TraitImplClauseContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.traitImplClause`.
	 * @param ctx the parse tree
	 */
	exitTraitImplClause?: (ctx: TraitImplClauseContext) => void;
	/**
	 * Enter a parse tree produced by the `namedType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	enterNamedType?: (ctx: NamedTypeContext) => void;
	/**
	 * Exit a parse tree produced by the `namedType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	exitNamedType?: (ctx: NamedTypeContext) => void;
	/**
	 * Enter a parse tree produced by the `fnType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	enterFnType?: (ctx: FnTypeContext) => void;
	/**
	 * Exit a parse tree produced by the `fnType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	exitFnType?: (ctx: FnTypeContext) => void;
	/**
	 * Enter a parse tree produced by the `genericType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	enterGenericType?: (ctx: GenericTypeContext) => void;
	/**
	 * Exit a parse tree produced by the `genericType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	exitGenericType?: (ctx: GenericTypeContext) => void;
	/**
	 * Enter a parse tree produced by the `tupleType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	enterTupleType?: (ctx: TupleTypeContext) => void;
	/**
	 * Exit a parse tree produced by the `tupleType`
	 * labeled alternative in `KestrelParser.type`.
	 * @param ctx the parse tree
	 */
	exitTupleType?: (ctx: TupleTypeContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.fnTypeParams`.
	 * @param ctx the parse tree
	 */
	enterFnTypeParams?: (ctx: FnTypeParamsContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.fnTypeParams`.
	 * @param ctx the parse tree
	 */
	exitFnTypeParams?: (ctx: FnTypeParamsContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.typeConstructorDecl`.
	 * @param ctx the parse tree
	 */
	enterTypeConstructorDecl?: (ctx: TypeConstructorDeclContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.typeConstructorDecl`.
	 * @param ctx the parse tree
	 */
	exitTypeConstructorDecl?: (ctx: TypeConstructorDeclContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.qualifiedId`.
	 * @param ctx the parse tree
	 */
	enterQualifiedId?: (ctx: QualifiedIdContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.qualifiedId`.
	 * @param ctx the parse tree
	 */
	exitQualifiedId?: (ctx: QualifiedIdContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.structField`.
	 * @param ctx the parse tree
	 */
	enterStructField?: (ctx: StructFieldContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.structField`.
	 * @param ctx the parse tree
	 */
	exitStructField?: (ctx: StructFieldContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.structFields`.
	 * @param ctx the parse tree
	 */
	enterStructFields?: (ctx: StructFieldsContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.structFields`.
	 * @param ctx the parse tree
	 */
	exitStructFields?: (ctx: StructFieldsContext) => void;
	/**
	 * Enter a parse tree produced by the `listLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterListLit?: (ctx: ListLitContext) => void;
	/**
	 * Exit a parse tree produced by the `listLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitListLit?: (ctx: ListLitContext) => void;
	/**
	 * Enter a parse tree produced by the `parens`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterParens?: (ctx: ParensContext) => void;
	/**
	 * Exit a parse tree produced by the `parens`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitParens?: (ctx: ParensContext) => void;
	/**
	 * Enter a parse tree produced by the `string`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by the `string`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;
	/**
	 * Enter a parse tree produced by the `MulDiv`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterMulDiv?: (ctx: MulDivContext) => void;
	/**
	 * Exit a parse tree produced by the `MulDiv`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitMulDiv?: (ctx: MulDivContext) => void;
	/**
	 * Enter a parse tree produced by the `AddSub`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterAddSub?: (ctx: AddSubContext) => void;
	/**
	 * Exit a parse tree produced by the `AddSub`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitAddSub?: (ctx: AddSubContext) => void;
	/**
	 * Enter a parse tree produced by the `fieldAccess`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterFieldAccess?: (ctx: FieldAccessContext) => void;
	/**
	 * Exit a parse tree produced by the `fieldAccess`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitFieldAccess?: (ctx: FieldAccessContext) => void;
	/**
	 * Enter a parse tree produced by the `fn`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterFn?: (ctx: FnContext) => void;
	/**
	 * Exit a parse tree produced by the `fn`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitFn?: (ctx: FnContext) => void;
	/**
	 * Enter a parse tree produced by the `match`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterMatch?: (ctx: MatchContext) => void;
	/**
	 * Exit a parse tree produced by the `match`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitMatch?: (ctx: MatchContext) => void;
	/**
	 * Enter a parse tree produced by the `Pipe`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterPipe?: (ctx: PipeContext) => void;
	/**
	 * Exit a parse tree produced by the `Pipe`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitPipe?: (ctx: PipeContext) => void;
	/**
	 * Enter a parse tree produced by the `float`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterFloat?: (ctx: FloatContext) => void;
	/**
	 * Exit a parse tree produced by the `float`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitFloat?: (ctx: FloatContext) => void;
	/**
	 * Enter a parse tree produced by the `Eq`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterEq?: (ctx: EqContext) => void;
	/**
	 * Exit a parse tree produced by the `Eq`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitEq?: (ctx: EqContext) => void;
	/**
	 * Enter a parse tree produced by the `int`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterInt?: (ctx: IntContext) => void;
	/**
	 * Exit a parse tree produced by the `int`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitInt?: (ctx: IntContext) => void;
	/**
	 * Enter a parse tree produced by the `Comp`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterComp?: (ctx: CompContext) => void;
	/**
	 * Exit a parse tree produced by the `Comp`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitComp?: (ctx: CompContext) => void;
	/**
	 * Enter a parse tree produced by the `call`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterCall?: (ctx: CallContext) => void;
	/**
	 * Exit a parse tree produced by the `call`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitCall?: (ctx: CallContext) => void;
	/**
	 * Enter a parse tree produced by the `tuple`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterTuple?: (ctx: TupleContext) => void;
	/**
	 * Exit a parse tree produced by the `tuple`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitTuple?: (ctx: TupleContext) => void;
	/**
	 * Enter a parse tree produced by the `char`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterChar?: (ctx: CharContext) => void;
	/**
	 * Exit a parse tree produced by the `char`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitChar?: (ctx: CharContext) => void;
	/**
	 * Enter a parse tree produced by the `BoolNot`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterBoolNot?: (ctx: BoolNotContext) => void;
	/**
	 * Exit a parse tree produced by the `BoolNot`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitBoolNot?: (ctx: BoolNotContext) => void;
	/**
	 * Enter a parse tree produced by the `id`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterId?: (ctx: IdContext) => void;
	/**
	 * Exit a parse tree produced by the `id`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitId?: (ctx: IdContext) => void;
	/**
	 * Enter a parse tree produced by the `blockExpr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterBlockExpr?: (ctx: BlockExprContext) => void;
	/**
	 * Exit a parse tree produced by the `blockExpr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitBlockExpr?: (ctx: BlockExprContext) => void;
	/**
	 * Enter a parse tree produced by the `if`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterIf?: (ctx: IfContext) => void;
	/**
	 * Exit a parse tree produced by the `if`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitIf?: (ctx: IfContext) => void;
	/**
	 * Enter a parse tree produced by the `BoolOr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterBoolOr?: (ctx: BoolOrContext) => void;
	/**
	 * Exit a parse tree produced by the `BoolOr`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitBoolOr?: (ctx: BoolOrContext) => void;
	/**
	 * Enter a parse tree produced by the `structLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterStructLit?: (ctx: StructLitContext) => void;
	/**
	 * Exit a parse tree produced by the `structLit`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitStructLit?: (ctx: StructLitContext) => void;
	/**
	 * Enter a parse tree produced by the `BoolAnd`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterBoolAnd?: (ctx: BoolAndContext) => void;
	/**
	 * Exit a parse tree produced by the `BoolAnd`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitBoolAnd?: (ctx: BoolAndContext) => void;
	/**
	 * Enter a parse tree produced by the `cons`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	enterCons?: (ctx: ConsContext) => void;
	/**
	 * Exit a parse tree produced by the `cons`
	 * labeled alternative in `KestrelParser.expr`.
	 * @param ctx the parse tree
	 */
	exitCons?: (ctx: ConsContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.matchClause`.
	 * @param ctx the parse tree
	 */
	enterMatchClause?: (ctx: MatchClauseContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.matchClause`.
	 * @param ctx the parse tree
	 */
	exitMatchClause?: (ctx: MatchClauseContext) => void;
	/**
	 * Enter a parse tree produced by `KestrelParser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;
	/**
	 * Enter a parse tree produced by the `blockContentExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	enterBlockContentExpr?: (ctx: BlockContentExprContext) => void;
	/**
	 * Exit a parse tree produced by the `blockContentExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	exitBlockContentExpr?: (ctx: BlockContentExprContext) => void;
	/**
	 * Enter a parse tree produced by the `blockContentLetHashExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	enterBlockContentLetHashExpr?: (ctx: BlockContentLetHashExprContext) => void;
	/**
	 * Exit a parse tree produced by the `blockContentLetHashExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	exitBlockContentLetHashExpr?: (ctx: BlockContentLetHashExprContext) => void;
	/**
	 * Enter a parse tree produced by the `blockContentLetExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	enterBlockContentLetExpr?: (ctx: BlockContentLetExprContext) => void;
	/**
	 * Exit a parse tree produced by the `blockContentLetExpr`
	 * labeled alternative in `KestrelParser.blockContent`.
	 * @param ctx the parse tree
	 */
	exitBlockContentLetExpr?: (ctx: BlockContentLetExprContext) => void;
	/**
	 * Enter a parse tree produced by the `intPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterIntPattern?: (ctx: IntPatternContext) => void;
	/**
	 * Exit a parse tree produced by the `intPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitIntPattern?: (ctx: IntPatternContext) => void;
	/**
	 * Enter a parse tree produced by the `tuplePattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterTuplePattern?: (ctx: TuplePatternContext) => void;
	/**
	 * Exit a parse tree produced by the `tuplePattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitTuplePattern?: (ctx: TuplePatternContext) => void;
	/**
	 * Enter a parse tree produced by the `charPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterCharPattern?: (ctx: CharPatternContext) => void;
	/**
	 * Exit a parse tree produced by the `charPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitCharPattern?: (ctx: CharPatternContext) => void;
	/**
	 * Enter a parse tree produced by the `consPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterConsPattern?: (ctx: ConsPatternContext) => void;
	/**
	 * Exit a parse tree produced by the `consPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitConsPattern?: (ctx: ConsPatternContext) => void;
	/**
	 * Enter a parse tree produced by the `floatPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterFloatPattern?: (ctx: FloatPatternContext) => void;
	/**
	 * Exit a parse tree produced by the `floatPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitFloatPattern?: (ctx: FloatPatternContext) => void;
	/**
	 * Enter a parse tree produced by the `constructor`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterConstructor?: (ctx: ConstructorContext) => void;
	/**
	 * Exit a parse tree produced by the `constructor`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitConstructor?: (ctx: ConstructorContext) => void;
	/**
	 * Enter a parse tree produced by the `matchIdent`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterMatchIdent?: (ctx: MatchIdentContext) => void;
	/**
	 * Exit a parse tree produced by the `matchIdent`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitMatchIdent?: (ctx: MatchIdentContext) => void;
	/**
	 * Enter a parse tree produced by the `stringPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	enterStringPattern?: (ctx: StringPatternContext) => void;
	/**
	 * Exit a parse tree produced by the `stringPattern`
	 * labeled alternative in `KestrelParser.matchPattern`.
	 * @param ctx the parse tree
	 */
	exitStringPattern?: (ctx: StringPatternContext) => void;
}

