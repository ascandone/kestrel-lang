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
	public static readonly T__44 = 45;
	public static readonly T__45 = 46;
	public static readonly LineComment = 47;
	public static readonly ID = 48;
	public static readonly TYPE_ID = 49;
	public static readonly INT = 50;
	public static readonly CHAR = 51;
	public static readonly STRING = 52;
	public static readonly FLOAT = 53;
	public static readonly NEWLINE = 54;
	public static readonly WS = 55;
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
	public static readonly RULE_qualifiedId = 13;
	public static readonly RULE_expr = 14;
	public static readonly RULE_matchClause = 15;
	public static readonly RULE_block = 16;
	public static readonly RULE_blockContent = 17;
	public static readonly RULE_matchPattern = 18;
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
                                                            "'match'", "'['", 
                                                            "']'", "'|>'", 
                                                            "'=>'", "'let#'", 
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
		"type", "fnTypeParams", "typeConstructorDecl", "qualifiedId", "expr", 
		"matchClause", "block", "blockContent", "matchPattern",
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
			this.state = 38;
			this.match(KestrelParser.TYPE_ID);
			this.state = 43;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 39;
				this.match(KestrelParser.T__0);
				this.state = 40;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 45;
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
			this.state = 49;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 46;
				this.import_();
				}
				}
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 55;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 6528) !== 0)) {
				{
				{
				this.state = 52;
				this.declaration();
				}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 58;
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
			this.state = 60;
			this.match(KestrelParser.T__1);
			this.state = 61;
			this.moduleNamespace();
			this.state = 74;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 62;
				this.match(KestrelParser.T__2);
				this.state = 63;
				this.match(KestrelParser.T__3);
				this.state = 64;
				this.importExposing();
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 65;
					this.match(KestrelParser.T__4);
					this.state = 66;
					this.importExposing();
					}
					}
					this.state = 71;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 72;
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
			this.state = 81;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 48:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 76;
				(localctx as ValueExposingContext)._name = this.match(KestrelParser.ID);
				}
				break;
			case 49:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 77;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 79;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13) {
					{
					this.state = 78;
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
			this.state = 124;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 84;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 83;
					(localctx as LetDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 86;
				this.match(KestrelParser.T__7);
				this.state = 87;
				this.match(KestrelParser.ID);
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===9) {
					{
					this.state = 88;
					this.match(KestrelParser.T__8);
					this.state = 89;
					(localctx as LetDeclarationContext)._typeHint = this.polyType();
					}
				}

				this.state = 92;
				this.match(KestrelParser.T__9);
				this.state = 93;
				this.expr(0);
				}
				break;
			case 2:
				localctx = new ExternLetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 94;
				this.match(KestrelParser.T__10);
				this.state = 96;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 95;
					(localctx as ExternLetDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 98;
				this.match(KestrelParser.T__7);
				this.state = 99;
				this.match(KestrelParser.ID);
				this.state = 100;
				this.match(KestrelParser.T__8);
				this.state = 101;
				(localctx as ExternLetDeclarationContext)._typeHint = this.polyType();
				}
				break;
			case 3:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 103;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 102;
					(localctx as TypeDeclarationContext)._pub = this.pubExposing();
					}
				}

				this.state = 105;
				this.match(KestrelParser.T__11);
				this.state = 106;
				(localctx as TypeDeclarationContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 108;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 107;
					this.paramsList();
					}
				}

				this.state = 110;
				this.match(KestrelParser.T__3);
				this.state = 112;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===49) {
					{
					this.state = 111;
					this.typeVariants();
					}
				}

				this.state = 114;
				this.match(KestrelParser.T__5);
				}
				break;
			case 4:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 115;
				this.match(KestrelParser.T__10);
				this.state = 117;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===7) {
					{
					this.state = 116;
					(localctx as ExternTypeDeclarationContext)._pub = this.match(KestrelParser.T__6);
					}
				}

				this.state = 119;
				this.match(KestrelParser.T__11);
				this.state = 120;
				(localctx as ExternTypeDeclarationContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 122;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 121;
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
			this.state = 126;
			this.match(KestrelParser.T__12);
			this.state = 127;
			this.match(KestrelParser.T__13);
			this.state = 128;
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
			this.state = 130;
			this.match(KestrelParser.T__6);
			this.state = 132;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===13) {
				{
				this.state = 131;
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
			this.state = 134;
			this.match(KestrelParser.T__15);
			this.state = 135;
			this.match(KestrelParser.ID);
			this.state = 140;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 136;
				this.match(KestrelParser.T__4);
				this.state = 137;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 142;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 143;
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
			this.state = 145;
			this.typeConstructorDecl();
			this.state = 150;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 146;
					this.match(KestrelParser.T__4);
					this.state = 147;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 152;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			}
			this.state = 154;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 153;
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
			this.state = 156;
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
			this.state = 199;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 49:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 161;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 20, this._ctx) ) {
				case 1:
					{
					this.state = 158;
					this.moduleNamespace();
					this.state = 159;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 163;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 175;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 164;
					this.match(KestrelParser.T__15);
					this.state = 165;
					this.type_();
					this.state = 170;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 166;
						this.match(KestrelParser.T__4);
						this.state = 167;
						this.type_();
						}
						}
						this.state = 172;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 173;
					this.match(KestrelParser.T__16);
					}
				}

				}
				break;
			case 18:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 177;
				this.match(KestrelParser.T__17);
				this.state = 178;
				this.match(KestrelParser.T__12);
				this.state = 180;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13 || _la===18 || _la===48 || _la===49) {
					{
					this.state = 179;
					this.fnTypeParams();
					}
				}

				this.state = 182;
				this.match(KestrelParser.T__14);
				this.state = 183;
				this.match(KestrelParser.T__18);
				this.state = 184;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 48:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 185;
				this.match(KestrelParser.ID);
				}
				break;
			case 13:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 186;
				this.match(KestrelParser.T__12);
				this.state = 187;
				this.type_();
				this.state = 188;
				this.match(KestrelParser.T__4);
				this.state = 189;
				this.type_();
				this.state = 194;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 190;
					this.match(KestrelParser.T__4);
					this.state = 191;
					this.type_();
					}
					}
					this.state = 196;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 197;
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
			this.state = 201;
			this.type_();
			this.state = 206;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 26, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 202;
					this.match(KestrelParser.T__4);
					this.state = 203;
					this.type_();
					}
					}
				}
				this.state = 208;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 26, this._ctx);
			}
			this.state = 210;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 209;
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
			this.state = 212;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 224;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===13) {
				{
				this.state = 213;
				this.match(KestrelParser.T__12);
				this.state = 214;
				this.type_();
				this.state = 219;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 215;
					this.match(KestrelParser.T__4);
					this.state = 216;
					this.type_();
					}
					}
					this.state = 221;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 222;
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
	// @RuleVersion(0)
	public qualifiedId(): QualifiedIdContext {
		let localctx: QualifiedIdContext = new QualifiedIdContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, KestrelParser.RULE_qualifiedId);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 229;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				{
				this.state = 226;
				this.moduleNamespace();
				this.state = 227;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 231;
			localctx._name = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===48 || _la===49)) {
			    localctx._name = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
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
		let _startState: number = 28;
		this.enterRecursionRule(localctx, 28, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 313;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 234;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 235;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 236;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 237;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 238;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 239;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__19);
				this.state = 240;
				this.expr(17);
				}
				break;
			case 7:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 241;
				this.match(KestrelParser.T__12);
				this.state = 242;
				this.expr(0);
				this.state = 243;
				this.match(KestrelParser.T__4);
				this.state = 244;
				this.expr(0);
				this.state = 249;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 245;
					this.match(KestrelParser.T__4);
					this.state = 246;
					this.expr(0);
					}
					}
					this.state = 251;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 252;
				this.match(KestrelParser.T__14);
				}
				break;
			case 8:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 254;
				this.match(KestrelParser.T__12);
				this.state = 255;
				this.expr(0);
				this.state = 256;
				this.match(KestrelParser.T__14);
				}
				break;
			case 9:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 258;
				this.block();
				}
				break;
			case 10:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 259;
				this.match(KestrelParser.T__36);
				this.state = 271;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13 || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 63) !== 0)) {
					{
					this.state = 260;
					this.matchPattern(0);
					this.state = 265;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 32, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 261;
							this.match(KestrelParser.T__4);
							this.state = 262;
							this.matchPattern(0);
							}
							}
						}
						this.state = 267;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 32, this._ctx);
					}
					this.state = 269;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 268;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 273;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 274;
				this.match(KestrelParser.T__37);
				this.state = 275;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 276;
				(localctx as IfContext)._then = this.block();
				this.state = 277;
				this.match(KestrelParser.T__38);
				this.state = 278;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 12:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 280;
				this.match(KestrelParser.T__39);
				this.state = 281;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 282;
				this.match(KestrelParser.T__3);
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13 || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 63) !== 0)) {
					{
					this.state = 283;
					this.matchClause();
					this.state = 288;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 35, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 284;
							this.match(KestrelParser.T__4);
							this.state = 285;
							this.matchClause();
							}
							}
						}
						this.state = 290;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 35, this._ctx);
					}
					}
				}

				this.state = 294;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===5) {
					{
					this.state = 293;
					this.match(KestrelParser.T__4);
					}
				}

				this.state = 296;
				this.match(KestrelParser.T__5);
				}
				break;
			case 13:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 298;
				this.match(KestrelParser.T__40);
				this.state = 310;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1056784) !== 0) || ((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & 129051) !== 0)) {
					{
					this.state = 299;
					this.expr(0);
					this.state = 304;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 300;
							this.match(KestrelParser.T__4);
							this.state = 301;
							this.expr(0);
							}
							}
						}
						this.state = 306;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
					}
					this.state = 308;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 307;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 312;
				this.match(KestrelParser.T__41);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 357;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 355;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 45, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 315;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 316;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 31457282) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 317;
						this.expr(17);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 318;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 319;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1040187392) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 320;
						this.expr(16);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 321;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 322;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__29);
						this.state = 323;
						this.expr(14);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 324;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 325;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===31 || _la===32)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 326;
						this.expr(14);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 327;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 328;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 16)) & ~0x1F) === 0 && ((1 << (_la - 16)) & 393219) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 329;
						this.expr(13);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 330;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 331;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__34);
						this.state = 332;
						this.expr(12);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 333;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 334;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__35);
						this.state = 335;
						this.expr(11);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 336;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 337;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__42);
						this.state = 338;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 339;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 340;
						this.match(KestrelParser.T__12);
						this.state = 352;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1056784) !== 0) || ((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & 129051) !== 0)) {
							{
							this.state = 341;
							this.expr(0);
							this.state = 346;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 342;
									this.match(KestrelParser.T__4);
									this.state = 343;
									this.expr(0);
									}
									}
								}
								this.state = 348;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
							}
							this.state = 350;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 349;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 354;
						this.match(KestrelParser.T__14);
						}
						break;
					}
					}
				}
				this.state = 359;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
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
	public matchClause(): MatchClauseContext {
		let localctx: MatchClauseContext = new MatchClauseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, KestrelParser.RULE_matchClause);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 360;
			this.matchPattern(0);
			this.state = 361;
			this.match(KestrelParser.T__43);
			this.state = 362;
			this.expr(0);
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
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, KestrelParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 364;
			this.match(KestrelParser.T__3);
			this.state = 365;
			this.blockContent();
			this.state = 366;
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
		this.enterRule(localctx, 34, KestrelParser.RULE_blockContent);
		try {
			this.state = 384;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 13:
			case 20:
			case 37:
			case 38:
			case 40:
			case 41:
			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 368;
				this.expr(0);
				}
				break;
			case 45:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 369;
				this.match(KestrelParser.T__44);
				this.state = 370;
				(localctx as BlockContentLetHashExprContext)._mapper = this.qualifiedId();
				this.state = 371;
				(localctx as BlockContentLetHashExprContext)._pattern = this.matchPattern(0);
				this.state = 372;
				this.match(KestrelParser.T__9);
				this.state = 373;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 374;
				this.match(KestrelParser.T__45);
				this.state = 375;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 8:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 377;
				this.match(KestrelParser.T__7);
				this.state = 378;
				(localctx as BlockContentLetExprContext)._pattern = this.matchPattern(0);
				this.state = 379;
				this.match(KestrelParser.T__9);
				this.state = 380;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 381;
				this.match(KestrelParser.T__45);
				this.state = 382;
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

	public matchPattern(): MatchPatternContext;
	public matchPattern(_p: number): MatchPatternContext;
	// @RuleVersion(0)
	public matchPattern(_p?: number): MatchPatternContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: MatchPatternContext = new MatchPatternContext(this, this._ctx, _parentState);
		let _prevctx: MatchPatternContext = localctx;
		let _startState: number = 36;
		this.enterRecursionRule(localctx, 36, KestrelParser.RULE_matchPattern, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 424;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 48:
				{
				localctx = new MatchIdentContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 387;
				this.match(KestrelParser.ID);
				}
				break;
			case 49:
				{
				localctx = new ConstructorContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 391;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 48, this._ctx) ) {
				case 1:
					{
					this.state = 388;
					this.moduleNamespace();
					this.state = 389;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 393;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 405;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 50, this._ctx) ) {
				case 1:
					{
					this.state = 394;
					this.match(KestrelParser.T__12);
					this.state = 395;
					this.matchPattern(0);
					this.state = 400;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 396;
						this.match(KestrelParser.T__4);
						this.state = 397;
						this.matchPattern(0);
						}
						}
						this.state = 402;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 403;
					this.match(KestrelParser.T__14);
					}
					break;
				}
				}
				break;
			case 50:
				{
				localctx = new IntPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 407;
				this.match(KestrelParser.INT);
				}
				break;
			case 53:
				{
				localctx = new FloatPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 408;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 51:
				{
				localctx = new CharPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 409;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 52:
				{
				localctx = new StringPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 410;
				this.match(KestrelParser.STRING);
				}
				break;
			case 13:
				{
				localctx = new TuplePatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 411;
				this.match(KestrelParser.T__12);
				this.state = 412;
				this.matchPattern(0);
				this.state = 413;
				this.match(KestrelParser.T__4);
				this.state = 414;
				this.matchPattern(0);
				this.state = 419;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 415;
					this.match(KestrelParser.T__4);
					this.state = 416;
					this.matchPattern(0);
					}
					}
					this.state = 421;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 422;
				this.match(KestrelParser.T__14);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 431;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 53, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new ConsPatternContext(this, new MatchPatternContext(this, _parentctx, _parentState));
					this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_matchPattern);
					this.state = 426;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 427;
					this.match(KestrelParser.T__29);
					this.state = 428;
					this.matchPattern(2);
					}
					}
				}
				this.state = 433;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 53, this._ctx);
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

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 14:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		case 18:
			return this.matchPattern_sempred(localctx as MatchPatternContext, predIndex);
		}
		return true;
	}
	private expr_sempred(localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 16);
		case 1:
			return this.precpred(this._ctx, 15);
		case 2:
			return this.precpred(this._ctx, 14);
		case 3:
			return this.precpred(this._ctx, 13);
		case 4:
			return this.precpred(this._ctx, 12);
		case 5:
			return this.precpred(this._ctx, 11);
		case 6:
			return this.precpred(this._ctx, 10);
		case 7:
			return this.precpred(this._ctx, 1);
		case 8:
			return this.precpred(this._ctx, 7);
		}
		return true;
	}
	private matchPattern_sempred(localctx: MatchPatternContext, predIndex: number): boolean {
		switch (predIndex) {
		case 9:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,55,435,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,1,0,1,0,1,0,5,0,42,8,0,10,0,12,0,45,9,0,1,1,5,1,48,8,1,10,
	1,12,1,51,9,1,1,1,5,1,54,8,1,10,1,12,1,57,9,1,1,1,1,1,1,2,1,2,1,2,1,2,1,
	2,1,2,1,2,5,2,68,8,2,10,2,12,2,71,9,2,1,2,1,2,3,2,75,8,2,1,3,1,3,1,3,3,
	3,80,8,3,3,3,82,8,3,1,4,3,4,85,8,4,1,4,1,4,1,4,1,4,3,4,91,8,4,1,4,1,4,1,
	4,1,4,3,4,97,8,4,1,4,1,4,1,4,1,4,1,4,3,4,104,8,4,1,4,1,4,1,4,3,4,109,8,
	4,1,4,1,4,3,4,113,8,4,1,4,1,4,1,4,3,4,118,8,4,1,4,1,4,1,4,3,4,123,8,4,3,
	4,125,8,4,1,5,1,5,1,5,1,5,1,6,1,6,3,6,133,8,6,1,7,1,7,1,7,1,7,5,7,139,8,
	7,10,7,12,7,142,9,7,1,7,1,7,1,8,1,8,1,8,5,8,149,8,8,10,8,12,8,152,9,8,1,
	8,3,8,155,8,8,1,9,1,9,1,10,1,10,1,10,3,10,162,8,10,1,10,1,10,1,10,1,10,
	1,10,5,10,169,8,10,10,10,12,10,172,9,10,1,10,1,10,3,10,176,8,10,1,10,1,
	10,1,10,3,10,181,8,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,
	5,10,193,8,10,10,10,12,10,196,9,10,1,10,1,10,3,10,200,8,10,1,11,1,11,1,
	11,5,11,205,8,11,10,11,12,11,208,9,11,1,11,3,11,211,8,11,1,12,1,12,1,12,
	1,12,1,12,5,12,218,8,12,10,12,12,12,221,9,12,1,12,1,12,3,12,225,8,12,1,
	13,1,13,1,13,3,13,230,8,13,1,13,1,13,1,14,1,14,1,14,1,14,1,14,1,14,1,14,
	1,14,1,14,1,14,1,14,1,14,1,14,1,14,5,14,248,8,14,10,14,12,14,251,9,14,1,
	14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,5,14,264,8,14,10,14,
	12,14,267,9,14,1,14,3,14,270,8,14,3,14,272,8,14,1,14,1,14,1,14,1,14,1,14,
	1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,5,14,287,8,14,10,14,12,14,290,9,
	14,3,14,292,8,14,1,14,3,14,295,8,14,1,14,1,14,1,14,1,14,1,14,1,14,5,14,
	303,8,14,10,14,12,14,306,9,14,1,14,3,14,309,8,14,3,14,311,8,14,1,14,3,14,
	314,8,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,
	14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,
	1,14,1,14,5,14,345,8,14,10,14,12,14,348,9,14,1,14,3,14,351,8,14,3,14,353,
	8,14,1,14,5,14,356,8,14,10,14,12,14,359,9,14,1,15,1,15,1,15,1,15,1,16,1,
	16,1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,
	1,17,1,17,1,17,1,17,3,17,385,8,17,1,18,1,18,1,18,1,18,1,18,3,18,392,8,18,
	1,18,1,18,1,18,1,18,1,18,5,18,399,8,18,10,18,12,18,402,9,18,1,18,1,18,3,
	18,406,8,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,5,18,418,
	8,18,10,18,12,18,421,9,18,1,18,1,18,3,18,425,8,18,1,18,1,18,1,18,5,18,430,
	8,18,10,18,12,18,433,9,18,1,18,0,2,28,36,19,0,2,4,6,8,10,12,14,16,18,20,
	22,24,26,28,30,32,34,36,0,5,1,0,48,49,2,0,1,1,21,24,1,0,25,29,1,0,31,32,
	2,0,16,17,33,34,497,0,38,1,0,0,0,2,49,1,0,0,0,4,60,1,0,0,0,6,81,1,0,0,0,
	8,124,1,0,0,0,10,126,1,0,0,0,12,130,1,0,0,0,14,134,1,0,0,0,16,145,1,0,0,
	0,18,156,1,0,0,0,20,199,1,0,0,0,22,201,1,0,0,0,24,212,1,0,0,0,26,229,1,
	0,0,0,28,313,1,0,0,0,30,360,1,0,0,0,32,364,1,0,0,0,34,384,1,0,0,0,36,424,
	1,0,0,0,38,43,5,49,0,0,39,40,5,1,0,0,40,42,5,49,0,0,41,39,1,0,0,0,42,45,
	1,0,0,0,43,41,1,0,0,0,43,44,1,0,0,0,44,1,1,0,0,0,45,43,1,0,0,0,46,48,3,
	4,2,0,47,46,1,0,0,0,48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,55,1,0,
	0,0,51,49,1,0,0,0,52,54,3,8,4,0,53,52,1,0,0,0,54,57,1,0,0,0,55,53,1,0,0,
	0,55,56,1,0,0,0,56,58,1,0,0,0,57,55,1,0,0,0,58,59,5,0,0,1,59,3,1,0,0,0,
	60,61,5,2,0,0,61,74,3,0,0,0,62,63,5,3,0,0,63,64,5,4,0,0,64,69,3,6,3,0,65,
	66,5,5,0,0,66,68,3,6,3,0,67,65,1,0,0,0,68,71,1,0,0,0,69,67,1,0,0,0,69,70,
	1,0,0,0,70,72,1,0,0,0,71,69,1,0,0,0,72,73,5,6,0,0,73,75,1,0,0,0,74,62,1,
	0,0,0,74,75,1,0,0,0,75,5,1,0,0,0,76,82,5,48,0,0,77,79,5,49,0,0,78,80,3,
	10,5,0,79,78,1,0,0,0,79,80,1,0,0,0,80,82,1,0,0,0,81,76,1,0,0,0,81,77,1,
	0,0,0,82,7,1,0,0,0,83,85,5,7,0,0,84,83,1,0,0,0,84,85,1,0,0,0,85,86,1,0,
	0,0,86,87,5,8,0,0,87,90,5,48,0,0,88,89,5,9,0,0,89,91,3,18,9,0,90,88,1,0,
	0,0,90,91,1,0,0,0,91,92,1,0,0,0,92,93,5,10,0,0,93,125,3,28,14,0,94,96,5,
	11,0,0,95,97,5,7,0,0,96,95,1,0,0,0,96,97,1,0,0,0,97,98,1,0,0,0,98,99,5,
	8,0,0,99,100,5,48,0,0,100,101,5,9,0,0,101,125,3,18,9,0,102,104,3,12,6,0,
	103,102,1,0,0,0,103,104,1,0,0,0,104,105,1,0,0,0,105,106,5,12,0,0,106,108,
	5,49,0,0,107,109,3,14,7,0,108,107,1,0,0,0,108,109,1,0,0,0,109,110,1,0,0,
	0,110,112,5,4,0,0,111,113,3,16,8,0,112,111,1,0,0,0,112,113,1,0,0,0,113,
	114,1,0,0,0,114,125,5,6,0,0,115,117,5,11,0,0,116,118,5,7,0,0,117,116,1,
	0,0,0,117,118,1,0,0,0,118,119,1,0,0,0,119,120,5,12,0,0,120,122,5,49,0,0,
	121,123,3,14,7,0,122,121,1,0,0,0,122,123,1,0,0,0,123,125,1,0,0,0,124,84,
	1,0,0,0,124,94,1,0,0,0,124,103,1,0,0,0,124,115,1,0,0,0,125,9,1,0,0,0,126,
	127,5,13,0,0,127,128,5,14,0,0,128,129,5,15,0,0,129,11,1,0,0,0,130,132,5,
	7,0,0,131,133,3,10,5,0,132,131,1,0,0,0,132,133,1,0,0,0,133,13,1,0,0,0,134,
	135,5,16,0,0,135,140,5,48,0,0,136,137,5,5,0,0,137,139,5,48,0,0,138,136,
	1,0,0,0,139,142,1,0,0,0,140,138,1,0,0,0,140,141,1,0,0,0,141,143,1,0,0,0,
	142,140,1,0,0,0,143,144,5,17,0,0,144,15,1,0,0,0,145,150,3,24,12,0,146,147,
	5,5,0,0,147,149,3,24,12,0,148,146,1,0,0,0,149,152,1,0,0,0,150,148,1,0,0,
	0,150,151,1,0,0,0,151,154,1,0,0,0,152,150,1,0,0,0,153,155,5,5,0,0,154,153,
	1,0,0,0,154,155,1,0,0,0,155,17,1,0,0,0,156,157,3,20,10,0,157,19,1,0,0,0,
	158,159,3,0,0,0,159,160,5,3,0,0,160,162,1,0,0,0,161,158,1,0,0,0,161,162,
	1,0,0,0,162,163,1,0,0,0,163,175,5,49,0,0,164,165,5,16,0,0,165,170,3,20,
	10,0,166,167,5,5,0,0,167,169,3,20,10,0,168,166,1,0,0,0,169,172,1,0,0,0,
	170,168,1,0,0,0,170,171,1,0,0,0,171,173,1,0,0,0,172,170,1,0,0,0,173,174,
	5,17,0,0,174,176,1,0,0,0,175,164,1,0,0,0,175,176,1,0,0,0,176,200,1,0,0,
	0,177,178,5,18,0,0,178,180,5,13,0,0,179,181,3,22,11,0,180,179,1,0,0,0,180,
	181,1,0,0,0,181,182,1,0,0,0,182,183,5,15,0,0,183,184,5,19,0,0,184,200,3,
	20,10,0,185,200,5,48,0,0,186,187,5,13,0,0,187,188,3,20,10,0,188,189,5,5,
	0,0,189,194,3,20,10,0,190,191,5,5,0,0,191,193,3,20,10,0,192,190,1,0,0,0,
	193,196,1,0,0,0,194,192,1,0,0,0,194,195,1,0,0,0,195,197,1,0,0,0,196,194,
	1,0,0,0,197,198,5,15,0,0,198,200,1,0,0,0,199,161,1,0,0,0,199,177,1,0,0,
	0,199,185,1,0,0,0,199,186,1,0,0,0,200,21,1,0,0,0,201,206,3,20,10,0,202,
	203,5,5,0,0,203,205,3,20,10,0,204,202,1,0,0,0,205,208,1,0,0,0,206,204,1,
	0,0,0,206,207,1,0,0,0,207,210,1,0,0,0,208,206,1,0,0,0,209,211,5,5,0,0,210,
	209,1,0,0,0,210,211,1,0,0,0,211,23,1,0,0,0,212,224,5,49,0,0,213,214,5,13,
	0,0,214,219,3,20,10,0,215,216,5,5,0,0,216,218,3,20,10,0,217,215,1,0,0,0,
	218,221,1,0,0,0,219,217,1,0,0,0,219,220,1,0,0,0,220,222,1,0,0,0,221,219,
	1,0,0,0,222,223,5,15,0,0,223,225,1,0,0,0,224,213,1,0,0,0,224,225,1,0,0,
	0,225,25,1,0,0,0,226,227,3,0,0,0,227,228,5,3,0,0,228,230,1,0,0,0,229,226,
	1,0,0,0,229,230,1,0,0,0,230,231,1,0,0,0,231,232,7,0,0,0,232,27,1,0,0,0,
	233,234,6,14,-1,0,234,314,5,50,0,0,235,314,5,53,0,0,236,314,5,51,0,0,237,
	314,5,52,0,0,238,314,3,26,13,0,239,240,5,20,0,0,240,314,3,28,14,17,241,
	242,5,13,0,0,242,243,3,28,14,0,243,244,5,5,0,0,244,249,3,28,14,0,245,246,
	5,5,0,0,246,248,3,28,14,0,247,245,1,0,0,0,248,251,1,0,0,0,249,247,1,0,0,
	0,249,250,1,0,0,0,250,252,1,0,0,0,251,249,1,0,0,0,252,253,5,15,0,0,253,
	314,1,0,0,0,254,255,5,13,0,0,255,256,3,28,14,0,256,257,5,15,0,0,257,314,
	1,0,0,0,258,314,3,32,16,0,259,271,5,37,0,0,260,265,3,36,18,0,261,262,5,
	5,0,0,262,264,3,36,18,0,263,261,1,0,0,0,264,267,1,0,0,0,265,263,1,0,0,0,
	265,266,1,0,0,0,266,269,1,0,0,0,267,265,1,0,0,0,268,270,5,5,0,0,269,268,
	1,0,0,0,269,270,1,0,0,0,270,272,1,0,0,0,271,260,1,0,0,0,271,272,1,0,0,0,
	272,273,1,0,0,0,273,314,3,32,16,0,274,275,5,38,0,0,275,276,3,28,14,0,276,
	277,3,32,16,0,277,278,5,39,0,0,278,279,3,32,16,0,279,314,1,0,0,0,280,281,
	5,40,0,0,281,282,3,28,14,0,282,291,5,4,0,0,283,288,3,30,15,0,284,285,5,
	5,0,0,285,287,3,30,15,0,286,284,1,0,0,0,287,290,1,0,0,0,288,286,1,0,0,0,
	288,289,1,0,0,0,289,292,1,0,0,0,290,288,1,0,0,0,291,283,1,0,0,0,291,292,
	1,0,0,0,292,294,1,0,0,0,293,295,5,5,0,0,294,293,1,0,0,0,294,295,1,0,0,0,
	295,296,1,0,0,0,296,297,5,6,0,0,297,314,1,0,0,0,298,310,5,41,0,0,299,304,
	3,28,14,0,300,301,5,5,0,0,301,303,3,28,14,0,302,300,1,0,0,0,303,306,1,0,
	0,0,304,302,1,0,0,0,304,305,1,0,0,0,305,308,1,0,0,0,306,304,1,0,0,0,307,
	309,5,5,0,0,308,307,1,0,0,0,308,309,1,0,0,0,309,311,1,0,0,0,310,299,1,0,
	0,0,310,311,1,0,0,0,311,312,1,0,0,0,312,314,5,42,0,0,313,233,1,0,0,0,313,
	235,1,0,0,0,313,236,1,0,0,0,313,237,1,0,0,0,313,238,1,0,0,0,313,239,1,0,
	0,0,313,241,1,0,0,0,313,254,1,0,0,0,313,258,1,0,0,0,313,259,1,0,0,0,313,
	274,1,0,0,0,313,280,1,0,0,0,313,298,1,0,0,0,314,357,1,0,0,0,315,316,10,
	16,0,0,316,317,7,1,0,0,317,356,3,28,14,17,318,319,10,15,0,0,319,320,7,2,
	0,0,320,356,3,28,14,16,321,322,10,14,0,0,322,323,5,30,0,0,323,356,3,28,
	14,14,324,325,10,13,0,0,325,326,7,3,0,0,326,356,3,28,14,14,327,328,10,12,
	0,0,328,329,7,4,0,0,329,356,3,28,14,13,330,331,10,11,0,0,331,332,5,35,0,
	0,332,356,3,28,14,12,333,334,10,10,0,0,334,335,5,36,0,0,335,356,3,28,14,
	11,336,337,10,1,0,0,337,338,5,43,0,0,338,356,3,28,14,2,339,340,10,7,0,0,
	340,352,5,13,0,0,341,346,3,28,14,0,342,343,5,5,0,0,343,345,3,28,14,0,344,
	342,1,0,0,0,345,348,1,0,0,0,346,344,1,0,0,0,346,347,1,0,0,0,347,350,1,0,
	0,0,348,346,1,0,0,0,349,351,5,5,0,0,350,349,1,0,0,0,350,351,1,0,0,0,351,
	353,1,0,0,0,352,341,1,0,0,0,352,353,1,0,0,0,353,354,1,0,0,0,354,356,5,15,
	0,0,355,315,1,0,0,0,355,318,1,0,0,0,355,321,1,0,0,0,355,324,1,0,0,0,355,
	327,1,0,0,0,355,330,1,0,0,0,355,333,1,0,0,0,355,336,1,0,0,0,355,339,1,0,
	0,0,356,359,1,0,0,0,357,355,1,0,0,0,357,358,1,0,0,0,358,29,1,0,0,0,359,
	357,1,0,0,0,360,361,3,36,18,0,361,362,5,44,0,0,362,363,3,28,14,0,363,31,
	1,0,0,0,364,365,5,4,0,0,365,366,3,34,17,0,366,367,5,6,0,0,367,33,1,0,0,
	0,368,385,3,28,14,0,369,370,5,45,0,0,370,371,3,26,13,0,371,372,3,36,18,
	0,372,373,5,10,0,0,373,374,3,28,14,0,374,375,5,46,0,0,375,376,3,34,17,0,
	376,385,1,0,0,0,377,378,5,8,0,0,378,379,3,36,18,0,379,380,5,10,0,0,380,
	381,3,28,14,0,381,382,5,46,0,0,382,383,3,34,17,0,383,385,1,0,0,0,384,368,
	1,0,0,0,384,369,1,0,0,0,384,377,1,0,0,0,385,35,1,0,0,0,386,387,6,18,-1,
	0,387,425,5,48,0,0,388,389,3,0,0,0,389,390,5,3,0,0,390,392,1,0,0,0,391,
	388,1,0,0,0,391,392,1,0,0,0,392,393,1,0,0,0,393,405,5,49,0,0,394,395,5,
	13,0,0,395,400,3,36,18,0,396,397,5,5,0,0,397,399,3,36,18,0,398,396,1,0,
	0,0,399,402,1,0,0,0,400,398,1,0,0,0,400,401,1,0,0,0,401,403,1,0,0,0,402,
	400,1,0,0,0,403,404,5,15,0,0,404,406,1,0,0,0,405,394,1,0,0,0,405,406,1,
	0,0,0,406,425,1,0,0,0,407,425,5,50,0,0,408,425,5,53,0,0,409,425,5,51,0,
	0,410,425,5,52,0,0,411,412,5,13,0,0,412,413,3,36,18,0,413,414,5,5,0,0,414,
	419,3,36,18,0,415,416,5,5,0,0,416,418,3,36,18,0,417,415,1,0,0,0,418,421,
	1,0,0,0,419,417,1,0,0,0,419,420,1,0,0,0,420,422,1,0,0,0,421,419,1,0,0,0,
	422,423,5,15,0,0,423,425,1,0,0,0,424,386,1,0,0,0,424,391,1,0,0,0,424,407,
	1,0,0,0,424,408,1,0,0,0,424,409,1,0,0,0,424,410,1,0,0,0,424,411,1,0,0,0,
	425,431,1,0,0,0,426,427,10,2,0,0,427,428,5,30,0,0,428,430,3,36,18,2,429,
	426,1,0,0,0,430,433,1,0,0,0,431,429,1,0,0,0,431,432,1,0,0,0,432,37,1,0,
	0,0,433,431,1,0,0,0,54,43,49,55,69,74,79,81,84,90,96,103,108,112,117,122,
	124,132,140,150,154,161,170,175,180,194,199,206,210,219,224,229,249,265,
	269,271,288,291,294,304,308,310,313,346,350,352,355,357,384,391,400,405,
	419,424,431];

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
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
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


export class QualifiedIdContext extends ParserRuleContext {
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
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
    public get ruleIndex(): number {
    	return KestrelParser.RULE_qualifiedId;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterQualifiedId) {
	 		listener.enterQualifiedId(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitQualifiedId) {
	 		listener.exitQualifiedId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitQualifiedId) {
			return visitor.visitQualifiedId(this);
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
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
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
export class MatchContext extends ExprContext {
	public _matched!: ExprContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public matchClause_list(): MatchClauseContext[] {
		return this.getTypedRuleContexts(MatchClauseContext) as MatchClauseContext[];
	}
	public matchClause(i: number): MatchClauseContext {
		return this.getTypedRuleContext(MatchClauseContext, i) as MatchClauseContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatch) {
	 		listener.enterMatch(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatch) {
	 		listener.exitMatch(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatch) {
			return visitor.visitMatch(this);
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
	public qualifiedId(): QualifiedIdContext {
		return this.getTypedRuleContext(QualifiedIdContext, 0) as QualifiedIdContext;
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


export class MatchClauseContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_matchClause;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatchClause) {
	 		listener.enterMatchClause(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatchClause) {
	 		listener.exitMatchClause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatchClause) {
			return visitor.visitMatchClause(this);
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
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
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
	public _mapper!: QualifiedIdContext;
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public qualifiedId(): QualifiedIdContext {
		return this.getTypedRuleContext(QualifiedIdContext, 0) as QualifiedIdContext;
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
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


export class MatchPatternContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_matchPattern;
	}
	public copyFrom(ctx: MatchPatternContext): void {
		super.copyFrom(ctx);
	}
}
export class IntPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public INT(): TerminalNode {
		return this.getToken(KestrelParser.INT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterIntPattern) {
	 		listener.enterIntPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitIntPattern) {
	 		listener.exitIntPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitIntPattern) {
			return visitor.visitIntPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TuplePatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTuplePattern) {
	 		listener.enterTuplePattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTuplePattern) {
	 		listener.exitTuplePattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTuplePattern) {
			return visitor.visitTuplePattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CharPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public CHAR(): TerminalNode {
		return this.getToken(KestrelParser.CHAR, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterCharPattern) {
	 		listener.enterCharPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCharPattern) {
	 		listener.exitCharPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCharPattern) {
			return visitor.visitCharPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConsPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterConsPattern) {
	 		listener.enterConsPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitConsPattern) {
	 		listener.exitConsPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitConsPattern) {
			return visitor.visitConsPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FloatPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public FLOAT(): TerminalNode {
		return this.getToken(KestrelParser.FLOAT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFloatPattern) {
	 		listener.enterFloatPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFloatPattern) {
	 		listener.exitFloatPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFloatPattern) {
			return visitor.visitFloatPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConstructorContext extends MatchPatternContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterConstructor) {
	 		listener.enterConstructor(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitConstructor) {
	 		listener.exitConstructor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitConstructor) {
			return visitor.visitConstructor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MatchIdentContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatchIdent) {
	 		listener.enterMatchIdent(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatchIdent) {
	 		listener.exitMatchIdent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatchIdent) {
			return visitor.visitMatchIdent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public STRING(): TerminalNode {
		return this.getToken(KestrelParser.STRING, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStringPattern) {
	 		listener.enterStringPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStringPattern) {
	 		listener.exitStringPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStringPattern) {
			return visitor.visitStringPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
