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
	public static readonly T__39 = 40;
	public static readonly T__40 = 41;
	public static readonly T__41 = 42;
	public static readonly T__42 = 43;
	public static readonly T__43 = 44;
	public static readonly LineComment = 45;
	public static readonly ID = 46;
	public static readonly TYPE_ID = 47;
	public static readonly INT = 48;
	public static readonly CHAR = 49;
	public static readonly STRING = 50;
	public static readonly FLOAT = 51;
	public static readonly NEWLINE = 52;
	public static readonly WS = 53;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_moduleNamespace = 0;
	public static readonly RULE_program = 1;
	public static readonly RULE_import_ = 2;
	public static readonly RULE_importExposing = 3;
	public static readonly RULE_declaration = 4;
	public static readonly RULE_exposingNested = 5;
	public static readonly RULE_pubExposing = 6;
	public static readonly RULE_paramsList = 7;
	public static readonly RULE_typeVariants = 8;
	public static readonly RULE_polyType = 9;
	public static readonly RULE_type = 10;
	public static readonly RULE_fnTypeParams = 11;
	public static readonly RULE_typeConstructorDecl = 12;
	public static readonly RULE_expr = 13;
	public static readonly RULE_block = 14;
	public static readonly RULE_blockContent = 15;
	public static readonly literalNames: (string | null)[] = [ null, "'/'", 
                                                            "'import'", 
                                                            "'.'", "'{'", 
                                                            "','", "'}'", 
                                                            "'pub'", "'let'", 
                                                            "':'", "'='", 
                                                            "'extern'", 
                                                            "'type'", "'('", 
                                                            "'..'", "')'", 
                                                            "'<'", "'>'", 
                                                            "'Fn'", "'->'", 
                                                            "'!'", "'*'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'+'", 
                                                            "'-'", "'+.'", 
                                                            "'-.'", "'++'", 
                                                            "'::'", "'=='", 
                                                            "'!='", "'<='", 
                                                            "'>='", "'||'", 
                                                            "'&&'", "'fn'", 
                                                            "'if'", "'else'", 
                                                            "'['", "']'", 
                                                            "'|>'", "'let#'", 
                                                            "';'" ];
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
                                                             null, null, 
                                                             null, null, 
                                                             null, "LineComment", 
                                                             "ID", "TYPE_ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"moduleNamespace", "program", "import_", "importExposing", "declaration", 
		"exposingNested", "pubExposing", "paramsList", "typeVariants", "polyType", 
		"type", "fnTypeParams", "typeConstructorDecl", "expr", "block", "blockContent",
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
	public moduleNamespace(): ModuleNamespaceContext {
		let localctx: ModuleNamespaceContext = new ModuleNamespaceContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, KestrelParser.RULE_moduleNamespace);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 32;
			this.match(KestrelParser.TYPE_ID);
			this.state = 37;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 33;
				this.match(KestrelParser.T__0);
				this.state = 34;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 39;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
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
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, KestrelParser.RULE_program);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 43;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 40;
				this.import_();
				}
				}
				this.state = 45;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 49;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 6528) !== 0)) {
				{
				{
				this.state = 46;
				this.declaration();
				}
				}
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 52;
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
	public import_(): Import_Context {
		let localctx: Import_Context = new Import_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 4, KestrelParser.RULE_import_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 54;
			this.match(KestrelParser.T__1);
			this.state = 55;
			this.moduleNamespace();
			this.state = 68;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 56;
				this.match(KestrelParser.T__2);
				this.state = 57;
				this.match(KestrelParser.T__3);
				this.state = 58;
				this.importExposing();
				this.state = 63;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 59;
					this.match(KestrelParser.T__4);
					this.state = 60;
					this.importExposing();
					}
					}
					this.state = 65;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 66;
				this.match(KestrelParser.T__5);
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
	public importExposing(): ImportExposingContext {
		let localctx: ImportExposingContext = new ImportExposingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, KestrelParser.RULE_importExposing);
		let _la: number;
		try {
			this.state = 75;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 46:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 70;
				(localctx as ValueExposingContext)._name = this.match(KestrelParser.ID);
				}
				break;
			case 47:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 71;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 73;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13) {
					{
					this.state = 72;
					this.exposingNested();
					}
				}

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
	public declaration(): DeclarationContext {
		let localctx: DeclarationContext = new DeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, KestrelParser.RULE_declaration);
		let _la: number;
		try {
			this.state = 118;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 78;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 77;
					(localctx as LetDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 80;
				this.match(KestrelParser.T__7);
				this.state = 81;
				this.match(KestrelParser.ID);
				this.state = 84;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===9) {
					{
					this.state = 82;
					this.match(KestrelParser.T__8);
					this.state = 83;
					(localctx as LetDeclarationContext)._typeHint = this.polyType();
					}
				}

				this.state = 86;
				this.match(KestrelParser.T__9);
				this.state = 87;
				this.expr(0);
				}
				break;
			case 2:
				localctx = new ExternLetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 88;
				this.match(KestrelParser.T__10);
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 89;
					(localctx as ExternLetDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 92;
				this.match(KestrelParser.T__7);
				this.state = 93;
				this.match(KestrelParser.ID);
				this.state = 94;
				this.match(KestrelParser.T__8);
				this.state = 95;
				(localctx as ExternLetDeclarationContext)._typeHint = this.polyType();
				}
				break;
			case 3:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 97;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 96;
					(localctx as TypeDeclarationContext)._pub = this.pubExposing();
					}
				}

				this.state = 99;
				this.match(KestrelParser.T__11);
				this.state = 100;
				(localctx as TypeDeclarationContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 102;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 101;
					this.paramsList();
					}
				}

				this.state = 104;
				this.match(KestrelParser.T__3);
				this.state = 106;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===47) {
					{
					this.state = 105;
					this.typeVariants();
					}
				}

				this.state = 108;
				this.match(KestrelParser.T__5);
				}
				break;
			case 4:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 109;
				this.match(KestrelParser.T__10);
				this.state = 111;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 110;
					(localctx as ExternTypeDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 113;
				this.match(KestrelParser.T__11);
				this.state = 114;
				(localctx as ExternTypeDeclarationContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 116;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 115;
					this.paramsList();
					}
				}

				}
				break;
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
	public exposingNested(): ExposingNestedContext {
		let localctx: ExposingNestedContext = new ExposingNestedContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, KestrelParser.RULE_exposingNested);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 120;
			this.match(KestrelParser.T__12);
			this.state = 121;
			this.match(KestrelParser.T__13);
			this.state = 122;
			this.match(KestrelParser.T__14);
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
	public pubExposing(): PubExposingContext {
		let localctx: PubExposingContext = new PubExposingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, KestrelParser.RULE_pubExposing);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 124;
			this.match(KestrelParser.T__6);
			this.state = 126;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===13) {
				{
				this.state = 125;
				this.exposingNested();
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
	public paramsList(): ParamsListContext {
		let localctx: ParamsListContext = new ParamsListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, KestrelParser.RULE_paramsList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 128;
			this.match(KestrelParser.T__15);
			this.state = 129;
			this.match(KestrelParser.ID);
			this.state = 134;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 130;
				this.match(KestrelParser.T__4);
				this.state = 131;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 136;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 137;
			this.match(KestrelParser.T__16);
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
		this.enterRule(localctx, 16, KestrelParser.RULE_typeVariants);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 139;
			this.typeConstructorDecl();
			this.state = 144;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 140;
					this.match(KestrelParser.T__4);
					this.state = 141;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 146;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			}
			this.state = 148;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 147;
				this.match(KestrelParser.T__4);
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
		this.enterRule(localctx, 18, KestrelParser.RULE_polyType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 150;
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
		this.enterRule(localctx, 20, KestrelParser.RULE_type);
		let _la: number;
		try {
			this.state = 188;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 47:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 152;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 164;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 153;
					this.match(KestrelParser.T__15);
					this.state = 154;
					this.type_();
					this.state = 159;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 155;
						this.match(KestrelParser.T__4);
						this.state = 156;
						this.type_();
						}
						}
						this.state = 161;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 162;
					this.match(KestrelParser.T__16);
					}
				}

				}
				break;
			case 18:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 166;
				this.match(KestrelParser.T__17);
				this.state = 167;
				this.match(KestrelParser.T__12);
				this.state = 169;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13 || _la===18 || _la===46 || _la===47) {
					{
					this.state = 168;
					this.fnTypeParams();
					}
				}

				this.state = 171;
				this.match(KestrelParser.T__14);
				this.state = 172;
				this.match(KestrelParser.T__18);
				this.state = 173;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 46:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 174;
				this.match(KestrelParser.ID);
				}
				break;
			case 13:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 175;
				this.match(KestrelParser.T__12);
				this.state = 176;
				this.type_();
				this.state = 177;
				this.match(KestrelParser.T__4);
				this.state = 178;
				this.type_();
				this.state = 183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 179;
					this.match(KestrelParser.T__4);
					this.state = 180;
					this.type_();
					}
					}
					this.state = 185;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 186;
				this.match(KestrelParser.T__14);
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
		this.enterRule(localctx, 22, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 190;
			this.type_();
			this.state = 195;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 191;
					this.match(KestrelParser.T__4);
					this.state = 192;
					this.type_();
					}
					}
				}
				this.state = 197;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			}
			this.state = 199;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 198;
				this.match(KestrelParser.T__4);
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
		this.enterRule(localctx, 24, KestrelParser.RULE_typeConstructorDecl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 201;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 213;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===13) {
				{
				this.state = 202;
				this.match(KestrelParser.T__12);
				this.state = 203;
				this.type_();
				this.state = 208;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 204;
					this.match(KestrelParser.T__4);
					this.state = 205;
					this.type_();
					}
					}
					this.state = 210;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 211;
				this.match(KestrelParser.T__14);
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
		let _startState: number = 26;
		this.enterRecursionRule(localctx, 26, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 282;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 216;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 217;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 218;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 219;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 223;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 29, this._ctx) ) {
				case 1:
					{
					this.state = 220;
					this.moduleNamespace();
					this.state = 221;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				{
				this.state = 225;
				(localctx as IdContext)._name = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===46 || _la===47)) {
				    (localctx as IdContext)._name = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 226;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__19);
				this.state = 227;
				this.expr(16);
				}
				break;
			case 7:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 228;
				this.match(KestrelParser.T__12);
				this.state = 229;
				this.expr(0);
				this.state = 230;
				this.match(KestrelParser.T__4);
				this.state = 231;
				this.expr(0);
				this.state = 236;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 232;
					this.match(KestrelParser.T__4);
					this.state = 233;
					this.expr(0);
					}
					}
					this.state = 238;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 239;
				this.match(KestrelParser.T__14);
				}
				break;
			case 8:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 241;
				this.match(KestrelParser.T__12);
				this.state = 242;
				this.expr(0);
				this.state = 243;
				this.match(KestrelParser.T__14);
				}
				break;
			case 9:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 245;
				this.block();
				}
				break;
			case 10:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 246;
				this.match(KestrelParser.T__36);
				this.state = 258;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===46) {
					{
					this.state = 247;
					this.match(KestrelParser.ID);
					this.state = 252;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 31, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 248;
							this.match(KestrelParser.T__4);
							this.state = 249;
							this.match(KestrelParser.ID);
							}
							}
						}
						this.state = 254;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 31, this._ctx);
					}
					this.state = 256;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 255;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 260;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 261;
				this.match(KestrelParser.T__37);
				this.state = 262;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 263;
				(localctx as IfContext)._then = this.block();
				this.state = 264;
				this.match(KestrelParser.T__38);
				this.state = 265;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 12:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 267;
				this.match(KestrelParser.T__39);
				this.state = 279;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1056784) !== 0) || ((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & 32267) !== 0)) {
					{
					this.state = 268;
					this.expr(0);
					this.state = 273;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 269;
							this.match(KestrelParser.T__4);
							this.state = 270;
							this.expr(0);
							}
							}
						}
						this.state = 275;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
					}
					this.state = 277;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 276;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 281;
				this.match(KestrelParser.T__40);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 326;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 324;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 284;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 285;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 31457282) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 286;
						this.expr(16);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 287;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 288;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1040187392) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 289;
						this.expr(15);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 290;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 291;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__29);
						this.state = 292;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 293;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 294;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===31 || _la===32)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 295;
						this.expr(13);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 296;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 297;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 16)) & ~0x1F) === 0 && ((1 << (_la - 16)) & 393219) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 298;
						this.expr(12);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 299;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 300;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__34);
						this.state = 301;
						this.expr(11);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 302;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 303;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__35);
						this.state = 304;
						this.expr(10);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 305;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 306;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__41);
						this.state = 307;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 308;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 309;
						this.match(KestrelParser.T__12);
						this.state = 321;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1056784) !== 0) || ((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & 32267) !== 0)) {
							{
							this.state = 310;
							this.expr(0);
							this.state = 315;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 311;
									this.match(KestrelParser.T__4);
									this.state = 312;
									this.expr(0);
									}
									}
								}
								this.state = 317;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
							}
							this.state = 319;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 318;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 323;
						this.match(KestrelParser.T__14);
						}
						break;
					}
					}
				}
				this.state = 328;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
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
		this.enterRule(localctx, 28, KestrelParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 329;
			this.match(KestrelParser.T__3);
			this.state = 330;
			this.blockContent();
			this.state = 331;
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
		this.enterRule(localctx, 30, KestrelParser.RULE_blockContent);
		try {
			this.state = 349;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 13:
			case 20:
			case 37:
			case 38:
			case 40:
			case 46:
			case 47:
			case 48:
			case 49:
			case 50:
			case 51:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 333;
				this.expr(0);
				}
				break;
			case 43:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 334;
				this.match(KestrelParser.T__42);
				this.state = 335;
				(localctx as BlockContentLetHashExprContext)._mapper = this.match(KestrelParser.ID);
				this.state = 336;
				(localctx as BlockContentLetHashExprContext)._binding = this.match(KestrelParser.ID);
				this.state = 337;
				this.match(KestrelParser.T__9);
				this.state = 338;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 339;
				this.match(KestrelParser.T__43);
				this.state = 340;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 8:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 342;
				this.match(KestrelParser.T__7);
				this.state = 343;
				(localctx as BlockContentLetExprContext)._binding = this.match(KestrelParser.ID);
				this.state = 344;
				this.match(KestrelParser.T__9);
				this.state = 345;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 346;
				this.match(KestrelParser.T__43);
				this.state = 347;
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
		case 13:
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

	public static readonly _serializedATN: number[] = [4,1,53,352,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,1,0,1,0,5,
	0,36,8,0,10,0,12,0,39,9,0,1,1,5,1,42,8,1,10,1,12,1,45,9,1,1,1,5,1,48,8,
	1,10,1,12,1,51,9,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,5,2,62,8,2,10,2,
	12,2,65,9,2,1,2,1,2,3,2,69,8,2,1,3,1,3,1,3,3,3,74,8,3,3,3,76,8,3,1,4,3,
	4,79,8,4,1,4,1,4,1,4,1,4,3,4,85,8,4,1,4,1,4,1,4,1,4,3,4,91,8,4,1,4,1,4,
	1,4,1,4,1,4,3,4,98,8,4,1,4,1,4,1,4,3,4,103,8,4,1,4,1,4,3,4,107,8,4,1,4,
	1,4,1,4,3,4,112,8,4,1,4,1,4,1,4,3,4,117,8,4,3,4,119,8,4,1,5,1,5,1,5,1,5,
	1,6,1,6,3,6,127,8,6,1,7,1,7,1,7,1,7,5,7,133,8,7,10,7,12,7,136,9,7,1,7,1,
	7,1,8,1,8,1,8,5,8,143,8,8,10,8,12,8,146,9,8,1,8,3,8,149,8,8,1,9,1,9,1,10,
	1,10,1,10,1,10,1,10,5,10,158,8,10,10,10,12,10,161,9,10,1,10,1,10,3,10,165,
	8,10,1,10,1,10,1,10,3,10,170,8,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,
	10,1,10,1,10,5,10,182,8,10,10,10,12,10,185,9,10,1,10,1,10,3,10,189,8,10,
	1,11,1,11,1,11,5,11,194,8,11,10,11,12,11,197,9,11,1,11,3,11,200,8,11,1,
	12,1,12,1,12,1,12,1,12,5,12,207,8,12,10,12,12,12,210,9,12,1,12,1,12,3,12,
	214,8,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,224,8,13,1,13,1,13,
	1,13,1,13,1,13,1,13,1,13,1,13,1,13,5,13,235,8,13,10,13,12,13,238,9,13,1,
	13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,5,13,251,8,13,10,13,
	12,13,254,9,13,1,13,3,13,257,8,13,3,13,259,8,13,1,13,1,13,1,13,1,13,1,13,
	1,13,1,13,1,13,1,13,1,13,1,13,5,13,272,8,13,10,13,12,13,275,9,13,1,13,3,
	13,278,8,13,3,13,280,8,13,1,13,3,13,283,8,13,1,13,1,13,1,13,1,13,1,13,1,
	13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,
	1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,5,13,314,8,13,10,13,12,13,
	317,9,13,1,13,3,13,320,8,13,3,13,322,8,13,1,13,5,13,325,8,13,10,13,12,13,
	328,9,13,1,14,1,14,1,14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,
	15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,3,15,350,8,15,1,15,0,1,26,16,0,2,
	4,6,8,10,12,14,16,18,20,22,24,26,28,30,0,5,1,0,46,47,2,0,1,1,21,24,1,0,
	25,29,1,0,31,32,2,0,16,17,33,34,401,0,32,1,0,0,0,2,43,1,0,0,0,4,54,1,0,
	0,0,6,75,1,0,0,0,8,118,1,0,0,0,10,120,1,0,0,0,12,124,1,0,0,0,14,128,1,0,
	0,0,16,139,1,0,0,0,18,150,1,0,0,0,20,188,1,0,0,0,22,190,1,0,0,0,24,201,
	1,0,0,0,26,282,1,0,0,0,28,329,1,0,0,0,30,349,1,0,0,0,32,37,5,47,0,0,33,
	34,5,1,0,0,34,36,5,47,0,0,35,33,1,0,0,0,36,39,1,0,0,0,37,35,1,0,0,0,37,
	38,1,0,0,0,38,1,1,0,0,0,39,37,1,0,0,0,40,42,3,4,2,0,41,40,1,0,0,0,42,45,
	1,0,0,0,43,41,1,0,0,0,43,44,1,0,0,0,44,49,1,0,0,0,45,43,1,0,0,0,46,48,3,
	8,4,0,47,46,1,0,0,0,48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,52,1,0,
	0,0,51,49,1,0,0,0,52,53,5,0,0,1,53,3,1,0,0,0,54,55,5,2,0,0,55,68,3,0,0,
	0,56,57,5,3,0,0,57,58,5,4,0,0,58,63,3,6,3,0,59,60,5,5,0,0,60,62,3,6,3,0,
	61,59,1,0,0,0,62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,64,66,1,0,0,0,65,
	63,1,0,0,0,66,67,5,6,0,0,67,69,1,0,0,0,68,56,1,0,0,0,68,69,1,0,0,0,69,5,
	1,0,0,0,70,76,5,46,0,0,71,73,5,47,0,0,72,74,3,10,5,0,73,72,1,0,0,0,73,74,
	1,0,0,0,74,76,1,0,0,0,75,70,1,0,0,0,75,71,1,0,0,0,76,7,1,0,0,0,77,79,5,
	7,0,0,78,77,1,0,0,0,78,79,1,0,0,0,79,80,1,0,0,0,80,81,5,8,0,0,81,84,5,46,
	0,0,82,83,5,9,0,0,83,85,3,18,9,0,84,82,1,0,0,0,84,85,1,0,0,0,85,86,1,0,
	0,0,86,87,5,10,0,0,87,119,3,26,13,0,88,90,5,11,0,0,89,91,5,7,0,0,90,89,
	1,0,0,0,90,91,1,0,0,0,91,92,1,0,0,0,92,93,5,8,0,0,93,94,5,46,0,0,94,95,
	5,9,0,0,95,119,3,18,9,0,96,98,3,12,6,0,97,96,1,0,0,0,97,98,1,0,0,0,98,99,
	1,0,0,0,99,100,5,12,0,0,100,102,5,47,0,0,101,103,3,14,7,0,102,101,1,0,0,
	0,102,103,1,0,0,0,103,104,1,0,0,0,104,106,5,4,0,0,105,107,3,16,8,0,106,
	105,1,0,0,0,106,107,1,0,0,0,107,108,1,0,0,0,108,119,5,6,0,0,109,111,5,11,
	0,0,110,112,5,7,0,0,111,110,1,0,0,0,111,112,1,0,0,0,112,113,1,0,0,0,113,
	114,5,12,0,0,114,116,5,47,0,0,115,117,3,14,7,0,116,115,1,0,0,0,116,117,
	1,0,0,0,117,119,1,0,0,0,118,78,1,0,0,0,118,88,1,0,0,0,118,97,1,0,0,0,118,
	109,1,0,0,0,119,9,1,0,0,0,120,121,5,13,0,0,121,122,5,14,0,0,122,123,5,15,
	0,0,123,11,1,0,0,0,124,126,5,7,0,0,125,127,3,10,5,0,126,125,1,0,0,0,126,
	127,1,0,0,0,127,13,1,0,0,0,128,129,5,16,0,0,129,134,5,46,0,0,130,131,5,
	5,0,0,131,133,5,46,0,0,132,130,1,0,0,0,133,136,1,0,0,0,134,132,1,0,0,0,
	134,135,1,0,0,0,135,137,1,0,0,0,136,134,1,0,0,0,137,138,5,17,0,0,138,15,
	1,0,0,0,139,144,3,24,12,0,140,141,5,5,0,0,141,143,3,24,12,0,142,140,1,0,
	0,0,143,146,1,0,0,0,144,142,1,0,0,0,144,145,1,0,0,0,145,148,1,0,0,0,146,
	144,1,0,0,0,147,149,5,5,0,0,148,147,1,0,0,0,148,149,1,0,0,0,149,17,1,0,
	0,0,150,151,3,20,10,0,151,19,1,0,0,0,152,164,5,47,0,0,153,154,5,16,0,0,
	154,159,3,20,10,0,155,156,5,5,0,0,156,158,3,20,10,0,157,155,1,0,0,0,158,
	161,1,0,0,0,159,157,1,0,0,0,159,160,1,0,0,0,160,162,1,0,0,0,161,159,1,0,
	0,0,162,163,5,17,0,0,163,165,1,0,0,0,164,153,1,0,0,0,164,165,1,0,0,0,165,
	189,1,0,0,0,166,167,5,18,0,0,167,169,5,13,0,0,168,170,3,22,11,0,169,168,
	1,0,0,0,169,170,1,0,0,0,170,171,1,0,0,0,171,172,5,15,0,0,172,173,5,19,0,
	0,173,189,3,20,10,0,174,189,5,46,0,0,175,176,5,13,0,0,176,177,3,20,10,0,
	177,178,5,5,0,0,178,183,3,20,10,0,179,180,5,5,0,0,180,182,3,20,10,0,181,
	179,1,0,0,0,182,185,1,0,0,0,183,181,1,0,0,0,183,184,1,0,0,0,184,186,1,0,
	0,0,185,183,1,0,0,0,186,187,5,15,0,0,187,189,1,0,0,0,188,152,1,0,0,0,188,
	166,1,0,0,0,188,174,1,0,0,0,188,175,1,0,0,0,189,21,1,0,0,0,190,195,3,20,
	10,0,191,192,5,5,0,0,192,194,3,20,10,0,193,191,1,0,0,0,194,197,1,0,0,0,
	195,193,1,0,0,0,195,196,1,0,0,0,196,199,1,0,0,0,197,195,1,0,0,0,198,200,
	5,5,0,0,199,198,1,0,0,0,199,200,1,0,0,0,200,23,1,0,0,0,201,213,5,47,0,0,
	202,203,5,13,0,0,203,208,3,20,10,0,204,205,5,5,0,0,205,207,3,20,10,0,206,
	204,1,0,0,0,207,210,1,0,0,0,208,206,1,0,0,0,208,209,1,0,0,0,209,211,1,0,
	0,0,210,208,1,0,0,0,211,212,5,15,0,0,212,214,1,0,0,0,213,202,1,0,0,0,213,
	214,1,0,0,0,214,25,1,0,0,0,215,216,6,13,-1,0,216,283,5,48,0,0,217,283,5,
	51,0,0,218,283,5,49,0,0,219,283,5,50,0,0,220,221,3,0,0,0,221,222,5,3,0,
	0,222,224,1,0,0,0,223,220,1,0,0,0,223,224,1,0,0,0,224,225,1,0,0,0,225,283,
	7,0,0,0,226,227,5,20,0,0,227,283,3,26,13,16,228,229,5,13,0,0,229,230,3,
	26,13,0,230,231,5,5,0,0,231,236,3,26,13,0,232,233,5,5,0,0,233,235,3,26,
	13,0,234,232,1,0,0,0,235,238,1,0,0,0,236,234,1,0,0,0,236,237,1,0,0,0,237,
	239,1,0,0,0,238,236,1,0,0,0,239,240,5,15,0,0,240,283,1,0,0,0,241,242,5,
	13,0,0,242,243,3,26,13,0,243,244,5,15,0,0,244,283,1,0,0,0,245,283,3,28,
	14,0,246,258,5,37,0,0,247,252,5,46,0,0,248,249,5,5,0,0,249,251,5,46,0,0,
	250,248,1,0,0,0,251,254,1,0,0,0,252,250,1,0,0,0,252,253,1,0,0,0,253,256,
	1,0,0,0,254,252,1,0,0,0,255,257,5,5,0,0,256,255,1,0,0,0,256,257,1,0,0,0,
	257,259,1,0,0,0,258,247,1,0,0,0,258,259,1,0,0,0,259,260,1,0,0,0,260,283,
	3,28,14,0,261,262,5,38,0,0,262,263,3,26,13,0,263,264,3,28,14,0,264,265,
	5,39,0,0,265,266,3,28,14,0,266,283,1,0,0,0,267,279,5,40,0,0,268,273,3,26,
	13,0,269,270,5,5,0,0,270,272,3,26,13,0,271,269,1,0,0,0,272,275,1,0,0,0,
	273,271,1,0,0,0,273,274,1,0,0,0,274,277,1,0,0,0,275,273,1,0,0,0,276,278,
	5,5,0,0,277,276,1,0,0,0,277,278,1,0,0,0,278,280,1,0,0,0,279,268,1,0,0,0,
	279,280,1,0,0,0,280,281,1,0,0,0,281,283,5,41,0,0,282,215,1,0,0,0,282,217,
	1,0,0,0,282,218,1,0,0,0,282,219,1,0,0,0,282,223,1,0,0,0,282,226,1,0,0,0,
	282,228,1,0,0,0,282,241,1,0,0,0,282,245,1,0,0,0,282,246,1,0,0,0,282,261,
	1,0,0,0,282,267,1,0,0,0,283,326,1,0,0,0,284,285,10,15,0,0,285,286,7,1,0,
	0,286,325,3,26,13,16,287,288,10,14,0,0,288,289,7,2,0,0,289,325,3,26,13,
	15,290,291,10,13,0,0,291,292,5,30,0,0,292,325,3,26,13,13,293,294,10,12,
	0,0,294,295,7,3,0,0,295,325,3,26,13,13,296,297,10,11,0,0,297,298,7,4,0,
	0,298,325,3,26,13,12,299,300,10,10,0,0,300,301,5,35,0,0,301,325,3,26,13,
	11,302,303,10,9,0,0,303,304,5,36,0,0,304,325,3,26,13,10,305,306,10,1,0,
	0,306,307,5,42,0,0,307,325,3,26,13,2,308,309,10,6,0,0,309,321,5,13,0,0,
	310,315,3,26,13,0,311,312,5,5,0,0,312,314,3,26,13,0,313,311,1,0,0,0,314,
	317,1,0,0,0,315,313,1,0,0,0,315,316,1,0,0,0,316,319,1,0,0,0,317,315,1,0,
	0,0,318,320,5,5,0,0,319,318,1,0,0,0,319,320,1,0,0,0,320,322,1,0,0,0,321,
	310,1,0,0,0,321,322,1,0,0,0,322,323,1,0,0,0,323,325,5,15,0,0,324,284,1,
	0,0,0,324,287,1,0,0,0,324,290,1,0,0,0,324,293,1,0,0,0,324,296,1,0,0,0,324,
	299,1,0,0,0,324,302,1,0,0,0,324,305,1,0,0,0,324,308,1,0,0,0,325,328,1,0,
	0,0,326,324,1,0,0,0,326,327,1,0,0,0,327,27,1,0,0,0,328,326,1,0,0,0,329,
	330,5,4,0,0,330,331,3,30,15,0,331,332,5,6,0,0,332,29,1,0,0,0,333,350,3,
	26,13,0,334,335,5,43,0,0,335,336,5,46,0,0,336,337,5,46,0,0,337,338,5,10,
	0,0,338,339,3,26,13,0,339,340,5,44,0,0,340,341,3,30,15,0,341,350,1,0,0,
	0,342,343,5,8,0,0,343,344,5,46,0,0,344,345,5,10,0,0,345,346,3,26,13,0,346,
	347,5,44,0,0,347,348,3,30,15,0,348,350,1,0,0,0,349,333,1,0,0,0,349,334,
	1,0,0,0,349,342,1,0,0,0,350,31,1,0,0,0,44,37,43,49,63,68,73,75,78,84,90,
	97,102,106,111,116,118,126,134,144,148,159,164,169,183,188,195,199,208,
	213,223,236,252,256,258,273,277,279,282,315,319,321,324,326,349];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelParser.__ATN) {
			KestrelParser.__ATN = new ATNDeserializer().deserialize(KestrelParser._serializedATN);
		}

		return KestrelParser.__ATN;
	}


	static DecisionsToDFA = KestrelParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ModuleNamespaceContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.TYPE_ID);
	}
	public TYPE_ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_moduleNamespace;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterModuleNamespace) {
	 		listener.enterModuleNamespace(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitModuleNamespace) {
	 		listener.exitModuleNamespace(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitModuleNamespace) {
			return visitor.visitModuleNamespace(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProgramContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(KestrelParser.EOF, 0);
	}
	public import__list(): Import_Context[] {
		return this.getTypedRuleContexts(Import_Context) as Import_Context[];
	}
	public import_(i: number): Import_Context {
		return this.getTypedRuleContext(Import_Context, i) as Import_Context;
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


export class Import_Context extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public importExposing_list(): ImportExposingContext[] {
		return this.getTypedRuleContexts(ImportExposingContext) as ImportExposingContext[];
	}
	public importExposing(i: number): ImportExposingContext {
		return this.getTypedRuleContext(ImportExposingContext, i) as ImportExposingContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_import_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterImport_) {
	 		listener.enterImport_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitImport_) {
	 		listener.exitImport_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitImport_) {
			return visitor.visitImport_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ImportExposingContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_importExposing;
	}
	public copyFrom(ctx: ImportExposingContext): void {
		super.copyFrom(ctx);
	}
}
export class ValueExposingContext extends ImportExposingContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: ImportExposingContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterValueExposing) {
	 		listener.enterValueExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitValueExposing) {
	 		listener.exitValueExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitValueExposing) {
			return visitor.visitValueExposing(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeExposingContext extends ImportExposingContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: ImportExposingContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public exposingNested(): ExposingNestedContext {
		return this.getTypedRuleContext(ExposingNestedContext, 0) as ExposingNestedContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeExposing) {
	 		listener.enterTypeExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeExposing) {
	 		listener.exitTypeExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeExposing) {
			return visitor.visitTypeExposing(this);
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
export class ExternLetDeclarationContext extends DeclarationContext {
	public _pub!: Token;
	public _typeHint!: PolyTypeContext;
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public polyType(): PolyTypeContext {
		return this.getTypedRuleContext(PolyTypeContext, 0) as PolyTypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternLetDeclaration) {
	 		listener.enterExternLetDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternLetDeclaration) {
	 		listener.exitExternLetDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternLetDeclaration) {
			return visitor.visitExternLetDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExternTypeDeclarationContext extends DeclarationContext {
	public _pub!: Token;
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public paramsList(): ParamsListContext {
		return this.getTypedRuleContext(ParamsListContext, 0) as ParamsListContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternTypeDeclaration) {
	 		listener.enterExternTypeDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternTypeDeclaration) {
	 		listener.exitExternTypeDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternTypeDeclaration) {
			return visitor.visitExternTypeDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeDeclarationContext extends DeclarationContext {
	public _pub!: PubExposingContext;
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public paramsList(): ParamsListContext {
		return this.getTypedRuleContext(ParamsListContext, 0) as ParamsListContext;
	}
	public typeVariants(): TypeVariantsContext {
		return this.getTypedRuleContext(TypeVariantsContext, 0) as TypeVariantsContext;
	}
	public pubExposing(): PubExposingContext {
		return this.getTypedRuleContext(PubExposingContext, 0) as PubExposingContext;
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
	public _pub!: Token;
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


export class ExposingNestedContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_exposingNested;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExposingNested) {
	 		listener.enterExposingNested(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExposingNested) {
	 		listener.exitExposingNested(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExposingNested) {
			return visitor.visitExposingNested(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PubExposingContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public exposingNested(): ExposingNestedContext {
		return this.getTypedRuleContext(ExposingNestedContext, 0) as ExposingNestedContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_pubExposing;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPubExposing) {
	 		listener.enterPubExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPubExposing) {
	 		listener.exitPubExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPubExposing) {
			return visitor.visitPubExposing(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamsListContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.ID, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_paramsList;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterParamsList) {
	 		listener.enterParamsList(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitParamsList) {
	 		listener.exitParamsList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitParamsList) {
			return visitor.visitParamsList(this);
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
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
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
