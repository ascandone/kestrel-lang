// Generated from Kestrel.g4 by ANTLR 4.13.1

import {ParseTreeListener} from "antlr4";


import { ProgramContext } from "./KestrelParser";
import { DeclarationContext } from "./KestrelParser";
import { ListLitContext } from "./KestrelParser";
import { ParensContext } from "./KestrelParser";
import { StringContext } from "./KestrelParser";
import { MulDivContext } from "./KestrelParser";
import { AddSubContext } from "./KestrelParser";
import { FnContext } from "./KestrelParser";
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
import { BlockContentLetExprContext } from "./KestrelParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `KestrelParser`.
 */
export default class KestrelListener extends ParseTreeListener {
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
	 * Enter a parse tree produced by `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterDeclaration?: (ctx: DeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitDeclaration?: (ctx: DeclarationContext) => void;
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
}
