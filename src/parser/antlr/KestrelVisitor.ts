// Generated from Kestrel.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { ProgramContext } from "./KestrelParser";
import { DeclarationContext } from "./KestrelParser";
import { ParensContext } from "./KestrelParser";
import { StringContext } from "./KestrelParser";
import { MulDivContext } from "./KestrelParser";
import { AddSubContext } from "./KestrelParser";
import { FloatContext } from "./KestrelParser";
import { EqContext } from "./KestrelParser";
import { IntContext } from "./KestrelParser";
import { CompContext } from "./KestrelParser";
import { CharContext } from "./KestrelParser";
import { BoolNotContext } from "./KestrelParser";
import { IdContext } from "./KestrelParser";
import { BoolOrContext } from "./KestrelParser";
import { BoolAndContext } from "./KestrelParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `KestrelParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class KestrelVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `KestrelParser.program`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram?: (ctx: ProgramContext) => Result;
	/**
	 * Visit a parse tree produced by `KestrelParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration?: (ctx: DeclarationContext) => Result;
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
}

