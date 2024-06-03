// Generated from Kestrel.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import KestrelListener from "./KestrelListener.js";
import KestrelVisitor from "./KestrelVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class KestrelParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly LineComment = 40;
	public static readonly ID = 41;
	public static readonly TYPE_ID = 42;
	public static readonly INT = 43;
	public static readonly CHAR = 44;
	public static readonly STRING = 45;
	public static readonly FLOAT = 46;
	public static readonly NEWLINE = 47;
	public static readonly WS = 48;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_program = 0;
	public static readonly RULE_declaration = 1;
	public static readonly RULE_typeVariants = 2;
	public static readonly RULE_polyType = 3;
	public static readonly RULE_type = 4;
	public static readonly RULE_fnTypeParams = 5;
	public static readonly RULE_typeConstructorDecl = 6;
	public static readonly RULE_expr = 7;
	public static readonly RULE_block = 8;
	public static readonly RULE_blockContent = 9;
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "':'", "'='", 
                                                            "'type'", "'{'", 
                                                            "'}'", "','", 
                                                            "'<'", "'>'", 
                                                            "'Fn'", "'('", 
                                                            "')'", "'->'", 
                                                            "'!'", "'*'", 
                                                            "'/'", "'*.'", 
                                                            "'/.'", "'%'", 
                                                            "'+'", "'-'", 
                                                            "'+.'", "'-.'", 
                                                            "'++'", "'::'", 
                                                            "'=='", "'!='", 
                                                            "'<='", "'>='", 
                                                            "'||'", "'&&'", 
                                                            "'fn'", "'if'", 
                                                            "'else'", "'['", 
                                                            "']'", "'|>'", 
                                                            "'let#'", "';'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "LineComment", 
                                                             "ID", "TYPE_ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"program", "declaration", "typeVariants", "polyType", "type", "fnTypeParams", 
		"typeConstructorDecl", "expr", "block", "blockContent",
	];
	public get grammarFileName(): string { return "Kestrel.g4"; }
	public get literalNames(): (string | null)[] { return KestrelParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return KestrelParser.symbolicNames; }
	public get ruleNames(): string[] { return KestrelParser.ruleNames; }
	public get serializedATN(): number[] { return KestrelParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, KestrelParser._ATN, KestrelParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, KestrelParser.RULE_program);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 23;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1 || _la===4) {
				{
				{
				this.state = 20;
				this.declaration();
				}
				}
				this.state = 25;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 26;
			this.match(KestrelParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public declaration(): DeclarationContext {
		let localctx: DeclarationContext = new DeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, KestrelParser.RULE_declaration);
		let _la: number;
		try {
			this.state = 43;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 28;
				this.match(KestrelParser.T__0);
				this.state = 29;
				this.match(KestrelParser.ID);
				this.state = 32;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===2) {
					{
					this.state = 30;
					this.match(KestrelParser.T__1);
					this.state = 31;
					(localctx as LetDeclarationContext)._typeHint = this.polyType();
					}
				}

				this.state = 34;
				this.match(KestrelParser.T__2);
				this.state = 35;
				this.expr(0);
				}
				break;
			case 4:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 36;
				this.match(KestrelParser.T__3);
				this.state = 37;
				(localctx as TypeDeclarationContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 38;
				this.match(KestrelParser.T__4);
				this.state = 40;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===42) {
					{
					this.state = 39;
					this.typeVariants();
					}
				}

				this.state = 42;
				this.match(KestrelParser.T__5);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeVariants(): TypeVariantsContext {
		let localctx: TypeVariantsContext = new TypeVariantsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, KestrelParser.RULE_typeVariants);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 45;
			this.typeConstructorDecl();
			this.state = 50;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 46;
					this.match(KestrelParser.T__6);
					this.state = 47;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 52;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
			}
			this.state = 54;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 53;
				this.match(KestrelParser.T__6);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public polyType(): PolyTypeContext {
		let localctx: PolyTypeContext = new PolyTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, KestrelParser.RULE_polyType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 56;
			this.type_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_(): TypeContext {
		let localctx: TypeContext = new TypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, KestrelParser.RULE_type);
		let _la: number;
		try {
			this.state = 94;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 42:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 58;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 70;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===8) {
					{
					this.state = 59;
					this.match(KestrelParser.T__7);
					this.state = 60;
					this.type_();
					this.state = 65;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===7) {
						{
						{
						this.state = 61;
						this.match(KestrelParser.T__6);
						this.state = 62;
						this.type_();
						}
						}
						this.state = 67;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 68;
					this.match(KestrelParser.T__8);
					}
				}

				}
				break;
			case 10:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 72;
				this.match(KestrelParser.T__9);
				this.state = 73;
				this.match(KestrelParser.T__10);
				this.state = 75;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===10 || _la===11 || _la===41 || _la===42) {
					{
					this.state = 74;
					this.fnTypeParams();
					}
				}

				this.state = 77;
				this.match(KestrelParser.T__11);
				this.state = 78;
				this.match(KestrelParser.T__12);
				this.state = 79;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 41:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 80;
				this.match(KestrelParser.ID);
				}
				break;
			case 11:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 81;
				this.match(KestrelParser.T__10);
				this.state = 82;
				this.type_();
				this.state = 83;
				this.match(KestrelParser.T__6);
				this.state = 84;
				this.type_();
				this.state = 89;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===7) {
					{
					{
					this.state = 85;
					this.match(KestrelParser.T__6);
					this.state = 86;
					this.type_();
					}
					}
					this.state = 91;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 92;
				this.match(KestrelParser.T__11);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fnTypeParams(): FnTypeParamsContext {
		let localctx: FnTypeParamsContext = new FnTypeParamsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 96;
			this.type_();
			this.state = 101;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 97;
					this.match(KestrelParser.T__6);
					this.state = 98;
					this.type_();
					}
					}
				}
				this.state = 103;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			}
			this.state = 105;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 104;
				this.match(KestrelParser.T__6);
				}
			}

			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeConstructorDecl(): TypeConstructorDeclContext {
		let localctx: TypeConstructorDeclContext = new TypeConstructorDeclContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, KestrelParser.RULE_typeConstructorDecl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 107;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 119;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 108;
				this.match(KestrelParser.T__10);
				this.state = 109;
				this.type_();
				this.state = 114;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===7) {
					{
					{
					this.state = 110;
					this.match(KestrelParser.T__6);
					this.state = 111;
					this.type_();
					}
					}
					this.state = 116;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 117;
				this.match(KestrelParser.T__11);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public expr(): ExprContext;
	public expr(_p: number): ExprContext;
	// @RuleVersion(0)
	public expr(_p?: number): ExprContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: ExprContext = new ExprContext(this, this._ctx, _parentState);
		let _prevctx: ExprContext = localctx;
		let _startState: number = 14;
		this.enterRecursionRule(localctx, 14, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 183;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 122;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 123;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 124;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 125;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 126;
				this.match(KestrelParser.ID);
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 127;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__13);
				this.state = 128;
				this.expr(16);
				}
				break;
			case 7:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 129;
				this.match(KestrelParser.T__10);
				this.state = 130;
				this.expr(0);
				this.state = 131;
				this.match(KestrelParser.T__6);
				this.state = 132;
				this.expr(0);
				this.state = 137;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===7) {
					{
					{
					this.state = 133;
					this.match(KestrelParser.T__6);
					this.state = 134;
					this.expr(0);
					}
					}
					this.state = 139;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 140;
				this.match(KestrelParser.T__11);
				}
				break;
			case 8:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 142;
				this.match(KestrelParser.T__10);
				this.state = 143;
				this.expr(0);
				this.state = 144;
				this.match(KestrelParser.T__11);
				}
				break;
			case 9:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 146;
				this.block();
				}
				break;
			case 10:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 147;
				this.match(KestrelParser.T__31);
				this.state = 159;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===41) {
					{
					this.state = 148;
					this.match(KestrelParser.ID);
					this.state = 153;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 149;
							this.match(KestrelParser.T__6);
							this.state = 150;
							this.match(KestrelParser.ID);
							}
							}
						}
						this.state = 155;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
					}
					this.state = 157;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===7) {
						{
						this.state = 156;
						this.match(KestrelParser.T__6);
						}
					}

					}
				}

				this.state = 161;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 162;
				this.match(KestrelParser.T__32);
				this.state = 163;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 164;
				(localctx as IfContext)._then = this.block();
				this.state = 165;
				this.match(KestrelParser.T__33);
				this.state = 166;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 12:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 168;
				this.match(KestrelParser.T__34);
				this.state = 180;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 18464) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 31243) !== 0)) {
					{
					this.state = 169;
					this.expr(0);
					this.state = 174;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 170;
							this.match(KestrelParser.T__6);
							this.state = 171;
							this.expr(0);
							}
							}
						}
						this.state = 176;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
					}
					this.state = 178;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===7) {
						{
						this.state = 177;
						this.match(KestrelParser.T__6);
						}
					}

					}
				}

				this.state = 182;
				this.match(KestrelParser.T__35);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 227;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 225;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 26, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 185;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 186;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1015808) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 187;
						this.expr(16);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 188;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 189;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 32505856) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 190;
						this.expr(15);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 191;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 192;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__24);
						this.state = 193;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 194;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 195;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===26 || _la===27)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 196;
						this.expr(13);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 197;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 198;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 805307136) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 199;
						this.expr(12);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 200;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 201;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__29);
						this.state = 202;
						this.expr(11);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 203;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 204;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__30);
						this.state = 205;
						this.expr(10);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 206;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 207;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__36);
						this.state = 208;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 209;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 210;
						this.match(KestrelParser.T__10);
						this.state = 222;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 18464) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 31243) !== 0)) {
							{
							this.state = 211;
							this.expr(0);
							this.state = 216;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 23, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 212;
									this.match(KestrelParser.T__6);
									this.state = 213;
									this.expr(0);
									}
									}
								}
								this.state = 218;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 23, this._ctx);
							}
							this.state = 220;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===7) {
								{
								this.state = 219;
								this.match(KestrelParser.T__6);
								}
							}

							}
						}

						this.state = 224;
						this.match(KestrelParser.T__11);
						}
						break;
					}
					}
				}
				this.state = 229;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, KestrelParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 230;
			this.match(KestrelParser.T__4);
			this.state = 231;
			this.blockContent();
			this.state = 232;
			this.match(KestrelParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public blockContent(): BlockContentContext {
		let localctx: BlockContentContext = new BlockContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, KestrelParser.RULE_blockContent);
		try {
			this.state = 250;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 5:
			case 11:
			case 14:
			case 32:
			case 33:
			case 35:
			case 41:
			case 43:
			case 44:
			case 45:
			case 46:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 234;
				this.expr(0);
				}
				break;
			case 38:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 235;
				this.match(KestrelParser.T__37);
				this.state = 236;
				(localctx as BlockContentLetHashExprContext)._mapper = this.match(KestrelParser.ID);
				this.state = 237;
				(localctx as BlockContentLetHashExprContext)._binding = this.match(KestrelParser.ID);
				this.state = 238;
				this.match(KestrelParser.T__2);
				this.state = 239;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 240;
				this.match(KestrelParser.T__38);
				this.state = 241;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 1:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 243;
				this.match(KestrelParser.T__0);
				this.state = 244;
				(localctx as BlockContentLetExprContext)._binding = this.match(KestrelParser.ID);
				this.state = 245;
				this.match(KestrelParser.T__2);
				this.state = 246;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 247;
				this.match(KestrelParser.T__38);
				this.state = 248;
				(localctx as BlockContentLetExprContext)._body = this.blockContent();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 7:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		}
		return true;
	}
	private expr_sempred(localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 15);
		case 1:
			return this.precpred(this._ctx, 14);
		case 2:
			return this.precpred(this._ctx, 13);
		case 3:
			return this.precpred(this._ctx, 12);
		case 4:
			return this.precpred(this._ctx, 11);
		case 5:
			return this.precpred(this._ctx, 10);
		case 6:
			return this.precpred(this._ctx, 9);
		case 7:
			return this.precpred(this._ctx, 1);
		case 8:
			return this.precpred(this._ctx, 6);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,48,253,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,1,
	0,5,0,22,8,0,10,0,12,0,25,9,0,1,0,1,0,1,1,1,1,1,1,1,1,3,1,33,8,1,1,1,1,
	1,1,1,1,1,1,1,1,1,3,1,41,8,1,1,1,3,1,44,8,1,1,2,1,2,1,2,5,2,49,8,2,10,2,
	12,2,52,9,2,1,2,3,2,55,8,2,1,3,1,3,1,4,1,4,1,4,1,4,1,4,5,4,64,8,4,10,4,
	12,4,67,9,4,1,4,1,4,3,4,71,8,4,1,4,1,4,1,4,3,4,76,8,4,1,4,1,4,1,4,1,4,1,
	4,1,4,1,4,1,4,1,4,1,4,5,4,88,8,4,10,4,12,4,91,9,4,1,4,1,4,3,4,95,8,4,1,
	5,1,5,1,5,5,5,100,8,5,10,5,12,5,103,9,5,1,5,3,5,106,8,5,1,6,1,6,1,6,1,6,
	1,6,5,6,113,8,6,10,6,12,6,116,9,6,1,6,1,6,3,6,120,8,6,1,7,1,7,1,7,1,7,1,
	7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,5,7,136,8,7,10,7,12,7,139,9,7,1,7,
	1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,5,7,152,8,7,10,7,12,7,155,9,7,1,
	7,3,7,158,8,7,3,7,160,8,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,5,
	7,173,8,7,10,7,12,7,176,9,7,1,7,3,7,179,8,7,3,7,181,8,7,1,7,3,7,184,8,7,
	1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,
	1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,5,7,215,8,7,10,7,12,7,218,9,
	7,1,7,3,7,221,8,7,3,7,223,8,7,1,7,5,7,226,8,7,10,7,12,7,229,9,7,1,8,1,8,
	1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,
	3,9,251,8,9,1,9,0,1,14,10,0,2,4,6,8,10,12,14,16,18,0,4,1,0,15,19,1,0,20,
	24,1,0,26,27,2,0,8,9,28,29,291,0,23,1,0,0,0,2,43,1,0,0,0,4,45,1,0,0,0,6,
	56,1,0,0,0,8,94,1,0,0,0,10,96,1,0,0,0,12,107,1,0,0,0,14,183,1,0,0,0,16,
	230,1,0,0,0,18,250,1,0,0,0,20,22,3,2,1,0,21,20,1,0,0,0,22,25,1,0,0,0,23,
	21,1,0,0,0,23,24,1,0,0,0,24,26,1,0,0,0,25,23,1,0,0,0,26,27,5,0,0,1,27,1,
	1,0,0,0,28,29,5,1,0,0,29,32,5,41,0,0,30,31,5,2,0,0,31,33,3,6,3,0,32,30,
	1,0,0,0,32,33,1,0,0,0,33,34,1,0,0,0,34,35,5,3,0,0,35,44,3,14,7,0,36,37,
	5,4,0,0,37,38,5,42,0,0,38,40,5,5,0,0,39,41,3,4,2,0,40,39,1,0,0,0,40,41,
	1,0,0,0,41,42,1,0,0,0,42,44,5,6,0,0,43,28,1,0,0,0,43,36,1,0,0,0,44,3,1,
	0,0,0,45,50,3,12,6,0,46,47,5,7,0,0,47,49,3,12,6,0,48,46,1,0,0,0,49,52,1,
	0,0,0,50,48,1,0,0,0,50,51,1,0,0,0,51,54,1,0,0,0,52,50,1,0,0,0,53,55,5,7,
	0,0,54,53,1,0,0,0,54,55,1,0,0,0,55,5,1,0,0,0,56,57,3,8,4,0,57,7,1,0,0,0,
	58,70,5,42,0,0,59,60,5,8,0,0,60,65,3,8,4,0,61,62,5,7,0,0,62,64,3,8,4,0,
	63,61,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,65,66,1,0,0,0,66,68,1,0,0,0,67,
	65,1,0,0,0,68,69,5,9,0,0,69,71,1,0,0,0,70,59,1,0,0,0,70,71,1,0,0,0,71,95,
	1,0,0,0,72,73,5,10,0,0,73,75,5,11,0,0,74,76,3,10,5,0,75,74,1,0,0,0,75,76,
	1,0,0,0,76,77,1,0,0,0,77,78,5,12,0,0,78,79,5,13,0,0,79,95,3,8,4,0,80,95,
	5,41,0,0,81,82,5,11,0,0,82,83,3,8,4,0,83,84,5,7,0,0,84,89,3,8,4,0,85,86,
	5,7,0,0,86,88,3,8,4,0,87,85,1,0,0,0,88,91,1,0,0,0,89,87,1,0,0,0,89,90,1,
	0,0,0,90,92,1,0,0,0,91,89,1,0,0,0,92,93,5,12,0,0,93,95,1,0,0,0,94,58,1,
	0,0,0,94,72,1,0,0,0,94,80,1,0,0,0,94,81,1,0,0,0,95,9,1,0,0,0,96,101,3,8,
	4,0,97,98,5,7,0,0,98,100,3,8,4,0,99,97,1,0,0,0,100,103,1,0,0,0,101,99,1,
	0,0,0,101,102,1,0,0,0,102,105,1,0,0,0,103,101,1,0,0,0,104,106,5,7,0,0,105,
	104,1,0,0,0,105,106,1,0,0,0,106,11,1,0,0,0,107,119,5,42,0,0,108,109,5,11,
	0,0,109,114,3,8,4,0,110,111,5,7,0,0,111,113,3,8,4,0,112,110,1,0,0,0,113,
	116,1,0,0,0,114,112,1,0,0,0,114,115,1,0,0,0,115,117,1,0,0,0,116,114,1,0,
	0,0,117,118,5,12,0,0,118,120,1,0,0,0,119,108,1,0,0,0,119,120,1,0,0,0,120,
	13,1,0,0,0,121,122,6,7,-1,0,122,184,5,43,0,0,123,184,5,46,0,0,124,184,5,
	44,0,0,125,184,5,45,0,0,126,184,5,41,0,0,127,128,5,14,0,0,128,184,3,14,
	7,16,129,130,5,11,0,0,130,131,3,14,7,0,131,132,5,7,0,0,132,137,3,14,7,0,
	133,134,5,7,0,0,134,136,3,14,7,0,135,133,1,0,0,0,136,139,1,0,0,0,137,135,
	1,0,0,0,137,138,1,0,0,0,138,140,1,0,0,0,139,137,1,0,0,0,140,141,5,12,0,
	0,141,184,1,0,0,0,142,143,5,11,0,0,143,144,3,14,7,0,144,145,5,12,0,0,145,
	184,1,0,0,0,146,184,3,16,8,0,147,159,5,32,0,0,148,153,5,41,0,0,149,150,
	5,7,0,0,150,152,5,41,0,0,151,149,1,0,0,0,152,155,1,0,0,0,153,151,1,0,0,
	0,153,154,1,0,0,0,154,157,1,0,0,0,155,153,1,0,0,0,156,158,5,7,0,0,157,156,
	1,0,0,0,157,158,1,0,0,0,158,160,1,0,0,0,159,148,1,0,0,0,159,160,1,0,0,0,
	160,161,1,0,0,0,161,184,3,16,8,0,162,163,5,33,0,0,163,164,3,14,7,0,164,
	165,3,16,8,0,165,166,5,34,0,0,166,167,3,16,8,0,167,184,1,0,0,0,168,180,
	5,35,0,0,169,174,3,14,7,0,170,171,5,7,0,0,171,173,3,14,7,0,172,170,1,0,
	0,0,173,176,1,0,0,0,174,172,1,0,0,0,174,175,1,0,0,0,175,178,1,0,0,0,176,
	174,1,0,0,0,177,179,5,7,0,0,178,177,1,0,0,0,178,179,1,0,0,0,179,181,1,0,
	0,0,180,169,1,0,0,0,180,181,1,0,0,0,181,182,1,0,0,0,182,184,5,36,0,0,183,
	121,1,0,0,0,183,123,1,0,0,0,183,124,1,0,0,0,183,125,1,0,0,0,183,126,1,0,
	0,0,183,127,1,0,0,0,183,129,1,0,0,0,183,142,1,0,0,0,183,146,1,0,0,0,183,
	147,1,0,0,0,183,162,1,0,0,0,183,168,1,0,0,0,184,227,1,0,0,0,185,186,10,
	15,0,0,186,187,7,0,0,0,187,226,3,14,7,16,188,189,10,14,0,0,189,190,7,1,
	0,0,190,226,3,14,7,15,191,192,10,13,0,0,192,193,5,25,0,0,193,226,3,14,7,
	13,194,195,10,12,0,0,195,196,7,2,0,0,196,226,3,14,7,13,197,198,10,11,0,
	0,198,199,7,3,0,0,199,226,3,14,7,12,200,201,10,10,0,0,201,202,5,30,0,0,
	202,226,3,14,7,11,203,204,10,9,0,0,204,205,5,31,0,0,205,226,3,14,7,10,206,
	207,10,1,0,0,207,208,5,37,0,0,208,226,3,14,7,2,209,210,10,6,0,0,210,222,
	5,11,0,0,211,216,3,14,7,0,212,213,5,7,0,0,213,215,3,14,7,0,214,212,1,0,
	0,0,215,218,1,0,0,0,216,214,1,0,0,0,216,217,1,0,0,0,217,220,1,0,0,0,218,
	216,1,0,0,0,219,221,5,7,0,0,220,219,1,0,0,0,220,221,1,0,0,0,221,223,1,0,
	0,0,222,211,1,0,0,0,222,223,1,0,0,0,223,224,1,0,0,0,224,226,5,12,0,0,225,
	185,1,0,0,0,225,188,1,0,0,0,225,191,1,0,0,0,225,194,1,0,0,0,225,197,1,0,
	0,0,225,200,1,0,0,0,225,203,1,0,0,0,225,206,1,0,0,0,225,209,1,0,0,0,226,
	229,1,0,0,0,227,225,1,0,0,0,227,228,1,0,0,0,228,15,1,0,0,0,229,227,1,0,
	0,0,230,231,5,5,0,0,231,232,3,18,9,0,232,233,5,6,0,0,233,17,1,0,0,0,234,
	251,3,14,7,0,235,236,5,38,0,0,236,237,5,41,0,0,237,238,5,41,0,0,238,239,
	5,3,0,0,239,240,3,14,7,0,240,241,5,39,0,0,241,242,3,18,9,0,242,251,1,0,
	0,0,243,244,5,1,0,0,244,245,5,41,0,0,245,246,5,3,0,0,246,247,3,14,7,0,247,
	248,5,39,0,0,248,249,3,18,9,0,249,251,1,0,0,0,250,234,1,0,0,0,250,235,1,
	0,0,0,250,243,1,0,0,0,251,19,1,0,0,0,29,23,32,40,43,50,54,65,70,75,89,94,
	101,105,114,119,137,153,157,159,174,178,180,183,216,220,222,225,227,250];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelParser.__ATN) {
			KestrelParser.__ATN = new ATNDeserializer().deserialize(KestrelParser._serializedATN);
		}

		return KestrelParser.__ATN;
	}


	static DecisionsToDFA = KestrelParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ProgramContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(KestrelParser.EOF, 0);
	}
	public declaration_list(): DeclarationContext[] {
		return this.getTypedRuleContexts(DeclarationContext) as DeclarationContext[];
	}
	public declaration(i: number): DeclarationContext {
		return this.getTypedRuleContext(DeclarationContext, i) as DeclarationContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_program;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterProgram) {
	 		listener.enterProgram(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitProgram) {
	 		listener.exitProgram(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitProgram) {
			return visitor.visitProgram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_declaration;
	}
	public copyFrom(ctx: DeclarationContext): void {
		super.copyFrom(ctx);
	}
}
export class TypeDeclarationContext extends DeclarationContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public typeVariants(): TypeVariantsContext {
		return this.getTypedRuleContext(TypeVariantsContext, 0) as TypeVariantsContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeDeclaration) {
	 		listener.enterTypeDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeDeclaration) {
	 		listener.exitTypeDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeDeclaration) {
			return visitor.visitTypeDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LetDeclarationContext extends DeclarationContext {
	public _typeHint!: PolyTypeContext;
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public polyType(): PolyTypeContext {
		return this.getTypedRuleContext(PolyTypeContext, 0) as PolyTypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterLetDeclaration) {
	 		listener.enterLetDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitLetDeclaration) {
	 		listener.exitLetDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitLetDeclaration) {
			return visitor.visitLetDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeVariantsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeConstructorDecl_list(): TypeConstructorDeclContext[] {
		return this.getTypedRuleContexts(TypeConstructorDeclContext) as TypeConstructorDeclContext[];
	}
	public typeConstructorDecl(i: number): TypeConstructorDeclContext {
		return this.getTypedRuleContext(TypeConstructorDeclContext, i) as TypeConstructorDeclContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeVariants;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeVariants) {
	 		listener.enterTypeVariants(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeVariants) {
	 		listener.exitTypeVariants(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeVariants) {
			return visitor.visitTypeVariants(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PolyTypeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_polyType;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPolyType) {
	 		listener.enterPolyType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPolyType) {
	 		listener.exitPolyType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPolyType) {
			return visitor.visitPolyType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_type;
	}
	public copyFrom(ctx: TypeContext): void {
		super.copyFrom(ctx);
	}
}
export class NamedTypeContext extends TypeContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterNamedType) {
	 		listener.enterNamedType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitNamedType) {
	 		listener.exitNamedType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitNamedType) {
			return visitor.visitNamedType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FnTypeContext extends TypeContext {
	public _ret!: TypeContext;
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
	public fnTypeParams(): FnTypeParamsContext {
		return this.getTypedRuleContext(FnTypeParamsContext, 0) as FnTypeParamsContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFnType) {
	 		listener.enterFnType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFnType) {
	 		listener.exitFnType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFnType) {
			return visitor.visitFnType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleTypeContext extends TypeContext {
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTupleType) {
	 		listener.enterTupleType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTupleType) {
	 		listener.exitTupleType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTupleType) {
			return visitor.visitTupleType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class GenericTypeContext extends TypeContext {
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterGenericType) {
	 		listener.enterGenericType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitGenericType) {
	 		listener.exitGenericType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitGenericType) {
			return visitor.visitGenericType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FnTypeParamsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_fnTypeParams;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFnTypeParams) {
	 		listener.enterFnTypeParams(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFnTypeParams) {
	 		listener.exitFnTypeParams(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFnTypeParams) {
			return visitor.visitFnTypeParams(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeConstructorDeclContext extends ParserRuleContext {
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeConstructorDecl;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeConstructorDecl) {
	 		listener.enterTypeConstructorDecl(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeConstructorDecl) {
	 		listener.exitTypeConstructorDecl(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeConstructorDecl) {
			return visitor.visitTypeConstructorDecl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_expr;
	}
	public copyFrom(ctx: ExprContext): void {
		super.copyFrom(ctx);
	}
}
export class ListLitContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterListLit) {
	 		listener.enterListLit(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitListLit) {
	 		listener.exitListLit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitListLit) {
			return visitor.visitListLit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParensContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterParens) {
	 		listener.enterParens(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitParens) {
	 		listener.exitParens(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitParens) {
			return visitor.visitParens(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public STRING(): TerminalNode {
		return this.getToken(KestrelParser.STRING, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterString) {
	 		listener.enterString(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitString) {
	 		listener.exitString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MulDivContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMulDiv) {
	 		listener.enterMulDiv(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMulDiv) {
	 		listener.exitMulDiv(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMulDiv) {
			return visitor.visitMulDiv(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AddSubContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterAddSub) {
	 		listener.enterAddSub(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitAddSub) {
	 		listener.exitAddSub(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitAddSub) {
			return visitor.visitAddSub(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FnContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.ID, i);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFn) {
	 		listener.enterFn(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFn) {
	 		listener.exitFn(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFn) {
			return visitor.visitFn(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PipeContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPipe) {
	 		listener.enterPipe(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPipe) {
	 		listener.exitPipe(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPipe) {
			return visitor.visitPipe(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FloatContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public FLOAT(): TerminalNode {
		return this.getToken(KestrelParser.FLOAT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFloat) {
	 		listener.enterFloat(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFloat) {
	 		listener.exitFloat(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFloat) {
			return visitor.visitFloat(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class EqContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterEq) {
	 		listener.enterEq(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitEq) {
	 		listener.exitEq(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitEq) {
			return visitor.visitEq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IntContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public INT(): TerminalNode {
		return this.getToken(KestrelParser.INT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterInt) {
	 		listener.enterInt(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitInt) {
	 		listener.exitInt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitInt) {
			return visitor.visitInt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CompContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterComp) {
	 		listener.enterComp(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitComp) {
	 		listener.exitComp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitComp) {
			return visitor.visitComp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CallContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterCall) {
	 		listener.enterCall(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCall) {
	 		listener.exitCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCall) {
			return visitor.visitCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTuple) {
	 		listener.enterTuple(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTuple) {
	 		listener.exitTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTuple) {
			return visitor.visitTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CharContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public CHAR(): TerminalNode {
		return this.getToken(KestrelParser.CHAR, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterChar) {
	 		listener.enterChar(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitChar) {
	 		listener.exitChar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitChar) {
			return visitor.visitChar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolNotContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolNot) {
	 		listener.enterBoolNot(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolNot) {
	 		listener.exitBoolNot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolNot) {
			return visitor.visitBoolNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterId) {
	 		listener.enterId(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitId) {
	 		listener.exitId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitId) {
			return visitor.visitId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockExprContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockExpr) {
	 		listener.enterBlockExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockExpr) {
	 		listener.exitBlockExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockExpr) {
			return visitor.visitBlockExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfContext extends ExprContext {
	public _condition!: ExprContext;
	public _then!: BlockContext;
	public _else_!: BlockContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public block_list(): BlockContext[] {
		return this.getTypedRuleContexts(BlockContext) as BlockContext[];
	}
	public block(i: number): BlockContext {
		return this.getTypedRuleContext(BlockContext, i) as BlockContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterIf) {
	 		listener.enterIf(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitIf) {
	 		listener.exitIf(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitIf) {
			return visitor.visitIf(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolOrContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolOr) {
	 		listener.enterBoolOr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolOr) {
	 		listener.exitBoolOr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolOr) {
			return visitor.visitBoolOr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolAndContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolAnd) {
	 		listener.enterBoolAnd(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolAnd) {
	 		listener.exitBoolAnd(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolAnd) {
			return visitor.visitBoolAnd(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConsContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterCons) {
	 		listener.enterCons(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCons) {
	 		listener.exitCons(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCons) {
			return visitor.visitCons(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_block;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlock) {
	 		listener.enterBlock(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlock) {
	 		listener.exitBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContentContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_blockContent;
	}
	public copyFrom(ctx: BlockContentContext): void {
		super.copyFrom(ctx);
	}
}
export class BlockContentLetExprContext extends BlockContentContext {
	public _binding!: Token;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentLetExpr) {
	 		listener.enterBlockContentLetExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentLetExpr) {
	 		listener.exitBlockContentLetExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentLetExpr) {
			return visitor.visitBlockContentLetExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockContentLetHashExprContext extends BlockContentContext {
	public _mapper!: Token;
	public _binding!: Token;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.ID, i);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentLetHashExpr) {
	 		listener.enterBlockContentLetHashExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentLetHashExpr) {
	 		listener.exitBlockContentLetHashExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentLetHashExpr) {
			return visitor.visitBlockContentLetHashExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockContentExprContext extends BlockContentContext {
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentExpr) {
	 		listener.enterBlockContentExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentExpr) {
	 		listener.exitBlockContentExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentExpr) {
			return visitor.visitBlockContentExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
