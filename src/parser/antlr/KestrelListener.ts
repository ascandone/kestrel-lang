// Generated from Kestrel.g4 by ANTLR 4.13.1

import {ParseTreeListener} from "antlr4";


import { ProgramContext } from "./KestrelParser";
import { DeclarationContext } from "./KestrelParser";
import { ParensContext } from "./KestrelParser";
import { StringContext } from "./KestrelParser";
import { MulDivContext } from "./KestrelParser";
import { AddSubContext } from "./KestrelParser";
import { CharContext } from "./KestrelParser";
import { IdContext } from "./KestrelParser";
import { FloatContext } from "./KestrelParser";
import { IntContext } from "./KestrelParser";


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
}

